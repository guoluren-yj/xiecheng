import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 维护-保存
 * @export
 * @param {Object} params
 * @returns
 */
export async function save(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/save`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 维护-发布
 * @export
 * @param {Object} params
 * @returns
 */
export async function releaseUpdate(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/confirm`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 维护-发布-校验
 * @export
 * @param {Object} params
 * @returns
 */
export async function checkUpdate(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/release`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}

// 维护-切换招标规则保存
export async function saveBidRuleType(params) {
  const { rfHeaderId, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/switch-rule`, {
    method: 'PUT',
    query: others,
  });
}

// 维护-要素参考模板保存
export async function saveAllScoringTemplate(params) {
  const { rfHeaderId, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}/refer-template`, {
    method: 'POST',
    body: others,
  });
}

/**
 * 核价-保存
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveCheck(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/check/save`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 核价-发布
 * @export
 * @param {Object} params
 * @returns
 */
export async function releaseCheck(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/check/submit`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}
/**
 * 核价-发布-校验
 * @export
 * @param {Object} params
 * @returns
 */
export async function checkConfirm(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/check/confirm`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 核价-按钮-状态
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryPermissionStatus(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/check/can-source`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 核价-按钮-供应商附件下载
 * @export
 * @param {Object} params
 * @returns
 */
export async function downloadSupplierInfo(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/supplier/files/download`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 明细-进度条
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryProgress(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/${params?.rfHeaderId}/progress`, {
    method: 'GET',
  });
}

/**
 * 参与 - 校验
 * @export
 * @param {Object} params
 * @returns
 */
export async function checkSupplierParticipate(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/participate`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 * 参与 - 确认
 * @export
 * @param {Object} params
 * @returns
 */
export async function participate(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/participate/confirm`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 * 放弃
 * @export
 * @param {Object} params
 * @returns
 */
export async function abandon(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/abandon`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 保存供应商回复
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveSupplierReply(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 * 校验提交供应商回复
 * @export
 * @param {Object} params
 * @returns
 */
export async function checkSupplierReply(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 * 提交供应商回复 - 确认
 * @export
 * @param {Object} params
 * @returns
 */
export async function releaseSupplierReply(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/submit/confirm`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

/**
 * 获取报价响应版本
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchVersion(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/quotation/versions`, {
    method: 'GET',
    query: { ...params },
  });
}

export async function cancelRelease(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/${params.rfHeaderId}/cancel`, {
    method: 'GET',
  });
}

/**
 * RFP确认供应商页面-发布并创建RFP
 * @export
 * @param {Object} params
 * @returns
 */
export async function releaseCreateRFP(params = {}) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/rfp-application`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...others },
  });
}

// 寻源过程控制-参考评分模版
export async function changeTemplate(params = {}) {
  const { customizeUnitCode, adjustRecordId, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/adjust/${adjustRecordId}/refer-template`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: {
      ...others,
    },
  });
}

/**
 * 配置表-查询寻源方式, 是否可以选择 `全平台公开`
 * */
export async function querySourceMethodConfig(params = {}) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/ssrc_source_method_all_open/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 征询单明细-退回校验
 * @export
 * @param {Object} params
 * @returns
 */
export async function confirmReturn(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/check/rollback/${params.rfHeaderId}`, {
    method: 'POST',
    body: params,
  });
}

// 查询线下供应商报价头
export async function fetchSupplierReply(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/off-line/supplier/reply`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

// 删除线下回复
export async function deleteOfflineSupplierReply(params) {
  const { rfHeaderId, selectedList } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/off-line/delete`, {
    method: 'POST',
    body: {
      deleteQuotationIds: selectedList,
    },
    query: {
      rfHeaderId,
    },
  });
}

// 线下回复保存
export async function saveOfflineSupplierReply(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/off-line/save`, {
    method: 'POST',
    body: otherParams,
    query: {
      customizeUnitCode,
    },
  });
}

// 线下回复提交
export async function submitOfflineSupplierReply(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/off-line/submit`, {
    method: 'POST',
    body: otherParams,
    query: {
      customizeUnitCode,
    },
  });
}

// 线下回复提交校验
export async function submitValidateOfflineSupplierReply(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/off-line/submit/validate`, {
    method: 'POST',
    body: otherParams,
    query: {
      customizeUnitCode,
    },
  });
}

// 添加供应商
export async function addSupplierReply(params) {
  const { rfHeaderId, selectedList } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rf/off-line/supplier/submit`, {
    method: 'POST',
    body: selectedList,
    query: {
      rfHeaderId,
    },
  });
}
