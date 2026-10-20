/**
 * financeInfo - 企业注册-附件信息service
 * @date: 2018-7-9
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_FILE } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
/**
 * 删除companyId
 *
 * @param {*} params 传递的参数
 * @returns 删除后的参数
 */
function deleteCompanyId(params) {
  const paramsData = params;
  if (params.companyId) {
    delete paramsData.companyId;
  }
  return paramsData.arr;
}
/**
 * 删除companyId
 *
 * @param {*} params 传递的参数
 * @returns 删除后的参数
 */
function deleteCompanyIdArr(params) {
  const paramsData = params;
  if (params.companyId) {
    delete paramsData.companyId;
  }
  return paramsData.deleteRows;
}

/**
 * 查询公司附件信息
 * @async
 * @function queryAttachment
 * @param {object} params - 查询条件
 * @param {!string} params.companyId - 公司id
 * @returns {object} fetch Promise
 */
export async function queryAttachment(params) {
  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/companies/attachments/${params.companyId}`,
      {
        method: 'GET',
      }
    );
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/attachments/${params.companyId}`, {
      method: 'GET',
    });
  }
}

/**
 * 新增/更新公司财务信息
 * @async
 * @function addAttachment
 * @param {object} params.data - 待保存数据
 * @param {!string} params.data.attachmentType - 附件类型
 * @param {!string} params.data.subAttachment - 附件子类型
 * @param {?string} params.data.attachmentUuid - 唯一id
 * @param {?string} params.data.description - 附件描述
 * @param {!string} params.data.companyId - 公司id
 * @param {?date} params.data.endDate - 文件到期日
 * @param {!date} params.data.uploadDate - 最后更新时间
 * @returns {object} fetch Promise
 */
export async function addAttachment(params) {
  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/companies/attachments/${params.companyId}`,
      {
        method: 'POST',
        body: deleteCompanyId(params),
      }
    );
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/attachments/${params.companyId}`, {
      method: 'POST',
      body: deleteCompanyId(params),
    });
  }
}

/**
 * 删除公司附件信息
 * @async
 * @function removeAttachment
 * @param {object[]} params.selectedRows - 待保存数据
 * @param {!string} params.selectedRows[].companyAttachmentId - 附件数据id
 * @param {!string} params.selectedRows[].objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function removeAttachment(params) {
  if (TenantRoleLevel) {
    return request(
      `${SRM_PLATFORM}/v1/${organizationId}/companies/attachments/${params.companyId}`,
      {
        method: 'DELETE',
        body: deleteCompanyIdArr(params),
      }
    );
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/attachments/${params.companyId}`, {
      method: 'DELETE',
      body: deleteCompanyIdArr(params),
    });
  }
}

/**
 * 获取附件类型
 * @async
 * @function queryAttachmentType
 * @param {object[]} params - 查询条件
 * @param {?string} params.SPFM.COMPANY.ATTACHMENT_TYPE - 附件类型
 * @param {?string} params.SPFM.COMPANY.SUB_ATTACHMENT - 附件子类型
 * @returns {object} fetch Promise
 */
export async function queryAttachmentType(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询uuid
 * @async
 * @function queryUuid
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryUuid(params) {
  return request(`${HZERO_FILE}/v1/files/uuid`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 提交审批
 * @async
 * @function submitApproval
 * @param {object} params - 提交参数
 * @param {!string} params.companyId - 公司编号
 * @returns {object} fetch Promise
 */
export async function submitApproval(params) {
  const { companyId, bodyParams, ...other } = params;
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/${params.companyId}`, {
      method: 'PATCH',
      query: other,
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/${params.companyId}`, {
      method: 'PATCH',
      query: other,
      body: bodyParams,
    });
  }
}

/**
 * 查询当前uuid上附件个数
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function fetchFileNumber(params) {
  return request(`${HZERO_FILE}/v1/files/${params.attachmentUUID}/count`, {
    method: 'GET',
    query: {
      bucketName: params.bucketName,
    },
  });
}
