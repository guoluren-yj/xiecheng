import React from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';

import styles from './index.less';
import colors from './colors';

function ColorConfig(props) {
  const {
    mallHomeConfig: { topicColor },
    dispatch,
  } = props;
  const colorList = Object.keys(colors);
  const changeColor = (c) => {
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        topicColor: c,
      },
    });
  };
  return (
    <div className={styles.container}>
      {colorList.map((c) => {
        return (
          <span
            onClick={() => changeColor(c)}
            style={{ background: colors[c]['primary-color'] }}
            className={`item ${topicColor === c ? 'active' : ''}`}
          />
        );
      })}
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(ColorConfig);
