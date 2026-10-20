import React, { useState, useEffect } from 'react';

import { Form, TextField, Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { API_HOST } from 'hzero-front/lib/utils/config';

import { handleRetrieve } from '@/services/forgetPasswordService';

import styles from '../index.less';

const chars = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
const TARGET_LENGTH = 36; // 目标字符串长度为36
function generateHash(text) {
  // 补位或截取至 36 位
  let paddedText = text;
  while (paddedText.length < TARGET_LENGTH) {
    paddedText += '0'; // 使用 '0' 进行补位
  }
  if (paddedText.length > TARGET_LENGTH) {
    paddedText = paddedText.substring(0, TARGET_LENGTH); // 截取至 36 位
  }

  let hash = '';
  const halfLength = TARGET_LENGTH / 2; // 每组的数量为 18

  // 计算哈希值
  for (let i = 0; i < halfLength; i++) {
    const char1 = paddedText.charAt(i); // 第 i 位
    const char2 = paddedText.charAt(TARGET_LENGTH - 1 - i); // 第 (36 - i + 1) 位
    // 计算 ASCII 值之和，并加上位置
    const asciiSum = char1.charCodeAt(0) + char2.charCodeAt(0) + (i + 1);
    const index = asciiSum % chars.length; // 取模获取索引
    hash += chars[index]; // 生成哈希字符串
  }

  return hash;
}

const Retrieve = props => {
  const { formDs, onStep, countdown, oauthIntl } = props;
  const { count } = countdown;
  const [timestamp, setTimestamp] = useState(Date.now());
  const origin = window.location.origin.includes('localhost') ? API_HOST : window.location.origin;
  const [disable, setDisable] = useState(true);

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

  // 校验输入账户是否为手机或邮箱
  const validateAccount = async () => {
    const validate = await formDs.validate();
    if (!validate) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  };

  // 返回登录页
  const goBack = () => {
    window.location.href = '/oauth';
  };

  // 返回密码页点击下一步时，切换到确认账号同时发送验证码短信
  const goNextStep = () => {
    // 可以发送验证码的情况下，账号和图片验证码校验通过就跳到下一步
    if (count === 0) {
      const account = encodeURIComponent(formDs.current.get('account') || '');
      const captcha = formDs.current.get('captcha');
      // 发送短信验证码
      handleRetrieve({ account, captcha }).then(res => {
        const result = getResponse(res);
        // 本地拿不到cookie先跳过
        // countdown.start();
        // formDs.setState('captchaKey', 'cb19f65a190d4c6693e06dc0d92a4d94');
        // onStep('confirm');

        if (result) {
          const hash = generateHash(`${result.success}|${result.data || 'NULL'}`);
          if (!result.signature || hash === result.signature) {
            if (result.success) {
              notification.success({ message: result.message });
              countdown.start();
              formDs.setState('captchaKey', result.data);
              onStep('confirm');
            }
            if (result.failed || !result.success) {
              notification.warning({ message: result.message });
              setTimestamp(Date.now());
            }
          } else {
            notification.warning({ message: 'error.captcha' });
            setTimestamp(Date.now());
          }
        } else {
          setTimestamp(Date.now());
        }
      });
    } else {
      // 已发过验证码
      onStep('confirm');
    }
  };

  // 回车事件
  const handleKeyDown = e => {
    if (disable || count !== 0) {
      return;
    }
    // 按钮能点击的情况下，回车进入下一步
    if (e.keyCode === 13) return goNextStep();
  };

  // 登录
  const handleLogin = () => {
    window.location.href = '/oauth';
  };

  return (
    <div className={styles['retrieve-content']}>
      <div className={styles['back-icon']} onClick={goBack}>
        <Icon type="arrow_back" />
      </div>
      <div className={styles['form-content']}>
        <div className={styles['title-text']}>
          {oauthIntl['srm.oauth.retrieve.password'] || '找回密码'}
        </div>
        <Form dataSet={formDs} labelLayout="float" onKeyDown={handleKeyDown}>
          <TextField
            label={
              oauthIntl['srm.oauth.passwordFind.enterPhoneOrEmail'] ||
              '请输入要找回密码的手机号或邮箱'
            }
            name="account"
            valueChangeAction="input"
          />
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
          <Button color="primary" onClick={goNextStep} disabled={disable || count !== 0}>
            {count === 0 && (oauthIntl['srm.oauth.passwordFind.nextStep'] || '下一步')}
            {count !== 0 &&
              (
                oauthIntl['srm.oauth.resetPassword.get.captcha'] || `{count}s后可重新获取验证码`
              ).replace('{count}', count)}
          </Button>
        </Form>
        <p className={styles['forget-password-info']}>
          {oauthIntl['srm.oauth.forgetPassword.help.info'] ||
            '如果您的手机和邮箱均无法提供，请您联系人工客服400-116-0808获取帮助。'}
          {oauthIntl['srm.oauth.forgetPassword.hasAccount'] || '已有账户？'}
          <span className={styles['forget-password-info-login']} onClick={handleLogin}>
            &nbsp;&nbsp;{oauthIntl['srm.oauth.login'] || '登录'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default observer(Retrieve);
