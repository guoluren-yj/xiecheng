/**
 * OcrUpload.js - OCR照片墙
 * @date: 2019-07-31
 * @author: yangou <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Upload, Icon } from 'hzero-ui';

import { getCurrentOrganizationId, getAccessToken, getAttachmentUrl } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';

const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const bucketDirectory = 'finance-invoice';
export default class OcrUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: [],
      fileList: [],
      tenantId: getCurrentOrganizationId(),
      accessToken: getAccessToken(),
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 关闭OCR
   */
  @Bind
  handleCancel() {
    this.setState({
      previewVisible: false,
    });
  }

  /**
   * 预览图片
   */
  @Bind
  handlePreview(file) {
    this.setState({
      previewImage: [
        {
          src: file.url || file.thumbUrl,
          alt: '',
        },
      ],
      previewVisible: true,
    });
  }

  /**
   * 上传文件改变时的状态
   */
  @Bind
  handleChange({ file, fileList }) {
    const { setOcrLoading } = this.props;
    setOcrLoading(fileList.some((e) => e.status === 'uploading'));
    const { status, uid } = file;
    let list = fileList || [];
    if (status === 'done') {
      const { tenantId } = this.state;
      list = fileList.map((f) => {
        const { response } = f;
        if (response && response.failed === true) {
          notification.error({
            message: intl.get('hzero.common.upload.status.error').d('上传失败'),
            description: response.message,
          });
          Object.assign(f, { status: 'error' });
        }
        return {
          ...f,
          url:
            f.uid === uid
              ? getAttachmentUrl(f.response, bucketName, tenantId, bucketDirectory)
              : null,
        };
      });
    }
    this.setState({
      fileList: list.filter((f) => {
        if (f.status === 'error') {
          notification.warning({
            message: intl.get(`hzero.common.upload.status.error`).d(`上传失败`),
          });
        }
        return f.status !== 'error';
      }),
    });
  }

  /**
   * 上传所需参数
   */
  @Bind()
  uploadData(file) {
    return {
      fileName: file.name,
      bucketName,
      directory: bucketDirectory,
    };
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize } = this.props;
    if (!fileSize) return true;
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

  render() {
    const { previewVisible, previewImage, fileList, tenantId, accessToken } = this.state;
    const { accept = '.jpg,.jpeg,.png,.bmp,.pdf,.ofd' } = this.props;
    const urlAction = `${HZERO_FILE}/v1/${tenantId}/files/multipart`;
    return (
      <Fragment>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          beforeUpload={this.beforeUpload}
          showUploadList={{
            removePopConfirmTitle: intl
              .get(`sfin.invoiceBill.view.message.title.isDelete`)
              .d('是否删除'),
          }}
          action={urlAction}
          accept={accept}
          onChange={this.handleChange}
          data={this.uploadData}
          headers={{
            Authorization: `bearer ${accessToken}`,
          }}
        >
          <Fragment>
            <Icon type="plus" />
            <div>{intl.get(`sfin.invoiceBill.view.message.title.upload`).d('上传')}</div>
          </Fragment>
        </Upload>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={this.handleCancel}
          images={previewImage}
        />
      </Fragment>
    );
  }
}
