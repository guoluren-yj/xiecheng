import { isNumber } from 'lodash';
import intl from 'utils/intl';
import { SRM_SMPC } from '_utils/config';
import { ynDataSet } from '@/routes/product/utilsApi/constant';

const commonFields = () => [
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
];

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  queryFields: [
    {
      label: intl.get('smpc.product.model.attrValCodeAndName').d('属性值编码/属性值名称'),
      name: 'attrValueName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.attrName').d('属性名称'),
      name: 'attrValueType',
      type: 'string',
      lookupCode: 'SMAL.ATTR_VALUE_TYPE',
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      options: ynDataSet(),
    },
  ],
  fields: [
    ...commonFields(),
    {
      label: intl.get('smpc.product.model.attrName').d('属性名称'),
      name: 'attrValueTypeMeaning',
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
        url: `${SRM_SMPC}/v1/attribute-value/page`,
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
      name: 'attrValueType',
      type: 'string',
      required: true,
      lookupCode: 'SMAL.ATTR_VALUE_TYPE',
      dynamicProps: ({ record }) => {
        return { disabled: record.get('attrValueCode') };
      },
      transformResponse: (_, record) => {
        const { attrValueType } = record;
        return isNumber(attrValueType) ? String(record.attrValueType) : null;
      },
    },
    {
      label: intl.get('smpc.product.model.attrValCode').d('属性值编码'),
      name: 'attrValueCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.attrValName').d('属性值名称'),
      name: 'attrValueName',
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
