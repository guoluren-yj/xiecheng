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
import styles from './index.less';

import { BUCKET_NAME } from '@/routes/components/utils/constant';
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
    const {
      approveAttachmentUuid,
      reviewAttachmentUuid,
      otherAttachmentUuid,
      onBindUuidToHeader = (e) => e,
    } = props;
    this.state = {
      fileList: [], // 从数据库获取到的文件列表
      fileListReview: [], // 采购方审核附件列表
      fileListOther: [], // 采购方复核附件列表
      receivedFileList: [], // 供应商附件列表
      receivedFileListOther: [], // 供应商其它附件列表
      previewImages: [], // 预览数据
      previewVisible: false, // 预览显示
      approveAttachmentUuid: approveAttachmentUuid || onBindUuidToHeader(),
      reviewAttachmentUuid: reviewAttachmentUuid || onBindUuidToHeader(),
      otherAttachmentUuid: otherAttachmentUuid || onBindUuidToHeader(),
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
    };
  }

  componentDidMount() {
    this.queryAttachmentList();
  }

  /**
   * 查询双方附件列表
   */
  @Bind()
  queryAttachmentList() {
    const { supplierAttaUuid, supplierAttachmentUuid } = this.props;
    const { approveAttachmentUuid, reviewAttachmentUuid, otherAttachmentUuid } = this.state;
    if (approveAttachmentUuid) {
      this.queryPurchaserAttachmentList(approveAttachmentUuid, 'purchaserAuditAttachment');
    }
    if (reviewAttachmentUuid) {
      this.queryPurchaserAttachmentList(reviewAttachmentUuid, 'purchaserReviewAttachment');
    }
    if (otherAttachmentUuid) {
      this.queryPurchaserAttachmentList(otherAttachmentUuid, 'purchaserOtherAttachment');
    }
    if (supplierAttaUuid) {
      this.querySupplierAttachmentList(supplierAttaUuid, 'supplierAttachmentId');
    }
    if (supplierAttachmentUuid) {
      this.querySupplierAttachmentList(supplierAttachmentUuid, 'supplierOtherAttachment');
    }
  }

  /**
   * 获取采购方附件
   */
  @Bind()
  queryPurchaserAttachmentList(attachmentUUID, upload) {
    const { bucketName } = this.props;
    const { onFetchPurchaserAttachmentList } = this.props;
    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID,
        bucketName: bucketName || BUCKET_NAME,
      }).then((res) => {
        if (res) {
          switch (upload) {
            case 'purchaserAuditAttachment':
              if (this.purchaserAuditAttachment) {
                this.purchaserAuditAttachment.setFileList(this.changeFileList(res));
              }
              break;
            case 'purchaserReviewAttachment':
              if (this.purchaserReviewAttachment) {
                this.purchaserReviewAttachment.setFileList(this.changeFileList(res));
              }
              break;
            case 'purchaserOtherAttachment':
              if (this.purchaserOtherAttachment) {
                this.purchaserOtherAttachment.setFileList(this.changeFileList(res));
              }
              break;
            default:
          }
        }
      });
    }
  }

  /**
   * 获取供应商附件
   */
  @Bind()
  querySupplierAttachmentList(supplierAttachmentId, upload) {
    const { onFetchSupplierAttachmentList } = this.props;
    if (isFunction(onFetchSupplierAttachmentList)) {
      onFetchSupplierAttachmentList({
        attachmentUUID: supplierAttachmentId,
        bucketName: BUCKET_NAME,
      }).then((res) => {
        if (res) {
          switch (upload) {
            case 'supplierAttachmentId':
              if (this.supplierAttachmentId) {
                this.supplierAttachmentId.setFileList(this.changeFileList(res));
              }
              break;
            case 'supplierOtherAttachment':
              if (this.supplierOtherAttachment) {
                this.supplierOtherAttachment.setFileList(this.changeFileList(res));
              }
              break;
            default:
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
    const { bucketName = BUCKET_NAME, bucketDirectory = 'sodr-order' } = this.props;
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
      hideAttachment,
      approveAttachmentUuid,
      reviewAttachmentUuid,
      otherAttachmentUuid,
      supplierAttachmentUuid,
      supplierAttaUuid,
      bucketName,
      bucketDirectory,
      loading,
    } = this.props;
    const {
      fileList,
      fileListReview,
      fileListOther,
      receivedFileList,
      receivedFileListOther,
      tenantId,
      previewVisible,
      previewImages,
      accessToken,
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
      className: styles['ant-modal-wrap'],
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
      bucketDirectory,
      attachmentUUID: undefined,
      onRef: (ref) => {
        this.purchaserAuditAttachment = ref;
      },
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
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
    const uploadPropsReview = {
      headers,
      tenantId,
      name: 'file',
      viewOnly: true,
      filePreview: true,
      listType: 'picture-card',
      multiple: true,
      bucketName,
      bucketDirectory,
      attachmentUUID: undefined,
      onRef: (ref) => {
        this.purchaserReviewAttachment = ref;
      },
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
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
    const uploadPropsOther = {
      headers,
      tenantId,
      name: 'file',
      viewOnly: true,
      filePreview: true,
      listType: 'picture-card',
      multiple: true,
      bucketName,
      bucketDirectory,
      attachmentUUID: undefined,
      onRef: (ref) => {
        this.purchaserOtherAttachment = ref;
      },
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
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
      filePreview: true,
      bucketDirectory,
      onRef: (ref) => {
        this.supplierAttachmentId = ref;
      },
      attachmentUUID: undefined,
      fileList: receivedFileList,
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
        showReUploadIcon: false,
      },
    };
    const downloadPropsOther = {
      listType: 'picture-card',
      bucketName,
      viewOnly: true,
      filePreview: true,
      bucketDirectory,
      onRef: (ref) => {
        this.supplierOtherAttachment = ref;
      },
      attachmentUUID: undefined,
      fileList: receivedFileListOther,
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
        showReUploadIcon: false,
      },
    };
    const modalContent = (
      <Spin spinning={loading}>
        <Row gutter={20}>
          <Col span={12}>
            <p>{intl.get(`sodr.common.view.purchaserAuditAttachment`).d('采购方附件')}：</p>
            <UploadButton {...uploadProps} attachmentUUID={approveAttachmentUuid}>
              {fileList.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
          <Col span={12}>
            <p>{intl.get(`sodr.common.model.common.supplierAttachmentId`).d('供应商附件')}：</p>
            <UploadButton {...downloadPropsOther} attachmentUUID={supplierAttaUuid}>
              {receivedFileList.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <p>{intl.get(`sodr.common.view.purchaserReviewAttachment`).d('采购方复核附件')}：</p>
            <UploadButton {...uploadPropsReview} attachmentUUID={reviewAttachmentUuid}>
              {fileListReview.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
          <Col span={12}>
            <p>
              {intl.get(`sodr.common.model.sendOrder.supplierOtherAttachment`).d('供应商其它附件')}
              ：
            </p>
            <UploadButton {...downloadProps} attachmentUUID={supplierAttachmentUuid}>
              {receivedFileListOther.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <p>{intl.get(`sodr.common.view.purchaserOtherAttachment`).d('采购方其它附件')}：</p>
            <UploadButton {...uploadPropsOther} attachmentUUID={otherAttachmentUuid}>
              {fileListOther.length >= 0 ? null : (
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
