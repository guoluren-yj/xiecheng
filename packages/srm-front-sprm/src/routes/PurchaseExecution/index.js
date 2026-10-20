import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { DataSet, Tabs, Modal, Icon } from 'choerodon-ui/pro';
import { compose, isEmpty, isArray, cloneDeep, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';
import { connect } from 'dva';

import intl from 'utils/intl';
// import Icons from 'components/Icons';
import withProps from 'utils/withProps';
import { SRM_SPRM, SRM_SSRC } from '_utils/config';
import notification from 'utils/notification';
import { Button } from 'components/Permission';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import cuxRemote from 'hzero-front/lib/utils/remote';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';

import './index.less';
import getPermissions from '@/routes/components/Permission/getPermissions';
import {
  check,
  poFromPrLineNewCheck,
  updateReferPrice,
  handleQuoteApprovalDate,
  queryAssignList,
  handleBiddingDate,
  handleSourceDate,
  lineCreate,
  handleContractDate,
  createApplyToInquiry,
  createProject,
  createApplyToBid,
  checkApplyToInquiry,
  returntoassign,
  fetchExecutionLink,
  fetchConfigSheetRfxPrepare,
  fetchOrderConfig,
  fetchNewBidConfig,
  updateSupplier,
  fetchDoExecute,
  fetchNewLinkStrategy,
  createPcOrderVerified,
  fetchSettingTableNew,
  createSiecProject,
  handleProjectDate,
  fetchConfigRfxUI,
  queryOrderCount,
  saveSuspendConfigure,
} from '@/services/purchaseExecutionService';
import { fetchUomControl } from '@/services/purchaseRequisitionAssignmentService';
import { getPostParams, getTabsPropsCallback, THROTTLE_TIME } from '@/routes/utils';
import { newBiddingDs } from './Execution/executionDs/newBiddingDs';
import { inquiryQuotationDs, templateModalDs } from './Execution/executionDs/inquiryQuotationDs';
import Assign from './Assign';
import All from './Execution/all.js';
import Order from './Execution/order.js';
import Bidding from './Execution/bidding.js';
import NewBidding from './Execution/newBidding.js';
import Template from './components/Template';
import Contract from './Execution/contract.js';
import Project from './Execution/project.js';
import BackToAssign from './components/BackToAssign';
import { allDs } from './Execution/executionDs/allDs';
import QuoteApproval from './Execution/quoteApproval.js';
import { orderDs } from './Execution/executionDs/orderDs';
import { bidingDs } from './Execution/executionDs/bidingDs';
import { assignDs, suspendModalDs } from './Assign/assignDs';
import InquiryQuotation from './Execution/inquiryQuotation.js';
import { contractDs } from './Execution/executionDs/contractDs';
import { projectLineDs } from './Execution/executionDs/projectDs';
import { quoteApprovalDs } from './Execution/executionDs/quoteApprovalDs';

const { TabPane, TabGroup } = Tabs;
let orderRef = {};
let bidRef = {};
let hiddenKeys = [];
let allTabShows = {};
let contractRef = {};
let inquiryQuotationRef = {};
let newBiddingRef = {};
let quoteApprovalRef = {};
let projectRef = {};
let visibleOldPrepareConfigSheet = false;
let visibleOldContractSheet = false;
let productPlaceConfig = false;
let allRef = {};
const Index = ({
  approvedDs,
  assignedDs,
  suspendDs,
  assignAllDs,
  // allAssignLineDs,
  // suspendDs,
  // assignLineDs,
  customizeTabPane,
  customizeBtnGroup,
  allLineDs,
  bidingLineDs,
  contractLineDs,
  inquiryQuotationLineDs,
  newBiddingLineDs,
  orderLineDs,
  quoteApprovalLineDs,
  projectDs,
  purchaseplatform = {},
  customizeTable,
  customizeForm,
  history,
  location,
  dispatch,
  remote,
}) => {
  const { currentType } = querystring.parse(location.search.substr(1)) || {};
  const [tabActiveKey, setTabActiveKey] = useState(currentType || 'approved');
  const [initFlag, setInitFlag] = useState(false); // 是否初始化过
  // const [isDetailTab, setDetailTab] = useState(purchaseplatform.detailTab); // 先展示待分配页签
  const [assignTab, setAssignTab] = useState(purchaseplatform.assignTab); // 先展示带分配页签
  const [executionTab, setExecutionTab] = useState(purchaseplatform.executionTab); // 优先展示带订单页签

  const [assignTabCount, setAssignTabCount] = useState({}); // 待分配页签数据数据集合
  const [executionTabCounts, setExecutionTabCounts] = useState({}); // 待转信息页签数据数据集合
  const [otherTabCounts, setCuxTabCounts] = useState({}); // 待转信息页签数据数据集合
  const [updateSupplierLoading, setUpdateSupplierLoading] = useState(false);
  const [tabsPermission, setTabsPermisson] = useState({});
  const [btnsPermission, setBtnsPermisson] = useState({});
  // const [tabBarExtra, setTabBarExtra] = useState(0);
  // const [showTab, setShowTab] = useState('all');
  const [uomControl, setUomControl] = useState({}); // 双单位控制.不开启时，基本数量基本单位不展示.因全部页签根据下游单据是否展示，所以{}处理
  const [isOldUser, setIsOldUser] = useState(true); // 新老执行链路。 新链路调用fetchNewLinkStrategySetting，老链路调用fetchDoExecuteSettings
  const [isShowNewBid, setIsShowNewBid] = useState(true);
  const [isNewRfxDetailUI, setIsNewRfxDetailUI] = useState(false); // 寻源明细新老UI
  const [loadings, setLoading] = useState({});
  const [isExecutionStrategy, setExecutionStrategy] = useState(false); // 执行策略
  const [oldAssignLovSetting, setOldLovSetting] = useState(false); // 执行策略
  useEffect(() => {
    queryPermissions();
    getExecutionLink(); // 查询执行链路
    fetchConfigSheetRfx(); // 查询新老寻源ui
    getNewBidConfig(); // 查询是否在配置表ource_new_bid_config中且【招投标（新招标）】为是
    getRfxDetailUIConfig();
    fetchConfigOldLovCon(); // 针对老链路租户,针对新链路租户的在114迭代之前的历史租户，需要在分配页面屏蔽值集新增的字段；
    fetchConfigSheetCon(); // 查询是否在配置表spcm_old_contract_tenant
    queryUomControl();
    fetchConfigProductSheetCon();
  }, []);

  useEffect(() => {
    if (currentType) {
      setTabActiveKey(currentType);
    }
  }, [currentType]);

  const getAssignTabCounts = () => {
    Promise.all([
      queryAssignList({
        prLineStatusCode: 'APPROVED',
        waitAssignRequestFlag: 1,
        prCustomizeFilterFlag: 1,
        erpControlFlag: 1,
        onlyCountFlag: 'Y',
        onlyCountLimit: 100,
      }),
      queryAssignList({
        prLineStatusCode: 'ASSIGNED',
        erpControlFlag: 1,
        prCustomizeFilterFlag: 1,
        onlyCountFlag: 'Y',
        onlyCountLimit: 100,
      }),
      queryAssignList({
        prLineStatusCode: 'SUSPEND',
        onlyCountFlag: 'Y',
        erpControlFlag: 1,
        prCustomizeFilterFlag: 1,
        onlyCountLimit: 100,
      }),
      queryAssignList({
        erpControlFlag: 1,
        prCustomizeFilterFlag: 1,
        onlyCountFlag: 'Y',
        onlyCountLimit: 100,
      }),
    ]).then((res) => {
      const assignTabCounts = {
        approvedCount: res[0] ? res[0].totalElements : null,
        assignedCount: res[1] ? res[1].totalElements : null,
        suspendCount: res[2] ? res[2].totalElements : null,
        assignAllCount: res[3] ? res[3].totalElements : null,
      };
      setAssignTabCount(assignTabCounts);
    });
  };

  const getExecuteTabCounts = () => {
    Promise.all([
      queryOrderCount({
        onlyCountFlag: 'Y',
        erpControlFlag: 1,
        poWorkbenchFlag: 1,
        prCustomizeFilterFlag: 1,
        customizeUnitCode:
          'SPRM.PURCHASE_EXECUTION_ALL.ORDER_LIST,SPRM.PURCHASE_EXECUTION_ALL.ORDER_FILTER',
      }),
      handleBiddingDate({
        sourceDocumentType: 'BID',
        onlyCountFlag: 'Y',
        erpControlFlag: 1,
        prCustomizeFilterFlag: 1,
        onlyCountLimit: 100,
      }),
      handleSourceDate({
        sourceDocumentType: 'RFX',
        onlyCountFlag: 'Y',
        erpControlFlag: 1,
        prCustomizeFilterFlag: 1,
        onlyCountLimit: 100,
      }),
      handleContractDate(),
      handleQuoteApprovalDate({
        sourceDocumentType: 'PROJECT',
        erpControlFlag: 1,
        onlyCountFlag: 'Y',
        prCustomizeFilterFlag: 1,
        onlyCountLimit: 100,
      }),
      queryAssignList({
        prLineStatusCode: 'ASSIGNED',
        erpControlFlag: 1,
        prCustomizeFilterFlag: 1,
        sourceTab: 'ALL',
        onlyCountFlag: 'Y',
        onlyCountLimit: 100,
      }),
      handleSourceDate({
        sourceDocumentType: 'NEW_BID',
        erpControlFlag: 1,
        onlyCountFlag: 'Y',
        prCustomizeFilterFlag: 1,
        onlyCountLimit: 100,
      }),
      handleProjectDate({
        onlyCountFlag: 'Y',
        onlyCountLimit: 100,
      }),
    ]).then((res) => {
      const executionTabCount = {
        orderCount: res[0] ? res[0].totalElements : null,
        biddingCount: res[1] ? res[1].totalElements : null,
        inquiryQuotationCount: res[2] ? res[2].totalElements : null,
        contractCount: res[3] ? res[3].totalElements : null,
        quoteApprovalCount: res[4] ? res[4].totalElements : null,
        allCount: res[5] ? res[5].totalElements : null,
        newBiddingCount: res[6] ? res[6].totalElements : null,
        projectCount: res[7] ? res[7].totalElements : null,
      };
      setExecutionTabCounts(executionTabCount);
    });
  };

  useEffect(() => {
    window.purchaseExecutionGoDetail = goDetail;
    return () => {
      window.purchaseExecutionGoDetail = undefined;
    };
  }, []);

  useEffect(() => {
    if (initFlag) {
      if (['approved', 'assigned', 'suspend', 'all'].includes(tabActiveKey)) {
        if (Object.keys(assignTabCount).length === 0) {
          getAssignTabCounts();
        }
      } else if (Object.keys(executionTabCounts).length === 0) {
        getExecuteTabCounts();
      }
    }
  }, [initFlag, assignTabCount, executionTabCounts, tabActiveKey]);

  // 获取是否开启双单位控制
  const queryUomControl = async () => {
    await fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        setUomControl(result);
        const { SPRM, SODR, SPCM, RFX } = result || {};
        approvedDs.setState('uomControl', SPRM || 0);
        assignAllDs.setState('uomControl', SPRM || 0);
        assignedDs.setState('uomControl', SPRM || 0);
        suspendDs.setState('uomControl', SPRM || 0);
        allLineDs.setState('uomControl', SPRM || SODR || SPCM || RFX || 0);
        bidingLineDs.setState('uomControl', SPRM || RFX || 0);
        contractLineDs.setState('uomControl', SPRM || SPCM || 0);
        inquiryQuotationLineDs.setState('uomControl', SPRM || RFX || 0);
        newBiddingLineDs.setState('uomControl', SPRM || RFX || 0);
        orderLineDs.setState('uomControl', SPRM || SODR || 0);
        quoteApprovalLineDs.setState('uomControl', SPRM || RFX || 0);
        projectDs.setState('uomControl', SPRM || RFX || 0);
      }
    });
  };

  const changeTabNum = (dateCount) => {
    const arr = Object.keys(dateCount);
    if (arr.length > 1) {
      setAssignTabCount({ ...assignTabCount, ...dateCount });
    } else {
      setExecutionTabCounts({ ...executionTabCounts, ...dateCount });
    }
  };

  const getNewBidConfig = () => {
    fetchNewBidConfig({
      tenant: getCurrentTenant().tenantNum,
      // newBid: 1,
    }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result) && result[0]?.newBid === '1') {
        setIsShowNewBid(true);
      } else if (isEmpty(result)) {
        setIsShowNewBid(true);
      } else {
        setIsShowNewBid(false);
      }
    });
  };

  const getRfxDetailUIConfig = () => {
    fetchConfigRfxUI({
      organizationId: getCurrentOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result)) {
        setIsNewRfxDetailUI(false);
      } else {
        setIsNewRfxDetailUI(true);
      }
    });
  };

  const getExecutionLink = () => {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (!(result && !isEmpty(result.content))) {
        setIsOldUser(false);
        fetchNewLinkStrategySetting();
      } else {
        fetchDoExecuteSettings();
      }
    });
  };

  // 老链路执行策略逻辑
  const fetchDoExecuteSettings = async () => {
    await fetchDoExecute([{ fullPathCode: 'SITE.SPUC.PR.EXECUTION_STRATEGY' }]).then((res) => {
      // 自动分配的未开启执行策略
      if (res && isArray(res)) {
        setExecutionStrategy(res[0]);
      }
    });
  };

  // 新链路执行策略逻辑
  const fetchNewLinkStrategySetting = async () => {
    await fetchNewLinkStrategy().then((res) => {
      // 自动分配的未开启执行策略
      if (res && isArray(res)) {
        setExecutionStrategy(res[0]);
      }
    });
  };

  // 配置表配置，分配页面屏蔽值集中值集新增的字段
  const fetchConfigOldLovCon = async () => {
    await fetchSettingTableNew({
      organizationId: getCurrentOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
      tableCode: 'sprm_pr2pc_execution_new_link_old_tenant',
    }).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }

      setOldLovSetting(isEmpty(result));
    });
  };

  // 配置表配置显示新老协议
  const fetchConfigSheetCon = async () => {
    await fetchSettingTableNew({
      organizationId: getCurrentOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
      tableCode: 'spcm_old_contract_tenant',
    }).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      visibleOldContractSheet = !isEmpty(result);
    });
  };

  // 配置表配置显示
  const fetchConfigProductSheetCon = async () => {
    await fetchSettingTableNew({
      organizationId: getCurrentOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
      tableCode: 'sprm_pr_execute_select_product_place_order_tenant',
    }).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      productPlaceConfig = !isEmpty(result);
      allLineDs.setState('productPlaceConfig', productPlaceConfig);
      orderLineDs.setState('productPlaceConfig', productPlaceConfig);
    });
  };

  // 配置表配置显示寻源准备节点新老内容

  const fetchConfigSheetRfx = async () => {
    await fetchConfigSheetRfxPrepare({
      organizationId: getCurrentOrganizationId(),
      tenant: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      visibleOldPrepareConfigSheet = result && !isEmpty(result);
    });
  };

  // 订单页面逻辑跳转
  const handleToDetail = (headerId, source, linksFlag = {}) => {
    // 存放首次加载价格库查询标识
    const itemKey = `sodr.quotePurchaseRequisition.${Math.random()}`;
    window.sessionStorage.setItem(itemKey, 1);
    const { linkFlag, linkIds = [], prNumList = [] } = linksFlag || {};
    // 获取老订单工作台配置表信息
    fetchOrderConfig({
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result)) {
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        console.log(menuLeafNodes, window?.dvaApp?._store?.getState()?.global?.menuLeafNode);
        debugger;
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.po-admin.po.po-change'
        );
        if (!linkRouteFlag) {
          const prListStr = prNumList?.join(',') || '';
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList: prListStr })
              .d(
                `【${prListStr}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        } else if (linkFlag === 1) {
          const poHeaderList = linkIds?.map((n) => n.poHeaderId)?.join(',');
          history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation`,
            search: `?poHeaderId=${poHeaderList}&cacheKey=${linkIds[0]?.cacheKey}&source=newRequisition&sourcePage=pageRequest&poSourcePlatform=${source}`,
          });
        } else if (source === 'CATALOGUE') {
          history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
            search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}&poSourcePlatform=${source}`,
          });
        } else if (source === 'SRM' || source === 'ERP' || source === 'SHOP') {
          history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
            search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=pageRequest&poSourcePlatform=${source}`,
          });
        } else if (source === 'E-COMMERCE') {
          history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation`,
            search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}&poSourcePlatform=${source}`,
          });
        }
      } else {
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.po-admin.po.order-workspace'
        );
        if (!linkRouteFlag) {
          const prListStr = prNumList?.join(',') || '';
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList: prListStr })
              .d(
                `【${prListStr}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        } else if (source === 'CATALOGUE') {
          history.push({
            pathname: `/sodr/order-workspace/detail/catalogue-request/${headerId}`,
            state: { initPoDataList: linkIds },
          });
        } else if (source === 'SRM' || source === 'ERP' || source === 'SHOP') {
          history.push({
            pathname: `/sodr/order-workspace/detail/purchase-request/${headerId}`,
            state: { initPoDataList: linkIds },
          });
        } else if (source === 'E-COMMERCE') {
          history.push({
            pathname: `/sodr/order-workspace/detail/ecommerce-request/${headerId}`,
            state: { initPoDataList: linkIds },
          });
        }
      }
    });
  };

  /**
   *分配
   *
   * @memberof Assignment
   */
  const handleAssign = () => {
    const currentDs = getCurrentDs(tabActiveKey);
    const { handleAssignItem = () => {} } = currentDs.getState('actions') || {};
    handleAssignItem();
  };

  // 暂挂
  const handleSuspend = () => {
    const currentDs = getCurrentDs(tabActiveKey);
    const { handleSuspendItem = () => {} } = currentDs.getState('actions') || {};
    handleSuspendItem();
  };

  // 启用
  const handleEnable = () => {
    const currentDs = getCurrentDs(tabActiveKey);
    const { handleEnableItem = () => {} } = currentDs.getState('actions') || {};
    handleEnableItem();
  };

  const handleAdd = async () => {
    // console.log(orderRef);
    if (tabActiveKey === 'order') {
      await orderRef.handleOrderCreate();
    } else if (tabActiveKey === 'inquiryQuotation') {
      await inquiryQuotationRef.handleCreate();
    } else if (tabActiveKey === 'newBidding') {
      await newBiddingRef.handleCreate();
    } else if (tabActiveKey === 'bidding') {
      // todo
      await bidRef.handleCreate();
    } else if (tabActiveKey === 'contract') {
      await contractRef.handleCreate();
    } else if (tabActiveKey === 'quoteApproval') {
      await quoteApprovalRef.handleCreate();
    } else if (tabActiveKey === 'project') {
      await projectRef.handleCreate({});
    }
  };

  const updateSuppliers = (type) => {
    if (type === 'allTab') {
      setLoading({ supplierLoading: true });
      getOrderSupplier();
    } else if (type === 'order') {
      setUpdateSupplierLoading(true);
      orderRef.handleUpdateSupplier().finally(() => {
        setUpdateSupplierLoading(false);
      });
    } else {
      setUpdateSupplierLoading(true);
      contractRef.handleUpdateSupplier().finally(() => {
        setUpdateSupplierLoading(false);
      });
    }
  };

  const clearSuppliers = (type) => {
    if (type === 'order') {
      setUpdateSupplierLoading(true);
      orderRef.handleClearSupplier().finally(() => {
        setUpdateSupplierLoading(false);
      });
    }
  };

  // 获取推荐供应商
  const getOrderSupplier = () => {
    const data = allLineDs.toJSONData();
    const { selected } = allLineDs;
    setLoading({ supplierLoading: true });
    const { updateSupplierCb } = remote?.props?.process || {};
    updateSupplier(data).then((res) => {
      setLoading({ ...loadings, supplierLoading: false });
      if (getResponse(res)) {
        selected.forEach((i) => {
          const currentLine = res.find((t) => t.prLineId === i.get('prLineId'));
          const {
            uomId,
            uomName,
            uomCode,
            // uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            netPrice,
            priceLibId,
            priceLibraryId,
            taxIncludedPrice,
            taxIncludedUnitPrice,
            enteredTaxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            selectSupplierCompanyId,
            selectSupplierCode,
            selectSupplierCompanyName,
            selectLocalSupplierId,
            selectSupplierTenantId,
            selectLocalSupplierCode,
            selectLocalSupplierName,
            productEcSourceFrom,
            skuId,
            marketPrice,
            prPriceSource,
            priceSource,
            prReferencePriceLibraryVO,
            prPriceSourceMeaning,
            // platformSupplierId,
            priceProductId,
            priceEcPlatformCode,
            ecLimitQuantity,
          } = currentLine || {};
          if (currentLine) {
            i.set({
              noUnitPrice: netPrice,
              orderSupplierBtnFlag: 1,
              prReferencePriceLibraryVO: {
                changeUpdateFlag: 1,
                uomId,
                uomName,
                uomCode,
                currencyCode,
                taxId,
                taxRate,
                noUnitPrice: netPrice,
                unitPrice: netPrice,
                netPrice,
                priceLibId,
                priceLibraryId,
                taxIncludedPrice: enteredTaxIncludedPrice || taxIncludedUnitPrice,
                unitPriceBatch,
                holdPcHeaderId,
                holdPcLineId,
                contractNum,
                benchmarkPriceType,
                ladderPriceLibId,
                ladderQuotationFlag,
                originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
                enteredTaxIncludedPrice,
                selectSupplierCompanyId,
                selectSupplierCode,
                selectSupplierCompanyName,
                selectLocalSupplierId,
                selectLocalSupplierCode,
                selectLocalSupplierName,
                selectSupplierTenantId,
                priceLibraryStatus: prReferencePriceLibraryVO?.priceLibraryStatus || 'VALID',
              },
              priceLibraryId,
              priceLibId,
              marketPrice,
              skuId,
              productEcSourceFrom,
              priceSource:
                prPriceSource === 'MANUALLY_E-COMMERCE_PRODUCT' ||
                priceSource === 'MANUALLY_E-COMMERCE_PRODUCT'
                  ? 'E-COMMERCE_PRODUCT'
                  : prPriceSource || priceSource,
              priceSourceMeaning: prPriceSourceMeaning,
              priceProductId: skuId || priceProductId,
              priceEcPlatformCode: productEcSourceFrom || priceEcPlatformCode,
              ecLimitQuantity,
              priceLibraryStatus: prReferencePriceLibraryVO?.priceLibraryStatus || 'VALID',
              enteredTaxIncludedPrice,
              selectSupplierCompanyId,
              selectSupplierCode,
              selectSupplierCompanyName,
              selectLocalSupplierId,
              selectLocalSupplierCode,
              selectLocalSupplierName,
              selectSupplierTenantId,
              orderSupplierLov: {
                priceLibraryId,
                supplierCompanyId: selectSupplierCompanyId,
                supplierCompanyNum: selectSupplierCode,
                supplierCompanyName: selectSupplierCompanyName,
                displaySupplierCompanyName: selectSupplierCompanyName || selectLocalSupplierName,
                selectLocalSupplierId,
                displaySupplierCompanyId: selectLocalSupplierId,
                displaySupplierCompanyNum: selectLocalSupplierCode,
                supplierTenantId: selectSupplierTenantId,
                selectLocalSupplierName,
                selectSupplierTenantId,
                netPrice,
              },
            });
            if (isFunction(updateSupplierCb)) {
              updateSupplierCb(i, currentLine, 'allBtnGetSupplier');
            }
          }
        });
        notification.success();
      }
    });
  };

  // 待分配页签的导出获取查询/勾选条件
  const getQueryFrom = (type) => {
    const currentDs = getCurrentDs(tabActiveKey);
    const [queryData = {}] = currentDs?.queryDataSet?.toData() || [];
    const newParams = {
      ...(queryData || {}),
      tempKey: undefined,
      supplierQueryParamStr: queryData?.tempKey,
    };
    // 判断是不是老供应商的默认值查询
    if (newParams.supplierQueryParamStr && !newParams.supplierId && !newParams.supplierCompanyId) {
      if (
        !newParams.supplierQueryParamStr.includes(':') &&
        newParams.supplierQueryParamStr.includes('-')
      ) {
        // eslint-disable-next-line prefer-destructuring
        newParams.supplierCompanyId = newParams.supplierQueryParamStr.split('-')[1];
        // eslint-disable-next-line prefer-destructuring
        newParams.supplierId = newParams.supplierQueryParamStr.split('-')[0];
      }
    }
    const selectData = currentDs?.selected?.map((ele) => ele.get('prLineId'));
    if (selectData.length > 0) {
      return {
        prLineIds: type === 'new' ? selectData : selectData.join(','),
        prLineStatusCode:
          assignTab !== 'all' ? assignTab?.toUpperCase() : newParams.prLineStatusCode,
      };
    } else {
      return getPostParams(
        {
          ...filterNullValueObject(newParams || {}),
          prCustomizeFilterFlag: 1,
          prLineStatusCode:
            assignTab !== 'all' ? assignTab?.toUpperCase() : newParams.prLineStatusCode,
          waitAssignRequestFlag: assignTab !== 'approved' ? '' : 1,
        },
        'line',
        type === 'new'
      );
    }
  };

  // 全部tab导出获取查询/勾选条件
  const getQueryAllLine = (type) => {
    const [queryData] = allLineDs.queryDataSet.toData();
    const newParams = {
      ...queryData,
      tempKey: undefined,
      supplierQueryParamStr: queryData.tempKey,
      supplierList: undefined,
      recommendSupplierParamsStr: queryData.supplierList,
    };
    // 判断是不是老供应商的默认值查询
    if (newParams.supplierQueryParamStr && !newParams.supplierId && !newParams.supplierCompanyId) {
      if (
        !newParams.supplierQueryParamStr.includes(':') &&
        newParams.supplierQueryParamStr.includes('-')
      ) {
        // eslint-disable-next-line prefer-destructuring
        newParams.supplierCompanyId = newParams.supplierQueryParamStr.split('-')[1];
        // eslint-disable-next-line prefer-destructuring
        newParams.supplierId = newParams.supplierQueryParamStr.split('-')[0];
      }
      if (
        newParams.recommendSupplierParamsStr &&
        !newParams.localSupplierIds &&
        !newParams.platformSupplierIds
      ) {
        if (
          !newParams.recommendSupplierParamsStr.includes(':') &&
          newParams.recommendSupplierParamsStr.includes('-')
        ) {
          const localSupplierIds = [];
          const platformSupplierIds = [];
          (newParams.recommendSupplierParamsStr.split(',') || []).forEach((ele) => {
            const [supplierId = undefined, supplierCompanyId = undefined] = ele
              ? ele.split('-')
              : [];
            if (supplierId) {
              localSupplierIds.push(supplierId);
            } else {
              platformSupplierIds.push(supplierCompanyId);
            }
          });
          // eslint-disable-next-line prefer-destructuring
          newParams.platformSupplierIds = isEmpty(platformSupplierIds)
            ? undefined
            : platformSupplierIds.join(',');
          // eslint-disable-next-line prefer-destructuring
          newParams.localSupplierIds = isEmpty(localSupplierIds)
            ? undefined
            : localSupplierIds.join(',');
        }
      }
    }
    const selectData = allLineDs?.selected?.map((ele) => ele.get('prLineId'));
    if (selectData.length > 0) {
      return { prLineIds: type === 'new' ? selectData : selectData.join(',') };
    } else {
      return getPostParams(
        {
          ...filterNullValueObject(newParams || {}),
          sourceTab: 'ALL',
          prLineStatusCode: 'ASSIGNED',
          erpControlFlag: 1,
          prCustomizeFilterFlag: 1,
        },
        'line',
        type === 'new'
      );
    }
  };

  const clearSelectAll = (dataSet) => {
    dataSet.unSelectAll();
    dataSet.clearCachedSelected();
  };

  const handleCreateContract = async () => {
    const { clearExtraData } = remote?.props?.process || {};
    const selectedPurchaseContracts = allLineDs?.selected?.map((ele) => {
      // ele.reset();
      if (isFunction(clearExtraData)) {
        return clearExtraData(ele);
      } else {
        return ele.toData();
      }
    });
    // 需要清空data
    if (isEmpty(selectedPurchaseContracts)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    setLoading({ ...loadings, contractLoading: true });
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allContractCheck',
      });
      if (beforeCreateCheck === false) {
        setLoading({ ...loadings, contractLoading: false });
        return false;
      }
    }
    await createPcOrderVerified(selectedPurchaseContracts).then((res) => {
      setLoading({ ...loadings, contractLoading: false });
      if (res && res?.failed) {
        notification.error({ message: res?.message });
      } else if (res) {
        // 合并头信息
        const headerInfo = [
          'supplierTenantId',
          'supplierCompanyId',
          'supplierCompanyName',
          'supplierId',
          'supplierName',
          'ouId',
          'ouName',
          'purchaseOrgId',
          'purchaseOrgName',
          'purchaseAgentId',
          'purchaseAgentName',
          'companyOrgName',
          'companyOrgId',
          'costAnchDepId',
          'costAnchDepDesc',
          'overseasProcurement',
          'companyId',
          'companyName',
          'executionStrategyCode',
          'secondLevelStrategyCode',
          'orderSecondLevelStrategyCode',
          'selectSupplierCompanyId',
          'selectSupplierCompanyName',
          'selectSupplierTenantId',
          'selectLocalSupplierId',
          'selectLocalSupplierName',
          'recommendSupplierFlag',
          'supplierList',
        ].reduce((obj, filedNames) => {
          const [filedName, targetFiledName] = [].concat(filedNames);
          const _headerInfo = obj;
          // 当前字段在选择项中不同值集合
          const diffValues = new Set(
            selectedPurchaseContracts?.map((purchaseContract) => {
              if (purchaseContract[filedName]) {
                return purchaseContract[filedName];
              } else {
                return null;
              }
            })
          );
          diffValues.delete(null);
          if (diffValues.size === 1) {
            [_headerInfo[targetFiledName || filedName]] = diffValues;
          }
          return _headerInfo;
        }, {});
        headerInfo.pcSourceCodeMeaning = intl.get(`spcm.common.model.purchaseDemand`).d('采购需求');
        headerInfo.pcSourceCode = 'PURCHASE_NEED';
        const {
          orderSecondLevelStrategyCode,
          secondLevelStrategyCode,
          selectSupplierCompanyId,
          selectSupplierTenantId,
          selectSupplierCompanyName,
          selectLocalSupplierId,
          selectLocalSupplierName,
          supplierList,
        } = headerInfo || {};
        if (headerInfo.recommendSupplierFlag === 1 && !supplierList?.length) {
          headerInfo.supplierTenantId = selectSupplierTenantId;
          headerInfo.supplierCompanyId = selectSupplierCompanyId;
          headerInfo.supplierCompanyName = selectSupplierCompanyName;
          headerInfo.supplierId = selectLocalSupplierId;
          headerInfo.supplierName = selectLocalSupplierName;
        } else if (supplierList?.length > 0) {
          headerInfo.supplierTenantId = null;
          headerInfo.supplierCompanyId = null;
          headerInfo.supplierCompanyName = null;
          headerInfo.supplierId = null;
          headerInfo.supplierName = null;
        }
        const renderTag = [];
        if (['ALL', 'CONTRACT_SIMPLE'].includes(orderSecondLevelStrategyCode)) {
          renderTag.push('SIMPLE');
        }
        if (['CONTRACT_FRAMEWORK', 'ALL'].includes(secondLevelStrategyCode)) {
          renderTag.push('FRAMEWORK');
        }

        if (renderTag.length === 2) {
          headerInfo.acceptExecuteType = null;
        } else if (renderTag.includes('SIMPLE')) {
          headerInfo.acceptExecuteType = 'CONTRACT_SIMPLE';
        } else if (renderTag.includes('FRAMEWORK')) {
          headerInfo.acceptExecuteType = 'CONTRACT_FRAMEWORK';
        }
        // 合并协议标行
        const contractSubjects = cloneDeep(selectedPurchaseContracts)?.map((_subject) => {
          const subject = _subject;
          delete subject.$form;
          const { prReferencePriceLibraryVO = {} } = subject;
          const {
            taxIncludedPrice,
            enteredTaxIncludedPrice,
            changeUpdateFlag,
            unitPrice,
            libNetPrice,
            libTaxId,
            taxId,
            taxRete,
            libTaxRate,
            priceLibraryStatus,
          } = prReferencePriceLibraryVO || {};
          subject.deliverDate = subject.neededDate;
          subject.address = subject.location;
          subject.enteredTaxIncludedPrice = changeUpdateFlag
            ? enteredTaxIncludedPrice
            : taxIncludedPrice;
          subject.taxId = changeUpdateFlag ? taxId : libTaxId;
          subject.taxRate = changeUpdateFlag ? taxRete : libTaxRate;
          subject.unitPrice = changeUpdateFlag ? unitPrice : libNetPrice;
          subject.unitPrice = changeUpdateFlag ? unitPrice : libNetPrice;
          subject.priceLibraryStatus = priceLibraryStatus;
          subject.sourceCode = subject.displayPrNum;
          subject.agentName = subject.purchaseAgentName;
          subject.sourceLineNum = subject.lineNum;
          subject.prLineNum = subject.lineNum;
          subject.prNum = subject.displayPrNum;
          subject.prSourcePlatform = subject.prSourcePlatform;
          subject.sourceDisplayLineNum = subject.displayLineNum;
          // subject.quantity = isOldUser ? subject.restPcQuantity : subject.restPoQuantity;
          subject.availableQuantity = isOldUser ? subject.restPcQuantity : subject.restPoQuantity;
          subject.specifications = subject.itemSpecs;
          subject.model = subject.itemModel;
          return subject;
        });
        const contractMaintain = {
          headerInfo,
          pcSubjectDataSource: contractSubjects,
        };
        const itemKey = visibleOldContractSheet
          ? `spcm.contractMaintain.${Math.random()}`
          : `spcm.workSpace.${Math.random()}`;
        allLineDs.unSelectAll();
        allLineDs.clearCachedSelected();
        allLineDs.query();
        window.sessionStorage.setItem(itemKey, JSON.stringify(contractMaintain));
        if (!visibleOldContractSheet) {
          const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
          const linkRouteFlag = menuLeafNodes.some(
            (node) => node.functionMenuCode === 'srm.pc-admin.pc-purchaser.workspace2'
          );
          if (linkRouteFlag) {
            history.push({
              pathname: '/spcm/contract-workspace/create',
              search: `?from=purchaseContract&itemKey=${itemKey}`,
            });
          } else {
            notification.warning({
              message: intl
                .get('sprm.common.model.excute.link')
                .d('当前角色无对应菜单权限，请添加权限后再操作。'),
            });
          }
        } else {
          const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
          const linkRouteFlag = menuLeafNodes.some(
            (node) => node.functionMenuCode === 'srm.pc-admin.pc-purchaser.maintain'
          );
          if (linkRouteFlag) {
            history.push({
              pathname: '/spcm/contract-maintain/detail',
              search: `?from=purchaseContract&itemKey=${itemKey}`,
            });
          } else if (!linkRouteFlag) {
            notification.warning({
              message: intl
                .get('sprm.common.model.excute.link')
                .d('当前角色无对应菜单权限，请添加权限后再操作。'),
            });
          }
        }
      }
    });
  };

  const getCurrentDs = (tabActive) => {
    let currentDs = approvedDs;
    if (tabActive) {
      switch (tabActive) {
        case 'approved':
          currentDs = approvedDs;
          break;
        case 'assigned':
          currentDs = assignedDs;
          break;
        case 'suspend':
          currentDs = suspendDs;
          break;
        case 'all':
          currentDs = assignAllDs;
          break;
        case 'order':
          currentDs = orderLineDs;
          break;
        case 'inquiryQuotation':
          currentDs = inquiryQuotationLineDs;
          break;
        case 'newBidding':
          currentDs = newBiddingLineDs;
          break;
        case 'bidding':
          currentDs = bidingLineDs;
          break;
        case 'contract':
          currentDs = contractLineDs;
          break;
        case 'quoteApproval':
          currentDs = quoteApprovalLineDs;
          break;
        case 'project':
          currentDs = projectDs;
          break;
        default:
          currentDs = allLineDs;
          break;
      }
    }
    return currentDs;
  };

  // 回退至待分配
  const handleReturntoassign = (type) => {
    const selectedRows =
      type === 'approved'
        ? assignedDs.selected?.map((ele) => ({
            ...ele.toData(),
            supplierList: ele.get('supplierList') ? ele.get('supplierList').toJS() : undefined,
          }))
        : allLineDs.selected?.map((ele) => ({
            ...ele.toData(),
            supplierList: ele.get('supplierList') ? ele.get('supplierList').toJS() : undefined,
          }));
    const returnAssignedDs = new DataSet(suspendModalDs());
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sprm.purchaseRequisitionAssign.view.title.returnAssigned`).d('回退至待分配'),
      children: (
        <BackToAssign ds={returnAssignedDs} type="returnAssigned" customizeForm={customizeForm} />
      ),
      drawer: true,
      closable: true,
      maskClosable: true,
      style: { width: '380px' },
      onOk: async () => {
        const validateFlag = await returnAssignedDs.validate();
        if (validateFlag) {
          returntoassign({
            prLineVOS: selectedRows,
            values: returnAssignedDs.toData()[0] ? returnAssignedDs.toData()[0] : {},
          }).then((res) => {
            if (res && !res.failed) {
              notification.success();
              clearSelectAll(assignedDs);
              clearSelectAll(allLineDs);
              assignedDs.query();
              allLineDs.query();
              const cuxParams = remote
                ? remote.process('SPRM_PURCHASE_EXECUTION_RETURN_ASSIGNED_CUX_PARAMS', {
                    erpControlFlag: 1,
                    prCustomizeFilterFlag: 1,
                  })
                : {};
              Promise.all([
                queryAssignList({
                  prLineStatusCode: 'APPROVED',
                  waitAssignRequestFlag: 1,
                  ...cuxParams,
                }),
                queryAssignList({
                  prLineStatusCode: 'ASSIGNED',
                  ...cuxParams,
                }),
                queryAssignList({
                  prLineStatusCode: 'SUSPEND',
                  ...cuxParams,
                }),
              ]).then((totalCountRes) => {
                if (totalCountRes) {
                  const [res1, res2, res3] = totalCountRes;
                  changeTabNum({
                    approvedCount: res1?.totalElements,
                    assignedCount: res2?.totalElements,
                    suspendCount: res3?.totalElements,
                  });
                }
              });
            } else if (res && res.failed) {
              notification.error({ message: res.message });
            }
          });
        } else {
          return false;
        }
      },
      onCancel: () => {},
    });
  };

  // 寻源页面逻辑跳转
  const goDetail = (type, otherDate = {}, prNumList = []) => {
    if (type === 'rfx') {
      const { rfxHeaderId, expertScoreType, sourceCategory, preQualificationFlag } =
        otherDate || {};
      let search = remote.process(
        'SPRM_PURCHASE_EXECUTION_GO_DETAIL_SEARCH',
        {
          expertScoreType,
          sourceCategory,
          preQualificationFlag,
        },
        {}
      );
      let pathname;
      let linkRouteFlag;
      const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
      if (visibleOldPrepareConfigSheet) {
        linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.ssrc.source.manage.inquirer.inquiry-hall'
        );
        pathname = `/ssrc/inquiry-hall/rfx-update/${rfxHeaderId}`;
      } else {
        linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.ssrc.source.manage.inquirer.new-inquiry-hall'
        );
        pathname = `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`;
        search = { ...search, current: 'newInquiryHall' };
      }
      if (linkRouteFlag) {
        history.push({ pathname, search: querystring.stringify(search) });
      } else {
        notification.warning({
          message: intl
            .get('sprm.common.model.outMenu.errorLink', { prNumList })
            .d(
              `【${prNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
            ),
        });
      }
    }
  };

  // 新建订单(可能需要清空待转订单的勾选.以及重新查头数量)
  const handleCreateOrder = async () => {
    const data = allLineDs.toJSONData();
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    const supplierPirceData = data?.map((ele) => {
      const {
        createdBy,
        creationDate,
        supplierCompanyNum,
        supplierCompanyName,
        supplierCompanyId,
        sourceFromNum,
        sourceFromLnNum,
        sourceFromLnId,
        sourceFromId,
        sourceFrom,
        priceSource,
        priceLibraryStatus,
        // priceLibraryId,
        priceLibLadders,
        priceLibId,
        objectVersionNumber,
        itemId,
        orderNum,
        ...others
      } = ele.prReferencePriceLibraryVO || {};
      return {
        ...ele,
        agentId: ele?.purchaseAgentId || ele.headerPurchaseAgentId,
        ...others,
        referencePriceDisplayFlag:
          tabActiveKey === 'allLine'
            ? Boolean(Number(ele.referencePriceDisplayFlag))
            : ele.referencePriceDisplayFlag,
      };
    });
    if (remote) {
      setLoading({ ...loadings, createOrderLoading: true });
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allOrderCheck',
      });
      setLoading({ ...loadings, createOrderLoading: false });
      if (beforeCreateCheck === false) {
        return false;
      }
    }
    allLineDs.validate().then(async (status) => {
      if (status) {
        setLoading({ ...loadings, createOrderLoading: true });
        const validateRes = getResponse(await poFromPrLineNewCheck(data));
        if (!validateRes) {
          setLoading({ ...loadings, createOrderLoading: false });
          return;
        }
        const { poCreatePopUpFlag, poCreateErrorMsg } = validateRes;
        if (poCreatePopUpFlag === 1) {
          const validateModalRes = await Modal.confirm({
            children: poCreateErrorMsg,
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            okText: intl.get('sodr.workspace.view.button.createPO').d('新建订单'),
          });
          if (validateModalRes !== 'ok') {
            setLoading({ ...loadings, createOrderLoading: false });
            return;
          }
        }
        check({ sourceCode: 'PURCHASE_REQUEST' }).then((res) => {
          if (!res?.failed) {
            const checkResponse = res;
            lineCreate(supplierPirceData).then((response) => {
              setLoading({ ...loadings, createOrderLoading: false });
              allLineDs.unSelectAll();
              allLineDs.clearCachedSelected();
              allLineDs.query();
              if (getResponse(response)) {
                const { poHeaderId, poSourcePlatform } = isArray(response) ? response[0] : response;
                notification.success();
                if (checkResponse === 0 || (checkResponse === 1 && response.length === 1)) {
                  handleToDetail(poHeaderId, poSourcePlatform, {
                    linkIds: response,
                    prNumList: data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`),
                  });
                } else if (checkResponse === 1 && response.length > 1) {
                  handleToDetail(poHeaderId, poSourcePlatform, {
                    linkIds: response,
                    linkFlag: 1,
                    prNumList: data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`),
                  });
                }
              }
            });
          } else if (res && res.failed) {
            notification.error({ message: res.message });
            setLoading({ ...loadings, createOrderLoading: false });
          }
        });
      }
    });
  };

  // 新建RFX校验信息
  const handleCreateRfx = async () => {
    const data = allLineDs.toJSONData();
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prLineNumList = data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`);
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    setLoading({ ...loadings, createRfxLoading: true });
    if (remote) {
      const beforeCreateRfxRes = await remote.event.fireEvent('beforeCreateRfx', {
        currentListDs: allLineDs,
      });
      if (beforeCreateRfxRes === false) {
        setLoading({ ...loadings, createRfxLoading: false });
        return false;
      }
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allRfxCheck',
      });
      if (beforeCreateCheck === false) {
        setLoading({ ...loadings, createRfxLoading: false });
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      sourceFrom: 'DEMAND_POOL',
      configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'RFX' : null,
    })
      .then((res) => {
        if (res) {
          if (res.failed) {
            notification.error({ message: res.message });
            return;
          }
          if (res.companyInconsistentFlag === 1) {
            Modal.confirm({
              bodyStyle: { padding: '20px' },
              children: (
                <p>
                  {intl
                    .get(`ssrc.inquiryHall.view.message.diffCompany`)
                    .d('并单公司不一致,是否继续?')}
                </p>
              ),
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              onOk: () => {
                handleQuoteAppovalModal(prLineIdList, prLineNumList);
              },
            });
          } else {
            handleQuoteAppovalModal(prLineIdList, prLineNumList);
          }
        }
      })
      .finally(() => {
        setLoading({ ...loadings, createRfxLoading: false });
      });
  };

  // 新建RFX
  const handleQuoteAppovalModal = async (prLineIdList, prLineNumList) => {
    const ds = new DataSet(templateModalDs({ config: 'RFX', sourceFrom: 'DEMAND_POOL' }));
    if (remote) {
      await remote.event.fireEvent('beforeCreateTemplate', { templateDs: ds, tabkey: 'allLine' });
    }
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <Template ds={ds} />,
      onOk: async () => {
        const validateFlag = await ds.validate();
        if (validateFlag) {
          const { templateId } = ds.toData() ? ds.toData()[0] : {};
          await createApplyToInquiry({
            templateId,
            prLineIdList,
            sourceFrom: 'DEMAND_POOL',
            configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
            sourceDocumentType: !isOldUser ? 'RFX' : null,
          }).then((result) => {
            if (getResponse(result)) notification.success(result);
            {
              const { rfxHeader } = result || {};
              allLineDs.unSelectAll();
              allLineDs.clearCachedSelected();
              allLineDs.query();
              goDetail('rfx', rfxHeader, prLineNumList);
            }
          });
        } else {
          return false;
        }
      },
    });
  };

  // 新建寻源立项前校验信息
  const handleCreateProject = async () => {
    const data = allLineDs.toJSONData();
    const prLineIdList = data?.map((ele) => ele.prLineId);
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    setLoading({ ...loadings, createProjectSetupLoading: true });
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allProjectCheck',
      });
      if (beforeCreateCheck === false) {
        setLoading({ ...loadings, createProjectSetupLoading: false });
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'PROJECT' : null,
    }).then((res) => {
      if (res) {
        setLoading({ ...loadings, createProjectSetupLoading: false });
        if (res.failed) {
          notification.error({ message: res.message });
          return;
        }
        if (res.companyInconsistentFlag === 0 && res.currencyInconsistentFlag === 1) {
          Modal.error({
            content: intl
              .get('ssrc.inquiryHall.view.message.notCreate.currency')
              .d('币种不一致，不能并单创建'),
          });
          return;
        }
        if (res.unitInconsistentFlag === 1) {
          Modal.error({
            content: intl
              .get('ssrc.inquiryHall.view.message.notCreate.depart')
              .d('部门不一致，不能并单创建'),
          });
          return;
        }
        if (
          res.companyInconsistentFlag === 0 &&
          res.currencyInconsistentFlag === 0 &&
          res.unitInconsistentFlag === 0
        ) {
          handleCreateQuoteAppoval();
        }
        if (
          res.companyInconsistentFlag === 1 &&
          res.currencyInconsistentFlag === 0 &&
          res.unitInconsistentFlag === 0
        ) {
          Modal.confirm({
            bodyStyle: { padding: '20px' },
            children: (
              <p>
                {intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?')}
              </p>
            ),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            onOk: () => {
              handleCreateQuoteAppoval();
            },
          });
        } else {
          handleCreateQuoteAppoval();
        }
      }
    });
  };

  // 新建寻源立项
  const handleCreateQuoteAppoval = async () => {
    const data = allLineDs.toJSONData();
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prLineNumList = data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`)?.join(',');
    setLoading({ ...loadings, createProjectSetupLoading: true });
    await createProject({
      prLineIdList,
      configCenterCode: 'SITE.SSRC.PROJECT_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'PROJECT' : null,
    })
      .then((res) => {
        if (res && !res.failed) {
          notification.success();
          const {
            sourceProject: { sourceProjectId = null },
          } = res;
          const search = querystring.stringify({
            sourceFrom: '',
          });
          const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
          allLineDs.unSelectAll();
          allLineDs.clearCachedSelected();
          allLineDs.query();
          if (
            menuLeafNodes.find(
              (node) => node.functionMenuCode === 'srm.ssrc.source.manage.plan.source.project'
            )
          ) {
            history.push({
              pathname: `/ssrc/project-setup/update/${sourceProjectId}`,
              search,
            });
          } else if (
            menuLeafNodes.find(
              (node) => node.functionMenuCode === 'srm.ssrc.source.manage.plan.project-inquiry-hall'
            )
          ) {
            if (isNewRfxDetailUI) {
              history.push({
                pathname: `/ssrc/new-project-setup/sp-update/${sourceProjectId}`,
                search,
              });
            } else {
              history.push({
                pathname: `/ssrc/new-project-setup/update/${sourceProjectId}`,
                search,
              });
            }
          } else {
            notification.warning({
              message: intl
                .get('sprm.common.model.outMenu.errorLink', { prNumList: prLineNumList })
                .d(
                  `【${prLineNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
                ),
            });
          }
        } else if (res && res.failed) {
          notification.error({ message: res.message });
        }
      })
      .finally(() => {
        setLoading({ ...loadings, createProjectSetupLoading: false });
      });
  };

  // 新建招标单据校验信息
  const handleCreateBid = async () => {
    const data = allLineDs.toJSONData();
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prNumList = data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`).join(',');
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }
    setLoading({ ...loadings, createBidLoading: true });
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allBidCheck',
      });
      if (beforeCreateCheck === false) {
        setLoading({ ...loadings, createBidLoading: false });
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      sourceFrom: 'DEMAND_POOL',
      configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'BID' : null,
    }).then((res) => {
      if (res) {
        setLoading({ ...loadings, createBidLoading: false });
        if (res.failed) {
          notification.error({ message: res.message });
          return;
        }
        if (res.companyInconsistentFlag === 1) {
          Modal.confirm({
            bodyStyle: { padding: '20px' },
            children: (
              <p>
                {intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?')}
              </p>
            ),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            onOk: () => {
              handleCreateBidApproval(prLineIdList, prNumList);
            },
          });
        } else {
          handleCreateBidApproval(prLineIdList, prNumList);
        }
      }
    });
  };

  const handleCreateSiecPro = async () => {
    const { clearExtraData } = remote?.props?.process || {};
    const prLineIdList = allLineDs?.selected?.map((ele) => {
      ele.reset();
      if (isFunction(clearExtraData)) {
        return clearExtraData(ele);
      } else {
        return ele.toData();
      }
    });
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allSiecProjectCheck',
      });
      if (beforeCreateCheck === false) {
        return false;
      }
    }
    await createSiecProject(prLineIdList).then((res) => {
      if (res && !res.failed) {
        notification.success();
        allLineDs.unSelectAll();
        allLineDs.clearCachedSelected();
        allLineDs.query();
        const { projectId } = res;
        const prLineNumList = prLineIdList.map((e) => `${e.displayPrNum}-${e.displayLineNum}`);
        const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
        const linkRouteFlag = menuLeafNodes.some(
          (node) => node.functionMenuCode === 'srm.bg.management.project'
        );
        if (!linkRouteFlag) {
          notification.warning({
            message: intl
              .get('sprm.common.model.outMenu.errorLink', { prNumList: prLineNumList })
              .d(
                `【${prLineNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
              ),
          });
        } else {
          history.push({
            pathname: `/sprm/project-workspace/edit-detail/${projectId}`,
          });
        }
      } else if (res && res.failed) {
        notification.error({ message: res.message });
      }
    });
  };

  // 新建招标（新）
  const handleCreateNewBidding = async () => {
    const data = allLineDs.toJSONData();
    const prLineIdList = data?.map((ele) => ele.prLineId);
    const prNumList = data.map((e) => `${e.displayPrNum}-${e.displayLineNum}`).join(',');
    if (isEmpty(data)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
      return;
    }

    setLoading({ ...loadings, createBidLoading: true });
    if (remote) {
      const beforeCreateCheck = await remote.event.fireEvent('beforeCreateCheck', {
        currentListDs: allLineDs,
        currentPage: 'allNewBiddingCheck',
      });
      if (beforeCreateCheck === false) {
        setLoading({ ...loadings, createBidLoading: false });
        return false;
      }
    }
    await checkApplyToInquiry({
      prLineIdList,
      sourceFrom: 'DEMAND_POOL',
      configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      sourceDocumentType: !isOldUser ? 'NEW_BID' : null,
    }).then((res) => {
      setLoading({ ...loadings, createBidLoading: false });
      if (res) {
        if (res.failed) {
          notification.error({ message: res.message });
          return;
        }
        if (res?.companyInconsistentFlag === 1) {
          Modal.confirm({
            bodyStyle: { padding: '20px' },
            children: (
              <p>
                {intl
                  .get(`ssrc.inquiryHall.view.message.diffCompany`)
                  .d('并单公司不一致,是否继续?')}
              </p>
            ),
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            onOk: () => {
              handleCreateNewBidApproval(prLineIdList, prNumList);
            },
          });
        } else {
          handleCreateNewBidApproval(prLineIdList, prNumList);
        }
      }
    });
  };

  // 新建招标(新)单据
  const handleCreateNewBidApproval = async (prLineIdList, prNumList) => {
    const ds = new DataSet(
      templateModalDs(
        { config: 'RFX', sourceFrom: 'DEMAND_POOL' },
        { secondarySourceCategory: 'NEW_BID' }
      )
    );
    if (remote) {
      await remote.event.fireEvent('beforeCreateTemplate', {
        templateDs: ds,
        tabkey: 'newBidding',
      });
    }
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <Template ds={ds} />,
      onOk: async () => {
        const validateFlag = await ds.validate();
        if (validateFlag) {
          const { templateId } = ds.toData() ? ds.toData()[0] : {};
          await createApplyToInquiry({
            templateId,
            prLineIdList,
            sourceFrom: 'DEMAND_POOL',
            configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
            sourceDocumentType: !isOldUser ? 'NEW_BID' : null,
          }).then((result) => {
            if (getResponse(result)) {
              notification.success();
              allLineDs.unSelectAll();
              allLineDs.clearCachedSelected();
              allLineDs.query();
              const { rfxHeader } = result || {};
              const { rfxHeaderId } = rfxHeader;
              // const search = querystring.stringify({
              //   bidRuleType,
              //   subjectMatterRule,
              // });
              const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
              const linkRouteFlag = menuLeafNodes.some(
                (node) =>
                  node.functionMenuCode === 'srm.ssrc.source.manage.new-bidding.bid-inquiry-hall'
              );
              if (!linkRouteFlag) {
                notification.warning({
                  message: intl
                    .get('sprm.common.model.outMenu.errorLink', { prNumList })
                    .d(
                      `【${prNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
                    ),
                });
              } else {
                history.push({
                  pathname: `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`,
                  // search: querystring.stringify(search),
                });
              }
            }
          });
        } else {
          return false;
        }
      },
    });
  };

  /**
   * 寻源 按钮数据集
   * https://gateway.dev.isrm.going-link.com/ssrc/v1/30/share/application/rfx/export
https://gateway.dev.isrm.going-link.com/ssrc/v1/30/share/application/new-bid/export
https://gateway.dev.isrm.going-link.com/ssrc/v1/30/share/application/bid/export
https://gateway.dev.isrm.going-link.com/ssrc/v1/30/share/application/project/export
   * */
  const getSouceTabExportButtonProps = () => {
    const organization = getCurrentOrganizationId();

    const sourceMetaData = {
      inquiryQuotation: {
        name: 'sourceExportNewInquiry',
        currentDs: inquiryQuotationLineDs,
        sourceDocumentType: 'RFX',
        templateExportCode: 'SRM_C_SRM_SPRM_PR_HEADER_PENDING_RFX',
        url: `${SRM_SSRC}/v1/${organization}/share/application/rfx/export?sourceDocumentType=RFX`,
        customizeUnitCode:
          'SPRM.PURCHASE_EXECUTION_ALL.RFX_LIST,SPRM.PURCHASE_EXECUTION_ALL.RFX_FILTER',
      },
      newBidding: {
        currentDs: newBiddingLineDs,
        name: 'sourceExportNewNewBidding',
        sourceDocumentType: 'NEW_BID',
        templateExportCode: 'SRM_C_SRM_SPRM_PR_HEADER_PENDING_NEW_BID',
        url: `${SRM_SSRC}/v1/${organization}/share/application/new-bid/export?sourceDocumentType=NEW_BID`,
        customizeUnitCode:
          'SPRM.PURCHASE_EXECUTION_ALL.NEWBIDLIST,SPRM.PURCHASE_EXECUTION_ALL.NEWBID_FILTER',
      },
      bidding: {
        currentDs: bidingLineDs,
        name: 'sourceExportNewBidding',
        sourceDocumentType: 'BID',
        templateExportCode: 'SRM_C_SRM_SPRM_PR_HEADER_PENDING_BID',
        url: `${SRM_SSRC}/v1/${organization}/share/application/bid/export?sourceDocumentType=BID`,
        customizeUnitCode:
          'SPRM.PURCHASE_EXECUTION_ALL.BIDLIST,SPRM.PURCHASE_EXECUTION_ALL.BID_FILTER',
      },
      quoteApproval: {
        currentDs: quoteApprovalLineDs,
        name: 'sourceExportNewQuoteApproval',
        sourceDocumentType: 'PROJECT',
        templateExportCode: 'SRM_C_SRM_SPRM_PR_HEADER_PENDING_SOURCE_PROJECT',
        url: `${SRM_SSRC}/v1/${organization}/share/application/project/export?sourceDocumentType=PROJECT`,
        customizeUnitCode:
          'SPRM.PURCHASE_EXECUTION_ALL.PROJECT_LIST,SPRM.PURCHASE_EXECUTION_ALL.PROJECT_FILTER',
      },
    };

    const buttonProps = sourceMetaData[executionTab || ''];

    return buttonProps;
  };

  // source export
  const getSourceExportButton = () => {
    const { currentDs, url, templateExportCode, customizeUnitCode = '' } =
      getSouceTabExportButtonProps() || {};

    if (!currentDs || !url || !templateExportCode) {
      return;
    }

    // export params
    const getTableParams = () => {
      const params = getQueryFrom(executionTab) || {};

      return {
        ...params,
        customizeUnitCode,
      };
    };

    const button = {
      name: 'sourceExportNew',
      btnComp: ExcelExportPro,
      childFor: 'buttonText',
      child:
        currentDs.selected?.length > 0
          ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
          : intl.get('hzero.common.export').d('导出'),
      btnProps: {
        templateCode: templateExportCode, // 导出模板编码
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
        },
        method: 'GET',
        requestUrl: url,
        queryParams: () => getTableParams(),
      },
    };

    return button;
  };

  // 新建招标单据
  const handleCreateBidApproval = async (prLineIdList, prNumList) => {
    const ds = new DataSet(templateModalDs({ config: 'BID', sourceFrom: 'DEMAND_POOL' }));
    if (remote) {
      await remote.event.fireEvent('beforeCreateTemplate', { templateDs: ds, tabkey: 'bidding' });
    }
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <Template ds={ds} />,
      onOk: async () => {
        const validateFlag = await ds.validate();
        if (validateFlag) {
          const { templateId } = ds.toData() ? ds.toData()[0] : {};
          await createApplyToBid({
            templateId,
            prLineIdList,
            configCenterCode: 'SITE.SSRC.BID_PURCHASE_MERGE_RULE',
            sourceDocumentType: !isOldUser ? 'BID' : null,
          }).then((result) => {
            if (result) {
              if (result.failed) {
                notification.error({ message: result.message });
                return;
              }
              notification.success();
              allLineDs.unSelectAll();
              allLineDs.clearCachedSelected();
              allLineDs.query();
              const { bidHeader } = result;
              const { bidHeaderId, bidRuleType, subjectMatterRule } = bidHeader;
              const search = querystring.stringify({
                bidRuleType,
                subjectMatterRule,
              });
              const menuLeafNodes = window?.dvaApp?._store?.getState()?.global?.menuLeafNode || [];
              const linkRouteFlag = menuLeafNodes.some(
                (node) => node.functionMenuCode === 'srm.ssrc.source.manage.bidding.hall'
              );
              setLoading({ ...loadings, createBidLoading: false });
              if (!linkRouteFlag) {
                notification.warning({
                  message: intl
                    .get('sprm.common.model.outMenu.errorLink', { prNumList })
                    .d(
                      `【${prNumList}】单据已创建成功，由于当前角色无对应菜单权限，无法跳转至对应菜单，请添加权限后再操作。`
                    ),
                });
              } else {
                history.push({
                  pathname: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
                  search: querystring.stringify(search),
                });
              }
            }
          });
        } else {
          return false;
        }
      },
    });
  };

  const HeaderBtn = observer(({ currentDs }) => {
    const headerButtons = []; //  onClick={goReferenceDocument}
    const { getCuxHeaderButtons, controlCuxDomTabButtons } = remote?.props?.process || {};

    if (isFunction(getCuxHeaderButtons)) {
      headerButtons.push(
        ...getCuxHeaderButtons({
          currentDs,
          tabActiveKey,
          changeTabNum,
          customizeForm,
          oldAssignLovSetting,
          setting: isExecutionStrategy,
        })
      );
    }

    if (['approved', 'assigned', 'suspend', 'all'].includes(tabActiveKey)) {
      let selectFlag = 0;
      if (currentDs.selected.length > 0) {
        const selectedRows = currentDs.selected;
        const newStatusFlag = Array.from(
          new Set(selectedRows?.map((ele) => ele.get('prLineStatusCode')))
        );
        if (newStatusFlag.some((ele) => ele === 'SUSPEND') && newStatusFlag.length > 1) {
          selectFlag = 0;
        } else if (newStatusFlag.some((ele) => ele === 'SUSPEND') && newStatusFlag.length === 1) {
          selectFlag = 2;
        } else {
          selectFlag = 1;
        }
      } else {
        selectFlag = 0;
      }
      // 分配 暂挂
      if (tabActiveKey !== 'suspend') {
        if (btnsPermission.assign) {
          headerButtons.push({
            name: 'assign',
            btnProps: {
              icon: 'baseline-file_copy',
              type: 'c7n-pro',
              btnType: 'c7n-pro',
              color: 'primary',
              funcType: 'raised',
              className: 'action-btns',
              onClick: handleAssign,
              wait: THROTTLE_TIME,
              disabled: selectFlag !== 1 || tabActiveKey === 'suspend',
              // permissionList: [
              //   {
              //     code: `hzero.srm.requirement.prm.pr-execution.ps.assign`,
              //     type: 'button',
              //     meaning: '分配按钮权限',
              //   },
              // ],
            },
            child: intl.get(`sprm.purchaseRequisitionAssign.view.button.assign`).d('分配'),
          });
        }
        if (btnsPermission.suspend) {
          headerButtons.push({
            name: 'suspend',
            btnProps: {
              icon: 'enhanced_encryption-o',
              type: 'c7n-pro',
              btnType: 'c7n-pro',
              funcType: 'flat',
              className: 'action-btns',
              onClick: handleSuspend,
              wait: THROTTLE_TIME,
              disabled: selectFlag !== 1 || tabActiveKey === 'suspend',
              // permissionList: [
              //   {
              //     code: `hzero.srm.requirement.prm.pr-execution.ps.suspend`,
              //     type: 'button',
              //     meaning: '暂挂按钮权限',
              //   },
              // ],
            },
            child: intl.get(`sprm.purchaseRequisitionAssign.view.button.suspend`).d('暂挂'),
          });
        }
      }

      if (tabActiveKey === 'assigned' && btnsPermission.returntoassign) {
        const btnFlag =
          currentDs.selected.length === 0 ||
          currentDs.selected.some(
            (ele) =>
              ele.get('occupiedQuantity') ||
              ele.get('orderOccupiedQuantity') ||
              ele.get('sourceOccupiedQuantity')
          );

        headerButtons.push({
          name: 'returntoassign',
          type: 'c7n-pro',
          btnProps: {
            icon: 'reply',
            funcType: 'flat',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            // className: 'action-btns',
            onClick: () => handleReturntoassign('approved'),
            wait: THROTTLE_TIME,
            disabled: btnFlag,
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.returntoassign`,
            //     type: 'button',
            //   },
            // ],
          },
          child: intl.get(`sprm.common.view.btn.returntoassign`).d('退回至待分配'),
        });
      }
      if (
        tabActiveKey === 'all' &&
        !isOldUser &&
        isExecutionStrategy &&
        btnsPermission.updatestrategy
      ) {
        headerButtons.push({
          name: 'updatestrategy',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'autorenew',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            funcType: 'flat',
            onClick: updateStrategy,
            wait: THROTTLE_TIME,
            loading: updateSupplierLoading,
            disabled:
              !currentDs?.selected?.length ||
              currentDs?.selected?.some(
                (ele) =>
                  ele.get('occupiedQuantity') ||
                  ele.get('orderOccupiedQuantity') ||
                  ele.get('sourceOccupiedQuantity') ||
                  ele.get('prLineStatusCode') !== 'ASSIGNED'
              ),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.button.updatestrategy`,
            //     type: 'button',
            //     meaning: '更新需求执行策略',
            //   },
            // ],
          },
          child: intl.get(`sprm.common.view.btn.updatestrategy`).d('更新需求执行策略'),
        });
      }
      // 启用
      if (['all', 'suspend'].includes(tabActiveKey) && btnsPermission.open) {
        headerButtons.push({
          name: 'enable',
          btnProps: {
            icon: 'finished',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            funcType: 'flat',
            className: 'action-btns',
            onClick: handleEnable,
            wait: THROTTLE_TIME,
            disabled: selectFlag !== 2,
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.open`,
            //     type: 'button',
            //     meaning: '启用按钮权限',
            //   },
            // ],
          },
          child: intl.get(`sprm.purchaseRequisitionAssign.view.button.enable`).d('启用'),
        });
      }

      const exportFlag = btnsPermission[`${tabActiveKey}Export`] || false;
      const newExportFlag = btnsPermission[`${tabActiveKey}NewExport`] || false;

      if (newExportFlag) {
        // 新导出
        headerButtons.push({
          name: 'newExport',
          noNest: true,
          btnComp: ExcelExportPro,
          childFor: 'buttonText',
          child:
            currentDs.selected?.length > 0
              ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
              : intl.get('hzero.common.export').d('导出'),
          btnProps: {
            templateCode: 'SPUC_SPRM_EXECUTION_PLATFORM_LINE_EXPORT', // 导出模板编码
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
            },
            method: 'POST',
            allBody: true,
            requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-request/execution-platform/can-assign/export-modeler`,
            queryParams: () => getQueryFrom('new'),
          },
        });
      }

      if (exportFlag) {
        // 导出
        headerButtons.push({
          name: 'export',
          noNest: true,
          btnComp: ExcelExport,
          childFor: 'buttonText',
          buttonText:
            currentDs.selected?.length > 0
              ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
              : intl.get('hzero.common.button.export').d('导出'),
          btnProps: {
            templateCode: 'SPUC_SPRM_EXECUTION_PLATFORM_LINE_EXPORT', // 导出模板编码
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
            },
            requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-request/execution-platform/can-assign/export`,
            queryParams: () => getQueryFrom(),
          },
        });
      }
    } else if (tabActiveKey !== 'allLine') {
      const { selected: contracSelected } = contractLineDs;
      const transferredDocumentTypeVOList =
        contracSelected?.map((item) =>
          item?.get('transferredDocumentTypeVOList')?.map((i) => i.typeCode)
        ) || [];
      let creatDisabledFlag = false;
      const contractCreateFlag =
        transferredDocumentTypeVOList?.every((ele) => {
          return ele?.includes('TRANSFERABLE_CONTRACT_FRAMEWORK');
        }) ||
        transferredDocumentTypeVOList?.every((ele) => {
          return ele?.includes('TRANSFERABLE_CONTRACT_SIMPLE');
        }) ||
        transferredDocumentTypeVOList?.every((ele) => ele?.length === 0 || isEmpty(ele));
      if (!contractCreateFlag && tabActiveKey === 'contract') {
        creatDisabledFlag = true;
      }
      let cuxFlag = false;
      if (typeof controlCuxDomTabButtons === 'function') {
        cuxFlag = controlCuxDomTabButtons({ executionTab });
      }
      if (!cuxFlag) {
        headerButtons.push({
          name: 'create',
          btnType: 'c7n-pro',
          child: intl.get(`hzero.common.button.create`).d('新建'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'add',
            color: 'primary',
            onClick: () => handleAdd(),
            disabled: !currentDs.selected.length || creatDisabledFlag,
            wait: THROTTLE_TIME,
          },
        });
      }
      headerButtons.push({
        name: 'create',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.create`).d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          color: 'primary',
          onClick: () => handleAdd(),
          disabled: !currentDs.selected.length || creatDisabledFlag,
          wait: THROTTLE_TIME,
        },
      });

      if (tabActiveKey === 'order') {
        headerButtons.push({
          name: 'updateSupplier',
          btnType: 'c7n-pro',
          child: intl.get(`sprm.common.view.btn.updateSuppliers`).d('更新推荐供应商'),
          btnProps: {
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            icon: 'autorenew',
            funcType: 'flat',
            loading: updateSupplierLoading,
            wait: THROTTLE_TIME,
            onClick: () => updateSuppliers('order'),
            disabled: !currentDs.selected.length,
          },
        });
        if (btnsPermission.clearSuppliers) {
          headerButtons.push({
            name: 'clearSupplier',
            btnType: 'c7n-pro',
            child: intl.get(`sprm.common.view.btn.clearRecommendedSuppliers`).d('清空推荐供应商'),
            btnProps: {
              icon: 'delete_sweep-o',
              funcType: 'flat',
              wait: THROTTLE_TIME,
              onClick: () => clearSuppliers('order'),
              disabled: !currentDs.selected.length,
            },
          });
        }
        headerButtons.push({
          name: 'orderExport',
          btnComp: ExcelExportPro,
          childFor: 'buttonText',
          child:
            currentDs.selected?.length > 0
              ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
              : intl.get('hzero.common.export').d('导出'),
          btnProps: {
            templateCode: 'SPUC_SPRM_EXECUTION_PLATFORM_LINE_ORDER_EXPORT', // 导出模板编码
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
            },
            method: 'POST',
            allBody: true,
            requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/po-refer-pr/workbench-pr-line/export`,
            queryParams: () => getQueryFrom('new'),
          },
        });
      }
      if (tabActiveKey === 'contract') {
        headerButtons.push({
          name: 'contractUpdateSupplier',
          btnType: 'c7n-pro',
          child: intl.get(`sprm.common.view.btn.updateSuppliers`).d('更新推荐供应商'),
          btnProps: {
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            icon: 'autorenew',
            funcType: 'flat',
            loading: updateSupplierLoading,
            wait: THROTTLE_TIME,
            onClick: () => updateSuppliers('contract'),
            disabled: !currentDs.selected.length,
          },
        });
      }

      if (['inquiryQuotation', 'newBidding', 'bidding', 'quoteApproval'].includes(tabActiveKey)) {
        const sourceExportBtn = getSourceExportButton();

        if (sourceExportBtn) {
          headerButtons.push(sourceExportBtn);
        }
      }
    } else if (tabActiveKey === 'allLine') {
      const { selected } = allLineDs;
      const selectedTypeCodeList = selected?.map((ele) =>
        ele.get('transferredDocumentTypeVOList')
          ? ele.get('transferredDocumentTypeVOList')?.map((item) => item.typeCode)
          : []
      );
      const docCreateList = [
        tabsPermission.order && {
          name: 'creatOrder',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toOrder`).d('新建订单'),
          btnProps: {
            onClick: () => handleCreateOrder(),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.order.tab`,
            //   },
            // ],
            wait: THROTTLE_TIME,
            loading: loadings?.createOrderLoading,
            disabled:
              !currentDs.selected.length ||
              currentDs.selected.some((ele) => !ele.get('prTransferredOrderFlag')),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        },
        tabsPermission.rfx && {
          name: 'creatRfx',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toRfx`).d('新建询报价'),
          btnProps: {
            onClick: () => handleCreateRfx(),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.rfx.tab`,
            //   },
            // ],
            loading: loadings?.createRfxLoading,
            wait: THROTTLE_TIME,
            disabled:
              !currentDs.selected.length ||
              !selectedTypeCodeList.every(
                (ele) => ele.includes('TRANSFERABLE_RFX') || ele.includes('TRANSFERABLE_SOURCE')
              ),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        },
        tabsPermission.quoteApproval && {
          name: 'creatProject',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toProject`).d('新建寻源立项单'),
          btnProps: {
            onClick: () => handleCreateProject(),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.quoteapproval.tab`,
            //   },
            // ],
            loading: loadings?.createProjectSetupLoading,
            wait: THROTTLE_TIME,
            disabled:
              !currentDs.selected.length ||
              !selectedTypeCodeList.every(
                (ele) =>
                  ele.includes('TRANSFERABLE_SOURCE_PROJECT') || ele.includes('TRANSFERABLE_SOURCE')
              ),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        },
        tabsPermission.bid && {
          name: 'creatBid',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toBid`).d('新建招标单'),
          btnProps: {
            onClick: () => handleCreateBid(),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.bid.tab`,
            //   },
            // ],
            loading: loadings?.createBidLoading,
            wait: THROTTLE_TIME,
            disabled:
              !currentDs.selected.length ||
              !selectedTypeCodeList.every(
                (ele) => ele.includes('TRANSFERABLE_BID') || ele.includes('TRANSFERABLE_SOURCE')
              ),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        },
        tabsPermission.contract && {
          name: 'creatContract',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toContract`).d('新建协议'),
          btnProps: {
            onClick: () => handleCreateContract(),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.contract.tab`,
            //   },
            // ],
            wait: THROTTLE_TIME,
            disabled:
              !currentDs.selected.length ||
              !(
                selectedTypeCodeList.every((ele) => ele.includes('TRANSFERABLE_CONTRACT')) ||
                selectedTypeCodeList.every((ele) =>
                  ele.includes('TRANSFERABLE_CONTRACT_FRAMEWORK')
                ) ||
                selectedTypeCodeList.every((ele) => ele.includes('TRANSFERABLE_CONTRACT_SIMPLE'))
              ),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        },
        {
          name: 'createSiecProject',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toSiecProject`).d('新建项目'),
          btnProps: {
            hidden: isOldUser,
            onClick: () => handleCreateSiecPro(),
            disabled:
              !currentDs.selected.length ||
              !selectedTypeCodeList.every((ele) => ele.includes('TRANSFERABLE_PROJECT')),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        },
      ];
      if (isShowNewBid && tabsPermission.bidNew) {
        docCreateList.push({
          name: 'creatNewBindding',
          btnType: 'c7n-pro',
          btnComp: Button,
          child: intl.get(`sprm.common.button.toNewBidding`).d('新建招标单(新)'),
          btnProps: {
            onClick: handleCreateNewBidding,
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.bid.tab_new`,
            //   },
            // ],
            loading: loadings?.createBidLoading,
            wait: THROTTLE_TIME,
            disabled:
              !currentDs.selected.length ||
              !selectedTypeCodeList.every(
                (ele) => ele.includes('TRANSFERABLE_BID_NEW') || ele.includes('TRANSFERABLE_SOURCE')
              ),
            style: {
              display: 'block',
              border: 'none',
              textAlign: 'left',
              // width: '100%',
              fontWeight: 400,
            },
          },
        });
      }
      const transferredDocumentTypeVOList =
        selected?.map((item) =>
          item?.get('transferredDocumentTypeVOList')?.map((i) => i.typeCode)
        ) || [];
      const contractCreateFlag =
        transferredDocumentTypeVOList?.every((ele) => {
          return ele?.includes('TRANSFERABLE_CONTRACT_FRAMEWORK');
        }) ||
        transferredDocumentTypeVOList?.every((ele) => {
          return ele?.includes('TRANSFERABLE_CONTRACT_SIMPLE');
        }) ||
        transferredDocumentTypeVOList?.every((ele) => {
          return ele?.includes('TRANSFERABLE_CONTRACT');
        });
      const allLineBtns = [
        btnsPermission.allCreate && {
          name: 'creatOtherDoc',
          group: true,
          noNest: true,

          children: docCreateList.filter((ele) => ele),
          child: (text) => (
            <Button
              type="primary"
              btnType="c7n-pro"
              wait={THROTTLE_TIME}
              loading={
                loadings.createOrderLoading ||
                loadings?.createRfxLoading ||
                loadings?.createProjectSetupLoading ||
                loadings?.createBidLoading ||
                loadings?.contractLoading
              }
            >
              <Icon type="add" style={{ marginRight: 4, fontSize: 14 }} />
              {text || intl.get(`hzero.common.button.create`).d('新建')}
              <Icon type="expand_more" style={{ marginLeft: 4, fontSize: 16 }} />
            </Button>
          ),
        },
        btnsPermission.returntoassign && {
          name: 'returntoassign',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'reply',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            funcType: 'flat',
            onClick: handleReturntoassign,
            wait: THROTTLE_TIME,
            loading: updateSupplierLoading,
            disabled:
              currentDs.selected.length === 0 ||
              currentDs.selected.some(
                (ele) =>
                  ele.get('occupiedQuantity') ||
                  ele.get('orderOccupiedQuantity') ||
                  ele.get('sourceOccupiedQuantity')
              ),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.returntoassign`,
            //     type: 'button',
            //     meaning: '退回至待分配',
            //   },
            // ],
          },
          child: intl.get(`sprm.common.view.btn.returntoassign`).d('退回至待分配'),
        },
        (tabsPermission.order || tabsPermission.contract) && {
          name: 'updateSupplier',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'autorenew',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            funcType: 'flat',
            onClick: () => updateSuppliers('allTab'),
            wait: 300,
            loading: updateSupplierLoading || loadings?.supplierLoading,
            disabled:
              !currentDs?.selected?.length ||
              !(
                currentDs.selected.every((ele) => ele.get('prTransferredOrderFlag')) ||
                contractCreateFlag
              ),
            // disabled:
            //   !currentDs?.selected?.length ||
            //   currentDs.selected.some((ele) => !ele.get('prTransferredOrderFlag')),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.order.tab`,
            //     type: 'button',
            //     meaning: '更新推荐供应商',
            //   },
            // ],
          },
          child: intl.get(`sprm.common.view.btn.updateSuppliers`).d('更新推荐供应商'),
        },
        btnsPermission.allTabExport && {
          name: 'exportAll',
          btnComp: ExcelExport,
          noNest: true,
          childFor: 'buttonText',
          child: selected.length
            ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
            : intl.get('hzero.common.export').d('导出'),
          btnProps: {
            // exportAsync: true, // 是否异步
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
            },
            requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-request/execution-platform/execution/export`,
            queryParams: () => getQueryAllLine(),
          },
        },
        btnsPermission.allTabNewExport && {
          name: 'newExportAll',
          noNest: true,
          btnComp: ExcelExportPro,
          childFor: 'buttonText',
          child:
            currentDs.selected?.length > 0
              ? intl.get('hzero.common.button.exportSelect').d('勾选导出')
              : intl.get('hzero.common.export').d('导出'),
          btnProps: {
            templateCode: 'SPUC_SPRM_EXECUTION_PLATFORM_LINE_ALL_EXPORT', // 导出模板编码
            exportAsync: true, // 是否异步
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
            },
            method: 'POST',
            allBody: true,
            requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-request/execution-platform/execution/export-modeler`,
            queryParams: () => getQueryAllLine('new'),
          },
        },
      ];
      if (
        isExecutionStrategy &&
        Number(isExecutionStrategy) &&
        btnsPermission.updateExecutionStrategy
      ) {
        allLineBtns.splice(-2, 0, {
          name: 'updateExecutionStrategy',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'autorenew',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            funcType: 'flat',
            onClick: updateExecutionStrategy,
            wait: THROTTLE_TIME,
            loading: updateSupplierLoading,
            disabled: !currentDs?.selected?.length,
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.ps.update_executionstrategy`,
            //     type: 'button',
            //     meaning: '重新分配',
            //   },
            // ],
          },
          child: intl.get(`sprm.common.view.btn.updateExecutionStrategy`).d('重新分配'),
        });
      }
      if (!isOldUser && isExecutionStrategy && btnsPermission.updatestrategy) {
        allLineBtns.splice(-2, 0, {
          name: 'updatestrategy',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'autorenew',
            type: 'c7n-pro',
            btnType: 'c7n-pro',
            funcType: 'flat',
            onClick: updateStrategy,
            wait: THROTTLE_TIME,
            loading: updateSupplierLoading,
            disabled:
              !currentDs?.selected?.length ||
              currentDs?.selected?.some(
                (ele) =>
                  ele.get('occupiedQuantity') ||
                  ele.get('orderOccupiedQuantity') ||
                  ele.get('sourceOccupiedQuantity') ||
                  ele.get('prLineStatusCode') !== 'ASSIGNED'
              ),
            // permissionList: [
            //   {
            //     code: `hzero.srm.requirement.prm.pr-execution.button.updatestrategy`,
            //     type: 'button',
            //     meaning: '更新需求执行策略',
            //   },
            // ],
          },
          child: intl.get(`sprm.common.view.btn.updatestrategy`).d('更新需求执行策略'),
        });
      }
      headerButtons.push(...allLineBtns);
    }

    const cuxHeaderButtons =
      remote?.process?.('SPRM_PRHEADER_REMOTE_PROCESS_HEADER_BTN', headerButtons, {
        purchaseplatform,
        location,
        currentDs,
        customizeForm,
        tabActiveKey,
        saveSuspendConfigure,
        changeTabNum,
        updateSuppliers,
        orderRef,
        updateSupplierLoading,
        setUpdateSupplierLoading,
        setLoading,
        loadings,
      }) || headerButtons;

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SPRM.PURCHASE_EXECUTION.BTNS',
            pro: true,
          },
          <DynamicButtons
            key="purchaseExecutionButtons"
            buttons={cuxHeaderButtons.filter((e) => !e?.btnProps?.hidden)}
            maxNum={5}
            defaultBtnType="c7n-pro"
          />
        )}
      </>
    );
  });

  // 更新执行策略
  const updateExecutionStrategy = useCallback(() => {
    allRef.handleExecutionStrategy();
  });

  const updateStrategy = useCallback(() => {
    const currentDs = getCurrentDs(tabActiveKey);
    setUpdateSupplierLoading(true);
    const { selected } = currentDs;
    if (selected.length > 0) {
      const changeLine = selected?.map((ele) => ({
        ...ele.toJSONData(),
        supplierList: ele.get('supplierList') ? ele.get('supplierList').toJS() : undefined,
      }));
      updateReferPrice(changeLine).then((res) => {
        setUpdateSupplierLoading(false);
        const result = getResponse(res);
        if (result) {
          notification.success();
          currentDs.query();
        }
      });
    }
  });

  // tab切换的回调;
  const handleTabChange = useCallback((key) => {
    let tabActive = key;
    const { execute = [], assign = [] } = allTabShows || {};
    if (hiddenKeys.includes(key)) {
      if (execute.includes(key)) {
        const executeActive = execute.filter((item) => !hiddenKeys.includes(item));
        // eslint-disable-next-line prefer-destructuring
        tabActive = executeActive[0];
      }
      if (assign.includes(key)) {
        const assignActive = assign.filter((item) => !hiddenKeys.includes(item));
        // eslint-disable-next-line prefer-destructuring
        tabActive = assignActive[0];
      }
    }
    if (execute?.includes(tabActive) || isEmpty(execute)) {
      setExecutionTab(tabActive);
      if (
        [
          'order',
          'inquiryQuotation',
          'bidding',
          'newBidding',
          'contract',
          'quoteApproval',
          'allLine',
        ].includes(tabActive)
      ) {
        const currentDs = getCurrentDs(tabActive);
        if (currentDs.getState('initFlag')) {
          currentDs.query();
        }
      }
    }
    if (assign?.includes(tabActive) || isEmpty(assign)) {
      setAssignTab(tabActive);
      const currentDs = getCurrentDs(tabActive);
      if (currentDs.getState('initFlag')) {
        currentDs.query(currentDs.currentPage, {});
      }
    }
    setTabActiveKey(tabActive);
  });

  const initTab = (props, allTabs = [], tabsFields = []) => {
    if (props?.value?.cache) {
      const tabConfig = props.value.cache['SPRM.PURCHASE_EXECUTION.EXECUTION_TAB'];
      const key = tabConfig.getAllValue()?.activeKey || currentType;
      const withoutHiddenKey = allTabs?.filter((e) => !hiddenKeys.includes(e));
      const activeKey =
        key &&
        (withoutHiddenKey.includes(key) ||
          ![
            'approved',
            'assigned',
            'suspend',
            'all',
            'order',
            'inquiryQuotation',
            'bidding',
            'newBidding',
            'contract',
            'quoteApproval',
            'allLine',
          ].includes(key))
          ? key
          : withoutHiddenKey[0];
      if (activeKey && !initFlag && allTabs[0]) {
        allTabShows = tabsFields;
        const { assign = [], execute = [] } = tabsFields;
        if (execute?.includes(activeKey)) {
          setExecutionTab(activeKey);
          const assignTabKey = assign?.filter((e) => !hiddenKeys.includes(e));
          setAssignTab(assignTabKey[0]);
        } else if (assign?.includes(activeKey)) {
          setAssignTab(activeKey);
          const executeTabKey = execute?.filter((e) => !hiddenKeys.includes(e));
          setExecutionTab(executeTabKey[0]);
        }
        setTabActiveKey(activeKey);
        setInitFlag(true);
      }
    }
  };

  const queryPermissions = () => {
    const tabShowFlag = {};
    const btnShowFlag = {};
    const tabArray = [
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.assigntab', key: 'assigntab' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.executetab', key: 'executetab' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.order.tab', key: 'order' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.rfx.tab', key: 'rfx' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.bid.tab', key: 'bid' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.bid.tab_new', key: 'bidNew' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.quoteapproval.tab', key: 'quoteApproval' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.all.tab', key: 'all' },
      { code: 'hzero.srm.requirement.prm.pr-execution.ps.contract.tab', key: 'contract' },
    ];
    const btnArray = [
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.assign`,
        key: 'assign',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.suspend`,
        key: 'suspend',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.returntoassign`,
        key: 'returntoassign',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.button.updatestrategy`,
        key: 'updatestrategy',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.open`,
        key: 'open',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.will-assign.list.export`,
        key: 'approvedExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.new.will-assign.list.export`,
        key: 'approvedNewExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.assigned.list.export`,
        key: 'assignedExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.new.assigned.list.export`,
        key: 'assignedNewExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.suspend.list.export`,
        key: 'suspendExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.new.suspend.list.export`,
        key: 'suspendNewExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.all.list.export`,
        key: 'allExport',
      },
      {
        code: `hzero.srm.requirement.prm.pr-execution.ps.new.all.list.export`,
        key: 'allNewExport',
      },
      {
        code: 'hzero.srm.requirement.prm.pr-execution.ps.all_tab.create',
        key: 'allCreate',
      },
      {
        code: 'hzero.srm.requirement.prm.pr-execution.ps.all_tab.export',
        key: 'allTabExport',
      },
      {
        code: 'hzero.srm.requirement.prm.pr-execution.ps.all_tab.new_export',
        key: 'allTabNewExport',
      },
      {
        code: 'hzero.srm.requirement.prm.pr-execution.ps.update_executionstrategy',
        key: 'updateExecutionStrategy',
      },
      {
        code: 'hzero.srm.requirement.prm.pr-execution.button.clear-suppliers',
        key: 'clearSuppliers',
      },
    ];
    getPermissions([...tabArray, ...btnArray]?.map((ele) => ele.code)).then((res) => {
      tabArray.forEach((ele) => {
        tabShowFlag[ele.key] = res.get(ele.code);
      });
      if (!(tabShowFlag.assignTab || tabShowFlag.executetab)) {
        setTabActiveKey('order');
      }
      setTabsPermisson(tabShowFlag);
      btnArray.forEach((ele) => {
        btnShowFlag[ele.key] = res.get(ele.code);
      });
      setBtnsPermisson(btnShowFlag);
    });
  };

  // 查询二开的tab的数量
  useEffect(() => {
    const { getTabDom = [] } = remote?.props?.process || {};
    const otherTab = {};
    Promise.all(getTabDom?.map((e) => e?.count())).then((res) => {
      // console.log(res, getTabNum);
      getTabDom.forEach(({ key }, index) => {
        otherTab[key] = res[index];
        setCuxTabCounts({ ...otherTab });
      });
    });
  }, []);

  const getCuxTabDom = () => {
    const { getTabDom = [] } = remote?.props?.process || {};

    const getTabDomList = getTabDom?.map((e) => {
      return (
        <TabPane key={e.key} tab={e.meaning} count={otherTabCounts[e.key]}>
          {e.dom}
        </TabPane>
      );
    });
    return getTabDomList;
  };
  console.log(tabActiveKey);

  return (
    <Fragment>
      <Header title={intl.get('sprm.common.title.purchaseExecution').d('采购执行工作台')}>
        <HeaderBtn currentDs={getCurrentDs(tabActiveKey)} />
      </Header>
      <Content>
        {getTabsPropsCallback({
          components: customizeTabPane(
            {
              code: 'SPRM.PURCHASE_EXECUTION.EXECUTION_TAB',
              custLoading: false,
              cascade: true,
              custDefaultActive: (_, tabsShow) => {
                hiddenKeys = tabsShow?.firstRenderHiddenKeys || [];
              },
            },
            <Tabs
              hideOnlyGroup
              keyboard={false}
              activeKey={tabActiveKey}
              onChange={handleTabChange}
              tabPosition="top"
            >
              {tabsPermission.assigntab && (
                <TabGroup
                  tab={intl.get('sprm.purchaseRequisitionAssign.view.title.assign').d('分配')}
                  key="assign"
                  defaultActiveKey={assignTab}
                >
                  <TabPane
                    key="approved"
                    tab={
                      <span>
                        {intl
                          .get(`sprm.purchaseRequisitionAssign.view.button.notAssign`)
                          .d('待分配')}
                      </span>
                    }
                    count={assignTabCount.approvedCount}
                  >
                    <Assign
                      type="approved"
                      lineDs={approvedDs}
                      clearSelectAll={clearSelectAll}
                      location={location}
                      changeTabNum={changeTabNum}
                      customizeTable={customizeTable}
                      customizeForm={customizeForm}
                      uomControl={uomControl}
                      setting={isExecutionStrategy}
                      isOldUser={isOldUser}
                      oldAssignLovSetting={oldAssignLovSetting}
                      productPlaceConfig={productPlaceConfig}
                      isShowNewBid={isShowNewBid}
                      remote={remote}
                      dispatch={dispatch}
                      allAssignDs={{
                        approved: approvedDs,
                        assigned: assignedDs,
                        suspend: suspendDs,
                        all: assignAllDs,
                      }}
                    />
                  </TabPane>
                  <TabPane
                    key="assigned"
                    tab={
                      <span>
                        {intl
                          .get(`sprm.purchaseRequisitionAssign.view.button.assigned`)
                          .d('已分配')}
                      </span>
                    }
                    count={assignTabCount.assignedCount}
                  >
                    <Assign
                      type="assigned"
                      lineDs={assignedDs}
                      clearSelectAll={clearSelectAll}
                      location={location}
                      changeTabNum={changeTabNum}
                      customizeTable={customizeTable}
                      customizeForm={customizeForm}
                      uomControl={uomControl}
                      setting={isExecutionStrategy}
                      isOldUser={isOldUser}
                      oldAssignLovSetting={oldAssignLovSetting}
                      productPlaceConfig={productPlaceConfig}
                      isShowNewBid={isShowNewBid}
                      remote={remote}
                      dispatch={dispatch}
                      allAssignDs={{
                        approved: approvedDs,
                        assigned: assignedDs,
                        suspend: suspendDs,
                        all: assignAllDs,
                      }}
                    />
                  </TabPane>
                  <TabPane
                    key="suspend"
                    tab={
                      <span>
                        {intl.get(`sprm.purchaseRequisitionAssign.view.button.suspend`).d('暂挂')}
                      </span>
                    }
                    count={assignTabCount.suspendCount}
                  >
                    <Assign
                      type="suspend"
                      lineDs={suspendDs}
                      clearSelectAll={clearSelectAll}
                      location={location}
                      changeTabNum={changeTabNum}
                      customizeTable={customizeTable}
                      customizeForm={customizeForm}
                      uomControl={uomControl}
                      setting={isExecutionStrategy}
                      isOldUser={isOldUser}
                      oldAssignLovSetting={oldAssignLovSetting}
                      productPlaceConfig={productPlaceConfig}
                      isShowNewBid={isShowNewBid}
                      remote={remote}
                      dispatch={dispatch}
                      allAssignDs={{
                        approved: approvedDs,
                        assigned: assignedDs,
                        suspend: suspendDs,
                        all: assignAllDs,
                      }}
                    />
                  </TabPane>
                  <TabPane
                    key="all"
                    tab={
                      <span>
                        {intl.get(`sprm.purchaseRequisitionAssign.view.button.all`).d('全部')}
                      </span>
                    }
                    count={assignTabCount.assignAllCount}
                  >
                    <Assign
                      type="all"
                      lineDs={assignAllDs}
                      clearSelectAll={clearSelectAll}
                      location={location}
                      changeTabNum={changeTabNum}
                      customizeTable={customizeTable}
                      customizeForm={customizeForm}
                      uomControl={uomControl}
                      setting={isExecutionStrategy}
                      isOldUser={isOldUser}
                      oldAssignLovSetting={oldAssignLovSetting}
                      productPlaceConfig={productPlaceConfig}
                      isShowNewBid={isShowNewBid}
                      remote={remote}
                      dispatch={dispatch}
                      allAssignDs={{
                        approved: approvedDs,
                        assigned: assignedDs,
                        suspend: suspendDs,
                        all: assignAllDs,
                      }}
                    />
                  </TabPane>
                </TabGroup>
              )}

              {tabsPermission.executetab && (
                <TabGroup
                  tab={intl.get(`sprm.common.title.executeTab`).d('待执行')}
                  key="execute"
                  defaultActiveKey={executionTab}
                >
                  {tabsPermission.order && (
                    <TabPane
                      tab={<span>{intl.get(`sprm.common.title.toOrder`).d('待转订单')}</span>}
                      key="order"
                      count={executionTabCounts.orderCount}
                    >
                      <Order
                        clearSelectAll={clearSelectAll}
                        orderLineDs={orderLineDs}
                        onRef={(node) => {
                          orderRef = node;
                        }}
                        uomControl={uomControl}
                        remote={remote}
                        location={location}
                        changeTabNum={changeTabNum}
                        productPlaceConfig={productPlaceConfig}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                      />
                    </TabPane>
                  )}
                  {tabsPermission.rfx && (
                    <TabPane
                      tab={
                        <span>
                          {intl.get(`sprm.common.title.toInquiryQuotation`).d('待转询报价')}
                        </span>
                      }
                      key="inquiryQuotation"
                      count={executionTabCounts.inquiryQuotationCount}
                    >
                      <InquiryQuotation
                        inquiryQuotationDs={inquiryQuotationLineDs}
                        clearSelectAll={clearSelectAll}
                        onRef={(node) => {
                          inquiryQuotationRef = node;
                        }}
                        uomControl={uomControl}
                        isOldUser={isOldUser}
                        location={location}
                        remote={remote}
                        changeTabNum={changeTabNum}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                        productPlaceConfig={productPlaceConfig}
                      />
                    </TabPane>
                  )}
                  {isShowNewBid && tabsPermission.bidNew && (
                    <TabPane
                      tab={
                        <span>
                          {intl.get(`sprm.common.title.toNewBidding`).d('待转招投标(新)')}
                        </span>
                      }
                      key="newBidding"
                      count={executionTabCounts.newBiddingCount}
                    >
                      <NewBidding
                        newBiddingDs={newBiddingLineDs}
                        clearSelectAll={clearSelectAll}
                        onRef={(node) => {
                          newBiddingRef = node;
                        }}
                        remote={remote}
                        uomControl={uomControl}
                        location={location}
                        isOldUser={isOldUser}
                        changeTabNum={changeTabNum}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                        productPlaceConfig={productPlaceConfig}
                      />
                    </TabPane>
                  )}
                  {tabsPermission.bid && (
                    <TabPane
                      tab={<span>{intl.get(`sprm.common.title.toBidding`).d('待转招标')}</span>}
                      key="bidding"
                      count={executionTabCounts.biddingCount}
                    >
                      <Bidding
                        biddingDs={bidingLineDs}
                        clearSelectAll={clearSelectAll}
                        onRef={(node) => {
                          bidRef = node;
                        }}
                        location={location}
                        isOldUser={isOldUser}
                        remote={remote}
                        uomControl={uomControl}
                        changeTabNum={changeTabNum}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                      />
                    </TabPane>
                  )}
                  {tabsPermission.contract && (
                    <TabPane
                      tab={<span>{intl.get(`sprm.common.title.toContract`).d('待转协议')}</span>}
                      key="contract"
                      hidden={!isOldUser}
                      count={executionTabCounts.contractCount}
                    >
                      <Contract
                        contractDs={contractLineDs}
                        clearSelectAll={clearSelectAll}
                        onRef={(node) => {
                          contractRef = node;
                        }}
                        remote={remote}
                        productPlaceConfig={productPlaceConfig}
                        visibleOldContractSheet={visibleOldContractSheet}
                        location={location}
                        uomControl={uomControl}
                        changeTabNum={changeTabNum}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                      />
                    </TabPane>
                  )}
                  {tabsPermission.quoteApproval && (
                    <TabPane
                      tab={
                        <span>
                          {intl.get(`sprm.common.title.toQuoteApproval`).d('待转寻源立项')}
                        </span>
                      }
                      key="quoteApproval"
                      count={executionTabCounts.quoteApprovalCount}
                    >
                      <QuoteApproval
                        quoteApprovalDs={quoteApprovalLineDs}
                        clearSelectAll={clearSelectAll}
                        onRef={(node) => {
                          quoteApprovalRef = node;
                        }}
                        remote={remote}
                        uomControl={uomControl}
                        location={location}
                        isOldUser={isOldUser}
                        isNewRfxDetailUI={isNewRfxDetailUI}
                        changeTabNum={changeTabNum}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                      />
                    </TabPane>
                  )}
                  <TabPane
                    tab={intl.get(`sprm.common.title.toProject`).d('待转项目')}
                    key="project"
                    count={executionTabCounts.projectCount}
                    hidden={isOldUser}
                  >
                    <Project
                      projectDs={projectDs}
                      onRef={(node) => {
                        projectRef = node;
                      }}
                      remote={remote}
                      location={location}
                      customizeTable={customizeTable}
                      customizeForm={customizeForm}
                    />
                  </TabPane>
                  {tabsPermission.all && (
                    <TabPane
                      tab={<span>{intl.get(`hzero.common.status.all`).d('全部')}</span>}
                      key="allLine"
                      count={executionTabCounts.allCount}
                    >
                      <All
                        allDs={allLineDs}
                        isOldUser={isOldUser}
                        onRef={(node) => {
                          allRef = node;
                        }}
                        remote={remote}
                        uomControl={uomControl}
                        productPlaceConfig={productPlaceConfig}
                        oldAssignLovSetting={oldAssignLovSetting}
                        location={location}
                        setting={isExecutionStrategy}
                        customizeTable={customizeTable}
                        customizeForm={customizeForm}
                        isShowNewBid={isShowNewBid}
                      />
                    </TabPane>
                  )}
                  {getCuxTabDom()}
                </TabGroup>
              )}
            </Tabs>
          ),
          callback: initTab,
          code: 'SPRM.PURCHASE_EXECUTION.EXECUTION_TAB',
        })}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ purchaseplatform }) => ({
    purchaseplatform,
  })),
  cuxRemote(
    {
      code: 'SPRM_EXECUTION_FUN_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        checkAssignLines: undefined,
        updateSupZmn: undefined,
        querySubAccount: undefined,
        getTabDom: undefined,
        updateSupplierCb: undefined,
        clearExtraData: undefined,
        orderCreateCheck: undefined,
        getCuxOrderDs: undefined,
        cuxpromptModalDsUpdate: undefined,
        getCuxHeaderButtons: undefined,
        controlCuxDomTabButtons: undefined,
        initCuxPageSize: undefined,
        cuxPoColumns: undefined,
        initAssignPageSize: undefined,
        handleRenderCuxOperation: undefined,
        getCuxAllLineDs(value) {
          return value;
        },
      },
    }
  ),

  formatterCollections({
    code: [
      'entity.supplier',
      'sprm.common',
      'sprm.purchasePlatform',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.item',
      'sprm.purchaseRequisitionInquiry',
      'sprm.purchaseReqCreation',
      'sprm.purchaseRequisitionAssign',
      'sodr.sendOrder',
      'sodr.quotePurchaseRequisition',
      'ssrc.inquiryHall',
      'spcm.common',
      'sodr.orderMaintenanceEntry',
      'ssrc.common',
      'entity.attachment',
      'sodr.common',
      'ssrc.bidHall',
      'sodr.quotePurchase',
      'sodr.workspace',
      'ssrc.priceLibrary',
      'spcm.contactFrame',
    ],
  }),
  withProps(
    (params) => {
      const { getCuxOrderDs, initCuxTablePageSize } = params?.remote?.props?.process || {};
      const approvedDs = new DataSet(assignDs({ type: 'approved', initCuxTablePageSize })); // 待分配
      const assignedDs = new DataSet(assignDs({ type: 'assigned', initCuxTablePageSize })); // 已分配
      const suspendDs = new DataSet(assignDs({ type: 'suspend', initCuxTablePageSize })); // 暂挂
      const assignAllDs = new DataSet(assignDs({ type: 'all', initCuxTablePageSize })); // 分配全部页签
      const allLineDs = new DataSet({
        ...params?.remote?.process('getCuxAllLineDs', allDs({ initCuxTablePageSize })),
      }); // 全部页签
      const bidingLineDs = new DataSet(bidingDs({ initCuxTablePageSize }));
      const contractLineDs = new DataSet(contractDs({ initCuxTablePageSize }));
      const inquiryQuotationLineDs = new DataSet(inquiryQuotationDs({ initCuxTablePageSize }));
      const newBiddingLineDs = new DataSet(newBiddingDs({ initCuxTablePageSize }));
      const orderLineDs = isFunction(getCuxOrderDs) // pur-27593 佳通二开埋点
        ? new DataSet(getCuxOrderDs(orderDs({ initCuxTablePageSize })))
        : new DataSet(orderDs({ initCuxTablePageSize }));
      const quoteApprovalLineDs = new DataSet(quoteApprovalDs({ initCuxTablePageSize }));
      const projectDs = new DataSet(projectLineDs({ initCuxTablePageSize }));
      return {
        approvedDs,
        assignedDs,
        suspendDs,
        assignAllDs,
        allLineDs,
        bidingLineDs,
        contractLineDs,
        inquiryQuotationLineDs,
        newBiddingLineDs,
        orderLineDs,
        quoteApprovalLineDs,
        projectDs,
      };
    },
    { cacheState: false }
  ),
  withCustomize({
    unitCode: [
      'SPRM.PURCHASE_EXECUTION.EXECUTION_TAB',
      'SPRM.PURCHASE_EXECUTION.BTNS',
      'SPRM.PURCHASE_EXECUTION.NOTASSIGN.LIST',
      'SPRM.PURCHASE_EXECUTION.NOTASSIGN.MODAL',
      'SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL',
      'SPRM.PURCHASE_EXECUTION_ALL.PURCHASE_LIST',
      'SPRM.PURCHASE_EXECUTION_ALL.BIDLIST',
      'SPRM.PURCHASE_EXECUTION_ALL.NEWBIDLIST',
      'SPRM.PURCHASE_EXECUTION_ALL.CONTRACT_LIST',
      'SPRM.PURCHASE_EXECUTION_ALL.RFX_LIST',
      'SPRM.PURCHASE_EXECUTION_ALL.ORDER_LIST',
      'SPRM.PURCHASE_EXECUTION_ALL.PROJECT_LIST',
      'SPRM.PURCHASE_EXECUTION.BACK_FORM',
      'SPRM.PURCHASE_EXECUTION_ALL.SIEC_FILTER',
      'SPRM.PURCHASE_EXECUTION_ALL.SIEC_PROJECT',
      'SPRM.PURCHASE_EXECUTION.NOTASSIGN.SUSPENDFORM',
      'SPRM.PURCHASE_EXECUTION_ALL.ORDER_CACHE_LIST',
      'SPRM.PURCHASE_PLAFORM_QUERY.OUTSOURCINGBOM',
    ],
  })
)(Index);
