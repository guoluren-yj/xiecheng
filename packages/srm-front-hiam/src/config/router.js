import { getCurrentOrganizationId, getUserOrganizationId, isTenantRoleLevel } from 'utils/utils';

import oldRouters from './routers';

function traversal(item, isSupplier = false) {
  const res = { ...item };
  if (isSupplier && item.FilterSupplier) return false;
  if (item.components !== undefined) {
    res.components = item.components.map(i => traversal(i, isSupplier)).filter(Boolean);
  }
  if (item.coverPath) {
    res.path = item.coverPath;
  }
  return res;
}

// 覆盖hzero模块路由
function overrideHzeroRouter(hzeroRouter) {
  const coverRouter = [];
  hzeroRouter.forEach(route => {
    // 角色管理,个人中心,站内消息不过滤
    if (['/hiam/role', '/hiam/user', '/hmsg/user-message'].includes(route.path)) {
      coverRouter.push(route);
    } else {
      const newRoute = { ...route, priority: 1, FilterSupplier: true };
      if (newRoute.components && newRoute.components.length) {
        newRoute.components = newRoute.components.map(item => ({
          ...item,
          priority: 1,
          FilterSupplier: true,
        }));
      }
      coverRouter.push(newRoute);
    }
  });
  return coverRouter;
}

const getMsRouters = () => {
  const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId() && isTenantRoleLevel();
  return [
    ...overrideHzeroRouter(oldRouters)
      .map(route => traversal(route, isSupplier))
      .filter(Boolean),
  ];
};

export default getMsRouters;
