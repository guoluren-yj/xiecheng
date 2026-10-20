/**
 * services 寻源立项
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const { HZERO_IAM } = getEnvConfig();

// 寻源立项基本信息
export async function fetchProjectSetupHeader(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects/${sourceProjectId}`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchUnit() {
  return request(`${prefix}/${getCurrentOrganizationId()}/user`, {
    method: 'GET',
  });
}

// 寻源立项/保存
export async function saveProjectSetup(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source-projects/save`, {
    method: 'POST',
    query: { organizationId, customizeUnitCode },
    body: otherParams,
  });
}

// 寻源立项/创建
export async function createProject(params) {
  const { organizationId, newParams, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects`, {
    method: 'POST',
    query: { ...param },
    body: newParams,
  });
}

//  寻源立项/提交
export async function projectSetupSubmit(params) {
  const { organizationId, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source-projects/submit`, {
    method: 'POST',
    query: { organizationId, customizeUnitCode },
    body: otherParams,
  });
}

// 寻源立项/删除
export async function deleteProjectSetup(params) {
  const { organizationId, sourceProjectId, sourceProject = {}, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects/${sourceProjectId}`, {
    method: 'DELETE',
    query: { ...param },
    body: sourceProject,
  });
}

// 寻源立项/取消
export async function cancelProjectSetup(params) {
  const { organizationId, sourceProjectId, sourceProject = {}, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects/${sourceProjectId}/cancel`, {
    method: 'POST',
    query: { ...param },
    body: sourceProject,
  });
}

/**
 * 物品明细 - 批量删除
 * @async
 * @function deleteItemLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteItemLines(params) {
  return request(`${prefix}/${params.organizationId}/project-line-items`, {
    method: 'DELETE',
    query: {
      requestFrom: params.requestFrom,
    },
    body: params.remoteDelete,
  });
}

/**
 * 物品明细-新增
 * @async
 * @function saveItemLine
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveItemLine(params) {
  const { sourceProjectId, customizeUnitCode, requestFrom, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/project-line-items`, {
    method: 'POST',
    query: { sourceProjectId, customizeUnitCode, requestFrom },
    body: otherParams.newParameters,
  });
}
// fetchItemLine,

/**
 * 物品明细-数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchItemLine(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects/${sourceProjectId}/items`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 供应商列表 - 批量删除
 * @async
 * @function deleteSupplierLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteSupplierLines(params) {
  return request(`${prefix}/${params.organizationId}/project-line-suppliers `, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * saveSupplier
 * 保存供应商数据
 */
export async function saveSupplier(params) {
  const { organizationId, sourceProjectId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/project-line-suppliers`, {
    method: 'POST',
    query: { sourceProjectId, customizeUnitCode },
    body: others.newParams,
  });
}

/**
 * 筛选供应商弹窗list查询
 * @async
 * @function fetchSupplier
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSupplier(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects/${sourceProjectId}/suppliers`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 批量添加供应商数据查询
 * @async
 * @function fetchBulkSupplierData
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchBulkSupplierData(params = {}) {
  const { organizationId, lovCode, userId, companyId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/suppliers/lovForSupplier`, {
    method: 'GET',
    query: { ...param, organizationId, userId, companyId },
  });
}

export async function fetchListData(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchQuoteApproval(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/share/application`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function createQuoteApproval(params) {
  const { organizationId, ...param } = params;
  return request(`${prefix}/${organizationId}/source-projects/application`, {
    method: 'POST',
    body: param,
  });
}

export async function createQuoteApprovalDetail(params) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/source-projects/application/increase-items`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 申请转询价创建前校验API
 * @async
 * @function checkApplyToInquiry
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function checkApplyToInquiry(params) {
  const { organizationId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/share/valid-purchase`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 计划list查询
 * @async
 * @function fetchPlan
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPlan(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source-projects/${sourceProjectId}/plans`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * savePlanList
 * 保存计划列表数据
 */
export async function savePlanList(params) {
  const { organizationId, sourceProjectId, customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/project-line-plans`, {
    method: 'POST',
    query: { sourceProjectId, customizeUnitCode },
    body: others.formatNewParameters,
  });
}

/**
 * 计划列表 - 批量删除
 * @async
 * @function deletePlanLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deletePlanLines(params) {
  return request(`${prefix}/${params.organizationId}/project-line-plans `, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 标段/包信息查询
 * @async
 * @function fetchSection
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchSectionLine(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/project-line-sections/${sourceProjectId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 标段/包信息查询
 * @async
 * @function fetchSection
 * @param {object} params - 查询条件 - 不分页
 * @returns {object} fetch Promise
 */
export async function fetchSectionList(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/project-line-sections/${sourceProjectId}/sections`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * saveSectionList
 * 保存标段/包列表数据
 */
export async function saveSectionList(params) {
  const {
    organizationId,
    sourceProjectId,
    customizeUnitCode = '',
    requestFrom,
    ...others
  } = params;
  return request(`${prefix}/${organizationId}/project-line-sections/${sourceProjectId}`, {
    method: 'POST',
    query: {
      customizeUnitCode,
      requestFrom,
    },
    body: others.newParams,
  });
}

/**
 * 判断按钮权限
 * @param {!Array} params - 权限编码集合
 */
export async function checkPermission(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 标段/包编号---批量删除
 * @async
 * @function deletePlanLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteSectionLines(params) {
  return request(`${prefix}/${params.organizationId}/project-line-sections`, {
    method: 'DELETE',
    query: {
      requestFrom: params.requestFrom,
    },
    body: params.remoteDelete,
  });
}

/**
 * 保存用户记忆
 */
export async function saveUserMemory(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/user-config`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 分标段/包信息--物料查询
 * @async
 * @function fetchAddMaterialData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchAddMaterialData(params) {
  const { organizationId, sourceProjectId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}//${organizationId}/source-projects/${sourceProjectId}/items`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 获取用户记忆
 */
export async function queryUserMemory(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/user-config/batch`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 *分标段/包信息--物料保存
 * @async
 * @function saveSectionItemLine
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveSectionItemLine(params) {
  const { sourceProjectId, requestFrom, ...otherParams } = params;
  return request(`${prefix}/${otherParams.organizationId}/project-line-items`, {
    method: 'POST',
    query: { sourceProjectId, requestFrom },
    body: otherParams.newParameters,
  });
}

/**
 * 分标段/包信息--已有物料批量导入---查询
 * @async
 * @function fetchExistItemLine
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchExistItemLine(params) {
  const { organizationId, sourceProjectId, projectLineSectionId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${prefix}/${organizationId}/project-line-sections/${sourceProjectId}/${projectLineSectionId}/not-allot`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 分标段--添加物料--已有物料导--保存
 * @async
 * @function saveSecItemLines
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveSecItemLines(params) {
  const {
    organizationId,
    sourceProjectId,
    projectLineSectionId,
    requestFrom,
    ...otherParams
  } = params;
  return request(
    `${prefix}/${organizationId}/project-line-sections/${projectLineSectionId}/allot`,
    {
      method: 'POST',
      query: {
        requestFrom,
      },
      body: otherParams.newParameters,
    }
  );
}

/**
 * 立项转询价
 */
export async function createProjectToinquiry(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/rfx/project-application`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 立项转招标
 */
export async function createProjectToBid(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/bid/project-application`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 查询各个Tab的数量
 */
export async function searchTabNumber(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/source-projects/count`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 明细-进度条
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryProgress(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/${
      params?.sourceProjectId
    }/progress`,
    {
      method: 'GET',
    }
  );
}

/**
 * 明细-寻源项目明细表格
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchProjectQuoteLines(params) {
  const { sourceProjectId, ...otherParams } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/project-quote-lines/${sourceProjectId}/detail`,
    {
      method: 'GET',
      query: { ...otherParams },
    }
  );
}

/**
 * 明细-寻源项目明细表格-完成节点
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchFinishQuoteLines(params) {
  const { sourceProjectId, ...otherParams } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/project-quote-lines/${sourceProjectId}/finished/detail`,
    {
      method: 'GET',
      query: { ...otherParams },
    }
  );
}

/**
 * 寻源项目 - 复制
 * @export
 * @param {Object} params
 * @returns
 */
export async function copyProject(params) {
  const { sourceProjectId, customizeUnitCode } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/copy/${sourceProjectId}`,
    {
      method: 'POST',
      query: { customizeUnitCode },
    }
  );
}

// 改变公司lov清空供应商信息
export async function changeCompany(params) {
  const { sourceProjectId } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/change-company`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 物料行-释放申请
export async function releaseApplyApi(body) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/release/pr/by/line/button`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 寻源项目维护明细-资质到期信息提醒
 * @export
 * @param {String} rfxHeaderId
 * @returns
 */
export async function fetchQualificationInfo(sourceProjectId) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/source-projects/qualification-expired-info`,
    {
      method: 'POST',
      body: { sourceProjectId },
    }
  );
}

// 立项变更-撤销变更
export async function undoChangeInterFace(params) {
  const { customizeUnitCode, sourceProjectId, ...otherParams } = params || {};
  return request(
    `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/change/undo`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: otherParams,
    }
  );
}

// 寻源项目c7n变更保存
export async function saveInterFace(params) {
  const { customizeUnitCode, organizationId, ...otherParams } = params || {};
  return request(`${prefix}/${getCurrentOrganizationId()}/source-projects/change/save`, {
    method: 'POST',
    query: { customizeUnitCode, organizationId },
    body: otherParams,
  });
}

// 寻源项目c7n变更提交
export async function releaseInterFace(params) {
  const { customizeUnitCode, ...otherParams } = params || {};
  return request(`${prefix}/${getCurrentOrganizationId()}/source-projects/change/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

// 寻源项目c7n【新建/维护】保存
export async function saveEditData(params) {
  const { customizeUnitCode, organizationId, ...otherParams } = params || {};
  return request(`${prefix}/${getCurrentOrganizationId()}/source-projects/save/new/ui`, {
    method: 'POST',
    query: { customizeUnitCode, organizationId },
    body: otherParams,
  });
}

// 寻源项目查看版本
export async function fetchSpHistoryVersionList(params) {
  const { sourceProjectId, ...otherParams } = params || {};
  return request(
    `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/version/list`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

/**
 * 新申请转询价创建前校验API ----- 立项C7N页面
 * @async
 * @function prLineBatchValidatePurchase
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function prLineBatchValidatePurchase(params) {
  const { organizationId, prLineIdList, customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/share/pr-lines/quote/batch-valid-purchase`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { prLineIdList, ...otherParams },
  });
}
