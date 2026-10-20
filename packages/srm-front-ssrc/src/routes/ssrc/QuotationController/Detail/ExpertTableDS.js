// 评分明细表ds
import intl from 'utils/intl';
import { getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const ExpertTableDS = () => {
  return {
    // cacheSelection: true,
    primaryKey: 'evaluateExpertId',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        name: 'expertLov',
        type: 'object',
        textField: 'loginName',
        valueField: 'userId',
        ignore: 'always',
        required: true,
        dynamicProps: {
          lovCode({ dataSet }) {
            const {
              queryParameter: { header = {} },
            } = dataSet;
            const { expertSource } = header;
            return expertSource === 'EXPERT_LIBRARY'
              ? 'SSRC.ACCOUNT_EXPERT'
              : 'SSRC.EXPERT_SUB_ACCOUNT';
          },
          lovPara({ dataSet }) {
            const {
              queryParameter: { header = {} },
            } = dataSet;
            const { expertSource, bidRuleType } = header;
            return expertSource === 'EXPERT_LIBRARY'
              ? {
                  fuzzyQueryFlag: bidRuleType !== 'NONE' ? 1 : null,
                  enabledFlag: 1,
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
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentScoringType`).d('本次评分类别'),
        name: 'team',
        lookupCode: 'SSRC.EXPERT_TEAM',
        type: 'string',
        dynamicProps: {
          required({ dataSet }) {
            const {
              queryParameter: { header = {} },
            } = dataSet;
            if (header.bidRuleType !== 'NONE') return true;
            return false;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertType`).d('专家类型'),
        name: 'expertTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxPhone`).d('联系电话'),
        name: 'phone',
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
        bind: 'expertLov.expertCategory',
      },
      {
        name: 'expertUserId',
        bind: 'expertLov.userId',
      },
      {
        name: 'objectVersionNumber',
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'expertLov') {
          const {
            expertName = null,
            expertId = null,
            id = null,
            loginName = null,
            expertCategory = null,
            expertTypeMeaning = null,
            mobilephone = null,
            phone = null,
            telephone = null,
            mail = null,
            userId = null,
            realName = null,
          } = value || {};
          record.set('expertName', expertName || realName);
          record.set('expertId', expertId);
          record.set('loginName', loginName);
          record.set('expertTypeMeaning', expertTypeMeaning);
          record.set('email', mail);
          record.set('phone', mobilephone || telephone || phone || '-');
          record.set('expertUserId', userId || id);
          record.set('team', expertCategory);
        }
      },
      // submitSuccess: ({ dataSet }) => {
      //   const page = dataSet.currentPage;
      //   dataSet.query(page);
      // },
    },
    transport: {
      submit: ({ dataSet }) => {
        const {
          queryParameter: { header = {} },
        } = dataSet;
        const data = dataSet.toData();
        const newData = [];
        data.forEach((item) => {
          let records = {};
          if (header.expertSource === 'EXPERT_LIBRARY') {
            const {
              // 专家库来源
              expertName,
              expertId,
              objectVersionNumber,
              loginName,
              expertCategory,
              expertTypeMeaning,
              mobilephone,
              telephone,
              email,
              userId,
            } = item;
            if (header.bidRuleType === 'NONE') {
              records = {
                userName: undefined,
                expertName,
                expertId,
                objectVersionNumber,
                loginName,
                expertCategory,
                expertTypeMeaning,
                email,
                phone: mobilephone || telephone,
                expertUserId: userId,
                tenantId: header.tenantId,
                sourceFrom: 'RFX',
                leaderFlag: 0,
                evaluateLeaderFlag: '0', // 职责
                openBidOrder: header.openBidOrder,
                organizationId: getCurrentOrganizationId(),
                sourceHeaderId: header.rfxHeaderId,
                expertStatus: 'SUBMITTED',
                team: '',
                _status: 'create',
                ...item,
              };
            } else {
              records = {
                userName: undefined,
                expertName,
                expertId,
                objectVersionNumber,
                loginName,
                expertCategory,
                expertTypeMeaning,
                email,
                phone: mobilephone || telephone,
                expertUserId: userId,
                tenantId: header.tenantId,
                sourceFrom: 'RFX',
                evaluateLeaderFlag: '0', // 职责
                openBidOrder: header.openBidOrder,
                organizationId: getCurrentOrganizationId(),
                sourceHeaderId: header.rfxHeaderId,
                expertStatus: 'SUBMITTED',
                team: expertCategory,
                _status: 'create',
                ...item,
              };
            }
          } else {
            const { objectVersionNumber, loginName, email, id, realName, phone } = item;
            records = {
              userName: undefined,
              expertName: realName,
              objectVersionNumber,
              loginName,
              expertCategory: 'BUSINESS_TECHNOLOGY',
              expertTypeMeaning: intl
                .get(`ssrc.inquiryHall.model.inquiryHall.innerExpert`)
                .d('内部专家'),
              email,
              phone,
              expertUserId: id,
              tenantId: header.tenantId,
              sourceFrom: 'RFX',
              evaluateLeaderFlag: '0', // 职责
              openBidOrder: header.openBidOrder,
              organizationId: getCurrentOrganizationId(),
              sourceHeaderId: header.rfxHeaderId,
              expertStatus: 'SUBMITTED',
              team: 'BUSINESS_TECHNOLOGY',
              _status: 'create',
              ...item,
            };
          }
          newData.push(records);
        });

        const datas = {
          evaluateExpertList: newData,
          sourceTemplateId: header.templateId,
        };
        return {
          url: `${Prefix}/${getCurrentOrganizationId()}/evaluate-experts`,
          method: 'POST',
          params: { customizeUnitCode: 'SSRC.QUOTATION_CONTROLLER.EXPERT_SCORE' },
          data: datas,
        };
      },
      destroy: ({ data }) => {
        const newData = data.map((item) => item.evaluateExpertId);
        return {
          url: `${Prefix}/${getCurrentOrganizationId()}/evaluate-experts`,
          method: 'DELETE',
          data: newData,
        };
      },
    },
  };
};

export default ExpertTableDS;
