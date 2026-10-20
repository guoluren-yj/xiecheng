import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchModal(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/source/node-info`, {
    query: params,
    method: 'GET',
  });
}

export async function expFetchModal(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/source/node-info`, {
    query: params,
    method: 'GET',
  });
}

/**
 * 事务-下拉框值集查询
 * */
export async function fetchInit(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench//source/trx/all-node-info`,
    {
      query: params,
      method: 'GET',
    }
  );
}

export async function modalPostCreate(params) {
  const { nodeConfigId, urlType } = params;
  const param = { nodeConfigId, ...params.queryParams };
  const url = !urlType
    ? `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/waiting-todo-sinv-all?customizeUnitCode=${param?.customizeUnitCode}`
    : `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/waiting-todo-sinv`;
  return request(url, {
    body: !urlType ? param : params.sourceList,
    method: 'POST',
  });
}

// 供应商方新建接口
export async function modalSupplierPostCreate(params) {
  const { nodeConfigId, urlType } = params;
  const param = { nodeConfigId, ...params.queryParams };
  const url = !urlType
    ? `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/waiting-todo-sinv-all?customizeUnitCode=${param?.customizeUnitCode}`
    : `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/waiting-todo-sinv`;
  return request(url, {
    body: !urlType ? param : params.sourceList,
    method: 'POST',
  });
}

/**
 *事务-提交and删除
 * @param {勾选数据} list
 */
export async function subAndDelete(param) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/doing-sinv?sugRcvStatusCode=${param.type}`,
    {
      method: 'POST',
      body: param.selectedRecords,
    }
  );
}

/**
 *事务-Tab显示条目数量
 * @param {勾选数据} list
 */
export async function fetchTabDataList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/all/count`, {
    method: 'GET',
    query: { ...params, page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

/**
 *供应商事务-Tab显示条目数量
 * @param {勾选数据} list
 */
export async function fetchSupplierTabDataList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/all/count`, {
    method: 'GET',
    query: { ...params, page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

/**
 *事务-已收货-退回
 * @param {勾选数据} list
 */
export async function fetchSendBackList(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/finished-line-waiting-todo-sinv?rcvTrxTypeId=${params.rcvTrxTypeId}&nodeConfigId=${params.nodeConfigId}`,
    {
      method: 'POST',
      body: params.selectedRecords,
    }
  );
}

/**
 * 源单-下拉框值集查询
 * */
export async function fetchInitSource(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/source/common-node-info`,
    {
      method: 'POST',
      body: params.selectedRecords,
    }
  );
}

/**
 * 明细保存
 * @param {勾选数据} list
 */
export async function handleSave(params) {
  const { customizeUnitCode, data, tplInfo = {} } = params;
  let query;
  if (customizeUnitCode) {
    query = {
      customizeUnitCode,
      cuszTplStageCode: tplInfo?.cuszTplStageCode,
      cuszTplPageCode: tplInfo?.cuszTplPageCode,
      cuszTplTemplateCode: tplInfo?.templateCode,
      cuszTplVersion: tplInfo?.templateVersion,
    };
  }
  const querys = tplInfo?.templateVersion ? query : { customizeUnitCode };
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/save`, {
    query: querys,
    method: 'PUT',
    body: data,
  });
}

/**
 * 明细删除
 * @param {勾选数据} list
 */
export async function handleDel(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/line/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 明细提交
 * @param {勾选数据} list
 */
export async function handleSubmit(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/submitted`, {
    query: { customizeUnitCode },
    method: 'POST',
    body: data,
  });
}

/**
 * 撤销审批
 * @param
 */
export async function handleRevokeApi(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/revocation`, {
    query: { customizeUnitCode },
    method: 'POST',
    body: data,
  });
}

/**
 * 评价
 * @param {评价} params
 */
export async function handleEvaluate(params) {
  const { rcvTrxHeaderId, ...data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/score/${rcvTrxHeaderId}/save`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 明细删除
 * @param {勾选数据} list
 */
export async function handleDelete(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/delete`, {
    // query: { customizeUnitCode },
    method: 'DELETE',
    body: params,
  });
}

/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function print(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print`, {
    method: 'POST',
    responseType: 'blob',
    body: payload,
  });
}

/**
 * 新打印
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function newPrint(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`, {
    method: 'POST',
    responseType: 'blob',
    body: payload,
  });
}

/**
 * 查询收货中的节点信息
 * @async
 * @param {!number} 策略Id -  strategyHeaderId
 * @function print
 */
export async function getPermissions(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/permission-node-list`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 *明细页面树结构
 * @param {勾选数据} list
 */
export async function treeFetch(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/creating/sinv/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 明细提交-删除-打印
 * @param {并单编码} cacheKey
 * @param {操作功能类型} componentType
 * @param {需要传的数据} rcvTrxHeaderIds
 * @param {个性化单元} customizeUnitCode
 */
export async function subDelPriFetch(params) {
  const { customizeUnitCode, cacheKey, rcvTrxHeaderIds, componentType } = params;
  const url =
    componentType === 'delete'
      ? `/sinv/rcv/trx/workbench/batch/delete?cacheKey=${cacheKey}`
      : componentType === 'submit'
      ? `/sinv/rcv/trx/workbench/batch/submitted?cacheKey=${cacheKey}`
      : `/sinv/rcv/trx/workbench/batch-print?cacheKey=${cacheKey}`;
  if (componentType === 'delete') {
    return request(`${SRM_SPUC}/v1/${organizationId}${url}`, {
      query: { customizeUnitCode },
      method: 'DELETE',
      body: rcvTrxHeaderIds,
    });
  }
  if (componentType === 'submit') {
    return request(`${SRM_SPUC}/v1/${organizationId}${url}`, {
      query: { customizeUnitCode },
      method: 'POST',
      body: rcvTrxHeaderIds,
    });
  } else {
    return request(`${SRM_SPUC}/v1/${organizationId}${url}`, {
      method: 'POST',
      responseType: 'blob',
      body: rcvTrxHeaderIds,
    });
  }
}

/**
 * 查询操作数据
 * @param {Object} params - 查询参数
 */
export async function operationDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-change-records/${query.headerId}/${query.id}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 查询操作数据
 * @param {Object} params - 查询参数
 */
export async function alingeDetail(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-change-records/${params.headerId}/${params.id}/repost`,
    {
      method: 'POST',
      body: params.record,
    }
  );
}

/**
 * 已完成重新同步数据
 * @param {Object} data - 同步参数
 */
export async function settlementOnChange(params) {
  const { data, type } = params;
  const url =
    type === 'settlement'
      ? `sinv/rcv/trx/workbench/batch-export-line-settle`
      : `sinv/rcv/trx/workbench/batch-export-line-sap`;
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: data,
  });
}

export async function handleTransferUser(params) {
  const { id, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/transfer?userId=${id}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 获取参考凭证跳转的节点Id
 * @param {fromRcvTrxHeaderId} params  fromRcvTrxHeaderId
 * @returns Promise
 */
export async function handleEndGetNodeConfigIndex(params) {
  // /sinv/rcv/trx/workbench/trx/header/__-AWFTW_sS7Gv2NgePxXoKvg-__/detail
  const { fromRcvTrxHeaderId } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/header/${fromRcvTrxHeaderId}/detail`,
    {
      method: 'GET',
    }
  );
}

export async function handLink(params) {
  const { methods, data, headerOrlineFlag } = params;
  const url = headerOrlineFlag ? `rcv-trx-header-exts` : 'sinv/rcv-trx-line-exts';
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: methods,
    body: data,
  });
}

// 单个确认
export async function handleConfirmApi(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier-confirm-sinv`, {
    query: { customizeUnitCode },
    method: 'POST',
    body: data,
  });
}

// 单个拒绝
export async function handleRejectApi(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier-reject-sinv`, {
    query: { customizeUnitCode },
    method: 'POST',
    body: data,
  });
}

// 批量确认
export async function handleBatchConfirmApi(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-supplier-confirm-sinv`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 批量撤回
export async function handleBatchRetryApi(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-revocation`, {
    method: 'POST',
    body: params,
  });
}

// 批量拒绝
export async function handleBatchRejectApi(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-supplier-reject-sinv`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 勾选取消
export async function handleCancelApi(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 撤销审批
export async function handleRevokeApprovalChange(params) {
  let realRes;
  const res = await request(
    `${HZERO_HWFP}/v1/${organizationId}/runtime/prc/revoke-by-key/${params.businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}

// 撤销审批-供应商
export async function handleSupplierRevokeApprovalApi({ businessKey }) {
  const res = await request(
    `${HZERO_HWFP}/v1/${organizationId}/runtime/prc/revoke-by-key/supplier/${businessKey}?supplierFlag=true`,
    {
      method: 'GET',
    }
  );
  return res;
}

// 退货单校验
export async function handleReturnValidate(params, campKey) {
  const url =
    campKey === 'p'
      ? `sinv/rcv/trx/workbench/finished-line-waiting-todo-sinv-check?customizeUnitCode=${params?.customizeUnitCode}`
      : `sinv/rcv/trx/workbench/supplier/finished-line-waiting-todo-sinv-check?customizeUnitCode=${params?.customizeUnitCode}`;
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: params,
  });
}

// 退货单-退货全部
export async function handleReturnAllDataEventsChange(params, data, campKey) {
  const url =
    campKey === 'p'
      ? `sinv/rcv/trx/workbench/finished-line-waiting-todo-sinv-all?customizeUnitCode=${data?.customizeUnitCode}`
      : `sinv/rcv/trx/workbench/supplier/finished-line-waiting-todo-sinv-all?customizeUnitCode=${data?.customizeUnitCode}`;
  return request(`${SRM_SPUC}/v1/${organizationId}/${url}`, {
    method: 'POST',
    body: data,
    query: params,
  });
}

// 获取查询事务是否启用指定审批人标识
export async function getUserFlag(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/rcv-strategy-lines/query/enable/user/approve/flag`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}
