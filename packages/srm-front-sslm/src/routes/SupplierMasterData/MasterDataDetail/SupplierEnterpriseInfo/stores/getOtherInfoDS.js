/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

export const getOtherInfoDS = () => ({
  fields: [
    {
      name: 'blacklistExpiryDate',
      type: 'date',
      label: intl.get('sslm.commonApplication.model.coApp.blacklistExpiryDate').d('黑名单失效时间'),
    },
    {
      name: 'termName',
      label: intl.get('sslm.common.model.paymentTerms').d('付款条款'),
    },
    {
      name: 'typeName',
      label: intl.get('sslm.common.model.paymentWay').d('付款方式'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const params = dataSet.getQueryParameter('params');
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-others/getSupplierOther`,
        method: 'GET',
        data: params,
        params: {},
      };
    },
  },
});
