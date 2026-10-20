import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const tenderRefundConfirmDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'offlineRefundAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.refundAmount').d('退款金额'),
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          precision: ({ record }) => record.get('amountPrecision'),
        },
        disabled: true,
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/tender-feess/return-tender`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};