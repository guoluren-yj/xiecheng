/*
 * @Author: your name
 * @Date: 2020-04-20 11:13:19
 * @LastEditTime: 2020-06-10 15:01:07
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-sfin\src\routes\Bill\Cancel\index.js
 */
/**
 * CancelBill - 取消开票申请明细
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import NoConsignment from './NoConsignment';

/**
 * 取消开票申请明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @return React.element
 */
@connect(({ loading }) => ({
  loading: loading.effects['bill/fetchNCCancelBill'] || loading.effects['bill/cancelBill'],
}))
@formatterCollections({ code: ['sfin.invoiceBill', 'entity.company', 'sodr.common'] })
@withRouter
export default class CancelBill extends PureComponent {
  noConsignmentRef;

  state = {
    changeButton: true,
  };

  @Bind()
  onCancelBill() {
    this.noConsignmentRef.onCancelBill();
  }

  /**
   * 获取非寄销ref
   * @param {object} ref - 组件ref
   */
  @Bind()
  getNCRef(ref = {}) {
    this.noConsignmentRef = ref;
  }

  render() {
    const { changeButton } = this.state;
    const { loading } = this.props;
    const noConsignmentProps = {
      onRef: this.getNCRef,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sfin.invoiceBill.view.title.cancelBill').d('退回开票申请单')}>
          {changeButton ? (
            <React.Fragment>
              <Button
                icon="rollback"
                type="primary"
                onClick={() => this.onCancelBill(true)}
                loading={loading}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </React.Fragment>
          ) : (
            <div />
          )}
        </Header>
        <Content>
          <NoConsignment {...noConsignmentProps} />
        </Content>
      </React.Fragment>
    );
  }
}
