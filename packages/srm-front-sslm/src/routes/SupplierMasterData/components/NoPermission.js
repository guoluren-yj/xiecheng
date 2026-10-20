/* NoPermission 无查看权限
 * @Date: 2023-08-17 20:13:04
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';

import { ReactComponent as NoPermissionSvg } from '@/assets/common/no-permission.svg';

const NoPermission = () => {
  return (
    <div className="no-data-permission">
      <div>
        <NoPermissionSvg />
        <div className="no-data-permission-tips">
          {intl.get('sslm.common.view.message.noViewPermission').d('无查看权限')}
        </div>
      </div>
    </div>
  );
};

export default NoPermission;
