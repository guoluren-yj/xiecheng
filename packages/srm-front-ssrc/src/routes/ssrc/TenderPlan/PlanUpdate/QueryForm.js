/**
 * QueryForm - 寻源计划维护 - 查询表单
 * @date: 2019-04-16
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { noop } from 'lodash';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'ssrc.tenderPlan.model.tenderPlan';
/**
 * 表单布局属性
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/ssrc/planUpdate' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      expand: true,
    };
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData () {
    const { onQueryPlan } = this.props;
    if (onQueryPlan) {
      onQueryPlan();
    }
  }

  /**
   * 重置查询表单.
   */
  @Bind()
  handleFormReset () {
    const { form } = this.props;
    form.resetFields();
  }

  // 是否展开
  @Bind()
  toggle () {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  /**
   * 年度
   */
  @Bind()
  renderYear () {
    const date = new Date();
    // 当前年份
    const currentYear = date.getFullYear();
    // 当前年份后5年
    const endYear = currentYear + 5;
    // 当前年份及后5年的集合
    const yearArr = [];
    for (let i = currentYear; i <= endYear; i++) {
      yearArr.push(i);
    }

    return (
      <Select allowClear>
        {yearArr.map((n) => (
          <Option value={n} key={n}>
            {n}
          </Option>
        ))}
      </Select>
    );
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render () {
    const { form, customizeFilterForm = noop } = this.props;
    const { tenantId, expand = false } = this.state;
    const { getFieldDecorator } = form;
    return customizeFilterForm(
      {
        form,
        expand,
        code: 'SSRC.PLAN_UPDATE_LIST.LIST.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem {...formItemProps} label={intl.get(`${promptCode}.projectNum`).d('项目编码')}>
                  {getFieldDecorator('projectId')(<Lov code="SSRC.PROJECT" queryParams={{ tenantId }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${promptCode}.year`).d('年度')} {...formItemProps}>
                  {getFieldDecorator('year')(this.renderYear())}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => this.queryData()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
