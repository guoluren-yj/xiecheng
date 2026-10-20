/*
 * @Date: 2024-08-14 17:15:17
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getRiskScanDs = ({ evalHeaderId } = {}) => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'supplierName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'riskScanning',
      label: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.riskScanDate').d('最新风险扫描时间'),
    },
    {
      name: 'riskLevelMeaning',
      label: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
    },
    {
      name: 'fileUrl',
      label: intl.get('sslm.common.view.common.latestRiskReport').d('最新风险报告'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/eval-line/eval-manage/${evalHeaderId}/risk-scan`,
      method: 'GET',
    },
  },
});
