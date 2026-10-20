/**
 * bidHall - 招标服务/详情
 * @date: 2019-6-10
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Modal, Table, Button, Steps } from 'hzero-ui';
import { sum, isNumber, isEmpty, isUndefined, isNull, compose } from 'lodash';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { getActiveTabKey } from 'utils/menuTab';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { API_HOST } from 'utils/config';
import { getCurrentOrganizationId, getCurrentUserId, getAccessToken } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { downloadFile } from 'hzero-front/lib/services/api';

import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import SSU from '@/routes/components/SessionStorageUrl';
import common from '@/routes/sbid/common.less';
import ScoreDetailModal from '@/routes/ssrc/InquiryHall/ConfirmCandidate/ScoreDetailModal';
import ScoringElementModal from '../../components/Detail/ScoringElementModal';
import Attachment from '../../components/Attachment';
import DownloadAttachments from '../../components/DownloadAttachments';

import styles from '../../BidEventQuery/Detail/index.less';
import OpenBid from '../../BidEventQuery/Detail/OpenBid'; // 开标
import InPrequal from '../../BidEventQuery/Detail/inPrequal'; // 预审tab
import InQuotation from '../../BidEventQuery/Detail/InQuotation'; // 投标
import Calibration from '../../BidEventQuery/Detail/Calibration'; // 定标
import BidEvaluation from '../../BidEventQuery/Detail/BidEvaluation'; // 评标
import ReleasePrepare from './ReleasePrepare'; // 准备

const FormItem = Form.Item;
const { Step } = Steps;
const promptCode = 'ssrc.bidHall';
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

class Detail extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};

    const {
      backRecommend = '',
      typeName = '',
      bidTask = '',
      sourcePage = null,
      lastPath = null,
    } = querystring.parse(props.location.search.substr(1));

    this.state = {
      sourcePage,
      bidTask, // 判断招标书明细是否由招标作业跳转进入
      backRecommend, // 专家评分跳转标记
      typeName,
      lastPath,
      subjectMatterRule: '', // 标的规则
      sourceMethod: '', // “寻源方式”是“合作伙伴公开”或“全平台公开”，供应商列表Tab页禁用
      editBidMembersFlag: false, // 招标小组
      distributeModalVisible: false, // 物品明细分配供应商
      evaluateAssignModalVisible: false, // 评分要素分配专家modal
      scoringElementVisible: false, // 招标评分细项modal
      pretrialPanelVisible: false, // 预审小组弹框
      exportLoading: false, // 导出loading,
      dicisionAttachmentUuid: uuidv4(), // 初始化附件uuid
      InPrequalCollapseKeys: ['prequalHeader', 'prequalDetail'], // 资格预审折叠面板,
      OpenBidCollapseKeys: ['openBidHeader', 'openBidDetail'], // 开标叠面板,
      CalibrationCollapseKeys: ['calibrationHeader', 'calibrationDetail'], // 应标叠面板,
      InQuotationCollapseKeys: ['quotationHeader', 'quotationDetail'], // 投标标折叠面板
      EvaluationCollapseKeys: ['bidEvaluationHeader', 'bidEvaluationDetail'], // 评标折叠面板
      historyApprovalRecords: [],
      ResleaseHistoryCollapseKeys: ['resleaseHistory'],
      processVisible: false, // 过程附件下载
    };
  }

  async componentDidMount() {
    const { onFormLoaded } = this.props;
    this.handleGetStage();
    Promise.all([this.fetchbidHallUpdate()]).finally(() => {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
    });
  }

  /**
   * onRef获取子组件
   */
  @Bind()
  onRef(ref) {
    this.ItemLineTable = ref;
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
        bidMembersList: [],
        itemLine: [],
        itemLinePagination: {},
        supplierLine: [],
        scoringElement: [], // 评分要素数据
        scoringNoneTempelate: [], // 模板明细不区分数据
        scoringBusinessTempelate: [], // 模板明细商务组数据
        scoringTechnologyTempelate: [], // 模板明细技术组数据
        evaluateExpertList: [], // 不区分none/diff
        itemLineChange: false,
        itemLineExpandedKeys: [],
        historys: '',
        bidDetailProcessList: [],
        pretrialPanelList: [], // 预审
        prequalDetailList: [],
        prequalDetailPagination: {},
        bidDetailPrequalHeader: {},
        headerInfo: {}, // 招标简单头
        bidDetailOpenBidList: [],
        bidDetailQuotationList: [],
        bidDetailQuotationPagination: [],
        expertScoreDetails: {},
        bidSectionList: [],
      },
    });

    SSU.clear();
  }

  /**
   * 获取回退路径
   * */
  getBackPath() {
    const { backRecommend, typeName, bidTask, sourcePage = '', lastPath } = this.state;
    let backPath;
    const activeTabKey = getActiveTabKey();
    if (
      backRecommend === 'expertDetailToBidHallDetail' ||
      backRecommend === 'recommend' ||
      backRecommend === 'BidEvaluateBidHallDetail'
    ) {
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activeTabKey}`
          : `${backRecommend}+${activeTabKey}`;
      const backPack =
        JSON.parse(sessionStorage.getItem(key) || sessionStorage.getItem('sourceRouter') || '{}')
          ?.url || JSON.parse(sessionStorage.getItem('sourceRouterDetail') || '{}')?.url;
      if (backPack) {
        backPath = backPack;
      } else {
        backPath = null;
      }
    } else if (typeName === 'examinationDetail') {
      backPath = '/ssrc/qualification-examination/list';
    } else if (bidTask === 'bidTask') {
      backPath = '/ssrc/bid-task/list';
    } else if (sourcePage && sourcePage === 'project-setup') {
      backPath = '/ssrc/project-setup/list'; // 寻源立项
    } else if (lastPath === 'bidEventQuery') {
      backPath = '/ssrc/inquiry-bid-query/list';
    } else {
      backPath = '/ssrc/bid-hall/list';
    }
    return backPath;
  }

  @Bind()
  setPath(pathName) {
    let pathname = '';
    // eslint-disable-next-line no-template-curly-in-string
    pathname = pathName.replace('${bidId}', ':bidId');
    return pathname || pathName;
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  async fetchbidHallUpdate() {
    const {
      modelName = 'bidHall',
      match: { params, path },
      location: { search },
      dispatch,
      organizationId,
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    const fetchBidHeaderDetail = dispatch({
      type: `${modelName}/fetchBidHeaderDetail`,
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path: this.setPath(path),
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.HEADER,SSRC.BID_HALL_DETAIL.OTHER.INFO',
      },
    });
    const fetchItemLine = dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path: this.setPath(path),
        customizeUnitCode:
          source === 'PACK'
            ? 'SSRC.BID_HALL_DETAIL.ITEM_LINE'
            : 'SSRC.BID_HALL_DETAIL.ITEM_LINE_NONE', // 区分标段
      },
    });
    const fetchSupplierLine = dispatch({
      type: `${modelName}/fetchSupplierLine`,
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.PREPARE_SUPPLIER',
      },
    });
    const fetchBidMembers = dispatch({
      type: `${modelName}/fetchBidMembers`,
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path: this.setPath(path),
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.DETAIL_BIDDING_GROUP',
      },
    });
    const fetchExpertAllocationData = dispatch({
      type: `${modelName}/fetchExpertAllocationData`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        expertStatus: 'SUBMITTED',
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.EXPERT_SCORE',
      },
    });
    const fetchTempelateDetailData = dispatch({
      type: `${modelName}/fetchTempelateDetailData`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        indicStatus: 'SUBMITTED',
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.SCORE_INDICS',
      },
    });

    const lovCodes = {
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      subjectMatterRule: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
      bidRole: 'SSRC.BID_MEMBER_ROLE', // 招标角色
      sourceStage: 'SSRC.SOURCE_STAGE', // 招标阶段
      bidStatus: 'SSRC.BID_STATUS', // 招标单状态
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      sourceType: 'SSRC.SOURCE_TYPE', // 寻源类型
      priceCategory: 'SSRC.SOURCE_PRICE_CATEGORY', // 价格类型
      quotationOrderType: 'SSRC.QUOTATION_ORDER_TYPE', // 投标次序
      auctionRule: 'SSRC.RFA_AUCTION_RULE', // 竞价规则
      openRule: 'SSRC.RFA_OPEN_RULE', // 公开规则
      indicateType: 'SSRC.INDICATE_TYPE', // 要素类型
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
    return Promise.all([
      fetchBidHeaderDetail,
      fetchItemLine,
      fetchSupplierLine,
      fetchBidMembers,
      fetchExpertAllocationData,
      fetchTempelateDetailData,
    ]);
  }

  /**
   * 定标查询信息
   */
  @Bind()
  fetchbidCalibration() {
    const {
      location: { search },
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    if (source === 'PACK') {
      this.fetchItemPackLine(); // 行信息-分标段
    } else {
      this.fetchSupplierDimensionHeader(); // 获取供应商维度头
      this.fetchItemNoneLine(); // 行信息-不分标段
    }
  }

  /**
   * 行信息不分标段 - 查询
   */
  @Bind()
  fetchItemNoneLine(page = {}) {
    const {
      match: { params },
      dispatch,
      modelName = 'bidHall',
      organizationId,
    } = this.props;
    dispatch({
      type: `${modelName}/fetchLineNoneDetail`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
  }

  /**
   * 获取供应商维度数据
   *
   * @memberof search
   */
  fetchSupplierDimensionHeader(page = {}) {
    const {
      dispatch,
      modelName = 'bidHall',
      organizationId,
      match: { params = {} },
    } = this.props;

    dispatch({
      type: `${modelName}/fetchSupplierDimensionHeader`,
      payload: { organizationId, bidHeaderId: params.bidId, page },
    }).then((res) => {
      if (!res) {
        return;
      }

      if (!Array.isArray(res) || !res.length) {
        return;
      }

      const defaultCollapseOpenedId = res[0].supplierCompanyId || '';
      if (!defaultCollapseOpenedId) {
        throw new TypeError('supplierCompanyId cannot be empty!');
      }
      // this.expandSupplier(defaultCollapseOpenedId);
      // this.setState({
      //   collapseActiveKey: [defaultCollapseOpenedId.toString()],
      // });
    });
  }

  /**
   * 行信息分标段 - 查询
   */
  @Bind()
  fetchItemPackLine(page = {}) {
    const {
      match: { params },
      dispatch,
      modelName = 'bidHall',
      organizationId,
    } = this.props;
    dispatch({
      type: `${modelName}/fetchLinePackDetail`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
  }

  // 评标阶段 评分明细 确认候选人信息
  @Bind()
  fetchBidEvaluation() {
    const {
      location: { search },
      match: { params },
      dispatch,
      modelName = 'bidHall',
      organizationId,
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    if (source === 'PACK') {
      dispatch({
        type: `${modelName}/fetchLinePackDetail`,
        payload: {
          organizationId,
          bidHeaderId: params.bidId,
        },
      }).then((res) => {
        if (res) {
          this.fetchScoreDetails(res[0]);
          this.fetchConfirmCandidates();
        }
      });
    } else {
      this.fetchScoreDetails();
      this.fetchConfirmCandidates();
    }
  }

  // 候选人信息查询
  @Bind()
  fetchConfirmCandidates() {
    const {
      dispatch,
      modelName = 'bidHall',
      organizationId,
      match: { params = {} },
    } = this.props;
    dispatch({
      type: `${modelName}/fetchConfirmCandidates`,
      payload: { organizationId, sourceHeaderId: params.bidId, sourceFrom: 'BID' },
    });
  }

  // 评分明细
  @Bind()
  fetchScoreDetails(res = {}) {
    const {
      dispatch,
      modelName = 'bidHall',
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: `${modelName}/bidEvaluationDetails`,
      payload: {
        organizationId,
        sectionId: res.sectionId,
        sectionNum: res.sectionNum,
        bidHeaderId: params.bidId,
        sourceFrom: 'BID',
      },
    });
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}) {
    const {
      match: { params },
      modelName = 'bidHall',
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: `${modelName}/fetchSupplierLine`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
  }

  // 评分要素-专家分配 打开modal
  @Bind()
  openAssignExpertModal(record) {
    const { organizationId, dispatch, modelName = 'bidHall' } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: `${modelName}/fetchEvaluateIndicAssign`,
      payload: {
        organizationId,
        evaluateIndicId: record.evaluateIndicId || '',
        evaluateIndicCategory: record.team || '',
      },
    });
  }

  // 评分要素-专家分配 关闭modal
  @Bind()
  cancelAssignExpert() {
    this.setState({
      evaluateAssignModalVisible: false,
    });
  }

  /**
   * 查看-打开评分要素定义模态框
   */
  @Bind()
  showScoringElement() {
    this.setState({
      scoringElementVisible: true,
    });
    this.fetchScoringElementData();
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      [modelName]: { bidDetailPrequalHeader = {}, header = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: `${modelName}/fetchScoringElementData`,
      payload: {
        prequalHeaderId: bidDetailPrequalHeader.prequalHeaderId || header.prequalHeaderId,
        organizationId,
      },
    });
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    const { modelName = 'bidHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
    });
  }

  /**
   * 物品明细-点击分配按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;

    if (!record) {
      return;
    }

    const { bidHeaderId = null, bidLineItemId = null } = record;

    dispatch({
      type: `${modelName}/supplierRecord`,
      payload: {
        organizationId,
        bidHeaderId,
        bidLineItemId,
      },
    });

    this.setState({ distributeModalVisible: true });
  }

  // 明细取消分配供应商
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });
  }

  /**
   * 改变币种-人民币时汇率为1.0000000
   */
  @Bind()
  changeCurrencyCode(val) {
    const { form } = this.props;
    if (val === 'CNY') {
      form.setFieldsValue({ exchangeRate: 1.0 });
    } else {
      form.setFieldsValue({ exchangeRate: undefined });
    }
  }

  @Bind()
  editBidMembers() {
    this.setState({
      editBidMembersFlag: true,
    });
  }

  @Bind()
  handleMembersCancel() {
    this.setState({
      editBidMembersFlag: false,
    });
  }

  // 跳转澄清答疑查看页面
  @Bind()
  clarificationView() {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      location: { pathname },
    } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const backPath = pathname.split('/bid-detail') && pathname.split('/bid-detail')[0];
    if (backPath === '/ssrc/bid-hall') {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/bid-hall/clarification-view/${header.bidHeaderId}/${header.bidNum}/${header.bidTitle}/${header.companyId}/1`,
        })
      );
    } else if (backPath === '/pub/ssrc/bid-hall') {
      dispatch(
        routerRedux.push({
          pathname: `/pub/ssrc/bid-hall/clarification-view/${header.bidHeaderId}/${header.bidNum}/${header.bidTitle}/${header.companyId}/1`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/bid-task/clarification-view/${header.bidHeaderId}/${header.bidNum}/${header.bidTitle}/${header.companyId}/1`,
        })
      );
    }
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible) {
    const {
      dispatch,
      match: { params },
      organizationId,
      modelName = 'bidHall',
    } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: `${modelName}/fetchPretrialPanel`,
        payload: {
          sourceHeaderId: params.bidId,
          sourceFrom: 'BID',
          organizationId,
        },
      });
    } else {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          pretrialPanelList: [],
        },
      });
    }
  }

  /**
   *导出
   *
   */
  exportData = (bidHeaderId, organizationId) => {
    this.setState({
      exportLoading: true,
    });
    const url = `${API_HOST}${SRM_SSRC}/v1/${organizationId}/bid/${bidHeaderId}/checkResultExport/export`;
    const AccessToken = getAccessToken();
    const postReq = new Request(url, {
      method: 'GET',
      headers: { Authorization: `bearer ${AccessToken}` },
    });
    fetch(postReq).then((resp) =>
      resp.text().then((text) => {
        this.setState({
          exportLoading: false,
        });
        if (text) {
          fetch(text)
            .then((data) => data.blob())
            .then((zip) => {
              // IE兼容性处理
              if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(
                  zip,
                  `${intl
                    .get('ssrc.bidEventQueryn.model.button.resultExport')
                    .d('定标结果导出')}.xls`
                );
              } else {
                const blobUrl = window.URL.createObjectURL(zip);
                const a = document.createElement('a');
                a.download = decodeURIComponent(
                  `${intl
                    .get('ssrc.bidEventQueryn.model.button.resultExport')
                    .d('定标结果导出')}.xls`
                );
                a.href = blobUrl;
                a.click();
              }
            });
        }
      })
    );
  };

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(validBusinessAttachmentUuid, validTechAttachmentUuid) {
    this.setState({
      AttachmentsProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: validBusinessAttachmentUuid,
        techUuid: validTechAttachmentUuid,
      },
      attachmentVisible: true,
    });
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false });
  }

  // 招投标单简单头查询
  fetchHeaderInfo(type = '') {
    const { dispatch, organizationId, match, modelName = 'bidHall' } = this.props;
    const { bidId } = match.params;
    // 询价单表头数据
    dispatch({
      type: `${modelName}/fetchHeaderInfo`,
      payload: {
        organizationId,
        bidHeaderId: bidId,
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.MARKED_BASIC_INFO',
      },
    }).then((res) => {
      if (res) {
        if (type) {
          this.fetchHistoryRecord(type);
        }
      }
    });
  }

  // 预审头信息查询
  @Bind()
  prequalDetailHeaderBidDetail() {
    const {
      dispatch,
      modelName = 'bidHall',
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: `${modelName}/prequalDetailHeaderBidDetail`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
      },
    });
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  // 资格预审详情
  @Bind()
  prequalDetailBidDetail(page = {}, data = {}) {
    const {
      dispatch,
      modelName = 'bidHall',
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: `${modelName}/prequalDetailBidDetail`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
        page,
        ...data,
      },
    });
  }

  // 报价详情
  @Bind()
  quotationDetailBidDetail(page = {}, data = {}) {
    const {
      dispatch,
      modelName = 'bidHall',
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: `${modelName}/quotationDetailBidDetail`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
        page,
        ...data,
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.MARKED_LINE_INFO',
      },
    });
  }

  // 开标详情
  @Bind()
  openBidDetail(page = {}, data = {}) {
    const {
      dispatch,
      modelName = 'bidHall',
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: `${modelName}/openBidDetail`,
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
        page,
        ...data,
      },
    });
  }

  /**
   * 查询阶段
   */
  @Bind()
  handleGetStage() {
    const { dispatch, organizationId, match, modelName = 'bidHall' } = this.props;
    const { bidId } = match.params;
    dispatch({
      type: `${modelName}/fetchBidDetailProcessAll`,
      payload: {
        organizationId,
        bidHeaderId: bidId,
      },
    }).then((res) => {
      if (!res) {
        this.fetchbidHallUpdate();
        return;
      }

      const current = res.filter((s) => s.nodeFlag === 0) || [];
      if (!isEmpty(current)) {
        const currentNodeStatus = current[0].nodeStatus || null;
        this.queryWithStepChange(currentNodeStatus);
        this.setState({
          currentStep: currentNodeStatus,
        });
      }
    });
  }

  // 查询审批历史
  @Bind()
  fetchHistoryRecord(type) {
    const {
      modelName = 'bidHall',
      organizationId,
      [modelName]: { headerInfo = {} },
    } = this.props;
    const businessKey = `SSRC_BID_${headerInfo.noEncryptBidHeaderId}_${organizationId}_${type}`;
    if (businessKey) {
      this.props
        .dispatch({
          type: `${modelName}/fetchHistoryApproval`,
          params: {
            businessKey,
          },
        })
        .then((res) => {
          if (res) {
            this.setState({
              historyApprovalRecords: res || [],
            });
          }
        });
    }
  }

  /**
   * 点击进度条查询
   * */
  queryWithStepChange(status = null) {
    switch (status) {
      case 'RELEASE_PREPARE':
        this.fetchHeaderInfo('RELEASE');
        this.fetchbidHallUpdate();
        break;
      case 'IN_PREQUAL':
        this.prequalDetailHeaderBidDetail();
        this.prequalDetailBidDetail();
        break;
      case 'IN_BIDDING':
        this.fetchHeaderInfo();
        this.quotationDetailBidDetail();
        break;
      case 'OPEN_BID_PENDING':
        this.fetchHeaderInfo();
        this.openBidDetail();
        break;
      case 'BID_EVALUATION_PENDING':
        this.fetchHeaderInfo();
        this.fetchBidEvaluation();
        break;
      case 'CONFIRMED_PENDING':
        this.fetchHeaderInfo('CHECK');
        this.fetchbidCalibration();
        break;
      case 'FINISHED':
        this.fetchHeaderInfo('CHECK');
        this.fetchbidCalibration();
        break;
      default:
        this.fetchbidHallUpdate();
        break;
    }
  }

  /**
   * 设置步骤条的current
   * @returns {*}
   */
  setCurrent(bidDetailProcessList) {
    const stage = bidDetailProcessList.filter((s) => s.nodeFlag === 0);
    const current = bidDetailProcessList.indexOf(stage[0]);
    return current;
  }

  /**
   * 进度条点击查看
   * */
  @Bind()
  changeStep(record = {}) {
    const { currentStep } = this.state;
    const { nodeStatus = null, nodeFlag = 0, nodeStatusMeaning = '' } = record;

    if (nodeFlag === 1) {
      notification.warning({
        message: intl
          .get('ssrc.bidEventQuery.view.warning.noCurrentStatusView', { nodeStatusMeaning })
          .d(`尚未到${nodeStatusMeaning}阶段, 不能查看`),
      });
      return;
    }

    if (nodeStatus === currentStep) {
      return;
    }

    if (nodeFlag === 1 && this.WaittingStatus.includes(nodeStatus)) {
      notification.warning({
        message: intl.get('ssrc.bidEventQuery.view.warning.lookForward').d('敬请期待'),
      });
      return;
    }

    this.setState({
      currentStep: nodeStatus,
    });

    this.queryWithStepChange(nodeStatus);
  }

  /**
   * 渲染进度条
   * @returns {*}
   */
  renderStep(bidDetailProcessList) {
    const { currentStep = null } = this.state;
    let step = null;
    step = (
      <div className={styles.steps}>
        <Steps current={this.setCurrent(bidDetailProcessList)} size="default">
          {bidDetailProcessList.map((s) => {
            const { nodeStatus = null, nodeStatusMeaning = null, stopStatus = null } = s;
            return (
              <Step
                key={nodeStatus}
                onClick={() => this.changeStep(s)}
                status={stopStatus === 'CLOSED' ? 'error' : ''}
                title={
                  <span
                    className={
                      currentStep === nodeStatus
                        ? stopStatus === 'CLOSED'
                          ? 'bid-detail-steps-close-text cursor-pointer'
                          : 'bid-detail-steps-active-text cursor-pointer'
                        : 'cursor-pointer'
                    }
                  >
                    {nodeStatusMeaning}
                  </span>
                }
              />
            );
          })}
        </Steps>
      </div>
    );
    return step;
  }

  @Bind()
  onCancel() {
    this.setState({ processVisible: false });
  }

  @Bind()
  openBidProcessAttachmentModal() {
    this.setState({ processVisible: true });
  }

  @Bind()
  downloadAll() {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const bidHeaderId = params.bidId;
    const api = `${SRM_SSRC}/v1/${organizationId}/bid/download/attachments/${bidHeaderId}`;
    downloadFile({ requestUrl: api });
  }

  /**
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  directorQuotationDetail(record = {}) {
    const { modelName = 'bidHall' } = this.props;
    const {
      dispatch,
      location: { search: params },
      [modelName]: { headerInfo = {} },
    } = this.props;
    const { source: sourceType } = querystring.parse(params.substr(1));
    const { bidHeaderId, sourceCategory, subjectMatterRule } = headerInfo;
    const { supplierCompanyId, quotationHeaderId } = record;
    const { sourcePage, backRecommend } = this.state;
    const search = querystring.stringify({
      RFXDetail: bidHeaderId,
      supplierCompanyId,
      redirectFlag: 1,
      sourcePage,
      subjectMatterRule,
      backRecommend,
      sourceType,
      source: 'expert-scoring.bid-detail',
    });
    if (sourceCategory === 'BID') {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/expert-scoring/view-bid/detail/${quotationHeaderId}`,
          search,
        })
      );
      // 设置新的session
      const source = JSON.parse(
        sessionStorage.getItem('sourceRouter+/ssrc/expert-scoring') ||
          sessionStorage.getItem('sourceRouter') ||
          '{}'
      );
      sessionStorage.setItem('sourceRouterDetail', JSON.stringify(source));
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/detail/${bidHeaderId}/${supplierCompanyId}`,
        search,
      })
    );
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

    this.fetchScoreDetailOfTotalPoints(record);
  }

  /**
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  cancelScoreDetailModal() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        sumScoreData: [],
      },
    });

    this.setState({
      scoreDetailModalVisible: false,
    });
  }

  /**
   * 评分下－评分明细－总分构成
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetailOfTotalPoints(record = {}) {
    const { dispatch, organizationId, modelName = 'bidHall' } = this.props;

    dispatch({
      type: `${modelName}/fetchSumScore`,
      payload: {
        organizationId,
        evaluateSummaryId: record.evaluateSummaryId,
      },
    });
  }

  renderCalibration(CalibrationProps) {
    return <Calibration {...CalibrationProps} />;
  }

  render() {
    const { modelName = 'bidHall' } = this.props;
    const {
      form,
      dispatch,
      match,
      location: { search },
      organizationId,
      userId,
      customizeTabPane,
      fetchbidHallUpdateLoading,
      supplierRecordLoading,
      fetchItemLineLoading,
      fetchBidMembersLoading,
      fetchSupplierLineloading,
      fetchTempelateDetailDataLoading,
      fetchScoringElementLoading,
      fetchExpertAllocationDataLoading,
      fetchEvaluateIndicAssignLoading,
      fetchPretrialPanelLoading,
      prequalDetailBidDetailLoading,
      fetchHeaderInfoLoading,
      quotationDetailBidDetailLoading,
      fetchHistoryApprovalLoading,
      customizeTable,
      customizeForm,
      bidEventQuery,
      queryCalibrationLoading,
      [modelName]: {
        header = {},
        itemLine = [],
        supplierData = [],
        supplierLine = [],
        supplierLinePagination = {},
        scoringElement = [],
        bidMembersList = [],
        itemLinePagination = {},
        evaluateExpertList = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        bidDetailProcessList = [],
        headerInfo = {}, // 招标简单头
        bidDetailOpenBidList = [],
        LinePackList = [],
        prequalDetailList = [],
        prequalDetailPagination = {},
        bidDetailPrequalHeader = {},
        bidDetailQuotationList = [],
        bidDetailQuotationPagination = {},
        supplierDimensionHeaderList = [],
        LineNoneList = [],
        scoreDetails = [],
        sumScoreData = [],
        bidSectionList = [],
      },
      [modelName]: { pretrialPanelList = [] },
      otherModelName = 'bidEventQuery',
    } = this.props;
    const bidHeaderId = match.params.bidId;
    const { source } = querystring.parse(search.substr(1));

    const {
      subjectMatterRule,
      sourceMethod,
      editBidMembersFlag,
      evaluateAssignModalVisible,
      scoringElementVisible,
      distributeModalVisible,
      pretrialPanelVisible,
      currentStep,
      exportLoading,
      dicisionAttachmentUuid,
      InPrequalCollapseKeys,
      OpenBidCollapseKeys,
      CalibrationCollapseKeys,
      EvaluationCollapseKeys,
      InQuotationCollapseKeys,
      AttachmentsProps,
      attachmentVisible,
      historyApprovalRecords = [],
      ResleaseHistoryCollapseKeys,
      processVisible = false,
      scoreDetailModalVisible = false,
      fetchScoreDetailsLoading = false,
    } = this.state;

    const historyRecordProps = {
      loading: fetchHistoryApprovalLoading,
      records: historyApprovalRecords || [],
      setCollapseByKey: this.setCollapseByKey,
      ResleaseHistoryCollapseKeys,
    };

    // 物品明细
    const ItemLineTableProps = {
      header,
      match,
      dispatch,
      organizationId,
      customizeTabPane,
      supplierRecordLoading,
      customizeTable,
      // handleQuotationDetail: this.handleQuotationDetail,
      subjectMatterRule: subjectMatterRule || header.subjectMatterRule,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      pagination: itemLinePagination,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
      onChangeTableData: this.changeItemLineTableData,
    };

    // 专家
    const ProfessionalTableProps = {
      customizeTable,
      header,
      evaluateExpertList,
      dispatch,
      organizationId,
      match,
      fetchExpertAllocationDataLoading,
    };

    // 评分要素
    const ScoringElementsTableProps = {
      customizeTable,
      loading: fetchTempelateDetailDataLoading,
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      dispatch,
      evaluateAssignModalVisible,
      organizationId,
      match,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
      openAssignExpertModal: this.openAssignExpertModal,
      cancelAssignExpert: this.cancelAssignExpert,
    };

    // 招标公告
    const TenderNoticeProps = {
      header,
      organizationId,
    };

    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };

    // 供应商
    const SupplierLineTableProps = {
      dispatch,
      organizationId,
      userId,
      companyId: header.companyId,
      match,
      supplierLinePagination,
      fetchbidHallUpdateLoading,
      loading: fetchSupplierLineloading,
      dataSource: supplierLine,
      sourceMethod: sourceMethod || header.sourceMethod,
      onSearch: this.fetchSupplierLine,
      customizeTable,
    };

    // 招标细项props
    const scoringElementProps = {
      header,
      isDisabled: true,
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      onCancel: this.handleCancelScoringElement,
    };
    const { getFieldDecorator } = form;
    // 招标小组

    const MatterDetailProps = {
      matterDetail: header.matterDetail || '',
    };

    // 附件组件
    const uploadModalProps = {
      tenantId: organizationId,
      filePreview: true,
      btnProps: {
        icon: 'paper-clip',
      },
      btnText: intl.get(`ssrc.bidEventQuery.view.message.title.dicisionAttachment`).d('定标附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bid-header',
      viewOnly: true,
      attachmentUUID:
        isUndefined(header.dicisionAttachmentUuid) || isNull(header.dicisionAttachmentUuid)
          ? dicisionAttachmentUuid
          : header.dicisionAttachmentUuid,
      showFilesNumber: false,
    };

    const CommonHeaderProps = {
      header,
      form,
      customizeTable,
      customizeForm,
      UEDDisplayFormItem,
      FormItem,
      organizationId,
      setCollapseByKey: this.setCollapseByKey,
    };

    // 投标
    const InQuotationProps = {
      ...CommonHeaderProps,
      header: headerInfo,
      headerLoading: fetchHeaderInfoLoading,
      quotationDetailBidDetailLoading,
      InQuotationCollapseKeys,
      bidDetailQuotationList,
      bidDetailQuotationPagination,
      quotationDetailBidDetail: this.quotationDetailBidDetail,
    };

    // 开标
    const OpenBidProps = {
      ...CommonHeaderProps,
      header: headerInfo,
      headerLoading: fetchHeaderInfoLoading,
      OpenBidCollapseKeys,
      bidDetailOpenBidList,
      openBidDetail: this.openBidDetail,
    };

    // 预审
    const InPrequalProps = {
      ...CommonHeaderProps,
      showScoringElement: this.showScoringElement,
      header: bidDetailPrequalHeader,
      InPrequalCollapseKeys,
      prequalDetailBidDetailLoading,
      prequalDetailList,
      prequalDetailPagination,
      prequalDetailBidDetail: this.prequalDetailBidDetail,
      showPretrialPanel: this.showPretrialPanel,
    };

    const CalibrationProps = {
      ...CommonHeaderProps,
      dispatch,
      header: headerInfo,
      bidEventQuery,
      queryCalibrationLoading,
      headerLoading: fetchHeaderInfoLoading,
      CalibrationCollapseKeys,
      LinePackList,
      source,
      showUploadModal: this.showUploadModal,
      supplierDimensionHeaderList,
      LineNoneList,
      match,
      historyRecordProps: {
        ...historyRecordProps,
        title: intl.get('ssrc.bidHall.model.bidHall.calibrationHistory').d('定标审批历史'),
      },
      modelName: otherModelName,
      // fetchSupplierDimensionHeaderLoading,
      // fetchLineNoneDetailLoading,
    };
    const BidEvaluationProps = {
      ...CommonHeaderProps,
      header: headerInfo,
      headerLoading: fetchHeaderInfoLoading,
      EvaluationCollapseKeys,
      directorQuotationDetail: this.directorQuotationDetail,
      openScoreDetailModal: this.openScoreDetailModal,
      fetchScoreDetails: this.fetchScoreDetails,
      bidSectionList,
      scoreDetails,
      LinePackList,
      source,
      fetchScoreDetailsLoading,
    };

    const ReleasePrepareProps = {
      header,
      form,
      promptCode,
      customizeForm,
      UEDDisplayFormItem,
      TenderNoticeProps,
      MatterDetailProps,
      ItemLineTableProps,
      ProfessionalTableProps,
      SupplierLineTableProps,
      ScoringElementsTableProps,
      fetchbidHallUpdateLoading,
      editBidMembers: this.editBidMembers,
      showScoringElement: this.showScoringElement,
      showPretrialPanel: this.showPretrialPanel,
      clarificationView: this.clarificationView,
      historyRecordProps: {
        ...historyRecordProps,
        title: intl.get('ssrc.bidHall.model.bidHall.resleaseHistory').d('发布审批历史'),
      },
    };

    // 确认候选人Modal props
    const scoreDetailProps = {
      scoreDetailList: sumScoreData,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
    };
    // 过程附件下载
    const DownloadAttachmentsProps = {
      bidHeaderId,
      processVisible,
      downloadAll: this.downloadAll,
      onCancel: this.onCancel,
      organizationId,
    };

    const columnsBidMember = [
      {
        title: intl.get(`${promptCode}.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRoleMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.designation`).d('名称'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 170,
        render: (val) => val,
      },
      {
        title: intl.get(`hzero.common.phone`).d('电话'),
        dataIndex: 'phone',
        width: 120,
        render: (val) => val,
      },
      {
        title: intl.get(`${promptCode}.model.bidHall.passwordFlag`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val) => (
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('passwordFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];
    const scrollX = sum(columnsBidMember.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <div
        className={classnames(common['page-content-wrapper-custome'], styles['bid-detail-page'])}
      >
        {this.setPath(match.path) !== '/pub/ssrc/bid-hall/bid-detail/:bidId' ? (
          <Header
            backPath={this.getBackPath()}
            title={intl.get(`${promptCode}.view.title.bidDetails`).d('招标书明细')}
          >
            {(currentStep === 'CONFIRMED_PENDING' || currentStep === 'FINISHED') && (
              <React.Fragment>
                <Button
                  icon="export"
                  loading={exportLoading}
                  onClick={() => this.exportData(bidHeaderId, organizationId)}
                >
                  {intl.get('ssrc.bidEventQuery.model.button.resultExport').d('定标结果导出')}
                </Button>
                <Upload {...uploadModalProps} />
                <Button icon="download" onClick={this.openBidProcessAttachmentModal}>
                  {intl.get('hzero.common.button.open').d('过程附件下载')}
                </Button>
              </React.Fragment>
            )}
          </Header>
        ) : (
          ''
        )}
        {this.renderStep(bidDetailProcessList)}
        <div style={{ flex: 1 }}>
          <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
            {(!currentStep || currentStep === 'RELEASE_PREPARE') && (
              <ReleasePrepare {...ReleasePrepareProps} />
            )}
            {currentStep === 'IN_PREQUAL' && <InPrequal {...InPrequalProps} />}
            {currentStep === 'IN_BIDDING' && <InQuotation {...InQuotationProps} />}
            {currentStep === 'OPEN_BID_PENDING' && <OpenBid {...OpenBidProps} />}
            {currentStep === 'CONFIRMED_PENDING' && this.renderCalibration(CalibrationProps)}
            {currentStep === 'BID_EVALUATION_PENDING' && <BidEvaluation {...BidEvaluationProps} />}
            {currentStep === 'FINISHED' && this.renderCalibration(CalibrationProps)}
          </Content>
        </div>

        <Modal
          visible={editBidMembersFlag}
          width={820}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{intl.get(`${promptCode}.view.modal.title.bidMembers`).d('招标小组')}</span>
            </div>
          }
          footer={null}
          onCancel={this.handleMembersCancel}
        >
          {customizeTable(
            {
              code: 'SSRC.BID_HALL_DETAIL.DETAIL_BIDDING_GROUP',
              dataSource: bidMembersList,
            },
            <Table
              bordered
              rowKey="bidMemberId"
              loading={fetchBidMembersLoading}
              columns={columnsBidMember}
              scroll={{ x: scrollX }}
              pagination={false}
              dataSource={bidMembersList}
            />
          )}
        </Modal>

        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        <ScoringElementModal {...scoringElementProps} />
        <PretrialPanelModal {...pretrialPanelProps} />
        {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
        <ScoreDetailModal {...scoreDetailProps} />
      </div>
    );
  }
}

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_DETAIL.ITEM_LINE_TAB',
        'SSRC.BID_HALL_DETAIL.HEADER',
        'SSRC.BID_HALL_DETAIL.ITEM_LINE',
        'SSRC.BID_HALL_DETAIL.ITEM_LINE_NONE',
        'SSRC.BID_EVENT_DETAIL.TAB_ITEM',
        'SSRC.BID_HALL_DETAIL.TAB_SUPPLIER_READ',
        'SSRC.BID_HALL_DETAIL.OTHER.INFO',
        'SSRC.BID_HALL_DETAIL.EXPERT_SCORE',
        'SSRC.BID_HALL_DETAIL.SCORE_INDICS',
        'SSRC.BID_HALL_DETAIL.PREPARE_SUPPLIER', // 招标准备-供应商table
        'SSRC.BID_HALL_DETAIL.DETAIL_BIDDING_GROUP',
        'SSRC.BID_HALL_DETAIL.MARKED_BASIC_INFO',
        'SSRC.BID_HALL_DETAIL.MARKED_LINE_INFO',
        'SSRC.BID_EVENT_DETAIL.TAB_PACK',
      ],
    }),
    connect(({ bidHall, bidEventQuery, resultsQuery, loading }) => ({
      bidHall,
      modelName: 'bidHall',
      bidEventQuery,
      resultsQuery,
      fetchbidHallUpdateLoading: loading.effects['bidHall/fetchBidHeaderDetail'],
      fetchItemLineLoading: loading.effects['bidHall/fetchItemLine'],
      fetchSupplierLineloading: loading.effects['bidHall/fetchSupplierLine'],
      fetchBidMembersLoading: loading.effects['bidHall/fetchBidMembers'],
      supplierRecordLoading: loading.effects['bidHall/supplierRecord'],
      fetchTempelateDetailDataLoading: loading.effects['bidHall/fetchTempelateDetailData'],
      fetchExpertAllocationDataLoading: loading.effects['bidHall/fetchExpertAllocationData'],
      fetchScoringElementLoading: loading.effects['bidHall/fetchScoringElementData'],
      fetchEvaluateIndicAssignLoading: loading.effects['bidTask/fetchEvaluateIndicAssign'],
      fetchPretrialPanelLoading: loading.effects['bidHall/fetchPretrialPanel'],
      prequalDetailBidDetailLoading: loading.effects['bidHall/prequalDetailBidDetail'],
      fetchHeaderInfoLoading: loading.effects['bidHall/fetchHeaderInfo'],
      quotationDetailBidDetailLoading: loading.effects['bidHall/quotationDetailBidDetail'],
      fetchHistoryApprovalLoading: loading.effects['bidHall/fetchHistoryApproval'],
      fetchScoreDetailsLoading: loading.effects['bidHall/bidEvaluationDetails'],
      queryCalibrationLoading: loading.effects['bidEventQuery/fetchCalibrationQuotation'], // 供应商行点击查询物料行
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
    })),
    formatterCollections({
      code: [
        'ssrc.bidHall',
        'ssrc.bidTask',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.bidEventQuery',
        'ssrc.qualiExam',
        'hwfp.common',
        'hwfp.task',
      ],
    }),
    Form.create({ fieldNameProp: null })
  )(com);

export default hocComponent(Detail);
export { hocComponent, Detail };
