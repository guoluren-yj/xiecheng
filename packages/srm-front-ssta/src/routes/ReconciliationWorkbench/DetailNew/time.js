// 倒计时Modal
import React, { useEffect, useState, useRef } from 'react';
import { Form, TextField } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { getVerifyCode } from '@/services/reconciliationWorkbenchService';

import styles from './index.less';

const Time = (props) => {
  const { phoneInfoDs, billHeaderId, authType, modal } = props;
  const TIME_NUM = 60;
  const [time, setTime] = useState(TIME_NUM);
  const [value, setValue] = useState('');
  const [isDisable, setIsDisable] = useState(false);
  const timer = useRef();

  useEffect(() => {
    return () => {
      phoneInfoDs.current.set('verifiCode', '');
      recoverData();
    };
  }, []);

  useEffect(() => {
    if (time <= 0) {
      recoverData();
    }
  }, [time]);

  useEffect(() => {
    modal.update({ okProps: { disabled: !value } });
  }, [value]);

  const recoverData = () => {
    clearInterval(timer.current);
    setIsDisable(false);
    setTime(TIME_NUM);
  };

  const setCodeValue = (e) => {
    setValue(e.target.value);
  };

  const sendCode = () => {
    const mobile = phoneInfoDs.current?.get('phone');
    if (!mobile || isDisable) {
      return;
    }
    setIsDisable(true);
    timer.current = setInterval(() => setTime((pre) => pre - 1), 1000);
    getResponse(getVerifyCode({ mobile, authType, billHeaderId }));
  };

  return (
    <div>
      <Form dataSet={phoneInfoDs} useColon={false} columns={1} labelLayout="float">
        <TextField name="phone" disabled readOnly />
        <TextField
          name="verifiCode"
          onInput={setCodeValue}
          suffix={
            <span
              onClick={sendCode}
              className={classNames(styles['ssta-time-code'], {
                [styles['ssta-time-diable']]: isDisable,
              })}
            >
              {isDisable
                ? `${time}s${intl
                    .get('ssta.common.model.common.retrieveCaptcha')
                    .d('retrieveCaptcha')}`
                : intl.get('ssta.common.model.common.getVerifyCode').d('获取验证码')}
            </span>
          }
        />
      </Form>
    </div>
  );
};

export default Time;
