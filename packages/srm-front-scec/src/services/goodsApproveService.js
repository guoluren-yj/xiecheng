/**
 * goodsApproveService - 电商平台-商品审批 - service
 * @date: 2019-2-14
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HFLE } from 'utils/config';
import { SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 商品审批列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/product/listPendingApproval`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 工作流的商品审批列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsListHwfp(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/product/listShelve/approval`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 商品审批批量通过
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function batchGoodsApproved(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/approved`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 商品审批批量拒绝
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function batchGoodsReject(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 商品审批-商品详情
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchProductDetail(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/${params.productId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 阶梯报价数据查询
 * @async
 * @function fetchLadderPriceTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLadderPriceTable(params) {
  return request(
    `${SRM_SCEC}/v1/${organizationId}/catalogue/${params.productId}/product-ladder-price`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取附件列表，判断是有附件
 */
export async function getEnclosureList(params) {
  const { attachmentUUID = '' } = params;
  return request(`${HZERO_HFLE}/v1/files/${attachmentUUID}/file?`, {
    method: 'GET',
    query: params,
  });
}
