import React, { Component } from 'react';
import { Form, Popover, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';

import EditTable from '_components/EditTable';
import intl from 'utils/intl';
import { getPriceName, getNetPriceName, getQtyName } from '@/utils/utils';

@connect(({ inquiryHall }) => ({
  inquiryHall,
}))
@Form.create({ fieldNameProp: null })
export default class QuoteLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { quoteLine },
    } = this.props;
    const {
      inquiryHall: { quoteLine: preLine },
    } = preProps;
    if (quoteLine !== preLine) {
      return true;
    }
    return null;
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const {
      dispatch,
      inquiryHall: { allLineChange = false },
    } = this.props;
    if (!isEmpty(changeValues) && !allLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          allLineChange: true,
        },
      });
    }
  }

  // 表格行选择
  @Bind()
  changeTableSeletion(keys = [], rows = []) {
    const {
      changeAllQuotationLineTableSelection = () => {},
      changeCurrentPaneActiveSelected = () => {},
    } = this.props;

    changeAllQuotationLineTableSelection(keys, rows);
    changeCurrentPaneActiveSelected(rows, 'allSupplier');
  }

  /**
   * 获取表格数据 不校验
   */
  @Bind()
  getTableData(dataSource = []) {
    const paramsList = [];
    if (Array.isArray(dataSource)) {
      for (let i = 0; i < dataSource.length; i++) {
        if (dataSource[i].$form && dataSource[i]._status) {
          paramsList.push({ ...dataSource[i], ...dataSource[i].$form.getFieldsValue() });
        }
      }
    }
    return paramsList;
  }

  // 选用 改变
  @Bind()
  changeSuggestedFlag(e = {}, record = {}) {
    if (e.target.checked) {
      record.$form.setFieldsValue({
        allottedQuantity: record.rfxQuantity,
        suggestedFlag: 1,
      });
    } else {
      record.$form.setFieldsValue({
        allottedQuantity: '',
        allottedRatio: '',
        suggestedRemark: '',
        suggestedFlag: 0,
      });
    }
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      allQuotationLineTableSelectedKeys = [],
      allQuotationLineTableSelectedRows = [],
      changeQuoteLinePagination,
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
      header,
    } = this.props;

    let rowSelection = {
      selectedRows: allQuotationLineTableSelectedRows,
      selectedRowKeys: allQuotationLineTableSelectedKeys,
      onChange: this.changeTableSeletion,
      // getCheckboxProps: (record) => ({
      //   disabled: record.$form
      //     ? record.$form.getFieldValue('suggestedFlag') === 0
      //     : record.suggestedFlag === 0,
      // }),
    };

    rowSelection = remote
      ? remote.process('SSRC_ELIMINATEINQUIRY_PROCESS_QUOTE_TABLE_ROWSELECTION', rowSelection, {
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
    ];

    columns = remote
      ? remote.process('SSRC_ELIMINATEINQUIRY_PROCESS_QUOTE_COLUMNS', columns, { bidFlag, header, })
      : columns;

    columns = columns.filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <EditTable
          bordered
          rowKey="quotationLineId"
          loading={loading}
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={dataSource}
          pagination={pagination}
          onDataChange={this.hasChangeData}
          onChange={(page) => changeQuoteLinePagination(page)}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
