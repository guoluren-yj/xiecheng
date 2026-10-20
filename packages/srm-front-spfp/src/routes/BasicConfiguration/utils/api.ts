import request from 'utils/request';

import { prefix } from '../stores/indexDS';

// 单据定义-导入，导出url
export const BillFileUrls = {
  IMPORT: `${prefix}/base-document-definitions/import`,
  EXPORT: `${prefix}/base-document-definitions/export/json`,
};

// 维度映射-导入，导出url
export const ReflexFileUrls = {
  IMPORT: `${prefix}/base-dimension-definitions/import`,
  EXPORT: `${prefix}/base-dimension-definitions/export/json`,
};

// 适用维度-导入，导出url
export const ApplyFileUrls = {
  IMPORT: `${prefix}/base-dimension-configs/import`,
  EXPORT: `${prefix}/base-dimension-configs/export/json`,
};

// 场景配置-导入，导出url
export const SceneFileUrls = {
  IMPORT: `${prefix}/base-scenario-configs/import`,
  EXPORT: `${prefix}/base-scenario-configs/export/json`,
};

export async function handlePlagFormConfigApi()
{
  return request(`${prefix}/base-document-definitions/copy`, {
    method: 'POST',
  });
}

// 单据禁用
export async function handleBillEnable(body)
{
  return request(`${prefix}/base-document-definitions/update`, {
    method: 'PUT',
    body,
  });
}

// 维度映射禁用
export async function handleDimensionReflexEnable(body)
{
  return request(`${prefix}/base-dimension-definitions/update`, {
    method: 'PUT',
    body,
  });
}
// 维度适用，累计禁用
export async function handleDimensionEnable(body)
{
  return request(`${prefix}/base-dimension-configs/update`, {
    method: 'PUT',
    body,
  });
}

// 单据定义-导出
export async function exportBillApi()
{
  return request(BillFileUrls.EXPORT, {
    method: 'POST',
  });
}

// 维度映射-导出
export async function exportReflexApi()
{
  return request(ReflexFileUrls.EXPORT, {
    method: 'POST',
    // body,
  });
}

// 适用维度-导出
export async function exportApplyApi()
{
  return request(ApplyFileUrls.EXPORT, {
    method: 'POST',
    // body,
  });
}

// 场景配置-导出
export async function exportSceneApi(body)
{
  return request(SceneFileUrls.EXPORT, {
    method: 'POST',
    body,
  });
}

