import React, { Component } from 'react';
import { Alert, Button, Icon, Modal, Spin, notification } from 'hzero-ui';
import { Tag } from 'choerodon-ui';
import { isEmpty, isFunction, isString, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import Viewer from 'react-viewer';
import classnames from 'classnames';
import 'react-viewer/dist/index.css';

import request from 'utils/request';
import intl from 'utils/intl';
import { HZERO_FILE, HZERO_HFLE } from 'utils/config';
import {
  getCurrentOrganizationId,
  getResponse,
  getSRMAccessCode,
  isTenantRoleLevel,
} from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { getAttachmentUrlWithToken } from '@/utils/utils';

import {
  queryFileList,
  queryUUID,
  removeFile,
  downloadFileByAxios,
} from 'hzero-front/lib/services/api';
import styles from './index.less';

import UploadButton from './UploadButton';
import H0CustomizeContext from '../CustomizeContext/H0CustomizeContext';
import UploadFileNumSync from './UploadFileNumSync';

const { BASE_PATH } = getEnvConfig();
const DEFAULT_BUCKET_NAME = 'spfm-comp';

// const previewModalStyle = {
//   maxWidth: '50vw',
//   maxHeight: '50vh',
// };

// const previewImageStyle = {
//   maxWidth: '100%',
//   maxHeight: '100%',
// };
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
  '.zip', '.rar', '.7z', '.tar'
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
  '.zip', '.rar', '.7z', '.tar'
];
/**
 * 使用UUID上传组件
 * @extends {Component} - React.Component
 * @reactProps {?String} bucketName - 附件桶
 * @reactProps {?String} bucketDirectory - 目录名称
 * @reactProps {?Object} attachmentUUID - 传入的UUID，如果不传入，组件可生成
 * @reactProps {?Object} currentData - 当前行数据
 * @reactProps {?function} afterOpenUploadModal - 展开modal后触发的方法
 * @reactProps {?Boolean} hasTemplate - 是否有附件模版
 * @reactProps {?String} templateAttachmentUUID - 附件模版UUID,通过 Tooltip 提示用户附件模版
 * @reactProps {?function} removeCallback - 删除文件后回调
 * @reactProps {?function} onCloseUploadModal - 关闭弹框时调用方法
 * @reactProps {?Boolean} viewOnly - 是否只读
 * @reactProps {?(fileList: {fileId: string | number}[]) => Map<string, fileConfig>} fileControl - 根据文件信息生成文件的配置
 * @return React.element
 */
export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      modalLoading: false,
      templateList: [],
      fileList: [],
      previewVisible: false,
      previewImages: [],
      attachmentUUID: '',
    };
  }

  upload;

  componentDidMount() {
    const { attachmentUUID, uploadShowFlag } = this.props;
    if (uploadShowFlag) {
      this.initTemplate();
    }
    if (attachmentUUID) {
      this.initUuid(true);
    }
  }

  @Bind()
  getFileList() {
    return this.state.fileList || [];
  }

  @Bind()
  setFileList(fileList) {
    this.setState({
      fileList,
    });
  }

  /**
   * 如果attachmentUUID变化 请求新UUID中的文件列表
   * @param {Object} nextProps 下个状态的props
   */
  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      tenantId,
      attachmentUUID,
      bucketDirectory,
      fileControl,
    } = this.props;
    if (attachmentUUID && !nextProps.attachmentUUID) {
      // eslint-disable-next-line no-unused-expressions
      this.upload && this.upload.setFileList(this.changeFileList([]));
      this.setState({
        fileList: [],
        attachmentUUID: nextProps.attachmentUUID,
      });
    } else if (attachmentUUID !== nextProps.attachmentUUID && nextProps.attachmentUUID) {
      queryFileList({ tenantId, bucketName, attachmentUUID: nextProps.attachmentUUID }).then(
        (fileList) => {
          if (getResponse(fileList)) {
            if (this.upload) {
              this.upload.setFileList(this.changeFileList(fileList));
            }
            this.setState({
              fileList: this.changeFileList(fileList),
              fileConfig: fileControl ? fileControl(fileList) : undefined,
            });
          }
        }
      );
    }
  }

  /**
   *格式化已经上传的文件列表
   *
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  @Bind()
  changeFileList(response, tplFlag = false) {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      bucketDirectory,
      tenantId,
      storageCode,
      templateBucketName = bucketName,
      enableImageWatermark,
    } = this.props;
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: getAttachmentUrlWithToken(
          res.fileUrl,
          tplFlag ? templateBucketName : (res.bucketName || bucketName),
          tenantId,
          bucketDirectory,
          storageCode,
          res._fileToken,
          enableImageWatermark
        ),
        fileId: res.fileId,
        _token: res._token,
        _fileToken: res._fileToken,
        bucketName: tplFlag ? templateBucketName : (res.bucketName || bucketName),
      };
    });
  }

  /**
   *打开modal后返回方法，可返回当前行数据和UUID
   *
   * @memberof UploadModal
   */
  @Bind()
  handleAfterOpenModal() {
    const { afterOpenUploadModal, attachmentUUID } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    if (isFunction(afterOpenUploadModal)) {
      afterOpenUploadModal(attachmentUUID || stateAttachmentUUID);
    }
  }

  @Bind()
  closeUploadModal() {
    const { onCloseUploadModal } = this.props;
    this.setState({
      visible: false,
    });
    if (onCloseUploadModal) {
      onCloseUploadModal();
    }
  }

  @Bind()
  async openUploadModal() {
    this.setState({
      visible: true,
      loading: true,
    });
    await this.initTemplate();
    await this.initUuid();
  }

  initTemplate = async () => {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      templateAttachmentUUID,
      tenantId,
      templateBucketName = bucketName,
    } = this.props;
    if (templateAttachmentUUID) {
      const tempalteList = await queryFileList({
        tenantId,
        bucketName: templateBucketName,
        attachmentUUID: templateAttachmentUUID,
      });
      if (getResponse(tempalteList)) {
        this.setState({
          templateList: this.changeFileList(tempalteList, true),
        });
      }
    }
  };

  initUuid = async (mount) => {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      attachmentUUID,
      tenantId,
      uploadShowFlag,
      fileControl,
    } = this.props;
    if (this.init && uploadShowFlag) {
      this.handleAfterOpenModal();
      return;
    }
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    let state = { loading: false };

    let uuid = attachmentUUID || stateAttachmentUUID;
    if (!uuid) {
      if (mount) return;
      const response = await queryUUID({ tenantId });
      if (response) {
        uuid = response.content;
      }
      state = {
        ...state,
        attachmentUUID: uuid,
      };
    } else {
      const fileList = await queryFileList({
        tenantId,
        bucketName,
        attachmentUUID: uuid,
      });
      if (getResponse(fileList)) {
        state = {
          ...state,
          fileList: this.changeFileList(fileList),
          fileConfig: fileControl ? fileControl(fileList) : undefined,
        };
        if (this.upload) {
          this.upload.setFileList(this.changeFileList(fileList));
        }
      }
    }
    this.setState(state, () => {
      // eslint-disable-next-line no-unused-expressions
      !mount && this.handleAfterOpenModal();
    });
    this.init = true;
  };

  /**
   *Ref
   *
   * @param {*} upload
   * @memberof UploadModal
   */
  @Bind()
  onRef(upload) {
    this.upload = upload;
  }

  /**
   *上传成功后调用方法
   *
   * @param {*} file 文件信息
   * @param {*} fileList 文件列表
   * @memberof UploadModal
   */
  @Bind()
  onUploadSuccess(file, fileList) {
    const { uploadSuccess } = this.props;
    if (uploadSuccess) {
      uploadSuccess();
    }
    this.setState({
      fileList,
    });
    const { onChange } = this.props;
    if (onChange) {
      const { single } = this.props;
      if (single) {
        // 由 UploadButton 触发 onUploadSuccess
      } else {
        const { attachmentUUID } = this.props;
        const { attachmentUUID: stateAttachmentUUID } = this.state;
        onChange(attachmentUUID || stateAttachmentUUID);
      }
    }
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    const basePath = (BASE_PATH || '').replace(/\//g, '');
    window.open(
      `/${basePath}/public/filePreview?url=${encodeURIComponent(file.url || file.thumbUrl)}`
    );
  }

  /**
   * 图片预览取消
   */
  @Bind()
  handlePreviewCancel() {
    this.setState({
      previewImages: [],
      previewVisible: false,
    });
  }

  /**
   *删除文件
   *
   * @param {*} file 文件
   * @param {boolean} crossTenantFlag 是否跨租户
   * @memberof UploadModal
   */
  @Bind()
  removeFile(file, crossTenantFlag = false) {
    const {
      removeCallback,
      bucketName = DEFAULT_BUCKET_NAME,
      tenantId,
      attachmentUUID,
      crossTenant,
    } = this.props;
    const { attachmentUUID: stateAttachmentUUID, fileList } = this.state;
    this.setState({
      modalLoading: true,
    });
    if (file.url) {
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
      if (file.fileId && (crossTenant || crossTenantFlag)) {
        return this.removeFileByCrossTenant(file);
      } else {
        return removeFile({
          tenantId,
          bucketName,
          attachmentUUID: attachmentUUID || stateAttachmentUUID,
          urls: [fileUrl],
        }).then((res) => {
          if (getResponse(res)) {
            this.setState({
              modalLoading: false,
              fileList: fileList.filter((list) => list.url !== file.url),
            });
            if (removeCallback) {
              removeCallback();
            }
            const { onChange } = this.props;
            if (onChange) {
              const { single } = this.props;
              if (single) {
                // 由 UploadButton 触发 onUploadSuccess
              } else {
                const { attachmentUUID } = this.props;
                const { attachmentUUID: stateAttachmentUUID } = this.state;
                onChange(attachmentUUID || stateAttachmentUUID);
              }
            }
            return true;
          } else {
            this.setState({
              modalLoading: false,
            });
            return false;
          }
        });
      }
    } else {
      this.setState({
        modalLoading: false,
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
  }

  @Bind()
  removeFileByCrossTenant(file) {
    const { fileList } = this.state;
    const { removeCallback } = this.props;
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
        this.setState({
          modalLoading: false,
          fileList: fileList.filter((list) => list.url !== file.url),
        });
        if (removeCallback) {
          removeCallback();
        }
        return true;
      } else {
        this.setState({
          modalLoading: false,
        });
        return false;
      }
    });
  }

  @Bind()
  getPreviewUrl(url) {
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
    const { bucketName, storageCode, enableImageWatermark, previewData } = this.props;
    const fileExtMatch = item.name.match(/(.[^.]+)$/);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
    const fileUrl = this.getPreviewUrl(item.url);
    if (!supportPreviewList.includes(fileExt)) {
      notification.error({
        message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'),
        description: '',
      });
      return;
    }
    getSRMAccessCode({ expires: 15 }).then((_sac) => {
      let url;
      if (!newUrlPreviewList.includes(fileExt)) {
        url = `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/file-preview-with-token`;
      } else if (isTenantRoleLevel()) {
        url = `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/file/preview-with-token`;
      } else {
        url = `${HZERO_HFLE}/v1/file/preview-with-token`;
      }
      let previewUrl = `${url}?url=${fileUrl}&bucketName=${item.bucketName || bucketName}${storageCode ? `&storageCode=${storageCode}` : ''
        }&_fileToken=${item._fileToken}&_sac=${_sac}${isNil(enableImageWatermark) ? '' : `&enableImageWatermark=${enableImageWatermark}`
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
          previewUrl += `&${key}=${businessParams[key]}`;
        });
      }
      window.open(previewUrl);
    });
  }

  delayClickInput = async (el) => {
    if (!this.props.attachmentUUID) {
      await this.initUuid();
    }
    el.click();
  };

  render() {
    const {
      state: {
        visible,
        modalLoading,
        previewVisible,
        previewImages,
        templateList = [],
        loading = false,
        attachmentUUID: stateAttachmentUUID,
        fileConfig,
      },
      props: {
        uploadShowFlag,
        bucketName = DEFAULT_BUCKET_NAME,
        bucketDirectory,
        viewOnly = false,
        icon = viewOnly ? 'paper-clip' : 'upload',
        filesNumber = '',
        showFilesNumber = true,
        hasTemplate,
        multiple = true,
        btnText = viewOnly
          ? intl.get('hzero.common.upload.view').d('查看附件')
          : intl.get('hzero.common.upload.text').d('上传附件'),
        description,
        onChange,
        tenantId,
        btnProps = {},
        title = intl.get('hzero.common.upload.modal.title').d('附件'),
        docType,
        storageCode, // 存储配置编码
        showUploadList,
        modalClassName, // 模态框的动态样式名
        fileViewerClassName, // 文件预览的动态样式名
        custViewContainerId, // 自定义文件预览容器id
        attachmentUUID,
        ...otherProps
      },
    } = this;
    let { fileList } = this.state;

    if (this.upload) {
      // eslint-disable-next-line prefer-destructuring
      fileList = this.upload.state.fileList.filter((item) => item.status !== 'removed');
    }
    const actionPathname = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/attachment/multipart`
      : `${HZERO_FILE}/v1/files/attachment/multipart`;
    const action = `${actionPathname}`;

    let descriptionBlock = null;
    if (hasTemplate || description) {
      const templateLinks = templateList.map((tpl) => {
        return (
          <Tag>
            <a
              // style={{ color: '#108ee9' }}
              // eslint-disable-next-line no-script-url
              href="javascript:void(0)"
              onClick={() => {
                let queryParams = [];
                const paramStr = tpl.url.split('?')[1];
                if (paramStr) {
                  queryParams = paramStr
                    .split('&')
                    .map((param) => {
                      const [name, value] = param.split('=');
                      return { name, value };
                    })
                    .filter((item) => !['access_token'].includes(item.name));
                }
                downloadFileByAxios({ requestUrl: tpl.url, queryParams, method: 'GET' });
              }}
              rel="noopener noreferrer"
            >
              {tpl.name}
            </a>
          </Tag>
        );
      });
      const message = [];
      if (description) message.push(<div>{description}</div>);
      if (templateList.length > 0) {
        message.push(
          <div>
            {hasTemplate && (
              <span>
                {intl.get('hzero.common.upload.template').d('附件模板')}: {templateLinks}{' '}
              </span>
            )}
          </div>
        );
      }
      descriptionBlock =
        message.length > 0 ? (
          <Alert
            showIcon
            className={styles['upload-alert-fix']}
            message={<>{message}</>}
            style={{ marginRight: '8px', marginBottom: '15px' }}
            type="info"
          />
        ) : null;
    }

    const modalContent = (
      <React.Fragment>
        {loading && (
          <div style={{ textAlign: 'center', padding: '30px 50px' }}>
            <Spin />
          </div>
        )}
        <div style={{ display: loading ? 'none' : '', overflow: 'hidden' }}>
          {descriptionBlock}
          <Spin spinning={modalLoading}>
            <UploadButton
              fileConfig={fileConfig}
              handlePreviewFile={this.handlePreviewFile}
              viewOnly={viewOnly}
              multiple={multiple}
              listType="picture-card"
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              onRef={this.onRef}
              tenantId={tenantId}
              onRemove={this.removeFile}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录？'),
                showRemoveIcon: !viewOnly,
                ...showUploadList,
              }}
              action={action}
              filePreview
              uploadShowFlag={uploadShowFlag}
              fileInputClick={this.delayClickInput}
              {...otherProps}
              attachmentUUID={attachmentUUID || stateAttachmentUUID}
            />
          </Spin>
        </div>
      </React.Fragment>
    );

    const viewerContainerCls = classnames(
      styles['viewer-container'],
      { [styles['viewer-container-show']]: previewVisible },
      fileViewerClassName
    );

    const uploadContent = uploadShowFlag ? (
      modalContent
    ) : (
      <>
        {isEmpty(btnProps) ? (
          <a onClick={this.openUploadModal}>
            {isString(icon) ? <Icon type={icon} /> : icon}
            {btnText}
            {showFilesNumber &&
              ((filesNumber && filesNumber !== 0) || (fileList || []).length > 0) && (
                <Tag
                  // color="#108ee9"
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                  className={styles['files-number-tag']}
                >
                  {filesNumber && filesNumber !== 0 ? filesNumber : fileList.length}
                </Tag>
              )}
          </a>
        ) : (
          <Button onClick={this.openUploadModal} {...btnProps}>
            {btnText}
            {showFilesNumber &&
              ((filesNumber && filesNumber !== 0) || (fileList || []).length > 0) && (
                <Tag
                  // color="#108ee9"
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                  className={styles['files-number-tag']}
                >
                  {filesNumber && filesNumber !== 0 ? filesNumber : fileList.length}
                </Tag>
              )}
          </Button>
        )}
        <Modal
          visible={visible}
          title={title}
          width={610}
          footer={null}
          className={modalClassName}
          onCancel={this.closeUploadModal}
        >
          {modalContent}
        </Modal>
      </>
    );

    return (
      <React.Fragment>
        <H0CustomizeContext.Consumer>
          {(value) => <UploadFileNumSync ctx={value} parentUpload={this} />}
        </H0CustomizeContext.Consumer>
        {uploadContent}
        {custViewContainerId && <div className={viewerContainerCls} id={custViewContainerId} />}
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={this.handlePreviewCancel}
          images={previewImages}
          container={custViewContainerId ? document.getElementById(custViewContainerId) : null}
        />
      </React.Fragment>
    );
  }
}
