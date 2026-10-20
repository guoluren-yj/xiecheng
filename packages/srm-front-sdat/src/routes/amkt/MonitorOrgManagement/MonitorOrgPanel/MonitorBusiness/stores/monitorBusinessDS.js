/**
 * 供应商找关系页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-09-06
 * @Copyright: Copyright (c) 2022, Zhenyun
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
 * 监控列表DS
 * @returns
 */
const MonitorListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/admin-monitor-list`,
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
  primaryKey: 'id',
  selection: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.companyCode').d('企业编码'),
      name: 'enterpriseCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.companyName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.riskLevel').d('风险等级'),
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SDAT.RISK_LEVEL_TYPE',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.riskCount').d('风险事件次数'),
      name: 'eventCount',
      type: 'number',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.monitorStuff').d('监控员'),
      name: 'monitorStuff',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.uscc').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.isErp').d('是否ERP'),
      name: 'erpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.lastScanningTime').d('上次扫描时间'),
      name: 'lastScanTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.failureTime').d('失效时间'),
      name: 'expireDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.isActive').d('是否有效'),
      name: 'effectiveFlag',
      type: 'number',
    },
  ],
  events: {},
});

/**
 * 管理监控人员
 * @returns
 */
const MemberManageDS = () => ({
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
    // create: ({ data }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/manual-add`,
    //     data: data.length ? data[0] : {},
    //     method: 'POST',
    //   };
    // },
    // update: ({ data }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/manual-add`,
    //     data: data[0],
    //     method: 'POST',
    //   };
    // },
    destroy: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/manage-remove-monitor`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  // paging: false,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.userCode').d('编码'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.userName').d('名称'),
      name: 'userName',
      type: 'string',
    },
  ],
  events: {},
});

export { MonitorListDS, MemberManageDS };
