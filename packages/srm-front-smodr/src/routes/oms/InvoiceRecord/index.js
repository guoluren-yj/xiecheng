import React from 'react';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';
import ExtensionHeaderTable from './ExtensionTable/ExtensionHeaderTable';
import ExtensionLineTable from './ExtensionTable/ExtensionLineTable';
import HistoryModal from '../HistoryModal';

@formatterCollections({ code: ['smodr.invoiceRecord', 'smodr.common'] })
@connect(({ invoiceRecord, loading }) => ({
  invoiceRecord,
  fetchLineLoading: loading.effects['invoiceRecord/fetchInvoicePro'],
  fetchDataLoading: loading.effects['invoiceRecord/fetchInvoiceRecord'],
  fetchHeaderLoading: loading.effects['invoiceRecord/fetchInvoiceHeader'],
  fetchHistoryLoading: loading.effects['invoiceRecord/fetchHistory'],
}))
export default class InvoiceRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerFlag: false,
      lineFlag: false,
    };
  }

  form;

  componentDidMount() {
    this.fetchCompany();
    this.fetchBatchCodes();
    this.fetchInvoiceData();
  }

  // 查询所有公司
  @Bind()
  fetchCompany() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceRecord/fetchCompany',
    });
    dispatch({
      type: 'invoiceRecord/fetchPurchaseCompany',
    });
  }

  // 批量查询值集
  @Bind()
  fetchBatchCodes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceRecord/fetchBatchCodes',
    });
  }

  // 打开历史记录
  @Bind()
  handleOpenModal(record = {}) {
    this.setState({ historyModalVisible: true, record }, () => this.fetchHistory());
  }

  // 查看历史记录
  @Bind()
  fetchHistory(page = { page: 0, size: 10 }) {
    const {
      dispatch,
      invoiceRecord: { historyListPagination = {} },
    } = this.props;
    const { record } = this.state;
    const params = {
      invoiceId: record && record.invoiceId,
      // orderType: 'INVOICE',
      operationType: 'INVOICE',
      page: isEmpty(page) ? historyListPagination : page,
    };
    dispatch({
      type: 'invoiceRecord/fetchHistory',
      payload: { ...params },
    });
  }

  // 查询开票记录信息
  @Bind()
  fetchInvoiceData(pageParams = { page: 0, size: 10 }) {
    const {
      dispatch,
      invoiceRecord: { invoiceDataPagination = {} },
    } = this.props;
    const filterValue = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'invoiceRecord/fetchInvoiceRecord',
      payload: {
        page: isEmpty(pageParams) ? invoiceDataPagination : pageParams,
        ...filterValue,
        queryDateFrom:
          filterValue.queryDateFrom && filterValue.queryDateFrom.format(DEFAULT_DATETIME_FORMAT),
        queryDateTo:
          filterValue.queryDateTo && filterValue.queryDateTo.format(DEFAULT_DATETIME_FORMAT),
      },
    });
    this.setState({
      headerFlag: false,
      lineFlag: false,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 查询
  @Bind()
  handleExtensionPro(record = {}) {
    const { dispatch } = this.props;
    const { orderId, invoiceNum } = record;
    dispatch({
      type: 'invoiceRecord/fetchInvoicePro',
      payload: { orderId, invoiceNum },
    });
    this.setState({
      headerFlag: false,
      lineFlag: true,
    });
  }

  // 查询头拓展
  @Bind()
  handleExtensionHeader(record = {}) {
    const { dispatch } = this.props;
    const { invoiceNum } = record;
    dispatch({
      type: 'invoiceRecord/fetchInvoiceHeader',
      payload: { invoiceNum },
    });
    this.setState({
      headerFlag: true,
      lineFlag: false,
    });
  }

  @Bind()
  onRow(index) {
    const a = document.getElementsByClassName('ant-table-row-invoice');
    if (a && a.length > 0) {
      a[index].className += ' click-row-invoice';
      const clickRow = document.getElementsByClassName('click-row-invoice');
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

  render() {
    const {
      invoiceRecord,
      fetchDataLoading,
      fetchHeaderLoading,
      fetchLineLoading,
      fetchHistoryLoading,
    } = this.props;
    const { historyModalVisible, headerFlag, lineFlag } = this.state;
    const {
      invoiceStatus = [],
      invoiceTypes = [],
      invoiceData = [],
      companyList = [],
      invoiceDataPagination = {},
      freightInvoices = [],
      productInvoices = [],
      extensionHeaderData = [],
      historyList = [],
      historyListPagination = {},
      purchaseCompanyList = [],
    } = invoiceRecord;
    const columns = [
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceNum').d('商城开票编码'),
        width: 200,
        dataIndex: 'invoiceNum',
        render: (val, record) => <a onClick={() => this.handleExtensionHeader(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceBatch').d('发票号码'),
        width: 100,
        dataIndex: 'invoiceBatch',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceCode').d('发票代码'),
        width: 100,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.validityStatusMeaning').d('有效性'),
        width: 100,
        dataIndex: 'validityStatusMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceTypeMeaning').d('发票类型'),
        width: 120,
        dataIndex: 'invoiceTypeMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceTime').d('开票日期'),
        width: 150,
        dataIndex: 'invoiceTime',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceAmountNew').d('开票金额(含税含运费)'),
        width: 160,
        dataIndex: 'invoiceAmountMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.newPurchaseCompanyName').d('采购方公司'),
        width: 150,
        dataIndex: 'purchaseCompanyName',
        render: (val, record) => (
          <span>{record.agreementType === 'SALE' ? record.proxySupplierCompanyName : val}</span>
        ),
      },
      {
        title: intl.get('smodr.invoiceRecord.model.newSupplierCompanyName').d('供应商公司'),
        width: 150,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => this.handleExtensionPro(record)}>
              {intl.get('smodr.invoiceRecord.model.examineSumDetail').d('查看金额明细')}
            </a>
            <a
              disabled={!record.fileUrl}
              href={record.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.get('smodr.invoiceRecord.model.invoiceLoad').d('发票下载')}
            </a>
            <a onClick={() => this.handleOpenModal(record)}>
              {intl.get('smodr.invoiceRecord.model.historyRecord').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('smodr.invoiceRecord.view.title').d('开票记录')} />
        <Content>
          <FilterForm
            companyList={companyList}
            invoiceTypes={invoiceTypes}
            invoiceStatus={invoiceStatus}
            purchaseCompanyList={purchaseCompanyList}
            onRef={this.handleRef}
            onSearch={this.fetchInvoiceData}
          />
          <Table
            bordered
            columns={columns}
            dataSource={invoiceData}
            loading={fetchDataLoading}
            pagination={invoiceDataPagination}
            onChange={(page) => this.fetchInvoiceData(page)}
            onRow={(_, index) => {
              return {
                className: 'ant-table-row-invoice',
                onClick: () => this.onRow(index),
              };
            }}
          />
          {headerFlag && (
            <ExtensionHeaderTable
              extensionHeaderData={extensionHeaderData}
              loading={fetchHeaderLoading}
              handleToDetail={this.handleToDetail}
              handleOpenModal={this.handleOpenModal}
            />
          )}
          {lineFlag && (
            <ExtensionLineTable
              freightInvoices={freightInvoices}
              productInvoices={productInvoices}
              loading={fetchLineLoading}
              handleToDetail={this.handleToDetail}
              handleOpenModal={this.handleOpenModal}
            />
          )}
        </Content>
        <HistoryModal
          rowKey="historyId"
          history
          visible={historyModalVisible}
          onCancel={() => this.setState({ historyModalVisible: false })}
          pagination={historyListPagination}
          loading={fetchHistoryLoading}
          dataSource={historyList}
          onChange={(page) => this.fetchHistory(page)}
        />
      </React.Fragment>
    );
  }
}
