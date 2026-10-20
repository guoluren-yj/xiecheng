import request from 'utils/request';
import { HZERO_HWFP, HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// 区别租户
function prefixUrl(head, suffixUrl) {
  const organizationId = getCurrentOrganizationId();
  return `${head}/v1/${organizationId}/${suffixUrl}`;
}

/**
 * 查询公告列表数据
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchNotice(params) {
  const { organizationId, ...other } = params;
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'GET',
    query: other,
  });
}

/**
 * 创建公告基础信息
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 */
export async function createNotice(params) {
  const { customizeUnitCode, ...other } = params;
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'POST',
    body: other,
    query: { customizeUnitCode },
  });
}

/**
 * 修改公告基础信息
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 * @param {String} params.host -邮件服务器
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.tenantName - 租户名称
 * @param {String} params.tryTimes - 重试次数
 * @param {String} params.userName - 用户名称
 * @param {String} params.password - 密码
 * @param {Array} params.emailProperties - 服务器配置属性
 * @param {String} params.emailProperties.propertyCode - 属性编码
 * @param {String} params.emailProperties.propertyId - 属性ID
 * @param {String} params.emailProperties.propertyValue - 属性值
 * @param {String} params.emailProperties.serverId - 服务器ID
 * @param {String} params.emailProperties.tenantId - 租户ID
 */
export async function updateNotice(params) {
  const { customizeUnitCode, ...other } = params;
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'PUT',
    body: other,
    query: { customizeUnitCode },
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 删除公告基础信息
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 * @param {String} params.host -邮件服务器
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.tenantName - 租户名称
 * @param {String} params.tryTimes - 重试次数
 * @param {String} params.userName - 用户名称
 * @param {String} params.password - 密码
 * @param {Array} params.emailProperties - 服务器配置属性
 * @param {String} params.emailProperties.propertyCode - 属性编码
 * @param {String} params.emailProperties.propertyId - 属性ID
 * @param {String} params.emailProperties.propertyValue - 属性值
 * @param {String} params.emailProperties.serverId - 服务器ID
 * @param {String} params.emailProperties.tenantId - 租户ID
 */
export async function deleteNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, 'notices'), {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询公告明细数据
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function queryNotice(params) {
  const { customizeUnitCode } = params;
  return request(
    prefixUrl(SRM_PLATFORM, `notices/${params.noticeId}?customizeUnitCode=${customizeUnitCode}`),
    {
      method: 'GET',
      headers: {
        's-request-web': 'srm_web',
      },
    }
  );
}

/**
 * 发布公告
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function publicNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, `notices/${params.noticeId}/publish`), {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 撤销删除公告
 * @param {Object} params - 查询参数
 * @param {String} [params.organizationId] - 租户ID
 * @param {String} [params.noticeId] - 公告ID
 */
export async function revokeNotice(params) {
  return request(prefixUrl(SRM_PLATFORM, `notices/${params.noticeId}/revoke`), {
    method: 'POST',
    body: params.record,
  });
}

/**
 * 操作记录
 * @param {Object} params - 查询参数
 * @param {String} [params.organizationId] - 租户ID
 * @param {String} [params.noticeId] - 公告ID
 */
export async function noticeHistory(params) {
  return request(prefixUrl(SRM_PLATFORM, `portal-notice-actions/${params.noticeId}`), {
    method: 'GET',
  });
}

/**
 * 审批记录
 * @param {Object} params - 查询参数
 * @param {String} [params.organizationId] - 租户ID
 */
export async function approveHistory(params) {
  return request(
    prefixUrl(HZERO_HWFP, `activiti/task/historyApproval`),
    {
      method: 'POST',
      query: { ...params, needMerge: true, filterAuto: true },
    }
  );
}

/**
 * 富文本上传
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @param {!string} [params.bucketName = 0] - 数据页码
 * @param {!string} [params.fileName = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function uploadImage(params = {}, file) {
  return request(`${HZERO_FILE}/v1/files/multipart`, {
    method: 'POST',
    query: params,
    body: file,
    responseType: 'text',
  });
}

// FIXME: 没有使用公共的 service
export async function queryNoticeType(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchNoticeTimes(params) {
  return request(`${SRM_PLATFORM}/v1/notice-quantitys/gettimes`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchNoticeCountDelete(params) {
  return request(`${SRM_PLATFORM}/v1/notice-quantitys/delete`, {
    method: 'DELETE',
    body: params,
  });
}

export async function fetchNoticeReadPurchaseList(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/read-purchase`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchNoticeUnReadPurchaseList(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/unread-purchase`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function fetchNoticeReadSupplierList(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/read-supplier`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchNoticeUnReadSupplierList(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/unread-supplier`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function fetchNoticeReadUserList(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/purchase`, {
    method: 'GET',
    query: { ...params, readFlag: 1 },
  });
}

export async function fetchNoticeUnReadUserList(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/purchase`, {
    method: 'GET',
    query: { ...params, readFlag: 0 },
  });
}

export async function fetchRolesList(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/notice-quantity/roles`, {
    method: 'GET',
    query: { ...params},
  });
}
