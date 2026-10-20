import React, { Component } from 'react';
// import { Tabs } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
import Record from './Record';

// const { TabPane } = Tabs;

export default class OperationApprove extends Component {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * render
   */
  render() {
    const { operationDs } = this.props;
    const operaProps = {
      operationDs,
    };
    return <Record {...operaProps} />;
  }
}
