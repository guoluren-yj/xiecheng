import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { HZERO_HMDE, KEY_WORLDS } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import {
  MySqlDataTypeCascade,
  OracleDataTypeCascade,
} from '@/routes/Modeler/ModelDesigner/utils/dataTypeCascade';

// 定义数据库关键字
const redNameList = ['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY']; // 扩展字段
const whoNameList = [
  'LAST_UPDATE_DATE',
  'LAST_UPDATED_BY',
  'CREATION_DATE',
  'CREATED_BY',
  'OBJECT_VERSION_NUMBER',
  // 'TENANT_ID', // 租户ID
]; // who字段

export default (tableId, refDataSourceType) =>
  ({
    primaryKey: 'id',
    autoQuery: false,
    // selection: false,
    paging: false,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables/${tableId}/columns`,
        method: 'get',
        dataKey: null,
        transformResponse: (data) => {
          if (!data) return null;
          try {
            const originData = JSON.parse(data).map((item) => {
              // eslint-disable-next-line prefer-destructuring
              let defaultValue = item.defaultValue;
              if (item.defaultValue === "b'1'") {
                defaultValue = 1;
              }
              if (item.defaultValue === "b'0'") {
                defaultValue = 0;
              }
              return {
                ...item,
                defaultValue,
              };
            });
            return originData;
          } catch (e) {
            return null;
          }
        },
      },
      submit: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/table-columns/positive/batch-update`,
        method: 'post',
        data: data.map((item) => ({ ...item, metaTableId: tableId })),
      }),
      destroy: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/table-columns/positive/batch-delete`,
        method: 'delete',
        data,
      }),
    },
    events: {
      update: ({ record, name, value, dataSet }) => {
        if (name === 'name') {
          if (['TENANT_ID'].includes(value)) {
            record.set('dataSize', 19);
          } else {
            record.set('dataSize', null);
          }
        }
        if (name === 'dataSize') {
          record.set('defaultValue', null);
        }
        if (name === 'decimalDigits') {
          record.set('defaultValue', null);
        }
        if (name === 'type' && value) {
          // 顺序很重要
          const typeCascade =
            refDataSourceType !== 'Oracle'
              ? MySqlDataTypeCascade(value)
              : OracleDataTypeCascade(value);
          if (!refDataSourceType) return;
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
          record.set('type', refDataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER'); // 选中类型未Int
          record.set('defaultValue', null); // 清空默认值
          record.set('typeDisabled', true);
          record.set('defaultValueDisabled', true);
          record.set('requiredFlag', 1);
          if (refDataSourceType === 'Oracle') {
            record.set('dataSize', 19); // 清空默认值
            record.set('decimalDigits', 0); // 清空默认值
          }
        }
      },
      load: ({ dataSet }) => {
        dataSet.forEach((ele) => {
          if (
            ele.get('primaryFlag') ||
            redNameList.includes(ele.get('name')) ||
            whoNameList.includes(ele.get('name'))
          ) {
            Object.assign(ele, { selectable: false });
          }
        });
      },
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: '字段名称',
        required: true,
        unique: true,
        validator: (value, nu, record: Record) => {
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          // 校验方法
          if (record.get('name')) {
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
        type: 'string',
        label: '数据类型',
        required: true,
      },
      { name: 'description', type: 'string', label: '字段说明', required: true },
      {
        name: 'dataSize',
        label: '最大长度',
        type: 'number',
        step: 1,
        dynamicProps: {
          max: ({ record }) => ((record.get('typeCascade') || {}).dataSize || {}).max,
          min: ({ record }) => ((record.get('typeCascade') || {}).dataSize || {}).min,
          required: ({ record }) =>
            ((record.get('typeCascade') || {}).dataSize || {}).type === 'edit',
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
            return refDataSourceType === 'Oracle'
              ? ((record.get('typeCascade') || {}).decimalDigits || {}).max
              : record.get('dataSize');
          },
        },
      },
      {
        name: 'defaultValue',
        type: 'string',
        label: '默认值',
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
        type: 'boolean',
        label: '是否必输',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'primaryFlag',
        type: 'boolean',
        label: '主键',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
  } as DataSetProps);
