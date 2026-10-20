import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ds = (typeMean = '', param = '') => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.orderCode').d('商城订单编码'),
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
      name: 'originalQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.quantity').d('数量'),
    },
    {
      name: 'cancelStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.cancelStatusMeaning').d('取消状态'),
    },
    {
      name: 'cancelExplain',
      type: 'string',
      label: intl.get('smodr.orderLine.model.cancelExplain').d('取消说明'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
    {
      name: 'preemptionStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.preemptionStatusMeaning').d('预占状态'),
    },
    {
      name: 'approveStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.approveStatusMeaning').d('审批状态'),
    },
    {
      name: 'rejectedReason',
      type: 'string',
      label: intl.get('smodr.orderLine.model.approveExplain').d('审批说明'),
    },
    {
      name: 'consignmentCancelQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.cancelQuantity').d('取消数量'),
    },
    {
      name: 'consignmentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.consignmentStatusMeaning').d('配送状态'),
    },
    {
      name: 'shippedTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.shippedTime').d('配送时间'),
    },
    {
      name: 'completedTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.completedTime').d('妥投时间'),
    },
    {
      name: 'receiptStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.receiptStatusMeaning').d('接收状态'),
    },
    {
      name: 'receiptedTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.receiptedTime').d('接收时间'),
    },
    {
      name: 'afterSaleTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.afterSaleTypeMeaning').d('售后类型'),
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
      name: 'kaipiaoStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.kaiPiaoStatusMeaning').d('开票状态'),
    },
    {
      name: 'requestStatus',
      label: intl.get('smodr.orderLine.model.kaiPiaoStatusMeaning').d('开票状态'),
    },
    {
      name: 'consignmentCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.consignmentCode').d('商城配送单编码'),
    },
    {
      name: 'receiptCode',
      type: 'string',
      label: `${intl.get('smodr.orderLine.model.receiptCode').d('商城接收单编码') }-${ intl.get('smodr.orderLine.model.lineCode').d('行号')}`,
    },
    {
      name: 'afterSaleCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.afterSaleCode').d('商城售后单编码'),
    },
    {
      name: 'statementsCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.statementsCode').d('商城对账单编码'),
    },
    {
      name: 'requestNum',
      label: intl.get('smodr.orderLine.model.invoiceCode').d('开票申请单编码'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.orderLine.model.operation').d('操作'),
    },
    {
      name: 'preemptDateTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
    {
      name: 'approveDateTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
    {
      name: 'statementsTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.lastUpdateDate').d('更新时间'),
    },
    {
      name: 'afterSaleTime',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
    {
      name: 'invoiceUpdateDate',
      type: 'dateTime',
      label: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
    {
      name: 'viewQuantityMeaning',
      type: 'string',
      label: typeMean === 'jieshou' ? intl.get('smodr.acceptOrder.model.quantity').d('接收数量') : typeMean === 'shouhou' ? intl.get('smodr.orderLine.model.reQuantity').d('申请数量') : intl.get('smodr.orderLine.model.quantity').d('数量'),
    },
    {
      name: 'invalidQuantity',
      type: 'string',
      label: intl.get('smodr.orderLine.model.invalidQuantity').d('失效数量'),
    },
    {
      name: 'quantityMeaning',
    },
    {
      name: 'cancelReason',
      type: 'string',
      label: intl.get('smodr.orderLine.model.cancelReason').d('取消原因'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('smodr.orderLine.model.aggregatePreemptionDes').d('描述'),
    },
  ],
  transport: {
    read({ data }) {
      const { orderEntryId } = data;
      switch (typeMean) {
        case 'quxiao': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/cancel`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'yuzhan': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/preempt`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'shenpi': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/approve`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'peisong': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/consignment`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'jieshou': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/receipt`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'shouhou': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/aftersale`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'duizhang': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/statements`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        case 'invoice': {
          return {
            url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/invoice`,
            method: 'GET',
            data: { ...data, orderEntryId: orderEntryId || param },
          };
        }
        default: {
          return null;
        }
      }
    },
  },
});

export { ds };
