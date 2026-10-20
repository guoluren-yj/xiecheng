import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, SRM_SPC } from '_utils/config';

// 查询页签数量
export async function queryCount() {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/workbenches/count`,
    {
      method: 'POST',
    }
  );
}

// 发送消息
export async function sendMessage(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/workbenches/send-reminders`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 暂挂
export async function hold(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/workbenches/pending`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 选用-获取执行规则
export async function fetchExecuteRule(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/batch-rule`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 选用-执行选择规则
export async function executeExecutionRules(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/batch-select`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询添加供应商系统配置
export async function fetchSourceSupplierRelativeConfig(params = {}) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-suppliers/supplier-lov-param`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 供应商-批量添加
 * @async
 * @function batchAddSupplier
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function batchAddSupplier(params) {
  const { rfqHeaderId, newParams } = params;

  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-suppliers/batch-add`, {
    method: 'POST',
    query: {
      rfqHeaderId,
    },
    body: newParams,
  });
}

/**
 * @function getClearLogic
 */
export async function getClearLogic(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-items/check-item-rel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 供应商筛选物品行修改保存
 * @async
 * @function saveSupplierRecordLine
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function saveAllotItem(params) {
  const { customizeUnitCode, ...other } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-sup-item-assigns/save`, {
    method: 'POST',
    body: other,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 维护-保存
 * @export
 * @param {Object} params
 * @returns
 */
export async function save(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 维护-删除
 * @export
 * @param {Object} params
 * @returns
 */
export async function remove(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/delete`, {
    method: 'POST',
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
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/confirm`, {
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
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/release`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 维护-引用采购申请-保存
 * @export
 * @param {Object} params
 * @returns
 */
export async function savePurchaseRequestData(params) {
  const { customizeUnitCode, data } = params;
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-items/application/increase-items`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: data,
    }
  );
}

/**
 * 维护-切换公司
 * @export
 * @param {Object} params
 * @returns
 */
export async function handleChangeCompany(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/change-company`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 * 创建调价单
 * @export
 * @param {Object} params
 * @returns
 */
export async function savePriceAdjustModal(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/price-adjustment/publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 取消调价单
 * @export
 * @param {Object} params
 * @returns
 */
export async function cancelPriceAdjustModal(params) {
  return request(`${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-adjustment/cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 跳转
 * @export
 * @param {Object} params
 * @returns
 */
export async function validateBeforeJump(params) {
  const { customizeUnitCode, ...others } = params || {};
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/detail`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 复制批次
 * @export
 * @param {Object} params
 * @returns
 */
export async function copyQuickRfq(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 列表-撤销报价-校验
 * @export
 * @param {Object} params
 * @returns
 */
export async function revokeRfqValidate(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/revoke-rfq/validate`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 列表-撤销报价
 * @export
 * @param {Object} params
 * @returns
 */
export async function revokeRfq(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/revoke-rfq`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 清除行上已保存的拓展库存组织
 * @export
 * @param {Object} params
 * @returns
 */
export async function clearExpandInvOrganization(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq/results-expanding/dimensions-or-hierarchy/change`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询拓展寻源结果数据-公司与库存组织关联关系
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchExpandSourceResults() {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/share/common/company-inv-organization`,
    {
      method: 'GET',
    }
  );
}
