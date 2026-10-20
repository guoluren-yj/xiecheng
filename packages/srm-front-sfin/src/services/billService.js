/**
 * service - 开票申请
 * @date: 2018-11-29
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SPUC, SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

/**
 * 查询开票头信息
 *
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
export async function fetchHeader(params) {
  const { interfaceType, organizationId, billHeaderId, customizeUnitCode } = params;
  const interfaceName =
    interfaceType === 'supplier'
      ? `${SRM_FINANCE}/v1/${organizationId}/bill/supplier/${billHeaderId}`
      : `${SRM_FINANCE}/v1/${organizationId}/bill/${billHeaderId}`;
  return request(interfaceName, {
    method: 'GET',
    query: {
      customizeUnitCode,
    },
  });
}

/**
 *
 * 查询开票行
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
export async function fetchRow(params) {
  const { organizationId, billHeaderId, interfaceType, ...other } = params;
  const interfaceName =
    interfaceType === 'supplier'
      ? `${SRM_FINANCE}/v1/${organizationId}/bill-lines/supplier/${billHeaderId}`
      : `${SRM_FINANCE}/v1/${organizationId}/bill-lines/${billHeaderId}`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询开票- 总账科目
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
export async function fetchInf(params) {
  const { organizationId, billHeaderId, interfaceType, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/bill-page?billHeaderId=${billHeaderId}`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询总账科目 - 扣款单列表
 * @export
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function fetchModalList(params) {
  const { organizationId, interfaceType, supplierCompanyId, erpSupplierFlag, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/supplier-available-page`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: {
      ...param,
      supplierCompanyId,
      erpSupplierFlag,
    },
  });
}

/**
 *
 * 查询开票行
 * @export
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.billHeaderId 对账Id
 * @returns
 */
export async function fetchDetail(params) {
  const { organizationId, billHeaderId, interfaceType, ...other } = params;
  const interfaceName =
    interfaceType === 'supplier'
      ? `${SRM_FINANCE}/v1/${organizationId}/bill-detail/supplier/${billHeaderId}`
      : `${SRM_FINANCE}/v1/${organizationId}/bill-detail/${billHeaderId}`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 审核确认申请单
 * @export
 * @param {String} params.description 审核意见
 * @param {Array} params.billHeaderList 头Id数组
 * @returns
 */
export async function confirmBill(params) {
  const { organizationId, billHeaderList } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/confirm`, {
    method: 'POST',
    body: billHeaderList,
    query: {
      customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO,SFIN.BILL_MAINTAIN_DETAIL.LINE',
    },
  });
}

/**
 *
 * 电商审核确认申请单
 * @export
 * @param {String} params.description 审核意见
 * @param {Array} params.billHeaderList 头Id数组
 * @returns
 */
export async function confirmEcBill(params) {
  const { organizationId, billHeaderList } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/ecConfirmBatch`, {
    method: 'POST',
    body: billHeaderList,
  });
}

/**
 *
 * 确认开票通知确认功能
 * @export
 * @param {String} params.description 审核意见
 * @param {Array} params.billHeaderList 头Id数组
 * @returns
 */
export async function confirmNotificationBillConfirm(params) {
  const { organizationId, billHeaderList, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-confirm-batch`, {
    method: 'POST',
    body: billHeaderList,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

/**
 *
 * 审核退回申请单
 * @export
 * @param {String} params.description 审核意见
 * @param {Array} params.billHeaderList 头Id数组
 * @returns
 */
export async function rejectBill(params) {
  const { organizationId, billHeaderList, ecFlag } = params;
  const url = ecFlag
    ? `${SRM_FINANCE}/v1/${organizationId}/bill-ec/ecNoticeBatch`
    : `${SRM_FINANCE}/v1/${organizationId}/bill/reject`;
  return request(url, {
    method: 'POST',
    body: billHeaderList,
    query: {
      customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO,SFIN.BILL_MAINTAIN_DETAIL.LINE',
    },
  });
}

/**
 *
 * 确认开票通知 退回
 * @export
 * @param {String} params.description 审核意见
 * @param {Array} params.billHeaderList 头Id数组
 * @returns
 */
export async function confirmBillRejectBill(params) {
  const { organizationId, billHeaderList, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-reject-batch`, {
    method: 'POST',
    body: billHeaderList,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

/**
 *
 * 查询审核申请单
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchAuditNoConsignment(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/approve`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 查询确认开票通知页面查询
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchConfirmBill(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-confirm-header`, {
    method: 'GET',
    query: param,
  });
}

// 创建开票通知默认查询条件-对账数据来源
export async function defaultFetch(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_FINANCE}/v1/${organizationId}/data-source-configs/default`, {
    method: 'GET',
    query: params,
  });
}

// 创建开票通知默认查询条件-业务类别
export async function defaultFetchBusinessType(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_FINANCE}/v1/${organizationId}/business-type-configs/default`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询事务行
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function fetchWork(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/trx-line`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 创建开票通知列表查询
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createNotificationSearch(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/purchase-trx-line`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 验收单列表查询
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function fetchAcceptanceForm(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-line/for-bill`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 审核申请单确认
 * @export
 * @param {Object} params 传递参数
 * @returns
 */
export async function noConsignmentConfirm(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/confirm`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 创建开票申请单
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createBill(params) {
  const { organizationId, trxLineIds, ...query } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill`, {
    method: 'POST',
    body: [...trxLineIds],
    query,
  });
}
/**
 * 创建开票申请单-全选接口
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createBillAll(params) {
  const { organizationId, trxLineIds, ...query } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill?allCreateBillFlag=1`, {
    method: 'POST',
    body: [...trxLineIds],
    query,
  });
}
/**
 * 创建开票通知新建按钮接口
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createNotificationCreateBill(params) {
  const { organizationId, trxLineIds, ...query } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-create`, {
    method: 'POST',
    body: [...trxLineIds],
    query,
  });
}
/**
 * 创建开票通知全选按钮接口
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createNotificationCreateBillAll(params) {
  const { organizationId, trxLineIds, ...query } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-create?allCreateBillFlag=1`, {
    method: 'POST',
    body: [...trxLineIds],
    query,
  });
}
/**
 * 创建开票通知新建按钮接口
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function createAcceptanceCreateBill(params) {
  const { organizationId, acceptListLineIds, displayReverseFlag } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill/by-accept-lines?displayReverseFlag=${displayReverseFlag}`,
    {
      method: 'POST',
      body: [...acceptListLineIds],
    }
  );
}
/**
 * 非寄销开票申请单维护查询
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function fetchMaintainConsigBill(params) {
  const organizationId = getCurrentOrganizationId();
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/update`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 维护开票通知列表查询
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function fetchMaintainNotificationList(params) {
  const organizationId = getCurrentOrganizationId();
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-update`, {
    method: 'GET',
    query: param,
  });
}

/*
 * 查询我的采购账单 - 非寄销
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchPurchaseNoConsignment(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 移除或撤销移除
 * @export
 * @param {String} params.interfaceName 接口名
 * @param {Array} params.createRowKeys 主键数组
 * @returns
 */
export async function removeInvoiceOrNot(params) {
  const { organizationId, interfaceName, createRowKeys } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/${interfaceName}`, {
    method: 'POST',
    body: [...createRowKeys],
  });
}
/**
 * 移除
 * @export
 * @param {String} params.interfaceName 接口名
 * @param {Array} params.createRowKeys 主键数组
 * @returns
 */
export async function removeAcceptance(params) {
  const { organizationId, acceptListLineIds } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-line/not-need-invocie`, {
    method: 'POST',
    body: [...acceptListLineIds],
  });
}
/**
 * 撤销移除
 * @export
 * @param {String} params.interfaceName 接口名
 * @param {Array} params.createRowKeys 主键数组
 * @returns
 */
export async function returnAcceptance(params) {
  const { organizationId, acceptListLineIds } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-line/need-invocie`, {
    method: 'POST',
    body: [...acceptListLineIds],
  });
}

/**
 *
 * 取消开票申请数据查询 - 非寄销
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchNCCancelBill(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  const billNum = params.billNum && encodeURIComponent(params.billNum);
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-detail/cancel`, {
    method: 'GET',
    query: {
      ...param,
      billNum,
    },
  });
}

/**
 * 保存开票单
 * @export
 * @param {String} params.remark 供应商备注
 * @returns
 */
export async function saveBill(params) {
  const {
    organizationId,
    customizeUnitCode = 'SFIN.BILL_CREATE_DETAIL.DETAILED',
    ...other
  } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: other,
    }
  );
}

/**
 * 对账单关联扣款单保存
 * @export
 */
export async function saveTotalBill(params) {
  const { organizationId, supLineList, billHeaderId } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/bill-save/${billHeaderId}`,
    {
      method: 'POST',
      body: supLineList,
    }
  );
}

/**
 *
 * 取消开票申请数据 - 非寄销
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function cancelBill(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-detail/cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 提交开票单
 * @export
 * @param {String} params.remark 供应商备注
 * @returns
 */
export async function submitBill(params) {
  const {
    organizationId,
    customizeUnitCode = 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO,SFIN.BILL_CREATE_DETAIL.DETAILED',
    ...other
  } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill/submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: other,
    }
  );
}

/**
 * 创建开票通知--提交开票单
 * @export
 * @param {String} params.remark 供应商备注
 * @returns
 */
export async function createNotificationSubmitBill(params) {
  const {
    organizationId,
    customizeUnitCode = 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO,SFIN.BILL_CREATE_DETAIL.DETAILED',
    ...other
  } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill/inform-submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: [other],
    }
  );
}

/**
 *
 * 删除开票单
 * @export
 * @param {String} params
 * @returns
 */
export async function deleteBill(params) {
  const { organizationId, billHeaderId } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/${billHeaderId}`, {
    method: 'DELETE',
  });
}

/**
 *
 * 删除开票单
 * @export
 * @param {String} params
 * @returns
 */
export async function deleteList(params) {
  const { organizationId, billHeaderId, body } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/bill-delete/${billHeaderId}`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 *
 * 删除开票单
 * @export
 * @param {String} params
 * @returns
 */
export async function createNotificationDeleteBill(params) {
  const { organizationId, billHeaderId } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-delete`, {
    method: 'DELETE',
    body: [billHeaderId],
  });
}

/**
 *
 * 取消开票单
 * @export
 * @param {String} params
 * @returns
 */
export async function cancelCreateBill(params) {
  const { organizationId, billHeaderId } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/${billHeaderId}/cancel`, {
    method: 'POST',
  });
}

/**
 *
 * 创建开票通知 整单取消接口
 * @export
 * @param {String} params
 * @returns
 */
export async function createNotificationCancelCreateBill(params) {
  const { organizationId, billHeaderId } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-cancel/${billHeaderId}`, {
    method: 'POST',
  });
}

/**
 * 非寄销开票单销售账单汇总查询
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchSupplierBill(params) {
  const param = parseParameters(params);
  const customizeUnitCode = 'SFIN.BILL_SALE_LIST.GRID,SFIN.BILL_SALE_LIST.FILTER';
  return request(
    `${SRM_FINANCE}/v1/${params.organizationId}/bill/supplier?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 查询操作记录接口
 */
export async function queryRecordList(params) {
  const organizationId = getCurrentOrganizationId();
  const { billHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-actions/${billHeaderId}`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询审批记录接口（对账）
 */
export async function queryApproveRecordList(params) {
  const organizationId = getCurrentOrganizationId();
  const { billHeaderId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-actions/${billHeaderId}/approval`, {
    method: 'GET',
    query,
  });
}
/**
 * 打印
 * @function print
 */
export async function print(billHeaderId) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/${billHeaderId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}
/**
 * 电商打印
 * @function print
 */
export async function retailersPrint(billHeaderId) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/${billHeaderId}/es/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}
/**
 * 校验创建开票申请单
 * @export
 * @returns
 */
export async function createValidateBill(params) {
  const { organizationId, trxLineIds } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/validate-creation`, {
    method: 'PUT',
    body: [...trxLineIds],
  });
}

/**
 * 校验审核开票申请单
 * @export
 * @returns
 */
export async function confirmValidateBill(params) {
  const { organizationId, billHeaderList, customizeUnitCode } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/validate-confirm`, {
    method: 'PUT',
    body: billHeaderList,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

/**
 * 校验提交开票申请单
 * @export
 * @returns
 */
export async function submitValidateBill(params) {
  const { organizationId, ...other } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/validate-submit`, {
    method: 'PUT',
    body: other,
  });
}

// 采购对账单详情查询
export async function fetchDetailSearch(params) {
  const { tenantId, customizeUnitCode, ...query } = params;
  return request(
    `${SRM_FINANCE}/v1/${tenantId}/bill-detail?customizeUnitCode=${customizeUnitCode}`,
    {
      query: parseParameters(query),
    }
  );
}

// 销售对账单详情查询
export async function fetchSalesDetailSearch(params) {
  const { tenantId, customizeUnitCode, ...query } = params;
  return request(
    `${SRM_FINANCE}/v1/${tenantId}/bill-detail/supplier?customizeUnitCode=${customizeUnitCode}`,
    {
      query: parseParameters(query),
    }
  );
}

const organizationId = getCurrentOrganizationId();

// 电商对账单-保存
export async function save(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/save`, {
    method: 'POST',
    body: params,
  });
}

// 电商对账单-提交审批
export async function submit(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/submit`, {
    method: 'POST',
    body: params,
  });
}

// 电商对账单-取消
export async function cancel(billHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/cancel/${billHeaderId}`, {
    method: 'POST',
  });
}

// 电商对账单-差异反馈电商
export async function feedbackEcommerce(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/notice`, {
    method: 'POST',
    body: params,
  });
}

// 电商对账单-确认
export async function confirm(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/confirm`, {
    method: 'POST',
    body: params,
  });
}

// 电商对账单-确认
export async function synchronousEcommerce(billHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/ecConfirm/${billHeaderId}`, {
    method: 'POST',
  });
}

// 电商对账单-通过
export async function approve(billHeaderId) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-ec/ecConfirm/${billHeaderId}`, {
    method: 'POST',
  });
}

export async function reImport(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-sitf/sync-batch`, {
    method: 'POST',
    body,
  });
}

export async function syncBill(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/sync`, {
    method: 'POST',
    body,
  });
}

export async function fetchSycnPurchaseNoConsignment(params) {
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/qurySyncBill`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchBillHistory(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/actions`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchErrorList(params) {
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/error-messages/list`, {
    method: 'GET',
    query: param,
  });
}
/**
 *
 * 开票通知详情明细-新增行
 * @export
 * @param {String} params
 * @returns
 */
export async function billCreateLine({ trxLineIds, billHeaderId }) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill/inform-create/bill-line/${billHeaderId}`,
    {
      method: 'POST',
      body: trxLineIds,
    }
  );
}

/**
 *
 * 开票通知详情明细-删除行
 * @export
 * @param {String} params
 * @returns
 */
export async function deleteBillLine({ billHeaderId, billLineList }) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill/inform-create/bill-line-delete/${billHeaderId}`,
    {
      method: 'DELETE',
      body: billLineList,
    }
  );
}

/**
 *
 * 维护开票通知批量提交
 * @export
 * @param {String} params
 * @returns
 */
export async function invoiceNotificationBatchSubmit(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/inform-submit`, {
    method: 'POST',
    body,
  });
}

/**
 *
 * 维护开票申请单批量提交
 * @export
 * @param {String} params
 * @returns
 */
export async function invoiceMaintainBatchSubmit(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill/batch-submit`, {
    method: 'POST',
    body,
  });
}
