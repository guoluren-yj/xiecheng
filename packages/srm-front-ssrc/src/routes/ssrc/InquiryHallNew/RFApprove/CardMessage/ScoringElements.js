/*
 * @Descripttion: 寻源过程控制--评分要素
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 20:24:20
 * @LastEditors: yiping.liu
 */
import React from 'react';
import intl from 'utils/intl';

import styles from '../../rfComponents/common.less';
import ScoreTable from './ScoreTable';

const ScoringElements = () => {
  return (
    <React.Fragment>
      <h3 className={styles['card-sub-title']}>
        <div className={styles['card-sub-title-line']} />
        <span>{intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}</span>
      </h3>
      <div className={styles['score-element-header']}>
        <h4>{intl.get('ssrc.rfController.model.technology.group').d('技术组')}</h4>
      </div>
      <ScoreTable />
      <div className={styles['score-element-header']}>
        <h4>{intl.get('ssrc.rfController.model.business.group').d('商务组')}</h4>
      </div>
      <ScoreTable />
    </React.Fragment>
  );
};

export default ScoringElements;
