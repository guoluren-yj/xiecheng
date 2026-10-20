/*
 * Bom - 工作台Bom弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useMemo, useEffect, useCallback } from 'react';
import { DataSet, Table, Output, Form, Button, Tooltip } from 'choerodon-ui/pro';
import { isArrayLike, isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import CategoryLov from '@/routes/components/CategoryLov';
import { getCurrentOrganizationId } from 'utils/utils';

import { bom, computedUnitQuantity } from './store/bomDs';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();

const Bom = (props) => {
  const {
    record,
    remote,
    readOnly, // 维护及变更页面为undefined 其余只读页面为true
    customizeTable,
    code,
    compatible: { queryPara, createDefault } = {},
    bomChangeFieldsList, // 变更页面才会传
    sourcePage, // 来源页面 'approval':审批明细
  } = props;
  const { poItemBomList, poHeaderId, poLineId, poLineLocationId, quantity, prLineId } = record.get([
    'poItemBomList',
    'poHeaderId',
    'poLineId',
    'poLineLocationId',
    'quantity',
    'prLineId',
  ]);
  // bomChangeFieldsList目前只存在变更页面
  const isChange = useMemo(() => isArrayLike(bomChangeFieldsList), []);
  // 字段是否配置可修改
  const isEditorFields = useCallback(
    (bomRecord, fieldName) => {
      const realName = fieldName === 'itemId' ? 'itemCode' : fieldName;
      return isChange
        ? bomRecord.status === 'add'
          ? true
          : bomChangeFieldsList.includes(realName)
        : true;
    },
    [bomChangeFieldsList]
  );

  const formatFileds = useCallback((fields) => {
    const momentFields = {};
    for (const key in fields) {
      if (moment.isMoment(fields[key])) {
        momentFields[key] = fields[key].format(DEFAULT_DATE_FORMAT);
      }
    }
    return { ...fields, ...momentFields };
  }, []);

  const bomDs = useMemo(() => {
    return new DataSet({
      ...bom({ isChange, code, quantity, remote, readOnly }),
      record: {
        dynamicProps: {
          selectable: (line) => (isChange ? line.status === 'add' : true),
        },
      },
      selection: readOnly ? false : 'multiple',
      queryParameter: readOnly
        ? { poHeaderId, poLineId, prLineId }
        : Object.assign(
            {
              //   itemId: record.get('itemId')?.itemId,
              splQuantity: quantity,
              poHeaderId,
              poLineId,
              prLineId,
              poLineLocationId,
              customizeUnitCode: isChange ? undefined : code, // isChange时查询为POST传参，code需要放url上
            },
            formatFileds(queryPara)
          ),
    });
  }, [isEditorFields, isChange, quantity, remote, readOnly]);

  const renderChangeTip = (data) => {
    const { record: bomRecord, name, text } = data;
    const changeMap = bomRecord.get('changeMap') || {};
    const aliasFields = {
      categoryId: 'categoryName',
      uomId: 'uomName',
      invOrganizationId: 'organizationName',
    };
    if (name in changeMap) {
      const tipValue = changeMap[aliasFields[name] || name] || '【】';
      const tipContent = `${intl
        .get('sodr.common.model.common.beforeUpdate')
        .d('变更前')} : ${tipValue}`;
      return (
        <Tooltip title={tipContent} popupClassName={styles['change-tip-tooltip']} theme="light">
          {<span style={{ color: 'red' }}>{text}</span>}
        </Tooltip>
      );
    }
    return text;
  };

  const renderer = useMemo(
    () => (sourcePage === 'approval' ? (data) => renderChangeTip(data) : undefined),
    [sourcePage]
  );

  useEffect(() => {
    // 是否经历过前端缓存数据的保存，如存在直接加载该数据，无需再次查询
    const isCacheSave = isArray(toJS(poItemBomList));
    if (remote ? remote.process('useCacheBomData', isCacheSave, { record }) : isCacheSave) {
      bomDs.loadData(poItemBomList);
    } else {
      bomDs.query();
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'orderSeq',
      },
      {
        name: 'itemId',
        editor: isEditorFields,
        renderer,
      },
      {
        name: 'itemName',
        editor: isEditorFields,
        renderer,
      },
      {
        name: 'categoryId',
        editor: (_, fieldName) => {
          return (
            isEditorFields(_, fieldName) && (
              <CategoryLov data={{ record: _, ds: bomDs, destroyAll: false }} />
            )
          );
        },
        renderer,
      },
      {
        name: 'quantity',
        editor: isEditorFields,
        renderer,
      },
      {
        name: 'uomId',
        editor: isEditorFields,
        renderer,
      },
      {
        name: 'invOrganizationId',
        editor: isEditorFields,
        renderer,
      },
      {
        name: 'needByDate',
        editor: isEditorFields,
        renderer,
      },
      isChange &&
        record.status !== 'add' && {
          name: 'cancelledFlag',
          editor: (bomRecord, name) =>
            isEditorFields(bomRecord, name) && bomRecord.status !== 'add',
          help: intl
            .get('sodr.workspace.view.help.bomCancelledFlag')
            .d('仅可取消非新增的bom行信息'),
        },
    ],
    []
  );

  const handleCreate = () => {
    const createInfo = Object.assign(
      {
        tenantId,
        needByDate: record.get('needByDate'),
        invOrganizationId: record.get('invOrganizationId'),
        invOrganizationName: record.get('invOrganizationName'),
        poHeaderId: record.get('poHeaderId'),
        poLineId: record.get('poLineId'),
        poLineLocationId: record.get('poLineLocationId'),
        historicalLineQuantity: quantity,
      },
      formatFileds(createDefault)
    );
    bomDs.create(createInfo);
  };

  const handleDelete = async () => {
    const { selected } = bomDs;
    const res = await bomDs.delete(selected);
    return res;
  };

  const handleSave = async () => {
    if (remote && !(await remote.process('beforBomSave', true, { record, bomDs }))) return;
    if (isEmpty(bomDs)) {
      return notification.error({
        description: intl
          .get('sodr.workspace.view.message.bomSaveMessage')
          .d('保存失败,失败原因是无有效的bom行信息,请至少维护一行有效的bom行信息'),
      });
    }
    const validateRes = await bomDs.validate();
    if (validateRes) {
      if (isChange) {
        bomDs.forEach((i) => {
          const { bomQuantityUpdateFlag, unitQuantity } = i.get([
            'bomQuantityUpdateFlag',
            'unitQuantity',
          ]);
          const newUnitQuantityUpdateFlag = pristineUnitQuantityUpdateFlag || bomQuantityUpdateFlag;
          const pristineUnitQuantityUpdateFlag = record.getPristineValue('unitQuantityUpdateFlag');
          i.init({ historicalLineQuantity: quantity });
          if (bomQuantityUpdateFlag) {
            const newUnitQuantity = newUnitQuantityUpdateFlag
              ? computedUnitQuantity(i)
              : unitQuantity;
            i.init({
              bomQuantityUpdateFlag: 0,
              unitQuantity: newUnitQuantity,
              unitQuantityUpdateFlag: newUnitQuantityUpdateFlag,
            });
          }
        });
        record.set({
          poItemBomList: bomDs.toJSONData(),
        });
        notification.success();
      } else {
        const res = await bomDs.forceSubmit();
        if (res && res.success) {
          bomDs.query();
        }
      }
      if (remote) {
        remote.process('afterBomSave', { record, bomDs });
      }
    }
  };

  const renderChildren = () => {
    const addButton = (
      <Button icon="playlist_add" funcType="flat" onClick={handleCreate}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>
    );
    const DeleteButton = observer(() => {
      const { selected = [] } = bomDs;
      return (
        <Tooltip
          title={
            isChange
              ? intl
                  .get('sodr.workspace.view.message.onlyDeleteBomNewLine')
                  .d('只允许删除新增的bom行')
              : undefined
          }
          placement="top"
        >
          <Button
            icon="delete_sweep"
            funcType="flat"
            onClick={handleDelete}
            disabled={isEmpty(selected) || (isChange && selected.find((i) => i.status !== 'add'))}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>
        </Tooltip>
      );
    });
    const saveButton = (
      <Button icon="save" funcType="flat" onClick={handleSave}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>
    );
    const { itemCode, itemName } = record.get(['itemCode', 'itemName']);
    return (
      <Fragment>
        <Form
          columns={2}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          style={{ marginBottom: '16px' }}
        >
          <Output
            label={intl.get('sodr.workspace.model.common.itemCode').d('物料编码')}
            value={itemCode?.itemCode || itemCode}
          />
          <Output
            label={intl.get('sodr.workspace.model.common.itemName').d('物料名称')}
            value={itemName}
          />
        </Form>
        {customizeTable(
          { code, __force_record_to_update__: true },
          <Table
            dataSet={bomDs}
            columns={columns}
            editMode={readOnly ? 'inline' : 'cell'}
            buttons={
              readOnly
                ? []
                : remote
                ? remote.process(
                    code || 'SODR_DETAIL_PROCESS_BOM',
                    [addButton, saveButton, <DeleteButton />],
                    { props, addButton, saveButton, DeleteButton }
                  )
                : [addButton, saveButton, <DeleteButton />]
            }
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            virtual
            virtualCell
          />
        )}
      </Fragment>
    );
  };

  // const handleModal = useCallback(async () => {
  //   const children = renderChildren();
  //   if (readOnly) {
  //     Modal.open({
  //       footer: null,
  //       closable: true,
  //       style: { width: 1000 },
  //       title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
  //       children,
  //     });
  //     bomDs.query();
  //   } else {
  //     if (record.status === 'add') {
  //       Modal.info({
  //         children: intl
  //           .get('sodr.workspace.view.info.noSaveBomLine')
  //           .d('该订单行未保存，bom信息不能维护，请先保存！'),
  //       });
  //       return;
  //     }
  //     Modal.open({
  //       footer: null,
  //       closable: true,
  //       style: { width: 1000 },
  //       title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
  //       children,
  //     });
  // if (record.get('saveBomItemId') !== record.get('itemId')) {
  //   const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
  //   if (res) {
  //     record.set({ saveBomItemId: record.get('itemId') });
  //   }
  // } else {
  //   bomDs.query();
  // }
  //   }
  // }, []);
  // return readOnly ? (
  //   <a disabled={!!disabled} onClick={handleModal}>
  //     {intl.get('hzero.common.button.look').d('查看')}
  //   </a>
  // ) : (
  //   <a disabled={!!disabled} onClick={handleModal}>
  //     {intl.get('hzero.common.button.maintain').d('维护')}
  //   </a>
  // );
  return renderChildren();
};

export default Bom;
