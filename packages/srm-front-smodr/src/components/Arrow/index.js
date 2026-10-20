import React from 'react';
import { Icon } from 'choerodon-ui';
import style from './index.less';

export default function Arrow(props) {
  const { onClick = (e) => e } = props;
  return (
    <div className={style['smodr-anchor']} style={{ bottom: 18 }}>
      <div className="anchor-control" onClick={() => onClick()}>
        <Icon type="baseline-arrow_right" />
      </div>
      {props.children}
    </div>
  );
}
