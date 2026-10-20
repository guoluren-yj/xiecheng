/**
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2020/2/19
 * @copyright HAND ® 2019
 */

import { checkPermission } from 'hzero-front/lib/services/api';
import { useFetchWithRequest } from './request';

/**
 * FIXME: 需要对 permission 做节流和防抖处理, 参照 PermissionProvider, 或者参照 useFetchWithRequest
 */

/**
 * @param {string[]} permissionCodeList - 权限集编码
 * @return {[boolean, boolean]} - [disabled, hidden]
 */
const usePermission = permissionCodeList => {
  const [data, { loading, hasError, errorData }] = useFetchWithRequest(
    () =>
      checkPermission(
        permissionCodeList.map(permissionCode =>
          permissionCode
            .replace(/^\//g, '')
            .replace(/\//g, '.')
            .replace(/:/g, '-')
        )
      ),
    [JSON.stringify(permissionCodeList)]
  );
  const permissionResult = [false, false];
  // 刚开始权限没有
  if (loading || hasError || errorData) {
    // 初始化 ｜ 失败
    permissionResult[0] = true;
    permissionResult[1] = true;
  } else {
    data.forEach(item => {
      if (!item.approve) {
        switch (item.controllerType) {
          case 'disabled':
            permissionResult[0] = true;
            break;
          case 'hidden':
            permissionResult[1] = true;
            break;
          default:
            permissionResult[0] = true;
            permissionResult[1] = true;
            break;
        }
      }
    });
  }
  return permissionResult;
};

export { usePermission };
