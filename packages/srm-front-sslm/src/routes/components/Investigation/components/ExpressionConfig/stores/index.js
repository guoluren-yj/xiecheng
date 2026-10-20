/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-01 11:32:18
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import intl from 'utils/intl';
// import { num2CodeStr } from '../utils';

const getExpressionFieldDs = () => {
  return {
    selection: false,
    paging: false,
    fields: [
      // {
      //   name: 'paramsName',
      //   label: intl.get('sslm.common.model.expressionConfig.paramsName').d('参数名'),
      // },
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
    ],
    events: {
      // load: ({ dataSet }) => {
      //   dataSet.forEach((record, idx) => {
      //     console.log(record, idx);
      //     record.set('paramsName', num2CodeStr(idx));
      //   });
      // },
    },
  };
};

// 用户自定义租户Ds
const getCustomizeExpressionDs = () => {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'customizeConditionCombination',
        type: 'string',
        label: intl.get('sslm.investDefOrg.view.select.customizeExpress').d('自定义表达式'),
        // pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
        required: true,
      },
    ],
  };
};

export { getExpressionFieldDs, getCustomizeExpressionDs };
