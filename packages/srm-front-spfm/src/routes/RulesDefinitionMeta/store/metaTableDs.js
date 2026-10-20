/**
 * getMetaTableDs
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

function getMetaTableDs() {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'name',
        type: 'string',
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
        name: 'tenantName',
        type: 'string',
        label: intl.get('entity.tenant.tag').d('租户'),
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
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.name').d('名称'),
      },
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinitionMeta.model.rulesDefinitionMeta.fullPathCode')
          .d('路径编码'),
      },
      {
        name: 'tenantName',
        type: 'object',
        label: intl.get('entity.tenant.tag').d('租户'),
        lovCode: 'HPFM.TENANT',
        valueField: 'tenantId',
        textField: 'tenantName',
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantName.tenantId',
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/cnf/list`,
        method: 'GET',
      },
    },
  };
}

export default getMetaTableDs;
