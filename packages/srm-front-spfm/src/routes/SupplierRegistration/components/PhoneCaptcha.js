/**
 * @Author: CDJ
 * @Date: 2024-11-27 13:38:42
 * @FilePath: /srm-front-spfm/src/routes/components/TimerButton/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useCallback } from 'react';
import { isEmpty, isFunction } from 'lodash';

import { Button } from 'choerodon-ui/pro';
import { Statistic } from 'choerodon-ui';

import request from 'utils/request';
import { getResponse } from 'utils/utils';
import CaptchaButton from '_components/CaptchaButton';

const { Countdown } = Statistic;

/**
 *
 * @param btnDescribe 按钮描述
 * @param apiConfig 点击事件 调用的api的配置
 * @param width 按钮宽度
 * @param beforeClick   点击之前的回调 该函数返回一个布尔值，为true则调用，为false 则不调用  不传则直接调用倒计时api
 * @param afterClick 请求后的回调
 * @returns React.FunctionComponents 计时器按钮
 */
const PhoneCaptcha = ({
  btnDesc = '',
  apiConfig = {},
  beforeClick,
  afterClick,
  purchaseTenantId,
  disabledCaptcha = true,
}) => {
  const [codeBtnType, setCodeBtnType] = useState('captcha');
  const [countDown, setCountDown] = useState(Date.now() + 60000); // 倒计时时长

  // 点击调用获取验证码
  const handleClick = useCallback(
    (params = {}) => {
      return new Promise((resolve) => {
        let clickFlag = true;
        if (beforeClick && isFunction(beforeClick)) {
          clickFlag = beforeClick();
        }
        // 校验失败
        if (!clickFlag && !isEmpty(params)) {
          resolve();
          return;
        }
        if (clickFlag && !isEmpty(apiConfig)) {
          const { url, method, query = {}, ...others } = apiConfig;
          request(`${url}`, {
            method: method || 'GET',
            query: { ...(query || {}), ...(params || {}) },
            ...others,
          }).then((res) => {
            if (getResponse(res)) {
              setCountDown(Date.now() + 60000);
              setCodeBtnType('countDown');
              // 设置验证码需要
              if (isFunction(afterClick)) {
                afterClick(res);
              }
              resolve();
            } else {
              resolve(res);
            }
          });
        }
      });
    },
    [apiConfig, beforeClick, afterClick]
  );

  /**
   *  倒计时结束
   */
  const onCountDownFinish = () => {
    setCodeBtnType('captcha');
    // console.log('倒计时结束');
  };

  const btnProps = {
    style: { width: '150px' },
  };

  return codeBtnType === 'captcha' ? (
    <CaptchaButton
      buttonProps={{
        disabled: disabledCaptcha,
        ...btnProps,
      }}
      buttonText={btnDesc}
      senseCode="spfm_new_registration"
      onClick={handleClick}
      tenantId={purchaseTenantId}
    />
  ) : (
    <Button {...btnProps} disabled className="phone-countdown-duration">
      <Countdown value={countDown} format="s" onFinish={onCountDownFinish} />
      {'s'}
    </Button>
  );
};

export default PhoneCaptcha;
