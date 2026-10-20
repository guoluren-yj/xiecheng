import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const technicalTableDS = (configs = {}) => ({
  // autoCreate: true,
  primaryKey: 'evaluateIndicId',
  dataToJSON: 'all',
  paging: false,
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
      name: 'indicateLov',
      type: 'object',
      lovCode: 'SSRC.SCORE_INDIC',
      lovPara: {
        expertCategory: configs.expertCategory,
        indicateType: 'SCORE',
      },
      ignore: 'always',
    },
    {
      name: 'indicateId',
      bind: 'indicateLov.indicateId',
    },
    {
      name: 'indicateCode',
      bind: 'indicateLov.indicateCode',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
      name: 'indicateName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.calculateType`).d('计算方式'),
      name: 'calculateType',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.CALCULATE_TYPE',
      dynamicProps: {
        required({ record }) {
          const indicateTypeFlag = record.get('indicateType') === 'SCORE';
          return indicateTypeFlag;
        },
        disabled({ record }) {
          const indicateId = record.get('indicateId');
          return indicateId;
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreType`).d('评分类型'),
      name: 'scoreType',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.SCORE_TYPE',
      dynamicProps: {
        required({ record }) {
          const isIndicateType = record.get('indicateType') === 'SCORE';
          const isCalculateType = record.get('calculateType') === 'AUTO';
          return isIndicateType && isCalculateType;
        },
        disabled({ record }) {
          const isCalculateType = record.get('calculateType') === 'MANUAL';
          const indicateId = record.get('indicateId');
          return indicateId || isCalculateType;
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
      name: 'indicateRemark',
      type: 'string',
      // dynamicProps: {
      //   required({ record }) {
      //     const isCalculateType = record.get('calculateType') === 'MANUAL';
      //     return isCalculateType;
      //   },
      // },
    },
    configs.header.templateScoreType !== 'SCORE'
      ? {
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPercent`).d('权重(%)'),
          name: 'weight',
          type: 'number',
          max: 100,
          min: 0,
          step: 0.01,
          dynamicProps: {
            required({ dataSet, record }) {
              const { templateScoreType = null } = dataSet.queryParameter.headers || {};
              const indicateType = record.get('indicateType');
              return indicateType === 'SCORE' && templateScoreType === 'WEIGHT';
            },
            defaultValue({ dataSet }) {
              const { templateScoreType = null } = dataSet.queryParameter.headers || {};
              return templateScoreType === 'SCORE' ? 100 : null;
            },
            disabled({ record }) {
              const indicateType = record.get('indicateType');
              return indicateType === 'PASS';
            },
          },
        }
      : null,
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
      name: 'minScore',
      type: 'number',
      min: 0,
      step: 0.01,
      dynamicProps: {
        required({ dataSet, record }) {
          const { templateScoreType = null } = dataSet.queryParameter.headers || {};
          const scoreType = record.get('scoreType');
          const detailEnabledFlag = record.get('detailEnabledFlag');
          return !(detailEnabledFlag || scoreType === 'PRICE') && templateScoreType === 'SCORE';
        },
        disabled({ record }) {
          const scoreType = record.get('scoreType');
          const detailEnabledFlag = record.get('detailEnabledFlag');
          return detailEnabledFlag || scoreType === 'PRICE';
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
      name: 'maxScore',
      type: 'number',
      min: 0,
      step: 0.01,
      dynamicProps: {
        required({ dataSet, record }) {
          const { templateScoreType = null } = dataSet.queryParameter.headers || {};
          const detailEnabledFlag = record.get('detailEnabledFlag');
          return !detailEnabledFlag && templateScoreType === 'SCORE';
        },
        disabled({ record }) {
          const detailEnabledFlag = record.get('detailEnabledFlag');
          return detailEnabledFlag;
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.detailEnabledFlag`).d('启用评分要素细项'),
      name: 'detailEnabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
      name: 'expertDistribute',
      type: 'string',
      fixed: 'right',
    },
    {
      name: 'sourceFrom',
      type: 'string',
      defaultValue: 'RFX',
    },
    {
      name: 'openBidOrder',
      type: 'string',
      defaultValue: configs.header.openBidOrder || 'BUSINESS_FIRST',
    },
    {
      name: 'openBidOrder',
      type: 'string',
      defaultValue: configs.header.openBidOrder || 'BUSINESS_FIRST',
    },
    {
      name: 'organizationId',
      type: 'string',
      defaultValue: configs.header.organizationId,
    },
    {
      name: 'tenantId',
      type: 'string',
      defaultValue: configs.header.tenantId,
    },
    {
      name: 'expertCategory',
      type: 'string',
      defaultValue: configs.expertCategory,
    },
    {
      name: 'evaluateIndicId',
    },
    {
      name: 'indicStatus',
      type: 'string',
      defaultValue: 'SUBMITTED',
    },
    {
      name: 'team',
      type: 'string',
      defaultValue: configs.expertCategory,
    },
    {
      name: 'sourceHeaderId',
      type: 'string',
      defaultValue: configs.header.rfxHeaderId,
    },
    {
      name: 'scoreIndicId',
    },
    {
      name: 'lovBringOutFlag',
      type: 'boolean',
    },
    {
      name: 'changeLovFlag',
      type: 'boolean',
    },
    // {
    //   name: 'objectVersionNumber',
    // },
    {
      name: 'technologyWeight',
      type: 'number',
      defaultValue: 50,
    },
    {
      name: 'businessWeight',
      type: 'number',
      defaultValue: 50,
    },
  ].filter(Boolean),

  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
    update: ({ record, name, value }) => {
      if (name === 'indicateLov') {
        if (!value) {
          record.setState(`lovBringOutFlag`, false);
          return;
        }
        record.set('indicateId', value.indicateId);
        record.set('indicateCode', value.indicateCode);
        record.set('indicateName', value.indicateName);
        record.set('indicateType', value.indicateType);
        record.set('maxScore', value.maxScore);
        record.set('minScore', value.minScore);
        record.set('indicateRemark', value.remark);
        record.set('scoreIndicId', value.scoreIndicId);
        record.set('weight', value.weight);
        record.set('scoreType', value.scoreType);
        record.set('calculateType', value.calculateType);
        record.set('detailEnabledFlag', value.detailEnabledFlag);
        record.set('evaluateIndicDetail', value.scoreIndicDetail || null);
        record.set(`lovBringOutFlag`, true);
        if (record.status === 'update') {
          record.set(`changeLovFlag`, true);
        }
      }
      if (name === 'detailEnabledFlag') {
        record.set('minScore', null);
        record.set('maxScore', null);
      }
      if (name === 'calculateType') {
        if (value === 'MANUAL') {
          record.set('scoreType', null);
          record.set('indicateRemark', null);
        } else {
          record.set('detailEnabledFlag', 0);
        }
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/evaluate-indics`,
        method: 'GET',
        data: {
          organizationId: getCurrentOrganizationId(),
          sourceHeaderId: configs.sourceHeaderId,
          sourceFrom: 'RFX',
          indicStatus: 'SUBMITTED',
          indicateLevel: 'ONE',
          customizeUnitCode:
            configs.expertCategory === 'TECHNOLOGY'
              ? 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS_TECH'
              : 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS',
        },
        transformResponse: (res) => {
          const dealData = JSON.parse(res);
          const { otherIndicList, technologyIndicList, businessIndicList } = dealData;
          if (configs.expertCategory === 'TECHNOLOGY') {
            return { content: technologyIndicList };
          } else if (configs.expertCategory === 'BUSINESS') {
            return { content: businessIndicList };
          } else {
            return { content: otherIndicList };
          }
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const newData = data.map((item) => item.evaluateIndicId);
      return {
        url: `${Prefix}/${organizationId}/evaluate-indics`,
        method: 'DELETE',
        data: newData,
        transformResponse: () => {
          dataSet.query();
        },
      };
    },
    submit: ({ dataSet }) => {
      if (!dataSet.toData().length) {
        return;
      }
      const newData = dataSet.toData().map((item) => ({
        ...item,
        areaFrom: 'CONTROL',
        indicateType: 'SCORE',
        minScore:
          item.minScore || item.minScore === 0
            ? item.minScore
            : item.evaluateIndicDetail
            ? ((item.evaluateIndicDetail || {}).lowestScore / 100) * item.maxScore
            : null,
        maxScore: item.maxScore ?? null,
      }));
      let sumWeight = 0;
      newData.forEach((item) => {
        sumWeight += item.weight;
      });
      if (configs.header.templateScoreType === 'WEIGHT') {
        if (sumWeight !== 100) {
          notification.warning({
            message: intl.get(`ssrc.inquiryHall.view.notification.weight`).d('权重之和不等于100！'),
          });
          return null;
        } else {
          return {
            url: `${Prefix}/${organizationId}/evaluate-indics`,
            method: 'POST',
            data: newData,
          };
        }
      } else {
        return {
          url: `${Prefix}/${organizationId}/evaluate-indics`,
          method: 'POST',
          params: {
            customizeUnitCode:
              configs.expertCategory === 'TECHNOLOGY'
                ? 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS_TECH'
                : 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS',
          },
          data: newData,
        };
      }
    },
  },
});

const expertModalDS = () => ({
  primaryKey: 'evaluateExpertId',
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
      name: 'expertName',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
      name: 'assignFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { params = {} },
      } = dataSet;
      return {
        url: `${Prefix}/${organizationId}/evaluate-indic-assigns`,
        method: 'GET',
        data: { ...params },
      };
    },
  },
});

const ScoreDetailReferenceTemplateDS = (config = {}) => {
  const { bidRuleType, templateScoreType } = config.header || {};

  return {
    primaryKey: 'templateId',
    fields: [
      {
        name: 'scoreTemplateLov',
        type: 'object',
        lovCode: 'SSRC.SCORE_TEMPL',
        lovPara: {
          enabledFlag: 1,
          // expertCategory: type,
          scoreMode: bidRuleType,
          templatePurpose: 'EXPERT_SCORE',
          scoreTemplateScoreType: templateScoreType,
        },
      },
    ],
    events: {},
  };
};

export { technicalTableDS, expertModalDS, ScoreDetailReferenceTemplateDS };
