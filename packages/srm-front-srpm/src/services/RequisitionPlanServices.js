import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_MDM, SRM_SRPM, SRM_SPRM, SRM_PLATFORM } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';

const organizationId = getCurrentOrganizationId();

// 查询需求计划工作台数据数量
export async function queryListCount() {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/count`, {
    method: 'GET',
    query: { onlyCountLimit: 100 },
  });
}

// 查询需求计划工作台详细数据
export async function queryDetail(params) {
  const { rpHeaderId, ...other } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/detail/${rpHeaderId}`, {
    method: 'GET',
    query: other,
  });
}

// 查询公司信息,带出业务实体/采购组织
export async function fetchAutoGetCompany(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/purchase-company`, {
    method: 'GET',
    query: params,
  });
}

// 采购组织带出采购员
export async function fetchAutoGetPurchasing(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/agent`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 删除行
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteLines({ prLines }) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/lines`, {
    method: 'DELETE',
    body: prLines,
  });
}

/**
 * 保存
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function save(body) {
  const { customizeUnitCode } = body;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 提交提报单
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function singleSubmit(body) {
  const { customizeUnitCode } = body;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/submit`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 删除提报单
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteHeader(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 取消提报单
 * @async
 * @function update
 * @param {object} params - 头数据
 * @returns {object} fetch Promise
 */
export async function cancel(params) {
  const { cancelRemark, ...body } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/cancel`, {
    method: 'POST',
    body,
    query: {
      cancelRemark,
    },
  });
}

/**
 * 复制
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function copy(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/copy`, {
    method: 'POST',
    body,
  });
}

/**
 * 查询操作记录
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchActionHistory(rpHeaderId) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/action/${rpHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询审批记录
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchApproveHistory(rpHeaderId) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/workflow-history/${rpHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询外部系统审批记录
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchExternalHistory(rpHeaderId) {
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-approval-historys/list/${rpHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  // const organizationId = getCurrentOrganizationId();
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

/**
 * 行取消接口
 * @async
 * @returns {object} fetch Promise
 */
export async function lineCancel(params) {
  const { cancelRemark, ...body } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/cancel/lines`, {
    method: 'POST',
    body: body.cancelLines,
    query: {
      cancelRemark,
    },
  });
}

/**
 * 批量重新同步接口
 * @async
 * @params {object} rpHeaderIdList
 * @returns {object} list 同步失败的行
 */
export async function batchReSync(body) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/batch-sync`, {
    method: 'POST',
    body,
  });
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag`, {
    body,
    query,
    method: 'POST',
  });
}

/**
 * 工作流流程撤销
 * @param {object} params - 接口传参
 */
export async function revokeWorkFlowByKey(params) {
  const { businessKey } = params;
  let realRes;
  const res = await request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}

/**
 * 批量重新同步接口
 * @async
 * @params {object} rpHeaderIdList
 * @returns {object} list 同步失败的行
 */
export async function workFlowSubmitSave(body) {
  const { customizeUnitCode } = body;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}
