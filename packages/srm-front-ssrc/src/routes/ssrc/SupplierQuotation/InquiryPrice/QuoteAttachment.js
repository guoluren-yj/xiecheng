import React, { Component } from 'react';
import { Row, Col, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction } from 'lodash';
import uuid from 'uuid/v4';

import { HZERO_FILE } from 'utils/config';
import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryFileListOrg, removeFileOrg } from 'services/api';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const titleStyle = {
  marginTop: '8px',
  fontWeight: 'bold',
};

@remote({
  code: 'SSRC_EVALUATION_PROC_MANAGE',
  name: 'manageAttachment',
})
@formatterCollections({
  code: ['ssrc.supplierQuotation'],
})
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
      bargainBusinessAttachments: [], // 议价补充技术附件
      bargainTechAttachments: [], // 议价补充技术附件
      bargainTechAttachmentUuid: null,
      bargainBusinessAttachmentUuid: null,
      roundTechAttachments: [], // 多轮报价补充商务附件
      roundBusinessAttachments: [], // 多轮报价补充技术附件
      roundTechAttachmentUuid: null,
      roundBusinessAttachmentUuid: null,
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
    };
  }

  componentDidMount() {
    this.dataProcess();
  }

  @Bind()
  dataProcess() {
    if (this.props.businessUuid) {
      this.fetchBusinessAttachment(this.props.businessUuid, 1);
      this.setState({ businessAttachmentUuid: this.props.businessUuid });
    } else if (this.state.businessAttachmentUuid === null) {
      const businessAttachmentUuid = uuid();
      this.setState({ businessAttachmentUuid });
    } else {
      this.fetchBusinessAttachment(this.state.businessAttachmentUuid, 1);
    }
    if (this.props.techUuid) {
      this.fetchTechAttachment(this.props.techUuid, 1);
      this.setState({ techAttachmentUuid: this.props.techUuid });
    } else if (this.state.techAttachmentUuid === null) {
      const techAttachmentUuid = uuid();
      this.setState({ techAttachmentUuid });
    } else {
      this.fetchTechAttachment(this.state.techAttachmentUuid, 1);
    }

    // 多轮报价阶段商务附件 2
    if (this.props.roundBusUuid) {
      this.fetchBusinessAttachment(this.props.roundBusUuid, 2);
      this.setState({ roundBusinessAttachmentUuid: this.props.roundBusUuid });
    } else if (this.state.roundBusinessAttachmentUuid === null) {
      const roundBusinessAttachmentUuid = uuid();
      this.setState({ roundBusinessAttachmentUuid });
    } else {
      this.fetchBusinessAttachment(this.state.roundBusinessAttachmentUuid, 2);
    }
    // 多轮报价阶段技术附件 2
    if (this.props.roundTechUuid) {
      this.fetchTechAttachment(this.props.roundTechUuid, 2);
      this.setState({ roundTechAttachmentUuid: this.props.roundTechUuid });
    } else if (this.state.roundTechAttachmentUuid === null) {
      const roundTechAttachmentUuid = uuid();
      this.setState({ roundTechAttachmentUuid });
    } else {
      this.fetchTechAttachment(this.state.roundTechAttachmentUuid, 2);
    }

    // 议价阶段商务附件 3
    if (this.props.bargainBusUuid) {
      this.fetchBusinessAttachment(this.props.bargainBusUuid, 3);
      this.setState({ bargainBusinessAttachmentUuid: this.props.bargainBusUuid });
    } else if (this.state.bargainBusinessAttachmentUuid === null) {
      const bargainBusinessAttachmentUuid = uuid();
      this.setState({ bargainBusinessAttachmentUuid });
    } else {
      this.fetchBusinessAttachment(this.state.bargainBusinessAttachmentUuid, 3);
    }
    // 议价阶段技术附件 3
    if (this.props.bargainTechUuid) {
      this.fetchTechAttachment(this.props.bargainTechUuid, 3);
      this.setState({ bargainTechAttachmentUuid: this.props.bargainTechUuid });
    } else if (this.state.bargainTechAttachmentUuid === null) {
      const bargainTechAttachmentUuid = uuid();
      this.setState({ bargainTechAttachmentUuid });
    } else {
      this.fetchTechAttachment(this.state.bargainTechAttachmentUuid, 3);
    }
  }

  /**
   * 查询商务附件
   */
  @Bind()
  fetchBusinessAttachment(businessAttachmentUuid, flag) {
    const { bucketName } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        attachmentUUID: businessAttachmentUuid,
      }).then((response) => {
        const name =
          Number(flag) === 2
            ? 'roundBusinessAttachments'
            : Number(flag) === 3
            ? 'bargainBusinessAttachments'
            : 'businessAttachments';
        this.setState({
          [name]:
            response &&
            response.map((item, index) => ({
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
  fetchTechAttachment(techAttachmentUuid, flag) {
    const { bucketName } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        attachmentUUID: techAttachmentUuid,
      }).then((response) => {
        const name =
          Number(flag) === 2
            ? 'roundTechAttachments'
            : Number(flag) === 3
            ? 'bargainTechAttachments'
            : 'techAttachments';
        this.setState({
          [name]:
            response &&
            response.map((item, index) => ({
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
  uploadData(file, fileType, flag) {
    const {
      businessUuid,
      techUuid,
      bargainBusUuid,
      bargainTechUuid,
      roundBusUuid,
      roundTechUuid,
    } = this.props;
    const {
      businessAttachmentUuid,
      techAttachmentUuid,
      bargainTechAttachmentUuid,
      bargainBusinessAttachmentUuid,
      roundTechAttachmentUuid,
      roundBusinessAttachmentUuid,
    } = this.state;
    const attachmentUUID =
      Number(flag) === 2
        ? `${fileType}` === 'roundBusiness'
          ? roundBusUuid || roundBusinessAttachmentUuid
          : roundTechUuid || roundTechAttachmentUuid
        : Number(flag) === 3
        ? `${fileType}` === 'bargainBusiness'
          ? bargainBusUuid || bargainBusinessAttachmentUuid
          : bargainTechUuid || bargainTechAttachmentUuid
        : `${fileType}` === 'business'
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
  onUploadSuccess(flag) {
    const {
      businessUuid,
      techUuid,
      bargainBusUuid,
      bargainTechUuid,
      roundBusUuid,
      roundTechUuid,
      initUpload,
    } = this.props;
    const {
      businessAttachmentUuid,
      techAttachmentUuid,
      bargainTechAttachmentUuid,
      bargainBusinessAttachmentUuid,
      roundTechAttachmentUuid,
      roundBusinessAttachmentUuid,
    } = this.state;
    if (Number(flag) === 1) {
      if (!businessUuid || !techUuid) {
        if (isFunction(initUpload)) {
          initUpload({
            businessAttachmentUuid,
            techAttachmentUuid,
          });
        }
      }
    } else if (Number(flag) === 2) {
      if (!(roundBusUuid && roundTechUuid)) {
        if (isFunction(initUpload)) {
          initUpload({
            roundBusinessAttachmentUuid,
            roundTechAttachmentUuid,
          });
        }
      }
    } else if (Number(flag) === 3) {
      if (!(bargainBusUuid && bargainTechUuid)) {
        if (isFunction(initUpload)) {
          initUpload({
            bargainBusinessAttachmentUuid,
            bargainTechAttachmentUuid,
          });
        }
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
  removeFile(file, fileType, flag) {
    const {
      businessUuid,
      techUuid,
      bucketName,
      bargainBusUuid,
      bargainTechUuid,
      roundBusUuid,
      roundTechUuid,
      initUpload,
    } = this.props;
    const { fileList } = this.state;
    const attachmentUUID =
      Number(flag) === 1
        ? `${fileType}` === 'business'
          ? businessUuid || this.state.businessAttachmentUuid
          : techUuid || this.state.techAttachmentUuid
        : Number(flag) === 2
        ? `${fileType}` === 'roundBusiness'
          ? roundBusUuid || this.state.roundBusinessAttachmentUuid
          : roundTechUuid || this.state.roundTechAttachmentUuid
        : `${fileType}` === 'bargainBusiness'
        ? bargainBusUuid || this.state.bargainBusinessAttachmentUuid
        : bargainTechUuid || this.state.bargainTechAttachmentUuid;
    removeFileOrg({
      attachmentUUID,
      bucketName,
      urls: [file.response],
    }).then((res) => {
      if (res) {
        if (Number(flag) === 2) {
          const businessFlag = this.fetchBusinessAttachment(roundBusUuid, flag);
          const techFlag = this.fetchTechAttachment(roundTechUuid, flag);
          this.setState({
            fileList: fileList.filter((o) => o.uid !== file.uid),
          });
          Promise.all([businessFlag, techFlag]).then((result) => {
            if (result) {
              const {
                roundTechAttachments,
                roundBusinessAttachments,
                roundBusinessAttachmentUuid,
                roundTechAttachmentUuid,
              } = this.state;
              if (roundTechAttachments?.length === 0 && roundBusinessAttachments?.length === 0) {
                if (isFunction(initUpload)) {
                  initUpload({
                    roundBusinessAttachmentUuid,
                    roundTechAttachmentUuid,
                  });
                }
              }
            }
          });
        } else if (Number(flag) === 3) {
          const businessFlag = this.fetchBusinessAttachment(bargainBusUuid, flag);
          const techFlag = this.fetchTechAttachment(bargainTechUuid, flag);
          this.setState({
            fileList: fileList.filter((o) => o.uid !== file.uid),
          });
          Promise.all([businessFlag, techFlag]).then((result) => {
            if (result) {
              const {
                bargainBusinessAttachments,
                bargainTechAttachments,
                bargainBusinessAttachmentUuid,
                bargainTechAttachmentUuid,
              } = this.state;
              if (
                bargainBusinessAttachments?.length === 0 &&
                bargainTechAttachments?.length === 0
              ) {
                if (isFunction(initUpload)) {
                  initUpload({
                    bargainBusinessAttachmentUuid,
                    bargainTechAttachmentUuid,
                  });
                }
              }
            }
          });
        } else {
          const businessFlag = this.fetchBusinessAttachment(businessUuid, flag);
          const techFlag = this.fetchTechAttachment(techUuid, flag);
          this.setState({
            fileList: fileList.filter((o) => o.uid !== file.uid),
          });
          Promise.all([businessFlag, techFlag]).then((result) => {
            if (result) {
              const {
                businessAttachments,
                techAttachments,
                businessAttachmentUuid,
                techAttachmentUuid,
              } = this.state;
              if (businessAttachments?.length === 0 && techAttachments?.length === 0) {
                if (isFunction(initUpload)) {
                  initUpload({
                    businessAttachmentUuid,
                    techAttachmentUuid,
                  });
                }
              }
            }
          });
        }
      }
    });
  }

  getAttachmentUuid = ({ flag = 1, viewOnly = false }) => {
    const {
      businessAttachmentUuid, // 打开模态框新建的uuid 自动生成商务附件uuid
      techAttachmentUuid, // 打开模态框新建的uuid 自动生成技术附件uuid
      bargainTechAttachmentUuid,
      bargainBusinessAttachmentUuid,
      roundTechAttachmentUuid,
      roundBusinessAttachmentUuid,
    } = this.state;
    let CurrentBusinessUuid = null;
    let CurrentTechUuid = null;

    if (flag === 1 && !viewOnly) {
      CurrentBusinessUuid = businessAttachmentUuid;
      CurrentTechUuid = techAttachmentUuid;
    }

    if (flag === 2 && !viewOnly) {
      CurrentBusinessUuid = roundBusinessAttachmentUuid;
      CurrentTechUuid = roundTechAttachmentUuid;
    }

    if (flag === 3 && !viewOnly) {
      CurrentBusinessUuid = bargainBusinessAttachmentUuid;
      CurrentTechUuid = bargainTechAttachmentUuid;
    }

    return {
      CurrentBusinessUuid,
      CurrentTechUuid,
    };
  };

  @Bind()
  renderData(viewOnly, showRemoveIcon, businessData, techData, flag, business, tech) {
    const organizationId = getCurrentOrganizationId();
    const {
      bucketName,
      bucketDirectory,
      showBusinessAttachment = true,
      record = {},
      manageAttachment,
    } = this.props;
    const { CurrentBusinessUuid = null, CurrentTechUuid = null } = this.getAttachmentUuid({
      flag,
      viewOnly,
    });
    const renderProps = {
      record,
    };

    return (
      <Row>
        {manageAttachment
          ? manageAttachment.render(
              'RENDER_ATTACHMENT_QUOTE',
              showBusinessAttachment && (
                <Col span={12}>
                  {Number(flag) === 1 && (
                    <p style={titleStyle}>
                      {intl.get(`ssrc.supplierQuotation.model.supQuo.busiAttach`).d('商务附件')}：
                    </p>
                  )}
                  {business === 'bargainBusiness' ? (
                    <p style={titleStyle}>
                      {intl
                        .get('ssrc.supplierQuotation.model.supQuo.barginBusiAttach')
                        .d('议价商务附件')}
                      ：
                    </p>
                  ) : business === 'roundBusiness' ? (
                    <p style={titleStyle}>
                      {intl
                        .get('ssrc.supplierQuotation.model.supQuo.roundBusiAttach')
                        .d('多轮商务附件')}
                      ：
                    </p>
                  ) : (
                    ''
                  )}
                  <UploadButton
                    filePreview
                    viewOnly={viewOnly}
                    multiple
                    listType="picture-card"
                    fileList={businessData}
                    // onPreview={this.handlePreview}
                    bucketName={bucketName}
                    bucketDirectory={bucketDirectory}
                    // uploadData={(e) => this.uploadData(e, business, flag)}
                    tenantId={organizationId}
                    action={`${HZERO_FILE}/v1${
                      isUndefined(organizationId) ? '/' : `/${organizationId}/`
                    }files/attachment/multipart`}
                    onRemove={(e) => this.removeFile(e, business, flag)}
                    onUploadSuccess={() => this.onUploadSuccess(flag)}
                    showUploadList={{
                      removePopConfirmTitle: intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？'),
                      showRemoveIcon,
                    }}
                    attachmentUUID={CurrentBusinessUuid}
                    {...ChunkUploadProps}
                  />
                </Col>
              ),
              renderProps
            )
          : showBusinessAttachment && (
          <Col span={12}>
            {Number(flag) === 1 && (
            <p style={titleStyle}>
              {intl.get(`ssrc.supplierQuotation.model.supQuo.busiAttach`).d('商务附件')}：
            </p>
                )}
            {business === 'bargainBusiness' ? (
              <p style={titleStyle}>
                {intl
                      .get('ssrc.supplierQuotation.model.supQuo.barginBusiAttach')
                      .d('议价商务附件')}
                    ：
              </p>
                ) : business === 'roundBusiness' ? (
                  <p style={titleStyle}>
                    {intl
                      .get('ssrc.supplierQuotation.model.supQuo.roundBusiAttach')
                      .d('多轮商务附件')}
                    ：
                  </p>
                ) : (
                  ''
                )}
            <UploadButton
              filePreview
              viewOnly={viewOnly}
              multiple
              listType="picture-card"
              fileList={businessData}
                  // onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
                  // uploadData={(e) => this.uploadData(e, business, flag)}
              tenantId={organizationId}
              action={`${HZERO_FILE}/v1${
                    isUndefined(organizationId) ? '/' : `/${organizationId}/`
                  }files/attachment/multipart`}
              onRemove={(e) => this.removeFile(e, business, flag)}
              onUploadSuccess={() => this.onUploadSuccess(flag)}
              showUploadList={{
                    removePopConfirmTitle: intl
                      .get('hzero.common.message.confirm.delete')
                      .d('是否删除此条记录？'),
                    showRemoveIcon,
                  }}
              attachmentUUID={CurrentBusinessUuid}
              {...ChunkUploadProps}
            />
          </Col>
            )}
        <Col span={12}>
          {Number(flag) === 1 && (
            <p style={titleStyle}>
              {intl.get(`ssrc.supplierQuotation.model.supQuo.techAttach`).d('技术附件')}：
            </p>
          )}
          {business === 'bargainBusiness' ? (
            <p style={titleStyle}>
              {intl.get('ssrc.supplierQuotation.model.supQuo.barginTechAttach').d('议价技术附件')}：
            </p>
          ) : business === 'roundBusiness' ? (
            <p style={titleStyle}>
              {intl.get('ssrc.supplierQuotation.model.supQuo.roundTechAttach').d('多轮技术附件')}：
            </p>
          ) : (
            ''
          )}
          <UploadButton
            filePreview
            viewOnly={viewOnly}
            multiple
            listType="picture-card"
            fileList={techData}
            onPreview={this.handlePreview}
            bucketName={bucketName}
            bucketDirectory={bucketDirectory}
            // uploadData={(e) => this.uploadData(e, tech, flag)}
            tenantId={organizationId}
            action={`${HZERO_FILE}/v1${
              isUndefined(organizationId) ? '/' : `/${organizationId}/`
            }files/attachment/multipart`}
            onRemove={(e) => this.removeFile(e, tech, flag)}
            onUploadSuccess={() => this.onUploadSuccess(flag)}
            showUploadList={{
              removePopConfirmTitle: intl
                .get('hzero.common.message.confirm.delete')
                .d('是否删除此条记录？'),
              showRemoveIcon,
            }}
            attachmentUUID={CurrentTechUuid}
            {...ChunkUploadProps}
          />
        </Col>
      </Row>
    );
  }

  render() {
    const { viewOnly = false, quotationHeader = {}, roundFlag = 0 } = this.props;
    const bargainFlag = quotationHeader && quotationHeader.bargainFlag; // 议价
    const {
      businessAttachments,
      techAttachments,
      previewVisible,
      previewFileName,
      previewImage,
      bargainBusinessAttachments = [], // 议价补充技术附件
      bargainTechAttachments = [], // 议价补充技术附件
      roundTechAttachments = [], // 多轮报价补充商务附件
      roundBusinessAttachments = [], // 多轮报价补充技术附件
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
        {this.renderData(
          viewOnly || Number(roundFlag) === 1 || Number(bargainFlag) === 1,
          !viewOnly && Number(roundFlag) === 0 && Number(bargainFlag) === 0,
          businessAttachments,
          techAttachments,
          1,
          'business',
          'tech'
        )}
        {this.renderData(
          viewOnly || Number(roundFlag) === 0,
          !viewOnly && Number(roundFlag) === 1,
          roundBusinessAttachments,
          roundTechAttachments,
          2,
          'roundBusiness',
          'roundTech'
        )}
        {this.renderData(
          viewOnly || Number(bargainFlag) === 0,
          !viewOnly && Number(bargainFlag) === 1,
          bargainBusinessAttachments,
          bargainTechAttachments,
          3,
          'bargainBusiness',
          'bargainTech'
        )}
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
