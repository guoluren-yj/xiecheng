/**
 * index.js - 销项发票池界面
 * @date: 2019-9-27
 * @author: napeng <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { stringify } from 'querystring';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import Search from './Search';
import List from './List';

const inputInvoiceCode = 'sfin.inputInvoice';
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sfin/output-invoice/list' })
@connect(({ outputInvoice, loading }) => ({
  outputInvoice,
  loading: loading.effects['outputInvoice/queryList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.invoiceBill', 'sfin.inputInvoice'],
})
export default class OutputInvoice extends Component {
  componentDidMount() {
    const {
      outputInvoice: { pagination },
    } = this.props;
    this.handleSearch(pagination);
    this.fetchCheckStatusList();
    this.queryValueCode();
  }

  /**
   * 查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const form = this.filterForm;
    form.validateFields((err, values) => {
      if (!err) {
        const params = form.getFieldsValue() || {};
        dispatch({
          type: 'outputInvoice/queryList',
          payload: {
            page,
            ...values,
            billingDateFrom:
              params.billingDateFrom && moment(params.billingDateFrom).format(DATETIME_MIN),
            billingDateTo:
              params.billingDateTo && moment(params.billingDateTo).format(DATETIME_MAX),
          },
        });
      }
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'outputInvoice/queryValueCode',
      payload: {
        status: 'SFIN.ISSUE_INVOICE_STATUS', // 状态
      },
    });
  }

  /**
   * 获取查验状态值级
   */
  @Bind()
  fetchCheckStatusList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/fetchCheckStatusList',
    });
  }

  /**
   * 搜索条件展开收起
   */
  @Bind()
  toggle() {
    // const { outputInvoice } = this.state;
    const {
      outputInvoice: { expend = false },
      dispatch,
    } = this.props;
    dispatch({
      type: 'outputInvoice/updateState',
      payload: { expend: !expend },
    });
  }

  render() {
    const {
      organizationId,
      form,
      loading,
      outputInvoice: { list, pagination, expend, code = {} },
    } = this.props;
    const { status } = code;
    const searchProps = {
      form,
      status,
      outputInvoice: expend,
      onToggle: this.toggle,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      dataSource: list,
      pagination,
      onChange: this.handleSearch,
      loading,
      onInvoiceDetail: this.toInvoiceDetail,
      onToDetail: this.toDetail,
    };
    const params = form.getFieldsValue() || {};
    return (
      <React.Fragment>
        <Header title={intl.get(`${inputInvoiceCode}.model.myTaxInvoice`).d('我开具的税务发票')}>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/output-invoice/export`}
            queryParams={{
              ...filterNullValueObject(params),
              billingDateFrom:
                params.billingDateFrom && moment(params.billingDateFrom).format(DATETIME_MIN),
              billingDateTo:
                params.billingDateTo && moment(params.billingDateTo).format(DATETIME_MAX),
            }}
            otherButtonProps={{ icon: 'export', type: 'primary' }}
          />
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }

  // 查看发票
  @Bind()
  toInvoiceDetail(record) {
    const { dispatch } = this.props;
    const { invoiceTypeCode, taxInvoiceLineId } = record;
    let pathname = '';
    let searchData = {};
    const type = 'output';
    if (invoiceTypeCode && invoiceTypeCode === 'VAT_ELECTRONIC_INVOICE') {
      pathname = `/sfin/output-invoice/elcview`;
      searchData = {
        taxInvoiceLineId,
        type,
      };
    } else if (invoiceTypeCode) {
      pathname = `/sfin/output-invoice/view`;
      searchData = {
        taxInvoiceLineId,
        type,
      };
    } else {
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

  // SRM发票号跳转到其他页面
  @Bind()
  toDetail(record) {
    const { dispatch } = this.props;
    const { invoiceHeaderId } = record;
    const isOutputInvoice = true;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/output-invoice/supplier/detail/${invoiceHeaderId}`,
        search: stringify({ isOutputInvoice }),
      })
    );
  }
}
