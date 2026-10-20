/**
 * OrderMaintenanceEntry - 采购订单维护入口
 * @date: 2019-02-27
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
// import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, throttle } from 'lodash';
import { routerRedux } from 'dva/router';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import { stringify } from 'querystring';
import { Bind, Throttle } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject, getDateTimeFormat } from 'utils/utils';
// import { DEFAULT_DATETIME_FORMAT, DATETIME_MAX } from 'utils/constants';
import remotes from 'utils/remote';

import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { deleteCache } from 'components/CacheComponent';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button } from 'components/Permission';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_SPUC } from '_utils/config';

// import { sourcePage } from '../components/utils';
import remoteConfig from './remote';
import { handleOldBudgetVerification, handleOldBatchSubmitWarn } from '@/routes/components/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import OperationRecordModal from './OperationRecordModal';
import CopyOrderModal from './CopyOrderModal';

/**
 * 8D 采购订单维护入口
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} orderMaintenanceEntry - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.LIST.GRID',
    'SODR.ORDER_CREATE_LINE_LIST.LIST.BUTTONS',
    'SODR.ORDER_CREATE_LINE_LIST.LIST.HEADER_BY_REQUEST',
  ],
})
// @cacheComponent({ cacheKey: '/sodr/purchase-order-maintain/list' })
@formatterCollections({
  code: [
    'sodr.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'sodr.orderMaintenanceEntry',
    'entity.business',
    'entity.order',
    'sodr.sendOrder',
    'spcm.orderMaintenanceEntry',
  ],
})
@connect(({ orderMaintenanceEntry, loading }) => ({
  orderMaintenanceEntry,
  loading: {
    orderMaintainLoading: loading.effects['orderMaintenanceEntry/fetchList'],
    opRecordLoading: loading.effects['orderMaintenanceEntry/fetchOperationRecList'],
  },
  submitting: loading.effects['orderMaintenanceEntry/submit'],
  fetchCopyOrderListLoading: loading.effects['orderMaintenanceEntry/fetchCopyOrderList'],
  copyOrderLoading: loading.effects['orderMaintenanceEntry/copyOrder'],
}))
@remotes(...remoteConfig)
export default class OrderMaintenanceEntry extends PureComponent {
  form;

  copyOrderForm;

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      selectedRows: [],
      selectedRowKeys: [],
      currentRecord: {},
      tenantId: getCurrentOrganizationId(),
      // pageSource: sourcePage(),
      // orderType: [],
      copyOrderModalVisible: false,
      // importFlag: 0, // 导入按钮控制标识
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state: { _back } = {} },
      orderMaintenanceEntry: { pagination },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
    dispatch({ type: 'orderMaintenanceEntry/fetchLov' });
    // dispatch({ type: 'orderMaintenanceEntry/fetchOrderMergeRuleList' }).then((res) => {
    //   if (res) {
    //     const importRecord = res.find((item) => item.businessType === 'IMPORT_CHANGE_ORDER');
    //     this.setState({ importFlag: importRecord.enabledFlag });
    //   }
    // });
  }

  /**
   * form元素绑定
   * @param {object} ref - FilterForm对象
   * @memberof PlatformManager
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  updateState(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderMaintenanceEntry/updateState',
      payload,
    });
  }

  /**
   * 条件查询及表格翻页
   * @param {object} fields - 查询参数
   * @param {Boolean} isChangePage 是否由分页器触发的查询
   */
  @Bind()
  handleSearch(fields = {}, sorter, isChangePage = false) {
    const { tenantId } = this.state;
    const {
      dispatch,
      orderMaintenanceEntry: { pagination = {} },
    } = this.props;
    const { pageSize, total } = pagination;
    const page = { pageSize, ...fields };
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateStart:
          formValue.creationDateStart && formValue.creationDateStart.format(getDateTimeFormat()),
        creationDateEnd:
          formValue.creationDateEnd && formValue.creationDateEnd.format(getDateTimeFormat()),
      };
      filterValues = filterNullValueObject(values);
    }
    const payload = {
      page,
      ...filterValues,
      tenantId,
      sort: sorter,
      customizeUnitCode:
        'SODR.ORDER_CREATE_LINE_LIST.LIST.HEADER_BY_REQUEST,SODR.ORDER_CREATE_LINE_LIST.LIST.GRID',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderMaintenanceEntry/fetchList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderMaintenanceEntry/fetchListPage',
          payload,
        });
      }
    });
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  }

  @Bind()
  fetchOperationList(page = {}) {
    const { tenantId, currentRecord } = this.state;
    const { poHeaderId } = currentRecord;
    const { dispatch } = this.props;
    dispatch({
      type: 'orderMaintenanceEntry/fetchOperationRecList',
      payload: {
        tenantId,
        poHeaderId,
        page,
      },
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  cuxSubmitValidateChange(handleSubmit, data) {
    const { remote, dispatch } = this.props;
    const { cuxSubmitValidate } = remote?.props?.process || {};
    const cfmoFlag = typeof cuxSubmitValidate === 'function';
    if (cfmoFlag) {
      cuxSubmitValidate({
        dispatch,
        handleSubmit,
        handleOldBudgetVerification,
        data,
        dispatchObject: {
          type: 'quotePurchaseRequisition/oldBudgetVerification',
          payload: data,
        },
      });
      return cfmoFlag;
    }
    handleOldBudgetVerification(
      dispatch,
      {
        type: 'quotePurchaseRequisition/oldBudgetVerification',
        payload: data,
      },
      handleSubmit
    );
  }

  /**
   * 提交操作
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleSubmit() {
    const { selectedRows = [], tenantId } = this.state;
    const { dispatch, remote } = this.props;
    const type = 'orderMaintenanceEntry/submit';
    const newSelectedRows = selectedRows.map((item) => ({
      ...item,
      viewCode: 'PENDING_LIST_VIEW',
    }));
    const submit = throttle(
      () => {
        dispatch({
          type,
          payload: {
            tenantId,
            prHeaderList: selectedRows,
          },
        }).then((res) => {
          this.handleSearch();
          if (res) {
            notification.success();
          }
        });
      },
      THROTTLE_TIME,
      { trailing: false }
    );
    const handleOldBudget = () => {
      this.cuxSubmitValidateChange(submit, newSelectedRows);
      // handleOldBudgetVerification(
      //   dispatch,
      //   {
      //     type: 'quotePurchaseRequisition/oldBudgetVerification',
      //     payload: newSelectedRows,
      //   },
      //   submit
      // );
    };
    // 列表批量提交新增弱校验
    handleOldBatchSubmitWarn(
      remote,
      dispatch,
      {
        type: 'quotePurchaseRequisition/batchSubmitWarn',
        payload: newSelectedRows,
      },
      handleOldBudget
    );
  }

  // 查询订单复制列表
  @Bind()
  fetchCopyOrderList(page = {}, isChangePage = false) {
    const {
      dispatch,
      orderMaintenanceEntry: {
        copyOrderPagination: { total },
      },
    } = this.props;
    const filterValues = this.copyOrderForm ? this.copyOrderForm.getFieldsValue() : {};
    const payload = {
      page,
      ...filterValues,
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderMaintenanceEntry/fetchCopyOrderList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderMaintenanceEntry/fetchCopyOrderListPage',
          payload,
        });
      }
    });
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  copyOrder(poHeaderId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderMaintenanceEntry/copyOrder',
      payload: {
        poHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.handleViewDetail(res);
      }
    });
  }

  /**
   * 跳转详情页
   * @param {object} record - 表记录
   */
  @Bind()
  handleViewDetail(record = {}) {
    const { poSourcePlatform, sourceBillTypeCode, poHeaderId } = record;
    const { dispatch } = this.props;
    // 整单引用明细
    const sheetPath = `/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation`;
    // 按行引用明细
    const linePath = `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`; // 引用采购申请-目录化
    const request = '/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation'; // 引用采购申请-SRM-ERP-SHOP
    const source = '/sodr/purchase-order-maintain/source-from-requisition/detail'; // 引用寻源
    const create = '/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create'; // 手工创建订单
    switch (sourceBillTypeCode) {
      case 'PURCHASE_REQUEST': // 采购申请
        if (
          poSourcePlatform === 'SRM' ||
          poSourcePlatform === 'ERP' ||
          poSourcePlatform === 'SHOP'
        ) {
          // 来源平台为SRM或ERP
          dispatch(
            routerRedux.push({
              pathname: `${request}`,
              search: `?poHeaderId=${poHeaderId}&source=newRequisition&sourcePage=pageRequest&entrance=maintain&poSourcePlatform=${poSourcePlatform}`,
            })
          );
        }
        if (poSourcePlatform === 'CATALOGUE') {
          // 来源平台为目录化商城
          dispatch(
            routerRedux.push({
              pathname: `${linePath}`,
              search: `?poHeaderId=${poHeaderId}&source=maintain&poSourcePlatform=${poSourcePlatform}`,
            })
          );
        }
        if (poSourcePlatform === 'E-COMMERCE') {
          dispatch(
            routerRedux.push({
              // 当单据来源是 "电商+采购申请" 时跳转整单
              pathname: `${sheetPath}`,
              search: `?poHeaderId=${poHeaderId}&source=maintain`,
            })
          );
        }
        break;
      case 'PURCHASE_ORDER': // 手工创建订单
        dispatch(
          routerRedux.push({
            pathname: `${create}`,
            search: `?poHeaderId=${poHeaderId}&source=newRequisition&entrance=maintain`,
          })
        );
        break;
      case 'CONTRACT_ORDER': // 采购协议
        dispatch(
          routerRedux.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/purchase-agreement`,
            search: `?poHeaderId=${poHeaderId}&source=maintain`,
          })
        );
        break;
      case 'SOURCE': // 寻源
        dispatch(
          routerRedux.push({
            pathname: `${source}/${poHeaderId}`,
            search: `?poHeaderId=${poHeaderId}&source=newRequisition&sourcePage=pageSource&entrance=maintain`,
          })
        );
        break;
      default:
        dispatch(
          routerRedux.push({
            pathname: `${linePath}`,
            search: `?poHeaderId=${poHeaderId}&source=maintain`,
          })
        );
        break;
    }
  }

  /**
   * 跳转引用入口
   * @memberof OrderMaintenanceEntry
   */
  @Bind()
  handleQuotePurReq() {
    const { dispatch } = this.props;
    // 清空缓存
    deleteCache('/sodr/purchase-line-quotation');
    deleteCache('/sodr/investigation-approval');
    dispatch({
      type: 'quotePurchaseRequisition/updateState',
      payload: {
        requisitionLovCache: {},
        // linePagination: {},
        wholePagination: {},
        lastActiveTabKey: 'lineQuotation',
      },
    });
    dispatch(
      routerRedux.push({
        pathname: '/sodr/purchase-order-maintain/quote-purchase-requisition/list',
        // search: '?source=maintain',
      })
    );
  }

  /**
   * 跳转寻源入口
   * @memberof OrderMaintenanceEntry
   */
  @Bind()
  handleSourceOrder(type) {
    const { dispatch } = this.props;
    deleteCache('/sodr/purchase-order-maintain/source-from-requisition/list');
    if (type === 'referSource') {
      // 清除引用寻源model数据
      dispatch({
        type: 'quotePurchaseRequisition/updateState',
        payload: {
          collapse: true,
          // searchForTheSourcePagination: {},
        },
      });
      dispatch(
        routerRedux.push({
          pathname: '/sodr/purchase-order-maintain/source-from-requisition/list',
          // search: '?source=maintain',
        })
      );
    } else {
      // 清除引用采购申请model数据
      dispatch({
        type: 'orderMaintenanceEntry/updateState',
        payload: {
          visible: false,
          orderMaintenanceEntryQuery: {},
          // orderMaintenanceEntryPage: {},
        },
      });
      dispatch(
        routerRedux.push({
          pathname: '/sodr/purchase-order-maintain/purchase/list',
        })
      );
    }
  }

  /**
   * 手工创建订单跳转明细入口
   * @memberof OrderMaintenanceEntry
   */
  @Bind()
  handleCreateOder() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create',
      })
    );
  }

  @Bind()
  handleOperationRecModal(flag = false, currentRecord = {}) {
    this.setState({ modalVisible: !!flag, currentRecord }, () => {
      if (flag) {
        this.fetchOperationList();
      }
    });
  }

  @Bind()
  handleChangeModal(copyOrderModalVisible) {
    this.setState({
      copyOrderModalVisible,
    });
  }

  @Bind()
  handleImportOrder() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/purchase-order-maintain/data-import/SPUC.PO_IMPORT`,
        search: stringify({
          action: intl.get(`sodr.common.view.button.importOrder`).d('导入订单'),
          backPath: '/sodr/purchase-order-maintain/list',
        }),
      })
    );
  }

  render() {
    const {
      loading,
      submitting,
      tenantId,
      customizeFilterForm,
      customizeBtnGroup,
      customizeTable,
      orderMaintenanceEntry: {
        dataSource,
        pagination,
        opRecordPage,
        opRecordDataSource,
        docSource,
        sourcePlatform,
        copyOrderList = [],
        copyOrderPagination = {},
      },
      fetchCopyOrderListLoading,
      match: { path },
      copyOrderLoading,
    } = this.props;
    const {
      modalVisible,
      selectedRowKeys,
      selectedRows,
      copyOrderModalVisible,
      // importFlag,
    } = this.state;
    const filterProps = {
      tenantId,
      docSource,
      sourcePlatform,
      customizeFilterForm,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      dataSource,
      pagination,
      selectedRowKeys,
      customizeTable,
      onChange: this.handleSearch,
      onDetail: this.handleViewDetail,
      onSelectRow: this.handleSelectRow,
      onModalVisible: this.handleOperationRecModal,
      loading: loading.orderMaintainLoading,
    };
    const operationRecordProps = {
      onCancel: this.handleOperationRecModal,
      onFetchOperationList: this.fetchOperationList,
      visible: modalVisible,
      loading: loading.opRecordLoading,
      dataSource: opRecordDataSource,
      pagination: opRecordPage,
    };
    const copyOrderModalProps = {
      copyOrderList,
      onRef: (node) => {
        this.copyOrderForm = node.props.form;
      },
      copyOrderPagination,
      fetchCopyOrderListLoading,
      visible: copyOrderModalVisible,
      copyOrder: this.copyOrder,
      handleViewDetail: this.handleViewDetail,
      handleChangeModal: this.handleChangeModal,
      fetchCopyOrderList: this.fetchCopyOrderList,
      copyOrderLoading,
    };
    const getHeaderButtons = () => {
      const buttons = [
        {
          name: 'submit',
          btnType: 'c7n-pro',
          child: intl.get(`hzero.common.button.submit`).d('提交'),
          btnProps: {
            icon: 'check',
            loading: submitting,
            onClick: this.handleSubmit,
            disabled: !selectedRows
              .map((item) => ['PENDING', 'REJECTED'].includes(item))
              .includes(false),
          },
        },
        {
          name: 'copy',
          btnType: 'c7n-pro',
          child: intl.get(`sodr.common.model.common.copyOrder`).d('复制采购订单'),
          btnProps: {
            icon: 'baseline-file_copy',
            onClick: () => this.handleChangeModal(true),
          },
        },
        {
          name: 'import',
          btnType: 'c7n-pro',
          child: intl.get(`sodr.common.view.button.importOrder`).d('导入订单'),
          btnProps: {
            onClick: this.handleImportOrder,
          },
        },
        {
          name: 'newImport',
          btnComp: CommonImport,
          childFor: 'buttonText',
          child: intl.get(`sodr.common.view.button.newOrderImport`).d('(新)导入订单'),
          btnProps: {
            businessObjectTemplateCode: 'SPUC.PO_IMPORT',
            prefixPatch: SRM_SPUC,
            args: { newImportFlag: 1 },
            refreshButton: true,
            successCallBack: () => {
              this.handleSearch();
            },
            buttonProps: {
              permissionList: [
                {
                  code: 'srm.po-admin.po.po-change.ps.button.newimport',
                  type: 'c7n-pro',
                  meaning: '订单维护-新版导入按钮',
                },
              ],
            },
          },
        },
        {
          name: 'manualCreate',
          btnType: 'c7n-pro',
          child: intl.get(`${prefix}.createOrder`).d('手工创建订单'),
          btnProps: {
            icon: 'add',
            onClick: this.handleCreateOder,
          },
        },
        {
          name: 'referSource',
          btnType: 'c7n-pro',
          child: intl.get(`${prefix}.source`).d('引用寻源结果'),
          btnProps: {
            icon: 'source-finding',
            onClick: () => this.handleSourceOrder('referSource'),
          },
        },
        {
          name: 'referContract',
          btnType: 'c7n-pro',
          child: intl.get(`${prefix}.contract`).d('​引用采购协议'),
          btnProps: {
            onClick: () => this.handleSourceOrder('referContract'),
          },
        },
        {
          name: 'referPurchaseRequest',
          btnComp: Button,
          child: intl.get(`${prefix}.referPurchaseRequest`).d('引用采购申请'),
          btnProps: {
            type: 'primary',
            icon: 'procurement-application',
            onClick: this.handleQuotePurReq,
            permissionList: [
              {
                code: `${path}.button.referPurchaseRequest`,
                type: 'button',
                meaning: '订单维护-引用采购申请',
              },
            ],
          },
        },
      ];
      return customizeBtnGroup(
        { code: 'SODR.ORDER_CREATE_LINE_LIST.LIST.BUTTONS', pro: true },
        <DynamicButtons buttons={buttons} />
      );
    };
    const prefix = 'sodr.orderMaintenanceEntry.view.message';
    return (
      <React.Fragment>
        <Header title={intl.get(`${prefix}.orderMainTitle`).d('订单维护')}>
          {getHeaderButtons()}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
          <OperationRecordModal {...operationRecordProps} />
        </Content>
        {copyOrderModalVisible && <CopyOrderModal {...copyOrderModalProps} />}
      </React.Fragment>
    );
  }
}
