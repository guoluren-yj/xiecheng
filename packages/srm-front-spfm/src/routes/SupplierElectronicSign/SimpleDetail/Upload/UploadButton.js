/**
 * 上传按钮组件.
 * CHANGELOG: 2019-06-20: 过滤上传错误的文件时同时过滤掉 没有 uid 的文件, 文件 onChange 统一过滤掉 uid 重复的文件
 *
 * @date: 2018-7-13
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Icon, notification, Upload } from 'hzero-ui';
import { isObject, isString, isUndefined, remove, uniqWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import AbortController from 'abort-controller';

import intl from 'utils/intl';
import request from 'utils/request';
import {
  getAccessToken,
  getAttachmentUrl,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

import { removeUploadFile } from 'services/api';

notification.config({
  placement: 'bottomRight',
});

export default class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      fileList: [],
    };
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.fileList.length > 0 && state.fileList == null) {
  //     return {
  //       fileList: props.fileList,
  //     };
  //   }
  //   return state;
  // }

  setFileList(fileList) {
    if (fileList) {
      this.setState({
        fileList,
      });
    }
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
    } = this.props;
    let data = uploadData ? uploadData(file) : {};
    if (!(data instanceof FormData)) {
      const currentData = data;
      data = new FormData();
      if (isObject(data)) {
        Object.keys(currentData).forEach((paramKey) => {
          data.append(paramKey, currentData[paramKey]);
        });
      }
    }
    if (!isUndefined(attachmentUUID)) {
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
    // data.append('fileName', file.name);
    return data;
  }

  @Bind()
  onChange({ file, fileList }) {
    const { single = false, tenantId, bucketName, bucketDirectory } = this.props;
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed === true) {
        this.onUploadError(file, fileList);
      } else {
        this.onUploadSuccess(file, fileList);
        if (single) {
          list = [
            {
              uid: file.uid,
              name: file.name,
              url: getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory),
              thumbUrl: getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory),
            },
          ];
        } else {
          list = fileList.map((f) => {
            if (f.uid === file.uid) {
              // f.url = file.response;
              // eslint-disable-next-line
              f.url = getAttachmentUrl(f.response, bucketName, tenantId, bucketDirectory);
              // f.url = `${HZERO_FILE}/v1${
              //   !isUndefined(tenantId) ? `/${tenantId}/` : '/'
              // }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
              //   !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
              // }url=${f.response}`;
            }
            return f;
          });
        }
      }
    } else if (file.status === 'error') {
      this.onUploadError(file, fileList);
      list = fileList.filter((f) => {
        return f.status !== 'error' && f.uid;
      });
    }
    this.setState({
      fileList: uniqWith(list, (r1, r2) => r1.uid === r2.uid),
    });
  }

  @Bind()
  beforeUpload(file) {
    // const { fileType, accept, fileSize = 10 * 1024 * 1024 } = this.props;
    const { fileType, accept, fileSize } = this.props;
    if (fileType && fileType !== file.type) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType: accept,
          })
          .d(`上传文件类型必须是: ${fileType}`),
      };
      file.response = res; // eslint-disable-line
      this.setState({
        fileList: [],
      });
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
    // const fileSize = 50;
    if (file.size > fileSize * 1024) {
      // 手动添加上传的最大限制
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.errorSize.size', {
            fileSize: `${fileSize}KB`,
          })
          .d(`上传文件大小不能超过: ${fileSize}KB`),
      };
      file.response = res; // eslint-disable-line
      this.setState({
        fileList: [],
      });
      return false;
    }
    return true;
  }

  /**
   * 删除URL的附件
   * 只有文件服务删除了url，并且更新了对应的头行才清空对应的文件列表
   * 每个附件列表只有一个文件
   * @param {Object} file
   * */
  @Bind()
  onUploadUrlRemove(file, item = {}, field) {
    const { fileMap = {} } = this.state;
    const { onRefresh, onUpdateHeader } = this.props;
    if (file.url) {
      if (field === 'contractTemplateUploadFileList') {
        return new Promise((resolve, reject) => {
          Promise.all([
            this.handleDeleteFilesByUrl(file),
            this.handleDeleteTemplateFiles(item),
          ]).then(
            (res) => {
              if (res) {
                this.setState({
                  fileMap: {
                    ...fileMap,
                    [field]: [],
                  },
                });
                if (onRefresh) {
                  onRefresh();
                }
                notification.success();
                resolve();
              }
            },
            () => {
              reject();
            }
          );
        });
      } else if (field === 'templateUploadFileList') {
        return onUpdateHeader({ ...item, contractAttachmentUrl: '' }).then(() => {
          if (onRefresh) {
            onRefresh();
          }
          notification.success();
          this.setState({ fileMap: { ...fileMap, [field]: [] } });
        });
      } else {
        return new Promise((resolve, reject) => {
          Promise.all([this.handleDeleteFilesByUrl(file), this.handleDeleteConfigFiles(item)]).then(
            (res) => {
              if (res) {
                const sourceField = `${item.attachmentId}UploadFileList`;
                this.setState({
                  fileMap: {
                    ...fileMap,
                    [sourceField]: [],
                  },
                });
                onRefresh();
                notification.success();
                resolve();
              }
            },
            () => {
              reject();
            }
          );
        });
      }
    } else {
      this.setState({ fileMap: { ...fileMap, [field]: [] } });
    }
  }

  @Bind()
  onRemove(file) {
    const { onRemove, bucketName, onRemoveSuccess, single = false, tenantId } = this.props;
    const { fileList } = this.state;
    if (file.url) {
      if (onRemove) {
        return onRemove(file);
      } else {
        const splitDatas = (file.url && file.url.split('=')) || [];
        const fileUrl = splitDatas[splitDatas.length - 1];
        return removeUploadFile({
          tenantId,
          bucketName,
          urls: [fileUrl],
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
    } else {
      this.setState({
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
  }

  onUploadSuccess(file, fileList) {
    const { onUploadSuccess } = this.props;
    if (onUploadSuccess) onUploadSuccess(file, fileList);
  }

  onUploadError(file, fileList) {
    const { onUploadError } = this.props;
    let showTip = true;
    if (onUploadError) {
      showTip = onUploadError(file, fileList) !== false;
    }
    if (showTip) {
      notification.error({
        message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        description: file.response && file.response.message,
      });
    }
  }

  @Bind()
  changeFileList(fileList) {
    const { bucketName, bucketDirectory, tenantId } = this.props;
    if (fileList) {
      return fileList.map((res) => {
        return {
          ...res,
          url: getAttachmentUrl(res?.url, bucketName, tenantId, bucketDirectory),
        };
      });
    }
  }

  /**
   * 由于需要 将其他参数放到 formData 中, 所有 action 变成 方法
   * @returns {*}
   */
  @Bind()
  handleAction({ file, onProgress, onSuccess, onError }) {
    const controller = new AbortController();
    const { signal } = controller;

    const { action: propAction } = this.props;
    const actionPathname =
      propAction ||
      (isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/multipart`
        : `${HZERO_FILE}/v1/files/multipart`);
    const action = `${actionPathname}`;
    const data = this.uploadData(file);
    // data.set('file', file, file.name);
    data.append('file', file, file.name);
    request(action, {
      processData: false, // 不会将 data 参数序列化字符串
      method: 'POST',
      type: 'FORM',
      body: data,
      responseType: 'text',
      signal, // 用于控制 取消 请求
      beforeCatch: (err) => {
        if (err.name === 'AbortError') {
          // 隐藏掉 取消上传的 fetch 报错
        } else {
          throw new Error(err);
        }
      },
      onProgress: onProgress ? (e) => onProgress(e, file) : null,
    }).then((res) => {
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
      ...otherProps
    } = this.props;
    const accessToken = getAccessToken();
    const changedFileList = this.changeFileList(fileList);
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

    return (
      <Upload
        name="file"
        accept={acceptFileType}
        fileList={this.state.fileList || changedFileList}
        data={this.uploadData}
        customRequest={this.handleAction}
        headers={headers}
        onChange={this.onChange}
        listType={listType}
        beforeUpload={this.beforeUpload}
        onRemove={this.onRemove}
        showUploadList={{ showRemoveIcon: !viewOnly && showRemoveIcon }}
        {...otherProps}
      >
        {!this.state.fileList[0] && uploadButton}
      </Upload>
    );
  }
}
