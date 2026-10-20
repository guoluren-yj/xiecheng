import React, { Component } from 'react';
import { Tabs, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { hasApprovalData } from '../OperationApprove/Approval';
import Record from './Record';
import SideDrawer from './SideDrawer';

const { TabPane } = Tabs;

export default class OperationApprove extends Component {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {
      tabKey: 'operator',
      approvalFlag: false,
      loading: true,
      // definitions: [],
    };
  }

  async componentDidMount() {
    const { settleHeaderId } = this.props;
    const flag = await hasApprovalData(settleHeaderId, 'SSTA.SETTLE_HEADER');
    this.setState({
      approvalFlag: flag,
      loading: false,
    });
  }

  goWorkFlow = () => {
    this.setState({
      tabKey: 'approval',
    });
  };

  changeTab = (key) => {
    this.setState({ tabKey: key });
  };

  /**
   * render
   */
  render() {
    const { settleHeaderId, isFilter, modal } = this.props;
    const { approvalFlag, loading, tabKey } = this.state;
    const operaProps = {
      settleHeaderId,
      goWorkFlow: this.goWorkFlow,
      isFilter,
      modal,
      tabKey,
    };
    const approval = {
      headerId: settleHeaderId,
      documentType: 'SSTA.SETTLE_HEADER',
      isFilter,
      modal,
      tabKey,
    };
    return (
      <>
        {!loading ? (
          <div>
            {!approvalFlag ? (
              <Record {...operaProps} />
            ) : (
              <Tabs hideOnlyGroup activeKey={this.state.tabKey} onChange={this.changeTab}>
                <TabPane
                  tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
                  key="operator"
                >
                  <Record {...operaProps} />
                </TabPane>
                <TabPane
                  tab={intl.get('ssta.costSheet.model.costSheet.approvalRecord').d('审批记录')}
                  key="approval"
                >
                  <SideDrawer {...approval} />
                </TabPane>
              </Tabs>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Spin loading={loading} />
          </div>
        )}
      </>
    );
  }
}
