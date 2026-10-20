/**
 * 字段信息DS
 */
// import sortBy from 'lodash/sortBy';
import { HZERO_HMDE } from '@/utils/config';
import { upperFirst } from 'lodash';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { Record } from 'choerodon-ui/dataset';

export default function(id): DataSetProps {
  return {
    autoQuery: false,
    paging: true,
    pageSize: 20,
    fields: [
      {
        name: 'fieldName',
        type: 'string' as FieldType,
        label: '字段名称',
        required: true,
        // @ts-ignore
        validator: (value, _, record) => {
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          let valueArr: any[] = [];
          if (!patternA.test(value) || value.toString().length > 30) {
            return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
          }
          if (record instanceof Record && record?.dataSet) {
            valueArr = (record.dataSet || []).filter(
              ele =>
                ele.get('fieldName') && ele.get('fieldName').toLowerCase() === value.toLowerCase()
            );
          }
          return valueArr.length === 1 ? true : '字段名不能重复!';
        },
      },
      { name: 'displayName', type: 'string' as FieldType, label: '显示名称', required: true },
      { name: 'code', type: 'string' as FieldType, label: '字段编码' },
      {
        name: 'dataType',
        type: 'string' as FieldType,
        label: '数据类型',
        required: true,
        transformRequest: val => upperFirst(val),
      },
      {
        name: 'description',
        type: 'string' as FieldType,
        label: '字段说明',
      },
      { name: 'dataSize', type: 'string' as FieldType, label: '最大长度', min: 1, required: true },
      {
        name: 'requiredFlag',
        type: 'boolean' as FieldType,
        label: '是否必输',
        trueValue: 1,
        falseValue: 0,
        // required: true,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => record.get('primaryFlag'),
        },
      },
      {
        name: 'primaryFlag',
        type: 'boolean' as FieldType,
        label: '是否主键',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'fieldType',
        type: 'string' as FieldType,
        defaultValue: 'API_FIELD',
      },
      {
        name: 'encryptFlag',
        type: 'boolean' as FieldType,
        label: '是否加密',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        help: '同Hzero主键加密策略，将数字类型的字段进行加密并转化为字符串类型字段',
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${id}/page?fieldType=API_FIELD`,
        method: 'get',
        transformResponse: data => {
          let parseData = JSON.parse(data);
          const { content } = parseData;
          parseData = content?.map?.(item => {
            if (item.fieldType) {
              let fieldTypeMeaning;
              switch (item.fieldType) {
                case 'VIRTUAL_FIELD':
                  fieldTypeMeaning = '虚拟字段';
                  break;
                case 'REDUNDANT_FIELD':
                  fieldTypeMeaning = '扩展字段';
                  break;
                case 'TABLE_FIELD':
                  fieldTypeMeaning = '模型字段';
                  break;
                case 'API_FIELD':
                  fieldTypeMeaning = 'API模型字段';
                  break;
                default:
                  break;
              }
              return { ...item, fieldTypeMeaning };
            }
            return item;
          });
          return { ...parseData, content };
        },
      },
      destroy: ({ data }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${id}/batch-delete`,
        method: 'delete',
        data,
      }),
      submit: ({ data }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${id}/batch-update`,
        method: 'post',
        data,
      }),
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(ele => {
          if (
            ele.get('primaryFlag') ||
            isPresetField(ele.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']])
          ) {
            Object.assign(ele, { selectable: false });
          }
        });
      },
      update: ({ name, value, record, dataSet }) => {
        if (name === 'primaryFlag' && value) {
          let changeNum = 0;
          dataSet.forEach(item => {
            if (item.get('primaryFlag')) {
              changeNum++;
            }
          });
          // 判断是否是用户点击了其他行
          if (changeNum !== 1) {
            dataSet.forEach(item => {
              if (item.get('primaryFlag')) {
                item.set('typeDisabled', false);
                item.set('defaultValueDisabled', false);
                item.set('primaryFlag', 0);
              }
            });
            record.set('primaryFlag', 1);
          }
          record.set('requiredFlag', 1);
        }
      },
    },
  };
}
