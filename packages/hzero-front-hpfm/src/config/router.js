import React from 'react';
import { getCurrentOrganizationId, getUserOrganizationId, isTenantRoleLevel } from 'utils/utils';
import Exception from 'hzero-front/lib/components/Exception';
import oldRouters from './routers';

function traversal(item, isSupplier = false) {
  const res = { ...item };
  if(isSupplier && item.FilterSupplier) {
    return {
      ...item,
      path: item.coverPath,
      component: <Exception type='403' />,
      components: undefined,
      models: [],
    };
  }
  if (item.components !== undefined) {
    res.components = item.components.map(i=>traversal(i, isSupplier)).filter(Boolean);
  }
  if (item.coverPath) {
    res.path = item.coverPath;
  }
  return res;
}

const getMsRouters = () => {
  const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId() && isTenantRoleLevel();
  return oldRouters.map(route=>traversal(route, isSupplier)).filter(Boolean);
};

export default getMsRouters;
