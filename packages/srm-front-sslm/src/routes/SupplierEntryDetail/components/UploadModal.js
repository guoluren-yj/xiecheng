/*
 * FieldPropertyModal - 事件属性
 * @date: 2018/08/10 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Output, Form, Button } from 'choerodon-ui/pro';
import { isEmpty, isString } from 'lodash';
import { Upload, Icon } from 'choerodon-ui';
// import { Upload, Icon } from 'hzero-ui';
import { PRIVATE_BUCKET } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
// import classnames from 'classnames';
import { removeUploadFile } from 'services/api';

import intl from 'utils/intl';
import { getAccessToken, getResponse, getCurrentOrganizationId } from 'utils/utils';

import { updateLicenceUrl } from '@/services/enterpriseInformService';

import registerBusinessLicense from '@/assets/icon-register-business-license.png';
import uploadLicence from '@/assets/upload-licence.svg';
import styles from '../index.less';
import UploadCard from './UploadCard';

const { Dragger } = Upload;
const tenantId = getCurrentOrganizationId();

const bucketDirectory = 'spfm-comp';
const accept = 'image/jpeg,image/jpg,image/png,image/bmp,application/pdf';

export default class UploadModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      // newUploadFlag: false,
    };
  }

  componentDidMount() {
    const { dataSet, firstUploadFlag = false } = this.props;
    const { fileList = [] } = this.state;
    if (!firstUploadFlag) {
      if (dataSet && dataSet.current) {
        const { licenceUrl, licenceFilename } = dataSet.current.get([
          'licenceUrl',
          'licenceFilename',
        ]);
        const newLicenceFilename = this.handleFileName(licenceUrl);
        const fileName = newLicenceFilename || licenceFilename;
        if (licenceUrl && fileName) {
          fileList.push({
            uid: fileName,
            name: fileName,
            response: licenceUrl,
          });
          this.setState({
            fileList,
          });
        }
      }
    }
  }

  @Bind()
  handleFileName(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    if (!isEmpty(temp)) {
      const fileFullName = temp[temp.length - 1];
      const index = fileFullName.indexOf('@');
      if (index !== -1) {
        const fileName = fileFullName.substring(index + 1);
        return fileName;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: bucketDirectory,
      fileName: file.name,
      enableImageWatermark: 1,
    };
  }

  /**
   * 上传前的校验
   * @param {Object} file - 上传的文件
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 50 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (accept && accept.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const fileTypeList = accept.split(',').map(n => {
        const index = n.indexOf('/');
        const type = n.substring(index);
        return type.replace('/', '.');
      });
      const fileType = fileTypeList.join(',');
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType,
          })
          .d(`上传文件类型必须是：${fileType}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    this.handleModalUpdate(true);
    return true;
  }

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { fileList = [] } = this.state;
    let newfileList = [...info.fileList];
    const { status, response, name, uid } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        newfileList = [
          {
            uid,
            name,
            response,
          },
        ];
        // 删除已有附件
        const urls = (fileList.filter(i => !i.status) || []).map(i => i.response);
        if (!isEmpty(urls)) {
          const payload = {
            bucketName: PRIVATE_BUCKET,
            urls,
          };
          removeUploadFile(payload).then(res => {
            if (getResponse(res)) {
              notification.success();
            }
          });
        }
        // 保存附件url
        const { dataSet } = this.props;
        if (dataSet && dataSet.current) {
          dataSet.current.set({
            licenceUrl: response,
            uploadFlag: true,
          });
          this.handleUpdateLicenceUrl();
        }
      } else {
        notification.error({
          message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        });
      }
      this.handleModalUpdate(false);
    } else if (status === 'error') {
      this.handleModalUpdate(false);
      notification.error(response);
    }
    this.setState({
      fileList: newfileList,
    });
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onDraggerUploadRemove(file) {
    if (isString(file.response)) {
      const payload = {
        bucketName: PRIVATE_BUCKET,
        urls: [file.response],
      };
      removeUploadFile(payload).then(res => {
        if (getResponse(res)) {
          notification.success();
          const { dataSet } = this.props;
          if (dataSet && dataSet.current) {
            dataSet.current.set({
              licenceUrl: undefined,
              uploadFlag: true,
            });
            // 同步更新url
            this.handleUpdateLicenceUrl();
          }
          this.setState({
            fileList: [],
          });
        }
      });
    }
  }

  // 处理modal更新
  @Bind()
  handleModalUpdate(flag = false) {
    const {
      modal = {},
      handleJumpDetail = () => {},
      // handleOnOK = () => {},
      firstUploadFlag = false,
    } = this.props;
    modal.update({
      cancelProps: {
        loading: flag,
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {firstUploadFlag ? (
            <Button onClick={() => handleJumpDetail(1, true)} loading={flag}>
              {intl.get('spfm.supplierRegister.button.manualEntry').d('手工录入')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                modal.close();
              }}
              loading={flag}
              type="primary"
              color="primary"
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          )}
          {/* <Button type="primary" color="primary" onClick={handleOnOK} loading={flag}>
            {intl.get('spfm.supplierRegister.button.automatic').d('自动识别')}
          </Button> */}
        </div>
      ),
    });
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onUploadRemove() {
    const { dataSet } = this.props;
    dataSet.current.set({
      licenceUrl: null,
      uploadFlag: true,
    });
    this.handleUpdateLicenceUrl();
    this.setState({
      fileList: [],
    });
  }

  @Bind()
  handleUpdateLicenceUrl() {
    const { dataSet, changeReqId } = this.props;
    const data = dataSet.current.toJSONData();
    const { licenceUrl } = data;
    const payload = {
      changeReqId,
      licenceUrl: licenceUrl || null,
      dataSource: 3,
      isPlatformFlag: true,
    };
    updateLicenceUrl(payload).then(res => {
      if (getResponse(res)) {
        const { objectVersionNumber: newObjectVersionNumber } = res;
        dataSet.current.set({
          objectVersionNumber: newObjectVersionNumber,
        });
      }
    });
  }

  @Bind()
  handleRender() {
    const { dataSet } = this.props;
    const uploadFlag = dataSet.current.get('uploadFlag');

    return uploadFlag === false ? (
      <React.Fragment>
        <p className={styles['upload-dragger-icon']}>
          <div>
            <Icon type="sentiment_dissatisfied" />
          </div>
          <span>{intl.get(`spfm.supplierRegister.view.message.ocrError`).d('OCR识别失败!')}</span>
        </p>
        <p className={styles['upload-dragger-again']}>
          {intl
            .get(`spfm.supplierRegister.view.message.againUpload`)
            .d('请重新拖拽或点击此处选择文件')}
        </p>
      </React.Fragment>
    ) : (
      <React.Fragment>
        <p className="c7n-upload-drag-icon">
          <img src={uploadLicence} alt="" />
        </p>
        <p className="c7n-upload-text">
          {intl.get(`spfm.supplierRegister.view.message.uploadMessage`).d('拖拽或点击此处选择文件')}
        </p>
        <p className="c7n-upload-hint">
          {intl.get(`spfm.supplierRegister.view.uploadCount.tips`).d('0/1')}
        </p>
      </React.Fragment>
    );
  }

  render() {
    const { dataSet } = this.props;

    const { licenceUrl, uploadFlag } = dataSet.current.get(['licenceUrl', 'uploadFlag']);

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      name: 'file',
      multiple: false,
      accept,
      data: this.uploadData,
      headers,
      action: `${HZERO_FILE}/v1/${tenantId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
      hidden: licenceUrl,
    };

    return (
      <React.Fragment>
        <Form
          columns={2}
          labelLayout="float"
          className={styles['legal-basic-domestic-upload-form']}
        >
          <Output
            labelLayout="none"
            renderer={() => {
              return (
                <div className={styles['upload-dragger']}>
                  {uploadFlag === false ? (
                    <Dragger {...draggerUploadProps}>{this.handleRender()}</Dragger>
                  ) : !licenceUrl ? (
                    <Dragger {...draggerUploadProps}>{this.handleRender()}</Dragger>
                  ) : (
                    <UploadCard
                      fileUrl={licenceUrl}
                      onUploadRemove={this.onUploadRemove}
                      accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
                      label={intl
                        .get('spfm.enterprise.view.message.businessLicense')
                        .d('上传营业执照')}
                      viewInModal
                      enableImageWatermark={1}
                    />
                  )}
                </div>
              );
            }}
          />
          <Output
            labelLayout="none"
            renderer={() => {
              return (
                <div className={styles['domestic-upload-business-license']}>
                  <div>{intl.get('spfm.supplierRegister.model.legal.example').d('示例')}：</div>
                  <img
                    src={registerBusinessLicense}
                    alt={intl
                      .get(`spfm.supplierRegister.view.option.businessLicense`)
                      .d('营业执照')}
                  />
                </div>
              );
            }}
          />
          <div newLine className={styles['upload-dragger-tips']}>
            {intl
              .get('spfm.supplierRegister.view.message.autoUploadType')
              .d(
                '支持自动识别的图像要求为：大小不超过3M，分辨率不高于4096×4096，格式为PNG、JPG、JPEG、BMP的图片'
              )}
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
