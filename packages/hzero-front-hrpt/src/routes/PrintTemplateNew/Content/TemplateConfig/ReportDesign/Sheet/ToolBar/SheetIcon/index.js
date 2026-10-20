import React, { useCallback, useEffect, useState, useContext } from 'react';
import classnames from 'classnames';
import { Tooltip, Icon } from 'choerodon-ui/pro';

import Store from '../../../store';
import styles from './index.less';
import revoke from "../../../../../../../../assets/sheet/revoke.svg";
import recovery from "../../../../../../../../assets/sheet/recovery.svg";
import formatBrush from "../../../../../../../../assets/sheet/formatBrush.svg";
import clearFormat from "../../../../../../../../assets/sheet/clearFormat.svg";
import fontBold from "../../../../../../../../assets/sheet/fontBold.svg";
import italic from "../../../../../../../../assets/sheet/italic.svg";
import underLine from "../../../../../../../../assets/sheet/underLine.svg";
import deleteLine from "../../../../../../../../assets/sheet/deleteLine.svg";
import wordWrap from "../../../../../../../../assets/sheet/wordWrap.svg";
import cellMerge from "../../../../../../../../assets/sheet/cellMerge.svg";

const imgs = {
  revoke: <img src={revoke} alt="" />,
  recovery: <img src={recovery} alt="" />,
  formatBrush: <img src={formatBrush} alt="" />,
  clearFormat: <img src={clearFormat} alt="" />,
  fontBold: <img src={fontBold} alt="" />,
  italic: <img src={italic} alt="" />,
  underLine: <img src={underLine} alt="" />,
  deleteLine: <img src={deleteLine} alt="" />,
  wordWrap: <img src={wordWrap} alt="" />,
  cellMerge: <img src={cellMerge} alt="" />,
};
export default function SheetIcon({ cell, type, title, onClick, initialStatus, disabled, checkStyle }) {
  const { selectRange } = useContext(Store).store;
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [cell, initialStatus, selectRange]);

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (onClick({ oldValue: status }) !== 'failed') setStatus(!status);
  }, [disabled, onClick, setStatus, status]);
  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles['sheet-icon'], {
          [styles[`sheet-icon-focus`]]: status,
          [styles[`sheet-icon-disabled`]]: disabled,
        })}
        onClick={handleClick}
      >
        {checkStyle === "icon" && status && <Icon type="check" />}
        {imgs[type]}
      </div>
    </Tooltip>
  );
}
