import { isNil } from 'lodash';
import intl from 'utils/intl';

import { transferToNumber } from '@/routes/ssrc/BiddingHall/utils/utils';

const batchQuotationModalDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'floatType',
        type: 'string',
      },
      {
        name: 'quotationRange',
        type: 'number',
        min: 0,
        dynamicProps: {
          min({ dataSet, record }) {
            let min = 0.000_000_001;
            const header = dataSet.getState('headerInfo');
            let currentPrecision = null;
            const { defaultPrecision } = header || {};
            const { floatType } = record.get(['floatType']);
            if (floatType === 'ratio') {
              return '0.01';
            }
            currentPrecision = defaultPrecision;

            if (!isNil(currentPrecision)) {
              min = 1 / 10 ** currentPrecision;
            }

            min = transferToNumber(min);

            return min;
          },
          precision({ dataSet, record }) {
            const header = dataSet.getState('headerInfo');
            const floatType = record.get('floatType');
            const { defaultPrecision } = header || {};

            let currentPrecision = null;
            if (floatType === 'ratio') {
              currentPrecision = 2;
            }
            if (floatType === 'money') {
              currentPrecision = defaultPrecision;
            }

            return currentPrecision;
          },
          max({ record, dataSet }) {
            const header = dataSet.getState('headerInfo');
            const { biddingQuotationMethod } = header || {};
            const floatType = record.get('floatType');

            let max = null;
            if (floatType === 'ratio') {
              max = 100;

              if (biddingQuotationMethod === 'AUCTION') {
                return null;
              }
            }

            return max;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
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
        dynamicProps: {
          lovPara({ dataSet }) {
            const {
              queryParameter: { commonProps = {} },
            } = dataSet;
            const { organizationId } = commonProps;
            return { organizationId };
          },
          disabled({record}){
            return !record.get('taxIncludedFlag');
          },
        },
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: 'taxId.taxRate',
      },
    ],
  };
};

export { batchQuotationModalDataSet };
