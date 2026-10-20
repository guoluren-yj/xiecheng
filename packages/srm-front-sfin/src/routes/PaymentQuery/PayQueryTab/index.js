import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import EditTable from 'components/EditTable';
import { dateTimeRender, dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils';
import ActionHistory from '../../PaymentApprove/Compontent/ActionHistory';

const FormItem = Form.Item;
const { Option } = Select;
// @withCustomize({
//   unitCode: ['SFIN.PAY_QUERY_LIST.FILTER'],
// })
@connect(({ payQuery, loading }) => ({
  payQuery,
  organizationId: getCurrentOrganizationId(),
  loading: loading.effects['payQuery/queryList'],
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'entity.company', 'entity.supplier', 'sfin.payment'],
})
@withCustomize({
  unitCode: ['SFIN.PAY_QUERY_LIST.FILTER', 'SFIN.PAY_QUERY_LIST.GRID'],
})
@Form.create({ fieldNameProp: null })
export default class PayQueryTab extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expend: false,
      data: {},
    };
  }

  componentDidMount() {
    const {
      payQuery: { pagination },
    } = this.props;
    // console.log(11, this.props, pagination.payQuery);
    this.handleSearch(pagination.payQuery);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payQuery/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'payQuery',
      },
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const {
          creationDateStart,
          creationDateEnd,
          paymentStatus,
          actualPaymentDateStart,
          actualPaymentDateEnd,
        } = values;
        dispatch({
          type: 'payQuery/queryList',
          payload: {
            page,
            ...values,
            type: 'payQuery',
            customizeUnitCode: 'SFIN.PAY_QUERY_LIST.FILTER,SFIN.PAY_QUERY_LIST.GRID',
            creationDateStart: creationDateStart && moment(creationDateStart).format(DATETIME_MIN),
            creationDateEnd: creationDateEnd && moment(creationDateEnd).format(DATETIME_MAX),
            actualPaymentDateStart:
              actualPaymentDateStart && moment(actualPaymentDateStart).format(DATETIME_MIN),
            actualPaymentDateEnd:
              actualPaymentDateEnd && moment(actualPaymentDateEnd).format(DATETIME_MAX),
            paymentHeaderStatus: paymentStatus ? [paymentStatus] : undefined,
          },
        });
      }
    });
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
    const { expend } = this.state;
    this.setState({
      expend: !expend,
    });
  }

  @Bind()
  toDetail(record) {
    const { history } = this.props;
    if (record.paymentTypeCode === 'GENERAL_PAYMENT') {
      history.push(`/sfin/pay-query/detail/${record.paymentHeaderId}`);
    } else {
      history.push(`/sfin/pay-query/advance/detail/${record.paymentHeaderId}`);
    }
  }

  @Bind()
  handleInvoiceDetail(record) {
    this.setState({
      visible: true,
      data: record,
    });
  }

  @Bind()
  hideModal(type, status) {
    this.setState({ [type]: status });
  }

  render() {
    const {
      form,
      rowSelection,
      payQuery: {
        list = {},
        pagination = {},
        code: { sourceList = [], sourceStatus = [], exportStatus = [] },
      },
      organizationId,
      loading,
      customizeFilterForm,
      customizeTable,
    } = this.props;
    const { expend, visible, data } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
    };
    const dateFormat = getDateFormat();
    const columns = [
      {
        title: intl.get(`sfin.payment.common.payStatusMeaning`).d('申请单状态'),
        width: 100,
        dataIndex: 'paymentStatusMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.payApproveNo`).d('付款申请单号'),
        width: 150,
        dataIndex: 'paymentNum',
        render: (val, record) => <a onClick={() => this.toDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`sfin.payment.common.type`).d('类型'),
        width: 120,
        dataIndex: 'paymentTypeCodeMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.displayPoNum`).d('关联单据单号'),
        width: 160,
        dataIndex: 'displayPoNum',
      },
      {
        title: intl
          .get(`sfin.paymentRecord.view.message.model.paymentRecord.erpPaymentNum`)
          .d('ERP付款单号'),
        width: 120,
        dataIndex: 'erpPaymentNum',
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.syncStatus`).d('导入状态'),
        width: 120,
        dataIndex: 'erpImportCodeMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.company`).d('公司'),
        width: 120,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sfin.common.model.common.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        width: 120,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sfin.payment.invoiceBodyName`).d('开票主体'),
        dataIndex: 'invoiceTitle',
        width: 100,
      },
      {
        title: intl.get(`sfin.payment.common.payMoney`).d('付款金额'),
        width: 80,
        dataIndex: 'paymentAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.common.currency`).d('币种'),
        width: 80,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`sfin.payment.common.payDate`).d('付款日期'),
        width: 120,
        dataIndex: 'paymentDate',
        render: dateRender,
      },
      {
        title: intl.get(`sfin.paymentQuery.view.model.amountPaid`).d('已付金额'),
        width: 120,
        dataIndex: 'amountPaid',
      },
      {
        title: intl.get(`sfin.paymentQuery.view.model.unpaidAmount`).d('未付金额'),
        width: 120,
        dataIndex: 'unpaidAmount',
      },
      {
        title: intl.get(`sfin.payment.common.payer`).d('申请人'),
        width: 100,
        dataIndex: 'createdByName',
      },
      {
        title: intl.get(`sfin.payment.common.applyDate`).d('申请日期'),
        width: 100,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`sfin.payment.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 80,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        dataIndex: 'taxInvoiceLineId',
        render: (val, record) => (
          <a color="#29BECE" onClick={() => this.handleInvoiceDetail(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 300);
    const tableProps = {
      onChange: this.handleSearch,
      rowSelection,
      dataSource: list.payQuery && list.payQuery.content,
      pagination: pagination.payQuery,
      rowKey: 'paymentHeaderId',
      columns,
      loading,
      bordered: true,
      scroll: {
        x: scrollWidth,
      },
    };
    const actionHistory = {
      data, // 传入的数据,打开操作记录的行
      visible,
      hideModal: this.hideModal,
    };
    return (
      <Fragment>
        {customizeFilterForm(
          {
            code: 'SFIN.PAY_QUERY_LIST.FILTER',
            form,
            expand: expend,
          },
          <Form layout="inline" className="more-fields-search-form">
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={18}>
                <Row {...SEARCH_FORM_ROW_LAYOUT}>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sfin.payment.common.payApproveNo`).d('付款申请单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('paymentNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...formItemLayout}>
                      {getFieldDecorator('companyId')(
                        <Lov code="SPFM.USER_AUTH.COMPANY" queryParams={{ organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sfin.payment.common.ouId`).d('业务实体')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('ouId')(
                        <Lov code="SPFM.USER_AUTH.OU" queryParams={{ tenantId: organizationId }} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`entity.supplier.tag`).d('供应商')}
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
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`sfin.payment.common.type`).d('类型')}
                    >
                      {getFieldDecorator('paymentTypeCode')(
                        // <ValueList lovCode="SFIN.PAYMENT_TYPE" allowClear />
                        <Select allowClear>
                          {sourceList.map((item) => {
                            return (
                              <Option label={item.meaning} value={item.value} key={item.value}>
                                {item.meaning}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sfin.payment.common.applyDateStart`).d('申请日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('creationDateStart')(
                        <DatePicker
                          format={dateFormat}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('creationDateEnd') &&
                            moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sfin.payment.common.applyDateTo`).d('申请日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('creationDateEnd')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={(currentDate) =>
                            getFieldValue('creationDateStart') &&
                            moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`sfin.payment.common.payStatusMeaning`).d('申请单状态')}
                    >
                      {getFieldDecorator('paymentStatus')(
                        <Select allowClear>
                          {sourceStatus.map((item) => {
                            return (
                              <Option label={item.meaning} value={item.value} key={item.value}>
                                {item.meaning}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sfin.payment.common.actualPaymentDateStart`)
                        .d('实际付款日期从')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('actualPaymentDateStart')(
                        <DatePicker
                          format={dateFormat}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            getFieldValue('actualPaymentDateEnd') &&
                            moment(getFieldValue('actualPaymentDateEnd')).isBefore(
                              currentDate,
                              'day'
                            )
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sfin.payment.common.actualPaymentDateEnd`)
                        .d('实际付款日期至')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('actualPaymentDateEnd')(
                        <DatePicker
                          format={dateFormat}
                          placeholder=""
                          disabledDate={(currentDate) =>
                            getFieldValue('actualPaymentDateStart') &&
                            moment(getFieldValue('actualPaymentDateStart')).isAfter(
                              currentDate,
                              'day'
                            )
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sfin.paymentRecord.view.message.model.paymentRecord.erpPaymentNum`)
                        .d('ERP付款单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('erpPaymentNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl
                        .get(`sfin.invoiceBill.model.invoiceBill.syncStatus`)
                        .d('导入状态')}
                    >
                      {getFieldDecorator('erpImportCode')(
                        <Select allowClear>
                          {exportStatus.map((item) => {
                            return (
                              <Option label={item.meaning} value={item.value} key={item.value}>
                                {item.meaning}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`sfin.payment.common.displayPoNum`).d('关联单据单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('displayPoNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sfin.payment.common.displayPoNumNew`)
                        .d('关联单据单号（新）')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('accurateDisplayPoNum')(
                        <Input style={{ width: '100%' }} />
                      )}
                    </FormItem>
                  </Col>
                  {/* <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`sfin.paymentRecord.view.message.model.paymentRecord.displayPoNum`)
                        .d('订单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('displayPoNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col> */}
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {expend
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
        )}
        {customizeTable(
          {
            code: 'SFIN.PAY_QUERY_LIST.GRID',
          },
          <EditTable {...tableProps} />
        )}
        {visible && <ActionHistory {...actionHistory} />}
      </Fragment>
    );
  }
}
