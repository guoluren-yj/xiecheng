/**
 * NoConsignment - 我的采购账单 - 非寄销
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import { filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CacheComponent from 'components/CacheComponent';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';
import QueryForm from './QueryForm';
import ActionHistory from '../Components/ActionHistory';

/**
 * 开票申请单审核
 * @extends {Component} - React.Component
 * @reactProps {Object} bill - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ bill, loading }) => ({
  bill,
  fetchLoading: loading.effects['bill/fetchPurchaseNoConsignment'],
}))
@withRouter
@withCustomize({
  unitCode: ['SFIN.BILL_PURCHASE_LIST.GRID'],
})
@CacheComponent({ cacheKey: '/sfin/bill-purchase' })
export default class NoConsignment extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      recordModal: false,
    };
  }

  componentDidMount() {
    const {
      bill: { purchaseNCPagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const page = isUndefined(_back) ? {} : purchaseNCPagination;
    this.fetchNoConsignment(page);
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchNoConsignment(pageData = {}) {
    const { dispatch, onSetQueryValue } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { purchaseAgentIds, purOrganizationIds } = filterValues;
    const searchData = {
      ...filterValues,
      submittedDateFrom:
        filterValues.submittedDateFrom && filterValues.submittedDateFrom.format(DATETIME_MIN),
      submittedDateTo:
        filterValues.submittedDateTo && filterValues.submittedDateTo.format(DATETIME_MAX),
      approvedDateFrom:
        filterValues.approvedDateFrom && filterValues.approvedDateFrom.format(DATETIME_MIN),
      approvedDateTo:
        filterValues.approvedDateTo && filterValues.approvedDateTo.format(DATETIME_MAX),
      purchaseAgentIds: purchaseAgentIds && purchaseAgentIds.split(','),
      purOrganizationIds: purOrganizationIds && purOrganizationIds.split(','),
    };
    if (onSetQueryValue) {
      onSetQueryValue(searchData);
    }
    dispatch({
      type: 'bill/fetchBillStatus',
      payload: {},
    });
    dispatch({
      type: 'bill/fetchPurchaseNoConsignment',
      payload: {
        page: pageData,
        customizeUnitCode: 'SFIN.BILL_PURCHASE_LIST.GRID,SFIN.BILL_PURCHASE_LIST.MORE_FILTER',
        ...searchData,
      },
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchNoConsignment();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryNoConsignment(queryData = {}) {
    this.fetchNoConsignment(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchNoConsignment(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 跳转路由
   * @param {Object} record 行数据
   */
  @Bind()
  handleGoDetail(record) {
    const { billHeaderId, sourceCode } = record;
    if (sourceCode === 'EC') {
      this.props.history.push(`/sfin/purchase-bill/electronic-mall/${billHeaderId}`);
    } else {
      this.props.history.push(`/sfin/purchase-bill/detail/${billHeaderId}`);
    }
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

  @Bind()
  onHandleFormReset() {
    const { onClearQueryValue } = this.props;
    if (onClearQueryValue) {
      onClearQueryValue();
    }
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      bill: {
        purchaseNCDataSource = {},
        purchaseNCPagination = {},
        code: { BillStatus = [] },
      },
      customizeTable,
      fetchLoading,
      dispatch,
      rowSelection,
    } = this.props;
    const { recordModal, data } = this.state;
    // 过滤新建状态
    // const codes = BillStatus.filter(o => o.value !== 'NEW');
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
        width: 160,
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
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.erpBillNum`).d('ERP对账单号'),
        dataIndex: 'erpBillNum',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierCode').d('供应商代码'),
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
        title: intl.get('sfin.invoiceBill.model.invoiceBill.netAmount').d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        width: 100,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.taxIncludedAmount').d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 100,
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.currencyCode').d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.company').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierCreateFlag').d('供应商创建'),
        dataIndex: 'supplierCreateFlag',
        width: 120,
        render: (val) => {
          return val === 1
            ? intl.get('hzero.common.status.yes')
            : intl.get('hzero.common.status.no');
        },
      },
      {
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.invoiceCompleteFlag')
          .d('是否已完全开票'),
        dataIndex: 'invoiceCompleteFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.createName').d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.submittedDate').d('提交日期'),
        dataIndex: 'submittedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.approvedDate').d('审核日期'),
        dataIndex: 'approvedDate',
        width: 120,
        render: dateRender,
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
        title: intl.get('sfin.invoiceBill.model.invoiceBill.exportStatus').d('导入状态'),
        dataIndex: 'syncStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.errorMessage').d('错误信息'),
        dataIndex: 'syncResponseMsg',
        width: 120,
      },

      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'actionRecord',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.openOperationRecord(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
      },
    ];

    return (
      <React.Fragment>
        <QueryForm
          onQueryNoConsignment={this.onQueryNoConsignment}
          onHandleFormReset={this.onHandleFormReset}
          onRef={this.handleBindRef}
          codes={BillStatus}
        />
        {customizeTable(
          {
            code: 'SFIN.BILL_PURCHASE_LIST.GRID',
          },
          <Table
            rowSelection={rowSelection}
            bordered
            loading={fetchLoading}
            rowKey="billHeaderId"
            dataSource={purchaseNCDataSource.content}
            columns={columns}
            pagination={purchaseNCPagination}
            scroll={{ x: this.scrollWidth(columns, 0) }}
            onChange={this.handleStandardTableChange}
          />
        )}
        <ActionHistory {...operationRecordProps} />
      </React.Fragment>
    );
  }
}
