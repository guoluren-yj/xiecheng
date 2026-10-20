import React, { Component } from 'react';

import { Form, TextField, Lov } from 'choerodon-ui/pro';

export default class InputSourceForm extends Component {
  render() {
    const { record, codeEnabled } = this.props;

    return (
      <Form labelLayout="float" columns={1} record={record}>
        <TextField name="outputSourceCode" disabled={codeEnabled} />
        <TextField name="outputSourceName" />
        <TextField name="remark" />
        <Lov name="pipelineConfig" />
        <Lov name="indexLov" />
        <TextField name="indexIdWildcard" />
      </Form>
    );
  }
}
