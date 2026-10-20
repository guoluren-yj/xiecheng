import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';
// import a from '_util/s/config';

const SRM_SMKT = '/smkt';
const organizationId = getCurrentOrganizationId();

const deepExpand = (ds) => {
  // eslint-disable-next-line no-unused-expressions
  ds?.records?.forEach((r) => {
    const _r = r;
    _r.isExpanded = true;
    if (r.get('parentFlag')) {
      deepExpand(r.children);
    }
  });
};

const tableDs = () => ({
  autoQuery: true,
  paging: 'server',
  pageSize: 20,
  modifiedCheck: false,
  primaryKey: 'catalogId',
  expandField: 'expand',
  idField: 'catalogId',
  parentField: 'parentCatalogId',
  fields: [
    {
      label: intl.get('smpc.product.model.catalogCode').d('目录编码'),
      name: 'catalogCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.catalogName').d('目录名称'),
      name: 'catalogName',
      type: 'string',
    },
    {
      name: 'subCatalogs',
    },
    {
      label: intl.get('smkt.catalogManage.model.catalogLevel').d('层级'),
      name: 'catalogLevel',
      type: 'number',
    },
    {
      label: intl.get('smkt.catalogManage.model.orderSeqNum').d('排序'),
      name: 'orderSeq',
      type: 'number',
      step: 1,
      min: 0,
    },
    {
      label: intl.get('smkt.catalogManage.model.skuCount').d('商品数量'),
      name: 'skuCount',
      type: 'number',
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'status',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMKT}/v1/${organizationId}/sku-catalogs`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMKT.SALE.CATALOG.SEARCHBAR',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      // 查询条件目录编码和名称有值时全部展开
      const { catalogCode, catalogName, status } = dataSet.queryDataSet?.toData()[0] || {};
      const statusFlag = ['0', '1'].includes(status);
      const loaded = !!(catalogCode || catalogName || statusFlag);
      const deepAppend = (r) => {
        if (r.childCatalogs && r.childCatalogs.length) {
          dataSet.appendData(r.childCatalogs);
          r.childCatalogs.forEach((f) => deepAppend(f));
        }
      };
      if (loaded) {
        dataSet.forEach((record) => {
          const child = record.get('childCatalogs');
          if (child && child.length > 0) {
            dataSet.appendData(child);
            child.forEach((f) => deepAppend(f));
          }
        });
        deepExpand(dataSet);
      }
    },
  },
});

const formDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('smpc.product.model.catalogCode').d('目录编码'),
      name: 'catalogCode',
      required: true,
    },
    {
      label: intl.get('smpc.product.model.catalogName').d('目录名称'),
      name: 'catalogName',
      required: true,
    },
    {
      label: intl.get('smkt.catalogManage.model.orderSeqNum').d('排序'),
      name: 'orderSeq',
      type: 'number',
      step: 1,
      min: 0,
      required: true,
    },
  ],
  transport: {
    submit: {
      // url: `${SRM_SMPC}/v1/${organizationId}/catalogs/update-order-seq`,
      // method: 'POST',
    },
  },
});

export { tableDs, formDs };
