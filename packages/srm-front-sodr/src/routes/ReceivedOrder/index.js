/*
 * ReceivedOrder - 我收到的订单
 * @date: 2018/10/13 11:47:39
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Icon, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isArray } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { Button } from 'components/Permission';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import remotes from 'utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import { queryCommonDoubleUomConfig } from '../components/utils';

import Order from './List';
import DetailSearch from './DetailSearch';
import OrderStatusTree from './OrderStatusTree';
import WrapperBOMModal from './DetailSearch/BOMModal';
import styles from './index.less';

const { TabPane } = Tabs;

/**
 * 我收到的订单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} receivedOrder - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.receivedOrder',
    'sodr.common',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'sprm.purchaseReqCreation',
    'sodr.quotePurchaseRequisition',
    'sodr.sendOrder',
    'hzero.common',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.RECEIVED_ORDER_LIST.FILTER_LINE',
    'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL',
    'SODR.RECEIVED_ORDER_LIST.GRID_BY_LINE',
    'SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
    'SODR.RECEIVED_ORDER_LIST.BUTTONS',
    'SODR.RECEIVED_ORDER_LIST.DETAIL_BUTTONS',
    'SODR.RECEIVED_ORDER_LIST.TABS',
  ],
})
@remotes({
  code: 'SODR_RECEIVED_ORDER',
})
@connect(({ loading, receivedOrder }) => ({
  loadingList: loading.effects['receivedOrder/queryReceivedOrderList'],
  loadingDetailList: loading.effects['receivedOrder/fetchDetailSearchList'],
  printing: loading.effects['receivedOrder/printSelectedList'],
  queryPoItemBOMLoading: loading.effects['receivedOrder/queryPoItemBOM'],
  receivedOrder,
}))
export default class ReceivedOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {},
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getUserOrganizationId(),
      selectedListRowKeys: [],
      detailSelectedRowsList: [],
      orderList: [],
      doubleUnitEnabled: 0,
      detailSearchList: [],
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
    };
  }

  // componentDidMount() {
  //   const {
  //     location: { state: { _back } = {} },
  //     receivedOrder: { listPagination },
  //   } = this.props;
  //   this.fetchSettings();
  //   if (_back !== -1) {
  //     this.props.dispatch({
  //       type: 'receivedOrder/init',
  //     });
  //     this.handleSearch({}, {}, true);
  //     this.props.dispatch({
  //       type: 'receivedOrder/updateState',
  //       payload: { treeFields: {} },
  //     });
  //   } else {
  //     this.setModelDataToTree();
  //     this.handleSearch(listPagination);
  //   }
  // }

  componentDidMount() {
    this.queryDoubleUomConfig();
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {} },
    } = this.props;
    if (!custLoading && prevProps.custLoading !== custLoading) {
      this.fetchSettings();
      if (_back !== -1) {
        this.props.dispatch({
          type: 'receivedOrder/init',
        });
        this.props.dispatch({
          type: 'receivedOrder/updateState',
          payload: { treeFields: {} },
        });
      } else {
        this.setModelDataToTree();
      }
    }
  }

  @Bind()
  handleQuery(key) {
    const {
      receivedOrder: { listPagination, detailPagination },
    } = this.props;
    if (key === 'list' && this.listForm) {
      this.handleSearch(listPagination, {}, true, key);
    } else if (key === 'detail' && this.detailForm) {
      this.handleSearch(detailPagination, {}, true, key);
    }
  }

  // 把model里面缓存的树的数据设置
  @Bind()
  setModelDataToTree() {
    const {
      receivedOrder: { currentLi },
    } = this.props;
    if (this.treeForm) {
      this.treeForm.setState({ currentLi });
    }
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
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(
    page = {},
    otherParams = {},
    clearFlag = false,
    radioTabParam,
    sorter,
    isChangePage = false
  ) {
    const { supplierTenantId } = this.state;
    const {
      receivedOrder: { detailQuery, radioTab: oldRadioTab, listPagination, detailPagination },
    } = this.props;
    const radioTab = radioTabParam || oldRadioTab;
    const initTreeFields = {
      statusCodes:
        'PUBLISHED,PART_FEED_BACK,DELIVERY_DATE_REVIEW,DELIVERY_DATE_REJECT,CONFIRMED,PUBLISH_CANCEL,CANCELED,CANCELTOBECOMFIRMED,CANCELING_WFL,CLOSED,CLOSETOBECOMFIRMED,CLOSE_WFL',
    };
    const treeFields = clearFlag
      ? initTreeFields
      : isEmpty(otherParams)
      ? (!isEmpty(this.props.receivedOrder.treeFields) && this.props.receivedOrder.treeFields) ||
        initTreeFields
      : otherParams;
    const asyncCountParams = {
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage
        ? { oldTotalElements: (radioTab === 'list' ? listPagination : detailPagination)?.total }
        : null),
    };
    if (radioTab === 'list' && this.listForm) {
      const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
      const handleFormValues = this.handleFormQuery(fields, radioTab);
      this.handleSearchList({
        page,
        ...treeFields,
        supplierTenantId,
        ...handleFormValues,
        sort: sorter,
        customizeUnitCode:
          'SODR.RECEIVED_ORDER_LIST.FILTER_LINE,SODR.RECEIVED_ORDER_LIST.GRID_BY_LINE',
        ...asyncCountParams,
      });
      this.setState({ selectedListRowKeys: [] });
    } else if (radioTab === 'detail' && this.detailForm) {
      const fields = this.detailForm.searchForm.props.form.getFieldsValue();
      const handleFormValues = this.handleFormQuery(fields, radioTab);
      this.handleSearchDetailList({
        page,
        ...detailQuery,
        ...treeFields,
        supplierTenantId,
        ...handleFormValues,
        sort: sorter,
        customizeUnitCode:
          'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL,SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
        ...asyncCountParams,
      });
      this.setState({ detailSelectedRowsList: [] });
    }
  }

  @Bind()
  handleSearchList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/queryReceivedOrderList',
      payload: fields,
    }).then((res) => {
      if (res) {
        if (res.needCountFlag === 'Y') {
          dispatch({
            type: 'receivedOrder/queryReceivedOrderListPage',
            payload: fields,
          });
        }
        const currentLi = this.treeForm ? this.treeForm.state.currentLi : false;
        this.setState({
          orderList: ['NOTEVALUATED', 'EVALUATED'].includes(currentLi)
            ? this.renderDataSource(res.content, currentLi, true)
            : res.content,
        });
      }
    });
  }

  /**
   * 重置订单状态树的选中状态和查询条件中的值
   */
  @Bind()
  handleResetOrderFields() {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/updateState',
      payload: { currentLi: null, treeFields: {} },
    });
    if (this.treeForm) {
      this.treeForm.setState({ currentLi: null });
    }
  }

  /*
   * 按明细查询
   */
  @Bind()
  handleSearchDetailList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/fetchDetailSearchList',
      payload: fields,
    }).then((res) => {
      if (res) {
        if (res.needCountFlag === 'Y') {
          dispatch({
            type: 'receivedOrder/fetchDetailSearchListPage',
            payload: fields,
          });
        }
        const currentLi = this.treeForm ? this.treeForm.state.currentLi : false;
        this.setState({
          detailSearchList: ['NOTEVALUATED', 'EVALUATED'].includes(currentLi)
            ? this.renderDataSource(res.content, currentLi)
            : res.content,
        });
      }
    });
  }

  // 已评价待评价数据渲染
  @Bind()
  renderDataSource(dataSource = [], currentLi, flag) {
    const statusCodeMeaning =
      currentLi === 'NOTEVALUATED'
        ? intl.get(`sodr.common.view.message.notEvaluated`).d('待评价')
        : intl.get(`sodr.common.view.message.evaluated`).d('已评价');
    const status = flag ? { statusCodeMeaning } : { displayStatusMeaning: statusCodeMeaning };
    const newDataSource = dataSource.map((item) => {
      return {
        ...item,
        ...status,
      };
    });
    return newDataSource;
  }

  // 查询配置中心配置
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          settings: res,
        });
      }
    });
  }

  /**
   * 订单状态改变时，获取表单和树的值查询
   * 并把树的值设置到state
   * @param {Object} fields
   */
  @Bind()
  handleSearchOrderStatus(fields, newCurrentLi) {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/updateState',
      payload: { currentLi: newCurrentLi, treeFields: fields },
    });
    this.handleSearch({}, fields, !newCurrentLi);
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleListRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedListRowKeys: newSelectedRowKeys });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleDetailSelectedRows(selectedRowKeys, selectedRows) {
    this.setState({ detailSelectedRowsList: selectedRows });
  }

  @Bind()
  handleTabsChange(key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedOrder/updateState',
      payload: {
        radioTab: key,
      },
    });
    this.handleQuery(key);
  }

  /**
   * 改变左侧树显示状态
   */
  @Bind()
  handleTreeShow() {
    const {
      dispatch,
      receivedOrder: { leftVisible },
    } = this.props;
    dispatch({
      type: 'receivedOrder/updateState',
      payload: {
        leftVisible: !leftVisible,
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues, radioTab) {
    const dealTime = {};
    let timeArray = [];
    if (radioTab === 'list') {
      timeArray = [
        'releaseDateStart',
        'releaseDateEnd',
        'erpCreationDateStart',
        'erpCreationDateEnd',
        // 'confirmDateStart',
        // 'confirmDateEnd',
      ];
    } else {
      timeArray = [
        // 'releasedDateStart',
        // 'releasedDateEnd',
        // 'erpCreationDateStart',
        // 'erpCreationDateEnd',
        'urgentDateStart',
        'urgentDateEnd',
        'promiseDeliveryDateStart',
        'promiseDeliveryDateEnd',
        'queryParamNeedByDateStart',
        'queryParamNeedByDateEnd',
      ];
    }
    timeArray.forEach((item) => {
      if (item === 'queryParamNeedByDateEnd') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
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
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { selectedListRowKeys } = this.state;
    const poHeaderIdList = selectedListRowKeys;
    dispatch({
      type: 'receivedOrder/printList',
      poHeaderIdList,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleSelectPrint() {
    const { dispatch } = this.props;
    const { selectedListRowKeys } = this.state;
    const poHeaderIdList = selectedListRowKeys;
    dispatch({
      type: 'receivedOrder/printSelectedList',
      poHeaderIdList,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(actionListRowData = {}) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  @Bind()
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * fetchMessage - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId, poLineLocationId, poHeaderId } = actionListRowData;
    dispatch({
      type: 'receivedOrder/queryPoItemBOM',
      params: {
        poHeaderId,
        poLineId,
        poLineLocationId,
        ...params,
        customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  @Bind()
  custDefaultActive(defaultActive) {
    const {
      dispatch,
      receivedOrder: { radioTab, radioTabInitFlag },
    } = this.props;
    if (!radioTabInitFlag) {
      dispatch({
        type: 'receivedOrder/updateState',
        payload: {
          radioTabInitFlag: true,
        },
      });
      if (defaultActive && defaultActive !== radioTab) {
        this.handleTabsChange(defaultActive);
      }
    }
  }

  render() {
    const {
      settings,
      tenantId,
      orderList = [],
      detailSearchList = [],
      supplierTenantId,
      doubleUnitEnabled,
      selectedListRowKeys,
      detailSelectedRowsList,
      actionListRowData = {},
      wrapperBOMModalVisible,
    } = this.state;
    const {
      remote,
      receivedOrder: {
        leftVisible,
        enumMap,
        // orderList,
        listPagination,
        listQuery,
        detailQuery,
        detailPagination,
        radioTab,
        // detailSearchList,
        // detailSelectedRowsList = [],
      },
      loadingList,
      dispatch,
      customizeTable,
      loadingDetailList,
      customizeFilterForm,
      printing,
      queryPoItemBOMLoading,
      customizeBtnGroup,
      customizeTabPane,
    } = this.props;
    const listRowSelection = {
      selectedRowKeys: selectedListRowKeys,
      onChange: this.handleListRowSelectChange,
    };
    const detailRowSelection = {
      selectedRowKeys: detailSelectedRowsList.map((n) => n.poLineLocationId),
      onChange: this.handleDetailSelectedRows,
    };
    const listProps = {
      enumMap,
      dispatch,
      customizeFilterForm,
      customizeTable,
      selectedRowKeys: selectedListRowKeys,
      onSearch: this.handleSearch,
      handleReset: this.handleResetOrderFields,
      loading: loadingList,
      dataSource: orderList,
      pagination: listPagination,
      rowSelection: listRowSelection,
      onRef: (node) => {
        this.listForm = node;
      },
    };
    const detailSearchProps = {
      enumMap,
      dispatch,
      tenantId,
      doubleUnitEnabled,
      customizeFilterForm,
      customizeTable,
      supplierTenantId,
      // detailSelectedRowsList,
      loading: loadingDetailList,
      dataSource: detailSearchList,
      pagination: detailPagination,
      onSearch: this.handleSearch,
      rowSelection: detailRowSelection,
      handleReset: this.handleResetOrderFields,
      onRef: (node) => {
        this.detailForm = node;
      },
      openBOMModal: this.openBOMModal,
    };
    const primaryExportBtnProps = {
      icon: 'export',
      // type: 'primary',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys),
    };
    const poHeaderIds = selectedListRowKeys.join(',');
    const detailCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(detailSelectedRowsList) && isEmpty(detailSelectedRowsList),
    };
    const poLineLocationIds = detailSelectedRowsList.map((e) => e.poLineLocationId).join(',');
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };
    // const getDetailButtons = [
    //   <ExcelExport
    //     data-name="detailExport"
    //     otherButtonProps={primaryExportBtnProps}
    //     requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/supplier/export`}
    //     queryParams={detailQuery}
    //   />,
    //   <ExcelExport
    //     data-name="detailCheckExport"
    //     otherButtonProps={detailCheckExportBtnProps}
    //     buttonText={intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出')}
    //     requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/supplier/export`}
    //     queryParams={{
    //       poLineLocationIds,
    //       supplierTenantId,
    //       customizeUnitCode:
    //         'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL,SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
    //     }}
    //   />,
    // ];
    // const detailQueryParams = {
    //   poLineLocationIds,
    //   supplierTenantId,
    //   customizeUnitCode:
    //     'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL,SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
    // };

    // const listButtons = [
    //   <ExcelExport
    //     data-name="listExport"
    //     otherButtonProps={primaryExportBtnProps}
    //     requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-sup`}
    //     queryParams={listQuery}
    //   />,
    //   <ExcelExport
    //     data-name="listCheckExport"
    //     buttonText={intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出')}
    //     otherButtonProps={listCheckExportBtnProps}
    //     requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-sup`}
    //     queryParams={{
    //       poHeaderIds,
    //       supplierTenantId,
    //       customizeUnitCode:
    //         'SODR.RECEIVED_ORDER_LIST.FILTER_LINE,SODR.RECEIVED_ORDER_LIST.GRID_BY_LINE',
    //     }}
    //   />,
    //   <Button
    //     data-name="listPrinter"
    //     style={{ marginRight: 8 }}
    //     icon="printer"
    //     onClick={this.handleSelectPrint}
    //     disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
    //     loading={printing}
    //     permissionList={[
    //       {
    //         code: `srm.po-admin.so.received-order.ps.button.batchprint`,
    //         type: 'button',
    //         meaning: '我收到的订单-批量打印',
    //       },
    //     ]}
    //   >
    //     {intl.get(`sodr.sendOrder.view.button.print`).d('打印')}
    //   </Button>,
    // ];
    const listButtons = [
      {
        // name: 'listPrinter',
        // group: true,
        // children: [
        //   {
        name: 'listPrinter',
        btnType: 'h0',
        child: intl.get(`sodr.sendOrder.view.button.print`).d('打印'),
        btnProps: {
          style: { marginRight: 8 },
          icon: 'printer',
          onClick: this.handleSelectPrint,
          disabled: isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys),
          loading: printing,
          permissionList: [
            {
              code: `srm.po-admin.so.received-order.ps.button.batchprint`,
              type: 'button',
              meaning: '我收到的订单-批量打印',
            },
          ],
        },
        //   },
        // ],
        // child: (
        //   <Button>
        //     {/* + {intl.get('ssrc.inquiryHall.model.inquiryHall.newRFI').d('新建RFI')}
        //     <Icon type="arrow_drop_down" /> */}
        //   </Button>
        // ),
      },
      {
        name: 'listCheckExport',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-header/export-sup`,
          queryParams: {
            poHeaderIds,
            supplierTenantId,
            customizeUnitCode:
              'SODR.RECEIVED_ORDER_LIST.FILTER_LINE,SODR.RECEIVED_ORDER_LIST.GRID_BY_LINE',
          },
          otherButtonProps: listCheckExportBtnProps,
          buttonText: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        },
      },
      {
        name: 'listExport',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-header/export-sup`,
          queryParams: listQuery,
          otherButtonProps: primaryExportBtnProps,
        },
      },
      {
        name: 'listCheckExportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_SODR_RECEIVE_PO_HEADER',
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-header/export-sup/new-module`,
          queryParams: selectedListRowKeys.length
            ? {
                poHeaderIds,
                supplierTenantId,
                customizeUnitCode:
                  'SODR.RECEIVED_ORDER_LIST.FILTER_LINE,SODR.RECEIVED_ORDER_LIST.GRID_BY_LINE',
              }
            : listQuery,
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.so.received-order.ps.button.newexport',
                type: 'c7n-pro',
                meaning: '我收到的订单-新版导入',
              },
            ],
          },
          buttonText: selectedListRowKeys.length
            ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
            : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
        },
      },
    ];
    const detailButtons = [
      {
        name: 'detailCheckExport',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-location/supplier/export`,
          queryParams: {
            poLineLocationIds,
            supplierTenantId,
            customizeUnitCode:
              'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL,SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
          },
          otherButtonProps: detailCheckExportBtnProps,
          buttonText: intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出'),
        },
      },
      {
        name: 'detailExport',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-location/supplier/export`,
          queryParams: detailQuery,
          otherButtonProps: primaryExportBtnProps,
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_SODR_RECEIVE_PO_LINE_LOCATION',
          requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-location/supplier/export/new-module`,
          queryParams: detailSelectedRowsList.length
            ? {
                poLineLocationIds,
                supplierTenantId,
                customizeUnitCode:
                  'SODR.RECEIVED_ORDER_LIST.FILTER_DETAIL,SODR.RECEIVED_ORDER_LIST.GRID_BY_DETAIL',
              }
            : detailQuery,
          otherButtonProps: {
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.po-admin.so.received-order.ps.button.detailnewexport',
                type: 'c7n-pro',
                meaning: '我收到的订单-详情新版导入',
              },
            ],
          },
          buttonText: detailSelectedRowsList.length
            ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
            : intl.get(`hzero.common.button.newExport`).d('(新)导出'),
        },
      },
    ];

    return (
      <Fragment>
        <Header title={intl.get(`sodr.receivedOrder.view.message.title`).d('我收到的订单')}>
          {radioTab === 'list' ? (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SODR.RECEIVED_ORDER_LIST.BUTTONS', pro: true },
                <DynamicButtons
                  buttons={
                    remote
                      ? remote.process('SODR_RECEIVED_ORDER_PROCESS_HEADER_BUTTON', listButtons, {
                          that: this,
                        })
                      : listButtons
                  }
                />
              )}
              {/* <Button
                onClick={this.handlePrint}
                icon="printer"
                disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
              >
                {intl.get(`hzero.common.button.print`).d('打印')}
              </Button> */}
            </Fragment>
          ) : (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SODR.RECEIVED_ORDER_LIST.DETAIL_BUTTONS', pro: true },
                <DynamicButtons buttons={detailButtons} />
              )}
            </Fragment>
          )}
        </Header>
        <Content className={styles['content-wrapper']}>
          <div
            className={styles['left-order-type']}
            style={{ display: leftVisible ? 'block' : 'none' }}
          >
            <OrderStatusTree
              settings={settings}
              handleSearch={this.handleSearchOrderStatus}
              ref={(node) => {
                this.treeForm = node;
              }}
            />
            <div
              className={styles['left-icon-wrapper']}
              style={{
                display: leftVisible ? 'block' : 'none',
              }}
            >
              <div className={styles['left-trapezoid']} />
              <Icon
                type="menu-fold"
                theme="outlined"
                onClick={this.handleTreeShow}
                className={styles['icon-fold']}
              />
            </div>
          </div>
          <div className={styles['right-content']} style={{ width: leftVisible ? '81%' : '100%' }}>
            <div
              style={{ display: leftVisible ? 'none' : 'block' }}
              className={styles['right-icon-wrapper']}
            >
              <div className={styles['right-trapezoid']} />
              <Icon
                type="menu-unfold"
                theme="outlined"
                onClick={this.handleTreeShow}
                className={styles['icon-unfold']}
              />
            </div>
            {customizeTabPane(
              { code: 'SODR.RECEIVED_ORDER_LIST.TABS', custDefaultActive: this.custDefaultActive },
              <Tabs activeKey={radioTab} onChange={this.handleTabsChange} animated={false}>
                <TabPane tab={intl.get(`sodr.common.view.tab.list`).d('采购订单查询')} key="list">
                  <Order {...listProps} />
                </TabPane>
                <TabPane tab={intl.get(`sodr.common.view.tab.detail`).d('按明细查询')} key="detail">
                  <DetailSearch {...detailSearchProps} />
                </TabPane>
              </Tabs>
            )}
          </div>
        </Content>
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </Fragment>
    );
  }
}
