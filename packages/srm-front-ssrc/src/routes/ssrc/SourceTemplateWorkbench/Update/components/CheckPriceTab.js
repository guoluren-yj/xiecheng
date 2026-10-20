import React from 'react';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import WinBidRule from './WinBidRule';
import BidAnnouncementRule from './BidAnnouncementRule';
import styles from '../../index.less';

const CheckPriceRuleTab = ({ config = {}, scoreFlag = false }) => {
  return (
    <>
      <div style={{ display: 'flex', margin: '20px 0 16px 0' }}>
        <span style={{ fontWeight: '600', fontSize: '14px' }}>
          <span className={styles['card-sub-title-line']} />
          {config.title}
        </span>
      </div>
      <div>{config.component}</div>
      <div style={{ display: 'flex', margin: '32px 0 16px 0' }}>
        <span style={{ fontWeight: '600', fontSize: '14px' }}>
          <span className={styles['card-sub-title-line']} />
          {intl.get('ssrc.sourceTemplate.view.message.winBidRule').d('中标规则')}
        </span>
      </div>
      <div>
        {' '}
        <WinBidRule scoreFlag={scoreFlag} />
      </div>
      <div style={{ display: 'flex', margin: '32px 0 16px 0' }}>
        <span style={{ fontWeight: '600', fontSize: '14px' }}>
          <span className={styles['card-sub-title-line']} />
          {intl.get('ssrc.sourceTemplate.view.message.bidAnnouncementRule').d('唱标规则')}
        </span>
      </div>
      <div>
        {' '}
        <BidAnnouncementRule />
      </div>
    </>
  );
};

export default observer(CheckPriceRuleTab);
