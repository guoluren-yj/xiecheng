/*
 * @Date: 2023-08-18 11:29:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

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
    {
      name: 'tempFlag',
      label: intl.get('sslm.common.stage.temporary').d('临时'),
    },
    {
      name: 'tempEndDate',
      type: 'date',
      label: intl.get('sslm.common.model.dateTo').d('有效期至'),
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
