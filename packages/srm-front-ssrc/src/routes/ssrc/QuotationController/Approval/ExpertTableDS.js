// 评分明细表ds
import intl from 'utils/intl';

const ExpertTableDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'evaluateExpertAdjustId',
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.expertSubAccount').d('专家子账户'),
        type: 'string',
        name: 'loginName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.duty').d('职责'),
        name: 'evaluateLeaderFlagMeaning',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.currentScoringType').d('本次评分类别'),
        name: 'teamMeaning',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.expertType').d('专家类型'),
        name: 'expertCategoryMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertFrom`).d('专家来源'),
        name: 'expertFromMeaning',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.rfxPhone').d('联系电话'),
        name: 'phone',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxEmail`).d('电子邮箱'),
        name: 'email',
      },
      {
        name: 'adjustFields',
        type: 'object',
        defaultValue: [],
      },
      { name: 'addFlag' },
      { name: 'updateFlag' },
    ],
  };
};

export default ExpertTableDS;
