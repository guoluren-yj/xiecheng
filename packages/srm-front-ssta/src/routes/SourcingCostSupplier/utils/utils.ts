import type { Record as DSRecord } from "choerodon-ui/dataset";
import { math } from 'choerodon-ui/dataset';

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
type TenderActionFlagName = 'payFlag' | 'payConfirmFlag' | 'invoicingFlag' | 'downloadFlag';
export function tenderActionFlagger(tenderRecord: DSRecord | undefined | null): Record<TenderActionFlagName, boolean> {
  const {
    amount, // 招标文件费金额
    payRule, // 招标文件费支付规则
    paidAmount, // 招标文件费已缴纳金额
    paymentRule, // 缴纳规则
    invoiceRule, // 招标文件费开票规则
    uuidDownloadFlag, // 招标文件费下载节点
    tenderFeesStatus, // 招标文件费状态
    tenderFeesPaymentStatus, // 招标文件费缴纳状态
    tenderFeesInvoiceStatus, // 招标文件费开票状态
    returnRule, // 招标文件费退回规则
  } = tenderRecord?.get([
    'amount',
    'payRule',
    'paidAmount',
    'paymentRule',
    'invoiceRule',
    'uuidDownloadFlag',
    'tenderFeesStatus',
    'tenderFeesPaymentStatus',
    'tenderFeesInvoiceStatus',
    'returnRule',
  ]) || {};

  /**
   * 开票 按钮增加显示逻辑，不影响之前的显示
   * 根据缴纳状态为【已缴纳】，开票状态为【未开票】退回规则（费用明细里的退回规则）为【免退回】，操作列展示【开票】按钮
   * */
  const invoicingViewSourceFlag: boolean = tenderFeesPaymentStatus === "PAID" && ['NO_INVOICE', 'INVOICE_FAIL'].includes(tenderFeesInvoiceStatus) && returnRule === 'NO_RETURN';

  const flagMap: Record<TenderActionFlagName, any> = {
    // 缴纳： 招标文件费状态=有效、招标文件费缴纳状态=未缴纳/缴纳失败、招标文件费支付规则=在线支付（支付宝、微信）
    payFlag: tenderFeesStatus === 'EFFECTIVE' && ['NO_PAY', 'PAY_FAIL'].includes(tenderFeesPaymentStatus) && payRule === 'ONLINE',
    // 招标文件费状态=有效，0<=招标文件费已缴纳金额<招标文件费金额、招标文件费支付规则=采购方人为确认、缴纳规则=需缴纳
    payConfirmFlag: tenderFeesStatus === 'EFFECTIVE' && math.gte(paidAmount, 0) && math.gt(amount, paidAmount) && paymentRule === 'NEED_PAYMENT' && payRule === 'OFFLINE_CONFIRM',
    // 后端提供的
    invoicingFlag: (
      tenderFeesStatus === 'EFFECTIVE' && invoiceRule === 'DIRECT' && tenderFeesPaymentStatus === 'PAID' && ['NO_INVOICE', 'INVOICE_FAIL'].includes(tenderFeesInvoiceStatus)
    ) || invoicingViewSourceFlag,
    // 后端提供的
    downloadFlag: uuidDownloadFlag,
  };
  return flagMap;
};

// 保证金主操作按钮展示逻辑
type DepositActionFlagName = 'payConfirmFlag' | 'returnSupplierFlag';
export function depositActionFlagger(tenderRecord: DSRecord | undefined | null): Record<DepositActionFlagName, boolean> {
  const {
    amount, // 招标文件费金额
    paidAmount, // 招标文件费已缴纳金额
    returnRule,
    paymentRule, // 缴纳规则
    depositStatus,
    remainingRefundableAmount,
  } = tenderRecord?.get([
    'amount',
    'payRule',
    'returnRule',
    'paidAmount',
    'paymentRule',
    'depositStatus',
    'remainingRefundableAmount',
  ]) || {};
  const flagMap: Record<DepositActionFlagName, any> = {
    // 保证金状态=有效，0<=保证金已缴纳金额<保证金金额、缴纳规则=需缴纳
    payConfirmFlag: depositStatus === 'EFFECTIVE' && math.gte(paidAmount, 0) && math.gt(amount, paidAmount) && paymentRule === 'NEED_PAYMENT',
    // 保证金状态=失效, 保证金已缴纳金额>=0，（保证金已缴纳金额-保证金已缴纳金额-保证金已退回金额-保证金已转出金额）>0，保证金退回规则=需退回
    returnSupplierFlag: depositStatus === 'INVALID' && math.gte(paidAmount, 0) && math.gt(remainingRefundableAmount, 0) && returnRule === 'NEED_RETURN',
  };
  return flagMap;
};