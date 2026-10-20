import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import getBannerDs from './bannerDs';
import getNavLinkDs from './navLinkDs';
import getFooterDs from './footerDs';
import { getLoginLinkDs, getLoginTypeDs } from './loginDs';

// export const defaultRegisterLink = `${protocol}//{prefix}.${getDomain()}/oauth/public/default/register.html`;

export default function getCardSettingDs(languageList = []) {
  const initIntlFields = languageList.map(language => ({
    name: language.code,
    type: 'object',
    bind: `richTextObject.${language.code}`,
  }));
  return {
    fields: [
      {
        name: 'backgroundColor',
        type: 'color',
        label: intl.get('hptl.portalAssign.model.protalConfig.login.bg').d('背景色'),
        defaultValue: '#fff',
      },
      {
        name: 'cardCode',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.protalConfig.cardCode').d('卡片代码'),
        disabled: true,
      },
      {
        name: 'cardName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.protalConfig.cardName').d('卡片名称'),
        disabled: true,
      },
      {
        name: 'cardTitleStatus',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.protalConfig.cardTitle').d('卡片标题'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'title',
        type: 'intl',
        label: intl.get('srm.oauth.resourceDownload.data.title').d('标题'),
      },
      {
        name: 'icon',
        type: 'string',
        // lovCode: '图标下拉框',
        label: intl.get('hzero.c7nProUI.Icon.icons').d('图标'),
      },
      {
        name: 'h',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.portalAssign.heigth').d('高度'),
        disabled: true,
        min: 1,
        step: 1,
      },
      {
        name: 'w',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.portalAssign.width').d('宽度'),
        disabled: true,
        min: 1,
        max: 24,
        step: 1,
      },
      {
        name: 'x',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.protalConfig.position.x').d('X轴坐标'),
        disabled: true,
        min: 0,
        max: 24,
        step: 1,
      },
      {
        name: 'y',
        type: 'number',
        label: intl.get('hptl.portalAssign.model.protalConfig.position.y').d('Y轴坐标'),
        disabled: true,
        min: 0,
        step: 1,
      },
      {
        name: 'defaultLanguage',
        type: 'strig',
        label: intl.get('hptl.portalAssign.model.protalConfig.default.language').d('默认语言'),
        defaultValue: 'zh_CN',
      },
      {
        name: 'useBrowserLanguage',
        type: 'boolean',
        label: intl
          .get('hptl.portalAssign.model.protalConfig.default.useBrowserLanguage')
          .d('浏览器语言自适应'),
        help: intl
          .get('hptl.portalAssign.model.protalConfig.default.useBrowserLanguage.help')
          .d('开启配置后，门户展示语言优先取浏览器语言，浏览器语言非租户语言则取“默认语言”配置'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'languagePosition',
        type: 'number',
        label: intl
          .get('hptl.portalAssign.model.protalConfig.language.position')
          .d('语言切换栏位置'),
      },
      {
        name: 'richTextObject',
        type: 'object',
      },
      ...initIntlFields,
      {
        name: 'footerRemarks',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.title.footer.filing').d('设置底部备案号'),
        defaultValue: intl
          .get('srm.oauth.view.copyRight')
          .d('CopyRight©2023 上海甄云信息科技有限公司 | 沪ICP备18039109号-4'),
      },
      {
        name: 'accountLoginEnabledFlag',
        type: 'boolean',
        default: true,
        label: `${intl.get('hzero.common.status.enable').d('启用')}${intl
          .get('srm.oauth.login.accountLogin')
          .d('账户登录')}`,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'phoneLoginEnabledFlag',
        type: 'boolean',
        default: true,
        label: `${intl.get('hzero.common.status.enable').d('启用')}${intl
          .get('srm.oauth.login.phoneLogin')
          .d('手机登录')}`,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'defaultLoginType',
        type: 'string',
        defaultValue: 'account',
        label: `${intl.get('hzero.common.button.default').d('默认')}${intl
          .get('srm.oauth.navbar.logIn')
          .d('登录')}`,
      },
      {
        name: 'registerEnabledFlag',
        type: 'boolean',
        default: true,
        label: `${intl.get('hzero.common.status.enable').d('启用')}${intl
          .get('srm.oauth.login.vendorRegistration')
          .d('供应商注册')}`,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'registerLink',
        type: 'string',
        label: `${intl.get('srm.oauth.login.vendorRegistration').d('供应商注册')}${intl
          .get('hptl.portalAssign.model.portalAssign.linkUrl')
          .d('链接')}`,
      },
      {
        name: 'cardContentType',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.protalConfig.cardContentType').d('卡片内容类型'),
        defaultValue: 'richText',
      },
      {
        name: 'link',
        type: 'string',
      },
    ],
    children: {
      bannerDs: new DataSet(getBannerDs(initIntlFields)),
      navLinkDs: new DataSet(getNavLinkDs()),
      footerDs: new DataSet(getFooterDs(initIntlFields)),
      loginDs: new DataSet(getLoginLinkDs()),
      loginTypeDs: new DataSet(getLoginTypeDs()),
    },
  };
}
