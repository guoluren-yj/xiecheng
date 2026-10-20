
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryBatchApprovaFlag } from '_utils/utils';

const organizationId = getCurrentOrganizationId();

const initDs = () => ({
  primaryKey: 'orderEntryId',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'orderCodeLine',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderCodeAndLineNum').d('商城订单编码-行号'),
    },
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.entryCode').d('商品行号'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.agreementBusinessTypeMeaning').d('协议类型'),
    },
    {
      name: 'originalQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.quantity').d('数量'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get('smodr.orderLine.model.uomName').d('单位'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.taxRateMeaning').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unitPriceTaxNew').d('单价(含税)'),
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.orderLine.model.per').d('每'),
    },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unUnitPriceTaxNewer').d('单价(不含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.paidAmountTaxNew').d('行金额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.nakedPriceNewer').d('行金额(不含税)'),
    },
    {
      name: 'cancelStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.cancelStatusMeaning').d('取消状态'),
    },
    {
      name: 'preemptionStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.aggregatePreemptionStatusMeaning').d('预占状态'),
    },
    {
      name: 'approveStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.aggregateApproveStatusMeaning').d('审批状态'),
      width: 150,
    },
    {
      name: 'shipmentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.aggregateShipmentStatusMeaning').d('配送状态'),
    },
    {
      name: 'receiveStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.aggregateReceiveStatusMeaning').d('接收状态'),
    },
    {
      name: 'afterSaleStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.asStatusMeaning').d('售后状态'),
    },
    {
      name: 'statementsStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.aggregateStatementsStatusMeaning').d('对账状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      label: intl.get('smodr.orderLine.model.kaiPiaoStatusMeaning').d('开票状态'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.buyerName').d('下单人'),
    },
    {
      name: 'cecCreatedTime',
      type: 'dateTime',
      label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.supplierCompany').d('供应商'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.orderLine.model.operation').d('操作'),
    },
    {
      name: 'unitCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unitCode').d('部门编码'),
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unitName').d('部门名称'),
    },
    {
      label: intl.get('smodr.orderLine.model.docFlow').d('单据流'),
      type: 'string',
      name: 'docFlow',
    },
    {
      name: 'orderSourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderSourceFrom').d('来源单据'),
    },
    {
      name: 'sourceOrderCodeLine',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderSourceLineNum').d('来源单据号-行号'),
    },
    {
      name: 'orderMarkMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderSign').d('订单标识'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuTypeMeaning').d('商品类型'),
    },
    {
      name: 'exportStatus',
      type: 'string',
      label: intl.get('smodr.orderLine.model.synchronizationStatus').d('同步状态'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.ENTRY.QUERY,SMODR.ORDER.ENTRY.SELECT' },
      };
    },
  },
});

const wholeDs = () => ({
  primaryKey: 'orderId',
  cacheSelection: true,
  cacheModified: false,
  modifiedCheck: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.orderLine.model.operation').d('操作'),
    },
    {
      name: 'showOrderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.status').d('状态'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'orderTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderTypeMeaning').d('订单类型'),
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.agreementBusinessTypeMeaning').d('协议类型'),
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.paymentType').d('支付方式'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.currencyCode').d('币种'),
    },
    {
      name: 'productAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.proAmountTax').d('商品金额(含税)'),
    },
    {
      name: 'extraCostAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.extraAmountMeaningTax').d('附加费金额(含税)'),
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.ordMoneyTax').d('订单金额(含税)'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.buyerName').d('下单人'),
    },
    {
      name: 'unitCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unitCode').d('部门编码'),
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unitName').d('部门名称'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.supplierCompany').d('供应商'),
    },
    {
      name: 'cecCreatedTime',
      type: 'dateTime',
      label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/orders/order-list`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.ENTRY.HEADER.QUERY,SMODR.ORDER.ENTRY.DETAIL' },
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const keys = dataSet.reduce((pre, record) => {
        const { approveType, showOrderStatus, approveMethod, batchNum, orderCode } = record.get(['approveType', 'showOrderStatus', 'approveMethod', 'batchNum', 'orderCode']);
        const _businessKey = approveMethod === 'BATCH' ? batchNum : orderCode;
        // 工作流审批且状态为审批中
        if(approveType === 'WORKFLOW_APPROVAL' && showOrderStatus === 'APPROVING' && _businessKey) {
          pre.push(_businessKey);
        }
        return pre;
      }, []);
      if(isEmpty(keys)) return;
      const map = getResponse(await queryBatchApprovaFlag(keys));
      dataSet.forEach(record => {
        const { approveMethod, batchNum, orderCode } = record.get(["approveMethod", "batchNum", "orderCode"]);
        const _businessKey = approveMethod === 'BATCH' ? batchNum : orderCode;
        // 审批按钮标识
        record.init({
          wflApproveFlag: Number(!!map[_businessKey]),
          ...(map[_businessKey] || {}),
        });
      });
    },
  },
});

const receiveDs = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuInfo').d('商品信息'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('smodr.orderLine.model.useQuantity').d('可领用数量'),
    },
    {
      name: 'deliveryQuantity',
      type: 'number',
      label: intl.get('smodr.orderLine.model.deliveryQuantity').d('已领用数量'),
    },
    {
      name: 'remainUseQuantity',
      type: 'number',
      label: intl.get('smodr.orderLine.model.remainUseQuantity').d('剩余领用数量'),
    },
    {
      name: 'thisUseQuantity',
      type: 'number',
      label: intl.get('smodr.orderLine.model.thisUseQuantity').d('此次领用数量'),
      required: true,
    },
  ],
  // transport: {
  //   validate({ data, params, dataSet }) {
  //     console.log(data, params, dataSet);
  //   },
  // },
});

export { initDs, wholeDs, receiveDs };
