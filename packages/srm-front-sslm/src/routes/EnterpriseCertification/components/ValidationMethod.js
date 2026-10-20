/*
 * ValidationMethod - 认证方式
 * @Date: 2022-07-09 19:20:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Card } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import globalStyles from '@/routes/index.less';
import classnames from 'classnames';
import { getImgSrcComponent } from '../utils';

import styles from '../index.less';

const ValidationMethod = ({ method = {}, onHandleClick }) => {
  return (
    <Card className={styles['certification-card']} bordered={false} key={method.key}>
      <div className={styles['certification-card-img']}>
        {/* <span>
          <img src={method.imgSrc} alt={method.title} />
        </span> */}
        <span className={classnames(globalStyles['svg-color'], styles['certification-card-svg'])}>
          {getImgSrcComponent(method.imgSrc)}
        </span>
      </div>
      <div className={styles['certification-card-title']}>
        {method.title}
        {method.tips && <span className={styles['certification-card-tips']}>{method.tips}</span>}
      </div>
      <div className={styles['certification-card-help']}>{method.help}</div>
      <div className={styles['certification-card-btn']}>
        <Button color="primary" onClick={() => onHandleClick(method.key)}>
          {intl.get('spfm.enterprise.view.button.startCertification').d('开始认证')}
        </Button>
      </div>
    </Card>
  );
};

export default ValidationMethod;
