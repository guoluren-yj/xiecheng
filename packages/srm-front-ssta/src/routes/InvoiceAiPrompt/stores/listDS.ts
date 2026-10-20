import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'utils/intl';

import { invoicePromptPrefix } from '../utils/api';

export const listDS = (): DataSetProps => ({
  autoQuery: true,
  pageSize: 20,
  selection: false,
  primaryKey: 'promptId',
  fields: [
    {
      name: 'lang',
      label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.invoiceLanguage`).d('发票语言'),
      lookupCode: 'SSTA_INVOICE_AI_LANG',
    },
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
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      label: intl.get('ssta.common.model.common.createdDate').d('创建时间'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.dateTime,
      label: intl.get(`ssta.common.model.common.lastUpdateTime`).d('最后修改时间'),
    },
  ],
  transport: {
    read: () => ({
      url: `${invoicePromptPrefix}/invoice-prompt/page`,
      method: 'GET',
    }),
  },
});

export const createFormDS = (): DataSetProps => ({
  autoCreate: true,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'lang',
      required: true,
      label: intl.get(`ssta.invoiceAiPrompt.model.invoiceAiPrompt.invoiceLanguage`).d('发票语言'),
      lookupCode: 'SSTA_INVOICE_AI_LANG',
    },
  ],
});
