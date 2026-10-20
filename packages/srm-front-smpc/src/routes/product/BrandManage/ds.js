import intl from 'utils/intl';
import { SRM_SMPC } from '_utils/config';
import { enabledDataSet } from '@/routes/product/utilsApi/constant';

const commonFields = () => [
  {
    label: intl.get('smpc.product.model.zhName').d('品牌中文名称'),
    name: 'brandNameZh',
    type: 'string',
    required: true,
    maxLength: 20,
  },
  {
    label: intl.get('smpc.product.model.enName').d('品牌英文名称'),
    name: 'brandNameEn',
    type: 'string',
    // required: true,
    maxLength: 50,
  },
  {
    label: intl.get('smpc.product.model.serverPhone').d('服务电话'),
    name: 'serverPhone',
    type: 'string',
    // required: true,
    maxLength: 20,
    validator: (value) => {
      if (value && !(value || '').match(/[0-9|\\*|-]{8,20}/)) {
        return intl
          .get('smpc.brandManage.view.serverPhoneLimit')
          .d('长度不能少于8个字符，支持数字、“-”、“*”及空格');
      }
    },
  },
  {
    label: intl.get('smpc.product.model.brandUrl').d('品牌网址'),
    name: 'officialUrl',
    type: 'string',
    // required: true,
    maxLength: 50,
  },
];

const logo = () => [
  {
    label: intl.get('smpc.product.model.brandLogo').d('品牌LOGO'),
    name: 'logoUrl',
    type: 'string',
    // required: true,
  },
];

const tableDs = () => ({
  autoQuery: true,
  selection: false,
  queryFields: [
    {
      label: intl.get('smpc.product.model.zhName').d('品牌中文名称'),
      name: 'brandNameZh',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.enName').d('品牌英文名称'),
      name: 'brandNameEn',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.serverPhone').d('服务电话'),
      name: 'serverPhone',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.brandUrl').d('品牌网址'),
      name: 'officialUrl',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
      options: enabledDataSet(),
    },
  ],
  fields: [
    {
      label: intl.get('smpc.product.model.brandCode').d('品牌编码'),
      name: 'brandCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.brandNameZh').d('品牌名称'),
      name: 'brandName',
      type: 'string',
    },
    ...logo(),
    ...commonFields(),
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
        url: `${SRM_SMPC}/v1/brand/query`,
        method: 'GET',
        data,
      };
    },
  },
});

const formDs = () => ({
  autoQuery: false,
  fields: [...logo(), ...commonFields()],
});

export { formDs, tableDs };
