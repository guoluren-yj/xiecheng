import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

// 目录树查询ds
export default function getFilterTreeDs() {
  return {
    // autoQuery: true,
    // autoCreate: true,
    selection: false,
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.view.input.name').d('名称'),
      },
      {
        name: 'labelCode',
        type: 'object',
        lovCode: 'SPFM.CNF_LABEL_VIEW',
        textField: 'labelName',
        valueField: 'labelCode',
        label: intl.get('spfm.rulesDefinition.view.input.label').d('标签'),
        transformRequest: (value) => value?.labelCode,
      },
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.fullPathCode').d('服务编码'),
      },
      {
        name: 'showConfiguredOnly',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl
          .get('spfm.rulesDefinition.view.select.showConfiguredOnly')
          .d('是否显示已配置规则'),
      },
    ],
  };
}
