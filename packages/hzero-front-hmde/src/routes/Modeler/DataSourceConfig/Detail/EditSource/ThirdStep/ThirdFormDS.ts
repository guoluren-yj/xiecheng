/*
 * @filename:
 * @Date: 2020-05-27 19:09:25
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { DataSet } from 'choerodon-ui/pro';

import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { KEY_WORLDS } from '@/utils/config.js';

const canEditList = ['Float', 'Double', 'BigDecimal'];

export default (sourceFieldsList) =>
  ({
    autoQuery: false,
    paging: false,
    primaryKey: 'aliasName',
    autoLocateFirst: false,
    autoLocateAfterCreate: false,
    fields: [
      { name: 'displayName', type: 'string', label: '显示名称', required: true },
      {
        name: 'aliasName',
        type: 'string',
        label: '字段名称',
        required: true,
        validator: async (value, nu, record: Record) => {
          let valueArr: Record[] = [];
          if (record.dataSet) {
            valueArr = record.dataSet.filter(
              (ele) =>
                ele.get('aliasName') && ele.get('aliasName').toLowerCase() === value.toLowerCase()
            );
          }
          if (valueArr.length > 1) {
            return '名称不能重复!';
          }
          if (sourceFieldsList.includes(value.toLowerCase())) {
            return '虚拟字段名称与数据对象字段名称重复';
          }
          if (KEY_WORLDS.includes(record.get('aliasName')?.toUpperCase())) {
            return '字段名称与关键字名称冲突';
          }
          // 校验方法
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          if (!patternA.test(value) || value.toString().length > 30) {
            return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
          }
        },
      },
      { name: 'description', type: 'string', label: '字段说明' },
      {
        name: 'virtualFieldType',
        type: 'string',
        label: '字段类型',
        // lookupCode: 'HMDE.VIRTUAL_FIELD_TYPE',
        valueField: 'value',
        defaultValue: 'NORMAL',
        help: '目前行统计仅支持头行结构中行上的列聚合，暂不支持头聚合',
        dynamicProps: ({ record }) => {
          let _virtualFieldTypeList = [
            {
              meaning: '普通型',
              value: 'NORMAL',
            },
            {
              meaning: '行统计',
              value: 'ROW_AGGREGATION',
            },
          ];
          if (['Boolean', 'LocalDate', 'ZonedDateTime'].includes(record.get('dataType'))) {
            _virtualFieldTypeList = _virtualFieldTypeList.filter((item) => item.value === 'NORMAL');
          }
          return {
            options: new DataSet({ data: _virtualFieldTypeList }),
          };
        },
      },
      { name: 'formulaContent', type: 'string', label: '条件表达式', required: true },
      { name: 'fieldType', type: 'string', defaultValue: 'VIRTUAL_FIELD' },
      { name: 'dataType', type: 'string', label: '数据类型', required: true },
      {
        name: 'dataSize',
        type: 'string',
        label: '最大长度',
        required: false,
        // dynamicProps: ({ record }) => ({
        //   max: record.get('physicalFieldDataSize'),
        // }),
      },
      {
        name: 'decimalDigits',
        type: 'number',
        label: '小数位数',
        step: 1,
        max: 'dataSize',
        min: 0,
        dynamicProps: {
          required: ({ record }) =>
            ((record.get('typeCascade') || {}).decimalDigits || {}).required,
        },
      },
      // 字段的唯一值 用于过滤条件选中回显
      { name: 'leftFieldUniqueKey', type: 'string' },
      { name: 'rightFieldUniqueKey', type: 'string' },
      { name: 'fieldCode', type: 'string' },
      { name: 'modelFieldCode', type: 'string' },
    ],
    events: {
      update: ({ record, name, value }) => {
        record.set(name, value);
        if (name === 'dataType' && value) {
          // 顺序很重要
          if (value === 'Long') {
            record.getField('dataSize').set('required', true);
            record.getField('decimalDigits').set('required', false);
            record.set('decimalDigits', 0);
          } else if (!canEditList.includes(value)) {
            record.getField('dataSize').set('required', false);
            record.getField('decimalDigits').set('required', false);
            record.set('dataSize', null);
            record.set('decimalDigits', null);
            if (['LocalDate', 'ZonedDateTime', 'Boolean'].includes(value)) {
              record.set('virtualFieldType', 'NORMAL');
            }
          } else {
            record.getField('dataSize').set('required', true);
            record.getField('decimalDigits').set('required', true);
            record.set('decimalDigits', 0);
          }
        }
      },
    },
  } as DataSetProps);
