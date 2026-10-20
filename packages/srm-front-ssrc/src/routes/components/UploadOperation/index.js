/**
 * Upload 组件上传前文件大小校验, beforeUpload
 *
 */

import intl from 'utils/intl';

// 文件上传前大小校验
export function validBeforeUploadFiles(files = {}) {
  const currentFileSize = files.size / (1024 * 1024) || null;
  const fileSize = 30;

  if (currentFileSize && currentFileSize > fileSize) {
    files.status = 'error'; // eslint-disable-line
    const res = {
      message: `${intl
        .get(`hzero.common.upload.error.size`, {
          fileSize,
        })
        .d(`上传文件大小不能超过: ${fileSize}`)}MB`,
    };
    files.response = res; // eslint-disable-line
    return false;
  } else {
    return true;
  }
}
