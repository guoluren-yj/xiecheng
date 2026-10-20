/**
 * 规则配置详情ds（租户级）
 * @date: 2021-12-28
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import { CODE } from 'utils/regExp';
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// 设置当前租户信息
const currentTenantId = getCurrentOrganizationId();
const detailPrompt = 'sdps.ruleManagesDetail.model'; // 多语言前缀

// getBasicParamDs: 规则对应的基本参数的Ds
function getBasicParamDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.fullPathCode`).d('规则编码'),
        required: true,
        pattern: CODE,
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.name`).d('规则名称'),
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.type`).d('规则类型'),
        required: true,
      },
      {
        name: 'service',
        type: 'object',
        lovCode: 'SDPS.ROUTE.DATA',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.service`).d('服务名称'),
        ignore: 'always',
        dynamicProps: {
          required: ({ record }) => {
            return record.get('type') === '1';
          },
        },
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.serviceCode`).d('服务编码'),
        bind: 'service.serviceCode',
        dynamicProps: {
          required: ({ record }) => {
            return record.get('type') === '1';
          },
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'never' : 'always';
          },
        },
      },
      {
        name: 'serviceName',
        type: 'string',
        bind: 'service.serviceName',
        dynamicProps: {
          required: ({ record }) => {
            return record.get('type') === '1';
          },
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'never' : 'always';
          },
        },
      },
      {
        name: 'servicePath',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.servicePath`).d('服务路由'),
        bind: 'service.serviceRoute',
        dynamicProps: {
          required: ({ record }) => {
            return record.get('type') === '1';
          },
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'never' : 'always';
          },
        },
      },
      {
        name: 'dimensionality',
        type: 'string',
        dynamicProps: {
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'never' : 'always';
          },
        },
      },
      {
        name: 'defaultRet',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.DEFAULT_RET',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.noRelevantStrategy`).d('无相关策略'),
        dynamicProps: {
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'always' : 'never';
          },
          required: ({ record }) => {
            return record.get('type') === '0';
          },
        },
      },
      {
        name: 'defaultRetLine',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.DEFAULT_RET_LINE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.defaultRetLine`).d('下线后返回码'),
        required: true,
      },
      {
        name: 'defaultRetEmpty',
        type: 'string',
        lookupCode: 'SDPS.CNF_META_DEFINITION.EMPTY',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexDefault`).d('指标默认值'),
        dynamicProps: {
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'always' : 'never';
          },
          required: ({ record }) => {
            return record.get('type') === '0';
          },
        },
      },
      {
        name: 'retEmpty',
        type: 'number',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexNullDefault`).d('指标缺省值'),
        defaultValue: null,
        dynamicProps: {
          required: ({ record }) => {
            return record.get('type') === '0';
          },
          ignore: ({ record }) => {
            return record.get('type') === '1' ? 'always' : 'never';
          },
        },
      },
      {
        name: 'defaultRetFail',
        type: 'string',
        lookupCode: 'SDPS.CNF_META_DEFINITION.FAIL',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.defaultRetFail`).d('失败默认值'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.ruleDescription`).d('规则描述'),
      },
      {
        name: 'ruleManagementHeaderId',
        type: 'number',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-headers/${data.ruleManagementHeaderId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const postData = {
          ...data[0],
          tenantId: currentTenantId,
          ruleManagementHeaderId: dataSet.getState('ruleManagementHeaderId') || undefined,
        };
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-headers`,
          method: 'POST',
          data: postData,
        };
      },
    },
  };
}

// getIndexMessageDs: 规则对应的指标表格的Ds
function getIndexMessageDs() {
  return {
    autoQuery: false,
    selection: 'multiple',
    modifiedCheck: false,
    fields: [
      {
        name: 'ruleManagementHeaderId',
        type: 'number',
      },
      {
        name: 'ruleManagementLineId',
        type: 'number',
      },
      {
        name: 'dataType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        required: true,
        label: intl.get(`${detailPrompt}.ruleManagesDetail.dataType`).d('数据类型'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexDescription`).d('指标描述'),
      },
      {
        name: 'dimensionality',
        type: 'string',
      },
      {
        name: 'expression',
        type: 'string',
      },
      {
        name: 'indexAlias',
        type: 'string',
      },
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexCode`).d('指标编码'),
      },
      {
        name: 'indexKey',
        type: 'string',
      },
      {
        name: 'indexName',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexName`).d('指标名称'),
        required: true,
      },
      {
        name: 'required',
        type: 'number',
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.serviceCode`).d('服务编码'),
      },
      {
        name: 'serviceName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.seviceName`).d('服务名称'),
      },
      {
        name: 'servicePath',
        type: 'string',
      },
      {
        name: 'serviceSource',
        type: 'string',
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.operation`).d('操作'),
      },
      {
        name: 'calculateCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.calculateCode`).d('指标编码'),
        required: true,
        dynamicProps: {
          pattern: ({ record }) => {
            return record.get('indexType') === 'transform_parameter'
              ? /^T\.[\w(\\.)]+$/
              : /^[\w\s(\\.)]*[a-zA-Z]{1}[\w\s(\\.)]*$/;
          },
          highlight: ({ record }) => {
            return record.get('indexType') === 'transform_parameter'
              ? intl
                  .get(`${detailPrompt}.ruleManagesDetail.transformTip`)
                  .d('转换参数需要遵循格式：T.+参数名')
              : null;
          },
          defaultValidationMessages: ({ record }) => {
            return {
              patternMismatch:
                record.get('indexType') === 'transform_parameter'
                  ? intl
                      .get(`${detailPrompt}.tips.wrongTranCode`)
                      .d(
                        '指标编码只能由数字字母下划线组成，且至少有一个英文字母，转换参数请遵循格式'
                      )
                  : intl
                      .get(`${detailPrompt}.tips.wrongCalCode`)
                      .d('指标编码只能由数字字母下划线组成，且至少有一个英文字母'),
            };
          },
        },
      },
      {
        name: 'dimensionality',
        type: 'string',
      },
      {
        name: 'enableStatus',
        type: 'string',
      },
      {
        name: 'modelDesc',
        type: 'string',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.creationDate`).d('添加时间'),
      },
      {
        name: 'lastUpdateDate',
        type: 'dateTime',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.lastUpdateDate`).d('更新时间'),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const ruleManagementHeaderId = dataSet.getState('ruleManagementHeaderId');
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-lines/headerId/${ruleManagementHeaderId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const ruleManagementHeaderId = dataSet.getState('ruleManagementHeaderId');
        // data的维度部分不需要全传，做一下处理
        const cutData = data.map((item) => {
          const { dimensionality = '[]' } = item;
          // 遍历维度
          const postDimension = JSON.parse(dimensionality || '[]').map((dimensionItem) => {
            const {
              lastUpdateDate,
              lastUpdatedBy,
              parameterId,
              tenantId: tId,
              parameterKey,
              parameterName,
              enableFlag,
              paramType,
              dataType,
              ruleLineCode,
            } = dimensionItem;
            return {
              lastUpdateDate,
              lastUpdatedBy,
              parameterId,
              tenantId: tId,
              parameterKey,
              parameterName,
              enableFlag,
              paramType,
              dataType,
              ruleLineCode,
            };
          });
          return { ...item, dimensionality: JSON.stringify(postDimension) };
        });
        // 每一项新增的指标都添加一个headerId和租户ID，声明所属的规则
        const postData = cutData.map((item) => {
          return { ...item, ruleManagementHeaderId, tenantId: currentTenantId };
        });
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-lines`,
          method: 'POST',
          data: postData,
        };
      },
      destroy: ({ data }) => {
        // const { ruleManagementLineId, ruleLineCode } = data[0];
        const postData = data.map((item) => ({ ...item, tenantId: currentTenantId }));
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-lines`,
          method: 'DELETE',
          data: postData,
        };
      },
    },
  };
}

// getIndexAddDs: 指标添加的Ds
function getIndexAddDs() {
  return {
    autoQuery: false,
    selection: 'multiple',
    fields: [
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexCode`).d('指标编码'),
      },
      {
        name: 'indexName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexName`).d('指标名称'),
      },
      {
        name: 'dataType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.dataType`).d('数据类型'),
      },
      {
        name: 'enableStatus',
        type: 'string',
      },
      {
        name: 'serviceSource',
        type: 'string',
      },
      {
        name: 'modelDesc',
        type: 'string',
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.serviceCode`).d('服务编码'),
      },
      {
        name: 'serviceName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.seviceName`).d('服务名称'),
      },
      {
        name: 'expression',
        type: 'string',
      },
    ],
    queryFields: [
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexCode`).d('指标编码'),
      },
      {
        name: 'indexName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.indexName`).d('指标名称'),
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.serviceCode`).d('服务编码'),
      },
      {
        name: 'serviceName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.serviceName`).d('服务名称'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/data-service/indexInfo`,
          method: 'GET',
        };
      },
    },
  };
}

// getIndexDimensionDs：当前指标对应的维度Ds
function getIndexDimensionDs() {
  return {
    selection: 'multiple',
    paging: false,
    fields: [
      {
        name: 'createdBy',
        type: 'number',
      },
      { name: 'creationDate', type: 'number' },
      {
        name: 'dataType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.dataType`).d('数据类型'),
      },
      { name: 'enableFlag', type: 'number' },
      { name: 'lastUpdateDate', type: 'date' },
      { name: 'lastUpdatedBy', type: 'number' },
      { name: 'paramType', type: 'string' },
      { name: 'parameterId', type: 'number' },
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.parameterKey`).d('维度编码'),
      },
      {
        name: 'parameterName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.parameterName`).d('维度名称'),
      },
      {
        name: 'operation',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.operation`).d('操作'),
      },
    ],
  };
}

// getDimensionListDs: 当前指标对应的添加维度DS
function getDimensionListDs() {
  return {
    autoQuery: false,
    selection: 'multiple',
    fields: [
      {
        name: 'dataType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.dataType`).d('数据类型'),
      },
      { name: 'description', type: 'string' },
      { name: 'expression', type: 'string' },
      { name: 'isRequired', type: 'string' },
      { name: 'lastUpdateDate', type: 'date' },
      { name: 'lastUpdatedBy', type: 'number' },
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.parameterKey`).d('维度编码'),
      },
      {
        name: 'parameterName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.parameterName`).d('维度名称'),
      },
      {
        name: 'parameterType',
        type: 'string',
      },
      {
        name: 'type',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { ruleManagementLineId } = data;
        return {
          url: ruleManagementLineId
            ? `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-lines/parameter`
            : `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-headers/parameter`,
          method: 'GET',
        };
      },
    },
  };
}

// getActionConfigTableDs: 当前规则的策略配置DS
function getActionConfigTableDs() {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      { name: 'actionId', type: 'number' },
      {
        name: 'actionName',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.actionName`).d('策略名称'),
        required: true,
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManages.code`).d('调用编码'),
      },
      {
        name: 'conditionExpression',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.conditionExpression`).d('条件表达式'),
        required: true,
      },
      { name: 'createdBy', type: 'number' },
      { name: 'creationDate', type: 'date' },
      {
        name: 'description',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.actionDescription`).d('策略描述'),
      },
      {
        name: 'priority',
        type: 'number',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.priority`).d('策略优先级'),
        step: 1,
        min: 1,
        required: true,
      },
      { name: 'executeType', type: 'string', defaultValue: 'CONSTANT' },
      { name: 'fullPathCode', type: 'string' },
      { name: 'lastUpdateDate', type: 'date' },
      { name: 'lastUpdatedBy', type: 'number' },
      { name: 'tenantId', type: 'number' },
      {
        name: 'value',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.value`).d('执行表达式'),
        required: true,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'actionName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.actionName`).d('策略名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.actionDescription`).d('策略描述'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/cnf-actions`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/cnf-actions`,
          method: 'POST',
          data: {
            ...data[0],
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/cnf-actions`,
          method: 'DELETE',
          data: {
            ...data[0],
          },
        };
      },
    },
  };
}

// getOutDimensionDs
function getOutDimensionDs() {
  return {
    paging: false,
    selection: false,
    fields: [
      {
        name: 'fieldType',
        type: 'string',
        // lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.paramType`).d('参数类型'),
      },
      {
        name: 'paramDesc',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.paramDescription`).d('参数描述'),
      },
      {
        name: 'paramName',
        type: 'string',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.paramName`).d('参数名称'),
      },
    ],
  };
}

export {
  getBasicParamDs,
  getIndexMessageDs,
  getIndexAddDs,
  getIndexDimensionDs,
  getOutDimensionDs,
  getDimensionListDs,
  getActionConfigTableDs,
};
