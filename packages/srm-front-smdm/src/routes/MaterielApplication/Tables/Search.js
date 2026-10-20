/**
 * Search - 采购组织查询
 * @date: 2019-11-21
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 列表查询表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 采购员列表查询表单重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('smdm.materiel.model.materiel.demand.realName').d('真实姓名')}>
          {getFieldDecorator('realName', {
            initialValue: '',
          })(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem>
          <Button onClick={this.handleReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
