import request from 'utils/request';
import { SRM_SMPC } from '_utils/config';

/**
 * 保存
 */
export async function saveAttrVal(params) {
  const url = params.attrValueId
    ? `${SRM_SMPC}/v1/attribute-value/update`
    : `${SRM_SMPC}/v1/attribute-value/add`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除
 */
export async function delAttrVal(id) {
  return request(`${SRM_SMPC}/v1/attribute-value/delete?attrValueId=${id}`, {
    method: 'PUT',
  });
}
