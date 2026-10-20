/**
 * @author biao.zhu@going-link.com
 * @since 2021-07-15 16:41:25
 * @lastTime 2021-07-15 16:44:33
 * @description 收货工作台-流程DS
 * @copyright Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tableDS = (doubleUnitEnabled) => ({
  primaryKey: 'rcvTrxLineId',
  selection: false,
  pageSize: 1000,
  fields: [
    {
      name: 'displayTrxHeaderAndLineNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNums')
        .d('收货单号-行号'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型'),
    },
    // {
    //   name: 'reverseFlag',
    //   type: 'string',
    //   label: intl.get('sinv.receiptWorkbench.model.receipt.reverseFlag').d('是否冲销'),
    // },
    {
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'secondaryQuantity',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.receipt.amount`).d('数量'),
    },
    {
      name: 'quantity',
      type: 'string',
      label: doubleUnitEnabled
        ? intl.get(`sinv.receiptWorkbench.model.receipt.baseAmount`).d('基本数量')
        : intl.get(`sinv.receiptWorkbench.model.receipt.amount`).d('数量'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.taxIncludedAmount').d('执行金额(含税)'),
    },
    {
      name: 'trxDate',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.trxDate').d('实际操作日期'),
    },
    // {
    //   name: 'rcvStatusCodeMeaning',
    //   type: 'string',
    //   label: intl.get('sinv.receiptWorkbench.model.receipt.rcvStatusCodeMeaning').d('事务状态'),
    // },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/source/node-trx/list`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { tableDS };
