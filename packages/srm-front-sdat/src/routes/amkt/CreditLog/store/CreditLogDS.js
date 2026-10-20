/**
 * 风控日志 租户级
 * @date: 2022-09-16
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 事件列表详情 DS
 * @returns
 */
const logListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-operate-log`,
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
  primaryKey: 'logList',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.creditLog.model.operateType').d('操作类型'),
      name: 'operateType',
      type: 'string',
      lookupCode: 'SDAT.RISK_OPERATE_LOG_TYPE',
    },
    {
      label: intl.get('sdat.creditLog.model.enterpriseName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.creditLog.model.socialCode').d('统一社会信用编码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.creditLog.model.businessInfo').d('业务信息'),
      name: 'businessInfo',
    },
    {
      label: intl.get('sdat.creditLog.model.monitorFlag').d('是否监控企业'),
      lookupCode: 'HPFM.FLAG',
      name: 'monitorFlag',
      type: 'string',
    },
    {
      label: intl.get('sdat.creditLog.model.loginName').d('子账户编码'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get('sdat.creditLog.model.operateName').d('操作人'),
      name: 'operateName',
      type: 'string',
    },
    {
      label: intl.get('sdat.creditLog.model.operateTime').d('操作时间'),
      name: 'operateTime',
      type: 'dateTime',
    },
  ],
  queryFields: [
    {
      name: 'enterpriseName',
      type: 'string',
      label: intl.get('sdat.monitorStuff.model.orgNameCode').d('企业名称、统一社会信用代码'),
    },
    {
      name: 'operateType',
      type: 'string',
      label: intl.get(`sdat.creditLog.model.operateType`).d('操作类型'),
      lookupCode: 'SDAT.CREDIT_LOG_TYPE',
    },
    {
      label: intl.get(`sdat.creditLog.model.operateTime`).d('操作时间'),
      name: 'operateTime',
      type: 'range',
    },
  ],
  events: {},
});

export { logListDS };
