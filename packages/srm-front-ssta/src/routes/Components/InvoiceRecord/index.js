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
    const { invoiceHeaderId, operationDs, modal, isFilter } = this.props;
    const operaProps = {
      invoiceHeaderId,
      operationDs,
      modal,
      isFilter,
    };
    // const approval = {
    //   record,
    // };
    return (
      // <Tabs>
      //   <TabPane
      //     tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
      //     key="operator"
      //   >

      //   </TabPane>
      // </Tabs>
      <>
        <Record {...operaProps} />
      </>
    );
  }
}
