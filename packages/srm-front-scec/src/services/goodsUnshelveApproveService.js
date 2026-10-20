/**
 * GoodsManage -商品下架审批 service层
 * @date: 2019-12-9
 * @author zz <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 商品下架列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/product/listShelve`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 商品下架审批
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function passApprove(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/unshelf-approval?approvalFlag=1`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 商品下架审批
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function refuseApprove(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/unshelf-approval?approvalFlag=0`, {
    method: 'POST',
    body: params,
  });
}
