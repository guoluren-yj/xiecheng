/**
 * 工作区 Header
 *
 * @date: 2018-6-30
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, {
  useCallback,
  useContext,
  useEffect,
  isValidElement,
  useMemo,
  useState,
} from 'react';
import classnames from 'classnames';
import { withRouter } from 'dva/router';
import { Modal, Tooltip } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { isFunction, isObject, isString, split } from 'lodash';
import intl from 'utils/intl';
import { getTabData, getMenuLeafData, findRouteFromPathname } from 'utils/menuTab';
import PageContext from './PageContext';
import { getIsPubLayout } from '../../utils/menuTab';
import { getDvaApp } from '../../utils/iocUtils/helpers';

const iconStyle = { fontSize: 18 };

// 角色工作台打开的页面路由跳转拦截列表
const blackListForRoleWorkbench = [
  '/sqam/audit8D/list',
  '/sodr/order-approval/list',
  '/sqam/initiated8D/list',
];

const PageHeader = function PageHeader(props) {
  const {
    useDefaultTitle = true, // 使用自动生成的title
    title,
    backPath,
    backTooltip = intl.get('hzero.common.button.back').d('返回'),
    children,
    history,
    isChange,
    onBack,
    customBack,
    className,
  } = props;
  const { location: { pathname: pagePathname } = {} } = history;
  const { modal, history: pageHistory } = useContext(PageContext);
  const [headerNode, setHeaderNode] = useState();
  const [fullscreen, setFullscreen] = useState(document.fullscreenElement || false);
  const { global, user } = getDvaApp()._store.getState();
  const menuLayout = 
    (user && user.currentUser && user.currentUser.themeConfigVO && user.currentUser.themeConfigVO.enableThemeConfig)
     ? 'new' : global.menuLayout ;

  const handleFullScreenChange = () => {
    setFullscreen(document.fullscreenElement || false);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const linkToChange = useCallback(
    (url) => {
      // const newUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}_back=1`;
      // history.push(newUrl);
      const [pathname, search] = split(url, '?');
      history.push({
        pathname,
        search,
        state: {
          _back: -1,
        },
      });
    },
    [history]
  );
  const onBackBtnClick = useCallback(() => {
    if (isFunction(customBack)) {
      customBack();
      if (modal) {
        modal.close();
      }
    } else if (isString(backPath)) {
      const back = () => {
        if (modal) {
          modal.close();
        } else {
          linkToChange(backPath);
        }
        if (isFunction(onBack)) {
          onBack();
        }
      };
      if (isChange) {
        Modal.confirm({
          title: intl
            .get('hzero.common.message.confirm.giveUpTip')
            .d('你有修改未保存，是否确认离开？'),
          onOk: () => {
            back();
          },
        });
      } else {
        back();
      }
    } else if (modal) {
      modal.close();
    } else {
      history.goBack();
    }
  }, [linkToChange, history, backPath, isChange, onBack, customBack, modal]);
  let backBtn;
  if (backPath || modal) {
    backBtn = (
      <div key="page-head-back-btn" className="page-head-back-btn">
        <Tooltip title={backTooltip} placement="bottom" getTooltipContainer={(that) => that}>
          <Icon
            style={iconStyle}
            type={modal ? 'double_arrow' : 'arrow_back'}
            className="back-btn"
            onClick={onBackBtnClick}
          />
        </Tooltip>
      </div>
    );
  }

  useEffect(() => {
    if (modal && pageHistory && backPath) {
      const { push } = pageHistory;
      const blackList = new Set([...blackListForRoleWorkbench, backPath]);
      pageHistory.push = (path, ...args) => {
        if (
          (isString(path) && blackList.has(path)) ||
          (isObject(path) && blackList.has(path.pathname))
        ) {
          modal.close();
        } else {
          push.call(pageHistory, path, ...args);
        }
      };
      return () => {
        pageHistory.push = push;
      };
    }
  }, [modal, pageHistory, backPath]);

  const inTabHeader = useCallback(
    (tabPath) => {
      try {
        // 检查是否是tab页的首个header
        const pageHeadNodes = document.querySelectorAll(
          `.hzero-common-tab-pane[data-tab-path="${tabPath}"] .page-container .page-head`
        );
        return pageHeadNodes && pageHeadNodes[0] && pageHeadNodes[0] === headerNode;
      } catch (e) {
        return false;
      }
    },
    [headerNode]
  );

  const isPubOrPublicPage = useCallback((pagePath) => {
    return pagePath.startsWith('/pub') || getIsPubLayout();
  }, []);

  const pageTitle = useMemo(() => {
    /* 以下情况不处理
     *  1.useDefaultTitle为false即直接使用title,不处理
     *  2. 非字符串类型不处理
     *  3. pub或public页面不处理
     */
    if (!useDefaultTitle || isValidElement(title) || isPubOrPublicPage(pagePathname)) {
      return title;
    }
    // 查找所属哪个tab
    const tab = getTabData().find((tab) => tab.path === pagePathname);
    if (tab) {
      // 不在tab页的页头位置不处理
      if (!inTabHeader(tab.path)) {
        return title;
      }
      // 当前路由配过菜单, 直接返回菜单名称
      const targetMenu = getMenuLeafData().find((menu) => menu.path === pagePathname);
      if (targetMenu) {
        return targetMenu.title;
      }
      // 根据tab.key(父路由)查找是否配过菜单
      const tabMenu = getMenuLeafData().find((menu) => menu.path === tab.key);
      if (tabMenu) {
        const parentRouter = findRouteFromPathname(tab.key);
        const targetRouter = findRouteFromPathname(tab.path);
        if (parentRouter && targetRouter) {
          // 当前路由就是一级路由
          if (parentRouter.path === targetRouter.path) {
            return tabMenu.title;
          }
          // 菜单一般配的父路由，访问父路由时默认打开首个子路由
          // 故此处校验当前路由是否是父路由下的首个子路由
          if (
            parentRouter.components &&
            parentRouter.components[0] &&
            parentRouter.components[0].path === targetRouter.path
          ) {
            return tabMenu.title;
          }
        }
      }
    }
    return title;
  }, [headerNode, inTabHeader, useDefaultTitle, title, pagePathname]);

  const disabledFullScreen = useMemo(() => {
    return isPubOrPublicPage(pagePathname);
  }, [pagePathname, isPubOrPublicPage]);

  const clsString = classnames('page-head', className);

  const handleFullScreen = () => {

    if (!fullscreen) {
      if (menuLayout === 'horizontal') {
        const node = document.querySelector(`.hzero-layout`);
        if (node) {
          node.classList.add('hzero-fullscreen');
        }
      } else if (menuLayout === 'side') {
        const node = document.querySelector(`.hzero-side-layout-container`);
        if (node) {
          node.classList.add('hzero-fullscreen');
        }
      } else if (menuLayout === 'side-all') {
        const node = document.querySelector(`.hzero-common-layout-container`);
        if (node) {
          node.classList.add('hzero-fullscreen');
        }
      } else if (menuLayout === 'inline') {
        const node = document.querySelector(`.hzero-normal-container`);
        if (node) {
          node.classList.add('hzero-fullscreen');
        }
      } else if (menuLayout === 'new') {
        const node = document.querySelector(`.srm-layout-container`);
        if (node) {
          node.classList.add('hzero-fullscreen');
        }
      } else {
        const node = document.querySelector(`#root`).firstElementChild;
        if (node) {
          node.classList.add('hzero-fullscreen');
        }
      }

      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  return (
    <div className={clsString} ref={(ref) => setHeaderNode(ref)}>
      {backBtn}
      {title && (
        <span key="page-head-title" className="page-head-title">
          <div style={{ display: 'inline-block' }}>{pageTitle}</div>
          {!disabledFullScreen && (
            <Tooltip
              title={
                !fullscreen
                  ? intl.get('hzero.common.button.fullScreen').d('全屏模式')
                  : intl.get('hzero.common.button.exitFullScreen').d('退出全屏')
              }
            >
              <Icon
                type={!fullscreen ? 'fullscreen' : 'fullscreen_exit'}
                className="page-full-screen"
                style={{ verticalAlign: 'sub', color: '#000', fontSize: '20px', marginLeft: '2px', cursor: 'pointer' }}
                onClick={handleFullScreen}
              />
            </Tooltip>
          )}
        </span>
      )}
      <div key="page-head-operator" className="page-head-operator" style={{ flexWrap: 'wrap', rowGap: '4px', padding: '4px 0' }}>
        {children}
      </div>
    </div>
  );
};

export default withRouter(PageHeader);
