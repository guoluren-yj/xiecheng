import React, { Fragment } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import FileTemplateAttachment from './components/FileTemplateAttachment';

export default function AttachmentCard(props) {
  const {
    customizeForm,
    onRef,
    rfxInfoDS,
    viewOnly = false,
    afterCustomizeDs,
    rfx: { sourceKey, bidFlag = false },
    ChunkUploadProps = {},
    remote,
    fetchInquiryHallUpdate,
    isNewRfx = false,
    fileTemplateManageFlag, // 是否启用招标文件管理标识
    ...otherProps
  } = props;

  // 附件列表改变回调
  const handleAttachmentChange = (type, attachmentFile) => {
    if (remote?.event) {
      remote.event.fireEvent('clearAttachmentUUid', {
        bidFlag,
        type,
        attachmentFile,
        rfxInfoDS,
        isNewRfx,
        fetchInquiryHallUpdate,
      });
    }
  };

  // 配置表还未查出
  if (fileTemplateManageFlag === -1) return null;

  return (
    <Fragment>
      {fileTemplateManageFlag ? (
        <FileTemplateAttachment {...props} />
      ) : (
        customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM`,
            dataSet: rfxInfoDS,
            afterCustomizeDs,
            enableEmpty: true,
          },
          <Form dataSet={rfxInfoDS} ref={onRef} labelLayout="float" columns={2} useWidthPercent>
            <Attachment
              name="techAttachmentUuid"
              readOnly={viewOnly}
              data={{
                tenantId: getCurrentOrganizationId(),
              }}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}
              {...ChunkUploadProps}
              {...otherProps}
              onAttachmentsChange={(attachmentFile) =>
                handleAttachmentChange('TECH', attachmentFile)
              }
            />
            <Attachment
              name="businessAttachmentUuid"
              readOnly={viewOnly}
              data={{
                tenantId: getCurrentOrganizationId(),
              }}
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`)
                .d('商务附件')}
              {...ChunkUploadProps}
              {...otherProps}
              onAttachmentsChange={(attachmentFile) =>
                handleAttachmentChange('BUSINESS', attachmentFile)
              }
            />
          </Form>
        )
      )}
    </Fragment>
  );
}
