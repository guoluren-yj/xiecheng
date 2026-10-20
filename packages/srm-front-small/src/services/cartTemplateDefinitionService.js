import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { getTemplateStyle } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_MALLCART = '/smct';

export function unlockStatus(templateId) {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensiontemplates/unlock/${templateId}`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/unlock/${templateId}`,
    {
      method: 'POST',
    }
  );
}

export function publishStatus(templateId) {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensiontemplates/publish/${templateId}`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/publish/${templateId}`,
    {
      method: 'POST',
    }
  );
}

export function enabledServices(params) {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensiontemplates/enable`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/enable`,
    {
      method: 'POST',
      body: { ...params, templateStyle: getTemplateStyle() },
    }
  );
}

export function chnageIsOpen(params) {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/dimensiontemplates`
      : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates`,
    {
      method: 'PUT',
      body: { ...params, templateStyle: getTemplateStyle() },
    }
  );
}

export function fetchOperationRcord(templateCode) {
  return request(
    organizationId === 0
      ? `${SRM_MALLCART}/v1/template-historys`
      : `${SRM_MALLCART}/v1/${organizationId}/template-historys`,
    {
      method: 'GET',
      query: templateCode,
    }
  );
}

export const cloneTemplate = (params) => {
  return request(`${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/copy`, {
    method: 'POST',
    body: { ...params, templateStyle: getTemplateStyle() },
  });
};

export function queryChildNode(params) {
  return request(`${SRM_MALLCART}/v1/${organizationId}/template-units`, {
    method: 'GET',
    query: { ...params, templateStyle: getTemplateStyle() },
  });
}

export function changeNode(params) {
  return request(`${SRM_MALLCART}/v1/${organizationId}/template-units`, {
    method: 'POST',
    body: { ...params, templateStyle: getTemplateStyle() },
  });
}

export function fetchCommonConfig(){
  return request(`${SRM_MALLCART}/v1/${organizationId}/cart-common/common-config?tenantId=${organizationId}`, {
    method: 'GET',
  });
}

// 历史版本
export function fetchHistoryListService(params){
  return request(organizationId === 0 ? `${SRM_MALLCART}/v1/dimensiontemplates/history-list` : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/history-list`, {
    method: 'GET',
    query: params,
  });
}

// 启用禁用
export function enabledService(params) {
  return request(`${SRM_MALLCART}/v1/${organizationId}/dimensions/enabled`, {
    method: 'POST',
    body: params,
  });
}
