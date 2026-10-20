import intl from 'utils/intl';
// import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  selection: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'thirdOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商订单编码'),
    },
    {
      name: 'orderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.mallPoNumber').d('商城订单编码'),
    },
    {
      name: 'orderTime',
      label: intl.get('smodr.ecBill.model.buyerDate').d('下单时间'),
    },
    {
      name: 'successCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.successCount').d('接口调用成功(次)'),
    },
    {
      name: 'errorCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.errorCount').d('接口调用失败(次)'),
    },
    {
      name: 'supplierMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplierCompany').d('供应商'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smop/v1/record/order/${organizationId}/select`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_ORDER_BAR',
        },
      };
    },
  },
});

const logDS = () => ({
  fields: [
    {
      name: 'interfaceNameMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.interName').d('接口名称'),
    },
    {
      name: 'thirdOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商子订单编码'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
    {
      name: 'inParam',
      type: 'string',
      label: intl.get('smodr.ecBill.model.requestParam').d('请求参数'),
    },
    {
      name: 'outParam',
      type: 'string',
      label: intl.get('smodr.ecBill.model.responseParam').d('响应参数'),
    },
    {
      name: 'billId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.billIdCode').d('电商对账单编码'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.ecBill.model.applicationNo').d('开票申请编码'),
    },
    {
      name: 'deliveryId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.deliveryIdCode').d('电商发货单编码'),
    },
    {
      name: 'afsOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsOrderIdCode').d('电商售后申请单号'),
    },
  ],
});

const deliverDS = () => ({
  selection: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'thirdOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商订单编码'),
    },
    {
      name: 'subOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.subOrderId').d('子订单编码'),
    },
    {
      name: 'deliveryId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.deliveryIdCode').d('电商发货单编码'),
    },
    {
      name: 'successCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.successCount').d('接口调用成功(次)'),
    },
    {
      name: 'errorCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.errorCount').d('接口调用失败(次)'),
    },
    {
      name: 'supplierMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplierCompany').d('供应商'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smop/v1/record/sub/${organizationId}/select/sign`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_SIGN_BAR',
        },
      };
    },
  },
});

const delieveredDS = () => ({
  selection: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'thirdOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商订单编码'),
    },
    {
      name: 'subOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.subOrderId').d('子订单编码'),
    },
    {
      name: 'deliveryId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.deliveryIdCode').d('电商发货单编码'),
    },
    {
      name: 'successCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.successCount').d('接口调用成功(次)'),
    },
    {
      name: 'errorCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.errorCount').d('接口调用失败(次)'),
    },
    {
      name: 'supplierMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplierCompany').d('供应商'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smop/v1/record/sub/${organizationId}/select/delivery`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_SUB_BAR',
        },
      };
    },
  },
});

const afsDS = () => ({
  selection: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'ecAfsApplyId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsApplyId').d('电商售后申请单编码'),
    },
    {
      name: 'successCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.successCount').d('接口调用成功(次)'),
    },
    {
      name: 'errorCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.errorCount').d('接口调用失败(次)'),
    },
    {
      name: 'supplierMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplierCompany').d('供应商'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smop/v1/record/afs/${organizationId}/select`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_AFS_BAR',
        },
      };
    },
  },
});

const stateDS = () => ({
  selection: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'billId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.billIdCode').d('电商对账单编码'),
    },
    {
      name: 'statementsCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.statementsCode').d('商城对账单编码'),
    },
    {
      name: 'successCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.successCount').d('接口调用成功(次)'),
    },
    {
      name: 'errorCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.errorCount').d('接口调用失败(次)'),
    },
    {
      name: 'supplierMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplierCompany').d('供应商'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smop/v1/record/bill/${organizationId}/select`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_BILL_BAR',
        },
      };
    },
  },
});

const invoiceDS = () => ({
  selection: false,
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.ecBill.model.applicationNo').d('开票申请编码'),
    },
    {
      name: 'invoiceId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.invoiceId').d('发票编码'),
    },
    {
      name: 'successCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.successCount').d('接口调用成功(次)'),
    },
    {
      name: 'errorCount',
      type: 'string',
      label: intl.get('smodr.ecBill.model.errorCount').d('接口调用失败(次)'),
    },
    {
      name: 'supplierMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplierCompany').d('供应商'),
    },
    {
      name: 'requestTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smop/v1/record/invoice/${organizationId}/select`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_INVOICE_BAR',
        },
      };
    },
  },
});

const recordDS = (type) => ({
  selection: false,
  // autoQuery: false,
  pageSize: 20,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
    },
    {
      name: 'nameMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.interName').d('接口名称'),
      filter: type === '0',
    },
    {
      name: 'thirdOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商子订单编码'),
    },
    {
      name: 'errorHandle',
      type: 'string',
      label: intl.get('smodr.ecBill.model.questionDispose').d('问题处理方'),
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.failRes').d('失败原因'),
    },
    {
      name: 'time',
      label: intl.get('smodr.ecBill.model.callTime').d('接口调用时间'),
    },
    {
      name: 'billId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.billIdCode').d('电商对账单编码'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.ecBill.model.applicationNo').d('开票申请编码'),
    },
    {
      name: 'deliveryId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.deliveryIdCode').d('电商发货单编码'),
    },
    {
      name: 'afsOrderId',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsOrderIdCode').d('电商售后申请单号'),
    },
  ],
  transport: {
    read({ data }) {
      const { param = {}, ...rest } = data;
      return {
        url: `/smop/v1/record/${type}/${organizationId}/detail`,
        method: 'GET',
        data: {
          ...param,
          ...rest,
          customizeUnitCode: 'SMOP.EC.RECORD.EC_PARAM_BAR',
        },
      };
    },
  },
});

export { tableDS, logDS, deliverDS, delieveredDS, afsDS, stateDS, invoiceDS, recordDS };
