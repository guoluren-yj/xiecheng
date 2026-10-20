import React from 'react';
import { Tooltip } from 'choerodon-ui';

import styles from './index.less';

interface ILabel {
  labelName: string;
  color: string;
}

export default ({ labelAssignList }: { labelAssignList: ILabel[] }) => {
  return (
    <Tooltip
      placement="right"
      mouseLeaveDelay={0}
      overlayClassName={styles['menu-left-list-labels-item-tooltip']}
      title={labelAssignList?.map(({ color, labelName }) => (
        <div className={styles['menu-left-list-labels-item']}>
          <i style={{ background: color }} />
          <span>{labelName}</span>
        </div>
      ))}
    >
      <span className={styles['menu-left-list-labels']}>
        {labelAssignList?.map(({ color }, index, arr) => {
          if (arr.length > 3) {
            if (index === 2) {
              return (
                <i style={{ background: '#5a6677' }}>
                  <span>···</span>
                </i>
              );
            } else if (index > 2) {
              return;
            }
          }
          return <i style={{ background: color }} />;
        })}
      </span>
    </Tooltip>
  );
};
