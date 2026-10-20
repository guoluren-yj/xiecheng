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

import SearchPage from 'srm-front-boot/lib/components/SearchPage';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import LovMulti from '@/routes/components/MultipleLov';
import ValueList from 'components/ValueList';
import { thousandBitSeparator } from '@/routes/utils';
import { viewInvoiceDetail } from '../../utils';

const FormItem = Form.Item;
const promptCode = 'sfin.invoiceBill';
const hcuzCode = 'SFIN.INVOICE_SUMMARY_LIST.TAX_LINE';
const filterCode = 'SFIN.INVOICE_SUMMARY_LIST.TAX_FILTER';

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
    this.tableCode = `SFIN.INVOICE_SUMMARY_LIST.TAX_LINE`;
  }

  componentDidMount() {
    const {
      invoice: { pagination },
      custLoading,
    } = this.props;
    if(!custLoading) {
      this.handleSearch(pagination.summarytaxinvoice);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'summarytaxinvoice',
      },
    });
  }

  componentDidUpdate(prevProps) {
    const { custLoading, invoice: { pagination } } = this.props;
    if (prevProps.custLoading && custLoading !== prevProps.custLoading) {
      this.handleSearch(pagination.summarytaxinvoice);
    }
  }

  @Bind()
  pageConfig() {
    return {
      modelName: 'invoice',
      dataName: 'list',
      customSearch: true,
      searchDispatch: 'invoice/queryList',
      cacheKey: '/sfin/invoice-summary/list',
      paramsFilter: (values) => {
        const { billingDateFrom, billingDateTo } = values;
        return {
          ...values,
          billingDateFrom: billingDateFrom ? moment(billingDateFrom).format(DATETIME_MIN) : '',
          billingDateTo: billingDateTo ? moment(billingDateTo).format(DATETIME_MAX) : '',
          type: 'summarytaxinvoice',
          customizeUnitCode:
            'SFIN.INVOICE_SUMMARY_LIST.TAX_LINE,SFIN.INVOICE_SUMMARY_LIST.TAX_FILTER',
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
        type: 'summarytaxinvoice',
        expand: !expand.summarytaxinvoice,
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
    onSetSelectRows(selectedRows);
  }

  @Bind()
  handleRowSelectAll(selected, selectedRows) {
    const { onSetSelectRows } = this.props;
    this.setState({ selectedRows });
    onSetSelectRows(selectedRows);
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
      },
      organizationId,
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
        expand: expand.summarytaxinvoice,
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
            <Row style={{ display: expand.summarytaxinvoice ? 'block' : 'none' }}>
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
                <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...formItemLayout}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`entity.supplier.tag`).d('供应商')} {...formItemLayout}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId: organizationId }}
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
                  {...formItemLayout}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMulti
                      code="SPUC.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName')
                    .d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationIds')(
                    <LovMulti
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
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
                {expand.summarytaxinvoice
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
        title: intl.get(`entity.companyName.tag`).d('公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        width: 150,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceCode`).d('税务发票代码'),
        width: 150,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNum`).d('税务发票号码'),
        width: 150,
        dataIndex: 'invoiceNumber',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.billingDate`).d('开票日期'),
        width: 150,
        dataIndex: 'billingDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'totalAmount',
        align: 'right',
        width: 120,
        render: (text, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(text, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkCodeMeaning`).d('校验码'),
        dataIndex: 'checkCode',
        align: 'right',
        width: 120,
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
              {intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d(record.invoiceFileUrl)}
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
      dataSource: list.summarytaxinvoice && list.summarytaxinvoice.content,
      pagination: pagination.summarytaxinvoice,
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
