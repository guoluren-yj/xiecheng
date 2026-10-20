/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import type { AxiosRequestConfig } from 'axios';

import intl from 'utils/intl';

const tableDS: () => DataSetProps = () => ({
  primaryKey: 'id',
  autoQuery: false,
  selection: false,
  queryFields: [
    {
      name: 'code',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.code').d('特性/返回值分类编码'),
    },
    {
      name: 'description',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.description').d('特性/返回值分类描述'),
    },
    {
      name: 'valueField',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.valueField').d('值字段名'),
    },
    {
      name: 'uniqueValueField',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.uniqueValueField').d('唯一性值字段名'),
    },
  ],
  fields: [
    {
      name: 'code',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.code').d('特性/返回值分类编码'),
      required: true,
    },
    {
      name: 'description',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.description').d('特性/返回值分类描述'),
      required: true,
    },
    {
      name: 'valueField',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.valueField').d('值字段名'),
      required: true,
      help: intl.get('spfm.ruleImportSetting.model.view.valueFieldHelp').d('业务规则定义特性和返回值的存储字段名'),
    },
    {
      name: 'uniqueValueField',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.uniqueValueField').d('唯一性值字段名'),
      required: true,
      help: intl
        .get('spfm.ruleImportSetting.model.view.uniqueValueFieldHelp')
        .d('业务规则定义特性和返回值在所有环境值一致的字段名，一般为编码'),
    },
    {
      name: 'convertSql',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.convertSql').d('转换sql'),
      required: true,
      help: intl
        .get('spfm.ruleImportSetting.model.view.convertSqlHelp')
        .d('值字段名和唯一性值字段名的查询SQL'),
    },
    {
      name: 'condition',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.condition').d('关联特性清单'),
      help: intl
        .get('spfm.ruleImportSetting.model.view.conditionHelp')
        .d('使用该转换SQL的所有特性清单'),
    },
    {
      name: 'execution',
      type: FieldType.string,
      label: intl.get('spfm.ruleImportSetting.model.view.execution').d('关联执行规则'),
      help: intl
        .get('spfm.ruleImportSetting.model.view.executionHelp')
        .d('使用该转换SQL的所有执行规则'),
    },
    {
      name: 'option',
      type: FieldType.string,
      label: intl.get('hzero.common.view.sstaHandle').d('操作'),
    },
  ],
  transport: {
    read: ({ data, params }): AxiosRequestConfig => {
      return {
        url: `/spfm/v1/cnf-auto-convert`,
        method: 'GET',
        data: { ...data, ...params },
      };
    },
    submit: ({ data }): AxiosRequestConfig => {
      console.log(data);
      return {
        url: `/spfm/v1/cnf-auto-convert`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ data = [] }): AxiosRequestConfig => {
      return {
        url: `/spfm/v1/cnf-auto-convert`,
        method: 'POST',
        data: data.map((ele) => ({ ...ele, _status: 'delete' }))[0],
      };
    },
  },
});

const relationListDS: (relationType: string) => DataSetProps = (relationType) => ({
  primaryKey: 'id',
  autoQuery: false,
  selection: DataSetSelection.multiple,
  fields: [
    {
      name: 'serverCode',
      type: FieldType.object,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.fullPathCode').d('服务编码'),
      required: true,
      lovCode: 'SPFM_CNF_CNF_METADEFINITION',
      transformRequest: (value) => value?.serverCode,
      transformResponse: (value, object) => {
        return value
          ? {
              serverCode: value,
              relationCode: object.relationCode,
            }
          : null;
      },
      lovPara: {
        relationType,
      },
    },
    // {
    //   name: 'serveName',
    //   type: FieldType.string,
    //   label: '服务名称',
    //   required: true,
    // },
    {
      name: 'relationType',
    },
    {
      name: 'relationCode',
      bind: 'serverCode.relationCode',
      type: FieldType.string,
      label:
        relationType === '0'
          ? intl.get('spfm.ruleImportSetting.model.view.conditionCode').d('特性编码')
          : intl.get('spfm.ruleImportSetting.model.view.executionCodeRet').d('执行规则编码'),
      required: true,
    },
    // {
    //   name: 'relationName',
    //   type: FieldType.string,
    //   label: '特性名称',
    //   required: true,
    // },
  ],
  queryFields: [
    {
      name: 'serverCode',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.fullPathCode').d('服务编码'),
    },
    {
      name: 'relationCode',
      type: FieldType.string,
      label:
        relationType === '0'
          ? intl.get('spfm.ruleImportSetting.model.view.conditionCode').d('特性编码')
          : intl.get('spfm.ruleImportSetting.model.view.executionCodeRet').d('执行规则编码'),
    },
  ],
  transport: {
    read: ({ data, params }): AxiosRequestConfig => {
      return {
        url: `/spfm/v1/cnf-auto-convert-relation`,
        method: 'GET',
        data: { ...data, ...params },
      };
    },
    submit: ({ data }): AxiosRequestConfig => {
      return {
        url: `/spfm/v1/cnf-auto-convert-relation`,
        method: 'post',
        data,
      };
    },
    destroy: ({ data = [] }): AxiosRequestConfig => {
      return {
        url: `/spfm/v1/cnf-auto-convert-relation`,
        method: 'post',
        data: data.map((ele) => ({ ...ele, _status: 'delete' })),
      };
    },
  },
});

export { tableDS, relationListDS };
