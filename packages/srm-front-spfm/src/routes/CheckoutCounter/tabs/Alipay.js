/**
 * 支付宝 tab
 */
import React from 'react';

import intl from 'utils/intl';

import QrCodePay from '../components/QrCodePay';

export default function AliPay(props) {
  return (
    <QrCodePay
      title={intl
        .get('spfm.checkoutCounter.view.message.alipayScanCode')
        .d('请使用支付宝扫描二维码以完成支付')}
      {...props}
    />
  );
}
