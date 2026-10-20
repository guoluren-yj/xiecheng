import React from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from '../index';

// 附件信息
const AttachmentList = (props) => {
  const { attachmentDs, editFlag } = props;
  return (
    <>
      <Content className={styles['attach-wrap']}>
        <div className={styles['footer-form']}>
          <Form columns={2} labelLayout="float" dataSet={attachmentDs}>
            <Attachment
              readOnly
              labelLayout="float"
              bucketName={PRIVATE_BUCKET}
              name="approveAttachmentUuid"
              help={
                <span>
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
            />
            <Attachment
              readOnly
              labelLayout="float"
              bucketName={PRIVATE_BUCKET}
              name="supplierAttachmentUuid"
              help={
                <span>
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
            />
            <Attachment
              readOnly
              labelLayout="float"
              bucketName={PRIVATE_BUCKET}
              name="reviewAttachmentUuid"
              help={
                <span>
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
            />
            <Attachment
              readOnly={editFlag}
              labelLayout="float"
              bucketName={PRIVATE_BUCKET}
              name="supplierAttaUuid"
              help={
                <span>
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
            />
            <Attachment
              readOnly
              labelLayout="float"
              bucketName={PRIVATE_BUCKET}
              name="otherAttachmentUuid"
              help={
                <span>
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
            />
          </Form>
        </div>
      </Content>
    </>
  );
};

export default AttachmentList;
