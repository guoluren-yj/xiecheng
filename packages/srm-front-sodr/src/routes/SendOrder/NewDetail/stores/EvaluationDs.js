import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';

export default ({ organizationId, poHeaderId }) => {
  return {
    cascadeParams(record) {
      return {
        supplierCompanyId: record.get('supplierCompanyId'),
      };
    },
    transport: {
      read: ({ data, params }) => ({
        url: `${SRM_SPUC}/v1/${organizationId}/po-evaluations/${poHeaderId}/detail`,
        method: 'GET',
        params: { ...params, supplierCompanyId: data.supplierCompanyId },
        data: null,
      }),
    },
    dataKey: null,
    fields: [
      {
        name: 'poScore',
        label: intl.get('sodr.common.model.common.poScore').d('订单评分'),
        disabled: true,
      },
      {
        name: 'poEvaluation',
        label: intl.get('sodr.common.model.common.poEvaluation').d('订单评价'),
      },
    ],
  };
};
