import { FieldType, DataToJSON } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';



const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const redListDS = (params): DataSetProps => {
  return {
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'settleHeaderId',
    dataToJSON: DataToJSON.all,
    selection: false,
    queryParameter: params,
    fields: [
      {
        name: 'blueInvoiceCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.invoiceRed.invoiceCode').d('发票代码'),
      },
      {
        name: 'blueInvoiceNum',
        type: FieldType.string,
        label: intl.get('ssta.common.model.invoiceRed.invoiceNum').d('发票号码'),
      },
      {
        name: 'redConfirmType',
        type: FieldType.string,
        lookupCode: 'SDIM.RED_CONFIRM_TYPE',
        label: intl.get('ssta.common.model.invoiceRed.confirmType').d('确认类型'),
        required: true,
      },
      {
        name: 'redConfirmReason',
        type: FieldType.string,
        label: intl.get('ssta.common.model.invoiceRed.reason').d('确认/否认理由'),
      },
    ],
    transport: {
      read: () => ({
        url: `${apiPrefix}/sdim-red-confirm-headers/list`,
        method: 'GET',
      }),
      submit: () => {
        return {
          url: `${apiPrefix}/sdim-red-confirm-headers/operation`,
          method: 'PUT',
        };
      },
    },
  };
};
