/**
 * 数据源ds
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const promptCode = 'ssrc.priceComparison';
const organizationId = getCurrentOrganizationId();

const ladderQuotationDS = () => ({
  primaryKey: 'supplierCompanyId',
  selection: false,
  // queryFields: [
  //   {
  //     name: 'rfxLineItemId',
  //     label: intl.get(`${promptCode}.model.priceComparison.itemSearch`).d('搜索物品'),
  //     type: 'string',
  //     lovCode: '',
  //   },
  // ],
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get(`${promptCode}.model.priceComparison.supplierCompanyNum`).d('供应商编码'),
      type: 'string',
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${promptCode}.model.priceComparison.supplierCompanyName`).d('供应商名称'),
      type: 'string',
    },
  ],
  transport: {
    read: ({ data = {} }) => {
      const { rfxLineItemId } = data;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/bargain-assistant/${rfxLineItemId}/ladder-price/compare`,
        method: 'GET',
        data: {},
      };
    },
  },
});

export { ladderQuotationDS };
