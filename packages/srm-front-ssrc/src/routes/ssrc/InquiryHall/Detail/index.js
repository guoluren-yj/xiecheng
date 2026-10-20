/**
 * inquiryHall - 寻源服务/寻源大厅-明细查看
 * @date: 2019-6-3
 */

import React, { PureComponent } from 'react';
import { Button as C7NBtn, Modal as C7NModal, DataSet } from 'choerodon-ui/pro';
import { Icon as C7NIcon, Steps } from 'choerodon-ui';
import { Button, Form, Modal, Icon, Spin, Badge } from 'hzero-ui';
import { Bind, debounce } from 'lodash-decorators';
import querystring from 'querystring';
import classnames from 'classnames';
import { isEmpty, isNull, noop, isArray } from 'lodash';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import remotes from 'hzero-front/lib/utils/remote';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { openTab, getActiveTabKey, refreshTab } from 'utils/menuTab';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import { downloadFile } from 'hzero-front/lib/services/api';
import IMChatDraggable from '_components/IMChatDraggable';
import { queryBatchApprovaFlag } from '_utils/utils';
import {
  isText,
  fetchBiddingHallConfigResult,
  handleRevokeApproval,
  getBatchOperationFlag,
} from '@/utils/utils';
import NewCheckPrice from '@/routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/index';
import NewBidCheckPrice from '@/routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/BidIndex';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import { fetchAttachmentCount } from '@/services/checkPriceNewService';
import OperationRecord from '@/routes/components/OperationRecord';
import QuotationChangeRecords from '@/routes/ssrc/InquiryHallNew/QuotationChangeRecords.js';

import {
  INQUIRY,
  INQUIRY_HALL,
  INQUIRY_LOWERCASE,
  getSourceCategoryName,
  getOmitName,
  BID,
  getDocumentTypeName,
  getQuotationName,
  getCheckPriceName,
  getUnitCodePrefix,
  getCategoryCode,
} from '@/utils/globalVariable';

import ScoreDetailModal from '@/routes/ssrc/InquiryHall/ConfirmCandidate/ScoreDetailModal';
import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import notification from 'utils/notification';
import SectionPanel from '@/routes/components/SectionPanel/Detail';
import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import common from '@/routes/ssrc/common.less';
import {
  queryCheckPriceUiDisplayConfig,
  queryProcessAttachmentConfig,
  queryEnableDoubleUnit,
  querySslmLifeCycleConfig,
  queryH0OrC7N,
  queryConfigurationOldRate,
  fetchISTechExpert,
} from '@/services/commonService';
import {
  fetchRfxDetailProcessAll,
  // fetchRfxDetailLayout,
  exportInquiryHallInfo,
  changeRfxDetailLayout as changeUserConfig,
  backToCheckPriceValidate,
  backToCheckPriceConfirm,
  downLoadPDFToken,
  downLoadPDFFile,
} from '@/services/inquiryHallService';
import {
  fetchConfigSheetRfxPrepare,
  fetchRfxDetailConfigs,
  fetchConfigSheet,
  checkPermission,
  fetchIntelligentPreReviewResult,
} from '@/services/inquiryHallNewService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import useIPDetailModal from '@/routes/components/IPDetails';

import ChatRoomSourceLink from '@/routes/components/ChatRoomSource/ChatRoomSourceLink';
import IntelligentReviewResult from '@/routes/components/IntelligentPreReview';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import ReleasePrepare from './ReleasePrepare';
import ReleasePrepareNew from './ReleasePrepareNew';
import ReleasePrepareNewBid from './ReleasePrepareNewBid';
import InPrequal from './InPrequal';
import InQuotation from './InQuotation';
import OpenBid from './OpenBid';
import ExpertScoring from './ExpertScoring/index';
import ExpertScoringBid from './ExpertScoring/indexBid';
import CheckPrice from './CheckPrice';
import CheckPriceNewDetail from './CheckPriceNewDetail';
import LadderLevelModalPrepare from './LadderLevelModalPrepare'; // 物料明细阶梯报价弹框
import LadderLevelModalPrepareBid from './LadderLevelModalPrepareBid'; // 物料明细阶梯报价弹框
import Pretrial from './Pretrial';
import LadderLevel from '../../components/LadderLevelDoubleUnit'; // 报价后阶梯报价弹框
// import OperationRecord from '../../components/OperationRecord';
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import ScoringElementModal from '../../components/ScoringElementModal';
import BidOpenerCartridge from './BidOpenerCartridge';
import InquiryGroupModal from '../../components/InquiryGroupModal';
import DownloadAttachments from '../../components/DownloadAttachments';
import BackToCheckPrice from './BackToCheckPrice';
// import OperateRecords from '@/routes/share/OperateRecords/DrawerModal';

import styles from './index.less';

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

const { openModal } = useOperationRecordModal();

const { openIPDetailModal } = useIPDetailModal();

const backToCheckPriceDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'checkRollbackRemark',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.checkRollbackRemark`).d('退回理由'),
      },
    ],
  };
};

/**
 * backPath: "0" || 'NO', location.search中传递, Header上不显示返回icon
 * externalPb: '1', location.search中传递, 供外部模块，以/pub形式渲染整个页面 (为了解决询价单发布审批页面只有一个发布准备节点)
 * disabledAllLinkFlag 1/0 string/number 供外部系统嵌套，子页面，子组件的所有页面跳转功能，禁用当前页面的返回功能, 1禁用当前页面，
 */

class Detail extends PureComponent {
  WaittingStatus = ['IN_POSTQUAL'];

  constructor(props) {
    super(props);
    this.SectionRef = {};
    this.releasePrepareRef = {};
    const routerParam = querystring.parse(props.location.search.substr(1)) || {};

    this.state = {
      checkPriceUiIsNew: false,
      currentStep: null, // 进度条当前状态
      rfxDetailProcessList: [], // 进度条数据
      isHorizontal: true, // 是否是横/竖排版
      routerParam, // 路由跳转带参
      operationRecordModalVisible: false, // 操作记录模态框
      viewLadderLevelVisible: false, // 阶梯报价模态框
      viewLadderLevelQuotaVisible: false, // 供应商报价阶梯报价
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
      viewOnly: true, // 是否只读标识位
      bucketDirectory: 'ssrc-rfx-rfxheader',
      scoringElementVisible: false, // 评分要素定义模态框可见
      evaluateAssignModalVisible: false, // 评分要素分配专家model
      pretrialPanelVisible: false, // 预审小组弹框
      operationLoadding: false, // 询价单操作按钮loading
      PrepareCollapseKeys: ['baseInfos', 'otherInfos', 'biddingRules'], // 发布准备 竖版collapse keys
      priceComparisonModalVisible: false, // 比价助手模态框
      inquiryGroupVisibleFlag: false, // 寻源小组的modal是否可见
      scoreDetailModalVisible: false, // 评分步骤,评分明细,总分详情modal
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      checkWay: 'quantity', // 核价方式 默认数量
      fetchItemQuoteLineLoading: false, // 物料TAB的明细loading
      visibleOldPrepareConfigSheet: false, // 配置表配置显示寻源准备节点新老内容
      processVisible: false, // 过程附件下载
      sectionBidSwitchInformConfig: {}, // 标段通知配置信息
      sectionSwitchWarningVisible: false, // 分标段-切换提示
      configSheet: {}, // 用户配置表
      existClarifyFlag: 0, // 澄清答疑显示标识
      existPriceClarifyNoticeFlag: 0, // 价格澄清显示标识
      existClarifyNoticeFlag: 0, // 评审澄清显示标识
      rfxNum: '', // 询价单单号
      rfxTitle: '', // 询价单标题
      companyId: '', // 公司id
      quotationHeaderId: 0, // 供应商头id评审澄清需要
      scoreStatus: '', // 评分状态
      quotationDetailFieldVisible: false, // 专家评分节点 - 报价详情是否显示
      doubleUnitFlag: false, // 判断是否开启双单位
      riskScanFlag: false, // 判断租户是否购买“风险监控”/“风险扫描”服务，若未购买，则隐藏按钮；若购买，则显示按钮
      CheckPermissionObject: {}, // 权限集
      attachmentNewUILoading: true, // 过程控制按钮loading
      processAttachmentNewUIFlag: false, // 配置表，是否用新过程控制
      newQuotationFlag: false, // 新报价
      serviceChargeFlag: false,
      biddingHallFlag: false, // 配置是否开启新竞价
      sslmLifeCycleFlag: true,
      sslmLifeCycleNewUser: true,
      businessKey: '', // 流程单据主键 - 工作流相关
      approvaFlags: {}, // 工作流审批信息
      operationFlags: {}, // 工作流撤销审批信息
      headerGroupButtonMaxNum: -1, // 头按钮默认max_num数目
      exportPdfLoading: false,
      exportLoading: false,
      fileTemplateManageFlag: -1, // 是否启用招标文件管理标识
      checkPriceNewPage: null, // 核价-新明细
      useNewRateFlag: 0, // 是否使用老重合率标识
      isTechExpertFlag: false, // 是否是技术专家
      aiResultData: {},
    };

    this.bidFlag = this.props.sourceKey === BID;

    this.sourceCategoryName = getSourceCategoryName(this.bidFlag);

    this.documentTypeName = getDocumentTypeName(this.bidFlag);

    this.quotationName = getQuotationName(this.bidFlag);

    this.getOmitName = getOmitName(this.bidFlag);

    this.checkPriceName = getCheckPriceName(this.bidFlag);

    this.rfx = {
      sourceKey: props.sourceKey || INQUIRY,
      sourceKeyLowerCase: props.sourceKeyLowerCase || INQUIRY_LOWERCASE,
      bidFlag: this.bidFlag,
      sourceCategoryName: this.sourceCategoryName,
      documentTypeName: this.documentTypeName,
      quotationName: this.quotationName,
      omitName: this.getOmitName,
      checkPriceName: this.checkPriceName,
      unitCodeSymbol: getUnitCodePrefix(this.bidFlag, 'INQUIRY_HALL', 'INQUIRY_BID'),
      categoryCode: getCategoryCode(this.bidFlag),
    };
  }

  backToCheckPriceDs;

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};

    const { rfxId: prevRfxId = null } = prevParams || {};
    const { rfxId = null } = params;
    const RefreshFlag = rfxId && prevRfxId && prevRfxId !== rfxId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.updateRfxDetailQuery();
    }
  }

  componentDidMount() {
    this.fetchH0OrC7N();
    this.queryDoubleUnit();
    this.initRfxDetailQuery();
    this.fetchDetailCheckPermission();
    this.checkPriceUiDisplayConfig();
    this.handeleSearchProcessAttachmentConfig();
    this.newQuotationConfigSheet();
    this.fetchBiddingHallConfig();
    this.handeleSearchSslmLifeCycleConfig();
    this.queryBidFileTemplateConfig();
    this.fetchUseOldRate();
    this.queryIsTechExpert();
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

  // 查询是否是技术专家
  async queryIsTechExpert() {
    const {
      match: { params = {} },
    } = this.props || {};
    const res = await fetchISTechExpert({
      sourceHeaderId: params.rfxId,
      sourceFrom: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        isTechExpertFlag: res === '1',
      });
    } else {
      this.setState({
        isTechExpertFlag: false,
      });
    }
  }

  /**
   * 获取权限集的权限
   */
  async fetchDetailCheckPermission() {
    const prefix = this.bidFlag
      ? 'ssrc.new-bid-hall.button.'
      : 'ssrc.new-inquiry-hall.list.button.';
    const permissionList = [
      `${prefix}inquiry.clarifyquestion`, // 澄清答疑按钮
      this.bidFlag
        ? `bid-inquiry-hall.button.inquiry.clarifyRecords`
        : `new-inquiry-hall.button.inquiry.clarifyRecords`, // 澄清记录
    ];

    const result = getResponse(await checkPermission(permissionList));
    if (result && !result.failed) {
      const permissionObj = {};
      result.forEach((r = {}) => {
        const { code = null } = r;
        if (!code) {
          return;
        }

        let newCode = code;
        newCode = newCode.substr(code.lastIndexOf('.') + 1);
        if (r.controllerType === 'hidden' || !r.approve) {
          // 隐藏
          permissionObj[newCode] = 'hidden';
        } else {
          permissionObj[newCode] = 'default';
        }
      });
      this.setState({
        CheckPermissionObject: permissionObj,
      });
    }
  }

  async queryAttachmentCount(newCheckFlag) {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchAttachmentCount({ rfxHeaderId: params.rfxId, newCheckFlag: newCheckFlag ? 1 : 0 })
    );
    if (result) {
      this.setState({
        attachmentCount: Number(result?.fileCount || 0) > 99 ? '99+' : result?.fileCount,
      });
    }
  }

  /**
   * 查询过程下载附件配置表
   */
  async handeleSearchProcessAttachmentConfig() {
    const result = getResponse(await queryProcessAttachmentConfig());
    try {
      if (result) {
        this.setState({
          processAttachmentNewUIFlag: !result?.length,
        });
        this.queryAttachmentCount(!result?.length);
      }
    } finally {
      this.setState({
        attachmentNewUILoading: false,
      });
    }
  }

  // 寻源功能控制黑白名单
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj =
        res.find(
          (item) => item.function === 'BUTTON_GROUP_FIVE_BUTTONS' && item.whiteFlag === '1'
        ) || {}; // 议价

      let newPriceDetail = 1;

      res.forEach((item) => {
        const { function: code } = item || {};

        if (code === 'PRICE_VERIFICATIONG_DETAILS_SWITCH_C7N') {
          newPriceDetail = 0;
        }
      });

      this.setState({
        headerGroupButtonMaxNum: !isEmpty(bargainObj) ? 5 : -1,
        checkPriceNewPage: newPriceDetail,
      });
    }
  };

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  /**
   * 查询开启新360页面的租户
   */
  async handeleSearchSslmLifeCycleConfig() {
    const result = getResponse(await querySslmLifeCycleConfig());
    if (result) {
      this.setState({
        sslmLifeCycleFlag: !!result?.length,
        sslmLifeCycleNewUser: !result?.length,
      });
    }
  }

  // 查询招标文件模板是否启用
  async queryBidFileTemplateConfig() {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_file_template_cnf',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        // 使用白名单，在配置表使用文件管理，后期会改成黑名单
        this.setState({
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

  async updateRfxDetailQuery() {
    const IsPublic = this.isPubPage();

    if (IsPublic) {
      this.fetchConfigSheetRfxPrepare();
      this.fetchRfx();
      return;
    }

    this.fetchPageMain();
    this.queryIsTechExpert();
    this.handeleSearchProcessAttachmentConfig();
  }

  fetchPageMain = async () => {
    const {
      location: { search, state },
    } = this.props;
    const { inComingStatus = '' } = querystring.parse(search.substr(1));
    const AllConfigs = await this.fetchRfxDetailConfigs();
    if (isEmpty(AllConfigs)) {
      return;
    }

    const {
      currentStep = null,
      visibleOldPrepareConfigSheet = false,
      rfxDetailProcessList,
    } = AllConfigs;
    if (currentStep === 'RELEASE_PREPARE' && !visibleOldPrepareConfigSheet) {
      return; // 寻源准备节点，并且需要显示新ui,走子组件内的查询
    }

    const currentStage = rfxDetailProcessList?.find((ele) => ele.nodeFlag === 0);
    const incomingStage = rfxDetailProcessList?.find((ele) => ele.nodeStatus === inComingStatus);

    if (currentStage?.nodeSeq > incomingStage?.nodeSeq && incomingStage) {
      this.setState({
        currentStep: inComingStatus,
      });
      this.fetchRfxDetailLayout(); // 寻源准备节点，并且老ui,查询横竖版本配置
      if (inComingStatus === 'RELEASE_PREPARE') {
        return;
      }
      this.fetchRfx();
      return;
    }

    this.setState({
      currentStep: state?.autoLocationStepNode || currentStage?.nodeStatus,
    });

    this.fetchRfxDetailLayout(); // 寻源准备节点，并且老ui,查询横竖版本配置
    // const isSection = this.judgeSectionBid();
    if (currentStep === 'RELEASE_PREPARE') {
      return;
    }
    this.fetchRfx();
  };

  /**
   * 刷新全页面，内外部均可使用
   */
  @Bind()
  refreshAllPage() {
    this.initRfxDetailQuery();
  }

  // 寻源明细加载初始查询
  async initRfxDetailQuery() {
    const {
      location: { search },
      match: { params = {} },
      remote,
    } = this.props;
    const { rfxId = null } = params || {};
    const { inComingStatus = '' } = querystring.parse(search.substr(1));
    const IsPublic = this.isPubPage();
    idValidation(rfxId);
    if (!rfxId) {
      return;
    }

    this.fetchConfig();
    this.fetchServiceChargeConfig();

    if (IsPublic) {
      await this.fetchConfigSheetRfxPrepare();
      await this.fetchRfx();
      return;
    }
    this.fetchRfx(); // 为了给 `比价助手` 传递 `sourceCategory` 属性, 因此主动调接口

    const AllConfigs = await this.fetchRfxDetailConfigs();
    if (isEmpty(AllConfigs)) {
      return;
    }

    const {
      currentStep = null,
      visibleOldPrepareConfigSheet = false,
      rfxDetailProcessList,
    } = AllConfigs;
    if (currentStep === 'RELEASE_PREPARE' && !visibleOldPrepareConfigSheet) {
      return; // 寻源准备节点，并且需要显示新ui,走子组件内的查询
    }
    const currentStage = rfxDetailProcessList?.find((ele) => ele.nodeFlag === 0);
    const incomingStage = rfxDetailProcessList?.find((ele) => ele.nodeStatus === inComingStatus);

    if (incomingStage && currentStage?.nodeSeq > incomingStage?.nodeSeq) {
      this.setState({
        rfxDetailProcessList,
        currentStep: inComingStatus,
      });
      this.fetchRfxDetailLayout(); // 寻源准备节点，并且老ui,查询横竖版本配置
      this.queryWithStepChange(inComingStatus);
      return;
    }

    let currentStepNode = currentStep;

    currentStepNode = remote
      ? remote.process('INQUIRY_HALL_DETAIL_INITRFXDETAILQUERY_CURRENTSTAGESTEP', currentStepNode, {
          that: this,
          incomingStage,
          AllConfigs,
        })
      : currentStepNode;

    if (remote?.event) {
      await remote.event.fireEvent('remoteHandelSetCurrentStep', {
        that: this,
        incomingStage,
        AllConfigs,
        currentStepNode,
      });
    }

    this.fetchRfxDetailLayout(); // 寻源准备节点，并且老ui,查询横竖版本配置
    this.queryWithStepChange(currentStepNode);
  }

  // 查询明细页配置信息
  async fetchRfxDetailConfigs() {
    const { organizationId, match = {} } = this.props;
    const { rfxId: rfxHeaderId = null } = match.params;
    idValidation(rfxHeaderId);

    let newConfigs = {};

    try {
      let configs = await fetchRfxDetailConfigs({
        organizationId,
        rfxHeaderId,
        configKeys: [
          'sourceLayout',
          'checkPriceWay',
          `checkPriceWay#${rfxHeaderId}`,
          'sectionBidSwitchInform',
        ],
        tableCode: 'source_old_ui_config',
        condition: {
          tenant: getCurrentTenant().tenantNum,
        },
        ...this.pubRouterAddParams(),
      });
      configs = getResponse(configs);
      if (!configs) {
        return;
      }

      newConfigs = await this.initPageConfigs(configs);
      this.setState({
        ...newConfigs,
      });
      return newConfigs;
    } catch (e) {
      throw e;
    }
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const { organizationId, match } = this.props;
    const { rfxId: rfxHeaderId = null } = match.params;
    idValidation(rfxHeaderId);
    let newQuotationFlag = false;

    const param = {
      organizationId,
      rfxHeaderId,
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

  // 查询配置表--是否启用竞价大厅
  fetchBiddingHallConfig = async () => {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const rfxHeaderId = params?.rfxId;
    let biddingHallFlag = null;

    try {
      biddingHallFlag = await fetchBiddingHallConfigResult({
        organizationId,
        groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
        rfxHeaderId,
        roleOmitFlag: 1,
      });
      if (biddingHallFlag === null) {
        return;
      }
      this.setState({ biddingHallFlag: !!biddingHallFlag });
    } catch (e) {
      throw e;
    }
  };

  async initPageConfigs(configs = {}) {
    const {
      location: { state },
      remote,
      match = {},
    } = this.props;
    const { rfxId: rfxHeaderId = null } = match.params || {};
    let newConfigs = {};
    if (isEmpty(configs)) {
      return newConfigs;
    }

    const { currentStep = null } = this.state;
    let processBar = [];
    // 海亮教育 processBar = [] 埋点
    const getProcessBar = (params = {}) => {
      const { list = [] } = params;
      processBar = list;
    };
    const eventProps = {
      configs,
      list: configs?.processBar || [],
      getProcessBar,
    };
    if (remote?.event) {
      await remote.event.fireEvent('handleGetProcessBar', eventProps);
    } else {
      getProcessBar(eventProps);
    }
    const { userConfig = {}, formSite = null } = configs || {};

    if (!isEmpty(processBar)) {
      let current = [];
      let currentNodeFlag = 1;

      let scoringSeq = null; // 评分节点seq

      processBar.forEach((step) => {
        const { nodeFlag = null, nodeStatus = null } = step || {};
        if (nodeFlag === 0) {
          current = step;
        }

        // add: 评分节点: 报价详情列是否展示逻辑 - 当前节点需要在评分节点之后才可以显示报价详情列
        if (step.nodeStatus === 'SCORING') {
          scoringSeq = step.nodeSeq;
        }

        if (currentStep && currentStep === nodeStatus) {
          currentNodeFlag = nodeFlag;
        }
      });

      if (!isEmpty(current)) {
        let currentNodeStatus = current.nodeStatus || null;
        if (currentStep && currentNodeFlag !== 1) {
          currentNodeStatus = currentStep;
        }

        let quotationDetailFieldVisible;
        // 海亮教育 quotationDetailFieldVisible 埋点
        const getQuotationDetailFieldVisible = (params = {}) => {
          const { visible } = params;
          quotationDetailFieldVisible = visible;
        };
        const remoteProps = {
          configs,
          visible: !isNull(scoringSeq) && current.nodeSeq > scoringSeq,
          getQuotationDetailFieldVisible,
        };
        if (remote?.event) {
          remote.event.fireEvent('handleGetQuotationDetailFieldVisible', remoteProps);
        } else {
          getQuotationDetailFieldVisible(remoteProps);
        }

        newConfigs = {
          ...newConfigs,
          quotationDetailFieldVisible,
          rfxDetailProcessList: processBar,
          currentStep: state?.autoLocationStepNode || currentNodeStatus, // 当从核价点击查看专家评分进入, 自动定位到专家评分节点
          configs, // 海亮教育用到接口参数
        };
      }
    }

    if (!isEmpty(userConfig)) {
      const { checkPriceWay = {}, sourceLayout = {}, sectionBidSwitchInform = {} } =
        userConfig || {};
      const checkPriceWaySingle = userConfig[`checkPriceWay${rfxHeaderId}`];
      const { configValue: checkPriceWayValue = null } =
        (isEmpty(checkPriceWaySingle) ? checkPriceWay : checkPriceWaySingle) || {};
      const { configValue: sourceLayoutValue = null } = sourceLayout || {};

      newConfigs = {
        ...newConfigs,
        checkWay: checkPriceWayValue,
        isHorizontal: sourceLayoutValue === 'HORIZONTAL',
        sectionBidSwitchInformConfig: sectionBidSwitchInform,
      };

      this.handleSectionBidInform(sectionBidSwitchInform);
    }

    newConfigs.visibleOldPrepareConfigSheet = !!formSite && !isEmpty(formSite);

    return newConfigs;
  }

  // 查询配置表
  fetchConfig = async () => {
    const { organizationId } = this.props;
    const { configSheet = {} } = this.state;
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        configSheet: { ...configSheet, sprmOldUiConfig: !isEmpty(data) },
      });
    } catch (e) {
      throw e;
    }
  };

  // 查询配置表--是否展示标书下载节点
  fetchServiceChargeConfig = async () => {
    const { organizationId } = this.props;
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!(!isEmpty(data) && isArray(data) && data[0].id)) {
        this.setState({
          // 即接口返回空就展示标书下载节点，有值则不显示
          serviceChargeFlag: true,
        });
      }
    } catch (e) {
      throw e;
    }
  };

  // 标段通知
  handleSectionBidInform = (sectionBidSwitchInform = {}) => {
    const isSection = this.judgeSectionBid();
    if (!isSection || isEmpty(sectionBidSwitchInform)) {
      return;
    }
    const { configValue } = sectionBidSwitchInform;
    const visible = !configValue || configValue === 'display';

    if (visible) {
      this.toggleSectionSwitchWarningVisible(true);
    }
  };

  // 多标段切换提示弹窗
  renderSectionBatchModal = () => {
    const { sectionSwitchWarningVisible = false } = this.state;
    if (!sectionSwitchWarningVisible) {
      return null;
    }

    return (
      <Modal
        visible={sectionSwitchWarningVisible}
        title={null}
        footer={null}
        width="600px"
        closable={false}
      >
        <Icon type="exclamation-circle-o" style={{ color: '#faad14', marginRight: '8px' }} />
        <span>
          {intl
            .get('ssrc.inquiryHall.view.modal.sectionInformCurrentOperate')
            .d('所有按钮均为针对当前标段操作, 若要对不同标段操作, 请切换标段')}
        </span>
        <Button onClick={this.sectionInformOk} style={{ marginLeft: '16px', marginRight: '8px' }}>
          {intl.get('ssrc.inquiryHall.view.modal.notPrompt').d('不再提示')}
        </Button>
        <Button type="primary" onClick={() => this.toggleSectionSwitchWarningVisible()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </Modal>
    );
  };

  // 分标段-切换提示配置
  toggleSectionSwitchWarningVisible = (visible = false) => {
    this.setState({
      sectionSwitchWarningVisible: visible,
    });
  };

  // 标段通知-modal-ok
  sectionInformOk = async () => {
    const { organizationId, userId } = this.props;
    const { sectionBidSwitchInformConfig = {} } = this.state;

    try {
      let data = await changeUserConfig({
        organizationId,
        userId,
        enabledFlag: 1,
        ...sectionBidSwitchInformConfig,
        configValue: 'hide',
        configDesc: 'rfxDetailSectionInform',
      });
      data = getResponse(data);
      if (!data) {
        return false;
      }

      this.setState({
        sectionBidSwitchInformConfig: data,
      });
      this.toggleSectionSwitchWarningVisible();
    } catch (e) {
      throw e;
    }
  };

  // 进度条查询
  async fetchRfxDetailProcessAll() {
    const { organizationId, match = {} } = this.props;
    const { rfxId: sourceHeaderId = null } = match.params;
    idValidation(sourceHeaderId);
    let currentNode = null;

    try {
      const rfxDetailProcessList = await fetchRfxDetailProcessAll({
        organizationId,
        sourceHeaderId,
      });
      if (!rfxDetailProcessList || isEmpty(rfxDetailProcessList)) {
        return;
      }

      const current = rfxDetailProcessList.filter((s) => s.nodeFlag === 0) || [];
      if (!isEmpty(current)) {
        const currentNodeStatus = current[0].nodeStatus || null;

        currentNode = currentNodeStatus;
        this.setState({
          rfxDetailProcessList,
          currentStep: currentNodeStatus,
        });
      }
    } catch (e) {
      throw e;
    }

    return currentNode;
  }

  // 配置表配置显示寻源准备节点新老内容
  async fetchConfigSheetRfxPrepare() {
    const {
      organizationId,
      location: { search },
    } = this.props;
    const { normalRouter = '0' } = querystring.parse(search.substr(1));
    let result = null;

    try {
      result = await fetchConfigSheetRfxPrepare({
        organizationId,
        tenant: getCurrentTenant().tenantNum,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      const HasConfig = result && !isEmpty(result);
      // 增加特殊判断是否显示准备页面
      this.setState({
        currentStep: normalRouter === '0' ? 'RELEASE_PREPARE' : 'CHECK_PENDING',
        visibleOldPrepareConfigSheet: HasConfig,
      });
      result = HasConfig;
    } catch (e) {
      throw e;
    }
    return result;
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  componentWillUnmount() {
    // 判断路由进来的是那个页面，清空对应的state
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const { routerParam } = this.state;
    if (routerParam.typeName === 'examinationDetail') {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          examinationHeader: {},
          examinationItemLine: [],
          examinationSupplierLine: [],
          examinationrfxDetailProcessList: [],
        },
      });
    } else {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          header: {},
          headerInfo: {},
          itemLine: [],
          supplierLine: [],
          rfxDetailProcessList: [],
          historys: '',
          evaluateExpertList: [],
          scoringNoneTempelate: [],
          scoringBusinessTempelate: [],
          scoringTechnologyTempelate: [],
          currentScoringExperts: [],
          itemQuotationDetail: [],
          QuotationDetailDataSource: {},
          itemQuotationPagination: {},
          rfxDetailPrequalHeader: {},
          prequalDetailPagination: {},
          prequalDetailList: [],
          rfxDetailQuotationList: [],
          rfxDetailQuotationPagination: {},
          rfxDetailOpenBidList: [],
          rfxDetailOpenBidPagination: {},
          itemQuoteLine: [],
          itemQuoteLinePagination: {},
          rfxDetailLayouts: {},
          expertScoreDetails: [],
          bidSectionList: {},
          scoreDetailList: [],
          tenderNoticeInfo: {},
        },
      });
    }
  }

  fetchIntelligentPreReview = async (otherData = {}) => {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const { rfxId: rfxHeaderId } = params;

    if (!rfxHeaderId) {
      return;
    }

    const data = {
      sourceHeaderId: rfxHeaderId,
      organizationId,
      categoryCode: 'RFX_CHECK',
      ...otherData,
    };

    try {
      let result = await fetchIntelligentPreReviewResult(data);
      result = getResponse(result);
      if (!result) {
        this.setState({
          aiResultData: {},
        });
        return;
      }

      this.setState({
        aiResultData: result || {},
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLineOfCheckPrice(page = {}) {
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
        rfxHeaderId: params.rfxId,
        // customizeUnitCode: 'SSRC.INQUIRY_HALL_DETAIL.ITEM_DETAIL',
      },
    });
  }

  /**
   * 物品明细 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchItemLineOfCheckPrice(changedPagination);
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchSupplierLineOfCheckPrice(changedPagination);
  }

  /**
   * 全部报价明细 - 查询
   */
  @Bind()
  fetchQuoteLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const { unitCodeSymbol } = this.rfx;

    dispatch({
      type: `${modelName}/fetchQuoteLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.ALL_QUOTATION`,
      },
    });
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLineOfCheckPrice(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchSupplierLineCheckPrice`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 获取专家数据
   *
   * @memberof Update
   */
  async fetchExpert() {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;

    await dispatch({
      type: `${modelName}/fetchExpertAllocationData`,
      payload: {
        organizationId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX', // 来源是bid/rfx
        expertStatus: 'SUBMITTED', // 查询提交后的专家数据
        ...this.pubRouterAddParams(),
      },
    });
  }

  /**
   * 获取评分要素数据
   *
   * @memberof Update
   */
  async fetchScoring() {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;

    await dispatch({
      type: `${modelName}/fetchTempelateDetailData`,
      payload: {
        organizationId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX',
        indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
        ...this.pubRouterAddParams(),
      },
    });
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  playView() {
    this.setState({
      operationRecordModalVisible: true,
    });
  }

  // 单据退回到核价状态
  @Bind()
  backToCheckPrice() {
    const {
      modelName = 'inquiryHall',
      [modelName]: { header = {} },
    } = this.props;
    const { serviceChargeFlag } = this.state;
    const { suggestedSupplierFlag = false, bidBond = 0, bidFileExpense = 0 } = header;
    // 需要考虑特殊场景:招标文件费和保证金在对应标识bidBondFlag和tenderFeeFlag为1时可能为null
    const bidFileExpenseReturnFlag = !!(
      (![null, 0].includes(bidFileExpense) || ![null, 0].includes(bidBond)) &&
      suggestedSupplierFlag
    );
    this.backToCheckPriceDs = new DataSet(backToCheckPriceDS());
    const Props = {
      bidFlag: this.bidFlag,
      backToCheckPriceDs: this.backToCheckPriceDs,
    };
    C7NModal.open({
      key: 'ssrc-roll-back-check-price',
      title: intl
        .get('ssrc.inquiryHall.view.button.commonBackToCheckPrice', {
          checkPriceName: this.checkPriceName,
        })
        .d('退回至{checkPriceName}'),
      drawer: true,
      closable: true,
      children: <BackToCheckPrice {...Props} />,
      onOk: async () => {
        const flag = await this.backToCheckPriceDs.validate();
        if (!flag) return false;
        C7NModal.confirm({
          key: 'ssrc-back-to-check-modal',
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: (
            <span>
              {serviceChargeFlag && bidFileExpenseReturnFlag
                ? intl
                    .get('ssrc.inquiryHall.view.title.refundOfExpensesConfirm', {
                      checkPriceName: this.checkPriceName,
                    })
                    .d('本项目存在寻源费用，请确定是否退回至{checkPriceName}')
                : intl
                    .get(`ssrc.inquiryHall.view.title.commonModalConfirm`, {
                      checkPriceName: this.checkPriceName,
                    })
                    .d('本单据将退回至{checkPriceName}，是否确认？')}
            </span>
          ),
          footer: (
            <>
              <C7NBtn onClick={this.handleCancel}>
                {intl.get(`hzero.common.button.cancel`).d('取消')}
              </C7NBtn>
              <C7NBtn color="primary" onClick={this.handleConfirm}>
                {intl.get(`hzero.common.button.confirm`).d('确认')}
              </C7NBtn>
            </>
          ),
        });
      },
    });
  }

  // 确认框
  handleConfirm = async () => {
    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    const queryParams = {
      tenantId: organizationId,
      organizationId,
      rfxHeaderId: params.rfxId,
      checkRollbackRemark: this.backToCheckPriceDs?.current?.get('checkRollbackRemark'),
    };
    const res = await backToCheckPriceValidate(queryParams);
    if (getResponse(res)) {
      if (res?.warnFlag === 1) {
        this.handleCancel();
        const confirmParams = {
          tenantId: organizationId,
          organizationId,
          rfxHeaderId: params.rfxId,
          confirmFlag: 1,
        };
        C7NModal.confirm({
          key: C7NModal.key(),
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: <span>{res?.warnMessage}</span>,
          footer: (
            <>
              <C7NBtn onClick={this.handleCancel}>
                {intl.get(`hzero.common.button.cance`).d('取消')}
              </C7NBtn>
              <C7NBtn
                color="primary"
                onClick={async () => {
                  const resp = await backToCheckPriceConfirm(confirmParams);
                  if (getResponse(resp)) {
                    notification.success({
                      message: intl.get('hzero.common.message.notification').d('操作成功!'),
                    });
                    this.handleCancel();
                    this.initRfxDetailQuery();
                  }
                }}
              >
                {intl.get(`hzero.common.button.confirm`).d('确认')}
              </C7NBtn>
            </>
          ),
        });
      } else {
        const confirmParams = {
          tenantId: organizationId,
          organizationId,
          rfxHeaderId: params.rfxId,
          confirmFlag: 1,
          checkRollbackRemark: this.backToCheckPriceDs?.current?.get('checkRollbackRemark'),
        };
        const resp = await backToCheckPriceConfirm(confirmParams);
        if (getResponse(resp)) {
          notification.success({
            message: intl.get('hzero.common.message.notification').d('操作成功!'),
          });
          this.handleCancel();
          this.initRfxDetailQuery();
        }
      }
    }
  };

  handleCancel = () => {
    C7NModal.destroyAll();
  };

  // OPERATION BUTTON LOADING
  toggleOperationLoading = (operationLoadding = false) => {
    this.setState({
      operationLoadding,
    });
  };

  // 评分要素-专家分配 打开model
  @Bind()
  openAssignExpertModal(record) {
    const { organizationId, dispatch, modelName = 'inquiryHall' } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: `${modelName}/fetchEvaluateIndicAssign`,
      payload: {
        organizationId,
        evaluateIndicId: record.evaluateIndicId || '',
        evaluateIndicCategory: record.team || '',
        sourceHeaderId: record.sourceHeaderId,
      },
    });
  }

  // 评分要素-专家分配 关闭model
  @Bind()
  cancelAssignExpert() {
    this.setState({
      evaluateAssignModalVisible: false,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    this.setState({ operationRecordModalVisible: false });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  /**
   * 专家评分,评分详情
   * */
  // fetchExpertScoreDetails() {
  //   const {
  //     dispatch,
  //     organizationId,
  //     match: { params = {} },
  //   } = this.props;

  //   dispatch({
  //     type: `${modelName}/fetchExpertScoreDetails`,
  //     payload: { organizationId, sourceHeaderId: params.rfxId, sourceFrom: 'RFX' },
  //   });
  // }

  /**
   * 专家评分步骤下－查询推荐候选人
   *
   * @memberof ConfirmCandidate
   */
  // fetchEvaluateSummary() {
  //   const {
  //     dispatch,
  //     organizationId,
  //     match: { params = {} },
  //   } = this.props;

  //   dispatch({
  //     type: `${modelName}/fetchEvaluateSummary`,
  //     payload: { organizationId, sourceHeaderId: params.rfxId, sourceFrom: 'RFX' },
  //   });
  // }

  /**
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  directorQuotationDetail(record = {}) {
    const {
      remote,
      match: {
        params: { rfxId = null },
      },
    } = this.props;
    const { newQuotationFlag = false } = this.state;
    const { supplierCompanyId, quotationHeaderId } = record;

    const activetabKey = getActiveTabKey();

    if (!rfxId || !supplierCompanyId) {
      return;
    }

    if (remote?.event) {
      remote.event.fireEvent('remotePreDirectorQuotation', {
        rfxHeaderId: rfxId,
      });
    }

    // 新报价
    if (newQuotationFlag) {
      const currentTitle = this.bidFlag
        ? 'srm.common.tab.title.bidDetail'
        : 'srm.common.tab.title.quotationDetail';
      const currentAction = this.bidFlag
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
        : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情');

      const searchObj = {
        rfxHeaderId: rfxId,
        noBackFlag: 1, // openTab 不需要返回
        pageType: 'SUPPLIER_DETAIL_QUERY',
        switchUrl: [
          '/ssrc/new-inquiry-hall',
          '/ssrc/new-bid-hall',
          '/ssrc/expert-scoring',
          '/ssrc/query-rfq',
        ].includes(activetabKey)
          ? 2
          : 1,
      };
      let newQuotationPath = `/ssrc/supplier-reply/query/${quotationHeaderId}`;
      if (this.bidFlag) {
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
      refreshTab(newQuotationPath);
      return;
    }

    const search = querystring.stringify({
      quotationHeaderId,
      switchUrl: [
        '/ssrc/new-inquiry-hall',
        '/ssrc/new-bid-hall',
        '/ssrc/expert-scoring',
        '/ssrc/query-rfq',
      ].includes(activetabKey)
        ? 2
        : 1,
      noBackFlag: true,
    });

    let path = '';
    switch (activetabKey) {
      case '/ssrc/new-project-setup':
        path = `${activetabKey}/${
          this.bidFlag ? 'bid' : 'rfx'
        }-quotation-detail/${rfxId}/${supplierCompanyId}`;
        break;
      case '/ssrc/query-rfq':
        path = `${activetabKey}/${
          this.bidFlag ? 'detail' : 'rfx-quotation-detail'
        }/${rfxId}/${supplierCompanyId}`;
        break;
      case '/ssrc/new-bid-hall':
        path = `${activetabKey}/detail/${rfxId}/${supplierCompanyId}`;
        break;
      default:
        path = `${activetabKey}/${
          this.bidFlag ? 'bid-quotation-detail' : 'detail'
        }/${rfxId}/${supplierCompanyId}`;
        break;
    }

    openTab({
      key: `${path}#${quotationHeaderId}`,
      title: this.bidFlag
        ? 'srm.common.tab.title.bidDetail'
        : 'srm.common.tab.title.quotationDetail',
      action: this.bidFlag
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
        : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情'),
      path,
      search,
      closable: true,
    });
    refreshTab(path);
  }

  routerParam;

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
   * 评分下－评分明细－总分构成
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetailOfTotalPoints(record = {}) {
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
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  cancelScoreDetailModal() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        scoreDetailList: [],
      },
    });

    this.setState({
      scoreDetailModalVisible: false,
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { unitCodeSymbol } = this.rfx;
    const { itemCode, itemName, supplierCompanyName, rfxLineItemId } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        supplierCompanyName,
      },
    });
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelyTable`,
      payload: {
        rfxLineItemId,
        organizationId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.PREPARE_ITEMLINE.LADDER_LEVEL`,
      },
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

  /**
   * 打开报价-阶梯报价模态框
   */
  @Bind()
  viewLadderLevelQuotaModal(record = {}) {
    const lineRecordData = record || {};
    const { itemCode, itemName, companyName, quotationLineId } = lineRecordData;
    this.setState({
      viewLadderLevelQuotaVisible: true,
      LadderLevelHeaderData: {
        ...lineRecordData,
        itemCode,
        itemName,
        supplierCompanyName: companyName,
      },
    });
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelTable`,
      payload: {
        quotationLineId,
        organizationId,
        customizeUnitCode: `SSRC.${
          modelName === INQUIRY ? INQUIRY : 'NEW_BID'
        }_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`,
      },
    });
  }

  /**
   * hideOperationRecord - 关闭报价-阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelQuotaModal() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    this.setState({ viewLadderLevelQuotaVisible: false });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  @Bind()
  async fetchRfx() {
    const { dispatch, organizationId, match, modelName = 'inquiryHall', remote } = this.props;
    const {
      path = null,
      params: { rfxId: rfxHeaderId = null },
    } = match;
    const { routerParam } = this.state;
    const page = {};
    const { unitCodeSymbol } = this.rfx || {};
    idValidation(rfxHeaderId);
    if (!rfxHeaderId || !organizationId) {
      return;
    }

    const res = await dispatch({
      type: `${modelName}/fetchInquiryHeaderDetail`,
      payload: {
        routerParam,
        organizationId,
        rfxHeaderId,
        path,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.HEADER_DETAIL,SSRC.${unitCodeSymbol}_DETAIL.HEADER_PREQUAL`,
        ...this.pubRouterAddParams(),
      },
    });
    // 询价单表头数据
    if (!res || isEmpty(res)) {
      return;
    }
    const {
      sourceMethod = null,
      expertScoreType = null,
      existClarifyFlag = 0,
      rfxNum,
      rfxTitle,
      companyId,
      quotationHeaderId = 0,
      scoreStatus,
      existClarifyNoticeFlag = 0,
      existPriceClarifyNoticeFlag = 0,
      businessKey,
    } = res || {};
    this.setState({
      existClarifyFlag,
      existClarifyNoticeFlag,
      existPriceClarifyNoticeFlag,
      rfxNum,
      rfxTitle,
      companyId,
      quotationHeaderId,
      scoreStatus,
      businessKey,
    });
    this.fetchBusinessInfo(businessKey);
    const industryVisible = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_INDUSTRYVISIBLE',
          sourceMethod && sourceMethod !== 'INVITE',
          { sourceMethod, inviteNoticeFlag: res.inviteNoticeFlag }
        )
      : sourceMethod && sourceMethod !== 'INVITE';

    if (industryVisible) {
      this.fetchTenderNotice();
    }
    if (sourceMethod === 'INVITE') {
      this.fetchSupplierLine(page);
    }
    if (expertScoreType && expertScoreType === 'ONLINE') {
      this.fetchExpert();
      this.fetchScoring();
    }
    // this.fetchLovInfo();
    // 物料行数据
    this.fetchItemLine(page);
  }

  // 查询审批按钮 撤销按钮 显示状态
  @Bind()
  async fetchBusinessInfo(businessKey) {
    if (!businessKey) return;
    const res = await queryBatchApprovaFlag([businessKey]);
    if (getResponse(res)) {
      this.setState({
        approvaFlags: res, // 工作流审批信息
      });
    }
    const res1 = await getBatchOperationFlag([businessKey]);
    if (getResponse(res1)) {
      this.setState({
        operationFlags: res1, // 工作流撤销审批信息
      });
    }
  }

  // // 查询询价单头
  // fetchRfxDetail(params = {}) {
  //   const { dispatch, organizationId, match, modelName = 'inquiryHall' } = this.props;
  //   const {
  //     path = null,
  //     params: { rfxId: rfxHeaderId = null },
  //   } = match;
  //   const { routerParam } = this.state;

  //   // 询价单表头数据
  //   dispatch({
  //     type: `${modelName}/fetchInquiryHeaderDetail`,
  //     payload: {
  //       routerParam,
  //       organizationId,
  //       rfxHeaderId,
  //       path,
  //       ...params,
  //     },
  //   });
  // }

  /**
   * 招标公告
   * */
  async fetchTenderNotice(data = {}) {
    const {
      dispatch,
      match: { params = {} },
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    await dispatch({
      type: `${modelName}/fetchTenderNotice`,
      payload: {
        ...data,
        organizationId,
        sourceFrom: 'RFX',
        sourceType: 'BR',
        sourceHeaderId: params.rfxId,
        ...this.pubRouterAddParams(),
      },
    });
  }

  // 询价单简单头查询
  fetchHeaderInfo() {
    const { dispatch, organizationId, match, modelName = 'inquiryHall' } = this.props;
    const { rfxId } = match.params;
    idValidation(rfxId);
    // 询价单表头数据
    dispatch({
      type: `${modelName}/fetchHeaderInfo`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
      },
    });
  }

  /**
   * 页面布局横竖版查询
   * */
  @Bind()
  fetchRfxDetailLayout() {
    const { dispatch, organizationId } = this.props;

    dispatch({
      type: `inquiryHall/fetchRfxDetailLayout`,
      payload: {
        organizationId,
        configKey: 'sourceLayout',
      },
    }).then((res) => {
      if (!res) {
        return;
      }

      this.setPageLayoutData(res);
    });
  }

  // 设置页面布局
  setPageLayoutData(result = {}) {
    const { configKey, configValue = '' } = result;

    if (configKey !== 'sourceLayout' || !configValue) {
      return;
    }

    this.setState({
      isHorizontal: configValue === 'HORIZONTAL',
    });
  }

  /**
   * 页面布局横竖版改变
   * */
  @debounce(500)
  @Bind()
  changeRfxDetailLayout(isHorizontalLayout = true) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      userId,
      [modelName]: { rfxDetailLayouts = {} },
    } = this.props;

    dispatch({
      type: `${modelName}/changeRfxDetailLayout`,
      payload: {
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'sourceLayout',
        ...rfxDetailLayouts,
        configKey: 'sourceLayout',
        configValue: isHorizontalLayout ? 'HORIZONTAL' : 'VERTICAL',
      },
    }).then((res = {}) => {
      if (!res) {
        return;
      }

      this.setPageLayoutData(res);
    });
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  async fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const { rfxId = null } = params || {};
    const { unitCodeSymbol } = this.rfx;
    if (!rfxId) {
      return;
    }

    await dispatch({
      type: `${modelName}/fetchInquiryItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.ITEM_LINE`,
        ...this.pubRouterAddParams(),
      },
    });
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  async fetchSupplierLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const { unitCodeSymbol } = this.rfx;
    await dispatch({
      type: `${modelName}/fetchInquirySupplierLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER.LINE`,
        ...this.pubRouterAddParams(),
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
    const { unitCodeSymbol } = this.rfx;
    dispatch({
      type: `${modelName}/supplierInquiryRecord`,
      payload: {
        organizationId,
        itemIds,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER.LINE`,
      },
    });
  }

  /**
   * 开标人-弹出滑窗
   */
  @Bind()
  openBidholder() {
    this.setState({
      bidholderVisible: true,
    });

    this.fetchOpenBidHolder();
  }

  // 查询开标人
  @Bind()
  fetchOpenBidHolder(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchBidholderList`,
      payload: { page, organizationId, rfxHeaderId: params.rfxId, rfxRole: 'OPENED_BY ' },
    });
  }

  /**
   * 关闭开标人弹框
   */
  @Bind()
  onCancel() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        bidHolderList: [],
        bidHolderPagination: {},
      },
    });
    this.setState({
      bidholderVisible: false,
      processVisible: false,
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
      modelName = 'inquiryHall',
    } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: `${modelName}/fetchPretrialPanel`,
        payload: {
          sourceHeaderId: params.rfxId,
          sourceFrom: 'RFX',
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

  // 招标公告预览
  @Bind()
  previewNotice() {
    const {
      match: { params },
    } = this.props;

    openTab({
      key: `/ssrc/inquiry-hall/tender-bid${this.bidFlag ? '-hall' : ''}-notice-preview/${
        params.rfxId
      }`,
      path: `/ssrc/inquiry-hall/tender-bid${this.bidFlag ? '-hall' : ''}-notice-preview/${
        params.rfxId
      }`,
      // title: intl.get(`ssrc.inquiryHall.view.title.tenderBidNotice`).d('招标公告'),
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      closable: true,
    });
  }

  // 准备阶段物料行阶梯报价
  @Bind()
  viewLadderLevelPrepare(record = {}) {
    const { unitCodeSymbol } = this.rfx;
    const itemCode = record.get('itemCode');
    const itemName = record.get('itemName');
    const rfxLineItemId = record.get('rfxLineItemId');
    const supplierCompanyName = record.get('supplierCompanyName');
    const { modelName = 'inquiryHall' } = this.props;

    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        rfxLineItemId,
        supplierCompanyName,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `${modelName}/fetchLadderLevelyTable`,
      payload: {
        rfxLineItemId,
        organizationId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.PREPARE_ITEMLINE.LADDER_LEVEL`,
      },
    });
  }

  /**
   * 打开评分要素定义模态框
   */
  @Bind()
  showScoringElement(header) {
    this.setState({
      scoringElementVisible: true,
    });
    this.fetchScoringElementData(header);
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData(headerInfo) {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    if (headerInfo.prequalHeaderId) {
      dispatch({
        type: `${modelName}/fetchScoringElementData`,
        payload: { prequalHeaderId: headerInfo.prequalHeaderId, organizationId },
      });
    }
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    dispatch({
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
   * 渲染进度条icon
   * @returns {*}
   */
  renderIcon(nodeFlag) {
    let icon;
    const logoStyle = {
      width: '24px',
      height: '24px',
    };
    const currentLogo = <img style={logoStyle} src={require('@/assets/radiopress.svg')} alt="" />;
    const nextLogo = <img style={logoStyle} src={require('@/assets/circle-o.svg')} alt="" />;
    const preLogo = <Icon type="check-circle-o" />;
    if (nodeFlag === 0) {
      icon = currentLogo;
    } else if (nodeFlag === 1) {
      icon = nextLogo;
    } else {
      icon = preLogo;
    }
    return icon;
  }

  /**
   * 设置步骤条的current
   * @returns {*}
   */
  setCurrent(rfxDetailProcessList) {
    const stage = rfxDetailProcessList && rfxDetailProcessList.filter((s) => s.nodeFlag === 0);
    const current = rfxDetailProcessList && rfxDetailProcessList.indexOf(stage[0]);
    return current;
  }

  /**
   * 进度条点击查看
   * */
  @Bind()
  changeStep(record = {}) {
    const { configs = {} } = this.state;
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {} },
    } = this.props;
    const { rfxStatus } = header;
    // 海亮教育 埋点
    const getNotification = (params = {}) => {
      const { nodeStatusMeaning } = params || {};
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.warning.noCurrentStatusView', { nodeStatusMeaning })
          .d(`尚未到${nodeStatusMeaning}阶段, 不能查看`),
      });
    };
    const { currentStep, visibleOldPrepareConfigSheet } = this.state;
    const { nodeStatus = null, nodeFlag = 0, nodeStatusMeaning = '' } = record || {};
    const {
      remote,
      match: { params },
    } = this.props;

    if (nodeFlag === 1) {
      const eventProps = {
        nodeStatusMeaning,
        configs,
        getNotification,
        record,
        nodeStatus,
        rfxStatus,
        bidFlag: this.bidFlag,
      };
      if (remote?.event) {
        remote.event.fireEvent('handleGetNotification', eventProps);
      } else {
        getNotification(eventProps);
      }
      return;
    }

    if (nodeStatus === currentStep) {
      return;
    }

    if (nodeFlag === 1 && this.WaittingStatus.includes(nodeStatus)) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.view.warning.lookForward').d('敬请期待'),
      });
      return;
    }

    if (remote?.event) {
      remote.event.fireEvent('remotePreChangeStep', {
        rfxHeaderId: params.rfxId,
        nodeStatus,
      });
    }

    this.setState({
      currentStep: nodeStatus,
    });

    if (!visibleOldPrepareConfigSheet && nodeStatus === 'RELEASE_PREPARE') {
      return; // 准备节点， 配置表显示新ui, 不查询
    }

    this.queryWithStepChange(nodeStatus);
  }

  /**
   * 点击进度条查询
   * */
  queryWithStepChange(status = null) {
    switch (status) {
      case 'RELEASE_PREPARE':
        // 横竖版
        this.fetchRfx();
        break;
      case 'IN_PREQUAL':
        break;
      case 'IN_QUOTATION':
        break;
      case 'OPEN_BID_PENDING':
        break;
      case 'CHECK_PENDING':
      case 'FINISHED':
        break;
      case 'SCORING':
        break;
      case 'PRETRIAL_PENDING':
      case 'IN_POSTQUAL':
        break;
      default:
        this.fetchRfx();
        break;
    }
  }

  // 核价下 依据卡片查询数据
  queryCheckPriceDetail(key = '') {
    switch (key) {
      case 'itemLine':
        this.fetchItemLineOfCheckPrice();
        break;
      case 'supplierLine':
        this.fetchSupplierLineOfCheckPrice();
        break;
      case 'quoteLine':
        this.fetchQuoteLine();
        break;
      default:
        this.fetchItemLineOfCheckPrice();
    }
  }

  /**
   * 渲染进度条
   * @returns {*}
   */
  renderStep(headerStyle = {}) {
    const { rfxDetailProcessList = [] } = this.state;
    let step = null;

    if (isEmpty(rfxDetailProcessList)) {
      return step;
    }

    step = (
      <div className={styles.steps} style={{ flex: '1 auto', ...headerStyle }}>
        <Steps current={this.setCurrent(rfxDetailProcessList)} size="default">
          {rfxDetailProcessList.map((s) => {
            const { nodeStatus = null, nodeStatusMeaning = null } = s;
            return (
              <Step key={nodeStatus} onClick={() => this.changeStep(s)} title={nodeStatusMeaning} />
            );
          })}
        </Steps>
      </div>
    );
    return step;
  }

  // 区分 寻源列表 | 招标列表
  distinguishUpdatePageUrl = () => {
    const { sourceKey } = this.props;

    let url = `/ssrc/new-inquiry-hall/list`;
    if (sourceKey === 'BID') {
      url = `/ssrc/new-bid-hall/list`;
    }

    return url;
  };

  /**
   * 渲染父路由
   * @returns {*}
   */
  renderParent() {
    const {
      match: { params },
      location: { search = '', state },
    } = this.props;
    if (state?.stateBackPath) {
      return state?.stateBackPath;
    }

    const { backPath = '', inComingStatus = '' } = querystring.parse(search.substr(1));
    if (backPath === '0' || backPath === 'NO') {
      return '';
    }

    const activetabKey = getActiveTabKey();
    const btnFlag = [
      'FINISHED',
      'SCORING',
      'CHECK_PENDING',
      'PRETRIAL_PENDING',
      'OPEN_BID_PENDING',
      'IN_QUOTATION',
      'IN_PREQUAL',
      'RELEASE_PREPARE',
    ].includes(inComingStatus);
    const isPub = this.isPubPage();
    const docLinkFlag = this.getFieldFromUrl('docLinkFlag');
    const disabledAllLinkFlag = this.isDisabledAllLink() || docLinkFlag;

    if (isPub && backPath) {
      // 如果是审批流并且search里拼有backPath，则显示返回按钮
      return backPath;
    } else if (isPub) {
      // 如果没有backPath，则不需要返回
      return null;
    } else if (disabledAllLinkFlag) {
      return null;
    }

    let backPack;
    let url;
    let query;
    const { routerParam } = this.state;
    const { sourcePage = null, historyTag = null, backRecommend = null, typeName = null } =
      routerParam || {};
    if (typeName === 'examinationDetail' || typeName === 'returnExaminationDetail') {
      url = '/ssrc/qualification-examination/list';
    } else if (sourcePage === 'confirm' && backRecommend !== 'recommend') {
      url = `/ssrc/inquiry-hall/confirm-candidate/${params.rfxId}?backRecommend=${backRecommend}&historyTag=${historyTag}`;
    } else if (
      backRecommend === 'expertDetailToInquiryHallDetail' ||
      backRecommend === 'recommend' ||
      backRecommend === 'BidEvaluateInquiryHallDetail'
    ) {
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activetabKey}`
          : `${backRecommend}+${activetabKey}`;
      backPack = JSON.parse(
        sessionStorage.getItem(key) || sessionStorage.getItem('sourceRouter') || '{}'
      )?.url?.split('?');
      if (backPack) {
        // eslint-disable-next-line prefer-destructuring
        url = backPack[0];
      } else {
        url = null;
      }
    } else if (sourcePage && sourcePage === 'project-setup') {
      url = '/ssrc/project-setup/list'; // 寻源立项
    } else if (sourcePage === 'QueryRfqList') {
      url = '/ssrc/query-rfq/list';
    } else if (sourcePage === 'order') {
      url = '/sodr/purchase-order-maintain/source-from-requisition/list';
    } else if (activetabKey === '/ssrc/new-project-setup') {
      // 从寻源项目面板跳转过来 TODO
      return `/ssrc/new-project-setup/detail/${routerParam.sourceProjectId}?current=newProjectSetup&projectLineSectionId=${routerParam.projectLineSectionId}`;
    } else {
      url = `${activetabKey}/list`;
    }
    // 如果来源是 /ssrc/new-${this.bidFlag ? 'bid' : 'inquiry'}-hall/other-detail/ 特殊处理返回列表页面逻辑
    const otherPath = `/ssrc/new-${this.bidFlag ? 'bid' : 'inquiry'}-hall/other-detail/`;
    const otherBackPath = `/ssrc/new-${this.bidFlag ? 'bid' : 'inquiry'}-hall/list`;
    if (activetabKey.includes(otherPath)) {
      url = otherBackPath;
    }
    if (backPack?.length > 1) {
      backPack = querystring.parse(backPack[1]);
      query = querystring.stringify(Object.assign({}, routerParam, backPack));
    } else {
      query = querystring.stringify(routerParam);
    }
    return !btnFlag ? `${url}?${query}` : '';
  }

  // 依据主键从数据源清除数据对象
  removeDuplicateById({ data = [], id = null, key = null }) {
    if (!data.length || !id || !key) {
      return [];
    }

    const NEWDATA = data.map((item) => {
      if (item[key] === id) {
        return false;
      }
      return item;
    });

    return (NEWDATA || []).filter(Boolean);
  }

  // 核价 物品列表 物品明细表格
  @Bind()
  fetchItemLineTableListCheckPrice(page = {}, item = {}) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      match: { params },
      [modelName]: { itemQuoteLine = [] },
    } = this.props;
    const { rfxLineItemId = null } = item;
    const { unitCodeSymbol } = this.rfx;

    const query = () => {
      this.setState({
        fetchItemQuoteLineLoading: true,
      });
      dispatch({
        type: `${modelName}/fetchItemQuoteLine`,
        payload: {
          page,
          organizationId,
          rfxLineItemId,
          rfxHeaderId: params.rfxId || null,
          customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.ITEM_DETAIL`,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            fetchItemQuoteLineLoading: false,
          });
        }
      });
    };

    const CurrentItemQuoteLine = itemQuoteLine.filter(
      (itemLine) => itemLine.rfxLineItemId === item.rfxLineItemId
    );
    if (isEmpty(CurrentItemQuoteLine)) {
      query();
    }

    if (!isEmpty(page)) {
      const NewItemQuotateLine = this.removeDuplicateById({
        data: itemQuoteLine,
        id: rfxLineItemId,
        key: 'rfxLineItemId',
      });

      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemQuoteLine: NewItemQuotateLine,
        },
      });
      query();
    }
  }

  @Bind()
  changeLayout(e = {}) {
    const layout = e.target.getAttribute('layout') || null;
    const isHorizontalCurrent = layout && layout === 'HORIZONTAL';
    const { isHorizontal = false } = this.state;

    if (isHorizontalCurrent === isHorizontal) {
      return;
    }

    this.changeRfxDetailLayout(isHorizontalCurrent);
  }

  // 发布准备 竖版 collapse keys change
  @Bind()
  changeRfxDetailVertical(key = []) {
    this.setState({
      PrepareCollapseKeys: key,
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
      item: {},
    });
  }

  // 打开寻源小组
  @Bind()
  openInquiryGroup() {
    this.setState({
      inquiryGroupVisibleFlag: true,
    });
  }

  // 关闭寻源小组
  @Bind()
  closeInquiryGroup() {
    this.setState({
      inquiryGroupVisibleFlag: false,
    });
  }

  @Bind()
  linktoPrNumDetail(record = {}, prHeaderId = '') {
    const { dispatch } = this.props;
    const { prSourcePlatform } = record;
    const { configSheet = {} } = this.state;
    const { sprmOldUiConfig = false } = configSheet;
    if (!prHeaderId) {
      return;
    }

    const isPub = this.isPubPage();
    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;

    if (!sprmOldUiConfig) {
      // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
      // 需要去采购申请工作台去适配此方案
      // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
      window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewDetail';

      pathUrl = isPub
        ? isErp
          ? `/pub/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/pub/sprm/purchase-platform/noerp-detail/${prHeaderId}`
        : isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isPub
        ? isErp
          ? `/pub/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/pub/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`
        : isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    dispatch(
      routerRedux.push({
        pathname: pathUrl,
      })
    );
  }

  @Bind()
  openProcessAttachmentModal() {
    this.setState({ processVisible: true });
  }

  @Bind()
  downloadAll() {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const rfxHeaderId = params.rfxId;
    idValidation(rfxHeaderId);
    const api = `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-all`;
    downloadFile({ requestUrl: api });
  }

  @Bind()
  handlePrint() {
    const {
      match: { params },
      organizationId,
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;
    const rfxHeaderId = params.rfxId;
    dispatch({
      type: `${modelName}/queryPrint`,
      payload: { rfxHeaderId, organizationId, firstFlag: 0 },
    }).then((res) => {
      if (res) {
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = res;
        tempLink.setAttribute(
          'download',
          decodeURIComponent(
            `${intl
              .get('ssrc.priceComparison.model.priceComparison.quoteDetailEp')
              .d('报价明细导出')}.xls`
          )
        );
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  }

  // 比价助手
  renderPriceComparisionButton = (currentStep = null) => {
    // return currentStep === 'FINISHED' || currentStep === 'CHECK_PENDING' ? (
    //   <Button type="default" onClick={this.priceComparisonAssistant} className="no-border-btn">
    //     <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
    //     {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
    //   </Button>
    // ) : null;
    // 比价助手
    const { modelName = 'inquiryHall' } = this.props;
    // const { checkPriceUiIsNew } = this.state;
    const {
      [modelName]: { header = {}, checkPriceHeader = {} },
      match: { params = {} },
      location,
      history,
      remote,
    } = this.props;
    const { isTechExpertFlag = false } = this.state;
    const disabledAllLinkFlag = this.isDisabledAllLink();
    const { sourceCategory, diyLadderQuotationFlag, biddingTarget } =
      (isEmpty(checkPriceHeader) ? header : checkPriceHeader) || {};
    const priceComparisonProps = {
      biddingTarget,
      rfxId: params.rfxId,
      // showPriceComparison: !checkPriceUiIsNew, // 临时，上线还得取反
      // onHideModal: this.hidePriceComparison,
      sourceCategory,
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
      location,
      history,
      disabledAllLinkFlag,
      pubRouterAddParams: this.pubRouterAddParams,
    };

    let buttonShowFlag = isTechExpertFlag
      ? false
      : !!(currentStep === 'FINISHED' || currentStep === 'CHECK_PENDING');

    buttonShowFlag = remote
      ? remote.process('INQUIRY_HALL_DETAIL_PROCESS_PRICE_COMPARISION_VISIBLE', buttonShowFlag, {
          that: this,
        })
      : buttonShowFlag;

    return buttonShowFlag
      ? {
          name: 'priceAssistant',
          btnType: 'c7n-pro',
          btnProps: {
            // type: 'default',
            onClick: () => this.handleRenderPriceCompare(priceComparisonProps),
            funcType: 'flat',
          },
          child: (
            <>
              <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
              {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
            </>
          ),
        }
      : null;
  };

  // 判断是否是本模块的/pub页面
  isPubPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub'); // /pub/ssrc/inquiry-hall/rfx-detail/:rfxId
    const IsExternalPub = this.judgeExternalPbPage();
    return IsPublic && !IsExternalPub;
  };

  /**
   * 禁用当前页面，子页面，子组件的所有页面跳转功能，禁用当前页面的返回功能
   * @return boolean // disabledAllLinkFlag
   * */
  isDisabledAllLink = () => {
    const disabledAllLinkFlag = this.getFieldFromUrl('disabledAllLinkFlag');
    const docLinkFlag = this.getFieldFromUrl('docLinkFlag');
    const externalPubUnLinkFlag =
      disabledAllLinkFlag === '1' || disabledAllLinkFlag === 1 || docLinkFlag;

    return externalPubUnLinkFlag;
  };

  // 从路由参数取字段值
  getFieldFromUrl = (key = '') => {
    if (!key) {
      return;
    }
    const {
      location: { search },
    } = this.props;

    const routerParam = querystring.parse(search.substr(1));
    const { [key]: value = null } = routerParam || {};
    return value;
  };

  // 获取标段id
  getProjectLineSectionId = () => {
    const projectLineSectionId = this.getFieldFromUrl('projectLineSectionId');
    return projectLineSectionId;
  };

  // 判断是否是外部使用的pub页面, search.externalPb '1'
  judgeExternalPbPage = () => {
    const externalPb = this.getFieldFromUrl('externalPb');
    return externalPb === '1';
  };

  // 判断是否分标段
  judgeSectionBid = () => {
    const projectLineSectionId = this.getProjectLineSectionId();
    const isPubPage = this.isPubPage();

    return projectLineSectionId && !isPubPage;
  };

  // 分标段路由切换
  locatedCurrentUrl = (data = {}) => {
    const {
      history,
      location: { search = null },
      match: { path = null },
    } = this.props;
    const {
      sourceHeaderId = null,
      projectLineSectionId = null,
      sourceHeaderNum: rfxNum,
      sourceTitle: rfxTitle,
    } = data;

    this.setState({
      rfxNum,
      rfxTitle,
      currentStep: '',
    });
    const routerParam = querystring.parse(search.substr(1));
    const { current = null } = routerParam || {};
    if (!sourceHeaderId) {
      return;
    }

    const pathname = path.replace(/:rfxId/, sourceHeaderId);
    const routerSearch = querystring.stringify({
      ...routerParam,
      current,
      projectLineSectionId,
    });

    history.replace({
      pathname,
      search: routerSearch,
    });
  };

  /**
   *导出  此方法被 [阳光能源]重写, 请合理修改!!!
   *@protected
   */
  @Bind()
  async exportData(rfxHeaderId) {
    this.setState({
      exportLoading: true,
    });
    const res = getResponse(await exportInquiryHallInfo({ rfxHeaderId }));
    if (isText(res)) {
      const name = `${intl
        .get('ssrc.inquiryHall.model.inquiryHall.commonInquiryInfoExport', {
          sourceCategoryName: this.sourceCategoryName,
        })
        .d('{sourceCategoryName}信息导出')}.pdf`;
      // 创建a标签，用于跳转至下载链接
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = res;
      tempLink.setAttribute('download', decodeURIComponent(name));
      // 兼容：某些浏览器不支持HTML5的download属性
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }
      // 挂载a标签
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    }
    this.setState({
      exportLoading: false,
    });
  }

  /**
   *导出模板打印PDF
   *@protected
   */
  @Bind()
  exportPDFData() {
    const {
      match: { params },
    } = this.props;
    const queryParams = {
      rfxHeaderId: params.rfxId,
    };
    this.setState({
      exportPdfLoading: true,
    });
    downLoadPDFToken(queryParams).then((res) => {
      if (getResponse(res)) {
        downLoadPDFFile(res)
          .then((resp) => {
            if (isText(resp)) {
              // 创建a标签，用于跳转至下载链接
              const tempLink = document.createElement('a');
              tempLink.style.display = 'none';
              tempLink.href = resp;
              // 兼容：某些浏览器不支持HTML5的download属性
              if (typeof tempLink.download === 'undefined') {
                tempLink.setAttribute('target', '_blank');
              }
              // 挂载a标签
              document.body.appendChild(tempLink);
              tempLink.click();
              document.body.removeChild(tempLink);
            } else {
              this.setState({
                exportPdfLoading: false,
              });
            }
          })
          .finally(() => {
            this.setState({
              exportPdfLoading: false,
            });
          });
      } else {
        this.setState({
          exportPdfLoading: false,
        });
      }
    });
  }

  /**
   * 渲染头标题
   */
  renderHeaderTitle(btnFlag = false) {
    const {
      modelName = 'inquiryHall',
      [modelName]: { header = {} },
      remote,
    } = this.props;
    const { rfxDetailProcessList = [] } = this.state;
    const { sourceKey, categoryCode } = this.rfx;
    const {
      rfxNum,
      rfxStatus,
      scoreStatus,
      bargainClosedFlag,
      roundHeaderStatus,
      sourceCategoryMeaning,
      roundQuotationEndDate,
    } = header || {};
    let cardCode = 'SSRC_RFX_COMMON_STATUS_ATTENTION';
    const currentStep =
      rfxDetailProcessList && rfxDetailProcessList.find((item) => item.nodeFlag === 0);
    switch (currentStep?.nodeStatus) {
      case 'IN_QUOTATION':
        cardCode =
          rfxStatus === 'CLOSED'
            ? 'SSRC_RFX_COMMON_STATUS_ATTENTION'
            : 'SSRC_RFX_QUOTATIOIN_ATTENTION';
        break;
      case 'CHECK_PENDING':
        if (bargainClosedFlag === 0) {
          cardCode = 'SSRC_RFX_BARGAIN_ATTENTION';
        } else if (
          roundHeaderStatus === 'ROUND_CHECKING' &&
          new Date(roundQuotationEndDate) > new Date()
        ) {
          cardCode = 'SSRC_RFX_ROUND_QUOTATIOIN_ATTENTION';
        }
        break;
      case 'SCORING':
        if (bargainClosedFlag === 0) {
          cardCode = 'SSRC_RFX_BARGAIN_ATTENTION';
        } else if (roundHeaderStatus === 'ROUND_SCORING' || scoreStatus === 'ROUND_QUOTATION') {
          cardCode = 'SSRC_RFX_ROUND_QUOTATIOIN_ATTENTION';
        }
        break;
      default:
        break;
    }

    const titleNode = (
      <span className={styles['header-title']}>
        {intl
          .get(`ssrc.inquiryHall.view.message.title.RFXDetailRFX`, {
            categoryCode: categoryCode || sourceKey,
          })
          .d('{categoryCode}明细')}
      </span>
    );
    const dragText = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.sourceCategoryNum`, {
        rfxNum,
        sourceCategory: sourceCategoryMeaning,
      })
      .d('{sourceCategory}单{rfxNum}');
    const chatProps = {
      dragText,
      requestBody: () => header,
      showDetail: true,
    };
    const remoteProps = {
      header,
      bidFlag: this.bidFlag,
    };
    return btnFlag ? (
      <span>
        {titleNode}
        {remote
          ? remote.render('SSRC_INQUIRY_HALL_DETAIL_RENDER_HEADER_EXPAND_INFOS', null, remoteProps)
          : null}
      </span>
    ) : (
      <span>
        <IMChatDraggable cardCode={cardCode} {...chatProps}>
          {titleNode}
          {remote
            ? remote.render(
                'SSRC_INQUIRY_HALL_DETAIL_RENDER_HEADER_EXPAND_INFOS',
                null,
                remoteProps
              )
            : null}
        </IMChatDraggable>
      </span>
    );
  }

  /**
   * 跳转到澄清答疑详情
   */
  @Bind()
  directQuestionAnswer({ record, rfxId: rfxHeaderId }) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {} },
      location: { pathname, search: currentSearch },
    } = this.props;
    const { rfxNum, companyId, visibleOldPrepareConfigSheet } = this.state;
    const routerParam = querystring.parse(currentSearch.substr(1));
    const currentPath = pathname + currentSearch;
    const tabKey =
      this.rfx.sourceKey === BID
        ? `/ssrc/bid-clarification-letter`
        : visibleOldPrepareConfigSheet
        ? `/ssrc/clarification-letter`
        : `/ssrc/new-clarification-letter`;
    const url = `${tabKey}/inter-question/${rfxHeaderId}/${rfxNum}/sourceTitle/${companyId}/1`;
    const search = querystring.stringify({
      createFlag: record.createFlag,
      sourceCategory: routerParam?.sourceCategory || header?.sourceCategory,
      isReadOnly: 'Y',
      backToPath: currentPath,
    });

    openTab({
      key: url,
      path: url,
      // title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑'),
      title: 'srm.common.tab.title.ssrc.questionAnswer',
      closable: true,
      search,
    });
  }

  // 直接跳转评审澄清
  @Bind()
  directReviewClarify({ rfxId }) {
    const { quotationHeaderId = 0, sourceStatus, rfxNum, rfxTitle } = this.state;

    const search = querystring.stringify({
      quotationHeaderId,
      sourceFrom: 'RFX',
      fromFlag: 1,
      sourceHeaderId: rfxId,
      title: `${rfxNum} - ${rfxTitle}`,
      rfxTitle,
      sourceStatus,
      isReadOnly: 'Y',
    });

    const tabKey =
      getActiveTabKey().indexOf('/ssrc/query-rfq') > -1 ||
      getActiveTabKey().indexOf('/ssrc/new-project-setup') > -1
        ? `/ssrc/new-${this.bidFlag ? 'bid' : 'inquiry'}-hall`
        : getActiveTabKey();

    openTab({
      key: `${tabKey}/rfx-review-clarification`,
      path: `${tabKey}/rfx-review-clarification`,
      // title: intl.get(`ssrc.inquiryHall.view.message.button.reviewClarify`).d('评审澄清'),
      title: 'srm.common.tab.title.ssrc.reviewClarify',
      closable: true,
      search,
    });
  }

  // 直接跳转价格澄清
  @Bind()
  directPriceClarify({ rfxId }) {
    const params = {
      sourceHeaderId: rfxId,
      sourceFrom: 'RFX',
      viewOnlyPage: 0,
      isReadOnly: 'Y',
    };
    const searchParams = querystring.stringify(params);

    const path = this.bidFlag
      ? '/ssrc/new-bid-hall/price-clarification-list'
      : '/ssrc/price-clarification/list';

    openTab({
      key: path,
      path,
      // title: 'ssrc.inquiryHall.view.title.priceClarification',
      title: 'srm.common.tab.title.ssrc.priceClarification',
      closable: true,
      search: searchParams,
    });
  }

  @Bind()
  ReleasePrepareNew(props = {}) {
    return !this.bidFlag ? <ReleasePrepareNew {...props} /> : <ReleasePrepareNewBid {...props} />;
  }

  /**
   * 渲染新版专家评分
   */
  renderExpertScoringNew(ExpertScoringProps) {
    return this.bidFlag ? (
      <ExpertScoringBid {...ExpertScoringProps} />
    ) : (
      <ExpertScoring {...ExpertScoringProps} />
    );
  }

  @Bind()
  handleRenderPriceCompare(priceComparisonProps) {
    C7NModal.open({
      destroyOnClose: true,
      closable: true,
      key: C7NModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceComparisonModal(priceComparisonProps),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  // 比价助手modal（中集二开父页面））追觅
  renderPriceComparisonModal = (priceComparisonProps = {}) => {
    return this.bidFlag ? (
      <BidPriceComparison {...priceComparisonProps} />
    ) : (
      <PriceComparison {...priceComparisonProps} />
    );
  };

  // 打开操作记录弹框
  @Bind()
  handleShowOperationRecordModal() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      match: { params },
      [modelName]: { header = {} },
    } = this.props;
    openModal({
      rfxHeaderId: params.rfxId,
      rfx: this.rfx,
      header,
    });
  }

  @Bind()
  showChangeRecords() {
    const { modelName = 'inquiryHall', history } = this.props;
    const {
      [modelName]: { header = {} },
      location: { search: searchData, pathname },
    } = this.props;
    const { rfxHeaderId, projectLineSectionId } = header;
    const QuotationChangeRecordsProps = {
      sourceHeaderId: rfxHeaderId,
      history,
      projectLineSectionId,
      documentTypeName: this.documentTypeName,
      sourceKeyLowerCase: this.rfx.sourceKeyLowerCase,
      backPath: `${pathname}${searchData}`,
    };
    C7NModal.open({
      key: C7NModal.key(),
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.changeReords`).d('变更记录'),
      children: this.renderQuotationChangeRecords(QuotationChangeRecordsProps),
      closable: true,
      style: { width: '742px' },
      onOk: () => {},
      okText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (okBtn) => <div>{okBtn}</div>,
      drawer: true,
    });
  }

  @Bind()
  renderQuotationChangeRecords(QuotationChangeRecordsProps = {}) {
    return <QuotationChangeRecords {...QuotationChangeRecordsProps} />;
  }

  // 判断数组中有且只有一个为真
  getOneTrue(arr) {
    const result = arr.filter(Boolean);
    if (result.length === 1) {
      return true;
    }
    return false;
  }

  @Bind()
  handleClickProcessAttachmentModal(rfxHeaderId) {
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('remotePreClickProcessAttachment', {
        rfxHeaderId,
      });
    }
    openC7nProcessAttachmentModal({ rfxHeaderId, ...this.pubRouterAddParams() })();
  }

  // 查看IP重合详情
  @Bind()
  handleViewIPDetail() {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId: rfxHeaderId = null } = params;
    openIPDetailModal({
      rfxHeaderId,
    });
  }

  /**
   * 个性化按钮组，[永祥, 长丰影像] 重写二开, 谨慎修改!!!
   * @protected
   */
  getButtons(btnFlag) {
    const { modelName = 'inquiryHall', remote, history, location } = this.props;
    const {
      match: { params = {}, path = null },
      [modelName]: { header = {} },
    } = this.props;
    const { rfxId: rfxHeaderId = null } = params;
    const {
      currentStep,
      rfxDetailProcessList,
      routerParam: { sourcePage },
      existClarifyFlag,
      existClarifyNoticeFlag,
      existPriceClarifyNoticeFlag,
      CheckPermissionObject,
      attachmentNewUILoading,
      processAttachmentNewUIFlag,
      attachmentCount = '',
      exportLoading = false,
      exportPdfLoading = false,
      businessKey,
      approvaFlags,
      operationFlags,
      useNewRateFlag = 0,
      isTechExpertFlag = false,
    } = this.state;
    const disabledAllLinkFlag = this.isDisabledAllLink();
    const groupFlag = !this.getOneTrue([
      CheckPermissionObject.clarifyquestion !== 'hidden' && existClarifyFlag,
      existClarifyNoticeFlag,
      existPriceClarifyNoticeFlag,
    ]);
    const { rfxStatus, scoreStatus } = header || {};
    const { sourceCategory, biddingFlag } = header || {};
    const activetabKey = getActiveTabKey();
    const isPub = this.isPubPage();
    const otherProps = {
      rfxHeaderId: params.rfxId,
      currentStep,
      rfxDetailProcessList,
      header,
      path,
      bidFlag: this.bidFlag,
      sourceCategoryName: this.sourceCategoryName,
      sourceCategory,
      history,
      location,
      attachmentCount,
      rfxStatus,
      attachmentNewUILoading,
      processAttachmentNewUIFlag,
      pubRouterAddParams: this.pubRouterAddParams,
      openProcessAttachmentModal: this.openProcessAttachmentModal,
      that: this,
      handleClickProcessAttachmentModal: this.handleClickProcessAttachmentModal,
      isPub,
      toggleOperationLoading: this.toggleOperationLoading,
      btnFlag,
    };

    const approvaFlag = approvaFlags?.[businessKey];
    const operationFlag = operationFlags?.[businessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    const approvingStatus =
      ['RELEASE_APPROVING', 'PRE_EVALUATION_APPROVING', 'CHECK_APPROVING'].includes(rfxStatus) ||
      scoreStatus === 'PRE_EVALUATION_APPROVING';

    const buttons = [
      {
        name: 'infoExportPDF',
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        // group: false,
        hidden:
          isPub ||
          btnFlag ||
          !rfxDetailProcessList?.every((item) => item?.nodeFlag < 1) ||
          isTechExpertFlag,
        child: intl
          .get('ssrc.inquiryHall.model.inquiryHall.commonInquiryInfoExport', {
            sourceCategoryName: this.sourceCategoryName,
          })
          .d('{sourceCategoryName}信息导出'),
        btnProps: {
          icon: 'unarchive',
          funcType: 'flat',
          type: 'c7n-pro',
          loading: exportPdfLoading,
          onClick: this.exportPDFData,
          style: {
            paddingLeft: 0,
          },
        },
        otherProps: {
          uiType: 'c7n-pro',
        },
      },
      {
        name: ['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(activetabKey)
          ? 'backToCheckPriceNew'
          : 'backToCheckPrice',
        btnComp: PermissionButton,
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          type: 'c7n-pro',
          icon: 'settings_backup_restore',
          onClick: this.backToCheckPrice,
          disabled: disabledAllLinkFlag,
          style: {
            paddingLeft: 0,
          },
          permissionList: [
            {
              code: ['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(activetabKey)
                ? `${
                    this.bidFlag
                      ? 'ssrc.new-bid-hall.button.'
                      : 'ssrc.new-inquiry-hall.list.button.'
                  }inquiry.backtocheckprice`
                : 'ssrc.query-rfq.rfx-detail.-rfxid.button.backtocheckprice',
              type: 'button',
              meaning:
                intl.get(`ssrc.inquiryHall.view.message.title.RFXDetail`).d('RFX明细') -
                intl
                  .get('ssrc.inquiryHall.view.button.commonBackToCheckPrice', {
                    checkPriceName: this.checkPriceName,
                  })
                  .d('退回至{checkPriceName}'),
            },
          ],
        },
        otherProps: {
          uiType: 'c7n-pro',
        },
        child: intl
          .get('ssrc.inquiryHall.view.button.commonBackToCheckPrice', {
            checkPriceName: this.checkPriceName,
          })
          .d('退回至{checkPriceName}'),
        hidden:
          currentStep !== 'FINISHED' ||
          (sourcePage !== 'QueryRfqList' &&
            !['/ssrc/new-inquiry-hall', '/ssrc/new-bid-hall'].includes(activetabKey)),
      },
      {
        name: 'changeReords',
        btnComp: PermissionButton,
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.model.inquiryHall.changeReords`).d('变更记录'),
        btnProps: {
          icon: 'ballot',
          funcType: 'flat',
          type: 'c7n-pro',
          style: {
            paddingLeft: 0,
          },
          onClick: this.showChangeRecords,
        },
        hidden: currentStep === 'RELEASE_PREPARE',
      },
      {
        name: 'viewIPDetails',
        btnComp: PermissionButton,
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`).d('查看IP重合详情'),
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          type: 'c7n-pro',
          style: {
            paddingLeft: 0,
          },
          onClick: this.handleViewIPDetail,
        },
        hidden: currentStep === 'RELEASE_PREPARE' || !useNewRateFlag,
      },
      currentStep === 'CHECK_PENDING' || currentStep === 'FINISHED'
        ? {
            name: 'copyPrint',
            btnType: 'c7n-pro',
            btnComp: PermissionButton,
            btnProps: {
              icon: 'print-o',
              type: 'c7n-pro',
              funcType: 'flat',
              style: {
                paddingLeft: 0,
              },
              onClick: this.handlePrint,
              permissionList: [
                {
                  code: `ssrc.inquiry-hall.list.button.print`,
                  type: 'button',
                  meaning:
                    intl.get(`ssrc.inquiryHall.view.message.title.RFXDetail`).d('RFX明细') -
                    intl.get('ssrc.inquiryHall.view.message.button.print').d('打印'),
                },
              ],
            },
            otherProps: {
              uiType: 'c7n-pro',
              funcType: 'flat',
            },
            child: intl.get('ssrc.inquiryHall.view.message.button.print').d('打印'),
          }
        : null,
      {
        name: 'infoExport',
        btnType: 'c7n-pro',
        hidden:
          isPub ||
          btnFlag ||
          !rfxDetailProcessList?.every((item) => item?.nodeFlag < 1) ||
          isTechExpertFlag,
        child: intl
          .get('ssrc.inquiryHall.model.inquiryHall.commonInquiryInfoExport', {
            sourceCategoryName: this.sourceCategoryName,
          })
          .d('{sourceCategoryName}信息导出'),
        btnProps: {
          icon: 'unarchive',
          funcType: 'flat',
          loading: exportLoading,
          onClick: () => this.exportData(rfxHeaderId),
        },
      },
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: this.handleShowOperationRecordModal,
        },
      },
      this.renderPriceComparisionButton(currentStep),
      sourceCategory
        ? {
            name: 'chat',
            btnComp: ChatRoomSourceLink,
            btnType: 'c7n-pro',
            child: intl.get('ssrc.common.view.message.chatRecord').d('聊天记录'),
            btnProps: {
              btnType: 'c7n-pro',
              style: {
                paddingLeft: 0,
              },
              readOnly: true,
              rfxHeaderId,
              biddingFlag,
            },
            hidden: currentStep !== 'FINISHED',
          }
        : null,
      {
        name: 'attachmentUpload',
        btnType: 'c7n-pro',
        child: (
          <Badge
            count={attachmentCount}
            overflowCount={attachmentCount}
            size="small"
            offset={[2, 0]}
          >
            <span>{intl.get('hzero.common.button.open').d('过程附件下载')}</span>
          </Badge>
        ),
        hidden: !(
          currentStep === 'FINISHED' ||
          rfxStatus === 'CLOSED' ||
          rfxStatus === 'CHECK_PENDING' ||
          rfxStatus === 'FINISHED'
        ),
        btnProps: {
          loading: attachmentNewUILoading,
          icon: 'get_app',
          funcType: 'flat',
          tooltip: 'none',
          onClick: processAttachmentNewUIFlag
            ? () => this.handleClickProcessAttachmentModal(rfxHeaderId)
            : this.openProcessAttachmentModal,
        },
      },
      ((CheckPermissionObject.clarifyquestion !== 'hidden' && existClarifyFlag) ||
        existClarifyNoticeFlag ||
        existPriceClarifyNoticeFlag) &&
      CheckPermissionObject.clarifyRecords !== 'hidden'
        ? groupFlag
          ? {
              name: 'clarifyBtnGroup',
              group: true,
              // hidden: CheckPermissionObject.clarifyRecords === 'hidden',
              // 按钮组显示内容
              child: (
                <C7NBtn funcType="flat" icon="contact_support">
                  {intl.get('ssrc.inquiryHall.view.message.button.clarifyGroup').d('澄清记录')}
                  <C7NIcon type="expand_more" style={{ marginTop: '-2px' }} />
                </C7NBtn>
              ),
              children: [
                CheckPermissionObject.clarifyquestion !== 'hidden' && existClarifyFlag
                  ? {
                      name: 'clarifyQuestions',
                      child: (
                        <>
                          {intl
                            .get(`ssrc.inquiryHall.view.message.button.clearAnswer`)
                            .d('澄清答疑')}
                        </>
                      ),
                      btnProps: {
                        className: 'no-border-btn',
                        onClick: (record) =>
                          this.directQuestionAnswer({ record, rfxId: params.rfxId }),
                        disabled: remote
                          ? remote.process(
                              'INQUIRY_HALL_DETAIL_HEADER_BUTTON_CLARIFY_DISABLED',
                              disabledAllLinkFlag,
                              { bidFlag: this.bidFlag }
                            )
                          : disabledAllLinkFlag,
                      },
                    }
                  : null,
                existClarifyNoticeFlag
                  ? {
                      name: 'reviewClarify',
                      child: (
                        <>
                          {intl
                            .get(`ssrc.inquiryHall.view.message.button.reviewClarify`)
                            .d('评审澄清')}
                        </>
                      ),
                      btnProps: {
                        className: 'no-border-btn',
                        onClick: () => this.directReviewClarify({ rfxId: params.rfxId }),
                        disabled: disabledAllLinkFlag,
                      },
                    }
                  : null,
                existPriceClarifyNoticeFlag
                  ? {
                      name: 'priceClarify',
                      child: (
                        <>
                          {intl
                            .get(`ssrc.inquiryHall.view.message.button.priceClarify`)
                            .d('价格澄清')}
                        </>
                      ),
                      btnProps: {
                        className: 'no-border-btn',
                        disabled: disabledAllLinkFlag,
                        onClick: () => this.directPriceClarify({ rfxId: params.rfxId }),
                      },
                    }
                  : null,
              ].filter(Boolean),
            }
          : CheckPermissionObject.clarifyquestion !== 'hidden' && existClarifyFlag
          ? {
              name: 'clarifyQuestions',
              child: (
                <>{intl.get(`ssrc.inquiryHall.view.message.button.clearAnswer`).d('澄清答疑')}</>
              ),
              // hidden: disabledAllLinkFlag,
              btnType: 'c7n-pro',
              btnProps: {
                funcType: 'flat',
                icon: 'contact_support',
                disabled: remote
                  ? remote.process(
                      'INQUIRY_HALL_DETAIL_HEADER_BUTTON_CLARIFY_DISABLED',
                      disabledAllLinkFlag,
                      { bidFlag: this.bidFlag }
                    )
                  : disabledAllLinkFlag,
                onClick: (record) => this.directQuestionAnswer({ record, rfxId: params.rfxId }),
              },
            }
          : existClarifyNoticeFlag
          ? {
              name: 'reviewClarify',
              btnType: 'c7n-pro',
              // hidden: disabledAllLinkFlag,
              child: (
                <>{intl.get(`ssrc.inquiryHall.view.message.button.reviewClarify`).d('评审澄清')}</>
              ),
              btnProps: {
                disabled: disabledAllLinkFlag,
                funcType: 'flat',
                icon: 'contact_support',
                onClick: () => this.directReviewClarify({ rfxId: params.rfxId }),
              },
            }
          : {
              name: 'priceClarify',
              btnType: 'c7n-pro',
              child: (
                <>{intl.get(`ssrc.inquiryHall.view.message.button.priceClarify`).d('价格澄清')}</>
              ),
              // hidden: disabledAllLinkFlag,
              btnProps: {
                funcType: 'flat',
                icon: 'contact_support',
                className: 'no-border-btn',
                disabled: disabledAllLinkFlag,
                onClick: () => this.directPriceClarify({ rfxId: params.rfxId }),
              },
            }
        : null,
      {
        name: 'approval',
        btnType: 'c7n-pro',
        hidden: isPub || !(approvaFlags && approvaFlag && approvingStatus),
        child: intl.get('ssrc.inquiryHall.view.message.button.approve').d('审批'),
        btnProps: {
          wait: 1500,
          funcType: 'flat',
          icon: 'authorize',
          onClick: async () => {
            openApproveModal({
              modalProps: {
                closable: true,
              },
              taskId,
              processInstanceId,
              onSuccess: () => {
                refreshTab();
              },
            });
          },
        },
      },
      {
        name: 'revokeApproval',
        btnType: 'c7n-pro',
        hidden: isPub || !(operationFlags && operationFlag?.REVOKE && approvingStatus),
        child: intl.get('ssrc.common.view.button.revokeApproval').d('撤销审批'),
        btnProps: {
          wait: 1500,
          funcType: 'flat',
          icon: 'reply',
          onClick: async () => {
            const res = await handleRevokeApproval(businessKey);
            if (res) {
              refreshTab();
            }
          },
        },
      },
    ].filter(Boolean);
    if (!remote) {
      return buttons;
    }

    return remote.process('INQUIRY_HALL_DETAIL_EXPERT_EXPORT', buttons, otherProps);
  }

  // 内嵌页面需要把自己的头数据传给外部, 在入口页面共
  setHeaderToEntry = (headerDto = null) => {
    if (isEmpty(headerDto)) {
      return;
    }

    this.setState({
      header: headerDto,
    });
  };

  /**
   * 查询核价配置表
   */
  async checkPriceUiDisplayConfig() {
    const result = await queryCheckPriceUiDisplayConfig();
    if (result) {
      this.setState({
        checkPriceUiIsNew: Boolean(result?.length), // 临时取反，上线还得改回
      });
    }
  }

  /**
   * @protected 三生制药，鸿合科技.卫龙二开
   */
  renderCheckPrice(CheckPriceProps) {
    const {
      modelName = 'inquiryHall',
      match,
      history,
      location,
      sourceKey,
      onFormLoaded,
      [modelName]: { header = {} },
    } = this.props;
    const {
      visibleOldPrepareConfigSheet,
      checkPriceNewPage = null,
      checkPriceUiIsNew,
      isTechExpertFlag = false,
    } = this.state;

    const { rfxStatus } = header || {};

    const newCheckPriceProps = {
      match,
      history,
      location,
      onFormLoaded,
      detailFlag: true,
      pubRouterAddParams: this.pubRouterAddParams,
      detailFinishedFlag: rfxStatus === 'FINISHED',
      isTechExpertFlag,
      fetchIntelligentPreReview: this.fetchIntelligentPreReview,
    };

    if (checkPriceUiIsNew && !visibleOldPrepareConfigSheet) {
      return sourceKey === BID ? (
        <NewBidCheckPrice {...newCheckPriceProps} />
      ) : (
        <NewCheckPrice {...newCheckPriceProps} />
      );
    } else {
      if (checkPriceNewPage === 1) {
        return <CheckPriceNewDetail {...CheckPriceProps} />;
      }

      return <CheckPrice {...CheckPriceProps} />;
    }

    // return this.state.checkPriceUiIsNew && !visibleOldPrepareConfigSheet ? (
    //   sourceKey === BID ? (
    //     <NewBidCheckPrice {...newCheckPriceProps} />
    //   ) : (
    //     <NewCheckPrice {...newCheckPriceProps} />
    //   )
    // ) : (
    //   <CheckPrice {...CheckPriceProps} />
    // );
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

  renderLadderLevelModalPrepare = (ladderProps) => {
    return this.bidFlag ? (
      <LadderLevelModalPrepareBid {...ladderProps} />
    ) : (
      <LadderLevelModalPrepare {...ladderProps} />
    );
  };

  @Bind()
  releasePrepare(node) {
    this.releasePrepareRef = node;
  }

  render() {
    const {
      modelName = 'inquiryHall',
      customizeCollapse,
      custLoading,
      onFormLoaded,
      location,
      location: { search },
      history,
      remote,
      onLoad,
      code: workflowFormCode,
    } = this.props;
    const { inComingStatus = '' } = querystring.parse(search.substr(1));

    const btnFlag = [
      'FINISHED',
      'SCORING',
      'CHECK_PENDING',
      'PRETRIAL_PENDING',
      'OPEN_BID_PENDING',
      'IN_QUOTATION',
      'IN_PREQUAL',
      'RELEASE_PREPARE',
    ].includes(inComingStatus);

    const {
      checkWay,
      previewVisible,
      previewFileName,
      previewImage,
      viewOnly,
      bucketDirectory,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      scoringElementVisible = false,
      routerParam = {},
      evaluateAssignModalVisible,
      bidholderVisible = false,
      pretrialPanelVisible,
      currentStep,
      isHorizontal = true,
      inquiryGroupVisibleFlag,
      PrepareCollapseKeys = [],
      // priceComparisonModalVisible,
      scoreDetailModalVisible = false,
      viewLadderLevelQuotaVisible = false,
      visibleOldPrepareConfigSheet = true,
      processVisible = false,
      // checkPriceUiIsNew,
      attachmentNewUILoading,
      quotationDetailFieldVisible,
      doubleUnitFlag,
      processAttachmentNewUIFlag,
      // sectionSwitchWarningVisible = false,
      riskScanFlag,
      newQuotationFlag,
      serviceChargeFlag,
      biddingHallFlag,
      sslmLifeCycleFlag,
      sslmLifeCycleNewUser,
      attachmentCount = '',
      headerGroupButtonMaxNum = -1,
      fileTemplateManageFlag,
      useNewRateFlag = 0,
      isTechExpertFlag = false,
      aiResultData,
    } = this.state;
    // 同一页面,防止传数据 不同状态区分
    const {
      [modelName]: {
        header = {},
        settings = {},
        examinationHeader = {},
        itemLine = [],
        examinationItemLine = [],
        supplierLine = [],
        examinationSupplierLine = [],
        itemLinePagination = {},
        examinationItemLinePagination = {},
        supplierLinePagination = {},
        examinationSupplierLinePagination = {},
        supplierData = [],
        // examinationrfxDetailProcessList = [],
        ladderLevelData = [],
        scoringElement = [],
        evaluateExpertList = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        bidHolderList = [],
        bidHolderPagination = {},
        // checkPriceHeader = {},
      },
      [modelName]: {
        pretrialPanelList = [],
        quotaLadderLevelData = [],
        scoreDetailList = [],
        tenderNoticeInfo = {},
      },
      organizationId,
      dispatch,
      match,
      match: { params = {}, path = {} },
      form,
      customizeTable = () => {},
      customizeForm = () => {},
      customizeTabPane = () => {},
      fetchItemLineLoading,
      fetchLadderLevelLoading,
      fetchSupplierLineLoading,
      fetchInquiryHallUpdateLoading = false,
      fetchScoringElementLoading = false,
      fetchEvaluateIndicAssignLoading,
      fetchPretrialPanelLoading,
      changeRfxDetailLayoutLoading,
      customizeBtnGroup = () => {},
      getHocInstance,
    } = this.props;

    const { rfxId: rfxHeaderId = null } = params;
    const disabledAllLinkFlag = this.isDisabledAllLink();
    const isSection = this.judgeSectionBid();
    const projectTotalPrice =
      this.SectionRef.getSourceProject && this.SectionRef.getSourceProject().projectCost;

    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    const previewImageStyle = {
      maxWidth: '100%',
      maxHeight: '100%',
    };
    const scoringElementProps = {
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      onCancel: this.handleCancelScoringElement,
    };
    // // 比价助手
    // const { sourceCategory, diyLadderQuotationFlag } = checkPriceHeader || header || {};
    // const priceComparisonProps = {
    //   rfxId: params.rfxId,
    //   visible: priceComparisonModalVisible,
    //   showPriceComparison: !checkPriceUiIsNew, // 临时，上线还得取反
    //   onHideModal: this.hidePriceComparison,
    //   sourceCategory,
    //   diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    //   location,
    //   history,
    //   disabledAllLinkFlag,
    //   pubRouterAddParams: this.pubRouterAddParams,
    // };
    let validHeader = {};
    let validItemLine = [];
    let validItemLinePagination = {};
    let validSupplierLine = [];
    let validSupplierLinePagination = {};
    if (routerParam.typeName === 'examinationDetail') {
      validHeader = examinationHeader;
      validItemLine = examinationItemLine;
      validItemLinePagination = examinationItemLinePagination;
      validSupplierLine = examinationSupplierLine;
      validSupplierLinePagination = examinationSupplierLinePagination;
    } else {
      validHeader = header;
      validItemLine = itemLine;
      validItemLinePagination = itemLinePagination;
      validSupplierLine = supplierLine;
      validSupplierLinePagination = supplierLinePagination;
    }

    // 专家
    const ProfessionalTableProps = {
      header,
      dispatch,
      organizationId,
      match,
      evaluateExpertList,
      // fetchExpertAllocationDataLoading,
    };

    // 评分要素
    const ScoringElementsTableProps = {
      // loading: fetchTempelateDetailDataLoading,
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

    // 密封报价,查看开标人
    const BidOpenerCartridgeProps = {
      bidholderVisible,
      dataSource: bidHolderList,
      pagination: bidHolderPagination,
      onCancel: this.onCancel,
      fetchOpenBidHolder: this.fetchOpenBidHolder,
    };

    // 预审小组props
    const PretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };

    const CommonHeaderProps = {
      isHorizontal,
      validHeader,
      header,
      path,
      routerParam,
      customizeTable,
      customizeForm,
      customizeTabPane,
      UEDDisplayFormItem,
      FormItem,
      organizationId,
      fetchInquiryHallUpdateLoading,
      setCollapseByKey: this.setCollapseByKey,
      sourceHeaderId: rfxHeaderId,
      rfxHeaderId,
      isSection,
      rfx: this.rfx,
      disabledAllLinkFlag,
      remote,
      onFormLoaded,
      doubleUnitFlag,
      currentStep,
      viewLadderLevelQuota: this.viewLadderLevelQuotaModal,
      getHocInstance,
      settings,
      checkWay,
      pubRouterAddParams: this.pubRouterAddParams,
      newQuotationFlag,
      biddingHallFlag,
      useNewRateFlag,
      location,
      match,
      workflowFormCode,
      fetchIntelligentPreReview: this.fetchIntelligentPreReview,
    };

    // 发布准备-old
    const ReleasePrepareProps = {
      // form,
      workflowFormCode,
      riskScanFlag,
      match,
      history,
      btnFlag,
      dispatch,
      onLoad,
      customizeForm,
      doubleUnitFlag,
      bidFlag: this.bidFlag,
      ...CommonHeaderProps,
      tenderNoticeInfo,
      PrepareCollapseKeys,
      ProfessionalTableProps,
      inquiryGroupVisibleFlag,
      ScoringElementsTableProps,
      openBidholder: this.openBidholder,
      openInquiryGroup: this.openInquiryGroup,
      closeInquiryGroup: this.closeInquiryGroup,
      showScoringElement: this.showScoringElement,
      changeRfxDetailVertical: this.changeRfxDetailVertical,
      showPretrialPanel: this.showPretrialPanel,
      previewNotice: this.previewNotice,
      viewLadderLevelPrepare: this.viewLadderLevelPrepare,
      onRef: this.releasePrepare,
      itemDetailsTableProps: {
        header,
        customizeTable,
        dataSource: validItemLine,
        pagination: validItemLinePagination,
        loading: fetchItemLineLoading,
        form,
        doubleUnitFlag,
        organizationId,
        ladderLevelData,
        visible: viewLadderLevelQuotaVisible,
        LadderLevelHeaderData,
        fetchLadderLevelLoading,
        supplierDataSource: supplierData,
        searchSupplier: this.handleSearchSupplier,
        onSearch: this.fetchItemLine,
        showQuotationDetail: this.showQuotationDetail,
        viewLadderLevel: this.viewLadderLevelModal,
        linktoPrNumDetail: this.linktoPrNumDetail,
        rfx: this.rfx,
      },
      supplierListTableProps: {
        customizeTable,
        dataSource: validSupplierLine,
        pagination: validSupplierLinePagination,
        loading: fetchSupplierLineLoading,
        onSearch: this.fetchSupplierLine,
        rfx: this.rfx,
      },
      AttachmentsProps: {
        bucketDirectory,
        bucketName: PRIVATE_BUCKET,
        viewOnly,
        businessUuid: validHeader.businessAttachmentUuid,
        techUuid: validHeader.techAttachmentUuid,
      },
      pubRouterAddParams: this.pubRouterAddParams,
      remote,
      serviceChargeFlag,
      // 是否开启新360页面的租户
      sslmLifeCycleNewUser,
      fileTemplateManageFlag,
    };

    // 招标小组props
    const inquiryGroupModalProps = {
      readOnly: true,
      inquiryGroupVisibleFlag,
      closeInquiryGroup: this.closeInquiryGroup,
      rfxHeaderId: header.rfxHeaderId,
      rfx: this.rfx,
    };

    // 预审
    const InPrequalProps = {
      // form,
      customizeForm,
      ...CommonHeaderProps,
      showScoringElement: this.showScoringElement,
      showPretrialPanel: this.showPretrialPanel,
    };

    // 报价中
    const InQuotationProps = {
      form,
      ...CommonHeaderProps,
    };

    // 开标
    const OpenBidProps = {
      ...CommonHeaderProps,
    };

    // 专家评分中进度条props
    const ExpertScoringProps = {
      header,
      form,
      remote,
      isSection,
      customizeForm,
      organizationId,
      quotationDetailFieldVisible,
      rfx: this.rfx,
      sourceHeaderId: params.rfxId || null,
      directorQuotationDetail: this.directorQuotationDetail,
      openScoreDetailModal: this.openScoreDetailModal,
      disabledAllLinkFlag,
      pubRouterAddParams: this.pubRouterAddParams,
    };

    // 专家评分step,评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
    };

    // 核价props
    const CheckPriceProps = {
      ...CommonHeaderProps,
      doubleUnitFlag,
      rfxHeaderId: params.rfxId || null,
      organizationId,
      viewLadderLevelQuotaVisible,
      LadderLevelHeaderData,
      hideModal: this.hideLadderLevelQuotaModal,
      viewLadderLevelQuota: this.viewLadderLevelQuotaModal,
      viewLadderLevel: this.viewLadderLevelQuotaModal,
      showQuotationDetail: this.showQuotationDetail,
      isSection,
      projectTotalPrice,
      // quotaLadderLevelData,
      checkWay,
      customizeCollapse,
      custLoading,
      dispatch,
      modelName,
      currentStep,
      getHocInstance,
      settings,
      history,
      sslmLifeCycleFlag,
      isTechExpertFlag,
    };

    // 阶梯报价props
    const ladderLevelModalProps = {
      doubleUnitFlag,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      visible: viewLadderLevelVisible,
      ladderLevelData,
      LadderLevelHeaderData,
      fetchLadderLevelLoading,
      unitCodeSymbol: this.rfx?.unitCodeSymbol,
    };
    // 报价阶梯报价props
    const ladderLevelquotaProps = {
      doubleUnitFlag,
      visible: viewLadderLevelQuotaVisible,
      hideModal: this.hideLadderLevelQuotaModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
    };

    // 过程附件下载
    const DownloadAttachmentsProps = {
      rfxHeaderId,
      processVisible,
      downloadAll: this.downloadAll,
      onCancel: this.onCancel,
      organizationId,
      pubRouterAddParams: this.pubRouterAddParams,
    };

    // 分标段
    const projectLineSectionId = this.getProjectLineSectionId();
    const SectionPanelProps = {
      parentPage: {
        name: 'rfxDetailAll',
        queryParams: {
          rfxHeaderId,
          projectLineSectionId,
          permissionFilterFlag: routerParam?.permissionFilterFlag,
        },
      },
      customizeStyle: {
        // maxHeight: 'calc(100% - 5px)',
        height: '100%',
      },
      projectLineSectionId,
      // couldSectionSwitch: this.couldSectionSwitch,
      paramKeys: ['sourceHeaderId'],
      locatedCurrentUrl: this.locatedCurrentUrl,
      isSection,
      className: isSection ? styles['section-container'] : '',
    };

    const docLinkFlag = this.getFieldFromUrl('docLinkFlag');

    const operationProps = {
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
      name: 'operatingRecord',
    };

    let allButtons = [
      btnFlag ? (
        <Badge name="attachmentUpload" count={attachmentCount} className={styles['badge-item']}>
          <Button
            name="attachmentUpload"
            loading={attachmentNewUILoading}
            className="no-border-btn"
            icon="get_app"
            onClick={
              processAttachmentNewUIFlag
                ? () => this.handleClickProcessAttachmentModal(rfxHeaderId)
                : this.openProcessAttachmentModal
            }
          >
            {intl.get('hzero.common.button.open').d('过程附件下载')}
          </Button>
        </Badge>
      ) : null,
      docLinkFlag ? (
        <OperationRecord {...operationProps} />
      ) : (
        !btnFlag &&
        customizeBtnGroup(
          { code: `SSRC.${this.rfx.unitCodeSymbol}_DETAIL.HEADER_BUTTON`, pro: true },
          <DynamicButtons
            maxNum={headerGroupButtonMaxNum}
            // trigger="click"
            buttons={this.getButtons(btnFlag)}
            defaultBtnType="c7n-pro"
          />
        )
      ),
    ].filter(Boolean);

    allButtons = remote
      ? remote.process('INQUIRY_HALL_DETAIL_PROCESS_HEADER_BUTTONS_ALL', allButtons, {
          that: this,
        })
      : allButtons;

    return (
      <>
        <Header backPath={this.renderParent()} title={this.renderHeaderTitle(btnFlag)}>
          {allButtons}
        </Header>

        <div
          style={{ height: this.isPubPage() ? '' : 'calc(100% - 56px)' }}
          className={classnames(common['page-content-wrapper-custome'], styles['rfx-detail-page'])}
        >
          <IntelligentReviewResult aiResultData={aiResultData} />
          <SectionPanel
            {...SectionPanelProps}
            onRef={(node) => {
              this.SectionRef = node;
            }}
          >
            {!isSection && this.renderStep()}
            {isSection && this.renderStep()}
            {currentStep && currentStep === 'RELEASE_PREPARE' && !visibleOldPrepareConfigSheet ? (
              this.ReleasePrepareNew(ReleasePrepareProps)
            ) : // 单独提出专家评分节点, 来适配新版C7n卡片样式
            currentStep === 'SCORING' ? (
              this.renderExpertScoringNew(ExpertScoringProps)
            ) : (
              <div
                className="page-content-detail-wrapper"
                style={{ height: 'calc(100% - 71px)', overflowY: 'auto' }}
              >
                <Content
                  className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}
                >
                  <Spin spinning={fetchInquiryHallUpdateLoading}>
                    {currentStep === 'RELEASE_PREPARE' ? (
                      <div className={styles['rfx-detail-layout-button-group']}>
                        <Button.Group onClick={(e) => this.changeLayout(e)}>
                          <Button
                            type={isHorizontal ? 'primary' : ''}
                            layout="HORIZONTAL"
                            loading={changeRfxDetailLayoutLoading}
                          >
                            {intl.get('ssrc.inquiryHall.view.button.horizontal').d('横版')}
                          </Button>
                          <Button
                            type={!isHorizontal ? 'primary' : ''}
                            layout="VERTICAL"
                            loading={changeRfxDetailLayoutLoading}
                          >
                            {intl.get('ssrc.inquiryHall.view.button.vertical').d('竖版')}
                          </Button>
                        </Button.Group>
                      </div>
                    ) : (
                      ''
                    )}
                    {currentStep === 'RELEASE_PREPARE' && (
                      <ReleasePrepare {...ReleasePrepareProps} />
                    )}
                    {currentStep === 'IN_PREQUAL' ? <InPrequal {...InPrequalProps} /> : ''}
                    {currentStep === 'IN_QUOTATION' && <InQuotation {...InQuotationProps} />}
                    {currentStep === 'OPEN_BID_PENDING' && <OpenBid {...OpenBidProps} />}
                    {currentStep === 'PRETRIAL_PENDING' && <Pretrial {...CheckPriceProps} />}
                    {currentStep === 'CHECK_PENDING' && this.renderCheckPrice(CheckPriceProps)}
                    {currentStep === 'FINISHED' && this.renderCheckPrice(CheckPriceProps)}

                    {/* TODO */}
                    {this.WaittingStatus.includes(currentStep) && (
                      <div className="check-price-wait-forward">
                        {intl.get('ssrc.inquiryHall.view.message.doLookForwardTo').d('敬请期待')}!
                      </div>
                    )}
                  </Spin>
                </Content>
              </div>
            )}
          </SectionPanel>
        </div>

        {viewLadderLevelVisible && this.renderLadderLevelModalPrepare(ladderLevelModalProps)}
        {viewLadderLevelQuotaVisible && <LadderLevel {...ladderLevelquotaProps} />}
        {bidholderVisible && <BidOpenerCartridge {...BidOpenerCartridgeProps} />}
        {/* {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />} */}
        {/* {priceComparisonModalVisible && this.renderPriceComparisonModal(priceComparisonProps)} */}
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handlePreviewCancel}
          style={previewModalStyle}
        >
          <img alt={previewFileName} style={previewImageStyle} src={previewImage} />
        </Modal>
        {/* 资格预审 */}
        <ScoringElementModal {...scoringElementProps} />
        {/* 预审小组 */}
        {pretrialPanelVisible && <PretrialPanelModal {...PretrialPanelProps} />}
        {inquiryGroupVisibleFlag && <InquiryGroupModal {...inquiryGroupModalProps} />}
        {/* 评分细则 */}
        <ScoreDetailModal {...scoreDetailProps} />
        {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
        {this.renderSectionBatchModal()}
      </>
    );
  }
}

// 寻源，新招标两个路由共用一套代码
// 个性化两套 SSRC.INQUIRY_HALL_DETAIL | SSRC.INQUIRY_BID_DETAIL
// 权限集两套
const hocComponent = (Comp, pageSymbol = INQUIRY_HALL) => {
  return formatterCollections({
    code: [
      'ssrc.inquiryHall',
      'ssrc.common',
      'ssrc.qualiExam',
      'ssrc.sourceTemplate',
      'ssrc.expertScoring',
      'ssrc.sourceTemplate',
      'ssrc.bidHall',
      'ssrc.queryRfq',
      'ssrc.supplierQuotation',
      'ssrc.projectSetup',
      'ssrc.scux',
      'sscux.common',
      'component.docFlow',
      'scux.ssrc',
      'ssrc.biddingHall',
      'sscux.ssrc',
    ],
  })(
    withCustomize({
      unitCode: [
        `SSRC.${pageSymbol}_DETAIL.HEADER_DETAIL`,
        `SSRC.${pageSymbol}_DETAIL.ITEM_LINE`,
        `SSRC.${pageSymbol}_DETAIL.SUPPLIER.LINE`,
        `SSRC.${pageSymbol}_DETAIL.CHECK_PRICE_HEADER`,
        `SSRC.${pageSymbol}_DETAIL.ITEM_DETAIL`,
        `SSRC.${pageSymbol}_DETAIL.SUPPLIER_DETAIL`,
        `SSRC.${pageSymbol}_DETAIL.ALL_QUOTATION`,
        `SSRC.${pageSymbol}_DETAIL.HEADER_PREQUAL`, // 发布准备/资格预审
        `SSRC.${pageSymbol}_DETAIL.PREQUAL_HEADER`, // 预审阶段
        `SSRC.${pageSymbol}_DETAIL.COST.REMARK`, // 核价阶段/成本备注
        `SSRC.${pageSymbol}_DETAIL.PRETRIAL_COST.REMARK`, // 预审阶段成本备注
        `SSRC.${pageSymbol}_DETAIL.PRETRIAL_INFO_HEADER`, // 预审阶段头信息
        `SSRC.${pageSymbol}_DETAIL.SCORE_INDICS`, // 发布准备-评分要素
        `SSRC.${pageSymbol}_DETAIL.SCORE_INDICS_TECH`, // 发布准备-评分要素-技术
        `SSRC.${pageSymbol}_DETAIL.EXPERT`, // 发布准备-专家评分
        `SSRC.${pageSymbol}_DETAIL.OPEN_BID_DETAIL_TABLE`, // 开标
        `SSRC.${pageSymbol}_DETAIL.QUOTATION_DETAIL`, // RFX明细-报价中
        `SSRC.${pageSymbol}_DETAIL.QUOTATION_NODE_BASEINFO`, // 报价节点-基本信息
        `SSRC.${pageSymbol}_DETAIL.EXPERT_SCORE_BASEINFO`, // 专家评分节点-基本信息
        `SSRC.${pageSymbol}_DETAIL.HEADER_BUTTON`, // 询价单-头部按钮组
        `SSRC.${pageSymbol}_DETAIL.CHECK_PRICE_HEADER_COLLAPSE`, // 核价/完成节点-头折叠面板
        `SSRC.${pageSymbol}_DETAIL.CHECK_PRICE_DETAIL_TABS`, // 核价/完成 - 核价详情 Tabs组
        `SSRC.${pageSymbol}_DETAIL.PREQUAL_LINE`, // 预审阶段-预审详情-表格
        // `SSRC.${pageSymbol}_DETAIL.OPEN_BID_DETAIL_TABLE`, // 明细-开标节点-新开标一览表
        `SSRC.${pageSymbol}_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE`, // 老核价明细-附件表格 checkPriceDetail
        `SSRC.${pageSymbol}_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS`,
        `SSRC.${pageSymbol}_DETAIL.CHECK_PRICE.WIN_BID_DETAIL`,
      ],
    })(
      Form.create({ fieldNameProp: null })(
        remotes(
          {
            code: 'SSRC_INQUIRY_HALL_DETAIL',
            name: 'remote',
          },
          {
            events: {
              handleGetProcessBar(props = {}) {
                const { getProcessBar = noop, ...otherParams } = props || {};
                getProcessBar(otherParams);
              },
              handleGetNotification(props = {}) {
                const { getNotification = noop, ...otherParams } = props || {};
                getNotification(otherParams);
              },
              handleGetQuotationDetailFieldVisible(props = {}) {
                const { getQuotationDetailFieldVisible = noop, ...otherParams } = props || {};
                getQuotationDetailFieldVisible(otherParams);
              },
              // 初始化ds Event
              remotePrepareInitDsEvent() {},
              // 组件卸载清空埋点事件
              remotePrepareComponentWillUnmountEvent() {},
              // 设置ds参数埋点事件
              remotePrepareSetQueryParameterDSEvent() {},
              // load businessData
              remotePrepareLoadDataBusinessData(props = {}) {
                const { loadBusinessData = noop } = props || {};
                loadBusinessData(props);
              },
              remotePreClickProcessAttachment() {},
              remotePreChangeStep() {},
              remotePreDirectorQuotation() {},
              // 发布准备查看适用范围埋点方法
              remoteViewApplicationModalEvent(props = {}) {
                const { handleViewApplicationModal = noop } = props || {};
                handleViewApplicationModal(props);
              },
              // 核价节点查看适用范围埋点方法
              remoteCheckPriceViewApplicationModalEvent(props = {}) {
                const { handleViewApplicationModal = noop } = props || {};
                handleViewApplicationModal(props);
              },
              // 强制切换节点二开
              remoteHandelSetCurrentStep() {},
            },
          }
        )(Comp)
      )
    )
  );
};

const DetailIndex = hocComponent(Detail);

export default DetailIndex;
export { hocComponent, hocComponent as hocUpdateDetail, Detail };
