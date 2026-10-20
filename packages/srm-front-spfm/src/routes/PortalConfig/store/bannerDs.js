import intl from 'utils/intl';

export default function getBannerDs(fields) {
  return {
    autoQuery: false,
    primaryKey: 'link',
    cacheSelection: true,
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.protalConfig.banner.name').d('配置图片名称'),
      },
      {
        name: 'link',
        type: 'string',
        label: intl.get('hptl.common.model.portalTemplate.linkUrl').d('跳转链接'),
      },
      {
        name: 'file',
        type: 'object',
        ignore: 'always',
        multiLine: true,
        label: intl.get('hzero.common.upload.modal.title').d('附件'),
      },
      ...fields,
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enable').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
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
