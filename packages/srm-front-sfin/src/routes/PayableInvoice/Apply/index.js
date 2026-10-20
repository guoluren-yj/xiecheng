/**
 * Apply - 应付发票申请
 * @date: 2019-2-19
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import notification from 'utils/notification';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';

import FilterForm from './FilterForm';

const { confirm } = Modal;

const promptCode = 'sfin.payableInvoice';

/**
 * 应付发票申请
 * @extends {Component} - Component
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['entity.company', 'entity.supplier', 'entity.item', 'sfin.payableInvoice'],
})
@withCustomize({
  unitCode: ['SFIN.ORDER_CREAT_LIST.FILTER', 'SFIN.ORDER_CREAT_LIST.GRID'],
})
@connect(({ payableInvoice, loading }) => ({
  payableInvoice,
  loading: loading.effects['payableInvoice/fetchCreate'],
}))
@CacheComponent({ cacheKey: '/sfin/payable-invoice-apply' })
export default class PayableInvoiceApply extends Component {
  state = {
    // selectedRows: [],
    selectedRowKeys: [],
    organizationId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    // this.handleSearch();
    this.queryValueCode();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && this.props.custLoading !== prevProps.custLoading) {
      this.handleSearch();
    }
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payableInvoice/queryValueCode',
      payload: {
        salesStatusList: 'SFIN.AUTO_BILL.AFTER_SALE_STATUS', // 售后状态
        invoiceStatusList: 'SCEC.EC_PO.INVOICE_STATUS', // 开票方式
        taxTypeList: 'SFIN.TAX_TYPE', // 发票类型
        invoiceType: 'SMAL.INVOICE_TYPE',
      },
    });
  }

  /**
   * 查询
   * @param {Object} params 分页参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = this.handleGetFormValue();
    dispatch({
      type: 'payableInvoice/fetchCreate',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: 'SFIN.ORDER_CREAT_LIST.FILTER,SFIN.ORDER_CREAT_LIST.GRID',
      },
    });
  }

  /**
   * 勾选table
   * @param {Array} selectedRows table数组
   */
  @Bind()
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 创建发票
   */
  @Bind()
  handleCreate() {
    const { dispatch, history } = this.props;
    // const { selectedRows } = this.state;
    const { selectedRowKeys } = this.state;
    confirm({
      title: intl.get(`${promptCode}.view.message.confirm.create`).d('是否创建发票?'),
      // content: '',
      onOk: () => {
        dispatch({
          type: 'payableInvoice/createPayableInvoice',
          // payload: selectedRows.map(o => o.ecPoSubHeaderId),
          payload: selectedRowKeys,
        }).then((res) => {
          if (!isEmpty(res)) {
            notification.success();
            // this.setState({ selectedRows: [] });
            this.setState({ selectedRowKeys: [] });
            const { invoiceHeaderId, taxCategory } = res;
            let pathName = '';
            if (taxCategory === 'CENTRALIZED') {
              pathName = `/sfin/payable-invoice-apply/centralizedDetail/${invoiceHeaderId}?ecSource=payCreate`;
            } else if (taxCategory === 'WITH_GOODS') {
              pathName = `/sfin/payable-invoice-apply/followGoodsDetail/${invoiceHeaderId}`;
            }
            history.push(pathName);
          } else {
            notification.warning({
              message: intl
                .get(`${promptCode}.message.illegalCreationUnsuccess`)
                .d('非法的创建, 没有创建成功！'),
            });
          }
        });
      },
    });
  }

  /**
   * 跳转路由
   * @param {Object} record 行数据
   */
  @Bind()
  handleGoDetail(record) {
    const { ecPoSubHeaderId } = record;
    this.props.history.push(`/sfin/payable-invoice-apply/order-detail/${ecPoSubHeaderId}`);
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
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const formValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const filterValues = {
      ...formValues,
      deliverTimeFrom:
        formValues.deliverTimeFrom && moment(formValues.deliverTimeFrom).format(DATETIME_MIN),
      deliverTimeTo:
        formValues.deliverTimeTo && moment(formValues.deliverTimeTo).format(DATETIME_MAX),
      ecFinishTimeStart:
        formValues.ecFinishTimeStart && moment(formValues.ecFinishTimeStart).format(DATETIME_MIN),
      ecFinishTimeEnd:
        formValues.ecFinishTimeEnd && moment(formValues.ecFinishTimeEnd).format(DATETIME_MAX),
      customizeUnitCode: 'SFIN.ORDER_CREAT_LIST.GRID',
    };
    return filterValues;
  }

  render() {
    const {
      customizeFilterForm,
      customizeTable,
      loading = false,
      payableInvoice: { code = {}, applyQueryList = [], applyQueryPagination = {} },
    } = this.props;
    const { salesStatusList = [], invoiceStatusList = [], invoiceType = [] } = code;
    // const { selectedRows, organizationId } = this.state;
    const { selectedRowKeys, organizationId } = this.state;

    const filterProps = {
      invoiceType,
      salesStatusList,
      invoiceStatusList,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
      code: 'SFIN.ORDER_CREAT_LIST.FILTER',
    };

    const columns = [
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoNum`).d('父订单号'),
        dataIndex: 'ecPoNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号'),
        dataIndex: 'ecPoSubNum',
        width: 150,
        render: (text, record) => <a onClick={() => this.handleGoDetail(record)}>{text}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.showPoNum`).d('订单编号'),
        dataIndex: 'displayPoNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.poTypeName`).d('订单类型'),
        dataIndex: 'poTypeName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.displayTrxNumber`).d('事务编号'),
        dataIndex: 'displayTrxNumber',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.currency`).d('币种'),
        dataIndex: 'currency',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceTypeName`).d('发票类型'),
        dataIndex: 'invoiceTypeName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceState`).d('开票方式'),
        dataIndex: 'invoiceStateMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.afterSalesStatus`).d('售后状态'),
        dataIndex: 'afterSalesStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.deliverTime`).d('妥投时间'),
        dataIndex: 'deliverTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecFinishTime`).d('订单完成时间'),
        dataIndex: 'ecFinishTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.sourceCode`).d('数据来源代码'),
        dataIndex: 'sourceCode',
        width: 200,
      },
      {
        title: intl
          .get(`${promptCode}.model.payableInvoice.externalSystemCode`)
          .d('外部来源系统代码'),
        dataIndex: 'externalSystemCode',
        width: 150,
      },
    ];

    const rowSelection = {
      // selectedRowKeys: selectedRows.map(o => o.ecPoSubHeaderId),
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.title.createEcInvoiceApply`).d('创建电商发票申请')}
        >
          <Button
            icon="plus"
            type="primary"
            // disabled={isEmpty(selectedRows)}
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleCreate}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice/ap-create-export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{ icon: 'export', type: '' }}
          />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            { code: 'SFIN.ORDER_CREAT_LIST.GRID' },
            <Table
              bordered
              loading={loading}
              rowKey="ecPoSubHeaderId"
              columns={columns}
              dataSource={applyQueryList}
              pagination={applyQueryPagination}
              rowSelection={rowSelection}
              onChange={this.handleSearch}
              scroll={{ x: this.scrollWidth(columns, 0) }}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
