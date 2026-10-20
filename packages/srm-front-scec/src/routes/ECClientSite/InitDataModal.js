/**
 * InitDataModal - 电商账号管理 - 数据同步
 * @date: 2019-3-06
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

export default class InitDataModal extends React.Component {
  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { handleInitDataModal } = this.props;
    if (handleInitDataModal) {
      handleInitDataModal(false);
    }
  }

  /**
   * 数据初始化
   */
  @Bind()
  initSyncData() {
    const { onInitSyncData } = this.props;
    if (onInitSyncData) {
      onInitSyncData();
    }
  }

  @Bind()
  singleInitData(step) {
    const { onInitSingleData } = this.props;
    if (onInitSingleData) {
      onInitSingleData(step);
    }
  }

  @Bind()
  renderStatus(status) {
    switch (status) {
      case '1':
        return intl.get('scec.ecClient.model.ecClient.view.ecClient.syncing').d('同步中');
      case '2':
        return intl.get('scec.ecClient.model.ecClient.view.ecClient.syncSuccess').d('同步成功');
      case '-1':
        return intl.get('scec.ecClient.model.ecClient.view.ecClient.syncFail').d('同步失败');
      default:
        return intl.get('scec.ecClient.model.ecClient.view.ecClient.unSync').d('未同步');
    }
  }

  render() {
    const { initDataModalVisible, initStatus = [], loading } = this.props;
    const initTableColumns = [
      {
        title: intl.get('scec.ecClient.model.ecClient.name').d('名称'),
        dataIndex: 'name',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get('scec.common.model.productStatus').d('状态'),
        dataIndex: 'syncStatus',
        width: 80,
        align: 'center',
        render: this.renderStatus,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        width: 80,
        align: 'center',
        render: (_, record) => {
          if (record.syncStatus === '1') {
            return <span style={{ color: '#ddd' }}>{intl.get('scec.ecClient.model.ecClient.view.ecClient.sync').d('同步')}</span>;
          } else {
            return <a onClick={() => this.singleInitData(record.interfaceType)}>{intl.get('scec.ecClient.model.ecClient.view.ecClient.sync').d('同步')}</a>;
          }
        },
      },
    ];
    const productPool = initStatus.find(n => n.interfaceType === 'PRODUCT_POOL') || {interfaceType: 'PRODUCT_POOL', interfaceId: 30002};
    const price = initStatus.find(n => n.interfaceType === 'PRICE') || {interfaceType: 'PRICE', interfaceId: 30001};
    const paymentType = initStatus.find(n => n.interfaceType === 'PAYMENT_MODE') || {interfaceType: 'PAYMENT_MODE', interfaceId: 30003};
    const stepStatus = [
      {
        name: intl.get('scec.ecClient.model.ecClient.view.ecClient.paymentType').d('商品池'),
        interfaceType: productPool.interfaceType,
        interfaceId: productPool.interfaceId,
        syncStatus: productPool.syncStatus,
      },
      {
        name: intl.get('scec.ecClient.model.ecClient.view.ecClient.pruductPrice').d('商品价格'),
        interfaceType: price.interfaceType,
        interfaceId: price.interfaceId,
        syncStatus: price.syncStatus,
      },
      {
        name: intl.get('scec.common.model.paymentMethod').d('支付方式'),
        interfaceType: paymentType.interfaceType,
        interfaceId: paymentType.interfaceId,
        syncStatus: paymentType.syncStatus,
      },
    ];
    return (
      <Modal
        destroyOnClose
        footer={null}
        title={intl.get('scec.common.model.dataSync').d('数据同步')}
        visible={initDataModalVisible}
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <Button onClick={this.initSyncData} type="primary" style={{ float: 'right' }}>
          {intl.get('scec.ecClient.model.ecClient.view.option.oneKeyInit').d('一键初始化')}
        </Button>
        <div style={{ clear: 'both' }} />
        <Table
          rowKey="interfaceId"
          resizable={false}
          loading={loading}
          style={{ marginTop: '20px' }}
          columns={initTableColumns}
          dataSource={stepStatus}
          pagination={false}
        />
      </Modal>
    );
  }
}
