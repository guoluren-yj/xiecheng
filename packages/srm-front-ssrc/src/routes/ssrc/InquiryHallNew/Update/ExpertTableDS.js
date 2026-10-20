// 评分明细表ds
import intl from 'utils/intl';
import { getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';
import { toJS } from 'mobx';

import { Prefix } from '@/utils/globalVariable';
import { commonValidationRules } from './utils/dsUtils';

const ExpertTableDS = () => {
  return {
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'evaluateExpertId',
    dataToJSON: 'all',
    paging: false,
    validationRules: commonValidationRules('minLength')(),
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
            const { expertSource = null } = dataSet.queryParameter.headers || {};
            return !expertSource || expertSource === 'EXPERT_LIBRARY'
              ? 'SSRC.ACCOUNT_EXPERT'
              : 'SSRC.EXPERT_SUB_ACCOUNT';
          },
          lovPara({ dataSet }) {
            const {
              expertSource = null,
              bidRuleType = null,
              rfxHeaderId = null,
              expertExtractFlag,
              expertReplyFlag,
            } = dataSet.queryParameter.headers || {};

            return !expertSource || expertSource === 'EXPERT_LIBRARY'
              ? {
                  fuzzyQueryFlag: bidRuleType !== 'NONE' ? 1 : null,
                  enabledFlag: 1,
                  sourceFrom: 'RFX',
                  sourceFromId: rfxHeaderId,
                  operateType: 'RFX_EDIT',
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
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentScoringType`).d('本次评分类别'),
        name: 'team',
        required: true,
        lookupCode: 'SSRC.EXPERT_TEAM',
        type: 'string',
        dynamicProps: {
          required({ dataSet }) {
            const { bidRuleType = null } = dataSet.queryParameter.headers || {};
            return bidRuleType !== 'NONE';
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
      },
      {
        name: 'internationalTelCode',
        type: 'string',
        lookupCode: 'HPFM.IDD',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxEmail`).d('电子邮箱'),
        name: 'email',
      },
      {
        name: 'loginName',
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
      update: ({ dataSet, record, name, value }) => {
        const {
          queryParameter: { headers = {} },
        } = dataSet;
        const { expertSource = null, rfxHeaderId = null } = headers || {};

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
          } else {
            const {
              mail,
              realName = null,
              phone = null,
              internationalTelCode = null,
              internationalTelCodeMeaning = null,
              id = null,
              expertCategory,
            } = value || {};
            record.set('expertName', realName);
            record.set('expertType', 'INTERNAL');
            record.set('expertUserId', id);
            record.set('phone', phone);
            record.set('email', mail);
            record.set('team', expertCategory);
            record.set('expertCategory', expertCategory);
            record.set('internationalTelCode', internationalTelCode);
            record.set('internationalTelCodeMeaning', internationalTelCodeMeaning);
          }
          record.set('sourceHeaderId', rfxHeaderId);
          record.set('expertStatus', 'SUBMITTED');
        }
      },
      submitSuccess: ({ dataSet }) => {
        const page = dataSet.currentPage;
        dataSet.query(page);
      },
    },
    transport: {
      submit: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId = null, rfxHeaderId = null } = commonProps;
        if (!rfxHeaderId) {
          return;
        }
        const tableDatas = data.map((item) => {
          return {
            ...item,
            tenantId: organizationId,
            organizationId,
            sourceFrom: 'RFX',
            sourceHeaderId: rfxHeaderId,
            expertStatus: 'SUBMITTED',
          };
        });
        const datas = {
          evaluateExpertList: tableDatas,
        };

        return {
          url: `${Prefix}/${organizationId}/evaluate-experts`,
          method: 'POST',
          data: datas,
          transformResponse: (res = null) => {
            if (res) {
              const result = JSON.parse(res);
              if (result && result.failed) {
                notification.warning({
                  message: result.message || null,
                });
                return;
              }
              dataSet.query();
            } else {
              dataSet.query(); // fixme api
            }
          },
        };
      },
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, operationType = '' } = commonProps;
        const ids = data.map((item) => item.evaluateExpertId);

        const params = toJS(dataSet.getState('deleteParams'));

        return {
          url: `${Prefix}/${organizationId}/evaluate-experts/remove?operationType=${operationType}`,
          method: 'DELETE',
          data: { evaluateExpertIds: ids, ...(params || {}) },
        };
      },
    },
  };
};

export default ExpertTableDS;
