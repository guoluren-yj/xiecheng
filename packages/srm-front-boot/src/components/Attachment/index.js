import React from 'react';
import moment from 'moment';
import qs from 'query-string';
import axios from 'axios';
import SparkMD5 from 'spark-md5';
import { message, notification } from 'choerodon-ui';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { AttachmentPreviewTarget } from 'choerodon-ui/dataset/data-set/enum';
import { isString } from 'lodash';
import { getConfig } from 'hzero-boot';
import intl from 'utils/intl';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getRequestId,
  getResponse,
  isTenantRoleLevel,
  getSRMAccessCode,
} from 'utils/utils';
import { getMenuId } from 'utils/menuTab';
import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';
import { downloadFileByAxios, queryFileList, queryUUID } from 'services/api';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import {
  getAttachmentUrlWithToken,
  fetchRemoteFileSizeLimit,
  removeFile,
  newUrlPreviewList,
  imgs,
  supportPreviewList,
} from '../../utils/utils';
import AttachmentHistory from './AttachmentHistory';

const {
  CHUNK_UPLOAD_ENABLE, // 环境变量，用于控制是否允许开启断点续传
} = getEnvConfig();

function download(url, useV1 = false) {
  const query = url.split('?');
  const paramStr = query[1];
  const queryParams = paramStr
    ? Object.entries(qs.parse(paramStr)).reduce(
        (list, [name, value]) => (name === 'access_token' ? list : list.concat({ name, value })),
        []
      )
    : [];
  return downloadFileByAxios({
    requestUrl: query[0],
    queryParams,
    method: 'GET',
    version: useV1 ? 'v1' : 'v2',
  });
}

const downloadAxios = axios.create({
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json;',
  },
  withCredentials: true,
});
downloadAxios.interceptors.request.use(
  function (config) {
    // 添加额外的请求头
    const patchRequestHeaderConfig = getConfig('patchRequestHeader');
    let patchRequestHeader;
    if (patchRequestHeaderConfig) {
      if (typeof patchRequestHeaderConfig === 'function') {
        patchRequestHeader = patchRequestHeaderConfig();
      } else {
        patchRequestHeader = patchRequestHeaderConfig;
      }
    }
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: 'bearer '.concat(getAccessToken()),
        'H-Request-Id': ''.concat(getRequestId()),
        'H-Menu-Id': ''.concat(getMenuId()),
        ...patchRequestHeader,
      },
    };
  },
  function (err) {
    return Promise.reject(err);
  }
);
downloadAxios.interceptors.response.use(
  function (res) {
    const { status, data } = res;
    if (status === 204 || status === 200) {
      return res;
    }

    if (data && data.failed) {
      throw res;
    } else {
      return res;
    }
  },
  function (err) {
    throw err;
  }
);

function downloadAll(url) {
  return downloadAxios.get(url).then((resp) => {
    const { data, headers } = resp;
    const contentType = headers['content-type'];
    let href;
    let isBlob;
    let fileName = '';
    try {
      if (data.failed) {
        notification.error({ message: data.message });
      }
    } catch {
      // Nothing to do;
    }
    if (
      contentType.toLowerCase().startsWith('text/plain') ||
      (isString(data) && data.startsWith('http'))
    ) {
      href = data;
    } else {
      const disposition = headers['content-disposition'];
      fileName = disposition
        ? disposition.match(/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/)[1]
        : undefined;

      if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
        fileName = fileName.substring(1, fileName.length - 1);
      }

      if (!fileName) {
        throw Error('cannot get fileName!');
      } // 将二进制流转为blob
      const blob = new Blob([data], {
        type: 'application/octet-stream',
      });

      const { navigator } = window;
      if (navigator && typeof navigator.msSaveBlob !== 'undefined') {
        navigator.msSaveBlob(blob, decodeURI(fileName));
        return;
      } else {
        // 创建新的URL并指向File对象或者Blob对象的地址
        href = window.URL.createObjectURL(blob); // 创建a标签，用于跳转至下载链接
        isBlob = true;
      }
    }
    if (href) {
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = href;
      tempLink.setAttribute('download', decodeURI(fileName)); // 兼容：某些浏览器不支持HTML5的download属性

      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      } // 挂载a标签

      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink); // 释放blob URL地址
      if (isBlob) {
        window.URL.revokeObjectURL(href);
      }
    }
  });
}

function fetchList({
  attachmentUUID,
  bucketName,
  bucketDirectory,
  isPublic,
  // c7n-ui下，默认不传该属性，视为false
  isAttachmentsInControl = false,
  query,
  body,
}) {
  const { HZERO_FILE } = getEnvConfig();
  const v2Options = {};
  if (!isAttachmentsInControl) {
    v2Options.version = '/v2';
    v2Options.method = 'POST';
    v2Options.body = body;
  }
  return (isPublic
    ? request(`${HZERO_FILE}/v1/pub/files/${attachmentUUID}/file`, { method: 'GET', query, body })
    : queryFileList(
        {
          tenantId: getCurrentOrganizationId(),
          bucketName,
          directory: bucketDirectory,
          attachmentUUID,
          ...(query || {}),
        },
        v2Options
      )
  ).then((response) => {
    if (getResponse(response)) {
      return response.map((file) => ({
        ...file,
        uid: file.fileId,
        name: file.fileName,
        size: file.fileSize,
        type: file.fileType || '',
        url: file.fileUrl,
        creationDate: moment(file.creationDate).toDate(),
        status: 'done',
      }));
    }
    throw new Error(response && response.message);
  });
}

const attachmentConfig = {
  defaultFileKey: 'file',
  defaultFileSize: 500 * 1024 * 1024,
  defaultChunkSize: 5 * 1024 * 1024,
  defaultChunkThreads: 3,
  previewTarget: AttachmentPreviewTarget._blank,
  enableChunk: CHUNK_UPLOAD_ENABLE === 'true',
  imageContainer: () => document.querySelector('#root'),
  action: ({ attachment, chunk, bucketName, bucketDirectory, attachmentUUID }) => {
    const { HZERO_FILE, HZERO_HFLE } = getEnvConfig();
    const accessToken = getAccessToken();
    const headers = {
      'Access-Control-Allow-Origin': '*',
      processData: false, // 不会将 data 参数序列化字符串
      // method: 'POST',
      type: 'FORM',
      responseType: 'text',
    };
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const data = {
      attachmentUUID,
    };
    if (bucketName) {
      data.bucketName = bucketName;
    }
    if (bucketDirectory) {
      data.directory = bucketDirectory;
    }
    if (chunk && CHUNK_UPLOAD_ENABLE === 'true') {
      data.guid = attachment.md5;
      data.fileMd5 = attachment.md5;
      data.fileName = encodeURIComponent(attachment.name);
      data.contentType = attachment.type;
      data.chunk = chunk.index;
    }

    return {
      url:
        chunk && CHUNK_UPLOAD_ENABLE === 'true'
          ? `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/upload`
          : isTenantRoleLevel()
          ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/attachment/multipart-with-info`
          : `${HZERO_FILE}/v1/files/attachment/multipart-with-info`,
      headers,
      data,
    };
  },
  fetchList,
  fetchFileSize: (props) =>
    fetchRemoteFileSizeLimit(props.bucketName, props.bucketDirectory, props.useChunk),
  batchFetchCount(attachmentUUIDs, { isPublic, items } = {}) {
    const { HZERO_FILE } = getEnvConfig();
    return request(
      isPublic
        ? `${HZERO_FILE}/v1/files/count-batch`
        : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/count-batch`,
      {
        method: 'POST',
        body: items.map(({ attachmentUUID, ...rest }) => ({ ...rest, uuid: attachmentUUID })),
      }
    );
  },
  onRemove({
    attachment,
    attachmentUUID,
    bucketName,
    bucketDirectory,
    crossTenant,
    // c7n-ui下，默认不传该属性，视为false
    isAttachmentsInControl = false,
  }) {
    let promise;
    if (crossTenant && attachment.fileId) {
      const { fileId, _token } = attachment;
      const tenantId = getCurrentOrganizationId();
      const version = isAttachmentsInControl ? '/v1' : '/v2';
      const postfix = isAttachmentsInControl
        ? '/files/delete-by-uuidurl/token'
        : '/files/delete-by-uuidurl';
      const reqUrl = isTenantRoleLevel()
        ? `${getEnvConfig().HZERO_FILE}${version}/${tenantId}${postfix}`
        : `${getEnvConfig().HZERO_FILE}${version}${postfix}`;
      promise = request(reqUrl, {
        method: 'POST',
        body: [{ fileId, _token, _deleteToken: attachment._deleteToken, fileUrl: attachment.url }],
      });
    } else {
      promise = removeFile({
        tenantId: getCurrentOrganizationId(),
        bucketName,
        directory: bucketDirectory,
        attachmentUUID,
        urls: isAttachmentsInControl
          ? [attachment.url]
          : [{ fileUrl: attachment.url, _deleteToken: attachment._deleteToken }],
        isAttachmentsInControl,
      });
    }
    return promise.then((res) => {
      if (getResponse(res)) {
        message.success(intl.get('hzero.common.notification.success'), undefined, undefined, 'top');
        return true;
      }
      return false;
    });
  },
  onOrderChange({ attachments, bucketName, bucketDirectory, attachmentUUID }) {
    const { HZERO_FILE } = getEnvConfig();
    request(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/${attachmentUUID}/file/order`, {
      method: 'POST',
      body: attachments.map((attachment) => attachment.uid),
      query: {
        bucketName,
        directory: bucketDirectory,
      },
    });
  },
  getAttachmentUUID() {
    return queryUUID({ tenantId: getCurrentOrganizationId() }).then((result) =>
      result ? result.content : undefined
    );
  },
  getDownloadUrl({
    attachment,
    bucketName,
    bucketDirectory,
    storageCode,
    attachmentUUID,
    isPublic,
    // c7n-ui下，默认不传该属性，视为false
    isAttachmentsInControl = false,
    downloadData,
  }) {
    const { HZERO_FILE } = getEnvConfig();
    if (isPublic) {
      return `${HZERO_FILE}/v1/pub/files/download?url=${encodeURIComponent(attachment.url)}`;
    }
    let businessParams = {};
    if (downloadData) {
      businessParams = downloadData;
      if (typeof businessParams === 'function') {
        businessParams = businessParams();
      }
      if (businessParams.enableSceneExtend) {
        businessParams.sceneAttachmentUuid = attachmentUUID;
      }
    }
    return () => {
      const url = getAttachmentUrlWithToken(
        attachment.url,
        bucketName,
        getCurrentOrganizationId(),
        bucketDirectory,
        storageCode,
        isAttachmentsInControl ? attachment._fileToken : attachment._downloadToken,
        undefined,
        isAttachmentsInControl,
        { businessParams }
      );
      return download(url, isAttachmentsInControl);
    };
  },
  getTemplateDownloadUrl({
    attachmentUUID,
    bucketName,
    bucketDirectory,
    storageCode,
    isPublic,
    // c7n-ui下，默认不传该属性，视为false
    isAttachmentsInControl = false,
  }) {
    return fetchList({
      attachmentUUID,
      bucketName,
      bucketDirectory,
      storageCode,
      isPublic,
    }).then((list) => {
      if (list && list.length > 0) {
        return list.map((file) => {
          return {
            key: file.fileUrl,
            fileName: file.fileName,
            download: () =>
              download(
                getAttachmentUrlWithToken(
                  file.url,
                  bucketName,
                  getCurrentOrganizationId(),
                  bucketDirectory,
                  storageCode,
                  isAttachmentsInControl ? file._fileToken : file._downloadToken,
                  undefined,
                  isAttachmentsInControl
                ),
                isAttachmentsInControl
              ),
          };
        });
      }
      return [];
    });
  },
  getDownloadAllUrl({ bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic }) {
    const accessToken = getAccessToken();
    if (!isPublic || accessToken) {
      const { HZERO_FILE } = getEnvConfig();
      const params = qs.stringify({
        attachmentUUID,
        bucketName,
        storageCode,
        directory: bucketDirectory,
      });
      const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download/compress?${params}`;
      return () => downloadAll(url);
    }
  },
  getPreviewUrl({
    attachment,
    bucketName,
    bucketDirectory,
    storageCode,
    attachmentUUID,
    isPublic,
    // c7n-ui下，默认不传该属性，视为false
    isAttachmentsInControl = false,
    previewData,
  }) {
    const accessToken = getAccessToken();
    if (!isPublic || accessToken) {
      const { ext, type, url: _url, _fileToken, _previewToken } = attachment;
      const tenantId = getCurrentOrganizationId();
      let businessParams = {};
      if (previewData) {
        businessParams = previewData;
        if (typeof businessParams === 'function') {
          businessParams = businessParams();
        }
        if (businessParams.enableSceneExtend) {
          businessParams.sceneAttachmentUuid = attachmentUUID;
        }
      }
      // tiff格式图片不支持预览
      if ((type.startsWith('image') && !type.includes('image/tif')) || imgs.includes(ext)) {
        const callback = () => {
          return getSRMAccessCode({ expires: 15 }).then((_sac) => {
            const url = getAttachmentUrlWithToken(
              _url,
              bucketName,
              tenantId,
              bucketDirectory,
              storageCode,
              isAttachmentsInControl ? attachment._fileToken : attachment._downloadToken,
              undefined,
              isAttachmentsInControl,
              { _previewToken, isImg: true, businessParams }
            );
            return url.replace(/access_token=[^\&]+(&)?/, `_sac=${_sac}$1`);
          });
        };
        callback.isPicture = true;
        return callback;
      }
      if (supportPreviewList.includes(ext)) {
        return () =>
          getSRMAccessCode({ expires: 15 }).then((_sac) => {
            const { HZERO_HFLE, HZERO_FILE } = getEnvConfig();
            const PREFIX = window.location.hostname === 'localhost' ? HZERO_FILE : HZERO_HFLE;
            const version = isAttachmentsInControl ? '/v1' : '/v2';
            let postfix = newUrlPreviewList.includes(ext) ? '/preview/pro' : '/preview';
            if (isAttachmentsInControl) {
              postfix = newUrlPreviewList.includes(ext)
                ? '/file/preview-with-token'
                : '/file-preview-with-token';
            }
            // 暂不考虑未登录状态预览附件的场景，因为此前版本似从未支持过，其它附件组件同理
            const prevewUrl = isTenantRoleLevel()
              ? `${PREFIX}${version}/${tenantId}${postfix}`
              : `${PREFIX}${version}${postfix}`;
            const params = qs.stringify(
              filterNullValueObject({
                url: _url,
                bucketName,
                storageCode,
                directory: bucketDirectory,
                _sac,
                _fileToken: isAttachmentsInControl ? attachment._fileToken : undefined,
                _previewToken: isAttachmentsInControl ? undefined : attachment._previewToken,
                ...businessParams,
              })
            );
            return `${prevewUrl}?${params}`;
          });
      }
    }
  },
  onBeforeUpload(attachment, attachments, { useChunk }) {
    if (useChunk && CHUNK_UPLOAD_ENABLE === 'true') {
      const { originFileObj } = attachment;
      if (originFileObj) {
        return new Promise((resolve, reject) => {
          const sparkArrayBuffer = new SparkMD5.ArrayBuffer();
          const fileReader = new FileReader();
          const start = 0;
          const end = Math.min(attachment.size, 10 * 1024 * 1024);

          fileReader.onload = (e) => {
            sparkArrayBuffer.append(e.target.result);
          };

          fileReader.onerror = reject;

          fileReader.onloadend = () => {
            fileReader.onloadend = null;
            fileReader.onload = null;

            setTimeout(() => {
              const fileContentMd5 = sparkArrayBuffer.end();
              // 使用文件名+文件内容的方式加密，防止两个文件名不同但文件内容相同的文件上传失败
              const spark = new SparkMD5();
              spark.append(attachment.name);
              spark.append(fileContentMd5);
              const fileMd5 = spark.end();
              attachment.md5 = fileMd5;
              resolve();
            }, 50);
          };

          fileReader.readAsArrayBuffer(originFileObj.slice(start, end));
        }).catch(() => false);
      }
    }
  },
  onBeforeUploadChunk({ chunk, attachment, bucketName, bucketDirectory, storageCode }) {
    const { HZERO_HFLE } = getEnvConfig();
    return request(`${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/check`, {
      method: 'POST',
      query: {
        guid: attachment.md5,
        chunk: chunk.index,
        bucketName,
        storageCode,
        directory: bucketDirectory,
      },
    }).then((response) => !response);
  },
  onUploadSuccess(resp, attachment, { useChunk, bucketName, storageCode, bucketDirectory }) {
    if (useChunk && CHUNK_UPLOAD_ENABLE === 'true') {
      const { HZERO_HFLE } = getEnvConfig();
      request(`${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/combine-with-info`, {
        method: 'POST',
        query: {
          guid: attachment.md5,
          bucketName,
          storageCode,
          directory: bucketDirectory,
          attachmentUUID: attachment.attachmentUUID,
          fileName: encodeURIComponent(attachment.name),
          fileSize: attachment.size,
          contentType: attachment.type,
        },
      }).then((response) => {
        // 异常结果直接返回，不处理
        if (!response || !getResponse(response)) return;
        attachment.load({
          ...response,
          uid: response.fileId,
          name: response.fileName,
          size: response.fileSize,
          type: response.fileType || '',
          url: response.fileUrl,
          creationDate: moment(response.creationDate).toDate(),
        });
      });
    } else if (resp) {
      attachment.load({
        ...resp,
        uid: resp.fileId,
        name: resp.fileName,
        size: resp.fileSize,
        type: resp.fileType || '',
        url: resp.fileUrl,
        creationDate: moment(resp.creationDate).toDate(),
      });
    }
    message.success($l('Upload', 'upload_success'), undefined, undefined, 'top');
  },
  onUploadError() {
    message.error($l('Upload', 'upload_failure'), undefined, undefined, 'top');
  },
  renderIcon(attachment, listType) {
    if (listType === 'text') {
      const { ext, type } = attachment;
      if (type.startsWith('image') || imgs.includes(ext)) {
        return require('../../assets/attachment-icons/icon_img.svg');
      }
      if (type === 'application/pdf' || ext === 'pdf') {
        return require('../../assets/attachment-icons/icon_pdf.svg');
      }
      if (['xls', 'xlsx', 'xlsm', 'csv', 'xlt', 'et', 'ett'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_excel.svg');
      }
      if (['doc', 'docx', 'dot', 'wps', 'wpt'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_word.svg');
      }
      if (['ppt', 'pptx', 'pot', 'pps', 'dps', 'dpt'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_ppt.svg');
      }
      if (['txt', 'conf'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_txt.svg');
      }
      if (
        type.startsWith('video') ||
        type.startsWith('audio') ||
        [
          'mp3',
          'mid',
          'aif',
          'vqf',
          'wav',
          'mp4',
          'avi',
          'mpg',
          'dat',
          'rm',
          'asf',
          'mov',
          'qt',
          'navi',
        ].includes(ext)
      ) {
        return require('../../assets/attachment-icons/icon_mov.svg');
      }
      if (
        ['application/zip', 'application/x-zip-compressed', 'application/x-compressed'].includes(
          type
        ) ||
        ['rar', 'zip', 'tgz', '7z'].includes(ext)
      ) {
        return require('../../assets/attachment-icons/icon_zip.svg');
      }
      if (['java', 'JAVA', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'sql', 'yml'].includes(ext)) {
        return require('../../assets/attachment-icons/icon_code.svg');
      }
      return require('../../assets/attachment-icons/icon_unknow.svg');
    }
  },
  renderHistory({ attachment }) {
    return <AttachmentHistory attachment={attachment} />;
  },
  attachmentLimit({ attachment, isPublic, isAttachmentsInControl = false }) {
    // 对非正常状态的附件或isAttachmentsInControl，直接返回空对象，即使用UI默认逻辑
    if (isPublic || isAttachmentsInControl || !['success', 'done'].includes(attachment.status)) {
      return {};
    }
    return {
      preview: !!(attachment && attachment._previewToken),
      download: !!(attachment && attachment._downloadToken),
      remove: !!(attachment && attachment._deleteToken),
    };
  },
};

export default attachmentConfig;
