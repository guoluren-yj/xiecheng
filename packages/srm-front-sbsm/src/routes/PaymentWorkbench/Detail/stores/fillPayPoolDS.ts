import { FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from 'utils/intl';

export const batchEditFormDS = (): DataSetProps => {

  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'payTypeLov',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.financeConfirmPayType').d('财务确认付款方式'),
        type: FieldType.object,
        lovCode: 'SMDM.PAYMENT_TYPE',
        ignore: FieldIgnore.always,
      },
      {
        name: 'payTypeId',
        bind: 'payTypeLov.typeId',
      },
      {
        name: 'payTypeName',
        bind: 'payTypeLov.typeName',
      },
      {
        name: 'payForm',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.financeConfirmPayForm').d('财务确认付款形式'),
        lookupCode: 'SBSM.PAY_FORM',
      },
    ],
    events: {
      update: ({ name, value, record }) => {
        if (name === 'payTypeLov') record.set('payForm', value?.paymentForm);
      },
    },
  };
};