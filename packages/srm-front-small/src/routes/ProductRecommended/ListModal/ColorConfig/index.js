import React from 'react';

import styles from './index.less';
import colors from './colors';

function ColorConfig(props) {
  const { colorCode = 'A', changeColor = (e) => e } = props;
  const colorList = Object.keys(colors);
  return (
    <div className={styles.container}>
      {colorList.map((c) => {
        return (
          <span
            onClick={() => changeColor(c)}
            style={{ background: colors[c]['primary-color'] }}
            className={`item ${colorCode === c ? 'active' : ''}`}
          />
        );
      })}
    </div>
  );
}

export default ColorConfig;
