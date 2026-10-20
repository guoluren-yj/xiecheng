/*
 * @Date: 2022-11-08 16:12:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { ReactComponent as VisibleProcess } from '@/assets/lifeConfig/visible-process.svg';
import styles from '@/routes/index.less';

const EmptyPage = ({ height = '', label = '', ImgComp }) => {
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <span className={styles['svg-color']}>{ImgComp ? <ImgComp /> : <VisibleProcess />}</span>
        <div style={{ marginTop: 16, fontSize: 14, color: '#1D2129' }}>{label}</div>
      </div>
    </div>
  );
};

export default EmptyPage;
