import type { DocType } from "./storeDS";

export enum TaxInvoiceCuszCode {
  BasicFormCode = 'SFIN.INVOICE_UPDATE_DETAIL.INV_HEAD_BASIC', // 基本信息
  BuyerFormCode = 'SFIN.INVOICE_UPDATE_DETAIL.INV_HEAD_BUYER', // 购买人信息
  SellerFormCode = 'SFIN.INVOICE_UPDATE_DETAIL.INV_HEAD_SELLER', // 销售人信息
  OtherFormCode = 'SFIN.INVOICE_UPDATE_DETAIL.INV_HEAD_OTHER', // 其他信息
  LineGridCode = 'SFIN.INVOICE_UPDATE_DETAIL.INV_LINE_GRID', // 行信息
}

// 税务发票个性化还没配置，先写上占位
export enum InvoiceCheckCuszCode {
  BasicFormCode = 'SFIN.INVOICE_CHECK.INV_HEAD_BASIC', // 基本信息
  BuyerFormCode = 'SFIN.INVOICE_CHECK.INV_HEAD_BUYER', // 购买人信息
  SellerFormCode = 'SFIN.INVOICE_CHECK.INV_HEAD_SELLER', // 销售人信息
  OtherFormCode = 'SFIN.INVOICE_CHECK.INV_HEAD_OTHER', // 其他信息
  LineGridCode = 'SFIN.INVOICE_CHECK.INV_LINE_GRID', // 行信息
}

export const getCuszCode = (docType: DocType) => {
  if (docType === 'taxInvoice') {
    return TaxInvoiceCuszCode;
  } else {
    return InvoiceCheckCuszCode;
  }
};