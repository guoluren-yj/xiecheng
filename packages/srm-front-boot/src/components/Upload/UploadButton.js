/**
 * 上传按钮组件.
 * CHANGELOG: 2019-06-20: 过滤上传错误的文件时同时过滤掉 没有 uid 的文件, 文件 onChange 统一过滤掉 uid 重复的文件
 *
 * @date: 2018-7-13
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Button, Icon, notification, Upload, List, Tooltip, Popover } from 'hzero-ui';
import { DataSet, Pagination, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isObject, isString, isUndefined, remove, uniqWith, isNil, every, map } from 'lodash';
import { Bind } from 'lodash-decorators';
import AbortController from 'abort-controller';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import intl from 'utils/intl';
import request from 'utils/request';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getResponse,
  getSRMAccessCode,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { getEnvConfig } from 'utils/iocUtils';
import {
  removeFile,
  removeUploadFile,
  downloadFileByAxios,
  queryUUID,
  queryFileList,
} from 'services/api';

import WebUploader from '@/components/WebUploader';
import styles from './index.less';
import { getAttachmentUrlWithToken, fetchRemoteFileSizeLimit } from '../../utils/utils';

const {
  HZERO_HFLE,
  BKT_PUBLIC,
  CHUNK_UPLOAD_ENABLE, // 环境变量，用于控制是否允许开启断点续传
} = getEnvConfig();

const supportPreviewList = [
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
  '.zip',
  '.rar', '.7z', '.tar'
];
const newUrlPreviewList = [
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
  '.zip',
  '.rar', '.7z', '.tar'
];
const ListItem = List.Item;

/**
 * @reactProps {Map<string, Config>} fileConfig
 * @reactProps {?function} fileControl - 根据文件信息生成文件的配置，如是否可删除，应返回一个fileId和Config的Map
 */
export default class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      fileList: [],
      attachmentUUID: null,
      defaultChunkSize: 5 * 1024 * 1024, // 默认分片大小
    };
  }

  async getWebUploaderInstance() {
    const instance = new WebUploader();
    const { defaultChunkSize } = this.state;
    const {
      prefixPatch = HZERO_HFLE,
      bucketName = BKT_PUBLIC,
      bucketDirectory = '',
      storageCode = '',
      chunkSize = defaultChunkSize, // 分片大小
      chunkUpload = false,
      // chunkUploadMode = 'oss', // 上传模式：default | oss
    } = this.props;
    if (chunkUpload && CHUNK_UPLOAD_ENABLE === 'true') {
      const options = {
        prefixPatch,
        bucketName,
        storageCode,
        chunkSize,
        directory: bucketDirectory,
        uploadMode: 'oss',
      };
      await instance.init(options);
    }
    return instance;
  }

  componentWillReceiveProps(nextProps) {
    const { attachmentUUID, bucketName, bucketDirectory } = nextProps;
    if (attachmentUUID && attachmentUUID !== this.state.attachmentUUID) {
      this.setState({ attachmentUUID });
    }
    // 修复从props中直接传入fileList 在重新上传时 fileList丢失问题
    if (this.props.fileList !== nextProps.fileList) {
      this.setFileList(this.changeFileList(nextProps.fileList));
    }
  }

  setFileList(fileList) {
    if (fileList) {
      this.setState({
        fileList,
      });
    }
  }

  getFileList() {
    const { fileList: originFileList } = this.state;
    const { fileList } = this.props;
    const changedFileList = this.changeFileList(fileList);
    return originFileList || changedFileList;
  }

  @Bind()
  uploadData(file) {
    const {
      attachmentUUID,
      bucketName,
      uploadData,
      bucketDirectory,
      docType,
      storageCode, // 存储配置编码
      enableImageWatermark,
      storageType = 'UUID',
    } = this.props;
    let data = uploadData ? uploadData(file || {}) : {};
    if (!(data instanceof FormData)) {
      const currentData = data;
      data = new FormData();
      if (isObject(data)) {
        Object.keys(currentData).forEach((paramKey) => {
          data.append(paramKey, currentData[paramKey]);
        });
      }
    }
    if (
      typeof data.get === 'function' &&
      !data.get('attachmentUUID') &&
      !isUndefined(attachmentUUID) &&
      storageType === 'UUID'
    ) {
      data.append('attachmentUUID', attachmentUUID);
    }
    if (!isUndefined(bucketName)) {
      data.append('bucketName', bucketName);
    }
    if (!isUndefined(docType)) {
      data.append('docType', docType);
    }
    if (!isUndefined(storageCode)) {
      data.append('storageCode', storageCode);
    }
    if (!isUndefined(bucketDirectory)) {
      data.append('directory', bucketDirectory);
    }
    if (!isUndefined(enableImageWatermark)) {
      data.append('enableImageWatermark', enableImageWatermark);
    }
    // data.append('fileName', file.name);
    return data;
  }

  waitCleanFilesUid = [];

  cleanFilesTimeoutId = null;

  @Bind()
  async onChange({ file, fileList }) {
    const {
      single = false,
      tenantId: propTenantId,
      bucketName,
      bucketDirectory,
      filePreview = true,
      storageCode,
      crossTenant,
      transformFileList,
      enableImageWatermark,
      fileControl,
      storageType = 'UUID',
    } = this.props;
    const tenantId = propTenantId || getCurrentOrganizationId();
    const isUUID = storageType === 'UUID';
    let oldFileList = this.state.fileList || [];
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed === true) {
        this.onUploadError(file, fileList);
      } else {
        let fileConfig;
        if (isUUID) {
          const fileListTmp = await queryFileList({
            tenantId,
            bucketName,
            attachmentUUID: this.state.attachmentUUID || this.props.attachmentUUID,
          });
          if (getResponse(fileListTmp)) {
            fileConfig = fileControl ? fileControl(fileListTmp) : undefined;
            if (oldFileList && oldFileList.length > 0 && fileListTmp && fileListTmp.length > 0) {
              // 过滤掉已上传的
              const newFileList = [];
              oldFileList = oldFileList.filter((i) => !isNil(i.fileId));
              fileListTmp.forEach((item) => {
                if (!isNil(item.fileId) && oldFileList.every((of) => of.fileId !== item.fileId)) {
                  newFileList.push({
                    ...item,
                    uid: item.fileId,
                    name: item.fileName,
                    status: 'done',
                    url: getAttachmentUrlWithToken(
                      item.fileUrl,
                      item.bucketName || bucketName,
                      tenantId,
                      bucketDirectory,
                      storageCode,
                      item._fileToken,
                      enableImageWatermark
                    ),
                    response: item.fileUrl,
                    fileId: item.fileId,
                    _token: item._token,
                  });
                }
              });
              oldFileList = oldFileList.concat(newFileList);
            }
          }
        }
        if (single) {
          if (fileList.length > 1) {
            const { onRemove } = this.props;
            Promise.all(
              fileList.slice(0, fileList.length - 1).map(async (fileItem) => {
                if (fileItem.url) {
                  if (onRemove) {
                    // onRemove 返回 undefined 或 Promise
                    try {
                      await onRemove(fileItem, crossTenant);
                    } catch (e) {
                      // 单文件 上传成功后 删除之前的问题，报错不用管
                    }
                  } else {
                    const splitDatas = (fileItem.url && fileItem.url.split('=')) || [];
                    const fileUrl = splitDatas[splitDatas.length - 1];
                    try {
                      const removeParams = {
                        tenantId,
                        bucketName,
                        urls: [fileUrl],
                      };
                      let removeApi = removeUploadFile;
                      const currentUUID = this.state.attachmentUUID || this.props.attachmentUUID;
                      if (storageType === 'UUID' && !isNil(currentUUID)) {
                        removeApi = removeFile;
                        removeParams.attachmentUUID = currentUUID;
                      }
                      await removeApi(removeParams);
                    } catch (e) {
                      // 单文件 上传成功后 删除之前的问题，报错不用管
                    }
                  }
                }
              })
            ).catch(() => {
              // 单文件 上传成功后 删除之前的问题，报错不用管
            });
          }
          // 单文件上传模式下，取最后一个文件
          const newFile = oldFileList[oldFileList.length - 1] || {};
          list = [
            {
              ...newFile,
              uid: file.uid,
              name: file.name,
              status: 'done',
              url: getAttachmentUrlWithToken(
                file.response,
                newFile.bucketName || bucketName,
                tenantId,
                bucketDirectory,
                storageCode,
                newFile._fileToken,
                enableImageWatermark
              ),
              thumbUrl: getAttachmentUrlWithToken(
                file.response,
                newFile.bucketName || bucketName,
                tenantId,
                bucketDirectory,
                storageCode,
                newFile._fileToken,
                enableImageWatermark
              ),
            },
          ];
        } else {
          list = fileList.map((f) => {
            if (f.uid === file.uid) {
              // f.url = file.response;
              // eslint-disable-next-line
              f.url = getAttachmentUrlWithToken(
                f.response,
                f.bucketName || bucketName,
                tenantId,
                bucketDirectory,
                storageCode,
                f._fileToken,
                enableImageWatermark
              );
              // f.url = `${HZERO_FILE}/v1${
              //   !isUndefined(tenantId) ? `/${tenantId}/` : '/'
              // }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
              //   !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
              // }url=${f.response}`;
            }
            return f;
          });
        }
        this.onUploadSuccess(file, list);
        this.setState({ fileConfig });
      }
    } else if (file.status === 'error') {
      if (file.response && file.response.errorType === 'FILE-MAX-NUM') {
        if (!this.waitCleanFilesUid.includes(file.uid)) {
          this.waitCleanFilesUid.push(file.uid);
        }
        clearTimeout(this.cleanFilesTimeoutId);
        this.cleanFilesTimeoutId = setTimeout(() => {
          this.setState(
            {
              fileList: (this.state.fileList || []).filter(
                (f) => !this.waitCleanFilesUid.includes(f.uid)
              ),
            },
            () => {
              clearTimeout(this.cleanFilesTimeoutId);
              this.waitCleanFilesUid = [];
              this.cleanFilesTimeoutId = null;
            }
          );
        }, 100);
      }
      this.onUploadError(file, fileList);
      list = fileList.filter((f) => {
        return f.status !== 'error' && f.uid !== file.uid;
      });
    }
    if (filePreview) {
      remove(oldFileList, (n) => n.status === 'removed');
      if (single) {
        if (oldFileList.length > 1) {
          const { onRemove } = this.props;
          Promise.all(
            oldFileList.slice(0, oldFileList.length - 1).map(async (fileItem) => {
              if (fileItem.url) {
                if (onRemove) {
                  // onRemove 返回 undefined 或 Promise
                  try {
                    await onRemove(fileItem, crossTenant);
                  } catch (e) {
                    // 单文件 上传成功后 删除之前的问题，报错不用管
                  }
                } else {
                  const splitDatas = (fileItem.url && fileItem.url.split('=')) || [];
                  const fileUrl = splitDatas[splitDatas.length - 1];
                  try {
                    const removeParams = {
                      tenantId,
                      bucketName,
                      urls: [fileUrl],
                    };
                    let removeApi = removeUploadFile;
                    const currentUUID = this.state.attachmentUUID || this.props.attachmentUUID;
                    if (storageType === 'UUID' && !isNil(currentUUID)) {
                      removeApi = removeFile;
                      removeParams.attachmentUUID = currentUUID;
                    }
                    await removeApi(removeParams);
                  } catch (e) {
                    // 单文件 上传成功后 删除之前的问题，报错不用管
                  }
                }
              }
            })
          ).catch(() => {
            // 单文件 上传成功后 删除之前的问题，报错不用管
          });
        }
        let stateFileList = uniqWith([...list], (r1, r2) => r1.uid === r2.uid).filter(
          (f) => f.status !== 'done' || !isNil(f._fileToken)
        );
        if (transformFileList) {
          stateFileList = transformFileList(file, stateFileList);
        }
        this.setState({
          fileList: stateFileList,
        });
      } else {
        let stateFileList = uniqWith(
          [...list, ...oldFileList],
          (r1, r2) => r1.uid === r2.uid
        ).filter((f) => f.status !== 'done' || !isNil(f._fileToken));
        if (transformFileList) {
          stateFileList = transformFileList(file, stateFileList);
        }
        this.setState({
          fileList: stateFileList,
        });
      }
    } else {
      let stateFileList = uniqWith(list, (r1, r2) => r1.uid === r2.uid).filter(
        (f) => f.status !== 'done' || !isNil(f._fileToken)
      );
      if (transformFileList) {
        stateFileList = transformFileList(file, stateFileList);
      }
      this.setState({
        fileList: stateFileList,
      });
    }
  }

  @Bind()
  renderExtraAction(file) {
    const { showHistory, tenantId, listType = 'picture' } = this.props;
    if (showHistory && file && file.url) {
      const style =
        listType === 'picture-card'
          ? {
            cursor: 'pointer',
            fontSize: '16px',
            width: '16px',
            color: 'hsla(0, 0%, 100%, .85)',
            margin: '0 6px',
          }
          : undefined;

      return (
        <PopoverContent fileUrl={this.getPreviewUrl(file.url)} tenantId={tenantId} style={style} />
      );
    }
    return undefined;
  }

  @Bind()
  async beforeUploadFiles(files) {
    const {
      fileSize: defaultFileSize,
      beforeUploadFiles,
      storageType = 'UUID',
      chunkUpload = false,
    } = this.props;
    let result = true;
    if (!this.state.attachmentUUID && storageType === 'UUID') {
      const data = this.uploadData(files[0]);
      if (typeof data.get === 'function' && data.get('attachmentUUID')) {
        this.setState({
          attachmentUUID: data.get('attachmentUUID'),
        });
      } else {
        const response = await queryUUID({ tenantId: getCurrentOrganizationId() });
        if (getResponse(response) && response) {
          const attachmentUUID = response.content;
          // 保存 attachmentUUID
          this.setState({
            attachmentUUID,
          });
        } else {
          result = false;
        }
      }
    }

    const remoteFileSize = await fetchRemoteFileSizeLimit(
      this.props.bucketName,
      this.props.bucketDirectory,
      chunkUpload
    );
    const fileSize = defaultFileSize || remoteFileSize;
    const fileSizeValidate = every(
      map(files, (file, index) => {
        if (fileSize && file.size > fileSize) {
          file.status = 'error'; // eslint-disable-line
          notification.error({
            message: intl.get('hzero.common.upload.status.error').d('上传失败'),
            description: intl
              .get('hzero.common.upload.error.size', {
                fileSize: fileSize / (1024 * 1024),
              })
              .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
          });
          return false;
        }
        return true;
      })
    );
    if (result && fileSizeValidate) {
      if (beforeUploadFiles) {
        const flag = await beforeUploadFiles(files);
        return flag;
      }
      return true;
    }
    return false;
  }

  @Bind()
  beforeUpload(file, currentUploadnum) {
    const { fileType, fileMaxNum = null, beforeUpload } = this.props;
    const { fileList } = this.state;
    if (fileType && (!file.type || fileType.indexOf(file.type) === -1)) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType,
          })
          .d(`上传文件类型必须是：${fileType}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    // TODO 去掉文件 mimeType 校验
    // if (!file.type) {
    //   file.status = 'error'; // eslint-disable-line
    //   const res = {
    //     message: intl.get('hzero.common.upload.error.type.null').d('上传文件类型缺失，请检查类型'),
    //   };
    //   file.response = res; // eslint-disable-line
    //   return false;
    // }
    // 文件数量限制上传
    if (
      fileMaxNum &&
      (fileList.length >= fileMaxNum || fileList.length + currentUploadnum.length > fileMaxNum)
    ) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        failed: true,
        errorType: 'FILE-MAX-NUM',
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (beforeUpload) {
      return beforeUpload(file, currentUploadnum);
    }
    return true;
  }

  @Bind()
  onRemove(file) {
    const {
      crossTenant,
      onRemove,
      bucketName,
      onRemoveSuccess,
      single = false,
      tenantId,
      storageType = 'UUID',
    } = this.props;
    const { fileList, attachmentUUID } = this.state;
    if (file.url) {
      if (onRemove) {
        return onRemove(file, crossTenant);
      } else {
        const splitDatas = (file.url && file.url.split('=')) || [];
        const fileUrl = splitDatas[splitDatas.length - 1];

        if (crossTenant && file.fileId) {
          return this.removeFileByCrossTenant(file);
        } else {
          const removeParams = {
            tenantId,
            bucketName,
            urls: [fileUrl],
          };
          let removeApi = removeUploadFile;
          const currentUUID = this.state.attachmentUUID || this.props.attachmentUUID;
          if (storageType === 'UUID' && !isNil(currentUUID)) {
            removeApi = removeFile;
            removeParams.attachmentUUID = currentUUID;
          }
          return removeApi(removeParams).then((res) => {
            if (getResponse(res)) {
              if (onRemoveSuccess) {
                onRemoveSuccess();
              }

              if (single) {
                this.setState({
                  fileList: [],
                });
              } else {
                remove(fileList, (n) => n.uid === file.uid);
                this.setState({
                  fileList,
                });
              }
              return true;
            }
            return false;
          });
        }
      }
    } else {
      this.setState({
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
  }

  @Bind()
  removeFileByCrossTenant(file) {
    const { fileList } = this.state;
    const { onRemoveSuccess, single = false } = this.props;
    const { fileId, _token } = file;
    const tenantId = getCurrentOrganizationId();
    const reqUrl = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-uuidurl/token`
      : `${HZERO_FILE}/v1/files/delete-by-uuidurl/token`;
    return request(reqUrl, {
      method: 'POST',
      body: [{ fileId, _token }],
    }).then((res) => {
      if (getResponse(res)) {
        if (onRemoveSuccess) {
          onRemoveSuccess();
        }

        if (single) {
          this.setState({
            fileList: [],
          });
        } else {
          remove(fileList, (n) => n.uid === file.uid);
          this.setState({
            fileList,
          });
        }
        return true;
      }
      return false;
    });
  }

  onUploadSuccess(file, fileList) {
    const { onUploadSuccess } = this.props;
    notification.success({
      message: intl.get(`hzero.common.upload.status.success`).d('上传成功'),
    });
    if (onUploadSuccess) onUploadSuccess(file, fileList);
  }

  throttleErrorTimeId = null;

  onUploadError(file, fileList) {
    const { onUploadError, fileMaxNum } = this.props;
    let showTip = true;
    if (onUploadError) {
      showTip = onUploadError(file, fileList) !== false;
    }
    if (showTip) {
      const notificationMsg = {
        message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        description: (file.response && file.response.message) || (file.error && file.error.message),
      };
      if (file.response && file.response.failed && file.response.errorType === 'FILE-MAX-NUM') {
        notificationMsg.description = intl
          .get('hzero.common.upload.error.fileMaxNum', {
            fileMaxNum,
          })
          .d(`上传文件数量最多${fileMaxNum}个`);
        clearTimeout(this.throttleErrorTimeId);
        this.throttleErrorTimeId = setTimeout(() => {
          notification.error(notificationMsg);
        }, 100);
        return;
      }
      notification.error(notificationMsg);
    }
  }

  @Bind()
  changeFileList(fileList) {
    const {
      bucketName,
      bucketDirectory,
      tenantId,
      storageCode,
      enableImageWatermark,
      storageType = 'UUID',
    } = this.props;
    const isUUID = storageType === 'UUID';
    if (fileList) {
      return fileList.map((res) => {
        return {
          ...res,
          url: isUUID
            ? getAttachmentUrlWithToken(
              res.url,
              res.bucketName || bucketName,
              tenantId,
              bucketDirectory,
              storageCode,
              res._fileToken,
              enableImageWatermark
            )
            : res.url,
          fileId: res.fileId,
          _token: res._token,
        };
      });
    }
  }

  /**
   * 由于需要 将其他参数放到 formData 中, 所有 action 变成 方法
   * @returns {*}
   */
  @Bind()
  handleAction(config) {
    const { chunkUpload = false } = this.props;
    if (config.file && config.file.size && chunkUpload && CHUNK_UPLOAD_ENABLE === 'true') {
      this.handleChunkAction(config);
    } else {
      this.handleNormalAction(config);
    }
  }

  @Bind()
  async handleChunkAction({ file, onProgress, onSuccess, onError }) {
    const uploader = await this.getWebUploaderInstance();
    const params = filterNullValueObject({
      enableImageWatermark: this.props.enableImageWatermark,
      attachmentUUID: this.state.attachmentUUID || this.props.attachmentUUID,
    });
    uploader.setParams(params);
    const { success, data, msg } = await uploader.upload(file, (percentage) => {
      onProgress({ percent: percentage * 100 });
    });
    if (success && data.indexOf('failed') === -1) {
      onSuccess(data);
    } else {
      try {
        const result = JSON.parse(data) || {};
        onError(new Error(result.message));
      } catch (e) {
        onError(new Error(msg));
      }
    }
  }

  @Bind()
  async handleNormalAction({ file, onProgress, onSuccess, onError }) {
    const controller = new AbortController();
    const { signal } = controller;
    const { action: propAction, storageType = 'UUID' } = this.props;
    const isUUID = storageType === 'UUID';
    const actionPathname =
      propAction ||
      (isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/${isUUID ? 'attachment/' : ''
        }multipart`
        : `${HZERO_FILE}/v1/files/${isUUID ? 'attachment/' : ''}multipart`);
    const action = `${actionPathname}`;
    const data = this.uploadData(file);
    if (
      typeof data.get === 'function' &&
      !data.get('attachmentUUID') &&
      this.state.attachmentUUID &&
      isUUID
    ) {
      data.append('attachmentUUID', this.state.attachmentUUID);
    }
    data.append('file', file, file.name);
    request(
      action,
      {
        processData: false, // 不会将 data 参数序列化字符串
        method: 'POST',
        type: 'FORM',
        body: data,
        responseType: 'text',
        signal, // 用于控制 取消 请求
        onProgress: onProgress ? (e) => onProgress(e, file) : null,
      },
      {
        beforeCatch: (err) => {
          if (err.name === 'AbortError') {
            // 隐藏掉 取消上传的 fetch 报错
          } else if (err.message === 'Failed to fetch') {
            // 防止重复提示报错
          } else {
            throw new Error(err);
          }
        },
      }
    ).then((res) => {
      if (isString(res)) {
        // 成功
        onSuccess(res);
      } else if (!getResponse(res)) {
        onError(res);
        // 失败
      }
    });
    return {
      abort: () => {
        controller.abort();
      },
    };
  }

  @Bind()
  getFile(file) {
    this.props.handlePreview(file);
  }

  @Bind()
  extname(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    const filename = temp[temp.length - 1];
    // 解决文件名中带 # 的文件被当成图片处理的问题
    // const filenameWithoutSuffix = filename.split(/#|\?/)[0];
    return (/\.[^./\\]*$/.exec(filename) || [''])[0];
  }

  @Bind()
  isImageUrl(file) {
    if (file.status === 'done' || !file.status) {
      const url = file.name || file.thumbUrl || file.url;
      const extension = this.extname(url);
      if (/^data:image\//.test(url) || /(webp|svg|png|gif|jpg|jpeg|bmp)$/i.test(extension)) {
        return true;
      } else if (/^data:/.test(url)) {
        // other file types of base64
        return false;
      } else if (extension) {
        // other file types which have extension
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  @Bind()
  renderItem(item) {
    const { viewOnly, showUploadList, tenantId, showHistory, enableImageWatermark } = this.props;
    const { showRemoveIcon = true } = showUploadList || {};
    const fA = item.name.split('.');
    const fileExt = fA && fA[fA.length - 1];
    const allowPreview = supportPreviewList.includes(`.${fileExt.toLowerCase()}`);
    return (
      <ListItem key={item.uid} style={{ width: '100%' }}>
        <List.Item.Meta
          title={
            <a
              {...this.downloadPropsIntercept({ href: item.url })}
              className={styles['file-list-item-a']}
            >
              {item.name}
            </a>
          }
        />
        <div>
          {!viewOnly && showRemoveIcon && this.showRemoveIcon(item) && (
            <Icon
              title={intl.get('hzero.common.upload.removeFile').d('删除文件')}
              onClick={() => this.deleteFile(item)}
              style={{
                float: 'right',
                fontSize: '16px',
                lineHeight: '22px',
                paddingLeft: '6px',
                cursor: 'pointer',
              }}
              className={styles['file-list-item-icon']}
              type="delete"
            />
          )}
          {allowPreview && (
            <Icon
              title={intl.get('hzero.common.upload.previewFile').d('预览附件')}
              onClick={() => {
                if (this.props.handlePreviewFile) {
                  this.props.handlePreviewFile(item);
                } else {
                  this.handlePreviewFile(item);
                }
              }}
              style={{
                float: 'right',
                fontSize: '16px',
                lineHeight: '22px',
                paddingLeft: '6px',
                cursor: 'pointer',
              }}
              className={styles['file-list-item-icon']}
              type="eye-o"
            />
          )}
          {showHistory && item.url && (
            <PopoverContent fileUrl={this.getPreviewUrl(item.url)} tenantId={tenantId} />
          )}
        </div>
      </ListItem>
    );
  }

  @Bind()
  async deleteFile(file) {
    const { onRemove, crossTenant } = this.props;
    const { fileList } = this.state;
    remove(fileList, (n) => n.uid === file.uid);
    if (onRemove) {
      await onRemove(file, crossTenant);
      this.setState({
        fileList,
      });
    } else {
      this.onRemove(file);
    }
  }

  @Bind()
  getPreviewUrl(url = '') {
    if (url) {
      const vars = url.split('&');
      for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] === 'url') {
          return pair[1];
        }
      }
    }

    return false;
  }

  @Bind()
  handlePreviewFile(item) {
    const {
      bucketName,
      storageCode,
      enableImageWatermark,
      storageType = 'UUID',
      previewData,
    } = this.props;
    const fileExtMatch = item.name.match(/(.[^.]+)$/);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
    const isUUID = storageType === 'UUID';
    if (!supportPreviewList.includes(fileExt)) {
      notification.error({
        message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'),
        description: '',
      });
      return;
    }
    let fileToken = item._fileToken;
    const promises = [getSRMAccessCode({ expires: 15 })];
    const isTenant = isTenantRoleLevel();
    let fileUrl = this.getPreviewUrl(item.url);
    if (!isUUID) {
      promises.push(
        request(`${HZERO_HFLE}/v1/${isTenant ? `${getCurrentOrganizationId()}/` : ''}files`, {
          method: 'POST',
          body: [item.url],
        }).then((fileInfo = []) => {
          if (!fileInfo.length) return;
          fileToken = fileInfo[0]._fileToken;
        })
      );
      // 在非uuid模式下，item.url应直接为附件的华为云文件地址
      fileUrl = item.url;
    }
    Promise.all(promises).then(([_sac]) => {
      let url;
      if (!newUrlPreviewList.includes(fileExt)) {
        url = `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/file-preview-with-token`;
      } else if (isTenant) {
        url = `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/file/preview-with-token`;
      } else {
        url = `${HZERO_HFLE}/v1/file/preview-with-token`;
      }
      let preivewUrl = `${url}?url=${fileUrl}&bucketName=${item.bucketName || bucketName}${storageCode ? `&storageCode=${storageCode}` : ''
        }&_fileToken=${fileToken}&_sac=${_sac}${isNil(enableImageWatermark) ? '' : `&enableImageWatermark=${enableImageWatermark}`
        }`;
      if (previewData) {
        let businessParams = previewData;
        if (typeof previewData === 'function') {
          businessParams = businessParams();
        }
        if (businessParams.enableSceneExtend) {
          businessParams.sceneAttachmentUuid =
            this.props.attachmentUUID || this.state.attachmentUUID;
        }
        Object.keys(businessParams).forEach((key) => {
          preivewUrl += `&${key}=${businessParams[key]}`;
        });
      }
      window.open(preivewUrl);
    });
  }

  @Bind()
  downloadPropsIntercept(originProps = {}) {
    if (originProps.href) {
      return {
        ...originProps,
        target: undefined,
        // eslint-disable-next-line no-script-url
        href: 'javascript:void(0)',
        onClick: () => {
          const {
            bucketName,
            bucketDirectory,
            tenantId,
            storageCode,
            enableImageWatermark,
            storageType = 'UUID',
            downloadData,
          } = this.props;
          let businessParams = {};
          if (downloadData) {
            businessParams = downloadData;
            if (typeof downloadData === 'function') {
              businessParams = businessParams();
            }
            if (businessParams.enableSceneExtend) {
              businessParams.sceneAttachmentUuid =
                this.props.attachmentUUID || this.state.attachmentUUID;
            }
          }
          let queryParams = [];
          let url = originProps.href;
          const isUUID = storageType === 'UUID';
          const promises = [Promise.resolve()];
          const isTenant = isTenantRoleLevel();
          if (!isUUID) {
            promises.push(
              request(`${HZERO_HFLE}/v1/${isTenant ? `${getCurrentOrganizationId()}/` : ''}files`, {
                method: 'POST',
                body: [url],
              })
            );
          }
          Promise.all(promises).then(([_sac, fileInfo = []]) => {
            if (!isUUID) {
              if (!fileInfo.length || !fileInfo[0]._fileToken) {
                return;
              } else {
                url = getAttachmentUrlWithToken(
                  url,
                  fileInfo[0].bucketName || bucketName,
                  tenantId,
                  bucketDirectory,
                  storageCode,
                  fileInfo[0]._fileToken,
                  enableImageWatermark,
                  true,
                  { businessParams }
                );
              }
            }
            const paramStr = url.split('?')[1];
            if (paramStr) {
              queryParams = paramStr
                .split('&')
                .map((param) => {
                  const [name, value] = param.split('=');
                  return { name, value };
                })
                .filter((item) => !['access_token'].includes(item.name));
            }
            if (businessParams) {
              Object.keys(businessParams).forEach((key) => {
                queryParams.push({ name: key, value: businessParams[key] });
              });
            }
            downloadFileByAxios({ requestUrl: url, queryParams, method: 'GET' });
          });
        },
      };
    }
    return originProps;
  }

  showRemoveIcon = (file) => {
    const { fileConfig } = this.props;
    const { fileConfig: stateFileConfig } = this.state;
    const uid = file && (String(file.fileId) || String(file.uid));
    const config =
      (stateFileConfig && stateFileConfig.get(uid)) || (fileConfig && fileConfig.get(uid));
    return config ? !config.fileReadOnly : true;
  };

  /**
   * 专用于非uuid模式下的预览
   * @param {any} file
   */
  normalPreview = (file) => {
    const {
      bucketName,
      bucketDirectory,
      tenantId,
      storageCode,
      enableImageWatermark,
      storageType = 'UUID',
    } = this.props;

    let { url } = file;
    const isTenant = isTenantRoleLevel();

    request(`${HZERO_HFLE}/v1/${isTenant ? `${getCurrentOrganizationId()}/` : ''}files`, {
      method: 'POST',
      body: [url],
    }).then((fileInfo = []) => {
      if (!fileInfo || !fileInfo.length) return;
      url = getAttachmentUrlWithToken(
        url,
        fileInfo[0].bucketName || bucketName,
        tenantId,
        bucketDirectory,
        storageCode,
        fileInfo[0]._fileToken,
        enableImageWatermark
      );
      window.open(url);
    });
  };

  render() {
    const {
      fileList,
      fileType,
      fileSize,
      single,
      text = intl.get('hzero.common.upload.txt').d('上传'),
      listType = 'picture',
      bucketName,
      onUploadSuccess,
      onUploadError,
      viewOnly = false,
      showRemoveIcon = true,
      docType,
      storageCode, // 存储配置编码
      filePreview = true,
      uploadShowFlag,
      fileInputClick,
      beforeUpload,
      beforeUploadFiles,
      showUploadList,
      storageType = 'UUID',
      ...otherProps
    } = this.props;
    const uploadProps = {};
    if (storageType !== 'UUID') {
      uploadProps.onPreview = this.normalPreview;
    }
    const accessToken = getAccessToken();
    const changedFileList = this.changeFileList(fileList);
    const finalFileList =
      this.state.fileList.length > 0
        ? this.state.fileList || changedFileList || []
        : changedFileList || [];
    const notPictureList = finalFileList.filter((item) => !this.isImageUrl(item));
    const pictureList = filePreview
      ? finalFileList.filter((item) => this.isImageUrl(item))
      : finalFileList;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const acceptFileType =
      fileType && fileType.indexOf(',') === -1 ? fileType.split(';').join(',') : fileType;

    let uploadButton;
    if (listType === 'picture-card') {
      uploadButton = (
        <div>
          <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
        </div>
      );
    } else {
      uploadButton = (
        <Button>
          <Icon type="upload" /> {text}
        </Button>
      );
    }
    if (uploadShowFlag) {
      otherProps.fileInputClick = fileInputClick;
    }
    return (
      <>
        <Upload
          name="file"
          accept={acceptFileType}
          fileList={pictureList}
          data={this.uploadData}
          customRequest={this.handleAction}
          headers={headers}
          onChange={this.onChange}
          extraAction={this.renderExtraAction}
          listType={listType}
          beforeUploadFiles={this.beforeUploadFiles}
          beforeUpload={this.beforeUpload}
          onRemove={this.onRemove}
          showUploadList={{ ...showUploadList, showRemoveIcon: !viewOnly && this.showRemoveIcon }}
          downloadPropsIntercept={this.downloadPropsIntercept}
          {...uploadProps}
          {...otherProps}
        >
          {!viewOnly && uploadButton}
        </Upload>
        {notPictureList.length > 0 && filePreview && (
          <List
            style={viewOnly ? { float: 'left', width: '100%' } : {}} // 处理未起初浮动导致upload没高度问题
            header={
              single ? null : (
                <div>{intl.get('hzero.common.upload.fileList').d('文档列表（可在线预览）')}</div>
              )
            }
            bordered
            dataSource={notPictureList}
            renderItem={this.renderItem}
            className={styles['file-list']}
          />
        )}
      </>
    );
  }
}

const PopoverContent = observer(
  ({ fileUrl, style: propsStyle, tenantId = getCurrentOrganizationId() }) => {
    const [opList, setOpList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const dataSet = useMemo(() => {
      return new DataSet({
        pageSize: 10,
        dataKey: 'logs.content',
        totalKey: 'logs.totalElements',
        transport: {
          read: () => {
            return {
              url: `${HZERO_HFLE}/v1/files/${tenantId}/oplog?fileUrlOrKey=${decodeURIComponent(
                fileUrl
              )}`,
              method: 'GET',
              headers: {
                'h-request-auto-decrypt': true,
              },
            };
          },
        },
      });
    }, [fileUrl]);
    useEffect(() => {
      if (fileUrl && visible) {
        dataSet.query();
      }
    }, [fileUrl, visible]);
    const style = propsStyle || {
      float: 'right',
      fontSize: '16px',
      lineHeight: '22px',
      paddingLeft: '6px',
      cursor: 'pointer',
      color: '#29BECE',
    };

    return (
      <Tooltip title={intl.get('hzero.common.components.operationAudit.history')}>
        <Popover
          visible={visible}
          onVisibleChange={(v) => setVisible(v)}
          content={
            visible && (
              <Spin dataSet={dataSet}>
                <div className="upload-history-list-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <td colSpan={3}>{intl.get('hzero.common.date.creation')}</td>
                        <td colSpan={2}>{intl.get('hzero.common.action').d('操作')}</td>
                        <td colSpan={3}>
                          {intl
                            .get('hzero.common.components.operationAudit.operatedBy')
                            .d('操作人')}
                        </td>
                        <td colSpan={4}>{intl.get('hzero.common.model.tenantName').d('租户名')}</td>
                      </tr>
                    </thead>
                    <div className="upload-history-list-content">
                      <table>
                        <tbody>
                          {dataSet.status !== 'loading' && dataSet.length === 0 ? (
                            <td colSpan={11} className="no-data">
                              {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
                            </td>
                          ) : (
                            <>
                              {dataSet.map((line) => (
                                <tr>
                                  <td colSpan={3}>{dateTimeRender(line.get('date'))}</td>
                                  <td colSpan={2}>{line.get('opType')}</td>
                                  <td colSpan={3}>
                                    {line.get('realName')}({line.get('userName')})
                                  </td>
                                  <td colSpan={4}>{line.get('tenantName')}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={11}>
                                  <Pagination dataSet={dataSet} />
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </table>
                </div>
              </Spin>
            )
          }
          placement="right"
          trigger="click"
        >
          <Icon type="profile" style={style} />
        </Popover>
      </Tooltip>
    );
  }
);
