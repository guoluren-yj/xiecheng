/*
 * @Date: 2025-05-19 10:39:21
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { ReactComponent as NoDataSvg } from '@/assets/operate-no-data.svg';
import styles from './index.less';

const NoData = () => {
  return (
    <div className={styles['no-data']}>
      <NoDataSvg />
      <span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>
    </div>
  );
};

export default NoData;
