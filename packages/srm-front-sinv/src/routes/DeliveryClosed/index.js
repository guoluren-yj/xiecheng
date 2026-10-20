/*
 * index - 送货单关闭
 * @date: 2018-12-06 14:25:03
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
// import { SRM_SPUC } from '_utils/config';

import OperationRecord from '../components/OperationRecord';
import Search from './Search';
import List from './List';

/**
 * index - 送货单关闭
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} fetchOperationRecordListLoading - 获取操作记录
 * @reactProps {!boolean} fetchListLoading - 送货单关闭列表
 * @reactProps {!boolean} resyncDeliveryOrderLoading - 重新同步送货单
 * @reactProps {!boolean} closeDeliveryOrderLoading - 关闭送货单
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: [
    'SODR.DELIVERY_CLOSED.FILTER',
    'SODR.DELIVERY_CLOSED.LIST',
    'SODR.DELIVERY_CLOSED.LIST_BTN',
  ],
})
@connect(({ loading, deliveryClosed }) => ({
  fetchOperationRecordListLoading: loading.effects['sendOrder/fetchOperationRecordList'],
  fetchListLoading: loading.effects['deliveryClosed/queryDeliveryClosedList'],
  resyncDeliveryOrderLoading: loading.effects['deliveryClosed/resyncDeliveryOrder'],
  closeDeliveryListOrderLoading: loading.effects['deliveryClosed/closeDeliveryListOrder'],
  deliveryClosed,
}))
@formatterCollections({
  code: [
    'sinv.deliveryClosed',
    'entity.supplier',
    'entity.customer',
    'entity.roles',
    'entity.company',
    'sinv.common',
    'scec.MinimumOrderAmountModal',
    'spfm.common',
    'scec.configServer',
    'scec.common',
    'sinv.purchaseReception',
    'hzero.common',
  ],
})
export default class DeliveryClosed extends PureComponent {
  state = {
    operationRecordModalVisible: false, // 修改操作记录模态框
    selectedListRowKeys: [],
    selectedRows: [],
    organizationId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    if (_back !== -1) {
      this.props.dispatch({
        type: 'deliveryClosed/init',
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
      deliveryClosed: { closeListPagination = {} },
    } = this.props;
    const custLoadingFlag = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingFlag) {
      if (_back === -1) {
        this.handleSearch(closeListPagination);
      } else {
        this.handleSearch();
      }
    }
  }

  /**
   *
   * 修改操作记录可见
   * @memberof deliveryApproved
   * @param {Boolean} flag
   */
  @Bind()
  handleOperationRecordVisible(flag, operationRecordId) {
    this.setState({
      operationRecordId,
      operationRecordModalVisible: !!flag,
    });
  }

  /**
   * 列表查询
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = (this.form && filterNullValueObject(this.form.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues);
    const { expectedArriveDateFrom, expectedArriveDateTo } = filterValues;
    if (
      expectedArriveDateFrom &&
      expectedArriveDateTo &&
      expectedArriveDateTo.isBefore(expectedArriveDateFrom, 'time')
    ) {
      notification.warning({
        message: intl
          .get('hzero.common.validation.date.after', {
            startDate: intl
              .get(`sinv.common.model.common.expectedArriveDateFrom`)
              .d('预计到货日期从'),
            endDate: intl.get(`sinv.common.model.common.expectedArriveDateTo`).d('预计到货日期至'),
          })
          .d('到货日期从不晚于到货日期至'),
      });
    } else {
      dispatch({
        type: 'deliveryClosed/queryDeliveryClosedList',
        payload: {
          page,
          ...handleFormValues,
          customizeUnitCode: 'SODR.DELIVERY_CLOSED.FILTER,SODR.DELIVERY_CLOSED.LIST',
        },
      });
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const dateArray = ['creationDateFrom', 'creationDateTo', 'shipDateFrom', 'shipDateTo'];
    const dateTimeArray = ['expectedArriveDateFrom', 'expectedArriveDateTo'];
    dateArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    dateTimeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 重新同步
   * @memberof resyncDeliveryOrder
   */
  @Bind()
  resyncDeliveryOrder() {
    const {
      dispatch,
      deliveryClosed: { closeList, closeListPagination = {} },
    } = this.props;
    const { selectedListRowKeys } = this.state;
    if (selectedListRowKeys.length > 0) {
      const resyncOrders = closeList
        .filter((item) => selectedListRowKeys.indexOf(item.asnHeaderId) >= 0)
        .map((item) => {
          const {
            asnHeaderId,
            _token,
            objectVersionNumber,
            receiveStatus,
            asnStatus,
            submitSyncStatus,
            asnNum,
          } = item;
          return {
            objectVersionNumber,
            _token,
            asnHeaderId,
            receiveStatus,
            asnStatus,
            submitSyncStatus,
            asnNum,
          };
        });
      dispatch({
        type: 'deliveryClosed/resyncDeliveryOrder',
        payload: resyncOrders,
      }).then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.handleSearch(closeListPagination);
          this.setState({ selectedListRowKeys: [] });
        }
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   *
   * 关闭送货单
   * @memberof closeDeliveryOrder
   */
  @Bind()
  closeDeliveryOrder() {
    const {
      dispatch,
      deliveryClosed: { closeList, closeListPagination = {} },
    } = this.props;
    const { selectedListRowKeys } = this.state;
    if (selectedListRowKeys.length > 0) {
      const closeOrders = closeList
        .filter((item) => selectedListRowKeys.indexOf(item.asnHeaderId) >= 0)
        .map((item) => {
          const {
            asnHeaderId,
            _token,
            objectVersionNumber,
            receiveStatus,
            asnStatus,
            submitSyncStatus,
            asnNum,
          } = item;
          return {
            objectVersionNumber,
            _token,
            asnHeaderId,
            receiveStatus,
            asnStatus,
            submitSyncStatus,
            asnNum,
          };
        });
      Modal.confirm({
        title: intl.get('sinv.common.model.common.confirmClose').d('是否确认关闭送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: 'deliveryClosed/closeDeliveryListOrder',
            payload: closeOrders,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              this.handleSearch(closeListPagination);
              this.setState({ selectedListRowKeys: [] });
            }
          });
        },
      });
    }
  }

  /**
   *
   * @param {object} ref - Search子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 选择规则
   * @param {array} selectedRowKeys
   */
  @Bind()
  handleRowSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedListRowKeys: selectedRowKeys, selectedRows });
  }

  /**
   *  订单详情页
   * @param {string} asnHeaderId
   * @memberof deliveryClosed
   */
  @Bind()
  linkToDetail(asnHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sinv/delivery-closed/detail/${asnHeaderId}`,
      })
    );
  }

  render() {
    const {
      dispatch,
      match,
      customizeBtnGroup,
      customizeFilterForm,
      customizeTable,
      fetchOperationRecordListLoading,
      fetchListLoading,
      resyncDeliveryOrderLoading,
      closeDeliveryListOrderLoading,
      deliveryClosed: { closeList = [], enumMap, closeListPagination = {} },
    } = this.props;
    const { closeStatus } = enumMap;
    const {
      selectedRows,
      selectedListRowKeys,
      organizationId,
      operationRecordId,
      operationRecordModalVisible,
    } = this.state;
    const searchProps = {
      closeStatus,
      customizeFilterForm,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      handleReset: this.handleReset,
    };
    const rowSelection = {
      selectedRowKeys: selectedListRowKeys,
      onChange: this.handleRowSelectedChange,
    };
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      operationRecordId,
      visible: operationRecordModalVisible,
      fetchOperationRecordListLoading,
      hideModal: () => this.handleOperationRecordVisible(false),
      // searchOperationRecord: this.searchOperationRecord,
    };
    const listProps = {
      dispatch,
      customizeTable,
      organizationId,
      rowSelection,
      closeStatus,
      pagination: closeListPagination,
      dataSource: closeList,
      loading: fetchListLoading,
      onHandleToDetail: this.linkToDetail,
      openOperationRecord: this.handleOperationRecordVisible,
      onSearch: this.handleSearch,
    };
    const otherButtonProps = {
      icon: 'export',
      // type: 'primary',
    };
    const searchFields = this.form ? this.form.getFieldsValue() : {};
    const formQueryCondition = this.handleFormQuery(searchFields);
    return (
      <React.Fragment>
        <Header title={intl.get(`sinv.deliveryClosed.view.message.title`).d('送货单关闭')}>
          {customizeBtnGroup({ code: `SODR.DELIVERY_CLOSED.LIST_BTN` }, [
            <Button
              data-name="close"
              type="primary"
              icon="close"
              onClick={this.closeDeliveryOrder}
              loading={closeDeliveryListOrderLoading || resyncDeliveryOrderLoading}
              disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>,
            <Button
              data-name="sync"
              type="default"
              icon="sync"
              onClick={this.resyncDeliveryOrder}
              disabled={
                (isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)) ||
                fetchListLoading ||
                selectedRows.some((n) => n.closeSyncStatus !== 'FAIL')
              }
              loading={resyncDeliveryOrderLoading || closeDeliveryListOrderLoading}
            >
              {intl.get(`sinv.common.view.button.resync`).d('重新同步')}
            </Button>,
            <ExcelExportPro
              data-name="new-export"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                // funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.logistics.ar.deliver-closed.ps.button.newexport',
                    type: 'c7n-pro',
                    // funcType: 'flat',
                  },
                ],
              }}
              requestUrl={`/spuc/v1/${organizationId}/asn-header/close/export`}
              queryParams={formQueryCondition}
              buttonText={intl.get('sinv.deliveryClosed.view.button.newExport').d('新版导出')}
              templateCode="SPUC_SINV_ASN_HEADER_ClOSE_EXPORT"
            />,
            <ExcelExport
              data-name="export"
              otherButtonProps={otherButtonProps}
              requestUrl={`/spuc/v1/${organizationId}/asn-header/close/export`}
              queryParams={formQueryCondition}
            />,
          ])}
        </Header>
        <Content>
          <div className="table-list-search">
            <Search {...searchProps} />
          </div>
          <List {...listProps} />
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
