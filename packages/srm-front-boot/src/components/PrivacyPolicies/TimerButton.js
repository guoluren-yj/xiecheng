/**
 * PrivacyPolicies.js
 * 隐私政策条款 - 倒计时按钮
 * @date: 2021-10-25
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

function TimerButton(props = {}) {
  const [second, handleSecond] = useState(5);
  const [btnDisable, handleBtnDisable] = useState(true);
  const timer = useRef(null); // 定时器
  useEffect(() => {
    if (second > 0) {
      timer.current = setTimeout(() => {
        handleSecond(second - 1);
      }, 1000);
    } else {
      handleBtnDisable(false);
      clearTimeout(timer.current);
    }
    return () => {
      clearTimeout(timer.current);
    };
  }, [second]);

  return (
    <Button color="primary" disabled={btnDisable} onClick={props.onClick}>
      {intl.get('spfm.privacyPolicies.view.button.agree').d('同意')} {second > 0 && `${second}s`}
    </Button>
  );
}

export default TimerButton;
