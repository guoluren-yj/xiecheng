/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-09-19 10:01:15
 * @FilePath: /srm-front-sslm/src/services/supplierDocumentListService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { HZERO_HFLE } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 供应商文档清单--批量下载附件
 * @param {*} params
 * @return {*}
 */
export async function batchDownloadAttachments(params) {
  return request(`${HZERO_HFLE}/v1/${organizationId}/files/download/compress/urls-and-uuids`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}
