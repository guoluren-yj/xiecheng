import React, { Fragment } from 'react';
import { Form, Spin, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';

import styles from './form.less';

// 附件信息
const AttachmentList = (props) => {
  const { attachmentDs } = props;
  return (
    <Fragment>
      <Spin spinning={false}>
        <Content style={{ marginTop: 0, marginBottom: 8, padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 className={styles['page-title']}>
              {intl.get('sinv.common.attachment.upload').d('附件管理')}
            </h3>
          </div>
          <div className={styles['footer-form']}>
            <Form columns={2} labelLayout="float" dataSet={attachmentDs}>
              {/* <Attachment
                readOnly
                labelLayout="float"
                bucketName={PRIVATE_BUCKET}
                name="approveAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              /> */}
              {/* <Attachment
                readOnly
                labelLayout="float"
                bucketName={PRIVATE_BUCKET}
                name="reviewAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              /> */}
              <Attachment
                readOnly
                labelLayout="float"
                bucketName={PRIVATE_BUCKET}
                name="otherAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
              <Attachment
                labelLayout="float"
                bucketName={PRIVATE_BUCKET}
                name="supplierAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
            </Form>
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export { AttachmentList };
