import React, { useEffect, useMemo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Dropdown, Button, Menu, ColorPicker } from 'choerodon-ui/pro';
import { Popover, Icon, Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';

import CellBgColorSvg from '@/assets/sheet/cellBgColor.svg';
import {
  ToolBarType,
  FirstFontColor,
  SecondFontColor,
  getRecentlyFontColor,
  setRecentlyFontColor,
} from '../../utils/constant';
import { transformRGBColor } from '../../utils/utils';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-font-color';
const cacheKey = 'bg-color';

export default function BgColor({ cell, item, sheetRef, disabled }) {
  const { name, type, title } = item;
  const [value, setValue] = useState('rgba(0,0,0,1)');
  const [usedFontColorArr, setUsedFontColorArr] = useState(getRecentlyFontColor(cacheKey));

  const changeItem = useCallback(
    (colorItem) => {
      setValue(colorItem);
      const newUsedFontColorArr = [colorItem]
        .concat(usedFontColorArr.filter((item) => item !== colorItem))
        .slice(0, 9);
      setRecentlyFontColor(cacheKey, newUsedFontColorArr.slice(0, 9).join('|'));
      setUsedFontColorArr(newUsedFontColorArr);
      setCellStyle(colorItem);
    },
    [usedFontColorArr, setCellStyle]
  );

  const setCellStyle = useCallback(
    (newValue) => {
      sheetRef.current.updateFormat('bg', transformRGBColor(newValue || value));
    },
    [value]
  );

  const handleChange = useCallback(
    (color) => {
      changeItem(color);
    },
    [changeItem]
  );

  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles[`${clsPrefix}`], {
          [styles['sheet-toolbar-diabled']]: disabled,
        })}
      >
        <div onClick={() => setCellStyle()}>
          <img src={CellBgColorSvg} />
          <div className={styles[`${clsPrefix}-border`]} style={{ backgroundColor: value }} />
        </div>
        <ColorPicker
          mode="button"
          onChange={handleChange}
          renderer={() => <Icon type="arrow_drop_down" />}
        />
      </div>
    </Tooltip>
  );
}
