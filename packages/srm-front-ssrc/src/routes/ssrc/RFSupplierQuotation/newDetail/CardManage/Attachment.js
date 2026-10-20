import React, { Fragment, useContext, useEffect } from 'react';
import { Row, Form, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { Store } from '../store/index';
// import styles from '../rfComponent/common.less';
// import Style from './index.less';

export default observer(function AttachmentCard() {
  const {
    customizeForm,
    customizeCollapseForm,
    ref: { attachementRef },
    routerParams: { sourceCategory },
    commonDs: { attachementDs, basicFormDs },
    storeData: { detailFlag },
  } = useContext(Store);

  useEffect(() => {
    attachementDs.query();
  }, []);

  return (
    <Fragment>
      {sourceCategory === 'RFP' && (
        <>
          {/* <div className={Style['supplier-reply-attachment']}>
            <h3 className={styles['card-sub-title']} style={{ flex: 1 }}>
              <div className={styles['card-sub-title-line']} />
              {intl.get('ssrc.rf.view.card.subtitle.techAttach').d('技术组附件')}
            </h3>
            <h3 className={styles['card-sub-title']} style={{ flex: 1 }}>
              <div className={styles['card-sub-title-line']} />
              {intl.get('ssrc.rf.view.card.subtitle.businessAttach').d('商务组附件')}
            </h3>
          </div> */}
          <div style={{ marginLeft: '4px' }}>
            {customizeCollapseForm(
              {
                code: 'SSRC.SUPPLIER_REPLY_RFP.ATTACHMENT',
                dataSet: attachementDs,
                gutter: 8,
              },
              <Form
                dataSet={attachementDs}
                // className={Style['supplier-reply-form']}
                ref={(ref) => {
                  attachementRef.current = ref;
                }}
                labelLayout="float"
                columns={2}
                // layout="none"
                // showLines={1}
                useWidthPercent
              >
                {basicFormDs?.current?.get('evaluateShowType') !== 'BUSS' && (
                  <Attachment
                    readOnly={detailFlag}
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
                )}
                {basicFormDs?.current?.get('evaluateShowType') !== 'TECH' && (
                  <Attachment
                    newLine
                    readOnly={detailFlag}
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
                )}
              </Form>
            )}
          </div>
        </>
      )}
      {sourceCategory === 'RFI' && (
        <Row>
          {customizeForm(
            {
              code: 'SSRC.SUPPLIER_REPLY_RFI.ATTACHMENT',
              dataSet: attachementDs,
            },
            <Form
              dataSet={attachementDs}
              ref={(ref) => {
                attachementRef.current = ref;
              }}
              labelLayout="float"
              useWidthPercent
              columns={2}
            >
              <Attachment
                readOnly={detailFlag}
                sortable={false}
                fileSize={FIlESIZE}
                columns={2}
                label={
                  detailFlag
                    ? intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')
                    : intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件')
                }
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
        </Row>
      )}
    </Fragment>
  );
});
