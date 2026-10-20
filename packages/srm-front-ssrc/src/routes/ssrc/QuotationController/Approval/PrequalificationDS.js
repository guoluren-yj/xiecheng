// time control DS
import intl from 'utils/intl';

const PrequalificationDS = () => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'adjustFields',
        type: 'object',
        defaultValue: [],
      },
      {
        name: 'rfxRequirePrequalHeaderDTO',
        type: 'object',
      },
      {
        name: 'nowAdjustedField',
        type: 'string',
      },
      {
        name: 'reviewMethod',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式'),
        type: 'string',
        lookupCode: 'SSRC.REVIEW_METHOD',
      },
      {
        name: 'qualifiedLimit',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`).d('合格上限'),
        type: 'number',
      },
      {
        name: 'preGroupLeaderLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`).d('预审小组成员'),
        name: 'preGroupMemberLov',
        type: 'string',
      },
      {
        name: 'prequalRemark',
        label: intl.get(`ssrc.common.qualRequirements`).d('资质要求'),
        type: 'string',
        maxLength: 800,
      },
      {
        name: 'prequalHeaderId',
        type: 'string',
      },
      {
        name: 'prequalAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`).d('资格预审文件'),
        type: 'attachment',
      },
    ],
  };
};

const promptInfoDS = () => {
  return {
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.quoController.model.controller.messageDesc').d('问题列表'),
        name: 'messageDesc',
      },
      {
        label: intl.get('ssrc.quoController.model.controller.validateValue').d('对应标段'),
        name: 'validateValue',
      },
    ],
  };
};

export { PrequalificationDS, promptInfoDS };
