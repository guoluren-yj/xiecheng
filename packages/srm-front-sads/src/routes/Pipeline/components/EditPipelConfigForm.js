import React, { Component } from 'react';

import { Form, TextField } from 'choerodon-ui/pro';

export default class EditPipelConfigForm extends Component {
  render() {
    const { record } = this.props;
    return (
      <Form labelLayout="float" columns={1} record={record}>
        <TextField name="pipelineCode" />
        <TextField name="pipelineName" />
        <TextField name="remark" />
      </Form>
    );
  }
}
