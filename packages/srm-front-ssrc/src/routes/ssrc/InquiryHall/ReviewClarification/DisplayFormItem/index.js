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
