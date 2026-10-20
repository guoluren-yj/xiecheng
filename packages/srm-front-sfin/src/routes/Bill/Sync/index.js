/**
 * PurchaseBill - 我的采购账单
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import NoConsignment from './NoConsignment';

/**
 * tab标签页
 */

/**
 * 开票申请单审核
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@formatterCollections({ code: ['sfin.invoiceBill', 'entity.company', 'hzero.common'] })
@withRouter
@connect(({ loading }) => ({
  syncBillLoading:
    loading.effects['bill/syncBill'] || loading.effects['bill/fetchSycnPurchaseNoConsignment'],
}))
export default class Audit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // organizationId: getCurrentOrganizationId(),
      selectedRowKeys: [], // 已选择采购账单key
    };
  }

  /**
   * 选中采购账单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedRowKeys: newSelectedRowKeys });
  }

  // @Bind()
  // onSetQueryValue(values = {}) {
  //   this.setState({
  //     queryValue: values,
  //   });
  // }

  // @Bind()
  // onClearQueryValue() {
  //   this.setState({
  //     queryValue: {},
  //   });
  // }

  @Bind()
  @Throttle(1000)
  handClickSycn() {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: 'bill/syncBill',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        this.NoConsignment.fetchNoConsignment();
        notification.success();
        this.setState({ selectedRowKeys: [] });
      }
    });
  }

  render() {
    const { selectedRowKeys } = this.state;
    const { syncBillLoading } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sfin.invoiceBill.model.invoiceBill.sync').d('同步采购账单')}>
          <Button loading={syncBillLoading} onClick={this.handClickSycn}>
            {intl.get('sfin.invoiceBill.model.invoiceBill.sync.sync').d('同步')}
          </Button>
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <NoConsignment
            rowSelection={rowSelection}
            onRef={(node) => {
              this.NoConsignment = node;
            }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
