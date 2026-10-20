/**
 * BidEventQuery - 招标事件查询详细界面
 * @date: 2019-7-11
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, Table, Button, Steps } from 'hzero-ui';
import { isNumber, sum, isEmpty, isUndefined, isNull } from 'lodash';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import querystring from 'querystring';
import uuidv4 from 'uuid/v4';
import { routerRedux } from 'dva/router';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload';
import Checkbox from 'components/Checkbox';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId, getAccessToken } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { API_HOST } from 'utils/config';
import { downloadFile } from 'hzero-front/lib/services/api';
import { phoneRender } from '@/utils/renderer';

import common from '@/routes/ssrc/common.less';
import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index'; // 预审小组
import ScoreDetailModal from '@/routes/ssrc/InquiryHall/ConfirmCandidate/ScoreDetailModal';
import ScoringElementModal from '../../components/Detail/ScoringElementModal';
import Attachment from '../../components/Attachment';
import styles from './index.less';
import OpenBid from './OpenBid'; // 开标
import InPrequal from './inPrequal'; // 预审tab
import Calibration from './Calibration'; // 定标
import BidEvaluation from './BidEvaluation'; // 评标
import InQuotation from './InQuotation'; // 投标
import ReleasePrepare from './ReleasePrepare'; // 准备
import DownloadAttachments from '../../components/DownloadAttachments';

// const { Panel } = Collapse;
const { Step } = Steps;

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@withCustomize({
  unitCode: [
    'SSRC.BID_EVENT_DETAIL.TAB_ITEM',
    'SSRC.BID_EVENT_DETAIL.TAB_PACK',
    'SSRC.BID_EVENT_DETAIL.ITEM_LINE_TAB',
    'SSRC.BID_EVENT_DETAIL.HEADER_INFO',
    'SSRC.BID_EVENT_DETAIL.OTHER.INFO',
  ],
})
@formatterCollections({
  code: [
    'ssrc.bidEventQuery',
    'ssrc.bidHall',
    'ssrc.inquiryHall',
    'ssrc.common',
    'hwfp.common',
    'hwfp.task',
    'ssrc.qualiExam',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ bidEventQuery, loading, user }) => ({
  user,
  bidEventQuery,
  fetchBasicInfoLoading: loading.effects['bidEventQuery/fetchBasicInfoDetail'], // 基本信息 + 其他信息 + 资格预审
  fetchExpertsInfoLoading: loading.effects['bidEventQuery/fetchExpertsInfo'], // 专家
  fetchScorElementsLoading: loading.effects['bidEventQuery/fetchScorElementsData'], // 评分要素
  fetchEvaluateIndicAssignLoading: loading.effects['bidEventQuery/fetchEvaluateIndicAssign'], // 评分要素-查看专家分配
  fetchSupplierListLoading: loading.effects['bidEventQuery/fetchSupplierListData'], // 供应商列表
  fetchItemDetailLoading: loading.effects['bidEventQuery/fetchItemLine'], // 物品明细
  supplierRecordLoading: loading.effects['bidEventQuery/supplierRecord'], // 物品明细行-查看供应商
  fetchLineNoneDetailLoading: loading.effects['bidEventQuery/fetchLineNoneDetail'], // 行信息-不分标段
  fetchLinePackDetailLoading: loading.effects['bidEventQuery/fetchLinePackDetail'], // 行信息-分标段
  fetchAloneItemLineLoading: loading.effects['bidEventQuery/fetchAloneItemLine'], // 行信息-物料行单独查询
  fetchBidMembersLoading: loading.effects['bidEventQuery/fetchBidMembers'], // 招标小组数据查询
  queryCalibrationLoading: loading.effects['bidEventQuery/fetchCalibrationQuotation'], // 供应商行点击查询物料行
  fetchScoringElementLoading: loading.effects['bidEventQuery/fetchCalibrationQuotation'], // 评分细项查看
  fetchItemLineQuotationDetailLoading:
    loading.effects['bidEventQuery/fetchItemSupplierLineQuotationDetail'], // 报价明细数据查询
  fetchSupplierDimensionHeaderLoading:
    loading.effects['bidEventQuery/fetchSupplierDimensionHeader'], // 获取供应商维度头
  fetchAloneSupplierItemLineLoading: loading.effects['bidEventQuery/fetchAloneSupplierItemLine'], // 获取供应商维度物料行
  fetchPretrialPanelLoading: loading.effects['bidEventQuery/fetchPretrialPanel'],
  prequalDetailBidDetailLoading: loading.effects['bidEventQuery/prequalDetailBidDetail'],
  fetchHeaderInfoLoading: loading.effects['bidEventQuery/fetchHeaderInfo'],
  quotationDetailBidDetailLoading: loading.effects['bidEventQuery/quotationDetailBidDetail'],
  fetchHistoryApprovalLoading: loading.effects['bidEventQuery/fetchHistoryApproval'],
  fetchScoreDetailsLoading: loading.effects['bidEventQuery/bidEvaluationDetails'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class Detail extends Component {
  WaittingStatus = ['FINISHED', 'BID_EVALUATION_PENDING'];

  constructor(props) {
    super(props);

    this.state = {
      exportLoading: false, // 导出loading
      // collapseKeys: ['baseInfos'], // 折叠面板
      distributeModalVisible: false, // 物品明细分配供应商
      evaluateAssignModalVisible: false, // 评分要素分配专家modal
      editBidMembersFlag: false, // 招标小组
      attachmentVisible: false, // 附件组件显示标识
      currentStep: 'RELEASE_PREPARE', // 精度条当前状态 ['RELEASE_PREPARE',]
      pretrialPanelVisible: false, // 预审小组
      InPrequalCollapseKeys: ['prequalHeader', 'prequalDetail'], // 资格预审折叠面板,
      OpenBidCollapseKeys: ['openBidHeader', 'openBidDetail'], // 开标叠面板,
      CalibrationCollapseKeys: ['calibrationHeader', 'calibrationDetail'], // 应标叠面板,
      InQuotationCollapseKeys: ['quotationHeader', 'quotationDetail'], // 投标标折叠面板
      EvaluationCollapseKeys: ['bidEvaluationHeader', 'bidEvaluationDetail'], // 评标折叠面板
      dicisionAttachmentUuid: uuidv4(), // 初始化附件uuid
      historyApprovalRecords: [],
      ResleaseHistoryCollapseKeys: ['resleaseHistory'],
      processVisible: false,
      scoreDetailModalVisible: false,
    };
  }

  componentDidMount() {
    // this.fetchbidEventQueryDetail();
    this.handleGetStage();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidEventQuery/updateState',
      payload: {
        header: {}, // 招标事件查询明细页面头
        evaluateExpertList: [], // 不区分 none/diff
        scoringNoneTempelate: [], // 评分要素不区分数据
        scoringBusinessTempelate: [], // 评分要素商务组数据
        scoringTechnologyTempelate: [], // 评分要素技术组数据
        supplierLine: [], // 供应商列表数据
        supplierLinePagination: {}, // 供应商列表数据分页
        itemLine: [], // 物品明细数据
        LinePackList: [], // 行信息-分标段数据
        LinePackListPagination: {}, // 行信息-分标段分页
        LineNoneList: [], // 行信息-不分标段数据
        LineNoneListPagination: {}, // 行信息-不分标段分页
        aloneItemLine: {}, // 招标事件查询：根据物料头id获取物料明细列表
        itemLineChange: false, // 物料行是否发生改变
        itemContentChange: {}, // 物料行table是否发生改变
        scoringElementVisible: false, // 招标评分细项modal
        bidDetailProcessList: [],
        pretrialPanelList: [], // 预审
        prequalDetailList: [],
        prequalDetailPagination: {},
        bidDetailPrequalHeader: {},
        headerInfo: {}, // 招标简单头
        bidDetailOpenBidList: [],

        bidDetailQuotationList: [],
        bidDetailQuotationPagination: [],
      },
    });
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.bidId || null;
    const id = params.bidId || null;
    return prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchbidEventQueryDetail();
    }
  }

  /**
   * 招标事件查询页面信息
   */
  @Bind()
  fetchbidEventQueryDetail() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
      // location: { search },
    } = this.props;
    // const { source } = querystring.parse(search.substr(1));
    dispatch({
      type: 'bidEventQuery/fetchBasicInfoDetail',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode: 'SSRC.BID_EVENT_DETAIL.HEADER_INFO,SSRC.BID_EVENT_DETAIL.OTHER.INFO',
      },
    }).then((res = {}) => {
      if (res.dicisionAttachmentUuid) {
        this.setState({
          dicisionAttachmentUuid: res.dicisionAttachmentUuid,
        });
      }
      const { expertScoreType = '' } = res;
      if (expertScoreType && expertScoreType === 'ONLINE') {
        this.fetchExpert(); // 专家
        this.fetchScoring(); // 评分要素
      }
    });
    this.fetchSupplier(); // 供应商列表
    this.fetchItemLine(); // 物品明细

    const lovCodes = {
      quotationTypes: 'SSRC.QUOTATION_TYPE', // 报价方式
      sourceMethods: 'SSRC.SOURCE_METHOD', // 寻源方式
      subjectMatterRules: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      reviewMethods: 'SSRC.REVIEW_METHOD', // 审查方式
      bidRoles: 'SSRC.BID_MEMBER_ROLE', // 招标角色
      sourceStages: 'SSRC.SOURCE_STAGE', // 招标阶段
      indicateTypes: 'SSRC.INDICATE_TYPE', // 要素类型
    };
    dispatch({
      type: 'bidEventQuery/batchCode',
      payload: { lovCodes },
    });
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
   * 获取供应商维度数据
   *
   * @memberof search
   */
  fetchSupplierDimensionHeader(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;

    dispatch({
      type: 'bidEventQuery/fetchSupplierDimensionHeader',
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
   * 获取供应商
   *
   * @memberof Query
   */
  fetchSupplier(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchSupplierListData',
      payload: { page, organizationId, bidHeaderId: params.bidId },
    });
  }

  /**
   * 获取物品明细
   *
   * @memberof Query
   */
  fetchItemLine(page = {}) {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchItemLine',
      payload: { page, organizationId, bidHeaderId: params.bidId, path },
    });
  }

  /**
   * 获取专家数据
   *
   * @memberof Detail
   */
  fetchExpert() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchExpertsInfo',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        expertStatus: 'SUBMITTED',
      },
    });
  }

  /**
   * 获取招标事件查询评分要素数据
   *
   * @memberof Query
   */
  fetchScoring() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchScorElementsData',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        indicStatus: 'SUBMITTED',
      },
    });
  }

  /**
   * 行信息不分标段 - 查询
   */
  @Bind()
  fetchItemNoneLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchLineNoneDetail',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
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
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchLinePackDetail',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
  }

  /**
   * 物品明细-点击查看供应商按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { dispatch, organizationId } = this.props;
    if (record) {
      dispatch({
        type: 'bidEventQuery/supplierRecord',
        payload: {
          organizationId,
          bidHeaderId: record.bidHeaderId,
          bidLineItemId: record.bidLineItemId,
        },
      });
    }

    this.setState({ distributeModalVisible: true });
  }

  // 物品明细查看供应商窗口关闭
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });
  }

  // 评分要素-专家分配 打开modal
  @Bind()
  openAssignExpertModal(record) {
    const { dispatch, organizationId } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: 'bidEventQuery/fetchEvaluateIndicAssign',
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

  // 基本信息-招标小组 打开modal
  @Bind()
  showBidMembers() {
    this.setState({
      editBidMembersFlag: true,
    });
    this.fetchBidMembers();
  }

  /**
   * 查询-招标小组数据
   */
  @Bind()
  fetchBidMembers() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchBidMembers',
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
  }

  // 基本信息-招标小组查看窗口关闭
  @Bind()
  handleMembersCancel() {
    this.setState({
      editBidMembersFlag: false,
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
    const {
      dispatch,
      bidEventQuery: { bidDetailPrequalHeader = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchScoringElementData',
      payload: { prequalHeaderId: bidDetailPrequalHeader.prequalHeaderId, organizationId },
    });
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    this.props.dispatch({
      type: 'bidEventQuery/updateState',
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
    });
  }

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

  form;

  /**
   * 设置Form
   * @param {object} ref - BulkAddSupplier组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
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

  // 招投标单简单头查询
  fetchHeaderInfo() {
    const { dispatch, organizationId, match } = this.props;
    const { bidId } = match.params;
    // 询价单表头数据
    dispatch({
      type: 'bidEventQuery/fetchHeaderInfo',
      payload: {
        organizationId,
        bidHeaderId: bidId,
      },
    });
  }

  // 预审头信息查询
  @Bind()
  prequalDetailHeaderBidDetail() {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidEventQuery/prequalDetailHeaderBidDetail',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
      },
    });
  }

  // 资格预审详情
  @Bind()
  prequalDetailBidDetail(page = {}, data = {}) {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidEventQuery/prequalDetailBidDetail',
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
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible = false) {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: 'bidEventQuery/fetchPretrialPanel',
        payload: {
          sourceHeaderId: params.bidId,
          sourceFrom: 'BID',
          organizationId,
        },
      });
    } else {
      dispatch({
        type: `bidEventQuery/updateState`,
        payload: {
          pretrialPanelList: [],
        },
      });
    }
  }

  // 报价详情
  @Bind()
  quotationDetailBidDetail(page = {}, data = {}) {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidEventQuery/quotationDetailBidDetail',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
        page,
        ...data,
      },
    });
  }

  // 开标详情
  @Bind()
  openBidDetail(page = {}, data = {}) {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;

    dispatch({
      type: 'bidEventQuery/openBidDetail',
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
    const { dispatch, organizationId, match } = this.props;
    const { bidId } = match.params;
    dispatch({
      type: 'bidEventQuery/fetchBidDetailProcessAll',
      payload: {
        organizationId,
        bidHeaderId: bidId,
      },
    }).then((res) => {
      if (!res) {
        this.handleSearch();
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
      match: { params },
      organizationId,
    } = this.props;
    const businessKey = `SSRC_BID_${params.bidId}_${organizationId}_${type}`;
    if (businessKey) {
      this.props
        .dispatch({
          type: 'bidEventQuery/fetchHistoryApproval',
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
        this.fetchbidEventQueryDetail();
        this.fetchHistoryRecord('RELEASE');
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
        this.fetchHeaderInfo();
        this.fetchbidCalibration();
        this.fetchHistoryRecord('CHECK');
        break;
      case 'FINISHED':
        break;
      default:
        this.fetchbidEventQueryDetail();
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
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
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
    const {
      dispatch,
      bidEventQuery: { header = {} },
    } = this.props;
    const { rfxHeaderId } = header;
    const { supplierCompanyId } = record;
    const {
      routerParam: { sourcePage },
    } = this.state;
    const search = querystring.stringify({
      RFXDetail: rfxHeaderId,
      supplierCompanyId,
      redirectFlag: 2,
      sourcePage,
    });

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/expert-scoring/detail/${rfxHeaderId}/${supplierCompanyId}`,
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
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
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
    const { dispatch, organizationId } = this.props;

    dispatch({
      type: 'bidEventQuery/fetchSumScore',
      payload: {
        organizationId,
        evaluateSummaryId: record.evaluateSummaryId,
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
      organizationId,
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    if (source === 'PACK') {
      dispatch({
        type: 'bidEventQuery/fetchLinePackDetail',
        payload: {
          organizationId,
          bidHeaderId: params.bidId,
        },
      }).then((res) => {
        if (res) {
          this.fetchScoreDetails(res[0]);
        }
      });
    } else {
      this.fetchScoreDetails();
      this.fetchConfirmCandidates();
    }
  }

  // 评分明细
  @Bind()
  fetchScoreDetails(res = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'bidEventQuery/bidEvaluationDetails',
      payload: {
        organizationId,
        sectionId: res.sectionId,
        sectionNum: res.sectionNum,
        bidHeaderId: params.bidId,
        sourceFrom: 'BID',
      },
    });
  }

  // 候选人信息查询
  @Bind()
  fetchConfirmCandidates() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchEvaluateSummary',
      payload: { organizationId, sourceHeaderId: params.bidId, sourceFrom: 'BID' },
    });
  }

  render() {
    const {
      form,
      dispatch,
      match,
      location: { search },
      organizationId,
      userId,
      fetchBasicInfoLoading,
      fetchItemDetailLoading,
      supplierRecordLoading,
      fetchExpertsInfoLoading,
      fetchSupplierListLoading,
      fetchScorElementsLoading,
      fetchEvaluateIndicAssignLoading,
      fetchBidMembersLoading,
      fetchScoringElementLoading,
      fetchPretrialPanelLoading,
      prequalDetailBidDetailLoading,
      fetchHeaderInfoLoading,
      fetchSupplierDimensionHeaderLoading,
      fetchLineNoneDetailLoading,
      quotationDetailBidDetailLoading,
      fetchHistoryApprovalLoading,
      bidEventQuery: {
        header = {},
        itemLine = [],
        supplierLine = [],
        supplierData = [],
        evaluateExpertList = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        LineNoneList = [], // 区分标段数据
        supplierDimensionHeaderList = [], // 不区分标段-供应商维度头数据
        bidMembersList = [],
        scoringElement = [],
        bidDetailProcessList = [],
        pretrialPanelList = [], // 预审
        prequalDetailList = [],
        prequalDetailPagination = {},
        bidDetailPrequalHeader = {},
        headerInfo = {}, // 招标简单头
        bidDetailOpenBidList = [],
        LinePackList = [],
        bidDetailQuotationList,
        bidDetailQuotationPagination,
        sumScoreData = [],
        expertScoreDetails = {},
        bidSectionList = [],
      },
      customizeTable,
      customizeTabPane,
      customizeForm = () => {},
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    const {
      // collapseKeys,
      distributeModalVisible,
      evaluateAssignModalVisible,
      exportLoading,
      editBidMembersFlag,
      AttachmentsProps,
      attachmentVisible,
      scoringElementVisible,
      currentStep,
      pretrialPanelVisible,
      InPrequalCollapseKeys,
      OpenBidCollapseKeys,
      CalibrationCollapseKeys,
      EvaluationCollapseKeys,
      InQuotationCollapseKeys,
      dicisionAttachmentUuid,
      historyApprovalRecords = [],
      ResleaseHistoryCollapseKeys,
      processVisible = false,
      scoreDetailModalVisible = false,
      fetchScoreDetailsLoading = false,
    } = this.state;
    // 专家
    const ProfessionalTableProps = {
      header,
      evaluateExpertList,
      dispatch,
      organizationId,
      match,
      fetchExpertAllocationDataLoading: fetchExpertsInfoLoading,
    };

    // 评分要素
    const scoringElementsTableProps = {
      loading: fetchScorElementsLoading,
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

    // 供应商
    const supplierLineTableProps = {
      dispatch,
      organizationId,
      userId,
      companyId: header.companyId,
      match,
      fetchbidHallUpdateLoading: fetchBasicInfoLoading,
      loading: fetchSupplierListLoading,
      dataSource: supplierLine,
      sourceMethod: header.sourceMethod,
      customizeTable,
    };
    // 物品明细
    const itemLineTableProps = {
      match,
      dispatch,
      organizationId,
      supplierRecordLoading,
      subjectMatterRule: source,
      loading: fetchItemDetailLoading,
      dataSource: itemLine,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
    };

    // 招标细项props
    const scoringElementProps = {
      header,
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      onCancel: this.handleCancelScoringElement,
    };

    const { getFieldDecorator } = form;

    // 招标小组
    const columnsBidMember = [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRoleMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.designation`).d('名称'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.email`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: (val) => val,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.contactMobilephone`).d('电话'),
        dataIndex: 'phone',
        width: 120,
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.phone),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.openedFlag`).d('启用开标密码'),
        dataIndex: 'openFlag',
        width: 120,
        render: (val) => (
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('openFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];

    const scrollX = sum(columnsBidMember.map((n) => (isNumber(n.width) ? n.width : 0)));
    const bidHeaderId = match.params.bidId;
    // 供应商维度信息-不区分标段

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
    const historyRecordProps = {
      loading: fetchHistoryApprovalLoading,
      records: historyApprovalRecords || [],
      setCollapseByKey: this.setCollapseByKey,
      ResleaseHistoryCollapseKeys,
    };

    // 预审小组props
    const PretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
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

    const CalibrationProps = {
      ...CommonHeaderProps,
      header: headerInfo,
      headerLoading: fetchHeaderInfoLoading,
      CalibrationCollapseKeys,
      LinePackList,
      source,
      showUploadModal: this.showUploadModal,
      supplierDimensionHeaderList,
      LineNoneList,
      match,
      fetchSupplierDimensionHeaderLoading,
      fetchLineNoneDetailLoading,
      historyRecordProps: {
        ...historyRecordProps,
        title: intl.get('ssrc.bidHall.model.bidHall.calibrationHistory').d('定标审批历史'),
      },
    };
    // 评标
    const BidEvaluationProps = {
      UEDDisplayFormItem,
      ...CommonHeaderProps,
      header: headerInfo,
      source,
      LinePackList,
      headerLoading: fetchHeaderInfoLoading,
      EvaluationCollapseKeys,
      directorQuotationDetail: this.directorQuotationDetail,
      openScoreDetailModal: this.openScoreDetailModal,
      fetchScoreDetails: this.fetchScoreDetails,
      bidSectionList,
      expertScoreDetails,
      fetchScoreDetailsLoading,
    };

    // 专家评分step,评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList: sumScoreData,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
    };

    const ReleasePrepareProps = {
      header,
      UEDDisplayFormItem,
      TenderNoticeProps,
      fetchBasicInfoLoading,
      ProfessionalTableProps,
      scoringElementsTableProps,
      supplierLineTableProps,
      itemLineTableProps,
      customizeForm,
      customizeTabPane,
      showBidMembers: this.showBidMembers,
      showScoringElement: this.showScoringElement,
      showPretrialPanel: this.showPretrialPanel,
      historyRecordProps: {
        ...historyRecordProps,
        title: intl.get('ssrc.bidHall.model.bidHall.resleaseHistory').d('发布审批历史'),
      },
      form,
    };
    // 招标公告
    const TenderNoticeProps = {
      header,
      organizationId,
    };

    // 过程附件下载
    const DownloadAttachmentsProps = {
      bidHeaderId,
      processVisible,
      downloadAll: this.downloadAll,
      onCancel: this.onCancel,
      organizationId,
    };

    return (
      <div
        className={classnames(common['page-content-wrapper-custome'], styles['bid-detail-page'])}
      >
        <Header
          backPath="/ssrc/inquiry-bid-query/list"
          title={intl
            .get(`ssrc.bidEventQuery.view.message.title.bideventQueryDetail`)
            .d('招标事件查询')}
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
        {this.renderStep(bidDetailProcessList)}
        <div style={{ flex: 1 }}>
          <Content
            className={classnames(
              common['page-content-custom'],
              common['zero-margin-bottom'],
              'ued-detail-wrapper'
            )}
          >
            {(!currentStep || currentStep === 'RELEASE_PREPARE') && (
              <ReleasePrepare {...ReleasePrepareProps} />
            )}
            {currentStep === 'IN_PREQUAL' && <InPrequal {...InPrequalProps} />}
            {currentStep === 'IN_BIDDING' && <InQuotation {...InQuotationProps} />}
            {currentStep === 'OPEN_BID_PENDING' && <OpenBid {...OpenBidProps} />}
            {currentStep === 'CONFIRMED_PENDING' && <Calibration {...CalibrationProps} />}
            {currentStep === 'BID_EVALUATION_PENDING' && <BidEvaluation {...BidEvaluationProps} />}
            {currentStep === 'FINISHED' && <Calibration {...CalibrationProps} />}
          </Content>
        </div>
        <Modal
          visible={editBidMembersFlag}
          width={780}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.bidTeams`).d('招标小组')}</span>
            </div>
          }
          footer={null}
          onCancel={this.handleMembersCancel}
        >
          <Table
            bordered
            rowKey="bidMemberId"
            loading={fetchBidMembersLoading}
            columns={columnsBidMember}
            scroll={{ x: scrollX }}
            pagination={false}
            dataSource={bidMembersList}
          />
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
        <ScoreDetailModal {...scoreDetailProps} />
        {/* 预审小组 */}
        {pretrialPanelVisible && <PretrialPanelModal {...PretrialPanelProps} />}
        {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
      </div>
    );
  }
}
