import { getCurrentOrganizationId, getCurrentUser, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const basicFormDS = () => ({
  selection: false,
  primaryKey: 'expandId',

  // table表单显示的字段
  fields: [
    {
      name: 'expandCode',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibCode').d('策略编码'),
    },
    {
      name: 'expandName',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandName').d('策略名称'),
    },
    {
      name: 'priorityLevel',
      type: 'number',
      min: 0,
      step: 1,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priorityLevel').d('优先级'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.remark').d('策略说明'),
    },
    {
      name: 'priceLibExpandByCodes',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandByCodes').d('调用规则'),
      lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      multiple: ',',
    },
    {
      name: 'templateIdsLov',
      type: 'object',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.templateIds').d('价格库模板'),
      lovCode: 'SSRC.PRICE_LIB_TEMPLATE',
      multiple: true,
    },
    {
      name: 'templateIds',
      type: 'string',
      bind: 'templateIdsLov.templateId',
      multiple: ',',
    },
    {
      name: 'templateIdMeaning',
      type: 'string',
      bind: 'templateIdsLov.templateName',
      multiple: ',',
    },
    {
      name: 'realName',
      type: 'string',
      defaultValue: getCurrentUser().realName,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.creationDate').d('创建时间'),
      format: getDateTimeFormat(),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'versionNum',
      type: 'number',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.versionNum').d('版本'),
    },
  ],
});

const policySettingRuleDS = () => ({
  // autoQuery: true,
  primaryKey: 'ruleLineId',
  selection: false,
  paging: false,

  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.lineNum').d('序号'),
    },
    {
      name: 'dimensionCodeLOV',
      type: 'object',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.appointDimension').d('维度'),
      required: true,
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({ templateIds: dataSet.queryParameter.templateIds }),
      },
    },
    {
      name: 'dimensionCode',
      type: 'string',
      bind: 'dimensionCodeLOV.dimensionCode',
    },
    {
      name: 'dimensionName',
      type: 'string',
      bind: 'dimensionCodeLOV.dimensionName',
    },
    {
      name: 'sourceCode',
      type: 'string',
      bind: 'dimensionCodeLOV.sourceCode',
    },
    {
      name: 'fieldWidget',
      type: 'string',
      bind: 'dimensionCodeLOV.fieldWidget',
    },
    {
      name: 'ruleExpression',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.PRICE_LIB_RULE_EXPRESSION',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.checkExpression').d('运算符'),
    },
    {
      name: 'appointType',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.appointType').d('匹配类型'),
      lookupCode: 'SSRC.RULE_APPOINT_TYPE',
    },
    {
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.appointValue').d('维度值'),
      name: 'appointDimensionCodeLOV',
      type: 'object',
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
    },
    {
      name: 'appointDimensionCode',
      type: 'string',
      bind: 'appointDimensionCodeLOV.dimensionCode',
    },
    {
      name: 'appointDimensionName',
      type: 'string',
      bind: 'appointDimensionCodeLOV.dimensionName',
    },
    {
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.appointValue').d('维度值'),
      name: 'appointValue',
      type: 'string',
      dynamicProps: {
        lookupCode: ({ record }) =>
          record.get('fieldWidget') === 'SELECT' && record.get('appointType') === 'SCOPE'
            ? record.get('sourceCode')
            : '',
        multiple: ({ record }) => {
          if (record.get('appointType') === 'SCOPE') {
            return ',';
          } else {
            return false;
          }
        },
      },
    },
    {
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.appointValue').d('维度值'),
      name: 'appointValueMeaning',
      type: 'string',
      multiple: ',',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { sourceFromId },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines`,
        method: 'GET',
        data: {
          sourceFromId,
          sourceFrom: 'DIMENSION',
        },
      };
    },
  },
});

const policySettingScopeDS = () => ({
  // autoCreate: true,
  paging: false,
  selection: false,
  primaryKey: 'ruleCombId',
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.lineNum').d('序号'),
    },
    {
      name: 'combExpression',
      type: 'string',
      help: intl
        .get('ssrc.priceExpandStrategy.view.placeholder.combExpression')
        .d('使用编号及AND、OR编写运算规则。示例1AND2AND3'),
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.combExpression').d('自定义规则'),
    },
    {
      name: 'expandScope',
      label: intl.get(`ssrc.priceExpandStrategy.view.message.panel.expandScope`).d('拓展范围'),
    },
  ],
});

const policySettingScopeTableDS = () => ({
  selection: false,
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',

  fields: [
    {
      name: 'dataName',
      type: 'string',
    },
    {
      name: 'dataCode',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataCode').d('编码'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataCode').d('编码'),
      display: true,
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataName').d('名称'),
      display: true,
    },
  ],

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-data-lns`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

export { basicFormDS, policySettingRuleDS, policySettingScopeDS, policySettingScopeTableDS };
