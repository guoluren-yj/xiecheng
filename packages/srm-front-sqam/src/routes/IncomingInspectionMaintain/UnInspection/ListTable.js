import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateRender } from 'utils/renderer';

import { thousandBitSeparator } from '@/routes/utils.js';

const promptCode = 'sqam.incomingInspectionQuery';
export default class ListTable extends Component {
  render() {
    const {
      dataSource = [],
      pagination = {},
      loading,
      onFetchList,
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 240,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.quantity`).d('接受数量'),
        dataIndex: 'quantity',
        width: 100,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.asnNum`)
          .d('送货单号'),
        dataIndex: 'asnNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.receiveStatus`).d('接收状态'),
        dataIndex: 'receiveStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.displayTrxNum`).d('事务编码'),
        dataIndex: 'displayTrxNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.rcvTrxTypeName`).d('事务类型'),
        dataIndex: 'rcvTrxTypeName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.incomingInspectionQuery.receivedBy`).d('接收人'),
        dataIndex: 'receivedBy',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.poNum`).d('订单编号'),
        dataIndex: 'displayPoNum',
        width: 150,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
    ];
    const tableProps = {
      columns,
      dataSource,
      bordered: true,
      loading,
      scroll: { x: tableScrollWidth(columns) },
      pagination,
      onChange: onFetchList,
      rowSelection,
      rowKey: 'rcvTrxLineId',
    };
    return customizeTable(
      {
        code: 'SQAM.INCOMING_UNINSPECTION.GRID',
      },
      <Table {...tableProps} />
    );
  }
}
