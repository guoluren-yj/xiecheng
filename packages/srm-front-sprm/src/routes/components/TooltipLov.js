import React, { PureComponent } from 'react';

import Lov from 'components/Lov';
import { Tooltip } from 'hzero-ui';

export default class TooltipLov extends PureComponent {
  state = { visible: false };

  render() {
    const { tipValue, ...otherProps } = this.props;
    const { visible } = this.state;
    return (
      <div
        onMouseEnter={() => this.setState({ visible: true })}
        onMouseLeave={() => this.setState({ visible: false })}
      >
        <Lov {...otherProps} />
        <Tooltip title={tipValue} visible={Boolean(tipValue && visible)} />
      </div>
    );
  }
}

// export const PriceModal = ({ item: { lastPurchasePrice, poLineId } = {},
