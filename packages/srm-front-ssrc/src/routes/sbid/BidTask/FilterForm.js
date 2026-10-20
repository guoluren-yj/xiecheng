/**
 * router - 报价作业/搜索表单
 * @date: 2019-05-27
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

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
@cacheComponent({ cacheKey: '/ssrc/bid-task/list' })
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
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      sourceMethod = [],
      bidStatus = [],
      bidType = [],
    } = this.props;
    const { display } = this.state;

    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.bidNum`).d('招标书编号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('bidNum')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.bidTitle`).d('招标事项')}
                    {...formLayout}
                  >
                    {getFieldDecorator('bidTitle')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.tenderName`).d('招标员')}
                    {...formLayout}
                  >
                    {getFieldDecorator('userName')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.bidType`).d('招标类别')}
                    {...formLayout}
                  >
                    {getFieldDecorator('bidType')(
                      <Select allowClear>
                        {bidType &&
                          bidType.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.sourceMethod`).d('寻源方式')}
                    {...formLayout}
                  >
                    {getFieldDecorator('sourceMethod')(
                      <Select allowClear>
                        {sourceMethod &&
                          sourceMethod.map(item => (
                            <Option key={item.meaning} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={intl.get('ssrc.common.company').d('公司')} {...formLayout}>
                    {getFieldDecorator('companyName')(<Input maxLength={20} type="text" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.createdUnitName`).d('创建人部门')}
                    {...formLayout}
                  >
                    {getFieldDecorator('createdUnitName')(<Input maxLength={20} type="text" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bidTask.status`).d('状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('bidStatus')(
                      <Select allowClear>
                        {bidStatus &&
                          bidStatus.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bindHal.creationDateFrom`).d('创建日期从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('creationDateFrom')(
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={DEFAULT_DATETIME_FORMAT}
                        disabledDate={currentDate =>
                          getFieldValue('creationDateTo') &&
                          moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.bidTask.model.bindHal.creationDateTo`).d('创建日期至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('creationDateTo')(
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder=""
                        format={DEFAULT_DATETIME_FORMAT}
                        disabledDate={currentDate =>
                          getFieldValue('creationDateFrom') &&
                          moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                {this.state.display ? (
                  <Button onClick={this.toggleForm}>
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                ) : (
                  <Button onClick={this.toggleForm}>
                    {intl.get('hzero.common.button.collected').d('收起查询')}
                  </Button>
                )}
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
