/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-11-11 16:24:17
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-11 16:27:05
 */
import React from 'react'; // useEffect
import intl from 'utils/intl';
import styles from './index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Index = ({ type, updateType, sourceType }) => {
  return (
    <div className={styles.rightTabs}>
      <div
        className={type === 'whole' ? 'active' : ''}
        onClick={() => updateType('whole', sourceType)}
      >
        <span>{intl.get(`${commonPrompt}.byWholeDoc`).d('按单')}</span>
      </div>
      <div
        className={type !== 'whole' ? 'active' : ''}
        onClick={() => updateType('line', sourceType)}
      >
        <span>{intl.get(`${commonPrompt}.byLine`).d('按行')}</span>
      </div>
    </div>
  );
};

export default Index;
