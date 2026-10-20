/**
 * OcrUpload.js - OCR照片墙
 * @date: 2019-07-31
 * @author: yangou <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { uniqBy, isFunction, isEmpty } from 'lodash';
import { Icon } from 'hzero-ui';
import Upload from '_components/Upload/UploadButton';

import intl from 'utils/intl';
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
      successFileNameList: [], // 同一批OCR识别的过程中存在失败的附件，存在已识别成功的用作过滤
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
    const { successFileNameList } = this.state;
    const { modal, setOcrLoading } = this.props;
    const ocrLoading = fileList.some(
      (e) => e.status === 'uploading' && !successFileNameList.includes(e.name)
    );
    // 兼容C7N弹窗的按钮loading
    if (isFunction(modal?.update)) modal.update({ okProps: { loading: ocrLoading } });
    if (isFunction(setOcrLoading)) setOcrLoading(ocrLoading);
    const list = uniqBy(
      [...this.state.fileList, ...fileList].filter((v) => v.status === 'done'),
      'response'
    );
    this.setState({ fileList: list });
    // eslint-disable-line
    this.uploadChild.onChange({ file, fileList });
  }

  /**
   * 上传所需参数
   */
  @Bind()
  uploadData(file) {
    return {
      fileName: file.name,
    };
  }

  /**
   * 上传附件之前校验
   * @param {Object} file // 当前上传的附件
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize } = this.props;
    // 只校验有fileSize的
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

  // 上传新附件的时候避免将手工移除的附件带出
  @Bind()
  transformFileList(_, fileList) {
    const { successFileNameList } = this.state;
    if (isEmpty(successFileNameList)) return fileList;
    const newFileList = fileList.filter((item) => !successFileNameList.includes(item.name));
    return newFileList;
  }

  render() {
    const { help } = this.props;
    const { previewVisible, previewImage } = this.state;
    return (
      <Fragment>
        {help && <p style={{ color: 'rgba(0, 0, 0, 0.65)', lineHeight: 'initial' }}>{help}</p>}
        <Upload
          listType="picture-card"
          onPreview={this.handlePreview}
          showUploadList={{
            removePopConfirmTitle: intl
              .get(`ssta.invoiceSheet.view.message.title.isDelete`)
              .d('是否删除'),
          }}
          transformFileList={this.transformFileList}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
          uploadData={this.uploadData}
          bucketName={bucketName}
          bucketDirectory={bucketDirectory}
          onRef={(node) => {
            if (node) {
              this.uploadChild = node;
            }
          }}
        >
          <Fragment>
            <Icon type="plus" />
            <div>{intl.get(`ssta.invoiceSheet.view.message.title.upload`).d('上传')}</div>
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
