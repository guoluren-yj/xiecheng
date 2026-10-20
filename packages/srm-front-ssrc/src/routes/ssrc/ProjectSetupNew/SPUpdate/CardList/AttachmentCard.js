import React, { useContext } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import { FIlESIZE } from '@/utils/SsrcRegx';

import { StoreContext } from '../store/StoreProvider';

export default function AttachmentCard() {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('attachmentForm'),
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} labelLayout="float" useWidthPercent columns={2}>
      <Attachment
        fileSize={FIlESIZE}
        name="sourceProjectAttachmentUuid"
        data={{
          tenantId: getCurrentOrganizationId(),
        }}
      />
    </Form>
  );
}
