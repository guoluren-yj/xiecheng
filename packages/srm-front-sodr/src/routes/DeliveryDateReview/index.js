/*
 * DeliveryDateReview - 交期审核列表
 * @date: 2018/10/16 10:09:14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Button, Modal, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isArray, isEmpty } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { queryCommonDoubleUomConfig } from '../components/utils';

import List from './List';
import Search from './Search';
import DetailList from './DetailList';
import DetailSearch from './DetailSearch';

const messagePrompt = 'sodr.deliveryDateReview.view.message';
const { TabPane } = Tabs;
// const buttonPrompt = 'sodr.view.button';

/**
 * 交期审核列表
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} orderList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sodr.deliveryDateReview',
    'sodr.sendOrder',
    'sodr.common',
    'entity.company',
    'entity.supplier',
    'entity.order',
    'entity.business',
    'sprm.purchaseRequisitionInquiry',
    'sodr.orderCancel',
    'entity.item',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.DELIVERY_DATE_REVIEW.GRID',
    'SODR.DELIVERY_DATE_REVIEW.FILTER',
    'SODR.DELIVERY_DATE_REVIEW.GRID_BY_DETAIL',
    'SODR.DELIVERY_DATE_REVIEW.BUTTONS',
  ],
})
@connect(({ loading, deliveryDateReview }) => ({
  loadingList: loading.effects['deliveryDateReview/queryList'],
  loadingDetailList: loading.effects['deliveryDateReview/queryDetail'],
  agreeing: loading.effects['deliveryDateReview/agree'],
  rejecting: loading.effects['deliveryDateReview/reject'],
  lineAgreeing: loading.effects['deliveryDateReview/lineAgree'],
  lineRejecting: loading.effects['deliveryDateReview/lineReject'],
  deliveryDateReview,
}))
export default class DeliveryDateReview extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedListRows: [],
      selectedDetailListRows: [],
      poHeaderIds: [], // 选中的订单头id
      radioTab: 'list',
      doubleUnitEnabled: 0,
      organization: getCurrentOrganizationId(),
      collByLine: 0, // 是否按行协同
    };
  }

  componentDidMount() {
    this.props
      .dispatch({
        type: 'deliveryDateReview/queryCollByLine',
      })
      .then((res) => {
        this.setState({ collByLine: res });
      });
    this.queryDoubleUomConfig();
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
      deliveryDateReview: { pagination = {} },
    } = this.props;
    if (!custLoading && prevProps.custLoading !== custLoading) {
      if (_back === -1) {
        this.handleSearch(pagination, 'list');
      } else {
        this.props.dispatch({
          type: 'deliveryDateReview/init',
        });
        this.handleSearch({}, 'list');
      }
      this.props.dispatch({
        type: 'deliveryDateReview/init',
      });
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues, key) {
    const dealTime = {};
    const timeArray = [
      'releaseDateStart',
      'releaseDateEnd',
      'erpCreationDateStart',
      'erpCreationDateEnd',
      'feedbackDateStart',
      'feedbackDateEnd',
    ];
    timeArray.forEach((item) => {
      if (key === 'line') {
        if (
          item === 'releaseDateEnd' ||
          item === 'erpCreationDateEnd' ||
          item === 'feedbackDateEnd'
        ) {
          dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
        } else {
          dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
        }
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}, key, pageFlag, sorter, isChangePage = false) {
    const {
      dispatch,
      deliveryDateReview: {
        listPagination: { total: listTotal },
        detailPagination: { total: detailTotal },
      },
    } = this.props;
    if (key === 'list') {
      const filterValues =
        (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
      const handleFormValues = this.handleFormQuery(filterValues);
      const payload = {
        page,
        ...handleFormValues,
        customizeUnitCode: 'SODR.DELIVERY_DATE_REVIEW.GRID,SODR.DELIVERY_DATE_REVIEW.FILTER',
        sort: sorter,
        asyncCountFlag: 'DEFAULT',
        ...(isChangePage ? { oldTotalElements: listTotal } : null),
      };
      dispatch({
        type: 'deliveryDateReview/queryList',
        payload,
      }).then((res) => {
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: 'deliveryDateReview/queryListPage',
            payload,
          });
        }
      });
      this.setState({ selectedListRows: [] });
    } else {
      const detailFilterValues =
        (this.detailFilterForm && filterNullValueObject(this.detailFilterForm.getFieldsValue())) ||
        {};
      const handleDetailFormValues = this.handleFormQuery(detailFilterValues, 'line');
      const payload = {
        poEntryPoint: 'OERDER_FEEDBACK',
        page,
        ...handleDetailFormValues,
        customizeUnitCode: 'SODR.DELIVERY_DATE_REVIEW.GRID_BY_DETAIL',
        asyncCountFlag: 'DEFAULT',
        ...(isChangePage ? { oldTotalElements: detailTotal } : null),
      };
      dispatch({
        type: 'deliveryDateReview/queryDetail',
        payload,
      }).then((res) => {
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: 'deliveryDateReview/queryDetailPage',
            payload,
          });
        }
        if (pageFlag === 1) {
          // 支持跨页勾选
          const { poHeaderIds, selectedDetailListRows } = this.state;
          if (poHeaderIds.length > 0) {
            const detailListCurrentSelectedRows = res.content.filter(
              (item) => poHeaderIds.indexOf(item.poHeaderId) > -1
            );
            this.setState({
              selectedDetailListRows: selectedDetailListRows.concat(detailListCurrentSelectedRows),
            });
          }
        } else {
          this.setState({ selectedDetailListRows: [] });
        }
      });
    }
  }

  // 跳转详情
  @Bind()
  onHandleToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/delivery-date-review/detail/${poHeaderId}`,
      })
    );
  }

  /**
   * 对象数组去重
   */
  @Bind()
  arrayUnique(arr, name) {
    const hash = {};
    return arr.reduce(function (item, next) {
      if (!hash[next[name]]) {
        hash[next[name]] = true;
        item.push(next);
      }
      return item;
    }, []);
  }

  /**
   * 订单同意
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleAgree() {
    const { selectedListRows, selectedDetailListRows } = this.state;
    const {
      deliveryDateReview: { pagination },
      dispatch,
    } = this.props;
    const { radioTab } = this.state;
    const isList = radioTab === 'list';
    // const newSelectedDetailListRows = this.arrayUnique(selectedDetailListRows, 'poHeaderId');
    const selectedRows = isList ? selectedListRows : getEditTableData(selectedDetailListRows);
    if (selectedRows.length > 0) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmAgree`).d('是否确认同意交期'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: `deliveryDateReview/${isList ? 'agree' : 'lineAgree'}`,
            payload: {
              data: selectedRows,
              customizeUnitCode: isList
                ? 'SODR.DELIVERY_DATE_REVIEW.GRID'
                : 'SODR.DELIVERY_DATE_REVIEW.GRID_BY_DETAIL',
            },
          }).then((res) => {
            if (res) {
              this.handleSearch(pagination, radioTab);
              this.setState({ selectedListRows: [] });
              notification.success();
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
   * 订单退回
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleReject() {
    const { selectedListRows, selectedDetailListRows } = this.state;
    const {
      deliveryDateReview: { pagination },
      dispatch,
    } = this.props;
    const { radioTab } = this.state;
    const isList = radioTab === 'list';
    // const newSelectedDetailListRows = this.arrayUnique(selectedDetailListRows, 'poHeaderId');
    const selectedRows =
      radioTab === 'list' ? selectedListRows : getEditTableData(selectedDetailListRows);
    if (selectedRows.length > 0) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmReject`).d('是否确认审核拒绝交期'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          dispatch({
            type: `deliveryDateReview/${radioTab === 'list' ? 'reject' : 'lineReject'}`,
            payload: {
              data: selectedRows,
              customizeUnitCode: isList
                ? 'SODR.DELIVERY_DATE_REVIEW.GRID'
                : 'SODR.DELIVERY_DATE_REVIEW.GRID_BY_DETAIL',
            },
          }).then((res) => {
            if (res) {
              this.handleSearch(pagination, radioTab);
              this.setState({ selectedListRows: [] });
              notification.success();
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

  @Bind
  handleTabsChange(key) {
    this.setState({ radioTab: key }, () => {
      this.handleSearch({}, key);
    });
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

  @Bind()
  handleDetailListRowSelectChange(newSelectedDetailRowKeys, newSelectedDetailRows) {
    this.setState({ selectedDetailListRows: newSelectedDetailRows });
  }

  /**
   * 表格行选择事件
   */
  @Bind()
  onDetailListRowSelect(detailListSelectedRow) {
    let detailListSelectedRows = [];
    let selectedPoHeaderIds = [];
    const { poHeaderId } = detailListSelectedRow;
    const {
      deliveryDateReview: { detailList },
    } = this.props;
    const { selectedDetailListRows, poHeaderIds = [] } = this.state;
    // 取消勾选
    if (selectedDetailListRows.filter((item) => item.poHeaderId === poHeaderId).length > 0) {
      selectedPoHeaderIds = poHeaderIds.filter((item) => item !== poHeaderId);
      detailListSelectedRows = selectedDetailListRows.filter(
        (item) => item.poHeaderId !== poHeaderId
      );
    } else {
      // 勾选，支持跨页勾选
      if (selectedPoHeaderIds.indexOf(poHeaderIds) === -1) {
        poHeaderIds.push(poHeaderId);
        selectedPoHeaderIds = poHeaderIds;
      }
      const detailListCurrentSelectedRows = detailList.filter(
        (item) => item.poHeaderId === poHeaderId
      );
      detailListSelectedRows = selectedDetailListRows.concat(detailListCurrentSelectedRows);
    }
    this.setState({
      selectedDetailListRows: detailListSelectedRows,
      poHeaderIds: selectedPoHeaderIds,
    });
  }

  /**
   *
   * @returns 整单查询个性化按钮组
   */
  @Bind()
  getButtonsByList() {
    const { customizeBtnGroup, agreeing, rejecting, loadingList } = this.props;
    const { selectedListRows, organization } = this.state;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues);
    const poHeaderIds = selectedRowKeys.join(',');
    const otherButtonProps = {
      icon: 'export',
      type: 'default',
    };
    const headerBtnsRender = [
      {
        name: 'agree',
        child: intl.get(`${messagePrompt}.button.agree`).d('同意'),
        btnProps: {
          type: 'primary',
          onClick: this.handleAgree,
          loading: agreeing || rejecting || loadingList,
          icon: 'check',
          disabled: isArray(selectedRowKeys) && isEmpty(selectedRowKeys),
        },
      },
      {
        name: 'sendBack',
        child: intl.get(`${messagePrompt}.button.reject`).d('退回'),
        btnProps: {
          onClick: this.handleReject,
          loading: agreeing || rejecting || loadingList,
          icon: 'close',
          disabled: isArray(selectedRowKeys) && isEmpty(selectedRowKeys),
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        child: selectedRowKeys.length
          ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
          : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
        childFor: 'buttonText',
        btnProps: {
          templateCode: 'SRM_SODR_DELIVERY_PO_HEADER',
          exportAsync: true,
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.po.delivery-date-review.ps.button.newexport',
                type: 'c7n-pro',
                meaning: '订单反馈审核-新版导出',
              },
            ],
          },
          requestUrl: `${SRM_SPUC}/v1/${organization}/po-header/export-delivery/new-module`,
          queryParams: selectedRowKeys.length ? { poHeaderIds } : handleFormValues,
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        child: selectedRowKeys.length
          ? intl.get(`hzero.common.button.exportSelect`).d('(勾选导出')
          : intl.get(`hzero.common.export`).d('导出'),
        childFor: 'buttonText',
        btnProps: {
          otherButtonProps,
          requestUrl: `${SRM_SPUC}/v1/${organization}/po-header/export-delivery`,
          queryParams: selectedRowKeys.length ? { poHeaderIds } : handleFormValues,
        },
      },
    ];
    return customizeBtnGroup(
      { code: 'SODR.DELIVERY_DATE_REVIEW.BUTTONS', pro: true },
      <DynamicButtons buttons={headerBtnsRender} />
    );
  }

  render() {
    const { selectedListRows, selectedDetailListRows, doubleUnitEnabled } = this.state;
    const {
      loadingList,
      loadingDetailList,
      lineAgreeing,
      lineRejecting,
      customizeTable,
      customizeFilterForm,
      deliveryDateReview: { listPagination, orderList, detailList, detailPagination, enumMap },
    } = this.props;
    const { radioTab, collByLine } = this.state;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const selectedDetailRowKeys = selectedDetailListRows.map((item) => item.poLineLocationId);
    const listRowSelection = {
      selectedRowKeys,
      onChange: this.handleListRowSelectChange,
    };
    const detailListRowSelection = {
      selectedRowKeys: selectedDetailRowKeys,
      onChange: this.handleDetailListRowSelectChange,
      // onSelect: this.onDetailListRowSelect,
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
    const detailFilterProps = {
      enumMap,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.detailFilterForm = node.props.form;
      },
    };
    const detailListProps = {
      customizeTable,
      doubleUnitEnabled,
      pagination: detailPagination,
      dataSource: detailList,
      loading: loadingDetailList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      rowSelection: detailListRowSelection,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sodr.sendOrder.model.common.orderFeedbackReview').d('订单反馈审核')}
        >
          {radioTab === 'list' ? (
            this.getButtonsByList()
          ) : (
            <Fragment>
              <Button
                type="primary"
                onClick={this.handleAgree}
                icon="check"
                loading={lineAgreeing || lineRejecting || loadingDetailList}
                disabled={isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)}
              >
                {intl.get(`${messagePrompt}.button.agree`).d('同意')}
              </Button>

              <Button
                icon="close"
                onClick={this.handleReject}
                loading={lineRejecting || lineAgreeing || loadingDetailList}
                disabled={isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)}
              >
                {intl.get(`${messagePrompt}.button.reject`).d('退回')}
              </Button>
            </Fragment>
          )}
        </Header>
        <Content>
          <Tabs defaultActiveKey="list" onChange={this.handleTabsChange} animated={false}>
            <TabPane
              tab={intl.get('sodr.orderCancel.view.message.orderSearch').d('整单查询')}
              key="list"
            >
              <Search {...filterProps} />
              <List {...listProps} />
            </TabPane>
            {collByLine && (
              <TabPane
                tab={intl
                  .get('sprm.purchaseRequisitionInquiry.view.title.detailInquiry')
                  .d('明细查询')}
                key="detail"
              >
                <DetailSearch {...detailFilterProps} />
                <DetailList {...detailListProps} />
              </TabPane>
            )}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
