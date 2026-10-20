/**
 * SafeInfo.js
 * @date 2018/11/23
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Input, Modal, Tooltip } from 'hzero-ui';
import { Button, Modal as C7NModal, Form as C7NForm, DataSet, Password } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isFunction, map, isNil, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';

import { openTab } from 'utils/menuTab';
import { getEnvConfig } from 'utils/iocUtils';
import { downloadFileByAxios } from 'services/api';
import CountDown from 'components/CountDown';
import request from 'utils/request';
import intl from 'utils/intl';
import { AUTH_HOST, HZERO_IAM } from 'utils/config';
import {
  isTenantRoleLevel,
  getAccessToken,
  getUserOrganizationId,
  getCurrentOrganizationId,
  getSession,
  setSession,
  encryptPwd,
  getResponse,
} from 'utils/utils';
import { EMAIL, PHONE } from 'utils/regExp';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import { validatePasswordRuleNew } from '@/utils/validator';
import showRefreshNotification from '@/components/RefreshNotification';

// import LineItem from './components/LineItem';
import ModalForm from './components/ModalForm';
import EditFormModal from './components/EditFormModal';
import MaxLenItem from './components/MaxLenItem';
import ChangePassword from './components/ChangePassword';
import styles from './index.less';
import AuthenticationInfo from './AuthenticationInfo';
import { changeTenant } from '../../services/userInfoService';
import AccessLogin from './AccessLogin';
import EditableListItem from './components/EditableListItem';
import UpdatePhoneAndEmailModal from './components/UpdatePhoneAndEmailModal';
import ChangePasswordNew from './components/ChangePasswordNew';

const { Item: FormItem } = Form;

const defaultSensitivePolicy = {
  PHONE: { modify: true, visible: true, bind: true },
  EMAIL: { modify: true, visible: true, bind: true },
};
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
// const securityLevelStyle = {
//   margin: '10px 0',
// };
@remote({
  code: 'HIAM.USERINFO.SAFEINFO', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class SafeInfo extends React.Component {
  renderModalFormItems;

  // 渲染 ModalForm 中的 FormItems
  handleModalFormOk;

  // Modal onOk
  state = {
    modalProps: { visible: false }, // 模态框属性
    authenticationInfoVisible: false,
    authenticationList: [],
    authTipsVisible: false,
  };

  constructor(props) {
    super(props);
    this.handleModalFormOk = this.handleModalFormCancelDefault; // 默认是取消
    this.sensitivePolicy = props.remote.process(
      'HIAM.USERINFO.SAFEINFO_SENSITIVE_POLICY',
      defaultSensitivePolicy
    );
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/fetchOpenAccountList',
    });
    // dispatch({
    //   type: 'personalLoginRecord/fetchRecords',
    //   payload: {
    //     tenantId: getCurrentOrganizationId(),
    //     page: 0,
    //     size: 3,
    //   },
    // });
    // 获取公钥
    dispatch({
      type: 'userInfo/getPublicKey',
    });
    dispatch({
      type: 'userInfo/fetchOpenAccountList',
    });
  }

  render() {
    const {
      modalProps,
      authenticationInfoVisible,
      authenticationList,
      authTipsVisible,
    } = this.state;
    const {
      editModalLoading = false,
      modalProps: editFormModalProps,
      // openAccountList = [],
      detailEnumMap: { docTypeLevelCode = [] },
    } = this.props;
    // const {step = 'form-key'} = editFormModalProps;
    // 只有在发送验证码后才能点下一步
    const editFormModalOkBtnProps = {};
    switch (editFormModalProps.step) {
      case 'validateOldEmail':
        editFormModalOkBtnProps.disabled = !getSession('user-info-oldEmail');
        break;
      case 'validateOldPhone':
        editFormModalOkBtnProps.disabled = !getSession('user-info-oldPhone');
        break;
      case 'validatePhone':
        editFormModalOkBtnProps.disabled = !getSession('user-info-verifyPhone');
        break;
      case 'validateNewEmail':
      case 'validateNewPhone':
      case 'validateUnCheckedEmail':
      case 'validateUnCheckedPhone':
        editFormModalOkBtnProps.disabled = !editFormModalProps.captchaKey;
        break;
      default:
        break;
    }
    modalProps.confirmLoading = editModalLoading; // editModalLoading 包含密码的loading

    return (
      <div className={styles.safe}>
        {this.renderPassword()}
        {this.renderPhone()}
        {this.renderEmail()}
        {this.renderAuthentication()}
        {this.renderDestroyAccount()}
        {/* {openAccountList.length > 0 && (
          <Main
            title={intl.get('hiam.userInfo.view.title.subMain.openApp').d('第三方账号绑定')}
            className={styles['open-app']}
          >
            <Content>{this.renderOpenApp()}</Content>
          </Main>
        )} */}
        {/* <Table
          style={{ marginBottom: 2 }}
          bordered
          rowKey="order"
          columns={columns}
          dataSource={loginData.map((item, index) => ({ ...item, order: index + 1 }))}
          pagination={false}
        /> */}
        <ModalForm
          modalProps={modalProps}
          renderFormItems={this.renderModalFormItems}
          onOk={this.handleModalFormOk}
        />
        <Modal
          title={intl.get('hiam.userInfo.view.option.authenticationTips').d('实名认证提示')}
          visible={authTipsVisible}
          footer={null}
          onCancel={() => {
            this.setState({ authTipsVisible: false });
          }}
        >
          <div>
            {intl
              .get('hiam.userInfo.view.option.noCertification')
              .d(
                '您当前租户及合作客户未开通电子签章服务，无法进行实名认证；如需电子签章服务，可通过应用商店功能开通电子签章服务'
              )}
            <a onClick={() => this.handlegotoAppstore()} style={{ marginLeft: '10px' }}>
              {intl.get('hiam.userInfo.view.option.clickHere').d('点此前往')}
            </a>
          </div>
        </Modal>
        <EditFormModal
          width={500}
          confirmLoading={editModalLoading}
          okButtonProps={editFormModalOkBtnProps}
          {...editFormModalProps}
        />
        {authenticationInfoVisible && (
          <AuthenticationInfo
            authenticationList={authenticationList}
            handleAuthentication={this.handleAuthentication}
            visible={authenticationInfoVisible}
            onCancel={() => this.setState({ authenticationInfoVisible: false })}
            getCheckCode={this.getCheckCode}
            onCheckPhone={this.onCheckPhone}
            onDateleAuth={this.onDateleAuth}
            getCurrentInfo={this.getCurrentInfo}
            getFddAuth={this.getFddAuth}
            getFddPhone={this.getFddPhone}
            getQYSAuth={this.getQYSAuth}
            docTypeLevelCode={docTypeLevelCode}
          />
        )}
      </div>
    );
  }

  // // security-level
  // renderSecurityLevel() {
  //   const { userInfo: { securityLevelMeaning } } = this.props;
  //   return (
  //     <LineItem
  //       key="securityLevel"
  //       style={securityLevelStyle}
  //       itemLabel={null}
  //       content={
  //         <React.Fragment>
  //           <span className={styles['security-level']}>您当前账号的安全程度</span>
  //           <span>{securityLevelMeaning}</span>
  //         </React.Fragment>
  //       }
  //     />
  //   );
  // }

  @Bind()
  handleExport() {
    downloadFileByAxios({
      requestUrl: `${HZERO_IAM}/hzero/v1/users/self/export`,
      method: 'GET',
    });
  }

  @Bind()
  handleModalFormCancelDefault() {
    setSession(`user-info-verifyPhone`, 0);
    this.renderModalFormItems = undefined;
    this.handleModalFormOk = this.handleModalFormOkDefault;
    this.setState({
      modalProps: { visible: false },
    });
  }

  renderPassword() {
    const { userInfo = {} } = this.props;
    const { updatePasswordLimited } = userInfo;
    const content = [
      <Tooltip
        theme="light"
        title={
          updatePasswordLimited
            ? intl
                .get('hiam.userInfo.view.message.securityPolicy')
                .d('安全策略配置，个人用户不允许更改密码')
            : undefined
        }
      >
        <Button
          key="update"
          color={userInfo.passwordResetFlag !== 1 ? undefined : 'primary'}
          onClick={this.handlePasswordEdit}
          disabled={updatePasswordLimited}
        >
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      </Tooltip>,
    ];
    return (
      <EditableListItem
        key="password"
        title={
          <div>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.userInfo.model.user.loginPassword').d('登录密码')}
            </span>
            {userInfo.passwordResetFlag === 1 ? (
              <Tag color="green">
                <span>{intl.get('hiam.userInfo.view.status.setted').d('已设置')}</span>
              </Tag>
            ) : (
              <Tag color="orange">
                {intl
                  .get('hiam.userInfo.view.status.noSetPassword')
                  .d('管理员设置的初始密码,请修改')}
              </Tag>
            )}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.password')
          .d(
            '安全性高的密码可以使账号更安全。建议您定期更换密码，设置一个包含字母，符号或数字中至少两项长度超过6位的密码。'
          )}
        content={content}
      />
    );
  }

  @Bind()
  openUpdatepasswordModal() {
    const {
      userInfo: { loginName, phone, email, phoneCheckFlag, emailCheckFlag },
      passwordTipMsg = {},
      onPasswordUpdate,
    } = this.props;
    const dataSet = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'originalPassword',
          label: intl.get('hiam.userInfo.model.user.originalPassword').d('原密码'),
          required: true,
          maxLength: 110,
        },
        {
          name: 'password',
          label: intl.get('hiam.userInfo.model.user.password').d('密码'),
          required: true,
          maxLength: 110,
          validator: (value, name, record) => {
            const result = validatePasswordRuleNew(value, { ...passwordTipMsg, loginName });
            if (result) {
              return result;
            }
            if (value && value === record.get('originalPassword')) {
              return intl
                .get('hiam.subAccount.view.validation.passwordNoSame')
                .d('新密码不能与原密码相同');
            }
          },
        },
        {
          name: 'anotherPassword',
          label: intl.get('hiam.userInfo.model.user.anotherPassword').d('确认密码'),
          required: true,
          maxLength: 110,
          validator: (value, name, record) => {
            if (value && value !== record.get('password')) {
              return intl
                .get('hiam.userInfo.view.validation.passwordSame')
                .d('确认密码必须与密码相同');
            }
          },
        },
      ],
    });
    const hasPhoneOrEmail = (phoneCheckFlag && phone) || (emailCheckFlag && email);
    const updatepasswordModal = C7NModal.open({
      title: intl.get('hiam.userInfo.view.message.title.form.password').d('更改密码'),
      drawer: true,
      closable: false,
      style: { width: '380px' },
      children: (
        <C7NForm dataSet={dataSet} labelLayout="float">
          <Password name="originalPassword" autoComplete="new-password" />
          <Password name="password" />
          <Password name="anotherPassword" />
          {hasPhoneOrEmail && (
            <div style={{ textAlign: 'right' }}>
              <Button
                funcType="link"
                onClick={() => {
                  this.openUpdatepasswordModalNew({
                    onBack: () => {
                      this.openUpdatepasswordModal();
                    },
                  });
                  if (updatepasswordModal) {
                    updatepasswordModal.close();
                  }
                }}
              >
                {intl
                  .get('hiam.userInfo.view.message.title.form.passwordVerify')
                  .d('验证码方式更改密码')}
              </Button>
            </div>
          )}
        </C7NForm>
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        if (!dataSet.current) {
          return false;
        }
        const flag = await dataSet.current.validate();
        if (!flag) {
          return false;
        }
        const { originalPassword, password } = dataSet.current.get([
          'originalPassword',
          'password',
        ]);
        const { publicKey, dispatch } = this.props;
        if (passwordTipMsg.loginAgain) {
          return new Promise((resolve) => {
            Modal.confirm({
              title: `${intl
                .get('hiam.userInfo.view.confirmLoginAgain')
                .d('修改密码后需要重新登录，是否确认？')}`,
              onOk: async () => {
                const res = await onPasswordUpdate({
                  password: encryptPwd(password, publicKey),
                  originalPassword: encryptPwd(originalPassword, publicKey),
                });
                if (res && res.failed) {
                  notification.warning({
                    message: res.message,
                  });
                  if (
                    res.message ===
                    intl
                      .get('hiam.userInfo.model.user.passwordError')
                      .d('您的密码错误，还可以尝试0次')
                  ) {
                    dispatch({
                      type: 'login/logout',
                    });
                  }
                  resolve(false);
                } else {
                  dispatch({
                    type: 'login/logout',
                  });
                  resolve(true);
                }
              },
              onCancel: () => {
                resolve(false);
              },
            });
          });
        } else {
          const res = await onPasswordUpdate({
            password: encryptPwd(password, publicKey),
            originalPassword: encryptPwd(originalPassword, publicKey),
          });
          if (res && res.failed) {
            notification.warning({
              message: res.message,
            });
            if (
              res.message ===
              intl.get('hiam.userInfo.model.user.passwordError').d('您的密码错误，还可以尝试0次')
            ) {
              dispatch({
                type: 'login/logout',
              });
            }
            return false;
          } else {
            return true;
          }
        }
      },
    });
  }

  @Bind()
  openUpdatepasswordModalWithVerify(passwordTipMsg) {
    const {
      dispatch,
      userInfo: { phone, email, phoneCheckFlag, emailCheckFlag },
      userInfo,
      publicKey,
      onPasswordUpdate,
    } = this.props;
    if (!(phoneCheckFlag && phone) && !(emailCheckFlag && email)) {
      notification.warning({
        message: intl
          .get('hiam.userInfo.view.confirmBindPhoneOrEmail')
          .d('当前用户未绑定手机号或邮箱，请先绑定。'),
      });
    } else {
      const clearUpdatePasswordModal = () => {
        this.updatePasswordModal = undefined;
      };
      if (!this.updatePasswordModal) {
        this.updatePasswordModal = C7NModal.open({
          title: intl.get('hiam.userInfo.view.message.title.form.password').d('更改密码'),
          drawer: true,
          style: { width: '480px' },
          className: styles['password-modal'],
          onCancel: clearUpdatePasswordModal,
          onClose: clearUpdatePasswordModal,
          children: (
            <ChangePassword
              onPasswordUpdate={onPasswordUpdate}
              dispatch={dispatch}
              publicKey={publicKey}
              modal={this.updatePasswordModal}
              userInfo={userInfo}
              clearModal={clearUpdatePasswordModal}
              passwordTipMsg={passwordTipMsg}
              onBack={() => {
                this.openUpdatepasswordModalNew({
                  onBack: () => {
                    this.openUpdatepasswordModalWithVerify(passwordTipMsg);
                  },
                });
                if (this.updatePasswordModal) {
                  this.updatePasswordModal.close();
                }
              }}
            />
          ),
          footer: null,
        });
      }
    }
  }

  @Bind()
  async openUpdatepasswordModalNew({ onBack }) {
    const {
      dispatch,
      passwordTipMsg,
      userInfo: { phone, email, phoneCheckFlag, emailCheckFlag },
      userInfo,
      publicKey,
      onPasswordUpdate,
    } = this.props;
    if (!(phoneCheckFlag && phone) && !(emailCheckFlag && email)) {
      notification.warning({
        message: intl
          .get('hiam.userInfo.view.confirmBindPhoneOrEmail')
          .d('当前用户未绑定手机号或邮箱，请先绑定。'),
      });
      return;
    }
    let passwordRule = passwordTipMsg;
    if (!passwordRule) {
      passwordRule = await dispatch({
        type: 'userInfo/getPasswordRule',
        payload: { organizationId: getUserOrganizationId() },
      });
    }
    const modal = C7NModal.open({
      title: intl.get('hiam.userInfo.view.message.title.form.password').d('更改密码'),
      drawer: true,
      closable: false,
      className: styles['password-modal'],
      style: { width: '380px' },
      children: (
        <ChangePasswordNew
          onPasswordUpdate={onPasswordUpdate}
          dispatch={dispatch}
          publicKey={publicKey}
          modal={modal}
          userInfo={userInfo}
          passwordTipMsg={passwordRule}
          onBack={() => {
            if (onBack) {
              onBack();
            }
            if (modal) {
              modal.close();
            }
          }}
        />
      ),
      footer: null,
    });
  }

  @Bind()
  @Debounce(200)
  handlePasswordEdit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userInfo/getPasswordRule',
      payload: { organizationId: getUserOrganizationId() },
    }).then((res) => {
      if (res && res.forceCodeVerify) {
        this.openUpdatepasswordModalWithVerify(res);
      } else {
        this.openUpdatepasswordModal();
      }
    });
  }

  @Bind()
  handlePasswordUpdate(fieldsValue) {
    const { publicKey, dispatch, passwordTipMsg = {} } = this.props;
    const { onPasswordUpdate } = this.props;
    const captchaKey = getSession('user-info-verifyPhone');
    if (passwordTipMsg.loginAgain) {
      Modal.confirm({
        title: `${intl
          .get('hiam.userInfo.view.confirmLoginAgain')
          .d('修改密码后需要重新登录，是否确认？')}`,
        onOk() {
          onPasswordUpdate({
            password: encryptPwd(fieldsValue.password, publicKey),
            originalPassword: encryptPwd(fieldsValue.originalPassword, publicKey),
            phone: passwordTipMsg.forceCodeVerify ? fieldsValue.phone : undefined,
            captcha: passwordTipMsg.forceCodeVerify ? fieldsValue.captcha : undefined,
            captchaKey: passwordTipMsg.forceCodeVerify ? captchaKey : undefined,
            businessScope: passwordTipMsg.forceCodeVerify ? 'UPDATE_PASSWORD' : undefined,
          }).then((res) => {
            if (res && res.failed) {
              notification.warning({
                message: res.message,
              });
              if (
                res.message ===
                intl.get('hiam.userInfo.model.user.passwordError').d('您的密码错误，还可以尝试0次')
              ) {
                dispatch({
                  type: 'login/logout',
                });
              }
            } else {
              dispatch({
                type: 'login/logout',
              });
            }
          });
        },
      });
    } else {
      onPasswordUpdate({
        password: encryptPwd(fieldsValue.password, publicKey),
        originalPassword: encryptPwd(fieldsValue.originalPassword, publicKey),
        phone: passwordTipMsg.forceCodeVerify ? fieldsValue.phone : undefined,
        captcha: passwordTipMsg.forceCodeVerify ? fieldsValue.captcha : undefined,
        captchaKey: passwordTipMsg.forceCodeVerify ? captchaKey : undefined,
        businessScope: passwordTipMsg.forceCodeVerify ? 'UPDATE_PASSWORD' : undefined,
      }).then((res) => {
        if (res && res.failed) {
          notification.warning({
            message: res.message,
          });
          if (
            res.message ===
            intl.get('hiam.userInfo.model.user.passwordError').d('您的密码错误，还可以尝试0次')
          ) {
            dispatch({
              type: 'login/logout',
            });
          }
        } else {
          this.handleModalFormCancelDefault();
        }
      });
    }
  }

  //
  @Bind()
  handlegotoAppstore() {
    openTab({
      key: `/spfm/amkt-appstore`,
      title: intl.get('hiam.userInfo.model.user.appstore').d('应用商店'),
    });
    this.setState({ authTipsVisible: false });
  }

  @Bind()
  renderPasswordFormItems(form) {
    const {
      userInfo: { loginName, phone },
      passwordTipMsg = {},
      modalProps,
      modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
      postCaptchaLoading = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const { forceCodeVerify } = passwordTipMsg;
    const { validateNewPasswordNotSame, validatePasswordAnther } = this; // 验证改变了 this
    return [
      <FormItem
        required
        key="originalPassword"
        label={intl.get('hiam.userInfo.model.user.originalPassword').d('原密码')}
        {...formItemLayout}
      >
        {getFieldDecorator('originalPassword', {
          validateTrigger: 'onBlur',
          rules: [
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get('hiam.userInfo.model.user.originalPassword').d('原密码'),
              }),
            },
            {
              max: 110,
              message: intl.get('hzero.common.validation.max', {
                max: 110,
              }),
            },
          ],
          // 密码字段自动填充 https://developer.mozilla.org/zh-CN/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
        })(
          <Input
            type="password"
            autoComplete="new-password"
            onChange={() => {
              setTimeout(() => {
                form.validateFields(['password'], { force: true });
              });
            }}
          />
        )}
      </FormItem>,
      <FormItem
        required
        key="password"
        label={intl.get('hiam.userInfo.model.user.password').d('密码')}
        {...formItemLayout}
      >
        {getFieldDecorator('password', {
          rules: [
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get('hiam.userInfo.model.userInfo.password').d('密码'),
              }),
            },
            {
              validator: (_, value, callback) => {
                callback(validatePasswordRuleNew(value, { ...passwordTipMsg, loginName }));
              },
            },
            {
              validator: (_, value, callback) => {
                validateNewPasswordNotSame(value, callback, form);
              },
            },
            {
              max: 110,
              message: intl.get('hzero.common.validation.max', {
                max: 110,
              }),
            },
          ],
        })(
          <Input
            type="password"
            onChange={(e) => {
              this.validatePasswordRepeatForPassword(e, form);
            }}
          />
        )}
      </FormItem>,
      // // 密码输入框改了, 判断是否需要确认密码
      <FormItem
        required
        key="anotherPassword"
        label={intl.get('hiam.userInfo.model.user.anotherPassword').d('确认密码')}
        {...formItemLayout}
      >
        {getFieldDecorator('anotherPassword', {
          rules: [
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get('hiam.userInfo.model.userInfo.anotherPassword').d('确认密码'),
              }),
            },
            {
              validator: (_, value, callback) => {
                validatePasswordAnther(value, callback, form);
              },
            },
          ],
        })(<Input type="password" />)}
      </FormItem>,
      forceCodeVerify && (
        <FormItem
          required
          label={intl.get('hiam.userInfo.model.user.phone').d('手机号码')}
          {...formItemLayout}
        >
          {getFieldDecorator('phone', {
            initialValue: phone,
          })(<Input disabled />)}
        </FormItem>
      ),
      forceCodeVerify && (
        <FormItem
          required
          label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
          {...formItemLayout}
        >
          {getFieldDecorator('captcha', {
            validateTrigger: 'onBlur',
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.userInfo.model.userInfo.phoneCaptcha').d('短信验证码'),
                }),
              },
            ],
          })(<Input style={{ width: 255, marginRight: 10 }} />)}
          <Button
            // style={{ width: 90 }}
            disabled={validCodeSendLimitFlag}
            loading={postCaptchaLoading}
            onClick={() => {
              this.handleGainValidCodeBtnClick({
                type: 'verifyPhone',
                value: phone,
                modalProps: { ...modalProps, step: 'validatePhone' },
              });
            }}
          >
            {validCodeSendLimitFlag ? (
              <CountDown target={validCodeLimitTimeEnd} onEnd={this.handleValidCodeLimitEnd} />
            ) : (
              intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
            )}
          </Button>
        </FormItem>
      ),
    ].filter(Boolean);
  }

  renderPhone() {
    const { userInfo = {} } = this.props;
    let content = '';
    const phonePolicy = this.sensitivePolicy.PHONE || defaultSensitivePolicy.PHONE;
    if (!phonePolicy.visible) return null;
    if (userInfo.phoneCheckFlag === 1) {
      if (phonePolicy.modify) {
        content = (
          <Tooltip
            title={intl
              .get('hiam.userInfo.view.message.updatePhoneTips')
              .d('如您是销售员，更换手机号后请及时发起企业信息变更修改联系人对应联系方式')}
          >
            <Button key="update" onClick={() => this.handlePhoneEdit()}>
              {intl.get('hzero.common.button.update').d('修改')}
            </Button>
          </Tooltip>
        );
      }
    } else if (phonePolicy.bind) {
      content = (
        <Tooltip
          title={intl
            .get('hiam.userInfo.view.message.updatePhoneTips')
            .d('如您是销售员，更换手机号后请及时发起企业信息变更修改联系人对应联系方式')}
        >
          <Button key="bind" color="primary" onClick={() => this.handlePhoneEdit(true)}>
            {intl.get('hiam.userInfo.view.option.bind').d('绑定')}
          </Button>
        </Tooltip>
      );
    }
    return (
      <EditableListItem
        key="phone"
        title={
          <div>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.userInfo.model.user.phoneBind').d('绑定手机')}
            </span>
            {userInfo.phoneCheckFlag === 1 ? (
              <Tag color="green">
                {intl.get('hiam.userInfo.view.message.bind').d('已绑定')} {userInfo.phone}
              </Tag>
            ) : (
              <Tag color="orange">
                {intl.get('hiam.userInfo.view.message.unbind').d('未绑定')} {userInfo.phone}
              </Tag>
            )}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.phoneBind')
          .d('可用手机号加密码登录HZERO，可通过手机号找回密码')}
        content={content}
      />
    );
  }

  renderDestroyAccount() {
    const { userInfo = {} } = this.props;
    return (!userInfo.coreEnterpriseUser && isTenantRoleLevel()) || userInfo.showSignButton ? (
      <EditableListItem
        key="destoryAccount"
        title={intl.get('srm.common.title.destroyAccount').d('帐号注销')}
        description={intl
          .get('hiam.userInfo.view.message.destroyAccount')
          .d('删除帐号所有信息，永久失效')}
        content={
          <Button key="destroyAccount" onClick={this.handleDestroyAccount}>
            {intl.get('srm.common.button.destroyAccount').d('申请注销')}
          </Button>
        }
      />
    ) : null;
  }

  // email

  renderEmail() {
    const { userInfo = {} } = this.props;
    let content = '';
    const emailPolicy = this.sensitivePolicy.EMAIL || defaultSensitivePolicy.EMAIL;
    if (!emailPolicy.visible) return null;
    if (userInfo.emailCheckFlag === 1) {
      if (emailPolicy.modify) {
        content = (
          <Tooltip
            title={intl
              .get('hiam.userInfo.view.message.updateEmailTips')
              .d('如您是销售员，更换邮箱后请及时发起企业信息变更修改联系人对应联系方式')}
          >
            <Button key="update" onClick={() => this.handleEmailEdit()}>
              {intl.get('hzero.common.button.update').d('修改')}
            </Button>
          </Tooltip>
        );
      }
    } else if (emailPolicy.bind) {
      content = (
        <Tooltip
          title={intl
            .get('hiam.userInfo.view.message.updateEmailTips')
            .d('如您是销售员，更换邮箱后请及时发起企业信息变更修改联系人对应联系方式')}
        >
          <Button key="bind" color="primary" onClick={() => this.handleEmailEdit(true)}>
            {intl.get('hiam.userInfo.view.option.bind').d('绑定')}
          </Button>
        </Tooltip>
      );
    }
    return (
      <EditableListItem
        key="email"
        title={
          <div>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.userInfo.model.user.emailBind').d('绑定邮箱')}
            </span>
            {userInfo.emailCheckFlag === 1 ? (
              <Tag color="green">
                {intl.get('hiam.userInfo.view.message.bind').d('已绑定')} {userInfo.email}
              </Tag>
            ) : (
              <Tag color="orange">
                {intl.get('hiam.userInfo.view.message.unbind').d('未绑定')} {userInfo.email}
              </Tag>
            )}
          </div>
        }
        description={intl
          .get('hiam.userInfo.view.message.emailBind')
          .d('可用邮箱加密码登录HZERO，可用邮箱找回密码')}
        content={content}
      />
    );
  }

  // Authentication

  renderAuthentication() {
    const { authenticationLoading = false, userInfo: { id } = {} } = this.props;
    const content = (
      <Button
        key="bind"
        disabled={isNil(id)}
        onClick={this.handleAuthentication}
        loading={authenticationLoading}
      >
        {intl.get('hiam.userInfo.option.authenticationDetail').d('认证详情')}
      </Button>
    );
    return (
      <EditableListItem
        key="authentication"
        title={<div>{intl.get('hiam.userInfo.model.user.authentication').d('实名认证')}</div>}
        description={intl
          .get('hiam.userInfo.view.message.authentication')
          .d('可用于进行电子签章等相关业务')}
        content={content}
      />
    );
  }

  // open-app
  renderOpenApp() {
    const { openAccountList = [] } = this.props;
    return map(openAccountList, (openApp) => {
      const btns = [];
      if (openApp.openName) {
        btns.push(
          <Button
            key="unbind"
            className={styles['btn-bind']}
            onClick={this.handleUnBindApp.bind(this, openApp)}
          >
            {intl.get('hiam.userInfo.view.option.unBind').d('解绑')}
          </Button>
        );
      } else {
        btns.push(
          <Button
            key="bind"
            type="primary"
            className={styles['btn-bind']}
            onClick={this.handleBindApp.bind(this, openApp)}
          >
            {intl.get('hiam.userInfo.view.option.bind').d('绑定')}
          </Button>
        );
      }
      return (
        <MaxLenItem
          key={openApp.openAppId}
          icon={<img src={openApp.appImage} alt="" style={{ height: 36, width: 36 }} />}
          description={openApp.appName}
          content={openApp.openName || ''}
          btns={btns}
        />
      );
    });
  }

  /**
   * @function handleBindApp - 获取绑定认证地址
   * @param {object} item - 第三方数据
   */
  handleBindApp(item) {
    window.open(
      `${AUTH_HOST}/open/${item.appCode}?channel=${
        item.channel
      }&access_token=${getAccessToken()}&bind_redirect_uri=${encodeURIComponent(window.location)}`,
      '_self',
      'noopener,noreferrer'
    );
  }

  /**
   * @function handleUnBindApp - 解除第三方绑定
   * @param {object} item - 第三方应用数据
   */
  handleUnBindApp(item) {
    const { dispatch, userInfo: { id } = {} } = this.props;
    Modal.confirm({
      title: `${intl.get('hiam.userInfo.view.confirmUnBind').d('确定解除绑定')}？`,
      onOk() {
        dispatch({
          type: 'userInfo/unBindOpenAccount',
          payload: { ...item },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch({
              type: 'userInfo/fetchOpenAccountList',
              payload: { userId: id },
            });
          }
        });
      },
    });
  }

  // todo

  /**
   * 发送验证码
   * 旧手机的验证码, 新手机的验证码, 新邮箱的验证码
   * 获取验证码, 使用同一个变量, 要注意使用 和 清除
   * @param {'oldPhone' | 'newPhone' | 'newEmail'} [type='oldPhone'] - 获取哪个验证码
   * @param {!String} value - 对应的手机号 或者 邮箱
   * @param {Object} ...params - 其他参数
   */
  @Bind()
  handleGainValidCodeBtnClick({ type = 'oldPhone', value, businessScope = 'self', ...params }) {
    const { dispatch, modalProps = {} } = this.props;
    dispatch({
      type: 'userInfo/postCaptcha',
      payload: { type, value, modalProps, businessScope, ...params },
    });
  }

  /**
   * 解除 - 计时限制
   * 倒计时组件 计时完成后 触发, 取消计时状态
   */
  @Bind()
  handleValidCodeLimitEnd() {
    const { dispatch, modalProps = {} } = this.props;
    dispatch({
      type: 'userInfo/captchaLimitEnd',
      payload: { modalProps },
    });
  }

  handleDestroyAccount = () => {
    const { userInfo = {} } = this.props;
    if (!userInfo.email && !userInfo.phone) {
      notification.warning({
        message: intl
          .get('hiam.userInfo.view.message.destroyAccount.check1')
          .d('当前帐号未绑定手机号码和邮箱，无法注销'),
      });
      return;
    }
    let modal = null;
    const executeVerify = (payload) => {
      const body = {
        userId: userInfo.id,
        organizationId: userInfo.organizationId,
        captchaKey: payload.captchaKey,
        captcha: payload.captcha,
        phone: payload.account,
        userType: '',
        businessScope: '',
      };
      const callback = () => {
        const input = document.querySelectorAll('#login-access-verify > input')[0];
        input.focus();
      };
      return request(
        `${getEnvConfig().HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/recyle/valid`,
        {
          method: 'POST',
          body,
        }
      ).then((res) => {
        const newState = {
          verifyStatus: 'success',
          status: 'verifySuccess',
          verifyResponse: '',
        };
        let cb;
        if (getResponse(res)) {
          newState.verifyResponse = res;
          newState.verifyStatus = res.success ? 'success' : 'failed';
          if (res.success) {
            const verifyFailedData = [
              {
                verifyResponse: '',
                verifyStatus: 'failed',
              },
              callback,
            ];
            let resolve;
            const promise = new Promise((resTemp) => {
              resolve = resTemp;
            });
            C7NModal.confirm({
              title: null,
              children: intl
                .get('hiam.userInfo.view.message.tip5')
                .d('验证通过，确定注销该账号？确定后则自动退出系统'),
              onOk: () => {
                return request(
                  `${getEnvConfig().HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/recyle`,
                  {
                    method: 'POST',
                    body,
                  }
                ).then(
                  (res2) => {
                    if (getResponse(res2)) {
                      this.props.dispatch({
                        type: 'login/logout',
                      });
                      resolve([newState]);
                      return true;
                    }
                    if (modal) modal.close();
                    resolve(verifyFailedData);
                    return true;
                  },
                  () => {
                    resolve(verifyFailedData);
                    return true;
                  }
                );
              },
              onCancel: () => {
                if (modal) modal.close();
                resolve(verifyFailedData);
                return true;
              },
            });
            return promise;
          }
          newState.verifyStatus = 'failed';
        } else {
          newState.verifyStatus = 'failed';
        }
        if (newState.verifyStatus === 'failed') {
          delete newState.status;
          newState.verifyCodeIndex = 0;
          newState.verifyCode = [];
          // eslint-disable-next-line prefer-const
          cb = callback;
        }
        return [newState, cb];
      });
    };
    const tipChildren = (
      <div style={{ lineHeight: '24px' }}>
        <p style={{ textAlign: 'center', fontWeight: 600, lineHeight: '16px', fontSize: '16px' }}>
          {intl.get('hiam.userInfo.view.message.importTip').d('重要提示')}
        </p>
        <div>
          {intl
            .get('hiam.userInfo.view.message.tip1')
            .d(
              '注销账号是不可恢复的操作。操作之前，请确认好该账号的合作邀约业务均已进行妥善处理。'
            )}
        </div>
        <div>
          {intl
            .get('hiam.userInfo.view.message.tip2')
            .d('请谨记：注销账号，你将无法再使用该账号，注销后再进行注册，包括但不限于：')}
        </div>
        <div>
          {intl
            .get('hiam.userInfo.view.message.tip3')
            .d('(1)当前账号角色、权限信息无法同步到新的账号。')}
        </div>
        <div>
          {intl.get('hiam.userInfo.view.message.tip4').d('(2)已合作公司单据信息，无法再次查看。')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Button
            color="primary"
            onClick={() => {
              modal.update({
                children: (
                  <AccessLogin
                    disablePd
                    executeVerify={executeVerify}
                    successInfo={
                      <div style={{ height: '247px' }}>
                        <div>{intl.get('hzero.common.notification.success')}</div>
                      </div>
                    }
                  />
                ),
              });
            }}
          >
            {intl.get('srm.common.button.destroyAccount.confirm').d('确认注销')}
          </Button>
        </div>
      </div>
    );
    modal = C7NModal.open({
      title: intl.get('srm.common.title.destroyAccount').d('帐号注销'),
      children: tipChildren,
      footer: (ok, cancel) => [cancel],
    });
  };

  /**
   * 修改邮箱： 校验身份
   * @memberof UserInfo
   */
  @Bind()
  handleEmailEdit(bindFlag = false) {
    const {
      dispatch,
      userInfo: { email, phone },
    } = this.props;
    dispatch({
      type: 'userInfo/closeForm',
      payload: {
        modalProps: {},
      },
    });
    const formDs = new DataSet({
      fields: [
        {
          name: 'oldPhone',
          label: intl.get('hiam.userInfo.model.user.phone').d('手机号码'),
          required: true,
        },
        {
          name: 'captcha',
          required: true,
        },
        {
          name: 'newPhone',
          label: intl.get('hiam.userInfo.model.user.phone').d('手机号码'),
          required: true,
          validator: (value, _, record) => {
            if (!value) {
              return;
            }
            if (!PHONE.test(value)) {
              return intl.get('hzero.common.validation.phone').d('手机格式不正确');
            }
            if (value === record.get('oldPhone')) {
              return intl.get('hzero.common.validation.phone.newPhone').d('请输入新手机号码');
            }
          },
        },
        {
          name: 'password',
          label: intl.get('hiam.userInfo.model.user.originalPassword').d('原密码'),
          required: true,
        },
        {
          name: 'oldEmail',
          label: intl.get('hiam.userInfo.model.user.email').d('邮箱'),
          required: true,
          validator: (value) => {
            if (!value) {
              return;
            }
            if (!EMAIL.test(value)) {
              return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
            }
          },
        },
        {
          name: 'newEmail',
          label: intl.get('hiam.userInfo.model.user.email').d('邮箱'),
          required: true,
          validator: (value, _, record) => {
            if (!value) {
              return;
            }
            if (!EMAIL.test(value)) {
              return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
            }
            if (value === record.get('oldEmail')) {
              return intl.get('hzero.common.validation.phone.newEmail').d('请输入新邮箱');
            }
          },
        },
      ],
    });
    const formRecord = formDs.create({
      oldEmail: email,
      oldPhone: phone,
    });
    const step = bindFlag
      ? 'validateUnCheckedEmail'
      : email
      ? 'validateOldEmail'
      : 'validatePassword';
    C7NModal.open({
      title: bindFlag
        ? intl.get('hiam.userInfo.view.message.title.form.unCheckedEmail').d('绑定邮箱')
        : intl.get('hiam.userInfo.view.message.title.form.email').d('更改邮箱'),
      style: { width: '380px' },
      bodyStyle: { padding: 0 },
      drawer: true,
      footer: null,
      children: (
        <UpdatePhoneAndEmailModal
          formRecord={formRecord}
          step={step}
          editType="email"
          onRefresh={this.handleRefresh}
        />
      ),
    });
  }

  /**
   * 打开修改邮箱的模态框
   */
  @Bind()
  openUpdateNewEmailForm() {
    this.handleOpenForm({
      ...this.getValidateNewEmailFormProps(),
    });
  }

  @Bind()
  handleUnCheckedEmailBind() {
    this.handleOpenForm(this.getValidateUnCheckedEmailFormProps());
  }

  /**
   *查看认证信息
   * @memberof SafeInfo
   */
  @Bind()
  handleAuthentication(type) {
    const { dispatch, userInfo: { id } = {} } = this.props;
    if (isNil(id)) {
      notification.warning({
        message: intl
          .get('hiam.userInfo.view.message.refreshPage')
          .get('缺少必要参数，请刷新页面重试'),
      });
      return;
    }
    dispatch({
      type: 'userInfo/fetchauthentication',
      payload: { userId: id },
    }).then((res) => {
      if (type === 'recall') {
        this.setState({ authenticationInfoVisible: false });
      } else if (res) {
        if (res.length > 0) {
          this.setState({ authenticationInfoVisible: true, authenticationList: res });
        } else {
          this.setState({ authTipsVisible: true });
        }
      }
    });
  }

  /**
   *查看个人登录记录
   * @memberof SafeInfo
   */
  @Bind()
  handleCheckLoginLog() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hiam/user/login-log`,
      })
    );
  }

  /**
   * 修改手机： 校验身份
   * @memberof UserInfo
   */
  @Bind()
  handlePhoneEdit(bindFlag = false) {
    const {
      dispatch,
      userInfo: { phone },
    } = this.props;
    dispatch({
      type: 'userInfo/closeForm',
      payload: {
        modalProps: {},
      },
    });
    const formDs = new DataSet({
      fields: [
        {
          name: 'oldPhone',
          label: intl.get('hiam.userInfo.model.user.phone').d('手机号码'),
          required: true,
        },
        {
          name: 'captcha',
          label: intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码'),
          required: true,
        },
        {
          name: 'newPhone',
          label: intl.get('hiam.userInfo.model.user.phone').d('手机号码'),
          required: true,
          validator: (value, _, record) => {
            if (!value) {
              return;
            }
            if (!PHONE.test(value)) {
              return intl.get('hzero.common.validation.phone').d('手机格式不正确');
            }
            if (value === record.get('oldPhone')) {
              return intl.get('hzero.common.validation.phone.newPhone').d('请输入新手机号码');
            }
          },
        },
        {
          name: 'password',
          label: intl.get('hiam.userInfo.model.user.originalPassword').d('原密码'),
          required: true,
        },
      ],
    });
    const formRecord = formDs.create({
      oldPhone: phone,
    });
    const step = bindFlag
      ? 'validateUnCheckedPhone'
      : phone
      ? 'validateOldPhone'
      : 'validatePassword';
    C7NModal.open({
      title: bindFlag
        ? intl.get('hiam.userInfo.view.message.title.form.unCheckedPhone').d('绑定手机号码')
        : intl.get('hiam.userInfo.view.message.title.form.phone').d('更改手机号码'),
      style: { width: '380px' },
      bodyStyle: { padding: 0 },
      drawer: true,
      footer: null,
      children: (
        <UpdatePhoneAndEmailModal
          formRecord={formRecord}
          step={step}
          onRefresh={this.handleRefresh}
        />
      ),
    });
  }

  @Bind()
  handleUnCheckedPhoneBind() {
    this.handleOpenForm(this.getValidateUnCheckedPhoneFormProps());
  }

  /**
   * 打开修改手机的模态框
   */
  @Bind()
  openUpdateNewPhoneForm() {
    this.handleOpenForm({
      ...this.getValidateNewPhoneFormProps(),
    });
  }

  /**
   * 获取 通过邮箱认证身份时的 EditFormModal 的属性
   * @param {Function} onNext - 通过邮箱 认证身份后的 下一步操作
   */
  @Bind()
  getValidateOldEmailFormProps(onNext) {
    const formProps = {
      step: 'validateOldEmail',
      okText: intl.get('hzero.common.button.next').d('下一步'),
      onCancel: this.handleCloseForm,
      onOk: (fieldsValue, form) => {
        const { modalProps = {}, dispatch } = this.props;
        const { captcha } = fieldsValue;
        form.resetFields();
        dispatch({
          type: 'userInfo/validatePreValidate',
          payload: { captcha, type: 'oldEmail', modalProps, businessScope: 'self' },
        }).then((res) => {
          if (res) {
            onNext();
          }
        });
      },
    };
    formProps.formItems = (form) => {
      const { getFieldDecorator } = form;
      const {
        userInfo,
        modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
        postCaptchaLoading = false,
      } = this.props;
      return (
        <>
          <FormItem
            required
            label={intl.get('hiam.userInfo.model.user.email').d('邮箱')}
            {...formItemLayout}
          >
            {getFieldDecorator('oldEmail', {
              initialValue: userInfo.email,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            required
            label={intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码')}
            {...formItemLayout}
          >
            {getFieldDecorator('captcha', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.userInfo.model.userInfo.emailCaptcha').d('邮箱验证码'),
                  }),
                },
              ],
            })(<Input style={{ width: '255px', marginRight: '10px' }} />)}
            <Button
              // style={{ width: 90 }}
              loading={postCaptchaLoading}
              disabled={validCodeSendLimitFlag}
              onClick={() => {
                this.handleGainValidCodeBtnClick({ type: 'oldEmail', value: userInfo.email });
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={this.handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
          </FormItem>
          <div style={{ textAlign: 'right' }}>
            <a
              onClick={() => {
                this.handleOpenForm({
                  ...this.getValidatePasswordFormProps(onNext),
                });
              }}
            >
              {intl
                .get('hiam.userInfo.view.message.cantReceiveEmailCaptcha')
                .d('邮箱无法收到验证码')}
              ？
            </a>
          </div>
        </>
      );
    };
    return formProps;
  }

  /**
   * 获取 通过手机认证身份时的 EditFormModal 的属性
   * @param {Function} onNext - 通过手机 认证身份后的 下一步操作
   */
  @Bind()
  getValidateOldPhoneFormProps(onNext) {
    const {
      userInfo: { phoneCheckFlag },
    } = this.props;
    if (phoneCheckFlag !== 1) {
      // 手机号 没有经过 校验, 则只能通过密码校验
      return this.getValidatePasswordFormProps(onNext);
    }
    const formProps = {
      step: 'validateOldPhone',
      okText: intl.get('hzero.common.button.next').d('下一步'),
      onCancel: this.handleCloseForm,
      onOk: (fieldsValue, form) => {
        const { modalProps = {}, dispatch } = this.props;
        const { captcha } = fieldsValue;
        form.resetFields();
        dispatch({
          type: 'userInfo/validatePreValidate',
          payload: { captcha, type: 'oldPhone', modalProps, businessScope: 'self' },
        }).then((res) => {
          if (res) {
            onNext();
          }
        });
      },
    };
    formProps.formItems = (form) => {
      const { getFieldDecorator } = form;
      const {
        userInfo,
        modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
        postCaptchaLoading = false,
      } = this.props;
      return (
        <>
          <FormItem
            required
            label={intl.get('hiam.userInfo.model.user.phone').d('手机号码')}
            {...formItemLayout}
          >
            {getFieldDecorator('oldPhone', {
              initialValue: userInfo.phone,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            required
            label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
            {...formItemLayout}
          >
            {getFieldDecorator('captcha', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.userInfo.model.userInfo.phoneCaptcha').d('短信验证码'),
                  }),
                },
              ],
            })(<Input style={{ width: 255, marginRight: 10 }} />)}
            <Button
              // style={{ width: 90 }}
              disabled={validCodeSendLimitFlag || isNil(userInfo.phone)}
              loading={postCaptchaLoading}
              onClick={() => {
                this.handleGainValidCodeBtnClick({ type: 'oldPhone', value: userInfo.phone });
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={this.handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
          </FormItem>
          <div style={{ textAlign: 'right' }}>
            <a
              onClick={() => {
                this.handleOpenForm({
                  ...this.getValidatePasswordFormProps(onNext),
                });
              }}
            >
              {intl
                .get('hiam.userInfo.view.message.cantReceivePhoneCaptcha')
                .d('手机无法接收验证码')}
              ？
            </a>
          </div>
        </>
      );
    };
    return formProps;
  }

  /**
   * 获取 通过密码认证身份时的 EditFormModal 的属性
   * @param {Function} onNext - 通过密码 认证身份后的 下一步操作
   */
  @Bind()
  getValidatePasswordFormProps(onNext) {
    const { publicKey } = this.props;
    const formProps = {
      step: 'validatePassword',
      okText: intl.get('hzero.common.button.next').d('下一步'),
      onCancel: this.handleCloseForm,
      onOk: (fieldsValue, form) => {
        const { modalProps = {}, dispatch } = this.props;
        const { captcha } = fieldsValue;
        form.resetFields();
        dispatch({
          type: 'userInfo/validatePreValidate',
          payload: {
            captcha,
            captchaKey: modalProps.captchaKey,
            modalProps,
            businessScope: 'self',
          },
        }).then((res) => {
          if (res) {
            onNext();
          }
        });
      },
    };
    formProps.formItems = (form) => {
      const { getFieldDecorator } = form;
      return (
        <>
          <FormItem
            required
            label={intl.get('hiam.userInfo.model.user.originalPassword').d('原密码')}
            {...formItemLayout}
          >
            {getFieldDecorator('password', {
              validateTrigger: 'onBlur',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.userInfo.model.user.originalPassword').d('原密码'),
                  }),
                },
              ],
            })(<Input type="password" />)}
          </FormItem>
        </>
      );
    };
    formProps.onOk = (fieldsValue) => {
      const { password } = fieldsValue;
      const { modalProps = {}, dispatch } = this.props;
      dispatch({
        type: 'userInfo/validatePrePassword',
        payload: { password: encryptPwd(password, publicKey), modalProps, businessScope: 'self' },
      }).then((res) => {
        if (res) {
          if (isFunction(onNext)) {
            onNext();
          }
        }
      });
    };
    return formProps;
  }

  /**
   * 获取 修改邮箱时 EditFormModal 的属性
   */
  @Bind()
  getValidateNewEmailFormProps() {
    const formProps = {
      title: intl.get('hiam.userInfo.view.message.title.form.email').d('更改邮箱'),
      step: 'validateNewEmail',
      onCancel: this.handleCloseForm,
      onOk: (fieldsValue, form) => {
        const { captcha, newEmail } = fieldsValue;
        // 新的邮箱的 验证 key
        const {
          userInfo = {},
          modalProps: { lastCheckKey, captchaKey: emailCaptchaKey },
          dispatch,
        } = this.props;
        dispatch({
          type: 'userInfo/validateNewEmail',
          payload: {
            email: newEmail,
            captcha,
            captchaKey: emailCaptchaKey,
            lastCheckKey,
            userInfo,
            businessScope: 'self',
          },
        }).then((res) => {
          if (res) {
            form.resetFields();
            this.handleCloseForm('ok');
          }
        });
      },
      formItems: (form) => {
        const { getFieldDecorator } = form;
        const {
          modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
          postCaptchaLoading = false,
        } = this.props;
        return (
          <>
            <FormItem
              required
              label={intl.get('hiam.userInfo.model.user.email').d('邮箱')}
              {...formItemLayout}
            >
              {getFieldDecorator('newEmail', {
                validateTrigger: 'onBlur',
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.userInfo.model.user.email').d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                  {
                    validator: this.validateEmailIsNoLastEmail,
                  },
                  {
                    validator: this.validateEmailRegister,
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              required
              label={intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码')}
              {...formItemLayout}
            >
              {getFieldDecorator('captcha', {
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码'),
                    }),
                  },
                ],
              })(<Input style={{ width: 255, marginRight: 10 }} />)}
              <Button
                // style={{ width: 90 }}
                disabled={validCodeSendLimitFlag}
                loading={postCaptchaLoading}
                onClick={() => {
                  const {
                    modalProps: { lastCheckKey },
                  } = this.props;
                  form.validateFields(['newEmail'], (err, fieldsValue) => {
                    if (!err) {
                      if (!lastCheckKey) {
                        notification.warning({
                          message: intl
                            .get('hiam.userInfo.view.message.missingRequireParams')
                            .d('缺少必要参数，请返回上一步重新获取验证码'),
                        });
                      } else {
                        this.handleGainValidCodeBtnClick({
                          type: 'newEmail',
                          lastCheckKey,
                          value: fieldsValue.newEmail,
                        });
                      }
                    }
                  });
                }}
              >
                {validCodeSendLimitFlag ? (
                  <CountDown
                    target={validCodeLimitTimeEnd}
                    onEnd={this.handleValidCodeLimitEnd}
                    disabled={!!form.getFieldError('newEmail')}
                  />
                ) : (
                  intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                )}
              </Button>
            </FormItem>
          </>
        );
      },
    };
    return formProps;
  }

  /**
   * 绑定邮箱 | 验证未验证的邮箱
   * 验证未验证的邮箱: 给邮箱发送验证码 后 修改邮箱
   * 绑定邮箱: 验证身份 后 修改邮箱
   */
  @Bind()
  getValidateUnCheckedEmailFormProps() {
    const {
      userInfo: { email, emailCheckFlag },
    } = this.props;
    let formProps;
    if (emailCheckFlag !== 1 && !email) {
      // 绑定邮箱
      formProps = this.getValidateOldPhoneFormProps(this.openUpdateNewEmailForm);
    } else {
      // 验证邮箱
      formProps = {
        step: 'validateUnCheckedEmail',
        onCancel: this.handleCloseForm,
        onOk: (fieldsValue, form) => {
          const { captcha } = fieldsValue;
          // 新的邮箱的 验证 key
          const {
            modalProps: { captchaKey: emailCaptchaKey },
            userInfo = {},
            dispatch,
          } = this.props;
          if (!emailCaptchaKey) {
            notification.warning({
              message: intl
                .get('hiam.userInfo.view.message.missingRequireParams')
                .d('缺少必要参数，请返回上一步重新获取验证码'),
            });
          }
          dispatch({
            type: 'userInfo/validateUnCheckedEmail',
            payload: {
              captcha,
              captchaKey: emailCaptchaKey,
              userInfo,
              businessScope: 'self',
            },
          }).then((res) => {
            if (res) {
              form.resetFields();
              this.handleCloseForm('ok');
            }
          });
        },
        formItems: (form) => {
          const { getFieldDecorator } = form;
          const {
            modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
            userInfo = {},
            postCaptchaLoading = false,
          } = this.props;
          return (
            <>
              <FormItem
                required
                label={intl.get('hiam.userInfo.model.user.email').d('邮箱')}
                {...formItemLayout}
              >
                {getFieldDecorator('oldEmail', {
                  initialValue: userInfo.email,
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.userInfo.model.user.email').d('邮箱'),
                      }),
                    },
                    {
                      pattern: EMAIL,
                      message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
              <FormItem
                required
                label={intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码')}
                {...formItemLayout}
              >
                {getFieldDecorator('captcha', {
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码'),
                      }),
                    },
                  ],
                })(<Input style={{ width: 255, marginRight: 10 }} />)}
                <Button
                  // style={{ width: 90 }}
                  disabled={validCodeSendLimitFlag}
                  loading={postCaptchaLoading}
                  onClick={() => {
                    form.validateFields(['oldEmail'], (err, fieldsValue) => {
                      if (!err) {
                        this.handleGainValidCodeBtnClick({
                          type: 'oldEmail',
                          value: fieldsValue.oldEmail,
                        });
                      }
                    });
                  }}
                >
                  {validCodeSendLimitFlag ? (
                    <CountDown
                      target={validCodeLimitTimeEnd}
                      onEnd={this.handleValidCodeLimitEnd}
                      disabled={!!form.getFieldError('oldEmail')}
                    />
                  ) : (
                    intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                  )}
                </Button>
              </FormItem>
            </>
          );
        },
      };
    }
    formProps.title = intl
      .get('hiam.userInfo.view.message.title.form.unCheckedEmail')
      .d('绑定邮箱');
    return formProps;
  }

  /**
   * 获取 修改手机时 EditFormModal 的属性
   */
  @Bind()
  getValidateNewPhoneFormProps() {
    const formProps = {
      title: intl.get('hiam.userInfo.view.message.title.form.phone').d('更改手机号码'),
      step: 'validateNewPhone',
      onCancel: this.handleCloseForm,
      onOk: (fieldsValue, form) => {
        const { captcha, newPhone } = fieldsValue;
        // 新的邮箱的 验证 key
        const {
          modalProps: { lastCheckKey, captchaKey: phoneCaptchaKey },
          userInfo = {},
          dispatch,
        } = this.props;
        dispatch({
          type: 'userInfo/validateNewPhone',
          payload: {
            phone: newPhone,
            captcha,
            captchaKey: phoneCaptchaKey,
            lastCheckKey,
            userInfo,
            businessScope: 'self',
          },
        }).then((res) => {
          if (res) {
            form.resetFields();
            this.handleCloseForm('ok');
          }
        });
      },
      formItems: (form) => {
        const { getFieldDecorator } = form;
        const {
          modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
          postCaptchaLoading = false,
        } = this.props;
        return (
          <>
            <FormItem
              required
              label={intl.get('hiam.userInfo.model.user.phone').d('手机号码')}
              {...formItemLayout}
            >
              {getFieldDecorator('newPhone', {
                validateTrigger: 'onBlur',
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.userInfo.model.user.phone').d('手机号码'),
                    }),
                  },
                  {
                    pattern: PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                  {
                    validator: this.validatePhoneIsNoLastPhone,
                  },
                  {
                    validator: this.validatePhoneRegister,
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              required
              label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
              {...formItemLayout}
            >
              {getFieldDecorator('captcha', {
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码'),
                    }),
                  },
                ],
              })(<Input style={{ width: 255, marginRight: 10 }} />)}
              <Button
                //  style={{ width: 90 }}
                disabled={validCodeSendLimitFlag}
                loading={postCaptchaLoading}
                onClick={() => {
                  const {
                    modalProps: { lastCheckKey },
                  } = this.props;
                  form.validateFields(['newPhone'], (err, fieldsValue) => {
                    if (!err) {
                      if (!lastCheckKey) {
                        notification.warning({
                          message: intl
                            .get('hiam.userInfo.view.message.missingRequireParams')
                            .d('缺少必要参数，请返回上一步重新获取验证码'),
                        });
                      } else {
                        this.handleGainValidCodeBtnClick({
                          type: 'newPhone',
                          lastCheckKey,
                          value: fieldsValue.newPhone,
                        });
                      }
                    }
                  });
                }}
              >
                {validCodeSendLimitFlag ? (
                  <CountDown
                    target={validCodeLimitTimeEnd}
                    onEnd={this.handleValidCodeLimitEnd}
                    disabled={!!form.getFieldError('newPhone')}
                  />
                ) : (
                  intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                )}
              </Button>
            </FormItem>
          </>
        );
      },
    };
    return formProps;
  }

  /**
   * 绑定手机号的表单
   * @returns {{title: *, step: string, onCancel: UserInfo.handleCloseForm, onOk: onOk, formItems: (function(*): *)}}
   */
  @Bind()
  getValidateUnCheckedPhoneFormProps() {
    const formProps = {
      title: intl.get('hiam.userInfo.view.message.title.form.unCheckedPhone').d('绑定手机号码'),
      step: 'validateUnCheckedPhone',
      onCancel: this.handleCloseForm,
      onOk: (fieldsValue, form) => {
        const { captcha } = fieldsValue;
        // 新的邮箱的 验证 key
        const {
          modalProps: { captchaKey: phoneCaptchaKey },
          userInfo = {},
          dispatch,
        } = this.props;
        dispatch({
          type: 'userInfo/validateUnCheckedPhone',
          payload: {
            captcha,
            captchaKey: phoneCaptchaKey,
            userInfo,
            businessScope: 'self',
          },
        }).then((res) => {
          if (res) {
            form.resetFields();
            this.handleCloseForm('ok');
          }
        });
      },
      formItems: (form) => {
        const { getFieldDecorator } = form;
        const {
          modalProps: { validCodeSendLimitFlag, validCodeLimitTimeEnd },
          userInfo = {},
          postCaptchaLoading = false,
        } = this.props;
        return (
          <>
            <FormItem
              required
              label={intl.get('hiam.userInfo.model.user.phone').d('手机号码')}
              {...formItemLayout}
            >
              {getFieldDecorator('oldPhone', {
                initialValue: userInfo.phone,
                validateTrigger: 'onBlur',
                validateFirst: true,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.userInfo.model.user.phone').d('手机号码'),
                    }),
                  },
                  {
                    pattern: PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
            <FormItem
              required
              label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
              {...formItemLayout}
            >
              {getFieldDecorator('captcha', {
                validateTrigger: 'onBlur',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码'),
                    }),
                  },
                ],
              })(<Input style={{ width: 255, marginRight: 10 }} />)}
              <Button
                // style={{ width: 90 }}
                disabled={validCodeSendLimitFlag || isNil(userInfo.phone)}
                loading={postCaptchaLoading}
                onClick={() => {
                  form.validateFields(['oldPhone'], (err, fieldsValue) => {
                    if (!err) {
                      this.handleGainValidCodeBtnClick({
                        type: 'oldPhone',
                        value: fieldsValue.oldPhone,
                      });
                    }
                  });
                }}
              >
                {validCodeSendLimitFlag ? (
                  <CountDown
                    target={validCodeLimitTimeEnd}
                    onEnd={this.handleValidCodeLimitEnd}
                    disabled={!!form.getFieldError('oldPhone')}
                  />
                ) : (
                  intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                )}
              </Button>
            </FormItem>
          </>
        );
      },
    };
    return formProps;
  }

  /**
   * handleOpenForm - 打开模态框
   * @param {Object} payload - modalProps 的数据
   */
  @Bind()
  handleOpenForm(payload) {
    const { dispatch, modalProps = {} } = this.props;
    dispatch({
      type: 'userInfo/openForm',
      payload: { ...payload, modalProps },
    });
  }

  /**
   * 请求接口并刷新页面，以获取最新的手机号/邮箱
   */
  @Bind()
  handleRefresh() {
    changeTenant().then((resp) => {
      const res = getResponse(resp);
      if (isEmpty(res)) {
        showRefreshNotification();
      }
    });
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleCloseForm(flag) {
    const { dispatch, modalProps = {} } = this.props;
    dispatch({
      type: 'userInfo/closeForm',
      payload: { modalProps },
    });
    if (flag === 'ok') {
      this.handleRefresh();
    }
  }

  // validations

  /**
   * validatePasswordAnther - 验证 新密码 和 确认密码 相同
   * @param {String} value - 新的密码
   * @param {Function} callback - 校验失败 需要回调错误， 否则空的回调
   * @param {Object} form - 表单
   * @memberof UserInfo
   */
  @Bind()
  validatePasswordAnther(value, callback, form) {
    if (value && value !== form.getFieldValue('password')) {
      callback(intl.get('hiam.userInfo.view.validation.passwordSame').d('确认密码必须与密码相同'));
    } else {
      callback();
    }
  }

  /**
   * 检查 确认密码是否与密码一致
   */
  @Bind()
  validatePasswordRepeatForPassword(e, form) {
    const anotherPassword = form.getFieldValue('anotherPassword');
    const anotherPasswordField = {
      value: anotherPassword,
    };
    if (e.target.value) {
      if (e.target.value === anotherPassword) {
        anotherPasswordField.errors = null;
      } else {
        anotherPasswordField.errors = [
          new Error(
            intl.get('hiam.userInfo.view.validation.passwordSame').d('确认密码必须与密码相同')
          ),
        ];
      }
    } else {
      anotherPasswordField.errors = null;
    }
    form.setFields({
      anotherPassword: anotherPasswordField,
    });
  }

  /**
   * validateNewPasswordNotSame - 验证新密码 不能和 旧密码 相同
   * @param {String} value - 新的密码
   * @param {Function} callback - 校验失败 需要回调错误， 否则空的回调
   * @param {Object} form - 表单
   * @memberof UserInfo
   */
  @Bind()
  validateNewPasswordNotSame(value, callback, form) {
    if (value && value === form.getFieldValue('originalPassword')) {
      callback(
        intl.get('hiam.userInfo.view.validation.passwordNoSame').d('新密码不能与原密码相同')
      );
    } else {
      callback();
    }
  }

  @Bind()
  getCheckCode(props) {
    const { dispatch, userInfo: { id } = {} } = this.props;
    return dispatch({
      type: 'userInfo/getCheckCode',
      payload: { userAuthInfo: { ...props, userId: id } },
    });
  }

  @Bind()
  onCheckPhone(formValue) {
    const { userInfo: { id } = {}, dispatch } = this.props;
    return dispatch({
      type: 'userInfo/checkPhoneCode',
      payload: {
        ...formValue,
        userId: id,
      },
    });
  }

  @Bind()
  onDateleAuth(formValue) {
    const { userInfo: { id } = {}, dispatch } = this.props;
    return dispatch({
      type: 'userInfo/dateleAuth',
      payload: {
        ...formValue,
        userId: id,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        // this.setState({ authenticationInfoVisible: false });
        this.handleAuthentication();
      }
    });
  }

  @Bind()
  getCurrentInfo(formValue) {
    const { userInfo: { id } = {}, dispatch } = this.props;
    return dispatch({
      type: 'userInfo/getCurrentInfo',
      payload: {
        ...formValue,
        userId: id,
      },
    });
  }

  @Bind()
  getFddAuth(otherProps) {
    const { userInfo: { id } = {}, dispatch } = this.props;
    return dispatch({
      type: 'userInfo/getFddAuth',
      payload: {
        // ...formValue,
        userId: id,
        ...otherProps,
      },
    });
  }

  // 获取法大大修改手机号url
  @Bind()
  getFddPhone(otherProps) {
    const { userInfo: { id } = {}, dispatch } = this.props;
    return dispatch({
      type: 'userInfo/getFddPhone',
      payload: {
        userId: id,
        ...otherProps,
      },
    });
  }

  // 获取契约锁实名认证url
  @Bind()
  getQYSAuth(otherProps) {
    const { userInfo: { id } = {}, dispatch } = this.props;
    return dispatch({
      type: 'userInfo/getQYSAuth',
      payload: {
        userId: id,
        ...otherProps,
      },
    });
  }
}
