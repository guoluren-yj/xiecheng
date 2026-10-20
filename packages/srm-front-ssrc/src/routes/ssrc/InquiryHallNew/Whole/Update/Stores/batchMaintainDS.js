/**
 * 报价行-批量维护ds
 */
import moment from 'moment';
import { isObject } from 'lodash';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

import { NumberMax, NumberMin } from '@/utils/constants';

const batchMaintainFormDS = (props = {}) => {
  const { organizationId, basicFormDS, allowInputSupplierNameFlag, offlineEntryRemote } =
    props || {};

  // get dynamic value form header ds
  const getValueFromBindHeaderFormDS = (field = '') => {
    const headerRecord = basicFormDS?.current;

    if (!headerRecord) {
      return;
    }

    let value = headerRecord.get(field);
    if (isObject(value)) {
      value = value?.[field];
    }

    return value;
  };

  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        name: 'suggestedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        name: 'allottedRatio',
        type: 'number',
        min: NumberMin,
        dynamicProps: {
          disabled({ record }) {
            const suggestedFlag = record.get('suggestedFlag');
            const flag = suggestedFlag !== 1;
            return flag;
          },
          required: ({ record }) => {
            const suggestedFlag = record.get('suggestedFlag');
            const flag = !!suggestedFlag;

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        name: 'suggestedRemark',
        type: 'string',
        dynamicProps: {
          disabled({ record }) {
            const suggestedFlag = record.get('suggestedFlag');
            const flag = suggestedFlag !== 1;
            return flag;
          },
          required: ({ record }) => {
            const suggestedFlag = record.get('suggestedFlag');
            const flag = !!suggestedFlag;

            return flag;
          },
        },
        maxLength: 500,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.ssrcControlOrderFlag`)
          .d('是否控制订单数量'),
        name: 'controlOrderFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.ssrcControlProtocolFlag`)
          .d('是否控制协议数量'),
        name: 'controlProtocolFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        transformRequest: (value = {}) => value && value?.ouId,
        transformResponse: (value, data) => {
          return value ? { ouId: value, ouName: data?.ouName } : null;
        },
        dynamicProps: {
          lovPara() {
            const companyId = getValueFromBindHeaderFormDS('companyId');
            const param = {
              companyId,
            };
            const remoteParam = offlineEntryRemote
              ? offlineEntryRemote?.process(
                'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_BATCH_MAIN_DS_OUID_LOVPARA_PROPS',
                param,
                { basicFormDS }
              )
              : param;
            return remoteParam;
          },
          disabled({ dataSet }) {
            const outterLinePrHeaderIdFlag = dataSet.getState('outterLinePrHeaderIdFlag');
            return outterLinePrHeaderIdFlag;
          },
        },
      },
      // {
      //   name: 'ouName',
      //   bind: 'ouId.ouName',
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationId',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        transformRequest: (value = {}) => {
          return value?.invOrganizationId || value?.organizationId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
              invOrganizationId: value,
              organizationName: data?.invOrganizationName,
            }
            : null;
        },
        dynamicProps: {
          lovPara({ record }) {
            const companyId = getValueFromBindHeaderFormDS('companyId');
            const { ouId = null } = record.get('ouId') || {};

            return {
              ouId,
              companyId,
              enabledFlag: 1,
              organizationId,
            };
          },
          disabled({ dataSet }) {
            const outterLinePrHeaderIdFlag = dataSet.getState('outterLinePrHeaderIdFlag');
            return outterLinePrHeaderIdFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        name: 'supplierCompanyId',
        type: 'object',
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        lovCode: 'SSRC.SUPPLIER',
        ignore: 'always',
        valueField: 'supplierCompanyId',
        textField: 'supplierCompanyNum',
        transformRequest: (value) => value?.supplierCompanyId,
        transformResponse: (value, data) => {
          const { supplierCompanyNum } = data || {};
          return value || supplierCompanyNum
            ? { supplierCompanyId: value, supplierCompanyNum }
            : null;
        },
        dynamicProps: {
          disabled() {
            const companyId = getValueFromBindHeaderFormDS('companyId');
            const flag = !companyId;
            return flag;
          },
        },
      },
      {
        name: 'supplierCompanyNum',
        // bind: 'supplierCompanyId.supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName', // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        maxLength: 360,
        lovCode: 'SSRC.SUPPLIER',
        // valueField: 'supplierCompanyName',
        textField: 'supplierCompanyName',
        transformRequest: (value) => value?.supplierCompanyName || null,
        transformResponse: (value) => {
          return value ? { supplierCompanyName: value } : null;
        },
        dynamicProps: {
          disabled({ record }) {
            const companyId = getValueFromBindHeaderFormDS('companyId');
            const { supplierCompanyNum } = record.get('supplierCompanyId') || {};

            const flag = !companyId || supplierCompanyNum || !allowInputSupplierNameFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        textField: 'termName',
        valueField: 'termId',
        transformRequest: (value = {}) => {
          return value?.termId || value?.paymentTermId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
              paymentTermId: value || data.termId,
              termName: data?.paymentTermName || data?.termName,
            }
            : null;
        },
        lovPara: {
          enabledFlag: 1,
        },
        dynamicProps: {
          disabled() {
            const paymentTermFlag = getValueFromBindHeaderFormDS('paymentTermFlag');
            const flag = paymentTermFlag !== 1;
            return flag;
          },
        },
      },
      // {
      //   name: 'paymentTermName',
      //   bind: 'paymentTermId.termName',
      // },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式'),
        name: 'paymentTypeId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENTTYPE',
        textField: 'typeName',
        valueField: 'typeId',
        transformRequest: (value = {}) => {
          return value?.typeId || value?.paymentTypeId || null;
        },
        transformResponse: (value, data) => {
          const currentName = data?.typeName || data?.paymentTypeName;
          return value ? { paymentTypeId: value, typeName: currentName } : null;
        },
        lovPara: {
          sourceFrom: 'RFX',
          organizationId,
        },
        dynamicProps: {
          disabled() {
            const paymentTermFlag = getValueFromBindHeaderFormDS('paymentTermFlag');

            const flag = paymentTermFlag !== 1;
            return flag;
          },
        },
      },
      // {
      //   name: 'paymentTypeName',
      //   bind: 'paymentTypeId.typeName',
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrency`).d('报价币种'),
        name: 'quotationCurrencyCode',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currencyCode',
        transformRequest: (value = {}) => {
          return value?.quotationCurrencyCode || value?.currencyCode || null;
        },
        transformResponse: (value) => {
          return value
            ? {
              quotationCurrencyCode: value,
              currencyCode: value,
              currencyName: value,
            }
            : null;
        },
        dynamicProps: {
          disabled() {
            const multiCurrencyFlag = getValueFromBindHeaderFormDS('multiCurrencyFlag');
            const flag = multiCurrencyFlag !== 1;
            return flag;
          },
        },
      },
      // {
      //   name: 'currencyName',
      //   bind: 'quotationCurrencyCode.currencyName',
      // },
      {
        name: 'supplierId',
      },
      {
        name: 'supplierTenantId',
      },
      { name: 'supplierId', defaultValue: null },
      {
        name: 'supplierTenantId',
        defaultValue: null,
      },
      { name: 'supplierContactId', defaultValue: null },
      {
        name: 'contactMobilephone',
        defaultValue: null,
      },
      {
        name: 'contactMail',
        defaultValue: null,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        ignore: 'always',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        lovPara: {
          organizationId,
        },
        dynamicProps: {
          disabled({ record }) {
            const taxChangeFlag = getValueFromBindHeaderFormDS('taxChangeFlag');
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

            const result = taxChangeFlag !== 1 || taxIncludedFlag !== 1;

            return result;
          },
          required({ record }) {
            const taxChangeFlag = getValueFromBindHeaderFormDS('taxChangeFlag');
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

            const result = taxChangeFlag === 1 && taxIncludedFlag === 1;

            return result;
          },
        },
      },
      // {
      //   name: 'taxRate',
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
      //   bind: 'taxId.taxRate',
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
        min: NumberMin,
        max: NumberMax,
        type: 'number',
      },
      {
        label: intl.get('ssrc.common.view.freightInclude').d('含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        name: 'freightAmount',
        type: 'number',
        max: NumberMax,
        min: NumberMin,
        dynamicProps: {
          disabled({ record }) {
            const freightIncludedFlag = record.get('freightIncludedFlag');
            const flag = !!freightIncludedFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'currentDeliveryCycle',
        type: 'number',
        min: NumberMin,
        max: NumberMax,
        step: 1,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        name: 'currentPromisedDate',
        type: 'date',
        dateMode: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        name: 'priceBatchQuantity',
        type: 'number',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.priceBatch').d('价格批量'),
        min: NumberMin,
        max: NumberMax,
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
        dateMode: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        dateMode: 'date',
        format: DEFAULT_DATE_FORMAT,
        computedProps: {
          min({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            const currentField = record.getField('currentExpiryDateTo');

            if (!currentField || skipValidateFlag) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const currentExpiryDateFrom = record.get('currentExpiryDateFrom');
            const min = currentExpiryDateFrom
              ? 'currentExpiryDateFrom'
              : moment(new Date()).format(DEFAULT_DATE_FORMAT);
            return min;
          },
        },
      },
      {
        name: 'forceUpdateFields',
        defaultValue: null,
      },
      {
        name: 'taxRateType',
      }
    ],
    events: {
      update: ({ record, dataSet, name, value = null }) => {
        if (name === 'suggestedFlag') {
          record.set('suggestedFlag', value);
          if (value !== 1) {
            // record.set('allottedQuantity', null);
            // record.set('allottedSecondaryQuantity', null);
            record.set('allottedRatio', null);
            record.set('suggestedRemark', null);
          }
        }
        if (name === 'freightIncludedFlag') {
          record.set('freightIncludedFlag', value);
          if (value === 1) {
            record.set('freightAmount', null);
          }
        }
        if (name === 'taxId') {
          const { taxRateType = null, } = value || {};
          record.set({
            taxRateType,
          });
        }
        if (name === 'taxIncludedFlag') {
          record.set('taxIncludedFlag', value);
          record.set('taxId', null);
          record.set('taxRate', null);
          record.set("taxRateType", null);
        }

        if (name === 'invOrganizationId') {
          record.set('invOrganizationId', {
            organizationId: value?.organizationId,
            organizationName: value?.organizationName,
          });

          if (value?.organizationId && value?.ouId) {
            record.set('ouId', {
              ouId: value?.ouId,
              ouName: value?.ouName,
            });
          }
        }
        if (offlineEntryRemote) {
          offlineEntryRemote.event.fireEvent('lineDSEventMaintainUpdateCuxHandle', {
            record,
            name,
            value,
            lineDS: dataSet,
            headerDS: basicFormDS,
          });
        }
      },
    },
  };
};

export { batchMaintainFormDS };
