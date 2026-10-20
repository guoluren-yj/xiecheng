import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const TableDS = (recordId) => ({
  primaryKey: 'priceAdjustmentCode',
  autoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'priceAdjustmentName',
      label: intl
        .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentName')
        .d('调价单名称'),
    },
    {
      name: 'priceAdjustmentCode',
      label: intl
        .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentCode')
        .d('调价单编码'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-adjust-records/rel/${recordId}`,
        method: 'GET',
        data,
      };
    },
  },
});


export { TableDS };
