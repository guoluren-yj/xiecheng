/**
 *
 * @date: 2020/6/18
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const { Item: FormItem } = Form;

@formatterCollections({ code: ['sslm.supplierDocManage'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const {
      fetchList = (e) => e,
      form: { getFieldsValue = (e) => e },
      activeRows = {},
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      supplierId: activeRows.supplierId,
      ...data,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields = (e) => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator = (e) => e },
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
