import intl from 'utils/intl';

export default function getNavLinkDs() {
  return {
    autoQuery: false,
    primaryKey: 'position',
    cacheSelection: true,
    fields: [
      {
        name: 'name',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.protalConfig.linkTxt').d('链接标题'),
      },
      {
        name: 'link',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.linkUrl').d('链接'),
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
