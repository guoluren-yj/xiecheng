import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
// import { enabledDataSet } from '@/routes/product/utilsApi/constant';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

const flatTree = (tree = []) => {
  let flat = [];
  const fn = (list) => {
    flat = [...flat, ...list];
    list.forEach((item) => {
      if (item.childs && item.childs.length > 0) {
        fn(item.childs);
      }
    });
  };
  fn(tree);
  return flat;
};

const commonFields = () => [
  {
    label: intl.get('smpc.product.model.catalogCode').d('目录编码'),
    name: 'catalogCode',
    type: 'string',
    display: true,
  },
  {
    label: intl.get('smpc.product.model.catalogName').d('目录名称'),
    name: 'catalogName',
    type: 'string',
    display: true,
  },
];

const tableDs = () => ({
  autoQuery: false,
  pageSize: 20,
  paging: 'server',
  modifiedCheck: false,
  queryFields: [
    {
      label: intl.get('smpc.product.model.catalogCodeOrName').d('目录编码、名称'),
      name: 'catalogNameOrCode',
      type: 'string',
      merge: true,
    },
    // ...commonFields(),
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      // type: 'number',
      lookupCode: 'HPFM.ENABLED_FLAG',
      display: true,
    },
    // {
    //   name: 'lastUpdateDate',
    //   label: intl.get('smpc.product.view.updateTime').d('更新时间'),
    //   sortFlag: true,
    //   visible: false,
    // },
  ],
  primaryKey: 'catalogId',
  // expandField: 'expand',
  idField: 'catalogId',
  parentField: 'parentCatalogId',
  fields: [
    ...commonFields(),
    {
      name: 'expand',
      type: 'boolean',
    },
    {
      name: 'loaded',
      type: 'boolean',
    },
    // 条件查询时， 接口返回字段（子集合）
    {
      name: 'subCatalogs',
    },
    {
      label: intl.get('smpc.product.model.catalogLevel').d('目录层级'),
      name: 'level',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.orderSeqNum').d('排序号'),
      name: 'orderSeq',
      type: 'number',
      step: 1,
      min: 0,
      help: intl
        .get('smpc.catalogManage.model.orderSeqNumTip')
        .d('商城首页的目录按排序号的顺序展示'),
      // required: true,
    },
    {
      label: intl.get('smpc.catalogManage.model.sourceFrom').d('目录来源'),
      name: 'sourceFromMeaning',
    },
    {
      label: intl.get('smpc.catalogManage.model.skuCount').d('商品数量'),
      name: 'skuCount',
      type: 'number',
    },
    {
      name: 'shelfSkuCount',
      type: 'number',
      label: intl.get('smpc.catalogManage.view.shelfSkuCount').d('上架商品数量'),
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      // 查询条件目录编码和名称有值时全部展开，不掉子目录查询接口
      // 待和后端确认？？
      const { catalogNameOrCode } = dataSet.queryDataSet.toData()[0];
      const loaded = !!catalogNameOrCode;

      const deepAppend = (r) => {
        if (r.subCatalogs && r.subCatalogs.length) {
          dataSet.appendData(r.subCatalogs);
          r.subCatalogs.forEach((f) => deepAppend(f));
        }
      };
      if (loaded) {
        dataSet.forEach((record) => {
          const child = record.get('subCatalogs');
          if (child && child.length > 0) {
            dataSet.appendData(child);
            child.forEach((f) => deepAppend(f));
          }
        });
        // 展开
        dataSet.forEach((record) => {
          Object.assign(record, { isExpanded: true });
        });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/catalogs`,
        method: 'GET',
        data,
      };
    },
    submit: {
      url: `${SRM_SMPC}/v1/${organizationId}/catalogs/update-order-seq`,
      method: 'POST',
    },
  },
});

const formDs = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'parentCatalogId',
    },
    {
      label: intl.get('smpc.product.model.catalogCode').d('目录编码'),
      name: 'catalogCode',
      type: 'string',
      required: true,
      validator: (value, name, record) => {
        if (value && /^[\u4e00-\u9fa5]+$/.test(value)) {
          record.set(name, '');
          return undefined;
        }
      },
      dynamicProps: {
        disabled: ({ record }) => record.get('catalogId'),
      },
    },
    {
      label: intl.get('smpc.product.model.catalogName').d('目录名称'),
      name: 'catalogName',
      type: 'intl',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('sourceFrom') === 'EXTERNAL',
      },
    },
    {
      label: intl.get('smpc.product.model.preCatalog').d('上级目录'),
      name: 'parentCatalogLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMPC.CATALOG_LEVEL',
      textField: 'catalogName',
      idField: 'catalogId',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          level: +record.get('level') - 1,
        }),
      },
      transformResponse: (_, record) =>
        record.parentCatalogId
          ? {
              catalogId: record.parentCatalogId,
              catalogName: record.parentCatalogName,
            }
          : null,
    },
    {
      name: 'parentCatalogId',
      bind: 'parentCatalogLov.catalogId',
    },
    {
      label: intl.get('smpc.product.model.orderSeqNum').d('排序号'),
      name: 'orderSeq',
      type: 'number',
      step: 1,
      min: 0,
      // dynamicProps: {
      //   disabled: ({ record }) => record.get('level') === 1,
      // },
    },
    {
      label: intl.get('smpc.product.model.mobileIconPath').d('移动端icon'),
      name: 'iconUrl',
      type: 'string',
    },
    {
      name: 'financialSubjects',
      defaultValue: [],
    },
  ],
});

const companyFields = [
  {
    label: intl.get('smpc.product.model.companyCode').d('公司编码'),
    name: 'companyNum',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.companyName').d('公司名称'),
    name: 'companyName',
    type: 'string',
  },
];
const companyTableDs = (catalogId) => ({
  autoQuery: true,
  primaryKey: 'companyId',
  cacheSelection: true,
  queryFields: companyFields,
  fields: [...companyFields, { name: 'invisibleFlag', type: 'number' }],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('invisibleFlag') === 1) {
          Object.assign(record, { isSelected: true });
        }
      });
    },
    unSelect: ({ record }) => {
      record.set('invisibleFlag', 0);
    },
    select: ({ record }) => {
      record.set('invisibleFlag', 1);
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.selected.forEach((record) => {
        record.set('invisibleFlag', 0);
      });
    },
    selectAll: ({ dataSet }) => {
      dataSet.selected.forEach((record) => {
        record.set('invisibleFlag', 1);
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/invisible-catalogs/${catalogId}`,
        method: 'GET',
        data,
      };
    },
  },
});

const categoryTables = () => ({
  autoQuery: false,
  paging: false,
  selection: false,
  primaryKey: 'categoryId',
  checkField: 'checked',
  expandField: 'expand',
  idField: 'categoryId',
  parentField: 'parentCategoryId',
  queryFields: [
    {
      name: 'categoryName',
      type: 'string',
    },
    {
      name: 'hasSkuFlag',
      type: 'boolean',
    },
  ],
  fields: [
    {
      name: 'categoryId',
    },
    {
      name: 'categoryName',
      type: 'string',
    },
    {
      name: 'checked',
      type: 'boolean',
      transformResponse: (_, record) => {
        return record.createCatalogFlag;
      },
    },
    {
      name: 'expand',
      type: 'boolean',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/catalogs/category-ref`,
        method: 'GET',
        data,
        transformResponse: (result) => {
          const res = JSON.parse(result);
          if (Array.isArray(res)) {
            return [
              {
                level: 0,
                expand: true,
                categoryId: 0,
                categoryName: intl.get('smpc.catalogManage.view.title.allCategory').d('全部分类'),
              },
              ...flatTree(res),
            ];
          } else if (res.failed) {
            notification.error({
              message: res.message,
            });
            return [];
          } else return [];
        },
      };
    },
  },
  // events: {
  //   load: ({ dataSet }) => {
  //     dataSet.forEach(record => {
  //       Object.assign(record, { selectable: false });
  //     });
  //   },
  // unSelect: ({ record }) => {
  //   record.set('invisibleFlag', 0);
  // },
  // select: ({ record }) => {
  //   record.set('invisibleFlag', 1);
  // },
  // unSelectAll: ({ dataSet }) => {
  //   dataSet.selected.forEach(record => {
  //     record.set('invisibleFlag', 0);
  //   });
  // },
  // selectAll: ({ dataSet }) => {
  //   dataSet.selected.forEach(record => {
  //     record.set('invisibleFlag', 1);
  //   });
  // },
  // },
});

const categoryFormDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.catalogManage.model.replaceCategory').d('是否替换原有目录映射'),
      name: 'rewriteFlag',
      type: 'boolean',
    },
    {
      label: intl.get('smpc.catalogManage.model.quoteCategory').d('是否引用现有商品分类生成目录'),
      name: 'hasSkuFlag',
      type: 'boolean',
    },
    {
      label: intl.get('smpc.product.view.classifyName').d('分类名称'),
      name: 'categoryName',
      type: 'string',
    },
  ],
});

export { formDs, tableDs, companyTableDs, categoryFormDs, categoryTables };
