/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 源单
const tableDS = (workFlag, doubleUnitEnabled) => ({
  primaryKey: 'rcvTrxLineId',
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayStatusCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.displayStatusCode').d('订单行状态'),
    },
    {
      name: 'displayPoNum',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.displayPoNum').d('订单号｜行号'),
    },
    {
      name: 'poTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.poTypeName').d('订单类型'),
    },
    {
      name: 'returnedFlag',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.returnedOrderFlags').d('是否退货订单'),
    },
    {
      name: 'displayLineLocationNum',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.displayLineLocationNum').d('订单发运号'),
    },
    {
      name: 'agentName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },
    {
      name: 'secondaryPoQuantity',
      type: 'number',
      label: intl.get('sinv.receiptWorkbench.model.receipt.secondaryPoQuantity').d('订单数量'),
    },
    {
      name: 'poQuantity',
      type: 'number',
      label: doubleUnitEnabled
        ? intl.get('sinv.receiptWorkbench.model.receipt.poQuantity').d('订单基本数量')
        : intl.get('sinv.receiptWorkbench.model.receipt.secondaryPoQuantity').d('订单数量'),
    },
    {
      name: 'asnStatus',
      type: 'string',
      label: workFlag
        ? intl.get('sinv.receiptWorkbench.model.receipt.slodStatus').d('发货单状态')
        : intl.get('sinv.receiptWorkbench.model.receipt.asnStatus').d('送货单状态'),
    },
    {
      name: 'asnNum',
      type: 'string',
      label: workFlag
        ? intl.get('sinv.receiptWorkbench.model.receipt.slodNum').d('发货单号-行号')
        : intl.get('sinv.receiptWorkbench.model.receipt.asnNum').d('送货单号-行号'),
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: workFlag
        ? intl.get('sinv.purchaseReception.view.message.slodTypeCode').d('发货单类型')
        : intl.get('sinv.purchaseReception.view.message.asnTypeCode').d('送货单类型'),
    },
    {
      name: 'shipQuantity',
      type: 'number',
      label: workFlag
        ? intl.get('sinv.receiptWorkbench.model.receipt.slodShipQuantity').d('发货单数量')
        : intl.get('sinv.receiptWorkbench.model.receipt.shipQuantity').d('送货单数量'),
    },
    {
      name: 'asnQuantity',
      type: 'number',
      label: workFlag
        ? intl.get('sinv.receiptWorkbench.model.receipt.slodQuantity').d('匹配发货单数量')
        : intl.get('sinv.receiptWorkbench.model.receipt.asnQuantity').d('匹配送货单数量'),
    },
    {
      name: 'matchStatusMeaning',
      type: 'string',
      label: workFlag
        ? intl.get('sinv.receiptWorkbench.model.receipt.slodMatchStatusMeaning').d('匹配发货单状态')
        : intl.get('sinv.receiptWorkbench.model.receipt.matchStatusMeaning').d('匹配送货单状态'),
    },
    {
      name: 'pcStatusCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.pcStatusCode').d('协议头状态'),
    },
    {
      name: 'pcNum',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.pcNum').d('协议编号'),
    },
    {
      name: 'pcTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.pcTypeName').d('协议类型'),
    },
    {
      name: 'displayPcLineNum',
      type: 'number',
      label: intl.get('sinv.receiptWorkbench.model.receipt.displayPcLineNum').d('标的行号'),
    },
    {
      name: 'secondaryPcQuantity',
      type: 'number',
      label: intl.get('sinv.receiptWorkbench.model.receipt.secondaryPcQuantity').d('标的数量'),
    },
    {
      name: 'pcQuantity',
      type: 'number',
      label: doubleUnitEnabled
        ? intl.get('sinv.receiptWorkbench.model.receipt.pcQuantity').d('标的基本数量')
        : intl.get('sinv.receiptWorkbench.model.receipt.secondaryPcQuantity').d('标的数量'),
    },
    {
      name: 'stageCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.stageCode').d('阶段编码'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.stageName').d('阶段名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/order-info`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { tableDS };
