import React, { useState, useEffect, useRef } from 'react';

import { Form, Password, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { validatePasswordRule } from '@/utils/validator';
import { encode } from '@/utils/utils';
import { handleReset, handleResetPassword } from '@/services/forgetPasswordService';

import styles from '../index.less';

const Reset = props => {
  const { formDs, oauthIntl, isForget = true, supportType } = props;

  const [disable, setDisable] = useState(true);
  const [tooltipDom, setTooltipDom] = useState('');
  const [passwordCheckFlag, setPasswordCheckFlag] = useState(false);
  const [hasOriginal] = useState(!!formDs.getField('originalPassword'));

  const passwordInfo = formDs.getState('passwordInfo');
  const { realName, loginName, enablePassword } = passwordInfo;

  const msgCaptcha = formDs.getState('msgCaptcha');
  const captchaKey =
    formDs.getState('captchaKey') || window.localStorage.getItem('oauth-sec-checkCaptchaKey');
  // 账号
  const account = formDs.current.get('account');
  const originalPasswordRef = useRef({});
  const newPasswordRef = useRef({});
  const newPasswordVerifyRef = useRef({});

  // 监听表单值更新
  useEffect(() => {
    formDs.addEventListener('update', handleDsUpdate);
    return () => {
      formDs.removeEventListener('update', handleDsUpdate);
    };
  }, []);

  // 密码显示按钮按下就显示密码
  const onMouseDown = (e, ref) => {
    const target = e.currentTarget;
    if (target) {
      target.setAttribute('class', 'icon icon-visibility');
      const input = ref && ref.current && ref.current.element;
      if (input) {
        input.setAttribute('type', 'text');
      }
    }
  };

  // 密码显示按钮松开就隐藏密码
  const onMouseUp = (e, ref) => {
    const target = e.currentTarget;
    if (target) {
      target.setAttribute('class', 'icon icon-visibility_off');
      const input = ref && ref.current && ref.current.element;
      if (input) {
        input.setAttribute('type', 'password');
      }
    }
  };

  const handleDsUpdate = async ({ dataSet, record, name }) => {
    const newPassword = record.get('newPassword');
    const newPasswordVerify = record.get('newPasswordVerify');
    if (name === 'newPassword') {
      const validate = await dataSet.getField(name).checkValidity(record);
      setPasswordCheckFlag(validate);
    }
    if (newPassword && newPasswordVerify) {
      validatePassword(record);
    } else {
      setDisable(true);
    }
  };

  // 校验输入密码
  const validatePassword = async record => {
    const validate = await formDs.validate();
    if (!validate) {
      setDisable(true);
    } else if (hasOriginal) {
      setDisable(!record.get('originalPassword'));
    } else {
      setDisable(false);
    }
  };

  // 确认密码输入校验显示
  const handleVerifyValidationRenderer = () => {
    return (
      <span>
        {oauthIntl['srm.oauth.register.confirmPasswordAndInconformity'] || '确认密码与密码不一致!'}
      </span>
    );
  };

  // 确认修改密码
  const handleBtnReset = async () => {
    try {
      const newPasswordEncrypt = encode(formDs.current.get('newPassword'));
      const originalPassword = encode(formDs.current.get('originalPassword'));
      const params = isForget
        ? {
            account,
            captcha: msgCaptcha,
            captchaKey,
            password: newPasswordEncrypt,
          }
        : {
            originalPassword: originalPassword || null,
            password: newPasswordEncrypt,
            supportType,
            captchaKey,
            captcha: msgCaptcha,
          };
      const queryReset = isForget ? handleReset : handleResetPassword;
      const result = getResponse(await queryReset(params));
      if (result && !result.success) {
        notification.warning({ message: result.message });
      }
      // 修改成功，返回登录页
      if (result && result.success) {
        // 防止出现验证码倒计时还没结束就已经返回登录页的情况
        if (window.sessionStorage.getItem('sendCaptchaTime')) {
          window.sessionStorage.removeItem('sendCaptchaTime');
        }
        notification.success({
          message: oauthIntl['srm.oauth.finish.passwordModifySuccessful'] || '您的密码修改成功！',
        });
        setTimeout(() => {
          window.location.href = '/oauth';
        }, 1000);
      }
    } catch (err) {
      notification.error();
    }
  };

  const noValidateRender = () => {
    return (
      <span style={{ color: '#f56349' }}>
        <Icon type="error" style={{ margin: '-0.02rem 0.04rem 0 0.06rem', fontSize: '0.14rem' }} />
        {oauthIntl['srm.oauth.login.enterPassword'] || '请输入密码'}
      </span>
    );
  };

  // 校验密码强度
  const handlePasswordValidate = value => {
    let tooltipDomValue = '';
    if (enablePassword) {
      // 开启密码安全策略
      tooltipDomValue = validatePasswordRule(value, passwordInfo, oauthIntl);
    } else {
      tooltipDomValue = value ? '' : noValidateRender();
    }
    setTooltipDom(tooltipDomValue);
  };

  return (
    <div className={styles['reset-content']}>
      <div className={styles['form-content']}>
        <div className={styles['title-text']}>
          {oauthIntl['srm.oauth.passwordFind.resetPassword'] || '重置密码'}
        </div>
        <div className={styles['title-tip']}>
          {(oauthIntl['srm.oauth.passwordFind.hello.user'] || `您好，{realName}({loginName})`)
            .replace('{realName}', realName)
            .replace('({loginName})', '')}
          <span className={styles['title-tip-account']}>({loginName})</span>
        </div>
        <Form
          dataSet={formDs}
          labelLayout="float"
          autoValidationLocate={false}
          className={styles['reset-password-form']}
        >
          {hasOriginal ? (
            <Password
              name="originalPassword"
              label={oauthIntl['srm.oauth.resetPassword.originalPassword'] || '原密码'}
              valueChangeAction="input"
              autoComplete="new-password"
              reveal={false}
              ref={originalPasswordRef}
              suffix={
                <Icon
                  type="visibility_off"
                  onMouseDown={e => onMouseDown(e, originalPasswordRef)}
                  onMouseUp={e => onMouseUp(e, originalPasswordRef)}
                />
              }
            />
          ) : null}
          <div className={styles['password-line']} id="newPassword">
            <Password
              name="newPassword"
              label={oauthIntl['srm.oauth.resetPassword.newPassword'] || '新密码'}
              valueChangeAction="input"
              onChange={handlePasswordValidate}
              style={{ width: 'calc(100% - 0.24rem)' }}
              className={tooltipDom ? styles['password-validate'] : ''}
              autoComplete="new-password"
              reveal={false}
              ref={newPasswordRef}
              suffix={
                <Icon
                  type="visibility_off"
                  onMouseDown={e => onMouseDown(e, newPasswordRef)}
                  onMouseUp={e => onMouseUp(e, newPasswordRef)}
                />
              }
            />
            {tooltipDom === '' && passwordCheckFlag && (
              <Icon type="check_circle" style={{ color: '#47B881', marginLeft: '0.06rem' }} />
            )}
            {tooltipDom}
          </div>
          <div className={styles['password-line']} id="newPasswordVerify">
            <Password
              name="newPasswordVerify"
              label={oauthIntl['srm.oauth.resetPassword.newPassword.verify'] || '确认新密码'}
              valueChangeAction="input"
              style={{ width: 'calc(100% - 0.24rem)' }}
              validationRenderer={handleVerifyValidationRenderer}
              autoComplete="new-password"
              reveal={false}
              ref={newPasswordVerifyRef}
              suffix={
                <Icon
                  type="visibility_off"
                  onMouseDown={e => onMouseDown(e, newPasswordVerifyRef)}
                  onMouseUp={e => onMouseUp(e, newPasswordVerifyRef)}
                />
              }
            />
            {!disable && tooltipDom === '' && (
              <Icon type="check_circle" style={{ color: '#47B881', marginLeft: '0.06rem' }} />
            )}
          </div>
          <Button color="primary" disabled={disable || tooltipDom !== ''} onClick={handleBtnReset}>
            {oauthIntl['hzero.common.button.confirm'] || '确认'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Reset;
