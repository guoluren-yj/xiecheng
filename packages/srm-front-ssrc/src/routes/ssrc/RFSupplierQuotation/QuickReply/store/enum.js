/** 快速回复 activetity 集合 如果要修改value,key也要修改和value含义一样 */

export const QRActivityMap = {
  PROCESSING: 'processing', // 待处理
  PROCESSED: 'processed', // 已处理
  QRALL: 'qrAll', // 全部
};

/**
 * 阶梯报价来源
 * headerEdit 报价弹窗-头编辑【阶梯报价】
 * lineView 报价弹窗-报价历史-【阶梯报价】
 * headerView 查看报价弹窗-头查看【阶梯报价】
 */

export const LadderSourceStatus = {
  HEADER_EDIT: 'headerEdit',
  HEADER_VIEW: 'headerView',
  LINE_VIEW: 'lineView',
};

/**
 * 快速回复个性化-列表
 */

export const QRListCodes = {
  PROCESSING: 'SSRC.SUPPLIER_REPLY.QR_LIST.PROCESSING', // 待处理
  PROCESSED: 'SSRC.SUPPLIER_REPLY.QR_LIST.PROCESSED', // 已处理
  QRALL: 'SSRC.SUPPLIER_REPLY.QR_LIST.ALL', // 全部
};

/**
 * 快速回复个性化-筛选器
 */

export const QRListSearchBarCodes = {
  PROCESSING: 'SSRC.SUPPLIER_REPLY.QR_LIST.SEARCH_BAR_PROCESSING', // 待处理
  PROCESSED: 'SSRC.SUPPLIER_REPLY.QR_LIST.SEARCH_BAR_PROCESSED', // 已处理
  QRALL: 'SSRC.SUPPLIER_REPLY.QR_LIST.SEARCH_BAR_ALL', // 全部
};

/**
 * 快速回复个性化-报价/查看报价-头信息
 */
export const QRQuotationHeaderCodes = {
  EDIT: 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.FORM', // 报价
  VIEW: 'SSRC.SUPPLIER_REPLY.QR_LIST.VIEW_FORM', // 查看报价
};

/**
 * 快速回复个性化-报价/查看报价-报价历史行
 */
export const QRQuotationHistoryCode = 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.HISTORY';

/**
 * 快速回复个性化-阶梯报价头信息
 */
export const QRLadderHeaderCode = 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.LADDER_FORM';

/**
 * 快速回复个性化-阶梯报价编辑/查看行
 */

export const QRLadderLineCodes = {
  HEADER_EDIT: 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.LADDER_LINE', // 头编辑-阶梯报价
  HEADER_VIEW: 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.VIEW_LADDER_LINE', // 头查看-阶梯报价/ 列表-查看阶梯报价
  LINE_VIEW: 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.HISTORY_LADDER_LINE', // 历史行查看-阶梯报价
};

/**
 * 快速回复个性化-报价-弹框底部操作按钮
 */
export const QRQuotationModalButtonCode = 'SSRC.SUPPLIER_REPLY.QR_LIST.QUOTATION.BOTTOM_BUTTONS';

/**
 * 快速回复个性化-头部操作按钮
 */
export const QRHeaderButtonCode = 'SSRC.SUPPLIER_REPLY.QR_LIST.HEADER_BUTTONS';
