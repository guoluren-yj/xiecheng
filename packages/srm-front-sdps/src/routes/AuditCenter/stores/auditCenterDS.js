/**
 * 审核中心 - dataSet
 * @author: qingxiang.luo@going-link.com
 * @date: 2022-03-02
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

/**
 * Lov
 * @returns
 */
const TantentLovDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'tenantVal',
      textField: 'tenantName',
      valueField: 'tenantNum',
      type: 'object',
      noCache: true,
      lovCode: 'SDPS.AUDIT_TENANT',
    },
  ],
});

/**
 * 审核中心 列表
 * @returns
 */
const AuditListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/audit-center`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'auditHeaderId',
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`sdps.auditCenter.model.objectName`).d('对象名称'),
      name: 'objName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.auditCenter.model.objectNum`).d('对象编码'),
      name: 'objNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.auditCenter.model.tantentBelong`).d('所属租户'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.auditCenter.model.checkType`).d('审核类型'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDPS.AUDIT_TYPE_LIST',
    },
    {
      label: intl.get(`sdps.auditCenter.model.checkStatus`).d('审核状态'),
      name: 'status',
      type: 'string',
      lookupCode: 'SDPS.AUDIT_STATUS',
    },
    {
      label: intl.get(`sdps.auditCenter.model.checker`).d('审核人'),
      name: 'auditorName',
      type: 'string',
    },
    // {
    //   label: intl.get(`sdps.auditCenter.model.themeNum`).d('主题编码'),
    //   name: 'topicNum',
    //   type: 'string',
    // },
    // {
    //   label: intl.get(`sdps.auditCenter.model.themeName`).d('主题名称'),
    //   name: 'topicName',
    //   type: 'string',
    // },
    {
      label: intl.get(`sdps.auditCenter.model.auditTime`).d('审核时间'),
      name: 'auditDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdps.auditCenter.model.remark`).d('审核意见'),
      name: 'advice',
      type: 'string',
    },
    {
      label: intl.get(`sdps.auditCenter.model.submitter`).d('提交人'),
      name: 'submitterName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.auditCenter.model.submitTime`).d('提交时间'),
      name: 'submitDate',
      type: 'dateTime',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 审核中心 表数据列表
 * @returns
 */
const CheckModalListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/audit-center/${data.auditHeaderId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`sdps.auditCenter.model.tableNum`).d('数据表编码'),
      name: 'objDetailNum',
      type: 'string',
    },
    {
      label: intl.get(`sdps.auditCenter.model.tableName`).d('表名'),
      name: 'objDetailName',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

export { TantentLovDS, AuditListDS, CheckModalListDS };
