/**
 * NewNav
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'dva/router';
import { uniqBy } from 'lodash';
import { connect } from 'dva';
import { Icon } from 'choerodon-ui';
import { ModalProvider } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { getSession, setSession, getCurrentOrganizationId } from 'utils/utils';

import PinCancel from '../../../../assets/icon-pin-cancel.svg';
import { getClassName } from '../../utils';
import NewMenu from '../NewMenu';
import NewHeaderSearch from '../NewHeaderSearch';
import AllMenuSelect from '../AllMenuSelect';
import { openMenu } from '../../../components/DefaultMenu/utils';

const tenantId = getCurrentOrganizationId();

function getNavClassName(...paths) {
  return getClassName('nav', ...paths);
}

const menuHistorySessionKey = 'menuHistoryKey';

const NewNav = function NewNav(props) {
  const {
    collapsed,
    menuHidden = false,
    dispatch,
    navPattern,
    bodyRef,
    menuLeafNode,
    commonMenus = [],
    pageStyleLineFeed,
  } = props;
  const isNavMode2 = navPattern === 'NAV_MODE_2';
  const [menuLineWrap] = useState(!!pageStyleLineFeed);
  const allMenuSelectRef = useRef({});
  const menuContainerRef = useRef();
  const [{ recentlyVisited, hover, searchActive, searchText, searchDropDownHidden }, setState] = useState(
    () => ({
      recentlyVisited: [],
      searchText: '',
      searchDropDownHidden: true,
    }),
  );
  useEffect(() => {
    const recentlyVisited = getSession(menuHistorySessionKey);
    if (recentlyVisited && menuLeafNode.length) {
      const menuIdMap = menuLeafNode.map(menu => menu.id);
      setState(prevState => ({
        ...prevState,
        recentlyVisited: recentlyVisited.filter(visited => menuIdMap.includes(visited.id)),
      }));
    }
  }, [menuLeafNode]);

  useEffect(() => {
    if (isNavMode2) {
      dispatch({
        type: 'global/queryCommonMenus',
      });
    }
  }, [dispatch, isNavMode2]);
  const handleCommonMenusChange = useCallback((e, status, menu, menus) => {
    e.preventDefault();
    e.stopPropagation();
    const menuData = {
      menuCode: menu.functionMenuCode,
      tenantId,
    }
    const payload = status ? menus.filter(common => common.menuCode !== menuData.menuCode) : [...menus, menuData];
    dispatch({
      type: 'global/createCommonMenus',
      payload,
    });
  }, [dispatch]);
  const handleToggleCollapse = useCallback(() => {
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: { collapsed: !collapsed },
    });
  }, [dispatch, collapsed]);
  const handleRecentlyVisitedChange = useCallback((newRecentlyVisited) => {
    setSession(menuHistorySessionKey, newRecentlyVisited);
    setState(prevState => ({
      ...prevState,
      recentlyVisited: newRecentlyVisited,
    }));
  }, []);
  const addRecentlyVisited = useCallback((tab) => {
    setState((prevState) => {
      const newRecentlyVisited = uniqBy([tab, ...prevState.recentlyVisited], (t) => t.id);
      if (newRecentlyVisited.length > 5) {
        newRecentlyVisited.pop();
      }
      setSession(menuHistorySessionKey, newRecentlyVisited);
      return {
        ...prevState,
        recentlyVisited: newRecentlyVisited,
      };
    });
  }, []);
  const handleSearchDropDownHiddenChange = useCallback((hidden) => setState(prevState => ({
    ...prevState,
    searchDropDownHidden: hidden,
  })), []);
  const handleSearch = useCallback((text) => setState(prevState => {
    const newState = {
      ...prevState,
      searchText: text,
    };
    if (text) {
      newState.searchDropDownHidden = true;
    }
    return newState;
  }), []);
  const handleSearchActiveChange = useCallback(active => setState(prevState => {
    const newState = {
      ...prevState,
      searchActive: active,
    };
    if (collapsed && !active && !prevState.hover) {
      const { current } = allMenuSelectRef;
      if (!current.modal && !current.willModal) {
        newState.searchText = '';
      }
    }
    return newState;
  }), [collapsed]);
  const renderItemNode = useCallback((menu, content, noAdd) => {
    const { path, type } = menu;
    if (path) {
      if (type === 'window') {
        return (
          <a href={path.startsWith('http') ? path : `http://${path}`} target="_blank">
            {content}
          </a>
        );
      }
      const openTab = (tab) => {
        openMenu(tab);
        if (!noAdd) {
          addRecentlyVisited(tab);
        }
      };
      if (type === 'link' || type === 'inner-link') {
        return (
          <Link to={`/link/${menu.id}`} onClick={() => openTab(menu)}>
            {content}
          </Link>
        );
      }
      if (type !== 'dir') {
        return (
          <Link to={path} onClick={() => openTab(menu)}>
            {content}
          </Link>
        );
      }
    }
    return (
      <span>
        {content}
      </span>
    );
  }, []);

  if (menuHidden) {
    return null;
  }
  const wrapperProps = {
    className: classNames(getNavClassName(), {
      [getNavClassName('collapsed')]: collapsed,
      [getNavClassName('hover')]: hover || searchActive || allMenuSelectRef.current.modal || allMenuSelectRef.current.willModal,
    }),
  };
  const menuProps = {
    className: [getNavClassName('menu'), menuLineWrap && "menu-line-wrap"].filter(Boolean).join(" "),
    ref: menuContainerRef,
  };
  const bottomProps = {
    className: getNavClassName('bottom'),
    onClick: handleToggleCollapse,
  };
  if (collapsed) {
    const handleMouseEnter = () => {
      const { current } = allMenuSelectRef;
      if (current.navCloseDefer) {
        window.clearTimeout(current.navCloseDefer);
        current.navCloseDefer = null;
      }
      setState(prevState => {
        if (!current.modal) {
          if (!prevState.hover && !current.modal) {
            const animating = {};
            animating.promise = new Promise(resolve => {
              animating.resolve = resolve;
            });
            current.animating = animating;
          }
        }
        return { ...prevState, hover: true };
      });
    };
    const handleMouseLeave = () => {
      allMenuSelectRef.current.navCloseDefer = setTimeout(() => {
        setState(prevState => {
          const newState = { ...prevState, hover: false };
          if (collapsed) {
            if (!prevState.searchActive) {
              newState.searchText = '';
            }
            if (!prevState.searchDropDownHidden) {
              newState.searchDropDownHidden = true;
            }
          }
          return newState;
        });
      }, 300);
    };
    wrapperProps.onMouseEnter = handleMouseEnter;
    wrapperProps.onMouseLeave = handleMouseLeave;
    wrapperProps.onTransitionEnd = () => {
      const { animating, modal } = allMenuSelectRef.current;
      if (animating && animating.resolve) {
        if (modal) {
          allMenuSelectRef.current.animating = null;
        } else {
          animating.resolve();
        }
      }
    };
  } else {
    allMenuSelectRef.current.animating = null;
  }
  const nav = (
    <div {...wrapperProps}>
      <div className={getNavClassName('container')}>
        <div className={getNavClassName('top')}>
          {
            isNavMode2 ? (
              <AllMenuSelect
                ref={allMenuSelectRef}
                itemRenderer={renderItemNode}
                recentlyVisited={recentlyVisited}
                onRecentlyVisitedChange={handleRecentlyVisitedChange}
                onSearchActiveChange={handleSearchActiveChange}
                collapsed={collapsed}
                onModalClose={() => setState(prevState => ({ ...prevState }))}
                onCommonMenusChange={handleCommonMenusChange}
                commonMenus={commonMenus}
                menuLineWrap={pageStyleLineFeed}
              />
            ) : (
              <NewHeaderSearch
                dropDownHidden={searchDropDownHidden}
                searchText={searchText}
                onDropDownHiddenChange={handleSearchDropDownHiddenChange}
                onSearch={handleSearch}
                onActiveChange={handleSearchActiveChange}
                itemRenderer={renderItemNode}
                recentlyVisited={recentlyVisited}
                onRecentlyVisitedChange={handleRecentlyVisitedChange}
              />
            )
          }
        </div>
        <div {...menuProps}>
          <NewMenu
            searchText={searchText}
            collapsed={collapsed}
            getNavClassName={getNavClassName}
            itemRenderer={renderItemNode}
            hover={hover || searchActive}
            containerRef={menuContainerRef}
            isNavMode2={isNavMode2}
            onCommonMenusChange={handleCommonMenusChange}
          />
        </div>
        <div {...bottomProps}>
          {collapsed ? <Icon type="push_pin" /> : <img src={PinCancel} />}
          <span>
            {
              collapsed ?
                intl.get('hzero.common.basicLayout.pinMenu').d('固定菜单') :
                intl.get('hzero.common.basicLayout.unpinMenu').d('取消固定菜单')
            }
          </span>
        </div>
      </div>
    </div>
  );

  return isNavMode2 ? (
    <ModalProvider getContainer={() => bodyRef.current}>
      {nav}
    </ModalProvider>
  ) : nav;
};

export default connect(
  ({ user: { currentUser: { themeConfigVO: { navPattern, pageStyleLineFeed } = {} } = {} } = {}, global: { menuHidden, commonMenus, collapsed = {}, menuLeafNode = [] } = {} }) => ({
    collapsed: collapsed.collapsed, // 菜单展开收起
    menuHidden, // 隐藏菜单
    commonMenus,
    navPattern: navPattern || 'NAV_MODE_1',
    menuLeafNode,
    pageStyleLineFeed,
  }),
  null,
  null,
  { pure: true },
)(NewNav);

