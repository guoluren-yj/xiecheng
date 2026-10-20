/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 操作记录
const operaTableDS = () => ({
  selection: false, // 设置table 单选多选 没有
  fields: [
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.processUserName').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.processDate').d('操作时间'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.processStatusMeaning').d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.processRemark').d('说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/rcv-action-record/page`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

// 审批记录
const appovedTableDS = () => ({
  selection: false, // 设置table 单选多选 没有
  fields: [
    {
      name: 'endTime',
      type: 'date',
      label: intl.get('sinv.receiptWorkbench.model.receipt.endTime').d('审批时间'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.action').d('审批动作'),
    },
    {
      name: 'name',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.name').d('审批环节'),
    },
    {
      name: 'assigneeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.assigneeName').d('审批人'),
    },
    {
      name: 'comment',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.comment').d('审批意见'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.attachmentUuid').d('附件'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/rcv-action-record/list-history-approval`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { operaTableDS, appovedTableDS };
