import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function saveList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header`, {
    method: 'POST',
    body: query,
  });
}

export async function fetchHeader(params) {
  const { acceptListHeaderId, ...query } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/${acceptListHeaderId}`, {
    method: 'GET',
    query,
  });
}

export async function fetchDetailList(params) {
  const { acceptListHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-line/${acceptListHeaderId}/lines`, {
    method: 'GET',
    query,
  });
}

export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/list`, {
    method: 'GET',
    query,
  });
}

export async function itemCategories(params) {
  const { itemId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`/smdm/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query,
  });
}

export async function submit(params) {
  const { acceptListHeaderCreateDTOList, customizeUnitCode } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/submit`, {
    method: 'POST',
    body: acceptListHeaderCreateDTOList,
    query: {
      customizeUnitCode,
    },
  });
}

export async function handleUpload(params) {
  const { acceptListLineId, attachmentUuid } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/ac-line/attachment-uuid?acceptListLineId=${acceptListLineId}&attachmentUuid=${attachmentUuid}`,
    {
      method: 'POST',
    }
  );
}

// fetchFormData
export async function fetchFormData() {
  const query = { tenantId: organizationId };
  return request(`/hpfm/v1/lovs/data?lovCode=SPUC.ACCEPT_SOURCE_CODE`, {
    method: 'GET',
    query,
  });
}

// 更新
export async function updateList(params) {
  const { headerData, customizeUnitCode } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header`, {
    method: 'PUT',
    body: headerData,
    query: {
      customizeUnitCode,
    },
  });
}
// 整单删除
export async function deleteHeader(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindHeaderAttachmentUuid(query) {
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/attachment-uuid`, {
    method: 'POST',
    query,
  });
}

// 删除行
export async function deleteLine(params) {
  const { acceptListHeaderId, acceptListLineList } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-line/${acceptListHeaderId}/lines`, {
    method: 'DELETE',
    body: acceptListLineList,
  });
}

// fetchPurAgentLovData
export async function fetchPurAgentLovData(params) {
  const query = filterNullValueObject(parseParameters({ ...params, tenantId: organizationId }));
  return request(`${SRM_SPUC}/v1/${organizationId}/lovs/sql/data?lovCode=SPUC.ACCEPT_USER`, {
    method: 'GET',
    query,
  });
}

export async function fetchBasePcLineList(params) {
  const { sourceCode, ...other } = params;
  const url =
    sourceCode === 'ORDER'
      ? `${SRM_SPUC}/v1/${organizationId}/accept-line/selectList`
      : `${SRM_SPUC}/v1/${organizationId}/ac-header/purchase-contract/list`;
  return request(url, {
    method: 'GET',
    query: parseParameters(other),
  });
}
