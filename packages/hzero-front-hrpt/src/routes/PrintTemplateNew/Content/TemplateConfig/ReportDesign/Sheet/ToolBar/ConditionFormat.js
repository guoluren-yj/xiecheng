import React, { useCallback, useMemo } from 'react';
import classnames from 'classnames';
import { Tooltip } from 'choerodon-ui/pro';

import SpecialFormatSvg from '@/assets/sheet/special_format.svg';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-condition-format';

export default function Formula({ cell, item, sheetRef, setRightPaneVisible, setRightPaneKey }) {
  const editabled = useMemo(() => {
    return cell && cell.value && cell.value.extra && cell.value.extra.type === 'FIELD';
  }, [cell]);
  const { title, name } = item;
  const showConditionFormat = useCallback(() => {
    if (!editabled) {
      return;
    }
    setRightPaneVisible(true);
    setRightPaneKey(name);
    if (sheetRef.current && sheetRef.current.resize) {
      setTimeout(() => {
        sheetRef.current.resize();
      }, 0);
    }
  }, [editabled]);

  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles[`${clsPrefix}`], {
          [styles['sheet-toolbar-diabled']]: !editabled,
        })}
        onClick={showConditionFormat}
      >
        <img src={SpecialFormatSvg} />
      </div>
    </Tooltip>
  );
}
