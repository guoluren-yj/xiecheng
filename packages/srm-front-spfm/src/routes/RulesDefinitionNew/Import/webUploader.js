// https://github.com/fex-team/webuploader

import webUploader from 'webuploader';
import $ from 'jquery';
import { forIn } from 'lodash';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { getAccessToken, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const { API_HOST, HZERO_HFLE } = getEnvConfig();
class WebUploader {
  constructor() {
    this.inited = false;
    this.params = {};
    this.options = {};
    this.uploadMode = 'default';
    this.isOssMode = false;
    this.chunkSize = 5 * 1024 * 1024;
  }

  async init(options = {}) {
    const { prefixPatch, uploadMode, chunkSize, attachmentUUID } = options;
    this.options = options;
    const isOssMode = uploadMode === 'oss';
    this.isOssMode = isOssMode;
    this.chunkSize = chunkSize;
    this.uploadMode = uploadMode;
    this.attachmentUUID = attachmentUUID;
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
        xhr.setRequestHeader('Authorization', this.Authorization);
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
      headers: {
        Authorization: this.Authorization,
      },
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
    this._uploader.addFile(file);
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

    fastMd5(new webUploader.Uploader()).then((value) => {
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
    const args = this.params;
    const { bucketName, storageCode, directory } = this.options;

    const params = this.isOssMode
      ? {
          bucketName,
          storageCode,
          directory,
          fileName: encodeURIComponent(file.name),
          fileSize: file.size,
          contentType: file.type,
          guid: this.md5Arr[index],
          attachmentUUID: this.attachmentUUID,
        }
      : {
          guid: this.md5Arr[index],
          fileName: encodeURIComponent(file.name),
          attachmentUUID: this.attachmentUUID,
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

export default new WebUploader();
