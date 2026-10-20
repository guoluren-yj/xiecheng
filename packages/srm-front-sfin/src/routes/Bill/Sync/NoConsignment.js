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
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateTimeRender } from 'utils/renderer';
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
  fetchLoading: loading.effects['bill/fetchSycnPurchaseNoConsignment'],
}))
@withRouter
@withCustomize({
  unitCode: ['SFIN.BILL_SYNC.LIST.GRID'],
})
export default class NoConsignment extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.props.onRef(this);

    this.state = {
      recordModal: false,
    };
  }

  componentDidMount() {
    const {
      bill: { purchaseSyncNCPagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const page = isUndefined(_back) ? {} : purchaseSyncNCPagination;
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
        filterValues.submittedDateTo && filterValues.submittedDateTo.format(DATETIME_MIN),
      approvedDateFrom:
        filterValues.approvedDateFrom && filterValues.approvedDateFrom.format(DATETIME_MIN),
      approvedDateTo:
        filterValues.approvedDateTo && filterValues.approvedDateTo.format(DATETIME_MIN),
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
      type: 'bill/fetchSycnPurchaseNoConsignment',
      payload: {
        page: pageData,
        customizeUnitCode: 'SFIN.BILL_SYNC.LIST.GRID',
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
        purchaseSyncNCDataSource = {},
        purchaseSyncNCPagination = {},
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
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.exportStatus').d('导入状态'),
        dataIndex: 'syncStatusMeaning',
        width: 120,
      },

      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.errorMessage').d('错误信息'),
        dataIndex: 'syncResponseMsg',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.billNum').d('开票单号'),
        dataIndex: 'displayBillNum',
        width: 160,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.sync.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.company').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },

      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.sync.supplier.supplierCode')
          .d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.supplierName').d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.purAgentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.purchaseOrgName').d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },

      {
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.sync.supplier.supplierCreateFlag')
          .d('供应商创建'),
        dataIndex: 'supplierCreateFlag',
        width: 120,
        render: (val) => {
          return val === 1
            ? intl.get('hzero.common.status.yes')
            : intl.get('hzero.common.status.no');
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.createName').d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.sync.approvedDate').d('审核日期'),
        dataIndex: 'approvedDate',
        width: 120,
        render: dateTimeRender,
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
            code: 'SFIN.BILL_SYNC.LIST.GRID',
          },
          <Table
            rowSelection={rowSelection}
            bordered
            loading={fetchLoading}
            rowKey="billHeaderId"
            dataSource={purchaseSyncNCDataSource.content}
            columns={columns}
            pagination={purchaseSyncNCPagination}
            scroll={{ x: this.scrollWidth(columns, 0) }}
            onChange={this.handleStandardTableChange}
          />
        )}
        <ActionHistory {...operationRecordProps} />
      </React.Fragment>
    );
  }
}
