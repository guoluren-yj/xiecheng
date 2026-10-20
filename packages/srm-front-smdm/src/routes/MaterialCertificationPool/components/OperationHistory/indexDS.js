import { getCurrentOrganizationId } from 'utils/utils';

export const operateDS = ({ itemAuthReqHeaderId }) => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  queryFields: [
    {
      name: 'processType',
      display: true,
      noCache: true,
      type: 'string',
      lookupCode: 'SMDM.ITEM.AUTH.ACTION.STATUS',
      lovPara: { itemAuthReqHeaderId },
      label: intl.get('hzero.common.components.operationAudit.operatedCode').d('操作节点'),
    },
    {
      name: 'processedDateRange',
      type: 'dateTime',
      range: true,
      display: true,
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
    },
    {
      name: 'processUserId',
      type: 'object',
      lovPara: { tenantId: getCurrentOrganizationId() },
      display: true,
      lovCode: 'HIAM.TENANT.USER',
      valueField: 'id',
      textField: 'realName',
      label: intl.get('hzero.common.components.operationAudit.operationBy').d('操作人'),
    },
    {
      name: 'processDirections',
      type: 'string',
      range: true,
      display: true,
      label: intl.get('hzero.common.view.description').d('描述'),
    },
  ],
  fields: [],
});
