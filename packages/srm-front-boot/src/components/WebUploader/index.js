// https://github.com/fex-team/webuploader

import webUploader from 'webuploader';
import $ from 'jquery';
import { forIn, isEmpty } from 'lodash';
import { getEnvConfig } from 'utils/iocUtils';
import {
  getAccessToken,
  getCurrentOrganizationId,
  filterNullValueObject,
  getRequestId,
} from 'utils/utils';
import SparkMD5 from 'spark-md5';
import { getConfig } from 'hzero-boot';
import { getMenuId } from 'utils/menuTab';

const { API_HOST, HZERO_HFLE } = getEnvConfig();
class WebUploader {
  constructor() {
    this.inited = false;
    this.params = {};
    this.options = {};
    this.uploadMode = 'default';
    this.isOssMode = false;
    this.chunkSize = 5 * 1024 * 1024;
    this.duplicateFlag = false; // 防止重复上传
  }

  getRequestHeader() {
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
    const headers = {
      Authorization: `bearer ${getAccessToken()}`,
      'H-Request-Id': `${getRequestId()}`,
    };
    const MenuId = getMenuId();
    if (MenuId) {
      headers['H-Menu-Id'] = MenuId;
    }
    return {
      ...headers,
      ...patchRequestHeader,
    };
  }

  async init(options = {}) {
    const { prefixPatch, uploadMode, chunkSize } = options;
    this.options = options;
    const isOssMode = uploadMode === 'oss';
    this.isOssMode = isOssMode;
    this.chunkSize = chunkSize;
    this.uploadMode = uploadMode;
    // oss模式下，只允许使用文件服务接口，不支持配置其他服务
    this.checkUrl = isOssMode
      ? `${API_HOST}${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/check`
      : `${API_HOST}${prefixPatch}/v1/${getCurrentOrganizationId()}/upload/check-block`;
    this.uploadUrl = isOssMode
      ? `${API_HOST}${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/upload`
      : `${API_HOST}${prefixPatch}/v1/${getCurrentOrganizationId()}/upload/save`;
    this.combineUrl = isOssMode
      ? `${API_HOST}${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/files/slice/combine`
      : `${API_HOST}${prefixPatch}/v1/${getCurrentOrganizationId()}/upload/fragment-combine`;
    if (this.inited) return;

    $.ajaxSetup({
      beforeSend: (xhr) => {
        const requestHeader = this.getRequestHeader();
        if (!isEmpty(requestHeader)) {
          forIn(filterNullValueObject(requestHeader), (val, key) => {
            xhr.setRequestHeader(key, val);
          });
        }
      },
    });

    webUploader.Uploader.register(
      {
        'before-send-file': 'beforeSendFile',
        'before-send': 'beforeSend',
        'after-send-file': 'afterSendFile',
      },
      {
        beforeSendFile: this.beforeSendFile.bind(this),
        beforeSend: this.beforeSend.bind(this),
        afterSendFile: this.afterSendFile.bind(this),
      }
    );

    this.initUploader();
    this.inited = true;
  }

  initUploader() {
    this.md5Arr = [];
    this.timeArr = [];
    this._uploader = webUploader.create({
      swf: `webuploader/dist/Uploader.swf`,
      server: this.uploadUrl,
      chunked: true,
      chunkSize: this.chunkSize,
      threads: 3,
      resize: false,
      headers: this.getRequestHeader(),
    });

    this._uploader.on('all', this.onAll.bind(this));
    this._uploader.on('uploadProgress', this.onUploadProgress.bind(this));
  }

  async upload(file, onProgress) {
    if (!this.inited) {
      await this.init();
    }

    if (!file) return;
    this.clearUploader();
    // fix 调用addFiles方法报Can\'t add external files[https://github.com/fex-team/webuploader/issues/1190]
    const wuFile = new webUploader.File(new webUploader.Lib.File(webUploader.guid('rt_'), file));
    this._uploader.addFiles(wuFile);
    this._uploader.upload();

    this.uploadDeferred = webUploader.Deferred();
    this.onProgress = onProgress;
    return this.uploadDeferred.promise();
  }

  clearUploader() {
    if (!this._uploader) return;
    const files = this._uploader.getFiles();
    files.forEach((file) => this._uploader.removeFile(file));
  }

  emitUploadProgress(percentage, file) {
    if (!this.onProgress) return;
    this.onProgress(percentage, file);
  }

  emitUploadResult(res) {
    if (this.uploadDeferred) {
      this.uploadDeferred.resolve(res);
    }
  }

  onAll() {
    // 可获取上传状态
  }

  onUploadProgress(file, percentage) {
    // 可计算剩余时间
    // const index = this.getFileIndex(file)
    // const currentTime = new Date();
    // const timeDiff = currentTime.getTime() - this.timeArr[index].getTime();

    this.emitUploadProgress(percentage, file);
  }

  get $() {
    return window.$;
  }

  get Authorization() {
    return `Bearer ${getAccessToken()}`;
  }

  getFileIndex(file) {
    return file.id.slice(8);
  }

  beforeSendFile(file) {
    // 防止重复上传
    if (this.duplicateFlag) {
      return false;
    }
    this.duplicateFlag = true;
    const { bucketName, storageCode, directory } = this.options;
    const index = this.getFileIndex(file);
    const startTime = new Date();
    this.timeArr[index] = startTime;
    const deferred = webUploader.Deferred();

    const fileMd5CheckSize = 10 * 1024 * 1024;
    function fastMd5(uploader) {
      if (!fileMd5CheckSize || fileMd5CheckSize <= 0) {
        return uploader.md5File(file);
      } else {
        return uploader.md5File(file, 0, fileMd5CheckSize);
      }
    }

    fastMd5(new webUploader.Uploader()).then((res) => {
      // guid 用文件名+文件内容，防止两个文件名不同但文件内容相同的文件上传失败
      const spark = new SparkMD5();
      spark.append(file.name);
      spark.append(res);
      const value = spark.end();
      this.md5Arr[index] = value;
      this._uploader.options.formData.guid = value;
      this._uploader.options.formData.fileMd5 = value;
      if (this.isOssMode) {
        this._uploader.options.formData.guid = value;
        this._uploader.options.formData.fileMd5 = value;
        this._uploader.options.formData.bucketName = bucketName;
        this._uploader.options.formData.storageCode = storageCode;
        this._uploader.options.formData.directory = directory;
        this._uploader.options.formData.fileName = encodeURIComponent(file.name);
        this._uploader.options.formData.contentType = file.type;
      }
      deferred.resolve();
    });
    return deferred.promise();
  }

  beforeSend(block) {
    const { bucketName, storageCode } = this.options;
    const index = this.getFileIndex(block.file);
    // 防止重复上传文件
    if (!this.md5Arr[index]) {
      return;
    }
    const deferred = webUploader.Deferred();
    const data = this.isOssMode
      ? {}
      : {
          chunk: block.chunk,
          chunkSize: block.end - block.start,
          guid: this.md5Arr[index],
        };
    if (this.isOssMode) {
      this._uploader.options.formData.chunk = block.chunk;
    }
    const params = this.isOssMode
      ? { bucketName, storageCode, chunk: block.chunk, guid: this.md5Arr[index] }
      : {};
    let paramsStr = '';

    forIn(filterNullValueObject(params), (val, key) => {
      paramsStr = paramsStr ? `${paramsStr}&${key}=${val}` : `${key}=${val}`;
    });

    $.ajax({
      type: 'POST',
      url: `${this.checkUrl}${paramsStr ? `?${paramsStr}` : ''}`,
      data,
      cache: false,
      async: false,
      timeout: 1000,
      dataType: 'json',
      success(response) {
        if (response) {
          deferred.reject();
        } else {
          deferred.resolve();
        }
      },
      error() {
        deferred.reject();
      },
    });
    return deferred.promise();
  }

  setParams(params) {
    this.params = params;
  }

  async afterSendFile(file) {
    const index = this.getFileIndex(file);
    // 防止重复上传文件
    if (!this.md5Arr[index]) {
      return;
    }
    const args = this.params;
    const { bucketName, storageCode, directory } = this.options;
    const { attachmentUUID, enableImageWatermark } = this.params;
    const params = this.isOssMode
      ? {
          bucketName,
          storageCode,
          directory,
          attachmentUUID,
          enableImageWatermark,
          fileName: encodeURIComponent(file.name),
          fileSize: file.size,
          contentType: file.type,
          guid: this.md5Arr[index],
        }
      : {
          guid: this.md5Arr[index],
          fileName: encodeURIComponent(file.name),
        };
    let paramsStr = '';
    forIn(filterNullValueObject(params), (val, key) => {
      paramsStr = paramsStr ? `${paramsStr}&${key}=${val}` : `${key}=${val}`;
    });
    $.ajax({
      type: 'POST',
      url: `${this.combineUrl}${paramsStr ? `?${paramsStr}` : ''}`,
      contentType: 'application/json',
      data: this.isOssMode ? '' : JSON.stringify(args),
      dataType: 'text',
      success: (res) => {
        this.emitUploadResult({
          success: true,
          data: res,
        });
      },
      error: (res) => {
        this.emitUploadResult({
          success: false,
          msg: res.responseText,
        });
      },
    });
  }
}

export default WebUploader;
