import intl from 'hzero-front/lib/utils/intl';
import {isEmpty} from 'lodash';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { normalField } from 'srm-front-boot/lib/components/FilterBarTable/util';
import request from 'hzero-front/lib/utils/request';

const SRM_SIFC = '/sifc';

const tableData = (): DataSetProps => ({
  fields: [
    {
      name: 'version',
      type: FieldType.number,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.version`).d('版本'),
    },
    {
      name: 'objectCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectCode`).d('对象编码'),
    },
    {
      name: 'objectName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectName`).d('对象名称'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.tenantName`).d('所属租户'),
    },
    {
      name: 'interfaceCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.interfaceCode`).d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.interfaceName`).d('接口名称'),
    },
    {
      name: 'objectSource',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectSource`).d('对象归属'),
    },
    {
      name: 'scriptCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.scriptCode`).d('对应埋点/脚本'),
    },
    {
      name: 'enabledFlagMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.enabledFlagMeaning`).d('启用状态'),
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.nameOrCode`).d('对象编码/对象名称'),
      display: true,
      merge: true,
    },
    {
      name: 'objectSource',
      type: FieldType.string,
      display: true,
      lookupCode: "SITF.OBJECT_SOURCE",
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectSource`).d('对象归属'),
    },
    {
      name: 'tenantId',
      type: FieldType.object,
      display: true,
      lovCode: 'SITF.OBJECT_TENANT',
      lovPara: { tenantId: getCurrentOrganizationId()},
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.tenantId`).d('所属租户'),
    },
    {
      name: 'interfaceCode',
      type: FieldType.object,
      display: true,
      lovCode: 'SITF.OBJECT_INTERFACE',
      lovPara: { tenantId: getCurrentOrganizationId()},
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.interfaceCode`).d('接口编码'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      display: true,
      lookupCode: 'SITF.OBJECT_ENABLED',
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.enabledFlag`).d('启用状态'),
    },
  ] as normalField[],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/object-infos/page`,
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
      name: 'objectCode',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectCode`).d('对象编码'),
    },
    {
      name: 'objectName',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectName`).d('对象名称'),
    },
    {
      name: 'tenantNameLov',
      type: FieldType.object,
      lovCode: 'SITF.OBJECT_TENANT',
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.tenantName`).d('所属租户'),
      ignore: FieldIgnore.always,
      textField: 'tenantName',
      valueField: 'tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantNameLov.tenantName',
    },
    {
      name: 'tenantId',
      bind: 'tenantNameLov.tenantId',
    },
    {
      name: 'interfaceCodeLov', 
      type: FieldType.object,
      lovCode: 'SITF.OBJECT_INTERFACE',
      required: true,
      lovPara: { tenantId: getCurrentOrganizationId()},
      ignore: FieldIgnore.always,
      textField: 'interfaceCode',
      valueField: 'interfaceCode',
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.interfaceCode`).d('接口编码'),
    },
    {
      name: 'interfaceCode',
      bind: 'interfaceCodeLov.interfaceCode',
    },
    {
      name: 'interfaceName',
      type: FieldType.string,
      required: true,
      bind: 'interfaceCodeLov.interfaceName',
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.interfaceName`).d('接口名称'),
    },
    {
      name: 'scriptCodeLov',
      type: FieldType.object,
      lovCode: 'SITF.OBJECT_SCRIPT',
      ignore: FieldIgnore.always,
      required: true,
      lovPara: { tenantId: getCurrentOrganizationId(), scriptSource: 'STATIC' },
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.scriptCode`).d('对应埋点/脚本'),
    },
    {
      name: 'scriptCode',
      bind: 'scriptCodeLov.code',
    },
    {
      name: 'enabledFlag',
      type: FieldType.boolean,
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.enabledFlag`).d('启用状态'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'version',
      type: FieldType.number,
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.version`).d('版本'),
      defaultValue: 1,
    },
    {
      name: 'objectSource',
      type: FieldType.string,
      lookupCode: "SITF.OBJECT_SOURCE",
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectSource`).d('对象归属'),
    },
    {
      name: 'objectType',
      type: FieldType.string,
      lookupCode: "SITF.OBJECT_TYPE",
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.objectType`).d('对象类型'),
    },
    {
      name: 'createName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.createName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.creationDate`).d('创建时间'),
    },
    {
      name: 'updateName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.updateName`).d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.lastUpdateDate`).d('更新时间'),
    },
  ],

  transport: {
    read: (value) => {
      const {data: {id}} = value;
      return {
        url: `${SRM_SIFC}/v1/object-infos/${id}/detail`,
        method: 'GET',
      };
    },
  },
});

const operationData = () : DataSetProps => ({
  selection: false,
  fields: [
    {
      name: 'version',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.version`).d('版本'),
    },
    {
      name: 'fieldSourceMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldSourceMeaning`).d('字段归属'),
    },
    {
      name: 'actionTypeMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.actionTypeMeaning`).d('操作'),
    },
    {
      name: 'fieldCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldCode`).d('字段编码'),
    },
    {
      name: 'fieldName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldName`).d('字段名称'),
    },
    {
      name: 'sourceNode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.sourceNode`).d('来源节点'),
    },
    {
      name: 'createMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.createMeaning`).d('操作人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.creationDate`).d('操作时间'),
    },
  ],
  queryFields: [
    {
      name: 'version',
      type: FieldType.string,
      display: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.version`).d('版本'),
    },
    {
      name: 'fieldCode',
      type: FieldType.string,
      display: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldCode`).d('字段编码'),
    },
    {
      name: 'sourceNode',
      type: FieldType.string,
      display: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.sourceNode`).d('来源节点'),
    },
    {
      name: 'fieldSource',
      type: FieldType.string,
      display: true,
      lookupCode: 'SITF.OBJECT_FIELD_SOURCE',
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldSourceMeaning`).d('字段归属'),
    },
  ] as normalField[],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/object-detail-records/page`,
        method: 'GET',
      };
    },
  },
});

const treeNavData = () : DataSetProps => ({
  selection: DataSetSelection.single,
  childrenField: 'children',
  primaryKey: 'fieldUniqueCode',
  idField: 'fieldUniqueCode',

  transport: {
    read: (value) => {
      const {data: {id, tenantId}} = value;
      return {
        url: `${SRM_SIFC}/v1/object-field-infos/${id}/navi-tree`,
        method: 'GET',
        params: {tenantId, fieldSource: 'REQUEST'},
      };
    },
  },
});

const objectData = (): DataSetProps => ({
  primaryKey: 'fieldUniqueCode',
  idField: 'fieldUniqueCode',
  parentField: 'sourceNode',
  fields: [
    { name: 'fieldUniqueCode', type: FieldType.string },
    {
      name: 'fieldCode',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldCode`).d('字段编码'),
    },
    {
      name: 'fieldName',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldName`).d('字段名称'),
    },
    {
      name: 'sourceNode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.sourceNode`).d('来源节点'),
    },
    {
      name: 'fieldType',
      type: FieldType.string,
      lookupCode: 'SITF.OBJECT_FIELD_TYPE',
      required: true,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.fieldType`).d('字段类型'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.OBJECT_ENABLED',
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.enabledFlag`).d('启用/禁用'),
      defaultValue: '1',
    },
  ],
  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceObjectDefinition.model.interfaceObjectDefinition.nameOrCodeNew`).d('字段编码/字段名称'),
      display: true,
      merge: true,
    },
  ] as normalField[],
  transport: {
    read: (value) => {
      const {data: {id}} = value;
      return {
        url: `${SRM_SIFC}/v1/object-field-infos/${id}`,
        method: 'GET',
      };
    },
  },
});


export { tableData, formData, operationData, treeNavData, objectData };

// 创建数据
export async function fetchCreate(method, params) {
  return request(`${SRM_SIFC}/v1/object-infos`, {
    method,
    body: params,
  });
}

// 行删除
export async function fetchDelete(id) {
  return request(`${SRM_SIFC}/v1/object-infos/${id}`, {
    method: 'DELETE',
  });
}


// 禁用
export async function fetchDisabled(id) {
  return request(`${SRM_SIFC}/v1/object-infos/${id}/disabled`, {
    method: 'PUT',
  });
}

// 启用
export async function fetchEnabled(id) {
  return request(`${SRM_SIFC}/v1/object-infos/${id}/enabled`, {
    method: 'PUT',
  });
}

// 查看操作记录导航
export async function fetchOperationNav(params) {
  return request(`${SRM_SIFC}/v1/object-records/page`, {
    method: 'GET',
    query: params,
  });
}

// 导入Json
export async function fetchImportJson(id, params, jsonData) {
  const jsonCurent = JSON.parse(jsonData);
  
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}/quick-import`, {
    method: 'POST',
    query: params,
    body: jsonCurent
  });
}

// 预览Json
export async function fetchViewJson(id, params) {
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}/quick-preview`, {
    method: 'GET',
    query: params,
  });
}

// 批量删除
export async function fetchDeleteLine(id, queryparams, params) {
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}/batch`, {
    method: 'DELETE',
    query: {...queryparams},
    body: params,
  });
}

// 批量保存字段
export async function fetchObjectSave(id, queryparams, params) {
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}/save/batch`, {
    method: 'POST',
    query: {...queryparams},
    body: params,
  });
}

// 字段启用
export async function fetchObjectEnabled(id, queryparams, params) {
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}/enabled/batch`, {
    method: 'PUT',
    query: {...queryparams},
    body: params,
  });
}

// 字段禁用
export async function fetchObjectDisabled(id, queryparams, params) {
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}/disabled/batch`, {
    method: 'PUT',
    query: {...queryparams},
    body: params,
  });
}

// 字段单挑删除
export async function fetchObjectDelete(id, queryparams, params) {
  return request(`${SRM_SIFC}/v1/object-field-infos/${id}`, {
    method: 'DELETE',
    query: {...queryparams},
    body: params,
  });
}