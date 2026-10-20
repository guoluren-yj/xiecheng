/**
 * QueryFormOrg - 接口批次统计 - 查询表单 - 租户级
 * @date: 2018-11-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, DatePicker, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      startValue: null,
      endValue: null,
      // organizationId: getCurrentOrganizationId(),
    };
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryBatchStatistic, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        if (onQueryBatchStatistic) {
          onQueryBatchStatistic();
        }
      }
    });
  }

  /**
   * 隐藏创建时间从
   * @param {Date} startValue 创建时间从
   */
  @Bind()
  disabledStartDate(startValue) {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  /**
   * 隐藏创建时间至
   * @param {Date} endValue 创建时间至
   */
  @Bind()
  disabledEndDate(endValue) {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  /**
   * 改变创建时间至
   * @param {string} field 属性名
   * @param {Date} value 属性值
   */
  @Bind()
  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  /**
   * 选择开始时间
   * @param {Date} value 开始时间
   */
  @Bind()
  onStartChange(value) {
    this.onChange('startValue', value);
  }

  /**
   * 选择结束时间
   * @param {Date} value 结束时间
   */
  @Bind()
  onEndChange(value) {
    this.onChange('endValue', value);
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    // const { organizationId } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <div className="table-list-search">
        <Form className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('sitf.batchStatistic.model.batchStatistic.startDate')
                      .d('时间从')}
                    {...formlayout}
                  >
                    {getFieldDecorator('startDate', {})(
                      <DatePicker
                        disabledDate={this.disabledStartDate}
                        showTime
                        format={getDateTimeFormat()}
                        placeholder=""
                        onChange={this.onStartChange}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('sitf.batchStatistic.model.batchStatistic.endDate').d('时间至')}
                    {...formlayout}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        disabledDate={this.disabledEndDate}
                        showTime
                        format={getDateTimeFormat()}
                        placeholder=""
                        onChange={this.onEndChange}
                      />
                    )}
                  </FormItem>
                </Col>
                {/* </Row>
              <Row> */}
                <Col span={8}>
                  <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formlayout}>
                    {getFieldDecorator('interfaceId')(
                      <Lov
                        allowClear
                        code="SITF.INTERFACE"
                        queryParams={{ tenantId: getCurrentOrganizationId() }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.queryData}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
