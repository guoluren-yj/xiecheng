/*
 * Attachment - 8D反馈-详情页面附件上传
 * @date: 2018-12-17
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Spin, Upload, Button } from 'hzero-ui';
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
  beforeUpload(file, files) {
    const { supplierAttachments, onBeforeUpload } = this.props;
    const { fileSize = 10 * 1024 * 1024 } = this.props;
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
    onBeforeUpload({ supplierAttachments: [...supplierAttachments, ...files] });
    return true;
  }

  /**
   * 附件变更
   * @param {Object} info
   */
  @Bind()
  onUploadChange(info) {
    const { status } = info.file;
    if (status === 'done') {
      notification.success();
    } else if (status === 'error') {
      notification.error();
    }
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

  render() {
    const {
      loading,
      visible,
      purchaserAttachments,
      supplierAttachments,
      bucketName,
      onCancel,
      onRemove,
      interPurchaserAttachments,
    } = this.props;
    const { accessToken } = this.state;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const purchaserAttachmentProps = {
      headers,
      showUploadList: {
        showRemoveIcon: false,
      },
      fileList: purchaserAttachments,
      onPreview: (val) => this.onUploadPreview(val, bucketName),
    };
    const supplierAttachmentProps = {
      headers,
      onRemove,
      showUploadList: {
        showRemoveIcon: false,
      },
      fileList: supplierAttachments,
      onPreview: (val) => this.onUploadPreview(val, bucketName),
    };

    const interPurchaserAttachmentProps = {
      headers,
      onRemove,
      showUploadList: {
        showRemoveIcon: false,
      },
      fileList: interPurchaserAttachments,
      onPreview: (val) => this.onUploadPreview(val, bucketName),
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
              <p>{intl.get(`entity.attachment.type.purchaser.out`).d('采购方外部附件')}：</p>
              <Upload {...purchaserAttachmentProps} />
            </Col>
            <Col span={11} style={{ marginLeft: 46 }}>
              <p>{intl.get(`entity.attachment.type.purchaser.inter`).d('采购方内部附件')}：</p>
              <Upload {...interPurchaserAttachmentProps} />
            </Col>
          </Row>
          <Row>
            <Col span={11} style={{ marginTop: 20 }}>
              <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
              <Upload {...supplierAttachmentProps} />
            </Col>
          </Row>
        </Spin>
      </Modal>
    );
  }
}
