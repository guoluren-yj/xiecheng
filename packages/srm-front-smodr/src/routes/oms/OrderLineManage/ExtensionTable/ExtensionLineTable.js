import React from 'react';
import { Table } from 'hzero-ui';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';

@withRouter
export default class ExtensionTable extends React.Component {
  render() {
    const {
      extensionData = {},
      loading,
      handleToDetail,
      handleOpenModal,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('smodr.orderLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.orderLine.model.entryCode').d('商品行号'),
        width: 100,
        dataIndex: 'entryCode',
      },
      {
        title: intl.get('smodr.orderLine.model.skuCode').d('商品编码'),
        width: 150,
        dataIndex: 'skuCode',
      },
      {
        title: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
        width: 100,
        dataIndex: 'skuName',
      },
      {
        title: intl.get('smodr.orderLine.model.skuTypeMeaning').d('商品类型'),
        width: 100,
        dataIndex: 'skuTypeMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.parentSkuCode').d('关联商品编码'),
        width: 120,
        dataIndex: 'parentSkuCode',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.orderLine.model.parentSkuName').d('关联商品名称'),
        width: 120,
        dataIndex: 'parentSkuName',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.orderLine.model.purchasingType').d('购买类型'),
        width: 100,
        dataIndex: 'purchasingType',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.orderLine.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'originalQuantityMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.uomName').d('单位'),
        width: 100,
        dataIndex: 'uom',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.orderLine.model.taxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'taxRateMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.orderLine.model.unitPriceTax').d('含税单价'),
        width: 100,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.unitNakedPrice').d('未税单价'),
        width: 100,
        dataIndex: 'unitNakedPriceMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.containFreight').d('单价是否含运费'),
        width: 120,
        dataIndex: 'containFreight',
        render: (val) => (
          <span>
            {val === '1'
              ? intl.get('smodr.orderLine.model.yes').d('是')
              : intl.get('smodr.orderLine.model.no').d('否')}
          </span>
        ),
      },
      {
        title: intl.get('smodr.orderLine.model.eachFreight').d('分摊运费（每）'),
        width: 120,
        dataIndex: 'eachFreight',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.orderLine.model.paidAmountTax').d('含税行金额'),
        width: 100,
        dataIndex: 'entryAmountMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.nakedPrice').d('未税行金额'),
        width: 100,
        dataIndex: 'nakedPriceMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.taxPriceMeaningNew').d('行税额'),
        width: 100,
        dataIndex: 'taxPriceMeaning',
      },
      {
        title: intl.get('smodr.orderLine.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.orderLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => handleOpenModal('line')}>
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </a>
            {/* <a>{intl.get('smodr.orderLine.model.attachment').d('附件信息')}</a> */}
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SMODR.ORDER.ENTRY.DETAIL',
          },
          <Table
            bordered
            loading={loading}
            rowKey="orderEntryId"
            columns={columns}
            dataSource={[extensionData]}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }
}
