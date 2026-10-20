/**
 * Apply - 应付发票申请
 * @date: 2019-2-19
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, HandExcelExport
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
// import { dateRender } from 'utils/renderer';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';

import FilterForm from './FilterForm';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.payableInvoice';

/**
 * 应付发票申请
 * @extends {Component} - Component
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ payableInvoice, user: { currentUser = {} }, loading }) => ({
  payableInvoice,
  currentUser,
  loading: loading.effects['payableInvoice/fetchMaintain'],
}))
@formatterCollections({
  code: [
    'entity.company',
    'entity.supplier',
    'entity.item',
    'sfin.invoiceBill',
    'sfin.payableInvoice',
  ],
})
@CacheComponent({ cacheKey: '/sfin/payable-invoice-maintain' })
export default class PayableInvoiceMaintain extends Component {
  state = {
    organizationId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   * @param {Object} params 分页参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const form = this.filterForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
      creationDateFrom:
        formValues.creationDateFrom && moment(formValues.creationDateFrom).format(DATETIME_MIN),
      creationDateTo:
        formValues.creationDateTo && moment(formValues.creationDateTo).format(DATETIME_MAX),
    };
    dispatch({
      type: 'payableInvoice/fetchMaintain',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 跳转路由
   * @param {Object} record 行数据
   */
  @Bind()
  handleGoDetail(record = {}) {
    const {
      history,
      currentUser: { id },
    } = this.props;
    const { invoiceHeaderId, createdBy, taxCategory } = record;
    let pathName;
    if (createdBy === id) {
      if (taxCategory === 'CENTRALIZED') {
        pathName = `/sfin/payable-invoice-maintain/centralizedDetail/${invoiceHeaderId}?ecSource=payMaintain`;
      } else if (taxCategory === 'WITH_GOODS') {
        pathName = `/sfin/payable-invoice-maintain/followGoodsDetail/${invoiceHeaderId}`;
      }
    } else if (createdBy !== id) {
      if (taxCategory === 'CENTRALIZED') {
        pathName = `/sfin/payable-invoice-maintain/read-only-centralized-detail/${invoiceHeaderId}?ecSource=payMaintain`;
      } else if (taxCategory === 'WITH_GOODS') {
        pathName = `/sfin/payable-invoice-maintain/read-only-followGoodsDetail/${invoiceHeaderId}`;
      }
    }
    history.push(pathName);
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
      creationDateFrom:
        formValues.creationDateFrom && moment(formValues.creationDateFrom).format(DATETIME_MIN),
      creationDateTo:
        formValues.creationDateTo && moment(formValues.creationDateTo).format(DATETIME_MAX),
    };
    return filterValues;
  }

  render() {
    const {
      loading,
      payableInvoice: { maintainQueryList = [], maintainQueryPagination = {} },
    } = this.props;
    const { organizationId } = this.state;

    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };

    const columns = [
      {
        title: intl.get(`sfin.payableInvoice.model.payableInvoice.invoiceNumber`).d('SRM发票单号'),
        dataIndex: 'invoiceNum',
        width: 150,
        render: (text, record) => <a onClick={() => this.handleGoDetail(record)}>{text}</a>,
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'invoiceStatusMeaning',
        width: 75,
      },
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
        title: intl.get(`${promptCode}.model.payableInvoice.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
      },
      {
        title: intl.get(`sfin.payableInvoice.model.taxIncludedAmountSystem`).d('含税总额(系统)'),
        dataIndex: 'taxIncludedAmountSystem',
        width: 150,
        align: 'right',
        render: (value, record) => {
          return record.priceShieldFlag === 1
            ? record.taxIncludedAmountSystemMeaning
            : thousandBitSeparator(record.taxIncludedAmountSystem, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxAmountSystem`).d('税额(系统)'),
        dataIndex: 'taxAmountSystem',
        width: 150,
        align: 'right',
        render: (value, record) => {
          return record.priceShieldFlag === 1
            ? record.taxAmountSystemMeaning
            : thousandBitSeparator(record.taxAmountSystem, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.taxAmount.invoice`).d('发票总额'),
        dataIndex: 'taxIncludedAmount',
        width: 120,
        align: 'right',
        render: (value, record) => {
          return record.priceShieldFlag === 1
            ? record.taxIncludedAmountMeaning
            : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxAmount.invoice`).d('发票税额'),
        dataIndex: 'taxAmount',
        width: 120,
        align: 'right',
        render: (value, record) => {
          return record.priceShieldFlag === 1
            ? record.taxAmountMeaning
            : thousandBitSeparator(record.taxAmount, record.amountPrecision);
        },
      },
      // {
      //   title: intl.get(`${promptCode}.model.payableInvoice.taxInvoiceNum`).d('税务发票号'),
      //   dataIndex: 'taxInvoiceNum',
      //   width: 150,
      //   render: (text, record) => <a onClick={() => this.handleGoDetail(record)}>{text}</a>,
      // },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.supplierSiteName`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceState`).d('开票方式'),
        dataIndex: 'taxCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.createName`).d('创建人'),
        dataIndex: 'createName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.title.maintainEcInvoiceApply`).d('维护电商发票申请')}
        >
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice/ap-update-export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{ icon: 'export', type: 'primary' }}
          />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            loading={loading}
            rowKey="invoiceHeaderId"
            columns={columns}
            dataSource={maintainQueryList}
            pagination={maintainQueryPagination}
            onChange={this.handleSearch}
            scroll={{ x: this.scrollWidth(columns, 0) }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
