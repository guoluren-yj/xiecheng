import request from 'utils/request';
import {
  //   getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPRM } from '_utils/config';

// 新建预测模板
export async function saveFcstTemplate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/fcst-template-headers`, {
    method: 'POST',
    body: query,
  });
}

// 更新预测模板
export async function updateFcstTemplate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/fcst-template-headers`, {
    method: 'PUT',
    body: query,
  });
}

// 删除维度属性设置行
export async function deleteTemplateLines(params) {
  return request(`${SRM_SPRM}/v1/fcst-template-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除维度属性设置行
export async function deleteTemplateDimensionLines(params) {
  return request(`${SRM_SPRM}/v1/fcst-template-dimensions`, {
    method: 'DELETE',
    body: params,
  });
}

// 发布预测模板
export async function releaseFcstTemplate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/fcst-template-headers/release`, {
    method: 'POST',
    body: query,
  });
}

// 查看预测模板操作记录
export async function getOperation(params) {
  const { templateHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/fcst-template-actions/${templateHeaderId}`, {
    method: 'GET',
    query,
  });
}

// 列表发布预测模板
export async function releaseFcstTemplateList(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SPRM}/v1/fcst-template-headers/list/release`, {
    method: 'POST',
    body: query,
  });
}

// 列表解锁预测模板
export async function lockFcstTemplateList(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SPRM}/v1/fcst-template-headers/unlock`, {
    method: 'POST',
    body: query,
  });
}
