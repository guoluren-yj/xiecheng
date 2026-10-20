import { upperFirst } from 'lodash';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HPFM } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';

import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

// const whoNameList = [
//   'LAST_UPDATE_DATE',
//   'LAST_UPDATED_BY',
//   'CREATION_DATE',
//   'CREATED_BY',
//   'OBJECT_VERSION_NUMBER',
//   'TENANT_ID',
// ];
// const redNameList = ['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'];

export default function (selection: string = 'multiple', resourceUponRoleHierarchy?: string) {
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
        name: 'dataType',
        type: 'string',
        label: '数据类型',
        required: true,
        transformRequest: (val) => upperFirst(val),
      },
      {
        // 新加
        name: 'fieldType',
        type: 'string',
        label: '字段类型',
        required: true,
        // defaultValue: 'TABLE_FIELD',
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
        bind: 'valueList.lovCode',
      },
      {
        name: 'valueListName',
        type: 'string',
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
    events: {
      create: ({ record, dataSet }) => {
        if (
          record.get('primaryFlag') ||
          isPresetField(record.get('fieldName'), ['others', ['OBJECT_VERSION_NUMBER']]) ||
          (dataSet.getState('extendsParentCode') &&
            resourceUponRoleHierarchy === 'tenant' &&
            record.get('parentFieldFlag'))
          // subCanAddFlag: 标记是否租户可以编辑 parentFieldFlag: 标记继承是否是父模型有的字段。此逻辑为如果是继承，父模型下面设置为可自定义的可以移动到穿梭框左边。
        ) {
          Object.assign(record, { selectable: false });
        }
      },
      // load: ({ dataSet }) => {
      //   dataSet.forEach(record => {
      //     if (
      //       record.get('primaryFlag') ||
      //       record.get('fieldName') === 'OBJECT_VERSION_NUMBER'
      //       // record.get('fieldName') === 'TENANT_ID'
      //     ) {
      //       Object.assign(record, { selectable: false });
      //     }
      //   });
      // },
    },
    data: [],
  } as DataSetProps;
}
