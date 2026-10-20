import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';
import ConfigList from './ConfigList';

export default function GlobalSetting() {
  const openGlobalSetting = () => {
    const modal = Modal.open({
      mask: true,
      drawer: true,
      footer: null,
      movable: false,
      closable: false,
      maskClosable: false,
      destroyOnClose: true,
      bodyStyle: { padding: 0, overflow: 'hidden' },
      style: { width: 892 },
      children: <ConfigList madal={modal} />,
    });
  };
  return (
    <PermissionButton
      type="c7n-pro"
      funcType="flat"
      icon="settings"
      onClick={() => openGlobalSetting()}
      permissionList={[
        {
          code: 'srm.mall.tenant.buying-manage.mall-config.button.global.config',
          type: 'button',
          meaning: '商城装修-全局设置',
        },
      ]}
    >
      {intl.get('small.common.button.global.setting').d('全局设置')}
    </PermissionButton>
  );
}
