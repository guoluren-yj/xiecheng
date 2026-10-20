import React, { Component } from 'react';
import { Popover, Form, Input } from 'hzero-ui';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { getPriceName, getNetPriceName, getQtyName } from '@/utils/utils';

export default class ItemLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.rfxLineItemId, this);
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
      changeCurrentPaneActiveSelected,
      rfxLineItemId,
      changeItemLineTableSelection,
    } = this.props;

    changeItemLineTableSelection(keys, rows);
    changeCurrentPaneActiveSelected(rows, rfxLineItemId);
  }

  render() {
    const {
      rfxLineItemId = undefined,
      onChange,
      dataSource = [],
      pagination = {},
      loadingItemObj,
      itemLineTableSelectedRows = [],
      itemLineTableSelectedKeys = [],
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
      header,
    } = this.props;
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    const newPagination = pagination[rfxLineItemId];
    let rowSelection = {
      selectedRows: itemLineTableSelectedRows,
      selectedRowKeys: itemLineTableSelectedKeys,
      onChange: this.changeTableSeletion,
    };

    rowSelection = remote
      ? remote.process('SSRC_ELIMINATEINQUIRY_PROCESS_ITEM_TABLE_ROWSELECTION', rowSelection, {
          bidFlag,
          header,
        })
      : rowSelection;

    let columns = [
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'companyName',
        width: 150,
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
        render: (val, record) => {
          return ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`eliminateRemark`, { initialValue: val })(<Input />)}
            </Form.Item>
          ) : (
            val
          );
        },
      },
    ].filter(Boolean);

    columns = remote
      ? remote.process('SSRC_ELIMINATEINQUIRY_PROCESS_ITEM_COLUMNS', columns, { bidFlag, header, })
      : columns;

    columns = columns.filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <EditTable
        bordered
        rowKey="quotationLineId"
        loading={
          loadingItemObj[rfxLineItemId] && loadingItemObj[rfxLineItemId].fetchItemQuoteLineLoading
        }
        columns={columns}
        scroll={{ x: scrollX }}
        onDataChange={this.hasChangeData}
        dataSource={newDataSource}
        pagination={newPagination}
        onChange={(page) => onChange(page, rfxLineItemId)}
        rowSelection={rowSelection}
      />
    );
  }
}
