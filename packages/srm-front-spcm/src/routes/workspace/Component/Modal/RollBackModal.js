import React, { Component } from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

export default class componentName extends Component {

  render() {
    const { ds } = this.props;
    return (
      <Form labelLayout="float" dataSet={ds} columns={1} labelWidth={130} labelAlign="left">
        <TextArea name='backReason' resize="both" />
      </Form>
    );
  }
}
