/*
 * @Date: 2025-01-23 15:17:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getAddScorerDS = () => ({
  fields: [
    {
      name: 'addScorer',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      label: intl.get('sslm.common.model.user.account').d('账户'),
    },
  ],
});
