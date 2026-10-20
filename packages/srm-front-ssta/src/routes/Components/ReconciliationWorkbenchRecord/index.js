import React, { Component } from 'react';
import { Tabs, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { hasApprovalData } from '../OperationApprove/Approval';
import Record from './Record';
import SideDrawer from '../SettlementSheet/SideDrawer';

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
    // hideApproveFlag 值为true时 隐藏审批按钮
    const { record, hideApproveFlag } = this.props;
    if (hideApproveFlag) {
      this.setState({ loading: false });
    } else {
      const flag = await hasApprovalData(record.data.billHeaderId, 'BILL');
      this.setState({
        approvalFlag: flag,
        loading: false,
      });
    }
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
    const { billHeaderId, record, accountStatementFlag, modal, isFilter } = this.props;
    const { approvalFlag, loading, tabKey } = this.state;
    const operaProps = {
      accountStatementFlag,
      billHeaderId,
      goWorkFlow: this.goWorkFlow,
      modal,
      isFilter,
      tabKey,
    };
    const approval = {
      headerId: record.data.billHeaderId,
      documentType: 'BILL',
      modal,
      isFilter,
      tabKey,
    };
    return (
      <>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <Spin loading={loading} />
          </div>
        ) : (
          <div>
            {approvalFlag ? (
              <Tabs activeKey={this.state.tabKey} onChange={this.changeTab}>
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
            ) : (
              <Record {...operaProps} />
            )}
          </div>
        )}
      </>
    );
  }
}
