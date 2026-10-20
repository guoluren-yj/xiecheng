import React from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

export default class ExtensionTable extends React.Component {
  render() {
    const {
      extensionData = {},
      loading,
      handleToDetail,
      handleOpenModal,
      handleCheckMethod,
    } = this.props;
    const columns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'entryCode',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaning').d('运费来源'),
        width: 100,
        dataIndex: 'orderTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.freightTypeMeaning').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      // {
      //   title: intl.get('smodr.frightLine.model.freightRuleCode').d('运费规则名称'),
      //   width: 120,
      //   dataIndex: 'freightRuleCode',
      //   render: (val) => <span>{val || '-'}</span>,
      // },
      {
        title: intl.get('smodr.frightLine.model.freightRuleTypeMethod').d('运费计价方式'),
        width: 120,
        dataIndex: 'freightRuleTypeMeaning',
        render: (_, record) => {
          if (record.isHasFreightPricing && record.freightPricingMethodMeaning) {
            return <span>{record.freightPricingMethodMeaning}</span>;
          } else if (!record.isHasFreightPricing) {
            return <span>-</span>;
          } else if (record.isHasFreightPricing && !record.freightPricingMethodMeaning) {
            return (
              <span onClick={() => handleCheckMethod(record)}>
                {intl.get('smodr.frightLine.model.check').d('查看')}
              </span>
            );
          }
        },
      },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.taxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'taxRateMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.frightLine.model.freightAmountTaxNew').d('单价(含税)'),
        width: 100,
        dataIndex: 'unitPriceMeaning',
      },
      // {
      //   title: intl.get('smodr.frightLine.model.freightAmountNotax').d('未税单价'),
      //   width: 100,
      //   dataIndex: 'unitPriceMeaningTax',
      // },
      {
        title: intl.get('smodr.frightLine.model.quantityjineTaxNew').d('行金额(含税)'),
        width: 100,
        dataIndex: 'freightAmountMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.newPurchaseCompanyName').d('采购方公司'),
        width: 200,
        dataIndex: 'purchaseCompanyName',
        render: (val, record) => (
          <span>{record.agreementType === 'SALE' ? record.proxySupplierCompanyName : val}</span>
        ),
      },
      {
        title: intl.get('smodr.frightLine.model.newSupplierCompanyName').d('供应商公司'),
        width: 200,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => handleOpenModal('line')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
            {/* <a>{intl.get('smodr.frightLine.model.attachment').d('附件信息')}</a> */}
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.frightLine.model.freightLineInfo').d('运费行信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderEntryId"
          columns={columns}
          dataSource={[extensionData]}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}
