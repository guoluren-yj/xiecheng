/*
 * @Date: 2022-12-13 16:49:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.LIFE_CYCLE.SUPPLIER_LIST.TABLE_SEARCH_BAR',
  'SSLM.LIFE_CYCLE.SUPPLIER_LIST.TABLE_LIST',
];

// 供应商表格视图ds
export const getSupplierListDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.supplierCompany').d('供应商'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'dimensionCode',
      lookupCode: 'SSLM.LIFE_CYCLE_DIMENSION',
      label: intl.get('sslm.supplierLifeManage.model.supplier.dimension').d('管控维度'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.name').d('公司'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.common.model.stageDescription').d('生命周期阶段'),
    },
    {
      name: 'applyStrategy',
      label: intl.get('sslm.common.view.applyStrategy').d('适用策略'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {} } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycles/lane-all-new`,
        method: 'GET',
        data: {
          ...queryParams,
          customizeUnitCode: customizeUnitCode.join(','),
        },
      };
    },
  },
});
