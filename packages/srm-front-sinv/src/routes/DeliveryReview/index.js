/*
 * index - 送货协同-送货单审批
 * @date: 2018/11/13 16:27:53
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import withCustomize from 'srm-front-cuz';
import OperationRecord from '../components/OperationRecord';
import Search from './Search';
import ListTable from './ListTable';

/**
 * index - 订单复审
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} fetchListLoading - 复审列表
 * @reactProps {!boolean} fetchOperationRecordListLoading - 获取操作记录
 * @reactProps {!boolean} approveDeliveryOrderLoading - 审批通过
 * @reactProps {!boolean} rejectDeliveryOrderLoading - 审批拒绝
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SINV.DELIVERY_APPROVED_LIST.GRID', 'SINV.DELIVERY_APPROVED_LIST.FILTER'],
})
@formatterCollections({
  code: [
    'sinv.common',
    'sinv.deliveryReview',
    'entity.supplier',
    'entity.company',
    'entity.roles',
    'sinv.purchaseReception',
    'hzero.common',
  ],
})
@connect(({ loading, deliveryReview }) => ({
  fetchListLoading: loading.effects['deliveryReview/queryDeliveryReviewList'],
  fetchOperationRecordListLoading: loading.effects['deliveryReview/fetchOperationRecordList'],
  approveDeliveryOrderLoading: loading.effects['deliveryReview/approveDeliveryOrder'],
  rejectDeliveryOrderLoading: loading.effects['deliveryReview/rejectDeliveryOrder'],
  deliveryReview,
}))
export default class deliveryReview extends PureComponent {
  state = {
    operationRecordModalVisible: false, // 修改操作记录模态框
    organizationId: getCurrentOrganizationId(),
    selectedListRowKeys: [], // 选中行
    selectedList: [],
    operationRecordId: '', // table中打开的对应操作记录的id
    supplierIds: [],
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    if (_back !== -1) {
      this.props.dispatch({
        type: 'deliveryReview/init',
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
      deliveryReview: { listPagination = {} },
    } = this.props;
    const custLoadingFlag = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingFlag) {
      if (_back === -1) {
        this.handleSearch(listPagination);
      } else {
        this.handleSearch();
      }
    }
  }

  /**
   *
   * 修改操作记录可见
   * @memberof deliveryReview
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
   *
   *  数据查询
   * @param {object} fields 查询参数
   * @memberof deliveryReview
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const { supplierIds } = this.state;
    const supplierId = (supplierIds || []).join();
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
        type: 'deliveryReview/queryDeliveryReviewList',
        payload: {
          page,
          supplierIds: supplierId,
          ...handleFormValues,
          customizeUnitCode: 'SINV.DELIVERY_APPROVED_LIST.GRID,SINV.DELIVERY_APPROVED_LIST.FILTER',
        },
      });
    }
  }

  /**
   *
   * 审批通过
   * @memberof approveDeliveryOrder
   */
  @Bind()
  approveDeliveryOrder() {
    const {
      dispatch,
      deliveryReview: { listPagination },
    } = this.props;
    const { selectedList } = this.state;
    if (selectedList.length > 0) {
      const approvalOrders = selectedList.map((item) => {
        const { asnHeaderId, _token, objectVersionNumber } = item;
        return {
          objectVersionNumber,
          _token,
          asnHeaderId,
        };
      });
      Modal.confirm({
        title: intl.get(`sinv.common.model.common.confirmApprove`).d('是否确认审批通过送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: 'deliveryReview/approveDeliveryOrder',
            payload: approvalOrders,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              this.handleSearch(listPagination);
              this.setState({ selectedListRowKeys: [], selectedList: [] });
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   *
   * 审批拒绝
   * @memberof deliveryReview
   */
  @Bind()
  rejectDeliveryOrder() {
    const {
      dispatch,
      deliveryReview: { listPagination },
    } = this.props;
    const { selectedList } = this.state;
    if (selectedList.length > 0) {
      const rejectOrders = selectedList.map((item) => {
        const { asnHeaderId, _token, objectVersionNumber } = item;
        return {
          objectVersionNumber,
          _token,
          asnHeaderId,
        };
      });
      Modal.confirm({
        title: intl.get(`sinv.common.model.common.confirmReject`).d('是否确认审批拒绝送货单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: 'deliveryReview/rejectDeliveryOrder',
            payload: rejectOrders,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              this.handleSearch(listPagination);
              this.setState({ selectedListRowKeys: [], selectedList: [] });
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   *
   *  订单详情页
   * @param {string} asnHeaderId
   * @memberof deliveryReview
   */
  @Bind()
  linkToDetail(asnHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sinv/delivery-review/detail/${asnHeaderId}`,
      })
    );
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
  handleRowSelectedChange(selectedRowKeys, selectedRows, selected) {
    const allSelected = selectedRowKeys.reduce((init, current) => {
      const select = [...selected, ...selectedRows].find((val) => val.asnHeaderId === current);
      if (select && select.asnHeaderId) {
        init.push(select);
      }
      return init;
    }, []);
    this.setState({ selectedListRowKeys: selectedRowKeys });
    this.setState({ selectedList: allSelected });
  }

  @Bind()
  tagChange(_a, b) {
    if (b instanceof Array) {
      this.setState({
        supplierIds: (b || []).map((item) => item.supplierId || null),
      });
    } else {
      this.setState({
        supplierIds: [],
      });
    }
  }

  render() {
    const {
      customizeTable,
      customizeFilterForm,
      deliveryReview: {
        orderList,
        listPagination,
        operationRecordPagination,
        operationRecordList,
        enumMap,
      },
      dispatch,
      match,
      fetchOperationRecordListLoading,
      fetchListLoading,
      approveDeliveryOrderLoading,
      rejectDeliveryOrderLoading,
    } = this.props;
    const {
      organizationId,
      operationRecordModalVisible,
      selectedListRowKeys,
      selectedList,
      operationRecordId,
    } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedListRowKeys,
      selectedRows: selectedList,
      onChange: (selectedRowKeys, selectedRows) =>
        this.handleRowSelectedChange(selectedRowKeys, selectedRows, selectedList),
    };
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      operationRecordId,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      hideModal: () => this.handleOperationRecordVisible(false),
      // searchOperationRecord: this.searchOperationRecord,
    };
    const filterProps = {
      customizeFilterForm,
      enumMap,
      onRef: this.handleBindRef,
      tagChange: this.tagChange,
      onFilterChange: this.handleSearch,
    };
    const listProps = {
      customizeTable,
      pagination: listPagination,
      fetchListLoading,
      dataSource: orderList,
      rowSelection,
      handleToDetail: this.linkToDetail,
      openOperationRecord: this.handleOperationRecordVisible,
      onSearch: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`sinv.deliveryReview.view.message.title`).d('送货单复审')}>
          <Button
            icon="check"
            type="primary"
            loading={approveDeliveryOrderLoading}
            disabled={
              (isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)) || fetchListLoading
            }
            onClick={this.approveDeliveryOrder}
          >
            {intl.get(`sinv.deliveryReview.view.button.approval`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            loading={rejectDeliveryOrderLoading}
            onClick={this.rejectDeliveryOrder}
            disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
          >
            {intl.get(`sinv.deliveryReview.view.button.reject`).d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Search {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
