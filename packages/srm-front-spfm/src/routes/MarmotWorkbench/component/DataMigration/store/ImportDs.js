import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import crypto from 'crypto-js';
import { SRM_ADAPTOR } from '_utils/config';

export function getAdaptorTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.taskCode').d('挂载点编码'),
      },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.runningService').d('所属服务'),
      },
      {
        name: 'scriptVersion',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.model.dataMigration.scriptVersion')
          .d('MarmotScript版本'),
      },
      {
        name: 'trustful',
        type: 'boolean',
        label: intl.get('spfm.dataMigration.model.dataMigration.trustful').d('是否可信'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.description').d('描述'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('spfm.dataMigration.model.dataMigration.enabled').d('启用'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
      {
        name: 'adaptorLine',
        type: 'string',
        label: intl.get('spfm.dataMigration.scriptLibrary.dataMigration.content').d('脚本内容'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).adaptorTaskDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getScriptLibraryTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.dataMigration.scriptLibrary.dataMigration.taskCode').d('编码'),
      },
      {
        name: 'quickType',
        type: 'string',
        lookupCode: 'SADA_MARMOT_SCRIPT_LIBRARY_TYPE',
        label: intl.get('spfm.dataMigration.scriptLibrary.dataMigration.quickType').d('分类'),
      },
      {
        name: 'permission',
        type: 'string',
        label: intl.get('spfm.dataMigration.scriptLibrary.dataMigration.permission').d('权限控制'),
      },
      {
        name: 'content',
        type: 'string',
        transformResponse: (value) => {
          return value ? crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value)) : value;
        },
        label: intl.get('spfm.dataMigration.scriptLibrary.dataMigration.content').d('脚本内容'),
      },
      {
        name: 'contentInput',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.scriptLibrary.dataMigration.contentInput')
          .d('测试用例'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.description').d('描述'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).marmotScriptLibraryDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getApiPublishTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.dataMigration.apiPublish.dataMigration.taskCode').d('API唯一编码'),
      },
      {
        name: 'scriptCode',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.queueConsumer.dataMigration.codeBlockCode')
          .d('关联脚本'),
      },
      {
        name: 'url',
        type: 'string',
        label: intl.get('spfm.dataMigration.apiPublish.dataMigration.url').d('请求地址'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.description').d('描述'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).marmotApiPublishDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getApiRewriteTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'apiCode',
        type: 'string',
        label: intl.get('spfm.dataMigration.apiRewrite.dataMigration.apiCode').d('API编码'),
      },
      {
        name: 'scriptCode',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.queueConsumer.dataMigration.codeBlockCode')
          .d('关联脚本'),
      },
      {
        name: 'serverName',
        type: 'string',
        label: intl.get('spfm.dataMigration.apiRewrite.dataMigration.serverName').d('服务名'),
      },
      {
        name: 'beanName',
        type: 'string',
        label: intl.get('spfm.dataMigration.apiRewrite.dataMigration.beanName').d('bean名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.description').d('描述'),
      },
      {
        name: 'methodName',
        type: 'string',
        label: intl.get('spfm.dataMigration.apiRewrite.dataMigration.methodName').d('方法名'),
      },
      {
        name: 'enable',
        type: 'boolean',
        label: intl.get('spfm.dataMigration.apiRewrite.dataMigration.enable').d('是否启用'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).marmotApiRewriteDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getDataImportTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'doImportScriptCode',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.dataImport.dataMigration.doImportScriptCode')
          .d('导入模板编码'),
      },
      {
        name: 'importType',
        type: 'string',
        lookupCode: 'SADA.DATA_IMPORT.TYPE',
        label: intl.get('spfm.dataMigration.dataImport.dataMigration.importType').d('导入方式'),
      },
      {
        name: 'sheetIndex',
        type: 'string',
        lookupCode: 'SADA.DATA_IMPORT.SHEET_INDEX',
        multiple: true,
        label: intl.get('spfm.dataMigration.dataImport.dataMigration.sheetIndex').d('页签'),
      },
      {
        name: 'validScriptCode',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.dataImport.dataMigration.validScriptCode')
          .d('验证关联脚本'),
      },
      {
        name: 'templateCode',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.dataImport.dataMigration.templateCode')
          .d('导入关联脚本'),
      },
      {
        name: 'validType',
        type: 'string',
        lookupCode: 'SADA.DATA_VALID.TYPE',
        label: intl.get('spfm.dataMigration.dataImport.dataMigration.validType').d('验证方式'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).marmotDataImportDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getQueueConsumerTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'codeBlockCode',
        type: 'string',
        label: intl
          .get('spfm.dataMigration.queueConsumer.dataMigration.codeBlockCode')
          .d('关联脚本'),
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: intl.get('spfm.dataMigration.queueConsumer.dataMigration.enabled').d('是否开启消费'),
      },
      {
        name: 'topic',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.topic').d('队列唯一编码'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).marmotQueueConsumerDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getCodeBlockTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'blockCode',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.blockCode').d('唯一标识编码'),
      },
      {
        name: 'content',
        type: 'string',
        transformResponse: (value) => {
          return value ? crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value)) : value;
        },
        label: intl.get('spfm.dataMigration.model.dataMigration.content').d('代码块'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.description').d('描述'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).codeBlockDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getQueryBlockTableDs() {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'queryBlockCode',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.queryBlockCode').d('唯一标识编码'),
      },
      {
        name: 'sqlContent',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.sqlContent').d('SQL'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.dataMigration.model.dataMigration.description').d('描述'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/marmot-data/preview`,
        method: 'GET',
        transformResponse: (resp) => {
          const result = JSON.parse(resp).queryBlockDataDTOPage;
          if (result && !isEmpty(result)) {
            return result;
          } else {
            return {};
          }
        },
      },
    },
  };
}

export function getQueryFormDs() {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'taskCode',
        type: 'string',
      },
    ],
  };
}
