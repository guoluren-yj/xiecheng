/**
 * 风险扫描报告
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-02-02
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * RiskScanFormDS
 * @returns
 */
const RiskScanFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const tenantId = data?.tenantId ?? '';
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-define/supplier-list?tenantId=${tenantId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.supplierCode`).d('供应商编码'),
      name: 'categoryCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.supplierName`).d('供应商名称'),
      name: 'categoryDescription',
      type: 'string',
    },
    {
      name: 'categoryId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanReport.model.supplierCode`).d('供应商编码'),
      name: 'categoryCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.supplierName`).d('供应商名称'),
      name: 'categoryDescription',
      type: 'string',
    },
  ],
  events: {},
});

export { RiskScanFormDS };
