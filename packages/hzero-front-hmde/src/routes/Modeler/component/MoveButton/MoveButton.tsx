import React from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from 'choerodon-ui/pro';

import styles from './index.less';

interface IIndex {
  selectedLength: number;
  direction: string;
}

export default observer(({ selectedLength = 0, direction }: IIndex) => {
  if (direction === 'left') {
    return (
      <span
        className={styles['navigate-next']}
        style={{
          backgroundColor: selectedLength !== 0 ? '#29bece' : '#f5f5f5',
          border: selectedLength !== 0 ? 'none' : '1px solid #ABAFB8',
          color: selectedLength !== 0 ? '#fff' : '#ABAFB8',
          transition: 'all 300ms',
          // transform: selectedLength !== 0 ? 'scale(1.2)' : 'scale(1)',
          // boxShadow: selectedLength !== 0 ? '0px 0px 10px #29bece' : 'none',
        }}
      >
        <Icon type="navigate_next" />
      </span>
    );
  } else {
    return (
      <span
        className={styles['navigate-before']}
        style={{
          backgroundColor: selectedLength !== 0 ? '#29bece' : '#f5f5f5',
          // backgroundColor: selectedLength !== 0 ? '#fff' : '#f5f5f5',
          border: selectedLength !== 0 ? 'none' : '1px solid #ABAFB8',
          // border:
          //   selectedLength !== 0
          //     ? /* '1px solid #5a6677' */ '1px solid #29bece'
          //     : '1px solid #ABAFB8',
          // color: selectedLength !== 0 ? '#5a6677' : '#ABAFB8',
          color: selectedLength !== 0 ? '#fff' : '#ABAFB8',
          transition: 'all .3s',
          // transform: selectedLength !== 0 ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        <Icon type="navigate_before" />
      </span>
    );
  }
});
