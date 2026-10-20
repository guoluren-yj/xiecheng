import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Attachment } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import { StoreContext } from '../store/StoreProvider';

import Style from '../index.less';

const AttachmentCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const { changeFields = [] } = headerDs?.current?.get(['changeFields']) || {};

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
        className={
          changeFields && changeFields.includes('sourceProjectAttachmentUuid')
            ? Style['sp-change-common-red']
            : ''
        }
      />
    </Form>
  );
});

export default AttachmentCmp;
