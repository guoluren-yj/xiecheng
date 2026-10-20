/**
 * model - 议价
 * @date: 2019-12-31
 * @author: ZXM <ximin.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Tabs, Form, Modal, DatePicker, Input, Tooltip, Tag, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, uniqWith, isEqual, noop } from 'lodash';
import moment from 'moment';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { Bind, Throttle } from 'lodash-decorators';
import querystring from 'querystring';
import ExcelExports from '@/routes/components/ExcelExport';
import { Modal as c7nModal, DataSet } from 'choerodon-ui/pro';
import { getActiveTabKey } from 'utils/menuTab';
import { observer } from 'mobx-react';
import remoteHoc from 'hzero-front/lib/utils/remote';
import classnames from 'classnames';

import DynamicButtons from '_components/DynamicButtons';
import { Header } from 'components/Page';
import { TopSection } from '_components/Section';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getEditTableData,
  getDateTimeFormat,
  getCurrentUserId,
  getResponse,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { FIlESIZE } from '@/utils/SsrcRegx';
import {
  INQUIRY,
  BID,
  getDocumentTypeName,
  getCategoryCode,
  getQuotationName,
} from '@/utils/globalVariable';

import SectionPanel from '@/routes/components/SectionPanel';
import BatchEmptySelectedModal from '@/routes/components/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import ScoreDetailModal from '@/routes/share/RoundQuotationAllTable/ScoreDetailModal';
import CommonImport from '@/routes/himp/CommonImportNew';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImportNew from 'hzero-front/lib/components/Import';
import {
  barginSectionBatchEnd,
  barginSectionBatchStart,
  offlineSectionBatchFinish,
  fetchBargainOnlineAllTableCount,
} from '@/services/bargainService';
import { fetchInquiryHallUserMemory as fetchUserConfigBatch } from '@/services/inquiryHallNewService';
import { queryEnableDoubleUnit, queryH0OrC7N } from '@/services/commonService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import { isText, getEditTableToData, amountCalcType } from '@/utils/utils';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';

import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import CountDown from '../../components/CountDown';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import OperationRecord from '../../components/OperationRecord';
// import FullQuoteDetails from './FullQuoteDetails';
import SupplierList from './SupplierList';
import ItemDetails from './ItemDetails';
import CounterOffersBulk from '../FeedbackBargain/CounterOffersBulk';
import styles from './index.less';
// import FullQuoteDetailsOffline from './FullQuoteDetailsOffline';
import SupplierListOffline from './SupplierListOffline';
import ItemDetailsOffline from './itemDetailsOffline';
import All from './All';
import { allTableDS } from './AllDS';
import AllOffLine from './AllOffLine';
import AllBid from './AllBid';
import AllBidOffline from './AllBidOffline';

const { TabPane } = Tabs;
const FormItem = Form.Item;

const initBargainFlag = Symbol('init'); // bargainFlag 初始值，在未查到线下或线下返回值时,唯一值

class Bargain extends Component {
  constructor(props) {
    super(props);

    this.bidFlag = props?.sourceKey === 'BID';

    this.allQuotationTableCount = undefined;
    this.SectionRef = {};
    this.BatchEmptySectionRef = {};
    this.allTableDS = allTableDS({
      sourceKey: props.sourceKey || INQUIRY,
      updateAllSelectionCount: this.updateAllSelectionCount,
    });
    this.AllTableDS = new DataSet(
      props.remote
        ? props.remote.process('SSRC_BARGAIN_PROCESS_ALL_TABLE_DS', this.allTableDS, {
            bidFlag: props.sourceKey === 'BID',
          })
        : this.allTableDS
    );

    this.state = {
      activeKey: 'allDetails', // 当前激活的面板
      uploadVisible: false, // 附件上传模态框
      collapseSupplierActiveKeys: [], // 控制供应商列表的展开
      collapseItemActiveKeys: [], // 控制物品列表的展开
      priceComparisonModalVisible: false, // 比价助手模态框
      operationRecordModalVisible: false, // 操作记录模态框
      loadingFlag: {}, // loading判断
      supplierSelectKeys: [], // 供应商列表勾选id,
      supplierSelectRows: [], // 供应商列表勾选数据
      itemSelectKeys: [], // 物品明细列表勾选id,
      itemSelectRows: [], // 物品明细列表勾选数据
      fillCounteroffersVisible: false, // 批量填写还价模态框
      fillCounteroffersOfflineVisible: false, // 批量填写价格模态框
      fillCounteroffersFlag: false, // 判断批量填写还价按钮显隐
      fillCounterModalData: {}, // 批量填写还价弹框-数据
      currentLineId: null,
      deadlineEventVisible: false, // 截止时间模态框打开
      pageSize: [],
      currentPage: {},
      pageAll: [], // 存储分页变化
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      itemId: undefined, // 比价记录点击历史行标记
      bargainAttachmentUuid: '', // 上传附件
      requestFlag: false,
      itemRecord: {}, // 当前操作的物品行
      quotationDetailVisible: false, // 报价明细显示标识
      itemLineRecord: {}, // 物品行记录
      bargainFlag: initBargainFlag, // 是否是线上议价
      allCachSelectObj: {}, // 全部页签缓存勾选的行
      itemCachSelectObj: {}, // 物料页签勾线的行
      supplierCachSelectObj: {}, // 供应商页签勾线的行
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
    };
  }

  activeTabKey = getActiveTabKey();

  sourceKey = this.props.sourceKey || INQUIRY;

  componentDidMount() {
    this.initPage();
  }

  initPage = async () => {
    const { remote } = this.props;

    let fetchListFlag = true;

    if (remote?.event) {
      const eventProps = {
        that: this,
        bidFlag: this.bidFlag,
      };

      fetchListFlag = await remote.event.fireEvent('beforeInitPageCuxHandle', eventProps);
    }

    if (fetchListFlag) {
      this.fetchPages();

      const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
      if (BidSectionFlag) {
        this.fetchUserConfig();
      }
    }
  };

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
    const { rfxId: prevId = null } = prevParams;
    const { rfxId = null } = params;
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
    this.initCalcType();
    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      return;
    }

    this.fetchBargainHeader();
    this.newQuotationConfigSheet();
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

  /**
   * 结束生命周期，清空数据
   */
  componentWillUnmount() {
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
  }

  /**
   * 查询头基本信息
   */
  fetchBaseInfo = async (queryParams = {}) => {
    const {
      match: { params, path = null },
      dispatch,
      modelName = 'bargain',
      organizationId,
    } = this.props;

    const header = await dispatch({
      type: `${modelName}/fetchBargainHeader`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        path,
        ...queryParams,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_BARGAIN.HEADER`,
      },
    });

    return header;
  };

  @Bind()
  fetchBargainHeader(queryParams = {}) {
    const {
      match: { params, path = null },
      dispatch,
      modelName = 'bargain',
      organizationId,
    } = this.props;
    if (params.rfxId) {
      dispatch({
        type: `${modelName}/fetchBargainHeader`,
        payload: {
          organizationId,
          rfxHeaderId: params.rfxId,
          path,
          ...queryParams,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL_BARGAIN.HEADER`,
        },
      }).then((res) => {
        const { bargainStatus } = res || {};
        // 判断是线上还是线下议价
        const bargainFlag =
          res && (bargainStatus === 'BARGAIN_ONLINE' || bargainStatus === 'BARGAINING_ONLINE');
        this.setState({
          bargainFlag,
        });

        this.AllTableDS.setQueryParameter('queryParams', {
          rfxHeaderId: queryParams.rfxHeaderId || params.rfxId,
          customizeUnitCode: bargainFlag
            ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY`
            : `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY_OFFLINE`,
        });
        this.AllTableDS.setState('isUnTaxPriceFlag', res && res.priceTypeCode === 'NET_PRICE');
        this.AllTableDS.setState('bargainFlag', bargainFlag);
        if (!bargainFlag) {
          this.AllTableDS.selection = false;
        }
        this.AllTableDS.setState('headerData', res || {});
        const lovCodes = {
          bargainType: 'SSRC.BARGAIN_TYPE', // 还价方式
          bargainTypeOffline: 'SSRC.BARGAIN_OFFLINE_TYPE', // 线下还价方式
        };
        dispatch({
          type: 'inquiryHall/batchCode',
          payload: { lovCodes },
        });
        this.fetchSupplierLineBargainPrice({}, queryParams); // 获取供应商头信息
        this.fetchItemDetailsInfo({}, queryParams); // 获取物品明细头信息
        this.AllTableDS.query();

        if (bargainFlag) {
          this.fetchAllQuotateTableCount();
        }
      });
    }
  }

  @Bind()
  initData() {
    this.fetchBargainHeader(); // 查询头
    // this.fetchSupplierLineBargainPrice(); // 获取供应商头信息
    // this.fetchItemDetailsInfo(); // 获取物品明细头信息
    // this.AllTableDS.query(); // 获取全部报价明细
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

  /**
   * 供应商列表行头部 - 查询
   */

  @Bind()
  async fetchSupplierLineBargainPrice(page = {}, queryParams = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'bargain',
      remote,
    } = this.props;

    const result = await dispatch({
      type: `${modelName}/fetchSupplierLineBargainPrice`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        ...queryParams,
      },
    });

    if (remote?.event) {
      remote.event.fireEvent('handleRemoteAfterFetchSupplierLineBargainPrice', {
        that: this,
        result,
        page,
      });
    }
  }

  /**
   * 物品明细行头部 - 查询
   */

  @Bind()
  fetchItemDetailsInfo(page = {}, queryParams = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'bargain',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchItemDetailsInfo`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        ...queryParams,
      },
    });
  }

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

  @Bind()
  getCurrentCustomeCode() {
    const { activeKey, bargainFlag } = this.state;
    if (activeKey === 'allDetails') {
      return bargainFlag
        ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY`
        : `SSRC.${this.sourceKey}_HALL_BARGAIN.ALLQUOTATION_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.FILTER_BAR_QUERY_OFFLINE`;
    } else if (activeKey === 'supplierList') {
      return bargainFlag
        ? `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`
        : `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`;
    } else {
      return bargainFlag
        ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS`
        : `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE`;
    }
  }

  /**
   * 保存 - 线下
   */
  @Bind()
  @Throttle(1000)
  async bargainOnSaveOffline(type = 'save', lineId = '', flagALL, page = {}, otherPayload = {}) {
    const SectionFlag = this.isBidSectionData(); // 分标段保存逻辑
    if (SectionFlag) {
      this.offlineSaveOfSection(false, lineId, flagALL, page, otherPayload);
      return;
    }

    const rfxQuotationLines = await this.integrationOfflinePageData();
    const customizeUnitCode = this.getCurrentCustomeCode();
    if (isEmpty(rfxQuotationLines)) {
      return;
    }

    const { modelName = 'bargain' } = this.props;

    const {
      [modelName]: {
        // bargainFullDetPagination = {},
        bargainSupplierLinePagination,
        bargainItemLinePagination,
      },
      organizationId,
      dispatch,
      match: { params },
    } = this.props;
    const { activeKey } = this.state;

    const clearSelectedLineAll = () => {
      this.setState({
        itemSelectRows: [],
        collapseItemActiveKeys: [],
        supplierSelectRow: [],
        collapseSupplierActiveKeys: [],
      });
    };

    if (type === 'save') {
      dispatch({
        type: `${modelName}/handleSaveAllOffline`,
        payload: {
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxQuotationLines,
          customizeUnitCode,
        },
      }).then((res) => {
        if (res) {
          this.fetchBaseInfo();
          // notification.success();
          this.AllTableDS.unSelectAll();
          this.AllTableDS.clearCachedSelected();
          this.fetchSupplierLineBargainPrice(bargainSupplierLinePagination);
          this.fetchItemDetailsInfo(bargainItemLinePagination);
          this.AllTableDS.query(this.AllTableDS.currentPage);
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              itemLine: [],
              supplierLine: [],
            },
          });
          clearSelectedLineAll();
        }
      });
    } else if (type === 'pageSave') {
      if (activeKey === 'allDetails') {
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine: [],
            supplierLine: [],
          },
        });
        clearSelectedLineAll();
        this.AllTableDS.query(this.AllTableDS.currentPage);
      } else if (activeKey === 'supplierList') {
        this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave', otherPayload);
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine: [],
          },
        });
        this.setState({ itemSelectRows: [], collapseItemActiveKeys: [] });
      } else {
        this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave');
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            supplierLine: [],
          },
        });
        this.setState({ supplierSelectRow: [], collapseSupplierActiveKeys: [] });
      }
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

  markSelectedLine = (data) => {
    const { list, keys, id } = data || {};
    if (isEmpty(list) || isEmpty(keys)) {
      return list;
    }

    const newList = list.map((line) => {
      const { [id]: idValue } = line || {};
      const selectedFlag = keys.includes(idValue) ? 1 : 0;

      return {
        ...line,
        bargainSelectedFlag: selectedFlag,
      };
    });

    return newList;
  };

  // 线上-分标段-整合数据
  integrationOnlinePageData = (needStop = false, type = '') => {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: {
        supplierLine = [],
        itemLine = [],
        // bargainHeader: { bargainClosedFlag },
      },
    } = this.props;
    const {
      activeKey,
      supplierSelectKeys,
      itemSelectKeys,
      // allCachSelectObj = {},
      supplierCachSelectObj = {},
      itemCachSelectObj,
    } = this.state;
    const sectionFlag = this.isBidSectionData();

    let validateFlag = true;

    // 格式化数据
    const formatLineData = (source = [], selectedRows = []) => {
      let newDataOfCurrent = [];
      if (isEmpty(source)) {
        return newDataOfCurrent;
      }

      newDataOfCurrent = source.map((item) => {
        const dataFilter = selectedRows.filter(
          (quotationLineId) => quotationLineId === item.quotationLineId
        );
        const isChecked = !isEmpty(dataFilter) ? 1 : 0;
        return {
          ...item,
          bargainSectionSelectedFlag: sectionFlag ? isChecked : 0,
          bargainSelectedFlag: isChecked,
        };
      });
      return newDataOfCurrent;
    };

    let currentData = [];
    let currentTabSelectList = [];
    const selectList = [];
    const unSelectList = [];
    const selectAllPageFlag = this.getSelectedAllPageFlag();
    if (activeKey === 'allDetails') {
      // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1
      currentData = this.AllTableDS.map((record) => {
        if (record.isSelected) {
          return {
            ...record.toData(),
            bargainSectionSelectedFlag: sectionFlag ? 1 : 0, // 多标段下用的勾选
            bargainSelectedFlag: 1,
            selectAllPageFlag,
            sectionSelectAllPageFlag: sectionFlag ? 1 : 0, // 判断是否多标段
          };
        } else {
          return {
            ...record.toData(),
            bargainSectionSelectedFlag: 0,
            bargainSelectedFlag: 0,
            selectAllPageFlag,
            sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
          };
        }
      });

      // 所有勾选行
      this.AllTableDS.selected.forEach((item) => {
        currentTabSelectList.push({
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
      const supplierNew = getEditTableData(supplierLine, ['_status']);
      validateFlag = this.compareArrayLength(supplierLine, supplierNew);
      const filterData = supplierNew.filter((item) => item.supplierCompanyId);
      currentData = formatLineData(filterData, supplierSelectKeys);
      if (type !== 'changePage') {
        // 所有缓存的勾选行 这下面的数据可以做封装
        const keys = Object.keys(supplierCachSelectObj);
        keys.forEach((supplierObj) => {
          for (const key in supplierCachSelectObj[supplierObj]) {
            if (Object.hasOwnProperty.call(supplierCachSelectObj[supplierObj], key)) {
              const element = supplierCachSelectObj[supplierObj][key];
              if (element && element.length) {
                element.forEach((item) => {
                  selectList.push({ ...item, bargainSelectedFlag: 1 });
                });
              }
            }
          }
        });
      }

      currentData = this.markSelectedLine({
        list: currentData,
        keys: supplierSelectKeys,
        id: 'quotationLineId',
      });
      currentTabSelectList = this.markSelectedLine({
        list: selectList,
        keys: supplierSelectKeys,
        id: 'quotationLineId',
      });
    } else {
      const itemLineNew = getEditTableData(itemLine, ['_status']);
      validateFlag = this.compareArrayLength(itemLine, itemLineNew);
      const filterData = itemLineNew.filter((item) => !!item.rfxLineItemId);

      currentData = formatLineData(filterData, itemSelectKeys);
      if (type !== 'changePage') {
        // 所有缓存的勾选行
        const keys = Object.keys(itemCachSelectObj);

        keys.forEach((itemObj) => {
          for (const key in itemCachSelectObj[itemObj]) {
            if (Object.hasOwnProperty.call(itemCachSelectObj[itemObj], key)) {
              const element = itemCachSelectObj[itemObj][key];
              if (element && element.length) {
                element.forEach((item) => {
                  selectList.push({ ...item, bargainSelectedFlag: 1 });
                });
              }
            }
          }
        });
      }

      currentData = this.markSelectedLine({
        list: currentData,
        keys: supplierSelectKeys,
        id: 'quotationLineId',
      });
      currentTabSelectList = this.markSelectedLine({
        list: selectList,
        keys: supplierSelectKeys,
        id: 'quotationLineId',
      });
    }

    if (needStop) {
      if (activeKey === 'allDetails') {
        validateFlag = this.getSelectedAllPageFlag()
          ? this.AllTableDS.totalCount !== this.AllTableDS.unSelected.length
          : this.AllTableDS.selected.length > 0;
      } else if (activeKey === 'supplierList') {
        validateFlag = supplierSelectKeys.length > 0;
      } else {
        validateFlag = itemSelectKeys.length > 0;
      }
    }
    // 如果是线上议价并且已经发起议价，则返回
    // if (!bargainClosedFlag) {
    //   return true;
    // }
    if (!validateFlag) {
      this.setState({
        switchNotification: intl
          .get('ssrc.common.view.message.pleaseToSelectLineSave')
          .d('请必须勾行数据，否则无法保存当前页面信息，是否确认切换页面'),
      });
      return validateFlag;
    }

    // 数据合并
    let integrationData = [...currentTabSelectList, ...currentData];
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

  // 保存-分标段-线上-议价
  onlineSaveOfSection = (needStop = false, lineId, flagALL, page) => {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      organizationId,
      match: { params },
      // [modelName]: {
      //   bargainHeader: { bargainClosedFlag },
      // },
    } = this.props;
    const customizeUnitCode = this.getCurrentCustomeCode();
    const data = this.integrationOnlinePageData(needStop);
    // const filterParams = this.searchComponent?.getQueryParameter() || {};

    // 如果是线上议价并且已经发起议价，则返回true
    // if (!bargainClosedFlag) {
    //   return true;
    // }
    if (isEmpty(data)) {
      return false;
    }
    dispatch({
      type: `${modelName}/handleSaveAllOnline`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxQuotationLines: data,
        customizeUnitCode,
        // filterParams,
      },
    }).then((res) => {
      if (!res) {
        return false;
      }

      this.fetchBaseInfo();
      this.AllTableDS.unSelectAll();
      this.AllTableDS.clearCachedSelected();

      // eslint-disable-next-line no-unused-expressions
      isEmpty(page)
        ? this.refreshSectionLists()
        : this.fetchBargainSupplierOrItem(lineId, flagALL, true, page);
    });

    return true;
  };

  // 点击保存按钮
  onlineSaveOfSectionButton = (
    needStop = false,
    lineId,
    flagALL,
    page,
    way = '',
    otherPayload = {}
  ) => {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      organizationId,
      match: { params },
      // [modelName]: {
      //   bargainHeader: { bargainClosedFlag },
      // },
    } = this.props;
    const customizeUnitCode = this.getCurrentCustomeCode();
    const data = this.integrationOnlinePageData(needStop, 'changePage');
    // const filterParams = this.searchComponent?.getQueryParameter() || {};

    // 如果是线上议价并且已经发起议价，则返回true
    // if (!bargainClosedFlag) {
    //   return true;
    // }
    if (isEmpty(data)) {
      return false;
    }

    const afterOperate = () => {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemLine: [],
          supplierLine: [],
        },
      });

      if (way !== 'changePage') {
        this.setState({
          supplierSelectRows: [],
          supplierSelectKeys: [],
          collapseSupplierActiveKeys: [],
          itemSelectRows: [],
          itemSelectKeys: [],
          collapseItemActiveKeys: [],
        });
      }

      this.AllTableDS.unSelectAll();
      this.AllTableDS.clearCachedSelected();

      // eslint-disable-next-line no-unused-expressions
      isEmpty(page)
        ? this.refreshSectionLists()
        : this.fetchBargainSupplierOrItem(lineId, flagALL, true, page, otherPayload);
    };

    if (way !== 'changePage') {
      dispatch({
        type: `${modelName}/handleSaveAllOnline`,
        payload: {
          ...(otherPayload || {}),
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxQuotationLines: data,
          customizeUnitCode,
          // filterParams,
        },
      }).then((res) => {
        if (!res) {
          return false;
        }

        afterOperate();
      });
    } else {
      afterOperate();
    }

    return true;
  };

  // 线下议价-数据保存前整合
  integrationOfflinePageData = async (needStop = false) => {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const { activeKey } = this.state;

    let validateFlag = true;
    let dataProcess = [];

    // const selectAllPageFlag = this.getSelectedAllPageFlag();
    const sectionFlag = this.isBidSectionData();
    // let currentData = [];
    // const selectList = [];
    // const unSelectList = [];
    if (activeKey === 'allDetails') {
      validateFlag = await this.AllTableDS.validate();

      if (validateFlag) {
        // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1
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
        // this.AllTableDS.selected.forEach((item) => {
        //   selectList.push({
        //     ...item.toData(),
        //     bargainSectionSelectedFlag: sectionFlag ? 1 : 0,
        //     bargainSelectedFlag: 1,
        //     selectAllPageFlag,
        //     sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
        //   });
        // });
        // this.AllTableDS.unSelected.forEach((item) => {
        //   unSelectList.push({
        //     ...item.toData(),
        //     bargainSectionSelectedFlag: 0,
        //     bargainSelectedFlag: 0,
        //     selectAllPageFlag,
        //     sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
        //   });
        // });
        // 数据合并
        dataProcess = (this.AllTableDS.toJSONData() || []).map((item) => {
          return {
            ...item,
            bargainSectionSelectedFlag: sectionFlag ? 1 : 0,
            // selectAllPageFlag: 0,
            sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
          };
        });
        // 跨页全选状态下，传当前页的数据和缓存的数据和手动未勾选的数据给后端，告诉其有几行未勾选，后端不设置勾选值1
        // if (selectAllPageFlag) {
        //   dataProcess = uniqWith([...unSelectList, ...currentData], isEqual);
        // }
      }
      if (!validateFlag) {
        return false;
      }
    } else if (activeKey === 'supplierList') {
      dataProcess = getEditTableData(supplierLine, ['_status']);
      validateFlag = this.compareArrayLength(supplierLine, dataProcess);
    } else {
      dataProcess = getEditTableData(itemLine, ['_status']);
      validateFlag = this.compareArrayLength(itemLine, dataProcess);
    }
    if (needStop && !validateFlag) {
      return;
    }

    const rfxQuotationLines = dataProcess.map((item) => ({
      ...item,
      currentExpiryDateFrom: item.currentExpiryDateFrom
        ? moment(item.currentExpiryDateFrom).format(DEFAULT_DATETIME_FORMAT)
        : null,
      currentExpiryDateTo: item.currentExpiryDateTo
        ? moment(item.currentExpiryDateTo).format(DEFAULT_DATETIME_FORMAT)
        : null,
      currentPromisedDate: item.currentPromisedDate
        ? moment(item.currentPromisedDate).format(DEFAULT_DATETIME_FORMAT)
        : null,
      // taxRate: item?.taxId ? item?.taxRate : null, // lov hidden cause
    }));

    return rfxQuotationLines;
  };

  // 保存-分标段-线下-议价
  offlineSaveOfSection = async (needStop = false, lineId, flagALL, page, otherPayload = {}) => {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { bargainHeader },
    } = this.props;
    const { activeKey } = this.state;
    const { rfxHeaderId } = bargainHeader;
    const customizeUnitCode = this.getCurrentCustomeCode();
    const data = await this.integrationOfflinePageData(needStop);
    if (!data) {
      return false;
    }

    dispatch({
      type: `${modelName}/handleSaveAllOffline`,
      payload: {
        organizationId,
        rfxHeaderId,
        rfxQuotationLines: data,
        customizeUnitCode,
      },
    }).then((res) => {
      if (!res) {
        return false;
      }

      this.fetchBaseInfo();
      this.AllTableDS.unSelectAll();
      this.AllTableDS.clearCachedSelected();
      // eslint-disable-next-line no-unused-expressions
      // isEmpty(page)
      //   ? this.refreshSectionLists()
      //   : this.fetchBargainSupplierOrItem(lineId, flagALL, true, page);
      if (isEmpty(page)) {
        this.setState({
          itemSelectRows: [],
          collapseItemActiveKeys: [],
          supplierSelectRow: [],
          collapseSupplierActiveKeys: [],
        });
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine: [],
            supplierLine: [],
          },
        });
        this.refreshSectionLists();
      } else if (activeKey === 'supplierList') {
        this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave', otherPayload);
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine: [],
          },
        });
        this.setState({ itemSelectRows: [], collapseItemActiveKeys: [] });
      } else {
        this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave');
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            supplierLine: [],
          },
        });
        this.setState({ supplierSelectRow: [], collapseSupplierActiveKeys: [] });
      }
    });

    return true;
  };

  // 格式化数据-判断勾选
  formatLineData = (source = [], selectedRows = []) => {
    let newDataOfCurrent = [];
    if (isEmpty(source)) {
      return newDataOfCurrent;
    }
    const sectionFlag = this.isBidSectionData();

    newDataOfCurrent = source.map((item) => {
      const dataFilter = selectedRows.filter((row) => row.quotationLineId === item.quotationLineId);
      const isChecked = !isEmpty(dataFilter) ? 1 : 0;
      return {
        ...item,
        bargainSectionSelectedFlag: sectionFlag ? isChecked : 0,
        bargainSelectedFlag: isChecked,
      };
    });
    return newDataOfCurrent;
  };

  // 用勾选的key处理保存时需要的数据
  formatLineDataKey = (source = [], selectedRows = []) => {
    let newDataOfCurrent = [];
    if (isEmpty(source)) {
      return newDataOfCurrent;
    }
    const sectionFlag = this.isBidSectionData();

    newDataOfCurrent = source.map((item) => {
      const dataFilter = selectedRows.filter((row) => row === item.quotationLineId);
      const isChecked = !isEmpty(dataFilter) ? 1 : 0;
      return {
        ...item,
        bargainSectionSelectedFlag: sectionFlag ? isChecked : 0,
        bargainSelectedFlag: isChecked,
      };
    });
    return newDataOfCurrent;
  };

  // 操作后-重查当前页面数据
  afterOperateInit = (lineId = null) => {
    const { dispatch, modelName = 'bargain' } = this.props;
    const { activeKey } = this.state;

    if (activeKey === 'allDetails') {
      this.AllTableDS.query(this.AllTableDS.currentPage);
      this.fetchBargainSupplierOrItem(lineId, 1, false);
      this.fetchBargainSupplierOrItem(lineId, 2, false);
    } else if (activeKey === 'supplierList') {
      this.fetchBargainSupplierOrItem(lineId, 1, false);
      this.AllTableDS.query(this.AllTableDS.currentPage);
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemLine: [],
          supplierLine: [],
        },
      });
      this.setState({
        supplierSelectRows: [],
        supplierSelectKeys: [],
        collapseSupplierActiveKeys: [],
      });
    } else {
      this.fetchBargainSupplierOrItem(lineId, 2, false);
      this.AllTableDS.query(this.AllTableDS.currentPage);
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemLine: [],
          supplierLine: [],
        },
      });
      this.setState({ itemSelectRows: [], itemSelectKeys: [], collapseItemActiveKeys: [] });
    }
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
      return [...selectList, ...allList].filter(Boolean);
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
   * 线上保存后操作
   */
  @Bind()
  handleAfterSaveOnline() {
    const { dispatch, modelName = 'bargain' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemLine: [],
        supplierLine: [],
      },
    });
    this.setState({
      supplierSelectRows: [],
      supplierSelectKeys: [],
      collapseSupplierActiveKeys: [],
      itemSelectRows: [],
      itemSelectKeys: [],
      collapseItemActiveKeys: [],
    });
    this.fetchBaseInfo();
    this.AllTableDS.unSelectAll();
    this.AllTableDS.clearCachedSelected();
    this.AllTableDS.query(this.AllTableDS.currentPage);
  }

  /**
   * 保存 / 发起 - 线上
   */
  @Bind()
  @Throttle(1000)
  async bargainOnSaveOnline(type, lineId = '', flagALL, page = {}, way = '', otherPayload = {}) {
    const { remote } = this.props;
    const SectionFlag = this.isBidSectionData(); // 分标段保存逻辑

    if (SectionFlag) {
      this.onlineSaveOfSectionButton(false, lineId, flagALL, page, way, otherPayload);
      return;
    }
    const { modelName = 'bargain' } = this.props;

    const {
      [modelName]: { supplierLine = [], itemLine = [] },
      organizationId,
      dispatch,
      match: { params },
    } = this.props;
    const { activeKey, supplierSelectKeys, itemSelectKeys } = this.state;
    const supplierNew = getEditTableData(supplierLine, ['_status']);
    const itemLineNew = getEditTableData(itemLine, ['_status']);

    let dataProcess = [];
    // let filterParams = {};
    if (activeKey === 'allDetails') {
      const selectAllPageFlag = this.getSelectedAllPageFlag();
      dataProcess = this.getAllData(selectAllPageFlag);
      // filterParams = this.searchComponent?.getQueryParameter();
    } else if (activeKey === 'supplierList') {
      // 处理供应商明细表格数据
      if (type === 'pageSave') {
        const filterData = supplierNew.filter((item) => item.supplierCompanyId === lineId);
        dataProcess = filterData.map((item) => {
          const dataFilter = supplierSelectKeys.filter((data) => data === item.quotationLineId);
          return {
            ...item,
            bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
          };
        });
      } else {
        dataProcess = supplierNew.map((item) => {
          const dataFilter = supplierSelectKeys.filter((data) => data === item.quotationLineId);
          return {
            ...item,
            bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
          };
        });
      }
    } else {
      // 处理物品明细表格数据
      const filterData = itemLineNew.filter((item) => item.rfxLineItemId === lineId);
      dataProcess =
        type === 'pageSave'
          ? this.formatLineDataKey(filterData, itemSelectKeys)
          : this.formatLineDataKey(itemLineNew, itemSelectKeys);
    }

    const customizeUnitCode = this.getCurrentCustomeCode();
    let saveData = {
      organizationId,
      rfxHeaderId: params.rfxId,
      rfxQuotationLines: dataProcess,
      customizeUnitCode,
      // filterParams,
    };

    saveData = remote
      ? await remote.process('SSRC_BARGAIN_BARGAINONSAVEONLINE_SAVE_DATA', saveData, {
          type,
          lineId,
          flagALL,
          page,
          way,
          otherPayload,
          that: this,
        })
      : saveData;

    if (saveData === false) {
      return;
    }

    saveData = saveData || {};

    if (type === 'save') {
      dispatch({
        type: `${modelName}/handleSaveAllOnline`,
        payload: saveData,
      }).then((res) => {
        if (res) {
          notification.success();
          // this.fetchBargainHeader();
          if (activeKey === 'allDetails') {
            // this.fetchBargainSupplierOrItem(lineId, 1, false);  // 去掉查询数据updateState替换，关掉页签，重新打开页签查询
            // this.fetchBargainSupplierOrItem(lineId, 2, false);
            this.handleAfterSaveOnline();
          } else if (activeKey === 'supplierList') {
            // this.fetchBargainSupplierOrItem(lineId, 1, false); // 去掉查询数据updateState替换，关掉页签，重新打开页签查询
            this.handleAfterSaveOnline();
          } else {
            // this.fetchBargainSupplierOrItem(lineId, 2, false); // 去掉查询数据updateState替换，关掉页签，重新打开页签查询
            this.handleAfterSaveOnline();
          }
        }
      });
    } else if (type === 'pageSave') {
      if (activeKey === 'allDetails') {
        this.AllTableDS.query(this.AllTableDS.currentPage);
      } else if (activeKey === 'supplierList') {
        this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave', otherPayload);
        this.setState({ collapseItemActiveKeys: [] });
      } else {
        this.fetchPaginationSupplierOrItem(lineId, flagALL, page, 'pageSave');
      }
    } else {
      // 因为之前写的getEditTable只能拿到当前页面的数据，无法跨页，这里应该把发起和保存分开写
      this.startBargin();
    }
  }

  @Bind()
  startBargin() {
    const {
      organizationId,
      dispatch,
      modelName = 'bargain',
      form: { validateFieldsAndScroll },
      match: { params },
    } = this.props;
    validateFieldsAndScroll({ force: true }, (err, values) => {
      if (!err) {
        const dataProcess = this.integrationOnlinePageData();
        // const filterParams = this.searchComponent?.getQueryParameter() || {};
        // return;
        const { bargainEndDate } = values;
        const endTime = bargainEndDate && bargainEndDate.format(DEFAULT_DATETIME_FORMAT);
        const customizeUnitCode = this.getCurrentCustomeCode();
        dispatch({
          type: `${modelName}/handleStartAll`,
          payload: {
            organizationId,
            bargainEndDate: endTime,
            rfxHeaderId: params.rfxId,
            rfxQuotationLines: dataProcess,
            // filterParams,
            customizeUnitCode,
          },
        }).then((res) => {
          this.onlineEndDateModalCancel();
          if (res) {
            notification.success();
            this.setState({
              itemSelectRows: [],
              itemSelectKeys: [],
              supplierSelectRows: [],
              supplierSelectKeys: [],
              collapseSupplierActiveKeys: [],
              // 清空缓存
              allCachSelectObj: {},
              supplierCachSelectObj: {},
              itemCachSelectObj: {},
            });
            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                itemLine: [],
                supplierLine: [],
              },
            });
            this.AllTableDS.unSelectAll();
            this.AllTableDS.clearCachedSelected();
            this.initData();
          }
        });
      }
    });
  }

  // 数据整合
  @Bind()
  getIntegrationData() {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const {
      activeKey,
      supplierSelectKeys,
      itemSelectKeys,
      // allCachSelectObj = {},
      supplierCachSelectObj = {},
      itemCachSelectObj,
    } = this.state;

    const selectList = [];
    let currentData = [];

    if (activeKey === 'allDetails') {
      // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1
      currentData = this.AllTableDS.map((record) => {
        if (record.isSelected) {
          return {
            ...record.toData(),
            bargainSelectedFlag: 1,
          };
        } else {
          return record.toData();
        }
      });

      // 所有勾选行
      this.AllTableDS.selected.forEach((item) => {
        selectList.push({ ...item.toData(), bargainSelectedFlag: 1 });
      });

      // 所有缓存的勾选行
      // for (const key in allCachSelectObj) {
      //   if (Object.hasOwnProperty.call(allCachSelectObj, key)) {
      //     const element = allCachSelectObj[key];
      //     if (element && element.length) {
      //       element.forEach((item) => {
      //         selectList.push({ ...item, bargainSelectedFlag: 1 });
      //       });
      //     }
      //   }
      // }
    } else if (activeKey === 'supplierList') {
      // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1
      const editData = getEditTableData(supplierLine, ['_status']);
      currentData = editData.map((item) => {
        if (supplierSelectKeys.includes(item.quotationLineId)) {
          return {
            ...item,
            bargainSelectedFlag: 1,
          };
        } else {
          return item;
        }
      });

      // 所有缓存的勾选行
      const keys = Object.keys(supplierCachSelectObj);
      keys.forEach((supplierObj) => {
        for (const key in supplierCachSelectObj[supplierObj]) {
          if (Object.hasOwnProperty.call(supplierCachSelectObj[supplierObj], key)) {
            const element = supplierCachSelectObj[supplierObj][key];
            if (element && element.length) {
              element.forEach((item) => {
                selectList.push({ ...item, bargainSelectedFlag: 1 });
              });
            }
          }
        }
      });
    } else {
      // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1
      const editData = getEditTableData(itemLine, ['_status']);
      currentData = editData.map((item) => {
        if (itemSelectKeys.includes(item.quotationLineId)) {
          return {
            ...item,
            bargainSelectedFlag: 1,
          };
        } else {
          return item;
        }
      });

      // 所有缓存的勾选行
      const keys = Object.keys(itemCachSelectObj);

      keys.forEach((itemObj) => {
        for (const key in itemCachSelectObj[itemObj]) {
          if (Object.hasOwnProperty.call(itemCachSelectObj[itemObj], key)) {
            const element = itemCachSelectObj[itemObj][key];
            if (element && element.length) {
              element.forEach((item) => {
                selectList.push({ ...item, bargainSelectedFlag: 1 });
              });
            }
          }
        }
      });
    }

    // 数据合并
    const integrationData = [...selectList, ...currentData];

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
  }

  // 发起议价-设置截至时间
  onlineStartBargainPriceOk = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      modelName = 'bargain',
      organizationId,
      match: { params },
    } = this.props;
    let endTime = null;
    let validateFlag = true;

    validateFieldsAndScroll({ force: true }, (err, values) => {
      if (err) {
        validateFlag = false;
        return;
      }

      const { bargainEndDate } = values;
      endTime = bargainEndDate && bargainEndDate.format(DEFAULT_DATETIME_FORMAT);
    });

    if (!validateFlag) {
      return;
    }

    const lines = this.integrationOnlinePageData(true);
    if (isEmpty(lines)) {
      return;
    }

    // const filterParams = this.searchComponent?.getQueryParameter() || {};
    const customizeUnitCode = this.getCurrentCustomeCode();

    dispatch({
      type: `${modelName}/handleStartAll`,
      payload: {
        organizationId,
        bargainEndDate: endTime,
        rfxHeaderId: params.rfxId,
        rfxQuotationLines: lines,
        // filterParams,
        customizeUnitCode,
      },
    }).then((res) => {
      this.onlineEndDateModalCancel();
      if (res) {
        notification.success();
        // 清空缓存
        this.setState({
          allCachSelectObj: {},
          supplierCachSelectObj: {},
          itemCachSelectObj: {},
        });

        this.fetchBargainHeader();
      }
    });
  };

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
  @Throttle(1200)
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
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { bargainHeader = {} },
    } = this.props;

    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null, rfxHeaderId } = bargainHeader;
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
          deadlineEventVisible: false,
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

    const { modelName = 'bargain' } = this.props;
    const {
      match: { params },
      history,
      location,
      [modelName]: { bargainHeader = {} },
      remote,
    } = this.props;
    const data = querystring.parse(location.search.substr(1));

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

    const { sourceProjectId: headerSourceProjectId = null } = bargainHeader;
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

    dispatch({
      type: `${modelName}/bargainOnEnd`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleBatchSectionSubmitSucceed();
      }
    });
  };

  /**
   * 完成议价-线下
   */
  @Throttle(1200)
  @Bind()
  bargainOnFinished() {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty } = this.SectionRef;

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
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { bargainHeader = {} },
    } = this.props;

    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null, rfxHeaderId } = bargainHeader;
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
      rfxQuotationLines = await this.integrationOfflinePageData();
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

  // 比较两个数据长度是否相等
  compareArrayLength = (source = [], dataList = []) => {
    let result = true;
    if (!isEmpty(source)) {
      result = source.length === dataList.length;
    }

    return result;
  };

  // 线下完成议价
  handleOfflineFinishBarginPrice = async () => {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      match: { params },
      organizationId,
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const { activeKey } = this.state;
    let validateFlag = true;

    const supplierNew = getEditTableData(supplierLine, ['_status']);
    const itemLineNew = getEditTableData(itemLine, ['_status']);

    let dataProcess = [];
    // const selectAllPageFlag = this.getSelectedAllPageFlag();
    const sectionFlag = this.isBidSectionData();
    // let currentData = [];
    // const selectList = [];
    // const unSelectList = [];
    if (activeKey === 'allDetails') {
      validateFlag = await this.AllTableDS.validate();
      if (validateFlag) {
        // 当前页的数据，勾选的需要赋值bargainSelectedFlag: 1
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
        // this.AllTableDS.selected.forEach((item) => {
        //   selectList.push({
        //     ...item.toData(),
        //     bargainSectionSelectedFlag: sectionFlag ? 1 : 0,
        //     bargainSelectedFlag: 1,
        //     selectAllPageFlag,
        //     sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
        //   });
        // });
        // this.AllTableDS.unSelected.forEach((item) => {
        //   unSelectList.push({
        //     ...item.toData(),
        //     bargainSectionSelectedFlag: 0,
        //     bargainSelectedFlag: 0,
        //     selectAllPageFlag,
        //     sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
        //   });
        // });
        // 数据合并
        dataProcess = (this.AllTableDS.toJSONData() || []).map((item) => {
          return {
            ...item,
            bargainSectionSelectedFlag: sectionFlag ? 1 : 0,
            // selectAllPageFlag: 0,
            sectionSelectAllPageFlag: sectionFlag ? 1 : 0,
          };
        });
        // 跨页全选状态下，传当前页的数据和缓存的数据和手动未勾选的数据给后端，告诉其有几行未勾选，后端不设置勾选值1
        // if (selectAllPageFlag) {
        //   dataProcess = uniqWith([...unSelectList, ...currentData], isEqual);
        // }
      }
    } else if (activeKey === 'supplierList') {
      dataProcess = supplierNew;
      validateFlag = this.compareArrayLength(supplierLine, supplierNew);
    } else {
      dataProcess = itemLineNew;
      validateFlag = this.compareArrayLength(itemLine, itemLineNew);
    }

    if (!validateFlag) {
      return validateFlag;
    }

    const customizeUnitCode = this.getCurrentCustomeCode();

    dispatch({
      type: `${modelName}/bargainOnFinished`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode,
        rfxQuotationLines: dataProcess?.map((item) => ({
          ...item,
          currentExpiryDateFrom: item.currentExpiryDateFrom
            ? moment(item.currentExpiryDateFrom).format(DEFAULT_DATETIME_FORMAT)
            : null,
          currentExpiryDateTo: item.currentExpiryDateTo
            ? moment(item.currentExpiryDateTo).format(DEFAULT_DATETIME_FORMAT)
            : null,
          currentPromisedDate: item.currentPromisedDate
            ? moment(item.currentPromisedDate).format(DEFAULT_DATETIME_FORMAT)
            : null,
          // taxRate: item?.taxId ? item?.taxRate : null, // lov hidden cause
        })),
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSuccessOfflineFinishedBarginPrice();
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
    } = querystring.parse(location.search.substr(1));
    const search = querystring.stringify({
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      sourceHeaderId: rfxId,
      evaluateLeaderFlag,
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
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchSupplierLineBargainPrice(changedPagination);
  }

  /**
   * 物品明细泪飙 - 分页
   */
  @Bind()
  changeItemDetailsPagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchItemDetailsInfo(changedPagination);
  }

  /**
   * fetchBargainSupplierOrItem - 根据flagAll来分别处理供应商列表和物品明细列表数据
   */
  @Bind()
  fetchBargainSupplierOrItem(lineId, flagALL, judge = true, page = {}, otherPayload = {}) {
    const { rfxLineSupplierId, queryParams } = otherPayload || {};
    const { modelName = 'bargain' } = this.props;
    const {
      match: { params },
      dispatch,
      organizationId,
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const { bargainFlag } = this.state;
    const sectionFlag = this.isBidSectionData();

    if (judge) {
      dispatch({
        type: `${modelName}/fetchBargainFullDetails`,
        payload: {
          page,
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxLineSupplierId: flagALL === 1 ? rfxLineSupplierId : null,
          supplierCompanyId: flagALL === 1 ? lineId : null,
          rfxLineItemId: flagALL === 2 ? lineId : null,
          flag: flagALL,
          customizeUnitCode: bargainFlag
            ? `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`
            : `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE,SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
          ...(queryParams || {}),
        },
      }).then((res) => {
        if (res) {
          const keys = [];
          const rows = [];
          if (res.content) {
            res.content.forEach((item) => {
              if (
                item.bargainSelectedFlag === 1 ||
                (item.bargainSectionSelectedFlag && sectionFlag)
              ) {
                keys.push(item.quotationLineId);
                rows.push(item);
              }
            });
          }
          if (flagALL === 1) {
            // if (!isEmpty(supplierLine)) {
            //   supplierLine.forEach((item) => {
            //     if (
            //       item.bargainSelectedFlag === 1 ||
            //       (item.bargainSectionSelectedFlag && sectionFlag)
            //     ) {
            //       keys.push(item.quotationLineId);
            //       rows.push(item);
            //     }
            //   });
            // }
            this.setState({
              loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
              supplierSelectKeys: bargainFlag
                ? [...new Set([...this.state?.supplierSelectKeys, ...keys])]
                : [], // 根据后端标志bargainSelectedFlag设置勾选值
              supplierSelectRows: bargainFlag
                ? uniqWith([...this.state?.supplierSelectRows, ...rows], isEqual)
                : [],
            });
          } else {
            // if (!isEmpty(itemLine)) {
            //   itemLine.forEach((item) => {
            //     if (
            //       item.bargainSelectedFlag === 1 ||
            //       (item.bargainSectionSelectedFlag && sectionFlag)
            //     ) {
            //       keys.push(item.quotationLineId);
            //       rows.push(item);
            //     }
            //   });
            // }
            this.setState({
              loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
              itemSelectKeys: bargainFlag
                ? [...new Set([...this.state?.itemSelectKeys, ...keys])]
                : [], // 根据后端标志bargainSelectedFlag设置勾选值
              itemSelectRows: bargainFlag
                ? uniqWith([...this.state?.itemSelectRows, ...rows], isEqual)
                : [],
            });
          }
        }
      });
    } else {
      if (flagALL === 1) {
        this.setState({ loadingFlag: { [lineId]: { supplierLineBargainLoading: true } } });
      } else {
        this.setState({ loadingFlag: { [lineId]: { itemLineBargainLoading: true } } });
      }
      dispatch({
        type: `${modelName}/fetchBargainDetails`,
        payload: {
          page,
          organizationId,
          rfxHeaderId: params.rfxId,
          supplierCompanyId: flagALL === 1 ? lineId : null,
          rfxLineItemId: flagALL === 2 ? lineId : null,
          rfxLineSupplierId: flagALL === 1 ? rfxLineSupplierId : null,
          flag: flagALL,
          dataSource: flagALL === 1 ? supplierLine : itemLine,
          customizeUnitCode: bargainFlag
            ? [
                `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS`,
                `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`,
              ]
            : [
                `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE`,
                `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
              ],
          ...(queryParams || {}),
        },
      }).then((res) => {
        if (res) {
          if (flagALL === 1) {
            this.setState({
              loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            });
          } else {
            this.setState({
              loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
              pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            });
          }
        }
      });
    }
  }

  /**
   * 展开折叠框查询对应的供应商数据
   */
  @Bind()
  handleCollBack(supplierId, key = [], otherPayload = {}) {
    const { rfxLineSupplierId } = otherPayload || {};
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { supplierLine = [] },
    } = this.props;
    // 判断供应商列表数据是否已经查询过
    let supplierFlag = false;
    if (!isEmpty(supplierLine)) {
      supplierLine.forEach((item) => {
        if (item.rfxLineSupplierId === rfxLineSupplierId) {
          supplierFlag = true;
        }
      });
    }
    if (!supplierFlag) {
      // 判断loading是否加载
      const loadingFlag = {
        [supplierId]: { supplierLineBargainLoading: true },
      };
      this.setState({ loadingFlag });
      this.fetchBargainSupplierOrItem(supplierId, 1, true, {}, otherPayload);
    }
    this.setState({ collapseSupplierActiveKeys: key });
  }

  /**
   * 展开折叠框查询物品明细数据
   */
  @Bind()
  handleItemCallBack(itemId, key) {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { itemLine = [] },
    } = this.props;
    // 判断供应商列表数据是否已经查询过
    let itemFlag = false;
    if (!isEmpty(itemLine)) {
      itemLine.forEach((item) => {
        if (item.rfxLineItemId === itemId) {
          itemFlag = true;
        }
      });
    }
    if (!itemFlag) {
      // 判断loading是否加载
      const loadingFlag = {
        [itemId]: { itemLineBargainLoading: true },
      };
      this.setState({ loadingFlag });
      this.fetchBargainSupplierOrItem(itemId, 2, true);
    }
    this.setState({ collapseItemActiveKeys: key });
  }

  /**
   * 分页查询数据
   */
  @Bind()
  fetchPaginationSupplierOrItem(lineId, flagALL, page = {}, type = '', otherPayload = {}) {
    const { rfxLineSupplierId } = otherPayload || {};
    const { modelName = 'bargain' } = this.props;
    const {
      match: { params },
      dispatch,
      organizationId,
      [modelName]: { supplierLine = [], itemLine = [] },
    } = this.props;
    const { bargainFlag } = this.state;
    const sectionFlag = this.isBidSectionData();
    if (flagALL === 1) {
      this.setState({
        loadingFlag: { [lineId]: { supplierLineBargainLoading: true } },
        currentPage: page,
        pageAll: { ...this.state.pageAll, [lineId]: page.current },
      });
    } else {
      this.setState({
        loadingFlag: { [lineId]: { itemLineBargainLoading: true } },
        currentPage: page,
        pageAll: { ...this.state.pageAll, [lineId]: page.current },
      });
    }
    dispatch({
      type: `${modelName}/fetchBargainDetails`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        supplierCompanyId: flagALL === 1 ? lineId : null,
        rfxLineItemId: flagALL === 2 ? lineId : null,
        rfxLineSupplierId: flagALL === 1 ? rfxLineSupplierId : null,
        flag: flagALL,
        dataSource: flagALL === 1 ? supplierLine : itemLine,
        type,
        customizeUnitCode: bargainFlag
          ? [
              `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS`,
              `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER`,
            ].join(',')
          : [
              `SSRC.${this.sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE`,
              `SSRC.${this.sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
            ].join(','),
      },
    }).then((res) => {
      if (res) {
        const keys = [];
        const rows = [];
        if (res.content) {
          res.content.forEach((item) => {
            if (
              item.bargainSelectedFlag === 1 ||
              (item.bargainSectionSelectedFlag && sectionFlag)
            ) {
              keys.push(item.quotationLineId);
              rows.push(item);
            }
          });
        }
        if (flagALL === 1) {
          const { supplierCachSelectObj = {} } = this.state;
          if (
            supplierCachSelectObj[lineId] &&
            supplierCachSelectObj[lineId][res.number] &&
            !isEmpty(supplierCachSelectObj[lineId][res.number])
          ) {
            const cacheLineKeys = supplierCachSelectObj[lineId][res.number].map(
              (item) => item.quotationLineId
            );
            const newSupplierLine = this.props[modelName]?.supplierLine?.map?.((item) => {
              if (cacheLineKeys.includes(item.quotationLineId)) {
                return supplierCachSelectObj[lineId][res.number].filter(
                  (select) => select.quotationLineId === item.quotationLineId
                )[0];
              } else {
                return { ...item, _status: 'update' };
              }
            });
            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                supplierLine: newSupplierLine,
              },
            });
          }
          this.setState({
            loadingFlag: { [lineId]: { supplierLineBargainLoading: false } },
            pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            supplierSelectKeys: this.state?.bargainFlag
              ? [...new Set([...this.state?.supplierSelectKeys, ...keys])]
              : [], // 线上议价才有勾选，根据后端标志bargainSelectedFlag设置勾选值
            supplierSelectRows: this.state?.bargainFlag
              ? uniqWith([...this.state?.supplierSelectRows, ...rows], isEqual)
              : [],
          });
        } else {
          const { itemCachSelectObj = {} } = this.state;
          if (
            itemCachSelectObj[lineId] &&
            itemCachSelectObj[lineId][res.number] &&
            !isEmpty(itemCachSelectObj[lineId][res.number])
          ) {
            const cacheLineKeys = itemCachSelectObj[lineId][res.number].map(
              (item) => item.quotationLineId
            );
            const newItemLine = this.props[modelName]?.itemLine?.map?.((item) => {
              if (cacheLineKeys.includes(item.quotationLineId)) {
                return itemCachSelectObj[lineId][res.number].filter(
                  (select) => select.quotationLineId === item.quotationLineId
                )[0];
              } else {
                return { ...item, _status: 'update' };
              }
            });
            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                itemLine: newItemLine,
              },
            });
          }
          this.setState({
            loadingFlag: { [lineId]: { itemLineBargainLoading: false } },
            pageSize: { ...this.state.pageSize, [lineId]: res.totalElements },
            itemSelectKeys: this.state?.bargainFlag
              ? [...new Set([...this.state?.itemSelectKeys, ...keys])]
              : [], // 根据后端标志bargainSelectedFlag设置勾选值
            itemSelectRows: this.state?.bargainFlag
              ? uniqWith([...this.state?.itemSelectRows, ...rows], isEqual)
              : [],
          });
        }
      }
    });
  }

  /**
   * 全部报价明细分页切换保存并查询数据 - 线下
   */
  @Bind()
  changeFullInfoPageOffline() {
    this.AllTableDS.query(this.AllTableDS.currentPage);
  }

  /**
   * 线上 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  @Bind()
  changeSupplierPageOnline(page, lineId, flagALL, otherPayload = {}) {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    const { rfxLineSupplierId } = otherPayload || {};

    const currentLineSupplierId = rfxLineSupplierId || lineId;

    const { supplierSelectKeys = [], supplierCachSelectObj = {} } = this.state;
    const currentSelectLine = supplierLine.filter((item) =>
      supplierSelectKeys.includes(item.quotationLineId)
    );

    const cacheLine = getEditTableData(currentSelectLine, ['_status']);
    if (isEmpty(supplierLinePagination)) {
      return;
    }

    const currentLocation = supplierLinePagination[currentLineSupplierId]
      ? supplierLinePagination[currentLineSupplierId].current - 1
      : 0;

    this.setState({
      supplierCachSelectObj: {
        ...supplierCachSelectObj,
        [currentLineSupplierId]: {
          ...supplierCachSelectObj[currentLineSupplierId],
          [currentLocation]: cacheLine,
        },
      },
    });
    // 判断供应商列表数据是否已经查询过
    this.bargainOnSaveOnline('pageSave', lineId, flagALL, page, 'changePage', otherPayload);
  }

  /**
   * 线上 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  @Bind()
  changeItemLinePageOnline(page, lineId, flagALL) {
    if (!lineId) {
      return;
    }

    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { itemLine = [], itemLinePagination = {} },
    } = this.props;
    const { itemSelectKeys = [], itemCachSelectObj = {} } = this.state;
    const currentSelectLine = itemLine.filter((item) =>
      itemSelectKeys.includes(item.quotationLineId)
    );

    const cacheLine = getEditTableData(currentSelectLine, ['_status']);
    const currentLocation = itemLinePagination[lineId] ? itemLinePagination[lineId].current - 1 : 0;

    this.setState({
      itemCachSelectObj: {
        ...itemCachSelectObj,
        [lineId]: {
          ...itemCachSelectObj[lineId],
          [currentLocation]: cacheLine,
        },
      },
    });
    // 判断供应商列表数据是否已经查询过
    this.bargainOnSaveOnline('pageSave', lineId, flagALL, page, 'changePage');
  }

  /**
   * 线下 - 供应商明细列表及物品明细切换分页时，先保存数据
   */
  @Bind()
  changeSupplierOrItemLinePageOffline(page, lineId, flagALL, otherPayload = {}) {
    // 判断供应商列表数据是否已经查询过
    this.bargainOnSaveOffline('pageSave', lineId, flagALL, page, otherPayload);
  }

  /**
   * 批量填写还价
   */
  @Bind()
  handleSaveCounterOffersBulk(values) {
    const { bargainType, bargainPrice, bargainRemark } = values;
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: {
        supplierLine = [],
        itemLine = [],
        supplierLinePagination,
        bargainSupplierLine,
      },
      organizationId,
      match: { params },
      dispatch,
    } = this.props;
    const { activeKey, supplierSelectRows, itemSelectRows, currentLineId } = this.state;
    const supplierNew = getEditTableToData(supplierLine, ['_status']);
    const itemLineNew = getEditTableToData(itemLine, ['_status']);
    let dataProcess = [];
    // let filterParams = {};
    const supplierListParams = {};
    let currentPage = {};

    if (activeKey === 'allDetails') {
      const selectAllPageFlag = this.getSelectedAllPageFlag();
      dataProcess = this.getAllData(selectAllPageFlag);
      // filterParams = this.searchComponent?.getQueryParameter();
    } else if (activeKey === 'supplierList') {
      // 处理供应商列表表格数据
      const filterData = supplierNew.filter((item) => item.supplierCompanyId === currentLineId);
      dataProcess = filterData.map((item) => {
        const dataFilter = supplierSelectRows.filter(
          (data) => data.quotationLineId === item.quotationLineId
        );
        return {
          ...item,
          bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
        };
      });

      bargainSupplierLine.forEach((line) => {
        const { supplierCompanyId, rfxLineSupplierId } = line || {};

        if (supplierCompanyId === currentLineId || rfxLineSupplierId === currentLineId) {
          if (rfxLineSupplierId) {
            currentPage = supplierLinePagination[rfxLineSupplierId] || {};
            supplierListParams.supplierCompanyId = supplierCompanyId;
            supplierListParams.rfxLineSupplierId = rfxLineSupplierId;
          }
        }
      });
    } else {
      // 处理物品明细表格数据
      const filterData = itemLineNew.filter((item) => item.rfxLineItemId === currentLineId);
      dataProcess = filterData.map((item) => {
        const dataFilter = itemSelectRows.filter(
          (data) => data.quotationLineId === item.quotationLineId
        );
        return {
          ...item,
          bargainSelectedFlag: !isEmpty(dataFilter) ? 1 : 0,
        };
      });
    }
    const customizeUnitCode = this.getCurrentCustomeCode();
    dispatch({
      type: `${modelName}/saveCounterOffersBulk`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        bargainType,
        bargainPrice,
        bargainRemark,
        supplierCompanyId: activeKey === 'supplierList' ? currentLineId : null,
        rfxLineItemId: activeKey === 'itemDetails' ? currentLineId : null,
        rfxQuotationLines: dataProcess,
        // filterParams,
        customizeUnitCode,
        ...supplierListParams,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ fillCounteroffersVisible: false, fillCounterModalData: {} });
        if (activeKey === 'allDetails') {
          this.fetchBargainSupplierOrItem(currentLineId, 1, false);
          this.fetchBargainSupplierOrItem(currentLineId, 2, false);
          this.AllTableDS.query();
          this.AllTableDS.unSelectAll();
          this.AllTableDS.clearCachedSelected();
        } else if (activeKey === 'supplierList') {
          // this.supplierLineSelect();
          // 先把当前的 table下每一行record.$form reset  ps: 可以清空data, 但影响性能体验, 不建议
          const filterData = supplierLine.filter(
            (item) => item.supplierCompanyId === currentLineId
          );
          if (!isEmpty(filterData)) {
            filterData.forEach((r) => r?.$form?.resetFields?.());
          }
          this.fetchBargainSupplierOrItem(currentLineId, 1, false, currentPage, {
            queryParams: supplierListParams,
          });
          this.AllTableDS.query();
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              itemLine: [],
            },
          });
          this.setState({ itemSelectRows: [], collapseItemActiveKeys: [] });
        } else {
          // this.itemLineSelect();
          // 先把当前的 table下每一行record.$form reset  ps: 可以清空data, 但影响性能体验, 不建议
          const filterData = itemLine.filter((item) => item.rfxLineItemId === currentLineId);
          if (!isEmpty(filterData)) {
            filterData.forEach((r) => r?.$form?.resetFields?.());
          }
          this.fetchBargainSupplierOrItem(currentLineId, 2, false);
          this.AllTableDS.query();
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              supplierLine: [],
            },
          });
          this.setState({ supplierSelectRows: [], collapseSupplierActiveKeys: [] });
        }
      }
    });
  }

  /**
   * 批量填写价格 - 线下
   */
  @Bind()
  handleSaveCounterOfflineBulk(values) {
    const { bargainType, bargainPrice, bargainRemark } = values;
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: {
        supplierLine = [],
        itemLine = [],
        bargainSupplierLine = [],
        supplierLinePagination = {},
      },
      organizationId,
      match: { params },
      dispatch,
    } = this.props;
    const { activeKey, currentLineId } = this.state;
    const supplierNew = getEditTableToData(supplierLine, ['_status']);
    const itemLineNew = getEditTableToData(itemLine, ['_status']);
    let dataProcess = [];
    const supplierListParams = {};
    let currentPage = {};

    if (activeKey === 'allDetails') {
      // 处理全部报价明细表格数据
      dataProcess = this.AllTableDS.toData();
    } else if (activeKey === 'supplierList') {
      // 处理供应商列表表格数据
      const filterData = [];
      bargainSupplierLine.forEach((line) => {
        const { supplierCompanyId, rfxLineSupplierId } = line || {};

        if (supplierCompanyId === currentLineId || rfxLineSupplierId === currentLineId) {
          currentPage = supplierLinePagination[rfxLineSupplierId || supplierCompanyId] || {};
          if (supplierCompanyId) {
            supplierListParams.supplierCompanyId = supplierCompanyId;
            supplierListParams.rfxLineSupplierId = null;
          }
          if (!supplierCompanyId && rfxLineSupplierId) {
            supplierListParams.supplierCompanyId = null;
            supplierListParams.rfxLineSupplierId = rfxLineSupplierId;
          }
        }
      });

      if (!isEmpty(supplierNew)) {
        supplierNew.forEach((line) => {
          const { supplierCompanyId, rfxLineSupplierId } = line || {};

          if (supplierCompanyId === currentLineId || rfxLineSupplierId === currentLineId) {
            filterData.push(line);

            if (supplierCompanyId) {
              supplierListParams.supplierCompanyId = supplierCompanyId;
            }
            if (!supplierCompanyId && rfxLineSupplierId) {
              supplierListParams.supplierCompanyId = null;
              supplierListParams.rfxLineSupplierId = rfxLineSupplierId;
            }
          }
        });
      }

      dataProcess = filterData;
    } else {
      // 处理物品明细表格数据
      const filterData = itemLineNew.filter((item) => item.rfxLineItemId === currentLineId);
      dataProcess = filterData;
    }

    dispatch({
      type: `${modelName}/saveCounterOffersOffline`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        bargainType,
        bargainPrice,
        bargainRemark,
        supplierCompanyId: activeKey === 'supplierList' ? currentLineId : null,
        rfxLineItemId: activeKey === 'itemDetails' ? currentLineId : null,
        rfxQuotationLines: dataProcess,
        ...supplierListParams,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ fillCounteroffersOfflineVisible: false, fillCounterModalData: {} });
        if (activeKey === 'allDetails') {
          this.AllTableDS.unSelectAll();
          this.AllTableDS.query();
        } else if (activeKey === 'supplierList') {
          // 先把当前的 table下每一行record.$form reset  ps: 可以清空data, 但影响性能体验, 不建议
          const filterData = supplierLine.filter(
            (item) =>
              item.supplierCompanyId === currentLineId || item.rfxLineSupplierId === currentLineId
          );
          if (!isEmpty(filterData)) {
            filterData.forEach((r) => r?.$form?.resetFields?.());
          }
          this.supplierLineSelect();
          this.fetchBargainSupplierOrItem(currentLineId, 1, false, currentPage, {
            queryParams: supplierListParams,
          });
        } else {
          // 先把当前的 table下每一行record.$form reset  ps: 可以清空data, 但影响性能体验, 不建议
          const filterData = itemLine.filter((item) => item.rfxLineItemId === currentLineId);
          if (!isEmpty(filterData)) {
            filterData.forEach((r) => r?.$form?.resetFields?.());
          }
          this.itemLineSelect();
          this.fetchBargainSupplierOrItem(currentLineId, 2, false);
        }
      }
    });
  }

  /**
   * 供应商列表勾选数据
   */
  @Bind()
  supplierLineSelect(keys = [], rows = []) {
    this.setState({
      supplierSelectKeys: keys,
      supplierSelectRows: rows,
    });
  }

  /**
   * 物品明细勾选数据
   */
  @Bind()
  itemLineSelect(keys = [], rows = []) {
    this.setState({
      itemSelectKeys: keys,
      itemSelectRows: rows,
    });
  }

  /**
   * 打开比价助手模态框
   */

  @Bind()
  priceComparisonAssistant() {
    this.setState({ priceComparisonModalVisible: true });
  }

  /**
   * hidePriceComparison - 关闭比价助手弹窗
   */

  @Bind()
  hidePriceComparison() {
    this.setState({
      priceComparisonModalVisible: false,
    });
  }

  /**
   * 打开阶梯报价模态框
   */

  @Bind()
  viewLadderLevelModal(record = {}) {
    const { quotationLineId } = record;
    const data = record.$form ? record.$form.getFieldsValue() : record;
    this.setState(
      {
        viewLadderLevelVisible: true,
        LadderLevelHeaderData: { ...record, ...data },
      },
      () => {
        const { dispatch, organizationId } = this.props;
        dispatch({
          type: 'inquiryHall/fetchBarginLadderLevelyTable',
          payload: { quotationLineId, organizationId },
        });
      }
    );
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */

  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false, LadderLevelHeaderData: {} });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        barginLadderLevelData: [],
      },
    });
    this.afterOperateInit();
  }

  /**
   * saveBarginLadderLine - 保存阶梯还价数据 saveBarginLadderLevelOffline
   */
  @Bind()
  saveBarginLadderLine() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { barginLadderLevelData = [] },
    } = this.props;
    const { bargainFlag = false, LadderLevelHeaderData } = this.state;

    const { quotationLineStatus, supplierStatus, eliminateRoundNumber, supplierCompanyId } =
      LadderLevelHeaderData || {};

    const disabledFlag =
      quotationLineStatus === 'BARGAINED' ||
      quotationLineStatus === 'ABANDONED' ||
      supplierStatus === 'QUOTATION_INVALID' ||
      supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
      eliminateRoundNumber ||
      (bargainFlag && !supplierCompanyId);

    if (disabledFlag) {
      this.setState({
        viewLadderLevelVisible: false,
        LadderLevelHeaderData: {},
      });
      return;
    }

    const newParams = getEditTableData(barginLadderLevelData, ['ladderQuotationId']);
    if (!isEmpty(newParams)) {
      dispatch({
        type: bargainFlag
          ? `inquiryHall/saveBarginLadderLevel`
          : `inquiryHall/saveBarginLadderLevelOffline`,
        payload: { newParams, organizationId },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: 'inquiryHall/fetchBarginLadderLevelyTable',
            payload: { quotationLineId: LadderLevelHeaderData.quotationLineId, organizationId },
          });
        }
      });
    }
  }

  // 更新标段数据
  refreshSectionLists = () => {
    const projectLineSectionId = this.getRouterSearch('projectLineSectionId');
    if (!projectLineSectionId || projectLineSectionId === 'null') {
      return;
    }

    const { refreshSectionAndMain = () => {} } = this.SectionRef || {};
    refreshSectionAndMain();
  };

  // 线上-批量勾选-判断当前页是否勾选-勾选校验
  handleOnlineSectionSelected = () => {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { bargainHeader = {} },
    } = this.props;

    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null, rfxHeaderId = null } = bargainHeader;
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
      rfxQuotationLines = this.integrationOnlinePageData(true);
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
  handleIntegrationSectionBatchStart() {
    const data = this.handleOnlineSectionSelected();

    if (!isEmpty(data)) {
      this.setState({ deadlineEventVisible: true });
    }
  }

  // 线上-分标段-批量发起
  handleOnlineStartSection = (data = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const {
      organizationId,
      form: { validateFieldsAndScroll },
    } = this.props;
    let validateFlag = true;
    let endTime = null;

    validateFieldsAndScroll({ force: true }, (err, values) => {
      if (err) {
        validateFlag = false;
        return;
      }

      const { bargainEndDate } = values;
      endTime = bargainEndDate && bargainEndDate.format(DEFAULT_DATETIME_FORMAT);
    });

    if (!validateFlag) {
      return;
    }

    this.toggleOperationLoading(true);
    const customizeUnitCode = this.getCurrentCustomeCode();
    barginSectionBatchStart({
      organizationId,
      bargainEndDate: endTime,
      customizeUnitCode,
      ...data,
    }).then((res) => {
      const result = getResponse(res);
      this.toggleOperationLoading();
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
        // filterParams: this.searchComponent?.getQueryParameter,
        getSelectedAllPageFlag: this.getSelectedAllPageFlag,
        getAllData: this.getAllData,
        getCurrentCustomeCode: this.getCurrentCustomeCode,
        activeKey,
        setState: this.setState.bind(this),
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
    const {
      // deadlineEventVisible,
      activeKey,
      supplierSelectKeys,
      itemSelectKeys,
    } = this.state;

    let openFlag;
    if (activeKey === 'allDetails') {
      openFlag = this.getSelectedAllPageFlag()
        ? this.AllTableDS.totalCount !== this.AllTableDS.unSelected.length
        : this.AllTableDS.selected.length > 0;
    } else if (activeKey === 'supplierList') {
      openFlag = supplierSelectKeys.length > 0;
    } else {
      openFlag = itemSelectKeys.length > 0;
    }

    /**
     * SSRC_BARGAIN_ONLINESTARTBARGAINPRICE_OPENFLAG  openFlag
     * [XJZC,]
     * */
    openFlag = remote
      ? remote.process('SSRC_BARGAIN_ONLINESTARTBARGAINPRICE_OPENFLAG', openFlag, {})
      : openFlag;

    if (openFlag) {
      this.setState({ deadlineEventVisible: true });
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

    /**
     * SSRC_BARGAIN_VALIDATEALL_VALIDATELIST  validateList
     * [XJZC,]
     * */
    validateList = remote
      ? await remote.process('SSRC_BARGAIN_VALIDATEALL_VALIDATELIST', validateList, {
          allTableDS: this.AllTableDS,
        })
      : validateList;

    return Promise.all(validateList).then((res) => res.every((item) => item));
  }

  /**
   * 线上-发起议价-保存-modal-ok, 此方法被 [华友钴业] 二开, 严禁修改
   * @param {?Object} data - 额外参数, 二开会传递, 请勿删除
   * @protected
   */
  @Throttle(1200)
  @Bind()
  async handleOkOnlineStartBargainPrice(data = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'bargain',
      form: { validateFieldsAndScroll },
      remote,
    } = this.props;
    const { isBatchMaintainSection = false, activeKey } = this.state;
    let validateFlag = true;
    let lines = [];

    if (activeKey === 'allDetails') {
      const flag = await this.validateAll();
      if (!flag) {
        return;
      }
    }

    const { isCheckedSectionListEmpty = () => {}, getCheckedSectionList = () => {} } =
      this.SectionRef || {};
    const isBidSectionData = this.isBidSectionData(); // 分标段
    const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
    let formValuesObj = {};
    validateFieldsAndScroll({ force: true }, (err, values) => {
      if (err) {
        validateFlag = false;
        return;
      }
      formValuesObj = values;
      const { bargainEndDate } = values;
      formValuesObj.bargainEndDate =
        bargainEndDate && bargainEndDate.format(DEFAULT_DATETIME_FORMAT);
    });

    if (!validateFlag) {
      return;
    }

    /**
     * handleOkOnlineStartBargainPrice - lines
     * SSRC_BARGAIN_HANDLEOKONLINESTARTBARGAINPRICE_LINES  lines
     * [XJZC,]
     * */
    lines = this.integrationOnlinePageData(true);
    lines = remote
      ? await remote.process('SSRC_BARGAIN_HANDLEOKONLINESTARTBARGAINPRICE_LINES', lines, {
          allTableDS: this.AllTableDS,
          allProps: this.props,
          allState: this.state,
          isBidSectionData: this.isBidSectionData(),
        })
      : lines;

    if (isEmpty(lines)) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.bargain.selectRowValidateWarning`)
          .d('勾选行校验不通过'),
      });
      return;
    }

    // const filterParams = this.searchComponent?.getQueryParameter() || {};
    const customizeUnitCode = this.getCurrentCustomeCode();

    if (isBidSectionData && isBatchMaintainSection && !checkedFlag) {
      const projectLineSectionList = getCheckedSectionList();
      this.handleOnlineStartSection({
        rfxHeaderId: params.rfxId,
        rfxQuotationLines: lines,
        projectLineSectionList,
        customizeUnitCode,
        // filterParams,
        ...(formValuesObj || {}),
        ...(data || {}),
      });
      return;
    }

    // 发起议价接口
    const startBargain = async (otherPayload) => {
      let allSubmitData = {
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxQuotationLines: lines,
        customizeUnitCode,
        // filterParams,
        otherObj: {
          // 适配额外增加的参数，为了不影响二开，不动接口里的
          ...formValuesObj,
          ...(otherPayload || {}),
        },
        ...(data || {}),
      };

      allSubmitData = remote
        ? await remote.process('SSRC_BARGAIN_BARGAINONLINE_STARTBARGAIN_DATA', allSubmitData, {
            that: this,
          })
        : allSubmitData;

      if (allSubmitData === false) {
        return false;
      }

      allSubmitData = allSubmitData || {};

      return dispatch({
        type: `${modelName}/handleStartAll`,
        payload: allSubmitData,
      });
    };

    // 发起议价成功之后的处理
    const handleSuccessAfterStartBargain = () => {
      this.setState({
        itemSelectRows: [],
        itemSelectKeys: [],
        fullDetailsSelectRows: [],
        fullDetailsSelectKeys: [],
        supplierSelectRows: [],
        supplierSelectKeys: [],
        collapseItemActiveKeys: [],
        collapseSupplierActiveKeys: [],
        // 清空缓存
        allCachSelectObj: {},
        supplierCachSelectObj: {},
        itemCachSelectObj: {},
      });
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemLine: [],
          supplierLine: [],
        },
      });
      this.onlineEndDateModalCancel();
      // this.fetchBargainHeader();

      const projectLineSectionId = this.getRouterSearch('projectLineSectionId');
      if (!projectLineSectionId || projectLineSectionId === 'null') {
        this.fetchBargainHeader();
      } else {
        this.refreshSectionLists();
      }
    };

    startBargain().then((res) => {
      if (getResponse(res)) {
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
      }
    });
  }

  // 线上-发起议价-截至时间-modal-cancel
  onlineEndDateModalCancel = () => {
    const { form } = this.props;
    form.resetFields();

    this.setState({
      deadlineEventVisible: false,
    });
  };

  // 批量填写还价-获取勾选行币种
  getCurrencyCodeFromSelectedLines = (param) => {
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
   * 批量填写还比价 - 线上
   */
  @Bind()
  async handleFillCounteroffers(event, lineId) {
    const { activeKey } = this.state;
    event.stopPropagation();
    if (activeKey === 'allDetails') {
      const { selected: allSelectedData = [] } = this.AllTableDS || {};
      if (allSelectedData?.length > 0) {
        this.setState({
          fillCounteroffersVisible: true,
          currentLineId: lineId,
          fillCounterModalData: {
            quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({ data: allSelectedData }),
          },
        });
      } else {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
            .d('请勾选要批量填写还价的行'),
        });
      }
    }
    if (activeKey === 'supplierList') {
      let supplierData = (await this.integrationOnlinePageData()) || [];
      supplierData = supplierData.filter((line) => !!line.bargainSelectedFlag);
      this.setState({
        fillCounteroffersVisible: true,
        currentLineId: lineId,
        fillCounterModalData: {
          quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({ data: supplierData }),
        },
      });
    }

    if (activeKey === 'itemDetails') {
      let itemData = await this.integrationOnlinePageData();
      itemData = itemData.filter((line) => !!line.bargainSelectedFlag);
      this.setState({
        fillCounteroffersVisible: true,
        currentLineId: lineId,
        fillCounterModalData: {
          quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({ data: itemData }),
        },
      });
    }
  }

  @Bind()
  handleEditCounterOffers(event) {
    event.stopPropagation();
    const { selected: allSelectedData = [] } = this.AllTableDS || {};

    if (!allSelectedData?.length) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
          .d('请勾选要批量填写还价的行'),
      });
    } else {
      this.setState({
        fillCounteroffersVisible: true,
        fillCounterModalData: {
          quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({ data: allSelectedData }),
        },
      });
    }
  }

  @Bind()
  handleCancelCounterOffersBulk() {
    this.setState({ fillCounteroffersVisible: false, fillCounterModalData: {} });
  }

  /**
   * 批量填写价格 - 线下
   */
  @Bind()
  handleFillCounteroffersOffline(event, lineId, data) {
    event.stopPropagation();
    const { currencyCode } = data || {};
    this.setState({
      fillCounteroffersOfflineVisible: true,
      currentLineId: lineId,
      fillCounterModalData: { quotationCurrencyCode: currencyCode },
    });
  }

  @Bind()
  handleCancelCounterOffersOffline() {
    this.setState({ fillCounteroffersOfflineVisible: false, fillCounterModalData: {} });
  }

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

    const { sourceProjectId: headerSourceProjectId = null } = bargainHeader;
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
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { bargainHeader = {} },
    } = this.props;
    const time = bargainHeader.bargainEndDate ? bargainHeader.bargainEndDate : null;
    const now = bargainHeader.currentDateTime ? bargainHeader.currentDateTime : null;
    return (
      <React.Fragment>
        <Row style={{ lineHeight: '40px' }}>
          <Col span={10}>
            <div style={{ display: 'flex' }}>
              <div className={styles['bargain-header']}>
                <Tooltip
                  placement="topLeft"
                  title={`${bargainHeader.rfxNum}-${bargainHeader.rfxTitle}`}
                >
                  {bargainHeader.rfxNum}-{bargainHeader.rfxTitle}
                </Tooltip>
              </div>
              <Tag className={styles['bargain-header-tag-round']}>
                {intl
                  .get(`ssrc.inquiryHall.view.message.commonQuotationRoundInfo`, {
                    round: bargainHeader.quotationRoundNumber || 1,
                    quotationName: getQuotationName(this.sourceKey !== INQUIRY),
                  })
                  .d('第{round}轮{quotationName}')}
              </Tag>
              {bargainHeader.bargainTimes ? (
                <Tag className={styles['bargain-header-tag-bargain']}>
                  {intl
                    .get(`ssrc.common.theRoundBargainNum`, {
                      bargainTimes: bargainHeader.bargainTimes,
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
   * 头部渲染
   */
  @Bind()
  renderHeader() {
    const { modelName = 'bargain', customizeForm, remote } = this.props;
    const {
      [modelName]: { bargainHeader = {} },
      form,
      match: { params },
    } = this.props;
    const { getFieldDecorator } = form;
    const { bargainFlag = false } = this.state;

    const renderProps = {
      form,
      bargainFlag,
      rfxHeaderId: params.rfxId,
      AllTableDS: this.AllTableDS,
    };

    return (
      <React.Fragment>
        <Row>
          <Col
            {...FORM_COL_3_LAYOUT}
            style={{ fontWeight: 500, fontSize: '16px', marginBottom: '15px' }}
          >
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </Col>
        </Row>
        {customizeForm(
          {
            code: `SSRC.${this.sourceKey}_HALL_BARGAIN.HEADER`,
            form: this.props.form,
            dataSource: bargainHeader,
          },
          <Form className={styles['form-style']}>
            <Row type="flex" justify="start" gutter={48} className="read-row-custom">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.commonInquiryHall.RFXNo.`, {
                      categoryCode: getCategoryCode(this.sourceKey === BID),
                    })
                    .d('{categoryCode}单号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxNum', {
                    initialValue: bargainHeader.rfxNum,
                  })(<span>{bargainHeader.rfxNum}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitleRFX`, {
                      documentTypeName: getDocumentTypeName(this.sourceKey === BID),
                    })
                    .d(`{documentTypeName}标题`)}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxTitle', {
                    initialValue: bargainHeader.rfxTitle,
                  })(<span>{bargainHeader.rfxTitle}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.bargain.roundNumber`).d('轮次')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('quotationRoundNumber', {
                    initialValue: bargainHeader.quotationRoundNumber || 1,
                  })(<span>{bargainHeader.quotationRoundNumber || 1}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row type="flex" justify="start" gutter={48} className="read-row-custom">
              <Col {...FORM_COL_3_LAYOUT}>
                {
                  // 【瀚川智能】二开埋点，请勿删除，谨慎修改！！！
                  remote ? remote.render('SSRC_BARGAIN_RENDER_HEADER', <></>, renderProps) : null
                }
              </Col>
            </Row>
          </Form>
        )}
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
        <Col {...FORM_COL_3_LAYOUT} offset={5}>
          <span className={styles.titleRight}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <CountDown sysNow={now} endTime={time} />
            </FormItem>
          </span>
        </Col>
      ) : (
        ''
      )
    );
  }

  /**
   * 附件上传
   */
  @Bind()
  handleAfterOpenModal(checkAttachmentUuid) {
    this.setState({
      bargainAttachmentUuid: checkAttachmentUuid,
    });
  }

  /**
   * uploadSuccess
   * 回调成功传递uuid
   */
  @Bind()
  uploadSuccess() {
    const { dispatch, modelName = 'bargain' } = this.props;
    const {
      organizationId,
      [modelName]: { bargainHeader = {} },
    } = this.props;
    const param = {
      ...bargainHeader,
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
  @Bind()
  disabledDate(current) {
    // Can not select days before today and today
    return current && current < moment().subtract(0, 'days');
  }

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

  // 未税标识
  isTaxPriceFlag = () => {
    const { modelName = 'bargain' } = this.props;
    const {
      [modelName]: { bargainHeader = {} },
    } = this.props;
    const { priceTypeCode } = bargainHeader || {};
    return priceTypeCode && priceTypeCode !== 'NET_PRICE';
  };

  // 改变价格后统一数据处理
  changePriceGetCommonProps = (options = {}) => {
    const { record, uiType = 'c7n-pro' } = options || {};
    const { caclRule, doubleUnitFlag } = this.state;
    const formCurrent = record?.$form;
    if (!record && !formCurrent) {
      return;
    }

    const fields = [
      'taxIncludedFlag',
      'taxRate',
      'currentQuotationQuantity',
      'currentQuotationSecQuantity',
      'quotationCurrencyFinancialPrecision',
      'quotationCurrencyDefaultPrecision',
      'priceBatchQuantity',
      'taxRateType',
    ];

    const {
      taxRate = null,
      taxIncludedFlag = null,
      currentQuotationQuantity = null,
      currentQuotationSecQuantity = null,
      quotationCurrencyFinancialPrecision = null,
      quotationCurrencyDefaultPrecision = null,
      priceBatchQuantity = null,
      taxRateType,
    } = uiType !== 'h0' ? record?.get(fields) || {} : formCurrent.getFieldsValue(fields);
    const { taxRateType: h0TaxRateType = null } = record || {}; // h0需要直接获取

    const taxPriceFlag = this.isTaxPriceFlag();
    const COMMONS = {
      hasTax: taxPriceFlag,
      hasMount: true,
      financialPrecision: quotationCurrencyFinancialPrecision,
      defaultPrecision: quotationCurrencyDefaultPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType: taxRateType || h0TaxRateType,
    };

    if (uiType === 'h0') {
      const {
        priceBatchQuantity: each,
        quotationCurrencyFinancialPrecision: quotationFinancialPrecision,
        quotationCurrencyDefaultPrecision: quotationDefaultPrecision,
      } = record || {};

      COMMONS.each = each;
      COMMONS.financialPrecision = quotationFinancialPrecision;
      COMMONS.defaultPrecision = quotationDefaultPrecision;
    }

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
    const { remote } = this.props;
    const { record, uiType = 'c7n-pro' } = options || {};
    const { doubleUnitFlag } = this.state;
    const formCurrent = record?.$form;
    if (!record && !formCurrent) {
      return;
    }

    const taxIncludeFlag = this.isTaxPriceFlag();

    const lineFields = [
      'currentQuotationPrice',
      'currentQuotationSecPrice',
      'netPrice',
      'netSecondaryPrice',
    ];

    const {
      currentQuotationPrice = null,
      currentQuotationSecPrice = null,
      netPrice = null,
      netSecondaryPrice = null,
    } = uiType !== 'h0' ? record?.get(lineFields) || {} : formCurrent.getFieldsValue(lineFields);

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

    const CalcCommons = remote
      ? remote.process('SSRC_BARGAIN_PROCESS_PRICE_CHANGE_CALCULATE_TAB_TABLE_PROPS', COMMONS, {
          bidFlag: this.sourceKey !== INQUIRY,
          record,
          uiType,
          formCurrent,
        })
      : COMMONS;

    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount, calcTaxUnitPrice } =
      amountCalculation(CalcCommons) || {};

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

    if (uiType === 'h0') {
      formCurrent.setFieldsValue(priceValueObject);
    } else {
      record.set(priceValueObject);
    }
  };

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
    const { bargainFlag = 0 } = this.state;
    let result = true;

    if (bargainFlag) {
      result = await this.onlineSaveOfSection(needStop);
    } else {
      result = await this.offlineSaveOfSection(needStop);
    }
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
    const { modelName = 'bargain', dispatch } = this.props;

    // 切换标段后，原标段打开的供应商/物料折叠卡片需要重置
    this.setState({
      collapseItemActiveKeys: [],
      collapseSupplierActiveKeys: [],
    });

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemLine: [],
        supplierLine: [],
      },
    });
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
    const { sourceHeaderId = null, projectLineSectionId = null, sourceProjectId = null } = data;
    if (!sourceHeaderId) {
      return;
    }

    let newSearch = querystring.parse(search.substr(1));
    const pathname = `${this.activeTabKey}/rfx-bargain/${sourceHeaderId}`;

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
  renderModal() {
    const { deadlineEventVisible } = this.state;
    const { modelName = 'bargain' } = this.props;
    const {
      form,
      customizeForm = noop,
      handleStartAllLoading,
      [modelName]: { bargainHeader = {} },
      form: { getFieldDecorator },
      remote,
    } = this.props;

    let cuxDomBeforeForm = '';
    cuxDomBeforeForm = remote
      ? remote.process('SSRC_BARGAIN_RENDER_BARGAIN_MODAL_BEFORE_FORM', cuxDomBeforeForm, {
          that: this,
          bargainHeader,
        })
      : cuxDomBeforeForm;

    return deadlineEventVisible ? (
      <Modal
        zIndex={900}
        width={500}
        visible={deadlineEventVisible}
        title={intl.get(`ssrc.inquiryHall.model.bargain.bargainDeadline`).d('议价截止时间')}
        onCancel={this.onlineEndDateModalCancel}
        onOk={this.handleOkOnlineStartBargainPrice}
        confirmLoading={handleStartAllLoading}
      >
        {cuxDomBeforeForm}
        {customizeForm(
          {
            code: `SSRC.${this.sourceKey}_HALL_BARGAIN.START_ONLINE_BARGAIN`,
            form,
            dataSource: bargainHeader,
          },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl
                    .get(`ssrc.inquiryHall.model.bargain.bargainDeadline`)
                    .d('议价截止时间')}
                >
                  {getFieldDecorator('bargainEndDate', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.bargain.bargainDeadline`)
                            .d('议价截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      showTime
                      placeholder=""
                      format={getDateTimeFormat()}
                      disabledDate={this.disabledDate}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`ssrc.inquiryHall.model.bargain.reasonToBargain`).d('议价理由')}
                >
                  {getFieldDecorator(
                    'bargainRemark',
                    remote
                      ? remote.process(
                          'SSRC_BARGAIN_RENDER_BARGAIN_MODAL_BARGAIN_REMARK_RULES',
                          {},
                          {
                            that: this,
                            bargainHeader,
                          }
                        )
                      : {}
                  )(<Input.TextArea style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    ) : null;
  }

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchScoreDetail',
      payload: {
        organizationId,
        evaluateSummaryId: record.evaluateSummaryId,
      },
    });
  }

  @Bind()
  viewScoreDetail(e, data) {
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

    this.fetchScoreDetil(data);
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
    this.handleAfterSaveOnline();

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      this.fetchUserConfig();
    }
  }

  /**
   * 线上全部报价明细
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  renderAll = (allProps) => {
    return this.sourceKey === BID ? <AllBid {...allProps} /> : <All {...allProps} />;
  };

  /**
   * 线下全部报价明细
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  renderAllOffline = (allOffinleProps) => {
    return this.sourceKey === BID ? (
      <AllBidOffline {...allOffinleProps} />
    ) : (
      <AllOffLine {...allOffinleProps} />
    );
  };

  // 永祥二开--线上议价tab页
  @Bind()
  renderOnlineTab(activeKey, allProps, supplierListProps, itemDetailsProps) {
    const { customizeTabPane = () => {} } = this.props;

    return customizeTabPane(
      {
        code: `SSRC.${this.sourceKey}_HALL_BARGAIN.TABS_ONLINE`,
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
          {/* <FullQuoteDetails {...fullQuoteDetailsProps} /> */}
        </TabPane>
        <TabPane
          tab={intl.get(`ssrc.inquiryHall.view.tab.supplierList`).d('供应商列表')}
          key="supplierList"
        >
          <SupplierList {...supplierListProps} />
        </TabPane>
        <TabPane
          tab={intl.get(`ssrc.inquiryHall.view.tab.itemDetails`).d('物品明细')}
          key="itemDetails"
        >
          <ItemDetails {...itemDetailsProps} />
        </TabPane>
      </Tabs>
    );
  }

  /**
   * 获取筛选器数据
   */
  @Bind()
  handleGetFormValue() {
    const formValues = this.searchComponent?.getQueryParameter?.() || {};
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
    const { modelName = 'bargain', dispatch } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemLine: [],
        supplierLine: [],
      },
    });
    this.setState({
      collapseSupplierActiveKeys: [],
      collapseItemActiveKeys: [],
    });
    this.fetchBargainHeader();
  }

  /**
   * 此方法泸州老窖重写customizeForm
   */
  @Bind()
  renderHeaderButtons() {
    const { modelName = 'bargain' } = this.props;
    const {
      handleSaveAllLoading,
      handleSaveAllOfflineLoading,
      bargainOnFinishedLoading,
      endLoading,
      organizationId,
      headerLoading,
      match,
      [modelName]: { bargainHeader = {} },
      customizeBtnGroup = () => {},
      remote,
      allLoading = false,
    } = this.props;
    const {
      operationLoading = false,
      bargainFlag,
      isBatchMaintainSection = false,
      headerGroupButtonMaxNum = -1,
    } = this.state;

    const { params } = match;
    const { rfxId } = params;

    const isBidSectionData = this.isBidSectionData(); // 是否分标段且标段数据存在

    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag, bargainClosedFlag } = bargainHeader || {};
    const priceComparisonProps = {
      rfxId: match.params.rfxId,
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
          onClick: () => this.bargainOnSaveOnline('save'),
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
              ...(this.searchComponent?.getQueryParameter?.() || {}),
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
          loading: bargainOnFinishedLoading || operationLoading || headerLoading || allLoading,
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
          loading: handleSaveAllOfflineLoading || operationLoading || headerLoading || allLoading,
          onClick: () => this.bargainOnSaveOffline('save'),
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
            // icon: '',
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
      ? remote.process('SSRC_BARGAIN_PROCESS_ONLINE_BARGAIN_HEADER_BUTTONS', onLineBargainButtons, {
          bidFlag: this.sourceKey !== INQUIRY,
          bargainHeader,
          handleAfterSaveOnline: this.handleAfterSaveOnline,
          bargainClosedFlag, // 是否处于议价中 0是 1否
          rfxId,
          that: this,
        })
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

  render() {
    const { modelName = 'bargain' } = this.props;
    const {
      dispatch,
      match,
      organizationId,
      [modelName]: {
        bargainHeader = {},
        bargainSupplierLine = [],
        bargainSupplierLinePagination = {},
        supplierLine = [],
        supplierLinePagination = {},
        bargainItemLine = [],
        bargainItemLinePagination = {},
        itemLine = [],
        itemLinePagination = {},
      },
      inquiryHall: {
        code: { bargainType, bargainTypeOffline },
        barginLadderLevelData = [],
        operationPagination,
        operationData,
        scoreDetailList = {},
      },
      fetchItemDetailsInfoLoading,
      saveCounterOffersBulkLoading,
      saveCounterOffersOfflineLoading,
      fetchSupplierLineBargainLoading,
      saveBarginLadderLevelLoading,
      fetchBarginLadderLevelyTableLoading,
      headerLoading = false,
      handleSaveAllLoading = false,
      handleSaveAllOfflineLoading = false,
      customizeTable,
      customizeTabPane = () => {},
      fetchScoreDetailLoading,
      remote,
    } = this.props;

    const {
      activeKey,
      doubleUnitFlag,
      fillCounteroffersVisible,
      fillCounterModalData,
      fillCounteroffersOfflineVisible,
      // fillCounteroffersFlag,
      viewLadderLevelVisible,
      pageSize,
      LadderLevelHeaderData, // 阶梯报价头部数据
      collapseSupplierActiveKeys = [],
      collapseItemActiveKeys = [],
      loadingFlag = {},
      supplierSelectKeys = [],
      supplierSelectRows = [],
      itemSelectKeys = [],
      itemSelectRows = [],
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
    const { rfxId } = params;

    // 供应商列表勾选数据
    const supplierSelection = {
      selectedRowKeys: supplierSelectKeys,
      selectedRows: supplierSelectRows,
      onChange: this.supplierLineSelect,
      getCheckboxProps: (record) => {
        const flag =
          record.quotationLineStatus === 'BARGAINED' ||
          record.quotationLineStatus === 'ABANDONED' ||
          record.supplierStatus === 'QUOTATION_INVALID' ||
          record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
          record.eliminateRoundNumber ||
          record.offLineQuotationFlag === 1 ||
          (bargainFlag && !record.supplierCompanyId);
        return {
          disabled: remote
            ? remote.process('SSRC_BARGAIN_PROCESS_SUPPLIER_CHECK', flag, {
                record,
                bidFlag: this.sourceKey === 'BID',
              })
            : flag,
        };
      },
    };

    // 物品明细勾选数据
    const itemSelection = {
      selectedRowKeys: itemSelectKeys,
      selectedRows: itemSelectRows,
      onChange: this.itemLineSelect,
      getCheckboxProps: (record) => {
        const flag =
          record.quotationLineStatus === 'BARGAINED' ||
          record.quotationLineStatus === 'ABANDONED' ||
          record.supplierStatus === 'QUOTATION_INVALID' ||
          record.supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
          record.eliminateRoundNumber ||
          record.offLineQuotationFlag === 1 ||
          (bargainFlag && !record.supplierCompanyId);
        return {
          disabled: remote
            ? remote.process('SSRC_BARGAIN_PROCESS_ITEM_CHECK', flag, {
                record,
                bidFlag: this.sourceKey === 'BID',
              })
            : flag,
        };
      },
    };

    // 全部报价明细
    const allProps = {
      doubleUnitFlag,
      rfxHeaderId: rfxId,
      sourceKey: this.sourceKey,
      AllTableDS: this.AllTableDS,
      onSearchBarRef: (node) => {
        this.searchComponent = node || {};
      },
      handleEditCounterOffers: this.handleEditCounterOffers,
      bargainFlag,
      newQuotationFlag,
      remote,
      bargainHeader,
    };

    // 全部报价明细线下
    const allOffinleProps = {
      ...allProps,
      isOfflineFlag: true,
      bargainHeader,
      dynamicChangePrice: this.dynamicChangePrice,
    };

    // 供应商列表
    const supplierListProps = {
      bargainFlag,
      loadingFlag,
      doubleUnitFlag,
      newQuotationFlag,
      customizeTable,
      sourceKey: this.sourceKey,
      supplierSelectKeys,
      collapseSupplierActiveKeys,
      pageSize,
      organizationId,
      LadderLevelHeaderData,
      viewLadderLevelVisible,
      barginLadderLevelData,
      fetchSupplierLineBargainLoading,
      headerInfo: bargainSupplierLine,
      saveLoading: saveBarginLadderLevelLoading,
      headerPagination: bargainSupplierLinePagination,
      handleCollBack: this.handleCollBack,
      dataSource: supplierLine,
      pagination: supplierLinePagination,
      onSearch: this.changeSupplierPageOnline,
      barSelectSupplierLine: supplierSelection,
      onChangePagination: this.changeItemLinePagination,
      fillCounterSupplier: this.handleFillCounteroffers,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      fetchLoading: fetchBarginLadderLevelyTableLoading,
      showQuotationDetail: this.showQuotationDetail,
      viewScoreDetail: this.viewScoreDetail,
      bargainHeader,
      remote,
      parentInstance: this,
    };

    // 评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
      loading: fetchScoreDetailLoading,
    };

    // 供应商列表 - 线下
    const supplierListOfflineProps = {
      loadingFlag,
      pageSize,
      doubleUnitFlag,
      newQuotationFlag,
      organizationId,
      customizeTable,
      viewLadderLevelVisible,
      supplierSelectKeys,
      barginLadderLevelData,
      LadderLevelHeaderData,
      sourceKey: this.sourceKey,
      saveLoading: saveBarginLadderLevelLoading,
      collapseSupplierActiveKeys,
      fetchSupplierLineBargainLoading,
      headerInfo: bargainSupplierLine,
      bargainHeader,
      headerPagination: bargainSupplierLinePagination,
      handleCollBack: this.handleCollBack,
      onSearch: this.changeSupplierOrItemLinePageOffline,
      dataSource: supplierLine,
      pagination: supplierLinePagination,
      onChangePagination: this.changeItemLinePagination,
      fillCounterSupplier: this.handleFillCounteroffersOffline,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      fetchLoading: fetchBarginLadderLevelyTableLoading,
      bargainFlag,
      remote,
      dynamicChangePrice: this.dynamicChangePrice,
    };

    // 物品明细
    const itemDetailsProps = {
      loadingFlag,
      bargainFlag,
      doubleUnitFlag,
      newQuotationFlag,
      itemSelectKeys,
      collapseItemActiveKeys,
      pageSize,
      organizationId,
      customizeTable,
      sourceKey: this.sourceKey,
      headerInfo: bargainItemLine,
      fetchItemDetailsInfoLoading,
      headerPagination: bargainItemLinePagination,
      onChangePagination: this.changeItemDetailsPagination,
      handleItemCallBack: this.handleItemCallBack,
      onSearch: this.changeItemLinePageOnline,
      dataSource: itemLine,
      pagination: itemLinePagination,
      barSelectItemLine: itemSelection,
      fillCounterItem: this.handleFillCounteroffers,
      viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      barginLadderLevelData,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading: saveBarginLadderLevelLoading,
      fetchLoading: fetchBarginLadderLevelyTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      remote,
      bargainHeader,
    };

    // 物品明细 - 线下
    const itemDetailsOfflineProps = {
      loadingFlag,
      doubleUnitFlag,
      fetchItemDetailsInfoLoading,
      itemSelectKeys,
      pageSize,
      organizationId,
      customizeTable,
      sourceKey: this.sourceKey,
      collapseItemActiveKeys,
      headerInfo: bargainItemLine,
      headerPagination: bargainItemLinePagination,
      onChangePagination: this.changeItemDetailsPagination,
      onSearch: this.changeSupplierOrItemLinePageOffline,
      handleItemCallBack: this.handleItemCallBack,
      dataSource: itemLine,
      pagination: itemLinePagination,
      barSelectItemLine: itemSelection,
      viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      barginLadderLevelData,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      LadderLevelHeaderData,
      saveLoading: saveBarginLadderLevelLoading,
      fetchLoading: fetchBarginLadderLevelyTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      bargainHeader,
      newQuotationFlag,
      remote,
      dynamicChangePrice: this.dynamicChangePrice,
    };

    // 批量填写还价 - 线上
    const counterOffersBulkProps = {
      bargainType,
      visible: fillCounteroffersVisible,
      saveLoading: saveCounterOffersBulkLoading,
      onSave: this.handleSaveCounterOffersBulk,
      onCancel: this.handleCancelCounterOffersBulk,
      modalData: fillCounterModalData,
    };

    // 批量填写还价 - 线下
    const counterOffersBulkOfflineProps = {
      bargainType: bargainTypeOffline,
      visible: fillCounteroffersOfflineVisible,
      saveLoading: saveCounterOffersOfflineLoading,
      onSave: this.handleSaveCounterOfflineBulk,
      onCancel: this.handleCancelCounterOffersOffline,
      type: 'BARGAIN_OFFLINE',
      modalData: fillCounterModalData,
    };

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
        <Spin
          spinning={
            handleSaveAllLoading || handleSaveAllOfflineLoading || operationLoading || headerLoading
          }
        >
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
                    style={{ paddingBottom: 0 }}
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
                    {this.renderPageContent(
                      bargainFlag
                        ? this.renderOnlineTab(
                            activeKey,
                            allProps,
                            supplierListProps,
                            itemDetailsProps
                          )
                        : customizeTabPane(
                            {
                              code: `SSRC.${this.sourceKey}_HALL_BARGAIN.TABS_OFFLINE`,
                              custDefaultActive: this.changeActiveKey,
                            },
                            <Tabs
                              defaultActiveKey="allDetails"
                              animated={false}
                              onChange={this.changeActiveKey}
                            >
                              <TabPane
                                tab={intl
                                  .get(`ssrc.inquiryHall.view.tab.allQuotationDetails`)
                                  .d('全部报价明细')}
                                key="allDetails"
                              >
                                {this.renderAllOffline(allOffinleProps)}
                                {/* <FullQuoteDetailsOffline {...fullQuoteDetailsOfflineProps} /> */}
                              </TabPane>
                              <TabPane
                                tab={intl
                                  .get(`ssrc.inquiryHall.view.tab.supplierList`)
                                  .d('供应商列表')}
                                key="supplierList"
                              >
                                <SupplierListOffline {...supplierListOfflineProps} />
                              </TabPane>
                              <TabPane
                                tab={intl
                                  .get(`ssrc.inquiryHall.view.tab.itemDetails`)
                                  .d('物品明细')}
                                key="itemDetails"
                              >
                                <ItemDetailsOffline {...itemDetailsOfflineProps} />
                              </TabPane>
                            </Tabs>
                          )
                    )}
                  </div>
                </TopSection>
              </div>
            </SectionPanel>
          </div>
        </Spin>
        {/* {priceComparisonModalVisible && this.renderPriceComparison(priceComparisonProps)} */}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {fillCounteroffersVisible && <CounterOffersBulk {...counterOffersBulkProps} />}
        {fillCounteroffersOfflineVisible && (
          <CounterOffersBulk {...counterOffersBulkOfflineProps} />
        )}
        {this.renderModal()}
        {batchEmptySelectSectionFlag && <BatchEmptySelectedModal {...BatchProps} />}
        {operateSectionPromptFlag && <OperateSectionPromptModal {...operateSectionPrompt} />}
        {scoreDetailModalVisible && <ScoreDetailModal {...scoreDetailProps} />}
      </div>
    );
  }
}

const HOCComponent = Form.create({ fieldNameProp: null })(
  withCustomize({
    unitCode: [
      // 'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION',
      // 'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
      'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS',
      'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
      'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER', // 成本备注
      'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER_OFFLINE',
      'SSRC.INQUIRY_HALL_BARGAIN.TABS_OFFLINE', // 线下议价详情-TAB页
      'SSRC.INQUIRY_HALL_BARGAIN.ONLINE_BTNS', // 线上议价头按钮组
      'SSRC.INQUIRY_HALL_BARGAIN.START_ONLINE_BARGAIN', // 发起议价弹框
      'SSRC.INQUIRY_HALL_BARGAIN.HEADER', // 线上议价头
    ],
  })(
    connect(({ inquiryHall, bargain, loading }) => ({
      inquiryHall,
      bargain,
      allLoading: loading.global,
      headerLoading: loading.effects['bargain/fetchBargainHeader'],
      supplierLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
      itemLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
      saveCounterOffersBulkLoading: loading.effects['bargain/saveCounterOffersBulk'],
      saveCounterOffersOfflineLoading: loading.effects['bargain/saveCounterOffersOffline'],
      handleSaveAllLoading: loading.effects['bargain/handleSaveAllOnline'],
      fetchSupplierLineBargainLoading: loading.effects['bargain/fetchSupplierLineBargainPrice'],
      fetchItemDetailsInfoLoading: loading.effects['bargain/fetchItemDetailsInfo'],
      saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
      fetchBarginLadderLevelyTableLoading:
        loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
      fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
      handleSaveAllOfflineLoading: loading.effects['bargain/handleSaveAllOffline'],
      handleStartAllLoading: loading.effects['bargain/handleStartAll'],
      bargainOnFinishedLoading: loading.effects['bargain/bargainOnFinished'],
      endLoading: loading.effects['bargain/bargainOnEnd'],
      organizationId: getCurrentOrganizationId(),
    }))(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.bidHall',
          'hzero.common',
          'ssrc.supplierQuotation',
          'ssrc.offlineResultEntry',
          'ssrc.common',
          'ssrc.priceLibraryNew',
          'ssrc.rf',
          'sscux.ssrc',
        ],
      })(
        remoteHoc(
          {
            code: 'SSRC_BARGAIN',
            name: 'remote',
          },
          {
            events: {
              handleGetBackPath(props = {}) {
                const { getBackPath = noop, ...otherParams } = props || {};
                getBackPath(otherParams);
              },
              handleJumpOnlineSucceed(props = {}) {
                const { jumpOnlineSucceed = noop } = props || {};
                jumpOnlineSucceed(props);
              },
              handleJumpOfflineSucceed(props = {}) {
                const { jumpOfflineSucceed = noop } = props || {};
                jumpOfflineSucceed(props);
              },
              handleRemoteAfterFetchSupplierLineBargainPrice() {},
            },
          }
        )(observer(Bargain))
      )
    )
  )
);

const hocBargain = (NewComponent) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        // 'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION',
        // 'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS',
        'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER', // 成本备注
        'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.TABS_OFFLINE', // 线下议价详情-TAB页
        'SSRC.INQUIRY_HALL_BARGAIN.TABS_ONLINE', // 线上议价详情-TAB页
        'SSRC.INQUIRY_HALL_BARGAIN.ONLINE_BTNS', // 线上议价头按钮组
        'SSRC.INQUIRY_HALL_BARGAIN.START_ONLINE_BARGAIN', // 发起议价弹框
        'SSRC.INQUIRY_HALL_BARGAIN.HEADER', // 线上议价头
        'SSRC.INQUIRY_HALL_BARGAIN.HEADER_INFO', // 头信息卡片
        'SSRC.INQUIRY_HALL_BARGAIN.BASE_INFO_CARD', // 基本信息卡片
        'SSRC.INQUIRY_HALL_BARGAIN.QUTATION_TABLE_CARD', // 报价明细表格卡片
        'SSRC.INQUIRY_HALL_BARGAIN.OFFLINE_BTNS', // 线下议价-头按钮
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.bidHall',
          'hzero.common',
          'ssrc.supplierQuotation',
          'ssrc.offlineResultEntry',
          'ssrc.common',
          'ssrc.priceLibraryNew',
          'ssrc.rf',
          'ssrc.scux',
          'sscux.ssrc',
        ],
      })(
        connect(({ inquiryHall, bargain, loading }) => ({
          inquiryHall,
          bargain,
          allLoading: loading.global,
          headerLoading: loading.effects['bargain/fetchBargainHeader'],
          supplierLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
          itemLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
          saveCounterOffersBulkLoading: loading.effects['bargain/saveCounterOffersBulk'],
          saveCounterOffersOfflineLoading: loading.effects['bargain/saveCounterOffersOffline'],
          handleSaveAllLoading: loading.effects['bargain/handleSaveAllOnline'],
          fetchSupplierLineBargainLoading: loading.effects['bargain/fetchSupplierLineBargainPrice'],
          fetchItemDetailsInfoLoading: loading.effects['bargain/fetchItemDetailsInfo'],
          saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
          fetchBarginLadderLevelyTableLoading:
            loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
          fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
          handleSaveAllOfflineLoading: loading.effects['bargain/handleSaveAllOffline'],
          handleStartAllLoading: loading.effects['bargain/handleStartAll'],
          bargainOnFinishedLoading: loading.effects['bargain/bargainOnFinished'],
          endLoading: loading.effects['bargain/bargainOnEnd'],
          organizationId: getCurrentOrganizationId(),
        }))(
          remoteHoc(
            {
              code: 'SSRC_BARGAIN',
              name: 'remote',
            },
            {
              events: {
                beforeInitPageCuxHandle() {},
                handleGetBackPath(props = {}) {
                  const { getBackPath = noop, ...otherParams } = props || {};
                  getBackPath(otherParams);
                },
                handleJumpOnlineSucceed(props = {}) {
                  const { jumpOnlineSucceed = noop } = props || {};
                  jumpOnlineSucceed(props);
                },
                handleJumpOfflineSucceed(props = {}) {
                  const { jumpOfflineSucceed = noop } = props || {};
                  jumpOfflineSucceed(props);
                },
                beforeJump() {},
                handleRemoteAfterFetchSupplierLineBargainPrice() {},
              },
            }
          )(observer(NewComponent))
        )
      )
    )
  );
};
export default HOCComponent;
export { Bargain, HOCComponent as HOCBargain, hocBargain };
