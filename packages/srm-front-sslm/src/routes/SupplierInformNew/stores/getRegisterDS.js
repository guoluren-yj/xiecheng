/*
 * @Date: 2023-04-06 14:38:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

// 处理必输
const getRequired = ({ dataSet }) => {
  const { reqStatus, isSubdomainsRegister } = dataSet.getState('dsState') || {};
  return isSubdomainsRegister && ['NEW', 'REJECTED'].includes(reqStatus);
};

// 处理禁用
const getDisabled = ({ dataSet }) => {
  const { reqStatus, isSubdomainsRegister } = dataSet.getState('dsState') || {};
  return !isSubdomainsRegister || !['NEW', 'REJECTED'].includes(reqStatus);
};

// 0-境外，1-境内，2-个人，ds需要依赖domesticForeignRelation，不好拆分
export const getRegisterDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'domesticForeignRelation',
      lookupCode: 'SSLM.CERTIFICATION_AREA',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.address').d('认证地区'),
    },
    {
      name: 'certificationType',
      disabled: true,
      lookupCode: 'SSLM_CERTIFICATION_TYPE',
      label: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
    },
    {
      name: 'certificationRegionId',
      type: 'object',
      disabled: true,
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
      type: 'intl',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === 2
            ? intl.get('sslm.enterpriseInform.model.personal.name').d('姓名')
            : intl.get('sslm.enterpriseInform.view.model.companyInfo.companyName').d('企业名称'),
        required: ({ dataSet }) => getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'shortName',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.shortName').d('企业简称'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'unifiedSocialCode',
      disabled: true,
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.socialCode')
        .d('统一社会信用代码'),
    },
    {
      name: 'businessRegistrationNumber',
      disabled: true,
      label: intl
        .get('sslm.enterpriseInform.model.companyInfo.registrationNumber')
        .d('企业注册登记号/税号'),
    },
    {
      name: 'dunsCode',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'legalRepName',
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
        .d('法定代表人/负责人'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'organizingInstitutionCode',
      disabled: true,
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.organizingCode')
        .d('组织机构代码'),
    },
    {
      name: 'institutionalType',
      lookupCode: 'SPFM.INSTITUTION_TYPE',
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
        .d('机构类型'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 1 && getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'companyType',
      lookupCode: 'HPFM.COMPANY_TYPE',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.companyType').d('企业类型'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 1 &&
          getRequired({ dataSet }) &&
          record.get('institutionalType') === 'ICBC',
        disabled: ({ dataSet, record }) =>
          getDisabled({ dataSet }) || record.get('institutionalType') !== 'ICBC',
      },
    },
    {
      name: 'registeredCountryId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet }),
        disabled: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 ? getDisabled({ dataSet }) : true,
      },
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { registeredCountryId, registeredCountryCode, registeredCountryName } = data;
        return value
          ? {
              countryId: registeredCountryId,
              countryCode: registeredCountryCode,
              countryName: registeredCountryName,
            }
          : null;
      },
    },
    {
      name: 'registeredCountryCode',
      bind: 'registeredCountryId.countryCode',
    },
    {
      name: 'registeredCountryName',
      bind: 'registeredCountryId.countryName',
    },
    {
      name: 'regionPathName',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === 2
            ? intl.get('sslm.enterpriseInform.model.personal.registeredId').d('省市')
            : intl
                .get('sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas')
                .d('省/市/区'),
        required: ({ dataSet, record }) =>
          !getDisabled({ dataSet }) && record.get('registeredCountryCode') === 'CN',
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
        validator: ({ dataSet, record }) => {
          const disabled = getDisabled({ dataSet });
          const {
            registeredCountryCode,
            quickIndex,
            isLeaf = true,
            registeredRegionId,
          } = record.get(['registeredCountryCode', 'quickIndex', 'isLeaf', 'registeredRegionId']);
          if (registeredCountryCode === 'CN' || quickIndex === 'CN') {
            if (!isLeaf && registeredRegionId && !disabled) {
              // 可编辑状态下校验
              return intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区');
            }
            return true;
          }
          return true;
        },
      },
    },
    {
      name: 'addressDetail',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === 2
            ? intl.get('sslm.enterpriseInform.model.personal.addressDetail').d('联系地址')
            : intl
                .get('sslm.enterpriseInform.view.model.companyInfo.registeredAddress')
                .d('注册地址'),
        required: ({ dataSet }) => getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'registeredCapital',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.regCapital').d('注册资本(万)'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'currencyCode',
      type: 'object',
      lovCode: 'SPFM.CURRENCY',
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.currencyCode')
        .d('注册资本币种'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      transformRequest: value => value && value.currencyCode,
      transformResponse: (value, data) => {
        const { currencyCode, currencyName } = data;
        return value
          ? {
              currencyCode,
              currencyName,
            }
          : data.domesticForeignRelation !== 2
          ? {
              currencyCode: 'CNY',
              currencyName: intl.get('hzero.common.currency.cny').d('人民币'),
            }
          : null;
      },
    },
    {
      name: 'currencyName',
      bind: 'currencyCode.currencyName',
    },
    {
      name: 'taxpayerType',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.taxpayerType').d('纳税人标识'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 1 && getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.buildDate').d('成立日期'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'licenceEndDate',
      type: 'date',
      label: intl.get('sslm.enterpriseInform.view.registInform.businessTerm').d('营业期限'),
      dynamicProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === 1 && !record.get('longTermFlag'),
        disabled: ({ dataSet, record }) => getDisabled({ dataSet }) || record.get('longTermFlag'),
        min: ({ record, dataSet }) => {
          const { isSubdomainsRegister } = dataSet.getState('dsState') || {};
          const domesticForeignRelation = record.get('domesticForeignRelation');
          return domesticForeignRelation === 0 && isSubdomainsRegister ? null : 'buildDate';
        },
      },
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'longTermFlag',
      type: 'boolean',
      falseValue: 0,
      trueValue: 1,
      label: intl.get('sslm.enterpriseInform.view.message.longTerm').d('长期'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'businessScope',
      label: intl.get('sslm.enterpriseInform.view.registInform.businessScope').d('经营范围'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'licenceUrl',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === 1
            ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
            : intl.get('spfm.enterprise.view.message.registrationCertificate').d('企业登记证件'),
      },
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      label: intl.get('sslm.common.model.phone.internationalTelCode').d('国别码'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'phone',
      label: intl.get('sslm.enterpriseInform.model.personal.mobilePhone').d('手机号'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 2 && getRequired({ dataSet }),
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'email',
      label: intl.get('sslm.enterpriseInform.model.personal.email').d('邮箱'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId, companyId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-basic-req/after/${changeReqId}`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: [
            'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS',
            'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL',
          ].join(','),
        },
      };
    },
  },
});
