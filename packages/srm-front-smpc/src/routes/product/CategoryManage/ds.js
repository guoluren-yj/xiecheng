import intl from 'utils/intl';
import { enabledDataSet } from '@/routes/product/utilsApi/constant';

const SRM_SMPC = '/smpc';

const categoryCommonFields = () => [
  {
    label: intl.get('smpc.product.view.categoryCode').d('分类编码'),
    name: 'categoryCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.view.categoryName').d('分类名称'),
    name: 'categoryName',
    type: 'string',
  },
];

const operation = {
  label: intl.get('hzero.common.action').d('操作'),
  name: 'operation',
};

const categoryFields = () => [
  ...categoryCommonFields(),
  {
    label: intl.get('smpc.product.model.keyword').d('关键词'),
    name: 'keyWords',
  },
  {
    label: intl.get('smpc.product.model.status').d('状态'),
    name: 'enabledFlag',
    type: 'number',
    options: enabledDataSet(),
  },
  {
    label: intl.get('smpc.product.model.goods').d('商品'),
    name: 'goodCount',
    type: 'number',
  },
  operation,
];

const categoryTableDs = () => ({
  autoQuery: false,
  selection: false,
  paging: false,
  queryFields: categoryCommonFields(),
  fields: categoryFields(),
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/category/list`,
        method: 'GET',
        data,
      };
    },
  },
});

const treeTableDs = (lookNextLevel, manageAttr) => ({
  autoQuery: true,
  paging: false,
  selection: 'single',
  parentField: 'parentId',
  expandField: 'expand',
  idField: 'categoryId',
  fields: [
    ...categoryFields(),
    { name: 'loaded', type: 'boolean' },
    { name: 'expand', type: 'boolean', transformResponse: (_, record) => !!record.expand },
  ],
  events: {
    select: ({ record }) => {
      const line = record.toData();
      if (line.level === 3 && typeof manageAttr === 'function') {
        manageAttr(line);
      } else if (line.level < 3 && typeof lookNextLevel === 'function') {
        lookNextLevel(line, line.level + 1);
      }
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/category/list`,
        method: 'GET',
        data: { ...data, parentCategoryId: 0 },
      };
    },
  },
});

const categoryFormDs = () => ({
  autoQuery: false,
  fields: [
    { name: 'level', type: 'number' },
    { name: 'categoryId' },
    { name: 'parentId' },
    {
      label: intl.get('smpc.product.model.parentCategoryName').d('父类名称'),
      name: 'parentCategoryName',
      type: 'string',
      disabled: true,
    },
    {
      label: intl.get('smpc.product.view.categoryName').d('分类名称'),
      name: 'categoryName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      trueValue: 1,
      falseValue: 0,
      required: true,
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('categoryId'),
        };
      },
    },
  ],
});

const attrFields = () => [
  {
    label: intl.get('smpc.product.model.attrCode').d('属性编码'),
    name: 'attributeCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.attrName').d('属性名称'),
    name: 'attributeName',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.basicProperty').d('基本属性'),
    name: 'baseAttrFlag',
    type: 'number',
  },
  {
    label: intl.get('smpc.product.model.isRequired').d('是否必填'),
    name: 'requiredFlag',
    type: 'number',
  },
  {
    label: intl.get('smpc.product.model.setMethod').d('设置方式'),
    name: 'operationType', // 1：单选；0：多选；2：文本；3：布尔值
    type: 'number',
  },
  {
    label: intl.get('smpc.product.model.valueCustom').d('自定义属性值'),
    name: 'valueCustom',
    type: 'number',
  },
  {
    label: intl.get('smpc.product.model.fillInFormat').d('填写格式要求'),
    name: 'fillInFormat',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.isEffective').d('是否有效'),
    name: 'enabledFlag',
    type: 'number',
  },
  operation,
];

const attrTableDs = (baseAttrFlag = undefined) => ({
  autoQuery: false,
  selection: false,
  fields: attrFields(),
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/category-attrs/query-attrs`,
        method: 'GET',
        data: { ...data, baseAttrFlag },
      };
    },
  },
});

const attrFormDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.product.model.attrName').d('属性名称'),
      name: 'attrLov',
      type: 'object',
      textField: 'attributeName',
      valueField: 'attributeId',
      required: true,
      ignore: 'always',
      lovCode: 'SMPC.ATTRIBUTE',
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('categoryAttrId'),
        };
      },
      transformResponse: (_, record) => {
        const { attributeId, attributeName } = record;
        return attributeId ? { attributeId, attributeName } : null;
      },
    },
    {
      name: 'attrId',
      bind: 'attrLov.attributeId',
    },
    {
      name: 'attributeName',
      bind: 'attrLov.attributeName',
    },
    { name: 'categoryId' },
    {
      label: intl.get('smpc.product.model.setMethod').d('设置方式'),
      name: 'operationType',
      type: 'number',
      required: true,
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('categoryAttrId'),
        };
      },
    },
    {
      label: intl.get('smpc.product.model.valueCustom').d('自定义属性值'),
      name: 'valueCustom',
      type: 'number',
      required: true,
      dynamicProps: ({ record }) => {
        // 设置方式为文本(2)时,自定义属性值锁定为支持;为布尔值(3)时,自定义属性值锁定为不支持
        // 不支持可变更为支持，支持不可变更为不支持
        const id = record.get('categoryAttrId');
        const type = record.get('operationType');
        const c = record.get('valueCustom');
        return {
          disabled: (id && c === 1) || (!id && (type === 2 || type === 3)),
        };
      },
    },
    {
      label: intl.get('smpc.product.model.fillInFormat').d('填写格式要求'),
      name: 'fillInFormat',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.isRequired').d('是否必填'),
      name: 'requiredFlag',
      type: 'number',
      trueValue: 1,
      falseValue: 0,
      required: true,
      dynamicProps: ({ record }) => {
        // 必填可变更为非必填，非必填不可变更为必填
        return {
          disabled: record.get('categoryAttrId') && record.get('requiredFlag') === 0,
        };
      },
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      trueValue: 1,
      falseValue: 0,
      required: true,
      dynamicProps: ({ record }) => {
        // 必填=0 都可修改；必填=1：有效可变更为无效，无效不可变更为有效
        return {
          disabled:
            record.get('categoryAttrId') &&
            record.get('requiredFlag') === 1 &&
            record.get('enabledFlag') === 0,
        };
      },
    },
  ],
});

const attrValFields = () => [
  {
    label: intl.get('smpc.product.model.brandCode').d('品牌编码'),
    name: 'brandCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.brandName').d('品牌名称'),
    name: 'brandName',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.attrValCode').d('属性值编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.attrValName').d('属性值名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.status').d('状态'),
    name: 'enabledFlag',
    type: 'number',
  },
  operation,
];

const attrValTableDs = (categoryId, attrId, isBrand = false) => ({
  autoQuery: true,
  selection: false,
  fields: attrValFields(),
  transport: {
    read: ({ data }) => {
      return {
        url: isBrand
          ? `${SRM_SMPC}/v1/brand/list`
          : `${SRM_SMPC}/v1/category-attr-vals/query-attr-vals`,
        method: 'GET',
        data: { ...data, categoryId, attrId },
      };
    },
  },
});

const attrValFormDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.product.model.attrValName').d('属性值名称'),
      name: 'attrValLov',
      type: 'object',
      required: true,
      ignore: 'always',
      textField: 'attrValueName',
      valueField: 'attrValueId',
      lovCode: 'SMPC.ATTR_VALUE',
      transformResponse: (_, record) => {
        const { attrValueId, attrValueName } = record;
        return attrValueId ? { attrValueId, attrValueName } : null;
      },
    },
    {
      name: 'attrValueId',
      bind: 'attrValLov.attrValueId',
    },
    {
      name: 'attrValueName',
      bind: 'attrValLov.attrValueName',
    },
    { name: 'attrId' },
    { name: 'categoryId' },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      trueValue: 1,
      falseValue: 0,
      required: true,
    },
  ],
});

export {
  attrFormDs,
  attrTableDs,
  attrValFormDs,
  attrValTableDs,
  treeTableDs,
  categoryFormDs,
  categoryTableDs,
};
