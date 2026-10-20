/*
 * @Date: 2024-08-09 09:19:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { round } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentLanguage } from 'utils/utils';

const language = getCurrentLanguage();

export const registerDS = () => ({
  fields: [
    {
      name: 'domesticForeignRelation',
      label: intl.get('sslm.supplierManage.model.supplierManage.ForeignRelation').d('认证地区'),
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
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
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.model.legal.companyName').d('企业名称')
            : intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名');
        },
      },
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('spfm.enterprise.model.legal.unifiedSocialCode').d('统一社会信用代码号'),
    },
    {
      name: 'organizingInstitutionCode',
      label: intl.get('sslm.common.modal.common.organizingCode').d('组织机构代码'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('sslm.supplierManage.model.supplierManage.businessRegistrationNumber')
        .d('商业注册登记号/税号'),
    },
    {
      name: 'dunsCode',
      label: intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'institutionalType',
      lookupCode: 'SPFM.INSTITUTION_TYPE',
      label: intl.get('spfm.supplierRegister.model.legal.institutionalType').d('机构类型'),
    },
    {
      name: 'companyType',
      lookupCode: 'HPFM.COMPANY_TYPE',
      label: intl.get('spfm.enterprise.model.legal.companyType').d('企业类型'),
    },
    {
      name: 'legalRepName',
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') === '1'
            ? intl.get('spfm.supplierRegister.model.legal.legalRepName').d('法定代表人/负责人')
            : intl.get('spfm.supplierRegister.model.legal.personName').d('负责人');
        },
      },
    },
    {
      name: 'idType',
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
      name: 'registeredCountryName',
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
    },
    {
      name: 'addressDetail',
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.registeredRegionName').d('注册地址')
            : intl.get('spfm.supplierRegister.model.legal.contactDetail').d('联系地址');
        },
      },
    },
    {
      name: 'registeredCapital',
      type: 'number',
      label: intl.get('spfm.enterprise.model.legal.registeredCapitalW').d('注册资本(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
      },
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
    },
    {
      name: 'taxpayerType',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl.get('spfm.enterprise.model.legal.taxpayerType').d('纳税人标识'),
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
      name: 'email',
      label: intl.get('spfm.contactPerson.model.contactPerson.mail').d('邮箱'),
    },
    {
      name: 'buildDate',
      type: 'date',
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.buildDate').d('成立日期')
            : intl.get('spfm.supplierRegister.model.legal.effectiveDateFrom').d('证件有效期从');
        },
      },
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'licenceEndDate',
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.licenceEndDate').d('营业期限')
            : intl.get('spfm.supplierRegister.model.legal.effectiveDateTo').d('证件有效期至');
        },
      },
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'businessScope',
      label: intl.get('spfm.enterprise.view.message.businessScope').d('经营范围'),
    },
    {
      name: 'licenceUrl',
      label: intl.get('spfm.enterprise.view.message.licenceFilename').d('查看营业执照'),
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
