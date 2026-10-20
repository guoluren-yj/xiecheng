import axios from 'axios';

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function getPaymentOrder(paymentOrderNum) {
  return request(`/hpay/v1/${organizationId}/payment-orders/detail/${paymentOrderNum}`);
}

export async function getNewPaymentOrder(paymentOrderNum) {
  return request(`/spct/v1/${organizationId}/payment-orders/detail/${paymentOrderNum}`);
}

export async function getPayConfig() {
  return request(`/hpay/v1/${organizationId}/configs`);
}

export async function getNewPayConfig() {
  return request(`/spct/v1/${organizationId}/configs`);
}

export async function getPayQrCode({ paymentOrderNum, channelCode, configCode, ...other }) {
  const SPCT_PARAMS = channelCode === 'alipay' || channelCode === 'wxpay' ? '/spct' : '/hpay';

  return request(`${SPCT_PARAMS}/v1/${organizationId}/basepay/qrpay/order/${paymentOrderNum}`, {
    method: 'POST',
    body: other,
    query: {
      channelCode,
      configCode,
    },
    responseType: 'text',
  });
}

export async function externalPay({ paymentOrderNum, ...other }) {
  return request(`/hpay/v1/${organizationId}/basepay/pay/order/${paymentOrderNum}`, {
    responseType: 'text',
    query: other,
  });
}

// 实时响应支付状态
export async function queryOrderStatus(params) {
  const { paymentOrderNum, channelCode } = params;
  const SPCT_PARAMS = channelCode === 'alipay' || channelCode === 'wxpay' ? '/spct' : '/hpay';

  return axios.get(
    `${SPCT_PARAMS}/v1/${organizationId}/payment-orders/order-status?paymentOrderNum=${paymentOrderNum}`,
    {
      timeout: 60000,
    }
  );
}

export async function reGenerateOrder(params) {
  const { paymentOrderNum, channelCode } = params;
  const SPCT_PARAMS = channelCode === 'alipay' || channelCode === 'wxpay' ? '/spct' : '/hpay';

  return request(`${SPCT_PARAMS}/v1/${organizationId}/payment-orders/re-generate`, {
    query: {
      paymentOrderNum,
    },
  });
}

export async function getOpenService() {
  return request(`/spct/v1/${organizationId}/configs/open-service`, {
    method: 'GET',
    responseType: 'text',
  });
}
