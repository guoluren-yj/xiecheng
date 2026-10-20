import React from 'react';
import { connect } from 'dva';
import { Form, Modal, Upload, Icon } from 'hzero-ui';
// import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { downloadFileByAxios } from 'services/api';
import uuid from 'uuid/v4';
import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getAccessToken, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';
import { getAttachmentUrlWithToken } from '_utils/utils';

import style from './index.less';
// import config from '../sslm/SupplierLife/Config';

const FormItem = Form.Item;

const { HZERO_HFLE } = getEnvConfig();

@Form.create({ fieldNameProp: null })
@connect(({ loading, templatesConfig }) => ({
  createTemplatesConfigLoading: loading.effects['templatesConfig/createTemplatesConfig'],
  templatesConfig,
  currentTenantId: getCurrentOrganizationId(),
}))
export default class TemplateForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { initData } = props;
    const { imageUrl } = initData;
    this.state = {
      previewImage: '',
      previewVisible: false,
      fileList: imageUrl ? [{ uid: '-1', url: imageUrl, name: 'xxx.png', status: 'done' }] : [],
    };
  }

  /**
   * removeFile - 删除文件
   * @param {object} file - 删除的文件对象
   */
  @Bind()
  removeFile(file) {
    const {
      dispatch,
      templatesConfig: { templateDetail },
      initData,
      type,
    } = this.props;
    if (file.url && file.uid !== '-1') {
      dispatch({
        type: 'templatesConfig/removeFileList',
        payload: {
          bucketName: PUBLIC_BUCKET,
          directory: 'spfm-portal-assign',
          attachmentUUID: this.state.attachmentUUID || initData.attachmentUUID,
          urls: [file.url],
        },
      }).then((res) => {
        if (res && !res.failed) {
          notification.success();
        }
      });
    } else {
      const { fileList } = this.state;
      const newFile = fileList.filter((item) => {
        return item.uid !== '-1';
      });
      this.setState({
        fileList: newFile,
      });
      if (type === 'logo') {
        dispatch({
          type: 'templatesConfig/updateState',
          payload: {
            templateDetail: {
              ...templateDetail,
              [type]: [{ ...initData, enabledFlag: 0, imageUrl: null, configItemId: null }],
            },
          },
        });
      } else {
        initData.$form.setFieldsValue({ imageUrl: null });
      }
    }
  }

  @Bind()
  handlePreview(file) {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({ previewVisible: false });
  }

  @Bind()
  async handleChange({ file, fileList }) {
    await this.setState({ fileList });
    switch (file.status) {
      case 'error':
        notification.warning({
          message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        });
        break;
      case 'done':
        await this.setState({ fileList: [file] }, () => {
          this.handleSave();
        });
        if (file.response && !file.response.failed) {
          notification.success();
        } else if (file.response && file.response.failed) {
          notification.error({
            message: file.response.message,
          });
        }
        break;
      default:
        break;
    }
  }

  @Bind()
  beforeUpload(file) {
    const { fileSize = 2 * 1024 * 1024 } = this.props;
    const fileType = 'image/jpeg;image/png';
    if (fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('hptl.common.view.message.updateLoadFileTypeMustBeImg')
          .d('上传文件类型必须是: jpeg/png'),
      });
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('hzero.common.view.message.uploadFileSizeLimit', {
            size: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: {size} MB`),
      });
      return false;
    }
    return true;
  }

  @Bind()
  uploadData(file) {
    return {
      bucketName: PUBLIC_BUCKET,
      directory: 'spfm-templates-config',
      fileName: file.name,
    };
  }

  @Bind()
  handleSave() {
    const { fileList } = this.state;
    const {
      dispatch,
      templatesConfig: { templateDetail },
      form,
      initData,
      configId,
    } = this.props;
    const { isCreate = false, imageUrl } = initData;
    form.validateFields((err, value) => {
      const { description, content = '', configCode, linkUrl, orderSeq } = value;
      // if (isEmpty(err)) {
      let params = {};
      // console.log(fileList[0].response, fileList[0].url, imageUrl, 'qqqqq');
      if (isCreate) {
        params = {
          configId,
          configItemId: uuid(),
          configCode,
          imageUrl: (fileList[0] && fileList[0].response) || imageUrl,
          description,
          linkUrl,
          orderSeq,
          content,
          enabledFlag: 1,
          _status: 'create',
        };
      } else {
        params = {
          ...initData,
          content,
          description,
          linkUrl,
          orderSeq,
          configCode,
          imageUrl: fileList[0].response || fileList[0].url || imageUrl,
          enabledFlag: 1,
        };
      }
      if (configCode === 'logo') {
        dispatch({
          type: 'templatesConfig/updateState',
          payload: {
            templateDetail: {
              ...templateDetail,
              [configCode]: [{ ...params }],
            },
          },
        });
      } else {
        // console.log(params);
        initData.$form.setFieldsValue({ imageUrl: params.imageUrl });
      }
      // }
    });
  }

  @Bind()
  normFile(e) {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }

  @Bind()
  deleteCarousel(data) {
    const {
      dispatch,
      configId,
      templatesConfig: { templateDetail },
    } = this.props;
    const { carousel = [] } = templateDetail;
    const { configItemId, imageUrl } = data;
    if (imageUrl) {
      dispatch({
        type: 'templatesConfig/deleteTemplatesConfig',
        payload: data,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'templatesConfig/fetchTemplateDetail',
            payload: { configId },
          });
          notification.success();
        }
      });
    } else {
      dispatch({
        type: 'templatesConfig/updateState',
        payload: {
          templateDetail: {
            ...templateDetail,
            carousel: carousel.filter((item) => item.configItemId !== configItemId),
          },
        },
      });
      notification.success();
    }
  }

  @Bind()
  handleOpenModal = () => {
    this.setState({
      modalVisible: true,
    });
  };

  @Bind()
  handleCancelModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  @Bind()
  downloadPropsIntercept(originProps = {}) {
    const { initData }= this.props;
    const { fileList } = this.state;

    if (originProps.href) {
      return {
        ...originProps,
        target: undefined,
        // eslint-disable-next-line no-script-url
        href: 'javascript:void(0)',
        onClick: () => {
          const {
            currentTenantId,
            // templatesConfig: { templateDetail },
          } = this.props;
          // const { logo } = templateDetail || {};
          const { imageUrl } = initData || {};
          let url = (fileList[0] && (fileList[0].response || fileList[0].url)) || imageUrl;
          if (!url) {
            return;
          }
          let queryParams = [];
          const isTenant = isTenantRoleLevel();
          request(`${HZERO_HFLE}/v1/${isTenant ? `${getCurrentOrganizationId()}/` : ''}files`, {
            method: 'POST',
            body: [url],
          }).then((fileInfo = []) => {
            if (!fileInfo.length || !fileInfo[0]._fileToken) {
              return;
            } else {
              url = getAttachmentUrlWithToken(
                url,
                PUBLIC_BUCKET,
                currentTenantId,
                'spfm-templates-config',
                undefined,
                fileInfo[0]._fileToken,
                undefined
              );
            }

            const paramStr = url.split('?')[1];
            if (paramStr) {
              queryParams = paramStr
                .split('&')
                .map((param) => {
                  const [name, value] = param.split('=');
                  return { name, value };
                })
                .filter((item) => !['access_token'].includes(item.name));
            }

            downloadFileByAxios({ requestUrl: url, queryParams, method: 'GET' });
          });
        },
      };
    }
    return originProps;
  }

  render() {
    const { form, type, currentTenantId, disabled = false } = this.props;
    const { getFieldDecorator } = form;
    const { previewVisible, previewImage, fileList, modalVisible } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" style={{ fontSize: '32px', color: '#999' }} />
      </div>
    );
    return (
      <div style={{ display: 'inline-block' }}>
        <a onClick={this.handleOpenModal}>
          <Icon type="paper-clip" />
          {intl.get(`spfm.common.view.message.upload`).d(`图片上传 ${fileList.length ? '1' : ''}`)}
        </a>
        <Modal
          title={intl.get(`hzero.common.upload.modal.title`).d('附件')}
          visible={modalVisible}
          footer={null}
          onCancel={this.handleCancelModal}
        >
          <Form className={style['template-upload-form']}>
            {/* <Row type="flex" justify="start"> */}
            {/* <Col> */}
            <FormItem>
              {getFieldDecorator('upload', {
                initialValue: fileList,
                valuePropName: 'fileList',
                getValueFromEvent: this.normFile,
              })(
                <Upload
                  disabled={disabled}
                  showUploadList={{
                    showRemoveIcon: !disabled,
                    removePopConfirmTitle: intl
                      .get(`spfm.common.view.message.deleteLines`)
                      .d('是否删除'),
                  }}
                  accept=".jpeg,.png"
                  // className={style['template-upload-logo']}
                  listType="picture-card"
                  action={`${HZERO_FILE}/v1/${
                    isTenantRoleLevel() ? `${currentTenantId}/` : ''
                  }files/multipart`}
                  headers={{ Authorization: `bearer ${getAccessToken()}` }}
                  data={this.uploadData}
                  onPreview={this.handlePreview}
                  onRemove={this.removeFile}
                  onChange={this.handleChange}
                  downloadPropsIntercept={this.downloadPropsIntercept}
                  beforeUpload={this.beforeUpload}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              )}
            </FormItem>
            {/* </Col> */}
            <FormItem>
              {getFieldDecorator('configCode', {
                initialValue: type,
              })(<div />)}
            </FormItem>
            {/* </Row> */}
            <Modal visible={previewVisible} footer={null} onCancel={() => this.handleCancel()}>
              <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </Form>
        </Modal>
      </div>
    );
  }
}
