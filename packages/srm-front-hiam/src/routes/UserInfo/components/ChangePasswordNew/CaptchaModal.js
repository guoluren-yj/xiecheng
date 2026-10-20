import React, { useState, useRef } from 'react';
import { TextField, Button } from 'choerodon-ui/pro';
import classnames from 'classnames';

import { API_HOST } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';

import styles from './index.less';

function CaptchaModal(props) {
  const { record, onClick, modal, afterVerify } = props;
  const [timestamp, setTimestamp] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState(undefined);
  const inputRef = useRef();
  const origin = window.location.origin.includes('localhost') ? API_HOST : window.location.origin;
  const refreshImage = () => {
    setTimestamp(Date.now());
  };

  const handleSubmit = async () => {
    setErrorMsg(undefined);
    const flag = await record.validate();
    if (!flag) {
      return false;
    }
    const verifyValue = record.get('verifyValue');
    const res = await onClick(verifyValue);
    if (res && !res.success) {
      setErrorMsg(res.message);
      setTimestamp(Date.now());
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return false;
    } else {
      if (afterVerify) {
        afterVerify(res);
      }
      handleClose();
      return true;
    }
  };

  const handleClose = () => {
    if (modal) {
      modal.close();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', padding: '15px 24px' }}>
        <div style={{ marginRight: '16px' }}>
          <TextField
            record={record}
            ref={inputRef}
            className={classnames(styles['captcha-input'], {
              [styles['captcha-input-error']]: errorMsg,
            })}
            name="verifyValue"
            placeholder={intl
              .get('hzero.common.components.login.captcha.input')
              .d('输入图片中的字符')}
            onChange={() => setErrorMsg(undefined)}
          />
          {errorMsg && <div className={styles['captcha-error']}>{errorMsg}</div>}
        </div>
        <div>
          <img
            alt=""
            src={`${origin}/oauth/password/captcha.jpg?t=${timestamp}`}
            onClick={refreshImage}
            style={{ height: '30px' }}
          />
          <div onClick={refreshImage} className={styles['captcha-change']}>
            {intl.get('hzero.common.components.login.captcha.changeImg').d('看不清？换一张')}
          </div>
        </div>
      </div>
      <div className={styles['captcha-footer']}>
        <Button onClick={handleClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
        <Button color="primary" onClick={handleSubmit}>
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
      </div>
    </>
  );
}

export default CaptchaModal;
