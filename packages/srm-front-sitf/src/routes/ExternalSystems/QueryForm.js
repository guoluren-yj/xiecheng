/**
 * QueryForm - 外部系统定义 - 查询表单
 * @date: 2018-9-11
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
    this.state = {
      expand: true,
    };
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
    form.validateFields((err) => {
      if (!err) {
        onFetchSystem();
      }
    });
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  /**
   * 渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { SystemType = [] } = this.props;
    const { expand } = this.state;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: {
        width: '100%',
      },
    };
    return (
      <Form className="more-fields-form">
        <Row gutter={12}>
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
                    SystemType.map((type) => {
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
              <Button style={{ display: expand ? 'inline-block' : 'none' }} onClick={this.toggle}>
                {intl.get(`sitf.common.button.more.inquire`).d('更多查询')}
              </Button>
              <Button style={{ display: expand ? 'none' : 'inline-block' }} onClick={this.toggle}>
                {intl.get(`hzero.common.button.collected`).d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => this.fetchSystem()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={6} style={{ display: expand ? 'none' : 'block' }}>
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
