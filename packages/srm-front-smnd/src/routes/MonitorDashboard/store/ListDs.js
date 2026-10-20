import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// const queryDs =

// const ListQueryDs =

const BusinessDateSet = (activeKey) => ({
  autoQuery: activeKey === 'list',
  dataToJSON: 'all',
  cacheSelection: true,
  pageSize: 20,
  primaryKey: 'id',
  selection: activeKey === 'list' ? 'multiple' : false,
  queryDataSet:
    activeKey === 'list'
      ? new DataSet({
          autoCreate: true,
          fields: [
            {
              name: 'documentNum',
              type: 'string',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.documentNum`)
                .d('单据编号'),
            },
            {
              name: 'requestDateStart',
              type: 'dateTime',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.requestDateStart`)
                .d('开始时间'),
            },
            {
              name: 'requestDateEnd',
              type: 'dateTime',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.requestDateEnd`)
                .d('结束时间'),
            },
            {
              name: 'settingCodeObj',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.settingCodeObjName`)
                .d('接口'),
              lovCode: 'SMND_QUERY_SETTING',
              type: 'object',
              ignore: 'always',
              multiple: true,
            },
            {
              name: 'configKey',
              bind: 'settingCodeObj.configKey',
              multiple: ',',
            },
            {
              name: 'interfaceName',
              bind: 'settingCodeObj.interfaceName',
            },
            {
              name: 'tenantIdListObj',
              type: 'object',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.tenantIdList`)
                .d('租户'),
              lovCode: 'HPFM.TENANT_ALL',
              multiple: true,
              ignore: 'always',
            },
            {
              name: 'tenantIdList',
              bind: 'tenantIdListObj.tenantId',
              multiple: ',',
            },
            {
              name: 'tenantName',
              bind: 'tenantIdListObj.tenantName',
              multiple: ',',
            },
            {
              name: 'responseStatus',
              label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.result`).d('结果'),
              lookupCode: 'SMND.RESPONSE_STATUS',
              defaultValue: 'fail',
            },
            {
              name: 'allQuery',
              type: 'string',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.allQuery`)
                .d('报文搜索'),
            },
            {
              name: 'module',
              type: 'string',
              label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.modules`).d('模块'),
            },
          ],
        })
      : new DataSet({
          autoCreate: true,
          fields: [
            {
              name: 'documentNum',
              type: 'string',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.documentNum`)
                .d('单据编号'),
            },
            {
              name: 'requestDateStart',
              type: 'dateTime',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.requestDateStart`)
                .d('开始时间'),
            },
            {
              name: 'requestDateEnd',
              type: 'dateTime',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.requestDateEnd`)
                .d('结束时间'),
            },
            // {
            //   name: 'settingCodeObj',
            //   label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.settingCodeObjName`).d('接口'),
            //   lovCode: 'SMND_QUERY_SETTING',
            //   type: 'object',
            //   ignore: 'always',
            //   multiple: true,
            // },
            {
              name: 'configKey',
              bind: 'settingCodeObj.configKey',
              multiple: ',',
            },
            // {
            //   name: 'tenantIdListObj',
            //   type: 'object',
            //   label: intl
            //     .get(`smnd.monitorDashboard.model.monitorDashboard.tenantIdList`)
            //     .d('租户'),
            //   lovCode: 'HPFM.TENANT_ALL',
            //   multiple: true,
            //   ignore: 'always',
            // },
            {
              name: 'tenantIdList',
              bind: 'tenantIdListObj.tenantId',
              multiple: ',',
            },
            {
              name: 'tenantName',
              bind: 'tenantIdListObj.tenantName',
              multiple: ',',
            },
            {
              name: 'responseStatus',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.responseStatus`)
                .d('响应结果'),
              lookupCode: 'SMND.RESPONSE_STATUS',
              defaultValue: 'fail',
            },
            {
              name: 'allQuery',
              type: 'string',
              label: intl
                .get(`smnd.monitorDashboard.model.monitorDashboard.allQuery`)
                .d('报文搜索'),
            },
          ],
        }),
  // autoCreate: true,
  fields: [
    {
      name: 'documentNum',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.documentNum`).d('单据编号'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl
        .get(`smnd.monitorDashboard.model.monitorDashboard.interfaceName`)
        .d('异常监控类别'),
    },
    {
      name: 'routingKey',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.routingKey`).d('分组键'),
    },
    {
      name: 'type',
      type: 'string',
      lookupCode: 'SMND_TYPE',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.type`).d('接口类型'),
    },
    {
      name: 'requestParam',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.requestParam`).d('请求报文'),
    },
    {
      name: 'responseParam',
      type: 'string',
      label: intl
        .get(`smnd.monitorDashboard.model.monitorDashboard.customerItemName`)
        .d('响应报文'),
    },
    {
      name: 'requestDate',
      type: 'dateTime',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.requestDate`).d('发起时间'),
    },
    {
      name: 'responseDate',
      type: 'dateTime',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.responseDate`).d('响应时间'),
    },
    {
      name: 'costTime',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.costTime`).d('响应时长'),
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.errorMessage`).d('错误消息'),
    },
    {
      name: 'requestStatus',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.requestStatus`).d('发起结果'),
      lookupCode: 'HITF.RESPONSE_STATUS',
    },
    {
      name: 'responseStatus',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.responseStatus`).d('响应结果'),
      lookupCode: 'HITF.RESPONSE_STATUS',
    },
    {
      name: 'traceId',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.traceId`).d('Trace Id'),
    },
    {
      name: 'tenantId',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.tenantId`).d('租户'),
      lookupCode: 'HPFM.TENANT',
    },
    {
      name: 'organizationId',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.organizationId`).d('组织Id'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.tenantName`).d('租户名'),
    },
    {
      name: 'requestModule',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.requestModule`).d('请求模块'),
    },
    {
      name: 'responseModule',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.responseModule`).d('响应模块'),
    },
    {
      name: 'userId',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.userId`).d('用户Id'),
    },
    {
      name: 'userName',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.userName`).d('用户姓名'),
    },
    {
      name: 'buKey',
      type: 'string',
      label: intl.get(`smnd.monitorDashboard.model.monitorDashboard.buKey`).d('消息队列业务键'),
    },
  ],
  transport: {
    read: ({ data = {} }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `/smnd/v1/${organizationId}/data/queryList`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { BusinessDateSet };
