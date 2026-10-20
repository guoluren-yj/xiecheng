import React, { Fragment } from 'react';
import { Form, Spin, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from './form.less';

// 附件信息
const AttachInfo = (props) => {
  const { ds, editFlag, customizeForm } = props;

  const attachInfoColumns = [
    {
      name: 'approveAttachmentUuid',
      readOnly: true,
    },
    {
      name: 'supplierAttachmentUuid',
      readOnly: true,
    },
    {
      name: 'reviewAttachmentUuid',
      readOnly: true,
    },
    {
      name: 'supplierAttaUuid',
      readOnly: true,
    },
    {
      name: 'otherAttachmentUuid',
    },
  ];

  return (
    <Fragment>
      <Spin spinning={false}>
        <Content className={styles['attach-info']}>
          <div className={styles.title}>
            <h3 className={styles['override-h3']} id="purchaser-delivery-attachInfo">
              {intl.get('sinv.common.attachment.upload').d('附件管理')}
            </h3>
          </div>
          <div className={editFlag ? styles['content-edit'] : styles.content}>
            {customizeForm(
              {
                code: 'SINV.PURCHASER_DELIVERY.DETAIL.ATTACH',
                readOnly: !editFlag,
                __force_record_to_update__: true,
              },
              <Form labelLayout={editFlag ? 'float' : 'vertical'} dataSet={ds} columns={2}>
                {attachInfoColumns.map((res) =>
                  editFlag ? (
                    <Attachment
                      {...res}
                      labelLayout="float"
                      bucketName={PRIVATE_BUCKET}
                      help={
                        <span>
                          {intl
                            .get('sinv.common.view.attachment.supportExtensions')
                            .d('支持扩展名')}
                          : .rar .zip .doc .docx .pdf .jpg...
                        </span>
                      }
                    />
                  ) : (
                    // <Output {...res} />
                    <Attachment
                      {...res}
                      readOnly
                      labelLayout="float"
                      bucketName={PRIVATE_BUCKET}
                      help={
                        <span>
                          {intl
                            .get('sinv.common.view.attachment.supportExtensions')
                            .d('支持扩展名')}
                          : .rar .zip .doc .docx .pdf .jpg...
                        </span>
                      }
                    />
                  )
                )}
              </Form>
            )}
          </div>
        </Content>
      </Spin>
    </Fragment>
  );
};

export default AttachInfo;
