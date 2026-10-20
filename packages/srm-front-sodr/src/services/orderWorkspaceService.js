/*
 * orderWorkspaceService - 订单工作台
 * @date: 2021/05/07 11:50:23
 * @author: jq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import {
  SRM_SPUC,
  SRM_PLATFORM,
  SRM_MDM,
  SRM_SSRC,
  SRM_SPRM,
  SRM_SSTA,
  SRM_SBDM,
} from '_utils/config';
import { HZERO_PLATFORM, HZERO_HWFP } from 'utils/config';
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getCurrentTenant,
} from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 订单提交
export function submit(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-submit`, {
    method: 'POST',
    body: params,
  });
}

// 订单审批通过
export function approve(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-approve`, {
    method: 'POST',
    body: params,
  });
}

// 订单审批拒绝
export async function reject(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-reject`, {
    method: 'POST',
    body: data,
  });
}

// 订单发布
export async function publish(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-publish`, {
    method: 'POST',
    body: params,
  });
}

// 订单交期审核同意-整单
export async function agree(body, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/delivery-date-review/agree`, {
    method: 'POST',
    body,
    query,
  });
}

// 订单交期审核退回-整单
export async function reviewReject(body, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/delivery-date-review/reject`, {
    method: 'POST',
    body,
    query,
  });
}

// 整单加急
export async function fullOrderUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/urgent`, {
    method: 'POST',
    body: params,
  });
}

// 取消加急
export async function cancelUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

// 发运行加急
export async function urgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/urgent`, {
    method: 'POST',
    body: params,
  });
}

// 发运行取消加急
export async function detailCancelUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

// 交期审核按行同意
export async function lineAgree(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/delivery-date-review/line/agree`, {
    method: 'POST',
    body: params,
    query,
  });
}

// 交期审核按行退回
export async function lineReject(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/delivery-date-review/line/reject`, {
    method: 'POST',
    body: params,
    query,
  });
}

// 检验采购组织采购员是否清空
export async function validataOrg(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/ou-org`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 订单行附件ID刷新
 * @async
 * @function getLineAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getLineAttachmentUuid(data) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-line/${data.poLineId}/lines/attachment-uuid`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

// 明细审批通过
export async function detailApprove(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/detail-approve`, {
    method: 'POST',
    body: data,
  });
}

// 明细审批拒绝
export async function detailReject(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/detail-reject`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 查询手工创建订单初始化数据
 */
export async function fetchPageOrder() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/manual-create-order`, {
    method: 'GET',
    query: {
      camp: 1,
    },
  });
}

/**
 * 查询配置中心
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 查询是否引用新价格库
 */
export async function fetchNewPriceLibEnable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/new-price-lib/enable`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询是否通过物料引用新价格库
 */
export async function fetchItemNewPriceLibEnable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/enable/item-price`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询新价格库
 */
export async function fetchNewPriceLibData(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/bettle/price`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 保存文件上传后的UUID
 * @async
 * @function saveAttachmentUUID
 * @param {String} organizationId - 组织Id
 * @returns {object} fetch Promise
 */
export async function saveAttachmentUUID(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/attachmentUUID`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 保存文件上传后的UUID--订单变更页面使用
 * @async
 * @function saveAttachmentUUID
 * @param {String} organizationId - 组织Id
 * @returns {object} fetch Promise
 */
export async function saveAttachmentUUIDForChange(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-vers/attachmentUUID`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 订单保存
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function saveDetail({ customizeUnitCode, data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/maintain`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/*
 * 订单保存前弱校验
 */
export async function saveWarn({ customizeUnitCode, data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/save-warn`, {
    method: 'POST',
    body: data,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 订单保存 -- 新建保存
 * @async
 * @function newSaveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function newSaveDetail({ customizeUnitCode, data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/manually-create-po-header`, {
    method: 'POST',
    body: data,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 整单引用删除
 * @async
 * @function deleteDelivery
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 订单提交
 * @async
 * @function submitDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function submitDetail({ customizeUnitCode, data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/submit`, {
    method: 'POST',
    body: data,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 采购订单详情页发布
 * @async
 * @function detailPublish
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function detailPublish(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/detail-publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单头id
 * @function print
 */
export async function print(poHeaderId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 保存订单
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function allOrdersSaveDetail({ query, ...params }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/purchase/save`, {
    method: 'PUT',
    body: params,
    query,
  });
}

/**
 * 信息补录
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function supplementary({ query, ...params }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/po-header/supplement-info`, {
    method: 'POST',
    body: params,
    query,
  });
}

/**
 * 订单保存（采购申请）
 * @async
 * @function newSave
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function newSave({ customizeUnitCode, data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/by-pr/maintain`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 订单提交校验（采购申请）
 * @async
 * @function submitValidate
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function submitValidate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/by-pr/validate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 整单引用删除（）
 * @async
 * @function deleteDelivery
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteSheetDelivery(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header`, {
    method: 'DELETE',
    body: params,
  });
}

export async function exportErp(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/exportErp`, {
    method: 'POST',
    body: params,
  });
}

export async function exportToErp(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/export-to-erp/approve/batch`, {
    method: 'POST',
    body: params,
  });
}

export async function exportToErpAgain(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/delivery-export-erp`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 按行引用创建前校验
 * @export
 * @param {Object} params
 */
export async function check(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/po_config`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 按行引用创建
 * @export
 * @param {Object} params
 */
export async function lineCreate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line_new`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 整单引用创建
 * @export
 * @param {Object} params
 */
export async function wholeQuoteCreate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/header`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 订单复制
 * @export
 * @param {Object} params
 */
export async function copyOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/copy`, {
    method: 'PUT',
    query: params,
  });
}

// 清空行上BOM
export async function clearPoItemBOM(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-item-boms/delete_by_poline/${params.poLineId}`,
    {
      method: 'DELETE',
    }
  );
}

// 变更查询BOM
export async function queryChangePoItemBOM({ body, query }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms/change`, {
    method: 'POST',
    body,
    query,
  });
}

// 获取推荐供应商
export async function getSupplier(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/from-pr/default-supplier`, {
    method: 'POST',
    body: params,
  });
}

// 查询留言板数据
export async function queryMessage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'GET',
    query,
  });
}

// 提交留言板数据
export async function sendMessage(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'POST',
    body: data,
  });
}

// 审批记录
export async function fetchApproveRecordList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-records/list-history-approval`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询是否按行协同
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise
 */
export async function queryCollByLine() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/enable/coll_by_line`, {
    method: 'GET',
  });
}

/**
 * 查询是否开启双单位配置
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise 0不开启双单位，1上下游和订单都开启，2仅订单开启
 */
export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询金额计算是按金额还是按单价，默认为按金额
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise 0不开启双单位，1上下游和订单都开启，2仅订单开启
 */
export async function queryAmountCalcConfig(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute?fullPathCode=SITE.SPFM.CALCULATION_METHOD`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 订单取消
 * @param {object[]} params - 取消的订单
 */
export async function cancelOrder(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/cancel`, {
    method: 'PUT',
    body: params,
    query,
  });
}

/**
 * 订单关闭请求
 * @param {object[]} params - 关闭的订单行
 */
export async function closeOrder(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/close`, {
    method: 'PUT',
    body: params,
    query,
  });
}

/**
 * 订单变更可修改字段查询
 * @param {object} params - 查询参数
 */
export async function fetchChangeFields(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-configs/query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 订单变更提交
 * @param {object} params - 查询参数
 */
export async function submitChangeOrder(params) {
  const { poHeaderId, customizeUnitCode, ...body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/change/${poHeaderId}/submit`, {
    method: 'POST',
    body,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 订变更提交校验
 */
export async function addNewChangeSubmitDetail(params) {
  const { poHeaderId, customizeUnitCode, ...body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/change/${poHeaderId}/submit-warn`, {
    method: 'POST',
    body,
    query: {
      customizeUnitCode,
    },
  });
}
/**
 * 订单提交添加一个新接口
 * @async
 * @function addNewSubmitDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function addNewSubmitDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/submit-warn`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchPriceUpdateList(params) {
  const { poHeaderId, ...others } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/price-update-list`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 根据价格库更新当前订单所有行的价格
 */
export async function priceUpdate(params) {
  const { poHeaderId, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/price-update`, {
    method: 'PUT',
    query,
  });
}

/**
 * 订单按行关闭
 * @param {object[]} params - 关闭的订单行
 */
export async function closeLine(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/close`, {
    method: 'PUT',
    body: params,
    query,
  });
}

/**
 * 订单按行取消
 * @param {object[]} params - 取消的订单行
 */
export async function cancelLine(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/cancel`, {
    method: 'PUT',
    body: params,
    query,
  });
}

// 查询值集默认值
export async function fetchDefaultLovValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/page`, {
    method: 'GET',
    query: params,
  });
}

// 查询是否引用新价格库(一单到底使用)
export async function workbenchNewPriceLibEnable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/new-price-lib/enable`, {
    method: 'GET',
    query: params,
  });
}

// 校验物料&库存组织关联关系
export async function checkInvOrganization(params) {
  const { list, invOrganizationId } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-line/check/invOrganization/${invOrganizationId}`,
    {
      method: 'POST',
      responseType: 'text',
      body: list,
    }
  );
}

// 校验物料&库存组织关联关系
export async function checkCategoryId(params) {
  const { list, categoryId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/check/category/${categoryId}`, {
    method: 'POST',
    responseType: 'text',
    body: list,
  });
}

// 查询双单位基本数量换算关系
export async function queryDoubleUnitConversion(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

// 查询订单下单控制-供应商生命周期管理 业务规则定义
export async function queryOrderControlConfig(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/config/life-cycle-phase`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 暂挂
 */
export async function pendingFlag(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-source-contract-config`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 寻源暂挂
 */
export async function sourePending(data) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source/result/external-manage/pending/no-saga`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 寻源取消暂挂
 */
export async function soureCancelPending(data) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source/result/external-manage/cancel-pending/no-saga`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 是否启动新版界面
 */
export async function queryNewTableEnable(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rel-table/query/spuc_order_new_tenant`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 查询并单TAB
 */
export async function fetchDetailTable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/creating/po/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询付款数据
 */
export async function fetchPaymentData(params) {
  return request(`/ssta/v1/${organizationId}/settle-sub-records/payment/record`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 数量总计
 */
export async function OrderQuantity() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/count `, {
    method: 'GET',
  });
}

/**
 * 寻源并单创建订单
 */
export function createCombineOrder(sourceResultDTOList, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/rfx-to-order/new`, {
    query,
    method: 'POST',
    body: sourceResultDTOList,
  });
}

/**
 * 协议并单创建订单
 */
export async function createCombineProtocol(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-contract-result/line/new`, {
    method: 'POST',
    body: params,
    query,
  });
}
/**
 * 重新同步
 */
export async function reSync(poHeaderId, data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-sync/retry/${poHeaderId}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 预算校验
 */
export async function budgetVerification(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-budget-check`, {
    method: 'POST',
    body: data,
  });
}

/*
 * 订单列表批量提交添加弱校验
 */
export async function batchSubmitWarn(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-submit-warn`, {
    method: 'POST',
    body: params,
  });
}

// 查询公司信息,带出业务实体/采购组织
export async function fetchAutoGetCompany(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/purchase-company`, {
    method: 'GET',
    query: params,
  });
}

export async function exportVendorSystemStatusReSync(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/exp-supplier-erp`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 获取基准价（一单到底）
 */
export async function fetchBenchmarkPriceType(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/config/benchmark-price`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 获取物料是否调用价格库（一单到底）
 */
export async function fetchItemChangePrice(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/config/ref-price-lib-by-item`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取价格库价格是否可修改（一单到底）
 */
export async function fetchModifyablePriceFlag(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-price-change/getConfig`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 重新同步(批量)
 */
export async function retryBatch({ data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-sync/retry/batch`, {
    method: 'POST',
    body: data,
    // query,
  });
}

/**
 * 明细-全部 重新同步(批量)
 */
export async function reSyncBatch({ data }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line-sync/retry/batch`, {
    method: 'POST',
    body: data,
    // query,
  });
}

/**
 * 撤销变更
 * @param {object} params - 接口传参
 */
export async function handleRevoke(params) {
  const { poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-vers/recall`, {
    method: 'POST',
    query: {
      poHeaderId,
    },
  });
}

/**
 * 发起解签
 * @param {object} params - 接口传参
 */
export async function handleTerminate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs/terminate-sign`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 订单变更新增行(申请)
 * @param {object} params - 接口传参
 */
export async function orderChangePrToLine({ poHeaderId, data, query }) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-header-change/${poHeaderId}/by-pr/pr-to-line`,
    {
      method: 'POST',
      body: data,
      query,
    }
  );
}

/**
 * 订单变更新增行(寻源)
 * @param {object} params - 接口传参
 */
export async function orderChangeRfxToLine({ poHeaderId, data, query }) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po_source/po-header-change/${poHeaderId}/rfx-to-line`,
    {
      method: 'POST',
      body: data,
      query,
    }
  );
}

/**
 * 订单变更新增行(协议)
 * @param {object} params - 接口传参
 */
export async function orderChangeContractToLine({ poHeaderId, data, query }) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po_contract/po-header-change/${poHeaderId}/contract-to-line`,
    {
      method: 'POST',
      body: data,
      query,
    }
  );
}

/**
 * 新增申请转订单行
 * */
export async function prToLine({ poHeaderId, data, query }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/by-pr/pr-to-line`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 新增寻源转订单行
 * */
export async function rfxToLine({ poHeaderId, data, query }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po_source/${poHeaderId}/rfx-to-line`, {
    method: 'POST',
    body: data,
    query,
  });
}

/**
 * 新增协议转订单行
 * */
export async function contractToLine({ poHeaderId, data, query }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po_contract/${poHeaderId}/contract-to-line`, {
    method: 'POST',
    body: data,
    query,
  });
}

// 查询配置表是否使用新的供应商值集
export async function fetchConfigSheet() {
  const configCode = 'source_supplier_lov_old_config';
  const data = {
    tenantNum: getCurrentTenant().tenantNum,
  };
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 批量获取价格库价格
export async function priceUpdateList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/change/price-update-list`, {
    method: 'POST',
    body: params,
  });
}

// 获取付款申请计划金额（整单取消）
export async function paymentPlanWholeCancel(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/payment-plan/whole-cancel/simulate`, {
    method: 'POST',
    body: params,
  });
}

// 获取付款申请计划金额（按行取消）
export async function paymentPlanLineCancel(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/payment-plan/cancel/simulate`, {
    method: 'POST',
    body: params,
  });
}

// 获取付款申请计划金额（变更）
export async function paymentPlanChange(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/payment-plan/change/simulate`, {
    method: 'POST',
    body: params,
  });
}

// 获取业务规则定义个性化字段是否可修改价格库价格
export async function getConfigField() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-price-change/get-config-field`, {
    method: 'GET',
  });
}

/**
 * 撤回留言
 */
export async function recallMessage(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 撤销审批
 * @param {object} params - 接口传参
 */
export async function handleUnifyRecall(params) {
  const { poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-unify/common/revoke`, {
    method: 'GET',
    query: {
      poHeaderId,
    },
  });
}

/**
 * 取消关闭赠品行弱校验
 * @param {object} params 接口传参
 */
export async function closeOrCancelGift(params) {
  const { data } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line-gifts/cancel-close `, {
    method: 'POST',
    body: data,
  });
}

/**
 *获取是否开启折扣-赠品业务配置
 */
export async function getGiftConfig() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line-gifts`, {
    method: 'GET',
  });
}

/**
 *提交前的赠品行数据更新
 */
export async function updateGift(params, query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line-gifts/submit`, {
    method: 'POST',
    body: params,
    query,
  });
}

/**
 * 批量取消前置校验预算
 * @param {object} params - 接口传参
 */
export async function cancelValidatePayment(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/cancel-validate-payment`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 电商订单变更提交
 * @param {object} params - 接口传参
 */
export async function eCommerceChange(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/ec/change/submit`, {
    method: 'POST',
    body: others,
    query: {
      customizeUnitCode,
    },
  });
}

/**
 * 付款计划配置查询
 * @param {object} params - 接口传参
 */
export async function paymentPlanConfig(params) {
  return request(`${SRM_SSTA}/v1/${organizationId}/plan-headers/query-term-and-plan-control-mode`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 单据流与关联单据显示配置查询
 * @param {object} params - 接口传参
 */
export async function fetchDisplayDocAndDocFlow(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/query/doc-cnf`, {
    query: params,
  });
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag`, {
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
    `${HZERO_HWFP}/v1/${organizationId}/runtime/prc/revoke-by-key/${businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}

/**
 * 在线聊天室
 * @param {object} params - 接口传参
 */
export async function initChatOnlineRoom(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sodrChatOnlineRoom`, {
    query: params,
  });
}

/**
 * 固定资产行拆分(维护页面)
 * @param {object} params - 接口传参
 */
export async function poLineSplit(params) {
  const { poHeaderId, query, body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/${poHeaderId}/po-line/split`, {
    method: 'POST',
    body,
    query,
  });
}

/**
 * 固定资产行拆分(变更页面)
 * @param {object} params - 接口传参
 */
export async function poChangeLineSplit(params) {
  const { poHeaderId, query, body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/${poHeaderId}/change/po-line/split`, {
    method: 'POST',
    body,
    query,
  });
}

/**
 * 订单提交预校验协议
 * @param {object} params - 接口传参
 */
export async function associatedPcCheck(params) {
  const { pageType, body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-associated-pc-check/${pageType}`, {
    method: 'POST',
    body,
  });
}

/**
 * 订单提交预校验协议占用金额
 * @param {object} params - 接口传参
 */
export async function associatedPcAmountCheck(params) {
  const { pageType, body } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-associated-pc-amount-check/${pageType}
`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 协议控制校验
 */
export async function fetchVerifyContract() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-approve-rules/verify/contract`);
}

// 费用信息头查询
export async function queryExpenseHeader(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-item-expense-line/query-expense-header-detail`,
    { method: 'POST', body: params }
  );
}

// 费用信息行查询
export async function queryExpenseLine(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/po-item-expense-line/query-expense-line-detail`,
    { method: 'POST', body: params }
  );
}

// 费用信息行保存
export async function saveExpenseLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-expense-line/save`, {
    method: 'POST',
    body: params,
  });
}

// 费用信息行删除
export async function deleteExpenseLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-expense-line/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 整单创建退货订单
 */
export async function createReturnPoNew(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/return/po/new`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 按行创建退货订单
 */
export async function createReturnPoNewByLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/return/location/new`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 订单提交校验是否弹出付款计划弹窗
 */
export async function paymentCheckSubmit(parmas) {
  return request(`${SRM_SPUC}/v1/${organizationId}/payment-check/detail/submit`, {
    method: 'POST',
    body: parmas,
  });
}

/**
 * 批量新增行
 * @param {object} params - 接口传参
 */
export async function batchAddOrderLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/optimal/price/batch`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 资金计划-订单金额计算
 * @param {object} params - 接口传参
 */
export async function orderAmountCalculation(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/maintian/detail/amount/calculate`, {
    method: 'POST',
    body: params,
  });
}

// /**
//  * 资金计划-校验资金计划预构造数据
//  * @param {object} params - 接口传参
//  */
// export async function termHeadersValidateData(params) {
//   return request(`${SRM_SBDM}/v1/${organizationId}/document-term-headers/validate-build`, {
//     method: 'POST',
//     body: params,
//   });
// }

/**
 * 资金计划-订单提交校验是否打开弹窗
 * @param {object} params - 接口传参
 */
export async function termHeadersValidate(params) {
  return request(`${SRM_SBDM}/v1/${organizationId}/document-term-headers/validate-consistency`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 资金计划-启用付款管控配置查询
 * @param {object} params - 接口传参
 */
export async function fetchFundPlanConfig(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/fund-plan/config/query`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 资金计划-付款条款详情保存
 * @param {object} params - 接口传参
 */
export async function fundPlanSave(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/fund-plan/save/MAINTAIN`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 资金计划-是否启用新付款条款功能
 * @param {object} params - 接口传参
 */
export async function fetchEnableFundConfig() {
  return request(`${SRM_SBDM}/v1/${organizationId}/term-headers/query-enable-fund-config`);
}

/**
 * 资金计划-批量按行取消校验
 * @param {object} params - 接口传参
 */
export async function fundPlanValidCaccel(params) {
  const { body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/fund-plan/valid/cancel`, {
    method: 'PUT',
    body,
  });
}

/**
 * 资金计划-批量按行取消订单金额计算
 * @param {object} params - 接口传参
 */
export async function fundPlanCancelSimulate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/fund-plan/cancel/simulate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 资金计划-变更订单金额计算
 * @param {object} params - 接口传参
 */
export async function fundPlanChangelSimulate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/fund-plan/change/simulate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 转单校验业务规则-推荐供应商/价格校验是否最新
 * @param {object} params - 接口传参
 */
export async function poFromPrLineNewCheck(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line-new/check`, {
    method: 'POST',
    body: params,
  });
}

// 针对未保存数据删除
export async function addDelete(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/fund-plan/line/delete`, {
    method: 'DELETE',
    body: params,
  });
}
