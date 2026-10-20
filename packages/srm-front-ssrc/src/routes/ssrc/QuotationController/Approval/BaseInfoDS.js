/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-10-27 17:31:04
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const ChangeDocumentDS = (documentTypeName) => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'rfxTitle',
        type: 'string',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, { documentTypeName })
          .d('{documentTypeName}标题'),
      },
      {
        name: 'budgetAmount',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
      },
      {
        name: 'adjustRemark',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.view.message.changeDocument`).d('变更说明'),
      },
      {
        name: 'adjustAttachmentUuid',
        type: 'attachment',
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-prequal',
        // label: intl.get(`ssrc.inquiryHall.view.message.title.changeAttachment`).d('变更附件'),
      },
      {
        name: 'rfxRemark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
    ],
  };
};

export { ChangeDocumentDS };
