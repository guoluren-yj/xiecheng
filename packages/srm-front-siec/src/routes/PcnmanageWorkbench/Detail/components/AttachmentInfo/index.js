import React, { Fragment } from 'react';
// import { BUCKET_NAME, BUCKET_DIRECTORY } from '_utils/config';
import intl from 'utils/intl';

import { Form, Spin, Attachment } from 'choerodon-ui/pro';

// 附件信息
const AttachmentList = (props) => {
  const { attachmentInfoDs, editableFlag, pageFlags, customizeForm } = props;
  const { searchFlag, approveFlag, sqeApproveFlag, sourceFromPub } = pageFlags;
  const creatFlag = !(searchFlag || approveFlag || sqeApproveFlag); // 新建页面标识
  const currentEditableFlag = editableFlag && creatFlag && !sourceFromPub;

  return (
    <Fragment>
      <Spin dataSet={attachmentInfoDs}>
        <div>
          {customizeForm(
            {
              code: `SIEC.PCN_MANAGEWORK_BENCH_DETAI.ATTACHMENT`,
              __force_record_to_update__: true,
            },
            <Form useWidthPercent columns={2} labelLayout="float" dataSet={attachmentInfoDs}>
              <Attachment
                readOnly
                // labelLayout="float"
                bucketName="private-bucket"
                bucketDirectory="siec-pcn"
                name="attachmentUuidTemplate"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
              <Attachment
                // labelLayout="float"
                bucketName="private-bucket"
                bucketDirectory="siec-pcn"
                readOnly={!currentEditableFlag}
                name="supplierAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
              <Attachment
                // labelLayout="float"
                bucketName="private-bucket"
                hidden={!(searchFlag || approveFlag || sqeApproveFlag)}
                bucketDirectory="siec-pcn"
                readOnly={!editableFlag && !(approveFlag || sqeApproveFlag)}
                name="attachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>
  );
};

export default AttachmentList;
