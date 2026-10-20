import { EMAIL, PHONE } from 'hzero-front/lib/utils/regExp';

export default function getForgetPassword(intlRef) {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'account',
        type: 'string',
        validator: value => {
          if (value === undefined || value === null) return;
          if (!EMAIL.test(value || '') && !PHONE.test(value || '')) {
            return intlRef.current
              ? intlRef.current['srm.oauth.passwordFind.formatIsIncorrect']
              : '手机/邮箱格式不正确';
          }
        },
      },
      {
        name: 'captcha',
        type: 'string',
      },
      // 6位验证码
      {
        name: 'captcha1',
        type: 'string',
      },
      {
        name: 'captcha2',
        type: 'string',
      },
      {
        name: 'captcha3',
        type: 'string',
      },
      {
        name: 'captcha4',
        type: 'string',
      },
      {
        name: 'captcha5',
        type: 'string',
      },
      {
        name: 'captcha6',
        type: 'string',
      },
      {
        name: 'c',
        type: 'string',
      },
      {
        name: 'newPassword',
        type: 'string',
        validator: value => {
          if (value) {
            if (/[\u4e00-\u9fa5 ]/.test(value)) {
              return (
                (intlRef.current &&
                  intlRef.current['hzero.common.validation.passwordNotIncludeChinese']) ||
                '密码中不可包含中文或者空格'
              );
            }
            if (/[，《。》？；：！￥’“【「】」——）（……·]/.test(value)) {
              return (
                (intlRef.current &&
                  intlRef.current['hzero.common.validation.includeChineseChar']) ||
                '密码中不支持录入中文符号，如，《。》？；：！￥’“【「】」——）（……·等'
              );
            }
            // eslint-disable-next-line no-useless-escape
            if (!/^[a-zA-Z0-9~'`@#\$%\^&\*\\\-_=\+\|/\(\)<>,\.;:!\[\]]+$/.test(value)) {
              return (
                (intlRef.current && intlRef.current['hzero.common.validation.new.specialChart']) ||
                '特殊符号仅支持录入的内容有 ~`@#$%^&*-_=+|/()<>,.;:![]'
              );
            }
          }
          return true;
        },
      },
      {
        name: 'newPasswordVerify',
        type: 'string',
        validator: (value, name, record) => {
          if (value && name === 'newPasswordVerify') {
            if (value === record.get('newPassword')) {
              return true;
            } else {
              return false;
            }
          }
        },
      },
    ],
  };
}
