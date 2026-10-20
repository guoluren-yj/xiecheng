import React from 'react';
import { Form, TextArea, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { omit } from 'lodash';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

const attProps = {
  name: 'processAttachmentUuid',
  help: (
    <div style={{ marginTop: '10px' }}>
      {intl
        .get(`ssrc.inquiryHall.view.message.upload.help`)
        .d('大小不超过50M，支持扩展名：.zip .doc .pdf .jpg...')}
    </div>
  ),
  max: 9,
  fileSize: 50 * 1024 * 1024,
  sortable: false,
};

// 禁止报价
const BanQuotation = (props = {}) => {
  const { formDS } = props || {};
  return (
    <Form dataSet={formDS} labelWidth={120} labelLayout="float">
      <TextArea name="processRemark" cols={180} rows={2} resize />
      <TextArea name="processExternalRemark" cols={180} rows={2} resize />
      <Attachment {...attProps} />
    </Form>
  );
};

const banQuotationDS = (commonProps = {}) => ({
  selection: false,
  autoCreate: true,
  fields: [
    {
      label: intl.get(`ssrc.biddingHall.model.banQuotation.innerReason`).d('禁止报价内部理由'),
      name: 'processRemark',
      type: 'string',
      maxLength: 500,
      required: true,
    },
    {
      label: intl.get(`ssrc.biddingHall.model.banQuotation.outerReason`).d('禁止报价外部理由'),
      name: 'processExternalRemark',
      type: 'string',
      maxLength: 500,
      required: true,
    },
    {
      name: 'processAttachmentUuid',
      type: 'attachment',
      label: intl.get(`ssrc.biddingHall.model.banQuotation.attachment`).d('禁止报价附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bidding',
    },
  ],
  transport: {
    submit: ({ data, params = {} }) => {
      const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

      if (!organizationId) {
        return;
      }

      // 提交数据
      const submitData = omit(data[0], '__id', '_status') || {};

      return {
        url: `${SRM_SSRC}/v1/${organizationId}/bidding/supplier/prohibit`,
        method: 'POST',
        params: {
          ...(params || {}),
          customizeUnitCode,
        },
        data: { ...otherCommonProps, ...submitData },
      };
    },
  },
});

export { BanQuotation, banQuotationDS };
