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
import UploadButton from 'components/Upload/UploadButton';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryFileListOrg, removeFileOrg } from 'services/api';

export default class Attachment extends Component {
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
      businessAttachmentUuid: undefined, // 打开模态框新建的uuid 自动生成商务附件uuid
      techAttachmentUuid: undefined, // 打开模态框新建的uuid 自动生成技术附件uuid
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
    };
  }
  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.businessUuid) {
      if (nextProps.businessUuid !== this.state.businessAttachmentUuid) {
        this.fetchbusinessAttachment(nextProps.businessUuid);
        this.setState({ businessAttachmentUuid: nextProps.businessUuid });
      }
    } else if (this.state.businessAttachmentUuid === undefined) {
      const businessAttachmentUuid = uuid();
      this.setState({ businessAttachmentUuid });
    }
    if (nextProps.techUuid) {
      if (nextProps.techUuid !== this.state.techAttachmentUuid) {
        this.fetchTechAttachment(nextProps.techUuid);
        this.setState({ techAttachmentUuid: nextProps.techUuid });
      }
    } else if (this.state.techAttachmentUuid === undefined) {
      const techAttachmentUuid = uuid();
      this.setState({ techAttachmentUuid });
    }
  }

  componentDidMount() {
    if (this.props.viewOnly) {
      if (this.props.businessUuid) {
        this.fetchbusinessAttachment(this.props.businessUuid);
      }
      if (this.props.techUuid) {
        this.fetchTechAttachment(this.props.techUuid);
      }
    }
  }

  /**
   * 查询商务附件
   */
  @Bind()
  fetchbusinessAttachment(businessAttachmentUuid) {
    const { bucketName, bucketDirectory } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        bucketDirectory,
        attachmentUUID: businessAttachmentUuid,
      }).then((response) => {
        this.setState({
          businessAttachments: response.map((item, index) => ({
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
    const { bucketName, bucketDirectory } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        bucketDirectory,
        attachmentUUID: techAttachmentUuid,
      }).then((response) => {
        this.setState({
          techAttachments: response.map((item, index) => ({
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
    const { businessUuid, techUuid, bucketName, bucketDirectory } = this.props;
    const { businessAttachmentUuid, techAttachmentUuid } = this.state;
    const attachmentUUID =
      `${fileType}AttachmentUuid` === 'businessAttachmentUuid'
        ? businessUuid || businessAttachmentUuid
        : techUuid || techAttachmentUuid;
    if (businessAttachmentUuid && techAttachmentUuid) {
      return {
        attachmentUUID,
        bucketName,
        bucketDirectory,
        // tenantId,
        fileName: file.name,
      };
    }
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
    const { businessUuid, techUuid, bucketName, bucketDirectory, initUpload } = this.props;
    const { fileList } = this.state;
    const attachmentUUID =
      `${fileType}AttachmentUuid` === 'businessAttachmentUuid'
        ? businessUuid || this.state.businessAttachmentUuid
        : techUuid || this.state.techAttachmentUuid;
    removeFileOrg({
      attachmentUUID,
      bucketName,
      bucketDirectory,
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
            <p>{intl.get(`ssrc.bidTask.model.bidHall.businessAttachments`).d('商务附件')}：</p>
            <UploadButton
              viewOnly={viewOnly}
              multiple
              listType="picture-card"
              fileList={businessAttachments}
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              uploadData={(e) => this.uploadData(e, 'business')}
              tenantId={organizationId}
              action={`${HZERO_FILE}/v1${
                isUndefined(organizationId) ? '/' : `/${organizationId}/`
              }files/attachment/multipart`}
              onRemove={(e) => this.removeFile(e, 'business')}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录?'),
                showRemoveIcon: !viewOnly,
              }}
            />
          </Col>
          <Col span={11}>
            <p>{intl.get(`ssrc.bidTask.model.bidHall.techAttachments`).d('技术附件')}：</p>
            <UploadButton
              viewOnly={viewOnly}
              multiple
              listType="picture-card"
              fileList={techAttachments}
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              uploadData={(e) => this.uploadData(e, 'tech')}
              tenantId={organizationId}
              action={`${HZERO_FILE}/v1${
                isUndefined(organizationId) ? '/' : `/${organizationId}/`
              }files/attachment/multipart`}
              onRemove={(e) => this.removeFile(e, 'tech')}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录?'),
                showRemoveIcon: !viewOnly,
              }}
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
