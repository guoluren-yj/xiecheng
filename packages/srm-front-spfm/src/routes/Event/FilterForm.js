/**
 * Event - 事件定义 - 查询表单
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  constructor(props) {
    super(props);
    // 调用父组件 props onRef 方法
    props.onRef(this);
  }

  /**
   * 查询操作
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    onSearch(form);
  }

  /**
   * 重置操作
   */
  @Bind()
  handleReset() {
    const { form, onReset } = this.props;
    onReset(form);
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('spfm.common.model.categoryCode').d('事件编码')}>
          {getFieldDecorator('eventCode')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('spfm.common.model.eventName').d('事件描述')}>
          {getFieldDecorator('eventName')(<Input />)}
        </FormItem>
        <FormItem label={intl.get('spfm.event.model.event.className').d('数据类型')}>
          {getFieldDecorator('className')(<Input />)}
        </FormItem>
        <FormItem>
          <Button style={{ marginRight: 8 }} onClick={this.handleReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
