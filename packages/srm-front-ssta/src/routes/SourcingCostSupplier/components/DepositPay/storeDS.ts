import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { PayStatusConfirmOtherCode } from './PayStatusConfirm';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const payStatusConfirmDS = (): DataSetProps => {
  return {
    autoCreate: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payAmount').d('缴纳金额'),
        min: 0,
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          precision: ({ record }) => record.get('amountPrecision'),
        },
        required: true,
      },
      {
        name: 'remark',
        label: intl.get('ssta.sourcingCost.model.sourcingCost.remark').d('备注'),
      },
    ],
    transport: {
      submit: () => {
        return {
          url: `${apiPrefix}/deposits/supplier/offline-pay-confirm`,
          method: 'POST',
          params: { customizeUnitCode: [PayStatusConfirmOtherCode].join() },
        };
      },
    },
    feedback: { submitSuccess() { } },
  };
};