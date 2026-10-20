import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DepositProgressCtrlCode } from '.';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const depositProgressCtrlDS = (depositRecord: DSRecord | null | undefined): DataSetProps => {
  const depositRecordData = depositRecord?.toData() || {};
  const { supplierQuoteFlag } = depositRecordData;
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    data: [{
      ...depositRecordData,
      supplierQuoteFlag: 1, // 默认勾选
    }],
    fields: [
      {
        name: 'supplierQuoteFlag',
        type: FieldType.boolean,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.allowSupplierQuotePrice').d('允许供应商报价'),
        trueValue: 1,
        falseValue: 0,
        disabled: Number(supplierQuoteFlag) === 1, // 原始值为勾选不能取消
        transformResponse: (value) => Number(value),
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/deposits/update-supplier-quote-flag`,
          method: 'POST',
          data: data[0],
          params: { customizeUnitCode: DepositProgressCtrlCode },
        };
      },
    },
  };
};