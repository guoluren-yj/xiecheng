/**
 * 监控与分析-平台级 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-02-11
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 监控分析
 * @returns
 */
const DataDisplayDS = () => ({
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
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncStatus`).d('同步状态'),
      name: 'status',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncMode`).d('同步模式'),
      name: 'syncMode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncDate`).d('同步日期'),
      name: 'syncDate',
      type: 'date',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.dataSubject`).d('数据主题'),
      name: 'busiDomain',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.tableName`).d('数据表名'),
      name: 'sourceTable',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.startTime`).d('开始时间'),
      name: 'bgnSyncTs',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.endTime`).d('结束时间'),
      name: 'endSyncTs',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncTakesTime`).d('同步耗时'),
      name: 'durationMs',
      type: 'number',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.readLines`).d('读出行数'),
      name: 'readRows',
      type: 'number',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.writeLines`).d('写入行数'),
      name: 'writeRows',
      type: 'number',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.writeAmount`).d('写入数据量'),
      name: 'writeAmount',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.updateSchema`).d('表结构变更'),
      name: 'updateSchema',
      type: 'boolean',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * Lov
 * @returns
 */
const DataDisplayLovDS = () => ({
  transport: {},
  primaryKey: 'tenantId',
  fields: [
    {
      name: 'tenantVal',
      textField: 'tenantName',
      valueField: 'tenantNum',
      type: 'object',
      noCache: true,
      lovCode: 'SDAT.DATA_DISPLAY_TENTANT_LIST',
      lovQueryAxiosConfig: () => {
        return {
          url: `${SRM_DATA_SDAT}/v1/monitor-analysis/open-service-tenant-list`,
          method: 'GET',
        };
      },
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 文件同步DS
 * @returns
 */
const FileSyncDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/monitor-analysis/seep-invoke/${data.ruleCode}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncStatus`).d('同步状态'),
      name: 'status',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncMode`).d('同步模式'),
      name: 'syncMode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncDate`).d('同步日期'),
      name: 'sync_date',
      type: 'date',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.fileName`).d('文件名'),
      name: 'file_name',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.fileType`).d('文件类型'),
      name: 'fileType',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.fileSize`).d('文件大小'),
      name: 'file_size',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncAddress`).d('同步地址'),
      name: 'storage_path',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.fileSyncMode`).d('同步方式'),
      name: 'sync_type',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.startTime`).d('开始时间'),
      name: 'sync_bgn_ts',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.endTime`).d('结束时间'),
      name: 'sync_end_ts',
      type: 'string',
    },
    {
      label: intl.get(`sdps.cloudWarehouse.model.syncTakesTime`).d('同步耗时'),
      name: 'duration_ms',
      type: 'number',
    },
  ],
  queryFields: [],
  events: {},
});

export { DataDisplayDS, DataDisplayLovDS, FileSyncDS };
