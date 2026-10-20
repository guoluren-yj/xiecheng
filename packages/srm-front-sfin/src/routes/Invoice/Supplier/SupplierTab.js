/**
 * index.js - 应收发票汇总查询
 * @date: 2018-12-11
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';

import SearchPage from 'srm-front-boot/lib/components/SearchPage';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import {
  getCurrentOrganizationId,
  getDateFormat,
  getUserOrganizationId,
  // getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { thousandBitSeparator } from '@/routes/utils';

import ActionHistory from '../Components/ActionHistory';
import TypeInModal from '../Components/TypeInModal';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'sfin.invoiceBill';

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@withCustomize({
  unitCode: ['SFIN.INVOICE_SUPPLIER_LIST.FILTER', 'SFIN.INVOICE_SUPPLIER_LIST.GRID'],
})
export default class Supplier extends SearchPage {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      recordModal: false,
      typeInModal: false,
      selectedRows: [],
    };
    this.tableCode = 'SFIN.INVOICE_SUPPLIER_LIST.GRID';
  }

  componentDidMount() {
    const {
      invoice: { pagination },
    } = this.props;
    this.fetchRcvInvoiceStatus();
    this.fetchCheckStatusList();
    this.handleSearch(pagination.supplier);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'supplier',
      },
    });
  }

  @Bind()
  pageConfig() {
    return {
      modelName: 'invoice',
      dataName: 'list',
      customSearch: true,
      searchDispatch: 'invoice/queryList',
      cacheKey: '/sfin/invoice-supplier/list',
      paramsFilter: (values) => {
        const { creationDateFrom, creationDateTo, reviewedDateFrom, reviewedDateTo } = values;
        return {
          ...values,
          creationDateFrom: creationDateFrom ? moment(creationDateFrom).format(DATETIME_MIN) : '',
          creationDateTo: creationDateTo ? moment(creationDateTo).format(DATETIME_MAX) : '',
          reviewedDateFrom: reviewedDateFrom ? moment(reviewedDateFrom).format(DATETIME_MIN) : '',
          reviewedDateTo: reviewedDateTo ? moment(reviewedDateTo).format(DATETIME_MAX) : '',
          type: 'supplier',
          customizeUnitCode: 'SFIN.INVOICE_SUPPLIER_LIST.FILTER,SFIN.INVOICE_SUPPLIER_LIST.GRID',
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
        type: 'supplier',
        expand: !expand.supplier,
      },
    });
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

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  linkDetail(record) {
    const { history } = this.props;
    const { invoiceHeaderId, taxCategory, businessType } = record;
    // const { realName } = getCurrentUser();
    // if (
    //   (invoiceStatus === 'NEW' || invoiceStatus === 'RETURN_TO_VENDOR') &&
    //   createName === realName
    // ) {
    //   const supplierType = 'supplier';
    //   history.push(`/sfin/invoice-supplier/detail/${supplierType}/${invoiceHeaderId}`);
    // } else
    if (taxCategory === 'WITH_GOODS') {
      history.push(`/sfin/invoice-supplier/read-only-followGoodsDetail/${invoiceHeaderId}`);
    } else if (taxCategory === 'CENTRALIZED') {
      history.push(
        `/sfin/invoice-supplier/read-only-centralized-detail/${invoiceHeaderId}?businessType=${businessType}`
      );
    } else {
      history.push(`/sfin/invoice-supplier/detail/${invoiceHeaderId}`);
    }
  }

  /**
   * 获取发票状态值级
   */
  @Bind()
  fetchRcvInvoiceStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/fetchRcvInvoiceStatus',
    });
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

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  handleRowSelect(record, selected, selectedRows) {
    const { onSetSelectRows } = this.props;
    this.setState({ selectedRows });
    onSetSelectRows('selectedRows', selectedRows);
  }

  @Bind()
  handleRowSelectAll(selected, selectedRows) {
    const { onSetSelectRows } = this.props;
    this.setState({ selectedRows });
    onSetSelectRows('selectedRows', selectedRows);
  }

  @Bind()
  handleRowSelectedChange(key) {
    const { handleRowSelectedChange } = this.props;
    handleRowSelectedChange(key);
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
        invoiceRcvStatusSelect = [], // 发票状态值级
        checkStatusList = [], // 查验状态集合
      },
      customizeFilterForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
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
        code: 'SFIN.INVOICE_SUPPLIER_LIST.FILTER',
        form,
        expand: expand.supplier,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
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
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceNumRightMatch')(<Input style={{ width: '100%' }} />)}
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
                  label={intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.CUSTOMER"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand.supplier ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.invoiceStatusMeaning`)
                    .d('发票状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceStatus')(
                    <Select allowClear>
                      {invoiceRcvStatusSelect.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNumRightMatch')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      disabled={!getFieldValue('companyId')}
                      style={{ width: '100%' }}
                      code="HPFM.OU"
                      textField="ouName"
                      queryParams={{
                        organizationId: getCurrentOrganizationId(),
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.creationDateFrom`)
                    .d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.creationDateAt`).d('创建日期到')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayTrxNum`).d('事务编号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayTrxNumRightMatch')(
                    <Input style={{ width: '100%' }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayTrxNum`).d('事务编号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayTrxNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
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
                {expand.supplier
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => {
                  this.handleSearch();
                  this.setState({
                    selectedRows: [],
                  });
                }}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  tableProps() {
    const {
      loading,
      invoice: { list = {}, pagination = {} },
    } = this.props;
    const { selectedRows = [] } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        width: 170,
        dataIndex: 'invoiceNum',
        render: (value, record) => {
          return <a onClick={() => this.linkDetail(record)}>{value}</a>;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`).d('ERP发票号'),
        dataIndex: 'erpInvoiceNum',
        width: 120,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatusMeaning`).d('发票状态'),
        width: 150,
        dataIndex: 'invoiceStatusMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.companyName`).d('客户公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体'),
        width: 150,
        dataIndex: 'ouName',
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
          // const { priceShieldFlag } = record;
          return record.priceShieldFlag === 1
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
          // const { priceShieldFlag } = record;
          return record.priceShieldFlag === 1
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
          return record.priceShieldFlag === 1
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
          return record.priceShieldFlag === 1
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
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        width: 150,
        dataIndex: 'supplierNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        width: 150,
        dataIndex: 'supplierSiteName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.inspectionStatus`).d('查验状态'),
        width: 150,
        dataIndex: 'validateStatusCodeMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceLogis`).d('税务发票物流'),
        dataIndex: 'taxInvoiceLogis',
        width: 150,
        render: (_, record) => (
          <a onClick={() => this.showModal(false, record)}>
            {intl.get(`${promptCode}.title.LogisticsInforInput`).d('物流信息录入')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.createName`).d('创建人'),
        width: 100,
        dataIndex: 'createName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.creationDate`).d('创建日期'),
        width: 150,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        dataIndex: 'recordOperation',
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.erpPaymentNum`).d('ERP付款单号'),
        width: 150,
        dataIndex: 'erpPaymentNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.totalPaymentAmount`).d('累计付款金额'),
        width: 150,
        dataIndex: 'totalPaymentAmount',
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.invoiceHeaderId),
      onSelect: this.handleRowSelect,
      onSelectAll: this.handleRowSelectAll,
      onChange: this.handleRowSelectedChange,
    };
    return {
      rowKey: 'invoiceHeaderId',
      columns,
      loading,
      rowSelection,
      dataSource: list.supplier && list.supplier.content,
      pagination: pagination.supplier,
      scroll: {
        x: scrollWidth,
      },
    };
  }

  renderHeader() {
    return null;
  }

  contentProps() {
    return {
      style: {
        margin: 0,
      },
    };
  }

  renderOther() {
    const {
      dispatch,
      invoice: { pagination },
    } = this.props;
    const { recordModal, data, typeInModal } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
      showRejected: true,
    };
    const typeInModalProps = {
      visible: typeInModal,
      onClose: this.handleCloseModal,
      onRef: (ref) => {
        this.typeInModalRef = ref;
      },
      pagination,
      handleSearch: this.handleSearch,
      clearSelectedRows: () =>
        this.setState({
          selectedRows: [],
        }),
      editable: true,
    };
    return (
      <React.Fragment>
        <ActionHistory {...operationRecordProps} />
        <TypeInModal {...typeInModalProps} />
      </React.Fragment>
    );
  }
}
