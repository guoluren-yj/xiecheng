import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const list = () => ({
  primaryKey: 'labelConfigId',
  fields: [
    {
      name: 'serialNumber',
      type: 'string',
      label: intl.get('sinv.labelManagement.model.labelManagement.serialNumber').d('序号'),
    },
    {
      name: 'labelConfigCode',
      required: true,
      label: intl
        .get('sinv.labelManagement.model.labelManagement.labelConfigCode')
        .d('标签配置编码'),
    },
    {
      name: 'labelName',
      type: 'intl',
      required: true,
      label: intl.get('sinv.labelManagement.model.labelManagement.labelName').d('标签描述'),
    },
    {
      name: 'labelSourceCode',
      type: 'string',
      label: intl.get('sinv.labelManagement.model.labelManagement.labelSourceCode').d('数据来源'),
      lookupCode: 'SINV.LABEL_SOURCE_FROM',
    },
    {
      name: 'onlyLabelCodeFlag',
      type: 'boolean',
      required: true,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sinv.labelManagement.model.labelManagement.onlyLabelCodeFlag')
        .d('生成唯一标签编码'),
    },
    {
      name: 'ruleCodeLOV',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPUC.SINV.CODE.RULE',
      label: intl.get('sinv.labelManagement.model.labelManagement.ruleCodeId').d('标签编码规则'),
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'ruleCode',
      type: 'string',
      bind: 'ruleCodeLOV.ruleCode',
    },
    {
      name: 'ruleCodeId',
      type: 'number',
      bind: 'ruleCodeLOV.ruleId',
    },
    {
      name: 'ruleName',
      type: 'string',
      bind: 'ruleCodeLOV.ruleName',
    },
    {
      name: 'asnQuotePackageNum',
      type: 'string',
      label: intl
        .get('sinv.labelManagement.model.labelManagement.orderPackNumber')
        .d('由送货单行引入单包装数'),
      lookupCode: 'SINV.ASN_QUOTE_PACKAGE_NUM',
    },
    {
      name: 'mixedPackageFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sinv.labelManagement.model.labelManagement.mixedPackageFlag')
        .d('是否存在混装'),
    },
    {
      name: 'templateCode',
      type: 'object',
      label: intl.get('sinv.labelManagement.model.labelManagement.templateCode').d('标签打印模板'),
      lovCode: 'HRPT.REPORT_TEMPLATE_ORG',
      lovPara: { tenantId: organizationId },
      transformRequest: (value) => value && value.templateCode,
      transformResponse: (value, record) => ({ ...record }),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'onlyLabelCodeFlag') {
        if (value === 0) {
          record.set('mixedPackageFlag', 0);
          record.set('ruleCodeLOV', undefined);
        } else {
          record.set('mixedPackageFlag', record.getPristineValue('mixedPackageFlag'));
          record.set('ruleCodeLOV', record.getPristineValue('ruleCodeLOV'));
        }
      }
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-configs`,
        method: 'GET',
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-configs`,
        method: 'POST',
        data,
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/label-configs`,
        method: 'DELETE',
      };
    },
  },
});

export { list };
