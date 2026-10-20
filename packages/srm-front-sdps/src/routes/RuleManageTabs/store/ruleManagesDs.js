/**
 * 规则配置ds（平台级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import { SRM_DATA_PROCESS } from '_utils/config';
import intl from 'utils/intl';

const intlPrompt = 'sdps.ruleManages.model';

function getRuleManagesDs() {
  return {
    selection: false,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.code').d('调用编码'),
      },
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.fullPathCode`).d('规则编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.name`).d('规则名称'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${intlPrompt}.ruleManages.type`).d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get(`${intlPrompt}.ruleManages.enableFlag`).d('规则状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'createdBy',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.createdBy`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'datetime',
        label: intl.get(`${intlPrompt}.ruleManages.creationDate`).d('创建时间'),
      },
      {
        name: 'lastUpdatedBy',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.lastUpdatedBy`).d('最后更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'datetime',
        label: intl.get(`${intlPrompt}.ruleManages.lastUpdateDate`).d('最后更新时间'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.fullPathCode`).d('规则编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.name`).d('规则名称'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${intlPrompt}.ruleManages.type`).d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.enableFlag`).d('规则状态'),
        lookupCode: 'SDPS.META_DEFINITION.ONLINE_OFFLINE_STATUS',
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.serviceCode`).d('服务编码'),
      },
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get('sdps.indexSearch.view.title.indexCode').d('指标编码'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-management-headers`,
          method: 'GET',
          data: {
            ...data,
            ruleCode: '',
          },
          params,
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-management-headers`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        const { ruleManagementHeaderId, _token, tenantId, ruleCode } = data[0];
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-management-headers`,
          method: 'DELETE',
          data: { ruleManagementHeaderId, _token, tenantId, ruleCode },
        };
      },
    },
  };
}

function getSubscribeManagesDs() {
  return {
    selection: false,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.code').d('调用编码'),
        required: true,
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.name').d('调用名称'),
        required: true,
      },
      {
        name: 'mdCode',
        type: 'object',
        lovCode: 'SDPS.RULE.INFO',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.rulePathCode').d('规则编码'),
        ignore: 'always',
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return { tenantId: dataSet.getState('tenantId') };
          },
        },
        required: true,
      },
      {
        name: 'ruleCode',
        type: 'string',
        bind: 'mdCode.ruleCode',
      },
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.rulePathCode').d('规则编码'),
        bind: 'mdCode.ruleCode',
      },
      {
        name: 'mdName',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.mdName').d('规则名称'),
        bind: 'mdCode.name',
      },
      {
        name: 'mdEnableFlag',
        type: 'boolean',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.mdEnableFlag').d('规则状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.type').d('规则类型'),
        bind: 'mdCode.type',
      },
      {
        name: 'createdBy',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'datetime',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.creationDate').d('创建时间'),
      },
      {
        name: 'lastUpdatedBy',
        type: 'string',
        label: intl
          .get('sdps.subscribeManages.model.subscribeManages.lastUpdatedBy')
          .d('最后更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'datetime',
        label: intl
          .get('sdps.subscribeManages.model.subscribeManages.lastUpdateDate')
          .d('最后更新时间'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.code').d('调用编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.name').d('调用名称'),
      },
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.rulePathCode').d('规则编码'),
      },
      {
        name: 'mdName',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.mdName').d('规则名称'),
      },
      {
        name: 'mdEnableFlag',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.mdEnableFlag').d('规则状态'),
        lookupCode: 'SDPS.META_DEFINITION.ONLINE_OFFLINE_STATUS',
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.type').d('规则类型'),
        bind: 'mdCode.type',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const organizationId = dataSet.getState('tenantId');
        return {
          url: `${SRM_DATA_PROCESS}/v1/data-routes&tenantId=${organizationId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const { ruleCode, ...restData } = data[0];
        const organizationId = dataSet.getState('tenantId');
        return {
          url: `${SRM_DATA_PROCESS}/v1/data-routes`,
          method: 'POST',
          data: {
            ...restData,
            rulePathCode: ruleCode,
            fullPathCode: ruleCode,
            tenantId: organizationId,
          },
        };
      },
      destroy: ({ data, dataSet }) => {
        const { ruleCode, ...restData } = data[0];
        const organizationId = dataSet.getState('tenantId');
        return {
          url: `${SRM_DATA_PROCESS}/v1/data-routes`,
          method: 'DELETE',
          data: {
            ...restData,
            rulePathCode: ruleCode,
            fullPathCode: ruleCode,
            tenantId: organizationId,
          },
        };
      },
    },
  };
}

/**
 * 风险规则
 * @returns
 */
function getRiskManagesDs() {
  return {
    selection: false,
    fields: [
      {
        name: 'uuidCode',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.uuidCode').d('调用编码'),
      },
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.ruleCode`).d('规则编码'),
      },
      {
        name: 'ruleName',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.ruleName`).d('规则名称'),
      },
      {
        name: 'ruleType',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${intlPrompt}.ruleManages.type`).d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get(`${intlPrompt}.ruleManages.enableFlag`).d('规则状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'themeCode',
        label: intl.get(`${intlPrompt}.ruleManages.themeCode`).d('主题编码'),
      },
      {
        name: 'groupCode',
        label: intl.get(`${intlPrompt}.ruleManages.groupCode`).d('公司组编码'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.fullPathCode`).d('规则编码'),
      },
      {
        name: 'ruleName',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.name`).d('规则名称'),
      },
      {
        name: 'ruleType',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${intlPrompt}.ruleManages.type`).d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.enableFlag`).d('规则状态'),
        lookupCode: 'SDPS.META_DEFINITION.ONLINE_OFFLINE_STATUS',
      },
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get('sdps.indexSearch.view.title.indexCode').d('指标编码'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-define-site/define-list`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-define-site/save-or-update`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-define-site/batch-delete`,
          method: 'POST',
          data,
        };
      },
    },
  };
}

export { getRuleManagesDs, getSubscribeManagesDs, getRiskManagesDs };
