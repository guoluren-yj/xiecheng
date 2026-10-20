/**
 * 订阅配置Ds
 * @date: 2021-06-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

export default function getSubscribeManagesDs() {
  return {
    selection: false,
    autoQuery: true,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.code').d('调用编码'),
        required: true,
      },
      {
        name: 'name',
        type: 'intl',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.name').d('调用名称'),
        required: true,
      },
      {
        name: 'mdCode',
        type: 'object',
        lovCode: 'SDPS.RULE.INFO',
        label: intl.get('sdps.subscribeManages.model.subscribeManages.rulePathCode').d('规则编码'),
        ignore: 'always',
        lovPara: {
          tenantId: organizationId,
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
      // {
      //   name: 'isSub',
      //   type: 'boolean',
      //   label: intl.get('sdps.subscribeManages.model.subscribeManages.isSub').d('是否订阅'),
      //   trueValue: 1,
      //   falseValue: 0,
      //   defaultValue: 1,
      // },
      // {
      //   name: 'enableFlag',
      //   type: 'boolean',
      //   label: intl.get('hzero.common.status').d('状态'),
      //   trueValue: 1,
      //   falseValue: 0,
      //   defaultValue: 1,
      // },
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
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/data-routes`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        const { ruleCode, ...restData } = data[0];
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/data-routes`,
          method: 'POST',
          data: {
            ...restData,
            rulePathCode: ruleCode,
            fullPathCode: ruleCode,
          },
        };
      },
      destroy: ({ data }) => {
        const { ruleCode, ...restData } = data[0];
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/data-routes`,
          method: 'DELETE',
          data: {
            ...restData,
            rulePathCode: ruleCode,
            fullPathCode: ruleCode,
          },
        };
      },
    },
  };
}
