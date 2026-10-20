import request from 'utils/request';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_HITF } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 点击左侧树节点，查询接口配置信息
 * @async
 * @function createInterfaceQuery
 * @params 接口参数
 * @returns {object} fetch Promise
 */
export async function getInterfaceConfig(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/open-monitor-manages`
      : `${HZERO_HITF}/v1/open-monitor-manages/detail`,
    {
      method: 'GET',
      query: { ...query },
    }
  );
}

/**
 * 点击报文详情，根据监控类型查不同接口
 * @async
 * @function createInterfaceQuery
 * @params 接口参数
 * @returns {object} fetch Promise
 */
export async function fetchDetailData(type, id, tenantId) {
  const url =
    type === 'detail'
      ? `/open-monitor-details/${id}`
      : type === 'overview'
      ? `/open-monitors/${id}`
      : `/open-monitors-exception/${id}`;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}${url}`
      : `${HZERO_HITF}/v1${url}?tenantId=${tenantId}`,
    {
      method: 'GET',
    }
  );
}

// 获取下拉值集
export async function getOptions(code) {
  return request(
    organizationRoleLevel
      ? `/hpfm/v1/${organizationId}/lovs/data?lovCode=${code}`
      : `/hpfm/v1/lovs/data?lovCode=${code}`,
    {
      method: 'GET',
    }
  );
}

// 获取监控详情报文参数
export async function getParameter(id, tenantId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/open-data-contents/${id}`
      : `${HZERO_HITF}/v1/open-data-contents/${id}?tenantId=${tenantId}`,
    {
      method: 'GET',
    }
  );
}

// 单条数据重新执行
export async function handleReSend(data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/error-resend`
      : `${HZERO_HITF}/v1/error-resend`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 多条数据重新执行
export async function handleBatchReSend(data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/error-resend/batch`
      : `${HZERO_HITF}/v1/error-resend/batch`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 错误信息
export async function fetchErrorMessage(monitorDetailId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/open-monitor-details/${monitorDetailId}`
      : `${HZERO_HITF}/v1/open-monitor-details/${monitorDetailId} `,
    {
      method: 'GET',
    }
  );
}

// 异常调用查询-重新执行
export async function fetchRetry(data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/exception-resend`
      : `${HZERO_HITF}/v1/exception-resend`,
    {
      method: 'POST',
      body: data,
    }
  );
}
