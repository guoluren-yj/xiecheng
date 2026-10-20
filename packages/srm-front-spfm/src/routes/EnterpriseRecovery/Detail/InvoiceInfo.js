import React from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import classnames from 'classnames';

export default ({ ds, header, className }) => {
  return (
    <Form
      columns={3}
      header={header}
      dataSet={ds}
      className={classnames(className, 'sslm-c7n-wrap-form')}
      labelLayout="vertical"
    >
      <Output name="invoiceHeader" />
      <Output name="taxRegistrationNumber" />
      <Output name="depositBank" />
      <Output name="bankAccountNum" />
      <Output name="taxRegistrationAddress" />
      <Output name="taxRegistrationPhone" />
      <Output name="receiveMail" />
      <Output name="receivePhone" />
    </Form>
  );
};
