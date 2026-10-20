/**
 * 初步评审 - 基于评分页面修改(暂不包含招投标)
 * @date: 2020-12-28
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Spin, Tooltip, Modal, Icon, Tag } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import { Button as C7nButton, Icon as C7nIcon, Divider, Badge } from 'choerodon-ui';
import { map, isEmpty, isArray, compose } from 'lodash';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
// import { getActiveTabKey } from 'utils/menuTab';
import Upload from '_components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import remote from 'hzero-front/lib/utils/remote';

import Iconfont from '@/routes/ssrc/components/Icons'; // 下载至本地的icon
import PriceComparison from '@/routes/ssrc/components/PriceComparison';
import SVGIcon from '@/routes/components/SvgIcon';
import QuoteAttachment from '@/routes/ssrc/SupplierQuotation/InquiryPrice/QuoteAttachment';
import SectionPanel from '@/routes/sbid/components/SectionPanel';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { numberSeparatorRender } from '@/utils/renderer';
import { isText, getJumpRoutePrefixUrl } from '@/utils/utils';
import bidView from '@/assets/bid-view.svg';
import { queryEnableDoubleUnit, queryTemplateConfig } from '@/services/commonService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import LadderLevel from '../../../ssrc/components/LadderLevelDoubleUnit';
import ItemLineTable from './ItemLineTable';
import ReviewDetailModal from './ReviewDetailModal';
import ScoreElementTable from './ScoreElementTable';

import styles from './index.less';
// import BidScoreElementTable from './BidScoreElementTable';

const file = require('@/assets/file.svg');

const { confirm } = Modal;
const promptCode = 'ssrc.expertScoring';
class Review extends Component {
  constructor(props) {
    super(props);
    this.initState(props, 'init');
    this.activeTabKey = getJumpRoutePrefixUrl(props.location.pathname);
  }

  /**
   * 初始化state
   * @param {Obejct} props - 组件props
   * @param {boolean} isInit - 是否初始化
   */
  initState(props, isInit) {
    const { location, match } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { sourceHeaderId } = match.params;
    const { evaluateExpertId = null } = routerParams;
    const routerList = location.pathname.split('/');
    const state = {
      routerList,
      routerParams: { ...routerParams, sourceHeaderId },
      expand: {}, // 展开数据
      loadingObj: {},
      sectionFlag: 1, // 标段标识
      scoreIndicFlag: false,
      quotationHeaderId: null,
      sectionId: null,
      scoreFlag: false,
      attachmentsProps: {}, // 查看报价行附件属性集合
      attachmentVisible: false, // 附件组件显示标识
      reviewAttachmentUuid: null, // 头附件
      supplierDimension: {}, // 供应商维度
      activeKey: '', // 标签页activeKey
      evaluateExpertId: evaluateExpertId || sessionStorage.getItem('evaluateExpertId'), // XXX 后期逐步去除使用,使用路由传参
      priceComparisonModalVisible: false, // 比价助手模态框
      doubleUnitFlag: false, // 双单位标志
      newQuotationFlag: false, // 开启新报价
      templateConfig: {}, // 查询该模版配置
    };

    if (isInit) {
      this.state = state;
    } else {
      this.setState(state, this.initQuery);
    }
  }

  supplierTable = {};

  // 初始化查询供应商列表数据
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
  async initQuery() {
    try {
      await this.fetchHeader();
    } catch (e) {
      throw e;
    }
    this.queryExpertScoring();
    this.handleQuerySetting();
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();
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
    const { organizationId, match } = this.props;
    const { sourceHeaderId } = match.params || {};
    let newQuotationFlag = false;

    const param = {
      organizationId,
      rfxHeaderId: sourceHeaderId,
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

  // 更换路由, replace route, 初始化数据, 放置在 `componentDidUpdate`
  @Bind()
  replaceRoute(record) {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    const {
      routerParams: { cachTabKey },
    } = this.state;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        scoreElementList: {}, // 专家评分--分标段/不分标段-评分要素维度信息
      },
    });
    const {
      sourceHeaderId,
      sourceStatus,
      expertUserId,
      subjectMatterRule,
      scoredStatus,
      expertSequenceNum,
      sourceFrom,
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

    dispatch(
      routerRedux.replace({
        pathname: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/initial-review`,
        search,
      })
    );
  }

  /**
   * 保存数据
   */
  @Bind()
  async saveData() {
    const { supplierDimension = {} } = this.state;
    if (!supplierDimension.flag) {
      return Promise.resolve(true);
    }
    try {
      const res = await this.saveExpert('changeSection');
      if (res) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    } catch {
      return Promise.resolve(false);
    }
  }

  /*
   * 查询配置中心值
   */
  handleQuerySetting() {
    const { dispatch, modelName = 'expertScoring', match } = this.props;
    const { sourceHeaderId, sourceFrom } = match.params;
    dispatch({
      type: `${modelName}/querySetting`,
      payload: {
        '011117': '011117',
      },
    });
    if (sourceFrom === 'RFX') {
      queryTemplateConfig({
        sourceHeaderId,
        sourceFrom,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            templateConfig: res,
          });
        }
      });
    }
  }

  // 查询头信息
  fetchHeader() {
    const { match, dispatch, organizationId, modelName = 'expertScoring' } = this.props;
    const { sourceHeaderId, sourceFrom } = match.params;
    let data = {
      organizationId,
    };
    const queryMethod = sourceFrom === 'BID' ? 'fetchBidHeaderDetail' : 'fetchRfxHeaderInfo';

    switch (sourceFrom) {
      case 'BID':
        data = Object.assign(data, { sourceFrom: 'BID', bidHeaderId: sourceHeaderId });
        break;
      case 'RFX':
        data = Object.assign(data, { sourceFrom: 'RFX', rfxHeaderId: sourceHeaderId });
        break;
      default:
        data = Object.assign(data, { sourceFrom, rfxHeaderId: sourceHeaderId });
        break;
    }

    return dispatch({
      type: `${modelName}/${queryMethod}`,
      payload: { ...data },
    });
  }

  /**
   * 查询供应商信息
   */
  @Bind()
  queryExpertScoring() {
    const page = {};
    const {
      routerParams,
      routerParams: { checkScore },
    } = this.state;
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      dispatch,
      [modelName]: { header },
    } = this.props;
    const { remote: remoteFunc } = this.props;
    const { secondarySourceCategory } = header || {};

    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    const lovCodes = {
      detailApprovedStatus: 'SSRC.DETAIL_APPROVED_STATUS', //  通过状态
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
    dispatch({
      type: `${modelName}/fetchQueryReviewSupplier`,
      payload: {
        sourceHeaderId,
        expertUserId,
        subjectMatterRule,
        expertSequenceNum,
        sourceFrom,
        viewScoreFlag:
          (routerParams.cachTabKey || '').includes('scoreing') &&
          routerParams.reviewScoredStatus !== 'SCORED'
            ? 0
            : 1,
        page,
      },
    }).then((res) => {
      if (res) {
        if (res.subjectMatterRule === 'PACK' && sourceFrom === 'BID') {
          // (下个迭代需要, 暂时弃用)
          // 分标段,标段查询后，设置activeKey和supplierDimension默认值
          const bidLineItemIds = res.evaluateSectionDTOS.map((item) => item.bidLineItemId);
          // 查询评分要素维度
          this.fetchScoreElementList(bidLineItemIds);
          this.setState({ activeKey: `${res.evaluateSectionDTOS[0].bidLineItemId}` });
          let supplierDimension = {};
          bidLineItemIds.forEach((item) => {
            supplierDimension = { ...supplierDimension, [item]: false };
          });
          this.setState({ supplierDimension });
        } else {
          // 不分标段,设置supplierDimension默认值
          this.fetchScoreElementList();
          this.setState({
            supplierDimension: {
              flag: remoteFunc
                ? remoteFunc.process('SSRC_INITIAL_REVIEWS_PROCESS_DEFAULT_DIMENSION', false, {
                    secondarySourceCategory,
                  })
                : false,
            },
          });
          // this.setState({ supplierDimension: { flag: false } });
        }
        // eslint-disable-next-line react/no-unused-state
        this.setState({ sectionFlag: res.sectionFlag });
        if (checkScore === 'checkScore') {
          const eventProps = {
            secondarySourceCategory,
            switchDimension: this.switchDimension,
          };
          if (remote?.event) {
            remote.event.fireEvent('handleInitDemesion', eventProps);
          } else {
            this.switchDimension();
          }
          // this.switchDimension();
        }
      }
    });
  }

  /**
   * 专家评分-查询供应商信息
   */
  fetchScoreSupplierList() {
    const page = {};
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    dispatch({
      type: `${modelName}/fetchQueryReviewSupplier`,
      payload: {
        sourceHeaderId,
        expertUserId,
        subjectMatterRule,
        expertSequenceNum,
        sourceFrom,
        page,
      },
    });
  }

  /**
   * 专家评分--不分标段-评分要素查询 bidLineItemIds = []
   * 专家评分--标段-评分要素查询 bidLineItemIds = [1,2,3]
   * @memberof BidEvaluation
   */
  fetchScoreElementList(bidLineItemIds = []) {
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const { evaluateExpertId, routerParams = {} } = this.state;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    const payload = isEmpty(bidLineItemIds)
      ? {
          sourceHeaderId,
          expertUserId,
          subjectMatterRule,
          expertSequenceNum,
          sourceFrom,
          evaluateExpertId,
          viewScoreFlag:
            (routerParams.cachTabKey || '').includes('scoreing') &&
            routerParams.reviewScoredStatus !== 'SCORED'
              ? 0
              : 1,
        }
      : {
          sourceHeaderId,
          expertUserId,
          subjectMatterRule,
          expertSequenceNum,
          sourceFrom,
          bidLineItemIds,
          evaluateExpertId,
          viewScoreFlag:
            (routerParams.cachTabKey || '').includes('scoreing') &&
            routerParams.reviewScoredStatus !== 'SCORED'
              ? 0
              : 1,
        };
    dispatch({
      type: `${modelName}/fetchScoreElementList`,
      payload: {
        ...payload,
        evaluateScoreType: 'INITIAL_REVIEW',
        customizeUnitCode:
          routerParams.reviewScoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_DETAIL'
            : 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
      },
    });
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        evaluateSectionList: [], // 标段评分供应商
        evaluateScoreList: [], // 不分标段评分供应商
        expAttachmentUuid: null, // 附件
        scoreElementList: {}, // 专家评分--分标段/不分标段-评分要素维度信息
        exchangeEditSupplierList: [],
        header: {},
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
    sessionStorage.removeItem('evaluateExpertId');
  }

  // 获取返回路径
  getBackPath(routerParams = {}) {
    const { cachTabKey = null, sourcePage = null } = routerParams;
    let path = `${this.activeTabKey}/list?${cachTabKey}`;
    if (sourcePage === 'RFXLIST') {
      path = '/ssrc/inquiry-hall/list';
    }
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(this.activeTabKey)) {
      path = `${this.activeTabKey}/list`;
    }

    return path;
  }

  /**
   *展开时重新调用单独查询投标物料行列表数据
   */
  expandItemLine = (e, quotationHeaderId, item) => {
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const { sourceFrom } = match.params;
    e.stopPropagation();
    const { expand } = this.state;
    const currentStatus = expand[`${item.sectionId}#${quotationHeaderId}`];
    if (!currentStatus) {
      const loadingObj = {
        [quotationHeaderId]: { queryScoringQuotationLoading: true },
      };
      this.setState({ loadingObj });
      // 查询供应商投标物料行
      dispatch({
        type: `${modelName}/fetchScoringQuotation`,
        payload: {
          page: {},
          quotationHeaderId,
          sectionId: item.sectionId,
          supplierId: item.supplierCompanyId,
          team: item.team,
          sourceFrom,
          customizeUnitCode: 'SSRC.EXPERT_SCORE_REVIEW.QUOTATION_LINE',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            loadingObj: { [quotationHeaderId]: { queryScoringQuotationLoading: false } },
          });
        }
      });
    }
    this.setState({
      expand: {
        ...expand,
        [`${item.sectionId}#${item.quotationHeaderId}`]: !expand[
          `${item.sectionId}#${item.quotationHeaderId}`
        ],
      },
    });
  };

  /**
   * 专家评分要素维度保存数据处理 - 暂时只有通过制
   */
  expertElementSave(item, element) {
    const { form = {} } = this.props;
    const newOtherItem = element || item;
    return {
      ...newOtherItem,
      indicScore:
        item.indicateType === 'SCORE'
          ? form.getFieldValue(
              item.bidLineItemId || item.bidLineItemId === 0
                ? `indicScore#${item.evaluateIndicId}#${newOtherItem.bidLineItemId}`
                : `indicScore#${item.evaluateIndicId}#${newOtherItem.indicateId}`
            )
          : null,
      passStatus:
        item.indicateType === 'PASS'
          ? form.getFieldValue(
              item.bidLineItemId || item.bidLineItemId === 0
                ? `indicScore#${item.evaluateIndicId}#${newOtherItem.bidLineItemId}`
                : `indicScore#${item.evaluateIndicId}#${newOtherItem.indicateId}`
            )
          : null,
    };
  }

  /**
   * 保存
   */
  @Bind()
  onSaveScoring() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: {
        scoringRightDeatilHeader = {},
        scoringRightDeatilLine = [],
        scoreElementList = [],
      },
      match,
      form = {},
    } = this.props;
    const { expertUserId, expertSequenceNum, sourceFrom, subjectMatterRule } = match.params;
    const { quotationHeaderId, sectionId, sectionFlag, routerList, routerParams } = this.state;
    let newParams = [];
    form.validateFields((err, values) => {
      if (!err) {
        if (routerList.includes('RFX')) {
          newParams = scoringRightDeatilLine.map((item) => {
            if (item.detailEnabledFlag) {
              const { evaluateScoreLineDetailS = [], ...otherItem } = item;
              const newLineItem = evaluateScoreLineDetailS.map((element) => {
                const expertElementData = this.expertElementSave(item, element);
                return expertElementData;
              });
              return {
                ...otherItem,
                evaluateScoreLineDetailS: newLineItem,
              };
            } else {
              const expertElementData = this.expertElementSave(item);
              return expertElementData;
            }
          });
        } else {
          newParams = getEditTableData(scoringRightDeatilLine, ['evaluateLineId']);
        }
        dispatch({
          type: `${modelName}/fetchSaveReviewScoring`,
          payload: {
            sourceHeaderId: scoringRightDeatilHeader.sourceHeaderId,
            evaluateScoreDTO: {
              ...scoringRightDeatilHeader,
              ...values,
              expertUserId,
              currentSequenceNum: expertSequenceNum,
              sectionFlag,
              quotationHeaderId,
              sectionId,
            },
            evaluateScoreLineDTOList: newParams,
            sourceFrom,
            customizeUnitCode:
              routerParams.reviewScoredStatus === 'SCORED'
                ? 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_DETAIL,SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_DETAIL'
                : 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_EDIT,SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_EDIT',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchScoreSupplierList();
            if (subjectMatterRule) {
              // 分标段
              const bidLineItemIds =
                scoreElementList.evaluateSectionDTOS &&
                scoreElementList.evaluateSectionDTOS.map((item) => item.bidLineItemId);
              this.fetchScoreElementList(bidLineItemIds);
            } else {
              // 不分标段
              this.fetchScoreElementList();
            }
            this.setState({
              scoreIndicFlag: false,
            });
          }
        });
      }
    });
  }

  /**
   * 返回
   */
  @Bind()
  onBackScoring() {
    this.setState({
      scoreIndicFlag: false,
    });
  }

  /**
   * 打开比价助手模态框
   */
  @Bind()
  priceComparisonAssistant(priceComparisonProps) {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: <PriceComparison {...priceComparisonProps} />,
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  // /**
  //  * hidePriceComparison - 关闭比价助手弹窗
  //  */
  // @Bind()
  // hidePriceComparison() {
  //   this.setState({
  //     priceComparisonModalVisible: false,
  //   });
  // }

  /**
   * 切换维度
   * 分标段，标段1，2,3, 点击切换到供应商维度，设为true { 1: true }
   * 不分标段, 点击切换到供应商维度，设为 { flag: true}
   * @param {string} operationType - 操作类型
   * @memberof BidEvaluation
   */
  @Bind()
  switchDimension(operationType) {
    const { activeKey, supplierDimension } = this.state;
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      dispatch,
      [modelName]: { scoreElementList = {} },
    } = this.props;
    // 处于当前tab下直接返回
    if (
      (!supplierDimension.flag && operationType === 'supplier') ||
      (supplierDimension.flag && operationType === 'element')
    ) {
      return;
    }
    const { subjectMatterRule, sourceFrom } = match.params;
    const tableKey = 'flag';
    // 分标段
    if (subjectMatterRule === 'PACK' && sourceFrom === 'BID') {
      const { scoresFlag } = this.supplierTable[activeKey].state;
      // 判断是否在供应商维度，如果是在供应商维度，直接往评分要素维度切换并调查询接口
      if (supplierDimension[activeKey]) {
        if (scoresFlag) {
          // 如果是在评分要素维度先判断评分要素维度值是否有更改，如有更改询问是否保存
          confirm({
            title: intl
              .get(`${promptCode}.model.expertScoring.saveElementInfoYes`)
              .d('是否需要保存评分要素维度填写的信息？'),
            okText: intl.get('hzero.common.button.yes').d('是'),
            cancelText: intl.get('hzero.common.button.no').d('否'),
            onOk: () => {
              this.saveExpert();
            },
            onCancel: () => {
              this.supplierTable[activeKey].props.form.resetFields();
              this.supplierTable[activeKey].setState({ scoresFlag: false });
              this.fetchScoreSupplierList();
              this.setState({ supplierDimension: { ...supplierDimension, [activeKey]: false } });
            },
          });
        } else {
          this.fetchScoreSupplierList();
          this.setState({ supplierDimension: { ...supplierDimension, [activeKey]: false } });
        }
      } else {
        const bidLineItemIds =
          scoreElementList.evaluateSectionDTOS &&
          scoreElementList.evaluateSectionDTOS.map((item) => item.bidLineItemId);
        this.fetchScoreElementList(bidLineItemIds);
        this.setState({ supplierDimension: { ...supplierDimension, [activeKey]: true } });
      }
    } else if (subjectMatterRule === 'NONE') {
      const { scoresFlag } = this.supplierTable[tableKey].state;
      if (!supplierDimension.flag) {
        this.setState({ supplierDimension: { flag: !supplierDimension.flag } });
        this.fetchScoreElementList();
      } else if (scoresFlag) {
        confirm({
          title: intl
            .get(`${promptCode}.model.expertScoring.saveElementInfoYes`)
            .d('是否需要保存评分要素维度填写的信息？'),
          okText: intl.get('hzero.common.button.yes').d('是'),
          cancelText: intl.get('hzero.common.button.no').d('否'),
          onOk: () => {
            this.saveExpert();
          },
          onCancel: () => {
            this.supplierTable[tableKey].props.form.resetFields();
            this.fetchScoreSupplierList();
            this.setState({ supplierDimension: { flag: !supplierDimension.flag } });
            this.supplierTable[tableKey].setState({ scoresFlag: false });
          },
        });
      } else {
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            scoreElementList: {}, // 专家评分--分标段/不分标段-评分要素维度信息
          },
        });
        this.fetchScoreSupplierList();
        this.setState({ supplierDimension: { flag: !supplierDimension.flag } });
      }
    }
  }

  /**
   * 初步评审
   */
  @Bind()
  handleReviewing(e, item) {
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const { expertUserId, expertSequenceNum, sourceFrom } = match.params;
    const { routerParams = {} } = this.state;
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    if (item.reviewScoredStatus === 'SCORED') {
      this.setState({
        scoreFlag: true,
      });
    }
    this.setState({
      scoreIndicFlag: true,
      quotationHeaderId: item.quotationHeaderId,
      sectionId: item.sectionId,
    });
    // 查询头
    dispatch({
      type: `${modelName}/fetchScoringHeader`,
      payload: {
        quotationHeaderId: item.quotationHeaderId,
        supplierId: item.supplierCompanyId,
        evaluateScoreIds: String(item.evaluateScoreIds),
        sectionId: item.sectionId,
        sourceFrom,
        customizeUnitCode:
          routerParams.reviewScoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_DETAIL'
            : 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_EDIT',
      },
    });
    // 查询行
    dispatch({
      type: `${modelName}/fetchScoringIndic`,
      payload: {
        sourceHeaderId: item.sourceHeaderId,
        expertUserId,
        expertSequenceNum,
        sourceFrom,
        evaluateScoreType: 'INITIAL_REVIEW',
        evaluateScoreIds: String(item.evaluateScoreIds),
        customizeUnitCode:
          routerParams.reviewScoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_DETAIL'
            : 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_EDIT',
      },
    });
  }

  /**
   * 跳转招标书明细或询价单明细
   * @param params
   */
  @Bind()
  jumpBid(params) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      history,
      [modelName]: { header },
    } = this.props;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    const { routerParams = {} } = this.state;
    const { secondarySourceCategory } = header || {};

    const {
      cachTabKey,
      reviewScoredStatus,
      evaluateLeaderFlag,
      backRecommend,
      evaluateExpertId,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = routerParams || {};

    const searchData = querystring.stringify({
      sourceHeaderId: routerParams.sourceHeaderId,
      cachTabKey,
      reviewScoredStatus,
      evaluateLeaderFlag,
      backRecommend,
      evaluateExpertId,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });

    if (sourceFrom === 'BID') {
      // 若是招投标跳进招投标明细页面，记录返回时的路由
      const search = querystring.stringify({
        backRecommend: 'expertDetailToBidHallDetail',
      });
      history.push({
        pathname: `${this.activeTabKey}/bid-detail/${params}`,
        search,
      });
      const source = {
        label: 'expertDetailToBidHallDetail',
        url: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/initial-review?${searchData}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(
        `expertDetailToBidHallDetail+${this.activeTabKey}`,
        JSON.stringify(source)
      );
    } else {
      // 若是询报价跳进询报价明细页面，记录返回时的路由
      const search = querystring.stringify({
        ...routerParams,
        backRecommend: 'expertDetailToInquiryHallDetail',
      });
      history.push({
        pathname:
          secondarySourceCategory === 'NEW_BID'
            ? `${this.activeTabKey}/new-bid-detail/${params}`
            : `${this.activeTabKey}/rfx-detail/${params}`,
        search,
      });
      const source = {
        label: 'expertDetailToInquiryHallDetail',
        url: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/initial-review?${searchData}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(
        `expertDetailToInquiryHallDetail+${this.activeTabKey}`,
        JSON.stringify(source)
      );
    }
  }

  /**
   * 跳转到澄清管理页面
   */
  @Bind()
  jumpToClarify = (item) => {
    const { modelName = 'expertScoring' } = this.props;
    const {
      history,
      location: { pathname, search: datas },
      match,
      [modelName]: { settings = {} },
    } = this.props;
    const {
      routerParams: { sourceStatus },
      templateConfig = {},
    } = this.state;
    const { sourceHeaderId, sourceFrom = 'SCORING' } = match.params;
    const { quotationHeaderId, companyNum = '', companyName = '' } = item;

    const routerPrefix = pathname.split('/')[2];
    const routerName = sourceFrom === 'BID' ? 'bid' : 'rfx';

    // 需要根据配置中心, 评审澄清规则来判断跳转, case 'NEED_SUMMAY': 进入评审澄清页面; case 'NO_SUMMAY': 进入评审澄清管理页面
    const { settingValue } = settings['011117'] || {};
    if (
      [2, '2'].includes(templateConfig?.systemVersion)
        ? templateConfig?.clarifyRuleFlag
        : settingValue !== 'NO_SUMMAY'
    ) {
      // NEED_SUMMAY/空, 都会进入评审澄清页面
      const search = querystring.stringify({
        quotationHeaderId,
        sourceFrom,
        sourceHeaderId,
        title: `${companyNum}-${companyName}`,
        backPath: `${pathname}${datas}`,
      });
      history.push({
        pathname: `${this.activeTabKey}/review-clarification`,
        search,
      });
    } else {
      const search = querystring.stringify({
        quotationHeaderId,
        sourceFrom,
        sourceStatus,
        sourceHeaderId,
        fromFlag: 1,
        title: `${companyNum}-${companyName}`,
        backPath: `${pathname}${datas}`,
      });
      history.push({
        pathname: `/ssrc/${routerPrefix}/${routerName}-review-clarification`,
        search,
      });
    }
  };

  /**
   * 提交
   */
  @Bind()
  @Throttle(1000)
  async submitExpert() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      match,
      history,
      [modelName]: { expAttachmentUuid = null },
      remote: remoteFunc,
    } = this.props;
    const { routerParams, reviewAttachmentUuid, evaluateExpertId } = this.state;
    const search = routerParams.cachTabKey;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;

    if (remoteFunc?.event) {
      const cuxFlag = await remoteFunc.event.fireEvent('handleCuxBeforeSubmitExpert', {
        that: this,
      });
      if (cuxFlag === false) {
        return;
      }
    }

    // 校验必输信息
    this.validationForm()
      .then((values) => {
        if (values && isArray(values)) {
          confirm({
            title: intl
              .get(`${promptCode}.model.expertScoring.confirmSubmitScoring`)
              .d('是否确认提交评分？'),
            onOk: () => {
              dispatch({
                type: `${modelName}/fetchSubmitReviewScoring`,
                payload: {
                  sourceHeaderId,
                  expertUserId,
                  subjectMatterRule,
                  expertSequenceNum,
                  reviewAttachmentUuid: expAttachmentUuid || reviewAttachmentUuid,
                  sourceFrom,
                  elementFlag: 0,
                  evaluateExpertId,
                  customizeUnitCode: 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  history.push({
                    pathname: `${this.activeTabKey}/list`,
                    search,
                  });
                }
              });
            },
          });
        }
      })
      .catch(() => {
        // 校验未通过
      });
  }

  /**
   * 评分要素维度专家评分提交
   */
  @Bind()
  @Throttle(1000)
  async submitElementExpert() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      history,
      [modelName]: { scoreElementList = {}, expAttachmentUuid = null },
      match: { params },
      remote: remoteFunc,
    } = this.props;
    const { routerParams, reviewAttachmentUuid, evaluateExpertId } = this.state;

    if (remoteFunc?.event) {
      const cuxFlag = await remoteFunc.event.fireEvent('handleCuxBeforeSubmitElementExpert', {
        that: this,
      });
      if (cuxFlag === false) {
        return;
      }
    }

    // 校验必输信息
    this.validationForm()
      .then((values) => {
        if (values && isArray(values)) {
          const search = routerParams.cachTabKey;
          let supplierArray = [];
          if (params.subjectMatterRule === 'PACK' && params.sourceFrom === 'BID') {
            // 分标段
            const elementArray = [];
            scoreElementList.evaluateSectionDTOS.forEach((item) => {
              const { bidLineItemId, evaluateScoreLineDTOS = [] } = item;
              let elementObject = {};
              evaluateScoreLineDTOS.forEach((elementItem) => {
                elementObject = { ...elementItem, bidLineItemId };
                elementArray.push(elementObject);
              });
            });
            supplierArray = elementArray;
          } else {
            supplierArray = scoreElementList.evaluateScoreLineDTOS;
          }
          const evaluateScoreLineDTOS =
            supplierArray &&
            supplierArray.map((item) => {
              if (item.detailEnabledFlag) {
                const evaluateScoreLineDetailS = item.evaluateScoreLineDetailS.map(
                  (elementItem) => {
                    const evaluateScoreDTOS = this.handleSaveExpert(elementItem);
                    return {
                      ...elementItem,
                      evaluateScoreDTOS,
                    };
                  }
                );
                return {
                  ...item,
                  evaluateScoreLineDetailS,
                };
              } else {
                const evaluateScoreDTOS = this.handleSaveExpert(item);
                return {
                  ...item,
                  evaluateScoreDTOS,
                };
              }
            });
          confirm({
            title: intl
              .get(`${promptCode}.model.expertScoring.confirmSubmitScoring`)
              .d('是否确认提交评分？'),
            onOk: () => {
              dispatch({
                type: `${modelName}/fetchSubmitReviewScoring`,
                payload: {
                  evaluateScoreLineDTOS,
                  sourceHeaderId: params.sourceHeaderId,
                  expertUserId: params.expertUserId,
                  subjectMatterRule: params.subjectMatterRule,
                  expertSequenceNum: params.expertSequenceNum,
                  reviewAttachmentUuid: expAttachmentUuid || reviewAttachmentUuid,
                  sourceFrom: params.sourceFrom,
                  sectionFlag: scoreElementList.sectionFlag,
                  elementFlag: 1,
                  evaluateExpertId,
                  customizeUnitCode: 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  history.push({
                    pathname: `${this.activeTabKey}/list`,
                    search,
                  });
                }
              });
            },
          });
        }
      })
      .catch(() => {
        // 校验未通过
      });
  }

  // 校验form
  validationForm() {
    const promiseArr = Object.values(this.supplierTable).map((item) => {
      return new Promise((resove, reject) => {
        item.props.form.validateFieldsAndScroll((err) => {
          if (!err) {
            resove(1);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(0);
          }
        });
      });
    });
    return Promise.all(promiseArr);
  }

  /**
   * 评分要素维度专家打分保存
   * @param {?string} flag - 保存类型 `changeSection`/``
   */
  @Bind()
  @Throttle(1000)
  saveExpert(flag) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { scoreElementList = {}, expAttachmentUuid = null },
      match: { params },
    } = this.props;
    const { activeKey, evaluateExpertId, reviewAttachmentUuid } = this.state;
    // 校验必输信息
    return this.validationForm()
      .then((values) => {
        if (values && isArray(values)) {
          let supplierArray = [];
          let supplierTableKey = '';
          if (params.subjectMatterRule === 'PACK' && params.sourceFrom === 'BID') {
            // 分标段
            const elementArray = [];
            scoreElementList.evaluateSectionDTOS.forEach((item) => {
              const { bidLineItemId, evaluateScoreLineDTOS = [] } = item;
              let elementObject = {};
              evaluateScoreLineDTOS.forEach((elementItem) => {
                elementObject = { ...elementItem, bidLineItemId };
                elementArray.push(elementObject);
              });
            });
            supplierArray = elementArray;
            supplierTableKey = activeKey;
          } else {
            supplierArray = scoreElementList.evaluateScoreLineDTOS;
            supplierTableKey = 'flag';
          }
          const evaluateScoreLineDTOS =
            supplierArray &&
            supplierArray.map((item) => {
              if (item.detailEnabledFlag) {
                const evaluateScoreLineDetailS = item.evaluateScoreLineDetailS.map(
                  (elementItem) => {
                    const evaluateScoreDTOS = this.handleSaveExpert(elementItem);
                    return {
                      ...elementItem,
                      evaluateScoreDTOS,
                    };
                  }
                );
                return {
                  ...item,
                  evaluateScoreLineDetailS,
                };
              } else {
                const evaluateScoreDTOS = this.handleSaveExpert(item);
                return {
                  ...item,
                  evaluateScoreDTOS,
                };
              }
            });
          return dispatch({
            type: `${modelName}/fetchSaveReviewElementScoring`,
            payload: {
              evaluateScoreLineDTOS,
              sourceHeaderId: params.sourceHeaderId,
              expertUserId: params.expertUserId,
              sourceFrom: params.sourceFrom,
              sectionFlag: scoreElementList.sectionFlag,
              reviewAttachmentUuid: expAttachmentUuid || reviewAttachmentUuid,
              evaluateExpertId,
              customizeUnitCode: 'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              if (flag !== 'changeSection') {
                this.supplierTable[supplierTableKey].setState({ scoresFlag: false });
                const bidLineItemIds =
                  scoreElementList.evaluateSectionDTOS &&
                  scoreElementList.evaluateSectionDTOS.map((item) => item.bidLineItemId);
                this.fetchScoreElementList(bidLineItemIds);
              }
              return res;
            }
          });
        }
      })
      .catch(() => {
        // 校验未通过
      });
  }

  /**
   * 评分要素维度专家打分数据处理
   */
  @Bind()
  handleSaveExpert(item = {}) {
    const evaluateScoreDTOS = item.evaluateScoreDTOS.map((elementItem) => {
      return {
        ...elementItem,
        indicScore:
          item.indicateType === 'SCORE'
            ? this.supplierTable[
                item.bidLineItemId || item.bidLineItemId === 0 ? item.bidLineItemId : 'flag'
              ].props.form.getFieldValue(
                item.bidLineItemId || item.bidLineItemId === 0
                  ? `${item.bidLineItemId}#${item.evaluateIndicId}#${item.team}#${elementItem.quotationHeaderId}`
                  : item.detailEnabledFlag === 0
                  ? `flag#${item.evaluateIndicId}#${item.team}#${elementItem.quotationHeaderId}`
                  : `flag#${item.evaluateIndicId}#${item.team}#${elementItem.quotationHeaderId}#${item.indicateId}`
              )
            : null,
        passStatus:
          item.indicateType === 'PASS'
            ? this.supplierTable[
                item.bidLineItemId || item.bidLineItemId === 0 ? item.bidLineItemId : 'flag'
              ].props.form.getFieldValue(
                item.bidLineItemId || item.bidLineItemId === 0
                  ? `${item.bidLineItemId}#${item.evaluateIndicId}#${item.team}#${elementItem.quotationHeaderId}`
                  : item.detailEnabledFlag === 0
                  ? `flag#${item.evaluateIndicId}#${item.team}#${elementItem.quotationHeaderId}`
                  : `flag#${item.evaluateIndicId}#${item.team}#${elementItem.quotationHeaderId}#${item.indicateId}`
              )
            : null,
      };
    });
    return evaluateScoreDTOS;
  }

  @Bind()
  handleAfterOpenModal(reviewAttachmentUuid) {
    this.setState({
      reviewAttachmentUuid,
    });
  }

  /**
   * 获取分页物品维度
   *
   * @memberof search
   */
  @Bind()
  changePage(page = {}, quotationHeaderId = null, item = {}) {
    const { dispatch, match, modelName = 'expertScoring' } = this.props;
    const { sourceFrom } = match.params;
    // 查询供应商投标物料行
    dispatch({
      type: `${modelName}/fetchScoringQuotation`,
      payload: {
        page,
        quotationHeaderId,
        sectionId: item.sectionId,
        supplierId: item.supplierCompanyId,
        team: item.team,
        sourceFrom,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_REVIEW.QUOTATION_LINE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          loadingObj: { [quotationHeaderId]: { queryScoringQuotationLoading: false } },
        });
      }
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, companyName, quotationLineId, quotationLineStatus } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName: companyName,
        quotationLineStatus,
      },
    });
    const { dispatch, organizationId, modelName = 'expertScoring' } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelTable`,
      payload: { quotationLineId, organizationId },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(item = {}) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    if (isEmpty(item)) {
      return;
    }

    const {
      businessAttachmentUuid = null,
      techAttachmentUuid = null,
      bargainBusinessAttachmentUuid = null, // 议价中商务附件
      bargainTechAttachmentUuid = null, // 议价中技术附件
      roundBusinessAttachmentUuid = null, // 多轮报价商务附件
      roundTechAttachmentUuid = null, // 多轮报价技术附件
    } = item;

    // 报价单头附件列表
    const attachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      // roundFlag,
      quotationHeader: item, // TODO bargainFlag
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      // tenantId: organizationId,
      // initUpload: this.initUpload,
      businessUuid: businessAttachmentUuid,
      techUuid: techAttachmentUuid,
      bargainBusUuid: bargainBusinessAttachmentUuid,
      bargainTechUuid: bargainTechAttachmentUuid,
      roundBusUuid: roundBusinessAttachmentUuid,
      roundTechUuid: roundTechAttachmentUuid,
      showBusinessAttachment: header && !isEmpty(header) && header.reviewHidePrice !== 'HIDE',
      // onRef: this.handleBindOnRef,
    };

    this.setState({
      attachmentsProps,
      attachmentVisible: true,
    });
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false, attachmentsProps: {} });
  }

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 物料头部明细
   */
  renderHeaderInfo(item) {
    const { remote: remoteFunc, modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { expand, newQuotationFlag = false } = this.state;

    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              {this.renderScoreSvg(item)}
              <span className={styles.itemListNumLeft}>
                <Tooltip
                  title={
                    item.companyNum ? `${item.companyNum}--${item.companyName}` : item.companyName
                  }
                  placement="topLeft"
                >
                  {item.companyNum ? `${item.companyNum}-` : null}
                  {item.companyName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  className={styles.arrowIcon}
                  type={!expand[`${item.sectionId}#${item.quotationHeaderId}`] ? 'down' : 'up'}
                  onClick={(e) => this.expandItemLine(e, item.quotationHeaderId, item)}
                />
              </span>
            </span>
            {header && !isEmpty(header) && header.reviewHidePrice !== 'HIDE' && (
              <span
                style={{
                  marginLeft: 50,
                  marginTop: '6px',
                  minWidth: '80px',
                  maxWidth: '250px',
                  display: item.team === 'TECHNOLOGY' ? 'none' : 'inline-block',
                }}
              >
                {remoteFunc ? (
                  remoteFunc.render(
                    'SSRC_INITIAL_REVIEW_RENDER_PRICE',
                    <>
                      <img src={require('@/assets/money.svg')} alt="" />{' '}
                      {numberSeparatorRender(item.sectionAmount)}
                    </>
                  )
                ) : (
                  <>
                    <img src={require('@/assets/money.svg')} alt="" />{' '}
                    {numberSeparatorRender(item.sectionAmount)}
                  </>
                )}
              </span>
            )}
            <span
              onClick={(e) => this.rfxLineTag(e)}
              style={{
                marginLeft: 24,
                marginTop: '6px',
                maxWidth: '150px',
                minWidth: '50px',
                display: 'inline-block',
              }}
            >
              {!newQuotationFlag ? (
                <a onClick={() => this.showUploadModal(item)}>
                  <span>
                    {intl.get(`hzero.common.upload.modal.title`).d('附件')}
                    <RenderFileTotalCount record={item} uiType="h0" />
                  </span>
                  <span style={{ marginLeft: '8px' }}>
                    <SVGIcon path={file} />
                  </span>
                </a>
              ) : (
                <FileGroup
                  record={item}
                  uiType="h0"
                  fileType="HEADER"
                  hideBusinessAttachment={header?.reviewHidePrice === 'HIDE'}
                  queryParams={
                    remoteFunc
                      ? remoteFunc.process('SSRC_INITIAL_REVIEW_PROCESS_FILE_QUERY_PARAMS', {})
                      : {}
                  }
                />
              )}
            </span>
            <span style={{ marginLeft: 24 }}>
              {item.suggestInvalidFlag ? (
                <img src={require('@/assets/suggestInvalid.svg')} alt="" />
              ) : null}
            </span>
            <span style={{ marginRight: 10 }}>{this.renderTagPassStatus(item)}</span>
            <span style={{ float: 'right' }}>{this.renderScoreButton(item)}</span>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * renderScoreButton
   * 评分操作
   */
  renderScoreButton(item) {
    const {
      routerParams: { checkScore, reviewScoredStatus },
    } = this.state;
    const {
      modelName = 'expertScoring',
      [modelName]: { header = {} },
      remote: remoteFunc,
    } = this.props;
    const renderProps = {
      /* 需要传递的自定义渲染属性 */
      header,
    };

    // 评审澄清按钮
    const clarifyButton = (
      <Badge
        count={item.reviewUnreadCount || 0}
        offset={[0, -22]}
        className={styles['expand-more-badge']}
      >
        <a
          style={{
            marginRight: 25,
          }}
          disabled={checkScore === 'checkScore'}
          onClick={() => this.jumpToClarify(item)}
        >
          <Icon type="idcard" style={{ marginRight: '5px' }} />
          <Tooltip
            placement="topLeft"
            title={intl
              .get(`${promptCode}.view.message.tooltip.clarificationHelpMsg`)
              .d('适用于供应商投标文件中存在含义不明，前后表述不一致，需供应商解答问题的情况')}
          >
            {intl.get(`${promptCode}.view.message.title.reviewClarify`).d('评审澄清')}
          </Tooltip>
        </a>
      </Badge>
    );
    return (
      <React.Fragment>
        {remoteFunc
          ? remoteFunc.render(
              'SSRC_INITIAL_REVIEW_RENDER_REVIEW_CLARIFY_BUTTON',
              clarifyButton,
              renderProps
            )
          : clarifyButton}
        <a style={{ border: 0 }} onClick={(e) => this.handleReviewing(e, item)}>
          <Icon type="contacts" style={{ marginRight: '5px' }} />
          {reviewScoredStatus === 'SCORED'
            ? intl.get(`${promptCode}.view.message.link.complianceCheckView`).d('符合性检查查看')
            : intl.get(`${promptCode}.view.message.link.complianceCheck`).d('符合性检查')}
        </a>
      </React.Fragment>
    );
  }

  /**
   * renderScoreSvg
   * 评分操作
   */
  renderScoreSvg(item) {
    let img = <img src={require('@/assets/supplier-gray.svg')} alt="" />;
    switch (item.reviewScoredStatus) {
      case '':
        img = <img src={require('@/assets/supplier-gray.svg')} alt="" />;
        break;
      case 'NEW':
        img = <img src={require('@/assets/supplier-gray.svg')} alt="" />;
        break;
      case 'SCORED':
        img = <img src={require('@/assets/supplier.svg')} alt="" />;
        break;
      default:
        break;
    }
    return <span>{img}</span>;
  }

  /**
   * 渲染通过状态Tag
   * @returns {*}
   */
  renderTagPassStatus(item) {
    let name = '';
    let backColor = '';
    let color = '';
    let width = '';
    if (!item.reviewResult) return;
    switch (item.reviewResult) {
      case 'APPROVED':
        name = intl.get(`${promptCode}.view.message.tag.complianceCheckPassed`).d('符合性检查通过');
        backColor = 'rgb(0, 128, 0, 0.2)';
        color = '#008000';
        width = '97px';
        break;
      case 'NO_APPROVED':
        name = intl
          .get(`${promptCode}.view.message.tag.complianceCheckRejected`)
          .d('符合性检查不通过');
        backColor = 'rgba(241, 49, 49, 0.2)';
        color = '#F13131';
        width = '110px';
        break;
      default:
        break;
    }
    return (
      <span>
        <Tag style={{ background: backColor, color, border: 0, width, display: 'inline-block' }}>
          {name}
        </Tag>
      </span>
    );
  }

  /**
   * 渲染供应商维度
   *
   */
  renderSupplierNone(supplier) {
    const { expand, loadingObj, doubleUnitFlag, newQuotationFlag = false } = this.state;
    const { modelName = 'expertScoring' } = this.props;
    const {
      customizeTable,
      organizationId,
      [modelName]: { header = {}, scoringQuotationList = [] },
      match,
    } = this.props;
    const itemLineProps = {
      match,
      header,
      customizeTable,
      scoringQuotationList,
      loadingObj,
      doubleUnitFlag,
      onSearch: this.changePage,
      viewLadderLevel: this.viewLadderLevelModal,
      newQuotationFlag,
    };
    return (
      <div>
        {map(supplier, (item) => {
          return (
            <div>
              <div
                onClick={(e) => this.expandItemLine(e, item.quotationHeaderId, item)}
                className={styles.arrowStyle}
              >
                {this.renderHeaderInfo(item)}
              </div>
              <div>
                {expand[`${item.sectionId}#${item.quotationHeaderId}`] && (
                  <ItemLineTable
                    organizationId={organizationId}
                    {...itemLineProps}
                    item={item}
                    team={item.team}
                    quotationHeaderId={item.quotationHeaderId}
                    sectionId={item.sectionId}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染不区分标段tabs
   */
  renderNormalTabs() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { evaluateScoreList = [], scoreElementList = {}, code = {} },
      fetchScoreElementLoading,
      customizeTable,
    } = this.props;
    const { routerParams = {} } = this.state;
    const scoreElementProps = {
      code,
      customizeTable,
      loading: fetchScoreElementLoading,
      scoreElementInfo: scoreElementList,
      reviewScoredStatus: routerParams.reviewScoredStatus,
      onRef: (key, node) => {
        this.supplierTable[key] = node;
      },
    };
    const { supplierDimension = {}, routerList } = this.state;
    return (
      <div>
        <div style={{ display: supplierDimension.flag ? 'block' : 'none' }}>
          {routerList.includes('RFX') ? (
            <ScoreElementTable
              {...scoreElementProps}
              scoreElementList={scoreElementList || []}
              bidLineItemId="flag"
            />
          ) : (
            ''
            // <BidScoreElementTable
            //   {...scoreElementProps}
            //   scoreElementList={scoreElementList.evaluateScoreLineDTOS || []}
            //   bidLineItemId="flag"
            // />
          )}
        </div>
        <div style={{ display: supplierDimension.flag ? 'none' : 'block' }}>
          {this.renderSupplierNone(evaluateScoreList)}
        </div>
      </div>
    );
  }

  /**
   * 浮动文字tabs
   */
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  // 渲染头部按钮
  renderHeaderButton() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      saveExpertLoading,
      submitExpertLoading,
      submitElementExpertLoading,
      organizationId,
      [modelName]: { expAttachmentUuid = null, header },
      remote: remoteFunc,
    } = this.props;
    const { activeKey, supplierDimension, reviewAttachmentUuid, routerParams = {} } = this.state;

    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag, reviewHidePrice } = header || {};
    const priceComparisonProps = {
      sourceCategory,
      rfxId: match.params.sourceHeaderId,
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };

    /**
     * 提交按钮
     */
    const submitBtn = (routerParams.cachTabKey || '').includes('scoreing') ? (
      routerParams.reviewScoredStatus !== 'SCORED' ? (
        supplierDimension[activeKey] || supplierDimension.flag ? (
          <Button
            icon="check"
            onClick={this.submitElementExpert}
            type="primary"
            loading={submitElementExpertLoading || saveExpertLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        ) : (
          <Button
            icon="check"
            onClick={this.submitExpert}
            type="primary"
            loading={submitExpertLoading || saveExpertLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        )
      ) : (
        ''
      )
    ) : (
      ''
    );

    /**
     * 保存按钮
     */
    const saveBtn =
      routerParams.cachTabKey === 'scoreing' ? (
        routerParams.reviewScoredStatus !== 'SCORED' ? (
          match.params.subjectMatterRule === 'PACK' && match.params.sourceFrom === 'BID' ? (
            <Button
              icon="save"
              disabled={!supplierDimension[activeKey]}
              onClick={this.saveExpert}
              loading={submitExpertLoading || saveExpertLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : (
            <Button
              icon="save"
              disabled={!supplierDimension.flag}
              onClick={this.saveExpert}
              loading={submitExpertLoading || saveExpertLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )
        ) : (
          ''
        )
      ) : (
        ''
      );

    /**
     * 上传按钮
     */
    const uploadBtn =
      routerParams.cachTabKey === 'scoreing' ? (
        <div className={styles['m-r-m']}>
          <Upload
            btnText={
              routerParams.reviewScoredStatus !== 'SCORED'
                ? intl.get(`hzero.common.upload.text`).d('上传附件')
                : intl.get(`hzero.common.upload.view`).d('查看附件')
            }
            // bucketName="ssrc-rfx-quotationheader" // 预定表
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={expAttachmentUuid || reviewAttachmentUuid}
            tenantId={organizationId}
            afterOpenUploadModal={this.handleAfterOpenModal}
            viewOnly={routerParams.reviewScoredStatus === 'SCORED'}
            filePreview
            fileSize={FIlESIZE}
            {...ChunkUploadProps}
          />
        </div>
      ) : (
        <div className={styles['m-r-m']}>
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={expAttachmentUuid}
            tenantId={organizationId}
            viewOnly
            filePreview
          />
        </div>
      );

    /**
     * 比价助手 - 寻源&&评分&&非技术组
     */
    const compareBtn = match.params.sourceFrom === 'RFX' &&
      routerParams.reviewScoredStatus === 'NEW' &&
      sessionStorage.getItem('team') !== 'TECHNOLOGY' &&
      !!reviewHidePrice &&
      reviewHidePrice !== 'HIDE' && (
        <Button
          type="default"
          onClick={() => this.priceComparisonAssistant(priceComparisonProps)}
          style={{ marginRight: '8px' }}
        >
          <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
          {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
        </Button>
      );
    const ButtonsList = [
      submitBtn,
      saveBtn,
      uploadBtn,
      remoteFunc
        ? remoteFunc.render('SSRC_INITIAL_REVIEW_RENDER_COMPARE_BUTTON', compareBtn)
        : compareBtn,
    ];
    const otherBtnProps = { activeKey, supplierDimension, modelName, _this: this };
    return (
      <React.Fragment>
        {remoteFunc
          ? remoteFunc.process('SSRC_INITIAL_REVIEW_RENDER_ALL_BUTTON', ButtonsList, otherBtnProps)
          : ButtonsList}
      </React.Fragment>
    );
  }

  /**
   * renderReviewDetailModal
   * 渲染专家评分侧滑弹框
   */
  renderReviewDetailModal(expertDetailProps) {
    let mean = '';
    const { routerList, scoreIndicFlag } = this.state;
    if (scoreIndicFlag) {
      if (routerList.includes('RFX')) {
        mean = <ReviewDetailModal {...expertDetailProps} />;
      } else {
        mean = '';
        // mean = <BidReviewDetailModal {...expertDetailProps} />;
      }
    }
    return mean;
  }

  /**
   * 渲染content
   */
  renderContent() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      saveExpertLoading = false,
      queryScoringSupplierLoading = false,
      [modelName]: { header = {} },
    } = this.props;
    const { routerParams = {}, supplierDimension = {} } = this.state;

    const sectionFlag = 0; // 2021-01-08迭代暂时只做询报价模块

    //  RFX:rfxNum rfxTitle   RFI/RFP: rfNum rfTitle BID：bidNum bidTitle
    const sourceFromType = {
      RFX: 'rfx',
      BID: 'bid',
      RFI: 'rf',
      RFP: 'rf',
    };

    const { sourceFrom } = routerParams;

    // 头标题num
    const headerNum = header[`${sourceFromType[sourceFrom]}Num`]
      ? `${header[`${sourceFromType[sourceFrom]}Num`]}--`
      : '';

    return (
      <Content>
        <Spin spinning={queryScoringSupplierLoading || saveExpertLoading}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '8px' }}>
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
              {headerNum}
              {
                <Tooltip
                  title={`${headerNum}${header[`${sourceFromType[sourceFrom]}Title`] ?? ''}`}
                >
                  {header[`${sourceFromType[sourceFrom]}Title`] ?? ''}
                </Tooltip>
              }
            </span>
            {header &&
              !isEmpty(header) &&
              header.reviewHidePrice !== 'HIDE' && ( // reviewHidePrice 符合性检查是否隐藏价格信息
                <Tooltip
                  title={
                    match.params.sourceFrom === 'BID'
                      ? intl.get(`${promptCode}.view.title.clickViewBidbook`).d('点击查看招标书')
                      : intl
                          .get(`${promptCode}.view.title.clickViewInquiryDetail`)
                          .d('点击查看单据')
                  }
                  placement="topLeft"
                >
                  <span
                    className={styles.orderDetail}
                    onClick={() => this.jumpBid(routerParams.sourceHeaderId)}
                  >
                    <SVGIcon
                      path={bidView}
                      style={{ width: '13px', height: '13px', marginRight: '5px' }}
                    />
                    {intl.get(`${promptCode}.view.title.orderDetail`).d('单据详情')}
                  </span>
                </Tooltip>
              )}
            <span style={{ float: 'right', fontWeight: 'normal', fontSize: '12px' }}>
              <Tooltip
                placement="topLeft"
                title={intl
                  .get(`${promptCode}.view.message.tooltip.operationProblemMsg`)
                  .d('如需查看供应商投标信息或评审澄清, 请切换至供应商维度进行操作!')}
              >
                <C7nIcon type="operation_problem" style={{ marginRight: '0.08rem' }} />
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip
                placement="topLeft"
                title={intl
                  .get(`${promptCode}.view.message.button.supplierDimension`)
                  .d('供应商维度')}
              >
                <C7nButton
                  onClick={() => this.switchDimension('supplier')}
                  icon="reorder"
                  className={!supplierDimension.flag && styles.primaryColor}
                />
              </Tooltip>
              <Tooltip
                placement="topLeft"
                title={intl
                  .get(`${promptCode}.view.message.button.scoreIndicDimension`)
                  .d('评分要素维度')}
              >
                <C7nButton
                  onClick={() => this.switchDimension('element')}
                  icon="view_agenda-o"
                  className={supplierDimension.flag && styles.primaryColor}
                />
              </Tooltip>
            </span>
          </div>
          <div style={{ marginTop: '24px' }}>
            {sectionFlag ? this.renderTabs() : this.renderNormalTabs()}
          </div>
        </Spin>
      </Content>
    );
  }

  render() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: {
        scoringRightDeatilHeader = {},
        scoringRightDeatilLine = [],
        code = {},
        quotaLadderLevelData = {},
        // header = {},
      },
      organizationId,
      dispatch,
      match,
      form,
      queryScoringHeaderLoading,
      queryScoringIndicLoading,
      saveScoreingLoading,
      fetchLadderLevelTableLoading,
      customizeTable,
      customizeForm,
    } = this.props;
    const {
      scoreFlag,
      routerParams = {},
      attachmentsProps,
      attachmentVisible,
      // priceComparisonModalVisible = false,
      viewLadderLevelVisible = false,
      LadderLevelHeaderData = {},
      doubleUnitFlag,
    } = this.state;

    const { sourceHeaderId } = match.params;
    const {
      cachTabKey,
      sourceProjectId,
      sourceStatus,
      reviewScoredStatus,
      projectLineSectionId,
    } = routerParams;

    // 阶梯报价props
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
      doubleUnitFlag,
    };

    // 专家详情props
    const expertDetailProps = {
      code,
      queryScoringHeaderLoading,
      queryScoringIndicLoading,
      saveScoreingLoading,
      scoringRightDeatilHeader,
      scoringRightDeatilLine,
      tenantId: organizationId,
      dispatch,
      expertUserId: match.params.expertUserId,
      scoreFlag,
      subjectMatterRule: match.params.subjectMatterRule,
      sourceFrom: match.params.sourceFrom,
      form,
      customizeTable,
      customizeForm,
      reviewScoredStatus,
      save: this.onSaveScoring,
      back: this.onBackScoring,
    };

    const sectionPanelProps = {
      rowKey: 'sourceHeaderId',
      isSection: !!projectLineSectionId,
      parentPage: {
        name: cachTabKey === 'scoreing' ? 'expertScoring' : 'expertScored',
        queryParams: {
          sourceStatus,
          sourceProjectId,
          operation: reviewScoredStatus === 'SCORED' ? 'VIEW_COMPLIANCE_CHECK' : 'COMPLIANCE_CHECK',
        },
      },
      activeRowId: sourceHeaderId,
      displayName: 'sectionName',
      afterOpenSection: this.replaceRoute,
      beforeOpenSection: reviewScoredStatus !== 'SCORED' && this.saveData,
    };

    return (
      <React.Fragment>
        <Header
          title={
            routerParams.reviewScoredStatus === 'SCORED'
              ? intl.get(`${promptCode}.view.message.title.complianceCheckView`).d('符合性检查查看')
              : intl.get(`${promptCode}.view.message.title.complianceCheck`).d('符合性检查')
          }
          backPath={this.getBackPath(routerParams)}
        >
          {this.renderHeaderButton()}
        </Header>
        {projectLineSectionId ? (
          <SectionPanel {...sectionPanelProps}>{this.renderContent()}</SectionPanel>
        ) : (
          this.renderContent()
        )}
        {this.renderReviewDetailModal(expertDetailProps)}
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          title={intl.get('hzero.common.title.checkAttach').d('查看附件')}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={1000}
        >
          <QuoteAttachment {...attachmentsProps} />
        </Modal>
        {/* {priceComparisonModalVisible && <PriceComparison {...priceComparisonProps} />} */}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_DETAIL',
        'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_DETAIL',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_EDIT',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_DETAIL',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_EDIT',
        'SSRC.EXPERT_SCORE_REVIEW.QUOTATION_LINE',
      ],
    }),
    connect(({ expertScoring, loading }) => ({
      expertScoring,
      queryScoringSupplierLoading: loading.effects['expertScoring/fetchQueryReviewSupplier'],
      queryScoringQuotationLoading: loading.effects['expertScoring/fetchScoringQuotation'],
      queryScoringHeaderLoading: loading.effects['expertScoring/fetchScoringHeader'],
      queryScoringIndicLoading: loading.effects['expertScoring/fetchScoringIndic'],
      savePreApplyLoading: loading.effects['expertScoring/savePretrialApplication'],
      submitPreApplyLoading: loading.effects['expertScoring/submitPretrialApplication'],
      saveScoreingLoading: loading.effects['expertScoring/fetchSaveReviewScoring'],
      fetchScoreElementLoading: loading.effects['expertScoring/fetchScoreElementList'],
      submitExpertLoading: loading.effects['expertScoring/fetchSubmitReviewScoring'],
      saveExpertLoading: loading.effects['expertScoring/fetchSaveReviewElementScoring'],
      submitElementExpertLoading: loading.effects['expertScoring/submitElementScoreing'],
      querySupplierExchangeEditLoading: loading.effects['expertScoring/querySupplierExchangeEdit'],
      saveExchangeEditLoading: loading.effects['expertScoring/saveExchangeEdit'],
      fetchQuotationDetailLoading: loading.effects['expertScoring/fetchQuotationDetail'],
      fetchLadderLevelTableLoading: loading.effects['expertScoring/fetchLadderLevelTable'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({
      code: [
        'ssrc.expertScoring',
        'ssrc.supplierBidQuery',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.supplierQuotation',
      ],
    }),
    Form.create({ fieldNameProp: null }),
    remote(
      {
        code: 'SSRC_INITIAL_REVIEW',
        name: 'remote',
      },
      {
        events: {
          handleInitDemesion(eventProps) {
            const { switchDimension = () => {} } = eventProps;
            switchDimension();
          },
          handleCuxBeforeSubmitElementExpert() {},
          handleCuxBeforeSubmitExpert() {},
        },
      }
    )
  )(Comp);
};

export default HOCComponent(Review);

export { HOCComponent, Review };
