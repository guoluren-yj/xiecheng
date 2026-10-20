import React, { Fragment } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

export default function Attachments(props) {
  const {
    customizeForm = noop,
    basicFormDS,
    viewOnly = false,
    ChunkUploadProps = {},
    organizationId = null,
    getCustomizeUnitCode = noop,
  } = props;

  const CommonProps = {
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'ssrc-rfx-quotationheader',
  };

  return (
    <Fragment>
      <div>
        {customizeForm(
          {
            code: getCustomizeUnitCode('attachment'),
            dataSet: basicFormDS,
          },
          <Form
            dataSet={basicFormDS}
            columns={2}
            useWidthPercent
            labelLayout="float"
          >
            <Attachment
              name="businessAttachmentUuid"
              readOnly={viewOnly}
              data={{
                tenantId: organizationId,
              }}
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`)
                .d('商务附件')}
              {...ChunkUploadProps}
              {...CommonProps}
            />
            <Attachment
              name="techAttachmentUuid"
              readOnly={viewOnly}
              data={{
                tenantId: organizationId,
              }}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}
              {...ChunkUploadProps}
              {...CommonProps}
            />
          </Form>
        )}
      </div>
    </Fragment>
  );
}
