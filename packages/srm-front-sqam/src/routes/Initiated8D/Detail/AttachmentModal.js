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
import intl from 'utils/intl';
import { getAccessToken } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

export default class AttachmentModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: getAccessToken(),
    };
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
      // purchaserBucket,
      // supplierBucket,
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
