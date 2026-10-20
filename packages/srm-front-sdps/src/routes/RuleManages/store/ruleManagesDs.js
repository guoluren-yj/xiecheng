/**
 * 规则配置ds
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_DATA_PROCESS } from '_utils/config';
import intl from 'utils/intl';

export default function getRuleManagesDs() {
  return {
    selection: false,
    fields: [
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.fullPathCode').d('规则编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.name').d('规则名称'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get('sdps.ruleManages.model.ruleManages.type').d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('sdps.ruleManages.model.ruleManages.enableFlag').d('规则状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.serviceCode').d('服务编码'),
      },
      {
        name: 'serviceName',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.serviceName').d('服务名称'),
      },
      {
        name: 'createdBy',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'datetime',
        label: intl.get('sdps.ruleManages.model.ruleManages.creationDate').d('创建时间'),
      },
      {
        name: 'lastUpdatedBy',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.lastUpdatedBy').d('最后更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'datetime',
        label: intl.get('sdps.ruleManages.model.ruleManages.lastUpdateDate').d('最后更新时间'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.fullPathCode').d('规则编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.name').d('规则名称'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get('sdps.ruleManages.model.ruleManages.type').d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.enableFlag').d('规则状态'),
        lookupCode: 'SDPS.META_DEFINITION.ONLINE_OFFLINE_STATUS',
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get('sdps.ruleManages.model.ruleManages.serviceCode').d('服务编码'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-meta-definitions`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-meta-definitions?tenantId=${data[0].tenantId}`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/cnf-meta-definitions?tenantId=${data[0].tenantId}`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
}
