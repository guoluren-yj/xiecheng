import intl from 'utils/intl';
import { SRM_SMPC } from '_utils/config';
import { ynDataSet } from '@/routes/product/utilsApi/constant';

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  queryFields: [
    {
      label: intl.get('smpc.product.model.attrCodeAndName').d('属性编码/属性名称'),
      name: 'attributeName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      options: ynDataSet(),
    },
  ],
  fields: [
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
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
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
        url: `${SRM_SMPC}/v1/attribute/page`,
        method: 'GET',
        data,
      };
    },
  },
});

const formDs = () => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.product.model.attrName').d('属性名称'),
      name: 'attributeName',
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
    },
  ],
});

export { formDs, tableDs };
