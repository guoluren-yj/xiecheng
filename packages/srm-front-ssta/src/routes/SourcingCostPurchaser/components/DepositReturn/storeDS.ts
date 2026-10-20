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

export const depositReturnDS = (depositRecord: DSRecord | null | undefined, options: object | any | undefined | any): DataSetProps => {
  const depositRecordData = depositRecord?.toData() || {};
  const { remainingRefundableAmount, amountPrecision } = depositRecordData || {};
  const { depositeReturnOptionData } = options || {};

  return {
    autoQuery: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    data: [{
      amountPrecision,
      paymentAmount: remainingRefundableAmount,
      ...(depositeReturnOptionData || {}),
    }],
    fields: [
      // {
      //   name: 'refundAmount',
      //   type: FieldType.number,
      //   label: intl.get('ssta.sourcingCost.model.sourcingCost.extSysPayRefundself').d('外部系统缴纳退款至外部系统'),
      //   dynamicProps: {
      //     formatterOptions: amountFormatterOptions,
      //     precision: ({ record }) => record.get('amountPrecision'),
      //   },
      // },
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
      // {
      //   name: 'depositRefundAmount',
      //   type: FieldType.number,
      //   label: intl.get('ssta.sourcingCost.model.sourcingCost.depositToselfRefund').d('保证金转保证金退款'),
      //   computedProps: { formatterOptions: amountFormatterOptions },
      //   disabled: true,
      // },
    ],
    // queryParameter: { depositId },
    transport: {
      // read: () => {
      //   return {
      //     url: `${apiPrefix}/deposits/purchaser/return-amount-able`,
      //     method: 'GET',
      //   };
      // },
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/deposits/purchaser/return-deposit`,
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