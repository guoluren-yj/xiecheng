/**
 * 数据字典页面 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-03-03
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 数据详情 DS
 * @returns
 */
const DataFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/${data.metaId}`,
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
      label: intl.get(`sdps.dataDictionary.model.tableNum`).d('表编码'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.tableName`).d('表名称'),
      name: 'description',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.tableType`).d('表类型'),
      name: 'tableType',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.charset`).d('字符集'),
      name: 'charset',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.tableSpace`).d('表空间'),
      name: 'schemaName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.sortRule`).d('排序规则'),
      name: 'collation',
      type: 'string',
    },
    // {
    //   label: intl.get(`sdps.dataDictionary.model.tableSize`).d('表大小'),
    //   name: 'tableSize',
    //   type: 'string',
    // },
    {
      label: intl.get(`sdps.dataSheet.model.dateTheme`).d('数据主题'),
      name: 'topicName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.database`).d('数据库类型'),
      name: 'dataSourceType',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 列属性 DS
 * @returns
 */
const ColumnsAttrDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/columns`,
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
      label: intl.get(`sdps.dataDictionary.model.columnName`).d('列名'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.type`).d('类型'),
      name: 'type',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.length`).d('长度'),
      name: 'dataSize',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.dotLen`).d('小数点'),
      name: 'decimalDigits',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.isEmpty`).d('是否为空'),
      name: 'requiredFlag',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.defaultValue`).d('默认值'),
      name: 'defaultValue',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataDictionary.model.common`).d('字段注释'),
      name: 'description',
      type: 'string',
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
        url: `${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/table-op-history`,
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
      lookupCode: 'SDPS.DATASHEET_HISTORY_OPERATION_TYPE',
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
 * LOV DS
 * @returns
 */
const LovDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/topic-subscribe-table-list`,
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
      name: 'topicNum',
      label: intl.get(`sdps.dataSheet.model.topicNum`).d('主题编码'),
    },
    {
      name: 'topicName',
      label: intl.get(`sdps.dataSheet.model.topicName`).d('主题名称'),
    },
    // {
    //   name: 'selectTable',
    //   type: 'object',
    //   lovCode: 'SDPS.DATATABLE_TOPIC_SUBSCRIPTION',
    //   textField: 'topicName',
    //   noCache: true,
    //   multiple: true,
    //   lovQueryAxiosConfig: () => {
    //     return {
    //       url: `${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/topic-subscribe-table-list`,
    //       method: 'GET',
    //     };
    //   },
    // },
    // {
    //   name: 'topicNum',
    //   bind: 'selectTable.topicNum',
    // },
  ],
  queryFields: [
    {
      name: 'topicName',
      label: intl.get(`sdps.dataSheet.model.topicNumOrName`).d('主题编码/名称'),
    },
    {
      label: intl.get(`sdps.dataDictionary.model.tableNumOrName`).d('表编码/名称'),
      name: 'tableName',
      type: 'string',
    },
  ],
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
        url: `/hpfm/v1/${organizationId}/lov-view-headers`,
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
        url: `/hpfm/v1/${organizationId}/lov-headers/${data.lovId}/values`,
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

export { DataFormDS, ColumnsAttrDS, SubHistoryDS, LovDS, LovListDS, IdpLovTableDS };
