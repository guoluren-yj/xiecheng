import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui';
import styles from '@/routes/Modeler/BasicTable/index.less';

interface IApiListMenu {
  item: { tenantName?: string };
}
export default observer(({ item }: IApiListMenu) => {
  const menuLeftFontRef: any = useRef({});
  const isTooltip = menuLeftFontRef.current?.offsetWidth > 215;
  if (isTooltip) {
    return (
      <Tooltip title={item.tenantName}>
        <i className={styles['menu-left-list-font']}>
          <span ref={menuLeftFontRef}>{item.tenantName}</span>
        </i>
      </Tooltip>
    );
  }
  return (
    <i className={styles['menu-left-list-font']}>
      <span ref={menuLeftFontRef}>{item.tenantName}</span>
    </i>
  );
});
