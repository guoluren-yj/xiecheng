import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';
import { Popover } from 'choerodon-ui';

/**
 * 展示币种+金额
*/
@observer
class CurrencyPrice extends Component {
  render() {
    const { currencySymbol, price, popProps = null } = this.props;

    if (isNil(price)) {
      return '';
    }

    const newProps = popProps || {};

    return (
      <span>
        <span dir="ltr" style={{ marginRight: '4px' }}>
          {currencySymbol}
        </span>
        <span style={{ paddingLeft: '4px' }}>
          <Popover content={price} {...newProps}>
            {price}
          </Popover>
        </span>
      </span>
    );
  }
}

export default CurrencyPrice;
