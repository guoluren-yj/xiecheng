/**
 * PaymentTypeModal - 平台电商账号管理 - 支付方式
 * @date: 2019-3-06
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
/**
 *  import intl from 'utils/intl';
 */

/**
 * 支付方式
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element
 */
export default class PaymentTypeModal extends React.Component {
  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { onHandlePaymentVisible } = this.props;
    if (onHandlePaymentVisible) {
      onHandlePaymentVisible(false);
    }
  }

  render() {
    const { paymentTypeVisible, paymentType = [], loading } = this.props;
    const paymentTypeColumns = [
      {
        title: intl.get('scec.ecClientSite.model.ecClientSite.paymentMethod').d('支付方式'),
        dataIndex: 'paymentName',
        width: 60,
        align: 'center',
      },
    ];
    return (
      <Modal
        destroyOnClose
        footer={null}
        width={520}
        title={intl.get('scec.ecClientSite.model.ecClientSite.paymentMethod').d('支付方式')}
        visible={paymentTypeVisible}
        onCancel={this.cancelHandle}
      >
        <Table
          rowKey="paymentCode"
          loading={loading}
          columns={paymentTypeColumns}
          dataSource={paymentType}
          pagination={false}
        />
      </Modal>
    );
  }
}
