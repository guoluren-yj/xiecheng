/**
 * monitorService
 * @author qingxiang.luo@going-link.com
 * @date 2022-09-07
 * @copyright 2022 © ZhenYun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId, realName, loginName } = getCurrentUser();

const commonParam = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 查询列表
 * @async
 * @function fetchRemoveItem
 * @param {Object} params - 查询参数
 */
export async function fetchRemoveItem(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/remove-monitor`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
      operateName: realName,
    },
  });
}

/**
 * 添加企业
 * @async
 * @function fetchAddBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/add-blacklist`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
      userName: realName,
    },
  });
}

/**
 * 查询匹配到的企业
 * @async
 * @function fetchMatchBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchMatchBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/batch-fuzzy-search`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
      operateName: realName,
      userName: realName,
      loginName,
    },
  });
}

/**
 * 查询租户添加的剩余额度
 * @async
 * @function fetchAddedCount
 * @param {Object} params - 查询参数
 */
export async function fetchAddedCount(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/query-quota`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
    },
  });
}

/**
 * 黑名单表格行内保存
 * @async
 * @function saveBlackListLine
 * @param {Object} params
 */
export async function saveBlackListLine(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/update-blacklist`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
    },
  });
}

/**
 * 黑名单表格行内移除
 * @async
 * @function removeBlackListLine
 * @param {Object} params
 */
export async function removeBlackListLine(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/remove-blacklist`, {
    method: 'POST',
    body: {
      ...params,
      ...commonParam,
    },
  });
}

/**
 * 查询租户添加的剩余额度
 * @async
 * @function fetchFreeQuota
 * @param {Object} params - 查询参数
 */
export async function fetchFreeQuota(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/get-free-quota`, {
    method: 'GET',
    query: {
      ...params,
      ...commonParam,
    },
  });
}


/**
 * 关系详情页面查询接口
 * @async
 * @function removeBlackListLine
 * @param {Object} params
 */
export async function queryRelationPath(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/relation-path`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 黑名单页面初始查询是否订阅关系图谱
 * @async
 * @function removeBlackListLine
 * @param {Object} params
 */
export async function queryIfSubscribeRelationMap(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/query-type`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 更新图谱
 * @param {*} params
 * @returns
 */
export async function fetchUpdateMap(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/graph-invoke`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

/**
 * 查询剩余额度
 * @param {*} params
 * @returns
 */
export async function fetchQuotaMsg(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/query-surplus-quota`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询图谱数据
 * @param {*} params
 * @returns
 */
export async function fetchMapData(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/graph-pic-data`, {
    method: 'GET',
    query: {
      ...params,
      tenantId,
      userId,
    },
  });
}
