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
import { Button, Icon, notification, Upload, List } from 'hzero-ui';
import { isObject, isString, isUndefined, remove, uniqWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import AbortController from 'abort-controller';

import intl from 'utils/intl';
import request from 'utils/request';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';

import { removeFile, downloadFileByAxios, removeUploadFile } from 'services/api';

import { getAttachmentUrl } from './utils';

notification.config({
  placement: 'bottomRight',
});

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
];
const ListItem = List.Item;

export default class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      // fileList: null,
      fileList: this.props.fileList || [],
    };
    this.config = getEnvConfig();
  }

  componentWillReceiveProps(nextProps) {
    const { attachmentUUID } = nextProps;
    if (attachmentUUID && attachmentUUID !== this.state.attachmentUUID) {
      this.setState({ attachmentUUID });
    }
    // 修复从props中直接传入fileList 在重新上传时 fileList丢失问题
    if (this.props.fileList !== nextProps.fileList) {
      this.setFileList(this.changeFileList(nextProps.fileList));
    }
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
    this.setState({
      fileList,
    });
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
    const {
      single = false,
      tenantId,
      bucketName,
      bucketDirectory,
      filePreview = true,
      crossTenant,
    } = this.props;
    const oldFileList = this.state.fileList;
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed === true) {
        this.onUploadError(file, fileList);
      } else {
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
                      await removeUploadFile({
                        tenantId,
                        bucketName,
                        urls: [fileUrl],
                      });
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
          list = [
            {
              uid: file.uid,
              name: file.name,
              status: 'done',
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
        this.onUploadSuccess(file, list);
      }
    } else if (file.status === 'error') {
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
                    await removeUploadFile({
                      tenantId,
                      bucketName,
                      urls: [fileUrl],
                    });
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
        this.setState({
          fileList: uniqWith([...list], (r1, r2) => r1.uid === r2.uid),
        });
      } else {
        this.setState({
          fileList: uniqWith([...list, ...oldFileList], (r1, r2) => r1.uid === r2.uid),
        });
      }
    } else {
      this.setState({
        fileList: uniqWith(list, (r1, r2) => r1.uid === r2.uid),
      });
    }
  }

  @Bind()
  beforeUpload(file) {
    const { fileType, fileSize } = this.props;
    if (fileType && fileType.indexOf(file.type) === -1) {
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
    if (fileSize && file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  @Bind()
  onRemove(file) {
    const {
      attachmentUUID,
      onRemove,
      bucketName,
      onRemoveSuccess,
      single = false,
      tenantId,
    } = this.props;
    const { fileList } = this.state;
    if (file.url) {
      if (onRemove) {
        return onRemove(file);
      }
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
      return removeFile({
        tenantId,
        bucketName,
        attachmentUUID,
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
    this.setState({
      fileList: fileList.filter((list) => list.uid !== file.uid),
    });
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
      return fileList.map((res) => ({
        ...res,
        url: getAttachmentUrl(res.url, bucketName, tenantId, bucketDirectory),
      }));
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
    const { HZERO_FILE } = this.config;
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

  downloadPropsIntercept(originProps = {}) {
    if (originProps.href) {
      return {
        ...originProps,
        target: undefined,
        // eslint-disable-next-line no-script-url
        href: 'javascript:void(0)',
        onClick: () => {
          let queryParams = [];
          const paramStr = originProps.href.split('?')[1];
          if (paramStr) {
            queryParams = paramStr
              .split('&')
              .map((param) => {
                const [name, value] = param.split('=');
                return { name, value };
              })
              .filter((item) => !['access_token'].includes(item.name));
          }
          downloadFileByAxios({ requestUrl: originProps.href, queryParams, method: 'GET' });
        },
      };
    }
    return originProps;
  }

  @Bind()
  handlePreviewFile(item) {
    const { HZERO_FILE } = this.config;
    const { bucketName, storageCode, crossTenant = true } = this.props;
    const fileExtMatch = item.name.match(/(.[^.]+)$/);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
    if (!supportPreviewList.includes(fileExt)) {
      notification.error({
        message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'),
        description: '',
      });
      return;
    }
    const fileUrl = this.getPreviewUrl(item.url);
    let url;
    if (!newUrlPreviewList.includes(fileExt)) {
      url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview${
        crossTenant ? '/by-url' : ''
      }`;
    } else if (isTenantRoleLevel()) {
      url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file/preview`;
    } else {
      url = `${HZERO_FILE}/v1/file/preview`;
    }
    window.open(
      `${url}?url=${fileUrl}&bucketName=${bucketName}${
        storageCode ? `${storageCode}&storageCode=` : ''
      }&access_token=${getAccessToken()}`
    );
  }

  @Bind()
  renderItem(item) {
    const { viewOnly, showUploadList } = this.props;
    const { showRemoveIcon = true } = showUploadList || {};
    const fA = item.name.split('.');
    const fileExt = fA && fA[fA.length - 1];
    const allowPreview = supportPreviewList.includes(`.${fileExt.toLowerCase()}`);
    return (
      <ListItem key={item.uid} style={{ width: '100%' }}>
        <List.Item.Meta
          title={
            <a
              style={{ color: '#29BECE' }}
              // eslint-disable-next-line no-script-url
              href="javascript:void(0)"
              onClick={() => {
                let queryParams = [];
                const paramStr = item.url.split('?')[1];
                if (paramStr) {
                  queryParams = paramStr
                    .split('&')
                    .map((param) => {
                      const [name, value] = param.split('=');
                      return { name, value };
                    })
                    .filter((i) => !['access_token'].includes(i.name));
                }
                downloadFileByAxios({ requestUrl: item.url, queryParams, method: 'GET' });
              }}
            >
              {item.name}
            </a>
          }
        />
        <div>
          {!viewOnly && showRemoveIcon && (
            <Icon
              title={intl.get('hzero.common.upload.removeFile').d('删除文件')}
              onClick={() => this.deleteFile(item)}
              style={{
                float: 'right',
                fontSize: '16px',
                lineHeight: '22px',
                paddingLeft: '6px',
                cursor: 'pointer',
                color: '#29BECE',
              }}
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
                color: '#29BECE',
              }}
              type="eye-o"
            />
          )}
        </div>
      </ListItem>
    );
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
  getPreviewUrl(url) {
    const vars = url.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === 'url') {
        return pair[1];
      }
    }
    return false;
  }

  @Bind()
  async deleteFile(file) {
    const { onRemove, crossTenant } = this.props;
    const { fileList } = this.state;
    remove(fileList, (n) => n.uid === file.uid);
    if (file.url) {
      if (onRemove) {
        await onRemove(file, crossTenant);
        this.setState({
          fileList,
        });
      } else {
        this.onRemove(file);
      }
    }
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
      children,
      filePreview = true,
      ...otherProps
    } = this.props;
    const accessToken = getAccessToken();
    // const changedFileList = this.changeFileList(fileList);
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
          listType={listType}
          beforeUpload={this.beforeUpload}
          onRemove={this.onRemove}
          showUploadList={{ showRemoveIcon: !viewOnly && showRemoveIcon }}
          downloadPropsIntercept={this.downloadPropsIntercept}
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
          />
        )}
      </>
    );
  }
}
