/**
 *
 * @date: 2020/7/23
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  selection: false,
  queryParameter: {
    organizationId,
  },
  fields: [
    {
      name: 'processUserName',
      label: intl.get('sslm.eventRecord.model.operate.processUserName').d('操作人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.eventRecord.model.operate.creationDate').d('操作日期'),
    },
    {
      name: 'processStatusMeaning',
      label: intl.get('sslm.eventRecord.model.operate.processStatusMeaning').d('操作'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-record`,
        method: 'GET',
        data,
        params,
      };
    },
  },
});
