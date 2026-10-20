import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { filterNullValueObject, parseParameter, getCurrentOrganizationId } from 'utils/utils';

/**
 * 租户级银行服务
 */

/**
 * 查询租户级 的 银行信息
 * @param {Number} organizationId (组织id)
 * @param {Object} query 银行信息
 * @param {String} query.bankCode 银行编码
 * @param {String} query.bankName 银行名称
 * @param {String} query.bankShotName 银行简称
 * @param {String} query.bankType 银行类型
 * @param {Number} pagination.page 分页值
 * @param {Number} pagination.size 分页大小
 */
export async function bankTenantQueryPage(organizationId, query, pagination) {
  const params = { ...query, ...parseParameter(pagination) };
  return request(`${SRM_MDM}/v1/${organizationId}/banks`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 手动触发 从平台级 银行数据 拉到 租户
 * @param {Number} organizationId 组织id
 */
export async function bankTenantImportManual(organizationId) {
  return request(`${SRM_MDM}/v1/${organizationId}/banks`, {
    method: 'POST',
  });
}

/**
 * 更新租户级银行的 是否启用标志, 以及是否允许零付款
 * @param {Number} organizationId 组织id
 * @param {Object} list 租户级银行
 * @param {Number} list[].tenantId 租户id
 * @param {Number} list[].bankId 平台级银行的id
 * @param {Number} list[].bankTenantId 租户级银行的id
 * @param {Number} list[].enableFlag 是否启用标志  0 / 1
 * @param {Number} list[].zeroPaymentFlag 是否允许零付款标志  0 / 1
 */
export async function bankTenantUpdate(organizationId, list) {
  return request(`${SRM_MDM}/v1/${organizationId}/banks`, {
    method: 'PUT',
    body: list,
  });
}

/**
 * 租户级银行 分行数据
 */

/**
 * 查询 银行的分行
 * @param {Number} organizationId 当前组织
 * @param {Number} bankId 当前银行
 * @param {Object} pagination 分页信息
 * @param {Number} pagination.page 分页信息.分页
 * @param {Number} pagination.size 分页信息.分页大小
 */
export async function bankTenantBranchQueryPage(organizationId, bankId, pagination, params) {
  const query = filterNullValueObject({ ...params, ...parseParameter(pagination) });
  return request(`${SRM_MDM}/v1/${organizationId}/bank-branches/${bankId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 新建或修改分行信息
 * @param {Number} organizationId 组织
 * @param {Object[]} list 分行dto信息
 * @param {Object} list 分行的信息
 * @param {Number} list[].bankTenantId 分行id
 * @param {String} list[].bankBranchCode 分行代码
 * @param {String} list[].bankBranchName 分行名称
 * @param {String} list[].address 地址
 * @param {String} list[].contact 联系人
 * @param {String} list[].email 电子邮箱
 * @param {String} list[].phone 电话
 * @param {String} list[].enabledFlag 启用标志
 */
export async function bankTenantBranchUpdateList(organizationId, list) {
  return request(`${SRM_MDM}/v1/${organizationId}/bank-branches`, {
    method: 'POST',
    body: list,
  });
}

export async function bankTenantBranchCreate(organizationId, list) {
  return request(`${SRM_MDM}/v1/${organizationId}/banks`, {
    method: 'POST',
    body: list,
  });
}


export async function queryConfigSetting() {
  // const {} = params;
  return request(
    `${SRM_MDM}/v1/${getCurrentOrganizationId()}/banks/tenant-config`
  );
};

export async function syncBankOrgInfo() {
  // const { } = params;
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/bank-branches/ref-platform`, { method: 'POST' });
};
