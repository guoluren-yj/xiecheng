/**
 * QueryForm - 租户配置 - 查询表单
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
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
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryCreditTenant } = this.props;
    if (onQueryCreditTenant) {
      onQueryCreditTenant();
    }
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="table-list-search">
        <Form layout="inline">
          <FormItem label={intl.get('entity.tenant.code').d('租户代码')}>
            {getFieldDecorator('tenantNum')(<Input typeCase="upper" inputChinese={false} />)}
          </FormItem>
          <FormItem label={intl.get('entity.tenant.name').d('租户名称')}>
            {getFieldDecorator('tenantName')(<Input />)}
          </FormItem>
          <FormItem>
            <Button type="primary" onClick={() => this.queryData()} htmlType="submit">
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
