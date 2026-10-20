import React, { Fragment, useContext } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

// import Upload from '_components/C7NUpload';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { PRIVATE_BUCKET } from '_utils/config';

import Store from '../../store/index';
// import styles from '../../../rfComponents/common.less';
// import Style from './index.less';

export default observer(function AttachmentCard() {
  const {
    customizeForm,
    routerParams: { sourceCategory },
    commonDs: { createBasicFormDs },
  } = useContext(Store);
  return (
    <Fragment>
      {sourceCategory === 'RFP' && (
        <>
          {/* <div className={Style['detail-attachment']}>
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
                code: 'SSRC.INQUIRY_HALL_RF_DETAIL.CREATE_RFP_ATTACHMENT',
                dataSet: createBasicFormDs,
              },
              <Form dataSet={createBasicFormDs} labelLayout="float" columns={2} useWidthPercent>
                <Attachment
                  readOnly
                  record={createBasicFormDs?.current}
                  fileSize={FIlESIZE}
                  label={intl.get('ssrc.rf.view.card.subtitle.techAttach').d('技术组附件')}
                  name="techAttachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfp-prequal"
                  data={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                />
                <Attachment
                  readOnly
                  newLine
                  record={createBasicFormDs?.current}
                  fileSize={FIlESIZE}
                  label={intl.get('ssrc.rf.view.card.subtitle.businessAttach').d('商务组附件')}
                  name="businessAttachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfp-rfpheader"
                  data={{
                    tenantId: getCurrentOrganizationId(),
                  }}
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
              code: 'SSRC.INQUIRY_HALL_RF_DETAIL.CREATE_RFI_ATTACHMENT',
              dataSet: createBasicFormDs,
            },
            <Form dataSet={createBasicFormDs} labelLayout="float" columns={2} useWidthPercent>
              <Attachment
                readOnly
                fileSize={FIlESIZE}
                label={intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')}
                name="rfiAttachmentUuid"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfi-rfiheader"
                data={{
                  tenantId: getCurrentOrganizationId(),
                }}
              />
            </Form>
          )}
        </div>
      )}
    </Fragment>
  );
});
