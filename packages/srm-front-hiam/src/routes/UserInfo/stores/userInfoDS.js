/**
 * 个人中心实名认证 DS
 */
import intl from 'utils/intl';
import { IDENTITY_CARD, PHONE } from 'utils/regExp'; // 身份证号,手机号,

/**
 * 个人中心 saas 预录入信息Form DS
 * @returns
 */
const PreFilledDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`hiam.userInfo.model.realName`).d('姓名'),
      name: 'realName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`hiam.userInfo.model.thirdAccountType`).d('第三方用户账号类型'),
      name: 'accountType',
      type: 'string',
      required: true,
      lookupCode: 'HIAM.USER_INFO_AUTH_TYPE',
    },
    {
      label: intl.get(`hiam.userInfo.model.email`).d('邮箱'),
      name: 'email',
      type: 'email',
      dynamicProps: {
        required: ({ record }) => record.get('accountType') === 'EMAIL',
      },
    },
    {
      label: intl.get(`hiam.userInfo.model.phoneNumber`).d('实名手机号'),
      name: 'phoneNumber',
      type: 'string',
      required: true,
    },
  ],
  events: {},
});

const AuthOneDS = () => ({
  transport: {},
  pageSize: 20,
  selection: false,
  fields: [
    {
      label: intl.get('hiam.userInfo.model.user.userName').d('姓名'),
      name: 'authName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.documentType').d('证件类型'),
      name: 'documentType',
      type: 'string',
      required: true,
    },
    {
      // label: intl.get(`hiam.userInfo.model.email`).d('邮箱'),
      name: 'documentNum',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.bankCardNum').d('银行卡号'),
      name: 'bankCardNum',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.bankPhoneNum').d('预留手机号'),
      name: 'bankPhoneNum',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.authCode').d('验证码'),
      name: 'authCode',
      type: 'string',
      required: true,
    },
  ],
  events: {},
});

const AuthTwoDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`hiam.userInfo.model.realName`).d('姓名'),
      name: 'realName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`hiam.userInfo.model.thirdAccountType`).d('第三方用户账号类型'),
      name: 'accountType',
      type: 'string',
      required: true,
      lookupCode: 'HIAM.USER_INFO_AUTH_TYPE',
    },
    {
      label: intl.get(`hiam.userInfo.model.email`).d('邮箱'),
      name: 'email',
      type: 'email',
      dynamicProps: {
        required: ({ record }) => record.get('accountType') === 'EMAIL',
      },
    },
    {
      label: intl.get(`hiam.userInfo.model.phoneNumber`).d('实名手机号'),
      name: 'phoneNumber',
      type: 'string',
      required: true,
    },
  ],
  events: {},
});

const QysAuthFormDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`hiam.userInfo.model.userType`).d('用户类型'),
      name: 'authType',
      type: 'string',
      required: true,
      lookupCode: 'SPFM.REALNAME_AUTH_USER_TYPE',
      defaultValue: 'INNER',
    },
    {
      label: intl.get(`hiam.userInfo.model.name`).d('姓名'),
      name: 'authName',
      type: 'string',
      required: true,
    },
    {
      name: 'documentNum',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`hiam.userInfo.model.email`).d('邮箱'),
      name: 'email',
      type: 'email',
      dynamicProps: {
        required: ({ record }) => record.get('authType') !== 'INNER',
      },
    },
    {
      label: intl.get(`hiam.userInfo.model.phoneNumber`).d('实名手机号'),
      name: 'bankPhoneNum',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => record.get('authType') === 'INNER',
      },
    },
  ],
  events: {},
});

/**
 * 实名认证弹窗 DS
 * @returns
 */
const RealNameAuthDS = () => ({
  transport: {},
  fields: [
    {
      label: intl.get('hiam.userInfo.model.user.userName').d('姓名'),
      name: 'authName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.documentType').d('证件类型'),
      name: 'documentType',
      type: 'string',
      required: true,
      lookupCode: 'SPFM.ID_TYPE',
    },
    {
      // label: intl.get('hiam.userInfo.model.user.documentNum').d('身份证号'),
      name: 'documentNum',
      type: 'string',
      required: true,
      dynamicProps: {
        pattern: ({ record }) => {
          const P_PATTERN = /(^[EeKkGgDdSsPpHh]\d{8}$)|(^(([Ee][a-fA-F])|([DdSsPp][Ee])|([Kk][Jj])|([Mm][Aa])|(1[45]))\d{7}$)/;
          return record.get('documentType') === 'I' ? IDENTITY_CARD : P_PATTERN;
        },
      },
    },
    {
      label: intl.get('hiam.userInfo.model.user.bankCardNum').d('银行卡号'),
      name: 'bankCardNum',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.bankPhoneNum').d('预留手机号'),
      name: 'bankPhoneNum',
      type: 'string',
      pattern: PHONE,
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.authCode').d('验证码'),
      name: 'authCode',
      type: 'string',
      // required: true,
      dynamicProps: {
        required: ({ record }) => {
          return !!record.get('serviceId');
        },
      },
    },
    {
      name: 'serviceId',
    },
  ],
  events: {},
});

/**
 * 实名认证手机弹窗 DS
 * @returns
 */
const RealNamePhoneDS = () => ({
  transport: {},
  autoCreate: true,
  fields: [
    {
      label: intl.get('hiam.userInfo.model.user.userName').d('姓名'),
      name: 'authName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.documentNum').d('身份证号'),
      name: 'documentNum',
      type: 'string',
      required: true,
      pattern: IDENTITY_CARD,
    },
    {
      label: intl.get('hiam.userInfo.model.user.phoneNum').d('手机号码'),
      name: 'bankPhoneNum',
      type: 'string',
      pattern: PHONE,
      required: true,
    },
    {
      label: intl.get('hiam.userInfo.model.user.authCode').d('验证码'),
      name: 'authCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('authType') !== 'QYS' && !!record.get('flowId');
        },
      },
    },
    {
      name: 'documentType',
    },
    {
      name: 'authType',
    },
    {
      name: 'flowId',
    },
  ],
  events: {},
});

export { PreFilledDS, AuthOneDS, AuthTwoDS, QysAuthFormDS, RealNameAuthDS, RealNamePhoneDS };
