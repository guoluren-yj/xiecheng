import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_STCK = '/stck';

const stockInfoDS = ({ queryParams = {} }) => ({
  pageSize: 20,
  autoQuery: false,
  primaryKey: 'stockId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sstk.common.model.itemCode').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get('sstk.common.model.itemName').d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get('sstk.common.model.uom').d('单位'),
      name: 'uomName',
    },
    {
      label: intl.get('sstk.common.model.batchNum').d('批次号'),
      name: 'batchNum',
    },
    {
      label: intl.get('sstk.common.model.companyCode').d('公司编码'),
      name: 'companyNum',
    },
    {
      label: intl.get('sstk.common.model.companyName').d('公司名称'),
      name: 'companyName',
    },
    {
      label: intl.get('sstk.common.model.stockOrganizationCode').d('库存组织编码'),
      name: 'invOrganizationCode',
    },
    {
      label: intl.get('sstk.common.model.stockOrganizationName').d('库存组织名称'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get('sstk.common.model.inventoryCode').d('库房编码'),
      name: 'inventoryCode',
    },
    {
      label: intl.get('sstk.common.model.inventoryName').d('库房名称'),
      name: 'inventoryName',
    },
    {
      label: intl.get('sstk.common.model.locationCode').d('库位编码'),
      name: 'locationCode',
    },
    {
      label: intl.get('sstk.common.model.locationName').d('库位名称'),
      name: 'locationName',
    },
    {
      label: intl.get('sstk.common.model.currentStock').d('当前库存'),
      name: 'currentStock',
      type: 'number',
    },
    {
      label: intl.get('sstk.common.model.lockedStock').d('锁定库存'),
      name: 'lockedStock',
      type: 'number',
    },
    {
      label: intl.get('sstk.common.model.totalStock').d('总库存'),
      name: 'totalStock',
      type: 'number',
    },
    {
      label: intl.get('sstk.common.model.warningStock').d('预警库存'),
      name: 'warningStock',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_STCK}/v1/${organizationId}/stocks`,
        method: 'GET',
        data: { ...data, ...queryParams },
      };
    },
  },
});

// 事务报表
const affairInfoDS = (args = {}) => {
  const { queryParams = {}, dsProps = {} } = args;
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'transactionId',
    cacheSelection: true,
    ...dsProps,
    fields: [
      {
        label: intl.get('sstk.stockReportWorkbench.model.transactionCode').d('事务编号'),
        name: 'transactionCode',
      },
      {
        label: intl.get('sstk.stockReportWorkbench.model.transactionType').d('事务类型'),
        name: 'transactionTypeMeaning',
      },
      {
        label: intl.get('sstk.common.model.itemCode').d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sstk.common.model.itemName').d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get('sstk.common.model.uom').d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get('sstk.common.model.batchNum').d('批次号'),
        name: 'batchNum',
      },
      {
        label: intl.get('sstk.stockReportWorkbench.model.operationType').d('事务动作'),
        name: 'operationTypeMeaning',
      },
      {
        label: intl.get('sstk.stockReportWorkbench.model.modifiedNum').d('事务数量'),
        name: 'modifiedNum',
        type: 'number',
      },
      {
        label: intl.get('sstk.common.model.companyCode').d('公司编码'),
        name: 'companyNum',
      },
      {
        label: intl.get('sstk.common.model.companyName').d('公司名称'),
        name: 'companyName',
      },
      {
        label: intl.get('sstk.common.model.stockOrganizationCode').d('库存组织编码'),
        name: 'invOrganizationCode',
      },
      {
        label: intl.get('sstk.common.model.stockOrganizationName').d('库存组织名称'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get('sstk.common.model.inventoryCode').d('库房编码'),
        name: 'inventoryCode',
      },
      {
        label: intl.get('sstk.common.model.inventoryName').d('库房名称'),
        name: 'inventoryName',
      },
      {
        label: intl.get('sstk.common.model.locationCode').d('库位编码'),
        name: 'locationCode',
      },
      {
        label: intl.get('sstk.common.model.locationName').d('库位名称'),
        name: 'locationName',
      },
      {
        label: intl.get('sstk.common.model.sourceCode').d('来源单据号'),
        name: 'sourceCode',
      },
      {
        label: intl.get('sstk.common.model.sourceLineCode').d('行号'),
        name: 'sourceLineCode',
      },
      {
        label: intl.get('sstk.common.model.operator').d('操作人'),
        name: 'operationUserName',
      },
      {
        label: intl.get('sstk.common.model.operatedTime').d('操作时间'),
        type: 'dateTime',
        name: 'operationTime',
      },
      {
        label: intl.get('sstk.common.model.remark').d('备注'),
        name: 'remark',
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_STCK}/v1/${organizationId}/stock-transactions`,
          method: 'GET',
          data: { ...data, ...queryParams },
        };
      },
    },
  };
};

export {
  stockInfoDS,
  affairInfoDS,
};