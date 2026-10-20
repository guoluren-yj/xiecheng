import { observer } from 'mobx-react';
import React, { useContext, Fragment } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import { AttachmentComponentDiffRender } from './utils';

import Store from '../store';

const AttachmentInfo = observer((props) => {
  const { customizeForm } = useContext(Store);

  const { attachmentDs, header = {} } = props;

  const { sourceFrom } = header;

  const attachmentProps = {
    help: intl
      .get(`ssrc.inquiryHall.view.inquiryHall.supportExtension`)
      .d('支持扩展名：.rar .zip .doc .docx .pdf .jpg...'),
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'ssrc-rf-adjust',
    fileSize: FIlESIZE,
  };

  const changeAttachment = (name) => {
    const adjustFields = attachmentDs?.current?.get('adjustFields') || [];
    const attachmentUuid = attachmentDs?.current?.get(name) || '';
    if (!adjustFields.length) {
      adjustFields.push(name);
    } else if (!adjustFields.includes(name)) {
      adjustFields.push(name);
    }
    attachmentDs.current.set('adjustFields', adjustFields.length ? adjustFields : null);
    if (attachmentUuid) {
      attachmentDs.submit();
    }
  };

  const RFIForm = (
    <Form dataSet={attachmentDs} labelLayout="float" columns={2} useWidthPercent>
      <AttachmentComponentDiffRender record={attachmentDs?.current} name="rfiAttachmentUuid">
        <Attachment
          name="rfiAttachmentUuid"
          onAttachmentsChange={(attachmentFile) =>
            changeAttachment('rfiAttachmentUuid', attachmentFile)
          }
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
          onAttachmentsChange={(attachmentFile) =>
            changeAttachment('techAttachmentUuid', attachmentFile)
          }
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
          onAttachmentsChange={(attachmentFile) =>
            changeAttachment('businessAttachmentUuid', attachmentFile)
          }
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
          code: `SSRC.INQUIRY_HALL.RF_CONTROL.ATTACHMENT_INFO`,
          dataSet: attachmentDs,
        },
        rfForm
      )}
    </Fragment>
  );
});

export default AttachmentInfo;
