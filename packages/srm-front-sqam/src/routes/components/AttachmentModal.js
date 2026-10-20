/*
 * Attachment - 8D反馈-详情页面附件上传
 * @date: 2018-12-17
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Spin, Upload, Button, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getAccessToken } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { connect } from 'dva';

@connect(({ create8D }) => ({
  create8D,
}))
export default class AttachmentModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: getAccessToken(),
      outLoading: false,
      interLoading: false,
    };
  }

  /**
   * 附件预览
   * @param {Object} file
   * */
  @Bind()
  onPurchaserUploadPreview(file, bucketName, directory) {
    const { tenantId } = this.props;
    const { accessToken } = this.state;
    const formatUrl = encodeURIComponent(file.response);
    const url = `${HZERO_FILE}/v1/${tenantId}/files/download?access_token=${accessToken}&bucketName=${bucketName}&directory=${directory}&url=${formatUrl}`;
    window.open(url, '_blank');
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   * @param {Array} files // 已经存在的附件
   */
  @Bind()
  beforeUpload(file) {
    const { purchaserAttachments, onBeforeUpload, storageSize } = this.props;
    // dispatch({
    //   type: 'create8D/fetchUploadInfo',
    // }).then((res) => {
    //   console.log(res.storageSize)
    //   // eslint-disable-next-line
    //   const { storageSize } = res || {};
    // });

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
      outLoading: true,
    });
    onBeforeUpload({ purchaserAttachments: [...purchaserAttachments, file] });
    return true;
  }

  /**
   * 上传内部附件之前校验
   * @param {Object} file // 当前上传的附件
   * @param {Array} files // 已经存在的附件
   */
  @Bind()
  beforeInterUpload(file) {
    const { interPurchaserAttachments, onBeforeUpload, storageSize } = this.props;
    const { fileSize = storageSize * 1024 * 1024 } = this.props;
    // console.log(storageSize)
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
      interLoading: true,
    });
    onBeforeUpload({ interPurchaserAttachments: [...interPurchaserAttachments, file] });
    return true;
  }

  @Bind()
  onSupplierUploadPreview(file, bucketName, directory) {
    const { tenantId } = this.props;
    const { accessToken } = this.state;
    const formatUrl = encodeURIComponent(file.response);
    const url = `${HZERO_FILE}/v1/${tenantId}/files/download?access_token=${accessToken}&bucketName=${bucketName}&directory=${directory}&url=${formatUrl}`;
    window.open(url, '_blank');
  }

  /**
   * 上传附件
   * @param {Object} file
   */
  @Bind()
  uploadData(file) {
    // 新上传文件
    const { attachmentUuid, purchaserDirectory } = this.props;
    return {
      attachmentUUID: attachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      directory: purchaserDirectory,
      fileName: file.name,
    };
  }

  /**
   * 上传内部附件
   * @param {Object} file
   */
  @Bind()
  uploadInterData(file) {
    // 新上传文件
    const { attachmentInterUuid, interPurchaseDirectory } = this.props;
    return {
      attachmentUUID: attachmentInterUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      directory: interPurchaseDirectory,
      fileName: file.name,
    };
  }

  @Bind
  onProgress(e) {
    if (e.percent === 100) {
      this.setState({
        outLoading: false,
      });
    }
  }

  @Bind
  onProgressInter(e) {
    if (e.percent === 100) {
      this.setState({
        interLoading: false,
      });
    }
  }

  render() {
    const {
      loading,
      visible,
      purchaserAttachments,
      interPurchaserAttachments,
      supplierAttachments,
      // supplierBucket,
      // purchaserBucket,
      purchaserDirectory,
      interPurchaseDirectory,
      tenantId,
      bucketName,
      onCancel,
      onRemove,
      onInterRemove,
      model,
      storageSize,
    } = this.props;
    const { accessToken, outLoading, interLoading } = this.state;
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const purchaserAttachmentProps = {
      headers,
      fileList: purchaserAttachments,
      multiple: true,
      name: 'file',
      data: this.uploadData,
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      onRemove,
      beforeUpload: this.beforeUpload,
      onPreview: (val) => this.onPurchaserUploadPreview(val, bucketName, purchaserDirectory),
      onProgress: this.onProgress,
    };
    const interPurchaserAttachmentProps = {
      headers,
      fileList: interPurchaserAttachments,
      multiple: true,
      name: 'file',
      data: this.uploadInterData,
      action: `${HZERO_FILE}/v1/${tenantId}/files/attachment/multipart`,
      onRemove: onInterRemove,
      beforeUpload: this.beforeInterUpload,
      onPreview: (val) => this.onPurchaserUploadPreview(val, bucketName, interPurchaseDirectory),
      onProgress: this.onProgressInter,
    };
    const supplierAttachmentProps = {
      headers,
      onRemove,
      showUploadList: {
        showRemoveIcon: false,
      },
      fileList: supplierAttachments,
      onPreview: (val) => this.onSupplierUploadPreview(val, bucketName, purchaserDirectory),
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
              <Spin spinning={outLoading}>
                <p>{intl.get(`entity.attachment.type.purchaser.out`).d('采购方外部附件')}：</p>
                <Upload.Dragger {...purchaserAttachmentProps}>
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-hint">
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
            <Col span={11} style={{ marginLeft: 46 }}>
              <Spin spinning={interLoading}>
                <p>{intl.get(`entity.attachment.type.purchaser.inter`).d('采购方内部附件')}：</p>
                <Upload.Dragger {...interPurchaserAttachmentProps}>
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-hint">
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
          {model === 'un' && (
            <Row>
              <Col span={11} style={{ marginTop: 20 }}>
                <p>{intl.get(`entity.attachment.type.supplier`).d('供应商附件')}：</p>
                <Upload {...supplierAttachmentProps} />
              </Col>
            </Row>
          )}
        </Spin>
      </Modal>
    );
  }
}
