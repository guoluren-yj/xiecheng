/**
 * index.js - 进项发票池
 * @date: 2019-09-19
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, Button, Select, DatePicker } from 'hzero-ui';

import moment from 'moment';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import CacheComponent from 'components/CacheComponent';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'sfin.inputInvoice';
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sfin/input-invoice/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);

    this.state = {
      expandForm: false,
      // tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const { expandForm } = this.state;
    const dateFormat = getDateFormat();
    const {
      form: { getFieldDecorator, getFieldValue },
      taxTypeList,
      status,
    } = this.props;

    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.invoiceCode`).d('发票代码')}
                >
                  {getFieldDecorator('invoiceCode')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.invoiceNumber`).d('发票号码')}
                >
                  {getFieldDecorator('invoiceNumber')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.taxInvoiceStatus`).d('状态')}
                >
                  {getFieldDecorator('issueStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {status
                        .filter((item) => item.value !== 'FAILURE' && item.value !== 'UNISSUE')
                        .map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.purchaser`).d('购买方')}
                >
                  {getFieldDecorator('companyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.supplierCompanyName`).d('销售方')}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.taxType`).d('发票类型')}
                >
                  {getFieldDecorator('invoiceTypeCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {taxTypeList.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.model.billingDateFrom`).d('开票日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('billingDateTo') &&
                        moment(getFieldValue('billingDateTo')).isBefore(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.model.billingDateTo`).d('开票日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('billingDateFrom') &&
                        moment(getFieldValue('billingDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.model.srmInvoiceNum`).d('SRM发票号')}
                >
                  {getFieldDecorator('srmInvoiceNum')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.model.approveDateFrom`).d('审核日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('approveDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('approveDateTo') &&
                        moment(getFieldValue('approveDateTo')).isBefore(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.model.approveDateTo`).d('审核日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('approveDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('approveDateFrom') &&
                        moment(getFieldValue('approveDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get(`hzero.common.button.collected`).d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
