import intl from 'utils/intl';

// 详情页-表单
export const detailFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'processName',
      type: 'string',
      label: intl.get('hwfp.common.model.process.name').d('流程名称'),
    },
    {
      name: 'id',
      type: 'string',
      label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
    },
    {
      name: 'startUserName',
      type: 'string',
      label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
    },
    {
      name: 'startTime',
      type: 'string',
      label: intl.get('hwfp.common.model.apply.time').d('申请时间'),
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get('hwfp.common.model.process.department').d('部门'),
    },
    {
      name: 'processRejectedFlag',
      type: 'boolean',
      label: intl.get('hwfp.common.model.process.processRejectedFlag').d('是否存在拒绝记录'),
    },
    {
      name: 'exceptionMsgHead',
      type: 'string',
      label: intl.get('hwfp.common.model.process.exceptionMsgHead').d('挂起原因'),
    },
  ],
});
