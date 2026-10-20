/**
 * QueryForm - 产品定义 - 数据查询表单
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';

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
  fetchProduct() {
    const { onFetchProduct, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        onFetchProduct();
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { form } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline">
          <FormItem
            label={intl.get(`seci.productDefine.model.productDefine.productCode`).d('产品代码')}
          >
            {form.getFieldDecorator('productCode')(
              <Input typeCase="upper" trim inputChinese={false} maxLength={30} />
            )}
          </FormItem>
          <FormItem
            label={intl.get(`seci.productDefine.model.productDefine.productName`).d('产品名称')}
          >
            {form.getFieldDecorator('productName')(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get(`seci.productDefine.model.productDefine.interfaceName`).d('接口名称')}
          >
            {form.getFieldDecorator('interfaceId')(<Lov code="SECI.INTERFACE" />)}
          </FormItem>
          <FormItem>
            <Button type="primary" onClick={() => this.fetchProduct()} htmlType="submit">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
