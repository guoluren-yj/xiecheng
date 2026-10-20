/**
 * 风险工作台
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-06
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { SRM_DATA_SDAT } from '@/utils/config';

const organizationId = getCurrentOrganizationId();
const BUCKET_DIRECTORY = 'sdat-risk-workbench';

/**
 * 风险事件详情 弹窗 DS
 * @returns
 */
const IncidentDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/monitor-company`,
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
      label: intl.get(`sdat.riskDefinition.model.dealWithAttach`).d('处置附件'),
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
      // label: intl.get(`sdat.riskDefinition.model.riskEventAttach`).d('风险事件附件'),
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
 * 风险广播 DS
 * @returns
 */
const BroadcastDS = () => ({
  transport: {},
  pageSize: 10,
  fields: [
    {
      label: intl.get(`sdat.riskControl.model.broadcastContent`).d('广播内容'),
      name: 'processReason',
      type: 'string',
    },
  ],
  events: {},
});

export { IncidentDetailDS, AttachmentDS, BroadcastDS };
