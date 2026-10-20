import React, { useState, useEffect } from 'react';

import intl from 'utils/intl';
import { getAccessToken } from 'utils/utils';

import WysepayLogo from '@/assets/payment/channel/WysepayLogo.svg';
import WyseqrpayLogo from '@/assets/payment/channel/WyseqrpayLogo.png';
import AlipayLogo from '@/assets/payment/channel/AlipayLogo.png';
import WxpayLogo from '@/assets/payment/channel/WxpayLogo.png';
import UnionpayLogo from '@/assets/payment/channel/UnionpayLogo.png';

/**
 * 支付类型 对应图标
 */
export const renderPaymentChannelLogo = (paymentChannel) => {
  const { channelMeaning, channelCode, extParam = {} } = paymentChannel;
  let logo;
  switch (channelCode) {
    case 'wysepay': {
      const { channelTrxType } = extParam;
      if (channelTrxType === 'PC') {
        return (
          <span>
            <img alt={channelMeaning} src={WysepayLogo} height={64} width={64} />
            <span
              style={{
                userSelect: 'none',
                fontSize: '0.22rem',
                verticalAlign: 'middle',
                marginLeft: '0.06rem',
              }}
            >
              {intl.get('hpay.checkoutCounter.view.title.enterprisePayment').d('企业支付')}
            </span>
          </span>
        );
      }
      logo = WyseqrpayLogo;
      break;
    }
    case 'alipay': {
      logo = AlipayLogo;
      break;
    }
    case 'wxpay': {
      logo = WxpayLogo;
      break;
    }
    case 'unionpay':
    default: {
      logo = UnionpayLogo;
    }
  }
  return <img alt={channelMeaning} style={{ maxWidth: 200, height: 40 }} src={logo} />;
};

/**
 * 银行图标对应的background位置
 */
export const BankLogoPosition = {
  'B2B-PC-ABC-NEW': '0 -532px',
  'B2B-PC-BOB-NEW': '0 -28px',
  'B2B-PC-CCB-NEW': '0 -336px',
  'B2B-PC-CEB-NEW': '0 -168px',
  'B2B-PC-CMBC-NEW': '0 -448px',
  'B2B-PC-CMB-NEW': '0 -784px',
  'B2B-PC-GDB-NEW': '0 -196px',
  'B2B-PC-HXB-NEW': '0 -308px',
  'B2B-PC-PAB-NEW': '0 -560px',
  'B2B-PC-SPDB-NEW': '0 -588px',
};

/**
 * 判断是否是json数据
 * @param {String} str
 */
export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

/**
 * 计时器hooks
 * @param {*} initialValue 初始值
 * @param {*} trigger 开关
 */
export function useTimer(initialValue, trigger = false) {
  const [leftTime, setLeftTime] = useState(initialValue); // 倒计时事件
  const [timeoutFlag, setTimeoutFlag] = useState(false); // 超时标识

  let timer = null;

  useEffect(() => {
    if (trigger) {
      timer = setInterval(() => {
        if (leftTime > 0) {
          setLeftTime(leftTime - 1);
        } else {
          setTimeoutFlag(true);
          clearInterval(timer);
        }
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [leftTime, trigger]);

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
    }
    timer = null;
  };

  // 倒计时渲染器
  const timerRender = () => {
    const timerMinutes = Math.floor(leftTime / 60);
    const timerSeconds = leftTime % 60;
    // 0分不显示，0秒显示
    return (
      <>
        {timerMinutes > 0 && (
          <span>
            {timerMinutes}
            {intl.get('hzero.common.date.unit.minute').d('分')}
          </span>
        )}
        {timerSeconds >= 0 && (
          <span>
            {timerSeconds}
            {intl.get('hzero.common.date.unit.second').d('秒')}
          </span>
        )}
      </>
    );
  };

  return {
    leftTime,
    timeoutFlag,
    setLeftTime,
    setTimeoutFlag,
    timerRender,
    clearTimer,
  };
}

/**
 * 展示支付结果
 * @param {*} orderNum 订单商户号
 */
export function showOrderPaidResult({ returnUrl, merchantOrderNum }) {
  let url = returnUrl;
  if (url && !url.endsWith('/')) {
    url = url.concat('/');
  }
  window.location.href = `${url}payment-result/?merchantOrderNum=${merchantOrderNum}#access_token=${getAccessToken()}`;
}
