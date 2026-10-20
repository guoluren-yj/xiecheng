import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SCEI, SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询电商账户数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchInfo(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-clients/${params.ecClientId}`, {
    method: 'GET',
  });
}

/**
 * 更新分配公司
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function updateCompanyStatus(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-company-assigns`, {
    method: 'POST',
    body: params,
  });
}

export async function updateEcStatus(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-clients`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 账号激活
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function activeClient(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-clients/check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改密码
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function updatePwd(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-clients/modify-password`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询支付方式
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchPaymentType(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-payments`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 公共模态框数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCommonData(params) {
  const { activeKey, ...others } = params;
  return request(`${SRM_MALL}/v1/${organizationId}/${activeKey}-client-values/by-condition`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 公共模态框保存
 * @export
 * @param {object} params 参数
 * @returns
 */
export async function saveModalData(activeKey, params) {
  return request(
    `${SRM_MALL}/v1/${organizationId}/${activeKey}-client-values/${
      activeKey === 'cata' ? 'create-or-update' : ''
    }`,
    {
      method: 'POST',
      body: params,
    }
  );
}
/**
 * 公共模态框删除
 * @export
 * @param {object} params 参数
 * @returns
 */
export async function deleteModalData(params) {
  const { activeKey } = params;
  return request(`${SRM_MALL}/v1/${organizationId}/${activeKey}-client-values`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

export async function fetchStatusList(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/value`, {
    method: 'GET',
    query: params,
  });
}

export function saveConfigModal(body) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-client-values`, {
    method: 'POST',
    body,
  });
}

export function fetchTypeAndMethod(recordData) {
  return request(
    `${SRM_MALL}/v1/${organizationId}/ec-invoice-infos?ecClientId=${recordData.ecClientId}`,
    {
      method: 'GET',
      query: {
        size: 100,
      },
    }
  );
}

export function deleteTypeAndMethod(body) {
  const { ecClientId, ...otherBody } = body;
  return request(`${SRM_MALL}/v1/${organizationId}/ec-invoice-infos/${ecClientId}/groupNum`, {
    method: 'DELETE',
    body: otherBody,
  });
}
