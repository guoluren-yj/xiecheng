/* eslint-disable no-param-reassign */
/**
 * 事件采集监控
 */
import intl from 'utils/intl';
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 事件采集监控列表 DS
 * @returns
 */
const ListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const monitorList = data?.monitorDate_range?.split(',') ?? [];
      const dateList = data?.dateProd_range?.split(',') ?? [];

      delete data.monitorDate_range;
      delete data.dateProd_range;

      const monitorStart =
        monitorList && monitorList.length && monitorList[0] ? monitorList[0] : '';
      const monitorEnd =
        monitorList && monitorList.length > 1 && monitorList[1] ? `${monitorList[1]}` : '';
      const startDate = dateList && dateList.length && dateList[0] ? dateList[0] : '';
      const endDate = dateList && dateList.length > 1 && dateList[1] ? `${dateList[1]}` : '';

      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor`,
        params: {
          ...data,
          ...params,
          monitorStart,
          monitorEnd,
          startDate,
          endDate,
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
      label: intl.get('sdat.eventCollectMonitor.view.model.eventExecutionCode').d('事件执行编码'),
      name: 'executeNumber',
      type: 'string',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.riskType').d('风控类别'),
      name: 'riskType',
      type: 'string',
      lookupCode: 'SDAT.MONITOR_RISK_TYPE',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.eventType').d('事务类型'),
      name: 'executeType',
      type: 'string',
      lookupCode: 'SDAT.EVENT_MONITOR_TYPE',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.applicationId').d('应用ID'),
      name: 'appId',
      type: 'string',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.tenantName').d('租户'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.monitorCompany').d('监控企业'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.monitorDate').d('监控日期'),
      name: 'monitorDate',
      type: 'date',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.execuStatus').d('执行状态'),
      name: 'executeStatus',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.startTime').d('执行开始时间'),
      name: 'startDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.endTime').d('执行结束时间'),
      name: 'endDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.triggerType').d('触发类型'),
      name: 'strikeType',
      type: 'string',
      lookupCode: 'SDAT.MONITOR_STRIKE_TYPE',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.parentEventCode').d('父事务编码'),
      name: 'parentNumber',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 执行明细
 * @returns
 */
const ExecuDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-detail`,
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
      label: intl.get('sdat.eventCollectMonitor.view.model.eventDemision').d('事件维度'),
      name: 'eventDimension',
      type: 'string',
      lookupCode: 'SDAT.EVENT_MONITOR_DIMENSION',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.interfaceName').d('接口名称'),
      name: 'method',
      type: 'string',
      lookupCode: 'SDAT.RISK_INTERFACE_LIST',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.execuTime').d('执行时间'),
      name: 'executeDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.execuStatus').d('执行状态'),
      name: 'executeStatus',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
    },
    // {
    //   label: intl.get('sdat.eventCollectMonitor.model.returnParam').d('返回参数'),
    //   name: 'returnParam',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.eventCollectMonitor.model.errorReason').d('失败原因'),
    //   name: 'errorReason',
    //   type: 'string',
    // },
  ],
  queryFields: [
    {
      label: intl.get('sdat.eventCollectMonitor.view.model.interface').d('接口'),
      name: 'method',
      type: 'string',
      lookupCode: 'SDAT.RISK_INTERFACE_LIST',
    },
  ],
  events: {},
});

/**
 * fetchReRun: 重新执行
 * @async
 * @function fetchReRun
 * @param {Object} params - 查询参数
 */
export async function fetchReRun(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/retry`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchParamDetail: 查询返回参数
 * @async
 * @function fetchParamDetail
 * @param {Object} params - 查询参数
 */
export async function fetchParamDetail(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-detail/detail`, {
    method: 'GET',
    query: params,
  });
}

export { ListDS, ExecuDetailDS };
