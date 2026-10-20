import React, { memo, useMemo, useState, useEffect } from 'react';
import { Table, Button, Dropdown, Menu, Icon, Modal } from 'choerodon-ui/pro';
import { isNumber } from 'lodash';
import { observer } from 'mobx-react-lite';
import uuidv4 from 'uuid/v4';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import c7nModal from '@/utils/c7nModal';
import { Tooltip, Tag } from 'choerodon-ui';
import { DropdownMenuBtns, DropdownBtn } from '@/components/CommonButtons';
import StrategyList, { handleEditStrategy } from './StrategyList';
import Detail from '../../PriceStrategy/Detail';
import { viewStrategyRecord } from '../Drawers/record';
import {
  strategyAdjustColumn,
  strategyDimensionColumn,
  strategyDetailRenderer,
  overlinePriceRenderer,
} from '../renderers';
import {
  fetchMaxPriority,
  executeStrategy,
  restoreStrategy,
  saveSalePriceStrategy,
  deleteSalePriceStrategy,
} from '../api';
import { unLock } from '../../PriceStrategy/api';

// 记录不是新建或已还原
const recordIsEx = (record) =>
  !['NEW', 'RESTORED', 'EXEFAIL'].includes(record.get('statusCode') || 'NEW');

const MultiButton = observer(({ children, dataSet, disabled, ...props }) => {
  return (
    <Tooltip
      title={
        dataSet.selected < 1
          ? intl.get('hzero.common.message.selectAtLeastOne').d('请至少选择一条数据')
          : ''
      }
    >
      <Button dataSet={dataSet} disabled={disabled || dataSet.selected < 1} {...props}>
        {children}
      </Button>
    </Tooltip>
  );
});

const valueMap = {
  EXECUTED: 'green',
  EXECUTING: 'yellow',
  NEW: 'yellow',
  RESTORING: 'yellow',
  EXEFAIL: 'red',
  RESFAIL: 'red',
};

const permissionList = [
  {
    code: `sagm.sale-agreement-workbench.detail.button.sku-import-new`,
    type: 'button',
    meaning: '销售协议工作台-价格策略-（新）商品导入',
  },
  {
    code: `sagm.sale-agreement-workbench.detail.button.sku-export-new`,
    type: 'button',
    meaning: '销售协议工作台-价格策略-（新）商品导出',
  },
];

function StrategyLine(props) {
  const {
    dataSet,
    readOnly,
    isDelete,
    agreementHeaderId,
    refresh,
    viewSkuBackPath,
    isPub,
    viewCanEdit,
  } = props;
  const [maxPriority, setMaxPriority] = useState(0);

  useEffect(() => {
    if (agreementHeaderId) {
      dataSet.paging = true;
      // dataSet.selection = readOnly ? false : 'multiple';
      dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
      dataSet.query();
      getMaxPriority();
    }
    if (isDelete) {
      dataSet.selection = false;
    }
  }, [agreementHeaderId, refresh, isDelete, readOnly]);

  async function getMaxPriority() {
    const _maxPriority = getResponse(await fetchMaxPriority({ agreementHeaderId }));
    if (isNumber(_maxPriority)) setMaxPriority(_maxPriority);
  }

  function handleDragEnd(ds) {
    const priorities = ds.getState('priorities');
    ds.forEach((record, index) => {
      record.set('priority', priorities[index]);
    });
  }

  function handleDragEndBefore(ds, _, res) {
    const { source, destination } = res;
    if (!destination) return false;
    if (source.index === destination.index) return false;
    const start = source.index > destination.index ? destination.index : source.index;
    const end = source.index > destination.index ? source.index : destination.index;
    const startRecord = dataSet.get(start);
    const endRecord = dataSet.get(end);
    const changeRecords = dataSet.filter((f, ind) => ind > start && ind < end);
    const recordsIsEx = changeRecords.some((s) => recordIsEx(s));
    if (recordIsEx(startRecord) && recordIsEx(endRecord)) return false;
    if (!(recordIsEx(startRecord) && recordIsEx(endRecord))) return res;
    if ((recordIsEx(startRecord) || recordIsEx(endRecord)) && recordsIsEx) {
      return res;
    }
    return false;
  }

  async function handleDelete() {
    await dataSet.delete(dataSet.selected);
  }

  async function updateStrategy(params, type = 'execute') {
    const serviceMap = {
      execute: {
        api: executeStrategy,
        queryPage: dataSet.currentPage,
        confirm: true,
        confirmContent: intl
          .get('sagm.common.view.executeLongTip')
          .d(
            '策略的执行可能占用大量系统资源并持续数小时，请务必在夜间或休息日执行。若执行报错请联系管理员处理。是否继续？'
          ),
        description: intl
          .get('sagm.common.view.publishHelp')
          .d('当数据量较大时执行可能耗时数个小时，请耐心等待'),
      },
      restore: {
        api: restoreStrategy,
        queryPage: dataSet.currentPage,
        confirm: true,
        confirmContent: intl
          .get('sagm.common.view.restoreLongTip')
          .d(
            '策略的撤销可能占用大量系统资源并持续数小时，请务必在夜间或休息日执行。若执行报错请联系管理员处理。是否继续？'
          ),
        description: intl
          .get('sagm.common.view.restoreHelp')
          .d('当数据量较大时撤销可能耗时数个小时，请耐心等待'),
      },
      delete: {
        api: deleteSalePriceStrategy,
        queryPage: 1,
      },
    };
    const target = serviceMap[type];
    const submit = async () => {
      dataSet.status = 'submitting';
      const result = getResponse(await target.api(params));
      dataSet.status = 'ready';
      if (result) {
        notification.success({
          description: target.description,
        });
        dataSet.query(target.queryPage);
      }
    };
    if (target.confirm) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: target.confirmContent,
        onOk: submit,
      });
    } else {
      submit();
    }
  }

  async function handleUnlock(record) {
    const { statusCode, priceStrategyId, priceStrategyLineId } = record.get([
      'statusCode',
      'priceStrategyId',
      'priceStrategyLineId',
    ]);
    dataSet.status = 'loading';
    const res = getResponse(await unLock({ priceStrategyId }));
    dataSet.status = 'ready';
    if (res && res.priceStrategyId) {
      const changeUuid = ['RESFAIL', 'EXECUTED'].includes(statusCode) ? uuidv4() : null;
      c7nModal({
        style: { width: 742 },
        title: intl.get('sagm.common.view.title.updateStrategy').d('修改策略'),
        children: (
          <Detail
            changeUuid={changeUuid}
            type={res.priceStrategyId}
            changeData={{ executeFlag: 1, changeUuid, priceStrategyLineId }}
            viewSkuBackPath={viewSkuBackPath}
            onFetchList={() => dataSet.query(dataSet.currentPage)}
            // 注意顺序
            permissionList={[
              {
                code: `sagm.sale-agreement-workbench.detail.button.sku-import-new`,
                type: 'button',
                meaning: '销售协议工作台-价格策略-（新）商品导入',
              },
              {
                code: `sagm.sale-agreement-workbench.detail.button.sku-export-new`,
                type: 'button',
                meaning: '销售协议工作台-价格策略-（新）商品导出',
              },
            ]}
          />
        ),
      });
    }
  }

  function rendererOptions({ record }) {
    const { statusCode = 'NEW', statusCodeMeaning } = record.get([
      'statusCode',
      'priceStrategyId',
      'statusCodeMeaning',
      'priceStrategyLineId',
    ]);
    // 优先级发生改变过，不可执行或者还原
    // ['NEW', 'EXECUTING', 'EXECUTED', 'RESTORED']
    const statusText = ['NEW', 'RESTORED', 'EXEFAIL'].includes(statusCode)
      ? intl.get('hzero.common.button.trigger').d('执行')
      : ['EXECUTING', 'RESTORING'].includes(statusCode)
      ? statusCodeMeaning
      : intl.get('hzero.common.button.revoke').d('撤销');

    const priorityChange = record.getField('priority').dirty;

    const options = [
      {
        key: 'execute',
        name: statusText,
        show: !isDelete,
        event: () =>
          updateStrategy(
            [record.toData()],
            ['NEW', 'RESTORED', 'EXEFAIL'].includes(statusCode)
              ? 'execute'
              : ['RESFAIL', 'EXECUTED'].includes(statusCode)
              ? 'restore'
              : ''
          ),
        disabled:
          ['EXECUTING', 'RESTORING'].includes(statusCode) ||
          record.status === 'add' ||
          priorityChange ||
          (readOnly && !viewCanEdit),
      },
      {
        key: 'edit',
        name: intl.get('hzero.common.button.edit').d('编辑'),
        show: !isDelete,
        disabled:
          record.status === 'add' ||
          !['NEW', 'RESTORED', 'EXECUTED', 'EXEFAIL'].includes(statusCode) ||
          (readOnly && !viewCanEdit),
        event: () => handleUnlock(record),
      },
      {
        key: 'record',
        name: intl.get('sagm.common.model.operating').d('操作记录'),
        event: () => viewStrategyRecord(record),
        show: record.status !== 'add',
      },
    ];

    const actions = options.filter((f) => f.show || !('show' in f));

    const showActions = actions.length > 3 ? actions.slice(0, 2) : actions;
    const menus = actions.slice(2);

    const menu = (
      <Menu>
        {menus.map((m) => (
          <Menu.Item key={m.key} onClick={m.event} disabled={m.disabled}>
            {m.name}
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <span className="action-link">
        {showActions.map((m) => (
          <a disabled={m.disabled} key={m.key} onClick={m.event}>
            {m.name}
          </a>
        ))}
        {actions.length > 3 && (
          <Dropdown overlay={menu}>
            <a>
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />
            </a>
          </Dropdown>
        )}
      </span>
    );
  }

  function openStrategyList() {
    Modal.open({
      drawer: true,
      closable: true,
      style: { width: 1090 },
      title: intl.get('sagm.common.view.title.addStrategy').d('引用策略'),
      children: (
        <StrategyList
          onOk={handleAddStrategys}
          listDs={dataSet}
          viewSkuBackPath={viewSkuBackPath}
          strategyCodes={dataSet.map((m) => m.get('strategyCode'))}
          agreementHeaderId={agreementHeaderId}
          permissionList={permissionList}
        />
      ),
    });
  }

  async function handleAddStrategys(data = []) {
    const isNew = dataSet.some((f) => f.status === 'add');
    // 如果存在新增的就取当前页最大优先级
    const prioritys = dataSet.records.map((m) => m.get('priority'));
    const priority = isNew ? Math.max(...prioritys) : isNumber(maxPriority) ? maxPriority : 0;
    const filterItem = data
      .filter((m) => !dataSet.some((s) => s.get('strategyCode') === m.strategyCode))
      .map((m, index) => {
        const addRecord = {
          ...m,
          agreementHeaderId,
          priority: priority + index + 1,
        };
        if (!agreementHeaderId) {
          dataSet.create(addRecord);
        }
        return addRecord;
      });
    if (filterItem.length !== data.length) {
      notification.warning({
        message: intl.get('sagm.saleAgreement.model.repeatStrategy').d('重复价格策略无法添加'),
      });
    }
    if (filterItem.length < 1) return false;
    if (agreementHeaderId) {
      const savePriceStragies = dataSet.toJSONData().concat(filterItem);
      const res = getResponse(await saveSalePriceStrategy(savePriceStragies));
      if (res) {
        const { priority: p } = filterItem[filterItem.length - 1] || {};
        setMaxPriority(p);
        dataSet.query();
        notification.success();
        return true;
      }
      return false;
    }
  }

  const columns = useMemo(
    () => [
      {
        name: 'statusCode',
        width: 150,
        renderer: ({ value, record }) => {
          const type = valueMap[value] || 'gray';
          return (
            <Tag
              color={type}
              style={{ border: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <span>{record.get('statusCodeMeaning')}</span>
              {record.get('optRemarkMeaning') && ['EXEFAIL', 'RESFAIL'].includes(value) && (
                <Tooltip title={record.get('optRemarkMeaning')}>
                  <Icon
                    type="error"
                    style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 400 }}
                  />
                </Tooltip>
              )}
            </Tag>
          );
        },
      },
      {
        name: 'strategyCode',
        width: 150,
      },
      {
        name: 'strategyName',
        width: 200,
      },
      {
        name: 'priority',
        width: 80,
      },
      strategyAdjustColumn({ width: 220 }),
      { name: 'overlinePriceEnableMeaning', width: 120, renderer: overlinePriceRenderer },
      { name: 'lastUpdateDate', width: 120 },
      strategyDimensionColumn(),
      { name: 'remark', minWidth: 100, renderer: strategyDetailRenderer },
      {
        name: 'action',
        header: intl.get('hzero.common.action').d('操作'),
        width: !isDelete && !readOnly ? 200 : 100,
        lock: 'right',
        renderer: rendererOptions,
      },
    ],
    [readOnly, isDelete, viewCanEdit]
  );

  const buttons = useMemo(
    () =>
      [
        {
          // show: !readOnly,
          btn: (
            <DropdownMenuBtns
              width={120}
              menus={
                readOnly && !viewCanEdit
                  ? []
                  : [
                      {
                        text: intl.get('sagm.common.button.manualCreate').d('手工新增'),
                        onClick: () =>
                          handleEditStrategy('create', {
                            handleSuccess: (result) =>
                              handleAddStrategys([{ priceStrategy: result, ...result }]),
                            viewSkuBackPath,
                            permissionList,
                            onFetchList: () => dataSet.query(dataSet.currentPage),
                          }),
                        funcType: 'link',
                      },
                      {
                        text: intl.get('sagm.common.view.title.addStrategy').d('引用策略'),
                        onClick: () => openStrategyList(),
                        funcType: 'link',
                      },
                    ]
              }
            >
              <DropdownBtn
                text={intl.get('hzero.common.button.add').d('新增')}
                icon="playlist_add"
                funcType="flat"
                disabled={readOnly && !viewCanEdit}
              />
            </DropdownMenuBtns>
          ),
        },
        {
          btn: (
            <MultiButton
              icon="auto_complete"
              dataSet={dataSet}
              disabled={readOnly && !viewCanEdit}
              onClick={() => updateStrategy(dataSet.selected.map((m) => m.toData()))}
            >
              {intl.get('hzero.common.button.trigger').d('执行')}
            </MultiButton>
          ),
        },
        {
          btn: (
            <MultiButton
              icon="delete_sweep"
              dataSet={dataSet}
              disabled={readOnly && !viewCanEdit}
              onClick={() => handleDelete()}
            >
              {intl.get('sagm.common.button.batchDelete').d('批量删除')}
            </MultiButton>
          ),
        },
        {
          btn: (
            <Button
              icon="refresh"
              disabled={!agreementHeaderId}
              onClick={async () => {
                await dataSet.query(dataSet.currentPage);
              }}
            >
              {intl.get('hzero.common.button.refresh').d('刷新')}
            </Button>
          ),
        },
      ]
        .filter((f) => f.show || !('show' in f))
        .map((m) => m.btn),
    [maxPriority, readOnly, viewCanEdit]
  );

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={isDelete || isPub ? [] : buttons}
      style={{ maxHeight: 450 }}
      customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.STRATEGY_LINE"
      rowDraggable={!readOnly}
      onDragEnd={handleDragEnd}
      onDragEndBefore={handleDragEndBefore}
    />
  );
}

export default memo(StrategyLine);
