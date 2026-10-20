/**
 * index - 发票验真 - 已校验
 * @date: 2019-07-24
 * @author: zuoxaingyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select, DatePicker } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { SEARCH_FORM_ROW_LAYOUT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import { getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';

const { Option } = Select;
const promptCode = 'sfin.invoiceBill';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sfin/invoice-verification/verify' })
export default class VerSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      //   tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    const { onFetchList, verifiedPagination } = this.props;
    onFetchList(verifiedPagination); // 查询数据
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  @Bind()
  onFetchList() {
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
    const {
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
    } = this.props;
    const { cflag = [], iflag = [] } = enumMap;
    const { expandForm } = this.state;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码')}
                >
                  {getFieldDecorator('invoiceCode')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码')}
                >
                  {getFieldDecorator('invoiceNumber')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态')}
                >
                  {getFieldDecorator('validateStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {cflag
                        .filter((item) => ['CHECK_SUCCESS', 'CHECK_FAILED'].includes(item.value))
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
                  label={intl.get(`${promptCode}.model.supplierCompanyName`).d('销售方')}
                >
                  {getFieldDecorator('supplierName')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sfin.inputInvoice.model.purchaser`).d('购买方')}
                >
                  {getFieldDecorator('companyName')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                >
                  {getFieldDecorator('srmInvoiceNum')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sfin.invoiceVerification.model.billingDateFrom`).d('开票日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('billingDateTo') &&
                        moment(getFieldValue('billingDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceVerification.model.billingDateTo').d('开票日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('billingDateTo')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('billingDateFrom') &&
                        moment(getFieldValue('billingDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceVerification.model.checkTimeFrom').d('查验时间从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkDateFrom')(
                    <DatePicker
                      showTime
                      placeholder=""
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('checkDateTo') &&
                        moment(getFieldValue('checkDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('sfin.invoiceVerification.model.checkTimeTo').d('查验时间至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkDateTo')(
                    <DatePicker
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      placeholder=""
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('checkDateFrom') &&
                        moment(getFieldValue('checkDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceStatus`).d('发票状态')}
                >
                  {getFieldDecorator('taxInvoiceStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {iflag.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.onFetchList}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
