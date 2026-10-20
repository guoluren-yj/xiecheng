/**
 * 支付宝 tab
 */
import React from 'react';

import intl from 'utils/intl';

import QrCodePay from '../components/QrCodePay';

export default function WxPay(props) {
  return (
    <QrCodePay
      title={intl
        .get('spfm.checkoutCounter.view.message.wxpayScanCode')
        .d('请使用微信扫描二维码以完成支付')}
      {...props}
    />
  );
}
