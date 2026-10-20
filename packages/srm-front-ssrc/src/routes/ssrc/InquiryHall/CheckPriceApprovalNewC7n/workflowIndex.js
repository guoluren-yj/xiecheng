import React, { Component, Fragment } from 'react';

import Index from './index';
import BidIndex from './indexBid';

export default class workFlowIndex extends Component {
  render() {
    const bidFlag = this.props.match?.params?.secondarySourceCategory === 'NEW_BID';
    return (
      <Fragment>{bidFlag ? <BidIndex {...this.props} /> : <Index {...this.props} />}</Fragment>
    );
  }
}
