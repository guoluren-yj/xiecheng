/**
 * OtherInfoList - 客户收货记录 - 明细页面其他信息表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { sum, isNumber, isEmpty, isNil } from 'lodash';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import ReceiveTransactionDetails from './ReceiveTransactionDetails';
import ReceiveTransactionASNDetails from './ReceiveTransactionASNDetails';
import { showBigNumber } from '../components/utils';

const commonPrompt = 'sinv.common.model.common';

/**
 * 明细页面其他信息表格
 * @extends {Component} - React.Component
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class OtherInfoList extends Component {
  constructor(props) {
    super(props);
    this.getColumns = this.getColumns.bind(this);
    this.state = {
      receiveTransactionDetailsVisible: false,
      receiveTransactionASNDetailsVisible: false,
      actionRow: {},
    };
  }

  defaultTableRowKey = 'rcvTrxLineId';

  /**
   * 打开查看事务明细弹窗
   * @param {Object} record 行信息
   */
  openReceiveTransactionDetails(record) {
    this.setState({
      receiveTransactionDetailsVisible: true,
      actionRow: record,
    });
  }

  /**
   * 关闭事务明细详情弹窗
   */
  closeReceiveTransactionDetails() {
    this.setState({
      receiveTransactionDetailsVisible: false,
      actionRow: {},
    });
  }

  /**
   * 打开查看ASN事务明细弹窗
   * @param {Object} record 行信息
   */
  openReceiveTransactionASNDetails(record) {
    this.setState({
      receiveTransactionASNDetailsVisible: true,
      actionRow: record,
    });
  }

  /**
   * 关闭ASN事务明细详情弹窗
   */
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
  showUomText = (record) => {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  };

  getColumns(actionKey) {
    const { dataSource = [] } = this.props;
    const subjectType = dataSource.length && dataSource[0].subjectType;
    const defaultColumns = [
      {
        title: intl.get(`sinv.common.model.common.displayTrxNum`).d('事务编号'),
        dataIndex: 'displayTrxNum',
        width: 180,
        fixed: 'left',
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.displayTrxLineNum`).d('事务行号'),
        dataIndex: 'displayTrxLineNum',
        width: 120,
        align: 'left',
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.displaySourcePoNum`).d('来源订单号'),
        dataIndex: 'displayPoNum',
        width: 120,
        align: 'left',
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
        dataIndex: 'displayLineNum',
        width: 120,
        align: 'left',
        fixed: 'left',
      },
    ];

    const dynamicColumns = new Map([
      [
        'basicInfo',
        [
          {
            title: intl.get(`entity.customer.tag`).d('客户'),
            dataIndex: 'companyName',
            align: 'left',
            width: 180,
          },
          {
            title: intl.get(`sinv.common.model.common.ouName`).d('客户业务实体'),
            dataIndex: 'ouName',
            align: 'left',
            width: 180,
          },
          {
            title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
            dataIndex: 'itemCode',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
            dataIndex: 'itemName',
            align: 'left',
            width: 150,
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
            title: intl.get(`${commonPrompt}.purchaseReceiveTransactionType`).d('事务类型'),
            dataIndex: 'rcvTrxTypeName',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.trxDate`).d('事务日期'),
            dataIndex: 'trxDate',
            align: 'left',
            width: 150,
            render: dateRender,
          },
          {
            title: intl.get(`sinv.common.model.common.trxQuantity`).d('事务数量'),
            dataIndex: 'quantity',
            align: 'left',
            width: 120,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
            dataIndex: 'uomName',
            align: 'left',
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
            render: (val) => String(val) || '1',
          },
          {
            title: intl.get(`sinv.common.model.common.netAmount`).d('事务金额'),
            dataIndex: 'netAmount',
            align: 'right',
            width: 120,
            render: (val, record) => showBigNumber(val, record.financialPrecision),
          },
          {
            title: intl.get(`sinv.common.model.common.moveReason`).d('移动原因'),
            dataIndex: 'moveReason',
            align: 'left',
            width: 150,
            render: (_, record) => record.moveReasonMeaning,
          },
          {
            title: intl.get(`sinv.common.model.common.receiptPerson`).d('接收人'),
            dataIndex: 'receiptPerson',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.sourceDisplayReleaseNum`).d('来源订单发放号'),
            dataIndex: 'displayReleaseNum',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
            dataIndex: 'displayLineLocationNum',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.companySiteName`).d('公司地点'),
            dataIndex: 'supplierSiteName',
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
            dataIndex: 'organizationName',
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
            dataIndex: 'inventoryName',
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
            dataIndex: 'locationName',
            align: 'left',
            width: 150,
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
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
            dataIndex: 'productNum',
            align: 'left',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
            dataIndex: 'productName',
            align: 'left',
            width: 100,
          },
          {
            title: intl.get(`${commonPrompt}.catalog.name`).d('商品目录'),
            dataIndex: 'catalogueName',
            align: 'left',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
            dataIndex: 'oldItemCode',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.remark`).d('备注'),
            align: 'left',
            dataIndex: 'remark',
          },
          {
            title: intl.get(`sinv.common.view.title.receiveTransactionDetails`).d('事务明细'),
            dataIndex: 'trxDetail',
            width: 100,
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
        ],
      ],
      [
        'deliveryInfo',
        [
          {
            title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
            dataIndex: 'asnNum',
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.displayAsnLineNum`).d('送货单行号'),
            dataIndex: 'displayAsnLineNum',
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.deliveryLotNum`).d('送货单批次号'),
            align: 'left',
            dataIndex: 'lotNum',
          },
          {
            title: intl.get(`sinv.common.model.common.lotExpirationDate`).d('批次有效期'),
            dataIndex: 'lotExpirationDate',
            align: 'left',
            render: dateRender,
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
            dataIndex: 'serialNum',
            align: 'left',
            width: 100,
          },
          {
            title: intl
              .get(`sinv.common.view.title.receiveTransactionASNDetails`)
              .d('事务送货单明细'),
            align: 'left',
            width: 180,
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
            render: (val) => String(val) || '1',
          },
          {
            title: intl.get(`sinv.common.model.common.netAmount`).d('事务金额'),
            dataIndex: 'netAmount',
            align: 'right',
            width: 120,
            render: (val, record) => showBigNumber(val, record.financialPrecision),
          },
          {
            title: intl.get(`sinv.common.model.common.currencyCode`).d('币种'),
            dataIndex: 'currencyCode',
            align: 'left',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.rateType`).d('汇率类型'),
            dataIndex: 'rateType',
            align: 'left',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            align: 'left',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.periodName`).d('期间'),
            align: 'left',
            dataIndex: 'periodName',
            width: 90,
          },
          {
            title: intl.get(`${commonPrompt}.statement`).d('对账单'),
            children: [
              {
                title: intl.get(`${commonPrompt}.close`).d('关闭'),
                dataIndex: 'billClosedFlagMeaning',
                // align: 'left',
                key: 'billClosedFlagMeaning',
                width: 80,
              },
              {
                title: intl.get(`${commonPrompt}.status`).d('匹配状态'),
                dataIndex: 'billMatchedFlagMeaning',
                // align: 'left',
                key: 'billMatchedFlagMeaning',
                width: 120,
              },
              {
                title: subjectType
                  ? intl.get(`sinv.common.model.common.billMatchedQtyOrAmount`).d('匹配数量/金额')
                  : intl.get(`sinv.common.model.common.matchQuantity`).d('匹配数量'),
                dataIndex: subjectType ? 'billMatchedQtyOrAmount' : 'billMatchedQuantity',
                // align: 'left',
                key: subjectType ? 'billMatchedQtyOrAmount' : 'billMatchedQuantity',
                width: 160,
                render: (value) => showBigNumber(value),
              },
            ],
          },
          {
            title: intl.get(`${commonPrompt}.ticket`).d('发票'),
            children: [
              {
                title: intl.get(`${commonPrompt}.close`).d('关闭'),
                dataIndex: 'invoiceClosedFlagMeaning',
                // align: 'left',
                key: 'invoiceClosedFlagMeaning',
                width: 80,
              },
              {
                title: intl.get(`${commonPrompt}.status`).d('匹配状态'),
                dataIndex: 'invoiceMatchedStatusMeaning',
                key: 'invoiceMatchedStatusMeaning',
                // align: 'left',
                width: 120,
              },
              {
                title: subjectType
                  ? intl.get(`sinv.common.model.common.invoicedQtyOrAmount`).d('匹配数量/金额')
                  : intl.get(`sinv.common.model.common.matchQuantity`).d('匹配数量'),
                dataIndex: subjectType ? 'invoicedQtyOrAmount' : 'invoicedQuantity',
                // align: 'left',
                key: 'invoicedQtyOrAmount',
                width: 160,
                render: (value) => showBigNumber(value),
              },
            ],
          },
          {
            title: intl.get(`sinv.common.model.common.reverseFlag`).d('反冲'),
            dataIndex: 'reverseFlag',
            // align: 'left',
            width: 80,
            render: yesOrNoRender,
          },
        ],
      ],
    ]);
    return defaultColumns.concat(dynamicColumns.get(actionKey));
  }

  render() {
    const {
      pagination,
      loading,
      loadingAsnTransaction,
      loadingTransaction,
      tabKey = 'basicInfo',
      dataSource = [],
      onChange = (e) => e,
      customizeTable = () => {},
      fetchReceiveTransactionDetails = (e) => e,
      fetchReceiveTransactionASNDetails = (e) => e,
    } = this.props;
    const {
      actionRow = {},
      receiveTransactionASNDetailsVisible,
      receiveTransactionDetailsVisible,
    } = this.state;
    const columns = this.getColumns(tabKey);
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
      columns,
      dataSource,
      pagination,
      loading,
      onChange,
      bordered: true,
      rowKey: this.defaultTableRowKey,
      scroll: { x: scrollX >= 1200 ? scrollX : false },
    };
    const receiveTransactionDetailsProps = {
      visible: receiveTransactionDetailsVisible,
      rcvTrxLineId: actionRow.rcvTrxLineId,
      close: this.closeReceiveTransactionDetails.bind(this),
      fetchDataSource: fetchReceiveTransactionDetails,
      loading: loadingTransaction,
    };
    const receiveTransactionASNDetailsProps = {
      visible: receiveTransactionASNDetailsVisible,
      rcvTrxLineId: actionRow.rcvTrxLineId,
      close: this.closeReceiveTransactionASNDetails.bind(this),
      fetchDataSource: fetchReceiveTransactionASNDetails,
      loading: loadingAsnTransaction,
    };
    return (
      <Fragment>
        {tabKey === 'basicInfo' ? (
          customizeTable(
            {
              code: 'SINV.SUPPLIER_RECEIPT_RECORD.LINE_BASIC',
            },
            <Table {...tableProps} />
          )
        ) : (
          <Table {...tableProps} />
        )}
        {receiveTransactionDetailsVisible && (
          <ReceiveTransactionDetails {...receiveTransactionDetailsProps} />
        )}
        {receiveTransactionASNDetailsVisible && (
          <ReceiveTransactionASNDetails {...receiveTransactionASNDetailsProps} />
        )}
      </Fragment>
    );
  }
}
