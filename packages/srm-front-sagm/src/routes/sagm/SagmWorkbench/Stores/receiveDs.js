import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getReceiveLimitDs = () => ({
  paging: false,
  pageSize: 20,
  forceValidate: true,
  fields: [
    {
      label: intl.get('sagm.common.view.product').d('商品'),
      name: 'saleAgreementSkuMappings',
      type: 'object',
      lovCode: 'SAGM.AGREEMENT_LINE_SKU',
      textField: 'skuName',
      valueField: 'skuId',
      required: true,
      multiple: true,
      lovPara: { tenantId: organizationId },
    },
    {
      label: intl.get('sagm.common.view.cycleDimension').d('周期维度'),
      name: 'cycleDimension',
      required: true,
      lookupCode: 'SAGM.CYCLE_DIMENSION',
    },
    {
      name: 'receiveQuantity',
      type: 'number',
      min: 1,
      step: 1,
      max: 9999999999,
      required: true,
      label: intl.get('sagm.common.view.receiveQuantity').d('可领用数量'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-agreement-receive-limits`,
      method: 'GET',
    },
    destroy: () => ({
      url: `/sagm/v1/${organizationId}/sale-agreement-receive-limits`,
      method: 'DELETE',
    }),
  },
});
