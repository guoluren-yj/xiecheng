import React, { Component } from 'react';
import { Card, Icon, Modal, Popconfirm, Upload, Spin } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Viewer from 'react-viewer';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import style from './index.less';

const DEFAULT_BUCKET_NAME = 'spfm-comp';
/**
 * 使用UUID上传组件
 * @extends {Component} - React.Component
 * @reactProps {?String} bucketName - 附件桶
 * @reactProps {?function} onUploadSuccess -上传成功后的回调
 * @reactProps {?function} removeCallback - 删除文件后回调
 * @reactProps {?Boolean} viewOnly - 是否只读
 * @return React.element
 */
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      previewVisible: false,
      loading: false,
      fileList: [], // 新上传图片
      previewImages: [], // 图片预览
    };
  }

  /**
   * 格式化已经上传的文件列表
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  @Bind()
  changeFileList(response) {
    const { bucketName = DEFAULT_BUCKET_NAME, bucketDirectory, tenantId } = this.props;
    const accessToken = getAccessToken();
    return response.map((res, itemIndex) => {
      return {
        uid: itemIndex + 1,
        name: res.fileName,
        status: 'done',
        url: `${HZERO_FILE}/v1${
          !isUndefined(tenantId) ? `/${tenantId}/` : '/'
        }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
          !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
        }url=${res.fileUrl}`,
      };
    });
  }

  /**
   * 上传之前检查图片格式
   * @params {Object} file -文件信息
   * @param fileType -上传文件类型
   * @param fileSize -上传文件大小
   */
  @Bind()
  beforeUpload(file) {
    const { fileType = 'image/jpeg;image/png;image/jpg', fileSize = 10 * 1024 * 1024 } = this.props;
    if (fileType && fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('scec.common.upload.error.type', { fileType })
          .d(`不支持的文件类型，上传类型可为${fileType}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (!file.type) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl.get('hzero.common.upload.error.type.null').d('上传文件类型缺失，请检查类型'),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewImages: [
        {
          src: file.imagePath,
          alt: file.name, // 由于下方会显示 alt 所以这里给空字符串 file.name,
        },
      ],
      previewVisible: true,
    });
  }

  /**
   * 图片预览取消
   */
  @Bind()
  handlePreviewCancel() {
    this.setState({
      previewImages: [],
      previewVisible: false,
    });
  }

  /**
   * 删除文件
   * @param {*} file 文件
   * @memberof UploadModal
   */
  @Bind()
  removeFile(file) {
    const { removeCallback } = this.props;
    if (removeCallback) {
      removeCallback(file);
    }
  }

  /**
   * 主图切换
   */
  @Bind()
  selectPrimaryImg(event) {
    const { onSelectPrimaryImg } = this.props;
    if (onSelectPrimaryImg) {
      const flag = parseInt(event.currentTarget.getAttribute('index'), 10);
      onSelectPrimaryImg(flag);
    }
  }

  /**
   * 上传中数据改变时，监听是否上传成功
   */
  @Bind()
  handleChange(info) {
    const { onUploadSuccess } = this.props;
    const { file } = info;
    this.setState({
      loading: true,
    });
    if (file.status === 'error') {
      notification.error({
        message: file.response.message || intl.get(`scec.common.warning.uploadFail`).d('上传失败'),
      });
      this.setState({
        loading: false,
      });
      return;
    }
    // // 取出上传成功的图片
    // let fileFilterList = fileList.filter(o => {
    //   return o.status === 'done';
    // });
    if (file.status === 'done') {
      this.setState(
        {
          fileList: [file],
          loading: false,
        },
        () => {
          notification.success({
            message: intl.get(`scec.common.success.uploadSuccess`).d('上传成功'),
          });
          onUploadSuccess(this.state.fileList);
        }
      );
    }
  }

  render() {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      viewOnly = false,
      defaultFileList = [], // 数据表中存在的数据
      currentIndex,
    } = this.props;
    const { previewVisible, previewImages, loading = false, tenantId } = this.state;
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="">{intl.get(`scec.common.model.uploadImage`).d('上传图片')}</div>
      </div>
    );
    return (
      <React.Fragment>
        <div
          className={style.uploadPhoto}
          style={defaultFileList.length > 0 ? { width: '60%' } : { width: '77%' }}
        >
          {
            <ul className={style['upload-ul']}>
              <li style={{ marginTop: '30px', float: 'left', marginRight: '8px' }}>
                <Spin spinning={loading}>
                  <Upload
                    headers={headers}
                    action={`${HZERO_FILE}/v1/${tenantId}/files/multipart?bucketName=${bucketName}`}
                    listType="picture-card"
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    beforeUpload={this.beforeUpload}
                    showUploadList={false}
                  >
                    {!viewOnly && uploadButton}
                  </Upload>
                </Spin>
              </li>
              {defaultFileList.map((item, indexImg) => {
                return (
                  <li className={style['upload-li']}>
                    <div className={currentIndex === indexImg ? style.selected : style.noSelect}>
                      <span>
                        {intl.get('scec.goodsMaintain.model.goodsMaintain.master.map').d('主图')}
                      </span>
                      <div className="photoCard" style={{ width: '114px', padding: '5px 5px' }}>
                        <Card bodyStyle={{ padding: '5px', width: '104px', height: '124px' }}>
                          <div
                            className={style['upload-img']}
                            onClick={this.selectPrimaryImg}
                            key={item.imagePath}
                            index={indexImg}
                          >
                            <a>
                              <img
                                alt={item.imageName}
                                style={{ width: '92px', height: '90px' }}
                                src={item.imagePath}
                              />
                            </a>
                          </div>
                          <div>
                            <Icon
                              type="eye-o"
                              className={style['photo-eye']}
                              onClick={() => this.handlePreview(item)}
                            />
                            <Popconfirm
                              title={intl
                                .get('scec.goodsMaintain.model.goodsMaintain.sure.deletion')
                                .d('你确认删除吗')}
                              onConfirm={() => this.removeFile(item)}
                              okText={intl.get('scec.common.action.sure').d('确定')}
                              cancelText={intl.get('scec.common.action.cancel').d('取消')}
                            >
                              <Icon
                                type="delete"
                                className={style['photo-delete']}
                                style={{ marginLeft: '10px' }}
                              />
                            </Popconfirm>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          }
          <Modal footer={null} onCancel={this.handleCancel}>
            <img alt="" src={previewImages} style={{ width: '100%' }} />
          </Modal>
        </div>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={this.handlePreviewCancel}
          images={previewImages}
        />
      </React.Fragment>
    );
  }
}
