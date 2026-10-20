/**
 * QueryForm - 外部系统分配 - 查询表单
 * @date: 2018-12-17
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 下拉框组件
 */
const { Option } = Select;
/**
 * QueryForm - 查询表单
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
   * 表单重置
   * @memberof CurrencyList
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 按条件查询
   */
  @Bind()
  fetchSystem() {
    const { onFetchSystem, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        onFetchSystem();
      }
    });
  }

  /**
   * 渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { SystemType = [] } = this.props;
    const formLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      style: {
        width: '100%',
      },
    };
    return (
      <Form layout="inline">
        <Row gutter={24}>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl
                .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
                .d('系统代码')}
            >
              {getFieldDecorator('externalSystemCode')(
                <Input trim typeCase="upper" inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl
                .get('sitf.externalSystems.model.externalSystems.externalSystemName')
                .d('系统名称')}
            >
              {getFieldDecorator('externalSystemName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl
                .get('sitf.externalSystems.model.externalSystems.systemType')
                .d('系统类别')}
            >
              {getFieldDecorator('systemType')(
                <Select allowClear style={{ width: '100%' }}>
                  {SystemType &&
                    SystemType.map(type => {
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
          <Col span={6}>
            <FormItem style={{ marginLeft: '10px' }}>
              <Button type="primary" onClick={() => this.fetchSystem()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
            <FormItem>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={6}>
            <FormItem
              {...formLayout}
              label={intl.get('sitf.common.applicationGroup.name').d('应用组名称')}
            >
              {getFieldDecorator('applicationGroupCode')(<Lov code="SIFC.APPLICATION_GROUPS" />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
