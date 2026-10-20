
import { DataToJSON } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";
import { FieldType } from "choerodon-ui/dataset/data-set/enum";

import intl from "utils/intl";
// import { SRM_SSTA } from '_utils/config';
// import { getCurrentOrganizationId } from "utils/utils";

export const formDS = (): DataSetProps => {
  return {
    paging: false,
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    forceValidate: true,
    fields: [
      {
        label: intl.get(`ssta.common.model.title.blueInvoiceCodeRelate`).d('关联蓝票发票代码'),
        type: FieldType.string,
        name: 'blueInvoiceCode',
      },
      {
        label: intl.get(`ssta.common.model.title.blueInvoiceNumRelate`).d('关联蓝票发票号码'),
        type: FieldType.string,
        name: 'blueInvoiceNum',
        dynamicProps: {
          required: ({ record }) => !record.get('blueDigitInvoiceNum'),
        },
      },
      {
        label: intl.get(`ssta.common.model.title.invoiceNumDigitalRelate`).d('关联蓝票数电发票号码'),
        type: FieldType.string,
        name: 'blueDigitInvoiceNum',
        dynamicProps: {
          required: ({ record }) => !record.get('blueInvoiceNum'),
        },
      },
      {
        name: 'invoiceRefundedReason',
        type: FieldType.string,
        lookupCode: 'SDIM.WRITE_OFF_REASON',
        label: intl.get('ssta.common.model.purchaseSettle.invoiceRefundedReason').d('冲红原因'),
        required: true,
      },
    ],
  };
};
