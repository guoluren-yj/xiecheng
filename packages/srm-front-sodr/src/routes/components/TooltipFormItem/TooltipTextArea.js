import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Tooltip, Input } from 'hzero-ui';

const { TextArea } = Input;

export default class TooltipTextArea extends PureComponent {
  state = { visible: false };

  getChangeTip = (name, changeMap) => {
    if (name in changeMap) {
      const fieldValue = changeMap[name];
      const tipTitle = `${intl
        .get('sodr.common.model.common.beforeUpdate')
        .d('变更前')}: ${fieldValue}`;
      return tipTitle;
    }
    return '';
  };

  render() {
    const { tipValue, style, ...otherProps } = this.props;
    const { visible } = this.state;
    return (
      <div
        onMouseEnter={() => this.setState({ visible: true })}
        onMouseLeave={() => this.setState({ visible: false })}
        style={style}
      >
        <TextArea {...otherProps} style={style} />
        <Tooltip title={tipValue} visible={Boolean(tipValue && visible)} />
      </div>
    );
  }
}
