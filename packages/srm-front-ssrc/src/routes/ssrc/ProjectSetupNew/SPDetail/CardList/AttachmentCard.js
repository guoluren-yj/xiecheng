import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Attachment } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import { StoreContext } from '../store/StoreProvider';

const AttachmentCmp = observer(() => {
  const { commonDs: { headerDs } = {}, getCustomizeUnitCode, customizeForm } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('attachmentForm'),
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} columns={2} labelLayout="float" useWidthPercent>
      <Attachment
        readOnly
        name="sourceProjectAttachmentUuid"
        data={{
          tenantId: getCurrentOrganizationId(),
        }}
      />
    </Form>
  );
});

export default AttachmentCmp;
