/**
 * 资格预审头DS配置
 */
import intl from 'utils/intl';

const prequalHeaderDS = () => {
  return {
    fields: [
      {
        name: 'prequalEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`).d('预审截止时间'),
        type: 'string',
        showType: 'dateTime',
      },
      {
        name: 'reviewMethodMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式'),
      },
      {
        name: 'reviewMethod',
      },
      {
        name: 'qualifiedLimit',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`).d('合格上限'),
      },
      {
        name: 'preGroupLeaderLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`).d('预审小组成员'),
        name: 'preGroupMemberLov',
      },
      {
        name: 'enableScoreFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.enableScoreFlag`).d('启用评分细项'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'prequalRemark',
        label: intl.get(`ssrc.common.qualRequirements`).d('资质要求'),
        type: 'string',
      },
      {
        name: 'prequalHeaderId',
        type: 'string',
      },
      {
        name: 'prequalAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`).d('资格预审文件'),
        type: 'string',
      },
    ],
  };
};

export { prequalHeaderDS };
