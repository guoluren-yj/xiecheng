/**
 * 数据表管理DS 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 1022-03-07
 * @Copyright: Copyright (c) 1022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

/**
 * 数据详情 DS
 * @returns
 */
const DataFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/monitor-analysis/task-details-list`,
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
      label: intl.get(`sdps.dataSheet.model.tableNum`).d('表编码'),
      name: 'tableNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableName`).d('表名称'),
      name: 'tableName',
      type: 'string',
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
      name: 'tableSpace',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.sortRule`).d('排序规则'),
      name: 'sortRule',
      type: 'string',
    },
    // {
    //   label: intl.get(`sdps.dataSheet.model.tableSize`).d('表大小'),
    //   name: 'tableSize',
    //   type: 'string',
    // },
    // {
    //   label: intl.get(`sdps.dataSheet.model.dateTheme`).d('数据主题'),
    //   name: 'dateTheme',
    //   type: 'string',
    // },
    {
      label: intl.get(`sdps.dataSheet.model.database`).d('数据库类型'),
      name: 'database',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.lastUpdateDate`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
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
        url: `${SRM_DATA_PROCESS}/v1/monitor-analysis/task-details-list`,
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
      name: 'columnName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.type`).d('类型'),
      name: 'type',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.length`).d('长度'),
      name: 'length',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataSheet.model.dotLen`).d('小数点'),
      name: 'dotLen',
      type: 'number',
    },
    {
      label: intl.get(`sdps.dataSheet.model.isEmpty`).d('是否为空'),
      name: 'isEmpty',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.defaultValue`).d('默认值'),
      name: 'defaultValue',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.common`).d('字段注释'),
      name: 'common',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.remarks`).d('描述'),
      name: 'remarks',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 租户级 订阅表 DS
 * @returns
 */
const SubscribeFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/data-table-manages/link-tables`,
        params: {
          ...data,
          ...params,
          sort: data.sort ? data.sort : 'lastUpdateDate,desc',
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'tableInfoId',
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`sdps.dataSheet.model.tableNum`).d('数据表编码'),
      name: 'sourceTableNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableName`).d('表名'),
      name: 'sourceTableName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.distributeorOrSubscribe`).d('分发/订阅'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDPS.DATASHEET_SUBSCRIPTION_STATUS',
    },
    {
      label: intl.get(`sdps.dataSheet.model.themeNum`).d('主题编码'),
      name: 'topicNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.themeName`).d('主题名称'),
      name: 'topicName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.lastUpdateDate`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdps.dataSheet.model.operator`).d('操作人'),
      name: 'submitterName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.syncMode`).d('同步模式'),
      name: 'syncMode',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * LOV DS
 * @returns
 */
const LovDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  autoQuery: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/data-table-manages/absent-tables`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    // {
    //   name: 'selectTable',
    //   type: 'object',
    //   lovCode: 'SDPS.DATATABLE_ABSENT_TABLES',
    //   textField: 'sourceTableName',
    //   noCache: true,
    //   multiple: true,
    //   dynamicProps: {
    //     lovPara: ({ record }) => {
    //       return {
    //         tenantId: record.get('tenantId'),
    //       };
    //     },
    //   },
    // },
    {
      name: 'topicNum',
      label: intl.get(`sdps.dataSheet.model.topicNum`).d('主题编码'),
    },
    {
      name: 'topicName',
      label: intl.get(`sdps.dataSheet.model.topicName`).d('主题名称'),
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableNum`).d('表编码'),
      name: 'sourceTableNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tableName`).d('表名称'),
      name: 'sourceTableName',
      type: 'string',
    },
    // {
    //   name: 'sourceTableName',
    //   bind: 'selectTable.sourceTableName',
    // },
    {
      name: 'tenantId',
    },
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
  events: {},
});

/**
 * 分发 选择租户 DS
 * @returns
 */
const TentantLovDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/data-table-manages/table-absent-tenant`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    // {
    //   name: 'distribOrg',
    //   type: 'object',
    //   lovCode: 'SDPS.DATATABLE_ABSENT_TENTANT',
    //   textField: 'tenantName',
    //   noCache: true,
    //   multiple: true,
    //   dynamicProps: {
    //     lovPara: ({ record }) => {
    //       return {
    //         sourceTableId: record.get('sourceTableId'),
    //       };
    //     },
    //   },
    // },
    {
      label: intl.get(`sdps.dataSheet.model.tenantName`).d('租户名称'),
      name: 'tenantName',
      // bind: 'distribOrg.tenantName',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
      // bind: 'distribOrg.tenantNum',
    },
    {
      name: 'sourceTableId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdps.dataSheet.model.tenantName`).d('租户名称'),
      name: 'tenantName',
    },
    {
      label: intl.get(`sdps.dataSheet.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
    },
  ],
  events: {},
});

/**
 * 添加 修改主题
 * @returns
 */
const AddTopicDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  selection: 'single',
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/data-table-manages/topic-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    // {
    //   name: 'topicObj',
    //   type: 'object',
    //   lovCode: 'SDPS.DATATABLE_TOPIC_LIST',
    //   textField: 'topicName',
    //   noCache: true,
    //   // multiple: true,
    //   dynamicProps: {
    //     lovPara: ({ record }) => {
    //       return {
    //         sourceTableId: record.get('sourceTableId'),
    //       };
    //     },
    //   },
    // },
    {
      label: intl.get(`sdps.dataSheet.model.themeNum`).d('主题编码'),
      name: 'topicNum',
      // bind: 'topicObj.topicNum',
    },
    {
      label: intl.get(`sdps.dataSheet.model.themeName`).d('主题名称'),
      name: 'topicName',
    },
    {
      label: intl.get(`sdps.dataSheet.model.creationDate`).d('创建时间'),
      name: 'createDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdps.dataSheet.model.creater`).d('创建人'),
      name: 'creator',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdps.dataSheet.model.themeNum`).d('主题编码'),
      name: 'topicNum',
    },
    {
      label: intl.get(`sdps.dataSheet.model.themeName`).d('主题名称'),
      name: 'topicName',
    },
  ],
  events: {},
});

/**
 * 主题列表 lov
 * @returns
 */
const TopicLovDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  fields: [
    {
      name: 'topicObj',
      textField: 'topicName',
      valueField: 'topicNum',
      type: 'object',
      noCache: true,
      lovCode: 'SDPS.PLATFORM_TOPIC_LIST',
    },
  ],
  // fields: [
  //   {
  //     name: 'topicObj',
  //     type: 'object',
  //     lovCode: 'SDPS.PLATFORM_TOPIC_LIST',
  //     textField: 'topicName',
  //     noCache: true,
  //     multiple: true,
  //     dynamicProps: {
  //       lovPara: ({ record }) => {
  //         return {
  //           sourceTableId: record.get('sourceTableId'),
  //         };
  //       },
  //     },
  //   },
  //   {
  //     name: 'topicObj',
  //     bind: 'distribOrg.topicName',
  //   },
  //   {
  //     name: 'topicObj',
  //     bind: 'distribOrg.topicNum',
  //   },
  // ],
  queryFields: [],
  events: {},
});

export { DataFormDS, ColumnsAttrDS, SubscribeFormDS, LovDS, TentantLovDS, TopicLovDS, AddTopicDS };
