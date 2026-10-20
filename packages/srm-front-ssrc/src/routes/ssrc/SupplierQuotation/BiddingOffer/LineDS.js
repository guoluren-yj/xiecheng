/**
 * DS相关配置
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const promptCode = 'ssrc.supplierQuotation';

const organizationId = getCurrentOrganizationId();

const SupplierRankTableDS = () => ({
  primaryKey: 'supplierCompanyId',
  selection: false,
  fields: [
    {
      name: 'rank',
      label: intl.get(`${promptCode}.model.supplierQuotation.rank`).d('排名'),
      type: 'number',
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${promptCode}.model.supplierQuotation.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'totalAmount',
      label: intl.get(`${promptCode}.model.supplierQuotation.totalAmount`).d('含税报价总金额'),
    },
    {
      name: 'netAmount',
      label: intl.get(`${promptCode}.model.supplierQuotation.netAmount`).d('报价总金额(不含税)'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfxHeaderId, quotationHeaderId },
      } = dataSet;
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/rfx/quotation/${rfxHeaderId}/${quotationHeaderId}/amounts-rank`,
        data: {},
      };
    },
  },
});

export default SupplierRankTableDS;
