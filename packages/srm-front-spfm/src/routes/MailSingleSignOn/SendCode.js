import React, { useState, useEffect } from 'react';
import { Form, TextField, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isObject } from 'lodash';
import notification from 'utils/notification';
import { API_HOST } from 'hzero-front/lib/utils/config';
import { sendCodeService } from '@/services/mailSingleSignOnServices';
import styles from './index.less';

const SendCode = (props) => {
  const { language, formDs, onStep, countdown, oauthIntl, emailCode, oneStepMail } = props;
  const { count } = countdown;
  const [timestamp, setTimestamp] = useState(Date.now());
  const origin = window.location.origin.includes('localhost') ? API_HOST : window.location.origin;
  const [disable, setDisable] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);

  // 监听表单值更新
  useEffect(() => {
    const countStorage = window.sessionStorage.getItem('sendCaptchaTime');
    if (countStorage) {
      // 验证码倒计时未结束
      countdown.start(countStorage);
    }
    formDs.addEventListener('update', handleDsUpdate);
    formDs.current.set('captcha', '');
    formDs.current.set('captcha1', '');
    formDs.current.set('captcha2', '');
    formDs.current.set('captcha3', '');
    formDs.current.set('captcha4', '');
    formDs.current.set('captcha5', '');
    formDs.current.set('captcha6', '');
    formDs.current.set('account', emailCode);
    return () => {
      formDs.removeEventListener('update', handleDsUpdate);
    };
  }, []);

  const handleDsUpdate = ({ record }) => {
    const account = record.get('account');
    const captcha = record.get('captcha');
    if (account && captcha) {
      validateAccount();
    } else {
      setDisable(true);
    }
  };

  // 校验输入账户是否是邮箱
  const validateAccount = async () => {
    const validate = await formDs.validate();
    if (!validate) {
      setDisable(true);
      notification.warning({
        message:
          oauthIntl['srm.oauth.view.get.email.error.message'] || '链接中邮箱错误，请重新获取链接',
      });
    } else {
      setDisable(false);
    }
  };

  const goNextStep = () => {
    if (count === 0) {
      // const account = formDs.current.get('account');
      const captcha = formDs.current.get('captcha');
      setNextLoading(true);
      // 发送邮箱验证码
      sendCodeService({ oneStepMail, captcha })
        .then((result) => {
          if (result && isObject(result)) {
            if (result.success) {
              notification.success({ message: result.message });
              countdown.start();
              formDs.setState('captchaKey', result.captchaKey);
              setTimeout(() => {
                onStep('veriCode');
              }, 1000 / 3);
            }
            if (result.failed || !result.success) {
              notification.error({ message: result.message });
              setTimestamp(Date.now());
            }
          } else {
            setTimestamp(Date.now());
          }
        })
        .finally(() => {
          setNextLoading(false);
        });
    } else {
      // 已发过验证码
      onStep('veriCode');
    }
  };

  const handleKeyDown = (e) => {
    if (disable || count !== 0) {
      return;
    }
    if (e.keyCode === 13) return goNextStep();
  };

  return (
    <div className={styles['sendCode-content']}>
      <div className={styles['form-content']}>
        <div className={styles['title-text']}>
          {oauthIntl['srm.oauth.view.email.verification.title'] || '邮箱验证'}
        </div>
        <div className={styles['title-tip']}>
          {oauthIntl['srm.oauth.view.email.verification.title.tip'] ||
            '为确保您本人操作，请先通过以下方式获取验证码完成验证'}
        </div>
        <Form dataSet={formDs} labelLayout="float" onKeyDown={handleKeyDown}>
          <input value={emailCode} className={styles['certification-info']} disabled />
          <div className={styles['captcha-text']}>
            <TextField
              label={oauthIntl['srm.oauth.passwordFind.enterVerificationCode'] || '请输入验证码'}
              name="captcha"
              valueChangeAction="input"
            />
            <img
              alt={oauthIntl['srm.oauth.login.verificationCode'] || '验证码'}
              src={`${origin}/oauth/password/captcha.jpg?t=${timestamp}`}
              onClick={() => {
                setTimestamp(Date.now());
              }}
              style={{ height: 40 }}
            />
          </div>
          <Button
            color="primary"
            onClick={goNextStep}
            disabled={disable || count !== 0}
            loading={nextLoading}
          >
            {count === 0 &&
              (oauthIntl['srm.oauth.view.mailSingleSignOn.getVerificationCode'] || '获取验证码')}
            {count !== 0 &&
              (
                oauthIntl['srm.oauth.mailSingleSignOn.resend.get.captcha'] ||
                `{count}s后可重新获取验证码`
              ).replace('{count}', count)}
          </Button>
        </Form>
        <p className={styles['mail-signOn-info']}>
          {oauthIntl['srm.oauth.view.mailSingleSignOn.noCode.tip'] ||
            '验证码的有效期为5分钟。如果您无法收到验证码，请联系采购方。'}
          <br />
          {language !== 'zh_CN' &&
            (oauthIntl['srm.oauth.view.mailSingleSignOn.from.China.tip'] ||
              'The system you are about to enter is from China.')}
        </p>
      </div>
    </div>
  );
};

export default observer(SendCode);
