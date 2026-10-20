/**
 * Oauth - 系统配置
 * @date: 2019-11-1
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Col, Form, Input, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { connect } from 'dva';

import Switch from 'components/Switch';
import Upload from '_components/Upload/UploadButton';

import intl from 'utils/intl';
import { isTenantRoleLevel, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { BKT_PUBLIC, HZERO_FILE } from 'utils/config';
import { queryUUID, queryFileList } from 'services/api';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ config }) => ({
  config,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class Oauth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginLogoAttachmentId: null,
    };
  }

  render() {
    const { loginLogoAttachmentId } = this.state;
    const {
      organizationId,
      languageList,
      form: { getFieldDecorator },
      config: { data = [] },
    } = this.props;
    let logoFileList = [];
    if (data.length > 0) {
      data.forEach((item) => {
        switch (item.configCode) {
          case 'HOTH.LOGO_URL':
            if (!isEmpty(item.configValue)) {
              logoFileList = [
                {
                  uid: '-1',
                  name: item.fileName,
                  status: 'done',
                  url: item.configValue,
                },
              ];
            }
            break;
          default:
            break;
        }
      });
    }
    const loginTitle = this.findConfigField('HOTH.TITLE', data);
    const copyright = this.findConfigField('HOTH.COPYRIGHT', data);
    const loginLogo = this.findConfigField('HOTH.LOGO_URL', data);
    const languageFlag = this.findConfigField('HOTH.SHOW_LANGUAGE', data);
    const language = this.findConfigField('HOTH.DEFAULT_LANGUAGE', data);

    return (
      <Form>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.loginTitle').d('登录页面标题')}
              {...formLayout}
            >
              {getFieldDecorator('loginTitle', {
                initialValue: loginTitle,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.loginTitle').d('登录页面标题'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.copyright').d('版权信息')}
              {...formLayout}
            >
              {getFieldDecorator('copyright', {
                initialValue: copyright,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.copyright').d('版权信息'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.languageFlag').d('是否展示多语言')}
              {...formLayout}
            >
              {getFieldDecorator('languageFlag', {
                initialValue: languageFlag === '1' ? 1 : 0,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.logo').d('LOGO')}
              extra={intl
                .get('hzero.common.upload.support', {
                  type: '*.png;*.jpeg',
                })
                .d('上传格式：*.png;*.jpeg')}
              {...formLayout}
            >
              {loginLogoAttachmentId && (
                <Upload
                  accept=".jpeg,.png"
                  fileType="image/jpeg,image/png"
                  single
                  action={`${HZERO_FILE}/v1/${
                    isTenantRoleLevel() ? `${organizationId}/` : ''
                  }files/attachment/multipart`}
                  attachmentUUID={loginLogoAttachmentId}
                  bucketName={BKT_PUBLIC}
                  bucketDirectory="hpfm05"
                  onUploadSuccess={this.onUploadSuccess}
                  fileList={logoFileList}
                  onRemoveSuccess={this.onCancelSuccess}
                />
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 7 }}>
              {getFieldDecorator('loginLogoFileToken')}
              {getFieldDecorator('loginLogo', {
                initialValue: loginLogo,
              })(<div />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.language').d('默认语言')}
              {...formLayout}
            >
              {getFieldDecorator('language', {
                initialValue: language,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.language').d('默认语言'),
                    }),
                  },
                ],
              })(
                <Select>
                  {languageList.map((item) => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  componentDidMount() {
    this.initAttachmentId();
  }

  initAttachmentId() {
    queryUUID(isTenantRoleLevel() ? { tenantId: getCurrentOrganizationId() } : {}).then(
      (result) => {
        if (result && result.content) {
          this.setState({
            loginLogoAttachmentId: result.content,
          });
        }
      }
    );
  }

  /**
   * 从配置列表查找配置项
   * @param {Number|String} field 查询配置字段的 ID 或 Code
   * @param {Array} data 获取到的原配置数组
   */
  @Bind()
  findConfigField(field, data) {
    if (data.length > 0) {
      const dataFilter = data.find((item) => {
        return item.configCode === field;
      });
      return dataFilter ? dataFilter.configValue : null;
    }
  }

  // 上传图片成功
  @Bind()
  onUploadSuccess() {
    const {
      form,
      config: { data },
    } = this.props;
    queryFileList({
      tenantId: getCurrentOrganizationId(),
      bucketName: BKT_PUBLIC,
      attachmentUUID: this.state.loginLogoAttachmentId,
    }).then((res) => {
      if (getResponse(res)) {
        if (res && res.length > 0) {
          const file = res[res.length - 1];
          form.setFieldsValue({
            loginLogo: file.fileUrl,
            loginLogoFileToken: file._fileToken,
          });
          let newData = data;
          if (newData && newData.length > 0) {
            newData = newData.map((item) => {
              if (item.configCode === 'HOTH.LOGO_URL') {
                // eslint-disable-next-line no-param-reassign
                item.configValue = file.fileUrl;
                // eslint-disable-next-line no-param-reassign
                item.fileName = file.fileName;
              }
              return item;
            });
          }
          this.props.dispatch({
            type: 'config/updateState',
            payload: {
              data: newData,
            },
          });
        }
      }
    });
  }

  // 删除图片成功
  @Bind()
  onCancelSuccess() {
    const {
      form,
      config: { data },
    } = this.props;
    form.setFieldsValue({
      loginLogo: '',
    });
    let newData = data;
    if (newData && newData.length > 0) {
      newData = newData.map((item) => {
        if (item.configCode === 'HOTH.LOGO_URL') {
          // eslint-disable-next-line no-param-reassign
          item.configValue = '';
        }
        return item;
      });
    }
    this.props.dispatch({
      type: 'config/updateState',
      payload: {
        data: newData,
      },
    });
  }
}
