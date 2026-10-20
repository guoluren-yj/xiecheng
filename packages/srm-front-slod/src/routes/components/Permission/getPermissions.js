import { getResponse } from 'utils/utils';

import { checkPermission } from 'services/api';

export default async function getPermissions(code = []) {
  const permissionsMap = new Map();
  const res = getResponse(await checkPermission(code));
  if (res) {
    (res || []).forEach((item) => {
      permissionsMap.set(item.code, item.approve);
    });
  }
  return permissionsMap;
}
