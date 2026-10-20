/**
 * tableDefineJsonDs.js
 * @date: 2020-10-12
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import crypto from 'crypto-js';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

const DEFAULT_COMPUTER_PROPS =
  'AGYAdQBuAGMAdABpAG8AbgAgAGcAZQB0AEMAbwBtAHAAdQB0AGUAZABQAHIAbwBwAHMAKAApACAAewAKACAAIAByAGUAdAB1AHIAbgAgAHsACgAgACAAIAAgAC8ALwAgZoJl9mUvYwFO5U4LVttOKlxeYCd2hJFNf24ACgAgACAAIAAgAC8ALwAgAGQAaQBzAGEAYgBsAGUAZAA6ACAAKAB7ACAAZABhAHQAYQBTAGUAdAAsACAAcgBlAGMAbwByAGQALAAgAG4AYQBtAGUAIAB9ACkAIAA9AD4AIABCAG8AbwBsAGUAYQBuACwACgAgACAAIAAgAC8ALwAgAHYAYQBsAGkAZABhAHQAbwByADoAIAAoAHsAIABkAGEAdABhAFMAZQB0ACwAIAByAGUAYwBvAHIAZAAsACAAbgBhAG0AZQAgAH0AKQAgAD0APgAgAGIAbwBvAGwAZQBhAG4AIAB8ACAAcwB0AHIAaQBuAGcAIAB8ACAAdQBuAGQAZQBmAGkAbgBlAGQALAAKACAAIAAgACAALwAvACAAbABvAHYAUABhAHIAYQA6ACAAKAB7ACAAZABhAHQAYQBTAGUAdAAsACAAcgBlAGMAbwByAGQALAAgAG4AYQBtAGUAIAB9ACkAIAA9AD4AIABPAGIAZQBqAGUAYwB0ACwACgAgACAAIAAgAC8ALwAgAGUAdgBlAG4AdABzADoAIAB7ACAACgAgACAAIAAgAC8ALwAgACAAIAB1AHAAZABhAHQAZQA6ACAAKAB7ACAAZABhAHQAYQBTAGUAdAAsACAAcgBlAGMAbwByAGQALAAgAG4AYQBtAGUALAAgAHYAYQBsAHUAZQAsACAAbwBsAGQAVgBhAGwAdQBlACAAfQApACAAPQA+ACAAdgBvAGkAZAAsAAoAIAAgACAAIAAvAC8AIAAgACAAYwByAGUAYQB0AGUAOgAgACgAewAgAHIAZQBjAG8AcgBkACwAIABnAGUAdABDAHUAcgByAGUAbgB0AFUAcwBlAHIAIAB9ACkAIAA9AD4AIAB2AG8AaQBkACwACgAgACAAIAAgAC8ALwAgAH0ALAAKACAAIAAgACAALwAvACAAZQB2AGUAbgB0AHNcXmAndu5STVPqZS9jAQBjAHIAZQBhAHQAZVSMAHUAcABkAGEAdABlTotO9gAKACAAIAB9ADsACgB9';

function resetAllField(record = {}) {
  record.getField('lov').reset();
  record.set('lov', '');
  record.getField('lookup').reset();
  record.set('lookup', '');
  record.getField('textField').reset();
  record.set('textField', null);
  record.getField('valueField').reset();
  record.set('valueField', null);
  record.getField('required').reset();
  record.set('required', false);
  record.getField('disabled').reset();
  record.set('disabled', false);
  record.getField('_conditionField').reset();
  record.set('_conditionField', false);
  record.getField('pattern').reset();
  record.set('pattern', '');
  record.getField('defaultValue').reset();
  record.set('defaultValue', '');
  record.getField('_encryption').reset();
  record.set('_encryption', '');
  record.getField('multiple').reset();
  record.set('multiple', false);
  record.set('required', false);
  record.getField('__unique').reset();
  record.set('required', false);
}

export default function getTableDefineJsonDs() {
  return {
    paging: false,
    fields: [
      {
        name: '_priority',
        type: 'number',
        label: intl.get('spfm.configServer.model.field._priority').d('排序'),
        required: true,
        min: 0,
        step: 1,
      },
      {
        name: 'labelType',
        type: 'string',
        label: intl.get('spfm.event.model.event.className').d('数据类型'),
        required: true,
        lookupCode: 'SPFM.REL_TABLE_LABEL_TYPE',
      },
      {
        name: 'number',
        type: 'number',
        label: intl.get('spfm.configServer.model.configServer.orderSeq').d('序号'),
        step: 1,
        required: true,
        computedProps: {
          min: ({ record }) => (record.get('labelType') === 'value' ? 1 : 0),
          max: ({ record }) => (record.get('labelType') === 'value' ? 75 : 50),
          // : dataSet.getState('tenantFlag') === 'tenant'
          // ? 50
          // : 20,
        },
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.configServer.model.order.fieldName').d('字段编码'),
        required: true,
        pattern: /^[a-z]+([a-zA-Z0-9]+)$/,
      },
      // {
      //   name: 'type',
      //   type: 'string',
      //   label: intl.get('spfm.configServer.model.field.columntype').d('字段类型'),
      //   lookupCode: 'SPFM.REL_TABLE_COLUMN_TYPE',
      //   required: true,
      // },
      {
        name: 'type',
        type: 'string',
        transformRequest: (_, Record) => {
          const _component = Record.get('_component');
          switch (_component) {
            case 'number':
              return 'number';
            case 'checkBox':
              return 'boolean';
            case 'datePicker':
              return 'date';
            case 'dateTimePicker':
              return 'dateTime';
            case 'upload':
            case 'multiUpload':
              return 'attachment';
            default:
              return 'string';
          }
        },
      },
      {
        name: 'label',
        type: 'intl',
        label: intl.get('spfm.configServer.model.field.mallName').d('字段名称'),
        required: true,
      },
      {
        name: '_component',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.fieldWidget').d('组件类型'),
        required: true,
        lookupCode: 'SPFM.RELTABLE._COMPONENT',
      },
      {
        name: 'lov',
        type: 'object',
        label: intl.get('spfm.configServer.model.field.lovCode').d('值集视图Code'),
        disabled: true,
        lovCode: 'SPFM.REL_TABLE_LOV_VIEW_VIEW',
      },
      {
        name: 'lovCode',
        type: 'string',
        bind: 'lov.viewCode',
      },
      {
        name: 'lookup',
        type: 'object',
        label: intl.get('spfm.configServer.model.field.lookupCode').d('值集Code'),
        lovCode: 'SPFM.REL_TABLE_IDP_LOV_VIEW',
        disabled: true,
      },
      {
        name: 'lookupCode',
        type: 'string',
        bind: 'lookup.lovLovCode',
      },
      {
        name: 'textField',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.displayField').d('显示字段'),
        disabled: true,
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.valueField').d('数据字段'),
        disabled: true,
      },
      {
        name: 'multiple',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.multiple').d('启用多选'),
        disabled: true,
        computedProps: {
          disabled: ({ record }) =>
            !!record.get('__unique') || !['lov', 'lookup'].includes(record.get('_component')),
        },
      },
      {
        name: 'required',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.required').d('必输'),
        computedProps: {
          disabled: ({ record }) =>
            ['upload', 'multiUpload', 'marmotScript'].includes(record.get('_component')) ||
            record.get('__unique'),
        },
      },
      {
        name: 'disabled',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.disabled').d('禁用'),
        computedProps: {
          disabled: ({ record }) =>
            ['upload', 'multiUpload', 'marmotScript'].includes(record.get('_component')),
        },
      },
      {
        name: '__unique',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.unique').d('校验唯一'),
        computedProps: {
          disabled: ({ record }) =>
            !!record.get('multiple') ||
            ['upload', 'multiUpload', 'marmotScript'].includes(record.get('_component')),
        },
      },
      {
        name: '_conditionField',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.conditionField').d('启用为搜索条件'),
        computedProps: {
          disabled: ({ record }) =>
            ['upload', 'multiUpload', 'marmotScript', 'richText'].includes(
              record.get('_component')
            ),
        },
      },
      {
        name: '__isHidden',
        type: 'boolean',
        label: intl.get('spfm.configServer.model.field.isHidden').d('是否隐藏展示'),
        // computedProps: {
        //   disabled: ({ record }) =>
        //     !!record.get('multiple') ||
        //     ['upload', 'marmotScript'].includes(record.get('_component')),
        // },
      },
      {
        name: 'pattern',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.pattern').d('正则表达式'),
        disabled: true,
      },
      {
        name: 'defaultValue',
        label: intl.get('spfm.configServer.model.field.defaultValue').d('默认值'),
        transformResponse: (value, object) => {
          if (isEmpty(value)) {
            return undefined;
          } else {
            switch (object._component) {
              case 'lov':
                return object.multiple
                  ? JSON.parse(value).map((v, index) => {
                      return {
                        [object.textField]: JSON.parse(object._defaultValueMeaning)[index],
                        [object.valueField]: v,
                      };
                    })
                  : {
                      [object.textField]: object._defaultValueMeaning,
                      [object.valueField]: value,
                    };
              case 'lookup':
                return object.multiple ? JSON.parse(value) : value;
              default:
                return value;
            }
          }
        },
        transformRequest: (value, record) => {
          if (isEmpty(value)) {
            if (typeof value === 'number') {
              return value;
            } else {
              return undefined;
            }
          } else {
            switch (record.get('_component')) {
              case 'lov':
                return record.get('multiple')
                  ? JSON.stringify(value.map((v) => v[record.get('valueField')]))
                  : value[record.get('valueField')];
              case 'lookup':
                return record.get('multiple') ? JSON.stringify(value) : value;
              default:
                return value;
            }
          }
        },
        dynamicProps: ({ record }) => {
          let config = {};
          switch (record.get('_component')) {
            case 'lov':
              config = {
                type: 'object',
                lovCode: record.get('lovCode'),
                disabled: !(
                  record.get('lovCode') &&
                  record.get('textField') &&
                  record.get('valueField')
                ),
                multiple: record.get('multiple'),
              };
              break;
            case 'number':
              config = {
                type: 'number',
                step: 1,
              };
              break;
            case 'lookup':
              config = {
                type: 'string',
                lookupCode: record.get('lookupCode'),
                disabled: !record.get('lookupCode'),
                multiple: record.get('multiple'),
              };
              break;
            case 'codeAreaJavaScript':
            case 'codeAreaJson':
            case 'codeAreaSql':
            case 'textField':
            case 'textArea':
              config = {
                type: 'string',
                disabled: false,
              };
              break;
            case 'checkBox':
              config = {
                type: 'string',
                lookupCode: 'HPFM.FLAG',
                disabled: false,
                trueValue: '1',
                falseValue: '0',
              };
              break;
            default:
              config = {
                type: 'string',
                disabled: true,
              };
              break;
          }
          return config;
        },
      },
      {
        name: '_encryption',
        type: 'string',
        label: intl.get('spfm.configServer.model.field.encryption').d('加密类型'),
      },
      {
        name: 'computedProps',
        type: 'string',
        label: intl
          .get('spfm.relTableDefinition.model.relTableDefinition.computedProps')
          .d('回调代码'),
        transformRequest: (value) => {
          // 加密
          return crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value));
        },
        transformResponse: (value) => {
          return crypto.enc.Utf16.stringify(
            crypto.enc.Base64.parse(value || DEFAULT_COMPUTER_PROPS)
          );
        },
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    events: {
      create: ({ record }) => {
        const value = record.get('_component');
        switch (value) {
          case 'lov': {
            const lovConfig = record.getField('lov');
            lovConfig.set('disabled', false);
            lovConfig.set('required', true);
            const textField = record.getField('textField');
            textField.set('disabled', false);
            textField.set('required', true);
            const valueField = record.getField('valueField');
            valueField.set('disabled', false);
            valueField.set('required', true);
            record.getField('multiple').set('disabled', false);
            break;
          }
          case 'lookup': {
            const lookupCodeConfig = record.getField('lookup');
            lookupCodeConfig.set('disabled', false);
            lookupCodeConfig.set('required', true);
            record.getField('multiple').set('disabled', false);
            break;
          }
          case 'codeAreaJavaScript':
          case 'codeAreaJson':
          case 'codeAreaSql':
          case 'textField':
          case 'textArea':
          case 'number': {
            const patternConfig = record.getField('pattern');
            patternConfig.set('disabled', false);
            break;
          }
          default:
            break;
        }
      },
      update: ({ record, name, value }) => {
        if (name === '_component') {
          resetAllField(record);
          switch (value) {
            case 'lov': {
              const lovConfig = record.getField('lov');
              lovConfig.set('disabled', false);
              lovConfig.set('required', true);
              const textField = record.getField('textField');
              textField.set('disabled', false);
              textField.set('required', true);
              const valueField = record.getField('valueField');
              valueField.set('disabled', false);
              valueField.set('required', true);
              record.getField('multiple').set('disabled', false);
              break;
            }
            case 'lookup': {
              const lookupCodeConfig = record.getField('lookup');
              lookupCodeConfig.set('disabled', false);
              lookupCodeConfig.set('required', true);
              record.getField('multiple').set('disabled', false);
              break;
            }
            case 'codeAreaJavaScript':
            case 'codeAreaJson':
            case 'codeAreaSql':
            case 'textField':
            case 'textArea':
            case 'number': {
              const patternConfig = record.getField('pattern');
              patternConfig.set('disabled', false);
              break;
            }
            default:
              break;
          }
        }
        // 校验唯一勾选的情况下，该条件必输
        if (name === '__unique') {
          if (value) {
            record.set('required', true);
          }
        }
      },
    },
  };
}
