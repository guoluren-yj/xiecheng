import React, { PureComponent } from 'react';
import { Alert, Button, Icon, Modal, Spin, notification, Row, Col, Popover } from 'hzero-ui';
import { Tag } from 'choerodon-ui';
import { isEmpty, isFunction, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import Viewer from 'react-viewer';
import classnames from 'classnames';
import 'react-viewer/dist/index.css';

// import request from 'utils/request';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import {
  getAccessToken,
  getAttachmentUrl,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'utils/utils';

import { queryFileList, queryUUID, removeFile } from 'hzero-front/lib/services/api';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import styles from './index.less';

// import UploadButton from 'choerodon-ui/pro/lib/attachment';

// eslint-disable-next-line prefer-destructuring
const BASE_PATH = window.$$env.BASE_PATH;
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
 * @return React.element
 * 该文件是import UploadButton from 'srm-front-boot/lib/components/Upload/index
 * 逻辑没有改什么，只是改了一下样式
 */
export default class Upload extends PureComponent {
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
      rightList: [],
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

  /**
   * 如果attachmentUUID变化 请求新UUID中的文件列表
   * @param {Object} nextProps 下个状态的props
   */
  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { bucketName = DEFAULT_BUCKET_NAME, tenantId } = this.props;
    if (this.props.attachmentUUID !== nextProps.attachmentUUID && nextProps.attachmentUUID) {
      queryFileList({ tenantId, bucketName, attachmentUUID: nextProps.attachmentUUID }).then(
        (fileList) => {
          if (getResponse(fileList)) {
            if (this.upload) {
              this.upload.setFileList(this.changeFileList(fileList));
            }
            this.setState({
              fileList: this.changeFileList(fileList),
            });
          }
        }
      );
      if (nextProps.rightAttachmentUUID) {
        queryFileList({
          tenantId,
          bucketName,
          attachmentUUID: nextProps.rightAttachmentUUID,
        }).then((rightFileListRes) => {
          if (getResponse(rightFileListRes)) {
            this.setState({
              rightList: this.changeFileList(rightFileListRes),
            });
          }
        });
      }
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
  changeFileList(response) {
    const { bucketName = DEFAULT_BUCKET_NAME, bucketDirectory, tenantId } = this.props;
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: getAttachmentUrl(res.fileUrl, bucketName, tenantId, bucketDirectory),
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
    const { bucketName = DEFAULT_BUCKET_NAME, templateAttachmentUUID, tenantId } = this.props;
    if (templateAttachmentUUID) {
      const tempalteList = await queryFileList({
        tenantId,
        bucketName,
        attachmentUUID: templateAttachmentUUID,
      });
      if (getResponse(tempalteList)) {
        this.setState({
          templateList: this.changeFileList(tempalteList),
        });
      }
    }
  };

  initUuid = async (mount) => {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      attachmentUUID,
      rightAttachmentUUID,
      tenantId,
      uploadShowFlag,
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
      let rightFileList = [];
      if (rightAttachmentUUID) {
        const rightFileListRes = await queryFileList({
          tenantId,
          bucketName,
          attachmentUUID: rightAttachmentUUID,
        });
        if (getResponse(rightFileListRes)) {
          rightFileList = rightFileListRes;
        }
      }
      if (getResponse(fileList)) {
        state = {
          ...state,
          fileList: this.changeFileList(fileList),
          rightList: rightFileList, // todo
        };
        if (this.upload) {
          this.upload.setFileList(this.changeFileList(fileList));
        }
        if (this.rightUpload && Array.isArray(rightFileList) && rightFileList.length > 0) {
          this.rightUpload.setFileList(this.changeFileList(rightFileList));
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
   * @memberof UploadModal
   */
  @Bind()
  removeFile(file) {
    const {
      removeCallback,
      bucketName = DEFAULT_BUCKET_NAME,
      tenantId,
      attachmentUUID,
    } = this.props;
    const { attachmentUUID: stateAttachmentUUID, fileList } = this.state;
    this.setState({
      modalLoading: true,
    });
    if (file.url) {
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
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
          return true;
        } else {
          this.setState({
            modalLoading: false,
          });
          return false;
        }
      });
    } else {
      this.setState({
        modalLoading: false,
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
  }

  @Bind()
  getPreviewUrl(url) {
    const vars = url ? url.split('&') : [];
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === 'url') {
        return pair[1];
      }
    }
    return false;
  }

  @Bind()
  handlePreviewFile(item) {
    const { bucketName, storageCode } = this.props;
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
    const url = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/${
          newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
        }`
      : `${HZERO_FILE}/v1/${
          newUrlPreviewList.includes(fileExt) ? 'file/preview' : 'file-preview/by-url'
        }`;
    window.open(
      `${url}?url=${fileUrl}&bucketName=${bucketName}${
        storageCode ? `&storageCode=${storageCode}` : ''
      }&access_token=${getAccessToken()}`
    );
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
        title = intl.get('entity.attachment.tag.spcm').d('附件'),
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
    const { rightList } = this.state;
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
              style={{ color: '#108ee9' }}
              href={tpl.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tpl.name}
            </a>
          </Tag>
        );
      });
      const message = (
        <React.Fragment>
          <div>{description}</div>
          <div>
            {hasTemplate && (
              <span>
                {intl.get('hzero.common.upload.template').d('附件模板')}: {templateLinks}{' '}
              </span>
            )}
          </div>
        </React.Fragment>
      );

      descriptionBlock = (
        <Alert
          showIcon
          message={message}
          style={{ marginRight: '8px', marginBottom: '15px' }}
          type="info"
        />
      );
    }
    const leftComponent = (
      <div style={{ display: loading ? 'none' : '', overflow: 'hidden' }}>
        {descriptionBlock}
        <Spin spinning={modalLoading}>
          <UploadButton
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
    );
    const rightComponent = (
      <div style={{ display: loading ? 'none' : '', overflow: 'hidden' }}>
        {descriptionBlock}
        <Spin spinning={modalLoading}>
          <UploadButton
            handlePreviewFile={this.handlePreviewFile}
            viewOnly
            listType="picture-card"
            onPreview={this.handlePreview}
            onRef={(upload) => {
              this.rightUpload = upload;
            }}
            tenantId={tenantId}
            action={action}
            filePreview
            uploadShowFlag={uploadShowFlag}
            fileInputClick={this.delayClickInput}
            {...otherProps}
            attachmentUUID={attachmentUUID || stateAttachmentUUID}
          />
        </Spin>
      </div>
    );
    const modalContent = (
      <React.Fragment>
        {loading && (
          <div style={{ textAlign: 'center', padding: '30px 50px' }}>
            <Spin />
          </div>
        )}
        <Row gutter={24}>
          <Col span={12}>
            <p>{intl.get(`spcm.common.attachment.toBeSigned`).d('待签署附件')}:</p>
            {leftComponent}
          </Col>
          <Col span={12}>
            <p>{intl.get(`spcm.common.attachment.Signed`).d('已签署附件')}:</p>
            {rightComponent}
          </Col>
        </Row>
      </React.Fragment>
    );

    const viewerContainerCls = classnames(
      styles['viewer-container'],
      { [styles['viewer-container-show']]: previewVisible },
      fileViewerClassName
    );
    const fileListAndRight = [].concat(rightList, fileList);
    const uploadContent = uploadShowFlag ? (
      modalContent
    ) : (
      <>
        {isEmpty(btnProps) ? (
          <a onClick={this.openUploadModal}>
            {isString(icon) ? <Icon type={icon} /> : icon}
            {btnText}
            {showFilesNumber &&
              ((filesNumber && filesNumber !== 0) || (fileListAndRight || []).length > 0) && (
                <Tag className={styles.filesNumber}>
                  {filesNumber && filesNumber !== 0 ? filesNumber : fileListAndRight.length}
                </Tag>
              )}
          </a>
        ) : (
          <Popover
            content={intl.get('spcm.common.view.button.uploadNum').d(`文件最多上传4个`)}
            placement="bottomLeft"
            trigger="hover"
          >
            <Button onClick={this.openUploadModal} {...btnProps}>
              {btnText}
              {showFilesNumber &&
                ((filesNumber && filesNumber !== 0) || (fileListAndRight || []).length > 0) && (
                  <Tag className={styles.filesNumber}>
                    {filesNumber && filesNumber !== 0 ? filesNumber : fileListAndRight.length}
                  </Tag>
                )}
            </Button>
          </Popover>
        )}
        <Modal
          visible={visible}
          title={title}
          width={700}
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
