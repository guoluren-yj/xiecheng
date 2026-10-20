/**
 * service - 开票申请
 * @date: 2019-02-19
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_SCEI, SRM_MALL, SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询应付发票 - 申请
 * @param {Object} params - 请求参数
 */
export async function fetchCreate(params) {
  const query = filterNullValueObject(parseParameters(params));
  // const customizeUnitCode = 'SFIN.ORDER_QUERY.CONDITION.QUERY.FORM'
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/ap-create`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询应付发票 - 明细头
 * @param {Object} params - 请求参数
 */
export async function fetchInvoiceHeaderPurchaser(params) {
  const { invoiceHeaderId, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/${invoiceHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 应付发票 - 创建发票
 * @param {Object} params - 请求参数
 */
export async function createPayableInvoice(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/ap-create`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询应付发票 - 维护
 * @param {Object} params - 请求参数
 */
export async function fetchMaintain(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/ap-update`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询订单明细头信息 - 明细
 * @param {Object} params - 请求参数
 */
export async function fetchOrdDetailHeader(params) {
  const { ecPoSubHeaderId } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/ec-po/${ecPoSubHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询订单明细行信息 - 明细
 * @param {Object} params - 请求参数
 */
export async function fetchOrdDetaillLine(params) {
  const { ecPoSubHeaderId, ...other } = parseParameters(params);
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/ec-po-line/${ecPoSubHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询订单明细行信息 - 明细
 * @param {Object} params - 请求参数
 */
export async function fetchInvoiceLinePurchaser(params) {
  const { invoiceHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-line/pay/${invoiceHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询应付发票 - 供应商明细头
 * @param {Object} params - 请求参数
 */
export async function fetchInvoiceHeaderSupplier(invoiceHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/supplier/${invoiceHeaderId}`, {
    method: 'GET',
    query: {
      customizeUnitCode: [
        'SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC',
        'SFIN.INVOICE_EC_UPDATE_DETAIL.BASIC_INFO',
      ].join(),
    },
  });
}

/**
 * 查询订单明细行信息 - 供应商明细
 * @param {Object} params - 请求参数
 */
export async function fetchInvoiceLineSupplier(params) {
  const { invoiceHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-line/supplier/${invoiceHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 删除发票
 * @param {Object} params - 请求参数
 */
export async function deletePayableInvoice(invoiceHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice/${invoiceHeaderId}`, {
    method: 'DELETE',
  });
}

/**
 * 保存发票
 * @param {Object} params - 请求参数
 */
export async function savePayableInvoice(params) {
  const { customizeUnitCode = '' } = params;
  // eslint-disable-next-line no-param-reassign
  delete params.customizeUnitCode;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 提交发票
 * @param {Object} params - 请求参数
 */
export async function submitPayableInvoice(params) {
  const { customizeUnitCode = '' } = params;
  // eslint-disable-next-line no-param-reassign
  delete params.customizeUnitCode;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice/submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询开票信息
 * @param {Object} companyId - 公司Id
 */
export async function fetchInvoiceInformation(companyId) {
  return request(`${SRM_PLATFORM}/v1/company-invoices/queryCompanyInvoice/${companyId}`, {
    method: 'GET',
  });
}

/**
 * 查询开票信息
 * @param {Object} companyId - 公司Id
 */
export async function validateInvoice(companyId) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-company-assigns/detail`, {
    method: 'GET',
    query: { companyId },
  });
}

/**
 * 查询国家地区.
 * @param {Number} countryId 国家ID
 * @export
 */
export async function queryProvinceCity(params) {
  const { countryId } = params;
  return request(`${HZERO_PLATFORM}/v1/countries/${countryId}/regions`, {
    method: 'GET',
    query: {
      enabledFlag: 1,
      params,
    },
  });
}

/**
 * 动态查询地区
 * @param {*} params
 * @returns
 */
export async function queryNewMallCity(params) {
  return request(`${SRM_MALL}/v1/mall-regions/${organizationId}/Subordinate`, {
    method: 'GET',
    query: params,
  });
}
