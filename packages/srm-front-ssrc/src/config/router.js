/*
 * @Description:
 * @Autor: hongzhu.chen@going-link.com
 * @Date: 2021-05-20 20:58:30
 * @LastEditTime: 2021-05-28 11:31:41
 */
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
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
  return oldRouters.map((route) => traversal(route, isSupplier)).filter(Boolean);
};

export default getMsRouters;
