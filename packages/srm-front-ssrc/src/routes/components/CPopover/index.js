import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { C7NCPopover } from './C7NPopover';

export default class CPopover extends Component {
  render() {
    const { content, ...others } = this.props;
    const contentEmptyFlag = content === null || content === undefined || content === '';

    return (
      <React.Fragment>
        {!contentEmptyFlag ? (
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

export { C7NCPopover };
