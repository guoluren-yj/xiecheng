/**
 * 商品审批
 * @date: 2020-12-17
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import { tableDs } from './ds';
import ApproveTabs from './ApproveTab';
import styles from './index.less';

let tabKey = 'a';

@formatterCollections({
  code: ['smpc.productApprove', 'smpc.product', 'smpc.workbench', 'sagm.common'],
})
@withProps(
  () => ({
    waittingDs: new DataSet(
      tableDs({
        selection: 'multiple',
        query: { approveStatus: 'WAITING,WORKFLOW_WAITING', approveType: 'UPDATE' },
      })
    ),
    approveDs: new DataSet(
      tableDs({
        selection: false,
        query: { approveStatus: 'REJECT', approveType: 'UPDATE' },
      })
    ),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class ProductApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabKey,
    };
  }

  @Bind()
  handleTabChange(key) {
    this.setState({ tabKey: key });
    tabKey = key;
  }

  render() {
    const { waittingDs, approveDs } = this.props;
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.productApprove.view.title').d('商品审批')} />
        <Content className={styles['sku-approve-container']}>
          <Tabs animated={false} activeKey={this.state.tabKey} onChange={this.handleTabChange}>
            <Tabs.TabPane tab={intl.get('smpc.product.view.unApprove').d('待审批')} key="a">
              <ApproveTabs tableDs={waittingDs} waiting />
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('smpc.product.model.approveReject').d('审批拒绝')} key="b">
              <ApproveTabs tableDs={approveDs} mode="list" />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
