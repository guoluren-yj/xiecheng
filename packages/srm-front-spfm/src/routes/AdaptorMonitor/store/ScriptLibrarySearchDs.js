/**
 * ScriptLibrarySearchDs.js
 * 脚本库搜索 Dataset
 * @date: 2022-01-13
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { SRM_ADAPTOR } from '_utils/config';

function getScriptLibrarySearchDs() {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl
          .get('spfm.scriptLibrarySearch.model.ScriptLibrarySearch.applyTenant')
          .d('所属租户'),
        lovCode: 'SADA_TENANT_PAGE',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.code').d('唯⼀编码'),
      },
      {
        name: 'content',
        type: 'string',
        label: intl.get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.content').d('脚本内容'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.description').d('描述'),
      },
      {
        name: 'permission',
        type: 'string',
        lookupCode: 'SADA.MARMOT_LIBRARY_EXEC_PERMISSION',
        label: intl
          .get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.permission')
          .d('权限控制'),
      },
      {
        name: 'quickType',
        type: 'string',
        lookupCode: 'SADA_MARMOT_SCRIPT_LIBRARY_TYPE',
        label: intl.get('spfm.scriptLibrarySearch.model.ScriptLibrarySearch.quickType').d('分类'),
      },
    ],
    fields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl
          .get('spfm.scriptLibrarySearch.model.ScriptLibrarySearch.applyTenant')
          .d('所属租户'),
        lovCode: 'SADA_TENANT_PAGE',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
        label: intl
          .get('spfm.scriptLibrarySearch.model.ScriptLibrarySearch.applyTenant')
          .d('所属租户'),
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
        label: intl
          .get('spfm.scriptLibrarySearch.model.ScriptLibrarySearch.applyTenant')
          .d('所属租户'),
      },
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.code').d('唯⼀编码'),
      },
      {
        name: 'content',
        type: 'string',
        label: intl.get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.content').d('脚本内容'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.description').d('描述'),
      },
      {
        name: 'permission',
        type: 'string',
        lookupCode: 'SADA.MARMOT_LIBRARY_EXEC_PERMISSION',
        label: intl
          .get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.permission')
          .d('权限控制'),
      },
      {
        name: 'contentInput',
        type: 'string',
        label: intl
          .get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.contentInput')
          .d('测试⽤输⼊'),
      },
      {
        name: 'quickType',
        type: 'string',
        lookupCode: 'SADA_MARMOT_SCRIPT_LIBRARY_TYPE',
        label: intl.get('spfm.scriptLibrarySearch.model.ScriptLibrarySearch.quickType').d('分类'),
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl
          .get('spfm.scriptLibrarySearch.model.scriptLibrarySearch.creatorName')
          .d('创建⼈'),
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `${SRM_ADAPTOR}/v1/adaptor-script/library/search`,
          method: 'GET',
          data: { ...data, page, pagesize },
        };
      },
    },
  };
}

export { getScriptLibrarySearchDs };
