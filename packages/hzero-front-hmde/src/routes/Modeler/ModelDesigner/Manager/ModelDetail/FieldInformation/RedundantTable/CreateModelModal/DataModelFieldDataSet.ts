import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { upperFirst } from 'lodash';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';
import uuidv4hyphenless from '@/utils/uuidv4hyphenless';

/**
 * @param submitFn 独享模式下保存需过滤和模型主键字段相同的字段
 */
export default function (postId, selection = 'multiple', submitFn = () => true) {
  return {
    autoQuery: false,
    paging: false,
    selection,
    fields: [
      {
        name: 'displayName',
        type: 'string',
        label: '显示名称',
        required: true,
      },
      {
        name: 'fieldName',
        type: 'string',
        label: '字段名称',
      },
      {
        // 新加
        name: 'fieldType',
        type: 'string',
        label: '字段类型',
        required: true,
      },
      {
        name: 'dataType',
        type: 'string',
        label: '数据类型',
        required: true,
        transformRequest: (val) => upperFirst(val),
      },
      {
        name: 'description',
        type: 'string',
        label: '字段说明',
      },
      {
        name: 'encryptFlag',
        type: 'boolean',
        label: '是否加密',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        help: '同Hzero主键加密策略，将数字类型的字段进行加密并转化为字符串类型字段',
      },
      {
        name: 'valueList',
        type: 'object',
        label: '值集名称',
        ignore: 'always',
        lovCode: 'HPFM.LOV.LOV_DETAIL.ORG',
        valueField: 'lovCode',
        textField: 'lovName',
        dynamicProps: {
          lovQueryAxiosConfig: function lovQueryAxiosConfig() {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HPFM,
              })}/lov-headers?enabledFlag=1`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'valueListCode',
        type: 'string',
        bind: 'valueList.lovCode',
      },
      {
        name: 'valueListName',
        type: 'string',
        ignore: 'always',
        bind: 'valueList.lovName',
      },
      {
        name: 'encodingRule',
        type: 'object',
        label: '编码规则',
        ignore: 'always',
        lovCode: isTenantRoleLevel() ? 'HMDE.CODE_RULE' : 'HMDE.CODE_RULE.SITE',
        valueField: 'ruleCode',
        textField: 'ruleName',
        dynamicProps: {
          lovQueryAxiosConfig: function lovQueryAxiosConfig() {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HPFM,
              })}/code-rule?&tenantId=${getCurrentOrganizationId()}`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'ruleCode',
        type: 'string',
        bind: 'encodingRule.ruleCode',
      },
      {
        name: 'ruleName',
        type: 'string',
        bind: 'encodingRule.ruleName',
      },
      // 新增
      {
        name: 'dataSize',
        type: 'number',
        label: '最大长度',
        dynamicProps: ({ record }) => ({
          max: record.get('physicalFieldDataSize'),
        }),
      },
      { name: 'defaultValue', type: 'string', label: '默认值' },
      {
        name: 'requiredFlag',
        type: 'boolean',
        label: '是否必输',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${postId}/list?fieldType=REDUNDANT_FIELD`,
        method: 'get',
        // 默认添加的都是表字段 有其他字段时需要再进行过滤
        transformResponse: (data) => {
          const parsedata = JSON.parse(data);
          // parsedata = parsedata.map((item) => ({
          //   ...item,
          //   fieldName: item.fieldName && capitalToHump(item.fieldName),
          // }));
          return parsedata;
        },
      },
      submit: ({ data }) => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/model-fields/${postId}/batch-update`,
          method: 'post',
          data: transformPayloadData(data.filter(submitFn)),
        };
      },
    },
    events: {
      create: ({ record }) => {
        if (
          record.get('primaryFlag') ||
          isPresetField(record.get('fieldName'), ['redNameList']) ||
          isPresetField(record.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']])
        ) {
          Object.assign(record, { selectable: false });
        }
      },
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (
            record.get('primaryFlag') ||
            isPresetField(record.get('fieldName'), ['redNameList']) ||
            isPresetField(record.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']])
          ) {
            Object.assign(record, { selectable: false });
          }
        });
      },
    },
    data: [],
  } as DataSetProps;
}

function transformPayloadData(data: any[]) {
  return data.map((item) => {
    return {
      ...item,
      refTableId: item.metaTableId,
      metaTableId: undefined,
      physicalFieldCode: item.physicalFieldCode ? item.physicalFieldCode : item.code,
      // code: (item.code && item.code === item.physicalFieldCode) ? uuidv4hyphenless() : item.code,
      code: uuidv4hyphenless(),
      // physicalFieldCode: item.code,
      // code: undefined,
      // physicalFieldDecimalDigits: item.decimalDigits,
      // decimalDigits: undefined,
      // physicalFieldJdbcType: item.jdbcType,
      // jdbcType: undefined,
    };
  });
}
