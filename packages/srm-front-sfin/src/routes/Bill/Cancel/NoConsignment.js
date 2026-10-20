/**
 * NoConsignment - 取消开票申请明细 - 非寄销
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table, Modal } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, debounce } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  thousandBitSeparator,
  thousandBitSeparatorIsNew,
  thousandBitSeparatorDJ,
} from '@/routes/utils';
import QueryForm from './QueryForm';

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
  fetchLoading: loading.effects['bill/fetchNCCancelBill'],
}))
@withRouter
@withCustomize({
  unitCode: ['SFIN.CANCEL_BILL.GRID', 'SFIN.CANCEL_BILL.FILTER'],
})
export default class NoConsignment extends PureComponent {
  form;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
      initLoadData: true,
    };
  }

  componentDidMount() {
    this.querydateRange();
  }

  componentDidUpdate(prevProps) {
    const { custConfig } = this.props;
    // 个性化完成时触发
    const custChanged = prevProps.custLoading === true && this.props.custLoading === false;
    if (custChanged) {
      // 获取业务类别默认值
      const { fields = [] } = custConfig?.['SFIN.CANCEL_BILL.FILTER'] || {};
      const { defaultValue: cuszDateRangeDefault } =
        fields.find((item) => item.fieldCode === 'dateRange') || {};
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ cuszDateRangeDefault }, () => {
        const {
          bill: { cancelBillNCPagination = {} },
          location: { state: { _back } = {} },
        } = this.props;
        const page = isUndefined(_back) ? {} : cancelBillNCPagination;
        this.fetchNoConsignment(page);
      });
    }
  }

  @Bind()
  querydateRange() {
    const { dispatch } = this.props;
    dispatch({ type: 'bill/fetchdateRange' });
  }

  @Bind()
  @Throttle(3000)
  onCancelBill() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    } else {
      const onOk = () => {
        dispatch({
          type: 'bill/cancelBill',
          payload: selectedRows,
        }).then((response) => {
          if (response) {
            this.refreshValue();
            notification.success();
          }
        });
      };
      Modal.confirm({
        title: intl
          .get(`sfin.invoiceBill.view.message.cancelBill`)
          .d('确认取消勾选的开票申请行吗？'),
        onOk: debounce(() => onOk(), 500),
      });
    }
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRows 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchNoConsignment(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { trxDateFrom, trxDateTo, ...formValues } = filterValues;
    const searchData = {
      ...formValues,
      approvedDateFrom:
        filterValues.approvedDateFrom && filterValues.approvedDateFrom.format(DATETIME_MIN),
      approvedDateTo:
        filterValues.approvedDateTo && filterValues.approvedDateTo.format(DATETIME_MAX),
      trxDateFrom: trxDateFrom ? trxDateFrom.format(DATETIME_MIN) : undefined,
      trxDateTo: trxDateTo ? trxDateTo.format(DATETIME_MAX) : undefined,
    };
    dispatch({
      type: 'bill/fetchNCCancelBill',
      payload: {
        page: pageData,
        ...searchData,
        customizeUnitCode: 'SFIN.CANCEL_BILL.GRID,SFIN.CANCEL_BILL.FILTER',
      },
    }).then(() => {
      this.setState({ initLoadData: false });
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
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchNoConsignment(pagination);
  }

  @Bind()
  onHandleFormReset() {
    const { onClearQueryValue } = this.props;
    if (onClearQueryValue) {
      onClearQueryValue();
    }
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
      bill: { cancelBillNCDataSource = {}, cancelBillNCPagination = {}, dateRange = [] },
      fetchLoading,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { selectedRows, cuszDateRangeDefault, initLoadData } = this.state;
    const columns = [
      {
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.billNumAndLineNum')
          .d('开票申请单|行号'),
        dataIndex: 'billNumAndLineNum',
        fixed: 'left',
        width: 160,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.trxAndLineNum').d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        fixed: 'left',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.itemName').d('物料描述'),
        dataIndex: 'itemName',
        fixed: 'left',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.specificationsAndModel').d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 120,
      },
      {
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.invoiceQuantityAvailable')
          .d('可开票数量'),
        dataIndex: 'invoiceQuantityAvailable',
        width: 120,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.unit').d('单位'),
        dataIndex: 'unit',
        width: 80,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.netPrice').d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorDJ(val, record.pricePrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.unitPriceBatch').d('每'),
        dataIndex: 'unitPriceBatch',
        width: 80,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.netAmount').d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: `${intl.get('sfin.invoiceBill.model.invoiceBill.taxRate').d('税率')}（%）`,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.taxIncludedAmount').d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorIsNew(val, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.taxAmount').d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparatorIsNew(val, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.currencyCode').d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
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
        title: intl
          .get('sfin.invoiceBill.model.invoiceBill.asnNumAndAsnLineNum')
          .d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.poNumAndLineNum').d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.displayReleaseNum').d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 80,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.displayLine').d('发运行'),
        dataIndex: 'displayLineLocationNum',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.orderTypeName').d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 100,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.organizationName').d('库存组织'),
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员'),
        dataIndex: 'purAgentName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.trxDate').d('事务日期'),
        dataIndex: 'trxDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.approvedDate').d('审核日期'),
        dataIndex: 'approvedDate',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.salesCreateFlag').d('销售方创建'),
        dataIndex: 'supplierCreateFlag',
        width: 120,
        render: yesOrNoRender,
      },
    ];

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectedRows.map((n) => n.billDetailId),
    };

    return (
      <React.Fragment>
        <QueryForm
          onQueryNoConsignment={this.onQueryNoConsignment}
          onHandleFormReset={this.onHandleFormReset}
          onRef={this.handleBindRef}
          dateRange={dateRange}
          cuszDateRangeDefault={cuszDateRangeDefault}
          customizeFilterForm={customizeFilterForm}
          initLoadData={initLoadData}
        />
        {customizeTable(
          {
            code: 'SFIN.CANCEL_BILL.GRID',
          },
          <Table
            bordered
            loading={fetchLoading}
            rowKey="billDetailId"
            dataSource={cancelBillNCDataSource.content}
            columns={columns}
            pagination={cancelBillNCPagination}
            scroll={{ x: this.scrollWidth(columns, 700) }}
            rowSelection={rowSelection}
            onChange={this.handleStandardTableChange}
          />
        )}
      </React.Fragment>
    );
  }
}
