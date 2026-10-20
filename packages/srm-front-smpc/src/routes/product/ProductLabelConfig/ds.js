import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();
const isPlatform = organizationId === 0; // 是否为平台级

const commonFields = () => [
  {
    label: intl.get('smpc.product.model.labelStatus').d('标签状态'),
    name: 'enabledFlag',
    type: 'boolean',
    trueValue: 1,
    falseValue: 0,
    // required: true,
    defaultValue: 1,
    // disabled: isPlatform,
    // dynamicProps: ({ record }) => {
    //   return {
    //     disabled: isPlatform || record.get('labelId'),
    //   };
    // },
  },
  {
    label: intl.get('smpc.product.model.labelCode').d('标签编码'),
    name: 'labelCode',
    type: 'string',
    pattern: /[\d\w]+/,
    required: true,
    dynamicProps: ({ record }) => {
      return {
        disabled: record.get('labelId'),
      };
    },
  },
  {
    label: intl.get('smpc.product.model.labelName').d('标签名称'),
    name: 'labelName',
    type: 'intl',
    required: true,
  },
];

const getSupplierFields = () => {
  return isPlatform
    ? []
    : [
        {
          label: intl.get('smpc.product.model.supplier').d('供应商'),
          name: 'supplierLov',
          type: 'object',
          lovCode: 'SMAL.SUPPLIER_BY_PUR',
          textField: 'supplierName',
          valueField: 'supplierId',
          ignore: 'always',
          display: true,
          lovPara: { tenantId: organizationId },
          // dynamicProps: {
          //   disabled: ({ record }) => record.get('labelId'),
          // },
        },
        {
          name: 'supplierTenantId',
          // bind: 'supplierLov.supplierTenantId',
          visible: false,
          forceQuery: true,
          transformValue: (value, record) => record.get('supplierLov')?.supplierTenantId,
        },
        {
          name: 'supplierCompanyId',
          visible: false,
          forceQuery: true,
          transformValue: (value, record) => record.get('supplierLov')?.supplierId,
        },
        {
          name: 'supplierCompanyName',
          visible: false,
          forceQuery: true,
          transformValue: (value, record) => record.get('supplierLov')?.supplierName,
        },
      ];
};

const tableDs = () => ({
  // autoQuery: true,
  pageSize: 20,
  cacheSelection: true,
  primaryKey: 'labelId',
  selection: isPlatform ? false : 'multiple',
  record: {
    dynamicProps: {
      // 预定义不能启用禁用（头上按钮）
      selectable: (record) => record.get('customFlag') !== 0,
    },
  },
  queryFields: [
    {
      label: intl.get('smpc.product.model.labelCodeAndName').d('标签编码、名称'),
      name: 'labelName',
      merge: true,
    },
    {
      label: intl.get('smpc.product.model.labelStatus').d('标签状态'),
      name: 'enabledFlag',
      // type: 'number',
      lookupCode: 'HPFM.ENABLED_FLAG',
      display: true,
    },
    {
      name: 'lastUpdateDate',
      label: intl.get('smpc.product.view.updateTime').d('更新时间'),
      sortFlag: true,
      visible: false,
    },
    ...getSupplierFields(),
  ],
  fields: [
    ...commonFields(),
    {
      label: intl.get('smpc.product.model.labelColor').d('标签颜色'),
      name: 'labelColorCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('smpc.product.model.labelType').d('标签类型'),
      name: 'customFlagMeaning',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
      type: 'object',
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'labelSuppliers',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: isPlatform ? `${SRM_SMPC}/v1/labels` : `${SRM_SMPC}/v1/${organizationId}/labels`,
        method: 'GET',
        data,
      };
    },
  },
});

const formDs = () => ({
  autoQuery: false,
  fields: [
    ...commonFields(),
    {
      name: 'labelColorCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'labelSuppliers',
      type: 'object',
      multiple: true,
      lovCode: 'SMAL.SUPPLIER_BY_PUR',
      textField: 'supplierName',
      valueField: 'supplierId',
      // ignore: 'always',
      lovPara: { tenantId: organizationId },
      transformResponse: (_, record) => {
        return record.labelSuppliers
          ? record.labelSuppliers.map((m) => ({
              ...m,
              supplierName: m.supplierCompanyName,
              supplierId: m.supplierCompanyId,
            }))
          : null;
      },
      transformRequest: (_, record) => {
        return record.get('labelSuppliers').map((m) => ({
          supplierCompanyId: m.supplierId,
          supplierCompanyName: m.supplierName,
          supplierTenantId: m.supplierTenantId,
        }));
      },
    },
    // {
    //   name: 'supplierCompanyId',
    //   bind: `labelSuppliers.supplierId`,
    // },
    // {
    //   name: 'supplierCompanyName',
    //   bind: `labelSuppliers.supplierName`,
    // },
    // {
    //   name: 'supplierTenantId',
    //   bind: 'labelSuppliers.supplierTenantId',
    // },
  ],
});

export { formDs, tableDs };
