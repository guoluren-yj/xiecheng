/*
 * @Author: your name
 * @Date: 2020-10-23 11:32:24
 * @LastEditTime: 2020-10-23 17:02:30
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-ssta\src\config\router.js
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
