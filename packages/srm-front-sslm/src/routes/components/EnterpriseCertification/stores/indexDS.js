import moment from 'moment';
import intl from 'utils/intl';
import { round } from 'lodash';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();

// 登记信息DS
const getLegalDS = () => ({
  fields: [
    {
      name: 'domesticForeignRelation',
      type: 'string',
      label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      defaultValue: '1',
      disabled: true,
    },
    {
      name: 'certificationType',
      lookupCode: 'SSLM_CERTIFICATION_TYPE',
      label: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
    },
    {
      name: 'certificationRegionId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
      transformRequest: value => (value ? value.countryId : null),
      transformResponse: (value, data) =>
        value
          ? {
              countryId: data.certificationRegionId,
              countryName: data.certificationRegionIdMeaning,
            }
          : null,
    },
    {
      name: 'unifiedSocialCode',
      type: 'string',
      label: intl.get('spfm.enterprise.model.legal.unifiedSocialCode').d('统一社会信用代码号'),
      disabled: true,
    },
    {
      name: 'companyName',
      maxLength: 500,
      type: 'intl',
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.model.legal.companyName').d('企业名称')
            : intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名');
        },
      },
    },
    {
      name: 'companyNum',
      label: intl.get(`spfm.disposeInvite.view.message.companyNum`).d('公司编码'),
    },
    {
      name: 'dunsCode',
      type: 'string',
      pattern: /^[0-9]{9}$/,
      label: intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
      disabled: true,
    },
    {
      name: 'businessRegistrationNumber',
      type: 'string',
      label: intl
        .get('spfm.enterprise.model.legal.businessRegistrationNumber')
        .d('企业注册登记号/税号'),
      disabled: true,
    },
    {
      name: 'companyType',
      type: 'string',
      lookupCode: 'HPFM.COMPANY_TYPE',
      label: intl.get('spfm.enterprise.model.legal.companyType').d('企业类型'),
    },
    {
      name: 'taxpayerType',
      type: 'string',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl.get('spfm.enterprise.model.legal.taxpayerType').d('纳税人标识'),
    },
    {
      name: 'registeredCountryId',
      bind: 'registeredCountryObj.countryId',
    },
    {
      name: 'registeredCountryName',
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
    },
    {
      name: 'registeredRegionName',
      type: 'string',
      label: intl.get(`spfm.enterprise.model.legal.regionName`).d('省/市/区'),
    },
    {
      name: 'registeredRegionId',
      type: 'string',
    },
    {
      name: 'addressDetail',
      type: 'intl',
      label: intl.get('spfm.enterprise.view.message.registeredRegionName').d('注册地址'),
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.registeredRegionName').d('注册地址')
            : intl.get('spfm.supplierRegister.model.legal.contactDetail').d('联系地址');
        },
      },
    },
    {
      name: 'regionPathName',
      type: 'string',
      label: intl.get('spfm.enterprise.model.legal.registeredRegionId').d('省市地址'),
    },
    {
      name: 'legalRepName',
      type: 'string',
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') === '1'
            ? intl.get('spfm.supplierRegister.model.legal.legalRepName').d('法定代表人/负责人')
            : intl.get('spfm.supplierRegister.model.legal.personName').d('负责人');
        },
      },
    },
    {
      name: 'registeredCapital',
      type: 'number',
      step: language === 'en_US' ? 0.00000001 : 0.000001,
      min: 0,
      label: intl.get('spfm.enterprise.model.legal.registeredCapitalW').d('注册资本(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
      },
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
      type: 'string',
    },
    {
      name: 'buildDate',
      type: 'date',
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.buildDate').d('成立日期')
            : intl.get('spfm.supplierRegister.model.legal.effectiveDateFrom').d('证件有效期从');
        },
      },
    },
    {
      name: 'licenceEndDate',
      min: 'buildDate',
      type: 'date',
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.licenceEndDate').d('营业期限')
            : intl.get('spfm.supplierRegister.model.legal.effectiveDateTo').d('证件有效期至');
        },
      },
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'longTermFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('spfm.enterprise.view.message.longTerm').d('长期'),
    },
    {
      name: 'businessScope',
      type: 'string',
      label: intl.get('spfm.enterprise.view.message.businessScope').d('经营范围'),
    },
    {
      name: 'licenceUrl',
      type: 'string',
      label: intl.get('spfm.enterprise.view.message.businessLicense').d('上传营业执照'),
    },
    {
      name: 'institutionalType',
      type: 'string',
      lookupCode: 'SPFM.INSTITUTION_TYPE',
      label: intl.get('spfm.supplierRegister.model.legal.institutionalType').d('机构类型'),
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
      computedProps: {
        disabled: ({ record }) => record.get('registeredCountryCode') === 'CN',
      },
      defaultValue: 'I',
    },
    {
      name: 'idNum',
      label: intl.get('hzero.common.model.identityNum').d('身份证号'),
    },
    {
      name: 'passport',
      label: intl.get('spfm.supplierRegister.model.legal.passportNum').d('护照号/通行证号'),
    },
    {
      name: 'email',
      pattern: EMAIL,
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'phone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
    {
      name: 'idFrontUuid',
      label: intl.get('spfm.supplierRegister.view.title.nationalEmblem').d('身份证国徽面'),
    },
    {
      name: 'idBackUuid',
      label: intl.get('spfm.supplierRegister.view.title.portraitFace').d('身份证人像面'),
    },
    {
      name: 'localName',
      label: intl.get('sslm.common.model.field.localName').d('企业本土名称'),
    },
    {
      name: 'localAddress',
      label: intl.get('sslm.common.model.field.localAddress').d('企业本土地址'),
    },
  ],
});

// 业务信息DS
const getBussinessDS = () => ({
  fields: [
    {
      name: 'businessType',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.businessType').d('主要身份'),
      lookupCode: 'SPFM.MASTER.STATUS',
      defaultValue: 'sale',
    },
    {
      name: 'interBusinessShield',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get(`spfm.enterprise.model.message.interBusinessShield`)
        .d('不允许其他企业找到我'),
    },
    {
      name: 'serviceType',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.serviceType').d('经营性质'),
      lookupCode: 'SPFM.BUSINESS.NATURE',
    },
    {
      name: 'industryReqList',
      label: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
    },
    {
      name: 'industryCategoryReqList',
      label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
    },
    {
      name: 'serviceAreaReqList',
      label: intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围'),
    },
    {
      name: 'website',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.website').d('公司官网'),
    },
    {
      name: 'logoUrl',
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.description').d('公司简介'),
    },
  ],
});

// 联系人DS
const getContactDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'name',
      type: 'string',
      label: intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名'),
    },
    {
      name: 'gender',
      type: 'string',
      lookupCode: 'HPFM.GENDER',
      label: intl.get('spfm.contactPerson.model.contactPerson.gender').d('性别'),
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
    },
    {
      name: 'idNum',
      type: 'secret',
      label: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
      pattern: /^[0-9A-Za-z]*$/,
    },
    {
      name: 'contactType',
      type: 'string',
      lookupCode: 'SSLM.CONTACT_TYPE',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.contactType').d('联系人类型'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'mail',
      pattern: EMAIL,
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'mobilephone',
      type: 'tel',
      regionField: 'internationalTelCode',
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
    {
      name: 'department',
      type: 'string',
      label: intl.get('spfm.contactPerson.model.contactPerson.department').d('部门'),
    },
    {
      name: 'position',
      type: 'string',
      label: intl.get('spfm.contactPerson.model.contactPerson.position').d('职位'),
    },
    {
      name: 'telephone',
      type: 'string',
      maxLength: 30,
      label: intl.get('spfm.contactPerson.model.contactPerson.telephone').d('固定电话'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('spfm.contactPerson.model.contactPerson.default').d('默认联系人'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('spfm.contactPerson.model.contactPerson.enabled').d('启用'),
    },
  ],
});

// 地址DS
const getAddressDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'countryObj',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`spfm.address.model.address.countryId`).d('国家/地区'),
      ignore: 'always',
    },
    {
      name: 'countryId',
      type: 'string',
      bind: 'countryObj.countryId',
    },
    {
      name: 'countryCode',
      type: 'string',
      bind: 'countryObj.countryCode',
    },
    {
      name: 'countryName',
      type: 'string',
      bind: 'countryObj.countryName',
    },
    {
      name: 'quickIndex',
      bind: 'countryLov.quickIndex',
    },
    {
      name: 'regionId',
      type: 'string',
      label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
    },
    {
      name: 'regionPathName',
      readOnly: true,
      type: 'string',
      label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
    },
    {
      name: 'addressDetail',
      type: 'intl',
      label: intl.get(`spfm.address.model.address.businessAddress`).d('经营地址'),
    },
    {
      name: 'postCode',
      type: 'string',
      pattern: /^\d{2,8}$|^[A-Z][A-Z0-9]{0,8}[- ]{0,1}[A-Z0-9]{1,8}$/,
      label: intl.get(`spfm.address.model.address.postCode`).d('邮政编码'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get(`spfm.address.model.address.description`).d('地址备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
});

// 银行DS
const getBankInfoDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'bankCountryObj',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`spfm.bank.model.bank.bankCountry`).d('国家/地区'),
      noCache: true,
      ignore: 'always',
    },
    {
      name: 'bankCountryId',
      type: 'string',
      bind: 'bankCountryObj.countryId',
    },
    {
      name: 'bankCountryName',
      type: 'string',
      bind: 'bankCountryObj.countryName',
    },
    {
      name: 'bankFirmObj',
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      lovPara: { tenantId: organizationId },
      type: 'object',
      label: intl.get(`spfm.bank.model.bank.bankFirm`).d('联行行号'),
      ignore: 'always',
    },
    {
      name: 'bankFirm',
      type: 'string',
      bind: 'bankFirmObj.bankFirm',
    },
    {
      name: 'bankCode',
      type: 'string',
      bind: 'bankFirmObj.bankCode',
      label: intl.get(`spfm.bank.model.bank.bankInternalCode`).d('银行（国际）代码'),
    },
    {
      name: 'bankName',
      type: 'string',
      bind: 'bankFirmObj.bankName',
      label: intl.get(`spfm.bank.model.bank.bankName`).d('银行名称'),
    },
    {
      name: 'bankId',
      type: 'string',
      bind: 'bankFirmObj.bankId',
    },
    {
      name: 'bankBranchId',
      type: 'string',
      bind: 'bankFirmObj.bankBranchId',
    },
    {
      name: 'bankBranchCode',
      type: 'string',
      bind: 'bankFirmObj.bankBranchCode',
    },
    {
      name: 'bankBranchName',
      type: 'string',
      bind: 'bankFirmObj.bankBranchName',
      label: intl.get(`spfm.bank.model.bank.bankBranchName`).d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      type: 'string',
      label: intl.get(`spfm.bank.model.bank.bankAccountName`).d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      type: 'secret',
      label: intl.get(`spfm.bank.model.bank.bankAccountNum`).d('银行账号'),
    },
    {
      name: 'accountNature',
      lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
      label: intl.get(`spfm.bank.model.bank.accountNature`).d('账户性质'),
    },
    {
      name: 'accountPurpose',
      lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
      label: intl.get(`spfm.bank.model.bank.accountPurpose`).d('账户用途'),
    },
    {
      name: 'currencyLov',
      lovCode: 'SMDM.CURRENCY_SQL',
      type: 'object',
      label: intl.get(`spfm.bank.model.bank.currencyName`).d('币种'),
      lovPara: { tenantId: organizationId },
      noCache: true,
    },
    {
      name: 'currencyId',
      type: 'string',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyCode',
      type: 'string',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyName',
      type: 'string',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'currencyIdMeaning',
      type: 'string',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'bankIdentifyCodeType',
      lookupCode: 'SPFM.BANK_IDENTIFY_CODE_TYPE',
      label: intl.get('sslm.common.model.bank.bankIdentifyCodeType').d('银行识别码类型'),
    },
    {
      name: 'bankIdentifyCode',
      label: intl.get('sslm.common.model.bank.bankIdentifyCode').d('银行识别码'),
      dynamicProps: {
        required: ({ record }) => Boolean(record.get('bankIdentifyCodeType')),
      },
    },
    {
      name: 'paymentTypeLov',
      lovCode: 'SMDM.PAYMENT_TYPE',
      type: 'object',
      label: intl.get(`spfm.bank.model.model.bank.paymentType`).d('付款方式'),
      lovPara: { tenantId: organizationId },
      noCache: true,
    },
    {
      name: 'paymentType',
      type: 'string',
      bind: 'paymentTypeLov.typeCode',
    },
    {
      name: 'paymentTypeId',
      type: 'string',
      bind: 'paymentTypeLov.typeId',
    },
    {
      name: 'paymentTypeIdMeaning',
      type: 'string',
      bind: 'paymentTypeLov.typeName',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'masterFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`spfm.bank.model.bank.masterFlag`).d('主账号'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'intlBankAccountNum',
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
  ],
});

// 开票DS
const getInvoiceDS = () => ({
  fields: [
    {
      name: 'invoiceHeader',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头'),
    },
    {
      name: 'taxRegistrationNumber',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号'),
    },
    {
      name: 'depositBank',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行'),
    },
    {
      name: 'bankAccountNum',
      type: 'secret',
      label: intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号'),
    },
    {
      name: 'taxRegistrationAddress',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationAddress').d('税务登记地址'),
    },
    {
      name: 'taxRegistrationPhone',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationPhone').d('税务登记电话'),
    },
    {
      name: 'receiveMail',
      type: 'string',
      pattern: EMAIL,
      label: intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'receivePhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号'),
    },
    {
      name: 'receiver',
      type: 'string',
      label: intl.get('sslm.common.model.invoice.taker').d('收票人'),
    },
    {
      name: 'receiveAddress',
      type: 'string',
      label: intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址'),
    },
  ],
});

// 财务DS
const getFinanceDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'year',
      type: 'string',
      pattern: /([1-9])([0-9]{3})/,
      label: intl.get('spfm.finance.model.financeInfo.year').d('年份'),
      maxLength: 4,
    },
    {
      name: 'currencyLov',
      label: intl.get('spfm.common.model.currency').d('币种'),
      type: 'object',
      lovCode: 'HPFM.CURRENCY',
      textField: 'currencyName',
      ignore: 'always',
    },
    {
      name: 'currencyId',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.common.model.currency').d('币种'),
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'totalAssets',
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.totalAssets').d('企业总资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'totalLiabilities',
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.totalLiabilities').d('总负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentAssets',
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.currentAssets').d('流动资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentLiabilities',
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.currentLiabilities').d('流动负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'revenue',
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.revenue').d('营业收入(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'netProfit',
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.netProfit').d('净利润(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'assetLiabilityRatio',
      type: 'string',
      label: intl.get('spfm.finance.model.financeInfo.assetLiabilityRatio').d('资产负债率'),
    },
    {
      name: 'currentRatio',
      type: 'string',
      label: intl.get('spfm.finance.model.financeInfo.currentRatio').d('流动比率'),
    },
    {
      name: 'totalAssetsEarningsRatio',
      type: 'string',
      label: intl.get('spfm.finance.model.financeInfo.totalAssetsEarningsRatio').d('总资产收益率'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
});

// 附件DS
const getAttachmentDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'attachmentTypeMerge',
      type: 'string',
      label: intl.get('entity.attachment.type').d('附件类型'),
      transformResponse: (value, record) => {
        const { attachmentTypeMeaning, subAttachmentMeaning } = record;
        if (attachmentTypeMeaning && subAttachmentMeaning) {
          return `${attachmentTypeMeaning}/${subAttachmentMeaning}`;
        } else {
          return attachmentTypeMeaning || subAttachmentMeaning;
        }
      },
    },
    {
      name: 'attachmentType',
      type: 'string',
    },
    {
      name: 'subAttachment',
      type: 'string',
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('entity.attachment.description').d('附件描述'),
    },
    {
      name: 'endDate',
      type: 'date',
      label: intl.get('spfm.attachment.model.attachment.endDate').d('文件到期日'),
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'longEffectiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
    },
    {
      name: 'uploadDate',
      type: 'date',
      label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后更新时间'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('entity.attachment.upload').d('附件上传'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
});

export {
  getLegalDS,
  getBussinessDS,
  getContactDS,
  getAddressDS,
  getBankInfoDS,
  getInvoiceDS,
  getFinanceDS,
  getAttachmentDS,
};
