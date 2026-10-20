import React, { Fragment, useContext } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

// import Upload from '_components/C7NUpload';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import Store from '../store/index';
// import styles from '../../rfComponents/common.less';

export default function AttachmentCard() {
  const {
    customizeForm,
    ref: { attachmentRef },
    routerParams: { sourceCategory },
    commonDs: { basicFormDs },
  } = useContext(Store);

  return (
    <Fragment>
      {sourceCategory === 'RFP' && (
        <>
          {/* <div className={Style['update-attachment']}>
            <h3 className={styles['card-sub-title']} style={{ margin: 0, flex: 1 }}>
              <div className={styles['card-sub-title-line']} />
              {intl.get('ssrc.rf.view.card.subtitle.techAttach').d('技术组附件')}
            </h3>
            <h3 className={styles['card-sub-title']} style={{ margin: 0, flex: 1 }}>
              <div className={styles['card-sub-title-line']} />
              {intl.get('ssrc.rf.view.card.subtitle.businessAttach').d('商务组附件')}
            </h3>
          </div> */}
          <div>
            {customizeForm(
              {
                code: 'SSRC.INQUIRY_HALL.RF_EDIT.RFP_ATTACHMENT',
                dataSet: basicFormDs,
              },
              <Form
                dataSet={basicFormDs}
                ref={ref => {
                  attachmentRef.current = ref;
                }}
                labelLayout="float"
                useWidthPercent
                columns={2}
              >
                <Attachment
                  fileSize={FIlESIZE}
                  label={intl.get('ssrc.rf.view.card.subtitle.techAttach').d('技术组附件')}
                  name="techAttachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfp-prequal"
                  data={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                  {...ChunkUploadProps}
                />
                <Attachment
                  fileSize={FIlESIZE}
                  label={intl.get('ssrc.rf.view.card.subtitle.businessAttach').d('商务组附件')}
                  name="businessAttachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfp-rfpheader"
                  data={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                  {...ChunkUploadProps}
                />
              </Form>
            )}
          </div>
        </>
      )}
      {sourceCategory === 'RFI' && (
        <div>
          {customizeForm(
            {
              code: 'SSRC.INQUIRY_HALL.RF_EDIT.RFI_ATTACHMENT',
              dataSet: basicFormDs,
            },
            <Form
              dataSet={basicFormDs}
              ref={ref => {
                attachmentRef.current = ref;
              }}
              labelLayout="float"
              useWidthPercent
              columns={2}
            >
              <Attachment
                fileSize={FIlESIZE}
                label={intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件')}
                name="rfiAttachmentUuid"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfi-rfiheader"
                data={{
                  tenantId: getCurrentOrganizationId(),
                }}
                {...ChunkUploadProps}
              />
            </Form>
          )}
        </div>
      )}
    </Fragment>
  );
}
