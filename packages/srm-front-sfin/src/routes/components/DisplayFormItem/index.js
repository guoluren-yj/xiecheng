/*
 * DisplayFormItem - 展示表单
 * @date: 2019-07-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;

export default class DisplayFormItem extends Component {
  render() {
    const { label, value } = this.props;
    return (
      <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
        {value}
      </FormItem>
    );
  }
}
