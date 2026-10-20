import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { SRM_PLATFORM } from '_utils/config';

/**
 * 公司列表 DS
 * @returns
 */
const ListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/list-partner-company`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    // destroy: ({ data }) => {
    //   return {
    //     url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/remove-company-person`,
    //     data,
    //     method: 'POST',
    //   };
    // },
  },
  pageSize: 20,
  selection: false,
  // primaryKey: 'defineId',
  fields: [
    {
      label: intl.get(`spfm.supplierElectronicSign.model.partnerName`).d('合作客户'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierElectronicSign.model.tenantCode`).d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierElectronicSign.model.authFlag`).d('开通电签服务'),
      name: 'partnerCode',
      type: 'string',
      lookupCode: 'SPFM.PERSON_AUTH_PRODUCT_VERSION',
    },
    {
      label: intl.get(`spfm.supplierElectronicSign.model.caAuth`).d('CA认证'),
      name: 'authStatus',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 公司基础信息 Form DS
 * @returns
 */
const BasicFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/supplier-company-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      // label: intl.get(`spfm.buyerElectronicSign.model.socialCreditCode`).d('统一社会信用代码'),
      name: 'organCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signType`).d('电签服务'),
      name: 'partnerCode',
      type: 'string',
      lookupCode: 'SPFM.PERSON_AUTH_PRODUCT_VERSION',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authStatus`).d('认证状态'),
      name: 'authStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authTime`).d('认证时间'),
      name: 'authTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizeStatus`).d('授权状态'),
      name: 'authorizeStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedTime`).d('授权时间'),
      name: 'authorizeOperateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedEndTime`).d('授权到期时间'),
      name: 'authorizeTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 成员管理列表 DS
 * @returns
 */
const MemberListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/supplier-list-employee`,
        params: {
          ...data,
          ...params,
          tenantId: data.tenantId,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/batch/supplier-remove-company-person`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  // selection: 'single',
  primaryKey: 'signSealEmployeeId',
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.realAuthStatus`).d('实名认证状态'),
      name: 'statusMeaning',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.subAccount`).d('子账号编码'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.subAccountName`).d('子账号名称'),
      name: 'realName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.name`).d('实名姓名'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.phoneNumber`).d('实名手机号'),
      name: 'phone',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.addUserTime`).d('添加成员时间'),
      name: 'creationDate',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 印章管理列表 DS
 * @returns
 */
const SignListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-seal/company/${
          data.companyId
        }`,
        params: {
          ...data,
          ...params,
          tenantId: data.tenantId,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      const obj = data && data.length ? data[0] : {};
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-seal/company/${
          obj.companyId
        }/batch-delete?partnerTenant=${obj.partnerTenant}`,
        data,
        method: 'DELETE',
      };
    },
  },
  pageSize: 20,
  // selection: 'single',
  primaryKey: 'signSealEmployeeId',
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signStatus`).d('印章状态'),
      name: 'sealStatus',
      type: 'string',
      lookupCode: 'SPFM.SEAL_STATUS',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signCode`).d('印章编码'),
      name: 'sealCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signName`).d('印章名称'),
      name: 'sealName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.syncResult`).d('同步审核结果'),
      name: 'sealResMsg',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.pic`).d('图片'),
      name: 'picStr',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 生成印章FORM DS
 * @returns
 */
const GenerateFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/supplier-list-employee`,
        params: {
          ...data,
          ...params,
          tenantId: getCurrentOrganizationId(),
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/supplier-remove-company-person`,
        data: data[0],
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  // selection: 'single',
  primaryKey: 'signSealEmployeeId',
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signCode`).d('印章编码'),
      name: 'signCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signName`).d('印章名称'),
      name: 'signName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.templateType`).d('模板类型'),
      name: 'templateType',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signColor`).d('生成印章颜色'),
      name: 'signColor',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.sealHorizontalText`).d('印章横向文'),
      name: 'horizontalText',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.sealLastText`).d('印章下弦文'),
      name: 'lastText',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 印章图片 DS
 * @returns
 */
const SignAttachDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/seal/company/${data.companyId}/${
          data.sealId
        }/detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      const obj = data.length ? { ...data[0] } : {};

      const url = `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-seal/company/${
        obj.companyId
      }/batch-save/${obj.authType}?partnerTenant=${obj.parTenantId}`;

      // if (obj.authType === 'ESIGN') {
      //   url = `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/seal/company/${
      //     obj.companyId
      //   }/batch-save/${obj.authType}?partnerTenant=${obj.parTenantId}`;
      // }

      return {
        url,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const obj = data.length ? { ...data[0] } : {};

      const url = `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-seal/company/${
        obj.companyId
      }/batch-save/${obj.authType}?partnerTenant=${obj.parTenantId}`;

      // if (obj.authType === 'ESIGN') {
      //   url = `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/seal/company/${
      //     obj.companyId
      //   }/batch-save/${obj.authType}?partnerTenant=${obj.parTenantId}`;
      // }

      return {
        url,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  selection: 'single',
  primaryKey: 'signSealEmployeeId',
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signCode`).d('印章编码'),
      name: 'sealCode',
      type: 'string',
      required: true,
      format: 'uppercase',
      maxLength: 13,
      pattern: /^[A-Z|\d]+$/,
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signName`).d('印章名称'),
      name: 'sealName',
      type: 'string',
      required: true,
    },
    {
      // label: intl.get(`spfm.buyerElectronicSign.model.templateType`).d('模板类型'),
      name: 'attachmentUuid',
      type: 'attachment',
      accept: ['.png', '.jpg'],
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-sign',
      listType: 'picture-card',
      max: 1,
      // required: true,
      dynamicProps: {
        help: ({ record }) => {
          const sealType = record.get('sealType');
          return sealType === 'FDD'
            ? intl
                .get(`spfm.buyerElectronicSign.model.fddUploadMsg`)
                .d('图片只支持png和jpg格式，不能大于2MB')
            : intl
                .get(`spfm.buyerElectronicSign.model.eSignUploadMsg`)
                .d('图片只支持png和jpg格式，不能大于50KB');
        },
        fileSize: ({ record }) => {
          const sealType = record.get('sealType');
          return sealType === 'FDD' ? 2 * 1024 * 1024 : 50 * 1024;
        },
      },
    },
    {
      name: 'sealType',
    },
    {
      name: 'sealFileUrl',
    },
    {
      name: 'enabledFlag',
    },
    {
      name: 'parTenantId',
    },
    {
      name: 'attachmentUuid',
    },
  ],
  events: {},
});

/**
 * 穿梭框 DS
 * @returns
 */
const TransferDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/company-user-impowers/${
          data.companyId
        }`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.name`).d('实名姓名'),
      name: 'textName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 易签宝、法大大非saas类型成员管理 DS
 * @returns
 */
const NewMemberListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/company-user-impowers/${
          data.companyId
        }`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      const obj = data && data.length ? data[0] : {};
      return {
        // url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/company-user-impowers?partnerTenant=${
        //   obj.tenantId
        // }`,
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-user?partnerTenant=${
          obj.tenantId
        }`,
        data,
        method: 'DELETE',
      };
    },
  },
  pageSize: 20,
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.realAuthStatus`).d('实名认证状态'),
      name: 'userAuthStatus',
      type: 'string',
      lookupCode: 'SPFM.REALNAME_AUTH_STATUS',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.subAccount`).d('子账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.subAccountName`).d('子账号名称'),
      name: 'realName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.realAuthName`).d('实名姓名'),
      name: 'authName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.realPhoneNumber`).d('实名手机号'),
      name: 'bankPhoneNum',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.addUserTime`).d('添加成员时间'),
      name: 'creationDate',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 公司基础信息 Form DS
 * @returns
 */
const OldRouteDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-ca/detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyCode`).d('公司编码'),
      name: 'companyNum',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      // label: intl.get(`spfm.buyerElectronicSign.model.socialCreditCode`).d('统一社会信用代码'),
      name: 'organCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signType`).d('电签服务'),
      name: 'authType',
      type: 'string',
      lookupCode: 'SPFM.PERSON_AUTH_PRODUCT_VERSION',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authStatus`).d('认证状态'),
      name: 'caAuthStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authTime`).d('认证时间'),
      name: 'authenticateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizeStatus`).d('授权状态'),
      name: 'certificateStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedTime`).d('授权时间'),
      name: 'certificateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.isEnabled`).d('是否启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  events: {},
});

/**
 * 公司基础信息 Form DS
 * @returns
 */
const BankFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-ca/detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.accountName`).d('账户名称'),
      name: 'accountNameEn',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.collectingBank`).d('收报行'),
      name: 'bankNameEn',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.bankAccount`).d('银行账号'),
      name: 'accountNo',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.remittanceCode`).d('国际汇款代码'),
      name: 'switchCode',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 公司基础信息 Form DS
 * @returns
 */
const BankDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration-company-ca/detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyCode`).d('公司编码'),
      name: 'companyNum',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get('spfm.supplierElectronicSign.view.title.registerNo').d('企业注册登记号/税号'),
      name: 'registerNumber',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.signType`).d('电签服务'),
      name: 'authType',
      type: 'string',
      lookupCode: 'SPFM.PERSON_AUTH_PRODUCT_VERSION',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authStatus`).d('认证状态'),
      name: 'caAuthStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authTime`).d('认证时间'),
      name: 'authenticateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizeStatus`).d('授权状态'),
      name: 'certificateStatus',
      type: 'string',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.authorizedTime`).d('授权时间'),
      name: 'certificateTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`spfm.buyerElectronicSign.model.isEnabled`).d('是否启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  events: {},
});

export {
  ListDS,
  BasicFormDS,
  MemberListDS,
  SignListDS,
  GenerateFormDS,
  SignAttachDS,
  TransferDS,
  NewMemberListDS,
  OldRouteDetailDS,
  BankFormDS,
  BankDetailDS,
};
