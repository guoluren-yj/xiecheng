/**
 * AutoAccount - 自动对账
 * @date: 2019-2-18
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';

import FilterForm from './FilterForm';
import NoAccountTable from './NoAccountTable';
import AlreadyAccountTable from './AlreadyAccountTable';

const promptCode = 'sfin.payableInvoice';

/**
 * 自动对账
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} autoAccount - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ autoAccount }) => ({
  autoAccount,
}))
@formatterCollections({
  code: ['entity.company', 'entity.supplier', 'entity.item', 'sfin.payableInvoice', 'sfin.common'],
})
export default class AutoAccount extends PureComponent {
  state = {
    activeKey: 'noAccount',
    organizationId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    const { activeKey } = this.state;
    this.queryValueCode();
    this.handleTabsChange(activeKey);
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'autoAccount/queryValueCode',
      payload: {
        salesStatusList: 'SFIN.AUTO_BILL.AFTER_SALE_STATUS', // 售后状态
        invoiceStatusList: 'SCEC.EC_PO.INVOICE_STATUS', // 开票方式
        srmInvoiceStatusList: 'SFIN.INVOICE_STATUS', // SRM发票申请状态
        issueStatusList: 'SFIN.INVOICE_ISSUE_STATUS', // 税务发票开具状态
      },
    });
  }

  /**
   * 查询未对账
   * @param {Object} params 分页参数
   */
  @Bind()
  handleSearchNoAccount(params = {}) {
    const { dispatch } = this.props;
    const form = this.noFilterForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
      deliverTimeStart:
        formValues.deliverTimeStart && moment(formValues.deliverTimeStart).format(DATETIME_MIN),
      deliverTimeEnd:
        formValues.deliverTimeEnd && moment(formValues.deliverTimeEnd).format(DATETIME_MAX),
      ecFinishTimeStart:
        formValues.ecFinishTimeStart && moment(formValues.ecFinishTimeStart).format(DATETIME_MIN),
      ecFinishTimeEnd:
        formValues.ecFinishTimeEnd && moment(formValues.ecFinishTimeEnd).format(DATETIME_MAX),
    };
    dispatch({
      type: 'autoAccount/fetchNoAccount',
      payload: {
        page: params,
        ...filterValues,
        customizeUnitCode:
          'SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_FILTER,SFIN.AUTO_ACCOUNT_LIST.NO_ACCOUNT_GRID',
      },
    });
  }

  /**
   * 查询已对账
   * @param {Object} params 分页参数
   */
  @Bind()
  handleSearchAlreadyAccount(params = {}) {
    const { dispatch } = this.props;
    const form = this.alreadyFilterForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
      deliverTimeStart:
        formValues.deliverTimeStart && moment(formValues.deliverTimeStart).format(DATETIME_MIN),
      deliverTimeEnd:
        formValues.deliverTimeEnd && moment(formValues.deliverTimeEnd).format(DATETIME_MAX),
      ecFinishTimeStart:
        formValues.ecFinishTimeStart && moment(formValues.ecFinishTimeStart).format(DATETIME_MIN),
      ecFinishTimeEnd:
        formValues.ecFinishTimeEnd && moment(formValues.ecFinishTimeEnd).format(DATETIME_MAX),
    };
    dispatch({
      type: 'autoAccount/fetchAlreadyAccount',
      payload: {
        page: params,
        ...filterValues,
        customizeUnitCode:
          'SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_FILTER,SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_GRID',
      },
    });
  }

  @Bind()
  handleTabsChange(activeKey) {
    const {
      autoAccount: { noAccountpagination = {}, alreadyAccountPagination = {} },
    } = this.props;
    if (activeKey === 'noAccount') {
      this.handleSearchNoAccount(noAccountpagination);
    } else {
      this.handleSearchAlreadyAccount(alreadyAccountPagination);
    }
    this.setState({ activeKey });
  }

  /**
   *
   * @param {*} ref 子组件对象
   */
  @Bind()
  handleBindRef(ref) {
    const { activeKey } = this.state;
    if (activeKey === 'noAccount') {
      this.noFilterForm = ref.props.form;
    } else {
      this.alreadyFilterForm = ref.props.form;
    }
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { activeKey } = this.state;
    const thisForm = activeKey === 'noAccount' ? this.noFilterForm : this.alreadyFilterForm;
    const formValues = isUndefined(thisForm)
      ? {}
      : filterNullValueObject(thisForm.getFieldsValue());
    const customizeUnitCode =
      activeKey === 'noAccount'
        ? 'SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_FILTER,SFIN.AUTO_ACCOUNT_LIST.NO_ACCOUNT_GRID'
        : 'SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_FILTER,SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_GRID';
    const filterValues = {
      ...formValues,
      deliverTimeStart:
        formValues.deliverTimeStart && moment(formValues.deliverTimeStart).format(DATETIME_MIN),
      deliverTimeEnd:
        formValues.deliverTimeEnd && moment(formValues.deliverTimeEnd).format(DATETIME_MAX),
      ecFinishTimeStart:
        formValues.ecFinishTimeStart && moment(formValues.ecFinishTimeStart).format(DATETIME_MIN),
      ecFinishTimeEnd:
        formValues.ecFinishTimeEnd && moment(formValues.ecFinishTimeEnd).format(DATETIME_MAX),
      customizeUnitCode,
    };
    return filterValues;
  }

  render() {
    const {
      autoAccount: { code = {} },
    } = this.props;
    const {
      salesStatusList = [],
      invoiceStatusList = [],
      srmInvoiceStatusList = [],
      issueStatusList = [],
    } = code;
    const { activeKey, organizationId } = this.state;

    const filterProps = {
      salesStatusList,
      invoiceStatusList,
      srmInvoiceStatusList,
      issueStatusList,
      onSearch:
        activeKey === 'noAccount' ? this.handleSearchNoAccount : this.handleSearchAlreadyAccount,
      onRef: this.handleBindRef,
      activeKey,
    };
    const requestUrl =
      activeKey === 'noAccount'
        ? `${SRM_FINANCE}/v1/${organizationId}/auto-bill/non-bill-export`
        : `${SRM_FINANCE}/v1/${organizationId}/auto-bill/bill-export`;
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.title.autoBill`).d('自动对账')}>
          <ExcelExport
            requestUrl={requestUrl}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{ icon: 'export', type: 'primary' }}
          />
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.message.tab.noAccount`).d('未对账')}
              key="noAccount"
            >
              <div className="table-list-search">
                <FilterForm {...filterProps} />
              </div>
              <NoAccountTable onTableChange={this.handleSearchNoAccount} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`${promptCode}.view.message.tab.alreadyAccount`).d('已对账')}
              key="alreadyAccount"
            >
              <div className="table-list-search">
                <FilterForm {...filterProps} />
              </div>
              <AlreadyAccountTable onTableChange={this.handleSearchAlreadyAccount} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
