import React, { Component } from 'react';
import { Form, Lov } from 'choerodon-ui/pro';

export default class searchForm extends Component {
  render() {
    const { ds } = this.props;
    return (
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <Lov name="templateId" />
      </Form>
    );
  }
}
