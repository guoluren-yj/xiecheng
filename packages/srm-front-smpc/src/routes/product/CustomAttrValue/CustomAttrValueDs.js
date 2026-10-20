import intl from 'utils/intl';

export default function CustomAttrValueDs(dsProps = {}) {
  return {
    ...dsProps,
    selection: false,
    fields: [
      {
        label: intl.get('smpc.customAttrValue.model.attrValueName').d('属性值名称'),
        name: 'customAttrValueName',
        required: true,
        maxLength: 20,
        type: 'intl',
      },
      {
        label: intl.get('smpc.customAttrValue.model.orderSeq').d('排序号'),
        name: 'orderSeq',
        required: true,
        type: 'number',
        step: 1,
        min: 0,
      },
      {
        label: intl.get('smpc.customAttrValue.model.belongTenant').d('所属租户'),
        name: 'tenantLov',
        type: 'object',
        ignore: 'always',
        required: true,
        lovCode: 'HPFM.TENANT',
        dynamicProps: {
          disabled: ({ record }) => record.get('customAttrValueId'),
        },
      },
      {
        label: intl.get('smpc.customAttrValue.model.belongTenant').d('所属租户'),
        name: 'tenantName',
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'tenantId',
        bind: 'tenantLov.tenantId',
      },
      {
        label: intl.get('smpc.customAttrValue.model.inputMethod').d('录入方式'),
        name: 'inputMethod',
        lookupCode: 'SMPC.INPUT_METHOD',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => record.get('customAttrValueId'),
        },
      },
      {
        name: 'componentType',
        lookupCode: 'SMPC.MANUAL_INPUT_METHOD',
        required: true,
        label: intl.get('smpc.customAttrValue.model.componentType').d('组件类型'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('customAttrValueId') || !record.get('inputMethod');
          },
        },
      },
      {
        label: intl.get('smpc.customAttrValue.model.bindValueCode').d('绑定值集'),
        name: 'bindValueCodeLov',
        type: 'object',
        ignore: 'always',
        required: true,
        lovCode: 'SMPC.LOV_CODE_ORG',
        textField: 'code',
        valueField: 'code',
        dynamicProps: {
          disabled: ({ record }) => {
            return !record.get('inputMethod') || !record.get('tenantLov');
          },
          lovCode: ({ record }) => {
            const type = record.get('componentType');
            return type === 'LOV' ? 'SMPC.LOV_VIEW_ORG' : 'SMPC.LOV_CODE_ORG';
          },
          lovPara: ({ record }) => {
            const tenantId = record.get('tenantId');
            const inputMethod = record.get('inputMethod');
            return { tenantId, queryFlag: inputMethod === 'MANUAL' ? 0 : 1 };
          },
        },
      },
      {
        label: intl.get('smpc.customAttrValue.model.bindValueCode').d('绑定值集'),
        name: 'lovCode',
        bind: 'bindValueCodeLov.code',
      },
      {
        label: intl.get('smpc.customAttrValue.model.displayField').d('displayField'),
        name: 'displayField',
        required: true,
        dynamicProps: {
          required: ({ record }) => {
            return record.get('inputMethod') === 'SYSTEM';
          },
        },
      },
      {
        label: intl.get('smpc.customAttrValue.model.description').d('描述'),
        name: 'remark',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        required: true,
      },
      {
        label: intl.get('hzero.common.action').d('操作'),
        name: 'action',
      },
    ],
    queryFields: [
      {
        label: intl.get('smpc.customAttrValue.model.attrValueName').d('属性值名称'),
        name: 'customAttrValueName',
      },
      {
        label: intl.get('smpc.customAttrValue.model.belongTenant').d('所属租户'),
        name: 'tenantLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.TENANT',
      },
      {
        name: 'tenantId',
        bind: 'tenantLov.tenantId',
      },
      {
        label: intl.get('smpc.customAttrValue.model.inputMethod').d('录入方式'),
        name: 'inputMethod',
        lookupCode: 'SMPC.INPUT_METHOD',
      },
      {
        label: intl.get('smpc.customAttrValue.model.componentType').d('组件类型'),
        name: 'componentType',
        lookupCode: 'SMPC.MANUAL_INPUT_METHOD',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'HPFM.ENABLED_FLAG',
        name: 'enabledFlag',
      },
    ],
    transport: {
      read: {
        url: '/smpc/v1/custom-attr-values/page',
        method: 'GET',
      },
      submit: ({ data }) => {
        return {
          url: '/smpc/v1/custom-attr-values',
          method: 'POST',
          data: data[0],
        };
      },
    },
    events: {
      update: ({ record, name }) => {
        if (name === 'inputMethod') {
          record.init('componentType', null);
        }
        if (name === 'inputMethod' || name === 'componentType' || name === 'tenantLov') {
          record.init('bindValueCodeLov', null);
        }
      },
    },
  };
}
