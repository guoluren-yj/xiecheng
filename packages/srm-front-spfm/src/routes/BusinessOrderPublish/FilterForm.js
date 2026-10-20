/**
 * FilterForm - 业务通知单查询form
 * @date: 2020-1-19
 * @version: 1.0.0
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/srm-songsh/carton-barcode/list' })
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
      customizeFilterForm,
      organizationId,
      form: { getFieldDecorator, getFieldValue },
      notificationType = [],
      notificationStatus = [],
    } = this.props;
    const { display } = this.state;

    return customizeFilterForm(
      {
        code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.FILTER',
        form: this.props.form,
        expand: !display, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.notificationNum`)
                    .d('通知单编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('notificationNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.notificationTitle`)
                    .d('通知单标题')}
                  {...formLayout}
                >
                  {getFieldDecorator('notificationTitle')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.notificationStatus`)
                    .d('状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('notificationStatus')(
                    <Select allowClear>
                      {notificationStatus.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.notificationType`)
                    .d('通知单类型')}
                >
                  {getFieldDecorator('notificationType')(
                    <Select allowClear>
                      {notificationType.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.supplierCompanyId`)
                    .d('供应商')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTH.SUPPLIER" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('spfm.businessOrder.model.businessOrder.releaseBy').d('创建人')}
                  {...formLayout}
                >
                  {getFieldDecorator('realName')(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.creationDateFrom`)
                    .d('创建日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`spfm.businessOrder.model.businessOrder.creationDateTo`)
                    .d('创建日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      placeholder=""
                      format={DEFAULT_DATETIME_FORMAT}
                      disabledDate={(currentDate) =>
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
    );
  }
}
