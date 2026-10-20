/**
 * index.js - 进项发票池
 * @date: 2019-09-19
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { stringify } from 'querystring';
import { SRM_FINANCE } from '_utils/config';
import { routerRedux } from 'dva/router';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import Search from './Search';
import List from './List';

const inputInvoiceMultiple = 'sfin.inputInvoice';

@connect(({ inputInvoice, loading }) => ({
  inputInvoice,
  loading: loading.effects['inputInvoice/fetchMaintain'],
}))
@formatterCollections({
  code: ['sfin.inputInvoice'],
})
export default class PurchaseContactType extends Component {
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      inputInvoice: { maintainQueryPagination = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(maintainQueryPagination);
    } else {
      this.handleSearch();
    }
    this.queryValueCode();
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'inputInvoice/queryValueCode',
      payload: {
        taxTypeList: 'SPRM.PR_INVOICE_TYPE', // 发票类型
        status: 'SFIN.ISSUE_INVOICE_STATUS', // 状态
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
      type: 'inputInvoice/fetchMaintain',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const formValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { billingDateFrom, billingDateTo, approveDateFrom, approveDateTo } = formValues;
    const filterValues = {
      ...formValues,
      billingDateFrom: billingDateFrom && moment(billingDateFrom).format(DATETIME_MIN),
      billingDateTo: billingDateTo && moment(billingDateTo).format(DATETIME_MAX),
      approveDateFrom: approveDateFrom && moment(approveDateFrom).format(DATETIME_MIN),
      approveDateTo: approveDateTo && moment(approveDateTo).format(DATETIME_MAX),
    };
    return filterValues;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { purchaseContractType } = this.props;
    const { dataSource = [] } = purchaseContractType;
    dataSource.forEach((item) => {
      item.$form.resetFields();
    });
  }

  /**
   *  SRM发票号列跳转到"非寄销发票明细"
   */
  @Bind()
  redirectInvoiceSummary(invoiceHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/input-invoice/summary/${invoiceHeaderId}`,
        search: invoiceHeaderId
          ? stringify({ invoiceHeaderId, isInputInvoice: true })
          : stringify({}),
      })
    );
  }

  /**
   *  发票查看，根据发票类型跳转到不同的发票样式页面
   */
  @Bind()
  goToOtherInvoicePage(record) {
    const { dispatch } = this.props;
    const { invoiceTypeCode, taxInvoiceLineId } = record;
    let pathname = '';
    let searchData = {};
    const type = 'input';
    switch (invoiceTypeCode) {
      case 'VAT_ORDINARY_INVOICE': // 增值税普通发票
      case 'VAT_SPECIAL_INVOICE': // 增值税专用发票
        pathname = `/sfin/input-invoice/view`;
        searchData = {
          taxInvoiceLineId,
          type,
          // isPreview: true,
        };
        break;
      case 'VAT_ELECTRONIC_INVOICE': // 电子发票
        pathname = `/sfin/input-invoice/elcview`;
        searchData = {
          taxInvoiceLineId,
          type,
        };
        break;
      default:
        pathname = '';
    }
    if (pathname !== '') {
      dispatch(
        routerRedux.push({
          pathname,
          search: stringify({ ...searchData }),
        })
      );
    }
  }

  render() {
    const organizationId = getCurrentOrganizationId();
    const {
      loading,
      inputInvoice: { maintainQueryList = [], maintainQueryPagination = {}, code = {} },
    } = this.props;
    const { taxTypeList = [], status = [] } = code;
    const searchProps = {
      onFetchList: this.handleSearch,
      onRef: this.handleBindRef,
      taxTypeList,
      status,
    };
    const listProps = {
      maintainQueryList,
      loading,
      onChange: this.handleSearch,
      pagination: maintainQueryPagination,
      redirectInvoiceSummary: this.redirectInvoiceSummary,
      goToOtherInvoicePage: this.goToOtherInvoicePage,
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get(`${inputInvoiceMultiple}.model.myReceiveTaxInvoice`)
            .d('我收到的税务发票')}
        >
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/input-invoice/export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{ icon: 'export', type: 'primary' }}
          />
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
