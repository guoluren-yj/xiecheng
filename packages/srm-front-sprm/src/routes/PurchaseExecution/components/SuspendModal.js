import React, { Component } from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

export default class searchForm extends Component {
  render() {
    const { ds, customizeForm } = this.props;
    return customizeForm(
      {
        code: 'SPRM.PURCHASE_EXECUTION.NOTASSIGN.SUSPENDFORM', // 必传，和unitCode一一对应
        dataSet: ds,
      },
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <TextArea name="suspendRemark" resize="vertical" />
      </Form>
    );
  }
}
