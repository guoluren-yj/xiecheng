import { observer } from 'mobx-react';
import React, { Fragment } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { AttachmentComponentDiffRender } from '@/routes/ssrc/InquiryHallNew/RFController/CardMessage/utils.js';

const AttachmentInfo = observer((props) => {
  const { attachmentDs, header = {}, customizeForm, getCustomizeUnitCode, viewType } = props;

  const { sourceFrom } = header || {};

  const attachmentProps = {
    // readOnly: true,
  };

  const RFIForm = (
    <Form dataSet={attachmentDs} labelLayout="float" columns={2} useWidthPercent>
      <AttachmentComponentDiffRender record={attachmentDs?.current} name="rfiAttachmentUuid">
        <Attachment
          name="rfiAttachmentUuid"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          {...attachmentProps}
          label={intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件')}
        />
      </AttachmentComponentDiffRender>
    </Form>
  );

  const RFPForm = (
    <Form dataSet={attachmentDs} labelLayout="float" columns={2} useWidthPercent>
      <AttachmentComponentDiffRender record={attachmentDs?.current} name="techAttachmentUuid">
        <Attachment
          name="techAttachmentUuid"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          {...attachmentProps}
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}
        />
      </AttachmentComponentDiffRender>
      <AttachmentComponentDiffRender record={attachmentDs?.current} name="businessAttachmentUuid">
        <Attachment
          name="businessAttachmentUuid"
          {...attachmentProps}
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件')}
        />
      </AttachmentComponentDiffRender>
    </Form>
  );

  const rfForm = sourceFrom === 'RFI' ? RFIForm : RFPForm;
  return (
    <Fragment>
      {customizeForm(
        {
          code: getCustomizeUnitCode('attachment', viewType),
          dataSet: attachmentDs,
        },
        rfForm
      )}
    </Fragment>
  );
});

export default AttachmentInfo;
