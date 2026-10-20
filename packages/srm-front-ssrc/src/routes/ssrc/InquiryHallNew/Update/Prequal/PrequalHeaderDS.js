/**
 * 资格预审头DS配置
 */
import intl from 'utils/intl';

const prequalHeaderDS = ({ organizationId, preQualificationFlag, rfxInfoDS }) => ({
  primaryKey: 'prequalGroupHeaderId',
  paging: false,
  fields: [
    /**
     * 资格预审
     * */
    {
      name: 'prequalEndDate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`).d('预审截止时间'),
      type: 'dateTime',
      required: true,
      min: new Date(),
      dynamicProps: {
        max({ record }) {
          if (rfxInfoDS) {
            const biddingHallFlag = rfxInfoDS?.getState('biddingHallFlag');
            const { sourceCategory, biddingFlag } =
              rfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};
            const newBiddingFlag = biddingHallFlag && sourceCategory === 'RFA' && biddingFlag;
            if (newBiddingFlag) {
              // 新竞价走此逻辑
              const {
                biddingOnlineSignInFlag,
                signInStartDate,
                biddingTrialBiddingFlag,
                startingTrialBiddingStartDate,
                quotationStartDate,
              } =
                rfxInfoDS?.current?.get([
                  'biddingOnlineSignInFlag',
                  'signInStartDate',
                  'biddingTrialBiddingFlag',
                  'startingTrialBiddingStartDate',
                  'quotationStartDate',
                ]) || {};

              // 如果签到配置为真且有签到开始有值时间
              if (biddingOnlineSignInFlag && signInStartDate) {
                return signInStartDate;
              }

              // 模板中【试竞价】为【是】且试竞价截止时间有值时，只能选到试竞价截止时间后的时间
              if (biddingTrialBiddingFlag && startingTrialBiddingStartDate) {
                return startingTrialBiddingStartDate;
              }

              if (quotationStartDate) {
                return quotationStartDate;
              }
            }
          }
          const quotationStartTime =
            record.get('quotationTime1') && record.get('quotationTime1').quotationStartTime1;
          if (quotationStartTime) {
            return quotationStartTime;
          }
        },
      },
    },
    {
      name: 'reviewMethod',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式'),
      type: 'string',
      required: true,
      lookupCode: 'SSRC.REVIEW_METHOD',
      defaultValue: 'QUALIFIED',
    },
    {
      name: 'qualifiedLimit',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`).d('合格上限'),
      type: 'number',
      step: 1,
      dynamicProps: {
        required({ record }) {
          return record.get('reviewMethod') === 'LIMITED_QUANTITY' && preQualificationFlag;
        },
      },
    },
    {
      name: 'preGroupLeaderLov',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SSRC.PREQUAL_USER',
      textField: 'realName',
      valueField: 'id',
      required: true,
      dynamicProps: {
        lovPara() {
          return {
            organizationId,
          };
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`).d('预审小组成员'),
      name: 'preGroupMemberLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSRC.PREQUAL_USER',
      textField: 'realName',
      valueField: 'id',
      multiple: true,
      lovPara: {
        organizationId,
      },
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
      required: true,
    },
  ],
});

export { prequalHeaderDS };
