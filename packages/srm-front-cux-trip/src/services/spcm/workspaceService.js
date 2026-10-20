import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 智能合同和引用数据对比接口
 * @param {*} body
 * @returns
 */
export async function extractCompareHeader(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/compare/header`, {
    method: 'POST',
    body,
  });
}

/**
 * 合同要素提取结果轮询获取
 * @param {*} body
 * @returns
 */
export async function extractPollResult(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/poll/result`, {
    method: 'POST',
    body,
  });
}

/**
 * 寻源暂挂
 */
export async function toSuspend(data) {
  const { suspendFlag } = data[0];
  return request(
    `${SRM_SPCM}/v1/${organizationId}/source-results/suspend-flag?suspendFlag=${suspendFlag}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 引用寻源结果是否需要带上扩展字段到协议
 * @returns
 */
export async function referenceWhitelist() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-common/query-reference-whitelist`, {
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * cdp-179419 【携程】合同签订人和下单执行人自行转交
 * @param {object} body
 * @returns
 */
export async function transferSourceResults(body) {
  return request(
    `/marmot/v1/${organizationId}/marmot-api/9U8VGbgdPXSWcWk1QYgIbTztGDoCg0w0QriaUc6Ojdts`,
    {
      method: 'POST',
      body,
    }
  );
}
