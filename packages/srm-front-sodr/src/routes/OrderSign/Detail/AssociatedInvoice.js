/**
 * AssociatedInvoice - 交期审核 - 明细页面表格-关联单据
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, isNumber, isFunction } from 'lodash';
import { Table, Tabs } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';

import { formatAumont } from '@/routes/components/utils';

const { TabPane } = Tabs;

const queryTableDataSourceMap = {
  asn: {
    loading: 'asnLinesLoading',
    rowKey: 'key',
    action: 'fetchAsnLines',
  },
  rcv: {
    loading: 'rcvRecordsLoading',
    rowKey: 'rcvTrxLineId',
    action: 'fetchRcvRecords',
  },
  bill: {
    loading: 'billLinesLoading',
    rowKey: 'billLineId',
    action: 'fetchBillLines',
  },
  invoice: {
    loading: 'invoiceLinesLoading',
    rowKey: 'invoiceLineId',
    action: 'fetchInvoiceLines',
  },
};

export default class AssociatedInvoice extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentRadioGroupValue: 'asn',
      asn: {
        dataSource: [],
        pagination: {},
      },
      rcv: {
        dataSource: [],
        pagination: {},
      },
      bill: {
        dataSource: [],
        pagination: {},
      },
      invoice: {
        dataSource: [],
        pagination: {},
      },
    };

    // 方法注册
    ['onRadioGroupChange', 'onTableChange', 'fetchTableDataSourceAll', 'getColumns'].forEach(
      (method) => {
        this[method] = this[method].bind(this);
      }
    );
  }

  componentDidMount() {
    this.fetchTableDataSourceAll();
  }

  componentDidUpdate(prevProps) {
    const { actionListCommonRow } = this.props;
    if (
      actionListCommonRow.poLineLocationId &&
      prevProps.actionListCommonRow.poLineLocationId !== actionListCommonRow.poLineLocationId
    ) {
      this.fetchTableDataSourceAll();
    }
  }

  fetchTableDataSourceAll() {
    const { poLineLocationId } = this.props;
    Promise.all(
      Object.keys(queryTableDataSourceMap).map((n) => {
        const action = this.props[queryTableDataSourceMap[n].action];
        return isFunction(action)
          ? action({ poLineLocationId }).then((res) => {
              if (res) {
                this.setTableDataSource(res, n);
              }
            })
          : {};
      })
    );
  }

  onRadioGroupChange(e) {
    this.setState({
      currentRadioGroupValue: e,
    });
  }

  onTableChange(page) {
    const { currentRadioGroupValue } = this.state;
    const action = this.props[queryTableDataSourceMap[currentRadioGroupValue].action];
    if (isFunction(action)) {
      action(page).then((res) => {
        if (res) {
          this.setTableDataSource(res);
        }
      });
    }
  }

  getColumns() {
    const { currentRadioGroupValue } = this.state;
    const { associatedConfigFlag } = this.props;
    const dynamicColumns = new Map([
      [
        'asn',
        [
          {
            title: intl.get(`sodr.common.model.common.slNum`).d('送货单号'),
            dataIndex: 'asnNum',
            width: 150,
          },
          {
            title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
            dataIndex: 'displayAsnLineNum',
            width: 80,
          },
          {
            title: intl.get(`sodr.common.model.common.fyNum`).d('发运数量'),
            dataIndex: 'shipQuantity',
            width: 100,
            render: (val) => formatAumont(val),
          },
          {
            title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
            dataIndex: 'uomCodeAndName',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.common.fhDate`).d('发货日期'),
            dataIndex: 'shipDate',
            width: 120,
            render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
          },
          {
            title: intl.get(`sodr.common.model.common.status`).d('状态'),
            dataIndex: 'asnStatusMeaning',
            width: 90,
          },
        ],
      ],
      [
        'rcv',
        [
          {
            title: intl.get(`sodr.common.model.common.txType`).d('事务类型'),
            dataIndex: 'rcvTrxTypeName',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.txNum`).d('事务编号'),
            dataIndex: 'displayTrxNum',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
            dataIndex: 'trxLineNum',
            width: 80,
          },
          {
            title: intl.get(`sodr.common.model.common.quantitys`).d('数量'),
            dataIndex: 'quantity',
            width: 60,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
            dataIndex: 'uomCodeAndName',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.common.txDate`).d('事务日期'),
            dataIndex: 'trxDate',
            render: dateRender,
            width: 100,
          },
        ],
      ],
      [
        'bill',
        [
          {
            title: intl.get(`sodr.common.model.common.compareNum`).d('对账单号'),
            dataIndex: 'billNum',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
            dataIndex: associatedConfigFlag ? 'lineNum' : 'billLineNum',
            width: 80,
          },
          {
            title: intl.get(`sodr.common.model.common.quantitys`).d('数量'),
            dataIndex: 'quantity',
            width: 90,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
            dataIndex: associatedConfigFlag ? 'uom' : 'uomName',
            width: 100,
            // render: (_, { uomCode, uomName }) => formatUom(uomCode, uomName),
          },
          {
            title: intl.get(`sodr.common.model.common.sureDate`).d('确认日期'),
            dataIndex: associatedConfigFlag ? 'confirmDate' : 'approvedDate',
            render: dateRender,
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.status`).d('状态'),
            dataIndex: 'billStatusMeaning',
            width: 100,
          },
        ],
      ],
      [
        'invoice',
        [
          {
            title: intl.get(`sodr.common.model.common.interInvoiceNum`).d('网上发票号'),
            dataIndex: associatedConfigFlag ? 'settleHeaderNum' : 'invoiceNum',
            width: 150,
          },
          {
            title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
            dataIndex: associatedConfigFlag ? 'lineNum' : 'invoiceLineNum',
            width: 80,
          },
          {
            title: intl.get(`sodr.common.model.common.quantitys`).d('数量'),
            dataIndex: 'quantity',
            width: 90,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
            dataIndex: associatedConfigFlag ? 'uom' : 'uomName',
            width: 100,
            // render: (_, { uomCode, uomName }) => formatUom(uomCode, uomName),
          },
          {
            title: intl.get(`sodr.common.model.common.exportDate`).d('导入日期'),
            dataIndex: 'syncDate',
            render: dateRender,
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.status`).d('状态'),
            dataIndex: associatedConfigFlag ? 'settleStatusMeaning' : 'invoiceStatusMeaning',
            width: 100,
          },
        ],
      ],
    ]);
    function onCell() {
      return {
        style: {
          overflow: 'hidden',
          maxWidth: 180,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        onClick: (e) => {
          const { target } = e;
          if (target.style.whiteSpace === 'normal') {
            target.style.whiteSpace = 'nowrap';
          } else {
            target.style.whiteSpace = 'normal';
          }
        },
      };
    }

    return (dynamicColumns.get(currentRadioGroupValue) || []).map((n) => ({ ...n, onCell }));
  }

  setTableDataSource(res = {}, actionType) {
    const { currentRadioGroupValue } = this.state;
    const { dataSource = [], pagination = {} } = res;
    this.setState({
      [actionType || currentRadioGroupValue]: {
        dataSource,
        pagination,
      },
    });
  }

  render() {
    const { currentRadioGroupValue } = this.state;
    const { processing = {} } = this.props;
    const columns = this.getColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      columns,
      dataSource: this.state[currentRadioGroupValue].dataSource,
      pagination: false,
      loading: processing[queryTableDataSourceMap[currentRadioGroupValue].loading],
      scroll: { x: scrollX },
      bordered: true,
      onChange: this.onTableChange,
      rowKey: queryTableDataSourceMap[currentRadioGroupValue].rowKey,
    };
    return (
      <Fragment>
        <Tabs onChange={this.onRadioGroupChange} animated={false}>
          <TabPane
            key="asn"
            tab={`${intl.get(`sodr.common.view.message.panel.asn`).d('送货单')}(${
              this.state.asn.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="rcv"
            tab={`${intl.get(`sodr.common.view.message.panel.rcv`).d('收货记录')}(${
              this.state.rcv.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="bill"
            tab={`${intl.get(`sodr.common.view.message.panel.bill`).d('对账单')}(${
              this.state.bill.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
          <TabPane
            key="invoice"
            tab={`${intl.get(`sodr.common.view.message.panel.invoice`).d('网上发票')}(${
              this.state.invoice.dataSource.length
            })`}
          >
            <Table {...tableProps} />
          </TabPane>
        </Tabs>
      </Fragment>
    );
  }
}
