/*
 * Attachment - 详情页面附件上传
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Row, Col, Icon, Spin, Tag, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, isFunction, isString, isEqual } from 'lodash';
import Viewer from 'react-viewer';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import 'react-viewer/dist/index.css';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken, getCurrentOrganizationId } from 'utils/utils';

import {
  BUCKET_NAME,
  PURCHASER_EXTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
} from '@/routes/components/utils/constant';

// const DEFAULT_BUCKET_NAME = 'sodr-order';
// const BUCKET_DIRCTORY = 'sodr-order';
/**
 * attachment - 附件组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @return React.element
 */
export default class Attachment extends Component {
  state = {
    fileList: [], // 从数据库获取到的文件列表
    receivedFileList: [], // 供应商附件列表
    previewImages: [], // 预览数据
    previewVisible: false, // 预览显示
    visible: false,
    attachmentUUID: '',
    isReqStatus: false, // 是否允许请求
    tenantId: getCurrentOrganizationId(),
    accessToken: getAccessToken(),
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { attachmentUUID: preUuid } = prevState;
    const { attachmentUUID } = nextProps;
    if (attachmentUUID && attachmentUUID !== preUuid) {
      return { attachmentUUID };
    } else {
      return null;
    }
  }

  getSnapshotBeforeUpdate(nextProps, prevState) {
    const { visible, attachmentUUID: preUuid } = prevState;
    const { attachmentUUID } = nextProps;
    if (!visible && !attachmentUUID) return 'init';
    if (!visible || attachmentUUID !== preUuid) return 'fetch';
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { onBindUuidToHeader } = this.props;
    if (snapshot === 'init' && isFunction(onBindUuidToHeader)) {
      onBindUuidToHeader();
      this.queryAttachmentList();
    } else if (snapshot === 'fetch' && !this.state.isReqStatus) {
      this.queryAttachmentList();
    }
  }

  componentDidMount() {
    this.queryAttachmentList();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { filesNumber } = nextProps;
    if (isEqual(this.state, nextState) && isEqual(filesNumber, this.props.filesNumber)) {
      return false;
    }
    return true;
  }

  /**
   * 查询双方附件列表
   */
  @Bind()
  queryAttachmentList() {
    const { supplierAttachmentId } = this.props;
    const { attachmentUUID } = this.state;
    if (attachmentUUID) {
      this.queryPurchaserAttachmentList();
    }
    if (supplierAttachmentId) {
      this.querySupplierAttachmentList();
    }
  }

  /**
   * 获取采购方附件
   */
  @Bind()
  queryPurchaserAttachmentList() {
    const { onFetchPurchaserAttachmentList } = this.props;
    const { attachmentUUID } = this.state;
    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID,
        bucketName: BUCKET_NAME,
        bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      }).then((res) => {
        if (res) {
          // const file = res.map(item => {
          //   return {
          //     uid: `${new Date().valueOf()}${random(0, 1000)}`,
          //     name: item.fileName,
          //     type: item.fileType,
          //     status: 'done',
          //     size: item.fileSize,
          //     response: item.fileUrl,
          //   };
          // });
          this.setState({ fileList: this.changeFileList(res), isReqStatus: true }); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
          if (this.uploadOne) {
            this.uploadOne.setFileList(this.changeFileList(res));
          }
        }
      });
    }
  }

  /**
   * 获取供应商附件
   */
  @Bind()
  querySupplierAttachmentList() {
    const { onFetchSupplierAttachmentList, supplierAttachmentId } = this.props;
    if (isFunction(onFetchSupplierAttachmentList)) {
      onFetchSupplierAttachmentList({
        attachmentUUID: supplierAttachmentId,
        bucketName: BUCKET_NAME,
        bucketDirectory: SUPPLIER_DIRECTORY,
      }).then((res) => {
        if (res) {
          this.setState({ receivedFileList: this.changeFileList(res) });
          if (this.uploadTwo) {
            this.uploadTwo.setFileList(this.changeFileList(res));
          }
        }
      });
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
  changeFileList(response = []) {
    // const { bucketName = DEFAULT_BUCKET_NAME } = this.props;

    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: this.getUrl(res.fileUrl),
      };
    });
  }

  /**
   * 根据fileUrl获取upload需要的url
   * @param {*} url
   * @param {*} [tenantId=getCurrentOrganizationId()]
   * @param {*} bucketDirectory
   * @returns neededUrl
   */
  @Bind()
  getUrl(url, tenantId = this.state.tenantId, bucketDirectory) {
    const accessToken = getAccessToken();
    const { bucketName = BUCKET_NAME } = this.props;
    return `${HZERO_FILE}/v1${
      !isUndefined(tenantId) ? `/${tenantId}/` : '/'
    }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
      !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
    }url=${encodeURIComponent(url)}`;
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true, isReqStatus: false });
  }

  /**
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    const { attachmentUUID } = this.state;
    return {
      bucketName: BUCKET_NAME,
      fileName: file.name,
      attachmentUUID,
    };
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false, isReqStatus: false });
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   * @param {Array} files // 已经存在的附件
   */
  // @Bind()
  // beforeUpload(file) {
  //   // const { fileList } = this.state;
  //   const { fileSize = 10 * 1024 * 1024 } = this.props;
  //   if (file.size > fileSize) {
  //     file.status = 'error'; // eslint-disable-line
  //     const res = {
  //       message: intl
  //         .get(`hzero.common.upload.error.size`, {
  //           fileSize: fileSize / (1024 * 1024),
  //         })
  //         .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
  //     };
  //     file.response = res; // eslint-disable-line
  //     return false;
  //   }
  //   // this.setState({
  //   //   fileList: [...fileList, ...files],
  //   // });
  //   return true;
  // }

  /**
   * 附件变更
   * @param {Object} {info, fileList}
   */
  @Bind()
  onUploadChange({ file, fileList }) {
    const { tenantId } = this.state;
    const { bucketName = BUCKET_NAME, bucketDirectory } = this.props;
    const { status } = file;
    const accessToken = getAccessToken();
    let list = [...fileList];
    if (status === 'done') {
      notification.success();
      list = fileList.map((f) => {
        if (f.uid === file.uid) {
          // f.url = file.response;
          // eslint-disable-next-line
          f.url = `${HZERO_FILE}/v1${
            !isUndefined(tenantId) ? `/${tenantId}/` : '/'
          }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
            !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
          }url=${f.response}`;
        }
        return f;
      });
    } else if (status === 'error') {
      notification.error();
    }
    this.setState({
      fileList: list,
    });
  }

  // 上传成功的回调
  @Bind()
  onUploadSuccess() {
    this.queryAttachmentList();
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file) {
    const { fileList, attachmentUUID } = this.state;
    const { onRemoveAttachment } = this.props;
    if (isFunction(onRemoveAttachment)) {
      return onRemoveAttachment({
        bucketName: BUCKET_NAME,
        bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
        urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || '',
        attachmentUUID,
      }).then((res) => {
        if (res) {
          this.setState({
            fileList: fileList.filter((o) => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewImages: [
        {
          src: file.url || file.thumbUrl,
          alt: '', // 由于下方会显示 alt 所以这里给空字符串 file.name,
        },
      ],
      previewVisible: true,
    });
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

  render() {
    const {
      loading,
      bucketName,
      // bucketDirectory,
      attachmentUUID,
      supplierAttachmentId,
      showFilesNumber = false,
      filesNumber = 0,
      btnProps = { style: { color: '#000' }, icon: 'paper-clip' },
    } = this.props;
    const {
      receivedFileList,
      fileList,
      visible,
      tenantId,
      previewVisible,
      previewImages,
      accessToken,
    } = this.state;
    const { icon = 'paper-clip', btnText = intl.get('entity.attachment.tag').d('附件') } = btnProps;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const attachmentModalProps = {
      visible,
      title: intl.get(`entity.attachment.tag`).d('附件'),
      onOk: this.hideAttachment,
      onCancel: this.hideAttachment,
      width: 1000,
    };
    const uploadProps = {
      // fileSize: 100 * 1024 * 1024,
      headers,
      fileList,
      name: 'file',
      listType: 'picture-card',
      bucketName,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      multiple: true,
      filePreview: true,
      attachmentUUID,
      // data: this.uploadData,
      onRef: (ref) => {
        this.uploadOne = ref;
      },
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      // beforeUpload: this.beforeUpload,
      // onChange: this.onUploadChange,
      onUploadSuccess: this.onUploadSuccess,
      onRemove: this.onUploadRemove,
      onPreview: this.handlePreview,
      showUploadList: {
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
      },
    };
    const downloadProps = {
      headers,
      bucketName,
      viewOnly: true,
      bucketDirectory: SUPPLIER_DIRECTORY,
      onRef: (ref) => {
        this.uploadTwo = ref;
      },
      listType: 'picture-card',
      fileList: receivedFileList,
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
      },
      attachmentUUID: supplierAttachmentId,
    };
    const uploadLinkButton = (
      <React.Fragment>
        {isEmpty(btnProps) ? (
          <a onClick={this.openUploadModal}>
            {icon && <Icon type={icon} />}
            {btnText}
          </a>
        ) : (
          <Button onClick={this.openUploadModal} {...btnProps}>
            {btnText}
            {showFilesNumber &&
              ((filesNumber && filesNumber !== 0) ||
                fileList.length + receivedFileList.length > 0) && (
                <Tag
                  color="#108ee9"
                  style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                >
                  {filesNumber && filesNumber !== 0
                    ? filesNumber
                    : fileList.length + receivedFileList.length}
                </Tag>
              )}
          </Button>
        )}
      </React.Fragment>
    );
    const modalContent = (
      <Spin spinning={loading}>
        <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}：</p>
            <UploadButton {...uploadProps}>
              <div>
                <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
              </div>
            </UploadButton>
          </Col>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
            <UploadButton {...downloadProps} />
          </Col>
        </Row>
      </Spin>
    );
    return (
      <React.Fragment>
        {uploadLinkButton}
        <Modal {...attachmentModalProps}>{modalContent}</Modal>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={this.handlePreviewCancel}
          images={previewImages}
        />
      </React.Fragment>
    );
  }
}
