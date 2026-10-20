/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';

export function getListDs() {
  return {
    // autoQuery: true,
    queryFields: [
      {
        name: 'functionCode',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionCode').d('函数编码'),
        // ignore: 'always',
      },
      {
        name: 'functionName',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionName').d('函数名称'),
      },
      {
        name: 'entityCode',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.entityCode').d('模板编码'),
        // ignore: 'always',
      },
    ],
    fields: [
      {
        name: 'functionCode',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionCode').d('函数编码'),
        // ignore: 'always',
      },
      {
        name: 'functionName',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionName').d('函数名称'),
      },
      {
        name: 'functionTypeMeaning',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionType').d('函数类型'),
      },
      {
        name: 'isLabel',
        type: 'boolean',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.isLabel').d('是否标签'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'labelLov',
        type: 'object',
        ignore: 'always',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.labelLov').d('标签'),
        lovCode: 'SPFM.DOC_LABEL',
        textField: 'labelName',
      },
      {
        name: 'labelId',
        bind: 'labelLov.labelId',
      },
      {
        name: 'labelName',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.labelLov').d('标签'),
        bind: 'labelLov.labelName',
      },
      {
        name: 'labelCode',
        bind: 'labelLov.labelCode',
      },
      {
        name: 'functionEntities',
        type: 'string',
        label: intl
          .get('spfm.functionLibrary.model.functionLibrary.functionEntities')
          .d('分配使用范围'),
      },
      {
        name: 'functionFields',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionFields').d('字段'),
      },
      {
        name: 'expression',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.expression').d('表达式'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.remark').d('函数说明'),
      },
      {
        name: 'levelCodeMeaning',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.levelCodeMeaning').d('层级'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.action').d('操作'),
      },
      {
        name: 'enabled',
        type: 'number',
        label: intl.get('hzero.common.status').d('状态'),
      },
    ],
    selection: false,
    // query: true,
    transport: {
      read: ({ data = {} }) => {
        const { params, ...otherParams } = data;
        return {
          url: `${SRM_ADAPTOR}/v1/function-library/list`,
          method: 'GET',
          data: otherParams,
        };
      },
    },
  };
}

export function getEditDS() {
  return {
    dataToJSON: 'all',
    fields: [
      {
        name: 'functionCode',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionCode').d('函数编码'),
        required: true,
      },
      {
        name: 'functionName',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionName').d('函数名称'),
        required: true,
      },
      {
        name: 'functionType',
        type: 'string',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionType').d('函数类型'),
        lookupCode: 'SADA.FUNCTION_LIBRARY_TYPE',
        required: true,
      },
      {
        name: 'isLabel',
        type: 'boolean',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.isLabel').d('是否标签'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'entityList',
        type: 'object',
        label: intl
          .get(`spfm.functionLibrary.model.functionLibrary.functionEntities`)
          .d('分配适用范围'),
        lovCode: 'SADA.SIMPLE_STRUCTURE_VIEW',
        textField: 'entityName',
        transformRequest: (val) => {
          return [val];
        },
        transformResponse: (val) => {
          return val ? val[0] : '';
        },
        required: true,
      },
      {
        name: 'entityCode',
        bind: 'entityList.entityCode',
      },
      {
        name: 'fieldList',
        type: 'object',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.functionFields').d('字段'),
        lovCode: 'SADA.ADAPTOR_ENTITY_STRUCTURES.FIELDS',
        multiple: true,
        textField: 'description',
        transformRequest: (val) => {
          return val && val.length
            ? val.map((item) => {
                const { required } = item;
                return { ...item, required: required ? 1 : 0 };
              })
            : val;
        },
        dynamicProps: {
          required: ({ record }) => !record.get('isLabel'),
          lovPara: ({ record }) => {
            return {
              entityCodes: record.get('entityCode'),
            };
          },
        },
      },
      {
        name: 'labelLov',
        ignore: 'always',
        type: 'object',
        label: intl.get('spfm.functionLibrary.model.functionLibrary.labelLov').d('标签'),
        lovCode: 'SPFM.DOC_LABEL',
        textField: 'labelName',
        dynamicProps: {
          required: ({ record }) => record.get('isLabel'),
          lovPara: ({ record }) => {
            return {
              entityCodes: record.get('entityCode'),
            };
          },
        },
      },
      {
        name: 'labelId',
        bind: 'labelLov.labelId',
      },
      {
        name: 'labelName',
        bind: 'labelLov.labelName',
      },
      {
        name: 'labelCode',
        bind: 'labelLov.labelCode',
      },
      {
        name: 'expression',
        type: 'string',
        label: intl.get(`spfm.functionLibrary.model.functionLibrary.expression`).d('表达式'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`spfm.functionLibrary.model.functionLibrary.remark`).d('函数说明'),
        required: true,
      },
      {
        name: 'levelCode',
        type: 'string',
        label: intl.get(`spfm.functionLibrary.model.functionLibrary.levelCode`).d('层级'),
        lookupCode: 'HIAM.DOC_TYPE_LEVEL_CODE',
        required: true,
      },
      {
        name: 'assignList',
        type: 'object',
        label: intl.get(`spfm.functionLibrary.model.functionLibrary.tenant`).d('选择租户'),
        lovCode: 'HPFM.TENANT',
        multiple: true,
        textField: 'tenantName',
        // assignValueId
        transformRequest: (val) => {
          return val && val.length
            ? val.map((item) => {
                const { tenantId, assignValueId } = item;
                if (!assignValueId) {
                  return { ...item, assignValueId: tenantId };
                }
                return item;
              })
            : val;
        },
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: intl.get('hzero.common.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { functionId } = data;
        return functionId
          ? {
              url: `${SRM_ADAPTOR}/v1/function-library/${functionId}`,
              method: 'GET',
            }
          : null;
      },
      submit: (a = {}) => {
        const { data = [] } = a;
        const body = data[0] || {};
        const { enabled = 0 } = body;
        return {
          url: `${SRM_ADAPTOR}/v1/function-library`,
          method: 'POST',
          data: { ...body, enabled },
        };
      },
    },
  };
}
