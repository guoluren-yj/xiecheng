import React, { useMemo, Fragment } from 'react';

import Index from './index';
import BidIndex from './indexBid';

export default function workFlowIndex(props) {
  // 是否是招标
  const bidFlag = useMemo(() => {
    return props.match?.params?.sourceCategory === 'NEW_BID';
  }, [props.match?.params]);

  return <Fragment>{bidFlag ? <BidIndex {...props} /> : <Index {...props} />}</Fragment>;
}
