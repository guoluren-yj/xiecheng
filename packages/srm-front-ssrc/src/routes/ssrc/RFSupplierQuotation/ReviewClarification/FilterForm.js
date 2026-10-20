/**
 * 澄清通知入口页面查询表单
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getDateFormat } from 'utils/utils';

import moment from 'moment';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-reply/review-clarification' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {
      display: true,
    };
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      replayStatus,
    } = this.props;
    const { display } = this.state;
    const newReplayStatus = replayStatus && replayStatus.filter((item) => item.value !== 'NEW');
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.claNotNum`)
                      .d('澄清通知编号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('clarifyNotifyNum')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.replyStatus`)
                      .d('回复状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('replyStatus')(
                      <Select allowClear>
                        {newReplayStatus.map((item) => (
                          <Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.supplierQuotation.model.supQuo.title`).d('标题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('clarifyNotifyTitle')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.submittedDateFrom`)
                      .d('提交日期从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('submittedDateFrom')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('submittedDateTo') &&
                          moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.submittedDateTo`)
                      .d('提交日期至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('submittedDateTo')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('submittedDateFrom') &&
                          moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.replyFromDate`)
                      .d('回复截止日期从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('replyEndDateFrom')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('replyEndDateTo') &&
                          moment(getFieldValue('replyEndDateTo')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.supplierQuotation.model.supQuo.replyEndDate`)
                      .d('回复截止日期至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('replyEndDateTo')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('replyEndDateFrom') &&
                          moment(getFieldValue('replyEndDateFrom')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
