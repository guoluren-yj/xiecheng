/**
 * PCN工作台
 * @date: 2021-06-07
 * @author: ZYF <yanfengz.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { DataSet, Button, Modal, Table, Tabs, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { isEmpty } from 'lodash';
// import { colorRender } from '@/routes/components/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
// import SrmOperationRecord from '_components/SrmOperationRecord';
import DynamicButtons from '_components/DynamicButtons';

import ApproveRecord from '_components/ApproveRecord';
import {
  initialMethod,
  fetchTabDataList,
  handleGetOperationRecord,
} from '@/services/pcnmanageWorkbenchService';
import './index.less';
import { pcnmanageWorkbenchDS, operationTableDs } from './DataSet';
import { c7nModal } from '../util';
import ExportRecord from '../components/ExportRecord';
import importModalDS from '../components/ExportRecord/indexDs';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const SRM_SIEC = '/siec';
@withCustomize({
  unitCode: [
    'SIEC.WORKSPACE_LIST.ALL_LIST',
    'SIEC.WORKSPACE_LIST.LIST',
    'SIEC.WORKSPACE_LIST.BTNS',
    'SIEC.WORKSPACE_LIST.ALL.BTNS',
  ],
})
@connect(({ // loading = {},
  pcnmanageWorkbench }) => ({
  pcnmanageWorkbench,
}))
@formatterCollections({
  code: [
    'siec.pcnmanageWorkbench',
    'hzero.common',
    'sinv.common',
    'sinv.receiptExecution',
    'sinv.inventoryBench',
    'sinv.pcnmanageWorkbench',
  ],
})
@withProps(
  () => {
    const tableDs = new DataSet(
      pcnmanageWorkbenchDS({
        queryFlag: '0',
        id: 'pcnHeaderId',
      })
    );
    const tableAllDs = new DataSet(
      pcnmanageWorkbenchDS({
        queryFlag: '1',
        id: 'pcnLineId',
      })
    );
    const operationDs = new DataSet(operationTableDs());
    return {
      tableDs,
      tableAllDs,
      operationDs,
    };
  },
  { cacheState: true }
)
export default class PcnmanageWorkbench extends Component {
  constructor(props) {
    super(props);
    this.importModalDs = new DataSet(importModalDS());
    const { history } = props;
    const { activeKey } = history?.location;
    this.state = {
      activeKey: activeKey || 'approving',
      statusConfigId: '',
      pageOperationList: [], // 初始化按钮队列
      tabKey: 'OPERAT',
      approveData: [],
      tabClause: {
        waitingCount: 0,
        allCount: 0,
        tabKey: 'OPERAT',
      },
    };
  }

  componentDidMount() {
    initialMethod().then((res) => {
      if (res) {
        const { statusConfigId, pageOperationList } = res;
        // 通过initialFlag区分初始化“新增”按钮与其他按钮
        const newPageOperationList = pageOperationList?.map((n) => ({ ...n, initialFlag: true }));
        this.setState({ statusConfigId, pageOperationList: newPageOperationList });
        if (statusConfigId) {
          this.fetchList(statusConfigId);
          this.fetchTabData(statusConfigId);
        }
      }
    });
  }

  fetchTabData = (statusConfigId) => {
    fetchTabDataList(statusConfigId).then((res) => {
      if (getResponse(res)) {
        this.setState({
          tabClause: {
            waitingCount: res?.waitingCount > 99 ? '99+' : res?.waitingCount,
            allCount: res?.allCount > 99 ? '99+' : res?.allCount,
          },
        });
      }
    });
  };

  /**
   * fetchList - 查询列表页
   */
  @Bind()
  fetchList(statusConfigId) {
    const { tableDs, tableAllDs } = this.props;
    tableDs.setQueryParameter('statusConfigId', statusConfigId);
    tableAllDs.setQueryParameter('statusConfigId', statusConfigId);
    const { activeKey } = this.state;
    console.log(tableDs.currentPage, 'tableDs.currentPage');
    if (activeKey === 'all') tableAllDs.query(tableAllDs.currentPage);
    if (activeKey !== 'all') tableDs.query(tableDs.currentPage);
  }

  /**
   * renderButton - 渲染按钮
   */
  @Bind()
  renderButton(btnConfig) {
    if (btnConfig) {
      return (
        btnConfig.map &&
        btnConfig.map((v) => (
          <Button style={{ border: 'none' }} onClick={() => this.handleHeaderBtnAffairHandle(v)}>
            {v.operationDesc}
          </Button>
        ))
      );
    }
  }

  /**
   * handleTabChange - tab切换回调
   */
  @Bind()
  handleTabChange(newTabKey) {
    const { tableDs, tableAllDs } = this.props;
    this.setState({
      activeKey: newTabKey,
    });
    if (newTabKey === 'all') tableAllDs.query(tableAllDs.currentPage);
    if (newTabKey !== 'all') tableDs.query(tableDs.currentPage);
  }

  @Bind()
  async handleHeaderBtnAffairHandle(operationItem) {
    const { operationCode, initialFlag, operationDesc } = operationItem || {};
    const { tableDs, tableAllDs, dispatch } = this.props;
    const { activeKey, statusConfigId = '' } = this.state;
    const dsSource = activeKey === 'approving' ? tableDs : tableAllDs;
    dsSource.setQueryParameter('statusConfigId', statusConfigId);
    const selectedRows = dsSource.selected.map((s) => s.toData()) || [];
    const params = selectedRows.map((v) => ({
      ...v,
      operationCode,
      operationDesc,
      sellerFLag: 0,
    }));
    if (initialFlag) {
      this.props.history.push({
        pathname: `/siec/pcnmanage-workbench/detail`,
        search: `statusConfigId=${statusConfigId}&operationCode=${operationCode}&edit=1`,
      });
    } else {
      const response = await dispatch({
        type: 'pcnmanageWorkbench/headerBtnAffairHandle',
        payload: params,
      });
      if (response) {
        notification.success();
        this.fetchList(statusConfigId);
      }
    }
  }

  /**
   * handleApprovePass - 审批通过
   */
  @Bind()
  async handleApprovePass() {
    const { tableDs, tableAllDs, dispatch } = this.props;
    const { activeKey, statusConfigId } = this.state;
    const dsSource = activeKey === 'approving' ? tableDs : tableAllDs;
    const selectedRows = dsSource.selected.map((s) => s.toData()) || [];
    const params = {
      dtos: selectedRows,
    };
    const response = await dispatch({
      type: 'pcnmanageWorkbench/batchApprovePass',
      payload: params,
    });
    if (response) {
      notification.success();
      this.fetchList(statusConfigId);
    }
  }

  /**
   * handleApproveRefused - 审批拒绝
   */
  @Bind()
  async handleApproveRefused() {
    const { tableDs, tableAllDs, dispatch } = this.props;
    const { activeKey, statusConfigId } = this.state;
    const dsSource = activeKey === 'approving' ? tableDs : tableAllDs;
    const selectedRows = dsSource.selected.map((s) => s.toData()) || [];
    const params = {
      dtos: selectedRows,
    };
    const response = await dispatch({
      type: 'pcnmanageWorkbench/batchApproveRefused',
      payload: params,
    });
    if (response) {
      notification.success();
      this.fetchList(statusConfigId);
    }
  }

  /**
   * jumpToDetail - 跳转明细页
   */
  @Bind()
  jumpToDetail(record) {
    const {
      data: { statusList = {} },
    } = record;
    const { relationPageValue = '' } = statusList || {};
    const pcnHeaderId = record.get('pcnHeaderId');
    const { activeKey, statusConfigId = '' } = this.state;
    if (relationPageValue) {
      this.props.history.push({
        pathname: relationPageValue,
        search: `pcnHeaderId=${pcnHeaderId}&statusConfigId=${statusConfigId}&activeKey=${activeKey}`,
        // state: {
        //   detail: record.data,
        // },
      });
    } else {
      notification.warning({
        message: intl
          .get(`siec.pcnmanageWorkbench.view.message.pcnWorkbench`)
          .d('该状态未配置跳转页面'),
        placement: 'bottomRight',
      });
    }
  }

  @Bind()
  jumpToOperation(record) {
    handleGetOperationRecord({ pcnHeaderId: record.get('pcnHeaderId') })
      .then((res) => {
        this.setState({
          approveData: res
            .reduce((pre, current) => [...pre, ...(current.historicTaskExtList || [])], [])
            .reverse(),
        });
      })
      .then(() => {
        const columns = [
          {
            name: 'operator',
            width: 120,
          },
          {
            name: 'creationDate',
            width: 180,
          },
          {
            name: 'operationName',
            width: 100,
          },
          {
            name: 'remark',
            // width: 80,
          },
        ];
        const { operationDs } = this.props;
        const { tabKey } = this.state;
        operationDs.setQueryParameter('pcnHeaderId', record.get('pcnHeaderId'));
        operationDs.query();
        Modal.open({
          title: intl.get(`siec.pcnmanageWorkbench.view.operationHistory`).d('操作历史'),
          okText: intl.get('hzero.common.button.close').d('关闭'),
          okCancel: false,
          children: (
            <Fragment>
              <Tabs defaultActiveKey={tabKey}>
                <TabPane
                  tab={intl.get(`siec.pcnmanageWorkbench.view.operationHistory`).d('操作历史')}
                  key="OPERAT"
                >
                  <div style={{ height: 'calc(100vh - 220px)' }}>
                    <Table
                      style={{ maxHeight: `calc(100% - 35px)` }}
                      columns={columns}
                      dataSet={operationDs}
                    />
                  </div>
                </TabPane>
                <TabPane
                  tab={intl.get('sinv.receiptExecution.model.receipt.approved').d('审批记录')}
                  key="APPROVED"
                >
                  <ApproveRecord data={this.state.approveData} />
                  {!this.state.approveData?.length && (
                    <div className="nodata_wrapper">
                      <span>
                        {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
                      </span>
                    </div>
                  )}
                </TabPane>
              </Tabs>
            </Fragment>
          ),
          drawer: true,
          style: { width: 742 },
        });
      });
  }

  // 已收货-导出状态
  operaClick = (record) => {
    const entryParams = {
      ...record.toData(),
      tableDs: this.importModalDs,
    };
    c7nModal({
      title: intl.get(`sinv.pcnmanageWorkbench.view.title.statusDetail`).d('状态明细'),
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <ExportRecord {...entryParams} />,
    });
  };

  render() {
    const {
      tableDs,
      tableAllDs,
      customizeTable,
      // batchApprovePassLoading = false,
      // batchApproveRefusedLoading = false,
    } = this.props;
    const { statusConfigId, tabClause, activeKey } = this.state;
    const columns = [
      {
        name: 'statusCode',
        width: 120,
        // renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
        renderer: ({ value, record }) => {
          if (value) {
            return record?.get('statusCodeMeaning');
          } else {
            return '-';
          }
        },
      },
      {
        name: 'pcnNum',
        width: 180,
        renderer: ({ value, record }) => <a onClick={() => this.jumpToDetail(record)}>{value}</a>,
      },
      {
        name: 'supplierCompanyName',
        width: 260,
      },
      {
        name: 'companyName',
        width: 260,
      },
      {
        name: 'typeName',
        width: 130,
      },
      {
        name: 'createdByName',
        width: 130,
      },
      {
        name: 'creationDate',
        width: 130,
      },
      {
        name: 'effectiveDate',
        width: 130,
      },
      {
        name: 'supplierPrincipal',
        width: 130,
      },
      {
        name: 'principalContact',
        width: 130,
      },
      {
        name: 'principalEmail',
      },
      {
        name: 'operationRecord',
        width: 130,
        renderer: ({ record }) => (
          // <SrmOperationRecord
          //   businessKey={record?.get('businessKey')}
          //   url={`${SRM_SIEC}/v1/${organizationId}/pcn-headers/history`}
          //   operationParams={{
          //     pcnHeaderId: record?.get('pcnHeaderId'),
          //   }}
          //   color="#1D2129"
          // />
          <a onClick={() => this.jumpToOperation(record)}>
            {intl.get(`siec.pcnmanageWorkbench.view.operationHistory`).d('操作历史')}
          </a>
        ),
      },
    ];
    const allColumns = [
      {
        name: 'statusCode',
        width: 120,
        // renderer: ({ value, record }) => colorRender(value, record, 'statusCode'),
        renderer: ({ value, record }) => {
          if (value) {
            return record?.get('statusCodeMeaning');
          } else {
            return '-';
          }
        },
      },
      {
        name: 'pcnNum',
        width: 180,
        renderer: ({ value, record }) => <a onClick={() => this.jumpToDetail(record)}>{value}</a>,
      },
      {
        name: 'lineNum',
        width: 70,
      },
      {
        name: 'supplierCompanyName',
        width: 260,
      },
      {
        name: 'companyName',
        width: 260,
      },
      {
        name: 'finalEffectiveDate',
        width: 130,
      },
      {
        name: 'evaluationOpinion',
        width: 200,
      },
      {
        name: 'typeName',
        width: 130,
      },
      {
        name: 'itemCode',
        width: 130,
      },
      {
        name: 'itemName',
        width: 130,
      },
      {
        name: 'categoryName',
        width: 130,
      },
      {
        name: 'uomName',
        width: 130,
      },
      {
        name: 'supplierInventoryQuantity',
        width: 130,
      },
      {
        name: 'supplierProcessingMethod',
        width: 130,
      },
      {
        name: 'buyerInventoryQuantity',
        width: 130,
      },
      {
        name: 'buyerProcessingMethod',
        width: 130,
      },
      {
        name: 'attachmentUuidLine',
        width: 130,
      },
      {
        name: 'createdByName',
        width: 130,
      },
      {
        name: 'creationDate',
        width: 130,
      },
      {
        name: 'effectiveDate',
        width: 130,
      },
      {
        name: 'importStatusMeaning',
        width: 120,
        renderer: ({ record }) => {
          let dom = null;
          const importStatus = record.get('importStatus');
          if (importStatus === 'SUCCESS') {
            dom = (
              <Tag onClick={() => this.operaClick(record)} color="green" style={{ border: 'none' }}>
                {intl.get('siec.pcnmanageWorkbench.view.tongbusuccess').d('同步成功')}
                <Icon
                  style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
                  type="wysiwyg"
                />
              </Tag>
            );
          } else if (importStatus === 'FAIL') {
            dom = (
              <Tag onClick={() => this.operaClick(record)} color="red" style={{ border: 'none' }}>
                {intl.get('siec.pcnmanageWorkbench.view.tongbufail').d('同步失败')}
                <Icon
                  style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
                  type="wysiwyg"
                />
              </Tag>
            );
          } else if (importStatus === 'IMPORTING') {
            dom = (
              <Tag
                onClick={() => this.operaClick(record)}
                color="yellow"
                style={{ border: 'none' }}
              >
                {intl.get('siec.pcnmanageWorkbench.view.tongbuzhong').d('同步中')}
                <Icon
                  style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
                  type="wysiwyg"
                />
              </Tag>
            );
          } else {
            dom = (
              <Tag
                // onClick={() => this.operaClick(record)}
                style={{ border: 'none' }}
                color="gray"
              >
                {intl.get('siec.pcnmanageWorkbench.view.notongbu').d('无需同步')}
                {/* <Icon
                  style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }}
                  type="wysiwyg"
                /> */}
              </Tag>
            );
          }
          return dom;
        },
      },
      {
        name: 'operationRecord',
        width: 130,
        renderer: ({ record }) => (
          // <SrmOperationRecord
          //   businessKey={record?.get('businessKey')}
          //   url={`${SRM_SIEC}/v1/${organizationId}/pcn-headers/history`}
          //   operationParams={{
          //     pcnHeaderId: record?.get('pcnHeaderId'),
          //   }}
          //   color="#1D2129"
          // />
          <a onClick={() => this.jumpToOperation(record)}>
            {intl.get(`siec.pcnmanageWorkbench.view.operationHistory`).d('操作历史')}
          </a>
        ),
      },
    ];

    const HeaderButtons = observer(() => {
      const { pageOperationList = [] } = this.state;
      const { customizeBtnGroup } = this.props;
      const dsSource = activeKey === 'approving' ? tableDs : tableAllDs;
      const selectedRows = dsSource.selected.map((s) => s.toData()) || [];
      const isShowBtn =
        selectedRows.length > 0 &&
        selectedRows.every((v) => v.statusCode === selectedRows[0].statusCode);
      // 已选中的按钮队列
      const selectedPageOperationList =
        selectedRows.length > 0 &&
        selectedRows[0].statusList &&
        selectedRows[0].statusList.pageOperationList;

      const buttons = {
        wait: [
          {
            name: 'print',
            childFor: 'buttonText',
            child: (name) =>
              name || intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
            btnComp: PrintProButton,
            btnProps: {
              buttonProps: {
                disabled: isEmpty(selectedRows),
                funcType: 'flat',
              },
              requestUrl: `${SRM_SIEC}/v1/${organizationId}/pcn-headers/batch-print-token`,
              method: 'POST',
              data: selectedRows,
              // buttonText: intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
            },
          },
          {
            name: 'newExport',
            group: true,
            childFor: 'buttonText',
            child: (name) => (
              <ExcelExportPro
                allBody
                method="POST"
                buttonText={
                  name || selectedRows.length > 0
                    ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                    : intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
                }
                otherButtonProps={{
                  icon: 'export',
                  type: 'c7n-pro',
                  funcType: 'flat',
                }}
                requestUrl={`${SRM_SIEC}/v1/${organizationId}/pcn-headers/exportHeaderInfo/new`}
                templateCode="SRM_C_SRM_SIEC_PCN_HEADER_WAITING_EXPORT"
                queryParams={{
                  pcnHeaderIds:
                    selectedRows.length > 0 ? selectedRows.map((n) => n?.pcnHeaderId) : [],
                  statusConfigId,
                  customizeUnitCode: 'SIEC.WORKSPACE_LIST.SEARCHBAR_PCN',
                  ...filterNullValueObject(tableDs.queryDataSet?.current?.toData()),
                }}
              />
            ),
          },
          {
            name: 'export',
            group: true,
            childFor: 'buttonText',
            child: (name) => (
              <ExcelExport
                buttonText={
                  name || selectedRows.length > 0
                    ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                    : intl.get(`siec.pcnmanageWorkbench.view.button.dataOutput`).d('导出')
                }
                otherButtonProps={{
                  icon: 'export',
                  type: 'c7n-pro',
                  funcType: 'flat',
                }}
                requestUrl={`${SRM_SIEC}/v1/${organizationId}/pcn-headers/exportHeaderInfo`}
                queryParams={{
                  pcnHeaderIds:
                    selectedRows.length > 0 ? selectedRows.map((n) => n?.pcnHeaderId) : [],
                  statusConfigId,
                  customizeUnitCode: 'SIEC.WORKSPACE_LIST.SEARCHBAR_PCN',
                  ...filterNullValueObject(tableDs.queryDataSet?.current?.toData()),
                }}
              />
            ),
          },
        ],
        all: [
          {
            name: 'print',
            childFor: 'buttonText',
            child: (name) =>
              name || intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
            btnComp: PrintProButton,
            btnProps: {
              buttonProps: {
                disabled: isEmpty(selectedRows),
                funcType: 'flat',
              },
              requestUrl: `${SRM_SIEC}/v1/${organizationId}/pcn-headers/batch-print-token`,
              method: 'POST',
              data: selectedRows,
              // buttonText: intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
            },
          },
          {
            name: 'newExport',
            group: true,
            childFor: 'buttonText',
            child: (name) => (
              <ExcelExportPro
                allBody
                method="POST"
                buttonText={
                  name || selectedRows.length > 0
                    ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                    : intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
                }
                otherButtonProps={{
                  icon: 'export',
                  type: 'c7n-pro',
                  funcType: 'flat',
                }}
                templateCode="SRM_C_SRM_SIEC_PCN_HEADER_ALL_EXPORT"
                requestUrl={`${SRM_SIEC}/v1/${organizationId}/pcn-headers/exportDetail/new`}
                queryParams={{
                  pcnLineIds: selectedRows.length > 0 ? selectedRows.map((n) => n?.pcnLineId) : [],
                  statusConfigId,
                  customizeUnitCode: 'SIEC.WORKSPACE_LIST.SEARCHBAR_PCN',
                  ...filterNullValueObject(tableAllDs.queryDataSet?.current?.toData()),
                }}
              />
            ),
          },
          {
            name: 'export',
            group: true,
            childFor: 'buttonText',
            child: (name) => (
              <ExcelExport
                buttonText={
                  name || selectedRows.length > 0
                    ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                    : intl.get(`siec.pcnmanageWorkbench.view.button.dataOutput`).d('导出')
                }
                otherButtonProps={{
                  icon: 'export',
                  type: 'c7n-pro',
                  funcType: 'flat',
                }}
                requestUrl={`${SRM_SIEC}/v1/${organizationId}/pcn-headers/exportDetail`}
                queryParams={{
                  pcnLineIds: selectedRows.length > 0 ? selectedRows.map((n) => n?.pcnLineId) : [],
                  statusConfigId,
                  customizeUnitCode: 'SIEC.WORKSPACE_LIST.SEARCHBAR_PCN',
                  ...filterNullValueObject(tableAllDs.queryDataSet?.current?.toData()),
                }}
              />
            ),
          },
        ],
      };

      return (
        <Fragment>
          {activeKey !== 'all'
            ? customizeBtnGroup(
                {
                  code: 'SIEC.WORKSPACE_LIST.BTNS',
                  pro: true,
                },
              <DynamicButtons buttons={buttons.wait} />
              )
            : customizeBtnGroup(
                {
                  code: 'SIEC.WORKSPACE_LIST.ALL.BTNS',
                  pro: true,
                },
              <DynamicButtons buttons={buttons.all} />
              )}
          {activeKey !== 'all' && (
            <Fragment>
              {isShowBtn
                ? this.renderButton(selectedPageOperationList)
                : this.renderButton(pageOperationList)}
            </Fragment>
          )}
        </Fragment>
      );
    });

    return (
      <Fragment>
        <Header
          title={intl
            .get('siec.pcnmanageWorkbench.view.title.pcnUpdateWorkbench')
            .d('采购方变更工作台')}
        >
          <HeaderButtons dataSet={tableDs} />
        </Header>
        <Content>
          <Tabs defaultActiveKey={activeKey} animated={false} onChange={this.handleTabChange}>
            <TabPane
              tab={intl.get(`siec.pcnmanageWorkbench.view.pcnWorkbenchApproving`).d('待处理')}
              key="approving"
              count={tabClause.waitingCount}
            >
              <div style={{ height: 'calc(100vh - 245px)' }}>
                {statusConfigId &&
                  customizeTable(
                    {
                      code: 'SIEC.WORKSPACE_LIST.LIST',
                    },
                    <SearchBarTable
                      boxSizing="wrapper"
                      style={{ maxHeight: `calc(100% - 22px)` }}
                      searchCode="SIEC.WORKSPACE_LIST.SEARCHBAR_PCN"
                      dataSet={tableDs}
                      columns={columns}
                      cacheState
                      searchBarConfig={{
                        fieldProps: {
                          statusCode: {
                            lovPara: {
                              statusConfigId,
                              tenantId: organizationId,
                            },
                          },
                          companyId: {
                            lovPara: {
                              tenantId: organizationId,
                            },
                          },
                        },
                      }}
                    />
                  )}
              </div>
            </TabPane>
            <TabPane
              tab={intl.get(`siec.pcnmanageWorkbench.view.pcnWorkbenchAll`).d('全部')}
              key="all"
              count={tabClause.allCount}
            >
              <div style={{ height: 'calc(100vh - 245px)' }}>
                {statusConfigId &&
                  customizeTable(
                    {
                      code: 'SIEC.WORKSPACE_LIST.ALL_LIST',
                    },
                    <SearchBarTable
                      boxSizing="wrapper"
                      style={{ maxHeight: `calc(100% - 22px)` }}
                      searchCode="SIEC.WORKSPACE_LIST.SEARCHBAR_PCN_ALL"
                      cacheState
                      dataSet={tableAllDs}
                      columns={allColumns}
                      searchBarConfig={{
                        fieldProps: {
                          statusCode: {
                            lovPara: {
                              statusConfigId,
                              tenantId: organizationId,
                            },
                          },
                          itemId: {
                            lovPara: { tenantId: organizationId },
                          },
                          companyId: {
                            lovPara: {
                              tenantId: organizationId,
                            },
                          },
                        },
                      }}
                    />
                  )}
              </div>
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
