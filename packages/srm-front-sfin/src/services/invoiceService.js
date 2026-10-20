/**
 * invoiceService.js - 发票协同 service
 * @date: 2018-11-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getCurrentTenant,
} from 'utils/utils';
import { SRM_SPUC, SRM_PLATFORM, SRM_MDM, SRM_FINANCE } from '_utils/config';
import { HZERO_FILE } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const urls = {
  queryApproveList: `${SRM_FINANCE}/v1/${organizationId}/invoice/approve`,
  queryCreateList: `${SRM_FINANCE}/v1/${organizationId}/invoice/create`,
  queryCreatePurchaserList: `${SRM_FINANCE}/v1/${organizationId}/invoice/purchaser-ap-create`,
  queryReturnList: `${SRM_FINANCE}/v1/${organizationId}/invoice/return`,
  queryReviewList: `${SRM_FINANCE}/v1/${organizationId}/invoice/review`,
  querySummaryList: `${SRM_FINANCE}/v1/${organizationId}/invoice`,
  querySupplierList: `${SRM_FINANCE}/v1/${organizationId}/invoice/supplier`,
  querySummarytaxinvoiceList: `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/purchase`, // 应收发票税务发票行
  querySummaryinvoiceList: `${SRM_FINANCE}/v1/${organizationId}/invoice-line/payable-list`, // 我的应付-发票行
  querySupplierinvoiceList: `${SRM_FINANCE}/v1/${organizationId}/invoice-line/payable-list-supplier`, // 我的应收-发票行
  querySuppliertaxinvoiceList: `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/supplier`, // 应收发票税务发票行
  querySyncList: `${SRM_FINANCE}/v1/${organizationId}/invoice/sync`,
  queryUpdateList: `${SRM_FINANCE}/v1/${organizationId}/invoice/update`,
  queryUpdatePurchaserList: `${SRM_FINANCE}/v1/${organizationId}/invoice/purchaser-update`,
  confirmApprove: `${SRM_FINANCE}/v1/${organizationId}/invoice/approve-confirm?customizeUnitCode=SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO`,
  confirmReview: `${SRM_FINANCE}/v1/${organizationId}/invoice/review-confirm`,
  rejectApprove: `${SRM_FINANCE}/v1/${organizationId}/invoice/approve-reject?customizeUnitCode=SFIN.INVOICE_UPDATE_DETAIL.HEADER_INFO`,
  rejectReview: `${SRM_FINANCE}/v1/${organizationId}/invoice/review-reject`,
  updateTax: `${SRM_FINANCE}/v1/${organizationId}/invoice-line/update-tax`,
};
const firstUpper = (type) => type.toLowerCase().replace(/^[a-z]/g, (L) => L.toUpperCase());

/**
 * 批量查询配置中心配置
 * @param {String} settingCode - 查询设置项的 code
 */
export async function batchQuerySetting(payload) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/batch`, {
    method: 'GET',
    query: payload,
  });
}

/**
 *
 * 查询开票行 - 总账科目
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
export async function fetchInf(params) {
  const { billHeaderId, interfaceType, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/bill-page?billHeaderId=${billHeaderId}`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询开票行 - 总账科目
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
export async function fetchInvoicePage(params) {
  const { billHeaderId, interfaceType, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/invoice-page`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

// 税收树形菜单查询
export async function queryTreeData(params) {
  const { ...rest } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/tax-items`, {
    method: 'GET',
    query: rest,
  });
}

// 税收列表菜单查询
export async function queryTaxationData(params) {
  const { ...rest } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/tax-items/contents`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters(rest)),
  });
}

/**
 * 查询配置中心配置
 */
export async function querySetting() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
  });
}

/**
 * 查询发票规则定义
 */
export async function queryInvoiceRule() {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-update-rules`, {
    method: 'GET',
  });
}

// 创建开票通知默认查询条件
export async function defaultFetch(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/data-source-configs/default`, {
    method: 'GET',
    query: params,
  });
}
// 创建开票通知默认查询条件-业务类别
export async function defaultFetchBusinessType(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/business-type-configs/default`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 发票界面列表查询
 * @param {Object} params - 查询参数
 */
export async function queryList(params) {
  const { customizeUnitCode = '', type, isPurchaser = false, ...query } = parseParameters(params);
  const suffix = isPurchaser ? 'Purchaser' : '';
  return request(
    customizeUnitCode
      ? `${urls[`query${firstUpper(type)}${suffix}List`]}?customizeUnitCode=${customizeUnitCode}`
      : `${urls[`query${firstUpper(type)}${suffix}List`]}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 发票界面列表查询
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function fetchAcceptanceForm(params) {
  const { customizeUnitCode = '', type, ...query } = parseParameters(params);
  return request(
    `${SRM_SPUC}/v1/${organizationId}/accept-line/for-invocie?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 发票创建
 * @param {Object} params - 查询参数
 */
export async function createInvoice(params) {
  const { selectedRows, isPurchaser, ...query } = params;
  const url = isPurchaser
    ? `${SRM_FINANCE}/v1/${organizationId}/invoice/purchaser-ap-create`
    : `${SRM_FINANCE}/v1/${organizationId}/invoice`;
  return request(url, {
    method: 'POST',
    body: selectedRows,
    query,
  });
}

/**
 * 创建
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createAcceptanceForm(params) {
  const { selectedRows, displayReverseFlag, isPurchaser } = params;
  const url = isPurchaser
    ? `${SRM_FINANCE}/v1/${organizationId}/invoice/purchaser-by-accept`
    : `${SRM_FINANCE}/v1/${organizationId}/invoice/by-accept`;
  return request(`${url}?displayReverseFlag=${displayReverseFlag}`, {
    method: 'POST',
    body: selectedRows,
  });
}

/**
 * 发票撤销移除
 * @param {Object} params - 查询参数
 */
export async function removeInvoice(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/need-invoice`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 撤销移除
 * @export
 * @param {String} params.interfaceName 接口名
 * @param {Array} params.createRowKeys 主键数组
 * @returns
 */
export async function returnAcceptance(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-line/need-invocie`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发票移除
 * @param {Object} params - 查询参数
 */
export async function cancelRemoveInvoice(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/un-need-invoice`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 移除
 */
export async function removeAcceptance(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-line/not-need-invocie`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 发票维护保存
 * @param {Object} params - 保存参数
 */
export async function saveInvoice(params) {
  const { customizeUnitCode = '' } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 发票维护提交
 * @param {Object} params - 保存参数
 */
export async function submitInvoice(params) {
  const { customizeUnitCode = '' } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice/submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 发票维护删除
 * @param {Number} invoiceHeaderId - 发票头 id
 */
export async function deleteInvoice(invoiceHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/${invoiceHeaderId}`, {
    method: 'DELETE',
  });
}

/**
 * 发票维护取消
 * @param {Number} params.invoiceHeaderId - 发票头 id
 * @param {String} params.remark 发票备注
 */
export async function cancelInvoice(params) {
  const { remark, invoiceHeaderId } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/cancel/${invoiceHeaderId}`, {
    method: 'POST',
    query: { remark },
  });
}

/**
 * 发票审核通过
 * @param {Object} params - 审核或符合通过 API
 */
export async function confirm(params) {
  const { type, body, customizeUnitCode = '' } = params;
  return request(`${urls[`confirm${firstUpper(type)}`]}?customizeUnitCode=${customizeUnitCode}`, {
    method: 'POST',
    body,
  });
}

/**
 * 发票审核拒绝
 * @param {Object} params - 审核或符合拒绝 API
 */
export async function reject(params) {
  const { type, body, customizeUnitCode = '' } = params;
  return request(`${urls[`reject${firstUpper(type)}`]}?customizeUnitCode=${customizeUnitCode}`, {
    method: 'POST',
    body,
  });
}

/**
 * 发票详情页面供应商头查询
 * @param {Object} params - 查询参数
 */
export async function querySupplierDetailHeader(params) {
  const { invoiceHeaderId, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/supplier/${invoiceHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 发票详情页面供应商行查询
 * @param {Object} params - 查询参数
 */
export async function querySupplierDetailLine(params) {
  const { invoiceHeaderId, type, ...query } = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-line/supplier/${invoiceHeaderId}`, {
    method: 'GET',
    query,
  });
}
export async function queryInvoiceDetailLine(params) {
  const { invoiceHeaderId, type, ...query } = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-line/${invoiceHeaderId}`, {
    method: 'GET',
    query,
  });
}
/**
 * 发票详情页面头查询
 * @param {Object} params - 查询参数
 */
export async function queryDetailHeader(params) {
  const { invoiceHeaderId, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/${invoiceHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 发票详情页面行查询
 * @param {Object} params - 查询参数
 */
export async function queryDetailLine(params) {
  const { customizeUnitCode = '', invoiceHeaderId, type, ...query } = params;
  const param = filterNullValueObject(parseParameters(query));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice-line/${invoiceHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 查询操作记录接口
 */
export async function queryRecordList(params) {
  const { invoiceHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-actions/${invoiceHeaderId}`, {
    method: 'GET',
    query,
  });
}
// 查询审批记录
export async function queryApproveRecordList(params) {
  const { invoiceHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice-actions/${invoiceHeaderId}/approval`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 *
 * 非寄销发票同步
 * @export
 * @param {String} params.description 导入说明
 * @param {Array} params.invoiceHeaderList 头Id数组
 * @returns
 */
export async function syncInvoice(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/sync`, {
    method: 'POST',
    body: params,
  });
}

/**
 *
 * 非寄销发票退回
 * @export
 * @param {String} params.description 复核意见
 * @param {Array} params.invoiceHeaderList 头Id数组
 * @returns
 */
export async function returnInvoice(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/return`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询发票下载接口
 */
export async function fetchInvoiceDownloadList(params) {
  const { invoiceHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-download-link/${invoiceHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 税务发票行列表查询
 * @param {Object} params - 查询参数
 */
export async function queryTaxInvoiceLine(params) {
  const { invoiceHeaderId, ...other } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/list/${invoiceHeaderId}`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters(other)),
  });
}

/**
 * 税务发票行列表删除
 * @param {Object} params - 删除参数
 */
export async function deleteTaxInvoiceLine(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 税务发票行列表删除
 * @param {Object} params - 删除参数
 */
export async function saveTaxLine(params) {
  const { list, invoiceHeaderId, customizeUnitCode = '' } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/save/${invoiceHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: list,
    }
  );
}

/**
 * 物流信息录入查询
 * @param {Object} params - 查询参数
 */
export async function queryLogisticsInfo(params) {
  const { invoiceHeaderId } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice/query-invoice-logistics-info/${invoiceHeaderId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 物流信息录入修改
 * @param {Object} params - 查询参数
 */
export async function submitLogisticsInfo(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/logistics-info-supplement`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发票检验
 * @param {Object} params - 修改参数
 */
export async function inspection(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/batch-check-invoice`, {
    method: 'POST',
    body: params,
  });
}

/**
 * ocr识别
 * @param {Object} params - 校验参数
 */
export async function ocrImport(params) {
  const { invoiceHeaderId, list } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/ocr-import/${invoiceHeaderId}`,
    {
      method: 'POST',
      body: list,
    }
  );
}

/**
 * ofd解析
 * @param {Object} params - 校验参数
 */
export async function ofdImport(params) {
  const { invoiceHeaderId, list } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/ofd-import/${invoiceHeaderId}`,
    {
      method: 'POST',
      body: list,
    }
  );
}

/**
 *  获取上传附件UUID
 */
export async function getAttachmentuuid() {
  return request(`${HZERO_FILE}/v1/${organizationId}/files/uuid`, {
    method: 'POST',
  });
}

/**
 * 保存文件上传后的UUID
 */
export async function saveAttachmentUUID(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/attachmentUUID`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 发票查验
 * @param {Object} params - 保存参数
 */
export async function checkARinvoice(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/batch-check-ARinvoice`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发票查验
 * @param {Object} params - 保存参数
 */
export async function checkValidator(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/validator`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询预览发票数据
 * @param {Object} params - 查询参数
 */
export async function fetchPreviewData(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/direct-invoice-preview`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 确认开票
 * @param {Object} params - 传递参数
 */
export async function confirmeInvoice(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/direct-invoice`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询真实发票数据
 * @param {Object} params - 查询参数
 */
export async function fetchInvoiceData(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/paper-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 打印销货清单
 */
export async function printDetailList(params) {
  const { taxInvoiceLineId } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/print-list/${taxInvoiceLineId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 打印发票
 */
export async function printInvoice(params) {
  const { taxInvoiceLineId } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/print/${taxInvoiceLineId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询发票视图
 * @param {Object} params - 查询参数
 */
export async function fetchInvoiceView(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/electronic-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 打印
 * @async
 * @param {!number} billHeaderId
 * @function print
 */
export async function print(invoiceHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/print/${invoiceHeaderId}`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 创建应付发票校验
 * @param {Object} params - 查询参数
 */
export async function createValidateInvoice(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/validate-creation`, {
    method: 'PUT',
    body: params,
  });
}

// 保存行信息
export async function saveLines(params) {
  const { tenantId, invoiceHeaderId, body, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-line/update/${invoiceHeaderId}`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}

// 新增行信息
export async function addLines(params) {
  const { tenantId, invoiceHeaderId, businessType, body } = params;
  const urlPart = businessType === 'ACCEPT' ? 'by-accept/' : '';
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice/insert-line/${urlPart}${invoiceHeaderId}`, {
    method: 'POST',
    body,
  });
}

// 删除行信息
export async function deleteLines(params) {
  const { tenantId, invoiceHeaderId, body } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice/invoice-line-delete/${invoiceHeaderId}`, {
    method: 'DELETE',
    body,
  });
}

// 保存所有行信息
export async function saveAllLines(params) {
  const { tenantId, invoiceHeaderId, body } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice/lines-update/${invoiceHeaderId}`, {
    method: 'PUT',
    body,
  });
}

// /**
//  * 查询配置
//  */
// export async function fetchSettings(params) {
//   return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
//     method: 'GET',
//     body: params,
//   });
// }

// 删除行信息
export async function updateTax(params) {
  const { invoiceHeaderId, body } = params;
  return request(`${urls.updateTax}/${invoiceHeaderId}`, {
    method: 'PUT',
    body,
  });
}

export async function createAll(params) {
  const { invoiceType, organizationIds, trxLineIds, ...query } = params;
  return request(`${SRM_FINANCE}/v1/${organizationIds}/invoice/${invoiceType}/batch`, {
    method: 'POST',
    body: [...trxLineIds],
    query,
  });
}

export async function fetchModalList(params) {
  const { interfaceType, supplierCompanyId, erpSupplierFlag, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${params.organizationId}/supplier-deduction/ays-supplier-available-page`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: {
      ...param,
      supplierCompanyId,
      erpSupplierFlag,
    },
  });
}
export async function fetchInvoiceSave(params) {
  const { invoiceHeaderId, supLineList } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${params.organizationId}/supplier-deduction/invoice-save/${invoiceHeaderId}`;
  return request(interfaceName, {
    method: 'POST',
    body: supLineList,
  });
}

export async function deteleinvoiceSave(params) {
  const { invoiceHeaderId, body } = params;
  return request(
    `${SRM_FINANCE}/v1/${params.organizationId}/supplier-deduction/invoice-delete/${invoiceHeaderId}`,
    {
      method: 'DELETE',
      body,
    }
  );
}

export async function fetchInvoiceHistory(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/actions`, {
    method: 'GET',
    query: param,
  });
}

export async function getOcrConfig() {
  return request(`${SRM_FINANCE}/v1/${organizationId}/common/ocr-channel-mapping`, {
    method: 'GET',
  });
}

export async function getInvoiceConfigTable() {
  const { tenantId, tenantNum } = getCurrentTenant();
  const configCode = 'sfin_document_config';
  return request(`${SRM_PLATFORM}/v1/${tenantId}/rel-table-records/${configCode}/list-from-site`, {
    method: 'POST',
    body: { tenantNum },
  });
}
