/**
 * OtherInfoList - 我发送的订单 - 明细页面其他信息表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, isNumber, isEmpty, isNil } from 'lodash';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import intl from 'utils/intl';
import ReceiveTransactionDetails from './ReceiveTransactionDetails';
import ReceiveTransactionASNDetails from './ReceiveTransactionASNDetails';
import OperationDetails from './OperationDetails';
import { showBigNumber } from '../components/utils';

export default class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      receiveTransactionDetailsVisible: false,
      receiveTransactionASNDetailsVisible: false,
      operationVisible: false,
      actionRow: {},
      activeRow: {},
    };
  }

  defaultTableRowKey = 'rcvTrxLineId';

  @Bind()
  openReceiveTransactionDetails(actionRow) {
    // const { onSearchReceiveTransactionDetails } = this.props;
    // onSearchReceiveTransactionDetails(record.rcvTrxHeaderId);
    this.setState({
      receiveTransactionDetailsVisible: true,
      actionRow,
    });
  }

  @Bind()
  operationDetails(activeRow) {
    this.setState({
      operationVisible: true,
      activeRow,
    });
  }

  @Bind()
  closeOperationDetails() {
    this.setState({
      operationVisible: false,
      activeRow: {},
    });
  }

  @Bind()
  closeReceiveTransactionDetails() {
    this.setState({
      receiveTransactionDetailsVisible: false,
      actionRow: {},
    });
  }

  @Bind()
  openReceiveTransactionASNDetails(actionRow) {
    this.setState({
      receiveTransactionASNDetailsVisible: true,
      actionRow,
    });
  }

  @Bind()
  closeReceiveTransactionASNDetails() {
    this.setState({
      receiveTransactionASNDetailsVisible: false,
      actionRow: {},
    });
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  @Bind()
  getColumns(actionKey) {
    const { dataSource = [] } = this.props;
    const subjectType = dataSource.length && dataSource[0].subjectType;
    const defaultColumns = [
      {
        title: intl.get(`sinv.common.model.common.displayTrxNum`).d('事务编号'),
        dataIndex: 'displayTrxNum',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.displayTrxLineNum`).d('事务行号'),
        dataIndex: 'displayTrxLineNum',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.displaySourcePoNum`).d('来源订单号'),
        dataIndex: 'displayPoNum',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
        dataIndex: 'displayLineNum',
        width: 120,
      },
    ];

    const dynamicColumns = new Map([
      [
        'basicInfo',
        [
          {
            title: intl.get('entity.supplier.code').d('供应商编码'),
            dataIndex: 'supplierNum',
            width: 120,
          },
          {
            title: intl.get(`entity.supplier.name`).d('供应商名称'),
            dataIndex: 'supplierName',
            width: 150,
            onCell,
          },
          {
            title: intl.get('entity.item.code').d('物料编码'),
            dataIndex: 'itemCode',
            width: 120,
          },
          {
            title: intl.get('entity.item.name').d('物料名称'),
            dataIndex: 'itemName',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sinv.common.model.common.supplierItemNum`).d('供应商料号'),
            dataIndex: 'supplierItemNum',
            width: 110,
          },
          {
            title: intl.get(`sinv.common.model.common.suppliesNumDescription`).d('供应商料号描述'),
            dataIndex: 'supplierItemDesc',
            width: 130,
          },
          {
            title: intl
              .get(`sinv.common.model.common.purchaseReceiveTransactionType`)
              .d('事务类型'),
            dataIndex: 'rcvTrxTypeName',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.trxDate`).d('事务日期'),
            dataIndex: 'trxDate',
            width: 150,
            render: dateRender,
            onCell,
          },
          {
            title: intl.get(`sinv.common.model.common.trxQuantity`).d('事务数量'),
            dataIndex: 'quantity',
            width: 120,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
            dataIndex: 'uomName',
            width: 90,
            render: (_val, record) => this.showUomText(record),
          },
          {
            title: intl.get(`sinv.common.model.common.poUnitPrice`).d('单价'),
            dataIndex: 'netPrice',
            align: 'right',
            width: 90,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            align: 'right',
            width: 90,
            render: (val) => (!isNil(val) && String(val)) || 1,
          },
          {
            title: intl.get(`sinv.common.model.common.netAmount`).d('事务金额'),
            dataIndex: 'netAmount',
            align: 'right',
            width: 120,
            render: (value, record) => showBigNumber(value, record.financialPrecision),
          },
          {
            title: intl.get(`sinv.common.model.common.moveReason`).d('移动原因'),
            dataIndex: 'moveReason',
            width: 150,
            onCell,
            render: (_, record) => record.moveReasonMeaning,
          },
          {
            title: intl.get(`sinv.common.model.common.createdName`).d('单据创建人'),
            dataIndex: 'createdName',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.actualOperator`).d('实际操作人'),
            dataIndex: 'receivedBy',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.orderDisplayReleaseNum`).d('订单发放号'),
            dataIndex: 'displayReleaseNum',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
            dataIndex: 'displayLineLocationNum',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.agentName`).d('采购员'),
            dataIndex: 'agentName',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.supplierSiteName`).d('供应商地点'),
            dataIndex: 'supplierSiteName',
            width: 150,
            onCell,
          },
          {
            title: intl.get('sinv.common.model.common.organizationName').d('收货组织'),
            dataIndex: 'organizationName',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`entity.business.tag`).d('业务实体'),
            dataIndex: 'ouName',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
            dataIndex: 'inventoryName',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
            dataIndex: 'locationName',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sinv.common.model.common.productionOrderNum`).d('生产工单号'),
            dataIndex: 'productionOrderNum',
            width: 120,
            align: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.stockType`).d('特殊库存'),
            dataIndex: 'stockTypeMeaning',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
            dataIndex: 'productNum',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
            dataIndex: 'productName',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
            dataIndex: 'catalogName',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
            dataIndex: 'oldItemCode',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.remark`).d('备注'),
            dataIndex: 'remark',
            onCell,
          },
          {
            title: intl.get(`sinv.common.view.title.receiveTransactionDetails`).d('事务明细'),
            width: 100,
            dataIndex: 'trxDetail',
            render: (text, record) => (
              <a onClick={this.openReceiveTransactionDetails.bind(this, record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性'),
            dataIndex: 'customSpecsJson',
            width: 120,
            render: (v) => {
              return (
                <a onClick={() => showRecordModal(v ? JSON.parse(v) : [])}>
                  {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
                </a>
              );
            },
          },
          {
            title: intl.get(`sinv.common.view.title.operation`).d('操作'),
            width: 100,
            dataIndex: 'operation',
            render: (text, record) => (
              <a onClick={this.operationDetails.bind(this, record)}>
                {intl.get(`sinv.common.view.title.operation`).d('操作')}
              </a>
            ),
          },
        ],
      ],
      [
        'deliveryInfo',
        [
          {
            title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
            dataIndex: 'asnNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.displayAsnLineNum`).d('送货单行号'),
            dataIndex: 'displayAsnLineNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.deliveryLotNum`).d('送货单批次号'),
            dataIndex: 'lotNum',
            width: 180,
          },
          {
            title: intl.get(`sinv.purchaseReception.message.lotExpirationDate`).d('批次有效期'),
            dataIndex: 'lotExpirationDate',
            render: dateRender,
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
            dataIndex: 'serialNum',
            onCell,
          },
          {
            title: intl
              .get(`sinv.common.view.title.receiveTransactionASNDetails`)
              .d('事务送货单明细'),
            width: 150,
            render: (text, record) => (
              <a onClick={this.openReceiveTransactionASNDetails.bind(this, record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ),
          },
        ],
      ],
      [
        'financeInfo',
        [
          {
            title: intl.get(`entity.supplier.name`).d('供应商名称'),
            dataIndex: 'supplierName',
            width: 200,
          },
          {
            title: intl.get(`entity.supplier.subjectTypeMeaning`).d('事务执行标的'),
            dataIndex: 'subjectTypeMeaning',
            width: 200,
          },
          {
            title: intl.get(`sinv.common.model.common.poUnitPrice`).d('单价'),
            dataIndex: 'poUnitPrice',
            align: 'right',
            width: 90,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            align: 'right',
            width: 90,
            render: (val) => (!isNil(val) && String(val)) || 1,
          },
          {
            title: intl.get(`sinv.common.model.common.netAmount`).d('事务金额'),
            dataIndex: 'netAmount',
            align: 'right',
            width: 120,
            render: (value, record) => showBigNumber(value, record.financialPrecision),
          },
          {
            title: intl.get(`sinv.common.model.common.currencyCode`).d('币种'),
            dataIndex: 'currencyCode',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.rateType`).d('汇率类型'),
            dataIndex: 'rateType',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.periodName`).d('期间'),
            dataIndex: 'periodName',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.statement`).d('对账单'),
            children: [
              {
                title: intl.get(`sinv.common.model.common.close`).d('关闭'),
                key: 'billClosedFlag',
                dataIndex: 'billClosedFlagMeaning',
                width: 60,
              },
              {
                title: intl.get(`sinv.common.model.common.status`).d('匹配状态'),
                key: 'billMatchedFlag',
                dataIndex: 'billMatchedFlagMeaning',
                width: 120,
              },
              {
                title: subjectType
                  ? intl
                      .get(`sinv.common.model.common.billMatchedQtyOrAmount`)
                      .d('匹配数量/金额(含税)')
                  : intl.get(`sinv.common.model.common.matchQuantity`).d('匹配数量'),
                key: 'quantity',
                dataIndex: subjectType ? 'billMatchedQtyOrAmount' : 'billMatchedQuantity',
                width: 160,
                render: (value) => showBigNumber(value),
              },
            ],
          },
          {
            title: intl.get(`sinv.common.model.common.ticket`).d('发票'),
            children: [
              {
                title: intl.get(`sinv.common.model.common.close`).d('关闭'),
                key: 'invoiceClosedFlag',
                dataIndex: 'invoiceClosedFlagMeaning',
                width: 60,
              },
              {
                title: intl.get(`sinv.common.model.common.status`).d('匹配状态'),
                key: 'invoiceMatchedStatusMeaning',
                dataIndex: 'invoiceMatchedStatusMeaning',
                width: 120,
              },
              {
                title: subjectType
                  ? intl
                      .get(`sinv.common.model.common.invoicedQtyOrAmount`)
                      .d('匹配数量/金额(含税)')
                  : intl.get(`sinv.common.model.common.matchQuantity`).d('匹配数量'),
                key: 'invoicedQuantity',
                dataIndex: subjectType ? 'invoicedQtyOrAmount' : 'invoicedQuantity',
                width: 160,
                render: (value) => showBigNumber(value),
              },
              {
                title: intl.get(`sinv.common.model.common.invoiceReviewedStatus`).d('复核状态'),
                dataIndex: 'invoiceReviewedStatusMeaning',
                width: 120,
              },
              {
                title: intl.get(`sinv.common.model.common.invoicedReviewedQuantity`).d('复核数量'),
                dataIndex: 'invoicedReviewedQuantity',
                width: 90,
                render: (value) => showBigNumber(value),
              },
            ],
          },
          {
            title: intl.get(`sinv.common.model.common.reverseFlag`).d('反冲'),
            dataIndex: 'reverseFlag',
            width: 70,
            render: yesOrNoRender,
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
    return defaultColumns
      .map((n) => ({ ...n, fixed: 'left' }))
      .concat(dynamicColumns.get(actionKey));
  }

  render() {
    const {
      dataSource,
      pagination,
      loading,
      onChange = (e) => e,
      customizeTable = () => {},
      fetchReceiveTransactionDetails = (e) => e,
      fetchReceiveTransactionASNDetails = (e) => e,
      tabKey,
    } = this.props;
    const {
      actionRow = {},
      activeRow = {},
      operationVisible,
      receiveTransactionASNDetailsVisible,
      receiveTransactionDetailsVisible,
    } = this.state;
    const columns = this.getColumns(tabKey).map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map((childItem) => ({
            ...childItem,
            title: (
              <div style={{ textAlign: (childItem.align && childItem.align) || 'left' }}>
                {childItem.title}
              </div>
            ),
          })),
        };
      }
      return {
        ...item,
        title: <div style={{ textAlign: (item.align && item.align) || 'left' }}>{item.title}</div>,
      };
    });
    const scrollX =
      sum(
        columns.map((n) =>
          isNumber(n.width)
            ? n.width
            : !isEmpty(n.children)
            ? sum(n.children.map((m) => (isNumber(m.width) ? m.width : 0)))
            : 0
        )
      ) + 200;
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns,
      dataSource,
      pagination,
      loading: loading.queryList,
      bordered: true,
      onChange,
      scroll: { x: scrollX >= 1200 ? scrollX : false },
    };
    const receiveTransactionASNDetailsProps = {
      visible: receiveTransactionASNDetailsVisible,
      id: actionRow.rcvTrxLineId,
      close: this.closeReceiveTransactionASNDetails.bind(this),
      fetchDataSource: fetchReceiveTransactionASNDetails,
      loading: loading.queryReceiveTransactionASNDetails,
    };
    const receiveTransactionDetailsProps = {
      visible: receiveTransactionDetailsVisible,
      id: actionRow.rcvTrxLineId,
      close: this.closeReceiveTransactionDetails.bind(this),
      fetchDataSource: fetchReceiveTransactionDetails,
      loading: loading.queryReceiveTransactionDetails,
    };
    const operationDetailsProps = {
      visible: operationVisible,
      id: activeRow.rcvTrxLineId,
      headerId: activeRow.rcvTrxHeaderId,
      close: this.closeOperationDetails.bind(this),
      fetchDataSource: fetchReceiveTransactionDetails,
      loading: loading.queryReceiveTransactionDetails,
    };
    return (
      <Fragment>
        {tabKey === 'basicInfo' ? (
          customizeTable(
            {
              code: 'SINV.PURCHASE_RECEIPT_RECORD.LINE_BASIC',
            },
            <Table {...tableProps} />
          )
        ) : (
          <Table {...tableProps} />
        )}
        {receiveTransactionASNDetailsVisible && (
          <ReceiveTransactionASNDetails {...receiveTransactionASNDetailsProps} />
        )}
        {receiveTransactionDetailsVisible && (
          <ReceiveTransactionDetails {...receiveTransactionDetailsProps} />
        )}
        {operationVisible && <OperationDetails {...operationDetailsProps} />}
      </Fragment>
    );
  }
}
