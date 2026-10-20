/*
 * Attachment - 详情页面附件上传模态框
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Icon, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { isFunction, isString } from 'lodash';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken, getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';

import {
  BUCKET_NAME,
  PURCHASER_EXTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
} from '@/routes/components/utils/constant';
/**
 * attachment - 附件组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @return React.element
 */
export default class Attachment extends PureComponent {
  constructor(props) {
    super(props);
    const { attachmentUUID, onBindUuidToHeader = (e) => e } = props;
    this.state = {
      fileList: [], // 从数据库获取到的文件列表
      receivedFileList: [], // 供应商附件列表
      previewImages: [], // 预览数据
      previewVisible: false, // 预览显示
      attachmentUUID: attachmentUUID || onBindUuidToHeader(),
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const { attachmentUUID: preUuid } = prevState;
  //   const { attachmentUUID } = nextProps;
  //   if (attachmentUUID && attachmentUUID !== preUuid) {
  //     return { attachmentUUID };
  //   } else {
  //     return null;
  //   }
  // }

  // getSnapshotBeforeUpdate(nextProps, prevState) {
  //   const { visible, attachmentUUID: preUuid } = prevState;
  //   const { attachmentUUID } = nextProps;
  //   if (!visible && !attachmentUUID) return 'init';
  //   if (!visible || attachmentUUID !== preUuid) return 'fetch';
  //   return null;
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   const { onBindUuidToHeader } = this.props;
  //   if (snapshot === 'init' && isFunction(onBindUuidToHeader)) {
  //     onBindUuidToHeader();
  //   } else if (snapshot === 'fetch') {
  //     this.queryAttachmentList();
  //   }
  // }

  componentDidMount() {
    this.queryAttachmentList();
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
    const { bucketName } = this.props;
    const { onFetchPurchaserAttachmentList } = this.props;
    const { attachmentUUID } = this.state;
    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID,
        bucketName: bucketName || BUCKET_NAME,
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
          // this.setState({ fileList: this.changeFileList(res) }); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
          if (this.uploadOne) {
            this.uploadOne.setFileList(this.changeFileList(res, PURCHASER_EXTERNAL_DIRECTORY));
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
      }).then((res) => {
        if (res) {
          // this.setState({ receivedFileList: this.changeFileList(res) });
          if (this.uploadTwo) {
            this.uploadTwo.setFileList(this.changeFileList(res, SUPPLIER_DIRECTORY));
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
  changeFileList(response = [], bucketDirectory) {
    const { bucketName = BUCKET_NAME } = this.props;
    const { tenantId } = this.state;
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
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    const { attachmentUUID } = this.state;
    const { bucketDirectory = 'sodr-order' } = this.props;
    return {
      bucketName: BUCKET_NAME,
      directory: bucketDirectory,
      fileName: file.name,
      attachmentUUID,
    };
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   * @param {Array} files // 已经存在的附件
   */
  @Bind()
  beforeUpload(file) {
    // const { fileList } = this.state;
    const { fileSize = 10 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    // this.setState({
    //   fileList: [...fileList, ...files],
    // });
    return true;
  }

  /**
   * 附件变更
   * @param {Object} {info, fileList}
   */
  @Bind()
  onUploadChange({ file, fileList }) {
    const { tenantId } = this.state;
    const { bucketName = BUCKET_NAME, bucketDirectory = 'sodr-order' } = this.props;
    const { status } = file;
    let list = [...fileList];
    if (status === 'done') {
      notification.success();
      list = fileList.map((f) => {
        if (f.uid === file.uid) {
          // f.url = file.response;
          // eslint-disable-next-line
          f.url = getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory);
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
      hideAttachment = (e) => e,
    } = this.props;
    const {
      receivedFileList,
      fileList,
      tenantId,
      previewVisible,
      previewImages,
      accessToken,
      // attachmentUUID,
    } = this.state;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const attachmentModalProps = {
      visible: true,
      title: intl.get(`entity.attachment.tag`).d('附件'),
      onOk: hideAttachment,
      onCancel: hideAttachment,
      width: 1000,
    };
    const uploadProps = {
      headers,
      tenantId,
      name: 'file',
      viewOnly: true,
      filePreview: true,
      listType: 'picture-card',
      multiple: true,
      bucketName,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      attachmentUUID,
      onRef: (ref) => {
        this.uploadOne = ref;
      },
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      // beforeUpload: this.beforeUpload,
      onRemove: this.onUploadRemove,
      onPreview: this.handlePreview,
      showUploadList: {
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录?'),
        showRemoveIcon: false,
        showReUploadIcon: false,
      },
    };
    const downloadProps = {
      listType: 'picture-card',
      bucketName,
      viewOnly: true,
      bucketDirectory: SUPPLIER_DIRECTORY,
      onRef: (ref) => {
        this.uploadTwo = ref;
      },
      attachmentUUID: supplierAttachmentId,
      fileList: receivedFileList,
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
        showReUploadIcon: false,
      },
    };
    const modalContent = (
      <Spin spinning={loading}>
        <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}：</p>
            <UploadButton {...uploadProps}>
              {fileList.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
            <UploadButton {...downloadProps}>
              {receivedFileList.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
        </Row>
      </Spin>
    );
    return (
      <React.Fragment>
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
