/**
 * Attachment - 上传下载附件
 * @date: 2018-1-11
 * @author: HZL <ZILI.HOU@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

/*eslint-disable*/

import React, { Component } from 'react';
import { Row, Col, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import {
  //  isUndefined,
  isFunction,
  isEmpty,
  compose,
} from 'lodash';
import uuid from 'uuid/v4';

import remote from 'hzero-front/lib/utils/remote';
// import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
// import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { getAttachmentUrl } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryFileListOrg, removeFileOrg } from 'services/api';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { Attachment as NewAttachment } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

class Attachment extends Component {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    const { businessUuid = null, techUuid = null } = props || {};

    this.fetchbusinessAttachment(businessUuid);
    this.fetchTechAttachment(techUuid);

    this.state = {
      fileList: [],
      businessAttachments: [], // 商务附件
      techAttachments: [], // 技术附件
      businessAttachmentUuid: businessUuid || uuid(), // 打开模态框新建的uuid 自动生成商务附件uuid
      techAttachmentUuid: techUuid || uuid(), // 打开模态框新建的uuid 自动生成技术附件uuid
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
    };
  }

  businessRef = {};

  technologyRef = {};

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

  componentWillUnmount() {
    this.fetchBusinessTimer && clearTimeout(this.fetchBusinessTimer);
    this.fetchTechTimer && clearTimeout(this.fetchTechTimer);
  }

  componentDidMount() {
    const { viewOnly = false, businessUuid = null, techUuid = null } = this.props;

    if (viewOnly) {
      this.fetchbusinessAttachment(businessUuid);
      this.fetchTechAttachment(techUuid);
    }
  }

  @Bind()
  changeFileList(response = []) {
    const { bucketName = DEFAULT_BUCKET_NAME, bucketDirectory, tenantId } = this.props;
    if (isEmpty(response)) {
      return [];
    }

    return response.map((res, index) => {
      return {
        ...res,
        uid: index,
        name: res.fileName,
        status: 'done',
        url: getAttachmentUrl(res.fileUrl, bucketName, tenantId, bucketDirectory),
        uid: index,
        type: res.fileType,
        size: res.fileSize,
        response: res.fileUrl,
      };
    });
  }

  /**
   * 查询商务附件
   */
  @Bind()
  fetchbusinessAttachment(businessAttachmentUuid = null) {
    if (!businessAttachmentUuid) {
      return;
    }

    let businessAttachments = null;
    const { bucketName, bucketDirectory, delay = null } = this.props;
    const fetchFile = () => {
      return new Promise((resolve) => {
        queryFileListOrg({
          bucketName,
          bucketDirectory,
          attachmentUUID: businessAttachmentUuid,
        }).then((response) => {
          businessAttachments = this.changeFileList(response);
          this.setState({
            businessAttachments: businessAttachments,
          });
          // this.businessRef.setFileList(businessAttachments);
          resolve(true);
        });
      });
    };

    if (!delay) {
      fetchFile();
    } else {
      this.fetchBusinessTimer = setTimeout(fetchFile, delay);
    }
  }

  /**
   * 查询技术附件
   */
  @Bind()
  fetchTechAttachment(techAttachmentUuid = null) {
    if (!techAttachmentUuid) {
      return;
    }

    let techAttachments = [];
    const { bucketName, bucketDirectory, delay = null } = this.props;
    const fetchFile = () => {
      return new Promise((resolve) => {
        queryFileListOrg({
          bucketName,
          bucketDirectory,
          attachmentUUID: techAttachmentUuid,
        }).then((response) => {
          // const techAttachments = response.map((item, index) => ({
          //   uid: index,
          //   name: item.fileName,
          //   type: item.fileType,
          //   status: 'done',
          //   size: item.fileSize,
          //   response: item.fileUrl,
          //   url: item.fileUrl,
          // }));
          // techAttachments = this.changeFileList(response);
          this.setState({
            techAttachments: response,
          });
          // this.technologyRef?.setFileList(techAttachments);
          resolve(true);
        });
      });
    };

    if (!delay) {
      fetchFile();
    } else {
      this.fetchTechTimer = setTimeout(fetchFile, delay);
    }
  }

  /**
   *上传
   */
  @Bind()
  uploadData(file, fileType) {
    const { businessUuid, techUuid } = this.props;
    const { businessAttachmentUuid, techAttachmentUuid } = this.state;
    const fileName = `${fileType}AttachmentUuid`;
    const attachmentUUID =
      fileName === 'businessAttachmentUuid'
        ? businessUuid || businessAttachmentUuid
        : techUuid || techAttachmentUuid;

    this.setState({
      [fileName]: attachmentUUID || uuid(),
    });

    return {
      attachmentUUID,
    };
    // }
  }

  /**
   *上传成功后调用方法
   *
   * @param {*} file 文件信息
   * @param {*} fileList 文件列表
   * @memberof UploadModal
   */
  @Bind()
  onUploadSuccess(file = {}, fileList = []) {
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

    if (isEmpty(fileList)) {
      return;
    }
    const businessFlag = this.fetchbusinessAttachment(businessUuid);
    const techFlag = this.fetchTechAttachment(techUuid);
    this.setState({
      fileList: fileList.filter((o) => o.uid !== file?.uid),
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

  renderThirdAttachment = () => {
    const { attachmentRemote } = this.props;

    const allProps = this.props || {};

    return attachmentRemote
      ? attachmentRemote.render('SSRC_COMPONENTS_ATTACHMENT_THIRD_ATTACHMENT', null, allProps)
      : '';
  };

  render() {
    const {
      viewOnly = false,
      bucketName,
      bucketDirectory,
      businessAttachmentVisible = true,
      techAttachmentVisible = true, // 后续可以扩展成 map, eg: map[key]
      businessAttachmentFlag = true,
      techAttachmentFlag = true,
      bargainBusUuid = null,
      bargainTechUuid = null,
      roundBusUuid = null,
      roundTechUuid = null,
      checkPriceFlag = 0, // 核价供应商列表附件标识
      businessUuid = null,
      techUuid = null,
      data = {},
    } = this.props;
    const {
      previewVisible,
      previewFileName,
      previewImage,
      businessAttachmentUuid,
      techAttachmentUuid,
    } = this.state;
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    const previewImageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };
    const businessAttachmentsProps = {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      labelLayout: 'float',
      fileSize: FIlESIZE,
      bucketName: bucketName,
      bucketDirectory: bucketDirectory,
      value: businessAttachmentUuid || businessUuid,
      readOnly: viewOnly,
      onChange: (businessAttachmentUuid) => {
        this.setState({ businessAttachmentUuid });
      },
      ...(ChunkUploadProps || {}),
    };
    const techAttachmentsProps = {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      labelLayout: 'float',
      fileSize: FIlESIZE,
      bucketName: bucketName,
      bucketDirectory: bucketDirectory,
      value: techAttachmentUuid || techUuid,
      readOnly: viewOnly,
      onChange: (techAttachmentUuid) => {
        this.setState({ techAttachmentUuid });
      },
      ...(ChunkUploadProps || {}),
    };

    return (
      <React.Fragment>
        <Row>
          {businessAttachmentVisible && (
            <Col span={10}>
              {!businessAttachmentFlag && (
                <p>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件')}
                  ：
                </p>
              )}
              {!businessAttachmentFlag ? (
                <span>
                  <img src={require('@/assets/attachs.png')} alt="" />
                </span>
              ) : checkPriceFlag ? (
                <NewAttachment
                  readOnly={viewOnly}
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxheader"
                  value={businessAttachmentUuid || businessUuid}
                  onChange={(businessAttachmentUuid) => {
                    this.setState({ businessAttachmentUuid });
                  }}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`)
                    .d('商务附件')}
                  labelLayout="float"
                  {...ChunkUploadProps}
                />
              ) : (
                <NewAttachment {...businessAttachmentsProps} />
              )}
            </Col>
          )}
          {techAttachmentVisible && (
            <Col span={10} offset={1}>
              {!techAttachmentFlag && (
                <p>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}：
                </p>
              )}
              {!techAttachmentFlag ? (
                <span>
                  <img src={require('@/assets/attachs.png')} alt="" />
                </span>
              ) : checkPriceFlag ? (
                <NewAttachment
                  readOnly={viewOnly}
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxheader"
                  value={techAttachmentUuid || techUuid}
                  onChange={(techAttachmentUuid) => {
                    this.setState({ techAttachmentUuid });
                  }}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`)
                    .d('技术附件')}
                  labelLayout="float"
                  {...ChunkUploadProps}
                />
              ) : (
                <NewAttachment {...techAttachmentsProps} />
              )}
            </Col>
          )}

          {this.renderThirdAttachment()}
        </Row>
        <Row>
          {businessAttachmentVisible && roundBusUuid && (
            <Col span={10}>
              {!businessAttachmentFlag && (
                <p>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.roundBusinessAttachments`)
                    .d('多轮补充商务附件')}
                  ：
                </p>
              )}
              {!businessAttachmentFlag ? (
                <span>
                  <img src={require('@/assets/attachs.png')} alt="" />
                </span>
              ) : (
                <NewAttachment
                  readOnly={viewOnly}
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxheader"
                  value={roundBusUuid}
                  onChange={() => {}}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.roundBusinessAttachments`)
                    .d('多轮补充商务附件')}
                  labelLayout="float"
                  {...ChunkUploadProps}
                />
              )}
            </Col>
          )}
          {techAttachmentVisible && roundTechUuid && (
            <Col span={10} offset={1}>
              {!techAttachmentFlag && (
                <p>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.roundTechAttachments`)
                    .d('多轮补充技术附件')}
                  ：
                </p>
              )}
              {!techAttachmentFlag ? (
                <span>
                  <img src={require('@/assets/attachs.png')} alt="" />
                </span>
              ) : (
                <NewAttachment
                  readOnly={viewOnly}
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxheader"
                  value={roundTechUuid}
                  onChange={() => {}}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.roundTechAttachments`)
                    .d('多轮补充技术附件')}
                  labelLayout="float"
                  {...ChunkUploadProps}
                />
              )}
            </Col>
          )}
        </Row>
        <Row>
          {businessAttachmentVisible && bargainBusUuid && (
            <Col span={10}>
              {!businessAttachmentFlag && (
                <p>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.bargainBusinessAttachments`)
                    .d('议价补充商务附件')}
                  ：
                </p>
              )}
              {!businessAttachmentFlag ? (
                <span>
                  <img src={require('@/assets/attachs.png')} alt="" />
                </span>
              ) : (
                <NewAttachment
                  readOnly={viewOnly}
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxheader"
                  value={bargainBusUuid}
                  onChange={() => {}}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.bargainBusinessAttachments`)
                    .d('议价补充商务附件')}
                  labelLayout="float"
                  {...ChunkUploadProps}
                />
              )}
            </Col>
          )}
          {techAttachmentVisible && bargainTechUuid && (
            <Col span={10} offset={1}>
              {!techAttachmentFlag && (
                <p>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.bargainTechAttachments`)
                    .d('议价补充技术附件')}
                  ：
                </p>
              )}
              {!techAttachmentFlag ? (
                <span>
                  <img src={require('@/assets/attachs.png')} alt="" />
                </span>
              ) : (
                <NewAttachment
                  readOnly={viewOnly}
                  fileSize={FIlESIZE}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxheader"
                  value={bargainTechUuid}
                  onChange={() => {}}
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.bargainTechAttachments`)
                    .d('议价补充技术附件')}
                  labelLayout="float"
                  {...ChunkUploadProps}
                />
              )}
            </Col>
          )}
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

const hocComponent = (Com) => {
  return compose(
    formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'sscux.common', 'sscux.ssrc',] }),
    remote(
      {
        code: 'SSRC_COMPONENTS_ATTACHMENT',
        name: 'attachmentRemote',
      },
      {
        events: {},
      }
    )
  )(Com);
};

export default hocComponent(Attachment);
