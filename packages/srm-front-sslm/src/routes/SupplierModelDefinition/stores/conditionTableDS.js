/**
 * 条件配置 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';

const commonFields = (propertyType = '') => {
  const lovFlag = propertyType === 'lovParam';
  return [
    {
      label: lovFlag
        ? intl.get(`sslm.supplierModelDefine.model.define.lovParamType`).d('参数类型')
        : intl.get(`sslm.supplierModelDefine.model.define.relation`).d('关系'),
      name: 'conExpression',
      lookupCode: 'SSLM.MODEL.CON_EXPRESSION',
      required: true,
    },
    {
      label: lovFlag
        ? intl.get(`sslm.supplierModelDefine.model.define.lovParamValue`).d('参数值')
        : intl.get(`sslm.supplierModelDefine.model.define.fieldValue`).d('字段值'),
      name: 'targetValue',
      // required: !lovFlag,
      computedProps: {
        disabled: ({ record }) =>
          ['businessKey', 'NOTNULL', 'urlParam'].includes(record.get('conExpression')),
        required: ({ record }) =>
          !['businessKey', 'NOTNULL', 'urlParam'].includes(record.get('conExpression')),
      },
    },
    {
      label: intl.get(`hzero.common.button.operator`).d('操作'),
      name: 'operator',
      ignore: 'always',
    },
  ];
};

// 值集参条件配置行ds
const lovParamDS = ({ propertyType = '' } = {}) => ({
  paging: false,
  selection: false,
  primaryKey: 'linePropertyConditionId',
  fields: [
    {
      name: 'sourceFieldCode',
      label: intl.get(`sslm.supplierModelDefine.model.define.lovParamName`).d('参数名'),
      required: true,
    },
    ...commonFields(propertyType),
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'conExpression') {
        record.set('targetValue', null);
      }
    },
  },
});

// 必输，条件配置行ds
const conditionTableDS = () => ({
  paging: false,
  selection: false,
  primaryKey: 'linePropertyConditionId',
  fields: [
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldName`).d('字段名称'),
      name: 'sourceFieldCodeLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.MODEL.SOURCE_FIELD',
      required: true,
      noCache: true,
      computedProps: {
        lovPara: ({ dataSet }) => {
          const { queryParameter: { modelSettingId } = {} } = dataSet;
          return {
            modelSettingId,
          };
        },
      },
    },
    {
      name: 'sourceFieldCode',
      bind: 'sourceFieldCodeLov.modelName',
      required: true,
    },
    {
      name: 'sourceFieldCodeMeaning',
      bind: 'sourceFieldCodeLov.modelFieldName',
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldName`).d('字段名称'),
    },
    ...commonFields(),
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'conExpression') {
        record.set('targetValue', null);
      }
    },
  },
});

const filterLogicDS = () => ({
  fields: [
    {
      name: 'conExpression',
      type: 'string',
      required: true,
      label: intl.get('sslm.supplierModelDefine.model.define.conditionType').d('筛选逻辑'),
      pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
      help: intl
        .get('sslm.supplierModelDefine.model.define.promptInfo')
        .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3'),
    },
  ],
});

export { conditionTableDS, filterLogicDS, lovParamDS };
