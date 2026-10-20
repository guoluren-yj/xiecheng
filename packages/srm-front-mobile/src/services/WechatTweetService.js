

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMBL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 上传附件
export async function uploadMedia(thirdPartyAccountId, file) {
  return request(`${SRM_SMBL}/v1/${organizationId}/wechat-templates/uploadMedia?thirdPartyAccountId=${thirdPartyAccountId}`, {
    method: 'post',
    body: file,
  });
}

// 创建模板
export async function saveTemplate(data) {
  return request(`${SRM_SMBL}/v1/${organizationId}/wechat-templates/create`, {
    body: JSON.stringify(data),
    method: 'post',
    headers: {
      "content-type": "application/json",
    },
  });
}

// 更新模板
export async function updateTemplate(data) {
  return request(`${SRM_SMBL}/v1/${organizationId}/wechat-templates/update`, {
    body: JSON.stringify(data),
    method: 'post',
    headers: {
      "content-type": "application/json",
    },
  });
}