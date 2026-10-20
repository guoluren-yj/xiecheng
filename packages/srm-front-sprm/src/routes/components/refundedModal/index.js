import React, { Component } from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
@WithCustomizeC7N({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.BACK_MODAL',
    'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.BACK_MODAL',
  ],
})
export default class RefundedModal extends Component {
  render() {
    const { ds, refundedLabel, customizeForm, code } = this.props;
    return customizeForm(
      {
        code, // 必传，和unitCode一一对应
        dataSet: ds,
      },
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <TextArea name="backToUnassignReason" label={refundedLabel} resize="vertical" />
      </Form>
    );
  }
}
