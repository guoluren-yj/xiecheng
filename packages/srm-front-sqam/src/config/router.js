import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import moment from 'moment';
import oldRouters from './routers';

window.moment = moment;
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

const getMsRouters = () => {
  const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId();
  return oldRouters.map(route => traversal(route, isSupplier)).filter(Boolean);
};

export default getMsRouters;
