import React from 'react';
import { Modal, TextArea, Form, DataSet } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';

import { terminateDS } from './DataSet';

export default function showTerminateModal(onTerminate, customizeForm) {
  // 初始化ds;
  const terminateDs = new DataSet(terminateDS());
  terminateDs.create({});
  const children = customizeForm(
    {
      code: 'SPCM.CONTRACT.CONTROL.TERMINATION',
    },
    <Form dataSet={terminateDs}>
      <TextArea name="terminationReason" resize="both" />
      <Upload
        bucketName={PRIVATE_BUCKET}
        name="terminationAttachmentUuid"
        bucketDirectory="purchaser-attachment"
        afterOpenUploadModal={uuid => {
        terminateDs.current.set('terminationAttachmentUuid', uuid);
      }}
      />
    </Form>
  );

  Modal.open({
    closable: true,
    movable: false,
    key: Modal.key(),
    title: intl.get(`spcm.contractChange.view.button.terminate`).d('终止'),
    style: {
      width: 500,
    },
    children,
    onOk: () => onTerminate(terminateDs),
  });
}
