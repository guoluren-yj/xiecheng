/* eslint-disable no-unused-expressions */
/*
 * Attachment - 详情页面附件上传模态框
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isString } from 'lodash';
import Viewer from 'react-viewer';
import notification from 'utils/notification';
import 'react-viewer/dist/index.css';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken, getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import UploadButton from '_components/Upload/UploadButton';
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
    this.state = {
      approvedFileList: [],
      reviewFileList: [],
      otherFileList: [],
      supplierFileList: [],
      previewImages: [], // 预览数据
      previewVisible: false, // 预览显示
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
    const { bucketName = 'private-bucket', bucketDirectory = 'sinv-delivery' } = this.props;
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
    const {
      supplierAttachmentUuid,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      supplierAttaUuid,
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
      this.querySupplierAttachmentList(supplierAttachmentUuid, 'supplierAttachmentUuid');
    }
    if (supplierAttaUuid) {
      this.querySupplierAttachmentList(supplierAttaUuid, 'supplierAttaUuid');
    }
  }

  /**
   * 获取采购方附件
   */
  // @Bind()
  queryPurchaserAttachmentList(val, type) {
    const { bucketName } = this.props;
    const { onFetchPurchaserAttachmentList } = this.props;
    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID: val,
        bucketName: bucketName || 'private-bucket',
      }).then((res) => {
        if (res) {
          switch (type) {
            case 'approveAttachmentUuid':
              this.refFormApp && this.refFormApp.setFileList(this.changeFileList(res)); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            case 'reviewAttachmentUuid':
              this.refForms && this.refForms.setFileList(this.changeFileList(res)); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            case 'otherAttachmentUuid':
              this.refForm && this.refForm.setFileList(this.changeFileList(res)); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
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
  querySupplierAttachmentList(val, type) {
    const { onFetchSupplierAttachmentList } = this.props;
    if (isFunction(onFetchSupplierAttachmentList)) {
      onFetchSupplierAttachmentList({
        attachmentUUID: val,
        bucketName: 'private-bucket',
      }).then((res) => {
        if (res) {
          switch (type) {
            case 'supplierAttachmentUuid':
              this.refFormList && this.refFormList.setFileList(this.changeFileList(res));
              break;
            case 'supplierAttaUuid':
              this.refOtherList && this.refOtherList.setFileList(this.changeFileList(res));
              break;
            default:
              return '';
          }
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
    const { approveAttachmentUuid } = this.props;
    const { bucketDirectory = 'sinv-delivery' } = this.props;
    return {
      bucketName: 'private-bucket',
      directory: bucketDirectory,
      fileName: file.name,
      attachmentUUID: approveAttachmentUuid,
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
    const { tenantId, approvedFileList } = this.state;
    const { bucketName = 'private-bucket', bucketDirectory = 'sinv-delivery' } = this.props;
    const { status, response } = file;
    let list = [...fileList];
    if (status === 'done') {
      if (response.type === 'error') {
        notification.warning({ message: response?.message });
        const fileLists = approvedFileList.filter(
          (f) => f.status === 'done' && f.response.type !== 'error'
        );
        this.setState({
          approvedFileList: fileLists,
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
      const fileLists = approvedFileList.filter((f) => f.status === 'done');
      this.setState({
        approvedFileList: fileLists,
      });
      return;
    }
    this.setState({
      approvedFileList: list,
    });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file) {
    const { approvedFileList } = this.state;
    const { onRemoveAttachment, approveAttachmentUuid } = this.props;
    if (isFunction(onRemoveAttachment) && file.url) {
      return onRemoveAttachment({
        bucketName: 'private-bucket',
        bucketDirectory: 'sinv-delivery',
        urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || '',
        attachmentUUID: approveAttachmentUuid,
      }).then((res) => {
        if (res) {
          this.setState({
            approvedFileList: approvedFileList.filter((o) => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  render() {
    const {
      bucketName,
      bucketDirectory,
      hideAttachment = (e) => e,
      approveAttachmentUuid,
    } = this.props;
    const {
      approvedFileList,
      supplierFileList,
      reviewFileList,
      otherFileList,
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
    const downatProps = {
      headers,
      bucketName,
      bucketDirectory,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      onPreview: this.handlePreview,
      ref: (ref) => {
        this.refForm = ref;
      },
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const downloadProps = {
      bucketName,
      bucketDirectory,
      listType: 'picture-card',
      ref: (ref) => {
        this.refForms = ref;
      },
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const uploadProps = {
      headers,
      approvedFileList,
      bucketName,
      bucketDirectory,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      attachmentUUID: approveAttachmentUuid,
      ref: (ref) => {
        this.refFormApp = ref;
      },
      // afterOpenUploadModal: this.afterOpenHeaderUploadModal,
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
      // onChange: this.onUploadChange,
      onRemove: this.onUploadRemove,
      onPreview: this.handlePreview,
      showUploadList: {
        removePopConfirmTitle: intl
          .get('hzero.common.message.confirm.delete')
          .d('是否删除此条记录？'),
      },
    };
    const downinProps = {
      bucketName,
      bucketDirectory,
      listType: 'picture-card',
      multiple: true,
      onPreview: this.handlePreview,
      ref: (ref) => {
        this.refFormList = ref;
      },
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const downinOtherProps = {
      bucketName,
      bucketDirectory,
      listType: 'picture-card',
      multiple: true,
      onPreview: this.handlePreview,
      ref: (ref) => {
        this.refOtherList = ref;
      },
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const modalContent = (
      //   <Spin spinning={loading}>
      <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
        <Col span={12}>
          <Row>
            <Row>
              <Col>
                <p>{intl.get(`sinv.common.view.purchaserAuditAttachment`).d('采购方审核附件')}：</p>
                <UploadButton {...uploadProps} fileList={approvedFileList}>
                  <div>
                    <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                  </div>
                </UploadButton>
              </Col>
            </Row>
            <Row>
              <Col>
                <p>
                  {intl.get(`sinv.common.view.purchaserReviewAttachment`).d('采购方复核附件')}：
                </p>
                <UploadButton {...downloadProps} fileList={reviewFileList} viewOnly />
              </Col>
            </Row>
            <Row>
              <Col>
                <p>{intl.get(`sinv.common.view.otherAttachment`).d('采购方其他附件')}：</p>
                <UploadButton {...downatProps} fileList={otherFileList} viewOnly />
              </Col>
            </Row>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col>
              <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
              <UploadButton {...downinProps} fileList={supplierFileList} viewOnly />
            </Col>
          </Row>
          <Row>
            <Col>
              <p>{intl.get(`sinv.common.attachment.supplier.other`).d('供应商其他附件')}：</p>
              <UploadButton {...downinOtherProps} viewOnly />
            </Col>
          </Row>
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
