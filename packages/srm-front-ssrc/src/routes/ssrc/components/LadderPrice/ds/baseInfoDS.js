import intl from 'utils/intl';

/**
 * params options object
 */
const baseInfoDS = () => {
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.currency`).d('币种'),
        name: 'currencyCode',
      },
      {
        name: 'rfxTitle',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxRate',
      },
    ],
  };
};

export { baseInfoDS };
