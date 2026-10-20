/*
 * @Date: 2026-08-10 11:52:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getScoreResultSearchDs = ({ evalHeaderId }) => ({
  queryFields: [
    {
      name: 'supplierId',
      type: 'object',
      display: true,
      lovCode: 'SSLM.KPI_DTL_SUPPLIER',
      lovPara: {
        tenantId,
        evalHeaderId,
      },
      label: intl.get(`sslm.common.view.supplier.supplierCompany`).d('供应商'),
    },
    {
      name: 'levelCode',
      label: intl.get('sslm.common.model.archiveFilled.level').d('等级'),
    },
    {
      name: 'rankNum',
      label: intl.get('sslm.common.model.field.rank').d('排名'),
    },
  ],
});
