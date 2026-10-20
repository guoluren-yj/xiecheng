import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getDateFormat } from 'utils/utils';

import Lov from 'components/Lov';
import moment from 'moment';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';

const FormItem = Form.Item;

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
@cacheComponent({ cacheKey: '/ssrc/bid-hall/clarification-view' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {
      expand: true,
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
    form.validateFields(err => {
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
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { expand } = this.state;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl.get(`ssrc.bidHall.view.question.questionNo`).d('澄清单号')}
                  >
                    {getFieldDecorator('clarifyNum')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem {...formLayout} label={intl.get('ssrc.common.company').d('公司')}>
                    {getFieldDecorator('companyId')(
                      <Lov code="SPFM.USER_AUTH.COMPANY" textField="companyName" />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl.get(`ssrc.bidHall.view.question.submittedByUserName`).d('发布人')}
                  >
                    {getFieldDecorator('submittedByUserName')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: expand ? 'none' : 'block' }}>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get(`ssrc.bidHall.view.question.questionSubmitDateFrom`)
                      .d('发布日期从')}
                  >
                    {getFieldDecorator('submittedDateFrom')(
                      <DatePicker
                        format={getDateFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('submittedDateTo') &&
                          moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day')
                        }
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get(`ssrc.bidHall.view.question.questionSubmitDateTo`)
                      .d('发布日期至')}
                  >
                    {getFieldDecorator('submittedDateTo')(
                      <DatePicker
                        format={getDateFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('submittedDateFrom') &&
                          moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day')
                        }
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: expand ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: expand ? 'none' : 'inline-block' }}
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
