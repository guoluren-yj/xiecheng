import React, { Component } from 'react';
import { Popover } from 'hzero-ui';

export default class HPopover extends Component {
  render() {
    const { content = '', ...others } = this.props;

    return (
      <React.Fragment>
        <Popover content={content} {...others}>
          {this.props.children}
        </Popover>
      </React.Fragment>
    );
  }
}
