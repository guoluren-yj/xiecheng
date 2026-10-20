/*
 * ValidationResult - 认证结果
 * @Date: 2022-07-09 19:43:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import globalStyles from '@/routes/index.less';
import styles from '../index.less';
import { getImgSrcComponent } from '../utils';

const ValidationResult = ({ result = {} }) => {
  return (
    <Fragment>
      <span className={globalStyles['svg-color']}>{getImgSrcComponent(result.imgSrc)}</span>
      <div className={styles['certification-result-item-title']}>{result.title}</div>
      <div className={styles['certification-result-item-help']}>{result.help}</div>
    </Fragment>
  );
};

export default ValidationResult;
