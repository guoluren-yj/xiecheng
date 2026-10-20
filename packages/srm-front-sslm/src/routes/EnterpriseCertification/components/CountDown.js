/*
 * CountDown - 倒计时
 * @Date: 2022-07-21 09:50:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { getAuthCode } from '@/services/enterpriseCertificationService';

const CountDown = ({ dataSet, type, modal, params = {} }) => {
  const [countDown, setCountDown] = useState(0);
  const [authCodeText, setAuthCodeText] = useState();
  const [authCodeLoading, setAuthCodeLoading] = useState(false);

  let timer = null;
  const startTimer = useCallback(() => {
    clearInterval(timer);
    setAuthCodeText(`${countDown}s`);
    timer = setInterval(() => {
      setCountDown(preCountDown => {
        if (countDown > 0) {
          return preCountDown - 1;
        } else {
          clearInterval(timer);
          setAuthCodeText('');
        }
      });
    }, 1000);
  }, [countDown]);

  useEffect(() => {
    if (countDown > 0) {
      startTimer();
    }
    return () => {
      clearInterval(timer);
    };
  }, [countDown]);

  // 获取验证码
  const handleAuthCode = useCallback(async () => {
    const validateFlag = await dataSet.validate();
    if (validateFlag) {
      setAuthCodeLoading(true);
      const data = dataSet.current?.toJSONData() || {};
      getAuthCode({ ...data, ...params }, type)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            const { serviceId, captchaKey, interval = 60 } = res;
            if (serviceId) {
              dataSet.current.set('serviceId', serviceId);
            }
            if (captchaKey) {
              dataSet.current.set('captchaKey', captchaKey);
            }
            notification.success({
              message: intl.get('sslm.common.view.message.codeSendSuccess').d('验证码发送成功'),
            });
            setCountDown(interval);
            // 验证码发送成功可以开始实名认证
            if (modal) {
              modal.update({
                okProps: {
                  disabled: false,
                },
              });
            }
          }
        })
        .finally(() => {
          setAuthCodeLoading(false);
        });
    } else {
      notification.warning({
        message: intl
          .get('sslm.common.view.message.notGetVerificationCode')
          .d('当前信息校验未通过, 不能获取验证码'),
      });
    }
  }, [dataSet, countDown]);

  return (
    <Button
      style={{ width: '92%', marginLeft: 10 }}
      onClick={handleAuthCode}
      disabled={countDown > 0}
      loading={authCodeLoading}
    >
      {countDown > 0
        ? authCodeText
        : intl.get('sslm.common.view.btn.getVerificationCode').d('获取验证码')}
    </Button>
  );
};

export default CountDown;
