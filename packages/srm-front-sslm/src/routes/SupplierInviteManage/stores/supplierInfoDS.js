import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

// 登记信息
const registerInfoDS = () => ({
  // autoCreate: true,
  fields: [
    {
      name: 'domesticForeignRelation',
      type: 'string',
      label: intl.get('spfm.supplierManage.view.message.registered.address').d('注册地址'),
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
    },
    {
      name: 'companyName',
      label: intl.get('entity.company.companyName').d('公司名称'),
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === '2'
            ? intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名')
            : intl.get('entity.company.companyName').d('公司名称'),
      },
    },
    {
      name: 'companyNum',
      label: intl.get(`spfm.disposeInvite.view.message.companyNum`).d('公司编码'),
    },
    {
      name: 'unifiedSocialCode',
      type: 'string',
      label: intl.get('spfm.enterprise.model.legal.unifiedSocialCode').d('统一社会信用代码号'),
    },
    {
      name: 'organizingInstitutionCode',
      type: 'string',
      label: intl.get('spfm.enterprise.model.legal.organizingInstitutionCode').d('组织机构代码'),
    },
    {
      name: 'dunsCode',
      type: 'string',
      label: intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'businessRegistrationNumber',
      type: 'string',
      label: intl
        .get('spfm.enterprise.model.legal.businessRegistrationNumber')
        .d('企业注册登记号/税号'),
    },
    {
      name: 'companyType',
      type: 'string',
      lookupCode: 'HPFM.COMPANY_TYPE',
      label: intl.get('spfm.enterprise.view.message.companyTypeMeaning').d('公司类型'),
    },
    {
      name: 'taxpayerType',
      type: 'string',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl.get('spfm.enterprise.model.legal.taxpayerType').d('纳税人标识'),
    },
    // {
    //   name: 'registeredCountryObj',
    //   type: 'object',
    //   lovCode: 'HPFM.COUNTRY',
    //   label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
    // },
    // {
    //   name: 'registeredCountryId',
    //   bind: 'registeredCountryObj.countryId',
    // },
    {
      name: 'registeredCountryName',
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
      // bind: 'registeredCountryObj.countryName',
    },
    // {
    //   name: 'registeredCountryCode',
    //   bind: 'registeredCountryObj.countryCode',
    // },
    {
      name: 'registeredRegionName',
      type: 'string',
      label: intl.get('spfm.enterprise.view.message.registeredRegionName').d('注册地址'),
    },
    {
      name: 'registeredRegionId',
      type: 'string',
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: true,
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === '2'
            ? intl.get('spfm.supplierRegister.model.legal.contactDetail').d('联系地址')
            : intl.get('spfm.enterprise.model.legal.addressDetail').d('详细地址'),
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
      label: intl.get('spfm.supplierRegister.model.legal.legalRepName').d('法定代表人/负责人'),
      // computedProps: {
      //   label: ({ record }) => {
      //     return record.get('domesticForeignRelation') === '1'
      //       ? intl.get('spfm.supplierRegister.model.legal.legalRepName').d('法定代表人/负责人')
      //       : intl.get('spfm.supplierRegister.model.legal.personName').d('负责人');
      //   },
      // },
    },
    {
      name: 'registeredCapital',
      type: 'number',
      label: intl.get('spfm.enterprise.model.legal.registeredCapitalW').d('注册资本(万)'),
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
    },
    // {
    //   name: 'currencyCode',
    //   bind: 'currencyObj.currencyCode',
    //   type: 'string',
    // },
    // {
    //   name: 'currencyName',
    //   bind: 'currencyObj.currencyName',
    //   type: 'string',
    // },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('spfm.enterprise.view.message.buildDate').d('成立日期'),
    },
    {
      name: 'licenceEndDate',
      type: 'date',
      label: intl.get('spfm.enterprise.view.message.licenceEndDate').d('营业期限'),
    },
    {
      name: 'longTermFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
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
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '2' &&
          record.get('registeredCountryCode') === 'CN',
      },
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
  ],
});

// 业务信息
const businessInfoDS = () => ({
  fields: [
    {
      name: 'businessType',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.businessType').d('主要身份'),
      lookupCode: 'SPFM.MASTER.STATUS',
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
      name: 'industryList',
      label: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
    },
    {
      name: 'industryCategoryList',
      label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
    },
    {
      name: 'serviceAreaList',
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

// 联系人信息
const contactInfoDS = () => ({
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
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'mail',
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'mobilephone',
      type: 'tel',
      regionField: 'internationalTelCode',
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
      label: intl.get('spfm.contactPerson.model.contactPerson.default').d('默认联系人'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.contactPerson.model.contactPerson.enabled').d('启用'),
    },
    {
      name: 'mobilephoneField',
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
  ],
});

// 附件DS
const attachmentDS = () => ({
  selection: false,
  paging: false,
  fields: [
    // {
    //   name: 'attachmentTypeMerge',
    //   type: 'string',
    //   required: true,
    //   label: intl.get('entity.attachment.type').d('附件类型'),
    //   textField: 'meaning',
    //   valueField: 'value',
    //   transformResponse: (value, record) => {
    //     const { attachmentType, subAttachment } = record;
    //     if (attachmentType && subAttachment) {
    //       return [attachmentType, subAttachment];
    //     } else {
    //       return value;
    //     }
    //   },
    //   options: optionDs,
    //   ignore: 'always',
    // },
    {
      label: intl.get('entity.attachment.type').d('附件类型'),
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
    },
    {
      name: 'uploadDate',
      type: 'date',
      required: true,
      disabled: true,
      label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后更新时间'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get('entity.attachment.upload').d('附件上传'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
});

export { registerInfoDS, businessInfoDS, contactInfoDS, attachmentDS };
