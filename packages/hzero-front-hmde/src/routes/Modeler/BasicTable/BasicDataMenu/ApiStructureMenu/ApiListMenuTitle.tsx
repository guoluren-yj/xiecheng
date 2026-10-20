import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui';
import styles from '@/routes/Modeler/BasicTable/index.less';

interface IApiListMenu {
  item: { apiPath?: string };
}
export default observer(({ item }: IApiListMenu) => {
  const menuLeftFontRef: any = useRef({});
  const isTooltip = menuLeftFontRef.current?.offsetWidth > 130;
  if (isTooltip) {
    return (
      <Tooltip title={item.apiPath}>
        <i className={styles['menu-left-list-font']}>
          <span ref={menuLeftFontRef}>{item.apiPath}</span>
        </i>
      </Tooltip>
    );
  }
  return (
    <i className={styles['menu-left-list-font']}>
      <span ref={menuLeftFontRef}>{item.apiPath}</span>
    </i>
  );
});
