import React, { useCallback } from 'react';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import { ReactComponent as Release } from '@/assets/source-open-release.svg';
import { ReactComponent as Prequalification } from '@/assets/open-prequalification.svg';
import { ReactComponent as Sign } from '@/assets/source-open-sign.svg';
import { ReactComponent as TrailBid } from '@/assets/source-open-trail-bidding.svg';
import { ReactComponent as Bidding } from '@/assets/source-open-bidding.svg';
import { ReactComponent as OpenBid } from '@/assets/source-open-open.svg';
import { ReactComponent as Scoring } from '@/assets/source-open-scoring.svg';
import { ReactComponent as PreTrail } from '@/assets/source-open-pre.svg';
import { ReactComponent as RoundQuo } from '@/assets/source-open-round.svg';
import { ReactComponent as Bargain } from '@/assets/source-open-bargain.svg';
import { ReactComponent as CheckPrice } from '@/assets/source-open-check.svg';

import styles from '../../index.less';

const { Step } = Steps;

const stepTextStyle = {
  fontSize: '12px',
  color: '#4E5769',
  fontWeight: '400',
};

const ShowSourceNode = ({ nodes = [] }) => {
  // 获取图标主题色组件
  const getIconComponent = useCallback((value) => {
    const map = {
      RELEASE: <Release />,
      PREQUALIFICATION: <Prequalification />,
      SIGN_IN: <Sign />,
      TRIAL_BIDDING: <TrailBid />,
      BIDDING: <Bidding />,
      QUOTATION: <Bidding />,
      OPEN_BID: <OpenBid />,
      EXPERT_SCORE: <Scoring />,
      PRE_TRIAL: <PreTrail />,
      ROUND_QUOTATION: <RoundQuo />,
      BARGAIN: <Bargain />,
      CHECK_PRICE: <CheckPrice />,
    };
    return map[value];
  }, []);

  return (
    <Steps direction="vertical" current={-1}>
      {!isEmpty(nodes)
        ? nodes.map((item) => {
            return (
              <Step
                title={<div style={stepTextStyle}>{item.meaning}</div>}
                icon={<div className={styles['source-icon']}>{getIconComponent(item.value)}</div>}
              />
            );
          })
        : null}
    </Steps>
  );
};

export default observer(ShowSourceNode);
