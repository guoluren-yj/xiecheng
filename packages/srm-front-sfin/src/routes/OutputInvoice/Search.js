import moment from 'moment';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { getDateFormat } from 'utils/utils';
import ValueList from 'components/ValueList';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'sfin.invoiceBill';
const inputInvoiceCode = 'sfin.inputInvoice';

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
    const { form, outputInvoice, status = [] } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
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
                  label={intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceCode')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceNumber')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.taxInvoiceStatus`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('issueStatusCode')(
                    <ValueList lovCode="SFIN.ISSUE_INVOICE_STATUS" lazyLoad={false} allowClear />
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${inputInvoiceCode}.model.taxInvoiceStatus`).d('状态')}
                >
                  {getFieldDecorator('issueStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {status
                        .filter(item => item.value !== 'FAILURE' && item.value !== 'UNISSUE')
                        .map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: outputInvoice ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.purchaser`).d('购买方')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.supplierCompanyName`).d('销售方')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('supplierName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.taxType`).d('发票类型')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceTypeCode')(
                    <ValueList lovCode="SPRM.PR_INVOICE_TYPE" lazyLoad={false} allowClear />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: outputInvoice ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.billingDateFrom`).d('开票日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('billingDateTo') &&
                        moment(getFieldValue('billingDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.billingDateTo`).d('开票日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('billingDateFrom') &&
                        moment(getFieldValue('billingDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${inputInvoiceCode}.model.srmInvoiceNum`).d('SRM发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('srmInvoiceNum')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {outputInvoice
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
