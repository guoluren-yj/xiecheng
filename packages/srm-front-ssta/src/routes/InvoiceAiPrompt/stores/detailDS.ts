import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON, FieldType, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import { isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';

import { invoicePromptPrefix } from '../utils/api';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { FieldProps } from 'choerodon-ui/dataset/data-set/Field';

export const headerDS = ({ lang }: { lang: string }): DataSetProps => ({
  autoQuery: true,
  forceValidate: true,
  dataToJSON: DataToJSON.all,
  primaryKey: 'lang',
  fields: [
    {
      name: 'lang',
      label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.invoiceLanguage`).d('发票语言'),
      lookupCode: 'SSTA_INVOICE_AI_LANG',
    },
    {
      name: 'unifyPrompt',
      label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.unifyPrompt`).d('统一提示词'),
    },
  ],
  transport: {
    read: () => ({
      url: `${invoicePromptPrefix}/invoice-prompt/${lang}/detail`,
      method: 'GET',
    }),
    submit: ({ data }) => ({
      url: `${invoicePromptPrefix}/invoice-prompt/save/all`,
      method: 'POST',
      data: data[0],
    }),
  },
});

const getCommonParamFields = (optional?: boolean): FieldProps[] => [
  {
    name: 'paramObject',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.relatedObject`).d('关联对象'),
    lookupCode: 'SSTA_INVOICE_AI_PARAM_OBJECT',
  },
  {
    name: 'paramName',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.paramName`).d('参数名称'),
  },
  {
    name: 'paramCode',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.paramCode`).d('参数编码'),
  },
  {
    name: 'paramType',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.paramType`).d('参数类型'),
    lookupCode: 'SSTA_INVOICE_AI_PARAM_TYPE',
  },
  {
    name: 'fieldType',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.fieldType`).d('字段类型'),
    lookupCode: 'SSTA_INVOICE_AI_FIELD_TYPE',
  },
  {
    name: 'standardPrompt',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.standardPrompt`).d('标准提示词'),
  },
  {
    name: 'tenantPrompt',
    label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.tenantPrompt`).d('租户提示词'),
  },
]

export const paramLineDS = ({ lang }: { lang: string }): DataSetProps => ({
  paging: false,
  selection: false,
  primaryKey: 'promptParamId',
  fields: [
    ...getCommonParamFields(),
    {
      name: 'enabledFlag',
      type: FieldType.boolean,
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: () => ({
      url: `${invoicePromptPrefix}/invoice-prompt/${lang}/params`,
      method: 'GET',
    }),
  },
});

export const optionalParamLineDS = ({ lang }: { lang: string }): DataSetProps => {
  return {
    pageSize: 20,
    primaryKey: 'uniqueKey',
    queryFields: [
      {
        name: 'paramObject',
        label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.relatedObject`).d('关联对象'),
        lookupCode: 'SSTA_INVOICE_AI_PARAM_OBJECT',
        display: true,
      },
      {
        name: 'paramName',
        label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.paramName`).d('参数名称'),
        display: true,
      },
      {
        name: 'paramCode',
        label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.paramCode`).d('参数编码'),
        display: true,
      },
    ] as any,
    fields: getCommonParamFields(),
    queryParameter: {
      lang,
      entityCode: 'SSTA_INVOICE_AI_PROMPT_PARAM',
    },
    transport: {
      read: () => ({
        url: `${invoicePromptPrefix}/invoice-prompt/params/optional/page`,
        method: 'GET',
      }),
    },
  };
};
