/**
 * MaintainIndex -非寄销开票单销售账单汇总查询 -table 表格
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import qs from 'querystring';

import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import ActionHistory from '../../Components/ActionHistory';
import { thousandBitSeparator } from '@/routes/utils';
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@withRouter
@withCustomize({
  unitCode: ['SFIN.BILL_SALE_LIST.GRID'],
})
export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.state = { recordModal: false };
  }

  /**
   * 跳转路由
   * @param {Object} record 行数据
   */
  @Bind()
  handleGoDetail(record) {
    // const { id } = this.props;
    const { billHeaderId, sourceCode } = record;
    // const router =
    //   createdBy === id && (billStatus === 'NEW' || billStatus === 'REJECTED')
    //     ? {
    //         pathname: `/sfin/sales-bill/maintainDetail/${billHeaderId}`,
    //         search: qs.stringify({ status: 'sales' }),
    //       }
    //     : `/sfin/sales-bill/detail/${billHeaderId}`;
    if (sourceCode === 'EC') {
      this.props.history.push(`/sfin/sales-bill/electronic-mall/${billHeaderId}`);
    } else {
      this.props.history.push(`/sfin/sales-bill/detail/${billHeaderId}`);
    }
    // const router = `/sfin/sales-bill/detail/${billHeaderId}`;
    // this.props.history.push(router);
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState(
      {
        recordModal: true,
        data: record,
      },
      () => {
        if (this.historyModal) this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
      },
      () => {
        if (this.historyModal) this.historyModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  render() {
    const {
      supplierDataSource = {},
      supplierPagination = {},
      loading,
      onFetchSupplierBill,
      dispatch,
      customizeTable,
      rowSelection,
    } = this.props;
    const { recordModal, data } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
      isApprovalShow: true,
      showRejected: true,
    };
    const columns = [
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号'),
        dataIndex: 'displayBillNum',
        width: 200,
        render: (text, record) => <a onClick={() => this.handleGoDetail(record)}>{text}</a>,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'billStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.companyName').d('客户公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.netAmount').d('不含税金额'),
        dataIndex: 'netAmount',
        width: 120,
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.all.taxIncludedAmount').d('含税总额'),
        dataIndex: 'taxIncludedAmount',
        width: 120,
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1 ? '***' : thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.currencyCode').d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.erpBillNum').d('ERP对账单号'),
        dataIndex: 'erpBillNum',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierNum').d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierName').d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
        dataIndex: 'purOrganization',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员'),
        dataIndex: 'purchaseAgent',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseCreateFlag').d('采购方创建'),
        dataIndex: 'supplierCreateFlagMeaning',
        width: 100,
      },
      {
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.invoiceCompleteFlag')
          .d('是否已完全开票'),
        dataIndex: 'invoiceCompleteFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.createName').d('创建人'),
        dataIndex: 'createdByName',
        width: 100,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.approvedDate').d('审核日期'),
        dataIndex: 'approvedDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sourceSystem').d('来源系统'),
        dataIndex: 'billSourceSystem',
        width: 120,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceNumber`).d('税务发票号'),
        dataIndex: 'taxInvoiceNums',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`).d('ERP发票号'),
        dataIndex: 'erpInvoiceNums',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'tableName',
        width: 120,
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SFIN.BILL_SALE_LIST.GRID',
          },
          <Table
            rowSelection={rowSelection}
            pagination={supplierPagination}
            dataSource={supplierDataSource.content || []}
            rowKey="billHeaderId"
            columns={columns}
            scroll={{ x: 2100 }}
            loading={loading}
            bordered
            onChange={(page) => onFetchSupplierBill(page)}
          />
        )}
        <ActionHistory {...operationRecordProps} />
      </Fragment>
    );
  }
}
