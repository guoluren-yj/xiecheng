/**
 * 规则配置ds（租户级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import { SRM_DATA_PROCESS } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

// 设置当前租户信息
const currentTenantId = getCurrentOrganizationId();
const intlPrompt = 'sdps.ruleManages.model';

export default function getRuleManagesOrgDs() {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.calledCode`).d('调用编码'),
      },
      {
        name: 'ruleCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.ruleManages.fullPathCode`).d('规则编码'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get(`${intlPrompt}.model.ruleManages.name`).d('规则名称'),
      },
      {
        name: 'type',
        type: 'string',
        lookupCode: 'SDPS.META_DEFINITION.TYPE',
        label: intl.get(`${intlPrompt}.model.ruleManages.type`).d('规则类型'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get(`${intlPrompt}.model.ruleManages.enableFlag`).d('规则状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'createdBy',
        type: 'string',
        label: intl.get(`${intlPrompt}.model.ruleManages.createdBy`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'datetime',
        label: intl.get(`${intlPrompt}.model.ruleManages.creationDate`).d('创建时间'),
      },
      {
        name: 'lastUpdatedBy',
        type: 'string',
        label: intl.get(`${intlPrompt}.model.ruleManages.lastUpdatedBy`).d('最后更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'datetime',
        label: intl.get(`${intlPrompt}.model.ruleManages.lastUpdateDate`).d('最后更新时间'),
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
        fixedFlag: 1,
        usedFlag: 1,
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
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-headers`,
          method: 'GET',
          data: {
            ...data,
            ruleCode: '',
          },
          params,
        };
      },
      submit: ({ data }) => {
        // 处理规则的上下线
        return {
          url: `${SRM_DATA_PROCESS}/v1/${currentTenantId}/rule-management-headers`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
}
