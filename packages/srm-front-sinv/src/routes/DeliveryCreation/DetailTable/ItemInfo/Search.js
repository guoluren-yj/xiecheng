/**
 * List  - 应用管理 - 查询
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';

// FormItem组件初始化
const FormItem = Form.Item;

/**
 * Search - 业务组件 - 送货单创建
 * @extends {Component} - React.Component
 * @reactProps {!Object} [form={}] - form对象
 * @reactProps {function} [fetchList= (e => e)] - 查询数据
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
      pagination = { pageSize: 10, current: 1 },
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      ...data,
      size: pagination.pageSize,
      page: pagination.current - 1,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const { form = {} } = this.props;
    const { getFieldDecorator = e => e } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}>
          {getFieldDecorator('displayPoNum')(<Input typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号')}>
          {getFieldDecorator('displayLineNum')(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`entity.item.tag`).d('物料')}>
          {getFieldDecorator('itemName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button onClick={this.onReset.bind(this)}>
            {intl.get(`hzero.common.button.reset`).d('重置')}
          </Button>
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
            {intl.get(`hzero.common.button.search`).d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
