import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { payStatusConfirmOtherCode } from './PayStatusConfirm';
import { amountFormatterOptions } from '../../../../utils/utils';
import { ServiceQuotePayCode, serviceQuotePayOtherCode } from './QuoteDepositPay';

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
          url: `${apiPrefix}/server-feess/offline-pay-confirm`,
          method: 'POST',
          params: { customizeUnitCode: payStatusConfirmOtherCode },
        };
      },
    },
  };
};

export const quoteDepositPayDS = (serviceRecord: DSRecord | null | undefined): DataSetProps => {
  const serviceRecordData = serviceRecord?.toData() || {};
  return {
    forceValidate: true,
    primaryKey: 'serverFeesId',
    dataToJSON: DataToJSON.all,
    data: [{
      ...serviceRecordData,
      serverPayRecordInputList: [{}], // 不会自动创建
    }],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/server-feess/deposit-transfer-server-fees`,
          method: 'POST',
          data: data[0],
          params: {
            customizeUnitCode: [serviceQuotePayOtherCode, ServiceQuotePayCode.GRID].join(),
          },
        };
      },
    },
  };
};

export const payRecordInputDS = (): DataSetProps => {
  return {
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'remark',
        label: intl.get('ssta.sourcingCost.model.sourcingCost.remark').d('备注'),
      },
    ],
  };
};

export const depositListDS = (): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    forceValidate: true,
    dataToJSON: DataToJSON.selected,
    primaryKey: 'depositId',
    fields: [
      {
        name: 'depositNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositNumber').d('保证金编号'),
      },
      {
        name: 'depositDetail',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.view.message.depositDetail').d('保证金详情'),
      },
      {
        name: 'remainingRefundableAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositCanTransferredOutAmount').d('保证金可转出金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'depositTransferServerFeesAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payAmount').d('缴纳金额'),
        min: 0,
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          required: ({ record }) => record.isSelected,
          disabled: ({ record }) => !record.isSelected,
          precision: ({ record }) => record.get('amountPrecision'),
        },
      },
    ],
    queryParameter: { customizeUnitCode: Object.values(ServiceQuotePayCode).join() },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/server-feess/purchaser/page-deposit-transfer-server-fees`,
          method: 'GET',
        };
      },
    },
  };
};
