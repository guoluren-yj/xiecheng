/**
 * SupplierDeliver - 采购方送货单列表查询
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Tabs, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, isFunction } from 'lodash';
import { Header, Content } from 'components/Page';
import qs from 'querystring';
import intl from 'utils/intl';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPUC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import moment from 'moment';
import DeliveryList from './List';
import DetailSearch from './DetailSearch';
import styles from './index.less';

window.moment = moment;
const { TabPane } = Tabs;

/**
 * 采购方送货单列表查询
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} purchaserDelivery - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SINV.PURCHASER_DELIVERY_LIST.GRID',
    'SINV.PURCHASER_DELIVERY_LIST.GRID_BY_DETAIL',
    'SINV.PURCHASER_DELIVERY_LIST.FILTER',
    'SINV.PURCHASER_DELIVERY_LIST.FILTER_BY_DETAIL',
    'SINV.PURCHASER_DELIVERY_LIST.LIST_BTN',
    'SINV.PURCHASER_DELIVERY_LIST.DETAIL_BTN',
  ],
})
@formatterCollections({
  code: [
    'sinv.purchaserDelivery',
    'sinv.purchaseReception',
    'sinv.common',
    'sinv.purchaseReception',
    'sinv.purchaserDelivery',
    'sinv.supplierDelivery',
    'sinv.deliveryClosed',
    'entity.supplier',
    'entity.item',
    'entity.customer',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.company',
    'sodr.quotePurchase',
    'hpfm.employee',
    'hzero.common',
    'sinv.receiptExecution',
    'entity.business',
  ],
})
@connect(({ loading, purchaserDelivery }) => ({
  loadingList: loading.effects['purchaserDelivery/queryDeliveryList'],
  loadingDetailList: loading.effects['purchaserDelivery/queryDeliveryDetailList'],
  loadingOperation: loading.effects['purchaserDelivery/fetchOperationList'],
  loadingExect: loading.effects['purchaserDelivery/fetchExectList'],
  loadingAsync: loading.effects['purchaserDelivery/async'],
  purchaserDelivery,
}))
export default class SupplierDeliver extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { activeKey } = qs.parse(search.substr(1));
    this.state = {
      activeKey: activeKey || 'list',
      supplierIds: [],
      tenantId: getCurrentOrganizationId(),
      selectedListRowKeys: [], // 列表选中主键
      selectedLinesRowKeys: [], // 明细行选中主键
      exectRecordList: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaserDelivery/fetchEnum',
    });
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
      purchaserDelivery: { listPagination },
    } = this.props;
    const custLoadingFlag = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingFlag) {
      if (_back !== -1) {
        this.handleSearch();
      } else {
        this.handleSearch(listPagination);
      }
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
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
   * 根据当前tab来请求对应的列表
   * @param {*} fields
   */
  @Bind()
  handleSearch(fields = {}, clearFlag, sorter, callback) {
    const { activeKey } = this.state;
    if (activeKey === 'list') {
      this.handleSearchList(fields);
    } else {
      this.handleSearchDetailList(fields, clearFlag, sorter, callback);
    }
  }

  /**
   * 配送单列表查询
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearchList(page = {}) {
    const { dispatch } = this.props;
    const fieldsValue =
      (this.listForm && filterNullValueObject(this.listForm.searchForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(fieldsValue);
    const { expectedArriveDateFrom, expectedArriveDateTo } = fieldsValue;
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
        type: 'purchaserDelivery/queryDeliveryList',
        payload: {
          page,
          ...handleFormValues,
          unReadMessageFlag: 1,
          customizeUnitCode:
            'SINV.PURCHASER_DELIVERY_LIST.GRID,SINV.PURCHASER_DELIVERY_LIST.FILTER',
        },
      });
    }
  }

  /**
   * 明细行查询
   * @param {Object} page
   */
  @Bind()
  handleSearchDetailList(page = {}, clearFlag = false, sorter, callback) {
    const { dispatch } = this.props;
    const fieldsValue =
      (this.detailForm && filterNullValueObject(this.detailForm.searchForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(fieldsValue);
    const { expectedArriveDateFrom, expectedArriveDateTo } = fieldsValue;
    if (
      expectedArriveDateFrom &&
      expectedArriveDateTo &&
      expectedArriveDateTo.isBefore(expectedArriveDateFrom, 'time')
    ) {
      // notification.warning({
      //   message: intl.get('hzero.common.validation.date.after', {
      //     startDate: intl
      //       .get(`sinv.common.model.common.expectedArriveDateFrom`)
      //       .d('预计到货日期从'),
      //     endDate: intl.get(`sinv.common.model.common.expectedArriveDateTo`).d('预计到货日期至'),
      //   }),
      // });
    } else {
      dispatch({
        type: 'purchaserDelivery/queryDeliveryDetailList',
        payload: {
          page,
          sort: sorter,
          customizeUnitCode:
            'SINV.PURCHASER_DELIVERY_LIST.GRID_BY_DETAIL,SINV.PURCHASER_DELIVERY_LIST.FILTER_BY_DETAIL',
          ...handleFormValues,
        },
      }).then((res) => {
        if (getResponse(res)) {
          // eslint-disable-next-line no-unused-expressions
          isFunction(callback) && callback(res.content || []);
        }
      });
      if (clearFlag) {
        this.setState({
          selectedLinesRowKeys: [],
        });
      }
    }
  }

  /**
   * 查询操作记录
   * @param {Object, Number} { page = {}, asnHeaderId }
   * @returns Promise
   */
  @Bind()
  handleSearchOperation({ page = {}, asnHeaderId }) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaserDelivery/fetchOperationList',
      payload: {
        page,
        asnHeaderId,
      },
    });
  }

  /**
   * 查询导入
   * @param {Object, Number} { page = {}, asnHeaderId }
   * @returns Promise
   */
  @Bind()
  handleSearchExect({ page = {}, asnHeaderId }) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaserDelivery/fetchExectList',
      payload: {
        page,
        asnHeaderIds: asnHeaderId,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          exectRecordList: res,
        });
      }
    });
  }

  /**
   * 主键变化回调
   * @param {*} selectedRowKeys
   */
  @Bind()
  handleChangeRowKeys(key, selectedRowKeys) {
    const { dispatch, purchaserDelivery } = this.props;
    if (key === 'selectedListRowKeys') {
      // 个性化二开使用 列表
      const cuzAsnList = purchaserDelivery.deliveryList.map((i) => {
        i.cuz_selected = selectedRowKeys.includes(i.asnHeaderId); // eslint-disable-line
        return i;
      });

      if (cuzAsnList.length) {
        dispatch({
          type: 'purchaserDelivery/updateState',
          payload: {
            deliveryList: cuzAsnList,
          },
        });
      }
    } else {
      console.log(selectedRowKeys, 'selectedRowKeys');
      // 个性化二开使用 明细
      const cuzAsnList = purchaserDelivery.deliveryDetailList.map((i) => {
        i.cuz_selected = selectedRowKeys.includes(i.asnLineId); // eslint-disable-line
        return i;
      });
      console.log(cuzAsnList, 'cuzAsnList');
      if (cuzAsnList.length) {
        dispatch({
          type: 'purchaserDelivery/updateState',
          payload: {
            deliveryDetailList: cuzAsnList,
          },
        });
      }
    }

    this.setState({ [key]: selectedRowKeys });
  }

  /**
   * tab改变
   * @param {String} activeKey
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
  }

  @Bind()
  syncAlignAll(record, asnHeaderId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaserDelivery/async',
      payload: {
        asnInterRecordIds: [record.recordId],
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState(
          {
            exectRecordList: [],
          },
          () => {
            this.handleSearchExect({ page: {}, asnHeaderId });
          }
        );
      }
    });
  }

  @Bind()
  asyncList() {
    const { dispatch } = this.props;
    const { selectedListRowKeys } = this.state;
    dispatch({
      type: 'purchaserDelivery/async',
      payload: {
        asnHeaderIds: selectedListRowKeys,
      },
    }).then((res) => {
      if (Array.isArray(res)) {
        notification.success({ message: '操作成功' });
        this.handleSearchList();
      }
    });
  }

  render() {
    const {
      activeKey,
      tenantId,
      selectedListRowKeys,
      selectedLinesRowKeys,
      exectRecordList,
    } = this.state;
    const {
      customizeBtnGroup,
      customizeTable,
      customizeFilterForm,
      purchaserDelivery: {
        listPagination,
        deliveryList,
        detailListPagination,
        deliveryDetailList,
        enumMap,
      },
      history,
      dispatch,
      loadingList,
      loadingDetailList,
      loadingOperation,
      loadingExect,
      loadingAsync,
    } = this.props;
    const listRowSelection = {
      selectedRowKeys: selectedListRowKeys,
      onChange: (selectedRowKeys, selectedRows) =>
        this.handleChangeRowKeys('selectedListRowKeys', selectedRowKeys, selectedRows),
    };
    const linesRowSelection = {
      selectedRowKeys: selectedLinesRowKeys,
      onChange: (selectedRowKeys, selectedRows) =>
        this.handleChangeRowKeys('selectedLinesRowKeys', selectedRowKeys, selectedRows),
    };
    const listProps = {
      enumMap,
      dispatch,
      customizeTable,
      customizeFilterForm,
      loadingOperation,
      loadingExect,
      loadingAsync,
      exectRecordList,
      loading: loadingList,
      dataSource: deliveryList,
      pagination: listPagination,
      onSearch: this.handleSearch,
      syncAlign: this.syncAlignAll,
      rowSelection: listRowSelection,
      onFetchOperation: this.handleSearchOperation,
      onFetchExect: this.handleSearchExect,
      onRef: (node) => {
        this.listForm = node;
      },
    };
    const detailProps = {
      enumMap,
      history,
      customizeTable,
      customizeFilterForm,
      loading: loadingDetailList,
      dataSource: deliveryDetailList,
      pagination: detailListPagination,
      rowSelection: linesRowSelection,
      onSearch: this.handleSearch,
      handleReset: this.handleReset,
      onRef: (node) => {
        this.detailForm = node;
      },
    };
    const listFields = this.listForm ? this.listForm.searchForm.getFieldsValue() : {};
    const listQueryCondition = this.handleFormQuery(listFields);
    const detailFields = this.detailForm ? this.detailForm.searchForm.getFieldsValue() : {};
    const detailQueryCondition = this.handleFormQuery(detailFields);
    const asnHeaderIds = selectedListRowKeys.join(',');
    const asnLineIds = selectedLinesRowKeys.join(',');
    const otherButtonProps = {
      icon: 'export',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys),
    };
    const detailCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedLinesRowKeys) && isEmpty(selectedLinesRowKeys),
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sinv.purchaserDelivery.view.messageb.title`).d('采购方送货单查询')}
        >
          {activeKey === 'list' ? (
            <Fragment>
              {customizeBtnGroup({ code: `SINV.PURCHASER_DELIVERY_LIST.LIST_BTN` }, [
                <Button
                  data-name="sync"
                  onClick={this.asyncList}
                  loading={loadingAsync}
                  disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
                >
                  {intl.get(`sinv.common.model.common.sync`).d('重新同步')}
                </Button>,
                <ExcelExportPro
                  data-name="new-export"
                  otherButtonProps={{
                    icon: 'unarchive',
                    type: 'c7n-pro',
                    // funcType: 'flat',
                    permissionList: [
                      {
                        code: 'srm.logistics.ar.purchaser-delivery.ps.button.newexport',
                        type: 'c7n-pro',
                        // funcType: 'flat',
                      },
                    ],
                  }}
                  buttonText={
                    listCheckExportBtnProps.disabled
                      ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                      : intl
                          .get(`sinv.purchaserDelivery.view.button.newCheckExport`)
                          .d('新版勾选导出')
                  }
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-purchase/export`}
                  queryParams={
                    listCheckExportBtnProps.disabled ? listQueryCondition : { asnHeaderIds }
                  }
                  templateCode="SPUC_SINV_ASN_HEADER_PURCHASE_EXPORT"
                />,
                <ExcelExport
                  data-name="export"
                  otherButtonProps={otherButtonProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-purchase/export`}
                  queryParams={listQueryCondition}
                />,
                <ExcelExport
                  data-name="check-export"
                  buttonText={intl
                    .get(`sinv.purchaserDelivery.view.button.checkExport`)
                    .d('勾选导出')}
                  otherButtonProps={listCheckExportBtnProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-purchase/export`}
                  queryParams={{ asnHeaderIds }}
                />,
              ])}
            </Fragment>
          ) : (
            <Fragment>
              {customizeBtnGroup({ code: `SINV.PURCHASER_DELIVERY_LIST.DETAIL_BTN` }, [
                <ExcelExportPro
                  data-name="new-export"
                  otherButtonProps={{
                    icon: 'unarchive',
                    type: 'c7n-pro',
                    permissionList: [
                      {
                        code: 'srm.logistics.ar.purchaser-delivery.ps.button.line.newexport',
                        type: 'c7n-pro',
                      },
                    ],
                  }}
                  buttonText={
                    detailCheckExportBtnProps.disabled
                      ? intl.get(`sinv.purchaserDelivery.view.button.newExport`).d('新版导出')
                      : intl
                          .get(`sinv.purchaserDelivery.view.button.newCheckExport`)
                          .d('新版勾选导出')
                  }
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-purchase/export-new`}
                  queryParams={
                    detailCheckExportBtnProps.disabled ? detailQueryCondition : { asnLineIds }
                  }
                  templateCode="SPUC_SINV_ASN_HEADER_PURCHASE_DETAIL"
                />,
                <ExcelExport
                  data-name="export"
                  otherButtonProps={otherButtonProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-purchase/export`}
                  queryParams={detailQueryCondition}
                />,
                <ExcelExport
                  data-name="check-export"
                  buttonText={intl
                    .get(`sinv.purchaserDelivery.view.button.checkExport`)
                    .d('勾选导出')}
                  otherButtonProps={detailCheckExportBtnProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/lines/for-purchase/export`}
                  queryParams={{ asnLineIds }}
                />,
              ])}
            </Fragment>
          )}
        </Header>
        <Content style={{ paddingTop: 0 }} className={styles.content}>
          <Tabs activeKey={activeKey} onChange={this.handleTabsChange} animated={false}>
            <TabPane
              tab={intl.get(`sinv.purchaserDelivery.view.tab.list`).d('送货单查询')}
              key="list"
            >
              <DeliveryList {...listProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sinv.purchaserDelivery.view.tab.detail`).d('按明细查询')}
              key="detail"
            >
              <DetailSearch {...detailProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
