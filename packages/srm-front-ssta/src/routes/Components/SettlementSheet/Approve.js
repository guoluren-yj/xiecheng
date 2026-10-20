import React, { Component } from 'react';
import SideDrawer from './SideDrawer';

export default class OperationApprove extends Component {

  /**
   * render
   */
  render() {
    const { settleHeaderId } = this.props;
    const approval = {
      headerId: settleHeaderId,
      documentType: 'SSTA.SETTLE_HEADER',
    };
    return (
      <div>
        <SideDrawer {...approval} />
      </div>
    );
  }
}
