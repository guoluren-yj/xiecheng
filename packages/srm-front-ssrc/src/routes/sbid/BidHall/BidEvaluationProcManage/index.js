/**
 * 招标大厅 - 招标过程管理
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import {
  Row,
  Col,
  Form,
  Tabs,
  Tag,
  Popover,
  Button,
  Modal,
  Select,
  Tooltip,
  Spin,
  Badge,
} from 'hzero-ui';
import { Bind, Throttle, debounce } from 'lodash-decorators';
import classnames from 'classnames';
import querystring from 'querystring';
import moment from 'moment';
import { isFunction, isEmpty, compose, noop, isNil } from 'lodash';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { getActiveTabKey, updateTab } from 'utils/menuTab';

import { Header, Content } from 'components/Page';
import BidEvaluationProcess from '@/routes/sbid/components/BidEvaluationProcess';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import remote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
  SEARCH_FORM_ITEM_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
} from 'utils/constants';
import { getCategoryCode, getDocumentTypeName, BID } from '@/utils/globalVariable';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

import common from '@/routes/sbid/common.less';
import bidView from '@/assets/bid-view.svg';
import expertIcon from '@/assets/expert.svg';
import supplierIcon from '@/assets/supplier.svg';
import fileIcon from '@/assets/file-grey.svg';
import moneyBook from '@/assets/money-book.svg';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import QuoteAttachment from '@/routes/ssrc/SupplierQuotation/InquiryPrice/QuoteAttachment';
import RoundQuotationAllTable from '@/routes/share/RoundQuotationAllTable/';
import BidRoundQuotationAllTable from '@/routes/share/RoundQuotationAllTable/BidIndex';
import CPopover from '@/routes/components/CPopover';
import SSU from '@/routes/components/SessionStorageUrl';
import SVGIcon from '@/routes/components/SvgIcon';
import PriceClarificationButtons from '@/routes/sbid/ExpertScoring/Update/PriceClarificationButtons';
import EliminateInquiry from '@/routes/ssrc/InquiryHall/EliminateInquiry';
import PriceComparison from '@/routes/ssrc/components/PriceComparison';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import ScoreEntryButton from '@/routes/sbid/BidHall/BidEvaluationProcManage/ScoreEntryButton';

import SectionPanel from '@/routes/components/SectionPanel';
import BatchEmptySelectedModal from '@/routes/components/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';

import {
  fetchInquiryHallUserMemory as fetchUserConfigBatch,
  fetchNewBidEnable,
} from '@/services/inquiryHallNewService';
import { validateModal } from '@/routes/components/ConfirmModal';
import {
  batchCreateNewRoundQuotation,
  batchSureRoundQuotationEnd,
  validateRoundQuotationEnd,
} from '@/services/inquiryHallService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';

import { FIlESIZE } from '@/utils/SsrcRegx';
import { queryEnableDoubleUnit, queryH0OrC7N } from '@/services/commonService';
import { isText } from '@/utils/utils';
import Iconfont from '../../../ssrc/components/Icons'; // 下载至本地的icon
import OpenBid from './OpenBid';
import NewQuotationModel from './newQuotationModel';

import Styles from './index.less';

const FormItem = Form.Item;

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

class BidEvaluationProcManage extends Component {
  constructor(props) {
    super(props);
    this.initState(props, 'init');
  }

  activeTabKey = getActiveTabKey();

  /**
   * 初始化state
   * @param {Obejct} props - 组件props
   * @param {boolean} isInit - 是否初始化
   */
  initState(props, isInit) {
    const routerParams = querystring.parse(props.location.search.substr(1));
    const {
      backRecommend = '',
      sourceFrom = '',
      sourceHeaderId = 0,
      cachTabKey = '',
      sourceStatus = 'SCORING',
      sourcePage = null,
      evaluateLeaderFlag,
      roundQuotationRule,
      menuTitle = '',
    } = routerParams;

    const state = {
      sourceStatus, // 评分状态
      supplierDimension: {},
      activeKey: '',
      menuTitle, //  菜单名称
      cachTabKey, // 页面返回backpath标记
      supplierFlag: true, // 单条数据控制切换供应商|专家模块
      attachmentVisible: false,
      AttachmentsProps: {},
      backRecommend, // 专家评分跳转标记
      sourceFrom, // 页面跳转的来源 BID/RFX
      sourceHeaderId,
      startNewQuotationVisible: false, // 发起新一轮报价modal
      onlineBargainVisible: false, // 议价方式的弹窗
      sourcePage, // 页面跳转来源标识
      evaluateLeaderFlag, // 评分负责人标识
      roundQuotationRule,
      routerParams,
      eliminateVisible: false, // 淘汰单据
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
      priceComparisonModalVisible: false, // 比价助手模态框
      doubleUnitFlag: false, // 双单位标识
      openBargainLoading: false, // 选择议价方式弹框确定按钮loading
      startNewQuoBtnLoading: false, // 发起新一轮报价确定按钮loading
      newQuotationFlag: 0, // 启用新报价标识
      endQuotationLoading: false, // 确定终轮报价结束loading
      bidOpeningNewFlag: false, // 专家评分开标是否开启新功能
    };
    this.bidFlag =
      routerParams?.secondarySourceCategory === 'NEW_BID' || this.props.sourceKey === BID;

    if (isInit) {
      this.state = state;
    } else {
      this.setState(state, this.initQuery);
    }
  }

  componentDidMount() {
    const isSection = this.getBidSectionFlag();

    if (isSection) {
      return;
    }

    this.initQuery();
    this.fetchUserConfig();
    this.fetchRemoteCuxData();
    this.fetchBidOpeningBlackConfig();
  }

  @Bind()
  queryMain = () => {
    this.initQuery();
    this.fetchUserConfig();
  };

  // 查询专家评分开标是否开启新功能, 不在在该配置表中的租户默认走新功能
  @Bind()
  async fetchBidOpeningBlackConfig() {
    try {
      const { organizationId } = this.props;
      const data = await fetchNewBidEnable({ organizationId });
      if (getResponse(data)) {
        this.setState({ bidOpeningNewFlag: !!data });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 二开需要在组件挂载时处理数据的方法
   * @protected
   */
  @Bind()
  fetchRemoteCuxData() {
    const { sourceFrom = '' } = this.state;
    const {
      remote: remoteFunc,
      match: { params },
    } = this.props;
    if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('handleFetchRemoteData', {
        that: this,
        sourceFrom,
        sourceHeaderId: params.sourceHeaderId,
      });
    }
  }

  @Bind()
  pubRouterAddParams() {
    const {
      location: { search },
    } = this.props;
    const routerParam = querystring.parse(search.substr(1));
    const { permissionFilterFlag } = routerParam;
    if (permissionFilterFlag === '1') {
      return { permissionFilterFlag: 1 };
    } else {
      return { permissionFilterFlag: 0 };
    }
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { match: { params: prevParams } = {}, location: { search: prevSearch } = {} } =
      prevProps || {};
    const { match: { params = {} } = {}, location: { search } = {} } = this.props;
    const { sourceStatus: prevSourceStatus } =
      querystring.parse((prevSearch || '').substr(1)) || {};
    const { sourceStatus } = querystring.parse((search || '').substr(1)) || {};

    const prevId = prevParams.sourceHeaderId || null;
    const id = params.sourceHeaderId || null;
    const flag = prevId !== id || prevSourceStatus !== sourceStatus; // 仅变更了sourceStatus, 页面需要重新变更

    return flag;
  }

  componentDidUpdate(_, prevState = {}, snapshot = false) {
    if (snapshot) {
      // 此刻代表 `replace route`
      this.initState(this.props);

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

  /**
   * 数据初始化
   */
  @Bind()
  initQuery() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const { sourceFrom = '', sourceStatus = '' } = this.state;
    this.fetchBidEvalProgress();
    if (sourceFrom === 'RFX' && sourceStatus !== 'ROUND_QUOTATION') {
      this.fetchHeaderInfo();
    }

    if (sourceFrom === 'RFX' && sourceStatus === 'ROUND_QUOTATION') {
      this.fetchRfxHeader();
    }

    if (['RFI', 'RFP'].includes(sourceFrom)) {
      this.fetchRFScoreHeader();
    }

    this.fetchBidEvaluateExpertScoring();
    this.fetchSupplierDimensionList();
    const lovCodes = {
      sourceType: 'SSRC.BARGAIN_METHOD', // 议价方式
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();
    this.fetchH0OrC7N();
  }

  // 查询用户配置
  @Bind()
  async fetchUserConfig() {
    const { organizationId } = this.props;
    let data = {};

    try {
      data = await fetchUserConfigBatch({
        organizationId,
        userId: getCurrentUserId(),
        configKeys: [
          'sectionEvaluationStartNerRoundQuotation',
          'sectionEvaluationEndNerRoundQuotation',
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

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const rfxHeaderId = params.sourceHeaderId;
    if (!rfxHeaderId) {
      return;
    }

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        this.setState({
          newQuotationFlag: result,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  // 查询是否启用c7n版功能
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj =
        res.find((item) => item.function === 'Bargaining_switch_C7N' && item.whiteFlag === '1') ||
        {}; // 议价
      this.setState({
        bargainNewFlag: !isEmpty(bargainObj),
      });
    }
  };

  // 双单位标识查询
  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  // 更换路由, replace route, 初始化数据, 放置在 `componentDidUpdate`
  @Bind()
  replaceRoute(record = {}) {
    if (isEmpty(record)) {
      return;
    }

    const { dispatch } = this.props;
    const { sourceHeaderId = null } = record;
    const search = this.getDirectSearch(record);

    // 区分数据来源
    dispatch(
      routerRedux.replace({
        pathname: `${this.activeTabKey}/rfx-evaluation-proc-manage/${sourceHeaderId}`,
        search,
      })
    );
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        bidEvalProgress: [],
        bidEvaluateExpertScoringList: [],
        header: {},
        headerInfo: {},
      },
    });
  }

  /**
   * 简单头信息查询
   */
  @Bind()
  async fetchHeaderInfo() {
    const { organizationId, dispatch, modelName = 'inquiryHall' } = this.props;
    const { sourceHeaderId } = this.state;
    return dispatch({
      type: `${modelName}/fetchHeaderInfo`,
      payload: {
        organizationId,
        rfxHeaderId: sourceHeaderId,
      },
    });
  }

  /**
   * 查询寻源单头信息
   * */
  @Bind()
  async fetchRfxHeader() {
    const { dispatch, modelName = 'inquiryHall', organizationId } = this.props;
    const { sourceFrom = '', sourceHeaderId = null } = this.state;
    await dispatch({
      type:
        modelName === 'bidHall'
          ? 'bidHall/fetchBidHeaderDetail'
          : `${modelName}/fetchInquiryHeaderDetail`,
      payload: {
        organizationId,
        sourceFrom,
        rfxHeaderId: sourceHeaderId,
        customizeUnitCode: this.bidFlag
          ? 'SSRC.BID_HALL_ROUND_QUOTATION.HEADER_FROM'
          : 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.HEADER_FROM',
      },
    });

    // 查询多轮报价数据 --- 保证头查询结束
    if (isFunction(this.roundQuotationAllTable?.initData)) {
      // eslint-disable-next-line no-unused-expressions
      this.roundQuotationAllTable?.initData();
    }
  }

  /**
   * 查询I/P头信息
   */
  @Bind()
  async fetchRFScoreHeader() {
    const { dispatch, modelName = 'inquiryHall', organizationId } = this.props;
    const { sourceHeaderId = null } = this.state;
    try {
      dispatch({
        type: `${modelName}/fetchRFScoreHeader`,
        payload: { organizationId, sourceHeaderId },
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询供应商维度数据
   *
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  fetchSupplierDimensionList() {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;

    dispatch({
      type: `${modelName}/querySupplierDimensionList`,
      payload: {
        organizationId,
        sourceHeaderId: this.state.sourceHeaderId,
        sourceFrom: this.state.sourceFrom,
      },
    });
  }

  /**
   * 招标管理 - 步骤
   *
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  fetchBidEvalProgress() {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchBidEvalProgress`,
      payload: {
        organizationId,
        sourceHeaderId: this.state.sourceHeaderId,
        sourceFrom: this.state.sourceFrom,
      },
    });
  }

  /**
   * 招标管理 获取专家
   *
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  fetchBidEvaluateExpertScoring() {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchBidEvaluateExpertScoring`,
      payload: {
        organizationId,
        sourceHeaderId: this.state.sourceHeaderId,
        sourceFrom: this.state.sourceFrom,
      },
    }).then((res) => {
      if (!res || !Array.isArray(res) || !res.length) {
        return;
      }

      this.setState({
        activeKey: String(res[0].bidLineItemId),
      });
    });
  }

  /**
   * 跳转到招标详情时带参
   */
  @Bind()
  getDirectSearch(record) {
    const { backRecommend } = this.state;
    const {
      sourceHeaderId = '',
      sourceFrom = '',
      sourceStatus = '',
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = record;
    const { cachTabKey = null } = this.getRouterParams() || {};

    const search = querystring.stringify({
      backRecommend,
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });
    return search;
  }

  /**
   * 跳转到招标详情
   *
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  directBidDetail(header) {
    const {
      dispatch,
      // modelName = 'bidHall',
      match: { params },
    } = this.props;
    const {
      sourceFrom = '',
      sourceHeaderId,
      backRecommend,
      cachTabKey,
      sourceStatus,
      evaluateLeaderFlag,
    } = this.state;
    const { projectLineSectionId = null, sourceProjectId = null } = this.getRouterParams();

    if (sourceFrom === 'BID') {
      const search = SSU.jsonStringify({
        backRecommend: 'BidEvaluateBidHallDetail',
        projectLineSectionId,
        sourceProjectId,
      });
      dispatch(
        routerRedux.push({
          pathname: `${this.activeTabKey}/bid-detail/${sourceHeaderId}`,
          search,
        })
      );
      SSU.storeUrl(
        'BidEvaluateBidHallDetail',
        `${this.activeTabKey}/bid-evaluation-proc-manage/${params.bidId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&projectLineSectionId=${projectLineSectionId}&sourceProjectId=${sourceProjectId}`,
        this.activeTabKey
      );
    } else if (sourceFrom === 'RFX') {
      const search = SSU.jsonStringify({
        backRecommend: 'BidEvaluateInquiryHallDetail',
      });
      dispatch(
        routerRedux.push({
          pathname: `${this.activeTabKey}/${
            header.secondarySourceCategory === 'NEW_BID' ? 'new-bid' : 'rfx'
          }-detail/${sourceHeaderId}`,
          search,
        })
      );
      SSU.storeUrl(
        'BidEvaluateInquiryHallDetail',
        `${this.activeTabKey}/rfx-evaluation-proc-manage/${params.sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&evaluateLeaderFlag=${evaluateLeaderFlag}&projectLineSectionId=${projectLineSectionId}&sourceProjectId=${sourceProjectId}`,
        this.activeTabKey
      );
    } else if (sourceFrom === 'RFP' || sourceFrom === 'RFI') {
      const search = SSU.jsonStringify({
        backRecommend: 'BidEvaluateRFDetail',
      });
      dispatch(
        routerRedux.push({
          pathname: `${this.activeTabKey}/rf-detail/${sourceFrom}/${sourceHeaderId}`,
          search,
        })
      );
      SSU.storeUrl(
        'BidEvaluateRFDetail',
        `${this.activeTabKey}/rfx-evaluation-proc-manage/${params.sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&evaluateLeaderFlag=${evaluateLeaderFlag}&projectLineSectionId=${projectLineSectionId}&sourceProjectId=${sourceProjectId}`,
        this.activeTabKey
      );
    } else {
      return null;
    }
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Popover content={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Popover>
    );
  };

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false });
  }
  /**
   * showUploadModal - 打开头附件上传弹窗
   */

  @Bind()
  showUploadModal(record = {}) {
    /**
     * 先商务后技术：评分负责人在商务评分中、商务标评分汇总节点仅可查看商务标附件；在后续的节点可查看到商务标和技术标附件；
     * 先技术后商务：评分负责人在技术评分中、技术标评分汇总节点仅可查看技术标附件；在后续的节点可查看到商务标和技术标附件；
     * 同时评标：评分负责人在评标过程管理界面任意节点，可以查看到供应商的商务标、技术标附件；
     * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
     * 技术评分中 - TECHNOLOGY_SCORING/TECHNOLOGY_SCORING_RFX
     * 技术评分确认汇总 - TECHNOLOGY_SUMMARY/TECHNOLOGY_SUMMARY_RFX
     * 商务评分中 - BUSINESS_SCORING/BUSINESS_SCORING_RFX
     * 商务评分确认汇总 - BUSINESS_SUMMARY/BUSINESS_SUMMARY_RFX
     * 推荐成交候选人 - PRE_EVALUATION_PENDING_RFX
     * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
     * 先技术后商务 - TECH_FIRST
     * 先商务后技术 - BUSINESS_FIRST
     * 同时评标 - SYNC
     */
    if (!record) {
      return;
    }

    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { header = {}, headerInfo = {}, bidEvalProgress = [] },
    } = this.props;
    const { openBidOrder } = isEmpty(header) ? headerInfo : header;
    const currentProgress = bidEvalProgress && bidEvalProgress.find((n) => n.isCurrentFlag === 1); // 当前进度
    const { progressName = '' } = currentProgress || {};

    const {
      businessAttachmentUuid = null,
      techAttachmentUuid = null,
      bargainBusinessAttachmentUuid = null, // 议价中商务附件
      bargainTechAttachmentUuid = null, // 议价中技术附件
      roundBusinessAttachmentUuid = null, // 多轮报价商务附件
      roundTechAttachmentUuid = null, // 多轮报价技术附件
    } = record || {};

    const othersUuid = {
      bargainBusUuid: bargainBusinessAttachmentUuid,
      roundBusUuid: roundBusinessAttachmentUuid,
      bargainTechUuid: bargainTechAttachmentUuid,
      roundTechUuid: roundTechAttachmentUuid,
      showBusinessAttachment: !this.reviewPendingAndHidePriceFlag(),
    };

    let businessUuid = businessAttachmentUuid;
    let techUuid = techAttachmentUuid;

    switch (openBidOrder) {
      case 'TECH_FIRST':
        if (
          progressName.startsWith('TECHNOLOGY_SCORING') ||
          progressName.startsWith('TECHNOLOGY_SUMMARY')
        ) {
          businessUuid = null;
          othersUuid.bargainBusUuid = null;
          othersUuid.roundBusUuid = null;
        }
        if (
          progressName.startsWith('BUSINESS_SCORING') ||
          progressName.startsWith('BUSINESS_SUMMARY')
        ) {
          techUuid = null;
          othersUuid.bargainTechUuid = null;
          othersUuid.roundTechUuid = null;
        }
        break;
      case 'BUSINESS_FIRST':
        if (
          progressName.startsWith('BUSINESS_SCORING') ||
          progressName.startsWith('BUSINESS_SUMMARY')
        ) {
          techUuid = null;
          othersUuid.bargainTechUuid = null;
          othersUuid.roundTechUuid = null;
        }
        if (
          progressName.startsWith('TECHNOLOGY_SCORING') ||
          progressName.startsWith('TECHNOLOGY_SUMMARY')
        ) {
          businessUuid = null;
          othersUuid.bargainBusUuid = null;
          othersUuid.roundBusUuid = null;
        }
        break;
      default:
        break;
    }
    const { sourceFrom = '' } = this.state;
    let bucketDirectory = '';
    if (sourceFrom === 'BID') {
      bucketDirectory = 'ssrc-rfx-quotationheader';
    } else if (sourceFrom === 'RFX') {
      bucketDirectory = 'ssrc-rfx-quotationline';
    }

    this.setState({
      AttachmentsProps: {
        record,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory,
        viewOnly: true,
        businessUuid,
        techUuid,
        fileSize: FIlESIZE,
        ...othersUuid,
      },
      attachmentVisible: true,
    });
  }

  /**
   * 评审澄清
   *
   * @param item
   */

  @Bind()
  reviewClarification(val) {
    const { quotationHeaderId = 0 } = val;
    const { sourceFrom = 'BID', sourceHeaderId = 0, sourceStatus = '' } = this.state;
    const {
      location: { pathname = '', search: searchData = '' },
    } = this.props;
    const { history } = this.props;
    const search = querystring.stringify({
      quotationHeaderId,
      sourceFrom,
      fromFlag: 1,
      sourceHeaderId,
      backPath: `${pathname}${searchData}`,
      sourceStatus,
    });

    const routerPrefix = pathname.split('/')[2];
    const routerName = sourceFrom === 'BID' ? 'bid' : 'rfx';
    history.push({
      pathname: `/ssrc/${routerPrefix}/${routerName}-review-clarification`,
      search,
    });
  }

  /**
   * tabs切换回调
   *
   * @param activeKey
   * @memberof BidEvaluationProcManage
   */

  @Bind()
  handleTabsChange(activeKey) {
    this.setState({
      activeKey,
    });
  }

  /**
   * 多条数据切换维度
   *
   *@memberof BidEvaluationProcManage
   */
  @Bind()
  switchDimension() {
    const { activeKey, supplierDimension } = this.state;
    this.setState({
      supplierDimension: {
        ...supplierDimension,
        ...{ [activeKey]: supplierDimension[activeKey] ? !supplierDimension[activeKey] : true },
      },
    });
  }

  /**
   * 单条数据切换维度
   *
   *@memberof BidEvaluationProcManage
   */
  @Bind()
  switchTo() {
    const { supplierFlag } = this.state;
    this.setState({
      supplierFlag: !supplierFlag,
    });
  }

  /**
   * 专家- 评分状态
   *
   * @param {*} status
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  renderStatusTag(data = {}) {
    if (!data) {
      return null;
    }

    const { scoredStatus = '' } = data;

    return (
      <React.Fragment>
        {scoredStatus === 'NEW' && (
          <Tag color="rgba(255, 188, 0, 0.2)">
            <span style={{ color: 'rgb(255, 188, 0)' }}>
              {intl.get(`ssrc.bidHall.bidHall.view.button.unScored`).d('未评分')}
            </span>
          </Tag>
        )}
        {scoredStatus === 'RESCORING' && (
          <Tag color="rgba(255, 188, 0, 0.2)">
            <span style={{ color: 'rgb(255, 188, 0)' }}>
              {intl.get(`ssrc.bidHall.model.bidHall.reScore	`).d('重新评分')}
            </span>
          </Tag>
        )}
        {scoredStatus !== 'NEW' && scoredStatus !== 'RESCORING' && (
          <Tag color="rgba(6, 135, 255, 0.2)">
            <span style={{ color: 'rgb(6, 135, 255)' }}>
              {intl.get(`ssrc.bidHall.bidHall.view.button.hasScored`).d('已评分')}
            </span>
          </Tag>
        )}
      </React.Fragment>
    );
  }

  /**
   * 符合性检查 - 评分状态
   *
   * @param {*} status
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  renderReviewStatusTag(data = {}) {
    if (!data) {
      return null;
    }

    const { reviewScoredStatus = '' } = data;

    return (
      <React.Fragment>
        {reviewScoredStatus === 'NEW' && (
          <Tag color="rgba(255, 188, 0, 0.2)">
            <span style={{ color: 'rgb(255, 188, 0)' }}>
              {intl.get(`ssrc.bidHall.bidHall.view.button.unScored`).d('未评分')}
            </span>
          </Tag>
        )}
        {reviewScoredStatus === 'RESCORING' && (
          <Tag color="rgba(255, 188, 0, 0.2)">
            <span style={{ color: 'rgb(255, 188, 0)' }}>
              {intl.get(`ssrc.bidHall.model.bidHall.reScore	`).d('重新评分')}
            </span>
          </Tag>
        )}
        {reviewScoredStatus !== 'NEW' && reviewScoredStatus !== 'RESCORING' && (
          <Tag color="rgba(6, 135, 255, 0.2)">
            <span style={{ color: 'rgb(6, 135, 255)' }}>
              {intl.get(`ssrc.bidHall.bidHall.view.button.hasScored`).d('已评分')}
            </span>
          </Tag>
        )}
      </React.Fragment>
    );
  }

  /**
   * 渲染标段下专家表
   *
   * @param {*} [data={}]
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  renderExpertList(dataList = []) {
    if (!Array.isArray(dataList) || !dataList.length) {
      return (
        <div style={{ color: '#ccc', textAlign: 'center' }}>
          {intl.get(`ssrc.bidHall.view.message.warning．emptyData`).d('数据为空')}
        </div>
      );
    }
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { bidEvalProgress = [] },
      remote: remoteFunc,
      history,
    } = this.props;
    const { progressName = '' } = bidEvalProgress.find((item) => item.isCurrentFlag === 1) || {};
    const cuxSpan =
      remoteFunc &&
      remoteFunc.render('SSRC_EVALUATION_PROC_MANAGE_RENDER_SUPPLIER_BUSS_DEVIATE_ROWITEM', null, {
        history,
        progressName,
      });
    return (
      <React.Fragment>
        {dataList.map((data) => (
          <Row
            gutter={12}
            align="bottom"
            key={data.expertUserId}
            style={{ lineHeight: '36px', marginBottom: '12px' }}
          >
            <Col span={6}>
              <img
                style={{ paddingRight: '10px' }}
                src={expertIcon}
                alt={intl.get(`ssrc.bidHall.view.message.title.expert`).d('专家')}
              />
              {data.loginName ? `${data.loginName} - ` : ''}
              {data.expertName || ''}
            </Col>
            <Col span={4}>{data.teamMeaning || ''}</Col>
            <Col span={5}>
              {progressName === 'INITIAL_REVIEW_SCORING_RFX'
                ? this.renderReviewStatusTag(data)
                : this.renderStatusTag(data)}
            </Col>
            <Col span={cuxSpan ? 2 : 3}>
              {data.expertLevelMeaning ? (
                <span>
                  {intl.get(`ssrc.bidHall.model.bidHall.expertLevel`).d('专家级别')}-
                  {data.expertLevelMeaning}
                </span>
              ) : (
                ''
              )}
            </Col>
            <Col span={cuxSpan ? 3 : 4}>
              {data.expertTypeMeaning ? (
                <span>
                  {intl.get(`ssrc.bidHall.model.bidHall.expertType`).d('专家类型')}-
                  {data.expertTypeMeaning}
                </span>
              ) : (
                ''
              )}
            </Col>
            {remoteFunc
              ? remoteFunc.render(
                  'SSRC_EVALUATION_PROC_MANAGE_RENDER_SUPPLIER_BUSS_DEVIATE_ROWITEM',
                  null,
                  { history, progressName, data }
                )
              : null}
          </Row>
        ))}
      </React.Fragment>
    );
  }

  /**
   * rfp供应商行附件
   */
  @Bind()
  openUploadModal(record = {}) {
    const { organizationId } = this.props;
    C7nModal.open({
      title: intl.get('hzero.common.upload.modal.title').d('附件'),
      footer: null,
      closable: true,
      style: {
        width: '720px',
      },
      children: (
        <Fragment>
          <Row>
            <Col span={12}>
              <h3>
                {intl.get('ssrc.expertScoring.view.card.subtitle.techAttach').d('技术组附件')}
              </h3>
              <Upload
                filePreview
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rf-quotationheader"
                attachmentUUID={record.techAttachmentUuid}
                tenantId={organizationId}
              />
            </Col>
            <Col span={12}>
              <h3>
                {intl.get('ssrc.expertScoring.view.card.subtitle.businessAttach').d('商务组附件')}
              </h3>
              <Upload
                filePreview
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rf-quotationheader"
                attachmentUUID={record.businessAttachmentUuid}
                tenantId={organizationId}
              />
            </Col>
          </Row>
        </Fragment>
      ),
    });
  }

  /**
   * 渲染标段下供应商表
   *
   * @param {*} [data={}]
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  renderSupplier(data = []) {
    if (!data || !data.supplierList || !data.supplierList.length) {
      return (
        <div style={{ color: '#ccc', textAlign: 'center' }}>
          {intl.get(`ssrc.bidHall.view.message.warning.noData`).d('没有数据')}
        </div>
      );
    }

    const { sourceFrom = '', newQuotationFlag = false, sourceStatus } = this.state;
    const { organizationId, remote: remoteFunc } = this.props;

    return (
      <React.Fragment>
        {data.supplierList.map((item) => {
          return (
            <div key={item.quotationHeaderId}>
              <Row gutter={12} align="bottom" style={{ lineHeight: '36px', marginBottom: '12px' }}>
                <Col span={6} className={common['ssrc-text-ellipsis']}>
                  <img src={supplierIcon} alt="" style={{ paddingRight: '10px' }} />
                  <CPopover
                    content={
                      <>
                        {item.supplierCompanyNum
                          ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                          : item.supplierCompanyName}
                        {remoteFunc
                          ? remoteFunc.render(
                              'SSRC_EVALUATION_PROC_MANAGE_RENDER_SUPPLIER_BUSS_DEVIATE_POPOVER',
                              null,
                              {
                                supplier: item,
                              }
                            )
                          : null}
                      </>
                    }
                  >
                    {item.supplierCompanyNum
                      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                      : item.supplierCompanyName}
                    {remoteFunc
                      ? remoteFunc.render(
                          'SSRC_EVALUATION_PROC_MANAGE_RENDER_SUPPLIER_BUSS_DEVIATE',
                          null,
                          {
                            supplier: item,
                          }
                        )
                      : null}
                  </CPopover>
                </Col>
                <Col span={5} className={common['ssrc-text-ellipsis']}>
                  <CPopover content={item.contactName}>
                    {item.contactName ? item.contactName : ''}
                  </CPopover>
                </Col>
                <Col span={2}>{item.contactMobilephone ? item.contactMobilephone : ''}</Col>
                <Col span={6}>{item.contactMail ? item.contactMail : ''}</Col>
                <Col span={2}>
                  {sourceFrom === 'RFP' && (
                    <a onClick={() => this.openUploadModal(item)}>
                      {' '}
                      <span>{intl.get(`ssrc.bidHall.view.message.attachment`).d('附件')}</span>
                      <span style={{ marginLeft: '7px' }}>
                        <img src={fileIcon} alt="" />
                      </span>
                    </a>
                  )}
                  {sourceFrom === 'RFI' && (
                    <Upload
                      filePreview
                      viewOnly
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rf-quotationheader"
                      attachmentUUID={item.rfiAttachmentUuid}
                      tenantId={organizationId}
                      btnText={intl.get(`hzero.common.upload.modal.title`).d('附件')}
                    />
                  )}
                  {(sourceFrom === 'RFX' || sourceFrom === 'BID') && (
                    <span>
                      {!newQuotationFlag ? (
                        <a onClick={() => this.showUploadModal(item)}>
                          {' '}
                          <span>
                            {intl.get(`ssrc.bidHall.view.message.attachment`).d('附件')}
                            <RenderFileTotalCount record={item} uiType="h0" />
                          </span>
                          <span style={{ marginLeft: '7px' }}>
                            <img src={fileIcon} alt="" />
                          </span>
                        </a>
                      ) : (
                        <FileGroup
                          record={item}
                          uiType="h0"
                          fileType="HEADER"
                          hideBusinessAttachment={this.reviewPendingAndHidePriceFlag()}
                          queryParams={{
                            expertSummaryProcessQueryFlag: 1,
                            sourceStatus,
                          }}
                        />
                      )}
                    </span>
                  )}
                </Col>
                {this.getClarifyButton(item)}
              </Row>
            </div>
          );
        })}
      </React.Fragment>
    );
  }

  // 评审澄清按钮
  getClarifyButton = (item) => {
    const { modelName = 'bidHall' } = this.props;
    const {
      remote: remoteFunc,
      [modelName]: { header = {}, headerInfo = {} },
    } = this.props;
    const { sourceStatus } = this.state;
    const renderProps = {
      /* 需要传递的自定义渲染属性 */
      header,
      headerInfo,
      sourceStatus,
    };

    const reviewClarifyBtn = (
      <Col offset={1} span={2}>
        <Tooltip
          title={intl
            .get(`ssrc.bidHall.model.expertScoring.reviewClarifiedNotify`)
            .d('适用于供应商投标文件中存在含义不明，前后表述不一致，需供应商解答问题的情况')}
        >
          <Badge count={item.reviewUnreadCount} className={Styles['badge-item']}>
            <Button type="primary" onClick={() => this.reviewClarification(item)}>
              {intl.get(`ssrc.bidHall.view.button.reviewClarified`).d('评审澄清')}
            </Button>
          </Badge>
        </Tooltip>
      </Col>
    );
    return remoteFunc
      ? remoteFunc.render(
          'SSRC_EVALUATION_PROC_MANAGE_RENDER_REVIEW_CLARIFY_BUTTON',
          reviewClarifyBtn,
          renderProps
        )
      : reviewClarifyBtn;
  };

  @Bind()
  renderBidItem(bidEvaluateExpertScoringList = [], supplierDimensionList = []) {
    if (!bidEvaluateExpertScoringList.length) {
      return;
    }
    const { supplierDimension, activeKey, supplierFlag } = this.state;
    const packBidData = bidEvaluateExpertScoringList.filter((item) => item && item.sectionFlag);
    const operations = (
      <React.Fragment>
        <Badge
          dot={!supplierDimension[activeKey] && supplierDimensionList[0]?.reviewUnreadCountTotal}
        >
          <a onClick={this.switchDimension}>
            {supplierDimension[activeKey]
              ? intl
                  .get(`ssrc.bidHall.view.message.button.switchExpertsDimension`)
                  .d('切换专家维度')
              : intl
                  .get(`ssrc.bidHall.view.message.button.switchSuppliersDimension`)
                  .d('切换供应商维度')}
          </a>
        </Badge>
      </React.Fragment>
    );
    return (
      <React.Fragment>
        {packBidData.length ? (
          <Tabs
            animated={false}
            tabBarExtraContent={operations}
            activeKey={activeKey}
            onChange={this.handleTabsChange}
          >
            {bidEvaluateExpertScoringList.map((item, index) => {
              return (
                <Tabs.TabPane key={item.bidLineItemId} tab={this.renderTooTipTabs(item)}>
                  {!supplierDimension[activeKey]
                    ? this.renderExpertList(item.evaluateExperts)
                    : this.renderSupplier(supplierDimensionList[index])}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        ) : (
          bidEvaluateExpertScoringList.map((item, index) => (
            <div style={{ marginTop: '20px' }}>
              {supplierFlag
                ? this.renderExpertList(item.evaluateExperts)
                : this.renderSupplier(supplierDimensionList[index])}
            </div>
          ))
        )}
      </React.Fragment>
    );
  }

  /**
   * 渲染标题
   *
   * @param {*} [bidEvaluateExpertScoringList=[]]
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  renderTitle(bidEvaluateExpertScoringList = []) {
    if (!Array.isArray(bidEvaluateExpertScoringList) || !bidEvaluateExpertScoringList.length) {
      return null;
    }

    const titles = bidEvaluateExpertScoringList.filter(
      (item) => item.sourceNum || item.sourceTitle
    );
    if (!titles.length) {
      return null;
    }

    return (
      <React.Fragment>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '80%',
            float: 'left',
          }}
        >
          {titles[0].sourceNum} -{' '}
          <Tooltip title={titles[0].sourceTitle}>{titles[0].sourceTitle}</Tooltip>
        </span>
      </React.Fragment>
    );
  }

  /**
   * Tootip 基本信息
   *
   * @param {string} [sourceFrom='']
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  renderInfo(sourceFrom = '') {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      remote: remoteFunc,
      [modelName]: { header = {} },
    } = this.props;

    const docLink = !this.reviewPendingAndHidePriceFlag() ? (
      <Popover
        content={
          sourceFrom === 'BID'
            ? intl.get(`ssrc.bidHall.view.message.button.bidDetail`).d('招标详情')
            : sourceFrom === 'RFX'
            ? intl.get(`ssrc.bidHall.view.message.button.OrderDetail`).d('单据详情')
            : intl.get(`ssrc.bidHall.view.message.button.rfDetail`).d('详情')
        }
        placement="topLeft"
      >
        <SVGIcon path={bidView} />
      </Popover>
    ) : null;
    return remoteFunc
      ? remoteFunc.render('SSRC_EVALUATION_PROC_MANAGE_RENDER_DOCLINK', docLink, { header })
      : docLink;
  }

  /**
   * backPath 返回页判断
   *
   * @param {string} [sourceFrom='', backRecommend='']
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  backJudge(sourceFrom = null) {
    const { cachTabKey, sourcePage = null } = this.state;
    let backPath = `${this.activeTabKey}/list?${cachTabKey}`;
    if (sourceFrom === 'RFX' && sourcePage === 'RFXList') {
      backPath = '/ssrc/inquiry-hall/list';
    }
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(this.activeTabKey)) {
      backPath = `${this.activeTabKey}/list?sourceCategory=${sourceFrom || 'RFX'}`;
    }
    return backPath;
  }

  // 打开多轮报价弹窗
  @Bind()
  async handleCreateNewQuotationModal() {
    const { isBatchMaintainSection = false, sourceHeaderId } = this.state;
    const { remote: remoteFunc } = this.props;
    const { isCheckedSectionListEmpty = () => {} } = this.SectionRef || {};

    const isBidSectionData = this.isBidSectionData(); // 分标段
    const { visible = false, config = {} } = this.judgeCurrentUserConfig(
      'sectionEvaluationStartNerRoundQuotation'
    );

    if (remoteFunc?.event) {
      const eventProps = {
        rfxHeaderId: sourceHeaderId,
      };
      const res = await remoteFunc.event.fireEvent('beforeJump', eventProps);
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
          batchOperateType: 'roundQuotationStart',
        });
        return;
      }
      // // 区分标段, 批量勾选
      // if (isBatchMaintainSection && !checkedFlag) {
      //   this.setState({
      //     startNewQuotationVisible: true,
      //   });
      // }
      this.setState({
        startNewQuotationVisible: true,
      });
    } else {
      this.setState({
        startNewQuotationVisible: true,
      });
    }
  }

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

  // 多轮报价，确定终轮报价结束
  @Bind()
  sureEndRoundQuotationOver() {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty = () => {} } = this.SectionRef || {};

    const isBidSectionData = this.isBidSectionData(); // 分标段
    const { visible = false, config = {} } = this.judgeCurrentUserConfig(
      'sectionEvaluationEndNerRoundQuotation'
    );

    if (isBidSectionData) {
      const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
      const needWarningUserConfig =
        (!isBatchMaintainSection || (isBatchMaintainSection && checkedFlag)) && visible;
      if (needWarningUserConfig) {
        this.setState({
          batchEmptySelectSectionFlag: true,
          userConfig: config,
          batchOperateType: 'roundQuotationOver',
        });
        return;
      }
      // 区分标段, 批量勾选
      if (isBatchMaintainSection && !checkedFlag) {
        this.sectionBatchHandleSureEndRoundQuotationOver();
      } else {
        this.handleSureEndRoundQuotationOver();
      }
    } else {
      this.handleSureEndRoundQuotationOver();
    }
  }

  // 多轮报价，确定终轮报价结束 multiple
  sectionBatchHandleSureEndRoundQuotationOver = async () => {
    const { organizationId } = this.props;
    const { sourceFrom = '' } = this.state;
    const projectLineSectionList = this.getSectionSelectionData();

    const handleSureEndRoundQuotationOver = async () => {
      try {
        let result = await batchSureRoundQuotationEnd({
          sourceFrom,
          organizationId,
          projectLineSectionList,
        });
        result = getResponse(result);
        if (Array.isArray(result) && !isEmpty(result)) {
          this.setState({
            deadlineEventVisible: false,
            operateSectionData: result,
            operateSectionPromptFlag: true,
          });
          return;
        }

        const { refreshSectionAndMain = () => {} } = this.SectionRef;
        refreshSectionAndMain();
        this.directExpertList();
      } catch (e) {
        throw e;
      }
    };

    Modal.confirm({
      title: intl.get(`ssrc.bidHall.view.button.sureEndRoundQuotationOver`).d('确认终轮报价结束'),
      onOk: () => handleSureEndRoundQuotationOver(),
      onCancel: () => {},
    });
  };

  // 多轮报价，确定终轮报价结束 SINGLE
  @Bind()
  handleSureEndRoundQuotationOver = () => {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    const { sourceFrom = '', sourceHeaderId = null } = this.state;

    const handleSureEndRoundQuotationOver = (type = '') => {
      this.setState({
        endQuotationLoading: true,
      });
      dispatch({
        type: `${modelName}/sureRoundQuotationEnd`,
        payload: {
          sourceFrom,
          sourceHeaderId,
          organizationId,
        },
      })
        .then((res) => {
          if (res) {
            if (type === 'direct') {
              this.validateDirectExpertList();
            } else {
              this.directExpertList();
            }
          }
        })
        .finally(() => {
          this.setState({
            endQuotationLoading: false,
          });
        });
    };

    this.endQuotationValidate({
      params: {
        sourceFrom,
        sourceHeaderId,
        organizationId,
      },
      successOk: handleSureEndRoundQuotationOver,
      warningOk: handleSureEndRoundQuotationOver,
    });
  };

  // 确认终轮报价结束前校验
  endQuotationValidate = async ({ params, successOk, warningOk }) => {
    this.setState({
      endQuotationLoading: true,
    });
    const res = await validateRoundQuotationEnd(params);
    this.setState({
      endQuotationLoading: false,
    });
    if (getResponse(res)) {
      validateModal({
        response: res,
        successCallBack: () => {
          Modal.confirm({
            title: intl
              .get(`ssrc.bidHall.view.button.sureEndRoundQuotationOver`)
              .d('确认终轮报价结束'),
            onOk: () => successOk(),
            onCancel: () => {},
          });
        },
        warningOk: () => warningOk('direct'),
      });
    }
  };

  /**
   * 返回到专家评分列表
   */
  directExpertList() {
    const { dispatch } = this.props;
    const { bidOpeningNewFlag } = this.state;
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { bidEvalProgress = [] },
    } = this.props;
    const currentProgress = bidEvalProgress && bidEvalProgress.find((n) => n.isCurrentFlag === 1); // 当前进度
    const { roundQuotationRule } = this.state;
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(this.activeTabKey)) {
      if (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') {
        if (
          bidOpeningNewFlag ||
          (currentProgress && currentProgress.progressName === 'PRE_EVALUATION_PENDING_RFX')
        ) {
          dispatch(
            routerRedux.push({
              pathname: `${this.activeTabKey}/list`,
            })
          );
        } else {
          const {
            match: { params },
            history,
          } = this.props;
          // 处理路径上的sourceStatus 解决发起终轮报价后跳转页面，sourceStatus值仍为ROUND_QUOTATION，大刷新后 读取sourceStatus仍为ROUND_QUOTATION
          const { sourceStatus, ...otherParams } = this.getRouterParams();
          const newSearch = querystring.stringify({
            ...otherParams,
            sourceStatus: 'SCORING',
          });

          // 先replace路由参数，再更新tab页信息，清空Tab页中缓存的参数
          history.replace({
            pathname: `${this.activeTabKey}/rfx-evaluation-proc-manage/${params.sourceHeaderId}`,
            search: newSearch,
          });
          updateTab({
            key: this.activeTabKey,
            search: newSearch,
          });

          // 光修改页面state 有弊端 需要同时更新路径参数
          // 这里是为了控制多轮按钮
          // this.setState({
          //   sourceStatus: 'SCORING',
          // });
          // this.fetchBidEvalProgress();
          // this.fetchRfxHeader();
          // // this.roundQuotationAllTable.initData();
          // this.fetchBidEvaluateExpertScoring();
          // this.fetchSupplierDimensionList();
        }
      } else {
        dispatch(
          routerRedux.push({
            pathname: `${this.activeTabKey}/list`,
          })
        );
      }
    } else {
      dispatch(
        routerRedux.push({
          pathname: `${this.activeTabKey}/list`,
        })
      );
    }
  }

  validateDirectExpertList() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `${this.activeTabKey}/list`,
      })
    );
  }

  // 分标段勾选数据
  getSectionSelectionData = () => {
    const { getCheckedSectionList = () => {} } = this.SectionRef || {};
    const sectionData = getCheckedSectionList() || [];

    return sectionData;
  };

  // 发起新一轮报价-分标段
  onCreateNewQuotationBatchSection = async () => {
    const projectLineSectionList = this.getSectionSelectionData();
    const data = this.getCreateNewQuotationData();
    if (isEmpty(data) || isEmpty(projectLineSectionList)) {
      return;
    }
    this.setState({
      startNewQuoBtnLoading: true,
    });

    try {
      let result = await batchCreateNewRoundQuotation({
        ...data,
        projectLineSections: projectLineSectionList,
        customizeUnitCode: this.bidFlag
          ? 'SSRC.BID_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM'
          : 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
      });
      result = getResponse(result);
      if (Array.isArray(result) && !isEmpty(result)) {
        this.setState({
          deadlineEventVisible: false,
          operateSectionData: result,
          operateSectionPromptFlag: true,
          startNewQuoBtnLoading: false,
        });
        return;
      }
      this.setState({
        startNewQuoBtnLoading: false,
      });
      const { refreshSectionAndMain = () => {} } = this.SectionRef;
      refreshSectionAndMain();
    } catch (e) {
      this.setState({
        startNewQuoBtnLoading: false,
      });
      throw e;
    } finally {
      this.fetchRfxHeader();
      this.cancelNewQuotation();
    }
  };

  // 发起新一轮参数获取
  getCreateNewQuotationData = () => {
    const { organizationId } = this.props;
    const { sourceFrom = '' } = this.state;
    let data = {};

    this.renderNewQuotationModelRef.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const { roundQuotationEndDate = null } = values;
      const time = roundQuotationEndDate
        ? roundQuotationEndDate.format(DEFAULT_DATETIME_FORMAT)
        : null;
      data = {
        ...values,
        roundQuotationEndDate: time,
        sourceFrom,
        organizationId,
      };
    });

    return data;
  };

  /**
   * 发起新一轮报价 确认
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  @Throttle(1000)
  onCreateNewQuottion() {
    const { dispatch, modelName = 'inquiryHall', remote: remoteFunc } = this.props;
    const {
      [modelName]: { headerInfo = {} },
    } = this.props;
    const { sourceHeaderId = null, isBatchMaintainSection = false } = this.state;
    const projectLineSectionList = this.getSectionSelectionData();

    // 分标段-发起新一轮
    if (isBatchMaintainSection && !isEmpty(projectLineSectionList)) {
      this.onCreateNewQuotationBatchSection();
      return;
    }

    const data = this.getCreateNewQuotationData();
    if (isEmpty(data)) {
      return;
    }

    this.setState({
      startNewQuoBtnLoading: true,
    });
    const scoreRoundQuotation = () => {
      dispatch({
        type: `${modelName}/createNewRoundQuotation`,
        payload: {
          ...data,
          sourceHeaderId,
          customizeUnitCode: this.bidFlag
            ? 'SSRC.BID_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM'
            : 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
        },
      })
        .then((res) => {
          if (!res) {
            return;
          }
          this.fetchRfxHeader();
          // this.roundQuotationAllTable.initData();
          this.cancelNewQuotation();
        })
        .finally(() => {
          this.setState({
            startNewQuoBtnLoading: false,
          });
        });
    };

    if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('scoreRoundQuotation', {
        scoreRoundQuotation,
        data,
        sourceHeaderId,
        bidFlag: headerInfo?.secondarySourceCategory === 'NEW_BID',
        fetchRfxHeader: this.fetchRfxHeader,
        cancelNewQuotation: this.cancelNewQuotation,
      });
    } else {
      scoreRoundQuotation();
    }
  }

  /**
   * 发起新一轮报价 取消
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  cancelNewQuotation() {
    const { form } = this.props;

    this.setState({
      startNewQuotationVisible: false,
    });
    form.resetFields();
  }

  /**
   * 比较报价截止时间和当前时间
   */
  enableRoundQuotationOperate(date = '') {
    let result = true;
    if (!date) {
      return result;
    }

    const formatRoundQuotation = moment(date).format(DEFAULT_DATETIME_FORMAT);
    const now = moment().format(DEFAULT_DATETIME_FORMAT);
    result = formatRoundQuotation < now;
    return result;
  }

  /**
   * 淘汰单据
   */
  @Bind()
  handleEliminate() {
    this.setState({
      eliminateVisible: true,
    });
  }

  @Bind()
  cancelEliminate() {
    this.setState({
      eliminateVisible: false,
    });
  }

  @Bind()
  renderHeader(dataSource = {}) {
    const {
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: this.bidFlag
              ? 'SSRC.BID_HALL_ROUND_QUOTATION.HEADER_FROM'
              : 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.HEADER_FROM',
            form: this.props.form,
            dataSource,
          },
          <Form className="read-row-custom">
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.commonInquiryHall.RFXNo.`, {
                      categoryCode: getCategoryCode(
                        dataSource.secondarySourceCategory === 'NEW_BID'
                      ),
                    })
                    .d('{categoryCode}单号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxNum', {
                    initialValue: dataSource.rfxNum,
                  })(<span>{dataSource.rfxNum}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, {
                      documentTypeName: getDocumentTypeName(
                        dataSource.secondarySourceCategory === 'NEW_BID'
                      ),
                    })
                    .d('{documentTypeName}标题')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxTitle', {
                    initialValue: dataSource.rfxTitle,
                  })(<CPopover content={dataSource.rfxTitle}>{dataSource.rfxTitle}</CPopover>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.curQuoRound`)
                    .d('当前报价轮次')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('quotationRoundNumber', {
                    initialValue: dataSource.quotationRoundNumber,
                  })(<span>{dataSource.quotationRoundNumber}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.quoController.model.quoController.roundQuotationEndDate`)
                    .d('当前轮次截止时间')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('roundQuotationEndDate', {
                    initialValue: dataSource.roundQuotationEndDate,
                  })(<span>{dataSource.roundQuotationEndDate}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.docStatus`).d('单据状态')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxStatusMeaning', {
                    initialValue: dataSource.rfxStatusMeaning,
                  })(<span>{dataSource.rfxStatusMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              {dataSource.startingReason ? (
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('ssrc.supplierQuotation.model.supQuo.startingReasonCurRound')
                      .d('发起本轮报价原因')}
                    {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                  >
                    {getFieldDecorator('startingReason', {
                      initialValue: dataSource.startingReason,
                    })(<span>{dataSource.startingReason}</span>)}
                  </FormItem>
                </Col>
              ) : null}
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  renderNewQuotationModelRef = {};

  @Bind()
  renderNewQuotationModel() {
    const { remote: remoteFunc, customizeForm } = this.props;
    const { startNewQuotationVisible = false, startNewQuoBtnLoading = false } = this.state;
    const quotationProps = {
      customizeForm,
      startNewQuotationVisible,
      onCreateNewQuottion: this.onCreateNewQuottion,
      cancelNewQuotation: this.cancelNewQuotation,
      startNewQuoBtnLoading,
      remoteFunc,
      onRef: (ref) => {
        this.renderNewQuotationModelRef = ref;
      },
      bidFlag: this.bidFlag,
    };
    return <NewQuotationModel {...quotationProps} />;
  }

  /**
   * 比价助手modal- 此方法被 [永祥] 重写, 请谨慎修改!!!
   * @protected
   */
  @Bind()
  renderPriceComparison(priceComparisonProps) {
    C7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: C7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.bidFlag ? (
        <BidPriceComparison {...priceComparisonProps} />
      ) : (
        <PriceComparison {...priceComparisonProps} />
      ),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  // 判断议价是否时间结束
  isBargainFinished = (data) => {
    const { currentDateTime = null, bargainEndDate = null } = data || {};

    let bargainTimeFinished = true;

    if (!isNil(bargainEndDate) && !isNil(currentDateTime)) {
      bargainTimeFinished = bargainEndDate < currentDateTime;
    }

    return bargainTimeFinished;
  };

  /**
   * 跳转到对应的议价界面
   */
  @Bind()
  handleBargainOnline(data) {
    const { remote: remoteFunc } = this.props;
    const { bargainStatus = null } = data || {};
    const flag = data && data.bargainOfflineFlag === 1;
    const bargainTimeFinished = this.isBargainFinished(data);

    // 选择议价方式
    const selectBargainWay = () => {
      const openModal =
        ['INITIATE', 'BARGAIN_ONLINE', 'BARGAIN_OFFLINE'].includes(bargainStatus) ||
        bargainTimeFinished;
      if (openModal) {
        if (flag) {
          this.setState({ onlineBargainVisible: true });
        } else {
          this.openBargainModal();
        }
      } else {
        this.openBargainModal();
      }
    };
    if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('selectBargainWay', {
        data,
        selectBargainWay,
        openBargainModal: this.openBargainModal,
        that: this,
        bidFlag: data.secondarySourceCategory === 'NEW_BID',
      });
    } else {
      selectBargainWay();
    }
  }

  /**
   * 关闭议价弹窗
   */
  @Bind()
  hideBargainModal() {
    this.setState({ onlineBargainVisible: false });
  }

  /**
   * 议价方式点击确定跳转对应的界面
   */
  @debounce(500)
  @Bind()
  async openBargainModal() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      organizationId,
      form: { getFieldValue },
      history,
      [modelName]: { headerInfo = {} },
      remote: remoteFunc,
    } = this.props;
    if (isEmpty(headerInfo)) {
      return;
    }

    const {
      backRecommend = '',
      sourceFrom = '',
      cachTabKey = '',
      sourceStatus = '',
      bargainNewFlag,
    } = this.state;
    const {
      rfxHeaderId: sourceHeaderId = null,
      bargainOfflineFlag = 0,
      bargainStatus = null,
      projectLineSectionId = null,
      secondarySourceCategory,
    } = headerInfo || {};
    const bargainTimeFinished = this.isBargainFinished(headerInfo);
    const { sourceProjectId = null, evaluateLeaderFlag = 0 } = this.getRouterParams();

    if (remoteFunc?.event) {
      const eventProps = {
        rfxHeaderId: sourceHeaderId,
      };
      const res = await remoteFunc.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

    const pathname =
      secondarySourceCategory === 'NEW_BID' && this.activeTabKey !== '/ssrc/new-bid-hall'
        ? `${this.activeTabKey}/${bargainNewFlag ? 'new-' : ''}bid-bargain/${sourceHeaderId}`
        : `${this.activeTabKey}/${bargainNewFlag ? 'new-' : ''}rfx-bargain/${sourceHeaderId}`;

    const currentSearch = querystring.stringify({
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      bargainingStage: 'SCORE',
      projectLineSectionId,
      sourceProjectId,
      evaluateLeaderFlag,
    });

    // 议价弹框确定
    const openBargain = () => {
      dispatch({
        type: `${modelName}/fetchOpenBargain`,
        payload: {
          organizationId,
          rfxHeaderId: sourceHeaderId,
          bargainMethod: bargainOfflineFlag === 0 ? 'ONLINE' : getFieldValue('sourceType'),
        },
      })
        .then((res) => {
          if (res) {
            history.push({
              pathname,
              search: currentSearch,
            });
            this.setState({
              onlineBargainVisible: false,
            });
          }
        })
        .finally(() => {
          this.setState({
            openBargainLoading: false,
          });
        });
    };

    // 直接跳转议价
    const directBargain = () => {
      history.push({
        pathname,
        search: currentSearch,
      });
      this.setState({
        onlineBargainVisible: false,
      });
    };

    this.setState({
      openBargainLoading: true,
    });

    const startNewBargain =
      (bargainStatus !== 'BARGAINING_ONLINE' && bargainStatus !== 'BARGAINING_OFFLINE') ||
      bargainTimeFinished;

    if (
      // bargainStatus !== 'BARGAIN_OFFLINE' &&
      // bargainStatus !== 'BARGAIN_ONLINE' &&
      startNewBargain
    ) {
      openBargain();
    } else if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('directBargain', {
        openBargain,
        directBargain,
        data: headerInfo,
        bidFlag: headerInfo.secondarySourceCategory === 'NEW_BID',
      });
      this.setState({
        openBargainLoading: false,
      });
    } else {
      directBargain();
      this.setState({
        openBargainLoading: false,
      });
    }
  }

  // 获取参数值
  getRouterParams() {
    const {
      location: { search = {} },
    } = this.props;
    return querystring.parse(search.substr(1)) || {};
  }

  /**
   * 打开议价方式模态框
   */
  @Bind()
  bargainRuleModal(code) {
    const { onlineBargainVisible, openBargainLoading } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { sourceType } = code;
    return (
      <Modal
        visible={onlineBargainVisible}
        onCancel={this.hideBargainModal}
        width={430}
        okButtonProps={{
          loading: openBargainLoading,
        }}
        onOk={this.openBargainModal}
        title={intl.get('ssrc.bidHall.model.bidHall.selectSourceType').d('选择议价方式')}
      >
        <Row gutter={48}>
          <Col span={24} style={{ marginLeft: '20%' }}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.sourceType').d('议价方式')}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              {getFieldDecorator('sourceType', {
                initialValue: 'ONLINE',
              })(
                <Select style={{ width: '100px' }}>
                  {sourceType &&
                    sourceType.length &&
                    sourceType.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }

  // 渲染 `Content` 组件
  renderContent() {
    const { modelName = 'bidHall', onFormLoaded = () => {} } = this.props;
    const {
      match,
      dispatch,
      inquiryHall,
      organizationId,
      fetchAllLoading,
      fetchSupplierLoading,
      fetchItemLineLoading,
      fetchScoreDetailLoading,
      [modelName]: {
        header = {},
        bidEvaluateExpertScoringList = [],
        supplierDimensionList = [],
        quotationDetailList = {},
      },
      bidEvaluateExpertScoringLoading = false,
      allRoundQuotationDataLoading = false,
      remote: remoteFunc,
    } = this.props;
    const { supplierFlag, sourceFrom = '', sourceStatus = '', sourceHeaderId } = this.state;
    const { currencyCodeMeaning = '', roundQuotationEndDate = '' } = header;
    const packBidData = bidEvaluateExpertScoringList.filter((item) => item && item.sectionFlag);

    // 多轮报价明细 props
    const RoundQuotationAllTableProps = {
      header,
      match,
      dispatch,
      currencyCodeMeaning,
      round: header.quotationRoundNumber || 1,
      quotationDetailList,
      roundQuotationEndDate,
      inquiryHall,
      organizationId,
      fetchAllLoading,
      fetchSupplierLoading,
      fetchItemLineLoading,
      fetchScoreDetailLoading,
      onRef: (ref) => {
        this.roundQuotationAllTable = ref;
      },
      remoteFunc,
    };
    const openBidProps = {
      header,
      sourceHeaderId,
      organizationId,
      UEDDisplayFormItem,
      rfxHeaderId: sourceHeaderId,
      onFormLoaded,
      pubRouterAddParams: this.pubRouterAddParams,
      bidFlag: this.bidFlag,
    };
    return (
      <div className={Styles['process-mange']}>
        <Spin spinning={bidEvaluateExpertScoringLoading || allRoundQuotationDataLoading}>
          <Content
            className={classnames(
              common['page-content-custom'],
              common['zero-margin-bottom'],
              'ued-detail-wrapper'
            )}
          >
            {sourceFrom === 'RFX' &&
              sourceStatus === 'ROUND_QUOTATION' &&
              this.renderHeader(header)}
            {['SCORING', 'INITIAL_REVIEW_SCORING', 'BARGAINING'].includes(sourceStatus) ? (
              <h3>
                {this.renderTitle(bidEvaluateExpertScoringList)}
                <span
                  style={{ marginLeft: '20px', marginRight: '10px' }}
                  onClick={() => this.directBidDetail(header)}
                >
                  {this.renderInfo(sourceFrom)}
                </span>
                {!packBidData.length ? (
                  <span style={{ float: 'right' }}>
                    <Badge dot={supplierFlag && supplierDimensionList[0]?.reviewUnreadCountTotal}>
                      <a style={{ fontSize: '12px' }} onClick={this.switchTo}>
                        {!supplierFlag
                          ? intl
                              .get(`ssrc.bidHall.view.message.button.switchExpertsDimension`)
                              .d('切换专家维度')
                          : intl
                              .get(`ssrc.bidHall.view.message.button.switchSuppliersDimension`)
                              .d('切换供应商维度')}
                      </a>
                    </Badge>
                  </span>
                ) : (
                  ''
                )}
              </h3>
            ) : null}
            {header.quotationRoundNumber &&
              sourceStatus === 'ROUND_QUOTATION' &&
              this.renderRoundQuotationAllTable(RoundQuotationAllTableProps)}
            {['SCORING', 'INITIAL_REVIEW_SCORING', 'BARGAINING'].includes(sourceStatus) &&
              this.renderBidItem(bidEvaluateExpertScoringList, supplierDimensionList)}
            {['OPENED', 'OPEN_BID_PENDING'].includes(sourceStatus) &&
              this.renderNewBidOpened(openBidProps)}
          </Content>
        </Spin>
      </div>
    );
  }

  // 渲染开标详情
  renderNewBidOpened(openBidProps) {
    return <OpenBid {...openBidProps} />;
  }

  // 多轮报价表格组件 合众能源二开
  renderRoundQuotationAllTable(RoundQuotationAllTableProps) {
    return this.bidFlag ? (
      <BidRoundQuotationAllTable {...RoundQuotationAllTableProps} />
    ) : (
      <RoundQuotationAllTable {...RoundQuotationAllTableProps} />
    );
  }

  roundQuotationAllTable = {};

  BatchEmptySectionRef = {}; // 批量为空ref

  SectionRef = {}; // 分标段ref

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
      case 'roundQuotationOver':
        this.handleSureEndRoundQuotationOver();
        break;
      case 'roundQuotationStart':
        // this.onCreateNewQuotationBatchSection();
        this.setState({ startNewQuotationVisible: true });
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

  // 是否可以切标段-loading
  couldSectionSwitch = () => {
    const { allLoading = false } = this.props;
    const { operationLoading = false } = this.state;
    return allLoading || operationLoading;
  };

  // 淘汰完成后更新多轮报价数据
  @Bind()
  onUpdateData() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationAllList: [], // 多轮报价全部Tab报价明细
        quotationSupplierList: [], // 多轮报价供应商Tab列表信息
        quotationItemList: [], // 多轮报价物料Tab物料信息
      },
    });
    this.setState({
      eliminateVisible: false,
    });
    this.roundQuotationAllTable.initData();
  }

  /**
   * 淘汰
   */
  @Bind()
  renderEliminate() {
    const {
      match,
      dispatch,
      modelName = 'inquiryHall',
      [modelName]: { headerInfo = {} },
    } = this.props;
    const { eliminateVisible = false, doubleUnitFlag } = this.state;
    const eliminateInquiryProps = {
      match,
      dispatch,
      eliminateVisible,
      cancelEliminate: this.cancelEliminate,
      onUpdateData: this.onUpdateData,
      priceTypeCode: headerInfo.priceTypeCode,
      doubleUnitFlag,
    };
    return eliminateVisible && <EliminateInquiry {...eliminateInquiryProps} />;
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
   * 从进度条中获取当前节点
   */
  getCurrentProcessNodeName = () => {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { bidEvalProgress = [] },
    } = this.props;

    let currentNodeName = '';

    if (isEmpty(bidEvalProgress)) {
      return currentNodeName;
    }

    bidEvalProgress.forEach((process) => {
      const { isCurrentFlag, progressName } = process || {};

      if (isCurrentFlag === 1 || isCurrentFlag === '1') {
        currentNodeName = progressName;
      }
    });

    return currentNodeName;
  };

  /**
   * 符合性检查中，符合性结果确认 节点中 附件，评分详情，比价助手按钮都要走模板隐藏
   * INITIAL_REVIEW_SCORING_RFX
   * RFX_INITIAL_REVIEW_PENDING_RFX
   * TECHNOLOGY_OPEN_BID_RFX
   */
  reviewPendingAndHidePriceFlag = () => {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { reviewHidePrice } = header || {};
    const currentNodeName = this.getCurrentProcessNodeName();

    let hidden = true;

    if (!reviewHidePrice || !currentNodeName) {
      return hidden;
    }

    hidden =
      !!currentNodeName &&
      ['INITIAL_REVIEW_SCORING_RFX', 'RFX_INITIAL_REVIEW_PENDING_RFX'].includes(currentNodeName) &&
      reviewHidePrice === 'HIDE';

    return hidden;
  };

  /**
   * 提取头部按钮
   * @returns array
   * @protected （合众新能源二开）禁止修改、删除此方法名
   */
  renderHeaderButtons() {
    const {
      organizationId,
      modelName = 'bidHall',
      createNewRoundQuotationLoading = false,
      sureRoundQuotationEndLoading = false,
      remote: remoteFunc,
    } = this.props;
    const {
      [modelName]: { header = {}, headerInfo = {}, bidEvalProgress = [] },
      history,
    } = this.props;
    const {
      sourceFrom = '',
      sourceStatus = '',
      sourceHeaderId = null,
      bidOpeningNewFlag = null,
      isBatchMaintainSection = false,
      backRecommend,
      cachTabKey,
    } = this.state;
    const {
      roundQuotationEndDate = '',
      roundQuotationRule = '',
      priceRepliedCount,
      evaluateLeaderFlag: headerEvaluateLeaderFlag,
      sealedQuotationFlag,
      openerFlag,
    } = header || {};
    const enableRoundQuotationOperate = this.enableRoundQuotationOperate(roundQuotationEndDate);

    const isBidSectionData = this.isBidSectionData(); // 是否分标段且标段数据存在

    const {
      currentUserIsRfxFlag = 0,
      openBidOrder,
      expertSource,
      bidRuleType,
      currentSequenceNum = 0,
    } = isEmpty(header) ? headerInfo : header;

    const routerParams = this.getRouterParams();

    const { evaluateLeaderFlag = null, projectLineSectionId, sourceProjectId } = routerParams || {};

    // price clarification button
    const PriceButtonProps = {
      sourceFrom,
      sourceHeaderId,
      organizationId,
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      disabled: isBatchMaintainSection,
      getRouterParams: this.getRouterParams,
      priceRepliedCount,
    };

    const SelectionSectionVisible =
      isBidSectionData &&
      sourceFrom === 'RFX' &&
      // (((headerInfo.bargainRule === 'SCORE' || headerInfo.bargainRule === 'ALL') &&
      //   (headerInfo.scoringProgress === 'BUSINESS' ||
      //     headerInfo.scoringProgress === 'BUSINESS_TECHNOLOGY')) ||
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      sourceStatus === 'ROUND_QUOTATION';

    // 聚合header和headerInfo
    const fullHeader = {
      ...header,
      ...headerInfo,
    };

    // 比价助手
    const priceComparisonProps = {
      sourceCategory: header.sourceCategory,
      rfxId: sourceHeaderId,
      // visible: priceComparisonModalVisible,
      // onHideModal: this.hidePriceComparison,
      diyLadderQuotationFlag: header.diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };
    const { progressName } = bidEvalProgress.find((item) => item.isCurrentFlag === 1) || {};
    /**
     * 【确认终轮报价结束】【发起新一轮投标】【淘汰】【议价】等按钮关于二新开标显示逻辑
     * 二阶段配置表未开启: 保持原有逻辑
     * 二阶段配置表开启: 询价员工 && 当前用户不是评分负责人
     *
     */
    let showBidOpeningButtonFlag = true;

    // 二阶段租户+密封+开标+先商务后技术/先技术后商务
    if (bidOpeningNewFlag) {
      const secondOpenBid =
        sourceFrom === 'RFX' &&
        // Number(currentUserIsRfxFlag) === 1 &&
        // Number(evaluateLeaderFlag) !== 1
        bidOpeningNewFlag &&
        sealedQuotationFlag === 1 &&
        openerFlag === 1 &&
        openBidOrder !== 'SYNC';

      if (secondOpenBid) {
        showBidOpeningButtonFlag = false;
        // 二阶段，按钮隐藏, 只有询价员有按钮
        if (Number(currentUserIsRfxFlag) === 1) {
          showBidOpeningButtonFlag = true;
        }
      } else {
        showBidOpeningButtonFlag = true;
      }
    }

    const sureEndRoundQuotationOverBtnVisibleFlag =
      sourceFrom === 'RFX' &&
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      sourceStatus === 'ROUND_QUOTATION';
    const startNewRoundQuotationBtnVisibleFlag = sureEndRoundQuotationOverBtnVisibleFlag; // TODO 两个按钮后续可能区分

    const PROCESSROUNDQUOTATIONBUTTON = {
      sourceFrom,
      roundQuotationRule,
      sourceStatus,
      bidFlag: this.bidFlag,
      header,
    };
    const newSureEndRoundQuotationOverBtnVisibleFlag = !remoteFunc
      ? sureEndRoundQuotationOverBtnVisibleFlag
      : remoteFunc.process(
          'SSRC_EVALUATION_PROC_MANAGE_ROUND_QUOTATION_END_ROUND',
          sureEndRoundQuotationOverBtnVisibleFlag,
          PROCESSROUNDQUOTATIONBUTTON
        );
    const newStartNewRoundQuotationBtnVisibleFlag = !remoteFunc
      ? startNewRoundQuotationBtnVisibleFlag
      : remoteFunc.process(
          'SSRC_EVALUATION_PROC_MANAGE_ROUND_QUOTATION_NEW_ROUND',
          startNewRoundQuotationBtnVisibleFlag,
          PROCESSROUNDQUOTATIONBUTTON
        );

    console.log(startNewRoundQuotationBtnVisibleFlag, showBidOpeningButtonFlag, 11);

    const negotiatedPriceVisibleFlag =
      headerInfo &&
      (headerInfo.bargainRule === 'SCORE' || headerInfo.bargainRule === 'ALL') &&
      (headerInfo.scoringProgress === 'BUSINESS' ||
        headerInfo.scoringProgress === 'BUSINESS_TECHNOLOGY') &&
      progressName !== 'INITIAL_REVIEW_SCORING_RFX';

    const importProps = {
      name: 'scoreEntry',
      help: intl
        .get('ssrc.common.button.score.entry.help')
        .d('可为当前节点未提交评分的专家代录入评分结果'),
      templateCode: 'SSRC.LEADER_SCORE_FOR_EXPERT',
      prefixPatch: SRM_SSRC,
      refreshButton: true,
      autoRefreshInterval: 5000,
      tenantId: getCurrentOrganizationId(),
      args: {
        sourceFrom,
        sourceHeaderId,
        sequenceNum: sourceFrom === 'RFX' ? currentSequenceNum : null,
        tenantId: organizationId,
      },
      customeImportTemplate: {
        skipQueryGetTplFile: true,
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/evaluate-summary/${sourceFrom}/${sourceHeaderId}/export-excel?exportType=DATA`,
        queryArea: {
          fillerType: 'multi-sheet',
          async: false,
        },
      },
      buttonText: intl.get('ssrc.common.button.score.entry').d('评分录入'),
      buttonProps: {
        funcType: 'flat',
        type: 'c7n-pro',
        icon: 'record_test',
      },
      successCallBack: this.queryMain,
      remote: remoteFunc,
      pageData: { sourceFrom, progressName },
    };

    // 议价按钮
    const negotiatedDisabledFlag = remoteFunc
      ? remoteFunc.process(
          'SSRC_EVALUATION_PROC_MANAGE_PROCESS_NEGOTIATED_PRICE_BTN_DISABLED_FLAG',
          fullHeader.roundHeaderStatus === 'ROUND_SCORING',
          { headerInfo, evaluateLeaderFlag, that: this, progressName }
        )
      : fullHeader.roundHeaderStatus === 'ROUND_SCORING';

    // 价格澄清 visible
    let priceClarifyVisible =
      (remoteFunc
        ? remoteFunc.process(
            'SSRC_EVALUATION_PROC_MANAGE_PROCESS_PRICE_CLARIFY_BTN',
            ['1'].includes(evaluateLeaderFlag) || headerEvaluateLeaderFlag, // 做兼容
            {
              fullHeader,
            }
          )
        : evaluateLeaderFlag === '1' || headerEvaluateLeaderFlag) &&
      ['BUSINESS', 'BUSINESS_TECHNOLOGY'].includes(fullHeader.scoringProgress) &&
      sourceFrom !== 'RFP' &&
      sourceFrom !== 'RFI' &&
      progressName !== 'INITIAL_REVIEW_SCORING_RFX';

    priceClarifyVisible = remoteFunc
      ? remoteFunc.process(
          'SSRC_EVALUATION_PROC_MANAGE_PROCESS_PRICECLARIFY_BUTTON_VISIBLE',
          priceClarifyVisible,
          {
            that: this,
            fullHeader,
            progressName,
          }
        )
      : priceClarifyVisible;

    const buttons = [
      showBidOpeningButtonFlag && newSureEndRoundQuotationOverBtnVisibleFlag && (
        <Button
          disabled={!enableRoundQuotationOperate}
          type="primary"
          onClick={this.sureEndRoundQuotationOver}
          loading={sureRoundQuotationEndLoading}
          icon="poweroff"
          name="sureEndRoundQuotationOver"
        >
          {intl.get(`ssrc.bidHall.view.button.sureEndRoundQuotationOver`).d('确认终轮报价结束')}
        </Button>
      ),
      showBidOpeningButtonFlag && newStartNewRoundQuotationBtnVisibleFlag && (
        <Button
          disabled={!header.quotationRoundNumber || !enableRoundQuotationOperate}
          onClick={this.handleCreateNewQuotationModal}
          loading={createNewRoundQuotationLoading}
          name="startNerRoundQuotation"
        >
          <div>
            <img src={moneyBook} style={{ marginRight: '4px' }} alt="icon" />
            <span
              title={
                this.bidFlag
                  ? intl
                      .get(`ssrc.bidHall.view.button.startNewBidRoundQuotation`)
                      .d('发起新一轮投标')
                  : intl.get(`ssrc.bidHall.view.button.startNerRoundQuotation`).d('发起新一轮报价')
              }
              placement="bottom"
            >
              {this.bidFlag
                ? intl.get(`ssrc.bidHall.view.button.startNewBidRoundQuotation`).d('发起新一轮投标')
                : intl.get(`ssrc.bidHall.view.button.startNerRoundQuotation`).d('发起新一轮报价')}
            </span>
          </div>
        </Button>
      ),
      showBidOpeningButtonFlag &&
        sourceFrom === 'RFX' &&
        (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
        sourceStatus === 'ROUND_QUOTATION' &&
        !!header.openEliminateFlag && (
          <Button
            type="default"
            disabled={
              !header.quotationRoundNumber || !enableRoundQuotationOperate || isBatchMaintainSection
            }
            onClick={this.handleEliminate}
            name="eliminate"
          >
            <img src={moneyBook} style={{ marginRight: '4px' }} alt="icon" />
            {intl.get(`ssrc.bidHall.view.button.eliminate`).d('淘汰')}
          </Button>
        ),
      (remoteFunc
        ? remoteFunc.process(
            'SSRC_EVALUATION_PROC_MANAGE_PROCESS_NEGOTIATED_PRICE_BTN',
            negotiatedPriceVisibleFlag,
            { headerInfo, evaluateLeaderFlag, that: this, progressName }
          )
        : negotiatedPriceVisibleFlag) && (
        <Button
          onClick={() => this.handleBargainOnline(headerInfo)}
          disabled={negotiatedDisabledFlag}
          name="negotiatedPrice"
        >
          <Iconfont type="main-reinquiry" style={{ marginRight: '8px' }} />
          {intl.get('ssrc.bidHall.view.button.negotiatedPrice').d('议价')}
        </Button>
      ),
      priceClarifyVisible ? (
        <PriceClarificationButtons {...PriceButtonProps} name="priceClarifyOptions" />
      ) : null,
      SelectionSectionVisible ? (
        <Button
          onClick={this.selectBidSection}
          disabled={!enableRoundQuotationOperate}
          name="selectBidSection"
        >
          <Iconfont type="main-delete" style={{ marginRight: '8px' }} />
          {!isBatchMaintainSection
            ? intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')
            : intl.get(`ssrc.common.view.button.cancelBidSectionBtn`).d('取消标段')}
        </Button>
      ) : null,
      (['BUSINESS_SCORING', 'BUSINESS_SCORING_RFX'].includes(progressName) ||
        openBidOrder === 'SYNC') &&
      sourceFrom === 'RFX' &&
      !isEmpty(header) &&
      !this.reviewPendingAndHidePriceFlag() ? (
        <Button
          type="default"
          name="priceAssistant"
          onClick={() => this.renderPriceComparison(priceComparisonProps)}
          style={{ marginRight: '8px' }}
        >
          <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
          {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
        </Button>
      ) : null,
      ['SCORING_RFX', 'TECHNOLOGY_SCORING_RFX', 'BUSINESS_SCORING_RFX'].includes(progressName) && (
        <ScoreEntryButton {...importProps} />
      ),
    ];
    if (!remoteFunc) {
      return buttons;
    }
    return remoteFunc.process('SSRC_EVALUATION_PROC_MANAGE_PROCESS_HEADER_BUTTONS', buttons, {
      sourceFrom,
      sourceHeaderId,
      expertSource,
      bidRuleType,
      initQuery: this.initQuery,
      sourceStatus,
      fullHeader,
      progressName,
      openBidOrder,
      headerInfo,
      organizationId,
      backPath: this.backJudge(sourceFrom),
      history,
      backRecommend,
      cachTabKey,
      evaluateLeaderFlag,
      projectLineSectionId,
      sourceProjectId,
      roundQuotationRule,
      that: this,
    });
  }

  render() {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { bidEvalProgress = [], code = {} },
      customizeBtnGroup = noop,
      custLoading,
    } = this.props;
    const {
      // sourceHeaderId,
      AttachmentsProps,
      attachmentVisible,
      onlineBargainVisible,
      menuTitle = '',
      sourceFrom = '',
      sourceStatus = '',
      isBatchMaintainSection = false,
      batchEmptySelectSectionFlag = false,
      operateSectionData = [],
      operateSectionPromptFlag = true,
      batchOperateType = null,
      switchNotification,
      // priceComparisonModalVisible,
      endQuotationLoading = false,
    } = this.state;

    const routerParams = this.getRouterParams();
    const { sourceProjectId, projectLineSectionId } = routerParams;

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段

    const SectionPanelProps = {
      parentPage: {
        name: 'expertScoringEvaluation',
        queryParams: {
          sourceStatus,
          sourceProjectId,
          operation: 'SCORE_MANAGEMENT',
        },
      },
      locatedCurrentUrl: this.replaceRoute,
      couldSectionSwitch: this.couldSectionSwitch,
      paramKeys: ['sourceHeaderId'],
      projectLineSectionId,
      queryMain: this.queryMain,
      switchNotification,
      isSection: BidSectionFlag,
      isBatchMaintainSection,
    };

    // 批量处理标段时候未勾选标段数据提示框
    const BatchProps = {
      parentPage: {
        name: batchOperateType,
        queryParams: {
          // rfxHeaderId: rfxId,
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
      <div
        className={common['detail-standard']}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Spin spinning={endQuotationLoading}>
          <Header
            title={
              menuTitle ||
              (sourceFrom === 'BID'
                ? intl
                    .get(`ssrc.bidHall.view.message.button.bidEvaluationProcManage`)
                    .d('评标过程管理')
                : intl
                    .get(`ssrc.bidHall.view.message.button.scoreProcessManager`)
                    .d('评分过程管理'))
            }
            backPath={this.backJudge(sourceFrom)}
          >
            {customizeBtnGroup(
              { code: `SSRC.EXPERT_SCORE_MANAGE.HEADER_BUTTONS` },
              !custLoading ? this.renderHeaderButtons() : []
            )}
          </Header>

          <div style={{ marginTop: '16px' }}>
            <BidEvaluationProcess
              dataSource={bidEvalProgress}
              style={{ width: 'calc(100% - 16px)', margin: '-8px 8px 0' }}
            />
          </div>
          {projectLineSectionId ? (
            <SectionPanel
              {...SectionPanelProps}
              onRef={(node) => {
                this.SectionRef = node;
              }}
            >
              {this.renderContent()}
            </SectionPanel>
          ) : (
            this.renderContent()
          )}
          {/* {priceComparisonModalVisible && this.renderPriceComparison(priceComparisonProps)} */}
          <Modal
            destroyOnClose
            visible={attachmentVisible}
            footer={null}
            onCancel={this.hideAttachmentsProps}
            width={800}
          >
            <QuoteAttachment {...AttachmentsProps} />
          </Modal>
          {this.renderNewQuotationModel()}
          {onlineBargainVisible && this.bargainRuleModal(code)}
          {this.renderEliminate()}
          {batchEmptySelectSectionFlag && <BatchEmptySelectedModal {...BatchProps} />}
          {operateSectionPromptFlag && <OperateSectionPromptModal {...operateSectionPrompt} />}
        </Spin>
      </div>
    );
  }
}

const HOCComponent = (Comp) => {
  return compose(
    formatterCollections({
      code: [
        'ssrc.bidHall',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.expert',
        'ssrc.qualiExam',
        'ssrc.quoController',
        'ssrc.supplierQuotation',
        'scux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.HEADER_FROM',
        'SSRC.BID_HALL_ROUND_QUOTATION.HEADER_FROM',
        'SSRC.EXPERT_SCORE_MANAGE.HEADER_BUTTONS',
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
        'SSRC.BID_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
      ],
    }),
    connect(({ bidHall, commonModel, loading, inquiryHall }) => ({
      bidHall,
      commonModel,
      inquiryHall,
      createNewRoundQuotationLoading: loading.effects['inquiryHall/createNewRoundQuotation'],
      sureRoundQuotationEndLoading: loading.effects['inquiryHall/sureRoundQuotationEnd'],
      bidEvaluateExpertScoringLoading:
        loading.effects['inquiryHall/fetchBidEvaluateExpertScoring'] ||
        loading.effects['bidHall/fetchBidEvaluateExpertScoring'],
      allRoundQuotationDataLoading:
        loading.effects['inquiryHall/fetchAllRoundQuotationData'] ||
        loading.effects['bidHall/fetchAllRoundQuotationData'],
      organizationId: getCurrentOrganizationId(),
      fetchAllLoading: loading.effects['inquiryHall/fetchAllRoundQuotationList'],
      fetchSupplierLoading: loading.effects['inquiryHall/fetchSupplierRoundQuotationList'],
      fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLineRoundQuotationList'],
      fetchScoreDetailLoading: loading.effects['inquiryHall/fetchScoreDetail'],
    })),
    Form.create({ fieldNameProp: null }),
    remote(
      {
        code: 'SSRC_EVALUATION_PROC_MANAGE',
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        events: {
          // 多轮报价单标段发起
          scoreRoundQuotation(eventProps) {
            const { scoreRoundQuotation } = eventProps;
            scoreRoundQuotation();
          },
          // 选择议价方式
          selectBargainWay(eventProps) {
            const { selectBargainWay } = eventProps;
            selectBargainWay();
          },
          // 打开议价弹框回调
          directBargain(eventProps) {
            const { directBargain } = eventProps;
            directBargain();
          },
          beforeJump() {},
          // 处理挂载组件时需要用到的二开数据
          handleFetchRemoteData() {},
          // 评分录入打开弹框事件
          remoteHandleOpenScoreEntryModal(eventProps) {
            const { openModal } = eventProps || {};
            if (isFunction(openModal)) {
              openModal();
            }
          },
        },
      }
    )
  )(Comp);
};

export default HOCComponent(BidEvaluationProcManage);
export { BidEvaluationProcManage, HOCComponent as hocBidEvaluationProcManage };
