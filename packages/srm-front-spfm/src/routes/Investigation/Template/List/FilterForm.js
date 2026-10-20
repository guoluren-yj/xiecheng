/*
 * FilterForm - 平台级调查模板定义表单
 * @date: 2018/08/07 15:25:27
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, DatePicker, Select, Icon, Row, Col } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { getDateFormat } from 'utils/utils';

/**
 * 平台级调查模板定义表单
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spfm/investigation-template-define/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
    };
  }

  @Bind()
  handleSearch() {
    const { onFilterChange, form } = this.props;
    if (onFilterChange) {
      form.validateFields(err => {
        if (!err) {
          onFilterChange();
        }
      });
    }
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      investigateTypes = [],
    } = this.props;
    const { expandForm } = this.state;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.investigation.model.investigation.investigateType`)
                      .d('调查表类型')}
                  >
                    {getFieldDecorator('investigateType')(
                      <Select style={{ width: '100%' }} allowClear>
                        {investigateTypes.map(n =>
                          (n || {}).value ? (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ) : (
                            undefined
                          )
                        )}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`spfm.investigation.model.investigation.templateName`)
                      .d('模板名称')}
                  >
                    {getFieldDecorator('templateName')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  >
                    {getFieldDecorator('startDate')(
                      <DatePicker
                        format={getDateFormat()}
                        style={{ width: '100%' }}
                        placeholder={null}
                        disabledDate={currentDate =>
                          getFieldValue('endDate') &&
                          moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: expandForm ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`hzero.common.date.creation.to`).d('创建时间到')}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        disabledDate={currentDate =>
                          getFieldValue('startDate') &&
                          moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                        }
                        format={getDateFormat()}
                        style={{ width: '100%' }}
                        placeholder={null}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <a style={{ marginLeft: 8, display: 'inline-block' }} onClick={this.toggleForm}>
                  {expandForm
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                  <Icon type={expandForm ? 'up' : 'down'} />
                </a>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
