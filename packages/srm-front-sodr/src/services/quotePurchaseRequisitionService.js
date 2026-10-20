/**
 * 引用采购申请 - service
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SPUC, SRM_PLATFORM, SRM_HPFM, SRM_SPRM, SRM_MDM, SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 按行引用查询请求
 * @param {object} params - 请求字段对象
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @returns {object} fetch Promise
 */
export async function queryLineQuotation(params) {
  const page = parseParameters(params);
  // ${SRM_SPUC}/v1/${organizationId}/secondary/po-workbench/from-pr/line
  return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-line`, {
    method: 'GET',
    query: { ...params, ...page },
  });
}

/**
 * 可新增订单发运行查询
 * @async
 * @function queryDetailCreateList
 * @param {!number} organizationId - 组织ID
 * @param {!number} asnHeaderId - 送货单主键
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @returns {object} fetch Promise
 */
export async function queryDetailCreateList(poHeaderId, params) {
  const page = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line/add`, {
    query: {
      poHeaderId,
      ...params,
      ...page,
    },
  });
}

/**
 * 订单行新增
 * @async
 * @function addDetailLines
 * @param {!number} organizationId - 组织ID
 * @param {!number} poHeaderId - 送货单主键
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function addDetailLines(poHeaderId, data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line/add`, {
    method: 'POST',
    query: {
      poHeaderId,
    },
    body: data,
  });
}

/**
 * 订单行删除
 * @async
 * @function deleteDetailLines
 * @param {!number} organizationId - 组织ID
 * @param {!number} poHeaderId - 送货单主键
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteDetailLines(poHeaderId, data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${poHeaderId}/lines`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 订单行删除---远程
 * @async
 * @function deleteDetailLines
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteLineRemote(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/delete`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 采购订单头明细查询
 * @async
 * @function queryDetailHeader
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailHeader(params) {
  const { customizeUnitCode, poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`, {
    method: 'GET',
    query: {
      camp: 1,
      poEntryPoint: 'PO_MAINTAIN_DETAIL',
      customizeUnitCode,
      ...params,
    },
  });
}

/**
 * 采购订单行明细查询
 * @async
 * @function queryDetailList
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailList(params) {
  const query = { ...filterNullValueObject(parseParameters(params)), camp: 2, sortType: 0 };
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${query.poHeaderId}/detail`, {
    method: 'GET',
    query,
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
export async function saveDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/maintain`, {
    method: 'PUT',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
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
 * 订单保存
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function newSave(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/by-pr/maintain`, {
    method: 'PUT',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
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
export async function newSaveDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/manually-create-po-header`, {
    method: 'POST',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
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
export async function submitValidate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/by-pr/validate`, {
    method: 'POST',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
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
export async function submitDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/submit`, {
    method: 'POST',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
  });
}

/**
 * 查询整单引用列表
 * @export
 * @param {Object} params 查询条件
 */
export async function fetchWholeQuoteList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-header`, {
    method: 'GET',
    query: parseParameters(params),
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
export async function deleteSheetDelivery(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 按行引用删除
 * @async
 * @function deleteDelivery
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteLineDelivery(poLineList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line`, {
    method: 'DELETE',
    body: poLineList,
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
 * 参考价
 * @export
 * @param {Object} params
 */
export async function priceList({ page = {}, ...params }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/new-reference-price`, {
    method: 'PUT',
    body: params,
    query: parseParameters({ page }),
  });
}

/**
 * 参考价接口
 * @export
 * @param {Object} params
 */
export async function linePriceList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/reference-price`, {
    method: 'GET',
    query: parseParameters(params),
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
 * 校验新增数据正确性
 * @export
 * @param {Object} params
 */
export async function appendValidate(params) {
  const { poHeaderId, poLineDetailDTOList } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/append-validate`, {
    method: 'POST',
    body: poLineDetailDTOList,
  });
}

/**
 * 查询配置中心,公司是否显示
 * @export
 * @param {Object} params
 */
export async function queryCompanyId() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-merge-rule`, {
    method: 'GET',
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
 * 查询手工创建订单初始化数据
 */
export async function fetchPageOrder(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/manual-create-order`, {
    method: 'GET',
    query: {
      camp: 1,
      customizeUnitCode,
    },
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
 * 查询TAB
 */
export async function fetchDetailTable(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/creating/po/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询订单可更新价格库的行信息
 */
export async function fetchPriceUpdateList(params) {
  const { poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/price-update-list`, {
    method: 'GET',
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
 * 根据价格库更新当前订单所有行的价格
 */
export async function priceUpdate(params) {
  const { poHeaderId, query = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/price-update`, {
    method: 'PUT',
    query,
  });
}

export function fetchList(payload) {
  const param = filterNullValueObject(parseParameters(payload));
  // return request(`${SRM_SPUC}/v1/${organizationId}/po-header/source-result`, {
  return request(`${SRM_SSRC}/v1/${organizationId}/source/result/external-call/result-list`, {
    method: 'GET',
    query: param,
  });
}

export function createOrder(sourceResultDTOList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/rfx-to-order`, {
    method: 'POST',
    body: sourceResultDTOList,
  });
}

export function createCombineOrder(sourceResultDTOList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/rfx-to-order/new`, {
    method: 'POST',
    body: sourceResultDTOList,
  });
}

//  showLadderInquiry
export async function showLadderInquiry(params) {
  const { sourceLineItemId } = params;
  return request(`/ssrc/v1/${organizationId}/rfx/${sourceLineItemId}/ladder-inquiry`, {
    method: 'GET',
  });
}

/**
 * 查询相关的poItemBom
 * @async
 * @function queryPoItemBOM
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.poHeaderId - 采购订单头ID
 * @param {String} params.poLineId - 采购订行ID
 * @param {String} params.poLineLocationId - 采购订行ID
 * @returns {object} fetch Promise
 */
export async function queryPoItemBOM(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    query,
  });
}

// 新bom数据查询
export async function newQueryPoItemBOM(params) {
  const { page, size, ...others } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms/pending`, {
    method: 'POST',
    query: { page, size },
    body: others,
  });
}

// BOM保存
export async function savePoItemBOM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms/maintain`, {
    method: 'PUT',
    body: params,
  });
}

// BOM删除
export async function deletePoItemBOM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms/delete`, {
    method: 'DELETE',
    body: params,
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

// 检验采购组织采购员是否清空
export async function validataOrg(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/ou-org`, {
    method: 'GET',
    query: params,
  });
}

// 查询默认值集视图
export async function fetchDefaultValueView(params) {
  return request(`/hpfm/v1/lovs/value/page`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 修改物料编码保存数据
 */
export async function saveLibData(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/bettle/price-item`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 创建uuid
 */
export async function createUuid() {
  return request(`/hfle/v1/${organizationId}/files/uuid`, {
    method: 'POST',
  });
}

/**
 * 暂挂按钮
 */
export async function pendingFlag(data) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source/result/external-manage/pending/no-saga`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 寻源取消暂挂
 */
export async function pendingCancelFlag(data) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source/result/external-manage/cancel-pending/no-saga`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/*
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

/*
 * 订单列表批量提交添加弱校验
 */
export async function batchSubmitWarn(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch-submit-warn`, {
    method: 'POST',
    body: params,
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

// 个性化接口
export async function getCustomizeData(params) {
  return request(`${SRM_HPFM}/v1/${organizationId}/ui-customize`, {
    method: 'POST',
    body: params,
  });
}

// 订单提交预算校验
export async function oldBudgetVerification(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-budget-check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询是否开启双单位配置
 * @async
 * @function queryDoubleUomConfig
 * @returns {object} fetch Promise 0不开启双单位，1上下游和订单都开启，2仅订单开启
 */
export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询是否开启双单位配置
 * @async
 * @function calculateDoubleUom
 * @returns {object}
 */
export async function calculateDoubleUom(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 采购申请审批(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetRfxPrepare(params) {
  const tableCode = 'sprm_old_ui_config';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/page/sprm-old-ui-config`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 寻源新老地址跳转
 * */
export async function getSourceUrlConfig(params) {
  const { sourceHeaderId } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/simple/${sourceHeaderId}`, {
    method: 'GET',
    //  body: params,
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
 * 新增申请转订单行
 * */
export async function prToLine({ poHeaderId, data, query }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/by-pr/pr-to-line`, {
    method: 'POST',
    body: data,
    query,
  });
}

// 查询公司信息,带出业务实体/采购组织
export async function fetchAutoGetCompany(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/purchase-organization/query`, {
    method: 'GET',
    query: params,
  });
}

// 采购组织/采购员 关联带出
export async function fetchAutoGetAgent(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/purchase-organization/agent`, {
    method: 'GET',
    query: params,
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
