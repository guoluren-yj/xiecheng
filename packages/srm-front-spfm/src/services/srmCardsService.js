/**
 * expertService.js - 工作台卡片 service
 * @date: 2019-02-23
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, getUserOrganizationId, parseParameters } from 'utils/utils';
import { SRM_PLATFORM, SRM_SSLM, SRM_SPUC, SRM_SPCM, SRM_MDM, SRM_SPRM } from '_utils/config';
import { HZERO_MSG, HZERO_HWFP, HZERO_IAM } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

/**
 *
 * 查询固定的常用功能
 * @export
 * @returns
 */
export async function queryFunctions() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-menu-sets/queryFunction`, {
    method: 'GET',
  });
}

/**
 *
 * 查询所有常用功能
 * @export
 * @returns
 */
export async function queryAllFunctions() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-menu-sets/queryAllFunction`, {
    method: 'GET',
  });
}

/**
 *
 * 模块化数字统计数据查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryStatistical(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard_clause`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存 - 要显示的采购订单
 * @export
 * @param {Object} params
 * @returns
 */
export async function addPurchases(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-clause-sets`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存 - 要显示的零件承认
 * @export
 * @param {Object} params
 * @returns
 */
export async function addParts(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-clause-sets`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存 - 要显示的寻源条目
 * @export
 * @param {Object} params
 * @returns
 */
export async function addSourceEvent(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-clause-sets`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存 - 常用功能
 * @export
 * @param {Object} params
 * @returns
 */
export async function addFunctions(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-menu-sets/createMenu`, {
    method: 'POST',
    body: params,
  });
}
/**
 *
 * 系统消息查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function querySystemMessage(params) {
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 待办事项查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryTodo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard-doc-stats`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 工作流查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryWorkflow(params) {
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/activiti/task/query?ignoreEmployeeNotFound=true`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 *
 * 我的抄送流程查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryMyCopyProcess(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process/instance/query/page?carbonCopy=true`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询企业公告列表数据
 * @param {Object} params - 查询参数
 */
export async function queryAnnouncement(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/platform-notices-work`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询平台公告列表数据
 * @param {Object} params - 查询参数
 */
export async function queryCompanyNotice(params) {
  return request(`${SRM_PLATFORM}/v1/platform-notices-work`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 采购方报表查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryPurchasingReport(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard-amt-stats/purchaser`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 查询采购总额报表
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryTotalPurchaseReport(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/purchaser`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询值集
 * @async
 * @function queryTreeCategory
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryTreeCategory(params = {}) {
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/lov`, {
    query: params,
  });
}

/**
 *
 * 供应商以及采购方领导报表查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryReports(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard-amt-stats/supplier/${tenantId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 *改变消息为已读
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function changeRead(params) {
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/read-flag`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 查询风险日报
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskDaily(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-event`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询风险详情分类列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskCategory() {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category/getEnable`, {
    method: 'GET',
  });
}

/**
 * 查询风险详情分类列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskDetail(params) {
  const { eventDate } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-event/${eventDate}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询风险监控日报详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskDailyModal(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-event/detail`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询风险监控url
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryEnterpriseRisk(query) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise/detail`, {
    method: 'GET',
    // responseType: 'text',
    query,
  });
}

/**
 * 风险监控标记已读
 *
 * @export
 * @param {*} params
 * @returns
 */
// export async function queryEnterpriseRiskRead(query) {
//   return request(`${SRM_SSLM}/v1/${organizationId}/risk-event`, {
//     method: 'put',
//     query,
//   });
// }

// 协议配置是否显示引用采购申请
export async function queryContractSettings() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-sources`, {
    method: 'GET',
  });
}

// 供应商报表查询
export async function querySupplierReportList() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/outbound-jump/list`, {
    method: 'GET',
  });
}

// 协议配置是否显示引用采购申请
export async function queryOrderSettings() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-merge-rule`, {
    method: 'GET',
  });
}

export async function queryPermissions() {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: [
      'sodr.purchase-order-maintain.list.button.referPurchaseRequest',
      'srm.po-admin.po.order-workspace.ps.button.refbilldetailspurrqs.create',
      'ssrc.inquiry-hall.list.button.applytoinquiry',
      'ssrc.new-inquiry-hall.list.button.applytoinquiry',
      'ssrc.bid-hall.list.button.applytoinquiry',
      'ssrc.new-bid-hall.button.applytoinquiry',
    ],
  });
}

// 供应商报表跳转链接
export async function querySupplierReportLink({ link }) {
  return request(`${link}`, {
    method: 'GET',
    responseType: 'text',
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
 * 寻源明细(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetOrder(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/rel-table/query/spuc_old_order_tenant`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 需求执行工作台-配置表配置新老节点
 * */
export async function fetchConfigSheet(params) {
  const { tableCode, ...othesProps } = params;
  if (tableCode === 'sprm_old_ui_config') {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-old-ui-config`,
      {
        method: 'POST',
        body: othesProps,
      }
    );
  } else {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-platform-rel-table`,
      {
        method: 'POST',
        body: othesProps,
      }
    );
  }
}

/**
 * 零售道具采购总额表查询
 */
export async function fetchTotalRetailReceipts(params, filterData = {}) {
  return request(`/scux/v1/${organizationId}/xtep/retail-card/dashboard-clause`, {
    method: 'GET',
    query: { levelCode: params, ...filterData },
  });
}

/**
 *
 * 查询收货返回新老事物判断
 * @export
 * @returns
 */
export async function queryGoodOldRoNew() {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/line/new-rcv-enable`, {
    method: 'GET',
  });
}

/**
 *  查询是否在配置表ource_new_bid_config中且【招投标（新招标）】为是
 */
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

export async function getUxInvableTotal(role = 'purchaser') {
  return request(`/ssta/v1/${organizationId}/settles/${role}/page-invoice-able`, {
    method: 'GET',
    query: {
      page: 0,
      size: 1,
      onlyCountFlag: 'Y',
      stepFlag: 1,
      onlyCountLimit: 100,
      invoiceWithPaymentFlag: 0,
    },
  });
}
