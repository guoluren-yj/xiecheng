import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { createMethodDataSet } from '@/routes/product/utilsApi/constant';

const organizationId = getCurrentOrganizationId(); // 租户ID

const SRM_SMPC = '/smpc';

const commonFields = () => [
  {
    label: intl.get('smpc.product.model.productNum').d('商品编码'),
    name: 'productNum',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.productName').d('商品名称'),
    name: 'productName',
    type: 'string',
  },
];

const categoryAndItemFields = () => [
  {
    label: intl.get('smpc.materielMapping.view.itemCategoryCode').d('品类编码'),
    name: 'itemCategoryLov',
    type: 'object',
    textField: 'categoryCode',
    valueField: 'categoryId',
    ignore: 'always',
    lovCode: 'SMDM.TREE_ITEM_CATEGORY',
    dynamicProps: ({ record }) => {
      return {
        required: !record.get('itemId'),
        disabled: record.get('itemId'),
      };
    },
    transformResponse: (_, record) => {
      const { categoryId, categoryCode, categoryName } = record;
      return categoryId ? { categoryId, categoryCode, categoryName } : null;
    },
  },
  {
    name: 'categoryId',
    bind: 'itemCategoryLov.categoryId',
  },
  {
    name: 'categoryCode',
    type: 'string',
    bind: 'itemCategoryLov.categoryCode',
  },
  {
    label: intl.get('smpc.materielMapping.view.classifyName').d('品类名称'),
    name: 'categoryName',
    type: 'string',
    bind: 'itemCategoryLov.categoryName',
    disabled: true,
    dynamicProps: ({ record }) => {
      return {
        required: !record.get('itemId'),
      };
    },
  },
  {
    label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    name: 'itemLov',
    type: 'object',
    textField: 'itemCode',
    valueField: 'itemId',
    ignore: 'always',
    lovCode: 'SCEC.CUSTOMER_ITEM',
    dynamicProps: ({ record }) => {
      return {
        required: !record.get('categoryId'),
        disabled: record.get('categoryId'),
      };
    },
    transformResponse: (_, record) => {
      const { itemId, itemCode, itemName } = record;
      return itemId ? { itemId, itemCode, itemName } : null;
    },
  },
  {
    name: 'itemId',
    bind: 'itemLov.itemId',
  },
  {
    name: 'itemCode',
    type: 'string',
    bind: 'itemLov.itemCode',
  },
  {
    label: intl.get('smpc.product.model.itemName').d('物料名称'),
    name: 'itemName',
    type: 'string',
    bind: 'itemLov.itemName',
    disabled: true,
    dynamicProps: ({ record }) => {
      return {
        required: !record.get('categoryId'),
      };
    },
  },
];

const companyAndOrgFields = () => [
  {
    label: intl.get('smpc.product.model.company').d('公司'),
    name: 'companyLov',
    type: 'object',
    textField: 'companyName',
    valueField: 'companyId',
    ignore: 'always',
    lovCode: 'HPFM.COMPANY',
    lovPara: { tenantId: organizationId },
    dynamicProps: ({ record }) => {
      return {
        required: record.get('platFlag') === 0,
        disabled: record.get('platFlag') === 1,
      };
    },
    transformResponse: (_, record) => {
      const { companyId, companyNum, companyName } = record;
      return companyId ? { companyId, companyNum, companyName } : null;
    },
  },
  {
    name: 'companyId',
    bind: 'companyLov.companyId',
  },
  {
    name: 'companyNum',
    type: 'string',
    bind: 'companyLov.companyNum',
  },
  {
    name: 'companyName',
    bind: 'companyLov.companyName',
  },
  {
    label: intl.get('smpc.product.model.inventoryOrganization').d('库存组织'),
    name: 'organizationLov',
    type: 'object',
    textField: 'organizationName',
    valueField: 'invOrganizationId',
    ignore: 'always',
    lovCode: 'SQAM.INVORGNIZATION',
    dynamicProps: ({ record }) => {
      return {
        disabled: !record.get('companyId'),
        lovPara: { companyId: record.get('companyId') },
      };
    },
    transformResponse: (_, record) => {
      const { invOrganizationId, organizationName } = record;
      return invOrganizationId ? { organizationId: invOrganizationId, organizationName } : null;
    },
  },
  { name: 'invOrganizationId', bind: 'companyLov.organizationId' },
  { name: 'organizationName', bind: 'companyLov.organizationName' },
];

const tableDs = () => ({
  autoQuery: true,
  queryFields: [
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierId',
      type: 'object',
      textField: 'supplierCompanyName',
      valueField: 'supplierCompanyId',
      lovCode: 'SMAL.PRODUCT_SUPPLIER',
      transformRequest: (val) => (val || {}).supplierCompanyId,
    },
    ...commonFields(),
    {
      label: intl.get('smpc.product.model.itemAndCategoryCode').d('物料/品类编码'),
      name: 'mappingDataCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.itemAndCategoryName').d('物料/品类名称'),
      name: 'mappingDataName',
      type: 'string',
    },
    // {
    //   label: intl.get('smpc.product.model.item').d('物料'),
    //   name: 'itemId',
    //   type: 'object',
    //   textField: 'itemCode',
    //   valueField: 'itemId',
    //   lovCode: 'SCEC.CUSTOMER_ITEM',
    //   transformRequest: val => (val || {}).itemId,
    // },
    // {
    //   label: intl.get('smpc.product.model.itemCategory').d('品类'),
    //   name: 'categoryId',
    //   type: 'object',
    //   textField: 'categoryCode',
    //   valueField: 'categoryId',
    //   lovCode: 'SMDM.TREE_ITEM_CATEGORY',
    //   transformRequest: val => (val || {}).categoryId,
    // },
    {
      label: intl.get('smpc.product.model.mappingType').d('映射类型'),
      name: 'mappingType',
      type: 'string',
      lookupCode: 'SMPC.ITEM_MAPPING_TYPE',
    },
    {
      label: intl.get('smpc.product.model.mapCreatedMethod').d('映射创建方式'),
      name: 'agreementFlag',
      type: 'number',
      options: createMethodDataSet(),
    },
  ],
  fields: [
    ...commonFields(),
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.thirdProductCode').d('第三方商品编码'),
      name: 'thirdSkuId',
      type: 'string',
    },
    {
      label: intl.get('smpc.materielMapping.model.isGroupFlag').d('是否集采'),
      name: 'platFlag',
      type: 'number',
      // textField: 'meaning',
      // valueField: 'value',
      // ignore: 'always',
      // options: yesOrNodDataSet,
      // transformResponse: (_, record) => {
      //   const { platFlag } = record;
      //   return platFlag;
      // },
    },
    ...companyAndOrgFields(),
    // {
    //   label: intl.get('smpc.product.model.company').d('公司'),
    //   name: 'companyName',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('smpc.product.model.inventoryOrganization').d('库存组织'),
    //   name: 'organizationName',
    //   type: 'string',
    // },
    // ...categoryAndItemFields,
    {
      label: intl.get('smpc.product.model.mappingType').d('映射类型'),
      name: 'mappingType',
      type: 'string',
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'SMPC.ITEM_MAPPING_TYPE',
      required: true,
    },
    {
      label: intl.get('smpc.product.model.itemAndCategoryCode').d('物料/品类编码'),
      name: 'mapLov',
      type: 'object',
      textField: 'mappingDataCode',
      valueField: 'mappingDataCode',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      dynamicProps: ({ record }) => {
        const type = record.get('mappingType');
        return {
          disabled: !type,
          lovCode: type === 'ITEM' ? 'SMAL.CUSTOMER_ITEM' : 'SMDM.ITEM_CATEGORY',
          lovPara: { tenantId: organizationId, ...(type !== 'ITEM' ? { enabledFlag: 1 } : {}) },
        };
      },
      transformResponse: (_, record) => {
        const { mappingData, mappingDataCode, mappingDataName } = record;
        return mappingData ? { mappingData, mappingDataCode, mappingDataName } : null;
      },
    },
    {
      name: 'mappingData',
      bind: 'mapLov.mappingData',
    },
    {
      name: 'mappingDataCode',
      bind: 'mapLov.mappingDataCode',
    },
    {
      label: intl.get('smpc.product.model.itemAndCategoryName').d('物料/品类名称'),
      name: 'mappingDataName',
      type: 'string',
      bind: 'mapLov.mappingDataName',
    },
    // {
    //   label: intl.get('smpc.materielMapping.view.itemCategoryCode').d('品类编码'),
    //   name: 'categoryCode',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('smpc.materielMapping.view.itemCategoryName').d('品类名称'),
    //   name: 'categoryName',
    // },
    // {
    //   label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    //   name: 'itemCode',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('smpc.product.model.itemName').d('物料名称'),
    //   name: 'itemName',
    //   type: 'string',
    // },
    {
      label: intl.get('smpc.product.model.mapCreatedMethod').d('映射创建方式'),
      name: 'agreementFlag',
      type: 'number',
    },
    // {
    //   label: intl.get('smpc.product.model.operation').d('操作'),
    //   name: 'operation',
    // },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.get('agreementFlag') === 1) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/group-product-item-refs`,
        method: 'GET',
        data,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/group-product-item-refs`,
        method: 'PUT',
        data,
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SMPC}/v1/${organizationId}/group-product-item-refs`,
      method: 'POST',
      data,
    }),
  },
});

const formDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierLov',
      type: 'object',
      textField: 'supplierCompanyName',
      valueField: 'supplierCompanyId',
      ignore: 'always',
      lovCode: 'SMAL.PRODUCT_SUPPLIER',
      required: true,
      lovPara: { tenantId: organizationId, companyId: -1 },
      transformResponse: (_, record) => {
        const { supplierId, supplierName } = record;
        return supplierId
          ? { supplierCompanyId: supplierId, supplierCompanyName: supplierName }
          : null;
      },
    },
    {
      name: 'supplierId',
      type: 'string',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierName',
      type: 'string',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      label: intl.get('smpc.product.model.productNum').d('商品编码'),
      name: 'productLov',
      type: 'object',
      textField: 'skuCode',
      valueField: 'productId',
      ignore: 'always',
      lovCode: 'SMAL.GROUP_SKU_VIEW',
      required: true,
      dynamicProps: ({ record }) => {
        return {
          disabled: !record.get('supplierId'),
          lovPara: { supplierCompanyId: record.get('supplierId') },
        };
      },
      transformResponse: (_, record) => {
        const { productId, productNum, productName } = record;
        return productId ? { productId, skuName: productName, skuCode: productNum } : null;
      },
    },
    {
      name: 'productId',
      bind: 'productLov.productId',
    },
    {
      name: 'productNum',
      bind: 'productLov.skuCode',
    },
    {
      label: intl.get('smpc.product.model.productName').d('商品名称'),
      name: 'productName',
      type: 'string',
      required: true,
      bind: 'productLov.skuName',
    },
    {
      label: intl.get('smpc.product.model.thirdProductCode').d('第三方商品编码'),
      name: 'thirdSkuId',
      validator: (value, name, record) => {
        if (value && /^[\u4e00-\u9fa5]+$/.test(value)) {
          record.set(name, '');
          return undefined;
        }
      },
      // bind: 'productLov.thirdSkuId',
    },
    {
      label: intl.get('smpc.materielMapping.model.isGroupFlag').d('是否集采'),
      name: 'platFlag',
      type: 'number',
      falseValue: 0,
      trueValue: 1,
      required: true,
    },
    ...companyAndOrgFields(),
    ...categoryAndItemFields(),
    //   {
    //     label: intl.get('smpc.materielMapping.view.itemCategoryCode').d('品类编码'),
    //     name: 'itemCategoryLov',
    //     type: 'object',
    //     textField: 'categoryCode',
    //     valueField: 'categoryId',
    //     ignore: 'always',
    //     lovCode: 'SMDM.TREE_ITEM_CATEGORY',
    //     dynamicProps: ({ record }) => {
    //       return {
    //         required: !record.get('itemId'),
    //         disabled: record.get('itemId'),
    //       };
    //     },
    //     transformResponse: (_, record) => {
    //       const { categoryId, categoryCode, categoryName } = record;
    //       return categoryId ? { categoryId, categoryCode, categoryName } : null;
    //     },
    //   },
    //   {
    //     name: 'categoryId',
    //     bind: 'categoryLov.categoryId',
    //   },
    //   {
    //     name: 'categoryCode',
    //     type: 'string',
    //     bind: 'categoryLov.categoryCode',
    //   },
    //   {
    //     label: intl.get('smpc.materielMapping.view.itemCategoryName').d('品类名称'),
    //     name: 'categoryName',
    //     type: 'string',
    //     bind: 'categoryLov.categoryName',
    //     disabled: true,
    //     dynamicProps: ({ record }) => {
    //       return {
    //         required: !record.get('itemId'),
    //       };
    //     },
    //   },
    //   {
    //     label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    //     name: 'itemLov',
    //     type: 'object',
    //     textField: 'itemCode',
    //     valueField: 'itemId',
    //     ignore: 'always',
    //     lovCode: 'SCEC.CUSTOMER_ITEM',
    //     dynamicProps: ({ record }) => {
    //       return {
    //         required: !record.get('categoryId'),
    //         disabled: record.get('categoryId'),
    //       };
    //     },
    //     transformResponse: (_, record) => {
    //       const { itemId, itemCode, itemName } = record;
    //       return itemId ? { itemId, itemCode, itemName } : null;
    //     },
    //   },
    //   {
    //     name: 'itemId',
    //     bind: 'itemLov.itemId',
    //   },
    //   {
    //     name: 'itemCode',
    //     type: 'string',
    //     bind: 'itemLov.itemCode',
    //   },
    //   {
    //     label: intl.get('smpc.product.model.itemName').d('物料名称'),
    //     name: 'itemName',
    //     type: 'string',
    //     bind: 'itemLov.itemName',
    //     disabled: true,
    //     dynamicProps: ({ record }) => {
    //       return {
    //         required: !record.get('categoryId'),
    //       };
    //     },
    //   },
  ],
});

const batchFormDs = () => ({
  autoQuery: false,
  fields: categoryAndItemFields(),
});

export { formDs, tableDs, batchFormDs };
