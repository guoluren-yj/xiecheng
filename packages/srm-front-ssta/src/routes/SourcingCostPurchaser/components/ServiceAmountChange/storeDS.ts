import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ServiceAmountChangeCode } from '.';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const serviceAmountChangeDS = (serviceRecord): DataSetProps => {
  const serviceRecordData = serviceRecord?.toData() || {};
  delete serviceRecordData.amount;
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    data: [serviceRecordData],
    fields: [
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.amountAfterChange').d('变更后金额'),
        required: true,
        dynamicProps: {
          formatterOptions: amountFormatterOptions,
          precision: ({ record }) => record.get('amountPrecision'),
        },
        validator: (value, name, record) => {
          if (!name) return;
          const text = record?.getField(name)?.get('label');
          if (math.lte(value, 0)) {
            return intl.get(`ssta.common.message.validate.mustPositiveNum`, { text }).d(`{text}必须大于零`);
          }
        },
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/server-feess/server-fees-change`,
          method: 'POST',
          data: data[0],
          params: { customizeUnitCode: ServiceAmountChangeCode },
        };
      },
    },
  };
};