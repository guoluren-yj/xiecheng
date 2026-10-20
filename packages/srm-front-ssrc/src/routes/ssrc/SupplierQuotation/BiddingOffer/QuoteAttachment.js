/**
 * Attachment - 上传下载附件
 * @date: 2018-1-11
 * @author: HZL <ZILI.HOU@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction } from 'lodash';
import uuid from 'uuid/v4';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryFileListOrg, removeFileOrg } from 'services/api';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

export default class QuateAttachment extends Component {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      fileList: [],
      businessAttachments: [], // 商务附件
      techAttachments: [], // 技术附件
      businessAttachmentUuid: null, // 打开模态框新建的uuid 自动生成商务附件uuid
      techAttachmentUuid: null, // 打开模态框新建的uuid 自动生成技术附件uuid
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
    };
  }

  componentDidMount() {
    this.dataProcess();
  }

  /**
   * 处理接收数据
   */
  @Bind()
  dataProcess() {
    if (this.props.businessUuid) {
      if (this.props.businessUuid !== this.state.businessAttachmentUuid) {
        this.fetchbusinessAttachment(this.props.businessUuid);
        this.setState({ businessAttachmentUuid: this.props.businessUuid });
      }
    } else {
      const businessAttachmentUuid = uuid();
      this.setState({ businessAttachmentUuid });
    }
    if (this.props.techUuid) {
      if (this.props.techUuid !== this.state.techAttachmentUuid) {
        this.fetchTechAttachment(this.props.techUuid);
        this.setState({ techAttachmentUuid: this.props.techUuid });
      }
    } else {
      const techAttachmentUuid = uuid();
      this.setState({ techAttachmentUuid });
    }
  }

  /**
   * 查询商务附件
   */
  @Bind()
  fetchbusinessAttachment(businessAttachmentUuid) {
    const { bucketName } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        attachmentUUID: businessAttachmentUuid,
      }).then((response) => {
        this.setState({
          businessAttachments: response?.map?.((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
            url: item.fileUrl,
          })),
        });
        resolve(true);
      });
    });
  }

  /**
   * 查询技术附件
   */
  @Bind()
  fetchTechAttachment(techAttachmentUuid) {
    const { bucketName } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        attachmentUUID: techAttachmentUuid,
      }).then((response) => {
        this.setState({
          techAttachments: response?.map?.((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
            url: item.fileUrl,
          })),
        });
        resolve(true);
      });
    });
  }

  /**
   *上传
   */
  @Bind()
  uploadData(file, fileType) {
    const { businessUuid, techUuid } = this.props;
    const { businessAttachmentUuid, techAttachmentUuid } = this.state;
    const attachmentUUID =
      `${fileType}AttachmentUuid` === 'businessAttachmentUuid'
        ? businessUuid || businessAttachmentUuid
        : techUuid || techAttachmentUuid;
    return {
      attachmentUUID,
    };
  }

  /**
   *上传成功后调用方法
   *
   * @param {*} file 文件信息
   * @param {*} fileList 文件列表
   * @memberof UploadModal
   */
  @Bind()
  onUploadSuccess() {
    const { businessUuid, techUuid, initUpload } = this.props;
    const { businessAttachmentUuid, techAttachmentUuid } = this.state;
    if (!(businessUuid && techUuid)) {
      if (isFunction(initUpload)) {
        initUpload({
          businessAttachmentUuid,
          techAttachmentUuid,
        });
      }
    }
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewFileName: file.name,
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  /**
   * 图片预览取消
   */
  @Bind()
  handlePreviewCancel() {
    this.setState({
      previewFileName: '',
      previewImage: '',
      previewVisible: false,
    });
  }

  /**
   * 删除附件
   * @param {Object} file
   * */
  @Bind()
  removeFile(file, fileType) {
    const { businessUuid, techUuid, bucketName, initUpload } = this.props;
    const { fileList } = this.state;
    const attachmentUUID =
      `${fileType}AttachmentUuid` === 'businessAttachmentUuid'
        ? businessUuid || this.state.businessAttachmentUuid
        : techUuid || this.state.techAttachmentUuid;
    removeFileOrg({
      attachmentUUID,
      bucketName,
      // tenantId,
      urls: [file.response],
    }).then((res) => {
      if (res) {
        const businessFlag = this.fetchbusinessAttachment(businessUuid);
        const techFlag = this.fetchTechAttachment(techUuid);
        this.setState({
          fileList: fileList.filter((o) => o.uid !== file.uid),
        });
        Promise.all([businessFlag, techFlag]).then((result) => {
          if (result) {
            const { businessAttachments, techAttachments } = this.state;
            if (businessAttachments.length === 0 && techAttachments.length === 0) {
              if (isFunction(initUpload)) {
                initUpload({
                  businessAttachmentUuid: null,
                  techAttachmentUuid: null,
                });
              }
            }
          }
        });
      }
    });
  }

  render() {
    const organizationId = getCurrentOrganizationId();
    const { viewOnly = false, bucketName, bucketDirectory } = this.props;
    const {
      businessAttachments,
      techAttachments,
      previewVisible,
      previewFileName,
      previewImage,
      businessAttachmentUuid = null,
      techAttachmentUuid = null,
    } = this.state;
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    const previewImageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };
    return (
      <React.Fragment>
        <Row>
          <Col span={11}>
            <p>
              {intl.get(`ssrc.supplierQuotation.model.supQuo.businessAttachments`).d('商务附件')}：
            </p>
            <UploadButton
              filePreview
              viewOnly={viewOnly}
              multiple
              listType="picture-card"
              fileList={businessAttachments}
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              // uploadData={(e) => this.uploadData(e, 'business')}
              tenantId={organizationId}
              action={`${HZERO_FILE}/v1${
                isUndefined(organizationId) ? '/' : `/${organizationId}/`
              }files/attachment/multipart`}
              onRemove={(e) => this.removeFile(e, 'business')}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录？'),
                showRemoveIcon: !viewOnly,
              }}
              attachmentUUID={businessAttachmentUuid}
              {...ChunkUploadProps}
            />
          </Col>
          <Col span={11}>
            <p>{intl.get(`ssrc.supplierQuotation.model.supQuo.techAttachments`).d('技术附件')}：</p>
            <UploadButton
              filePreview
              viewOnly={viewOnly}
              multiple
              listType="picture-card"
              fileList={techAttachments}
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              // uploadData={(e) => this.uploadData(e, 'tech')}
              tenantId={organizationId}
              action={`${HZERO_FILE}/v1${
                isUndefined(organizationId) ? '/' : `/${organizationId}/`
              }files/attachment/multipart`}
              onRemove={(e) => this.removeFile(e, 'tech')}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录？'),
                showRemoveIcon: !viewOnly,
              }}
              attachmentUUID={techAttachmentUuid}
              {...ChunkUploadProps}
            />
          </Col>
        </Row>
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handlePreviewCancel}
          style={previewModalStyle}
        >
          <img alt={previewFileName} style={previewImageStyle} src={previewImage} />
        </Modal>
      </React.Fragment>
    );
  }
}
