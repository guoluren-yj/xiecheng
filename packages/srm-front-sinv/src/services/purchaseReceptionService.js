/**
 * purchaseReceptionService - 事务接收
 * @date: 2019-1-28
 * @author: lixiaolong <xialong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询列表的数据
 * @param {object} params - 查询参数
 * @param {?string} params.asnNum - 送货单号
 * @param {?string} params.displayPoNum - 订单号
 * @param {?string} params.supplierId - 供应商
 * @param {?string} params.asnTypeCode - 送货单类型
 * @param {?string} params.agentId - 采购员
 * @param {?string} params.companyId - 公司
 * @param {?string} params.itemId - 物料
 * @param {?string} params.fromExpectedArriveDate - 预计到货日期从
 * @param {?string} params.toExpectedArriveDate - 预计到货日期至
 * @param {?string} params.invOrganizationId - 收货组织
 * @param {?string} params.inventoryId - 收货库房
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-header/permit-receive-asn-line`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询维护界面信息
 * @param {string[]} params.asnLineIds - 查询数据的 asnLineId 的数组
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function queryDetailList(params) {
  const { lineIds, ...other } = params;
  const query = filterNullValueObject(other);
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-header/prepare-trx-data`, {
    method: 'POST',
    query,
    body: lineIds,
  });
}
/**
 * 删除行数据
 * @param {string[]} params - 需要删除的行数据
 */
export async function deleteRecords(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-reception-detail/`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 接收过账
 * @export
 * @param {object} params
 * @param {string} params.receivedBy - 接收人
 * @param {object[]} params.data - 要接收过账数据数组
 * @returns
 */
export async function saveReception(params) {
  const { receivedBy, receiveOrderType } = params;
  let url = '';
  if (receivedBy) {
    url = `${SRM_SPUC}/v1/${organizationId}/rcv-trx-header/create-rcv-trx-header-line?receivedBy=${encodeURIComponent(
      receivedBy
    )}&receiveOrderType=${encodeURIComponent(receiveOrderType)}`;
  } else {
    url = `${SRM_SPUC}/v1/${organizationId}/rcv-trx-header/create-rcv-trx-header-line?receiveOrderType=${encodeURIComponent(
      receiveOrderType
    )}`;
  }
  return request(url, {
    method: 'POST',
    body: params.data,
  });
}
/**
 * 新增弹窗获取数据和查询
 * @export
 * @param {object} params
 * @param {?string} params.asnNum - 送货单号
 * @param {?string} params.displayPoNum - 订单号
 * @param {?string} params.itemId - 物料名称
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 * @returns
 */
export async function searchAddList({ lineIds, ...params }) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-trx-header/unselected-permit-receive-asn-line`,
    {
      method: 'POST',
      query: filterNullValueObject(params),
      body: lineIds,
    }
  );
}

export async function queryLovDate(params) {
  return request(`/hpfm/v1/lovs/sql/data`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

export function receivingVerification(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-header/receivingVerification`, {
    query: { receiveOrderType: params.receiveOrderType, organizationId },
    method: 'POST',
    body: params.lineIds,
  });
}
