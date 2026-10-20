/**
 * DetailHeader - 功能详情头包裹层
 * @date: 2023-11-16
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';

import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import DetailHeader from './DetailHeader';

@WithCustomize({
  unitCode: ['SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER'],
})
export default class DetailHeaderWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const childrenProps = {
      ...this.props,
      code: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER',
    };
    return <DetailHeader {...childrenProps} />;
  }
}
