/* eslint-disable no-param-reassign */
/**
 * 事件更新汇总查询 DS
 */
import intl from 'utils/intl';

// import { getCurrentOrganizationId } from 'utils/utils';
// import { getEnvConfig } from 'utils/iocUtils';
import { PRIVATE_BUCKET } from '_utils/config';
// import { HZERO_IAM } from 'utils/config';
import { SRM_DATA_SDAT } from '@/utils/config';

// const organizationId = getCurrentOrganizationId();

const BUCKET_DIRECTORY = 'sdat-risk-workbench';

/**
 * 企业监控列表
 * @returns
 */
const MonitorListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor/manage-tenant-company`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.eventUpdateSummary.model.appId`).d('应用ID'),
      name: 'appId',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.monitorCompany`).d('监控企业'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.businessLevel`).d('企业风险等级'),
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SDAT.RISK_LEVEL_TYPE',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.monitorStatus`).d('监控状态'),
      name: 'monitorStatus',
      type: 'string',
      lookupCode: 'SDAT.COMPANY_MONITOR_STATUS',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.monitorTime`).d('首次监控时间'),
      name: 'addMonitorTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.removeTime`).d('最后移除时间'),
      name: 'cancelMonitorTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 风险定义列表
 * @returns
 */
const RiskListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor/tenant-risk-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.applicationScope`).d('适用范围'),
      name: 'scope',
      type: 'string',
      lookupCode: 'SDAT.RISK_DEFINITION_SCOPE',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.applicationCompany`).d('适用公司'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.externalRiskItems`).d('外部风险项'),
      name: 'outerCount',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.businessRiskItems`).d('业务风险项'),
      name: 'businessCount',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.disasterRiskItems`).d('灾害风险项'),
      name: 'disasterCount',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.lastUpdateUser`).d('最后更新人'),
      name: 'updateName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.lastUpdateTime`).d('最后更新时间'),
      name: 'updateTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 风险事件列表
 * @returns
 */
const RiskEventListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor/monitor-user-event`,
        params: {
          ...data,
          ...params,
        },
        // data: {
        //   ...data,
        //   ...params,
        // },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.eventUpdateSummary.model.riskEvent`).d('风险事件'),
      name: 'eventNumber',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.riskLevel`).d('风险等级'),
      name: 'eventLevel',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.description`).d('风险描述'),
      name: 'eventName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.generateTime`).d('事件生成时间'),
      name: 'eventTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.dealStatus`).d('处置状态'),
      name: 'status',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.view.model.lastUpdateTime`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
  ],
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
        url: `${SRM_DATA_SDAT}/v1/monitor-company`,
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
 * 操作记录列表
 * @returns
 */
const OperationListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const timeRange = data?.timeArr ?? [];

      delete data.timeArr;

      const startDate =
        timeRange && timeRange.length && timeRange[0]
          ? `${timeRange[0].substring(0, 10)} 00:00:00`
          : '';
      const endDate =
        timeRange && timeRange.length > 1 && timeRange[1]
          ? `${timeRange[1].substring(0, 10)} 23:59:59`
          : '';

      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor/manage-company-log`,
        params: {
          ...data,
          ...params,
          startDate,
          endDate,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.eventUpdateSummary.model.operateType`).d('操作类型'),
      name: 'operateType',
      type: 'string',
      lookupCode: 'SDAT.MONITOR_LOG_TYPE',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.operateName`).d('操作人'),
      name: 'operateName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.operateTime`).d('操作时间'),
      name: 'operateTime',
      type: 'dateTime',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.eventUpdateSummary.model.operateType`).d('操作类型'),
      name: 'operateType',
      type: 'string',
      lookupCode: 'SDAT.MONITOR_LOG_TYPE',
    },
    {
      label: intl.get(`sdat.eventUpdateSummary.model.operateTime`).d('操作时间'),
      name: 'timeArr',
      type: 'date',
      range: true,
    },
  ],
  events: {},
});

export {
  MonitorListDS,
  RiskListDS,
  RiskEventListDS,
  IncidentDetailDS,
  AttachmentDS,
  OperationListDS,
};
