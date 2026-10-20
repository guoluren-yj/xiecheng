/* eslint-disable no-param-reassign */
import React, { Component, Fragment } from 'react';
import { routerRedux } from 'dva/router';
import { Badge } from 'choerodon-ui';
import {
  ModalProvider,
  DataSet,
  Spin,
  Modal as c7nModal,
  Lov,
  Button,
  Tooltip,
  Attachment,
  Icon as IconC7N,
} from 'choerodon-ui/pro';
import {
  Collapse,
  Button as ButtonH0,
  Icon,
  Tabs,
  Modal as ModalH0,
  Row,
  Col,
  Form,
  Select,
} from 'hzero-ui';
import querystring from 'querystring';
import { Bind, debounce, Throttle } from 'lodash-decorators';
import classnames from 'classnames';
import {
  noop,
  isArray,
  isEmpty,
  isUndefined,
  cloneDeep,
  isNil,
  map,
  omit,
  throttle,
  isFunction,
} from 'lodash';
import { math } from 'choerodon-ui/dataset';
import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import { getActiveTabKey } from 'utils/menuTab';
import {
  getResponse,
  getEditTableData,
  filterNullValueObject,
  getCurrentTenant,
  getDateTimeFormat,
} from 'utils/utils';
import notification from 'utils/notification';
import { downloadFile } from 'services/api';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
// import Upload from '_components/Upload';

import { DEFAULT_DATE_FORMAT, EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import { useModal } from 'components/Import';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import {
  INQUIRY,
  BID,
  getSourceCategoryName,
  getDocumentTypeName,
  getCheckPriceName,
  getQuotationName,
} from '@/utils/globalVariable';
import {
  isRecord,
  dateFormate,
  isText,
  calculateBasicQty,
  getJumpRoutePrefixUrl,
  getSupplierRelationUrl,
  queryBidFileTemplateConfig,
} from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { updateCollapseActiveKeys } from '@/utils/handleCustomize.js';
import { PageSourceSymbol } from '@/utils/constants.js';

import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import FeedBackBarginHistoryModal from '@/routes/ssrc/QueryQuotation/Detail/FeedBackBarginHistoryModal';
import CommonImportOld from '@/routes/himp/CommonImportNew';
import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import SectionPanel from '@/routes/ssrc/InquiryHall/SectionPanel';
import IPCoincidenceRate from '@/routes/components/IPCoincidenceRate';
import DownloadAttachments from '@/routes/ssrc/components/DownloadAttachments';
import BatchEmptySelectedModal from '@/routes/ssrc/InquiryHall/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/ssrc/InquiryHall/SectionPanel/OperateSectionPromptModal';
import ExchangeEditModal from '@/routes/ssrc/components/ExchangeEditModals/ExchangeEditModal';
import QuoteExchangeMainDateModal from '@/routes/ssrc/components/ExchangeEditModals/QuoteExchangeMainDateModal';
import Iconfont from '@/routes/ssrc/components/Icons'; // 下载至本地的icon
import PopoverButton from '@/routes/components/PopoverButton';
import moneyBook from '@/assets/money-book.svg';
import PreviewScoreManager from '@/routes/ssrc/components/PreviewScoreManager';
import { HOCPriceComparison as PriceComparison } from '@/routes/ssrc/components/PriceComparison';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import useBidAnnouncementModal from '@/routes/ssrc/components/BidAnnouncement';
import useIPDetailModal from '@/routes/components/IPDetails';
import {
  checkPermission,
  bacthSearchTableData,
  fetchConfigSheet,
  checkPriceIntelligentPreReview,
  fetchIntelligentPreReviewResult,
} from '@/services/inquiryHallNewService';
import {
  supplierRelationMapNew,
  selectedItemBatchPolicy,
  pricingSave,
  fetchRfxDetailLayout,
} from '@/services/inquiryHallService';
import {
  queryEnableDoubleUnit,
  fetchEnterpriceRiskControlConfig,
  queryProcessAttachmentConfig,
  queryBacthExpandConfig,
  querySslmLifeCycleConfig,
  queryH0OrC7N,
  queryConfigurationListConfig,
  queryConfigurationOldRate,
} from '@/services/commonService';
import commonStyle from '@/routes/ssrc/common.less';
import { fetchAttachmentCount, fetchExchangeRate } from '@/services/checkPriceNewService';
import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import ChatRoomSourceLink from '@/routes/components/ChatRoomSource/ChatRoomSourceLink';
import IntelligentReviewResult from '@/routes/components/IntelligentPreReview';
import { customPermissionButton, supplierRiskScan } from '../../InquiryHallNew/utils';
import BasicInfoForm from './Header/BasicInfoForm';
import CostRemarkForm from './Header/CostRemarkForm';
import {
  AllQuoteLine,
  AllBidQuoteLine,
  AttachmentWrap,
  ItemLineList,
  ItemLineListBid,
  SupplierLineList,
  SupplierLineListBid,
} from './Tabs';
import {
  basicInfoDS,
  itemOperationDS,
  supplierOperationDS,
  quoteLineOperationDS,
} from './store/headerDS';
import { quoteLineDS } from './store/AllQuoteLineDS';
import { withStandardCompEnhancer } from './standardCompEnhancerCreator';
import PanelTitle from './components/PanelTitle';
import ReturnToPretrial from './components/ReturnToPretrial';
import ProjectInfo from './components/Project';
import BatchMaintainQuoteLine from './components/BatchMaintainQuoteLine';
import PriceClarificationButtons from './components/PriceClarificationButtonsWrap';
import BargainRuleModal from './components/BargainRuleModal';
import PricingModal from './components/PricingModal';
import PricingModalBid from './components/PricingModalBid';
import Resizable from './components/Resizable';
import SupplementaryItemDrawer from './components/SupplementaryItemDrawer';
import {
  createItemDS,
  updateItemDS,
} from './components/SupplementaryItemDrawer/supplementaryItemDS';

import styles from './index.less';
import { selectionInfoMap } from './utils/constants';
// import { urlReg } from './utils/regExpression';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { openModal } = useOperationRecordModal();

const { openBidAnnouncementModal } = useBidAnnouncementModal();
const { openIPDetailModal } = useIPDetailModal();

const aiResultInterval = 15_000; // 智能预审结果查询间隔时间，单位毫秒

class CheckPrice extends Component {
  constructor(props) {
    super(props);
    this.BatchMaintainRef = {};
    this.attachmentTableRef = {};
    this.cuxTabRef = {}; // cux tab ref

    this.applicationScopeModalKey = c7nModal.key();

    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParams,
      feedBackBarginHistoryStatus: false,
      feedBackBarginHistorySearch: {},
      activeKey: 'itemLine', // 默认激活物料行tab
      collapseKeys: ['rfxTitle'], // 展开的折叠面板key
      bucketDirectory: 'ssrc-rfx-rfxheader',
      viewOnly: true, // 是否只读标识位
      checkWay: 'quantity', // 核价方式 默认数量
      chartsLoading: {}, // 图表loading
      id: undefined,
      item: {}, // 历史最低价物品对象
      updateState: false, // state 变更
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      priceDataSource: [], // 物品明报价细折线图数据源
      supplierNameList: [], // 物品明报价细折线图有报价的供应商
      checkAttachmentUuid: null, // header附件
      newList: [], // 提交时为推荐供应商的物料List
      itemLineRecord: {}, // 物品行记录
      currentPaneActiveSelected: {}, // 当前页签下打开列表的表格选择行
      itemLineTableSelectedRows: [], // 物料行表格选择rows
      itemLineTableSelectedKeys: [], // 物料行表格选择kes
      supplierLineTableSelectedRows: [], // 供应商行表格选择rows
      supplierLineTableSelectedKeys: [], // 供应商行表格选择kes
      createItemFlag: null, // 创建物料标识 0/1/2
      currentSelectionPolicy: null, // 询价单选择策略
      chooseSection: false,
      sectionMessageVisible: false,
      processVisible: false,
      operateSectionPromptProps: {},
      readConfig: {}, // 提交是否下次不再提醒的config
      roundConfig: {}, // 发起多轮报价是否下次不再提醒的config
      currentButton: '', // 当前点击的按钮
      chooseSectionBtnShowFlag: false, // 选择标段按钮是否显示标识

      // modal visible state
      operationRecordModalVisible: false, // 操作记录模态框
      returnToPretrialModalVisible: false, // 退回至初审模态框
      priceComparisonModalVisible: true, // 比价助手模态框
      viewLadderLevelVisible: false, // 阶梯报价模态框
      viewPriceChartsVisible: false, // 物品明报价细折线图
      pricingModalVisible: false, // 是否弹出中心弹窗
      ipCoincidenceRateVisible: false, // ip重合率弹框
      onlineBargainVisible: false, // 议价方式的弹窗
      exchangeEditModalVisible: false, // 汇率编辑modal
      exchangeEditContentModalVisible: false, // 汇率编辑引用汇率主数据modal
      // popConfirmFlag: false, // 是否显示浮窗
      quotationDetailVisible: false, // 报价明细
      batchMaintainQuoteLineVisible: false, // 批量维护报价行表单
      batchEmptySelectedModalVisible: false,

      // 个性化列
      hasChangePercentField: null, // 是否配置涨跌幅列, 默认为null, 查询个性化接口后设置为 false/true
      hasMinPriceField: null, // 是否配置最低价, 默认为null, 查询个性化接口后设置为 false/true
      hasNewPriceField: null, // 是否配置最新价, 默认为null, 查询个性化接口后设置为 false/true
      custFields: null, // 个性化列
      btnLoading: false, // 取价时保存提交按钮loading
      CheckPermissionObject: {}, // 权限集
      doubleUnitFlag: false, // 判断是否开启双单位
      // riskScanFlag: false, // 判断租户是否购买“风险监控”/“风险扫描”服务，若未购买，则隐藏按钮；若购买，则显示按钮
      enterpriceRiskControllerButtonsVisible: {
        RELATION_MINING: 0, // 关系图谱（关系挖掘）
        RISK_SCAN: 0, // 风险扫描
      },
      itemActivePanel: [],
      supplierActivePanel: [],
      itemExpand: {},
      supplierExpand: {},
      priceModalBatchSelectionStrategy: '',
      lovSearchPlaceholder: intl
        .get('ssrc.inquiryHall.model.inquiryHall.ItemCodeSearch')
        .d('请输入物料编码'),
      searchMatcher: 'itemCodes',
      supplierLovSearchPlaceholder: intl
        .get('ssrc.inquiryHall.model.inquiryHall.supplierCodeSearch')
        .d('请输入供应商编码'),
      supplierSearchMatcher: 'supplierNums',
      itemSelectedPolicyChangeFlag: false,
      fixedFlag: false, // 是否Tab固定在最上面
      itemLinePageSize: 10,
      supplierLinePageSize: 10,
      pageLoading: false,
      batchSearchData: [],
      batchSearchDataKeys: [],
      openExpandAllFlag: false, // 是否可用一键展开/收起
      searchPriceLoading: false, // 是否全部价格库字段查询完
      clickAllFlag: false, // 手动点开最后一个
      showExchangeEdit: false, // 汇率编辑默认不显示
      sslmLifeCycleFlag: true,
      // biddingHallFlag: false, // 是否开启竞价大厅配置
      inquiryAgainFlag: false, // 再次询价显隐标识
      bargainNewFlag: false, // 议价
      newFunctionFlag: false,
      _timestamp: '', // 风险关系时间戳
      fileTemplateManageFlag: 0, // 招标文件tab
      useNewRateFlag: 0, // 是否使用老重合率标识
      operationLoading: false,
      aiResultData: {},
    };
    this.tabRef = React.createRef();
    this.containerRef = React.createRef();
    this.aiResultTimer = null;
  }

  activeTabKey = getJumpRoutePrefixUrl(this.props.location.pathname);

  bidFlag = this.props.sourceKey === BID;

  quotationName = getQuotationName(this.bidFlag);

  sourceKey = this.bidFlag ? 'NEW_BID' : INQUIRY;

  rfxHeaderId = this.props.match.params.rfxId;

  openC7nProcessAttachmentModal = openC7nProcessAttachmentModal({ rfxHeaderId: this.rfxHeaderId });

  basicInfoDs = new DataSet(
    this?.props.remote
      ? this?.props.remote.process(
          'SSRC_CHECK_PRICE_BasicInfoDs',
          basicInfoDS({ rfxHeaderId: this.props.match.params.rfxId, sourceKey: this.sourceKey }),
          { that: this }
        )
      : basicInfoDS({ rfxHeaderId: this.props.match.params.rfxId, sourceKey: this.sourceKey })
  );

  quoteLineDS = quoteLineDS({
    rfxHeaderId: this.props.match.params?.rfxId,
    sourceKey: this.sourceKey,
    handleAllQuoteQuery: this.handleAllQuoteQuery,
  });

  quoteLineDsProps = {
    ...this.quoteLineDS,
    events: {
      ...this.quoteLineDS.events,
      load: ({ dataSet, data }) => {
        if (typeof this.quoteLineDS.events?.load === 'function') {
          this.quoteLineDS.events.load({ dataSet, data });
        }
        if (this.state.searchPriceLoading) {
          this.judgeFieldExistAndQuery(
            'changePercent',
            { page: dataSet.currentPage - 1, size: dataSet.pageSize },
            dataSet.toData(),
            dataSet
          );
          this.judgeFieldExistAndQuery(
            'minPrice',
            { page: dataSet.currentPage - 1, size: dataSet.pageSize },
            dataSet.toData(),
            dataSet
          );
          this.judgeFieldExistAndQuery(
            'newPrice',
            { page: dataSet.currentPage - 1, size: dataSet.pageSize },
            dataSet.toData(),
            dataSet
          );
        } else {
          dataSet.forEach((record) => {
            // if (this.priceDataObj[record.get('quotationLineId')]) {
            //   // eslint-disable-next-line no-param-reassign
            //   record.data.changePercent = this.priceDataObj[
            //     record.get('quotationLineId')
            //   ].changePercent;
            //   record.data.minPrice = this.priceDataObj[record.get('quotationLineId')].minPrice;
            //   record.data.newPrice = this.priceDataObj[record.get('quotationLineId')].newPrice;
            // }

            const { remote } = this.props || {};
            const quotationLineId = record.get('quotationLineId');
            if (!quotationLineId) {
              return;
            }

            const currentPriceData = this.priceDataObj[quotationLineId] || {};
            const { data: currentRecordData = {} } = record || {};

            if (currentPriceData) {
              const { changePercent, minPrice, newPrice } = currentPriceData || {};
              let newLineValues = { changePercent, minPrice, newPrice };
              newLineValues = remote
                ? remote.process(
                    'SSRC_CHECK_PRICE_PROCESS_QUOTATION_LINE_DS_LOAD_EVENT_PRICE_LIBRARY_VALUES',
                    newLineValues,
                    {
                      that: this,
                      record,
                      currentPriceData,
                    }
                  )
                : newLineValues;
              newLineValues = newLineValues || {};

              record.data = {
                ...(currentRecordData || {}),
                ...newLineValues,
              };
            }
          });
        }
      },
    },
  };

  quoteLineDs = new DataSet(
    this.props.remote
      ? this.props.remote.process('SSRC_CHECK_PRICE_PROCESS_ALL_TABLE_DS', this.quoteLineDsProps, {
          bidFlag: this.bidFlag,
          basicInfoDs: this.basicInfoDs,
          rfxHeaderId: this.props.match.params?.rfxId,
          sourceKey: this.sourceKey,
          handleAllQuoteQuery: this.handleAllQuoteQuery,
          queryPageMainData: this.queryPageMainData,
          that: this,
        })
      : this.quoteLineDsProps
  );

  itemOperationDs = new DataSet(itemOperationDS({ rfxHeaderId: this.props.match.params?.rfxId }));

  supplierOperationDs = new DataSet(
    supplierOperationDS({
      rfxHeaderId: this.props.match.params?.rfxId,
      basicInfoDs: this.basicInfoDs,
    })
  );

  quoteLineOperationDs = new DataSet(
    quoteLineOperationDS({
      rfxHeaderId: this.props.match.params?.rfxId,
      basicInfoDs: this.basicInfoDs,
    })
  );

  // ----------------------------
  // 公共DS，以方便后续二开使用
  commonDs = this.props.remote
    ? this.props.remote.process('SSRC_CHECK_PRICE_PROCESS_COMMON_DS', null, {
        rfxHeaderId: this.props.match.params?.rfxId,
      })
    : null;
  // ---------------------------

  bargainRuleModalRef = null; // 议价规则ref

  itemLineList = null; // 物料行列表ref

  supplierLineList = null; // 供应商行列表ref

  sectionInfo = {}; // section panel ref

  BatchEmptySectionRef = {};

  exchangeRate = null; // 引用汇率编辑modal ref

  allQuoteLineRef = React.createRef();

  openModal = useModal().openModal;

  componentDidMount() {
    const { remote } = this.props;
    const { routerParams } = this.state;
    Promise.all([
      this.addAllPageRefreshToWindow(),
      this.queryDoubleUnit(),
      this.fetchQueryUnitCustConfig(),
      this.dealCustActiveTabKey(),
      this.fetchLineCheckPermission(),
      this.handeleSearchQuerySourceExchangeRateConfig(),
      this.enterpriceRiskControllerButtonConfig(),
      this.handeleSearchProcessAttachmentConfig(),
      this.handeleSearchExpandAllConfig(),
      this.handeleSearchSslmLifeCycleConfig(),
      this.fetchInquiryAgainConfig(),
      this.handeleSearchConfigurationListConfig(),
      this.queryFileTemplateManageSheetConfig(),
      this.fetchH0OrC7N(),
      this.fetchUseOldRate(),
      this.fetchIntelligentPreReview(),
    ]);
    window.addEventListener('scroll', this.handleScroll, true);
    if (routerParams.projectLineSectionId) {
      Promise.all([this.fetchBatchRoundQuotationConfig(), this.fetchBatchSubmitConfig()]);
    }
    const eventProps = {
      object: this,
    };
    if (remote?.event) {
      remote.event.fireEvent('queryNewCheckPriceConfigEvent', eventProps);
    }

    this.afterLoadedPageCuxReservedHandle();
  }

  togglePageLoading = (loading = false) => {
    this.setState({
      operationLoading: loading,
    });
  };

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

  // 页面加载后给二开埋点
  afterLoadedPageCuxReservedHandle = () => {
    const { remote } = this.props;

    if (remote?.event) {
      const eventProps = {
        that: this,
        bidFlag: this.bidFlag,
      };
      remote.event.fireEvent('afterLoadedPageCuxHandle', eventProps);
    }
  };

  // 查询再次询价配置表
  @Bind()
  async fetchInquiryAgainConfig() {
    const { organizationId } = this.props;
    try {
      const res = await fetchConfigSheet({
        configCode: 'ssrc_rfx_round_tenant_config',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      const data = getResponse(res);
      if (!isEmpty(data)) {
        this.setState({ inquiryAgainFlag: true });
      }
    } catch (e) {
      throw e;
    }
  }

  // 查询招标文件模板管理配置
  queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    this.setState({
      fileTemplateManageFlag: flag,
    });
  };

  /**
   * 查询使用新汇率编辑配置表
   */
  @Bind()
  async handeleSearchQuerySourceExchangeRateConfig() {
    const {
      match: { params },
    } = this.props;

    const { rfxId } = params || {};
    idValidation(rfxId);

    this.setState({
      pageLoading: true,
    });
    try {
      const res = getResponse(await fetchExchangeRate({ sourceHeaderId: params.rfxId }));
      if (res) {
        if (res.autoExchangeRateFlag === 0) {
          this.setState({
            showExchangeEdit: true,
          });
        }
        this.queryPageMainData();
      }
    } finally {
      this.setState({
        pageLoading: false,
      });
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

  // 查询配置表--是否启用竞价大厅
  // fetchBiddingHallConfig = async () => {
  //   const { organizationId } = this.props;
  //   let data = null;

  //   try {
  //     data = await fetchConfigSheet({
  //       configCode: 'ssrc_rfa_tenant_config',
  //       organizationId,
  //       data: {
  //         tenant: getCurrentTenant().tenantNum,
  //       },
  //     });
  //     data = getResponse(data);
  //     if (!isEmpty(data)) {
  //       this.setState({ biddingHallFlag: true });
  //     }
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  async queryAttachmentCount(newCheckFlag) {
    const {
      match: { params },
    } = this.props;

    const { rfxId } = params || {};
    idValidation(rfxId);

    const result = getResponse(
      await fetchAttachmentCount({ rfxHeaderId: params.rfxId, newCheckFlag: newCheckFlag ? 1 : 0 })
    );
    if (result) {
      this.setState({
        attachmentCount: Number(result?.fileCount || 0) > 99 ? '99+' : result?.fileCount,
      });
    }
  }

  queryPriceField() {
    this.setState({
      searchPriceLoading: true,
    });
    Promise.all([
      this.judgeFieldExistAndQuery('changePercent', { page: 0, size: 10 }, [], []),
      this.judgeFieldExistAndQuery('minPrice', { page: 0, size: 10 }, [], []),
      this.judgeFieldExistAndQuery('newPrice', { page: 0, size: 10 }, [], []),
    ]).then(() => {
      this.setState({
        searchPriceLoading: false,
      });
    });
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

  /**
   * 查询一键展开配置表
   */
  async handeleSearchExpandAllConfig() {
    const result = getResponse(await queryBacthExpandConfig());
    if (result) {
      this.setState({
        openExpandAllFlag: !!result?.length,
      });
    }
  }

  /**
   * 查询开启新360页面的租户
   */
  async handeleSearchSslmLifeCycleConfig() {
    const result = getResponse(await querySslmLifeCycleConfig());
    if (result) {
      this.setState({
        sslmLifeCycleFlag: !!result?.length,
      });
    }
  }

  /**
   * 查询是否使用新功能
   */
  async handeleSearchConfigurationListConfig() {
    const result = getResponse(await queryConfigurationListConfig());
    if (result) {
      this.setState({
        newFunctionFlag: !result?.length,
      });
    }
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params: prevParams = {} },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.rfxId || null;
    const id = params.rfxId || null;
    return prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.handeleSearchQuerySourceExchangeRateConfig();
    }
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
      this.quoteLineDs.setState('doubleUnitFlag', !!Number(res));
    }
  };

  // 全局页面刷新，个性化弹窗二开使用
  addAllPageRefreshToWindow = () => {
    const SsrcCheckPriceRefreshAllPage = () => {
      Promise.all([
        this.fetchSettingAndLovData(),
        this.queryHeaderInfo(),
        this.fetchItemLine(),
        this.fetchSupplierLine(),
        this.fetchQuoteLine(),
        this.fetchQueryUnitCustConfig(),
      ]);
    };

    // 清空物料/供应商tab下缓存的数据
    const SsrcCheckPriceClearAllPage = () => {
      if (this && this.itemLineList) {
        this.itemLineList.setState({
          isShow: {},
        });
        this.setState({
          itemActivePanel: [],
          itemExpand: {},
        });
        this.itemLineList.itemLineTable = {};
      }
      if (this && this.supplierLineList) {
        this.supplierLineList.setState({
          isShow: {},
        });
        this.setState({
          supplierActivePanel: [],
          supplierExpand: {},
        });
        this.supplierLineList.supplierLineTable = {};
      }
    };

    window.SsrcCheckPriceClearAllPage = SsrcCheckPriceClearAllPage;
    window.SsrcCheckPriceRefreshAllPage = SsrcCheckPriceRefreshAllPage;
  };

  /**
   * 需要等到个性化接口查询完成后, custConfig中才会有值
   */
  // componentDidUpdate(prevProps) {
  //   if (prevProps.custLoading && prevProps.custLoading !== this.props.custLoading) {
  //     // 由true => false
  //     this.dealCustActiveTabKey();
  //   }
  // }

  /**
   * 组件销毁，清空状态树中得值
   */
  componentWillUnmount() {
    const { modelName = 'inquiryHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemLine: [],
        supplierLine: [],
        quotaLadderLevelData: [],
        supplierQuoteLinePagination: {},
        exchangeEditSupplierList: [],
        exchangeEditSupplierPagination: {},
      },
    });
    window.SsrcCheckPriceRefreshAllPage = null;
    window.removeEventListener('scroll', this.handleScroll, true);
    this.clearAIResultTimer();
  }

  lastFiexedTop = 0;

  @Throttle(500)
  @Bind()
  handleScroll() {
    if (this.tabRef.current?.getBoundingClientRect) {
      const { top } = this.tabRef.current?.getBoundingClientRect();
      const { fixedFlag } = this.state;
      const active = getJumpRoutePrefixUrl(getActiveTabKey());
      if (active === '/ssrc/new-inquiry-hall') {
        if (top < 156 && !fixedFlag && this.lastFiexedTop !== top) {
          this.lastFiexedTop = top;
          this.setState(
            {
              fixedFlag: true,
            },
            () => {
              this.calcTabWidth();
            }
          );
        }
        if (top >= 156 && fixedFlag && this.lastNoFiexedTop !== top) {
          this.lastNoFiexedTop = top;
          this.setState({
            fixedFlag: false,
          });
        }
      } else {
        this.setState({
          fixedFlag: false,
        });
      }
    }
  }

  @Bind()
  @debounce(50)
  calcTabWidth() {
    // 用js实现 width: -webkit-fill-available;的效果，处理兼容性问题
    const element =
      this.containerRef.current?.getElementsByClassName(`${styles.fixedTabStyle}`)[0] || {};
    const parentWidth = element.offsetWidth;
    if (element.firstElementChild) {
      element.firstElementChild.style.width = `${parentWidth}px`;
    }
  }

  // 查询个性化单元配置
  async fetchQueryUnitCustConfig() {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    const unitCode = `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`;
    const custUnitConfig = await dispatch({
      type: `${modelName}/fetchQueryUnitCustConfig`,
      payload: {
        organizationId,
        unitCode,
      },
    });
    if (custUnitConfig && custUnitConfig[unitCode]) {
      // 判断是否有配置个性化字段且visible为1
      const { fields = [] } = custUnitConfig[unitCode];
      this.setState(
        {
          custFields: fields,
        },
        () => {
          this.queryPriceField(); // 价格库字段
        }
      );
    }
  }

  /**
   * 获取核价方式 - [威奇达] 二开, 请谨慎修改!!!
   * @protected
   * */
  @Bind()
  fetchCheckWay() {
    const {
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
      match: { params = {} },
    } = this.props;
    const checkPriceWay = dispatch({
      type: `${modelName}/fetchRfxDetailLayout`,
      payload: {
        organizationId,
        configKey: 'checkPriceWay',
      },
    });
    const checkPriceWaySingle = dispatch({
      type: `${modelName}/fetchRfxDetailLayoutSingle`,
      payload: {
        organizationId,
        configKey: `checkPriceWay#${params.rfxId}`,
      },
    });

    Promise.all([checkPriceWay, checkPriceWaySingle]).then((res) => {
      if (res.some((item) => !item)) {
        return;
      }
      this.setCheckWay(isEmpty(res[1]) ? res[0] : res[1]);
    });
  }

  /**
   * 获取行上面的权限集的返回数据
   * @memberof 迁移未merge代码
   */
  async fetchLineCheckPermission() {
    const {
      match: { path },
    } = this.props;
    const CheckPermissionObject = {};
    const permissionCode = `${path}.button.batchimportnew`;
    const newPermissionCode = permissionCode
      .replace(/^\//g, '')
      .replace(/\//g, '.')
      .replace(/:/g, '-')
      .replace('rfxId', 'rfxid');
    const permissionList = [
      newPermissionCode,
      'srm.partner.suplier-lifecycle.management.ps.default',
    ];
    const result = getResponse(await checkPermission(permissionList));
    if (result && !result.failed) {
      result.forEach((item = {}) => {
        const { code = null } = item;
        if (!code) {
          return;
        }
        let newCode = code;
        switch (code) {
          case 'srm.partner.suplier-lifecycle.management.ps.default':
            newCode = 'supplierLifecyclePermission';
            break;
          default:
            newCode = newCode.substr(code.lastIndexOf('.') + 1);
        }
        CheckPermissionObject[newCode] = item;
      });
      this.setState({ CheckPermissionObject });
    }
  }

  @Bind()
  fetchBatchRoundQuotationConfig() {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    // eslint-disable-next-line no-unused-expressions
    dispatch({
      type: `${modelName}/fetchSectionRoundQuotation`,
      payload: {
        organizationId,
        configKey: 'sectionStartRoundQuotation',
      },
    })?.then((res) => {
      if (!res) {
        return;
      }
      const { configKey, configValue = '' } = res;
      if (configKey !== 'sectionStartRoundQuotation' || !configValue) {
        return;
      }
      this.setState({
        roundConfig: res,
      });
    });
  }

  // 还比价历史
  @Bind()
  onComparePriceHistory(record) {
    const { quotationLineId, companyName: supplierCompanyName, itemCode, itemName } = record.get([
      'quotationLineId',
      'companyName',
      'itemCode',
      'itemName',
    ]);
    this.setState({
      feedBackBarginHistorySearch: {
        rfxId: this.rfxHeaderId,
        quotationLineId,
        supplierCompanyName,
        itemCode,
        itemName,
      },
      feedBackBarginHistoryStatus: true,
    });
  }

  @Bind()
  async fetchBatchSubmitConfig() {
    const { organizationId } = this.props;

    let result = null;
    try {
      result = await fetchRfxDetailLayout({
        organizationId,
        configKey: 'sectionCheckPrice',
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      const { configKey, configValue = '' } = result || {};
      if (configKey !== 'sectionCheckPrice' || !configValue) {
        return;
      }
      this.setState({
        readConfig: result,
      });
    } catch (e) {
      throw e;
    }

    // dispatch({
    //   type: `${modelName}/fetchSectionBatchSubmit`,
    //   payload: {
    //     organizationId,
    //     configKey: 'sectionCheckPrice',
    //   },
    // })?.then((res) => {
    //   if (!res) {
    //     return;
    //   }
    //   const { configKey, configValue = '' } = res;
    //   if (configKey !== 'sectionCheckPrice' || !configValue) {
    //     return;
    //   }
    //   this.setState({
    //     readConfig: res,
    //   });
    // });
  }

  /**
   * 处理个性化Tabs时, 需要同步activeKey, 因为个性化只是覆盖默认的defaultActiveKey, 并不会改变activeKey
   */
  dealCustActiveTabKey = () => {
    this.handleAllQuoteLineDSCustomize();
    this.handleCollapseActiveKeys();

    const field =
      this.props.getHocInstance?.().custConfig[
        `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEMSINFO_TABS`
      ]?.fields || [];
    const { fieldCode } = field.find((item) => item.defaultActive === 1) || {};
    if (fieldCode) {
      this.setState({
        activeKey: fieldCode,
      });
    } else {
      const sortField =
        // eslint-disable-next-line array-callback-return
        field.sort((a, b) => {
          if (a?.seq < b?.seq) {
            return -1;
          }
          return null;
        }) || [];
      this.setState({
        activeKey: sortField.find((item) => item.visible)?.fieldCode || this.state?.activeKey,
      });
    }
  };

  /**
   * 全部报价明细个性化
   * `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`
  */
  handleAllQuoteLineDSCustomize = () => {
    const { getHocInstance } = this.props;
    let allCustomizeConfigs = getHocInstance ? getHocInstance().custConfig : [];
    allCustomizeConfigs = allCustomizeConfigs || [];
    const configObj = allCustomizeConfigs[
      `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`
    ] || {};
    const { pageSize } = configObj;

    if (!pageSize) {
      return;
    }

    this.quoteLineDs.pageSize = pageSize;
  };

  // collapse
  handleCollapseActiveKeys = () => {
    const { custConfig } = this.props;
    const { collapseKeys } = this.state;

    const { tenantChangeFlag, newKeys = [] } =
      updateCollapseActiveKeys({
        custConfig,
        oldKeys: collapseKeys,
        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_COLLAPSE`,
      }) || {};

    if (tenantChangeFlag) {
      this.setState({
        collapseKeys: newKeys,
      });
    }
  };

  // 查询企业是否开通 [ 风险扫描，关系图谱，找关系, ..., ]等服务
  enterpriceRiskControllerButtonConfig = async () => {
    const { organizationId } = this.props;
    let result = null;

    const params = {
      organizationId,
      applicationCode: 'AP_CREDIT',
      serviceCode: 'RELATION_MINING,RISK_SCAN', // 关系图谱 风险扫描,
    };

    try {
      result = await fetchEnterpriceRiskControlConfig(params);
      result = getResponse(result || isEmpty(result));
      if (!result) {
        return;
      }
      this.setState({
        enterpriceRiskControllerButtonsVisible: result,
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * 查询页面主数据
   */
  @Bind()
  queryPageMainData() {
    const { remote } = this.props;
    const searchLineAfterHeaderFlag = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_SEACHERLINEAFTERHEADER', false, {
          bidFlag: this.bidFlag,
        })
      : false;
    this.fetchSettingAndLovData();
    if (!searchLineAfterHeaderFlag) {
      this.queryHeaderInfo();
      this.fetchLineData();
    } else {
      this.queryHeaderInfo().then(() => {
        this.fetchLineData();
      });
    }
  }

  fetchLineData() {
    this.clearAllTable(null, '1');
    this.fetchItemLine();
    this.fetchSupplierLine();
    this.fetchQuoteLine();
  }

  /**
   * 查询头数据 - 此方法被 [克明面业] 重写, 请谨慎修改!!!
   * @protected
   */
  async queryHeaderInfo() {
    const {
      organizationId,
      match: { params },
      remote,
    } = this.props;

    // 校验头id
    const { rfxId } = params || {};
    idValidation(rfxId);

    let projectLineSectionIds = null;
    if (this.sectionInfo.isSectionListEmpty && !this.sectionInfo.isSectionListEmpty()) {
      const ids = this.sectionInfo.getAllSectionList().map((item) => item.projectLineSectionId);
      projectLineSectionIds = ids.join();
    }
    const queryParams = {
      organizationId,
      projectLineSectionIds,
      rfxHeaderId: params.rfxId,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ATTACHMENT`,
    };
    this.basicInfoDs.setQueryParameter('queryParams', queryParams);
    const res = getResponse(await this.basicInfoDs.query());
    if (res) {
      this.basicInfoDs.loadData([res]);
      this.quoteLineDs.setState('auctionDirection', res?.auctionDirection || '');
      const {
        onlyAllowAllWinBids = 0, // 模板配置允许整单中标
      } = res || {};

      const setDefaultCheckWay = remote
        ? remote.process('SSRC_CHECK_PRICE_PROCESS_DEFAULT_CHECK_WAY', false)
        : false;
      const cuxOnlyAllowAllWinBids = remote
        ? remote.process('SSRC_CHECK_PRICE_PROCESS_ONLY_ALLOW_ALL_WINDBIDS', false)
        : false;

      // 此处合并setState, 异步set 会触发多次渲染
      this.setState(
        Object.assign(
          {
            checkAttachmentUuid: res.checkAttachmentUuid || uuidv4(),
          },
          onlyAllowAllWinBids &&
            (setDefaultCheckWay || {
              checkWay: 'ratio',
              activeKey: 'supplierLine',
            })
        )
      );
      if (onlyAllowAllWinBids && !cuxOnlyAllowAllWinBids) {
        // 给全部报价明细ds设置checkWay
        this.quoteLineDs.setState('checkWay', 'ratio');
      } else {
        this.fetchCheckWay();
      }
      if (remote?.event) {
        const eventProps = {
          basicInfoDs: this.basicInfoDs,
          current: this,
          bidFlag: this.bidFlag,
        };
        remote.event.fireEvent('afterQueryHeaderInfoFunc', eventProps);
      }
    }
    return res;
  }

  /**
   * 查询头信息 - 为了规避二开通过 `super` 调用父方法 bug
   */
  @Bind()
  async fetchHeaderInfo() {
    return this.queryHeaderInfo();
  }

  /**
   * 查询配置/值集等数据
   */
  fetchSettingAndLovData() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const lovCodes = {
      selectedPolicy: this.bidFlag
        ? 'SSRC.NEW_BID_SELECTION_STRATEGY'
        : 'SSRC.RFX_SELECTION_STRATEGY', // 选择策略
      sourceType: 'SSRC.BARGAIN_METHOD', // 议价方式
      quoteLineSelectionStrategy: 'SSRC.QUICK_CHOOSE_STRATEGY', // 全部报价明细选择策略
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
    // 查询配置中心
    dispatch({
      type: `${modelName}/querySetting`,
      payload: {
        '011107': '011107', // ip校验
      },
    });
  }

  /**
   * 物品明细 - 查询
   * @protected
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      organizationId,
      match: { params },
      dispatch,
      modelName = 'inquiryHall',
      remote,
    } = this.props;

    idValidation(params.rfxId);

    const items = this.itemOperationDs?.current?.toData() || {};
    const rfxLineItemIds = (items?.checkItems || []).map((item) => item.rfxLineItemId).toString();
    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        rfxLineItemIds,
      },
    }).then((res) => {
      const eventProps = {
        res,
        current: this,
        bidFlag: this.bidFlag,
        handleClickExpandAll: this.handleClickExpandAll,
      };
      if (remote?.event) {
        remote.event.fireEvent('setItemActivePanel', eventProps);
      }
    });
  }

  /**
   * 供应商列表 - 查询 - [番缆服务] 二开, 谨慎修改!!!
   * @protected
   */
  @Bind()
  async fetchSupplierLine(page = {}) {
    const {
      organizationId,
      match: { params },
      dispatch,
      modelName = 'inquiryHall',
      remote,
    } = this.props;

    idValidation(params.rfxId);

    const items = this.supplierOperationDs?.current?.toData() || {};
    // 获取供应商筛选框筛选的供应商
    const rfxLineSupplierIds = (items?.checkSuppliers || [])
      .map((item) => item.rfxLineSupplierId)
      .toString();
    return dispatch({
      type: `${modelName}/fetchSupplierLineCheckPrice`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxLineSupplierIds,
      },
    }).then((res) => {
      const eventProps = {
        res,
        current: this,
        bidFlag: this.bidFlag,
      };
      if (remote?.event) {
        remote.event.fireEvent('setSupplierActivePanel', eventProps);
      }
      return res;
    });
  }

  @Bind()
  changeItemCollapse(active) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { itemLine = [] },
    } = this.props;
    const { itemActivePanel = [] } = this.state;

    this.setState({
      itemActivePanel: active,
      expandAllFlag: active.length === itemLine.length,
      clickAllFlag:
        active.length === itemLine.length && itemActivePanel.length + 1 === active.length,
    });
  }

  @Bind()
  changeSupplierCollapse(active) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { supplierLine = [] },
    } = this.props;
    const { supplierActivePanel = [] } = this.state;
    this.setState({
      supplierActivePanel: active,
      expandAllFlag: active.length === supplierLine.length,
      clickAllFlag:
        active.length === supplierLine.length && supplierActivePanel.length + 1 === active.length,
    });
  }

  @Bind()
  getContainerRef(ref = {}) {
    this.scrollerContainerRef = ref?.current;
  }

  /**
   * 获取表格数据rfxLineItemId
   */
  @Bind()
  clickItemCollapseChange(e, item, scrollTo) {
    const { itemExpand } = this.state;
    const { isShow } = this.itemLineList.state;
    if (!isShow[item.rfxLineItemId]) {
      this.itemLineList?.setState({ rfxLineItemId: item.rfxLineItemId });
    }

    if (scrollTo && this.scrollerContainerRef) {
      this.scrollerContainerRef.scrollTo(0, this.scrollerContainerRef.scrollTop + 1);
    }

    this.setState({
      itemExpand: {
        ...itemExpand,
        [item.rfxLineItemId]: !itemExpand[item.rfxLineItemId],
      },
      expandAllFlag: false,
    });
    this.itemLineList?.setState({
      isShow: {
        ...isShow,
        [item.rfxLineItemId]: true,
      },
    });
    this.changeCurrentPaneActiveSelected([], item.rfxLineItemId);
  }

  /**
   * 获取表格数据
   */
  @Bind()
  clickSupplierCollapseChange(e, item, scrollTo) {
    const { supplierExpand } = this.state;
    const { isShow } = this.supplierLineList.state;
    if (!isShow[item.rfxLineSupplierId]) {
      // 打开新的 Pane
      this.supplierLineList.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    }
    if (scrollTo && this.scrollerContainerRef) {
      this.scrollerContainerRef.scrollTo(0, this.scrollerContainerRef.scrollTop + 1);
    }
    this.setState({
      supplierExpand: {
        ...supplierExpand,
        [item.rfxLineSupplierId]: !supplierExpand[item.rfxLineSupplierId],
      },
      expandAllFlag: false,
    });
    this.supplierLineList.setState({
      isShow: {
        ...isShow,
        [item.rfxLineSupplierId]: true,
      },
    });
    this.changeCurrentPaneActiveSelected([], item.rfxLineSupplierId);
  }

  /**
   * 查询全部报价页签列表数据
   * @protected
   */
  @Bind()
  async fetchQuoteLine() {
    // eslint-disable-next-line no-unused-expressions
    this.quoteLineDs?.query();
  }

  @Bind()
  handleAllQuoteQuery(data) {
    const res = getResponse(data);
    return res;
  }

  priceDataObj = {};

  /**
   * 判断个性化列是否配置
   * @param {string} fieldName - 列名
   * @param {Object} page - 分页对象
   * @param {Array} res - 接口返回数据源
   * [永祥] 二开, 请谨慎修改!!!
   * @protected
   */
  judgeFieldExistAndQuery = async (fieldName, page, res = [], ds = []) => {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
      remote,
    } = this.props;
    const pascalFieldName = fieldName.replace(
      fieldName.charAt(0),
      fieldName.charAt(0).toUpperCase()
    ); // Pascal命名法
    const { custFields, [`has${pascalFieldName}Field`]: hasField } = this.state;

    const { rfxId } = params || {};
    idValidation(rfxId);

    let serviceCode;
    switch (fieldName) {
      case 'changePercent':
        serviceCode = 'RFX_LINE_CHANGE_PERCENT';
        break;
      case 'minPrice':
        serviceCode = 'SSRC_MIN_PRICE';
        break;
      case 'newPrice':
        serviceCode = 'SSRC_NEW_PRICE';
        break;
      default:
        break;
    }
    if (hasField === false) return; // 未配置个性化列

    const result = (searchFlag) => {
      return searchFlag
        ? dispatch({
            type: `${modelName}/fetchQueryCheckPriceInfo`,
            payload: {
              page,
              fieldName,
              organizationId,
              quotationDetail: {
                serviceCode,
                sourceFrom: 'RFX',
                templateVersion: null,
                templateCode: null,
                tenantId: organizationId,
                findRecFlag: null,
                sourceHeaderId: params.rfxId,
                priceQueryParamsVOS: res?.map?.((r) => ({
                  quotationLineId: r.quotationLineId,
                })),
              }, // 报价行
            },
          })
        : null;
    };
    let resultPromise = null;
    if (hasField) {
      // 应该不会触发
      this.setState({
        btnLoading: true,
      });
      resultPromise = result(true);
      resultPromise
        .then((r) => {
          if (Array.isArray(r) && r.length > 0) {
            const list = {};
            r.forEach((item) => {
              if (item.quotationLineId) {
                list[item.quotationLineId] = item;
                this.priceDataObj[item.quotationLineId] = {
                  ...item,
                  ...(this.priceDataObj[item.quotationLineId] || {}),
                  [fieldName]: item.value,
                };
              }
            });
            ds.forEach((record) => {
              // eslint-disable-next-line no-unused-expressions
              list[record.get('quotationLineId')] &&
                (record.data[fieldName] = list[record.get('quotationLineId')].value); //  fieldName  quotationLineId value
            });
          }
        })
        .finally(() => {
          this.setState({
            btnLoading: false,
          });
        });
    } else {
      // 第一次进入为 `null`
      const index =
        isArray(custFields) &&
        custFields.findIndex((item) => item.fieldCode === fieldName && item.visible === 1);
      if (index > -1) {
        this.setState({
          btnLoading: true,
        });
        resultPromise = result(true);
        resultPromise
          .then((r) => {
            if (Array.isArray(r) && r.length > 0) {
              const list = {};
              r.forEach((item) => {
                if (item.quotationLineId) {
                  list[item.quotationLineId] = item;
                  this.priceDataObj[item.quotationLineId] = {
                    ...item,
                    ...(this.priceDataObj[item.quotationLineId] || {}),
                    [fieldName]: item.value,
                  };
                }
              });
              ds.forEach((record) => {
                // eslint-disable-next-line no-unused-expressions
                list[record.get('quotationLineId')] &&
                  (record.data[fieldName] = list[record.get('quotationLineId')].value);
              });
            }
          })
          .finally(() => {
            this.setState({
              btnLoading: false,
            });
          });
        this.setState({
          [`has${pascalFieldName}Field`]: true,
        });
      } else {
        this.setState({
          [`has${pascalFieldName}Field`]: false,
        });
      }
    }

    if (remote?.event) {
      await remote.event.fireEvent('remoteJudgeFieldExistAndQueryLaterOperate', {
        that: this,
        fieldName,
        res,
        ds,
        pascalFieldName,
        resultPromise,
      });
    }
    return resultPromise;
  };

  /**
   * 设置核价方式 - [威奇达] 调用
   * @protect
   */
  @Bind()
  setCheckWay(result = {}) {
    const { configValue = '' } = result;

    if (!configValue) {
      // 给全部报价明细ds设置checkWay默认值
      this.quoteLineDs.setState('checkWay', 'quantity');
      return;
    }
    this.setState({
      checkWay: configValue,
    });
    // 给全部报价明细ds设置checkWay
    this.quoteLineDs.setState('checkWay', configValue);
  }

  /**
   * 展开/收起 折叠面板
   */
  @Bind()
  handleChangeCollapseKeys(collapseKeys = []) {
    this.setState({
      collapseKeys,
      currentPaneActiveSelected: {},
    });
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  playView() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    const { modelName = 'inquiryHall' } = this.props;
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  /**
   * 打开过程附件下载
   */
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
    const rfxHeaderId = params?.rfxId;

    idValidation(rfxHeaderId);

    const api = `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-all`;
    downloadFile({ requestUrl: api });
  }

  @Bind()
  onCancel() {
    this.setState({
      processVisible: false,
    });
  }

  /**
   * 打开退回至初审弹窗
   */
  @Throttle(500)
  @Bind()
  returnToPretrial() {
    this.setState({ returnToPretrialModalVisible: true });
  }

  /**
   * hideReturnToPretrial - 关闭退回之初审弹窗
   */
  @Bind()
  hideReturnToPretrial() {
    this.setState({ returnToPretrialModalVisible: false });
  }

  /**
   * 提交退回原因退回至初审弹窗
   */
  @Bind()
  submitReturnToPretrial(value) {
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const { routerParams } = this.state;
    const { current: dsCurrent } = this.basicInfoDs;
    const objectVersionNumber = dsCurrent?.get('objectVersionNumber');
    const { current } = routerParams;
    let pathname;
    dispatch({
      type: `${modelName}/submitReturnToPretrial`,
      payload: {
        rfxHeaderId: params.rfxId,
        organizationId,
        backPretrialRemark: value.backPretrialRemark,
        objectVersionNumber,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        pathname = `${this.activeTabKey}/list`;
        dispatch(
          routerRedux.push({
            pathname,
            search: querystring.stringify({
              current,
            }),
          })
        );
      } else {
        this.setState({ returnToPretrialModalVisible: false });
      }
    });
  }

  /**
   * 判断所有物料行是否有变更
   */
  judgeItemLinesDsHasChanged() {
    const {
      itemLineTable = {}, // ds map
    } = this.itemLineList || {};
    if (isNil(itemLineTable)) return false;
    return Object.values(itemLineTable).some((ds) => ds.dirty);
  }

  /**
   * 重置所有物料行ds
   */
  resetItemLinesDs() {
    const {
      itemLineTable = {}, // ds map
    } = this.itemLineList || {};
    if (isNil(itemLineTable)) return;
    return Object.values(itemLineTable).forEach((ds) => ds.reset());
  }

  /**
   * 校验物料行
   */
  @Bind()
  async validateItemLinesDs() {
    const {
      itemLineTable = {}, // ds map
    } = this.itemLineList || {};
    if (isNil(itemLineTable)) return true;
    const promiseArr = Object.values(itemLineTable).map((ds) => ds.validate());
    return Promise.all(promiseArr).then((res) => res.every((validateFlag) => validateFlag));
  }

  /**
   * 校验供应商行
   */
  @Bind()
  async validateSupplierLinesDs() {
    const {
      supplierLineTable = {}, // ds map
    } = this.supplierLineList || {};
    if (isNil(supplierLineTable)) return true;
    const promiseArr = Object.values(supplierLineTable).map((ds) => ds.validate());
    return Promise.all(promiseArr).then((res) => res.every((validateFlag) => validateFlag));
  }

  /**
   * 判断所有供应商行是否有变更
   */
  judgeSupplierLinesDsHasChanged() {
    const {
      supplierLineTable = {}, // ds map
    } = this.supplierLineList || {};
    if (isNil(supplierLineTable)) return false;
    return Object.values(supplierLineTable).some((ds) => ds.dirty);
  }

  /**
   * 重置所有供应商行ds
   */
  resetSupplierLinesDs() {
    const {
      supplierLineTable = {}, // ds map
    } = this.supplierLineList || {};
    if (isNil(supplierLineTable)) return;
    return Object.values(supplierLineTable).forEach((ds) => ds.reset());
  }

  /**
   *切换tab页
   */
  @Bind()
  handleChangeTab(key) {
    const {
      modelName = 'inquiryHall',
      [modelName]: { itemLine = [], supplierLine = [] },
      remote,
    } = this.props;
    const { activeKey } = this.state;
    if (activeKey !== key) {
      const search = () => {
        if (key === 'itemLine') {
          if (!itemLine.length) {
            this.fetchItemLine();
          }
        } else if (key === 'supplierLine') {
          if (!supplierLine.length) {
            this.fetchSupplierLine();
          }
        } else if (key === 'quoteLine') {
          if (!this.quoteLineDs.length) {
            this.fetchQuoteLine();
          }
        }
      };
      const confirm = () => {
        ModalH0.confirm({
          title: intl
            .get('hzero.common.message.confirm.giveUpTip')
            .d('你有修改未保存，是否确认离开？'),
          onOk: () => {
            // 设置activeKey，重置form,表格得$form
            this.setState(
              {
                activeKey: key,
                expandAllFlag: false,
                itemExpand: {},
                supplierExpand: {},
                itemActivePanel: [],
                supplierActivePanel: [],
                batchSearchData: [],
                batchSearchDataKeys: [],
                clickAllFlag: false,
              },
              () => {
                if (remote?.event) {
                  const eventProps = {
                    key,
                    bidFlag: this.bidFlag,
                    handleClickExpandAll: this.handleClickExpandAll,
                  };
                  remote.event.fireEvent('setTabChange', eventProps);
                }
              }
            );
            if (activeKey === 'itemLine') {
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              this.resetItemLinesDs();
            } else if (activeKey === 'supplierLine') {
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              this.resetSupplierLinesDs();
            } else if (activeKey === 'quoteLine') {
              // eslint-disable-next-line no-unused-expressions
              this.allQuoteLineRef.current?.strategyDs?.reset();
              this.quoteLineDs.reset();
            }
          },
        });
      };
      // itemLine标签页有改动
      if (activeKey === 'itemLine') {
        search();
        if (this.judgeItemLinesDsHasChanged()) {
          // 是否数据变更
          confirm();
        } else {
          this.setState({ activeKey: key });
        }
      }
      // supplierLine标签页有改动
      else if (activeKey === 'supplierLine') {
        search();
        if (this.judgeSupplierLinesDsHasChanged()) {
          confirm();
        } else {
          this.setState({ activeKey: key });
        }
      }
      // quoteLine标签页有改动
      else if (activeKey === 'quoteLine') {
        search();
        if (this.quoteLineDs.dirty) {
          confirm();
        } else {
          this.setState({ activeKey: key });
        }
      } else if (activeKey === 'attachmentList') {
        search();
        this.setState({ activeKey: key });
      } else if (remote?.event) {
        remote.event.fireEvent('changeTab', {
          activeKey,
          that: this,
          confirm,
          key,
          search,
        });
      } else {
        search();
        this.setState({ activeKey: key });
      }
    }
  }

  /**
   * 再次询价确定按钮 此方法被 [番缆服务] 重写, 请谨慎修改!!!
   * @protected
   */
  @Throttle(500)
  @Bind()
  inquiryAgainOk() {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const { routerParams } = this.state;
    const { current } = routerParams;
    const rfxHeaderId = params.rfxId;
    const { current: dsCurrent } = this.basicInfoDs;
    const { createFlag, rfxTitle, rfxNum } =
      dsCurrent?.get(['createFlag', 'rfxTitle', 'rfxNum']) || {};
    dispatch({
      type: `${modelName}/inquiryAgain`,
      payload: {
        organizationId,
        rfxHeaderId,
      },
    }).then((res) => {
      if (res) {
        if (createFlag === 1) {
          let pathname;
          if (this.activeTabKey === '/ssrc/new-inquiry-hall') {
            pathname = `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`;
          } else if (this.activeTabKey === '/ssrc/new-bid-hall') {
            pathname = `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`;
          } else {
            pathname = `/ssrc/inquiry-hall/rfx-update/${rfxHeaderId}`;
          }
          dispatch(
            routerRedux.push({
              pathname,
              search: querystring.stringify({
                current,
              }),
            })
          );
        } else {
          ModalH0.warning({
            title: (
              <span>
                <span>
                  {intl
                    .get(`ssrc.inquiryHall.view.message.confirm.commonRFQ`, {
                      documentTypeName: getDocumentTypeName(this.sourceKey === 'NEW_BID'),
                    })
                    .d('{documentTypeName}【')}
                </span>
                <span>
                  {rfxNum}-{rfxTitle}
                </span>
                <span>
                  {intl
                    .get(`ssrc.inquiryHall.view.message.confirm.commonWaitingMaintenance`, {
                      sourceCategoryName: getSourceCategoryName(this.sourceKey === 'NEW_BID'),
                      documentTypeName: getDocumentTypeName(this.sourceKey === 'NEW_BID'),
                    })
                    .d(
                      '】状态已变为再次{sourceCategoryName}，请等待创建人维护并发布{documentTypeName}'
                    )}
                </span>
              </span>
            ),
            onOk: () => {
              let pathname;
              if (this.activeTabKey === '/ssrc/new-inquiry-hall') {
                pathname = `/ssrc/new-inquiry-hall/list`;
              } else if (this.activeTabKey === '/ssrc/new-bid-hall') {
                pathname = `/ssrc/new-bid-hall/list`;
              } else {
                pathname = `/ssrc/inquiry-hall/list`;
              }
              dispatch(routerRedux.push({ pathname }));
            },
            iconType: 'question-circle',
            okText: intl.get('hzero.common.button.ok').d('确定'),
          });
        }
      }
    });
  }

  /**
   * 再次询价
   */
  @Throttle(500)
  @Bind()
  inquiryAgain() {
    const againInquoryFunc = () =>
      ModalH0.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.commonInquiryAgain`, {
            sourceCategoryName: getSourceCategoryName(this.sourceKey === 'NEW_BID'),
          })
          .d('确认是否再次{sourceCategoryName}'),
        onOk: this.inquiryAgainOk,
        onCancel: () => {},
      });
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('inquiryAgain', {
        inquiryAgainOk: this.inquiryAgainOk,
        bidFlag: this.bidFlag,
        getSourceCategoryName,
        againInquoryFunc,
        basicInfoDs: this.basicInfoDs,
        handleSave: this.handleSave,
      });
    } else {
      againInquoryFunc();
    }
  }

  /**
   * 获取供应商关系图
   */
  @Throttle(600)
  @Bind()
  supplierRelationMap() {
    const {
      // dispatch,
      organizationId,
      modelName = 'inquiryHall',
      match: { params },
      [modelName]: { supplierLine = [] },
    } = this.props;

    const { current } = this.basicInfoDs;
    // const companyName = current?.get('companyName');

    if (!Array.isArray(supplierLine) || !supplierLine.length) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.notSupplierLine`)
          .d('操作失败，失败原因是暂无供应商数据，请更新数据后重试'),
      });
      return;
    }

    const companyNames = [];
    supplierLine.forEach((item) => {
      const { supplierCompanyName, supplierCompanyId, supplierId } = item || {};
      if (!supplierCompanyId && !supplierId) {
        return;
      }
      const currentLine = {
        supplierCompanyName,
        supplierCompanyId,
        supplierId,
        rfxHeaderId: params.rfxId,
        rfxNum: current?.get('rfxNum'),
      };
      companyNames.push(currentLine);
    });

    // 校验头id
    idValidation(params.rfxId);
    const secondarySourceCategory = this.basicInfoDs?.current?.get('secondarySourceCategory');
    if (!secondarySourceCategory) return;

    supplierRelationMapNew({
      organizationId,
      data: {
        rfxHeaderId: params.rfxId,
        supplierLists: companyNames,
        businessType: secondarySourceCategory,
        rfxNum: current?.get('rfxNum'),
      },
    }).then((res) => {
      if (isText(res)) {
        const url = getSupplierRelationUrl(res);
        window.open(url);
      }
    });
  }

  @Bind()
  handleAfterOpenModal(checkAttachmentUuid) {
    this.setState({
      checkAttachmentUuid,
    });
  }

  // 附件改变回调
  handleAttachmentChange = (value) => {
    const { current } = this.basicInfoDs;
    const attachmentUUID = current?.get('checkAttachmentUuid');
    this.setState({
      checkAttachmentUuid: attachmentUUID || value,
    });
  };

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   *
   * @param {object} payload:{} - 查询参数
   */
  @Bind()
  handleCreateMaterialData(payload = {}) {
    const { dispatch, organizationId } = this.props;
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'purchasetrack/fetchPurchaseTrackData',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        ...filterValues,
      },
    });
  }

  /**
   * 隐藏中心弹窗
   */
  @Bind()
  handleHideModal() {
    this.setState({ pricingModalVisible: false });
    const { remote } = this.props;
    if (remote?.event) {
      const eventProps = {
        queryPageMainData: this.queryPageMainData,
        fetchHeaderInfo: this.fetchHeaderInfo,
        bidFlag: this.bidFlag,
        current: this,
      };
      remote.event.fireEvent('handleHidePricingModal', eventProps);
    }
  }

  /**
   * 跳转到多轮报价页面
   * */
  @Bind()
  async directRoundQuotation() {
    const {
      dispatch,
      remote,
      match: { params },
    } = this.props;
    const { routerParams } = this.state;

    const { projectLineSectionId } = routerParams;
    const sourceHeaderId = params.rfxId;
    if (remote?.event) {
      const eventProps = {
        rfxHeaderId: sourceHeaderId,
      };
      const res = await remote.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

    const pathname = `${this.activeTabKey}/round-quotation/${sourceHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify({
          projectLineSectionId,
        }),
      })
    );
  }

  /**
   * 确认发起多轮报价
   * */
  // @Bind()
  // confirmRoundQuotation() {
  //   const {
  //     dispatch,
  //     match: { params },
  //     modelName = 'inquiryHall',
  //   } = this.props;

  //   // if (this.sectionInfo.getCheckedSectionList && this.sectionInfo.getCheckedSectionList().length) {
  //   // dispatch({
  //   //   type: `${modelName}/sectionBeginRoundQuotation`,
  //   //   payload: {
  //   //     sourceHeaderId: params.rfxId,
  //   //     projectLineSectionList: this.sectionInfo.getCheckedSectionList(),
  //   //     ignoreErrorFlag,
  //   //   },
  //   // }).then((res) => {
  //   //   if (res && res.length) {
  //   //     this.setState({
  //   //       sectionMessageVisible: true,
  //   //       operateSectionPromptProps: {
  //   //         visible: true,
  //   //         handleCancel: () => {
  //   //           this.setState({
  //   //             sectionMessageVisible: false,
  //   //           });
  //   //         },
  //   //         handleOk: () => {
  //   //           this.confirmRoundQuotation(1);
  //   //           this.setState({
  //   //             sectionMessageVisible: false,
  //   //           });
  //   //         },
  //   //         dataList: res,
  //   //       },
  //   //     });
  //   //   } else {
  //   //     this.directRoundQuotation();
  //   //   }
  //   // });
  //   // } else {
  //   dispatch({
  //     type: `${modelName}/beginRoundQuotation`,
  //     payload: {
  //       sourceHeaderId: params.rfxId,
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       this.directRoundQuotation();
  //     }
  //   });
  //   // }
  // }

  /**
   * 多轮报价弹窗
   * */
  // handleConfirmRoundQuotation() {
  //   Modal.confirm({
  //     content: intl.get(`ssrc.expertScoring.view.modal.title.isRoundQuo`).d('是否开启多轮报价'),
  //     onOk: () => this.confirmRoundQuotation(),
  //   });
  // }

  /**
   * 发起多轮报价
   */
  @Bind()
  handleRoundQuotation() {
    this.directRoundQuotation();

    // const {
    //   inquiryHall: { header = {} },
    // } = this.props;
    // const { roundHeaderStatus = '' } = header;
    // const sectionList =
    //   (this.sectionInfo.getAllSectionList && this.sectionInfo.getAllSectionList()) || [];
    // let allConfirmed;
    // if (sectionList.length) {
    //   allConfirmed = sectionList.some((item) => item.roundHeaderStatus === 'ROUND_CHECK');
    // }

    // if (allConfirmed || roundHeaderStatus === 'ROUND_CHECKING') {
    //   this.directRoundQuotation();
    // } else if (roundHeaderStatus === 'ROUND_CHECK') {
    //   this.handleConfirmRoundQuotation();
    // } else {
    //   throw TypeError('round quotation status error!');
    // }
  }

  /*
   * IP重合率弹框-打开
   */
  @Bind()
  openIPCoincidenceRateModal() {
    const {
      dispatch,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: `${modelName}/fetchIPCoincidenceRate`,
      payload: {
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE`,
      },
    });
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
   * IP重合率弹框- 关闭
   */
  @Bind()
  confirmIpCoincidenceRate() {
    const { modelName = 'inquiryHall' } = this.props;
    this.setState({
      ipCoincidenceRateVisible: false,
    });
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        ipCoincidenceRate: [],
      },
    });
  }

  // 判断议价是否时间结束
  isBargainFinished = () => {
    const { current } = this.basicInfoDs;
    const { currentDateTime = null, bargainEndDate = null } = current
      ? current?.get(['currentDateTime', 'bargainEndDate'])
      : {};

    let bargainTimeFinished = true;

    if (!isNil(bargainEndDate) && !isNil(currentDateTime)) {
      bargainTimeFinished = bargainEndDate < currentDateTime;
    }

    return bargainTimeFinished;
  };

  /**
   * 跳转到对应的议价界面
   */
  @Throttle(500)
  @Bind()
  handleBargainOnline() {
    const { current } = this.basicInfoDs;
    const { remote } = this.props;

    if (isNil(current)) {
      return;
    }

    const { bargainOfflineFlag = 0, bargainStatus = null } =
      current?.get(['bargainOfflineFlag', 'bargainStatus']) || {};
    const bargainTimeFinished = this.isBargainFinished();

    // 选择议价方式
    const selectBargainWay = () => {
      if (
        ['INITIATE', 'BARGAIN_ONLINE', 'BARGAIN_OFFLINE'].includes(bargainStatus) ||
        bargainTimeFinished
      ) {
        if (bargainOfflineFlag) {
          this.setState({ onlineBargainVisible: true });
        } else {
          this.openBargainModal();
        }
      } else {
        this.openBargainModal();
      }
    };
    if (remote?.event) {
      remote.event.fireEvent('selectBargainWay', {
        current,
        selectBargainWay,
        openBargainModal: this.openBargainModal,
        that: this,
        bidFlag: this.bidFlag,
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
  @Throttle(500)
  @Bind()
  async openBargainModal() {
    const {
      dispatch,
      organizationId,
      match: { params },
      history = {},
      location,
      modelName = 'inquiryHall',
      remote,
    } = this.props;
    const { rfxId } = params;
    const { current: dsCurrent } = this.basicInfoDs;
    const { bargainNewFlag } = this.state;
    if (isNil(dsCurrent)) {
      return;
    }

    if (remote?.event) {
      const eventProps = {
        rfxHeaderId: rfxId,
        dsCurrent,
      };
      const res = await remote.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

    const { subjectMatterRule, projectLineSectionId, bargainStatus, bargainOfflineFlag = false } =
      dsCurrent?.get([
        'subjectMatterRule',
        'projectLineSectionId',
        'bargainStatus',
        'bargainOfflineFlag',
      ]) || {};

    const getFieldValue = this.bargainRuleModalRef
      ? this.bargainRuleModalRef?.props?.form?.getFieldValue
      : () => {};

    const { current } = querystring.parse(location.search.substr(1));
    const pathname = `${this.activeTabKey}/${bargainNewFlag ? 'new-' : ''}rfx-bargain/${rfxId}`;

    let sectionSearch = {}; // 分标段增加路由参数
    if (subjectMatterRule === 'PACK') {
      sectionSearch = {
        sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
        projectLineSectionId,
      };
    }

    const search = querystring.stringify({
      sourceStatus: 'checkPrice',
      current,
      ...sectionSearch,
    });

    // 议价弹框确定
    const openBargain = () => {
      dispatch({
        type: `${modelName}/fetchOpenBargain`,
        payload: {
          organizationId,
          rfxHeaderId: rfxId,
          bargainMethod: bargainOfflineFlag === 0 ? 'ONLINE' : getFieldValue('sourceType'),
        },
      })
        .then((res) => {
          if (res) {
            history.push({
              pathname,
              search,
            });
          }
        })
        .finally(() => {
          this.setOpenBargainLoading(false);
        });
    };

    // 直接跳转议价
    const directBargain = () => {
      history.push({
        pathname,
        search,
      });
    };

    this.setOpenBargainLoading(true);
    const bargainTimeFinished = this.isBargainFinished();

    // 发起议价逻辑，未发起或者截止时间已过
    const startNewBargain =
      (bargainStatus !== 'BARGAINING_ONLINE' && bargainStatus !== 'BARGAINING_OFFLINE') ||
      bargainTimeFinished;

    if (startNewBargain) {
      openBargain();
    } else if (remote?.event) {
      remote.event.fireEvent('directBargain', {
        openBargain,
        directBargain,
        current: dsCurrent,
        bidFlag: this.bidFlag,
      });
      this.setOpenBargainLoading(false);
    } else {
      directBargain();
      this.setOpenBargainLoading(false);
    }
  }

  /**
   * 打开议价方式模态框
   */
  @Bind()
  bargainRuleModal(sourceType) {
    const { remote } = this.props;
    const { onlineBargainVisible } = this.state;
    const modalProps = {
      remote,
      sourceType,
      visible: onlineBargainVisible,
      onRef: this.handleGeneratorRef,
      hideBargainModal: this.hideBargainModal,
      openBargainModal: this.openBargainModal,
    };
    return <BargainRuleModal {...modalProps} />;
  }

  @Bind()
  handleRenderPriceComparisonModal(priceComparisonProps) {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceComparisonModal(priceComparisonProps),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  /**
   * 比价助手modal - 此方法被 [中集安瑞科/泛旅游/追觅/伊戈尔/美亚/华丽/爱学习/久立] 重写, 请谨慎修改!!!
   * @protected
   */
  renderPriceComparisonModal = (priceComparisonProps = {}) => {
    const { priceComparisonModalVisible = false } = this.state;
    return priceComparisonModalVisible ? (
      this.sourceKey === INQUIRY ? (
        <PriceComparison {...priceComparisonProps} />
      ) : (
        <BidPriceComparison {...priceComparisonProps} />
      )
    ) : null;
  };

  /**
   * 保存 - 汇率
   * 要更新其他tab页的内容
   */
  @Bind()
  async updateTabData() {
    const { newFunctionFlag = false } = this.state;
    // 必输校验成功后才刷新
    if (await this.validateItemLinesDs()) {
      this.setState({ updateState: true }, () => {
        if (newFunctionFlag) {
          // eslint-disable-next-line no-unused-expressions
          this.itemLineList?.setState({
            isShow: {},
          });
          this.setState({
            itemActivePanel: [],
            itemExpand: {},
          });
          if (this.itemLineList) {
            this.itemLineList.itemLineTable = {};
          }
        } else {
          this.fetchItemQuoteLineList();
        }
      });
    }

    if (await this.validateSupplierLinesDs()) {
      this.setState({ updateState: true }, () => {
        this.fetchSupplierQuoteLineList();
      });
    }
    this.fetchQuoteLine();
  }

  /**
   * 此方法不知作用, 从老核价同步到此
   * @param {*} e - 变更值
   * @param {*} record - Record对象
   */
  @Bind()
  allottedQuantityChange(e, record) {
    const { doubleUnitFlag } = this.state;
    const flagObj = { ...this.state.flagObj };
    const popConfirmFlagList = [];

    const {
      rfxLineItemId,
      quotationLineId,
      validQuotationQuantity,
      itemId,
      uomId,
      secondaryUomId,
    } = isRecord(record)
      ? record.get([
          'rfxLineItemId',
          'quotationLineId',
          'validQuotationQuantity',
          'itemId',
          'uomId',
          'secondaryUomId',
        ])
      : record;

    flagObj[`flag${rfxLineItemId}${quotationLineId}`] = math.lt(validQuotationQuantity, e);

    if (e) {
      if (doubleUnitFlag && itemId) {
        calculateBasicQty({
          secondaryQuantity: e,
          itemId,
          businessKey: quotationLineId || record.id,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          record.set('allottedQuantity', res ?? '');
        });
      } else {
        record.set('allottedQuantity', e);
      }
    } else if (e === 0) {
      record.set('allottedQuantity', e);
    }

    this.setState({
      flagObj,
    });
    for (const key in flagObj) {
      if (key) {
        const element = flagObj[key];
        popConfirmFlagList.push(element);
      }
    }
    // this.setState({
    //   popConfirmFlag: popConfirmFlagList.some(item => item),
    // });
  }

  /**
   * 点击路由返回
   */
  @Bind()
  toBack() {
    const { match } = this.props;
    const { routerParams } = this.state;
    const { back } = routerParams;
    let path = '';
    if (back === 'offline') {
      path = `${this.activeTabKey}/detail/${match.params.rfxId}`;
    } else {
      path = `${this.activeTabKey}/list`;
    }

    return path;
  }

  /**
   * 改变核价方式
   */
  @Bind()
  changeCheckWay(e) {
    const value = e.target.getAttribute('value');
    if (value && value !== this.state.checkWay) {
      this.changeCheckWayDetail(value);
    }
  }

  /**
   * 页面核价方式改变
   * */
  @Throttle(500)
  @Bind()
  async changeCheckWayDetail(value) {
    const {
      dispatch,
      organizationId,
      userId,
      modelName = 'inquiryHall',
      match: { params = {} },
      [modelName]: { rfxDetailLayouts = {}, rfxDetailLayoutsSingle = {} },
    } = this.props;

    const checkPriceWay = dispatch({
      type: `${modelName}/changeRfxDetailLayout`,
      payload: {
        ...rfxDetailLayouts,
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'checkPriceWay',
        configKey: 'checkPriceWay',
        configValue: value,
      },
    });

    const checkPriceWaySingle = dispatch({
      type: `${modelName}/changeRfxDetailLayoutSingle`,
      payload: {
        ...rfxDetailLayoutsSingle,
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: `checkPriceWay#${params.rfxId}`,
        configKey: `checkPriceWay#${params.rfxId}`,
        configValue: value,
      },
    });

    Promise.all([checkPriceWay, checkPriceWaySingle]).then((res) => {
      if (res.some((item) => !item)) {
        return;
      }
      this.setCheckWay(isEmpty(res[1]) ? res[0] : res[1]);
    });
  }

  // 批量维护
  @Throttle(500)
  @Bind()
  startBatchMaintainItemLine() {
    const { remote } = this.props;
    this.setState({
      batchMaintainQuoteLineVisible: true,
    });
    if (remote?.event) {
      const eventProps = {
        turnPageSave: this.turnPageSave,
      };
      remote.event.fireEvent('afterStartBatchMaintainItemLine', eventProps);
    }
  }

  /**
   * 九坤二开
   * @protected
   */
  // 批量维护保存
  @Bind()
  saveBatchMaintainItemLine() {
    const {
      organizationId,
      dispatch,
      modelName = 'inquiryHall',
      match: { params = {} },
    } = this.props;
    const { activeKey } = this.state;
    const itemLineForm = this.BatchMaintainRef.props.form;
    const data = itemLineForm.getFieldsValue();
    const batchUpdate = () => {
      return dispatch({
        type: `${modelName}/batchMaintainItemQuotationLine`,
        payload: {
          organizationId,
          rfxQuotationLine: data,
          quotationLineIds: ids,
          rfxHeaderId: params.rfxId,
          sourceFunctionCode: 'CHECK_PRICE',
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM`,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              // quoteLine: [],
              // quoteLinePagination: {},
              itemLine: [],
              supplierLine: [],
            },
          });

          // 清空quoteLine
          this.quoteLineDs.loadData([]);

          if (this.itemLineList) {
            this.itemLineList.setState({
              isShow: {},
            });
            this.setState({
              itemActivePanel: [],
              itemExpand: {},
            });
            // 清空未保存的编辑，否则批量编辑后，不点开物料会取缓存，数据有问题
            this.resetItemLinesDs();
            this.itemLineList.itemLineTable = {};
          }
          if (this.supplierLineList) {
            this.supplierLineList.setState({
              isShow: {},
            });
            this.setState({
              supplierActivePanel: [],
              supplierExpand: {},
            });
            // 清空未保存的编辑
            this.resetSupplierLinesDs();
            this.supplierLineList.supplierLineTable = {};
          }
          return res;
        }
      });
    };
    let ids = null;
    let callBack = null;
    if (activeKey === 'itemLine') {
      const { itemLineTable = {} } = this.itemLineList;
      const editData = [];
      Object.values(itemLineTable).forEach((ds) => {
        editData.push(...ds.selected?.map((record) => record.get('quotationLineId')));
      });
      ids = editData;
      callBack = () => {
        this.changeItemLineTableSelection();
      };
      batchUpdate().then((res) => {
        if (!res) {
          return;
        }
        this.itemLineList.itemLineTable = {};
        this.queryHeaderInfo();
        this.fetchItemLine();
        callBack();
      });
    } else if (activeKey === 'supplierLine') {
      const { supplierLineTable = {} } = this.supplierLineList || {};
      const editData = [];

      if (!isEmpty(supplierLineTable)) {
        Object.values(supplierLineTable).forEach((ds) => {
          editData.push(...ds.selected?.map((record) => record.get('quotationLineId')));
        });
      }
      ids = editData;
      callBack = () => {
        this.changeSupplierLineTableSelection();
      };
      batchUpdate().then((res) => {
        if (!res) {
          return;
        }
        this.supplierLineList.supplierLineTable = {};
        this.queryHeaderInfo();
        this.fetchSupplierLine();
        callBack();
      });
    } else {
      ids = this.quoteLineDs.selected?.map((record) => record.get('quotationLineId'));
      callBack = () => {
        // 清空缓存勾选
        this.quoteLineDs.clearCachedSelected();
        // 清空当前勾选
        this.quoteLineDs.unSelectAll();
      };
      batchUpdate().then((res) => {
        if (!res) {
          return;
        }
        callBack();
        this.queryHeaderInfo();
        this.fetchQuoteLine();
      });
    }
    this.cancelBatchMaintainItemLine();
  }

  // 批量维护取消
  @Bind()
  cancelBatchMaintainItemLine() {
    this.setState({
      batchMaintainQuoteLineVisible: false,
    });
    this.resetBatchMaintainItemLine();
  }

  // 批量维护重置
  @Bind()
  resetBatchMaintainItemLine() {
    const itemLineForm = this.BatchMaintainRef.props.form;
    itemLineForm.resetFields();
  }

  // 批量维护modal ref
  @Bind()
  batchMaintainRef(ref = {}) {
    this.BatchMaintainRef = ref;
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchExport() {
    const {
      match: {
        params: { rfxId },
      },
      organizationId,
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;
    const { activeKey = '' } = this.state;
    if (!rfxId || rfxId === 'null') {
      return;
    }

    const props = {
      code: 'SSRC.RFX_CHECK_PRICE.IMPORT',
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: rfxId,
        templateCode: 'SSRC.RFX_CHECK_PRICE.IMPORT',
        oldType: 1,
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      bodyStyle: { maxHeight: 'calc(100vh - 2.3rem)' },
      title: intl
        .get(`ssrc.inquiryHall.view.message.tab.commonXheckPriceReslutImport`, {
          checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
        })
        .d('{checkPriceName}结果导入'),
      children: <CommonImportOld {...props} />,
      style: { width: '80%' },
      afterClose: () => {
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine: [],
            supplierLine: [],
          },
        });
        if (this.itemLineList) {
          this.itemLineList.itemLineTable = {};
          this.itemLineList.setState({
            isShow: {},
          });
          this.setState({
            itemActivePanel: [],
            itemExpand: {},
          });
        }
        if (this.supplierLineList) {
          this.supplierLineList.supplierLineTable = {};
          this.supplierLineList.setState({
            isShow: {},
          });
          this.setState({
            supplierActivePanel: [],
            supplierExpand: {},
          });
        }
        if (activeKey === 'itemLine') {
          this.fetchItemLine();
          this.fetchQuoteLine();
        } else if (activeKey === 'supplierLine') {
          this.fetchSupplierLine();
          this.fetchQuoteLine();
        } else {
          this.fetchQuoteLine();
        }
      },
    });
  }

  /**
   * @protected
   *导出--[上海家化, 永祥, 爱学习]二开
   *
   */
  exportCheckPriceData = () => {
    const {
      organizationId,
      dispatch,
      modelName = 'inquiryHall',
      match: { params },
    } = this.props;
    dispatch({
      type: `${modelName}/exportCheckPriceData`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    }).then((url) => {
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.click();
      }
    });
  };

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
      modelName = 'inquiryHall',
      match: { params },
    } = this.props;

    dispatch({
      type: `${modelName}/querySupplierExchangeEdit`,
      payload: {
        ...date,
        organizationId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX',
      },
    });
  }

  /**
   * 汇率编辑
   *
   * @memberof CheckPrice
   */
  @Throttle(500)
  @Bind()
  exchangeEdit(date = {}) {
    this.querySupplierExchangeEdit(date);
    this.setState({
      exchangeEditModalVisible: true,
    });
  }

  // 预览分权
  previewScoreManager = throttle(() => {
    const {
      match: {
        params: { rfxId },
      },
      organizationId,
    } = this.props;

    const modalProps = {
      rfxId,
      organizationId,
    };

    c7nModal.open({
      key: c7nModal.key(),
      closable: true,
      destroyOnClose: true,
      title: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
      style: { width: '800px' },
      children: <PreviewScoreManager {...modalProps} />,
      footer: false,
    });
  }, 500);

  /**
   * 汇率编辑 取消
   *
   * @memberof CheckPrice
   */
  @Bind()
  cancelExchangeEdit() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
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
    const {
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
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
      this.updateTabData();
      this.queryHeaderInfo();
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
    const {
      modelName = 'inquiryHall',
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

      const rateDate = dateFormate(values.rateDate, DEFAULT_DATE_FORMAT);
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
   * 物品明细(折叠面板列表) - 改变分页
   */
  @Bind()
  async changeItemLinePagination(current = undefined, pageSize = undefined) {
    const { remote: { event } = {} } = this.props;
    const handleChangeItemLinePagination = async () => {
      const changedPagination = {};
      changedPagination.current = current;
      changedPagination.pageSize = pageSize;
      this.setState({
        itemLinePageSize: pageSize,
        expandAllFlag: false,
      });
      const callBack = () => {
        this.fetchItemLine(changedPagination);
        this.setState({
          itemActivePanel: [],
          itemExpand: {},
        });
      };

      if (this.judgeItemLinesDsHasChanged()) {
        const validateFlag = await this.validateItemLinesDs();
        if (validateFlag) {
          this.turnPageSave(changedPagination);
        } else {
          ModalH0.confirm({
            content: intl
              .get('ssrc.inquryHall.view.inquryHall.hasValidateFail')
              .d('存在必填字段未填，数据将不保存，是否继续分页?'),
            onOk: () => callBack(),
          });
        }
      } else {
        if (this.state.itemSelectedPolicyChangeFlag) {
          await this.handleSave('', 0);
          this.checkPriceTableChange(false);
          this.queryPageMainData();
        }
        callBack();
      }
    };
    // eslint-disable-next-line no-unused-expressions
    event
      ? event.fireEvent('changeItemLinePagination', {
          handleChangeItemLinePagination,
          current: this,
        })
      : handleChangeItemLinePagination();
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  async changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const { remote: { event } = {} } = this.props;
    const handleChangeSupplierLinePagination = async () => {
      const changedPagination = {};
      changedPagination.current = current;
      changedPagination.pageSize = pageSize;
      this.setState({
        supplierLinePageSize: pageSize,
        expandAllFlag: false,
      });
      const callBack = () => {
        this.fetchSupplierLine(changedPagination);
        this.setState({
          supplierExpand: {},
          supplierActivePanel: [],
        });
      };

      if (this.judgeSupplierLinesDsHasChanged()) {
        const validateFlag = await this.validateSupplierLinesDs();
        if (validateFlag) {
          this.turnPageSave(changedPagination);
        } else {
          ModalH0.confirm({
            content: intl
              .get('ssrc.inquryHall.view.inquryHall.hasValidateFail')
              .d('存在必填字段未填，数据将不保存，是否继续分页?'),
            onOk: () => callBack(),
          });
        }
      } else {
        callBack();
      }
    };
    // eslint-disable-next-line no-unused-expressions
    event
      ? event.fireEvent('changeSupplierLinePagination', {
          handleChangeSupplierLinePagination,
          current: this,
        })
      : handleChangeSupplierLinePagination();
  }

  /**
   * 核价翻页保存
   * @param {Object} page 分页参数
   */
  @Bind()
  async turnPageSave(page) {
    const { organizationId, dispatch, modelName = 'inquiryHall' } = this.props;
    let checkPriceDTOLineList = [];
    const doSave = () => {
      const customizeUnitCode = this.getCurrentCustomeCode();
      return dispatch({
        type: `${modelName}/turnPageSave`,
        payload: {
          organizationId,
          checkPriceDTOLineList,
          customizeUnitCode,
        },
      });
    };
    checkPriceDTOLineList = await this.getCheckPriceDTOLineList();
    if (checkPriceDTOLineList && checkPriceDTOLineList.length) {
      doSave().then(() => {
        this.refreshActiveData(true, page);
      });
    }
  }

  /**
   * 物品明细行明细 - 查询
   */
  @Bind()
  fetchItemQuoteLineList() {
    // 触发所有折叠面板下表格查询
    const {
      match: { params },
    } = this.props;
    if (!this.itemLineList) {
      return null;
    }
    const { itemLineTable = {} } = this.itemLineList;
    if (isNil(itemLineTable)) return;
    Object.entries(itemLineTable).forEach(([rfxLineItemId, ds]) => {
      ds.setQueryParameter('queryData', {
        rfxHeaderId: params.rfxId,
        rfxLineItemId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
      });
      ds.query();
    });
  }

  /**
   * 供应商行明细 - 查询
   */
  @Bind()
  fetchSupplierQuoteLineList() {
    // 触发所有折叠面板下表格查询
    const {
      match: { params },
    } = this.props;
    if (!this.supplierLineList) {
      return null;
    }
    const { supplierLineTable = {} } = this.supplierLineList || {};
    if (isNil(supplierLineTable) || isEmpty(supplierLineTable)) return;
    Object.entries(supplierLineTable).forEach(([rfxLineSupplierId, ds]) => {
      ds.setQueryParameter('queryData', {
        rfxHeaderId: params.rfxId,
        rfxLineSupplierId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
      });
      ds.query();
    });
  }

  // 针对列表校验 => 必输字段校验提示信息 notificationData-页签名字 dataSource-列表数据源 retrieveData-检索数据信息
  @Bind()
  notificationTrans(notificationData, dataSource, retrieveData) {
    let errList = [];
    dataSource.forEach((data) => {
      if (!data.$form) {
        return;
      }
      data.$form.validateFieldsAndScroll((error) => {
        if (!isEmpty(error)) {
          errList.push(...Object.keys(error));
        }
      });
    });
    // 过滤重复数据
    errList = errList.filter((item, index, self) => self.indexOf(item) === index);
    Object.keys(retrieveData).forEach((item) => {
      if (!isEmpty(errList) && errList.indexOf(item) !== -1) {
        notificationData.push(retrieveData[item]);
      }
    });
    notificationData.push(
      intl.get(`ssrc.inquiryHall.model.inquiryHall.notInput`).d('字段未填写！')
    );
    if (notificationData.length < 3) {
      return;
    }
    const message = notificationData.join('');
    notification.warning({
      message: intl.get(`ssrc.inquiryHall.model.inquiryHall.requewMessage`).d(message),
    });
  }

  /**
   * @param {itemCode}
   */
  @Bind()
  groupBy(array, f) {
    const groups = {};
    array.forEach((o) => {
      const group = JSON.stringify(f(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return Object.keys(groups).map((group) => {
      return groups[group];
    });
  }

  /**
   * 遍历行数据判断popFlag；
   * @param {string} sourceType - 区分数据源
   */
  @Bind()
  async throughArray(sourceType) {
    const { activeKey = undefined, doubleUnitFlag = false } = this.state;
    const popFlags = { flag: false, errorFlag: false, async: false };
    const tableData = this.getCurrentEditTableData(sourceType);
    const validateFlag =
      sourceType === 'itemLine'
        ? await this.validateItemLinesDs()
        : await this.validateSupplierLinesDs();
    const suggestedLine = tableData.filter((item) => item.suggestedFlag === 1);
    if (!validateFlag) {
      popFlags.errorFlag = true;
      return popFlags;
    }
    let newData = [];
    if (activeKey === 'supplierLine') {
      newData = this.groupBy(suggestedLine, (item) => {
        return [item.itemCode, item.itemName, item.rfxLineItemNum]; // 按照物料id名称和行号将数据进行分组
      });
    } else {
      newData = this.groupBy(suggestedLine, (item) => {
        return [item.itemCode, item.itemName]; // 按照物料id和物料名称将数据进行分组
      });
    }
    if (doubleUnitFlag) {
      newData.forEach((items) => {
        items.forEach((item) => {
          const { allottedSecondaryQuantity } = item;
          // itemLineParamsAll += allottedQuantity;
          if (Number(allottedSecondaryQuantity) > Number(item.secondaryQuantity)) {
            popFlags.flag = true;
          }
        });
      });
    } else {
      newData.forEach((items) => {
        items.forEach((item) => {
          const { allottedQuantity } = item;
          // itemLineParamsAll += allottedQuantity;
          if (Number(allottedQuantity) > Number(item.rfxQuantity)) {
            popFlags.flag = true;
          }
        });
      });
    }
    popFlags.async = true;
    return popFlags;
  }

  /**
   * 遍历行数据判断popFlag；全部报价明细
   * @param {*} data 数据源的表格数据
   */
  @Bind()
  async throughArrayQuoteLine() {
    const { activeKey = undefined, doubleUnitFlag = false } = this.state;
    const popFlags = { flag: false, errorFlag: false, async: false };
    const validateFlag = await this.quoteLineDs.validate();
    if (!validateFlag) {
      popFlags.errorFlag = true;
      return popFlags;
    }
    // popFlags.flag = this.quoteLineDs.some(item => {
    //   return item.get('suggestedFlag') === 1 && Number(item.get('allottedQuantity')) > Number(item.get('rfxQuantity'));
    // });
    const tableData = this.quoteLineDs.toData();
    const suggestedLine = tableData.filter((item) => item.suggestedFlag === 1);
    let newData = [];
    if (activeKey === 'quoteLine') {
      newData = this.groupBy(suggestedLine, (item) => {
        return [item.itemCode, item.itemName, item.rfxLineItemNum]; // 按照物料id名称和行号将数据进行分组
      });
    } else {
      newData = this.groupBy(suggestedLine, (item) => {
        return [item.itemCode, item.itemName]; // 按照物料id和物料名称将数据进行分组
      });
    }
    if (doubleUnitFlag) {
      newData.forEach((items) => {
        items.forEach((item) => {
          const { allottedSecondaryQuantity } = item;
          // itemLineParamsAll += allottedQuantity;
          if (Number(allottedSecondaryQuantity) > Number(item.secondaryQuantity)) {
            popFlags.flag = true;
          }
        });
      });
    } else {
      newData.forEach((items) => {
        items.forEach((item) => {
          const { allottedQuantity } = item;
          // itemLineParamsAll += allottedQuantity;
          if (Number(allottedQuantity) > Number(item.rfxQuantity)) {
            popFlags.flag = true;
          }
        });
      });
    }
    popFlags.async = true;
    return popFlags;
  }

  // 对报错内容具体到字段
  @Bind()
  async getValidateContent(params) {
    const { activeKey = undefined } = this.state;
    let errorInfoStr = params;
    let originAllErrorInfos;
    let sortAllErrorInfos = [];
    const uploadValidateObj = { errorFlag: false };
    let errorInfos = [];
    if (activeKey === 'quoteLine') {
      originAllErrorInfos = await this.quoteLineDs.getValidationErrors();
      sortAllErrorInfos = originAllErrorInfos?.sort((a, b) => {
        return b?.errors.length - a?.errors.length;
      });
      if (sortAllErrorInfos.length > 0) {
        errorInfos = sortAllErrorInfos[0].errors;
      }
    } else if (activeKey === 'itemLine') {
      const {
        itemLineTable = {}, // ds map
      } = this.itemLineList || {};
      if (isNil(itemLineTable)) return;
      const errorArr = [];

      const validationArr = [];

      Object.values(itemLineTable).forEach((ds) => {
        originAllErrorInfos = ds.getValidationErrors();
        sortAllErrorInfos = originAllErrorInfos?.sort((a, b) => {
          return b?.errors.length - a?.errors.length;
        });
        if (sortAllErrorInfos.length > 0) {
          errorArr.push(...sortAllErrorInfos[0].errors);
        }
      });
      errorArr.forEach((err) => {
        const curArr = Array.prototype.slice.call(err?.errors);
        if (curArr[0]?.validationProps && curArr[0]?.validationProps.name) {
          if (!validationArr.includes(curArr[0]?.validationProps?.name)) {
            validationArr.push(curArr[0]?.validationProps?.name);
            errorInfos.push(err);
          }
        }
      });
    } else if (activeKey === 'supplierLine') {
      const {
        supplierLineTable = {}, // ds map
      } = this.supplierLineList || {};
      if (isNil(supplierLineTable)) return;
      const errorArr = [];

      const validationArr = [];

      Object.values(supplierLineTable).forEach((ds) => {
        originAllErrorInfos = ds.getValidationErrors();
        sortAllErrorInfos = originAllErrorInfos?.sort((a, b) => {
          return b?.errors.length - a?.errors.length;
        });
        if (sortAllErrorInfos.length > 0) {
          errorArr.push(...sortAllErrorInfos[0].errors);
        }
      });
      errorArr.forEach((err) => {
        const curArr = Array.prototype.slice.call(err?.errors);
        if (curArr[0]?.validationProps && curArr[0]?.validationProps.name) {
          if (!validationArr.includes(curArr[0]?.validationProps?.name)) {
            validationArr.push(curArr[0]?.validationProps?.name);
            errorInfos.push(err);
          }
        }
      });
    }

    if (!isEmpty(errorInfos)) {
      errorInfoStr = errorInfos?.reduce((prev, cur, index) => {
        const currentPrev = prev || '';
        const curArr = Array.prototype.slice.call(cur?.errors);
        const attachmentValidateObj =
          curArr?.filter((item) => item.ruleName === 'attachmentError')[0] || {};

        const message = attachmentValidateObj.$validationMessage;
        if (message) {
          uploadValidateObj.message = message;
          uploadValidateObj.errorFlag = true;
        }

        if (index < errorInfos.length - 1 && curArr[0]?.injectionOptions) {
          const currentLable = curArr[0]?.injectionOptions?.label || '';
          return `${currentPrev + currentLable} `;
        } else if (curArr[0]?.injectionOptions) {
          const currentLable = curArr[0]?.injectionOptions?.label || '';
          return `${currentPrev + currentLable} ${intl
            .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
            .d('校验不通过')}`;
        } else {
          return intl
            .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
            .d('校验不通过');
        }
      }, '');
    } else {
      errorInfoStr = intl
        .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
        .d('校验不通过');
    }

    if (uploadValidateObj?.errorFlag) {
      notification.warning({
        message: uploadValidateObj?.message,
      });
    } else {
      notification.warning({
        message: errorInfoStr,
      });
    }
  }

  /**
   * 保存校验
   * @param {!boolean} type - 区分保存或提交
   * @param {?number} refreshFlag - 是否需要刷新
   */
  @Throttle(500)
  @Bind()
  async handleBeSave(type, refreshFlag = 1) {
    const { remote } = this.props;
    const { activeKey = undefined, fileTemplateManageFlag } = this.state;
    let attachmentTableValidate = null; // 附件表格校验

    const message = type
      ? intl
          .get('ssrc.inquiryHall.view.inquiryHall.saveNeedValidateAllTable')
          .d('请填写完整表格数据再保存')
      : intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
          .d('提交前请填写完整相关信息');

    const validateMsg = {
      itemLine: `${intl
        .get(`ssrc.inquiryHall.view.message.tab.itemLine`)
        .d('物品明细')}: ${message}`,
      supplierLine: `${intl
        .get(`ssrc.inquiryHall.view.message.tab.vendorList`)
        .d('供应商列表')}: ${message}`,
      quoteLine: `${intl
        .get(`ssrc.inquiryHall.view.message.tab.quoteLine`)
        .d('全部报价明细')}: ${message}`,
    };

    let popFlag = { flag: false, errorFlag: false, async: false };
    if (activeKey === 'itemLine') {
      const validateItemLine = (params, standFlag) => {
        // 标准 return出去
        if (standFlag) return;
        const { getValidateFlag = noop } = params || {};
        popFlag = getValidateFlag();
      };
      const eventProps = {
        validateItemLine,
        itemLineListForm: this.itemLineList?.props?.form,
      };
      if (remote?.event) {
        remote.event.fireEvent('handleValidateItemLine', eventProps);
      } else {
        validateItemLine(eventProps, 'standFlag');
      }
      if (popFlag.errorFlag) {
        return notification.warning({
          message: validateMsg[activeKey],
        });
      }
      popFlag = await this.throughArray('itemLine');
    } else if (activeKey === 'supplierLine') {
      popFlag = await this.throughArray('supplierLine');
    } else if (activeKey === 'quoteLine') {
      popFlag = await this.throughArrayQuoteLine();
    }

    // cux tab validate
    popFlag = await this.validateCuxTab(popFlag);

    // 附件表格 校验不受限于当前tab
    if (fileTemplateManageFlag === 1) {
      attachmentTableValidate = await this.validateAttachmentListTableDS();

      popFlag.async = true;
      if (attachmentTableValidate === false) {
        popFlag.errorFlag = 1;
      }
    }

    const popFlagValidate = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_POPFLAG_VALIDATE',
          popFlag.errorFlag || !popFlag.async,
          {
            activeKey,
            that: this,
          }
        )
      : popFlag.errorFlag || !popFlag.async;

    if (popFlagValidate) {
      if (attachmentTableValidate === false) {
        notification.warning({
          message: `${intl.get(`ssrc.common.view.attachmentTable`).d('附件表格')}: ${message}`,
        });
      } else {
        this.getValidateContent(message);
      }

      // 必输校验此刻就会结束
      // notification.warning({
      //   message: validateMsg[activeKey],
      // });
      return;
    }

    if (type) {
      return this.handleSave('', refreshFlag);
    } else if (!type) {
      return this.handleSubmit();
    }
  }

  /**
   * 清空所有store中的table缓存
   */
  @Bind()
  clearAllTable(operationType, notNotice = '0') {
    const { activeKey } = this.state;
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    if (notNotice === '0') {
      notification.success();
    }
    // 先清空物料行数据，再查询
    if (operationType !== 'newImport') {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          // quoteLine: [],
          // quoteLinePagination: {},
          // allLineChange: false,
          itemLine: [],
          supplierLine: [],
        },
      });
    }

    // 清空全部报价明细数据
    this.quoteLineDs.loadData([]);

    if (activeKey !== 'itemLine' && this.itemLineList) {
      this.itemLineList.setState({
        isShow: {},
      });
      this.setState({
        itemActivePanel: [],
        itemExpand: {},
      });
      this.itemLineList.itemLineTable = {};
    }
    if (activeKey !== 'supplierLine' && this.supplierLineList) {
      this.supplierLineList.setState({
        isShow: {},
      });
      this.setState({
        supplierActivePanel: [],
        supplierExpand: {},
      });
      this.supplierLineList.supplierLineTable = {};
    }
  }

  /**
   * 获取当前需要的customeCode
   * @param {*} includeHeader 是否含头
   */
  @Bind()
  getCurrentCustomeCode(includeHeader) {
    const { remote } = this.props;
    const { activeKey } = this.state;

    let currentAcitiveKey = activeKey;
    currentAcitiveKey = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_GET_CURRENT_CUSTOM_CODE_ACTIVEKEY',
          currentAcitiveKey,
          {
            activeKey,
            that: this,
          }
        )
      : currentAcitiveKey;

    const AttachmentListCode = this.getAttachmentLineTableAndColumnsCustomizeUnitCode() || '';
    const headerAndCostCode = `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`;

    let currentCustomeCode;
    switch (currentAcitiveKey) {
      case 'itemLine':
        currentCustomeCode = includeHeader
          ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`
          : `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`;
        break;
      case 'supplierLine':
        currentCustomeCode = includeHeader
          ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`
          : `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`;
        break;
      case 'quoteLine':
        currentCustomeCode = includeHeader
          ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`
          : `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`;
        break;
      case 'attachmentTable':
        currentCustomeCode = `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`;
        break;
      default:
        currentCustomeCode = includeHeader ? headerAndCostCode : '';
        break;
    }

    currentCustomeCode = currentCustomeCode
      ? `${currentCustomeCode},${AttachmentListCode}`
      : AttachmentListCode;

    return currentCustomeCode;
  }

  /**
   * 保存 - 核价
   * 只保存当前tab，其他tab进去重新查
   * @param {?number} refreshFlag - 是否需要刷新
   */
  @Bind()
  handleSave(sectionChange, refreshFlag = 1) {
    const { dispatch, organizationId, modelName = 'inquiryHall', remote } = this.props;
    const {
      activeKey = undefined,
      checkWay,
      routerParams: { projectLineSectionId },
    } = this.state;
    let checkPriceDTOLineList = [];

    // add ----- 分别从对应formRef中去获取form
    const save = new Promise((resolve) => {
      // const validateHeaderForm = this.validateForm('header');
      // const validateCostRemarkForm = this.validateForm('costRemark');
      const validateBasicInfoDs = this.validateBasinInfoForm();
      const validateQuoteLine = this.getCurrentEditTableDataQuoteLine(checkWay, sectionChange);
      const attachmentLineList = this.getAttachmentListTableData() || [];
      const cuxTabData = this.getCuxTabData() || {};

      // 全部校验通过后
      Promise.all([validateBasicInfoDs, validateQuoteLine])
        .then(async ([basicInfos, quoteLineValues]) => {
          const values = omit(basicInfos, 'selectionStrategy');
          const { costRemark = '', totalCost = '' } = values;
          const quoteLineParams = quoteLineValues;
          const doSave = async () => {
            checkPriceDTOLineList = await this.getCheckPriceDTOLineList();
            const customizeUnitCode = this.getCurrentCustomeCode(true);
            const { current } = this.basicInfoDs;
            const { objectVersionNumber, rfxHeaderId } =
              current?.get(['objectVersionNumber', 'rfxHeaderId']) || {};
            const allProjectLineSectionList =
              this.sectionInfo.getAllSectionList && this.sectionInfo.getAllSectionList();
            if (checkPriceDTOLineList && checkPriceDTOLineList.length) {
              const res = await dispatch({
                type: `${modelName}/saveCheckPrice`,
                payload: Object.assign(
                  {},
                  {
                    ...values,
                    costRemark,
                    totalCost,
                    objectVersionNumber,
                    rfxHeaderId,
                    organizationId,
                    projectName: activeKey === 'supplierLine' ? 'STANDARD' : undefined,
                    checkPriceDTOLineList,
                    customizeUnitCode,
                    allProjectLineSectionList,
                    attachmentLineList,
                    ...cuxTabData,
                  },
                  this.getStateParams()
                ),
              });
              return res;
            } else {
              resolve(false);
            }
          };

          // --------- 以下为刷新字段TODO -----------

          // doSave().then((res) => {
          //   if (res) {
          //     this.refreshActiveData(true);
          //   }
          // });
          if (activeKey === 'itemLine') {
            // 以下逻辑理论上可以简化, 不确定是否要区分页签保存
            doSave().then((res) => {
              if (res) {
                resolve(true);
                if (!refreshFlag) return; // 无须刷新
                if (!sectionChange) {
                  this.refreshActiveData(true);
                  this.refreshCuxTab(); // CUX TAB REFRESH
                } else if (
                  this.sectionInfo.refreshSectionList &&
                  projectLineSectionId &&
                  projectLineSectionId !== 'null'
                ) {
                  this.sectionInfo.refreshSectionList();
                }
              }
            });
          } else if (activeKey === 'supplierLine') {
            doSave().then((res) => {
              if (res) {
                resolve(true);
                if (!refreshFlag) return; // 无须刷新
                if (!sectionChange) {
                  this.refreshActiveData(true);
                  this.refreshCuxTab(); // CUX TAB REFRESH
                } else if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
                  this.sectionInfo.refreshSectionList();
                }
              } else {
                resolve(false);
              }
            });
          } else if (activeKey === 'attachmentTable') {
            doSave().then((res) => {
              if (res) {
                resolve(true);
                if (!refreshFlag) return; // 无须刷新
                if (!sectionChange) {
                  this.refreshActiveData(true);
                  this.queryHeaderInfo();
                  this.fetchLineData();
                  this.refreshCuxTab(); // CUX TAB REFRESH
                } else if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
                  this.sectionInfo.refreshSectionList();
                }
              }
            });
          } else if (this.quoteLineDs.length === 0 || !isEmpty(quoteLineParams)) {
            doSave().then((res) => {
              if (res) {
                resolve(true);
                const notRefreshFlag = remote
                  ? remote.process('SSRC_CHECK_PRICE_PROCESS_AFTER_SAVE_NOT_REFRESH_FLAG', false, {
                      refreshFlag,
                    })
                  : false;
                if (notRefreshFlag) return; // 无须刷新
                if (!sectionChange) {
                  this.refreshActiveData(true);
                  this.refreshCuxTab(); // CUX TAB REFRESH
                } else if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
                  this.sectionInfo.refreshSectionList();
                }
              }
            });
          } else {
            // 排查到代码不会走到这一步，前面校验拦截了
            // const quoteLineData = [
            //   intl
            //     .get('ssrc.inquiryHall.view.inquiryHall.quotelineLineLines')
            //     .d('全部报价明细页签的'),
            // ];
            // this.notificationTrans(quoteLineData, quoteLine, retrieveData);
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    });
    return save;
  }

  /**
   * 获取state params - [克明面业] 此方法被二开, 严禁他人删除修改
   * @protected
   * returns state参数
   */
  getStateParams() {
    const { checkAttachmentUuid } = this.state;
    return {
      checkAttachmentUuid: checkAttachmentUuid || uuidv4(),
    };
  }

  /**
   * 校验表单
   * @param {!string} prefix - 前缀
   */
  async validateForm(prefix) {
    return new Promise((resolve, reject) => {
      if (isNil(this[`${prefix}FormRef`])) {
        // 可能存在某些折叠面板, 未展开, 直接校验通过, 因为后端返回的数据, 理论上就是合理的
        return resolve({});
      }
      const { form } = this[`${prefix}FormRef`]?.props;
      // eslint-disable-next-line no-unused-expressions
      form?.validateFields((err, values) => {
        if (isEmpty(err)) {
          resolve(values);
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * 校验基础信息 = 头折叠面板 + 成本备注折叠面板
   */
  @Bind()
  async validateBasinInfoForm() {
    const { remote } = this.props;
    const validateFlag = await this.basicInfoDs.validate();
    if (validateFlag) {
      return this.basicInfoDs?.current?.toData();
    } else {
      const errMessage = remote.process('SSRC_CHECK_PRICE_PROCESS_VALIDE_BASINFO_MESSAGE', null, {
        basicInfoDs: this.basicInfoDs,
      });
      if (!errMessage) {
        throw new Error('basicInfo validate failed');
      } else {
        throw new Error('basicInfo validate failed');
      }
    }
  }

  @Bind()
  validateValue() {
    const { checkWay, activeKey } = this.state;
    return new Promise((resolve) => {
      // add ----- 分别从对应formRef中去获取form
      // const validateHeaderForm = this.validateForm('header');
      // const validateCostRemarkForm = this.validateForm('costRemark');
      const validateBasicInfoDs = this.validateBasinInfoForm();
      const validateQuoteLine = this.getCurrentEditTableDataQuoteLine(checkWay);
      // 全部校验通过后
      Promise.all([validateBasicInfoDs, validateQuoteLine])
        .then(async ([, quoteLineValues]) => {
          const quoteLineParams = quoteLineValues;
          if (
            (activeKey === 'itemLine' && (await this.validateItemLinesDs())) ||
            (activeKey === 'supplierLine' && (await this.validateSupplierLinesDs())) ||
            (activeKey === 'quoteLine' &&
              (this.quoteLineDs.length === 0 || !isEmpty(quoteLineParams))) ||
            activeKey === 'attachmentList'
          ) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    });
  }

  @Bind()
  async afterOpenSection(rfxHeaderId, saveFlag) {
    const { dispatch } = this.props;
    const { routerParams } = this.state;
    const search = querystring.stringify({
      ...routerParams,
    });
    if (saveFlag) {
      await this.handleSave(true);
    }
    // fix: 在tab未切换到供应商时, 该ref不存在
    // eslint-disable-next-line no-unused-expressions
    this.supplierLineList?.setState({
      isShow: {},
    });
    this.setState({
      supplierActivePanel: [],
      supplierExpand: {},
    });
    await dispatch(
      routerRedux.replace({
        pathname: `${this.activeTabKey}/check-price/${rfxHeaderId}`,
        search,
      })
    );
    this.openC7nProcessAttachmentModal = openC7nProcessAttachmentModal({ rfxHeaderId });
  }

  /**
   * 根据核价方式获取当前的表格数据  - [立讯精密] 调用
   * @param {*} sourceType 数据来源 - `itemLine/supplierLine`
   * @protected
   */
  @Bind()
  getCurrentEditTableData(sourceType) {
    const { remote } = this.props;
    const { checkWay } = this.state;
    const editData = [];
    if (sourceType === 'itemLine') {
      const { itemLineTable = {} } = this.itemLineList || {};
      if (isNil(itemLineTable)) return [];

      const itemLineTableMap = remote
        ? remote.process(
            'SSRC_CHECK_PRICE_PROCESS_ITEM_LINE_TABLE_DATE_CONSOLIDATED',
            itemLineTable,
            { itemLineTable, that: this, bidFlag: this.bidFlag }
          )
        : itemLineTable;

      Object.values(itemLineTableMap).forEach((ds) => {
        editData.push(...ds.toJSONData());
      });
    } else {
      const { supplierLineTable = {} } = this.supplierLineList || {};
      if (isNil(supplierLineTable)) return [];
      Object.values(supplierLineTable).forEach((ds) => {
        editData.push(...ds.toJSONData());
      });
    }
    const returnEditData =
      checkWay === 'quantity'
        ? editData.map((item) => ({
            ...item,
            allottedRatio: null,
          }))
        : editData.map((item) => ({
            ...item,
            allottedSecondaryQuantity: null,
            allottedQuantity: null,
          }));
    return returnEditData;
  }

  /**
   * 根据核价方式获取当前的表格数据 全部报价明细
   * @param {*} data 校验行数据
   * @param {*} checkWay 核价方式
   * @param {*} flag 是否需要走validate方法
   */
  @Bind()
  async getCurrentEditTableDataQuoteLine(checkWay, flag = false) {
    const validateFlag = !flag || (await this.quoteLineDs.validate());
    let returnEditData = [];
    if (validateFlag) {
      const editData = this.quoteLineDs.toData();
      returnEditData =
        checkWay === 'quantity'
          ? editData.map((item) => ({
              ...item,
              allottedRatio: null,
            }))
          : editData.map((item) => ({
              ...item,
              allottedSecondaryQuantity: null,
              allottedQuantity: null,
            }));
    }
    return returnEditData;
  }

  @Bind()
  async getCheckPriceDTOLineList() {
    const {
      modelName = 'inquiryHall',
      [modelName]: { itemLine = [], supplierLine = [] },
      remote,
    } = this.props;
    const { activeKey, checkWay } = this.state;
    let checkPriceDTOLineList = [];
    const itemQuoteLineParams = this.getCurrentEditTableData('itemLine');
    const supplierQuoteLineParams = this.getCurrentEditTableData('supplierLine');
    const quoteLineParams = await this.getCurrentEditTableDataQuoteLine(checkWay);
    if (activeKey === 'itemLine') {
      const getCheckPriceDTOLineList = (params = {}) => {
        const { list = [] } = params;
        checkPriceDTOLineList = list;
      };
      const eventProps = {
        itemLine,
        itemQuoteLineParams,
        checkPriceDTOLineList,
        itemLineListForm: this.itemLineList?.props?.form,
        getCheckPriceDTOLineList,
        list: itemLine.map((item) => {
          return {
            quotationLineList: itemQuoteLineParams
              // eslint-disable-next-line
              .filter((r) => r.rfxLineItemId == item.rfxLineItemId),
            rfxLineItemId: item.rfxLineItemId,
            rfxLineItemNum: item.rfxLineItemNum,
            selectionStrategy: item.selectionStrategy,
            objectVersionNumber: item.objectVersionNumber,
            type: 'ITEM',
          };
        }),
      };
      if (remote?.event) {
        remote.event.fireEvent('handleGetCheckPriceDTOLineList', eventProps);
      } else {
        getCheckPriceDTOLineList(eventProps);
      }
    } else if (activeKey === 'supplierLine') {
      checkPriceDTOLineList = supplierLine.map((item) => {
        return {
          quotationLineList: supplierQuoteLineParams.filter(
            // eslint-disable-next-line
            (r) => r.rfxLineSupplierId == item.rfxLineSupplierId
          ),
          supplierName: item.supplierCompanyName,
          type: 'SUPPLIER',
          rfxLineSupplierId: item.rfxLineSupplierId,
          supplierTenantId: item.supplierTenantId,
          wholeSuggestFlag:
            item.rfxLineSupplierId &&
            this.supplierLineList?.props?.form?.getFieldValue(`value#${item.rfxLineSupplierId}`)
              ? 1
              : 0,
          quotationHeaderId: item.quotationHeaderId,
        };
      });
    } else {
      checkPriceDTOLineList = [
        {
          quotationLineList: quoteLineParams,
          type: 'DETAIL',
        },
      ];
    }
    return checkPriceDTOLineList;
  }

  // 校验完毕处理
  // AllottedRatioGreaterHundred: 0
  // itemNums: "物品行[2]默认选择策略为[取消询价]"
  // supplierStageAllowBidSoft: "中标供应商存在[合格]阶段供应商，是否确认提交？"
  handleValidateResult = (data = {}) => {
    const { result = {}, check = null, doSubmit = () => {}, onlyAllowAllWinBids } = data;
    if (isEmpty(result)) {
      return;
    }

    const {
      // AllottedRatioGreaterHundred,
      // supplierStageAllowSource,
      // chooseSelectionStrategy = 0, // supplierLine 供应商行是否未中标
      // itemNums, // 物品行策略有默认策略，提示文字
      totalMoreThanBudgetStrong = null, // 强控-核价总金额超过了预算总金额
      // totalMoreThanBudgetWeak = null, // 弱控-核价总金额超过了预算总金
      supplierStageAllowBidForce = null, // 强管控  配置中心-供应商生命周期管理
      // supplierStageAllowBidSoft = null, // 弱管控
    } = result || {};

    if (totalMoreThanBudgetStrong === 1 || supplierStageAllowBidForce) {
      ModalH0.warning({
        content: (
          <div>
            <div>
              {intl
                .get('ssrc.inquiryHall.view.commonAmountTooMuchSubmit', {
                  checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
                })
                .d('{checkPriceName}总金额超过了预算总金额，无法提交')}
            </div>
            {supplierStageAllowBidForce ? <div>{supplierStageAllowBidForce}</div> : null}
          </div>
        ),
        onCancel: () => {},
      });
      return;
    }

    const resultKeys = Object.keys(result).filter(
      (key) => key !== 'totalMoreThanBudgetStrong' || key !== 'supplierStageAllowBidForce'
    );
    const resultLen = (Object.keys(resultKeys) || []).length;
    let currentStep = 0;

    const judgeHandleOk = () => {
      if (currentStep === -1) {
        return;
      }
      if (currentStep === resultLen - 1) {
        doSubmit();
      }
      if (currentStep < resultLen) {
        currentStep += 1;
        renderModal();
      }
    };

    const cancelModal = () => {
      currentStep = -1;
    };

    const softValidate = (key = null, value = null) => {
      if (key === 'itemNums' || value) {
        ModalH0.confirm({
          content: `${value},${intl
            .get('ssrc.inquiryHall.model.inquiryHall.continueSubmit')
            .d('是否继续提交?')}`,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (key === 'AllottedRatioGreaterHundred' && check === 'ratio') {
        ModalH0.confirm({
          content: `${intl
            .get('ssrc.inquiryHall.view.message.commonAllottedRatioOverOneHundred', {
              checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
            })
            .d('分配比例之和超过了100，是否继续提交{checkPriceName}?')}`,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (key === 'supplierStageAllowSource') {
        ModalH0.confirm({
          content: `${intl
            .get('ssrc.inquiryHall.view.notification.commonLifeCycleStateInvalidate', {
              checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
            })
            .d('中标供应商存在非合格供应商，请确认是否提交{checkPriceName}?')}`,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (onlyAllowAllWinBids && key === 'chooseSelectionStrategy' && value) {
        ModalH0.confirm(
          {
            title: intl
              .get('ssrc.inquiryHall.view.message.sureGiveupPolicy')
              .d('请确认整包的放弃策略'),
            content: this.getAllWinBidModal(),
            onOk: () => {
              const { currentSelectionPolicy } = this.state;
              if (currentSelectionPolicy === 'RECOMMENDATION') {
                return new Promise((resolve, reject) => {
                  reject();
                });
              }
              const supplierDynamicParams = {
                selectionStrategy: currentSelectionPolicy,
              };
              doSubmit(supplierDynamicParams);
            },
            onCancel: () => this.resetPolicyDefault(),
          },
          () => this.resetPolicyDefault()
        );
      } else if (key === 'totalMoreThanBudgetWeak' && value === 0) {
        ModalH0.confirm({
          content: intl
            .get('ssrc.inquiryHall.view.commonSureSumbitAsTooMuchAmount', {
              checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
            })
            .d('{checkPriceName}总金额超过了预算总金额，是否确认提交？'),
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (key === 'supplierStageAllowBidSoft' && value) {
        ModalH0.confirm({
          content: value,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else {
        doSubmit();
      }
    };

    const renderModal = () => {
      const finishedFlag = currentStep > resultLen - 1;
      if (finishedFlag) {
        return;
      }

      const currentKey = resultKeys[currentStep];
      const currentValue = result[currentKey];

      softValidate(currentKey, currentValue);
    };

    renderModal();
  };

  /**
   * 提交 - 核价
   */
  @Bind()
  handleSubmit(submitFlag) {
    const {
      dispatch,
      organizationId,
      history,
      modelName = 'inquiryHall',
      remote,
      match: { params: routerParams = {} },
    } = this.props;
    const { activeKey = undefined, checkWay, readConfig } = this.state;
    const { current } = this.basicInfoDs;
    const onlyAllowAllWinBids = current?.get('onlyAllowAllWinBids') || 0;
    const recommendStrategy = current?.get('recommendStrategy') || '';
    const sectionFlag =
      this.sectionInfo.isSectionListEmpty && !this.sectionInfo.isSectionListEmpty();
    const extraProps = {};
    if (
      sectionFlag &&
      this.sectionInfo.getCheckedSectionList().length < 1 &&
      readConfig.configValue !== 'hide' &&
      !submitFlag
    ) {
      this.setState({
        batchEmptySelectedModalVisible: true,
        currentButton: 'checkPricew',
      });
    } else {
      // const validateHeaderForm = this.validateForm('header');
      // const validateCostRemarkForm = this.validateForm('costRemark');
      const validateBasicInfoDs = this.validateBasinInfoForm();
      const validateQuoteLine = this.getCurrentEditTableDataQuoteLine(checkWay, submitFlag);
      const cuxTabData = this.getCuxTabData() || {};

      // 全部校验通过后
      return Promise.all([validateBasicInfoDs, validateQuoteLine]).then(
        async ([basicInfos, quoteLineValues]) => {
          const values = remote
            ? remote.process(
                'SSRC_CHECK_PRICE_PROCESS_BASE_INFO_PARAMS',
                omit(basicInfos, 'selectionStrategy'),
                { checkWay }
              )
            : omit(basicInfos, 'selectionStrategy');
          const quoteLineParams = quoteLineValues;
          const submitted = async (params = {}, callback = () => {}) => {
            const checkPriceDTOLineList = await this.getCheckPriceDTOLineList();
            const customizeUnitCode = this.getCurrentCustomeCode(true);
            const sectionChecked = this.sectionInfo.getCheckedSectionList() || [];
            const checkedSection = remote
              ? remote.process(
                  'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_LIST_PARAMS',
                  sectionChecked,
                  { sectionInfo: this.sectionInfo }
                )
              : sectionChecked;
            const chooseCurrentFlag = checkedSection.some(
              (item) => String(item.sourceHeaderId) === String(routerParams?.rfxId)
            );
            const allProjectLineSectionList =
              this.sectionInfo.getAllSectionList && this.sectionInfo.getAllSectionList();
            const sectionCheckedParams = this.sectionInfo.getCheckedSectionList() || [];
            const attachmentLineList = this.getAttachmentListTableData() || [];
            const commonData =
              chooseCurrentFlag || isEmpty(checkedSection)
                ? Object.assign(
                    {},
                    {
                      ...values,
                      objectVersionNumber: values.objectVersionNumber,
                      rfxHeaderId: values.rfxHeaderId || routerParams?.rfxId,
                      organizationId,
                      checkPriceDTOLineList,
                      customizeUnitCode,
                      ...params,
                      attachmentLineList,
                      projectLineSectionList: remote
                        ? remote.process(
                            'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_LIST_PARAMS_DATA',
                            sectionCheckedParams,
                            { sectionInfo: this.sectionInfo }
                          )
                        : sectionCheckedParams,
                      allProjectLineSectionList,
                      ...cuxTabData, // cux tab
                    },
                    this.getStateParams()
                  )
                : {
                    rfxHeaderId: values.rfxHeaderId || routerParams?.rfxId,
                    organizationId,
                    projectLineSectionList: this.sectionInfo.getCheckedSectionList(),
                  };
            const otherParams = remote
              ? remote.process(
                  'SSRC_CHECK_PRICE_PROCESS_SUBMIT_OTHER_PARAMS',
                  {},
                  {
                    that: this,
                  }
                )
              : {};
            const DoSubmit = (operation = {}) => {
              const beforeSubmit = () => {
                dispatch({
                  type:
                    checkedSection.length > 0
                      ? `${modelName}/checkPriceSectionSubmit`
                      : `${modelName}/submitCheckPrice`,
                  payload: {
                    ...commonData,
                    ...operation,
                    ...otherParams,
                  },
                }).then((res) => {
                  if (remote?.event) {
                    const eventProps = {
                      res,
                      dispatch,
                      checkedSection,
                      modelName,
                      commonData,
                      operation,
                      submitData: {
                        ...commonData,
                        ...operation,
                      },
                      callback,
                      handleAfterSubmit: this.handleAfterSubmit,
                      queryPageMainData: this.queryPageMainData,
                      that: this,
                    };

                    remote.event.fireEvent('afterSubmitCheckPrice', eventProps);
                  } else {
                    callback();
                    this.handleAfterSubmit(res, operation);
                  }
                });
              };
              if (remote?.event) {
                remote.event.fireEvent('beforeSubmit', {
                  beforeSubmit,
                  that: this,
                  handleBeSave: this.handleBeSave,
                });
              } else {
                beforeSubmit();
              }
            };
            // 华住-提交前弹窗弱校验
            const { SSRC_CHECK_PRICE_PROCESS_SUBMIT_BEFORE_VALIDATE = undefined } =
              remote?.props?.process || {};
            if (isFunction(SSRC_CHECK_PRICE_PROCESS_SUBMIT_BEFORE_VALIDATE)) {
              await SSRC_CHECK_PRICE_PROCESS_SUBMIT_BEFORE_VALIDATE(commonData, {
                ...this.props,
                that: this,
              });
            }
            let validateResult = [];
            dispatch({
              type:
                checkedSection.length > 0
                  ? `${modelName}/checkPriceSectionSubmitValidate`
                  : `${modelName}/validateBeforeSubmit`,
              payload: {
                ...commonData,
              },
            }).then(async (res) => {
              const otherProps = {
                handleSave: this.handleSave,
                res,
                that: this,
              };
              const resFlag = remote
                ? await remote.process(
                    'SSRC_CHECK_PRICE_PROCESS_VALIDATE_RES_FLAG',
                    !res,
                    otherProps
                  )
                : !res;
              if (resFlag) {
                return;
              }

              if (checkedSection.length > 0 && res.length) {
                this.setState({
                  sectionMessageVisible: true,
                  operateSectionPromptProps: {
                    visible: true,
                    handleCancel: () => {
                      this.setState({
                        sectionMessageVisible: false,
                      });
                    },
                    handleOk: () => {
                      const flag = res.find(
                        (item) => item.messageCode === 'session_no_suggest_supplier'
                      );
                      if (flag) {
                        ModalH0.confirm(
                          {
                            title: intl
                              .get('ssrc.inquiryHall.view.message.sureGiveupPolicy')
                              .d('请确认整包的放弃策略'),
                            content: this.getAllWinBidModal(),
                            onOk: () => {
                              const { currentSelectionPolicy } = this.state;
                              if (currentSelectionPolicy === 'RECOMMENDATION') {
                                return new Promise((resolve, reject) => {
                                  reject();
                                });
                              }
                              const supplierDynamicParams = {
                                selectionStrategy: currentSelectionPolicy,
                              };
                              DoSubmit(supplierDynamicParams);
                            },
                            onCancel: () => this.resetPolicyDefault(),
                          },
                          () => this.resetPolicyDefault()
                        );
                      } else {
                        DoSubmit();
                      }
                      this.setState({
                        sectionMessageVisible: false,
                      });
                    },
                    dataList: res,
                  },
                });
              } else {
                validateResult = cloneDeep(res);
                /**
                 * 提交前校验
                 * @param {*} props 提交的传参
                 * @returns void
                 */
                const confirmSubmit = () => {
                  if (isEmpty(validateResult)) {
                    DoSubmit(extraProps);
                    return;
                  }
                  if (this.cuxValidate && this.cuxValidate(res)) {
                    // cuxValidate在二开类的prototype上
                    return;
                  }
                  const currentObj = validateResult[0];
                  if (currentObj.type === 'ERROR') {
                    ModalH0.error({
                      content: <div dangerouslySetInnerHTML={{ __html: currentObj.message }} />,
                      onOk: () => {
                        if (currentObj.jumpUrl) {
                          history.push(currentObj.jumpUrl);
                        }
                      },
                    });
                  } else if (
                    currentObj.confirmVariable === 'allWinBidsConfirmFlag' &&
                    onlyAllowAllWinBids
                  ) {
                    // 这里处理一些特殊情况，可以用if else做延伸
                    ModalH0.confirm(
                      {
                        title: intl
                          .get('ssrc.inquiryHall.view.message.sureGiveupPolicy')
                          .d('请确认整包的放弃策略'),
                        content: this.getAllWinBidModal(),
                        onOk: () => {
                          const { currentSelectionPolicy } = this.state;
                          if (currentSelectionPolicy === 'RECOMMENDATION') {
                            return new Promise((resolve, reject) => {
                              reject();
                            });
                          }
                          validateResult.splice(0, 1);
                          extraProps.selectionStrategy = currentSelectionPolicy;
                          confirmSubmit();
                        },
                        onCancel: () => this.resetPolicyDefault(),
                      },
                      () => this.resetPolicyDefault()
                    );
                  } else if (
                    currentObj?.confirmVariable === 'itemSuggestConfirmFlag' &&
                    currentObj?.type === 'WARNING'
                  ) {
                    let btnObj = {
                      CANCEL: (
                        <Tooltip title={selectionInfoMap().CANCEL}>
                          <ButtonH0
                            onClick={() => {
                              if (remote?.event) {
                                const eventProps = {
                                  validateResult,
                                };
                                remote.event.fireEvent('cancelFunc', eventProps);
                              }
                              validateResult.splice(0, 1);
                              warningModal.close();
                              extraProps.batchSelectionStrategy = 'CANCEL';
                              confirmSubmit();
                            }}
                          >
                            {this.bidFlag
                              ? intl.get('ssrc.inquiryHall.dropdown.cancelBid').d('完成招标')
                              : intl.get('ssrc.inquiryHall.dropdown.cancel').d('完成询价')}
                          </ButtonH0>
                        </Tooltip>
                      ),
                      RELEASE: (
                        <Tooltip title={selectionInfoMap().RELEASE}>
                          <ButtonH0
                            onClick={() => {
                              if (remote?.event) {
                                const eventProps = {
                                  validateResult,
                                };
                                remote.event.fireEvent('releaseFunc', eventProps);
                              }
                              validateResult.splice(0, 1);
                              warningModal.close();
                              extraProps.batchSelectionStrategy = 'RELEASE';
                              confirmSubmit();
                            }}
                          >
                            {this.bidFlag
                              ? intl.get('ssrc.inquiryHall.dropdown.releaseBid').d('取消招标')
                              : intl.get('ssrc.inquiryHall.dropdown.release').d('取消询价')}
                          </ButtonH0>
                        </Tooltip>
                      ),
                    };

                    btnObj = remote
                      ? remote.process(
                          'SSRC_CHECK_PRICE_PROCESS_RECOMMENDATION_MODAL_BUTTONS_OBJ',
                          btnObj,
                          otherProps
                        )
                      : btnObj;
                    btnObj = btnObj || {};

                    const warningModal = c7nModal.open({
                      children: currentObj.message,
                      footer: (ok, onCancel) => (
                        <>
                          {onCancel}
                          {(recommendStrategy.split(',') || []).map((item) => btnObj[item])}
                          {recommendStrategy.includes('RECOMMENDATION') && ok}
                        </>
                      ),
                      key: c7nModal.key(),
                      title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
                      border: false,
                      bodyStyle: { 'padding-top': 0 },
                      okText: (
                        <Tooltip title={selectionInfoMap().RECOMMENDATION}>
                          {intl.get('ssrc.inquiryHall.view.button.selectSupplier').d('选用供应商')}
                        </Tooltip>
                      ),
                    });
                  } else {
                    // 统一处理只提交操作的
                    const validateFunc = () =>
                      ModalH0.confirm({
                        title: intl.get('ssrc.inquiryHall.view.title.tips').d('提示'),
                        // eslint-disable-next-line react/no-danger
                        content: (
                          <div
                            style={{ maxHeight: 450, overflow: 'scroll' }}
                            dangerouslySetInnerHTML={{ __html: currentObj.message }}
                          />
                        ),
                        onOk: () => {
                          validateResult.splice(0, 1);
                          confirmSubmit();
                        },
                        onCancel: () => {},
                      });
                    if (remote?.event) {
                      const eventProps = {
                        basicInfoDs: this.basicInfoDs,
                        current: this,
                        bidFlag: this.bidFlag,
                        currentObj,
                        validateResult,
                        confirmSubmit,
                        validateFunc,
                        extraProps,
                      };
                      remote.event.fireEvent('validateFunc', eventProps);
                    } else {
                      validateFunc();
                    }
                  }
                };
                confirmSubmit();
              }
            });
          };

          if (activeKey === 'itemLine') {
            // 先校验物料行选择策略
            // eslint-disable-next-line no-unused-expressions
            this.itemLineList?.props?.form?.validateFields(async (error) => {
              if (!isEmpty(error)) {
                return;
              }
              const checkPriceDTOLineList = await this.getCheckPriceDTOLineList();
              const newList = checkPriceDTOLineList.filter(
                (item) =>
                  item.selectionStrategy === 'RECOMMENDATION' || item.selectionStrategy === 'CANCEL'
              );

              const submitItem = () => {
                submitted({}, () => {
                  this.setState({ newList });
                });
              };

              submitItem();
            });
          } else if (activeKey === 'supplierLine') {
            const submitSupplier = () => {
              submitted({
                projectName: 'STANDARD',
                onlyAllowAllWinBids,
              });
            };

            submitSupplier();
            this.resetPolicyDefault();
          } else if (this.quoteLineDs.length === 0 || !isEmpty(quoteLineParams)) {
            submitted(
              remote
                ? remote.process(
                    'SSRC_CHECK_PRICE_PROCESS_SUBMITTED_QUOTE',
                    {},
                    { strategyDs: this.allQuoteLineRef.current?.strategyDs?.current, modelName }
                  )
                : {}
            );
          }
        }
      );
    }
  }

  /**
   * [华友钴业] 二开方法,用于生成纯二开路由的跳转地址
   * @protected
   * */
  generateNewPath() {
    return false;
  }

  /**
   * 核价提交通用处理程序
   * */
  @Bind()
  async handleAfterSubmit(res = {}, operation = {}) {
    const { dispatch, remote } = this.props;
    // const { routerParams } = this.state;
    // const { current } = routerParams;
    let pathname;

    const remoteCreateFlag = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_CREATE_ITEM_FLAG', true)
      : true;

    const sectionCheckedIds =
      (this.sectionInfo?.getCheckedSectionList() || [])?.map((item) => item.sourceHeaderId) || [];
    const rfxHeaderIds = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_ID_LIST_PRICE_MODAL_PARAMS',
          sectionCheckedIds,
          { sectionInfo: this.sectionInfo }
        )
      : sectionCheckedIds;

    switch (res) {
      case 0: // 不可以创建/补充
        this.setState({
          createItemFlag: res,
          pricingModalVisible: false,
        });
        notification.success();
        // eslint-disable-next-line no-case-declarations
        const newPath = await this.generateNewPath();
        if (newPath) {
          dispatch(
            routerRedux.replace({
              pathname: newPath.pathname,
              search: newPath.search,
            })
          );
          return;
        }
        pathname = `${this.activeTabKey}/list`;
        dispatch(
          routerRedux.push({
            pathname,
          })
        );
        break;
      case 1: // 可创建物料编码
        if (remoteCreateFlag) {
          this.openItemModal({
            createItemFlag: res,
            rfxHeaderIds,
            priceModalBatchSelectionStrategy: operation?.batchSelectionStrategy || '',
          });
        } else {
          this.setState({
            createItemFlag: res,
            pricingModalVisible: true,
            priceModalBatchSelectionStrategy: operation?.batchSelectionStrategy || '',
          });
        }
        break;
      case 2: // 可补充物料编码
        if (remoteCreateFlag) {
          this.openItemModal({
            createItemFlag: res,
            rfxHeaderIds,
            priceModalBatchSelectionStrategy: operation?.batchSelectionStrategy || '',
          });
        } else {
          this.setState({
            createItemFlag: res,
            pricingModalVisible: true,
            priceModalBatchSelectionStrategy: operation?.batchSelectionStrategy || '',
          });
        }
        break;
      case 3: // 必须补充物料编码
        if (remoteCreateFlag) {
          this.openItemModal({
            createItemFlag: res,
            rfxHeaderIds,
            priceModalBatchSelectionStrategy: operation?.batchSelectionStrategy || '',
          });
        } else {
          this.setState({
            createItemFlag: res,
            pricingModalVisible: true,
            priceModalBatchSelectionStrategy: operation?.batchSelectionStrategy || '',
          });
        }
        break;
      default:
        this.setState({
          createItemFlag: res,
          pricingModalVisible: false,
        });
        break;
    }
  }

  @Bind()
  async openItemModal(createItemConfig) {
    const { activeKey = undefined, checkAttachmentUuid = '', currentSelectionPolicy } = this.state;
    const {
      modelName = 'inquiryHall',
      [modelName]: { itemLine = [], supplierLine = [] },
      organizationId,
      history,
      remote,
      c7n: { custTable: customizeTable = noop },
      dispatch,
    } = this.props;
    const supplierDynamicParams =
      activeKey === 'supplierLine'
        ? {
            selectionStrategy: currentSelectionPolicy,
          }
        : {};
    const { current } = this.basicInfoDs;
    const sourceCheckedId =
      (this.sectionInfo?.getCheckedSectionList() || [])?.map((item) => item.sourceHeaderId)[0] ||
      '';
    const { rfxHeaderId } = current?.get(['rfxHeaderId']) || {};
    if (!rfxHeaderId) {
      return;
    }
    const { createItemFlag, rfxHeaderIds, priceModalBatchSelectionStrategy = '' } =
      createItemConfig || {};
    const title =
      createItemFlag === 1
        ? intl.get('ssrc.inquiryHall.view.title.createItem').d('创建物料')
        : intl.get('ssrc.inquiryHall.view.modalTitle.updateMaterial').d('补充物料');
    const itemDs = (createItemFlag === 1 ? createItemDS : updateItemDS)({
      createItemFlag,
      headerDs: this.basicInfoDs,
      notSuggestRfxLineIds: '',
    });
    const itemDsRemote = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_SUPPLEMENTARY_ITEM_DS', itemDs, {
          createItemFlag,
          that: this,
        })
      : itemDs;
    const supplementaryItemDs = new DataSet(itemDsRemote);
    let checkPriceDTOLineList = {};
    const itemQuoteLineParams = this.getCurrentEditTableData('itemLine');
    const supplierQuoteLineParams = this.getCurrentEditTableData('supplierLine');
    let quoteLineParams = [];
    let newQuoteLine = [];
    if (await this.quoteLineDs.validate()) {
      newQuoteLine = this.quoteLineDs.toData();
    }
    const formatDate = (item = {}) => {
      if (!item || isEmpty(item)) {
        return {};
      }

      const { validExpiryDateFrom = null, validExpiryDateTo = null } = item;
      const DateTimeFormat = getDateTimeFormat();

      return {
        validExpiryDateFrom:
          validExpiryDateFrom && validExpiryDateFrom?.format
            ? validExpiryDateFrom.format(DateTimeFormat)
            : validExpiryDateFrom,
        validExpiryDateTo:
          validExpiryDateTo && validExpiryDateTo?.format
            ? validExpiryDateTo.format(DateTimeFormat)
            : validExpiryDateTo,
      };
    };
    quoteLineParams = newQuoteLine.map((item) => {
      const dateTime = formatDate(item);
      if (item.suggestedFlag) {
        return { ...item, selectionStrategy: 'RECOMMENDATION', ...dateTime };
      } else {
        return { ...item, selectionStrategy: null, ...dateTime };
      }
    });
    if (activeKey === 'itemLine') {
      checkPriceDTOLineList = itemLine.map((item) => {
        return {
          quotationLineList: itemQuoteLineParams
            // eslint-disable-next-line
            .filter((ele) => ele.rfxLineItemId == item.rfxLineItemId),
          rfxLineItemId: item.rfxLineItemId,
          rfxLineItemNum: item.rfxLineItemNum,
          selectionStrategy: item.selectionStrategy,
          objectVersionNumber: item.objectVersionNumber,
          type: 'ITEM',
        };
      });
    } else if (activeKey === 'supplierLine') {
      checkPriceDTOLineList = supplierLine.map((item) => {
        return {
          quotationLineList: supplierQuoteLineParams
            // eslint-disable-next-line
            .filter((r) => r.rfxLineSupplierId == item.rfxLineSupplierId),
          supplierName: item.supplierCompanyName,
          type: 'SUPPLIER',
          rfxLineSupplierId: item.rfxLineSupplierId,
          supplierTenantId: item.supplierTenantId,
          wholeSuggestFlag:
            item.rfxLineSupplierId &&
            this.supplierLineList?.props?.form?.getFieldValue(`value#${item.rfxLineSupplierId}`)
              ? 1
              : 0,
          quotationHeaderId: item.quotationHeaderId,
        };
      });
    } else {
      checkPriceDTOLineList = [
        {
          quotationLineList: quoteLineParams,
          type: 'DETAIL',
        },
      ];
    }
    const headerValue = current?.toData() || {};
    const sectionChecked = this.sectionInfo.getCheckedSectionList() || [];
    const commonParams = {
      ...headerValue,
      allProjectLineSectionList:
        this.sectionInfo.getAllSectionList && this.sectionInfo.getAllSectionList(),
      projectLineSectionList: remote
        ? remote.process(
            'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_LIST_PRICE_MODAL_PARAMS',
            sectionChecked,
            { sectionInfo: this.sectionInfo }
          )
        : sectionChecked,
      organizationId,
      createItemFlag,
      checkAttachmentUuid,
      ...supplierDynamicParams,
    };
    const batchImportProps = ({ sectionHeaderId }) => ({
      buttonText: intl.get('ssrc.inquiryHall.view.excelImport').d('Excel导入'),
      businessObjectTemplateCode: 'SSRC.RFX_CHECK_CREATE_ITEM.IMPORT',
      prefixPatch: SRM_SSRC,
      tenantId: organizationId,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: sectionHeaderId,
        templateCode: 'SSRC.RFX_CHECK_CREATE_ITEM.IMPORT',
        fromExport: true,
      },
      auto: true,
      refreshButton: true,
      action: title,
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_CHECK_CREATE_ITEM_DOWNLOAD_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/check/create-item/template/export`,
        queryParams: {
          tenantId: organizationId,
          organizationId,
          rfxHeaderId: sectionHeaderId,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD`,
        },
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
      successCallBack: () => {
        supplementaryItemDs.reset();
        supplementaryItemDs.query();
      },
    });
    const drawerProps = {
      remote,
      remotePrefix: 'SSRC_CHECK_PRICE',
      createItemFlag,
      rfxHeaderId: sourceCheckedId || rfxHeaderId,
      rfxHeaderIds,
      projectLineSectionList: remote
        ? remote.process(
            'SSRC_CHECK_PRICE_PROCESS_CHECKED_SECTION_LIST_PRICE_MODAL_PARAMS',
            sectionChecked,
            { sectionInfo: this.sectionInfo }
          )
        : sectionChecked,
      dataSet: supplementaryItemDs,
      sourceKey: this.sourceKey,
      title:
        createItemFlag === 1
          ? intl.get('ssrc.inquiryHall.view.modalTitle.createMaterial').d('创建物料')
          : intl.get('ssrc.inquiryHall.view.modalTitle.updateMaterial').d('补充物料'),
      checkPriceDTOLineList,
      commonParams,
      batchImportProps,
      customizeTable,
      basicInfoDs: this.basicInfoDs,
    };
    supplementaryItemDs.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD,SSRC.${
        this.sourceKey
      }_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEM_FILTER_BAR,SSRC.${
        this.sourceKey
      }_HALL_CHECK_PRICE.COST,${
        activeKey === 'itemLine'
          ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`
          : activeKey === 'supplierLine'
          ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`
          : `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`
      }`
    );
    supplementaryItemDs.setQueryParameter('sectionHeaderId', sourceCheckedId || rfxHeaderId);
    supplementaryItemDs.setQueryParameter('commonData', commonParams);
    supplementaryItemDs.setQueryParameter('checkPriceDTOLineList', checkPriceDTOLineList);
    supplementaryItemDs.query();
    const otherProps = {
      queryPageMainData: this.queryPageMainData,
      dispatch,
      modelName,
      that: this,
    };
    const otherModalSetting = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_CREATE_ITEM_MODEL_OTHER_SETTING', {}, otherProps)
      : {};
    c7nModal.open({
      key: c7nModal.key(),
      drawer: true,
      style: {
        width: 1000,
      },
      title,
      children: <SupplementaryItemDrawer {...drawerProps} />,
      onOk: async () => {
        const itemValidateFlag = await supplementaryItemDs.validate();
        if (!itemValidateFlag) return false;
        const rfxLineItemList = (supplementaryItemDs || []).map((record) => {
          return {
            ...record.toData(),
            checkFlag: Number(record.isSelected),
          };
        });
        const AttachmentListCode = this.getAttachmentLineTableAndColumnsCustomizeUnitCode() || '';
        const attachmentLineList = this.getAttachmentListTableData() || [];
        const cachedModifiedData = (supplementaryItemDs?.cachedModified || []).map((record) => {
          return {
            ...record.toData(),
            checkFlag: Number(record.isSelected),
          };
        });
        const otherParams = remote
          ? remote.process(
              'SSRC_CHECK_PRICE_PROCESS_CREATE_ITEM_MODEL_PARAMS',
              {},
              {
                that: this,
                rfxLineItemList,
                cachedModifiedData,
                supplementaryItemDs,
              }
            )
          : {};
        const params = {
          ...commonParams,
          checkPriceDTOLineList,
          rfxLineItemList: [...rfxLineItemList, ...cachedModifiedData],
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEM_LINE_ADD,SSRC.${
            this.sourceKey
          }_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${
            this.sourceKey
          }_HALL_CHECK_PRICE.ITEM_FILTER_BAR,SSRC.${
            this.sourceKey
          }_HALL_CHECK_PRICE.COST,${AttachmentListCode},${
            activeKey === 'itemLine'
              ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`
              : activeKey === 'supplierLine'
              ? `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`
              : `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`
          }`,
          batchSelectionStrategy: priceModalBatchSelectionStrategy,
          attachmentLineList,
          ...otherParams,
        };
        // 确认前弱校验物料提示
        const { SSRC_CHECK_PRICE_PROCESS_CREATE_ITEM_MODEL_VALIDATE = undefined } =
          remote?.props?.process || {};
        if (isFunction(SSRC_CHECK_PRICE_PROCESS_CREATE_ITEM_MODEL_VALIDATE)) {
          await SSRC_CHECK_PRICE_PROCESS_CREATE_ITEM_MODEL_VALIDATE(params, { ...this.props });
        }
        const res = getResponse(await pricingSave(params));
        if (res) {
          notification.success({
            message: intl
              .get('ssrc.inquiryHall.model.inquiryHall.checkPriceSubmitSuccess', {
                checkPriceName: getCheckPriceName(this.bidFlag),
              })
              .d('{checkPriceName}提交成功'),
          });
          history.push(`${this.activeTabKey}/list`);
        }
        return false;
      },
      footer: (okBtn, cancelBtn) => (
        <>
          {okBtn}
          <Button type="primary" onClick={() => supplementaryItemDs.forceSubmit()}>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.onlySaveButton').d('仅保存')}
          </Button>
          {cancelBtn}
        </>
      ),
      ...otherModalSetting,
    });
  }

  // 重置页面选择策略为询价单默认值
  @Bind()
  resetPolicyDefault() {
    this.setState({
      currentSelectionPolicy: null,
    });
  }

  // 核价提交选择策略
  @Bind()
  changePolicy(val) {
    this.setState({
      currentSelectionPolicy: val,
    });
  }

  // 整单中标-供应商选择策略
  @Bind()
  getAllWinBidModal() {
    const {
      modelName = 'inquiryHall',
      [modelName]: {
        code: { selectedPolicy = [] },
      },
    } = this.props;
    const { current } = this.basicInfoDs;
    const selectionStrategy = current?.get('selectionStrategy') || null;

    // const { currentSelectionPolicy } = this.state;
    let defaultValue = selectionStrategy === 'RECOMMENDATION' ? 'RELEASE' : selectionStrategy;
    const defaultValueExist = selectedPolicy?.find(
      (policyObj) => policyObj?.value === defaultValue
    );
    if (isEmpty(defaultValueExist)) {
      defaultValue = null;
    }

    this.setState({ currentSelectionPolicy: defaultValue });
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.giveupPolice`).d('放弃策略')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              <Select
                allowClear
                defaultValue={defaultValue}
                size="small"
                required
                onChange={(val) => this.changePolicy(val)}
              >
                {map(selectedPolicy, (item) => {
                  if (item && item.value === 'RECOMMENDATION') {
                    return null;
                  }

                  return (
                    <Select.Option value={item.value} key={item.value}>
                      <Tooltip title={selectionInfoMap()[item.value]} placement="left">
                        {item.meaning}
                      </Tooltip>
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 供应商列表-风险监控
   */
  @Bind()
  linkRiskScan(item, e) {
    const { current } = this.basicInfoDs;
    const { rfxHeaderId } = current?.get(['rfxHeaderId']) || {};

    if (!item.supplierCompanyId || !rfxHeaderId) {
      return;
    }
    supplierRiskScan({ supplierCompanyId: item.supplierCompanyId, rfxHeaderId });
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 保存完以后的通用处理
   * @param {*} fetchHeaderFlag 是否需要重新查询头
   * @param {*} page page,只有改变分页的时候传递
   */
  @Bind()
  refreshActiveData(fetchHeaderFlag, page, operationType = null) {
    const {
      modelName = 'inquiryHall',
      [modelName]: { itemLinePagination = {}, supplierLinePagination = {} },
    } = this.props;
    const {
      activeKey,
      routerParams: { projectLineSectionId },
      newFunctionFlag = false,
    } = this.state;
    if (
      this.sectionInfo.refreshSectionList &&
      projectLineSectionId &&
      projectLineSectionId !== 'null'
    ) {
      this.sectionInfo.refreshSectionList();
    }
    if (activeKey === 'itemLine') {
      this.clearAllTable(operationType);
      this.fetchItemLine(page || itemLinePagination);
      // id 去重，根据行rfxLineItemId遍历查询物料行数据
      this.setState({ updateState: true }, () => {
        if (newFunctionFlag) {
          this.itemLineList?.setState({
            isShow: {},
          });
          this.setState({
            itemActivePanel: [],
            itemExpand: {},
          });
          this.itemLineList.itemLineTable = {};
        } else {
          this.fetchItemQuoteLineList();
        }
      });
    } else if (activeKey === 'supplierLine') {
      this.clearAllTable(operationType);
      this.fetchSupplierLine(page || supplierLinePagination);
      // id 去重
      this.setState({ updateState: true }, () => {
        this.fetchSupplierQuoteLineList();
      });
    } else if (activeKey === 'attachmentTable') {
      this.clearAllTable(operationType);
    } else {
      this.clearAllTable();
      this.fetchQuoteLine();
    }
    if (fetchHeaderFlag) {
      this.queryHeaderInfo();
    }
    this.refreshAttachmentListTable();
  }

  /**
   * 打开比价助手模态框
   */
  @Bind()
  priceComparisonAssistant() {
    this.setState({ priceComparisonModalVisible: true });
  }

  /**
   * 渲染中心弹窗 - [屈臣氏, 盈趣, 九坤, 立讯精密] 二开, 请谨慎修改!!!
   * @protected
   */
  renderPricingModal(pricingCenterModalProp) {
    const { pricingModalVisible = false } = this.state;
    return (
      pricingModalVisible &&
      (this.sourceKey === 'NEW_BID' ? (
        <PricingModalBid {...pricingCenterModalProp} />
      ) : (
        <PricingModal {...pricingCenterModalProp} />
      ))
    );
  }

  @Bind()
  triggerChooseSection() {
    const { chooseSection } = this.state;
    this.setState(
      {
        chooseSection: !chooseSection,
      },
      () => {
        if (this.state.chooseSection) {
          this.sectionInfo.setState({
            openedFlag: 1,
          });
        } else {
          this.sectionInfo.setState({
            checkedList: [],
          });
        }
      }
    );
  }

  @Bind()
  openProjectInfo() {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.editProjectInfo`).d('修改项目信息'),
      children: <ProjectInfo />,
      drawer: true,
      style: { width: '20%' },
      // onOk: () => {
      //   this.refreshActiveData();
      // },
    });
  }

  @Bind()
  batchOperateSections() {
    const { readConfig, roundConfig, currentButton } = this.state;
    if (!this.BatchEmptySectionRef) {
      return;
    }
    if (currentButton !== 'roundQuotation') {
      this.BatchEmptySectionRef.saveUserConfigBatch({
        ...readConfig,
        configKey: 'sectionCheckPrice',
        configDesc: 'sectionCheckPrice',
      });
      this.handleSubmit(true);
    } else {
      this.BatchEmptySectionRef.saveUserConfigBatch({
        ...roundConfig,
        configKey: 'sectionStartRoundQuotation',
        configDesc: 'sectionStartRoundQuotation',
      });
      this.handleRoundQuotation();
    }
    this.setState({
      batchEmptySelectedModalVisible: false,
    });
  }

  @Bind()
  batchOperateSectionsCancel() {
    this.setState({
      batchEmptySelectedModalVisible: false,
    });
  }

  // 获取参数值
  getRouterParams() {
    const { history } = this.props;
    const {
      location: { search = {} },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    return RouterParams;
  }

  /**
   * ref 生成器
   * @param {!React.element} vnode - React node
   * @param {!string} refName - ref名称
   */
  @Bind()
  handleGeneratorRef(vnode, refName) {
    this[refName] = vnode;
  }

  /**
   * ref 更新当前页面获取新的组件内部值
   */
  @Bind()
  checkPriceUpdate() {
    this.forceUpdate();
  }

  setOpenBargainLoading = (flag = false) => {
    if (this.bargainRuleModalRef) {
      this.bargainRuleModalRef.setState({
        openBargainLoading: flag,
      });
    }
  };

  /**
   * section panel ref
   */
  @Bind()
  handleSectionPanelRef(ref) {
    this.sectionInfo = ref;
  }

  @Bind()
  handleOpenModalExpertScoring() {
    const { dispatch, location } = this.props;
    const { current } = this.basicInfoDs;
    const { rfxHeaderId, sourceCategory, projectLineSectionId } =
      current?.get(['rfxHeaderId', 'sourceCategory', 'projectLineSectionId']) || {};
    if (!rfxHeaderId) {
      return;
    }
    const search = querystring.stringify(
      filterNullValueObject({
        rfxHeaderId,
        sourceCategory,
        projectLineSectionId,
      })
    );
    // 跳转至RFX明细页面
    dispatch(
      routerRedux.push({
        pathname: `${this.activeTabKey}/rfx-detail/${rfxHeaderId}`,
        search,
        state: {
          autoLocationStepNode: 'SCORING', // 自动定位到专家评分节点
          stateBackPath: `${location.pathname}${location.search}`,
        },
      })
    );
  }

  /**
   * 判断标准tab下有没有数据变更
   */
  judgeCurrentTabOfTableUpdated = () => {
    const { activeKey } = this.state;

    let flag = false;

    // itemLine标签页有改动
    if (activeKey === 'itemLine') {
      flag = this.judgeItemLinesDsHasChanged();
    }

    // supplierLine标签页有改动
    if (activeKey === 'supplierLine') {
      flag = this.judgeSupplierLinesDsHasChanged();
    }

    // quoteLine标签页有改动
    if (activeKey === 'quoteLine') {
      flag = this.quoteLineDs.dirty;
    }

    return flag;
  };

  getRfxHeaderIdFromUrl = () => {
    const {
      match: { params },
    } = this.props;

    // 校验头id
    const { rfxId } = params || {};
    idValidation(rfxId);

    return rfxId;
  };

  judgePageHeaderFormUpdated = () => {
    const flag = this.basicInfoDs?.dirty;

    return flag;
  };

  /**
   * 查询 智能预审 结果信息
   */
  fetchIntelligentPreReview = async () => {
    const { organizationId } = this.props;
    const rfxHeaderId = this.getRfxHeaderIdFromUrl();
    idValidation(rfxHeaderId);

    const data = {
      sourceHeaderId: rfxHeaderId,
      organizationId,
      categoryCode: 'RFX_CHECK',
    };

    try {
      let result = await fetchIntelligentPreReviewResult(data);
      result = getResponse(result);
      if (!result) {
        this.setState({
          aiResultData: {},
        });
        this.clearAIResultTimer();
        return;
      }

      // 进行中，还需要继续等待结果， 其它状态表示已经拿到结果
      const { result: resultStatus } = result || {};
      if (resultStatus && resultStatus !== 'APPROVING') {
        this.clearAIResultTimer();
      }

      this.setState({
        aiResultData: result || {},
      });
    } catch (e) {
      throw e;
    }
  };

  clearAIResultTimer = () => {
    if (this.aiResultTimer) {
      clearInterval(this.aiResultTimer);
      this.aiResultTimer = null;
    }
  };

  /**
   * 轮询调用ai结果
   */
  rollingFetchAiResult = () => {
    this.clearAIResultTimer();

    this.aiResultTimer = setInterval(() => {
      this.fetchIntelligentPreReview();
    }, aiResultInterval);
  };

  /**
   * 智能预审
   */
  intelligentPreReviewOperate = async () => {
    const { organizationId } = this.props;
    const rfxHeaderId = this.getRfxHeaderIdFromUrl();

    const data = {
      sourceHeaderId: rfxHeaderId,
      organizationId,
      categoryCode: 'RFX_CHECK',
      pageSource: PageSourceSymbol.oldCheckPriceUpdate,
    };

    this.togglePageLoading(true);
    try {
      let result = await checkPriceIntelligentPreReview(data);
      this.togglePageLoading(false);
      result = getResponse(result);
      if (!result) {
        return;
      }

      this.fetchIntelligentPreReview();
      this.rollingFetchAiResult();
    } catch (e) {
      throw e;
    } finally {
      this.togglePageLoading(false);
    }
  };

  @Throttle(2000)
  handleIntelligentPreReview = async () => {
    let handleFlag = true;

    const headerUpdateFlag = this.judgePageHeaderFormUpdated();
    const tableUpdateFlag = this.judgeCurrentTabOfTableUpdated();
    const updateFlag = headerUpdateFlag || tableUpdateFlag;

    if (updateFlag) {
      const message = intl
        .get('ssrc.common.message.intelligentReviewNeedSavePageData')
        .d('操作失败，失败存在未保存的数据，请保存数据后重新点击智能预审。');
      // const modalConfirmResult = await c7nModal.confirm({
      //   title: intl.get('hzero.common.message.confirm.title').d('提示'),
      //   children: (
      //     <div>
      //       {message}
      //     </div>
      //   ),
      // });
      // handleFlag = modalConfirmResult === 'ok';

      handleFlag = false;
      notification.warning({
        message,
      });
      return;
    }

    if (handleFlag) {
      this.intelligentPreReviewOperate();
    }
  };

  /**
   * 判断选择标段是否显示回调方法
   */
  @Bind()
  judgeChooseSectionButton(showFlag) {
    this.setState({
      chooseSectionBtnShowFlag: showFlag,
    });
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

  /**
   * 通过历史最低价-打开比价助手弹框，历史价格分析页签
   */
  @Bind()
  handleHistoryAnalysis(item) {
    this.setState({
      priceComparisonModalVisible: true,
      item,
    });
  }

  /**
   * 打开缩略图模态框
   */
  @Bind()
  viewPriceCharts(chartFlag, id) {
    const chartsLoading = {
      [id]: { fetchPriceChartLoading: true },
    };
    this.setState({ chartsLoading });
    this.setState({
      viewPriceChartsVisible: true,
    });
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    if (chartFlag === 'i') {
      // 查询物品明细缩略图数据
      dispatch({
        type: `${modelName}/fetchPriceChartsData`,
        payload: {
          rfxLineItemId: id,
          organizationId,
          rfxHeaderId: params.rfxId,
        },
      }).then((result) => {
        if (result) {
          this.setState({ chartsLoading: { [id]: { fetchPriceChartLoading: false } }, id });
          this.itemPriceChartsData(result);
        }
      });
    } else {
      // 查询供应商缩略图数据
      dispatch({
        type: `${modelName}/fetchPriceChartsData`,
        payload: {
          rfxLineSupplierId: id,
          organizationId,
          rfxHeaderId: params.rfxId,
        },
      }).then((result) => {
        if (result) {
          this.supPriceChartsData(result);
        }
      });
    }
  }

  /**
   * itemPriceChartsData - 处理物品明细缩略图数据
   */
  @Bind()
  itemPriceChartsData(data) {
    // 将没有报价的供应商剔除数据，filter过滤
    const filterInfo =
      data &&
      data.filter((val) => {
        return val.quotationPrice !== null;
      });
    const priceDataSourceList = filterInfo.map((item) => {
      const { quotedDate } = item;
      const obj = {
        quotedDate,
      };
      obj[`${item.supplierCompanyName}`] = item.quotationPrice;
      return obj;
    });
    // 得到所有含报价的供应商名数据
    const supplierName = filterInfo && filterInfo.map((item) => item.supplierCompanyName);
    const supplierNameArr = Array.from(new Set(supplierName));
    this.setState({
      priceDataSource: priceDataSourceList,
      supplierNameList: supplierNameArr,
    });
  }

  /**
   * hidePriceCharts - 关闭缩略图模态框
   */
  @Bind()
  hidePriceCharts() {
    const { modelName = 'inquiryHall' } = this.props;
    this.setState({
      viewPriceChartsVisible: false,
      priceDataSource: [],
      supplierNameList: [],
    });
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        priceChartsData: [],
      },
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const lineData = isRecord(record) ? record.toData() : record;
    const {
      itemCode,
      itemName,
      companyName,
      quotationLineId,
      quotationLineStatus,
      suggestedFlag,
    } = isRecord(record)
      ? record.get([
          'itemCode',
          'itemName',
          'companyName',
          'quotationLineId',
          'quotationLineStatus',
          'suggestedFlag',
        ])
      : record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        ...(lineData || {}),
        suggestedFlag,
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName: companyName,
        quotationLineStatus,
      },
    });

    this.queryLadderQuotation({
      quotationLineId,
      suggestedFlag,
    });
  }

  /**
   * 查询阶梯报价
   */
  queryLadderQuotation = (data) => {
    const { modelName = 'inquiryHall' } = this.props;
    const { dispatch, organizationId } = this.props;
    const { quotationLineId, suggestedFlag, ...others } = data || {};
    if (!quotationLineId) {
      return;
    }

    dispatch({
      type: `${modelName}/fetchLadderLevelTable`,
      payload: {
        quotationLineId,
        organizationId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`,
        suggestedFlag,
        ...others,
      },
    });
  };

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    const { modelName = 'inquiryHall' } = this.props;
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  /**
   * 物料行表格行选择
   * */
  @Bind()
  changeItemLineTableSelection(keys = [], rows = []) {
    this.setState({
      itemLineTableSelectedRows: rows,
      itemLineTableSelectedKeys: keys,
    });
  }

  /**
   * 物料行表格行选择
   * */
  @Bind()
  changeSupplierLineTableSelection(keys = [], rows = []) {
    this.setState({
      supplierLineTableSelectedRows: rows,
      supplierLineTableSelectedKeys: keys,
    });
  }

  // 打开行记录
  @Bind()
  changeCurrentPaneActiveSelected(rows = {}, id = null) {
    const { currentPaneActiveSelected = {} } = this.state;

    const data = {
      ...currentPaneActiveSelected,
      [id]: rows,
    };

    this.setState({
      currentPaneActiveSelected: data,
    });
  }

  /**
   * 获取行数据 (暂未发现用途, 从老核价同步而来)
   * */
  getSelectedRowsData() {
    const { currentPaneActiveSelected = {} } = this.state;
    if (isEmpty(currentPaneActiveSelected)) {
      return {};
    }

    let newRows = [];
    Object.keys(currentPaneActiveSelected).forEach((key) => {
      const currentRow = currentPaneActiveSelected[key] || [];
      newRows = [].concat(newRows, currentRow);
    });

    const data =
      !isEmpty(newRows) &&
      newRows.map((item) => {
        const itemForm = item.$form || {};
        const newItem = itemForm.getFieldsValue() || {};

        return {
          ...item,
          ...newItem,
          suggestedFlag: itemForm.getFieldValue('suggestedFlag'),
        };
      });
    return data;
  }

  /**
   * 打开新版操作记录弹窗
   */
  @Bind()
  handleShowOperationRecordModal() {
    const {
      match: { params },
    } = this.props;
    openModal({
      rfxHeaderId: params.rfxId,
    });
  }

  @Bind()
  priceSummary() {
    return null;
  }

  // 保存方法埋点
  @Throttle(1200)
  @Bind()
  handleRemoteSave() {
    const { activeKey } = this.state;
    const {
      remote,
      match: { params },
    } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('remoteSave', {
        activeKey,
        that: this,
        rfxHeaderId: params.rfxId,
        handleBeSave: this.handleBeSave,
      });
    } else {
      this.handleBeSave(true);
    }
    this.setState({
      _timestamp: Date.now(),
    });
  }

  // 提交方法埋点
  @Throttle(1200)
  @Bind()
  handleRemoteSubmit() {
    const { activeKey } = this.state;
    const {
      remote,
      match: { params },
    } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('remoteSubmit', {
        activeKey,
        that: this,
        rfxHeaderId: params.rfxId,
        handleBeSave: this.handleBeSave,
      });
    } else {
      this.handleBeSave(false);
    }
  }

  // 唱标
  handleBidAnnouncement = () => {
    const {
      match: { params },
    } = this.props;
    openBidAnnouncementModal({
      rfxHeaderId: params.rfxId,
    });
  };

  /**
   * 渲染头部按钮 - [永祥, 乐成, 长丰影像, 德保， 鸿合] 重写, 谨慎修改!!!
   * @protected
   */
  getButtons() {
    const {
      allLoading,
      beginRoundQuotationLoading,
      match,
      match: { params },
      history,
      organizationId,
      remote,
      location,
      batchMaintainQuotateLineLoading,
      fetchItemLineLoading,
      fetchSupplierLineLoading,
      fetchQuoteLineLoading,
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;

    const {
      btnLoading,
      chooseSection,
      checkAttachmentUuid = null,
      chooseSectionBtnShowFlag,
      activeKey,
      CheckPermissionObject,
      attachmentNewUILoading,
      processAttachmentNewUIFlag,
      attachmentCount = '',
      showExchangeEdit,
      item,
      inquiryAgainFlag = false,
      // biddingHallFlag,
      fileTemplateManageFlag = 0,
      operationLoading = false,
      aiResultData = {},
    } = this.state;
    const { current, status } = this.basicInfoDs;
    const saveOrSubmitLoading =
      allLoading ||
      status === 'loading' ||
      this.supplierLineList?.state?.wholePackageLoading ||
      fetchItemLineLoading ||
      fetchSupplierLineLoading ||
      fetchQuoteLineLoading;
    const {
      onlyAllowAllWinBids = 0,
      expertScoreType,
      pretrialFlag,
      multiCurrencyFlag,
      bargainRule,
      roundQuotationEndDate,
      roundHeaderStatus,
      bargainClosedFlag,
      roundQuotationRule,
      newQuotationFlag,
      sourceCategory,
      diyLadderQuotationFlag,
      biddingFlag,
      enableBidAnnouncementFlag,
      currentDateTime,
      rfxHeaderId,
    } = current
      ? current?.get([
          'onlyAllowAllWinBids',
          'expertScoreType',
          'pretrialFlag',
          'multiCurrencyFlag',
          'bargainRule',
          'roundQuotationEndDate',
          'roundHeaderStatus',
          'bargainClosedFlag',
          'roundQuotationRule',
          'newQuotationFlag',
          'sourceCategory',
          'diyLadderQuotationFlag',
          'biddingFlag',
          'enableBidAnnouncementFlag',
          'currentDateTime',
          'rfxHeaderId',
        ])
      : {};

    const currentDateTimeValue = currentDateTime || new Date();

    // price clarification button
    const PriceButtonProps = {
      match,
      history,
      sourceFrom: 'RFX',
      sourceHeaderId: params.rfxId,
      organizationId,
      buttonPermission: false,
      getRouterParams: this.getRouterParams,
      bidFlag: this.sourceKey === 'NEW_BID',
      basicInfoDs: this.basicInfoDs,
    };
    const otherImportProps = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_HEADER_BUTTONS_IMPORT_CUXPROPS',
          {},
          { basicInfoDs: this.basicInfoDs }
        )
      : {};
    const importProps = {
      businessObjectTemplateCode: 'SSRC.RFX_CHECK_PRICE.IMPORT',
      prefixPatch: SRM_SSRC,
      tenantId: organizationId,
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId: params.rfxId,
        templateCode: 'SSRC.RFX_CHECK_PRICE.IMPORT',
      },
      backPath: undefined,
      auto: true,
      refreshButton: true,
      action: 'hzero.common.title.batchImport',
      successCallBack: () => {
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine: [],
            supplierLine: [],
          },
        });
        if (this.itemLineList) {
          this.itemLineList.itemLineTable = {};
          this.itemLineList.setState({
            isShow: {},
          });
          this.setState({
            itemActivePanel: [],
            itemExpand: {},
          });
        }
        if (this.supplierLineList) {
          this.supplierLineList.supplierLineTable = {};
          this.supplierLineList.setState({
            isShow: {},
          });
          this.setState({
            supplierActivePanel: [],
            supplierExpand: {},
          });
        }
        this.queryHeaderInfo();
        if (activeKey === 'itemLine') {
          this.fetchItemLine();
          this.fetchQuoteLine();
        } else if (activeKey === 'supplierLine') {
          this.fetchSupplierLine();
          this.fetchQuoteLine();
        } else {
          this.fetchQuoteLine();
        }
      },
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_HEADER_RFX_CHECK_PRICE',
        requestUrl: `${SRM_SSRC}/v2/${organizationId}/rfx/check/quotation/lines/export?rfxHeaderId=${params.rfxId}`,
        queryParams: { rfxHeaderId: params.rfxId },
        queryArea: { fillerType: 'single-sheet', async: false },
      },
      ...otherImportProps,
    };

    const otherProps = {
      expertScoreType,
      rfxHeaderId: params.rfxId,
      current,
      sourceKey: this.sourceKey,
      bidFlag: this.bidFlag,
      refreshActiveData: this.refreshActiveData,
      history,
      location,
      multiCurrencyFlag,
      roundQuotationRule,
      checkAttachmentUuid,
      basicInfoDS: this.basicInfoDs,
      activeKey,
      getSourceCategoryName,
      sourceCategory,
      queryPageMainData: this.queryPageMainData,
      fetchHeaderInfo: this.fetchHeaderInfo,
      btnLoading: saveOrSubmitLoading || btnLoading || batchMaintainQuotateLineLoading,
      that: this,
    };

    const permissionBatchImport = customPermissionButton({
      display: (
        <span>
          {`(${intl.get('ssrc.common.view.new').d('新')})${intl
            .get(`ssrc.common.button.batchImport`)
            .d('批量导入')}`}
          <div className={styles['checkPrice-headerButton-newImportButton-sup']}>NEW</div>
        </span>
      ),
      onClick: () => {
        if (!params.rfxId || params.rfxId === 'null') {
          return;
        }
        this.openModal({
          ...importProps,
        });
      },
      ...CheckPermissionObject?.batchimportnew,
    });

    // 比价助手
    const priceComparisonProps = {
      item,
      sourceCategory,
      diyLadderQuotationFlag,
      rfxId: params.rfxId,
    };

    const saveButtonDisabled = chooseSection || activeKey === 'attachmentList';
    const submitButtonDisabled =
      (roundHeaderStatus === 'ROUND_CHECKING' &&
        new Date(roundQuotationEndDate) > currentDateTimeValue) ||
      activeKey === 'attachmentList' ||
      activeKey === 'attachmentTable';
    // 竞价大厅-竞价单标识
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    const buttons = [
      {
        name: 'dropdownBtnListNew',
        group: true,
        // 按钮组显示内容
        child: (
          <ButtonH0 disabled={chooseSection}>
            <Icon type="ellipsis" />
            {intl.get('hzero.common.basicLayout.viewMore').d('查看更多')}
          </ButtonH0>
        ),
        children: [
          permissionBatchImport && {
            name: 'batchImportNew',
            btnType: 'c7n-pro',
            child: () => permissionBatchImport,
          },
          {
            name: 'batchImport',
            child: (
              <>
                {/* <Icon type="export" style={{marginRight: '4px' }} /> */}
                {intl.get(`ssrc.common.button.batchImport`).d('批量导入')}
              </>
            ),
            btnProps: {
              onClick: this.handleBatchExport,
            },
          },
          {
            name: 'batchExport',
            child: intl.get('ssrc.common.button.batchExport').d('批量导出'),
            btnProps: {
              onClick: this.exportCheckPriceData,
            },
          },
          {
            name: 'exportNew',
            btnComp: ExcelExportPro,
            btnProps: {
              templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_DETAIL_EXPORT',
              requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/check/export-new`,
              queryParams: { rfxHeaderId: params.rfxId },
              otherButtonProps: {
                icon: 'unarchive',
                type: 'c7n-pro',
                className: 'no-border-btn',
                permissionList: [
                  {
                    code: 'ssrc-inquiry-hall.check-price-approval.button.exportnew'.toLowerCase(),
                    type: 'button',
                    meaning: `${
                      intl.get(`ssrc.inquiryHall.view.message.button.checkPrice`).d('核价') -
                      intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                    }`,
                  },
                ],
              },
            },
          },
          pretrialFlag && {
            name: 'returnToPretrial',
            child: intl
              .get(`ssrc.inquiryHall.view.message.button.returnToPretrial`)
              .d('退回至初审'),
            btnProps: {
              onClick: this.returnToPretrial,
            },
          },
          {
            name: 'downloadAttachment',
            hidden: newQuotationFlag,
            child: (
              <Badge count={attachmentCount} overflowCount={attachmentCount} size="small">
                <span>
                  <Icon type="get_app" />
                  {intl.get('hzero.common.button.open').d('过程附件下载')}
                </span>
              </Badge>
            ),
            btnProps: {
              loading: attachmentNewUILoading,
              icon: 'get_app',
              onClick: processAttachmentNewUIFlag
                ? this.openC7nProcessAttachmentModal
                : this.openProcessAttachmentModal,
            },
          },
          inquiryAgainFlag
            ? {
                name: 'inquiryAgain',
                hidden: newBiddingFlag, // 新竞价隐藏此按钮
                child: intl
                  .get(`ssrc.inquiryHall.view.message.button.commonInquiryAgain`, {
                    sourceCategoryName: getSourceCategoryName(this.sourceKey === 'NEW_BID'),
                  })
                  .d('再次{sourceCategoryName}'),
                btnProps: {
                  type: 'default',
                  onClick: this.inquiryAgain,
                },
              }
            : null,
          {
            name: 'operationRecord',
            child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
            btnProps: {
              onClick: this.handleShowOperationRecordModal,
            },
          },
          multiCurrencyFlag && expertScoreType === 'NONE' && showExchangeEdit
            ? {
                name: 'exchangeEdit',
                child: intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑'),
                btnProps: {
                  onClick: this.exchangeEdit,
                },
              }
            : null,
          !isNil(enableBidAnnouncementFlag) && enableBidAnnouncementFlag
            ? {
                name: 'bidAnnouncement',
                child: intl.get('ssrc.common.model.common.bidAnnouncement').d('唱标'),
                btnProps: {
                  onClick: this.handleBidAnnouncement,
                },
              }
            : null,
          {
            name: 'chat',
            btnComp: ChatRoomSourceLink,
            child: intl.get('ssrc.common.view.message.chatRecord').d('聊天记录'),
            btnProps: {
              btnType: 'h0',
              rfxHeaderId: params.rfxId,
              otherButtonProps: {
                funcType: 'raised',
              },
            },
          },
        ].filter(Boolean),
        btnProps: {
          disabled: chooseSection,
        },
      },
      {
        name: 'intelligentPreReview',
        child: (
          <>
            <IconC7N
              type="offline_bolt-o"
              style={{ marginRight: '4px', fontSize: '14px', fontWeight: 400 }}
            />
            {intl.get('ssrc.common.intelligentPreReview').d('智能预审')}
          </>
        ),
        btnProps: {
          onClick: () => this.handleIntelligentPreReview(),
          loading: operationLoading || btnLoading,
          disabled: chooseSection || ['EXECUTING', 'APPROVING'].includes(aiResultData?.result),
        },
        hidden: true,
      },
      this.priceSummary(),
      {
        name: 'priceClear',
        btnComp: PriceClarificationButtons,
        btnProps: {
          style: {
            marginLeft: '8px',
          },
          ...PriceButtonProps,
        },
      },
      fileTemplateManageFlag !== 1
        ? {
            name: 'uploadAttachment',
            btnComp: Attachment,
            // childFor: 'btnText',
            btnProps: {
              funcType: 'raised',
              viewMode: 'popup',
              bucketName: PRIVATE_BUCKET,
              bucketDirectory: 'ssrc-rfx-quotationline',
              tenantId: organizationId,
              color: 'default',
              dataSet: this.basicInfoDs,
              name: 'checkAttachmentUuid',
              onChange: this.handleAttachmentChange,
              className: styles.uploadAttachment,

              // filePreview: true,
              // bucketName: PRIVATE_BUCKET,
              // bucketDirectory: 'ssrc-rfx-quotationline',
              // attachmentUUID: checkAttachmentUuid ?? null,
              // tenantId: organizationId,
              // afterOpenUploadModal: this.handleAfterOpenModal,
              // btnProps: {
              //   icon: 'upload',
              //   type: 'default',
              //   className: styles.uploadAttachment,
              // },
              ...ChunkUploadProps,
            },
          }
        : null,
      expertScoreType !== 'NONE' && {
        name: 'viewExpertScoring',
        btnProps: { onClick: () => this.handleOpenModalExpertScoring() },
        child: (
          <>
            <Icon type="solution" style={{ marginRight: '4px' }} />
            {intl.get('ssrc.inquiryHall.view.button.viewExpertScoring').d('查看专家评分')}
          </>
        ),
      },
      {
        name: 'previewScoreManager',
        child: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
        btnProps: {
          onClick: this.previewScoreManager,
        },
      },
      // this.sectionInfo.isSectionListEmpty && !this.sectionInfo.isSectionListEmpty()
      chooseSectionBtnShowFlag
        ? chooseSection
          ? {
              name: 'selectionCancel',
              child: (
                <>
                  <Icon type="close-circle-o" />
                  {intl.get(`ssrc.inquiryHall.view.message.button.cancelChoose`).d('取消选择')}
                </>
              ),
              btnProps: {
                type: 'default',
                onClick: this.triggerChooseSection,
              },
            }
          : {
              name: 'selectionSelect',
              child: (
                <>
                  <Icon type="check-square-o" />
                  {intl.get(`ssrc.inquiryHall.view.message.button.chooseSection`).d('选择标段')}
                </>
              ),
              btnProps: {
                type: 'default',
                onClick: this.triggerChooseSection,
              },
            }
        : null,
      !onlyAllowAllWinBids
        ? {
            name: 'batchMaintenanceCheck',
            child: intl
              .get('ssrc.inquiryHall.model.inquiryHall.batchMaintenanceCheck')
              .d('批量维护'),
            btnProps: {
              onClick: this.startBatchMaintainItemLine,
              disabled: chooseSection,
            },
          }
        : null,
      {
        name: 'priceComparisonAssistant',
        child: (
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
        btnProps: {
          type: 'default',
          onClick: () => this.handleRenderPriceComparisonModal(priceComparisonProps),
          disabled: chooseSection,
        },
      },
      (bargainRule === 'CHECK' || bargainRule === 'ALL') && {
        name: 'bargainOnline',
        btnComp: PopoverButton,
        child: (
          <>
            <Iconfont type="main-reinquiry" style={{ marginRight: '8px' }} />
            {intl.get('ssrc.bidHall.view.button.negotiatedPrice').d('议价')}
          </>
        ),
        btnProps: {
          onClick: () => this.handleBargainOnline(),
          disabled:
            (roundHeaderStatus === 'ROUND_CHECKING' &&
              new Date(roundQuotationEndDate) > currentDateTimeValue) ||
            chooseSection,
          showPopover:
            roundHeaderStatus === 'ROUND_CHECKING' &&
            new Date(roundQuotationEndDate) > currentDateTimeValue,
          content: intl
            .get('ssrc.inquiryHall.view.message.bargainButtonDisabledTips')
            .d('当前正在进行多轮报价，不可进行议价'),
        },
      },
      {
        name: 'startRoundQuotation',
        child: (
          <>
            <img src={moneyBook} style={{ marginRight: '4px' }} alt="icon" />
            {intl.get(`ssrc.inquiryHall.view.button.startRundQuotation`).d('发起多轮报价')}
          </>
        ),
        btnProps: {
          type: 'default',
          onClick: this.handleRoundQuotation,
          loading: beginRoundQuotationLoading,
          disabled: roundHeaderStatus === 'CLOSED' || bargainClosedFlag === 0 || chooseSection,
        },
        hidden: roundQuotationRule !== 'CHECK' && roundQuotationRule !== 'AUTO_CHECK',
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          type: 'default',
          loading: saveOrSubmitLoading || btnLoading || batchMaintainQuotateLineLoading,
          onClick: this.handleRemoteSave,
          disabled: remote
            ? remote.process(
                'SSRC_CHECK_PRICE_PROCESS_HEADER_BUTTONS_SAVE_DISABLED',
                saveButtonDisabled,
                { activeKey, bidFlag: this.bidFlag }
              )
            : saveButtonDisabled,
        },
      },
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnComp: PopoverButton,
        btnProps: {
          icon: 'check',
          type: 'primary',
          onClick: this.handleRemoteSubmit,
          loading: saveOrSubmitLoading || btnLoading || batchMaintainQuotateLineLoading,
          disabled: remote
            ? remote.process(
                'SSRC_CHECK_PRICE_PROCESS_HEADER_BUTTONS_SUBMIT_DISABLED',
                submitButtonDisabled,
                { activeKey, bidFlag: this.bidFlag }
              )
            : submitButtonDisabled,
          showPopover:
            roundHeaderStatus === 'ROUND_CHECKING' &&
            new Date(roundQuotationEndDate) > currentDateTimeValue,
          content: intl
            .get('ssrc.inquiryHall.view.message.commonSubmitButtonDisabledTips', {
              checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
            })
            .d('当前正在进行多轮报价，不可提交{checkPriceName}'),
        },
      },
    ]
      .filter(Boolean)
      .reverse();
    if (!remote) {
      return buttons;
    }

    if (!rfxHeaderId) {
      return [];
    }

    return remote.process('SSRC_CHECK_PRICE_PROCESS_HEADER_BUTTONS', buttons, otherProps);
  }

  /**
   * 渲染头部按钮 - [克明面业/明喆物业/华友钴业/爱学习/九坤] 重写, 谨慎修改!!!
   * @protected
   */
  getHeader() {
    const {
      c7n: { customizeBtnGroup = () => {} },
      remote,
    } = this.props;
    const buttons = this.getButtons();
    return (
      <Header
        title={
          remote
            ? remote.render(
                'SSRC_CHECK_PRICE_RENDER_TITLE',
                getCheckPriceName(this.sourceKey === 'NEW_BID'),
                {
                  bidFlag: this.bidFlag,
                  basicInfoDs: this.basicInfoDs,
                }
              )
            : getCheckPriceName(this.sourceKey === 'NEW_BID')
        }
        backPath={this.toBack()}
      >
        {customizeBtnGroup(
          {
            code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEAD_BUTTONS`,
            pro: true,
            btnType: 'h0',
          },
          <DynamicButtons buttons={buttons} />
        )}
      </Header>
    );
  }

  /**
   * 渲染报价数量 - [华友钴业] 重写, 请谨慎修改!!!
   * @param {Record} record - ds Record 对象(二开会使用到)
   * @protected
   */
  @Bind()
  renderValidQuotationQuantity(val, record, type) {
    switch (type) {
      case 'item':
      case 'supplier':
      case 'all':
        return val !== null ? numberSeparatorRender(val) : '-';
      default:
        return '';
    }
  }

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (param = {}) => {
    const { organizationId } = this.props;
    const { queryParams = {} } = param || {};

    const { current } = this.basicInfoDs || {};
    if (!current) {
      return;
    }

    const { rfxHeaderId, applicationScopeFlag } =
      current?.get(['rfxHeaderId', 'applicationScopeFlag']) || {};

    if (!rfxHeaderId) {
      return;
    }

    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        applicationScopeFlag,
        ...(queryParams || {}),
      },
      sourceHeaderId: rfxHeaderId,
      organizationId,
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: this.applicationScopeModalKey,
      drawer: true,
      bodyStyle: {
        padding: 0,
      },
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScopeDetail {...Props} />,
      style: { width: '1090px' },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 渲染折叠面板头部
   * @param {*} header - 头数据源
   */
  renderHeaderTitle() {
    const { remote } = this.props;

    const titleProps = {
      basicInfoDs: this.basicInfoDs,
      remote,
    };
    return <PanelTitle {...titleProps} />;
  }

  /**
   * 渲染物料明细 - [永祥] 二开, 谨慎修改!!!
   * @protected
   */
  renderItemLineList(itemLineListProps) {
    return this.sourceKey === 'NEW_BID' ? (
      <ItemLineListBid {...itemLineListProps} />
    ) : (
      <ItemLineList {...itemLineListProps} />
    );
  }

  /**
   * 渲染供应商列表 - [路特斯, 番缆服务,  海亮] 二开, 谨慎修改!!!
   * @protected
   */
  renderSupplierList(supplierLineListProps) {
    return this.sourceKey === 'NEW_BID' ? (
      <SupplierLineListBid {...supplierLineListProps} />
    ) : (
      <SupplierLineList {...supplierLineListProps} />
    );
  }

  /**
   * 暂无
   * 渲染全部报价明细 - [永祥、东博] 二开, 谨慎修改!!!
   * @protected
   */
  renderAllQuoteLine(quoteLineTableProps) {
    return this.sourceKey === 'NEW_BID' ? (
      <AllBidQuoteLine {...quoteLineTableProps} />
    ) : (
      <AllQuoteLine {...quoteLineTableProps} />
    );
  }

  /**
   * 九坤二开
   * @protected
   */
  renderBatchMaintainQuoteLine(batchMaintainQuoteLine) {
    const { batchMaintainQuoteLineVisible } = this.state;
    return batchMaintainQuoteLineVisible && <BatchMaintainQuoteLine {...batchMaintainQuoteLine} />;
  }

  /**
   * [网是科技] 二开, 谨慎修改!!!
   * @protected
   */
  renderBasicInfoForm(basicInfoFormProps) {
    return <BasicInfoForm {...basicInfoFormProps} />;
  }

  refreshAttachmentListTable = () => {
    const { fileTemplateManageFlag } = this.state;
    if (fileTemplateManageFlag !== 1) {
      return;
    }

    const { lineDS } = this.attachmentTableRef || {};

    if (lineDS) {
      const { currentPage } = lineDS || {};
      lineDS.query(currentPage || 1);
    }
  };

  // 附件表格 字段类型个性化，表格列个性化 个性化在组件内部，外部使用只能固定
  getAttachmentLineTableAndColumnsCustomizeUnitCode = () => {
    let code =
      'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS,SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE';

    if (this.bidFlag) {
      code =
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS,SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE';
    }

    return code;
  };

  // 附件表格数据校验
  getAttachmentListTableData = () => {
    const { getAttachmentListData } = this.attachmentTableRef || {};

    const { fileTemplateManageFlag } = this.state;
    if (fileTemplateManageFlag !== 1) {
      return;
    }

    if (!getAttachmentListData) {
      return;
    }

    const attachmentLineList = getAttachmentListData() || [];

    return attachmentLineList;
  };

  // 附件表格数据校验
  validateAttachmentListTableDS = async () => {
    const { fileTemplateManageFlag } = this.state;
    if (fileTemplateManageFlag !== 1) {
      return true;
    }

    const { validateAttachmentListTable } = this.attachmentTableRef || {};

    if (!validateAttachmentListTable) {
      return true;
    }

    const attachmentTableValidate = await validateAttachmentListTable();

    return attachmentTableValidate;
  };

  handleAttachmentTableRef = (node) => {
    this.attachmentTableRef = node;
  };

  renderAttachmentTab = () => {
    const {
      match: { params },
      c7n: { custTable: customizeTable = noop, customizeBtnGroup = noop },
    } = this.props;
    const { fileTemplateManageFlag = 0 } = this.state;

    if (fileTemplateManageFlag !== 1) {
      return '';
    }

    const fileProps = {
      customizeTable,
      customizeBtnGroup,
      headerDS: this.basicInfoDs,
      fileTemplateManageFlag,
      rfxHeaderId: params.rfxId,
      editorFlag: 1,
      bidFlag: this.bidFlag,
      onRef: this.handleAttachmentTableRef,
      unitCodeSymbol: 'oldUpdateOrApproval', // 个性化标识
    };

    return (
      <TabPane
        tab={intl.get(`ssrc.common.view.attachmentTable`).d('附件表格')}
        key="attachmentTable"
      >
        <FileTemplateAttachmentCheckPricePage {...fileProps} />
      </TabPane>
    );
  };

  /**
   * [鸿合] 二开, 谨慎修改!!!
   * @protected
   */
  getTabPaneArray({
    itemLineListProps,
    supplierLineListProps,
    quoteLineTableProps,
    AttachmentsProps,
    onlyAllowAllWinBids,
  }) {
    return [
      !onlyAllowAllWinBids ? (
        <TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemLine`).d('物品明细')}
          key="itemLine"
        >
          {this.renderItemLineList(itemLineListProps)}
        </TabPane>
      ) : null,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
        key="supplierLine"
      >
        {this.renderSupplierList(supplierLineListProps)}
      </TabPane>,
      !onlyAllowAllWinBids ? (
        <TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.quoteLine`).d('全部报价明细')}
          key="quoteLine"
        >
          {this.renderAllQuoteLine(quoteLineTableProps)}
        </TabPane>
      ) : (
        <div />
      ),
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
        key="attachmentList"
      >
        <div style={{ marginTop: '16px' }}>
          <AttachmentWrap {...AttachmentsProps} />
        </div>
      </TabPane>,
      this.renderAttachmentTab(),
    ];
  }

  @Bind()
  async changeItemTableSelectedPolicy(value) {
    const items = this.itemOperationDs?.current?.toData() || {};
    const {
      organizationId,
      match: { params },
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;
    const { activeKey } = this.state;
    await this.handleSave('', 0);
    const rfxLineItemIds = (items?.checkItems || []).map((item) => item.rfxLineItemId);
    const serviceParams = {
      organizationId,
      selectionStrategyBatch: value,
      rfxHeaderId: params.rfxId,
      rfxLineItemIds,
    };
    selectedItemBatchPolicy(serviceParams).then((res) => {
      if (getResponse(res)) {
        const {
          routerParams: { projectLineSectionId },
          newFunctionFlag = false,
        } = this.state;
        if (
          this.sectionInfo.refreshSectionList &&
          projectLineSectionId &&
          projectLineSectionId !== 'null'
        ) {
          this.sectionInfo.refreshSectionList();
        }
        this.queryHeaderInfo();
        this.clearAllTable();
        this.setState({ updateState: true }, () => {
          if (newFunctionFlag) {
            this.itemLineList?.setState({
              isShow: {},
            });
            this.setState({
              itemActivePanel: [],
              itemExpand: {},
            });
            this.itemLineList.itemLineTable = {};
          } else {
            this.fetchItemQuoteLineList();
          }
        });
        if (activeKey === 'itemLine') {
          dispatch({
            type: `${modelName}/fetchItemLine`,
            payload: {
              organizationId,
              rfxHeaderId: params.rfxId,
              customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
              rfxLineItemIds,
            },
          });
          this.fetchQuoteLine();
        } else if (activeKey === 'supplierLine') {
          this.fetchSupplierLine();
          this.fetchQuoteLine();
        } else {
          this.fetchQuoteLine();
        }
      }
    });
  }

  @Bind()
  checkPriceTableChange(flag = true) {
    this.setState({ itemSelectedPolicyChangeFlag: flag });
  }

  @Bind()
  async changeSelectItemOps(val = []) {
    if (this.state.itemSelectedPolicyChangeFlag) {
      await this.handleSave('', 0);
      this.checkPriceTableChange(false);
    }
    const {
      organizationId,
      match: { params },
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        rfxLineItemIds: [val && val.map((item) => item?.rfxLineItemId)],
      },
    });
  }

  @Bind()
  handleLovSearchMatcherChange(searchFieldName) {
    if (searchFieldName === 'itemNames') {
      this.setState({
        lovSearchPlaceholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.ItemNameSearch')
          .d('请输入物料名称'),
        searchMatcher: searchFieldName,
      });
    } else if (searchFieldName === 'itemCodes') {
      this.setState({
        lovSearchPlaceholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.ItemCodeSearch')
          .d('请输入物料编码'),
        searchMatcher: searchFieldName,
      });
    }
  }

  @Bind()
  getItemOperations() {
    const {
      modelName = 'inquiryHall',
      [modelName]: {
        code: { selectedPolicy = [] },
      },
      remote,
    } = this.props;
    const otherProps = {
      basicInfoDs: this.basicInfoDs,
      bidFlag: this.bidFlag,
    };
    const selectedPolicyFilterValue = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_ITEM_SELECTED_POLICY', selectedPolicy, otherProps)
      : selectedPolicy;
    const { lovSearchPlaceholder = '', searchMatcher, openExpandAllFlag } = this.state;
    return (
      <React.Fragment>
        {openExpandAllFlag && (
          <Button
            funcType="link"
            onClick={() => this.handleClickExpandAll('item')}
            className={styles.supplierRelationship}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.allExpand`).d('一键展开/收起')}
          </Button>
        )}
        <Lov
          dataSet={this.itemOperationDs}
          viewMode="popup"
          name="checkItems"
          onChange={this.changeSelectItemOps}
          paramMatcher={({ key, text }) => ({ [key]: (text || []).toString() })}
          searchFieldProps={{
            multiple: true,
            placeholder: lovSearchPlaceholder,
          }}
          placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料')}
          onSearchMatcherChange={this.handleLovSearchMatcherChange}
          searchMatcher={searchMatcher}
          popupCls={styles['checkPrice-tab-checkItems-lov-modal']}
          maxTagCount={3}
          maxTagTextLength={60}
        />
        <Select
          onChange={(value) => this.changeItemTableSelectedPolicy(value)}
          placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.strategy`).d('选择策略')}
          style={{ width: '150px', margin: '0 10px' }}
        >
          {selectedPolicyFilterValue &&
            selectedPolicyFilterValue.map((index) => (
              <Select.Option key={index.value} value={index.value}>
                <Tooltip title={selectionInfoMap()[index.value]} placement="left">
                  {index.meaning}
                </Tooltip>
              </Select.Option>
            ))}
        </Select>
      </React.Fragment>
    );
  }

  // 供应商tab筛选框选择供应商回调
  @Bind()
  async changeSelectSupplierOps(val = []) {
    const {
      organizationId,
      match: { params },
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchSupplierLineCheckPrice`,
      payload: {
        organizationId,
        rfxHeaderId: params.rfxId,
        rfxLineSupplierIds: val && val.map((item) => item?.rfxLineSupplierId).toString(),
      },
    });
  }

  // 全部报价tab筛选框选择供应商回调
  @Bind()
  async changeSelectQuoteLineOps(val = [], type) {
    // eslint-disable-next-line no-unused-expressions
    this.quoteLineDs?.setQueryParameter(
      type,
      val &&
        val
          .map((item) => (type === 'item' ? item?.rfxLineItemId : item?.rfxLineSupplierId))
          .toString()
    );
    this.fetchQuoteLine();
  }

  // 供应商筛选框切换筛选条件时切换显示的筛选条件名称
  @Bind()
  handleSupplierLovSearchMatcherChange(searchFieldName) {
    if (searchFieldName === 'supplierNames') {
      this.setState({
        lovSearchPlaceholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.supplierNameSearch')
          .d('请输入供应商名称'),
        supplierSearchMatcher: searchFieldName,
      });
    } else if (searchFieldName === 'supplierNums') {
      this.setState({
        lovSearchPlaceholder: intl
          .get('ssrc.inquiryHall.model.inquiryHall.supplierCodeSearch')
          .d('请输入供应商编码'),
        supplierSearchMatcher: searchFieldName,
      });
    }
  }

  /**
   * 页面下面三个tab里的表格统一字段处理，尤其是二开
   */
  getAllTabTableCommonColumns = (options = {}) => {
    const { remote } = this.props;
    const { activeKey, doubleUnitFlag } = this.state;
    const commonColumns = [];

    const cuxProps = {
      ...(options || {}),
      bidFlag: this.bidFlag,
      activeKey,
      sourceKey: this.sourceKey,
      basicInfoDs: this.basicInfoDs,
      that: this,
      doubleUnitFlag,
    };

    const columns = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_ALL_TAB_TABLE_COLUMNS', commonColumns, cuxProps)
      : commonColumns;

    return columns || [];
  };

  // 全部报价tab右侧筛选框渲染
  @Bind()
  getQuoteLineOperations() {
    const {
      lovSearchPlaceholder = '',
      searchMatcher,
      supplierLovSearchPlaceholder = '',
      supplierSearchMatcher,
    } = this.state;
    const { remote } = this.props;
    return (
      <React.Fragment>
        {remote
          ? remote.render('SSRC_CHECK_PRICE_RENDER_ALL_TAB_OPERATION', null, {
              bidFlag: this.bidFlag,
              fetchQuoteLine: this.fetchQuoteLine,
              quoteLineDs: this.quoteLineDs,
              that: this,
            })
          : null}
        <Lov
          dataSet={this.quoteLineOperationDs}
          viewMode="popup"
          name="checkSuppliers"
          onChange={(val) => this.changeSelectQuoteLineOps(val, 'supplier')}
          paramMatcher={({ key, text }) => ({ [key]: (text || []).toString() })}
          searchFieldProps={{
            multiple: true,
            placeholder: supplierLovSearchPlaceholder,
          }}
          placeholder={intl
            .get(`ssrc.inquiryHall.model.inquiryHall.supplierComponyName`)
            .d('供应商')}
          onSearchMatcherChange={this.handleSupplierLovSearchMatcherChange}
          searchMatcher={supplierSearchMatcher}
          popupCls={styles['checkPrice-tab-checkItems-lov-modal']}
          maxTagCount={1}
          maxTagTextLength={20}
        />
        <Lov
          dataSet={this.quoteLineOperationDs}
          viewMode="popup"
          name="checkItems"
          onChange={(val) => this.changeSelectQuoteLineOps(val, 'item')}
          paramMatcher={({ key, text }) => ({ [key]: (text || []).toString() })}
          searchFieldProps={{
            multiple: true,
            placeholder: lovSearchPlaceholder,
          }}
          placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料')}
          onSearchMatcherChange={this.handleLovSearchMatcherChange}
          searchMatcher={searchMatcher}
          popupCls={styles['checkPrice-tab-checkItems-lov-modal']}
          maxTagCount={1}
          maxTagTextLength={20}
          style={{ margin: '0 10px' }}
        />
      </React.Fragment>
    );
  }

  // 单独的物料行查询，为了刷新物料行
  @Bind()
  onlyFetchItemLine(page = {}) {
    const {
      organizationId,
      match: { params },
      dispatch,
      modelName = 'inquiryHall',
    } = this.props;
    const items = this.itemOperationDs?.current?.toData() || {};
    const rfxLineItemIds = (items?.checkItems || []).map((item) => item.rfxLineItemId).toString();
    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        rfxLineItemIds,
      },
    });
  }

  // set cux tab ref
  setCuxTabRef = (node) => {
    this.cuxTabRef = node;
  };

  // cux tab validate
  validateCuxTab = async (param = {}) => {
    const { remote } = this.props;

    let popFlag = param || { flag: false, errorFlag: false, async: true };
    popFlag = remote
      ? await remote.process('SSRC_CHECK_PRICE_PROCESS_CUX_TAB_VALIDATE', popFlag, {
          that: this,
          ...param,
        })
      : popFlag;

    return popFlag;
  };

  // get cux tab date
  getCuxTabData = (param = {}) => {
    const { remote } = this.props;

    let data = {};
    data = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_CUX_TAB_DATA_INTEGRATE', data, {
          that: this,
          ...param,
        })
      : data;

    return data;
  };

  // refresh tab
  refreshCuxTab = (param = {}) => {
    const { remote } = this.props;

    if (remote.event) {
      remote.event.fireEvent('handleRefreshCuxTab', {
        that: this,
        ...param,
      });
    }
  };

  /**
   * 三生制药二开 渲染物料Tabs
   * @protected
   */
  renderTabPanes({
    activeKey,
    operations,
    onlyAllowAllWinBids,
    itemLineListProps,
    supplierLineListProps,
    quoteLineTableProps,
    AttachmentsProps,
  }) {
    const {
      remote,
      modelName = 'inquiryHall',
      [modelName]: {
        code: { selectedPolicy },
      },
    } = this.props;
    const { fixedFlag } = this.state;
    const { rfxHeaderId } = itemLineListProps;

    const preTabPaneArray =
      this.getTabPaneArray({
        itemLineListProps,
        supplierLineListProps,
        quoteLineTableProps,
        AttachmentsProps,
        onlyAllowAllWinBids,
      }) || [];
    const tabBarExtraOperations =
      activeKey === 'supplierLine'
        ? operations
        : activeKey === 'itemLine'
        ? this.getItemOperations()
        : activeKey === 'quoteLine'
        ? this.getQuoteLineOperations()
        : false;
    const tabPaneArray = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_TAB_PANE_ARRAT', preTabPaneArray, {
          rfxHeaderId,
          basicInfoDs: this.basicInfoDs,
          setCuxTabRef: this.setCuxTabRef,
          that: this,
          checkPricePage: 'EDIT',
        })
      : preTabPaneArray;
    return (
      <Tabs
        defaultActiveKey={activeKey}
        onChange={this.handleChangeTab}
        animated={false}
        className={fixedFlag ? styles.fixedTabStyle : styles.tabStyle}
        activeKey={activeKey}
        tabBarExtraContent={
          remote
            ? remote.process(
                'SSRC_CHECK_PRICE_PROCESS_TAB_BAR_EXTRA_CONTENT',
                [tabBarExtraOperations],
                {
                  checkPriceProp: this,
                  activeKey,
                  // sourceKey: this.sourceKey,
                  itemLineListProps,
                  supplierLineListProps,
                  selectedPolicy,
                  selectionInfoMap: selectionInfoMap(),
                  onlyFetchItemLine: this.onlyFetchItemLine,
                  // itemLineList: this.itemLineList,
                  // supplierLineList: this.supplierLineList,
                  fetchSupplierLine: this.fetchSupplierLine,
                  fetchQuoteLine: this.fetchQuoteLine,
                }
              )
            : [tabBarExtraOperations]
        }
      >
        {tabPaneArray}
      </Tabs>
    );
  }

  // 此方法需要后续优化，代码冗余，目前没时间了
  @Throttle(500)
  @Bind()
  async handleClickExpandAll(type) {
    const {
      modelName = 'inquiryHall',
      organizationId,
      match: { params },
      remote,
      [modelName]: { itemLine = [], supplierLine = [] },
    } = this.props;
    const { expandAllFlag } = this.state;
    this.setState({
      pageLoading: true,
    });
    let res;
    const pageSize = remote ? remote.process('SSRC_CHECK_PRICE_PROCESS_PAGESIZE', 10) : 10;
    if (type === 'item') {
      if (!expandAllFlag) {
        const itemkeys = itemLine.map((item) => item.rfxLineItemId);
        const itemExpand = {};
        itemkeys.forEach((item) => {
          itemExpand[item] = true;
        });
        this.changeItemCollapse(itemkeys);

        this.setState({
          expandAllFlag: true,
          itemExpand,
        });
        const queryProps = {
          organizationId,
          queryParams: {
            page: 0,
            size: pageSize,
          },
          data: {
            rfxHeaderId: params.rfxId,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
            checkRemotePriceFlag: 0,
            rfxLineItemIds: itemkeys,
          },
        };
        try {
          res = getResponse(await bacthSearchTableData({ ...queryProps }));
        } finally {
          this.setState({
            pageLoading: false,
          });
          if (res) {
            // res的顺序是错的，需要重新排序
            const batchSearchData = itemkeys.map((item) => res[item]);
            this.setState({
              batchSearchData,
              batchSearchDataKeys: itemkeys,
            });
            if (batchSearchData.length <= 10) {
              itemkeys.forEach((item) => {
                if (!isEmpty(this.itemLineList?.itemLineTable)) {
                  const targetDS = this.itemLineList.itemLineTable[item];
                  if (targetDS) {
                    targetDS.status = 'loading';
                    targetDS.loadData(res[item].content, res[item].totalElements, true);
                    targetDS.status = 'ready';
                  }
                }
              });
            }
          }
        }
      } else {
        this.changeItemCollapse([]);
        if (this.itemLineList?.itemLineTable) {
          Object.values(this.itemLineList.itemLineTable).forEach((ds) => {
            ds.currentPage = 1;
            ds.pageSize = pageSize;
          });
        }
        this.setState(
          {
            itemExpand: {},
            expandAllFlag: false,
            pageLoading: false,
          }
          // 更优解决方案，要是有时间，后续和代码优化可以一起上
          // , () => {
          //   if ( this.itemLineList.scrollTo && this.scrollerContainerRef) {
          //     this.itemLineList.scrollTo(0);
          //     // this.scrollerContainerRef.scrollTo(0, !expandAllFlag ? 0 : 1);
          //   }
          // }
        );
      }
      if (this.itemLineList.scrollTo && this.scrollerContainerRef) {
        this.scrollerContainerRef.scrollTo(0, !expandAllFlag ? 0 : 1);
      }
      return res;
    } else if (type === 'supplier') {
      if (!expandAllFlag) {
        const supplierkeys = supplierLine.map((item) => item.rfxLineSupplierId);
        const supplierExpand = {};
        supplierkeys.forEach((item) => {
          supplierExpand[item] = true;
        });
        this.changeSupplierCollapse(supplierkeys);

        this.setState({
          expandAllFlag: true,
          pageLoading: true,
          supplierExpand,
        });
        const queryProps = {
          organizationId,
          queryParams: {
            page: 0,
            size: pageSize,
          },
          data: {
            rfxHeaderId: params.rfxId,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
            checkRemotePriceFlag: 0,
            rfxLineSupplierIds: supplierkeys,
          },
        };
        try {
          res = getResponse(await bacthSearchTableData({ ...queryProps }));
        } finally {
          this.setState({
            pageLoading: false,
          });
          if (res) {
            // res的顺序是错的，需要重新排序
            const batchSearchData = supplierkeys.map((item) => res[item]);
            this.setState({
              batchSearchData,
              batchSearchDataKeys: supplierkeys,
            });
            if (batchSearchData.length <= 10) {
              supplierkeys.forEach((item) => {
                if (!isEmpty(this.supplierLineList?.supplierLineTable)) {
                  const targetDS = this.supplierLineList.supplierLineTable[item];
                  if (targetDS) {
                    targetDS.status = 'loading';
                    targetDS.loadData(res[item].content, res[item].totalElements, true);
                    targetDS.status = 'ready';
                  }
                }
              });
            }
          }
        }
      } else {
        this.changeSupplierCollapse([]);
        if (this.supplierLineList?.supplierLineTable) {
          Object.values(this.supplierLineList.supplierLineTable).forEach((ds) => {
            ds.currentPage = 1;
            ds.pageSize = pageSize;
          });
        }
        this.setState({
          supplierExpand: {},
          expandAllFlag: false,
          pageLoading: false,
        });
      }
      if (this.supplierLineList.scrollTo && this.scrollerContainerRef) {
        this.scrollerContainerRef.scrollTo(0, !expandAllFlag ? 0 : 1);
      }
      return res;
    }
  }

  @Bind()
  renderButtonGroup({ onlyAllowAllWinBids, checkWay, changeCheckWayLoading }) {
    const { remote } = this.props;

    const showButtonsFlag = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_SHOW_BUTTONS_FLAG', !onlyAllowAllWinBids)
      : !onlyAllowAllWinBids;

    return showButtonsFlag ? (
      <div className="button-group-wrap">
        <ButtonH0.Group onClick={(e) => this.changeCheckWay(e)}>
          <ButtonH0
            type={checkWay === 'ratio' ? 'primary' : ''}
            value="ratio"
            loading={changeCheckWayLoading}
          >
            {intl
              .get('ssrc.inquiryHall.model.button.commomAtTheRatio', {
                checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
              })
              .d('按比例{checkPriceName}')}
          </ButtonH0>
          <ButtonH0
            type={checkWay !== 'ratio' ? 'primary' : ''}
            value="quantity"
            loading={changeCheckWayLoading}
          >
            {intl
              .get('ssrc.inquiryHall.model.button.commonDistributionOnQuantity', {
                checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
              })
              .d('按数量{checkPriceName}')}
          </ButtonH0>
        </ButtonH0.Group>
      </div>
    ) : null;
  }

  getBiddingFieldsFromHeader = () => {
    const { current } = this.basicInfoDs || {};

    const biddingData = current
      ? current.get(['biddingMode', 'biddingTarget', 'biddingFlag', 'sourceCategory'])
      : {};

    return biddingData || {};
  };

  getBiddingHall = () => {
    const { biddingFlag, sourceCategory } = this.getBiddingFieldsFromHeader();

    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    return newBiddingFlag;
  };

  // 日式
  japanBiddingTotalPrice = () => {
    const { biddingMode } = this.getBiddingFieldsFromHeader();
    const flag =
      biddingMode === 'JAPANESE_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  // 荷兰式
  dutchBiddingTotalPrice = () => {
    const { biddingMode } = this.getBiddingFieldsFromHeader();
    const flag =
      biddingMode === 'DUTCH_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  getTotalPriceFlag = () => {
    const { biddingTarget } = this.getBiddingFieldsFromHeader();

    const flag = biddingTarget === 'TOTAL_PRICE';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBiddingTotalPrice = () => {
    const flag = this.japanBiddingTotalPrice() || this.dutchBiddingTotalPrice();

    return flag;
  };

  @Bind()
  getExtranceInstance() {
    return this;
  }

  render() {
    const {
      match,
      remote,
      location,
      dispatch,
      history,
      match: { params },
      custLoading,
      organizationId,
      c7n: {
        customizeCollapse = noop,
        customizeTabPane = noop,
        customizeForm = noop,
        custCollapseForm = noop,
        custTable: customizeTable = noop,
        customizeBtnGroup = noop,
      },
      h0: { customizeForm: customizeFormH0 = noop, customizeTable: customizeTableH0 = noop },
      fetchQueryPriceInfoLoading = false,
      fetchLadderLevelTableLoading = false,
      fetchItemLineLoading = false,
      fetchSupplierLineLoading = false,
      batchMaintainQuotateLineLoading = false,
      fetchIPCoincidenceRateLoading = false,
      querySupplierExchangeEditLoading = false,
      changeCheckWayLoading = false,
      saveExchangeEditLoading,
      allLoading = false,
      turnPageSaveLoading = false,
      modelName = 'inquiryHall',
      [modelName]: {
        settings = {},
        itemLine = [],
        supplierLine = [],
        quotaLadderLevelData = [],
        ipCoincidenceRate = [],
        exchangeEditSupplierList = [],
        code: { selectedPolicy, sourceType },
      },
    } = this.props;

    const {
      id,
      activeKey,
      checkWay,
      bucketDirectory,
      viewOnly,
      priceDataSource,
      supplierNameList,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      chartsLoading,
      viewPriceChartsVisible,
      collapseKeys = [],
      currentPaneActiveSelected = {},
      itemLineTableSelectedRows = [], // 物料行表格选择rows
      itemLineTableSelectedKeys = [], // 物料行表格选择kes
      returnToPretrialModalVisible,
      // priceComparisonModalVisible,
      // item = {},
      // popConfirmFlag,
      ipCoincidenceRateVisible,
      onlineBargainVisible,
      exchangeEditModalVisible = false,
      exchangeEditContentModalVisible = false,
      supplierLineTableSelectedRows = [], // 供应商行表格选择rows
      supplierLineTableSelectedKeys = [], // 供应商行表格选择kes
      batchMaintainQuoteLineVisible = false,
      chooseSection,
      projectInfoVisible,
      routerParams,
      sectionMessageVisible,
      operateSectionPromptProps,
      batchEmptySelectedModalVisible,
      currentButton,
      processVisible,
      checkAttachmentUuid,
      pricingModalVisible,
      newList,
      doubleUnitFlag,
      createItemFlag = null,
      currentSelectionPolicy,
      CheckPermissionObject,
      feedBackBarginHistoryStatus,
      feedBackBarginHistorySearch,
      enterpriceRiskControllerButtonsVisible = {},
      itemActivePanel = [],
      supplierActivePanel = [],
      itemExpand = {},
      supplierExpand = {},
      priceModalBatchSelectionStrategy = '',
      fixedFlag,
      itemLinePageSize,
      supplierLinePageSize,
      expandAllFlag,
      pageLoading,
      batchSearchData,
      batchSearchDataKeys,
      openExpandAllFlag,
      searchPriceLoading,
      clickAllFlag,
      supplierLovSearchPlaceholder,
      supplierSearchMatcher,
      sslmLifeCycleFlag,
      _timestamp = '',
      useNewRateFlag = 0,
      cuxHiddenPriceModalSubmitBtnFlag = false, // 二开隐藏补充物料提交按钮标识
      aiResultData,
    } = this.state;
    const { current } = this.basicInfoDs;
    const onlyAllowAllWinBids = current?.get('onlyAllowAllWinBids');
    const {
      RELATION_MINING = 0, // 关系图谱（关系挖掘）
      RISK_SCAN = 0, // 风险扫描
    } = enterpriceRiskControllerButtonsVisible || {};
    const basicInfoFormProps = {
      customizeForm,
      sourceKey: this.sourceKey,
      basicInfoDs: this.basicInfoDs,
      remote,
      bidFlag: this.bidFlag,
      handleBeSave: this.handleBeSave,
      checkState: this.state,
      quoteLineDs: this.quoteLineDs,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
    };
    const projectTotalPrice =
      this.sectionInfo &&
      this.sectionInfo.getSourceProject &&
      numberSeparatorRender(this.sectionInfo.getSourceProject()?.projectCost);

    const sectionFlag =
      this.sectionInfo &&
      this.sectionInfo.isSectionListEmpty &&
      !this.sectionInfo.isSectionListEmpty();

    const costRemarkProps = {
      remote,
      customizeForm,
      sectionFlag,
      projectTotalPrice,
      sourceKey: this.sourceKey,
      basicInfoDs: this.basicInfoDs,
    };

    const returnToPretrialProps = {
      match,
      dispatch,
      organizationId,
      hideModal: this.hideReturnToPretrial,
      visible: returnToPretrialModalVisible,
      submitReturnToPretrial: this.submitReturnToPretrial,
    };

    const showSupplierRelationFlag = Boolean(RELATION_MINING);

    let supplierHeaderButtons = [
      useNewRateFlag ? (
        <Button
          name="viewIPDetails"
          funcType="link"
          icon="find_in_page"
          onClick={this.handleViewIPDetail}
          style={{ marginRight: '16px' }}
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`).d('查看IP重合详情')}
        </Button>
      ) : settings['011107'] && +settings['011107'].settingValue ? (
        <Button
          name="ipCoincidenceRate"
          funcType="link"
          onClick={this.openIPCoincidenceRateModal}
          style={{ marginRight: '16px' }}
        >
          {intl.get('ssrc.inquiryHall.view.button.IPCoincidenceRate').d('IP重合率')}
        </Button>
      ) : (
        ''
      ),
      (
        remote
          ? remote.process(
              'SSRC_CHECK_PRICE_PROCESS_SHOWSUPPLIERRELATION',
              showSupplierRelationFlag,
              { flag: showSupplierRelationFlag, object: this }
            )
          : showSupplierRelationFlag
      ) ? (
        <Button
          name="relationMap"
          funcType="link"
          onClick={this.supplierRelationMap}
          style={{ marginRight: '16px' }}
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.RelationMap`).d('供应商关系图谱')}
        </Button>
      ) : null,
    ];

    supplierHeaderButtons = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_TAB_PANE_ARRAT_SUPPLIERTAB_BUTTONS_GROUP',
          supplierHeaderButtons,
          {
            that: this,
          }
        )
      : supplierHeaderButtons;

    supplierHeaderButtons = (supplierHeaderButtons || []).filter(Boolean);

    const operations = (
      <React.Fragment>
        {openExpandAllFlag && (
          <a
            onClick={() => this.handleClickExpandAll('supplier')}
            className={styles.supplierRelationship}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.allExpand`).d('一键展开/收起')}
          </a>
        )}
        {customizeBtnGroup(
          {
            code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS`,
          },
          supplierHeaderButtons
        )}
        <Lov
          dataSet={this.supplierOperationDs}
          viewMode="popup"
          name="checkSuppliers"
          onChange={this.changeSelectSupplierOps}
          paramMatcher={({ key, text }) => ({ [key]: (text || []).toString() })}
          searchFieldProps={{
            multiple: true,
            placeholder: supplierLovSearchPlaceholder,
          }}
          placeholder={intl
            .get(`ssrc.inquiryHall.model.inquiryHall.supplierComponyName`)
            .d('供应商')}
          onSearchMatcherChange={this.handleSupplierLovSearchMatcherChange}
          searchMatcher={supplierSearchMatcher}
          popupCls={styles['checkPrice-tab-checkItems-lov-modal']}
          maxTagCount={1}
          maxTagTextLength={20}
        />
        {/* 二开埋点 render */}
        {remote &&
          remote.render('SSRC_CHECK_PRICE_RENDER_TABS_OPERATIONS', <></>, {
            rfxHeaderId: params.rfxId,
            bigFlag: this.bidFlag,
          })}
      </React.Fragment>
    );

    const feedBackBarginHistoryModalProps = {
      quotationName: this.quotationName,
      search: feedBackBarginHistorySearch,
      dispatch,
      doubleUnitFlag,
      organizationId,
      feedBackBarginHistoryStatus,
      onCancel: () => this.setState({ feedBackBarginHistoryStatus: false }),
    };

    // 物品明细props
    const itemLineListProps = {
      remote,
      modelName,
      basicInfoDs: this.basicInfoDs,
      checkWay,
      doubleUnitFlag,
      customizeTable,
      selectedPolicy,
      organizationId,
      takePrice: this.judgeFieldExistAndQuery,
      quotaLadderLevelData,
      headerList: itemLine,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      sourceKey: this.sourceKey,
      allottedQuantityChange: this.allottedQuantityChange,
      rfxHeaderId: params.rfxId,
      fetchLadderLevelTableLoading,
      loading: fetchItemLineLoading,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      queryLadderQuotation: this.queryLadderQuotation,
      onChangePagination: this.changeItemLinePagination,
      showQuotationDetail: this.showQuotationDetail,
      onRef: this.handleGeneratorRef,
      renderValidQuotationQuantity: this.renderValidQuotationQuantity,
      // 缩略图参数
      id,
      itemChartsLoading: chartsLoading[id] && chartsLoading[id].fetchPriceChartLoading,
      priceDataSource,
      supplierNameList,
      onPriceCharts: this.viewPriceCharts,
      onHidePriceCharts: this.hidePriceCharts,
      priceChartsvisible: viewPriceChartsVisible,
      onHandleViewHistoryLow: this.handleHistoryAnalysis,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeItemLineTableSelection: this.changeItemLineTableSelection,
      onComparePriceHistory: this.onComparePriceHistory,
      currentPaneActiveSelected,
      itemLineTableSelectedRows,
      itemLineTableSelectedKeys,
      bidFlag: this.bidFlag,
      activePanel: itemActivePanel,
      changeCollapse: this.changeItemCollapse,
      expand: itemExpand,
      clickCollapseChange: this.clickItemCollapseChange,
      checkPriceTableChange: this.checkPriceTableChange,
      fixedFlag,
      itemLinePageSize,
      expandAllFlag,
      batchSearchData,
      batchSearchDataKeys,
      priceDataObj: this.priceDataObj,
      openExpandAllFlag,
      getContainerRef: this.getContainerRef,
      searchPriceLoading,
      clickAllFlag,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
      history,
      cuxTabRef: this.cuxTabRef,
      refreshCuxTab: this.refreshCuxTab,
      getExtranceInstance: this.getExtranceInstance,
    };
    // 供应商页签props
    const supplierLineListProps = {
      RISK_SCAN,
      basicInfoDs: this.basicInfoDs,
      match,
      checkWay,
      settings,
      doubleUnitFlag,
      customizeTable,
      takePrice: this.judgeFieldExistAndQuery,
      sourceKey: this.sourceKey,
      rfxHeaderId: params.rfxId,
      headerList: supplierLine,
      fetchItemLine: this.fetchItemLine,
      fetchSupplierLine: this.fetchSupplierLine,
      fetchHeaderInfo: this.fetchHeaderInfo,
      loading: fetchSupplierLineLoading,
      onChangePagination: this.changeSupplierLinePagination,
      onRef: this.handleGeneratorRef,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      queryLadderQuotation: this.queryLadderQuotation,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      onRiskScan: this.linkRiskScan,
      fetchQuoteLine: this.fetchQuoteLine,
      renderValidQuotationQuantity: this.renderValidQuotationQuantity,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeSupplierLineTableSelection: this.changeSupplierLineTableSelection,
      onComparePriceHistory: this.onComparePriceHistory,
      currentPaneActiveSelected,
      supplierLineTableSelectedKeys,
      supplierLineTableSelectedRows,
      handleBeSave: this.handleBeSave,
      supplierLifecyclePermission: CheckPermissionObject?.supplierLifecyclePermission?.approve,
      history,
      customizeFormH0,
      bidFlag: this.bidFlag,
      activePanel: supplierActivePanel,
      changeCollapse: this.changeSupplierCollapse,
      expand: supplierExpand,
      clickCollapseChange: this.clickSupplierCollapseChange,
      checkPriceUpdate: this.checkPriceUpdate,
      fixedFlag,
      supplierLinePageSize,
      expandAllFlag,
      batchSearchData,
      batchSearchDataKeys,
      priceDataObj: this.priceDataObj,
      openExpandAllFlag,
      getContainerRef: this.getContainerRef,
      searchPriceLoading,
      clickAllFlag,
      clearAllTable: this.clearAllTable,
      itemLineList: this.itemLineList,
      sslmLifeCycleFlag,
      handleSave: this.handleSave,
      customizeBtnGroup,
      _timestamp,
      current: this,
      refreshAttachmentListTable: this.refreshAttachmentListTable,
      useNewRateFlag,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
      cuxTabRef: this.cuxTabRef,
      refreshCuxTab: this.refreshCuxTab,
      getExtranceInstance: this.getExtranceInstance,
    };

    // 全部报价明细props
    const quoteLineTableProps = {
      remote,
      history,
      bidFlag: this.bidFlag,
      organizationId,
      quoteLineDs: this.quoteLineDs,
      rfxHeaderId: match.params?.rfxId,
      checkWay,
      customizeTable,
      doubleUnitFlag,
      fetchQueryPriceInfoLoading,
      fetchItemLine: this.fetchItemLine,
      fetchSupplierLine: this.fetchSupplierLine,
      fetchHeaderInfo: this.fetchHeaderInfo,
      allQuoteLineRef: this.allQuoteLineRef,
      sourceKey: this.sourceKey,
      basicInfoDs: this.basicInfoDs,
      renderValidQuotationQuantity: this.renderValidQuotationQuantity,
      onComparePriceHistory: this.onComparePriceHistory,
      setState: this.setState.bind(this),
      headerList: itemLine,
      dispatch,
      modelName,
      clearAllTable: this.clearAllTable,
      refreshAttachmentListTable: this.refreshAttachmentListTable,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
      cuxTabRef: this.cuxTabRef,
      refreshCuxTab: this.refreshCuxTab,
      getExtranceInstance: this.getExtranceInstance,
    };

    // 附件
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      viewOnly,
      sourceKey: this.sourceKey,
      custCollapseForm,
      basicInfoDs: this.basicInfoDs,
    };

    const ipCoincidenceRateProps = {
      sourceKey: this.sourceKey,
      visible: ipCoincidenceRateVisible,
      dataSource: ipCoincidenceRate,
      loading: fetchIPCoincidenceRateLoading,
      onConfirmIpCoincidenceRate: this.confirmIpCoincidenceRate,
      useCustomFlag: true,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE`,
      pageName: 'CHECK_PRICE',
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
      organizationId,
      exchangeEditContentModalVisible,
      quoteExchangeMainDataOk: this.quoteExchangeMainDataOk,
      quoteExchangeMainDataCancel: this.quoteExchangeMainDataCancel,
      onRef: this.handleGeneratorRef,
    };

    // 批量维护报价行－modal
    const batchMaintainQuoteLine = {
      remote,
      checkWay,
      batchMaintainQuoteLineVisible,
      customizeForm: customizeFormH0,
      sourceKey: this.sourceKey,
      batchMaintainQuotateLineLoading,
      onRef: this.batchMaintainRef,
      cancelBatchMaintainItemLine: this.cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine: this.saveBatchMaintainItemLine,
      resetBatchMaintainItemLine: this.resetBatchMaintainItemLine,
      turnPageSaveLoading,
      basicInfoDs: this.basicInfoDs,
    };

    // 核价中心弹窗model props
    const headerData = current?.toData() || {};
    const supplierDynamicParams = {
      selectionStrategy: currentSelectionPolicy,
    };
    const pricingCenterModalProps = {
      remote,
      customizeTable: customizeTableH0,
      generateNewPath: this.generateNewPath.bind(this),
      headerValue: headerData,
      costRemarkValue: headerData,
      header: headerData,
      createItemFlag,
      checkAttachmentUuid,
      newList,
      sourceKey: this.sourceKey,
      location,
      rfxHeaderId: params.rfxId,
      visible: pricingModalVisible,
      sectionInfo: this.sectionInfo,
      onCancel: this.handleHideModal,
      itemLineListNode: this.itemLineList,
      activeKey: this.state.activeKey,
      supplierLineListNode: this.supplierLineList,
      supplierDynamicParams,
      resetPolicyDefault: this.resetPolicyDefault,
      quoteLineDs: this.quoteLineDs,
      getCurrentCustomeCode: this.getCurrentCustomeCode,
      getCurrentEditTableData: this.getCurrentEditTableData,
      validateItemLinesDs: this.validateItemLinesDs,
      validateSupplierLinesDs: this.validateSupplierLinesDs,
      title:
        createItemFlag === 1
          ? intl.get('ssrc.inquiryHall.view.modalTitle.createMaterial').d('创建物料')
          : intl.get('ssrc.inquiryHall.view.modalTitle.updateMaterial').d('补充物料'),
      priceModalBatchSelectionStrategy,
      bidFlag: this.bidFlag,
      cuxHiddenPriceModalSubmitBtnFlag, // 二开是否显示提交按钮标识
    };

    const { projectLineSectionId = '' } = routerParams;

    const SectionPanelProps = {
      isSection: projectLineSectionId,
      isBatchMaintainSection: chooseSection,
      queryMain: this.handeleSearchQuerySourceExchangeRateConfig,
      parentPage: {
        name: 'checkPrice',
        queryParams: {
          rfxHeaderId: params.rfxId,
          rfxStatus: 'CHECK_PENDING',
        },
      },
      sourceKey: this.sourceKey,
      onRef: this.handleSectionPanelRef,
      beforeOpenSection: this.validateValue,
      afterOpenSection: this.afterOpenSection,
      switchNotification: intl
        .get('ssrc.inquiryHall.model.inquiryHall.requiredItemsNotFilledIn')
        .d('有必填项未填，无法保存当前页面信息，是否确认切换页面?'),
      judgeChooseSectionButton: this.judgeChooseSectionButton,
    };

    const batchEmptySelectedModalProps = {
      visible: batchEmptySelectedModalVisible,
      parentPage: {
        name: currentButton !== 'roundQuotation' ? 'checkPrice' : 'startRoundQuotation',
      },
      handleOk: this.batchOperateSections,
      handleCancel: this.batchOperateSectionsCancel,
      onRef: this.handleGeneratorRef,
    };

    // 过程附件下载
    const DownloadAttachmentsProps = {
      rfxHeaderId: params.rfxId,
      processVisible,
      downloadAll: this.downloadAll,
      onCancel: this.onCancel,
      organizationId,
    };

    const { status } = this.basicInfoDs;
    const saveOrSubmitLoading =
      allLoading ||
      status === 'loading' ||
      !!this.supplierLineList?.state?.wholePackageLoading ||
      pageLoading;
    // cdp-104889 【捷泰科技】供应商报价IP地址重复提醒
    const { handleTopTips = undefined, cuxHeaderrfxTitleStyle } = remote?.props?.process || {};
    const rfxTitleCollapseStyle = isFunction(cuxHeaderrfxTitleStyle)
      ? cuxHeaderrfxTitleStyle({}, { basicInfoDs: this.basicInfoDs })
      : {};

    return (
      <ModalProvider>
        <div className={commonStyle.commonTop} ref={this.containerRef}>
          <Spin spinning={saveOrSubmitLoading}>
            {this.getHeader()}
            <IntelligentReviewResult aiResultData={aiResultData} />
            <SectionPanel {...SectionPanelProps}>
              <Content>
                <Spin
                  spinning={false}
                  wrapperClassName={classnames('ued-detail-wrapper', styles['page-container'])}
                >
                  {this.renderButtonGroup({ onlyAllowAllWinBids, checkWay, changeCheckWayLoading })}
                  {isFunction(handleTopTips) ? (
                    handleTopTips(this.basicInfoDs, { ...this.props })
                  ) : (
                    <></>
                  )}
                  {customizeCollapse(
                    {
                      code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_COLLAPSE`,
                    },
                    <Collapse
                      className="form-collapse"
                      onChange={this.handleChangeCollapseKeys}
                      custLoading={custLoading}
                      defaultActiveKey={collapseKeys}
                    >
                      <Panel
                        showArrow={false}
                        style={{ ...(rfxTitleCollapseStyle || {}) }}
                        header={
                          <Fragment>
                            {this.renderHeaderTitle()}
                            <a>
                              {collapseKeys.includes('rfxTitle')
                                ? intl.get(`hzero.common.button.up`).d('收起')
                                : intl.get(`hzero.common.button.expand`).d('展开')}
                            </a>
                            <Icon type={collapseKeys.includes('rfxTitle') ? 'up' : 'down'} />
                          </Fragment>
                        }
                        key="rfxTitle"
                      >
                        {this.renderBasicInfoForm(basicInfoFormProps)}
                      </Panel>
                      <Panel
                        showArrow={false}
                        header={
                          <Fragment>
                            <h3>
                              {intl
                                .get(`ssrc.inquiryHall.view.message.panel.costComments`)
                                .d('成本备注')}
                            </h3>
                            <a>
                              {collapseKeys.includes('costRemark')
                                ? intl.get(`hzero.common.button.up`).d('收起')
                                : intl.get(`hzero.common.button.expand`).d('展开')}
                            </a>
                            <Icon type={collapseKeys.includes('costRemark') ? 'up' : 'down'} />
                          </Fragment>
                        }
                        key="costRemark"
                      >
                        <CostRemarkForm {...costRemarkProps} />
                      </Panel>
                    </Collapse>
                  )}
                </Spin>
                <div ref={this.tabRef} />
                <Resizable calcTabWidth={this.calcTabWidth}>
                  <div className={fixedFlag ? styles.fixPadding : ''}>
                    {customizeTabPane(
                      {
                        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEMSINFO_TABS`,
                      },
                      this.renderTabPanes({
                        activeKey,
                        operations,
                        onlyAllowAllWinBids,
                        itemLineListProps,
                        supplierLineListProps,
                        quoteLineTableProps,
                        AttachmentsProps,
                      })
                    )}
                  </div>
                </Resizable>
              </Content>
            </SectionPanel>
          </Spin>
          {this.renderPricingModal(pricingCenterModalProps)}
          {/* {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />} */}
          {returnToPretrialModalVisible && <ReturnToPretrial {...returnToPretrialProps} />}
          {/* {this.renderPriceComparisonModal(priceComparisonProps)} */}
          <IPCoincidenceRate {...ipCoincidenceRateProps} />
          {onlineBargainVisible && this.bargainRuleModal(sourceType)}
          {/** 汇率编辑modal */}
          {exchangeEditModalVisible && <ExchangeEditModal {...ExchangeEditProps} />}
          {/** 引用汇率编辑modal */}
          {exchangeEditContentModalVisible && (
            <QuoteExchangeMainDateModal {...ExchangeQuoteProps} />
          )}
          {/* 批量维护报价行信息 */}
          {this.renderBatchMaintainQuoteLine(batchMaintainQuoteLine)}
          {/* 修改项目信息modal */}
          {projectInfoVisible && <ProjectInfo />}
          {/* 分标段校验信息提醒modal */}
          {sectionMessageVisible && <OperateSectionPromptModal {...operateSectionPromptProps} />}
          {batchEmptySelectedModalVisible && (
            <BatchEmptySelectedModal {...batchEmptySelectedModalProps} />
          )}
          {/* 过程附件下载 */}
          {feedBackBarginHistoryStatus ? (
            <FeedBackBarginHistoryModal {...feedBackBarginHistoryModalProps} />
          ) : null}
          {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
        </div>
      </ModalProvider>
    );
  }
}

export default withStandardCompEnhancer(CheckPrice);
export { CheckPrice, withStandardCompEnhancer as hocCheckPrice }; // 适配二开项目之前引入 `hocCheckPrice`
