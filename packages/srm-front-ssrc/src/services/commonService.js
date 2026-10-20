/**
 * service - 寻源平台/询价大厅
 * @date: 2019-06-14
 * @version: 1.0.0
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM, SRM_MDM, SRM_SPC } from '_utils/config';
import {
  parseParameters,
  getAccessToken,
  getCurrentTenant,
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { getIeVersion } from 'utils/browser';
import { API_HOST } from 'utils/config';
import { PrefixHpfmV1 } from '@/utils/globalVariable';
import { getToken } from '@/utils/utils';

const { HZERO_PLATFORM } = getEnvConfig();

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 操作记录数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchOperation(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/actions/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 查询配置中心配置
 * @param {String} settingCode - 查询设置项的 code
 */
export async function querySettingBatch(params = {}) {
  const { organizationId, ...others } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/batch`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 获取专家子账户_来源专家库 - 通用接口
 * @async
 * @param {Object} params - 查询条件
 * @returns {Promise} fetch Promise
 */
export async function queryExpertLibrary(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/expert/all`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 获取专家子账户_来源专家子账户 - 通用接口
 * @async
 * @param {Object} params - 查询条件
 * @returns {Promise} fetch Promise
 */
export async function queryExpertSubAccount(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`/iam/v1/${organizationId}/lovs/sql/data`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 下载
 * @export
 * @param {object} params 传递参数
 * @param {string} params.requestUrl 下载文件请求的url
 * @param {Object} params.queryParams 下载文件请求的查询参数，参数格式为：键值对
 */
export async function downloadFile(params = {}) {
  const { requestUrl: url, queryParams = {}, method = 'GET' } = params;
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
  const iframeName = `${url}${Math.random()}`;

  // 构建iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('name', iframeName);
  iframe.setAttribute('id', iframeName);
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.display = 'none';

  // 构建form
  const downloadForm = document.createElement('form');
  if (getIeVersion() === -1) {
    // 如果当前浏览器不为ie
    // form 指向 iframe
    downloadForm.setAttribute('target', iframeName);
  }

  // 设置token
  const tokenInput = document.createElement('input');
  tokenInput.setAttribute('type', 'hidden');
  tokenInput.setAttribute('name', 'access_token');
  tokenInput.setAttribute('value', `${getAccessToken()}`);

  // 处理post请求时token效验
  if (method === 'POST') {
    newUrl = `${newUrl}?access_token=${getAccessToken()}`;
  }

  // 表单添加请求配置
  downloadForm.setAttribute('method', method);
  downloadForm.setAttribute('action', newUrl);
  downloadForm.appendChild(tokenInput);

  // 表单添加查询参数
  // queryParams.forEach((item) => {
  //   const input = document.createElement('input');
  //   input.setAttribute('type', 'hidden');
  //   input.setAttribute('name', item.name);
  //   input.setAttribute('value', item.value);
  //   downloadForm.appendChild(input);
  // });

  for (const [key, value] of Object.entries(queryParams)) {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', key);
    input.setAttribute('value', value);
    downloadForm.appendChild(input);
  }

  document.body.appendChild(iframe);
  document.body.appendChild(downloadForm);
  downloadForm.submit();

  // setTimeout(() => {
  //   document.body.removeChild(downloadForm);
  //   document.body.removeChild(iframe);
  // }, 2500);
  return true;
}

/**
 * 查询精度
 */
export async function queryPrecision(params) {
  const organizationId = getCurrentOrganizationId();
  const { currencyCodes = [], uomIds = [], financialCodes = [], purTenantId } = params || {};
  return request(`${prefix}/${organizationId}/precision`, {
    method: 'GET',
    query: {
      currencyCodes,
      uomIds,
      financialCodes,
      purTenantId,
    },
  });
}

/**
 * 查询 LOV 配置.
 * {HZERO_PLATFORM}/v1/lov-view/info
 * @param {Object} params 参数
 */
export async function queryLovInfo(params) {
  return request(
    `${HZERO_PLATFORM}/v1/${
      isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
    }lov-view/info`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 新老UI-配置表查询
 * @param {!string} tableCode - 配置表名称
 * */
export async function queryUiDisplayConfig(params = {}) {
  const { organizationId, tableCode, ...otherParams } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: otherParams,
    }
  );
}

/**
 * 查询核价配置表
 */
export async function queryCheckPriceUiDisplayConfig() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_source_check_old_ui_config',
    tenant: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

/**
 * 查询使用新老汇率编辑配置表
 */
export async function querySourceExchangeRateConfig() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_source_exchange_rate_old_config',
    tenant: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

/**
 * 评标管理-整单提交-二次开标
 * @async
 * @function
 * @returns {object} fetch Promise
 */
export async function submitEvaluateNewOpenBidSummary(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/evaluate-summary/submit/second`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 查询过程附件下载配置表
 */
export async function queryProcessAttachmentConfig() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_source_file_old_ui_config',
    tenant: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

/**
 * 查询开启核价一键展开/收起
 */
export async function queryBacthExpandConfig() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_rfx_once_for_all_query_enable',
    tenant: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

/**
 * 行业类型
 */
export async function fetchIndustyType(params = {}) {
  return request(`${PrefixHpfmV1}/industries/tree`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 主营品类
 */
export async function fetchIndustyCategory(params = {}) {
  return request(`${PrefixHpfmV1}/industries/categories/tree`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

// 双单位计算基本数量
export async function calculateQuantity(params) {
  const { tenantId = getCurrentOrganizationId() } = params[0];
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
    query: {
      tenantId,
    },
  });
}

// 判断是否开启双单位
export async function queryEnableDoubleUnit(params) {
  const { businessModule = 'RFX', tenantId = getCurrentOrganizationId(), ...others } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId() || tenantId}/secondary/uom/isEnable${
      getToken() ? '' : '/public'
    }`,
    {
      method: 'GET',
      query: {
        ...others,
        tenantId,
        businessModule,
      },
      responseType: 'text',
    }
  );
}

// 判断租户是否购买“风险监控”/“风险扫描”服务，若未购买，则隐藏按钮；若购买，则显示按钮 -- 接口已废弃，不敢删，以免有二开调用，已删除标准调用方法
export async function fetchRiskScanFlag() {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/dock-amkt/is-open/credit-risk-scan`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}

// 查询企业是否开通 [ 风险扫描，关系图谱，找关系, ..., ]等服务
export async function fetchEnterpriceRiskControlConfig(params = {}) {
  const { organizationId, ...others } = params || {};
  return request(`${SRM_SSRC}/v1/${organizationId}/monitor/is-open-service`, {
    method: 'GET',
    query: others,
  });
}

// 两家供应商关系查询
export async function querySupplierRelation(params = {}) {
  const { organizationId, querys = {}, data = [] } = params || {};
  return request(`${SRM_SSRC}/v1/${organizationId}/monitor/enterprise-relation`, {
    method: 'POST',
    query: querys,
    body: data,
    responseType: 'text',
  });
}

// get attachment count
export async function getAttachmentCount(params = {}) {
  const { organizationId } = params || {};
  return request(`/hfle/v1/${organizationId}/files/count-batch`, {
    method: 'POST',
    body: params,
  });
}

// 查业务规则定义-批量
export async function batchBusinessRules(params = {}) {
  const { organizationId, querys = {}, data = [] } = params || {};
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute/batch`, {
    method: 'POST',
    query: querys,
    body: data,
  });
}

// ssrc 查业务规则定义-批量
export async function ssrcBatchBusinessRules(params = {}) {
  const { organizationId, querys = {}, data = [] } = params || {};
  return request(`${SRM_SSRC}/v1/${organizationId}/share/common/do-execute/batch`, {
    method: 'POST',
    query: querys,
    body: data,
  });
}

// 查询模版上的配置
export async function queryTemplateConfig(params) {
  return request(`${SRM_SSRC}/v2/${getCurrentOrganizationId()}/source-templates/fetch/by-doc-id`, {
    method: 'POST',
    body: params,
  });
}

// 保存策略配置
export async function saveRuleConfig(params) {
  return request(`${SRM_SSRC}/v2/${getCurrentOrganizationId()}/cnf-actions/save-update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询是否开启新360页面的租户
 * 有值表示使用老的360，无值用新
 */
export async function querySslmLifeCycleConfig() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'sslm_life_cycle_new_360_bk',
    tenantNum: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

// 控制租户使用功能是H0还是C7N
export async function queryH0OrC7N() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_new_function_configuration_list',
    tenantNum: getCurrentTenant().tenantNum,
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

// 查询附件数量
export async function fetchAttachmentCountServices(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/evaluate-scores/review/count/files`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 点击评分按钮前校验
export async function beforeScoreValidate(params) {
  const { sourceHeaderId, sourceFrom, ...data } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/evaluate-scores/${sourceHeaderId}/${sourceFrom}/before-valid`,
    {
      method: 'GET',
      query: {
        ...data,
        tenantId: getCurrentOrganizationId(),
      },
    }
  );
}

/**
 * 查询是否开启使用新功能
 */
export async function queryConfigurationListConfig() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_new_function_configuration_list',
    tenantNum: getCurrentTenant().tenantNum,
    function: 'CHECK_SELECT_UNFOLD_TAB',
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  // HZERO_HWFP
  return request(`${'/hwfp'}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag`, {
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
  // /hwfp
  const res = await request(
    `${'/hwfp'}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}

// 查询用户配置
export function fetchUserConfig(params = {}) {
  const { organizationId, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/user-config`, {
    method: 'get',
    query: others,
  });
}

// 更新用户配置
export function updateUserConfig(params = {}) {
  const { organizationId, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/user-config`, {
    method: 'POST',
    body: others,
  });
}

// ip详情
export async function fetchIPDetail(params) {
  return request(`${SRM_SSRC}/v2/${getCurrentOrganizationId()}/supplier/ip/check`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询是否使用老重合率
 */
export async function queryConfigurationOldRate() {
  const params = {
    organizationId: getCurrentOrganizationId(),
    tableCode: 'ssrc_new_function_configuration_list',
    tenantNum: getCurrentTenant().tenantNum,
    function: 'USE_OLD_OVERLAP_RATE_TENANTS',
  };
  const result = getResponse(await queryUiDisplayConfig(params));
  return result;
}

// 查询是否是技术专家
export async function fetchISTechExpert(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/share/common/is-tech-expert`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

// 导出操作记录
export async function exportOperationRecord(params) {
  return request(
    `${SRM_SPC}/v1/${getCurrentOrganizationId()}/history-record/operated-action/export`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}
