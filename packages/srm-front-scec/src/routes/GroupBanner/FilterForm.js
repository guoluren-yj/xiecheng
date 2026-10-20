import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { getDateFormat, isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const cacheKey = isTenantRoleLevel() ? '/scec/platform-banner/list' : '/scec/company-banner/list';

const commonPrompt = 'scec.common.model.common';
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
@cacheComponent({ cacheKey })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: false,
  };

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
      bannerStatus = [],
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
                    label={intl
                      .get(`scec.companyBanner.model.companyBanner.bannerName`)
                      .d('Banner名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('bannerName')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`scec.shopBasket.model.shoppingBasket.startDate`).d('开始时间')}
                    {...formLayout}
                  >
                    {getFieldDecorator('startDate')(
                      <DatePicker
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('endDate') &&
                          moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`scec.shopBasket.model.shoppingBasket.endDate`).d('截止时间')}
                    {...formLayout}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('startDate') &&
                          moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: display ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`${commonPrompt}.bannerStatus`).d('状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('bannerStatus')(
                      <Select allowClear>
                        {bannerStatus &&
                          bannerStatus.map(item => (
                            <Option key={item.meaning} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  style={{ marginRight: 8, display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
                <Button
                  style={{ marginRight: 8, display: display ? 'inline-block' : 'none' }}
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
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
