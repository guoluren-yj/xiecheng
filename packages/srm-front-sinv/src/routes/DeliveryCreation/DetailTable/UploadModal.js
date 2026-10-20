/*
 * Attachment - 详情页面附件上传模态框
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Row, Col, Upload, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isString } from 'lodash';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';
import notification from 'utils/notification';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken, getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';

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
  constructor(props) {
    super(props);
    this.state = {
      approvedFileList: [],
      reviewFileList: [],
      otherFileList: [],
      supplierFileList: [],
      previewImages: [], // 预览数据
      previewVisible: false, // 预览显示
      //   attachmentUUID: attachmentUUID || onBindUuidToHeader(),
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
    };
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
    const { bucketName = 'private-bucket', bucketDirectory = 'sodr-order' } = this.props;
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

  componentDidMount() {
    this.queryAttachmentList();
  }

  /**
   * 查询双方附件列表
   */
  @Bind()
  queryAttachmentList() {
    // const { supplierAttachmentId } = this.props;
    const {
      supplierAttachmentUuid,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
    } = this.props;
    if (approveAttachmentUuid) {
      this.queryPurchaserAttachmentList(approveAttachmentUuid, 'approveAttachmentUuid');
    }
    if (reviewAttachmentUuid) {
      this.queryPurchaserAttachmentList(reviewAttachmentUuid, 'reviewAttachmentUuid');
    }
    if (otherAttachmentUuid) {
      this.queryPurchaserAttachmentList(otherAttachmentUuid, 'otherAttachmentUuid');
    }
    if (supplierAttachmentUuid) {
      this.querySupplierAttachmentList();
    }
  }

  /**
   * 获取采购方附件
   */
  @Bind()
  queryPurchaserAttachmentList(val, type) {
    const { bucketName } = this.props;
    const { onFetchPurchaserAttachmentList } = this.props;
    // const { attachmentUUID } = this.state;
    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID: val,
        bucketName: bucketName || 'private-bucket',
      }).then((res) => {
        if (res) {
          //   const { reviewFileList, otherFileList, approvedFileList } = this.state;
          switch (type) {
            case 'approveAttachmentUuid':
              this.setState({ approvedFileList: this.changeFileList(res) }); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            case 'reviewAttachmentUuid':
              this.setState({ reviewFileList: this.changeFileList(res) }); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            case 'otherAttachmentUuid':
              this.setState({ otherFileList: this.changeFileList(res) }); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            default:
              return '';
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
    const { onFetchSupplierAttachmentList, supplierAttachmentUuid } = this.props;
    if (isFunction(onFetchSupplierAttachmentList)) {
      onFetchSupplierAttachmentList({
        attachmentUUID: supplierAttachmentUuid,
        bucketName: 'private-bucket',
      }).then((res) => {
        if (res) {
          this.setState({ supplierFileList: this.changeFileList(res) });
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

  /**
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    const { supplierAttachmentUuid, bucketDirectory = 'sodr-order' } = this.props;
    return {
      bucketName: 'private-bucket',
      directory: bucketDirectory,
      fileName: file.name,
      attachmentUUID: supplierAttachmentUuid,
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
    const { tenantId, supplierFileList } = this.state;
    const { bucketName = 'private-bucket', bucketDirectory = 'sodr-order' } = this.props;
    const { status, response } = file;
    let list = [...fileList];
    if (status === 'done') {
      if (response.type === 'error') {
        notification.warning({ message: response?.message });
        const fileLists = supplierFileList.filter(
          (f) => f.status === 'done' && f.response.type !== 'error'
        );
        this.setState({
          supplierFileList: fileLists,
        });
        return;
      } else {
        notification.success();
        list = fileList.map((f) => {
          if (f.uid === file.uid) {
            // eslint-disable-next-line
            f.url = getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory);
          }
          return f;
        });
      }
    } else if (status === 'error') {
      const {
        response: { message },
      } = file;
      notification.error({ message });
      const fileLists = supplierFileList.filter((f) => f.status === 'done');
      this.setState({
        supplierFileList: fileLists,
      });
      return;
    }
    this.setState({
      supplierFileList: list,
    });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file) {
    const { supplierFileList } = this.state;
    const { onRemoveAttachment, supplierAttachmentUuid } = this.props;
    if (isFunction(onRemoveAttachment) && file.url) {
      onRemoveAttachment({
        bucketName: 'private-bucket',
        urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || '',
        attachmentUUID: supplierAttachmentUuid,
      }).then((res) => {
        if (res) {
          this.setState({
            supplierFileList: supplierFileList.filter((o) => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  render() {
    const { hideAttachment = (e) => e } = this.props;
    const {
      approvedFileList,
      reviewFileList,
      otherFileList,
      supplierFileList,
      previewVisible,
      previewImages,
      accessToken,
      tenantId,
    } = this.state;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const attachmentModalProps = {
      footer: null,
      visible: true,
      title: intl.get(`entity.attachment.tag`).d('附件'),
      onOk: hideAttachment,
      onCancel: hideAttachment,
      width: 1000,
    };
    const downloadProps = {
      listType: 'picture-card',
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const uploadProps = {
      headers,
      FileList: supplierFileList,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      data: this.uploadData,
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onUploadChange,
      onRemove: this.onUploadRemove,
      onPreview: this.handlePreview,
      showUploadList: {
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录？'),
      },
    };
    const modalContent = (
      //   <Spin spinning={loading}>
      <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
        <Col span={12}>
          <Row>
            <Row>
              <Col>
                <p>{intl.get(`sinv.common.purchasersAuditAttachment`).d('采购方审核附件')}：</p>
                <Upload {...downloadProps} fileList={approvedFileList} />
              </Col>
            </Row>
            <Row>
              <Col>
                <p>
                  {intl.get(`sinv.common.view.purchaserReviewAttachment`).d('采购方复核附件')}：
                </p>
                <Upload {...downloadProps} fileList={reviewFileList} />
              </Col>
            </Row>
            <Row>
              <Col>
                <p>{intl.get(`sinv.common.view.otherAttachment`).d('采购方其他附件')}：</p>
                <Upload {...downloadProps} fileList={otherFileList} />
              </Col>
            </Row>
          </Row>
        </Col>
        <Col span={12}>
          <Col>
            <p>{intl.get(`sinv.common.view.supplierAttachment`).d('供应商附件')}：</p>
            <Upload {...uploadProps} fileList={supplierFileList}>
              <div>
                <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
              </div>
            </Upload>
          </Col>
        </Col>
      </Row>
      //   </Spin>
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
