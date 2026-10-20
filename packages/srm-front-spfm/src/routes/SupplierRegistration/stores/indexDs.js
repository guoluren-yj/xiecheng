import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { validatePasswordRule } from '../utils';

const registerFormDs = ({
  intl,
  passwordPolicies,
  defaultVerifyMethod = '',
  passwordDefaultFlag,
}) => ({
  autoCreate: true,
  fields: [
    {
      name: 'realName',
      type: 'string',
      required: true,
      label: intl['srm.oauth.view.register.realName'] || '用户名',
    },
    {
      name: 'password',
      type: 'string',
      required: !passwordDefaultFlag,
      disabled: passwordDefaultFlag,
      defaultValue: passwordDefaultFlag ? '******' : null,
      label: intl['srm.oauth.register.userPassword'] || '登录密码	',
      validator: (value) => {
        if (passwordDefaultFlag) {
          return true;
        }
        return validatePasswordRule(value, passwordPolicies, '', intl);
      },
    },
    {
      name: 'anotherPassword',
      type: 'string',
      required: !passwordDefaultFlag,
      disabled: passwordDefaultFlag,
      defaultValue: passwordDefaultFlag ? '******' : null,
      label: intl['srm.oauth.register.confirmPassword'] || '请确认密码',
      validator: (value, _name, record) => {
        if (passwordDefaultFlag) {
          return true;
        }
        if (value === record.get('password')) {
          return true;
        } else {
          return (
            intl['srm.oauth.register.confirmPasswordAndInconformity'] || '确认密码与密码不一致!'
          );
        }
      },
    },
    {
      name: 'verifyMethods',
      required: true,
      label: intl['srm.oauth.view.register.verifyMethods'] || '验证方式',
      textField: 'meaning',
      valueField: 'value',
      defaultValue: defaultVerifyMethod,
    },
    {
      name: 'phone',
      type: 'string',
      label: intl['srm.oauth.register.phoneNumber'] || '手机号码',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('verifyMethods') === 'PHONE';
        },
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('verifyMethods') === 'PHONE';
        },
      },
      textField: 'meaning',
      valueField: 'value',
      disabled: true,
    },
    {
      name: 'email',
      type: 'email',
      label: intl['srm.oauth.register.emailAccount'] || '请输入邮箱',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('verifyMethods') === 'EMAIL';
        },
      },
    },
    {
      name: 'authCode',
      type: 'string',
      required: true,
      label: intl['srm.oauth.login.verificationCode'] || '验证码',
    },
    {
      name: 'orcheck',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    // {
    //   name: 'orCheckErr',
    //   type: 'number',
    //   validator: (_value, _name, record) => {
    //     return !record.get('orcheck')
    //       ? intl['srm.oauth.register.tickAgreement'] || '请勾选同意协议'
    //       : true;
    //   },
    // },
  ],
  // transport: {
  //   read: ({ data }) => {
  //     return {
  //       url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/enteringReq/detail`,
  //       method: 'GET',
  //       data: {
  //         ...data,
  //         changeReqId,
  //         customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_BASIC_INFO',
  //       },
  //     };
  //   },
  // },
  // events: {
  //   update: ({ dataSet }) => {
  //     if (dataSet) {
  //       dataSet.forEach(record => {
  //         Object.assign(record, { status: 'update' });
  //       });
  //     }
  //   },
  // },
});

export { registerFormDs };
