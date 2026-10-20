/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isArray, isEmpty } from 'lodash';

import { Content, Header } from 'components/Page';
import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { Bind, Throttle } from 'lodash-decorators';
// import querystring from 'querystring';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import Search from './Search';
import List from './List';

// SMDM.FLAG_REVERSE
const promptCode = 'sfin.payment';
const { confirm } = Modal;
@connect(({ loading = {}, optionToPayInvoice = {} }) => ({
  optionToPayInvoice,
  loading:
    loading.effects['optionToPayInvoice/onFetchList'] ||
    loading.effects['optionToPayInvoice/newDetailList'] ||
    loading.effects['optionToPayInvoice/removeInvoiceOrNott'],
}))
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.onFetchList(); // 查询数据
    this.fetchEnum(); // 查询值集
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'optionToPayInvoice/init',
    });
  }

  /**
   * searchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  onFetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    dispatch({
      type: 'optionToPayInvoice/onFetchList',
      payload: {
        page,
        ...filterValues,
        taxInvoiceDateIssuedFrom:
          filterValues.taxInvoiceDateIssuedFrom &&
          filterValues.taxInvoiceDateIssuedFrom.format('YYYY-MM-DD 00:00:00'),
        taxInvoiceDateIssuedTo:
          filterValues.taxInvoiceDateIssuedTo &&
          filterValues.taxInvoiceDateIssuedTo.format('YYYY-MM-DD 23:59:59'),
        creationDateFrom:
          filterValues.creationDateFrom &&
          filterValues.creationDateFrom.format('YYYY-MM-DD 00:00:00'),
        creationDateTo:
          filterValues.creationDateTo && filterValues.creationDateTo.format('YYYY-MM-DD 23:59:59'),
        customizeUnitCode:
          'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.FILTER,SFIN.PAYMENT_REQUEST_CREATE_DETAIL.GRID',
      },
    });
  }

  /**
   * searchList - 新建跳转
   * @param {object} params - selectedRows
   */
  @Bind()
  @Throttle(1000)
  newDetailList() {
    const { dispatch, history } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'optionToPayInvoice/newDetailList',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        const { paymentHeaderId } = res;
        history.push({
          pathname: `/sfin/create-payment-request/detail/${paymentHeaderId}`,
        });
      }
    });
  }

  /**
   * 移除或撤销事务行
   * @param {Boolean} flag true 移除
   */
  @Bind()
  @Throttle(1000)
  handleRemoveOrNot(flag, needInvoiceFlag, notNeedInvoiceFlag) {
    const { dispatch, organizationId } = this.props;
    const { selectedRows } = this.state;
    if (!isEmpty(needInvoiceFlag) && !isEmpty(notNeedInvoiceFlag)) {
      if (flag) {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.needInvoice`)
            .d('勾选的数据中存在已移除数据'),
        });
      } else {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.notification.notNeedInvoice`)
            .d('勾选的数据中存在未移除数据'),
        });
      }
    } else {
      const interfaceName = flag
        ? '/payment-headers/remove-invoice'
        : '/payment-headers/unremove-invoice';
      const confirmTitle = flag
        ? intl.get(`${promptCode}.view.message.confirm.unInvoice`).d('是否确认移除?')
        : intl.get(`${promptCode}.view.message.confirm.invoice`).d('是否确认撤销移除?');
      confirm({
        title: confirmTitle,
        // content: '',
        onOk: () => {
          dispatch({
            type: 'optionToPayInvoice/removeInvoiceOrNot',
            payload: { interfaceName, createRowKeys: selectedRows, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              this.onFetchList();
            }
          });
        },
      });
    }
  }

  // 选择的数据
  @Bind()
  onSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  render() {
    const {
      optionToPayInvoice,
      loading,
      optionToPayInvoice: { enumMap = {} },
    } = this.props;
    const { selectedRows = [] } = this.state;
    const selectedRowKeys = selectedRows.map((n) => n.invoiceHeaderId);
    const { dataSource = [], pagination = {} } = optionToPayInvoice;
    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.onFetchList,
    };
    const rowSelection = {
      selectedRowKeys: selectedRows.map((i) => i.invoiceHeaderId),
      onChange: this.onSelectedRowChange,
    };
    const listProps = {
      dataSource,
      pagination,
      rowSelection,
      loading,
      onSearch: this.onFetchList,
      onSelectedRowChange: this.onSelectedRowChange,
    };

    const needInvoiceFlag = selectedRows.filter((o) => o.removeFlag === 0);
    const notNeedInvoiceFlag = selectedRows.filter((o) => o.removeFlag === 1);
    return (
      <React.Fragment>
        <Header
          backPath="/sfin/create-payment-request/list"
          title={intl
            .get('sfin.invoiceBill.view.message.optiontopayinvoice')
            .d('到票付款-选择发票')}
        >
          <Button
            disabled={
              (isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) || !isEmpty(notNeedInvoiceFlag)
            }
            icon="plus"
            type="primary"
            onClick={this.newDetailList}
            loading={loading}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button
            icon="close-square-o"
            disabled={isEmpty(selectedRows) || isEmpty(needInvoiceFlag)}
            onClick={() => this.handleRemoveOrNot(true, needInvoiceFlag, notNeedInvoiceFlag)}
            loading={loading}
          >
            {intl.get(`${promptCode}.view.option.remove`).d('移除')}
          </Button>
          <Button
            icon="close-square-o"
            disabled={isEmpty(selectedRows) || isEmpty(notNeedInvoiceFlag)}
            onClick={() => this.handleRemoveOrNot(false, needInvoiceFlag, notNeedInvoiceFlag)}
            loading={loading}
          >
            {intl.get(`${promptCode}.view.option.notRemove`).d('撤销移除')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
