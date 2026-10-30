/**
 * Recommend - 专家评分-详情
 * @date: 2019-07-01
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Tabs, Tooltip, Tag, Icon, Button, Spin, Modal, Row, Col, Badge } from 'hzero-ui';
import { Modal as C7nModal, DataSet } from 'choerodon-ui/pro';
import { map, isEmpty, isNumber, compose } from 'lodash';
import { connect } from 'dva';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import {
  getCurrentOrganizationId,
  getEditTableData,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';
import { PRIVATE_BUCKET } from '_utils/config';
// import { getActiveTabKey } from 'utils/menuTab';
import remote from 'hzero-front/lib/utils/remote';

import QuoteAttachment from 'srm-front-ssrc/lib/routes/ssrc/SupplierQuotation/InquiryPrice/QuoteAttachment';
import { numberSeparatorRender } from 'srm-front-ssrc/lib/utils/renderer';
import Iconfont from 'srm-front-ssrc/lib/routes/ssrc/components/Icons'; // 下载至本地的icon
import PriceComparison from 'srm-front-ssrc/lib/routes/ssrc/components/PriceComparison';
import BidPriceComparison from 'srm-front-ssrc/lib/routes/ssrc/components/PriceComparison/BidIndex';
import ExchangeEditModal from 'srm-front-ssrc/lib/routes/ssrc/components/ExchangeEditModals/ExchangeEditModal';
import QuoteExchangeMainDateModal from 'srm-front-ssrc/lib/routes/ssrc/components/ExchangeEditModals/QuoteExchangeMainDateModal';
import SubAccount from 'srm-front-ssrc/lib/routes/components/SubAccount';
import SVGIcon from 'srm-front-ssrc/lib/routes/components/SvgIcon';
import LadderLevel from 'srm-front-ssrc/lib/routes/ssrc/components/LadderLevelDoubleUnit';
import SectionPanel from 'srm-front-ssrc/lib/routes/sbid/components/SectionPanel';
import { FIlESIZE, ChunkUploadProps } from 'srm-front-ssrc/lib/utils/SsrcRegx';
import {
  queryEnableDoubleUnit,
  querySourceExchangeRateConfig,
  queryTemplateConfig,
  queryUiDisplayConfig,
} from 'srm-front-ssrc/lib/services/commonService';
import { isText, getJumpRoutePrefixUrl } from 'srm-front-ssrc/lib/utils/utils';
import { rfFetchHeader } from 'srm-front-ssrc/lib/services/expertScoringService';
import { fetchNewQuotationConfigSheet } from 'srm-front-ssrc/lib/services/supplierQutationService';

import FileGroup from '../../../components/SupplierQuotationAttachment';
import RenderFileTotalCount from 'srm-front-ssrc/lib/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';

import styles from './index.less';
import ItemLineTable from './ItemLineTable';
import ExpertDetailModal from './ExpertDetailModal';
import BidExpertDetailModal from './BidExpertDetailModal';
import ScoreElementTable from './ScoreElementTable';
import BidScoreElementTable from './BidScoreElementTable';
import PriceClarificationButtons from './PriceClarificationButtons';

import ExpertLibraryModal from './ExpertLibraryModal';
import ExpertDetailC7NModal from './ExpertDetailC7NModal';
import { scoreInfoDS, scoreTableDS } from './ExpertDetailC7NDS';

const { confirm } = Modal;
const promptCode = 'ssrc.expertScoring';

class ExpertScoring extends Component {
  constructor(props) {
    super(props);
    this.initState(props, 'init');
    this.activeTabKey = getJumpRoutePrefixUrl(this.props.location.pathname);
  }

  /**
   * 初始化state
   * @param {Obejct} props - 组件props
   * @param {boolean} isInit - 是否初始化
   */
  initState(props, isInit) {
    const { location, match } = props;
    const routerParams = querystring.parse(location.search.substr(1)) || {};
    const { sourceHeaderId } = match.params;
    const { evaluateExpertId = null } = routerParams;
    const routerList = location.pathname.split('/');
    const state = {
      routerList,
      routerParams: { ...routerParams, sourceHeaderId },
      expand: {}, // 展开数据
      loadingObj: {},
      sectionFlag: 0, // 标段标识
      scoreIndicFlag: false,
      quotationHeaderId: null,
      sectionId: null,
      scoreFlag: false,
      AttachmentsProps: {}, // 查看报价行附件属性集合
      attachmentVisible: false, // 附件组件显示标识
      expertAttachmentUuid: null, // 头附件
      supplierDimension: {}, // 供应商维度
      activeKey: '', // 标签页activeKey
      evaluateExpertId: evaluateExpertId || sessionStorage.getItem('evaluateExpertId'), // XXX 后期逐步去除使用,使用路由传参
      exchangeEditModalVisible: false, // 汇率编辑modal
      exchangeEditContentModalVisible: false, // 汇率编辑引用汇率主数据modal
      priceComparisonModalVisible: false, // 比价助手模态框
      expertModalVisible: false,
      subAccountVisible: false,
      sourceCategory: '',
      bidFlag: false,
      hideBusinessBid: false, // 隐藏商务标, 控制比价助手, 商务附件等字段显隐 不区分商务技术 商务技术组 技术能看到的
      doubleUnitFlag: false, // 双单位标识
      scoreTableList: [], // 评分行信息
      tabActiveKey: '', // 组别的tab
      viewScoreTeam: '', // 是否展示组别
      openBidOrder: 'BUSINESS_FIRST', // 判断技术在前还是商务组在前
      headerInfoObj: {}, // 头数据
      newQuotationFlag: false, // 开启新报价
      showExchangeEdit: false,
      templateConfig: {}, // 查询该模版配置
      operateLoading: false,
      viewDocumentFlag: 0, // 跳转的单据详情按钮
    };

    if (isInit) {
      this.state = state;
    } else {
      // 多标段查询
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

  toggleOperateLoading = (operateLoading = false) => {
    this.setState({
      operateLoading,
    });
  };

  /**
   * 查询使用新汇率编辑配置表
   */
  @Bind()
  async handeleSearchQuerySourceExchangeRateConfig() {
    try {
      const result = getResponse(await querySourceExchangeRateConfig());
      if (result?.length) {
        this.setState({
          showExchangeEdit: true,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  @Bind()
  async querySsrcNewFunctionConfig() {
    const { organizationId } = this.props;
    const data = {
      tableCode: 'ssrc_expert_scoring_show_view_ducoment_button_white',
      organizationId,
      tenantNum: getCurrentTenant().tenantNum,
    };
    const res = await queryUiDisplayConfig(data);
    if (!res) {
      return;
    }

    const documentFlag = isEmpty(res) ? 0 : 1;

    this.setState({
      viewDocumentFlag: documentFlag,
    });
  }

  /**
   * 数据初始化
   */
  @Bind()
  initQuery() {
    this.fetchHeader();
    this.handleQuerySetting();
    this.queryEnableDoubleUnit();
    this.newQuotationConfigSheet();
    this.handeleSearchQuerySourceExchangeRateConfig();

    this.afterLoadedPageCuxReservedHandle(); // cux
    this.querySsrcNewFunctionConfig();
  }

  // 更换路由, replace route, 初始化数据, 放置在 `componentDidUpdate`
  @Bind()
  replaceRoute(record) {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    const {
      routerParams: { cachTabKey },
    } = this.state;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        scoreElementList: {}, // 专家评分--分标段/不分标段-评分要素维度信息
      },
    });

    if (cachTabKey === 'scoreHistory') {
      // 历史评分
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

      dispatch(
        routerRedux.replace({
          pathname: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update`,
          search,
        })
      );
    } else {
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
          pathname: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update`,
          search,
        })
      );
    }
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

  /**
   * 保存数据
   */
  @Bind()
  async saveData() {
    const { supplierDimension = {} } = this.state;
    if (!supplierDimension.flag) {
      return Promise.resolve(true);
    }
    const res = await this.saveExpert('changeSection');
    if (res) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  // 页面加载后给二开埋点
  afterLoadedPageCuxReservedHandle = () => {
    const { exportScoringBuss } = this.props;

    if (exportScoringBuss?.event) {
      const eventProps = {
        that: this,
      };
      exportScoringBuss.event.fireEvent('afterLoadedPageCuxHandle', eventProps);
    }
  };

  /*
   * 查询配置中心值
   */
  @Bind()
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

  @Bind()
  queryEnableDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  // 查询头信息
  @Bind()
  fetchHeader() {
    const { match, dispatch, organizationId, modelName = 'expertScoring' } = this.props;
    const { sourceHeaderId, sourceFrom } = match.params;
    const { routerParams } = this.state;
    let data = {
      organizationId,
    };

    // RFP/RFI 暂不需要
    if (sourceFrom === 'RFP' || sourceFrom === 'RFI') {
      rfFetchHeader({
        rfHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            viewScoreTeam: routerParams.scoredStatus === 'SCORED' ? res.viewScoreTeam : '',
            openBidOrder: res.openBidOrder === 'TECH_FIRST' ? 'TECH_FIRST' : 'BUSINESS_FIRST',
            tabActiveKey: res.openBidOrder === 'TECH_FIRST' ? 'business' : 'technology',
            headerInfoObj: res,
          });
          this.queryExpertScoring();
        }
      });
      return;
    }

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

    dispatch({
      type: `${modelName}/${queryMethod}`,
      payload: { ...data },
    }).then((res) => {
      if (res) {
        this.setState({
          viewScoreTeam: routerParams.scoredStatus === 'SCORED' ? res.viewScoreTeam : '',
          tabActiveKey: res.openBidOrder === 'TECH_FIRST' ? 'business' : 'technology',
          openBidOrder: res.openBidOrder === 'TECH_FIRST' ? 'TECH_FIRST' : 'BUSINESS_FIRST',
          bidFlag: res.secondarySourceCategory === 'NEW_BID',
          sourceCategory: res.sourceCategory,
          hideBusinessBid: res.businessTechSee === 'TECH',
          headerInfoObj: res,
        });
        this.queryExpertScoring();
      }
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
      tabActiveKey,
      viewScoreTeam,
      routerParams: { checkScore },
      headerInfoObj,
    } = this.state;
    const { match, dispatch, modelName = 'expertScoring', exportScoringBuss } = this.props;
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
      type: `${modelName}/fetchScoringSupplier`,
      payload: {
        sourceHeaderId,
        expertUserId,
        subjectMatterRule,
        expertSequenceNum,
        sourceFrom,
        viewScoreTeam: viewScoreTeam
          ? tabActiveKey === 'business'
            ? 'BUSINESS'
            : 'TECHNOLOGY'
          : undefined,
        viewScoreFlag:
          (routerParams.cachTabKey || '').includes('scoreing') &&
          routerParams.scoredStatus !== 'SCORED'
            ? 0
            : 1,
        page,
      },
    }).then((res) => {
      if (res) {
        if (res.subjectMatterRule === 'PACK' && sourceFrom === 'BID') {
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
              flag: exportScoringBuss
                ? exportScoringBuss.process(
                    'SSRC_EXPERT_SCORING_BUSS_PROCESS_DEFAULT_DIMENSION',
                    false,
                    {
                      headerInfoObj,
                    }
                  )
                : false,
            },
          });
        }
        this.setState({ sectionFlag: res.sectionFlag });
        if (checkScore === 'checkScore') {
          const eventProps = {
            headerInfoObj,
            switchDimension: this.switchDimension,
          };
          // this.switchDimension();
          if (remote?.event) {
            // remoteTechInitDemesion 二开埋点方法名
            remote.event.fireEvent('remoteTechInitDemesion', eventProps);
          } else {
            this.switchDimension();
          }
        }
      }
    });
  }

  /**
   * 专家评分-查询供应商信息
   */
  @Bind()
  fetchScoreSupplierList() {
    const page = {};
    const { routerParams, tabActiveKey, viewScoreTeam } = this.state;
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    dispatch({
      type: `${modelName}/fetchScoringSupplier`,
      payload: {
        sourceHeaderId,
        expertUserId,
        subjectMatterRule,
        expertSequenceNum,
        sourceFrom,
        viewScoreTeam: viewScoreTeam
          ? tabActiveKey === 'business'
            ? 'BUSINESS'
            : 'TECHNOLOGY'
          : undefined,
        page,
        viewScoreFlag:
          (routerParams.cachTabKey || '').includes('scoreing') &&
          routerParams.scoredStatus !== 'SCORED'
            ? 0
            : 1,
      },
    });
  }

  /**
   * 专家评分--不分标段-评分要素查询 bidLineItemIds = []
   * 专家评分--标段-评分要素查询 bidLineItemIds = [1,2,3]
   * @memberof BidEvaluation
   */
  @Bind()
  fetchScoreElementList(bidLineItemIds = []) {
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const { evaluateExpertId, routerParams = {}, tabActiveKey, viewScoreTeam } = this.state;
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
          viewScoreTeam: viewScoreTeam
            ? tabActiveKey === 'business'
              ? 'BUSINESS'
              : 'TECHNOLOGY'
            : undefined,
          evaluateExpertId,
          viewScoreFlag:
            (routerParams.cachTabKey || '').includes('scoreing') &&
            routerParams.scoredStatus !== 'SCORED'
              ? 0
              : 1,
        }
      : {
          sourceHeaderId,
          expertUserId,
          subjectMatterRule,
          expertSequenceNum,
          sourceFrom,
          viewScoreTeam: viewScoreTeam
            ? tabActiveKey === 'business'
              ? 'BUSINESS'
              : 'TECHNOLOGY'
            : undefined,
          bidLineItemIds,
          evaluateExpertId,
          viewScoreFlag:
            (routerParams.cachTabKey || '').includes('scoreing') &&
            routerParams.scoredStatus !== 'SCORED'
              ? 0
              : 1,
        };
    dispatch({
      type: `${modelName}/fetchScoreElementList`,
      payload: {
        ...payload,
        customizeUnitCode:
          routerParams.scoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_DETAIL_RFX'
            : 'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_EDIT_RFX',
      },
    });
  }

  componentWillUnmount() {
    const { modelName = 'expertScoring', dispatch } = this.props;
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

  /**
   *展开时重新调用单独查询投标物料行列表数据
   */
  expandItemLine = (e, quotationHeaderId, item) => {
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const { sourceFrom } = match.params;
    let rfxflag = '';
    if (sourceFrom === 'RFX') {
      rfxflag = '_RFX';
    }
    e.stopPropagation();
    // RF 不能查看物料
    if (sourceFrom === 'RFI' || sourceFrom === 'RFP') {
      return;
    }
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
          customizeUnitCode:
            item.team === 'TECHNOLOGY'
              ? `SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH${rfxflag}`
              : item.team === 'BUSINESS'
              ? `SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS${rfxflag}`
              : `SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH${rfxflag}`,
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

  // 评分保存
  @Bind()
  async handleSave({
    scoreInfoDs,
    scoreTableDs,
    sourceHeaderId,
    expertUserId,
    expertSequenceNum,
    sourceFrom,
    quotationHeaderId,
  }) {
    const { scoreTableList, sectionFlag, sectionId, scoreFlag } = this.state;
    const { dispatch, modelName = 'expertScoring' } = this.props;
    const flag = (await Promise.all([scoreInfoDs.validate(), scoreTableDs.validate()])).every(
      (e) => e
    );
    const list = scoreTableDs?.toData();
    if (flag) {
      const newParams = scoreTableList.map((item) => {
        if (item.detailEnabledFlag) {
          const { evaluateScoreLineDetailS = [], ...otherItem } = item;
          const elements = list.find((ele) => ele.evaluateIndicId === item.evaluateIndicId);
          const newLineItem = evaluateScoreLineDetailS.map((element) => {
            const ele = list.find((e) => e.indicateId === element.indicateId);
            return {
              ...element,
              ...ele,
            };
          });
          return {
            ...otherItem,
            ...elements,
            evaluateScoreLineDetailS: newLineItem,
          };
        } else {
          const element = list.find((ele) => ele.evaluateIndicId === item.evaluateIndicId);
          return {
            ...item,
            ...element,
          };
        }
      });
      const params = {
        sourceHeaderId,
        evaluateScoreDTO: {
          ...scoreInfoDs?.current?.toData(),
          expertUserId,
          currentSequenceNum: expertSequenceNum,
          sectionFlag,
          quotationHeaderId,
          sectionId,
        },
        customizeUnitCode: scoreFlag
          ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX'
          : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
        evaluateScoreLineDTOList: newParams,
        sourceFrom,
      };
      dispatch({
        type: `${modelName}/saveScoreing`,
        payload: params,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchScoreSupplierList();
        }
      });
      return true;
    }
    return false;
  }

  /**
   * 评分操作
   */
  @Bind()
  onScoring(e, item) {
    const { routerList, viewScoreTeam, tabActiveKey } = this.state;
    const { match, dispatch, modelName = 'expertScoring', exportScoringBuss } = this.props;
    const { expertUserId, expertSequenceNum, sourceFrom, subjectMatterRule } = match.params;
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    if (item.scoreStatus === 'SCORED') {
      this.setState({
        scoreFlag: true,
      });
    }
    if (routerList.includes('RFX') || routerList.includes('RFP') || routerList.includes('RFI')) {
      // 标准评分 function
      const startScoreFunc = () => {
        this.setState({
          quotationHeaderId: item.quotationHeaderId,
          sectionId: item.sectionId,
        });

        const scoreInfoDs = new DataSet(
          scoreInfoDS({
            quotationHeaderId: item.quotationHeaderId,
            supplierId: item.supplierCompanyId,
            evaluateScoreIds: String(item.evaluateScoreIds),
            sectionId: item.sectionId,
            sourceFrom,
            scoreFlag: item.scoreStatus === 'SCORED',
          })
        );

        let tableDS = scoreTableDS({
          scoreFlag: item.scoreStatus === 'SCORED',
          lineData: item,
        });

        tableDS = exportScoringBuss
          ? exportScoringBuss.process(
              'SSRC_EXPERT_SCORING_BUSS_PROCESS_EXPERT_DETAIL_C7N_TABLE_DS',
              tableDS,
              {
                lineData: item,
                that: this,
                scoreInfoDS,
              }
            )
          : tableDS;

        const scoreTableDs = new DataSet(tableDS);

        const modalProps = {
          lineData: item,
          scoreInfoDs,
          scoreTableDs,
          sourceFrom,
          viewScoreTeam,
          tabActiveKey,
          subjectMatterRule,
          expertUserId,
          expertSequenceNum,
          quotationHeaderId: item.quotationHeaderId,
          evaluateScoreIds: String(item.evaluateScoreIds),
          sourceHeaderId: item.sourceHeaderId,
          scoreFlag: item.scoreStatus === 'SCORED',
          setTableList: (res) => {
            this.setState({
              scoreTableList: res,
            });
          },
          exportScoringBuss,
          parentInstance: this,
        };

        C7nModal.open({
          key: C7nModal.key(),
          title: intl.get(`${promptCode}.view.message.title.expertScore`).d('专家评分'),
          drawer: true,
          closable: true,
          style: {
            width: 1020,
          },
          children: <ExpertDetailC7NModal {...modalProps} />,
          okText: intl.get('hzero.common.button.save').d('保存'),
          onOk: () => this.handleSave(modalProps),
          okButton: item.scoreStatus !== 'SCORED',
        });
      };

      if (exportScoringBuss?.event) {
        exportScoringBuss.event.fireEvent('remoteStartScore', {
          startScoreFunc: () => startScoreFunc(),
          that: this,
          item,
        });
      } else {
        startScoreFunc();
      }
      return;
    }

    this.setState({
      scoreIndicFlag: true,
      quotationHeaderId: item.quotationHeaderId,
      sectionId: item.sectionId,
    });

    // to do 对于rfi\rfp个性化
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
          sourceFrom === 'RFX'
            ? item.scoreStatus === 'SCORED'
              ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX'
              : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX'
            : sourceFrom === 'RFI' || sourceFrom === 'RFP'
            ? item.scoreStatus === 'SCORED'
              ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI'
              : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI'
            : item.scoreStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_BID'
            : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_BID',
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
        viewScoreTeam: viewScoreTeam
          ? tabActiveKey === 'business'
            ? 'BUSINESS'
            : 'TECHNOLOGY'
          : undefined,
        viewScoreFlag: item.scoreStatus === 'SCORED' ? 1 : undefined,
        evaluateScoreIds: String(item.evaluateScoreIds),
        customizeUnitCode:
          sourceFrom === 'RFX'
            ? item.scoreStatus === 'SCORED'
              ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX'
              : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX'
            : item.scoreStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_BID'
            : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_BID',
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
    const { secondarySourceCategory } = header || {};
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    const { routerParams = {} } = this.state;

    if (sourceFrom === 'BID') {
      // 若是招投标跳进招投标明细页面，记录返回时的路由
      const search = querystring.stringify({
        backRecommend: 'expertDetailToBidHallDetail',
        source: subjectMatterRule,
      });
      history.push({
        pathname: `${this.activeTabKey}/bid-detail/${params}`,
        search,
      });
      const source = {
        label: 'expertDetailToBidHallDetail',
        url: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update?sourceHeaderId=${routerParams.sourceHeaderId}&cachTabKey=${routerParams.cachTabKey}&scoredStatus=${routerParams.scoredStatus}&evaluateLeaderFlag=${routerParams.evaluateLeaderFlag}&backRecommend=${routerParams.backRecommend}&evaluateExpertId=${routerParams.evaluateExpertId}&multiSectionFlag=${routerParams.multiSectionFlag}&sourceProjectId=${routerParams.sourceProjectId}&projectLineSectionId=${routerParams.projectLineSectionId}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(
        `expertDetailToBidHallDetail+${this.activeTabKey}`,
        JSON.stringify(source)
      );
    } else if (sourceFrom === 'RFX') {
      // 若是询报价跳进询报价明细页面，记录返回时的路由
      const search = querystring.stringify({
        backRecommend: 'expertDetailToInquiryHallDetail',
      });
      history.push({
        pathname:
          secondarySourceCategory === 'NEW_BID'
            ? `${this.activeTabKey}/new-bid-detail/${params}`
            : `${this.activeTabKey}/rfx-detail/${params}`,
        search,
      });
      // 后续需要重构路由解决
      // const urlPrefix =
      //   getActiveTabKey() === '/ssrc/expert-scoring'
      //     ? '/ssrc/expert-scoring'
      //     : `/ssrc/new-${
      //         secondarySourceCategory === 'NEW_BID' ? 'bid' : 'inquiry'
      //       }-hall/new-expert-scoring`;
      const source = {
        label: 'expertDetailToInquiryHallDetail',
        url: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update?sourceHeaderId=${routerParams.sourceHeaderId}&cachTabKey=${routerParams.cachTabKey}&scoredStatus=${routerParams.scoredStatus}&evaluateLeaderFlag=${routerParams.evaluateLeaderFlag}&backRecommend=${routerParams.backRecommend}&evaluateExpertId=${routerParams.evaluateExpertId}&multiSectionFlag=${routerParams.multiSectionFlag}&sourceProjectId=${routerParams.sourceProjectId}&projectLineSectionId=${routerParams.projectLineSectionId}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(
        `expertDetailToInquiryHallDetail+${this.activeTabKey}`,
        JSON.stringify(source)
      );
    } else if (sourceFrom === 'RFP' || sourceFrom === 'RFI') {
      // 若是RFI/RFP跳进询报价明细页面，记录返回时的路由
      const search = querystring.stringify({
        backRecommend: 'expertDetailToRFDetail',
      });
      history.push({
        pathname: `${this.activeTabKey}/rf-detail/${sourceFrom}/${sourceHeaderId}`,
        search,
      });
      const source = {
        label: 'expertDetailToRFDetail',
        url: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update?sourceHeaderId=${routerParams.sourceHeaderId}&cachTabKey=${routerParams.cachTabKey}&scoredStatus=${routerParams.scoredStatus}&evaluateLeaderFlag=${routerParams.evaluateLeaderFlag}&backRecommend=${routerParams.backRecommend}&evaluateExpertId=${routerParams.evaluateExpertId}&multiSectionFlag=${routerParams.multiSectionFlag}&sourceProjectId=${routerParams.sourceProjectId}&projectLineSectionId=${routerParams.projectLineSectionId}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(`expertDetailToRFDetail+${this.activeTabKey}`, JSON.stringify(source));
    }
  }

  /**
   * 保存
   */
  @Bind()
  onSaveScoring() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { scoringRightDeatilHeader = {}, scoringRightDeatilLine = [] },
      match,
      form = {},
    } = this.props;
    const { expertUserId, expertSequenceNum, sourceFrom } = match.params;
    const { quotationHeaderId, sectionId, sectionFlag, routerList, scoreFlag } = this.state;
    let newParams = [];
    form.validateFields((err, values) => {
      if (!err) {
        if (
          routerList.includes('RFX') ||
          routerList.includes('RFP') ||
          routerList.includes('RFI')
        ) {
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
          // 老招标
          newParams = getEditTableData(scoringRightDeatilLine, ['evaluateLineId']) || [];
        }
        // 老招标
        if (
          !(
            routerList.includes('RFX') ||
            routerList.includes('RFP') ||
            routerList.includes('RFI')
          ) &&
          newParams.length === 0
        ) {
          return;
        }
        dispatch({
          type: `${modelName}/saveScoreing`,
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
            customizeUnitCode: scoreFlag
              ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX'
              : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
            evaluateScoreLineDTOList: newParams,
            sourceFrom,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchScoreSupplierList();
            this.setState({
              scoreIndicFlag: false,
            });
          }
        });
      }
    });
  }

  /**
   * 专家评分要素维度保存数据处理
   */
  @Bind()
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
   * 返回
   */
  @Bind()
  onBackScoring() {
    this.setState({
      scoreIndicFlag: false,
    });
  }

  /**
   * 提交
   */
  @Bind()
  @Throttle(1000)
  submitExpert() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      match,
      history,
      [modelName]: { expAttachmentUuid = null },
      exportScoringBuss,
    } = this.props;
    const { routerParams, expertAttachmentUuid, evaluateExpertId } = this.state;
    const search = routerParams.cachTabKey;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;

    const handleSubmit = () => {
      confirm({
        title: intl
          .get(`${promptCode}.model.expertScoring.confirmSubmitScoring`)
          .d('是否确认提交评分？'),
        onOk: () => {
          dispatch({
            type: `${modelName}/submitScoreing`,
            payload: {
              sourceHeaderId,
              expertUserId,
              subjectMatterRule,
              expertSequenceNum,
              expertAttachmentUuid: expAttachmentUuid || expertAttachmentUuid,
              sourceFrom,
              elementFlag: 0,
              evaluateExpertId,
              customizeUnitCode:
                'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX,SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              if (this.activeTabKey === '/ssrc/new-inquiry-hall') {
                history.push({
                  pathname: `${this.activeTabKey}/list`,
                  search: querystring.stringify({
                    sourceCategory: sourceFrom,
                  }),
                });
              } else {
                history.push({
                  pathname: `${this.activeTabKey}/list`,
                  search,
                });
              }
            }
          });
        },
      });
    };

    // cux handle before submit
    const eventProps = {
      that: this,
      handleSubmit,
    };
    if (exportScoringBuss?.event) {
      exportScoringBuss.event.fireEvent('remoteSubmitExpert', eventProps);
    } else {
      handleSubmit();
    }
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
      exportScoringBuss,
    } = this.props;
    const { routerParams, expertAttachmentUuid, evaluateExpertId } = this.state;
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
          const evaluateScoreLineDetailS = item.evaluateScoreLineDetailS.map((elementItem) => {
            const evaluateScoreDTOS = this.handleSaveExpert(elementItem);
            return {
              ...elementItem,
              evaluateScoreDTOS,
            };
          });
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
    const evaluateSuggestionDTOS = scoreElementList?.evaluateSuggestionDTOS?.map?.((item) => {
      return {
        ...item,
        expertSuggestion: this.supplierTable?.flag?.props?.form?.getFieldValue?.(
          item.supplierCompanyName
        ),
      };
    });

    const handleSubmit = () => {
      confirm({
        title: intl
          .get(`${promptCode}.model.expertScoring.confirmSubmitScoring`)
          .d('是否确认提交评分？'),
        onOk: () => {
          dispatch({
            type: `${modelName}/submitElementScoreing`,
            payload: {
              evaluateScoreLineDTOS,
              evaluateSuggestionDTOS,
              sourceHeaderId: params.sourceHeaderId,
              expertUserId: params.expertUserId,
              subjectMatterRule: params.subjectMatterRule,
              expertSequenceNum: params.expertSequenceNum,
              expertAttachmentUuid: expAttachmentUuid || expertAttachmentUuid,
              sourceFrom: params.sourceFrom,
              sectionFlag: scoreElementList.sectionFlag,
              elementFlag: 1,
              evaluateExpertId,
              customizeUnitCode:
                'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX,SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              if (this.activeTabKey === '/ssrc/new-inquiry-hall') {
                history.push({
                  pathname: `${this.activeTabKey}/list`,
                  search: querystring.stringify({
                    sourceCategory: params.sourceFrom,
                  }),
                });
              } else {
                history.push({
                  pathname: `${this.activeTabKey}/list`,
                  search,
                });
              }
            }
          });
        },
      });
    };

    // cux handle before submit
    const eventProps = {
      that: this,
      handleSubmit,
      evaluateScoreLineDTOS,
      evaluateSuggestionDTOS,
    };
    if (exportScoringBuss?.event) {
      exportScoringBuss.event.fireEvent('remoteSubmitElementExpert', eventProps);
    } else {
      handleSubmit();
    }
  }

  /**
   * 评分要素维度专家打分保存
   * @param {?string} flag - 保存类型 `changeSection`/``
   */
  @Bind()
  @Debounce(500)
  saveExpert(flag, options = {}) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { scoreElementList = {}, expAttachmentUuid = null },
      match: { params },
    } = this.props;
    const { activeKey, evaluateExpertId, expertAttachmentUuid } = this.state;
    const { cancelSuccessNotificationFlag = 0, otherData = {} } = options || {}; // 处理二开逻辑

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
          const evaluateScoreLineDetailS = item.evaluateScoreLineDetailS.map((elementItem) => {
            const evaluateScoreDTOS = this.handleSaveExpert(elementItem);
            return {
              ...elementItem,
              evaluateScoreDTOS,
            };
          });
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
    const evaluateSuggestionDTOS = scoreElementList?.evaluateSuggestionDTOS?.map?.((item) => {
      return {
        ...item,
        expertSuggestion: this.supplierTable?.[supplierTableKey]?.props?.form?.getFieldValue?.(
          item.supplierCompanyName
        ),
      };
    });
    return dispatch({
      type: `${modelName}/saveElementScoreing`,
      payload: {
        evaluateScoreLineDTOS,
        evaluateSuggestionDTOS,
        sourceHeaderId: params.sourceHeaderId,
        expertUserId: params.expertUserId,
        sourceFrom: params.sourceFrom,
        sectionFlag: scoreElementList.sectionFlag,
        expertAttachmentUuid: expAttachmentUuid || expertAttachmentUuid,
        evaluateExpertId,
        ...otherData,
      },
    }).then((res) => {
      if (res) {
        if (!cancelSuccessNotificationFlag) {
          notification.success();
        }

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

  /**
   * 评分要素维度专家打分数据处理
   */
  @Bind()
  handleSaveExpert(item = {}) {
    const evaluateScoreDTOS = item.evaluateScoreDTOS.map((elementItem = {}) => {
      return {
        ...elementItem,
        indicScore: Number(elementItem.zeroAmountScoreFlag)
          ? elementItem.indicScore
          : item.indicateType === 'SCORE'
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

  /**
   * 切换要素维度询问是否保存，选择是-保存，如果保存成功就切换到供应商维度，否则不切换
   */
  @Bind()
  saveElementDimensionExpert() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { scoreElementList = {}, expAttachmentUuid },
      match: { params },
    } = this.props;
    const { activeKey, supplierDimension, evaluateExpertId, expertAttachmentUuid } = this.state;
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
          const evaluateScoreLineDetailS = item.evaluateScoreLineDetailS.map((elementItem) => {
            const evaluateScoreDTOS = this.handleSaveExpert(elementItem);
            return {
              ...elementItem,
              evaluateScoreDTOS,
            };
          });
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
    const evaluateSuggestionDTOS = scoreElementList?.evaluateSuggestionDTOS?.map?.((item) => {
      return {
        ...item,
        expertSuggestion: this.supplierTable[supplierTableKey]?.props?.form?.getFieldValue?.(
          item.supplierCompanyName
        ),
      };
    });
    dispatch({
      type: `${modelName}/saveElementScoreing`,
      payload: {
        evaluateScoreLineDTOS,
        evaluateSuggestionDTOS,
        sourceHeaderId: params.sourceHeaderId,
        expertUserId: params.expertUserId,
        sourceFrom: params.sourceFrom,
        sectionFlag: scoreElementList.sectionFlag,
        expertAttachmentUuid: expAttachmentUuid || expertAttachmentUuid,
        evaluateExpertId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        if (params.subjectMatterRule === 'PACK' && params.sourceFrom === 'BID') {
          // 分标段
          this.setState({ supplierDimension: { ...supplierDimension, [activeKey]: false } });
          this.supplierTable[supplierTableKey].setState({ scoresFlag: false });
          this.fetchScoreSupplierList();
        } else {
          this.supplierTable[supplierTableKey].props.form.resetFields();
          this.setState({ supplierDimension: { flag: !supplierDimension.flag } });
          this.supplierTable[supplierTableKey].setState({ scoresFlag: false });
          this.fetchScoreSupplierList();
        }
      }
    });
  }

  @Bind()
  handleAfterOpenModal(expertAttachmentUuid) {
    this.setState({
      expertAttachmentUuid,
    });
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(item = {}) {
    const { hideBusinessBid } = this.state;
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
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      // roundFlag,
      quotationHeader: item,
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      // tenantId: organizationId,
      // initUpload: this.initUpload,
      businessUuid: hideBusinessBid ? null : businessAttachmentUuid,
      techUuid: techAttachmentUuid,
      bargainBusUuid: hideBusinessBid ? null : bargainBusinessAttachmentUuid,
      bargainTechUuid: bargainTechAttachmentUuid,
      roundBusUuid: hideBusinessBid ? null : roundBusinessAttachmentUuid,
      roundTechUuid: roundTechAttachmentUuid,
      showBusinessAttachment: !hideBusinessBid,
      // onRef: this.handleBindOnRef,
    };

    this.setState({
      AttachmentsProps,
      attachmentVisible: true,
    });
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false, AttachmentsProps: {} });
  }

  @Bind()
  /**
   * 物品明细头部 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const { match, dispatch, modelName = 'expertScoring' } = this.props;
    const { sourceHeaderId, expertUserId, subjectMatterRule } = match.params;
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    dispatch({
      type: `${modelName}/fetchScoringSupplier`,
      payload: { sourceHeaderId, expertUserId, subjectMatterRule, page: changedPagination },
    });
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
   *切换面板
   *
   * @memberof BidEvaluation
   */
  @Bind()
  changeTabs(activeKey) {
    const { activeKey: key, supplierDimension } = this.state;
    const { match } = this.props;
    const { subjectMatterRule, sourceFrom } = match.params;
    // 分标段
    if (subjectMatterRule === 'PACK' && sourceFrom === 'BID') {
      const { scoresFlag } = this.supplierTable[key].state;
      // 判断是否在供应商维度，如果是在供应商维度，直接往评分要素维度切换并调查询接口
      if (supplierDimension[key]) {
        if (scoresFlag) {
          this.saveAutoExpert();
        }
      }
    }
    this.setState({ activeKey });
  }

  // 切换标段自动保存
  @Bind()
  saveAutoExpert() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      [modelName]: { scoreElementList = {}, expAttachmentUuid },
      match: { params },
    } = this.props;
    const { activeKey, evaluateExpertId, expertAttachmentUuid } = this.state;
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
          const evaluateScoreLineDetailS = item.evaluateScoreLineDetailS.map((elementItem) => {
            const evaluateScoreDTOS = this.handleSaveExpert(elementItem);
            return {
              ...elementItem,
              evaluateScoreDTOS,
            };
          });
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
    const evaluateSuggestionDTOS = scoreElementList?.evaluateSuggestionDTOS?.map?.((item) => {
      return {
        ...item,
        expertSuggestion: this.supplierTable[supplierTableKey]?.props?.form?.getFieldValue?.(
          item.supplierCompanyName
        ),
      };
    });
    dispatch({
      type: `${modelName}/saveElementScoreing`,
      payload: {
        evaluateScoreLineDTOS,
        evaluateSuggestionDTOS,
        sourceHeaderId: params.sourceHeaderId,
        expertUserId: params.expertUserId,
        sourceFrom: params.sourceFrom,
        sectionFlag: scoreElementList.sectionFlag,
        expertAttachmentUuid: expAttachmentUuid || expertAttachmentUuid,
        evaluateExpertId,
      },
    }).then((res) => {
      if (res) {
        if (params.subjectMatterRule === 'PACK' && params.sourceFrom === 'BID') {
          // 分标段
          this.supplierTable[supplierTableKey].setState({ scoresFlag: false });
          const bidLineItemIds =
            scoreElementList.evaluateSectionDTOS &&
            scoreElementList.evaluateSectionDTOS.map((item) => item.bidLineItemId);
          this.fetchScoreElementList(bidLineItemIds);
        }
      }
    });
  }

  /**
   * 切换维度
   * 分标段，标段1，2,3, 点击切换到供应商维度，设为true { 1: true }
   * 不分标段, 点击切换到供应商维度，设为 { flag: true}
   * @memberof BidEvaluation
   */
  @Bind()
  async switchDimension() {
    const { activeKey, supplierDimension } = this.state;
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      [modelName]: { scoreElementList = {} },
      exportScoringBuss,
    } = this.props;
    const { subjectMatterRule, sourceFrom } = match.params;
    const tableKey = 'flag';

    let cuxEventResult = true;
    if (exportScoringBuss?.event) {
      // remoteTechInitDemesion 二开埋点方法名
      cuxEventResult = await exportScoringBuss.event.fireEvent('cuxBeforeSwitchDimension', {
        that: this,
      });

      if (cuxEventResult === false) {
        return;
      }
    }

    // 分标段
    if (subjectMatterRule === 'PACK' && sourceFrom === 'BID') {
      const { scoresFlag } = this.supplierTable?.[activeKey]?.state || {};
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
              this.saveElementDimensionExpert();
            },
            onCancel: () => {
              // eslint-disable-next-line no-unused-expressions
              this.supplierTable?.[activeKey]?.props?.form.resetFields?.();
              // eslint-disable-next-line no-unused-expressions
              this.supplierTable?.[activeKey]?.setState?.({ scoresFlag: false });
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
      const { scoresFlag } = this.supplierTable?.[tableKey]?.state || {};
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
            this.saveElementDimensionExpert();
          },
          onCancel: () => {
            // eslint-disable-next-line no-unused-expressions
            this.supplierTable?.[tableKey]?.props?.form?.resetFields?.();
            this.fetchScoreSupplierList();
            this.setState({ supplierDimension: { flag: !supplierDimension.flag } });
            // eslint-disable-next-line no-unused-expressions
            this.supplierTable?.[tableKey]?.setState?.({ scoresFlag: false });
          },
        });
      } else {
        this.props.dispatch({
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
   * 渲染分标段评分要素维度表格数据
   *
   * @param {*} [dataSource=[]]
   * @memberof Query
   */
  renderScoreElementList(dataSource = {}, bidLineItem = {}) {
    let scoreElementList = [];
    if (
      !isEmpty(dataSource.evaluateSectionDTOS) &&
      !isEmpty(
        dataSource.evaluateSectionDTOS.find(
          (element) => element.bidLineItemId === bidLineItem.bidLineItemId
        )
      )
    ) {
      scoreElementList = dataSource.evaluateSectionDTOS.find(
        (element) => element.bidLineItemId === bidLineItem.bidLineItemId
      ).evaluateScoreLineDTOS;
    }
    return scoreElementList;
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
        customizeUnitCode:
          item.team === 'TECHNOLOGY'
            ? 'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH'
            : item.team === 'BUSINESS'
            ? 'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS'
            : 'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH',
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
   * rf 跳转供应商回复详情
   *
   * @memberof search
   */
  @Bind()
  jumpSupplierReplyDetail(item = {}) {
    const { match, history } = this.props;
    const {
      sourceHeaderId,
      expertUserId,
      subjectMatterRule,
      expertSequenceNum,
      sourceFrom,
    } = match.params;
    const { routerParams = {} } = this.state;
    // 记录返回时的路由
    const search = querystring.stringify({
      backRecommend: 'expertDetailToSupplierReplyDetail',
      quotationHeaderId: item.quotationHeaderId,
    });
    history.push({
      pathname: `${this.activeTabKey}/reply-detail/${sourceFrom}/${sourceHeaderId}`,
      search,
    });
    const source = {
      label: 'expertDetailToSupplierReplyDetail',
      url: `${this.activeTabKey}/${sourceHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/${sourceFrom}/update?sourceHeaderId=${routerParams.sourceHeaderId}&cachTabKey=${routerParams.cachTabKey}&scoredStatus=${routerParams.scoredStatus}&evaluateLeaderFlag=${routerParams.evaluateLeaderFlag}&backRecommend=${routerParams.backRecommend}&evaluateExpertId=${routerParams.evaluateExpertId}&multiSectionFlag=${routerParams.multiSectionFlag}&sourceProjectId=${routerParams.sourceProjectId}&projectLineSectionId=${routerParams.projectLineSectionId}`,
    };
    sessionStorage.setItem('sourceRouter', JSON.stringify(source));
    sessionStorage.setItem(
      `expertDetailToSupplierReplyDetail+${this.activeTabKey}`,
      JSON.stringify(source)
    );
  }

  /**
   * rfp供应商行附件
   */
  @Bind()
  openUploadModal(record = {}) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      organizationId,
      [modelName]: { evaluateShowType },
    } = this.props;
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
            {evaluateShowType !== 'BUSS' && (
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
            )}
            {evaluateShowType !== 'TECH' && (
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
            )}
          </Row>
        </Fragment>
      ),
    });
  }

  /**
   * 物料头部明细
   */
  @Bind()
  renderHeaderInfo(item) {
    const {
      expand,
      hideBusinessBid,
      newQuotationFlag = false,
      routerParams: { sourceStatus, scoredStatus } = {},
      viewScoreTeam,
      tabActiveKey,
    } = this.state;
    const { modelName = 'expertScoring' } = this.props;
    const {
      match = {},
      organizationId,
      exportScoringBuss,
      [modelName]: { header },
    } = this.props;
    const { expertUserId, expertSequenceNum, sourceFrom, subjectMatterRule } = match?.params || {};

    let amountDom =
      sourceFrom !== 'RFI' && sourceFrom !== 'RFP' && !hideBusinessBid ? (
        <span
          style={{
            marginLeft: 50,
            // marginTop: '6px',
            minWidth: '80px',
            maxWidth: '250px',
            display: item.team === 'TECHNOLOGY' ? 'none' : 'inline-block',
          }}
        >
          <img src={require('@/assets/money.svg')} alt="" />{' '}
          {numberSeparatorRender(item.sectionAmount)}
        </span>
      ) : (
        ''
      );

    amountDom = exportScoringBuss
      ? exportScoringBuss.render(
          'SSRC_EXPERT_SCORING_BUSS_PROCESS_SUPPLIER_BUSS_SECTIONAMOUNT_DOM',
          amountDom,
          {
            supplier: item,
            that: this,
          }
        )
      : amountDom;

    const attachmentDom = (
      <span>
        {!newQuotationFlag || sourceFrom === 'BID' ? (
          <span
            onClick={(e) => this.rfxLineTag(e)}
            style={{
              marginLeft: '24px',
              marginTop: '6px',
              maxWidth: '150px',
              minWidth: '50px',
            }}
          >
            <a onClick={() => this.showUploadModal(item)}>
              <span>
                {intl.get(`hzero.common.upload.modal.title`).d('附件')}
                <RenderFileTotalCount
                  record={item}
                  uiType="h0"
                  fileCountName="totalDisplayFileAvr1Count"
                />
              </span>
              <span style={{ marginLeft: '8px' }}>
                <SVGIcon path={require('@/assets/file.svg')} className={styles['link-color']} />
              </span>
            </a>
          </span>
        ) : (
          <FileGroup
            record={item}
            uiType="h0"
            fileType="HEADER"
            queryParams={{
              expertScoreQueryFlag: 1,
              sourceStatus,
              team: item.team,
              // team: viewScoreTeam
              //   ? tabActiveKey === 'business'
              //     ? 'BUSINESS'
              //     : 'TECHNOLOGY'
              //   : item?.team,
              expertUserId,
              expertSequenceNum,
              sourceFrom,
              viewScoreTeam: viewScoreTeam
                ? tabActiveKey === 'business'
                  ? 'BUSINESS'
                  : 'TECHNOLOGY'
                : null,
              viewScoreFlag: item.scoreStatus === 'SCORED' ? 1 : 0,
              subjectMatterRule,
            }}
          />
        )}
      </span>
    );

    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              {this.renderScoreSvg(item)}
              <span className={styles.itemListNumLeft}>
                {item.companyNum ? (
                  <Tooltip
                    title={`${item.companyNum ? `${item.companyNum}--` : ''}${item.companyName}`}
                    placement="topLeft"
                  >
                    {item.companyNum ? `${item.companyNum}-` : null}
                    {item.companyName}
                  </Tooltip>
                ) : (
                  item.companyName
                )}
              </span>
              {sourceFrom !== 'RFI' && sourceFrom !== 'RFP' && (
                <span className={styles.itemListNumRight}>
                  <Icon
                    className="arrowIcon"
                    type={!expand[`${item.sectionId}#${item.quotationHeaderId}`] ? 'down' : 'up'}
                    onClick={(e) => this.expandItemLine(e, item.quotationHeaderId, item)}
                  />
                  {exportScoringBuss
                    ? exportScoringBuss.render(
                        'SSRC_EXPERT_SCORING_BUSS_RENDER_SUPPLIER_BUSS_DEVIATE',
                        null,
                        {
                          supplier: item,
                        }
                      )
                    : null}
                </span>
              )}
            </span>
            {amountDom}
            {/* {item.businessAttachmentUuid || item.techAttachmentUuid ? (
              <span
                onClick={(e) => this.rfxLineTag(e)}
                style={{ marginLeft: 24, marginTop: '6px', width: '40px', display: 'inline-block' }}
              >
                <a
                  onClick={() =>
                    this.showUploadModal(item.businessAttachmentUuid, item.techAttachmentUuid)
                  }
                >
                  {' '}
                  <span>{intl.get(`hzero.common.upload.modal.title`).d('附件')}</span>
                  <span style={{ marginLeft: '8px' }}>
                    <img src={require('@/assets/file.svg')} alt="" />
                  </span>
                </a>
              </span>
            ) : (
              <span style={{ marginLeft: 24, width: '40px', display: 'inline-block' }} />
            )} */}
            {sourceFrom === 'RFP' && (
              <span
                onClick={(e) => this.rfxLineTag(e)}
                style={{ marginLeft: 24, marginTop: '6px', minWidth: '50px', maxWidth: '150px' }}
              >
                <a onClick={() => this.openUploadModal(item)}>
                  <span>{intl.get(`hzero.common.upload.modal.title`).d('附件')}</span>
                  <span style={{ marginLeft: '8px' }}>
                    <SVGIcon path={require('@/assets/file.svg')} className={styles['link-color']} />
                  </span>
                </a>
              </span>
            )}
            {sourceFrom === 'RFI' && (
              <span
                onClick={(e) => this.rfxLineTag(e)}
                style={{ marginLeft: 24, marginTop: '6px', maxWidth: '150px', minWidth: '50px' }}
              >
                <Upload
                  filePreview
                  viewOnly
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rf-quotationheader"
                  attachmentUUID={item.rfiAttachmentUuid}
                  tenantId={organizationId}
                  btnText={intl.get(`hzero.common.upload.modal.title`).d('附件')}
                  // icon="download"
                />
              </span>
            )}
            {(sourceFrom === 'RFX' || sourceFrom === 'BID') &&
              (exportScoringBuss
                ? exportScoringBuss.render(
                    'SSRC_EXPERT_SCORING_BUSS_RENDER_SUPPLIER_ATTACHMENT',
                    attachmentDom,
                    {
                      item,
                      header,
                      scoredStatus,
                    }
                  )
                : attachmentDom)}
            {(sourceFrom === 'RFP' || sourceFrom === 'RFI') && (
              <span
                onClick={(e) => this.rfxLineTag(e)}
                style={{ marginLeft: 24, marginTop: '6px', width: '50px', display: 'inline-block' }}
              >
                <a onClick={() => this.jumpSupplierReplyDetail(item)}>
                  {intl.get(`${promptCode}.view.button.rfReplyDetail`).d('回复详情')}
                </a>
              </span>
            )}
            <span style={{ marginLeft: 24 }}>
              {item.suggestInvalidFlag ? (
                <img src={require('@/assets/suggestInvalid.svg')} alt="" />
              ) : null}
            </span>
            <span style={{ float: 'right' }}>
              <span style={{ marginRight: 10 }}>{this.renderScore(item)}</span>
              {this.renderScoreButton(item)}
            </span>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 渲染供应商维度
   *
   */
  @Bind()
  renderSupplier(supplier) {
    const { modelName = 'expertScoring' } = this.props;
    const { expand, hideBusinessBid, loadingObj = {}, doubleUnitFlag } = this.state;
    const {
      customizeTable,
      [modelName]: { header = {}, scoringQuotationList = [] },
      match,
    } = this.props;
    const itemLineProps = {
      header,
      match,
      customizeTable,
      scoringQuotationList,
      loadingObj,
      hideBusinessBid,
      onSearch: this.changePage,
      doubleUnitFlag,
    };
    return (
      <div>
        {map(supplier.evaluateScores, (item) => {
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
   * 渲染供应商维度
   *
   */
  @Bind()
  renderSupplierNone(supplier) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      expand,
      loadingObj,
      sourceCategory,
      hideBusinessBid,
      doubleUnitFlag,
      newQuotationFlag = false,
    } = this.state;
    const {
      customizeTable,
      organizationId,
      match,
      [modelName]: { header = {}, scoringQuotationList = [] },
    } = this.props;
    const itemLineProps = {
      match,
      header,
      customizeTable,
      scoringQuotationList,
      loadingObj,
      hideBusinessBid,
      onSearch: this.changePage,
      viewLadderLevel: this.viewLadderLevelModal,
      sourceCategory,
      doubleUnitFlag,
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
   * 渲染标段tabs
   */
  @Bind()
  renderTabs({ key: tableKey }) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { evaluateSectionList = [], scoreElementList = {}, code = {} },
      fetchScoreElementLoading,
      exportScoringBuss,
    } = this.props;
    const {
      activeKey,
      routerList,
      supplierDimension = {},
      routerParams = {},
      doubleUnitFlag = false,
      bidFlag,
    } = this.state;
    const scoreElementProps = {
      code,
      loading: fetchScoreElementLoading,
      scoreElementInfo: scoreElementList,
      scoredStatus: routerParams.scoredStatus,
      onRef: (key, node) => {
        this.supplierTable[key] = node;
      },
      doubleUnitFlag,
      exportScoringBuss,
      bidFlag,
    };
    const operations = (
      <React.Fragment>
        <a onClick={this.switchDimension}>
          {supplierDimension[activeKey]
            ? intl.get(`${promptCode}.view.button.swtSupplierDimension`).d('切换至供应商维度')
            : intl.get(`${promptCode}.view.button.swtScoreIndicDimension`).d('切换至评分要素维度')}
        </a>
      </React.Fragment>
    );
    return (
      <div>
        <Tabs
          activeKey={activeKey}
          className={styles.tabStyle}
          tabBarExtraContent={operations}
          onChange={this.changeTabs}
          animated={false}
        >
          {/* 循环标段数据,渲染tabs标段 */}
          {map(evaluateSectionList, (item) => {
            return (
              <Tabs.TabPane
                tab={this.renderTooTipTabs(item)}
                key={[item.bidLineItemId]}
                forceRender
              >
                <div
                  style={{
                    display: supplierDimension[item.bidLineItemId] ? 'block' : 'none',
                  }}
                >
                  {routerList.includes('RFX') ? (
                    <ScoreElementTable
                      {...scoreElementProps}
                      scoreElementList={this.renderScoreElementList(scoreElementList, item)}
                      bidLineItemId={item.bidLineItemId}
                      tableKey={tableKey} // 作为内部滚动类名
                    />
                  ) : (
                    <BidScoreElementTable
                      {...scoreElementProps}
                      scoreElementList={this.renderScoreElementList(scoreElementList, item)}
                      bidLineItemId={item.bidLineItemId}
                    />
                  )}
                </div>
                <div
                  style={{
                    display: supplierDimension[item.bidLineItemId] ? 'none' : 'block',
                  }}
                >
                  {this.renderSupplier(item)}
                </div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 渲染不区分标段tabs
   */
  @Bind()
  renderNormalTabs({ key: tableKey }) {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { evaluateScoreList = [], scoreElementList = {}, code = {} },
      fetchScoreElementLoading,
      customizeTable,
      exportScoringBuss,
      history,
      location,
      match,
    } = this.props;
    const { routerParams = {}, doubleUnitFlag = false, bidFlag } = this.state;
    const scoreElementProps = {
      code,
      customizeTable,
      loading: fetchScoreElementLoading,
      scoreElementInfo: scoreElementList,
      scoredStatus: routerParams.scoredStatus,
      onRef: (key, node) => {
        this.supplierTable[key] = node;
      },
      doubleUnitFlag,
      exportScoringBuss,
      bidFlag,
      history,
      location,
      match,
      parentInstance: this,
    };
    const { supplierDimension = {}, routerList } = this.state;
    return (
      <div>
        <div style={{ display: supplierDimension.flag ? 'block' : 'none' }}>
          {routerList.includes('RFX') ||
          routerList.includes('RFP') ||
          routerList.includes('RFI') ? (
            <ScoreElementTable
              {...scoreElementProps}
              scoreElementList={scoreElementList || []}
              bidLineItemId="flag"
              tableKey={tableKey} // 作为内部滚动类名
            />
          ) : (
            <BidScoreElementTable
              {...scoreElementProps}
              scoreElementList={scoreElementList.evaluateScoreLineDTOS || []}
              bidLineItemId="flag"
            />
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
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 跳转到澄清管理页面
   * 华住二开
   * @param {*} item
   * @param {*} e event点击事件 二开用
   */
  @Bind()
  jumpToClarify = (item, e) => {
    const { modelName = 'expertScoring' } = this.props;
    const {
      history,
      match,
      [modelName]: { settings = {} },
      location: { pathname, search: datas },
    } = this.props;
    const {
      routerParams: { sourceStatus },
      templateConfig = {},
    } = this.state;
    const { sourceHeaderId, sourceFrom = 'SCORING' } = match.params;
    const { quotationHeaderId } = item;

    const routerPrefix = pathname.split('/')[2];
    const routerName = sourceFrom === 'BID' ? 'bid' : 'rfx';

    // 非IIE
    if (e && e.stopPropagation) {
      e.stopPropagation();
    } else {
      window.event.cancelBubble = true;
    }

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
        backPath: `${pathname}${datas}`,
      });
      history.push({
        pathname: `${this.activeTabKey}/review-clarification`, // todo
        search,
      });
    } else {
      const search = querystring.stringify({
        quotationHeaderId,
        sourceFrom,
        sourceStatus,
        sourceHeaderId,
        fromFlag: 1,
        backPath: `${pathname}${datas}`,
      });
      history.push({
        pathname: `/ssrc/${routerPrefix}/${routerName}-review-clarification`, // expert-scoring
        search,
      });
    }
  };

  /**
   * renderScoreButton
   * 评分操作
   */
  @Bind()
  renderScoreButton(data) {
    const { routerParams } = this.state;
    const { checkScore } = routerParams;
    const { modelName = 'expertScoring', dispatch } = this.props;
    const {
      exportScoringBuss,
      history,
      match,
      [modelName]: { evaluateScoreList = [], header = {} },
    } = this.props;
    let scoreName = intl.get(`${promptCode}.model.expertScoring.startScore`).d('开始评分');

    const item = exportScoringBuss
      ? exportScoringBuss.process('SSRC_EXPERT_SCORING_PROCESS_BUTTONS_DATA', data, {
          that: this,
          data,
        })
      : data;

    switch (item.scoreStatus) {
      case '':
        scoreName = intl.get(`${promptCode}.model.expertScoring.startScore`).d('开始评分');
        break;
      case 'NEW':
        scoreName = intl.get(`${promptCode}.model.expertScoring.modifyScore`).d('修改评分');
        break;
      case 'SCORED':
        scoreName = intl.get(`${promptCode}.model.expertScoring.viewScore`).d('查看评分');
        break;
      case 'RESCORING':
        scoreName = intl.get(`${promptCode}.model.expertScoring.restartScore`).d('重新评分');
        break;
      default:
        break;
    }
    const reviewClarifiedBtn = (
      <Tooltip
        title={intl
          .get(`${promptCode}.model.expertScoring.reviewClarifiedNotify`)
          .d('适用于供应商投标文件中存在含义不明，前后表述不一致，需供应商解答问题的情况')}
        name="reviewClarifiedBtn" // 二开使用此name 勿动！！！ 若要修改dom层级，请在最外层加上这个name
      >
        <Badge count={item.reviewUnreadCount} offset={[0, -10]} className={styles['badge-item']}>
          <Button
            type="default"
            style={{
              marginRight: 5,
            }}
            disabled={checkScore === 'checkScore'}
            onClick={(e) => this.jumpToClarify(item, e)}
          >
            {intl.get(`${promptCode}.model.expertScoring.reviewClarified`).d('评审澄清')}
          </Button>
        </Badge>
      </Tooltip>
    );
    /** ********* 万国二开评分按钮-勿动!!! *********** */
    const scoreBtn = (
      <Button
        type="primary"
        style={{ border: 0 }}
        onClick={(e) => this.onScoring(e, item)}
        name="scoreBtn" // 二开使用此name 勿动！！！ 若要修改dom层级，请在最外层加上这个name
      >
        {scoreName}
      </Button>
    );

    const buttons = [reviewClarifiedBtn, scoreBtn];
    if (!exportScoringBuss) {
      return buttons;
    }
    const otherProps = {
      routerParams,
      history,
      item,
      match,
      evaluateScoreList,
      _this: this,
      dispatch,
      header,
      scoreBtn,
    };
    return exportScoringBuss.process(
      'SSRC_EXPERT_SCORING_SUPPLIER_HEADER_BUTTONS',
      buttons,
      otherProps
    );
  }

  /**
   * renderScoreSvg
   * 评分操作
   */
  @Bind()
  renderScoreSvg(item) {
    let img = <img src={require('@/assets/supplier-gray.svg')} alt="" />;
    switch (item.scoreStatus) {
      case '':
        img = <img src={require('@/assets/supplier-gray.svg')} alt="" />;
        break;
      case 'NEW':
        img = <img src={require('@/assets/supplier-gray.svg')} alt="" />;
        break;
      case 'SCORED':
        img = <img src={require('@/assets/supplier.svg')} alt="" />;
        break;
      case 'RESCORING':
        img = <img src={require('@/assets/supplier-red.svg')} alt="" />;
        break;
      default:
        break;
    }
    return <span>{img}</span>;
  }

  /**
   *渲染评分
   */
  @Bind()
  renderScore(item = {}) {
    const evaluateTeamDTOList = item.evaluateTeamDTOList || [];
    return (
      <span>
        {map(evaluateTeamDTOList, (key) => {
          return this.renderTagTeams(key);
        })}
      </span>
    );
  }

  /**
   * renderTagTeams
   * 渲染分数
   * @returns {*}
   */
  @Bind()
  renderTagTeams(key) {
    let name = '';
    let backColor = '';
    let color = '';
    let width = '';
    switch (key.team) {
      case 'TECHNOLOGY':
        name = `${intl
          .get(`ssrc.inquiryHall.view.message.tab.technicalGroupSummary`)
          .d('技术组汇总')}`;
        backColor = 'rgba(6, 135, 255, 0.2)';
        color = '#0687FF';
        width = '108px';
        break;
      case 'BUSINESS':
        name = `${intl
          .get(`ssrc.inquiryHall.view.message.tab.businessGroupSummary`)
          .d('商务组汇总')}`;
        backColor = 'rgba(255, 188, 0, 0.2)';
        color = '#FFBC00';
        width = '108px';
        break;
      case 'BUSINESS_TECHNOLOGY':
        name = intl.get(`ssrc.inquiryHall.model.inquiryHall.summary`).d('汇总');
        backColor = 'rgba(241, 49, 49, 0.2)';
        color = '#F13131';
        width = '75px';
        break;
      default:
        break;
    }
    return (
      <span>
        {isNumber(key.sumIndicScore) ? (
          <Tooltip
            placement="topLeft"
            title={`${name}:${key.sumPassStatus || numberRender(key.sumIndicScore, 2, false)}`}
          >
            <Tag
              style={{
                background: backColor,
                color,
                border: 0,
                verticalAlign: 'middle',
                display: 'inline-block',
                textOverflow: 'ellipsis',
                overflowX: 'hidden',
                maxWidth: 200,
                minWidth: 75,
              }}
            >
              {name}:{key.sumPassStatus || numberRender(key.sumIndicScore, 2, false)}
            </Tag>
          </Tooltip>
        ) : (
          <span style={{ width, display: 'inline-block' }} />
        )}
      </span>
    );
  }

  /**
   * renderExpertDetailModal
   * 渲染专家评分侧滑弹框
   */
  @Bind()
  renderExpertDetailModal(expertDetailProps) {
    const { customizeForm, customizeTable } = this.props;
    let mean = '';
    const { routerList, scoreIndicFlag, bidFlag } = this.state;
    const modalProps = {
      bidFlag,
      customizeForm,
      customizeTable,
      ...expertDetailProps,
    };
    if (scoreIndicFlag) {
      if (routerList.includes('RFX') || routerList.includes('RFP') || routerList.includes('RFI')) {
        mean = <ExpertDetailModal {...modalProps} />;
      } else {
        mean = <BidExpertDetailModal {...modalProps} />;
      }
    }
    return mean;
  }

  /**
   * 汇率编辑/查询供应商信息
   *
   * @param {*} [page={}]
   * @memberof CheckPrice
   */
  querySupplierExchangeEdit(date = {}) {
    const {
      organizationId,
      dispatch,
      modelName = 'expertScoring',
      match: {
        params: { sourceHeaderId = null, sourceFrom = null },
      },
    } = this.props;

    dispatch({
      type: `${modelName}/querySupplierExchangeEdit`,
      payload: {
        ...date,
        organizationId,
        sourceHeaderId,
        sourceFrom,
      },
    });
  }

  /**
   * 汇率编辑
   *
   * @memberof CheckPrice
   */
  @Bind()
  exchangeEdit(date = {}) {
    this.querySupplierExchangeEdit(date);
    this.setState({
      exchangeEditModalVisible: true,
    });
  }

  /**
   * 汇率编辑 取消
   *
   * @memberof CheckPrice
   */
  @Bind()
  cancelExchangeEdit() {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        exchangeEditSupplierList: [],
      },
    });

    this.setState({
      exchangeEditModalVisible: false,
    });
  }

  /**
   * 汇率编辑 保存
   *
   * @memberof CheckPrice
   */
  @Bind()
  saveExchangeEdit() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { exchangeEditSupplierList = [] },
    } = this.props;

    const newParams = getEditTableData(exchangeEditSupplierList, []);

    if (isEmpty(newParams)) {
      return;
    }

    dispatch({
      type: `${modelName}/saveExchangeEdit`,
      payload: {
        organizationId,
        newParams,
      },
    }).then((res) => {
      if (!res) {
        return;
      }

      notification.success();
      this.cancelExchangeEdit();
      this.fetchScoreSupplierList();
      this.setState({
        expand: {},
      });
    });
  }

  /**
   * 引用汇率主数据
   *
   * @memberof CheckPrice
   */
  @Bind()
  quoteExchangeMainData() {
    this.setState({
      exchangeEditContentModalVisible: true,
    });
  }

  /**
   * 引用汇率主数据弹窗确定
   *
   * @memberof CheckPrice
   */
  @Bind()
  quoteExchangeMainDataOk() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { exchangeEditSupplierList = [] },
    } = this.props;
    const {
      props: {
        form: { validateFields },
      },
    } = this.exchangeRate;

    validateFields((err, values = {}) => {
      if (err || isEmpty(exchangeEditSupplierList)) {
        return;
      }

      const rateDate = values.rateDate ? values.rateDate.format(DEFAULT_DATE_FORMAT) : null;
      this.querySupplierExchangeEdit({
        rateTypeCode: values.rateTypeCode,
        rateDate,
      });

      this.quoteExchangeMainDataCancel();
    });
  }

  /**
   * 引用汇率主数据
   *
   * @memberof CheckPrice
   */
  @Bind()
  quoteExchangeMainDataCancel() {
    this.setState({
      exchangeEditContentModalVisible: false,
    });
  }

  /**
   * 关闭报价模板
   *
   * @memberof Update
   */
  @Bind()
  closeQuotationData() {
    const { modelName = 'expertScoring' } = this.props;
    this.setState({
      itemRecord: {},
      itemQuotationDetailModalVisible: false,
    });
    const { dispatch } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        QuotationDetailDataSource: {},
        itemQuotationDetail: [],
        itemQuotationPagination: {},
      },
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
    const { modelName = 'expertScoring' } = this.props;
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
    const {
      dispatch,
      organizationId,
      [modelName]: { header = {} },
    } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelTable`,
      payload: {
        quotationLineId,
        organizationId,
        customizeUnitCode: `SSRC.${
          header.secondarySourceCategory !== 'NEW_BID' ? 'INQUIRY' : 'NEW_BID'
        }_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`,
      },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    const { modelName = 'expertScoring' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  // 获取参数值
  getRouterParams() {
    const {
      location: { search = {} },
    } = this.props;
    return querystring.parse(search.substr(1)) || {};
  }

  // 获取返回路径
  getBackPath(routerParams = {}) {
    const { exportScoringBuss } = this.props;
    const { cachTabKey = null, sourcePage = null, sourceFrom } = routerParams;
    const { activeTabKey } = this;
    let path = `${activeTabKey}/list?${cachTabKey}`;
    if (sourcePage === 'RFXLIST') {
      path = `${activeTabKey}/list`;
    }
    if (['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(this.activeTabKey)) {
      path = `${activeTabKey}/list?sourceCategory=${sourceFrom || 'RFX'}`;
    }

    path = exportScoringBuss
      ? exportScoringBuss.process('SSRC_EXPERT_SCORING_BUSS_PROCESS_BACKPATH', path, {
          that: this,
          routerParams,
        })
      : path;

    return path;
  }

  renderHeaderButtons() {
    const {
      routerParams = {},
      expertAttachmentUuid,
      supplierDimension = {},
      activeKey,
      hideBusinessBid,
      headerInfoObj,
      showExchangeEdit,
      evaluateExpertId,
      bidFlag,
      operateLoading = false,
    } = this.state;
    const { modelName = 'expertScoring', exportScoringBuss, dispatch } = this.props;
    const {
      [modelName]: { header = {}, expAttachmentUuid = null, evaluateScoreList = [] },
      history,
      organizationId,
      match,
      submitExpertLoading,
      saveExpertLoading,
      submitElementExpertLoading,
      querySupplierExchangeEditLoading,
      location,
      fetchScoreElementLoading,
    } = this.props;
    const { sourceFrom, sourceHeaderId, expertSequenceNum } = match.params || {};
    // price clarification button
    const PriceButtonProps = {
      header,
      history,
      sourceFrom,
      sourceHeaderId,
      organizationId,
      getRouterParams: this.getRouterParams,
      name: 'viewResponseDetail',
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      priceRepliedCount: header.priceRepliedCount,
      remote: exportScoringBuss,
      remotePrefix: 'SSRC_EXPERT_SCORING',
    };
    let submit = null;
    let save = null;
    let upload = null;
    let exchangeButton = null;
    let assistant = null;
    let viewResponseDetail = null;
    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag } = header || {};
    const priceComparisonProps = {
      sourceCategory,
      rfxId: match.params.sourceHeaderId,
      history,
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };
    if (
      (routerParams.cachTabKey || '').includes('scoreing') &&
      routerParams.scoredStatus !== 'SCORED'
    ) {
      if (supplierDimension[activeKey] || supplierDimension.flag) {
        submit = (
          <Button
            icon="check"
            onClick={this.submitElementExpert}
            type="primary"
            name="submitButton"
            loading={submitElementExpertLoading || saveExpertLoading || operateLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        );
      } else {
        submit = (
          <Button
            icon="check"
            onClick={this.submitExpert}
            type="primary"
            name="submitButton"
            loading={submitExpertLoading || saveExpertLoading || operateLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        );
      }
    }

    if (routerParams.cachTabKey === 'scoreing' && routerParams.scoredStatus !== 'SCORED') {
      if (match.params.subjectMatterRule === 'PACK' && match.params.sourceFrom === 'BID') {
        if (supplierDimension[activeKey]) {
          save = (
            <Button
              icon="save"
              // disabled={!supplierDimension[activeKey]}
              onClick={this.saveExpert}
              loading={
                submitExpertLoading ||
                saveExpertLoading ||
                operateLoading ||
                fetchScoreElementLoading
              }
              name="saveButton"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          );
        }
      } else if (supplierDimension.flag) {
        save = (
          <Button
            icon="save"
            // disabled={!supplierDimension.flag}
            onClick={this.saveExpert}
            loading={
              submitExpertLoading || saveExpertLoading || operateLoading || fetchScoreElementLoading
            }
            name="saveButton"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        );
      }
    }

    if (routerParams.cachTabKey === 'scoreing') {
      upload = (
        <div className={styles['m-r-m']} name="uploadButton">
          <Upload
            btnText={
              routerParams.scoredStatus !== 'SCORED'
                ? intl.get(`hzero.common.upload.text`).d('上传附件')
                : intl.get(`hzero.common.upload.view`).d('查看附件')
            }
            // bucketName="ssrc-rfx-quotationheader" // 预定表
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={expAttachmentUuid || expertAttachmentUuid}
            tenantId={organizationId}
            fileSize={FIlESIZE}
            afterOpenUploadModal={this.handleAfterOpenModal}
            viewOnly={routerParams.scoredStatus === 'SCORED'}
            filePreview
            {...ChunkUploadProps}
          />
        </div>
      );
    } else {
      upload = (
        <div className={styles['m-r-m']} name="uploadButton">
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
    }

    if (
      header.multiCurrencyFlag &&
      header.expertScoreType === 'ONLINE' &&
      routerParams.evaluateLeaderFlag === '1' &&
      showExchangeEdit
    ) {
      exchangeButton = (
        <Button
          icon="edit"
          onClick={() => this.exchangeEdit()}
          loading={querySupplierExchangeEditLoading}
          style={{ marginRight: '8px' }}
          name="exchangeButton"
        >
          {intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑')}
        </Button>
      );
    }

    // 寻源&&评分&&非技术组
    if (
      !isEmpty(header) &&
      !hideBusinessBid &&
      match.params.sourceFrom === 'RFX' &&
      (routerParams.scoredStatus === 'NEW' || routerParams.scoredStatus === 'RESCORING') &&
      header.scoringProgress !== 'TECHNOLOGY' &&
      header.currentUserScoreTeam !== 'TECHNOLOGY'
    ) {
      assistant = (
        <Button
          type="default"
          onClick={() => this.handleRenderPriceComparison(priceComparisonProps)}
          style={{ marginRight: '8px' }}
          name="assistantButton"
        >
          <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
          {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
        </Button>
      );
    }

    // 价格澄清 visible
    let priceClarifyVisible =
      routerParams.evaluateLeaderFlag === '1' &&
      ['BUSINESS', 'BUSINESS_TECHNOLOGY'].includes(header.scoringProgress) &&
      match.params.sourceFrom !== 'RFP' &&
      match.params.sourceFrom !== 'RFI';

    priceClarifyVisible = exportScoringBuss
      ? exportScoringBuss.process(
          'SSRC_EXPERT_SCORING_PROCESS_PRICECLARIFY_BUTTON_VISIBLE',
          priceClarifyVisible,
          {
            that: this,
          }
        )
      : priceClarifyVisible;

    if (priceClarifyVisible) {
      viewResponseDetail = <PriceClarificationButtons {...PriceButtonProps} />;
    }

    const transferButton = (
      <PermissionButton
        onClick={this.showExpertModal}
        style={{ marginRight: '8px' }}
        type="c7n-pro"
        icon="call_missed_outgoing"
        permissionList={[
          {
            code: `expertScoring.update.button.transfer`,
            type: 'button',
            meaning:
              intl.get(`${promptCode}.view.message.title.expertScoring`).d('专家评分') -
              intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交'),
          },
        ]}
        name="transferButton"
      >
        {intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
      </PermissionButton>
    );
    const buttons = [
      submit,
      save,
      upload,
      exchangeButton,
      assistant,
      viewResponseDetail,
      transferButton,
    ].filter(Boolean);
    if (!exportScoringBuss) {
      return buttons;
    }
    const otherProps = {
      header,
      headerInfoObj,
      routerParams,
      history,
      evaluateScoreList,
      match,
      dispatch,
      sourceFrom: routerParams.sourceFrom,
      rfxHeaderId: sourceHeaderId,
      scoredStatus: routerParams.scoredStatus,
      cachTabKey: routerParams.cachTabKey,
      _this: this,
      activeTabKey: this.activeTabKey,
      location,
      evaluateExpertId,
      bidFlag,
      expertSequenceNum,
      queryExpertScoring: this.queryExpertScoring,
    };

    return exportScoringBuss.process('SSRC_EXPERT_SCORING_HEADER_BUTTONS', buttons, otherProps);
  }

  @Bind()
  transfer(selectRow, otherParams = {}) {
    const { modelName = 'expertScoring' } = this.props;
    if (isEmpty(selectRow)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    const {
      match,
      history,
      dispatch,
      [modelName]: { header = {} },
    } = this.props;
    const { evaluateExpertId } = this.state;
    const { sourceFrom, sourceHeaderId } = match.params || {};
    const routerPath = this.getBackPath();
    if (header.expertSource === 'EXPERT_LIBRARY') {
      const { expertId, userId } = selectRow;
      dispatch({
        type: `${modelName}/transfer`,
        payload: {
          expertId,
          sourceFrom,
          sourceHeaderId,
          evaluateExpertId,
          expertUserId: userId,
          ...otherParams,
        },
      }).then((res) => {
        if (res) {
          history.push(routerPath);
          this.setState({
            expertModalVisible: false,
          });
        }
      });
    } else {
      const { id } = selectRow;
      dispatch({
        type: `${modelName}/transfer`,
        payload: {
          sourceFrom,
          sourceHeaderId,
          expertUserId: id,
          evaluateExpertId,
          ...otherParams,
        },
      }).then((res) => {
        if (res) {
          history.push(routerPath);
          this.setState({
            subAccountVisible: false,
          });
        }
      });
    }
  }

  @Bind()
  closeTransferModal() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    if (header.expertSource === 'EXPERT_LIBRARY') {
      this.setState({
        expertModalVisible: false,
      });
    } else {
      this.setState({
        subAccountVisible: false,
      });
    }
  }

  @Bind()
  showExpertModal() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    if (header.expertSource === 'EXPERT_LIBRARY') {
      this.setState({
        expertModalVisible: true,
      });
    } else {
      this.setState({
        subAccountVisible: true,
      });
    }
  }

  // 切换商务组技术组tab
  @Bind()
  changeTabActiveKey(activeKey) {
    const {
      routerParams: { checkScore },
      headerInfoObj,
    } = this.state;
    const { exportScoringBuss } = this.props;

    this.setState(
      {
        tabActiveKey: activeKey,
        expand: {},
        supplierDimension: {
          flag: exportScoringBuss
            ? exportScoringBuss.process(
                'SSRC_EXPERT_SCORING_BUSS_PROCESS_DEFAULT_DIMENSION',
                false,
                {
                  headerInfoObj,
                }
              )
            : false,
        },
      },
      () => {
        if (checkScore === 'checkScore') {
          const eventProps = {
            headerInfoObj,
            switchDimension: this.switchDimension,
          };
          if (remote?.event) {
            // remoteTechInitDemesion 二开埋点方法名
            remote.event.fireEvent('remoteTechInitDemesion', eventProps);
          } else {
            this.switchDimension();
          }
          // this.switchDimension();
        }
        this.fetchScoreSupplierList();
      }
    );
  }

  /**
   * 渲染content
   */
  renderContent() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      match,
      queryScoringSupplierLoading,
      exportScoringBuss,
      [modelName]: { header = {}, scoreElementList = {}, evaluateScoreList = [] },
    } = this.props;
    const { sourceFrom } = match?.params || {};
    const {
      sectionFlag,
      routerParams = {},
      supplierDimension = {},
      tabActiveKey = '',
      viewScoreTeam = '',
      openBidOrder = 'BUSINESS_FIRST',
      headerInfoObj = {},
      templateConfig,
      viewDocumentFlag = 0,
    } = this.state;

    //  RFX:rfxNum rfxTitle   RFI/RFP: rfNum rfTitle BID：bidNum bidTitle
    const sourceFromType = {
      RFX: 'rfx',
      BID: 'bid',
      RFI: 'rf',
      RFP: 'rf',
    };

    // 头标题num
    const headerNum = headerInfoObj[`${sourceFromType[sourceFrom]}Num`]
      ? `${headerInfoObj[`${sourceFromType[sourceFrom]}Num`]}--`
      : '';

    // 获取dom
    const RenderContent = ({ key }) => {
      const docLink = viewDocumentFlag ? (
        <Tooltip
          title={
            match.params.sourceFrom === 'BID'
              ? intl.get(`${promptCode}.view.title.clickViewBidbook`).d('点击查看招标书')
              : match.params.sourceFrom === 'RFX'
              ? intl.get(`${promptCode}.view.title.clickViewInquiryOrder`).d('点击查看单据')
              : intl.get(`${promptCode}.view.title.clickViewRFBook`).d('点击查看征询书')
          }
          placement="topLeft"
          style={{
            float: 'left',
          }}
        >
          <span
            style={{ marginLeft: '20px' }}
            onClick={() => this.jumpBid(routerParams.sourceHeaderId)}
          >
            <SVGIcon
              path={require('@/assets/bid-view.svg')}
              style={{ width: '13px', height: '13px', marginRight: '5px' }}
              className={styles['link-color']}
            />
          </span>
        </Tooltip>
      ) : (
        ''
      );

      const switchDimensionNode = (
        <span style={{ float: 'right', fontWeight: 'normal', fontSize: '12px' }}>
          <a onClick={this.switchDimension}>
            {supplierDimension.flag
              ? intl.get(`${promptCode}.view.button.swtSupplierDimension`).d('切换至供应商维度')
              : intl
                  .get(`${promptCode}.view.button.swtScoreIndicDimension`)
                  .d('切换至评分要素维度')}
          </a>
        </span>
      );

      let switchDimensionNodeShow = match.params?.subjectMatterRule === 'NONE';
      switchDimensionNodeShow = exportScoringBuss
        ? exportScoringBuss.process(
            'SSRC_EXPERT_SCORING_BUSS_SWITCHDIMENSIONNODE_SHOW',
            switchDimensionNodeShow,
            {
              header,
              supplierDimension,
              routerParams,
              scoreElementList,
              evaluateScoreList,
              templateConfig,
              currentTabKey: key,
              viewScoreTeam,
              that: this,
            }
          )
        : switchDimensionNodeShow;

      return (
        <Spin spinning={queryScoringSupplierLoading}>
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
              <Tooltip title={`${headerNum}${headerInfoObj[`${sourceFromType[sourceFrom]}Title`]}`}>
                {headerInfoObj[`${sourceFromType[sourceFrom]}Title`] ?? ''}
              </Tooltip>
            </span>
            {exportScoringBuss
              ? exportScoringBuss.render('SSRC_EXPERT_SCORING_BUSS_RENDER_DOCLINK', docLink, {
                  header,
                  supplierDimension,
                  routerParams,
                  scoreElementList,
                  evaluateScoreList,
                  templateConfig,
                  currentTabKey: key,
                  viewScoreTeam,
                })
              : docLink}
            {switchDimensionNodeShow ? switchDimensionNode : ''}
          </div>
          <div style={{ marginTop: '24px' }}>
            {sectionFlag ? this.renderTabs({ key }) : this.renderNormalTabs({ key })}
          </div>
        </Spin>
      );
    };
    return (
      <Content>
        {viewScoreTeam ? (
          <Tabs activeKey={tabActiveKey} onChange={this.changeTabActiveKey}>
            {openBidOrder === 'BUSINESS_FIRST' ? (
              <>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.inquiryHall.view.message.tab.businessGroup`).d('商务组')}
                  key="business"
                >
                  {RenderContent({ key: 'business' })}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.inquiryHall.view.message.tab.technicalGroup`).d('技术组')}
                  key="technology"
                >
                  {RenderContent({ key: 'technology' })}
                </Tabs.TabPane>
              </>
            ) : (
              <>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.inquiryHall.view.message.tab.technicalGroup`).d('技术组')}
                  key="technology"
                >
                  {RenderContent({ key: 'technology' })}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.inquiryHall.view.message.tab.businessGroup`).d('商务组')}
                  key="business"
                >
                  {RenderContent({ key: 'business' })}
                </Tabs.TabPane>
              </>
            )}
          </Tabs>
        ) : (
          RenderContent({ key: 'none' })
        )}
      </Content>
    );
  }

  // overide 追觅
  renderPriceComparison(priceComparisonProps) {
    const { bidFlag = false } = this.state;
    return bidFlag ? (
      <BidPriceComparison {...priceComparisonProps} />
    ) : (
      <PriceComparison {...priceComparisonProps} />
    );
  }

  @Bind()
  handleRenderPriceComparison(priceComparisonProps) {
    C7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: C7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceComparison(priceComparisonProps),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  render() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      scoreFlag,
      routerParams = {},
      AttachmentsProps,
      attachmentVisible,
      exchangeEditModalVisible = false,
      exchangeEditContentModalVisible = false,
      // priceComparisonModalVisible = false,
      viewLadderLevelVisible = false,
      LadderLevelHeaderData = {},
      expertModalVisible,
      subAccountVisible,
      doubleUnitFlag = false,
      bidFlag = false,
    } = this.state;
    const {
      [modelName]: {
        scoringRightDeatilHeader = {},
        scoringRightDeatilLine = [],
        code = {},
        exchangeEditSupplierList = [],
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
      querySupplierExchangeEditLoading,
      saveExchangeEditLoading,
      fetchLadderLevelTableLoading,
      customizeBtnGroup = () => {},
      exportScoringBuss,
    } = this.props;
    const { sourceHeaderId } = match.params || {};
    const {
      sourceProjectId,
      sourceStatus,
      scoredStatus,
      cachTabKey,
      projectLineSectionId,
    } = routerParams;

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
      save: this.onSaveScoring,
      back: this.onBackScoring,
    };

    // exchange edit props
    const ExchangeEditProps = {
      exchangeEditModalVisible,
      cancelExchangeEdit: this.cancelExchangeEdit,
      quoteExchangeMainData: this.quoteExchangeMainData,
      saveExchangeEdit: this.saveExchangeEdit,
      querySupplierExchangeEditLoading,
      exchangeEditSupplierList,
      saveExchangeEditLoading,
      querySupplierExchangeEdit: this.querySupplierExchangeEdit,
    };

    // 汇率编辑-引用汇率主数据弹窗
    const ExchangeQuoteProps = {
      form,
      organizationId,
      exchangeEditContentModalVisible,
      quoteExchangeMainDataOk: this.quoteExchangeMainDataOk,
      quoteExchangeMainDataCancel: this.quoteExchangeMainDataCancel,
      onRef: (node) => {
        this.exchangeRate = node;
      },
    };

    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
      doubleUnitFlag,
    };

    const expertModalProps = {
      visible: expertModalVisible,
      onOk: this.transfer,
      onCancel: this.closeTransferModal,
    };

    const subAccountProps = {
      visible: subAccountVisible,
      onOk: this.transfer,
      onCancel: this.closeTransferModal,
      remote: exportScoringBuss,
      remoteCode: 'SSRC_EXPERT_SCORING_BUSS',
      bidFlag,
    };

    const sectionPanelProps = {
      rowKey: 'sourceHeaderId',
      isSection: !!projectLineSectionId,
      parentPage: {
        name: cachTabKey === 'scoreing' ? 'expertScoring' : 'expertScored',
        queryParams: {
          sourceStatus,
          sourceProjectId,
          operation: scoredStatus === 'SCORED' ? 'VIEW_SCORE' : 'SCORE',
        },
      },
      activeRowId: sourceHeaderId,
      displayName: 'sectionName',
      afterOpenSection: this.replaceRoute,
      beforeOpenSection: scoredStatus !== 'SCORED' && this.saveData,
    };

    let currentFileModalProps = {};
    currentFileModalProps = exportScoringBuss
      ? exportScoringBuss.process(
          'SSRC_EXPERT_SCORING_BUSS_PROCESS_OLDER_FILE_MODAL_PROPS',
          {},
          {
            AttachmentsProps,
            that: this,
          }
        )
      : {};

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.expertScoring`).d('专家评分')}
          backPath={this.getBackPath(routerParams)}
        >
          {customizeBtnGroup(
            { code: 'SSRC.EXPERT_SCORE_SCORING.HEADER_BUTTONS' },
            this.renderHeaderButtons()
          )}
        </Header>
        {projectLineSectionId ? (
          <SectionPanel {...sectionPanelProps}> {this.renderContent()}</SectionPanel>
        ) : (
          this.renderContent()
        )}
        {this.renderExpertDetailModal(expertDetailProps)}
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          title={intl.get('hzero.common.title.checkAttach').d('查看附件')}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={1000}
          {...(currentFileModalProps || {})}
        >
          <QuoteAttachment {...AttachmentsProps} />
        </Modal>
        {/** 汇率编辑modal */}
        {exchangeEditModalVisible && <ExchangeEditModal {...ExchangeEditProps} />}
        {/** 引用汇率编辑modal */}
        {exchangeEditContentModalVisible && <QuoteExchangeMainDateModal {...ExchangeQuoteProps} />}
        {/* {priceComparisonModalVisible && this.renderPriceComparison(priceComparisonProps)} */}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
        {expertModalVisible && <ExpertLibraryModal {...expertModalProps} />}
        {subAccountVisible && <SubAccount {...subAccountProps} />}
      </React.Fragment>
    );
  }
}

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH_RFX',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_RFX',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX',
        'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX',
        'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_DETAIL_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI',
        'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_BID',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_BID',
        'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_BID',
        'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_BID',
        'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_EDIT_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_BUTTONS',
      ],
    }),
    connect(({ expertScoring, loading }) => ({
      expertScoring,
      queryScoringSupplierLoading: loading.effects['expertScoring/fetchScoringSupplier'],
      queryScoringQuotationLoading: loading.effects['expertScoring/fetchScoringQuotation'],
      queryScoringHeaderLoading: loading.effects['expertScoring/fetchScoringHeader'],
      queryScoringIndicLoading: loading.effects['expertScoring/fetchScoringIndic'],
      savePreApplyLoading: loading.effects['expertScoring/savePretrialApplication'],
      submitPreApplyLoading: loading.effects['expertScoring/submitPretrialApplication'],
      saveScoreingLoading: loading.effects['expertScoring/saveScoreing'],
      fetchScoreElementLoading: loading.effects['expertScoring/fetchScoreElementList'],
      submitExpertLoading: loading.effects['expertScoring/submitScoreing'],
      saveExpertLoading: loading.effects['expertScoring/saveElementScoreing'],
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
        'scux.ssrc',
      ],
    }),
    Form.create({ fieldNameProp: null })
  )(
    remote(
      {
        code: 'SSRC_EXPERT_SCORING_BUSS',
        name: 'exportScoringBuss',
      },
      {
        events: {
          remoteTechInitDemesion(eventProps) {
            const { switchDimension = () => {} } = eventProps;
            switchDimension();
          },
          remoteSubmitElementExpert(eventProps) {
            const { handleSubmit = () => {} } = eventProps;
            handleSubmit();
          },
          remoteSubmitExpert(eventProps) {
            const { handleSubmit = () => {} } = eventProps;
            handleSubmit();
          },
          remoteStartScore(eventProps) {
            const { startScoreFunc = () => {} } = eventProps;
            startScoreFunc();
          },
          afterLoadedPageCuxHandle() {}, // cux
          cuxBeforeSwitchDimension() {},
        },
      }
    )(com)
  );

export default hocComponent(ExpertScoring);
export { ExpertScoring, hocComponent };
