/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
@formatterCollections({ code: ['spfm.evaluationTemplate', 'sslm.supplierDocManage'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onClick', 'onReset'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      ...data,
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
    const {
      form: { getFieldDecorator = e => e },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('sslm.supplierDocManage.model.docManage.productCode').d('品类编码')}
        >
          {getFieldDecorator('categoryCode')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('sslm.supplierDocManage.model.docManage.categoryName').d('品类名称')}
        >
          {getFieldDecorator('categoryName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.onClick}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button onClick={this.onReset}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
        </FormItem>
      </Form>
    );
  }
}
