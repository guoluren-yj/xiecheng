/**
 * 数据表管理DS 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-03-07
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 卡片详情 DS
 * @returns
 */
const MetadataDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/report-cards/${data.cardId}`,
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
      label: intl.get(`sdat.cardsManage.model.cardCode`).d('卡片编码'),
      name: 'code',
      type: 'string',
      pattern: '^[a-z][a-z0-9_]*$',
      maxLength: 64,
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardName`).d('卡片名称'),
      name: 'name',
      type: 'intl',
      maxLength: 128,
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardType`).d('卡片类型'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_TYPE',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardGroup`).d('卡片分组'),
      name: 'groupCode',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_GROUP',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardSort`).d('卡片排序'),
      name: 'orderSeq',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardParam`).d('卡片参数'),
      name: 'uriVariables',
      type: 'string',
      maxLength: 500,
    },
    {
      label: intl.get(`sdat.cardsManage.model.projectName`).d('项目名称'),
      name: 'projectId',
      type: 'string',
      lookupCode: 'SDAT.REPORT_PROJECT',
    },
    {
      label: intl.get(`sdat.cardsManage.model.reportName`).d('报告名称'),
      name: 'reportId',
      lookupCode: 'SDAT.REPORT_REPORT',
      cascadeMap: { parentValue: 'projectId' },
    },
    {
      label: intl.get(`sdat.cardsManage.model.initialSize`).d('初始尺寸'),
      name: 'initSize',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_SIZE_LIST',
    },
    {
      label: intl.get(`sdat.cardsManage.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`sdat.cardsManage.model.remark`).d('描述'),
      name: 'remark',
      type: 'string',
      maxLength: 500,
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
            url: `${SRM_DATA_SDAT}/v1/meta-table/columns?cardId=${record.get('cardId')}`,
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
      label: intl.get(`sdat.cardsDistribution.model.isIncludeZero`).d('tenant_id是否包含0'),
      name: 'isIncludeZero',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
    },
    {
      name: 'cardId',
    },
    {
      name: 'tableName',
    },
  ],
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
        url: `${SRM_DATA_SDAT}/v1/report-card-distributions/present-tenant-list`,
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
      label: intl.get(`sdat.cardsDistribution.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tenantName`).d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.districtDate`).d('分发时间'),
      name: 'operateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.operator`).d('操作人'),
      name: 'operateUserName',
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
        url: `${SRM_DATA_SDAT}/v1/operate-logs`,
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
      label: intl.get(`sdat.cardsDistribution.model.tenantNum`).d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsDistribution.model.tenantName`).d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.operationType`).d('操作类型'),
      name: 'operateType',
      type: 'string',
      lookupCode: 'SDAT.REPORT_OPERATE_TYPE',
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
  events: {},
});

export { MetadataDS, TenantSubscripDS, StandarPlatFormDS, SubHistoryDS };
