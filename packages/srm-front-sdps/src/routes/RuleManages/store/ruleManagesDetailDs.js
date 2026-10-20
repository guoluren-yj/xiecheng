/**
 * 规则配置详情ds
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { CODE } from 'utils/regExp';
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

function getBasicParamDs() {
  return {
    fields: [
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.fullPathCode')
          .d('规则编码'),
        required: true,
        pattern: CODE,
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.name').d('规则名称'),
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.type').d('规则类型'),
        required: true,
      },
      {
        name: 'service',
        type: 'object',
        lovCode: 'SDPS.ROUTE.DATA',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.service').d('服务名称'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.serviceCode').d('服务编码'),
        bind: 'service.serviceCode',
      },
      {
        name: 'serviceName',
        type: 'string',
        bind: 'service.serviceName',
      },
      {
        name: 'servicePath',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.servicePath').d('服务路由'),
        bind: 'service.serviceRoute',
        required: true,
      },
      {
        name: 'defaultRet',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.DEFAULT_RET',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.defaultRet')
          .d('无相关策略'),
        required: true,
      },
      {
        name: 'defaultRetLine',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.DEFAULT_RET_LINE',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.defaultRetLine')
          .d('下线后返回码'),
        required: true,
      },
      {
        name: 'defaultRetEmpty',
        type: 'string',
        lookupCode: 'SDPS.CNF_META_DEFINITION.EMPTY',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.defaultRetEmpty')
          .d('指标默认值'),
        required: true,
      },
      {
        name: 'retEmpty',
        type: 'number',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.retEmpty').d('指标缺省值'),
        defaultValue: null,
        required: true,
      },
      {
        name: 'defaultRetFail',
        type: 'string',
        lookupCode: 'SDPS.CNF_META_DEFINITION.FAIL',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.defaultRetFail')
          .d('失败默认值'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.description').d('参数描述'),
      },
    ],
  };
}

/**
 * 获取参数ds配置
 * @param {Array} otherFields 其他field配置
 * @returns
 */
function getParamDs(otherFields = []) {
  return {
    paging: false,
    selection: false,
    fields: [
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.parameterKey').d('参数key'),
      },
      {
        name: 'parameterName',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.parameterName')
          .d('参数名称'),
      },
      {
        name: 'dataType',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.dataType').d('数据类型'),
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.description').d('参数描述'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ].concat(otherFields),
  };
}

function getAddParamLovDs({ fullPathCode, type, tenantId }) {
  return {
    selection: 'multiple',
    autoQuery: true,
    fields: [
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.parameterKey').d('参数key'),
      },
      {
        name: 'parameterName',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.parameterName')
          .d('参数名称'),
      },
      {
        name: 'dataType',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.dataType').d('数据类型'),
      },
      {
        name: 'parameterType',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.TYPE',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.paramType').d('参数类型'),
      },
      {
        name: 'lastUpdatedBy',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.lastUpdatedBy')
          .d('最后更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'datetime',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.lastUpdateDate')
          .d('最后更新时间'),
      },
      // {
      //   name: 'description',
      //   type: 'string',
      //   label: intl
      //     .get('sdps.ruleManagesDetail.model.ruleManagesDetail.paramDescription')
      //     .d('参数描述'),
      // },
    ],
    queryFields: [
      {
        name: 'parameterKey',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.parameterKey').d('参数key'),
      },
      {
        name: 'parameterName',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.parameterName')
          .d('参数名称'),
      },
      {
        name: 'dataType',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.dataType').d('数据类型'),
        lookupCode: 'SDPS.PARAMETER.DATA.TYPE',
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.PARAMETER.TYPE',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.paramType').d('参数类型'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-meta-definitions/parameters?fullPathCode=${fullPathCode}&type=${type}&tenantId=${tenantId}`,
          method: 'GET',
        };
      },
    },
  };
}

function getActionConfigDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'actionName',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.actionName').d('策略名称'),
        required: true,
        maxLength: 180,
      },
      {
        name: 'description',
        type: 'string',
        maxLength: 180,
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.action.description')
          .d('策略描述'),
      },
      {
        name: 'priority',
        type: 'number',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.priority').d('策略优先级'),
        step: 1,
        min: 1,
        maxLength: 20,
        required: true,
      },
      {
        name: 'conditionExpression',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.conditionExpression')
          .d('条件表达式'),
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.value').d('执行表达式'),
        required: true,
      },
      {
        name: 'executeType',
        type: 'string',
        defaultValue: 'CONSTANT',
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
        label: intl.get('sdps.ruleManagesDetail.model.ruleManagesDetail.actionName').d('策略名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl
          .get('sdps.ruleManagesDetail.model.ruleManagesDetail.action.description')
          .d('策略描述'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-actions`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-actions?tenantId=${data[0].tenantId}`,
          method: 'POST',
          data: {
            ...data[0],
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-actions?tenantId=${data[0].tenantId}`,
          method: 'DELETE',
          data: {
            ...data[0],
          },
        };
      },
    },
  };
}

export { getBasicParamDs, getParamDs, getAddParamLovDs, getActionConfigDs };
