import React, { useMemo, useState } from 'react';
import {
  Form,
  Button,
  Password,
  DataSet,
  SelectBox,
  Select,
  TextField,
  Modal,
  Tooltip,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';

import CountDown from 'components/CountDown';
import notification from 'utils/notification';
import { PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import { getResponse, encryptPwd } from 'utils/utils';

import {
  userInfoUpdatePasswordPre,
  userInfoVerifyPhoneCaptcha,
  userInfoPostOldEmailCaptchaNew,
} from '@/services/userInfoService';

import { validatePasswordRuleNew } from '@/utils/validator';
import styles from '../index.less';

const { Option } = Select;
const { ItemGroup } = Form;

function ChangePassword({
  onPasswordUpdate,
  publicKey,
  modal,
  userInfo,
  passwordTipMsg,
  dispatch,
  clearModal,
  onBack,
}) {
  const {
    phone,
    email,
    internationalTelCode,
    loginName,
    phoneCheckFlag,
    emailCheckFlag,
  } = userInfo;
  const hasPhoneOrEmail = (phoneCheckFlag && phone) || (emailCheckFlag && email);
  const telCode = internationalTelCode || '+86';
  const [state, setState] = useState({
    step: 1,
    saveLoading: false,
    phoneCaptchaKey: undefined,
    phoneCaptchLimitFlag: false,
    phoneCaptchaLimitTimeEnd: undefined,
    emailCaptchaKey: undefined,
    emailCaptchLimitFlag: false,
    emailCaptchaLimitTimeEnd: undefined,
  });

  const updateSate = (payload) => {
    setState((preState) => ({
      ...preState,
      ...payload,
    }));
  };

  const isValidPhone = telCode === '+86' && PHONE && PHONE.test(phone);
  const passwordFormDs = useMemo(() => {
    return new DataSet({
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
          validator: (value, name, record) => {
            if (value && value !== record.get('password')) {
              return intl
                .get('hiam.subAccount.view.validation.passwordSame')
                .d('确认密码必须与密码一致');
            }
          },
        },
      ],
    });
  }, [loginName, passwordTipMsg]);

  const captchaFormDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'verifyType',
          label: intl.get('hiam.userInfo.model.user.verifyType').d('验证方式'),
        },
        {
          name: 'phone',
          label: intl.get('hiam.userInfo.model.user.phoneNum').d('手机号码'),
          disabled: true,
          dynamicProps: {
            required: ({ record }) => record && record.get('verifyType') === 'phone',
          },
        },
        {
          name: 'email',
          label: intl.get('hiam.userInfo.model.user.email').d('邮箱'),
          disabled: true,
          dynamicProps: {
            required: ({ record }) => record && record.get('verifyType') === 'email',
          },
        },
        {
          name: 'phoneCaptcha',
          label: intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码'),
          dynamicProps: {
            required: ({ record }) => record && record.get('verifyType') === 'phone',
          },
        },
        {
          name: 'emailCaptcha',
          label: intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码'),
          dynamicProps: {
            required: ({ record }) => record && record.get('verifyType') === 'email',
          },
        },
      ],
    });
  }, []);

  const handleNextStep = async () => {
    if (passwordFormDs.current) {
      const result = await passwordFormDs.current.validate();
      if (!result) {
        return;
      }
      const { originalPassword, password } = passwordFormDs.current.get([
        'originalPassword',
        'password',
      ]);
      const res = await userInfoUpdatePasswordPre({
        password: encryptPwd(password, publicKey),
        originalPassword: encryptPwd(originalPassword, publicKey),
        businessScope: passwordTipMsg.forceCodeVerify ? 'UPDATE_PASSWORD' : undefined,
      });
      if (getResponse(res)) {
        const phoneTmp = !phone
          ? undefined
          : phone
              .split('')
              .map((i, index) => (index < 3 || index > 6 ? i : '*'))
              .join('');
        const emailTmp = !email
          ? undefined
          : email
              .split('')
              .map((i, index) => (index < 2 || index >= email.indexOf('@') ? i : '*'))
              .join('');
        captchaFormDs.create({
          phone: phoneTmp,
          email: emailTmp,
          verifyType: phone ? 'phone' : 'email',
        });
        updateSate({ step: state.step + 1 });
      }
    }
  };

  const handleSubmit = async () => {
    if (!passwordFormDs.current || !captchaFormDs.current) {
      return;
    }
    const passwordFormValidate = await passwordFormDs.current.validate();
    const captchaFormValidate = await captchaFormDs.current.validate();
    if (!passwordFormValidate || !captchaFormValidate) {
      return;
    }
    const { originalPassword, password } = passwordFormDs.current.get([
      'originalPassword',
      'password',
    ]);
    const { verifyType, phoneCaptcha, emailCaptcha } = captchaFormDs.current.get([
      'verifyType',
      'phoneCaptcha',
      'emailCaptcha',
    ]);
    if (passwordTipMsg.loginAgain) {
      Modal.confirm({
        title: `${intl
          .get('hiam.userInfo.view.confirmLoginAgain')
          .d('修改密码后需要重新登录，是否确认？')}`,
        onOk: async () => {
          let params = {
            password: encryptPwd(password, publicKey),
            originalPassword: encryptPwd(originalPassword, publicKey),
            businessScope: passwordTipMsg.forceCodeVerify ? 'UPDATE_PASSWORD' : undefined,
          };
          if (verifyType === 'phone') {
            params = {
              ...params,
              type: 'phone',
              phone: passwordTipMsg.forceCodeVerify ? phone : undefined,
              captcha: passwordTipMsg.forceCodeVerify ? phoneCaptcha : undefined,
              captchaKey: passwordTipMsg.forceCodeVerify ? state.phoneCaptchaKey : undefined,
            };
          } else {
            params = {
              ...params,
              type: 'email',
              // 邮箱验证时也传phone字段
              phone: passwordTipMsg.forceCodeVerify ? email : undefined,
              captcha: passwordTipMsg.forceCodeVerify ? emailCaptcha : undefined,
              captchaKey: passwordTipMsg.forceCodeVerify ? state.emailCaptchaKey : undefined,
            };
          }
          updateSate({ saveLoading: true });
          const res = await onPasswordUpdate(params);
          updateSate({ saveLoading: false });
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
        },
      });
    } else {
      let params = {
        password: encryptPwd(password, publicKey),
        originalPassword: encryptPwd(originalPassword, publicKey),
        businessScope: passwordTipMsg.forceCodeVerify ? 'UPDATE_PASSWORD' : undefined,
      };
      if (verifyType === 'phone') {
        params = {
          ...params,
          type: 'phone',
          phone: passwordTipMsg.forceCodeVerify ? phone : undefined,
          captcha: passwordTipMsg.forceCodeVerify ? phoneCaptcha : undefined,
          captchaKey: passwordTipMsg.forceCodeVerify ? state.phoneCaptchaKey : undefined,
        };
      } else {
        params = {
          ...params,
          type: 'email',
          // 邮箱验证时也传phone字段
          phone: passwordTipMsg.forceCodeVerify ? email : undefined,
          captcha: passwordTipMsg.forceCodeVerify ? emailCaptcha : undefined,
          captchaKey: passwordTipMsg.forceCodeVerify ? state.emailCaptchaKey : undefined,
        };
      }
      updateSate({ saveLoading: true });
      const res = await onPasswordUpdate(params);
      updateSate({ saveLoading: false });
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
        handleClose();
      }
    }
  };

  const handleClose = () => {
    if (modal && modal.close) {
      modal.close();
      clearModal();
    }
  };

  const sendPhoneCaptcha = () => {
    if (!isValidPhone) {
      return;
    }
    if (captchaFormDs.current) {
      if (phone) {
        userInfoVerifyPhoneCaptcha({
          phone,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success({ message: res.message });
            const validCodeLimitTimeStart = new Date().getTime();
            // 60秒限制
            const phoneCaptchaLimitTimeEnd = validCodeLimitTimeStart + 60000;
            updateSate({
              phoneCaptchLimitFlag: true,
              phoneCaptchaLimitTimeEnd,
              phoneCaptchaKey: res && res.captchaKey,
            });
          }
        });
      }
    }
  };

  const sendEmailCaptcha = () => {
    if (captchaFormDs.current) {
      if (email) {
        userInfoPostOldEmailCaptchaNew({
          email,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success({ message: res.message });
            const validCodeLimitTimeStart = new Date().getTime();
            // 60秒限制
            const emailCaptchaLimitTimeEnd = validCodeLimitTimeStart + 60000;
            updateSate({
              emailCaptchLimitFlag: true,
              emailCaptchaLimitTimeEnd,
              emailCaptchaKey: res && res.captchaKey,
            });
          }
        });
      }
    }
  };

  const handlePhoneCaptchaLimitEnd = () => {
    updateSate({
      phoneCaptchLimitFlag: false,
      phoneCaptchaLimitTimeEnd: undefined,
    });
  };

  const handleEmailCaptchaLimitEnd = () => {
    updateSate({
      emailCaptchLimitFlag: false,
      emailCaptchaLimitTimeEnd: undefined,
    });
  };

  return (
    <div className={styles['password-modal-content']}>
      <div className={styles['password-modal-main']}>
        {state.step === 1 && (
          <Form labelLayout="float" dataSet={passwordFormDs} columns={1}>
            <Password name="originalPassword" autoComplete="new-password" />
            <Password name="password" />
            <Password name="anotherPassword" />
            {hasPhoneOrEmail && (
              <div style={{ textAlign: 'right' }}>
                <Button funcType="link" onClick={onBack}>
                  {intl
                    .get('hiam.userInfo.view.message.title.form.passwordVerify')
                    .d('验证码方式更改密码')}
                </Button>
              </div>
            )}
          </Form>
        )}
        {state.step === 2 && (
          <div>
            <div className={styles['password-modal-alert']}>
              <Icon type="help" />
              <div>
                {intl
                  .get('hiam.userInfo.view.message.modifyPasswordHelp')
                  .d(
                    '若您的手机和邮箱均无法提供，请联系租户管理员或拨打客服电话 400-116-0808 获取帮助。'
                  )}
              </div>
            </div>
            <Form columns={1} labelLayout="float" dataSet={captchaFormDs}>
              {phone && email && (
                <SelectBox name="verifyType">
                  {phone && (
                    <Option value="phone">
                      {intl.get('hiam.userInfo.view.label.phone').d('手机')}
                    </Option>
                  )}
                  {email && (
                    <Option value="email">
                      {intl.get('hiam.userInfo.view.label.email').d('邮箱')}
                    </Option>
                  )}
                </SelectBox>
              )}
              {phone &&
                captchaFormDs.current &&
                captchaFormDs.current.get('verifyType') === 'phone' && (
                  <>
                    <TextField
                      name="phone"
                      addonBefore={intl.get('hiam.userInfo.common.chinesePhone').d('中国大陆 +86')}
                    />
                    <ItemGroup className={styles['password-modal-form-item-group']}>
                      <TextField
                        name="phoneCaptcha"
                        placeholder={intl
                          .get('hiam.userInfo.view.option.input6Captcha')
                          .d('请输入6位验证码')}
                      />
                      <Tooltip
                        title={
                          !isValidPhone
                            ? intl
                                .get('hiam.userInfo.view.message.invalidPhoneTooltip')
                                .d('无法获取验证码，暂不支持非中国手机号接收验证码')
                            : undefined
                        }
                      >
                        <Button
                          color="primary"
                          style={{ marginLeft: '16px' }}
                          disabled={state.phoneCaptchLimitFlag || !isValidPhone}
                          onClick={sendPhoneCaptcha}
                        >
                          {state.phoneCaptchLimitFlag ? (
                            <CountDown
                              target={state.phoneCaptchaLimitTimeEnd}
                              onEnd={handlePhoneCaptchaLimitEnd}
                            />
                          ) : (
                            intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                          )}
                        </Button>
                      </Tooltip>
                    </ItemGroup>
                  </>
                )}
              {email &&
                captchaFormDs.current &&
                captchaFormDs.current.get('verifyType') === 'email' && (
                  <>
                    <TextField name="email" />
                    <ItemGroup className={styles['password-modal-form-item-group']}>
                      <TextField
                        name="emailCaptcha"
                        placeholder={intl
                          .get('hiam.userInfo.view.option.input6Captcha')
                          .d('请输入6位验证码')}
                      />
                      <Button
                        color="primary"
                        style={{ marginLeft: '16px' }}
                        disabled={state.emailCaptchLimitFlag}
                        onClick={sendEmailCaptcha}
                      >
                        {state.emailCaptchLimitFlag ? (
                          <CountDown
                            target={state.emailCaptchaLimitTimeEnd}
                            onEnd={handleEmailCaptchaLimitEnd}
                          />
                        ) : (
                          intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
                        )}
                      </Button>
                    </ItemGroup>
                  </>
                )}
            </Form>
          </div>
        )}
      </div>
      <div className={styles['password-modal-footer']}>
        {state.step === 1 && (
          <Button color="primary" onClick={handleNextStep}>
            {intl.get('hzero.common.button.next').d('下一步')}
          </Button>
        )}
        {state.step === 2 && (
          <Button color="primary" onClick={handleSubmit} loading={state.saveLoading}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        )}
        <Button onClick={handleClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </div>
  );
}

export default observer(ChangePassword);
