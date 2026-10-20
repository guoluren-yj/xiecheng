/*
 * @Date: 2023-08-16 15:17:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getRegistrationInfoDS = ({ domesticForeignRelation }) => ({
  fields: [
    {
      name: 'domesticForeignRelation',
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.domeForeRelate').d('认证地区'),
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
      name: 'companyName',
      dynamicProps: {
        label: () =>
          domesticForeignRelation === 2
            ? intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名')
            : intl.get('sslm.supplierDetail.model.suDe.companyInfo.companyName').d('名称'),
      },
    },
    {
      name: 'unifiedSocialCode',
      label: intl
        .get('sslm.supplierDetail.model.suDe.companyInfo.unifiedSocialCode')
        .d('统一社会信用代码'),
    },
    {
      name: 'organizingInstitutionCode',
      label: intl.get('sslm.supplierDetail.model.companyInfo.organizingCode').d('组织机构代码'),
    },
    {
      name: 'dunsCode',
      label: intl.get('sslm.supplierDetail.model.companyInfo.dunsCode').d('邓白氏编码(DUNS)'),
    },
    {
      name: 'institutionalType',
      lookupCode: 'SPFM.INSTITUTION_TYPE',
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
        .d('机构类型'),
    },
    {
      name: 'companyType',
      lookupCode: 'HPFM.COMPANY_TYPE',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.enterpriseType').d('企业类型'),
    },
    {
      name: 'legalRepName',
      label: intl
        .get('sslm.supplierDetail.model.suDe.companyInfo.legalRepName')
        .d('法定代表人/负责人'),
    },
    {
      name: 'registeredCountryName',
      label: intl.get('sslm.supplierDetail.model.supplierDetail.countryName').d('注册国家'),
    },
    {
      name: 'registeredRegionName',
      dynamicProps: {
        label: () =>
          domesticForeignRelation === 2
            ? intl.get('sslm.enterpriseInform.model.personal.registeredId').d('省市')
            : intl
                .get('sslm.supplierDetail.model.suDe.companyInfo.ProvincialAndUrbanAreas')
                .d('省/市/区'),
      },
    },
    {
      name: 'addressDetail',
      dynamicProps: {
        label: () =>
          domesticForeignRelation === 2
            ? intl.get('sslm.enterpriseInform.model.personal.addressDetail').d('联系地址')
            : intl
                .get('sslm.supplierDetail.model.suDe.companyInfo.registeredAddress')
                .d('注册地址'),
      },
    },
    {
      name: 'registeredCapital',
      label: intl
        .get('sslm.supplierDetail.model.suDe.companyInfo.registeredCapital')
        .d('注册资本(万)'),
    },
    {
      name: 'currencyName',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.currencyCode').d('注册资本币种'),
    },
    {
      name: 'taxpayerType',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.taxpayerType').d('纳税人标识'),
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.buildDate').d('成立日期'),
    },
    {
      name: 'licenceEndDate',
      type: 'date',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.licenceEndDate').d('营业期限'),
    },
    {
      name: 'businessScope',
      label: intl.get('sslm.supplierDetail.model.suDe.companyInfo.businessScope').d('经营范围'),
    },
    {
      name: 'licenceUrl',
      label: intl.get('sslm.supplierDetail.model.companyInfo.businessLicense').d('营业执照'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('sslm.supplierDetail.model.suDe.companyInfo.registrationNum')
        .d('商业注册登记号/税号'),
    },
    {
      name: 'phone',
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.mobilephone').d('手机号码'),
    },
    {
      name: 'email',
      label: intl.get('sslm.common.model.company.email').d('邮箱'),
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
