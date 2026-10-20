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
const commonPrompt = 'sprm.common.model.common';

const Index = ({ updateType, sourceType }) => {
  return (
    <div className={styles.rightTabs}>
      <div
        className={sourceType === 'all' ? 'active' : ''}
        onClick={() => updateType({ value: 'all' })}
      >
        <span>{intl.get(`${commonPrompt}.byStandard`).d('标准视图')}</span>
      </div>
      <div
        className={sourceType === 'version' ? 'active' : ''}
        onClick={() => updateType({ value: 'version' })}
      >
        <span>{intl.get(`${commonPrompt}.byVersion`).d('版本视图')}</span>
      </div>
    </div>
  );
};

export default Index;
