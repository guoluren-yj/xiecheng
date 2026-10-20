import React from 'react';
import { observer } from 'mobx-react';

import style from './index.less';

const EmotionFill = ({ children, showEmotion = false, ds, svgConfig = {} }) => {
  const { Com, emptyInfo} = svgConfig;
  // 解决svg 闪现
  return showEmotion || (ds && ds.status !== 'loading' && ds.length === 0) ? (
    <div className={style['empty-warper']}>
      <p className={style['primary-color']}>{Com && <Com />}</p>
      <div className={style['empty-info']}>{emptyInfo}</div>
    </div>
  ) : (
    children
  );
};

export default observer(EmotionFill);
