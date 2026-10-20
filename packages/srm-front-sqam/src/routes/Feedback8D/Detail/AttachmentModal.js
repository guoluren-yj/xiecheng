/*
 * Attachment - 8D反馈-详情页面附件上传
 * @date: 2018-12-17
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Icon, Spin, Upload, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken } from 'utils/utils';

export default class AttachmentModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: getAccessToken(),
      supplierLoading: false,
    };
  }

  /**
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    // 新上传文件
    const { attachmentUUID, supplierBucketDirectory } = this.props;
    return {
      attachmentUUID,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      directory: supplierBucketDirectory,
      fileName: file.name,
    };
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   * @param {Array} files // 已经存在的附件
   */
  @Bind()
  beforeUpload(file) {
    const { supplierAttachments, onBeforeUpload, storageSize } = this.props;
    const { fileSize = storageSize * 1024 * 1024 } = this.props;
    const temp = { file };
    if (temp.file.size > fileSize) {
      temp.status = 'error';
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      notification.error(res);
      temp.response = res;
      return false;
    }
    this.setState({
      supplierLoading: true,
    });
    onBeforeUpload({ supplierAttachments: [...supplierAttachments, file] });
    return true;
  }

  /**
   * 附件预览
   * @param {Object} file
   * */
  @Bind()
  onUploadPreview(file, bucketName) {
    const { tenantId } = this.props;
    const { accessToken } = this.state;
    const formatUrl = encodeURIComponent(file.response);
    const url = `${HZERO_FILE}/v1/${tenantId}/files/download?access_token=${accessToken}&bucketName=${bucketName}&url=${formatUrl}`;
    window.open(url, '_blank');
  }

  @Bind
  onProgress(e) {
    if (e.percent === 100) {
      this.setState({
        supplierLoading: false,
      });
    }
  }

  render() {
    const {
      loading,
      visible,
      tenantId,
      purchaserAttachments,
      supplierAttachments,
      bucketName,
      onCancel,
      onRemove,
      storageSize,
    } = this.props;
    const { accessToken, supplierLoading } = this.state;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const downloadProps = {
      headers,
      showUploadList: {
        showRemoveIcon: false,
      },
      // listType: "picture-card",
      // className: 'upload-list-inline',
      fileList: purchaserAttachments,
      onPreview: (val) => this.onUploadPreview(val, bucketName),
    };

    const uploadProps = {
      headers,
      onRemove,
      fileList: supplierAttachments,
      name: 'file',
      multiple: true,
      data: this.uploadData,
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      beforeUpload: this.beforeUpload,
      onPreview: (val) => this.onUploadPreview(val, bucketName),
      onProgress: this.onProgress,
    };
    return (
      <Modal
        visible={visible}
        width={600}
        title={intl.get(`entity.attachment.tag`).d('附件')}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
      >
        <Spin spinning={loading || false}>
          <Row>
            <Col span={11}>
              <p>{intl.get(`entity.attachment.type.purchaser`).d('采购方附件')}：</p>
              <Upload {...downloadProps} />
            </Col>
            <Col span={11} style={{ marginLeft: 46 }}>
              <Spin spinning={supplierLoading}>
                <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-text">
                    {/* 单击或拖动附件({storageSize}Mb以下)到此区域进行上传 */}
                    {intl.get(`hzero.common.upload.befroetText`).d(`单击或拖动附件(`)}
                    {storageSize}
                    {intl.get(`hzero.common.upload.afterContent`).d(`Mb以下)到此区域进行上传`)}
                  </p>
                  <p className="ant-upload-hint">
                    {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
                  </p>
                </Upload.Dragger>
              </Spin>
            </Col>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
