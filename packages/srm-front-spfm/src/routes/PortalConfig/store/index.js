import React, { useState, useMemo, createContext, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import {
  getAccessToken,
  setSession,
  getSession,
  // getCurrentOrganizationId,
} from 'utils/utils';
import { trim, isUndefined, isNil, compose } from 'lodash';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
// import { Card } from 'hzero-ui';
import Cookies from 'universal-cookie';
import {
  Banner,
  BasicCard,
  Notice,
  Source,
  NoticeTab,
  Purchase,
} from '@/components/PortalComponents/index.tsx';
import { Nav, Login, Footer } from 'srm-front-boot/lib/components/PortalCard';
import { setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import last from 'lodash/last';
import { getLayoutConfig, fetchLanguageList } from '@/services/portalService';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { getExpires } from '@/utils/utils';
import { changePublicTheme, queryIntl } from '@/utils/publicUtils';
import remotes from 'utils/remote';
import getLayoutFromDs from './layoutFromDs';
import getLayoutSettingDs from './layoutSettingDs';
import getCardSettingDs from './cardSettingDs';
import getAddCardDs from './addCardDs';
import { PROTAL_CARD_CONTENT_TYPE } from '../../../utils/utils';
import {
  getPostLoginRedirectUrl,
  clearPostLoginRedirect,
} from '../postLoginRedirect';

export const Store = createContext({});
export const TITLECARDSOURCE = ['Notice', 'Source', 'Basic', 'Purchase'];

const cookies = new Cookies();
const MANAGEEDIT = '/spfm/portal-manage/edit/:layoutId';
const LAYOUTEDIT = '/spfm/portal-layout/edit/:layoutId';
const CARDSOURCE = {
  Nav: {
    component: Nav,
    minW: 24,
  },
  Banner: {
    component: Banner,
  },
  Login: {
    component: Login,
  },
  Basic: {
    component: BasicCard,
  },
  Notice: {
    component: Notice,
  },
  Source: {
    component: Source,
  },
  Footer: {
    component: Footer,
    minW: 24,
    minH: 2,
  },
  NoticeTab: {
    component: NoticeTab,
  },
  Purchase: {
    component: Purchase,
  },
};

const isError = getSession('isErrorFlag'); // 获取当前的session isErrorFlag
if (!isError) {
  // 如果没有isErrorFlag的session，设置为true
  // 为了未登录状态可以正常切换语言
  setSession('isErrorFlag', true);
}

export const imageType = url => {
  return `image/${last(url ? url.split('.') : 'png')}`;
};

const StoreProvider = props => {
  const { match, pageInfo, history, remote } = props;
  const [layout, setLayout] = useState([]); // 布局信息
  const [layoutId, setLayoutId] = useState(null); // 模板ID
  const [layoutInfo, setLayoutInfo] = useState({}); // 模板信息
  const [diyCardList, setDiyCardList] = useState([]); // 模板信息中提取 自定义卡片信息列表
  const [token] = useState(getAccessToken());
  const [isPreview] = useState(match.path === '/pub/home'); // 是否为预览页面
  const [isGetPreview] = useState(match.path === '/pub/home/:layoutId'); // 是否为预览页面
  const [isPublic] = useState(match.path === '/public/home'); // 是否为正式页面
  const [isEdit] = useState(match.path === MANAGEEDIT || match.path === LAYOUTEDIT); // 是否为编辑页面
  const layoutSettingDs = useMemo(() => {
    return isEdit && new DataSet(getLayoutSettingDs()).create({ ...layoutInfo, logo });
  }, [layoutInfo, logo]); // 模板设置
  const layoutFromDs = useMemo(
    () => token && isEdit && new DataSet(getLayoutFromDs()).create(layoutInfo),
    [layoutInfo]
  ); // 引用模板
  const [loading, setLoading] = useState(true);
  const [languageList, setLanguageList] = useState([]); // 语言列表
  const cardSettingDsObject = useMemo(() => isEdit && new DataSet(getCardSettingDs(languageList)), [
    languageList,
  ]); // 卡片设置
  const addCardDsObject = useMemo(() => isEdit && new DataSet(getAddCardDs()), []); // 新增标准卡片
  const [cardData, setCardData] = useState({}); // 当前设置卡片的信息
  const [language] = useState(cookies.get('language') || pageInfo.language || 'zh_CN');
  const [logo, setLogo] = useState({
    url: pageInfo.logo,
    type: imageType(pageInfo.logo),
  }); // 当前系统logo
  const [pageTitle] = useState(pageInfo.title); // 当前系统title
  const [pageFavicon, setPageFavicon] = useState({
    url: pageInfo.favicon,
    type: imageType(pageInfo.favicon),
  }); // 当前系统favicon
  const [autoSave, setAutoSave] = useState(false);
  const [expires] = useState(getExpires(86400000));

  useEffect(() => {
    (async () => {
      if (isUndefined(cookies.get('language')) && (isEdit || isPreview)) {
        setSecureCookie('language', pageInfo.language, {
          path: '/',
          expires: getExpires(365 * 24 * 60 * 60 * 1000),
        });
      }
      if (token && !isPublic) {
        setSecureCookie('realName', pageInfo.realName, { path: '/', expires });
      }
      await getGlobalLayout();
    })();

    return () => {
      clearInfo();
    };
  }, [match.params.layoutId]);

  const clearInfo = () => {
    setLayoutInfo({});
    setLayoutId(null);
    setDiyCardList([]);
  };

  const initLanguage = async (data, config) => {
    const { cardContent = {} } = data.find(card => card.cardCategory === 'Nav') || {};
    const lang =
      cookies.get('language') ||
      (cardContent.useBrowserLanguage === 1 && config.browserLanguage
        ? config.browserLanguage
        : cardContent.defaultLanguage) ||
      'zh_CN';
    if (isPublic && isUndefined(cookies.get('language'))) {
      setSecureCookie('language', lang, {
        path: '/',
        expires: getExpires(365 * 24 * 60 * 60 * 1000),
      });
    }
    if (cardContent.logo) {
      setLogo(cardContent.logo);
    }
    // 仅在门户首页更改全局的语言
    if (
      isPublic &&
      getDvaApp()?._store?.getState()?.global &&
      lang !== getDvaApp()?._store?.getState()?.global?.language
    ) {
      getDvaApp()._store.dispatch({
        type: 'global/publicLayoutLanguage',
        payload: {
          language: lang,
        },
      });
    }
    await queryIntl(lang, 'srm.portal', 'srm.oauth,smbl.common');
  };

  /**
   * 组装卡片信息
   */
  const loadCard = (layouts = []) => {
    if (!layouts.length) {
      setLoading(false);
      return;
    }
    const res = layouts.map(card => {
      // 跳过不存在的卡片类型
      if (!CARDSOURCE[card.cardCategory]) return;
      const Cmp = CARDSOURCE[card.cardCategory].component;
      if (Cmp) {
        const cardCmpProps = { remote };
        if (
          card.cardContent &&
          card.cardContent.cardContentType === PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE
        ) {
          cardCmpProps.match = match;
          cardCmpProps.location = props.location;
        }
        return {
          ...card,
          component: (
            <Cmp
              history={history}
              {...cardCmpProps}
              {...card.cardContent}
              style={{ width: '100%', height: '100%' }}
            />
          ),
        };
      } else {
        return card;
      }
    });
    setDiyCardList(res.filter(item => !!item));
    setLoading(false);
  };

  /**
   * 获取标准卡片列表
   */
  const getStandardCardList = (dataJson = []) => {
    const standardRes = dataJson.filter(item => {
      return item.cardContent && item.cardContent.isStandardCard;
    });
    return [
      ...standardRes.map(item => {
        return {
          ...item,
          ...item.cardContent,
          cardName: item.cardContent.title,
        };
      }),
    ];
  };

  /**
   * 浏览器标签页设置
   */
  const setPageInfo = async data => {
    const newTitle = data.pageTitle || pageTitle;
    if (newTitle) {
      const { dvaApp } = window;
      const { user } = dvaApp._store.getState();
      if (!user || !user.currentUser || !user.currentUser.title) {
        dvaApp._store.dispatch({
          type: 'user/updateState',
          payload: {
            ...user,
            currentUser: {
              ...(user.currentUser || {}),
              title: newTitle,
            },
          },
        });
      }
    }

    if (!isUndefined(data.tenantId)) {
      setSecureCookie('tenantId', data.tenantId, { path: '/', expires });
    }
    if (data.favicon) {
      updateBrowserFavicon({ url: data.favicon, type: imageType(data.favicon) });
    }
  };

  /**
   * 浏览器标签页设置-favicon
   */
  const updateBrowserFavicon = favicon => {
    document.querySelector('link[rel="shortcut icon"]').href =
      (favicon && favicon.url) || pageFavicon.url;
  };

  /**
   * 初始化模板信息
   */
  const initDataJson = (data, langList, editionCardList, prefix, functionalityCtrl = {}) => {
    const { supplierNewRegisterEnabled } = functionalityCtrl;
    if (isEdit && !data.length) {
      const loginCard = editionCardList.find(item => item.cardCategory === 'Login');
      if (loginCard) {
        handleAddCard(loginCard);
        setAutoSave(true);
      }
      return [];
    }
    return data.map(card => {
      const { cardCode, cardContent, ...rest } = card;
      return {
        ...rest,
        i: String(cardCode),
        cardContent: {
          ...cardContent,
          languageList: langList,
          prefix,
          supplierNewRegisterEnabled,
        },
      };
    });
  };

  const queryLanguageList = async ({ tenantId, defaultLanguageList }) => {
    if (!isNil(tenantId)) {
      const res = await fetchLanguageList({ tenantId });
      if (getResponse(res)) {
        setLanguageList(res);
      } else {
        setLanguageList(defaultLanguageList);
      }
    } else {
      setLanguageList(defaultLanguageList);
    }
  };

  // 拿到模板ID后获取模板信息
  const getGlobalLayout = async id => {
    setLoading(true);
    // 凡从业务页因登录态跳转登录的，登录成功后优先回跳原业务页（正式/测试/预览均适用）
    if (token && !isEdit) {
      const postLoginRedirect = getPostLoginRedirectUrl();
      if (postLoginRedirect) {
        cookies.remove('JSESSIONID');
        clearPostLoginRedirect();
        window.location.replace(postLoginRedirect);
        return;
      }
    }
    const curId = id || match.params.layoutId;
    // 是否进入预览状态
    if (isPreview) {
      // 获取sessionStorage中存储的信息
      const curPreviewInfo = getSession('portalManagePreview');
      // 不存在模板信息则跳转首页
      if (!curPreviewInfo || isUndefined(curPreviewInfo)) {
        props.history.push('/');
        return;
      }
      const cardList = curPreviewInfo.diyCardList || [];
      await setPageInfo(curPreviewInfo.layoutInfo);
      setLayoutInfo({
        ...layoutInfo,
        standardCardList: getStandardCardList(cardList),
      });
      setLayoutId(curId);
      loadCard(cardList);
    } else {
      try {
        // 接口请求获取模板信息
        const res = await getLayoutConfig(!isPublic ? curId : '');
        const {
          skipAfterLoginFlag,
          languageList: langList,
          editionCardList,
          prefix,
          functionalityCtrl = {},
          tenantId,
        } = res;
        // 模板信息获取失败则回到老门户页面
        if (isNil(res.id)) {
          window.location.replace('/oauth');
          return;
        }
        // 正式环境 已登录 未开启中间跳转页面
        if (isPublic && token && !skipAfterLoginFlag) {
          cookies.remove('JSESSIONID');
          window.location.replace(`${window.$$env.BASE_PATH || '/'}workplace?_r=${Math.random()}`);
          return;
        }
        // 正式环境对标签页进行设置
        if (isPublic || isGetPreview) {
          await setPageInfo(res);
        }
        // 修改未登录状态的主题配置
        if (
          cookies.get('isTenant') !== '0' &&
          (!res.themeConfigVO || res.themeConfigVO.tenantId !== 0)
        ) {
          await changePublicTheme(false, res.themeConfigVO);
        }

        const dataJson = trim(res.dataJson) ? JSON.parse(trim(res.dataJson)) : [];
        const standardList = getStandardCardList(dataJson);
        // 复制模板后，需保存原模板的基础信息
        const newLayoutInfo = id
          ? {
              ...layoutInfo,
              standardCardList: standardList,
              editionCardList,
              dataJson,
              id,
            }
          : {
              ...res,
              standardCardList: standardList,
            };
        await initLanguage(dataJson, res);
        setLayoutInfo(newLayoutInfo);
        setLayoutId(match.params.layoutId);
        await queryLanguageList({ tenantId, defaultLanguageList: langList });
        setLogo({ url: newLayoutInfo.logoUrl, type: imageType(newLayoutInfo.logoUrl) });
        setPageFavicon({ url: newLayoutInfo.favicon, type: imageType(newLayoutInfo.favicon) });
        loadCard(initDataJson(dataJson, langList, editionCardList, prefix, functionalityCtrl));
      } catch (err) {
        throw new Error(err);
      }
    }
  };

  /**
   * @function handleAddCard - 添加卡片
   */
  const handleAddCard = data => {
    const { cardCode, cardCategory, cardName, defaultHeigth, defaultWidth } = data;
    // 不存在此卡片则省略
    if (!CARDSOURCE[cardCategory]) return;
    const newList = [
      ...diyCardList,
      {
        cardCategory,
        cardCode,
        x: 0,
        y: 1000,
        h: defaultHeigth || 5,
        w: defaultWidth || 8,
        i: String(cardCode),
        cardContent: {
          ...data,
          title: cardName,
          cardTitleStatus: TITLECARDSOURCE.includes(cardCategory) ? 1 : 0,
          cardCode,
          cardCategory,
          defaultLanguage: 'zh_CN',
          useBrowserLanguage: 1,
          logo: cardCategory === 'Nav' ? logo : '',
          languageList: cardCategory === 'Nav' ? languageList : [],
        },
      },
    ];
    loadCard([...newList]);
  };

  /**
   * @function handleRemoveCard 移除卡片
   * @param {id} - 卡片ID
   */
  const handleRemoveCard = i => {
    const newCards = diyCardList.filter(l => {
      return l.i !== i;
    });
    loadCard([...newCards]);
  };

  const value = {
    ...props,
    layoutId,
    layoutInfo,
    setLayoutInfo,
    diyCardList,
    layoutFromDs,
    layoutSettingDs,
    cardSettingDsObject,
    addCardDsObject,
    getGlobalLayout,
    loadCard,
    layout,
    setLayout,
    handleAddCard,
    handleRemoveCard,
    logo,
    setLogo,
    isEdit,
    isPreview,
    isGetPreview,
    language,
    isPublic,
    cardData,
    setCardData,
    languageList,
    loading,
    pageTitle,
    pageFavicon,
    setPageFavicon,
    autoSave,
  };

  return (
    <Store.Provider value={value} key={`${language}-${cookies.get('tenantId')}`}>
      {props.children}
    </Store.Provider>
  );
};

// export default StoreProvider;

export default compose(
  formatterCollections({
    code: ['hptl.portalAssign', 'srm.oauth', 'hzero.common', 'hptl.common', 'hzero.c7nProUI'],
  }),
  remotes({
    code: 'SPFM_PORTAL_CONFIG', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  }),
  connect(
    ({ user = {} }) => ({
      pageInfo: user.currentUser || {},
    }),
    dispatch => ({
      init: payload =>
        dispatch({
          type: 'global/init',
          payload,
        }),
    })
  )
)(StoreProvider);

// export default (
//   (StoreProvider)
// );
