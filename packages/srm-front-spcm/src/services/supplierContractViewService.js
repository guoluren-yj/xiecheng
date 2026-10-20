/*
 * contractMaintainService - 我收到的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_SPCM } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// -获取列表数据
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/supplier-view/page`, {
    query,
  });
}

// queryButtonAuthority - 查询按钮权限
export async function queryButtonAuthority(params) {
  const { pcHeaderId } = params || {};
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/queryFieldDisplay/${pcHeaderId}`
  );
}
