import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_SSLM, SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

/**
 * companySearchQueryPagePurchaser - 查询公司信息-采购商,带分页
 * @async
 * @param {Object} params - 查询参数
 */
export async function companySearchQueryPagePurchaser(organizationId, params, pagination) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/search/purchaser`, {
    method: 'POST',
    body: params,
    query: pagination,
  });
}
/**
 * companySearchQueryPageSupplier - 查询公司信息-供应商,带分页
 * @async
 * @param {Object} params - 查询参数
 */
export async function companySearchQueryPageSupplier(organizationId, params, pagination) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/search/supplier`, {
    method: 'POST',
    body: params,
    query: pagination,
  });
}
/**
 * 供应商发出邀约
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {!Number} params.inviteCompanyId 被邀请公司的Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function companySearchInviteSupplier(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-invite`, {
    method: 'POST',
    body: { ...otherParams, tenantId: organizationId },
  });
}
/**
 * 采购方发出邀约
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {!Number} params.inviteCompanyId 被邀请公司的Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function companySearchInvitePurchaser(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/purchase-batch-invite`, {
    method: 'POST',
    body: { ...otherParams, tenantId: organizationId },
  });
}

/**
 * 查询行业的树( 1级行业 和 2级行业 )
 */
export async function companySearchIndustry() {
  return request(`${HZERO_PLATFORM}/v1/industries/tree`, {
    method: 'GET',
  });
}

/**
 * 创建邀请供应商注册
 * @async
 * @function companySearchInviteRegisterSupplier -函数名称
 * @param {Object} params - 更新参数
 * @returns {Object} fetch Promise
 */
export async function companySearchInviteRegisterSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/${params.organizationId}/supplier-invite-register`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 查询调查模板表(租户级)
 * @async
 * @function queryInvestigateTemplates -函数名称
 * @param {Object} params -更新参数
 * @return {Object} fetch Promise
 */
export async function queryInvestigateTemplates(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate-templates`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询公司信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryCompanyInformation(params) {
  return request(`${SRM_PLATFORM}/v1/companies/latest`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询供应商分类信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function querySupplierCategoryDate(params) {
  const organizationId = getCurrentOrganizationId();
  const query = parseParameters(params);
  const { isSupplier, inviteTenantId, ...others } = query;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/list-partner`, {
    method: 'GET',
    query: filterNullValueObject({
      ...others,
      purchaserTenantId: isSupplier ? '' : inviteTenantId,
    }),
  });
}

/**
 *查询邀请方信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryInviterData(params) {
  const organizationId = getCurrentOrganizationId();
  const query = filterNullValueObject(parseParameters({ ...params }));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询配置中心配置
 */
export async function fetchSettings(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

// 查询风险扫描
export async function fetchRiskScan(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 校验是否开启了风控服务
 * @param {Object} params 修改参数
 */
export async function riskEmbedFlag() {
  const organizationId = getCurrentOrganizationId();
  // return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/isExistsAccount`, {
    method: 'GET',
  });
}
/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询已邀约公司
 * @param {Object} params
 */
export async function companySearchInvited(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/send-invites`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询是否只显示二级供应商
 * @param {Object} params - 查询参数
 */
export async function fetchOnlyShowMySupplierFlag() {
  const settingCode = '010012'; // 是否只显示二级供应商
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/${settingCode}`, {
    method: 'GET',
  });
}

export async function fetchShowSupplierCategory(data) {
  const { tenantId } = data;
  const settingCode = '000113'; // 是否供应商分类
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/settings/span/${settingCode}?tenantId=${tenantId}`,
    {
      method: 'GET',
    }
  );
}

// 查询标签列表
export async function querySupplierCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-companies/query-label`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 保存标签
 * @async
 */
export async function saveSupplierCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-companies/update-label?companyId=${params.companyId}`,
    {
      method: 'POST',
      body: params.body,
    }
  );
}

/**
 * 查询当前分配公司
 * @param {Object} params
 */
export async function companySearchOwn() {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/corporation`, {
    method: 'GET',
  });
}

export async function fetchGetPurchaser(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-purchasers/getPurchaser`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 校验供应商分类
 * @param {Object} params
 */
export async function checkClassify(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/check-intro-category`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * 查询租户下公司是否都有[我要采购][我要销售]标识
 * @param {Object} params
 */
export async function fetchCompanyMainIdentity() {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/main-identity`, {
    method: 'GET',
  });
}

/**
 * 查询查询当前登录人对应的采购员
 * @param {Object} params
 */
export async function queryCurrentUserPurchaseAgent() {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/common-data/list-current-user-purchase-agent`, {
    method: 'GET',
  });
}

/**
 * 校验黑名单
 * @param {Object} params
 */
export async function checkBlacklist(supplierCompanyId) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-reqss/${supplierCompanyId}`, {
    method: 'GET',
  });
}
