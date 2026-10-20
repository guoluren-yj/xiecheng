import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

import { HZERO_IAM, HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils'; // filterNullValueObject

const organizationId = getCurrentOrganizationId();

/**
 * 获取订单状态
 * @async
 * @function fetchOrderStatus
 */
export async function fetchOrderStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/query-service`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询单家公司认证状态
 * @async
 * @function fetchAuthStatus
 */
export async function fetchAuthStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-node-info`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询公司列表
 * @async
 * @function fetchCompanyList
 */
export async function fetchCompanyList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/list-supplier-company`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取公司认证链接
 * @async
 * @function fetchCompanyAuthUrl
 */
export async function fetchCompanyAuthUrl(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-company-auth`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取授权页面
 * @async
 * @function fetchAuthorizedUrl
 */
export async function fetchAuthorizedUrl(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-company-privilege`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取印章管理页面
 * @async
 * @function fetchSealManage
 */
export async function fetchSealManage(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-seal-manage`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

/**
 * 获取静默签授权页面
 * @async
 * @function fetchSealManage
 */
export async function fetchSilentSignManage(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-auth-url`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存成员管理
 * @async
 * @function fetchSaveMember
 */
export async function fetchSaveMember(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-add-company-person`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 批量保存成员管理
 * @async
 * @function fetchBatchSaveMember
 */
export async function fetchBatchSaveMember(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration/batch/supplier-add-company-person`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询公司详情
 * @async
 * @function fetchCompanyDetail
 */
export async function fetchCompanyDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-company-detail`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

/**
 * 取消认证
 * @async
 * @function fetchCancelAuth
 */
export async function fetchCancelAuth(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-cancel-company-auth`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 取消授权
 * @async
 * @function fetchCancelAuthorized
 */
export async function fetchCancelAuthorized(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-cancel-company-privilege`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 刷新状态
 * @async
 * @function fetchRefreshAuth
 */
export async function fetchRefreshAuth(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/supplier-auth-detail`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询单个公司
 * @async
 * @function fetchCompanyItem
 */
export async function fetchCompanyItem(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/list-partner-company`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 公司实名认证详细信息
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function companyVerify(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/company-verify-url`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
}

/**
 * 公司实名认证详细信息 通用
 * @async
 * @function saveAvatar
 * @param {String} params - 保存参数
 */
export async function commonCompanyVerify(params) {
  // const { userId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/common/company-verify-url`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
}

/**
 * 查询单个公司认证详情
 * @async
 * @function fetchCompanyAuthDetail
 */
export async function fetchCompanyAuthDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/ca-auth-result/page`, {
    method: 'GET',
    query: {
      ...params,
      tenantId: getCurrentOrganizationId(),
    },
  });
}

/**
 * 操作记录
 * @param {*} params
 * @returns
 */
export async function fetchOperationRecord(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-seal-records`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除印章
 * @param {*} params
 * @returns
 */
export async function fetchSealDelete(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/seal/company/${
      params.companyId
    }/batch-delete`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

/**
 * 获取公司认证信息 及认证节点
 * @param {*} params
 * @returns
 */
export async function fetchCompanyNodeDetail(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-ca/detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 重置流程
 */
export async function resetProcess(body) {
  const { authInfoId, authType } = body;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/reset_process/${authInfoId}`,
    {
      method: 'PUT',
      query: { authType },
      body,
    }
  );
}

/**
 * 保存用印成员成员管理
 * @async
 * @function fetchSaveSignMember
 */
export async function fetchSaveSignMember(params) {
  const { paramList = [], tenantId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-user?partnerTenant=${tenantId}`,
    {
      method: 'POST',
      body: paramList,
    }
  );
}

export async function queryAuthorizeDetail(params) {
  const { userId } = params;
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_IAM}/v1/${organizationId}/user-auth-info/auth-detail/${userId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 获取电子签章列表
 * @param {*} params
 * @returns
 */
export async function fetchSignList(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/seal/company/${params.companyId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询成员列表
 * @param {*} params
 * @returns
 */
export async function fetchMemberList(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/company-user-impowers/${params.companyId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 已授权的成员列表
 * @param {*} params
 * @returns
 */
export async function getAddedMember(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/user-seal-authorizes/${
      params.sealId
    }/page/by-seal`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 保存授权成员
 * @async
 * @function fetchAddAuthMember
 */
export async function fetchAddAuthMember(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-user/fdd-authorize?partnerTenant=${params.tenantId}`,
    {
      method: 'POST',
      body: params.list,
    }
  );
}

/**
 * 移除授权成员
 * @async
 * @function fetchRemoveAuthMember
 */
export async function fetchRemoveAuthMember(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-user/fdd-cancel-authorize?partnerTenant=${params.tenantId}`,
    {
      method: 'POST',
      body: params.list,
    }
  );
}

/**
 * 契约锁 法大大查询认证步骤
 * @param {*} params
 * @returns
 */
export async function fetchQysStep(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-ca/node-info`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 契约锁境外 查询认证步骤
 * @param {*} params
 * @returns
 */
export async function fetchQysOuterStep(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-ca/node-info`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 保存印章
 * @async
 * @function fetchOnlySaveSign
 */
export async function fetchOnlySaveSign(params) {
  const { tenantId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-seal/company/${
      params.companyId
    }/batch-update/${params.authType}?partnerTenant=${tenantId}`,
    {
      method: 'POST',
      body: params.list,
    }
  );
}

/**
 * 查询公司详情
 * @async
 * @function fetchBusinessDetail
 */
export async function fetchBusinessDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/detail`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询是否展示用户手册
 * @param {*} params
 * @returns
 */
export async function fetchUserDocStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/query-user-manual`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查看文件列表
 * @param {*} params
 * @returns
 */
export async function getFileList(params) {
  const { uuid } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/${uuid}/file`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查看文件列表
 * @param {*} params
 * @returns
 */
export async function getFilePreview(params) {
  return request(`${HZERO_FILE}/v1/${organizationId}/file-preview/by-url`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询公司、租户相关参数
 * @async
 * @function getNeedParam
 */
export async function getNeedParam(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/query-partner-company`, {
    method: 'GET',
    query: params,
  });
}

// 文件上传
export async function fetchUploadFile(params) {
  // files/multipart
  return request(`${HZERO_FILE}/v1/${organizationId}/files/attachment/multipart`, {
    processData: false, // 不会将 data 参数序列化字符串
    method: 'POST',
    type: 'FORM',
    body: params,
    responseType: 'text',
  });
}

/**
 * 根据uuid获取文件列表
 * @param {*} params
 * @returns
 */
export async function fetchFileByUuid(params) {
  return request(`${HZERO_FILE}/v1/${organizationId}/files/${params.attachmentUuid}/file`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查看文件列表
 * @param {*} params
 * @returns
 */
export async function fetchAttachUuid() {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/query-alleged-file`,
    {
      method: 'GET',
      query: {},
    }
  );
}

/**
 * 打款验证
 * @async
 * @function fetchSavePayment
 */
export async function fetchSavePayment(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/foreign-payment-verify`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取海外打款信息
 * @param {*} params
 * @returns
 */
export async function fetchBankInfo(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/foreign-payment-info`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}

/**
 * 设置为默认签署人
 * @param {*} params
 * @returns
 */
export async function fetchChangeSignatory(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-user-impowers/update-default-signatory`,
    {
      method: 'POST',
      body: params,
    }
  );
}
