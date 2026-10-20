import React from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

export default class ExtensionHeaderTable extends React.Component {
  render() {
    const { extensionHeaderData = {}, loading, handleToDetail } = this.props;
    const { receiverAddress = {} } = extensionHeaderData;
    const headerColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.orderTypeMeaning').d('订单类型'),
        width: 100,
        dataIndex: 'orderTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.purchaseCompanyName').d('采购方'),
        width: 200,
        dataIndex: 'purchaseCompanyName',
      },
      {
        title: intl.get('smodr.frightLine.model.purchaseCompanyNum').d('采购方公司编码'),
        width: 150,
        dataIndex: 'purchaseCompanyNum',
      },
      {
        title: intl.get('smodr.frightLine.model.supplierCompanyName').d('供应商'),
        width: 150,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('smodr.frightLine.model.supplierCompanyNum').d('供应商公司编码'),
        width: 150,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get('smodr.frightLine.model.terminalTypeMeaning').d('设备类型'),
        width: 120,
        dataIndex: 'terminalTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.paymentMethods').d('支付方式'),
        width: 100,
        dataIndex: 'paymentTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      // {
      //   title: intl.get('smodr.frightLine.model.marketPrice').d('市场价'),
      //   width: 100,
      //   dataIndex: 'marketPrice',
      // },
      // {
      //   title: intl.get('smodr.frightLine.model.contractPrice').d('协议价'),
      //   width: 100,
      //   dataIndex: 'contractPrice',
      // },
      {
        title: intl.get('smodr.frightLine.model.orderAmount').d('订单金额(含税含运费)'),
        width: 160,
        dataIndex: 'orderAmountMeaning',
      },
      // {
      //   title: intl.get('smodr.frightLine.model.shuouldAmount').d('应付金额'),
      //   width: 100,
      //   dataIndex: 'paymentAmountMeaning',
      // },
      {
        title: intl.get('smodr.frightLine.model.freight').d('运费'),
        width: 100,
        dataIndex: 'freightAmountMeaning',
      },
      // {
      //   title: intl.get('smodr.frightLine.model.paymentAmount').d('支付金额'),
      //   width: 100,
      //   dataIndex: 'paymentAmountMeaning',
      // },
      // {
      //   title: intl.get('smodr.frightLine.model.patmentStatus').d('支付状态'),
      //   width: 100,
      //   dataIndex: 'paymentStatusMeaning',
      // },
      {
        title: intl.get('smodr.frightLine.model.orderStatusMeaning').d('订单状态'),
        width: 100,
        dataIndex: 'orderStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.buyerName').d('下单人'),
        width: 120,
        dataIndex: 'buyerName',
      },
      {
        title: intl.get('smodr.frightLine.model.cecCreatedTime').d('创建日期'),
        width: 150,
        dataIndex: 'cecCreatedTime',
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 200,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            {/* <a onClick={() => handleOpenModal('head', record)}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a> */}
          </span>
        ),
      },
    ];

    const buyerColumns = [
      {
        title: intl.get('smodr.acceptOrder.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.acceptOrder.model.buyerName').d('下单人姓名'),
        width: 120,
        dataIndex: 'buyerName',
      },
      {
        title: intl.get('smodr.acceptOrder.model.buyerPhone').d('下单人手机号'),
        width: 120,
        dataIndex: 'buyerFullPhone',
      },
      {
        title: intl.get('smodr.acceptOrder.model.buyerOrganizationName').d('下单人所属机构'),
        width: 120,
        dataIndex: 'buyerOrganizationName',
      },
    ];

    const receiverColumns = [
      {
        title: intl.get('smodr.acceptOrder.model.orderCode').d('商城订单编码'),
        width: 200,
        render: (_, record) => (
          <a onClick={() => handleToDetail(record)}>
            {extensionHeaderData && extensionHeaderData.orderCode}
          </a>
        ),
      },
      {
        title: intl.get('smodr.acceptOrder.model.addressTypeMeaning').d('收货地址类型'),
        width: 120,
        dataIndex: 'addressTypeMeaning',
      },
      {
        title: intl.get('smodr.acceptOrder.model.contactName').d('收货人姓名'),
        width: 120,
        dataIndex: 'contactName',
      },
      {
        title: intl.get('smodr.acceptOrder.model.mobilePhone').d('收货人手机号码'),
        width: 120,
        dataIndex: 'fullPhone',
      },
      {
        title: intl.get('smodr.acceptOrder.model.fullAddress').d('收货人地址编码'),
        width: 120,
        dataIndex: 'fullAddress',
      },
      {
        title: intl.get('smodr.acceptOrder.model.address').d('收货人详细地址'),
        width: 120,
        dataIndex: 'address',
      },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.acceptOrder.view.orderTitle').d('订单头信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderId"
          columns={headerColumns}
          dataSource={[extensionHeaderData]}
          pagination={false}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.acceptOrder.view.buyerTitle').d('下单人信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderId"
          columns={buyerColumns}
          dataSource={[extensionHeaderData]}
          pagination={false}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.acceptOrder.view.receiverTitle').d('收货人信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderAddressId"
          columns={receiverColumns}
          dataSource={[receiverAddress]}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}
