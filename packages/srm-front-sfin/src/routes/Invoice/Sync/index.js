/**
 * index.js - 非寄销发票同步查询
 * @date: 2018-12-11
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import { isEmpty, isNil } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';

import SearchPage from 'components/SearchPage';
import { Header } from 'components/Page';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import {
  getCurrentOrganizationId,
  getDateFormat,
  getEditTableData,
  getDateTimeFormat,
  // getUserOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils';
import ActionHistory from '../Components/ActionHistory';
import InvoiceDownloadList from '../Components/InvoiceDownloadList';
import TypeInModal from '../Components/TypeInModal';

const { Option } = Select;
const FormItem = Form.Item;
const promptCode = 'sfin.invoiceBill';

@withCustomize({
  unitCode: ['SFIN.INVOICE.SYNC.LIST.FLITER', 'SFIN.INVOICE.SYNC.LIST.GRID'],
})
@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryList'],
  syncLoading: loading.effects['invoice/syncInvoice'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
export default class Sync extends SearchPage {
  constructor(props) {
    super(props);
    this.state = { recordModal: false, modalVisible: false };
    this.tableCode = 'SFIN.INVOICE.SYNC.LIST.GRID';
  }

  componentDidMount() {
    const {
      invoice: { pagination },
    } = this.props;
    this.handleSearch(pagination);
    this.fetchCheckStatusList();
  }

  /**
   * 获取查验状态值级
   */
  @Bind()
  fetchCheckStatusList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/fetchCheckStatusList',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'sync',
      },
    });
    dispatch({
      type: 'invoice/updateState',
      payload: {
        syncCacheList: [], // 缓存的列表编辑数据要清空
      },
    });
  }

  @Bind()
  pageConfig() {
    return {
      modelName: 'invoice',
      dataName: 'list',
      customSearch: true,
      editTable: true,
      searchDispatch: 'invoice/queryList',
      cacheKey: '/sfin/invoice-sync/list',
      paramsFilter: (values) => {
        const { reviewedDateFrom, reviewedDateTo } = values;
        return {
          ...values,
          reviewedDateFrom: reviewedDateFrom ? moment(reviewedDateFrom).format(DATETIME_MIN) : '',
          reviewedDateTo: reviewedDateTo ? moment(reviewedDateTo).format(DATETIME_MAX) : '',
          type: 'sync',
          customizeUnitCode: 'SFIN.INVOICE.SYNC.LIST.FLITER,SFIN.INVOICE.SYNC.LIST.GRID',
        };
      },
    };
  }

  /**
   * 重置查询表单.
   */
  @Bind()
  handleFormReset() {
    const { form } = this.filterForm.props;

    form.resetFields();
  }

  /**
   * 搜索条件展开收起
   */
  @Bind()
  toggle() {
    const {
      dispatch,
      invoice: { expand },
    } = this.props;
    dispatch({
      type: 'invoice/updateExpand',
      payload: {
        type: 'sync',
        expand: !expand.sync,
      },
    });
  }

  /**
   * 辅助函数，查询前调用，缓存当前页面的编辑数据
   */
  @Bind()
  searchMiddleware() {
    const {
      dispatch,
      invoice: { list = {}, syncCacheList = [] },
    } = this.props;
    // 先合并，以保证先前的编辑存在
    const mergeList = ((list.sync && list.sync.content) || []).map((item) => {
      const index = syncCacheList.findIndex((e) => e.invoiceHeaderId === item.invoiceHeaderId);
      return index === -1 ? item : syncCacheList[index];
    });
    const editList = getEditTableData(mergeList);
    const newSyncCacheList = editList.reduce((prev, cur) => {
      const index = prev.findIndex((e) => e.invoiceHeaderId === cur.invoiceHeaderId);
      if (index !== -1) {
        prev.splice(index, 1, cur);
      } else {
        prev.push(cur);
      }
      return prev;
    }, syncCacheList);

    dispatch({
      type: 'invoice/updateState',
      payload: {
        syncCacheList: newSyncCacheList,
      },
    });
  }

  @Bind()
  @Throttle(1000)
  syncInvoice() {
    const {
      dispatch,
      invoice: { list = {}, syncCacheList = [] },
    } = this.props;
    const mergeList = ((list.sync && list.sync.content) || [])
      .filter((item) => item._status)
      .map((item) => {
        const index = syncCacheList.findIndex((e) => e.invoiceHeaderId === item.invoiceHeaderId);
        return index === -1 ? item : syncCacheList[index];
      });
    const data = getEditTableData(mergeList).map((item) => ({
      ...item,
      accountingDate: item.accountingDate
        ? item.accountingDate.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      syncDate: item.accountingDate
        ? item.accountingDate.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
    }));
    const payload = [...syncCacheList, ...data];

    if (!isEmpty(payload)) {
      dispatch({
        type: 'invoice/syncInvoice',
        payload,
      }).then((res) => {
        if (res) {
          this.setState({
            selectedRows: [],
          });
          this.handleSearch();
          dispatch({
            type: 'invoice/updateState',
            payload: {
              syncCacheList: [],
            },
          });
          notification.success();
        }
      });
    }
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState(
      {
        recordModal: true,
        data: record,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
      },
      () => {
        this.historyModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  /**
   * openInvoiceDownload - 打开发票下载弹窗
   */
  @Bind()
  openInvoiceDownload(record) {
    this.setState(
      {
        modalVisible: true,
        invoiceData: record,
      },
      () => {
        this.downloadModal.handleSearch();
      }
    );
  }

  /**
   * hideInvoiceDownload - 关闭发票下载弹窗
   */
  @Bind()
  hideInvoiceDownload() {
    this.setState(
      {
        modalVisible: false,
      },
      () => {
        this.downloadModal.closeSearch();
      }
    );
  }

  @Bind()
  bindRef(ref) {
    this.downloadModal = ref;
  }

  @Bind()
  linkDetail(invoiceHeaderId, taxCategory) {
    const { history } = this.props;
    if (taxCategory === 'WITH_GOODS') {
      history.push(`/sfin/invoice-sync/read-only-followGoodsDetail/${invoiceHeaderId}`);
    } else if (taxCategory === 'CENTRALIZED') {
      history.push(`/sfin/invoice-sync/read-only-centralized-detail/${invoiceHeaderId}`);
    } else {
      history.push(`/sfin/invoice-sync/detail/${invoiceHeaderId}`);
    }
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  handleRowSelect(record, selected, selectedRows) {
    const {
      dispatch,
      invoice: { list = {}, pagination = {}, syncCacheList = [] },
    } = this.props;
    const content = (list.sync && list.sync.content) || [];
    const index = content.findIndex((item) => item.invoiceHeaderId === record.invoiceHeaderId);
    let syncList = {};

    if (selected) {
      syncList = {
        ...list.sync,
        content: [
          ...content.slice(0, index),
          {
            ...record,
            _status: 'update',
          },
          ...content.slice(index + 1),
        ],
      };
    } else {
      const { _status, ...newRecord } = content[index];
      syncList = {
        ...list.sync,
        content: [
          ...content.slice(0, index),
          {
            ...newRecord,
          },
          ...content.slice(index + 1),
        ],
      };

      // 移除缓存的编辑数据
      const cacheIndex = syncCacheList.findIndex(
        (item) => item.invoiceHeaderId === record.invoiceHeaderId
      );
      if (cacheIndex !== -1) {
        const newSyncCacheList = [...syncCacheList];
        newSyncCacheList.splice(cacheIndex, 1);

        dispatch({
          type: 'invoice/updateState',
          payload: {
            syncCacheList: newSyncCacheList,
          },
        });
      }
    }

    dispatch({
      type: 'invoice/updateList',
      payload: {
        type: 'sync',
        list: syncList,
        pagination: pagination.sync,
      },
    });

    this.setState({ selectedRows });
  }

  @Bind()
  handleRowSelectAll(selected, selectedRows, changeRows) {
    const {
      dispatch,
      invoice: { list = {}, pagination = {}, syncCacheList = [] },
    } = this.props;
    const content = (list.sync && list.sync.content) || [];

    let syncList = [];
    let newSyncCacheList = [];
    if (selected) {
      syncList = {
        ...list.sync,
        content: content.map((item) => {
          const index = selectedRows.findIndex((e) => e.invoiceHeaderId === item.invoiceHeaderId);
          return index === -1
            ? item
            : {
                ...item,
                _status: 'update',
              };
        }),
      };
    } else {
      syncList = {
        ...list.sync,
        content: content.map((item) => {
          const index = changeRows.findIndex((e) => e.invoiceHeaderId === item.invoiceHeaderId);
          const { _status, ...newRecord } = item;
          return index === -1 ? item : newRecord;
        }),
      };
      newSyncCacheList = syncCacheList.filter(
        (item) => changeRows.findIndex((e) => e.invoiceHeaderId === item.invoiceHeaderId) !== -1
      );
    }
    dispatch({
      type: 'invoice/updateState',
      payload: {
        syncCacheList: newSyncCacheList,
      },
    });
    dispatch({
      type: 'invoice/updateList',
      payload: {
        type: 'sync',
        list: syncList,
        pagination: pagination.sync,
      },
    });

    this.setState({
      selectedRows,
    });
  }

  @Bind()
  tableChange(page = {}) {
    this.searchMiddleware();
    this.handleSearch(page);
  }

  /**
   * 可清空选中行数据的查询
   */
  @Bind()
  handleResetSearch() {
    const { dispatch } = this.props;

    this.setState(
      {
        selectedRows: [],
      },
      () => {
        this.handleSearch();
      }
    );

    dispatch({
      type: 'invoice/updateState',
      payload: {
        syncCacheList: [],
      },
    });
  }

  /**
   * hideOperationRecord - 打开录入物流信息弹框
   */
  @Bind()
  showModal(batch, record) {
    if (this.typeInModalRef) {
      this.setState({
        typeInModal: true,
      });
      const { dispatch } = this.props;
      if (!batch) {
        const { invoiceHeaderId } = record;
        this.typeInModalRef.record = [record];
        dispatch({
          type: 'invoice/queryLogisticsInfo',
          payload: {
            invoiceHeaderId,
          },
        }).then(this.typeInModalRef.init);
      } else {
        this.typeInModalRef.record = this.state.selectedRows;
      }
    }
  }

  /**
   * handleCloseModal 关闭 录入物流信息Modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      typeInModal: false,
    });
  }

  renderHeader() {
    const { loading, syncLoading } = this.props;
    const { selectedRows = [] } = this.state;
    return (
      <Header title={intl.get(`${promptCode}.view.message.title.invoice.sync`).d('同步应付发票')}>
        <Fragment>
          <Button
            icon="sync"
            type="primary"
            disabled={isEmpty(selectedRows)}
            loading={loading || syncLoading}
            onClick={this.syncInvoice}
          >
            {intl.get(`${promptCode}.view.button.sync`).d('同步')}
          </Button>
        </Fragment>
      </Header>
    );
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
        checkStatusList = [], // 查验状态集合
      },
      customizeFilterForm,
    } = this.props;
    const { sync } = expand;

    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
      style: {
        width: '100%',
      },
    };
    const dateFormat = getDateFormat();

    return customizeFilterForm(
      {
        code: 'SFIN.INVOICE.SYNC.LIST.FLITER',
        form,
        expand: sync,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.taxInvoiceNumber`)
                    .d('税务发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('taxInvoiceNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.syncStatus`).d('导入状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('syncStatus', {
                    initialValue: 'UNSYNCHRONIZED',
                  })(
                    <ValueList lovCode="SFIN.INVOICE_UNSYNC_STATUS" lazyLoad={false} allowClear />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand.sync ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.reviewedDateFrom`)
                    .d('复核日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('reviewedDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('reviewedDateTo') &&
                        moment(getFieldValue('reviewedDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.reviewedDateAt`).d('复核日期到')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('reviewedDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('reviewedDateFrom') &&
                        moment(getFieldValue('reviewedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SPFM.USER_AUTH.OU"
                      queryParams={
                        getFieldValue('companyId')
                          ? {
                              companyId: getFieldValue('companyId'),
                            }
                          : {}
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand.sync ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.supplierCompanyId`).d('供应商')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.company`).d('公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTHORITY_COMPANY" />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand.sync ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('validateStatusCode')(
                    <Select allowClear>
                      {checkStatusList.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand.sync
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  tableProps() {
    const { selectedRows = [] } = this.state;
    const {
      loading,
      invoice: { list = {}, pagination = {}, syncCacheList = [] },
    } = this.props;
    const info = intl.get(`sfin.invoiceBill.verify.createSuccess`).d('创建成功');
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        width: 170,
        dataIndex: 'invoiceNum',
        render: (value, record) => {
          const { invoiceHeaderId, taxCategory } = record;
          return <a onClick={() => this.linkDetail(invoiceHeaderId, taxCategory)}>{value}</a>;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.syncStatus`).d('导入状态'),
        width: 150,
        dataIndex: 'syncStatusMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.syncResponseMsg`).d('错误信息'),
        width: 150,
        dataIndex: 'syncResponseMsg',
        render: (text, record) =>
          record.syncResponseMsg === info ? '' : <span>{record.syncResponseMsg}</span>,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.syncRemark`).d('导入说明'),
        width: 150,
        dataIndex: 'syncRemark',
        render: (value, record) => {
          if (record._status) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('syncRemark', {
                  initialValue: value,
                })(<Input />)}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.accountingDate`).d('记账日期'),
        width: 150,
        dataIndex: 'accountingDate',
        render: (value, record) => {
          if (record._status) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('accountingDate', {
                  initialValue: value && moment(value),
                })(
                  <DatePicker
                    format={getDateTimeFormat()}
                    placeholder={null}
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  />
                )}
              </FormItem>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.company`).d('公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体'),
        width: 150,
        dataIndex: 'ouName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        width: 150,
        dataIndex: 'supplierNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        width: 150,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态'),
        width: 100,
        dataIndex: 'validateStatusCodeMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceLogis`).d('税务发票物流'),
        width: 150,
        dataIndex: 'taxInvoiceLogis',
        render: (_, record) => (
          <a onClick={() => this.showModal(false, record)}>
            {intl.get(`${promptCode}.operationalRecords`).d('物流信息查看')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        width: 150,
        dataIndex: 'supplierSiteName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNum`).d('税务发票号码'),
        width: 150,
        dataIndex: 'taxInvoiceNum',
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.taxIncludedAmountSystem`)
          .d('含税总额（系统）'),
        width: 150,
        align: 'right',
        dataIndex: 'taxIncludedAmountSystem',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmountSystem`).d('税额（系统）'),
        width: 150,
        align: 'right',
        dataIndex: 'taxAmountSystem',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceAmount`).d('发票总额'),
        width: 100,
        align: 'right',
        dataIndex: 'taxIncludedAmount',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceTaxAmount`).d('发票税额'),
        width: 100,
        align: 'right',
        dataIndex: 'taxAmount',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        width: 100,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatusMeaning`).d('发票状态'),
        width: 100,
        dataIndex: 'invoiceStatusMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.reviewName`).d('复核人'),
        width: 100,
        dataIndex: 'reviewName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.reviewedDate`).d('复核日期'),
        width: 150,
        dataIndex: 'reviewedDate',
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        dataIndex: 'recordOperation',
        render: (_, record) => (
          <a onClick={() => this.openOperationRecord(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceDownload`).d('发票下载'),
        dataIndex: 'invoiceDownload',
        width: 100,
        render: (_, record) =>
          record.taxCategory === 'CENTRALIZED' ? (
            <a onClick={() => this.openInvoiceDownload(record)}>
              {intl.get(`${promptCode}.view.message.invoiceDownloadList`).d('发票下载')}
            </a>
          ) : null,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);

    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.invoiceHeaderId),
      onSelect: this.handleRowSelect,
      onSelectAll: this.handleRowSelectAll,
    };

    const dataSource = ((list.sync && list.sync.content) || []).map((item) => {
      const index = syncCacheList.findIndex((e) => e.invoiceHeaderId === item.invoiceHeaderId);
      return index !== -1 ? syncCacheList[index] : item;
    });

    return {
      rowKey: 'invoiceHeaderId',
      columns,
      loading,
      rowSelection,
      dataSource,
      pagination: pagination.sync,
      onChange: this.tableChange,
      scroll: {
        x: scrollWidth,
      },
    };
  }

  renderOther() {
    const { dispatch } = this.props;
    const { recordModal, data, modalVisible, invoiceData, typeInModal } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const invoiceDownloadProps = {
      dispatch,
      visible: modalVisible,
      invoiceData,
      bindRef: this.bindRef,
      hideDownloadModal: this.hideInvoiceDownload.bind(this),
    };
    const typeInModalProps = {
      visible: typeInModal,
      onClose: this.handleCloseModal,
      onRef: (ref) => {
        this.typeInModalRef = ref;
      },
      editable: false,
    };
    return (
      <Fragment>
        <ActionHistory {...operationRecordProps} />
        <InvoiceDownloadList {...invoiceDownloadProps} />
        <TypeInModal {...typeInModalProps} />
      </Fragment>
    );
  }
}
