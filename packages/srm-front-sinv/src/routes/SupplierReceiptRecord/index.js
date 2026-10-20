/*
 * index.js - 客户收货记录
 * @date: 2018-12-29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isFunction } from 'lodash';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Tooltip } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz';
import { SRM_SPUC } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';

import Search from './Search';
import List from './List';

const { TabPane } = Tabs;
function getPastHalfYear(currentDate = moment()) {
  const currentDateTime = isFunction(currentDate.valueOf) ? currentDate.valueOf() : null;
  if (!currentDateTime) {
    return;
  }
  // 将半年的时间单位换算成毫秒
  const halfYear = ((currentDate.isLeapYear() ? 366 : 365) / 4) * 24 * 3600 * 1000;
  const pastResult = currentDateTime - halfYear; // 半年前的时间（毫秒单位）
  return moment(pastResult);
}
/**
 * 供应商送货单列表查询
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierReceiptRecord - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({
  code: [
    'sinv.supplierReceiptRecord',
    'sinv.purchaseReceiptRecord',
    'sinv.common',
    'entity.customer',
    'entity.item',
    'entity.organization',
    'sinv.supplierDelivery',
    'sinv.receiptExecution',
    'entity.supplier',
  ],
})
@withCustomize({
  unitCode: ['SINV.SUPPLIER_RECEIPT_RECORD.LINE_BASIC', 'SINV.SUPPLIER_RECEIPT_RECORD.FILTER'],
})
@connect(({ loading = {}, supplierReceiptRecord }) => ({
  loading: loading.effects['supplierReceiptRecord/queryList'],
  loadingAsnTransaction: loading.effects['supplierReceiptRecord/queryReceiveTransactionASNDetails'],
  loadingTransaction: loading.effects['supplierReceiptRecord/queryReceiveTransactionDetails'],
  supplierReceiptRecord,
}))
export default class SupplierReceiptRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      currentTabKey: 'basicInfo',
    };
    this.fetchList = this.fetchList.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    if (this.searchForm) {
      this.searchForm.setFieldsValue({ trxDateFrom: getPastHalfYear() });
    }
    dispatch({
      type: 'supplierReceiptRecord/fetchEnumMap',
    });
    this.fetchList();
  }

  state = {
    dataSource: [],
    pagination: {},
  };

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = [
      'trxDateFrom',
      'trxDateTo',
      'realityReceiveDateStart',
      'realityReceiveDateEnd',
    ];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} page - 分页
   */
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const fieldsValue = (this.searchForm && this.searchForm.getFieldsValue()) || {};
    const handleFormValues = this.handleFormQuery(fieldsValue);
    dispatch({
      type: 'supplierReceiptRecord/queryList',
      payload: {
        page,
        ...handleFormValues,
        customizeUnitCode:
          'SINV.SUPPLIER_RECEIPT_RECORD.LINE_BASIC,SINV.SUPPLIER_RECEIPT_RECORD.FILTER',
      },
    }).then((res) => {
      const { dataSource, pagination } = res;
      this.setState({
        dataSource,
        pagination,
      });
    });
  }

  /**
   * fetchReceiveTransactionDetails - 查看事务明细列表数据
   * @param {Object} payload - 查询参数
   */
  fetchReceiveTransactionDetails(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'supplierReceiptRecord/queryReceiveTransactionDetails', params });
  }

  /**
   * fetchReceiveTransactionASNDetails - 查看ASN事务明细列表数据
   * @param {Object} payload - 查询参数
   */
  fetchReceiveTransactionASNDetails(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'supplierReceiptRecord/queryReceiveTransactionASNDetails', params });
  }

  /**
   * 分页修改重新查询
   * @param {Object} page
   * @memberof SupplierReceiptRecord
   */
  onTableChange(page) {
    this.fetchList(page);
  }

  /**
   * tab切换
   * @param {String} key
   * @memberof SupplierReceiptRecord
   */
  @Bind()
  listTabChange(key) {
    this.setState({
      currentTabKey: key,
    });
  }

  render() {
    const {
      loading,
      loadingAsnTransaction,
      loadingTransaction,
      supplierReceiptRecord: { enumMap, listQueryParams },
      customizeForm = () => {},
      customizeTable = () => {},
    } = this.props;
    const { dataSource, pagination, tenantId, currentTabKey } = this.state;
    const searchProps = {
      enumMap,
      customizeForm,
      onRef: (node) => {
        this.searchForm = node.props.form;
      },
      fetchList: this.fetchList,
    };
    const tableProps = {
      loading,
      dataSource,
      pagination,
      customizeTable,
      loadingAsnTransaction,
      loadingTransaction,
      tabKey: currentTabKey,
      onChange: this.onTableChange.bind(this),
      fetchReceiveTransactionDetails: this.fetchReceiveTransactionDetails.bind(this),
      fetchReceiveTransactionASNDetails: this.fetchReceiveTransactionASNDetails.bind(this),
    };
    const otherButtonProps = {
      type: 'c7n-pro',
      icon: 'export',
      permissionList: [
        {
          code: 'srm.logistics.stock.supplier-receipt-record.button.export',
          type: 'c7n-pro',
        },
      ],
    };

    const toolTitle = intl
      .get(`sinv.purchaseReceiptRecord.view.title.exportTip`)
      .d(
        '当查询条件“事务日期”为空时，默认仅导出六个月内的收货数据。如需导出更多数据，请在查询条件”事务日期从“输入够早的日期，如2000-01-01。'
      );

    return (
      <Fragment>
        <Header
          title={intl
            .get(`sinv.supplierReceiptRecord.view.title.supplierReceiptRecord`)
            .d('客户收货记录')}
        >
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.logistics.stock.supplier-receipt-record.ps.button.newexport',
                  type: 'c7n-pro',
                  // funcType: 'flat',
                },
              ],
            }}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/rcv-trx-line/for-supplier/export/new`}
            queryParams={listQueryParams}
            templateCode="SPUC_SINV_TRX_FOR_SUPPLIER_EXPORT"
            buttonText={
              <Tooltip placement="bottom" title={toolTitle}>
                {intl.get('sinv.supplierReceiptRecord.view.button.newExport').d('新版导出')}
              </Tooltip>
            }
          />
          <ExcelExport
            otherButtonProps={otherButtonProps}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/rcv-trx-line/for-supplier/export`}
            queryParams={listQueryParams}
            buttonText={
              <Tooltip placement="bottom" title={toolTitle}>
                {intl.get('hzero.common.button.export').d('导出')}
              </Tooltip>
            }
          />
        </Header>
        <Content>
          <Search {...searchProps} />
          <Tabs onTabClick={this.listTabChange} defaultActiveKey="basicInfo" animated={false}>
            <TabPane
              tab={intl.get(`sinv.purchaseReceiptRecord.view.title.basicInfo`).d('基本信息')}
              key="basicInfo"
            >
              <List {...tableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.purchaseReceiptRecord.view.title.deliveryInfo`).d('送货单信息')}
              key="deliveryInfo"
            >
              <List {...tableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.purchaseReceiptRecord.view.title.financeInfo`).d('财务信息')}
              key="financeInfo"
            >
              <List {...tableProps} />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
