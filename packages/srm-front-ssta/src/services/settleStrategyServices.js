import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import { initiateAsyncExport } from 'services/api';

const isPlat = !isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();
const platPrefix = `${SRM_SSTA}/v1/site`;
const tenantPrefix = `${SRM_SSTA}/v1/${organizationId}`;
// 平台级结算策略需要调用的接口前缀为site
const prefix = isPlat ? platPrefix : tenantPrefix;
// platModalFlag表示租户查询平台级结算策略接口数据
const getPrefix = (platModalFlag) =>
  platModalFlag ? `${tenantPrefix}/settle-config-site` : prefix;
const currentTenant = getCurrentTenant();

/**
 * @description: 编辑结算策略接口（返回最新策略id）
 * @param {String} settleConfigId 策略id
 * @return {Promise} 请求
 */
export async function editSettleStrategy(settleConfigId) {
  return request(`${prefix}/settle-config/create/${settleConfigId}`, {
    method: 'PUT',
  });
}

/**
 * @description: 复制结算策略接口
 * @param {Object} body 请求体
 * @return {Promise} 请求
 */
export async function copySettleStrategy(body) {
  return request(`${prefix}/settle-config/copy`, {
    method: 'POST',
    body,
  });
}

/**
 * @description: 查询结算策略历史版本
 * @param {Object} query 查询参数
 * @return {Promise} 请求
 */
export async function fetchStrategyHistory(query) {
  return request(`${prefix}/settle-config/history/page`, {
    method: 'GET',
    query,
  });
}

/**
 * @description: 查询取价模式
 * @param {String} settleConfigId 策略id
 * @return {Promise} 请求
 */
export async function getPricingModel(settleConfigId, platModalFlag) {
  return request(`${getPrefix(platModalFlag)}/price-services/${settleConfigId}`, {
    method: 'GET',
  });
}

/**
 * @description: 保存取价模式
 * @param {Object} body 请求体
 * @param {String} settleConfigId 策略id
 * @return {Promise} 请求
 */
export async function savePricingModel(body, settleConfigId) {
  return request(`${prefix}/price-services/${settleConfigId}`, {
    method: 'PUT',
    body,
  });
}

/**
 * @description: 查询平台策略
 * @param {Object} query 查询参数
 * @return {Promise} 请求
 */
export async function fetchPlatStrategy(query) {
  return request(`${tenantPrefix}/settle-config/site-page`, {
    method: 'GET',
    query,
  });
}

/**
 * 引用策略级平台确定按钮
 * @param {Object} body 请求体
 * @return {Promise} 请求
 */
export async function quotePlatStrategy(body) {
  return request(`${tenantPrefix}/settle-config/by-site`, {
    method: 'POST',
    body,
  });
}

/**
 * 保存时后端校验
 * @param {body} 请求体
 * @return {Promise} 请求
 */
export async function validateStrategy(body) {
  return request(`${prefix}/settle-config/validate`, {
    method: 'POST',
    body,
  });
}

/**
 * 保存发布接口
 * @param {Object} body 请求体 submitType 保存/发布
 * @return {Promise} 请求
 */
export async function submitStrategy({ body, submitType }) {
  const suffix = submitType === 'release' ? '/release' : '';
  return request(`${prefix}/settle-config${suffix}`, {
    method: submitType === 'release' ? 'PUT' : 'POST',
    body,
  });
}

export async function getPayOprPermission(platModalFlag, settleConfigId) {
  return request(`${getPrefix(platModalFlag)}/opt-permissions/${settleConfigId}`, {
    method: 'GET',
  });
}

export async function getToleAutoAdjust(platModalFlag, settleConfigId) {
  return request(`${getPrefix(platModalFlag)}/amount-adjusts/${settleConfigId}`, {
    method: 'GET',
  });
}

export async function getUxTitleCss(settleConfigId, documentHeaderType) {
  return request(`${prefix}/settle-area-config/${settleConfigId}`, {
    method: 'GET',
    query: {
      area: 'UX_TITLE',
      documentHeaderType,
    },
  });
}

export async function saveCondition(body) {
  return request(`${prefix}/settle-config-conds/create-or-update`, {
    method: 'POST',
    body,
  });
}

export async function getCondition(conditionId) {
  return request(`${prefix}/settle-config-conds/detail/${conditionId}`, {
    method: 'GET',
    query: {
      conditionId,
    },
  });
}

export async function getConditionList(query) {
  return request(`${prefix}/settle-config-conds/list`, {
    method: 'GET',
    query,
  });
}

export async function exportSettleConfig(body) {
  return request(`${prefix}/settle-config/export`, {
    method: 'POST',
    body,
  });
}

export async function exportExcelSettleConfig(param) {
  const { tenantNum } = currentTenant;
  const api = `${prefix}/settle-config/export-excel?settleConfigId=${param.settleConfigId}`;
  return request(api, {
    method: 'GET',
    query: { exportType: 'COLUMN', tenantNum },
  }).then((res) => {
    if (getResponse(res)) {
      const data = res.children || [];
      const params = [];
      data.forEach((item) => {
        params.push({ name: 'ids', value: item.id });
        if (item.children) {
          params.push(...item.children.map((ele) => ({ name: 'ids', value: ele.id })));
        }
      });
      initiateAsyncExport({
        requestUrl: api,
        queryParams: [
          { name: 'tenantNum', value: tenantNum },
          { name: 'fillerType', value: 'single-sheet' },
          { name: 'maxDataCount', value: '250000' },
          { name: 'singleExcelMaxSheetNum', value: '5' },
          { name: 'fileType', value: 'EXCEL2007' },
          { name: 'async', value: 'true' },
          { name: 'exportType', value: 'DATA' },
          ...params,
        ],
        method: 'GET',
      });
    }
  });
}

export async function getTermEnableFundConfig() {
  return request(`/sbdm/v1/${organizationId}/term-headers/query-enable-fund-config`, {
    method: 'GET',
  });
}

export async function getEnablePayConfig() {
  return request(`/sbdm/v1/${organizationId}/pay-headers/query-enable-pay-config`, {
    method: 'GET',
  });
}

export async function deleteSettleStrategy(body) {
  return request(`${prefix}/settle-config`, {
    method: 'DELETE',
    body,
  });
}
