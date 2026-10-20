import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import type { RefundAction } from '.';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

interface DSParams {
  depositId: string | number,
  refundAction: RefundAction,
}

export const depositRefundProgressDS = (queryParameter: DSParams): DataSetProps => {
  const { refundAction } = queryParameter;
  return {
    autoQuery: false,
    paging: false,
    queryParameter,
    fields: [
      {
        name: 'amount',
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
        bind: refundAction === 'RETURN_SUPPLIER' ? 'paymentAmount' : 'transferAmount',
      },
    ],
    dataKey: refundAction === 'RETURN_SUPPLIER' ? 'depositPayRecordList' : 'depositTransferRecordList',
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/deposits/purchaser/deposit-refund-status-detail`,
          method: 'GET',
        };
      },
    },
  };
};