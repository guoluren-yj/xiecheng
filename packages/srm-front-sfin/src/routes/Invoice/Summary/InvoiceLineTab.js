import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isNil } from 'lodash';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  DATETIME_MIN,
  DATETIME_MAX,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
import ValueList from 'hzero-front/lib/components/ValueList';
import LovMulti from '@/routes/components/MultipleLov';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const FormItem = Form.Item;
const promptCode = 'sfin.invoiceBill';

@connect(({ invoice, loading }) => ({
  invoice,
  organizationId: getCurrentOrganizationId(),
  loading: loading.effects['invoice/queryList'],
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'entity.company', 'entity.supplier', 'sfin.payment', 'entity.item'],
})
@withCustomize({
  unitCode: ['SFIN.INVOICE_SUMMARY_LIST.LINE', 'SFIN.INVOICE_SUMMARY_LIST.INVOICE_FILTER'],
})
@Form.create({ fieldNameProp: null })
export default class InvoiceLineTab extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
    };
  }

  componentDidMount() {
    const {
      invoice: { pagination },
      custLoading,
    } = this.props;
    if (!custLoading) {
      this.handleSearch(pagination.summaryInvoice);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'summaryInvoice',
      },
    });
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      invoice: { pagination },
    } = this.props;
    if (prevProps.custLoading && custLoading !== prevProps.custLoading) {
      this.handleSearch(pagination.summaryInvoice);
    }
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form, clearRows } = this.props;
    const values = form.getFieldsValue();
    const {
      trxDateFrom,
      trxDateTo,
      reviewedDateFrom,
      reviewedDateTo,
      approvedDateFrom,
      approvedDateTo,
    } = values;
    dispatch({
      type: 'invoice/queryList',
      payload: {
        page,
        ...values,
        type: 'summaryInvoice',
        trxDateFrom: trxDateFrom ? moment(trxDateFrom).format(DATETIME_MIN) : '',
        trxDateTo: trxDateTo ? moment(trxDateTo).format(DATETIME_MAX) : '',
        reviewedDateFrom: reviewedDateFrom ? moment(reviewedDateFrom).format(DATETIME_MIN) : '',
        reviewedDateTo: reviewedDateTo ? moment(reviewedDateTo).format(DATETIME_MAX) : '',
        approvedDateFrom: approvedDateFrom ? moment(approvedDateFrom).format(DATETIME_MIN) : '',
        approvedDateTo: approvedDateTo ? moment(approvedDateTo).format(DATETIME_MAX) : '',
        customizeUnitCode:
          'SFIN.INVOICE_SUMMARY_LIST.LINE,SFIN.INVOICE_SUMMARY_LIST.INVOICE_FILTER',
      },
    });
    clearRows();
  }

  /**
   * 重置查询表单.
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  render() {
    const {
      form,
      selectedRows,
      handleRowSelect,
      invoice: { list = {}, pagination = {} },
      organizationId,
      loading,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { expand } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const dateFormat = getDateFormat();
    const selectedRowKeys = selectedRows.map((item) => item.invoiceLineId);
    const rowSelection = {
      selectedRowKeys,
      onChange: handleRowSelect,
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        dataIndex: 'invoiceNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.erpInvoiceNum`).d('ERP发票号'),
        dataIndex: 'erpInvoiceNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
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
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceLineNum`).d('发票行'),
        dataIndex: 'invoiceLineNum',
        width: 180,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemDesc`).d('供应商料号描述'),
        dataIndex: 'supplierItemDesc',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.chartCode`).d('图号'),
        dataIndex: 'chartCode',
        width: 120,
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.uomName`).d('单位')}`,
        dataIndex: 'uomName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.orignNetPrice`).d('不含税单价'),
        dataIndex: 'orignNetPrice',
        align: 'right',
        width: 150,
        render: (text, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorDJ(text, record.pricePrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        width: 120,
        render: (text, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(text, record.amountPrecision);
        },
      },
      {
        title: `${intl.get(`${promptCode}.model.invoiceBill.taxRate`).d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        width: 150,
        render: (text, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorDJ(text, record.pricePrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 150,
        render: (text, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(text, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        // width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.costName`).d('成本中心'),
        dataIndex: 'costName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.wbs`).d('WBS元素'),
        dataIndex: 'wbs',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        // width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.billNumAndBillLineNum`).d('对账单号|行号'),
        dataIndex: 'billNumAndBillLineNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.approvedDate`).d('审核日期'),
        dataIndex: 'approvedDate',
        // width: 140,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.reviewedDate`).d('复核日期'),
        dataIndex: 'reviewedDate',
        width: 150,
        render: dateRender,
      },
    ];

    const tableProps = {
      loading,
      dataSource: list.summaryInvoice && list.summaryInvoice.content,
      columns,
      rowSelection,
      bordered: true,
      rowKey: 'invoiceLineId',
      onChange: this.handleSearch,
      pagination: pagination.summaryInvoice,
      // scroll: { x: sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 250 },
    };
    return (
      <Fragment>
        {customizeFilterForm(
          {
            code: 'SFIN.INVOICE_SUMMARY_LIST.INVOICE_FILTER',
            form,
            expand,
          },
          <Form layout="inline" className="more-fields-search-form">
            <Row gutter={12}>
              <Col span={18}>
                <Row {...SEARCH_FORM_ROW_LAYOUT}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('invoiceNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('invoiceNumRightMatch')(
                        <Input style={{ width: '100%' }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get('entity.company.tag').d('公司')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('companyId')(
                        <Lov
                          code="SPFM.USER_AUTH.COMPANY"
                          queryParams={{ organizationId: getUserOrganizationId() }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
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
                </Row>
                {/* 以下为隐藏选项 */}
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expand ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.itemId`).d('物料')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('itemId')(
                        <Lov code="SMDM.CUSTOMER_ITEM" queryParams={{ organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.displayBillNum`)
                        .d('对账单号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayBillNum')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.displayBillNum`)
                        .d('对账单号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayBillNumRightMatch')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.erpInvoiceNum`)
                        .d('ERP发票号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('erpInvoiceNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.erpInvoiceNum`)
                        .d('ERP发票号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('erpInvoiceNumRightMatch')(
                        <Input style={{ width: '100%' }} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expand ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.orderNum`).d('订单号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayPoNum')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.orderNum`).d('订单号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayPoNumRightMatch')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.displayTrxNum`)
                        .d('事务编号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayTrxNum')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.displayTrxNum`)
                        .d('事务编号')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('displayTrxNumRightMatch')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.wbsCode`).d('WBS元素')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('wbsCode')(
                        <Lov code="SMDM.PURCHASE_WBS" queryParams={{ tenantId: organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expand ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.costId`).d('成本中心')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('costCode')(
                        <Lov code="SBUD.COST_CENTER" queryParams={{ tenantId: organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.inventoryId`).d('库房')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('inventoryId')(<Lov code="SODR.INVENTORY" />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.trxDateFrom`)
                        .d('事务日期从')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('trxDateFrom')(
                        <DatePicker
                          format={dateFormat}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('trxDateTo') &&
                            moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expand ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.affairDateTo`)
                        .d('事务日期至')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('trxDateTo')(
                        <DatePicker
                          format={dateFormat}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('trxDateFrom') &&
                            moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.approvedDateFrom`)
                        .d('审核日期从')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('approvedDateFrom')(
                        <DatePicker
                          format={dateFormat}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('approvedDateTo') &&
                            moment(getFieldValue('approvedDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.approvedDateTo`)
                        .d('审核日期至')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('approvedDateTo')(
                        <DatePicker
                          format={dateFormat}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('approvedDateFrom') &&
                            moment(getFieldValue('approvedDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expand ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.reviewedDateFrom`)
                        .d('复核日期从')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
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
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.reviewedDateTo`)
                        .d('复核日期至')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
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
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.invoiceBill.businessType`).d('业务类别')}
                      {...SEARCH_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('businessType', {
                        initialValue: 'STANDARD',
                      })(<ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('sfin.invoiceBill.model.invoiceBill.purAgentName')
                        .d('采购员')}
                    >
                      {getFieldDecorator('purchaseAgentIds')(
                        <LovMulti
                          code="SPUC.PURCHASE_AGENT_NOUSER"
                          queryParams={{ tenantId: organizationId }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...SEARCH_FORM_ITEM_LAYOUT}
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
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`${promptCode}.model.invoiceBill.filter.specifications`)
                        .d('规格')}
                    >
                      {getFieldDecorator('specifications')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get(`${promptCode}.model.invoiceBill.filter.model`).d('型号')}
                    >
                      {getFieldDecorator('model')(<Input />)}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {expand
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get(`hzero.common.button.reset`).d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.handleSearch()}
                  >
                    {intl.get(`hzero.common.button.search`).d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
        {customizeTable(
          {
            code: 'SFIN.INVOICE_SUMMARY_LIST.LINE', // 单元编码，必传
          },
          <EditTable {...tableProps} />
        )}
      </Fragment>
    );
  }
}
