/*
 * Attachment - 详情页面附件上传
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Icon, Spin, Button, Tag } from 'hzero-ui';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction, isString } from 'lodash';
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
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class Attachment extends PureComponent {
  state = {
    fileList: [], // 从数据库获取到的文件列表
    previewImages: [], // 预览数据
    previewVisible: false, // 预览显示
    visible: false,
    attachmentUUIDs: '', // props 属性值
    supplierAttachmentUuid: undefined,
    purchaserList: [],
    tenantId: getCurrentOrganizationId(),
    accessToken: getAccessToken(),
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // 初始化的时候拿到父级数据触发更新
    const { attachmentUUID } = nextProps;
    if (attachmentUUID && attachmentUUID !== prevState.attachmentUUIDs) {
      return {
        attachmentUUIDs: attachmentUUID,
      };
    }
    const { supplierAttachmentUuid: preUuid } = prevState;
    const { supplierAttachmentUuid } = nextProps;
    if (supplierAttachmentUuid && supplierAttachmentUuid !== preUuid) {
      return { supplierAttachmentUuid };
    } else {
      return null;
    }
  }

  getSnapshotBeforeUpdate(nextProps, prevState) {
    const { visible, supplierAttachmentUuid: stateSupplierAttachmentUuid } = prevState;
    const { supplierAttachmentUuid } = this.state;
    if (!visible && this.state.visible && !supplierAttachmentUuid) return 'init';
    if (!stateSupplierAttachmentUuid && supplierAttachmentUuid) return 'fetch';
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { onBindUuidToHeader } = this.props;
    if (snapshot === 'init' && isFunction(onBindUuidToHeader)) {
      onBindUuidToHeader();
    } else if (snapshot === 'fetch') {
      this.queryAttachmentList();
    }
  }

  // componentDidMount() {
  //   this.queryAttachmentList();
  // }

  // static getDerivedStateFromProps(props, state) {

  //   return null;
  // }

  /**
   * 查询双方附件列表
   */
  @Bind()
  queryAttachmentList() {
    const { attachmentUUID, supplierAttachmentUuid } = this.props;
    if (attachmentUUID) {
      this.queryPurchaserAttachmentList();
    }
    if (supplierAttachmentUuid) {
      this.querySupplierAttachmentList();
    }
  }

  /**
   * 获取采购方附件
   */
  @Bind()
  queryPurchaserAttachmentList() {
    // const { bucketName } = this.props;
    const { onFetchPurchaserAttachmentList, attachmentUUID } = this.props;
    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID,
        bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
        bucketName: BUCKET_NAME,
      }).then((res) => {
        if (res) {
          this.setState({
            purchaserList: this.changeFileList(res),
          });
          // if (this.uploadOne) {
          //   this.uploadOne.setFileList(this.changeFileList(res));
          // }
        }
      });
    }
  }

  /**
   * 获取供应商附件
   */
  @Bind()
  querySupplierAttachmentList() {
    const { supplierAttachmentUuid } = this.state;
    const { onFetchSupplierAttachmentList } = this.props;
    if (isFunction(onFetchSupplierAttachmentList)) {
      onFetchSupplierAttachmentList({
        attachmentUUID: supplierAttachmentUuid,
        bucketName: BUCKET_NAME,
      }).then((res) => {
        if (res) {
          this.setState({
            fileList: this.changeFileList(res),
          });
          // if (this.uploadTwo) {
          //   this.uploadTwo.setFileList(this.changeFileList(res));
          // }
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
    // const { bucketName = BUCKET_NAME } = this.props;
    // const { tenantId } = this.state;
    return response.map((res, index) => {
      return {
        ...res,
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: res.fileUrl,
      };
    });
  }

  /**
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    // 新上传文件
    const { supplierAttachmentUuid, bucketDirectory = 'sodr-order' } = this.state;
    return {
      bucketName: BUCKET_NAME,
      directory: bucketDirectory,
      fileName: file.name,
      attachmentUUID: supplierAttachmentUuid,
    };
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true });
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   */
  @Bind()
  beforeUpload(file) {
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
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file) {
    const { fileList, supplierAttachmentUuid } = this.state;
    const { onRemoveAttachment } = this.props;
    if (isFunction(onRemoveAttachment)) {
      return onRemoveAttachment({
        bucketName: BUCKET_NAME,
        urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || '',
        attachmentUUID: supplierAttachmentUuid,
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

  render() {
    const {
      loading,
      showFilesNumber = false,
      bucketName,
      // bucketDirectory,
      attachmentUUID,
      supplierAttachmentUuid,
      filesNumber = 0,
      btnProps = { style: { color: '#000' }, icon: 'paper-clip' },
    } = this.props;
    const {
      purchaserList,
      fileList,
      previewVisible,
      visible,
      previewImages,
      tenantId,
      accessToken,
    } = this.state;
    const { icon = 'paper-clip', btnText = intl.get('entity.attachment.tag').d('附件') } = btnProps;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const downloadProps = {
      tenantId,
      bucketName,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      attachmentUUID,
      viewOnly: true,
      onRef: (ref) => {
        this.uploadOne = ref;
      },
      listType: 'picture-card',
      fileList: purchaserList,
      onPreview: this.handlePreview,
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const attachmentModalProps = {
      visible,
      title: intl.get(`entity.attachment.tag`).d('附件'),
      onOk: this.hideAttachment,
      onCancel: this.hideAttachment,
      width: 1000,
    };
    const uploadProps = {
      tenantId,
      headers,
      fileList,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      bucketName,
      bucketDirectory: SUPPLIER_DIRECTORY,
      viewOnly: true,
      onRef: (ref) => {
        this.uploadTwo = ref;
      },
      attachmentUUID: supplierAttachmentUuid,
      // data: this.uploadData,
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
      // onChange: this.onUploadChange,
      onRemove: this.onUploadRemove,
      onPreview: this.handlePreview,
      showUploadList: {
        // removePopConfirmTitle: intl
        //   .get('hzero.common.message.confirm.delete')
        //   .d('是否删除此条记录?'),
        showRemoveIcon: false,
      },
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
                fileList.length + purchaserList.length > 0) && (
                <Tag
                  color="#108ee9"
                  style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                >
                  {fileList.length + purchaserList.length}
                </Tag>
              )}
          </Button>
        )}
        {/* {showFilesNumber && ((filesNumber && filesNumber !== 0) || 1 > 0) && (
          <Tag color="#108ee9" style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}>
            {1}
          </Tag>
        )} */}
      </React.Fragment>
    );

    const modalContent = (
      <Spin spinning={loading}>
        <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}：</p>
            <UploadButton {...downloadProps}>
              {purchaserList.length >= 0 ? null : (
                <div>
                  <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                </div>
              )}
            </UploadButton>
          </Col>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
            <UploadButton {...uploadProps}>
              {fileList.length >= 0 ? null : (
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
