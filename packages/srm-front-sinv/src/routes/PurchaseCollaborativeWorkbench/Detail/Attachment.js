import React from 'react';
import intl from 'utils/intl';
import { Form, Attachment, Spin } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

// 附件信息
const AttachmentList = (props) => {
  const { attachmentDs, activeKey, loading } = props;
  return (
    <Spin spinning={loading}>
      <Form columns={2} labelLayout="float" dataSet={attachmentDs}>
        <Attachment
          showHistory
          readOnly={activeKey !== 'submit'}
          labelLayout="float"
          bucketName={PRIVATE_BUCKET}
          name="headerAttachmentUuid"
          help={
            <span>
              {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar .zip
              .doc .docx .pdf .jpg...
            </span>
          }
        />
      </Form>
    </Spin>
  );
};

export default AttachmentList;
