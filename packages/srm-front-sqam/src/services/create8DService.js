/**
 * service - 8D创建
 * @date: 2018-11-23
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_HWFP } from 'utils/config';
import { SRM_SQAM, SRM_PLATFORM, SRM_SPUC } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '@/utils/config';

const customizeUnitCode =
  'SQAM.CREATE_8D_DETAIL.BASIC,SQAM.CREATE_8D_DETAIL.PROBLEM,SQAM.CREATE_8D_DETAIL.GROUPMEMBER,SQAM.CREATE_8D_DETAIL.OTHERINFO,SQAM.CREATE_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.CREATE_8D_DETAIL.OTHERINFO_A';
const saveCustomizeUnitCode = `${customizeUnitCode},SQAM.CREATE_8D_DETAIL.TEMPMEASURE,SQAM.CREATE_8D_DETAIL.SHORTMEASURES,SQAM.CREATE_8D_DETAIL.ROOTCAUSE,SQAM.CREATE_8D_DETAIL.PERMANENTACTION,SQAM.CREATE_8D_DETAIL.OTHERAPPLICABLE,SQAM.CREATE_8D_DETAIL.STANDARDIZATION`;

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const spucPrefix = `${SRM_SPUC}/v1`;
const sslPrefix = `${SRM_SSLM}/v1`;

/**
 * 查询消息模板列表数据
 * @async
 * @function search8D
 * @param {object} params - 查询条件
 * @param {string} params.tenantId - 租户Id
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function search8D(params) {
  const param = parseParameters(params);
  param.customizeUnitCode = 'SQAM.CREATE_8D_LIST.GRID,SQAM.CREATE_8D_LIST.FILTER';
  return request(`${prefix}/${param.tenantId}/problem-headers`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 8D问题单明细查询
 * @async
 * @function searchDetail
 * @param {object} params - 查询条件
 * @param {string} params.tenantId - 租户Id
 * @param {!object} params.problemHeaderId - 问题单ID
 * @returns {object} fetch Promise
 */
export async function searchDetail(params) {
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
    }
  );
}
export async function searchDetail1() {
  // const customizeUnitCode = 'SQAM.CREATE_8D_DETAIL.BASIC';
  return request(`/hfle/v1/${getCurrentOrganizationId()}/capacity-configs?size=1000`, {
    method: 'GET',
  });
}
/**
 * 问题单-编辑保存
 * @async
 * @function update8D
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!number} params.problemHeaderId - 问题单ID
 * @param {!object} params.data - 问题单对象
 * @returns {object} fetch Promise
 */
export async function update8D(params) {
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params.data,
    }
  );
}
/**
 * 问题单-新建保存
 * @async
 * @function save8D
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - 问题单数组
 * @returns {object} fetch Promise
 */
export async function save8D(params) {
  return request(
    `${prefix}/${params.tenantId}/problem-headers/save?customizeUnitCode=${saveCustomizeUnitCode}`,
    {
      method: 'PUT',
      body: params.data,
    }
  );
}
/**
 * 问题单-批量删除
 * @async
 * @function delete8D
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - 问题单数组
 * @returns {object} fetch Promise
 */
export async function delete8D(params) {
  return request(`${prefix}/${params.tenantId}/problem-headers`, {
    method: 'DELETE',
    body: params.data,
  });
}
/**
 * 问题单-批量发布
 * @async
 * @function release8D
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - 问题单数组
 * @returns {object} fetch Promise
 */
export async function release8D(params) {
  const { data, tenantId, saveFlag } = params;
  return request(
    `${prefix}/${tenantId}/problem-headers/publish?customizeUnitCode=${saveCustomizeUnitCode}`,
    {
      method: 'PUT',
      body: data,
      query: { saveFlag },
    }
  );
}
/**
 * 保存attachmentUUID
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!number} params.problemHeaderId - 问题单ID
 * @param {!string} params.uuid - uuid
 * @param {!number} params.uuidType - uuid类型(1: 采购方；2：供应商)
 * @param {!object} params.data - 问题单对象
 */
export async function saveUUID(params) {
  const { tenantId, problemHeaderId, ...others } = params;
  return request(`${prefix}/${tenantId}/problem-headers/${problemHeaderId}/attachment-uuid`, {
    method: 'POST',
    query: { ...others },
  });
}
/**
 * 查询关联8D列表数据
 * @async
 * @function relation8D
 * @param {object} params - 查询条件
 * @param {string} params.tenantId - 租户Id
 * @param {string} params.problemHeaderId - 头Id
 * @returns {object} fetch Promise
 */
export async function relation8D(params) {
  const { tenantId, problemHeaderId, ...others } = params;
  return request(`${prefix}/${tenantId}/header-associates/${problemHeaderId}/assocaite`, {
    method: 'GET',
    query: parseParameters(others),
  });
}
/**
 * 保存关联8D列表数据
 * @async
 * @function saveRelation8D
 * @param {object} params - 保存参数
 * @param {string} params.tenantId - 租户Id
 * @param {string} params.problemHeaderId - 头Id
 * @returns {object} fetch Promise
 */
export async function saveRelation8D(params) {
  const { tenantId, list, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/header-associates/${problemHeaderId}/create`, {
    method: 'POST',
    body: list,
  });
}
/**
 * 查询可新增的关联8D
 * @async
 * @function saveRelation8D
 * @param {object} params - 查询条件
 * @param {string} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function fetchAddRelation8D(params) {
  const { tenantId, ...others } = parseParameters(params);
  return request(`${prefix}/${tenantId}/problem-headers/page/completed`, {
    method: 'GET',
    query: others,
  });
}
/**
 * 删除关联8D
 * @async
 * @function saveRelation8D
 * @param {object} params - 删除参数
 * @param {string} params.tenantId - 租户Id
 * @param {string} params.list - 关联8D数组
 * @returns {object} fetch Promise
 */
export async function deleteRelation8D(params) {
  const { tenantId, list } = params;
  return request(`${prefix}/${tenantId}/header-associates`, {
    method: 'DELETE',
    body: list,
  });
}
/**
 * 查询小组成员
 * @async
 * @function queryTeamMembers
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {string} params.problemHeaderId 头ID
 * @returns {object} fetch Promise
 */
export async function queryTeamMembers(params) {
  const { tenantId, problemHeaderId, unitCode } = params;
  return request(
    `${prefix}/${tenantId}/ed-problem-teams/${problemHeaderId}?customizeUnitCode=${unitCode}`,
    {
      method: 'GET',
    }
  );
}
/**
 * 删除小组成员
 * @async
 * @function deleteTeamMembers
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function deleteTeamMembers(params) {
  const { tenantId, deleteLines, optcamp } = params;
  return request(`${prefix}/${tenantId}/ed-problem-teams?optcamp=${optcamp}`, {
    method: 'DELETE',
    body: deleteLines,
  });
}

export async function queryParentCode(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/parent-value`, {
    method: 'GET',
    query: params,
  });
}

export async function queryLovData(params) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 请求引用检验单数据
 * @param {Object} params
 * @returns
 */
export async function fetchQuoteData(params) {
  const { tenantId, query } = params;
  return request(`${prefix}/${tenantId}/incoming-inspections`, {
    query: filterNullValueObject(parseParameters(query)),
  });
}

// 引用创建
export async function quoteAndCreate(params) {
  const { tenantId, body } = params;
  return request(`${prefix}/${tenantId}/incoming-inspections/reference/create`, {
    query: body,
  });
}

// 查询来源信息
export async function fetchSourceInfo(params) {
  const { tenantId, problemHeaderId, ...query } = params;
  return request(`${prefix}/${tenantId}/ed-problem-inspections/${problemHeaderId}`, {
    query,
  });
}

// 删除来源信息
export async function deleteSourceInfo(params) {
  const { tenantId, body } = params;
  return request(`${prefix}/${tenantId}/ed-problem-inspections`, {
    method: 'DELETE',
    body,
  });
}

// 查询引用质检单创建定义查询条件
export async function fetchIncomingSearch(params) {
  return request(`${SRM_SQAM}/v1/${params.tenantId}/incoming-search-configs/list`);
}

// 获取当前服务器时间
export async function getServerTime(params) {
  return request(`${SRM_SQAM}/v1/${params.tenantId}/problem-headers/getDate`);
}

// 查询新增的关联采购订单
export async function fetchAddPurchaseOrder(params) {
  const { tenantId, ...query } = parseParameters(params);
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos/un-relation-po/query`, {
    method: 'GET',
    query,
  });
}

// 查询关联采购订单
export async function fetchPurchaseOrder(params) {
  const { tenantId, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos/${problemHeaderId}/query`);
}

export async function savePurchaseOrder(params) {
  const { tenantId, list, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos/${problemHeaderId}/create`, {
    method: 'POST',
    body: list,
  });
}

// 删除来源信息
export async function delPurchaseOrder(params) {
  const { tenantId, list } = params;
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos`, {
    method: 'DELETE',
    body: list,
  });
}

// 查询新增的关联采购订单
export async function fetchLovSql(params) {
  return request(`${prefix}/lovs/sql/data`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function fetchSettingValue(params) {
  const { tenantId, settingCode } = params;
  return request(`${SRM_PLATFORM}/v1/${tenantId}/settings/${settingCode}`);
}
export async function queryApprovalMethod(params) {
  const { tenantId, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/problem-headers/queryApprovalMethod/${problemHeaderId}`);
}
export async function fetchOperatorData(params) {
  const { problemHeaderId, ...query } = params;
  return request(`${prefix}/operation-historys/${problemHeaderId}`, {
    method: 'GET',
    query,
  });
}

export async function fetchApprovalData(params) {
  const { tenantId, ...query } = params;
  return request(`${HZERO_HWFP}/v1/${tenantId}/activiti/task/historyApproval`, {
    method: 'POST',
    query,
  });
}

export async function selectCreate8DConfig(params) {
  const { tenantId } = params;
  return request(`${prefix}/${tenantId}/problem-headers/ed-creation-cnf-config`, {
    method: 'GET',
  });
}

/**
 * 请求质检事务列表
 * @param {Object} params
 * @returns
 */
export async function fetchTrxHeader(params) {
  const { tenantId, query } = params;
  return request(`${spucPrefix}/${tenantId}/sinv/rcv/trx/workbench/trx/finish/line`, {
    query: filterNullValueObject(parseParameters(query)),
  });
}

/**
 * 请求质检事务列表供应商
 * @param {Object} params
 * @returns
 */
export async function fetchTrxHeaderSupplier(params) {
  const { tenantId, query } = params;
  return request(`${spucPrefix}/${tenantId}/sinv/rcv/trx/workbench/supplier/trx/finish/line`, {
    query: filterNullValueObject(parseParameters(query)),
  });
}

// 引用创建
export async function trxQuoteAndCreate(params) {
  const { tenantId, body } = params;
  return request(`${prefix}/${tenantId}/problem-headers/reference/create`, {
    query: body,
  });
}

export async function siteInvestigateReport(params) {
  const { tenantId, query } = params;
  const data = parseParameters(query);
  data.size = 1000;
  return request(`${sslPrefix}/${tenantId}/site-eval-headers/result/evaluating`, {
    query: data,
  });
}

export async function siteEvalReportHeader(params) {
  const { tenantId, query } = params;
  const data = parseParameters(query);
  return request(`${sslPrefix}/${tenantId}/site-eval-headers/eval-report-header`, {
    query: data,
  });
}

export async function userID(params) {
  return request(`/iam/v1/${getCurrentOrganizationId()}/user-defaults`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询基本信息数据
 * @async
 * @function search8DDetail
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function searchCreateDetail(params) {
  const {problemHeaderId, ...query} = params;
  return request(`${prefix}/${params.tenantId}/problem-headers/${problemHeaderId}/detail`, {
    method: 'GET',
    query,
  });
}

export async function delDproblemheaderdetaillines(problemHeader) {
  const problemHeaderId = problemHeader.map((item) => ({
    detailLineId: item.detailLineId,
    problemHeaderId: item.problemHeaderId,
  }));
  return request(
    `${prefix}/${getCurrentOrganizationId()}/edproblemheaderdetaillines/delete/lines`,
    {
      method: 'POST',
      body: problemHeaderId,
    }
  );
}

export async function delDproblemheaderdetaillinesA(problemHeader) {
  const problemHeaderId = problemHeader.map((item) => ({
    otherDetailId: item.otherDetailId,
    problemHeaderId: item.problemHeaderId,
  }));
  return request(`${prefix}/${getCurrentOrganizationId()}/ed-problem-header-other-details/delete`, {
    method: 'POST',
    body: problemHeaderId,
  });
}
