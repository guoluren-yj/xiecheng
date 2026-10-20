import React from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

const AttachmentForm = observer((props = {}) => {
  const { attachmentDs, customizeForm = noop, getCustomizeUnitCode = noop } = props || {};

  const formProps = {
    dataSet: attachmentDs,
    labelLayout: 'float',
    columns: 2,
  };
  return customizeForm(
    {
      code: getCustomizeUnitCode('attachmentForm'),
      dataSet: attachmentDs,
    },
    <Form {...formProps}>
      <Attachment name="businessAttachmentUuid" />
      <Attachment name="techAttachmentUuid" />
    </Form>
  );
});

export default AttachmentForm;
