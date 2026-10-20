import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const SRM_MALLCART = '/smct';

export function fetchDetail(params) {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensions/${params}`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensions/${params}`,
    {
      method: 'GET',
    }
  );
}

export const editDimension = (params) => {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensions`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensions`,
    {
      method: 'POST',
      body: params,
    }
  );
};

export const handleFieldParams = (params) => {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensions/delete-parameter`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensions/delete-parameter`,
    {
      method: 'DELETE',
      body: params,
    }
  );
};

export const deleteConfig = (params) => {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensions/delete-condition`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensions/delete-condition`,
    {
      method: 'DELETE',
      body: params,
    }
  );
};

// 查询lov视图
export const fetchLovViewInfo = (lovCode) => {
  return request(
    `${HZERO_PLATFORM}/v1${
      organizationId === 0 ? '' : `/${organizationId}`
    }/lov-view/info?viewCode=${lovCode}`,
    {
      method: 'GET',
    }
  );
};

// 删除默认dim行
export function deleteDefaultDimLine(params) {
  const url =
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensions/delete-default`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensions/delete-default`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

export function delteLovAssociatService(params) {
  const url = `${SRM_MALLCART}/v1${organizationId === 0 ? '/' : `/${organizationId}`}/dimensions/delete-field-relation`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

export function fetchUseCustDim(body){
  return request(`${SRM_MALLCART}/v1/${organizationId}/dimensions/product-dimension/create`, {
    method: 'POST',
    body,
  });
}

// 查询失效维度
export function fetchInvalidDim(params) {
  return request(`${SRM_MALLCART}/v1/${organizationId}/dimensions/data-check`, {
    method: 'GET',
    query: params,
  });
}

// 查询模板字段配置
export function fetchTemplateFieldConfig(params) {
  return request(`${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/rel-table/${params}`, {
    method: 'GET',
  });
}
