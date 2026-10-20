/*
 * @Description:
 * @Date: 2020-08-11 11:16:22
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { amountFormatterOptions } from '@/utils/utils';

const hxDS = ({ url, pk, urlPramas = false }) => ({
  selection: false,
  primaryKey: 'actionId',
  pageSize: 20,
  // table显示的字段
  fields: [
    {
      name: 'settleTransactionNum',
      type: 'string',
      label: intl
        .get('hzero.common.components.operationAudit.settleTransactionNum')
        .d('结算事务编号'),
    },
    {
      name: 'settleNum',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.settleNum').d('关联结算单号'),
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.lineNum').d('关联结算行号'),
    },
    {
      name: 'applyAmount',
      type: 'number',
      label: intl.get('hzero.common.components.operationAudit.applyAmount').d('核销金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'settleStatusMeaning',
      type: 'string',
      label: intl
        .get('hzero.common.components.operationAudit.settleStatusMeaning')
        .d('关联结算单状态'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { [pk]: pkv = '' } = data;
      if (urlPramas) {
        return {
          url: `${url}${pkv}`,
          method: 'GET',
          data: {},
        };
      } else {
        return {
          url,
          method: 'GET',
          data: { [pk]: pkv },
        };
      }
    },
  },
});

export { hxDS };
