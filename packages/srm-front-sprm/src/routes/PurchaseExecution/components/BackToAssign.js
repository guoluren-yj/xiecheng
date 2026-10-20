import React, { Component } from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

export default class searchForm extends Component {
  render() {
    const { ds, customizeForm } = this.props;
    return customizeForm(
      {
        code: 'SPRM.PURCHASE_EXECUTION.BACK_FORM', // 必传，和unitCode一一对应
        dataSet: ds,
      },
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <TextArea name="backToUnassignReason" resize="vertical" />
      </Form>
    );
  }
}
