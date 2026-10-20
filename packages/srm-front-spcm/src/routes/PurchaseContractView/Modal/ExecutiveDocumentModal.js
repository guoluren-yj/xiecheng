import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';

import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { renderThousandthNum } from '@/utils/util';

export default class ExecutiveDocumentModal extends Component {
  render() {
    const { title, width = 800, visible, footer = null, onCancel, tableProps } = this.props;
    const modalProps = {
      title,
      width,
      visible,
      footer,
      onCancel,
    };
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'seqNum',
        width: 80,
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'orderStatusMeaning',
        width: 85,
      },
      {
        title: intl.get(`sodr.common.model.common.poNum`).d('执行单据编号'),
        dataIndex: 'poNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.poTypeDesc`).d('执行单据类型'),
        dataIndex: 'poTypeDesc',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.executeQuantity`).d('执行数量'),
        dataIndex: 'executeQuantity',
        width: 150,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`sodr.common.model.common.executedAmount`).d('执行金额'),
        dataIndex: 'executedAmount',
        width: 150,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'executeBy',
        width: 140,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'executeDate',
        width: 100,
        render: dateRender,
      },
    ];
    const scrollX = tableScrollWidth(columns);
    return (
      <Modal {...modalProps}>
        <Table bordered columns={columns} scroll={{ x: scrollX }} {...tableProps} />
      </Modal>
    );
  }
}
