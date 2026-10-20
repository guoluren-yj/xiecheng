/**
 * QueryForm - 应用配置 - 查询表单
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 下拉选择框组件
 */
const { Option } = Select;
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
   * 查询应用配置
   */
  @Bind()
  fetchApplication() {
    const { onFetchApplication, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        onFetchApplication();
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { ApplicationType = [] } = this.props;
    return (
      <div className="table-list-search">
        <Form className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem label={intl.get('entity.definition.code').d('应用代码')} {...formlayout}>
                {getFieldDecorator('applicationCode')(
                  <Input typeCase="upper" trim inputChinese={false} />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={intl.get('entity.definition.name').d('应用名称')} {...formlayout}>
                {getFieldDecorator('applicationName')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={intl.get('entity.definition.type').d('应用类型')} {...formlayout}>
                {getFieldDecorator('applicationType')(
                  <Select allowClear>
                    {ApplicationType &&
                      ApplicationType.map(type => {
                        return (
                          <Option value={type.value} key={type.value}>
                            {type.meaning}
                          </Option>
                        );
                      })}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" onClick={() => this.fetchApplication()} htmlType="submit">
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
