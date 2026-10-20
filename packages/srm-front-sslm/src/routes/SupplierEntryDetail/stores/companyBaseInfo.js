import { SRM_PLATFORM, PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import moment from 'moment';
import { round } from 'lodash';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();

// function unifiedSocialCodeValidator(value) {
//   console.log(value);
//   const pattern = /^(?![A-Z]{18}$)[0-9A-Z]{18}$/;
//   if (value && !pattern.test(value)) {
//     return intl
//       .get('sslm.supplierEntryDetail.model.companyBaseForm.unifiedSocialCodeNewRule')
//       .d('由18位大写字母和数字混合组成,且不能是纯字母');
//   }
// }
const getCompanyBaseInfoDs = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'domesticForeignRelation',
      type: 'string',
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      // computedProps 使个性化配置不生效，dynamicProps 是使个性化配置生效
      computedProps: {
        disabled: () => true,
        required: () => false,
      },
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.domesticForeignRelation')
        .d('认证地区'),
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
        disabled: ({ record }) =>
          record.get('domesticForeignRelation') !== '0' ||
          Boolean(record.getPristineValue('certificationRegionId')),
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
      maxLength: 500,
      type: 'intl',
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('sslm.supplierEntryDetail.model.companyBaseForm.companyName').d('企业名称')
            : intl.get('sslm.supplierEntryDetail.model.companyBaseForm.name').d('姓名');
        },
        disabled: () => true,
        required: () => true,
      },
    },
    {
      name: 'unifiedSocialCode',
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.unifiedSocialCode')
        .d('统一社会信用代码'),
      computedProps: {
        pattern: ({ record }) =>
          record.get('domesticForeignRelation') === '1' ? /^(?![A-Z]{18}$)[0-9A-Z]{18}$/ : null,
        required: ({ record }) => record.get('domesticForeignRelation') === '1',
        // validator: ({ record }) => record.get('domesticForeignRelation') === '1' ? unifiedSocialCodeValidator : null,
        disabled: () => true,
      },
    },
    {
      name: 'dunsCode',
      type: 'string',
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '0' &&
          !record.get('businessRegistrationNumber'),
        disabled: () => true,
      },
      pattern: /^[0-9]{9}$/,
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'businessRegistrationNumber',
      type: 'string',
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '0' && !record.get('dunsCode'),
        disabled: () => true,
      },
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm..businessRegistrationNumber')
        .d('企业注册登记号/税号'),
    },
    {
      name: 'companyType',
      type: 'string',
      lookupCode: 'HPFM.COMPANY_TYPE',
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.companyType').d('企业类型'),
    },
    {
      name: 'taxpayerType',
      type: 'string',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.taxpayerType')
        .d('纳税人资质'),
      dynamicProps: {
        required: ({ record }) => record.get('domesticForeignRelation') === '1',
      },
    },
    {
      name: 'registeredCountryObj',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      ignore: 'always',
      required: true,
      noCache: true,
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.registeredCountry')
        .d('注册国家/地区'),
      dynamicProps: {
        disabled: ({ record }) => record.get('domesticForeignRelation') === '2',
      },
    },
    {
      name: 'registeredCountryId',
      bind: 'registeredCountryObj.countryId',
    },
    {
      name: 'registeredCountryName',
      bind: 'registeredCountryObj.countryName',
    },
    {
      name: 'registeredCountryCode',
      bind: 'registeredCountryObj.countryCode',
    },
    {
      name: 'regionPathName',
      type: 'string',
      readOnly: true,
      dynamicProps: {
        required: ({ record }) => record.get('registeredCountryCode') === 'CN',
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
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.ProvincialAndUrbanAreas')
        .d('省/市/区'),
    },
    {
      name: 'registeredRegionId',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => record.get('registeredCountryCode') === 'CN',
      },
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.ProvincialAndUrbanAreas')
        .d('省/市/区'),
    },
    {
      name: 'legalRepName',
      type: 'intl',
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') === '1'
            ? intl
                .get('sslm.supplierEntryDetail.model.companyBaseForm.legalRepName')
                .d('法定代表人/负责人')
            : intl.get('sslm.supplierEntryDetail.model.companyBaseForm.personName').d('负责人');
        },
        required: ({ record }) => record.get('domesticForeignRelation') !== '2',
      },
    },
    {
      name: 'institutionalType',
      type: 'string',
      lookupCode: 'SPFM.INSTITUTION_TYPE',
      dynamicProps: {
        required: ({ record }) => record.get('domesticForeignRelation') === '1',
      },
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.institutionalType')
        .d('机构类型'),
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: true,
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl
                .get('sslm.supplierEntryDetail.model.companyBaseForm.registeredAddress')
                .d('注册地址')
            : intl
                .get('sslm.supplierEntryDetail.model.companyBaseForm.contactDetail')
                .d('联系地址');
        },
      },
    },
    {
      name: 'registeredCapital',
      type: 'number',
      step: language === 'en_US' ? 0.00000001 : 0.000001,
      min: 0,
      dynamicProps: {
        required: ({ record }) => record.get('domesticForeignRelation') !== '2',
      },
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
      },
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.regCapital')
        .d('注册资本(万)'),
    },
    {
      name: 'currencyObj',
      type: 'object',
      lovCode: 'SPFM.CURRENCY',
      textField: 'currencyName',
      ignore: 'always',
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.currencyCode')
        .d('注册资本币种'),
      dynamicProps: {
        required: ({ record }) => record.get('domesticForeignRelation') !== '2',
      },
    },
    {
      name: 'currencyCode',
      bind: 'currencyObj.currencyCode',
      type: 'string',
      defaultValue: 'CNY',
    },
    {
      name: 'currencyName',
      bind: 'currencyObj.currencyName',
      type: 'string',
      defaultValue: intl.get('hzero.common.currency.cny').d('人民币'),
    },
    {
      name: 'buildDate',
      type: 'date',
      required: true,
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('sslm.supplierEntryDetail.model.companyBaseForm.buildDate').d('成立日期')
            : intl
                .get('sslm.supplierEntryDetail.model.companyBaseForm.effectiveDateFrom')
                .d('证件有效期从');
        },
        max: ({ record }) => {
          const currentData = moment().format(DEFAULT_DATE_FORMAT);
          const licenceEndDate = record.get('licenceEndDate');
          const minFlag = licenceEndDate
            ? moment(currentData).isBefore(licenceEndDate, 'day')
            : true;
          return minFlag ? currentData : 'licenceEndDate';
        },
      },
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.buildDate').d('成立日期'),
    },
    {
      name: 'licenceEndDate',
      min: 'buildDate',
      type: 'date',
      dynamicProps: {
        disabled: ({ record }) => {
          const disabled = !!record.get('longTermFlag');
          return disabled;
        },
        required: ({ record }) => {
          const required =
            ['1', '2'].includes(record.get('domesticForeignRelation')) &&
            !record.get('longTermFlag');
          return required;
        },
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl
                .get('sslm.supplierEntryDetail.model.companyBaseForm.licenceEndDate')
                .d('营业期限')
            : intl
                .get('sslm.supplierEntryDetail.model.companyBaseForm.effectiveDateTo')
                .d('证件有效期至');
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
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.longTermFlag').d('长期'),
    },
    {
      name: 'businessScope',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.businessScope').d('经营范围'),
    },
    {
      name: 'licenceUrl',
      type: 'string',
      // label: intl
      //   .get('sslm.supplierEntryDetail.model.companyBaseForm.businessLicense')
      //   .d('上传营业执照'),
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.idType').d('证件类型'),
      disabled: true,
      defaultValue: 'I',
    },
    {
      name: 'idNum',
      label: intl.get('hzero.common.model.identityNum').d('身份证号'),
      // pattern: IDENTITY_CARD,
      disabled: true,
    },
    {
      name: 'passport',
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.passportNum')
        .d('护照号/通行证号'),
      disabled: true,
      maxLength: 12,
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      dynamicProps: {
        disabled: ({ record }) => record.get('idNum'),
      },
      // label: intl
      //   .get('sslm.supplierEntryDetail.model.entryBaseForm.recInternationalTelCode')
      //   .d('国别码'),
    },
    {
      name: 'phone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.mobilephone').d('手机号码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('idNum'),
        pattern: ({ record }) =>
          (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '2' &&
          record.get('registeredCountryCode') === 'CN',
      },
    },
    {
      name: 'email',
      pattern: EMAIL,
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.mail').d('邮箱'),
    },
    {
      name: 'idFrontUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-comp',
      // label: intl
      //   .get('sslm.supplierEntryDetail.model.companyBaseForm.nationalEmblem')
      //   .d('身份证国徽面'),
    },
    {
      name: 'idBackUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spfm-comp',
      // label: intl
      //   .get('sslm.supplierEntryDetail.model.companyBaseForm.portraitFace')
      //   .d('身份证人像面'),
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
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-basic-req/after/${changeReqId}`,
        method: 'GET',
        data: {
          ...queryParams,
          ...other,
          changeReqId,
          dataSource: 3,
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

export { getCompanyBaseInfoDs };
