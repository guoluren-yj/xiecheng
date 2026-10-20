/**
 * @author WY <yang.wang06@hand-china.com>
 * @creationDate 2020/2/20
 * @copyright HAND ® 2020
 */

import { useEffect, useMemo } from 'react';
import { forEach, isArray } from 'lodash';
import EventEmitter from 'event-emitter';

import { useFetchWithRequest, useForceUpdate } from '../../../hooks';

import menuConfig from '../config/menu';
import { queryMenu } from '../services/menuService';

const hlodPermission = new Map();
const menuEvent = new EventEmitter();

function useMenuUpdate() {
  // 需要强制更新
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const menuUpdateListener = () => {
      forceUpdate();
    };
    menuEvent.on('update', menuUpdateListener);
    return () => {
      menuEvent.off('update', menuUpdateListener);
    };
  }, []);
}

/**
 * 是否拥有指定的菜单权限
 * @param {string} code - 权限编码
 * @return {boolean|boolean}
 */
function useHlodPermission(code) {
  useMenuUpdate();
  return hlodPermission.has(code) && !!hlodPermission.get(code);
}

/**
 * 是否拥有任意权限
 */
function useAnyHlodPermission() {
  useMenuUpdate();
  return hlodPermission.size > 0;
}

/**
 * 是否拥有权限编码之一
 * @param {string[]} codes - 权限编码数据
 */
function useSomeHlodPermission(codes) {
  useMenuUpdate();
  return codes.some((code) => hlodPermission.has(code) && !!hlodPermission.get(code));
}

/**
 * 拥有所有的权限编码
 * @param {string[]} codes - 权限编码数据
 */
function useEveryHlodPermission(codes) {
  useMenuUpdate();
  return codes.every((code) => hlodPermission.has(code) && !!hlodPermission.get(code));
}

/**
 * FIXME: 菜单权限需要做缓存, 在现有的组件结构下, 每次切换路由 都会重新请求
 * @return {[[], {hasError: *, loading: *}]}
 */
const useHlodMenu = (sharedFlag) => {
  const [menuCodes = [], { loading, hasError }] = useFetchWithRequest(
    () => queryMenu(sharedFlag),
    []
  );

  return useMemo(() => {
    hlodPermission.clear();
    const permissionObj = menuCodes.reduce((prev, cur) => {
      hlodPermission.set(cur, true);
      return { ...prev, [cur]: true };
    }, {});
    menuEvent.emit('update');

    function mapMenu(menus) {
      const newMenus = [];
      forEach(menus, (m) => {
        if (permissionObj[m.code]) {
          // 授权通过;
          if (isArray(m.children)) {
            const newChildren = mapMenu(m.children);
            if (newChildren.length > 1) {
              newMenus.push({ ...m, children: newChildren });
            } else if (newChildren.length === 1) {
              newMenus.push({ ...m, children: undefined, ...newChildren[0] });
            }
          } else {
            newMenus.push({ ...m });
          }
        }
      });
      return newMenus;
    }

    return [mapMenu(menuConfig), { loading, hasError }];
  }, [JSON.stringify(menuCodes), loading, hasError]);
};

export {
  useHlodMenu,
  useHlodPermission,
  useAnyHlodPermission,
  useSomeHlodPermission,
  useEveryHlodPermission,
  menuEvent,
};
