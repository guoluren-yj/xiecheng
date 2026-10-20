// 数据为空草图

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { ReactComponent as NoData } from '@/assets/Illustrate_none_medium.svg';

import intl from 'utils/intl';

import Styles from './index.less';

@observer
class EmptyDataIllustrate extends Component {
  render() {
    return (
      <div className={Styles['bidding-hall-empty-data-wrap']}>
        <NoData />
        <div className={Styles['bidding-hall-empty-data-wrap-no-data']}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.temporarilyNoData`).d('暂无数据')}
        </div>
      </div>
    );
  }
}

export default EmptyDataIllustrate;
