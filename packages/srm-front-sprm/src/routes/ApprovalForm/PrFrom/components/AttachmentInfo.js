/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2023-09-15 17:00:39
 * @LastEditors: yanglin
 * @LastEditTime: 2023-09-22 17:53:30
 */
import React, { useMemo, Fragment } from 'react';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Attachment, Form } from 'choerodon-ui/pro';

import styles from '../index.less';

const AttachmentInfo = function AttachmentInfo({
  code,
  ds,
  customizeForm,
  showChangeAttach = false,
}) {
  const HelpMsg = useMemo(() => (
    <span className="attachment-title">
      {intl.get('sprm.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar .zip .doc
      .docx .pdf .jpg...
    </span>
  ));

  return (
    <Fragment>
      <div className={styles['order-workspace-attachment']}>
        <div className={styles['order-workspace-attachment-content']} style={{ paddingRight: 16 }}>
          <h3 id="order-workSpace-detail-content-attachmentInfo" className="content-title">
            {intl.get('sodr.workspace.view.attachment.insideAttachment').d('内部附件')}
          </h3>
          {customizeForm(
            { code: code[0] },
            <Form dataSet={ds} labelLayout="float" columns={1}>
              <Attachment
                readOnly
                labelLayout="float"
                help={HelpMsg}
                name="attachmentUuid"
                bucketName={PRIVATE_BUCKET}
              />
              {showChangeAttach && (
                <Attachment
                  readOnly
                  bucketName={PRIVATE_BUCKET}
                  name="changeAttachmentUuid"
                  labelLayout="float"
                  help={HelpMsg}
                />
              )}
            </Form>
          )}
        </div>
        <div
          className={styles['order-workspace-attachment-content']}
          style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0, 0, 0, 0.16)' }}
        >
          <h3 className="content-title">
            {intl.get('sodr.workspace.view.attachment.externalAttachment').d('外部附件')}
          </h3>
          {customizeForm(
            { code: code[1] },
            <Form dataSet={ds} labelLayout="float" columns={1}>
              <Attachment
                readOnly
                labelLayout="float"
                help={HelpMsg}
                name="externalAttachmentUuid"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="sprm"
              />
            </Form>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default AttachmentInfo;
