/**
 * @description 提交中止，确认完成弹窗
 */

import React, { Component } from 'react';
import { TextField, DatePicker, Form, TextArea } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['sprm.semandReport', 'sprm.common', 'entity.item', 'sprm.cux3sbio'],
})
export default class SubmitForm extends Component {
  render() {
    const { dataSet } = this.props;
    return (
      <div>
        <Form dataSet={dataSet} useColon={false} labelLayout="float" columns={1}>
          <TextField name="reqNum" />
          <TextField name="reqType" />
          <TextField name="createdByName" />
          <DatePicker name="creationDate" />
          <TextField name="reqStatus" />
          <TextArea name="reqReason" resize="vertical" />
        </Form>
      </div>
    );
  }
}
