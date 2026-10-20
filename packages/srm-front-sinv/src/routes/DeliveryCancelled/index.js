/*
 * index - 送货单取消
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
import notification from 'utils/notification';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
// import { SRM_SPUC } from '_utils/config';

import Search from './Search';
import List from './List';
import OperationRecord from '../components/OperationRecord';

/**
 * index - 送货单取消
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} fetchOperationRecordListLoading - 获取操作记录
 * @reactProps {!boolean} fetchListLoading - 送货单取消列表
 * @reactProps {!boolean} resyncDeliveryOrderLoading - 重新同步送货单
 * @reactProps {!boolean} cancelDeliveryOrderLoading - 取消送货单
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: [
    'SINV.DELIVERY_CANCELLED.FILTER',
    'SINV.DELIVERY_CANCELLED.LIST',
    'SINV.DELIVERY_CANCELLED.LIST_BTN',
  ],
})
@connect(({ loading, deliveryCancelled }) => ({
  fetchOperationRecordListLoading: loading.effects['sendOrder/fetchOperationRecordList'],
  fetchListLoading: loading.effects['deliveryCancelled/queryDeliveryCancelledList'],
  resyncDeliveryOrderLoading: loading.effects['deliveryCancelled/resyncDeliveryOrder'],
  cancelDeliveryOrderLoading: loading.effects['deliveryCancelled/cancelDeliveryOrder'],
  deliveryCancelled,
}))
@formatterCollections({
  code: [
    'sinv.deliveryCanceled',
    'sinv.deliveryClosed',
    'sinv.deliveryCancelled',
    'sinv.purchaseReception',
    'sinv.common',
    'entity.supplier',
    'entity.customer',
    'entity.roles',
    'entity.company',
    'hzero.common',
  ],
})
export default class DeliveryCancelled extends PureComponent {
  state = {
    operationRecordModalVisible: false, // 修改操作记录模态框
    selectedListRowKeys: [],
    selectedRows: [],
    organizationId: getCurrentOrganizationId(),
  };

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
      deliveryCancelled: { cancelListPagination = {} },
    } = this.props;
    const custLoadingFlag = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingFlag) {
      if (_back === -1) {
        this.handleSearch(cancelListPagination);
      } else {
        this.props.dispatch({
          type: 'deliveryCancelled/init',
        });
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
   *  数据查询
   * @param {object} fields 查询参数
   * @memberof deliveryApproved
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
        type: 'deliveryCancelled/queryDeliveryCancelledList',
        payload: {
          page,
          ...handleFormValues,
          customizeUnitCode: 'SINV.DELIVERY_CANCELLED.FILTER,SINV.DELIVERY_CANCELLED.LIST',
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
   * 取消送货单
   * @memberof cancelDeliveryOrder
   */
  @Bind()
  cancelDeliveryOrder() {
    const {
      dispatch,
      // deliveryCancelled: { cancelList, cancelListPagination = {} },
      deliveryCancelled: { cancelList },
    } = this.props;
    const { selectedListRowKeys } = this.state;
    if (selectedListRowKeys.length > 0) {
      const cancelOrders = cancelList
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
        title: intl.get(`sinv.common.model.common.confirmCancel`).d('是否确认取消送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          // 获取配置中心
          dispatch({
            type: 'deliveryCancelled/fetchSettings',
          }).then((item = {}) => {
            dispatch({
              type: 'deliveryCancelled/cancelDeliveryOrder',
              payload: {
                isLineCancel: false,
                cancelOrders,
              },
            }).then((res) => {
              if (res) {
                if (item['010307'] === '1') {
                  notification.success({
                    message: intl
                      .get('sinv.common.view.title.actionImport')
                      .d('接口导入中，请稍后'),
                  });
                } else {
                  notification.success();
                }
                // this.handleSearch(cancelListPagination);
                this.handleSearch();
                this.setState({ selectedListRowKeys: [] });
              }
            });
          });
        },
      });
    }
  }

  /**
   * 重新同步
   * @memberof resyncDeliveryOrder
   */
  @Bind()
  resyncDeliveryOrder() {
    const {
      dispatch,
      deliveryCancelled: { cancelList, cancelListPagination = {} },
    } = this.props;
    const { selectedListRowKeys } = this.state;
    if (selectedListRowKeys.length > 0) {
      const resyncOrders = cancelList
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
        type: 'deliveryCancelled/resyncDeliveryOrder',
        payload: resyncOrders,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch(cancelListPagination);
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
    const { dispatch, deliveryCancelled } = this.props;
    this.setState({ selectedListRowKeys: selectedRowKeys, selectedRows });
    const cuzAsnList = deliveryCancelled.cancelList.map((i) => {
      i.cuz_selected = selectedRowKeys.includes(i.asnHeaderId); // eslint-disable-line
      return i;
    });
    if (cuzAsnList.length) {
      dispatch({
        type: 'deliveryCancelled/updateState',
        payload: {
          cancelSelectList: cuzAsnList,
        },
      });
    }
  }

  /**
   *
   *  订单详情页
   * @param {string} poHeaderId
   * @memberof deliveryCancelled
   */
  @Bind()
  linkToDetail(asnHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sinv/delivery-cancelled/detail/${asnHeaderId}`,
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
      cancelDeliveryOrderLoading,
      deliveryCancelled: {
        cancelList = [],
        enumMap,
        cancelListPagination = {},
        operationRecordPagination,
        operationRecordList,
      },
    } = this.props;
    const { cancelStatus, asnCancelStatus } = enumMap;
    const {
      selectedListRowKeys,
      organizationId,
      selectedRows,
      operationRecordId,
      operationRecordModalVisible,
    } = this.state;
    const searchProps = {
      customizeFilterForm,
      cancelStatus,
      asnCancelStatus,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
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
      dataSource: operationRecordList,
      pagination: operationRecordPagination,
      loading: fetchOperationRecordListLoading,
      hideModal: () => this.handleOperationRecordVisible(false),
      // searchOperationRecord: this.searchOperationRecord,
    };
    const listProps = {
      dispatch,
      customizeTable,
      organizationId,
      rowSelection,
      cancelStatus,
      pagination: cancelListPagination,
      dataSource: cancelList,
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
        <Header title={intl.get(`sinv.deliveryCancelled.view.message.title`).d('送货单取消')}>
          {customizeBtnGroup({ code: `SINV.DELIVERY_CANCELLED.LIST_BTN` }, [
            <Button
              data-name="cancel"
              type="primary"
              icon="close"
              onClick={this.cancelDeliveryOrder}
              loading={cancelDeliveryOrderLoading}
              disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            <Button
              data-name="sync"
              type="default"
              icon="sync"
              onClick={this.resyncDeliveryOrder}
              loading={resyncDeliveryOrderLoading}
              disabled={
                (isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)) ||
                selectedRows.some((n) => n.cancelSyncStatus !== 'FAIL')
              }
            >
              {intl.get(`sinv.common.view.button.resync`).d('重新同步')}
            </Button>,
            <ExcelExportPro
              data-name="new-export"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'srm.logistics.delivery.delivery-cancelled.ps.buttton.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              requestUrl={`/spuc/v1/${organizationId}/asn-header/cancel/export`}
              queryParams={formQueryCondition}
              buttonText={intl.get('sinv.deliveryCancelled.view.button.newExport').d('新版导出')}
              templateCode="SPUC_SINV_ASN_HEADER_CANCELLED_EXPORT"
            />,
            <ExcelExport
              data-name="export"
              otherButtonProps={otherButtonProps}
              requestUrl={`/spuc/v1/${organizationId}/asn-header/cancel/export`}
              queryParams={formQueryCondition}
            />,
          ])}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
