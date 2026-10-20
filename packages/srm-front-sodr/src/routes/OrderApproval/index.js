/*
 * OrderApproval - 订单审批
 * @date: 2018/10/16 10:09:34
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isArray, isEmpty, throttle } from 'lodash';
import { Bind } from 'lodash-decorators';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import List from './List';
import Search from './Search';

const messagePrompt = 'sodr.orderApproval.view.message';
// const buttonPrompt = 'sodr.view.button';
/**
 * 订单审批
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SODR.ORDER_APPROVAL.LIST.GRID', 'SODR.ORDER_APPROVAL.LIST.LIST.HEADER_BY_REQUEST'],
})
@formatterCollections({
  code: [
    'sodr.orderApproval',
    'sodr.sendOrder',
    'sodr.common',
    'entity.order',
    'entity.business',
    'entity.company',
    'entity.supplier',
  ],
})
@connect(({ loading, orderApproval }) => ({
  loadingList: loading.effects['orderApproval/queryList'],
  approving: loading.effects['orderApproval/passApprovalList'],
  rejecting: loading.effects['orderApproval/rejectApprovalList'],
  orderApproval,
  supplierTenantId: getCurrentUser().organizationId,
}))
export default class OrderApproval extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedListRows: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      orderApproval: { listPagination = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(listPagination);
    } else {
      this.props.dispatch({
        type: 'orderApproval/fetchEnum',
      });
      this.handleSearch();
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['erpCreationDateStart', 'erpCreationDateEnd'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}, isChangePage = false) {
    const {
      dispatch,
      orderApproval: {
        listPagination: { total },
      },
    } = this.props;
    const { tenantId } = this.state;
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues);
    const payload = {
      page,
      tenantId,
      ...handleFormValues,
      customizeUnitCode:
        'SODR.ORDER_APPROVAL.LIST.GRID,SODR.ORDER_APPROVAL.LIST.LIST.HEADER_BY_REQUEST',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderApproval/queryList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderApproval/queryListPage',
          payload,
        });
      }
    });
    this.setState({ selectedListRows: [] });
  }

  // 跳转详情
  @Bind()
  onHandleToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-approval/detail/${poHeaderId}`,
      })
    );
  }

  /**
   * 订单审批通过
   */
  @Bind()
  handlePassApproval() {
    const { selectedListRows } = this.state;
    const {
      orderApproval: { approvalList },
      dispatch,
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const poDTOList = approvalList.filter((item) => selectedRowKeys.indexOf(item.poHeaderId) >= 0);
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmAgree`).d('是否确认审批通过订单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'orderApproval/passApprovalList',
              payload: {
                poDTOList,
              },
            }).then((res) => {
              if (res) {
                this.handleSearch();
                this.setState({ selectedListRows: [] });
                notification.success();
              }
            });
          },
          THROTTLE_TIME,
          { trailing: false }
        ),
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 订单审批拒绝
   */
  @Bind()
  handleRejectApproval() {
    const { selectedListRows } = this.state;
    const {
      orderApproval: { approvalList, listPagination },
      dispatch,
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const poDTOList = approvalList.filter((item) => selectedRowKeys.indexOf(item.poHeaderId) >= 0);
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmReject`).d('是否确认审批拒绝订单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'orderApproval/rejectApprovalList',
              payload: {
                poDTOList,
              },
            }).then((res) => {
              if (res) {
                this.handleSearch(listPagination);
                this.setState({ selectedListRows: [] });
                notification.success();
              }
            });
          },
          THROTTLE_TIME,
          { trailing: false }
        ),
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleListRowSelectChange(newSelectedRowKeys, newSelectedRows) {
    this.setState({ selectedListRows: newSelectedRows });
  }

  render() {
    const { selectedListRows } = this.state;
    const {
      loadingList,
      approving,
      rejecting,
      customizeTable,
      customizeFilterForm,
      orderApproval: { listPagination, approvalList, enumMap },
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const listRowSelection = {
      selectedRowKeys,
      onChange: this.handleListRowSelectChange,
    };
    const filterProps = {
      enumMap,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      customizeTable,
      pagination: listPagination,
      dataSource: approvalList,
      loading: loadingList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      rowSelection: listRowSelection,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${messagePrompt}.headerTitle`).d('订单审批')}>
          <Button
            type="primary"
            onClick={this.handlePassApproval}
            icon="check"
            loading={approving || rejecting}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get('sodr.orderApproval.view.button.approve').d('审批通过')}
          </Button>
          <Button
            onClick={this.handleRejectApproval}
            icon="close"
            loading={rejecting || approving}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get('sodr.orderApproval.view.button.reject').d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <Search {...filterProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
