/**
 * index.js - 应付发票汇总查询
 * @date: 2018-12-11
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';

import SearchPage from 'srm-front-boot/lib/components/SearchPage';
// import ExcelExport from 'components/ExcelExport';
// import { Header } from 'components/Page';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
// import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import LovMulti from '@/routes/components/MultipleLov';
import ActionHistory from '../Components/ActionHistory';
import InvoiceDownloadList from '../Components/InvoiceDownloadList';
import TypeInModal from '../Components/TypeInModal';
import { thousandBitSeparator } from '@/routes/utils';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'sfin.invoiceBill';

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'sfin.payableInvoice'],
})
@withCustomize({
  unitCode: ['SFIN.INVOICE_SUMMARY_LIST.FILTER', 'SFIN.INVOICE_SUMMARY_LIST.GRID'],
})
export default class Summary extends SearchPage {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = { recordModal: false, modalVisible: false };
    this.tableCode = 'SFIN.INVOICE_SUMMARY_LIST.GRID';
  }

  componentDidMount() {
    const {
      invoice: { pagination },
      custLoading,
    } = this.props;
    this.fetchInvoiceStatus();
    if (!custLoading) {
      this.handleSearch(pagination.summary);
    }
    this.fetchCheckStatusList();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'summary',
      },
    });
    dispatch({
      type: 'invoice/updateSelectedInfo',
      payload: {
        type: 'summary',
        selectedRows: [],
        selectedRowKeys: [],
      },
    });
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      invoice: { pagination },
    } = this.props;
    if (prevProps.custLoading && custLoading !== prevProps.custLoading) {
      this.handleSearch(pagination.summary);
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
        const { submitDateFrom, submitDateTo, approvedDateFrom, approvedDateTo } = values;
        return {
          ...values,
          submitDateFrom: submitDateFrom ? moment(submitDateFrom).format(DATETIME_MIN) : '',
          submitDateTo: submitDateTo ? moment(submitDateTo).format(DATETIME_MAX) : '',
          approvedDateFrom: approvedDateFrom ? moment(approvedDateFrom).format(DATETIME_MIN) : '',
          approvedDateTo: approvedDateTo ? moment(approvedDateTo).format(DATETIME_MAX) : '',
          type: 'summary',
          customizeUnitCode: 'SFIN.INVOICE_SUMMARY_LIST.FILTER,SFIN.INVOICE_SUMMARY_LIST.GRID',
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
        type: 'summary',
        expand: !expand.summary,
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
      history.push(`/sfin/invoice-summary/read-only-followGoodsDetail/${invoiceHeaderId}`);
    } else if (taxCategory === 'CENTRALIZED') {
      history.push(
        `/sfin/invoice-summary/read-only-centralized-detail/${invoiceHeaderId}?ecSource=myPayment`
      );
    } else {
      history.push(`/sfin/invoice-summary/detail/${invoiceHeaderId}`);
    }
  }

  /**
   * 获取发票状态值级
   */
  @Bind()
  fetchInvoiceStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/fetchFilterInvoiceStatus',
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
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

  /**
   * 我的应付发票-Tab勾选事件
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  handleSummaryTabSelect(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateSelectedInfo',
      payload: {
        type: 'summary',
        selectedRows,
        selectedRowKeys,
      },
    });
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
        invoiceStatusSelect = [], // 发票状态值级
        checkStatusList = [], // 查验状态集合
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
        code: 'SFIN.INVOICE_SUMMARY_LIST.FILTER',
        form,
        expand: expand.summary,
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
                    .get(`${promptCode}.model.invoiceBill.taxInvoiceNum`)
                    .d('税务发票号码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('taxInvoiceNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.supplierCompanyId`).d('供应商')}
                  {...formItemLayout}
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
            <Row style={{ display: expand.summary ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.invoiceStatusMeaning`)
                    .d('发票状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceStatus')(
                    <Select allowClear>
                      {invoiceStatusSelect.map((item) => (
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
                  label={intl.get(`${promptCode}.model.invoiceBill.syncStatus`).d('导入状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('syncStatus')(
                    <ValueList lovCode="SFIN.INVOICE_SYNC_STATUS" lazyLoad={false} allowClear />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.erpInvoiceNum`).d('ERP发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('erpInvoiceNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNumRightMatch')(<Input style={{ width: '100%' }} />)}
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
                  label={intl.get(`${promptCode}.model.invoiceBill.company`).d('公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTHORITY_COMPANY" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.submitDateFrom`).d('提交日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('submitDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('submitDateTo') &&
                        moment(getFieldValue('submitDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.submitDateAt`).d('提交日期到')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('submitDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('submitDateFrom') &&
                        moment(getFieldValue('submitDateFrom')).isAfter(currentDate, 'day')
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
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.approvedDateFrom`)
                    .d('审核日期从')}
                  {...formItemLayout}
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
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.approvedDateAt`).d('审核日期到')}
                  {...formItemLayout}
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
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggle}>
                {expand.summary
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={() => this.handleSearch()}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  tableProps() {
    const {
      loading,
      invoice: { list = {}, pagination = {}, selectedInfo },
    } = this.props;
    const { selectedRowKeys } = selectedInfo.summary;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSummaryTabSelect,
    };
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
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatusMeaning`).d('发票状态'),
        width: 150,
        dataIndex: 'invoiceStatusMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.syncStatus`).d('导入状态'),
        width: 150,
        dataIndex: 'syncStatusMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.erpInvoiceNum`).d('ERP发票号'),
        width: 150,
        dataIndex: 'erpInvoiceNum',
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
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
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
        title: intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态'),
        width: 100,
        dataIndex: 'validateStatusCodeMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceLogis`).d('税务发票物流'),
        dataIndex: 'taxInvoiceLogis',
        width: 150,
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
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNumber`).d('税务发票号'),
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
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        width: 100,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.submittedDate`).d('提交日期'),
        width: 150,
        dataIndex: 'submittedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.approvedDate`).d('审核日期'),
        width: 150,
        dataIndex: 'approvedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.syncDate`).d('导入日期'),
        width: 150,
        dataIndex: 'syncDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceDownload`).d('发票下载'),
        dataIndex: 'invoiceDownload',
        width: 100,
        render: (_, record) =>
          record.invoiceStatus === 'REVIEWED' && record.taxCategory === 'CENTRALIZED' ? (
            <a onClick={() => this.openInvoiceDownload(record)}>
              {intl.get(`${promptCode}.model.invoiceBill.invoiceDownload`).d('发票下载')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'recordOperation',
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return {
      rowKey: 'invoiceHeaderId',
      columns,
      loading,
      rowSelection,
      dataSource: list.summary && list.summary.content,
      pagination: pagination.summary,
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
    const { dispatch } = this.props;
    const { recordModal, data, modalVisible, invoiceData, typeInModal } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
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
