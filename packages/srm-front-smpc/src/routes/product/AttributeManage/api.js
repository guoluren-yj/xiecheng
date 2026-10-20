import request from 'utils/request';
import { SRM_SMPC } from '_utils/config';

/**
 * 保存
 */
export async function saveAttr(params) {
  const url = params.attributeId
    ? `${SRM_SMPC}/v1/attribute/update`
    : `${SRM_SMPC}/v1/attribute/add`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除
 */
export async function delAttr(id) {
  return request(`${SRM_SMPC}/v1/attribute/delete?attributeId=${id}`, {
    method: 'PUT',
  });
}
