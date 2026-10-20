import intl from 'utils/intl';

function getSchedulingLogDs() {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    validateBeforeQuery: true,
    queryFields: [
      {
        name: 'jobId',
        type: 'string',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.jobId').d('任务ID'),
      },
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.applyTenant').d('所属租户'),
        lovCode: 'SADA_TENANT_PAGE',
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'applyTenant.tenantId',
      },
      {
        name: 'jobResult',
        type: 'string',
        lookupCode: 'HSDR.LOG.JOB_RESULT',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.jobResultMeaning').d('调度结果'),
      },
      {
        name: 'clientResult',
        type: 'string',
        lookupCode: 'HSDR.LOG.CLIENT_RESULT',
        label: intl
          .get('spfm.schedulingLog.model.schedulingLog.clientResultMeaning')
          .d('客户端结果'),
      },
      {
        name: 'timeStart',
        type: 'dateTime',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.startTime').d('执行开始时间'),
      },
      {
        name: 'timeEnd',
        type: 'dateTime',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.endTime').d('执行结束时间'),
      },
    ],
    fields: [
      {
        name: 'jobId',
        type: 'string',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.jobId').d('任务ID'),
      },
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.applyTenant').d('所属租户'),
        lovCode: 'SADA_TENANT_PAGE',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.applyTenant').d('所属租户'),
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.applyTenant').d('所属租户'),
      },
      {
        name: 'jobResultMeaning',
        type: 'string',
        lookupCode: 'HSDR.LOG.JOB_RESULT',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.jobResultMeaning').d('调度结果'),
      },
      {
        name: 'clientResultMeaning',
        type: 'string',
        lookupCode: 'HSDR.LOG.CLIENT_RESULT',
        label: intl
          .get('spfm.schedulingLog.model.schedulingLog.clientResultMeaning')
          .d('客户端结果'),
      },
      {
        name: 'startTime',
        type: 'string',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.startTime').d('执行开始时间'),
      },
      {
        name: 'endTime',
        type: 'string',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.endTime').d('执行结束时间'),
      },
      {
        name: 'messageHeader',
        type: 'string',
        label: intl.get('spfm.schedulingLog.model.schedulingLog.messageHeader').d('日志内容'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `/hsdr/v1/marmot-job-log`,
          method: 'get',
          query: { ...data, page, pagesize },
        };
      },
    },
  };
}

export { getSchedulingLogDs };
