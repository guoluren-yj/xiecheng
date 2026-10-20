/**
 * ScriptLogSearchDs.js
 * 适配器日志搜索 Dataset
 * @date: 2022-02-11
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { SRM_ADAPTOR } from '_utils/config';
import moment from 'moment';

function getScriptLogSearchDs() {
  const max = new Date();
  const min = max - 24 * 60 * 60 * 1000 * 3;
  const defaultStartTime = max - 2 * 60 * 60 * 1000;
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.applyTenant').d('所属租户'),
        lovCode: 'SADA_TENANT_PAGE',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.taskCode').d('适配器编码'),
      },
      {
        name: 'content',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.content').d('日志内容'),
      },
      {
        name: 'scriptType',
        type: 'string',
        lookupCode: 'SADA_LOG_TYPE',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.scriptType').d('类型'),
      },
      {
        name: 'traceId',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.traceId').d('traceId'),
      },
      {
        name: 'scriptLogDateParamDTO',
        type: 'dateTime',
        min,
        max,
        range: ['startTime', 'endTime'],
        defaultValue: {
          startTime: moment(defaultStartTime).format('YYYYMMDD HH:mm:ss'),
          endTime: max,
        },
        label: intl
          .get('spfm.scriptLogSearch.model.scriptLogSearch.dateParamDTO')
          .d('执行时间范围'),
      },
    ],
    fields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.applyTenant').d('所属租户'),
        lovCode: 'SADA_TENANT_PAGE',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.applyTenant').d('所属租户'),
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.applyTenant').d('所属租户'),
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.taskCode').d('适配器编码'),
      },
      {
        name: 'actualExecutionDate',
        type: 'string',
        label: intl
          .get('spfm.scriptLogSearch.model.scriptLogSearch.actualExecutionDate')
          .d('执行时间'),
      },
      {
        name: 'content',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.content').d('日志内容'),
      },
      {
        name: 'scriptType',
        type: 'string',
        lookupCode: 'SADA_LOG_TYPE',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.scriptType').d('类型'),
      },
      {
        name: 'traceId',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.traceId').d('traceId'),
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `${SRM_ADAPTOR}/v1/script-log-records/query`,
          method: 'POST',
          data: { ...data, page, pagesize },
        };
      },
    },
  };
}

export { getScriptLogSearchDs };
