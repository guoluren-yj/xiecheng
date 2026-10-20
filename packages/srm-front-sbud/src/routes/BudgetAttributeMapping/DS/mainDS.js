/*eslint-disable*/
/*
 * @Description:
 * @Date: 2020-07-23 10:38:14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import { getMomentDate, getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const mainTableDs = () => ({
  primaryKey: 'budgetItemId',
  autoQuery: true,
  // table表单显示的字段
  fields: [
    {
      name: 'budgetItemCode',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.budgetItemCode')
        .d('维度编码'),
    },
    {
      name: 'budgetItemName',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.budgetItemName')
        .d('维度名称'),
    },
    {
      name: 'requiredFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.requiredFlag')
        .d('是否必输'),
    },
    {
      name: 'queryFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.queryFlag')
        .d('是否作为查询条件'),
    },
    {
      name: 'multipleFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.multipleFlag')
        .d('是否多选'),
    },
    {
      name: 'budgetFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.budgetFlag')
        .d('预算维度'),
    },
    {
      name: 'cycleFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.cycleFlag')
        .d('周期维度'),
    },
    {
      name: 'mergeApproveFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.mergeApproveFlag')
        .d('并审标识'),
    },
    {
      name: 'gridSeq',
      type: 'string',
      label: intl.get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.gridSeq').d('位置'),
    },
    {
      name: 'gridWidth',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.gridWidth')
        .d('宽度'),
    },
    {
      name: 'componentTypeMeaning',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.componentType')
        .d('组件类型'),
    },
    {
      name: 'lovCode',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.lovCode')
        .d('值集编码'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.enabledFlag')
        .d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.operation')
        .d('操作'),
    },
    {
      name: 'predefinedFlag',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.predefinedFlag')
        .d('预定义维度'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { ...otherData } = data;
      const queryParams = getDatas(otherData);
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-item/page`,
        method: 'GET',
        data: {
          ...queryParams,
        },
      };
    },
  },
});

// 基础维度form ds
const basicDrawerFormDs = () => ({
  // autoQuery: true,
  // autoCreate: true,

  // table表单显示的字段
  fields: [
    {
      name: 'budgetItemCode',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.budgetItemCode')
        .d('维度编码'),
      required: true,
      pattern: '^[a-zA-Z]+[a-zA-Z0-9_]*$',
    },
    {
      name: 'budgetItemName',
      type: 'intl',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.budgetItemName')
        .d('维度名称'),
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.yesOrNo')
        .d('是否启用'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.requiredFlag')
        .d('是否必输'),
    },
    {
      name: 'queryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.queryFlag')
        .d('是否作为查询条件'),
    },
    {
      name: 'gridSeq',
      type: 'number',
      label: intl.get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.gridSeq').d('位置'),
      required: true,
      validator: (value, _, record) => {
        if (Number(record.get('gridSeq')) < 0) {
          return intl
            .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.gridSeqVali')
            .d('位置不能小于零');
        }
        return true;
      },
    },
    {
      name: 'gridWidth',
      type: 'number',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.gridWidth')
        .d('宽度'),
      required: true,
      validator: (value, _, record) => {
        if (Number(record.get('gridWidth')) < 0) {
          return intl
            .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.gridWidthVali')
            .d('宽度不能小于零');
        }
        return true;
      },
    },
    {
      name: 'componentType',
      type: 'string',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.componentType')
        .d('组件类型'),
      lookupCode: 'SBUD.BUDGET_COMPONENT_TYPE',
      required: true,
    },
    {
      name: 'lovCodeObj',
      type: 'object',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.lovCode')
        .d('值集编码'),
      dynamicProps: {
        required: ({ record }) => {
          if (['LOV', 'SELECT'].includes(record.get('componentType'))) {
            return true;
          } else {
            return false;
          }
        },
        lovCode: ({ record }) => {
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            return 'HPFM.LOV.VIEW.ORG';
          }
          if (componentType === 'SELECT') {
            return 'HPFM.LOV.VIEW.LOV_IDP';
          }
        },

        textField: ({ record }) => {
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            return 'viewCode';
          }
          if (componentType === 'SELECT') {
            return 'lovCode';
          }
        },

        valueField: ({ record }) => {
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            return 'viewCode';
          }
          if (componentType === 'SELECT') {
            return 'lovCode';
          }
        },
        // 值集存viewCode， 下拉框 lovCode
      },
    },
    {
      name: 'lovCode',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            return 'lovCodeObj.viewCode';
          }
          if (componentType === 'SELECT') {
            return 'lovCodeObj.lovCode';
          }
        },
      },
      // bind: 'lovCodeObj.lovCode',
    },
    {
      name: 'multipleFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.multipleFlags')
        .d('启用多选'),
    },
    {
      name: 'budgetFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.budgetFlag')
        .d('预算维度'),
    },
    {
      name: 'cycleFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.cycleFlag')
        .d('周期维度'),
    },
    {
      name: 'predefinedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      disabled: true,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.predefinedFlag')
        .d('预定义维度'),
    },
    {
      name: 'mergeApproveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.mergeApproveFlag')
        .d('并审标识'),
    },
    {
      name: 'requiredCondition',
      type: 'object',
    },
    {
      name: 'encryptFlag',
      type: 'string',
      defaultValue: '-1',
      lookupCode: 'HPFM.CUST.UNIT_COND_OPTIONS',
      label: intl.get('hpfm.individual.model.config.encryptFlag').d('强制加密'),
    },
  ],
});

// 基础维度映射关系ds
const basicDrawerMapDs = () => ({
  // autoQuery: true,
  primaryKey: 'itemMappingId',

  // table表单显示的字段
  fields: [
    {
      name: 'documentType',
      type: 'string',
      required: true,
      lookupCode: 'SBUD.BUDGET_DOCUMENT_TYPE',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.documentType')
        .d('来源单据'),
      lookupAxiosConfig: () => ({
        url: '/hpfm/v1/lovs/data',
        method: 'GET',
        params: {
          lovCode: 'SBUD.BUDGET_DOCUMENT_TYPE',
          tenantId: organizationId,
        },
        transformResponse(data) {
          if (data) {
            const arr =
              typeof data === 'string'
                ? JSON.parse(data).filter((ele) => ele.value !== 'CL')
                : data;
            return arr;
          } else {
            return [];
          }
        },
      }),
    },
    {
      name: 'fieldNameDesc',
      type: 'string',
      required: true,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.fieldNameDescs')
        .d('来源单据字段描述'),
    },
    {
      name: 'fieldName',
      type: 'string',
      required: true,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.fieldNames')
        .d('来源单据字段名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('fieldName'))) {
          return intl
            .get('sbud.budgetAttributeMapping.fieldNameDesc.validation.notChinese')
            .d('来源单据字段名不能为中文');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
    {
      name: 'mapping',
      type: 'string',
      label: intl.get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.mapping').d('映射'),
    },
    {
      name: 'sqlMapping',
      type: 'string',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { budgetItemId } = {} } = dataSet;
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-item-mappings`,
        method: 'GET',
        data: {
          budgetItemId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-item-mappings`,
        data: data,
        method: 'DELETE',
      };
    },
  },
});

// 基础维度值集映射ds
const basicDrawerLovMapDs = () => ({
  // autoQuery: true,
  primaryKey: 'itemLovId',

  // table表单显示的字段
  fields: [
    {
      name: 'mappingItem',
      type: 'object',
      required: false,
      lovCode: 'SBUD.BUDGET_ITEM_MAPING',
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.targetDimensionCode')
        .d('映射维度编码'),
      valueField: 'budgetItemCode',
      textField: 'budgetItemCode',
      dynamicProps: ({ dataSet }) => ({
        lovPara: {
          budgetItemId: dataSet.queryParameter.budgetItemId,
          tenantId: getCurrentOrganizationId(),
        },
      }),
    },
    {
      name: 'mappingItemCode',
      type: 'string',
      bind: 'mappingItem.budgetItemCode',
    },
    {
      name: 'mappingItemName',
      type: 'string',
      required: true,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.mappingItemName')
        .d('维度名称'),
      bind: 'mappingItem.budgetItemName',
    },
    {
      name: 'valueFieldName',
      type: 'string',
      required: true,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.valueFieldNames')
        .d('值集对象字段'),
    },
    {
      name: 'valueField',
      type: 'string',
      required: true,
      label: intl
        .get('sbud.budgetAttributeMapping.model.budgetAttributeMapping.valueFields')
        .d('值集对象字段名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('valueField'))) {
          return intl
            .get('sbud.budgetAttributeMapping.valueFieldName.validation.notChinese')
            .d('值集对象字段名不能为中文');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { budgetItemId } = {} } = dataSet;
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-item-lovs`,
        method: 'GET',
        data: {
          budgetItemId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-item-lovs`,
        data,
        method: 'DELETE',
      };
    },
  },
});

const sqlMappingDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'sqlMapping',
      type: 'string',
    },
  ],
});

export { mainTableDs, basicDrawerFormDs, basicDrawerMapDs, basicDrawerLovMapDs, sqlMappingDs };
