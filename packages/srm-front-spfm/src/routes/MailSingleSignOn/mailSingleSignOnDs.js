export default function getMailSingleSignOnDs() {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'account',
        type: 'string',
        pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
        disabled: true,
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
    ],
  };
}
