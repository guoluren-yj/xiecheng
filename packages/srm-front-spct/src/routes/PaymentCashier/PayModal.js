import React from 'react';
import QRCode from 'qrcode.react';

import intl from 'utils/intl';

function PayModal(props) {
  return (
    <div>
      {/* <div style={{ marginBottom: '20px' }}>
        {intl.get('spct.paymentOrder.view.wxPayTips').d('交易将在30分钟后关闭，请及时付款！')}
      </div> */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span>{intl.get('spct.paymentOrder.view.pleaseUse').d('请使用')}</span>&nbsp;
        <span style={{ color: '#29BECE' }}>
          {intl.get('spct.paymentOrder.view.weixin').d('微信')}
        </span>
        &nbsp;
        <span>
          {intl.get('spct.paymentOrder.view.wxCodePay').d('扫码付款')}(
          {props.orderData?.currencyCode})
        </span>
      </div>
      <div
        style={{
          marginBottom: '16px',
          fontWeight: 600,
          textAlign: 'center',
          fontSize: '16px',
          color: '#FA6400',
        }}
      >
        {props.orderData?.paymentAmount}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <QRCode value={props.codeUrl} size={240} />
      </div>
      <div style={{ width: '240px', margin: '0 auto', textAlign: 'center' }}>
        {intl
          .get('spct.paymentOrder.view.wxCodePayTips')
          .d('支付成功后会自动跳转至订单内，若长时间未跳转可手动刷新订单查看支付状态')}
      </div>
    </div>
  );
}

export default PayModal;
