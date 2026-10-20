// 侧弹框打开的详情页
import React from 'react';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';

import StoreProvider from './stores';
// import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import Basic from './components/Basic';
import Line from './components/Line';


const StageDetail = () => {

  return (
    <div style={{paddingTop: '16px'}}>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`sbsm.fundPlan.view.title.stageDetailBasic`).d('条款基本信息')}
      >
        <Basic />
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`sbsm.fundPlan.view.title.stageTermDetail`).d('条款阶段信息')}
      >
        <Line />
      </Card>
    </div>
  );
};

const Detail = (props) => <StoreProvider {...props}><StageDetail /></StoreProvider>;

export default Detail;
