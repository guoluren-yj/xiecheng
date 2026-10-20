import React, { useState, useCallback } from 'react';
import { ColorPicker } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import CellBgColorSvg from '@/assets/sheet/cellBgColor.svg';
import { transformRGBColor } from '../../utils/utils';
import styles from '../../index.less';

const clsPrefix = 'format-rule-bg-color';

export default function BgColor({ initialValue, onChange }) {
  const [value, setValue] = useState(initialValue || 'rgba(0,0,0,1)');

  const handleChange = useCallback((color) => {
    const newColor = transformRGBColor(color);
    setValue(newColor);
    onChange('bg', newColor);
  }, []);

  return (
    <ColorPicker
      mode="button"
      className={styles[`${clsPrefix}-wrapper`]}
      onChange={handleChange}
      renderer={() => (
        <span className={styles[`${clsPrefix}`]}>
          <span className={styles[`${clsPrefix}-left`]}>
            <img src={CellBgColorSvg} />
            <span className={styles[`${clsPrefix}-border`]} style={{ backgroundColor: value }} />
          </span>
          <Icon type="arrow_drop_down" className={styles[`${clsPrefix}-icon`]} />
        </span>
      )}
    />
  );
}
