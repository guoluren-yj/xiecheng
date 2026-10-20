import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const configListDs = () => ({
  autoQuery: true,
  selection: false,
  paging: 'server',
  pageSize: 20,
  primaryKey: 'strategyId',
  cacheSelection: true,
  idField: 'strategyId',
  parentField: 'parentId',
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.status').d('状态'),
      name: 'statusCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.strategyCode').d('策略编码'),
      name: 'strategyCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.strategyName').d('策略名称'),
      name: 'strategyName',
    },
    {
      label: intl.get('sstk.stockConfig.model.batchDimension').d('批次维度'),
      name: 'batchDimension',
    },
    {
      label: intl.get('sstk.common.model.creator').d('创建人'),
      name: 'creator',
    },
    {
      label: intl.get('sstk.stockConfig.model.creationDate').d('创建时间'),
      type: 'dateTime',
      name: 'creationDate',
    },
    {
      label: intl.get('sstk.stockConfig.model.enabledFlag1').d('启用状态'),
      name: 'enabledFlag',
    },
    {
      label: intl.get('sstk.stockConfig.model.versionNum').d('版本'),
      name: 'versionNum',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'action',
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `/stck/v1/${organizationId}/stock-strategy-headers/page`,
      method: 'GET',
      data: { ...data, customizeUnitCode: 'SSTK.STOCK_STRATEGY_CONFIG.LIST.SEARCHBAR' },
    }),
  },
});

export default configListDs;