import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  DataSet,
  Button,
  Modal as ModalPro,
  // Form,
  // Output,
  Tooltip,
  Dropdown,
  Menu,
  SelectBox,
  Spin,
} from 'choerodon-ui/pro';
import { Icon, Alert, Tag } from 'choerodon-ui';
import { Modal } from 'hzero-ui'; // 暂时未用c7n的，因为该组件没有hzero处理得好
// import Upload from 'srm-front-boot/lib/components/Upload';
import { Bind, Debounce } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import querystring from 'querystring';
import {
  merge,
  cloneDeep,
  throttle,
  isEmpty,
  isPlainObject,
  isArray,
  isString,
  isNumber,
  isFunction,
  isNull,
  isNil,
} from 'lodash';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import UrlAttachment from '_components/UrlAttachment';
import DynamicButtons from '_components/DynamicButtons';
import IMChatDraggable from '_components/IMChatDraggable';
import { TopSection, SecondSection } from '_components/Section';
import PrintProButton from '_components/PrintProButton';
import PermissionButton from 'srm-front-boot/lib/components/PermissionButton';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
import {
  queryBatchApprovaFlag,
  // queryBatchSimpleApprovalHistory,
} from 'srm-front-boot/lib/utils/utils';
import { openApproveModal } from '_components/ApproveModal';
import {
  revokeWorkflow,
  operationRevoke,
  breakOffContract,
  archiveContract,
  generatorPreFile,
  preTextBack,
  queryEditShare,
  updateEditShare,
  terminateContract,
  terminateContractValid,
  queryPreTextFlag,
  rollbackToSupplier,
  rollbackContract,
  checkStageCurrency,
  rejectContract,
  getSmartContractTaskId,
  preSmartSubmitValid,
  executeAiApprove,
  queryAiApproveResult,
} from '@/services/workspaceService';

import { syncAttachment } from '@/services/purchaseContractViewService';
import { openTab } from 'utils/menuTab';
import moment from 'moment';
// import ComUpload from '@/routes/components/ComUpload';
import useOperationRecordModal from '@/routes/components/C7nOperationRecord/useModal';
import PrintButton from '@/routes/components/PrintButton/index';
import { operationTextCompareModal } from '@/routes/components/TextCompareModalNew/index';
// import ContractApprovalButton from '@/routes/components/PrintButton/contractApproval';
// import _objectSpread from '@babel/runtime/helpers/esm/objectSpread2';
// import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { getActiveTabKey, updateTab } from 'hzero-front/lib/utils/menuTab';
import { Content, Header } from 'components/Page';
// import { Button as PermissionButton } from 'components/Permission';
// import formatterCollections from 'utils/intl/formatterCollections';
import {
  DEFAULT_DATE_FORMAT,
  // DETAIL_CARD_CLASSNAME,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import {
  getUserOrganizationId,
  getResponse,
  getAccessToken,
  getCurrentUserId,
  getCurrentOrganizationId,
  getCurrentUser,
  filterNullValueObject,
} from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SPCM } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import { EventManager } from '_utils/utils';
import {
  allSignList,
  linkList,
  queryCommonDoubleUomConfig,
  openTermsModal,
  preSubmitValidBudget,
  renderThousandthNum,
  getAttributeFields,
  previewContractByWindow,
  handlePurchaseNeedDTOs,
} from '@/utils/util';
// import Debounce from 'lodash/debounce';
import {
  invalidContract,
  changeContract,
  updateContract,
  updateHeaderInfo,
} from '@/services/contractControlService';
import { downloadFile, checkPermission, queryIdpValue } from 'services/api';
// import { rollbackToSupplier } from '@/services/contractChapterService';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import OperationRecordDrawer from '@/routes/components/OperationRecordDrawer';
import ValidateModal from '@/routes/ContractChapter/Detail/ValidateModal';
import { fetchContractOnlineHTMLType, fetchWpsV5TextPreView } from '@/services/editorOnlineService';
import EditorOnline from '@/routes/components/EditorOnline';
// import Attachment from '@/routes/components/Upload';
import PrivacyStatement from '@/routes/ContractChapter/Detail/PrivacyStatement';
import {
  batchQueryPrice,
  createPaymentPlan,
  preSubmitValid,
  initChatOnlineRoom,
  previewContractText,
} from '@/services/newContractService';
import PreferentialRule from '@/routes/components/PreferentialRule';
import DotButton from '@/routes/components/DotButton';
import { statusApproveMap, editCustomCode, viewCustomCode } from '@/utils/enum';
import { fetchPricePriority, contractTextGen } from '@/services/contractCommonService';
import SmartReview from '@/routes/components/SmartReview';
import { checkOrderSignContract } from '@/utils/commonCheck';
import { renderSmartTips } from '@/utils/renderer';
import IntelligentPreReview from '@/routes/components/IntelligentPreReview/index';

import RollBackModal from '../../Component/Modal/RollBackModal';
import FileModal from '../../Component/Modal/FileModal';
import ContractHeader from '../components/ContractHeader';
import AnchorSpcm from '../components/AnchorSpcm';
// import { MenuItemBtn } from './MenuItemBtn';
import ContractSubject from '../components/ContractSubject';
import ContractStage from '../components/ContractStage';
import ContractRebate from '../components/ContractRebate';
import ContractPartner from '../components/ContractPartner';
import ContractSignNode from '../components/ContractSignNode';
import ContractBusinessTerms from '../components/ContractBusinessTerms';
import ContractReplenish from '../components/ContractReplenish';
import ContractTableExtend from '../components/ContractTableExtend';
// import ApproveRecord from '../components/ApproveRecord';
import TextComparisonModal from '../components/TextComparisonModal';
import ChangeCompare from '../components/changeCompare';
import ContractAttachments from '../components/ContractAttachments';

import { useSealModal } from '../../Component/Modal/SealModal';

import ModeTag from '../components/modeTag';
import ContractTextMode from '../components/ContractTextMode';
import ContractReviewTab from '../components/ContractReviewTab';
import { openShareMangement } from '../components/ShareMangement/Button';
import openEditArea from '../components/CompareTextMode/EditArea/EditAreaModal';
import { smartContractModal } from '../components/SmartContract/utils/smartContractModal';
import SmartAbstract from '../components/SmartContract/SmartAbstract';

// import styles from '../components/index.less';
import styles from '../index.less';
import { editSection, readOnlySection } from './enum';
import { handleUnitPrice } from '../utils/utils';
import {
  subjectDS,
  stageDS,
  rebateDS,
  partnerDS,
  businessTermsDS,
  // approveRecordDS,
  replenishDS,
  tableExtendDS,
  getSignNodeDs,
} from '../components/DataSet';
import showTerminateModal from '../../Component/Modal/ShowTerminateModal';
import showHisCompareModal from '../../Component/Modal/HisCompareModal';
import showConfirmEffectModal from '../../Component/Modal/ConfirmEffectModal';
import SwitchTab from '../components/SwitchTab';
import ContractExtract from '../components/ContractExtract';
import { handleContractReviewType } from '../components/ContractReview/utils/utils';

// const { TabPane } = Tabs;
const commonViewPrompt = 'spcm.common.view.message.title';
const defaultSwitchTabKey = 'DOC';
const { openModal } = useOperationRecordModal();
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';
const customizeUnitCode = `SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.SUBJECT,SPCM.WORKSPACE_DETAIL.STAGE,SPCM.WORKSPACE_DETAIL.PARTNER,SPCM.WORKSPACE_DETAIL.BUSINESSTERMS,SPCM.WORKSPACE_DETAIL.REBATE,${Object.values(
  editCustomCode
).toString()}`;

class ContractControlDetail extends Component {
  editorOnlineRef;

  positionAnchorRef;

  constructor(props) {
    super(props);
    const {
      pcHeaderId,
      editable,
      coordinateable = null,
      headerFormDs,
      headerInfoRes,
      sealType,
      isChapter,
      location: { search, pathname },
      remoteWorkDetail,
      enableEditShare,
      enableSmartContract,
      enableOnlineAttachmentContract,
    } = props;
    const chapterFlag =
      headerInfoRes.pcStatusCode === 'APPROVED' ||
      (headerInfoRes.pcStatusCode === 'CONFIRMED' && headerInfoRes.electricSignFlag === 1) ||
      headerInfoRes.pcStatusCode === 'PURCHASER_SIGN_CONTRACT';
    const isPub = pathname.includes('/pub'); // 判断是否为pub页面
    // 单据流使用只读页面，单据流标识docLinkFlag，没有返回按钮，头按钮只有展示附件按钮（采购方、供应商、电子签章附件等）、操作记录，行上不显示单据流字段
    const { itemKey, docLinkFlag = 0, backVoidPage, isProcessEdit } = querystring.parse(
      search.substr(1)
    );
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    // const routerParams = querystring.parse(search.substr(1));
    // const editable = routerParams.hasChanged === 'true'; // 可编辑
    // const { isQuoteSource } = routerParams;
    // dataset 初始化
    const rebateDs = new DataSet(rebateDS({ pcHeaderId, editable }));
    const partnerDs = new DataSet(
      remoteWorkDetail
        ? remoteWorkDetail.process(
            'SPCM_WORKSPACE_DETAIL_PARTNERDS',
            partnerDS({ pcHeaderId, editable }),
            { props, _this: this }
          )
        : partnerDS({ pcHeaderId, editable })
    );
    const {
      pcTypeId,
      signatureType,
      pcKindCode,
      pcStatusCode,
      pcHeaderBackContractCompareFlag,
      checkDuplicationFlag,
    } = headerInfoRes;
    const pcKindAttachList = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_PCKINDATTACHLSIT',
          ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'],
          { props }
        )
      : ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'];
    const businessTermsDs = new DataSet(
      remoteWorkDetail
        ? remoteWorkDetail.process(
            'SPCM_WORKSPACE_DETAIL_BUSINESSTERMSDS',
            businessTermsDS({ pcHeaderId, editable, pcTypeId }),
            { headerFormDs }
          )
        : businessTermsDS({ pcHeaderId, editable, pcTypeId })
    );
    // 【只有在开启“启用SRM采购协议审”时才显示审批记录】这个功能在配置中心已经拿掉了，所以approveRecordDs也没有存在的必要的，
    // 现在用的操作记录组件openModal
    // const approveRecordDs = new DataSet(approveRecordDS({ pcHeaderId, editable }));
    const replenishDs = new DataSet(
      remoteWorkDetail
        ? remoteWorkDetail.process(
            'SPCM_WORKSPACE_DETAIL_REPLENISHDS',
            replenishDS({ pcHeaderId, editable }),
            { headerFormDs }
          )
        : replenishDS({ pcHeaderId, editable })
    );
    const tableExtendDs = new DataSet(tableExtendDS({ pcHeaderId, editable }));
    const isRejectAndOnline =
      ['SUPPLIER_REJECTED', 'REJECTED'].includes(pcStatusCode) &&
      enableEditShare === '1' &&
      pcHeaderBackContractCompareFlag !== '1';
    // 二开需存储在state中的值
    const cuxState = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_EXTRA_STATE',
          {},
          { partnerDS, pcHeaderId, editable, _this: this }
        )
      : {};
    this.state = {
      editable,
      coordinateable, // 协同按钮进入
      isShareContract: null, // 是否分配单据
      coordinatedFlag: null, // 是否完成协同
      pcHeaderId,
      sealType,
      headerFormDs,
      pcSubjectDs: null,
      pcStageDs: null,
      rebateDs,
      partnerDs,
      businessTermsDs,
      // approveRecordDs,
      replenishDs,
      tableExtendDs,
      headerInfo: headerInfoRes,
      termDataSource: [],
      pcStageDataSource: [],
      pcSubjectDataSource: [],
      partnerDataSource: [],
      pcRebateDataSource: [],
      replenishDataSource: [],
      templateList: [],
      fullScreenFlag: false, // 在线编辑全屏
      textComparisonVisible: false, // 文本对比
      templateListFlag: false,
      isPub,
      isProcessEdit,
      conChangeLoading: false, // 变更协议loading
      conSaveLoading: false, // 保存协议loading
      queryListLoading: true,
      itemKey: dataFromPurchaseContract ? itemKey : null,
      docLinkFlag,
      backVoidPage,
      headerInfoKey: 'control-headerInfo',
      contractSubjectInfoKey: 'control-contractSubjectInfo',
      contractStageKey: 'control-contractStage',
      contractRebateKey: 'control-contractRebate',
      contractPartnerKey: 'control-contractPartner',
      operationRecordVisible: false,
      historyCompareFlag: false,
      pcKindAttachList,
      isTextMode:
        (!!(isChapter && ['TEXT_SIGNATURE', 'TEXT_AND_ANNEX_SIGNATURE'].includes(signatureType)) ||
          coordinateable === '1' || // 协同模式默认为文本模式
          isRejectAndOnline) && // 开启在线编辑，且为拒绝状态，进入文本模式
        !pcKindAttachList.includes(pcKindCode), // 附件合同不存在文本模式，只有单据模式
      picDataSource: '', // 协议用章 用章图片
      focusStatus: '', // 选中印章图片标识
      sealId: '', // 选中印章图片ID
      signatureId: '', // 选中印章标识
      currentPic: 0,
      imgHeight: 140,
      chapterFlag,
      mobileModalVisible: false,
      verifyPhoneNum: '',
      rollbackPermission: false, // 退回至供应商按钮权限
      revokeByBusKeyFlag: false, // 是否支持撤销按钮显示
      approvalByBusKey: null, // 审批相关信息
      // approvalProcessByBusKey: null, // 审批进度相关信息
      showAlterFlag: false,
      switchTabKey: defaultSwitchTabKey,
      enableSmartContract, // 是否开启智能合同提取
      enableOnlineAttachmentContract, // 是否在《附件合同在线编辑黑名单》中
      // attachmentList: ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'], // 合同性质为附件合同集合
      refreshWpsFlag: false, // 拒绝状态，替换文件时刷新wps组件
      // checkDuplicationFlag === 3 代表提取到结果，不等于3隐藏智能审查结果; 审批页面不显示智能审查结果；只读页面不显示审查结果
      hiddenReviewResultFlag: Number(checkDuplicationFlag) !== 3 || isPub || !editable,
      disableAiApproveBtn: false,
      resultStatus: '',
      aiApproveReslultParams: [],
      ...cuxState,
    };
    this.attachmentRef = React.createRef();
    this.signNodeDs = new DataSet(getSignNodeDs({ isEdit: editable, pcHeaderId }));
    this.aiResultTimer = null;
  }

  componentDidMount() {
    const _this = this;
    const { headerInfoRes, isChapter, sealType, enableEditShare, onLoad } = this.props;
    const { isPub, isProcessEdit } = this.state;
    this.hanldeCuxInit();
    this.handleCustSwitchModeTabEvent(true);
    this.fetchAiApproveResult(true);
    _this.fetchList();
    this.queryOperationRevoke(headerInfoRes);
    if (isChapter) {
      this.fetchPermission();
      if (!isEmpty(sealType)) {
        this.fetchSealPictures();
      }
    }
    // 开启文本在线编辑
    if (enableEditShare === '1') {
      this.fetchEditShare();
    }
    if (isPub && isProcessEdit && onLoad) {
      onLoad({
        submit: this.handleWorkflowApprove,
      });
    } else if (isPub && onLoad) {
      onLoad({
        submit: this.handleWpsSave,
      });
    }
    this.handleInitActiveTab();
  }

  componentWillUnmount() {
    this.clearAIResultTimer();
    this.clearShareEditTimer();
    this.offDTOs(true);
    this.handleCustSwitchModeTabEvent();
  }

  @Bind()
  hanldeCuxInit() {
    const { remoteWorkDetail } = this.props;
    if (remoteWorkDetail?.event) {
      remoteWorkDetail.event.fireEvent('handleCuxInitInfo', { current: this });
    }
  }

  // 初始化激活的页签
  @Bind()
  handleInitActiveTab() {
    const { intelligent } = this.props;
    const { headerInfo, pcKindAttachList = [] } = this.state;
    const {
      supplementFlag,
      temporaryTemplateFileUrl,
      contractAttachmentUrl,
      pcKindCode,
      pcStatusCode,
      showAttachmentFlag,
    } = headerInfo || {};
    const attachmentContractFlag = pcKindAttachList.includes(pcKindCode); // 附件合同
    // 默认激活文本模式
    const textModeFlag = this.getContractTextModeFlag();
    let defaultActiveKey = textModeFlag ? 'TEXT' : '';
    if (Number(showAttachmentFlag) === 1) {
      // 附件合同仅显示单据模式标识 == 1 仅展示单据页，隐藏头部切换按钮
      this.handleSetSwitchTabKey('DOC');
      return;
    }
    if (
      intelligent && // 分屏模式没有附件时激活单据模式tab
      Number(supplementFlag) === 1 &&
      ['PENDING'].includes(pcStatusCode) &&
      ((attachmentContractFlag && !contractAttachmentUrl) ||
        (!attachmentContractFlag && !temporaryTemplateFileUrl))
    ) {
      defaultActiveKey = 'DOC';
    }
    this.handleSetSwitchTabKey(defaultActiveKey);
  }

  /**
   * 处理tab页签
   */
  @Bind()
  handleSetSwitchTabKey(key, cb = () => {}) {
    const { intelligent } = this.props;
    const { isTextMode } = this.state;
    const defaultKey = intelligent ? defaultSwitchTabKey : isTextMode ? 'TEXT' : 'DOC';
    const activeKey = key || defaultKey;
    const newTextMode = key ? key !== 'DOC' : isTextMode;
    this.setState(
      {
        switchTabKey: activeKey,
        isTextMode: newTextMode,
      },
      () => {
        cb();
      }
    );
  }

  /**
   * 获取包含在线附件模式标识
   */
  @Bind()
  getTextModeFlag() {
    const { switchTabKey } = this.state;
    return switchTabKey !== 'DOC';
  }

  @Bind()
  async newResetDataFromStorage(pcSubjectDs) {
    const {
      itemKey,
      pcHeaderId,
      headerInfo: {
        priceType,
        pcSourceCode,
        purchaseCurrencyCode = 'CNY',
        acceptExecuteType,
        recommendSupplierFlag,
      },
    } = this.state;
    const { _linkFlag = false } = this.props;
    if (!itemKey) {
      return [];
    }
    // 从sessionStorage中获取其他页面暂存的数据
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    if (!dataFromPurchaseContract) {
      return [];
    }
    dataFromPurchaseContract.pcSubjectDataSource = await handlePurchaseNeedDTOs(
      dataFromPurchaseContract.pcSubjectDataSource
    );
    const data = [];
    dataFromPurchaseContract.pcSubjectDataSource
      .filter((i) => i.itemId)
      .map((item) => {
        data.push({
          pcHeaderId,
          pcSourceCode,
          itemId: item.itemId,
          itemCode: item.itemCode,
          invOrganizationId: item.invOrganizationId,
          uomId: item.uomId,
          secondaryUomId: item.secondaryUomId,
        });
        return data;
      });
    //  六要素价格
    const itemObj = {};
    if (pcHeaderId) {
      const itemList = await batchQueryPrice({
        pcHeaderId,
        data,
      });
      // eslint-disable-next-line no-unused-expressions
      Array.isArray(itemList) &&
        itemList.forEach((item) => {
          itemObj[item.itemId] = item;
        });
    }
    const doubleUnitEnabled = pcSubjectDs?.getState('doubleUnitEnabled');
    // pricePriority 值为 "ONE", 现在逻辑，"TWO" 推荐价格>申请预估价>六要素取价
    const pricePriority = pcSubjectDs?.getState('pricePriority') || 'ONE';
    dataFromPurchaseContract.pcSubjectDataSource = (
      dataFromPurchaseContract.pcSubjectDataSource || []
    ).map((item) => {
      let rest = {};
      let attributeFields = {};
      const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
      const priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
      let finalCurrencyCode = item.currencyCode; // 原币
      const finalPurchaseCurrencyCode = item.purchaseCurrencyCode || purchaseCurrencyCode; // 本币
      const { priceLibraryStatus, enteredTaxIncludedPrice, originalUnitPrice, ...restItem } = item;
      // 采购申请没有【辅助单价不含税】secondaryUnitPrice，此处只是用来给benchmarkPrice一个undefined
      const secondField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      // 默认不含税单价修改
      const unitPriceObj = {
        unitPrice: originalUnitPrice, // 申请预估价
        // 基准价格的取值和含税单价/不含税单价，辅助含税单价/辅助不含税单价保持一致
        benchmarkPrice: doubleUnitEnabled ? item[secondField] : item[priceField],
      };
      // 推荐供应商取价，pricePriority === ONE默认取 申请预估价
      const recommendObj = pricePriority === 'ONE' ? { ...unitPriceObj } : {};
      const sixElementsObj = {}; // 六要素取价
      // 开启了推荐供应商,价格有效，取推荐供应商对应价格
      if (recommendSupplierFlag === 1) {
        if (priceLibraryStatus === 'VALID') {
          recommendObj.taxIncludedUnitPrice = enteredTaxIncludedPrice; // 推荐价格
          recommendObj.unitPrice = item.unitPrice; // 推荐价格
          recommendObj.benchmarkPrice = hasTaxInclude ? enteredTaxIncludedPrice : item.unitPrice;
          // 取申请行上对应的税种税率，解决申请行上没有含税单价或者不含税单价情况
          rest = restItem;
        }
      }
      // 六要素单价
      if (itemObj[item.itemId]) {
        // 六要素取价有值
        const { taxIncludedUnitPrice, unitPrice, unitPriceBatch, ...restObj } =
          itemObj[item.itemId] || {};
        const sixElementsTaxIncluded = taxIncludedUnitPrice;
        const sixElementsUnitPrice = unitPrice;
        rest = restObj;
        sixElementsObj[priceField] = hasTaxInclude ? sixElementsTaxIncluded : sixElementsUnitPrice;
        sixElementsObj.benchmarkPrice = hasTaxInclude
          ? sixElementsTaxIncluded
          : sixElementsUnitPrice;
        sixElementsObj.unitPriceBatch = unitPriceBatch;
        sixElementsObj.currencyCode = restObj.currencyCode;
        sixElementsObj.taxRate = restObj.taxRate;
        sixElementsObj.taxId = restObj.taxId;
        sixElementsObj.taxCode = restObj.taxCode;
        if (doubleUnitEnabled) {
          sixElementsObj[secondField] = restObj[secondField];
          sixElementsObj.benchmarkPrice = restObj[secondField];
        }
        finalCurrencyCode = isNumber(item[priceField]) ? item.currencyCode : rest.currencyCode;
        attributeFields = getAttributeFields(itemObj[item.itemId]);
      }
      const allPriceObj = handleUnitPrice({
        purchaseNeedObj: item,
        recommendObj,
        sixElementsObj,
        pricePriority,
        doubleUnitField: secondField, // 双单位字段
        priceField, // 原单位字段
        recommendSupplierFlag, // 推荐供应商
        hasTaxInclude,
        unitPriceObj,
        doubleUnitEnabled,
      });

      return {
        ...attributeFields,
        _status: 'create',
        // pcSubjectId: uuid(),
        edited: true,
        ...item,
        lineNum: '',
        ...allPriceObj,
        // currencyCode: pricePriority === 'THREE' ? rest.currencyCode : finalCurrencyCode,
        purchaseCurrencyCode: finalPurchaseCurrencyCode,
        exchangeRate: finalCurrencyCode === finalPurchaseCurrencyCode ? '1' : item.exchangeRate, // 原币=本币 汇率默认1
        // taxRate:
        //   !isNumber(item[priceField]) || pricePriority === 'THREE' ? rest.taxRate : item.taxRate,
        // taxId: !isNumber(item[priceField]) || pricePriority === 'THREE' ? rest.taxId : item.taxId,
        // taxCode:
        //   !isNumber(item[priceField]) || pricePriority === 'THREE' ? rest.taxCode : item.taxCode,
        // 新链路框架协议取全部数量
        quantity:
          _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
            ? item.quantity
            : item.availableQuantity,
        secondaryQuantity:
          _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
            ? item.secondaryQuantity
            : item.secondaryAvailableQuantity,
      };
    });
    return dataFromPurchaseContract.pcSubjectDataSource;
  }

  // 移除引用采购申请的缓存数据
  @Bind()
  offDTOs(onlySessionClear) {
    const { dispatch, pcHeaderId, intelligent } = this.props;
    const { itemKey } = this.state;
    const pathPart = intelligent ? 'intelligent' : 'update';
    if (!itemKey) {
      return;
    }
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    if (!dataFromPurchaseContract) {
      return;
    }
    window.sessionStorage.removeItem(itemKey);
    this.setState({
      itemKey: null,
    });
    // 为了解决，采购申请第一次保存之后，删除协议未跳转到列表页问题
    if (onlySessionClear) {
      return;
    }
    // 替换地址，避免刷新浏览器时依然读取缓存的值
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-workspace/${pathPart}/${pcHeaderId}`,
      })
    );
    // 清除tab中search，避免切换tab再次进入页面依然读取缓存的值
    updateTab({
      key: getActiveTabKey(),
      search: null,
    });
  }

  /**
   * 处理自定义事件SPCM_SWITCH_MODE_TAB
   * @param {*} init
   */
  @Bind()
  handleCustSwitchModeTabEvent(init) {
    const { intelligent } = this.props;
    if (intelligent) {
      if (init) {
        EventManager.on('SPCM_SWITCH_MODE_TAB', this.handleSwitchModeTab);
      } else {
        EventManager.off('SPCM_SWITCH_MODE_TAB', this.handleSwitchModeTab);
      }
    }
  }

  // 获取权限集
  @Bind()
  fetchPermission() {
    // 权限code
    const permissionList = [
      'srm.pc-admin.pc-purchaser.workspace2.button.back.supplier', // 退回至供应商
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        this.setState({
          rollbackPermission: res[0].approve,
        });
      }
    });
  }

  /**
   * 通过businesskey判断流程是否可以撤销
   * @param {*} headerInfoRes
   */
  @Bind()
  async queryOperationRevoke(headerInfoRes) {
    const { pcStatusCode, businessKey } = headerInfoRes;
    /* 1、协议状态=已提交时，判断协议提交审批方式；2、协议状态=待审批时，判断协议确认审批方式；
      3、协议状态=变更审批中时，判断协议可变更审批方式；4、协议状态=作废审批中时，判断协议作废审批方式；
      5、协议状态=归档审批中时判断协议归档审批方式；6、协议状态=终止审批中时；判断协议终止审批方式；
	•	  审批方式=工作流审批（统一对接）/工作流审批 /外部系统审批（统一对接），则调用平台统一提供的SDK，
      判断是否展示 撤销按钮，支持批量调用。参数；租户+businesskey。返回true则展示按钮，返回false则不展示。
   */
    if (
      statusApproveMap?.[pcStatusCode] &&
      ['WORKFLOW', 'WORKFLOW_APPROVAL', 'EXPORT_INTERFACE'].includes(
        headerInfoRes?.[statusApproveMap?.[pcStatusCode]]
      ) &&
      businessKey
    ) {
      Promise.all([
        operationRevoke([businessKey]),
        queryBatchApprovaFlag([businessKey]),
        // queryBatchSimpleApprovalHistory([businessKey]),
      ]).then(([res1, res2]) => {
        const res = getResponse(res1);
        if (res && res2) {
          this.setState({
            revokeByBusKeyFlag: res?.[businessKey]?.['REVOKE'],
            approvalByBusKey: res2?.[businessKey],
            // approvalProcessByBusKey: res3?.[businessKey],
          });
        }
      });
      // const res = getResponse(await operationRevoke([businessKey]));
      // if (res) {
      //   this.setState({ revokeByBusKeyFlag: res?.[businessKey]?.['REVOKE'] });
      // }
    }
  }

  /**
   * 获取印章图片
   */
  @Bind()
  fetchSealPictures() {
    const { dispatch } = this.props;
    const {
      sealType,
      headerInfo: { companyId },
    } = this.state;
    dispatch({
      type: 'contractChapter/fetchSealPictures',
      payload: {
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId,
        tenantId: getUserOrganizationId(),
        sealType,
      },
    }).then((res) => {
      if (res) {
        const picDataSource = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({
          picDataSource,
        });
      }
    });
  }

  /**
   * 提交的时候校验头上附件必输
   */
  @Bind()
  attachmentRequiredCheck() {
    const { templateList = [] } = this.state;
    const msg = [];
    templateList.forEach((item) => {
      if (item.nullableFlag === 0 && !item.supAttachmentFlag && !item.attachmentUrl) {
        msg.push(item.attachmentTypeName);
      }
    });
    if (msg.length > 0) {
      // notification.warning({
      //   message: `${intl.get('hzero.common.validation.notNull', {
      //     name: msg.join(','),
      //   })},${intl
      //     .get('spcm.common.model.common.upContractWithUpload')
      //     .d('请通过【附件上传】上传协议文本。')}`,
      // });
      notification.warning({
        message: `${intl.get('hzero.common.validation.notNull', {
          name: msg.join(','),
        })}`,
      });
      return null;
    } else {
      return 1;
    }
  }

  /**
   * 检查是否有非本条外的项修改过
   * @param {*} key
   * @param {*} selectedRows
   * @param {*} dataSource
   */
  @Bind()
  checkModified(key) {
    const {
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      // rebateDs,
      partnerDs,
      // businessTermsDs,
    } = this.state;

    let otherModeEdited = false; // 除当前操作列表，是否还有其他模块进行过修改
    let updateData = []; // 修改的列表项集合
    let selectedData = []; // 选择的列表项集合
    let primaryKey; // 用于匹配同一列表项在updateData和selectedData两个列表中的唯一标识
    let modifiedFlag = false; // 当前是否存在已修改却未保存的数据
    switch (key) {
      case 'pcSubject':
        otherModeEdited =
          headerFormDs.isModified() || partnerDs.isModified() || pcStageDs.isModified();

        updateData = pcSubjectDs.toData();
        selectedData = pcSubjectDs.selected;
        primaryKey = 'pcSubjectId';
        break;
      case 'partner':
        otherModeEdited =
          headerFormDs.isModified() || pcSubjectDs.isModified() || pcStageDs.isModified();

        updateData = partnerDs.toData();
        selectedData = partnerDs.selected;
        primaryKey = 'partnerId';
        break;
      case 'ladderQuote':
      default:
        return true;
    }

    const updateKeys = updateData.map((it) => it[primaryKey]);
    const selectKeys = selectedData.map((it) => it.data[primaryKey]);

    const uCreateKeys = updateKeys.filter((i) => i == null);
    const sCreateKeys = selectKeys.filter((i) => i == null);
    const sExistKeys = selectKeys.filter((i) => !!i);
    if (uCreateKeys.length === sCreateKeys.length) {
      if (isEmpty(sExistKeys)) {
        modifiedFlag = true;
      } else {
        modifiedFlag = updateKeys.filter((i) => !!i).every((id) => selectKeys.includes(id));
        modifiedFlag = modifiedFlag && !otherModeEdited;
      }
    }

    return modifiedFlag;
  }

  /**
   * 查询详情数据并初始化
   * @param headerInfoRes 协议头信息
   * @param hasChanged 是否变更
   */
  @Bind()
  async fetchList(headerInfoRes, hasChanged = false) {
    const {
      editable,
      pcHeaderId,
      headerFormDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      // approveRecordDs,
      replenishDs,
      tableExtendDs,
      isPub,
      isProcessEdit,
      itemKey,
    } = this.state;
    const headerInfo = headerInfoRes || this.state?.headerInfo || {};
    const { remoteWorkDetail, onFormLoaded, intelligent } = this.props;
    const { handleCuxStageLineUpdate } = remoteWorkDetail.props?.process || {};

    // 引用采购申请带出标的
    let pcSubjectList = [];
    this.setState({ conSaveLoading: true });
    // 查询签署人信息
    this.signNodeDs.query();
    await this.fetchConfigSetting().then(async (configSetting = {}) => {
      const doubleUomFlag = configSetting['000112'] === '1';
      const cuxPcSubjectCustCodeFlag = remoteWorkDetail
        ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_PCSUBJECT_CUSTCODEFLAG', editable, {
            ...this.props,
          })
        : editable;
      // 初始化Ds，需要使用头信息
      const pcSubjectCustCode = cuxPcSubjectCustCodeFlag
        ? 'SPCM.WORKSPACE_DETAIL.SUBJECT'
        : 'SPCM.WORKSPACE_DETAIL.SUBJECT.READONLY';
      // 获取个性化单元中配置的默认分页大小
      const pcSubjectPageSize = this.getCustConfigPageSize(pcSubjectCustCode);
      const subjectFieldList = subjectDS({
        pcHeaderId,
        editable,
        doubleUomFlag,
        headerFormDs,
        headerInfo,
        isPub,
        pageSize: pcSubjectPageSize,
      });
      const pcSubjectDs = new DataSet(
        remoteWorkDetail
          ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_SUBJECTDS', subjectFieldList, {
              current: this,
              headerInfo,
            })
          : subjectFieldList
      );
      const config = await this.queryAllConfig();
      const { doubleUnitFlag, pricePriority } = config || {};

      pcSubjectDs.setState({ doubleUnitEnabled: doubleUnitFlag, pricePriority });

      const pcStageCustCode = editable
        ? 'SPCM.WORKSPACE_DETAIL.STAGE'
        : 'SPCM.WORKSPACE_DETAIL.STAGE.READONLY';
      // 获取个性化单元中配置的默认分页大小
      const pcStagePageSize = this.getCustConfigPageSize(pcStageCustCode);
      const stageDsProps = stageDS({
        pcHeaderId,
        editable,
        headerInfo,
        pageSize: pcStagePageSize,
        handleCuxStageLineUpdate,
      });
      const cuxStageDsProps = remoteWorkDetail
        ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_PC_STAGE_DS_PROPS', stageDsProps, {
            intelligent,
            editable,
            headerInfo,
          })
        : stageDsProps;
      const pcStageDs = new DataSet(cuxStageDsProps);
      this.fetchStageAndPartnerList(headerInfo?.pcTypeId);
      this.getCheckStageCurrency();
      if (itemKey) {
        pcSubjectList = await this.newResetDataFromStorage(pcSubjectDs);
        if (isArray(pcSubjectList)) {
          // pcSubjectList.forEach((line) => pcSubjectDs.create(line));
          const batchCreateData = (selectedData) =>
            selectedData.forEach((line) => pcSubjectDs.create(line));
          const eventProps = {
            batchCreateData,
            selectedData: pcSubjectList,
            current: this,
            pcSubjectDs,
            headerInfo,
            from: 'wrapper',
          };
          if (remoteWorkDetail?.event) {
            remoteWorkDetail.event.fireEvent('handleCreateSubjectLines', eventProps);
          } else {
            batchCreateData(pcSubjectList);
          }
        }
      } else {
        const { content: pcSubjectDataSource } = await this.fetchTableList(
          pcSubjectDs,
          pcSubjectCustCode
        );
        pcSubjectList = pcSubjectDataSource;
      }
      const { content: pcStageDataSource } = await this.fetchTableList(pcStageDs, pcStageCustCode);

      const contractSubjectInfoAndStageKeyObj = hasChanged
        ? {
            contractSubjectInfoKey: 'control-contractSubjectInfo-Changed',
            contractStageKey: 'control-contractStage-Changed',
          }
        : {};
      this.setState({
        ...(headerInfoRes ? { headerInfo } : {}),
        pcSubjectDs,
        pcStageDs,
        pcSubjectDataSource: pcSubjectList,
        pcStageDataSource,
        ...contractSubjectInfoAndStageKeyObj,
      });
    });
    this.handleFetchConfigAttachment();
    // 埋点增加额外查询
    const remoteQuery = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_EXTRA_QUERY', [], {
          editable,
          fetchTableList: this.fetchTableList,
          _this: this,
        })
      : [];
    Promise.all([
      this.fetchTableList(
        rebateDs,
        editable ? 'SPCM.WORKSPACE_DETAIL.REBATE' : 'SPCM.WORKSPACE_DETAIL.REBATE.READONLY'
      ),
      this.fetchTableList(
        partnerDs,
        editable ? 'SPCM.WORKSPACE_DETAIL.PARTNER' : 'SPCM.WORKSPACE_DETAIL.PARTNER.READONLY'
      ),
      this.fetchTableList(replenishDs, 'SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH'),
      this.fetchTableList(
        businessTermsDs,
        editable
          ? 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS'
          : 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.READONLY'
      ),
      this.fetchTableList(
        tableExtendDs,
        editable
          ? 'SPCM.WORKSPACE_DETAIL.TABLEEXTEND'
          : 'SPCM.WORKSPACE_DETAIL.TABLEEXTEND.READONLY'
      ),
      ...remoteQuery,
    ]).then(
      ([
        { content: pcRebateDataSource = [] },
        partnerDataSource = [],
        replenishDataSource,
        termDataSource,
      ]) => {
        // this.fetchTableList(approveRecordDs);
        if (isPub && isProcessEdit && onFormLoaded) onFormLoaded(true);
        const contractRebateAndPartnerKeyObj = hasChanged
          ? {
              contractRebateKey: 'control-contractRebate-Changed',
              contractPartnerKey: 'control-contractPartner-Changed',
            }
          : {};
        this.setState({
          conSaveLoading: false,
          pcRebateDataSource,
          partnerDataSource,
          termDataSource,
          replenishDataSource,
          ...contractRebateAndPartnerKeyObj,
          queryListLoading: false,
        });
      }
    );
  }

  // 查询配置
  @Bind()
  async queryAllConfig() {
    const result = await Promise.all([
      // 双单位
      queryCommonDoubleUomConfig(),
      // 查询业务规则定义取价优先级
      fetchPricePriority(),
    ]);
    const [res1, res2] = result;
    let configObj = {
      doubleUnitFlag: res1 || 0,
      pricePriority: 'ONE',
    };
    let parseRes2 = res2;
    try {
      parseRes2 = JSON.parse(res2);
    } catch (error) {
      parseRes2 = res2;
    }
    if (getResponse(parseRes2)) {
      configObj = {
        ...configObj,
        pricePriority: res2,
      };
    }
    return configObj;
  }

  /**
   * 查询个性化单元中配置默认页码
   */
  @Bind()
  getCustConfigPageSize(customizeUnitCode) {
    const { custConfig } = this.props;
    const { pageSize = 10 } = custConfig[customizeUnitCode] || {};
    return pageSize || 10;
  }

  /**
   * 查询协议阶段值集、合作伙伴值集
   */
  @Bind()
  fetchStageAndPartnerList(pcTypeId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchStageAndPartnerList',
      payload: {
        pcTypeId,
      },
    });
  }

  /**
   * 判断阶段币种是否和标的币种一致
   */
  @Bind()
  getCheckStageCurrency() {
    const { editable, pcHeaderId } = this.state;
    if (editable && pcHeaderId) {
      checkStageCurrency(pcHeaderId).then((res) => {
        const result = getResponse(res);
        this.setState({ showAlterFlag: !!result });
      });
    }
  }

  /**
   * 查询头信息
   */
  @Bind()
  fetchHeader() {
    const { headerFormDs } = this.state;
    return headerFormDs.query();
  }

  /**
   * 查询表格数据
   * @param {*} ds dataset
   * @param {*} customizeUnitCode 个性化单元code
   */
  @Bind()
  fetchTableList(ds, customizeUnitCode) {
    ds.setQueryParameter('queryParams', {
      customizeUnitCode,
    });
    return ds.query();
  }

  @Bind()
  formatTime(dataSource = [], fields = [], commonFormatStr = DEFAULT_DATE_FORMAT) {
    if (isArray(dataSource)) {
      let formatString = commonFormatStr; // 默认的格式化配置
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          let key = field; // 需要格式化的字段名，默认为传入的field
          if (isPlainObject(field)) {
            // 当其为对象时
            key = field.keyName;
            formatString = field.formatStr;
          }

          if (!isString(field)) {
            throw Error(
              `The type of target which need to format is Error! (1, string time format 2, moment time format 3, object that contains target key and target format`
            );
          }

          newItem[key] = item[key] ? moment(item[key]).format(formatString) : undefined;
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]] 数据数组
   * @param {*} [fields=[]] 字段数组
   */
  @Bind()
  formatSubjectTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          newItem[field] = item[field]
            ? moment(item[field]).format(DEFAULT_DATE_FORMAT)
            : undefined;
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * 查询配置中心配置
   */
  @Bind()
  fetchConfigSetting() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractCommon/fetchConfigSetting',
    });
  }

  /**
   * @param {String} field 设置的字段
   * @param {Boolean} flag 设置的值
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const parent = this.getParent(
      document.getElementById('spcm-contract-maintain-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 文本对比modal
   */
  @Bind()
  handleControlComparison() {
    const { textComparisonVisible, headerInfo, pcKindAttachList } = this.state;
    if (pcKindAttachList.includes(headerInfo.pcKindCode) && !headerInfo?.contractAttachmentUrl) {
      notification.warning({
        message: intl
          .get('spcm.workspace.view.msg.contractAttachmentUrlMissing')
          .d('请先上传附件合约文件，再进行文字比对。'),
      });
    } else {
      this.setState({ textComparisonVisible: !textComparisonVisible });
    }
  }

  /**
   * 变更操作
   */
  @Bind()
  @Debounce(200)
  async handleContractChange(otherParams = {}) {
    const { dispatch, intelligent } = this.props;
    const {
      headerInfo,
      tableExtendDs,
      termDataSource,
      pcStageDataSource,
      pcSubjectDataSource,
      partnerDataSource,
      pcRebateDataSource,
      replenishDataSource,
    } = this.state;

    let payload = {
      ...merge(headerInfo),
      ...otherParams,
      mainContractId: headerInfo.pcHeaderId,
      pcHeaderId: null,
      amount: null,
      creationDate: null,
      // pcNum: null,
      createdBy: null,
      electricSignFlag: null,
      alterationFlag: 1,
      // attachmentUuid: uuid(),
    };

    const tableExtendDataSource = tableExtendDs.toData();

    if (['CONFIRMED', 'EFFECTED'].includes(headerInfo.pcStatusCode)) {
      payload = {
        ...payload,
        pcSubjectDetailDTOList: cloneDeep(
          this.formatSubjectTime(pcSubjectDataSource, [
            'deliverDate',
            'priceEndDate',
            'priceStartDate',
          ])
        ),
        pcPartnerDetailDTOList: cloneDeep(partnerDataSource),
        pcStageDetailDTOList: cloneDeep(pcStageDataSource),
        pcTermDetailDTOList: cloneDeep(termDataSource?.content),
        pcRebateInformationlist: cloneDeep(pcRebateDataSource),
        pcReplenishDTOList: cloneDeep(replenishDataSource),
        pcTableExtendDetailDtoList: cloneDeep(tableExtendDataSource),
      };
    }

    const response = getResponse(await changeContract(payload));
    this.setState({ conChangeLoading: false });
    if (response) {
      notification.success();
      const { pcHeaderId: headerId, pcStatusCode } = response;
      if (pcStatusCode === 'CHANGE_TO_APPROVAL') {
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-workspace/list`,
          })
        );
      } else {
        const pathPart = intelligent ? 'intelligent' : 'update';
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-workspace/${pathPart}/${headerId}`,
            search: querystring.stringify({ hasChanged: 'true' }),
          })
        );
      }
    }
  }

  /**
   * 校验数据（保存或提交前）
   * isSubmit 判断是否是必输
   */
  @Bind()
  async handleContractValidate(isSubmit) {
    const {
      pcKindAttachList,
      headerInfo,
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      tableExtendDs,
      // replenishDs,
      // pcStageDataSource,
      // pcSubjectDataSource,
    } = this.state;
    const { remoteWorkDetail, showTextMode } = this.props;

    // 根据验收类型验证标的或阶段行
    let headerData = headerFormDs.toData();
    headerData = this.handleObjectSpread(headerInfo, headerData[0]);
    if (!(pcStageDs && pcSubjectDs)) {
      notification.warning({
        message: intl
          .get('spcm.common.view.msg.notCompleted')
          .d('标的和阶段未加载完成，请稍后再试！'),
      });
      return false;
    }
    pcStageDs.setState('validState', headerData.acceptType === 'stage' && headerData.pcHeaderId);
    pcSubjectDs.setState('validState', headerData.acceptType === 'target' && headerData.pcHeaderId);

    let configObj = {
      isNotATTACHMENT: !pcKindAttachList.includes(headerInfo.pcKindCode), // 非附件类协议
    };

    let attachmentUrlValidFlag =
      isSubmit && !configObj?.isNotATTACHMENT && !headerInfo.contractAttachmentUrl;
    if (remoteWorkDetail) {
      // 对象二开整合成一个埋点，避免一个一个埋点的添加。
      configObj = remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_VALIDATE_CONFIGOBJ', configObj, {
        current: this,
      });
      attachmentUrlValidFlag = remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_ATTACHMENT_URL_VALID',
        attachmentUrlValidFlag,
        {
          current: this,
        }
      );
      // 基于（src-32251）二开通用校验 埋点添加
      const cuxValidateFlag = await remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_CUX_VALIDATE',
        true,
        {
          current: this,
          isSubmit,
        }
      );
      if (!cuxValidateFlag) {
        return false;
      }
    }

    if (attachmentUrlValidFlag && this?.attachmentRef?.current) {
      const { customAttachmentDs } = this.attachmentRef.current;
      customAttachmentDs.getField('contractAttachmentUrl').set('required', true);
      if (!customAttachmentDs.get('contractAttachmentUrl') && showTextMode) {
        notification.warning({
          message: intl
            .get('spcm.common.view.msg.uploadContractAttachmentUrl')
            .d('请通过【替换文件】按钮上传协议文本！'),
        });
        return false;
      }
    } else if (this?.attachmentRef?.current) {
      this.attachmentRef.current.customAttachmentDs
        .getField('contractAttachmentUrl')
        .set('required', false);
    }

    const headerFlag = await headerFormDs.validate();
    const subjectFlag = await pcSubjectDs.validate();
    const stageFlag = await pcStageDs.validate();
    const partnerFlag = await partnerDs.validate();
    const customRowFlag = await tableExtendDs.validate();
    // 校验签署节点信息
    const signNodeCheckFlag = await this.signNodeDs.validate();
    const pcRebateFlag = headerInfo.rebateFlag ? await rebateDs.validate() : true;
    const pcTermFlag = configObj?.isNotATTACHMENT ? await businessTermsDs.validate() : true;
    let attachmentFlag = true;
    if (this?.attachmentRef?.current) {
      const {
        purchaserAttachmentDs,
        archiveAttachmentDs,
        esignAttachmentDs,
        offlineMutualSignDs,
        customAttachmentDs,
      } = this.attachmentRef.current;
      attachmentFlag = await Promise.all([
        purchaserAttachmentDs.validate(),
        archiveAttachmentDs.validate(),
        esignAttachmentDs.validate(),
        offlineMutualSignDs.validate(),
        customAttachmentDs.validate(),
      ]).then((flags) => flags.every((flag) => flag));
    }
    if (
      !headerFlag ||
      !subjectFlag ||
      !stageFlag ||
      !partnerFlag ||
      !pcRebateFlag ||
      !pcTermFlag ||
      !signNodeCheckFlag ||
      !customRowFlag ||
      !attachmentFlag
    ) {
      this.batchHandleUploading(attachmentFlag);
      return;
    }

    return true;
  }

  /**
   * 校验上传中的附件，如果存在上传中的附件抛出错误
   * @param {*} attachmentFlag
   */
  @Bind()
  batchHandleUploading(attachmentFlag) {
    if (!attachmentFlag && this.attachmentRef?.current) {
      Object.values(this.attachmentRef?.current).forEach((ds) => {
        // 抛出是否有正在上传的文件
        const headerAttachmentValidateObj =
          ds
            .getValidationErrors()[0]
            ?.errors[0]?.errors?.filter((item) => item?.ruleName === 'attachmentError')[0] || {};
        const message = headerAttachmentValidateObj.$validationMessage;
        if (message) {
          notification.error({ message });
        }
      });
    }
  }

  /**
   * 整合数据（保存或提交前）
   */
  @Bind()
  async handleContractDataMerge() {
    const { remoteWorkDetail } = this.props;
    const {
      pcKindAttachList,
      headerInfo,
      // termDataSource,
      // pcStageDataSource,
      // pcSubjectDataSource,
      // partnerDataSource,
      // pcRebateDataSource,
      // replenishDataSource,
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      replenishDs,
      tableExtendDs,
    } = this.state;
    const isNotATTACHMENT = !pcKindAttachList.includes(headerInfo.pcKindCode); // 非附件类协议

    let headerData = headerFormDs?.toData()[0];
    headerData = this.handleObjectSpread(headerInfo, headerData);

    let pcSubjectDetailDTOList = pcSubjectDs.toData();
    pcSubjectDetailDTOList = this.formatSubjectTime(pcSubjectDetailDTOList, [
      'deliverDate',
      'priceEndDate',
      'priceStartDate',
    ]);
    const pcStageDetailDTOList = pcStageDs.toData();
    const pcPartnerDetailDTOList = partnerDs.toData();
    const pcTableExtendDetailDtoList = tableExtendDs.toData();

    const pcRebateInformationlist = headerInfo.rebateFlag ? rebateDs.toData() : [];
    // 签署节点信息
    const integrationSignNodeList = this.signNodeDs.toData();

    let pcTermDetailDTOList = [];
    if (isNotATTACHMENT) {
      pcTermDetailDTOList = businessTermsDs.toData();
      pcTermDetailDTOList = [
        ...pcTermDetailDTOList.filter((i) => !['DATE', 'DATETIME'].includes(i.termType)),
        ...this.formatTime(
          pcTermDetailDTOList.filter((it) => it.termType === 'DATE'),
          ['termContent'],
          DEFAULT_DATE_FORMAT
        ),
        ...this.formatTime(
          pcTermDetailDTOList.filter((item) => item.termType === 'DATETIME'),
          ['termContent'],
          DEFAULT_DATETIME_FORMAT
        ),
      ];
    }

    const pcReplenishDTOList = replenishDs.toData();
    /**
     * 由于阶段行上的付款比例和原币费用跟协议总额相关联，而协议总额的更新受制于协议标的行上相关字段
     * 后者在更新较为滞后（需要保存单据或者删除标的行时才会在服务端进行相关计算）
     * 因此，需要校验一下协议标的行上相关字段是否为0（直接校验相关字段是否为0比copy服务端相关计算逻辑更便捷，后者计算逻辑比较庞大）；
     * 若不为0，则需要将协议阶段行上的付款比例和原币费用置为0（srm-17314的需求）
     */
    // const notZero = pcSubjectDetailDTOList.some((item) => {
    //   const { quantity, exchangeRate, taxIncludedUnitPrice, unitPrice } = item;
    //   return (
    //     (Number(taxIncludedUnitPrice) !== 0 || // 原币含税单价
    //       Number(unitPrice) !== 0) && // 原币不含税单价
    //     ![
    //       Number(quantity), // 数量
    //       Number(exchangeRate), // 汇率
    //     ].includes(0)
    //   );
    // });
    // // !notZero意味着协议标的行上要么没数据，要么数据汇总得到的协议总额为0
    // let pcStageDTOList = pcStageDetailDTOList;
    // if (!notZero) {
    //   pcStageDTOList = pcStageDetailDTOList.map((item) => {
    //     return {
    //       ...item,
    //       // payRatio: 0,
    //       costQuantity: 0,
    //     };
    //   });
    // }

    let otherData = {};
    if (remoteWorkDetail) {
      otherData = remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_DATAMERGE', otherData, {
        current: this,
        pcPartnerDetailDTOList,
      });
    }

    return {
      ...headerData,
      pcSubjectDetailDTOList,
      pcStageDetailDTOList,
      pcRebateInformationlist,
      pcPartnerDetailDTOList,
      pcTermDetailDTOList,
      pcReplenishDTOList,
      pcTableExtendDetailDtoList,
      integrationSignNodeList,
      ...otherData,
    };
  }

  /**
   * delete 删除采购协议
   */
  @Bind()
  handleDeleteContract() {
    const { dispatch, remoteWorkDetail } = this.props;
    const { headerInfo } = this.state;
    ModalPro.confirm({
      key: ModalPro.key(),
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`spcm.common.view.message.title.deleteContract`)
        .d('确认要删除当前协议么？'),
      onOk: () => {
        this.setState({ conSaveLoading: true }, () => {
          dispatch({
            type: 'contractMaintain/delete',
            payload: [headerInfo],
          })
            .then(async (res) => {
              if (remoteWorkDetail?.event) {
                const res = await remoteWorkDetail.event.fireEvent('handleCuxDeleteAfter', {
                  current: this,
                });
                if (!res) {
                  return;
                }
              }
              if (res) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: `/spcm/contract-workspace/list`,
                  })
                );
              }
            })
            .finally(() => {
              this.setState({ conSaveLoading: false });
            });
        });
      },
    });
  }

  /**
   * 查询配置的附件列表
   */
  @Bind()
  handleFetchConfigAttachment() {
    const { pcHeaderId, headerFormDs } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchPcAttachmentList',
      payload: pcHeaderId,
    }).then((templateList) => {
      if (templateList) {
        this.setState({
          templateList,
          templateListFlag: true,
        });
        templateList.forEach((item) => {
          const { attachmentTypeCode, attachmentTypeName, attachmentUuid } = item;
          const fieldName = `template-${attachmentTypeCode}`;
          if (!headerFormDs.getField(fieldName)) {
            headerFormDs.addField(fieldName, { label: attachmentTypeName, type: 'attachment' });
          }
          headerFormDs.current.init(fieldName, attachmentUuid);
        });
      }
    });
  }

  /**
   * 确认生效
   * @returns
   */
  @Bind()
  async handleComfirmEffect() {
    const { headerInfo } = this.state;
    const { customizeForm, history } = this.props;
    const callBack = () => {
      notification.success();
      history.push('/spcm/contract-workspace/list');
    };
    showConfirmEffectModal({ headerInfo, callBack, customizeForm });
  }

  /**
   * 修改 将状态【待生效】改为【拒绝生效】
   */
  @Bind()
  async handleComfirmCancel() {
    const { history } = this.props;
    const { headerInfo } = this.state;
    ModalPro.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl.get(`spcm.common.view.message.title.comfirmCancel`).d('确认修改协议吗？'),
      async onOk() {
        const response = getResponse(await rejectContract([headerInfo]));
        if (response) {
          notification.success();
          history.push('/spcm/contract-workspace/list');
        }
      },
    });
  }

  /**
   * 作废
   */
  @Bind()
  async handleInvalid() {
    const { remoteWorkDetail, history } = this.props;
    const { headerInfo } = this.state;
    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }

    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxInvalid', { current: this });
      if (!res) {
        return;
      }
    }
    ModalPro.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`spcm.common.view.message.title.invalidContract`)
        .d('确认要作废该协议吗？'),
      async onOk() {
        const response = getResponse(await invalidContract([headerInfo]));
        if (response) {
          notification.success();
          history.push('/spcm/contract-workspace/list');
        }
      },
    });
  }

  /**
   * 覆盖性合并对象
   * @param {*} oldObj
   * @param {*} newObj
   */
  @Bind()
  handleObjectSpread(oldObj, newObj) {
    if (typeof newObj !== 'object' || newObj == null || Object.keys(newObj).length === 0) {
      return oldObj;
    }
    if (typeof oldObj !== 'object' || oldObj == null) return newObj;

    return Array.from(new Set(Object.keys(oldObj).concat(Object.keys(newObj)))).reduce(
      (spreadObject, key) => {
        // eslint-disable-next-line
        spreadObject[key] = Object.prototype.hasOwnProperty.call(newObj, key) ? newObj[key] : null;

        return spreadObject;
      },
      {}
    );
  }

  /**
   * 合并对象数组
   * @param originSource      原数据集合
   * @param updatedSource     需要更新的数据集合
   * @param itemKey           查找合并目标对象的唯一标识
   * 这个判断有问题如果isOriginLarge 为FALSE，会有问题，所以加了一个ONLY
   * 加上影响太大只能加了这一个
   */
  @Bind()
  handleMergeArray(originSource, updatedSource, itemKey) {
    if (isArray(originSource) && isArray(updatedSource)) {
      const isOriginLarge = originSource.length >= updatedSource.length;
      // let outerList;
      // let innerList;
      console.log(isOriginLarge, 'isOriginLarge', itemKey);
      const outerList = originSource;
      const reTtruneOuterList = originSource.map((item) => {
        return {
          ...item,
        };
      });
      const innerList = updatedSource;
      // if (isOriginLarge) {
      //   outerList = originSource;
      //   innerList = updatedSource;
      // } else {
      //   outerList = updatedSource;
      //   innerList = originSource;
      // }
      innerList.forEach((upItem) => {
        const tarIndex = outerList.findIndex((item) => item[itemKey] === upItem[itemKey]);
        if (tarIndex > -1) {
          reTtruneOuterList[tarIndex] = this.handleObjectSpread(outerList[tarIndex], upItem);
          // outerList[tarIndex] = _objectSpread({}, outerList[tarIndex], {}, upItem);
        } else {
          reTtruneOuterList.push(upItem);
        }
      });

      return reTtruneOuterList;
    } else {
      throw Error('The origin Source or updated Source is not an Array!');
    }
  }

  /**
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    this.fetchHeaderAfterOperation();
    this.handleFetchConfigAttachment();
  }

  /**
   * 保存purchaserAttachmentUuid
   * @param {*} purchaserAttachmentUuid
   */
  @Bind()
  async handleSaveUuid(purchaserAttachmentUuid) {
    const { headerInfo, headerFormDs } = this.state;
    if (!headerInfo.purchaserAttachmentUuid) {
      const response = getResponse(
        await updateHeaderInfo({
          ...headerInfo,
          purchaserAttachmentUuid,
        })
      );
      if (response) {
        headerFormDs.current.init({
          purchaserAttachmentUuid: response.purchaserAttachmentUuid,
          objectVersionNumber: response.objectVersionNumber,
        });
        this.setState({
          headerInfo: {
            ...headerInfo,
            ...response,
          },
        });
      }
    }
  }

  /**
   * 终止协议前置处理
   * @returns
   */
  @Bind()
  async terminateContractFunc() {
    const { headerInfo } = this.state;
    const { pcHeaderId, customizeForm } = this.props;

    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }

    const validRes = getResponse(await terminateContractValid([pcHeaderId]));
    if (validRes) {
      // strategy：2，existsDwonStream： Y，显示弱提示：合同存在有效下游订单/物流/预付款，合同不可终止
      if (validRes?.strategy === '2' && validRes?.existsDwonStream === 'Y') {
        const feedback = await ModalPro.confirm({
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('spcm.common.view.message.cannotTerminate')
            .d('合同存在有效下游订单/物流/预付款，合同不可终止'),
        });
        if (feedback === 'ok') {
          showTerminateModal(this.handleTerminate, { customizeForm, headerInfo });
        }
        return false;
      }
      // strategy：0或1，直接终止
      showTerminateModal(this.handleTerminate, { customizeForm, headerInfo });
    }
  }

  /**
   * 终止
   */
  @Bind()
  async handleTerminate(terminateDs) {
    const { headerInfo } = this.state;
    const { remoteWorkDetail } = this.props;

    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxTerminate', {
        terminateDs,
        currentState: this.state,
        currentProps: this.props,
      });
      if (!res) {
        return;
      }
    }

    const flag = await terminateDs.validate();
    const data = (await terminateDs.toData()[0]) || {};
    const { terminationReason, terminationAttachmentUuid } = data;
    const params = {
      pcHeaderStatus: 'TERMINATION_CONFIRM',
      pcHeaderDetailDtos: [
        { ...headerInfo, ...data, terminationReason, terminationAttachmentUuid },
      ],
    };
    if (flag) {
      const response = getResponse(await terminateContract(params));
      if (response) {
        notification.success();
        this.props.history.push('/spcm/contract-workspace/list');
      }
      return true;
    }
    return false;
  }

  /**
   * 更新头上的协议文本类型附件url
   * @param {Object} headerInfo 头信息
   */
  @Bind()
  handleUpdateContractTextUrl(headerInfo) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/updateContractTextUrl',
      payload: headerInfo,
    });
  }

  // 提交前校验
  @Bind()
  async handlePreSubmitValidate() {
    const { remoteWorkDetail } = this.props;
    const { pcHeaderId } = this.state;
    if (remoteWorkDetail) {
      const preSubmitValidFlag = await remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_PRE_SUBMIT_VALIDATE',
        () => {},
        {
          current: this,
        }
      );
      if (!preSubmitValidFlag) {
        this.refreshData();
        return false;
      }
    }
    // 提交前校验预算
    const validateBudgetFlag = await preSubmitValidBudget([
      {
        pcHeaderId,
      },
    ]);
    if (!validateBudgetFlag) {
      this.refreshData();
      return false;
    }
    return true;
  }

  /**
   * 审批单据需要手动保存wps防止文本数据丢失。
   * @returns
   */
  @Bind()
  handleWpsSave(approvalResult, task) {
    const { isTextMode } = this.state;
    const { remoteWorkDetail } = this.props;
    return new Promise(async (resolve, reject) => {
      if (remoteWorkDetail?.event) {
        const cuxFlag = await remoteWorkDetail.event.fireEvent('handleCuxWpsSave', {
          approvalResult,
          resolve,
          reject,
          current: this,
          workflowTask: task,
        });
        if (!cuxFlag) {
          return false;
        }
      }
      // 文本模式，手动保存编辑文档
      if (isTextMode && this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        this.editorOnlineRef.saveDocument({ data: 'saveDocument' }).then((res) => {
          if (res) {
            resolve(); // 文件保存成功继续执行
          } else {
            reject(); // 文件保存失败中断审批
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * handleWorkflowApprove 回调函数用于工作流审批界面审批按钮回调
   * @param _approveResult 工作流审批页面的审批结果 approved 审批通过 rejected 审批拒绝
   */
  @Bind()
  handleWorkflowApprove(approveResult) {
    const { remoteWorkDetail } = this.props;
    const { headerFormDs } = this.state;
    return new Promise((resolve, reject) => {
      if (remoteWorkDetail?.event) {
        remoteWorkDetail.event.fireEvent('handleCuxWorkflowApprove', {
          approveResult,
          resolve,
          reject,
          handleUpdateContract: () => this.handleUpdateContract({}, 0, null, resolve, reject),
          headerFormDs,
        });
      } else {
        this.handleUpdateContract({}, 0, null, resolve, reject);
      }
    });
  }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段
   */
  @Bind()
  @Debounce(200)
  handleUpdateContract(params = {}, oldEditStep, isSubmit, resolve, reject) {
    const { headerFormDs, pcHeaderId, pcStageDs } = this.state;
    const { remoteWorkDetail } = this.props;
    const isTextMode = this.getTextModeFlag();
    const headerInfoCurrent = headerFormDs?.toJSONData()[0] || {};
    const {
      pcStatusCode,
      supplementFlag,
      mainContractId,
      version,
      pcNum,
      mainPcNum,
      payPlanNum,
      pcKindCode,
    } = headerInfoCurrent;
    let pcStatusFlag;
    if (supplementFlag) {
      pcStatusFlag = 3;
    } else if (!supplementFlag && mainContractId && version > 1) {
      pcStatusFlag = 1;
    } else if (['PENDING', 'REJECTED', 'SUPPLIER_REJECTED'].includes(pcStatusCode)) {
      pcStatusFlag = 0;
    } else {
      pcStatusFlag = 2;
    }
    const data = {
      pcHeaderId,
      pcNum,
      mainPcNum: supplementFlag ? mainPcNum : null,
      pcStatusFlag, // 协议状态标识(0新建&审批拒绝&拒绝生效/1变更协议/2生效和其他状态/3补充协议)
    };
    const _this = this;
    _this.setState({ conSaveLoading: true }, async () => {
      const {
        tenantId,
        // isTextMode,
        // pcHeaderId,
      } = _this.state;
      const isValid = await _this.handleContractValidate();
      if (!isValid) {
        _this.setState({ conSaveLoading: false });
        // 如果是文本模式，切换至单据模式
        if (isTextMode) {
          _this.handleSetSwitchTabKey('DOC', () => {
            // 切换完成后，重新触发校验，定位到错误位置
            _this.handleContractValidate();
          });
        }
        if (isFunction(reject)) reject();
        return;
      }
      // 文本模式，手动保存编辑文档
      if (isTextMode && this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        const res = await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
        if (!res) {
          if (isFunction(reject)) reject();
          _this.setState({ conSaveLoading: false });
          return false;
        }
      }

      let payload = await _this.handleContractDataMerge();
      if (remoteWorkDetail) {
        payload = await remoteWorkDetail.process('SPCM.WORKSPACE_DETAIL.SAVE', payload, {
          current: this,
          params,
          oldEditStep,
          isSubmit,
        }); // 一诺威埋点二开
        if (!payload) {
          return;
        }
      }
      const updateContractParams = {
        tenantId,
        ...payload,
        ...params,
        workbenchFlag: '1',
        customizeUnitCode,
      };
      const response = getResponse(await updateContract(updateContractParams));

      if (response) {
        if (remoteWorkDetail?.event) {
          const res = await remoteWorkDetail.event.fireEvent('handleCuxAfterUpdate', {
            current: this,
            params,
            oldEditStep,
            isSubmit,
          });
          if (!res) {
            return;
          }
        }
        if (isSubmit === 'isSubmit') {
          const preSubmitValidateFlag = await this.handlePreSubmitValidate();
          if (!preSubmitValidateFlag) {
            return false;
          }
          // 无付款计划：业务规则=是&原协议&有阶段&协议性质不等于非系统供应商 -调用
          // 查询业务规则定义-【协议生成付款计划】
          const paymentPlanFlag =
            !supplementFlag &&
            (getResponse(
              await createPaymentPlan({
                pcHeaderId,
              })
            ) ||
              0);
          // 有付款计划：调用
          // 无付款计划：业务规则=是&原协议&有阶段&协议性质不等于非系统供应商 -调用
          if (payPlanNum || paymentPlanFlag) {
            if (pcStageDs?.length > 0 && pcKindCode !== 'NOT_SYS_SUPPLIER') {
              // 补充协议的时候要预校验提交内容,预提交校验通过之后才允许走弹框打开规则
              const preValid =
                supplementFlag &&
                !getResponse(
                  await preSubmitValid({
                    pcHeaderId,
                  })
                );
              if (preValid) {
                this.refreshData();
                return false;
              }
              return openTermsModal(
                {
                  type: 'submit',
                  record: headerInfoCurrent,
                  afterOk: () => this.onSubmit(),
                  changeLoading: () => {
                    this.setState({
                      conSaveLoading: false,
                    });
                  },
                  onCancel: () => {
                    _this.setState({ conSaveLoading: false });
                    _this.refreshData();
                  },
                },
                data
              );
            } else {
              return ModalPro.confirm({
                key: ModalPro.key(),
                title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                children: intl
                  .get(`spcm.common.view.message.msg.paymentPlan.confirm`)
                  .d(
                    '协议性质为非系统供应商合同或协议阶段为空时，无法生成付款计划，是否确认提交？'
                  ),
                onOk: () => this.onSubmit(),
                onCancel: () => {
                  _this.refreshData();
                },
              });
            }
          } else {
            return this.onSubmit();
          }
        } else if (isSubmit === 'generatorPreFile') {
          // 生成预文本
          if (isFunction(this.handleGeneratorPreFile)) {
            return this.handleGeneratorPreFile();
          }
        } else if (isSubmit === 'contractTextGen') {
          // 生成合同文本
          if (isFunction(this.handleContractTextGen)) {
            return this.handleContractTextGen(updateContractParams);
          }
        } else if (['MANUAL_REVIEW', 'REFRESH_REVIEW'].includes(isSubmit)) {
          // 合同审查
          if (isFunction(this.handleSmartReview)) {
            this.handleSmartReview(isSubmit);
          }
          return;
        }
        if (isFunction(resolve)) resolve();
        notification.success();
        _this
          .fetchHeader()
          .then((res) => {
            // 埋点
            if (remoteWorkDetail?.event) {
              const eventProps = {
                headeInfoDs: headerFormDs,
                attachmentRef: this?.attachmentRef,
              };
              remoteWorkDetail.event.fireEvent('handleCuxSaveHeaderAfter', eventProps);
            }
            _this.offDTOs();
            _this.fetchList(res);
          })
          .catch(() => {
            _this.setState({ conSaveLoading: false });
          });
      } else {
        if (isFunction(reject)) reject();
        _this.setState({ conSaveLoading: false });
      }
    });
  }

  // 执行ai预审
  @Bind()
  @Debounce(200)
  handleAiApprove() {
    const { headerFormDs, pcSubjectDs, pcStageDs, partnerDs, pcHeaderId } = this.state;

    if (headerFormDs.dirty || pcSubjectDs.dirty || pcStageDs.dirty || partnerDs.dirty) {
      notification.warning({
        message: intl
          .get('spcm.common.view.message.aiApproveNeedSavePageData')
          .d('操作失败，存在未保存的数据，请保存数据后重新点击智能预审'),
      });
      return;
    }
    // 执行审查
    const payload = {
      headerDataId: pcHeaderId,
      workbenchFlag: '1',
    };
    this.setState({ conSaveLoading: true });
    executeAiApprove(payload)
      .then((res) => {
        if (getResponse(res)) {
          this.setState({ disableAiApproveBtn: true, resultStatus: 'APPROVING' });
          this.rollingFetchAiResult();
        } else {
          this.setState({ disableAiApproveBtn: false });
        }
      })
      .finally(() => {
        this.setState({ conSaveLoading: false });
      });
  }

  // 轮询查询ai预审结果
  @Bind()
  rollingFetchAiResult() {
    this.clearAIResultTimer();
    this.aiResultTimer = setInterval(() => {
      this.fetchAiApproveResult();
    }, 10000);
  }

  // 清空定时器
  @Bind()
  clearAIResultTimer() {
    if (this.aiResultTimer) {
      clearInterval(this.aiResultTimer);
      this.aiResultTimer = null;
    }
  }

  // 查询ai预审结果
  @Bind()
  fetchAiApproveResult(initQueryFlag = false) {
    const { pcHeaderId } = this.state;
    const payload = {
      headerDataId: pcHeaderId,
    };
    queryAiApproveResult(payload).then((res) => {
      if (getResponse(res)) {
        const { result: resultStatus, aiApproveResultQueryDTOList } = res;
        let disableAiApproveBtn = true;
        // 进行中，还需要继续等待结果， 其它状态表示已经拿到结果
        if (!resultStatus || (resultStatus && resultStatus !== 'APPROVING')) {
          this.clearAIResultTimer();
          disableAiApproveBtn = false;
        }
        this.setState({
          disableAiApproveBtn,
          aiApproveReslultParams: aiApproveResultQueryDTOList,
          resultStatus,
        });
        // 页面初始化查询，并且resultStatus是审核中就继续轮询查询
        if(initQueryFlag && resultStatus === "APPROVING"){
          this.rollingFetchAiResult();
        }
      } else {
        // 后端接口报错也清空定时器
        this.clearAIResultTimer();
      }
    });
  }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段
   */
  @Bind()
  @Debounce(500)
  async getTextPreViewUrl() {
    const _this = this;
    // const { isTextMode } = this.state;
    const isTextMode = this.getTextModeFlag();
    const { dispatch, pcHeaderId } = this.props;
    _this.setState({ conSaveLoading: true }, async () => {
      const isValid = await _this.handleContractValidate();
      if (!isValid) {
        _this.setState({ conSaveLoading: false });
        return;
      }
      const payload = await _this.handleContractDataMerge();
      const type = await fetchContractOnlineHTMLType();

      // 文本模式，手动保存编辑文档
      if (isTextMode && this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        const res = await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
        if (!res) {
          // 保存成功
          _this.setState({ conSaveLoading: false });
          return false;
        }
      }

      if (type?.includes('new_wps')) {
        // type为new_wps/new_wps_V7时，使用新版WPS预览
        fetchWpsV5TextPreView(payload)
          .then((url) => {
            if (getResponse(url)) {
              previewContractByWindow(
                {
                  processed: true,
                  url,
                  version: type === 'new_wps_V7' ? 'V7' : 'V5',
                  componentType: type === 'new_wps_V7' ? 'new_wps' : type,
                },
                pcHeaderId
              );
            }
          })
          .finally(() => {
            _this.setState({ conSaveLoading: false });
          });
        return false;
      }

      dispatch({
        type: 'editorOnline/fetchTextPreView',
        payload,
      })
        .then((url) => {
          this.setState({
            conSaveLoading: false,
          });
          const hasFailed = url && url.includes('failed'); // 是否接口报错
          if (typeof url === 'string' && url !== '' && !hasFailed) {
            const tenantId = getCurrentOrganizationId();
            const editor = type?.includes('new_wps') ? 'WPS' : 'ONLYOFFICE';
            window.open(
              `${HZERO_FILE}/v1/${tenantId}/file/preview?url=${encodeURIComponent(
                url
              )}&editor=${editor}&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}#toolbar=0`
            );
          } else if (hasFailed) {
            const errorObj = JSON.parse(url);
            notification.error({
              message: errorObj.message,
            });
          } else {
            notification.warning({
              message: intl.get('spcm.common.view.button.getPreViewUrlError').d('Url获取失败！'),
            });
          }
        })
        .catch(() => {
          this.setState({
            conSaveLoading: false,
          });
        });
      // partnerDataSource.forEach((i) => i.$form.resetFields());
      // pcStageDataSource.forEach((i) => i.$form && i.$form.resetFields()); // 此处需要判断一下，由于页面初始化时协议阶段行默认不渲染，以至于没有$form属性

      // dispatch({
      //   type: 'contractCommon/updateState',
      //   payload: {
      //     formChanged: false,
      //   },
      // });
    });
  }

  /**
   * 变更
   */
  @Bind()
  async onContractChange() {
    const { headerInfo } = this.state;
    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }
    const _this = this;
    const onOk = (otherParams) => {
      _this.setState({ conChangeLoading: true });
      _this.handleContractChange(otherParams);
    };
    const { remoteWorkDetail } = this.props;
    let res = {};
    if (remoteWorkDetail?.process) {
      res = await remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_BEFORE_CHANGE', res, {
        onOk,
        current: _this,
      });
      console.log('res', res);
      if (!res) {
        return;
      }
    }

    ModalPro.confirm({
      key: ModalPro.key(),
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl.get(`spcm.contractChange.title.sureChange`).d('确认变更'),
      onOk: throttle(() => onOk(res), 1500, {
        leading: true,
        trailing: false,
      }),
    });
  }

  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  async onPreSubmit() {
    const { partnerDataSource, partnerDs, headerFormDs, pcSubjectDs } = this.state;
    const { remoteWorkDetail } = this.props;
    const isValid = await this.handleContractValidate(true);
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxSubmit', {
        headerFormDs,
        pcSubjectDs,
        current: this,
      });
      if (!res) {
        return;
      }
    }
    if (partnerDataSource.length > 0 && isValid) {
      if (!this.attachmentRequiredCheck()) {
        return;
      }
      const children = intl
        .get(`spcm.common.view.message.msg.sureSubmit`)
        .d('确定要提交该协议吗？');
      const cuxConfirmChildren = remoteWorkDetail
        ? await remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_PROCESS_SUBMIT_CONFIRM', children, {
            current: this,
          })
        : children;
      ModalPro.confirm({
        key: ModalPro.key(),
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: cuxConfirmChildren,
        onOk: () => {
          if (remoteWorkDetail?.event) {
            remoteWorkDetail.event.fireEvent('submitBeforeValidate', {
              headerFormDs,
              handleUpdateContract: this.handleUpdateContract,
            });
          } else {
            this.handleUpdateContract({}, 0, 'isSubmit');
          }
        },
      });
    } else {
      // 切换到单据模式提示数据校验失败
      const noDocMode = this.getTextModeFlag();
      if (noDocMode) {
        this.handleSetSwitchTabKey('DOC', () => {
          // 切换完成后，重新触发校验，定位到错误位置
          this.handleContractValidate(true);
        });
      }
      partnerDs.setState(
        'validState',
        headerFormDs.get('acceptType') === 'target' && headerFormDs.get('pcHeaderId')
      );
    }
  }

  /**
   * 保存
   */
  @Bind()
  async onSave() {
    const { remoteWorkDetail, location } = this.props;
    const { headerFormDs } = this.state;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxSaveValidate', {
        headerFormDs,
        location,
        handleUpdateContract: this.handleUpdateContract,
        current: this,
      });
      if (!res) {
        return;
      }
    }
    this.handleUpdateContract({}, 0);
  }

  /**
   * submit - 协议提交
   */
  @Bind()
  onSubmit() {
    const { dispatch, pcHeaderId, remoteWorkDetail } = this.props;
    const { headerInfo } = this.state;
    const { reviewTemplateId, showAttachmentFlag } = headerInfo || {};
    this.fetchHeader().then(async (result) => {
      const isValid = await this.handleContractValidate();
      const payload = {
        pcHeaderList: [{ pcHeaderId, tenantId: getUserOrganizationId(), workbenchFlag: '1' }],
        customizeUnitCode,
      };
      if (isValid && this.attachmentRequiredCheck()) {
        if (reviewTemplateId && Number(showAttachmentFlag) !== 1) {
          // this.openReviewConfirmModal();
          // 跳转到审查页面前预校验提交
          const res = await preSmartSubmitValid(payload);
          if (getResponse(res)) {
            const smartReviewFlag = await this.handleSmartReview('SUBMIT_REVIEW');
            if (!smartReviewFlag) {
              return false;
            }
          } else {
            return this.refreshData();
          }
        }
        dispatch({
          type: 'contractMaintain/submit',
          payload,
        })
          .then(async (res) => {
            if (remoteWorkDetail?.event) {
              const submitAfterRes = await remoteWorkDetail.event.fireEvent(
                'handleCuxSubmitAfter',
                {
                  current: this,
                  res,
                }
              );
              if (!submitAfterRes) {
                return false;
              }
            }
            if (res) {
              notification.success();
              this.props.history.push('/spcm/contract-workspace/list');
            } else {
              this.fetchHeader().then((result) => {
                this.offDTOs();
                this.fetchList(result);
              });
            }
          })
          .catch(() => {
            this.fetchHeader().then((result) => {
              this.offDTOs();
              this.fetchList(result);
            });
          })
          .finally(() => {
            this.setState({ conSaveLoading: false });
          });
      } else {
        this.offDTOs();
        this.fetchList(result);
      }
    });
  }

  /**
   * 合同审查确认弹窗
   */
  // @Bind()
  // openReviewConfirmModal() {
  //   ModalPro.confirm({
  //     key: ModalPro.key(),
  //     title: intl.get('hzero.common.message.confirm.title').d('提示'),
  //     children: intl
  //       .get('spcm.common.view.message.needReviewToSubmitMsg')
  //       .d('该合同需要进行审查后再提交，请进入智能审查页面进行提交。'),
  //     okText: intl.get('spcm.workspace.view.button.smartReview').d('智能审查'),
  //     onOk: () => {
  //       if (isFunction(this.handleSmartReview)) {
  //         this.handleSmartReview();
  //       }
  //     },
  //     onCancel: () => {
  //       this.setState({ conSaveLoading: false });
  //       this.refreshData();
  //     },
  //   });
  // }

  pcSourceKeyFlag = () => {
    const {
      headerInfo: { pcSourceCode },
    } = this.state;
    // 直接进入 协议拟制详情页 或 引用寻源单据保存后，isQuoteSource 丢失时
    if (['SEARCH_SOURCE_RESULT', '寻源结果'].includes(pcSourceCode)) {
      return 'quoteSource';
    } else if (['PURCHASE_NEED', '采购申请'].includes(pcSourceCode)) {
      return 'quotePurchase';
    }
    return 'quoteOrder';
  };

  /**
   * pcHeaderElectronicSignatureAttachment
   * @param {*} pcHeaderElectronicSignatureAttachment
   */
  @Bind()
  handleSaveElectricSignUuid(pcHeaderElectronicSignatureAttachment) {
    const { dispatch } = this.props;
    const { headerInfo, editable, headerFormDs } = this.state;
    if (!headerInfo.pcHeaderElectronicSignatureAttachment && editable) {
      dispatch({
        type: 'contractMaintain/add',
        payload: {
          ...headerInfo,
          pcHeaderElectronicSignatureAttachment,
        },
      }).then((res) => {
        if (getResponse(res)) {
          headerFormDs.current.init({
            pcHeaderElectronicSignatureAttachment: res.pcHeaderElectronicSignatureAttachment,
            objectVersionNumber: res.objectVersionNumber,
          });
          this.setState({
            headerInfo: {
              ...headerInfo,
              ...res,
            },
          });
        }
      });
    }
  }

  /**
   * fetchHeaderAfterOperation
   */
  @Bind()
  async fetchHeaderAfterOperation() {
    const headerData = await this.fetchHeader();
    const {
      headerInfo: { version, objectVersionNumber },
    } = this.state;
    // 没必要频繁更新协议头
    if (headerData.version !== version || headerData.objectVersionNumber !== objectVersionNumber) {
      this.setState({ headerInfo: headerData });
    }
  }

  /**
   * 下载签章合同
   */
  @Bind()
  downloadSignContract() {
    const {
      headerInfo: { contractFileUrl },
    } = this.state;
    if (contractFileUrl) {
      const organizationId = getCurrentOrganizationId();
      const api = `${HZERO_FILE}/v1/${organizationId}
      /files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
      downloadFile({
        requestUrl: api,
        queryParams: [
          { name: 'bucketName', value: PRIVATE_BUCKET },
          { name: 'url', value: contractFileUrl },
        ],
      }).then((res) => {
        console.log('res=', res);
      });
    }
  }

  @Bind()
  handleBreakOffContract() {
    const { headerInfo } = this.state;
    const { dispatch } = this.props;
    ModalPro.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl.get(`spcm.common.view.message.title.breakOffContract`).d('确认发起解约吗？'),
      onOk: async () => {
        const res = await breakOffContract(headerInfo);
        if (getResponse(res)) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/spcm/contract-workspace/list`,
            })
          );
        }
      },
    });
  }

  /**
   * 审批
   */
  @Bind()
  handleApprove = async () => {
    const { approvalByBusKey } = this.state;
    const { dispatch } = this.props;
    const { taskId, processInstanceId } = approvalByBusKey;
    if (taskId && processInstanceId) {
      openApproveModal({
        taskId,
        processInstanceId,
        closable: true,
        onSuccess: () => {
          dispatch(
            routerRedux.push({
              pathname: `/spcm/contract-workspace/list`,
            })
          );
        },
      });
    }
  };

  @Bind()
  async handleHistoryCompare() {
    const { headerInfo } = this.state;
    const { remoteWorkDetail } = this.props;
    const { supplementFlag } = headerInfo;
    if (remoteWorkDetail?.event) {
      const historyCompareFlag = await remoteWorkDetail.event.fireEvent('handleCuxHistoryCompare', {
        current: this,
      });
      if (!historyCompareFlag) {
        return false;
      }
    }
    if (supplementFlag) {
      this.setState({
        historyCompareFlag: !this.state.historyCompareFlag,
      });
    } else {
      showHisCompareModal(this.props, headerInfo);
    }
  }

  /**
   * 撤销审批
   */
  @Bind()
  handleRevoke() {
    const { headerInfo } = this.state;
    const { dispatch } = this.props;
    ModalPro.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`spcm.common.view.message.note.revokeApprove`)
        .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
      onOk: async () => {
        const res = await revokeWorkflow({ pcHeaderId: headerInfo.pcHeaderId });
        if (getResponse(res)) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/spcm/contract-workspace/list`,
            })
          );
        }
      },
    });
  }

  // 归档
  @Bind()
  archiveModel(records) {
    const { remoteWorkDetail } = this.props;
    const fileModalDS = () => ({
      fields: [
        {
          name: 'pcNum',
          type: 'string',
          label: intl.get(`spcm.common.model.common.pcNum`).d('协议编号'),
        },
        {
          name: 'pcName',
          type: 'string',
          label: intl.get(`spcm.common.model.common.pcName`).d('协议名称'),
        },
        {
          name: 'createByRealName',
          type: 'string',
          label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
        },
        {
          name: 'archiveCode',
          type: 'string',
          label: intl.get(`spcm.common.archiveCode`).d('归档码'),
          maxLength: 32,
        },
        {
          name: 'archiveAttachmentUuid',
          type: 'attachment',
          label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
        },
      ],
    });
    const archiveDS = new DataSet(fileModalDS());
    archiveDS.create(records);
    ModalPro.open({
      drawer: true,
      title: intl.get(`spcm.common.view.button.file`).d('填写归档编码'),
      children: <FileModal remote={remoteWorkDetail} ds={archiveDS} />,
      style: {
        width: '380px',
      },
      onOk: async () => {
        const status = await archiveDS.validate();
        if (!status) return false;
        if (remoteWorkDetail?.event) {
          const preArchiveRes = await remoteWorkDetail.event.fireEvent('handleCuxPreArchive', {
            archiveDS,
            records,
            eventProps: this.props,
          });
          if (!preArchiveRes) {
            return false;
          }
        }
        const res = await archiveContract(archiveDS.toData()[0]);
        if (getResponse(res)) {
          if (res) {
            notification.success();
            if (remoteWorkDetail?.event) {
              remoteWorkDetail.event.fireEvent('handleCuxArchive', {
                archiveDS,
                records,
                eventProps: this.props,
              });
            }
            this.props.history.push('/spcm/contract-workspace/list');
          }
        } else {
          return false;
        }
      },
      afterClose: () => {
        archiveDS.reset();
      },
    });
  }

  /**
   * 同步附件
   */
  @Bind()
  downloadSyncContract(pcHeaderId) {
    const {
      headerInfo: { contractFileUrl },
    } = this.state;
    syncAttachment({ pcHeaderId }).then((res) => {
      if (res) {
        if (contractFileUrl) {
          const organizationId = getCurrentOrganizationId();
          const api = `${HZERO_FILE}/v1/${organizationId}
          /files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
          downloadFile({
            requestUrl: api,
            queryParams: [
              { name: 'bucketName', value: PRIVATE_BUCKET },
              { name: 'url', value: contractFileUrl },
            ],
          });
        }
      }
    });
  }

  /**
   * 引用协议模板刷新在线编辑中的模板文件内容
   */
  @Bind()
  refreshTemplate() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/fetchTemplateRefresh',
      payload: {
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.fetchHeaderAfterOperation();
        notification.success();
      }
    });
  }

  /**
   * 补充协议跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch, location: { pathname } = {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-workspace/view/${pcHeaderId}`,
        state: {
          supBackPath: `${pathname}`,
        },
      })
    );
  }

  /**
   * 改变模态框显示状态
   * @param {String} modalVisible 字段
   * @param {Boolean} flag 值
   * @param {Object} [otherParams={}] 其他参数
   */
  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * handleClickSeal 点击用章 非手机验证签章
   */
  @Bind()
  handleClickSeal() {
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      sealType,
      selectPic,
      headerInfo: { mobileVerifyFlag, supplierCompanyId, companyId, silentSealFlag },
      headerInfo,
    } = this.state;
    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }
    // 由于调用的接口不一样，会出现问题
    if (mobileVerifyFlag && sealType === 'ESIGN') {
      dispatch({
        type: 'contractCommon/fetchVerifyPhoneNum',
        payload: {
          authType: sealType,
          companyId,
          supplierCompanyId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            mobileModalVisible: true,
            verifyPhoneNum: res.phone,
          });
          this.fetchHeader();
        }
      });
    } else {
      dispatch({
        type: 'contractChapter/confirmChapter',
        payload: {
          pcHeaderId,
          sealPictureUrl: selectPic?.sealPictureUrl,
          sealId: selectPic?.sealId,
          signatureId: selectPic?.signatureId,
          companyId,
          authType: sealType,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          if (res.sealLink || silentSealFlag === '1') {
            // 静默签:silentSealFlag === "1" 回到列表页
            if (res.sealLink) {
              window.open(res.sealLink);
            }
            this.setState({ statementVisible: false });
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-workspace/list`,
              })
            );
          } else {
            this.setState({ chapterFlag: false });
            this.fetchHeader().then((result) => {
              this.setState({
                headerInfo: result,
              });
            });
            setTimeout(() => {
              this.editorOnlineRef.fetchEditorOnlineHTML();
            }, 0);
          }
        }
      });
    }
  }

  /**
   * 跳转到印章管理
   */
  @Bind()
  skipToSealManage() {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
    });
  }

  /**
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picDataSource } = this.state;
    this.setState({
      focusStatus: focusStatus === index + 1 ? '' : index + 1,
      selectPic: picDataSource[index],
    });
  }

  /**
   * 退回弹框
   */
  @Bind()
  handleControlModal(rollBackType) {
    const { headerInfo } = this.state;
    const notAllowedFlag = checkOrderSignContract(headerInfo);
    if (notAllowedFlag) {
      return;
    }
    const rollBackDs = () => ({
      fields: [
        {
          name: 'backReason',
          type: 'string',
          label: intl.get('spcm.purchaseContractView.pb.returnCause').d('退回原因'),
        },
      ],
    });
    const RollBackDs = new DataSet(rollBackDs());
    ModalPro.open({
      drawer: true,
      title: intl.get('hzero.common.button.rollback').d('退回'),
      children: <RollBackModal ds={RollBackDs} />,
      style: {
        width: 380,
      },
      onOk: async () => {
        const { history } = this.props;
        const { pcHeaderId } = this.state;
        const pcHeaderIds = [pcHeaderId];
        if (rollBackType === 'supplier') {
          rollbackToSupplier({
            pcHeaderIds,
            backReason: RollBackDs.toData()[0]?.backReason,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push('/spcm/contract-workspace/list');
            }
          });
        } else {
          rollbackContract({
            pcHeaderIds,
            backReason: RollBackDs.toData()[0]?.backReason,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push('/spcm/contract-workspace/list');
            }
          });
        }
      },
    });
  }

  /**
   * 获取手机验证码
   */
  @Bind()
  getVerifyCode() {
    const { dispatch } = this.props;
    const { headerInfo, pcHeaderId } = this.state;
    const { certificateResId, companyId } = headerInfo;
    const mobile = this.modalForm.getFieldValue('mobile');
    this.modalForm.validateFields(['mobile'], (err) => {
      if (!err) {
        dispatch({
          type: 'contractChapter/getVerifyCode',
          payload: {
            companyId,
            mobile,
            certificateResId,
            pcHeaderId,
          },
        });
      }
    });
  }

  /**
   * 审批通过
   */
  @Bind()
  approve() {
    // const {
    //   dispatch,
    //   form: { getFieldValue },
    // } = this.props;
    // const { headerInfo = {} } = this.state;
    // const approvedRemark = getFieldValue('approvedRemark');
    // const { pcHeaderIdSet, ...otherHeaderInfo } = headerInfo;
    // dispatch({
    //   type: 'contractApproval/approveList',
    //   payload: {
    //     pcHeaderList: [otherHeaderInfo],
    //     approvedRemark,
    //   },
    // }).then((res) => {
    //   if (res) {
    //     notification.success();
    //     this.props.history.push('/spcm/contract-workspace/list');
    //   } else {
    //     this.fetchHeader();
    //     this.fetchList();
    //   }
    // });
  }

  /**
   * 关闭手机验证modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      mobileModalVisible: false,
    });
    this.modalForm.resetFields();
  }

  /**
   * 审批拒绝
   */
  @Bind()
  preReject() {
    // const {
    //   form: { validateFieldsAndScroll },
    // } = this.props;
    // Modal.confirm({
    //   title: intl.get('spcm.contractApproval.view.message.preReject').d(`确定审批拒绝吗？`),
    //   onOk: () => {
    //     this.setState(
    //       {
    //         requireApprovedRemark: true,
    //       },
    //       () => this.reject()
    //     );
    //   },
    //   onCancel: () =>
    //     this.setState({ requireApprovedRemark: false }, () =>
    //       validateFieldsAndScroll({ force: true })
    //     ),
    // });
  }

  /**
   * 确认手机验证并签章
   */
  @Bind()
  handleOk(values = {}) {
    const { dispatch } = this.props;
    const {
      selectPic,
      // companyId,
      headerInfo,
      pcHeaderId,
      sealType,
    } = this.state;
    const { certificateResId, companyId } = headerInfo;
    if (!isEmpty(values)) {
      dispatch({
        type: 'contractChapter/confirmMobileChapter',
        payload: {
          pcHeaderId,
          companyId,
          sealPictureUrl: selectPic?.sealPictureUrl,
          sealId: selectPic?.sealId,
          signatureId: selectPic?.signatureId,
          authType: sealType,
          certificateResId,
          ...values,
        },
      }).then((res) => {
        if (res) {
          this.handleCloseModal();
          this.handleMobileRefresh(res);
        }
      });
    }
  }

  @Bind()
  handleMobileRefresh(res) {
    const { headerInfo: { silentSealFlag } = {} } = this.state;
    notification.success();
    // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
    if (res.sealLink || silentSealFlag === '1') {
      // 静默签:silentSealFlag === "1" 回到列表页
      if (res.sealLink) {
        window.open(res.sealLink);
      }
      this.props.dispatch(
        routerRedux.push({
          pathname: `/spcm/contract-workspace/list`,
        })
      );
    } else {
      this.setState({ chapterFlag: false });
      this.fetchHeader();
      setTimeout(() => {
        if (this?.editorOnlineRef?.fetchEditorOnlineHTML) {
          // eslint-disable-next-line no-unused-expressions
          this.editorOnlineRef?.fetchEditorOnlineHTML();
        }
      }, 0);
    }
  }

  // -----处理在线编辑课题相关方法----
  // 观察wps文档状态，确认是否能够继续编辑
  @Bind()
  async observeWpsStatus() {
    // 查询定时器设置时间
    const data = await queryIdpValue('SPCM.ONLINEEDIT_TIMER');
    const { meaning: shareEditTime = 60 } =
      (data || []).find((item) => item.value === 'SHARE_EDIT_TIMER') || {};
    this.shareEditTimer = setInterval(() => {
      this.showBackModal();
    }, shareEditTime * 10 || 60 * 1000);
  }

  @Bind()
  clearShareEditTimer() {
    if (this.shareEditTimer) {
      clearInterval(this.shareEditTimer);
    }
  }

  @Bind()
  async showBackModal() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    const response = await queryPreTextFlag({ pcHeaderId });
    const currentUserId = getCurrentUserId();
    const res = getResponse(response);
    if (res) {
      const { pcHeaderWorkbenchPreTextFlag = null, createByRealName, lastUpdatedBy } = res;
      // 没有权限
      if (pcHeaderWorkbenchPreTextFlag === '1') {
        this.clearShareEditTimer();
        // 修改人为当前操作人，不处理
        if (currentUserId === lastUpdatedBy) {
          return;
        }
        ModalPro.confirm({
          key: ModalPro.key(),
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <span
              style={{ fontSize: '12px', color: '#1d2129', lineHeight: '18px', fontWeight: 400 }}
            >
              {`${createByRealName || ''}${intl
                .get('spcm.workspace.view.message.title.noEditPermission')
                .d('已收回您的协同编辑权限，即将退出该界面')}
              `}
            </span>
          ),
          okCancel: false,
          onOk: () => {
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-workspace/list`,
              })
            );
          },
        });
      }
    }
  }

  @Bind()
  handleOpenShareMangement() {
    const { pcHeaderId } = this.state;
    openShareMangement(pcHeaderId);
  }

  // 文本创建
  @Bind()
  async handleOpenEditArea() {
    const { headerInfo = {} } = this.state;
    const { onlyEditReplaceWildcardBefore, remoteWorkDetail } = this.props;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxOpenEditArea', {
        current: this,
      });
      if (!res) {
        return;
      }
    }
    openEditArea({ headerInfo, onConfirm: this.refreshData, onlyEditReplaceWildcardBefore });
  }

  // 刷新单据数据
  @Bind()
  refreshData(callback) {
    this.setState({ queryListLoading: true });
    this.fetchHeader()
      .then((result) => {
        this.setState({
          headerInfo: result,
        });
        if (isFunction(callback)) {
          callback();
        }
        this.offDTOs();
        this.fetchList(result);
      })
      .finally(() => {
        this.setState({ queryListLoading: false });
      });
  }

  @Bind()
  handleGenreatorEditOnLineFunc(service, callback) {
    this.setState({ queryListLoading: true });
    service
      .then((response) => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          // 重新刷新共享状态
          this.fetchEditShare();
          this.refreshData(callback);
        } else {
          // 数据保存过，刷新获取最新数据
          this.refreshData();
        }
      })
      .catch(() => {
        this.setState({
          conSaveLoading: false,
          queryListLoading: false,
        });
      });
  }

  // 确定 生成预文本
  @Bind()
  handleGeneratorPreFileOk() {
    const { pcHeaderId } = this.props;
    const service = generatorPreFile({
      pcHeaderId,
      customizeUnitCode,
    });
    const callback = () => {
      this.handleSetSwitchTabKey('TEXT'); // 生成预文本跳转至文本模式
      // this.setState({
      //   switchTabKey: 'TEXT',
      // });
    };
    this.handleGenreatorEditOnLineFunc(service, callback);
  }

  /**
   *  生成预文本
   */
  @Bind()
  async handleGeneratorPreFile() {
    const { remoteWorkDetail } = this.props;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxGeneratorPreFile', {
        current: this,
        handleGeneratorPreFileOk: this.handleGeneratorPreFileOk,
      });
      if (!res) {
        return;
      }
    }
    ModalPro.confirm({
      key: ModalPro.key(),
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`spcm.common.view.message.msg.toGeneratePreFile.confirm`)
        .d('若生成预文本，则共享结束，收回被分享人的协同编辑权限，是否继续？'),
      onOk: this.handleGeneratorPreFileOk,
      onCancel: () => this.refreshData(),
    });
  }

  // 确定退回至模板
  @Bind()
  handlePreTextBackOk(callback) {
    const { pcHeaderId } = this.props;
    const service = preTextBack({
      pcHeaderId,
    });
    this.handleGenreatorEditOnLineFunc(service, callback);
  }

  /**
   *  退回至模板
   */
  @Bind()
  async handlePreTextBack(callback) {
    const { remoteWorkDetail } = this.props;
    if (remoteWorkDetail?.event) {
      const res = await remoteWorkDetail.event.fireEvent('handleCuxPreTextBack', {
        current: this,
        handlePreTextBackOk: this.handlePreTextBackOk,
      });
      if (!res) {
        return;
      }
    }
    ModalPro.confirm({
      key: ModalPro.key(),
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('spcm.workspace.view.message.title.preTextBack')
        .d('若退回至协议模板阶段，需编辑模板后重新生成预文本，是否继续？'),
      onOk: () => this.handlePreTextBackOk(callback),
    });
  }

  /**
   *  更新当前协议共享状态信息
   */
  @Bind()
  handleUpdateEditShare(isFinish) {
    const service = updateEditShare([{ ...this.editShareInfo, isFinish }]);
    const callback = () => {
      this.fetchEditShare();
    };
    this.handleGenreatorEditOnLineFunc(service, callback);
  }

  /**
   * 查询当前协议共享状态信息
   */
  @Bind()
  fetchEditShare() {
    const { pcHeaderId } = this.state;
    queryEditShare({ pcHeaderId }).then((response) => {
      const res = getResponse(response);
      if (res) {
        const { isFinish, isShareContract = null } = res;
        this.editShareInfo = { ...res };
        this.setState({
          isShareContract,
          coordinatedFlag: isFinish,
        });
        // 共享状态,监听文档编辑状态
        if (!isNull(isShareContract) && !this.shareEditTimer) {
          this.observeWpsStatus();
        }
      }
    });
  }

  /**
   * 预览合同文本
   */
  @Bind()
  async previewContract() {
    const { pcHeaderId } = this.state;
    const isTextMode = this.getTextModeFlag();
    // 文本模式，手动保存编辑文档
    if (isTextMode && this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
      const res = await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
      if (!res) {
        return false;
      }
    }
    const res = await previewContractText({ pcHeaderId, menuCode: CONTRACT_WORKSPACE_MAINTAIN });
    previewContractByWindow(res, pcHeaderId);
  }

  /**
   * 渲染协同按钮
   */
  @Bind()
  renderCoordinateBtns(loading) {
    // 是否完成协同标识
    const { coordinatedFlag, coordinateable } = this.state;
    const { onlyEditReplaceWildcardBefore } = this.props;
    // 是否协同模式
    const coordinatedBtn = [
      {
        name: 'coordinateAgain',
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'playlist_add_check',
          color: coordinateable === '1' ? 'primary' : '',
          funcType: coordinateable === '1' ? 'raised' : 'flat',
          type: 'c7n-pro',
          onClick: () => this.handleUpdateEditShare('0'),
          loading,
        },
        child: intl.get('spcm.workspace.view.button.coordinateAgain').d('再次协同'),
      },
    ];
    const buttons = [
      {
        name: 'coordinateFulfil',
        btnType: 'c7n-pro',
        btnComp: PermissionButton,
        btnProps: {
          icon: 'playlist_add_check',
          color: 'primary',
          // funcType: 'flat',
          type: 'c7n-pro',
          onClick: () => this.handleUpdateEditShare('1'),
          loading,
        },
        child: intl.get('spcm.workspace.view.button.coordinateFulfil').d('完成协同'),
      },
      {
        name: 'previewContract',
        btnType: 'c7n-pro',
        hidden: onlyEditReplaceWildcardBefore !== '1',
        btnProps: {
          icon: 'preview',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 500,
          waitType: 'throttle',
          onClick: this.previewContract,
        },
        child: intl.get('spcm.workspace.view.button.previewContract').d('预览合同文本'),
      },
    ];
    return coordinatedFlag === '1' ? coordinatedBtn : buttons;
  }

  // -----处理文本编辑课题相关方法----
  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
    });
  }

  getSectionCode() {
    const {
      match: { path },
      location: { search },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (
      path.includes('/spcm/contract-workspace/update') ||
      routerParams.hasChanged === 'true' ||
      path.includes('/spcm/contract-workspace/intelligent/')
    ) {
      return editSection || {};
    } else {
      return readOnlySection || {};
    }
  }

  renderContractBusinessTerms(contractBusinessTermsListProps) {
    const { pcHeaderId, remoteWorkDetail } = this.props;
    const { pcKindAttachList } = this.state;
    const { pcKindCode } = this.state?.headerInfo || {};
    const businessTermsFlag = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_BUSINESSTERMSFLAG',
          pcHeaderId && !pcKindAttachList.includes(pcKindCode),
          {
            ...contractBusinessTermsListProps,
            pcHeaderId,
            pcKindCode,
          }
        )
      : pcHeaderId && !pcKindAttachList.includes(pcKindCode);
    return (
      businessTermsFlag && (
        <div className={styles['custom-page-content']}>
          <h3 id="spcm-detail-business-terms" className={styles['rfx-card-item-title']}>
            {intl
              .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
              .d('采购协议业务条款')}
          </h3>
          <ContractBusinessTerms {...contractBusinessTermsListProps} />
        </div>
      )
    );
  }

  /**
   * 补充协议埋点
   * @returns
   */
  @Bind()
  renderContractReplenish(contractReplenishProps) {
    const { pcHeaderId, remoteWorkDetail } = this.props;
    const { headerInfo, editable, replenishDs } = this.state;
    const { supplementFlag } = headerInfo || {};
    const replenishFlag = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_REPLENISHFLAG',
          !editable && !supplementFlag,
          {
            ...contractReplenishProps,
            pcHeaderId,
            current: this,
          }
        )
      : !editable && !supplementFlag;
    return (
      replenishFlag && (
        <div className={styles['custom-page-content']}>
          <h3 id="spcm-detail-replenish" className={styles['rfx-card-item-title']}>
            {intl.get(`spcm.common.view.message.title.contractReplenishList`).d('补充协议列表')}
          </h3>
          {replenishDs && <ContractReplenish {...contractReplenishProps} />}
        </div>
      )
    );
  }

  /**
   * 返回路由
   * @returns string
   */
  @Bind()
  getBackPath() {
    const { remoteWorkDetail } = this.props;
    const { docLinkFlag, isPub, backVoidPage } = this.state;
    const { location: { state } = {} } = this.props;
    const backPath =
      isPub || Number(docLinkFlag) || backVoidPage === 'NO'
        ? null
        : state?.supBackPath || '/spcm/contract-workspace/list';

    return remoteWorkDetail?.process
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_BACK_PATH', backPath, {
          current: this,
        })
      : backPath;
  }

  /**
   * 标题显示
   * @returns element
   */
  @Bind()
  getHeaderTitle() {
    const { remoteWorkDetail } = this.props;
    const { editable, headerInfo, isPub } = this.state;

    const { smartTaskId } = headerInfo;
    const headerTitle = (
      <>
        <IMChatDraggable
          cardCode="CONTRACT_WORKSPACE_DETAIL"
          icon="baseline-drag_indicator"
          tooltip=""
          showDetail
          requestBody={() => headerInfo}
          dragText={`协议${headerInfo.pcNum || ''}`}
        >
          {editable
            ? intl.get('spcm.workspace.detail.editor.contreact').d('编辑协议')
            : intl.get('spcm.purchaseContractView.contractDetail').d('协议详情')}
        </IMChatDraggable>
        {renderSmartTips({ smartTaskId, isPub })}
      </>
    );
    return remoteWorkDetail?.render
      ? remoteWorkDetail.render('SPCM_WORKSPACE_DETAIL_HEADER_TITLE', headerTitle, {
          current: this,
        })
      : headerTitle;
  }

  permissions = [
    {
      name: 'change',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.ps.change',
    },
    {
      name: 'invalid',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.invalid.button',
    },
    {
      name: 'comfirmEffect',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.comfirm.effect',
    },
    {
      name: 'comfirmCancel',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.comfirm.cancel',
    },
    {
      name: 'terminate',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.stop.button',
    },
    {
      name: 'breakOff',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.terminate',
    },
    {
      name: 'chapter',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
    },
    {
      name: 'rollback',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.back.button',
    },
    {
      name: 'rollbackSupplier',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.back.supplier',
    },
    {
      name: 'submit',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.submit.button',
    },
    {
      name: 'delete',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button',
    },
    {
      name: 'editShare',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.share',
    },
    {
      name: 'textPreview',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.preview',
    },
    {
      name: 'archive',
      code: 'srm.pc-admin.pc-purchaser.workspace2.ps.archive.contract',
    },
    {
      name: 'textComparison',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.text.comparison',
    },
    {
      name: 'revokeApproval',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.revoke-approve',
    },
    {
      name: 'approval',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.approve',
    },
    {
      name: 'downloadSignContract',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.download.signing.contract',
    },
    {
      name: 'download',
      code: 'srm.pc-admin.pc-purchaser.view.ps.meyer.download.attachment',
    },
    {
      name: 'printDoc',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.ps.print',
    },
    {
      name: 'chatRoom',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.online.communication',
    },
  ];

  /**
   * 重新提取
   */
  @Bind()
  async reExtract(ds) {
    const validate = await ds.validate();
    if (!validate) {
      return false;
    }
    // 增加确认框
    ModalPro.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('spcm.common.view.message.reExtractTips')
        .d('重新提取后，提取的数据将会覆盖原数据，请谨慎操作。'),
      okText: intl.get('spcm.common.button.continue').d('继续'),
      onOk: async () => {
        this.setState({ conSaveLoading: true, reExtractBtnVisible: true });
        try {
          const res = await ds.submit();
          const { taskId } = res.content[0] || {};
          this.handleGoToExtractWait({ taskId });
        } catch (e) {
          this.setState({ conSaveLoading: false });
        }
      },
    });
  }

  /**
   * 重新提取按钮
   * @returns
   */
  @Bind()
  renderReExtract() {
    const {
      pcHeaderId,
      reExtractBtnVisible = true,
      conSaveLoading = false,
      headerInfo,
    } = this.state;
    const ds = new DataSet({
      fields: [
        {
          name: 'module',
          type: 'string',
          textField: 'meaning',
          lookupCode: 'SPCM_CONTRACT_BASIC_PART',
          multiple: true,
          required: true,
          defaultValue: ['pc-header', 'pc-partner', 'pc-subject', 'pc-stage'],
          disabled: true,
        },
      ],
      transport: {
        submit: ({ data }) => {
          return {
            url: `${SRM_SPCM}/v1/${organizationId}/smart-contract-task/fetch`,
            method: 'POST',
            data: data[0],
          };
        },
      },
    });
    ds.create({ pcHeaderId, fileUrl: headerInfo?.contractAttachmentUrl });
    return (
      <Dropdown
        hidden={reExtractBtnVisible}
        overlay={
          <div className={styles['extract-dropdown']}>
            <SelectBox dataSet={ds} vertical name="module" />
            <div>
              <Button
                size="small"
                wait={500}
                disabled={conSaveLoading}
                color="primary"
                onClick={() => this.reExtract(ds)}
              >
                {intl.get('hzero.common.button.confirm').d('确定')}
              </Button>
            </div>
          </div>
        }
        onHiddenBeforeChange={() => this.setState({ reExtractBtnVisible: !reExtractBtnVisible })}
      >
        <Button loading={conSaveLoading} type="c7n-pro" funcType="flat" icon="sync">
          {intl.get('spcm.common.button.reExtract').d('重新提取')}
          <Icon type="expand_more" style={{ fontSize: '0.14rem' }} />
        </Button>
      </Dropdown>
    );
  }

  @Bind()
  async replaceFile() {
    const { remoteWorkDetail } = this.props;
    const { pcHeaderId, headerInfo, refreshWpsFlag, switchTabKey } = this.state;
    const { smartTaskId, objectVersionNumber, pcStatusCode } = headerInfo || {};
    const defaultParams = {
      fileType: ['.doc', '.docx', '.pdf'],
    };
    const replaceFileParams = remoteWorkDetail?.process
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_REPLACEFILEPARAMS', defaultParams, {
          current: this,
        })
      : defaultParams;
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          label: intl.get('spcm.common.button.replaceFile').d('替换文件'),
          name: 'contractAttachmentUrl',
          type: 'string',
          required: true,
          bucketName: PRIVATE_BUCKET,
          help: intl
            .get('hzero.common.upload.error.type', {
              fileType: replaceFileParams?.fileType.join('、'),
            })
            .d('上传文件类型必须是.doc、.docx、.pdf'),
        },
      ],
      transport: {
        submit: ({ data }) => {
          const { contractAttachmentUrl } = data[0] || {};
          return {
            url: `${SRM_SPCM}/v1/${organizationId}/smart-contract-task/update/attachment`,
            method: 'POST',
            data: {
              pcHeaderId,
              smartTaskId,
              contractAttachmentUrl: contractAttachmentUrl?.[0],
              objectVersionNumber,
            },
          };
        },
      },
    });
    await ModalPro.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: (
        <div>
          <p>
            {intl
              .get('spcm.common.view.message.confirm.replaceFile')
              .d(
                '若替换文件，则共享结束，收回被分享人的协同编辑权限，替换后将刷新页面，未保存的内容存在丢失风险，是否继续？'
              )}
          </p>
          <UrlAttachment
            dataSet={ds}
            max={1}
            name="contractAttachmentUrl"
            labelLayout="float"
            accept={replaceFileParams?.fileType}
          />
        </div>
      ),
      onOk: async () => {
        const validate = await ds.validate();
        if (!validate) {
          return false;
        }
        try {
          this.setState({ conSaveLoading: true });
          ds.submit()
            .then((res) => {
              if (res) {
                // 刷新全部
                this.refreshData();
                // 文本模式拒绝状态的单据通过改变state来改变iframe实现刷新wps文件
                const isRejectEdit = ['SUPPLIER_REJECTED', 'REJECTED'].includes(pcStatusCode);
                if (switchTabKey === 'TEXT' && isRejectEdit) {
                  this.setState({
                    refreshWpsFlag: !refreshWpsFlag,
                  });
                }
                const notDocMode = this.getTextModeFlag();
                if (
                  notDocMode &&
                  this.editorOnlineRef &&
                  isFunction(this.editorOnlineRef.initFetch)
                ) {
                  this.editorOnlineRef.initFetch();
                }
              }
            })
            .finally(() => this.setState({ conSaveLoading: false }));
        } catch (e) {
          // console.log(e);
        }
      },
    });
  }

  // 处理保存和合同审查
  @Bind()
  handleSaveAndSmartReview({ triggerType } = {}) {
    // 非附件合同校验
    const { enableEditShare } = this.props;
    const { headerInfo, pcKindAttachList } = this.state;
    const { pcHeaderWorkbenchPreTextFlag, pcKindCode } = headerInfo || {};
    const errorFlag =
      Number(enableEditShare) === 1 &&
      !pcKindAttachList.includes(pcKindCode) &&
      Number(pcHeaderWorkbenchPreTextFlag) !== 1;
    if (errorFlag) {
      notification.error({
        description: intl
          .get('spcm.workspace.view.message.reviewCheckNotAttachment')
          .d('请在生成预文本后进行合同审查。'),
      });
      return;
    }
    // 保存数据
    this.handleUpdateContract({}, 0, triggerType || 'MANUAL_REVIEW');
  }

  /**
   * 查看审查结果
   */
  @Bind()
  handleViewSmartReview() {
    const { switchTabKey } = this.state;
    if (switchTabKey === 'SPLIT') {
      this.setState({ switchTabKey: 'DOC', hiddenReviewResultFlag: false });
    } else {
      this.setState({ hiddenReviewResultFlag: false });
    }
  }

  /**
   * 生成合同文本
   */
  @Bind()
  async handleContractTextGen(updateContractParams) {
    const { pcHeaderId } = this.state;
    this.setState({
      conSaveLoading: true,
    });
    try {
      const res = await contractTextGen(updateContractParams);
      previewContractByWindow(res, pcHeaderId);
      this.refreshData();
      return res;
    } catch (e) {
      this.setState({
        conSaveLoading: false,
        queryListLoading: false,
      });
    }
  }

  /**
   * 处理合同审查
   */
  @Bind()
  async handleSmartReview(triggerType) {
    const { headerInfo } = this.state;
    this.setState({
      conSaveLoading: true,
    });
    // 处理合同审查类型分类
    const res = await handleContractReviewType({
      triggerType,
      headerInfo,
      handleGoToSmartReview: (smartReviewParams) =>
        this.handleGoToSmartReview({ triggerType, ...smartReviewParams }),
      refreshData: this.refreshData,
    });
    this.setState({
      conSaveLoading: !!res,
    });
    return res;
  }

  // 跳转智能审查
  @Bind()
  handleGoToSmartReview(params) {
    const { location: { pathname } = {}, dispatch } = this.props;
    const { pcHeaderId, itemKey } = this.state;
    const pathList = pathname?.split('/');
    const pathParam = pathList ? pathList[pathList.length - 2] : '';
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-workspace/review-wait/${pcHeaderId}`,
        search: querystring.stringify(
          filterNullValueObject({
            pathParam,
            from: itemKey ? 'purchaseContract' : '',
            itemKey,
            ...params,
          })
        ),
      })
    );
  }

  // 跳转智能提取等待页
  @Bind()
  handleGoToExtractWait({ taskId }) {
    const { location: { pathname } = {}, dispatch } = this.props;
    const { pcHeaderId } = this.state;
    const pathList = pathname?.split('/');
    const pathParam = pathList ? pathList[pathList.length - 2] : '';
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-workspace/extract-wait/${pcHeaderId}`,
        search: querystring.stringify(
          filterNullValueObject({
            pathParam,
            smartTaskId: taskId,
          })
        ),
      })
    );
  }

  /**
   * 按钮
   * @returns array 按钮组
   */
  @Bind()
  renderBtns() {
    const {
      isChapter,
      isView,
      isApproval,
      mobileChapterLoading,
      chapterLoading,
      menuLeafNode,
      enableEditShare,
      onlyEditReplaceWildcardBefore,
      sealType,
      remoteWorkDetail,
      intelligent,
      showTextMode,
      attachmentSupportUpload,
    } = this.props;
    const {
      pcHeaderId,
      editable,
      coordinateable,
      coordinatedFlag,
      isShareContract,
      headerInfo,
      textComparisonVisible,
      templateListFlag,
      conChangeLoading,
      conSaveLoading,
      isPub,
      historyCompareFlag,
      picDataSource,
      focusStatus,
      chapterFlag,
      queryListLoading,
      rollbackPermission,
      pcKindAttachList,
      docLinkFlag,
      backVoidPage,
      revokeByBusKeyFlag,
      approvalByBusKey,
      headerFormDs,
      // switchTabKey,
      enableSmartContract,
      disableAiApproveBtn,
    } = this.state;
    const {
      pcKindCode,
      editStep,
      pcStatusCode,
      attachmentUuid,
      supplementFlag,
      signatureType,
      electricSignFlag,
      contractFileUrl,
      authType,
      terminateSignStatus,
      electronicSignatureAttachmentDisplayFlag,
      pcHeaderWorkbenchPreTextFlag = null, // 是否预文本阶段
      pcHeaderBackContractCompareFlag = null, // 文本创建模式
      invalidAllowChangeFlag,
      isExistsSupplementFlag,
      version,
      companyId,
      supplierCompanyId,
      reviewTemplateId,
      showAttachmentFlag,
      checkDuplicationFlag,
      pcAttachmentTemplateId,
      templateUrlBeforeWildcardReplace,
    } = headerInfo;

    const sealModalProps = {
      sealType,
      headerInfo,
      picDataSource,
      chapterLoading,
      focusStatus,
      chapterFlag,
      menuLeafNode,
      refreshHeader: this.fetchHeaderAfterOperation,
      handleMobileRefresh: this.handleMobileRefresh,
    };

    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        electricSignFlag === 1 &&
        allSignList.includes(authType)) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章
    const isTextSignFlag =
      signatureType === 'TEXT_SIGNATURE' &&
      electricSignFlag === 1 &&
      pcKindAttachList.includes(pcKindCode) &&
      !showTextMode; // 不在智能合同提取且不在附件合同在线编辑配置表
    const rollbackSupplier = (
      <Menu>
        <Menu.Item>
          <a onClick={() => this.handleControlModal('purchaser')}>
            {intl.get('spcm.common.button.rollback.purchaser').d('退回至采购方拟制')}
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={() => this.handleControlModal('supplier')}>
            {intl.get('spcm.common.button.rollback.supplier').d('退回至供应商签署')}
          </a>
        </Menu.Item>
      </Menu>
    );

    const hasGetUuid = !templateListFlag && !attachmentUuid;

    const defaultLoading = conSaveLoading || conChangeLoading;
    const defaultDisable = conSaveLoading || conChangeLoading || queryListLoading || hasGetUuid;

    const isShowChange = ['EFFECTED', 'PUBLISHED', 'ARCHIVE'];
    // 文本编辑相关按钮是否展示
    const enableEditShareFlag = !pcKindAttachList.includes(pcKindCode) && enableEditShare === '1';
    const isShowEditOnlineBtns = editable && enableEditShareFlag;
    // 是否是共享模式，分2种情况
    // 1.协同按钮进入  2.编辑按钮进入
    const isCoordinateMode = !isNull(isShareContract);
    // 已失效且invalidAllowChangeFlag=1允许变更
    const isExpiredChange = pcStatusCode === 'EXPIRED' && !!invalidAllowChangeFlag;

    // 是否是驳回拟制
    const isRejectEdit = ['SUPPLIER_REJECTED', 'REJECTED'].includes(pcStatusCode);

    const buttons = [
      isView &&
        !isPub &&
        (isShowChange.includes(pcStatusCode) ||
          isExpiredChange ||
          (pcStatusCode === 'CONFIRMED' && headerInfo.electricSignFlag === 0)) && {
          name: 'change',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            color: isView ? null : 'primary',
            onClick: this.onContractChange,
            loading: conChangeLoading,
            icon: 'mode_edit',
            type: 'c7n-pro',
          },
          child: intl.get(`spcm.contractChange.view.button.change`).d('变更'),
        },
      isView &&
        !isPub &&
        ['TO_BE_VALID'].includes(pcStatusCode) && {
          name: 'comfirmEffect',
          btnType: 'c7n-pro',
          btnProps: {
            onClick: this.handleComfirmEffect,
            loading: conChangeLoading,
            icon: 'bookmark_added',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          child: intl.get(`spcm.contractChange.view.button.comfirmEffect`).d('确认生效'),
        },
      isView &&
        !isPub &&
        ['TO_BE_VALID'].includes(pcStatusCode) && {
          name: 'comfirmCancel',
          btnType: 'c7n-pro',
          btnProps: {
            onClick: this.handleComfirmCancel,
            loading: conChangeLoading,
            icon: 'drive_file_rename_outline',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          child: intl.get(`spcm.contractChange.view.button.comfirmCancel`).d('修改'),
        },
      isView &&
        !isPub &&
        ['PUBLISHED', 'TO_BE_VALID'].includes(pcStatusCode) && {
          name: 'invalid',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            onClick: this.handleInvalid,
            loading: conChangeLoading,
            icon: 'cancel',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          child: intl.get(`spcm.contractChange.view.button.invalid`).d('作废'),
        },
      isView &&
        !isPub &&
        (['EFFECTED', 'ARCHIVE'].includes(pcStatusCode) ||
          (['CONFIRMED'].includes(pcStatusCode) && headerInfo.electricSignFlag === 0)) && {
          name: 'terminate',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            onClick: this.terminateContractFunc,
            loading: conChangeLoading,
            wait: 500,
            icon: 'cancel',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          child: intl.get(`spcm.contractChange.view.button.terminate`).d('终止'),
        },
      // 服务编码含“_SaaS”&协议状态=已终止&协议解约签署状态=未解约&电签标识=1
      isView &&
        !isPub &&
        pcStatusCode === 'TERMINATION' &&
        authType?.includes('_SAAS') &&
        terminateSignStatus === 'NOT_TERMINATED' &&
        electricSignFlag === 1 && {
          name: 'breakOff',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            onClick: this.handleBreakOffContract,
            loading: conChangeLoading,
            icon: 'remove_done',
            type: 'c7n-pro',
            funcType: 'flat',
            text: intl.get(`spcm.common.view.button.breakOffContract`).d('解约'),
          },
          child: intl.get(`spcm.common.view.button.breakOffContract`).d('解约'),
        },
      isChapter && {
        name: 'chapter',
        btnType: 'c7n-pro',
        // btnComp: PermissionButton,
        btnProps: !(isAttachmentSignUpload || isAttachmentSignAndText || isTextSignFlag)
          ? {
              color: 'primary',
              // funcType: 'flat',
              type: 'c7n-pro',
              icon: 'authorize',
              // 11.12迭代暂不处理签章逻辑的声明
              onClick: this.handleClickSeal,
              loading: mobileChapterLoading || chapterLoading,
              disabled: linkList.includes(authType) ? false : !focusStatus || !chapterFlag,
            }
          : {
              color: 'primary',
              icon: 'authorize',
              type: 'c7n-pro',
              onClick:
                authType === 'ESIGN'
                  ? () => useSealModal(sealModalProps)
                  : () => {
                      // this.setState({ statementVisible: true });
                      // 11.12迭代暂不处理签章逻辑的声明
                      this.handleClickSeal();
                    },
              loading: mobileChapterLoading || chapterLoading,
              disabled: linkList.includes(authType) ? false : !chapterFlag,
            },
        child: intl.get('spcm.contractChapter.view.button.chapter').d('用章'),
      },
      chapterFlag &&
        isChapter &&
        (headerInfo.electricSignOrder === 'PURCHASE_FIRST' || !rollbackPermission) && {
          name: 'rollback',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            onClick: () => this.handleControlModal('purchaser'),
            icon: 'reply',
            // loading: rollbackLoading || queryingHeader || queryingPartner || queryingSubject || queryingStage || queryingTerm,
            funcType: 'flat',
            type: 'c7n-pro',
          },
          child: (
            <Tooltip
              title={intl.get('spcm.common.button.rollback.purchaser').d('退回至采购方拟制')}
            >
              {intl.get('hzero.common.button.rollback').d('退回')}
            </Tooltip>
          ),
        },
      chapterFlag &&
        isChapter &&
        headerInfo.electricSignOrder === 'SUPPLIER_FIRST' && {
          name: 'rollbackSupplier',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            // loading: rollbackLoading || queryingHeader || queryingPartner || queryingSubject || queryingStage || queryingTerm,
            funcType: 'link',
            type: 'c7n-pro',
            icon: 'reply',
          },
          child: (
            <Dropdown overlay={rollbackSupplier} trigger={['hover']}>
              <Button type="c7n-pro" funcType="flat" icon="reply">
                {intl.get('hzero.common.button.rollback').d('退回')}
                <Icon type="expand_more" style={{ fontSize: '0.14rem' }} />
              </Button>
            </Dropdown>
          ),
        },
      isShowEditOnlineBtns &&
        // 未生成预文本
        pcHeaderWorkbenchPreTextFlag !== '1' &&
        // 不为驳回拟制，或者为驳回拟制，并且已经进行文本创建
        (!isRejectEdit || (isRejectEdit && pcHeaderBackContractCompareFlag === '1')) &&
        // 不为协同模式
        !isCoordinateMode && {
          name: 'generatorPreFile',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            icon: 'check',
            color: 'primary',
            // funcType: 'flat',
            type: 'c7n-pro',
            onClick: () => {
              this.handleUpdateContract({}, 0, 'generatorPreFile');
            },
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.workspace.view.button.generatorPreFile').d('生成预文本'),
        },
      isShowEditOnlineBtns &&
        // 已生成预文本
        pcHeaderWorkbenchPreTextFlag === '1' &&
        // 不为驳回拟制，或者为驳回拟制，并且已经进行文本创建
        (!isRejectEdit || (isRejectEdit && pcHeaderBackContractCompareFlag === '1')) &&
        // 不为协同模式
        !isCoordinateMode && {
          name: 'backToTemplate',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'undo',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => this.handlePreTextBack(() => this.handleSetSwitchTabKey('TEXT')),
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.workspace.view.button.backToTemplate').d('退回至模板阶段'),
        },
      enableEditShareFlag &&
        // 编辑态模板阶段； 协议审批时
        ((editable && pcHeaderWorkbenchPreTextFlag !== '1') || isPub) &&
        // 不为驳回拟制，或者为驳回拟制，并且已经进行文本创建
        (!isRejectEdit || (isRejectEdit && pcHeaderBackContractCompareFlag === '1')) &&
        // 不为协同模式
        !isCoordinateMode && {
          name: 'previewContract',
          btnType: 'c7n-pro',
          hidden: onlyEditReplaceWildcardBefore !== '1',
          btnProps: {
            icon: 'preview',
            type: 'c7n-pro',
            funcType: 'flat',
            wait: 500,
            waitType: 'throttle',
            disabled: defaultDisable,
            loading: defaultLoading,
            onClick: this.previewContract,
          },
          child: intl.get('spcm.common.view.button.previewContract').d('预览合同文本'),
        },
      // 没有开启在线编辑或者协议性质为附件类型
      // 开启在线编辑，生成预文本之后，没有分配单据或者为分配单据且已完成共享
      editable &&
        (enableEditShare !== '1' ||
          pcKindAttachList.includes(pcKindCode) ||
          (enableEditShare === '1' &&
            pcHeaderWorkbenchPreTextFlag === '1' &&
            (!isCoordinateMode || (isCoordinateMode && coordinatedFlag === '1')))) && {
          name: 'submit',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            icon: 'check',
            color: 'primary',
            // funcType: 'flat',
            type: 'c7n-pro',
            onClick: this.onPreSubmit,
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get(`hzero.common.button.submit`).d('提交'),
        },
      // 驳回拟制，渲染相关按钮
      // 第一次进入，值为null, 判断是否文本模式待定
      isShowEditOnlineBtns &&
        isRejectEdit &&
        pcHeaderBackContractCompareFlag !== '1' && {
          name: 'createText',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'save',
            color: 'primary',
            // funcType: 'flat',
            onClick: this.handleOpenEditArea,
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.workspace.view.button.createText').d('文本创建'),
        },
      editable && {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          // color: 'primary',
          funcType: 'flat',
          wait: 500,
          waitType: 'throttle',
          onClick: this.onSave,
          disabled: defaultDisable,
          loading: defaultLoading,
        },
        child: intl.get(`hzero.common.button.save`).d('保存'),
      },
      editable && {
        name: 'delete',
        btnType: 'c7n-pro',
        // btnComp: PermissionButton,
        btnProps: {
          icon: 'delete',
          // color: 'primary',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: this.handleDeleteContract,
          disabled: defaultDisable,
          loading: defaultLoading,
        },
        child: intl.get(`hzero.common.button.delete`).d('删除'),
      },
      // 协议模板阶段&&不是共享路由
      editable &&
        enableEditShare === '1' &&
        (pcKindAttachList.includes(pcKindCode) ? showTextMode : true) && // 附件合同，在智能提取或者附件合同在线编辑配置表里，展示共享
        pcHeaderWorkbenchPreTextFlag !== '1' &&
        (!isRejectEdit || (isRejectEdit && pcHeaderBackContractCompareFlag === '1')) &&
        coordinateable !== '1' &&
        !supplementFlag && {
          // !isRejectEdit &&
          name: 'editShare',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            icon: 'group_add',
            funcType: 'flat',
            type: 'c7n-pro',
            disabled: defaultDisable,
            loading: defaultLoading,
            onClick: this.handleOpenShareMangement,
          },
          child: intl.get('spcm.workspace.view.button.editShare').d('共享'),
        },
      editable &&
        !intelligent &&
        enableEditShare !== '1' &&
        editStep === 1 &&
        !pcKindAttachList.includes(headerInfo.pcKindCode) &&
        !isAttachmentSignUpload && {
          name: 'isEditorOnlineUpdate',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'mode_edit',
            funcType: 'flat',
            disabled: defaultDisable,
            loading: defaultLoading,
            onClick: () => {
              this.setState({
                isEditorOnlineUpdate: true,
              });
            },
            // loading: deleteHeaderLoading,
          },
          child: intl.get(`spcm.common.title.onlineEdit`).d('文本编辑'),
        },
      !isAttachmentSignUpload && enableEditShare !== '1'
        ? {
            name: 'textPreview',
            // btnType: 'c7n-pro',
            // btnComp: PermissionButton,
            btnProps: {
              icon: 'find_in_page',
              disabled:
                editStep === 0 ||
                pcKindAttachList.includes(headerInfo.pcKindCode) ||
                queryListLoading,
              // type: 'primary',
              onClick: this.getTextPreViewUrl,
              loading: defaultLoading,
              funcType: 'flat',
              type: 'c7n-pro',
              text: intl.get('spcm.common.view.title.textPreview').d('文本预览'),
            },
            child: intl.get('spcm.common.view.title.textPreview').d('文本预览'),
          }
        : '',
      // 没有开启协同
      editable && !supplementFlag && enableEditShare !== '1'
        ? {
            name: 'quoteAgreementTemplate',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'root',
              // type: 'primary',
              onClick: this.refreshTemplate,
              loading: defaultLoading,
              disabled:
                !pcHeaderId || pcKindAttachList.includes(headerInfo.pcKindCode) || queryListLoading,
              funcType: 'flat',
              text: intl.get(`spcm.common.view.title.quoteAgreementTemplate`).d('引用协议模板'),
            },
            child: intl.get(`spcm.common.view.title.quoteAgreementTemplate`).d('引用协议模板'),
          }
        : '',
      {
        name: 'operating',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'operation_service_request',
          btnType: 'c7n-pro',
          // type: 'primary',
          onClick: () => {
            openModal({
              pcHeaderId,
              documentId: pcHeaderId,
              documentType: 'PURCHASE_CONTRACT',
              remote: remoteWorkDetail,
            });
            // this.setState({
            //   operationRecordVisible: true,
            // });
          },
          // loading: conSaveLoading,
          funcType: 'flat',
          child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        },
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
      isView &&
        !isPub && {
          name: 'archive',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            funcType: 'flat',
            type: 'c7n-pro',
            onClick: () => this.archiveModel(headerInfo),
            icon: 'folder_open2',
            loading: defaultLoading,
            disabled: !(
              (headerInfo.pcStatusCode === 'EFFECTED' && headerInfo.electricSignFlag === 1) ||
              (headerInfo.pcStatusCode === 'CONFIRMED' &&
                headerInfo.electricSignFlag === 0 &&
                headerInfo.displayFlag2 !== '1') ||
              (headerInfo.pcStatusCode === 'EFFECTED' &&
                headerInfo.electricSignFlag === 0 &&
                headerInfo.displayFlag3 === '1') || // 已失效、已终止并且归档状态为未归档
              (['TERMINATION', 'EXPIRED'].includes(headerInfo.pcStatusCode) &&
                headerInfo.archiveFlag === 0)
            ),
            text: intl.get('spcm.purchaseContractView.model.file').d('归档'),
          },
          child: intl.get('spcm.purchaseContractView.model.file').d('归档'),
        },
      !isApproval &&
        ((headerInfo.pcStatusCode !== 'PENDING' &&
          !pcKindAttachList.includes(headerInfo.pcKindCode) &&
          !isAttachmentSignUpload) ||
          (attachmentSupportUpload && // 租户开启白名单 & 协议性质=附件合同普通/附件合同框架
            pcKindAttachList.includes(headerInfo.pcKindCode) &&
            templateUrlBeforeWildcardReplace)) && {
          name: 'textComparison',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'compare',
            wait: 500,
            waitType: 'throttle',
            onClick: this.handleControlComparison,
            disabled: defaultDisable,
            loading: defaultLoading,
            text: !textComparisonVisible
              ? intl.get('spcm.common.view.title.textComparison').d('文本对比')
              : intl.get(`mallf.common.model.cancelCompare`).d('取消对比'),
          },
          child: !textComparisonVisible
            ? intl.get('spcm.common.view.title.textComparison').d('文本对比')
            : intl.get(`mallf.common.model.cancelCompare`).d('取消对比'),
        },
      {
        name: 'printDoc',
        type: 'c7n-pro',
        btnComp: PrintProButton,
        child: intl.get(`spcm.common.view.button.printDoc`).d('单据打印'),
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            icon: 'print',
          },
          requestUrl: `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/purchase-contract/detail-print-new/${pcHeaderId}`,
          method: 'GET',
          buttonText: intl.get(`spcm.common.view.button.printDoc`).d('单据打印'),
          text: intl.get(`spcm.common.view.button.printDoc`).d('单据打印'),
        },
      },
      pcHeaderId &&
        isView &&
        editStep === 1 &&
        !pcKindAttachList.includes(headerInfo.pcKindCode) &&
        !isAttachmentSignUpload && {
          name: 'print',
          btnType: 'c7n-pro',
          btnComp: PrintButton,
          btnProps: {
            funcType: 'flat',
            icon: 'print',
            pcHeaderId,
            isBtnPro: true,
            type: 'c7n-pro',
          },
        },
      revokeByBusKeyFlag &&
        !isPub && {
          name: 'revokeApproval',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            onClick: this.handleRevoke,
            disabled: defaultDisable,
            loading: defaultLoading,
            icon: 'reply',
            type: 'c7n-pro',
            funcType: 'flat',
            text: intl.get(`spcm.common.view.button.revokeApprove`).d('撤销审批'),
          },
          child: intl.get(`spcm.common.view.button.revokeApprove`).d('撤销审批'),
        },
      approvalByBusKey &&
        !isPub && {
          name: 'approval',
          btnType: 'c7n-pro',
          // btnComp: PermissionButton,
          btnProps: {
            onClick: this.handleApprove,
            disabled: defaultDisable,
            loading: defaultLoading,
            icon: 'authorize',
            type: 'c7n-pro',
            funcType: 'flat',
            text: intl.get(`spcm.common.view.button.approve`).d('审批'),
          },
          child: intl.get(`spcm.common.view.button.approve`).d('审批'),
        },
      (supplementFlag || (!supplementFlag && (version > 1 || isExistsSupplementFlag === '1'))) && {
        name: 'historyCompare',
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          btnType: 'c7n-pro',
          wait: 500,
          waitType: 'throttle',
          icon: !historyCompareFlag ? 'compare' : 'cancel',
          disabled: defaultDisable,
          loading: defaultLoading,
          onClick: this.handleHistoryCompare,
          child: !historyCompareFlag
            ? intl.get(`hzero.common.button.contractHistoryCompare`).d('历史版本对比')
            : intl.get(`mallf.common.model.cancelCompare`).d('取消对比'),
        },
        child: !historyCompareFlag
          ? intl.get(`hzero.common.button.contractHistoryCompare`).d('历史版本对比')
          : intl.get(`mallf.common.model.cancelCompare`).d('取消对比'),
      },
      electricSignFlag &&
        signatureType !== 'ANNEX_SIGNATURE' &&
        contractFileUrl &&
        ['EFFECTED', 'ARCHIVE', 'ARCHIVE_TO_APPROVAL'].includes(pcStatusCode) && {
          name: 'downloadSignContract',
          // btnComp: PermissionButton,
          btnType: 'c7n-pro',
          btnProps: {
            funcType: 'flat',
            btnType: 'c7n-pro',
            icon: 'file_download_black-o',
            wait: 200,
            waitType: 'throttle',
            onClick: this.downloadSignContract,
            child: intl.get(`spcm.common.button.downloadSignContract`).d('下载签章合同'),
          },
          child: intl.get(`spcm.common.button.downloadSignContract`).d('下载签章合同'),
        },
      pcStatusCode === 'EFFECTED' && {
        name: 'download',
        // btnComp: PermissionButton,
        btnType: 'c7n-pro',
        btnProps: {
          funcType: 'flat',
          type: 'c7n-pro',
          // loading: syncAttachmentLoading,
          icon: 'sim_card_download-o',
          wait: 200,
          waitType: 'throttle',
          onClick: () => this.downloadSyncContract(pcHeaderId),
          child: intl.get(`spcm.common.button.download`).d('下载'),
        },
        child: intl.get(`spcm.common.button.download`).d('下载'),
      },
      {
        name: 'chatRoom',
        child: intl.get(`spcm.common.view.button.chatRoom`).d('在线沟通'),
        hidden: !supplierCompanyId,
        btnComp: DotButton,
        btnType: 'c7n-pro',
        btnProps: {
          notificationDot: headerFormDs?.current?.get('msgNum') > 0,
          wait: 500,
          icon: 'headset',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: async () => {
            const res = getResponse(await initChatOnlineRoom({ pcHeaderId, camp: 'pur' }));
            if (res) {
              headerFormDs.current.set('msgNum', 0);
              const chatRoomModal = ModalPro.open({
                resizable: true,
                style: { width: 742 },
                bodyStyle: { padding: 0 },
                footer: null,
                header: null,
                drawer: true,
                children: (
                  <ChatRoom
                    contentClass={styles.chatRoom}
                    onClose={() => chatRoomModal.close()}
                    showClose
                    roomParams={{
                      businessNo: pcHeaderId,
                      businessCode: 'spcm',
                      purchaseTenantId: organizationId,
                      currentUser: {
                        tenantId: organizationId,
                        companyId,
                        userId: currentUser.id,
                      },
                    }}
                  />
                ),
              });
            }
          },
        },
      },
      editable &&
        showTextMode &&
        pcKindAttachList.includes(pcKindCode) &&
        Number(showAttachmentFlag) !== 1 && {
          name: 'replaceFile',
          child: intl.get('spcm.common.button.replaceFile').d('替换文件'),
          btnProps: {
            icon: 'file_upload',
            funcType: 'flat',
            help: intl
              .get('spcm.workspace.msg.help.replaceFile')
              .d('替换文件后如需重新提取请点击重新提取按钮'),
            disabled: defaultDisable,
            loading: defaultLoading,
            wait: 200,
            waitType: 'throttle',
            onClick: this.replaceFile,
          },
        },
      editable &&
        Number(showAttachmentFlag) !== 1 && {
          name: 'smartContract',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'operation_service_request',
            funcType: 'flat',
            wait: 500,
            waitType: 'throttle',
            onClick: this.handleSmartContract,
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.common.view.button.smartContract').d('智能摘要'),
        },
      isPub &&
        !['PENDING', 'DELETED'].includes(pcStatusCode) && {
          name: 'onlineTextCompare',
          child: intl.get('spcm.common.button.contractTextComparison').d('合同文本对比'),
          btnProps: {
            icon: 'compare',
            funcType: 'flat',
            disabled: defaultDisable,
            loading: defaultLoading,
            wait: 200,
            waitType: 'throttle',
            onClick: this.handleTextCompare,
          },
        },
      editable &&
        !isNil(reviewTemplateId) &&
        Number(checkDuplicationFlag) === 2 &&
        Number(showAttachmentFlag) !== 1 && {
          name: 'smartReview',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'pageview',
            funcType: 'flat',
            wait: 500,
            waitType: 'throttle',
            onClick: this.handleSaveAndSmartReview,
            // 加上disabled更好，因为按钮在更多里是没有loading效果可点击的。
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.workspace.view.button.smartReview').d('智能审查'),
        },
      editable &&
        !isNil(reviewTemplateId) &&
        Number(checkDuplicationFlag) === 3 &&
        Number(showAttachmentFlag) !== 1 && {
          name: 'viewSmartReview',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'pageview',
            funcType: 'flat',
            wait: 500,
            waitType: 'throttle',
            onClick: this.handleViewSmartReview,
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.workspace.view.button.viewSmartReview').d('查看审查结果'),
        },
      editable &&
        !isNil(pcAttachmentTemplateId) &&
        attachmentSupportUpload &&
        ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode) && {
          name: 'contractTextGen',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'fact_check-o',
            funcType: 'flat',
            wait: 500,
            waitType: 'throttle',
            onClick: () => this.handleUpdateContract({}, 0, 'contractTextGen'),
            disabled: defaultDisable,
            loading: defaultLoading,
          },
          child: intl.get('spcm.workspace.view.button.contractTextGen').d('生成合同文本'),
        },
      editable && {
        name: 'aiApprove',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'offline_bolt-o',
          funcType: 'flat',
          wait: 500,
          waitType: 'throttle',
          onClick: () => this.handleAiApprove(),
          disabled: defaultDisable || disableAiApproveBtn,
          loading: defaultLoading,
        },
        child: intl.get('spcm.common.view.button.aiApprove').d('智能预审'),
      },
    ].filter(Boolean);
    let btns = buttons;
    // 共享模式，渲染协同按钮
    if (isShowEditOnlineBtns && isCoordinateMode) {
      btns = btns.concat(this.renderCoordinateBtns(queryListLoading));
    }
    if (intelligent && editable) {
      const intelligentBtns = [
        // 非补充协议，开启智能合同提取，且用户有智能提取权限。
        enableSmartContract &&
          !supplementFlag &&
          pcKindAttachList.includes(pcKindCode) && {
            name: 'reExtract',
            btnProps: {
              funcType: 'link',
              disabled: defaultDisable,
              loading: defaultLoading,
              wait: 200,
              waitType: 'throttle',
            },
            child: this.renderReExtract(),
          },
      ];
      // if (switchTabKey === defaultSwitchTabKey) {
      //   btns = btns
      //     .filter((btn) => ['submit', 'save', 'smartContract'].includes(btn.name))
      //     .concat(intelligentBtns);
      // } else {
      btns = btns.concat(intelligentBtns);
      // }
    }
    // 单据流docLinkFlag=1，只显示操作记录
    btns =
      Number(docLinkFlag) || backVoidPage
        ? btns.filter(({ name }) => ['operating', 'print'].includes(name))
        : btns;
    if (remoteWorkDetail) {
      btns = remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_HEAD_BTNS', btns, {
        current: this,
      });
    }
    return btns;
  }

  /**
   * 模式切换
   * @returns
   */
  @Bind()
  renderModeTag() {
    const {
      enableEditShare,
      remoteWorkDetail,
      intelligent,
      showTextMode, // 不在智能提取配置表的，同时租户不在《附件合同在线编辑黑名单》的
    } = this.props;
    const {
      editable,
      headerInfo,
      isTextMode,
      pcKindAttachList = [],
      // attachmentList,
    } = this.state;
    const { pcKindCode, signatureType, electricSignFlag, authType, pcTemplateId } = headerInfo;
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    const modeTagFlag =
      (enableEditShare === '1' || (!editable && !isAttachmentSignUpload)) &&
      !pcKindAttachList.includes(pcKindCode) &&
      !intelligent;

    // 不在黑名单和智能提取， 协议性质=附件合同（普通）/附件合同（框架）的,展示切换文本/单据标签
    const showChangeTab = showTextMode && pcKindAttachList.includes(pcKindCode) && !intelligent;
    const modeTagEle =
      modeTagFlag || showChangeTab ? (
        <ModeTag
          activeKey={isTextMode}
          onRightClick={() => {
            if (!pcTemplateId && !showChangeTab) {
              notification.warning({
                message: intl.get('spcm.common.view.message.pcTemplateIsNull').d('请维护协议模板'),
              });
            } else {
              this.setState({
                isTextMode: true,
              });
            }
          }}
        />
      ) : null;
    return remoteWorkDetail
      ? remoteWorkDetail.render('SPCM_WORKSPACE_DETAIL_CONTRACT_MODETAG', modeTagEle, {
          current: this,
        })
      : modeTagEle;
  }

  // 头按钮模式切换
  @Bind()
  renderHeaderSwitchTabs() {
    const { remoteWorkDetail, intelligent } = this.props;
    const { switchTabKey, conSaveLoading, headerInfo } = this.state;
    const modeTagEle = (
      <SwitchTab
        switchTabKey={switchTabKey}
        useHdChange={this.handleSwitchModeTab}
        intelligent={intelligent}
        notIntelligentShowBtnFlag={this.handleNotIntelligentBtn()} // 没开启分屏模式，头切换按钮是否展示的标识
        loading={conSaveLoading}
        headerInfo={headerInfo}
      />
    );
    return remoteWorkDetail
      ? remoteWorkDetail.render('SPCM_WORKSPACE_DETAIL_CONTRACT_MODETAG', modeTagEle, {
          current: this,
        })
      : modeTagEle;
  }

  // 保存标的行后
  @Bind()
  async saveContractSubjectAfter() {
    const { remoteWorkDetail } = this.props;
    const { headerFormDs } = this.state;
    // 埋点
    if (remoteWorkDetail?.event) {
      const eventProps = {
        headeInfoDs: headerFormDs,
        attachmentRef: this?.attachmentRef,
      };
      remoteWorkDetail.event.fireEvent('handleCuxSaveContractSubjectAfter', eventProps);
    }
  }

  // 处理智能摘要
  @Bind()
  async handleSmartContract() {
    const { pcHeaderId, headerFormDs } = this.state;
    const headerInfo = headerFormDs?.current?.toData() || {};
    const { contractAbstract } = headerInfo;
    if (contractAbstract) {
      smartContractModal({ headerInfo, refresHeaderData: this.refresHeaderData });
      return;
    }
    this.setState({ conSaveLoading: true });
    return getSmartContractTaskId({
      pcHeaderId,
    })
      .then((res) => {
        const result = getResponse(res, () => {
          // 处理未开启智能摘要报错，不把报错内容展示在页面,打开弹窗
          this.hanldeSmartContractError(res);
        });
        if (result) {
          const { taskId } = res;
          smartContractModal({ taskId, headerInfo, refresHeaderData: this.refresHeaderData });
        }
      })
      .finally(() => {
        this.setState({ conSaveLoading: false });
      });
  }

  // 处理智能摘要报错
  @Bind()
  hanldeSmartContractError(response) {
    const { headerFormDs } = this.state;
    const headerInfo = headerFormDs?.current?.toData() || {};
    if (response && response.code === 'error.spcm_smart_order_not_exists') {
      smartContractModal({ headerInfo, refresHeaderData: this.refresHeaderData });
    } else {
      getResponse(response);
    }
  }

  // 刷新单据头信息
  @Bind()
  refresHeaderData() {
    this.setState({ conSaveLoading: true });
    this.fetchHeader()
      .then((result) => {
        if (result) {
          this.setState({
            headerInfo: result,
          });
        }
      })
      .finally(() => {
        this.setState({ conSaveLoading: false });
      });
  }

  /**
   * 分屏模式切换
   * @param {*} tabKey
   */
  @Bind()
  handleSwitchModeTab({ tabKey, extractValue }) {
    const { switchTabKey, isTextMode } = this.state;
    const { dispatch } = this.props;
    if (switchTabKey !== tabKey) {
      this.setState({ switchTabKey: tabKey });
    }
    if (extractValue) {
      dispatch({
        type: 'editorOnline/updateState',
        payload: {
          extractValue: tabKey === 'SPLIT' && switchTabKey !== 'SPLIT' ? extractValue : null,
        },
      });
    }
    if (isTextMode !== (tabKey === 'TEXT')) {
      this.setState({ isTextMode: tabKey === 'TEXT' });
    }
  }

  // 没开启分屏模式，头切换按钮是否展示的标识
  @Bind()
  handleNotIntelligentBtn() {
    const {
      enableEditShare,
      intelligent,
      showTextMode, // 开启智能提取配置表 或者 租户在《附件合同在线编辑白名单》的
    } = this.props;
    const {
      editable,
      headerInfo,
      pcKindAttachList = [],
      // attachmentList,
      coordinateable,
      isShareContract,
      isTextMode, // 默认展示文本模式按钮标识
    } = this.state;
    const {
      pcKindCode,
      signatureType,
      electricSignFlag,
      authType,
      showAttachmentFlag,
    } = headerInfo;
    if (Number(showAttachmentFlag) === 1) {
      // 附件合同仅显示单据模式标识 == 1 仅展示单据页，隐藏头部切换按钮
      return false;
    }
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    // 条件1-这部分是历史逻辑，没开智能提取控制（不是分屏模式）且不是附件合同且（开启在线编辑协同或者查看页不是附件签章类型的）
    const modeTagFlag =
      (enableEditShare === '1' || (!editable && !isAttachmentSignUpload)) &&
      !pcKindAttachList.includes(pcKindCode) &&
      !intelligent;

    // 条件2-这部分是课题新加的逻辑，没开智能提取控制（不是分屏模式），开了在线编辑白名单 协议性质=附件合同（普通）/附件合同（框架）的,展示切换文本/单据标签
    const showChangeTab = showTextMode && pcKindAttachList.includes(pcKindCode) && !intelligent;
    // 条件1，条件2有一个成立就展示切换模式的按钮
    const showDocTab = modeTagFlag || showChangeTab;
    // 默认激活文本模式按钮标识
    const showTextModeFlag = this.getContractTextModeFlag();
    // 条件3-激活文本模式按钮条件下，不是点击协同进入的，或者是点击协同进入且有协同的单据权限，才展示切换按钮
    const showTextModeTab =
      showTextModeFlag &&
      (coordinateable !== '1' || (coordinateable === '1' && isShareContract === '1'));
    // 汇总条件，头切换按钮是否最终展示
    // 1. 默认不激活文本模式按钮的场景，取条件1和条件2的或运算 为true展示头按钮
    // 2. 默认激活文本模式按钮的场景，取条件3未true展示头按钮
    return !isTextMode ? showDocTab : showTextModeTab;
  }

  // 文本模式tab
  @Bind()
  getContractTextModeFlag() {
    const { enableSmartContract, enableOnlineAttachmentContract } = this.props;
    const { coordinateable, pcKindAttachList = [], headerInfo, isTextMode } = this.state;
    const { pcKindCode } = headerInfo;
    // 协议进的详情，如果开启【智能合同提取控制】或者不在【附件合同在线编辑黑名单】,协议性质=附件合同（普通）/附件合同（框架）的 展示合同附件在线编辑
    const showCoordinateContract =
      coordinateable === '1' &&
      (enableSmartContract || enableOnlineAttachmentContract) &&
      pcKindAttachList.includes(pcKindCode);
    return isTextMode || showCoordinateContract;
  }

  // 文本对比
  @Bind()
  async handleTextCompare() {
    await this.handleWpsSave();
    const { headerInfo } = this.state;
    this.setState({ conSaveLoading: true });
    operationTextCompareModal({
      headerInfo,
    }).finally(() => {
      this.setState({ conSaveLoading: false });
    });
  }

  render() {
    const {
      contractCommon: { configSetting = {}, stageList = [], partnerList = [] },
      customizeForm,
      customizeTable,
      customizeCollapseForm,
      customizeBtnGroup,
      custLoading,
      getHocInstance,
      remoteWorkDetail,
      mobileChapterLoading,
      chapterLoading,
      custConfig,
      enableEditShare,
      _linkFlag,
      intelligent,
      enableSmartContract,
      showTextMode,
      isBlacklistTenant,
      sealType,
    } = this.props;
    const {
      pcHeaderId,
      editable,
      coordinateable,
      coordinatedFlag,
      isShareContract,
      headerFormDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      partnerDs,
      businessTermsDs,
      replenishDs,
      // approveRecordDs,
      headerInfo,
      fullScreenFlag,
      textComparisonVisible,
      templateList,
      templateListFlag,
      isPub,
      isProcessEdit,
      pcSubjectDataSource,
      pcStageDataSource,
      operationRecordVisible,
      isEditorOnlineUpdate,
      historyCompareFlag,
      isTextMode,
      mobileModalVisible,
      verifyPhoneNum,
      queryListLoading,
      pcKindAttachList,
      docLinkFlag,
      showAlterFlag,
      tableExtendDs,
      switchTabKey,
      // attachmentList,
      conSaveLoading,
      hiddenReviewResultFlag,
      aiApproveReslultParams,
      resultStatus,
    } = this.state;

    const {
      rebateFlag,
      enableRule,
      version,
      pcNum,
      pcKindCode,
      pcStatusCode,
      attachmentUuid,
      supplierAttachmentUuid,
      supplementFlag,
      signatureType,
      electricSignFlag: originElectricSignFlag,
      amountDiffFlag, // 差异标识
      taxIncludeAmount = 0, // 协议头本币含税金额字段
      purchaseCostQuantity = 0, // 阶段行本币金额字段
      diffAmount = 0, // 差异金额
      authType,
      electronicSignatureAttachmentDisplayFlag,
      mainContractId,
      // pcTemplateId,
      electronicOrderType,
      reviewTemplateId,
      checkDuplicationFlag,
    } = headerInfo;
    const electricSignFlag = Number(originElectricSignFlag);
    const showSignNodeCrad = electricSignFlag === 1 && electronicOrderType === 'DOCUSIGN';
    const isIntelligent = intelligent && switchTabKey === 'SPLIT';

    const contractSubjectListProps = {
      isPub,
      isProcessEdit,
      // 使用enableSmartContract，保证审批页面有AI标识
      intelligent: enableSmartContract,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      custConfig,
      editable,
      pcHeaderId,
      headerInfo,
      _linkFlag,
      pcSubjectDs,
      headerFormDs,
      docLinkFlag,
      remoteWorkDetail,
      dataSource: pcSubjectDataSource,
      doubleUomFlag: configSetting['000112'] === '1',
      onFetchHeader: this.fetchHeaderAfterOperation,
      onFetchTableList: async (ds, customizeUnitCode) => {
        this.getCheckStageCurrency(); // 标的修改保存完之后需要重新查询阶段和标的币种是否一致
        const { content: pcSubjectData } = await this.fetchTableList(ds, customizeUnitCode);
        this.setState({ pcSubjectDataSource: pcSubjectData });
      },
      checkModified: () => this.checkModified('pcSubject'),
      pcSourceKey: this.pcSourceKeyFlag(),
      onAddPurchaseOrder: this.handleAddPurchaseOrder,
      onSaveLineAfter: this.saveContractSubjectAfter,
    };
    const contractStageListProps = {
      showAlterFlag,
      isPub,
      isProcessEdit,
      intelligent: enableSmartContract,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      custConfig,
      editable,
      pcStageDs,
      stageList,
      pcStageDataSource,
      headerInfo,
      pcSubjectDs,
      remoteWorkDetail,
      onFetchTableList: this.fetchTableList,
      onChangeState: (state) => {
        this.setState(state);
      },
    };
    const contractRebateProps = {
      isPub,
      isProcessEdit,
      editable,
      rebateDs,
      headerFormDs,
      customizeTable,
      customizeBtnGroup,
      onFetchTableList: this.fetchTableList,
    };
    const partnerListProps = {
      isPub,
      isProcessEdit,
      intelligent: enableSmartContract,
      editable,
      pcHeaderId,
      partnerDs,
      partnerList,
      customizeTable,
      customizeBtnGroup,
      remoteWorkDetail,
      onFetchTableList: async (ds, customizeUnitCode) => {
        const partnerListData = await this.fetchTableList(ds, customizeUnitCode);
        this.setState({ partnerDataSource: partnerListData });
      },
      checkModified: () => this.checkModified('partner'),
    };
    const contractBusinessTermsListProps = {
      isPub,
      intelligent: enableSmartContract,
      isProcessEdit,
      customizeTable,
      headerInfo,
      customizeBtnGroup,
      editable,
      businessTermsDs,
    };

    const contractReplenishProps = {
      isPub,
      isProcessEdit,
      customizeCollapseForm,
      _linkFlag,
      customizeTable,
      editable,
      pcHeaderId,
      replenishDs,
      rebateFlag,
      remoteWorkDetail,
      headerFormDs,
      redirectDetail: this.redirectDetail,
      sealType,
    };

    const customRowTableProps = {
      isPub,
      isProcessEdit,
      customizeCollapseForm,
      customizeBtnGroup,
      customizeTable,
      editable,
      pcHeaderId,
      tableExtendDs,
      rebateFlag,
      remoteWorkDetail,
      redirectDetail: this.redirectDetail,
    };

    const discountRuleProps = {
      editable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'discount',
      headerInfo: () => ({ ...headerInfo, ...headerFormDs?.current?.toJSONData() }),
      changeFlag: editable && !!supplementFlag,
    };

    const rebateRuleProps = {
      editable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'rebate',
      headerInfo: () => ({ ...headerInfo, ...headerFormDs?.current?.toJSONData() }),
      changeFlag: editable && !!supplementFlag,
    };

    // const approveRecordProps = {
    //   pcHeaderId,
    //   approveRecordDs,
    // };

    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
      viewOnly: !editable,
    };
    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };
    // eslint-disable-next-line
    let attachmentProps = {
      remoteWorkDetail,
      templateListFlag,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      width: 610,
      isShowTips: true,
      onChangeState: (state) => {
        headerFormDs.current.init({
          supplierAttachmentUuid: state.headerInfo?.supplierAttachmentUuid,
          contractAttachmentUrl: state.headerInfo?.contractAttachmentUrl,
          templateFileUrl: state.headerInfo?.templateFileUrl,
          attachmentUuid: state.headerInfo?.attachmentUuid,
          objectVersionNumber: state.headerInfo?.objectVersionNumber,
        });
        this.setState(state);
      },
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.handleUpdateContractTextUrl,
      onFetchHeader: this.fetchHeaderAfterOperation,
      onRefresh: this.handleFetchConfigAttachment,
      purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        isBtn: false,
        icon: 'upload',
        btnText: intl.get(`entity.attachment.upload.spcm`).d('附件上传'),
      },
    };

    // eslint-disable-next-line
    const attachmentViewProps = {
      remoteWorkDetail,
      headerInfo,
      isShowTips: true,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.onSave,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeaderAfterOperation,
      onRefresh: this.handleFetchConfigAttachment,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
      btnProps: {
        isBtn: false,
      },
    };

    // attachmentProps = editable ? attachmentProps : attachmentViewProps;

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList.includes(authType); // 是否附件签章
    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        electricSignFlag === 1 &&
        allSignList.includes(authType)) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章

    const electricSignAttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchase-contract',
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      attachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachment,
      rightAttachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachmentIsSigned,
      afterOpenUploadModal: (electricSignUuid) => this.handleSaveElectricSignUuid(electricSignUuid),
      fileSize: 25 * 1024 * 1024,
      fileMaxNum: 4,
      fileType:
        'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      viewOnly: !editable,
    };

    const contractAttachmentsProps = {
      editable,
      custCode: editable ? editCustomCode : viewCustomCode,
      attachmentRef: this.attachmentRef,
      isProcessEdit,
      remoteWorkDetail,
      customizeForm,
      getHocInstance,
      headerFormDs,
      templateListFlag,
      attachmentProps: editable ? attachmentProps : attachmentViewProps,
      uploadProps,
      electricSignAttachmentProps,
      showSignAttachement: isAttachmentSignUpload || isAttachmentSignAndText,
      handleSaveUuid: this.handleSaveUuid,
      showTextMode,
      isBlacklistTenant,
    };

    // 签署节点信息props
    const signNodeProps = {
      customizeTable,
      signNodeDs: this.signNodeDs,
      headerDs: headerFormDs,
      isEdit: editable,
      partnerDs,
    };

    const validateModalProps = {
      verifyPhoneNum,
      mobileModalVisible,
      mobileChapterLoading,
      onClose: this.handleCloseModal,
      onModalOk: this.handleOk,
      onRef: (node) => {
        this.modalForm = node.props.form;
      },
      getVerifyCode: this.getVerifyCode,
    };
    const isShowEditOnlineBtns =
      editable && !pcKindAttachList.includes(pcKindCode) && enableEditShare === '1';

    // 是否是驳回拟制
    const isRejectEdit = ['SUPPLIER_REJECTED', 'REJECTED'].includes(pcStatusCode);

    const statementModal = (
      <Modal
        key={authType}
        width={600}
        visible={this.state.statementVisible}
        className={styles['theme-config-protocol']}
        onCancel={() => {
          this.setState({ statementVisible: false });
        }}
        destroyOnClose
        footer={null}
      >
        <PrivacyStatement
          onCancel={() => {
            this.setState({ statementVisible: false });
          }}
          handleOk={this.handleClickSeal}
          authType={authType}
          loading={mobileChapterLoading || chapterLoading}
        />
      </Modal>
    );

    // 协议性质=附件合同（普通）/附件合同（框架）的, 展示附件合同
    const showContractTextMode = showTextMode && pcKindAttachList.includes(pcKindCode);

    // 埋点增加页签所需参数
    const remoteExtraProps = {
      styles,
      partnerListProps,
      _this: this,
    };

    // 控制尾差提示显隐
    const tailedDifferenceFlag = amountDiffFlag === 1 && !isPub;
    const remoteTailedDifferenceFlag = remoteWorkDetail
      ? remoteWorkDetail.process(
          'SPCM_WORKSPACE_DETAIL_TAILED_DIFFERENCE_FLAG',
          tailedDifferenceFlag
        )
      : tailedDifferenceFlag;

    // 头按钮权限集
    const remotePermissions = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_HEADER_BTNS_PERMISSIONS', this.permissions)
      : this.permissions;

    const defaultProps = {
      btnMaxNum: 5,
    };
    /**
     * 注意！！！使用该埋点的时候返回的数据一定要带上defaultProps, 例如 return { ...defaultProps, btnMaxNum: 10  };
     * 未来可能还会在 defaultProps添加其他参数。
     */
    const cuxProps = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_CUX_PROPS', defaultProps, { current: this })
      : defaultProps;
    // ai审核参数
    const aiApproveParam = {
      aiApproveReslultParams,
      resultStatus,
    };

    return (
      <Fragment>
        <Header
          className={styles['spcm-header']}
          backPath={this.getBackPath()}
          title={this.getHeaderTitle()}
        >
          {this.renderHeaderSwitchTabs()}
          {/* 初版不显示按钮 */}
          {pcStatusCode !== 'FIRST_EDITION' &&
            customizeBtnGroup(
              { code: 'SPCM.WORKSPACE_DETAIL.BTN_GROUP', pro: true },
              <DynamicButtons
                maxNum={cuxProps?.btnMaxNum}
                defaultBtnType="c7n-pro"
                buttons={
                  coordinateable === '1'
                    ? this.renderCoordinateBtns(queryListLoading)
                    : this.renderBtns()
                } // 没有单据权限的协同模式下 只展示一个按钮
                permissions={remotePermissions}
              />
            )}
        </Header>
        {remoteWorkDetail?.process('SPCM_WORKSPACE_DETAIL_BASIC_INFORMATION_EXTRA_DOM', null, {
          current: this,
        })}
        {isIntelligent && (
          <ContractExtract
            {...this.props}
            onRef={(node) => {
              this.editorOnlineRef = node;
            }}
            rebateDs={rebateDs}
            pcKindAttachList={pcKindAttachList}
            handleSwitchModeTab={this.handleSwitchModeTab}
            coordinatedFlag={coordinatedFlag}
            contractAttachmentsProps={contractAttachmentsProps}
            loading={queryListLoading || conSaveLoading}
            headerFormDs={headerFormDs}
            partnerListProps={partnerListProps}
            contractSubjectListProps={contractSubjectListProps}
            contractStageListProps={contractStageListProps}
            contractBusinessTermsListProps={contractBusinessTermsListProps}
            showCreateSteps={isShowEditOnlineBtns}
            onPreTextBack={this.handlePreTextBack}
            headerInfoRes={headerInfo}
            showContractTextMode={showContractTextMode}
            isRejectEdit={isRejectEdit}
            signNodeProps={signNodeProps}
            aiApproveParam={aiApproveParam}
          />
        )}
        {!textComparisonVisible && !isIntelligent && (
          <div id="scrollContent" className={styles['content-wrapper']}>
            <Content className={classnames('ued-detail-wrapper', styles['update-container'])}>
              <Spin spinning={conSaveLoading}>
                <div className={!hiddenReviewResultFlag && styles.contract}>
                  <IntelligentPreReview {...aiApproveParam} />
                  {
                    // 不为共享路由或者为共享路由且已分配单据模式
                    !historyCompareFlag &&
                      // !isTextMode &&
                      (coordinateable !== '1' ||
                        (coordinateable === '1' && isShareContract === '1')) && (
                        <div
                          style={{
                            display: !isTextMode ? 'block' : 'none',
                            width: hiddenReviewResultFlag ? '100%' : '75%',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <AnchorSpcm
                            remoteWorkDetail={remoteWorkDetail}
                            isPub={isPub}
                            onRef={(node) => {
                              this.positionAnchorRef = node;
                            }}
                          />
                          <div className={styles['rfx-detail-list-card']}>
                            <div className={styles['custom-page-content']}>
                              <h3
                                id="spcm-detail-information"
                                className={classnames(
                                  styles['rfx-card-item-title'],
                                  styles.titleFlex
                                )}
                              >
                                {intl.get(`${commonViewPrompt}.basicInformation`).d('基本信息')}
                                {/* 开启在线编辑并且协议不为附件合同 */}
                                {/* {this.renderModeTag()} */}
                              </h3>
                              {remoteTailedDifferenceFlag && (
                                <div className={styles['alert-wrapper']}>
                                  <Alert
                                    message={
                                      <>
                                        <Tag color="#0161D5">
                                          {intl
                                            .get('spcm.common.view.message.title.tailedDifference')
                                            .d('有尾差')}
                                        </Tag>
                                        <span className={classnames(styles['alert-info'])}>
                                          {intl
                                            .get(
                                              'spcm.common.view.message.title.tailedDifferenceInfo',
                                              {
                                                purchaseCostQuantity: renderThousandthNum(
                                                  purchaseCostQuantity
                                                ),
                                                taxIncludeAmount: renderThousandthNum(
                                                  taxIncludeAmount
                                                ),
                                                diffAmount: renderThousandthNum(diffAmount),
                                              }
                                            )
                                            .d(
                                              `当前协议阶段本币费用之和【${renderThousandthNum(
                                                purchaseCostQuantity
                                              )}】当前协议总额（本币）【${renderThousandthNum(
                                                taxIncludeAmount
                                              )}】，尾差为【${renderThousandthNum(diffAmount)}】`
                                            )}
                                        </span>
                                      </>
                                    }
                                    type="info"
                                    closable
                                  />
                                </div>
                              )}
                              <ContractHeader
                                {...this.props}
                                customizeCollapseForm={customizeCollapseForm}
                                isEdit={editable}
                                partnerDs={partnerDs}
                                pcSubjectDs={pcSubjectDs}
                                rebateDs={rebateFlag && rebateDs}
                                custLoading={custLoading}
                                headerFormDs={headerFormDs}
                                headerInfo={headerInfo}
                                tableExtendDs={tableExtendDs}
                              />
                            </div>
                            <TopSection
                              code={this.getSectionCode().DETAIL}
                              getHocInstance={getHocInstance}
                              getPositionAnchor={() => this.positionAnchorRef}
                            >
                              {/* 查看页才展示智能摘要 */}
                              {!editable && (
                                <SecondSection code={this.getSectionCode().SMARTABSTRACT}>
                                  <SmartAbstract showFlag c7nStyleFlag pcHeaderId={pcHeaderId} />
                                </SecondSection>
                              )}
                              {/* 智能审查 审批页显示 */}
                              {isPub && !isNil(reviewTemplateId) && (
                                <SecondSection code={this.getSectionCode().SMARTREVIEW}>
                                  <SmartReview
                                    approvalFLag
                                    customizeForm={customizeForm}
                                    pcHeaderId={pcHeaderId}
                                  />
                                </SecondSection>
                              )}
                              {remoteWorkDetail?.process(
                                'SPCM_WORKSPACE_DETAIL_DOCUMENT_MODE_EXTRA_DOM',
                                null,
                                remoteExtraProps
                              )}
                              {/* 朴朴超市二开项目提出需要render类埋点 */}
                              {remoteWorkDetail?.render(
                                'SPCM_WORKSPACE_DETAIL_DOCUMENT_MODE_EXTRA_RENDER',
                                null,
                                remoteExtraProps
                              )}
                              <SecondSection code={this.getSectionCode().PARTNER}>
                                <div className={styles['custom-page-content']}>
                                  <h3
                                    id="spcm-detail-partner"
                                    className={styles['rfx-card-item-title']}
                                  >
                                    {intl
                                      .get(
                                        'spcm.common.view.message.title.contractPartnerInformation'
                                      )
                                      .d('采购协议伙伴信息')}
                                  </h3>
                                  {partnerDs && (
                                    <ContractPartner
                                      key={this.state.contractPartnerKey}
                                      {...partnerListProps}
                                    />
                                  )}
                                </div>
                              </SecondSection>
                              {showSignNodeCrad && (
                                <SecondSection code={this.getSectionCode().SIGNNODE}>
                                  <div className={styles['custom-page-content']}>
                                    <h3
                                      id="spcm-detail-signNode"
                                      className={styles['rfx-card-item-title']}
                                    >
                                      {intl
                                        .get('spcm.common.view.message.title.signNodeInfo')
                                        .d('签署节点信息')}
                                    </h3>
                                    <ContractSignNode {...signNodeProps} />
                                  </div>
                                </SecondSection>
                              )}
                              <SecondSection code={this.getSectionCode().SUBJECT}>
                                <div className={styles['custom-page-content']}>
                                  <h3
                                    id="spcm-detail-subject"
                                    className={styles['rfx-card-item-title']}
                                  >
                                    {intl
                                      .get(`spcm.common.view.message.title.contractSubject`)
                                      .d('协议标的')}
                                  </h3>
                                  {pcSubjectDs && (
                                    <ContractSubject
                                      key={`${this.state.contractSubjectInfoKey}`}
                                      {...contractSubjectListProps}
                                    />
                                  )}
                                </div>
                              </SecondSection>
                              <SecondSection code={this.getSectionCode().STAGE}>
                                <div className={styles['custom-page-content']}>
                                  <h3
                                    id="spcm-detail-stage"
                                    className={styles['rfx-card-item-title']}
                                  >
                                    {intl
                                      .get(`spcm.common.view.message.title.contractStage`)
                                      .d('协议阶段')}
                                  </h3>
                                  {pcStageDs && (
                                    <ContractStage
                                      key={this.state.contractStageKey}
                                      {...contractStageListProps}
                                    />
                                  )}
                                </div>
                              </SecondSection>
                              <SecondSection code={this.getSectionCode().REBATE}>
                                {rebateFlag ? (
                                  <div className={styles['custom-page-content']}>
                                    <h3
                                      id="spcm-detail-rebate"
                                      className={styles['rfx-card-item-title']}
                                    >
                                      {intl
                                        .get('spcm.common.view.message.title.ContractRebate')
                                        .d('返利信息')}
                                    </h3>
                                    <ContractRebate
                                      key={this.state.contractRebateKey}
                                      {...contractRebateProps}
                                    />
                                  </div>
                                ) : (
                                  ''
                                )}
                              </SecondSection>
                              <SecondSection code={this.getSectionCode().BUSINESSTERMS}>
                                {this.renderContractBusinessTerms(contractBusinessTermsListProps)}
                              </SecondSection>
                              {!!enableRule && (
                                <SecondSection code={this.getSectionCode().REBATERULE}>
                                  <div className={styles['custom-page-content']}>
                                    <h3
                                      id="spcm-detail-rule"
                                      className={styles['rfx-card-item-title']}
                                    >
                                      {intl
                                        .get('spcm.common.view.message.title.rebateRule')
                                        .d('优惠规则-返利')}
                                    </h3>
                                    <PreferentialRule key="rebateRule" {...rebateRuleProps} />
                                  </div>
                                </SecondSection>
                              )}
                              {!!enableRule && (
                                <SecondSection code={this.getSectionCode().DISCOUNTRULE}>
                                  <div className={styles['custom-page-content']}>
                                    <h3
                                      id="spcm-detail-discount"
                                      className={styles['rfx-card-item-title']}
                                    >
                                      {intl
                                        .get('spcm.common.view.message.title.dicountRule')
                                        .d('优惠规则-折扣')}
                                    </h3>
                                    <PreferentialRule key="dicountRule" {...discountRuleProps} />
                                  </div>
                                </SecondSection>
                              )}
                              <SecondSection code={this.getSectionCode().CONTRACTREPLENISH}>
                                {this.renderContractReplenish(contractReplenishProps)}
                              </SecondSection>
                              <SecondSection code={this.getSectionCode().TABLEEXTEND}>
                                <div className={styles['custom-page-content']}>
                                  <h3
                                    id="spcm-detail-customRow"
                                    className={styles['rfx-card-item-title']}
                                  >
                                    {intl
                                      .get(`spcm.common.view.message.title.customRowTable`)
                                      .d('自定义行表')}
                                  </h3>
                                  {tableExtendDs && (
                                    <ContractTableExtend {...customRowTableProps} />
                                  )}
                                </div>
                              </SecondSection>
                              <SecondSection code={this.getSectionCode().ATTACHMENT}>
                                <div className={styles['custom-page-content']}>
                                  <h3
                                    id="spcm-detail-attachments"
                                    className={styles['rfx-card-item-title']}
                                  >
                                    {intl
                                      .get(`spcm.common.view.message.title.attachment.tag`)
                                      .d('附件')}
                                  </h3>
                                  {remoteWorkDetail ? (
                                    remoteWorkDetail.render(
                                      'SPCM_WORKSPACE_DETAIL_CONTRACT_ATTACHMENT',
                                      <ContractAttachments {...contractAttachmentsProps} />,
                                      {
                                        current: this,
                                        contractAttachmentsProps,
                                        attachmentProps,
                                      }
                                    )
                                  ) : (
                                    <ContractAttachments {...contractAttachmentsProps} />
                                  )}
                                </div>
                              </SecondSection>
                            </TopSection>
                          </div>
                        </div>
                      )
                  }
                  {/* 文本模式 组建 */}
                  <ContractTextMode
                    {...this.props}
                    refreshData={this.refreshData}
                    handleClickImg={this.handleClickImg}
                    skipToSealManage={this.skipToSealManage}
                    handlePreTextBack={this.handlePreTextBack}
                    state={this.state}
                    hiddenReviewResultFlag={hiddenReviewResultFlag}
                    onChangeState={(params) => this.setState(params)}
                    onRef={(node) => {
                      this.editorOnlineRef = node;
                    }}
                  />
                  {/* 智能审查 组件 */}
                  <ContractReviewTab
                    handleSaveAndSmartReview={this.handleSaveAndSmartReview}
                    textComparisonVisible={textComparisonVisible}
                    pcHeaderId={pcHeaderId}
                    checkDuplicationFlag={checkDuplicationFlag}
                    customizeForm={customizeForm}
                    hiddenReviewResultFlag={hiddenReviewResultFlag}
                    onChangeState={(params) => this.setState(params)}
                  />
                </div>

                {historyCompareFlag && (
                  <ChangeCompare
                    mainContractId={mainContractId}
                    pcHeaderId={pcHeaderId}
                    rebateFlag={rebateFlag}
                    fieldComparison
                    {...this.props}
                  />
                )}
              </Spin>
            </Content>
          </div>
        )}
        {textComparisonVisible && !isIntelligent && (
          <TextComparisonModal {...textComparisonProps} />
        )}
        <OperationRecordDrawer {...operationRecordProps} />
        <ValidateModal {...validateModalProps} />
        {statementModal}
        {isEditorOnlineUpdate && (
          <Modal
            destroyOnClose
            wrapClassName={styles['full-modal-wrapper']}
            bodyStyle={{ height: `${document?.body?.clientHeight - 39}px` }}
            width="100%"
            height={document?.body?.clientHeight || '100vh'}
            visible={isEditorOnlineUpdate}
            onCancel={() =>
              this.setState({
                isEditorOnlineUpdate: false,
              })
            }
            footer={null}
            closable={false}
            title={
              <Button
                icon="shrink"
                style={{ float: 'right' }}
                onClick={() =>
                  this.setState({
                    isEditorOnlineUpdate: false,
                  })
                }
              >
                {intl.get(`hzero.common.button.exitFullScreen`).d('退出全屏')}
              </Button>
            }
          >
            <EditorOnline
              menuCode={CONTRACT_WORKSPACE_MAINTAIN}
              sourcePage="contractMaintain"
              iframeStyle={{
                width: '100%',
                // height: `${document.body.clientHeight}px`,
                height: 'calc(100vh - 50px)',
              }}
              pcHeaderId={pcHeaderId}
              headerInfo={headerInfo}
              fullScreenFlag={fullScreenFlag}
            />
          </Modal>
        )}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  connect(({ contractCommon, contractMaintain, purchaseContractView, loading, global }) => ({
    contractCommon,
    contractMaintain,
    purchaseContractView,
    mobileChapterLoading: loading.effects['contractChapter/confirmMobileChapter'],
    chapterLoading: loading.effects['contractChapter/confirmChapter'],
    menuLeafNode: global.menuLeafNode,
  }))(com);

export { ContractControlDetail, hocFunc };

export default hocFunc(ContractControlDetail);
