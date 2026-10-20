/**
 * 模型详情页上方 模型详情信息
 */
import { HZERO_HMDE } from '@/utils/config';
import { KEY_WORLDS } from '@/routes/Modeler/ModelDesigner/utils/config';
import { checkRedundantFieldName } from '@/services/modelListService';
import { lowcodeOrganizationURL } from '@/utils/common';
import {
  MySqlDataTypeCascade,
  OracleDataTypeCascade,
} from '@/routes/Modeler/ModelDesigner/utils/dataTypeCascade';

// who字段和扩展字段名称集合
const nameList = [
  'REDUNDANT_ID',
  'REDUNDANT_RELATION_TABLE',
  'REDUNDANT_RELATION_KEY',
  'LAST_UPDATE_DATE',
  'LAST_UPDATED_BY',
  'CREATION_DATE',
  'CREATED_BY',
  'OBJECT_VERSION_NUMBER',
];

export default (tableId, modelId, step, secondCreated, refDataSourceType) => {
  return {
    paging: false,
    autoCreate: false,
    autoQueryAfterSubmit: false,
    primaryKey: 'name',
    selection: 'multiple',
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/tables/${tableId}/columns`,
        method: 'get',
        dataKey: null,
        transformResponse: (data) => {
          if (!data) return null;
          try {
            const originData = JSON.parse(data).map((item) => {
              if (nameList.includes(item.name)) {
                Object.assign(item, { keyword: true }); // 如果有关键字 设置keyword: true
              }
              if (item.defaultValue === "b'1'") {
                Object.assign(item, { defaultValue: 1 });
              }
              if (item.defaultValue === "b'0'") {
                Object.assign(item, { defaultValue: 0 });
              }
              return item;
            });
            return originData;
          } catch (e) {
            return null;
          }
        },
      },
      destroy: ({ data = [] }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/table-columns/positive/batch-delete`,
        method: 'delete',
        data,
      }),
    },
    fields: [
      {
        name: 'name',
        label: '字段名称',
        type: 'string',
        required: true,
        unique: true,
        validator: async (value, nu, record) => {
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          // 校验方法
          if (record.get('name')) {
            if (!patternA.test(value) || value.toString().length > 30) {
              return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
            }
            if (KEY_WORLDS.includes(record.get('name') && record.get('name').toUpperCase())) {
              return '字段名称与关键字名称冲突';
            }
            let valueArr = [];
            if (record.dataSet) {
              valueArr = (record.dataSet || []).filter(
                (ele) => ele?.get('name')?.toLowerCase?.() === value?.toLowerCase()
              );
            }
            return valueArr.length === 1 ? true : '字段不能重复';
          }
          if (!nameList.includes(record.get('name')) && modelId && step === 1) {
            const res = await checkRedundantFieldName({ modelId, fieldName: record.get('name') });
            if (res && res.message) {
              return res.message;
            }
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
        type: 'Number',
        step: 1,
        dynamicProps: {
          required: ({ record }) =>
            ((record.get('typeCascade') || {}).dataSize || {}).type === 'edit' &&
            record.get('disabled') !== 1,
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
            return refDataSourceType === 'Oracle'
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
      update: (args) => {
        const { record, name, value, dataSet } = args;
        if (name === 'name') {
          if (['TENANT_ID'].includes(value)) {
            record.set('dataSize', 19);
          } else {
            record.set('dataSize', null);
          }
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
          record.set('type', 'BIGINT'); // 选中类型未Int
          record.set('defaultValue', null); // 清空默认值
          record.set('typeDisabled', true);
          record.set('defaultValueDisabled', true);
          record.set('requiredFlag', 1);
        }
        record.set('metaTableId', tableId);
      },
      load: ({ dataSet }) => {
        // 数据加载完成之后的回调
        secondCreated.forEach((item) => {
          // 添加上缓存数据
          dataSet.create(item, 0);
        });
        dataSet.forEach((ele) => {
          const typeCascade =
            refDataSourceType !== 'Oracle'
              ? MySqlDataTypeCascade(ele.get('type'))
              : OracleDataTypeCascade(ele.get('type'));
          ele.set('typeCascade', typeCascade);
          if (ele.get('primaryFlag') === 1 || nameList.includes(ele.get('name'))) {
            Object.assign(ele, { selectable: false });
          }
        });
      },
    },
  };
};
