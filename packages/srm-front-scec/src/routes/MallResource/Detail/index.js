import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Row, Col, Upload, Form, Icon, Input, Spin, Radio } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';

import { PHONE } from 'utils/regExp';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import { PUBLIC_BUCKET } from '_utils/config';
import { getAccessToken, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import style from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const prompKey = 'scec.mallResource';
@Form.create({ fieldNameProp: null })
@connect(({ loading, mallResource }) => ({
  mallResource,
  currentTenantId: getCurrentOrganizationId(),
  fetchLoading: loading.effects['mallResource/fetchComanyInfo'],
  savingLoading: loading.effects['mallResource/updateCompanyList'],
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileListLogo: [],
      fileListPortal: [],
      objectVersionNumber: 1,
    };
  }

  componentDidMount() {
    this.fetchTemplateInfo();
  }

  @Bind()
  fetchTemplateInfo() {
    const { dispatch } = this.props;
    const { pageConfigId } = this.props.match.params;
    dispatch({
      type: 'mallResource/fetchComanyInfo',
      payload: {
        pageConfigId,
      },
    }).then((res) => {
      this.setState({
        objectVersionNumber: res[0].objectVersionNumber,
        fileListLogo: [{ uid: '-1', url: res[0].logoPath, name: 'xxx.png', status: 'done' }],
        fileListPortal: [{ uid: '-1', url: res[0].faviconPath, name: 'xxx.png', status: 'done' }],
      });
    });
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
        message: intl.get('hptl.common.view.message.uploadFileSizeLimit', {
          size: fileSize / (1024 * 1024),
        }),
      });
      return false;
    }
    return true;
  }

  @Bind()
  handleChangeLogo({ file }) {
    this.setState({
      fileListLogo: [{ ...file, url: file.response, thumbUrl: file.thumbUrl }],
    });
    switch (file.status) {
      case 'error':
        notification.warning({ message: intl.get(`${prompKey}.view.uploadFail`).d('上传失败') });
        break;
      case 'done':
        notification.success();
        break;
      default:
        break;
    }
  }

  @Bind()
  handleChangePortal({ file }) {
    this.setState({
      fileListPortal: [{ ...file, url: file.response, thumbUrl: file.thumbUrl }],
    });
    switch (file.status) {
      case 'error':
        notification.warning({ message: intl.get(`${prompKey}.view.uploadFail`).d('上传失败') });
        break;
      case 'done':
        notification.success();
        break;
      default:
        break;
    }
  }

  @Bind
  handlePreview() {
    return null;
  }

  @Bind()
  saveTemplateInfo() {
    const {
      dispatch,
      // mallResource: { templateInfo },
    } = this.props;
    const { pageConfigId } = this.props.match.params;
    const { getFieldsValue } = this.props.form;
    const { fileListLogo, fileListPortal, objectVersionNumber } = this.state;
    const info = getFieldsValue();
    // if (!fileListPortal[0].response && !fileListLogo[0].response ) {
    //   notification.warning({
    //     message: '你没有改变任何数据',
    //   });
    //   return;
    // }
    const templateInfos = {
      ...info,
      faviconPath: fileListPortal[0].url,
      logoPath: fileListLogo[0].url,
      pageConfigId,
      objectVersionNumber,
    };

    dispatch({
      type: 'mallResource/updateCompanyList',
      payload: templateInfos,
    }).then(() => {
      notification.success();
      this.fetchTemplateInfo();
    });
  }

  render() {
    const {
      currentTenantId,
      form,
      mallResource: { templateInfo },
      savingLoading,
      fetchLoading,
    } = this.props;
    const { getFieldDecorator } = form;
    const { fileListLogo, fileListPortal } = this.state;
    const { title, footInformation, customerPhone, personPurchaseFlag } = templateInfo;
    return (
      <Fragment>
        <Header
          title={intl.get(`${prompKey}.view.mallHomeConfig`).d('商城首页配置')}
          backPath="/scec/mall-resource/list"
        >
          <Button type="primary" onClick={this.saveTemplateInfo} loading={savingLoading}>
            {intl.get('hezro.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchLoading}>
            <div className={style.templateWarp}>
              <Form>
                <Row gutter={48}>
                  <Col span={12}>
                    <div className="title">
                      {intl
                        .get(`${prompKey}.view.uploadLogoImage`)
                        .d('上传Logo图片,图片格式为JPEG/PNG,图片高度为30px')}
                    </div>
                    <div className="upload-logo">
                      <div className="image">
                        {fileListLogo.length > 0 ? (
                          <img src={fileListLogo[0].url || ''} alt="" />
                        ) : (
                          ''
                        )}
                      </div>
                      <Upload
                        multiple="false"
                        // listType='picture'
                        action={`${HZERO_FILE}/v1/${
                          isTenantRoleLevel() ? `${currentTenantId}/` : ''
                        }files/multipart`}
                        headers={{ Authorization: `bearer ${getAccessToken()}` }}
                        data={(file) => ({
                          bucketName: PUBLIC_BUCKET,
                          fileName: file.name,
                          bucketDirectory: 'scec-mall-resource',
                        })}
                        fileList={fileListLogo}
                        beforeUpload={this.beforeUpload}
                        onChange={this.handleChangeLogo}
                        className="template-upload-logo"
                        onPreview={this.handlePreview}
                        showUploadList={{
                          showPreviewIcon: false,
                          showRemoveIcon: false,
                          showDownloadIcon: false,
                        }}
                      >
                        <Icon style={{ fontSize: '32px', color: '#999' }} type="upload" />
                      </Upload>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="title">
                      {intl
                        .get(`${prompKey}.view.uploadPortalImage`)
                        .d('上传门户图片,图片格式为JPEG/PNG')}
                    </div>
                    <div className="upload">
                      <Upload
                        listType="picture-card"
                        multiple="false"
                        action={`${HZERO_FILE}/v1/${
                          isTenantRoleLevel() ? `${currentTenantId}/` : ''
                        }files/multipart`}
                        headers={{ Authorization: `bearer ${getAccessToken()}` }}
                        data={(file) => ({
                          bucketName: PUBLIC_BUCKET,
                          fileName: file.name,
                          bucketDirectory: 'scec-mall-resource',
                        })}
                        fileList={fileListPortal}
                        beforeUpload={this.beforeUpload}
                        onChange={this.handleChangePortal}
                        className="template-upload-favicon"
                        showUploadList={{
                          showPreviewIcon: false,
                          showRemoveIcon: false,
                          showDownloadIcon: false,
                        }}
                      >
                        <Icon style={{ fontSize: '32px', color: '#999' }} type="upload" />
                      </Upload>
                    </div>
                  </Col>
                </Row>
                <Row className="portal-information" gutter={48}>
                  <Col span={12}>
                    <div className="title">
                      {intl.get(`${prompKey}.view.portalTitle`).d('设置门户标题')}
                    </div>
                    <FormItem>
                      {getFieldDecorator('title', {
                        initialValue: title,
                      })(<TextArea rows={4} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <div className="title">
                      {intl.get(`${prompKey}.view.enablePersonBuy`).d('是否启用个人选买')}
                    </div>
                    <FormItem>
                      {getFieldDecorator('personPurchaseFlag', {
                        initialValue: personPurchaseFlag,
                      })(
                        <Radio.Group name="personPurchaseFlag">
                          <Radio value={1}>启用</Radio>
                          <Radio value={0}>禁用</Radio>
                        </Radio.Group>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row className="portal-information" gutter={48}>
                  <Col span={12}>
                    <div className="title">
                      {intl.get(`${prompKey}.view.portalFooter`).d('设置底部栏信息')}
                    </div>
                    <FormItem>
                      {getFieldDecorator('footInformation', {
                        initialValue: footInformation,
                      })(<TextArea rows={4} />)}
                    </FormItem>
                  </Col>
                  {/* <Col span={12}>
                    <div className="title">
                      {intl.get(`${prompKey}.view.visitorFlag`).d('是否允许游客访问')}
                    </div>
                    <FormItem>
                      {getFieldDecorator('visitorFlag', {
                        initialValue: visitorFlag,
                      })(
                        <Radio.Group name="visitorFlag">
                          <Radio value={1}>启用</Radio>
                          <Radio value={0}>禁用</Radio>
                        </Radio.Group>
                      )}
                    </FormItem>
                  </Col> */}
                </Row>
                <Row className="portal-information" gutter={48}>
                  <Col span={12}>
                    <div className="title">
                      {intl.get(`${prompKey}.view.servicePhone`).d('客服电话')}
                    </div>
                    <FormItem>
                      {getFieldDecorator('customerPhone', {
                        initialValue: customerPhone,
                        rules: [
                          {
                            pattern: PHONE,
                            message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                          },
                        ],
                      })(<Input />)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
