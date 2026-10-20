/*
 * @Date: 2021-10-26 17:05:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { Tag, Icon } from 'hzero-ui';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import {
  getAttachmentUrl,
  isTenantRoleLevel,
  getCurrentOrganizationId,
  getAccessToken,
} from 'utils/utils';

const bucketName = PRIVATE_BUCKET;
const organizationId = getCurrentOrganizationId();
const previewUrl = isTenantRoleLevel()
  ? `${HZERO_FILE}/v1/${organizationId}/file/preview`
  : `${HZERO_FILE}/v1/file/preview`;
const previewUrl2 = `${HZERO_FILE}/v1/${organizationId}/file-preview`;

// 附件下载
export function downLoadFile(params) {
  const { tenantId, attachmentUrl } = params;
  const url = getAttachmentUrl(attachmentUrl, bucketName, tenantId);
  return url;
}

// 支持附件预览的类型
export const supportPreviewList = [
  '.doc',
  '.docx',
  '.docm',
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  '.pdf',
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
  '.jpeg',
  '.jpg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
];

export const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  '.dot',
  '.dotx',
  '.dotm',
  '.odt',
  '.fodt',
  '.ott',
  '.rtf',
  '.txt',
  '.html',
  '.htm',
  '.mht',
  // ".pdf",
  '.djvu',
  '.fb2',
  '.epub',
  '.xps',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.xlt',
  '.xltx',
  '.xltm',
  '.ods',
  '.fods',
  '.ots',
  '.csv',
  '.pps',
  '.ppsx',
  '.ppsm',
  '.ppt',
  '.pptx',
  '.pptm',
  '.pot',
  '.potx',
  '.potm',
  '.odp',
  '.fodp',
  '.otp',
];

// 判断是否可预览
export function isReview(attachmentDesc) {
  const fileExtMatch = attachmentDesc.match(/(.[^.]+)$/);
  const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
  return supportPreviewList.includes(fileExt);
}

// 附件预览
export function reviewFile(attachmentDesc, attachmentUrl) {
  const fileExtMatch = attachmentDesc.match(/(.[^.]+)$/);
  const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
  const url = newUrlPreviewList.includes(fileExt) ? previewUrl : previewUrl2;
  window.open(
    `${url}?url=${encodeURIComponent(
      attachmentUrl
    )}&bucketName=${bucketName}&access_token=${getAccessToken()}`
  );
}

// 渲染附件文本
export function renderAttachmentText({ editable, fileCount, linkColor }) {
  return (
    <Fragment>
      {editable ? <Icon type="upload" /> : <Icon type="link" />}
      {editable
        ? intl.get('hzero.common.upload.text').d('上传附件')
        : intl.get('hzero.common.upload.view').d('查看附件')}
      <Tag
        color={linkColor}
        style={{ height: 'auto', lineHeight: '15px', marginLeft: 4, fontWeight: 400 }}
      >
        {fileCount || 0}
      </Tag>
    </Fragment>
  );
}
