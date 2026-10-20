import { getCurrentOrganizationId, getCurrentUser, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import { isArray } from 'lodash';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const basicFormDS = () => ({
  selection: false,
  primaryKey: 'expandId',
  forceValidate: true,
  // table表单显示的字段
  fields: [
    {
      name: 'expandCode',
      type: 'string',
      disabled: true,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.priceLibCode').d('策略编码'),
    },
    {
      name: 'expandName',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.expandName').d('策略名称'),
    },
    {
      name: 'priorityLevel',
      type: 'number',
      min: 0,
      step: 1,
      required: true,
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
      required: true,
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
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.creationDate').d('创建时间'),
      disabled: true,
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
  forceValidate: true,
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
        lovPara: ({ dataSet }) => ({ expandId: dataSet.queryParameter.expandId, from: 'EXPAND' }),
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
      name: 'valueField',
      type: 'string',
      bind: 'dimensionCodeLOV.valueField',
      ignore: 'always',
    },
    {
      name: 'displayField',
      type: 'string',
      bind: 'dimensionCodeLOV.displayField',
      ignore: 'always',
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
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL',
      },
    },
    {
      label: intl.get('ssrc.priceLibDimension.model.dimension.appointValue').d('目标字段值'),
      name: 'appointValueLov',
      type: 'object',
      ignore: 'always',
      multiple: true,
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        // required: ({ record }) =>
        //   record &&
        //   record.get('ruleExpression') !== 'IS_NULL' &&
        //   record.get('ruleExpression') !== 'NOT_NULL' &&
        //   record.get('fieldWidget') === 'LOV',
        // lovPara: ({ dataSet, record }) => record.get('appointType') === 'CURRENT_DIMENSION' ? ({ templateId: dataSet.queryParameter.templateId }) : '',
        lovCode: ({ record }) => record.get('sourceCode'),
        valueField: ({ record }) => record.get('valueField'),
        textField: ({ record }) => record.get('displayField'),
        // multiple: ({ record }) => record.get('appointType') === 'SCOPE',
      },
    },
    {
      name: 'appointValue',
      // type: 'string',
      transformRequest: (value, record) => {
        if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV' && value) {
          const bindName = record.data.ruleLineId
            ? record.data.valueField
            : record.get('valueField');
          return isArray(value) ? value.map((item) => item[bindName]).join(',') : value[bindName];
        }
        return value;
      },
      transformResponse: (value, record) => {
        const { appointValueMeaning, appointType, fieldWidget, valueField, displayField } = record;
        if (appointType === 'SCOPE' && fieldWidget === 'LOV') {
          const valueList = value?.split(',') || [];
          const displayList = appointValueMeaning?.split(',') || [];
          return value
            ? valueList.map((item, index) => ({
                [valueField]: item,
                [displayField]: displayList[index],
              }))
            : null;
        }
        return value;
      },
      dynamicProps: {
        type: ({ record }) => (record?.get('fieldWidget') === 'LOV' ? 'object' : 'string'),
        lovCode: ({ record }) => record?.get('fieldWidget') === 'LOV' && record.get('sourceCode'),
        valueField: ({ record }) =>
          record?.get('fieldWidget') === 'LOV' ? record.get('valueField') : 'value',
        textField: ({ record }) =>
          record?.get('fieldWidget') === 'LOV' ? record.get('displayField') : 'meaning',
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL',
        lookupCode: ({ record }) =>
          record.get('fieldWidget') === 'SELECT' && record.get('appointType') === 'SCOPE'
            ? record.get('sourceCode')
            : '',
        // bind: ({ record }) => {
        //   if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV') {
        //     const bindName = record.data.ruleLineId
        //       ? record.data.valueField
        //       : record.get('valueField');
        //     return bindName && `appointValueLov.${bindName}`;
        //   } else if (record.get('appointType') === 'VALUE') {
        //     return '';
        //   }
        // },
        multiple: ({ record }) => {
          if (record.get('appointType') === 'SCOPE') {
            return record?.get('fieldWidget') === 'LOV' || ',';
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'appointValueMeaning',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV') {
            const bindName = record.data.ruleLineId
              ? record.data.displayField
              : record.get('displayField');
            return bindName && `appointValue.${bindName}`;
          } else if (
            record.get('appointType') === 'SCOPE' &&
            record.get('fieldWidget') === 'SELECT'
          ) {
            return 'appointValue';
          } else if (record.get('appointType') === 'VALUE') {
            return '';
          }
        },
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
  ],

  events: {
    update: ({ record, name, value, oldValue }) => {
      // 目标价格维度
      // 目标价格维度类型为select,lov，匹配类型为指定范围
      if (name === 'dimensionCodeLOV') {
        record.set('ruleExpression', undefined);
        record.set('appointType', undefined);
        record.set('appointValue', undefined);
        record.set('appointValueMeaning', undefined);
        record.set('appointValueLov', undefined);
      }
      // 运算符
      // 运算符为空或非空，匹配类型和纬度值禁用
      if (name === 'ruleExpression') {
        if (
          (value === 'IS_NULL' || value === 'NOT_NULL') &&
          oldValue !== 'IS_NULL' &&
          oldValue !== 'NOT_NULL'
        ) {
          record.set('appointType', undefined);
          record.set('appointValue', undefined);
          record.set('appointValueMeaning', undefined);
          record.set('appointValueLov', undefined);
        } else if (
          value !== 'IS_NULL' &&
          value !== 'NOT_NULL' &&
          (oldValue === 'IS_NULL' || oldValue === 'NOT_NULL') &&
          record.get('dimensionCodeLOV') &&
          (record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
            record.get('dimensionCodeLOV').fieldWidget === 'SELECT')
        ) {
          record.set('appointType', 'SCOPE');
        }
      }

      // 匹配类型
      if (name === 'appointType') {
        if (oldValue === 'VALUE') {
          record.set('appointValue', undefined);
        } else if (oldValue === 'SCOPE') {
          record.set('appointValueLov', undefined);
          record.set('appointValue', undefined);
          record.set('appointValueMeaning', undefined);
        }
      }
      // if (name === 'appointValue' && record.get('fieldWidget') === 'LOV') {
      //   record.set('appointValueLov', value);
      // }
    },
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { ruleHeaderId },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/list`,
        method: 'GET',
        data: {
          ruleHeaderId,
          sourceFrom: 'EXPAND',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines`,
        data,
        method: 'DELETE',
      };
    },
  },
});

const ruleLovConfigDS = () => ({
  fields: [],

  queryFields: [],

  // events: {
  //   load: ({ dataSet }) => {
  //     dataSet.forEach(record => {
  //       if (record.data.checkedFlag) {
  //         Object.assign(record, { isSelected: true });
  //       }
  //     });
  //   },
  // },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/introduce`;
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

const selectConfigDS = () => ({
  primaryKey: 'id',

  fields: [
    {
      name: 'dataName',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataName').d('名称'),
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
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataName').d('名称'),
    },
  ],

  // events: {
  //   load: ({ dataSet }) => {
  //     dataSet.forEach(record => {
  //       if (record.data.checkedFlag) {
  //         Object.assign(record, { isSelected: true });
  //       }
  //     });
  //   },
  // },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/introduce`;
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

const policySettingScopeDS = () => ({
  autoCreate: true,
  primaryKey: 'ruleCombId',
  forceValidate: true,
  paging: false,
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.lineNum').d('序号'),
    },
    {
      name: 'combExpression',
      help: intl
        .get('ssrc.priceExpandStrategy.view.placeholder.combExpression')
        .d('使用编号及AND、OR编写运算规则。示例1AND2AND3'),
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.combExpression').d('自定义规则'),
      type: 'string',
      required: true,
    },
    {
      name: 'expandScope',
      label: intl.get(`ssrc.priceExpandStrategy.view.message.panel.expandScope`).d('拓展范围'),
    },
  ],

  transport: {
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-combs`,
        data,
        method: 'DELETE',
      };
    },
  },
});

const policySettingScopeTableDS = () => ({
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

  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
  },

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

    destroy: ({ data, dataSet }) => {
      const { ruleCombId } = dataSet?.queryParameter?.params || {};
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-data-lns`,
        data,
        method: 'DELETE',
        params: {
          ruleCombId,
        },
      };
    },
  },
});

const policySettingScopeModalDS = () => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',

  fields: [
    {
      name: 'dataName',
      type: 'string',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataName').d('名称'),
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
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceExpandStrategy.model.strategy.dataName').d('名称'),
    },
  ],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.checkedFlag) {
          Object.assign(record, { selectable: false, isSelected: true });
        }
      });
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-data-lns/introduce`;
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

const policySettingScopeAddTabDS = () => ({
  autoCreate: true,
  selection: 'single',

  fields: [
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
        lovPara: ({ dataSet }) => ({
          expandId: dataSet.queryParameter.expandId,
          from: 'EXPAND',
          fieldWidgets: 'LOV,SELECT',
          shieldDimCodes: dataSet.queryParameter.shieldDimCodes,
        }),
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
  ],
});

const lovConfigDS = () => ({
  fields: [],

  queryFields: [],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.checkedFlag) {
          Object.assign(record, { selectable: false, isSelected: true });
        }
      });
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-data-lns/introduce`;
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

export {
  basicFormDS,
  policySettingRuleDS,
  ruleLovConfigDS,
  selectConfigDS,
  policySettingScopeDS,
  policySettingScopeTableDS,
  policySettingScopeModalDS,
  policySettingScopeAddTabDS,
  lovConfigDS,
};
