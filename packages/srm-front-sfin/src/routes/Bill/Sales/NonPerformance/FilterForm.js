/**
 * MaintainIndex -非寄销开票单销售账单汇总查询 -form 表单查询
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col, Select, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserOrganizationId } from 'utils/utils';

import ValueList from 'components/ValueList';
import cacheComponent from 'components/CacheComponent';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Lov from 'components/Lov';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@withCustomize({
  unitCode: ['SFIN.BILL_SALE_LIST.FILTER'],
})
@cacheComponent({ cacheKey: '/sfin/bill-sales/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
    this.fetchData();
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  @Bind()
  handleReset() {
    const { onHandleFormReset, form } = this.props;
    if (onHandleFormReset) {
      onHandleFormReset();
    }
    form.resetFields();
  }

  @Bind()
  fetchData() {
    const { form, onFetchSupplierBill } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchSupplierBill({
          ...values,
        });
      }
    });
  }

  /**
   * @returns
   * @memberof FilterForm
   */

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue, registerField },
      BillStatus,
      format,
      customizeFilterForm,
    } = this.props;
    const { expand } = this.state;

    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        code: 'SFIN.BILL_SALE_LIST.FILTER',
        form,
        expand: !expand,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('displayBillNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.item').d('物料描述/编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('item')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.poNum').d('采购订单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formlayout}>
                  {getFieldDecorator('billStatus')(
                    <Select allowClear>
                      {BillStatus.filter((item) => item.value.indexOf('INFORM_') === -1).map(
                        (item) => {
                          return (
                            <Option label={item.meaning} value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          );
                        }
                      )}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('entity.company.tag').d('公司')} {...formlayout}>
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
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.companyName').d('客户公司')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.CUSTOMER"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                      format={format}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建时间至')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={format}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.purAgentName`).d('采购员')}
                  {...formlayout}
                >
                  {getFieldDecorator('purAgentName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.purchaseOrgName`)
                    .d('采购组织')}
                  {...formlayout}
                >
                  {getFieldDecorator('purOrganization')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.approvedDateFrom`)
                    .d('审核日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('approvedDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('approvedDateTo') &&
                        moment(getFieldValue('approvedDateTo')).isBefore(currentDate, 'day')
                      }
                      format={format}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.approvedDateAt`)
                    .d('审核日期到')}
                  {...formlayout}
                >
                  {getFieldDecorator('approvedDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('approvedDateFrom') &&
                        moment(getFieldValue('approvedDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={format}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.invoiceCompleteFlag`)
                    .d('是否已完全开票')}
                  {...formlayout}
                >
                  {getFieldDecorator('invoiceCompleteFlag')(
                    <Select allowClear>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.isSupplierCreateFlagMeaning')
                    .d('是否采购方创建')}
                >
                  {getFieldDecorator('supplierCreateFlagMeaning', {
                    // initialValue: 1,
                  })(
                    <Select allowClear>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceNumber`)
                    .d('税务发票号')}
                >
                  {getFieldDecorator('taxInvoiceNums')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`)
                    .d('ERP发票号')}
                >
                  {getFieldDecorator('erpInvoiceNums')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`sfin.invoiceBill.model.invoiceBill.filter.specifications`)
                    .d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.filter.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.preciseSelectFlag')
                    .d('是否启用精准查询')}
                >
                  {getFieldDecorator('preciseSelectFlag')(
                    <ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.fetchData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
