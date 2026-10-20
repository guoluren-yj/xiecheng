import moment from 'moment';
import intl from 'utils/intl';
import { isFunction, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import {
  getDateFormat,
  getCurrentOrganizationId,
  // getCurrentUserId,
  // getUserOrganizationId,
} from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import Lov from 'components/Lov';
// import ValueList from 'components/ValueList';

const FormItem = Form.Item;
const { Option } = Select;

export default class Search extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   *  重置查询表单
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  @Bind()
  toggle() {
    const { onToggle } = this.props;
    onToggle();
  }

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (isFunction(onSearch)) {
      onSearch();
    }
  }

  render() {
    const { form, expend, sourceList = [], sourceStatus = [], exportStatus = [] } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const organizationId = getCurrentOrganizationId();
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
    };
    const dateFormat = getDateFormat();
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.ReceivedpayNo`).d('收款申请单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('paymentNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.clintConpany`).d('客户公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.CUSTOMER"
                      queryParams={{ organizationId }}
                      onChange={() => {
                        setFieldsValue({ ouId: null });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.ouId`).d('业务实体')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="HPFM.OU"
                      queryParams={{
                        tenantId: organizationId,
                        companyId: getFieldValue('companyId'),
                      }}
                      // onChange={(value, lovRecord) => companyChange(value, lovRecord)}
                      disabled={!getFieldValue('companyId')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expend ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.COMPANY_FOR_SUPPLIER"
                      textField="displayValue"
                      // queryParams={{
                      //   userId: getCurrentUserId(),
                      //   tenantId: getCurrentOrganizationId(),
                      //   organizationId: getUserOrganizationId(),
                      // }}
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
                  {...formItemLayout}
                  label={intl.get(`sfin.payment.common.type`).d('类型')}
                >
                  {getFieldDecorator('paymentTypeCode')(
                    // <ValueList lovCode="SFIN.PAYMENT_TYPE" allowClear />
                    <Select allowClear>
                      {sourceList
                        .filter((n) => ['ADVANCE_PAYMENT'].includes(n.value))
                        .map((item) => {
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
            </Row>
            <Row style={{ display: expend ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sfin.payment.common.applyType`).d('申请单状态')}
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
                    .get(`sfin.payment.common.ReceivedActualPayDateStart`)
                    .d('实际收款日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('actualPaymentDateStart')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('actualPaymentDateEnd') &&
                        moment(getFieldValue('actualPaymentDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sfin.payment.common.ReceivedActualPayDateEnd`)
                    .d('实际收款日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('actualPaymentDateEnd')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('actualPaymentDateStart') &&
                        moment(getFieldValue('actualPaymentDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expend ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`sfin.paymentRecord.view.message.model.paymentRecord.erpReceivedPayNum`)
                    .d('ERP收款单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('erpPaymentNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.syncStatus`).d('导入状态')}
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
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
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
    );
  }
}
