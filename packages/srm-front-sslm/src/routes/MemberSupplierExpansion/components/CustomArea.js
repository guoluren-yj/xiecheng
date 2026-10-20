/*
 * @Date: 2024-08-02 09:07:36
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext } from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { ReactComponent as CustomCard } from '@/assets/memberExpansion/custom-card.svg';
import { Store } from '../stores';

const CustomArea = () => {
  const { addOrEditCardName } = useContext(Store);

  return (
    <div className="custom-area-content">
      <div className="custom-area-picture">
        <CustomCard />
      </div>
      <div className="custom-area-operate">
        <div className="custom-card-title">
          {intl.get('sslm.memberExpansion.view.customArea.customCard').d('自定义卡片')}
        </div>
        <div className="custom-card-help">
          {intl
            .get('sslm.memberExpansion.view.customArea.customCardMsg')
            .d('添加自定义卡片，展示更多个性化内容')}
        </div>
        <div className="custom-card-btn">
          <Button icon="add" color="primary" onClick={() => addOrEditCardName('add')}>
            {intl.get('sslm.memberExpansion.bun.addCustomCard').d('添加自定义卡片')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomArea;
