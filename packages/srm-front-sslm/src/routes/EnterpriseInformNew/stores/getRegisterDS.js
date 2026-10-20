/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, PRIVATE_BUCKET, SRM_PLATFORM } from '_utils/config';
import { NOT_CHINA_PHONE, PHONE, EMAIL } from 'utils/regExp';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

// 处理必输
const getRequired = ({ dataSet, isAllPlatform = false } = {}) => {
  const { reqStatus } = dataSet.getState('dsState') || {};
  return ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(reqStatus) && isAllPlatform;
};

// 0-境外，1-境内，2-个人，ds需要依赖domesticForeignRelation，不好拆分
export const getRegisterDS = ({
  isAllPlatform = false,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  forceValidate: true,
  paging: false,
  dataKey: readOnlyFlag && isAllPlatform ? 'newBasic' : null,
  fields: [
    {
      name: 'domesticForeignRelation',
      lookupCode: 'SSLM.CERTIFICATION_AREA',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
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
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
      computedProps: {
        disabled: ({ record }) => Boolean(record.getPristineValue('certificationRegionId')),
        required: ({ dataSet, record }) =>
          dataSet.getState('isEdit') &&
          !record.getPristineValue('certificationRegionId') &&
          record.get('certificationType') !== '2',
      },
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
        required: ({ dataSet }) => getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'shortName',
      type: 'intl',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.shortName').d('企业简称'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
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
      type: 'intl',
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
        .d('法定代表人/负责人'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
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
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
        .d('机构类型'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 1 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'companyType',
      lookupCode: 'HPFM.COMPANY_TYPE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.companyType').d('企业类型'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 1 &&
          getRequired({ dataSet, isAllPlatform }) &&
          record.get('institutionalType') === 'ICBC',
        disabled: ({ dataSet, record }) =>
          !getRequired({ dataSet, isAllPlatform }) || record.get('institutionalType') !== 'ICBC',
      },
    },
    {
      name: 'registeredCountryId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2
            ? !getRequired({ dataSet, isAllPlatform })
            : true,
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
      label: intl
        .get('sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas')
        .d('省/市/区'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          !!getRequired({ dataSet, isAllPlatform }) && record.get('registeredCountryCode') === 'CN',
        disabled: ({ dataSet }) => {
          const { reqStatus, writePlatformFlag = false } = dataSet.getState('dsState') || {};
          const editFlag =
            ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(reqStatus) &&
            (isAllPlatform || !!writePlatformFlag);
          return !editFlag;
        },
      },
      validator: (value, name, record) => {
        const { registeredCountryCode, quickIndex, isLeaf = true, registeredRegionId } = record.get(
          ['registeredCountryCode', 'quickIndex', 'isLeaf', 'registeredRegionId']
        );
        if (registeredCountryCode === 'CN' || quickIndex === 'CN') {
          if (!isLeaf && registeredRegionId) {
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
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === 2
            ? intl.get('sslm.enterpriseInform.model.personal.addressDetail').d('联系地址')
            : intl
                .get('sslm.enterpriseInform.view.model.companyInfo.registeredAddress')
                .d('注册地址'),
        required: ({ dataSet }) => getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'registeredCapital',
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.regCapital').d('注册资本(万)'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
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
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
      transformRequest: value => value && value.currencyCode,
      transformResponse: (value, data) => {
        const { currencyCode, currencyName } = data;
        return value
          ? {
              currencyCode,
              currencyName,
            }
          : {
              currencyCode: 'CNY',
              currencyName: intl.get('hzero.common.currency.cny').d('人民币'),
            };
      },
    },
    {
      name: 'currencyName',
      bind: 'currencyCode.currencyName',
    },
    {
      name: 'taxpayerType',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.view.model.companyInfo.taxpayerType').d('纳税人标识'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 1 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'buildDate',
      type: 'date',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') !== 2
            ? intl.get('sslm.enterpriseInform.view.model.companyInfo.buildDate').d('成立日期')
            : intl.get('sslm.enterpriseInform.model.personal.validFrom').d('证件有效期从'),
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') !== 2 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
      transformRequest: value => value && value.format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'licenceEndDate',
      type: 'date',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') !== 2
            ? intl.get('sslm.enterpriseInform.view.registInform.businessTerm').d('营业期限')
            : intl.get('sslm.enterpriseInform.model.personal.validTo').d('证件有效期至'),
        required: ({ record }) =>
          record.get('domesticForeignRelation') === 1 && !record.get('longTermFlag'),
        disabled: ({ dataSet, record }) =>
          !getRequired({ dataSet, isAllPlatform }) || record.get('longTermFlag'),
        min: ({ record }) => (record.get('domesticForeignRelation') === 1 ? 'buildDate' : null),
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
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'businessScope',
      label: intl.get('sslm.enterpriseInform.view.registInform.businessScope').d('经营范围'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'licenceUrl',
      dynamicProps: {
        label: ({ record }) =>
          record.get('domesticForeignRelation') === 1
            ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
            : intl.get('spfm.enterprise.view.message.registrationCertificate').d('企业登记证件'),
        required: ({ record, dataSet }) =>
          record.get('domesticForeignRelation') === 1 && getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'idType',
      lookupCode: 'SPFM.ID_TYPE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.model.personal.certificateType').d('证件类型'),
      disabled: true,
    },
    {
      name: 'idNum',
      disabled: true,
      dynamicProps: {
        label: ({ record }) =>
          record.get('idType') === 'I'
            ? intl.get('sslm.enterpriseInform.model.personal.idNum').d('身份证号')
            : intl.get('sslm.enterpriseInform.model.personal.passport').d('护照号/通行证号'),
      },
      transformResponse: (value, data) => {
        const { idType, idNum, passport } = data;
        const newValue = idType === 'I' ? idNum : passport;
        return newValue;
      },
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.common.model.phone.internationalTelCode').d('国别码'),
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'phone',
      label: intl.get('sslm.enterpriseInform.model.personal.mobilePhone').d('手机号'),
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('domesticForeignRelation') === 2 && getRequired({ dataSet, isAllPlatform }),
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'email',
      label: intl.get('sslm.enterpriseInform.model.personal.email').d('邮箱'),
      pattern: EMAIL,
      dynamicProps: {
        disabled: ({ dataSet }) => !getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'idFrontUuid',
      label: intl.get('spfm.enterprise.message.personal.idCardPositive').d('身份证国徽面'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-comp',
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('idType') === 'I' && getRequired({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'idBackUuid',
      label: intl.get('spfm.enterprise.message.personal.idCardReverse').d('身份证人像面'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-comp',
      dynamicProps: {
        required: ({ dataSet, record }) =>
          record.get('idType') === 'I' && getRequired({ dataSet, isAllPlatform }),
      },
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
  events: {
    update: ({ record, name, value }) => {
      if (name === 'longTermFlag') {
        if (value) {
          record.set('licenceEndDate', undefined);
        }
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { changeReqId, companyId, partnerCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-basic-req/after/${changeReqId}`
        : `${SRM_SSLM}/v1/${organizationId}/sup-basic-req/after/${changeReqId}`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              dataSource: 1,
              supplierFlag: isAllPlatform ? 0 : 1,
              companyId,
              supplierCompanyId: partnerCompanyId,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
            },
          }
        : readUrlProps;
    },
  },
});
