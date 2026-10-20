/**
 * 菜单组配置
 * @date: 2022-05-25
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState } from 'react';
import { isTenantRoleLevel } from 'utils/utils';
import qs from 'querystring';
import MenuGroupList from './MenuGroupList';
import SrmMenuGroup from './SrmMenuGroup';

const MenuGroupContainer = (props) => {
  const {
    location: { search = '' },
    match: {
      params: { fdLevel, groupCode, tenantId },
    },
  } = props;
  const { groupName } = qs.parse(search.substr(1));
  const [isTenant] = useState(isTenantRoleLevel());

  if (isTenant || (groupCode && tenantId)) {
    return (
      <MenuGroupList
        fdLevel={fdLevel}
        groupName={groupName}
        groupCode={groupCode}
        tenantId={tenantId}
      />
    );
  }

  return <SrmMenuGroup />;
};

export default MenuGroupContainer;
