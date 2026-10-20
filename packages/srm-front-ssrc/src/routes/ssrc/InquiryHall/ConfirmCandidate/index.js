/**
 * 寻源大厅 - 确认中标候选人
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { compose, noop, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { Button, Form, Tabs, Collapse, Icon, Modal, Popover, Spin, Tooltip, Badge } from 'hzero-ui';
import { Button as C7nButton, Modal as c7nModal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import classnames from 'classnames';
import remote from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import {
  getCurrentOrganizationId,
  getEditTableData,
  getCurrentUserId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import Lov from 'components/Lov';
import common from '@/routes/ssrc/common.less';
import bidView from '@/assets/bid-view.svg';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { PRIVATE_BUCKET } from '_utils/config';
import { queryEnableDoubleUnit, queryUiDisplayConfig } from '@/services/commonService';
import { isText, getJumpRoutePrefixUrl } from '@/utils/utils';
// import { getQuotationName } from '@/utils/globalVariable';

import SVGIcon from '@/routes/components/SvgIcon';
import Process from '@/routes/ssrc/components/Process';
import EditorOnline from '@/routes/components/EditorOnline';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import SectionPanel from '@/routes/sbid/components/SectionPanel';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import { fetchAttachmentCount } from '@/services/checkPriceNewService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import { validateRfxCandidate, createNewTemplateReport } from '@/services/inquiryHallService';
import BidInfo from './BidInfo';
import OthersInfo from './OthersInfo';
import ItemLine from './ItemLine';
import BidSectionTable from './BidSectionTable';
import ScoreDetailModal from './ScoreDetailModal';
import LadderLevelModal from '../../InquiryHall/Detail/LadderLevelModal';
import styles from './index.less';

const { Panel } = Collapse;

class ConfirmCandidate extends Component {
  form;

  editorOnlineRef;

  constructor(props) {
    super(props);
    this.initState(props, 'init');
  }

  /**
   * 初始化state
   * @param {Obejct} props - 组件props
   * @param {boolean} isInit - 是否初始化
   */
  initState(props, isInit) {
    const routerParams = querystring.parse(props.location.search.substr(1));
    const {
      backRecommend = '',
      cachTabKey = '',
      historyTag = '',
      sourceStatus,
      sourceFrom,
      sourceHeaderId,
    } = routerParams;

    const state = {
      cachTabKey, // 页面返回backpath标记
      backRecommend, // 专家评分跳转标记
      sourceStatus,
      sourceFrom,
      sourceHeaderId,
      bidItemSelectedTabKey: '', // 物品行切换面板key
      collapseKeys: [], // 折叠面板
      scoreDetailModalVisible: false, // 评分明细Modal
      historyTag, // 标记由查看历史评分页面跳入，控制按钮输入框不可填
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      sourceReportVisible: false, // 评分报告弹框
      templateId: '',
      routerParams,
      uploadLoading: false,
      newQuotationFlag: 0, // 启用新报价标识
      doubleUnitFlag: false,
      attachmentCount: 0, // 附件数量
      validateRfxCandidateLoading: false, // 校验loading状态
      fileTemplateManageFlag: -1, // 是否启用招标文件管理标识
    };

    if (isInit) {
      this.state = state;
    } else {
      this.setState(state, this.initQuery);
    }
  }

  componentDidMount() {
    this.initQuery();
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

  /**
   * 数据初始化
   */
  @Bind()
  initQuery() {
    const { sourceFrom } = this.state;
    this.fetchEvalProgress();
    if (sourceFrom === 'RFP' || sourceFrom === 'RFI') {
      this.fetchRFHeader();
    }
    if (sourceFrom === 'RFX') {
      this.fetchBidEvaluation();
      this.fetchItemLine();
    }
    this.fetchEvaluateSummary();
    this.newQuotationConfigSheet();
    this.queryDoubleUnit();
    this.queryBidFileTemplateConfig();
  }

  // 查询招标文件模板是否启用
  async queryBidFileTemplateConfig() {
    let data = null;

    try {
      data = await queryUiDisplayConfig({
        tableCode: 'ssrc_expert_evaluation_report_cnf',
        organizationId: getCurrentOrganizationId(),
        tenantNum: getCurrentTenant().tenantNum,
      });
      data = getResponse(data);
      if (!data) return;
      if (!isEmpty(data)) {
        this.setState({
          // 黑名单
          fileTemplateManageFlag: 0,
        });
      } else {
        this.setState({
          fileTemplateManageFlag: 1,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  async queryAttachmentCount(newCheckFlag) {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchAttachmentCount({
        rfxHeaderId: params.sourceHeaderId,
        newCheckFlag: newCheckFlag ? 1 : 0,
      })
    );
    if (result) {
      this.setState({
        attachmentCount: Number(result?.fileCount || 0) > 99 ? '99+' : result?.fileCount,
      });
    }
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
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
   * 保存数据
   */
  @Bind()
  async saveData() {
    const res = await this.saveBidCanadidate();
    if (res) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  // 更换路由, replace route, 初始化数据, 放置在 `componentDidUpdate`
  @Bind()
  replaceRoute(record) {
    const { dispatch, location } = this.props;
    const {
      routerParams: { cachTabKey, historyTag },
    } = this.state;
    const {
      sourceHeaderId = '',
      sourceFrom = '',
      sourceStatus = '',
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = record;
    const search = querystring.stringify({
      backRecommend: 'recommend', // 跳转评标管理页面，backpath标识
      cachTabKey,
      historyTag,
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });
    dispatch(
      routerRedux.replace({
        pathname: `${getJumpRoutePrefixUrl(location?.pathname)}/confirm-candidate/${
          record.sourceHeaderId
        }`,
        search,
      })
    );
  }

  componentWillUnmount() {
    const { modelName = 'inquiryHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemLine: [],
        bidSectionList: {},
        scoreDetailList: {},
        evalProgress: [],
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
  }

  /**
   * 获取RF头信息
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchRFHeader() {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchRFHeader`,
      payload: { organizationId, sourceHeaderId: params.sourceHeaderId },
    });
  }

  /**
   * 获取招标头信息
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchBidEvaluation() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchInquiryHeaderDetail`,
      payload: {
        organizationId,
        rfxHeaderId: params.sourceHeaderId,
        path,
        customizeUnitCode:
          'SSRC.EXPERT_SCORE_MANAGE.HEADER_BASE,SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_OTHERINFO_FORM',
      },
    });
  }

  /**
   * 获取评标步骤
   *
   * @memberof ConfirmCandidate
   */
  fetchEvalProgress() {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const { sourceFrom } = this.state;

    dispatch({
      type: `${modelName}/fetchEvalProgress`,
      payload: { organizationId, sourceHeaderId: params.sourceHeaderId, sourceFrom },
    });
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;

    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.sourceHeaderId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_DETAIL_ITEMLINE_TABLE',
      },
    });
  }

  /**
   * 查询标段数据
   *
   * @memberof ConfirmCandidate
   */
  fetchEvaluateSummary() {
    const {
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
      match: { params = {}, path },
      remote: remoteFunc,
    } = this.props;
    const { sourceFrom, historyTag } = this.state;

    const pathFromPub = path && path.includes('/pub');

    let paramsCux = {};
    if (remoteFunc) {
      paramsCux = remoteFunc.process('SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_FETCH_EVALUATE_SUMMARY_PARAMS',
        {},
        { props: this.props }
      );
    }

    dispatch({
      type: `${modelName}/fetchEvaluateSummary`,
      payload: {
        organizationId,
        sourceHeaderId: params.sourceHeaderId,
        sourceFrom,
        customizeUnitCode: pathFromPub
          ? 'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL'
          : historyTag === 'history'
          ? 'SSRC.EXPERT_SCORE_MANAGE.LINE_VIEW'
          : 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
        ...paramsCux,
      },
    }).then((res) => {
      if (!res || !res.evaluateSummaryMap) {
        return;
      }

      const resKey = Object.keys(res.evaluateSummaryMap);
      if (resKey.length) {
        this.setState({
          bidItemSelectedTabKey: resKey[0],
        });
      }
    });
  }

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;

    dispatch({
      type: `${modelName}/fetchScoreDetail`,
      payload: {
        organizationId,
        evaluateSummaryId: record.evaluateSummaryId,
      },
    });
  }

  /**
   * 查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearchSupplier(itemIds) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/supplierRecord`,
      payload: {
        organizationId,
        itemIds,
        rfxHeaderId: params.sourceHeaderId,
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 查看评分明细 - open modal
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  openScoreDetailModal(record = {}) {
    this.setState({
      scoreDetailModalVisible: true,
    });

    this.fetchScoreDetil(record);
  }

  /**
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  directorQuotationDetail(record = {}) {
    const {
      backRecommend = '',
      historyTag,
      cachTabKey,
      sourceFrom,
      sourceStatus,
      routerParams,
      newQuotationFlag = 0,
    } = this.state;
    const { sourceProjectId, projectLineSectionId } = routerParams;
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      location,
      [modelName]: { header = {} },
      match: { params = {} },
    } = this.props;
    const { secondarySourceCategory } = header || {};
    const { sourceHeaderId } = params || {};
    const { quotationHeaderId = null, supplierTenantId } = record;

    let search = querystring.stringify({
      switchUrl: 2, // 采购方跳转标识
      quotationHeaderId,
      noBackFlag: true,
      supplierTenantId,
    });
    const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);
    if (sourceFrom === 'RFX') {
      if (sourceProjectId && projectLineSectionId) {
        search += `&sourceProjectId=${sourceProjectId}&projectLineSectionId=${projectLineSectionId}`;
      }
      const currentTitle =
        secondarySourceCategory === 'NEW_BID'
          ? 'srm.common.tab.title.bidDetail'
          : 'srm.common.tab.title.quotationDetail';
      const currentAction =
        secondarySourceCategory === 'NEW_BID'
          ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
          : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情');

      if (newQuotationFlag) {
        const searchObj = {
          rfxHeaderId: sourceHeaderId,
          noBackFlag: 1, // openTab 不需要返回
          pageType: 'SUPPLIER_DETAIL_QUERY',
          switchUrl: 2, // 采购方跳转标识
        };
        let newQuotationPath = `/ssrc/supplier-reply/query/${quotationHeaderId}`;
        if (secondarySourceCategory === 'NEW_BID') {
          newQuotationPath = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
        }

        openTab({
          key: newQuotationPath,
          path: newQuotationPath,
          title: currentTitle,
          action: currentAction,
          search: querystring.stringify(searchObj),
          closable: true,
        });
        return;
      }

      // 如果是在专家评分跳转进来的，而且又是新招标
      const scoreBidFlag =
        header.secondarySourceCategory === 'NEW_BID' && activeTabKey === '/ssrc/expert-scoring';
      openTab({
        key: `${activeTabKey}/${scoreBidFlag ? 'bid-quotation-detail' : 'detail'}/${
          header.rfxHeaderId
        }/${record.supplierCompanyId}#${quotationHeaderId}`,
        title: currentTitle,
        action: currentAction,
        path: `${activeTabKey}/${scoreBidFlag ? 'bid-quotation-detail' : 'detail'}/${
          header.rfxHeaderId
        }/${record.supplierCompanyId}`,
        search,
        closable: true,
      });
    } else if (sourceFrom === 'RFI' || sourceFrom === 'RFP') {
      dispatch(
        routerRedux.push({
          pathname: `${activeTabKey}/reply-detail/${sourceFrom}/${params.sourceHeaderId}`,
          search,
        })
      );
      const source = {
        label: 'recommend',
        url: `${activeTabKey}/confirm-candidate/${params.sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${params.sourceHeaderId}&historyTag=${historyTag}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(`sourceRouter+${activeTabKey}`, JSON.stringify(source));
    }
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

  /**
   * 切换标段tabs
   *
   * @param {*} key
   * @returns
   * @memberof ConfirmCandidate
   */
  @Bind()
  changeBidItemTabs(key) {
    if (!key) {
      return;
    }

    this.setState({
      bidItemSelectedTabKey: key,
    });
  }

  /**
   * 跳转投标书详情
   *
   * @param {*} e
   * @memberof ConfirmCandidate
   */
  @Bind()
  directRfx(e) {
    e.stopPropagation();
    const {
      backRecommend = '',
      historyTag,
      cachTabKey,
      sourceStatus,
      sourceFrom,
      sourceHeaderId,
    } = this.state;
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      location,
      match: { params = {} },
      [modelName]: { header = {} },
    } = this.props;
    const search = querystring.stringify({
      backRecommend,
      sourcePage: 'confirm',
      historyTag,
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
    });
    const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);
    if (sourceFrom === 'RFX') {
      dispatch(
        routerRedux.push({
          pathname: `${activeTabKey}/${
            header.secondarySourceCategory === 'NEW_BID' ? 'new-bid' : 'rfx'
          }-detail/${params.sourceHeaderId}`,
          search,
        })
      );
      const source = {
        label: backRecommend,
        url: `${activeTabKey}/confirm-candidate/${params.sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&historyTag=${historyTag}`,
      };
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activeTabKey}`
          : `${backRecommend}+${activeTabKey}`;
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(key, JSON.stringify(source));
    } else if (sourceFrom === 'RFI' || sourceFrom === 'RFP') {
      dispatch(
        routerRedux.push({
          pathname: `${activeTabKey}/rf-detail/${sourceFrom}/${sourceHeaderId}`,
          search,
        })
      );
      const source = {
        label: backRecommend,
        url: `${activeTabKey}/confirm-candidate/${params.sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&historyTag=${historyTag}`,
      };
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activeTabKey}`
          : `${backRecommend}+${activeTabKey}`;
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(key, JSON.stringify(source));
    }
  }

  /**
   * 整单保存前获取页面数据
   *
   * @param {*} callBack
   * @returns
   * @memberof ConfirmCandidate
   */
  getAllData() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      form,
      [modelName]: { bidSectionList = {} },
    } = this.props;

    if (!Object.keys(bidSectionList).length) {
      return {
        errNum: 1,
      };
    }

    let max = 0;
    let candidateLength = 0;
    let errNum = false;
    const newDataMap = {};

    Object.keys(bidSectionList.evaluateSummaryMap).forEach((item) => {
      const EvaluateSummaryList = bidSectionList.evaluateSummaryMap[item];
      const formData = getEditTableData(EvaluateSummaryList);
      if (!formData.length) {
        errNum = true;
      }

      candidateLength = formData.filter((i) => i.candidateFlag).length;
      max = max > candidateLength ? max : candidateLength;
      newDataMap[item] = formData;
    });

    return {
      ...bidSectionList,
      errNum,
      max,
      evaluateSummaryMap: newDataMap,
      preAttachmentUuid: form.getFieldValue('preAttachmentUuid') || null,
    };
  }

  /**
   * 保存 整个页面数据
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  async saveBidCanadidate() {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    const { errNum = 0, ...others } = this.getAllData();
    if (errNum) {
      return false;
    }

    return dispatch({
      type: `${modelName}/saveRfxCandidate`,
      payload: {
        organizationId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
        ...others,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchEvaluateSummary();
        return res;
      }
    });
  }

  @Bind()
  async saveUuid() {
    const {
      dispatch,
      organizationId,
      form,
      match: { params = {} },
      modelName = 'inquiryHall',
    } = this.props;
    const { sourceFrom } = this.state;
    return dispatch({
      type: `${modelName}/saveRfxCandidate`,
      payload: {
        organizationId,
        preAttachmentUuid: form.getFieldValue('preAttachmentUuid') || null,
        sourceHeaderId: params.sourceHeaderId,
        sourceFrom,
      },
    }).then((res) => {
      if (res) {
        this.fetchEvaluateSummary();
        return res;
      }
    });
  }

  /**
   * 保存标段下供应商等信息
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  saveBidSection() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      form,
      organizationId,
      match: { params = {} },
      [modelName]: { bidSectionList = {} },
    } = this.props;

    const { bidItemSelectedTabKey, sourceFrom } = this.state;
    const data = getEditTableData(bidSectionList.evaluateSummaryMap[bidItemSelectedTabKey]);
    if (!data.length) {
      return;
    }

    dispatch({
      type: `${modelName}/saveRfxCandidate`,
      payload: {
        organizationId,
        ...bidSectionList,
        evaluateSummaryMap: {
          [bidItemSelectedTabKey]: data,
        },
        preAttachmentUuid: form.getFieldValue('preAttachmentUuid'),
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch({
          type: `${modelName}/fetchEvaluateSummary`,
          payload: {
            organizationId,
            sourceHeaderId: params.sourceHeaderId,
            sourceFrom,
          },
        });
      }
    });
  }

  /**
   * 整单提交
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  handleSubmit() {
    const { modelName = 'inquiryHall', remote: remoteFunc } = this.props;
    const {
      dispatch,
      location,
      organizationId,
      [modelName]: { bidSectionList = {}, header = {} },
    } = this.props;

    const bidFlag = header?.secondarySourceCategory === 'NEW_BID';

    const { sourceFrom } = this.state;

    const { errNum = 0, max = 0, ...others } = this.getAllData() || {};

    if (errNum) {
      return;
    }

    this.setState({ validateRfxCandidateLoading: true });
    // 增加 是否生成评分报告校验
    validateRfxCandidate({
      organizationId,
      ...(others || {}),
      customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
    })
      .then((result) => {
        const resp = getResponse(result);
        if (resp) {
          const submit = () => {
            dispatch({
              type: `${modelName}/submitRfxCandidate`,
              payload: {
                organizationId,
                ...others,
                customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.fetchEvaluateSummary();
                if (getJumpRoutePrefixUrl(location?.pathname) === '/ssrc/new-inquiry-hall') {
                  dispatch(
                    routerRedux.push({
                      pathname: `${getJumpRoutePrefixUrl(location?.pathname)}/list?sourceCategory=${
                        sourceFrom || 'RFX'
                      }`,
                    })
                  );
                }
                dispatch(
                  routerRedux.push({
                    pathname: `${getJumpRoutePrefixUrl(location?.pathname)}/list`,
                  })
                );
              }
            });
          };

          // 将提交方法提取方便二开
          const onSubmit = () => {
            if (!max && header.sourceCategory !== 'BID' && header.sourceStage === 'DOUBLE') {
              return notification.warning({
                message: intl.get(`ssrc.inquiryHall.view.message.selectCandi`).d('请选择候选人'),
              });
            } else if (max > 3) {
              Modal.confirm({
                content: intl
                  .get('ssrc.inquiryHall.view.message.selectedCandidates.tips', { max })
                  .d(`您推荐了{max}家供应商为候选人，是否确认提交结果？`),
                onOk: () => submit(),
                onCancel: () => {
                  dispatch({
                    type: `${modelName}/updateState`,
                    payload: {
                      bidSectionList,
                    },
                  });
                },
              });
            } else {
              submit();
            }
          };

          const getSubmit = () => {
            if (remoteFunc?.event) {
              remoteFunc.event.fireEvent('onSubmit', {
                onSubmit,
                others,
                header,
                bidFlag,
              });
            } else {
              onSubmit();
            }
          };

          // 返回结果有内容时有校验
          if (resp.length !== 0) {
            const validateMsg = resp[0];
            // 强校验
            if (validateMsg?.type === 'ERROR') {
              notification.error({ message: validateMsg?.message });
            } else {
              //  弱校验
              c7nModal.open({
                children: validateMsg.message,
                key: c7nModal.key(),
                onOk: getSubmit,
                title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
                border: false,
                bodyStyle: { 'padding-top': 0 },
                okText: intl.get(`hzero.common.button.confirm`).d('确认'),
              });
            }
          } else {
            getSubmit();
          }
        }
      })
      .finally(() => this.setState({ validateRfxCandidateLoading: false }));
  }

  /**
   * 评分报告-打开
   */
  @Bind()
  showSourceReport() {
    this.setState({
      sourceReportVisible: true,
      uploadLoading: true,
    });
  }

  /**
   * 评分报告-打开
   */
  @Bind()
  hideSourceReport() {
    this.setState({
      sourceReportVisible: false,
    });
  }

  @Bind()
  changeTemplateId(val, record) {
    this.setState({
      templateId: record.templateId,
    });
  }

  // 生成评分报告-开启招标文件管理
  @Bind()
  async handleCreateNewTemplateReport() {
    const {
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const {
      [modelName]: { header = {}, bidSectionList = {} },
      remote: remoteFunc,
    } = this.props;

    const bidFlag = header?.secondarySourceCategory === 'NEW_BID';
    const { sourceFrom } = this.state;
    const { sourceHeaderId } = params || {};
    if (!sourceHeaderId || !sourceFrom) return;
    try {
      const htmlContent = await createNewTemplateReport({
        organizationId,
        sourceHeaderId,
        sourceFrom,
      });
      if (getResponse(htmlContent)) {
        if (!bidSectionList?.preAttachmentUuid) {
          this.fetchEvaluateSummary();
        }
        if (remoteFunc?.event) {
          remoteFunc.event.fireEvent('handleAfterCreateNewTemplate', { bidFlag });
        }
        return c7nModal.open({
          key: c7nModal.key(),
          title: null,
          footer: null,
          bodyStyle: {
            padding: 0,
          },
          destroyOnClose: true,
          style: { width: '80%' },
          closable: true,
          children: (
            <iframe
              id={`EditOnline${sourceHeaderId}`}
              style={{
                border: '0',
                width: '100%',
                height: `${(document.body.clientHeight - 96) * 0.9}px`,
              }}
              title="Edit Online"
              // eslint-disable-next-line react/no-unknown-property
              srcdoc={htmlContent}
            />
          ),
        });
      }
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  getLineButtons(option = {}) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      form,
      // eslint-disable-next-line no-shadow
      remote,
      [modelName]: { header = {} },
      match: { params },
    } = this.props;
    const { sourceFrom, fileTemplateManageFlag } = this.state;
    const { getFieldDecorator, organizationId, bidSectionList, dataSource = [] } = option || {};
    const { sourceHeaderId } = params || {};

    const buttons = [
      sourceFrom === 'RFX' &&
        fileTemplateManageFlag !== -1 &&
        (fileTemplateManageFlag ? (
          <C7nButton
            name="createRptTemplate"
            onClick={this.handleCreateNewTemplateReport}
            style={{ borderRadius: '4px', marginRight: '8px' }}
          >
            {intl.get(`ssrc.inquiryHall.view.button.createRptTemplate`).d('生成评分报告')}
          </C7nButton>
        ) : (
          <div name="createRptTemplate" style={{ marginRight: '8px' }}>
            <Lov
              isButton
              type="default"
              onChange={(val, record) => this.changeTemplateId(val, record)}
              onOk={this.showSourceReport}
              code="SSRC.SCORE_RPT_TPL"
              queryParams={{
                tenantId: organizationId,
              }}
            >
              {intl.get(`ssrc.inquiryHall.view.button.createRptTemplate`).d('生成评分报告')}
            </Lov>
          </div>
        )),
      <div name="uploadAttachment" className={classnames(common['m-r-m'], 'ant-btn')}>
        <Form.Item>
          {getFieldDecorator('preAttachmentUuid', {
            initialValue: bidSectionList.preAttachmentUuid || '',
          })(
            <Upload
              showFieldsNumber={false}
              fileSize={FIlESIZE}
              bucketName={PRIVATE_BUCKET} // 预定表
              bucketDirectory="ssrc-prequal-scaling"
              attachmentUUID={bidSectionList.preAttachmentUuid}
              tenantId={organizationId}
              filePreview
              onChange={(uuid) => {
                if (!bidSectionList.preAttachmentUuid) {
                  form.setFieldsValue({
                    preAttachmentUuid: uuid,
                  });
                  this.saveUuid();
                }
              }}
              {...ChunkUploadProps}
            />
          )}
        </Form.Item>
      </div>,
    ];

    if (!remote) {
      return buttons;
    }
    const processProps = {
      header,
      dataSource,
      rfxHeaderId: sourceHeaderId,
      bidFlag: header?.secondarySourceCategory === 'NEW_BID',
      currentThis: this,
      sourceFrom,
    };
    return remote.process(
      'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_PROCESS_LINE_BUTTONS',
      buttons,
      processProps
    );
  }

  /**
   * 渲染标段操作按钮组
   *
   * @param {*} [option={}]
   * @returns
   * @memberof ConfirmCandidate
   */
  renderBidOperateButtons(option = {}) {
    const { customizeBtnGroup = () => {} } = this.props;
    const { historyTag, uploadLoading } = this.state;
    return (
      <Spin spinning={uploadLoading}>
        <div
          style={{
            display: historyTag === 'history' ? 'none' : 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'row-reverse',
            marginBottom: '16px',
          }}
        >
          {customizeBtnGroup(
            {
              code: 'SSRC.EXPERT_SCORE_MANAGE.SECTION_HEADER_BUTTONS',
            },
            this.getLineButtons(option)
          )}
        </div>
      </Spin>
    );
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      rfxLineItemId,
      modelName = 'inquiryHall',
    } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        supplierCompanyName,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelyTable`,
      payload: { rfxLineItemId, organizationId },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    this.setState({ viewLadderLevelVisible: false });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        ladderLevelData: [],
      },
    });
  }

  getBackPath() {
    const { location } = this.props;
    const { backRecommend, cachTabKey, sourceFrom } = this.state;
    let back;
    if (backRecommend === 'recommend') {
      back = `${getJumpRoutePrefixUrl(location?.pathname)}/list?${
        getJumpRoutePrefixUrl(location?.pathname) === '/ssrc/expert-scoring'
          ? cachTabKey
          : `sourceCategory=${sourceFrom}`
      }`;
    } else {
      back = `${getJumpRoutePrefixUrl(location?.pathname)}/list`;
    }
    return back;
  }

  // 渲染 `Content` 组件
  renderContent() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      match,
      // eslint-disable-next-line no-shadow
      remote,
      organizationId,
      fetchItemLineLoading,
      saveRfxCandidateLoading,
      form: { getFieldDecorator },
      customizeTable,
      customizeForm,
      customizeCollapse,
      customizeTabPane,
      [modelName]: {
        header = {},
        itemLine = [],
        supplierData = [],
        bidSectionList = {},
        itemLinePagination = {},
      },
    } = this.props;

    const { historyTag, collapseKeys, sourceFrom, doubleUnitFlag } = this.state;

    // 基本信息props
    const bidInfoProps = {
      header,
      remote,
      organizationId,
      customizeForm,
      viewBidMembers: this.viewBidMembers,
    };

    // 其它信息tab props
    const othersInfoProps = {
      header,
      organizationId,
      customizeForm,
    };

    // 物品信息tab props
    const itemLineProps = {
      match,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      searchSupplier: this.handleSearchSupplier,
      onSearch: this.fetchItemLine,
      supplierDataSource: supplierData,
      showQuotationDetail: this.showQuotationDetail,
      viewLadderLevel: this.viewLadderLevelModal,
      pagination: { total: itemLinePagination.total },
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      doubleUnitFlag,
      customizeTable,
    };

    const docLink = (
      <span style={{ marginLeft: '20px', marginRight: '10px' }} onClick={this.directRfx}>
        <Popover
          content={
            sourceFrom === 'RFX' && header.secondarySourceCategory !== 'NEW_BID'
              ? intl.get(`ssrc.inquiryHall.view.message.title.rfxDetail`).d('询价单明细')
              : intl.get(`ssrc.inquiryHall.view.message.title.rfDetail`).d('明细')
          }
        >
          <SVGIcon path={bidView} className={styles['link-color']} />
        </Popover>
      </span>
    );

    const remoteProps = {
      header,
      historyTag,
    };

    return (
      <React.Fragment>
        <div>
          {' '}
          {/* 禁止删除 flex布局改变层级 */}
          <Content className="ued-detail-wrapper" style={{ margin: '0 8px' }}>
            {customizeCollapse(
              {
                code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_COLLAPSE',
              },
              <Collapse className="form-collapse" onChange={this.onCollapseChange}>
                <Panel
                  showArrow={false}
                  header={
                    <React.Fragment>
                      <span
                        className={common['collapse-title']}
                        style={{
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '90%',
                          float: 'left',
                        }}
                      >
                        {header.rfxNum || header.rfNum} —{' '}
                        <Tooltip
                          title={`${header.rfxNum || header.rfNum} — ${
                            header.rfxTitle || header.rfTitle || ''
                          }`}
                          overlayStyle={{ minWidth: '300px' }}
                        >
                          {header.rfxTitle || header.rfTitle || ''}
                        </Tooltip>
                      </span>
                      {remote
                        ? remote.render(
                            'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_RENDER_DOCLINK',
                            docLink,
                            remoteProps
                          )
                        : docLink}
                      {sourceFrom === 'RFX' && (
                        <React.Fragment>
                          <a>
                            {collapseKeys.includes('baseInfos')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  }
                  key="baseInfos"
                  forceRender
                >
                  {sourceFrom === 'RFX' ? (
                    <React.Fragment>
                      {customizeTabPane(
                        {
                          code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_BASIC_TABS',
                        },
                        <Tabs
                          defaultActiveKey="baseInfos"
                          animated={false}
                          onChange={this.changeTabs}
                        >
                          <Tabs.TabPane
                            tab={intl
                              .get(`ssrc.inquiryHall.view.message.tab.baseInfos`)
                              .d('基本信息')}
                            key="baseInfos"
                          >
                            <BidInfo {...bidInfoProps} />
                          </Tabs.TabPane>
                          <Tabs.TabPane
                            tab={intl
                              .get(`ssrc.inquiryHall.view.message.tab.otherInfos`)
                              .d('其他信息')}
                            key="otherInfos"
                            forceRender
                          >
                            <OthersInfo {...othersInfoProps} />
                          </Tabs.TabPane>
                          <Tabs.TabPane
                            tab={intl
                              .get(`ssrc.inquiryHall.view.message.tab.itemsInfo`)
                              .d('物品信息')}
                            key="itemsInfos"
                            forceRender
                          >
                            <ItemLine {...itemLineProps} />
                          </Tabs.TabPane>
                        </Tabs>
                      )}
                    </React.Fragment>
                  ) : null}
                </Panel>
              </Collapse>
            )}
          </Content>
        </div>
        {Object.keys(bidSectionList.evaluateSummaryMap || {}).length ? (
          <div
            className={common['exclude-content-card']}
            style={{ flex: 1, width: 'calc(100% - 16px)', margin: '8px' }}
          >
            {bidSectionList.sectionFlag ? (
              <Tabs onChange={this.changeBidItemTabs} animated={false}>
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <Tabs.TabPane forceRender key={item} tab={item}>
                      <div style={{ marginTop: '24px' }}>
                        {remote
                            ? remote.render(
                                'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_RENDER_BID_TABLE_SECTION_BTN',
                                this.renderBidOperateButtons({
                                  getFieldDecorator,
                                  organizationId,
                                  bidSectionList,
                                  saveRfxCandidateLoading,
                                  dataSource: bidSectionList.evaluateSummaryMap[item],
                                }),
                                {
                                  header,
                                }
                              )
                            : this.renderBidOperateButtons({
                                getFieldDecorator,
                                organizationId,
                                bidSectionList,
                                saveRfxCandidateLoading,
                                dataSource: bidSectionList.evaluateSummaryMap[item],
                              })}
                      </div>
                      <BidSectionTable
                        remote={remote}
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorQuotationDetail={this.directorQuotationDetail}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        match={match}
                        historyTag={historyTag}
                        customizeTable={customizeTable}
                        sourceFrom={sourceFrom}
                        bidSectionList={bidSectionList}
                        state={this.state}
                      />
                    </Tabs.TabPane>
                    ))
                  : ''}
              </Tabs>
            ) : (
              <div>
                {remote
                  ? remote.render(
                      'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_RENDER_BID_TABLE_BTN',
                      this.renderBidOperateButtons({
                        getFieldDecorator,
                        organizationId,
                        bidSectionList,
                        saveRfxCandidateLoading,
                        dataSource:
                          bidSectionList?.evaluateSummaryMap?.[
                            Object.keys(bidSectionList?.evaluateSummaryMap)?.[0]
                          ] || [],
                      }),
                      {
                        header,
                      }
                    )
                  : this.renderBidOperateButtons({
                      getFieldDecorator,
                      organizationId,
                      bidSectionList,
                      saveRfxCandidateLoading,
                      dataSource:
                        bidSectionList?.evaluateSummaryMap?.[
                          Object.keys(bidSectionList?.evaluateSummaryMap)?.[0]
                        ] || [],
                    })}
                {Object.keys(bidSectionList.evaluateSummaryMap).length
                  ? Object.keys(bidSectionList.evaluateSummaryMap).map((item) => (
                    <div key={item}>
                      <BidSectionTable
                        remote={remote}
                        header={header}
                        dataSource={bidSectionList.evaluateSummaryMap[item]}
                        openScoreDetailModal={this.openScoreDetailModal}
                        directorQuotationDetail={this.directorQuotationDetail}
                        businessWeight={bidSectionList.businessWeight}
                        technologyWeight={bidSectionList.technologyWeight}
                        match={match}
                        historyTag={historyTag}
                        customizeTable={customizeTable}
                        sourceFrom={sourceFrom}
                        bidSectionList={bidSectionList}
                        state={this.state}
                      />
                    </div>
                    ))
                  : ''}
              </div>
            )}
          </div>
        ) : (
          ''
        )}
      </React.Fragment>
    );
  }

  // 退回至汇总
  @Bind
  handleReturnToSummary() {
    const {
      dispatch,
      modelName = 'inquiryHall',
      match: { params },
      location,
    } = this.props;
    const { routerParams } = this.state;
    const { sourceProjectId, sourceHeaderId, projectLineSectionId } = routerParams || {};
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { roundQuotationRule, multiSectionFlag } = header || {};
    const rfxHeaderId = params?.sourceHeaderId;
    dispatch({
      type: `${modelName}/returnToSummary`,
      payload: {
        sourceFrom: 'RFX',
        sourceHeaderId,
      },
    }).then((res) => {
      if (res && !res.failed) {
        const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);
        const search = querystring.stringify({
          evaluateLeaderFlag: 1, // 只有评分负责人能进这个页面，后端说写死给1
          cachTabKey: 'scoreing',
          sourceFrom: 'RFX',
          sourceHeaderId: rfxHeaderId,
          sourceStatus: 'RFX_EVALUATION_PENDING',
          backRecommend: 'recommend',
          roundQuotationRule,
          multiSectionFlag,
          sourceProjectId,
          projectLineSectionId,
        });
        dispatch(
          routerRedux.push({
            pathname: `${activeTabKey}/rfx-evaluation/${rfxHeaderId}`,
            search,
          })
        );
      }
    });
  }

  /**
   * 屈臣氏二开
   */
  renderScoreDetailModal(scoreDetailProps) {
    // eslint-disable-next-line no-shadow
    const { remote } = this.props;
    const renderProps = {
      ...scoreDetailProps,
    };
    if (!remote) {
      return <ScoreDetailModal {...scoreDetailProps} />;
    }
    return remote.render(
      'RENDER_SCORE_VIEW',
      <ScoreDetailModal {...scoreDetailProps} />,
      renderProps
    );
  }

  /*
   * 永祥继承二开
   */
  renderHeaderButtons() {
    const {
      sourceHeaderId,
      historyTag,
      routerParams,
      attachmentCount,
      sourceFrom = 'RFX',
      validateRfxCandidateLoading = false,
    } = this.state;
    const {
      saveRfxCandidateLoading,
      submitRfxCandidateLoading,
      returnToSummaryLoading,
      // eslint-disable-next-line no-shadow
      remote,
      location,
      modelName = 'inquiryHall',
      dispatch,
      history,
      customizeBtnGroup,
    } = this.props;

    const {
      [modelName]: { evalProgress = [], header = {} },
      organizationId,
    } = this.props;

    const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);

    // button loading
    const buttonLoading =
      returnToSummaryLoading ||
      saveRfxCandidateLoading ||
      submitRfxCandidateLoading ||
      validateRfxCandidateLoading;

    const renderButtons =
      historyTag !== 'history'
        ? [
          <Button
            icon="rocket"
            type="primary"
            loading={
                submitRfxCandidateLoading || validateRfxCandidateLoading || returnToSummaryLoading
              }
            onClick={this.handleSubmit}
            key="submit" // 禁止删除 协鑫租户根据key判断
            name="submit"
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>,
          <Button
            icon="save"
            onClick={this.saveBidCanadidate}
            loading={saveRfxCandidateLoading || returnToSummaryLoading}
            key="save" // 禁止删除 协鑫租户根据key判断
            name="save"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>,
            sourceFrom === 'RFX' ? (
              <Button
                icon="rollback"
                onClick={this.handleReturnToSummary}
                loading={buttonLoading}
                name="returnToSummary"
              >
                {intl.get('ssrc.inquiryHall.view.button.returnToSummary').d('退回至汇总')}
              </Button>
            ) : null,
          <Badge name="attachmentUpload" count={attachmentCount} className={styles['badge-item']}>
            <Button
              name="attachmentUpload"
                // className="no-border-btn"
              icon="get_app"
              onClick={() =>
                  openC7nProcessAttachmentModal({
                    rfxHeaderId: sourceHeaderId,
                    sourceFrom: 'score-rpt',
                  })()
                }
            >
              {intl.get('hzero.common.button.open').d('过程附件下载')}
            </Button>
          </Badge>,
          ]
        : [];

    // eslint-disable-next-line no-shadow
    const remoteButtons = remote
      ? remote.process(
          'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_PROCESS_HEADER_BUTTONS',
          renderButtons,
          {
            sourceHeaderId,
            historyTag,
            header,
            activeTabKey,
            evalProgress,
            dispatch,
            modelName,
            routerParams,
            sourceFrom,
            organizationId,
            backPath: this.getBackPath(),
            history,
            fetchBidEvaluation: this.fetchBidEvaluation,
          }
        )
      : renderButtons;
    return customizeBtnGroup(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_BUTTONS',
      },
      (remoteButtons || []).filter(Boolean)
    );
  }

  @Bind()
  handleEditorOnlineClose() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { bidSectionList = {} },
    } = this.props;

    this.setState({
      uploadLoading: false,
    });
    if (!bidSectionList?.preAttachmentUuid) {
      this.fetchEvaluateSummary();
    }
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      match: { params = {} },
      fetchScoreDetailLoading,
      fetchLadderLevelLoading,
      saveRfxCandidateLoading = false,
      fetchEvaluateSummaryLoading = false,
      [modelName]: { evalProgress = [], scoreDetailList = {}, ladderLevelData = [], header = {} },
      remote: remoteFunc,
    } = this.props;

    const {
      historyTag,
      scoreDetailModalVisible,
      viewLadderLevelVisible = false, // 阶梯报价模态框
      LadderLevelHeaderData = {}, // 阶梯报价头部数据
      sourceReportVisible = false,
      templateId,
      routerParams,
      doubleUnitFlag,
    } = this.state;

    const {
      sourceStatus,
      sourceProjectId,
      sourceHeaderId,
      projectLineSectionId,
      cachTabKey,
    } = routerParams;

    // 阶梯报价
    const ladderLevelModalProps = {
      // viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      visible: viewLadderLevelVisible,
      ladderLevelData,
      LadderLevelHeaderData,
      fetchLadderLevelLoading,
      doubleUnitFlag,
    };

    // 评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
      loading: fetchScoreDetailLoading,
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
      className: 'ssrc-bid-section-panel-confirm-candidate',
      afterOpenSection: this.replaceRoute,
      beforeOpenSection: remoteFunc
        ? remoteFunc.process(
            'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_PROCESS_SECTION_BEFORE_OPEN',
            historyTag !== 'history' ? this.saveData : null,
            { header }
          )
        : historyTag !== 'history'
        ? this.saveData
        : null,
    };

    const headerTitle =
      historyTag !== 'history'
        ? intl.get(`ssrc.inquiryHall.view.message.title.recommendCandi`).d('推荐成交候选人')
        : intl.get(`ssrc.inquiryHall.view.message.title.viewTheScore`).d('查看评分结果');

    // 埋点头标题
    const remoteHeaderTitle = remoteFunc
      ? remoteFunc.process(
          'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_PROCESS_HEADER_TITLE',
          headerTitle,
          { routerParams }
        )
      : headerTitle;

    return (
      <Spin spinning={saveRfxCandidateLoading || fetchEvaluateSummaryLoading}>
        <Form
          className={common['detail-standard']}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <Header title={remoteHeaderTitle} backPath={this.getBackPath()}>
            {this.renderHeaderButtons()}
          </Header>

          {historyTag !== 'history' ? (
            <Process
              dataSource={evalProgress}
              style={{ width: 'calc(100% - 16px)', margin: '8px' }}
            />
          ) : (
            ''
          )}

          {projectLineSectionId && projectLineSectionId !== 'null' ? (
            <SectionPanel {...sectionPanelProps}>{this.renderContent()}</SectionPanel>
          ) : (
            this.renderContent()
          )}

          {scoreDetailModalVisible && this.renderScoreDetailModal(scoreDetailProps)}
          {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
          {sourceReportVisible && (
            <Modal
              destroyOnClose
              visible={sourceReportVisible}
              footer={null}
              onCancel={this.hideSourceReport}
              width={1100}
            >
              <EditorOnline
                callBack={this.handleEditorOnlineClose}
                iframeStyle={{
                  width: '100%',
                  height: `${(document.body.clientHeight - 96) * 0.9}px`,
                }}
                templateId={templateId}
                sourceHeaderId={params.sourceHeaderId}
                sourceFrom="RFX"
                onRef={(node) => {
                  this.editorOnlineRef = node;
                }}
              />
            </Modal>
          )}
        </Form>
      </Spin>
    );
  }
}

const hocComponet = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL',
        'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
        'SSRC.EXPERT_SCORE_MANAGE.SECTION_HEADER_BUTTONS',
        'SSRC.EXPERT_SCORE_MANAGE.HEADER_BASE',
        'SSRC.EXPERT_SCORE_MANAGE.LINE_VIEW',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_OTHERINFO_FORM',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_DETAIL_ITEMLINE_TABLE',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_COLLAPSE',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_BASIC_TABS',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_BUTTONS',
      ],
    }),
    Form.create({ fieldNameProp: null }),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.bidHall', 'scux.ssrc', 'ssrc.scux'],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      modelName: 'inquiryHall',
      fetchEvaluateSummaryLoading: loading.effects['inquiryHall/fetchEvaluateSummary'],
      fetchScoreDetailLoading: loading.effects['inquiryHall/fetchScoreDetail'],
      saveRfxCandidateLoading: loading.effects['inquiryHall/saveRfxCandidate'],
      submitRfxCandidateLoading: loading.effects['inquiryHall/submitRfxCandidate'],
      fetchInquiryHallUpdateLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
      fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLine'],
      fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
      fetchLadderLevelLoading: loading.effects['inquiryHall/fetchLadderLevelyTable'],
      returnToSummaryLoading: loading.effects['inquiryHall/returnToSummary'],
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
    }))
  )(
    remote(
      {
        code: 'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE',
        name: 'remote',
      },
      {
        events: {
          onSubmit(eventProps) {
            // 标准click逻辑
            const { onSubmit = noop } = eventProps || {};
            onSubmit();
          },
          handleAfterCreateNewTemplate() {},
        },
      }
    )(Com)
  );
};

export { ConfirmCandidate, hocComponet };
export default hocComponet(ConfirmCandidate);
