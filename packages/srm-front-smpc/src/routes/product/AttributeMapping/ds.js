import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const uomQueryFields = () => [
  {
    label: intl.get('smpc.attrMapping.model.platformUnitCode').d('商城平台单位编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.platformUnitName').d('商城平台单位名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.mappingStatus').d('映射状态'),
    name: 'mappingFlag',
    type: 'number',
    lookupCode: 'SMAL.MAPPING_STATUS',
  },
  {
    label: intl.get('smpc.attrMapping.model.SRMUnitCode').d('SRM单位编码'),
    name: 'mappingDataCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.SRMUnitName').d('SRM单位名称'),
    name: 'mappingDataName',
    type: 'string',
  },
];

const taxRateQueryFields = () => [
  {
    label: intl.get('smpc.attrMapping.model.platformTaxRateCode').d('商城平台税率编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.platformTaxRateName').d('商城平台税率名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.mappingStatus').d('映射状态'),
    name: 'mappingFlag',
    type: 'number',
    lookupCode: 'SMAL.MAPPING_STATUS',
  },
  {
    label: intl.get('smpc.attrMapping.model.taxCode').d('税率代码'),
    name: 'mappingDataCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.description').d('税率描述'),
    name: 'mappingDataName',
    type: 'string',
  },
];

const currencyQueryFields = () => [
  {
    label: intl.get('smpc.attrMapping.model.platformCurrencyCode').d('商城平台币种编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.platformCurrencyName').d('商城平台币种名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.product.model.mappingStatus').d('映射状态'),
    name: 'mappingFlag',
    type: 'number',
    lookupCode: 'SMAL.MAPPING_STATUS',
  },
  {
    label: intl.get('smpc.attrMapping.model.currencyCode').d('SRM币种编码'),
    name: 'mappingDataCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.currencyName').d('SRM币种名称'),
    name: 'mappingDataName',
    type: 'string',
  },
];

const uomFields = () => [
  {
    label: intl.get('smpc.attrMapping.model.platformUnitCode').d('商城平台单位编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.platformUnitName').d('商城平台单位名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.SRMUnitCode').d('SRM单位编码'),
    name: 'uomLov',
    type: 'object',
    ignore: 'always',
    textField: 'uomCode',
    valueField: 'uomCode',
    lovCode: 'SMDM.UOM',
    transformResponse: (_, record) => {
      const { mappingData, mappingDataCode, mappingDataName } = record;
      return mappingDataCode
        ? { uomId: mappingData, uomCode: mappingDataCode, uomName: mappingDataName }
        : null;
    },
  },
  {
    name: 'mappingData',
    bind: 'uomLov.uomId',
  },
  {
    name: 'mappingDataCode',
    type: 'string',
    bind: 'uomLov.uomCode',
  },
  {
    label: intl.get('smpc.attrMapping.model.SRMUnitName').d('SRM单位名称'),
    name: 'mappingDataName',
    type: 'string',
    bind: 'uomLov.uomName',
  },
];
const currencyFields = () => [
  {
    label: intl.get('smpc.attrMapping.model.platformCurrencyCode').d('商城平台币种编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.platformCurrencyName').d('商城平台币种名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.currencyCode').d('币种编码'),
    name: 'currencyLov',
    type: 'object',
    ignore: 'always',
    textField: 'currencyCode',
    valueField: 'currencyCode',
    lovCode: 'SMDM.CURRENCY',
    transformResponse: (_, record) => {
      const { mappingData, mappingDataCode, mappingDataName } = record;
      return mappingDataCode
        ? { currencyId: mappingData, currencyCode: mappingDataCode, currencyName: mappingDataName }
        : null;
    },
  },
  {
    name: 'mappingData',
    bind: 'currencyLov.currencyId',
  },
  {
    name: 'mappingDataCode',
    type: 'string',
    bind: 'currencyLov.currencyCode',
  },
  {
    label: intl.get('smpc.attrMapping.model.currencyName').d('币种名称'),
    name: 'mappingDataName',
    type: 'string',
    bind: 'currencyLov.currencyName',
  },
];
const taxRateFields = () => [
  {
    label: intl.get('smpc.attrMapping.model.platformTaxRateCode').d('商城平台税率编码'),
    name: 'attrValueCode',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.platformTaxRateName').d('商城平台税率名称'),
    name: 'attrValueName',
    type: 'string',
  },
  {
    label: intl.get('smpc.attrMapping.model.taxCode').d('税率代码'),
    name: 'taxLov',
    type: 'object',
    ignore: 'always',
    textField: 'taxCode',
    valueField: 'taxCode',
    lovCode: 'SMDM.TAX',
    transformResponse: (_, record) => {
      const { mappingData, mappingDataCode, mappingDataName, taxRate } = record;
      return mappingDataCode
        ? { taxId: mappingData, taxCode: mappingDataCode, description: mappingDataName, taxRate }
        : null;
    },
  },
  {
    name: 'mappingData',
    bind: 'taxLov.taxId',
  },
  {
    name: 'mappingDataCode',
    type: 'string',
    bind: 'taxLov.taxCode',
  },
  {
    label: intl.get('smpc.attrMapping.model.description').d('税率描述'),
    name: 'mappingDataName',
    type: 'string',
    bind: 'taxLov.description',
  },
  {
    label: intl.get('smpc.attrMapping.model.taxRateWithUom').d('税率（%）'),
    name: 'taxRate',
    // type: 'number',
    bind: 'taxLov.taxRate',
  },
];

// mappingType 单位映射：UOM 税率映射：TAX 币种映射：CURRENCY
const tableDs = (mappingType = 'UOM') => ({
  autoQuery: true,
  selection: false,
  queryFields: [
    ...(mappingType === 'TAX'
      ? taxRateQueryFields()
      : mappingType === 'CURRENCY'
      ? currencyQueryFields()
      : uomQueryFields()),
  ],
  fields: [
    {
      name: 'mappingData',
    },
    {
      label: intl.get('smpc.product.model.num').d('序号'),
      name: 'num',
    },
    ...(mappingType === 'TAX'
      ? taxRateFields()
      : mappingType === 'CURRENCY'
      ? currencyFields()
      : uomFields()),
    {
      label: intl.get('smpc.product.model.mappingStatus').d('映射状态'),
      name: 'mappingFlag',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.operateName').d('操作人'),
      name: 'userName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.model.operation').d('操作'),
      name: 'operation',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/attribute-mappings/${mappingType}`,
        method: 'GET',
        data,
      };
    },
  },
});

export { tableDs };
