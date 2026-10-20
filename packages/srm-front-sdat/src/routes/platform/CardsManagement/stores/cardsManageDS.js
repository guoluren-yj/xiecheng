/**
 * 卡片管理页面 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-08-09
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 卡片列表 DS
 * @returns
 */
const CardsListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/report-cards`,
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
      label: intl.get(`sdat.cardsManage.model.cardCode`).d('卡片编码'),
      name: 'code',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardName`).d('卡片名称'),
      name: 'name',
      type: 'intl',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardLevel`).d('卡片层级'),
      name: 'level',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_LEVEL',
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
      type: 'string',
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
      type: 'number',
      lookupCode: 'SPFM.ENABLED_FLAG',
    },
    {
      label: intl.get(`sdat.cardsManage.model.remark`).d('描述'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.lastUpdateTime`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.cardsManage.model.cardCodeOrName`).d('卡片编码/名称'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardGroup`).d('卡片分组'),
      name: 'groupCode',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_GROUP',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardType`).d('卡片类型'),
      name: 'type',
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
      label: intl.get(`sdat.cardsManage.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'number',
      lookupCode: 'SPFM.ENABLED_FLAG',
    },
  ],
  events: {},
});

/**
 * 卡片详情 DS
 * @returns
 */
const CardDetailDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  autoCreate: true,
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
    create: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_SDAT}/v1/report-cards`,
        data: {
          ...param,
          enabledFlag: param.enabledFlag || 0,
        },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_SDAT}/v1/report-cards`,
        data: {
          ...param,
          enabledFlag: param.enabledFlag || 0,
        },
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.cardsManage.model.cardCode`).d('卡片编码'),
      name: 'code',
      type: 'string',
      required: true,
      // pattern: '^[a-z][a-z0-9_]*$',
      // format: 'lowercase',
      maxLength: 64,
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardName`).d('卡片名称'),
      name: 'name',
      type: 'intl',
      required: true,
      maxLength: 128,
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardLevel`).d('卡片层级'),
      name: 'level',
      type: 'string',
      required: true,
      lookupCode: 'SDAT.REPORT_CARD_LEVEL',
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardType`).d('卡片类型'),
      name: 'type',
      type: 'string',
      required: true,
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
      required: true,
    },
    {
      label: intl.get(`sdat.cardsManage.model.cardParam`).d('卡片参数'),
      name: 'uriVariables',
      type: 'string',
      maxLength: 500,
    },
    {
      label: intl.get(`sdat.cardsManage.model.projectName`).d('项目名称'),
      name: 'projectObj',
      type: 'object',
      required: true,
      lovCode: 'SDAT.REPORT_PROJECT_LOV_SQL',
    },
    {
      name: 'projectId',
      bind: 'projectObj.value',
    },
    {
      name: 'projectName',
      bind: 'projectObj.meaning',
    },
    {
      label: intl.get(`sdat.cardsManage.model.reportName`).d('报告名称'),
      name: 'reportObj',
      required: true,
      type: 'object',
      lovCode: 'SDAT.REPORT_REPORT',
      cascadeMap: { parentValue: 'projectId' },
    },
    {
      name: 'reportId',
      bind: 'reportObj.value',
    },
    {
      name: 'reportName',
      bind: 'reportObj.meaning',
    },
    {
      label: intl.get(`sdat.cardsManage.model.initialSize`).d('初始尺寸'),
      name: 'initSize',
      type: 'string',
      required: true,
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
      type: 'intl',
      maxLength: 128,
    },
  ],
  events: {},
});

/**
 * 卡片操作历史 DS
 * @returns
 */
const CardHistoryDS = () => ({
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

/**
 * 分发租户列表 DS
 * @returns
 */
const DistribTableDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/template`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/svg-template`,
        data,
        method: 'DELETE',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.cardsManage.model.tenantCode`).d('租户编码'),
      name: 'tenantCode',
      bind: 'tenantObj.tenantCode',
    },
    {
      label: intl.get(`sdat.cardsManage.model.tenantName`).d('租户名称'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SDAT.REPORT_PROJECT_LOV_SQL',
      required: true,
      ignore: 'always',
    },
    {
      name: 'tenantName',
      bind: 'tenantObj.tenantName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.cardsManage.model.tenantCode`).d('租户编码'),
      name: 'tenantCode',
      type: 'string',
    },
  ],
  events: {},
});

export { CardsListDS, CardDetailDS, CardHistoryDS, DistribTableDS };
