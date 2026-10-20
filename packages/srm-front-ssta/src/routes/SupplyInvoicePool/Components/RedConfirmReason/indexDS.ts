import { FieldType, DataToJSON } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';



const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const redListDS = (invoiceHeaderList): DataSetProps => {
  return {
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'settleHeaderId',
    // dataToJSON: DataToJSON.selected,
    selection: false,
    forceValidate: true,
    data: invoiceHeaderList,
    dataToJSON: DataToJSON.all,
    paging: false,
    fields: [
      {
        label: intl.get(`ssta.purchaseSettle.model.supplySettle.invoiceNumber`).d('发票号码'),
        type: FieldType.string,
        name: 'invoiceNum',
      },
      {
        label: intl.get(`ssta.purchaseSettle.model.supplySettle.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        name: 'invoiceCode',
      },
      {
        name: 'invoiceRefundedReason',
        type: FieldType.string,
        lookupCode: 'SDIM.WRITE_OFF_REASON',
        label: intl.get('ssta.common.model.purchaseSettle.invoiceRefundedReason').d('冲红原因'),
        required: true,
      },
    ],
    transport: {
      submit: () => {
        return {
          url: `${apiPrefix}/invoice-header/red-cancel`,
        };
      },
    },
  };
};
