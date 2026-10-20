import request from 'utils/request';
import { HZERO_HWFP, HZERO_IAM } from 'utils/config';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
} from 'utils/utils';

import { parseC7nParameters, encryptMd5 } from '@/utils/utils';
import { SRM_SPC, SRM_PLATFORM } from '_utils/config';
/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

/**
 * 价格库-请求头配置
 * @async
 * @function fetchPriceLibHeaderConfig
 */
export async function fetchPriceLibHeaderConfig(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/tableHeaderList`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-获取SITE.SSRC.QUOTATION_SET业务规则定义
 * @async
 * @function fetchPriceLibHeaderConfig
 */
export async function fetchRuleDefinition() {
  return request(
    `${SRM_SPC}/v1/${organizationId}/price-lib-mains/rule-definition/SITE.SSRC.QUOTATION_SET`,
    {
      method: 'GET',
    }
  );
}

/**
 * 价格库-获取权限名单
 * @async
 * @function fetchPriceLibAuthoritylist
 */
export async function fetchPriceLibAuthorityList(params) {
  const { configCode, ...otherParams } = params;
  return request(`/sada/v1/${organizationId}/rel-table-records/${configCode}/pageLogin`, {
    method: 'POST',
    query: {
      page: 0,
      size: 999,
    },
    body: {
      ...otherParams,
      enableFlag: '1',
    },
  });
}

/**
 * 价格库-列表数据
 * @async
 * @function fetchPriceLibData
 */
export async function fetchPriceLibData(params) {
  const { viewCode } = params;
  const url =
    viewCode && viewCode !== 'ALL_VIEW'
      ? `${SRM_SPC}/v1/${organizationId}/price-lib-views`
      : `${SRM_SPC}/v1/${organizationId}/price-lib-mains`;
  const param = filterNullValueObject(parseC7nParameters(params));
  return request(url, {
    method: 'GET',
    query: {
      ...param,
      sign: encryptMd5({ templateCode: param?.templateCode }),
    },
  });
}

/**
 * 价格库-维护页列表数据
 * @async
 * @function fetchPriceLibUpdateData
 */
export async function fetchPriceLibUpdateData(params = {}) {
  const { isPost, ...otherParams } = params;
  const url = isPost
    ? `${SRM_SPC}/v1/${organizationId}/price-lib-mains/listPost`
    : `${SRM_SPC}/v1/${organizationId}/price-lib-mains`;
  const param = filterNullValueObject(parseC7nParameters(otherParams));
  const dataMap = isPost
    ? {
        method: 'POST',
        body: param,
      }
    : {
        method: 'GET',
        query: {
          ...param,
          sign: encryptMd5({ templateCode: param?.templateCode }),
        },
      };
  return request(url, dataMap);
}

/**
 * 价格库-删除
 * @async
 * @function deleteLines
 */
export async function deleteLines(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 价格库-保存
 * @async
 * @function savePriceLib
 */
export async function savePriceLib(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-发布
 * @async
 * @function releasePriceLib
 */
export async function releasePriceLib(params) {
  const { dataSource, ...others } = params;
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains`, {
    method: 'PUT',
    query: others,
    body: dataSource,
  });
}

/**
 * 价格库-下发价格
 * @async
 * @function distributionPriceLib
 */
export async function distributionPriceLib(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains/price-distribution`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-发布前校验
 * @async
 * @function preReleaseValidate
 */
export async function preReleaseValidate(dataSource) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains/releasePreValid`, {
    method: 'POST',
    body: dataSource,
  });
}

/**
 * 价格库-全量发布
 * @async
 * @function releasePriceLib
 */
export async function releaseAllPriceLib(params) {
  const { dataSource, ...others } = filterNullValueObject(parseC7nParameters(params));
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains/largeDataVolumeRelease`, {
    method: 'POST',
    query: others,
    body: dataSource,
  });
}

/**
 * 价格库-置为无效
 * @async
 * @function deactivatePriceLib
 */
export async function deactivatePriceLib(params, viewCode, customizeUnitCode) {
  const url =
    viewCode && viewCode !== 'ALL_VIEW'
      ? `${SRM_SPC}/v1/${organizationId}/price-lib-views/invalid`
      : `${SRM_SPC}/v1/${organizationId}/price-lib-mains/invalid`;
  return request(url, {
    method: 'PUT',
    query: {
      customizeUnitCode,
    },
    body: params,
  });
}

/**
 * 导入ERP
 * @async
 * @function importToErp
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function fetchImportToERP(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains/import-erp`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-适用范围-查询tab标签
 * @async
 * @function fetchScopeTabs
 */
export async function fetchScopeTabs(params) {
  const { viewCode } = params;
  const url =
    viewCode && viewCode !== 'ALL_VIEW'
      ? `${SRM_SPC}/v1/${organizationId}/price-lib-view-scopes`
      : `${SRM_SPC}/v1/${organizationId}/price-app-scopes`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库-适用范围-保存新增维度tab
 * @async
 * @function saveAddTab
 */
export async function saveAddTabs(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-app-scopes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格拓展策略 - 删除tab
 * @async
 * @function deleteTab
 */
export async function deleteTab(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-app-scopes`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 价格库-适用范围-保存引用
 * @async
 * @function saveIntroduce
 */
export async function saveIntroduce(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines/introduce`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-适用范围-获取lov配置头
 * @async
 * @function fetchLovConfig
 */
export async function fetchLovConfig(params) {
  const url = `/hpfm/v1/${organizationId}/lov-view/info`;
  return request(url, {
    method: 'GET',
    query: { ...params, tenantId },
  });
}

/**
 * 价格库-适用范围-加入全部
 * @async
 * @function saveJoinAll
 */
export async function saveJoinAll(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-app-scopes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-适用范围-启用禁用
 * @async
 * @function handleEnable
 */
export async function handleEnable(params) {
  const { data = [], viewCode } = params;
  const url =
    viewCode && viewCode !== 'ALL_VIEW'
      ? `${SRM_SPC}/v1/${organizationId}/price-lib-vw-scope-lns`
      : `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines`;
  return request(url, {
    method: 'POST',
    body: data,
  });
}

/**
 * 价格库-请求试图配置数据
 * @async
 * @function fetchViewSwitchData
 */
export async function fetchViewSwitchData(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-view-confs/viewSwitch`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库-保存视图
 * @async
 * @function saveViewSwitch
 */
export async function saveViewSwitch(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-user-views`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-列表数据
 * @async
 * @function fetchPriceLibApproveData
 */
export async function fetchPriceLibApproveData(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-req-mains`;
  const param = filterNullValueObject(parseC7nParameters(params));
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 价格库审批拒绝-删除
 * @async
 * @function deleteApproveLines
 */
export async function deleteApproveLines(params) {
  const { requestId } = params;
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-req-mains/${requestId}`, {
    method: 'DELETE',
    body: params.data,
  });
}

/**
 * 价格库- 价格库审批拒绝结果查询 保存（明细）
 * @async
 * @function saveTableInfo
 */
export async function saveTableInfo(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-reqs`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 价格库- 价格库审批拒绝结果查询 发布（明细）
 * @async
 * @function releasePriceAppLib
 */
export async function releasePriceAppLib(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-reqs/release`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 价格库- 价格库审批中/审批通过结果 撤回 （明细）
 * @async
 * @function revokePriceLibrary
 */
export async function revokePriceLibrary(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-reqs/revoke`, {
    GET: 'PUT',
    query: params,
  });
}

// 查询审批历史记录
export async function fetchHistoryApproval(params) {
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/activiti/task/historyApproval`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 价格库-确定是自审批/工作流审批/外部审批
 * @async
 * @function fetchApproveMethod
 */
export async function fetchApproveMethod(params) {
  const { dataSource, ...others } = params;
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-mains/approveMethod`, {
    method: 'PUT',
    query: others,
    body: dataSource,
  });
}

/**
 * 价格库-审批历史
 * @async
 * @function fetchHistoryInfo
 */
export async function fetchHistoryInfo(params) {
  // const businessKey = `SSRC.PRICE_LIB_REQ_${params.requestId}_${organizationId}`;
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/activiti/task/historyApproval?businessKey=${params}&needMerge=true&commentRecordFlag=true&commentStartFlag=true`,
    {
      method: 'POST',
    }
  );
}

/**
 * 价格库-适用范围-查询tab标签
 * @async
 * @function fetchApprovingScopeTab
 */
export async function fetchApprovingScopeTab(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-req-scopes`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库-适用范围-查询tab标签
 * @async
 * @function fetchApprovingScopeTab
 */
export async function fetchApprovingScopeTabOther(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-app-scopes`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库-趋势图-查询chart数据
 * @async
 * @function
 */
export async function fetchQueryChartData(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-mains/analysis`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库发布进度 - 列表查询
 * @async
 * @function
 */
export async function fetchQueryReleasedProgress(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-mains/progress`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库发布 - 重新发布
 * @async
 * @function
 */
export async function fetchRepublishPrice(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-mains/republish`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库发布 - 清空发布进度(全部/单批次号清空)
 * @async
 * @function
 */
export async function fetchClearProgress(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-mains/clear-progress`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 价格库审批记录
export async function fetchApprovalRecords(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-action/approval-records`;
  return request(url, {
    method: 'GET',
    query: { ...params, commentStartFlag: true, commentRecordFlag: true },
  });
}

/**
 * 是否允许撤销
 * @param {*} params
 */
export async function operationRevoke(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: params,
  });
}

// 价格库撤销审批
export async function revokeWorkflow(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-reqs/revoke-approval`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 价格库操作记录
export async function fetchOperationRecords(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-action/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 查询价格是否禁用
export async function fetchEnableTemplate(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-templates/enableTemplate`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 查询配置表【价格库新功能黑名单】价格库新功能黑名单
export async function fetchBlacklistConfig(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-mains/common-config`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 查询配置表是在价格库新功能白名单中
export async function fetchNewFunctionWhiteList(functionCode) {
  const data = {
    tenantNum: getCurrentTenant().tenantNum,
    functionCode,
  };
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/spc_new_function_white_list/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 查询个人中心默认值配置
 * @param {*} params
 * @returns
 */
export async function fetchCreatedUnitName(params) {
  return request(`${HZERO_IAM}/v1/${organizationId}/user-defaults/check`, {
    method: 'GET',
    query: params,
  });
}

// 查询附件数量
export async function getAttachmentCount(params = {}) {
  return request(`/hfle/v1/${organizationId}/files/count-batch`, {
    method: 'POST',
    body: params,
  });
}
