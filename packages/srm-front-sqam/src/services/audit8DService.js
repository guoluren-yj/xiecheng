/**
 * service - 8D审核
 * @date: 2018-11-27
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '@/utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const sslPrefix = `${SRM_SSLM}/v1`;

/**
 * 查询消息模板列表数据
 * @async
 * @function search8D
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function search8D(params) {
  const param = parseParameters(params);
  const customizeUnitCode = 'SQAM.AUDIT_8D_LIST.GRID,SQAM.AUDIT_8D_LIST.QUERY_FORM';
  return request(
    `${prefix}/${param.tenantId}/problem-headers?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 8D 保存
 * @async
 * @function save8D
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function save8D(params) {
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.AUDIT_8D_DETAIL.GROUPMEMBER,SQAM.AUDIT_8D_DETAIL.SHORTMEASURES,SQAM.AUDIT_8D_DETAIL.PERMANENTACTION,SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE,SQAM.AUDIT_8D_DETAIL.STANDARDIZATION,SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.AUDIT_8D_DETAIL.TEMPMEASURE,SQAM.AUDIT_8D_DETAIL.ROOTCAUSE,SQAM.AUDIT_8D_DETAIL.PROBLEM,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C,SQAM.AUDIT_8D_DETAIL.OTHERINFO,SQAM.AUDIT_8D_DETAIL.OTHERINFO_A';
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/auditSave?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: params.data,
    }
  );
}

/**
 *
 */
export async function searchAllDetail(params) {
  const { customizeUnitCode, ...others } = params;
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/detail?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * 继续反馈PCA
 * @param {object} params
 * @param {object} params.payload - 提交数据
 * @param {object} params.payload.tenantId - organizationId
 * @param {object} params.payload.problemHeaderId - 从详情页数据中获取到
 * @param {object} params.payload.data.objectVersionNumber - 从详情页数据中获取到
 * @param {object} params.payload.data.problemStatus - 从详情页数据中获取到
 * @param {object} params.payload.data.versionNum - 从详情页数据中获取到
 * @param {object} params.payload.data.approvedRemark - 审核意见
 */
export async function submitAskPca(params) {
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.AUDIT_8D_DETAIL.GROUPMEMBER,SQAM.AUDIT_8D_DETAIL.SHORTMEASURES,SQAM.AUDIT_8D_DETAIL.PERMANENTACTION,SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE,SQAM.AUDIT_8D_DETAIL.STANDARDIZATION,SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.AUDIT_8D_DETAIL.TEMPMEASURE,SQAM.AUDIT_8D_DETAIL.ROOTCAUSE,SQAM.AUDIT_8D_DETAIL.PROBLEM,SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C,SQAM.AUDIT_8D_DETAIL.PCA_STAGE,SQAM.AUDIT_8D_DETAIL.OTHERINFO,SQAM.AUDIT_8D_DETAIL.OTHERINFO_A';
  const { payload } = params;
  return request(
    `${prefix}/${payload.tenantId}/problem-headers/${payload.problemHeaderId}/ask-pca?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: payload.data,
    }
  );
}

/**
 * 完成8D
 * @param {object} params
 * @param {object} params.payload - 提交数据
 * @param {object} params.payload.tenantId - organizationId
 * @param {object} params.payload.problemHeaderId - 从详情页数据中获取到
 * @param {object} params.payload.data.objectVersionNumber - 从详情页数据中获取到
 * @param {object} params.payload.data.problemStatus - 从详情页数据中获取到
 * @param {object} params.payload.data.versionNum - 从详情页数据中获取到
 * @param {object} params.payload.data.approvedRemark - 审核意见
 */
export async function submitCompleted8D(params) {
  const { payload } = params;
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.AUDIT_8D_DETAIL.GROUPMEMBER,SQAM.AUDIT_8D_DETAIL.SHORTMEASURES,SQAM.AUDIT_8D_DETAIL.PERMANENTACTION,SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE,SQAM.AUDIT_8D_DETAIL.STANDARDIZATION,SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.AUDIT_8D_DETAIL.TEMPMEASURE,SQAM.AUDIT_8D_DETAIL.ROOTCAUSE,SQAM.AUDIT_8D_DETAIL.PROBLEM,SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE';
  return request(
    `${prefix}/${payload.tenantId}/problem-headers/${payload.problemHeaderId}/complete?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: payload.data,
    }
  );
}

/**
 * 审核拒绝
 * @param {object} params
 * @param {object} params.payload - 提交数据
 * @param {object} params.payload.tenantId - organizationId
 * @param {object} params.payload.problemHeaderId - 从详情页数据中获取到
 * @param {object} params.payload.data.objectVersionNumber - 从详情页数据中获取到
 * @param {object} params.payload.data.problemStatus - 从详情页数据中获取到
 * @param {object} params.payload.data.versionNum - 从详情页数据中获取到
 * @param {object} params.payload.data.approvedRemark - 审核意见
 */
export async function submitAuditReject(params) {
  const { payload } = params;
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.AUDIT_8D_DETAIL.GROUPMEMBER,SQAM.AUDIT_8D_DETAIL.SHORTMEASURES,SQAM.AUDIT_8D_DETAIL.PERMANENTACTION,SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE,SQAM.AUDIT_8D_DETAIL.STANDARDIZATION,SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.AUDIT_8D_DETAIL.TEMPMEASURE,SQAM.AUDIT_8D_DETAIL.ROOTCAUSE,SQAM.AUDIT_8D_DETAIL.PROBLEM,SQAM.AUDIT_8D_DETAIL.REJECT_STAGE';
  return request(
    `${prefix}/${payload.tenantId}/problem-headers/${payload.problemHeaderId}/reject?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: payload.data,
    }
  );
}

/**
 * 废弃8D
 * @param {object} params
 * @param {object} params.payload - 提交数据
 * @param {object} params.payload.tenantId - organizationId
 * @param {object} params.payload.problemHeaderId - 从详情页数据中获取到
 * @param {object} params.payload.data.objectVersionNumber - 从详情页数据中获取到
 * @param {object} params.payload.data.problemStatus - 从详情页数据中获取到
 * @param {object} params.payload.data.versionNum - 从详情页数据中获取到
 * @param {object} params.payload.data.approvedRemark - 审核意见
 */
export async function submitAbandon(params) {
  const { payload } = params;
  const customizeUnitCode =
    'SQAM.FEEDBACK_8D_DETAIL.BASIC,SQAM.AUDIT_8D_DETAIL.GROUPMEMBER,SQAM.AUDIT_8D_DETAIL.SHORTMEASURES,SQAM.AUDIT_8D_DETAIL.PERMANENTACTION,SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE,SQAM.AUDIT_8D_DETAIL.STANDARDIZATION,SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.AUDIT_8D_DETAIL.TEMPMEASURE,SQAM.AUDIT_8D_DETAIL.ROOTCAUSE,SQAM.AUDIT_8D_DETAIL.PROBLEM,SQAM.AUDIT_8D_DETAIL.MODAL_CANCEL,SQAM.AUDIT_8D_DETAIL.OTHERINFO,SQAM.AUDIT_8D_DETAIL.OTHERINFO_A';
  return request(
    `${prefix}/${payload.tenantId}/problem-headers/${payload.problemHeaderId}/cancel?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: payload.data,
    }
  );
}

/** 历史版本查询
 * @async
 * @function fetchHistoryVersion
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户Id
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function fetchHistoryVersion(params) {
  return request(
    `${prefix}/${params.tenantId}/problem-headers/${params.problemHeaderId}/page-his`,
    {
      method: 'GET',
    }
  );
}
/**
 * 操作记录查询
 * @async
 * @function fetchOperatorRecord
 * @param {object} params - 查询条件
 * @param {!string} params.problemHeaderId - 问题单Id
 * @returns {object} fetch Promise
 */
export async function fetchOperatorRecord(params) {
  return request(`${prefix}/operation-historys/${params.problemHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 关联8D
 */
export async function fetchAssociation(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SQAM}/v1/${organizationId}/header-associates/${params.problemHeaderId}/assocaite/check`,
    {
      method: 'GET',
    }
  );
}

export async function fetchSourceInfo(params) {
  const { tenantId, problemHeaderId, ...query } = params;
  return request(`${prefix}/${tenantId}/ed-problem-inspections/${problemHeaderId}`, {
    query,
  });
}

// 关联8D
export async function relation8D(params) {
  const { tenantId, problemHeaderId, ...others } = params;
  return request(`${prefix}/${tenantId}/header-associates/${problemHeaderId}/assocaite`, {
    method: 'GET',
    query: parseParameters(others),
  });
}

// 查询关联采购订单
export async function fetchPurchaseOrder(params) {
  const { tenantId, problemHeaderId } = params;
  return request(`${prefix}/${tenantId}/ed-problem-relation-pos/${problemHeaderId}/query`);
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
 * 质量整改反馈审核详情页面-时间调整
 * 确定按钮
 *
 */ export async function updateTime(params) {
  const { tenantId, body } = params;
  const { problemHeaderId } = body;
  return request(`${prefix}/${tenantId}/problem-headers/${problemHeaderId}/updateTime`, {
    method: 'POST',
    body,
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
