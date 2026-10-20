import request from 'utils/request';
import {
  getCurrentTenant,
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPRM, SRM_MDM, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 同步查询平台级预测模板
export async function handleSynchronize(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/ref-fcst-template/one`, {
    method: 'POST',
    body: params,
  });
}

// 查询租户级预测模板是否有已发布的数据
export async function queryAutoPlatData(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers`, {
    method: 'GET',
    query: params,
  });
}

// 删除查询租户级级预测模板
export async function deleteOrgTemplateLines(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除设置行字段
export async function deleteTemplateLines(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除维度属性设置行
export async function deleteTemplateDimensionLines(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-dimensions`, {
    method: 'DELETE',
    body: params,
  });
}

// 更新预测模板
export async function updateFcstTemplate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers`, {
    method: 'PUT',
    body: query,
  });
}

// 发布预测模板
export async function releaseFcstTemplate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/release`, {
    method: 'POST',
    body: query,
  });
}

// 查询当前租户级使用模板
export async function handleQueryTemp(params) {
  const { fcstStartDate, ...query } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/ui-fcst-template/${fcstStartDate}`,
    {
      method: 'GET',
      query,
    }
  );
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

// 删除预测维护行
export async function deletefrstLines(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers`, {
    method: 'DELETE',
    body: params,
  });
}

// 新建预测维护行
export async function updatefrstLines(params) {
  const { query, body } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/save`, {
    method: 'POST',
    body,
    query,
  });
}
// 发布预测维护行
export async function releasefrstLines(params) {
  const { query, body } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/release`, {
    method: 'POST',
    body,
    query,
  });
}

// 批量发布预测维护行
export async function releasefrstBatchLines(params) {
  const { query, body } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/batch/release`, {
    method: 'POST',
    body,
    query,
  });
}

// 关闭预测维护行
export async function closefrstLines(params) {
  const { query, body } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/close`, {
    method: 'POST',
    body,
    query,
  });
}

// 取消预测维护行
export async function concelfrstLines(params) {
  const { query, body } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/cancel`, {
    method: 'POST',
    body,
    query,
  });
}

// 供应商反馈行
export async function feedbackfrstLines(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-supply-headers/feedback`, {
    method: 'POST',
    body: params,
  });
}

// 查询汇总数量
export async function queryTabCount(query) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/workbench/count`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询存在预测的日期
 * @param {*} params
 * @returns date List
 */
export async function queryStartDate(query) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/fcst-start-date`, {
    method: 'GET',
    query,
  });
}
// 预测单维护操作记录
export async function queryHistory(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-actions`, {
    method: 'GET',
    query,
  });
}

// 预测单维护操作记录-版本记录
export async function queryVersion(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-header-vers/detail`, {
    method: 'GET',
    query,
  });
}

// 公司带业务实体
export async function fetchAutoGetCompany(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/purchase-company`, {
    method: 'GET',
    query: params,
  });
}
// 采购组织带采购员
export async function fetchAutoGetPurchasing(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/agent`, {
    method: 'GET',
    query: params,
  });
}

// 供应商保存反馈信息

export async function saveLineFeedInfo(params) {
  // /v1/{organizationId}/fcst-supply-headers/feedback
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-supply-headers/supplier/save`, {
    method: 'POST',
    body: params,
  });
}

// 查询导入模板
export async function queryImportTemplate(pramas) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/excel/export/template/info`, {
    method: 'GET',
    query: pramas,
  });
}

// 查询
export async function queryStatus(pramas) {
  return request(`${SRM_SPRM}/v1/${organizationId}/import/data/status`, {
    method: 'GET',
    query: pramas,
  });
}

// 校验数据
export async function validateData() {
  // /v1/{organizationId}/import/data/status
  return request(`${SRM_SPRM}/v1/${organizationId}/excel/export/template/info`, {
    method: 'GET',
  });
}
// 查询
export async function importData() {
  return request(`${SRM_SPRM}/v1/${organizationId}/excel/export/template/info`, {
    method: 'GET',
  });
} // 查询导入历史
export async function queryImportHistory(params, query = {}) {
  const { templateCode } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/import/manager`, {
    method: 'GET',
    query: {
      ...parseParameters(query),
      templateCode,
    },
  });
} // 删除导入历史
export async function deleteImportHistory() {
  return request(`${SRM_SPRM}/v1/${organizationId}/excel/export/template/info`, {
    method: 'GET',
  });
}

// 保存明细表格中的数据
export async function saveDetail(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-line-details`, {
    method: 'POST',
    body,
  });
}

// 保存明细表格中的数据供应商
export async function saveSupplierDetail(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-supply-line-details`, {
    method: 'PUT',
    body,
  });
}

// 删除明细表格中的数据
export async function deleteLines(body) {
  // /v1/{organizationId}/fcst-line-details
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-line-details`, {
    method: 'DELETE',
    body,
  });
}

// 反馈结果同步外部系统
export async function sysExternal(body) {
  // /v1/{organizationId}/fcst-line-details
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/feedback-batch-sync`, {
    method: 'POST',
    body,
  });
}

// 根据预测头id查询模板信息
export async function fetchTemplete(param) {
  const { fcstSupplyHeaderId, ...query } = param;
  return request(
    `${SRM_SPRM}/v1/${organizationId}/fcst-supply-headers/approval/template/${fcstSupplyHeaderId}`,
    {
      method: 'GET',
    },
    query
  );
}

// 保存设置值集参数配置
export async function saveParamsSetting(param) {
  const { templateLineId, data } = param;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-lov-params/${templateLineId}`, {
    method: 'POST',
    body: data,
  });
}

// 审批通过预测
export async function aproveFrst(param) {
  const { data } = param;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/approve/approval`, {
    method: 'POST',
    body: data,
  });
}

// 审批拒绝预测
export async function rejectFrst(param) {
  const { data } = param;
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/approve/reject`, {
    method: 'POST',
    body: data,
  });
}

// 复制预测管理模版
export async function copyFrst(param) {
  const { templateHeaderId } = param;
  return request(
    `${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/copy-fcst-template/${templateHeaderId}`,
    {
      method: 'POST',
    }
  );
}

// 查询所有已发布的预测管理模版
export async function fetchAllFrst() {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/released-template`, {
    method: 'GET',
  });
}

// 查询当前模板的反馈起始时间
export async function fetchQueryDate(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/released/fcst`, {
    method: 'GET',
    query: { ...params, asyncCountFlag: 'Y' },
  });
}

// 修改预测单模板的状态启用/禁用
export async function handleEnableOrNot(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/fcst-template-headers/enable`, {
    method: 'POST',
    body,
  });
}

export async function fetchDateDefaultFlag() {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/spfm_tenant_logical_distinction/list-from-site`,
    {
      method: 'POST',
      body: {
        tenantNum: getCurrentTenant().tenantNum,
        logicalDistinction: 'SPRM_FCST_DEFAULT_DATE',
      },
    }
  );
}
