import React, { useContext } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import Store from '../../store/index';

export default observer(function AttachmentCard() {
  const {
    customizeForm,
    commonDs: { checkPendingBasicFormDs },
    routerParams: { sourceCategory, setPath },
    remote,
  } = useContext(Store);

  const getFields = () => {
    const fields = [
      <Attachment
        readOnly
        record={checkPendingBasicFormDs?.current}
        fileSize={FIlESIZE}
        label={intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')}
        name="checkAttachmentUuid"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="ssrc-rfi-rfiheader"
        data={{
          tenantId: getCurrentOrganizationId(),
        }}
      />,
    ];

    return remote
      ? remote.process('SSRC_INQUIRY_DETAIL_RF_PROCESS_ATTACHMENT', fields, {
          setPath,
          current: checkPendingBasicFormDs?.current,
        })
      : fields;
  };
  return (
    <div>
      {customizeForm(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_ATTACHMENT`,
          dataSet: checkPendingBasicFormDs,
        },
        <Form dataSet={checkPendingBasicFormDs} labelLayout="float" columns={2} useWidthPercent>
          {getFields()}
        </Form>
      )}
    </div>
  );
});
