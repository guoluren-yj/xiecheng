import intl from 'utils/intl';

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
        disabled: true,
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
        required: true,
        label: intl.get(`ssrc.inquiryHall.view.message.changeDocument`).d('变更说明'),
      },
      {
        name: 'adjustAttachmentUuid',
        type: 'attachment',
        // label: intl.get(`ssrc.inquiryHall.view.message.title.changeAttachment`).d('变更附件'),
      },
      {
        name: 'rfxRemark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
      {
        name: 'sourceMethod',
        type: 'string',
      },
      {
        name: 'adjustFields',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (record.status === 'sync') {
            Object.assign(record, { status: 'update' });
          }
        });
      },
    },
  };
};

export { ChangeDocumentDS };
