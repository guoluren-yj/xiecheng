/**
 * 字段信息DS
 */
// import sortBy from 'lodash/sortBy';
import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { upperFirst } from 'lodash';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';

// const whoNameList = ['OBJECT_VERSION_NUMBER'];

export default function (id, handleMenuQueryList) {
  return {
    autoQuery: false,
    paging: true,
    pageSize: 20,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${id}/page?fieldType=REDUNDANT_FIELD`,
        method: 'get',
        transformResponse: (data) => {
          const parseData = JSON.parse(data);
          const content = parseData?.content?.map?.((item) => {
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
    fields: [
      { name: 'displayName', type: 'string', label: '显示名称' },
      { name: 'fieldName', type: 'string', label: '字段名称', defaultValue: 'ID' },
      { name: 'code', type: 'string', label: '字段编码' },
      {
        name: 'dataType',
        type: 'string',
        label: '数据类型',
        transformRequest: (val) => upperFirst(val),
      },
      {
        name: 'description',
        type: 'string',
        label: '字段说明',
      },
      {
        name: 'fieldType',
        type: 'string',
        label: '字段类型',
        required: true,
      },
      { name: 'dataSize', type: 'string', label: '最大长度', defaultValue: '200' },
      { name: 'defaultValue', type: 'string', label: '默认值' },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: '是否必输',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'ruleName',
        type: 'string',
        label: '编码规则',
      },
      {
        name: 'valueListName',
        type: 'object',
        label: '值集名称',
        ignore: 'always',
        lovCode: 'HPFM.LOV.LOV_DETAIL.ORG',
        valueField: 'lovCode',
        textField: 'lovName',
        lovQueryAxiosConfig: function lovQueryAxiosConfig() {
          return {
            url: `${lowcodeOrganizationURL({
              route: HZERO_HPFM,
            })}/lov-headers?enabledFlag=1`,
            method: 'GET',
          };
        },
      },
      // {
      //   name: 'valueListCode',
      //   type: 'string',
      //   // label: '值集编码或值集视图编码',
      //   bind: 'valueList.lovCode',
      // },
      {
        name: 'encryptFlag',
        type: 'boolean',
        label: '是否加密',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        help: '同Hzero主键加密策略，将数字类型的字段进行加密并转化为字符串类型字段',
      },
    ],
    events: {
      submitSuccess: () => {
        handleMenuQueryList();
      },
      load: ({ dataSet }) => {
        dataSet.forEach((ele) => {
          if (
            ele.get('primaryFlag') ||
            isPresetField(ele.get('fieldName'), [
              'others',
              ['REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'],
            ])
          ) {
            Object.assign(ele, { selectable: false });
          }
        });
      },
    },
  };
}
