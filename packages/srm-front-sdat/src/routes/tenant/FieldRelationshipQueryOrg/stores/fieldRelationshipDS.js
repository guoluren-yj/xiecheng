/**
 * 页面字段关系查询 DS
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 风险定义 列表 DS
 * @returns
 */
const FieldListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/page-field-relation`,
        params: {
          ...data,
          ...params,
          tenantId: getCurrentOrganizationId(),
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.fieldRelationship.model.directoryGroup`).d('目录组'),
      name: 'menuName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.menuCode`).d('菜单编码'),
      name: 'singleMenuCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.menuName`).d('菜单名称'),
      name: 'singleMenuName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.unitGroupCode`).d('单元组编码'),
      name: 'unitGroupCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.unitGroupName`).d('单元组名称'),
      name: 'unitGroupName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.unitCode`).d('单元编码'),
      name: 'unitCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.unitName`).d('单元名称'),
      name: 'unitName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.unitType`).d('单元类型'),
      name: 'unitType',
      type: 'string',
      lookupCode: 'HPFM.CUST.UNIT_TYPE ',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldSource`).d('字段来源'),
      name: 'unitFieldSource',
      type: 'string',
      lookupCode: 'SDAT.PAGE_FIELD_SOURCE',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.realTableName`).d('物理表名称'),
      name: 'tableName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldCode`).d('字段编码'),
      name: 'unitFieldCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldAlias`).d('字段别名'),
      name: 'unitFieldAlias',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldName`).d('字段名称'),
      name: 'unitFieldName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldNameSource`).d('字段名称来源'),
      name: 'unitFieldNameType',
      type: 'string',
      lookupCode: 'SDAT.PAGE_FIELD_NAME_TYPE',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.unitFieldType`).d('字段类型'),
      name: 'unitFieldType',
      type: 'string',
      lookupCode: 'SDAT.PAGE_FIELD_TYPE',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.businessObjectCode`).d('业务对象编码'),
      name: 'businessObjectCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.businessObjectName`).d('业务对象名称'),
      name: 'businessObjectName',
      type: 'string',
    },
  ],
  events: {},
});

export { FieldListDS };
