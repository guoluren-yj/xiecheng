import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { TenderPayConfirmCode } from '.';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const tenderPayConfirmDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payAmount').d('缴纳金额'),
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          precision: ({ record }) => record.get('amountPrecision'),
        },
        disabled: true,
      },
    ],
    transport: {
      submit: () => {
        return {
          url: `${apiPrefix}/tender-feess/supplier/offline-pay-or-refund-confirm`,
          method: 'POST',
          params: { customizeUnitCode: TenderPayConfirmCode },
        };
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};