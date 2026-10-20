import React, { Component } from 'react';
import { Popover, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';

import EditTable from '_components/EditTable';
// import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { getPriceName, getNetPriceName, getQtyName } from '@/utils/utils';

export default class SupplierLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.rfxLineSupplierId, this);
    }
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  // 表格行选择
  @Bind()
  changeTableSeletion(keys = [], rows = []) {
    const {
      changeSupplierLineTableSelection = () => {},
      changeCurrentPaneActiveSelected,
      rfxLineSupplierId,
    } = this.props;

    changeSupplierLineTableSelection(keys, rows);
    changeCurrentPaneActiveSelected(rows, rfxLineSupplierId);
  }

  render() {
    const {
      rfxLineSupplierId,
      loadingSupplierObj,
      onChange,
      dataSource,
      pagination,
      supplierLineTableSelectedKeys = [],
      supplierLineTableSelectedRows = [],
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
      header,
    } = this.props;
    const newDataSource = dataSource.filter((r) => r.rfxLineSupplierId === rfxLineSupplierId);
    const newPagination = pagination[rfxLineSupplierId];

    let rowSelection = {
      selectedRows: supplierLineTableSelectedRows,
      selectedRowKeys: supplierLineTableSelectedKeys,
      onChange: this.changeTableSeletion,
    };

    rowSelection = remote
      ? remote.process('SSRC_ELIMINATEINQUIRY_PROCESS_SUPPLIER_TABLE_ROWSELECTION', rowSelection, {
          bidFlag,
          header,
        })
      : rowSelection;

    let columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      doubleUnitFlag
        ? priceTypeCode === 'TAX_INCLUDED_PRICE'
          ? {
              title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
              dataIndex: 'validQuotationSecPrice',
              width: 100,
              align: 'right',
            }
          : {
              title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validNetPrice`).d('单价(不含税)'),
              dataIndex: 'validNetSecondaryPrice',
              width: 100,
              align: 'right',
            }
        : null,
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: getPriceName(doubleUnitFlag),
            dataIndex: 'validQuotationPrice',
            width: 100,
            align: 'right',
          }
        : {
            title: getNetPriceName(doubleUnitFlag),
            dataIndex: 'validNetPrice',
            width: 100,
            align: 'right',
          },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: (val) => (val !== null ? val : '-'),
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: (val) => (val !== null ? val : '-'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLinePrice`).d('报价行金额'),
        dataIndex: priceTypeCode === 'TAX_INCLUDED_PRICE' ? 'totalAmount' : 'netAmount',
        width: 80,
        align: 'right',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.eliminateRemark').d('淘汰原因'),
        dataIndex: 'eliminateRemark',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`eliminateRemark`, { initialValue: val })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ].filter(Boolean);

    columns = remote
      ? remote.process('SSRC_ELIMINATEINQUIRY_PROCESS_SUPPLIER_COLUMNS', columns, { bidFlag, header, })
      : columns;

    columns = columns.filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <EditTable
        bordered
        rowKey="quotationLineId"
        loading={
          loadingSupplierObj[rfxLineSupplierId] &&
          loadingSupplierObj[rfxLineSupplierId].fetchItemQuoteLineLoading
        }
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={newDataSource}
        pagination={newPagination}
        onDataChange={this.hasChangeData}
        onChange={(page) => onChange(page, rfxLineSupplierId)}
        rowSelection={rowSelection}
      />
    );
  }
}
