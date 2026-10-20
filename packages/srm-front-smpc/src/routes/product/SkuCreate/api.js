import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { skuEditCode } from '../SkuWorkbench/customUnitCode';

const customizeUnitCode = skuEditCode.join(',');

const SRM_SMPC = '/smpc';
const organizationId = getCurrentOrganizationId();

export async function getPermission(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-edit-permission`, {
    method: 'GET',
    query: params,
  });
}

function getInfoHeaders(params) {
  return params && params.menuId ? { 'h-menu-id': params.menuId } : {};
}

// 查询商品明细
export async function fetchInfo(params) {
  const { spuId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-detail/${spuId}`, {
    method: 'GET',
    headers: getInfoHeaders(params),
    query: { ...params, supFlag: 0 },
  });
}

// 查询最新商品明细
export async function fetchInfoNew(params) {
  const { spuId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-detail-new/${spuId}`, {
    method: 'GET',
    headers: getInfoHeaders(params),
    query: { ...params, supFlag: 0 },
  });
}

// 查询审批拒绝商品明细
export async function fetchInfoReject(params) {
  const { skuTemporaryId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-temporary-detail/${skuTemporaryId}`, {
    method: 'GET',
    query: params,
    headers: getInfoHeaders(params),
  });
}

// 查询历史版本商品明细
export async function fetchInfoHistory(params) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/sku-historys/spu-detail/${params.skuHistoryId}`,
    {
      method: 'GET',
      query: params,
      headers: getInfoHeaders(params),
    }
  );
}

// 查询工作流审批商品明细
export async function fetchInfoWorkflowApprove(params) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/skus/spu-detail-approve/${params.skuTemporaryId}`,
    {
      method: 'GET',
      query: params,
      headers: getInfoHeaders(params),
    }
  );
}

// 已上架商品查看原版本数据(明细页直接查询，编辑页点击查看原版本查询)
export async function fetchInfoLastVersion(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-detail-price/${params.spuId}`, {
    method: 'GET',
    query: params,
    headers: getInfoHeaders(params),
  });
}

export async function fetchAttrValues(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/query-category-attr-value`, {
    method: 'GET',
    query: { ...(params || {}), enabledFlag: 1 },
  });
}

export async function fetchTypeSpecs(params) {
  const { categoryId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/query-category-attrs/${categoryId}`, {
    method: 'GET',
    query: { ...(params || {}), enabledFlag: 1 },
  });
}

// 保存
export async function save(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-creation`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 提交
export async function submit(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/spu-publish`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 提交领用商品
export function submitReceiveSku(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/receive-skus/save`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 根据目录带出平台分类
export function fetchCategory(catalogId) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/catalog-ref-categories/${catalogId}`
  );
}

// 查询或验证商品属性-币种单位税率
export function getMappingDataByAttr(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/attribute-mappings/queryUomCurrencyTax`, {
    method: 'POST',
    body: params,
  });
}

// 销售协议行状态变更
export function updateSaleLine(params) {
  const { suffix, saleLines } = params;
  return request(`/sagm/v1/${organizationId}/sale-agreement-lines/${suffix}`, {
    method: 'POST',
    body: saleLines,
  });
}

// 校验销售信息行重叠
export function validateSaleLine(params) {
  return request(`/smpc/v1/${organizationId}/skus/check-sku-sales-info`, {
    method: 'POST',
    body: params,
  });
}

// 通过物料获取物料分类
export function getItemCategory(itemId) {
  return request(`/smpc/v1/${organizationId}/catalog-mappings/item-category-assign/${itemId}`, {
    method: 'GET',
  });
}

// 查询默认供应商
export function getSupplier() {
  return request(`/smpc/v1/${organizationId}/sup-skus/supplier-info`, {
    method: 'GET',
  });
}

// 获取弹窗信息必输性
export function getSkuInfoValidation(params) {
  return request(`/smpc/v1/${organizationId}/skus/sku-filed`, {
    method: 'GET',
    query: params,
  });
}

// 领用库存批量编辑
export async function saveData(params, method) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-stocks`, {
    method,
    body: params,
  });
}

// spu销售规格必填校验 - 配置表
export function fetchSaleAttrCheck() {
  return request(`/smpc/v1/${organizationId}/skus/sale-attr-check`, {
    method: 'GET',
  });
}

// 业务规则： 【领用商品自动生成物料】
export function fetchReceiveToItem(query) {
  return request(`${SRM_SMPC}/v1/${organizationId}/receive-skus/auto-create-item-config`, {
    method: 'GET',
    query,
  });
}

// 配置表 【旧领用库存租户配置表】 true: 老租户
export function fetchUseOldReceive(query) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-stocks/exist-receive-rel-table`, {
    method: 'GET',
    query,
  });
}

// 查询领用库存信息
export function fetchReceiveStock(query) {
  return request(`/stck/v1/${organizationId}/stocks/list`, {
    method: 'GET',
    query,
  });
}

// 查询物料是否开启批次管理
export function fetchItemBatch(itemId) {
  return request(`/stck/v1/${organizationId}/stock-strategy-items/isBatchEnable/${itemId}`, {
    method: 'POST',
  });
}

// 保存库存信息
export function saveStockOperate(params, type) {
  return request(`/stck/v1/${organizationId}/stocks/batch-update-stock/${type}`, {
    method: 'PUT',
    body: params,
  });
}

// 保存库存信息
export function fetchSetWarning(params) {
  return request(`/stck/v1/${organizationId}/stocks/set-warning-stock`, {
    method: 'POST',
    body: params,
  });
}

// 领用平台分类默认值复制 - 990000001101 - 其他
export function fetchOtherCategory() {
  return request(`${SRM_SMPC}/v1/lovs/sql/data`, {
    method: 'GET',
    query: {
      lovCode: 'SMPC.PLAT_CATEGORY_THREE',
      tenantId: organizationId,
      categoryCode: '990000001101',
    },
  });
}

// 引用物料创建领用商品 - 物料返回的商品信息
export function fetchItemSkuInfo(itemId) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/receive-skus/query-receive-item-info/${itemId}`,
    {
      method: 'GET',
    }
  );
}

// 查询目录化赠品配置表
export function fetchGiftCheckService() {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/gift-sku-check`, {
    method: 'GET',
  });
}
