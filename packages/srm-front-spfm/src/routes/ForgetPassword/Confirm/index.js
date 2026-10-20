import React, { useState, useEffect, useMemo } from 'react';

import { Form, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { handleConfirm } from '@/services/forgetPasswordService';

import styles from '../index.less';

const Confirm = (props) => {
  const { formDs, onStep, countdown, oauthIntl } = props;
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
        maxLength={1}
        restrict={/[^0-9]/g}
        autoFocus={index === 0}
      />
    ));
  }, []);

  // 监听表单值更新
  useEffect(() => {
    formDs.addEventListener('update', handleDsUpdate);
    return () => {
      formDs.removeEventListener('update', handleDsUpdate);
    };
  }, []);

  const handleDsUpdate = ({ record, name, value }) => {
    if (
      name === 'captcha1' ||
      name === 'captcha2' ||
      name === 'captcha3' ||
      name === 'captcha4' ||
      name === 'captcha5' ||
      name === 'captcha6'
    ) {
      // 输入值后自动聚焦到下一位
      const focusValue = parseInt(name.slice(-1), 10);
      if (focusValue < 6 && value) {
        document.querySelector(`input[name=captcha${focusValue + 1}]`).focus();
      }

      // 是否可点击确定
      const captcha1 = record.get('captcha1');
      const captcha2 = record.get('captcha2');
      const captcha3 = record.get('captcha3');
      const captcha4 = record.get('captcha4');
      const captcha5 = record.get('captcha5');
      const captcha6 = record.get('captcha6');
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
    const captcha1 = formDs.current.get('captcha1');
    const captcha2 = formDs.current.get('captcha2');
    const captcha3 = formDs.current.get('captcha3');
    const captcha4 = formDs.current.get('captcha4');
    const captcha5 = formDs.current.get('captcha5');
    const captcha6 = formDs.current.get('captcha6');
    const captchaValue = `${captcha1}${captcha2}${captcha3}${captcha4}${captcha5}${captcha6}`;
    formDs.setState('msgCaptcha', captchaValue);
    // 验证短信验证码
    handleConfirm({ account, captcha: captchaValue, captchaKey }).then((res) => {
      const resValue = getResponse(res);
      // 本地调试用
      // formDs.setState('passwordInfo', {
      //   'enablePassword': false,
      //   'upperCaseCount': 1,
      //   'digitsCount': 1,
      //   'minLength': 7,
      //   'lowerCaseCount': 1,
      //   'maxLength': 30,
      //   'specialCharCount': 1,
      //   'realName': '沈霞',
      //   'loginName': 'zhenyun111',
      // });
      // setResult(true);
      // onStep('reset');

      if (resValue) {
        if (resValue.success) {
          formDs.setState('passwordInfo', resValue.data);
          onStep('reset');
          setResult(true);
        }
        if (resValue.failed || !resValue.success) {
          setResult(false);
          notification.warning({ message: resValue.message });
        }
      } else {
        // 返回值failed
        setResult(false);
      }
    });
  };

  // 回车事件
  const handleKeyDown = (e) => {
    if (disable) {
      return;
    }
    // 按钮能点击的情况下，回车进入下一步
    if (e.keyCode === 13) return handleButtonConfirm();
  };

  // 多语言处理
  const renderMessage = (value) => {
    const message =
      oauthIntl['srm.oauth.resetPassword.send.message'] ||
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
    <div className={styles['confirm-content']}>
      <div className={styles['back-icon']} onClick={() => onStep('retrieve')}>
        <Icon type="arrow_back" />
      </div>
      <div className={styles['form-content']}>
        <div className={styles['title-text']}>
          {oauthIntl['srm.oauth.resetPassword.confirmAccount'] || '确认账号'}
        </div>
        <div className={styles['title-tip']}>{renderMessage(account)}</div>
        <Form dataSet={formDs} labelLayout="none" onKeyDown={handleKeyDown}>
          <div className={`${styles['captcha-layout']} ${!result ? styles['captcha-error'] : ''}`}>
            {textArr}
          </div>
          <div className={styles['captcha-info']}>
            <span>
              {count === 0 &&
                !account.includes('@') &&
                (oauthIntl['srm.oauth.forgetPassword.not.get.captcha'] ||
                  '收不到验证码？请先确认手机是否安装了短信拦截软件或是否欠费停机。若均不是，请返回上一步重新发送验证码')}
              {count !== 0 &&
                (
                  oauthIntl['srm.oauth.resetPassword.get.captcha'] || `{count}s后可重新获取验证码`
                ).replace('{count}', count)}
            </span>
            {count === 0 && (
              <p className={styles['go-back-text']} onClick={() => onStep('retrieve')}>
                <Icon type="arrow_back" />
                <span>{oauthIntl['srm.oauth.forgetPassword.goback'] || '返回上一步'}</span>
              </p>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default observer(Confirm);
