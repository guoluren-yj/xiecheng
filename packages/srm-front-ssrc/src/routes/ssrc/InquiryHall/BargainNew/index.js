/**
 * model - 议价
 * @date: 2019-12-31
 * @author: ZXM <ximin.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
// import { Button } from 'hzero-ui';
// import { connect } from 'dva';
import { isEmpty, noop, isNil, omit } from 'lodash';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { Bind, Throttle } from 'lodash-decorators';
import querystring from 'querystring';
import ExcelExports from '@/routes/components/ExcelExport';
import { Modal as c7nModal, DataSet, Tooltip, Spin } from 'choerodon-ui/pro';
import { Badge, Row, Col, Tabs, Tag } from 'choerodon-ui';
import { getActiveTabKey } from 'utils/menuTab';
import classnames from 'classnames';
import { observable, action } from 'mobx';

import DynamicButtons from '_components/DynamicButtons';
import { Header } from 'components/Page';
import { TopSection } from '_components/Section';
import {
  getCurrentOrganizationId,
  // getEditTableData,
  getCurrentUserId,
  getResponse,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload';
import { FORM_COL_3_LAYOUT } from 'utils/constants';
import CommonImport from '@/routes/himp/CommonImportNew';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImportNew from 'hzero-front/lib/components/Import';
import Iconfont from '@/routes/ssrc/components/Icons'; // 下载至本地的icon
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import { FIlESIZE } from '@/utils/SsrcRegx';
import { numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY, BID } from '@/utils/globalVariable';
import SectionPanel from '@/routes/components/SectionPanel';
import BatchEmptySelectedModal from '@/routes/components/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import ScoreDetailModal from '@/routes/share/RoundQuotationAllTable/ScoreDetailModal';
import {
  barginSectionBatchEnd,
  barginSectionBatchStart,
  offlineSectionBatchFinish,
  fetchBargainOnlineAllTableCount,
} from '@/services/bargainService';
import { fetchInquiryHallUserMemory as fetchUserConfigBatch } from '@/services/inquiryHallNewService';
import { queryEnableDoubleUnit, queryH0OrC7N } from '@/services/commonService';
import { idValidations } from '@/routes/components/Widget/dataVerification';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import { isText, amountCalcType } from '@/utils/utils';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';

import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import CountDown from '../../components/CountDown';
// import Iconfont from '../../components/Icons'; // 下载至本地的icon
import OperationRecord from '../../components/OperationRecord';

import { headerDataSet } from './headerDataSet';
import { supplierListDataSet, supplierTableDataSet } from './supplierDataSet';
import { itemListDataSet, itemTableDataSet } from './itemDataSet';
import { allTableDS } from './AllDS';
import { startBargainModalDataSet, counterOffersBulkDataSet } from './bargainModalDataSet';
import { ladderQuotationTableDS } from './LadderLevelC7n/tableDS';

import styles from './index.less';
import HeaderForm from './HeaderForm';
import All from './All';
import Item from './Item';
import Supplier from './Supplier';
import BatchInputPrice from './Modals/BatchInputPrice';
import LadderLevel from './LadderLevelC7n/index';
import StartBargainForm from './Modals/StartBargainForm';

import { hocBargainCommon } from './Entry/hocBargainCommon';

const { TabPane } = Tabs;

const initBargainFlag = Symbol('init'); // bargainFlag 初始值，在未查到线下或线下返回值时,唯一值

class Bargain extends Component {
  constructor(props) {
    super(props);

    this.allQuotationTableCount = undefined;
    this.SectionRef = {};
    this.BatchEmptySectionRef = {};

    this.organizationIdCurrent = getCurrentOrganizationId();

    const dsCommon = {
      sourceKey: props.sourceKey || INQUIRY,
      organizationId: this.organizationIdCurrent,
    };

    const { remote } = props || {};

    const currentHeaderDS = headerDataSet(dsCommon);
    this.headerDS = new DataSet(
      remote
        ? remote.process('SSRC_BARGAIN_NEW_PROCESS_HEADERDS', currentHeaderDS, dsCommon)
        : currentHeaderDS
    );

    this.allTableDS = allTableDS({
      sourceKey: props.sourceKey || INQUIRY,
      updateAllSelectionCount: this.updateAllSelectionCount,
    });
    this.AllTableDS = new DataSet(this.allTableDS);
    this.supplierListDS = new DataSet(supplierListDataSet(dsCommon));

    this.itemListDS = new DataSet(itemListDataSet(dsCommon));

    this.supplierMap = observable.map({});
    this.itemMap = observable.map({});
    this.startBargainModalDS = new DataSet(startBargainModalDataSet());

    this.state = {
      bargainHeader: {},
      activeKey: 'allDetails', // 当前激活的面板
      // uploadVisible: false, // 附件上传模态框
      collapseSupplierActiveKeys: [], // 控制供应商列表的展开
      collapseItemActiveKeys: [], // 控制物品列表的展开
      // priceComparisonModalVisible: false, // 比价助手模态框
      operationRecordModalVisible: false, // 操作记录模态框
      loadingFlag: {}, // loading判断
      // supplierSelectKeys: [], // 供应商列表勾选id,
      // supplierSelectRows: [], // 供应商列表勾选数据
      // itemSelectKeys: [], // 物品明细列表勾选id,
      // itemSelectRows: [], // 物品明细列表勾选数据
      // fillCounteroffersVisible: false, // 批量填写还价模态框
      fillCounteroffersTableData: [], // 批量填写还价 表格数据存储
      // fillCounteroffersOfflineVisible: false, // 批量填写价格模态框
      // fillCounteroffersFlag: false, // 判断批量填写还价按钮显隐
      // fillCounterModalData: {}, // 批量填写还价弹框-数据
      currentLineId: null,
      // deadlineEventVisible: false, // 截止时间模态框打开
      // pageSize: [],
      // currentPage: {},
      // pageAll: [], // 存储分页变化
      // viewLadderLevelVisible: false, // 阶梯报价模态框
      // LadderLevelHeaderData: {}, // 阶梯报价头部数据
      // itemId: undefined, // 比价记录点击历史行标记
      bargainAttachmentUuid: null, // 上传附件
      // requestFlag: false,
      // itemRecord: {}, // 当前操作的物品行
      // quotationDetailVisible: false, // 报价明细显示标识
      // itemLineRecord: {}, // 物品行记录
      bargainFlag: initBargainFlag, // 是否是线上议价
      // allCachSelectObj: {}, // 全部页签缓存勾选的行
      // itemCachSelectObj: {}, // 物料页签勾线的行
      // supplierCachSelectObj: {}, // 供应商页签勾线的行
      isBatchMaintainSection: false, // 是否选批量操作标段
      batchEmptySelectSectionFlag: false, // 批量操作分标段是否需要弹窗
      userConfig: {}, // 用户配置
      userConfigs: {}, // 用户配置所有配置
      operateSectionPromptFlag: false, // 批量操作分标段提示-modal
      operateSectionData: null, // // 批量操作分标段提示数据
      batchOperateType: null, // 分标段-批量操作-类型
      switchNotification: intl
        .get('ssrc.common.view.message.pageInvalidToSureInputSection')
        .d('分标段时有必填项未填或者未勾选行数据，无法保存当前页面信息，是否确认切换页面'), // 切换标段提示文字
      operationLoading: false, // page opertaion loading
      scoreDetailModalVisible: false, // 评分明细Modal
      doubleUnitFlag: false, // 判断是否开启双单位
      newQuotationFlag: false, // 开启新报价
      headerGroupButtonMaxNum: -1, // 头按钮默认max_num数目
      caclRule: null, // 业务规则定义-金额计算方式

      // allPageReadOnlyConfig: { // todo 如果需要将该编辑页面改造成支持可编辑
      //   value: 1,
      // },
    };
  }

  activeTabKey = getActiveTabKey();

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = this.sourceKey === BID;

  componentDidMount() {
    this.fetchPages();
    this.initCalcType();

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      this.fetchUserConfig();
    }
  }

  // 是否处理过个性化配置tabs
  dealCustActiveTabKeyFlag = 0;

  /**
   * 处理个性化Tabs时, 需要同步activeKey, 因为个性化只是覆盖默认的defaultActiveKey, 并不会改变activeKey
   * 代码来自核价页面
   */
  dealCustActiveTabKey(bargainFlag = true) {
    const code = bargainFlag
      ? `SSRC.${this.sourceKey}_HALL_BARGAIN.TABS_ONLINE`
      : `SSRC.${this.sourceKey}_HALL_BARGAIN.TABS_OFFLINE`;

    if (this.dealCustActiveTabKeyFlag) {
      return;
    }

    const field = this.props.getHocInstance?.().custConfig[code]?.fields || [];
    const { fieldCode } = field.find((item) => item.defaultActive === 1) || {};
    if (fieldCode) {
      this.setState({
        activeKey: fieldCode,
      });
    } else {
      const sortField =
        // eslint-disable-next-line array-callback-return
        field.sort((a, b) => {
          if (a?.seq < b?.seq) {
            return -1;
          }
          return null;
        }) || [];
      this.setState({
        activeKey: sortField.find((item) => item.visible)?.fieldCode || this.state?.activeKey,
      });
    }

    this.dealCustActiveTabKeyFlag = 1;
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.AllTableDS.setState('doubleUnitFlag', !!Number(res));
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  // 寻源功能控制黑白名单
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj =
        res.find(
          (item) => item.function === 'BUTTON_GROUP_FIVE_BUTTONS' && item.whiteFlag === '1'
        ) || {}; // 议价
      this.setState({
        headerGroupButtonMaxNum: !isEmpty(bargainObj) ? 5 : -1,
      });
    }
  };

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const { rfxId: prevId = null } = prevParams || {};
    const { rfxId = null } = params || {};
    const RefreshFlag = rfxId && prevId !== rfxId;

    return RefreshFlag;
  }

  componentDidUpdate(_, prevState = {}, snapshot = false) {
    if (snapshot) {
      this.fetchPages();

      this.previewRecordState(prevState);
    }
  }

  // 页面切换记录状态
  previewRecordState = (prevState = {}) => {
    const { isBatchMaintainSection = false } = prevState;
    if (isBatchMaintainSection) {
      this.setState({ isBatchMaintainSection: true });
    }
  };

  fetchPages() {
    this.fetchH0OrC7N();
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      return;
    }

    this.fetchBargainHeader();
  }

  querySupplier = (params = {}) => {
    this.fetchBargainHeader(params);
  };

  // 查询用户配置
  async fetchUserConfig() {
    const { organizationId } = this.props;
    let data = {};

    try {
      data = await fetchUserConfigBatch({
        organizationId,
        userId: getCurrentUserId(),
        configKeys: [
          'sectionBarginPriceStart',
          'sectionBarginPriceEnd',
          'sectionBarginPriceOfflineFinish',
        ],
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        userConfigs: data,
      });
    } catch (e) {
      throw e;
    }

    return data;
  }

  componentWillUnmount() {
    this.ummountPageClearCacheData();
  }

  ummountPageClearCacheData = () => {
    const { dispatch, modelName = 'bargain' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        bargainHeader: {},
        bargainFullDetPagination: {},
        bargainSupplierLine: [],
        bargainSupplierLinePagination: {},
        supplierLine: [],
        supplierLinePagination: {},
        bargainItemLine: [],
        bargainItemLinePagination: {},
        itemLine: [],
        itemLinePagination: {},
      },
    });
  };

  @Bind()
  fetchBargainHeader(queryParams = {}) {
    const {
      match: { params, path = null } = {},
      dispatch,
      modelName = 'bargain',
      organizationId,
    } = this.props;
    const { rfxId: rfxHeaderId } = params || {};

    idValidations([rfxHeaderId]);

    dispatch({
      type: `${modelName}/fetchBargainHeader`,
      payload: {
        organizationId,
        rfxHeaderId,
        path,
        ...queryParams,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_BARGAIN.HEADER`,
        bargainNew: true,
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      const { bargainStatus } = res || {};
      // 判断是线上还是线下议价
      const bargainFlag =
        res && (bargainStatus === 'BARGAIN_ONLINE' || bargainStatus === 'BARGAINING_ONLINE');

      this.dealCustActiveTabKey(bargainFlag);

      this.setState({
        bargainFlag,
        bargainHeader: res || {},
      });
      this.headerDS.loadData([res]);

      if (!bargainFlag) {
        this.AllTableDS.selection = false;
      }

      this.AllTableDS.setQueryParameter('queryParams', {
        rfxHeaderId: queryParams?.rfxHeaderId || rfxHeaderId,
        customizeUnitCode: bargainFlag
          ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY`
          : `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY_OFFLINE`,
      });
      this.AllTableDS.setState('isUnTaxPriceFlag', res && res.priceTypeCode === 'NET_PRICE');
      this.AllTableDS.setState('bargainFlag', bargainFlag);
      this.AllTableDS.setState('headerData', res || {});

      if (bargainFlag) {
        this.fetchAllQuotateTableCount();
      }
      // this.fetchBargainLovs();
      this.AllTableDS.query(this.AllTableDS.currentPage);
      this.fetchSupplierLineList(queryParams); // 获取供应商头信息
      this.fetchItemLineList(queryParams); // 获取物品明细头信息

      this.initStartBargainDSData(res);
    });
  }

  // fetch Lov
  // fetchBargainLovs = () => {
  //   const { dispatch } = this.props;

  //   const lovCodes = {
  //     bargainType: 'SSRC.BARGAIN_TYPE', // 还价方式
  //     bargainTypeOffline: 'SSRC.BARGAIN_OFFLINE_TYPE', // 线下还价方式
  //   };
  //   dispatch({
  //     type: 'inquiryHall/batchCode',
  //     payload: { lovCodes },
  //   });
  // };

  fetchAllQuotateTableCount = async () => {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const data = {
      rfxHeaderId: params.rfxId,
      organizationId,
    };
    let result = null;
    try {
      result = await fetchBargainOnlineAllTableCount(data);
      result = getResponse(result);
      if (!result) {
        this.allQuotationTableCount = undefined;
        this.AllTableDS.allPageSelectedCount = undefined;
        return;
      }

      const { bargainAllQuotationCount } = result || {};

      if (bargainAllQuotationCount) {
        this.allQuotationTableCount = bargainAllQuotationCount;
        this.AllTableDS.allPageSelectedCount = bargainAllQuotationCount;
      }
    } catch (e) {
      throw e;
    }
  };

  /**
   * 跨页全选数据更改
   * count 需要变更的条目数
   * type 修改类型 add sub
   */
  updateAllSelectionCount = ({ count = 1, type = 'sub' }) => {
    const { allPageSelectedCount } = this.AllTableDS;
    const allTableSelectAllManually = this.AllTableDS.getState('selectAllManually'); // 跨页全选
    if (!count || !allPageSelectedCount || !allTableSelectAllManually) {
      return;
    }

    let currentCount = allPageSelectedCount || 0;
    if (type === 'sub') {
      currentCount -= count;
    }
    if (type === 'add') {
      currentCount += count;
    }

    this.AllTableDS.allPageSelectedCount = currentCount;
  };

  @Bind()
  initData() {
    this.fetchBargainHeader(); // 查询头
    // this.fetchSupplierLineList(); // 获取供应商头信息
    // this.fetchItemLineList(); // 获取物品明细头信息
    // this.AllTableDS.query(); // 获取全部报价明细
  }

  /**
   * 供应商列表行头部 - 查询
   */
  @Bind()
  async fetchSupplierLineList(queryParams = {}) {
    const {
      match: { params },
      organizationId,
    } = this.props;

    const { rfxId: rfxHeaderId } = params || {};

    this.supplierListDS.setQueryParameter('commonProps', {
      rfxHeaderId,
      organizationId,
      ...(queryParams || {}),
    });

    await this.supplierListDS.query(this.supplierListDS.currentPage);
  }

  /**
   * 物品明细行头部 - 查询
   */

  @Bind()
  async fetchItemLineList(queryParams = {}) {
    const {
      match: { params },
      organizationId,
    } = this.props;

    const { rfxId: rfxHeaderId } = params || {};

    this.itemListDS.setQueryParameter('commonProps', {
      rfxHeaderId,
      organizationId,
      ...(queryParams || {}),
    });

    await this.itemListDS.query(this.itemListDS.currentPage);
  }

  // 当前tab，是否有表格勾选了数据
  getSupplierOrItemTableSelectedFlag = ({ type = 'supplier' }) => {
    let map = this.supplierMap;
    let selectedFlag = 0;

    if (type === 'item') {
      map = this.itemMap;
    }

    map.forEach((m) => {
      const { currentTableDS } = m || {};
      if (currentTableDS?.selected?.length > 0) {
        selectedFlag = 1;
      }
    });

    return selectedFlag;
  };

  /**
   * 判断对应表格是否有勾选数据
   * @returns boolean
   */
  judgeCurrentTableHasSelectedLine = () => {
    const { activeKey } = this.state;

    let openFlag = false;
    if (activeKey === 'allDetails') {
      const { totalCount, unSelected, selected } = this.AllTableDS || {};
      openFlag = this.getSelectedAllPageFlag()
        ? totalCount !== unSelected?.length
        : selected?.length > 0;
    } else if (activeKey === 'supplierList') {
      const selectedFlag = this.getSupplierOrItemTableSelectedFlag({
        type: 'supplier',
      });
      openFlag = selectedFlag;
    } else {
      const selectedFlag = this.getSupplierOrItemTableSelectedFlag({
        type: 'item',
      });
      openFlag = selectedFlag;
    }

    return openFlag;
  };

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const { organizationId, match } = this.props;
    const { rfxId } = match.params || {};
    let newQuotationFlag = false;

    const param = {
      organizationId,
      rfxHeaderId: rfxId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        newQuotationFlag = true;
      }

      this.setState({ newQuotationFlag });
    } catch (e) {
      throw e;
    }

    return newQuotationFlag;
  }

  // 金额计算方式
  initCalcType = async () => {
    const { organizationId } = this.props;

    const param = {
      organizationId,
      supplierFlag: 0,
    };

    const result = (await amountCalcType(param)) || [];
    this.setState({
      caclRule: result?.[0],
    });
  };

  @Bind()
  getCurrentCustomeCode() {
    const { activeKey, bargainFlag } = this.state;
    const currentSourceCode = this.sourceKey;

    if (activeKey === 'allDetails') {
      return bargainFlag
        ? `SSRC.${currentSourceCode}_HALL_BARGAIN.ALLQUOTATION,SSRC.${currentSourceCode}_HALL_BARGAIN.FILTER_BAR_QUERY`
        : `SSRC.${currentSourceCode}_HALL_BARGAIN.ALLQUOTATION_OFFLINE,SSRC.${currentSourceCode}_HALL_BARGAIN.FILTER_BAR_QUERY_OFFLINE`;
    } else if (activeKey === 'supplierList') {
      return bargainFlag
        ? `SSRC.${currentSourceCode}_HALL_BARGAIN.SUPPLIER`
        : `SSRC.${currentSourceCode}_HALL_BARGAIN.SUPPLIER_OFFLINE`;
    } else {
      return bargainFlag
        ? `SSRC.${currentSourceCode}_HALL_BARGAIN.ITEMDETAILS`
        : `SSRC.${currentSourceCode}_HALL_BARGAIN.ITEMDETAILS_OFFLINE`;
    }
  }

  /**
   * 发起议价ds初始值
   * bargainEndDate 取头接口值
   */
  initStartBargainDSData = () => {
    // const { bargainEndDate = null } = header || {};
    // const bargainInitData = {
    //   bargainEndDate,
    // };
    // this.startBargainModalDS.loadData([]);
  };

  /**
   * clear item active Tab and all table map
   */
  clearItemTabAllCache = () => {
    this.setState({
      collapseItemActiveKeys: [],
    });

    this.itemMap.clear();
  };

  /**
   * clear supplier active Tab and all table map
   */
  clearSupplierTabAllCache = () => {
    this.setState({
      collapseSupplierActiveKeys: [],
    });

    this.supplierMap.clear();
  };

  /**
   * clear item and supplier active Tab and all table map
   */
  clearItemAndSupplierCollapsePanel = () => {
    this.clearItemTabAllCache();
    this.clearSupplierTabAllCache();
  };

  /**
   * 清空 供应商，物料明细所有打开的折叠卡片的缓存,表格数据缓存
   */
  clearSupplierItemTabCollapseOpened = () => {
    this.setState({
      loadingFlag: {},
    });

    this.clearItemAndSupplierCollapsePanel();
  };

  /**
   * 全部tab - 获取筛选器参数
   */
  getAllQuotationTableSearchParameter = () => {
    const parameterObj = this.searchComponent?.getQueryParameter() || {};
    return parameterObj;
  };

  /**
   * 保存 - 线下
   */
  @Bind()
  @Throttle(1000)
  async bargainOnSaveOffline(options) {
    const { type = 'save', lineId = '', flagALL, page = {} } = options || {};
    const SectionFlag = this.isBidSectionData(); // 分标段保存逻辑
    if (SectionFlag) {
      this.handleSavePage({
        lineId,
        flagALL,
        page,
      });
      return;
    }

    if (type === 'save') {
      this.handleSavePage();
    }

    if (type === 'tableChangePagination') {
      this.afterOperateInitCurrent({ lineId });
    }

    return true;
  }

  // 触发页面操作loading
  toggleOperationLoading = (loading = false) => {
    this.setState({ operationLoading: loading });
  };

  @Bind()
  getSelectedAllPageFlag() {
    // 如果有手动操作的，就传手动操作标志，否则为null
    let selectAllPageFlag = null;
    selectAllPageFlag =
      this.AllTableDS.getState('selectAllManually') ||
      this.AllTableDS.getState('selectAllManually') === 0
        ? this.AllTableDS.getState('selectAllManually')
        : null;
    return selectAllPageFlag;
  }

  /**
   * GET TABLE DS FROM DS MAP
   */
  getDSFromDSMap = (map) => {
    const currentMap = map || {};
    const list = [];

    if (!currentMap?.size) {
      return list;
    }

    currentMap.forEach((m) => {
      const { currentTableDS } = m || {};
      if (!currentTableDS?.length) {
        return;
      }

      list.push(currentTableDS);
    });

    return list;
  };

  // get supplier tab all table ds
  getSupplierMapAllDSValue = () => {
    const list = this.getDSFromDSMap(this.supplierMap);
    return list;
  };

  // get item tab all table ds
  getItemMapAllDSValue = () => {
    const list = this.getDSFromDSMap(this.itemMap);
    return list;
  };

  // validate supplier
  integrationAndValidateSupplierOrItemTabData = async (options = {}) => {
    const {
      tabCategoryName = 'supplierList',
      tableValidateFlag = 1,
      onlyValidateSelectLineFlag = 0,
    } = options || {};
    const dsList =
      tabCategoryName === 'supplierList'
        ? this.getSupplierMapAllDSValue()
        : this.getItemMapAllDSValue();
    let allDsValidate = true;
    const allData = [];

    if (!dsList?.length) {
      return { allDsValidate, allData };
    }

    if (tableValidateFlag) {
      dsList.forEach((ds) => {
        if (!ds?.length) {
          return;
        }

        ds.forEach((record) => {
          if (!record) {
            return;
          }

          record.set('status', 'update');
        });
      });

      allDsValidate = await Promise.all(
        dsList.map((ds) => {
          return ds.validate();
        })
      );

      // 只校验勾选的数据
      if (onlyValidateSelectLineFlag) {
        const allDsSelectValidate = [];
        dsList.forEach(async (ds) => {
          if (!ds?.selected?.length) {
            return;
          }

          ds.selected.forEach((record) => {
            if (!record) {
              return;
            }

            allDsSelectValidate.push(record.validate(true));
          });
        });

        allDsValidate = await Promise.all(allDsSelectValidate);
      }
    }

    if (Array.isArray(allDsValidate)) {
      allDsValidate = allDsValidate.every((v) => v !== false);
    }

    const sectionFlag = this.isBidSectionData();

    dsList.forEach((ds) => {
      if (!ds?.length) {
        return;
      }

      const currentTableData = ds.toData() || [];

      currentTableData.forEach((lineData) => {
        if (!lineData) {
          return;
        }

        const { bargainSelectedFlag } = lineData || {};
        const isChecked = bargainSelectedFlag ? 1 : 0;

        const data = {
          ...lineData,
          bargainSectionSelectedFlag: sectionFlag ? isChecked : 0,
          bargainSelectedFlag: isChecked,
        };

        allData.push(data);
      });

      if (ds.selected?.length > 0) {
        ds.selected.forEach((select) => {
          const recordData = select.toData() || {};

          const selectedData = {
            ...recordData,
            bargainSectionSelectedFlag: sectionFlag ? 1 : 0,
            bargainSelectedFlag: 1,
          };

          allData.push(selectedData);
        });
      }
    });

    return {
      allDsValidate,
      allData,
    };
  };

  /**
   * 获取全页面数据
   * 有几个反人类的接口，所有导致一些参数在query,body中都要加一份
   * */
  integrationAllPageData = async (options = {}) => {
    const {
      organizationId,
      match: { params },
    } = this.props;
    // const { bargainFlag } = this.state;
    const { rfxId: rfxHeaderId } = params || {};

    const data = await this.integrationAllTabTablePageData(options);
    if (!data || !rfxHeaderId) {
      return;
    }

    const customizeUnitCode = this.getCurrentCustomeCode();
    const filterParams = {};
    // const filterParams = bargainFlag ? this.getAllQuotationTableSearchParameter() : {};

    const pageData = {
      organizationId,
      rfxHeaderId,
      rfxQuotationLines: data || [],
      customizeUnitCode,
      filterParams,
      ...filterParams,
      bargainNew: true,
      queryParams: {
        rfxHeaderId,
        customizeUnitCode,
        ...filterParams,
      },
    };

    return pageData;
  };

  // current tab 整合数据
  integrationAllTabTablePageData = async (currentParam = {}) => {
    const { remote } = this.props;
    const { needStop = false, tableValidateFlag = 1, onlyValidateSelectLineFlag = 0 } =
      currentParam || {};
    const { activeKey, bargainFlag } = this.state;
    const sectionFlag = this.isBidSectionData();
    let bargainOnlineSelectNeed = needStop && bargainFlag;

    // 校验页面是否需要勾选数据
    bargainOnlineSelectNeed = remote
      ? remote.process('SSRC_BARGAIN_NEW_PROCESS_VALIDATE_SELECTED_RULE', bargainOnlineSelectNeed, {
          bargainFlag,
        })
      : bargainOnlineSelectNeed;

    let validateFlag = true;

    let currentData = [];
    const selectList = [];
    const unSelectList = [];
    const selectAllPageFlag = this.getSelectedAllPageFlag();

    if (activeKey === 'allDetails') {
      validateFlag = await this.AllTableDS.validate();

      // 只校验勾选的数据
      if (onlyValidateSelectLineFlag) {
        validateFlag = await Promise.all(
          this.AllTableDS?.selected?.map((record) => {
            if (!record) {
              return true;
            }
            return record.validate();
          })
        );
      }
      if (Array.isArray(validateFlag)) {
        validateFlag = validateFlag.every((v) => v !== false);
      }

      const allTableData = this.AllTableDS.toData();

      currentData = allTableData.map((lineData) => {
        if (!lineData) {
          return;
        }

        return {
          ...lineData,
          selectAllPageFlag,
          bargainSectionSelectedFlag: sectionFlag ? 1 : 0, // 多标段下用的勾选
          sectionSelectAllPageFlag: sectionFlag ? 1 : 0, // 判断是否多标段
        };
      });

      // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1 // todo 遍历
      // currentData = this.AllTableDS.map((record) => {
      //   if (record.isSelected) {
      //     return {
      //       ...record.toData(),
      //       bargainSectionSelectedFlag: sectionFlag ? 1 : 0, // 多标段下用的勾选
      //       bargainSelectedFlag: 1,
      //       selectAllPageFlag,
      //       sectionSelectAllPageFlag: sectionFlag ? 1 : 0, // 判断是否多标段
      //     };
      //   } else {
      //     return {
      //       ...record.toData(),
      //       bargainSectionSelectedFlag: 0,
      //       bargainSelectedFlag: 0,
      //       selectAllPageFlag,
      //       sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
      //     };
      //   }
      // });

      // 所有勾选行
      this.AllTableDS.selected.forEach((item) => {
        selectList.push({
          ...item.toData(),
          bargainSectionSelectedFlag: sectionFlag ? 1 : 0,
          bargainSelectedFlag: 1,
          selectAllPageFlag,
          sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
        });
      });
      this.AllTableDS.unSelected.forEach((item) => {
        unSelectList.push({
          ...item.toData(),
          bargainSectionSelectedFlag: 0,
          bargainSelectedFlag: 0,
          selectAllPageFlag,
          sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
        });
      });
    } else if (activeKey === 'supplierList') {
      const { allDsValidate, allData } =
        (await this.integrationAndValidateSupplierOrItemTabData({
          tabCategoryName: 'supplierList',
          tableValidateFlag,
          onlyValidateSelectLineFlag,
        })) || {};

      currentData = allData;
      validateFlag = allDsValidate;
    } else {
      const { allDsValidate, allData } =
        (await this.integrationAndValidateSupplierOrItemTabData({
          tabCategoryName: 'itemDetails',
          tableValidateFlag,
          onlyValidateSelectLineFlag,
        })) || {};

      currentData = allData;
      validateFlag = allDsValidate;
    }

    if (!validateFlag && bargainOnlineSelectNeed) {
      notification.warning({
        message: intl.get(`ssrc.common.validate.dataLackedPleaseCheck`).d('数据填写不完整，请检查'),
      });

      this.setState({
        switchNotification: intl
          .get('ssrc.common.view.message.pleaseToSelectLineSave')
          .d('请必须勾行数据，否则无法保存当前页面信息，是否确认切换页面'),
      });
      return validateFlag;
    }

    if (bargainOnlineSelectNeed) {
      validateFlag = this.judgeCurrentTableHasSelectedLine();
    }

    if (!validateFlag) {
      return validateFlag;
    }

    // 数据合并
    let integrationData = [...selectList, ...currentData];
    // 跨页全选状态下，传当前页的数据和缓存的数据和手动未勾选的数据给后端，告诉其有几行未勾选，后端不设置勾选值1
    if (selectAllPageFlag && activeKey === 'allDetails') {
      integrationData = [...unSelectList, ...currentData];
    }

    // 去重
    const keysObj = {};
    const dataProcess = [];
    integrationData.forEach((item) => {
      if (keysObj[item.quotationLineId]) {
        return;
      }
      dataProcess.push(item);
      keysObj[item.quotationLineId] = item;
    });

    return dataProcess;
  };

  /**
   * 线上/下 议价保存
   */
  handleSavePage = async (options = {}) => {
    const { modelName = 'bargain' } = this.props;
    const { dispatch } = this.props;
    const { otherData = {} } = options || {};
    const { bargainFlag } = this.state;

    const data = await this.integrationAllPageData({ tableValidateFlag: 0 });

    if (!data) {
      return false;
    }

    this.toggleOperationLoading(true);
    const saveMethod = bargainFlag ? 'handleSaveAllOnline' : 'handleSaveAllOffline';
    dispatch({
      type: `${modelName}/${saveMethod}`,
      payload: {
        ...data,
        ...(otherData || {}),
      },
    }).then((res) => {
      this.toggleOperationLoading(false);
      if (!res) {
        return false;
      }

      // 新/老议价公用model, 导致线上要做提示
      if (bargainFlag) {
        notification.success();
      }
      this.afterHandlePageSave();
    });

    return true;
  };

  // 保存-分标段-线上-议价
  // onlineSaveOfSection = async (options = {}) => {
  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     dispatch,
  //     organizationId,
  //     match: { params },
  //   } = this.props;
  //   const {
  //     needStop = false,
  //     lineId,
  //     flagALL,
  //     page,
  //   } = options || {};
  //   const customizeUnitCode = this.getCurrentCustomeCode();
  //   const data = await this.integrationAllTabTablePageData();
  //   const filterParams = this.getAllQuotationTableSearchParameter();

  //   if (isEmpty(data)) {
  //     return false;
  //   }

  //   this.toggleOperationLoading(true);
  //   dispatch({
  //     type: `${modelName}/handleSaveAllOnline`,
  //     payload: {
  //       organizationId,
  //       rfxHeaderId: params.rfxId,
  //       rfxQuotationLines: data,
  //       customizeUnitCode,
  //       filterParams,
  //     },
  //   }).then((res) => {
  //     this.toggleOperationLoading(false);
  //     if (!res) {
  //       return false;
  //     }

  //     this.AllTableDS.unSelectAll();
  //     this.AllTableDS.clearCachedSelected();

  //     if (isEmpty(page)) {
  //       this.refreshSectionLists();
  //     } else {
  //       this.afterOperateInitCurrent();
  //     }
  //   });

  //   return true;
  // };

  // 点击保存按钮-线上
  // onlineSaveOfSectionButton = async (options = {}) => {
  //   const {
  //     // needStop = false,
  //     // lineId,
  //     // flagALL,
  //     page,
  //     way = '',
  //     // otherPayload = {},
  //   } = options || {};
  //   const data = await this.integrationAllTabTablePageData();

  //   if (isEmpty(data)) {
  //     return false;
  //   }

  //   const afterOperate = () => {
  //     if (way !== 'changePage') {
  //       this.clearSupplierItemTabCollapseOpened();
  //     }

  //     this.AllTableDS.unSelectAll();
  //     this.AllTableDS.clearCachedSelected();

  //     if (isEmpty(page)) {
  //       this.refreshSectionLists();
  //     } else {
  //       this.afterOperateInitCurrent();
  //     }
  //   };

  //   if (way !== 'changePage') {
  //     this.handleSavePage();
  //   } else {
  //     afterOperate();
  //   }

  //   return true;
  // };

  // 保存-分标段-线下-议价
  // offlineSaveOfSection = async (options) => {
  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     dispatch,
  //     organizationId,
  //     [modelName]: { bargainHeader },
  //   } = this.props;
  //   const { needStop = false, lineId, flagALL, page } = options || {};
  //   const { rfxHeaderId } = bargainHeader || {};
  //   const customizeUnitCode = this.getCurrentCustomeCode();
  //   const allData = await this.integrationAllTabTablePageData({ needStop: false });
  //   const data = allData;
  //   if (!data) {
  //     return false;
  //   }

  //   const filterParams = this.searchComponent?.getQueryParameter() || {};
  //   this.toggleOperationLoading(true);
  //   dispatch({
  //     type: `${modelName}/handleSaveAllOffline`,
  //     payload: {
  //       organizationId,
  //       rfxHeaderId,
  //       rfxQuotationLines: data,
  //       customizeUnitCode,
  //       filterParams,
  //     },
  //   }).then((res) => {
  //     this.toggleOperationLoading(false);
  //     if (!res) {
  //       return false;
  //     }

  //     this.AllTableDS.unSelectAll();
  //     this.AllTableDS.clearCachedSelected();
  //     if (isEmpty(page)) {
  //       this.refreshSectionLists();
  //     } else {
  //       this.afterOperateInitCurrent();
  //     }
  //   });

  //   return true;
  // };

  /**
   * 保存后刷新-需要兼顾多标段
   */
  afterHandlePageSave = () => {
    // const sectionFlag = this.isBidSectionData();

    this.clearAllTabsAndTabCache();
    this.fetchBargainHeader();
  };

  clearAllTabsAndTabCache = () => {
    this.AllTableDS.unSelectAll();
    this.AllTableDS.clearCachedSelected();
    this.clearSupplierItemTabCollapseOpened();
  };

  // 重新查询所有tab下数据，清空缓存信息
  afterOperateFetchAllTabs = async () => {
    await this.clearAllTabsAndTabCache();
    this.AllTableDS.query(this.AllTableDS.currentPage);
    this.fetchSupplierLineList();
    this.fetchItemLineList();
  };

  /**
   * 操作后-重查当前页面数据
   * options {
   *    lineId, 如果在供应商或物料tab, 如果传对应的数据主键，可以更新对应表格数据
   * }
   * */
  afterOperateInitCurrent = async (options = {}) => {
    const { lineId = null, clearSupplierOrItemCache = true } = options || {};
    const { activeKey } = this.state;

    if (activeKey === 'allDetails') {
      this.clearItemAndSupplierCollapsePanel();
    } else if (activeKey === 'supplierList') {
      this.fetchCurrentSupplierOrItemTableByLineId({
        id: lineId,
      });

      if (!clearSupplierOrItemCache) {
        this.clearItemTabAllCache();
      }
    } else {
      this.fetchCurrentSupplierOrItemTableByLineId({
        id: lineId,
      });
      this.clearSupplierTabAllCache();
    }

    await this.AllTableDS.unSelectAll();
    await this.AllTableDS.clearCachedSelected();

    await this.AllTableDS.query(this.AllTableDS.currentPage);
    this.clearSupplierItemTabCollapseOpened();
  };

  // 不分标段全部报价明细数据整合
  getAllData = (selectAllPageFlag) => {
    const { selected, unSelected } = this.AllTableDS;
    if (!selectAllPageFlag) {
      const selectList = selected.map((ele) => {
        return {
          ...ele.toData(),
          bargainSelectedFlag: 1,
          selectAllPageFlag,
        };
      });
      const quotationLineIds = selectList.map((ele) => ele.quotationLineId);
      const allList = this.AllTableDS.toData().map((ele) => {
        // 把当前页勾选的剔除掉，因为selectList已经有一份
        if (!quotationLineIds.includes(ele.quotationLineId)) {
          return {
            ...ele,
            bargainSelectedFlag: 0,
            selectAllPageFlag,
          };
        }
        return null;
      });
      return [...allList, ...selectList].filter(Boolean);
    } else {
      const unSelectList = unSelected.map((ele) => {
        return {
          ...ele.toData(),
          bargainSelectedFlag: 0,
          selectAllPageFlag,
        };
      });
      const quotationLineIds = unSelectList.map((ele) => ele.quotationLineId);
      const allList = this.AllTableDS.toData().map((ele) => {
        // 把当前页未勾选的剔除掉，因为unSelectList已经有一份
        if (!quotationLineIds.includes(ele.quotationLineId)) {
          return {
            ...ele,
            bargainSelectedFlag: 1,
            selectAllPageFlag,
          };
        }
        return null;
      });
      return [...unSelectList, ...allList].filter(Boolean);
    }
  };

  /**
   * 操作后清空重查
   */
  @Bind()
  handleAfterOperate() {
    this.afterOperateFetchAllTabs();
  }

  /**
   * 保存 - 线上
   */
  @Bind()
  @Throttle(1000)
  async bargainOnSaveOnline(options = {}) {
    const { type, lineId = '' } = options || {};
    const SectionFlag = this.isBidSectionData(); // 分标段保存逻辑

    if (SectionFlag) {
      this.handleSavePage(options);
      return;
    }

    if (type === 'save') {
      this.handleSavePage();
    } else if (type === 'tableChangePagination') {
      this.afterOperateInitCurrent({ lineId });
    } else {
      // 因为之前写的getEditTable只能拿到当前页面的数据，无法跨页，这里应该把发起和保存分开写
      this.handleOkOnlineStartBargainPrice();
    }
  }

  // @Bind()
  // async startBargin() {
  //   const {
  //     organizationId,
  //     dispatch,
  //     modelName = 'bargain',
  //     form: { validateFieldsAndScroll },
  //     match: { params },
  //   } = this.props;

  //   const dataProcess = await this.integrationAllTabTablePageData();

  //   validateFieldsAndScroll({ force: true }, (err, values) => {
  //     if (!err) {
  //       const filterParams = this.getAllQuotationTableSearchParameter();
  //       // return;
  //       const { bargainEndDate } = values;
  //       const endTime = bargainEndDate && bargainEndDate.format(DEFAULT_DATETIME_FORMAT);
  //       const customizeUnitCode = this.getCurrentCustomeCode();
  //       this.toggleOperationLoading(true);
  //       dispatch({
  //         type: `${modelName}/handleStartAll`,
  //         payload: {
  //           organizationId,
  //           bargainEndDate: endTime,
  //           rfxHeaderId: params.rfxId,
  //           rfxQuotationLines: dataProcess,
  //           filterParams,
  //           customizeUnitCode,
  //         },
  //       }).then((res) => {
  //         this.toggleOperationLoading(false);
  //         this.onlineEndDateModalCancel();
  //         if (res) {
  //           notification.success();
  //           this.clearSupplierItemTabCollapseOpened();

  //           this.AllTableDS.unSelectAll();
  //           this.AllTableDS.clearCachedSelected();
  //           this.initData();
  //         }
  //       });
  //     }
  //   });
  // }

  // 发起议价-设置截至时间
  // onlineStartBargainPriceOk = () => {
  //   const {
  //     form: { validateFieldsAndScroll },
  //     dispatch,
  //     modelName = 'bargain',
  //     organizationId,
  //     match: { params },
  //   } = this.props;
  //   let endTime = null;
  //   let validateFlag = true;

  //   validateFieldsAndScroll({ force: true }, (err, values) => {
  //     if (err) {
  //       validateFlag = false;
  //       return;
  //     }

  //     const { bargainEndDate } = values;
  //     endTime = bargainEndDate && bargainEndDate.format(DEFAULT_DATETIME_FORMAT);
  //   });

  //   if (!validateFlag) {
  //     return;
  //   }

  //   const lines = this.integrationAllTabTablePageData({ needStop: true });
  //   if (isEmpty(lines)) {
  //     return;
  //   }

  //   const filterParams = this.searchComponent?.getQueryParameter() || {};
  //   const customizeUnitCode = this.getCurrentCustomeCode();

  //   dispatch({
  //     type: `${modelName}/handleStartAll`,
  //     payload: {
  //       organizationId,
  //       bargainEndDate: endTime,
  //       rfxHeaderId: params.rfxId,
  //       rfxQuotationLines: lines,
  //       filterParams,
  //       customizeUnitCode,
  //     },
  //   }).then((res) => {
  //     this.onlineEndDateModalCancel();
  //     if (res) {
  //       notification.success();
  //       // 清空缓存
  //       this.setState({
  //         allCachSelectObj: {},
  //         supplierCachSelectObj: {},
  //         itemCachSelectObj: {},
  //       });

  //       this.fetchBargainHeader();
  //     }
  //   });
  // };

  // 判定需要使用的用户配置
  judgeCurrentUserConfig = (key = null) => {
    const { userConfigs = {} } = this.state;
    if (!key || isEmpty(userConfigs)) {
      return {};
    }

    let visible = false;
    let config = {};
    const { [key]: data = {} } = userConfigs;

    if (isEmpty(data)) {
      config = {
        configKey: key,
        configDesc: key,
        userId: getCurrentUserId(),
        enabledFlag: 1,
      };
    } else {
      const { configValue = null } = data || {};
      config = {
        configKey: key,
        configDesc: key,
        ...data,
      };
      visible = !configValue || configValue === 'display';
    }

    return {
      visible,
      config,
    };
  };

  /**
   * 结束议价-线上
   */
  @Bind()
  bargainOnEnd() {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty = {} } = this.SectionRef;

    const { visible = false, config = {} } = this.judgeCurrentUserConfig('sectionBarginPriceEnd');

    if (!isBatchMaintainSection) {
      this.handleBarginOnEnd(); // normal online end bargain price
      return;
    }

    // 区分标段, 批量勾选
    const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
    if (!checkedFlag) {
      this.handleIntegrationSectionBatchEnd();
    } else if (visible) {
      this.setState({
        batchEmptySelectSectionFlag: true,
        userConfig: config,
        batchOperateType: 'barginPirceEnd',
      });
    } else {
      this.handleBarginOnEnd();
    }
  }

  // 结束议价-分标段-批量-结束
  handleIntegrationSectionBatchEnd = () => {
    const { bargainHeader = {} } = this.state;

    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null, rfxHeaderId } = bargainHeader || {};
    if (!projectLineSectionId) {
      return;
    }

    const currentData = {};
    const projectLineSectionList = getCheckedSectionList();

    if (!projectLineSectionList) {
      return;
    }

    const data = {
      rfxHeaderId,
      ...currentData,
      projectLineSectionList,
    };

    this.handleBarginPriceBatch(data);
  };

  // 分标段-批量结束议价
  handleBarginPriceBatch = (data = []) => {
    if (isEmpty(data)) {
      return;
    }

    const { organizationId } = this.props;

    this.toggleOperationLoading(true);
    barginSectionBatchEnd({
      organizationId,
      ...data,
    }).then((res) => {
      const result = getResponse(res);
      this.toggleOperationLoading();
      if (!isEmpty(result)) {
        this.setState({
          // deadlineEventVisible: false,
          operateSectionData: result,
          operateSectionPromptFlag: true,
        });
        return;
      }

      notification.success();
      this.handleBatchSectionSubmitSucceed();
    });
  };

  // 线上批量议价成功页面跳转逻辑
  handleBatchSectionSubmitSucceed = () => {
    const jumpOnlineSucceed = (props = {}) => {
      const { sourceStatus, history, sourceHeaderId, params, bargainingStage, search } =
        props || {};
      if (sourceStatus === 'RFX_EVALUATION_PENDING') {
        history.push({
          pathname: `${this.activeTabKey}/rfx-evaluation/${sourceHeaderId}`,
          search,
        });
      } else if (sourceStatus === 'checkPrice') {
        history.push({
          pathname: `${this.activeTabKey}/check-price/${params.rfxId}`,
          search,
        });
      } else if (sourceStatus === 'BARGAINING') {
        history.push({
          pathname:
            bargainingStage === 'CHECK'
              ? `${this.activeTabKey}/check-price/${params.rfxId}`
              : `${this.activeTabKey}/rfx-evaluation-proc-manage/${sourceHeaderId}`,
          search,
        });
      } else if (sourceStatus === 'newInquiryHallToBargain') {
        history.push({
          pathname: `${this.activeTabKey}/list`,
        });
      } else {
        history.push({
          pathname: `${this.activeTabKey}/rfx-evaluation-proc-manage/${sourceHeaderId}`,
          search,
        });
      }
    };

    const {
      match: { params },
      history,
      location,
      remote,
    } = this.props;
    const data = querystring.parse(location.search.substr(1));
    const { bargainHeader = {} } = this.state;

    const {
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      evaluateLeaderFlag,
      bargainingStage,
      sourceProjectId = null,
    } = data;
    const sourceHeaderId = params.rfxId;

    const { sourceProjectId: headerSourceProjectId = null } = bargainHeader || {};
    const formatSourceProjectId =
      !sourceProjectId || sourceProjectId === 'null' ? headerSourceProjectId : sourceProjectId;

    const search = querystring.stringify({
      ...data,
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      sourceHeaderId,
      evaluateLeaderFlag,
      bargainingStage,
      sourceProjectId: formatSourceProjectId,
    });

    const eventProps = {
      search,
      sourceHeaderId,
      params,
      sourceStatus,
      bargainingStage,
      history,
      location,
      routerParams: querystring.parse(location.search.substr(1)),
      activeTabKey: this.activeTabKey,
      jumpOnlineSucceed,
    };
    if (remote?.event) {
      remote.event.fireEvent('handleJumpOnlineSucceed', eventProps);
    } else {
      jumpOnlineSucceed(eventProps);
    }
  };

  // 结束议价
  handleBarginOnEnd = () => {
    const {
      dispatch,
      modelName = 'bargain',
      match: { params },
      organizationId,
    } = this.props;

    this.toggleOperationLoading(true);
    dispatch({
      type: `${modelName}/bargainOnEnd`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    }).then((res) => {
      this.toggleOperationLoading(false);
      if (res) {
        notification.success();
        this.handleBatchSectionSubmitSucceed();
      }
    });
  };

  /**
   * 完成议价-线下
   */
  @Bind()
  bargainOnFinished() {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty } = this.SectionRef || {};

    if (!isBatchMaintainSection) {
      this.handleOfflineFinishBarginPrice(); // normal offline finish bargain price
      return;
    }

    // 区分标段, 批量勾选
    const { visible = false, config = {} } = this.judgeCurrentUserConfig(
      'sectionBarginPriceOfflineFinish'
    );

    const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
    if (!checkedFlag) {
      this.handleSectionBatchOfflineBarginPriceFinish();
    } else if (visible) {
      this.setState({
        batchEmptySelectSectionFlag: true,
        userConfig: config,
        batchOperateType: 'barginPirceFinish',
      });
    } else {
      this.handleOfflineFinishBarginPrice();
    }
  }

  // 线下-完成议价-批量
  handleSectionBatchOfflineBarginPriceFinish = async () => {
    const { bargainHeader = {} } = this.state;

    const { getCheckedSectionList = () => {} } = this.SectionRef || {};
    const { projectLineSectionId = null, rfxHeaderId } = bargainHeader || {};
    if (!projectLineSectionId) {
      return;
    }

    let rfxQuotationLines = [];
    const projectLineSectionList = getCheckedSectionList();

    if (!projectLineSectionList) {
      return;
    }

    const currentIndex = projectLineSectionList.findIndex(
      (item) => item.projectLineSectionId === projectLineSectionId
    );
    if (currentIndex > -1) {
      rfxQuotationLines = await this.integrationAllTabTablePageData({ needStop: true });
      if (isEmpty(rfxQuotationLines)) {
        return;
      }
    }

    const data = {
      rfxHeaderId,
      rfxQuotationLines,
      projectLineSectionList,
    };

    this.offlineFinishedSectionBatch(data);
  };

  // 线下-批量-完成
  offlineFinishedSectionBatch = (data = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const customizeUnitCode = this.getCurrentCustomeCode();

    const { organizationId } = this.props;
    this.toggleOperationLoading(true);
    offlineSectionBatchFinish({
      organizationId,
      customizeUnitCode,
      ...data,
    }).then((res) => {
      const result = getResponse(res);
      this.toggleOperationLoading();
      this.onlineEndDateModalCancel();

      if (!isEmpty(result)) {
        this.setState({
          operateSectionData: result,
          operateSectionPromptFlag: true,
        });
        return;
      }
      if (res?.failed) {
        return;
      }

      notification.success();
      this.handleSuccessOfflineFinishedBarginPrice();
    });
  };

  // 线下完成议价
  handleOfflineFinishBarginPrice = async () => {
    const { modelName = 'bargain', remote } = this.props;
    const { dispatch } = this.props;

    const data = await this.integrationAllPageData({ needStop: true });
    if (!data) {
      return false;
    }

    this.toggleOperationLoading(true);
    dispatch({
      type: `${modelName}/bargainOnFinished`,
      payload: data,
    }).then((res) => {
      this.toggleOperationLoading(false);
      const successCallBack = () => {
        notification.success();
        this.handleSuccessOfflineFinishedBarginPrice();
      };
      if (res) {
        if (remote?.event) {
          remote.event.fireEvent('completeBargainOperation', {
            successCallBack,
            toggleOperationLoading: this.toggleOperationLoading,
            result: res,
            dispatch,
            modelName,
            data,
          });
        } else {
          successCallBack();
        }
      }
    });
  };

  // 线下完成议价页面跳转
  handleSuccessOfflineFinishedBarginPrice = () => {
    const jumpOfflineSucceed = (props = {}) => {
      const { sourceStatus, history, rfxId, search } = props || {};
      if (sourceStatus === 'RFX_EVALUATION_PENDING') {
        history.push({
          pathname: `${this.activeTabKey}/rfx-evaluation/${rfxId}`,
          search,
        });
      } else if (sourceStatus === 'checkPrice') {
        const pathname = `${this.activeTabKey}/check-price/${rfxId}`;
        history.push({
          pathname,
          search,
        });
      } else if (sourceStatus === 'newInquiryHallToBargain') {
        history.push({
          pathname: `${this.activeTabKey}/list`,
        });
      } else {
        history.push({
          pathname: `${this.activeTabKey}/rfx-evaluation-proc-manage/${rfxId}`,
          search,
        });
      }
    };

    const {
      match: { params },
      history,
      location,
      remote,
    } = this.props;
    const { rfxId } = params;
    const {
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      evaluateLeaderFlag,
      projectLineSectionId = null,
    } = querystring.parse(location.search.substr(1)) || {};
    const search = querystring.stringify({
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      sourceHeaderId: rfxId,
      evaluateLeaderFlag,
      projectLineSectionId,
    });

    const eventProps = {
      search,
      rfxId,
      sourceStatus,
      history,
      location,
      routerParams: querystring.parse(location.search.substr(1)),
      activeTabKey: this.activeTabKey,
      jumpOfflineSucceed,
    };
    if (remote?.event) {
      remote.event.fireEvent('handleJumpOfflineSucceed', eventProps);
    } else {
      jumpOfflineSucceed(eventProps);
    }
  };

  /**
   * 打开操作记录模态框
   */
  @Bind()
  playView() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  /**
   * 面板切换记录
   */
  @Bind()
  changeActiveKey(activeKey) {
    if (!activeKey) {
      return;
    }

    this.setState({ activeKey });
  }

  /**
   * 供应商列表 - 改变分页
   */
  // @Bind()
  // changeItemLinePagination(current = undefined, pageSize = undefined) {
  //   const changedPagination = {};
  //   changedPagination.current = current;
  //   changedPagination.pageSize = pageSize;
  //   this.fetchSupplierLineList(changedPagination);
  // }

  /**
   * 物品明细泪飙 - 分页
   */
  // @Bind()
  // changeItemDetailsPagination(current = undefined, pageSize = undefined) {
  //   const changedPagination = {};
  //   changedPagination.current = current;
  //   changedPagination.pageSize = pageSize;
  //   this.fetchItemLineList(changedPagination);
  // }

  /**
   * 根据flagAll来分别处理供应商列表和物品明细列表数据
   */
  // @Bind()
  // fetchBargainSupplierOrItem(lineId, flagALL, judge = true, page = {}, otherPayload = {}) {
  //   const { rfxLineSupplierId, queryParams } = otherPayload || {};
  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     match: { params },
  //     dispatch,
  //     organizationId,
  //     [modelName]: { supplierLine = [], itemLine = [] },
  //   } = this.props;
  //   const { bargainFlag } = this.state;
  //   const sectionFlag = this.isBidSectionData();

  //   if (judge) {
  //     dispatch({
  //       type: `${modelName}/fetchBargainFullDetails`,
  //       payload: {
  //         page,
  //         organizationId,
  //         rfxHeaderId: params.rfxId,
  //         rfxLineSupplierId: flagALL === 1 ? rfxLineSupplierId : null,
  //         supplierCompanyId: flagALL === 1 ? lineId : null,
  //         rfxLineItemId: flagALL === 2 ? lineId : null,
  //         flag: flagALL,
  //         customizeUnitCode: this.getCurrentCustomeCode(),
  //         ...(queryParams || {}),
  //       },
  //     }).then((res) => {
  //       if (res) {
  //         const keys = [];
  //         const rows = [];
  //         if (res.content) {
  //           res.content.forEach((item) => {
  //             if (
  //               item.bargainSelectedFlag === 1 ||
  //               (item.bargainSectionSelectedFlag && sectionFlag)
  //             ) {
  //               keys.push(item.quotationLineId);
  //               rows.push(item);
  //             }
  //           });
  //         }
  //         if (flagALL === 1) {
  //           if (!isEmpty(supplierLine)) {
  //             supplierLine.forEach((item) => {
  //               if (
  //                 item.bargainSelectedFlag === 1 ||
  //                 (item.bargainSectionSelectedFlag && sectionFlag)
  //               ) {
  //                 keys.push(item.quotationLineId);
  //                 rows.push(item);
  //               }
  //             });
  //           }
  //           this.setState({
  //             loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
  //             pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
  //             supplierSelectKeys: bargainFlag
  //               ? [...new Set([...this.state?.supplierSelectKeys, ...keys])]
  //               : [], // 根据后端标志bargainSelectedFlag设置勾选值
  //             supplierSelectRows: bargainFlag
  //               ? uniqWith([...this.state?.supplierSelectRows, ...rows], isEqual)
  //               : [],
  //           });
  //         } else {
  //           if (!isEmpty(itemLine)) {
  //             itemLine.forEach((item) => {
  //               if (
  //                 item.bargainSelectedFlag === 1 ||
  //                 (item.bargainSectionSelectedFlag && sectionFlag)
  //               ) {
  //                 keys.push(item.quotationLineId);
  //                 rows.push(item);
  //               }
  //             });
  //           }
  //           this.setState({
  //             loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
  //             pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
  //             itemSelectKeys: bargainFlag
  //               ? [...new Set([...this.state?.itemSelectKeys, ...keys])]
  //               : [], // 根据后端标志bargainSelectedFlag设置勾选值
  //             itemSelectRows: bargainFlag
  //               ? uniqWith([...this.state?.itemSelectRows, ...rows], isEqual)
  //               : [],
  //           });
  //         }
  //       }
  //     });
  //   } else {
  //     if (flagALL === 1) {
  //       this.setState({ loadingFlag: { [lineId]: { supplierLineBargainLoading: true } } });
  //     } else {
  //       this.setState({ loadingFlag: { [lineId]: { itemLineBargainLoading: true } } });
  //     }
  //     dispatch({
  //       type: `${modelName}/fetchBargainDetails`,
  //       payload: {
  //         page,
  //         organizationId,
  //         rfxHeaderId: params.rfxId,
  //         supplierCompanyId: flagALL === 1 ? lineId : null,
  //         rfxLineItemId: flagALL === 2 ? lineId : null,
  //         rfxLineSupplierId: flagALL === 1 ? rfxLineSupplierId : null,
  //         flag: flagALL,
  //         dataSource: flagALL === 1 ? supplierLine : itemLine,
  //         customizeUnitCode: this.getCurrentCustomeCode(),
  //         ...(queryParams || {}),
  //       },
  //     }).then((res) => {
  //       if (res) {
  //         if (flagALL === 1) {
  //           this.setState({
  //             loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
  //             pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
  //           });
  //         } else {
  //           this.setState({
  //             loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
  //             pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
  //           });
  //         }
  //       }
  //     });
  //   }
  // }

  // supplier or item loading
  updateLoadingFlag = (param) => {
    const { id, loading = false } = param || {};
    const { loadingFlag } = this.state;
    let newLoadingFlag = {};

    if (id) {
      newLoadingFlag = Object.assign({}, loadingFlag || {}, { [id]: loading });
    }

    this.setState({
      loadingFlag: newLoadingFlag,
    });
  };

  // get current data from map
  getCurrentSupplierOrItemDataMap = (options = {}) => {
    const { id, category = 'supplier' } = options || {};

    let data = {};
    if (!id || !category) {
      return data;
    }

    let currentMap = this.supplierMap;
    if (category === 'item') {
      currentMap = this.itemMap;
    }

    data = currentMap.get(id);
    return data;
  };

  // 表格是否可勾选
  getItemOrSupplierTableSelectedSymbol = () => {
    const { bargainFlag } = this.state;

    const selectedSymbol = bargainFlag ? 'multiple' : false;
    return selectedSymbol;
  };

  // 查询供应商下特定表格
  fetchCurrentSupplier = async (data = {}) => {
    const {
      organizationId,
      match: { params },
      remote,
    } = this.props;
    const { bargainFlag, doubleUnitFlag } = this.state;
    const { id: rfxLineSupplierId, queryParams = {}, refreshFlag = 1 } = data || {};

    if (!rfxLineSupplierId) {
      return;
    }

    const currentSupplierData = this.supplierMap.get(rfxLineSupplierId);

    if (!currentSupplierData) {
      const currentTableDS = supplierTableDataSet({
        doubleUnitFlag,
        sourceKey: this.sourceKey,
        bargainFlag,
        bidFlag: this.bidFlag,
        selectedSymbol: this.getItemOrSupplierTableSelectedSymbol(),
      });

      const cuxTableProps = {
        bidFlag: this.bidFlag,
      };

      const tableDS = await new DataSet(
        remote
          ? remote.process(
              'SSRC_BARGAIN_NEW_PROCESS_SUPPLIER_TABLE_DS',
              currentTableDS,
              cuxTableProps
            )
          : currentTableDS
      );

      tableDS.setState('headerDS', this.headerDS);
      tableDS.setState('bargainFlag', bargainFlag);

      const querys = {
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxLineSupplierId,
        // supplierCompanyId: flagALL === 1 ? lineId : null,
        // flag: flagALL,
        customizeUnitCode: this.getCurrentCustomeCode(),
        ...(queryParams || {}),
      };
      tableDS.setQueryParameter('commonProps', querys);
      this.updateLoadingFlag({ id: rfxLineSupplierId, loading: true });
      await tableDS.query();
      await tableDS.setState('queryFlag', 1);

      this.supplierMap.set(rfxLineSupplierId, {
        currentTableDS: tableDS,
        queryFlag: 1,
      });
    }

    if (currentSupplierData) {
      if (refreshFlag) {
        const { currentTableDS } = currentSupplierData || {};
        this.updateLoadingFlag({ id: rfxLineSupplierId, loading: true });
        currentTableDS.reset();
        currentTableDS.query(currentTableDS.currentPage);
      }
    }

    this.updateLoadingFlag({ id: rfxLineSupplierId, loading: false });
  };

  // 查询供应商下特定表格
  fetchCurrentItem = async (data = {}) => {
    const {
      organizationId,
      match: { params },
      remote,
    } = this.props;
    const { bargainFlag, doubleUnitFlag } = this.state;
    const { id: rfxLineItemId, queryParams = {}, refreshFlag = 1 } = data || {};

    if (!rfxLineItemId) {
      return;
    }

    const currentSupplierData = this.itemMap.get(rfxLineItemId);

    if (!currentSupplierData) {
      const currentTableDS = itemTableDataSet({
        doubleUnitFlag,
        sourceKey: this.sourceKey,
        bargainFlag,
        bidFlag: this.bidFlag,
        selectedSymbol: this.getItemOrSupplierTableSelectedSymbol(),
      });

      const cuxTableProps = {
        bidFlag: this.bidFlag,
      };

      const tableDS = await new DataSet(
        remote
          ? remote.process('SSRC_BARGAIN_NEW_PROCESS_ITEM_TABLE_DS', currentTableDS, cuxTableProps)
          : currentTableDS
      );

      tableDS.setState('headerDS', this.headerDS);
      tableDS.setState('bargainFlag', bargainFlag);

      const querys = {
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxLineItemId,
        customizeUnitCode: this.getCurrentCustomeCode(),
        ...(queryParams || {}),
      };
      tableDS.setQueryParameter('commonProps', querys);
      this.updateLoadingFlag({ id: rfxLineItemId, loading: true });
      await tableDS.query();
      await tableDS.setState('queryFlag', 1);

      this.itemMap.set(rfxLineItemId, {
        currentTableDS: tableDS,
        queryFlag: 1,
      });
    }

    if (currentSupplierData) {
      if (refreshFlag) {
        const { currentTableDS } = currentSupplierData || {};
        this.updateLoadingFlag({ id: rfxLineItemId, loading: true });
        currentTableDS.reset();
        currentTableDS.query(currentTableDS.currentPage);
      }
    }

    this.updateLoadingFlag({ id: rfxLineItemId, loading: false });
  };

  /*
   * fetch supplier or item table dynamic
   * data object { id, ... }
   * */
  fetchCurrentSupplierOrItemTableByLineId = (data = {}) => {
    const { activeKey } = this.state;

    if (activeKey === 'itemDetails') {
      this.fetchCurrentItem(data);
    }

    if (activeKey === 'supplierList') {
      this.fetchCurrentSupplier(data);
    }
  };

  unselectCurrentSupplierTableSelection = ({ id }) => {
    const { currentTableDS } =
      this.getCurrentSupplierOrItemDataMap({
        id,
        category: 'supplier',
      }) || {};

    if (currentTableDS) {
      currentTableDS.unSelectAll();
      currentTableDS.clearCachedSelected();
    }
  };

  unselectCurrentItemTableSelection = ({ id }) => {
    const { currentTableDS } =
      this.getCurrentSupplierOrItemDataMap({
        id,
        category: 'item',
      }) || {};

    if (currentTableDS) {
      currentTableDS.unSelectAll();
      currentTableDS.clearCachedSelected();
    }
  };

  /**
   * 展开折叠框查询对应的供应商数据
   */
  @Bind()
  async handleCollBack(key = [], otherPayload = {}) {
    const { rfxLineSupplierId } = otherPayload || {};

    this.fetchCurrentSupplierOrItemTableByLineId({
      id: rfxLineSupplierId,
      refreshFlag: 0,
    });

    this.setState({ collapseSupplierActiveKeys: key });
  }

  /**
   * 展开折叠框查询物品明细数据
   */
  @Bind()
  handleItemCallBack(key = [], otherPayload = {}) {
    const { rfxLineItemId } = otherPayload || {};

    this.fetchCurrentSupplierOrItemTableByLineId({
      id: rfxLineItemId,
      refreshFlag: 0,
    });

    this.setState({ collapseItemActiveKeys: key });
  }

  /**
   * 分页查询数据
   */
  // @Bind()
  // fetchPaginationSupplierOrItem(lineId, flagALL, page = {}, type = '', otherPayload = {}) {
  //   const { rfxLineSupplierId } = otherPayload || {};
  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     match: { params },
  //     dispatch,
  //     organizationId,
  //     [modelName]: { supplierLine = [], itemLine = [] },
  //   } = this.props;
  //   const { bargainFlag } = this.state;
  //   const sectionFlag = this.isBidSectionData();
  //   if (flagALL === 1) {
  //     this.setState({
  //       loadingFlag: { [lineId]: { supplierLineBargainLoading: true } },
  //       currentPage: page,
  //       pageAll: { ...this.state.pageAll, [lineId]: page.current },
  //     });
  //   } else {
  //     this.setState({
  //       loadingFlag: { [lineId]: { itemLineBargainLoading: true } },
  //       currentPage: page,
  //       pageAll: { ...this.state.pageAll, [lineId]: page.current },
  //     });
  //   }
  //   dispatch({
  //     type: `${modelName}/fetchBargainDetails`,
  //     payload: {
  //       page,
  //       organizationId,
  //       rfxHeaderId: params.rfxId,
  //       supplierCompanyId: flagALL === 1 ? lineId : null,
  //       rfxLineItemId: flagALL === 2 ? lineId : null,
  //       rfxLineSupplierId: flagALL === 1 ? rfxLineSupplierId : null,
  //       flag: flagALL,
  //       dataSource: flagALL === 1 ? supplierLine : itemLine,
  //       type,
  //       customizeUnitCode: bargainFlag
  //         ? [
  //           `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS`,
  //           `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`,
  //         ].join(',')
  //         : [
  //           `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE`,
  //           `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
  //         ].join(','),
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       const keys = [];
  //       const rows = [];
  //       if (res.content) {
  //         res.content.forEach((item) => {
  //           if (
  //             item.bargainSelectedFlag === 1 ||
  //             (item.bargainSectionSelectedFlag && sectionFlag)
  //           ) {
  //             keys.push(item.quotationLineId);
  //             rows.push(item);
  //           }
  //         });
  //       }
  //       if (flagALL === 1) {
  //         const { supplierCachSelectObj = {} } = this.state;
  //         if (
  //           supplierCachSelectObj[lineId] &&
  //           supplierCachSelectObj[lineId][res.number] &&
  //           !isEmpty(supplierCachSelectObj[lineId][res.number])
  //         ) {
  //           const cacheLineKeys = supplierCachSelectObj[lineId][res.number].map(
  //             (item) => item.quotationLineId
  //           );
  //           const newSupplierLine = this.props[modelName]?.supplierLine?.map?.((item) => {
  //             if (cacheLineKeys.includes(item.quotationLineId)) {
  //               return supplierCachSelectObj[lineId][res.number].filter(
  //                 (select) => select.quotationLineId === item.quotationLineId
  //               )[0];
  //             } else {
  //               return { ...item, _status: 'update' };
  //             }
  //           });
  //           dispatch({
  //             type: `${modelName}/updateState`,
  //             payload: {
  //               supplierLine: newSupplierLine,
  //             },
  //           });
  //         }
  //         this.setState({
  //           loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
  //           pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
  //           supplierSelectKeys: this.state?.bargainFlag
  //             ? [...new Set([...this.state?.supplierSelectKeys, ...keys])]
  //             : [], // 线上议价才有勾选，根据后端标志bargainSelectedFlag设置勾选值
  //           supplierSelectRows: this.state?.bargainFlag
  //             ? uniqWith([...this.state?.supplierSelectRows, ...rows], isEqual)
  //             : [],
  //         });
  //       } else {
  //         const { itemCachSelectObj = {} } = this.state;
  //         if (
  //           itemCachSelectObj[lineId] &&
  //           itemCachSelectObj[lineId][res.number] &&
  //           !isEmpty(itemCachSelectObj[lineId][res.number])
  //         ) {
  //           const cacheLineKeys = itemCachSelectObj[lineId][res.number].map(
  //             (item) => item.quotationLineId
  //           );
  //           const newItemLine = this.props[modelName]?.itemLine?.map?.((item) => {
  //             if (cacheLineKeys.includes(item.quotationLineId)) {
  //               return itemCachSelectObj[lineId][res.number].filter(
  //                 (select) => select.quotationLineId === item.quotationLineId
  //               )[0];
  //             } else {
  //               return { ...item, _status: 'update' };
  //             }
  //           });
  //           dispatch({
  //             type: `${modelName}/updateState`,
  //             payload: {
  //               itemLine: newItemLine,
  //             },
  //           });
  //         }
  //         this.setState({
  //           loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
  //           pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
  //           itemSelectKeys: this.state?.bargainFlag
  //             ? [...new Set([...this.state?.itemSelectKeys, ...keys])]
  //             : [], // 根据后端标志bargainSelectedFlag设置勾选值
  //           itemSelectRows: this.state?.bargainFlag
  //             ? uniqWith([...this.state?.itemSelectRows, ...rows], isEqual)
  //             : [],
  //         });
  //       }
  //     }
  //   });
  // }

  /**
   * 全部报价明细分页切换保存并查询数据 - 线下
   */
  // @Bind()
  // changeFullInfoPageOffline() {
  //   this.AllTableDS.query(this.AllTableDS.currentPage);
  // }

  /**
   * 线上 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  // @Bind()
  // changeSupplierPageOnline(page, lineId, flagALL, otherPayload = {}) {
  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     [modelName]: { supplierLine = [], supplierLinePagination = {} },
  //   } = this.props;
  //   const { rfxLineSupplierId } = otherPayload || {};

  //   const currentLineSupplierId = rfxLineSupplierId || lineId;

  //   const { supplierSelectKeys = [], supplierCachSelectObj = {} } = this.state;
  //   const currentSelectLine = supplierLine.filter((item) =>
  //     supplierSelectKeys.includes(item.quotationLineId)
  //   );

  //   const cacheLine = getEditTableData(currentSelectLine, ['_status']);
  //   if (isEmpty(supplierLinePagination)) {
  //     return;
  //   }

  //   const currentLocation = supplierLinePagination[currentLineSupplierId]
  //     ? supplierLinePagination[currentLineSupplierId].current - 1
  //     : 0;

  //   this.setState({
  //     supplierCachSelectObj: {
  //       ...supplierCachSelectObj,
  //       [currentLineSupplierId]: {
  //         ...supplierCachSelectObj[currentLineSupplierId],
  //         [currentLocation]: cacheLine,
  //       },
  //     },
  //   });

  //   // 判断供应商列表数据是否已经查询过
  //   this.bargainOnSaveOnline({
  //     type: 'tableChangePagination',
  //     lineId,
  //     flagALL,
  //     page,
  //     way: 'changePage',
  //     otherPayload,
  //   });
  // }

  /**
   * 线上 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  // @Bind()
  // changeItemLinePageOnline(page, lineId, flagALL) {
  //   if (!lineId) {
  //     return;
  //   }

  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     [modelName]: { itemLine = [], itemLinePagination = {} },
  //   } = this.props;
  //   const { itemSelectKeys = [], itemCachSelectObj = {} } = this.state;
  //   const currentSelectLine = itemLine.filter((item) =>
  //     itemSelectKeys.includes(item.quotationLineId)
  //   );

  //   const cacheLine = getEditTableData(currentSelectLine, ['_status']);
  //   const currentLocation = itemLinePagination[lineId] ? itemLinePagination[lineId].current - 1 : 0;

  //   this.setState({
  //     itemCachSelectObj: {
  //       ...itemCachSelectObj,
  //       [lineId]: {
  //         ...itemCachSelectObj[lineId],
  //         [currentLocation]: cacheLine,
  //       },
  //     },
  //   });
  //   // 判断供应商列表数据是否已经查询过
  //   this.bargainOnSaveOnline({
  //     type: 'tableChangePagination',
  //     lineId,
  //     flagALL,
  //     page,
  //     way: 'changePage',
  //   });
  // }

  /**
   * 线下 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  // @Bind()
  // changeSupplierOrItemLinePageOffline(page, lineId, flagALL, otherPayload = {}) {
  //   // 判断供应商列表数据是否已经查询过
  //   this.bargainOnSaveOffline({
  //     type: 'tableChangePagination',
  //     lineId,
  //     flagALL,
  //     page,
  //     otherPayload,
  //   });
  // }

  /**
   * 批量填写还价
   */
  @Bind()
  @Throttle(500)
  async handleSaveCounterOffersBulk() {
    const { modelName = 'bargain' } = this.props;
    const {
      organizationId,
      match: { params },
      dispatch,
    } = this.props;
    const { bargainFlag, activeKey, currentLineId, fillCounteroffersTableData = [] } = this.state;
    let dataProcess = [];
    // let filterParams = {};
    const supplierListParams = {};

    const { current } = this.counterOffersBulkDS || {};
    const validateFlag = await this.counterOffersBulkDS.validate();

    if (!current || !validateFlag) {
      return false;
    }

    let modalData = current.toData();
    modalData = omit(modalData, 'quotationCurrencyCode', '__dirty');
    if (isEmpty(modalData)) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
          .d('提交前请填写完整相关信息'),
      });
      return false;
    }

    const customizeUnitCode = this.getCurrentCustomeCode();
    let currentSupplierCompanyId = null;

    if (activeKey === 'allDetails') {
      const selectAllPageFlag = this.getSelectedAllPageFlag();
      dataProcess = this.getAllData(selectAllPageFlag);
      // filterParams = this.getAllQuotationTableSearchParameter();
    } else if (activeKey === 'supplierList') {
      dataProcess = fillCounteroffersTableData.filter(
        (item) => item.rfxLineSupplierId === currentLineId
      );

      // 新老议价公用接口，不好去掉参数
      if (!isEmpty(dataProcess)) {
        currentSupplierCompanyId = dataProcess[0].supplierCompanyId;
      }
    } else {
      dataProcess = fillCounteroffersTableData.filter(
        (item) => item.rfxLineItemId === currentLineId
      );
    }

    this.toggleOperationLoading(true);
    const dispatchType = `${modelName}/${
      bargainFlag ? 'saveCounterOffersBulk' : 'saveCounterOffersOffline'
    }`;
    dispatch({
      type: dispatchType,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        ...(modalData || {}),
        rfxLineSupplierId: activeKey === 'supplierList' ? currentLineId : null,
        rfxLineItemId: activeKey === 'itemDetails' ? currentLineId : null,
        supplierCompanyId: currentSupplierCompanyId,
        rfxQuotationLines: dataProcess,
        // filterParams,
        customizeUnitCode,
        bargainFlag,
        ...supplierListParams,
      },
    }).then((res) => {
      this.toggleOperationLoading(false);

      if (res) {
        notification.success();

        this.clearCurrentTableCacheAndRefreshIt({
          currentLineId,
        });
      }
    });
  }

  // 清空具体表格缓存，并且更新表格
  @action
  clearCurrentTableCacheAndRefreshIt = async (data = {}) => {
    const { activeKey } = this.state;
    const { currentLineId } = data || {};

    if (activeKey === 'allDetails') {
      this.AllTableDS.unSelectAll();
      this.AllTableDS.clearCachedSelected();
    } else if (activeKey === 'supplierList') {
      await this.unselectCurrentSupplierTableSelection({ id: currentLineId });
      this.clearItemTabAllCache();
    } else {
      await this.unselectCurrentItemTableSelection({ id: currentLineId });
      this.clearSupplierTabAllCache();
    }

    await this.fetchCurrentSupplierOrItemTableByLineId({
      id: currentLineId,
    });

    this.AllTableDS.query(this.AllTableDS.currentPage);
  };

  /**
   * 批量填写价格 - 线下
   */
  // @Bind()
  // handleSaveCounterOfflineBulk(values) {
  //   const { bargainType, bargainPrice, bargainRemark } = values;
  //   const { modelName = 'bargain' } = this.props;
  //   const {
  //     [modelName]: { supplierLine = [], itemLine = [], bargainSupplierLine = [] },
  //     organizationId,
  //     match: { params },
  //     dispatch,
  //   } = this.props;
  //   const { activeKey, currentLineId } = this.state;
  //   const supplierNew = getEditTableToData(supplierLine, ['_status']);
  //   const itemLineNew = getEditTableToData(itemLine, ['_status']);
  //   let dataProcess = [];
  //   const supplierListParams = {};

  //   if (activeKey === 'allDetails') {
  //     // 处理全部报价明细表格数据
  //     dataProcess = this.AllTableDS.toData();
  //   } else if (activeKey === 'supplierList') {
  //     // 处理供应商列表表格数据
  //     const filterData = [];
  //     bargainSupplierLine.forEach((line) => {
  //       const { supplierCompanyId, rfxLineSupplierId } = line || {};

  //       if (supplierCompanyId === currentLineId || rfxLineSupplierId === currentLineId) {
  //         if (supplierCompanyId) {
  //           supplierListParams.supplierCompanyId = supplierCompanyId;
  //           supplierListParams.rfxLineSupplierId = null;
  //         }
  //         if (!supplierCompanyId && rfxLineSupplierId) {
  //           supplierListParams.supplierCompanyId = null;
  //           supplierListParams.rfxLineSupplierId = rfxLineSupplierId;
  //         }
  //       }
  //     });

  //     if (!isEmpty(supplierNew)) {
  //       supplierNew.forEach((line) => {
  //         const { supplierCompanyId, rfxLineSupplierId } = line || {};

  //         if (supplierCompanyId === currentLineId || rfxLineSupplierId === currentLineId) {
  //           filterData.push(line);

  //           if (supplierCompanyId) {
  //             supplierListParams.supplierCompanyId = supplierCompanyId;
  //           }
  //           if (!supplierCompanyId && rfxLineSupplierId) {
  //             supplierListParams.supplierCompanyId = null;
  //             supplierListParams.rfxLineSupplierId = rfxLineSupplierId;
  //           }
  //         }
  //       });
  //     }

  //     dataProcess = filterData;
  //   } else {
  //     // 处理物品明细表格数据
  //     const filterData = itemLineNew.filter((item) => item.rfxLineItemId === currentLineId);
  //     dataProcess = filterData;
  //   }

  //   dispatch({
  //     type: `${modelName}/saveCounterOffersOffline`,
  //     payload: {
  //       organizationId,
  //       rfxHeaderId: params.rfxId,
  //       bargainType,
  //       bargainPrice,
  //       bargainRemark,
  //       supplierCompanyId: activeKey === 'supplierList' ? currentLineId : null,
  //       rfxLineItemId: activeKey === 'itemDetails' ? currentLineId : null,
  //       rfxQuotationLines: dataProcess,
  //       ...supplierListParams,
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       notification.success();
  //       this.setState({ fillCounteroffersOfflineVisible: false, fillCounterModalData: {} });
  //       if (activeKey === 'allDetails') {
  //         this.AllTableDS.unSelectAll();
  //         this.AllTableDS.query();
  //       } else if (activeKey === 'supplierList') {
  //         // 先把当前的 table下每一行record.$form reset  ps: 可以清空data, 但影响性能体验, 不建议
  //         const filterData = supplierLine.filter(
  //           (item) =>
  //             item.supplierCompanyId === currentLineId || item.rfxLineSupplierId === currentLineId
  //         );
  //         if (!isEmpty(filterData)) {
  //           filterData.forEach((r) => r?.$form?.resetFields?.());
  //         }
  //         this.supplierLineSelect();
  //         this.fetchBargainSupplierOrItem(
  //           currentLineId,
  //           1,
  //           false,
  //           {},
  //           { queryParams: supplierListParams }
  //         );
  //       } else {
  //         // 先把当前的 table下每一行record.$form reset  ps: 可以清空data, 但影响性能体验, 不建议
  //         const filterData = itemLine.filter((item) => item.rfxLineItemId === currentLineId);
  //         if (!isEmpty(filterData)) {
  //           filterData.forEach((r) => r?.$form?.resetFields?.());
  //         }
  //         this.itemLineSelect();
  //         this.fetchBargainSupplierOrItem(currentLineId, 2, false);
  //       }
  //     }
  //   });
  // }

  /**
   * 供应商列表勾选数据
   */
  // @Bind()
  // supplierLineSelect(keys = [], rows = []) {
  //   this.setState({
  //     supplierSelectKeys: keys,
  //     supplierSelectRows: rows,
  //   });
  // }

  /**
   * 物品明细勾选数据
   */
  // @Bind()
  // itemLineSelect(keys = [], rows = []) {
  //   this.setState({
  //     itemSelectKeys: keys,
  //     itemSelectRows: rows,
  //   });
  // }

  /**
   * 打开比价助手模态框
   */

  // @Bind()
  // priceComparisonAssistant() {
  //   this.setState({ priceComparisonModalVisible: true });
  // }

  /**
   * hidePriceComparison - 关闭比价助手弹窗
   */
  // @Bind()
  // hidePriceComparison() {
  //   this.setState({
  //     priceComparisonModalVisible: false,
  //   });
  // }

  /**
   * 打开阶梯报价模态框
   */
  ladderInquiryrender = ({ value, record }) => {
    const { bargainFlag } = this.state;

    if (Number(value)) {
      return (
        <>
          <a onClick={() => this.viewLadderLevelModal(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
          </a>
          {bargainFlag && record.get('ladderInquiryRequire') === 1 && (
            <Badge style={{ marginLeft: '2px' }} status="error" />
          )}
        </>
      );
    } else {
      return '-';
    }
  };

  @Bind()
  viewLadderLevelModal(record = {}) {
    const { doubleUnitFlag, bargainFlag } = this.state;

    const { priceTypeCode } = this.headerDS?.current?.get(['priceTypeCode']);

    const {
      quotationLineStatus,
      supplierStatus,
      eliminateRoundNumber,
      supplierCompanyId,
      quotationLineId,
    } = record.get([
      'quotationLineStatus',
      'supplierStatus',
      'eliminateRoundNumber',
      'supplierCompanyId',
      'quotationLineId',
    ]);

    const disabledFlag =
      quotationLineStatus === 'BARGAINED' ||
      quotationLineStatus === 'ABANDONED' ||
      supplierStatus === 'QUOTATION_INVALID' ||
      supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
      eliminateRoundNumber ||
      (bargainFlag && !supplierCompanyId);

    this.ladderQuotationTableDs = new DataSet(
      ladderQuotationTableDS({
        lineRecord: record,
        isUnTaxPriceFlag: priceTypeCode === 'NET_PRICE',
        disabledFlag,
      })
    );

    this.ladderQuotationTableDs.setQueryParameter('commonProps', {
      quotationLineId,
      organizationId: this.organizationId,
    });

    const ladderLevelProps = {
      record,
      ladderQuotationTableDs: this.ladderQuotationTableDs,
      isOfflineFlag: !bargainFlag,
      doubleUnitFlag,
      disabledFlag,
    };

    c7nModal.open({
      key: c7nModal.key(),
      title: intl.get('ssrc.priceLibraryNew.view.message.ladderQuotation').d('阶梯报价'),
      style: {
        width: 1100,
      },
      drawer: true,
      closable: true,
      children: <LadderLevel {...ladderLevelProps} />,
      okText: !disabledFlag
        ? intl.get('hzero.common.button.save').d('保存')
        : intl.get('hzero.common.button.confirm').d('确认'),
      onOk: !disabledFlag ? () => this.saveBarginLadderLine() : () => {},
      onClose: () => this.ladderLevelModalClose(),
    });
  }

  // ladder level modal close
  ladderLevelModalClose = () => {
    this.ladderQuotationTableDs.reset();
    this.ladderQuotationTableDs.clear();
    this.afterHandlePageSave();
  };

  /**
   * 关闭阶梯报价弹窗
   */
  // @Bind()
  // hideLadderLevelModal() {
  //   this.setState({ viewLadderLevelVisible: false, LadderLevelHeaderData: {} });
  //   this.props.dispatch({
  //     type: 'inquiryHall/updateState',
  //     payload: {
  //       barginLadderLevelData: [],
  //     },
  //   });
  //   this.afterOperateFetchAllTabs();
  // }

  /**
   * - 保存阶梯还价数据
   */
  @Bind()
  async saveBarginLadderLine() {
    const { dispatch, organizationId } = this.props;
    const { bargainFlag = false } = this.state;

    const validateFlag = this.ladderQuotationTableDs.validate();
    if (!validateFlag) {
      return false;
    }

    const newParams = this.ladderQuotationTableDs.toData();
    if (isEmpty(newParams)) {
      return;
    }

    dispatch({
      type: bargainFlag
        ? `inquiryHall/saveBarginLadderLevel`
        : `inquiryHall/saveBarginLadderLevelOffline`,
      payload: { newParams, organizationId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.ladderQuotationTableDs.query();
      }
    });

    return false;
  }

  // 更新标段数据
  refreshSectionLists = async () => {
    const projectLineSectionId = this.getRouterSearch('projectLineSectionId');
    if (!projectLineSectionId || projectLineSectionId === 'null') {
      return;
    }

    await this.clearAllTabsAndTabCache();

    const { refreshSectionAndMain = () => {} } = this.SectionRef || {};
    refreshSectionAndMain();
  };

  // 线上-批量勾选-判断当前页是否勾选-勾选校验
  handleOnlineSectionSelected = async () => {
    const { bargainHeader = {} } = this.state;

    const { getCheckedSectionList = () => {} } = this.SectionRef || {};
    const { projectLineSectionId = null, rfxHeaderId = null } = bargainHeader || {};
    if (!projectLineSectionId) {
      return;
    }

    let rfxQuotationLines = [];
    const projectLineSectionList = getCheckedSectionList();

    if (isEmpty(projectLineSectionList)) {
      return;
    }

    const currentIndex = projectLineSectionList.findIndex(
      (item) => item.projectLineSectionId === projectLineSectionId
    );
    if (currentIndex > -1) {
      rfxQuotationLines = await this.integrationAllTabTablePageData({ needStop: true });
      if (isEmpty(rfxQuotationLines)) {
        notification.warning({
          message: intl.get(`ssrc.inquiryHall.model.bargain.selectRowWarning`).d('未勾选行数据'),
        });
        return null;
      }
    }
    const data = {
      rfxHeaderId,
      rfxQuotationLines,
      projectLineSectionList,
    };
    return data;
  };

  /**
   * 线上-发起议价-分标段, 此方法被 [华友钴页] 二开, 禁止修改
   * @protected
   */
  @Bind()
  async handleIntegrationSectionBatchStart() {
    const data = await this.handleOnlineSectionSelected();

    if (!isEmpty(data)) {
      this.openStartBargainModal();
      // this.setState({ deadlineEventVisible: true });
    }
  }

  // 线上-分标段-批量发起
  handleOnlineStartSection = (data = {}) => {
    if (isEmpty(data)) {
      return;
    }

    this.toggleOperationLoading(true);
    barginSectionBatchStart(data).then((res) => {
      const result = getResponse(res);
      this.toggleOperationLoading(false);
      this.onlineEndDateModalCancel();

      if (Array.isArray(result) && !isEmpty(result)) {
        this.setState({
          operateSectionData: result,
          operateSectionPromptFlag: true,
        });
        return;
      }

      notification.success();

      const projectLineSectionId = this.getRouterSearch('projectLineSectionId');
      if (!projectLineSectionId || projectLineSectionId === 'null') {
        this.fetchBargainHeader();
      } else {
        this.refreshSectionLists();
      }
    });
  };

  /**
   *  发起议价
   */
  @Bind()
  @Throttle(1000)
  async bargainOnStart() {
    const { isBatchMaintainSection = false, activeKey = '' } = this.state;
    const {
      remote,
      match: { params },
      dispatch,
      modelName = 'bargain',
      organizationId,
    } = this.props;
    const { isCheckedSectionListEmpty = () => {} } = this.SectionRef || {};

    const isBidSectionData = this.isBidSectionData(); // 分标段
    const { visible = false, config = {} } = this.judgeCurrentUserConfig('sectionBarginPriceStart');

    if (remote?.event) {
      const eventProps = {
        rfxHeaderId: params.rfxId,
        AllTableDS: this.AllTableDS,
        dispatch,
        modelName,
        organizationId,
        filterParams: this.searchComponent?.getQueryParameter,
        getSelectedAllPageFlag: this.getSelectedAllPageFlag,
        getAllData: this.getAllData,
        getCurrentCustomeCode: this.getCurrentCustomeCode,
        activeKey,
        setState: this.setState.bind(this),
        currentSectionRef: this.SectionRef,
        afterOperateFetchAll: this.afterOperateFetchAllTabs,
        handleIntegrationSectionBatchStart: this.handleIntegrationSectionBatchStart,
        onlineStartBarginPrice: this.onlineStartBarginPrice,
        that: this,
      };
      const res = await remote.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

    if (isBidSectionData) {
      const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
      const needWarningUserConfig =
        (!isBatchMaintainSection || (isBatchMaintainSection && checkedFlag)) && visible;
      if (needWarningUserConfig) {
        this.setState({
          batchEmptySelectSectionFlag: true,
          userConfig: config,
          batchOperateType: 'barginPirceStart',
        });
        return;
      }
      // 区分标段, 批量勾选
      if (isBatchMaintainSection && !checkedFlag) {
        this.handleIntegrationSectionBatchStart();
      } else {
        this.onlineStartBarginPrice();
      }
      // if (!isBatchMaintainSection) {
      //   this.onlineStartBarginPrice(); // normal supplier quotation submit
      // }
    } else {
      this.onlineStartBarginPrice(); // normal supplier quotation submit
    }
  }

  /**
   * 线上发起议价 此方法被 [华友钴页] 二开, 禁止修改
   * @protected
   */
  @Bind()
  onlineStartBarginPrice() {
    const { remote } = this.props;

    let openFlag = this.judgeCurrentTableHasSelectedLine();
    openFlag = remote
      ? remote.process('SSRC_BARGAIN_NEW_ONLINESTARTBARGAINPRICE_OPENFLAG', openFlag, {})
      : openFlag;

    if (openFlag) {
      this.openStartBargainModal();
      // this.setState({ deadlineEventVisible: true });
    } else {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.bargain.selectRowWarning`).d('未勾选行数据'),
      });
    }
  }

  @Bind()
  async validateAll() {
    const { remote } = this.props;

    let validateList = [];
    this.AllTableDS.selected.forEach((record) => {
      if (
        record.isSelected &&
        !['BARGAINED', 'ABANDONED'].includes(record.get('quotationLineStatus'))
      ) {
        Object.assign(record, {
          status: 'update',
        });
        validateList.push(record.validate());
      }
    });

    validateList = remote
      ? await remote.process('SSRC_BARGAIN_NEW_VALIDATEALL_VALIDATELIST', validateList, {
          allTableDS: this.AllTableDS,
        })
      : validateList;

    return Promise.all(validateList).then((res) => res.every((item) => item));
  }

  // 批量填写还价-获取勾选行币种
  getCurrencyCodeFromSelectedLines = (param = {}) => {
    const { data } = param || {};

    let quotationCurrencyCodeUnique = null;
    if (!data?.length) {
      return quotationCurrencyCodeUnique;
    }

    for (const item of data) {
      if (!item) {
        return;
      }

      const { quotationCurrencyCode } = item?.quotationLineId
        ? item
        : item.get(['quotationCurrencyCode']);

      if (quotationCurrencyCodeUnique && quotationCurrencyCodeUnique !== quotationCurrencyCode) {
        quotationCurrencyCodeUnique = null;
        break;
      }

      quotationCurrencyCodeUnique = quotationCurrencyCode;
    }

    return quotationCurrencyCodeUnique;
  };

  /**
   * 批量填写还比价
   */
  handleFillCounteroffers = async (lineId = null) => {
    const { activeKey } = this.state;

    let quotationCurrencyCode = null;

    if (activeKey === 'allDetails') {
      const { selected: allSelectedData = [] } = this.AllTableDS || {};
      if (allSelectedData?.length > 0) {
        quotationCurrencyCode = this.getCurrencyCodeFromSelectedLines({ data: allSelectedData });

        this.setState({
          currentLineId: lineId,
        });
      } else {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
            .d('请勾选要批量填写还价的行'),
        });
        return;
      }
    }
    if (activeKey === 'supplierList') {
      const supplierData =
        (await this.integrationAllTabTablePageData({ tableValidateFlag: 0 })) || [];

      quotationCurrencyCode = this.getCurrencyCodeFromSelectedLines({ data: supplierData });
      this.setState({
        // fillCounteroffersVisible: true,
        currentLineId: lineId,
        fillCounteroffersTableData: supplierData,
      });
    }

    if (activeKey === 'itemDetails') {
      const itemData = await this.integrationAllTabTablePageData({ tableValidateFlag: 0 });

      quotationCurrencyCode = this.getCurrencyCodeFromSelectedLines({ data: itemData });
      this.setState({
        // fillCounteroffersVisible: true,
        currentLineId: lineId,
        fillCounteroffersTableData: itemData,
      });
    }

    this.openBatchEditorModal({
      quotationCurrencyCode,
    });
  };

  batchInputModalRef = null;

  // type
  openBatchEditorModal = (data = {}) => {
    const { bargainFlag, loading } = this.state;
    const { quotationCurrencyCode } = data || {};

    this.counterOffersBulkDS = new DataSet(
      counterOffersBulkDataSet({
        bargainFlag,
      })
    );

    this.counterOffersBulkDS.create(
      {
        quotationCurrencyCode,
      },
      0
    );

    const modalProps = {
      hiddenRemark: !bargainFlag,
      loading,
      dataSet: this.counterOffersBulkDS,
    };

    this.batchInputModalRef = c7nModal.open({
      destroyOnClose: true,
      closable: true,
      drawer: true,
      key: c7nModal.key(),
      title: intl.get('ssrc.inquiryHall.view.message.title.counterOffersBulk').d('批量填写还价'),
      children: <BatchInputPrice {...modalProps} />,
      style: { width: 380 },
      onOk: this.handleSaveCounterOffersBulk,
      onClose: () => this.handleCancelCounterOffersBulk(),
    });
  };

  // @Bind()
  // handleEditCounterOffers(event) {
  //   event.stopPropagation();
  //   const { selected: allSelectedData = [] } = this.AllTableDS || {};

  //   if (!allSelectedData?.length) {
  //     notification.warning({
  //       message: intl
  //         .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
  //         .d('请勾选要批量填写还价的行'),
  //     });
  //   } else {
  //     this.setState({
  //       // fillCounteroffersVisible: true,
  //       fillCounterModalData: {
  //         quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({ data: allSelectedData }),
  //       },
  //     });
  //   }
  // }

  handleCancelCounterOffersBulk = () => {
    this.batchInputModalRef = null;
    this.counterOffersBulkDS = null;
    this.setState({
      fillCounteroffersTableData: [],
      currentLineId: null,
    });
  };

  /**
   * 批量填写价格 - 线下
   */
  // @Bind()
  // handleFillCounteroffersOffline(event, lineId, data) {
  //   event.stopPropagation();
  //   const { currencyCode } = data || {};
  //   this.setState({ fillCounteroffersOfflineVisible: true, currentLineId: lineId, fillCounterModalData: { quotationCurrencyCode: currencyCode } });
  // }

  // @Bind()
  // handleCancelCounterOffersOffline() {
  //   this.setState({ fillCounteroffersOfflineVisible: false, fillCounterModalData: {} });
  // }

  /**
   * 返回参数渲染
   */
  @Bind()
  parentPath(bargainHeader = {}) {
    const {
      location,
      match: { params },
      remote,
    } = this.props;
    const {
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      bargainingStage,
      evaluateLeaderFlag,
      sourcePage,
      projectLineSectionId = null,
      sourceProjectId = null,
      roundQuotationRule,
      multiSectionFlag,
    } = querystring.parse(location.search.substr(1));

    const { sourceProjectId: headerSourceProjectId = null } = bargainHeader || {};
    const projectSectionId =
      !projectLineSectionId || projectLineSectionId === 'null' ? '' : projectLineSectionId;
    const formatSourceProjectId =
      !sourceProjectId || sourceProjectId === 'null' ? headerSourceProjectId : sourceProjectId;
    const sourceHeaderId = params.rfxId;

    let url;
    if (sourceStatus === 'RFX_EVALUATION_PENDING') {
      url = `${this.activeTabKey}/rfx-evaluation/${sourceHeaderId}?backRecommend=${backRecommend}&sourceFrom=${sourceFrom}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceHeaderId=${params.rfxId}&sourceProjectId=${formatSourceProjectId}&projectLineSectionId=${projectSectionId}`;
    } else if (sourceStatus === 'checkPrice') {
      url = `${this.activeTabKey}/check-price/${params.rfxId}?projectLineSectionId=${projectLineSectionId}`;
    } else if (bargainingStage === 'SCORE') {
      url = `${this.activeTabKey}/rfx-evaluation-proc-manage/${params.rfxId}?evaluateLeaderFlag=${evaluateLeaderFlag}&cachTabKey=${cachTabKey}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&sourceStatus=${sourceStatus}&sourcePage=${sourcePage}&bargainingStage=${bargainingStage}&sourceProjectId=${formatSourceProjectId}&projectLineSectionId=${projectLineSectionId}`;
    } else if (sourceStatus === 'SCORING') {
      url = `${this.activeTabKey}/rfx-evaluation/${sourceHeaderId}?evaluateLeaderFlag=${evaluateLeaderFlag}&cachTabKey=${cachTabKey}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&sourceStatus=${sourceStatus}&sourcePage=${sourcePage}&roundQuotationRule=${roundQuotationRule}&multiSectionFlag=${multiSectionFlag}&sourceProjectId=${formatSourceProjectId}&projectLineSectionId=${projectLineSectionId}`;
    } else {
      url = `${this.activeTabKey}/rfx-evaluation-proc-manage/${sourceHeaderId}?backRecommend=${backRecommend}&sourceFrom=${sourceFrom}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceHeaderId=${params.rfxId}&evaluateLeaderFlag=${evaluateLeaderFlag}&sourceProjectId=${formatSourceProjectId}&projectLineSectionId=${projectLineSectionId}`;
    }

    if (sourceStatus === 'newInquiryHallToBargain') {
      url = `${this.activeTabKey}/list`;
    }

    const getBackPath = (param = {}) => {
      const { _url } = param;
      url = _url;
    };
    const eventProps = {
      location,
      _url: url,
      sourceHeaderId,
      routerParams: querystring.parse(location.search.substr(1)),
      activeTabKey: this.activeTabKey,
      getBackPath,
    };
    if (remote?.event) {
      remote.event.fireEvent('handleGetBackPath', eventProps);
    } else {
      getBackPath(eventProps);
    }

    return url;
  }

  // 头部基本信息
  @Bind()
  renderHeaderInfo() {
    const { current } = this.headerDS || {};

    const {
      bargainEndDate,
      currentDateTime,
      rfxNum,
      rfxTitle,
      bargainTimes = null,
      quotationRoundNumber,
    } = current
      ? current?.get([
          'bargainEndDate',
          'currentDateTime',
          'rfxNum',
          'rfxTitle',
          'bargainTimes',
          'quotationRoundNumber',
        ])
      : {};

    const time = bargainEndDate || null;
    const now = currentDateTime || currentDateTime;
    const titleAndName = rfxNum && rfxTitle ? `${rfxNum}-${rfxTitle}` : rfxNum || rfxTitle || '';

    return (
      <React.Fragment>
        <Row style={{ lineHeight: '24px' }}>
          <Col span={16}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={styles['bargain-header']}>
                <Tooltip placement="topLeft" title={titleAndName}>
                  {titleAndName}
                </Tooltip>
              </div>
              <Tag className={styles['bargain-header-tag-round']} style={{ fontWeight: 'normal' }}>
                {intl
                  .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
                    round: quotationRoundNumber || 1,
                  })
                  .d('第{round}轮报价')}
              </Tag>
              {!isNil(bargainTimes) ? (
                <Tag
                  className={styles['bargain-header-tag-bargain']}
                  style={{ fontWeight: 'normal' }}
                >
                  {intl
                    .get(`ssrc.common.theRoundBargainNum`, {
                      bargainTimes,
                    })
                    .d(`第{bargainTimes}次议价`)}
                </Tag>
              ) : null}
            </div>
          </Col>
          {this.renderBargainEndDate(now, time)}
        </Row>
      </React.Fragment>
    );
  }

  /**
   * 二开渲染议价截止时间 ps: 此方法被 [华友钴业] 二开, 严禁删除/修改方法名
   * @protected
   */
  @Bind()
  renderBargainEndDate(now, time) {
    const { bargainFlag } = this.state;
    return this.renderPageContent(
      bargainFlag ? (
        <Col span={8} {...FORM_COL_3_LAYOUT}>
          <div className={styles.titleRight}>
            <span>
              {intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间')}：
            </span>
            <CountDown
              sysNow={now}
              endTime={time}
              numberStyle={{ fontSize: '20px', fontWeight: '600' }}
            />
          </div>
        </Col>
      ) : (
        ''
      )
    );
  }

  /**
   * 头部渲染
   */
  @Bind()
  renderHeader() {
    const {
      match: { params },
      remote,
      customizeForm,
    } = this.props;
    const { bargainFlag = false } = this.state;

    const headerProps = {
      remote,
      customizeForm,
      bargainFlag,
      rfxHeaderId: params.rfxId,
      headerDS: this.headerDS,
      sourceKey: this.sourceKey,
      bidFlag: this.bidFlag,
    };

    return (
      <div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '15px' }}>
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </div>
        </div>

        <HeaderForm {...headerProps} />
      </div>
    );
  }

  /**
   * 附件上传
   */
  @Bind()
  handleAfterOpenModal(checkAttachmentUuid = null) {
    this.setState({
      bargainAttachmentUuid: checkAttachmentUuid,
    });
  }

  /**
   * 回调成功传递uuid
   */
  @Bind()
  uploadSuccess() {
    const { dispatch, modelName = 'bargain' } = this.props;
    const { organizationId } = this.props;
    const { bargainHeader = {} } = this.state;

    const param = {
      ...(bargainHeader || {}),
      ...{ bargainAttachmentUuid: this.state.bargainAttachmentUuid },
    };
    dispatch({
      type: `${modelName}/uploadAttachement`,
      payload: {
        organizationId,
        param,
      },
    });
  }

  /**
   * 禁止选择当前时间之前
   */
  // @Bind()
  // disabledDate(current) {
  //   // Can not select days before today and today
  //   return current && current < moment().subtract(0, 'days');
  // }

  batchEmptySectionRef = (ref = {}) => {
    this.BatchEmptySectionRef = ref;
  };

  // 批量操作标段不再提示modal ok
  batchOperateSections = () => {
    const { SectionRef, BatchEmptySectionRef = {} } = this;
    const { userConfig = {} } = this.state;
    if (isEmpty(BatchEmptySectionRef) || isEmpty(SectionRef)) {
      return;
    }

    try {
      this.BatchEmptySectionRef.saveUserConfigBatch({
        userId: getCurrentUserId(),
        enabledFlag: 1,
        ...userConfig,
      });

      this.handleOkSectionOperatePrompt();
    } catch (e) {
      throw e;
    } finally {
      this.batchOperateSectionsCancel();
      this.resetSectionChecked();
      this.fetchUserConfig();
    }
  };

  // 批量操作标段不再提示modal cancel
  batchOperateSectionsCancel = () => {
    this.setState({
      batchEmptySelectSectionFlag: false,
    });
    this.resetSectionChecked();
  };

  // 分标段-清除勾选
  resetSectionChecked = () => {
    const { SectionRef } = this;
    if (isEmpty(SectionRef)) {
      return;
    }

    SectionRef.resetItemChecked();
  };

  // 是否显示批量操作按钮
  isBidSectionData() {
    const flag = this.getBidSectionFlag();

    if (isEmpty(this.SectionRef)) {
      return false;
    }

    const { isSectionListEmpty } = this.SectionRef;

    const notEmptyFlag = isSectionListEmpty();
    return !notEmptyFlag && flag;
  }

  // 获取分标段表示
  getBidSectionFlag() {
    let flag = false;

    const projectLineSectionId = this.getRouterSearch('projectLineSectionId');
    if (projectLineSectionId && projectLineSectionId !== 'null') {
      flag = true;
    }
    return flag;
  }

  // 分标段提示弹框-ok
  handleOkSectionOperatePrompt = () => {
    const { batchOperateType = null } = this.state;
    switch (batchOperateType) {
      case 'barginPirceStart':
        this.onlineStartBarginPrice();
        break;
      case 'barginPirceEnd':
        this.handleBarginOnEnd();
        break;
      case 'barginPirceFinish':
        this.handleOfflineFinishBarginPrice();
        break;
      default:
        break;
    }
    this.handleCancellSectionOperatePrompt();
  };

  // 分标段提示弹框-cancel
  handleCancellSectionOperatePrompt = () => {
    this.setState({
      operateSectionData: [],
      operateSectionPromptFlag: false,
    });
  };

  // 选择标段
  @Bind()
  selectBidSection() {
    this.setState((prev) => {
      return {
        isBatchMaintainSection: !prev.isBatchMaintainSection,
      };
    });
    this.resetSectionChecked();
  }

  // 获取路由location -> search -> [key]: value
  getRouterSearch = (key = null) => {
    if (!key || typeof key !== 'string') {
      return;
    }

    const {
      location: { search },
    } = this.props;
    const { [key]: s = null } = querystring.parse(search.substr(1));
    return s;
  };

  // 切换标段强校验
  changeSectionValidate = async () => {
    const { bargainFlag = 0, activeKey } = this.state;
    if (bargainFlag) {
      if (activeKey === 'allDetails') {
        const flag = await this.validateAll();
        if (!flag) {
          return false;
        }
      }
    }
    return true;
  };

  // 分标段-切换-区分线上线下保存
  switchSectionBefore = async (needStop = false) => {
    // const { bargainFlag = 0 } = this.state;
    let result = true;

    // if (bargainFlag) {
    //   result = await this.handleSavePage({ needStop });
    // } else {
    //   result = await this.handleSavePage({ needStop });
    // }

    result = await this.handleSavePage({ needStop });
    return result;
  };

  // 分标段-切换-改全部报价明细是否跨页全选状态
  @Bind()
  switchSectionAfter = () => {
    if (
      this.AllTableDS.getState('selectAllManually') ||
      this.AllTableDS.getState('selectAllManually') === 0
    ) {
      // 初始化跨页勾选
      this.AllTableDS.setAllPageSelection(false);
      // 初始化手动勾选
      this.AllTableDS.setState('selectAllManually', null);
    }
    // const { modelName = 'bargain', dispatch } = this.props;

    // // 切换标段后，原标段打开的供应商/物料折叠卡片需要重置
    // this.setState({
    //   collapseItemActiveKeys: [],
    //   collapseSupplierActiveKeys: [],
    // });

    this.clearItemAndSupplierCollapsePanel();
  };

  // 切换标段定位到当前路由
  locatedCurrentUrl = (data = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const {
      history,
      location: { search },
    } = this.props;
    const { sourceHeaderId = null, projectLineSectionId = null, sourceProjectId = null } =
      data || {};
    if (!sourceHeaderId) {
      return;
    }

    let newSearch = querystring.parse(search.substr(1));
    const pathname = `${this.activeTabKey}/new-rfx-bargain/${sourceHeaderId}`;

    newSearch = querystring.stringify({
      ...newSearch,
      projectLineSectionId,
      sourceProjectId,
    });

    history.push({
      pathname,
      search: newSearch,
    });
  };

  // 是否可以切标段-loading
  couldSectionSwitch = () => {
    const { allLoading = false } = this.props;
    const { operationLoading = false } = this.state;
    return allLoading || operationLoading;
  };

  // 议价弹窗
  @Bind()
  openStartBargainModal() {
    const { loading, operationLoading } = this.state;
    const { customizeForm = noop } = this.props;

    this.startBargainModalDS.create({}, 0);

    const StartBargainFormProps = {
      dataSet: this.startBargainModalDS,
      customizeForm,
      sourceKey: this.sourceKey,
    };

    return c7nModal.open({
      title: intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间'),
      key: c7nModal.key(),
      children: <StartBargainForm {...StartBargainFormProps} />,
      style: { width: 380 },
      drawer: true,
      closable: true,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      onOk: this.handleOkOnlineStartBargainPrice,
      onColse: () => this.onlineEndDateModalCancel(),
      onCancel: () => this.onlineEndDateModalCancel(),
      okProps: {
        loading: loading || operationLoading,
      },
    });
  }

  /**
   * 线上-发起议价-modal-ok, 此方法被 [华友钴业] 二开, 严禁修改
   * @param {?Object} data - 额外参数, 二开会传递, 请勿删除
   * @protected
   */
  @Bind()
  // @Throttle(800)
  async handleOkOnlineStartBargainPrice(data = {}) {
    const { dispatch, modelName = 'bargain', remote } = this.props;
    const { isBatchMaintainSection = false } = this.state;

    const { current } = this.startBargainModalDS || {};
    let allPageData = await this.integrationAllPageData({
      needStop: true,
      onlyValidateSelectLineFlag: 1,
    });
    if (!current || !allPageData) {
      return false;
    }

    allPageData.rfxQuotationLineLists = allPageData.rfxQuotationLines; // TODO
    const validateFlag = await this.startBargainModalDS.validate();

    if (!validateFlag) {
      return false;
    }

    const { isCheckedSectionListEmpty = () => {}, getCheckedSectionList = () => {} } =
      this.SectionRef || {};
    const isBidSectionData = this.isBidSectionData(); // 分标段
    const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
    const startBargainModalData = current.toData();

    allPageData = remote
      ? await remote.process(
          'SSRC_BARGAIN_NEW_HANDLEOKONLINESTARTBARGAINPRICE_LINES',
          allPageData,
          {
            allTableDS: this.AllTableDS,
            allProps: this.props,
            allState: this.state,
            isBidSectionData: this.isBidSectionData(),
            allPageData,
          }
        )
      : allPageData;

    if (isEmpty(allPageData)) {
      return false;
    }

    if (isBidSectionData && isBatchMaintainSection && !checkedFlag) {
      const projectLineSectionList = getCheckedSectionList();
      this.handleOnlineStartSection({
        projectLineSectionList,
        ...allPageData,
        ...(startBargainModalData || {}),
        ...(data || {}),
      });
      return;
    }

    // 发起议价接口
    const startBargain = (otherPayload = {}) => {
      const startBargainDto = {
        ...allPageData,
        ...(startBargainModalData || {}),
        ...(otherPayload || {}),
        ...(data || {}),
      };
      return dispatch({
        type: `${modelName}/handleStartAllNew`,
        payload: startBargainDto,
      });
    };

    // 发起议价成功之后的处理
    const handleSuccessAfterStartBargain = () => {
      this.clearAllTabsAndTabCache();
      this.onlineEndDateModalCancel();

      const projectLineSectionId = this.getRouterSearch('projectLineSectionId');
      if (!projectLineSectionId || projectLineSectionId === 'null') {
        this.fetchBargainHeader();
      } else {
        this.refreshSectionLists();
      }
    };

    return startBargain().then((res) => {
      const startBargainResult = getResponse(res);
      if (!startBargainResult) {
        return false;
      }
      handleValidationResult({
        strongValidationTip: intl
          .get('ssrc.inquiryHall.model.bargain.strongValidationFailedTips')
          .d('发起议价失败，以下内容验证不通过'),
        weakValidationTip: intl
          .get('ssrc.inquiryHall.model.bargain.weakValidationFailedTips')
          .d('以下验证未通过，确认发起议价吗?'),
        validationResult: res,
        afterSuccessSubmit: () => {
          notification.success();
          handleSuccessAfterStartBargain();
        },
        confirmSubmit: () => {
          return startBargain({ passFlag: 1 }).then((result) => {
            if (getResponse(result)) {
              notification.success();
              handleSuccessAfterStartBargain();
            }
          });
        },
      });
    });
  }

  // 线上-发起议价-截至时间-modal-cancel
  onlineEndDateModalCancel = () => {
    this.startBargainModalDS.reset();
    this.startBargainModalDS.clear();

    // this.setState({
    //   deadlineEventVisible: false,
    // });
  };

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch, organizationId } = this.props;

    const evaluateSummaryId = record?.get('evaluateSummaryId');
    if (!evaluateSummaryId) {
      return;
    }

    dispatch({
      type: 'inquiryHall/fetchScoreDetail',
      payload: {
        organizationId,
        evaluateSummaryId,
      },
    });
  }

  @Bind()
  viewScoreDetail(e, supplierLineRecord) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    this.setState({
      scoreDetailModalVisible: true,
    });

    this.fetchScoreDetil(supplierLineRecord);
  }

  /**
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  cancelScoreDetailModal() {
    this.setState({
      scoreDetailModalVisible: false,
    });
  }

  @Bind()
  handleImport() {
    const {
      match: {
        params: { rfxId },
      },
      organizationId,
    } = this.props;
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const props = {
      code: 'SSRC.RFX_BARGAIN_OFFLINE',
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        rfxHeaderId: rfxId,
        templateCode: 'SSRC.RFX_BARGAIN_OFFLINE',
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
      downloadTemplateFlag: false,
      auto: true,
    };
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.title.bargain.offline`).d('线下议价'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
      onClose: this.batchImportOk,
    });
  }

  @Bind()
  batchImportOk() {
    // this.fetchPages();
    this.handleAfterOperate();

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      this.fetchUserConfig();
    }
  }

  // 未税标识
  isTaxPriceFlag = () => {
    const { current } = this.headerDS;
    const priceTypeCode = current?.get('priceTypeCode');
    return priceTypeCode && priceTypeCode !== 'NET_PRICE';
  };

  // 改变价格后统一数据处理
  changePriceGetCommonProps = (options = {}) => {
    const { record } = options || {};
    const { caclRule, doubleUnitFlag } = this.state;
    if (!record) {
      return;
    }

    const {
      taxRate,
      taxIncludedFlag,
      currentQuotationQuantity,
      currentQuotationSecQuantity,
      // benchmarkPriceType,
      quotationCurrencyFinancialPrecision,
      quotationCurrencyDefaultPrecision,
      priceBatchQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        'taxRate',
        'currentQuotationQuantity',
        'currentQuotationSecQuantity',
        // 'benchmarkPriceType',
        'quotationCurrencyFinancialPrecision',
        'quotationCurrencyDefaultPrecision',
        'priceBatchQuantity',
        'taxRateType',
      ]) || {};

    const taxPriceFlag = this.isTaxPriceFlag();
    const COMMONS = {
      hasTax: taxPriceFlag,
      hasMount: true,
      financialPrecision: quotationCurrencyFinancialPrecision,
      defaultPrecision: quotationCurrencyDefaultPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const CurrentQuotationQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    const taxRateNew = taxIncludedFlag ? taxRate ?? null : null;
    COMMONS.quantity = CurrentQuotationQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;

    if (!CurrentQuotationQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    return COMMONS;
  };

  // 按照基准价动态计算价格
  dynamicChangePrice = (options) => {
    const { record } = options || {};
    const { doubleUnitFlag } = this.state;
    if (!record) {
      return;
    }

    const taxIncludeFlag = this.isTaxPriceFlag();

    const {
      currentQuotationPrice,
      currentQuotationSecPrice,
      netPrice,
      netSecondaryPrice,
    } = record.get([
      'currentQuotationPrice',
      'currentQuotationSecPrice',
      'netPrice',
      'netSecondaryPrice',
    ]);

    let currentPriceBaseValue = taxIncludeFlag ? currentQuotationPrice : netPrice;
    if (doubleUnitFlag) {
      currentPriceBaseValue = taxIncludeFlag ? currentQuotationSecPrice : netSecondaryPrice;
    }

    const CommonProps = this.changePriceGetCommonProps(options) || {};
    const CurrentPriceCOMMONS = {};

    if (taxIncludeFlag) {
      CurrentPriceCOMMONS.taxUnitPrice = currentPriceBaseValue;
    } else {
      CurrentPriceCOMMONS.netUnitPrice = currentPriceBaseValue;
    }

    const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };
    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount, calcTaxUnitPrice } =
      amountCalculation(COMMONS) || {};

    const priceValueObject = {
      // netPrice: calcNetUnitPrice,
      currentLnTotalAmount: calcTaxAmount,
      currentLnNetAmount: calcNetAmount,
    };

    if (taxIncludeFlag) {
      priceValueObject.netPrice = calcNetUnitPrice;
      priceValueObject.currentQuotationSecPrice = currentPriceBaseValue; // 保存校验需要这个字段
      if (doubleUnitFlag) {
        priceValueObject.netSecondaryPrice = calcNetUnitPrice;
      }
    } else {
      priceValueObject.currentQuotationPrice = calcTaxUnitPrice;
      priceValueObject.netSecondaryPrice = currentPriceBaseValue; // 保存校验需要这个字段
      if (doubleUnitFlag) {
        priceValueObject.currentQuotationSecPrice = calcTaxUnitPrice;
      }
    }

    record.set(priceValueObject);
  };

  getBiddingFieldsFromHeader = () => {
    const { current } = this.headerDS || {};

    const biddingData = current
      ? current.get(['biddingMode', 'biddingTarget', 'biddingFlag', 'sourceCategory'])
      : {};

    return biddingData || {};
  };

  getBiddingHall = () => {
    const { biddingFlag, sourceCategory } = this.getBiddingFieldsFromHeader();

    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    return newBiddingFlag;
  };

  // 日式
  japanBiddingTotalPrice = () => {
    const { biddingMode } = this.getBiddingFieldsFromHeader();
    const flag =
      biddingMode === 'JAPANESE_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  // 荷兰式
  dutchBiddingTotalPrice = () => {
    const { biddingMode } = this.getBiddingFieldsFromHeader();
    const flag =
      biddingMode === 'DUTCH_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  getTotalPriceFlag = () => {
    const { biddingTarget } = this.getBiddingFieldsFromHeader();

    const flag = biddingTarget === 'TOTAL_PRICE';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBiddingTotalPrice = () => {
    const flag = this.japanBiddingTotalPrice() || this.dutchBiddingTotalPrice();

    return flag;
  };

  /**
   * 线上全部报价明细
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  renderAll = (allProps = {}) => {
    return <All {...allProps} />;
  };

  // 三个表格增加同一字段逻辑
  getAllTabTableCommonFields = (options = {}) => {
    const { remote } = this.props;
    const { activeKey, bargainFlag, doubleUnitFlag } = this.state;

    const preFields = [];

    const cuxProps = {
      activeKey,
      bargainFlag,
      doubleUnitFlag,
      bidFlag: this.bidFlag,
      headerDS: this.headerDS,
      ...(options || {}),
    };

    const Fields = remote
      ? remote.process('SSRC_BARGAIN_NEW_PROCESS_TABLE_COMMON_FIELDS', preFields, cuxProps)
      : preFields;

    return Fields;
  };

  // 议价tab页
  @Bind()
  renderTabs(data = {}) {
    const { customizeTabPane = () => {} } = this.props;
    const { bargainFlag } = this.state;
    const { allProps, supplierListProps, itemDetailsProps } = data || {};

    return this.renderPageContent(
      customizeTabPane(
        {
          code: bargainFlag
            ? `SSRC.${this.sourceKey}_HALL_BARGAIN.TABS_ONLINE`
            : `SSRC.${this.sourceKey}_HALL_BARGAIN.TABS_OFFLINE`,
          custDefaultActive: this.changeActiveKey,
        },
        <Tabs
          defaultActiveKey="allDetails"
          animated={false}
          onChange={this.changeActiveKey}
          // activeKey={activeKey}
        >
          <TabPane
            tab={intl.get(`ssrc.inquiryHall.view.tab.allQuotationDetails`).d('全部报价明细')}
            key="allDetails"
          >
            {this.renderAll(allProps)}
          </TabPane>
          <TabPane
            tab={intl.get(`ssrc.inquiryHall.view.tab.supplierList`).d('供应商列表')}
            key="supplierList"
          >
            <Supplier {...supplierListProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`ssrc.inquiryHall.view.tab.itemDetails`).d('物品明细')}
            key="itemDetails"
          >
            <Item {...itemDetailsProps} />
          </TabPane>
        </Tabs>
      )
    );
  }

  /**
   * 获取筛选器数据
   */
  @Bind()
  handleGetFormValue() {
    const formValues = this.getAllQuotationTableSearchParameter() || {};
    const filterValues = {
      orderType: 'itemCategoryName',
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY_OFFLINE`,
      ...formValues,
    };
    return filterValues;
  }

  /**
   * 处理线下线下标志未返回时，内容渲染
   */
  @Bind()
  renderPageContent(component) {
    const { bargainFlag } = this.state;
    if (bargainFlag === initBargainFlag) {
      return null;
    }
    return component;
  }

  @Bind()
  fetchImportRefresh() {
    this.clearItemAndSupplierCollapsePanel();
    this.fetchBargainHeader();
  }

  @Bind()
  renderHeaderButtons() {
    const {
      handleSaveAllLoading,
      handleSaveAllOfflineLoading,
      bargainOnFinishedLoading,
      endLoading,
      organizationId,
      headerLoading,
      match,
      customizeBtnGroup = () => {},
      remote,
    } = this.props;
    const {
      operationLoading = false,
      bargainFlag,
      isBatchMaintainSection = false,
      bargainHeader = {},
      headerGroupButtonMaxNum = -1,
    } = this.state;

    const { params } = match || {};
    const { rfxId } = params || {};

    const isBidSectionData = this.isBidSectionData(); // 是否分标段且标段数据存在

    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag, bargainClosedFlag } = bargainHeader || {};
    const priceComparisonProps = {
      rfxId,
      sourceCategory,
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };

    // 线上议价按钮
    const onLineBargainButtons = [
      bargainClosedFlag === 0
        ? {
            name: 'finished',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'power_settings_new',
              color: 'primary',
              // funcType: 'flat',
              loading: endLoading || operationLoading || headerLoading,
              onClick: this.bargainOnEnd,
            },
            child: intl.get('ssrc.inquiryHall.view.message.button.bargainOnEnd').d('结束议价'),
          }
        : null,
      bargainClosedFlag === 1
        ? {
            name: 'start',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'check',
              color: 'primary',
              loading: operationLoading || headerLoading,
              onClick: this.bargainOnStart,
            },
            child: intl.get('ssrc.inquiryHall.view.message.button.bargainOnStart').d('发起议价'),
          }
        : null,
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          // color: 'primary',
          funcType: 'flat',
          loading: handleSaveAllLoading || operationLoading || headerLoading,
          onClick: () => this.bargainOnSaveOnline({ type: 'save' }),
          disabled: isBatchMaintainSection,
        },
        child: intl.get('ssrc.inquiryHall.view.message.button.save').d('保存'),
      },
      isBidSectionData
        ? {
            name: 'section',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'save',
              // color: 'primary',
              funcType: 'flat',
              loading: operationLoading || headerLoading,
              onClick: this.selectBidSection,
            },
            child: (
              <>
                {!isBatchMaintainSection
                  ? intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')
                  : intl.get(`ssrc.common.view.button.cancelBidSectionBtn`).d('取消标段')}
              </>
            ),
          }
        : null,
      {
        name: 'record',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: this.playView,
          disabled: isBidSectionData,
        },
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      },
      {
        name: 'price',
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          loading: handleSaveAllLoading || operationLoading || headerLoading,
          onClick: () => this.handleRenderPriceComparison(priceComparisonProps),
          disabled: isBidSectionData,
        },
        child: (
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
      },
      !isBidSectionData
        ? {
            name: 'files',
            btnType: 'c7n-pro',
            btnComp: Upload, // todo Attachment
            btnProps: {
              // funcType: 'flat',
              filePreview: true,
              fileSize: FIlESIZE,
              btnText: intl.get(`hzero.common.upload.text`).d('上传附件'),
              bucketName: PRIVATE_BUCKET,
              bucketDirectory: 'ssrc-rfx-quotationheader',
              attachmentUUID: bargainHeader?.bargainAttachmentUuid,
              uploadSuccess: isEmpty(bargainHeader?.bargainAttachmentUuid) && this.uploadSuccess,
              afterOpenUploadModal: this.handleAfterOpenModal,
              btnProps: {
                icon: 'upload',
                type: 'default',
                style: {
                  border: 'none',
                  padding: 0,
                },
              },
            },
            // child: (
            //   <Upload
            //     filePreview
            //     fileSize={FIlESIZE}
            //     btnText={intl.get(`hzero.common.upload.text`).d('上传附件')}
            //     bucketName={PRIVATE_BUCKET}
            //     attachmentUUID={bargainHeader?.bargainAttachmentUuid}
            //     uploadSuccess={isEmpty(bargainHeader?.bargainAttachmentUuid) && this.uploadSuccess}
            //     afterOpenUploadModal={this.handleAfterOpenModal}
            //     btnProps={{
            //       style: {
            //         color: '#333',
            //       },
            //     }}
            //   />
            // ),
          }
        : null,
      {
        name: 'export',
        btnComp: ExcelExportPro,
        btnProps: {
          name: 'export',
          buttonText: intl.get('hzero.common.export.new').d('(新)导出'),
          requestUrl:
            this.sourceKey === INQUIRY
              ? `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxId}/bargain-online/export`
              : `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxId}/bid-bargain-online/export`,
          queryParams: () => {
            return {
              customizeUnitCode: `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY`,
              ...(this.getAllQuotationTableSearchParameter() || {}),
            };
          },
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            style: { marginRight: '8px' },
            funcType: 'flat',
          },
        },
      },
      {
        name: 'import',
        btnComp: CommonImportNew,
        inMenuItem: true,
        btnProps: {
          name: 'import',
          icon: 'archive',
          type: 'c7n-pro',
          auto: true,
          args: {
            tenantId: organizationId,
            rfxHeaderId: rfxId,
            templateCode:
              this.sourceKey === INQUIRY ? 'SSRC.RFX_BARGAIN_ONLINE' : 'SSRC.BID_BARGAIN_ONLINE',
            fromExport: true,
          },
          businessObjectTemplateCode:
            this.sourceKey === INQUIRY ? 'SSRC.RFX_BARGAIN_ONLINE' : 'SSRC.BID_BARGAIN_ONLINE',
          customeImportTemplate: {
            templateCode:
              this.sourceKey === INQUIRY
                ? 'SRM_C_SRM_SSRC_RFX_BARGAIN_ONLINE_DOWNLOAD_EXPORT'
                : 'SRM_C_SRM_SSRC_BID_BARGAIN_ONLINE_DOWNLOAD_EXPORT',
            requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxId}/bargain-online/download-export`,
            queryArea: { fillerType: 'multi-sheet', async: false },
          },
          prefixPatch: SRM_SSRC,
          buttonText: intl.get('hzero.common.title.batchImportNew').d('(新)批量导入'),
          tenantId: getCurrentOrganizationId(),
          successCallBack: this.fetchImportRefresh,
          buttonProps: {
            funcType: 'flat',
          },
        },
      },
    ].filter(Boolean);

    // 线下议价按钮
    const offLineBargainButtons = [
      {
        name: 'finished',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'power_settings_new',
          color: 'primary',
          loading: bargainOnFinishedLoading || operationLoading || headerLoading,
          onClick: this.bargainOnFinished,
        },
        child: intl.get('ssrc.inquiryHall.view.message.button.bargainFinished').d('完成议价'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          loading: handleSaveAllOfflineLoading || operationLoading || headerLoading,
          onClick: () => this.bargainOnSaveOffline({ type: 'save' }),
          disabled: isBatchMaintainSection,
        },
        child: intl.get('ssrc.inquiryHall.view.message.button.save').d('保存'),
      },
      {
        name: 'price',
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          loading: handleSaveAllLoading || operationLoading || headerLoading,
          onClick: () => this.handleRenderPriceComparison(priceComparisonProps),
          disabled: isBidSectionData,
        },
        child: (
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
      },
      {
        name: 'files',
        btnType: 'c7n-pro',
        btnComp: Upload, // todo Attachment
        hidden: isBidSectionData,
        btnProps: {
          filePreview: true,
          fileSize: FIlESIZE,
          btnText: intl.get(`hzero.common.upload.text`).d('上传附件'),
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-rfx-quotationheader',
          attachmentUUID: bargainHeader?.bargainAttachmentUuid,
          uploadSuccess: isEmpty(bargainHeader?.bargainAttachmentUuid) && this.uploadSuccess,
          afterOpenUploadModal: this.handleAfterOpenModal,
          btnProps: {
            icon: 'upload',
            type: 'default',
            style: {
              border: 'none',
              padding: 0,
            },
          },
        },
      },
      {
        name: 'section',
        btnType: 'c7n-pro',
        hidden: !isBidSectionData,
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          loading: operationLoading || headerLoading,
          onClick: this.selectBidSection,
        },
        child: (
          <>
            {!isBatchMaintainSection
              ? intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')
              : intl.get(`ssrc.common.view.button.cancelBidSectionBtn`).d('取消标段')}
          </>
        ),
      },
      {
        name: 'record',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: this.playView,
          disabled: isBidSectionData,
        },
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      },
      {
        name: 'excelImport',
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          onClick: this.handleImport,
        },
        child: (
          <>
            {/* <Iconfont type="main-import" size={16} /> */}
            {intl.get(`ssrc.supplierQuotation.view.message.button.importQuotation`).d('Excel导入')}
          </>
        ),
      },
      {
        name: 'downloadTheImportTemplate',
        btnComp: ExcelExports,
        btnProps: {
          buttonText: intl
            .get(`ssrc.offlineResultEntry.view.button.downloadImportTemplate`)
            .d('下载导入模板'),
          requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxId}/bargain/export`,
          otherButtonProps: {
            funcType: 'flat',
            type: 'c7n-pro',
          },
          queryParams: this.handleGetFormValue(),
        },
      },
      {
        name: 'import',
        btnComp: CommonImportNew,
        inMenuItem: true,
        btnProps: {
          name: 'import',
          icon: 'archive',
          type: 'c7n-pro',
          auto: true,
          args: {
            tenantId: organizationId,
            rfxHeaderId: rfxId,
            templateCode: 'SSRC.BARGAIN_OFFLINE_IMPORT',
            fromExport: true,
          },
          businessObjectTemplateCode: 'SSRC.BARGAIN_OFFLINE_IMPORT',
          customeImportTemplate: {
            method: 'GET',
            queryParams: { rfxHeaderId: rfxId, ...(this.handleGetFormValue() || {}) },
            templateCode: 'SRM_C_SRM_SSRC_BARGAIN_OFFLINE_EXPORT',
            requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/${rfxId}/bargain-offline/export`,
            queryArea: { fillerType: 'multi-sheet', async: false },
          },
          prefixPatch: SRM_SSRC,
          // buttonText: intl.get('hzero.common.title.batchImportNew').d('(新)批量导入'),
          tenantId: getCurrentOrganizationId(),
          successCallBack: this.fetchImportRefresh,
          buttonProps: {
            funcType: 'flat',
          },
        },
      },
    ].filter(Boolean);

    // 二开埋点 => 线上议价按钮
    const remoteOnlineBargainButtons = remote
      ? remote.process(
          'SSRC_BARGAIN_NEW_PROCESS_ONLINE_BARGAIN_HEADER_BUTTONS',
          onLineBargainButtons,
          {
            bidFlag: this.sourceKey !== INQUIRY,
            bargainHeader,
            handleAfterOperate: this.handleAfterOperate,
            bargainClosedFlag, // 是否处于议价中 0是 1否
          }
        )
      : onLineBargainButtons;

    return (
      <>
        {bargainFlag
          ? this.renderPageContent(
              customizeBtnGroup(
                { code: `SSRC.${this.sourceKey}_HALL_BARGAIN.ONLINE_BTNS`, pro: true }, // 只处理询价的线上按钮
                <DynamicButtons
                  trigger="click"
                  maxNum={headerGroupButtonMaxNum}
                  buttons={remoteOnlineBargainButtons}
                  defaultBtnType="c7n-pro"
                />
              )
            )
          : this.renderPageContent(
              customizeBtnGroup(
                { code: `SSRC.${this.sourceKey}_HALL_BARGAIN.OFFLINE_BTNS`, pro: true },
                <DynamicButtons
                  trigger="click"
                  maxNum={headerGroupButtonMaxNum}
                  buttons={offLineBargainButtons}
                  defaultBtnType="c7n-pro"
                />
              )
            )}
      </>
    );
  }

  @Bind()
  handleRenderPriceComparison(priceComparisonProps) {
    return c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceComparison(priceComparisonProps),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  /**
   * 比价助手modal-此方法被 [永祥] 重写, 请谨慎修改!!!
   * @protected
   */
  renderPriceComparison(priceComparisonProps) {
    return this.sourceKey === INQUIRY ? (
      <PriceComparison {...priceComparisonProps} />
    ) : (
      <BidPriceComparison {...priceComparisonProps} />
    );
  }

  // 表格数量渲染，受单位精度
  tableRenderQuotatyByUomPrecision = ({ value, record }) => {
    const { doubleUnitFlag } = this.state;

    if (!record) {
      return '';
    }

    return doubleUnitFlag && record.get('itemId')
      ? numberSeparatorRender(value)
      : numberSeparatorRender(value, record.getState('uom_precision'));
  };

  render() {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      match,
      organizationId,
      [modelName]: {
        bargainSupplierLine = [],
        // bargainSupplierLinePagination = {},
        // supplierLine = [],
        // supplierLinePagination = {},
        // bargainItemLine = [],
        // bargainItemLinePagination = {},
        // itemLine = [],
        // itemLinePagination = {},
      },
      inquiryHall: {
        // code: { bargainType, bargainTypeOffline },
        // barginLadderLevelData = [],
        operationPagination,
        operationData,
        scoreDetailList = {},
      },
      // fetchItemDetailsInfoLoading,
      // saveCounterOffersBulkLoading,
      // saveCounterOffersOfflineLoading,
      fetchSupplierLineBargainLoading,
      saveBarginLadderLevelLoading,
      fetchBarginLadderLevelyTableLoading,
      headerLoading = false,
      // handleSaveAllLoading = false,
      // handleSaveAllOfflineLoading = false,
      customizeTable,
      // customizeTabPane = () => {},
      fetchScoreDetailLoading,
      remote,
    } = this.props;

    const {
      bargainHeader = {},
      activeKey,
      doubleUnitFlag,
      // fillCounteroffersVisible,
      // fillCounterModalData,
      // fillCounteroffersOfflineVisible,
      // fillCounteroffersFlag,
      // viewLadderLevelVisible,
      // pageSize,
      // LadderLevelHeaderData, // 阶梯报价头部数据
      collapseSupplierActiveKeys = [],
      collapseItemActiveKeys = [],
      loadingFlag = {},
      // supplierSelectKeys = [],
      // supplierSelectRows = [],
      // itemSelectKeys = [],
      // itemSelectRows = [],
      bargainFlag,
      isBatchMaintainSection = false,
      batchEmptySelectSectionFlag = false,
      operateSectionData = [],
      operateSectionPromptFlag = true,
      // priceComparisonModalVisible,
      operationRecordModalVisible,
      batchOperateType = null,
      switchNotification,
      scoreDetailModalVisible,
      operationLoading = false,
      newQuotationFlag = false,
    } = this.state;

    const { params } = match;
    const { rfxId } = params || {};

    const commonProps = {
      headerDS: this.headerDS,
      loadingFlag,
      bargainFlag,
      isOfflineFlag: !bargainFlag,
      doubleUnitFlag,
      newQuotationFlag,
      customizeTable,
      sourceKey: this.sourceKey,
      // supplierSelectKeys,
      collapseSupplierActiveKeys,
      collapseItemActiveKeys,
      organizationId,
      // LadderLevelHeaderData,
      // viewLadderLevelVisible,
      // barginLadderLevelData,
      headerInfo: bargainSupplierLine,
      saveLoading: saveBarginLadderLevelLoading,
      // viewLadderLevel: this.viewLadderLevelModal,
      // hideModal: this.hideLadderLevelModal,
      getCurrentSupplierOrItemDataMap: this.getCurrentSupplierOrItemDataMap,
      getAllTabTableCommonFields: this.getAllTabTableCommonFields,
      bargainHeader,
      remote,
      bidFlag: this.sourceKey === 'BID',
      ladderInquiryrender: this.ladderInquiryrender,
      fetchCurrentSupplierOrItemTableByLineId: this.fetchCurrentSupplierOrItemTableByLineId,
      tableRenderQuotatyByUomPrecision: this.tableRenderQuotatyByUomPrecision,
      dynamicChangePrice: this.dynamicChangePrice,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
    };

    // 供应商列表勾选数据
    // const supplierSelection = {
    //   selectedRowKeys: supplierSelectKeys,
    //   selectedRows: supplierSelectRows,
    //   onChange: this.supplierLineSelect,
    //   getCheckboxProps: (record) => ({
    //     disabled:
    //       record.quotationLineStatus === 'BARGAINED' ||
    //       record.quotationLineStatus === 'ABANDONED' ||
    //       record.supplierStatus === 'QUOTATION_INVALID' ||
    //       record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
    //       record.eliminateRoundNumber ||
    //       (bargainFlag && !record.supplierCompanyId),
    //   }),
    // };

    // 物品明细勾选数据
    // const itemSelection = {
    //   selectedRowKeys: itemSelectKeys,
    //   selectedRows: itemSelectRows,
    //   onChange: this.itemLineSelect,
    //   getCheckboxProps: (record) => ({
    //     disabled:
    //       record.quotationLineStatus === 'BARGAINED' ||
    //       record.quotationLineStatus === 'ABANDONED' ||
    //       record.supplierStatus === 'QUOTATION_INVALID' ||
    //       record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
    //       record.eliminateRoundNumber ||
    //       (bargainFlag && !record.supplierCompanyId),
    //   }),
    // };

    // 全部报价明细
    const allProps = {
      ...commonProps,
      doubleUnitFlag,
      rfxHeaderId: rfxId,
      sourceKey: this.sourceKey,
      AllTableDS: this.AllTableDS,
      onSearchBarRef: (node) => {
        this.searchComponent = node || {};
      },
      // handleEditCounterOffers: this.handleEditCounterOffers,
      handleEditCounterOffers: this.handleFillCounteroffers,
      bargainFlag,
      newQuotationFlag,
      remote,
    };

    // // 全部报价明细线下
    // const allOffinleProps = {
    //   ...allProps,
    //   isOfflineFlag: true,
    //   bargainHeader,
    // };

    // 供应商列表
    const supplierListProps = {
      ...commonProps,
      supplierMap: this.supplierMap,
      supplierListDS: this.supplierListDS,
      fetchSupplierLineBargainLoading,
      // headerPagination: bargainSupplierLinePagination,
      handleCollBack: this.handleCollBack,
      // dataSource: supplierLine,
      // pagination: supplierLinePagination,
      // onSearch: this.changeSupplierPageOnline,
      fillCounterSupplier: this.handleFillCounteroffers,
      // onSaveBarginLadderLine: this.saveBarginLadderLine,
      // fetchLoading: fetchBarginLadderLevelyTableLoading,
      showQuotationDetail: this.showQuotationDetail,
      viewScoreDetail: this.viewScoreDetail,
    };

    // 评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
      loading: fetchScoreDetailLoading,
    };

    // 供应商列表 - 线下
    // const supplierListOfflineProps = {
    //   loadingFlag,
    //   pageSize,
    //   doubleUnitFlag,
    //   newQuotationFlag,
    //   organizationId,
    //   customizeTable,
    //   viewLadderLevelVisible,
    //   supplierSelectKeys,
    //   barginLadderLevelData,
    //   LadderLevelHeaderData,
    //   sourceKey: this.sourceKey,
    //   saveLoading: saveBarginLadderLevelLoading,
    //   collapseSupplierActiveKeys,
    //   fetchSupplierLineBargainLoading,
    //   headerInfo: bargainSupplierLine,
    //   bargainHeader,
    //   headerPagination: bargainSupplierLinePagination,
    //   handleCollBack: this.handleCollBack,
    //   onSearch: this.changeSupplierOrItemLinePageOffline,
    //   dataSource: supplierLine,
    //   pagination: supplierLinePagination,
    //   onChangePagination: this.changeItemLinePagination,
    //   fillCounterSupplier: this.handleFillCounteroffersOffline,
    //   viewLadderLevel: this.viewLadderLevelModal,
    //   hideModal: this.hideLadderLevelModal,
    //   onSaveBarginLadderLine: this.saveBarginLadderLine,
    //   fetchLoading: fetchBarginLadderLevelyTableLoading,
    //   bargainFlag,
    //   remote,
    // };

    // 物品明细
    const itemDetailsProps = {
      ...commonProps,
      itemListDS: this.itemListDS,
      itemMap: this.itemMap,
      // loadingFlag,
      // bargainFlag,
      // doubleUnitFlag,
      // newQuotationFlag,
      // itemSelectKeys,
      // pageSize,
      // organizationId,
      // customizeTable,
      // sourceKey: this.sourceKey,
      // headerInfo: bargainItemLine,
      // fetchItemDetailsInfoLoading,
      // headerPagination: bargainItemLinePagination,
      // onChangePagination: this.changeItemDetailsPagination,
      handleItemCallBack: this.handleItemCallBack,
      // onSearch: this.changeItemLinePageOnline,
      // dataSource: itemLine,
      // pagination: itemLinePagination,
      // barSelectItemLine: itemSelection,
      fillCounterItem: this.handleFillCounteroffers,
      // viewLadderLevelVisible,
      // hideModal: this.hideLadderLevelModal,
      // barginLadderLevelData,
      // onSaveBarginLadderLine: this.saveBarginLadderLine,
      // LadderLevelHeaderData,
      saveLoading: saveBarginLadderLevelLoading,
      fetchLoading: fetchBarginLadderLevelyTableLoading,
      // viewLadderLevel: this.viewLadderLevelModal,
    };

    // 物品明细 - 线下
    // const itemDetailsOfflineProps = {
    //   loadingFlag,
    //   doubleUnitFlag,
    //   fetchItemDetailsInfoLoading,
    //   itemSelectKeys,
    //   pageSize,
    //   organizationId,
    //   customizeTable,
    //   sourceKey: this.sourceKey,
    //   collapseItemActiveKeys,
    //   headerInfo: bargainItemLine,
    //   headerPagination: bargainItemLinePagination,
    //   onChangePagination: this.changeItemDetailsPagination,
    //   onSearch: this.changeSupplierOrItemLinePageOffline,
    //   handleItemCallBack: this.handleItemCallBack,
    //   dataSource: itemLine,
    //   pagination: itemLinePagination,
    //   barSelectItemLine: itemSelection,
    //   viewLadderLevelVisible,
    //   hideModal: this.hideLadderLevelModal,
    //   barginLadderLevelData,
    //   onSaveBarginLadderLine: this.saveBarginLadderLine,
    //   LadderLevelHeaderData,
    //   saveLoading: saveBarginLadderLevelLoading,
    //   fetchLoading: fetchBarginLadderLevelyTableLoading,
    //   viewLadderLevel: this.viewLadderLevelModal,
    //   bargainHeader,
    //   newQuotationFlag,
    //   remote,
    // };

    // 批量填写还价 - 线上
    // const counterOffersBulkProps = {
    //   hiddenRemark: !bargainFlag,
    //   bargainType,
    //   visible: fillCounteroffersVisible,
    //   saveLoading: saveCounterOffersBulkLoading,
    //   onSave: this.handleSaveCounterOffersBulk,
    //   onCancel: this.handleCancelCounterOffersBulk,
    //   modalData: fillCounterModalData,
    // };

    // 批量填写还价 - 线下
    // const counterOffersBulkOfflineProps = {
    //   bargainType: bargainTypeOffline,
    //   visible: fillCounteroffersOfflineVisible,
    //   saveLoading: saveCounterOffersOfflineLoading,
    //   onSave: this.handleSaveCounterOfflineBulk,
    //   onCancel: this.handleCancelCounterOffersOffline,
    //   type: 'BARGAIN_OFFLINE',
    //   modalData: fillCounterModalData,
    // };

    // 操作记录
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
    };

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    const bargainingStage = this.getRouterSearch('bargainingStage');
    const sourceStatus = this.getRouterSearch('sourceStatus');

    const SectionPanelProps = {
      parentPage: {
        name: 'barginPrice',
        queryParams: {
          rfxHeaderId: rfxId,
          rfxStatus:
            bargainingStage === 'SCORE' || sourceStatus === 'RFX_EVALUATION_PENDING'
              ? 'SCORE'
              : 'BARGAIN',
        },
      },
      changeSectionValidate: this.changeSectionValidate,
      locatedCurrentUrl: this.locatedCurrentUrl,
      couldSectionSwitch: this.couldSectionSwitch,
      paramKeys: ['sourceHeaderId'],
      projectLineSectionId: this.getRouterSearch('projectLineSectionId'),
      queryMain: this.querySupplier,
      switchNotification,
      beforeOpenSection: this.switchSectionBefore,
      afterOpenSection: this.switchSectionAfter,
      isSection: BidSectionFlag,
      isBatchMaintainSection,
      getWrapperClassName: () => {
        return styles['supplier-bargain-new-section-container'];
      },
    };

    const isBidSectionData = this.isBidSectionData();

    // 批量处理标段时候未勾选标段数据提示框
    const BatchProps = {
      parentPage: {
        name: batchOperateType,
        queryParams: {
          rfxHeaderId: rfxId,
        },
      },
      visible: batchEmptySelectSectionFlag,
      handleOk: this.batchOperateSections,
      handleCancel: this.batchOperateSectionsCancel,
      onRef: this.batchEmptySectionRef,
    };

    // 分标段操作提示modal
    const operateSectionPrompt = {
      dataList: operateSectionData,
      visible: operateSectionPromptFlag,
      handleOk: this.handleOkSectionOperatePrompt,
      handleCancel: this.handleCancellSectionOperatePrompt,
    };

    return (
      <div className={styles['ssrc-inquiry-bargain-wrapper']}>
        <Spin spinning={operationLoading || headerLoading}>
          <Header
            title={this.renderPageContent(
              bargainFlag
                ? intl.get('ssrc.inquiryHall.view.message.title.bargainOnline').d('线上议价')
                : intl.get('ssrc.inquiryHall.view.message.title.bargainOffline').d('线下议价')
            )}
            backPath={this.parentPath(bargainHeader)}
          >
            {this.renderHeaderButtons()}
          </Header>

          <div className={styles['ssrc-bargain-main-content-wrapper']}>
            <SectionPanel
              {...SectionPanelProps}
              onRef={(node) => {
                this.SectionRef = node;
              }}
            >
              <div className={styles['ssrc-bargain-content-card-container']}>
                <TopSection
                  code={`SSRC.${this.sourceKey}_HALL_BARGAIN.HEADER_INFO`}
                  getHocInstance={this.props.getHocInstance}
                  className={
                    isBidSectionData
                      ? styles['bargain-content-card-section']
                      : styles['bargain-content-card']
                  }
                >
                  <div
                    className={
                      isBidSectionData
                        ? styles['bargain-content-card-header-section']
                        : styles['bargain-content-card-header']
                    }
                  >
                    {this.renderHeaderInfo()}
                  </div>
                </TopSection>
                <TopSection
                  code={`SSRC.${this.sourceKey}_HALL_BARGAIN.BASE_INFO_CARD`}
                  getHocInstance={this.props.getHocInstance}
                  className={
                    isBidSectionData
                      ? styles['bargain-content-card-section']
                      : styles['bargain-content-card']
                  }
                >
                  <div
                    className={
                      isBidSectionData
                        ? styles['bargain-content-card-header-section']
                        : styles['bargain-content-card-header']
                    }
                    // style={{ paddingBottom: 0 }}
                  >
                    {this.renderHeader(bargainFlag)}
                  </div>
                </TopSection>

                <TopSection
                  code={`SSRC.${this.sourceKey}_HALL_BARGAIN.QUTATION_TABLE_CARD`}
                  getHocInstance={this.props.getHocInstance}
                  className={styles['bargain-content-card-table']}
                >
                  <div
                    className={classnames(styles['bargain-content-card-table-info'], {
                      [styles['bargain-content-card-table-info-allDetails']]:
                        activeKey === 'allDetails',
                    })}
                  >
                    {this.renderTabs({
                      allProps,
                      supplierListProps,
                      itemDetailsProps,
                    })}
                  </div>
                </TopSection>
              </div>
            </SectionPanel>
          </div>
        </Spin>

        {/* {priceComparisonModalVisible && this.renderPriceComparison(priceComparisonProps)} */}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {/* {fillCounteroffersVisible && <CounterOffersBulk {...counterOffersBulkProps} />} */}
        {/* {fillCounteroffersOfflineVisible && (
          <CounterOffersBulk {...counterOffersBulkOfflineProps} />
        )} */}
        {/* {this.renderModal()} */}
        {batchEmptySelectSectionFlag && <BatchEmptySelectedModal {...BatchProps} />}
        {operateSectionPromptFlag && <OperateSectionPromptModal {...operateSectionPrompt} />}
        {scoreDetailModalVisible && <ScoreDetailModal {...scoreDetailProps} />}
      </div>
    );
  }
}

// const HOCComponent = Form.create({ fieldNameProp: null })(
//   withCustomize({
//     unitCode: [
//       'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION',
//       'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
//       'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS',
//       'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
//       'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER',
//       'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER_OFFLINE',
//       'SSRC.INQUIRY_HALL_BARGAIN.TABS_OFFLINE', // 线下议价详情-TAB页
//       'SSRC.INQUIRY_HALL_BARGAIN.ONLINE_BTNS', // 线上议价头按钮组
//       'SSRC.INQUIRY_HALL_BARGAIN.START_ONLINE_BARGAIN', // 发起议价弹框
//       'SSRC.INQUIRY_HALL_BARGAIN.HEADER', // 线上议价头
//     ],
//   })(
//     connect(({ inquiryHall, bargain, loading }) => ({
//       inquiryHall,
//       bargain,
//       // allLoading: loading.global,
//       headerLoading: loading.effects['bargain/fetchBargainHeader'],
//       // supplierLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
//       // itemLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
//       // saveCounterOffersBulkLoading: loading.effects['bargain/saveCounterOffersBulk'],
//       // saveCounterOffersOfflineLoading: loading.effects['bargain/saveCounterOffersOffline'],
//       // handleSaveAllLoading: loading.effects['bargain/handleSaveAllOnline'],
//       // fetchSupplierLineBargainLoading: loading.effects['bargain/fetchSupplierLineList'],
//       // fetchItemDetailsInfoLoading: loading.effects['bargain/fetchItemLineList'],
//       // saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
//       // fetchBarginLadderLevelyTableLoading:
//       //   loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
//       // fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
//       // handleSaveAllOfflineLoading: loading.effects['bargain/handleSaveAllOffline'],
//       handleStartAllLoading: loading.effects['bargain/handleStartAll'],
//       // bargainOnFinishedLoading: loading.effects['bargain/bargainOnFinished'],
//       // endLoading: loading.effects['bargain/bargainOnEnd'],
//       organizationId: getCurrentOrganizationId(),
//     }))(
//       formatterCollections({
//         code: [
//           'ssrc.inquiryHall',
//           'ssrc.bidHall',
//           'hzero.common',
//           'ssrc.supplierQuotation',
//           'ssrc.offlineResultEntry',
//           'ssrc.common',
//           'ssrc.priceLibraryNew',
//           'ssrc.rf',
//           'sscux.ssrc',
//         ],
//       })(
//         remoteHoc(
//           {
//             code: 'SSRC_BARGAIN_NEW',
//             name: 'remote',
//           },
//           {
//             events: {
//               handleGetBackPath(props = {}) {
//                 const { getBackPath = noop, ...otherParams } = props || {};
//                 getBackPath(otherParams);
//               },
//               handleJumpOnlineSucceed(props = {}) {
//                 const { jumpOnlineSucceed = noop } = props || {};
//                 jumpOnlineSucceed(props);
//               },
//               handleJumpOfflineSucceed(props = {}) {
//                 const { jumpOfflineSucceed = noop } = props || {};
//                 jumpOfflineSucceed(props);
//               },
//             },
//           }
//         )(observer(Bargain))
//       )
//     )
//   )
// );

const HOCComponent = (Com) => {
  return hocBargainCommon(Com, { bidFlag: false, modelName: 'bargain' });
};

const hocBargain = (Com) => {
  return hocBargainCommon(Com, { bidFlag: false, modelName: 'bargain' });
};

export default HOCComponent;
export { Bargain, HOCComponent as HOCBargain, hocBargain };
