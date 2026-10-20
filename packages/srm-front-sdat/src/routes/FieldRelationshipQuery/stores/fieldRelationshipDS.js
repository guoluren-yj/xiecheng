/**
 * 页面字段关系查询 DS
 */
import intl from 'utils/intl';

import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 风险定义 列表 DS
 * @returns
 */
const FieldListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/page-field-relation`,
        params: {
          ...data,
          ...params,
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
      name: 'directoryGroup',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.menuCode`).d('菜单编码'),
      name: 'menuCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.menuName`).d('菜单名称'),
      name: 'menuName',
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
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldSource`).d('字段来源'),
      name: 'unitFieldSource',
      type: 'string',
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
      name: 'unitFieldAlisa',
      type: 'string',
    },
    {
      label: intl.get(`sdat.fieldRelationship.model.fieldName`).d('字段名称'),
      name: 'unitFieldName',
      type: 'string',
    },
  ],
  events: {},
});

export { FieldListDS };
