import { isNil } from 'lodash';

import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { getUnitCodes } from '../utils/utils';

const organizationId = getCurrentOrganizationId();

// 审查规则
const getReviewRuleDs = ({ reviewTemplateId } = {}) => ({
  forceValidate: true,
  primaryKey: 'reviewTemplateLineId',
  fields: [
    {
      name: 'reviewCode',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointCode').d('审查点编码'),
      bind: 'reviewPointId.reviewCode',
      dynamicProps: {
        disabled: () => true,
      },
    },
    {
      name: 'reviewPointId',
      type: 'object',
      lovCode: 'SPCM_REVIEW_POINT_QUOTE',
      label: intl.get('spcm.contractReview.model.contractReview.pointName').d('审查点'),
      textField: 'reviewName',
      dynamicProps: {
        required: () => true,
      },
      transformRequest: (value) => value && value.reviewPointId,
      transformResponse: (value, data) => {
        const { reviewPointId, reviewName, reviewCode } = data;
        return value
          ? {
              reviewPointId,
              reviewName,
              reviewCode,
            }
          : null;
      },
    },
    {
      name: 'reviewName',
      bind: 'reviewPointId.reviewName',
    },
    {
      name: 'routeName',
      type: 'object',
      label: intl.get('spcm.contractReview.model.contractReview.pointService').d('审查点服务'),
      lovCode: 'HADM.SERVICE.ORG',
      valueField: 'serviceCode',
      textField: 'serviceName',
      dynamicProps: {
        required: ({ record }) => Number(record.get('customCopyFlag')) === 0,
        disabled: ({ record }) => Number(record.get('customCopyFlag')) !== 0,
      },
      transformRequest: (value) => value && value.serviceCode,
      transformResponse: (value, data) => {
        const { routeName, routeNameMeaning } = data;
        return value
          ? {
              serviceCode: routeName,
              serviceName: routeNameMeaning,
            }
          : null;
      },
    },
    {
      name: 'routeNameMeaning',
      bind: 'routeName.serviceName',
    },
    {
      name: 'routeUrl',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointURL').d('审查点URL'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('customCopyFlag')) === 0,
        disabled: ({ record }) => Number(record.get('customCopyFlag')) !== 0,
      },
    },
    {
      name: 'riskType',
      type: 'string',
      lookupCode: 'SPCM_RISK_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.riskType').d('风险类型'),
      dynamicProps: {
        required: () => true,
      },
    },
    {
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SPCM_RISK_LEVEL',
      label: intl.get('spcm.contractReview.model.contractReview.riskLevel').d('风险等级'),
      dynamicProps: {
        required: () => true,
      },
    },
    {
      name: 'validationType',
      type: 'string',
      lookupCode: 'SPCM_CHECK_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.checkType').d('检查类型'),
      dynamicProps: {
        required: () => true,
      },
    },
    {
      name: 'ignoreReasonFlag',
      type: 'boolean',
      label: intl
        .get('spcm.contractReview.model.contractReview.ignoringReason')
        .d('忽略时必填原因'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'riskDescription',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.riskDesc').d('风险说明'),
    },
    {
      name: 'resolution',
      type: 'string',
      label: intl.get('spcm.common.model.common.modifySuggestion').d('修改建议'),
      // label: intl.get('spcm.contractReview.model.contractReview.resolution').d('解决方案'),
    },
    {
      name: 'ruleDescription',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.reviewRuleDesc').d('审查规则说明'),
    },
    {
      name: 'ruleSource',
      type: 'string',
      lookupCode: 'SPCM_CHECK_RULE_SOURCE',
      label: intl
        .get('spcm.contractReview.model.contractReview.reviewRuleSource')
        .d('审查规则来源'),
      dynamicProps: {
        disabled: () => true,
      },
    },
    {
      name: 'customCopyFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('spcm.contractReview.model.contractReview.copyReviewPoint')
        .d('复制预定义审查点'),
      dynamicProps: {
        disabled: () => true,
      },
    },
    // {
    //   name: 'copyReviewCode',
    //   label: intl.get('spcm.contractReview.model.contractReview.preReviewPoint').d('预定义审查点'),
    //   dynamicProps: {
    //     disabled: () => true,
    //   },
    // },
    {
      name: 'reviewType',
      type: 'string',
      lookupCode: 'SPCM_CHECK_VALID_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.reviewType').d('审查类型'),
      dynamicProps: {
        disabled: ({ record }) =>
          !(record.get('ruleSource') === 'custom' && !isNil(record.get('customCopyFlag'))),
      },
    },
    // {
    //   name: 'checkPointParamList',
    //   type: 'string',
    //   label: intl.get('spcm.common.model.common.paramDefinition').d('参数定义'),
    //   ignore: 'alaways',
    // },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-template-lines`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          reviewTemplateId,
          customizeUnitCode: getUnitCodes.lineCode,
        },
        data: {},
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-template-lines/remove`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { getReviewRuleDs };
