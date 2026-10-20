/*
 * @Description:
 * @Date: 2020-08-11 11:16:22
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const operationDS = () => ({
  selection: false,
  primaryKey: 'actionId',
  pageSize: 0,
  // table显示的字段
  fields: [
    {
      name: 'processUser',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
    },
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
      format: getDateTimeFormat(),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.actions').d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('hzero.common.components.operationAudit.operationRemark').d('操作说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      // console.log(data);
      const { invoiceHeaderId } = data;
      return {
        url: `/ssta/v1/${organizationId}/invoice-action/${invoiceHeaderId}`,
        method: 'GET',
      };
    },
  },
});

export { operationDS };
