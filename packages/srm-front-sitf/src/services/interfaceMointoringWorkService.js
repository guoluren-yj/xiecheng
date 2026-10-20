import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const isLevelFlag = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

/**
 * 接口查询明细动态列表
 * @export
 * @param {object} params 查询条件
 * @returns
 */
export async function fetchByInterDaceRight(params) {
  const param = parseParameters(params);
  return request(
    isLevelFlag
      ? `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs`
      : `${SRM_INTERFACE}/v1/keyword-configs`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 接口数据明细
 * @export
 * @param {object} params 查询条件
 * @returns
 */
export async function fetchContentDetails(params) {
  const { contentId } = params;
  const param = parseParameters(params);
  return request(
    isLevelFlag
      ? `${SRM_INTERFACE}/v1/${organizationId}/data-contents/${contentId}`
      : `${SRM_INTERFACE}/v1/data-contents/${contentId}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 判断是否添加内容搜索框
 * @export
 * @param {object} params 查询条件
 * @returns
 */
export async function fetchSearch(parmas) {
  return request(
    isLevelFlag
      ? `${SRM_INTERFACE}/v1/${organizationId}/data-contents/storage/db/type`
      : `${SRM_INTERFACE}/v1/data-contents/storage/db/type`,
    {
      method: 'GET',
      query: { tenantId: isLevelFlag ? undefined : parmas },
      responseType: 'text',
    }
  );
}

/**
 * 重新执行
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchReExecute(params) {
  return request(
    isLevelFlag
      ? `${SRM_INTERFACE}/v1/${organizationId}/rerun-batch`
      : `${SRM_INTERFACE}/v1/rerun-batch`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 重试
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchAutorenew(params) {
  return request(isLevelFlag ? `${SRM_INTERFACE}/v1/${organizationId}/request-limit-infos/retry` : `${SRM_INTERFACE}/v1/request-limit-infos/retry`,
    {
      method: 'POST',
      body: params,
    }
  );
}
