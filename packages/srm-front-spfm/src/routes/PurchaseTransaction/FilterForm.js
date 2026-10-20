/**
 * PurchaseTransaction -采购事务类型定义 FilterForm 表单查询
 * @date: 2018-12-18
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  @Bind()
  fetchData() {
    const { form, onFetchPurchaseTransList } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchPurchaseTransList({
          ...values,
        });
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <Form.Item
          label={intl
            .get(`spfm.purchaseTransaction.model.purchaseTransaction.TypeCode`)
            .d('事务类型代码')}
        >
          {getFieldDecorator('rcvTrxTypeCode')(<Input />)}
        </Form.Item>
        <Form.Item
          label={intl
            .get(`spfm.purchaseTransaction.model.purchaseTransaction.TypeName`)
            .d('事务类型名称')}
        >
          {getFieldDecorator('rcvTrxTypeName')(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={this.fetchData}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
