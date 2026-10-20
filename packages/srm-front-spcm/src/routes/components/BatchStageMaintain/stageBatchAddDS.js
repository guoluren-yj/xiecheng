import intl from 'utils/intl';

export const stageBatchAddDS = headerInfo => {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'normal',
    fields: [
      {
        name: 'payRatio',
        type: 'number',
        disabled: headerInfo?.contractCalculateMethod === '0',
        label: `${intl.get(`spcm.common.model.common.payRatio`).d('付款比例')}(%)`,
      },
      {
        name: 'costQuantity',
        type: 'number',
        disabled: headerInfo?.contractCalculateMethod === '1',
        label: intl.get(`spcm.common.model.common.supplierCostQuantity`).d('原币费用'),
      },
      {
        name: 'supplierCurrencyCode',
        type: 'object',
        label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        lovCode: 'SPCM.CURRENCY',
        textField: 'currencyCode',
        transformResponse: (value, record) => {
          return value
            ? {
              currencyCode: record.currencyCode,
              }
            : null;
        },
        transformRequest: value => value?.currencyCode,
      },
      {
        name: 'purchaseCurrencyCode',
        type: 'object',
        label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        lovCode: 'SPCM.CURRENCY',
        textField: 'currencyCode',
        transformResponse: (value, record) => {
          return value
            ? {
              currencyCode: record.currencyCode,
              }
            : null;
        },
        transformRequest: value => value?.currencyCode,
      },
      {
        name: 'exchangeRate',
        type: 'number',
        label: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        min: 0.0000001,
        precision: 10,
      },
      {
        name: 'typeId',
        type: 'object',
        label: intl.get('spcm.common.model.common.typeId').d('付款方式'),
        // required: true,
        lovCode: 'SPCM.PAYMENT_TYPE',
        textField: 'typeName',
        lovPara: {
          pcTypeId: headerInfo.pcTypeId,
        },
        transformResponse: (value, record) => {
          return value
            ? {
                typeId: record.typeId,
                typeName: record.typeName,
              }
            : null;
        },
        transformRequest: value => value?.typeId,
      },
      {
        name: 'typeName',
        bind: 'typeId.typeName',
      },
    ],
  };
};
