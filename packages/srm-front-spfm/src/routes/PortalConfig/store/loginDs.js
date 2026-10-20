import intl from 'utils/intl';

export function getLoginLinkDs() {
  return {
    autoQuery: false,
    primaryKey: 'link',
    cacheSelection: true,
    fields: [
      {
        name: 'title',
        type: 'intl',
        label: intl.get('srm.oauth.resourceDownload.data.title').d('标题'),
      },
      {
        name: 'link',
        type: 'string',
        label: intl.get('hptl.common.model.portalTemplate.linkUrl').d('跳转链接'),
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: intl.get('hptl.portalAssign.model.portalConfig.login.enableTheme').d('启用主题色'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'blankEnabled',
        type: 'boolean',
        label: intl
          .get('hptl.portalAssign.model.portalConfig.login.blankEnabled')
          .d('在新窗口中打开'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'position',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.protalConfig.position').d('位置'),
      },
    ],
  };
}

export function getLoginTypeDs() {
  return {
    autoQuery: false,
    primaryKey: 'type',
    cacheSelection: true,
    fields: [
      {
        name: 'title',
        type: 'intl',
        label: `${intl.get('srm.oauth.navbar.logIn').d('登录')}${intl
          .get('hzero.common.model.type')
          .d('方式')}`,
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: intl.get('hzero.common.status.enable').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'type',
        type: 'string',
      },
      {
        name: 'position',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.protalConfig.position').d('位置'),
      },
    ],
    events: {
      update: ({ dataSet, record, name, value }) => {
        if (name === 'enabled' && value === 0) {
          const type = record.get('type') === 'account' ? 'phone' : 'account';
          dataSet.find((item) => item.get('type') === type).set('enabled', 1);
        }
      },
    },
  };
}
