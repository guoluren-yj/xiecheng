import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { getListUnitCodes } from '../utils';

const organizationId = getCurrentOrganizationId();

const getPointDs = () => ({
  pageSize: 20,
  selection: false,
  primaryKey: 'reviewPointId',
  fields: [
    {
      name: 'status',
      label: intl.get('hzero.common.common.status').d('状态'),
      type: 'string',
      lookupCode: 'SPCM_REVIEW_POINT_STATUS',
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'reviewCode',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointCode').d('审查点编码'),
    },
    {
      name: 'reviewName',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointName').d('审查点'),
    },
    {
      name: 'routeNameMeaning',
      label: intl.get('spcm.contractReview.model.contractReview.pointService').d('审查点服务'),
    },
    {
      name: 'routeUrl',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointURL').d('审查点URL'),
    },
    {
      name: 'riskType',
      type: 'string',
      lookupCode: 'SPCM_RISK_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.riskType').d('风险类型'),
    },
    {
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SPCM_RISK_LEVEL',
      label: intl.get('spcm.contractReview.model.contractReview.riskLevel').d('风险等级'),
    },
    {
      name: 'validationType',
      type: 'string',
      lookupCode: 'SPCM_CHECK_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.checkType').d('检查类型'),
    },
    {
      name: 'ignoreReasonFlag',
      label: intl
        .get('spcm.contractReview.model.contractReview.ignoringReason')
        .d('忽略时必填原因'),
    },
    {
      name: 'riskDescription',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.riskDesc').d('风险说明'),
    },
    {
      name: 'resolution',
      type: 'string',
      // label: intl.get('spcm.contractReview.model.contractReview.resolution').d('解决方案'),
      label: intl.get('spcm.common.model.common.modifySuggestion').d('修改建议'),
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
    },
    {
      name: 'customCopyFlag',
      label: intl
        .get('spcm.contractReview.model.contractReview.copyReviewPoint')
        .d('复制预定义审查点'),
    },
    {
      name: 'copyReviewCode',
      label: intl.get('spcm.contractReview.model.contractReview.preReviewPoint').d('预定义审查点'),
    },
    {
      name: 'reviewType',
      type: 'string',
      lookupCode: 'SPCM_CHECK_VALID_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.reviewType').d('审查类型'),
    },
    // {
    //   name: 'checkPointParamList',
    //   type: 'string',
    //   label: intl.get('spcm.common.model.common.paramDefinition').d('参数定义'),
    // },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-point-types`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_SEARCH,SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_TABLE',
        },
        data: {},
      };
    },
  },
});

// 审查模版ds
const getTemplateDs = () => ({
  pageSize: 20,
  selection: false,
  paging: 'server',
  childrenField: 'children',
  primaryKey: 'reviewTemplateId',
  fields: [
    {
      name: 'templateStatus',
      label: intl.get('hzero.common.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'reviewTemplateCode',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.templateCode').d('审查模板编码'),
    },
    {
      name: 'reviewTemplateName',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.templateName').d('审查模板名称'),
    },
    {
      name: 'versionNumber',
      label: intl.get('spcm.common.view.common.version').d('版本'),
    },
    {
      name: 'reviewTemplateDesc',
      label: intl.get('spcm.contractReview.model.contractReview.templateDesc').d('审查模板说明'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-template-headers/list`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SPCM_CONTRACT_REVIEW_CONFIG_LIST.TEMPLATE_SEARCH,SPCM_CONTRACT_REVIEW_CONFIG_LIST.TEMPLATE_TABLE',
        },
        data: {},
      };
    },
  },
});

// 审查点详情侧弹窗ds
const getPointDetailDs = ({ reviewPointId } = {}) => ({
  paging: false,
  selection: false,
  primaryKey: 'reviewPointId',
  forceValidate: true,
  fields: [
    {
      name: 'reviewCode',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointCode').d('审查点编码'),
      dynamicProps: {
        disabled: () => true,
      },
    },
    {
      name: 'reviewName',
      type: 'intl',
      label: intl.get('spcm.contractReview.model.contractReview.pointName').d('审查点名称'),
      dynamicProps: {
        required: () => true,
      },
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
      defaultValue: 'custom',
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
      defaultValue: '0',
      label: intl
        .get('spcm.contractReview.model.contractReview.copyReviewPoint')
        .d('复制预定义审查点'),
      dynamicProps: {
        disabled: () => true,
      },
    },
    {
      name: 'copyReviewCode',
      label: intl.get('spcm.contractReview.model.contractReview.preReviewPoint').d('预定义审查点'),
      dynamicProps: {
        disabled: () => true,
      },
    },
    {
      name: 'reviewType',
      type: 'string',
      lookupCode: 'SPCM_CHECK_VALID_TYPE',
      label: intl.get('spcm.contractReview.model.contractReview.reviewType').d('审查类型'),
      dynamicProps: {
        disabled: ({ record }) =>
          !(record.get('ruleSource') === 'custom' && Number(record.get('customCopyFlag')) !== 1),
        required: ({ record }) =>
          record.get('ruleSource') === 'custom' && Number(record.get('customCopyFlag')) !== 1,
      },
    },
    // {
    //   name: 'checkPointParamList',
    //   type: 'string',
    //   label: intl.get('spcm.common.model.common.paramDefinition').d('参数定义'),
    //   ignore: 'alaways',
    // },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-point-types/${reviewPointId}`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode: getListUnitCodes.pointModal,
        },
        data: {},
      };
    },
  },
});

export { getPointDs, getTemplateDs, getPointDetailDs };
