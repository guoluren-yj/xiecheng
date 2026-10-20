/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-02 13:38:42
 * @FilePath: /srm-front-spfm/src/routes/components/TimerButton/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from 'choerodon-ui/pro';
import { isNil, isEmpty, isFunction } from 'lodash';
import request from 'utils/request';
import { getResponse } from 'utils/utils';

/**
 *
 * @param btnDescribe 按钮描述
 * @param apiConfig 点击事件 调用的api的配置
 * @param btnOtherProps 按钮其它属性
 * @param width 按钮宽度
 * @param beforeClick   点击之前的回调 该函数返回一个布尔值，为true则调用，为false 则不调用  不传则直接调用倒计时api
 * @param afterClick 请求后的回调
 * @returns React.FunctionComponents 计时器按钮
 */
const TimerButton = forwardRef(
  (
    {
      btnDesc,
      width,
      countdownDesc = '',
      apiConfig = {},
      beforeClick,
      afterClick,
      ...btnOtherProps
    },
    ref
  ) => {
    const [countdownText, setCountdownText] = useState('');
    // > 0 开启倒计时 | = 0 请求发送loading为true | null||undefined  不开启倒计时也不进入loading
    const [countdown, setCountdown] = useState(null);
    const [captchaKey, setCaptchaKey] = useState(null);
    let timer;

    // 点击调用获取验证码
    const handleClick = useCallback(() => {
      let clickFlag = true;
      if (beforeClick && isFunction(beforeClick)) {
        clickFlag = beforeClick();
      }
      if (clickFlag && !isEmpty(apiConfig)) {
        setCountdown(0);
        const { url, method, ...others } = apiConfig;
        request(`${url}`, {
          method: method || 'GET',
          ...others,
        }).then((res) => {
          const result = getResponse(res);
          if (res && !res.failed) {
            // 设置倒计时参数
            setCountdown(result.interval);
            // 设置验证码需要
            setCaptchaKey(result.captchaKey);
            if (isFunction(afterClick)) {
              afterClick(result);
            }
          } else {
            setCountdown(null);
          }
        });
      }
    }, [apiConfig, countdown, beforeClick, afterClick]);

    /**
     * @description: 开启倒计时
     * @param {*} useCallback
     * @return {*}
     */
    const startTimer = useCallback(() => {
      // 清除循环
      clearInterval(timer); // 清除定时任务，
      setCountdownText(`${countdown}s${countdownDesc}`);
      let newCountdownText = countdown;
      timer = setInterval(() => {
        newCountdownText -= 1;
        setCountdownText(`${newCountdownText}s${countdownDesc}`);
        if (newCountdownText === 0) {
          // 倒计时结束，可再次点击
          clearInterval(timer); // 清除定时任务，
          // 计时按钮
          setCountdown(null);
          setCountdownText(''); // 恢复倒计时时间，
        }
      }, 1000);
    }, [countdown, countdownDesc]);

    // 验证码后端要用的key注入ref
    useImperativeHandle(ref, () => ({
      captchaKey,
    }));

    // 计时器----倒计时
    useEffect(() => {
      // 判断是否开始倒计时
      if (countdown > 0) {
        startTimer();
      }
      return () => {
        clearInterval(timer); // 清除定时任务，
      };
    }, [countdown]);

    return (
      <Button
        loading={countdown === 0}
        disabled={!isNil(countdown) && countdown >= 0}
        onClick={handleClick}
        style={{ width: width ? `${width}px` : '150px' }}
        block
        {...btnOtherProps}
      >
        {countdown > 0 ? countdownText : btnDesc}
      </Button>
    );
  }
);

export default TimerButton;
