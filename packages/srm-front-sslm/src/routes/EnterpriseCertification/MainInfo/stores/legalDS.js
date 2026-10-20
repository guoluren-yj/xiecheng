import moment from 'moment';
import { round } from 'lodash';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { IDENTITY_CARD, EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();

// 登记信息DS
const getLegalDS = ({ requiredList = [] } = {}) => ({
  fields: [
    {
      name: 'domesticForeignRelation',
      type: 'string',
      label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      defaultValue: '1',
      required: true,
      disabled: true,
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
      name: 'unifiedSocialCode',
      type: 'string',
      dynamicProps: ({ record }) => {
        if (record.get('domesticForeignRelation') === '1') {
          return {
            required: true,
            pattern: /^(?![A-Z]{18}$)[0-9A-Z]{18}$/,
            validator: unifiedSocialCodeValidator,
          };
        } else {
          return {};
        }
      },
      label: intl.get('spfm.enterprise.model.legal.unifiedSocialCode').d('统一社会信用代码号'),
      disabled: true,
    },
    {
      name: 'companyName',
      maxLength: 500,
      type: 'intl',
      required: true,
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.model.legal.companyName').d('企业名称')
            : intl.get('spfm.contactPerson.model.contactPerson.name').d('姓名');
        },
      },
      disabled: true,
    },
    {
      name: 'dunsCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '0' &&
          !record.get('businessRegistrationNumber'),
      },
      pattern: /^[0-9]{9}$/,
      label: intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
      disabled: true,
    },
    {
      name: 'businessRegistrationNumber',
      type: 'string',
      dynamicProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '0' && !record.get('dunsCode'),
      },
      label: intl
        .get('spfm.enterprise.model.legal.businessRegistrationNumber')
        .d('企业注册登记号/税号'),
      disabled: true,
    },
    {
      name: 'companyType',
      type: 'string',
      lookupCode: 'HPFM.COMPANY_TYPE',
      dynamicProps: ({ record }) => {
        return {
          required:
            record.get('domesticForeignRelation') === '1' &&
            record.get('institutionalType') === 'ICBC',
        };
      },
      label: intl.get('spfm.enterprise.model.legal.companyType').d('企业类型'),
    },
    {
      name: 'taxpayerType',
      type: 'string',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      dynamicProps: ({ record }) => {
        return {
          required: record.get('domesticForeignRelation') === '1',
        };
      },
      label: intl.get('spfm.enterprise.model.legal.taxpayerType').d('纳税人标识'),
      defaultValue: 'GT',
    },
    {
      name: 'registeredCountryObj',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      ignore: 'always',
      required: true,
      noCache: true,
      label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('domesticForeignRelation') === '2',
        };
      },
    },
    {
      name: 'registeredCountryId',
      bind: 'registeredCountryObj.countryId',
      required: true,
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
      name: 'quickIndex',
      type: 'string',
      bind: 'registeredCountryObj.quickIndex',
    },
    {
      name: 'regionPathName',
      type: 'string',
      readOnly: true,
      dynamicProps: ({ record }) => {
        return {
          required: record.get('registeredCountryCode') === 'CN',
        };
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
      label: intl.get('spfm.enterprise.model.legal.provincialAndUrbanAreas').d('省/市/区'),
    },
    {
      name: 'registeredRegionId',
      type: 'string',
      dynamicProps: ({ record }) => {
        return {
          required: record.get('registeredCountryCode') === 'CN',
        };
      },
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: true,
      label: intl.get('spfm.enterprise.model.legal.registeredAddress').d('注册地址'),
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.model.legal.registeredAddress').d('注册地址')
            : intl.get('spfm.supplierRegister.model.legal.contactDetail').d('联系地址');
        },
      },
    },
    {
      name: 'legalRepName',
      type: 'intl',
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') === '1'
            ? intl.get('spfm.supplierRegister.model.legal.legalRepName').d('法定代表人/负责人')
            : intl.get('spfm.supplierRegister.model.legal.personName').d('负责人');
        },
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '1' || requiredList.includes('legalRepName'),
      },
    },
    {
      name: 'registeredCapital',
      type: 'number',
      step: language === 'en_US' ? 0.00000001 : 0.000001,
      min: 0,
      label: intl.get('spfm.enterprise.model.legal.registeredCapitalW').d('注册资本(万)'),
      dynamicProps: ({ record }) => {
        return {
          required:
            record.get('domesticForeignRelation') === '1' ||
            requiredList.includes('registeredCapital'),
        };
      },
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
      },
    },
    {
      name: 'currencyObj',
      type: 'object',
      lovCode: 'SPFM.CURRENCY',
      textField: 'currencyName',
      ignore: 'always',
      label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
      dynamicProps: ({ record }) => {
        return {
          required:
            record.get('domesticForeignRelation') === '1' || requiredList.includes('currencyObj'),
        };
      },
    },
    {
      name: 'currencyCode',
      bind: 'currencyObj.currencyCode',
      type: 'string',
      defaultValue: 'CNY',
      dynamicProps: ({ record }) => {
        return {
          required:
            record.get('domesticForeignRelation') === '1' || requiredList.includes('currencyObj'),
        };
      },
    },
    {
      name: 'currencyName',
      bind: 'currencyObj.currencyName',
      type: 'string',
      defaultValue: intl.get('hzero.common.currency.cny').d('人民币'),
      dynamicProps: ({ record }) => {
        return {
          required:
            record.get('domesticForeignRelation') === '1' || requiredList.includes('currencyObj'),
        };
      },
    },
    {
      name: 'buildDate',
      type: 'date',
      required: true,
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      computedProps: {
        label: ({ record }) => {
          return record.get('domesticForeignRelation') !== '2'
            ? intl.get('spfm.enterprise.view.message.buildDate').d('成立日期')
            : intl.get('spfm.supplierRegister.model.legal.effectiveDateFrom').d('证件有效期从');
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
    },
    {
      name: 'licenceEndDate',
      min: 'buildDate',
      type: 'date',
      computedProps: {
        disabled: ({ record }) => {
          const disabled =
            (record.get('domesticForeignRelation') !== '2' && !!record.get('longTermFlag')) ||
            (record.get('domesticForeignRelation') === '2' && !!record.get('longTermFlag'));
          return disabled;
        },
        required: ({ record }) => {
          const required =
            (record.get('domesticForeignRelation') === '1' && !record.get('longTermFlag')) ||
            (record.get('domesticForeignRelation') === '2' && !record.get('longTermFlag'));
          return required;
        },
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
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '1' || requiredList.includes('businessScope'),
      },
    },
    {
      name: 'licenceUrl',
      type: 'string',
      dynamicProps: ({ record, dataSet }) => {
        // 营业执照隐藏时不必填
        const licenceUrlHidden = dataSet.getState('licenceUrlHidden');
        return {
          required:
            (record.get('domesticForeignRelation') === '1' && !licenceUrlHidden) ||
            (record.get('domesticForeignRelation') === '0' &&
              !licenceUrlHidden &&
              requiredList.includes('licenceUrl')),
        };
      },
      label: intl.get('spfm.enterprise.view.message.businessLicense').d('上传营业执照'),
    },
    {
      name: 'institutionalType',
      type: 'string',
      lookupCode: 'SPFM.INSTITUTION_TYPE',
      computedProps: {
        required: ({ record }) => record.get('domesticForeignRelation') === '1',
      },
      label: intl.get('spfm.supplierRegister.model.legal.institutionalType').d('机构类型'),
      defaultValue: 'ICBC',
    },
    {
      name: 'idType',
      type: 'string',
      lookupCode: 'SPFM.ID_TYPE',
      label: intl.get('spfm.contactPerson.model.contactPerson.idType').d('证件类型'),
      disabled: true,
      computedProps: {
        required: ({ record }) => record.get('domesticForeignRelation') === '2',
        // disabled: ({ record }) => record.get('registeredCountryCode') === 'CN',
      },
      defaultValue: 'I',
    },
    {
      name: 'idNum',
      label: intl.get('hzero.common.model.identityNum').d('身份证号'),
      pattern: IDENTITY_CARD,
      disabled: true,
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '2' && record.get('idType') === 'I',
      },
    },
    {
      name: 'passport',
      label: intl.get('spfm.supplierRegister.model.legal.passportNum').d('护照号/通行证号'),
      disabled: true,
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '2' && record.get('idType') !== 'I',
      },
      maxLength: 12,
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
      disabled: true,
      computedProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '2' &&
          record.get('registeredCountryCode') === 'CN',
      },
    },
    {
      name: 'phone',
      disabled: true,
      type: 'tel',
      regionField: 'internationalTelCode',
      dynamicProps: ({ record }) => {
        return {
          pattern:
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
          required:
            record.get('domesticForeignRelation') === '2' &&
            record.get('registeredCountryCode') === 'CN',
        };
      },
      label: intl.get('spfm.contactPerson.model.contactPerson.mobilephone').d('手机号码'),
    },
    {
      name: 'idFrontUuid',
      label: intl.get('spfm.supplierRegister.view.title.nationalEmblem').d('身份证国徽面'),
      dynamicProps: ({ record }) => {
        return {
          required: record.get('domesticForeignRelation') === '2' && record.get('idType') === 'I',
        };
      },
    },
    {
      name: 'idBackUuid',
      label: intl.get('spfm.supplierRegister.view.title.portraitFace').d('身份证人像面'),
      dynamicProps: ({ record }) => {
        return {
          required: record.get('domesticForeignRelation') === '2' && record.get('idType') === 'I',
        };
      },
    },
    {
      name: 'localName',
      required: requiredList.includes('localName'),
      label: intl.get('sslm.common.model.field.localName').d('企业本土名称'),
    },
    {
      name: 'localAddress',
      required: requiredList.includes('localAddress'),
      label: intl.get('sslm.common.model.field.localAddress').d('企业本土地址'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-basic-req/after/${changeReqId}`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          dataSource: 4,
        },
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'longTermFlag') {
        if (value) {
          record.set('licenceEndDate', undefined);
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

export { getLegalDS };

function unifiedSocialCodeValidator(value) {
  const pattern = /^(?![A-Z]{18}$)[0-9A-Z]{18}$/;
  if (value && !pattern.test(value)) {
    return intl
      .get('spfm.enterprise.model.legal.unifiedSocialCodeNewRule')
      .d('由18位大写字母和数字混合组成,且不能是纯字母');
  }
}
