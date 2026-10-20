import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Styles from './index.less';

const rankIcon1 = require('@/assets/rankIcon1.svg');
const rankIcon2 = require('@/assets/rankIcon2.svg');
const rankIcon3 = require('@/assets/rankIcon3.svg');
const rankIcon = require('@/assets/rankIcon.svg');

@observer
class RankIcon extends Component {
  getIcon = () => {
    const { rank = '', styles = {} } = this.props;
    let icon = rankIcon;

    if (rank === 1) {
      icon = rankIcon1;
    }
    if (rank === 2) {
      icon = rankIcon2;
    }
    if (rank === 3) {
      icon = rankIcon3;
    }
    if (rank > 3) {
      icon = rankIcon;
    }

    return rank < 4 ? (
      <img src={icon} style={{ width: '24px', height: '24px', ...(styles || {}) }} alt="rank" />
    ) : (
      <span className={Styles['bidding-rank-icon-wrap']}>
        <span className={Styles['bidding-rank-icon-rank-value']}>{rank}</span>
      </span>
    );
  };

  render() {
    const { visibleFlag = false } = this.props;

    if (!visibleFlag) {
      return '';
    }

    return this.getIcon();
  }
}

export default RankIcon;
