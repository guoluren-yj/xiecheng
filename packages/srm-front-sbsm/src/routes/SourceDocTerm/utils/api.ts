import request from 'utils/request';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';


/**
 * @description:删除校验
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function validateDeleteLine(body) {
  return request(`${SRM_SBDM}/v1/${getCurrentOrganizationId()}/document-term-lines/validate-delete`, {
    method: 'POST',
    body,
  });
}

/**
 * @description:保存校验
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function validateSave(body) {
  return request(`${SRM_SBDM}/v1/${getCurrentOrganizationId()}/document-term-headers/validate-save-document-term`, {
    method: 'POST',
    body,
  });
}