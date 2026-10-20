/*
 * FilterForm - 供应商报价表单
 * @date: 2018/12/16 14:57:58
 * @author: NJQ <jiangqi.nan@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Input, Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import moment from 'moment';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

const { Option } = Select;

const promptCode = 'ssrc.queryQuotation';
@connect(({ supplierQuotation }) => ({
  supplierQuotation,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/query-quotation/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  // 条件查询
  @Bind()
  fetchInterfaceDef() {
    const { form, onConditional } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      code: { biddingDirection = [], inquiryMethod = [], sourceCategory = [], rfxStatus = [] },
      organizationId,
      remote,
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.queryQuotation.RFxNo.`).d('RFx单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('rfxNum')(
                    <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.queryQuotation.customer`).d('客户')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SSRC.USER_AUTH_CUSTOMER"
                      queryParams={{
                        tenantId: organizationId,
                      }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.queryQuotation.inquiryTitle`)
                    .d('询价单标题')}
                  {...formlayout}
                >
                  {getFieldDecorator('rfxTitle')(<Input trim maxLength={60} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.queryQuotation.sourcingCategory`)
                    .d('寻源类别')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceCategory')(
                    <Select allowClear>
                      {sourceCategory &&
                        sourceCategory.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.queryQuotation.sourcingApproach`)
                    .d('寻源方式')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceMethod')(
                    <Select allowClear>
                      {inquiryMethod &&
                        inquiryMethod.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.queryQuotation.biddingDirection`)
                    .d('报价方向')}
                  {...formlayout}
                >
                  {getFieldDecorator('auctionDirection')(
                    <Select allowClear>
                      {biddingDirection &&
                        biddingDirection.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.queryQuotation.rfxStatus`).d('状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('rfxStatus')(
                    <Select allowClear>
                      {rfxStatus &&
                        rfxStatus.map((item) => (
                          <Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.queryQuotation.currency`).d('币种')}
                  {...formlayout}
                >
                  {getFieldDecorator('currencyCode')(
                    <Lov code="SMDM.EXCHANGE_RATE.CURRENCY" textField="currencyCode" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`${promptCode}.model.queryQuotation.startTime`).d('开始日期从')}
                >
                  {getFieldDecorator('quotationStartDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationStartDateTo') &&
                        moment(getFieldValue('quotationStartDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`${promptCode}.model.queryQuotation.startTo`).d('开始日期至')}
                >
                  {getFieldDecorator('quotationStartDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationStartDateFrom') &&
                        moment(getFieldValue('quotationStartDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`${promptCode}.model.queryQuotation.deadlineFrom`)
                    .d('截止日期从')}
                >
                  {getFieldDecorator('quotationEndDateFrom')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationEndDateTo') &&
                        moment(getFieldValue('quotationEndDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`${promptCode}.model.queryQuotation.deadlineTo`).d('截止日期至')}
                >
                  {getFieldDecorator('quotationEndDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('quotationEndDateFrom') &&
                        moment(getFieldValue('quotationEndDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                {remote
                  ? remote.render('SSRC_QUERY_QUOTATION_LIST_RENDER_MORE_FIELD_FIRST', <></>, {
                      getFieldDecorator,
                    })
                  : null}
              </Col>
              <Col span={8}>
                {remote
                  ? remote.render('SSRC_QUERY_QUOTATION_LIST_RENDER_MORE_FIELD_SECOND', <></>, {
                      getFieldDecorator,
                    })
                  : null}
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.queryReset}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.fetchInterfaceDef}
              >
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
