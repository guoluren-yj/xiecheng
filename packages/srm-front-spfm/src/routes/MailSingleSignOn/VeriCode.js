import React, { useState, useMemo } from 'react';
import { Form, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isObject } from 'lodash';
import notification from 'utils/notification';
import { veriCodeService } from '@/services/mailSingleSignOnServices';
import styles from './index.less';

const VeriCode = (props) => {
  const { formDs, onStep, countdown, oauthIntl, oneStepMail, redirectUri } = props;
  const { count } = countdown;
  const [disable, setDisable] = useState(true);
  const [result, setResult] = useState(true);

  // 账号
  const account = formDs.current.get('account');
  // captchaKey
  const captchaKey = formDs.getState('captchaKey');
  const captchaArr = ['captcha1', 'captcha2', 'captcha3', 'captcha4', 'captcha5', 'captcha6'];

  const textArr = useMemo(() => {
    return captchaArr.map((item, index) => (
      <TextField
        name={item}
        valueChangeAction="input"
        maxLength={6 - index} // 不是1 为了用于粘贴多个数字
        onChange={(value) => changeValue(value, item)}
        restrict={/[^0-9]/g}
        autoFocus={index === 0}
      />
    ));
  }, []);

  const changeValue = (value, item) => {
    const record = formDs.current;
    if (captchaArr.indexOf(item) !== -1) {
      if (value && value.length > 1) {
        // 用于粘贴多个数字
        let currentFocusIndex = parseInt(item.slice(-1), 10);
        for (let i = 0; i < value.length; i++) {
          if (/[0-9]/g.test(value[i])) {
            const currentName = `captcha${currentFocusIndex}`;
            record.set(currentName, value[i]);
            // 防止多触发提交事件
            if (currentName === item) {
              record.setState('hasSetValue', true);
            }
            currentFocusIndex++;
            if (currentFocusIndex > 7) {
              break;
            }
          }
        }
        if (currentFocusIndex > 6) {
          document.querySelector(`input[name=captcha6]`).focus();
        } else {
          document.querySelector(`input[name=captcha${currentFocusIndex}]`).focus();
        }
      } else {
        // 输入值后自动聚焦到下一位
        const focusValue = parseInt(item.slice(-1), 10);
        if (focusValue < 6 && /[0-9]/g.test(value)) {
          document.querySelector(`input[name=captcha${focusValue + 1}]`).focus();
        }
      }

      // 用于处理set时本身时会多一次触发submit
      if (record.getState('hasSetValue')) {
        record.setState('hasSetValue', false);
        return;
      }
      // 是否可点击确定
      const { captcha1, captcha2, captcha3, captcha4, captcha5, captcha6 } = formDs.current.get(
        captchaArr
      );
      if (captcha1 && captcha2 && captcha3 && captcha4 && captcha5 && captcha6) {
        setDisable(false);
        handleButtonConfirm();
      } else {
        setDisable(true);
      }
    }
  };

  // 确认按钮
  const handleButtonConfirm = () => {
    const { captcha1, captcha2, captcha3, captcha4, captcha5, captcha6 } = formDs.current.get(
      captchaArr
    );
    const captchaValue = [captcha1, captcha2, captcha3, captcha4, captcha5, captcha6].reduce(
      (pre, item, index) => {
        if (item.length > 1) {
          // 防止每个字符长度超过1
          formDs.current.set(`captcha${index + 1}`, item[0]);
          return `${pre}${item[0]}`;
        } else {
          return `${pre}${item}`;
        }
      }
    );
    // 验证邮箱验证码
    veriCodeService({
      account,
      captcha: captchaValue,
      captchaKey,
      businessScope: 'checkEmail',
    }).then((resValue) => {
      if (resValue && isObject(resValue)) {
        if (resValue.success) {
          if (window.sessionStorage.getItem('sendCaptchaTime')) {
            window.sessionStorage.removeItem('sendCaptchaTime');
          }
          setResult(true);
          notification.success({
            message: oauthIntl['srm.oauth.mailSingleSignOn.welcomeLogIn'] || '欢迎登录',
          });
          setTimeout(() => {
            window.location.href = `/oauth/login/one-step?one_step_mail=${oneStepMail}&redirectUri=${redirectUri}&account=${account}&captcha=${captchaValue}&captchaKey=${captchaKey}&businessScope=checkEmail`;
          }, 1000);
        }
        if (resValue.failed || !resValue.success) {
          setResult(false);
          notification.error({ message: resValue.message });
        }
      } else {
        setResult(false);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (disable) {
      return;
    }
    if (e.keyCode === 13) return handleButtonConfirm();
  };

  // 多语言处理
  const renderMessage = (value) => {
    const message =
      oauthIntl['srm.oauth.mailSingleSignOn.send.message'] ||
      '已向{account}发送验证码，请查收并输入校验码';
    const messageArr = message.split('{account}');
    return (
      <span>
        {messageArr[0] || ''}
        <span className={styles['title-tip-account']}>&nbsp;{value}&nbsp;</span>
        {messageArr[1] || ''}
      </span>
    );
  };

  return (
    <div className={styles['veriCode-content']}>
      <div className={styles['back-icon']} onClick={() => onStep('sendCode')}>
        <Icon type="arrow_back" />
      </div>
      <div className={styles['form-content']}>
        <div className={styles['title-text']}>
          {oauthIntl['srm.oauth.mailSingleSignOn.verificationMailCode'] || '输入邮箱验证码'}
        </div>
        <div className={styles['title-tip']}>{renderMessage(account)}</div>
        <Form dataSet={formDs} labelLayout="none" onKeyDown={handleKeyDown}>
          <div className={`${styles['captcha-layout']} ${!result ? styles['captcha-error'] : ''}`}>
            {textArr}
          </div>
          <div className={styles['captcha-info']}>
            <span>
              {count !== 0 &&
                (
                  oauthIntl['srm.oauth.resetPassword.get.captcha'] || `{count}s后可重新获取验证码`
                ).replace('{count}', count)}
              {count === 0 && (
                <a onClick={() => onStep('sendCode')}>
                  {oauthIntl['srm.oauth.view.mailSingleSignOn.again.SendCode.tip'] ||
                    '重新获取邮箱验证码'}
                </a>
              )}
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default observer(VeriCode);
