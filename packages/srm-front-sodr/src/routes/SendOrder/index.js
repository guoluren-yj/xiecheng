/*
 * SendOrder - 我发出的订单
 * @date: 2018/10/13 11:39:51
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Icon, Tabs, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isArray, throttle } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button } from 'components/Permission';
import { stringify, parse } from 'querystring';
import { Header, Content } from 'components/Page';
// import Icons from 'components/Icons';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import remotes from 'utils/remote';

import Order from './List';
import DetailSearch from './DetailSearch';
import OrderStatusTree from './OrderStatusTree';
import WrapperBOMModal from './DetailSearch/BOMModal';
import styles from './index.less';
import Icons from '../components/Icons';
import { getJsonBlob, queryCommonDoubleUomConfig } from '../components/utils';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { fetchConfigSheet } from '@/services/commonService';
import remoteConfig from './remote';

const messagePrompt = 'sodr.sendOrder.view.message';
const buttonPrompt = 'sodr.sendOrder.view.button';
// const modelPrompt = 'sodr.sendOrder.model.common';
const titlePrompt = 'sodr.sendOrder.view.title';
const { TabPane } = Tabs;

/**
 * 我发出的订单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} sendOrder - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@remotes(...remoteConfig)
@formatterCollections({
  code: [
    'sodr.sendOrder',
    'entity.company',
    'entity.order',
    'entity.supplier',
    'entity.business',
    'entity.item',
    'entity.organization',
    'sodr.orderCancel',
    'sodr.receivedOrder',
    'sodr.common',
    'entity.attachment',
    'sprm.common',
    'sprm.purchaseReqCreation',
    'sodr.quotePurchaseRequisition',
    'hfile.fileAggregate',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.SEND_ORDER_LIST.FILTER_LINE',
    'SODR.SEND_ORDER_LIST.FILTER_DETAIL',
    'SODR.SEND_ORDER_LIST.GRID_BY_LINE',
    'SODR.SEND_ORDER_LIST.FRID_BY_DETAIL',
    'SODR.SEND_ORDER_LIST.FRID_BY_DETAIL_BUTTONS',
    'SODR.SEND_ORDER_LIST.FRID_BY_LIST_BUTTONS',
    'SODR.SEND_ORDER_LIST.TABS',
  ],
})
@connect(({ loading, sendOrder }) => ({
  loadingList: loading.effects['sendOrder/querySendOrderList'],
  loadingDetailList: loading.effects['sendOrder/fetchDetailSearchList'],
  processingUrgent: loading.effects['sendOrder/listUrgent'],
  cancelingUrgent: loading.effects['sendOrder/listCancelUrgent'],
  printing: loading.effects['sendOrder/printSelectedList'],
  queryPoItemBOMLoading: loading.effects['sendOrder/queryPoItemBOM'],
  fetchDetailSearchListPageLoading: loading.effects['sendOrder/fetchDetailSearchListPage'],
  sendOrder,
}))
export default class SendOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      selectedListRowKeys: [],
      detailSelectedRowsList: [], // 明细选中行
      settings: {},
      orderList: [],
      detailSearchList: [],
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
      doubleUnitEnabled: 0,
      isExitConfigFlag: false, // 是否在配置表标识
    };
  }

  componentDidMount() {
    this.handleQueryConfig();
    this.queryDoubleUomConfig();
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      location: { state: { _back } = {}, search },
    } = this.props;
    if (search !== prevProps.location.search) {
      this.setUrlParams();
      this.handleQuery();
    }
    if (!custLoading && prevProps.custLoading !== custLoading) {
      this.fetchSettings();
      if (_back !== -1) {
        this.props.dispatch({
          type: 'sendOrder/init',
        });
        this.props.dispatch({
          type: 'sendOrder/updateState',
          payload: { treeFields: {} },
        });
      } else {
        this.setModelDataToTree();
      }
    }
  }

  // 查询配置表逻辑
  @Bind()
  async handleQueryConfig() {
    const res = await fetchConfigSheet({
      configCode: 'sodr_old_export_user_get_tenant',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        this.setState({
          isExitConfigFlag: true,
        });
      }
    }
  }

  @Bind()
  handleQuery(key) {
    const {
      sendOrder: { listPagination, detailPagination },
    } = this.props;
    if (key === 'list' && this.listForm) {
      this.handleSearch(listPagination, {}, true, key);
    } else if (key === 'detail' && this.detailForm) {
      this.handleSearch(detailPagination, {}, true, key);
    }
  }

  // 设置url参数
  @Bind()
  setUrlParams() {
    const {
      location: { search },
      sendOrder: { radioTab },
    } = this.props;
    const seachData = parse(search.substr(1));
    // 只处理整单场景
    if (radioTab === 'list' && this.listForm) {
      const { form } = this.listForm.searchForm.props;
      if (!form) return;
      let resetFlag = false; // 重置一次
      Object.keys(seachData).forEach((item) => {
        const formData = form.getFieldsValue();
        if (Object.keys(formData).includes(item)) {
          if (!resetFlag) {
            form.resetFields();
            resetFlag = true;
          }
          form.setFieldsValue({
            [item]: seachData[item],
          });
        }
      });
    }
  }

  // 查询配置中心配置
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          settings: res,
        });
      }
    });
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

  // 把model里面缓存的树的数据设置到OrderTypeTree上
  @Bind()
  setModelDataToTree() {
    const {
      sendOrder: { currentLi },
    } = this.props;
    if (this.treeForm) {
      this.treeForm.setState({ currentLi });
      // setTimeout(this.treeForm.setState({ currentLi }), 0);
    }
  }

  /**
   * 根据当前tab来请求对应的列表
   * @param {Object} page
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
    const {
      sendOrder: { listSort, detailSort, radioTab: oldRadioTab, detailPagination },
    } = this.props;
    const radioTab = radioTabParam || oldRadioTab;
    const initTreeFields = {};
    const treeFields = clearFlag
      ? initTreeFields
      : isEmpty(otherParams)
      ? (!isEmpty(this.props.sendOrder.treeFields) && this.props.sendOrder.treeFields) ||
        initTreeFields
      : otherParams;
    if (radioTab === 'list' && this.listForm) {
      const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
      const handleFormValues = this.handleFormQuery(fields, radioTab);
      this.handleSearchList({
        page,
        ...treeFields,
        ...handleFormValues,
        sort: { ...listSort, ...sorter },
        customizeUnitCode: 'SODR.SEND_ORDER_LIST.FILTER_LINE,SODR.SEND_ORDER_LIST.GRID_BY_LINE',
        asyncCountFlag: 'DEFAULT',
        ...(isChangePage ? { oldTotalElements: detailPagination.total } : null),
      });
      this.setState({ selectedListRowKeys: [] });
    } else if (radioTab === 'detail' && this.detailForm) {
      const detailFields = this.detailForm
        ? this.detailForm.searchForm.props.form.getFieldsValue()
        : {};
      const detailHandleFormValues = this.handleFormQuery(detailFields, radioTab);
      this.handleSearchDetailList({
        page,
        ...treeFields,
        ...detailHandleFormValues,
        customizeUnitCode: 'SODR.SEND_ORDER_LIST.FILTER_DETAIL,SODR.SEND_ORDER_LIST.FRID_BY_DETAIL',
        sort: { ...detailSort, ...sorter },
        asyncCountFlag: 'DEFAULT',
        ...(isChangePage ? { oldTotalElements: detailPagination.total } : null),
      });
      this.setState({ detailSelectedRowsList: [], orderList: [] });
    }
  }

  // 列表整单加急
  @Bind()
  handleListUrgent() {
    const {
      dispatch,
      sendOrder: { listPagination },
    } = this.props;
    const { tenantId, selectedListRowKeys, orderList } = this.state;
    if (selectedListRowKeys.length > 0) {
      const poHeaders = orderList
        .filter((item) => selectedListRowKeys.indexOf(item.poHeaderId) >= 0)
        .map((item) => {
          const { poHeaderId, objectVersionNumber, _token } = item;
          return {
            _token,
            tenantId,
            poHeaderId,
            objectVersionNumber,
          };
        });
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmUrgent`).d('是否确认整单加急'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'sendOrder/listUrgent',
              payload: poHeaders,
            }).then((res) => {
              if (res) {
                this.setState({ selectedListRowKeys: [] });
                notification.success();
                this.handleSearch(listPagination);
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

  // 列表取消加急
  @Bind()
  handleCancelUrgent() {
    const {
      dispatch,
      sendOrder: { listPagination },
    } = this.props;
    const { tenantId, selectedListRowKeys, orderList } = this.state;
    if (selectedListRowKeys.length > 0) {
      const poHeaders = orderList
        .filter((item) => selectedListRowKeys.indexOf(item.poHeaderId) >= 0)
        .map((item) => {
          const { poHeaderId, objectVersionNumber, _token } = item;
          return {
            _token,
            tenantId,
            poHeaderId,
            objectVersionNumber,
          };
        });
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmCancelUrgent`).d('是否确认取消整单加急'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'sendOrder/listCancelUrgent',
              payload: poHeaders,
            }).then((res) => {
              if (res) {
                this.setState({ selectedListRowKeys: [] });
                notification.success();
                this.handleSearch(listPagination);
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
   *  明细加急
   */
  @Bind()
  handleDetailUrgent() {
    const {
      dispatch,
      sendOrder: { detailPagination },
    } = this.props;
    const { detailSelectedRowsList } = this.state;
    if (!isEmpty(detailSelectedRowsList)) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmDetailUrgent`).d('是否确认加急'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'sendOrder/detailUrgent',
              payload: detailSelectedRowsList,
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleSearch(detailPagination);
                this.setState({ detailSelectedRowsList: [] });
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
   * 明细取消加急
   * */
  @Bind()
  handleCancelDetailUrgent() {
    const {
      dispatch,
      sendOrder: { detailPagination },
    } = this.props;
    const { detailSelectedRowsList } = this.state;
    if (!isEmpty(detailSelectedRowsList)) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmCancelDetailUrgent`).d('是否确认取消加急'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            dispatch({
              type: 'sendOrder/detailCancelUrgent',
              payload: detailSelectedRowsList,
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleSearch(detailPagination);
                this.setState({ detailSelectedRowsList: [] });
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

  // 我发出的订单列表查询
  @Bind()
  handleSearchList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/querySendOrderList',
      payload: fields,
    }).then((res) => {
      if (res) {
        const currentLi = this.treeForm ? this.treeForm.state.currentLi : false;
        this.setState({
          orderList: ['NOTEVALUATED', 'EVALUATED'].includes(currentLi)
            ? this.renderDataSource(res.content, currentLi, true)
            : res.content,
        });
        if (res.needCountFlag === 'Y') {
          dispatch({
            type: 'sendOrder/querySendOrderListPage',
            payload: fields,
          });
        }
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
      type: 'sendOrder/updateState',
      payload: { currentLi: null, treeFields: {} },
    });
    if (this.treeForm) {
      this.treeForm.setState({ currentLi: null });
    }
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
      type: 'sendOrder/updateState',
      payload: { currentLi: newCurrentLi, treeFields: fields },
    });
    this.handleSearch({}, fields, newCurrentLi === 'all' ? true : !newCurrentLi);
  }

  /**
   * 明细选中行改变
   * @param {Object} selectedRows
   */
  @Bind()
  handleDetailSelectedRows(selectedRowKeys, selectedRows) {
    // 选中时添加标记以便个性化功能使用
    const { detailSearchList } = this.state;
    const cuzOrderList = detailSearchList.map((order) => {
      order.cuz_selected = selectedRowKeys.includes(order.poLineLocationId); // eslint-disable-line
      return order;
    });
    if (cuzOrderList.length) {
      this.setState({ detailSearchList: cuzOrderList });
    }
    this.setState({
      detailSelectedRowsList: selectedRows,
    });
  }

  /**
   * 按明细查询
   * @param {Object} fields
   */
  @Bind()
  handleSearchDetailList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/fetchDetailSearchList',
      payload: fields,
    }).then((res) => {
      if (res) {
        const currentLi = this.treeForm ? this.treeForm.state.currentLi : false;
        this.setState({
          detailSearchList: ['NOTEVALUATED', 'EVALUATED'].includes(currentLi)
            ? this.renderDataSource(res.content, currentLi)
            : res.content,
        });
        if (res.needCountFlag === 'Y') {
          dispatch({
            type: 'sendOrder/fetchDetailSearchListPage',
            payload: fields,
          });
        }
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

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleListRowSelectChange(newSelectedRowKeys) {
    // 选中时添加标记以便个性化功能使用
    const { orderList } = this.state;
    const cuzOrderList = orderList.map((order) => {
      order.cuz_selected = newSelectedRowKeys.includes(order.poHeaderId); // eslint-disable-line
      return order;
    });
    if (cuzOrderList.length) {
      this.setState({ orderList: cuzOrderList });
    }
    this.setState({ selectedListRowKeys: newSelectedRowKeys });
  }

  /**
   * 切tab页
   * @param {Object} fields
   */
  @Bind()
  handleTabsChange(key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendOrder/updateState',
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
      sendOrder: { leftVisible },
    } = this.props;
    dispatch({
      type: 'sendOrder/updateState',
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
        'confirmDateStart',
        'confirmDateEnd',
      ];
    } else {
      timeArray = [
        'releasedDateStart',
        'releasedDateEnd',
        'creationDateStart',
        'creationDateEnd',
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
   * EXCEL导入
   */
  @Bind()
  handleRoleImport() {
    const { history } = this.props;
    const { tenantId } = this.state;
    history.push({
      pathname: '/sodr/send-order/data-import/PR.URGE_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: '/sodr/send-order/list',
        args: JSON.stringify({
          tenantId,
          templateCode: 'PR.URGE_IMPORT',
        }),
      }),
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  @Throttle(THROTTLE_TIME, { trailing: false })
  handlePrint() {
    const { dispatch } = this.props;
    const { selectedListRowKeys } = this.state;
    const poHeaderIdList = selectedListRowKeys;
    dispatch({
      type: 'sendOrder/printList',
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

  @Bind()
  handleSelectPrint() {
    const { dispatch } = this.props;
    const { selectedListRowKeys } = this.state;
    const poHeaderIdList = selectedListRowKeys;
    dispatch({
      type: 'sendOrder/printSelectedList',
      poHeaderIdList,
    }).then((res) => {
      if (res && res.type !== 'application/json') {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      } else if (res) {
        getJsonBlob(res)
          .then((response) => {
            notification.error({ message: response.message });
          })
          .catch((error) => {
            console.error('Error print:', error);
          });
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
      type: 'sendOrder/queryPoItemBOM',
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
      sendOrder: { radioTab, radioTabInitFlag },
    } = this.props;
    if (!radioTabInitFlag) {
      dispatch({
        type: 'sendOrder/updateState',
        payload: {
          radioTabInitFlag: true,
        },
      });
      if (defaultActive && defaultActive !== radioTab) {
        this.handleTabsChange(defaultActive);
      }
    }
  }

  // 将数据里面的某些字段转换为数组
  @Bind()
  getDataConversion(object, type) {
    let list = [];
    if (type === 'list') {
      list = [
        'statusCodes',
        'supplierCategoryIds',
        'lineStatusCodes',
        'notQueryStatusCodes',
        'poHeaderIds',
        'operationList',
        'queryPoHeaderIdSet',
        'fieldCodes',
        'supplierCompanyIds',
        'supplierIds',
        'feedbackLocIds',
        'fundFeedLocIds',
        'poHeaderIdList',
        'existTermLineIds',
        'poNumList',
        'interfaceStatusList',
        'interfaceTypeEdiList',
        'interfaceStatusEdiList',
        'peSupplierParam',
      ];
    } else {
      list = [
        'canCreatePlanIdList',
        'itemNameList',
        'poItemNameList',
        'poItemCodeList',
        'supplierCompanyIds',
        'supplierIds',
        'asnLineList',
        'itemCodes',
        'categoryIds',
        'poHeaderIdList',
        'strategyHeaderIdList',
        'interfaceTypeList',
        'peSupplierParam',
        'poLineLocationIds',
        'statusCodes',
        'planIdList',
        'notQueryStatusCodes',
        'invOrganizationIds',
        'supplierCategoryIds',
        'fieldCodes',
      ];
    }
    let obj = {};
    // eslint-disable-next-line guard-for-in
    for (const key in object) {
      if (list.includes(key) && object[key] && !isArray(object[key])) {
        obj = {
          ...obj,
          [key]: object[key].split(','),
        };
      } else {
        obj = {
          ...obj,
          [key]: object[key],
        };
      }
    }
    return obj;
  }

  render() {
    const {
      tenantId,
      selectedListRowKeys,
      detailSelectedRowsList,
      settings,
      orderList = [],
      doubleUnitEnabled,
      detailSearchList = [],
      actionListRowData = {},
      wrapperBOMModalVisible,
      isExitConfigFlag = false,
    } = this.state;
    const {
      remote,
      customizeTable,
      sendOrder: {
        enumMap,
        leftVisible,
        // orderList,
        listPagination,
        // detailSearchList,
        detailPagination,
        listQuery,
        detailQuery,
        radioTab,
      },
      loadingList,
      loadingDetailList,
      processingUrgent,
      cancelingUrgent,
      dispatch,
      customizeFilterForm,
      printing,
      queryPoItemBOMLoading,
      customizeBtnGroup,
      customizeTabPane,
      // fetchDetailSearchListPageLoading,
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
      tenantId,
      customizeFilterForm,
      customizeTable,
      onSearch: this.handleSearch,
      onSearchPaging: this.handleSearch,
      handleReset: this.handleResetOrderFields,
      loading: loadingList,
      dataSource: orderList,
      pagination: listPagination,
      rowSelection: listRowSelection,
      onRef: (node) => {
        this.listForm = node;
      },
      setUrlParams: this.setUrlParams,
      remote,
    };
    const detailSearchProps = {
      enumMap,
      tenantId,
      doubleUnitEnabled,
      customizeFilterForm,
      customizeTable,
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
      remote,
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys),
    };
    const baseExportBtnProps = {
      icon: 'export',
      // disabled: exportButtonDisabled,
    };
    const detailCheckExportBtnProps = {
      ...baseExportBtnProps,
      disabled: isArray(detailSelectedRowsList) && isEmpty(detailSelectedRowsList),
    };
    const poHeaderIds = selectedListRowKeys.join(',');
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
    let exportParams = {};
    if (!isEmpty(listQuery)) {
      exportParams = {
        ...exportParams,
        ...listQuery,
      };
    }
    if (!isEmpty(selectedListRowKeys)) {
      exportParams = {
        ...exportParams,
        poHeaderIds,
      };
    }
    return (
      <React.Fragment>
        <Header title={intl.get(`${titlePrompt}.mySendOutOrder`).d('我发出的订单')}>
          {radioTab === 'list' ? (
            <React.Fragment>
              {customizeBtnGroup({ code: 'SODR.SEND_ORDER_LIST.FRID_BY_LIST_BUTTONS' }, [
                <Button
                  data-name="listExpedited"
                  type="primary"
                  onClick={this.handleListUrgent}
                  loading={processingUrgent}
                  disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.wholeurgent`,
                      type: 'button',
                      meaning: '我发出的订单-整单加急',
                    },
                  ]}
                >
                  <Icons size={16} type="main-urgent" />
                  {intl.get(`${buttonPrompt}.wholeUrgent`).d('整单加急')}
                </Button>,
                <Button
                  data-name="listCancelExpedited"
                  onClick={this.handleCancelUrgent}
                  loading={cancelingUrgent}
                  disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.cancelwholeurgent`,
                      type: 'button',
                      meaning: '我发出的订单-整单取消加急',
                    },
                  ]}
                >
                  <Icons size={16} type="main-cancel-urgent" />
                  {intl.get(`${buttonPrompt}.cancelWholeUrgent`).d('整单取消加急')}
                </Button>,
                <ExcelExportPro
                  key="listExportPro"
                  data-name="listExportPro"
                  type="c7n-pro"
                  templateCode="SRM_SODR_SEND_PO_HEADER" // 导出模板编码
                  otherButtonProps={{
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.po-admin.po.sended-order.ps.button.wholenewexport',
                        meaning: '我发出的订单-整单新版导出',
                      },
                    ],
                  }}
                  buttonText={
                    isEmpty(selectedListRowKeys)
                      ? intl.get(`hzero.common.button.newExport`).d('(新)导出')
                      : intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
                  } // 导出按钮文本
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-pur/new-module`} // 导出请求路径
                  queryParams={{
                    ...exportParams,
                    customizeUnitCode:
                      'SODR.SEND_ORDER_LIST.FILTER_LINE,SODR.SEND_ORDER_LIST.GRID_BY_LINE',
                  }} // 导出请求参数
                />,
                <ExcelExport
                  method={isExitConfigFlag ? 'GET' : 'POST'}
                  data-name="listExport"
                  otherButtonProps={baseExportBtnProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-pur`}
                  queryParams={
                    isExitConfigFlag ? listQuery : this.getDataConversion(listQuery, 'list')
                  }
                />,
                <ExcelExport
                  method={isExitConfigFlag ? 'GET' : 'POST'}
                  data-name="listCheckExport"
                  buttonText={intl.get(`${buttonPrompt}.checkExport`).d('勾选导出')}
                  otherButtonProps={listCheckExportBtnProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-header/export-pur`}
                  queryParams={{
                    poHeaderIds: selectedListRowKeys,
                    customizeUnitCode:
                      'SODR.SEND_ORDER_LIST.FILTER_LINE,SODR.SEND_ORDER_LIST.GRID_BY_LINE',
                  }}
                />,
                <Button
                  data-name="listPrinter"
                  style={{ marginRight: 8 }}
                  icon="printer"
                  onClick={this.handleSelectPrint}
                  disabled={isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys)}
                  loading={printing}
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.batchprint`,
                      type: 'button',
                      meaning: '我发出的订单-批量打印',
                    },
                  ]}
                >
                  {intl.get(`${buttonPrompt}.print`).d('打印')}
                </Button>,
                <CommonImport
                  data-name="listImportPro"
                  businessObjectTemplateCode="PR.URGE_IMPORT"
                  prefixPatch={SRM_SPUC}
                  refreshButton
                  buttonText={intl
                    .get(`hzero.common.button.newBatchUrgentImport`)
                    .d('(新)批量导入加急')}
                  args={{ tenantId, newImportFlag: 1 }} // 上传参数
                  successCallBack={() => this.handleSearch(listPagination, {}, true)} // 导入成功的回调
                  buttonProps={{
                    permissionList: [
                      {
                        code: `srm.po-admin.po.sended-order.ps.button.wholenewimport`,
                        type: 'button',
                        meaning: '我发出的订单-整单新版批量导入',
                      },
                    ],
                  }} // 导入按钮属性
                />,
                <Button
                  data-name="listImport"
                  className={styles['btn-header']}
                  onClick={this.handleRoleImport}
                  type="default"
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.wholeimport`,
                      type: 'button',
                      meaning: '我发出的订单-整单-批量导入加急',
                    },
                  ]}
                >
                  <Icons type="main-import" style={{ marginRight: '8px' }} />
                  {intl.get(`${buttonPrompt}.come`).d('批量导入加急')}
                </Button>,
              ])}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {customizeBtnGroup({ code: 'SODR.SEND_ORDER_LIST.FRID_BY_DETAIL_BUTTONS' }, [
                <Button
                  data-name="batchImportExpedited"
                  className={styles['btn-header']}
                  onClick={this.handleRoleImport}
                  // type="default"
                  type="main-import"
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.detailimport`,
                      type: 'button',
                      meaning: '我发出的订单-明细-批量导入加急',
                    },
                  ]}
                >
                  <Icons type="main-import" style={{ marginRight: '8px' }} />
                  {intl.get(`${buttonPrompt}.come`).d('批量导入加急')}
                </Button>,
                <CommonImport
                  data-name="importPro"
                  businessObjectTemplateCode="PR.URGE_IMPORT"
                  prefixPatch={SRM_SPUC}
                  refreshButton
                  buttonText={intl
                    .get(`hzero.common.button.newBatchUrgentImport`)
                    .d('(新)批量导入加急')}
                  args={{ tenantId, newImportFlag: 1 }} // 上传参数
                  successCallBack={() => this.handleSearch(detailPagination, {}, true)} // 导入成功的回调
                  buttonProps={{
                    permissionList: [
                      {
                        code: `srm.po-admin.po.sended-order.ps.button.newimport`,
                        type: 'button',
                        meaning: '我发出的订单-明细-新版批量导入加急',
                      },
                    ],
                  }}
                />,
                <ExcelExport
                  method={isExitConfigFlag ? 'GET' : 'POST'}
                  data-name="checkExport"
                  otherButtonProps={detailCheckExportBtnProps}
                  buttonText={intl.get(`${buttonPrompt}.checkExport`).d('勾选导出')}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/purchaser/export`}
                  queryParams={{
                    poLineLocationIds: detailSelectedRowsList.map((e) => e.poLineLocationId),
                    customizeUnitCode:
                      'SODR.SEND_ORDER_LIST.FILTER_DETAIL,SODR.SEND_ORDER_LIST.FRID_BY_DETAIL',
                  }}
                />,
                <ExcelExport
                  method={isExitConfigFlag ? 'GET' : 'POST'}
                  data-name="export"
                  otherButtonProps={baseExportBtnProps}
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/purchaser/export`}
                  queryParams={
                    isExitConfigFlag ? detailQuery : this.getDataConversion(detailQuery, 'detail')
                  }
                />,
                <ExcelExportPro
                  key="exportPro"
                  data-name="exportPro"
                  templateCode="SRM_C_SODR_SEND_PO_LINE_LOCATION" // 导出模板编码
                  otherButtonProps={{
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.po-admin.po.sended-order.ps.button.newexport',
                        type: 'button',
                        meaning: '我发出的订单-新版导出',
                      },
                    ],
                  }}
                  buttonText={
                    isEmpty(detailSelectedRowsList)
                      ? intl.get(`hzero.common.button.newExport`).d('(新)导出')
                      : intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
                  } // 导出按钮文本
                  requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/purchaser/export/new-module`} // 导出请求路径
                  queryParams={
                    detailSelectedRowsList.length
                      ? {
                          poLineLocationIds,
                          customizeUnitCode:
                            'SODR.SEND_ORDER_LIST.FILTER_DETAIL,SODR.SEND_ORDER_LIST.FRID_BY_DETAIL',
                        }
                      : {
                          ...detailQuery,
                          customizeUnitCode:
                            'SODR.SEND_ORDER_LIST.FILTER_DETAIL,SODR.SEND_ORDER_LIST.FRID_BY_DETAIL',
                        }
                  }
                />,
                <Button
                  data-name="cancelExpedited"
                  type="default"
                  onClick={this.handleCancelDetailUrgent}
                  disabled={isArray(detailSelectedRowsList) && isEmpty(detailSelectedRowsList)}
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.canceldetailurgent`,
                      type: 'button',
                      meaning: '我发出的订单-取消加急',
                    },
                  ]}
                >
                  <Icons size={16} type="main-cancel-urgent" />
                  {intl.get(`${buttonPrompt}.cancelDetailUrgent`).d('取消加急')}
                </Button>,
                <Button
                  data-name="expedited"
                  type="primary"
                  onClick={this.handleDetailUrgent}
                  disabled={isArray(detailSelectedRowsList) && isEmpty(detailSelectedRowsList)}
                  permissionList={[
                    {
                      code: `srm.po-admin.po.sended-order.ps.button.detailurgent`,
                      type: 'button',
                      meaning: '我发出的订单-加急',
                    },
                  ]}
                >
                  <Icons size={16} type="main-urgent" />
                  {intl.get(`${buttonPrompt}.detailUrgent`).d('加急')}
                </Button>,
              ])}
            </React.Fragment>
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
              onRef={(node) => {
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
              {
                code: 'SODR.SEND_ORDER_LIST.TABS',
                custDefaultActive: this.custDefaultActive,
              },
              <Tabs activeKey={radioTab} onChange={this.handleTabsChange} animated={false}>
                <TabPane
                  tab={intl.get(`${titlePrompt}.orderListSearch`).d('采购订单查询')}
                  key="list"
                >
                  <Order {...listProps} />
                </TabPane>
                <TabPane tab={intl.get(`${titlePrompt}.detailSearch`).d('按明细查询')} key="detail">
                  <DetailSearch {...detailSearchProps} />
                </TabPane>
              </Tabs>
            )}
          </div>
        </Content>
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </React.Fragment>
    );
  }
}
