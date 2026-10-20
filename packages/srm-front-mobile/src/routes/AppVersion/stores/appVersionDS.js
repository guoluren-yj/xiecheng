import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function appVersionDS() {
  return {
    primaryKey: 'appVersionId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'appCode',
        type: 'string',
        required: true,
        label: intl.get('smbl.appVersion.model.AppVersion.appCode').d('app应用编码'),
      },
      {
        name: 'appName',
        type: 'string',
        required: true,
        label: intl.get('smbl.appVersion.model.AppVersion.appName').d('app应用名称'),
      },
      {
        name: 'platform',
        type: 'string',
        required: true,
        label: intl.get('smbl.appVersion.model.AppVersion.platform').d('应用平台'),
        lookupCode: 'SMBL.APP_PLATFORM_TYPE.CODE',
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('smbl.appVersion.model.AppVersion.enableFlag').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'releaseInfo',
        type: 'string',
        label: intl.get('smbl.appVersion.model.AppVersion.releaseInfo').d('发布信息'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'appCode',
        type: 'string',
        label: intl.get('smbl.appVersion.model.AppVersion.appCode').d('app应用编码'),
      },
      {
        name: 'appName',
        type: 'string',
        label: intl.get('smbl.appVersion.model.AppVersion.appName').d('app应用名称'),
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: {
        url: `${SRM_SMBL}/v1/app-versions`,
        method: 'get',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/app-versions`,
        method: 'delete',
      },
      create: {
        url: `${SRM_SMBL}/v1/app-versions`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/app-versions`,
        method: 'post',
      },
    },
  };
}
export { appVersionDS };
