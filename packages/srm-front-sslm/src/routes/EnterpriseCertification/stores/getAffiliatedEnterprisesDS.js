/*
 * @Date: 2022-06-15 19:17:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { IDENTITY_CARD, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { getDomesticForeignRelation } from '../utils';

const organizationId = getCurrentOrganizationId();
const isTenantLevel = organizationId !== 0;

const unifiedSocialCodeValidator = value => {
  const pattern = /^(?![A-Z]{18}$)[0-9A-Z]{18}$/;
  if (value && !pattern.test(value)) {
    return intl
      .get('sslm.supplierEntryDetail.model.companyBaseForm.unifiedSocialCodeNewRule')
      .d('由18位大写字母和数字混合组成,且不能是纯字母');
  }
};

// 企业信息ds
const getEnterprisesInfoDS = ({ isOcr = false } = {}) => ({
  autoCreate: true,
  fields: [
    {
      name: 'domesticForeignRelation',
      // required: true,
      type: 'string',
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      label: intl.get('spfm.enterpriseCertification.modal.enterprisesInfo.area').d('认证地区'),
      bind: 'companyNameObj.domesticForeignRelation',
      help: intl
        .get('sslm.supplierEntry.view.message.abroadTips')
        .d('港澳台及中国以外的其他国家的企业请选择境外录入信息'),
    },
    {
      name: 'certificationType',
      defaultValue: '1',
      required: isTenantLevel,
      disabled: !isTenantLevel,
      lookupCode: 'SSLM_CERTIFICATION_TYPE',
      label: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
    },
    {
      name: 'certificationRegionId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('spfm.enterpriseCertification.modal.enterprisesInfo.area').d('认证地区'),
      dynamicProps: {
        required: ({ record }) => record.get('certificationType') !== '2',
      },
      transformRequest: value => (value ? value.countryId : null),
      transformResponse: (value, data) =>
        value
          ? {
              countryId: data.certificationRegionId,
              countryCode: data.certificationRegionCode,
              countryName: data.certificationRegionIdMeaning,
            }
          : null,
    },
    // 拆分lov绑定，不然此字段是国际化组件，lov选的时候带出改字段会校验其他语言必填输入，导致点击保存校验不通过
    {
      name: 'companyName',
      // required: true,
      type: 'intl',
      label: intl.get('spfm.enterprise.model.legal.companyName').d('企业名称'),
      computedProps: {
        label: ({ record }) => {
          return getDomesticForeignRelation(record) !== '2'
            ? intl.get('spfm.enterprise.model.legal.companyName').d('企业名称')
            : intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名');
        },
        required: ({ dataSet }) => {
          const showLovFlag = dataSet.getState('showLovFlag');
          return !showLovFlag;
        },
      },
      transformRequest: (value, record) => {
        const companyNameObj = record.get('companyNameObj');
        // 当企业名字是lov组件时，取lov中的企业名称
        const { companyId, companyName } = companyNameObj || {};
        if (companyId) {
          return companyName;
        }
        return value;
      },
    },
    {
      name: 'companyNameObj',
      type: 'object',
      lovCode: 'SSLM.TENANT_COMPANY',
      noCache: true,
      required: true,
      label: intl.get('spfm.enterprise.model.legal.companyName').d('企业名称'),
      ignore: 'always',
    },
    // companyNameObj的显示字段，解决查看时lov框不展示企业名称问题
    {
      name: 'companyNameObjMeaning',
      bind: 'companyNameObj.companyName',
      ignore: 'always',
      transformResponse: (value, data) => {
        return data?.companyName;
      },
    },
    {
      name: 'unifiedSocialCode',
      bind: 'companyNameObj.unifiedSocialCode',
      label: intl
        .get('spfm.enterpriseCertification.modal.enterprisesInfo.unifiedSocialCode')
        .d('统一社会信用代码'),
      dynamicProps: ({ record }) => {
        const domesticForeignRelation = getDomesticForeignRelation(record);
        if (domesticForeignRelation === '1') {
          return {
            required: true,
            pattern: /^(?![A-Z]{18}$)[0-9A-Z]{18}$/,
            validator: unifiedSocialCodeValidator,
          };
        } else {
          return {};
        }
      },
    },
    {
      name: 'dunsCode',
      pattern: /^[0-9]{9}$/,
      label: intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
      dynamicProps: {
        required: ({ record }) =>
          getDomesticForeignRelation(record) === '0' && !record.get('businessRegistrationNumber'),
      },
      bind: 'companyNameObj.dunsCode',
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('spfm.enterpriseCertification.modal.enterprisesInfo.registNumber')
        .d('企业注册登记号/税号'),
      pattern: /^[-0-9A-Za-z]*$/,
      dynamicProps: {
        required: ({ record }) =>
          getDomesticForeignRelation(record) === '0' && !record.get('dunsCode'),
      },
      bind: 'companyNameObj.businessRegistrationNumber',
    },
    {
      label: intl.get(`spfm.enterprise.model.legal.legalPerson`).d('法定代表人'),
      name: 'legalRepName',
      // required: true,
      bind: 'companyNameObj.legalRepName',
      dynamicProps: {
        required: ({ record }) => getDomesticForeignRelation(record) === '1',
      },
    },
    {
      name: 'licenceUrl',
      required: isOcr,
    },
    {
      name: 'registeredCountryObj',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      ignore: 'always',
      noCache: true,
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
      dynamicProps: {
        required: ({ record }) => ['2'].includes(getDomesticForeignRelation(record)),
      },
    },
    {
      name: 'registeredCountryId',
      bind: 'registeredCountryObj.countryId',
      dynamicProps: {
        required: ({ record }) => ['2'].includes(getDomesticForeignRelation(record)),
      },
    },
    // {
    //   name: 'registeredCountryName',
    //   bind: 'registeredCountryObj.countryName',
    // },
    {
      name: 'registeredCountryIdMeaning',
      bind: 'registeredCountryObj.countryName',
    },
    {
      name: 'registeredCountryCode',
      bind: 'registeredCountryObj.countryCode',
    },
    {
      name: 'quickIndex',
      type: 'string',
      bind: 'registeredCountryObj.quickIndex',
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
      computedProps: {
        required: ({ record }) => getDomesticForeignRelation(record) === '2',
        disabled: ({ record }) => record.get('registeredCountryCode') === 'CN',
      },
      defaultValue: 'I',
    },
    {
      name: 'idNum',
      label: intl.get('hzero.common.model.identityNum').d('身份证号'),
      pattern: IDENTITY_CARD,
      computedProps: {
        required: ({ record }) =>
          getDomesticForeignRelation(record) === '2' && record.get('idType') === 'I',
      },
    },
    {
      name: 'passport',
      label: intl.get('spfm.supplierRegister.model.legal.passportNum').d('护照号/通行证号'),
      computedProps: {
        required: ({ record }) =>
          getDomesticForeignRelation(record) === '2' && record.get('idType') !== 'I',
      },
      maxLength: 12,
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      computedProps: {
        required: ({ record }) =>
          getDomesticForeignRelation(record) === '2' &&
          record.get('registeredCountryCode') === 'CN',
      },
    },
    {
      name: 'phone',
      dynamicProps: ({ record }) => {
        return {
          pattern:
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
          required:
            getDomesticForeignRelation(record) === '2' &&
            record.get('registeredCountryCode') === 'CN',
        };
      },
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/company-attestations`,
      method: 'GET',
      params: {},
    },
    submit: ({ data, dataSet }) => {
      const {
        unifiedSocialCode,
        dunsCode,
        businessRegistrationNumber,
        organizingInstitutionCode,
        // 个人注册字段
        registeredCountryId,
        registeredCountryIdMeaning,
        registeredCountryCode,
        quickIndex,
        idType,
        idNum,
        passport,
        internationalTelCode,
        phone,
        currencyCode,
        currencyName,
        ...others
      } = data[0];
      const record = dataSet?.current;
      const domesticForeignRelation = getDomesticForeignRelation(record);
      // 根据认证类型不同，只传对应的数据给后端
      let payload = {};
      if (Number(domesticForeignRelation) === 1) {
        payload = {
          ...others,
          unifiedSocialCode,
          organizingInstitutionCode,
        };
      } else if (Number(domesticForeignRelation) === 0) {
        payload = {
          ...others,
          registeredCountryId,
          registeredCountryIdMeaning,
          registeredCountryCode,
          quickIndex,
          dunsCode,
          businessRegistrationNumber,
        };
      } else {
        // 个人
        payload = {
          ...others,
          registeredCountryId,
          registeredCountryIdMeaning,
          registeredCountryCode,
          quickIndex,
          idType,
          idNum,
          passport,
          internationalTelCode,
          phone,
        };
      }
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/company-attestations`,
        method: 'POST',
        data: payload,
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
    update: ({ name, record }) => {
      switch (name) {
        case 'certificationType':
          record.set({
            certificationRegionId: null,
          });
          break;
        case 'certificationRegionId':
          record.set({
            legalRepName: null,
          });
          break;
        default:
          break;
      }
    },
  },
  feedback: {
    submitFailed: response => {
      getResponse(response);
    },
  },
});

const getEnterpriseVerifyFields = key => {
  switch (key) {
    case 'EMAIL':
      return [
        {
          name: 'email',
          required: true,
          type: 'email',
          label: intl.get('spfm.enterpriseCertification.modal.emailCheck.email').d('企业邮箱'),
        },
        {
          name: 'captcha',
          label: intl.get('hzero.common.model.verifyCode').d('验证码'),
        },
      ];
    case 'REMIT':
      return [
        {
          name: 'bankLov',
          required: true,
          type: 'object',
          ignore: 'always',
          lovCode: 'SPFM.BANK_BRANCH.SITE',
          label: intl.get(`spfm.bank.model.bank.bankBranchName`).d('开户行名称'),
          textField: 'subbranch',
          optionsProps: {
            pageSize: 20,
          },
          lovPara: {
            nullAbleFlag: 1, // 用于后端判断无查询条件时是否需要返回数据
          },
        },
        {
          name: 'bankName',
          required: true,
          disabled: true,
          bind: 'bankLov.bank',
          label: intl.get(`spfm.bank.model.bank.bankName`).d('银行名称'),
        },
        {
          name: 'bankBranchName',
          required: true,
          bind: 'bankLov.subbranch',
          label: intl.get(`spfm.bank.model.bank.bankBranchName`).d('开户行名称'),
        },
        {
          name: 'cnapsCode',
          bind: 'bankLov.cnapsCode',
        },
        {
          name: 'bankAccountNum',
          required: true,
          type: 'secret',
          pattern: /^[0-9A-Za-z-@._,/]*$/,
          label: intl.get(`spfm.bank.model.bank.bankAccountNum`).d('银行账号'),
        },
      ];
    default:
      return [
        {
          name: 'proposerName',
          required: true,
          label: intl
            .get('spfm.enterpriseCertification.model.manualCheck.proposerName')
            .d('申请人'),
        },
        {
          name: 'reason',
          label: intl.get('spfm.enterpriseCertification.model.manualCheck.reason').d('申请说明'),
        },
        {
          name: 'attachmentUuid',
          label: intl
            .get('spfm.enterpriseCertification.model.manualCheck.applyAttachment')
            .d('申请附件'),
          required: true,
          type: 'attachment',
        },
      ];
  }
};

// 企业验证ds
const getEnterpriseVerifyDS = key => ({
  fields: getEnterpriseVerifyFields(key),
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${organizationId}/company-attestations`,
      method: 'GET',
      params: {},
    },
  },
});

// 填写回款ds
const getFillReceivableDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'receivableAmount',
      type: 'number',
      required: true,
      label: intl.get('spfm.enterpriseCertification.modal.fillReceivable.amount').d('回款金额'),
    },
  ],
});

export { getEnterprisesInfoDS, getEnterpriseVerifyDS, getFillReceivableDS };
