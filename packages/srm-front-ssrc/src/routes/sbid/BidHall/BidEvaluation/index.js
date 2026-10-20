/**
 * bidHall - 招标服务/评标管理
 * @date: 2019-7-2
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Steps, Tabs, Tooltip } from 'hzero-ui';
import {
  Modal as c7nModal,
  Icon,
  DataSet,
  Table,
  Form as C7NForm,
  TextArea as C7NTextArea,
} from 'choerodon-ui/pro';
import { Bind, Throttle, debounce } from 'lodash-decorators';
import { isEmpty, isArray, isNil } from 'lodash';
import { routerRedux } from 'dva/router';
import fetch from 'dva/fetch';
import querystring from 'querystring';

import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import bidView from '@/assets/bid-view.svg';
// import { getActiveTabKey } from 'utils/menuTab';
import { getCheckPriceName } from '@/utils/globalVariable';
import SvgIcon from '@/routes/components/SvgIcon';
import { getResponse, getEditTableData } from 'utils/utils';

import RoundQuotationModal from '@/routes/components/RoundQuotationModal/';
import PriceComparison from '@/routes/ssrc/components/PriceComparison';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import SectionPanel from '@/routes/sbid/components/SectionPanel';
import { getJumpRoutePrefixUrl } from '@/utils/utils';
import RoundQuotationDrawer from '@/routes/components/RoundQuotationDrawer';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import {
  queryTemplateConfig,
  fetchAttachmentCountServices,
  queryH0OrC7N,
  queryConfigurationOldRate,
  submitEvaluateNewOpenBidSummary,
} from '@/services/commonService';
import { reviewRescoringAll } from '@/services/bidHallService';
import PriceClarificationButtons from '@/routes/sbid/ExpertScoring/Update/PriceClarificationButtons';
import useIPDetailModal from '@/routes/components/IPDetails';
import { attachmentTableDS } from './attachmentDs';

import { ExpertsList } from './ExpertsList';
import SupplierTable from './SupplierTable';
import ReviewSupplierTable from './ReviewSupplierTable';
import styles from './index.less';
import Iconfont from '../../../ssrc/components/Icons'; // 下载至本地的icon
import IPCoincidenceRate from '../../../components/IPCoincidenceRate/index';
import PopoverButton from '../../../components/PopoverButton';

const { Step } = Steps;
const { TabPane } = Tabs;
const { TextArea } = Input;

const { openIPDetailModal } = useIPDetailModal();

export default class BidEvaluation extends Component {
  constructor(props) {
    super(props);

    this.reviewAllRescoreDs = new DataSet({
      fields: [
        {
          name: 'reReviewReason',
          type: 'string',
          required: true,
          label: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.reComplianceCheckReason`)
            .d('重新符合性检查原因'),
        },
      ],
    });

    this.initState(props, 'init');
  }

  supplierTable = {};

  reviewSupplierForm = null; // 评审供应商form

  activeTabKey = getJumpRoutePrefixUrl(this.props.location.pathname);

  sectionRef = {};

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
      sourceStatus = '',
      sourcePage = null,
      evaluateLeaderFlag,
      roundQuotationRule,
    } = routerParams;

    const state = {
      sourceStatus,
      reScoringVisible: false, // 全部重新评分弹窗控制
      exportLoading: false,
      cachTabKey, // 页面返回backpath标记
      supplierDimension: {}, // 供应商维度
      activeKey: '', // 标签页activeKey
      backRecommend, // 专家评分跳转标记
      sourceFrom, // 页面跳转的来源 BID/RFX
      sourceHeaderId,
      ipCoincidenceRateVisible: false, // ip重合率弹框
      roundQuotationModalVisible: false,
      onlineBargainVisible: false, // 议价方式的弹窗
      sourcePage, // 页面跳转来源标识
      current: {}, // 当前状态的step
      evaluateLeaderFlag, // 评分负责人标识
      priceComparisonModalVisible: false, // 比价助手模态框
      roundQuotationRule,
      routerParams,
      quotationHeaderIds: [],
      newQuotationFlag: 0, // 启用新报价标识
      openBargainLoading: false, // 选择议价方式弹框确定按钮loading
      templateConfig: {}, // 查询该模版配置
      attachmentCount: '', // 查看附件展示数量
      bargainNewFlag: false, // 议价
      useNewRateFlag: 0, // 是否使用老重合率标识
      operateLoading: false,
    };

    if (isInit) {
      this.state = state;
    } else {
      this.setState(state, this.initQuery);
    }
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props;
    const prevId = prevParams.sourceHeaderId || null;
    const id = params.sourceHeaderId || null;
    return prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      // 此刻代表 `replace route`
      this.initState(this.props);
    }
  }

  componentDidMount() {
    this.initQuery();
  }

  // 查询重合率配置表
  async fetchUseOldRate() {
    const res = await queryConfigurationOldRate();
    if (getResponse(res)) {
      if (!isEmpty(res) && res[0]?.whiteFlag === '0') {
        this.setState({
          useNewRateFlag: 0,
        });
      } else {
        this.setState({
          useNewRateFlag: 1,
        });
      }
    }
  }

  toggleOperationLoading = (operateLoading = false) => {
    this.setState({ operateLoading });
  };

  /**
   * 数据初始化
   */
  @Bind()
  initQuery() {
    const { sourceFrom = '' } = this.state;
    const { dispatch, modelName = 'inquiryHall' } = this.props;

    if (sourceFrom === 'RFX') {
      this.fetchRfxHeader();
    }

    this.fetchBidEvalProgress();
    this.fetchSectionList();
    const lovCodes = {
      sourceType: 'SSRC.BARGAIN_METHOD', // 议价方式
      detailApprovedStatus: 'SSRC.DETAIL_APPROVED_STATUS', // 审批状态
      eligibilityStatus: 'SSRC.TEMPLATE.QUALIFIED', // 是否合格
    };
    dispatch({
      type: `${modelName === 'bidHall' ? 'inquiryHall' : modelName}/batchCode`,
      payload: { lovCodes },
    });
    this.newQuotationConfigSheet();
    this.fetchAttachmentCount();
    this.fetchRemoteCuxData();
    this.fetchH0OrC7N();
    this.fetchUseOldRate();
  }

  /**
   * 二开需要在组件挂载时处理数据的方法
   * @protected
   */
  @Bind()
  fetchRemoteCuxData() {
    const { sourceFrom = '' } = this.state;
    const {
      exportScoringBussSum,
      match: { params },
    } = this.props;
    if (exportScoringBussSum?.event) {
      exportScoringBussSum.event.fireEvent('handleFetchRemoteData', {
        that: this,
        sourceFrom,
        sourceHeaderId: params.sourceHeaderId,
      });
    }
    this.fetchH0OrC7N();
  }

  // 更换路由, replace route, 初始化数据, 放置在 `componentDidUpdate`
  @Bind()
  replaceRoute(record) {
    const { dispatch } = this.props;
    const search = this.getDirectSearch(record);
    dispatch(
      routerRedux.replace({
        pathname: `${this.activeTabKey}/rfx-evaluation/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const rfxHeaderId = params.sourceHeaderId;

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

  /**
   * 附件数量查询
   */
  @Bind()
  async fetchAttachmentCount() {
    const {
      match: { params },
    } = this.props;
    const { sourceFrom = '' } = this.state;
    const rfxHeaderId = params.sourceHeaderId;

    const param = {
      sourceHeaderId: rfxHeaderId,
      sourceFrom,
    };

    let result = null;
    try {
      result = await fetchAttachmentCountServices(param);
      result = getResponse(result);

      if (result) {
        this.setState({
          attachmentCount: result?.fileCount || '',
        });
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 保存数据
   */
  @Bind()
  async saveData() {
    const { sourceStatus, supplierDimension = {} } = this.state;
    if (!supplierDimension.flag) {
      return Promise.resolve(true);
    }
    const res =
      (await sourceStatus) === 'RFX_INITIAL_REVIEW_PENDING'
        ? this.handleSave()
        : this.saveEvaluateSummary();
    if (res) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        sectionInfo: {}, // 评标管理--标段信息
        supplierList: {}, // 评标管理--分标段/不分标段-供应商维度信息
        expertList: [], // 评标管理--不分标段-专家信息
        expertPagination: {}, // 评标管理--不分标段-专家信息分页
        expertBidList: {}, // 评标管理--分标段-专家信息
        expertBidPagination: {}, // 评标管理--分标段-专家信息分页
        bidEvalProgress: [], // 评标管理-招标评标进度条信息
        expertScoreList: [], // 评标管理-单个专家-评分信息
        scoreLine: {}, // 评分管理-单个专家-供应商评分细项查询
        backPath: {},
        rfxScoreItemLineList: [],
        rfxScoreItemPagination: {},
      },
    });
  }

  /**
   * 查询寻源单头信息
   * */
  fetchRfxHeader() {
    const { dispatch, modelName = 'inquiryHall', organizationId } = this.props;
    const { sourceFrom = '', sourceHeaderId = null } = this.state;

    return dispatch({
      type:
        modelName === 'bidHall'
          ? 'bidHall/fetchBidHeaderDetail'
          : `${modelName}/fetchInquiryHeaderDetail`,
      payload: {
        organizationId,
        sourceFrom,
        rfxHeaderId: sourceHeaderId,
      },
    });
  }

  @Bind()
  fetchRfxScoreItemLines(page = {}, state) {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    const { sourceHeaderId = null, quotationHeaderIds } = state || this.state;
    dispatch({
      type: `${modelName === 'bidHall' ? 'inquiryHall' : modelName}/fetchRfxScoreItemLines`,
      payload: {
        quotationHeaderIds,
        page,
        rfxHeaderId: sourceHeaderId,
        organizationId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
        skipSummaryFlag: 1,
      },
    });
  }

  /**
   * 评标管理-招标评标进度条
   *
   * @memberof BidEvaluation
   */
  @Bind()
  fetchBidEvalProgress() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchBidEvalProgress`,
      payload: { sourceHeaderId: this.state.sourceHeaderId, sourceFrom: this.state.sourceFrom },
    }).then((res) => {
      const currentObj = res && res.find((item) => item.isCurrentFlag);
      this.setState({
        current: currentObj && currentObj.progressName,
      });
    });
  }

  /**
   * 评标管理-标段查询
   * 标段查询后，查询标段下的供应商,专家信息
   * subjectMatterRule PACK分标段 NONE不分标段
   * bidRuleType DIFF区分商务技术 NONE不区分商务技术
   * @memberof BidEvaluation
   */
  @Bind()
  fetchSectionList() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchSectionList`,
      payload: { sourceHeaderId: this.state.sourceHeaderId, sourceFrom: this.state.sourceFrom },
    }).then((res) => {
      if (res && res.subjectMatterRule === 'PACK') {
        // 分标段,标段查询后，设置activeKey和supplierDimension默认值
        const bidLineItemIds = res.sectionData.map((item) => item.bidLineItemId);
        // 查询供应商维度
        this.fetchSupplierList(bidLineItemIds);
        // 查询专家维度
        this.fetchBidExpertList({}, bidLineItemIds);
        this.setState({ activeKey: `${res.sectionData[0].bidLineItemId}` });
        let supplierDimension = {};
        bidLineItemIds.forEach((item) => {
          supplierDimension = { ...supplierDimension, [item]: true };
        });
        this.setState({ supplierDimension });
      } else {
        // 不分标段,设置supplierDimension默认值
        this.fetchSupplierList();
        this.fetchExpertList({});
        this.setState({ supplierDimension: { flag: true } });
      }
    });
    // 寻源有全部重新评分和ip校验的功能，招投标木有
    if (this.state.sourceFrom === 'RFX') {
      // 查询配置中心
      dispatch({
        type: `${modelName}/querySetting`,
        payload: {
          '011106': '011106', // 全部重新评分
          '011107': '011107', // ip校验
        },
      });
      queryTemplateConfig({
        sourceHeaderId: this.state.sourceHeaderId,
        sourceFrom: 'RFX',
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            templateConfig: res,
          });
        }
      });
    }
  }

  /**
   * 评标管理--不分标段-供应商查询 bidLineItemIds = []
   * 评标管理--标段-供应商查询 bidLineItemIds = [1,2,3]
   * @memberof BidEvaluation
   */
  @Bind()
  fetchSupplierList(bidLineItemIds = []) {
    const { dispatch, modelName = 'bidHall' } = this.props;
    const { sourceStatus } = this.state;
    const payload = isEmpty(bidLineItemIds)
      ? { sourceHeaderId: this.state.sourceHeaderId, sourceFrom: this.state.sourceFrom }
      : {
          sourceHeaderId: this.state.sourceHeaderId,
          sourceFrom: this.state.sourceFrom,
          bidLineItemIds,
        };
    dispatch({
      type: `${modelName}/fetchSupplierList`,
      payload: {
        ...payload,
        sourceStatus,
        customizeUnitCode:
          'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER_LINE,SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.SCORE_LINE_RFX_V2,SSRC.EXPERT_SCORE_MANAGE.REVIEW_LINE',
      },
    });
  }

  /**
   * 评标管理--不分标段-专家查询
   *
   * @memberof BidEvaluation
   */
  @Bind()
  fetchExpertList(page = {}) {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchExpertList`,
      payload: {
        page,
        sourceHeaderId: this.state.sourceHeaderId,
        sourceFrom: this.state.sourceFrom,
      },
    });
  }

  /**
   * 评标管理--分标段-专家查询
   *
   * @memberof BidEvaluation
   */
  @Bind()
  fetchBidExpertList(page = {}, bidLineItemId = '') {
    const {
      dispatch,
      bidHall: { expertBidList = {}, expertBidPagination = {} },
    } = this.props;
    dispatch({
      type: 'bidHall/fetchBidExpertList',
      payload: {
        page,
        bidLineItemId,
        sourceHeaderId: this.state.sourceHeaderId,
        sourceFrom: this.state.sourceFrom,
        expertBidList,
        expertBidPagination,
      },
    });
  }

  /**
   * 评标管理-专家查询-分页改变
   */
  @Bind()
  changeExpertPagination(current = undefined, pageSize = undefined, bidLineItemId) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    if (bidLineItemId !== 'flag') {
      // 标段分段查询
      this.fetchBidExpertList(changedPagination, bidLineItemId);
    } else {
      // 不分标段查询
      this.fetchExpertList(changedPagination);
    }
  }

  /**
   * 重新评分后，重新查询专家维度数据
   */
  @Bind()
  refreshExpertList(bidLineItemId) {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { expertPagination = {}, expertBidPagination = {}, sectionInfo = {} },
    } = this.props;
    // 不分标段
    if (bidLineItemId === 'flag') {
      this.fetchExpertList(expertPagination);
    } else {
      const bidLineItemIds = sectionInfo.sectionData.map((item) => item.bidLineItemId);
      this.fetchBidExpertList(expertBidPagination[bidLineItemId], bidLineItemIds);
    }
  }

  /**
   * 头部整体保存
   */
  @Bind()
  handleSave() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      [modelName]: { supplierList = {} },
    } = this.props;

    const list = supplierList[supplierList.subjectMatterRule] || []; // 评审供应商列表

    return new Promise((resolve) => {
      // 校验必输
      const validateList = getEditTableData(list);

      if (!isEmpty(validateList)) {
        const params =
          validateList &&
          validateList.map((item) => ({
            ...item,
            evaluateSummaryType: 'REVIEW_SCORE',
          }));

        dispatch({
          type: `${modelName}/saveReviewEvaluateSummary`,
          payload: { list: params, customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.REVIEW_LINE' },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchSupplierList();
            resolve(res);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  /**
   * 头部整体提交
   */
  @Bind()
  handleSubmit() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      [modelName]: { supplierList = {}, header },
    } = this.props;

    const { cachTabKey } = this.state;

    const list = supplierList[supplierList.subjectMatterRule] || []; // 评审供应商列表

    const validateList = getEditTableData(list);
    // 校验个性化必输字段
    if (validateList.length === 0) {
      return;
    }

    const submitFunc = () => {
      const params =
        validateList &&
        validateList.map((item) => ({
          ...item,
          evaluateSummaryType: 'REVIEW_SCORE',
        }));

      dispatch({
        type: `${modelName}/submitReviewEvaluateSummary`,
        payload: { list: params, customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.REVIEW_LINE' },
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.history.push({
            pathname: `${this.activeTabKey}/list`,
            search: `?${cachTabKey}`,
          });
        }
      });
    };
    const hasPassedItem = validateList.some((v) => v.summaryReviewResult === 'APPROVED'); // 是否存在审批通过的供应商
    if (hasPassedItem) {
      submitFunc();
    } else {
      Modal.confirm({
        title: intl
          .get(`ssrc.bidHall.view.message.validation.commonPassedSupplierNotExist`, {
            checkPriceName: getCheckPriceName(header.secondarySourceCategory === 'NEW_BID'),
          })
          .d(
            '不存在符合性检查通过的供应商，单据提交后将进入到{checkPriceName}阶段，是否继续提交？'
          ),
        onOk: submitFunc,
      });
    }
  }

  /**
   * 评标管理-标段-评分汇总保存
   */
  @Bind()
  saveEvaluateSummary() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      [modelName]: { supplierList = {}, sectionInfo = {} },
      organizationId,
    } = this.props;
    const { activeKey } = this.state;
    let supplierArray = [];
    let supplierTableKey = '';

    if (activeKey) {
      // 分标段
      const supplierArrays = supplierList[supplierList.subjectMatterRule].find(
        (element) => element.bidLineItemId === activeKey
      );
      supplierArray = supplierArrays ? supplierArrays.supplier : [];
      supplierTableKey = activeKey;
    } else {
      // 不分标段
      supplierArray = supplierList[supplierList.subjectMatterRule];
      supplierTableKey = 'flag';
    }
    let validateFlag = true;
    // 校验供应商表格必输字段
    // eslint-disable-next-line no-unused-expressions
    this.supplierTable[supplierTableKey]?.props?.form?.validateFieldsAndScroll(
      { force: true },
      (err) => {
        if (err || !isEmpty(err)) {
          validateFlag = false;
        }
      }
    );
    if (!validateFlag) return false;

    const list =
      supplierArray &&
      supplierArray.map((item) => {
        return {
          evaluateSummaryId: item.evaluateSummaryId,
          invalidFlag: this.supplierTable[supplierTableKey].props.form.getFieldValue(
            activeKey ? `${activeKey}#${item.quotationHeaderId}` : `flag#${item.quotationHeaderId}`
          ),
          invalidReason: this.supplierTable[supplierTableKey].props.form.getFieldValue(
            activeKey
              ? `${activeKey}#${item.quotationHeaderId}#reason`
              : `flag#${item.quotationHeaderId}#reason`
          ),
          tenantId: organizationId,
          sourceHeaderId: this.state.sourceHeaderId,
          sourceFrom: this.state.sourceFrom,
          sectionId: activeKey || null,
          quotationHeaderId: item.quotationHeaderId,
          businessScore: item.businessScoreTotal,
          technologyScore: item.technologyScoreTotal,
          score: item.scoreTotal,
          businessWeight: item.businessWeight,
          technologyWeight: item.technologyWeight,
          evaluateScoreHeader2VersionMapping: item.evaluateScoreHeader2VersionMapping,
        };
      });
    return dispatch({
      type: `${modelName}/saveEvaluateSummary`,
      payload: { list },
    }).then((res) => {
      if (res) {
        notification.success();
        const bidLineItemIds =
          sectionInfo.sectionData && sectionInfo.sectionData.map((item) => item.bidLineItemId);
        this.fetchSupplierList(bidLineItemIds);
        return res;
      }
    });
  }

  // 保存/提交获取所有数据
  @Bind()
  getSaveSubmitData() {
    const { sourceFrom = 'BID', activeKey } = this.state;
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { supplierList = {} },
      organizationId,
    } = this.props;

    let supplierArray = [];
    let supplierTableKey = '';
    if (supplierList.subjectMatterRule === 'PACK') {
      // 分标段
      const elementArray = [];
      supplierList[supplierList.subjectMatterRule].forEach((item) => {
        const { bidLineItemId, supplier = [] } = item;
        let elementObject = {};
        supplier.forEach((elementItem) => {
          elementObject = { ...elementItem, bidLineItemId };
          elementArray.push(elementObject);
        });
      });
      supplierArray = elementArray;
      supplierTableKey = activeKey;
    } else {
      supplierArray = supplierList[supplierList.subjectMatterRule];
      supplierTableKey = 'flag';
    }

    let validateFlag = true;
    // 校验供应商表格必输字段
    // eslint-disable-next-line no-unused-expressions
    this.supplierTable[supplierTableKey]?.props?.form?.validateFieldsAndScroll(
      { force: true },
      (err) => {
        if (err || !isEmpty(err)) {
          validateFlag = false;
          // todo: 目前只有这一个字段校验必输，产品说用具体的提示语，后续如果加字段需要修改此处
          notification.warning({
            message: intl
              .get('ssrc.bidHall.view.message.validation.supplierTable')
              .d('请填写建议无效原因再提交'),
          });
        }
      }
    );
    if (!validateFlag) {
      return {
        validateFlag,
      };
    }

    const list =
      supplierArray &&
      supplierArray.map((item) => {
        const invalidFlag = this.supplierTable?.[
          item.bidLineItemId || item.bidLineItemId === 0 ? item.bidLineItemId : 'flag'
        ]?.props?.form?.getFieldValue?.(
          item.bidLineItemId || item.bidLineItemId === 0
            ? `${item.bidLineItemId}#${item.quotationHeaderId}`
            : `flag#${item.quotationHeaderId}`
        );
        const invalidReason = this.supplierTable?.[
          item.bidLineItemId || item.bidLineItemId === 0 ? item.bidLineItemId : 'flag'
        ]?.props?.form?.getFieldValue?.(
          item.bidLineItemId || item.bidLineItemId === 0
            ? `${item.bidLineItemId}#${item.quotationHeaderId}#reason`
            : `flag#${item.quotationHeaderId}#reason`
        );

        return {
          invalidReason,
          evaluateSummaryId: item.evaluateSummaryId,
          invalidFlag: invalidFlag || invalidFlag === 0 ? invalidFlag : item.invalidFlag,
          organizationId,
          tenantId: organizationId,
          sourceHeaderId: this.state.sourceHeaderId,
          sourceFrom,
          sectionId: item.bidLineItemId || item.bidLineItemId === 0 ? item.bidLineItemId : null,
          quotationHeaderId: item.quotationHeaderId,
          businessScore: item.businessScoreTotal,
          technologyScore: item.technologyScoreTotal,
          score: item.scoreTotal,
          businessWeight: item.businessWeight,
          technologyWeight: item.technologyWeight,
          evaluateScoreHeader2VersionMapping: item.evaluateScoreHeader2VersionMapping,
        };
      });

    return {
      list,
    };
  }

  /**
   * 获得废标行
   */
  @Bind
  getAbandon() {
    const abondonArray = [];
    const abondonLine = this.supplierTable?.flag?.props.form.getFieldsValue() || {};
    for (const item in abondonLine) {
      if (abondonLine[item] === 1) {
        const id = item.split('flag#')[1];
        abondonArray.push(id);
      }
    }
    return abondonArray;
  }

  /**
   * 评标管理-整单提交
   */
  @Bind
  async submitEvaluateSummary() {
    const { exportScoringBussSum, history } = this.props;
    const { templateConfig } = this.state;

    const { list = [], validateFlag = true } = this.getSaveSubmitData() || {};

    if (!validateFlag) {
      return;
    }

    // sourceFrom === 'RFX' &&
    const sureAndSubmit = () => {
      const {
        cachTabKey,
        backRecommend = '',
        sourceFrom = 'BID',
        evaluateLeaderFlag,
        routerParams: { sourceProjectId, projectLineSectionId },
      } = this.state;
      const { modelName = 'bidHall' } = this.props;
      const {
        dispatch,
        [modelName]: { header = {}, bidEvalProgress = [] },
        organizationId,
        match: { params },
      } = this.props;
      const {
        roundQuotationRule = null,
        openBidOrder = null,
        currentSequenceNum = null,
        existSecondOpenBidFlag,
      } = header;

      const couldMultiQuotation =
        sourceFrom === 'RFX' &&
        ['SCORE', 'AUTO_SCORE'].includes(roundQuotationRule) &&
        openBidOrder === 'TECH_FIRST' &&
        currentSequenceNum === 1;

      this.setState({ quotationHeaderIds: this.getAbandon() });

      const Submitted = () => {
        dispatch({
          type: `${modelName}/submitEvaluateSummary`,
          payload: {
            list: exportScoringBussSum
              ? exportScoringBussSum.process('SSRC_EXPERT_SCORING_BUSS_SUM_SUMMARY_SUBMIT', list, {
                  header,
                  that: this,
                })
              : list,
            organizationId,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            if (this.state.sourceFrom === 'BID') {
              const search = querystring.stringify({
                backRecommend,
                cachTabKey,
                sourceProjectId,
                projectLineSectionId,
              });
              if (bidEvalProgress[bidEvalProgress.length - 2].nextProgressUserFlag === 1) {
                dispatch(
                  routerRedux.push({
                    pathname: `${this.activeTabKey}/confirm-bid-candidate/${params.bidId}`,
                    search,
                  })
                );
              } else {
                this.props.history.push({
                  pathname: `${this.activeTabKey}/list`,
                  search: `?${cachTabKey}`,
                });
              }
            } else if (sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI') {
              const index = bidEvalProgress.findIndex((i) => i.isCurrentFlag === 1);
              const flag =
                bidEvalProgress?.[index + 1]?.progressName === 'PRE_EVALUATION_PENDING_RFX';
              const search = querystring.stringify({
                backRecommend,
                cachTabKey,
                evaluateLeaderFlag,
                sourceProjectId,
                projectLineSectionId,
                sourceFrom,
                sourceHeaderId: params.sourceHeaderId,
                sourceStatus: flag ? 'PRE_EVALUATION_PENDING' : 'SCORING',
              });
              const currentProgress = bidEvalProgress.find((n) => n.isCurrentFlag === 1) || {};
              const minStepIndex = Number(
                bidEvalProgress && bidEvalProgress[0] && bidEvalProgress[0].progressSequence
              );
              if (currentProgress.nextProgressUserFlag === 1) {
                if (
                  bidEvalProgress[currentProgress.progressSequence - minStepIndex + 1]
                    ?.progressName === 'BUSINESS_SCORING_RFX' ||
                  bidEvalProgress[currentProgress.progressSequence - minStepIndex + 1]
                    ?.progressName === 'TECHNOLOGY_SCORING_RFX'
                ) {
                  dispatch(
                    routerRedux.push({
                      pathname: `${this.activeTabKey}/rfx-evaluation-proc-manage/${params.sourceHeaderId}`,
                      search,
                    })
                  );
                } else {
                  dispatch(
                    routerRedux.push({
                      pathname: `${this.activeTabKey}/confirm-candidate/${params.sourceHeaderId}`,
                      search,
                    })
                  );
                }
              } else {
                this.props.history.push({
                  pathname: `${this.activeTabKey}/list`,
                  search: `?${cachTabKey}`,
                });
              }
            }
          }
        });
      };

      // 开启新开标功能 && 先技术 或者 先商务 && 当前处于先的组别
      if (
        existSecondOpenBidFlag === 1 &&
        sourceFrom === 'RFX' &&
        currentSequenceNum === 1 &&
        (openBidOrder === 'TECH_FIRST' || openBidOrder === 'BUSINESS_FIRST')
      ) {
        submitEvaluateNewOpenBidSummary({
          list: exportScoringBussSum
            ? exportScoringBussSum.process('SSRC_EXPERT_SCORING_BUSS_SUM_SUMMARY_SUBMIT', list, {
                header,
                that: this,
              })
            : list,
        }).then((res) => {
          if (res) {
            notification.success();
            if (sourceFrom === 'RFX') {
              this.props.history.push({
                pathname: `${this.activeTabKey}/list`,
                search: `?${cachTabKey}`,
              });
            }
          }
        });
      } else if (couldMultiQuotation) {
        // 校验通过后才执行后续
        this.handleRoundQuotation();
      } else {
        Submitted();
      }
    };

    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { secondarySourceCategory = null } = header || {};

    if (exportScoringBussSum?.event) {
      exportScoringBussSum.event.fireEvent('remoteSureAndSubmit', {
        sureAndSubmit,
        bidFlag: secondarySourceCategory === 'NEW_BID',
        templateConfig,
        header,
        supplierList: list,
        history,
      });
    } else {
      sureAndSubmit();
    }
  }

  /**
   * 插入专家评分操作记录
   */
  @Bind()
  async insertScoringOperationRecord() {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { bidEvalProgress = [] },
    } = this.props;
    const { sourceFrom, sourceHeaderId } = this.state;
    const currentObj = bidEvalProgress.find((item) => item.isCurrentFlag);
    const params = {
      sourceFrom,
      sourceHeaderId,
      organizationId,
      node: currentObj?.progressName,
    };
    return dispatch({
      type: `${modelName}/insertScoringOperationRecord`,
      payload: params,
    });
  }

  /**
   * 提交后判定是否发起多轮报价
   */
  @Bind()
  handleRoundQuotation() {
    // add -- 插入专家评分节点操作记录
    this.insertScoringOperationRecord();
    this.setState((state) => {
      const {
        routerParams: { projectLineSectionId },
      } = state;
      // 判断是否分标段
      // eslint-disable-next-line no-unused-expressions
      !projectLineSectionId && this.fetchRfxScoreItemLines({}, state); // 非分标段
      return { roundQuotationModalVisible: true };
    });
  }

  /**
   * 发起多轮报价
   */
  @Bind
  @Throttle(1000)
  startRoundQuotation(roundQuotationData = {}, filterRoundQuoKeys = [], filterScoreKeys = []) {
    const {
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
      exportScoringBussSum,
    } = this.props;
    const {
      sourceStatus,
      sourceHeaderId = null,
      routerParams: { projectLineSectionId },
    } = this.state;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { list = [], validateFlag = true } = this.getSaveSubmitData() || {};
    if (!validateFlag) {
      return;
    }
    const { curRecord } = roundQuotationData || {};
    dispatch({
      type: `${modelName === 'bidHall' ? 'inquiryHall' : modelName}/${
        projectLineSectionId
          ? 'submitEvalSumRoundQuotationOrScoringSection'
          : 'submitEvaluateSummaryStartQuotationScore'
      }`,
      payload: {
        sourceHeaderId,
        sourceHeaderIds: filterRoundQuoKeys,
        organizationId,
        startRoundFlag: 1,
        summaryList: exportScoringBussSum
          ? exportScoringBussSum.process(
              'SSRC_EXPERT_SCORING_BUSS_SUM_SUMMARY_SUBMIT_ROUND',
              list,
              {
                header,
                that: this,
              }
            )
          : list,
        sourceStatus,
      },
    }).then((res) => {
      if (!res) {
        return;
      }

      // 存在开始评分才调用接口, 直接跳转页面关闭弹窗
      if (filterScoreKeys?.length) {
        return this.startScore(roundQuotationData, filterRoundQuoKeys, filterScoreKeys);
      }

      this.setState(
        {
          sourceStatus: 'ROUND_QUOTATION',
        },
        () => {
          this.directRfxEvaluation(curRecord);
          this.candelRoundQuotationModal();
        }
      );
    });
  }

  /**
   * 打开比价助手模态框
   */
  @Bind()
  priceComparisonAssistant(priceComparisonProps) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const bidFlag = header.secondarySourceCategory === 'NEW_BID';
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: bidFlag ? (
        <BidPriceComparison {...priceComparisonProps} />
      ) : (
        <PriceComparison {...priceComparisonProps} />
      ),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
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
   * 开始评分
   * @param {?Object} roundQuotationData - 多轮报价回传数据
   * @param {!Object} filterRoundQuoKeys - 多轮报价勾选行数组 - 针对分标段
   * @param {?Array} filterScoreKeys - 开始评分勾选行数组 - 针对分标段
   */
  @Bind
  @Throttle(1000)
  startScore(roundQuotationData = {}, ...otherParams) {
    const {
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
      exportScoringBussSum,
    } = this.props;
    const {
      sourceStatus,
      sourceHeaderId = null,
      routerParams: { projectLineSectionId },
    } = this.state;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const handleStartScoreJump = async () => {
      const filterScoreKeys = isArray(otherParams) ? otherParams.pop() : [];
      const { list = [], validateFlag = true } = this.getSaveSubmitData() || {};
      if (!validateFlag) {
        return;
      }
      const { curRecord } = roundQuotationData || {};
      try {
        await dispatch({
          type: `${modelName === 'bidHall' ? 'inquiryHall' : modelName}/${
            projectLineSectionId
              ? 'submitEvalSumRoundQuotationOrScoringSection'
              : 'submitEvaluateSummaryStartQuotationScore'
          }`,
          payload: {
            sourceHeaderId,
            sourceHeaderIds: filterScoreKeys || [],
            organizationId,
            startRoundFlag: 0,
            summaryList: exportScoringBussSum
              ? exportScoringBussSum.process(
                  'SSRC_EXPERT_SCORING_BUSS_SUM_SUMMARY_SUBMIT_SCORE',
                  list,
                  {
                    header,
                    that: this,
                  }
                )
              : list,
            sourceStatus,
          },
        }).then((res) => {
          if (!res) {
            return;
          }

          this.directRfxEvaluation(curRecord);
          this.candelRoundQuotationModal();
        });
      } catch (e) {
        throw e;
      }
    };
    if (exportScoringBussSum?.event) {
      // remoteStartScore 二开埋点方法名
      exportScoringBussSum.event.fireEvent('remoteStartScore', {
        handleStartScoreJump: (...params) => handleStartScoreJump(...params),
        startRoundQuotation: () => {
          // 如果多轮报价数据大于0就取多轮报价，否则将专家评分数据传过去
          const filterRoundQuoKeys = otherParams?.filterRoundQuoKeys;
          const roundQuoKeys =
            filterRoundQuoKeys?.length > 0 ? filterRoundQuoKeys : otherParams?.filterScoreKeys;
          const coreKeys = filterRoundQuoKeys?.length > 0 ? otherParams?.filterScoreKeys : [];
          return this.startRoundQuotation(roundQuotationData, roundQuoKeys, coreKeys);
        },
      });
    } else {
      handleStartScoreJump();
    }
  }

  /**
   * 跳转到专家评分列表
   */
  directRfxEvaluation() {
    const { cachTabKey } = this.state;
    // const { sourceHeaderId = null } = curRecord || this.state; // 分标段: 从弹窗回传中取值, 反之: 从当前state中获取
    // const search = querystring.stringify({
    //   cachTabKey: 'scoreing',
    //   sourceFrom: 'RFX',
    //   sourceHeaderId,
    //   sourceStatus,
    //   sourcePage: 'RFXList',
    //   roundQuotationRule,
    // });
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(this.activeTabKey)) {
      this.props.history.push({
        pathname: `${this.activeTabKey}/list`,
        search: '?sourceCategory=RFX',
      });
    } else {
      this.props.history.push({
        pathname: `${this.activeTabKey}/list`,
        search: `?${cachTabKey}`,
      });
    }
  }

  /**
   * 关闭供应商物品弹窗
   *
   * @memberof ExpertScoring
   */
  @Bind
  candelRoundQuotationModal() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;

    this.setState({
      roundQuotationModalVisible: false,
    });

    dispatch({
      type: `${modelName === 'bidHall' ? 'inquiryHall' : modelName}/updateState`,
      payload: {
        rfxScoreItemLineList: [],
        rfxScoreItemPagination: {},
      },
    });
  }

  /**
   *切换面板
   *
   * @memberof BidEvaluation
   */
  @Bind()
  changeTabs(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 切换维度
   * 分标段，标段1，2,3, 点击切换到供应商维度，设为true { 1: true }
   * 不分标段, 点击切换到供应商维度，设为 { flag: true}
   * @memberof BidEvaluation
   */
  @Bind()
  switchDimension() {
    const { activeKey, supplierDimension } = this.state;
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { sectionInfo = {} },
    } = this.props;
    // 分标段
    if (sectionInfo.subjectMatterRule === 'PACK') {
      if (supplierDimension[activeKey]) {
        // 若已经打开了供应商维度，再次点击，设为false
        this.setState({ supplierDimension: { ...supplierDimension, [activeKey]: false } });
      } else {
        this.setState({ supplierDimension: { ...supplierDimension, [activeKey]: true } });
      }
    } else {
      this.setState({ supplierDimension: { flag: !supplierDimension.flag } });
    }
  }

  /**
   * 渲染步骤条当前位置
   *
   * @param {*} [bidEvalProgress=[]]
   * @returns
   * @memberof BidEvaluation
   */
  renderCurrentStep(bidEvalProgress = []) {
    let current = 0;
    const minStepIndex = Number(
      bidEvalProgress && bidEvalProgress[0] && bidEvalProgress[0].progressSequence
    ); // 最小进度条下标, 应对符合性检查改造
    if (!isEmpty(bidEvalProgress)) {
      const currentObj = bidEvalProgress.find((item) => item.isCurrentFlag);
      current = currentObj?.progressSequence - minStepIndex;
    }
    return current;
  }

  /**
   * 渲染分标段供应商维度表格数据
   *
   * @param {*} [dataSource=[]]
   * @memberof BidEvaluation
   */
  renderSupplierList(dataSource = [], bidLineItem = {}) {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { sectionInfo = {} },
    } = this.props;
    let supplierList = [];
    if (
      !isEmpty(dataSource[sectionInfo.subjectMatterRule]) &&
      !isEmpty(
        dataSource[sectionInfo.subjectMatterRule].find(
          (element) => element.bidLineItemId === String(bidLineItem.bidLineItemId)
        )
      )
    ) {
      supplierList = dataSource[sectionInfo.subjectMatterRule].find(
        (element) => element.bidLineItemId === String(bidLineItem.bidLineItemId)
      ).supplier;
    }
    return supplierList;
  }

  /**
   * tab标签页文字浮动
   * @param {Object} item
   */
  renderTooTipTabs(item = {}) {
    return (
      <Tooltip title={`${item.sectionNum}-${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  }

  /**
   * 全部重新评分
   */
  @Bind()
  reScoringAll() {
    const {
      dispatch,
      modelName = 'bidHall',
      [modelName]: { expertList = [] },
      form,
      location,
    } = this.props;
    const { cachTabKey } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: `${modelName}/reScoringAll`,
          payload: {
            expertList,
            ...values,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.closeReScoringModal();
            // 根据当前tabKey返回对应列表页面
            const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);
            this.props.history.push({
              pathname: `${activeTabKey}/list`,
              search: `?${cachTabKey}`,
            });
          }
        });
      }
    });
  }

  /**
   * 全部重新评分 - 打开
   */
  @Bind()
  openReScoringModal() {
    this.setState({
      reScoringVisible: true,
    });
  }

  /**
   * 全部重新评分 - 关闭
   */
  @Bind()
  closeReScoringModal() {
    this.setState({
      reScoringVisible: false,
    });
  }

  /**
   * 跳转到招标详情时带参
   */
  getDirectSearch(record) {
    const {
      backRecommend,
      routerParams,
      routerParams: { cachTabKey },
    } = this.state;
    const {
      sourceHeaderId = '',
      sourceFrom = '',
      sourceStatus = '',
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = record || routerParams;

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
  directBidDetail() {
    const {
      dispatch,
      modelName = 'bidHall',
      match: { params },
    } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const {
      backRecommend,
      sourceFrom,
      sourceHeaderId,
      cachTabKey,
      sourceStatus,
      current,
    } = this.state;
    const search = this.getDirectSearch();
    const bidFlag = header.secondarySourceCategory === 'NEW_BID';
    const URL =
      sourceFrom === 'BID'
        ? `${this.activeTabKey}/bid-detail/${sourceHeaderId}`
        : sourceFrom === 'RFX'
        ? `${this.activeTabKey}/${bidFlag ? 'new-bid' : 'rfx'}-detail/${sourceHeaderId}`
        : `${this.activeTabKey}/rf-detail/${sourceFrom}/${sourceHeaderId}`;
    const backURL =
      sourceFrom === 'BID'
        ? `${this.activeTabKey}/bid-evaluation/${params.bidId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}`
        : `${this.activeTabKey}/rfx-evaluation/${params.sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}`;

    const source = {
      label: 'recommend',
      current,
      url: backURL,
    };
    sessionStorage.setItem('sourceRouter', JSON.stringify(source));
    sessionStorage.setItem(`sourceRouter+${this.activeTabKey}`, JSON.stringify(source));
    dispatch(
      routerRedux.push({
        pathname: URL,
        search,
      })
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        historys: backURL,
      },
    });
  }

  /**
   *导出
   *
   */
  exportData = () => {
    this.setState({
      exportLoading: true,
    });
    const {
      organizationId,
      dispatch,
      match: { params },
      modelName = 'bidHall',
    } = this.props;
    const { sourceFrom = '' } = this.state;
    const sourceHeaderId =
      sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI'
        ? params.sourceHeaderId
        : params.bidId;
    dispatch({
      type: `${modelName}/exportData`,
      payload: { organizationId, sourceFrom, sourceHeaderId },
    }).then((url) => {
      if (url) {
        fetch(url)
          .then((data) => data.blob())
          .then((zip) => {
            this.setState({
              exportLoading: false,
            });
            // IE兼容性处理
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(zip, 'SCORE.xlsx');
            } else {
              const blobUrl = window.URL.createObjectURL(zip);
              const a = document.createElement('a');
              a.download = decodeURIComponent('SCORE.xlsx');
              a.href = blobUrl;
              a.click();
            }
          });
      }
    });
  };

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
   * RFX/BID direction title
   *
   * @param {*} sourceFrom
   * @returns
   * @memberof BidEvaluation
   */
  renderInfo(sourceFrom = '') {
    const { exportScoringBussSum, modelName = 'bidHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { templateConfig } = this.state;
    const docLink =
      header && !isEmpty(header) && !this.reviewPendingAndHidePriceFlag() ? (
        <Tooltip
          title={
            sourceFrom === 'BID'
              ? intl.get(`ssrc.bidHall.view.message.button.viewBidDetail`).d('查看标书')
              : sourceFrom === 'RFX'
              ? intl.get(`ssrc.bidHall.view.message.button.viewOrderDetail`).d('查看单据详情')
              : intl.get(`ssrc.bidHall.view.message.button.viewRFDetail`).d('查看详情')
          }
          style={{ float: 'left' }}
        >
          <span style={{ marginLeft: '16px', cursor: 'pointer' }} onClick={this.directBidDetail}>
            <SvgIcon path={bidView} className={styles['link-color']} />
            <a style={{ marginLeft: '5px' }}>
              {sourceFrom === 'BID'
                ? intl.get(`ssrc.bidHall.view.message.button.bidDetail`).d('标书')
                : sourceFrom === 'RFX'
                ? intl.get(`ssrc.bidHall.view.message.button.viewOrderDetail`).d('查看单据详情')
                : intl.get(`ssrc.bidHall.view.message.button.viewRFDetail`).d('查看详情')}
            </a>
          </span>
        </Tooltip>
      ) : null;
    return exportScoringBussSum
      ? exportScoringBussSum.render('SSRC_EXPERT_SCORING_BUSS_SUM_RENDER_DOCLINK', docLink, {
          templateConfig,
        })
      : docLink;
  }

  /**
   * backPath 返回页判断
   *
   * @param {string} [sourceFrom='']
   * @returns
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  backJudge(sourceFrom = null) {
    const { cachTabKey = null, sourcePage = null } = this.state;
    let backPath = `/ssrc/expert-scoring/list?${cachTabKey}`;
    if (sourceFrom === 'RFX' && sourcePage === 'RFXList') {
      backPath = '/ssrc/inquiry-hall/list';
    }
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(this.activeTabKey)) {
      backPath = `${this.activeTabKey}/list?sourceCategory=${sourceFrom || 'RFX'}`;
    }
    return backPath;
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
  @Throttle(1000)
  async handleBargainOnline(data) {
    const { exportScoringBussSum } = this.props;
    const { sourceHeaderId } = this.state;
    const { bargainStatus = null } = data || {};
    const flag = data && data.bargainOfflineFlag === 1;

    if (exportScoringBussSum?.event) {
      const eventProps = {
        rfxHeaderId: sourceHeaderId,
      };
      const res = await exportScoringBussSum.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

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
          this.openBargainModal(data);
        }
      } else {
        this.openBargainModal(data);
      }
    };
    if (exportScoringBussSum?.event) {
      exportScoringBussSum.event.fireEvent('selectBargainWay', {
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

  /**
   * 议价方式点击确定跳转对应的界面
   */
  // @Throttle(1000)
  openBargainSyncFlag = 0; // 同步标识

  @debounce(500)
  @Bind()
  openBargainModal(data = {}) {
    if (isEmpty(data)) {
      return;
    }

    const {
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
      form: { getFieldValue },
      exportScoringBussSum,
    } = this.props;
    const {
      sourceHeaderId,
      backRecommend = '',
      sourceFrom = '',
      cachTabKey = '',
      sourceStatus = '',
      currentPage,
      bargainNewFlag,
    } = this.state;
    const {
      subjectMatterRule = null,
      projectLineSectionId = null,
      bargainStatus = null,
      bargainOfflineFlag = 0,
    } = data || {};
    const bargainTimeFinished = this.isBargainFinished(data);

    const pathname = `${this.activeTabKey}/${
      bargainNewFlag ? 'new-' : ''
    }rfx-bargain/${sourceHeaderId}`;

    let sectionSearch = {}; // 分标段增加路由参数
    if (subjectMatterRule === 'PACK') {
      sectionSearch = {
        sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
        projectLineSectionId,
      };
    }

    const search = querystring.stringify({
      backRecommend,
      sourceFrom,
      cachTabKey,
      sourceStatus,
      current: currentPage,
      ...sectionSearch,
    });
    this.setState({
      openBargainLoading: true,
    });

    // 议价弹框确定
    const openBargain = () => {
      if (this.openBargainSyncFlag === 1) return;
      this.openBargainSyncFlag = 1;
      dispatch({
        type: `${modelName === 'bidHall' ? 'inquiryHall' : modelName}/fetchOpenBargain`,
        payload: {
          organizationId,
          rfxHeaderId: sourceHeaderId,
          bargainMethod: data && bargainOfflineFlag === 0 ? 'ONLINE' : getFieldValue('sourceType'),
        },
      })
        .then((res) => {
          if (res) {
            this.props.history.push({
              pathname,
              search,
            });
            this.setState({
              onlineBargainVisible: false,
            });
          }
        })
        .finally(() => {
          this.openBargainSyncFlag = 0;
          this.setState({
            openBargainLoading: false,
          });
        });
    };

    // 直接跳转议价
    const directBargain = () => {
      this.props.history.push({
        pathname,
        search,
      });
    };

    const startNewBargain =
      (bargainStatus !== 'BARGAINING_ONLINE' && bargainStatus !== 'BARGAINING_OFFLINE') ||
      bargainTimeFinished;

    if (
      // bargainStatus !== 'BARGAIN_OFFLINE' &&
      // bargainStatus !== 'BARGAIN_ONLINE' &&
      startNewBargain
    ) {
      openBargain();
    } else if (exportScoringBussSum?.event) {
      exportScoringBussSum.event.fireEvent('directBargain', {
        data,
        openBargain,
        directBargain,
        bidFlag: data.secondarySourceCategory === 'NEW_BID',
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

  /**
   * 打开议价方式模态框
   */
  @Bind()
  bargainRuleModal(code) {
    const { onlineBargainVisible, openBargainLoading } = this.state;
    const {
      form: { getFieldDecorator },
      modelName = 'bidHall',
      [modelName]: { header = {} },
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
        onOk={() => this.openBargainModal(header)}
        title={intl.get('ssrc.bidHall.model.bidHall.selectSourceType').d('选择议价方式')}
      >
        <Row gutter={48}>
          <Col span={24} style={{ marginLeft: '20%' }}>
            <Form.Item
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
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    );
  }

  /**
   * IP重合率弹框-打开
   */
  @Bind()
  openIPCoincidenceRateModal() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    const { sourceHeaderId } = this.state;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: `${modelName}/fetchIPCoincidenceRate`,
      payload: { rfxHeaderId: sourceHeaderId },
    });
  }

  // 查看IP重合详情
  @Bind()
  handleViewIPDetail() {
    const { sourceHeaderId } = this.state;
    openIPDetailModal({
      rfxHeaderId: sourceHeaderId,
    });
  }

  /**
   * IP重合率弹框- 关闭
   */
  @Bind()
  confirmIpCoincidenceRate() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    this.setState({
      ipCoincidenceRateVisible: false,
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        ipCoincidenceRate: [],
      },
    });
  }

  /**
   * 绑定评审供应商ref
   */
  @Bind()
  handleBindRef(key, vnode) {
    this.reviewSupplierForm = vnode.props.form; // 后期增加招投标, 考虑到分标段情况, 因此直接绑定form
    this.supplierTable[key] = vnode;
  }

  @Bind()
  handleViewAttachment() {
    const {
      match: { params },
    } = this.props;
    const { sourceFrom = '' } = this.state;
    const ds = new DataSet(attachmentTableDS());
    ds.setQueryParameter('sourceHeaderId', params?.sourceHeaderId);
    ds.setQueryParameter('sourceFrom', sourceFrom);
    ds.query();
    const columns = [
      {
        name: 'loginName',
      },
      {
        name: 'expertName',
      },
      {
        name: 'reviewAttachmentUuid',
      },
      {
        name: 'reviewDate',
      },
    ];
    c7nModal.open({
      key: c7nModal.key(),
      drawer: true,
      closable: true,
      title: intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件'),
      style: { width: '742px' },
      children: <Table dataSet={ds} columns={columns} style={{ maxHeight: '590px' }} />,
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (_, cancelBtn) => cancelBtn,
      cancelProps: {
        color: 'primary',
      },
    });
  }

  // 根据当前tabKey返回对应列表页面
  directExpertWorkbenchList = () => {
    const { location } = this.props;
    const { cachTabKey } = this.state;

    const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);
    this.props.history.push({
      pathname: `${activeTabKey}/list`,
      search: `?${cachTabKey}`,
    });
  };

  @Throttle(2000)
  confirmReviewReScoringAll = async () => {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const { sourceFrom } = this.state;
    const { current } = this.reviewAllRescoreDs || {};
    const { sourceHeaderId } = params || {};

    const validateFlag = await this.reviewAllRescoreDs.validate();
    if (!validateFlag) {
      return false;
    }

    const formData = current.toData();
    const data = {
      ...formData,
      sourceFrom,
      sourceHeaderId,
      organizationId,
    };

    this.toggleOperationLoading(true);
    let result = null;
    try {
      result = await reviewRescoringAll(data);
      result = getResponse(result);
      this.toggleOperationLoading(false);
      if (!result) {
        return false;
      }

      notification.success();
      this.directExpertWorkbenchList();
    } catch (e) {
      throw e;
    }
  };

  closeReviewReScoringModal = () => {
    this.reviewAllRescoreDs.reset();
    this.reviewAllRescoreDs.loadData([]);
  };

  handleReviewRescoringAll = () => {
    const { current } = this.reviewAllRescoreDs || {};
    if (!current) {
      this.reviewAllRescoreDs.create();
    }

    c7nModal.open({
      key: c7nModal.key(),
      drawer: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.reComplianceCheck`).d('重新符合性检查'),
      style: { width: 380 },
      children: (
        <div>
          <C7NForm dataSet={this.reviewAllRescoreDs} labelLayout="float" columns={1}>
            <C7NTextArea name="reReviewReason" row={8} resize="vertical" />
          </C7NForm>
        </div>
      ),
      onOk: this.confirmReviewReScoringAll,
      onClose: this.closeReviewReScoringModal,
    });
  };

  // 获取参数值
  getRouterParams() {
    const {
      location: { search = {} },
    } = this.props;
    return querystring.parse(search.substr(1)) || {};
  }

  /**
   * 永祥二开-方法重写
   */
  renderHeaderButtons() {
    const { modelName = 'bidHall' } = this.props;
    const {
      match: { params },
      exportScoringBussSum,
      [modelName]: { bidEvalProgress = [], settings = {}, header = {} },
      fetchSupplierListLoading,
      saveEvaluateSummaryLoading,
      submitEvaluateSummaryLoading,
      customizeBtnGroup = () => {},
      history,
      organizationId,
      operateLoading,
    } = this.props;
    const { existSecondOpenBidFlag } = header;

    const {
      sourceFrom = '',
      exportLoading = false,
      sourceStatus,
      sourceHeaderId = '',
      routerParams,
      templateConfig = {},
      attachmentCount = '',
    } = this.state;

    const { roundQuotationRule, bidRuleType = '', sourceCategory, diyLadderQuotationFlag } =
      header || {};

    // 比价助手
    const priceComparisonProps = {
      sourceCategory,
      rfxId: params.sourceHeaderId,
      // visible: priceComparisonModalVisible,
      // onHideModal: this.hidePriceComparison,
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };

    // 报价是否隐藏
    // const quoVisible = (scoringProgress === 'TECHNOLOGY'
    // && openBidOrder === 'TECH_FIRST'
    // && roundQuotationRule === 'SCORE');

    const currentStep = bidEvalProgress.find((item) => item.isCurrentFlag) || {};
    // 展示汇总气泡
    const showSummaryPopover =
      !existSecondOpenBidFlag &&
      ['SCORE', 'AUTO_SCORE'].includes(roundQuotationRule) &&
      currentStep.progressName !== 'BUSINESS_SUMMARY_RFX';
    let SummaryButton = null;
    let reScoringAllButton = null;
    let exportButton = null;
    let negotiatedPrice = null;
    let submitBtn = null;
    let saveBtn = null;
    let compareBtn = null;
    let viewAttachmentBtn = null;
    let viewResponseDetail = null;
    const PriceButtonProps = {
      history,
      sourceFrom,
      sourceHeaderId,
      organizationId,
      name: 'viewResponseDetail',
      getRouterParams: this.getRouterParams,
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      priceRepliedCount: header.priceRepliedCount,
    };

    if (!['RFX_INITIAL_REVIEW_PENDING', 'INITIAL_REVIEW_SCORING'].includes(sourceStatus)) {
      SummaryButton = (
        <PopoverButton
          btnType="h0"
          icon="check"
          type="primary"
          name="sureAndsummary"
          onClick={this.submitEvaluateSummary}
          loading={submitEvaluateSummaryLoading || fetchSupplierListLoading}
          disabled={header.bargainClosedFlag === 0}
          showPopover={showSummaryPopover}
          content={intl
            .get(`ssrc.bidHall.view.message.openBusinessBiddingTips`)
            .d('点击确认后，既开启商务标，无法再退回技术评分阶段')}
        >
          {intl.get(`ssrc.bidHall.view.message.button.sureAndsummary`).d('确认及汇总')}
        </PopoverButton>
      );

      if (
        [2, '2'].includes(templateConfig?.systemVersion)
          ? templateConfig?.repeatScoreFlag
          : settings['011106'] && +settings['011106'].settingValue && sourceFrom === 'RFX'
      ) {
        reScoringAllButton = (
          <Button onClick={this.openReScoringModal} name="reScoringAll">
            <Iconfont type="re-rating-all" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.bidHall.view.message.button.reScoringAll`).d('全部重新评分')}
          </Button>
        );
      }
      exportButton = (
        <Button icon="export" loading={exportLoading} onClick={this.exportData} name="exportHeader">
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
      );

      // 价格澄清 visible
      let priceClarifyVisible = !['RFI', 'RFP'].includes(sourceFrom);
      priceClarifyVisible = exportScoringBussSum
        ? exportScoringBussSum.process(
            'SSRC.EXPERT_SCORE_MANAGE_PROCESS_PRICECLARIFY_BUTTON_VISIBLE',
            priceClarifyVisible,
            {
              that: this,
              currentStep,
              sourceStatus,
            }
          )
        : priceClarifyVisible;

      viewResponseDetail = priceClarifyVisible ? (
        <PriceClarificationButtons {...PriceButtonProps} />
      ) : null;

      if (
        header &&
        (header.bargainRule === 'SCORE' || header.bargainRule === 'ALL') &&
        (header.scoringProgress === 'BUSINESS' || header.scoringProgress === 'BUSINESS_TECHNOLOGY')
      ) {
        negotiatedPrice = (
          <Button
            onClick={() => this.handleBargainOnline(header)}
            disabled={header.roundHeaderStatus === 'ROUND_SCORING'}
            name="negotiatedPrice"
          >
            <Iconfont type="main-reinquiry" style={{ marginRight: '8px' }} />
            {intl.get('ssrc.bidHall.view.button.negotiatedPrice').d('议价')}
          </Button>
        );
      }
    }

    /**
     * 提交按钮
     */
    if (sourceStatus === 'RFX_INITIAL_REVIEW_PENDING') {
      submitBtn = (
        <Button
          icon="check"
          onClick={this.handleSubmit}
          type="primary"
          name="submitEvaluate"
          loading={submitEvaluateSummaryLoading || fetchSupplierListLoading || operateLoading}
        >
          {intl.get('hzero.common.button.submit').d('提交')}
        </Button>
      );

      reScoringAllButton = (
        <Button onClick={this.handleReviewRescoringAll} name="reReviewAll" loading={operateLoading}>
          <Iconfont type="re-rating-all" style={{ marginRight: '8px' }} />
          {intl.get(`ssrc.inquiryHall.view.message.title.reComplianceCheck`).d('重新符合性检查')}
        </Button>
      );

      /**
       * 保存按钮
       */
      saveBtn = (
        <Button
          icon="save"
          onClick={this.handleSave}
          name="saveEvaluate"
          loading={saveEvaluateSummaryLoading || fetchSupplierListLoading || operateLoading}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
    }

    if (
      !['RFI', 'RFP'].includes(sourceFrom) &&
      (bidRuleType === 'NONE' ||
        (bidRuleType === 'DIFF' &&
          (currentStep.progressName === 'BUSINESS_SUMMARY_RFX' ||
            currentStep.progressName === 'BID_EVALUATION_PENDING_RFX')) ||
        sourceStatus === 'RFX_INITIAL_REVIEW_PENDING')
    ) {
      /**
       * 比价助手 - 寻源&&评分&&非技术组
       */
      compareBtn =
        header && !isEmpty(header) && !this.reviewPendingAndHidePriceFlag() ? (
          <Button
            type="default"
            name="priceAssistant"
            onClick={() => this.priceComparisonAssistant(priceComparisonProps)}
            style={{ marginRight: '8px' }}
          >
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </Button>
        ) : null;
    }

    if (currentStep.progressName === 'RFX_INITIAL_REVIEW_PENDING_RFX') {
      viewAttachmentBtn = (
        <Button onClick={this.handleViewAttachment} name="viewAttachment">
          <Icon
            type="attach_file"
            style={{ fontWeight: '400', fontSize: '12px', marginRight: '4px' }}
          />
          {intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件')}&nbsp;{attachmentCount}
        </Button>
      );
    }
    const buttonGroup = [
      SummaryButton,
      exportButton,
      negotiatedPrice,
      submitBtn,
      saveBtn,
      reScoringAllButton,
      compareBtn,
      viewAttachmentBtn,
      viewResponseDetail,
    ].filter(Boolean);

    if (!exportScoringBussSum) {
      return customizeBtnGroup({ code: 'SSRC.EXPERT_SCORE_MANAGE.HEADER_BUTTON' }, buttonGroup);
    }

    const otherProps = {
      header,
      sourceFrom,
      currentStep,
      rfxHeaderId: sourceHeaderId,
      history,
      activeTabKey: this.activeTabKey,
      routerParams,
      that: this,
      organizationId,
    };

    return customizeBtnGroup(
      { code: 'SSRC.EXPERT_SCORE_MANAGE.HEADER_BUTTON' },
      exportScoringBussSum.process(
        'SSRC_EXPERT_SCORING_SUM_HEADER_BUTTONS',
        buttonGroup,
        otherProps
      )
    );
  }

  @Bind()
  saveSupplierTableRef(key, node) {
    this.supplierTable[key] = node;
  }

  handleSectionPanelRef = (node) => {
    this.sectionRef = node;
  };

  /**
   * 屈臣氏二开
   * @param {*} expertProps 评分参数
   * @param {*} otherProps  额外参数
   * @returns component
   */
  renderExpertList(expertProps, otherProps) {
    return <ExpertsList {...expertProps} {...otherProps} />;
  }

  // 渲染 `Conetent` 组件
  renderContent() {
    const { modelName = 'bidHall', location, modelBidName = 'bidHall' } = this.props;
    const {
      [modelName]: {
        sectionInfo = {},
        bidEvalProgress = [],
        supplierList = {},
        expertBidList = {},
        expertBidPagination = {},
        expertList = [],
        expertPagination = {},
        settings = {},
        code = {},
        header = {},
      },
      [modelBidName]: model,
      organizationId,
      match: { params },
      fetchSupplierListLoading,
      saveEvaluateSummaryLoading,
      customizeTable,
      history,
      dispatch,
      exportScoringBussSum,
      fetchScoreLineLoading,
      fetchExpertScoreInfoLoading,
    } = this.props;
    const {
      activeKey,
      supplierDimension = {},
      sourceFrom = '',
      current,
      sourceStatus,
      backRecommend,
      cachTabKey,
      newQuotationFlag = 0,
      templateConfig = {},
      useNewRateFlag = 0,
    } = this.state;

    const bidFlag = header.secondarySourceCategory === 'NEW_BID';

    const sourceHeaderId =
      sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI'
        ? params.sourceHeaderId
        : params.bidId;
    const operations = (
      <React.Fragment>
        {useNewRateFlag && sourceFrom === 'RFX' ? (
          <a onClick={this.handleViewIPDetail}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`).d('查看IP重合详情')}
          </a>
        ) : settings['011107'] &&
          +settings['011107'].settingValue &&
          sourceFrom === 'RFX' &&
          supplierDimension[activeKey] ? (
          <a onClick={this.openIPCoincidenceRateModal} style={{ marginRight: '16px ' }}>
            {intl.get('ssrc.inquiryHall.view.message.button.IPCoincidenceRate').d('IP重合率')}
          </a>
        ) : (
          ''
        )}
        <a onClick={this.switchDimension}>
          {supplierDimension[activeKey]
            ? `${intl
                .get(`ssrc.bidHall.view.message.button.switchExpertsDimension`)
                .d('切换专家维度')}`
            : `${intl
                .get(`ssrc.bidHall.view.message.button.switchSuppliersDimension`)
                .d('切换供应商维度')}`}
        </a>
      </React.Fragment>
    );
    const expertProps = {
      header,
      bidFlag,
      settings,
      sourceFrom,
      dispatch,
      sourceHeaderId,
      backRecommend,
      cachTabKey,
      bidHall: model,
      organizationId,
      customizeTable,
      exportScoringBussSum,
      modelName: modelBidName,
      fetchScoreLineLoading,
      fetchExpertScoreInfoLoading,
      onChangeExpertPagination: this.changeExpertPagination,
      onFetchExpertList: this.refreshExpertList,
      current,
      sourceStatus,
      newQuotationFlag,
      templateConfig,
    };
    const supplierProps = {
      code,
      bidFlag,
      header,
      location,
      settings,
      sourceFrom,
      sourceStatus,
      bidEvalProgress,
      customizeTable,
      exportScoringBussSum,
      saveEvaluateSummaryLoading,
      loading: fetchSupplierListLoading,
      supplierInfo: supplierList,
      bidRuleType: supplierList.bidRuleType, // 区分商务技术
      openBidOrder: supplierList.openBidOrder, // 是否同步开标
      currentTeam: supplierList.currentTeam, // 当前组别
      history,
      onRef: this.saveSupplierTableRef,
      evaluateShowType: supplierList.evaluateShowType,
      rfxTitle: sectionInfo.sourceName,
      title: `${sectionInfo.sourceNumber}-${sectionInfo.sourceName}`,
      onSaveEvaluateSummary: this.saveEvaluateSummary,
      newQuotationFlag,
      scoreType: supplierList.scoreType, // 评分类型
      useNewRateFlag,
    };
    // 初步评审供应商
    const reviewSupplierProps = {
      customizeTable,
      code,
      location,
      title: `${sectionInfo.sourceNumber}-${sectionInfo.sourceName}`,
      onRef: this.handleBindRef,
      history,
      dataSource: supplierList[supplierList.subjectMatterRule],
      loading: fetchSupplierListLoading,
      newQuotationFlag,
      sourceStatus,
      header,
      exportScoringBussSum,
    };
    return (
      <Content>
        {
          // 分标段
          sectionInfo.subjectMatterRule === 'PACK' ? (
            <React.Fragment>
              <div style={{ fontSize: '14px' }}>
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
                  {sectionInfo.sourceNumber}-
                  <Tooltip title={sectionInfo.sourceName} overlayStyle={{ minWidth: '300px' }}>
                    {sectionInfo.sourceName}
                  </Tooltip>
                </span>
                {this.renderInfo(sourceFrom)}
              </div>
              <Tabs
                activeKey={activeKey}
                className={styles.tabStyle}
                tabBarExtraContent={operations}
                onChange={this.changeTabs}
                animated={false}
              >
                {sectionInfo.sectionData &&
                  sectionInfo.sectionData.map((item) => {
                    return (
                      <TabPane
                        tab={this.renderTooTipTabs(item)}
                        key={item.bidLineItemId}
                        // forceRender
                      >
                        <div
                          style={{
                            display: supplierDimension[item.bidLineItemId] ? 'block' : 'none',
                          }}
                        >
                          <SupplierTable
                            {...supplierProps}
                            supplierList={this.renderSupplierList(supplierList, item)}
                            bidLineItemId={item.bidLineItemId}
                          />
                        </div>
                        <div
                          style={{
                            display: supplierDimension[item.bidLineItemId] ? 'none' : 'block',
                          }}
                        >
                          {this.renderExpertList(expertProps, {
                            expertList: expertBidList[item.bidLineItemId] || [],
                            expertPagination: expertBidPagination[item.bidLineItemId] || {},
                            bidLineId: item.bidLineItemId,
                          })}
                        </div>
                      </TabPane>
                    );
                  })}
              </Tabs>
            </React.Fragment>
          ) : (
            // 不分标段
            <React.Fragment>
              <div className={styles.sectionHeaderInfo}>
                <span
                  style={{
                    display: 'inline-block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '75%',
                    float: 'left',
                  }}
                >
                  {sectionInfo.sourceNumber}-
                  <Tooltip
                    title={`${sectionInfo.sourceNumber}-${sectionInfo.sourceName}`}
                    overlayStyle={{ minWidth: '300px' }}
                  >
                    {sectionInfo.sourceName}
                  </Tooltip>
                </span>
                {this.renderInfo(sourceFrom)}
                <span className={styles.switchDimensionRight}>
                  {useNewRateFlag && sourceFrom === 'RFX' ? (
                    <a onClick={this.handleViewIPDetail}>
                      {intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`)
                        .d('查看IP重合详情')}
                    </a>
                  ) : settings['011107'] &&
                    +settings['011107'].settingValue &&
                    sourceFrom === 'RFX' &&
                    supplierDimension.flag ? (
                    <a onClick={this.openIPCoincidenceRateModal} style={{ marginRight: '16px ' }}>
                      {intl.get('ssrc.inquiryHall.view.button.IPCoincidenceRate').d('IP重合率')}
                    </a>
                  ) : (
                    ''
                  )}
                  {/* 符合性检查结果确认暂时不需要 */}
                  {sourceStatus !== 'RFX_INITIAL_REVIEW_PENDING' && (
                    <a onClick={this.switchDimension}>
                      {supplierDimension.flag
                        ? `${intl
                            .get(`ssrc.bidHall.view.message.button.switchExpertsDimension`)
                            .d('切换专家维度')}`
                        : `${intl
                            .get(`ssrc.bidHall.view.message.button.switchSuppliersDimension`)
                            .d('切换供应商维度')}`}
                    </a>
                  )}
                </span>
              </div>
              {sourceStatus !== 'RFX_INITIAL_REVIEW_PENDING' && (
                <React.Fragment>
                  <div style={{ display: supplierDimension.flag ? 'block' : 'none' }}>
                    <SupplierTable
                      {...supplierProps}
                      supplierList={supplierList[supplierList.subjectMatterRule] || []}
                      bidLineItemId="flag"
                    />
                  </div>
                  <div style={{ display: supplierDimension.flag ? 'none' : 'block' }}>
                    {this.renderExpertList(expertProps, {
                      expertList,
                      expertPagination,
                    })}
                  </div>
                </React.Fragment>
              )}
              {sourceStatus === 'RFX_INITIAL_REVIEW_PENDING' && (
                <ReviewSupplierTable {...reviewSupplierProps} bidLineItemId="flag" />
              )}
            </React.Fragment>
          )
        }
      </Content>
    );
  }

  // 多轮报价弹框关闭事件
  @Bind()
  onCancelClick() {
    this.setState({
      roundQuotationModalVisible: false,
    });
  }

  render() {
    const { modelName = 'bidHall' } = this.props;
    const {
      [modelName]: {
        bidEvalProgress = [],
        ipCoincidenceRate = [],
        rfxScoreItemLineList = [],
        rfxScoreItemPagination = {},
        code = {},
        header = {},
      },
      // match: { params },
      fetchIPCoincidenceRateLoading,
      fetchRfxScoreItemLinesLoading = false,
      roundBeginScoreLoading,
      beginRoundQuotationLoading,
      fetchReScoringAllLoading,
      form: { getFieldDecorator },
      customizeTable,
      customizeBtnGroup,
      exportScoringBussSum,
    } = this.props;
    const {
      routerParams,
      reScoringVisible,
      sourceFrom = '',
      ipCoincidenceRateVisible,
      roundQuotationModalVisible = false,
      onlineBargainVisible,
      sourceStatus,
      // priceComparisonModalVisible,
      quotationHeaderIds,
    } = this.state;

    const ipCoincidenceRateProps = {
      visible: ipCoincidenceRateVisible,
      dataSource: ipCoincidenceRate,
      sourceKey: header.secondarySourceCategory === 'NEW_BID' ? 'BID' : 'INQUIRY',
      loading: fetchIPCoincidenceRateLoading,
      onConfirmIpCoincidenceRate: this.confirmIpCoincidenceRate,
    };

    const {
      cachTabKey,
      sourceHeaderId,
      sourceProjectId,
      projectLineSectionId,
      multiSectionFlag,
    } = routerParams;

    // 报价是否隐藏
    // const quoVisible = (scoringProgress === 'TECHNOLOGY'
    // && openBidOrder === 'TECH_FIRST'
    // && roundQuotationRule === 'SCORE');

    const curRecord = {
      sourceStatus,
      sourceHeaderId,
      sourceProjectId,
      multiSectionFlag,
      projectLineSectionId,
    };

    // 多轮报价modal
    const roundQuotationProps = {
      // quoVisible,
      quotationHeaderIds,
      record: curRecord,
      customizeTable,
      skipSummaryFlag: 1,
      customizeBtnGroup,
      roundBeginScoreLoading,
      beginRoundQuotationLoading,
      roundQuotationModalVisible,
      closable: true,
      onCancelClick: this.onCancelClick,
      startRoundQuotation: this.startRoundQuotation,
      startScore: this.startScore,
      candelRoundQuotationModal: this.candelRoundQuotationModal,
      dataSource: rfxScoreItemLineList,
      pagination: rfxScoreItemPagination,
      onChange: this.fetchRfxScoreItemLines,
      fetchExpertScoreItemLinesLoading: fetchRfxScoreItemLinesLoading,
      exportScoringBussSumRemote: exportScoringBussSum,
      expertScoreSumHeader: header,
      bidEvalProgress,
    };

    // 多轮报价modal - 分标段
    const sectionRoundQuotationProps = {
      // quoVisible,
      customizeTable,
      record: curRecord,
      sourceStatus,
      sourceHeaderId,
      sourceProjectId,
      multiSectionFlag,
      projectLineSectionId,
      okCancel: false, // modal footer 只显示 ok btn
      fetchExpertScoreItemLinesLoading: fetchRfxScoreItemLinesLoading,
      roundBeginScoreLoading,
      beginRoundQuotationLoading,
      roundQuotationModalVisible,
      startRoundQuotation: this.startRoundQuotation,
      startScore: this.startScore,
      candelRoundQuotationModal: this.candelRoundQuotationModal,
      dataSource: rfxScoreItemLineList,
      pagination: rfxScoreItemPagination,
      onChange: this.fetchRfxScoreItemLines,
      visible: roundQuotationModalVisible,
      onAfterChangeRoute: this.insertScoringOperationRecord,
      quotationHeaderIds,
    };

    const sectionPanelProps = {
      rowKey: 'sourceHeaderId',
      isSection: !!projectLineSectionId,
      parentPage: {
        name: cachTabKey === 'scoreing' ? 'expertScoring' : 'expertScored',
        queryParams: {
          sourceStatus,
          sourceProjectId,
          operation: 'SCORE_MANAGEMENT',
        },
      },
      activeRowId: sourceHeaderId,
      displayName: 'sectionName',
      afterOpenSection: this.replaceRoute,
      beforeOpenSection: exportScoringBussSum
        ? exportScoringBussSum.process(
            'SSRC_EXPERT_SCORING_BUSS_SUM_PROCESS_SECTION_BEFORE_OPEN',
            this.saveData,
            { header }
          )
        : this.saveData,
      onRef: this.handleSectionPanelRef,
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.bidHall.view.message.title.bidEvaluation`).d('评分结果确认')}
          backPath={this.backJudge(sourceFrom)}
        >
          {this.renderHeaderButtons()}
        </Header>
        <div className={styles.steps}>
          <Steps
            current={this.renderCurrentStep(bidEvalProgress)}
            size={bidEvalProgress.length > 5 ? 'small' : 'default'}
          >
            {bidEvalProgress &&
              bidEvalProgress.map((item) => {
                return <Step title={item.progressNameMeaning} />;
              })}
          </Steps>
        </div>
        {projectLineSectionId && projectLineSectionId !== 'null' ? (
          <SectionPanel {...sectionPanelProps}>{this.renderContent()}</SectionPanel>
        ) : (
          this.renderContent()
        )}
        <IPCoincidenceRate {...ipCoincidenceRateProps} />
        {!projectLineSectionId && roundQuotationModalVisible && (
          <RoundQuotationModal {...roundQuotationProps} />
        )}
        {projectLineSectionId && roundQuotationModalVisible && (
          <RoundQuotationDrawer {...sectionRoundQuotationProps} />
        )}

        <Modal
          destroyOnClose
          visible={reScoringVisible}
          title={intl.get(`ssrc.inquiryHall.view.message.title.reScoring`).d('重新评分')}
          onOk={this.reScoringAll}
          onCancel={this.closeReScoringModal}
          confirmLoading={fetchReScoringAllLoading}
        >
          <Form>
            <Form.Item
              label={intl
                .get('ssrc.inquiryHall.model.inquiryHall.reScoringReason')
                .d('重新评分原因')}
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
            >
              {getFieldDecorator('rescoreReason', {
                // initialValue: null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.reScoringReason`)
                        .d('重新评分原因'),
                    }),
                  },
                ],
              })(<TextArea rows={4} />)}
            </Form.Item>
          </Form>
        </Modal>
        {onlineBargainVisible && this.bargainRuleModal(code)}
        {/* {priceComparisonModalVisible && <PriceComparison {...priceComparisonProps} />} */}
      </React.Fragment>
    );
  }
}
