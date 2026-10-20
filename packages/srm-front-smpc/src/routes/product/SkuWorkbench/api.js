import request from 'utils/request';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { SRM_MALL, SRM_SMPC, SRM_SAGM } from '_utils/config';

const SRM_SMEC = '/smec';

const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();
const resetParam = { introduction: undefined, introductionUrl: undefined };

/**
 * 商品批量上架
 */
export async function batchPutAway(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/shelve`, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

/**
 * 商品批量下架
 */
export async function batchUnShelve(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/unshelve`, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

/**
 * 商品批量弃用
 */
export async function batchDeprecate(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/batch-recycle-sku/1`, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

/**
 * 商品批量弃用
 */
export async function batchRecovery(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/batch-recycle-sku/0`, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

// 生效
export async function batchValid(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/valid-sku`, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

// 失效
export async function batchInvalid(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/invalid-sku`, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

// 批量/备注
export async function batchRemarks(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/pur-skus/update-shelf-remark`;
  return request(url, {
    method: 'POST',
    body: params.map((m) => ({ ...m, ...resetParam })),
  });
}

// 维护商品信息
export async function batchSkuInfo(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/batch-sku-update`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 复制商品
export async function copySkuInfo(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/sku-replication`, {
    method: 'POST',
    body: params,
  });
}

// 查询标签
export function fetchLabels(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/labels/label-list`, {
    method: 'GET',
    query: params,
  });
}

// 创建标签
export async function createLabel(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/labels`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 批量打标
export async function batchLabel(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/sku-labels`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// EC 批量编辑商品信息
export async function batchEditECInfo(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/skus/batch-ecsku-update`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 价格信息生效
export async function validSales(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/pur-skus/valid-price`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 价格信息失效
export async function inValidSales(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/pur-skus/invalid-price`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 价格信息删除
export async function deleteSales(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/sku-center-interface/delete-sku-sales-info`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

// 价格信息查询
export async function fetchSales(params) {
  const url = `${SRM_SMPC}/v1/${organizationId}/pur-skus/fetch-sales-info`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 编辑价格
export async function getPriceInfo(query) {
  return request(`/sagm/v1/${organizationId}/agreement-lines/bench-mark-price`, {
    method: 'GET',
    query,
    responseType: 'text',
  });
}

// 查询组织
export async function fetchUnits() {
  const url = `/sagm/v1/${organizationId}/pur-units/edit-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查询区域
export async function fetchRegions() {
  const url = `${SRM_MALL}/v1/${organizationId}/mall-regions/regional-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 校验组合
export function checkSkuCompose(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/check-spu-merge`, {
    method: 'POST',
    body: params,
  });
}

// 组合
export function getComposeSpu(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-merge`, {
    method: 'POST',
    body: params,
  });
}

// 基础数据下载
export function downloadBaseInfo() {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/base-info-export`, {
    method: 'GET',
    query: { userId },
    responseType: 'text',
  });
}

export function batchSubmit(spuIds) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/batch-spu-publish`, {
    method: 'POST',
    body: spuIds,
  });
}

// 获取商品单位税率币种配置
export function getSkuAttrConfig() {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/sku-attr-config`, {
    method: 'GET',
  });
}

// 批量上传图片
export function batchUploadImage(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/batch-insert`, {
    method: 'POST',
    body: params,
  });
}

// 创建领用商品
export function createReceiveSku(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/receive-skus/create`, {
    method: 'POST',
    body: params,
  });
}

// 领用商品批量弃用
export function receiveDeprecation(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/receive-skus/invalid`, {
    method: 'POST',
    body: params,
  });
}

// 领用商品批量恢复
export async function receiveStore(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/receive-skus/valid`, {
    method: 'POST',
    body: params,
  });
}

// 分配领用规则
export async function receiveSkuAssign(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/receive-skus/assign`, {
    method: 'POST',
    body: params,
  });
}

// 分批次查询操作记录
export function fetchPartOperateRecord(query) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-operation-records/list`, {
    method: 'GET',
    query,
  });
}

// 电商价格记录
export function fetchPriceRecord(query) {
  return request(`${SRM_SAGM}/v1/${organizationId}/price-changes`, {
    method: 'GET',
    query,
  });
}

// 历史版本记录
export function fetchHistoryVersionRecord(query) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-historys/list`, {
    method: 'GET',
    query,
  });
}

// 独立菜单商品发布历史版本记录
export function fetchOtherHistoryVersionRecord(query) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-historys`, {
    method: 'GET',
    query,
  });
}

// 电商商品供应商是否可以商品反馈
export function fetchIsFeedBack() {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/ec-feedback-check`, {
    method: 'GET',
  });
}

// 商品反馈保存
export function fetchSaveFeedBack(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/ec-feedback`, {
    method: 'POST',
    body: params,
  });
}

// 查询是否有还在执行中的进度
export function fetchExecutingInfo() {
  return request(`${SRM_SMEC}/v1/${organizationId}/sku-direct-operations/unconfirmed-info`, {
    method: 'GET',
  });
}

// 新建操作任务
export function saveTask(params) {
  return request(`${SRM_SMEC}/v1/${organizationId}/sku-direct-operations`, {
    method: 'POST',
    body: params,
  });
}

// 更新进度
export function fetchRefreshProgress(operationId) {
  return request(`${SRM_SMEC}/v1/${organizationId}/sku-direct-operations/refresh/${operationId}`, {
    method: 'GET',
  });
}

// 重置缓存任务
export function fetchClearTaskInfo(operationId) {
  return request(`${SRM_SMEC}/v1/${organizationId}/sku-direct-operations/confirm/${operationId}`, {
    method: 'POST',
  });
}

// 重新执行
export function fetchReExecute(operationId) {
  return request(
    `${SRM_SMEC}/v1/${organizationId}/sku-direct-operations/re-execute/${operationId}`,
    {
      method: 'POST',
    }
  );
}

// 确认新建套餐商品
export function fetchComposeCataSku(body) {
  return request(`${SRM_SMPC}/v1/${organizationId}/pur-skus/compose-cata-sku`, {
    method: 'POST',
    body,
  });
}
