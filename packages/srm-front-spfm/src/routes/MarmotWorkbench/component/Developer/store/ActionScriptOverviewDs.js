import intl from 'utils/intl';
import { SRM_ADAPTOR } from '_utils/config';
import crypto from 'crypto-js';

export function getActionScriptOverviewTableDs() {
  return {
    selection: false,
    autoQuery: true,
    queryFields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('hzero.common.tenant').d('租户'),
        lovCode: 'SADA_TENANT_PAGE',
        ignore: 'always',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'tableCode',
        type: 'string',
        label: intl
          .get('spfm.actionScriptOverview.model.actionScriptOverview.tableCode')
          .d('配置表编码'),
      },
      {
        name: 'script',
        label: intl
          .get('spfm.actionScriptOverview.model.actionScriptOverview.scriptContent')
          .d('脚本内容'),
        type: 'string',
      },
      {
        name: 'description',
        type: 'string',
        label: intl
          .get('spfm.actionScriptOverview.model.actionScriptOverview.description')
          .d('描述'),
      },
      {
        name: 'type',
        label: intl.get('spfm.actionScriptOverview.model.actionScriptOverview.type').d('类型'),
        type: 'string',
        lookupCode: 'SPFM.REL_TABLE_ACTION.TYPE',
      },
      {
        name: 'position',
        label: intl.get('spfm.actionScriptOverview.model.actionScriptOverview.position').d('位置'),
        type: 'string',
        computedProps: {
          lookupCode: ({ record }) =>
            record.get('type') === 'TRIGGER'
              ? 'SPFM.REL_TABLE_ACTION.TRIGGER.POSITION'
              : 'SPFM.REL_TABLE_ACTION.BUTTON.POSITION',
        },
      },
    ],
    fields: [
      {
        name: 'tableCode',
        type: 'string',
        label: intl
          .get('spfm.actionScriptOverview.model.actionScriptOverview.tableCode')
          .d('配置表编码'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hzero.common.tenant').d('租户'),
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl
          .get('spfm.actionScriptOverview.model.actionScriptOverview.creatorName')
          .d('创建人'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl
          .get('spfm.actionScriptOverview.model.actionScriptOverview.description')
          .d('描述'),
      },
      {
        name: 'type',
        label: intl.get('spfm.actionScriptOverview.model.actionScriptOverview.type').d('类型'),
        type: 'string',
        lookupCode: 'SPFM.REL_TABLE_ACTION.TYPE',
      },
      {
        name: 'position',
        label: intl.get('spfm.actionScriptOverview.model.actionScriptOverview.position').d('位置'),
        type: 'string',
        computedProps: {
          lookupCode: ({ record }) =>
            record.get('type') === 'TRIGGER'
              ? 'SPFM.REL_TABLE_ACTION.TRIGGER.POSITION'
              : 'SPFM.REL_TABLE_ACTION.BUTTON.POSITION',
        },
      },
      {
        name: 'script',
        label: intl.get('spfm.actionScriptOverview.model.actionScriptOverview.script').d('脚本'),
        type: 'string',
        transformResponse: (value) => {
          return value ? crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value)) : value; // 加密
        },
      },
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/adaptor-script/rel-action`,
        method: 'GET',
      },
    },
  };
}
