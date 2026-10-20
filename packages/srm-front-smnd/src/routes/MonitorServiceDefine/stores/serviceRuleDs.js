/**
 * rulesDefinitionService
 * @date: 2020-06-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

// 服务规则ds
export default function getServiceRuleDs() {
  return {
    // autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'priority',
        type: 'number',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.priority').d('优先级'),
      },
      {
        name: 'actionName',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.actionName').d('策略名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.actionDescription')
          .d('策略描述'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'actionName',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.actionName').d('策略名称'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/cnf/detail`,
        method: 'GET',
      },
    },
  };
}
