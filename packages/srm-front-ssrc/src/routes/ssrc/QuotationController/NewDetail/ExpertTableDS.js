// 评分明细表ds
import { isObject } from 'lodash';
import { toJS } from 'mobx';

import intl from 'utils/intl';
import { getCurrentTenant } from 'utils/utils';
// import notification from 'utils/notification';
import { Prefix } from '@/utils/globalVariable';

const ExpertTableDS = () => {
  // 二阶段隐藏字段逻辑：待开标 && 二阶段存在标识 && 一阶段已全部完成
  const getExistSecondOpenBidFlag = (dataSet) => {
    const { existSecondOpenBidFlag, rfxStatus, allOpenedFlag } =
      dataSet?.queryParameter?.commonData?.header || {};
    return rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;
  };
  return {
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'evaluateExpertAdjustId',
    dataToJSON: 'all',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        name: 'expertLov',
        type: 'object',
        ignore: 'always',
        required: true,
        textField: 'loginName',
        valueField: 'expertId',
        dynamicProps: {
          lovCode({ dataSet }) {
            const { expertSource = null } = dataSet.queryParameter.commonData?.header || {};
            return !expertSource || expertSource === 'EXPERT_LIBRARY'
              ? 'SSRC.ACCOUNT_EXPERT'
              : 'SSRC.EXPERT_SUB_ACCOUNT';
          },
          lovPara({ dataSet }) {
            const {
              expertSource = null,
              bidRuleType = null,
              rfxHeaderId,
              expertExtractFlag,
              expertReplyFlag,
              adjustRecordId,
            } = dataSet.queryParameter.commonData?.header || {};

            return !expertSource || expertSource === 'EXPERT_LIBRARY'
              ? {
                  fuzzyQueryFlag: bidRuleType !== 'NONE' ? 1 : null,
                  enabledFlag: 1,
                  adjustRecordId,
                  sourceFrom: 'RFX',
                  sourceFromId: rfxHeaderId,
                  operateType: 'RFX_ADJUST',
                  expertExtractFlag,
                  expertReplyFlag,
                }
              : {
                  tenantId: getCurrentTenant().tenantId,
                };
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        name: 'expertName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.duty`).d('职责'),
        name: 'evaluateLeaderFlag',
        required: true,
        type: 'string',
        lookupCode: 'SSRC.EXPERT_DUTY',
        defaultValue: '0',
        dynamicProps: {
          disabled({ dataSet }) {
            return getExistSecondOpenBidFlag(dataSet);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentScoringType`).d('本次评分类别'),
        name: 'team',
        required: true,
        lookupCode: 'SSRC.EXPERT_TEAM',
        type: 'string',
        dynamicProps: {
          required({ dataSet }) {
            const { bidRuleType = null } = dataSet.queryParameter.commonData?.header || {};
            return bidRuleType && bidRuleType !== 'NONE';
          },
          disabled({ dataSet }) {
            return getExistSecondOpenBidFlag(dataSet);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertType`).d('专家类型'),
        name: 'expertTypeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertFrom`).d('专家来源'),
        name: 'expertFromMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxPhone`).d('联系电话'),
        name: 'phone',
        type: 'string',
      },
      {
        name: 'internationalTelCode',
        type: 'string',
        lookupCode: 'HPFM.IDD',
      },
      {
        name: 'internationalTelCodeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxEmail`).d('电子邮箱'),
        name: 'email',
      },
      {
        name: 'loginName',
        trim: 'none',
        bind: 'expertLov.loginName',
      },
      {
        name: 'expertId',
        bind: 'expertLov.expertId',
      },
      {
        name: 'expertCategory',
      },
      {
        name: 'expertUserId',
      },
      {
        name: 'sourceFrom',
        type: 'string',
        defaultValue: 'RFX',
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'sourceHeaderId',
      },
      {
        name: 'organizationId',
      },
      {
        name: 'tenantId',
      },
      {
        name: 'expertStatus',
        defaultValue: 'SUBMITTED',
      },
      {
        name: 'leaderFlag',
        defaultValue: 0,
      },
      {
        name: 'evaluateExpertAdjustFields',
        type: 'string',
      },
      {
        name: 'adjustRecordId',
      },
      {
        name: 'sourceHeaderAdjustId',
      },
      {
        name: 'sourceEvaluateExpert',
        defaultValue: null,
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          // 【专家抽取】的专家不允许手动删除
          if (record?.data?.expertFrom === 'EXPERT_EXTRACT') {
            Object.assign(record, { selectable: false });
          }
        });
      },
      create: ({ record }) => {
        record.set(
          'evaluateExpertAdjustFields',
          'expertName,evaluateLeaderFlag,team,expertId,loginName,email,phone,internationalTelCode'
        );
      },
      update: ({ dataSet, record, name, value }) => {
        const updateFields = (fields = []) => {
          if (record.status === 'add') {
            return;
          }

          let newFields = record.get('evaluateExpertAdjustFields') || '';
          newFields = newFields.split(',').filter(Boolean);

          fields.forEach((field) => {
            const currentIndex = newFields.indexOf(field);
            const currentValue = isObject(value) ? value[name] : value;
            const pristineValue = (record.get('sourceEvaluateExpert') || {})[name];
            // eslint-disable-next-line eqeqeq
            if (currentIndex > -1 && currentValue == pristineValue) {
              newFields.splice(currentIndex, 1);
            } else if (!newFields.includes(field)) {
              newFields.push(field);
            }
          });

          newFields = newFields.join(',');
          record.set('evaluateExpertAdjustFields', newFields);
        };

        const {
          queryParameter: { commonData = {} },
        } = dataSet;
        const { expertSource = null } = commonData?.header || {};
        if (name === 'expertLov') {
          if (!expertSource || expertSource === 'EXPERT_LIBRARY') {
            const {
              expertName,
              expertId,
              loginName,
              expertCategory,
              expertTypeMeaning,
              expertType = null,
              mobilephone,
              telephone,
              mail,
              userId,
              realName = null,
              phone = null,
              internationalTelCode = null,
              internationalTelCodeMeaning = null,
            } = value || {};

            record.set('expertName', expertName || realName);
            record.set('expertId', expertId);
            record.set('loginName', loginName);
            record.set('expertType', expertType);
            record.set('expertTypeMeaning', expertTypeMeaning);
            record.set('email', mail);
            record.set('phone', mobilephone || telephone || phone);
            record.set('expertUserId', userId);
            record.set('team', expertCategory);
            record.set('expertCategory', expertCategory);
            record.set('internationalTelCode', internationalTelCode);
            record.set('internationalTelCodeMeaning', internationalTelCodeMeaning);
            record.set('expertLov', value || {});
          } else {
            const { expertCategory } = value || {};
            record.set('expertName', value?.realName);
            record.set('expertType', 'INTERNAL');
            record.set('expertUserId', value?.id);
            record.set('phone', value?.phone);
            record.set('email', value?.mail);
            record.set('team', expertCategory);
            record.set('expertCategory', expertCategory);
            record.set('internationalTelCode', value?.internationalTelCode);
            record.set('internationalTelCodeMeaning', value?.internationalTelCodeMeaning);
          }
          record.set('expertStatus', 'SUBMITTED');
          updateFields([
            'expertName',
            'expertId',
            'loginName',
            'email',
            'phone',
            'internationalTelCode',
          ]);
        } else if (name === 'evaluateLeaderFlag') {
          record.set('evaluateLeaderFlag', value);
          updateFields(['evaluateLeaderFlag']);
        } else if (name === 'team') {
          record.set('team', value);
          updateFields(['team']);
        } else if (name === 'expertTypeMeaning') {
          record.set('expertTypeMeaning', value);
          updateFields(['expertTypeMeaning']);
        } else if (name === 'phone') {
          record.set('phone', value);
          updateFields(['phone']);
        } else if (name === 'email') {
          record.set('email', value);
          updateFields(['email']);
        }
      },
    },
    transport: {
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonData = {} },
        } = dataSet;
        const { organizationId } = commonData || {};
        const ids = data.map((item) => item.evaluateExpertAdjustId);

        const params = toJS(dataSet.getState('deleteParams'));

        return {
          url: `${Prefix}/${organizationId}/evaluate-expert-adjusts/remove`,
          method: 'DELETE',
          data: { evaluateExpertAdjustIds: ids, ...(params || {}) },
        };
      },
    },
  };
};

export default ExpertTableDS;
