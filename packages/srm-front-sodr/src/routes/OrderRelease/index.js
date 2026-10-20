/*
 * index - 订单发布
 * @date: 2018/11/19 18:56:39
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isArray, isEmpty, throttle } from 'lodash';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { getCurrentUser, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import List from './List';
import Search from './Search';

/**
 * 订单发布
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
  unitCode: ['SODR.ORDER_RELEASE.GRID', 'SODR.ORDER_RELEASE.LIST.HEADER_BY_REQUEST'],
})
@formatterCollections({
  code: [
    'sodr.receivedOrder',
    'sodr.orderRelease',
    'entity.supplier',
    'entity.order',
    'sodr.common',
    'entity.company',
    'entity.business',
    'entity.item',
  ],
})
@connect(({ loading, orderRelease }) => ({
  loadingList: loading.effects['orderRelease/queryOrderReleaseList'],
  publishing: loading.effects['orderRelease/publish'],
  orderRelease,
  supplierTenantId: getCurrentUser().organizationId,
}))
export default class ConfirmOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedListRows: [],
      // tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      orderRelease: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.props.dispatch({
        type: 'orderRelease/init',
      });
      this.handleSearch();
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues = {}) {
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
   * 查询订单发布列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}, sorter, isChangePage = false) {
    const {
      dispatch,
      orderRelease: {
        listPagination: { total },
      },
    } = this.props;
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues) || {};
    const payload = {
      page,
      ...handleFormValues,
      customizeUnitCode: 'SODR.ORDER_RELEASE.GRID,SODR.ORDER_RELEASE.LIST.HEADER_BY_REQUEST',
      sort: sorter,
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderRelease/queryOrderReleaseList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderRelease/queryOrderReleaseListPage',
          payload,
        });
      }
    });
    this.setState({ selectedListRows: [] });
  }

  /**
   * 跳转到订单发布详情页
   */
  @Bind()
  onHandleToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-release/detail/${poHeaderId}`,
      })
    );
  }

  /**
   * 发布订单
   */
  @Bind()
  handlePublish() {
    const { selectedListRows = [] } = this.state;
    const {
      orderRelease: { orderList = [], pagination = {} },
      dispatch,
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    if (selectedRowKeys.length > 0) {
      const poHeaderList = orderList.filter(
        (item) => selectedRowKeys.indexOf(item.poHeaderId) >= 0
      );
      Modal.confirm({
        title: intl.get(`sodr.orderRelease.view.message.confirmRelease`).d('是否确认发布订单'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'orderRelease/publish',
              payload: poHeaderList,
            }).then((res) => {
              if (res) {
                const list = Object.keys(res);
                if (list.length === 0) {
                  notification.success();
                } else {
                  notification.warning({
                    message: `${JSON.stringify(list)}${res[list[0]].desc}`,
                  });
                }
                this.handleSearch(pagination);
                this.setState({ selectedListRows: [] });
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
      publishing,
      customizeTable,
      customizeFilterForm,
      orderRelease: { listPagination, orderList, enumMap },
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
      dataSource: orderList,
      loading: loadingList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      rowSelection: listRowSelection,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`sodr.orderRelease.view.message.headerTitle`).d('订单发布')}>
          <Button
            type="primary"
            onClick={this.handlePublish}
            icon="rocket"
            loading={publishing}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get('hzero.common.button.release').d('发布')}
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
