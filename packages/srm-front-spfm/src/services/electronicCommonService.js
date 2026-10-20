import request from 'utils/request';
// import { SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 查询认证信息
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function fetchAuthentication(params) {
  const { userId } = params;
  return request(
    `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/user-auth-info/auth-type/${userId}`,
    {
      method: 'GET',
    }
  );
}
