import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { compose, isEmpty, noop, isArray } from 'lodash';
import { useDataSet, Button, Dropdown, Menu, Modal, Icon, Spin } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import CommonImport from 'hzero-front/lib/components/Import';
import qs from 'querystring';
import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { checkPermission } from 'services/api';
import {
  enabledFormula,
  copyFormula,
  editNewFormula,
  deleteFormula,
} from '@/services/formulaManageService';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

import { tableDS } from './listDS';
import styles from './index.less';
import {
  StatusRender,
  ActionRender,
  openChooseItemBom,
  onRelease,
  releaseOrAdjust,
  renderHistoryVersion,
} from './utils';

const { Item, SubMenu } = Menu;

const FormulaManage = (props) => {
  const { history, customizeTable } = props;
  const [loading, setLoading] = useState(false);

  const tableDs = useDataSet(() => tableDS(), []);

  useEffect(() => {
    fetchPermission();
  }, []);

  // 获取按钮权限
  const fetchPermission = () => {
    // 请求权限
    const permissionList = [
      'srm.ssrc.price.model.formula-manage.button.edit', // 编辑
      'srm.ssrc.price.model.formula-manage.button.disable', // 禁用
      'srm.ssrc.price.model.formula-manage.button.enable', // 启用
      'srm.ssrc.price.model.formula-manage.button.delete', // 删除
      'srm.ssrc.price.model.formula-manage.button.copy', // 复制
      // 'srm.ssrc.price.model.formula-manage.button.history', // 历史版本
      'srm.ssrc.price.model.formula-manage.button.release', // 发布
      'srm.ssrc.price.model.formula-manage.button.initiate-price', // 发起调价
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        tableDs.setState('permissions', res);
      }
    });
  };

  // 跳转历史版本
  const handleViewHistory = (item) => {
    history.push({
      pathname: `/spc/formula-manage/history/${item.formulaId}`,
      search: qs.stringify({
        sourceType: 'listPage',
      }),
    });
  };

  const renderHistoryVersionBtn = (record, isMore = false) => {
    const versionList = record?.get('versionList') || [];
    return !isMore ? (
      <Dropdown
        key="HistoryVersion"
        overlay={() => <Menu>{renderHistoryVersion(versionList, handleViewHistory)}</Menu>}
        trigger={['hover']}
        placement="bottomLeft"
      >
        <a>
          {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
          <Icon type="expand_more" style={{ marginTop: '-1px' }} />
        </a>
      </Dropdown>
    ) : (
      <SubMenu
        key="HistoryVersion"
        title={intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
      >
        {renderHistoryVersion(versionList, handleViewHistory)}
      </SubMenu>
    );
  };

  // 启用禁用
  const handleEnable = async (record) => {
    setLoading(true);
    const res = await enabledFormula(record.toData());
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  const handleDelete = async (record) => {
    setLoading(true);
    const res = await deleteFormula([record.toData()]);
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  // 复制
  const handleCopy = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('spc.formulaManage.model.formulaManage.copyTip')
        .d('是否复制此公式生成一条新的公式'),
      onOk: async () => {
        const res = await copyFormula(record.toData());
        if (getResponse(res)) {
          notification.success();
          history.push({
            pathname: `/spc/formula-manage/detail/${res.formulaId}`,
          });
        }
      },
    });
  };

  // 新建
  const handleCreate = () => {
    history.push({
      pathname: `/spc/formula-manage/create`,
    });
  };

  // 发布
  const handleRelease = (record) => {
    setLoading(true);
    onRelease(record, () => tableDs.query()).finally(() => {
      setLoading(false);
    });
  };

  // 编辑
  const handleEdit = async (record) => {
    let formulaId = record.get('formulaId');
    // 状态已发布、禁用，生成新版本
    if (['DISABLE', 'RELEASED'].includes(record.get('formulaStatusCode'))) {
      setLoading(true);
      const res = await editNewFormula([record.toData()]);
      setLoading(false);
      if (getResponse(res) && isArray(res) && !isEmpty(res)) {
        notification.success();
        // eslint-disable-next-line prefer-destructuring
        formulaId = res[0].formulaId;
      } else {
        return;
      }
    }
    history.push({
      pathname: `/spc/formula-manage/detail/${formulaId}`,
    });
  };

  // 发起调价
  const handleAdjustPrice = (record) => {
    const onOk = (formData) => {
      const params = { ...(record?.toData() || {}), ...formData };
      return releaseOrAdjust(params, () => tableDs.query(), 'adjust');
    };
    openChooseItemBom({ onOk, formulaId: record.get('formulaId') });
  };

  // 明细页
  const handleGotoDetail = (record, type = 'view') => {
    history.push({
      pathname: `/spc/formula-manage/${type}/${record.get('formulaId')}`,
    });
  };

  const allActionList = [
    {
      key: 'Enabled',
      code: 'srm.ssrc.price.model.formula-manage.button.enable',
      title: intl.get(`hzero.common.model.status.enable`).d('启用'),
      onClick: handleEnable,
    },
    {
      key: 'Disabled',
      code: 'srm.ssrc.price.model.formula-manage.button.disable',
      title: intl.get('hzero.common.model.status.disabled').d('禁用'),
      onClick: handleEnable,
    },
    {
      key: 'Delete',
      code: 'srm.ssrc.price.model.formula-manage.button.delete',
      title: intl.get('hzero.common.button.delete').d('删除'),
      onClick: handleDelete,
    },
    {
      key: 'Edit',
      code: 'srm.ssrc.price.model.formula-manage.button.edit',
      title: intl.get(`hzero.common.view.button.edit`).d('编辑'),
      onClick: handleEdit,
      isHidden: (record) => record.get('latestFlag') === 'Y',
    },
    {
      key: 'Copy',
      code: 'srm.ssrc.price.model.formula-manage.button.copy',
      title: intl.get('hzero.common.button.copy').d('复制'),
      onClick: handleCopy,
    },
    {
      key: 'Release',
      code: 'srm.ssrc.price.model.formula-manage.button.release',
      title: intl.get('hzero.common.button.release').d('发布'),
      isHidden: (record) => record.get('bomFlag') === 0,
      onClick: handleRelease,
    },
    {
      key: 'AdjustPrice',
      code: 'srm.ssrc.price.model.formula-manage.button.initiate-price',
      title: intl.get('spc.formulaManage.button.adjustPrice').d('发起调价'),
      // disabled: (record) => record.get('bomFlag') === 0,
      onClick: handleAdjustPrice,
    },
    {
      key: 'HistoryVersion',
      // code: 'srm.ssrc.price.model.formula-manage.button.history',
      title: intl.get('hzero.common.button.History').d('历史版本'),
    },
  ];

  const getOverlay = (items = [], record) => {
    return isEmpty(items) ? (
      false
    ) : (
      <Menu style={{ width: '140px' }}>
        {items.map((i) =>
          i.key === 'HistoryVersion' ? (
            renderHistoryVersionBtn(record, true)
          ) : (
            <Item className={styles['more-option']} key={i.key}>
              {i}
            </Item>
          )
        )}
      </Menu>
    );
  };

  const getButton = (action, record) => {
    const { key, title, onClick = noop, isHidden = () => false } = action;
    return {
      ...action,
      button: isHidden(record) ? (
        false
      ) : key !== 'HistoryVersion' ? (
        <Button
          key={key}
          type="c7n-pro"
          funcType="link"
          color="primary"
          onClick={() => onClick(record)}
        >
          {title}
        </Button>
      ) : (
        renderHistoryVersionBtn(record)
      ),
    };
  };

  const getActionList = (formulaStatusCode) => {
    const baseActionList = ['Edit', 'Copy'];
    const actionStatusMap = {
      DISABLE: ['Enabled', 'Edit'],
      PENDING: [...baseActionList, 'Release'],
      RELEASED: [...baseActionList, 'Disabled'],
      DELETE: [],
    };
    return actionStatusMap[formulaStatusCode] || baseActionList;
  };

  // 渲染操作列
  const renderAction = (record) => {
    const formulaStatusCode = record.get('formulaStatusCode');
    const actionList = getActionList(formulaStatusCode);
    // 存在历史版本
    if (!isEmpty(record.get('versionList'))) {
      actionList.push('HistoryVersion');
    }
    // 已发布并且是公式调价
    if (
      formulaStatusCode === 'RELEASED' &&
      record.get('formulaTypeCode') === 'FORMULA_ADJUSTMENT'
    ) {
      actionList.push('AdjustPrice');
    }

    if (formulaStatusCode === 'PENDING' && record.get('versionNum') === 1) {
      actionList.push('Delete');
    }

    const permissions = tableDs.getState('permissions') || [];
    const permissionButtonList = actionList
      .map((key) => {
        const action = allActionList.find((item) => item.key === key);
        if (!action) {
          return false;
        }
        const { code } = action;
        // 判断按钮是否有权限，默认没有
        if (code) {
          const { approve } = permissions.find((n) => n.code === code) || {};
          if (!approve) {
            return false;
          }
        }
        return getButton(action, record)?.button;
      })
      .filter(Boolean);

    const moreActionList = permissionButtonList.filter((_, index) => ![0, 1].includes(index));
    const overlay = getOverlay(moreActionList, record);
    const moreAction =
      moreActionList.length > 1 ? (
        <Dropdown overlay={overlay} trigger={['hover']}>
          <Button type="c7n-pro" funcType="link" color="primary" className={styles['more-action']}>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ) : (
        moreActionList[0]
      );
    return [permissionButtonList[0], permissionButtonList[1], moreAction];
  };

  const columns = useMemo(
    () => [
      {
        headerStyle: { paddingLeft: '36px' },
        style: { paddingLeft: 0 },
        name: 'formulaStatusCode',
        width: 120,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('formulaStatusCodeMeaning'));
        },
      },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => {
          return ActionRender(renderAction(record));
        },
      },
      {
        name: 'formulaCode',
        width: 180,
        renderer: ({ record, value }) => <a onClick={() => handleGotoDetail(record)}>{value}</a>,
      },
      {
        name: 'formulaName',
        width: 200,
      },
      {
        name: 'versionNum',
        width: 100,
      },
      {
        name: 'formulaTypeCode',
        width: 120,
        renderer: ({ record }) => record.get('formulaTypeCodeMeaning'),
      },
      {
        name: 'assignItemBom',
        width: 150,
        renderer: ({ record }) =>
          // 已发布才能分配
          record.get('formulaStatusCode') === 'RELEASED' ? (
            <PermissionButton
              type="text"
              permissionList={[
                {
                  code: 'srm.ssrc.price.model.formula-manage.button.allocation',
                  type: 'button',
                  meaning: intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配'),
                },
              ]}
              style={{ paddingRight: '1em' }}
              onClick={() => handleGotoDetail(record, 'assign-item-bom')}
            >
              {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
            </PermissionButton>
          ) : (
            '-'
          ),
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'createdBy',
        width: 150,
        renderer: ({ record }) => record.get('creationRealName'),
      },
    ],
    []
  );

  const getButtons = useCallback(() => {
    return [
      {
        name: 'create',
        group: true,
        child: () => (
          <PermissionButton
            color="primary"
            icon="add"
            type="c7n-pro"
            onClick={handleCreate}
            permissionList={[
              {
                code: 'srm.ssrc.price.model.formula-manage.button.new', // 新建
                type: 'button',
                meaning: intl.get('hzero.common.button.create').d('新建'),
              },
            ]}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </PermissionButton>
        ),
      },
      {
        name: 'import',
        btnComp: CommonImport,
        btnProps: {
          businessObjectTemplateCode: 'SRM_C_SSRC_PRICE_FORMULA_BOM_REL_IMPORT',
          prefixPatch: '/spc',
          buttonText: intl.get('hzero.common.button.Import').d('导入'),
          buttonProps: {
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.ssrc.price.model.formula-manage.button.rel.import',
                type: 'button',
                meaning: '批量导入',
              },
            ],
          },
          successCallBack: () => tableDs.query(),
        },
      },
    ];
  }, []);

  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDs.setQueryParameter('codeOrName', searchValue);
  };

  // 左边多选框渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="codeOrName"
        placeholder={intl
          .get('spc.formulaManage.view.message.inputMultiTemplateNumOrTitle')
          .d('请输入公式编码、名称查询')}
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('codeOrName', '');
  };

  return (
    <React.Fragment>
      <Header title={intl.get('spc.formulaManage.view.title.formulaManage').d('公式管理')}>
        <DynamicButtons buttons={getButtons()} />
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTable(
            { code: 'SPC.PRICE_FORMULA_MANAGE.LIST.ALL_TABLE' },
            <SearchBarTable
              cacheState
              dataSet={tableDs}
              columns={columns}
              style={{ maxHeight: 'calc(100vh - 190px)' }}
              searchBarConfig={{
                checkDataSetStatus: false, // 解决操作行展开收起后点击查询，出现【当前操作将会清空变更过的数据，是否继续？】弹框提示
                fieldProps: {
                  codeOrName: {
                    multiple: ',',
                  },
                },
                left: {
                  render: (_, ds) => leftInput(ds),
                },
                onReset: clearQueryParameter,
                onClear: clearQueryParameter,
              }}
              searchCode="SPC.PRICE_FORMULA_MANAGE.LIST.FILTER"
              mode="tree"
            />
          )}
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: ['SPC.PRICE_FORMULA_MANAGE.LIST.FILTER', 'SPC.PRICE_FORMULA_MANAGE.LIST.ALL_TABLE'],
  }),
  formatterCollections({
    code: [
      'entity.roles',
      'hzero.c7nProUI',
      'hzero.common',
      'ssrc.inquiryHall',
      'spc.formulaManage',
    ],
  })
)(FormulaManage);
