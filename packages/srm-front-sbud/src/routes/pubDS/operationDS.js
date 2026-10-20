/*
 * @Description:
 * @Date: 2020-08-11 11:16:22
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const operationDS = ({ url, pk }) => ({
  selection: false,
  primaryKey: 'actionId',
  paging: false,

  // table显示的字段
  fields: [
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.processUser').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get('sbud.budgeting.model.budgeting.processDate').d('操作时间'),
      format: getDateTimeFormat(),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.processStatusMeaning').d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('sbud.budgeting.model.budgeting.processRemark').d('操作说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { [pk]: pkv = '' } = data;
      return {
        url,
        method: 'GET',
        data: { [pk]: pkv },
      };
    },
  },
});

const approvalDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get(`sbud.budgeting.model.budgeting.approvalSequence`).d('审批流'),
      name: 'processDefinitionId',
      type: 'string',
    },
    {
      label: intl.get(`sbud.budgeting.model.budgeting.approvalStep`).d('审批环节'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get(`sbud.budgeting.model.budgeting.approvalName`).d('审批人'),
      name: 'assigneeName',
      type: 'string',
    },
    {
      label: intl.get(`sbud.budgeting.model.budgeting.approvalAction`).d('审批操作'),
      name: 'action',
      type: 'string',
    },
    {
      label: intl.get(`sbud.budgeting.model.budgeting.approvalTime`).d('时间'),
      name: 'endTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sbud.budgeting.model.budgeting.approvalRemark`).d('审批说明'),
      name: 'comment',
      type: 'string',
    },
    {
      label: intl.get(`sbud.budgeting.model.budgeting.attachment`).d('附件'),
      name: 'attachmentUuid',
      type: 'string',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/budget-action/queryApprovedRecord`,
        method: 'GET',
        transformResponse: (res) => {
          if (res) {
            return JSON.parse(res)
              .map((item) => item.historicTaskExtList)
              .flat()
              .reverse();
          }
        },
      };
    },
  },
});

export { operationDS, approvalDS };
