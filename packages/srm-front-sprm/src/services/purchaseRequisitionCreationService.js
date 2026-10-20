/*
 * deliveryCreationService - 送货单创建
 * @date: 2018/11/13 11:50:23
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import {
  SRM_SPUC,
  SRM_SCEI,
  SRM_MDM,
  SRM_MALL,
  SRM_PLATFORM,
  SRM_ADAPTOR,
  SRM_SPRM,
} from '_utils/config';

const SRM_IAM = '/iam';
const organizationId = getCurrentOrganizationId();
/**
 * 查询采购申请创建列表数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/maintain`, {
    query,
  });
}

/**
 * 需求维护头查询
 * @param {String} prHeaderId - 头id
 */
export async function queryDetailHeader(payload) {
  const { prHeaderId, unitCode, workFlowFlag } = payload;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode: unitCode, workFlowFlag },
  });
}

// /**
//  * 需求维护行查询
//  * @param {String} params - 参数
//  */
// export async function queryDetailList(params) {
//   const { prHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
//   return request(`${SRM_SPUC}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines`, {
//     method: 'GET',
//     query: otherParams,
//   });
// }
/**
 * 不分页需求维护行查询
 * @param {String} params - 参数
 */
export async function queryAllDetailList(params) {
  const { prHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  // return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines/all`, {
  //   method: 'GET',
  //   query: { ...otherParams, customizeUnitCode: otherParams.code },
  // });
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/page`, {
    method: 'GET',
    query: { ...otherParams, customizeUnitCode: otherParams.code },
  });
}
/**
 * 新增采购申请头
 * @async
 * @function add
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function add(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests`, {
    method: 'POST',
    body,
  });
}
/* 获取操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/actions`, {
    method: 'GET',
    query,
  });
}
/**
 * 更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  const { customizeUnitCode } = body;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}
/**
 * 提交采购申请
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function submit(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/submit`, {
    method: 'POST',
    body,
  });
}

/**
 * 获取工作流审批前操作是否弹窗
 * @async
 * @function operationModalService
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function operationModalService({ query, body }) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/operation-config`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 提交单条采购申请
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function singleSubmit(body) {
  const { customizeUnitCode } = body;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/singleton-submit`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}
/**
 * 删除采购申请
 * @async
 * @function deleteHeader
 * @param {object} params - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteHeader(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 取消采购申请
 * @async
 * @function cancel
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function cancel(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/cancel`, {
    method: 'POST',
    body,
  });
}
/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindHeaderAttachmentUuid(query) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/attachment-uuid`, {
    method: 'POST',
    query,
  });
}

/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindExternalAttachmentUuid(query) {
  const { attachmentUuid, ...others } = query;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/external-attachment-uuid`, {
    method: 'POST',
    query: { ...others, externalAttachmentUuid: attachmentUuid },
  });
}
/**
 * 绑定行附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindLineAttachmentUuid(query) {
  const { prHeaderId, ...otherQuery } = query;
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines/attachment-uuid`,
    {
      method: 'POST',
      query: otherQuery,
    }
  );
}
/**
 * 删除行
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteLines({ prHeaderId, prLines }) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines`, {
    method: 'DELETE',
    body: prLines,
  });
}

/**
 * 查询支付方式值集
 * @export
 * @param {Object} params
 */
export async function queryPaymentMethod(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-payments/by-company`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询收单地址
 * @export
 * @param {Object} params
 */
export async function queryInvoiceAddress(params) {
  const { newMallFlag, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  const url = `${SRM_MALL}/v1/${organizationId}/addresss/list`;
  const res = request(url, {
    method: 'GET',
    query,
  });
  return getResponse(res);
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

// 根据辅助单位及辅助数量查基本数量
export async function fetchQuantity(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询付款方式
 * @param {Object} params
 */
export async function fetchPaymentLov(params) {
  return request(`/smal/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询付款方式
 * @param {Object} params
 */
export async function fetchAutoGetCompany(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/purchase-company`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询付款方式
 * @param {Object} params
 */
export async function fetchAutoGetPurchasing(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/agent`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询发票类型
 * @param {Object} params
 */
export async function fetchInvoiceLov(params) {
  return request(`/hpfm/v1/${organizationId}/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询发票抬头
 * @param {Object} params
 */
export async function fetchInvoiceTitleLov(params) {
  return request(`/smal/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询开票明细
 * @param {Object} params
 */
export async function fetchInvoiceDetailLov(params) {
  return request(`/smal/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询开票方式
 * @param {Object} params
 */
export async function fetchInvoiceMethodLov(params) {
  return request(`/smal/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询开票方式
 * @param {Object} params
 */
export async function fetchPoLine(poLineId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poLineId}`, {
    method: 'GET',
  });
}

/**
 * 查询需求列表页数据 - 整单
 * @param {*} params
 * @returns
 */
export async function queryCopyPrList({ tenantId, ...params }) {
  // 只查询单据来源为 SRM 的申请单
  const param = {
    ...params,
    prSourcePlatform: 'SRM',
  };
  const newParams = parseParameters(param);
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-requests`, {
    method: 'GET',
    query: newParams,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 保存复制的采购申请 ${SRM_SPUC}-15750
export async function confirmCopyLine(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/copy`, {
    method: 'POST',
    body,
  });
}

// 比价单查询
export async function fetchPriceList(prHeaderId) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-compares/pr-list/${prHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 查询配置
 */
export async function fetchOtherInfo(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/po-header/detail/get-pr-other-data`, {
    method: 'POST',
    body: params,
  });
}

// fetchCnyExit
export async function fetchCnyExit(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/currency/select-pr/default-currency`, {
    method: 'GET',
    query: params,
  });
}

// 查询按钮权限信息
export async function fetchPermissions(permissionList) {
  return request(`${SRM_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: permissionList,
  });
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

/**
 * 触发字段触发后端接口
 */
export async function dynamicDoc({ body, query }) {
  // organizationId
  // sceneCode
  // templateCode
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/auto-fill-form`, {
    method: 'POST',
    body,
    query: { ...query },
  });
}

/**
 *  查询触发字段（埋点字段）
 */
export async function dynamicDocTemplate(params) {
  // organizationId
  // sceneCode
  // templateCode
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/auto-fill-form/fields`, {
    method: 'GET',
    query: params,
  });
}

/**
 *  查询价格库
 */
export async function queryReferencePrice(body, page) {
  const query = filterNullValueObject(parseParameters(page));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/line-create/price-library`, {
    method: 'POST',
    query,
    body,
  });
}

/*
 * 查询物料自定义属性
 */
export async function customAttribute(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/custom-attribute`, {
    method: 'GET',
    query: params,
  });
}

/*
 * 预算校验
 */
export async function budgetCheck(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-budget/purchase-requests/budget-check`, {
    method: 'POST',
    body,
  });
}

// fetchCnyExit
export async function fetchCnySelect(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/currency`, {
    method: 'GET',
    query: params,
  });
}

// 查询模块是否开启双单位
export async function fetchUomControl(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/secondary/uom/getcnf`, {
    method: 'GET',
    query: params,
  });
}

// 查询是否配置基准价
export async function fetchBasePrice(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/base-price`, {
    method: 'GET',
    query: params,
  });
}

// 查询物流分类规则限制的埋点字段
export async function fetchConditionFields(body) {
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-actions/query/condition/fields`, {
    method: 'GET',
    query: { fullPathCode },
  });
}

/**
 * 查询采购申请创建的 申请行导入模板
 */
export async function getImportTemplate(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/lines/importTemplate`, {
    method: 'POST',
    body,
  });
}

/**
 * 查询物料对应的双单位逻辑
 * @param {Object} params
 *
 * /v1/{organizationId}/items/double-uom/process?quantity=数量必输

body入参：[itemId,itemId,itemId]

 */
export async function getItemInfo(body) {
  const { quantity, itemId } = body;
  return request(`${SRM_MDM}/v1/${organizationId}/items/double-uom/process`, {
    method: 'POST',
    body: itemId,
    query: { quantity },
  });
}

/**
 * 批量查询物料对应的品类
 * @param {Object} params
 *

 */
export async function getBatchCategories(body) {
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/batch`, {
    method: 'POST',
    body,
  });
}

/**
 * 智能审核提交
 */
export async function aiCheckSubmitService(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/ai-check/submit-task?documentType=PR`, {
    method: 'POST',
    body,
  });
}
