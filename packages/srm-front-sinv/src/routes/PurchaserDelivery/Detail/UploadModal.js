/*
 * Attachment - 详情页面附件上传模态框
 * @date: 2018/08/08 14:07:49
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Icon, List } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isString } from 'lodash';
import notification from 'utils/notification';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getAttachmentUrl,
  isTenantRoleLevel,
} from 'utils/utils';
import UploadButton from '_components/Upload/UploadButton';
// import request from 'utils/request';

const ListItem = List.Item;
const DEFAULT_BUCKET_NAME = 'private-bucket';
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
      // reviewFileList: [],
      otherFileList: [],
      // supplierFileList: [],
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
    // const { supplierAttachmentId } = this.props;
    const {
      supplierAttachmentUuid,
      supplierAttaUuid,
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
      this.querySupplierAttachmentList(supplierAttachmentUuid, 'supplierAttachmentUuid');
    }
    if (supplierAttaUuid) {
      this.querySupplierAttachmentList(supplierAttaUuid, 'supplierAttaUuid');
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
              // eslint-disable-next-line no-unused-expressions
              this.refFormApp && this.refFormApp.setFileList(this.changeFileList(res)); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            case 'reviewAttachmentUuid':
              // eslint-disable-next-line no-unused-expressions
              this.refForms && this.refForms.setFileList(this.changeFileList(res)); // 将从数据库获得的文件列表放在fileList里 uuid对应的是 attachmentUUID
              break;
            case 'otherAttachmentUuid':
              // eslint-disable-next-line no-unused-expressions
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
              // eslint-disable-next-line no-unused-expressions
              this.refFormList && this.refFormList.setFileList(this.changeFileList(res));
              break;
            case 'supplierAttaUuid':
              // eslint-disable-next-line no-unused-expressions
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
    const { otherAttachmentUuid, bucketDirectory = 'sodr-order' } = this.props;
    return {
      bucketName: 'private-bucket',
      directory: bucketDirectory,
      fileName: file.name,
      attachmentUUID: otherAttachmentUuid,
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
      otherFileList: list,
    });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  onUploadRemove(file) {
    const { otherFileList } = this.state;
    const { onRemoveAttachment, otherAttachmentUuid } = this.props;
    if (isFunction(onRemoveAttachment) && file.url) {
      return onRemoveAttachment({
        bucketName: 'private-bucket',
        bucketDirectory: 'sinv-delivery',
        urls: (isString(file.url) && [file.url.substr(file.url.lastIndexOf('=') + 1)]) || '',
        attachmentUUID: otherAttachmentUuid,
      }).then((res) => {
        if (res) {
          this.setState({
            otherFileList: otherFileList.filter((o) => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
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
  handlePreviewFile(item) {
    const { bucketName = DEFAULT_BUCKET_NAME, storageCode } = this.props;
    const fileUrl = this.getPreviewUrl(item.url);
    const url = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url`
      : `${HZERO_FILE}/v1/file-preview/by-url`;
    // 文件预览组件支持Wps,须修改
    window.open(
      `${url}?url=${fileUrl}&bucketName=${bucketName}
      ${storageCode ? `&storageCode=${storageCode}` : ''}
      &access_token=${getAccessToken()}`
    );
    // request(url, {
    //   responseType: 'blob',
    //   method: 'GET',
    //   query: {
    //     bucketName,
    //     storageCode,
    //     url: this.getPreviewUrl(item.url),
    //   },
    // })
    //   .then((response) => {
    //     const blobUrl = window.URL.createObjectURL(response);
    //     window.open(blobUrl);
    //   })
    //   .catch((e) => {
    //     notification.error(e.message);
    //   });
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
  renderItem(item, attachmentUUID, viewOnly) {
    // const { viewOnly } = this.props;
    const fA = item.name.split('.');
    const fileExt = fA && fA[fA.length - 1];
    let allowPreview = false;
    switch (fileExt) {
      case 'doc':
      case 'docx':
        allowPreview = true;
        break;
      case 'pdf':
        allowPreview = true;
        break;
      case 'txt':
        allowPreview = true;
        break;
      default:
        break;
    }
    return (
      <ListItem key={item.uid} style={{ width: '100%' }}>
        <List.Item.Meta
          title={
            <a style={{ color: '#29BECE' }} href={item.url}>
              {item.name}
            </a>
          }
        />
        <div>
          {!viewOnly && (
            <Icon
              title={intl.get('hzero.common.upload.removeFile').d('删除文件')}
              // onClick={() => this.deleteFile(item)}
              onClick={() => this.onUploadRemove(item, attachmentUUID, 'purchaseUploadFileList')}
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
                this.handlePreviewFile(item);
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
  extname(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    const filename = temp[temp.length - 1];
    const filenameWithoutSuffix = filename.split(/#|\?/)[0];
    return (/\.[^./\\]*$/.exec(filenameWithoutSuffix) || [''])[0];
  }

  render() {
    const {
      bucketName,
      bucketDirectory,
      hideAttachment = (e) => e,
      otherAttachmentUuid,
    } = this.props;
    const {
      approvedFileList,
      // reviewFileList,
      otherFileList,
      // supplierFileList,
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
        this.refFormApp = ref;
      },
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const downloadProps = {
      headers,
      bucketName,
      bucketDirectory,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      onPreview: this.handlePreview,
      ref: (ref) => {
        this.refForms = ref;
      },
      showUploadList: {
        showRemoveIcon: false,
      },
    };
    const downinProps = {
      headers,
      bucketName,
      bucketDirectory,
      name: 'file',
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
      headers,
      bucketName,
      bucketDirectory,
      name: 'file',
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
    const uploadProps = {
      headers,
      FileList: otherFileList,
      bucketName,
      bucketDirectory,
      name: 'file',
      listType: 'picture-card',
      multiple: true,
      attachmentUUID: otherAttachmentUuid,
      ref: (ref) => {
        this.refForm = ref;
      },
      // data: this.uploadData,
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
    const modalContent = (
      //   <Spin spinning={loading}>
      <Row gutter={20} style={{ maxHeight: '500px', overflow: 'auto' }}>
        <Col span={12}>
          <Row>
            <Row>
              <Col>
                <p>{intl.get(`sinv.common.purchasersAuditAttachment`).d('采购方审核附件')}：</p>
                <UploadButton {...downatProps} fileList={approvedFileList} viewOnly />
              </Col>
            </Row>
            <Row>
              <Col>
                <p>
                  {intl.get(`sinv.common.view.purchaserReviewAttachment`).d('采购方复核附件')}：
                </p>
                <UploadButton {...downloadProps} viewOnly />
              </Col>
            </Row>
            <Row>
              <Col>
                <p>{intl.get(`sinv.common.view.otherAttachment`).d('采购方其他附件')}：</p>
                <UploadButton {...uploadProps} fileList={otherFileList}>
                  <div>
                    <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
                  </div>
                </UploadButton>
              </Col>
            </Row>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col>
              <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
              <UploadButton {...downinProps} viewOnly />
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
