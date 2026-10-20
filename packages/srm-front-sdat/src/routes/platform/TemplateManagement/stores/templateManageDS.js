/**
 * 卡片管理页面 租户级
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-10-21
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 模板列表 DS
 * @returns
 */
const TemplateListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/report-cockpit-templates`,
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
        url: `${SRM_DATA_SDAT}/v1/report-cockpit-templates`,
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
        url: `${SRM_DATA_SDAT}/v1/report-cockpit-templates`,
        data: {
          ...param,
          enabledFlag: param.enabledFlag || 0,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.templateManage.model.templateCode`).d('模板编码'),
      name: 'code',
      type: 'string',
      required: true,
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      maxLength: 64,
    },
    {
      label: intl.get(`sdat.templateManage.model.templateName`).d('模板名称'),
      name: 'name',
      type: 'intl',
      required: true,
      maxLength: 128,
    },
    {
      label: intl.get(`sdat.templateManage.model.templateLevel`).d('模板层级'),
      name: 'level',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_LEVEL',
      required: true,
    },
    {
      label: intl.get(`sdat.templateManage.model.group`).d('模板分组'),
      name: 'groupCode',
      type: 'string',
      lookupCode: 'SDAT.REPORT_TEMPLATE_GROUP',
      required: true,
    },
    {
      label: intl.get(`sdat.templateManage.model.tenant`).d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SDAT.ALL_TENANT_LIST',
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('level') === 'org';
        },
      },
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantObj.tenantName',
    },
    {
      label: intl.get(`sdat.templateManage.model.userInfo`).d('用户'),
      name: 'previewLoginName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`sdat.templateManage.model.templateRemark`).d('模板注释'),
      name: 'description',
      type: 'intl',
      maxLength: 500,
    },
    {
      label: intl.get(`sdat.templateManage.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'number',
      lookupCode: 'SPFM.ENABLED_FLAG',
    },
    {
      name: 'defaultFlag',
      label: intl.get(`sdat.templateManage.model.isDefault`).d('是否默认'),
      type: 'number',
    },
    {
      name: 'orderSeq',
      label: intl.get(`hzero.common.status.orderSeq`).d('排序'),
      type: 'number',
      // required: true,
      defaultValue: 0,
    },
  ],
  events: {},
});

/**
 * 模板详情 DS
 * @returns
 */
const TemplateDetailDS = () => ({
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
      label: intl.get(`sdat.templateManage.model.templateCode`).d('模板编码'),
      name: 'code',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`sdat.templateManage.model.templateName`).d('模板名称'),
      name: 'name',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`sdat.templateManage.model.templateLevel`).d('模板层级'),
      name: 'level',
      type: 'string',
      lookupCode: 'SDAT.REPORT_CARD_LEVEL',
      required: true,
    },
    {
      label: intl.get(`sdat.templateManage.model.tenant`).d('租户'),
      name: 'tenantObj',
      type: 'object',
      required: true,
      lovCode: 'SDAT.ALL_TENANT_LIST',
      ignore: 'always',
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      label: intl.get(`sdat.templateManage.model.templateRemark`).d('模板注释'),
      name: 'description',
      type: 'intl',
    },
    {
      label: intl.get(`sdat.templateManage.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'number',
      lookupCode: 'SPFM.ENABLED_FLAG',
    },
  ],
  events: {},
});

/**
 * 卡片操作历史 DS
 * @returns
 */
const HistoryDS = () => ({
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
      label: intl.get(`sdat.templateManage.model.operationType`).d('操作类型'),
      name: 'operateType',
      type: 'string',
      lookupCode: 'SDAT.REPORT_OPERATE_TYPE',
    },
    {
      label: intl.get(`sdat.templateManage.model.operationTime`).d('操作时间'),
      name: 'operateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.templateManage.model.operator`).d('操作人'),
      name: 'operateUserName',
    },
  ],
  events: {},
});

export { TemplateListDS, TemplateDetailDS, HistoryDS };
