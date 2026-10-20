import request from 'utils/request';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询业务通知发布列表
 */
export async function fetchDataList(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 详细页头数据
 */
export async function fetchForm(params) {
  const { notificationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify-detail/${notificationId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 详细页供应商行数据
 */
export async function fetchTable(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess`, {
    method: 'GET',
    query: {
      ...params,
      page: -1,
      // size: 10000000,
    },
  });
}

/**
 * 操作记录
 */
export async function fetchOperate(params) {
  const { notificationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify-actions/${notificationId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 操作记录
 */
export async function fetchApproveRecord(params) {
  const { notificationId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-history/${notificationId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 签收状态
 */
export async function fetchSignStatusList(params) {
  const { notificationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify/sign/detail/${notificationId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存业务通知单
 */
export async function saveBusinessOrder(params) {
  const { businessNotificationDTO, customizeUnitCode } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/save-notify`, {
    method: 'PUT',
    body: businessNotificationDTO,
    query: { customizeUnitCode },
  });
}

/**
 * 删除业务通知单
 */
export async function deleteBusinessOrder(params) {
  const { businessNotifications } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify`, {
    method: 'DELETE',
    body: businessNotifications,
  });
}

/**
 * 审批通过/拒绝业务通知单
 */
export async function approvalBusinessOrder(params) {
  const { businessNotifications, businessNotificationDTOList, type } = params;
  const url =
    type === 'approve'
      ? `${SRM_PLATFORM}/v1/${organizationId}/notify/function-approved`
      : `${SRM_PLATFORM}/v1/${organizationId}/notify/function-rejected`;
  return request(`${url}`, {
    method: 'POST',
    body: businessNotifications || businessNotificationDTOList,
  });
}

/**
 * 发布业务通知单
 */
export async function publishBusinessOrder(params) {
  const { businessNotificationDTOList, saveFlag, customizeUnitCode } = params;
  const release = saveFlag === 1 ? 'release?saveFlag=1' : 'release';
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify/${release}`, {
    method: 'PUT',
    body: businessNotificationDTOList,
    query: { customizeUnitCode },
  });
}

/**
 * 供应商多选lov
 */
export async function fetchSupplier(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess/supplier`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询全部供应商
 */
export async function fetchAllSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess/supplier`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除业务通知单
 */
export async function deleteSupplier(params) {
  const { BsnesNotifyReceives } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess`, {
    method: 'DELETE',
    body: BsnesNotifyReceives,
  });
}

/**
 * 查询供应商分类
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSupplierClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-categorys/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * selectSupplierLov - 供应商选择lov
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSupplierLovData(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/supplier-company`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询公司，业务实体带出
 */
export async function fetchBringOutOrgInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/bring-out-org-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询配置表中的配置
 */
export async function fetchConfig(params) {
  const tableCode = 'spfm_business_notification_old_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      // query: { fullPathCode },
      body: params,
    }
  );
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag`, {
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
  const res = await request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}
