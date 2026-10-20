import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { isArray } from 'lodash';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { payStatusConfirmOtherCode } from './PayStatusConfirm';
import { amountFormatterOptions } from '../../../../utils/utils';
import { DepositQuotePayCode, depositQuotePayOtherCode } from './QuoteDepositPay';

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
      submit: ({data}) => {
        // 避免提交时回写的 errorMessage 导致报错信息重复 
        const _data = isArray(data) ? [{...(data[0] || {}), errorMessage: undefined, errorFlag: undefined }] : data;
        return {
          url: `${apiPrefix}/deposits/purchaser/offline-pay-confirm`,
          method: 'POST',
          params: { customizeUnitCode: payStatusConfirmOtherCode },
          data: _data,
        };
      },
    },
    feedback: { submitSuccess() { } },
  };
};

export const quoteDepositPayDS = (depositRecord: DSRecord | null | undefined): DataSetProps => {
  const depositRecordData = depositRecord?.toData() || {};
  return {
    forceValidate: true,
    primaryKey: 'depositId',
    dataToJSON: DataToJSON.all,
    data: [{
      ...depositRecordData,
      depositPayRecordInputList: [{}], // 不会自动创建
    }],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/deposits/deposit-transfer-deposit`,
          method: 'POST',
          data: data[0],
          params: {
            customizeUnitCode: [depositQuotePayOtherCode, DepositQuotePayCode.GRID].join(),
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
        name: 'depositTransferDepositAmount',
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
    queryParameter: { customizeUnitCode: Object.values(DepositQuotePayCode).join() },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/deposits/purchaser/page-deposit-transfer-deposit`,
          method: 'GET',
        };
      },
    },
  };
};