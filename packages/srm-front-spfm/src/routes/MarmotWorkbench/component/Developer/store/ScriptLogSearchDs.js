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
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.applyTenant').d('所属租户'),
        ignore: 'always',
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
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.taskCode').d('脚本编码'),
        computedProps: {
          required: ({ record }) => {
            if (record && record.get('lastMinutes') === '0' && !record.get('traceId')) {
              return true;
            } else {
              return false;
            }
          },
        },
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
        computedProps: {
          required: ({ record }) => {
            if (record && record.get('lastMinutes') === '0' && !record.get('taskCode')) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        name: 'lastMinutes',
        type: 'string',
        lookupCode: 'SADA.LOG_TIME_RANGE',
        defaultValue: '120',
        label: intl
          .get('spfm.scriptLogSearch.model.scriptLogSearch.dateParamDTO')
          .d('执行时间范围'),
        required: true,
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
        label: intl.get('spfm.scriptLogSearch.model.scriptLogSearch.taskCode').d('脚本编码'),
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

function getScriptLogDetailDs() {
  return {
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        name: 'content',
        type: 'string',
        label: intl.get('spfm.scriptLogSearch.model.scriptLogDetail.content').d('日志'),
      },
      {
        name: 'actualExecutionTime',
        type: 'string',
        label: intl
          .get('spfm.scriptLogSearch.model.scriptLogDetail.actualExecutionTime')
          .d('执行时间'),
        transformResponse: (value) => {
          if (value) {
            return moment(value).format('YYYY/MM/DD HH:mm:ssss');
          } else {
            return '-';
          }
        },
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `${SRM_ADAPTOR}/v1/script-log-records/query-by-id`,
          method: 'POST',
          data: { ...data, page, pagesize },
        };
      },
    },
  };
}

export { getScriptLogSearchDs, getScriptLogDetailDs };
