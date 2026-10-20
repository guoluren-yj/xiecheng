import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { ActiveKey } from './type';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const QueryListUrlMap: Record<ActiveKey, string> = {
  [ActiveKey.TenderAll]: `${apiPrefix}/tender-feess/purchaser/page-all`,
  [ActiveKey.TenderInv]: `${apiPrefix}/tender-feess/purchaser/page-invoice-able`,
  [ActiveKey.TenderPay]: `${apiPrefix}/tender-feess/purchaser/page-payment-able`,
  [ActiveKey.DepositAll]: `${apiPrefix}/deposits/purchaser/page-all`,
  [ActiveKey.DepositPay]: `${apiPrefix}/deposits/purchaser/page-payment-able`,
  [ActiveKey.DepositReturn]: `${apiPrefix}/deposits/purchaser/page-return-able`,
  [ActiveKey.ServiceAll]: `${apiPrefix}/server-feess/purchaser/page-all`,
  [ActiveKey.ServicePay]: `${apiPrefix}/server-feess/purchaser/page-payment-able`,
  [ActiveKey.ServiceInv]: `${apiPrefix}/server-feess/purchaser/page-invoice-able`,
};

/**
 * @description:列表页投标费查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function querySourcingCostList(activeKey: ActiveKey, query: Record<string, any>) {
  return request(QueryListUrlMap[activeKey], {
    method: 'GET',
    query,
  });
}

/**
 * @description:招标文件详情页数据
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryTenderHeaderData(params: Record<string, any>) {
  return request(`${apiPrefix}/tender-feess/detail`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * @description:服务费详情页数据
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryServiceHeaderData(params: Record<string, any>) {
  return request(`${apiPrefix}/server-feess/detail`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * @description:招标文件费操作记录
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryTenderOperation(tenderFeesId: string | number) {
  return request(`${apiPrefix}/tender-operate-records/list/${tenderFeesId}`, {
    method: 'GET',
    query: { page: 0, size: 0 },
  });
}

/**
 * @description:保证金操作记录
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryDepositOperation(depositId: string | number) {
  return request(`${apiPrefix}/deposit-operate-records/list/${depositId}`, {
    method: 'GET',
    query: { page: 0, size: 0 },
  });
}

/**
 * @description:服务费操作记录
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryServiceOperation(serverFeesId: string | number) {
  return request(`${apiPrefix}/server-operate-records/list/${serverFeesId}`, {
    method: 'GET',
    query: { page: 0, size: 0, serverFeesId },
  });
}

/**
 * @description:招标文件费直连开票数据
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function previewInvoicingApply(query: Record<string, any>) {
  return request(`${apiPrefix}/tender-feess/invoice-application/preview`, {
    method: 'GET',
    query,
  });
}

/**
 * @description:招标文件费直连开票数据
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function queryInvoicingApplyList(tenderFeesId) {
  return request(`${apiPrefix}/direct-invoice-apply-headers/list/${tenderFeesId}`, {
    method: 'GET',
    query: { dataSource: 'SRM_TENDER_FEES'},
  });
}
