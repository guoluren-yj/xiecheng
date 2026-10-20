
import { message } from 'choerodon-ui';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { getEnvConfig } from "hzero-front/lib/utils/iocUtils";
import request from 'hzero-front/lib/utils/request';
import intl from 'hzero-front/lib/utils/intl';
import moment from 'moment';
import {
  removeUploadFile,
} from 'services/api';
import { getAccessToken, getCurrentOrganizationId, getResponse, isTenantRoleLevel } from "hzero-front/lib/utils/utils";
import attachmentConfig from "../Attachment";
import { getAttachmentUrlWithToken } from '../../utils/utils';

const fetchList = ({ query, body, attachmentUrls, isPublic }) => {
  const { HZERO_FILE } = getEnvConfig() as any;
  const action = `${HZERO_FILE}/v1/${isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''}files`;
  return isPublic
  ? request(`${HZERO_FILE}/v1/pub/files/by-file-urls`, { method: "POST", body: attachmentUrls || [], query })
  : request(
      action, {
      method: "POST",
      body: attachmentUrls || [],
      query,
    }).then((response) => {
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
};

interface ConfigType {
  defaultFileKey,
  defaultFileSize,
  defaultChunkSize,
  defaultChunkThreads,
  action,
  fetchList,
  fetchFileSize,
  batchFetchCount,
  onRemove,
  onOrderChange,
  getAttachmentUUID,
  getDownloadUrl,
  getTemplateDownloadUrl,
  getDownloadAllUrl,
  getPreviewUrl,
  onBeforeUpload,
  onBeforeUploadChunk,
  onUploadSuccess,
  onUploadError,
  renderIcon,
  renderHistory,
}
const config = {
  ...attachmentConfig as ConfigType,
  action: ({ attachment, chunk, bucketName, bucketDirectory, storageCode, isPublic }) => {
    const { HZERO_FILE, HZERO_HFLE, CHUNK_UPLOAD_ENABLE } = getEnvConfig() as any;
    const accessToken = getAccessToken();
    const headers: any = {
      'Access-Control-Allow-Origin': '*',
      processData: false, // 不会将 data 参数序列化字符串
      type: 'FORM',
      responseType: 'text',
    };
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const data: any = {};
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

    const action = `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}` : ""}/files/multipart`;
    return {
      url:
        chunk && CHUNK_UPLOAD_ENABLE === 'true'
          ? `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/upload`
          : action,
      headers,
      data,
      onUploadProgress: undefined as any,
    };
  },
  fetchList,
  // fetchFileSize: (props) => fetchRemoteFileSizeLimit(props.bucketName, props.bucketDirectory),
  batchFetchCount: undefined,
  onRemove({ attachment, crossTenant, bucketName, bucketDirectory, storageCode, isPublic }) {
    const { fileId, _token, fileUrl } = attachment;
    const { HZERO_FILE } = getEnvConfig() as any;
    let promise;
    if (crossTenant) {
      promise = request(`${HZERO_FILE}/v1/$${isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''}files/delete-by-uuidurl/token`, {
        method: 'POST',
        body: [{ fileId, _token }],
      });
    } else {
      promise = removeUploadFile({
        tenantId: getCurrentOrganizationId(),
        bucketName,
        urls: [fileUrl],
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
  onOrderChange: undefined,
  getAttachmentUUID: undefined,
  getDownloadUrl({ attachment, bucketName, bucketDirectory, storageCode }) {
    const { _token, fileUrl } = attachment;
    getAttachmentUrlWithToken(
      fileUrl,
      bucketName,
      getCurrentOrganizationId(),
      bucketDirectory,
      storageCode,
      _token
    );
  },
  getDownloadAllUrl: undefined,
  // getPreviewUrl,
  // onBeforeUpload,
  // onBeforeUploadChunk,
  onUploadSuccess(resp, attachment, { useChunk, bucketName, storageCode, bucketDirectory, isPublic }): PromiseLike<string | void> {
    const { CHUNK_UPLOAD_ENABLE, HZERO_HFLE } = getEnvConfig() as any;
    if (useChunk && CHUNK_UPLOAD_ENABLE === 'true') {
      return request(`${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/combine-with-info`, {
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
        return response.fileUrl;
      });
    } else if (resp) {
      attachment.load({
        url: resp,
      });
      return Promise.resolve(resp);
    }
    message.success($l('Upload', 'upload_success'), undefined, undefined, 'top');
    return Promise.resolve();
  },
  // onUploadError() {},
  // renderIcon(attachment, listType) {},
  // renderHistory({ attachment }) {},
};

export default config;