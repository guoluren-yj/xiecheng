/**
 * UploadFile - 上传附件
 * @date: 2020-09-07
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction, isEmpty } from 'lodash';
import uuid from 'uuid/v4';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryFileListOrg, removeFileOrg } from 'services/api';
import { HZERO_FILE } from 'utils/config';
import UploadButton from 'srm-front-boot/lib/components/Upload/UploadButton';
import { FIlESIZE, ChunkUploadProps, } from '@/utils/SsrcRegx';
import { PUBLIC_BUCKET } from '_utils/config';

const promptCode = 'ssrc.common';

/**
 * UploadFile - 附件上传纯组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {!boolean} [viewOnly=false] - 查看/上传 附件
 * @reactProps {!string} [attachmentUUID=''] - 头附件uuid
 * @reactProps {!string} [attachmentLabel=''] - 附件label
 * @reactProps {!string} [bucketName='public-bucket'] - 桶类型
 * @reactProps {!string} [bucketDirectory=''] - 附件文件夹
 * @reactProps {!Function} [afterUploadSuccess= ()=>{}] - 上传成功回调
 * @returns React.element
 */

export default class UploadFile extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      fileList: [], // 立项附件
      attachmentUUID: null,
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
      uploadFileVisible: false,
    };
  }

  /**
   * 处理接收数据
   */
  @Bind()
  processData() {
    const { attachmentUUID } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    if (attachmentUUID) {
      if (attachmentUUID !== stateAttachmentUUID) {
        // 避免重复请求
        this.fetchAttachment(attachmentUUID);
        this.setState({ attachmentUUID });
      }
    } else {
      // 假设props中不存在uuid, 则手动创建保存到state中, 当state中已经创建好后, 无需重新生成uuid
      if (stateAttachmentUUID) return;
      this.setState({ attachmentUUID: uuid() });
    }
  }

  /**
   * 查询寻源立项附件
   */
  @Bind()
  fetchAttachment(attachmentUUID) {
    const { bucketName = PUBLIC_BUCKET } = this.props;
    return new Promise((resolve) => {
      queryFileListOrg({
        bucketName,
        attachmentUUID,
      }).then((response) => {
        this.setState({
          fileList: response.map((item, index) => ({
            uid: index,
            name: item.fileName,
            type: item.fileType,
            status: 'done',
            size: item.fileSize,
            response: item.fileUrl,
            url: item.fileUrl,
          })),
        });
        resolve(response);
      });
    });
  }

  /**
   *上传
   */
  @Bind()
  uploadData() {
    const { attachmentUUID } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    return {
      attachmentUUID: attachmentUUID || stateAttachmentUUID,
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
  onUploadSuccess(file, fileList) {
    const { attachmentUUID, afterUploadSuccess } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    this.setState({
      fileList,
    });
    if (!attachmentUUID) {
      if (isFunction(afterUploadSuccess)) {
        afterUploadSuccess({
          attachmentUUID: stateAttachmentUUID,
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
  removeFile(file) {
    const { bucketName = PUBLIC_BUCKET, afterUploadSuccess } = this.props;
    const { fileList, attachmentUUID: stateAttachmentUUID } = this.state;
    removeFileOrg({
      bucketName,
      attachmentUUID: stateAttachmentUUID,
      // tenantId,
      urls: [file.response],
    }).then((res) => {
      if (res) {
        const filterFileList = fileList.filter((o) => o.response !== file.response);
        this.setState({
          fileList: filterFileList,
        });
        if (isEmpty(filterFileList) && isFunction(afterUploadSuccess)) {
          afterUploadSuccess({
            attachmentUUID: null,
          });
        }
        // this.fetchAttachment(stateAttachmentUUID).then(result => {
        //   if (result) {
        //     if (result.length === 0) {
        //       if (isFunction(afterUploadSuccess)) {
        //         afterUploadSuccess({
        //           attachmentUUID: null,
        //         });
        //       }
        //     }
        //   }
        // });
      }
    });
  }

  /**
   * 打开上传附件modal
   */
  @Bind()
  handleShowUploadModal() {
    this.setState({
      uploadFileVisible: true,
    });
    this.processData();
  }

  /**
   * 隐藏上传附件modal
   */
  @Bind()
  handleHideUploadModal() {
    this.setState({
      uploadFileVisible: false,
    });
  }

  render() {
    const {
      bucketDirectory,
      attachmentLabel = '',
      bucketName = PUBLIC_BUCKET,
      viewOnly = false,
    } = this.props;
    const {
      fileList,
      previewVisible,
      previewFileName,
      previewImage,
      uploadFileVisible = false,
    } = this.state;
    const organizationId = getCurrentOrganizationId();
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    const previewImageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };
    return (
      <Fragment>
        <Button icon={viewOnly ? 'paper-clip' : 'upload'} onClick={this.handleShowUploadModal}>
          {viewOnly
            ? intl.get(`${promptCode}.view.message.button.viewFile`).d('附件查看')
            : intl.get(`${promptCode}.view.message.button.uploadFile`).d('附件上传')}
        </Button>
        <Modal
          visible={uploadFileVisible}
          footer={null}
          onCancel={this.handleHideUploadModal}
          width={800}
        >
          <Row>
            <Col span={24}>
              <p>
                {attachmentLabel}
                {intl.get(`${promptCode}.model.common.attachments`).d('附件')}：
              </p>
              <UploadButton
                filePreview
                multiple
                listType="picture-card"
                viewOnly={viewOnly}
                fileList={fileList}
                fileSize={FIlESIZE}
                onPreview={this.handlePreview}
                bucketName={bucketName}
                bucketDirectory={bucketDirectory}
                uploadData={this.uploadData}
                tenantId={organizationId}
                action={`${HZERO_FILE}/v1${
                  isUndefined(organizationId) ? '/' : `/${organizationId}/`
                }files/attachment/multipart`}
                onRemove={(e) => this.removeFile(e)}
                onUploadSuccess={this.onUploadSuccess}
                showUploadList={{
                  removePopConfirmTitle: intl
                    .get('hzero.common.message.confirm.delete')
                    .d('是否删除此条记录？'),
                  showRemoveIcon: true,
                }}
                {...ChunkUploadProps}
              />
            </Col>
          </Row>
        </Modal>
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handlePreviewCancel}
          style={previewModalStyle}
        >
          <img alt={previewFileName} style={previewImageStyle} src={previewImage} />
        </Modal>
      </Fragment>
    );
  }
}
