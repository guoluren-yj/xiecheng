/**
 * NewMenu
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { connect } from 'dva';
import { Menu, Spin, Icon } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import isOverflow from 'choerodon-ui/pro/lib/overflow-tip/util';
import { getMenuKey, renderIcon } from '../../../components/DefaultMenu/utils';
import { isActiveMenu, renderMenuTitle } from '../../utils';
import None from '../None';
import Notice from '../Notice';

const MenuTitle = function (props) {
  const { children, className } = props;
  const onMouseEnter = ({ target }) => {
    if (isOverflow(target)) {
      Tooltip.show(target, {
        title: children,
        placement: 'right',
      });
    }
  };
  useEffect(() => () => Tooltip.hide(), []);
  return (
    <span
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => Tooltip.hide()}
    >
      {children}
    </span>
  );
};

const NewMenu = function NewMenu(props) {
  const {
    menuLoad, menus, getNavClassName, itemRenderer, searchText, activeTabKey, hover, collapsed,
    containerRef, isNavMode2, commonMenus = [], onCommonMenusChange
  } = props;
  const [{ openKeys, closeKeys, commonMenuRenderer, commonMenuKeys }, setState] = useState({
    openKeys: [],
    closeKeys: [],
    commonMenuRenderer: [],
    commonMenuKeys: [],
  });
  const commonMenusCode = useMemo(() => isNavMode2 ? commonMenus.map(menu => menu.menuCode) : [], [commonMenus]);
  const {
    node,
    // selectedKeys
  } = useMemo(() => {
    if (isNavMode2 && !commonMenusCode.length) {
      return {
        node: <Notice />,
      };
    }
    if (menuLoad) {
      const isCollapsed = collapsed && !hover;
      const selectedKeys = [];
      const openSet = new Set(isCollapsed ? [] : openKeys);
      const closeSet = new Set(closeKeys);
      const commonMenuRendererSet = new Set(commonMenuRenderer);
      const commonMenuKeysSet = new Set(commonMenuKeys);
      const itemCls = getNavClassName('menu', 'item');
      const subCls = getNavClassName('menu', 'sub');
      let commonCls = `${getNavClassName('menu', 'common')} c7n-menu-item`;
      const renderItem = (item, { key: parentKey, matched: parentMatched }, level) => {
        let commonActiveCls = '';
        const [title, matched] = renderMenuTitle(item, searchText, isNavMode2 ? commonMenusCode : null);
        const { id: key } = item;
        const content = (
          <>
            {
              level < 1 ?
                renderIcon(item, undefined, { fontSize: '0.14rem', width: '.14rem' }, [getNavClassName('menu', 'item', 'icon')]) :
                <i className={getNavClassName('menu', 'item', 'placeholder')} />
            }
            <MenuTitle className="menu-text">
              {title}
            </MenuTitle>
            {
              isNavMode2 && matched ?
                <Icon type="star" className={getNavClassName('menu', 'item', 'star')} onClick={
                  (e) => onCommonMenusChange(e, true, item, commonMenus)
                } /> :
                null
            }
          </>
        );
        const contentRender = itemRenderer(item, content);
        if (isActiveMenu(item, activeTabKey)) {
          if (!isCollapsed) {
            commonActiveCls = 'c7n-menu-item-selected';
            selectedKeys.push(getMenuKey(item));
            if (parentKey) {
              openSet.add(parentKey);
            }
          }
        }
        if (isNavMode2 && matched && !commonMenuKeysSet.has(key)) {
          commonMenuKeysSet.add(key);
          commonMenuRendererSet.add(<div key={key} className={`${commonCls} ${commonActiveCls}`}>{contentRender}</div>);
        }
        return [
          contentRender,
          matched || parentMatched,
        ];
      };
      const renderSubMenuOrItem = (mainMenu, { key: parentKey, matched: parentMatched } = {}, level = 0) => {
        const { children } = mainMenu;
        const key = getMenuKey(mainMenu);
        if (children && children.length) {
          const [title, matched] = renderItem(mainMenu, {
            key: parentKey,
            matched: parentMatched,
          }, level);
          const content = children.reduce((list, child) => {
            const item = renderSubMenuOrItem(child, {
              key,
              matched,
            }, level + 1);
            if (item) {
              list.push(item);
            }
            return list;
          }, []);
          if (content.length || matched) {
            if (!isCollapsed && searchText && !closeSet.has(key)) {
              openSet.add(key);
            }
            return (
              <Menu.SubMenu
                key={key}
                title={title}
                className={subCls}
              >
                {content}
              </Menu.SubMenu>
            );
          }
        }
        const [title, matched] = renderItem(mainMenu, {
          key: parentKey,
          matched: parentMatched,
        }, level);
        if (matched) {
          return (
            <Menu.Item data-id={key} className={itemCls} key={key}>
              {title}
            </Menu.Item>
          );
        }
      };
      const groups = menus.reduce(($groups, mainMenu) => {
        if (mainMenu.children) {
          const content = mainMenu.children.reduce((list, menu) => {
            const item = renderSubMenuOrItem(menu);
            if (item) {
              list.push(item);
            }
            return list;
          }, []);
          if (content.length) {
            $groups.push(
              <Menu.ItemGroup
                key={getMenuKey(mainMenu)}
                title={renderMenuTitle(mainMenu, '', isNavMode2 ? commonMenusCode : null)[0]}
              >
                {content}
              </Menu.ItemGroup>,
            );
          }
        }
        return $groups;
      }, []);
      if (searchText) {
        if (!groups.length) {
          return {
            node: <None />,
          };
        }
      }
      const menuProps = {
        mode: 'inline',
        inlineIndent: 0,
        selectedKeys,
        openKeys: [...openSet.values()],
        onOpenChange: (newOpenKeys) => {
          newOpenKeys.forEach(key => {
            if (openSet.has(key)) {
              openSet.delete(key);
            } else if (closeSet.has(key)) {
              closeSet.delete(key);
            }
          });
          openSet.forEach(key => {
            closeSet.add(key);
          });
          setState({
            openKeys: newOpenKeys,
            closeKeys: [...closeSet.values()],
          });
        },
      };
      if (isNavMode2) {
        return {
          node: commonMenuRendererSet,
        }
      }
      return {
        node: (
          <Menu {...menuProps}>
            {groups}
          </Menu>
        ),
        // selectedKeys,
      };
    }
    return {
      node: <Spin />,
    };
  }, [menuLoad, menus, searchText, openKeys, closeKeys, activeTabKey, collapsed, hover, commonMenusCode]);
  // 滚动定位
  // const activeKey = selectedKeys && selectedKeys[0];
  // useLayoutEffect(() => {
  //   if (activeKey) {
  //     const { current } = containerRef;
  //     if (current) {
  //       setTimeout(() => {
  //         const item = current.querySelector(`[data-id=${activeKey}]`);
  //         if (item) {
  //           if (item.offsetTop < current.scrollTop || (item.offsetTop + item.offsetHeight) > current.scrollTop + current.offsetHeight) {
  //             const top = item.offsetTop - current.offsetHeight / 2 + item.offsetHeight / 2;
  //             if (current.scrollTo) {
  //               current.scrollTo({
  //                 top,
  //                 behavior: 'smooth',
  //               });
  //             } else {
  //               current.scrollTop = top;
  //             }
  //           }
  //         }
  //       }, 200);
  //     }
  //   }
  // }, [activeKey]);

  return node;
};

export default connect(({ global = {} }) => ({
  menus: global.menu,
  commonMenus: global.commonMenus,
  menuLoad: global.menuLoad,
  activeTabKey: global.activeTabKey,
}))(NewMenu);
