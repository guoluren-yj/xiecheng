import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const isTenant = isTenantRoleLevel();
const layoutCode = isTenant ? 'SPFM.PORTAL.LAYPUT.ORG.VIEW' : 'SPFM.PORTAL.LAYOUT.VIEW';

export default function getLayoutFromDs() {
  return {
    // autoCreate: true,
    fields: [
      {
        name: 'layoutObject',
        type: 'object',
        lovCode: layoutCode,
        textField: 'layoutName',
        valueField: 'layoutCode',
        label: intl.get('hptl.portalAssign.model.filed.referTemp').d('引用模板'),
        lovPara: { enabledFlag: 1 },
        required: true,
      },
      {
        name: 'layoutCode',
        type: 'string',
        label: intl
          .get('hptl.portalAssign.model.protalConfig.current.templateCode')
          .d('当前模版编码'),
        disabled: true,
      },
      {
        name: 'id',
        type: 'string',
        bind: 'layoutObject.id',
      },
      {
        name: 'layoutName',
        type: 'string',
        label: intl
          .get('hptl.portalAssign.model.protalConfig.current.templateName')
          .d('当前模板名称'),
        disabled: true,
      },
    ],
  };
}
