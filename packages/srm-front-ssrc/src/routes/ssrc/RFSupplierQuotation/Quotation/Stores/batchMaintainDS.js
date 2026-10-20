/**
 * 报价行-批量维护ds
 */

import intl from 'utils/intl';

const batchMaintainFormDS = (options = {}) => {
  const { organizationId } = options || {};

  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'currentDeliveryCycle',
        type: 'number',
        step: 1,
        min: 0,
      },
      {
        label: intl.get('ssrc.common.quotationValidDateFrom').d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl.get('ssrc.common.quotationValidDateTo').d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        min: 'currentExpiryDateFrom',
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
        transformRequest: (value) => value ? value.taxId : null,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        lovPara: {
          organizationId,
        },
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: 'taxId.taxRate',
      },
      {
        name: 'taxRateType',
      }
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'taxId') {
          const { taxRateType } = value || {};
          record.set({
            taxRateType,
          });
        } else if (name === 'taxIncludedFlag') {
          record.set({
            taxRateType: null,
            taxId: null,
            taxRate: null,
          });
        } else {
          // todo anything
        }
      },
    },
  };
};

export { batchMaintainFormDS };
