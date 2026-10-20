/**
 * 规则配置详情ds（平台级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

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
        pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_./]{0,179}$/,
        defaultValidationMessages: {
          patternMismatch: intl
            .get(`${detailPrompt}.ruleManagesDetail.overMaximum`)
            .d('最多180个字符'),
        },
      },
      {
        name: 'ruleName',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.name`).d('规则名称'),
        required: true,
        pattern: /^(.){0,180}$/,
        defaultValidationMessages: {
          patternMismatch: intl
            .get(`${detailPrompt}.ruleManagesDetail.overMaximum`)
            .d('最多180个字符'),
        },
      },
      {
        name: 'ruleType',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.type`).d('规则类型'),
        required: true,
        defaultValue: '0',
      },
      {
        name: 'themeObj',
        type: 'object',
        lovCode: 'SDPS.RULE_DEFINE_THEME',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.theme`).d('所属主题'),
        ignore: 'always',
        required: true,
      },
      {
        name: 'themeCode',
        label: intl.get(`${detailPrompt}.ruleManages.themeCode`).d('主题编码'),
        bind: 'themeObj.themeCode',
      },
      {
        name: 'themeId',
        bind: 'themeObj.themeId',
      },
      {
        name: 'chooseFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get(`${detailPrompt}.ruleManages.chooseFlag`).d('是否默认勾选'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get(`${detailPrompt}.ruleManagesDetail.description`).d('参数描述'),
        maxLength: 200,
        showLengthInfo: true,
      },
      {
        name: 'enableFlag',
      },
      // {
      //   name: 'service',
      //   type: 'object',
      //   lovCode: 'SDPS.ROUTE.DATA',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.service`).d('服务名称'),
      //   ignore: 'always',
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return record.get('type') === '1';
      //     },
      //   },
      // },
      // {
      //   name: 'serviceCode',
      //   type: 'string',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.serviceCode`).d('服务编码'),
      //   bind: 'service.serviceCode',
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return record.get('type') === '1';
      //     },
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'never' : 'always';
      //     },
      //   },
      // },
      // {
      //   name: 'serviceName',
      //   type: 'string',
      //   bind: 'service.serviceName',
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return record.get('type') === '1';
      //     },
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'never' : 'always';
      //     },
      //   },
      // },
      // {
      //   name: 'servicePath',
      //   type: 'string',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.servicePath`).d('服务路由'),
      //   bind: 'service.serviceRoute',
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return record.get('type') === '1';
      //     },
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'never' : 'always';
      //     },
      //   },
      // },
      // {
      //   name: 'dimensionality',
      //   type: 'string',
      //   dynamicProps: {
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'never' : 'always';
      //     },
      //   },
      // },
      // {
      //   name: 'defaultRet',
      //   type: 'string',
      //   lookupCode: 'SDPS.META_DEFINITION.DEFAULT_RET',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.noRelevantStrategy`).d('无相关策略'),
      //   dynamicProps: {
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'always' : 'never';
      //     },
      //     required: ({ record }) => {
      //       return record.get('type') === '0';
      //     },
      //   },
      // },
      // {
      //   name: 'defaultRetLine',
      //   type: 'string',
      //   lookupCode: 'SDPS.META_DEFINITION.DEFAULT_RET_LINE',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.defaultRetLine`).d('下线后返回码'),
      //   required: true,
      // },
      // {
      //   name: 'defaultRetEmpty',
      //   type: 'string',
      //   lookupCode: 'SDPS.CNF_META_DEFINITION.EMPTY',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.indexDefault`).d('指标默认值'),
      //   dynamicProps: {
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'always' : 'never';
      //     },
      //     required: ({ record }) => {
      //       return record.get('type') === '0';
      //     },
      //   },
      // },
      // {
      //   name: 'retEmpty',
      //   type: 'number',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.indexNullDefault`).d('指标缺省值'),
      //   defaultValue: null,
      //   dynamicProps: {
      //     required: ({ record }) => {
      //       return record.get('type') === '0';
      //     },
      //     ignore: ({ record }) => {
      //       return record.get('type') === '1' ? 'always' : 'never';
      //     },
      //   },
      //   pattern: /^(.){0,180}$/,
      //   defaultValidationMessages: {
      //     patternMismatch: intl
      //       .get(`${detailPrompt}.ruleManagesDetail.overMaximum`)
      //       .d('最多180个字符'),
      //   },
      // },
      // {
      //   name: 'defaultRetFail',
      //   type: 'string',
      //   lookupCode: 'SDPS.CNF_META_DEFINITION.FAIL',
      //   label: intl.get(`${detailPrompt}.ruleManagesDetail.defaultRetFail`).d('失败默认值'),
      // },
      {
        name: 'ruleId',
        type: 'number',
      },
    ],
    transport: {
      read: ({ data }) => {
        if (data?.ruleId) {
          return {
            url: `${SRM_DATA_PROCESS}/v1/rule-define-site/define-list`,
            method: 'GET',
          };
        }
      },
      submit: ({ data, dataSet }) => {
        const postData = {
          ...data[0],
          tenantId: dataSet.getState('tenantId'),
          ruleId: dataSet.getState('ruleId') || undefined,
        };
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-define-site/save-or-update`,
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
    selection: false,
    modifiedCheck: false,
    fields: [
      {
        name: 'ruleId',
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
        type: 'string',
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
        type: 'string',
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
        label: intl.get(`${detailPrompt}.ruleManagesDetail.calculateCode`).d('计算指标编码'),
        required: true,
        dynamicProps: {
          pattern: ({ record }) => {
            return record.get('indexType') === 'transform_parameter'
              ? /^T\.[\w(\\.)]+$/
              : /^[\w\s(\\.)]*[a-zA-Z]{1}[\w\s(\\.)]*$/;
          },
          // highlight: ({ record }) => {
          //   return record.get('indexType') === 'transform_parameter'
          //     ? intl
          //         .get(`${detailPrompt}.ruleManagesDetail.transformTip`)
          //         .d('转换参数需要遵循格式：T.+参数名')
          //     : null;
          // },
          defaultValidationMessages: ({ record }) => {
            return {
              patternMismatch:
                record.get('indexType') === 'transform_parameter'
                  ? intl
                      .get(`${detailPrompt}.tips.wrongTranCode`)
                      .d(
                        '指标编码只能由数字字母下划线组成，且至少有一个英文字母，转换参数请遵循格式：T.+参数名'
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
        const uuidCode = dataSet.getState('uuidCode');
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-index/index-list?uuidCode=${uuidCode}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const uuidCode = dataSet.getState('uuidCode');
        const tenantId = dataSet.getState('tenantId');
        // data的维度部分不需要全传，做一下处理
        const cutData = data.map((item) => {
          const { dimensionality = '[]' } = item;
          // 遍历维度
          const postDimension = JSON.parse(dimensionality).map((dimensionItem) => {
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
              indexType,
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
              indexType,
            };
          });
          return { ...item, dimensionality: JSON.stringify(postDimension) };
        });
        // 每一项新增的指标都添加一个headerId和租户ID，声明所属的规则
        const postData = cutData.map((item) => {
          return { uuidCode, tenantId, ...item };
        });
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-index/save-index`,
          method: 'POST',
          data: postData,
        };
      },
      destroy: ({ data }) => {
        // dataSet
        // const tenantId = dataSet.getState('tenantId');
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-index/delete-index`,
          method: 'DELETE',
          data,
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
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/index-define`,
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
        // 当规则类型是标准时，查询参数是指标行id
        // 当规则类型是透传时，查询参数是规则头id
        const { ruleManagementLineId, serviceCode } = data;
        return {
          url: ruleManagementLineId
            ? `${SRM_DATA_PROCESS}/v1/rule-management-lines/parameter/${serviceCode}`
            : `${SRM_DATA_PROCESS}/v1/rule-management-headers/parameter/${serviceCode}`,
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
        name: 'strategyName',
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
        type: 'string',
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
        name: 'executeExpression',
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
        name: 'strategyName',
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
      read: ({ dataSet, data }) => {
        const tenantId = dataSet.getState('currentTenantId');
        const uuidCode = dataSet.getState('uuidCode');
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-strategy`,
          method: 'GET',
          data: {
            ...data,
            tenantId,
            uuidCode,
          },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-strategy/save-or-update`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/rule-strategy/batch-delete`,
          method: 'POST',
          data,
        };
      },
    },
  };
}

// getOutDimensionDs
function getOutDimensionDs() {
  return {
    paging: false,
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
  getOutDimensionDs,
  getIndexDimensionDs,
  getDimensionListDs,
  getActionConfigTableDs,
};
