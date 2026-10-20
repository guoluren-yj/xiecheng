import React from 'react';
import { connect } from 'dva';
import { Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import qs from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import FreightMethodModal from '@/routes/components/FreightMethodModal';

import FilterForm from './FilterForm';
import ExtensionInfoTable from './ExtensionTable/ExtensionInfoTable';
import ExtensionTab from './ExtensionTable/ExtensionTab';
import HistoryModal from '../HistoryModal';

@formatterCollections({
  code: [
    'smodr.frightLine',
    'smodr.orderLine',
    'smodr.common',
    'smodr.acceptOrder',
    'smodr.orderDetail',
  ],
})
@connect(({ freightLineManage, relevanceDrawer, loading }) => ({
  freightLineManage,
  relevanceDrawer,
  fetchFreightDataLoading: loading.effects['freightLineManage/fetchFreightLine'],
  extensionLineLoading: loading.effects['freightLineManage/fetchExtensionLine'],
  extensionHeaderLoading: loading.effects['freightLineManage/fetchExtensionHeader'],
  productListLoading: loading.effects['freightLineManage/fetchProducts'],
  extensionInfoLoading:
    loading.effects['freightLineManage/fetchPreemptInfo'] ||
    loading.effects['freightLineManage/fetchConsignInfo'] ||
    loading.effects['freightLineManage/fetchCancelInfo'] ||
    loading.effects['freightLineManage/fetchApproveInfo'] ||
    loading.effects['freightLineManage/fetchReceiptInfo'] ||
    loading.effects['freightLineManage/fetchStatementsInfo'],
  historyLoading: loading.effects['freightLineManage/fetchHistory'],
  fetchMethodLoading: loading.effects['freightLineManage/fetchMethod'],
}))
export default class FreightLineManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: '',
      extensionInfoFlag: false,
      productVisible: false,
      lineRecord: {},
      historyModalVisible: false,
      orderEntryId: undefined,
      methodVisible: false,
      historyType: '',
      orderId: undefined,
      activeKey: '1',
      extensionFlag: false,
    };
  }

  form;

  componentDidMount() {
    this.fetchCompany();
    this.fetchBatchCodes();
    this.fetchFreightLineData();
  }

  // 打开历史记录
  @Bind()
  handleOpenModal(type = '') {
    this.setState({ historyModalVisible: true, historyType: type }, () => this.fetchHistory());
  }

  // 查看历史记录
  @Bind()
  fetchHistory(page = { page: 0, size: 10 }) {
    let params = {};
    const { orderEntryId, historyType, orderId } = this.state;
    const {
      dispatch,
      freightLineManage: { historyListPagination = {} },
    } = this.props;
    switch (historyType) {
      case 'head':
        params = {
          linkId: orderId,
          orderType: 'ORDER',
          category: 'COMMON',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'line':
        params = {
          orderEntryId,
          // orderType: 'CONSIGNMENT',
          // category: 'COMMON',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'shenpi':
        params = {
          orderEntryId,
          operationType: 'APPROVE',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'yuzhan':
        params = {
          orderEntryId,
          operationType: 'PREEMPT',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'peisong':
        params = {
          orderEntryId,
          operationType: 'CONSIGNMENT',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'jieshou':
        params = {
          orderEntryId,
          operationType: 'RECEIPT',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'duizhang':
        params = {
          orderEntryId,
          // orderType: 'CONSIGNMENT',
          operationType: 'STATEMENT',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      case 'quxiao':
        params = {
          orderEntryId,
          // orderType: 'CONSIGNMENT',
          operationType: 'CANCEL',
          page: isEmpty(page) ? historyListPagination : page,
        };
        break;
      default:
        break;
    }
    dispatch({
      type: 'freightLineManage/fetchHistory',
      payload: params,
    });
  }

  // 跳转订单详情页
  @Bind()
  handleToDetail(record = {}) {
    openTab({
      key: `/s2-mall/oms/order-detail`,
      title: 'srm.common.model.orderDetailTitle',
      search: qs.stringify({
        action: 'srm.common.model.orderDetailTitle',
        orderId: record.orderId,
      }),
    });
    // const { history } = this.props;
    // history.push(`/s2-mall/oms/order-detail?orderId=${record.orderId}`);
  }

  // 跳转配送单详情页
  @Bind()
  handleToDelivery(record = {}) {
    openTab({
      key: `/s2-mall/oms/delivery-order-detail`,
      title: 'smodr.orderLine.model.deliveryDetailTitle',
      search: qs.stringify({
        action: 'smodr.orderLine.model.deliveryDetailTitle',
        consignmentCode: record.consignmentCode,
        orderEntryId: record.orderEntryId,
      }),
    });
    // const { history } = this.props;
    // history.push(
    //   `/s2-mall/oms/delivery-order-detail?consignmentCode=${record.consignmentCode}&orderEntryId=${record.orderEntryId}`
    // );
  }

  // 跳转接收单详情页
  @Bind()
  handleToAccept(record = {}) {
    openTab({
      key: `/s2-mall/oms/accept-order-detail`,
      title: 'smodr.orderLine.model.acceptDetailTitle',
      search: qs.stringify({
        action: 'smodr.orderLine.model.acceptDetailTitle',
        receiptCode: record.receiptCode,
        orderEntryId: record.orderEntryId,
      }),
    });
    // const { history } = this.props;
    // history.push(
    //   `/s2-mall/oms/accept-order-detail?receiptCode=${record.receiptCode}&orderEntryId=${record.orderEntryId}`
    // );
  }

  // 跳转对账单详情页
  @Bind()
  handleToStatement(record = {}) {
    openTab({
      key: `/s2-mall/oms/statement-order-detail`,
      title: 'smodr.orderLine.model.statementDetailTitle',
      search: qs.stringify({
        action: 'smodr.orderLine.model.statementDetailTitle',
        statementsCode: record.statementsCode,
        orderEntryId: record.orderEntryId,
      }),
    });
    // const { history } = this.props;
    // history.push(
    //   `/s2-mall/oms/statement-order-detail?statementsCode=${record.statementsCode}&orderEntryId=${record.orderEntryId}`
    // );
  }

  // 查询所有公司
  @Bind()
  fetchCompany() {
    const { dispatch } = this.props;
    dispatch({
      type: 'freightLineManage/fetchCompany',
    });
    dispatch({
      type: 'freightLineManage/fetchPurchaseCompany',
    });
  }

  // 批量查询值集
  @Bind()
  fetchBatchCodes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'freightLineManage/fetchBatchCodes',
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 查询运费行信息
  @Bind()
  fetchFreightLineData(pageParams = { page: 0, size: 10 }) {
    const {
      dispatch,
      freightLineManage: { freightLinePagination = {} },
    } = this.props;
    const filterValue = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'freightLineManage/fetchFreightLine',
      payload: {
        page: isEmpty(pageParams) ? freightLinePagination : pageParams,
        ...filterValue,
        queryDateFrom:
          filterValue.queryDateFrom && filterValue.queryDateFrom.format(DEFAULT_DATETIME_FORMAT),
        queryDateTo:
          filterValue.queryDateTo && filterValue.queryDateTo.format(DEFAULT_DATETIME_FORMAT),
      },
    });
    this.setState({
      extensionFlag: false,
      extensionInfoFlag: false,
    });
  }

  @Bind()
  handleChangeKey(key) {
    this.setState({
      activeKey: key,
    });
  }

  // 订单头拓展信息
  @Bind()
  handleExtensionHeader(record = {}, key) {
    const { dispatch } = this.props;
    const { orderId, freightEntryId } = record;
    dispatch({
      type: 'freightLineManage/fetchExtensionHeader',
      payload: { orderId },
    });
    dispatch({
      type: 'freightLineManage/fetchExtensionLine',
      payload: { freightEntryId },
    });
    this.setState({
      orderId,
      activeKey: key,
      extensionFlag: true,
      extensionInfoFlag: false,
    });
  }

  @Bind()
  handleExtensionInfo(record = {}, type) {
    this.setState({ infoRecord: record });
    const { dispatch } = this.props;
    const { freightEntryId, orderEntryId } = record;
    switch (type) {
      case 'cancel': {
        dispatch({
          type: 'freightLineManage/fetchCancelInfo',
          payload: { freightEntryId },
        });
        break;
      }
      case 'preemption': {
        dispatch({
          type: 'freightLineManage/fetchPreemptInfo',
          payload: { freightEntryId },
        });
        break;
      }
      case 'shipment': {
        dispatch({
          type: 'freightLineManage/fetchConsignInfo',
          payload: { freightEntryId },
        });
        break;
      }
      case 'receive': {
        dispatch({
          type: 'freightLineManage/fetchReceiptInfo',
          payload: { freightEntryId },
        });
        break;
      }
      case 'statements': {
        dispatch({
          type: 'freightLineManage/fetchStatementsInfo',
          payload: { freightEntryId },
        });
        break;
      }
      case 'approve': {
        dispatch({
          type: 'freightLineManage/fetchApproveInfo',
          payload: { freightEntryId },
        });
        break;
      }
      default: {
        break;
      }
    }
    dispatch({
      type: 'relevanceDrawer/fetchData',
      payload: orderEntryId,
    });
    this.setState({
      type,
      extensionInfoFlag: true,
      extensionFlag: false,
    });
  }

  @Bind()
  handleProduct(record = {}) {
    this.setState({ productVisible: true, lineRecord: record }, () =>
      this.fetchProducts({}, record)
    );
  }

  @Bind()
  fetchProducts(page = {}, record = {}) {
    const { dispatch } = this.props;
    const { freightEntryId } = record;
    dispatch({
      type: 'freightLineManage/fetchProducts',
      payload: {
        page,
        freightEntryId,
      },
    });
  }

  @Bind()
  onRow(index) {
    const a = document.getElementsByClassName('ant-table-row-freight');
    if (a && a.length > 0) {
      a[index].className += ' click-row-freight';
      const clickRow = document.getElementsByClassName('click-row-freight');
      if (clickRow.length > 0) {
        for (let i = 0; i < clickRow.length; i++) {
          if (clickRow[i].rowIndex === a[index].rowIndex) {
            clickRow[i].style.backgroundColor = '#f2f2f2';
          } else {
            clickRow[i].style.backgroundColor = '#fff';
          }
        }
      }
    }
  }

  @Bind()
  handleCheckMethod(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'freightLineManage/fetchMethod',
      payload: { orderId: record.orderId },
    });
    this.setState({
      methodVisible: true,
    });
  }

  render() {
    const {
      type,
      lineRecord,
      extensionInfoFlag,
      productVisible,
      historyModalVisible,
      methodVisible,
      activeKey,
      extensionFlag,
      infoRecord,
    } = this.state;
    const {
      freightLineManage,
      fetchFreightDataLoading,
      extensionLineLoading,
      extensionInfoLoading,
      productListLoading,
      historyLoading,
      fetchMethodLoading,
    } = this.props;
    const {
      freightLineData = [],
      freightTypes = [],
      orderTypes = [],
      companyList = [],
      extensionHeaderData = {},
      extensionData = [],
      freightLinePagination = {},
      extensionInfoData = [],
      productList = [],
      productPagination = {},
      historyList = [],
      historyListPagination = {},
      methodList = [],
      purchaseCompanyList = [],
    } = freightLineManage;
    const freightColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionHeader(record, '1')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaning').d('运费来源'),
        width: 100,
        dataIndex: 'cecFromMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.freightTypeMeaning').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionHeader(record, '2')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 120,
        dataIndex: 'freightPricingMethodMeaning',
        render: (_, record) => {
          if (record.isHasFreightPricing && record.freightPricingMethodMeaning) {
            return <span>{record.freightPricingMethodMeaning}</span>;
          } else if (!record.isHasFreightPricing) {
            return <span>-</span>;
          } else if (record.isHasFreightPricing && !record.freightPricingMethodMeaning) {
            return (
              <a onClick={() => this.handleCheckMethod(record)}>
                {intl.get('smodr.frightLine.model.check').d('查看')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.taxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'taxRateMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.frightLine.model.freightAmountTaxNew').d('单价(含税)'),
        width: 100,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.quantityjineTaxNew').d('行金额(含税)'),
        width: 100,
        dataIndex: 'freightAmountMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.cancelStatusMeaning').d('取消状态'),
        width: 150,
        dataIndex: 'cancelStatusMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionInfo(record, 'cancel')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.aggregatePreemptionStatusMeaning').d('预占状态'),
        width: 120,
        dataIndex: 'preemptionStatusMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionInfo(record, 'preemption')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.aggregateApproveStatusMeaning').d('审批状态'),
        width: 120,
        dataIndex: 'approveStatusMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionInfo(record, 'approve')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.aggregateShipmentStatusMeaning').d('配送状态'),
        width: 100,
        dataIndex: 'shipmentStatusMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionInfo(record, 'shipment')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.aggregateReceiveStatusMeaning').d('接收状态'),
        width: 100,
        dataIndex: 'receiveStatusMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionInfo(record, 'receive')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.aggregateStatementsStatusMeaning').d('对账状态'),
        width: 100,
        dataIndex: 'statementsStatusMeaning',
        render: (val, record) => (
          <a onClick={() => this.handleExtensionInfo(record, 'statements')}>{val}</a>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.buyerName').d('下单人'),
        width: 100,
        dataIndex: 'buyerName',
      },
      {
        title: intl.get('smodr.frightLine.model.buyerTime').d('下单时间'),
        width: 200,
        dataIndex: 'cecCreatedTime',
      },
      {
        title: intl.get('smodr.frightLine.model.newPurchaseCompanyName').d('采购方公司'),
        width: 200,
        dataIndex: 'purchaseCompanyName',
        render: (val, record) => (
          <span>{record.agreementType === 'SALE' ? record.proxySupplierCompanyName : val}</span>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.newSupplierCompanyName').d('供应商公司'),
        width: 150,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('smodr.frightLine.model.relevance').d('关联商品'),
        width: 100,
        render: (_, record) => (record.freightTypeCode === 'FREIGHT_LIST' ? '' : 2),
      },
    ];
    const productColumns = [
      {
        title: intl.get('smodr.frightLine.model.skuCode').d('商品编码'),
        width: 150,
        dataIndex: 'skuCode',
      },
      {
        title: intl.get('smodr.frightLine.model.skuName').d('商品名称'),
        width: 150,
        dataIndex: 'skuName',
      },
    ];

    const methodColumns = [
      {
        title: intl.get('smodr.frightLine.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 100,
        dataIndex: 'freightPricingMethodMeaning',
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('smodr.frightLine.view.title').d('运费行查询管理')} />
        <Content>
          <FilterForm
            onRef={this.handleRef}
            onSearch={this.fetchFreightLineData}
            freightTypes={freightTypes}
            orderTypes={orderTypes}
            companyList={companyList}
            purchaseCompanyList={purchaseCompanyList}
          />
          <Table
            bordered
            rowKey="freightEntryId"
            columns={freightColumns}
            dataSource={freightLineData}
            loading={fetchFreightDataLoading}
            pagination={freightLinePagination}
            onChange={(page) => this.fetchFreightLineData(page)}
            onRow={(_, index) => {
              return {
                className: 'ant-table-row-freight',
                onClick: () => this.onRow(index),
              };
            }}
          />
          {extensionFlag && (
            <ExtensionTab
              extensionData={extensionData}
              loading={extensionLineLoading}
              handleChange={this.handleChange}
              handleCheckMethod={this.handleCheckMethod}
              handleToDetail={this.handleToDetail}
              handleOpenModal={this.handleOpenModal}
              handleChangeKey={this.handleChangeKey}
              extensionHeaderData={extensionHeaderData}
              activeKey={activeKey}
            />
          )}
          {extensionInfoFlag && (
            <ExtensionInfoTable
              type={type}
              record={infoRecord}
              extensionInfoData={extensionInfoData}
              loading={extensionInfoLoading}
              handleOpenModal={this.handleOpenModal}
              handleToDetail={this.handleToDetail}
              handleToDelivery={this.handleToDelivery}
              handleToAccept={this.handleToAccept}
              handleToStatement={this.handleToStatement}
              handleExtensionInfo={this.handleExtensionInfo}
            />
          )}
        </Content>
        <Modal
          title={intl.get('smodr.frightLine.view.skuNameList').d('商品列表')}
          visible={productVisible}
          width={520}
          footer={null}
          onCancel={() => this.setState({ productVisible: false })}
        >
          <Table
            rowKey="skuId"
            columns={productColumns}
            dataSource={productList}
            pagination={productPagination}
            loading={productListLoading}
            onChange={(page) => this.fetchProducts(page, lineRecord)}
          />
        </Modal>
        <HistoryModal
          rowKey="historyId"
          history
          visible={historyModalVisible}
          onCancel={() => this.setState({ historyModalVisible: false })}
          onChange={(page) => this.fetchHistory(page)}
          pagination={historyListPagination}
          loading={historyLoading}
          dataSource={historyList}
        />
        {methodVisible && (
          <FreightMethodModal
            key="orderEntryId"
            visible={methodVisible}
            loading={fetchMethodLoading}
            columns={methodColumns}
            dataSource={methodList}
            onCancel={() => this.setState({ methodVisible: false })}
            onOk={() => this.setState({ methodVisible: false })}
          />
        )}
        {/* {methodVisible && (
          <Modal
            destroyOnClose
            title={intl.get('smodr.frightLine.model.freightRuleTypeMethod').d('运费计价方式')}
            onCancel={() => this.setState({ methodVisible: false })}
            visible={methodVisible}
          >
            <Table
              key="orderEntryId"
              loading={fetchMethodLoading}
              columns={methodColumns}
              dataSource={methodList}
            />
          </Modal>
        )} */}
      </React.Fragment>
    );
  }
}
