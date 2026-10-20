/*
 * getDimensionDS - 管控维度DS
 * @Date: 2022-09-22 16:13:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

// 适用范围ds
const getApplyScopeDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'dimensionCode',
        lookupCode: 'SSLM.LIFE_CYCLE_DIMENSION_CODE',
        defaultValue: 'GROUP',
        label: intl.get('sslm.common.view.message.applyDimension').d('适用维度'),
      },
      {
        name: 'dataLevel',
        lookupCode: 'SSLM.LIFE_CYCLE_STAATEGY_DATA_LEVEL_CODE',
        defaultValue: 'SU',
      },
    ],
  };
};

// 管控粒度-公司级ds
const getCompanyDS = ({ strategyId, isEdit = true }) => ({
  autoQuery: true,
  pageSize: 20,
  dataToJSON: 'selected',
  primaryKey: 'companyId',
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'companyNum',
      label: intl.get('sslm.common.view.company.code').d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.companyName').d('公司名称'),
    },
    {
      name: 'assignCompany',
      type: 'object',
      multiple: true,
      lovCode: 'HPFM.PURCHASE_COMPANY',
      lovPara: { tenantId },
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-strategy-dim-sups/${strategyId}/company`,
      method: 'GET',
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-strategy-dim-sups/${strategyId}/company`,
        method: 'DELETE',
        data: data.map(n => n.strategyDimCompanyId),
      };
    },
  },
});
// 管控粒度-公司级columns
const getCompanyColumns = [
  {
    name: 'companyNum',
  },
  {
    name: 'companyName',
  },
];

export { getCompanyDS, getCompanyColumns, getApplyScopeDS };
