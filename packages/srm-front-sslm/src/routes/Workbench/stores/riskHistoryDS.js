import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getRiskHistoryDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'lastScanTime',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.ristScanTime').d('风险扫描时间'),
    },
    {
      name: 'riskLevelMeaning',
      label: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
    },
    {
      name: 'fileUrl',
      label: intl.get('sslm.common.view.message.riskReport').d('风险报告'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/sdat/v1/${organizationId}/risk-report-record/risk-scan-history`,
        method: 'GET',
      };
    },
  },
});

export { getRiskHistoryDS };
