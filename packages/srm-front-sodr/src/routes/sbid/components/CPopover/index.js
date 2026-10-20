import React, { Component } from 'react';
import { Popover } from 'hzero-ui';

export default class CPopover extends Component {
  render() {
    const { content, ...others } = this.props;

    return (
      <React.Fragment>
        {content ? (
          <Popover content={content} {...others}>
            {this.props.children}
          </Popover>
        ) : (
          <React.Fragment>{this.props.children}</React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
