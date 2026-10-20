/**
 * service 考评档案填制详细
 * @date: 2018-01-02
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import { filterNullValueObject, parseParameters, getCurrentOrganizationId } from 'utils/utils';

const prefix = `${SRM_SSLM}/v1`;

/**
 * 查询考评档案填制详情列表
 * @param {number} tenantId - 租户ID
 * @param {object} params - 查询参数
 */
export async function querySupplierFilling({ tenantId, ...params }) {
  const param = parseParameters(params);
  return request(`${prefix}/${tenantId}/eval-headers/evaluating`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询考评档案填制详情页数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryDetailData(params) {
  const { tenantId, evalHeaderId } = params;
  return request(`${prefix}/${tenantId}/eval-headers/evaluation/${evalHeaderId}`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 保存考评档案填制详情页
 * @param {number} tenantId - 租户ID
 * @param {object} params - 保存的数据
 */
export async function saveScore({ tenantId, customizeUnitCode, ...params }) {
  return request(`${prefix}/${tenantId}/eval-dtl-resps`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}
/**
 * 提交考评档案填制详情页
 * @param {number} tenantId - 租户ID
 * @param {object} params - 提交的数据
 */
export async function submitScore({ tenantId, customizeUnitCode, ...params }) {
  return request(`${prefix}/${tenantId}/eval-dtl-resps/submit`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}
/**
 * 查询考评附件
 * @async
 * @function queryOperation
 * @param {Number} params.abilityLineId - 考评Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryLineAttachment(params) {
  const organizationId = getCurrentOrganizationId();
  const query = filterNullValueObject(parseParameters(params));
  return request(`${prefix}/${organizationId}/kpi-eval-header-atts`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存考评附件
 * @async
 * @function saveOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function saveLineAttachment(params) {
  const organizationId = getCurrentOrganizationId();
  const { tableValues, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/kpi-eval-header-atts`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/**
 * 删除考评附件
 * @async
 * @function deleteOperation
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function deleteLineAttachment(params) {
  const organizationId = getCurrentOrganizationId();
  const { attIdList, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/kpi-eval-header-atts`, {
    method: 'DELETE',
    body: attIdList,
    query: { customizeUnitCode },
  });
}

/**
 * 删除文件服务器中的文件
 * @async
 * @function onDraggerUploadRemove
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - 文件url
 * @returns {Object} fetch Promise
 */
export async function onDraggerUploadRemove(params) {
  const { organizationId, bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/**
 * 放弃评分
 *
 */
export async function handleGiveUpScore(params) {
  const organizationId = getCurrentOrganizationId();
  const { evalHeaderId, body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/batch-abandon`, {
    method: 'POST',
    body,
  });
}

// 判断权重是否相同
export async function weightSameJudge(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/current-user-weight-is-same/${evalHeaderId}/post`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body,
    }
  );
}

// 转交评分人
export async function transmitScorer(params) {
  const { evalHeaderId, ...body } = params;
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/batch-save-transform/${evalHeaderId}`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 *获取操作记录 modal 数据
 * @export
 * @param {string} params.headerId - 详情页面/档案 id
 * @returns {object} fetch promise
 */
export async function activityLogFetch(params) {
  const page = filterNullValueObject(parseParameters(params));
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/kpi-eval-opr-historys`, {
    method: 'GET',
    query: { evalHeaderId: params.headerId, ...page },
  });
}
