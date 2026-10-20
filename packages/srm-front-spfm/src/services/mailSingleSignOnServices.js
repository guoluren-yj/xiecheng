import request from 'utils/request';
import { API_HOST } from 'hzero-front/lib/utils/config';

const origin = window.location.origin.includes('localhost') ? API_HOST : window.location.origin;

export async function sendCodeService(params) {
  const { captcha, oneStepMail } = params;
  return request(
    `${origin}/oauth/public/send-mail-captcha?oneStepMail=${oneStepMail}&captcha=${captcha}&businessScope=checkEmail`,
    {
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
      },
      method: 'POST',
    }
  );
}

export async function veriCodeService(params) {
  return request(`${origin}/oauth/v2/password/check-captcha`, {
    method: 'POST',
    body: params,
  });
}
