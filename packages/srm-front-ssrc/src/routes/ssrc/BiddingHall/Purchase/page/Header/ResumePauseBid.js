import React from 'react';
import { Form, TextArea, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const attProps = {
  name: 'processAttachmentUuid',
  help: (
    <div style={{ marginTop: '10px' }}>
      {intl
        .get(`ssrc.inquiryHall.view.message.upload.help`)
        .d('大小不超过50M，支持扩展名：.zip .doc .pdf .jpg...')}
    </div>
  ),
  max: 9,
  fileSize: 50 * 1024 * 1024,
  sortable: false,
};

// 开始竞价
const ResumeBid = (props = {}) => {
  const { formDS } = props || {};
  return (
    <Form dataSet={formDS} labelWidth={100} labelLayout="float">
      <TextArea name="processRemark" cols={180} rows={2} resize />
      <TextArea name="processExternalRemark" cols={180} rows={2} resize />
      <Attachment {...attProps} />
    </Form>
  );
};

// 暂停竞价
const PauseBid = (props = {}) => {
  const { formDS } = props || {};
  return (
    <Form dataSet={formDS} labelWidth={100} labelLayout="float">
      <TextArea name="processRemark" cols={180} rows={2} resize />
      <TextArea name="processExternalRemark" cols={180} rows={2} resize />
      <Attachment {...attProps} />
    </Form>
  );
};

export { ResumeBid, PauseBid };
