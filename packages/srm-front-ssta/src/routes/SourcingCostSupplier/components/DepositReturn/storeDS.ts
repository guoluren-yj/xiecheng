import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { DepositReturnSupplierCode } from '.';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const depositReturnDS = (depositRecord: DSRecord | null | undefined): DataSetProps => {
  const depositRecordData = depositRecord?.toData() || {};
  const { remainingRefundableAmount, amountPrecision } = depositRecordData;
  return {
    autoQuery: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    data: [{
      amountPrecision,
      paymentAmount: remainingRefundableAmount,
    }],
    fields: [
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.returnAmount').d('退回金额'),
        required: true,
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          precision: ({ record }) => record.get('amountPrecision'),
        },
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/deposits/supplier/return-deposit`,
          method: 'POST',
          data: {
            ...depositRecordData,
            depositPayRecordInputList: data,
          },
          params: { customizeUnitCode: DepositReturnSupplierCode },
        };
      },
    },
  };
};