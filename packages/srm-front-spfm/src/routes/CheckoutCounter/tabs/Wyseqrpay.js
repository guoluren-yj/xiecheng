/**
 * 交行聚合码 tab
 */
import React from 'react';

import intl from 'utils/intl';

import QrCodePay from '../components/QrCodePay';

export default function Wyseqrpay(props) {
  return (
    <QrCodePay
      title={intl
        .get('hpay.checkoutCounter.view.title.wyseQrpayScanCode')
        .d('二维码为交通银行聚合码，支持微信/云闪付扫码支付')}
      {...props}
    />
  );
}
