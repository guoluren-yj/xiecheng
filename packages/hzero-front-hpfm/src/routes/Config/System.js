/**
 * System - 系统配置
 * @date: 2019-11-1
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';

import { Col, Form, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, isEmpty } from 'lodash';

import Upload from '_components/Upload/UploadButton';
import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';
import { isTenantRoleLevel, getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { BKT_PUBLIC, HZERO_FILE, MULTIPLE_SKIN_ENABLE } from 'utils/config';
import { queryTimeZoneList, queryUUID, queryFileList } from 'services/api';
import { Checkbox } from 'choerodon-ui';

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
export default class System extends Component {
  constructor(props) {
    super(props);
    this.logoUploadRef = null;
    this.faviconUploadRef = null;
    this.state = {
      timeZoneMap: {},
      logoAttachmentId: null,
      faviconAttachmentId: null,
    };
  }

  render() {
    const { timeZoneMap = {}, logoAttachmentId, faviconAttachmentId } = this.state;
    const {
      organizationId,
      form: { getFieldDecorator },
      languageList = [],
      config: {
        data = [],
        lov: {
          menuLayout: lovMenuLayout = [],
          menuLayoutTheme: lovMenuLayoutTheme = [],
          // roleMergeFlag: lovRoleMergeFlag = [],
          roleMergeFlag: watermarkFlag = [],
        },
      },
      user,
    } = this.props;
    const {
      currentUser: { dayLightFlag },
    } = user;
    let iconFileList = [];
    let faviconFileList = [];
    if (data.length > 0) {
      data.forEach((item) => {
        switch (item.configCode) {
          case 'LOGO':
            if (!isEmpty(item.configValue)) {
              iconFileList = [
                {
                  uid: '-1',
                  name: item.fileName,
                  status: 'done',
                  url: item.configValue,
                },
              ];
            }
            break;
          case 'FAVICON':
            if (!isEmpty(item.configValue)) {
              faviconFileList = [
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
    const title = this.findConfigField('TITLE', data);
    const logo = this.findConfigField('LOGO', data);
    const favicon = this.findConfigField('FAVICON', data);
    const menuLayout = this.findConfigField('MENU_LAYOUT', data);
    const menuLayoutTheme = this.findConfigField('MENU_LAYOUT_THEME', data);
    // const roleMergeFlag = this.findConfigField('ROLE_MERGE', data);
    const titleData = this.findConfigData('TITLE', data);
    const defaultLanguage = this.findConfigData('TENANT_DEFAULT_LANGUAGE', data);
    const watermark = this.findConfigField('WATERMARK', data);
    const timeZone = this.findConfigField('TIMEZONE', data);
    const timeZoneName = timeZoneMap[timeZone];
    const popoutReminderFlag = this.findConfigField('POPOUT_REMINDER_FLAG', data);
    // const loginAgreement = this.findConfigField('LOGIN_AGREEMENT', data);
    const pageAsyncFlag = this.findConfigField('PAGE_ASYNC_FLAG', data);
    const iaeTimeZoneConvert = this.findConfigField('IMPORT_EXPORT_ZONE_CONVERT', data);
    let isUed = false;
    try {
      isUed = MULTIPLE_SKIN_ENABLE ? JSON.parse(MULTIPLE_SKIN_ENABLE) : false;
    } catch (e) {
      isUed = false;
    }
    return (
      <Form>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.title').d('系统标题')}
              {...formLayout}
            >
              {getFieldDecorator('title', {
                initialValue: title,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.title').d('系统标题'),
                    }),
                  },
                  {
                    max: 80,
                    message: intl.get('hzero.common.validation.max', { max: 80 }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get('hpfm.config.model.config.title').d('系统标题')}
                  field="configValue"
                  token={titleData && titleData._token}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.logo').d('LOGO')}
              extra={`${intl
                .get('hzero.common.upload.support', {
                  type: '*.png;*.jpeg',
                })
                .d('上传格式：*.png;*.jpeg')}. ${intl
                .get('hzero.common.upload.suggest')
                .d('建议上传透明底色背景的白色logo')}`}
              {...formLayout}
            >
              {logoAttachmentId && (
                <Upload
                  accept=".jpeg,.png"
                  fileType="image/jpeg,image/png"
                  single
                  attachmentUUID={logoAttachmentId}
                  bucketName={BKT_PUBLIC}
                  action={`${HZERO_FILE}/v1/${
                    isTenantRoleLevel() ? `${organizationId}/` : ''
                  }files/attachment/multipart`}
                  bucketDirectory="hpfm05"
                  onUploadSuccess={this.onUploadSuccess}
                  fileList={iconFileList}
                  onRemoveSuccess={this.onCancelSuccess}
                />
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 7 }}>
              {getFieldDecorator('logoFileToken')}
              {getFieldDecorator('logo', {
                initialValue: logo,
              })(<div />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.favicon').d('favicon')}
              extra={intl
                .get('hzero.common.upload.support', {
                  type: '*.png;*.ico',
                })
                .d('上传格式：*.png;*.ico')}
              {...formLayout}
            >
              {faviconAttachmentId && (
                <Upload
                  single
                  accept=".png,.ico"
                  action={`${HZERO_FILE}/v1/${
                    isTenantRoleLevel() ? `${organizationId}/` : ''
                  }files/attachment/multipart`}
                  attachmentUUID={faviconAttachmentId}
                  fileType="image/png,image/vnd.microsoft.icon,image/x-icon	"
                  bucketName={BKT_PUBLIC}
                  bucketDirectory="hpfm05"
                  onUploadSuccess={this.handleFaviconUploadSuccess}
                  fileList={faviconFileList}
                  onRemoveSuccess={this.handleCancelFaviconUploadSuccess}
                />
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 7 }}>
              {getFieldDecorator('faviconFileToken')}
              {getFieldDecorator('favicon', {
                initialValue: favicon,
              })(<div />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.menuLayout').d('菜单布局')}
              {...formLayout}
            >
              {getFieldDecorator('menuLayout', {
                initialValue: menuLayout,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.menuLayout').d('菜单布局'),
                    }),
                  },
                ],
              })(
                <Select>
                  {lovMenuLayout.map((item) => {
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
        {isUed && (
          <Row>
            <Col span={16}>
              <FormItem
                label={intl.get('hpfm.config.model.config.menuLayoutTheme').d('菜单布局主题')}
                {...formLayout}
              >
                {getFieldDecorator('menuLayoutTheme', {
                  initialValue: menuLayoutTheme,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.config.model.config.menuLayoutTheme')
                          .d('菜单布局主题'),
                      }),
                    },
                  ],
                })(
                  <Select>
                    {lovMenuLayoutTheme.map((item) => {
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
        )}
        {/* <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.roleMergeFlag').d('角色合并')}
              {...formLayout}
            >
              {getFieldDecorator('roleMergeFlag', {
                initialValue: roleMergeFlag,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.roleMergeFlag').d('角色合并'),
                    }),
                  },
                ],
              })(
                <Select>
                  {lovRoleMergeFlag.map((item) => {
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
        </Row> */}
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.defaultLanguage').d('默认语言配置')}
              {...formLayout}
            >
              {getFieldDecorator('defaultLanguage', {
                initialValue: defaultLanguage?.configValue || '',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.defaultLanguage').d('默认语言配置'),
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
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hpfm.config.model.config.watermark').d('水印')}
              {...formLayout}
            >
              {getFieldDecorator('watermark', {
                initialValue: watermark,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.config.model.config.watermark').d('水印'),
                    }),
                  },
                ],
              })(
                <Select>
                  {watermarkFlag.map((item) => {
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
        {isTenantRoleLevel() && (
          <Row>
            <Col span={16}>
              <FormItem
                label={intl.get('hpfm.config.model.config.timeZone').d('时区')}
                {...formLayout}
              >
                {getFieldDecorator('timeZone', {
                  initialValue: timeZone,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.config.model.config.timeZone').d('时区'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code={dayLightFlag === 1 ? 'HIAM.TIME_ZONE_UTC' : 'HIAM.TIME_ZONE'}
                    textValue={dayLightFlag === 1 ? timeZoneName : undefined}
                    lovOptions={dayLightFlag === 1 ? {} : { displayField: 'value' }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {isTenantRoleLevel() && (
          <>
            <Row>
              <Col span={16}>
                <FormItem
                  label={intl.get('hpfm.config.model.config.homeMessagePopup').d('首页消息弹窗')}
                  {...formLayout}
                >
                  {getFieldDecorator('popoutReminderFlag', {
                    initialValue:
                      popoutReminderFlag && isNumber(+popoutReminderFlag)
                        ? +popoutReminderFlag
                        : undefined,
                  })(
                    <Select>
                      <Select.Option value={1}>
                        {intl.get('hzero.common.status.enabled').d('启用')}
                      </Select.Option>
                      <Select.Option value={0}>
                        {intl.get('hzero.common.status.disable').d('禁用')}
                      </Select.Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {/* <Row>
              <Col span={16}>
                <FormItem
                  label={intl.get('hpfm.config.model.config.loginAgreement').d('登录协议确认')}
                  {...formLayout}
                >
                  {getFieldDecorator('loginAgreement', {
                    initialValue: loginAgreement && isNumber(+loginAgreement) ? +loginAgreement : 0,
                  })(
                    <Select>
                      <Select.Option value={1}>
                        {intl.get('hzero.common.status.enabled').d('启用')}
                      </Select.Option>
                      <Select.Option value={0}>
                        {intl.get('hzero.common.status.disable').d('禁用')}
                      </Select.Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row> */}
            <Row>
              <Col span={16}>
                <FormItem
                  label={intl.get('hpfm.config.model.config.iaeTimeZoneConvert').d('导入导出时区转换')}
                  {...formLayout}
                >
                  {getFieldDecorator('iaeTimeZoneConvert', {
                    initialValue: iaeTimeZoneConvert ? Number(iaeTimeZoneConvert) : 0,
                  })(
                    <Select>
                      <Select.Option value={1}>
                        {intl.get('hzero.common.status.enabled').d('启用')}
                      </Select.Option>
                      <Select.Option value={0}>
                        {intl.get('hzero.common.status.disable').d('禁用')}
                      </Select.Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={16}>
                <FormItem
                  label={intl.get('hpfm.config.model.config.pageAsyncFlag').d('是否异步显示总数')}
                  {...formLayout}
                >
                  {getFieldDecorator('pageAsyncFlag', {
                    initialValue: pageAsyncFlag ? Number(pageAsyncFlag) : 0,
                  })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
                </FormItem>
              </Col>
            </Row>
          </>
        )}
      </Form>
    );
  }

  componentDidMount() {
    this.initAttachmentId('logoAttachmentId');
    this.initAttachmentId('faviconAttachmentId');
    const { user } = this.props;
    const {
      currentUser: { dayLightFlag },
    } = user;
    queryTimeZoneList(dayLightFlag).then((response) => {
      const res = getResponse(response);
      if (res) {
        const timeZoneMap = {};
        if (dayLightFlag && res.content && res.content.length) {
          res.content.forEach((item) => {
            timeZoneMap[item.zoneId] = item.zoneName;
          });
        } else if (!dayLightFlag && res.length) {
          res.forEach((item) => {
            timeZoneMap[item.value] = item.meaning;
          });
        }
        this.setState({ timeZoneMap });
      }
    });
  }

  initAttachmentId(key) {
    queryUUID(isTenantRoleLevel() ? { tenantId: getCurrentOrganizationId() } : {}).then(
      (result) => {
        if (result && result.content) {
          this.setState({
            [key]: result.content,
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

  /**
   * 从配置列表查找配置项
   * @param {Number|String} field 查询配置字段的 ID 或 Code
   * @param {Array} data 获取到的原配置数组
   */
  @Bind()
  findConfigData(field, data) {
    if (data.length > 0) {
      const dataFilter = data.find((item) => {
        return item.configCode === field;
      });
      return dataFilter || null;
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
      attachmentUUID: this.state.logoAttachmentId,
    }).then((res) => {
      if (getResponse(res)) {
        if (res && res.length > 0) {
          const file = res[res.length - 1];
          form.setFieldsValue({
            logo: file.fileUrl,
            logoFileToken: file._fileToken,
          });
          let newData = data;
          if (newData && newData.length > 0) {
            newData = newData.map((item) => {
              if (item.configCode === 'LOGO') {
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
      logo: '',
    });
    let newData = data;
    if (newData && newData.length > 0) {
      newData = newData.map((item) => {
        if (item.configCode === 'LOGO') {
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

  /**
   * 上传 favicon 成功
   */
  @Bind()
  handleFaviconUploadSuccess() {
    const {
      form,
      config: { data },
    } = this.props;
    queryFileList({
      tenantId: getCurrentOrganizationId(),
      bucketName: BKT_PUBLIC,
      attachmentUUID: this.state.faviconAttachmentId,
    }).then((res) => {
      if (getResponse(res)) {
        if (res && res.length > 0) {
          const file = res[res.length - 1];
          form.setFieldsValue({
            favicon: file.fileUrl,
            faviconFileToken: file._fileToken,
          });
          let newData = data;
          if (newData && newData.length > 0) {
            newData = newData.map((item) => {
              if (item.configCode === 'FAVICON') {
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

  /**
   * 删除 favicon 成功
   */
  @Bind()
  handleCancelFaviconUploadSuccess() {
    const {
      form,
      config: { data },
    } = this.props;
    form.setFieldsValue({
      favicon: '',
    });
    let newData = data;
    if (newData && newData.length > 0) {
      newData = newData.map((item) => {
        if (item.configCode === 'FAVICON') {
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
