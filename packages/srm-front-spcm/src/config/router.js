import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
// import hwfpRouters from 'hzero-front-hwfp/lib/config/routers';
import oldRouters from './routers';

function traversal(item, isSupplier = false) {
  const res = { ...item };
  if (isSupplier && item.FilterSupplier) return false;
  if (item.components !== undefined) {
    res.components = item.components.map((i) => traversal(i, isSupplier)).filter(Boolean);
  }
  if (item.coverPath) {
    res.path = item.coverPath;
  }
  return res;
}

const getMsRouters = () => {
  const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId();
  let routerConfig = [];
  routerConfig = [
    ...oldRouters.map((route) => traversal(route, isSupplier)),
    // ...hwfpRouters.map((route) => traversal(route, isSupplier)),
  ];
  return routerConfig.filter(Boolean);
};

export default getMsRouters;
