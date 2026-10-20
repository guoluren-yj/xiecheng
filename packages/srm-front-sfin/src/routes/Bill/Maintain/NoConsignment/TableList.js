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
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import ActionHistory from '../../Components/ActionHistory';
import { thousandBitSeparator } from '@/routes/utils';

@withRouter
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@withCustomize({
  unitCode: ['SFIN.BILL_MAINTAIN_LIST.GRID'],
})
export default class TableList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { recordModal: false };
  }

  @Bind()
  toDetail(record = {}) {
    this.props.history.push({
      pathname: `/sfin/bill-maintain/detail/${record.billHeaderId}`,
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
      loading,
      maintainConsigDataSource = {},
      maintainConsigPagination = {},
      onFetchConsigBill,
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
    };
    const columns = [
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号'),
        dataIndex: 'displayBillNum',
        width: 200,
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
        title: intl.get('sfin.invoiceBill.model.invoiceBill.companyName').d('客户公司'),
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
        dataIndex: 'purchaseAgent',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.salesCreateFlag').d('销售方创建'),
        dataIndex: 'supplierCreateFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.createName').d('创建人'),
        dataIndex: 'realName',
        width: 100,
        render: (val, record) => {
          return val || record.loginName;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
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
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SFIN.BILL_MAINTAIN_LIST.GRID',
          },
          <Table
            pagination={maintainConsigPagination}
            dataSource={maintainConsigDataSource.content || []}
            rowKey="billHeaderId"
            columns={columns}
            scroll={{ x: 2030 }}
            loading={loading}
            bordered
            onChange={(page) => onFetchConsigBill(page)}
            rowSelection={rowSelection}
          />
        )}
        <ActionHistory {...operationRecordProps} />
      </Fragment>
    );
  }
}
