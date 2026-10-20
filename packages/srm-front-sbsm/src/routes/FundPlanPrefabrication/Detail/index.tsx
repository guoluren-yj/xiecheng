// 侧弹框打开的详情页
import React, { useContext, useMemo } from 'react';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';

import StoreProvider, { Store } from './stores';
// import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import Basic from './components/Basic';
import Line from './components/Line';
import PrefabInfo from './components/PrefabInfo';
import PrepInfo from './components/PrepInfo';
import PrepRule from './components/PrepRule';
import SummaryInfo from './components/SummaryInfo';
import SettleInfo from './components/SettleInfo';
import SoureInfo from './components/SoureInfo';
import type { StoreValueType } from './stores';


const StageDetail = () => {
  const { viewType, stageType } = useContext<StoreValueType>(Store);

  const cardList = useMemo(() => {
    return [{
      title: intl.get(`sbsm.fundPlan.view.title.prepSourceDocInfo`).d('编制来源单据信息'),
      content: <SoureInfo />,
      show: ['SOURCE_DOCUMENT'].includes(viewType),
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.stageDetailBasic`).d('条款基本信息'),
      content: <Basic />,
      show: ['STAGE'].includes(viewType),
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.stageTermDetail`).d('条款阶段信息'),
      content: <Line />,
      show: ['STAGE'].includes(viewType),
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.prepRule`).d('编制规则'),
      content: <PrepRule />,
      show: ['STAGE'].includes(viewType),
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.prefabInfo`).d('预制信息'),
      content: <PrefabInfo />,
      show: true,
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.prepInfo`).d('编制信息'),
      content: <PrepInfo />,
      show: true,
    },
    {
      title: intl.get(`sbsm.fundPlan.view.title.summaryInfo`).d('汇总信息'),
      content: <SummaryInfo />,
      show: true,
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.prepaymentSettleInfo`).d('预付款申请结算单信息'),
      content: <SettleInfo documentType='PREPAYMENT' />,
      show: ['STAGE'].includes(viewType) && stageType === 'PREPAYMENT' || ['SOURCE_DOCUMENT'].includes(viewType),
    }, {
      title: intl.get(`sbsm.fundPlan.view.title.paymentSettleInfo`).d('付款申请信息'),
      content: <SettleInfo documentType='PAYMENT' />,
      show: true,
    },
    ];
  }, [viewType, stageType]);

  return (
    <div style={{paddingTop: '16px'}}>
      {
        cardList.map((item) => {
          const { title, content, show } = item;
          if (!show) return null;
          return (
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={title}
            >
              {content}
            </Card>
          );
        })
      }
    </div>
  );
};

const Detail = (props) => <StoreProvider {...props}><StageDetail /></StoreProvider>;

export default Detail;
