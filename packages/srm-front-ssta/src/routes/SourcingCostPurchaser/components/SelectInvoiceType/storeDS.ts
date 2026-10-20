import intl from 'utils/intl';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

export const selectInvoiceTypeDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'invoiceType',
        label: intl.get('ssta.sourcingCost.model.sourcingCost.invoiceType').d('发票类型'),
        lookupCode: 'SDEP.INVOICE_POOL_TYPE',
        required: true,
      },
    ],
  };
};