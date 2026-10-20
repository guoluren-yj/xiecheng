/**
 * MaintainIndex -非寄销开票申请维护查询界面 -table 表格
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { withRouter } from 'react-router';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';
import ActionHistory from '../Bill/Components/ActionHistory';

@withRouter
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
export default class TableList extends PureComponent {
  constructor(props) {
    super(props);
    props.onListRef(this);
    this.state = { recordModal: false };
  }

  @Bind()
  toDetail(record = {}) {
    this.props.history.push({
      pathname: `/sfin/confirm-invoice-notification/detail/${record.billHeaderId}`,
      search: qs.stringify({ status: 'maintain' }),
    });
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
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRows 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: { auditRows: selectedRows },
    });
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
        this.historyModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  render() {
    const {
      auditNCDataSource = {},
      auditNCPagination = {},
      auditRows = [],
      fetchLoading,
      dispatch,
      onFetchConsigBill,
      customizeTable,
      code,
    } = this.props;
    const { recordModal, data } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const columns = [
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号'),
        dataIndex: 'displayBillNum',
        width: 150,
        render: (val, record) => {
          return <a onClick={() => this.toDetail(record)}>{record.displayBillNum}</a>;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'billStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.company').d('公司'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.netAmount').d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? record.netAmountMeaning
            : thousandBitSeparator(record.netAmount, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.all.taxIncludedAmount').d('含税总额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? record.taxIncludedAmountMeaning
            : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.currencyCode').d('币种'),
        dataIndex: 'currencyCode',
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
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierSiteName').d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
        dataIndex: 'purOrganization',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.salesCreateFlag').d('销售方创建'),
        dataIndex: 'supplierCreateFlag',
        width: 100,
        render: yesOrNoRender,
      },
      // {
      //   title: intl.get('sfin.invoiceBill.model.invoiceBill.createName').d('创建人'),
      //   dataIndex: 'realName',
      //   width: 100,
      //   render: (val, record) => {
      //     return val || record.loginName;
      //   },
      // },
      {
        title: intl.get(`sfin.invoiceBill.model.publicData`).d('发布日期'),
        dataIndex: 'submittedDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'records',
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
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: auditRows.map((n) => n.billHeaderId),
    };
    return (
      <Fragment>
        {customizeTable(
          { code },
          <Table
            bordered
            loading={fetchLoading}
            rowKey="billHeaderId"
            dataSource={auditNCDataSource.content}
            columns={columns}
            pagination={auditNCPagination}
            scroll={{ x: '2000px' }}
            rowSelection={rowSelection}
            onChange={onFetchConsigBill}
          />
        )}
        <ActionHistory {...operationRecordProps} />
      </Fragment>
    );
  }
}
