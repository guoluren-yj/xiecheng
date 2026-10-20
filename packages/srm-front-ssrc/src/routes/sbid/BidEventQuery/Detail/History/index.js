/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Collapse, Icon } from 'hzero-ui';
import intl from 'utils/intl';
import ApproveHistoryRecord from './ApproveHistoryRecord';

const { Panel } = Collapse;
export default class ReleasePrepare extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { ResleaseHistoryCollapseKeys = [], setCollapseByKey, title = '' } = this.props;
    return (
      <Collapse
        onChange={keys => setCollapseByKey('ResleaseHistoryCollapseKeys', keys)}
        className="form-collapse"
        defaultActiveKey={ResleaseHistoryCollapseKeys}
      >
        <Panel
          showArrow={false}
          header={
            <React.Fragment>
              <h3>{title}</h3>
              <a>
                {ResleaseHistoryCollapseKeys.includes('resleaseHistory')
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </a>
              <Icon
                type={ResleaseHistoryCollapseKeys.includes('resleaseHistory') ? 'up' : 'down'}
              />
            </React.Fragment>
          }
          key="resleaseHistory"
        >
          {/* <Tabs defaultActiveKey="historyRecord" animated={false} style={{ marginBottom: '20px' }}>
            {(
              <Tabs.TabPane
                tab={intl.get('hwfp.common.model.approval.history').d('审批历史')}
                key="historyRecord"
              > */}
          <ApproveHistoryRecord {...this.props} />
          {/* </Tabs.TabPane>
            )}
          </Tabs> */}
        </Panel>
      </Collapse>
    );
  }
}
