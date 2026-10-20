/**
 * 数据表管理DS 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-03-07
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 技术元数据 DS
 * @returns
 */
const MetadataDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/meta-table/${data.metaId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.tableNum`).d('表编码'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableName`).d('表名称'),
      name: 'description',
      type: 'intl',
      maxLength: 200,
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableType`).d('表类型'),
      name: 'tableType',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.charset`).d('字符集'),
      name: 'charset',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableSpace`).d('数据库名'),
      name: 'schemaName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.sortRule`).d('排序规则'),
      name: 'collation',
      type: 'string',
    },
    // {
    //   label: intl.get(`sdps.dataSheet.model.tableSize`).d('表大小'),
    //   name: 'tableSize',
    //   type: 'string',
    // },
    {
      label: intl.get(`sdps.dataSheet.model.dateTheme`).d('数据主题'),
      name: 'topicName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.database`).d('数据库类型'),
      name: 'dataSourceType',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableTenant`).d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SDAT.DATASHEET_TABLE_TENANT_LIST',
      noCache: true,
      multiple: true,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('level') === 'org';
        },
      },
    },
    {
      name: 'tenantNames',
      bind: 'tenantObj.tenantName',
    },
    {
      name: 'tenantIds',
      bind: 'tenantObj.tenantId',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableLevel`).d('表层级'),
      name: 'level',
      type: 'string',
      required: true,
      lookupCode: 'SDAT.DATASHEET_TABLE_LEVEL',
    },
    {
      name: 'bindTenantIds',
    },
    {
      name: 'tenantNameStr',
    },
    {
      label: intl.get(`sdps.dataSheet.model.isDefault`).d('是否默认'),
      name: 'defaultFlag',
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 数据标准 DS
 * @returns
 */
const StandarDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/monitor-analysis/task-details-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.orgFilterTenant`).d('租户过滤tenant_id'),
      name: 'orgFilterTenant',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.isIncludeZero`).d('tenant_id是否包含0'),
      name: 'isIncludeZero',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 数据标准 DS 可编辑
 * @returns
 */
const StandarPlatFormDS = () => ({
  autoCreate: true,
  pageSize: 10,
  primaryKey: 'id',
  fields: [
    {
      name: 'mapObj',
      type: 'object',
      lovCode: 'SDAT.DATA_TABLE_COLUMNS',
      textField: 'name',
      noCache: true,
      dynamicProps: {
        lovQueryAxiosConfig: ({ record }) => {
          return {
            url: `${SRM_DATA_SDAT}/v1/meta-table/columns?metaId=${record.get('sourceTableId')}`,
            method: 'GET',
          };
        },
      },
    },
    {
      name: 'mapFields',
      bind: 'mapObj.name',
    },
    {
      label: intl.get(`sdps.dataSheet.model.isIncludeZero`).d('tenant_id是否包含0'),
      name: 'isIncludeZero',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
    },
    {
      name: 'sourceTableId',
    },
    {
      name: 'tableName',
    },
  ],
  events: {},
});

/**
 * 列属性 DS
 * @returns
 */
const ColumnPropDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/meta-table/columns`, // /${data.metaId}
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.columnName`).d('列名'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.type`).d('类型'),
      name: 'type',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.length`).d('长度'),
      name: 'dataSize',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataSheet.model.dotLen`).d('小数点'),
      name: 'decimalDigits',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataSheet.model.isEmpty`).d('是否为空'),
      name: 'requiredFlag',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataSheet.model.defaultValue`).d('默认值'),
      name: 'defaultValue',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.common`).d('字段注释'),
      name: 'description',
      type: 'intl',
      maxLength: 200,
    },
    {
      label: intl.get(`sdps.dataSheet.model.stuffRemarks`).d('业务描述'),
      name: 'businessObjectFieldName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.Lov`).d('值集'),
      name: 'fieldLov',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 订阅租户 DS
 * @returns
 */
const TenantSubscripDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/data-table-manages/link-tenants`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tenantName`).d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.distributeorOrSubscribe`).d('分发/订阅'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDAT.DATASHEET_SUBSCRIPTION_STATUS',
    },
    {
      label: intl.get(`sdps.dataSheet.model.lastUpdateDate`).d('最后更新时间'),
      name: 'submitDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdps.dataSheet.model.operator`).d('操作人'),
      name: 'submitterName',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 订阅历史 DS
 * @returns
 */
const SubHistoryDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/data-table-manages/table-op-history`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tenantName`).d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.operateType`).d('操作类型'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDAT.DATASHEET_HISTORY_OPERATION_TYPE',
    },
    {
      label: intl.get(`sdps.dataSheet.model.operateDate`).d('操作时间'),
      name: 'submitDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdps.dataSheet.model.operator`).d('操作人'),
      name: 'submitterName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.checkRemark`).d('审核意见'),
      name: 'advice',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * lov列表DS
 * @returns
 */
const LovListDS = () => ({
  pageSize: 10,
  primaryKey: 'lovList',
  selection: false,
  modifiedCheck: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/hpfm/v1/lov-view-headers`,
        params: {
          ...data,
          ...params,
          enabledFlag: 1,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.tenantName`).d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.viewCode`).d('视图代码'),
      name: 'viewCode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.viewName`).d('视图名称'),
      name: 'viewName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.lovCode`).d('值集编码'),
      name: 'lovCode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.lovName`).d('值集名称'),
      name: 'lovName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.operation`).d('操作'),
      name: 'operation',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdps.dataSheet.model.viewCode`).d('视图代码'),
      name: 'viewCode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.viewName`).d('视图名称'),
      name: 'viewName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tenantNameObj`).d('租户名称'),
      name: 'tenantNameObj',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      ignore: 'always',
    },
    {
      name: 'tenantId',
      bind: 'tenantNameObj.tenantNum',
    },
  ],
});

/**
 * 独立值集列表DS
 * @returns
 */
const IdpLovTableDS = () => ({
  pageSize: 10,
  primaryKey: 'IdpLovTable',
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/hpfm/v1/lov-headers/${data.lovId}/values`,
        params: {
          ...data,
          ...params,
          enabledFlag: 1,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.value`).d('值'),
      name: 'value',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.meaning`).d('含义'),
      name: 'meaning',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdps.dataSheet.model.value`).d('值'),
      name: 'value',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.meaning`).d('含义'),
      name: 'meaning',
      type: 'string',
    },
  ],
});

export {
  MetadataDS,
  StandarDS,
  ColumnPropDS,
  TenantSubscripDS,
  StandarPlatFormDS,
  SubHistoryDS,
  LovListDS,
  IdpLovTableDS,
};
