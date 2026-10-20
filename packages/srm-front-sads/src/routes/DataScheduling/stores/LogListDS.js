import intl from 'utils/intl';

/**
 * 管道输出源列表
 * @returns
 */
const LogListDS = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('sads.dataSchedule.view.taskNum').d('任务号'),
      name: 'jobId',
    },
    {
      label: intl.get('sads.dataSchedule.view.triggerStatus').d('执行状态'),
      name: 'successFlagDesc',
    },
    {
      label: intl.get('sads.dataSchedule.view.percentage').d('执行进度'),
      name: 'percentage',
      type: 'number',
    },
    {
      label: intl.get('sads.dataSchedule.view.rowTotal').d('执行数量'),
      name: 'rowTotal',
      type: 'number',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      name: 'taskCreateDate',
    },
    {
      label: intl.get('sads.dataSchedule.view.triggerTime').d('执行时间'),
      name: 'taskStartDate',
    },
    {
      label: intl.get('sads.dataSchedule.view.endingTime').d('结束时间'),
      name: 'taskEndDate',
    },
    {
      label: intl.get('sads.dataSchedule.view.jobParam').d('任务参数'),
      name: 'jobParam',
    },
    {
      label: intl.get('sads.dataSchedule.view.statement').d('SQL'),
      name: 'statement',
    },
    {
      label: intl.get('hzero.common.message.errorMessage').d('错误信息'),
      name: 'errorMessage',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'action',
    },
  ],
  queryFields: [
    {
      label: intl.get('sads.dataSchedule.view.triggerTime').d('执行时间'),
      name: 'taskStartDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sads.dataSchedule.view.endingTime').d('结束时间'),
      name: 'taskEndDate',
      type: 'dateTime',
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'successFlag',
      lookupCode: 'SDAP.CRONLOG.STATE',
    },
    {
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      name: 'taskCreateDate',
      type: 'dateTime',
    },
  ],
  transport: {
    read: {
      url: `/sdap/v1/cron-logs`,
      method: 'GET',
    },
  },
});
export { LogListDS };
