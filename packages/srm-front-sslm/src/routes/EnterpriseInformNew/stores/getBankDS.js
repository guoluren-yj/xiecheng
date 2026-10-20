/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';

import { PHONE } from 'utils/regExp';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';

import { getReadTransport } from '../utils';

const organizationId = getCurrentOrganizationId();

export const getBankDS = ({
  isAllPlatform = false,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'bankCountryId',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankCountry`).d('国家'),
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { bankCountryId, bankCountryCode, bankCountryName } = data;
        return value
          ? {
              countryId: bankCountryId,
              countryCode: bankCountryCode,
              countryName: bankCountryName,
            }
          : null;
      },
    },
    {
      name: 'bankCountryCode',
      bind: 'bankCountryId.countryCode',
    },
    {
      name: 'bankCountryName',
      bind: 'bankCountryId.countryName',
    },
    {
      name: 'bankCode',
      required: true,
      bind: 'bankFirm.bankCode',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankCode`).d('银行代码'),
    },
    {
      name: 'bankId',
      bind: 'bankFirm.bankId',
    },
    {
      name: 'bankName',
      bind: 'bankFirm.bankName',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankName`).d('银行名称'),
    },
    {
      name: 'bankFirm',
      type: 'object',
      required: true,
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankFirm`).d('联行行号'),
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      lovDefineAxiosConfig: (curCode, config) => {
        const lovConfig = lovDefineAxiosConfig(curCode, config);
        return {
          ...lovConfig,
          params: { tenantId: isAllPlatform ? 0 : partnerTenantId },
        };
      },
      transformRequest: value => value && value.bankFirm,
      transformResponse: (value, data) => {
        const {
          bankCode,
          bankId,
          bankName,
          bankFirm,
          bankBranchId,
          bankBranchCode,
          bankBranchName,
        } = data;
        return value
          ? {
              bankCode,
              bankId,
              bankName,
              bankFirm,
              bankBranchId,
              bankBranchCode,
              bankBranchName,
            }
          : null;
      },
    },
    {
      name: 'bankBranchId',
      bind: 'bankFirm.bankBranchId',
    },
    {
      name: 'bankBranchCode',
      bind: 'bankFirm.bankBranchCode',
    },
    {
      name: 'bankBranchName',
      required: true,
      bind: 'bankFirm.bankBranchName',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankBranchName`).d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      required: true,
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankAccountName`).d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      required: true,
      // type: 'secret',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankAccountNum`).d('银行账号'),
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('sslm.enterpriseInform.view.validatioin.bankAccountNum')
          .d('银行账号应为数字，字母或"-@._,/"'),
      },
    },
    {
      name: 'accountNature',
      lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.view.model.bank.accountNature').d('账户性质'),
    },
    {
      name: 'accountPurpose',
      lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.view.model.bank.accountPurpose').d('账户用途'),
    },
    {
      name: 'currencyId',
      type: 'object',
      lovCode: 'SMDM.CURRENCY_SQL',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.currencyName`).d('币种'),
      transformRequest: value => value && value.currencyId,
      transformResponse: (value, data) => {
        const { currencyId, currencyCode, currencyIdMeaning } = data;
        return value ? { currencyId, currencyCode, currencyName: currencyIdMeaning } : null;
      },
    },
    {
      name: 'currencyCode',
      bind: 'currencyId.currencyCode',
    },
    {
      name: 'currencyName',
      bind: 'currencyId.currencyName',
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
      name: 'paymentType',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.paymentType`).d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, data) => {
        const { paymentTypeId, paymentType, paymentTypeIdMeaning } = data;
        return value
          ? { typeId: paymentTypeId, typeCode: paymentType, typeName: paymentTypeIdMeaning }
          : null;
      },
    },
    {
      name: 'paymentTypeId',
      bind: 'paymentType.typeId',
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
      label: intl.get(`sslm.enterpriseInform.view.model.bank.masterFlag`).d('主账号'),
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
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'objectFlag',
      ignore: 'always',
      label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
    },
    {
      name: 'intlBankAccountNum',
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
    {
      name: 'bankDirectLinkOrgInfoCode',
      label: intl
        .get('sslm.enterpriseInform.view.model.bank.bankEnterpriseCode')
        .d('银企直联组织信息代码'),
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      disabled: true,
      lovPara: { tenantId: 0 },
    },
    {
      name: 'paymentConfirmPhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sslm.enterpriseInform.view.model.bank.payConfirmPhone').d('打款确认人号码'),
      pattern: PHONE,
      dynamicProps: {
        pattern: ({ dataSet }) => {
          const businessDs = dataSet.getState('businessDs');
          if (businessDs) {
            const businessType = businessDs.current && businessDs.current.get('businessType');
            const needCheck = isAllPlatform && businessType && businessType.includes('purchase');
            if (needCheck) {
              return PHONE;
            }
          }
          return null;
        },
      },
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (
          !isAllPlatform &&
          (record.get('supplierBankAccountId') || record.get('extSourceAccountFlag'))
        ) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      // 只读页面标红用readUrlProps这个接口
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/no-basic`
        : `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs/no-basic`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              changeReqId,
              companyId,
              supplierCompanyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              dataSource: 1,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
              desensitize: false,
            },
          }
        : readUrlProps;
    },
    submit: ({ dataSet, data }) => {
      const { companyId, changeReqId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs`
        : `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs`;
      return {
        url,
        method: 'POST',
        params: {
          dataSource: 1,
          customizeUnitCode: isAllPlatform ? null : code,
          customizeTenantId: isAllPlatform ? null : partnerTenantId,
          desensitize: false,
        },
        data: {
          changeReqId,
          companyId,
          [isAllPlatform ? 'comBankAccReqs' : 'supBankAccReqs']: data,
        },
      };
    },
    destroy: ({ data }) => {
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/delete`
        : `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs/delete`;
      return {
        url,
        method: 'DELETE',
        data,
      };
    },
  },
});
