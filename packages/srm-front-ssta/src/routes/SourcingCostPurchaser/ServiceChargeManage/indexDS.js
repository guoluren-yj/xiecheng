import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

import { decimalPointAccuracy } from '@/routes/utils';

const tableDS = ({ sourceId, bidFlag }) => ({
  dataToJSON: 'all',
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get(`ssrc.depositManage.model.depositManage.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`ssrc.depositManage.model.depositManage.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'suggestedQtnTaxAmount',
      type: 'number',
      label: intl
        .get(`ssrc.depositManage.model.depositManage.suggestedQtnTaxAmount`)
        .d('中标金额（含税）'),
    },
    {
      name: 'suggestedQtnNetAmount',
      type: 'number',
      label: intl
        .get(`ssrc.depositManage.model.depositManage.suggestedQtnNetAmount`)
        .d('中标金额（不含税）'),
    },
    {
      name: 'suggestedCurrencyCode',
      label: intl.get(`ssrc.depositManage.model.depositManage.suggestedCurrencyCode`).d('中标币种'),
    },
    {
      name: 'expenseCurrencyCode',
      type: 'object',
      label: intl.get(`ssrc.depositManage.model.depositManage.expenseCurrencyCode`).d('中标币种'),
      lovCode: 'SMDM.CURRENCY_CODE',
      textField: 'currencyCode',
      valueField: 'currencyCode',
      ignore: 'always',
      transformRequest: (value = {}) => {
        return value?.currencyCode || null;
      },
      transformResponse: (value) => (value ? { currencyCode: value } : null),
      required: true,
    },
    {
      name: 'expectAmount',
      type: 'number',
      label: intl
        .get(`ssrc.depositManage.model.depositManage.expectAmount`)
        .d('含税服务费金额（元）'),
      required: true,
      min: 0.01,
      max: '99999999999999999999',
    },
    {
      name: 'invoiceRule',
      label: intl
        .get(`ssrc.depositManage.model.depositManage.chargeInvoiceRuleMeaning`)
        .d('服务费开票规则'),
      lookupCode: 'SDEP.SERVER_FEES_INVOICE_RULE',
      required: true,
    },
    {
      name: 'syncExpenseStatusMeaning',
      label: intl
        .get(`ssrc.depositManage.model.depositManage.syncExpenseStatusMeaning`)
        .d('同步费用工作台状态'),
    },
    {
      name: 'syncExpenseResponseMsg',
      label: intl
        .get(`ssrc.depositManage.model.depositManage.syncExpenseResponseMsg`)
        .d('同步费用工作台反馈'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'expenseCurrencyCode') {
        record.set('defaultPrecision', (value || {})?.defaultPrecision);
        record.set(
          'expectAmount',
          decimalPointAccuracy(
            record.get('expectAmount'),
            record.get('invoiceRule') === 'OFFLINE' ? record.get('defaultPrecision') : 2,
            {
              repair: true,
            }
          )
        );
      }
      if (name === 'invoiceRule') {
        record.set(
          'expectAmount',
          decimalPointAccuracy(
            record.get('expectAmount'),
            value === 'OFFLINE' ? record.get('defaultPrecision') : 2,
            {
              repair: true,
            }
          )
        );
      }
    },
  },
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/expenses-headers/service-expense/list`,
        method: 'POST',
        data: {
          ...data,
          expensesType: 'SERVICE_FEE',
          sourceType: 'RFX',
          sourceId,
        },
        params: {
          ...params,
          customizeUnitCode: [
            `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.NEW_LIST.SERVICE_FEE_FILTER`,
            `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.NEW_LIST.SERVICE_FEE_TABLE`,
          ].join(','),
        },
      };
    },
  },
});

export default tableDS;
