import React, { useMemo, useState, useEffect } from 'react';
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
import jsencrypt from 'jsencrypt';

import CountDown from 'components/CountDown';
import notification from 'utils/notification';
import { PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  updatePswCheckCaptcha,
  updatePswSendCaptcha,
  updatePswWithCaptcha,
} from '@/services/userInfoService';

import { validatePasswordRuleNew } from '@/utils/validator';
import CaptchaModal from './CaptchaModal';
import styles from '../../index.less';
import styles1 from './index.less';

const { Option } = Select;
const { ItemGroup } = Form;

const encode = (password) => {
  /* eslint-disable */
  // 初始化加密器
  const encrypt = new jsencrypt();
  // 设置公钥
  const publicKey =
    'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJL0JkqsUoK6kt3JyogsgqNp9VDGDp+t3ZAGMbVoMPdHNT2nfiIVh9ZMNHF7g2XiAa8O8AQWyh2PjMR0NiUSVQMCAwEAAQ==';
  encrypt.setPublicKey(publicKey);
  // 加密
  return encrypt.encrypt(password);
  /* eslint-disable */
};

function ChangePasswordNew({
  onPasswordUpdate,
  publicKey,
  modal,
  userInfo,
  passwordTipMsg,
  dispatch,
  onBack,
}) {
  const { phone, email, internationalTelCode, loginName } = userInfo;
  const tenantId = getCurrentOrganizationId();
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
          name: 'password',
          label: intl.get('hiam.userInfo.model.user.password').d('密码'),
          required: true,
          maxLength: 110,
          validator: (value) => {
            const result = validatePasswordRuleNew(value, { ...passwordTipMsg, loginName });
            if (result) {
              return result;
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

  useEffect(() => {
    init();
  }, []);

  const init = () => {
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
  };

  const handleNextStep = async () => {
    if (!captchaFormDs.current) {
      return;
    }
    const captchaFormValidate = await captchaFormDs.current.validate();
    if (!captchaFormValidate) {
      return;
    }
    const { verifyType, phoneCaptcha, emailCaptcha } = captchaFormDs.current.get([
      'verifyType',
      'phoneCaptcha',
      'emailCaptcha',
    ]);
    const params = {
      account: verifyType === 'phone' ? phone : email,
      captcha: verifyType === 'phone' ? phoneCaptcha : emailCaptcha,
      captchaKey: verifyType === 'phone' ? state.phoneCaptchaKey : state.emailCaptchaKey,
    };
    updateSate({ saveLoading: true });
    const res = await updatePswCheckCaptcha(params);
    if (res) {
      if (res.success) {
        updateSate({ step: state.step + 1 });
      } else {
        notification.warning({ message: res.message });
      }
    }
    updateSate({ saveLoading: false });
  };

  const updatePassword = async () => {
    const password = passwordFormDs.current.get('password');
    const { verifyType, phoneCaptcha, emailCaptcha } = captchaFormDs.current.get([
      'verifyType',
      'phoneCaptcha',
      'emailCaptcha',
    ]);
    const res = await updatePswWithCaptcha({
      account: verifyType === 'phone' ? phone : email,
      captcha: verifyType === 'phone' ? phoneCaptcha : emailCaptcha,
      captchaKey: verifyType === 'phone' ? state.phoneCaptchaKey : state.emailCaptchaKey,
      password: encode(password),
    });
    if (res && res.success) {
      notification.success();
      return true;
    }
    if (res && !res.success) {
      notification.warning({ message: res.message });
    }
    return false;
  };

  const handleSubmit = async () => {
    if (passwordFormDs.current) {
      const result = await passwordFormDs.current.validate();
      if (!result) {
        return;
      }
      passwordTipMsg.loginAgain = true;
      if (passwordTipMsg.loginAgain) {
        Modal.confirm({
          title: `${intl
            .get('hiam.userInfo.view.confirmLoginAgain')
            .d('修改密码后需要重新登录，是否确认？')}`,
          onOk: async () => {
            const res = await updatePassword();
            if (!res) {
              return false;
            }
            dispatch({
              type: 'login/logout',
            });
          },
        });
      } else {
        const flag = await updatePassword();
        if (flag) {
          handleClose();
        }
      }
    }
  };

  const handleClose = () => {
    if (modal && modal.close) {
      modal.close();
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

  const handleClickCaptchaButton = (type) => {
    const formDs = new DataSet({
      fields: [
        { name: 'verifyValue', type: 'string', required: true },
        { name: 'verifyKey', type: 'string' },
      ],
    });
    const formDsRecord = formDs.create({});
    const sendCaptcha = (captcha) => {
      return updatePswSendCaptcha({
        captcha,
        account: type === 'phone' ? phone : email,
      });
    };
    const afterVerify = (res) => {
      notification.success({ message: res.message });
      const validCodeLimitTimeStart = new Date().getTime();
      // 60秒限制
      const captchaLimitTimeEnd = validCodeLimitTimeStart + 60000;
      updateSate({
        [`${type}CaptchLimitFlag`]: true,
        [`${type}CaptchaLimitTimeEnd`]: captchaLimitTimeEnd,
        [`${type}CaptchaKey`]: res && res.data,
      });
    };
    Modal.open({
      key: 'captcha-modal',
      title: intl.get('hzero.common.components.login.captcha.placeholder').d('请输入验证码'),
      className: styles1['captcha-modal'],
      children: (
        <CaptchaModal record={formDsRecord} onClick={sendCaptcha} afterVerify={afterVerify} />
      ),
      footer: null,
    });
  };

  const renderCaptchaButton = (type) => {
    if (type === 'phone') {
      return (
        <Button
          disabled={state.phoneCaptchLimitFlag || !isValidPhone}
          color="primary"
          style={{ marginLeft: '16px' }}
          onClick={() => handleClickCaptchaButton('phone')}
        >
          {state.phoneCaptchLimitFlag ? (
            <CountDown target={state.phoneCaptchaLimitTimeEnd} onEnd={handlePhoneCaptchaLimitEnd} />
          ) : (
            intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
          )}
        </Button>
      );
    }
    return (
      <Button
        disabled={state.emailCaptchLimitFlag}
        color="primary"
        style={{ marginLeft: '16px' }}
        onClick={() => handleClickCaptchaButton('email')}
      >
        {state.emailCaptchLimitFlag ? (
          <CountDown target={state.emailCaptchaLimitTimeEnd} onEnd={handleEmailCaptchaLimitEnd} />
        ) : (
          intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
        )}
      </Button>
    );
  };

  return (
    <div className={styles['password-modal-content']}>
      <div className={styles['password-modal-main']}>
        {state.step === 1 && (
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
                        {renderCaptchaButton('phone')}
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
                      {renderCaptchaButton('email')}
                    </ItemGroup>
                  </>
                )}
              <div style={{ textAlign: 'right' }}>
                <Button funcType="link" onClick={onBack}>
                  {intl.get('hiam.userInfo.view.title.legacyPasswordVerify').d('原始密码方式验证')}
                </Button>
              </div>
            </Form>
          </div>
        )}
        {state.step === 2 && (
          <Form labelLayout="float" dataSet={passwordFormDs} columns={1}>
            <Password name="password" autoComplete="new-password" />
            <Password name="anotherPassword" autoComplete="new-password" />
          </Form>
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

export default observer(ChangePasswordNew);
