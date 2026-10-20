import intl from 'utils/intl';

export default function getLayoutSettingDs() {
  return {
    fields: [
      {
        name: 'layoutCode',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalConfig.templateCode').d('模板代码'),
        disabled: true,
      },
      {
        name: 'layoutName',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalConfig.templateName').d('模板名称'),
        required: true,
      },
      {
        name: 'logo',
        // type: 'string',
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalAssign.description').d('模板描述'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enable').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'pageTitle',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalAssign.pageTitle').d('页面标题'),
      },
      {
        name: 'pageFavicon',
      },
    ],
  };
}
