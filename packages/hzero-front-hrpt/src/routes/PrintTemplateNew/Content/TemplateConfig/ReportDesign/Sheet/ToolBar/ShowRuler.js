import React, { useState, useCallback } from 'react';
import classnames from 'classnames';
import { Checkbox } from 'choerodon-ui';

import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-showRuler';

export default function ShowRuler({ item, disabled }) {
  const { name, type, title, options } = item;
  const [checked, setChecked] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (true) {
      return;
    }
    setChecked(!checked);
  }, [checked, disabled]);

  return (
    <div
      className={classnames(styles[clsPrefix], {
        [styles['sheet-toolbar-diabled']]:
          // disabled
          true,
      })}
      // disabled={disabled}
      disabled
      onClick={handleClick}
    >
      <Checkbox
        // disabled={disabled}
        disabled
        readOnly={disabled}
        value={checked}
      />
      <span>{title} </span>
    </div>
  );
}
