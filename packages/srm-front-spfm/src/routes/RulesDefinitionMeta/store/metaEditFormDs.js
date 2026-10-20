/**
 * metaEditFormDs
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';

function getMetaEditFormDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'name',
        type: 'intl',
        label: intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.name').d('名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.description').d('描述'),
      },
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.fullPathCode')
          .d('路径编码'),
      },
      {
        name: 'defaultRet',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.defaultRet')
          .d('默认返回值'),
      },
      {
        name: 'defaultRetMeaning',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.defaultRetMeaning')
          .d('默认返回值描述'),
      },
      {
        name: 'tenant',
        type: 'object',
        label: intl.get('entity.tenant.tag').d('租户'),
        lovCode: 'HPFM.TENANT',
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenant.tenantId',
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'tenant.tenantName',
      },
      {
        name: 'parameters',
        type: 'string',
        label: intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.parameters').d('参数'),
      },
      {
        name: 'ret',
        type: 'string',
        label: intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.ret').d('返回值'),
      },
      {
        name: 'parameters',
        type: 'string',
      },
      {
        name: 'ret',
        type: 'string',
      },
    ],
  };
}

export default getMetaEditFormDs;
