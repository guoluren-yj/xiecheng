/*
 * @Date: 2022-11-08 16:01:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';

import intl from 'utils/intl';

import { ReactComponent as AddStageImg } from '@/assets/lifeConfig/add-stage.svg';
import addEdgeIcon from '@/assets/lifeConfig/add-edge-icon.svg';
import styles from '@/routes/index.less';

const EmptyPage = () => {
  return (
    <div
      style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div>
        <span className={styles['svg-color']}>
          <AddStageImg />
        </span>
        <div style={{ marginTop: 16, color: '#1D2129', textAlign: 'center' }}>
          <div>
            {intl.get('sslm.supplierLifePolicyConfig.view.message.leftSide').d('在左侧区域')}
          </div>
          <div>
            <span>
              {intl
                .get('sslm.supplierLifePolicyConfig.view.message.clickLeftSide')
                .d('可点击阶段进行配置也可点击')}
            </span>
            <img src={addEdgeIcon} alt="" width={30} height={30} />
            <span>
              {intl.get('sslm.supplierLifePolicyConfig.view.message.addStage').d('添加阶段')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyPage;
