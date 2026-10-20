/**
 * InterfacePageConfig - 接口页面配置 - 查询表单
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

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
   *表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  queryValue() {
    const { queryValue, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        queryValue();
      }
    });
  }

  /**
   *渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { level } = this.props;
    const queryParams = level ? { queryParams: { tenantId: getCurrentOrganizationId() } } : {};

    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formlayout}>
                {getFieldDecorator('interfaceId')(
                  <Lov code={level ? 'SITF.INTERFACE' : 'SIFC.INTERFACE'} {...queryParams} />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('sitf.interfacePageConfig.model.interfacePageConfig.tableName')
                  .d('接口表名')}
                {...formlayout}
              >
                {getFieldDecorator('tableName')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
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
