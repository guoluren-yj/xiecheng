// import sortBy from 'lodash/sortBy';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { upperFirst } from 'lodash';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import { lowcodeOrganizationURL } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';

export default function (
  postId,
  selection = 'multiple',
  resourceUponRoleHierarchy,
  extendsParentCode
) {
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
              url: `${lowcodeOrganizationURL({ route: HZERO_HPFM })}/lov-headers?enabledFlag=1`,
              method: 'GET',
            };
          },
        },
      },
      {
        name: 'valueListCode',
        type: 'string',
        // label: '值集编码或值集视图编码',
        bind: 'valueList.lovCode',
      },
      {
        name: 'valueListName',
        type: 'string',
        ignore: 'always',
        // label: '值集编码或值集视图编码',
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
          min: 1,
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
      {
        name: 'subCanEditFlag',
        type: 'boolean',
        label: '是否允许租户编辑',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: (args) => {
        const modelId = args.dataSet!.getState('modelId');
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/model-fields/${modelId}/list`,
          method: 'get',
          // 默认添加的都是表字段 有其他字段时需要再进行过滤
          transformResponse: (data) => {
            const parseData = JSON.parse(data);

            return parseData;
          },
        };
      },
      submit: ({ data, dataSet }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/model-fields/${dataSet!.getState('modelId')}/batch-update`,
        method: 'post',
        data,
      }),
    },
    events: {
      create: ({ record }) => {
        if (
          record.get('primaryFlag') ||
          isPresetField(record.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']])
        ) {
          Object.assign(record, { selectable: false });
        }
      },
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          // 继承模式下添加模型字段弹窗，第二步右边，如果字段是主键或者who字段或者 parentFieldFlag === 1 则不能删除到左边
          if (
            record.get('primaryFlag') ||
            isPresetField(record.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']]) ||
            (extendsParentCode &&
              resourceUponRoleHierarchy === 'tenant' &&
              record.get('parentFieldFlag'))
            // record.get('fieldName') === 'TENANT_ID'
          ) {
            Object.assign(record, { selectable: false });
          }
        });
      },
    },
    data: [],
  } as DataSetProps;
}
