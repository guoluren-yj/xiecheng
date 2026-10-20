import { DataToJSON } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from "utils/utils";

export const tableDS = (settleHeaderIdList): DataSetProps => {
  return {
    paging: false,
    pageSize: 0,
    autoQuery: true,
    dataToJSON: DataToJSON.all,
    forceValidate: true,
    fields: [
      {
        name: 'settleNum',
        label: intl.get('ssta.purchaseSettle.model.purchaseSettle.settleNum').d('结算单编号'),
      },
      {
        name: 'invoiceCode',
        label: intl.get('ssta.common.model.invoice.invoiceCode').d('发票代码'),
      },
      {
        name: 'invoiceNumber',
        label: intl.get('ssta.common.model.invoice.invoiceNumber').d('发票号码'),
      },
      {
        name: 'redInfoNumber',
        label: intl.get('ssta.common.model.invoice.redInvFormAndconfirmationCode').d('红字发票表/确认单编码录入'),
        required: true,
      },
    ],
    transport: {
      read: {
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/tax-invoice-headers/invoice-platform/fetch/invoice`,
        method: 'PUT',
        data: settleHeaderIdList,
      },
      submit: {
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/tax-invoice-headers/invoice-platform/update/red-info`,
        method: 'PUT',
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};