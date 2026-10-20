/*
 * @Date: 2023-08-24 15:43:20
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getQueryParams = key => {
  switch (key) {
    case 'tenantApproval':
      return {
        unitCode: [
          'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_APPROVAL_SEARCH_BAR',
          'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_APPROVAL_TABLE',
        ],
      };
    case 'platformConfirm':
      return {
        unitCode: [
          'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_CONFIRM_SEARCH_BAR',
          'SSLM.ENTERPRISE_TENANT_APPROVAL.LIST_CONFIRM_TABLE',
        ],
      };
    default:
      return {};
  }
};

export const getListDS = (key = 'tenantApproval') => ({
  pageSize: 20,
  cacheSelection: true,
  dataToJSON: 'selected',
  primaryKey: 'changeConfirmId',
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl.get('sslm.enterpriseInform.model.application.status').d('状态'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'changeReqNumber',
      label: intl.get('sslm.enterpriseInform.model.application.changeReqNumber').d('申请单号'),
    },
    {
      name: 'changeLevelMeaning',
      label: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.enterpriseInform.model.application.companyNum').d('企业编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
    },
    {
      name: 'submitDate',
      type: 'dateTime',
      label: intl.get('sslm.enterpriseInform.model.application.submitTime').d('提交时间'),
    },
    {
      label: intl.get('sslm.enterpriseInform.model.application.lastProcessTime').d('最后处理时间'),
      name: 'lastProcessTime',
      type: 'dateTime',
    },
  ],
  transport: {
    read: ({ params }) => {
      const url =
        key === 'tenantApproval'
          ? `${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/new`
          : `${SRM_SSLM}/v1/${organizationId}/firm-change-confirms/platform-tenant-confirm-list-new`;
      const { unitCode = [] } = getQueryParams(key);
      return {
        url,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode: unitCode.join(','),
        },
      };
    },
  },
});

// 审批弹窗
export const approvalModalDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'approvalOpinion',
      label: intl.get('sslm.enterpriseInform.model.application.approvalOpinion').d('审批意见'),
    },
  ],
});
