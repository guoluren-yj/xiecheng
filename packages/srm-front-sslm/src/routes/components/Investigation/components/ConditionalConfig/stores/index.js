import intl from 'hzero-front/lib/utils/intl';

import { getComponentType } from '../utils';

// 条件逻辑
const getConditionRuleDs = () => ({
  autoCreate: false,
  fields: [
    {
      name: 'conditionType',
      type: 'string',
      label: intl.get('sslm.investDefOrg.model.rulesDefinition.conditionType').d('策略逻辑'),
      required: true,
      defaultValue: 'TRUE',
    },
  ],
});

// 规则条件 ds
const getConditionLineDs = () => {
  return {
    selection: false,
    paging: false,
    fields: [
      {
        name: 'fieldNameLov',
        type: 'object',
        label: intl.get('sslm.common.model.condition.fieldName').d('字段名称'),
        lovCode: 'SSLM.INVESTIGATE_CF_LINE_FX_FIELD',
        required: true,
        noCache: true,
        computedProps: {
          lovPara: ({ dataSet }) => {
            const investgCfHeaderId = dataSet.getQueryParameter('investgCfHeaderId');
            return {
              investgCfHeaderId,
            };
          },
        },
        transformResponse: (value, data) => {
          const { fieldName, fieldNameMeaning } = data;
          return {
            fieldCode: fieldName,
            fieldDescription: fieldNameMeaning,
          };
        },
        ignore: 'always',
      },
      {
        name: 'fieldName',
        required: true,
        bind: 'fieldNameLov.fieldCode',
      },
      {
        name: 'componentType',
        bind: 'fieldNameLov.componentType',
        ignore: 'always',
      },
      {
        name: 'lovFlag',
        bind: 'fieldNameLov.lovFlag',
        ignore: 'always',
      },
      {
        name: 'lovCode',
        bind: 'fieldNameLov.lovCode',
        ignore: 'always',
      },
      {
        name: 'lovCode',
        bind: 'fieldNameLov.lovCode',
        ignore: 'always',
      },
      {
        name: 'valueField',
        bind: 'fieldNameLov.valueField',
        ignore: 'always',
      },
      {
        name: 'textField',
        bind: 'fieldNameLov.textField',
        ignore: 'always',
      },
      {
        name: 'toValueListFlag',
        bind: 'fieldNameLov.toValueListFlag',
        ignore: 'always',
      },
      {
        name: 'relation',
        type: 'string',
        lookupCode: 'SSLM.INVESTIGATE_CF_LINE_FX_TYPE',
        label: intl.get('sslm.investDefOrg.model.rulesDefinition.relation').d('特性条件'),
        required: true,
      },
      {
        name: 'fieldValue',
        label: intl.get('sslm.common.model.condition.fieldValue').d('字段值'),
        dynamicProps: ({ record }) => {
          let config = {};
          config = getComponentType({ record });
          return config;
        },
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'fieldNameLov') {
          record.set({
            fieldValue: null,
          });
        }
      },
    },
  };
};

// 用户自定义租户Ds
const getCustomizeConditionCombinationDs = () => {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'customizeConditionCombination',
        type: 'string',
        label: intl.get('sslm.investDefOrg.view.select.customize').d('自定义组合规则'),
        pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
        required: true,
      },
    ],
  };
};

export { getConditionRuleDs, getConditionLineDs, getCustomizeConditionCombinationDs };
