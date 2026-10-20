/**
 * 供应商缴费记录 - dataSet
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-01-06
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config.js';

/**
 * 缴费账单弹窗
 * @returns
 */
const PaymentGuideDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/supplier-ticket/${data.supplierPaymentId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierPaymentId',
  fields: [
    {
      label: intl.get(`spfm.supplierInvoic.model.supplierCode`).d('供应商编码'),
      name: 'supplierTenantCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.supplierName`).d('供应商名称'),
      name: 'supplierTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.enterpriseCode`).d('核企编码'),
      name: 'coreTenantCode',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.enterpriseName`).d('核企名称'),
      name: 'coreTenantName',
      type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.amount`).d('年订阅费金额'),
      name: 'paymentFee',
      // type: 'string',
    },
    {
      label: intl.get(`spfm.supplierInvoic.model.activePeriod`).d('有效期'),
      name: 'activePeriod',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

export { PaymentGuideDS };
