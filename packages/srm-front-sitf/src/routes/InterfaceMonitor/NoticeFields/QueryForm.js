/**
 * QueryForm - 监控提醒字段配置 - 查询表单
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
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
    const { onQueryNoticeFields, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        onQueryNoticeFields();
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formlayout}>
                {getFieldDecorator('interfaceId')(<Lov code="SITF.INTERFACE" />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('sitf.interfaceMonitor.model.interfaceMonitor.fieldName')
                  .d('字段名称')}
                {...formlayout}
              >
                {getFieldDecorator('fieldName')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
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
      </div>
    );
  }
}
