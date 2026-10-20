/**
 * BasicInfoList - 我发送的订单 - 明细页面基本信息表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { formatUom, formatAumont } from '@/routes/components/utils';

export default class BasicInfoList extends PureComponent {
  defaultTableRowKey = 'poLineId';

  saveRowData(rowData) {
    const { dataSource = [], assignDataSource = (e) => e } = this.props;
    assignDataSource(dataSource.map((n) => (n.poLineId === rowData.poLineId ? rowData : n)));
  }

  render() {
    const { dataSource = [], pagination, processing, onChange = (e) => e } = this.props;
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns: [
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.lineNum`).d('行号'),
          dataIndex: 'lineNum',
          align: 'center',
          width: 50,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.shipmentNum`).d('发运号'),
          dataIndex: 'shipmentNum',
          align: 'center',
          width: 90,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          align: 'center',
          width: 70,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
          dataIndex: 'itemDescription',
          align: 'center',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.quantity`).d('数量'),
          dataIndex: 'quantity',
          align: 'right',
          width: 80,
          render: (value) => formatAumont(value),
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.uomName`).d('单位'),
          dataIndex: 'uomName',
          align: 'center',
          width: 80,
          render: (_, { uomCodeAndName }) => uomCodeAndName,
        },
        {
          title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
          dataIndex: 'unitPrice',
          align: 'right',
          width: 140,
          render: (text, record) => {
            const value = `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return record.priceShieldFlag === 1 ? '******' : value;
          },
        },
        {
          title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
          dataIndex: 'taxedEnteredUnitPrice',
          align: 'right',
          width: 140,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.unitPriceBatch`).d('每'),
          dataIndex: 'unitPriceBatch',
          align: 'right',
          width: 60,
          render: (value) => formatAumont(value),
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.lineAmount`).d('不含税行金额'),
          dataIndex: 'lineAmount',
          align: 'right',
          width: 140,
          render: (text, record) => {
            const value = `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return record.priceShieldFlag === 1 ? '******' : value;
          },
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.taxedLineAmount`).d('含税行金额'),
          dataIndex: 'taxedLineAmount',
          align: 'right',
          width: 140,
          render: (text, record) => {
            const value = `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return record.priceShieldFlag === 1 ? '******' : value;
          },
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.taxRate`).d('税率'),
          dataIndex: 'taxRate',
          width: 90,
          align: 'right',
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 80,
          align: 'center',
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.needByDate`).d('需求日期'),
          dataIndex: 'needByDate',
          align: 'center',
          width: 90,
          render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.committedDeliveryDate`).d('承诺交货日期'),
          dataIndex: 'committedDeliveryDate',
          align: 'center',
          width: 110,
          render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.rcvOrganizationName`).d('收货组织'),
          dataIndex: 'rcvOrganizationName',
          width: 90,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.rcvWarehouseName`).d('收货库房'),
          dataIndex: 'rcvWarehouseName',
          align: 'center',
          width: 90,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.rcvLocatorName`).d('收货库位'),
          dataIndex: 'rcvLocatorName',
          align: 'center',
          width: 90,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.specifications`).d('规格'),
          dataIndex: 'specifications',
          align: 'center',
          width: 60,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.model`).d('型号'),
          dataIndex: 'model',
          align: 'center',
          width: 90,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.manufacturerName`).d('制造商'),
          dataIndex: 'manufacturerName',
          align: 'center',
          width: 150,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.brand`).d('品牌'),
          dataIndex: 'brand',
          align: 'center',
          width: 150,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.purchaserComments`).d('采购方行备注'),
          dataIndex: 'comments',
          width: 180,
        },
        {
          title: intl.get(`sodr.sendOrder.model.sendOrder.feedbacks`).d('反馈信息'),
          dataIndex: 'feedbacks',
          width: 180,
        },
      ],
      dataSource,
      pagination,
      loading: processing,
      bordered: true,
      onChange,
      scroll: { x: 2600 },
    };
    return <Table {...tableProps} />;
  }
}
