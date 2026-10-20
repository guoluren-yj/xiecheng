/**
 * shoppingBasket - 购物篮管理操作记录
 * @date: 2019年11月05日
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
import intl from 'utils/intl';

export default class HistoryModal extends Component {
  render() {
    const { visible, loading, onCancel, pagination, dataSource, onChange } = this.props;

    const columns = [
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.processUser').d('操作人'),
        dataIndex: 'operatedByName',
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.processDate').d('操作日期'),
        dataIndex: 'operatedDate',
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.process').d('操作'),
        dataIndex: 'operationalMotion',
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.explain').d('说明'),
        dataIndex: 'operatedRemark',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get('scec.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        <Table
          bordered
          columns={columns}
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          rowKey="bannerHistoryId"
          onChange={page => onChange(page)}
        />
      </Modal>
    );
  }
}
