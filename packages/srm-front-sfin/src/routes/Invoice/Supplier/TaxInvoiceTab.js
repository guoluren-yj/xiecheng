/**
 * index.js - 应收发票汇总查询
 * @date: 2018-12-11
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';

import SearchPage from 'srm-front-boot/lib/components/SearchPage';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import { viewInvoiceDetail } from '../../utils';

const FormItem = Form.Item;
const promptCode = 'sfin.invoiceBill';

const hcuzCode = 'SFIN.INVOICE_SUPPLIER_LIST.TAX_LINE';
const filterCode = 'SFIN.INVOICE_SUPPLIER_LIST.TAX_FILTER';
@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'entity.company', 'entity.supplier', 'sfin.payment'],
})
@withCustomize({
  unitCode: [hcuzCode, filterCode],
})
export default class TaxInvoiceTab extends SearchPage {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
    };
    this.tableCode = hcuzCode;
  }

  componentDidMount() {
    const {
      invoice: { pagination },
    } = this.props;
    this.handleSearch(pagination.suppliertaxinvoice);
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
        const { billingDateFrom, billingDateTo } = values;
        return {
          ...values,
          billingDateFrom: billingDateFrom ? moment(billingDateFrom).format(DATETIME_MIN) : '',
          billingDateTo: billingDateTo ? moment(billingDateTo).format(DATETIME_MAX) : '',
          type: 'suppliertaxinvoice',
          customizeUnitCode: [hcuzCode, filterCode].join(),
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
        type: 'supplierTaxInvoiceTab',
        expand: !expand.supplierTaxInvoiceTab,
      },
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
    onSetSelectRows('taxInvoiceRows', selectedRows);
  }

  @Bind()
  handleRowSelectAll(selected, selectedRows) {
    const { onSetSelectRows } = this.props;
    this.setState({ selectedRows });
    onSetSelectRows('taxInvoiceRows', selectedRows);
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
      },
      customizeFilterForm,
    } = this.props;
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
        code: filterCode,
        form,
        expand: expand.supplierTaxInvoiceTab,
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
                  label={intl.get(`sfin.payment.taxInvoiceDateIssuedFrom`).d('开票日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('billingDateTo') &&
                        moment(getFieldValue('billingDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.taxInvoiceDateIssuedTo`).d('开票日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('billingDateFrom') &&
                        moment(getFieldValue('billingDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand.supplierTaxInvoiceTab ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sfin.payableInvoice.model.payableInvoice.taxationInvoiceCode`)
                    .d('税务发票代码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceCode')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceNum`)
                    .d('税务发票号码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceNumber')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.customer`).d('客户')}
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
              <Col span={8}>
                <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...formItemLayout}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.COMPANY_FOR_SUPPLIER"
                      textField="displayValue"
                      // queryParams={{ tenantId: getCurrentOrganizationId() }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { companyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(companyId) ? '' : companyId,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.dataSourceMeaning`)
                    .d('数据来源')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('inputTypeCode')(
                    <ValueList lovCode="SFIN.TAX_INVOICE_DATA_SOURCE" lazyLoad={false} allowClear />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand.supplierTaxInvoiceTab
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
      previewOcrFile,
    } = this.props;
    const { selectedRows = [] } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        width: 170,
        dataIndex: 'invoiceNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.customer`).d('客户'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        width: 150,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxationInvoiceCode`).d('税务发票代码'),
        width: 150,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNum`).d('税务发票号码'),
        width: 150,
        dataIndex: 'invoiceNumber',
      },
      {
        title: intl.get(`sfin.payment.taxInvoiceDateIssued`).d('开票日期'),
        width: 150,
        dataIndex: 'billingDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'totalAmount',
        align: 'right',
        width: 100,
        render: (text, record) => {
          return record.priceShieldFlag === 1 ? '***' : text;
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkCodeMeaning`).d('校验码'),
        dataIndex: 'checkCode',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purCompanyName`).d('购方名称'),
        dataIndex: 'purchaserCompanyName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purUnifiedSocialCode`).d('购方税号'),
        dataIndex: 'purUnifiedSocialCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierCompanyNames`).d('销方名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supUnifiedSocialCode`).d('销方税号'),
        dataIndex: 'supUnifiedSocialCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d('发票下载'),
        dataIndex: 'downloadInvoice',
        width: 100,
        // eslint-disable-next-line no-unused-vars
        render: (value, record) =>
          record.layoutFileUrl ? (
            <a href={record.layoutFileUrl}>
              {intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d('发票下载')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ocrFiles`).d('OCR识别文件'),
        dataIndex: 'uniSee',
        width: 120,
        render: (_, record) =>
          record.ocrFileUrl ? (
            <a onClick={() => previewOcrFile(record.ocrFileUrl)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ofdFile`).d('OFD文件'),
        dataIndex: 'ofdFile',
        width: 120,
        render: (_, record) => {
          const { jpgUrl, ofdFileUrl } = record;
          return (
            <span className="action-link">
              {ofdFileUrl && (
                <a onClick={() => previewOcrFile(ofdFileUrl)}>
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
              {jpgUrl && (
                <a onClick={() => previewOcrFile(jpgUrl)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              )}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.dataSourceMeaning`).d('数据来源'),
        dataIndex: 'inputTypeCodeMeaning',
        width: 140,
      },
      {
        title: intl.get(`sfin.common.model.common.invoiceView`).d('发票查看'),
        dataIndex: 'invoiceView',
        width: 120,
        render: (_, record) => {
          const { taxInvoiceLineId: invoiceHeaderId } = record;
          return (
            <a onClick={() => viewInvoiceDetail({ invoiceHeaderId, docType: 'taxInvoice' })}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          );
        },
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.taxInvoiceLineId),
      onSelect: this.handleRowSelect,
      onSelectAll: this.handleRowSelectAll,
    };
    return {
      rowKey: 'taxInvoiceLineId',
      columns,
      loading,
      rowSelection,
      dataSource: list.suppliertaxinvoice && list.suppliertaxinvoice.content,
      pagination: pagination.suppliertaxinvoice,
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
}
