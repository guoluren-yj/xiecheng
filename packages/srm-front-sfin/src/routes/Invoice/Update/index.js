/**
 * index.js - 非寄销发票维护查询
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
import SearchPage from 'srm-front-boot/lib/components/SearchPage';
import { Header } from 'components/Page';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { thousandBitSeparator } from '@/routes/utils';
import ActionHistory from '../Components/ActionHistory';

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
  unitCode: ['SFIN.INVOICE_UPDATE_LIST.GRID', 'SFIN.INVOICE_UPDATE_LIST.FILTER'],
})
export default class Update extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      recordModal: false,
    };
    this.tableCode = 'SFIN.INVOICE_UPDATE_LIST.GRID';
  }

  componentDidMount() {
    const {
      invoice: { pagination },
    } = this.props;
    this.handleSearch(pagination);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'update',
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
      cacheKey: '/sfin/invoice-update/list',
      paramsFilter: (values) => {
        const { creationDateFrom, creationDateTo } = values;
        return {
          ...values,
          creationDateFrom: creationDateFrom ? moment(creationDateFrom).format(DATETIME_MIN) : '',
          creationDateTo: creationDateTo ? moment(creationDateTo).format(DATETIME_MAX) : '',
          type: 'update',
          customizeUnitCode: 'SFIN.INVOICE_UPDATE_LIST.GRID,SFIN.INVOICE_UPDATE_LIST.FILTER',
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
        type: 'update',
        expand: !expand.update,
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

  @Bind()
  linkDetail(invoiceHeaderId) {
    const { history } = this.props;
    history.push(`/sfin/invoice-update/detail/${invoiceHeaderId}`);
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  renderHeader() {
    return (
      <Header title={intl.get(`${promptCode}.view.maintainShouldPayInvoice`).d('维护应收发票')} />
    );
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
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
        code: 'SFIN.INVOICE_UPDATE_LIST.FILTER',
        form,
        expand: expand.update,
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
                <FormItem label={intl.get('hzero.common.status').d('状态')} {...formItemLayout}>
                  {getFieldDecorator('invoiceStatus')(
                    <Select allowClear>
                      <Option value="NEW">
                        {intl.get('sfin.invoiceBill.model.invoiceBill.create').d('新建')}
                      </Option>
                      <Option value="RETURN_TO_VENDOR">
                        {intl
                          .get('sfin.invoiceBill.model.invoiceBill.returnSupplier')
                          .d('退回至供应商')}
                      </Option>
                    </Select>
                  )}
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
            <Row style={{ display: expand.update ? 'block' : 'none' }}>
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
                {expand.update
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => this.handleSearch()}>
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
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        width: 170,
        dataIndex: 'invoiceNum',
        render: (value, record) => {
          const { invoiceHeaderId } = record;
          return <a onClick={() => this.linkDetail(invoiceHeaderId)}>{value}</a>;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
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
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceAmount`).d('发票总额'),
        width: 100,
        align: 'right',
        dataIndex: 'taxIncludedAmount',
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
          // const { priceShieldFlag } = record;
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNumber`).d('税务发票号'),
        width: 120,
        dataIndex: 'taxInvoiceNum',
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
        width: 150,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        width: 150,
        dataIndex: 'supplierSiteName',
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
        render: (_, record) => (
          <a onClick={() => this.openOperationRecord(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return {
      rowKey: 'invoiceHeaderId',
      columns,
      loading,
      rowSelection: null,
      dataSource: list.update && list.update.content,
      pagination: pagination.update,
      scroll: {
        x: scrollWidth,
      },
    };
  }

  renderOther() {
    const { dispatch } = this.props;
    const { recordModal, data } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
    };
    return <ActionHistory {...operationRecordProps} />;
  }
}
