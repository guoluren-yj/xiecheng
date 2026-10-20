/*
 * @Description:
 * @Autor: hongzhu.chen@going-link.com
 * @Date: 2021-05-21 11:31:43
 * @LastEditTime: 2025-01-09 17:15:11
 */
/**
 * Recommend - 专家评分-列表
 * @date: 2019-07-01
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table, Popover, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, compose } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remote from 'hzero-front/lib/utils/remote';
import { fetchBidConfig } from '@/services/inquiryHallService';
import { fetchNewBidEnable } from '@/services/inquiryHallNewService';
import { beforeScoreValidate } from '@/services/commonService';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { Button } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import RoundQuotationModal from '@/routes/components/RoundQuotationModal/';
import RoundQuotationDrawer from '@/routes/components/RoundQuotationDrawer';
import { asyncPageFetchList } from '@/utils/utils';
import FilterHistoryForm from './FilterHistoryForm';
import FilterForm from './FilterForm';

const promptCode = 'ssrc.expertScoring';

class ExpertScoring extends Component {
  form;

  constructor(props) {
    super(props);

    this.state = {
      isBid: false,
      isOldBid: false,
      record: {}, // 当前激活数据
      cachTabKey: '',
      bidOpeningNewFlag: false, // 专家评分开标是否开启新功能
      roundQuotationModalVisible: false, // 是否开启多轮报价弹窗
      originSourceStatus: null, // 工作台跳转带的状态参数
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const sourceStatus = this.getSourceStatus(this.props);
    const originSourceStatus = this.getSourceStatus(prevProps);
    return sourceStatus !== originSourceStatus;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initStatusQuery();
    }
  }

  // 初始化查询供应商投标
  componentDidMount() {
    this.initStatusQuery();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expertScoring/updateState',
      payload: {
        expertScoreItemLineList: [],
        expertScoreItemPagination: {},
      },
    });
  }

  // 查询专家评分开标是否开启新功能, 不在在该配置表中的租户默认走新功能
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
   * 初始化状态并查询
   * */
  async initStatusQuery() {
    this.fetchBidOpeningBlackConfig();
    const initQuery = () => {
      const sourceStatus = this.getSourceStatus(this.props);
      this.setState({ originSourceStatus: sourceStatus }, () => {
        this.queryExpertScoring({
          sourceStatus,
        });
      });
    };
    const res = getResponse(await fetchBidConfig({ tenant: getCurrentTenant().tenantNum }));
    if (res) {
      this.setState(
        {
          isBid: Number(res[0]?.newBid || 1),
          isOldBid: Number(res[0]?.oldBid || 0),
        },
        () => {
          initQuery();
        }
      );
    } else {
      initQuery();
    }
  }

  /**
   * 工作台跳转
   * 获取状态sourceStatus from url
   */
  getSourceStatus(props = {}) {
    const {
      location: { search = {} },
    } = props;

    let { sourceStatus = null } = querystring.parse(search.substr(1));
    sourceStatus = sourceStatus ? sourceStatus.replace(/'/g, '') : null; // 工作台跳转带的状态参数
    return sourceStatus;
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleHistoryRef(ref = {}) {
    this.historyForm = (ref.props || {}).form;
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['bidOpenDateFrom'];
    const timeToArray = ['bidOpenDateTo'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  /**
   * 专家评分默认列表查询
   */
  @Bind()
  queryExpertScoring(data = {}) {
    const {
      dispatch,
      expertScoring: { scoringListPagination = {}, scoringHistoryPagination },
      location,
    } = this.props;
    const { isBid, isOldBid } = this.state;
    // 选择的tabKey
    const selectKey = location.search.substr(1);
    // 注入默认key
    if (selectKey) {
      let key = '';
      if (selectKey.includes('SCORED')) {
        key = selectKey;
      } else if (selectKey === 'scoreHistory') {
        key = 'scoreHistory';
      } else {
        key = 'scoreing';
      }
      this.setState({ cachTabKey: key });
    } else {
      this.setState({ cachTabKey: 'scoreing' });
    }
    this.handleSearch(scoringListPagination, scoringHistoryPagination, data);
    const lovCodes = {
      sourceCategory: 'SSRC.SOURCE_CATEGORY_SCORE', // 寻源类别
      inquiryMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      scoreStatus: 'SSRC.SOURCE_STATUS', // 状态
      // scoreStatus: 'SSRC.BID_EVALUATE_STATUS', // 状态
      secondarySourceCategory:
        isOldBid && isBid
          ? 'SSRC.SECONDARY_SOURCE_CATEGORY_WITH_RF_BID'
          : 'SSRC.SECONDARY_SOURCE_CATEGORY_SCORE', // 寻源类别（新）
    };
    dispatch({
      type: 'expertScoring/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 点击查看评分-专家评分详情
   */
  @Bind()
  onCheckScore(record) {
    const { history } = this.props;
    const { cachTabKey } = this.state;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      scoredStatus,
      expertSequenceNum,
      sourceFrom,
      sourceStatus,
      evaluateExpertId = null,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = record;
    const search = querystring.stringify({
      sourceHeaderId,
      cachTabKey,
      scoredStatus,
      sourceFrom,
      sourceStatus,
      checkScore: 'checkScore',
      backRecommend: 'recommend', // 跳转评标管理页面，backpath标识
      evaluateExpertId,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });
    sessionStorage.setItem('evaluateExpertId', record.evaluateExpertId); // XXX 后期逐步去除使用,使用路由传参
    history.push({
      pathname: `/ssrc/expert-scoring/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update`,
      search,
    });
  }

  /**
   * 点击PFx跳转-专家评分详情
   */
  @Bind()
  historyScoringDetail(record) {
    const { dispatch } = this.props;
    const { cachTabKey } = this.state;
    const {
      sourceHeaderId,
      sourceNum,
      sourceTitle,
      evaluateExpertId = null,
      sourceStatus,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      sourceFrom,
    } = record;
    const historyTag = cachTabKey === 'scoreHistory' ? 'history' : '';
    const search = querystring.stringify({
      sourceNum,
      sourceTitle,
      sourceHeaderId,
      cachTabKey,
      historyTag, // 标记由查看历史评分页面跳入，控制按钮输入框不可填
      backRecommend: 'recommend', // 跳转评标管理页面，backpath标识
      evaluateExpertId,
      sourceStatus,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      sourceFrom,
    });
    sessionStorage.setItem('evaluateExpertId', record.evaluateExpertId); // XXX 后期逐步去除使用,使用路由传参
    // rfp/rfi进入confirm-candidate中
    const pathname = record.sourceFrom === 'BID' ? 'confirm-bid-candidate' : 'confirm-candidate';
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/${pathname}/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  /**
   * 点击PFx跳转-专家评分详情
   */

  @Bind()
  onrfxNum(record) {
    const { history } = this.props;
    const { cachTabKey } = this.state;
    const {
      sourceHeaderId,
      sourceStatus,
      expertUserId,
      subjectMatterRule,
      scoredStatus,
      expertSequenceNum,
      sourceFrom,
      initialReview,
      reviewScoredStatus,
      evaluateLeaderFlag = 0, // 是否是专家评分负责人
      evaluateExpertId = null,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = record;
    const search = querystring.stringify({
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      cachTabKey,
      scoredStatus,
      evaluateLeaderFlag,
      backRecommend: 'recommend', // 跳转评标管理页面，backpath标识
      evaluateExpertId,
      reviewScoredStatus,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });
    sessionStorage.setItem('evaluateExpertId', record.evaluateExpertId); // XXX 后期逐步去除使用,使用路由传参
    sessionStorage.setItem('team', record.team); // XXX 后期逐步去除使用,使用路由传参
    if (
      ['NEW', 'SCORED'].includes(reviewScoredStatus) &&
      initialReview === 'NEED' &&
      ['INITIAL_REVIEW_SCORING', 'RFX_INITIAL_REVIEW_PENDING'].includes(sourceStatus)
    ) {
      // 符合性检查
      history.push({
        pathname: `/ssrc/expert-scoring/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/initial-review`,
        search,
      });
    } else {
      history.push({
        pathname: `/ssrc/expert-scoring/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update`,
        search,
      });
    }
  }

  /**
   * 评分按钮
   */
  @Bind()
  async onrfxScoreNum(record) {
    const {
      sourceHeaderId,
      sourceFrom,
      tenantId,
      evaluateExpertId = null,
      roundNumber,
      evaluateScoreId,
      quotationHeaderId,
    } = record;
    const params = {
      evaluateScoreId,
      quotationHeaderId,
      roundNumber,
      evaluateExpertId,
      sourceFrom,
      sourceHeaderId,
      tenantId,
    };
    const res = await beforeScoreValidate(params); // 评分前置校验
    if (!getResponse(res)) return false;
    this.onrfxNum(record);
  }

  /**
   * 切换tab注入key
   */
  @Bind()
  changeTabs(key) {
    this.setState({ cachTabKey: key });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  // @Bind()
  handleSearch(scorePage = {}, scoreHistoryPage = {}, data = {}) {
    this.handleScoringSearch(scorePage, data);
    this.handleScoringHistorySearch(scoreHistoryPage, data);
  }

  /**
   * 进行中的评分条件查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleScoringSearch(page = {}, data = {}, pageChangeFlag = false) {
    const {
      dispatch,
      expertScoring: { scoringOldTotalElements: oldTotalElements } = {},
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const commonPayload = {
      ...handleFormValues,
      customizeUnitCode: 'SSRC.EXPERT_SCORE_LIST.PENDING_FILTER_FORM',
      page,
      ...data,
    };
    const fetchScoring = (payload) => {
      return dispatch({
        type: 'expertScoring/fetchScoring',
        payload,
      });
    };
    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchScoring,
    });
  }

  /**
   * 历史评分条件查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  async handleScoringHistorySearch(page = {}, data = {}, pageChangeFlag = false) {
    const {
      dispatch,
      expertScoring: { historyOldTotalElements: oldTotalElements } = {},
    } = this.props;
    const fieldValues = isUndefined(this.historyForm)
      ? {}
      : filterNullValueObject(this.historyForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const commonPayload = {
      ...handleFormValues,
      customizeUnitCode: 'SSRC.EXPERT_SCORE_LIST.HISTORY_FILTER_FORM',
      page,
      ...data,
    };
    const fetchScoringHistory = (payload) => {
      dispatch({
        type: 'expertScoring/fetchScoringHistory',
        payload,
      });
    };
    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchScoringHistory,
    });
  }

  /**
   * 跳转到招投标时带参
   *
   * @param {*} [record={}]
   * @returns
   * @memberof InquiryHall
   */
  getDirectSearch(record = {}) {
    const { cachTabKey } = this.state;
    const {
      sourceHeaderId = '',
      sourceFrom = '',
      sourceStatus = '',
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      roundQuotationRule,
      secondarySourceCategory,
    } = record;
    const search = querystring.stringify({
      backRecommend: 'recommend', // 跳转评标管理页面，backpath标识
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      roundQuotationRule,
      secondarySourceCategory,
    });

    return search;
  }

  /**
   * 跳转到招标评分过程管理页面
   *
   * @param {*} record
   * @memberof BidHall
   */
  @Bind()
  bidEvaluationProcess(record) {
    const pathname =
      record.sourceFrom === 'BID' ? 'bid-evaluation-proc-manage' : 'rfx-evaluation-proc-manage';
    const { dispatch } = this.props;
    const search = this.getDirectSearch(record);
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/${pathname}/${record.sourceHeaderId}`,
        query: {
          SourceFrom: record.sourceFrom,
        },
        search,
      })
    );
  }

  /**
   * 跳转到招标评分管理评分结果确认页面
   * @param {Object} record
   */
  @Bind()
  bidEvaluation(record) {
    // rfp/rfi进入rfx-evaluation中
    const pathname = record.sourceFrom === 'BID' ? 'bid-evaluation' : 'rfx-evaluation';
    const { dispatch } = this.props;
    const search = this.getDirectSearch(record);
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/${pathname}/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  /**
   * 点击评分管理操作
   *
   * @param {*} [record={}]
   * @memberof ExpertScoring
   */
  @Bind
  async handleRfxEvaluation(record = {}) {
    const { remote: remoteFunc } = this.props;
    const directProcManage = () => {
      const { dispatch } = this.props;
      const search = this.getDirectSearch(record);

      dispatch(
        routerRedux.push({
          pathname: `/ssrc/expert-scoring/rfx-evaluation-proc-manage/${record.sourceHeaderId}`,
          query: {
            SourceFrom: record.sourceFrom,
          },
          search,
        })
      );
    };

    const { roundQuotationRule = null } = record || {};

    const ScoreRoundQuotationFlag =
      roundQuotationRule !== 'SCORE' && roundQuotationRule !== 'AUTO_SCORE';
    const FiniallyScoreRoundQuotationFlag = !remoteFunc
      ? ScoreRoundQuotationFlag
      : remoteFunc.process(
          'SSRC_EXPERT_SCORING_LIST_HANDLERFXEVALUATION_SCORE_FLAG',
          ScoreRoundQuotationFlag,
          { record }
        );
    if (FiniallyScoreRoundQuotationFlag) {
      directProcManage();
      return;
    }

    if (record.roundHeaderStatus === 'ROUND_SCORE' || roundQuotationRule === 'AUTO_SCORE') {
      // 新开标功能开启此处无需启用多轮，新开标暂不考虑多标段单据
      if (this.getSecondOpenBidFlag(record)) {
        this.setState(
          {
            record,
          },
          () => {
            this.startScore();
          }
        );
        return;
      }
      // 多轮报价弹窗
      // 多轮报价modal
      const { projectLineSectionId } = record;
      this.setState({
        record,
        roundQuotationModalVisible: true,
      });
      if (projectLineSectionId) {
        // 分标段, 直接返回
        return;
      }
      this.fetchExpertScoreItemLines({}, record);
    } else {
      directProcManage();
    }
  }

  /**
   * 查询专家评分下 供应商物品数据
   *
   * @param {*} [page={}]
   * @memberof ExpertScoring
   */
  @Bind()
  fetchExpertScoreItemLines(page = {}, curRecord = {}) {
    const { dispatch, organizationId } = this.props;
    const { record } = this.state;

    dispatch({
      type: 'expertScoring/fetchExpertScoreItemLines',
      payload: {
        page,
        rfxHeaderId: curRecord.sourceHeaderId || record.sourceHeaderId || null,
        organizationId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
      },
    });
  }

  /**
   * 供应商物品弹窗－发起多轮报价
   *
   * @memberof ExpertScoring
   * @param {?Object} roundQuotationData - 多轮报价回传数据
   */
  @Bind
  @Throttle(1000)
  async startRoundQuotation(roundQuotationData = {}, filterRoundQuoKeys, filterScoreKeys) {
    const { dispatch, organizationId, remote: remoteFunc } = this.props;
    const { record = {} } = this.state;
    const { sourceHeaderId, projectLineSectionId } = record;
    const { curRecord } = roundQuotationData;

    if (remoteFunc?.event) {
      const eventProps = {
        rfxHeaderId: sourceHeaderId,
      };
      const res = await remoteFunc.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

    await dispatch({
      type: 'expertScoring/beginRoundQuotation',
      payload: {
        sourceHeaderId: projectLineSectionId ? filterRoundQuoKeys?.join(',') : sourceHeaderId,
        organizationId,
      },
    }).then((res) => {
      if (!res) {
        return;
      }

      // 存在开始评分才调用接口, 直接跳转页面关闭弹窗
      if (filterScoreKeys?.length) {
        return this.startScore(roundQuotationData, filterRoundQuoKeys, filterScoreKeys);
      }

      this.directRfxEvaluation(
        {
          sourceStatus: 'ROUND_QUOTATION',
        },
        curRecord
      );
      this.candelRoundQuotationModal();
    });
  }

  /**
   * 供应商物品弹窗－开始评分
   *
   * @memberof ExpertScoring
   * @param {?Object} roundQuotationData - 多轮报价回传数据
   * @param {!Object} filterRoundQuoKeys - 多轮报价勾选行数组 - 针对分标段
   * @param {?Array} filterScoreKeys - 开始评分勾选行数组 - 针对分标段
   */
  @Bind
  @Throttle(1000)
  startScore(roundQuotationData = {}, filterRoundQuoKeys, filterScoreKeys) {
    const { dispatch, organizationId, remote: remoteFunc } = this.props;
    const { record = {} } = this.state;
    const { curRecord } = roundQuotationData;
    const { projectLineSectionId, sourceHeaderId } = record;

    const handleStartScoreJump = async () => {
      try {
        await dispatch({
          type: 'expertScoring/roundBeginScore',
          payload: {
            sourceHeaderId: projectLineSectionId ? filterScoreKeys?.join(',') : sourceHeaderId,
            organizationId,
          },
        }).then((res) => {
          if (!res) return;

          this.directRfxEvaluation(
            {
              sourceStatus: filterRoundQuoKeys?.length ? 'ROUND_QUOTATION' : 'SCORING',
            },
            curRecord
          );
          this.candelRoundQuotationModal();
        });
      } catch (e) {
        throw e;
      }
    };

    if (remoteFunc?.event) {
      // remoteStartScore 二开埋点方法名
      remoteFunc.event.fireEvent('remoteStartScore', {
        handleStartScoreJump: (...params) => handleStartScoreJump(...params),
        startRoundQuotation: () => {
          // 如果多轮报价数据大于0就取多轮报价，否则将专家评分数据传过去
          const roundQuoKeys =
            filterRoundQuoKeys?.length > 0 ? filterRoundQuoKeys : filterScoreKeys;
          const coreKeys = filterRoundQuoKeys?.length > 0 ? filterScoreKeys : [];
          return this.startRoundQuotation(roundQuotationData, roundQuoKeys, coreKeys);
        },
      });
    } else {
      try {
        handleStartScoreJump();
      } catch (e) {
        throw e;
      }
    }
  }

  /**
   * 关闭供应商物品弹窗
   *
   * @memberof ExpertScoring
   */
  @Bind
  candelRoundQuotationModal() {
    const { dispatch } = this.props;

    this.setState({
      roundQuotationModalVisible: false,
      record: {},
    });

    dispatch({
      type: 'expertScoring/updateState',
      payload: {
        expertScoreItemLineList: [],
        expertScoreItemPagination: {},
      },
    });
    return true;
  }

  /**
   * 寻源跳转到评分管理
   *
   * @memberof ExpertScoring
   */
  directRfxEvaluation(data = {}, curRecord) {
    const { record = {} } = this.state;
    const { dispatch } = this.props;
    const { sourceFrom, sourceHeaderId } = curRecord || record;
    const search = this.getDirectSearch({
      ...(curRecord || record),
      ...data,
    });

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/rfx-evaluation-proc-manage/${sourceHeaderId}`,
        query: {
          SourceFrom: sourceFrom,
        },
        search,
      })
    );
  }

  @Bind()
  directRfxScoreManager(record = {}) {
    const { dispatch } = this.props;
    const search = this.getDirectSearch(record);

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/rfx-evaluation-proc-manage/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  /**
   * 跳转到推荐成交候选人或推荐中标候选人页面
   * @param {Object} record
   */
  @Bind()
  bidEvaluationCandidate(record) {
    // rfp/rfi进入confirm-candidate
    const pathname = record.sourceFrom === 'BID' ? 'confirm-bid-candidate' : 'confirm-candidate';
    const { dispatch } = this.props;
    const search = this.getDirectSearch(record);
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/${pathname}/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  /**
   * 二阶段判断
   */
  getSecondOpenBidFlag = (record) => {
    const { bidOpeningNewFlag } = this.state;
    const { sourceFrom, sealedQuotationFlag, openerFlag, openBidOrder } = record || {};

    const flag =
      sourceFrom === 'RFX' &&
      bidOpeningNewFlag &&
      sealedQuotationFlag === 1 &&
      openerFlag === 1 &&
      openBidOrder !== 'SYNC';
    return flag;
  };

  /**
   * 按钮操作
   * @returns {*}
   * @protected 此方法被【玛格家具】二开，请勿删除、修改此方法名！！！
   * @protected 此方法调用的方法名也请勿删除、修改！！！
   */
  @Bind()
  operationRender(record = {}) {
    const { remote: remoteFunc } = this.props;
    // const { bidOpeningNewFlag } = this.state;
    const {
      sourceFrom,
      evaluateLeaderFlag, // 评分负责人
      sourceStatus,
    } = record || {};
    let mean = '';
    // 保持`RFX`与`BID`针对评分管理, 逻辑一致
    if (
      sourceFrom === 'RFX' ||
      sourceFrom === 'BID' ||
      sourceFrom === 'RFP' ||
      sourceFrom === 'RFI'
    ) {
      if (evaluateLeaderFlag) {
        switch (sourceStatus) {
          case 'SCORING':
          case 'ROUND_QUOTATION':
          case 'INITIAL_REVIEW_SCORING': // 初步评审中 - 等价于评分(评分过程管理)
            mean = (
              <a onClick={() => this.directRfxScoreManager(record)}>
                {intl.get(`ssrc.expertScoring.view.message.button.scoreManagement`).d('评分管理')}
              </a>
            );
            break;
          case 'OPENED':
          case 'OPEN_BID_PENDING':
            // 配置表开启、针对二阶段待开标、二阶段已开标的询价招标,允许评分管理
            if (this.getSecondOpenBidFlag(record)) {
              mean = (
                <a onClick={() => this.directRfxScoreManager(record)}>
                  {intl.get(`ssrc.expertScoring.view.message.button.scoreManagement`).d('评分管理')}
                </a>
              );
            }
            break;
          case 'RFX_EVALUATION_PENDING':
          case 'RFX_INITIAL_REVIEW_PENDING': // 初步评审汇总  - 等价于汇总(确认及汇总)
            mean = (
              <a onClick={() => this.bidEvaluation(record)}>
                {intl.get(`ssrc.expertScoring.view.message.button.scoreManagement`).d('评分管理')}
              </a>
            );
            break;
          case 'PRE_EVALUATION_PENDING_REJECT': // 成交候选人页面
          case 'PRE_EVALUATION_PENDING':
            mean = (
              <a onClick={() => this.bidEvaluationCandidate(record)}>
                {intl.get(`ssrc.expertScoring.view.message.button.scoreManagement`).d('评分管理')}
              </a>
            );
            break;
          case 'NOT_START':
            mean = (
              <a onClick={() => this.handleRfxEvaluation(record)}>
                {intl.get(`ssrc.expertScoring.view.message.button.scoreManagement`).d('评分管理')}
              </a>
            );
            break;
          default:
            break;
        }
      }
    }

    // 评分按钮
    const scoreNode = (
      <Button
        type="text"
        permissionList={[
          {
            code: `${this.props.match.path}.button.score`,
            type: 'button',
            meaning: '专家评分-评分',
          },
        ]}
        onClick={() => this.onrfxScoreNum(record)}
        style={{ marginRight: '8px' }}
      >
        {intl.get(`ssrc.expertScoring.view.message.button.score`).d('评分')}
      </Button>
    );
    // 埋点处理后的评分按钮
    const remoteScoreNode = remoteFunc
      ? remoteFunc.process('SSRC_EXPERT_SCORING_LIST_PROCESS_SCORE_NODE', scoreNode, {
          record,
        })
      : scoreNode;

    const currentOperateButtons = (
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        {this.renderOperate(record) ===
        intl.get(`ssrc.expertScoring.view.message.button.score`).d('评分') ? (
          remoteScoreNode
        ) : (
          <a type="primary" onClick={() => this.onrfxNum(record)} style={{ marginRight: '8px' }}>
            {this.renderOperate(record)}
          </a>
        )}
        {mean}
      </span>
    );

    const operateButtons = remoteFunc
      ? remoteFunc.process(
          'SSRC_EXPERT_SCORING_LIST_PROCESS_OPERATE_BUTTONS',
          currentOperateButtons,
          {
            record,
          }
        )
      : currentOperateButtons;

    return operateButtons;
  }

  renderOperate(record = {}) {
    const { remote: remoteFunc } = this.props;
    let mean = '';
    const {
      sourceFrom,
      currentSequenceNum,
      expertSequenceNum,
      scoredStatus,
      sourceStatus,
      initialReview,
      reviewScoredStatus,
      indicAssignCount,
      scoreIndicAssignCount,
    } = record;
    const { bidOpeningNewFlag } = this.state;
    const isStatus = ['NEW', 'RESCORING'].includes(scoredStatus);
    // 配置表开启、针对二阶段待开标、二阶段已开标
    if (
      bidOpeningNewFlag &&
      sourceFrom === 'RFX' &&
      scoredStatus === 'SCORED' &&
      ['OPENED', 'OPEN_BID_PENDING'].includes(sourceStatus)
    ) {
      mean = intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分');
      return mean;
    }
    // if (sourceStatus === 'NOT_START' || sourceStatus === 'ROUND_QUOTATION') {
    //   return '';
    // }
    if (
      reviewScoredStatus === 'NEW' &&
      initialReview === 'NEED' &&
      sourceStatus === 'INITIAL_REVIEW_SCORING' &&
      Number(indicAssignCount) > 0
    ) {
      // 符合性检查
      mean = intl.get(`ssrc.expertScoring.view.message.button.complianceCheck`).d('符合性检查');
    } else if (
      reviewScoredStatus === 'NEW' &&
      initialReview === 'NEED' &&
      ['INITIAL_REVIEW_SCORING', 'RFX_INITIAL_REVIEW_PENDING'].includes(sourceStatus) &&
      Number(indicAssignCount) === 0
    ) {
      // 符合性检查 - 专家分配符合性检查要素数量为0, 则代表未分配, 无需初审
      mean = '';
    } else if (
      reviewScoredStatus === 'SCORED' &&
      initialReview === 'NEED' &&
      ['INITIAL_REVIEW_SCORING', 'RFX_INITIAL_REVIEW_PENDING'].includes(sourceStatus)
    ) {
      // 符合性检查查看
      mean = intl
        .get(`ssrc.expertScoring.view.message.button.complianceCheckView`)
        .d('符合性检查查看');
    } else if (isStatus) {
      if (currentSequenceNum === expertSequenceNum) {
        // 非符合性检查, 沿用之前逻辑
        if (
          scoreIndicAssignCount === 0 ||
          ['NOT_START', 'ROUND_QUOTATION'].includes(sourceStatus)
        ) {
          // 为0时不显示评分按钮
          mean = '';
        } else {
          // 没有值或者大于0都是显示评分按钮
          mean = remoteFunc
            ? remoteFunc.process(
                'SSRC_EXPERT_SCORING_LIST_PROCESS_SCORE_BTN',
                intl.get(`ssrc.expertScoring.view.message.button.score`).d('评分'),
                { record }
              )
            : intl.get(`ssrc.expertScoring.view.message.button.score`).d('评分');
        }
      } else if (currentSequenceNum < expertSequenceNum) {
        mean = '';
      } else if (currentSequenceNum > expertSequenceNum) {
        if (scoreIndicAssignCount === 0) {
          // 为0时不显示评分按钮
          mean = '';
        } else {
          mean = remoteFunc
            ? remoteFunc.process(
                'SSRC_EXPERT_SCORING_LIST_PROCESS_VIEW_SCORE_BTN_ONE',
                intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分'),
                { record }
              )
            : intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分');
        }
      }
    } else if (currentSequenceNum === expertSequenceNum) {
      if (scoreIndicAssignCount === 0) {
        // 为0时不显示评分按钮
        mean = '';
      } else {
        mean = remoteFunc
          ? remoteFunc.process(
              'SSRC_EXPERT_SCORING_LIST_PROCESS_VIEW_SCORE_BTN_TWO',
              intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分'),
              { record }
            )
          : intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分');
      }
    } else if (currentSequenceNum < expertSequenceNum) {
      mean = '';
    } else if (currentSequenceNum > expertSequenceNum) {
      if (scoreIndicAssignCount === 0) {
        // 为0时不显示评分按钮
        mean = '';
      } else {
        mean = remoteFunc
          ? remoteFunc.process(
              'SSRC_EXPERT_SCORING_LIST_PROCESS_VIEW_SCORE_BTN_THREE',
              intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分'),
              { record }
            )
          : intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分');
      }
    }
    return mean;
  }

  // 清空筛选表单
  @Bind()
  resetFormFields() {
    this.setState({
      originSourceStatus: null,
    });
  }

  // 多轮报价弹框关闭事件
  @Bind()
  onCancelClick() {
    this.setState({
      roundQuotationModalVisible: false,
    });
  }

  @Bind()
  getTabPanes() {
    const {
      dispatch,
      queryScoringLoading,
      queryScoringHistoryLoading,
      expertScoring: {
        code = {},
        scoringList = [],
        scoringListPagination = {},
        scoringHistoryList = [],
        scoringHistoryPagination = {},
      },
      customizeFilterForm,
      remote: remoteFunc,
      history,
    } = this.props;
    const { isBid, cachTabKey, originSourceStatus = null } = this.state;
    const preScoreingColumns = [
      /** ********* 【万国数据】二开列-勿动!!! *********** */
      {
        title: intl.get(`hzero.common.action`).d('操作'),
        dataIndex: 'action',
        width: 200,
        render: (_, record) => this.operationRender(record),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.scoredStatus`).d('评分状态'),
        dataIndex: 'sourceStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.RFxNo.`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.teamMeaning.`).d('评分组别'),
        dataIndex: 'teamMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.sourceTitle`).d('寻源标题'),
        dataIndex: 'sourceTitle',
        width: 210,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.sourceCategory`).d('寻源类别'),
        dataIndex: 'sourceCategoryMeaning',
        width: 150,
        render: (_, record) =>
          isBid ? record.secondarySourceCategoryMeaning : record.sourceCategoryMeaning,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.sourceMethod`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 110,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.version`).d('版本'),
        dataIndex: 'versionNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.userName`).d('招标员'),
        dataIndex: 'userName',
        width: 150,
      },
    ];
    const scoreingColumns = remoteFunc
      ? remoteFunc.process(
          'SSRC_EXPERT_SCORING_LIST_PROCESS_SCORING_TABLE_COLUMNS',
          preScoreingColumns
        )
      : preScoreingColumns;
    const preScoreHistoryColumns = [
      /** ********* 【大全能源】二开列-勿动!!! *********** */
      {
        title: intl.get(`${promptCode}.model.expertScoring.checkScore`).d('查看评分'),
        dataIndex: 'viewScore',
        width: 90,
        render: (val, record) => {
          // 为0时不显示查看评分按钮
          if (record.scoreIndicAssignCount === 0) {
            return null;
          }
          return (
            <a type="primary" onClick={() => this.onCheckScore(record)}>
              {intl.get(`ssrc.expertScoring.view.message.button.checkScore`).d('查看评分')}
            </a>
          );
        },
      },
      /** ********* 【大全能源】【科锐配电】二开列-勿动!!! *********** */
      {
        title: intl.get(`${promptCode}.model.expertScoring.RFxNo.`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
        render: (val, record) => {
          const { evaluateLeaderFlag } = record || {};
          const directionPage = evaluateLeaderFlag === 1 || evaluateLeaderFlag === '1';

          return directionPage ? (
            <a type="primary" onClick={() => this.historyScoringDetail(record)}>
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.sourceTitle`).d('寻源标题'),
        dataIndex: 'sourceTitle',
        width: 210,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.teamMeaning.`).d('评分组别'),
        dataIndex: 'teamMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.sourceCategory`).d('寻源类别'),
        dataIndex: 'sourceCategoryMeaning',
        width: 150,
        render: (_, record) =>
          isBid ? record.secondarySourceCategoryMeaning : record.sourceCategoryMeaning,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.sourceMethod`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 110,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.bidOpenDate`).d('开标时间'),
        dataIndex: 'bidOpenDate',
        width: 145,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.version`).d('版本'),
        dataIndex: 'versionNumber',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.userName`).d('招标员'),
        dataIndex: 'userName',
        width: 150,
      },
    ];
    const scoreHistoryColumns = remoteFunc
      ? remoteFunc.process(
          'SSRC_EXPERT_SCORING_LIST_PROCESS_HIS_TABLE_COLUMNS',
          preScoreHistoryColumns
        )
      : preScoreHistoryColumns;
    const scrollWidth = this.scrollWidth(scoreingColumns, 0);
    const historyScrollWidth = this.scrollWidth(scoreHistoryColumns, 0);

    const filterScoringProps = {
      isBid,
      dispatch,
      code,
      cachTabKey,
      onRef: this.handleRef,
      onConditional: this.handleScoringSearch,
      originSourceStatus,
      resetFormFields: this.resetFormFields,
      customizeFilterForm,
    };
    const filterScoringHistoryProps = {
      isBid,
      dispatch,
      code,
      cachTabKey,
      onRef: this.handleHistoryRef,
      onConditional: this.handleScoringHistorySearch,
      customizeFilterForm,
    };

    const eventProps = {
      history,
      TabPane: Tabs.TabPane,
      isBid,
      cachTabKey,
      dispatch,
      that: this,
    };
    const tabpanes = [
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.ongoingScore`).d('进行中的评分')}
        key="scoreing"
        forceRender
      >
        <div className="table-list-search">
          <FilterForm {...filterScoringProps} />
        </div>
        <Table
          bordered
          rowKey="randomNum"
          loading={queryScoringLoading}
          columns={scoreingColumns}
          scroll={{ x: historyScrollWidth }}
          dataSource={scoringList}
          pagination={scoringListPagination}
          onChange={(page) => this.handleScoringSearch(page, {}, true)}
        />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.historyScore`).d('历史评分')}
        key="scoreHistory"
        // forceRender
      >
        <div className="table-list-search">
          <FilterHistoryForm {...filterScoringHistoryProps} />
        </div>
        <Table
          bordered
          rowKey="randomNum"
          loading={queryScoringHistoryLoading}
          columns={scoreHistoryColumns}
          scroll={{ x: scrollWidth }}
          dataSource={scoringHistoryList}
          pagination={scoringHistoryPagination}
          onChange={(page) => this.handleScoringHistorySearch(page, {}, true)}
        />
      </Tabs.TabPane>,
    ];
    if (!remoteFunc) return tabpanes;
    return remoteFunc.process('SSRC_EXPERT_SCORING_LIST_PROCESS_TABPANES', tabpanes, eventProps);
  }

  render() {
    const {
      fetchExpertScoreItemLinesLoading,
      roundBeginScoreLoading,
      beginRoundQuotationLoading,
      location,
      expertScoring: { expertScoreItemLineList = [], expertScoreItemPagination = {} },
      customizeTable,
      customizeBtnGroup,
      customizeTabPane,
    } = this.props;
    const { roundQuotationModalVisible = false, record: curRecord } = this.state;

    const {
      sourceStatus,
      sourceHeaderId,
      sourceProjectId,
      multiSectionFlag,
      projectLineSectionId,
    } = curRecord;

    // 多轮报价modal
    const roundQuotationProps = {
      record: curRecord,
      sourceStatus,
      customizeTable,
      customizeBtnGroup,
      sourceHeaderId,
      sourceProjectId,
      multiSectionFlag,
      projectLineSectionId,
      fetchExpertScoreItemLinesLoading,
      roundBeginScoreLoading,
      beginRoundQuotationLoading,
      roundQuotationModalVisible,
      onCancelClick: this.onCancelClick,
      startRoundQuotation: this.startRoundQuotation,
      startScore: this.startScore,
      candelRoundQuotationModal: this.candelRoundQuotationModal,
      dataSource: expertScoreItemLineList,
      pagination: expertScoreItemPagination,
      onChange: this.fetchExpertScoreItemLines,
      visible: roundQuotationModalVisible,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.expertScoring`).d('专家评分')} />
        <Content>
          {customizeTabPane(
            {
              code: 'SSRC.EXPERT_SCORE_LIST.GRADING_TAB',
            },
            <Tabs
              onChange={this.changeTabs}
              animated={false}
              defaultActiveKey={location.search.substr(1)}
            >
              {this.getTabPanes()}
            </Tabs>
          )}
        </Content>
        {!projectLineSectionId && roundQuotationModalVisible && (
          <RoundQuotationModal {...roundQuotationProps} />
        )}
        {projectLineSectionId && roundQuotationModalVisible && (
          <RoundQuotationDrawer {...roundQuotationProps} />
        )}
      </React.Fragment>
    );
  }
}

const Hooc = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_LIST.PENDING_FILTER_FORM', // 进行中筛选form
        'SSRC.EXPERT_SCORE_LIST.HISTORY_FILTER_FORM', // 历史筛选form
        'SSRC.EXPERT_SCORE_MANAGE.ROUND_MODAL_BUTTON', // 多轮报价弹框按钮组
        'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE', // 多轮报价弹框表格
        'SSRC.EXPERT_SCORE_LIST.GRADING_TAB', // 专家评分列表标签
      ],
    }),
    formatterCollections({
      code: ['ssrc.expertScoring', 'ssrc.common', 'sscux.ssrc', 'scux.ssrc'],
    }),
    connect(({ expertScoring, loading }) => ({
      expertScoring,
      queryScoringLoading: loading.effects['expertScoring/fetchScoring'],
      queryScoringHistoryLoading: loading.effects['expertScoring/fetchScoringHistory'],
      fetchExpertScoreItemLinesLoading: loading.effects['expertScoring/fetchExpertScoreItemLines'],
      roundBeginScoreLoading: loading.effects['expertScoring/roundBeginScore'],
      beginRoundQuotationLoading: loading.effects['expertScoring/beginRoundQuotation'],
      organizationId: getCurrentOrganizationId(),
    })),
    remote(
      {
        code: 'SSRC_EXPERT_SCORING_LIST',
        name: 'remote',
      },
      {
        events: {
          beforeJump() {},
          // 开始评分事件
          remoteStartScore(eventProps) {
            const { handleStartScoreJump } = eventProps || {};
            if (handleStartScoreJump) {
              handleStartScoreJump();
            }
          },
        },
      }
    )
  )(Com);
};

export default Hooc(ExpertScoring);
export { Hooc, ExpertScoring };
