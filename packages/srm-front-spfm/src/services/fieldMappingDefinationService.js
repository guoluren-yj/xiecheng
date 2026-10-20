/**
 * financeInfoService - 企业注册-财务信息 - service
 * @date: 2018-7-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 删除头
 */
export async function deleteTemplateHeader(params) {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 行内编辑头启用/禁用状态
 */
export async function setTemplateHeaderEnabled(params) {
  return request(
    `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers/toggle-template`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function getEntityField(params) {
  return request(
    `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers/getEntityField`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 头行保存
 */
export async function saveTemplateHeaderAndLines(params) {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 头行保存
 */
export async function saveTemplateLines(params) {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-lines`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

/**
 * 自动填单保存前校验
 */
export async function checkTemplateLines(params) {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-lines/save-valid`, {
    method: 'POST',
    body: params,
  });
}

export async function queryAdaptorEntityStructures(code) {
  return request(
    `${SRM_ADAPTOR}/v1/adaptor-entity-structures/${organizationId}/field-source/${code}`,
    {
      method: 'GET',
    }
  );
}
