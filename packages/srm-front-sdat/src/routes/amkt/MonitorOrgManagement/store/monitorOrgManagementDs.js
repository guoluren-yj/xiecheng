/**
 * 监控企业管理 租户级
 * @date: 2022-09-13
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';

const BUCKET_DIRECTORY = 'sdat-risk-workbench';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 数据详情 DS
 * @returns
 */
const stuffListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/user-list`,
        params: {
          ...data,
          ...params,
          ...passParams,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'stuffList',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.stuffList.enterpriseName').d('企业名称'),
      name: 'EnterpriseName',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 事件列表
 * @returns
 */
const EventListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/customer-risk-events/manager-event`,
        params: {
          ...data,
          ...params,
          // ...passParams,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  selection: false,
  fields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.riskEventName').d('风险事件'),
      name: 'eventNumber',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.riskLevel').d('风险级别'),
      name: 'eventLevel',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.eventType').d('风险类型'),
      name: 'eventType',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.riskDesc').d('风险描述'),
      name: 'eventName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.collectionTime').d('采集时间'),
      name: 'eventTime',
      type: 'dateTime',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 风险事件详情 弹窗 DS
 * @returns
 */
const IncidentDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company`,
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
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.enterpriseCode').d('企业编码'),
      name: 'enterpriseCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.enterpriseName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.outerRiskLevels').d('外部风险等级'),
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SDAT.RISK_LEVEL_TYPE',
      help: intl
        .get('sdat.monitorBusiness.view.model.tooltip')
        .d('风险等级评估来自于企业资信服务商企查查'),
    },
    {
      label: intl.get('sdat.monitorBusiness.model.socialCode').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.isErp').d('是否ERP'),
      name: 'erpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('sdat.monitorBusiness.model.lastScanningTimes').d('上次扫描时间'),
      name: 'lastScanTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.registerAppTime').d('注册平台时间'),
      name: 'registerTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.riskCount').d('风险事件次数'),
      name: 'countInfo',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.monthCount').d('近30天中标次数及金额'),
      name: 'monthCount',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.monthOrderCount').d('近30天订单数量及金额'),
      name: 'monthOrder',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.lastAppraisal').d('上一次考评绩效'),
      name: 'scoreAndTime',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.riskEventAttach`).d('风险事件附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 附件信息 DS
 * @returns
 */
const AttachmentDS = () => ({
  transport: {},
  pageSize: 10,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.riskEventAttach`).d('风险事件附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 挖掘详情
 * @returns
 */
const MiningDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/customer-risk-events/manager-event`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  selection: false,
  fields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.businessNo').d('业务单号'),
      name: 'eventNumber',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.supplier').d('供应商'),
      name: 'supplier',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.associationType').d('关联类型'),
      name: 'associationType',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.subAccount').d('子账户'),
      name: 'subAccount',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.subAccountName').d('子账户名称'),
      name: 'subAccountName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.callTime').d('调用时间'),
      name: 'callTime',
      type: 'dateTime',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.supplier').d('供应商'),
      name: 'supplier',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.subAccount').d('子账户'),
      name: 'subAccount',
      type: 'string',
    },
  ],
  events: {},
});

export { stuffListDS, EventListDS, IncidentDetailDS, AttachmentDS, MiningDetailDS };
