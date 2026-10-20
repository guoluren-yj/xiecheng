import intl from 'hzero-front/lib/utils/intl';
import { isEmpty, isNil } from 'lodash';
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { SRM_ADAPTOR } from 'srm-front-boot/lib/utils/config';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataToJSON } from 'choerodon-ui/pro/lib/data-set/enum'; 
import {
  normalField,
} from 'srm-front-boot/lib/components/FilterBarTable/util';
import request from 'hzero-front/lib/utils/request';

const SRM_SIFC = '/sifc';
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${getCurrentOrganizationId()}` : `${SRM_ADAPTOR}/v1`;

const tableData = (): DataSetProps => ({
  fields: [
    {
      name: 'releaseStatus',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_STATUS',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.releaseStatus`)
        .d('发布状态'),
    },
    {
      name: 'version',
      type: FieldType.number,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.version`)
        .d('版本'),
    },
    {
      name: 'code',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.code`)
        .d('外部接口编码'),
    },
    {
      name: 'name',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.name`)
        .d('外部接口名称'),
    },
    {
      name: 'externalSystem',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.externalSystem`)
        .d('所属系统名称'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.tenantNameNew`)
        .d('所属租户'),
    },
    {
      name: 'interfaceCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.interfaceCode`)
        .d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.interfaceName`)
        .d('接口名称'),
    },
    {
      name: 'objectName',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.objectName.external`)
        .d('接口对象'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_ENABLED',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.enabledFlag`)
        .d('启用状态'),
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.nameOrCode.external`)
        .d('外部接口编码/外部接口名称'),
      display: true,
      merge: true,
    },
    {
      name: 'externalSystem',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.externalSystem`)
        .d('所属系统名称'),
    },
    {
      name: 'releaseStatus',
      type: FieldType.string,
      display: true,
      lookupCode: 'SITF.EXT_ITF_STATUS',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.releaseStatus`)
        .d('发布状态'),
    },
    {
      name: 'interfaceCode',
      type: FieldType.object,
      display: true,
      lovCode: 'SITF.EXT_ITF_INTERFACE',
      lovPara: { tenantId: getCurrentOrganizationId() },
      label: intl
        .get(
          `scux.externalInterfaceDefinition.model.externalInterfaceDefinition.interfaceCodeQuery`
        )
        .d('接口名称/编码'),
    },
    {
      name: 'objectCode',
      type: FieldType.object,
      display: true,
      lovCode: 'SITF.EXT_ITF_OBJECT',
      lovPara: { tenantId: getCurrentOrganizationId() },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.objectCodeQuery`)
        .d('接口对象'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      display: true,
      lookupCode: 'SITF.EXT_ITF_ENABLED',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.enabledFlag`)
        .d('启用状态'),
    },
  ] as normalField[],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/ext-itf-infos/page`,
        method: 'GET',
      };
    },
  },
});

const formData = (): DataSetProps => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'releaseStatus',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_STATUS',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.releaseStatus`)
        .d('发布状态'),
    },
    {
      name: 'code',
      type: FieldType.string,
      required: true,
      format: 'uppercase',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.code`)
        .d('外部接口编码'),
      validator: value => {
        const pattern = /[A-Z0-9][A-Z0-9-_./]/g;
        if (pattern.test(value)) {
          return true;
        } else {
          return intl
            .get('scux.externalInterfaceDefinition.view.message.code')
            .d('只能输入大写字母、数字以及特殊字符【- _ . /】');
        }
      },
    },
    {
      name: 'name',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.name`)
        .d('外部接口名称'),
    },
    {
      name: 'tenantIdLov',
      type: FieldType.object,
      lovCode: 'SITF.EXT_ITF_TENANT',
      required: true,
      ignore: FieldIgnore.always,
      textField: 'tenantName',
      valueField: 'tenantId',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.tenantId`)
        .d('所属租户'),
    },
    {
      name: 'tenantId',
      bind: 'tenantIdLov.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantIdLov.tenantName',
    },
    {
      name: 'interfaceCodeLov',
      type: FieldType.object,
      required: true,
      lovCode: 'SITF.EXT_ITF_INTERFACE',
      lovPara: { tenantId: getCurrentOrganizationId() },
      ignore: FieldIgnore.always,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.interfaceCode`)
        .d('接口编码'),
    },
    {
      name: 'interfaceCode',
      bind: 'interfaceCodeLov.interfaceCode',
    },
    {
      name: 'interfaceName',
      type: FieldType.string,
      bind: 'interfaceCodeLov.interfaceName',
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.interfaceName`)
        .d('接口名称'),
    },
    {
      name: 'objectCodeLov',
      type: FieldType.object,
      lovCode: 'SITF.EXT_ITF_OBJECT',
      ignore: FieldIgnore.always,
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: record.get('tenantId'),
          interfaceCode: record.get('interfaceCode'),
        }),
        disabled: ({ record }) =>
          isNil(record.get('tenantId')) || isEmpty(record.get('interfaceCode')),
      },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.objectCode`)
        .d('接口对象'),
    },
    {
      name: 'objectCode',
      bind: 'objectCodeLov.objectCode',
    },
    {
      name: 'objectName',
      bind: 'objectCodeLov.objectName',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.objectName`)
        .d('接口对象名称'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.EXT_ITF_ENABLED',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.enabledFlag`)
        .d('启用状态'),
      defaultValue: '1',
    },
    {
      name: 'version',
      type: FieldType.number,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.version`)
        .d('版本'),
      defaultValue: 1,
    },
    {
      name: 'externalSystem',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.externalSystem`)
        .d('所属外部系统'),
    },
    {
      name: 'createName',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.createName`)
        .d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'updateName',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.updateName`)
        .d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.lastUpdateDate`)
        .d('更新时间'),
    },
  ],

  transport: {
    read: value => {
      const {
        data: { id },
      } = value;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-infos/${id}/detail`,
        method: 'GET',
      };
    },
  },
});

const operationData = (): DataSetProps => ({
  selection: false,
  fields: [
    {
      name: 'version',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.version`)
        .d('版本'),
    },
    {
      name: 'source',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_FIELD_SOURCE',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.source`)
        .d('字段归属'),
    },
    {
      name: 'actionType',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_ACTION_TYPE',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.actionType`)
        .d('操作'),
    },
    {
      name: 'code',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.codeNew`)
        .d('字段编码'),
    },
    {
      name: 'name',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.nameNew`)
        .d('字段名称'),
    },
    {
      name: 'sourceNode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sourceNode`)
        .d('来源节点'),
    },
    {
      name: 'valueSource',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSource`)
        .d('取值来源'),
      lookupCode: 'SITF.MAPPING_VALUE_FIELD_SOURCE',
    },
    {
      name: 'valueCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueCode`)
        .d('取值编码'),
    },
    {
      name: 'valueMethod',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueMethod`)
        .d('取值处理方式'),
        dynamicProps: {
          lookupCode: ({ record }) =>
            ['OBJECT', 'OBJECT_ARRAY'].includes(record.get('type'))
              ? 'SITF.MAPPING_VALUE_OBJECT_METHOD'
              : 'SITF.MAPPING_VALUE_FIELD_METHOD',
        },
    },
    {
      name: 'valueMethodMeans',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueMethodMeans`)
        .d('取值处理方法'),
    },
    {
      name: 'createMeaning',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.createMeaning`)
        .d('操作人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.creationDate`)
        .d('操作时间'),
    },
  ],
  queryFields: [
    {
      name: 'version',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.version`)
        .d('版本'),
    },
    {
      name: 'code',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.codeNew`)
        .d('字段编码'),
    },
    {
      name: 'sourceNode',
      type: FieldType.string,
      display: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sourceNode`)
        .d('来源节点'),
    },
    {
      name: 'source',
      type: FieldType.string,
      display: true,
      lookupCode: 'SITF.EXT_ITF_FIELD_SOURCE',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.source`)
        .d('字段归属'),
    },
  ] as normalField[],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/ext-itf-detail-records/page`,
        method: 'GET',
      };
    },
  },
});

const treeNavData = (): DataSetProps => ({
  selection: DataSetSelection.single,
  childrenField: 'children',
  primaryKey: 'uniqueCode',
  idField: 'uniqueCode',

  transport: {
    read: value => {
      const {
        data: { extItfId, source, tenantId },
      } = value;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/navi-tree`,
        method: 'GET',
        params: { source, tenantId },
      };
    },
  },
});

const objectData = (): DataSetProps => ({
  primaryKey: 'uniqueCode',
  idField: 'uniqueCode',
  parentField: 'sourceNode',
  fields: [
    { name: 'sourceNode', type: FieldType.string },
    { name: 'uniqueCode', type: FieldType.string },
    {
      name: 'code',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.fieldCode`)
        .d('字段编码'),
    },
    {
      name: 'name',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.fieldName`)
        .d('字段名称'),
    },
    {
      name: 'sourceNode',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sourceNode`)
        .d('来源节点'),
    },
    {
      name: 'type',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_FIELD_TYPE',
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.fieldType`)
        .d('字段类型'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.OBJECT_ENABLED',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.enabledFlag`)
        .d('启用/禁用'),
      defaultValue: '1',
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.nameOrCodeNew`)
        .d('字段编码/字段名称'),
      display: true,
      merge: true,
    },
  ] as normalField[],
  transport: {
    read: value => {
      const {
        data: { extItfId },
      } = value;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}`,
        method: 'GET',
      };
    },
  },
});

const filterChildren = children => {
  if (!isEmpty(children)) {
    children.forEach(item => {
      item.set('valueCodeLov', undefined);
      if (!isEmpty(item.children)) {
        filterChildren(item.children);
      }
    });
  }
  return;
};

const requestData = (typeProp: string): DataSetProps => ({
  primaryKey: 'uniqueCode',
  idField: 'uniqueCode',
  parentField: 'sourceNode',
  fields: [
    {
      name: 'sourceNode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sourceNode`)
        .d('来源节点'),
    },
    { name: 'uniqueCode', type: FieldType.string },
    {
      name: 'code',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.fieldCode`)
        .d('字段编码'),
    },
    {
      name: 'name',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.fieldName`)
        .d('字段名称'),
    },
    {
      name: 'type',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.EXT_ITF_FIELD_TYPE',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.fieldType`)
        .d('字段类型'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.OBJECT_ENABLED',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.enabledFlag`)
        .d('启用/禁用'),
      defaultValue: '1',
    },
    {
      name: 'valueSource',
      type: FieldType.string,
      required: true,
      dynamicProps: {
        lookupCode: ({ record }) =>
          ['OBJECT', 'ARRAY', 'OBJECT_ARRAY'].includes(record.get('type'))
            ? 'SITF.MAPPING_VALUE_OBJECT_SOURCE'
            : 'SITF.MAPPING_VALUE_FIELD_SOURCE',
      },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSource`)
        .d('取值来源'),
    },
    {
      name: 'valueCodeLov',
      type: FieldType.object,
      ignore: FieldIgnore.always,
      dynamicProps: {
        required: ({ record }) => {
          const { type, valueMethod } = record.get(['type', 'valueMethod']);
          // 字段类型为对象或者对象数组时,不管取值方式是啥，取值编码都必填
          const flag1 = ['OBJECT', 'OBJECT_ARRAY'].includes(type);
          // 字段类型不为对象或者对象数组时,当取值方式为直接映射，常用函数和值集翻译时，取值编码必填，其他的不必填
          const flag2 =
            !flag1 && ['direct_mapping', 'lov_idp', 'common_functions'].includes(valueMethod);
          return flag1 || flag2;
        },
        lovCode: ({ record }) => {
          const { type, valueMethod, valueSource } = record.get([
            'type',
            'valueMethod',
            'valueSource',
          ]);
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(type);
          // 取值处理方式是直接映射（direct_mapping），常用函数（common_functions）和值集翻译（lov_idp）
          const valueMethod1 = ['direct_mapping', 'lov_idp', 'common_functions'].includes(
            valueMethod
          );
          // SITF.MAPPING_VALUE_FIELD
          const flag1 = type1 || (!type1 && valueMethod1);
          // SITF.MAPPING_VALUE_CONSTANTS
          const flag3 = !type1 && valueSource === 'constant';
          // SITF.MAPPING_VALUE_VARIABLE
          const flag4 = !type1 && valueSource === 'variable';
          // 源数据[source_data],当前数据[current_data],常量[constant],对象变量[object_variable]全局变量[variable]
          return flag3
            ? 'SITF.MAPPING_VALUE_CONSTANTS'
            : flag4
            ? 'SITF.MAPPING_VALUE_VARIABLE'
            : flag1
            ? 'SITF.MAPPING_VALUE_FIELD'
            : undefined;
        },
        lovPara: ({ record, value }) => {
          const { parent } = record || {};
          const {
            objectCode,
            type,
            valueSource,
            tenantId,
            id,
            extItfId,
            valueMethod,
          } = record.toData();
          const { valueCode, valueSourceNode } = parent?.toData() || {};
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(type);
          if (!type1 && ['constant', 'variable'].includes(valueSource)) {
            return {
              tenantId,
              extItfId,
            };
          } else {
            return {
              objectCode,
              type,
              id,
              extItfId,
              valueSource,
              valueMethod,
              source: typeProp,
              tenantId,
              parentValueCode: valueSource === 'current_data' && valueCode,
              parentValueSourceNode: valueSource === 'current_data' && valueSourceNode,
            };
          }
        },
        disabled: ({ record }) => {
          const { valueMethod, type } = record.get(['type', 'valueMethod']);
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(type);
          console.log(type1, ['execute_expression', 'script'].includes(valueMethod));
          
          return !type1 && ['execute_expression', 'script'].includes(valueMethod);
        },
      },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueCode`)
        .d('取值编码'),
    },
    {
      name: 'valueCode',
      bind: 'valueCodeLov.valueCode',
    },
    {
      name: 'valueSourceNode',
      type: FieldType.string,
      bind: 'valueCodeLov.valueSourceNode',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSourceNode`)
        .d('取值编码所属节点'),
    },
    {
      name: 'valueTypeMeaning',
      type: FieldType.string,
      bind: 'valueCodeLov.valueTypeMeaning',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueType`)
        .d('取值编码所属字段类型'),
    },
    {
      name: 'valueType',
      bind: 'valueCodeLov.valueType',
    },
    {
      name: 'valueMethod',
      type: FieldType.string,
      required: true,
      dynamicProps: {
        lookupCode: ({ record }) =>
          ['OBJECT', 'OBJECT_ARRAY'].includes(record.get('type'))
            ? 'SITF.MAPPING_VALUE_OBJECT_METHOD'
            : 'SITF.MAPPING_VALUE_FIELD_METHOD',
        disabled: ({record}) => {
          const {type, valueType} = record.toData() || {};
          const flag1 = type === 'OBJECT' && valueType === 'OBJECT';
          return flag1;
        },
        required: ({record}) => {
          const {type, valueType} = record.toData() || {};
          const flag1 = type === 'OBJECT' && valueType === 'OBJECT_ARRAY';
          return flag1;
        },
        // optionsProps: ({dataSet, record}) => {
        //   const {type, valueType} = record.toData() || {};
        //   const flag1 = type === 'OBJECT' && valueType === 'OBJECT_ARRAY';
        //   const flag2 = type === 'OBJECT_ARRAYOBJECT' && valueType === 'OBJECT';
        //   const lookupData = dataSet.getField('valueMethod')?.getOptions(record)?.toData() || [];
        //   let data = lookupData;
        //   if(flag1) {
        //     data = lookupData.filter(item => item.value !== 'one_by_one');
        //   } else if(flag2) {
        //     data = lookupData.filter(item => !(['first_line', 'either_line'].includes(item.value)));
        //   }
        //   return {data}
        // },
      },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueMethod`)
        .d('取值处理方式'),
    },
    {
      name: 'valueMethodMeansLov',
      dynamicProps: {
        type: ({ record }) =>
          record.get('valueMethod') === 'lov_idp' ? FieldType.object : FieldType.string,
        lovCode: ({ record }) =>
          record.get('valueMethod') === 'lov_idp' ? 'SITF.MAPPING_VALUE_IDP_LOV' : '',
        required: ({ record }) => record.get('valueMethod') === 'lov_idp',
        lovPara: ({ record }) => ({ tenantId: record.get('tenantId') }),
      },
      ignore: FieldIgnore.always,

      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueMethodMeans`)
        .d('取值处理方法'),
    },
    {
      name: 'valueMethodMeans',
      bind: 'valueMethodMeansLov.lovCode',
    },
    {
      name: 'lastUpdatedBy',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.lastUpdatedBy`)
        .d('最后更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.lastUpdateDate`)
        .d('最后更新时间'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'createdBy',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.createdBy`)
        .d('创建人'),
    },
    {
      name: 'requiredFlag',
      type: FieldType.number,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.requiredFlag`)
        .d('必填校验'),
    },
    {
      name: 'componentsParqams',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.nameOrCodeNew`)
        .d('字段编码/字段名称'),
      display: true,
      merge: true,
    },
  ] as normalField[],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'valueMethod' && value) {
        record.set('valueMethodMeansLov', null);
      }
      if (name === 'valueCodeLov') {
        const { children } = record || {};
        filterChildren(children);
      }
    },
  },
  transport: {
    read: value => {
      const {
        data: { extItfId },
      } = value;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}`,
        method: 'GET',
      };
    },
  },
});

const constantInfo = (): DataSetProps => ({
  forceValidate: true,
  selection: false,
  fields: [
    {
      name: 'code',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.code.constant`)
        .d('常量编码'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.remark`)
        .d('说明'),
    },
    {
      name: 'value',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.value`)
        .d('常量值'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/ext-itf-constants/page`,
        method: 'GET',
      };
    },
  },
});

const globalVariable = (tenantId, objectCode, extItfId): DataSetProps => ({
  forceValidate: true,
  selection: false,
  fields: [
    {
      name: 'code',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.codeVeri`)
        .d('变量编码'),
      pattern: '^[0-9a-zA-Z_]{1,}$',
    },
    {
      name: 'name',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.nameNew`)
        .d('说明'),
    },
    {
      name: 'source',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_VARIABLE_SOURCE',
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.sourceVeri`)
        .d('来源类型'),
    },
    {
      name: 'valueCodeLov',
      type: FieldType.object,
      required: true,
      lovCode: 'SITF.MAPPING_VALUE_FIELD',
      lovPara: {
        tenantId,
        objectCode,
        extItfId,
        source: 'REQUEST',
        type: 'STRING',
        valueSource: 'source_data',
        valueMethod: 'direct_mapping',
        parentValueCode: 'body',
        parentValueSourceNode: '',
      },
      ignore: FieldIgnore.always,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueCode`)
        .d('取值字段'),
    },
    {
      name: 'valueCode',
      bind: 'valueCodeLov.valueCode',
    },
    {
      name: 'valueSourceNode',
      type: FieldType.string,
      bind: 'valueCodeLov.valueSourceNode',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSourceNode`)
        .d('取值来源节点'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/ext-itf-variables/page`,
        method: 'GET',
      };
    },
  },
});

const moreSettingData = (): DataSetProps => ({
  forceValidate: true,
  fields: [
    // 常用设置
    {
      name: 'emptyValueFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'emptyValueMeans',
      type: FieldType.number,
      dynamicProps: {
        required: ({ record }) => record.get('emptyValueFlag') === 1,
      },
    },
    {
      name: 'requiredFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
    },
    // 字符串设置
    {
      name: 'stringLengthFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'stringLength',
      type: FieldType.number,
      dynamicProps: {
        required: ({ record }) => record.get('stringLengthFlag') === 1,
      },
    },
    {
      name: 'stringLengthMeans',
      type: FieldType.number,
      dynamicProps: {
        required: ({ record }) => record.get('stringLengthFlag') === 1,
      },
    },
    // 日期设置
    {
      name: 'dateFormatFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'dateFormatMeans',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_DATE_FORMAT',
      dynamicProps: {
        required: ({ record }) => record.get('dateFormatFlag') === 1,
      },
    },
    // 数字设置
    {
      name: 'digitalAccuracyFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'digitalAccuracyMeans',
      type: FieldType.number,
      dynamicProps: {
        required: ({ record }) => record.get('digitalAccuracyFlag') === 1,
      },
    },
  ],
});

const recordsView = (): DataSetProps => ({
  selection: false,
  fields: [
    {
      name: 'version',
      type: FieldType.number,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.version`)
        .d('版本'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.creationDate.publish`)
        .d('发布时间'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.remark`)
        .d('说明'),
    },
  ],
  transport: {
    read: (values) => {
      const {data: {extItfId}} = values;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-vs/${extItfId}/page`,
        method: 'GET',
      };
    },
  },
});

const commonData = (extItfId, parentValueCode, parentValueSourceNode, source, objectCode): DataSetProps => ({
  forceValidate: true,
  selection: false,
  dataToJSON: DataToJSON.all,
  fields: [
    {
      name: 'columnCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.columnCode`)
        .d('输入字段编码'),
    },
    {
      name: 'columnName',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.columnName`)
        .d('输入字段描述'),
    },
    {
      name: 'columnType',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.columnType`)
        .d('输入字段类型'),
      lookupCode: 'SITF.EXT_ITF_FIELD_TYPE',
    },
    {
      name: 'valueSource',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSource`)
        .d('取值来源'),
      lookupCode: 'SITF.MAPPING_VALUE_FIELD_SOURCE',
    },
    {
      name: 'valueCodeLov',
      type: FieldType.object,
      required: true,
      ignore: FieldIgnore.always,
      dynamicProps: {
        lovCode: ({ record }) => {
          const { columnType, valueSource } = record.get([
            'columnType',
            'valueSource',
          ]);
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(columnType);
          // 取值处理方式是直接映射（direct_mapping），常用函数（common_functions）和值集翻译（lov_idp）
          const valueMethod1 = ['direct_mapping', 'lov_idp', 'common_functions'].includes('direct_mapping');
          // SITF.MAPPING_VALUE_FIELD
          const flag1 = type1 || (!type1 && valueMethod1);
          // SITF.MAPPING_VALUE_CONSTANTS
          const flag3 = !type1 && valueSource === 'constant';
          // SITF.MAPPING_VALUE_VARIABLE
          const flag4 = !type1 && valueSource === 'variable';
          // 源数据[source_data],当前数据[current_data],常量[constant],对象变量[object_variable]全局变量[variable]
          return flag3
            ? 'SITF.MAPPING_VALUE_CONSTANTS'
            : flag4
            ? 'SITF.MAPPING_VALUE_VARIABLE'
            : flag1
            ? 'SITF.MAPPING_VALUE_FIELD'
            : undefined;
        },
        lovPara: ({record}) => {
          const {
            columnType,
            valueSource,
            tenantId,
          } = record.toData();
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(columnType);
          if (!type1 && ['constant', 'variable'].includes(valueSource)) {
            return {
              tenantId,
              extItfId,
            };
          } else {
          return {
            tenantId,
            objectCode,
            extItfId,
            source,
            type: columnType,
            valueSource,
            valueMethod: 'direct_mapping',
            parentValueCode,
            parentValueSourceNode,
          };
        }
        },
      },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueCode`)
        .d('取值字段'),
    },
    {
      name: 'valueCode',
      bind: 'valueCodeLov.valueCode',
    },
    {
      name: 'valueSourceNode',
      type: FieldType.string,
      bind: 'valueCodeLov.valueSourceNode',
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSourceNode`)
        .d('取值字段所属节点'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/function-library/detail`,
        method: 'GET',
      };
    },
  },
});

const sortData = (source, recordData): DataSetProps => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'propertyNameLov',
      type: FieldType.object,
      lovCode: 'SITF.MAPPING_VALUE_FIELD',
      ignore: FieldIgnore.always,
      required: true,
      computedProps: {
        lovPara: () => {
          const {id, tenantId, extItfId, objectCode, type, valueSource, valueMethod, valueCode, valueSourceNode} = recordData;

          return {id, source, extItfId, tenantId, objectCode, type, valueSource, valueMethod, parentValueCode: valueCode, parentValueSourceNode: valueSourceNode};
        },
      },
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.propertyName`)
        .d('排序字段'),
    },
    {
      name: 'propertyName',
      bind: 'propertyNameLov.valueCode'
    },
    {
      name: 'type',
      bind: 'propertyNameLov.valueType'
    },
    {
      name: 'direction',
      type: FieldType.string,
      defaultValue: 'ASC',
      required: true,
    },
  ],
});

const introducingObjectData = ( tenantId, fieldType): DataSetProps => ({
  forceValidate: true,
  dataToJSON: DataToJSON.all,
  fields: [
    {
      name: 'code',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.code.object`)
        .d('对象变量名'),
    },
    {
      name: 'name',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.name.object`)
        .d('对象变量描述'),
    },
    {
      name: 'functionCodeLov',
      type: FieldType.object,
      lovCode: 'SITF.FUNCTION_LIBRARY_LOV_OBJECT_VARIABLE',
      ignore: FieldIgnore.always,
      required: true,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.functionCode.object`)
        .d('接口方法'),
      lovPara: {
        tenantId, fieldType
      },
    },
    {
      name: 'functionCode',
      bind: 'functionCodeLov.functionCode',
    },
    {
      name: 'functionName',
      bind: 'functionCodeLov.functionName',
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl
        .get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.nameOrCode.object`)
        .d('对象变量名/描述'),
    },
  ],
  transport: {
    read: (value) => {
      const {data: {fieldId}} = value;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-obj-variables/${fieldId}/page`,
        method: 'GET',
      };
    },
  },
});
const inputData  = (dataSource): DataSetProps => ({
  forceValidate: true,
  paging: false,
  selection: false,
  dataToJSON: DataToJSON.all,
  fields: [
    {
      name: 'code',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.code.input`).d('输入字段编码'),
    },
    {
      name: 'name',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.name.input`).d('输入字段描述'),
    },
    {
      name: 'typeMeaning',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.typeMeaning.input`).d('输入字段类型'),
    },
    {
      name: 'valueSource',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.MAPPING_VALUE_FIELD_SOURCE',
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSource`).d('取值来源'),
    },
    {
      name: 'valueCodeLov',
      type: FieldType.object,
      required: true,
      ignore: FieldIgnore.always,
      dynamicProps: {
        disabled: ({record}) => isEmpty(record.get('valueSource')),
        lovCode: ({ record }) => {
          const { columnType, valueSource } = record.get([
            'columnType',
            'valueSource',
          ]);
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(columnType);
          // 取值处理方式是直接映射（direct_mapping），常用函数（common_functions）和值集翻译（lov_idp）
          const valueMethod1 = ['direct_mapping', 'lov_idp', 'common_functions'].includes('direct_mapping');
          // SITF.MAPPING_VALUE_FIELD
          const flag1 = type1 || (!type1 && valueMethod1);
          // SITF.MAPPING_VALUE_CONSTANTS
          const flag3 = !type1 && valueSource === 'constant';
          // SITF.MAPPING_VALUE_VARIABLE
          const flag4 = !type1 && valueSource === 'variable';
          // 源数据[source_data],当前数据[current_data],常量[constant],对象变量[object_variable]全局变量[variable]
          return flag3
            ? 'SITF.MAPPING_VALUE_CONSTANTS'
            : flag4
            ? 'SITF.MAPPING_VALUE_VARIABLE'
            : flag1
            ? 'SITF.MAPPING_VALUE_FIELD'
            : undefined;
        },
        lovPara: ({record}) => {
          const {
            type,
            tenantId,
            extItfId,
            valueSource,
          } = record.toData();
          const {objectCode, source, valueCode, valueSourceNode} = dataSource;
          const type1 = ['OBJECT', 'OBJECT_ARRAY'].includes(type);
          if (!type1 && ['constant', 'variable'].includes(valueSource)) {
            return {
              tenantId,
              extItfId,
            };
          } else {
          return {
            tenantId,
            objectCode,
            extItfId,
            source,
            type,
            valueSource,
            valueMethod: 'direct_mapping',
            parentValueCode: valueCode,
            parentValueSourceNode:valueSourceNode,
          };
        }
        },
      },
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueCode`).d('取值字段'),
    },
    {
      name: 'valueCode',
      bind: 'valueCodeLov.valueCode',
    },
    {
      name: 'valueSourceNode',
      type: FieldType.string,
      bind: 'valueCodeLov.valueSourceNode',
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.valueSourceNode`).d('取值字段所属节点'),
    },
  ],

  events: {
    update: ({ record, name })  => {
      if(name === 'valueSource') {
        record.set('valueCode', undefined)
      }
    }
  },

  transport: {
    read: (value) => {
      const {data: {objVariableId}, params} = value;
      const {tenantId, extItfId, id} = dataSource;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-obj-variables/inout/${objVariableId}/list?source=input`,
        method: 'GET',
        params: {...params, tenantId, extItfId, fieldId: id},
      };
    },
  },
});

const outputData = (dataSource): DataSetProps => ({
  forceValidate: true,
  paging: false,
  selection: false,
  fields: [
    {
      name: 'enabledFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.enabledFlag.out`).d('是否启用'),
    },
    {
      name: 'code',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.code.out`).d('输出字段编码'),
    },
    {
      name: 'name',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.name.out`).d('输出字段描述'),
    },
    {
      name: 'typeMeaning',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.typeMeaning.out`).d('输出字段类型'),
    },
  ],

  transport: {
    read: (value) => {
      const {data: {objVariableId}, params} = value;
      const {tenantId, extItfId, id} = dataSource;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-obj-variables/inout/${objVariableId}/list?source=output`,
        method: 'GET',
        params: {...params, tenantId, extItfId, fieldId: id},
      };
    },
  },
});

const baseInfoData = (dataSource): DataSetProps => ({
  fields: [
    {
      name: 'functionCode',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.functionCode`).d('方法编码'),
    },
    {
      name: 'functionName',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.functionName`).d('方法名称'),
    },
    {
      name: 'functionTypeMeaning',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.functionTypeMeaning`).d('类型'),
    },
    {
      name: 'applyFieldTypesMeaning',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.applyFieldTypesMeaning`).d('适用字段类型'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get(`scux.externalInterfaceDefinition.model.externalInterfaceDefinition.remark`).d('说明'),
    },
  ],
  transport: {
    read: (value) => {
      const {data: {objVariableId}, params} = value;
      const {tenantId, extItfId, id} = dataSource;
      return {
        url: `${SRM_SIFC}/v1/ext-itf-obj-variables/function/${objVariableId}/detail`,
        method: 'GET',
        params: {...params, tenantId, extItfId, fieldId: id},
      };
    },
  },
});


export {
  tableData,
  formData,
  operationData,
  treeNavData,
  objectData,
  constantInfo,
  globalVariable,
  requestData,
  moreSettingData,
  recordsView,
  commonData,
  sortData,
  introducingObjectData,
  outputData,
  baseInfoData,
  inputData,
};

// 创建数据
export async function fetchCreate(method, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-infos`, {
    method,
    body: params,
  });
}

// 列表行删除
export async function fetchDelete(params) {
  return request(`${SRM_SIFC}/v1/ext-itf-infos`, {
    method: 'DELETE',
    body: params,
  });
}

// 禁用
export async function fetchDisabled(id, tenantId) {
  return request(`${SRM_SIFC}/v1/ext-itf-infos/${id}/disabled`, {
    method: 'PUT',
    query: { tenantId },
  });
}

// 启用
export async function fetchEnabled(id, tenantId) {
  return request(`${SRM_SIFC}/v1/ext-itf-infos/${id}/enabled`, {
    method: 'PUT',
    query: { tenantId },
  });
}

// 查看操作记录导航
export async function fetchOperationNav(params) {
  return request(`${SRM_SIFC}/v1/ext-itf-records/page`, {
    method: 'GET',
    query: params,
  });
}

// 导入Json
export async function fetchImportJson(extItfId, params, jsonData) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/quick-import`, {
    method: 'POST',
    query: params,
    body: jsonData,
  });
}

// 预览Json
export async function fetchViewJson(extItfId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/quick-preview`, {
    method: 'GET',
    query: params,
  });
}

// 批量删除
export async function fetchDeleteLine(extItfId, queryparams, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/batch`, {
    method: 'DELETE',
    query: { ...queryparams },
    body: params,
  });
}

// 批量保存字段
export async function fetchObjectSave(extItfId, queryparams, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/save/batch`, {
    method: 'POST',
    query: { ...queryparams },
    body: params,
  });
}

// 字段启用
export async function fetchObjectEnabled(extItfId, queryparams, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/enabled/batch`, {
    method: 'PUT',
    query: { ...queryparams },
    body: params,
  });
}

// 字段禁用
export async function fetchObjectDisabled(extItfId, queryparams, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/disabled/batch`, {
    method: 'PUT',
    query: { ...queryparams },
    body: params,
  });
}

// 字段单挑删除
export async function fetchObjectDelete(extItfId, queryparams, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/single/{id}`, {
    method: 'DELETE',
    query: { ...queryparams },
    body: params,
  });
}

// 常量行删除
export async function fetchContentLineDelete(extItfId, tenantId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-constants/${extItfId}/batch`, {
    method: 'DELETE',
    query: { tenantId },
    body: params,
  });
}
// 常量保存
export async function fetchConstantSave(extItfId, tenantId, constantsUniqueCode, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-constants/${extItfId}/save/batch`, {
    method: 'POST',
    query: { tenantId, uniqueCode: constantsUniqueCode },
    body: params,
  });
}

// 变量行删除
export async function fetchVariableLineDelete(extItfId, tenantId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-variables/${extItfId}/batch`, {
    method: 'DELETE',
    query: { tenantId },
    body: params,
  });
}
// 变量保存
export async function fetchVariableSave(extItfId, tenantId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-variables/${extItfId}/save/batch`, {
    method: 'POST',
    query: { tenantId },
    body: params,
  });
}
// 取值方法编码获取
export async function fetchValueMethodCode(extItfId, id, otherParams, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-field-infos/${extItfId}/value-method-code/${id}`, {
    method: 'POST',
    query: { ...otherParams },
    body: params,
  });
}

// 发布
export async function fetchPublish(params) {
  return request(`${SRM_SIFC}/v1/ext-itf-infos/publish`, {
    method: 'POST',
    body: params,
  });
}

// 引入对象变量 - 删除
export async function fetchDeleteObject(fieldId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-obj-variables/${fieldId}/batch`, {
    method: 'DELETE',
    body: params,
  });
}

// 引入对象变量 - 保存
export async function fetchIntroducingObjectSave(fieldId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-obj-variables/${fieldId}/save/batch`, {
    method: 'POST',
    body: params,
  });
}

// 输入输出 - 保存
export async function fetchInputOuputSave(objVariableId, params) {
  return request(`${SRM_SIFC}/v1/ext-itf-obj-variables/inout/${objVariableId}/save/batch`, {
    method: 'POST',
    body: params,
  });
}

export async function getComplementaryWordsService() {
  return request(`${requestUrlPre}/adaptor-script/auto-prompt`, {
    method: 'GET',
    responseType: 'text',
  });
}


