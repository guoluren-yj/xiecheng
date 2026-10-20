/**
 * 供应商事件配置 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  autoQuery: true,
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-headers`,
        method: 'GET',
        params,
        data,
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-headers/batchCreate`,
        data,
        params,
        method: 'POST',
      };
    },
  },
  primaryKey: 'exportCfId',
  fields: [
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.eventClassify`).d('触发事件分类'),
      name: 'cfCategory',
      lookupCode: 'SSLM.SUPPLIER_SYNC_CATEGORY',
      required: true,
      computedProps: {
        disabled: ({ record }) => record.get('exportCfId'),
      },
    },
    {
      label: intl
        .get(`sslm.supplierEventConfig.model.supplierEventConfig.eventCode`)
        .d('触发事件编码'),
      name: 'cfCodeLov',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_SERVICE_SQL',
      required: true,
      ignore: 'always',
      computedProps: {
        disabled: ({ record }) => record.get('exportCfId') || !record.get('cfCategory'),
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            tag:
              record.get('cfCategory') === 'REQ_SUBMIT'
                ? 'req'
                : record.get('cfCategory') === 'SUPPLIER_INFO_EXPORT'
                ? 'mainData'
                : null,
          };
        },
      },
    },
    {
      name: 'cfCode',
      bind: 'cfCodeLov.value',
      required: true,
    },
    {
      label: intl
        .get(`sslm.supplierEventConfig.model.supplierEventConfig.eventName`)
        .d('触发事件名称'),
      bind: 'cfCodeLov.meaning',
      name: 'cfCodeMeaning',
      disabled: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.assign`).d('分配'),
      name: 'assign',
      ignore: 'always',
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.restriction`).d('限制条件'),
      name: 'restriction',
      ignore: 'always',
    },
    {
      label: intl.get(`hzero.common.status.enableFlag`).d('启用'),
      name: 'enableFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.generateErp`).d('生成erp供应商'),
      name: 'syncErpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      computedProps: {
        disabled: ({ record }) => record.get('cfCategory') === 'REQ_SUBMIT',
      },
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.writeErp`).d('回写erp供应商数据'),
      name: 'writeErpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      computedProps: {
        disabled: ({ record }) =>
          !(record.get('cfCategory') === 'SUPPLIER_INFO_EXPORT' && !!record.get('syncErpFlag')),
      },
      help: intl
        .get(`sslm.supplierEventConfig.model.eventConfig.writeErpMessage`)
        .d(
          '勾选配置后，主数据导出外部系统生成erp供应商时，会同时使用主数据的联系人、银行、地址、采购/财务信息生成对应的erp供应商信息。'
        ),
    },
    {
      label: intl
        .get(`sslm.supplierEventConfig.model.eventConfig.documentLevel`)
        .d('集团级数据管控'),
      name: 'documentLevelFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      help: intl
        .get(`sslm.supplierEventConfig.model.eventConfig.documentLevelMsg`)
        .d(
          '如果单据为集团级管控维度，不勾选此配置会将集团下所有公司主数据均推送至外部系统；如果勾选此配置，则只会推送一条主数据至外部系统。'
        ),
      computedProps: {
        disabled: ({ record }) => record.get('cfCategory') !== 'SUPPLIER_INFO_EXPORT',
      },
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.asyncInterface`).d('异步接口'),
      name: 'syncFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      help: intl
        .get('sslm.supplierEventConfig.model.eventConfig.asyncInterfaceMsg')
        .d('接口类型为主数据导出接口时，若配置同步接口，接口报错可能会导致触发单据无法正常完结'),
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.targetSystem`).d('多方外部系统'),
      name: 'targetSystem',
      lookupCode: 'SSLM.TARGET_SYSTEM',
      required: true,
      help: intl
        .get(`sslm.supplierEventConfig.model.eventConfig.documentTargetSystemMsg`)
        .d(
          '可配置需推送场景，推送外部系统将直接触发导出外部系统；推送至开放平台的数据，可供外部系统后续进行数据拉取。'
        ),
      computedProps: {
        disabled: ({ record }) => record.get('cfCategory') !== 'SUPPLIER_INFO_EXPORT',
      },
      defaultValue: 'EXTERNAL_SYSTEM',
    },
    {
      name: 'tactics',
      type: 'string',
      label: intl.get('sslm.supplierEventConfig.model.eventConfig.conditionType').d('策略逻辑'),
      required: true,
      defaultValue: 'TRUE',
    },
    {
      name: 'tacticsCustomize',
      type: 'string',
      label: intl.get('sslm.supplierEventConfig.model.eventConfig.conditionType').d('策略逻辑'),
      required: true,
      defaultValue: 'TRUE',
    },
    {
      name: 'tacticsRule',
      type: 'string',
      label: intl.get('sslm.supplierEventConfig.model.define.conditionType').d('自定义组合规则'),
      pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
      help: intl
        .get('sslm.supplierEventConfig.model.define.promptInfo')
        .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3'),
      computedProps: {
        required: ({ record }) => record.get('tactics') === 'CUSTOMER',
      },
    },
    // // 拓展条件定义
    {
      name: 'tacticsCustomizeRule',
      type: 'string',
      label: intl.get('sslm.supplierEventConfig.model.define.conditionType').d('自定义组合规则'),
      pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
      help: intl
        .get('sslm.supplierEventConfig.model.define.promptInfo')
        .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3'),
      computedProps: {
        required: ({ record }) => record.get('tacticsCustomize') === 'CUSTOMER',
      },
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'operate',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.eventClassify`).d('触发事件分类'),
      name: 'cfCategory',
      lookupCode: 'SSLM.SUPPLIER_SYNC_CATEGORY',
    },
    {
      label: intl
        .get(`sslm.supplierEventConfig.model.supplierEventConfig.eventCode`)
        .d('触发事件编码'),
      name: 'cfCode',
      lookupCode: 'SSLM.SUPPLIER_SYNCHRONIZATION_SERVICE',
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'cfCategory') {
        if (value === 'SUPPLIER_INFO_EXPORT') {
          record.set('documentLevelFlag', 1);
          record.set('syncFlag', 1);
          record.set('syncErpFlag', 1);
          record.set('writeErpFlag', 1);
          //   触发事件分类=主数据导出时，【生成erp供应商、回写erp供应商数据】默认勾选
        } else {
          record.set('documentLevelFlag', 1);
          record.set('syncFlag', 0);
          record.set('targetSystem', 'EXTERNAL_SYSTEM');
          record.set('syncErpFlag', 0);
          record.set('writeErpFlag', 0);
        }
        // 清空触发事件编码
        record.set({
          cfCodeLov: null,
        });
      }
      if (name === 'syncErpFlag') {
        record.set('writeErpFlag', 0);
      }
    },
  },
});
