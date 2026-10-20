import { getCurrentOrganizationId, getUserOrganizationId, isTenantRoleLevel } from 'utils/utils';
// import hwfpRouters from 'hzero-front-hwfp/lib/config/routers';
import oldRouters from './routers';

function traversal(item, isSupplier = false, isTenant = true) {
  const res = { ...item };
  if (isTenant && isSupplier && item.FilterSupplier) return false;
  if (item.components !== undefined) {
    res.components = res.components.map((i) => traversal(i, isSupplier, isTenant)).filter(Boolean);
  }
  if (item.coverPath) {
    res.path = item.coverPath;
  }
  return res;
}

const getMsRouters = () => {
  const isTenant = isTenantRoleLevel();
  const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId();

  return [
    ...oldRouters.map((route) => traversal(route, isSupplier, isTenant)),
    // ...hwfpRouters.map(route=>traversal(route, isSupplier, isTenant)),
  ].filter(Boolean);
};

export default getMsRouters;
