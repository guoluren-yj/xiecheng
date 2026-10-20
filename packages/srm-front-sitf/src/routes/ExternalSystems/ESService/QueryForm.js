/**
 * ESService - 外部系统定义 - 关联服务 - 查询表单
 * @date: 2018-9-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * QueryForm - 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form, onHandleFormReset } = this.props;
    form.resetFields();
    if (onHandleFormReset) {
      onHandleFormReset();
    }
  }

  /**
   * 按条件查询
   * @memberof QueryForm
   */
  @Bind()
  fetchESService() {
    const { onFetchESService, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onFetchESService(fieldsValue);
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={6}>
            <FormItem {...formLayout} label={intl.get('entity.application.tag').d('应用')}>
              {getFieldDecorator('applicationCode')(
                <Lov code="SIFC.APPLICATIONS" style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formLayout} label={intl.get('entity.interface.name').d('接口名称')}>
              {getFieldDecorator('interfaceName')(<Input style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl
                .get('sitf.externalSystems.model.externalSystems.serviceName')
                .d('服务名称')}
            >
              {getFieldDecorator('serviceName')(<Input style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => this.fetchESService()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
