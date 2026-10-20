import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Tabs, Tag } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';

import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import TextFieldPro from '@/routes/components/TextFieldPro';
import { fetchApproveRecord } from '@/services/oms/purAfterSaleService';
import { useRenderTag } from '@/hooks/useRenderTag';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import AfsDetail from './AfsDetail';
import { tableDs } from './ds';
import openRecords from './TimeRecord';

const organizationId = getCurrentOrganizationId();

const { TabPane } = Tabs;

@withCustomize({
  unitCode: [
    'SMODR.AFTERSALE_PURCHASE.QUERY',
    'SMODR.AFTERSALE_DETAIL_PURCHASE.ORDER',
    'SMODR.AFTERSALE_DETAIL_PURCHASE.REQUEST',
  ],
})
@formatterCollections({
  code: ['smodr.common', 'smodr.afterSaleManage', 'smodr.orderLine', 'smodr.deliveryOrder'],
})
@withProps(
  () => ({
    tableDS: new DataSet(tableDs()),
    waitTableDS: new DataSet(tableDs()),
    rejectTableDS: new DataSet(tableDs()),
    refuseTableDS: new DataSet(tableDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class AfterSaleManage extends Component {
  state = {
    // tabClause: {
    //   allNum: 0,
    //   waitApprovedNum: 0,
    //   rejectNum: 0,
    //   productRejectNum: 0,
    // },
    tabCutPage: '1',
  };

  detailModal;

  componentDidMount() {
    const dsList = [
      { ds: this.props.waitTableDS, param: 'WAIT_APPROVE' },
      { ds: this.props.rejectTableDS, param: 'REJECTED' },
      { ds: this.props.refuseTableDS, param: 'PRODUCT_REJECTED' },
    ];
    dsList.forEach(item => {
      item.ds.query(1, { onlyCountFlag: 'Y', afterSaleStatusQuery: item.param });
    });
  }

  colorList = [
    { colorType: 'success', matchList: ['FINISH'] },
    { colorType: 'invalid', matchList: ['CANCELED'] },
    {
      colorType: 'warning',
      matchList: ['APPROVING', 'WAIT_PROCESS', 'WAIT_SENT', 'WAIT_CONFIRM', 'INTERNAL_APPROVING'],
    },
    { colorType: 'failed', matchList: [] },
  ];

  // componentDidMount() {
  //   this.fetchAfCount();
  // }

  // @Bind()
  // async fetchAfCount() {
  //   const res = getResponse(await fetchAfterSaleCount());
  //   if (res) {
  //     this.setState({ tabClause: res });
  //   }
  // }

  @Bind()
  handleAddRecord() {
    this.props.history.push(`/s2-mall/oms/after-sale-manage/create`);
  }

  @Bind()
  handleModalRef(ref = {}) {
    this.detailModal = ref;
  }

  @Bind()
  tabSelectChange(key) {
    const { tableDS, waitTableDS, rejectTableDS, refuseTableDS } = this.props;
    this.setState({
      tabCutPage: key,
    });
    switch (key) {
      case '1':
        tableDS.query();
        break;
      case '2':
        waitTableDS.setQueryParameter('filterParams', { afterSaleStatusQuery: 'WAIT_APPROVE' });
        waitTableDS.query();
        break;
      case '3':
        rejectTableDS.setQueryParameter('filterParams', { afterSaleStatusQuery: 'REJECTED' });
        rejectTableDS.query();
        break;
      case '4':
        refuseTableDS.setQueryParameter('filterParams', {
          afterSaleStatusQuery: 'PRODUCT_REJECTED',
        });
        refuseTableDS.query();
        break;
      default:
        break;
    }
  }

  @Bind()
  handleViewDetail(record) {
    const modal = Modal.open({
      title: intl.get('smodr.afterSaleManage.model.afterSaleDetailTitle').d('售后申请单详情'),
      key: '1',
      movable: false,
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 1090 },
      // mask: false,
      bodyStyle: { padding: 0 },
      children: <AfsDetail afsLine={record.toData()} />,
      footer: () => {
        return (
          <Button
            onClick={() => {
              modal.close();
            }}
            color="primary"
          >
            {intl.get('smodr.afterSaleManage.model.guanbi').d('关闭')}
          </Button>
        );
      },
    });
  }

  @Bind()
  async showHistory(record) {
    const { afterSaleCode, approveType } = record.get(['afterSaleCode', 'approveType']);
    const res = getResponse(await fetchApproveRecord({ afterSaleCode, approveType }));
    if (res && res.workflowApproveResponseMap) {
      const approveRecordList = Object?.values(res?.workflowApproveResponseMap)?.[0] || [];
      const approveRecordData = approveRecordList.map(i => i?.historicTaskExtList?.reverse());
      const approveRecords = [];
      approveRecordData.forEach(i => {
        i.forEach(l => {
          approveRecords.push(l);
        });
      });
      openRecords(record.get('afterSaleId'), approveRecords);
    } else {
      openRecords(record.get('afterSaleId'), []);
    }
  }

  render() {
    const {
      customizeTable,
      tableDS,
      waitTableDS,
      rejectTableDS,
      refuseTableDS,
      match: { path = '' },
    } = this.props;
    const { tabCutPage } = this.state;
    const columns = [
      {
        name: 'afterSaleStatusMeaning',
        width: 140,
        renderer: ({ record, value }) => {
          const { color, initStyle } = useRenderTag(this.colorList, record?.get('afterSaleStatus'));
          return (
            <Tag color={color} style={initStyle}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'options',
        width: 80,
        renderer: ({ dataSet, record }) => (
          <>
            <Button color="primary" funcType="link" onClick={() => this.showHistory(record)}>
              {intl.get('smodr.afterSaleManage.view.history').d('操作记录')}
            </Button>
            {!!record.get('wflApproveFlag') && (
              <Button
                color="primary"
                funcType="link"
                style={{marginLeft: 16}}
                onClick={() => {
                  openApproveModal({
                    modalProps: {
                      closable: true,
                    },
                    taskId: record.get('taskId'),
                    processInstanceId: record.get('processInstanceId'),
                    onSuccess: () => dataSet.query(),
                  });
                }}
              >
                {intl.get('hzero.common.button.approval').d('审批')}
              </Button>
            )}
          </>
        ),
      },
      {
        name: 'afterSaleCode',
        width: 150,
        renderer: ({ record, value }) => <a onClick={() => this.handleViewDetail(record)}>{value}</a>,
      },
      {
        name: 'approvalProgress',
        width: 180,
        header: intl.get('smodr.common.view.approvalProgress').d('审批进度'),
        show: tabCutPage === '2', // 待审批展示审批进度
        renderer: ({ record }) =>
          isEmpty(record.get('simpleApprovalHistory')) ? (
            '-'
          ) : (
            <ApproveRecordSimple data={record.get('simpleApprovalHistory') || []} />
          ),
      },
      {
        name: 'orderCodeLineNum',
        width: 200,
      },
      {
        name: 'srmOrderCode',
        width: 180,
      },
      {
        name: 'cecAfterSaleCode',
        width: 180,
      },
      {
        name: 'ecConsignmentCode',
        width: 180,
      },
      {
        name: 'skuCode',
        width: 140,
      },
      {
        name: 'skuName',
        minWidth: 200,
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'afterSaleTypeMeaning',
        width: 90,
      },
      {
        name: 'purchaseCompanyName',
        width: 100,
        renderer: ({ record, value }) => {
          return (
            <>
              {record?.get('agreementType') === 'SALE'
                ? record?.get('proxySupplierCompanyName')
                : value}
            </>
          );
        },
      },
      {
        name: 'supplierCompanyName',
        width: 100,
      },
      {
        name: 'ownerName',
        width: 100,
      },
      {
        name: 'applyTime',
        width: 160,
      },
    ].filter(n => n.show || !('show' in n));
    const fieldValuesFn = ds => {
      if (ds.selected.length > 0) {
        const fieldValues = ds?.queryDataSet?.current?.toJSONData();
        delete fieldValues.__dirty;
        delete fieldValues.__id;
        delete fieldValues._status;
        const afterSaleIdList = ds.selected.map(i => i.toData()).map(item => item.afterSaleId);
        fieldValues.afterSaleIdList = afterSaleIdList;
        return filterNullValueObject(fieldValues);
      } else {
        const fieldValues = ds?.queryDataSet?.current?.toJSONData();
        const filterParams = ds.getQueryParameter('filterParams');
        delete fieldValues.__dirty;
        delete fieldValues.__id;
        delete fieldValues._status;
        fieldValues.aggregateQuery = ds.getQueryParameter('aggregateQuery');
        fieldValues.afterSaleStatusQuery = filterParams?.afterSaleStatusQuery;
        return filterNullValueObject(fieldValues);
      }
    };
    const ObserExcel = observer(({ ds }) => (
      <ExcelExportPro
        templateCode="SRM_C_SRM_S2FUL_AFTER_SALE_PURCH"
        buttonText={
          ds?.selected?.length > 0
            ? intl.get('smodr.orderLine.view.checkExportNew').d('(新)勾选导出')
            : intl.get('smodr.orderLine.view.exportNew').d('(新)导出')
        }
        method="POST"
        allBody
        exportAsync
        requestUrl={`/smodr/v1/${organizationId}/aftersales/purchase-after-export`}
        queryParams={() => {
          const query = fieldValuesFn(ds);
          return filterNullValueObject(query);
        }}
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code: `${path}.button.export-new`,
              type: 'button',
              meaning: '售后管理(采)-导出',
            },
          ],
        }}
      />
    ));
    return (
      <React.Fragment>
        <div>
          <Header title={intl.get('smodr.afterSaleManage.view.purTitle').d('售后管理(采)')}>
            <ObserExcel
              ds={
                tabCutPage === '1'
                  ? tableDS
                  : tabCutPage === '2'
                  ? waitTableDS
                  : tabCutPage === '3'
                  ? rejectTableDS
                  : tabCutPage === '4'
                  ? refuseTableDS
                  : tableDS
              }
            />
          </Header>
        </div>
        <Content>
          <Tabs onChange={tabKey => this.tabSelectChange(tabKey)} defaultActiveKey={tabCutPage}>
            <TabPane
              tab={<span>{intl.get('smodr.afterSaleManage.view.all').d('全部')}</span>}
              count={() => tableDS.totalCount}
              key="1"
            >
              <div style={{ height: 'calc(100vh - 260px)' }}>
                {customizeTable(
                  {
                    code: 'SMODR.AFTERSALE_PURCHASE.QUERY',
                  },
                  <SearchBarTable
                    style={{ maxHeight: `calc(100% - 22px)` }}
                    searchCode="SMODR.AFTERSALE_PURCHASE.SELECT"
                    customizedCode="SMODR.AFTER_SALE_MANAGE.LIST.PUR.SELECT"
                    dataSet={tableDS}
                    columns={columns}
                    searchBarConfig={{
                      left: {
                        render: () => {
                          return (
                            <TextFieldPro
                              ds={tableDS}
                              name="aggregateQuery"
                              placeholder={intl
                                .get('smodr.afterSaleManage.view.searchTips')
                                .d('请输入售后申请单号、商城订单编码-行号查询')}
                              onRef={ref => {
                                this.queryRef = ref;
                              }}
                            />
                          );
                        },
                      },
                      onReset: () => {
                        if (this.queryRef) this.queryRef.handleClear();
                      },
                      onClear: () => {
                        if (this.queryRef) this.queryRef.handleClear();
                      },
                    }}
                  />
                )}
              </div>
            </TabPane>
            <TabPane
              tab={<span>{intl.get('smodr.afterSaleManage.view.waitShenpi').d('待审批')}</span>}
              count={() => waitTableDS.totalCount}
              key="2"
            >
              <div style={{ height: 'calc(100vh - 260px)' }}>
                {customizeTable(
                  {
                    code: 'SMODR.AFTERSALE_PURCHASE.QUERY',
                  },
                  <SearchBarTable
                    style={{ maxHeight: `calc(100% - 22px)` }}
                    searchCode="SMODR.AFTERSALE_PURCHASE.SELECT_V"
                    customizedCode="SMODR.AFTER_SALE_MANAGE.LIST.PUR.SELECT"
                    dataSet={waitTableDS}
                    columns={columns}
                    searchBarConfig={{
                      left: {
                        render: () => {
                          return (
                            <TextFieldPro
                              ds={waitTableDS}
                              name="aggregateQuery"
                              placeholder={intl
                                .get('smodr.afterSaleManage.view.searchTips')
                                .d('请输入售后申请单号、商城订单编码-行号查询')}
                              onRef={ref => {
                                this.queryRefs = ref;
                              }}
                            />
                          );
                        },
                      },
                      onReset: () => {
                        if (this.queryRefs) this.queryRefs.handleClear();
                      },
                      onClear: () => {
                        if (this.queryRefs) this.queryRefs.handleClear();
                      },
                    }}
                  />
                )}
              </div>
            </TabPane>
            <TabPane
              tab={<span>{intl.get('smodr.afterSaleManage.view.rejected').d('已驳回')}</span>}
              count={() => rejectTableDS.totalCount}
              key="3"
            >
              <div style={{ height: 'calc(100vh - 260px)' }}>
                {customizeTable(
                  {
                    code: 'SMODR.AFTERSALE_PURCHASE.QUERY',
                  },
                  <SearchBarTable
                    style={{ maxHeight: `calc(100% - 22px)` }}
                    searchCode="SMODR.AFTERSALE_PURCHASE.SELECT_V"
                    customizedCode="SMODR.AFTER_SALE_MANAGE.LIST.PUR.SELECT"
                    dataSet={rejectTableDS}
                    columns={columns}
                    searchBarConfig={{
                      left: {
                        render: () => {
                          return (
                            <TextFieldPro
                              ds={rejectTableDS}
                              name="aggregateQuery"
                              placeholder={intl
                                .get('smodr.afterSaleManage.view.searchTips')
                                .d('请输入售后申请单号、商城订单编码-行号查询')}
                              onRef={ref => {
                                this.queryReft = ref;
                              }}
                            />
                          );
                        },
                      },
                      onReset: () => {
                        if (this.queryReft) this.queryReft.handleClear();
                      },
                      onClear: () => {
                        if (this.queryReft) this.queryReft.handleClear();
                      },
                    }}
                  />
                )}
              </div>
            </TabPane>
            <TabPane
              tab={<span>{intl.get('smodr.afterSaleManage.view.refused').d('已拒收')}</span>}
              count={() => refuseTableDS.totalCount}
              key="4"
            >
              <div style={{ height: 'calc(100vh - 260px)' }}>
                {customizeTable(
                  {
                    code: 'SMODR.AFTERSALE_PURCHASE.QUERY',
                  },
                  <SearchBarTable
                    style={{ maxHeight: `calc(100% - 22px)` }}
                    searchCode="SMODR.AFTERSALE_PURCHASE.SELECT_V"
                    customizedCode="SMODR.AFTER_SALE_MANAGE.LIST.PUR.SELECT"
                    dataSet={refuseTableDS}
                    columns={columns}
                    searchBarConfig={{
                      left: {
                        render: () => {
                          return (
                            <TextFieldPro
                              ds={refuseTableDS}
                              name="aggregateQuery"
                              placeholder={intl
                                .get('smodr.afterSaleManage.view.searchTips')
                                .d('请输入售后申请单号、商城订单编码-行号查询')}
                              onRef={ref => {
                                this.queryReff = ref;
                              }}
                            />
                          );
                        },
                      },
                      onReset: () => {
                        if (this.queryReff) this.queryReff.handleClear();
                      },
                      onClear: () => {
                        if (this.queryReff) this.queryReff.handleClear();
                      },
                    }}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
