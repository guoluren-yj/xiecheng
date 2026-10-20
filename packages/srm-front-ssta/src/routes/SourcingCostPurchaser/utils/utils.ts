import type { Record as DSRecord } from "choerodon-ui/dataset";
import { math } from 'choerodon-ui/dataset';

import { isNil, isEmpty, isArray } from 'lodash';

// 区分tabKeys
export function splitTabGroupKeys<U extends string>(allTabKeys: U[]) {
  return allTabKeys.reduce<Record<string, U[]>>((total, item) => {
    if (item.startsWith('tender')) total.tenderKeys.push(item);
    else if (item.startsWith('deposit')) total.depositKeys.push(item);
    else if (item.startsWith('service')) total.serviceKeys.push(item);
    return total;
  }, { tenderKeys: [], depositKeys: [], serviceKeys: [] });
};

// 招标文件费主操作按钮展示逻辑
type TenderActionFlagName = 'payConfirmFlag' | 'invoiceEntryFlag' | 'invoicingFlag' | 'invCancelConfirmFlag' | 'refundConfirmFlag' | 'onlineRefundFlag' | 'sourcingProgressCtrlFlag';

export function tenderActionFlagger(tenderRecord: DSRecord | undefined | null): Record<TenderActionFlagName, boolean> {
  const {
    amount, // 招标文件费金额
    payRule, // 招标文件费支付规则
    paidAmount, // 招标文件费已缴纳金额
    returnRule, // 招标文件费退回规则
    paymentRule, // 招标文件费缴纳规则
    invoiceRule, // 招标文件费开票规则
    tenderFeesStatus, // 招标文件费状态
    tenderFeesPaymentStatus, // 招标文件费缴纳状态
    tenderFeesInvoiceStatus, // 招标文件费开票状态
    uuidDownloadFlag, // 招标文件下载标识
    supplierParticipationFlag, // 供应商可参与标识
  } = tenderRecord?.get([
    'amount',
    'payRule',
    'paidAmount',
    'returnRule',
    'paymentRule',
    'invoiceRule',
    'tenderFeesStatus',
    'tenderFeesPaymentStatus',
    'tenderFeesInvoiceStatus',
    'uuidDownloadFlag',
    'supplierParticipationFlag',
  ]) || {};

  /**
   * 开票 按钮增加显示逻辑，不影响之前的显示
   * 根据缴纳状态为【已缴纳】，招标文件费开票状态=未开票、开票失败, 开票中。退回规则（费用明细里的退回规则）为【免退回】，开票规则=直连开票, 操作列展示【开票】按钮
   * */
  const invoicingViewSourceFlag: boolean = tenderFeesPaymentStatus === "PAID" && ['NO_INVOICE', 'INVOICE_FAIL', 'INVOICING'].includes(tenderFeesInvoiceStatus) && returnRule === 'NO_RETURN' && invoiceRule === 'DIRECT';

  /**
   * 发票录入 按钮增加显示逻辑，不影响之前的显示
   * 根据缴纳状态为【已缴纳】，招标文件费开票状态=未开票、开票失败, 开票中。退回规则（费用明细里的退回规则）为【免退回】，开票规则=手工录入, 操作列展示【开票】按钮
   * */
  const invoiceEntryViewSourceFlag: boolean = tenderFeesPaymentStatus === "PAID" && ['NO_INVOICE', 'INVOICE_FAIL', 'INVOICING'].includes(tenderFeesInvoiceStatus) && returnRule === 'NO_RETURN' && invoiceRule === 'OFFLINE';

  const flagMap: Record<TenderActionFlagName, any> = {
    // 缴纳确认：招标文件费状态=有效、0<=招标文件费已缴纳金额<招标文件费金额、缴纳规则=需缴纳、招标文件费支付规则=采购方人为确认
    payConfirmFlag: tenderFeesStatus === 'EFFECTIVE' && math.gte(paidAmount, 0) && math.gt(amount, paidAmount) && paymentRule === 'NEED_PAYMENT' && payRule === 'OFFLINE_CONFIRM',
    // 发票录入：招标文件费状态=有效、招标文件费缴纳状态=已缴纳、招标文件费开票状态=未开票/开票失败/开票中、招标文件费开票规则=手工录入
    invoiceEntryFlag: (tenderFeesStatus === 'EFFECTIVE' && tenderFeesPaymentStatus === 'PAID' && ['NO_INVOICE', 'INVOICE_FAIL', 'INVOICING'].includes(tenderFeesInvoiceStatus) && invoiceRule === 'OFFLINE') || invoiceEntryViewSourceFlag,
    // 招标文件费状态=有效，招标文件费缴纳状态=已缴纳，招标文件费开票状态=未开票、开票失败，开票规则=直连开票
    invoicingFlag: (
      tenderFeesStatus === 'EFFECTIVE' && tenderFeesPaymentStatus === 'PAID' && ['NO_INVOICE', 'INVOICE_FAIL'].includes(tenderFeesInvoiceStatus) && invoiceRule === 'DIRECT'
    ) || invoicingViewSourceFlag,
    // 取消确认：招标文件费状态=作废、招标文件费开票状态=已开票、退票失败，招标文件费缴纳状态=已退款、招标文件费开票规则=手工录入/直连开票
    invCancelConfirmFlag: tenderFeesStatus === 'INVALID' && ['INVOICED', 'RETURN_INVOICE_FAIL'].includes(tenderFeesInvoiceStatus) && tenderFeesPaymentStatus === 'REFUNDED' && ['OFFLINE', 'DIRECT'].includes(invoiceRule),
    // 退款确认：招标文件费状态=作废、招标文件费缴纳状态=已缴纳/退款失败、退回规则=需退回、招标文件费支付规则=采购方人为确认
    refundConfirmFlag: tenderFeesStatus === 'INVALID' && ['PAID', 'REFUND_FAIL'].includes(tenderFeesPaymentStatus) && returnRule === 'NEED_RETURN' && payRule === 'OFFLINE_CONFIRM',
    // 退款（在线）：招标文件费状态=作废、招标文件费缴纳状态=已缴纳/退款失败、退回规则=需退回、招标文件费支付规则=在线支付（支付宝、微信）
    onlineRefundFlag: tenderFeesStatus === 'INVALID' && ['PAID', 'REFUND_FAIL'].includes(tenderFeesPaymentStatus) && returnRule === 'NEED_RETURN' && payRule === 'ONLINE',
    // 寻源过程控制：招标文件费状态=有效，招标文件费支付规则≠采购方人为确认，「招标文件可下载标识/供应商可参与标识」其一为否（均为是不展示）
    sourcingProgressCtrlFlag: tenderFeesStatus === 'EFFECTIVE' && payRule !== 'OFFLINE_CONFIRM' && !(Number(uuidDownloadFlag) === 1 && Number(supplierParticipationFlag) === 1),
  };
  return flagMap;
};

// 保证金主操作按钮展示逻辑
type DepositActionFlagName = 'payConfirmFlag' | 'returnSupplierFlag' | 'sourcingProgressCtrlFlag';

export function depositActionFlagger(depositRecord: DSRecord | undefined | null): Record<DepositActionFlagName, boolean> {
  const {
    amount, // 保证金金额
    paidAmount, // 保证金已缴纳金额
    returnRule, // 保证金退回规则
    paymentRule, // 保证金缴纳规则
    depositStatus, // 保证金状态
    supplierQuoteFlag, // 供应商可报价标识
    remainingRefundableAmount, // 保证金剩余可退回金额
  } = depositRecord?.get([
    'amount',
    'paidAmount',
    'returnRule',
    'paymentRule',
    'depositStatus',
    'supplierQuoteFlag',
    'remainingRefundableAmount',
  ]) || {};
  const flagMap: Record<DepositActionFlagName, any> = {
    // 缴纳确认：保证金状态=寻源中、保证金已缴纳金额>=0、保证金金额>保证金已缴纳金额、缴纳规则=需缴纳
    payConfirmFlag: depositStatus === 'EFFECTIVE' && math.gte(paidAmount, 0) && math.gt(amount, paidAmount) && paymentRule === 'NEED_PAYMENT',
    // 退回供应商：保证金状态=失效、保证金已缴纳金额>=0，（保证金已缴纳金额—保证金已缴纳金额—保证金已退回金额—保证金已转出金额）＞0，保证金退回规则＝需退回
    returnSupplierFlag: depositStatus === 'INVALID' && math.gte(paidAmount, 0) && math.gt(remainingRefundableAmount, 0) && returnRule === 'NEED_RETURN',
    // 保证金状态=有效，「供应商可报价标识」为否（为是不展示）
    sourcingProgressCtrlFlag: depositStatus === 'EFFECTIVE' && Number(supplierQuoteFlag) !== 1,
  };
  return flagMap;
};

// 服务费主操作按钮展示逻辑
type ServiceActionFlagName = 'payConfirmFlag' | 'invoiceEntryFlag' | 'refundConfirmFlag' | 'amountChangeFlag' | 'revokeAmountChangeFlag';

export function serviceActionFlagger(depositRecord: DSRecord | undefined | null): Record<ServiceActionFlagName, boolean> {
  const {
    amount, // 服务费金额
    paidAmount, // 服务费已缴纳金额
    invoiceRule,
    amountChangeFlag, // 金额变更标识
    serverFeesStatus, // 服务费状态
    serverFeesPaymentStatus, // 服务费缴纳状态
    serverFeesInvoiceStatus, // 服务费开票状态
    remainingRefundableAmount, // 服务费剩余可退回金额
  } = depositRecord?.get([
    'amount',
    'paidAmount',
    'invoiceRule',
    'amountChangeFlag',
    'serverFeesStatus',
    'serverFeesInvoiceStatus',
    'serverFeesPaymentStatus',
    'remainingRefundableAmount',
  ]) || {};
  const flagMap: Record<ServiceActionFlagName, any> = {
    // 缴纳确认：服务费状态=有效、服务费已缴纳金额>=0、服务费金额>服务费已缴纳金额
    payConfirmFlag: serverFeesStatus === 'EFFECTIVE' && math.gte(paidAmount, 0) && math.gt(amount, paidAmount),
    // 发票录入：服务费状态=有效、服务费开票状态=未开票/开票失败/开票中、服务费缴纳状态=已缴纳、服务费开票规则=手工录入
    invoiceEntryFlag: serverFeesStatus === 'EFFECTIVE' && ['NO_INVOICE', 'INVOICE_FAIL', 'INVOICING'].includes(serverFeesInvoiceStatus) && serverFeesPaymentStatus === 'PAID' && invoiceRule === 'OFFLINE',
    // 退回供应商：服务费状态=失效、服务费金额=服务费已缴纳金额，（服务费已缴纳金额-服务费已缴纳金额-服务费已退回金额-服务费已转出金额）>0
    refundConfirmFlag: serverFeesStatus === 'INVALID' && math.eq(amount, paidAmount) && math.gt(remainingRefundableAmount, 0),
    // 金额变更
    amountChangeFlag: Number(amountChangeFlag) === 1,
    // 撤销金额变更：服务费状态=审批拒绝
    revokeAmountChangeFlag: serverFeesStatus === 'APPROVE_REJECT',
  };
  return flagMap;
};

/*
 * 过滤出需要的个性化单元
 * @param {*} codeMap 个性化集合
 * @param {*} codeName 个性化对应集合中存储的名称
 */

export function filterCustomizeCodes(codeMap, codeName) {
  if (!codeName || isEmpty(codeName) || isEmpty(codeMap) || !(codeMap instanceof Map)) return null;

  let currentUnitCode = null as any;

  if (typeof codeName === 'string') {
    currentUnitCode = codeMap.get(codeName);
  }

  if (isArray(codeName)) {
    const codeSet = new Set();
    codeName.forEach(unitCode => {
      codeSet.add(codeMap.get(unitCode));
    });

    currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
  }

  return currentUnitCode;
}
