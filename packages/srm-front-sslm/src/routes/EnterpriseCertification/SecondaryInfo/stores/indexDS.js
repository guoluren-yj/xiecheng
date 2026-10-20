import moment from 'moment';
import { isEmpty, isArray, isNil, toString } from 'lodash';
import intl from 'utils/intl';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { HZERO_PLATFORM } from 'utils/config';
import { DataSet } from 'choerodon-ui/pro';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();

// 业务信息DS
const getBussinessDS = ({ requiredList = [], originConfig = false } = {}) => ({
  autoCreate: true,
  fields: [
    {
      name: 'businessType',
      type: 'string',
      // required: true,
      multiple: true,
      disabled: true,
      label: intl.get('spfm.enterprise.model.business.businessType').d('主要身份'),
      lookupCode: 'SPFM.MASTER.STATUS',
      help: intl
        .get('spfm.enterpriseCertification.view.business.interMessage')
        .d('如果您是采购方，请在完成认证后联系您的项目经理/运维经理申请权限'),
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
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.serviceType').d('经营性质'),
      lookupCode: 'SPFM.BUSINESS.NATURE',
      dynamicProps: {
        required: ({ dataSet }) => {
          return (
            dataSet.getState('domesticForeignRelation') !== 2 &&
            (requiredList.includes('serviceType') || originConfig)
          );
        },
      },
    },
    {
      name: 'industryReqList',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
      lovCode: 'HPFM.INDUSTRY_SECOND',
      type: 'object',
      dynamicProps: {
        required: ({ dataSet }) => {
          return (
            (dataSet.getState('domesticForeignRelation') !== 2 &&
              requiredList.includes('industryReqList')) ||
            originConfig
          );
        },
        lovPara: ({ dataSet }) => {
          const chinaFlag = dataSet.getState('chinaFlag');
          return {
            domesticFlag: chinaFlag,
          };
        },
      },
      transformRequest: value => {
        if (isEmpty(value)) {
          return [];
        } else {
          return value.map(i => i.industryId);
        }
      },
      transformResponse: (value, data) => {
        const { industryReqList } = data;
        if (isEmpty(industryReqList)) {
          return null;
        } else {
          const list = industryReqList.map(item => {
            const { industryId, industryName } = item;
            return {
              industryId,
              industryName,
            };
          });
          return list;
        }
      },
    },
    {
      name: 'industryCategoryReqList',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
      lovCode: 'HPFM.INDUSTRY.CATEGORY',
      type: 'object',
      dynamicProps: {
        disabled: ({ record }) => {
          const disabledFlag = isEmpty(record.get('industryReqList'));
          return disabledFlag;
        },
        required: ({ dataSet }) => {
          return (
            (dataSet.getState('domesticForeignRelation') !== 2 &&
              requiredList.includes('industryCategoryReqList')) ||
            originConfig
          );
        },
        lovPara: ({ record }) => {
          const industryReqList = record.get('industryReqList');
          const toStr = isEmpty(industryReqList)
            ? null
            : industryReqList.map(i => i.industryId).join(',');
          return {
            industryIds: toStr,
          };
        },
      },
      transformRequest: value => {
        if (isEmpty(value)) {
          return [];
        } else {
          return value.map(i => i.categoryId);
        }
      },
      transformResponse: (value, data) => {
        const { industryCategoryReqList } = data;
        if (isEmpty(industryCategoryReqList)) {
          return null;
        } else {
          const list = industryCategoryReqList.map(item => {
            const { industryCategoryId, categoryName } = item;
            return {
              categoryId: industryCategoryId,
              categoryName,
            };
          });
          return list;
        }
      },
    },
    {
      name: 'serviceAreaReqList',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围'),
      type: 'string',
      lookupCode: 'SPFM.COMPANY.SERVICE_AREA',
      dynamicProps: {
        required: ({ dataSet }) => {
          return (
            (dataSet.getState('domesticForeignRelation') !== 2 &&
              requiredList.includes('serviceAreaReqList')) ||
            originConfig
          );
        },
      },
      transformRequest: value => {
        if (isEmpty(value)) {
          return null;
        } else {
          return value;
        }
      },
      transformResponse: (value, data) => {
        const { serviceAreaReqList } = data;
        if (isEmpty(serviceAreaReqList)) {
          return null;
        } else {
          return serviceAreaReqList.map(i => i.serviceAreaCode);
        }
      },
    },
    {
      name: 'website',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.website').d('公司官网'),
      dynamicProps: {
        required: ({ dataSet }) => {
          return (
            dataSet.getState('domesticForeignRelation') !== 2 && requiredList.includes('website')
          );
        },
      },
    },
    {
      name: 'logoUrl',
      dynamicProps: {
        required: ({ dataSet }) => {
          return (
            dataSet.getState('domesticForeignRelation') !== 2 && requiredList.includes('logoUrl')
          );
        },
      },
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.description').d('公司简介'),
      dynamicProps: {
        required: ({ dataSet }) => {
          return (
            dataSet.getState('domesticForeignRelation') !== 2 &&
            requiredList.includes('description')
          );
        },
      },
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

// 联系人DS
const getContactDS = ({ requiredList = [], originConfig = false, enableList = [] } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'name',
      type: 'string',
      required: requiredList.includes('name') || originConfig,
      label: intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名'),
    },
    {
      name: 'gender',
      type: 'string',
      lookupCode: 'HPFM.GENDER',
      required: requiredList.includes('gender') || originConfig,
      label: intl.get('spfm.contactPerson.model.contactPerson.gender').d('性别'),
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      required: requiredList.includes('idType') || originConfig,
      label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
    },
    {
      name: 'idNum',
      type: 'secret',
      required: requiredList.includes('idNum') || originConfig,
      label: intl.get('spfm.contactPerson.model.contactPerson.idNum').d('证件号码'),
      pattern: enableList.includes('idNum') ? /^[0-9A-Za-z]*$/ : null,
    },
    {
      name: 'contactType',
      type: 'string',
      lookupCode: 'SSLM.CONTACT_TYPE',
      required: requiredList.includes('contactType') || originConfig,
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.contactType').d('联系人类型'),
    },
    {
      name: 'internationalTelCode',
      required: requiredList.includes('mobilephone') || originConfig,
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'mail',
      required: requiredList.includes('mail') || originConfig,
      pattern: EMAIL,
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'mobilephone',
      type: 'tel',
      regionField: 'internationalTelCode',
      required: requiredList.includes('mobilephone') || originConfig,
      dynamicProps: ({ record }) => {
        return {
          pattern:
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
        };
      },
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
    {
      name: 'department',
      type: 'string',
      required: requiredList.includes('department'),
      label: intl.get('spfm.contactPerson.model.contactPerson.department').d('部门'),
    },
    {
      name: 'position',
      type: 'string',
      required: requiredList.includes('position'),
      label: intl.get('spfm.contactPerson.model.contactPerson.position').d('职位'),
    },
    {
      name: 'telephone',
      type: 'string',
      required: requiredList.includes('telephone'),
      maxLength: 30,
      label: intl.get('spfm.contactPerson.model.contactPerson.telephone').d('固定电话'),
    },
    {
      name: 'description',
      type: 'string',
      required: requiredList.includes('description'),
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.contactPerson.model.contactPerson.default').d('默认联系人'),
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasDefaultFlag = isEmpty(dataSet.toData());
          if (hasDefaultFlag) {
            return 1;
          }
          return 0;
        },
      },
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('spfm.contactPerson.model.contactPerson.enabled').d('启用'),
      computedProps: {
        disabled: ({ record }) => !!record.get('defaultFlag'),
      },
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/no-basic`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-contacts-reqs/delete`,
        method: 'DELETE',
        data,
        params,
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'defaultFlag') {
        if (value === 1) {
          record.set('enabledFlag', 1);
        }
      }
      if (name === 'internationalTelCode') {
        record.set('mobilephone', null);
      }
    },
  },
});

// 地址DS
const getAddressDS = ({ requiredList = [], originConfig = false, enableList = [] } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'countryObj',
      type: 'object',
      required: requiredList.includes('countryObj') || originConfig,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`spfm.address.model.address.countryId`).d('国家/地区'),
      ignore: 'always',
      noCache: true,
    },
    {
      name: 'countryId',
      type: 'string',
      bind: 'countryObj.countryId',
      required: requiredList.includes('countryObj') || originConfig,
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
      type: 'string',
      bind: 'countryObj.quickIndex',
    },
    {
      name: 'regionId',
      type: 'string',
      required: requiredList.includes('regionPathName'),
      label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
    },
    {
      name: 'regionPathName',
      readOnly: true,
      type: 'string',
      required: requiredList.includes('regionPathName'),
      label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
      validator: (value, name, record) => {
        const { countryCode, quickIndex, isLeaf = true, regionId } = record.get([
          'countryCode',
          'quickIndex',
          'isLeaf',
          'regionId',
        ]);
        if (countryCode === 'CN' || quickIndex === 'CN') {
          if (!isLeaf && regionId) {
            return intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区');
          }
          return true;
        }
        return true;
      },
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: requiredList.includes('addressDetail') || originConfig,
      label: intl.get(`spfm.address.model.address.businessAddress`).d('经营地址'),
    },
    {
      name: 'postCode',
      type: 'string',
      required: requiredList.includes('postCode'),
      label: intl.get(`spfm.address.model.address.postCode`).d('邮政编码'),
      computedProps: {
        pattern: ({ record }) => {
          const enableFlag = enableList.includes('postCode');
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (enableFlag && (countryCode === 'CN' || quickIndex === 'CN')) {
            return /^[0-9]*$/;
          } else {
            return null;
          }
        },
        minLength: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return 6;
          } else {
            return -Infinity;
          }
        },
        maxLength: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return 6;
          } else {
            return Infinity;
          }
        },
        defaultValidationMessages: ({ record }) => {
          const { countryCode, quickIndex } = record.get(['countryCode', 'quickIndex']);
          if (countryCode === 'CN' || quickIndex === 'CN') {
            return {
              tooShort: intl.get(`spfm.address.model.address.validate.postCode`).d('请输入6位数字'),
            };
          } else {
            return {};
          }
        },
      },
    },
    {
      name: 'description',
      type: 'string',
      required: requiredList.includes('description'),
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
  events: {
    update: ({ record, name }) => {
      if (name === 'countryObj') {
        record.set('regionId', null);
        record.set('regionPathName', null);
      }
    },
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/no-basic`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/delete`,
        method: 'DELETE',
        data,
        params,
      };
    },
  },
});

// 银行DS
const getBankInfoDS = ({ requiredList = [], originConfig = false } = {}) => ({
  dataToJSON: 'all',
  paging: false,
  fields: [
    {
      name: 'bankCountryObj',
      type: 'object',
      required: requiredList.includes('bankCountryObj') || originConfig,
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
      required: requiredList.includes('bankCountryObj') || originConfig,
    },
    {
      name: 'bankCountryName',
      type: 'string',
      bind: 'bankCountryObj.countryName',
      required: requiredList.includes('bankCountryObj'),
    },
    {
      name: 'bankFirmObj',
      required: requiredList.includes('bankFirmObj') || originConfig,
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      lovPara: { tenantId: organizationId },
      type: 'object',
      label: intl.get(`spfm.bank.model.bank.bankFirm`).d('联行行号'),
      ignore: 'always',
    },
    {
      name: 'bankFirm',
      required: requiredList.includes('bankFirmObj') || originConfig,
      type: 'string',
      bind: 'bankFirmObj.bankFirm',
    },
    {
      name: 'bankCode',
      required: requiredList.includes('bankCode') || originConfig,
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankCode',
      label: intl.get(`spfm.bank.model.bank.bankInternalCode`).d('银行（国际）代码'),
    },
    {
      name: 'bankName',
      required: requiredList.includes('bankName'),
      disabled: true,
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
      required: requiredList.includes('bankBranchName') || originConfig,
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankBranchName',
      label: intl.get(`spfm.bank.model.bank.bankBranchName`).d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      required: requiredList.includes('bankAccountName') || originConfig,
      type: 'string',
      label: intl.get(`spfm.bank.model.bank.bankAccountName`).d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      required: requiredList.includes('bankAccountNum') || originConfig,
      type: 'secret',
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      label: intl.get(`spfm.bank.model.bank.bankAccountNum`).d('银行账号'),
      defaultValidationMessages: {
        patternMismatch: intl
          .get('spfm.bank.view.validatioin.bankAccountNum')
          .d('银行账号应为数字，字母或"-@._,/"'),
      },
    },
    {
      name: 'accountNature',
      required: requiredList.includes('accountNature') || originConfig,
      lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
      label: intl.get(`spfm.bank.model.bank.accountNature`).d('账户性质'),
    },
    {
      name: 'accountPurpose',
      required: requiredList.includes('accountPurpose') || originConfig,
      lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
      label: intl.get(`spfm.bank.model.bank.accountPurpose`).d('账户用途'),
    },
    {
      name: 'currencyLov',
      required: requiredList.includes('currencyLov') || originConfig,
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
      required: requiredList.includes('paymentTypeLov') || originConfig,
      lovCode: 'SMDM.PAYMENT_TYPE',
      type: 'object',
      label: intl.get(`spfm.bank.model.bank.paymentType`).d('付款方式'),
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
      label: intl.get(`spfm.bank.model.bank.masterFlag`).d('主账号'),
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasDefaultFlag = isEmpty(dataSet.toData());
          if (hasDefaultFlag) {
            return 1;
          }
          return 0;
        },
      },
    },
    {
      name: 'remark',
      required: requiredList.includes('remark'),
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'intlBankAccountNum',
      required: requiredList.includes('intlBankAccountNum'),
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/no-basic`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/delete`,
        method: 'DELETE',
        data,
        params,
      };
    },
  },
});

// 开票DS
const getInvoiceDS = ({
  requiredList = [],
  originConfig = false,
  enableList = [],
  domesticForeignRelation,
} = {}) => ({
  fields: [
    {
      name: 'invoiceHeader',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头'),
      required: requiredList.includes('invoiceHeader') || originConfig,
      disabled: true,
    },
    {
      name: 'taxRegistrationNumber',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号'),
      // required: requiredList.includes('taxRegistrationNumber') || originConfig,
      required: domesticForeignRelation === 1,
    },
    {
      name: 'depositBank',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行'),
      required: requiredList.includes('depositBank') || originConfig,
    },
    {
      name: 'bankAccountNum',
      type: 'secret',
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      label: intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号'),
      required: requiredList.includes('bankAccountNum') || originConfig,
    },
    {
      name: 'taxRegistrationAddress',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationAddress').d('税务登记地址'),
      required: requiredList.includes('taxRegistrationAddress') || originConfig,
    },
    {
      name: 'taxRegistrationPhone',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationPhone').d('税务登记电话'),
      required: requiredList.includes('taxRegistrationPhone') || originConfig,
    },
    {
      name: 'receiveMail',
      type: 'string',
      pattern: enableList.includes('receiveMail') ? EMAIL : null,
      label: intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱'),
      required: requiredList.includes('receiveMail') || originConfig,
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      required: requiredList.includes('receivePhone') || originConfig,
    },
    {
      name: 'receivePhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      required: requiredList.includes('receivePhone') || originConfig,
      dynamicProps: ({ record }) => {
        return {
          pattern:
            enableList.includes('receivePhone') &&
            (record.get('internationalTelCode') || '+86') === '+86'
              ? PHONE
              : NOT_CHINA_PHONE,
        };
      },
      label: intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号'),
    },
    {
      name: 'receiver',
      type: 'string',
      required: requiredList.includes('receiver'),
      label: intl.get('sslm.common.model.invoice.taker').d('收票人'),
    },
    {
      name: 'receiveAddress',
      type: 'string',
      required: requiredList.includes('receiveAddress'),
      label: intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-invoice-reqs/all`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
          companyId: -1,
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

// 财务DS
const getFinanceDS = ({ requiredList = [], originConfig = false } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'year',
      type: 'string',
      required: requiredList.includes('year') || originConfig,
      pattern: /([1-9])([0-9]{3})/,
      label: intl.get('spfm.finance.model.financeInfo.year').d('年份'),
      maxLength: 4,
    },
    {
      name: 'currencyLov',
      label: intl.get('spfm.common.model.currency').d('币种'),
      type: 'object',
      required: requiredList.includes('currencyLov') || originConfig,
      lovCode: 'HPFM.CURRENCY',
      textField: 'currencyName',
      ignore: 'always',
    },
    {
      name: 'currencyId',
      required: requiredList.includes('currencyLov') || originConfig,
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.common.model.currency').d('币种'),
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'totalAssets',
      required: requiredList.includes('totalAssets') || originConfig,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.totalAssets').d('企业总资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'totalLiabilities',
      required: requiredList.includes('totalLiabilities') || originConfig,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.totalLiabilities').d('总负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentAssets',
      required: requiredList.includes('currentAssets') || originConfig,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.currentAssets').d('流动资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentLiabilities',
      required: requiredList.includes('currentLiabilities') || originConfig,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.currentLiabilities').d('流动负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'revenue',
      required: requiredList.includes('revenue') || originConfig,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.revenue').d('营业收入(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'netProfit',
      required: requiredList.includes('netProfit') || originConfig,
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
      required: requiredList.includes('remark'),
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/all`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          companyId: -1,
          dataSource: 4,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/delete`,
        method: 'DELETE',
        data,
        params,
      };
    },
  },
});

// 附件DS
const getAttachmentDS = ({ requiredList = [], originConfig = false, enableList = [] } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'attachmentTypeMerge',
      type: 'string',
      required: requiredList.includes('attachmentTypeMerge') || originConfig,
      label: intl.get('entity.attachment.type').d('附件类型'),
      textField: 'meaning',
      valueField: 'value',
      transformResponse: (value, record) => {
        const { attachmentType, subAttachment } = record;
        if (attachmentType && subAttachment) {
          return [attachmentType, subAttachment];
        } else {
          return value;
        }
      },
      options: optionDs,
      ignore: 'always',
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
      required: requiredList.includes('description'),
      label: intl.get('entity.attachment.description').d('附件描述'),
    },
    {
      name: 'endDate',
      type: 'date',
      required: requiredList.includes('endDate'),
      label: intl.get('spfm.attachment.model.attachment.endDate').d('文件到期日'),
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      computedProps: {
        required: ({ record }) =>
          !record.get('longEffectiveFlag') && enableList.includes('endDate'),
        disabled: ({ record }) => !!record.get('longEffectiveFlag'),
        min: ({ record }) => {
          const uploadDate = record.get('uploadDate');
          return moment(
            moment(uploadDate)
              .endOf('day')
              .valueOf() + 1
          );
        },
      },
    },
    {
      name: 'longEffectiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.supplierInform.model.attachment.longEffective').d('是否长期有效'),
      computedProps: {
        required: ({ record }) =>
          !record.get('endDate') && enableList.includes('longEffectiveFlag'),
      },
    },
    {
      name: 'uploadDate',
      type: 'date',
      required: requiredList.includes('uploadDate'),
      disabled: true,
      label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后上传时间'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      required: requiredList.includes('attachmentUuid'),
      label: intl.get('entity.attachment.upload').d('附件上传'),
    },
    {
      name: 'remark',
      required: requiredList.includes('remark'),
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/no-basic`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/delete`,
        method: 'DELETE',
        data,
        params,
      };
    },
  },
  events: {
    update: ({ value, record, name }) => {
      if (name === 'longEffectiveFlag') {
        if (value) {
          record.set({
            endDate: null,
          });
        }
      }
    },
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

const optionDs = new DataSet({
  childrenField: 'children',
  autoQuery: true,
  fields: [{ name: 'value', type: 'string' }, { name: 'meaning', type: 'string' }],
  transport: {
    read: () => {
      return {
        url: `${HZERO_PLATFORM}/v1/lovs/value/tree`,
        method: 'GET',
        params: {
          'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
          'SPFM.COMPANY.SUB_ATTACHMENT': 2,
        },
        data: {},
      };
    },
  },
});

// 其他补充信息DS
const getOtherInfoDS = ({ changeReqId } = {}) => ({
  autoCreate: true,
  fields: [],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-others/identify/getSupChangeOther`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
          customizeUnitCode: 'SSLM.ENTERPRISE_CERTIFICATION.SECONDARY_OTHER_INFO',
        },
      };
    },
  },
});

// 邀约信息DS
const getInviteInfoDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'levelTypeFlag',
      label: intl.get('sslm.common.model.field.groupLevel').d('集团级'),
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
      disabled: true,
    },
    // {
    //   name: 'autoPartnerFlag',
    //   type: 'string',
    //   label: intl.get('spfm.enterpriseCertification.model.invite.autoPartner').d('是否发送邀约'),
    //   lookupCode: 'HPFM.FLAG',
    // },
    {
      name: 'companyIds',
      type: 'object',
      label: intl.get('spfm.enterpriseCertification.model.invite.inviteCompany').d('邀约公司'),
      lovCode: 'SSLM.FESC.TENANT_COMPANY',
      noCache: true,
      multiple: true,
      textField: 'companyName',
      computedProps: {
        required: ({ record }) => {
          const { levelTypeFlag } = record.get(['levelTypeFlag']);
          // 公司级必填
          if (levelTypeFlag === '0') {
            return true;
          } else {
            return false;
          }
        },
        disabled: ({ record }) => {
          // 集团级不可编辑
          const { levelTypeFlag } = record.get(['levelTypeFlag']);
          return levelTypeFlag === '1';
        },
      },
      transformResponse: (value, data) => {
        const { companyList } = data;
        return companyList || [];
      },
      transformRequest: value => {
        if (!isEmpty(value)) {
          return isArray(value) ? value.map(n => n.companyId).join(',') : value;
        } else {
          return null;
        }
      },
    },
    {
      name: 'remark',
      label: intl.get('spfm.enterpriseCertification.model.invite.inviteRemark').d('邀约说明'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/${changeReqId}`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SSLM.ENTERPRISE_CERTIFICATION.INVIT_INFO',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export {
  getBussinessDS,
  getContactDS,
  getAddressDS,
  getBankInfoDS,
  getInvoiceDS,
  getFinanceDS,
  getAttachmentDS,
  getOtherInfoDS,
  getInviteInfoDS,
};
