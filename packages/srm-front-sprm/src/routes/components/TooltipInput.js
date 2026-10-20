import React, { PureComponent } from 'react';

import { Tooltip, Input } from 'hzero-ui';

export default class TooltipInput extends PureComponent {
  state = { visible: false };

  render() {
    const { tipValue, style, ...otherProps } = this.props;
    const { visible } = this.state;
    return (
      <div
        onMouseEnter={() => this.setState({ visible: true })}
        onMouseLeave={() => this.setState({ visible: false })}
        style={{ ...style }}
      >
        <Input {...otherProps} style={style} />
        <Tooltip title={tipValue} visible={Boolean(tipValue && visible)} />
      </div>
    );
  }
}
