import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import uuidV4 from 'uuid/v4';

const organizationId = getCurrentOrganizationId();

export const ReferTableDS = () => ({
  primaryKey: 'nodeStrategyId',
  autoQuery: true,
  selection: false,
  pageSize: 20,
  paging: true,
  fields: [
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.strategyCode').d('策略编号'),
    },
    {
      name: 'strategyName',
      type: 'intl',
      label: intl.get('sinv.receiptManage.model.receipt.strategyName').d('策略名称'),
    },
    {
      name: 'sourceOrderTypeMeaning',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.sourceOrderType').d('单据来源'),
    },
    {
      name: 'detailMaintain',
      type: 'string',
      label: intl.get('sinv.receiptManage.model.receipt.detailMainShow').d('详情预览'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sinv.receiptManage.model.receipt.enabledFlag').d('启用'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-headers`,
        method: 'GET',
        data: {
          tenantId: 0,
        },
      };
    },
  },
});
