/**
 * 商品审批
 * @date: 2020-12-17
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import qs from 'qs';
import { Bind } from 'lodash-decorators';
import { DataSet, Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import { tableDs } from './lineDs';
import ApproveTabs from './ApproveTab';

@formatterCollections({
  code: ['smpc.productApprove', 'smpc.product'],
})
export default class ProductApprove extends Component {
  constructor(props) {
    super(props);
    const { key } = qs.parse(props.location.search.substr(1));
    this.state = {
      key: ['a', 'b'].includes(key) ? key : 'a',
    };
  }

  tableADs = new DataSet(
    tableDs({
      selection: 'multiple',
      query: { approveStatus: 'WAITING' },
    })
  );

  tableBDs = new DataSet(
    tableDs({
      selection: false,
      query: { approveStatus: 'APPROVE' },
    })
  );

  @Bind()
  handleTabChange(key) {
    this.props.history.push(`/s2-mall/product/product-approve/list?key=${key}`);
  }

  render() {
    const { key } = this.state;
    const tabAProps = {
      waiting: true,
      tableDs: this.tableADs,
    };
    const tabBProps = {
      tableDs: this.tableBDs,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.productApprove.view.title').d('商品审批')} />
        <Content>
          <Tabs animated={false} defaultActiveKey={key} onChange={this.handleTabChange}>
            <Tabs.TabPane tab={intl.get('smpc.product.view.unApprove').d('待审批')} key="a">
              <ApproveTabs {...tabAProps} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('smpc.product.view.approved').d('已审批')} key="b">
              <ApproveTabs {...tabBProps} isApprove />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
