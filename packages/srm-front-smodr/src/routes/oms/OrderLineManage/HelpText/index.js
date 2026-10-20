import React from 'react';
import styles from './index.less';

// 提示换行
export default function getHelpText(type, res){
  return (
    <div className={styles['help-content']}>
      {res[type].map(item => {
        // 过滤掉没有描述的值集部分
        return item.description?<p>{`${item.meaning}:\u00A0${item.description}`}</p>:null;
      })}
    </div>
  );
}