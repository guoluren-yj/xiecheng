/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-12-10 11:01:04
 * @LastEditors: yanglin
 * @LastEditTime: 2021-12-13 15:43:15
 */
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
// 订单
const orderDS = (budgetOccupyId) => ({
  autoQuery: true,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get(`sbud.budgeting.model.budgeting.lastUpdateDate`).d('操作时间'),
    },
    {
      name: 'documentTypeMeaning',
      label: intl.get(`sbud.budgeting.model.budgeting.documentTypeMeaning`).d('单据类型'),
    },
    {
      name: 'documentNum',
      label: intl.get(`sbud.budgeting.model.budgeting.documentNum`).d('单据编号'),
    },
    {
      name: 'operatorName',
      label: intl.get(`sbud.budgeting.model.budgeting.operatorName`).d('操作人'),
    },
    {
      name: 'finalizedAmount',
      label: intl.get('sbud.budgeting.model.budgeting.finalizedAmount').d('占用金额'),
    },
    {
      name: 'quantity',
      // type: 'number',
      label: intl.get(`sbud.budgeting.model.budgeting.quantity`).d('数量'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-occupy-sub/${budgetOccupyId}`,
        method: 'GET',
      };
    },
  },
});

export { orderDS };
