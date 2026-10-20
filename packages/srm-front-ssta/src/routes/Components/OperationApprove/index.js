import React, { Component } from 'react';
import { Tabs, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import Record from './Record';
import { hasApprovalData } from './Approval';
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
    const { record } = this.props;
    const flag = await hasApprovalData(record.data.chargeHeaderId, 'SSTA.CHARGE_HEADER');
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
    const { chargeHeaderId, record, roleSource, history, modal, isFilter } = this.props;
    const { loading, approvalFlag, tabKey } = this.state;
    const operaProps = {
      chargeHeaderId,
      goWorkFlow: this.goWorkFlow,
      roleSource,
      history,
      record,
      modal,
      isFilter,
      tabKey,
    };
    const approval = {
      headerId: record.data.chargeHeaderId,
      documentType: 'SSTA.CHARGE_HEADER',
      modal,
      isFilter,
      tabKey,
    };
    // 增加个loading，避免审批接口返回慢，tab突然出现的情况
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
