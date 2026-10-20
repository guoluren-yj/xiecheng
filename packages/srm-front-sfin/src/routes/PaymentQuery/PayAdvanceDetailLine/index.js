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
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ payQuery, loading }) => ({
  payQuery,
  organizationId: getCurrentOrganizationId(),
  loading: loading.effects['payQuery/queryList'],
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'entity.company', 'entity.supplier', 'sfin.payment'],
})
@withCustomize({
  unitCode: [
    'SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_FILTER',
    'SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_GRID',
  ],
})
@Form.create({ fieldNameProp: null })
export default class PayAdvanceDetailLine extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expend: false,
    };
  }

  componentDidMount() {
    const {
      payQuery: { pagination },
    } = this.props;
    this.handleSearch(pagination.payAdvanceDetailLine);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payQuery/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'payAdvanceDetailLine',
      },
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form, clearRows } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { creationDateStart, creationDateEnd } = values;
        dispatch({
          type: 'payQuery/queryList',
          payload: {
            page,
            ...values,
            type: 'payAdvanceDetailLine',
            customizeUnitCode:
              'SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_FILTER,SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_GRID',
            creationDateStart: creationDateStart && moment(creationDateStart).format(DATETIME_MIN),
            creationDateEnd: creationDateEnd && moment(creationDateEnd).format(DATETIME_MAX),
          },
        });
      }
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
    const { expend } = this.state;
    this.setState({
      expend: !expend,
    });
  }

  @Bind()
  toDetail(record) {
    const { history } = this.props;
    history.push(`/sfin/pay-query/advance/detail/${record.paymentHeaderId}`);
  }

  render() {
    const {
      form,
      rowSelection,
      payQuery: {
        list = {},
        pagination = {},
        code: { sourceStatus = [], referenceDataList = [], exportStatus = [] },
      },
      organizationId,
      loading,
      customizeFilterForm,
      customizeTable,
    } = this.props;
    const { expend } = this.state;
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
        title: intl.get(`sfin.payment.common.erpImportCodeMeaning`).d('导入状态'),
        width: 100,
        dataIndex: 'erpImportCodeMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.payApproveNo`).d('付款申请单号'),
        width: 150,
        dataIndex: 'paymentNum',
        render: (val, record) => <a onClick={() => this.toDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`sfin.payment.common.company`).d('公司'),
        width: 120,
        dataIndex: 'companyName',
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
        title: intl.get(`sfin.payment.common.referenceDataCode`).d('付款申请类型'),
        width: 120,
        dataIndex: 'referenceDataCodeMeaning',
      },
      {
        title: intl.get(`sfin.paymentQuery.common.displayNum`).d('关联单据单号'),
        width: 140,
        dataIndex: 'displayNum',
      },
      {
        title: intl.get(`sfin.paymentQuery.common.relTaxIncludedAmount`).d('关联单据含税总额'),
        dataIndex: 'taxIncludedAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.paymentQuery.common.relPaymentAmount`).d('关联单据剩余可付金额'),
        width: 140,
        dataIndex: 'paymentAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`sfin.paymentQuery.view.model.relCancelVerificationAmount`)
          .d('关联单据已核销金额'),
        width: 140,
        dataIndex: 'cancelVerificationAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`sfin.paymentQuery.view.model.notCancelVerificationAmount`)
          .d('关联单据未核销金额'),
        width: 140,
        dataIndex: 'notCancelVerificationAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.paymentQuery.common.paymentAdvanceAmount`).d('本次预付款金额'),
        width: 120,
        dataIndex: 'paymentAdvanceAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.common.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
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
        render: dateRender,
      },
      {
        title: intl.get(`sfin.payment.common.headRemark`).d('头备注'),
        width: 100,
        dataIndex: 'remark',
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 300);
    const tableProps = {
      onChange: this.handleSearch,
      rowSelection,
      dataSource: list.payAdvanceDetailLine && list.payAdvanceDetailLine.content,
      pagination: pagination.payAdvanceDetailLine,
      rowKey: 'advanceLineId',
      columns,
      loading,
      bordered: true,
      scroll: {
        x: scrollWidth,
      },
    };
    return (
      <Fragment>
        {customizeFilterForm(
          {
            code: 'SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_FILTER',
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
                </Row>
                <Row style={{ display: expend ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
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
                    <FormItem
                      label={intl.get(`sfin.paymentQuery.common.displayNum`).d('关联单据单号')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('displayNum')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`sfin.payment.common.createdByName`).d('申请人')}
                    >
                      {getFieldDecorator('createdByName')(<Input style={{ width: '100%' }} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`sfin.payment.common.referenceDataCode`).d('付款申请类型')}
                    >
                      {getFieldDecorator('referenceDataCode')(
                        <Select allowClear>
                          {referenceDataList.map((item) => {
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
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`sfin.payment.common.erpImportCodeMeaning`).d('导入状态')}
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
            code: 'SFIN.PAY_QUERY_LIST.PAYADVANCEDETAILLINE_GRID',
          },
          <EditTable {...tableProps} />
        )}
        {/* <EditTable {...tableProps} /> */}
      </Fragment>
    );
  }
}
