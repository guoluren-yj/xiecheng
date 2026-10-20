/**
 * index - 需求分配
 * @date: 2019-07-11
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SPUC, SRM_PLATFORM, SRM_SPRM, SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询请求
 * @export
 * @params {?string} params - 查询参数
 * @returns
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { sort = `${params.seachParam ? params.seachParam : 'displayPrNum,desc'}` } = query;
  if (query.seachParam) {
    delete query.seachParam;
  }
  if (
    Object.keys(filterNullValueObject(params)).filter(
      (ele) =>
        ![
          'erpControlFlag',
          'sort',
          'page',
          'size',
          'customizeUnitCode',
          'onlyCountFlag',
          'prLineStatusCode',
          'waitAssignRequestFlag',
          'asyncCountFlag',
          'canAssignLineDetailTabHasParamFlag',
        ].includes(ele)
    ).length
  ) {
    query.canAssignLineDetailTabHasParamFlag = 1;
  } else {
    query.canAssignLineDetailTabHasParamFlag = 0;
  }
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/can-assign/page`, {
    method: 'GET',
    query: { ...query, sort },
  });
}

/**
 * 保存分配信息
 * @export
 * @params {?string} params.values.executedBy - 需求执行人
 * @params {?string} params.values.assginRemark - 分配说明
 * @params {Array} params.prLineVOS - 选中行数据
 * @returns
 */
export async function saveAssignmentConfigure(params) {
  const { prLineVOS, values } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/assign/batch-new`, {
    method: 'POST',
    body: {
      prLineVOS,
      ...values,
    },
  });
}
/**
 * 保存暂挂信息
 * @export
 * @params {?sting} params.values.suspendRemark - 暂挂原因
 * @params {Array} params.prLineVOS - 选中行数据
 * @returns
 */
export async function saveSuspendConfigure(params) {
  const { prLineVOS, values } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/suspend/batch`, {
    method: 'POST',
    body: prLineVOS,
    query: values,
  });
}

/**
 * 启用暂挂的申请
 * @export
 * @params {Array} params - 需要启用的行
 * @returns
 */
export async function enable(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/suspend-cancel/batch`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 附件查看
 * @export
 * @param {string} params - 附件所在的需求申请的 id
 * @returns
 */
export async function viewAttachment(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchase-requisition-assignment/attachment`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 获取操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/actions`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询采购员 分页
 * @param {Object} params - 查询参数
 */
export async function queryExecutedBys(params) {
  const param = parseParameters(params);
  return request(`/iam/v1/lovs/sql/data`, {
    method: 'GET',
    query: { lovCode: 'SSLM.KPI_USER', tenantId: organizationId, ...param },
  });
}

// 查询采购员
export async function queryBuyer(params) {
  const { purchaseOrgIds, ...param } = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/purchase-agent`, {
    method: 'POST',
    query: { tenantId: organizationId, ...param },
    body: { purchaseOrgIds },
  });
}

// 查询参考价格
export async function priceList(params) {
  const { priceRecordId, ...others } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${priceRecordId}/price-library`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

// 获取当前租户是否为执行链路的老租户
export async function fetchExecutionLink(params) {
  const tableCode = 'sprm_execution_link_old_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-platform-rel-table`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 退回至待分配
 */
export async function backUnassign(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/batch/back/unassign`, {
    method: 'PUT',
    body: params,
  });
}

// 查询模块是否开启双单位-具体传参：{ moduleCode: 'SPRM' }
export async function fetchUomControl(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/secondary/uom/getcnf`, {
    method: 'GET',
    query: params,
  });
}

// 查询模块是否开启单据流-具体传参：{ moduleCode: 'SPRM' }
export async function fetchDocLinkControl(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/cnf-actions/SITE.SPFM.RELATION_DOC_CONTROL/invoke_with_parameter`,
    {
      method: 'GET',
      query: params,
    }
  );
}
