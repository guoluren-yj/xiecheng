import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const tableDs = (billHeaderId) => ({
  selection: false,
  fields: [
    {
      name: 'processUser',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.createdUserName').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get('ssta.settlePool.model.settlePool.submitedDate').d('操作时间'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.action').d('动作'),
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.billLineNum').d('对账单行号'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('ssta.settlePool.model.settlePool.remark').d('说明'),
    },
  ],
  transport: {
    read: () => {
      const url = `/ssta/v1/${organizationId}/bill-actions/${billHeaderId}`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});

export default tableDs;
