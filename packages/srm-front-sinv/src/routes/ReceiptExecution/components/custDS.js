/*
 * @Description:
 * @Date: 2020-09-06 10:38:14
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';

const modelPrompt = 'sinv.receiptExecution.model.title';

const custDS = () => ({
  primaryKey: 'rcvTrxLineId',
  selection: false,
  modifiedCheck: false,
  fields: [
    {
      name: 'componentName',
      type: 'string',
      label: intl.get(`${modelPrompt}.componentName`).d('属性名称'),
    },
    {
      name: 'cpValue',
      type: 'string',
      label: intl.get(`${modelPrompt}.cpValue`).d('属性值'),
    },
  ],
});

export { custDS };
