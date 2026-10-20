import type { AxiosError, Canceler } from 'axios';
import axios from 'axios';
import type { DataSetContext } from 'choerodon-ui/dataset/data-set/DataSet';
import AttachmentFileChunk from 'choerodon-ui/dataset/data-set/AttachmentFileChunk';
import type AttachmentFile from 'choerodon-ui/dataset/data-set/AttachmentFile';
import { getConfig } from 'choerodon-ui/dataset';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { action as mobxAction, runInAction } from 'mobx';
import { PromiseQueue, LocaleContext } from 'choerodon-ui/dataset';
import { formatFileSize, formatTemplate } from 'choerodon-ui/dataset/formatter';
import attachmentConfig from "./attachmentConfig";

const AxiosCancelToken = axios.CancelToken;
/* istanbul ignore next */
class UploadError extends Error {
  readonly response: any;

  constructor(error: AxiosError) {
    super(error.message);
    this.name = error.name;
    this.stack = error.stack;
    this.response = error.response;
  }
}

export interface UploaderProps {
  /**
   *  可接受的上传文件类型
   */
  accept?: string[] | undefined;
  /**
   * 上传文件路径
   */
  action?: string | undefined;
  /**
   * 上传所需参数或者返回上传参数的方法
   */
  data?: object | Function | undefined;
  /**
   * 设置上传的请求头部
   */
  headers?: any | undefined;
  withCredentials?: boolean | undefined;
  fileKey?: string | undefined;
  fileSize?: number | undefined;
  chunkSize?: number | undefined;
  chunkThreads?: number | undefined;
  useChunk?: boolean | undefined;
  bucketName?: string | undefined;
  bucketDirectory?: string | undefined;
  storageCode?: string | undefined;
  isPublic?: boolean | undefined;
  beforeUpload?: ((attachment: AttachmentFile, attachments: AttachmentFile[], chunk?: AttachmentFileChunk) => boolean | undefined | PromiseLike<boolean | undefined>) | undefined;
  onUploadProgress?: ((percent: number, attachment: AttachmentFile) => void) | undefined;
  onUploadSuccess?: ((response: any, attachment: AttachmentFile, useChunk?: boolean) => void) | undefined;
  onUploadError?: ((error: AxiosError, response: any, attachment: AttachmentFile) => void) | undefined;
  saveUploadCancel?: (onCancel: Canceler) => void;
}

export default class Uploader {

  private props: UploaderProps;

  private context: DataSetContext;

  constructor(props: UploaderProps, context = { getConfig }) {
    this.props = props;
    this.context = context;
  }

  setProps(props: UploaderProps) {
    Object.assign(this.props, props);
  }

  async upload(attachment: AttachmentFile, attachments?: AttachmentFile[]): Promise<any> {
    if (attachment.status === 'success' || attachment.invalid) {
      return;
    }
    const { context, props } = this;
    const { chunkSize = attachmentConfig.defaultChunkSize } = props;
    const useChunk = props.useChunk && chunkSize > 0 && attachment.size > chunkSize;
    const result = await beforeUploadFile(props, context, attachment, attachments, useChunk);
    if (result === true) {
      try {
        const resp = await uploadFile(props, attachment, context, chunkSize, useChunk);
        let resp2;
        runInAction(() => {
          attachment.status = 'success';
          const { onUploadSuccess: handleUploadSuccess } = (attachmentConfig as typeof attachmentConfig);
          if (handleUploadSuccess) {
            resp2 = handleUploadSuccess(resp, attachment, {
              useChunk,
              bucketName: props.bucketName,
              bucketDirectory: props.bucketDirectory,
              storageCode: props.storageCode,
              isPublic: props.isPublic,
            });
          }
          const { onUploadSuccess } = props;
          if (onUploadSuccess) {
            onUploadSuccess(resp, attachment, useChunk);
          }
        });
        if (resp2) return await resp2;
        return resp;
      } catch (error) {
        if (error instanceof UploadError && attachment.status !== 'deleting') {
          const { response } = error;
          runInAction(() => {
            const { onUploadError } = props;
            const { onUploadError: handleUploadError } = attachmentConfig;
            attachment.status = 'error';
            // @ts-ignore
            attachment.error = error;
            // @ts-ignore
            const { message } = error;
            if (handleUploadError) {
              // @ts-ignore
              handleUploadError(error, attachment);
            }
            attachment.errorMessage = message || attachment.errorMessage;
            if (onUploadError) {
              // @ts-ignore
              onUploadError(error, response, attachment);
            }
          });
          return response;
        }
        throw error;
      }
    }
    return result;
  }
}



function cuteFile(attachment: AttachmentFile, chunkSize: number): AttachmentFileChunk[] {
  const { size, chunks } = attachment;
  if (!chunks) {
    const count = chunkSize ? Math.ceil(size / chunkSize) : 1;
    let start = 0;
    let index = 0;
    let len;
    const newChunks: AttachmentFileChunk[] = [];
    while (index < count) {
      len = Math.min(chunkSize, size - start);
      newChunks.push(new AttachmentFileChunk({
        file: attachment,
        total: size,
        start,
        end: chunkSize ? (start + len) : size,
        index,
      }));
      index += 1;
      start += len;
    }
    if (newChunks.length > 1) {
      attachment.chunks = newChunks;
    }
    return newChunks;
  }
  return chunks;
}
async function beforeUploadFile(
  props: UploaderProps,
  context: DataSetContext,
  attachment: AttachmentFile,
  attachments: AttachmentFile[] = [],
  useChunk?: boolean,
): Promise<boolean | undefined> {
  const { accept } = props;
  if (accept && !isAcceptFile(attachment, accept)) {
    runInAction(() => {
      attachment.status = 'error';
      attachment.invalid = true;
      attachment.errorMessage = $l('Attachment', 'file_type_mismatch', undefined, { types: accept.join(',') }) as string;
    });
    return;
  }
  let { fileSize = attachmentConfig.defaultFileSize } = props;
  const { fetchFileSize } = attachmentConfig;
  if (fetchFileSize) {
    fileSize = await fetchFileSize({
      bucketName: props.bucketName,
      bucketDirectory: props.bucketDirectory,
      storageCode: props.storageCode,
      isPublic: props.isPublic,
      useChunk,
    });
  }
  if (fileSize && fileSize > 0 && attachment.size > fileSize) {
    runInAction(() => {
      attachment.status = 'error';
      attachment.invalid = true;
      attachment.errorMessage = $l('Attachment', 'file_max_size', undefined, { size: formatFileSize(fileSize) }) as string;
    });
    return;
  }
  const { onBeforeUpload } = attachmentConfig;
  if (onBeforeUpload && await onBeforeUpload(attachment, attachments, {
    useChunk,
    bucketName: props.bucketName,
    bucketDirectory: props.bucketDirectory,
    storageCode: props.storageCode,
    isPublic: props.isPublic,
  }) === false) {
    return false;
  }

  const { beforeUpload } = props;
  return !(beforeUpload && await beforeUpload(attachment, attachments) === false);
}

async function uploadFile(props: UploaderProps, attachment: AttachmentFile, context: DataSetContext, chunkSize: number, useChunk?: boolean): Promise<any> {
  if (useChunk) {
    const chunks = cuteFile(attachment, chunkSize);
    const { chunkThreads = attachmentConfig.defaultChunkThreads } = props;
    return uploadChunks(props, attachment, chunks.slice(), context, Math.min(chunks.length, chunkThreads));
  }
  return uploadNormalFile(props, attachment, context);
}
async function uploadChunk(props: UploaderProps, attachment: AttachmentFile, chunk: AttachmentFileChunk, context: DataSetContext): Promise<any> {
  try {
    const { onBeforeUploadChunk } = attachmentConfig;
    if (!onBeforeUploadChunk || await onBeforeUploadChunk({
      chunk,
      attachment,
      bucketName: props.bucketName,
      bucketDirectory: props.bucketDirectory,
      storageCode: props.storageCode,
      isPublic: props.isPublic,
    }) !== false) {
      const config = getUploadAxiosConfig(props, attachment, chunk, mobxAction((e) => {
        chunk.percent = e.total > 0 ? (e.loaded / e.total) * 100 : 0;
      }));
      const resp = await getAxios(context)(config);
      chunk.status = 'success';
      return resp;
    }
  } catch (e) {
    chunk.status = 'error';
    throw new UploadError(e as any);
  }
}

function uploadChunks(
  props: UploaderProps,
  attachment: AttachmentFile,
  chunks: AttachmentFileChunk[],
  context: DataSetContext,
  threads: number,
): Promise<void> {
  const { length } = chunks;
  if (length) {
    runInAction(() => {
      attachment.status = 'uploading';
    });
    const queue = new PromiseQueue(threads);
    chunks.forEach(chunk => {
      if (chunk.status !== 'success') {
        queue.add(() => uploadChunk(props, attachment, chunk, context));
      }
    });
    return queue.ready();
  }
  return Promise.resolve();
}

async function uploadNormalFile(props: UploaderProps, attachment: AttachmentFile, context: DataSetContext) {
  try {
    runInAction(() => {
      attachment.status = 'uploading';
    });
    const config = getUploadAxiosConfig(props, attachment, undefined, mobxAction((e) => {
      const percent = e.total > 0 ? (e.loaded / e.total) * 100 : 0;
      attachment.percent = percent;
      const { onUploadProgress: handleProgress } = props;
      if (handleProgress) {
        handleProgress(percent, attachment);
      }
    }));
    const resp = await getAxios(context)(config);
    attachment.percent = 100;
    return new Promise<any>((resolve) => {
      setTimeout(() => resolve(resp), 0);
    });
  } catch (e) {
    throw new UploadError(e as any);
  }
}


function getAxios(context: DataSetContext): AxiosInstance {
  return context.getConfig('axios') || axios;
}

export function isAcceptFile(attachment: AttachmentFile, accept: string[]): boolean {
  const acceptTypes = accept.map(type => (
    new RegExp(type.replace(/\./g, '\\.').replace(/\*/g, '.*'))
  ));
  const { name, type } = attachment;
  return acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type));
}

function getCancelToken(saveUploadCancel) {
  return new AxiosCancelToken(e => {
    if (saveUploadCancel) {
      saveUploadCancel(e);
    }
  });
}

function getUploadAxiosConfig(
  props: UploaderProps,
  attachment: AttachmentFile,
  chunk: AttachmentFileChunk | undefined,
  onUploadProgress: (e) => void,
): AxiosRequestConfig {
  const { originFileObj } = attachment;
  if (originFileObj) {
    const blob = chunk ? originFileObj.slice(chunk.start, chunk.end) : originFileObj;
    const { action, data, headers, fileKey = attachmentConfig.defaultFileKey, withCredentials } = props;
    const newHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    };
    const formData = new FormData();
    formData.append(fileKey, blob);
    if (data) {
      appendFormData(formData, data);
    }
    if (action && !chunk) {
      return {
        url: action,
        headers: newHeaders,
        data: formData,
        onUploadProgress,
        method: 'POST',
        withCredentials,
        cancelToken: getCancelToken(props.saveUploadCancel),
      };
    }
    const actionHook = attachmentConfig.action;
    if (actionHook) {
      const { bucketName, bucketDirectory, storageCode, isPublic } = props;
      const newConfig = typeof actionHook === 'function' ? actionHook({
        attachment,
        chunk,
        bucketName,
        bucketDirectory,
        storageCode,
        isPublic,
      }) : actionHook;
      const { data: customData, onUploadProgress: customUploadProgress } = newConfig;
      if (customData) {
        appendFormData(formData, customData);
      }
      return {
        withCredentials,
        method: 'POST',
        ...newConfig,
        headers: {
          ...newHeaders,
          ...newConfig.headers,
        },
        data: formData,
        onUploadProgress: (e) => {
          onUploadProgress(e);
          if (customUploadProgress) {
            customUploadProgress(e);
          }
        },
        cancelToken: getCancelToken(props.saveUploadCancel),
      };
    }
    throw new Error(`Please set configure.attachment.action .`);
  }
  throw new Error('AttachmentFile can be uploaded only from input.files or DragEvent.dataTransfer.files');
}

function $l(
  component,
  key,
  defaults,
  injectionOptions?: { [key: string]: string | number },
) {
  const locale: string = LocaleContext.get(component, key, defaults);
  if (injectionOptions) {
    return formatTemplate(locale, injectionOptions);
  }
  return locale;
}

function appendFormData(formData: FormData, data: object) {
  Object.keys(data).forEach(key => formData.append(key, data[key]));
}