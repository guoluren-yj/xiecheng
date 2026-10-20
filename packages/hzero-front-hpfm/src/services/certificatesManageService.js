import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, isTenantRoleLevel } from 'utils/utils';

const prefix = `${HZERO_PLATFORM}/v1`;

// 查询证书信息接口
export async function queryAuthorizedCode(params) {
  const param = parseParameters(params);
  return request(`${prefix}/authorize-code/info`, {
    method: 'GET',
  });
}

// 更新证书信息接口
export async function updateAuthorizedCode(params) {
  const param = parseParameters(params);
  return request(`${prefix}/authorize-code/update`, {
    method: 'POST',
    body: params,
  });
}
