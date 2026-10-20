/**
 * QueryForm - 消息队列定义 - 消息队列系统分配定义 - 查询组件
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 查询组件
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
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 点击查询事件
   */
  @Bind()
  fetchQueue() {
    const { onFetchQueue, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        onFetchQueue();
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
        <Form layout="inline">
          <FormItem label={intl.get('sitf.common.system.type').d('系统分配类型')}>
            {getFieldDecorator('systemType')(<Input />)}
          </FormItem>
          <FormItem label={intl.get('sitf.common.system.code').d('系统分配代码')}>
            {getFieldDecorator('systemCode')(<Input typeCase="upper" trim inputChinese={false} />)}
          </FormItem>
          <FormItem style={{ marginLeft: '10px' }}>
            <Button type="primary" onClick={() => this.fetchQueue()} htmlType="submit">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button style={{ marginLeft: '10px' }} onClick={this.handleFormReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
