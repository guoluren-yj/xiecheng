import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import { Col, Icon, Row, Tabs, Tooltip } from 'choerodon-ui';
import { getClassName, isActiveMenu, renderMenuTitle } from '../../utils';
import NewHeaderSearch from '../NewHeaderSearch';
import None from '../None';
import { getMenuKey } from '../../../components/DefaultMenu/utils';

function getAllMenuClassName(...path) {
  return getClassName('all-menu', ...path);
}

const AllMenu = function AllMenu(props) {
  const { modal, itemRenderer, recentlyVisited, onRecentlyVisitedChange, activeTabKey, onSearchActiveChange, onCommonMenusChange, menus = [], commonMenus = [] } = props;
  const [{ activeKey, searchText }, setState] = useState(() => ({
    activeKey: menus.length ? menus[0].id : undefined,
  }));
  const commonMenusCode = useMemo(() => commonMenus ? commonMenus.map(menu => menu.menuCode) : [], [commonMenus]);
  const scrollRef = useRef();
  const handleSearch = useCallback((text) => setState(prevState => ({ ...prevState, searchText: text })));
  const handleChange = useCallback((key) => setState(prevState => ({ ...prevState, activeKey: key })));
  const renderItem = (item, parentMatched) => {
    const [title, matched] = renderMenuTitle(item, searchText);
    const content = (
      <span>{title}</span>
    );
    const commonStatus = commonMenusCode.includes(item.functionMenuCode);
    const commonStar = item.type !== 'dir' ? (
      <Icon type={commonStatus ? 'star' : 'star_border'} className={getAllMenuClassName('group', 'item', 'star')} onClick={
        (e) => onCommonMenusChange(e, commonStatus, item, commonMenus)
      } />
    ) : null;
    return [
      <Tooltip title={props.menuLineWrap ? undefined : title}>
        <div>
          {itemRenderer(item, <>{content}{commonStar}</>)}
        </div>
      </Tooltip>,
      matched || parentMatched,
    ];
  };
  const renderSubMenuOrItem = (mainMenu, parentMatched, isTop) => {
    const { children } = mainMenu;
    if (children && children.length) {
      const [title, matched] = renderItem(mainMenu, parentMatched);
      const content = children.reduce((list, child) => {
        const item = renderSubMenuOrItem(child, matched);
        if (item) {
          list.push(item);
        }
        return list;
      }, []);
      if (content.length || matched) {
        const key = getMenuKey(mainMenu);
        return (
          <Row key={key} gutter={16}>
            <Col span={6} className={getAllMenuClassName('group', 'subtitle')}>
              {title}
            </Col>
            <Col span={18}>
              <Row gutter={16}>
                {content}
              </Row>
            </Col>
          </Row>
        );
      }
    }
    const [title, matched] = renderItem(mainMenu, parentMatched);
    if (matched) {
      const itemClassName = classNames(getAllMenuClassName('group', 'item'), {
        [getAllMenuClassName('group', 'item', 'active')]: isActiveMenu(mainMenu, activeTabKey),
      });
      if (isTop) {
        return (
          <Row gutter={16}>
            <Col span={6} className={getAllMenuClassName('group', 'subtitle')}>
              <div>
                <Tooltip title={props.menuLineWrap ? undefined : renderMenuTitle(mainMenu)}>{renderMenuTitle(mainMenu)}</Tooltip>
              </div>
            </Col>
            <Col
              className={itemClassName}
              key={getMenuKey(mainMenu)}
              span={6}
            >
              {title}
            </Col>
          </Row>
        );
      }
      return (
        <Col
          className={itemClassName}
          key={getMenuKey(mainMenu)}
          span={8}
        >
          {title}
        </Col>
      );
    }
  };
  const getGroupClass = (active) => {
    return classNames(getAllMenuClassName('group'), {
      [getAllMenuClassName('group', 'active')]: active,
    });
  };
  const searchInfo = {};
  const [groups, topMenus] = menus.reduce(([array, items], mainMenu) => {
    const content = mainMenu.children ? mainMenu.children.reduce((list, menu) => {
      const item = renderSubMenuOrItem(menu, undefined, true);
      if (item) {
        list.push(item);
      }
      return list;
    }, []) : [];
    if (content.length) {
      const menuId = mainMenu.id;
      const active = searchText ? !array.length : menuId === activeKey;
      if (searchText && active) {
        searchInfo.first = menuId;
      }
      array.push(
        <div
          tabIndex={-1}
          id={menuId}
          className={getGroupClass(active)}
        >
          <div className={getAllMenuClassName('group', 'header')}>
            {renderMenuTitle(mainMenu)[0]}
          </div>
          <div className={getAllMenuClassName('group', 'body')}>
            {content}
          </div>
        </div>,
      );
      items.push(mainMenu);
    }
    return [array, items];
  }, [[], []]);

  const actualActiveKey = searchInfo.first || activeKey;

  useLayoutEffect(() => {
    const { current } = scrollRef;
    if (current) {
      const group = document.getElementById(actualActiveKey);
      if (group) {
        if (current.scrollTo) {
          current.scrollTo({
            top: group.offsetTop,
            behavior: 'smooth',
          });
        } else {
          group.focus();
        }
      }
    }
  }, [actualActiveKey]);

  return (
    <div className={`${getAllMenuClassName()}${props.menuLineWrap ? " menu-line-wrap" : ""}`}>
      <Icon type="close" onClick={() => modal.close()} />
      <div className={getAllMenuClassName('header')}>
        <NewHeaderSearch
          itemRenderer={itemRenderer}
          searchText={searchText}
          onSearch={handleSearch}
          recentlyVisited={recentlyVisited}
          onRecentlyVisitedChange={onRecentlyVisitedChange}
          onActiveChange={onSearchActiveChange}
          recentlyVisitedInline
        />
      </div>
      {
        groups.length ? (
          <div className={getAllMenuClassName('body')}>
            <div className={getAllMenuClassName('body', 'content')} ref={scrollRef}>
              {groups}
            </div>
            <div className={getAllMenuClassName('body', 'tabs')}>
              <Tabs
                tabPosition="right"
                activeKey={actualActiveKey}
                onChange={handleChange}
              >
                {
                  topMenus.map(menu => (
                    <Tabs.TabPane key={menu.id} tab={menu.title} />
                  ))
                }
              </Tabs>
            </div>
          </div>
        ) : searchText && <None />
      }
    </div>
  );
};

export default connect(({ global = {} }) => ({
  menus: global.menu,
  activeTabKey: global.activeTabKey,
  commonMenus: global.commonMenus,
}))(AllMenu);
