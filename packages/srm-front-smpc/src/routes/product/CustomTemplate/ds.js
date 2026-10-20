import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const customListDs = () => ({
  selection: 'multiple',
  autoQuery: false,
  pageSize: 20,
  queryFields: [
    {
      name: 'templateName',
      label: intl.get('smpc.product.view.templateCodeName').d('模版编码/名称'),
    },
  ],
  fields: [
    {
      name: 'templateCode',
      label: intl.get('smpc.product.view.templateCode').d('模版编码'),
    },
    {
      name: 'templateName',
      label: intl.get('smpc.product.view.templateName').d('模版名称'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/smpc/v1/${organizationId}/custom-attr-templates/page`,
      method: 'GET',
    },
  },
});

// 头信息
const attrFormDs = (entrance) => ({
  fields: [
    {
      name: 'templateName',
      type: 'intl',
      label: intl.get('smpc.product.view.templateName').d('模版名称'),
      required: entrance === 'temp',
    },
    {
      name: 'templateCode',
      label: intl.get('smpc.product.view.templateCode').d('模版编码'),
      disabled: entrance === 'temp',
    },
    {
      name: 'template',
      label: intl.get('smpc.product.view.applyTemplate').d('应用定制模版'),
      lookupCode: 'SMPC.CUSTOM_TEMPLATE',
      valueField: 'templateId',
      textField: 'templateName',
    },
  ],
});

const attrCommonFields = (defalutValues = {}) => [
  {
    name: 'componentName',
    type: 'intl',
    label: intl.get('smpc.product.view.name').d('名称'),
    required: true,
  },
  {
    name: 'orderSeq',
    type: 'number',
    label: intl.get('smpc.product.view.sort').d('排序'),
    required: true,
    step: 1,
    min: 0,
  },
  {
    name: 'componentType',
    label: intl.get('smpc.product.view.componentType').d('组件类型'),
    required: true,
    lookupCode: 'SMPC.COMPONENT_TYPE',
    defaultValue: defalutValues.componentType,
  },
  {
    name: 'componentPrecision',
    label: intl.get('smpc.product.view.precision').d('精度'),
    type: 'number',
    min: 0,
    max: 9,
    step: 1,
    defaultValue: 0,
    dynamicProps: {
      required: ({ record }) => {
        return record.get('componentType') === 'INPUT_NUMBER';
      },
    },
  },
  {
    name: 'requiredFlag',
    label: intl.get('smpc.product.view.ynRequired').d('是否必填'),
    required: true,
    defaultValue: '1',
    lookupCode: 'HPFM.FLAG',
    dynamicProps: {
      disabled: ({ record }) => {
        const type = record.get('componentType');
        const method = record.get('inputMethod');
        return method === 'SYSTEM' && ['INPUT', 'IMAGE'].includes(type);
      },
    },
  },
];

const attrGroupHeadDs = () => ({
  paging: false,
  fields: [
    {
      name: 'attrGroupName',
      required: true,
      type: 'intl',
      label: intl.get('smpc.product.model.attrGroupName').d('属性组名称'),
    },
    {
      name: 'shipperLov',
      type: 'object',
      lovCode: 'SMDM.UOM',
      valueField: 'uomId',
      textField: 'uomName',
      ignore: 'always',
      label: intl.get('smpc.product.view.forwardUom').d('辅助单位'),
      dynamicProps: {
        required: ({ record }) => record.get('pricingFlag') === 1,
      },
    },
    {
      name: 'shipperId',
      bind: 'shipperLov.uomId',
    },
    {
      name: 'shipper',
      bind: 'shipperLov.uomName',
      label: intl.get('smpc.product.view.forwardUom').d('辅助单位'),
    },
    {
      name: 'saleUnitType',
      lookupCode: 'SMPC.SALE_UNIT_TYPE',
    },
    {
      name: 'saleUnitTypeMeaning',
      label: intl.get('smpc.product.model.oldSaleUomTypes').d('原销售单位类型'),
    },
  ],
});

// 计价属性
const voluaDs = () => ({
  paging: false,
  selection: false,
  fields: [
    ...attrCommonFields({ componentType: 'INPUT_NUMBER' }),
    {
      name: 'unitCoefficient',
      type: 'number',
      required: true,
      min: 0,
      // max: '99999999999999999999',
      label: intl.get('smpc.product.view.uomFactor').d('单位系数'),
      validator: (value) => {
        if (value === 0) {
          return intl.get('smpc.product.model.uomFactorNotZero').d('单位系数不能为0');
        }
        if (math.gte(value, '100000000000000000000')) {
          return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
        }
      },
      help: intl
        .get('smpc.product.view.uomFactorInfo')
        .d('单位系数为标准sku单位与定制品单位之间的换算系数。如cm和m之间的单位系数为100'),
    },
  ],
});

// 自定义属性
const attrGroupListDs = (readOnly) => ({
  paging: false,
  selection: readOnly ? null : 'multiple',
  fields: [
    ...attrCommonFields(),
    {
      name: 'remark',
      label: intl.get('smpc.product.view.examples').d('示例说明'),
      help: intl
        .get('smpc.product.view.examplesInfo')
        .d('示例说明用于提示用户在下单时该属性值的输入规范'),
    },
    {
      label: intl.get('smpc.product.model.inputMethod').d('录入方式'),
      name: 'inputMethod',
      lookupCode: 'SMPC.INPUT_METHOD',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return ['LOV', 'SELECT', 'INPUT_NUMBER', 'UPLOAD'].includes(record.get('componentType'));
        },
      },
    },
    {
      name: 'lovObj',
      type: 'object',
      valueField: 'customAttrValueId',
      textField: 'customAttrValueName',
      ignore: 'always',
      lovCode: 'SMPC.CUSTOM_ATTR_ORG',
      label: intl.get('smpc.product.view.valueOrCode').d('值/值集'),
      dynamicProps: {
        lovPara: ({ record }) => {
          const inputMethod = record.get('inputMethod');
          const componentType = record.get('componentType');
          return { inputMethod, componentType, enabledFlag: 1, tenantId: organizationId };
        },
        required: ({ record }) => {
          const method = record.get('inputMethod');
          const type = record.get('componentType');
          return (
            ['LOV', 'SELECT'].includes(type) ||
            (method === 'SYSTEM' && ['INPUT', 'IMAGE'].includes(type))
          );
        },
        disabled: ({ record }) => {
          const method = record.get('inputMethod');
          const type = record.get('componentType');
          return (
            !['LOV', 'SELECT', 'INPUT', 'IMAGE'].includes(type) ||
            (method === 'MANUAL' && ['INPUT', 'IMAGE'].includes(type))
          );
        },
      },
    },
    {
      name: 'lovCode',
      bind: 'lovObj.lovCode',
    },
    {
      name: 'customAttrValueId',
      bind: 'lovObj.customAttrValueId',
    },
    {
      name: 'customAttrValueName',
      bind: 'lovObj.customAttrValueName',
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      const type = record.get('componentType');
      const method = record.get('inputMethod');
      if (name === 'componentType') {
        record.init('lovObj', null);
        if (['LOV', 'SELECT', 'INPUT_NUMBER', 'UPLOAD'].includes(value)) {
          record.set('inputMethod', 'MANUAL');
        }
      }
      if (name === 'inputMethod' && value === 'MANUAL' && ['INPUT', 'IMAGE'].includes(type)) {
        record.init('lovObj', null);
      }
      if (
        (name === 'componentType' || name === 'inputMethod') &&
        ['INPUT', 'IMAGE'].includes(type) &&
        method === 'SYSTEM'
      ) {
        record.set('requiredFlag', '0');
      }
    },
  },
});

export { customListDs, attrFormDs, voluaDs, attrGroupHeadDs, attrGroupListDs };
