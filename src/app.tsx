/* eslint-disable prefer-destructuring */
// import request from 'utils/request';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import { notification } from 'hzero-ui';

const supportPreviewList = [
  ".doc", ".docx", ".docm", ".dot", ".dotx", ".dotm",
  ".odt", ".fodt", ".ott", ".rtf", ".txt", ".html", ".htm", ".mht",
  ".pdf",
  ".djvu", ".fb2", ".epub", ".xps",
  ".xls", ".xlsx", ".xlsm", ".xlt", ".xltx", ".xltm", ".ods", ".fods", ".ots", ".csv",
  ".pps", ".ppsx", ".ppsm", ".ppt", ".pptx", ".pptm", ".pot", ".potx", ".potm", ".odp", ".fodp", ".otp",
];
const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  ".dot", ".dotx", ".dotm",
  ".odt", ".fodt", ".ott", ".rtf", ".txt", ".html", ".htm", ".mht",
  // ".pdf",
  ".djvu", ".fb2", ".epub", ".xps",
  ".xls", ".xlsx", ".xlsm", ".xlt", ".xltx", ".xltm", ".ods", ".fods", ".ots", ".csv",
  ".pps", ".ppsx", ".ppsm", ".ppt", ".pptx", ".pptm", ".pot", ".potx", ".potm", ".odp", ".fodp", ".otp",
];
/**
 *
 * 覆盖文件
 */
const onUploadPreview = file => {

  let { url = "" } = file;
  if (url.indexOf("?") === -1) return;
  const params: any = {};
  url = url.split("?")[1];
  url.split("&").forEach(param => {
    const [paramKey, paramValue] = param.split("=");
    params[paramKey] = paramValue;
  });
  const fileExtMatch = file.name.match(/(.[^.]+)$/);
  const fileExt = fileExtMatch ? fileExtMatch[1] : '';
  if (!supportPreviewList.includes(fileExt)) {
    notification.error({ message: intl.get("hzero.common.title.noPreview").d("该文件不支持预览"), description: "" });
    return;
  }
  let previewUrl;
  if (!newUrlPreviewList.includes(fileExt)) {
    previewUrl = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url`;
  } else if (isTenantRoleLevel()) {
    previewUrl = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file/preview`;
  } else {
    previewUrl = `${HZERO_FILE}/v1/file/preview`;
  }
  window.open(
    `${previewUrl}?url=${params.url}&bucketName=${params.bucketName}&access_token=${params.access_token}`
  );
};

export { onUploadPreview };
