import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

const commonFields = () => [
  {
    label: intl.get('smpc.product.model.labelCode').d('标签编码'),
    name: 'labelCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.labelName').d('标签名称'),
    name: 'labelName',
    type: 'string',
  },
];

const tableFields = () => [
  {
    label: intl.get('smpc.product.model.goodsStatus').d('商品状态'),
    name: 'skuStatus',
  },
  {
    label: intl.get('smpc.product.model.productCode').d('商品编码'),
    name: 'skuCode',
  },
  {
    label: intl.get('smpc.product.view.skuName').d('商品名称'),
    name: 'skuName',
  },
  {
    label: intl.get('smpc.product.view.skuGroupCode').d('商品组编码'),
    name: 'spuCode',
  },
  {
    label: intl.get('smpc.product.view.platformCategory').d('平台分类'),
    name: 'categoryNamePath',
  },
  {
    label: intl.get('smpc.product.model.skuInfo').d('商品信息'),
    name: 'skuInfo',
    type: 'object',
  },
  {
    label: intl.get('smpc.product.model.productLabel').d('商品标签'),
    name: 'labels',
  },
  {
    label: intl.get('smpc.product.model.itemInfo').d('物料信息'),
    name: 'itemInfo',
    transformResponse: (_, record) => {
      return {
        itemCode: record.itemCode,
        itemName: record.itemName,
      };
    },
  },
  {
    label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    name: 'itemCode',
    type: 'string',
    bind: 'itemInfo.itemCode',
  },
  {
    label: intl.get('smpc.product.model.itemName').d('物料名称'),
    name: 'itemName',
    type: 'string',
    bind: 'itemInfo.itemName',
  },
  {
    name: 'supplierCompanyName',
    label: intl.get('smpc.product.view.supplier').d('供应商'),
  },
  {
    label: intl.get('smpc.product.model.operation').d('操作'),
    name: 'operation',
    type: 'object',
  },
];

const tableQueryFields = () => [
  {
    label: intl.get('smpc.product.model.productCode').d('商品编码'),
    name: 'skuCode',
  },
  {
    label: intl.get('smpc.product.view.skuName').d('商品名称'),
    name: 'skuName',
  },
  {
    name: 'skuType',
    type: 'string',
    required: true,
    defaultValue: 'CATA',
    lookupCode: 'SMAL.PRODUCT_SOURCE_FROM',
    label: intl.get('smpc.product.model.productSource').d('商品来源'),
  },
  // {
  //   name: 'skuName',
  //   type: 'string',
  //   label: intl.get('smpc.product.model.productCodeName').d('商品编码/名称'),
  // },
  {
    label: intl.get('smpc.product.model.productLabel').d('商品标签'),
    name: 'labels',
    type: 'object',
    lovCode: 'SMPC.SKU_LABEL',
    multiple: true,
  },
  {
    label: intl.get('smpc.product.model.goodsStatus').d('商品状态'),
    name: 'shelfFlag',
    type: 'number',
    lookupCode: 'SMPC.PUR_SKU_STATUS',
  },
  // {
  //   label: intl.get('smpc.product.model.productGroupCode').d('商品组编码'),
  //   name: 'spuCode',
  //   type: 'string',
  // },
  // {
  //   name: 'itemCode',
  //   type: 'string',
  //   label: intl.get('smpc.product.model.itemCode').d('物料编码'),
  // },
  // {
  //   name: 'itemName',
  //   type: 'string',
  //   label: intl.get('smpc.product.model.itemName').d('物料名称'),
  // },
  {
    name: 'itemObj',
    type: 'object',
    label: intl.get('smpc.product.model.item').d('物料'),
    lovPara: { tenantId: organizationId },
    lovCode: 'SMAL.CUSTOMER_ITEM',
    ignore: 'always',
    textField: 'itemName',
    valueField: 'itemId',
  },
  {
    name: 'itemId',
    bind: 'itemObj.itemId',
  },
  {
    name: 'supplier',
    type: 'object',
    ignore: 'always',
    label: intl.get('smpc.product.view.supplier').d('供应商'),
    lovCode: 'SMPC.TENANT_SUPPLIER_ALL',
    lovPara: { tenantId: organizationId },
    textField: 'supplierCompanyName',
    valueField: 'supplierCompanyId',
  },
  {
    name: 'supplierCompanyId',
    bind: 'supplier.supplierCompanyId',
  },
  {
    name: 'supplierTenantId',
    bind: 'supplier.supplierTenantId',
  },
  {
    label: intl.get('smpc.product.model.category').d('分类'),
    name: 'categoryId',
    type: 'object',
    valueField: 'categoryId',
    textField: 'categoryName',
    lovCode: 'SMPC.CATEGORY',
    transformRequest: (val) => (val || {}).categoryId,
  },
];

const tableDs = () => ({
  autoQuery: true,
  queryFields: [...tableQueryFields()],
  fields: [...tableFields()],
  transport: {
    read: ({ data }) => {
      const { labels, ...other } = data;
      const labelParams = {};
      if (labels && labels.length > 0) {
        labelParams.labelIds = labels.map((m) => m.labelId).join(',');
        labelParams.labelCodes = labels.map((m) => m.labelCode).join(',');
      }
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/pur-skus/new`,
        method: 'GET',
        data: {
          ...other,
          ...labelParams,
          supFlag: 0,
          receiveFlag: 2,
          tenantId: organizationId,
        },
      };
    },
  },
});

const labelIsUnSelect = (label) => label.skuLabelSources && label.skuLabelSources.length > 0;

const handleSelectChange = ({ dataSet, record, type, selected }) => {
  const data = dataSet.toData();
  const fixLabels = data.filter(labelIsUnSelect);
  if (type === 'select') {
    const newData = [...data, record.toData()];
    dataSet.loadData(newData);
  }
  if (type === 'unSelect') {
    const newData = data.filter((f) => f.labelId !== record.get('labelId'));
    dataSet.loadData(newData);
  }
  if (type === 'selectAll') {
    const filterData = data.filter(
      (f) => labelIsUnSelect(f) || !selected.some((s) => s.get('labelId') === f.labelId)
    );
    const newSelects = selected
      .map((m) => m.toData())
      .filter((f) => !fixLabels.some((s) => s.labelId === f.labelId));
    const newData = [...filterData, ...newSelects];
    dataSet.loadData(newData);
  }
  if (type === 'unSelectAll') {
    const newData = data.filter(
      (f) => labelIsUnSelect(f) || !selected.some((s) => s.get('labelId') === f.labelId)
    );
    dataSet.loadData(newData);
  }
};

const labelTableDs = (selectDs, selectSupplierCompanyIds = []) => ({
  autoQuery: true,
  primaryKey: 'labelId',
  cacheSelection: true,
  modifiedCheck: false,
  queryFields: [
    {
      label: intl.get('smpc.product.model.labelCodeAndName').d('标签编码/标签名称'),
      name: 'labelName',
      type: 'string',
    },
  ],
  record: {
    dynamicProps: {
      // 与商品供应商一致的标签可勾选
      selectable: (record) => {
        // 接口无 labelSuppliers， 则适用于全部供应商
        const labelSuppliers = record.get('labelSuppliers');
        if (!labelSuppliers) return true;
        // 否则labelSuppliers 与 selectSupplierCompanyIds取交集
        const results = selectSupplierCompanyIds.map((id) => {
          if ((labelSuppliers || []).find((f) => f.supplierCompanyId === id)) {
            return true;
          }
          return false;
        });
        return !results.some((flag) => flag === false);
      },
    },
  },
  fields: [
    ...commonFields(),
    {
      label: intl.get('smpc.product.model.labelPreview').d('标签预览'),
      name: 'labelPreview',
    },
    {
      name: 'orderSeq',
      type: 'number',
    },
    {
      name: 'skuId',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const selectData = selectDs.toData();
        const label = selectData.find((l) => l.labelId === record.get('labelId'));
        if (label) {
          record.set('orderSeq', label.orderSeq);
          record.set('skuId', label.skuId);
          Object.assign(record, { isSelected: true, selectable: !labelIsUnSelect(label) });
        }
      });
    },
    unSelect: ({ record }) => {
      record.set('orderSeq', 0);
      handleSelectChange({ dataSet: selectDs, type: 'unSelect', record });
    },
    select: ({ record, dataSet }) => {
      record.set('orderSeq', dataSet.selected.length);
      handleSelectChange({ dataSet: selectDs, type: 'select', record });
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.records.forEach((record) => {
        record.set('orderSeq', 0);
      });
      handleSelectChange({ dataSet: selectDs, type: 'unSelectAll', selected: dataSet.records });
    },
    selectAll: ({ dataSet }) => {
      dataSet.selected.forEach((record, index) => {
        record.set('orderSeq', index + 1);
      });
      handleSelectChange({ dataSet: selectDs, type: 'selectAll', selected: dataSet.selected });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/labels`,
        method: 'GET',
        data: { ...data, enabledFlag: 1 },
      };
    },
  },
});

export { tableDs, labelTableDs };
