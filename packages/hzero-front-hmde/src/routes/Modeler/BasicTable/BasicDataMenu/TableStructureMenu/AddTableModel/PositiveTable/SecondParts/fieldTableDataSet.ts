/**
 * 逻辑模型详情页上方 逻辑模型详情信息
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { KEY_WORLDS } from '@/utils/config';
import {
  MySqlDataTypeCascade,
  OracleDataTypeCascade,
} from '@/routes/Modeler/ModelDesigner/utils/dataTypeCascade';

export default (dataSourceType) =>
  ({
    primaryKey: 'name',
    selection: 'multiple',
    paging: false,
    fields: [
      {
        name: 'name',
        label: '字段名称',
        type: 'string',
        required: true,
        unique: true,
        validator: (value, nu, record: Record) => {
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          // 校验方法
          if (record.get('name')) {
            // 校验方法
            if (!patternA.test(value) || value.toString().length > 30) {
              return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
            }
            if (KEY_WORLDS.includes(record.get('name') && record.get('name').toUpperCase())) {
              return '字段名称与关键字名称冲突';
            }
            let valueArr: Record[] = [];
            if (record.dataSet) {
              valueArr = (record.dataSet || []).filter(
                (ele) => ele?.get('name')?.toLowerCase?.() === value?.toLowerCase()
              );
            }
            return valueArr.length === 1 ? true : '字段不能重复';
          }
        },
      },
      {
        name: 'type',
        label: '数据类型',
        type: 'string',
        required: true,
      },
      {
        name: 'description',
        label: '字段说明',
        type: 'string',
        required: true,
      },
      {
        name: 'dataSize',
        label: '最大长度',
        type: 'number',
        step: 1,
        dynamicProps: {
          required: ({ record }) =>
            ((record.get('typeCascade') || {}).dataSize || {}).type === 'edit',
          max: ({ record }) => ((record.get('typeCascade') || {}).dataSize || {}).max,
          min: ({ record }) => ((record.get('typeCascade') || {}).dataSize || {}).min,
        },
      },
      {
        name: 'decimalDigits',
        type: 'number',
        label: '小数位数',
        step: 1,
        dynamicProps: {
          required: ({ record }) =>
            ((record.get('typeCascade') || {}).decimalDigits || {}).required,
          min: ({ record }) => ((record.get('typeCascade') || {}).decimalDigits || {}).min,
          max: ({ record }) => {
            return dataSourceType === 'Oracle'
              ? ((record.get('typeCascade') || {}).decimalDigits || {}).max
              : record.get('dataSize');
          },
        },
      },
      {
        name: 'defaultValue',
        label: '默认值',
        type: 'string',
        dynamicProps: {
          max: ({ record }) => {
            const dataSize = Number(record.get('dataSize') || 0);
            const _max = ((record.get('typeCascade') || {}).defaultValue || {}).max;
            return _max || 10 ** dataSize - 1;
          },
          min: ({ record }) => ((record.get('typeCascade') || {}).defaultValue || {}).min,
        },
      },
      {
        name: 'requiredFlag',
        label: '是否必输',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'primaryFlag',
        label: '主键',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
    events: {
      update: ({ record, name, value, dataSet }) => {
        if (name === 'dataSize') {
          record.set('defaultValue', null);
        }
        if (name === 'decimalDigits') {
          record.set('defaultValue', null);
        }
        if (name === 'type' && value) {
          // 顺序很重要
          const typeCascade =
            dataSourceType !== 'Oracle'
              ? MySqlDataTypeCascade(value)
              : OracleDataTypeCascade(value);
          record.set('typeCascade', typeCascade);
          record.set('dataSize', typeCascade.dataSize.defaultValue);
          record.set('decimalDigits', typeCascade.decimalDigits.defaultValue);
          record.set('defaultValue', typeCascade.defaultValue.defaultValue || null);
        }
        if (name === 'primaryFlag' && value === 0) {
          record.set('typeDisabled', false);
          record.set('defaultValueDisabled', false);
        } // 取消主键时默认值等允许输入
        if (name === 'primaryFlag' && value) {
          let changeNum = 0;
          dataSet.forEach((item) => {
            if (item.get('primaryFlag')) {
              changeNum++;
            }
          });
          // 判断是否是用户点击了其他行
          if (changeNum !== 1) {
            dataSet.forEach((item) => {
              if (item.get('primaryFlag')) {
                item.set('typeDisabled', false);
                item.set('defaultValueDisabled', false);
                item.set('primaryFlag', 0);
              }
            });
            record.set('primaryFlag', 1);
          }
          record.set('type', dataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER'); // 选中类型未Int
          record.set('defaultValue', null); // 清空默认值
          record.set('typeDisabled', true);
          record.set('defaultValueDisabled', true);
          record.set('requiredFlag', 1);
          if (dataSourceType === 'Oracle') {
            record.set('dataSize', 19); // 清空默认值
            record.set('decimalDigits', 0); // 清空默认值
          }
        }
      },
    },
  } as DataSetProps);
