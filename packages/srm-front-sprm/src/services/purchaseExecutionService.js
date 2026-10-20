import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPUC, SRM_SSRC, SRM_SPCM, SRM_PLATFORM, SRM_SPRM, SRM_SIEC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
// 查询采购申请分配数据
export async function queryAssignList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/can-assign/page`, {
    method: 'GET',
    query: { ...query },
  });
}

export async function handleOrderDate() {
  return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-line`, {
    method: 'GET',
    query: {
      erpControlFlag: 1,
    },
  });
}

export async function handleBiddingDate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
    method: 'GET',
    query: { ...params },
  });
}

export async function handleContractDate() {
  return request(`${SRM_SPCM}/v1/${organizationId}/prLine/page`, {
    method: 'GET',
    query: { erpControlFlag: 1, tenantId: organizationId, assignedFlag: 1, onlyCountFlag: 'Y' },
  });
}

export async function handleSourceDate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
    method: 'GET',
    query: { erpControlFlag: 1, ...params },
  });
}

export async function handleQuoteApprovalDate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/share/application`, {
    method: 'GET',
    query: { prCustomizeFilterFlag: 1, ...params },
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

// 是否开启新链路执行策略
export async function fetchNewLinkStrategy() {
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-requests/query-new-link/execution-strategy`,
    {
      method: 'GET',
    }
  );
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
  const { customizeUnitCode } = values;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/assign/batch-new`, {
    method: 'POST',
    body: {
      prLineVOS,
      ...values,
    },
    query: {
      customizeUnitCode,
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
 * 按行引用创建前校验
 * @export
 * @param {Object} params
 */
export async function checkOrderRule(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/po_config`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 按行引用创建
 * @export
 * @param {Object} params
 */
export async function lineCreate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line_new`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询配置中心
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 寻源明细(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetRfxPrepare(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_old_ui_config/list-from-site`,
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
  const { prLineIdList, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/share/valid-purchase`, {
    method: 'POST',
    body: { prLineIdList, ...otherParams },
  });
}

/**
 * 申请转询价创建API
 * @async
 * @function createApplyToInquiry
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function createApplyToInquiry(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/application`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 申请转招标创建API
 * @async
 * @function createApplyToInquiry
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function createApplyToBid(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid/purchase-requests`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 校验是否可以转协议
 * @async
 * @function createApplyToInquiry
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function createPcOrderVerified(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/createPcOrder-verified`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 申请转立项创建API
 * @async
 * @function createApplyToInquiry
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function createProject(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source-projects/application`, {
    method: 'POST',
    body: params,
  });
}

// 更新推荐供应商
export async function updateSupplier(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/from-pr/default-supplier`, {
    method: 'POST',
    body: params,
  });
}

// 获取老订单工作台租户配置表
export async function fetchOrderConfig(params) {
  const tableCode = 'spuc_old_order_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 获取老订单工作台租户配置表
export async function fetchNewBidConfig(params) {
  const tableCode = 'source_new_bid_config';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
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

// 获取配置表租户信息 不要再调用！！！
export async function fetchSettingTable(params) {
  const { tableCode } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-platform-rel-table`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function fetchSettingTableNew(params) {
  const { tableCode } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 项目信息工作台
// /v1/{organizationId}/pro-refer-pr/workbench-pr-line
export async function handleProjectDate(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pro-refer-pr/workbench-pr-line`, {
    method: 'GET',
    query: {
      ...params,
      prCustomizeFilterFlag: 1,
      erpControlFlag: 1,
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
export async function returntoassign(params) {
  const { prLineVOS, values } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/batch/back/unassign`, {
    method: 'PUT',
    body: { prLineVOS, ...values },
  });
}

/**
 * 按行引用创建前校验
 * @export
 * @param {Object} params
 */
export async function check(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/po_config`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 转单校验业务规则-推荐供应商/价格校验是否最新
 * @param {object} params - 接口传参
 */
export async function poFromPrLineNewCheck(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line-new/check`, {
    method: 'POST',
    body: params,
  });
}

// 更新执行策略 `${SRM_SPRM}/v1/${organizationId}/purchase-request/pr-line/batch-update/execution-strategy`,
// 后端通知改用原有的分配接口
export async function updateExecutionStrategy(params) {
  const { prLineVOS, values } = filterNullValueObject(parseParameters(params)); // values
  const { customizeUnitCode } = values;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/assign/batch-new`, {
    method: 'POST',
    body: {
      prLineVOS,
      ...values,
    },
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 更新需求执行策略接口， 调用申请参考价格取价服务
 * @params {object}
 */
export async function updateReferPrice(body) {
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-request/line/batch-upadte/execution-strategy-code`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 新建项目信息工作台接口
 * */
export async function createSiecProject(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/project/refer-pr/batch-create`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 寻源明细(新)-配置表配置寻源明细新老UI
 * */
export async function fetchConfigRfxUI(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/srm_source_project_old_ui_black_list/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询待转订单数量
export async function queryOrderCount(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/workbench-pr-line`, {
    method: 'GET',
    query: { ...params },
  });
}
