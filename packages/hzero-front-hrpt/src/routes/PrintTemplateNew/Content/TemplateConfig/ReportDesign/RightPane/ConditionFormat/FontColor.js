import React, { useState, useCallback } from 'react';
import { ColorPicker } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import styles from '../../index.less';
import { transformRGBColor } from '../../utils/utils';
import FontColorSvg from '@/assets/sheet/fontColor.svg';

const clsPrefix = 'format-rule-font-color';

export default function FontColor({ initialValue, onChange }) {
  const [value, setValue] = useState(initialValue || 'rgba(0,0,0,1)');

  const handleChange = useCallback((color) => {
    const newColor = transformRGBColor(color);
    setValue(newColor);
    onChange('fc', newColor);
  }, []);

  return (
    <ColorPicker
      mode="button"
      className={styles[`${clsPrefix}-wrapper`]}
      onChange={handleChange}
      renderer={() => (
        <span className={styles[`${clsPrefix}`]}>
          <span className={styles[`${clsPrefix}-left`]}>
            <img src={FontColorSvg} />
            <span className={styles[`${clsPrefix}-border`]} style={{ backgroundColor: value }} />
          </span>
          <Icon type="arrow_drop_down" className={styles[`${clsPrefix}-icon`]} />
        </span>
      )}
    />
  );
}
