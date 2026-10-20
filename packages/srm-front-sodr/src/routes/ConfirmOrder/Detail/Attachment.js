/*
 * Attachment - 详情页面附件上传
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Icon, Spin } from 'hzero-ui';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { Bind } from 'lodash-decorators';
import { isFunction, isUndefined, isString } from 'lodash';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import Viewer from 'react-viewer';
import qs from 'querystring';
import 'react-viewer/dist/index.css';
import {
  BUCKET_NAME,
  PURCHASER_EXTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
} from '@/routes/components/utils/constant';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

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
  constructor(props) {
    super(props);
    const { attachmentUUID, supplierAttachmentUuid, onBindUuidToHeader = (e) => e } = props;
    this.state = {
      fileList: [], // 从数据库获取到的文件列表
      previewImages: [], // 预览数据
      previewVisible: false, // 预览显示
      // visible: false,
      // supplierAttachmentUuid: undefined,
      purchaserList: [],
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
      // attachmentUUID: attachmentUUID || onBindUuidToHeader(),
      attachmentUUID,
      supplierAttachmentUuid: supplierAttachmentUuid || onBindUuidToHeader(),
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { supplierAttachmentUuid: preUuid } = prevState;
    const { supplierAttachmentUuid } = nextProps;
    if (supplierAttachmentUuid && supplierAttachmentUuid !== preUuid) {
      return { supplierAttachmentUuid };
    } else {
      return null;
    }
  }

  componentDidMount() {
    this.queryAttachmentList();
  }

  /**
   * 查询双方附件列表
   */
  @Bind()
  queryAttachmentList() {
    const { supplierAttachmentUuid, attachmentUUID } = this.state;
    if (attachmentUUID) {
      this.queryPurchaserAttachmentList();
    }
    if (supplierAttachmentUuid) {
      this.querySupplierAttachmentList();
    }
    const { detailHeader } = this.props;
    detailHeader(false);
  }

  /**
   * 获取采购方附件
   */
  @Bind()
  queryPurchaserAttachmentList() {
    const { bucketName = BUCKET_NAME } = this.props;
    const { onFetchPurchaserAttachmentList } = this.props;
    const { attachmentUUID } = this.state;

    if (isFunction(onFetchPurchaserAttachmentList)) {
      onFetchPurchaserAttachmentList({
        attachmentUUID,
        bucketName,
        bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      }).then((res) => {
        if (res) {
          // this.setState({ purchaserList: this.changeFileList(res) }); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
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
    const {
      onFetchSupplierAttachmentList,
      bucketName = BUCKET_NAME,
      // bucketDirectory = 'sodr-order',
    } = this.props;
    const { supplierAttachmentUuid } = this.state;
    if (isFunction(onFetchSupplierAttachmentList)) {
      onFetchSupplierAttachmentList({
        attachmentUUID: supplierAttachmentUuid,
        bucketName,
        bucketDirector: SUPPLIER_DIRECTORY,
      }).then((res) => {
        if (res) {
          // this.setState({ fileList: this.changeFileList(res) });
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
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: this.getUrl(bucketDirectory, res.fileUrl),
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
  getUrl(bucketDirectory, url, tenantId = this.state.tenantId) {
    const accessToken = getAccessToken();
    const { bucketName = BUCKET_NAME } = this.props;
    return `${HZERO_FILE}/v1${
      !isUndefined(tenantId) ? `/${tenantId}/` : '/'
    }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
      !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
    }url=${encodeURIComponent(url)}`;
  }

  /**
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    // 新上传文件
    const { supplierAttachmentUuid } = this.state;
    const { bucketName = BUCKET_NAME } = this.props;
    return {
      bucketName,
      directory: SUPPLIER_DIRECTORY,
      fileName: file.name,
      attachmentUUID: supplierAttachmentUuid,
    };
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   */
  // @Bind()
  // beforeUpload(file) {
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
  //   return true;
  // }

  /**
   * 附件变更
   * @param {Object} {info, fileList}
   */
  @Bind()
  onUploadChange({ file, fileList = [] }) {
    const { tenantId } = this.state;
    const { bucketName = BUCKET_NAME, bucketDirectory = 'sodr-order' } = this.props;
    const { status } = file;
    const accessToken = getAccessToken();
    let list = [...fileList];
    if (status === 'done') {
      notification.success();
      list = fileList.map((f) => {
        if (f.uid === file.uid) {
          // eslint-disable-next-line no-param-reassign
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
    const { fileList } = this.state;
    // const {supplierAttachmentId}=this.props;
    const {
      onRemoveAttachment,
      supplierAttachmentUuid,
      bucketName = BUCKET_NAME,
      // bucketDirectory = 'sodr-order',
      detailHeader,
    } = this.props;
    const { url } = qs.parse(file.url);
    if (isFunction(onRemoveAttachment)) {
      return onRemoveAttachment({
        bucketName,
        bucketDirectory: SUPPLIER_DIRECTORY,
        urls: (isString(file.url) && [url]) || [],
        attachmentUUID: supplierAttachmentUuid,
      }).then((res) => {
        if (res) {
          this.setState({
            fileList: fileList.filter((o) => o.uid !== file.uid),
          });
          notification.success();
          detailHeader();
        }
      });
    }
  }

  /**
   * 埋点处理附件文字
   */
  @Bind()
  getSupplierText() {
    const { remote } = this.props;
    const text = `${intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：`;
    return remote.process('supplierAttachmentText', text);
  }

  render() {
    const {
      loading = false,
      visible,
      hideAttachment = (e) => e,
      bucketName,
      // bucketDirectory,
      attachmentUUID,
      supplierAttachmentUuid,
    } = this.props;
    const {
      purchaserList,
      fileList,
      previewVisible,
      previewImages,
      tenantId,
      accessToken,
    } = this.state;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const downloadProps = {
      tenantId,
      viewOnly: true,
      filePreview: true,
      attachmentUUID,
      bucketName,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
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
      onOk: hideAttachment,
      onCancel: hideAttachment,
      width: 1000,
    };
    const uploadProps = {
      // fileSize: 100 * 1024 * 1024,
      headers,
      fileList,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      tenantId,
      filePreview: true,
      attachmentUUID: supplierAttachmentUuid,
      bucketName,
      bucketDirectory: SUPPLIER_DIRECTORY,
      onRef: (ref) => {
        this.uploadTwo = ref;
      },
      data: this.uploadData,
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
    const modalContent = (
      <Spin spinning={loading}>
        <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Col span={12}>
            <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}：</p>
            <UploadButton {...downloadProps} />
          </Col>
          <Col span={12}>
            <p>{this.getSupplierText()}</p>
            <UploadButton {...uploadProps}>
              <div>
                <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
              </div>
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
