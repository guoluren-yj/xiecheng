import React, { PureComponent } from 'react';
import { Table, Modal } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { showBigNumber } from '../components/utils';

export default class OccupancyModal extends PureComponent {
  render() {
    const { loading, dataSource, pagination, visible, onCancel, onFetchOccupancyList } = this.props;
    const prefix = 'sinv.common.model.common';
    const columns = [
      {
        title: intl.get(`${prefix}.displayAsnNum`).d('送货单编号'),
        dataIndex: 'asnNum',
        width: 150,
      },
      {
        title: intl.get(`${prefix}.onWayQuantity`).d('在途数量'),
        dataIndex: 'occupiedQuantity',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${prefix}.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.expectedArriveDate`).d('预计到货日期'),
        dataIndex: 'expectedArriveDate',
        width: 150,
        render: dateRender,
      },
    ];
    return (
      <Modal
        width={600}
        visible={visible}
        footer={null}
        onCancel={() => onCancel(false)}
        title={intl.get(`${prefix}.onWayQuantity`).d('在途数量')}
      >
        <Table
          bordered
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          columns={columns}
          onChange={onFetchOccupancyList}
        />
      </Modal>
    );
  }
}
