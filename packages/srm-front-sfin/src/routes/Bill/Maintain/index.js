/**
 * MaintainIndex -开票申请维护查询界面 -table 表格
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';
import notification from 'utils/notification';

import NonPerformance from '../Maintain/NoConsignment';

@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@connect(({ bill, loading }) => ({
  noConsignMent: {
    bill,
    loading:
      loading.effects['bill/fetchMaintainConsigBill'] ||
      loading.effects['bill/invoiceMaintainBatchSubmit'],
  },
}))
export default class Maintain extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  @Bind()
  handleNonRef(ref = {}) {
    this.nonRef = ref;
  }

  @Bind()
  handleGetSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  @Bind()
  handleSubmit() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'bill/invoiceMaintainBatchSubmit',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        notification.success();
        if (this.nonRef) {
          this.nonRef.fetchMaintainConsigBill();
          this.nonRef.onSelectChange([], []);
        }
      }
    });
  }

  render() {
    const { noConsignMent, ...otherProps } = this.props;
    const { selectedRowKeys } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get('sfin.invoiceBill.view.message.title.bill.maintain').d('维护开票申请单')}
        >
          <PermissionButton
            icon="check"
            name="submit"
            type="primary"
            disabled={isEmpty(selectedRowKeys)}
            onClick={() => this.handleSubmit()}
            permissionList={[
              {
                code: `srm.finance.sales-bill.modify.button.batchSubmit`,
                type: 'button',
              },
            ]}
            loading={this.props.loading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </PermissionButton>
        </Header>
        <Content>
          <NonPerformance
            {...noConsignMent}
            {...otherProps}
            handleGetSelect={this.handleGetSelect}
            nonRef={this.handleNonRef}
          />
        </Content>
      </React.Fragment>
    );
  }
}
