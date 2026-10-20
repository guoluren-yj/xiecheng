/**
 * 数据表管理DS 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 1022-03-07
 * @Copyright: Copyright (c) 1022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 数据详情 DS
 * @returns
 */
const DataFormDS = () => ({
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
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.cardsDistribution.model.tableNum`).d('表编码'),
      name: 'tableNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tableName`).d('表名称'),
      name: 'tableName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tableType`).d('表类型'),
      name: 'tableType',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.charset`).d('字符集'),
      name: 'charset',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tableSpace`).d('数据库名'),
      name: 'tableSpace',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.sortRule`).d('排序规则'),
      name: 'sortRule',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.database`).d('数据库类型'),
      name: 'database',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.lastUpdateDate`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 卡片详情 DS
 * @returns
 */
const SubscribeFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/report-card-distributions/present-card-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'cardId',
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`sdat.cardsManage.model.cardCode`).d('卡片编码'),
      name: 'cardNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardName`).d('卡片名称'),
      name: 'cardName',
      type: 'intl',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardType`).d('卡片类型'),
      name: 'cardType',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_TYPE',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardLevel`).d('卡片层级'),
      name: 'level',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_LEVEL',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardSort`).d('卡片排序'),
      name: 'orderSeq',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardGroup`).d('卡片分组'),
      name: 'cardGroupCode',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_GROUP',
    },
    {
      label: intl.get(`sdat.cardsManage.model.operationTime`).d('操作时间'),
      name: 'operateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.cardsManage.model.operator`).d('操作人'),
      name: 'operateUserName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.cardsManage.model.cardCodeOrName`).d('卡片编码/名称'),
      name: 'cardName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardType`).d('卡片类型'),
      name: 'cardType',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_TYPE',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardGroup`).d('卡片分组'),
      name: 'cardGroupCode',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_GROUP',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardLevel`).d('卡片层级'),
      name: 'level',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_LEVEL',
    },
  ],
  events: {},
});

/**
 * LOV DS
 * @returns
 */
const LovDS = () => ({
  // pageSize: 10,
  primaryKey: 'id',
  autoQuery: false,
  paging: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/data-table-manages/absent-tables`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  record: {
    dynamicProps: {
      defaultExpanded: (record) => record.index === 0,
    },
  },
  fields: [
    {
      name: 'groupNum',
      label: intl.get(`sdat.cardsDistribution.model.groupNum`).d('分组编码'),
    },
    {
      name: 'groupName',
      label: intl.get(`sdat.cardsDistribution.model.groupName`).d('分组名称'),
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.cardNum`).d('卡片编码'),
      name: 'cardNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.cardName`).d('卡片名称'),
      name: 'cardName',
      type: 'string',
    },
    {
      name: 'tenantId',
    },
    {
      name: 'keyVal',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.cardsDistribution.model.cardNum`).d('卡片编码'),
      name: 'code',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.cardName`).d('卡片名称'),
      name: 'name',
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
        url: `${SRM_DATA_SDAT}/v1/report-card-distributions/absent-tenant-list`,
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
      label: intl.get(`sdat.cardsDistribution.model.tenantName`).d('租户名称'),
      name: 'tenantName',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
    },
    {
      name: 'cardId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.cardsDistribution.model.tenantName`).d('租户名称'),
      name: 'tenantName',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tenantNum`).d('租户编码'),
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
        url: `${SRM_DATA_SDAT}/v1/data-table-manages/topic-list`,
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
      label: intl.get(`sdat.cardsDistribution.model.themeNum`).d('主题编码'),
      name: 'topicNum',
      // bind: 'topicObj.topicNum',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.themeName`).d('主题名称'),
      name: 'topicName',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.creationDate`).d('创建时间'),
      name: 'createDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.creater`).d('创建人'),
      name: 'creator',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.cardsDistribution.model.themeNum`).d('主题编码'),
      name: 'topicNum',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.themeName`).d('主题名称'),
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
      lovCode: 'SDAT.PLATFORM_TOPIC_LIST',
    },
  ],
  queryFields: [],
  events: {},
});

export { DataFormDS, SubscribeFormDS, LovDS, TentantLovDS, TopicLovDS, AddTopicDS };
