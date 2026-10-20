import React, { useContext } from 'react';
import { Attachment, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { Store } from '../store/index';

export default observer(function AttachmentCard() {
  const {
    commonDs: { basicFormDs },
    routerParams: { sourceCategory },
    customizeForm,
  } = useContext(Store);
  return customizeForm(
    {
      code: `SSRC.INQUIRY_HALL.RF_CHECK.ATTACHMENT_${sourceCategory}`,
      dataSet: basicFormDs,
    },
    <Form dataSet={basicFormDs} labelLayout="float" columns={2} useWidthPercent>
      <Attachment
        fileSize={FIlESIZE}
        label={intl.get(`ssrc.rfCheck.view.message.upLoadChangeAttachment`).d('上传附件')}
        name="checkAttachmentUuid"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="ssrc-rfi-rfiheader"
        data={{
          tenantId: getCurrentOrganizationId(),
        }}
        {...ChunkUploadProps}
      />
    </Form>
  );
});
