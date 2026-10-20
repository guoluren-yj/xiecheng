/**
 * PurchaserIndex 平台服务-采购商配置
 * @date: 2018-8-27
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import uuid from 'uuid/v4';
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  filterNullValueObject,
  addItemToPagination,
  delItemToPagination,
  getCurrentOrganizationId,
  getCurrentTenant,
} from 'utils/utils';
import Order from './SubPage/Order';
import Schedule from './SubPage/Schedule';
import Delivery from './SubPage/Delivery';
import Finance from './SubPage/Finance';
import Quality from './SubPage/Quality';
import Menu from '../Menu/index';
import SupplierManage from './SubPage/SupplierManage';
import PurchaseContract from './SubPage/PurchaseContract';
import OrderDefineListModal from './SubPage/OrderDefineListModal';
import ShieldNeedsInf from './SubPage/ShieldNeedsInf';
// import PurchaseRequisitionApprovalConfig from './SubPage/PurchaseRequisitionApprovalConfig';
import PurchaseRequisitionSendBackPurchaseRequest from './SubPage/PurchaseRequisitionSendBackPurchaseRequest';
import Receive from './SubPage/Receive';
import DemandPool from './SubPage/DemandPool';
import OrderMergeRuleModal from './SubPage/OrderMergeRuleModal';
import PurchaserUpdateModal from './SubPage/PurchaserUpdateModal';
import CatalogPurchase from './SubPage/CatalogPurchase';
import SourceManage from './SubPage/SourceManage';
import SplitOrderRuleModal from './SubPage/SplitOrderRuleModal';
import SupplierAddMonitorModal from './SubPage/SupplierAddMonitorModal';
import RiskScanModal from './SubPage/RiskScanModal';
import ImportErpDefaultModal from './SubPage/ImportErpDefaultModal';
import AutoDeductNoteModal from './SubPage/AutoDeductNoteModal';
import GroupManagement from './SubPage/GroupManagement';
import EnableAutomaticOrderCreationModal from './SubPage/EnableAutomaticOrderCreationModal';
import MergeSourceSetModal from './SubPage/MergeSourceSetModal';
import SourceMatterModal from './SubPage/SourceMatterModal';
import MatterDetailModal from './SubPage/MatterDetailModal';
import DemandAutoSubmitModal from './SubPage/DemandAutoSubmitModal';
import styles from '../index.less';

const tenantId = getCurrentOrganizationId();

@connect(({ configServer, loading }) => ({
  configServer,
  minOrderAmountListLoading: loading.effects['configServer/queryMinimumOrderAmountList'],
  addMinimumOrderAmountLoading: loading.effects['configServer/addMinimumOrderAmount'],
  supplierLoading: loading.effects['configServer/fetchSupplierList'],
}))
export default class PurchaserIndex extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      touristVisible: false, // 游客模式自定义列表
      // purchaseRACVisible: false, // 采购申请审批配置
      orderMergeRulesVisible: false, // 订单并单规则
      splitOrderRulesVisible: false, // 目录化采购拆单规则
      supplierAddMonitorVisible: false, // 供应商加入监控
      riskScanVisible: false, // 未加入监控企业的风险扫描
      billUpdateRuleVisible: false, // 需求池采购申请回传
      demandAutoSubmitVisible: false, // 采购申请自动提交
      importErpDefaultVisible: false, // 导入erp默认值
      shieldNeedsInfVisible: false,
      autoDeductNoteVisible: false,
      minOrderAmountVisible: false, // 启用最小下单金额
      mergeSourceSetVisible: false, // 申请转寻源并单
      purchaserUpdateModalVisible: false,
      supplierModalVisible: false, // 最小下单金额的供应商弹框
      configId: '', // 电商&目录化最小下单金额当前行id
      enableAutomaticOrderCreationVisible: false,
      sourceMatterVisible: false, // 寻源事项说明
      matterDetailVisible: false, // 寻源事项说明详情
      sourcePriceLibFlag: false,
      orderCreateFlag: false, // 订单创建配置项
      planFlag: false, // 订单排程单配置项
    };
  }

  componentDidMount() {
    this.fetchDeliverPrint();
    this.fetchSupplierTypeList();
    this.fetchNewOldConfigList();
  }

  @Bind()
  fetchDeliverPrint() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchDeliverPrint',
    });
  }

  /**
   * 改变state
   * @param {*} param
   * @param {*} flag
   * @param {*} [otherParams={}]
   */
  @Bind()
  handleStateVisible(param, flag, otherParams = {}) {
    this.setState(
      {
        [param]: !!flag,
        ...otherParams,
      },
      () => {
        if (param === 'minOrderAmountVisible') this.queryMinimumOrderAmountList();
      }
    );
  }

  @Bind()
  handleRefStateChange(ref, state, fields) {
    if (this[ref]) {
      this[ref].setState(state);
    }
    if (fields && this[ref].props.form) {
      this[ref].props.form.setFieldsValue(fields);
    }
  }

  /**
   * 查询最小下单金额列表
   */
  @Bind()
  queryMinimumOrderAmountList(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/queryMinimumOrderAmountList',
      payload: { page },
    }).then(() => {
      const { minOrderAmountList = [] } = this.props.configServer || {};
      this.resetMinOrderAmountList(minOrderAmountList);
    });
  }

  /**
   * 查询供应商类型
   */
  fetchSupplierTypeList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchSupplierTypeList',
    });
  }

  /**
   * 查询最小下单金额Modal的供应商列表
   */
  @Bind()
  fetchSupplierList(page = {}) {
    const params = this.supplierForm
      ? filterNullValueObject(this.supplierForm.getFieldsValue())
      : {};
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchSupplierList',
      payload: { page, ...params },
    });
  }

  /**
   * 查询当前租户新旧配置显示隐藏列表
   */
  @Bind()
  fetchNewOldConfigList() {
    const { dispatch } = this.props;
    if (getCurrentTenant()) {
      dispatch({
        type: 'configServer/fetchNewOldConfigList',
        payload: {
          tenant: getCurrentTenant().tenantNum,
          tableCode: 'new_old_items_show_hide_cofig',
        },
      }).then((res) => {
        if (res) {
          console.log(res);
          res.forEach((item) => {
            if (item.configItem === 'SOURCE_PRICE_CONFIG_CENTER' && item.showOrHide === 'SHOW') {
              this.setState({
                sourcePriceLibFlag: true,
              });
            }
            else if(item.configItem === 'ORDER_CREATE' && item.showOrHide === 'SHOW'){
              this.setState({
                orderCreateFlag: true,
              });
            }else if(item.configItem === 'PLAN' && item.showOrHide === 'SHOW'){
              this.setState({
                planFlag: true,
              });
            }
          });
        }
      });
    }
  }

  /**
   * 是否启用最小下单金额
   */
  @Bind()
  chooseMinOrderAmountFlag(e) {
    const {
      dispatch,
      configServer: { settings = {} },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: { settings: { ...settings, '011025': e.target.checked ? 1 : 0 } },
    });
  }

  /**
   * 清除最小下单金额列表的缓存
   */
  @Bind()
  resetMinOrderAmountList() {
    const {
      configServer: { minOrderAmountList = [] },
    } = this.props;
    if (minOrderAmountList.length) {
      minOrderAmountList.forEach((item) => {
        const { $form } = item;
        if ($form) $form.resetFields();
      });
    }
  }

  /**
   * lov选择供应商
   */
  @Bind()
  updateMiniOrderAmountList(record = {}) {
    const { configId } = this.state;
    const {
      supplierCompanyId,
      supplierCompanyName,
      supplierCompanyNum,
      supplierType,
      supplierTypeName,
    } = record;
    this.setState({ supplierModalVisible: false }, () => {
      this.updateMinimumOrderAmount(3, configId, {
        supplierCompanyId,
        supplierCompanyName,
        supplierCompanyNum,
        supplierType,
        supplierTypeName,
      });
    });
  }

  /**
   * 打开选择供应商弹框
   */
  @Bind()
  chooseSupplier(configId = '') {
    this.setState({ configId, supplierModalVisible: true }, () => {
      if (this.state.supplierModalVisible) {
        if (this.supplierForm) this.supplierForm.resetFields();
        this.fetchSupplierList();
      }
    });
  }

  /**
   * 新增/删除未保存/编辑的最小下单金额
   * 新增=1，删除未保存=2，编辑=3
   */
  @Bind()
  updateMinimumOrderAmount(type = 0, configId = '', params = {}) {
    const {
      dispatch,
      configServer: { minOrderAmountList = [], minOrderAmountPagination: page = {} },
    } = this.props;
    let newList = [];
    let pagination = {};
    if (type === 1) {
      // 新增
      const newRow = { configId: uuid(), tenantId, _status: 'create' };
      newList = [newRow, ...minOrderAmountList];
      pagination = addItemToPagination(newList, page);
    } else if (type === 2) {
      // 删除未保存
      newList = [...minOrderAmountList.filter((item) => item.configId !== configId)];
      pagination = delItemToPagination(newList, page);
    } else if (type === 3) {
      // 编辑
      const ind = minOrderAmountList.findIndex((item) => item.configId === configId);
      if (ind !== -1) {
        minOrderAmountList[ind] = { ...minOrderAmountList[ind], ...params, edit: true };
        newList = [...minOrderAmountList];
        pagination = page;
      }
    }
    if (newList.length) {
      this.resetMinOrderAmountList();
      dispatch({
        type: 'configServer/updateState',
        payload: {
          minOrderAmountList: newList,
          minOrderAmountPagination: pagination,
        },
      });
    }
  }

  /**
   * 删除已保存的最小下单金额
   */
  @Bind()
  delSavedMinimumOrderAmount(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/delMinimumOrderAmount',
      payload: record,
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryMinimumOrderAmountList();
      }
    });
  }

  /**
   * 保存最小下单金额
   */
  @Bind()
  saveMinimumOrderAmount(list = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/addMinimumOrderAmount',
      payload: list,
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryMinimumOrderAmountList();
      }
    });
  }

  render() {
    const {
      configServer: {
        settings,
        enumMap = {},
        deliverPrint = {},
        minOrderAmountList = [],
        minOrderAmountPagination = {},
        supplierList = [],
        supplierTypeList = [],
        supplierPagination = {},
        configHideArr = [],
      },
      saveCompany,
      saving,
      loading,
      supplierLoading,
      minOrderAmountListLoading,
      addMinimumOrderAmountLoading,
    } = this.props;
    const {
      touristVisible,
      documentCategory,
      priceShieldVisible,
      // purchaseRACVisible,
      orderMergeRulesVisible,
      splitOrderRulesVisible,
      supplierAddMonitorVisible,
      riskScanVisible,
      billUpdateRuleVisible,
      demandAutoSubmitVisible,
      importErpDefaultVisible,
      shieldNeedsInfVisible,
      autoDeductNoteVisible,
      minOrderAmountVisible,
      mergeSourceSetVisible,
      purchaserUpdateModalVisible,
      supplierModalVisible,
      enableAutomaticOrderCreationVisible,
      sourcePriceLibFlag,
      sourceMatterVisible,
      matterDetailVisible,
      sourceMatterRecrd = {},
      orderCreateFlag,
      planFlag,
    } = this.state;
    // const purchaseRACProps = {
    //   visible: purchaseRACVisible,
    //   handleModal: this.handleStateVisible,
    // };
    const billUpdateProps = {
      visible: billUpdateRuleVisible,
      handleModal: this.handleStateVisible,
    };
    const demandAutoSubmitProps = {
      visible: demandAutoSubmitVisible,
      handleModal: this.handleStateVisible,
    };
    const shieldNeedsInfProps = {
      visible: shieldNeedsInfVisible,
      handleModal: this.handleStateVisible,
    };
    const orderMergeRuleProps = {
      visible: orderMergeRulesVisible,
      handleModal: this.handleStateVisible,
    };
    const purchaserUpdateModalProps = {
      visible: purchaserUpdateModalVisible,
      handleModal: this.handleStateVisible,
    };
    const enableAutomaticOrderCreationModalProps = {
      enumMap,
      visible: enableAutomaticOrderCreationVisible,
      handleModal: this.handleStateVisible,
    };

    const splitOrderProps = {
      visible: splitOrderRulesVisible,
      handleModal: this.handleStateVisible,
    };

    const supplierAddMonitorProps = {
      supplierAddMonitorVisible,
      handleModal: this.handleStateVisible,
    };

    const riskScanProps = {
      riskScanVisible,
      handleModal: this.handleStateVisible,
    };

    const importErpDefaultProps = {
      importErpDefaultVisible,
      handleModal: this.handleStateVisible,
    };

    const autoDeductNoteProps = {
      autoDeductNoteVisible,
      handleModal: this.handleStateVisible,
    };

    const mergeSourceProps = {
      mergeSourceSetVisible,
      handleModal: this.handleStateVisible,
    };

    const sourceMatterProps = {
      sourceMatterVisible,
      handleModal: this.handleStateVisible,
    };

    const matterDetailProps = {
      matterDetailVisible,
      sourceMatterRecrd,
      handleModal: this.handleStateVisible,
    };
    // 供应商管理
    const supplierManageProps = {
      settings,
      configHideArr,
      onRef: (node) => {
        this.supplierManageRef = node;
      },
      handleModal: this.handleStateVisible,
    };
    // 目录化采购
    const catalogPurchaseProps = {
      saving,
      loading,
      enumMap,
      settings,
      configHideArr,
      touristVisible,
      supplierList,
      supplierLoading,
      supplierModalVisible,
      supplierTypeList,
      supplierPagination,
      fetchSupplierList: this.fetchSupplierList,
      minOrderAmountList,
      onSave: saveCompany,
      minOrderAmountVisible,
      minOrderAmountListLoading,
      addMinimumOrderAmountLoading,
      pagination: minOrderAmountPagination,
      onHandleSave: this.saveMinimumOrderAmount,
      onDelSaved: this.delSavedMinimumOrderAmount,
      handleUpdate: this.updateMinimumOrderAmount,
      onFetch: this.queryMinimumOrderAmountList,
      handleModal: this.handleStateVisible,
      onOpen: this.chooseSupplier,
      onChoose: this.updateMiniOrderAmountList,
      onRef: (node) => {
        this.catalogRef = node;
      },
      chooseMinOrderAmountFlag: this.chooseMinOrderAmountFlag,
      onSupplierForm: (ref) => {
        this.supplierForm = (ref.props || {}).form;
      },
    };
    // 寻源
    const sourceManageProps = {
      enumMap,
      settings,
      configHideArr,
      sourcePriceLibFlag,
      handleModal: this.handleStateVisible,
      onRef: (node) => {
        this.sourceRef = node;
      },
    };
    // 采购协议
    const purchaseContractProps = {
      enumMap,
      settings,
      configHideArr,
      handleModal: this.handleStateVisible,
      onRef: (node) => {
        this.purchaseContractRef = node;
      },
    };
    // 需求池
    const demandPollProps = {
      enumMap,
      settings,
      configHideArr,
      handleModal: this.handleStateVisible,
      onRef: (node) => {
        this.demandPollRef = node;
      },
    };
    // 订单
    const orderProps = {
      settings,
      enumMap,
      configHideArr,
      onHandleStateChange: this.handleStateVisible,
      onOrderConfig: this.handleStateVisible,
      orderCreateFlag,
      onRef: (node) => {
        this.orderRef = node;
      },
    };
    // 排程单
    const scheduleProps = {
      settings,
      configHideArr,
      onRef: (node) => {
        this.scheduleRef = node;
      },
      handleModal: this.handleStateVisible,
    };
    // 送货单
    const deliveryProps = {
      deliverPrint,
      enumMap,
      settings,
      configHideArr,
      handleModal: this.handleStateVisible,
      onRef: (node) => {
        this.deliveryRef = node;
      },
    };
    // 接收
    const receiveProps = {
      saveCompany,
      enumMap,
      settings,
      configHideArr,
      onHandleShowPurchaseTrans: this.handleStateVisible,
      onRef: (node) => {
        this.receiveRef = node;
      },
      onRefStateChange: this.handleRefStateChange,
    };
    // 财务
    const financeProps = {
      enumMap,
      settings,
      configHideArr,
      onHandleShowMergeRules: this.handleStateVisible,
      // onHandleShowPurchaseTrans: this.handleStateVisible,
      onHandleOnlyInvoiceRule: this.handleStateVisible,
      onHandleBillUpdateRule: this.handleStateVisible,
      onHidePriceDefine: this.handleStateVisible,
      onRef: (node) => {
        this.financeRef = node;
      },
    };
    // 质量
    const qualityProps = {
      enumMap,
      settings,
      configHideArr,
      handleModal: this.handleStateVisible,
      onRef: (node) => {
        this.qualityRef = node;
      },
    };
    // 集团管理
    const groupManagementprops = {
      settings,
      configHideArr,
      onRef: (node) => {
        this.groupManagementRef = node;
      },
    };

    const menuList = [
      {
        key: 1,
        href: 'purSslm',
        title: intl.get(`spfm.configServer.view.title.purchaser.sslm`).d('供应商管理'),
        component: <SupplierManage {...supplierManageProps} />,
      },
      {
        key: 2,
        href: 'purCatalogPurchase',
        title: intl.get(`spfm.configServer.view.catalogPurchase.message.title`).d('目录化采购'),
        component: <CatalogPurchase {...catalogPurchaseProps} />,
      },
      {
        key: 3,
        href: 'purSourceManage',
        title: intl.get(`spfm.configServer.view.sourceManage.message.title`).d('寻源'),
        component: <SourceManage {...sourceManageProps} />,
      },
      {
        key: 4,
        href: 'purChaseContract',
        title: intl.get(`spfm.configServer.view.purchaseContract.message.title`).d('采购协议'),
        component: <PurchaseContract {...purchaseContractProps} />,
      },
      {
        key: 5,
        href: 'purDemandPoll',
        title: intl.get(`spfm.configServer.view.purchaseContract.message.need`).d('需求池'),
        component: <DemandPool {...demandPollProps} />,
      },
      {
        key: 6,
        href: 'purOrder',
        title: intl.get(`spfm.configServer.view.order.message.order`).d('订单'),
        component: <Order {...orderProps} />,
      },
      {
        key: 7,
        href: 'purSchedule',
        showOrHide: planFlag,
        title: intl.get(`spfm.configServer.view.order.message.schedule`).d('排程单'),
        component: <Schedule {...scheduleProps} />,
      },
      {
        key: 8,
        href: 'purDelivery',
        title: intl.get(`spfm.configServer.view.delivery.message.deliver`).d('送货单'),
        component: <Delivery {...deliveryProps} />,
      },
      {
        key: 9,
        href: 'purReceive',
        title: intl.get(`spfm.configServer.view.receive.message.receive`).d('接收'),
        component: <Receive {...receiveProps} />,
      },
      {
        key: 10,
        href: 'purFinance',
        title: intl.get(`spfm.configServer.view.finance.message.message.finance`).d('财务'),
        component: <Finance {...financeProps} />,
      },
      {
        key: 11,
        href: 'purQuality',
        title: intl.get(`spfm.configServer.view.quality.message.quality`).d('质量'),
        component: <Quality {...qualityProps} />,
      },
      {
        key: 12,
        href: 'purGroupManagement',
        title: intl
          .get(`spfm.configServer.view.groupManagement.message.groupManagement`)
          .d('集团管理'),
        component: <GroupManagement {...groupManagementprops} />,
      },
      // { key: 10, href: 'quality', title: '质量' },
      // { key: 11, href: 'notice', title: '公告' },
    ].filter(i => {
     return  (i.href === 'purSchedule' && i.showOrHide) || (i.href !== 'purSchedule')
    });
    return (
      <div className={styles.content}>
        <div className={styles['left-wrapper']}>
          <Menu
            menuList={menuList}
            configHideArr={configHideArr}
            getContainer={() => document.getElementById('config-server-purchaser-scroll-area')}
          />
        </div>
        <div id="config-server-purchaser-scroll-area" className={styles['right-wrapper']}>
          <div className={classnames(styles['config-content'])}>
            {/* <GroupManagement {...groupManagementprops} /> */}
            {menuList.map((o) => {
              if (configHideArr.includes(o.href)) {
                return null;
              } else {
                return o.component;
              }
            })}
          </div>
        </div>
        {priceShieldVisible && (
          <OrderDefineListModal
            documentCategory={documentCategory}
            onHidePriceDefine={this.handleStateVisible}
            priceShieldVisible={priceShieldVisible}
          />
        )}
        {splitOrderRulesVisible && <SplitOrderRuleModal {...splitOrderProps} />}
        {/* {purchaseRACVisible && <PurchaseRequisitionApprovalConfig {...purchaseRACProps} />} */}
        {billUpdateRuleVisible && (
          <PurchaseRequisitionSendBackPurchaseRequest {...billUpdateProps} />
        )}
        {shieldNeedsInfVisible && <ShieldNeedsInf {...shieldNeedsInfProps} />}
        {orderMergeRulesVisible && <OrderMergeRuleModal {...orderMergeRuleProps} />}
        {purchaserUpdateModalVisible && <PurchaserUpdateModal {...purchaserUpdateModalProps} />}
        {enableAutomaticOrderCreationVisible && (
          <EnableAutomaticOrderCreationModal {...enableAutomaticOrderCreationModalProps} />
        )}
        {supplierAddMonitorVisible && <SupplierAddMonitorModal {...supplierAddMonitorProps} />}
        {riskScanVisible && <RiskScanModal {...riskScanProps} />}
        {importErpDefaultVisible && <ImportErpDefaultModal {...importErpDefaultProps} />}
        {autoDeductNoteVisible && <AutoDeductNoteModal {...autoDeductNoteProps} />}
        {mergeSourceSetVisible && <MergeSourceSetModal {...mergeSourceProps} />}
        {sourceMatterVisible && <SourceMatterModal {...sourceMatterProps} />}
        {matterDetailVisible && <MatterDetailModal {...matterDetailProps} />}
        {demandAutoSubmitVisible && <DemandAutoSubmitModal {...demandAutoSubmitProps} />}
      </div>
    );
  }
}
