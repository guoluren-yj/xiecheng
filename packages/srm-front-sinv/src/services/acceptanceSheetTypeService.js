import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-type/list`, {
    method: 'GET',
    query,
  });
}

// 新建与保存接口
export async function updateType(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-type`, {
    method: 'POST',
    body: query,
  });
}

// uuid
export async function saveUuid(params) {
  const { acceptListTypeId, templateAttachmentUuid } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/ac-type/attachment-uuid?acceptListTypeId=${acceptListTypeId}&templateAttachmentUuid=${templateAttachmentUuid}`,
    {
      method: 'POST',
      // body: params,
    }
  );
}
