import React, { useMemo, useState, useEffect } from 'react';
import { compose, isEmpty, noop } from 'lodash';
import {
  useDataSet,
  Button,
  Dropdown,
  Menu,
  Icon,
  Spin,
  Modal,
  DataSet,
  Form,
  Lov,
} from 'choerodon-ui/pro';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPC } from '_utils/config';

import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { checkPermission } from 'services/api';

import { release, editNew, enabled, deleteRecord } from '@/services/bomViewWorkbenchService';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

import { StatusRender, ActionRender, disabledRelease } from '@/routes/spc/FormulaManage/utils';
import { renderHistoryVersion } from './utils';
import { tableDS } from './listDS';
import styles from './index.less';

const { Item } = Menu;

const BomViewWorkbench = (props) => {
  const { history, customizeTable } = props;
  const tableDs = useDataSet(() => tableDS(), []);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermission();
  }, []);

  // 获取按钮权限
  const fetchPermission = () => {
    // 请求权限
    const permissionList = [
      'srm.pc-admin.pc-purchaser.workspace2.ps.submit.button', // 提交
      'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button', // 删除
      'srm.pc-admin.pc-purchaser.workspace2.ps.contract-copy', // 复制
      'srm.pc-admin.pc-purchaser.workspace2.button.seal', // 用章
      'srm.pc-admin.pc-purchaser.workspace2.ps.back.button', // 退回
      'srm.pc-admin.pc-purchaser.chapter.button.back.supplier.button', // 退回至供应商
      'srm.pc-admin.pc-purchaser.workspace2.ps.ps.change', // 变更
      'srm.pc-admin.pc-purchaser.workspace2.ps.stop.button', // 终止
      'srm.pc-admin.pc-purchaser.workspace2.ps.archive.contract', // 归档
      'srm.pc-admin.pc-purchaser.workspace2.ps.invalid.button', // 作废
      'srm.pc-admin.pc-purchaser.workspace2.ps.reference.button', // 引用单据创建
      'srm.pc-admin.pc-purchaser.workspace2.ps.create.button', // 手工创建
      'srm.pc-admin.pc-purchaser.workspace2.ps.pcheader.import', // 批量导入
      'srm.pc-admin.pc-purchaser.workspace2.button.pcheader.import.new', // 新批量导入
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        setPermissions(res);
      }
    });
  };

  // 跳转历史版本
  const handleViewHistory = (item) => {
    history.push({
      pathname: `/spc/bom-view-workbench/history/${item.bomViewId}`,
      search: qs.stringify({
        sourceType: 'listPage',
      }),
    });
  };

  // 新建
  const handleCreate = () => {
    history.push({
      pathname: `/spc/bom-view-workbench/create`,
    });
  };

  // 发布
  const handleRelease = async (record) => {
    const releaseFunc = async (showLoading) => {
      if (showLoading) setLoading(showLoading);
      const res = await release([record.toData()]);
      setLoading(false);
      if (getResponse(res)) {
        notification.success();
        tableDs.query();
      }
    };
    if (record.get('parentStatus') === 'DISABLE') {
      // 有弹窗，不需要Loading,
      disabledRelease(() => releaseFunc(false));
      return;
    }
    await releaseFunc(true);
  };

  /**
   * 批量发布
   */
  const handleBatchRelease = async () => {
    const selectedRows = tableDs.selected.map((record) => record?.toJSONData());
    const res = await release(selectedRows);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  // 编辑
  const handleEdit = async (record) => {
    let bomViewId = record.get('bomViewId');
    // 状态已发布、禁用，生成新版本
    if (['DISABLE', 'RELEASED'].includes(record.get('bomViewStatus'))) {
      setLoading(true);
      const res = await editNew(record.toData());
      setLoading(false);
      if (!getResponse(res)) return;
      notification.success();
      // eslint-disable-next-line prefer-destructuring
      bomViewId = res?.bomViewId;
    }
    history.push({
      pathname: `/spc/bom-view-workbench/detail/${bomViewId}`,
    });
  };

  // 明细页
  const handleGotoDetail = (record, type = 'view') => {
    history.push({
      pathname: `/spc/bom-view-workbench/${type}/${record.get('bomViewId')}`,
    });
  };

  // 启用禁用
  const handleEnable = async (record) => {
    setLoading(true);
    const res = await enabled(record.toData());
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  const handleDelete = async (record) => {
    setLoading(true);
    const res = await deleteRecord([record.toData()]);
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  const allActionList = [
    {
      key: 'Enabled',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get(`hzero.common.model.status.enable`).d('启用'),
      onClick: handleEnable,
    },
    {
      key: 'Disabled',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.model.status.disabled').d('禁用'),
      onClick: handleEnable,
    },
    {
      key: 'Delete',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.button.delete').d('删除'),
      onClick: handleDelete,
    },
    {
      key: 'Edit',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get(`hzero.common.view.button.edit`).d('编辑'),
      isHidden: (record) => record.get('bomViewLatestFlag') === 'Y',
      onClick: handleEdit,
    },
    {
      key: 'Release',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.button.release').d('发布'),
      onClick: handleRelease,
      isHidden: (record) => record.get('bomFlag') === 0,
    },
    {
      key: 'HistoryVersion',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.button.History').d('历史版本'),
    },
  ];

  const getOverlay = (items = []) => {
    return isEmpty(items) ? (
      false
    ) : (
      <Menu>
        {items.map((i) => (
          <Item className={styles['more-option']} key={i.key}>
            {i}
          </Item>
        ))}
      </Menu>
    );
  };

  const getButton = (key, record) => {
    const action = allActionList.find((item) => item.key === key);
    if (!action) {
      return {};
    }
    const { title, onClick = noop, isHidden = () => false } = action;
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
          // disabled={disabled(record)}
          onClick={() => onClick(record)}
        >
          {title}
        </Button>
      ) : (
        <Dropdown
          overlay={() => renderHistoryVersion(record.get('versionList'), handleViewHistory)}
          trigger={['hover']}
          placement="bottomLeft"
        >
          <Button funcType="link">
            {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
            <Icon type="expand_more" style={{ marginTop: '-1px' }} />
          </Button>
        </Dropdown>
      ),
    };
  };

  const getActionList = (bomViewStatus) => {
    const baseActionList = ['Edit'];
    const actionStatusMap = {
      DISABLE: ['Enabled', 'Edit'],
      PENDING: [...baseActionList, 'Release'],
      RELEASED: [...baseActionList, 'Disabled'],
      DELETE: [],
    };
    return actionStatusMap[bomViewStatus] || baseActionList;
  };

  // 渲染操作列
  const renderAction = (record) => {
    const bomViewStatus = record.get('bomViewStatus');
    const actionList = getActionList(bomViewStatus);
    // 存在历史版本
    if (!isEmpty(record.get('versionList'))) {
      actionList.push('HistoryVersion');
    }

    if (bomViewStatus === 'PENDING' && record.get('bomViewVersion') === 1) {
      actionList.push('Delete');
    }

    const permissionButtonList = actionList
      .filter((i) => {
        const currenPer = permissions.find((n) => n.code === i.code);
        return currenPer?.approve || true;
      })
      .map((action) => getButton(action, record)?.button)
      .filter((btn) => btn);

    const moreActionList = permissionButtonList.filter((_, index) => ![0, 1].includes(index));
    const overlay = getOverlay(moreActionList);
    const moreAction =
      moreActionList.length > 1 ? (
        <Dropdown overlay={overlay} trigger={['hover']}>
          <Button type="c7n-pro" funcType="link" color="primary" className={styles['more-action']}>
            {intl.get('spc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
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
      // {
      //   name: 'enabled',
      //   width: 120,
      //   renderer: renderEnabled,
      // },
      {
        headerStyle: { paddingLeft: '36px' },
        style: { paddingLeft: 0 },
        name: 'bomViewStatus',
        width: 120,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('bomViewStatusMeaning'));
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
        name: 'bomViewCode',
        width: 180,
        renderer: ({ record, value }) => <a onClick={() => handleGotoDetail(record)}>{value}</a>,
      },
      {
        name: 'bomViewName',
        width: 200,
      },
      {
        name: 'bomViewVersion',
        width: 100,
      },
      {
        name: 'createdBy',
        width: 200,
        renderer: ({ record }) => record.get('createdByMeaning'),
      },
      {
        name: 'bomViewType',
        width: 120,
        renderer: ({ record }) => record.get('bomViewTypeMeaning'),
      },
      {
        name: 'bomViewItemId',
        width: 120,
        renderer: ({ record }) => record.get('bomViewItemName'),
      },
      {
        name: 'bomTemplateId',
        width: 120,
        renderer: ({ record }) => record.get('bomTemplateName'),
      },
      {
        name: 'bomViewSupplierId',
        width: 120,
        renderer: ({ record }) => record.get('bomViewSupplierName'),
      },
      // {
      //   name: 'creationDate',
      //   width: 150,
      // },
      // {
      //   name: 'creationName',
      //   width: 150,
      // },
    ],
    []
  );

  /**
   * 获取数据导出查询参数
   */
  const getExportParams = () => {
    const { selected, queryDataSet } = tableDs;
    const dsParams = queryDataSet ? queryDataSet.toData()[0] : {};
    const queryParameter = tableDs.queryParameter || {};
    const bomViewExportIds = selected.map((i) => i.get('bomViewId'));
    const queryParams = selected.length
      ? { bomViewExportIds }
      : { ...dsParams, codeOrName: dsParams?.codeOrName?.split(','), customizeOrderField: null };
    return {
      ...queryParameter,
      ...queryParams,
    };
  };

  /**
   * 导入
   */
  const handleImport = () => {
    const formDS = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'bomTemplateCode',
          label: intl.get('spc.bomViewWorkbench.model.bomTemplateId').d('BOM结构'),
          type: 'object',
          required: true,
          lovCode: 'SPC.PRICE_BOM_LOV',
        },
      ],
    });
    Modal.open({
      title: intl.get('spc.bomViewWorkbench.view.title.chooseBomTemplate').d('选择BOM结构'),
      destroyOnClose: true,
      style: { width: '380px' },
      drawer: true,
      closable: true,
      children: (
        <Form labelLayout="float" columns={1} dataSet={formDS}>
          <Lov name="bomTemplateCode" />
        </Form>
      ),
      onOk: async () => {
        const validateFlag = await formDS.validate();
        if (!validateFlag) return false;
        const { bomTemplateCode } = formDS?.current?.get('bomTemplateCode') || {};
        openTab({
          key: `/spc/bom-view-workbench/${bomTemplateCode}/comment-import`,
          path: `/spc/bom-view-workbench/${bomTemplateCode}/comment-import`,
          title: 'hzero.common.title.batchImport',
          closable: true,
        });
      },
    });
  };

  const HeaderButtons = observer(() => {
    const buttons = [
      {
        name: 'create',
        group: true,
        child: () => (
          <Button color="primary" icon="add" onClick={handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        ),
      },
      {
        name: 'publish',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: handleBatchRelease,
          type: 'c7n-pro',
          icon: 'publish2',
          funcType: 'flat',
          disabled: !tableDs?.selected?.length,
        },
        child: intl.get('hzero.common.button.realse').d('发布'),
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_SSRC_BOM_VIEW_HEADER_STANDARD_EXPORT',
          requestUrl: `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-bom-workbenches/export`,
          queryParams: getExportParams,
          method: 'POST',
          allBody: true,
          buttonText:
            tableDs.selected.length > 0
              ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
              : intl.get(`hzero.common.button.export`).d('导出'),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            funcType: 'flat',
          },
        },
      },
      {
        name: 'import',
        btnComp: PermissionButton,
        btnProps: {
          onClick: handleImport,
          type: 'c7n-pro',
          icon: 'archive',
          funcType: 'flat',
          // permissionList: [
          //   {
          //     code: 'srm.pc-admin.pc-purchaser.workspace2.ps.invalid.button',
          //     type: 'button',
          //     meaning: '作废',
          //   },
          // ],
        },
        child: intl.get('hzero.common.title.batchImport').d('批量导入'),
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  });

  const handleChange = (_, value) => {
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
          .get('spc.bomViewWorkbench.view.message.inputMultiTemplateNumOrTitle')
          .d('请输入价格BOM编码、名称查询')}
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('codeOrName', '');
  };

  return (
    <React.Fragment>
      <Header
        title={intl.get('spc.bomViewWorkbench.view.title.bomViewWorkbench').d('价格BOM工作台')}
      >
        <HeaderButtons />
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTable(
            { code: 'SPC.PRICE_BOM_WORKBENCH.LIST.ALL_TABLE' },
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
              searchCode="SPC.PRICE_BOM_WORKBENCH.LIST.FILTER"
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
    unitCode: ['SPC.PRICE_BOM_WORKBENCH.LIST.ALL_TABLE', 'SPC.PRICE_BOM_WORKBENCH.LIST.FILTER'],
  }),
  formatterCollections({
    code: [
      'hzero.common',
      'entity.roles',
      'hzero.c7nProUI',
      'spc.bomViewWorkbench',
      'ssrc.inquiryHall',
      'spc.formulaManage',
    ],
  })
)(BomViewWorkbench);
