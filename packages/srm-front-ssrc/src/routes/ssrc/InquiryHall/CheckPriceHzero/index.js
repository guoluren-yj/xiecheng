/*
 * CheckPriceHzero - 寻源服务/核价页面
 * @date: 2019-1-9
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
/**
 * 保留一份全部报价明细未进行c7n改造前的代码！！！！！！！
 * 租户表单表格个性化配置fx不生效，两种框架更新机制受限
 * 临时备份，供配置了fx的租户继承hzero版，抢修fx功能
 * 继承租户：盈趣、奥克斯！！！！！
 */
import React, { Component, Fragment } from 'react';
import { routerRedux } from 'dva/router';
import {
  Button,
  Collapse,
  Form,
  Col,
  Row,
  Tabs,
  Tag,
  Modal,
  Icon,
  Spin,
  Select,
  // Popconfirm,
} from 'hzero-ui';
import { Modal as c7nModal, ModalProvider } from 'choerodon-ui/pro';
import { Bind, debounce } from 'lodash-decorators';
import { isUndefined, isEmpty, isArray, cloneDeep, map, isNil } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';
import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
// import Icons from 'components/Icons';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';
import {
  getEditTableData,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { dateFormate, fetchBiddingHallConfigResult, } from '@/utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { getActiveTabKey } from 'utils/menuTab';

import { downloadFile } from 'hzero-front/lib/services/api';
import ExchangeEditModal from '@/routes/ssrc/components/ExchangeEditModals/ExchangeEditModal';
import QuoteExchangeMainDateModal from '@/routes/ssrc/components/ExchangeEditModals/QuoteExchangeMainDateModal';
import moneyBook from '@/assets/money-book.svg';
import CommonImport from '@/routes/himp/CommonImportNew';
import { FIlESIZE } from '@/utils/SsrcRegx';
import SectionPanel from '@/routes/ssrc/InquiryHall/SectionPanel';
import OperateSectionPromptModal from '@/routes/ssrc/InquiryHall/SectionPanel/OperateSectionPromptModal';
import BatchEmptySelectedModal from '@/routes/ssrc/InquiryHall/SectionPanel/BatchEmptySelectedModal';
import PreviewScoreManager from '@/routes/ssrc/components/PreviewScoreManager';
import PopoverButton from '@/routes/components/PopoverButton';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import { queryProcessAttachmentConfig, queryH0OrC7N } from '@/services/commonService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';

import ItemLineList from './ItemLineList';
import SupplierLineList from './SupplierLineList';
import QuoteLineTable from './QuoteLineTable';
import styles from './index.less';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import OperationRecord from '../../components/OperationRecord';
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import Attachment from '../../components/Attachment';
import ReturnToPretrial from './ReturnToPretrial';
import PricingModal from './PricingModal';
import IPCoincidenceRate from '../../../components/IPCoincidenceRate/index';
import BatchMaintainQuoteLine from './BatchMaintainQuoteLine';
import ProjectInfo from './Project';
import DownloadAttachments from '../../components/DownloadAttachments';
import PriceClarificationButtons from './../../../sbid/ExpertScoring/Update/PriceClarificationButtons';
import HeaderForm from './HeaderForm';
import CostRemarkForm from './CostRemarkForm';
import BargainRuleModal from './BargainRuleModal';
import ExpertScoreModal from './ExpertScoreModal';
import { withStandardCompEnhancer } from './standardCompEnhancerCreator';

const { Panel } = Collapse;
const { TabPane } = Tabs;

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
class CheckPrice extends Component {
  constructor(props) {
    super(props);
    this.BatchMaintainRef = {};
    const routerParams = querystring.parse(this.props.history.location.search.substr(1));

    this.state = {
      routerParams,
      activeKey: 'itemLine', // 当前激活tab面板的key
      operationRecordModalVisible: false, // 操作记录模态框
      returnToPretrialModalVisible: false, // 退回至初审模态框
      priceComparisonModalVisible: true, // 比价助手模态框
      item: {}, // 历史最低价物品对象
      updateState: false,
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      viewPriceChartsVisible: false, // 物品明报价细折线图
      priceDataSource: [], // 物品明报价细折线图数据源
      supplierNameList: [], // 物品明报价细折线图有报价的供应商
      chartsLoading: {},
      id: undefined,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      viewOnly: true, // 是否只读标识位
      collapseKeys: ['rfxTitle'], // 打开的折叠面板key
      checkAttachmentUuid: null, // header附件
      pricingModalVisible: false, // 是否弹出中心弹窗
      ipCoincidenceRateVisible: false, // ip重合率弹框
      newList: [], // 提交时为推荐供应商的物料List
      onlineBargainVisible: false, // 议价方式的弹窗
      exchangeEditModalVisible: false, // 汇率编辑modal
      exchangeEditContentModalVisible: false, // 汇率编辑引用汇率主数据modal
      // popConfirmFlag: false, // 是否显示浮窗
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      currentPaneActiveSelected: {}, // 当前页签下打开列表的表格选择行
      itemLineTableSelectedRows: [], // 物料行表格选择rows
      itemLineTableSelectedKeys: [], // 物料行表格选择kes
      supplierLineTableSelectedRows: [], // 供应商行表格选择rows
      supplierLineTableSelectedKeys: [], // 供应商行表格选择kes
      allQuotationLineTableSelectedRows: [], // 全部报价行表格选择rows
      allQuotationLineTableSelectedKeys: [], // 全部报价行表格选择kes
      createItemFlag: null, // 创建物料标识 0/1/2
      checkWay: 'quantity', // 核价方式 默认数量
      batchMaintainQuoteLineVisible: false, // 批量维护报价行表单
      currentSelectionPolicy: null, // 询价单选择策略
      hasChangePercentField: null, // 是否配置涨跌幅列, 默认为null, 查询个性化接口后设置为 false/true
      hasMinPriceField: null, // 是否配置最低价, 默认为null, 查询个性化接口后设置为 false/true
      hasNewPriceField: null, // 是否配置最新价, 默认为null, 查询个性化接口后设置为 false/true
      custFields: null, // 个性化列
      chooseSection: false,
      sectionMessageVisible: false,
      processVisible: false,
      operateSectionPromptProps: {},
      batchEmptySelectedModalVisible: false,
      readConfig: {}, // 提交是否下次不再提醒的config
      roundConfig: {}, // 发起多轮报价是否下次不再提醒的config
      currentButton: '', // 当前点击的按钮
      chooseSectionBtnShowFlag: false, // 选择标段按钮是否显示标识
      biddingHallFlag: false, // 是否开启竞价大厅配置
      bargainNewFlag: false, // 议价-新
    };
  }

  headerFormRef = null; // 头ref

  costRemarkFormRef = null; // 成本备注ref

  bargainRuleModalRef = null; // 议价规则ref

  itemLineList = null; // 物料行列表ref

  supplierLineList = null; // 供应商行列表ref

  quoteLine = null; // 报价行ref

  sectionInfo = {}; // section panel ref

  BatchEmptySectionRef = {};

  exchangeRate = null; // 引用汇率编辑modal ref

  activeTabKey = getActiveTabKey();

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { routerParams } = this.state;
    this.fetchCheckWay();
    this.fetchQueryUnitCustConfig();
    this.queryMain(); // `queryMain` 调用提升至父组件内
    if (routerParams.projectLineSectionId) {
      this.fetchBatchRoundQuotationConfig();
      this.fetchBatchSubmitConfig();
    }

    this.addAllPageRefreshToWindow();
    this.handeleSearchProcessAttachmentConfig();
    this.fetchBiddingHallConfig();
    this.fetchH0OrC7N();
  }

  // 查询配置表--是否启用竞价大厅
  fetchBiddingHallConfig = async () => {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const rfxHeaderId = params.rfxId;
    let biddingHallFlag = null;

    try {
      biddingHallFlag = await fetchBiddingHallConfigResult({
        organizationId,
        groupCamp: "PURCHASER", // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
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
      }
    } finally {
      this.setState({
        attachmentNewUILoading: false,
      });
    }
  }

  /**
   * 需要等到个性化接口查询完成后, custConfig中才会有值
   */
  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && prevProps.custLoading !== this.props.custLoading) {
      // 由true => false
      this.dealCustActiveTabKey();
    }
  }

  /**
   * 处理个性化Tabs时, 需要同步activeKey, 因为个性化只是覆盖默认的defaultActiveKey, 并不会改变activeKey
   */
  dealCustActiveTabKey() {
    const { fieldCode } =
      this.props
        .getHocInstance?.()
        .custConfig['SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS']?.fields?.find(
          (item) => item.defaultActive === 1
        ) || {};
    if (fieldCode) {
      this.setState({
        activeKey: fieldCode,
      });
    }
  }

  @Bind()
  queryMain() {
    this.fetchInquiryHallCheckPrice();
    this.fetchItemLine();
    this.fetchSupplierLine();
    this.fetchQuoteLine();
  }

  // 全局页面刷新，个性化弹窗二开使用
  addAllPageRefreshToWindow = () => {
    const SsrcCheckPriceRefreshAllPage = () => {
      this.fetchInquiryHallCheckPrice();
      this.fetchItemLine();
      this.fetchSupplierLine();
      this.fetchQuoteLine();
      this.fetchCheckWay();
      this.fetchQueryUnitCustConfig();
    };
    window.SsrcCheckPriceRefreshAllPage = SsrcCheckPriceRefreshAllPage;
  };

  // 查询个性化单元配置
  async fetchQueryUnitCustConfig() {
    const { dispatch, organizationId } = this.props;
    const unitCode = 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL';
    const custUnitConfig = await dispatch({
      type: 'inquiryHall/fetchQueryUnitCustConfig',
      payload: {
        organizationId,
        unitCode,
      },
    });
    if (custUnitConfig && custUnitConfig[unitCode]) {
      // 判断是否有配置个性化字段且visible为1
      const { fields = [] } = custUnitConfig[unitCode];
      this.setState({
        custFields: fields,
      });
    }
  }

  // 查询是否启用c7n版功能
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj = res.find((item) => item.function === 'Bargaining_switch_C7N' && item.whiteFlag === '1') || {}; // 议价
      this.setState({
        bargainNewFlag: !isEmpty(bargainObj),
      });
    }
  };

  /**
   * 组件销毁，清空状态树中得值
   */
  componentWillUnmount() {
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        header: {},
        itemLine: [],
        supplierLine: [],
        quoteLine: [],
        itemQuoteLine: [],
        itemQuoteLinePagination: {},
        supplierQuoteLine: [],
        quotaLadderLevelData: [],
        supplierQuoteLinePagination: {},
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
        exchangeEditSupplierList: [],
        exchangeEditSupplierPagination: {},
      },
    });
    window.SsrcCheckPriceRefreshAllPage = null;
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
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
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
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
    const rfxHeaderId = params.rfxId;
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
      inquiryHall: { header = [] },
      dispatch,
      organizationId,
    } = this.props;
    let pathname;
    dispatch({
      type: 'inquiryHall/submitReturnToPretrial',
      payload: {
        rfxHeaderId: params.rfxId,
        organizationId,
        backPretrialRemark: value.backPretrialRemark,
        objectVersionNumber: header.objectVersionNumber,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        pathname = `${this.activeTabKey}/list`;
        dispatch(
          routerRedux.push({
            pathname,
          })
        );
      } else {
        this.setState({ returnToPretrialModalVisible: false });
      }
    });
  }

  /**
   * 获取核价方式
   * */
  @Bind()
  fetchCheckWay() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `inquiryHall/fetchRfxDetailLayout`,
      payload: {
        organizationId,
        configKey: 'checkPriceWay',
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      this.setCheckWay(res);
    });
  }

  @Bind()
  fetchBatchSubmitConfig() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `inquiryHall/fetchSectionBatchSubmit`,
      payload: {
        organizationId,
        configKey: 'sectionCheckPrice',
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      const { configKey, configValue = '' } = res;
      if (configKey !== 'sectionCheckPrice' || !configValue) {
        return;
      }
      this.setState({
        readConfig: res,
      });
    });
  }

  @Bind()
  fetchBatchRoundQuotationConfig() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `inquiryHall/fetchSectionRoundQuotation`,
      payload: {
        organizationId,
        configKey: 'sectionStartRoundQuotation',
      },
    }).then((res) => {
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

  // 设置核价方式
  @Bind()
  setCheckWay(result = {}) {
    const { configKey, configValue = '' } = result;

    if (configKey !== 'checkPriceWay' || !configValue) {
      return;
    }
    this.setState({
      checkWay: configValue,
    });
  }

  /**
   * 询价大厅-核价头信息查询
   */
  @Bind()
  fetchInquiryHallCheckPrice() {
    const {
      match: { params, path = null },
      dispatch,
      organizationId,
    } = this.props;
    let projectLineSectionIds = null;
    if (this.sectionInfo.isSectionListEmpty && !this.sectionInfo.isSectionListEmpty()) {
      const ids = this.sectionInfo.getAllSectionList().map((item) => item.projectLineSectionId);
      projectLineSectionIds = ids.join();
    }
    dispatch({
      type: 'inquiryHall/fetchInquiryHeaderDetail',
      payload: {
        rfxHeaderId: params.rfxId,
        organizationId,
        path,
        projectLineSectionIds,
        customizeUnitCode:
          'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE.COST,SSRC.INQUIRY_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM',
      },
    }).then((res) => {
      if (isEmpty(res)) {
        return;
      }
      const {
        onlyAllowAllWinBids = 0, // 模板配置允许整单中标
      } = res || {};

      // 此处合并setState, 异步set 会触发多次渲染
      this.setState(
        Object.assign(
          {
            checkAttachmentUuid: res.checkAttachmentUuid || null,
          },
          onlyAllowAllWinBids && {
            checkWay: 'ratio',
            activeKey: 'supplierLine',
          }
        )
      );
    });
    const lovCodes = {
      selectedPolicy: 'SSRC.RFX_SELECTION_STRATEGY', // 选择策略
      sourceType: 'SSRC.BARGAIN_METHOD', // 议价方式
      quoteLineSelectionStrategy: 'SSRC.QUICK_CHOOSE_STRATEGY', // 全部报价明细选择策略
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
    // 查询配置中心
    dispatch({
      type: 'inquiryHall/querySetting',
      payload: {
        '011107': '011107', // ip校验
      },
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
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchItemLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL',
      },
    });
  }

  /**
   * 物品明细 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const {
      inquiryHall: { itemLineChange = false, itemQuoteLine = [] },
    } = this.props;
    const { checkWay } = this.state;
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;

    if (itemLineChange) {
      const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
      if (itemQuoteLine.length > 0 && itemQuoteLineParams.length === 0) {
        Modal.confirm({
          content: intl
            .get('ssrc.inquryHall.view.inquryHall.hasValidateFail')
            .d('存在必填字段未填，数据将不保存，是否继续分页?'),
          onOk: () => this.fetchItemLine(changedPagination),
        });
      } else {
        this.turnPageSave(changedPagination);
      }
    } else {
      this.fetchItemLine(changedPagination);
    }
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const {
      inquiryHall: { supplierLineChange = false, supplierQuoteLine = [] },
    } = this.props;
    const { checkWay } = this.state;
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;

    if (supplierLineChange) {
      const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
      if (supplierQuoteLine.length > 0 && supplierQuoteLineParams.length === 0) {
        Modal.confirm({
          content: intl
            .get('ssrc.inquryHall.view.inquryHall.hasValidateFail')
            .d('存在必填字段未填，数据将不保存，是否继续分页?'),
          onOk: () => this.fetchSupplierLine(changedPagination),
        });
      } else {
        this.turnPageSave(changedPagination);
      }
    } else {
      this.fetchSupplierLine(changedPagination);
    }
  }

  /**
   * 全部报价明细 - 改变分页
   * @param {*} page 分页参数
   */
  @Bind()
  changeQuoteLinePagination(page) {
    const {
      inquiryHall: { allLineChange = false, quoteLine = [] },
    } = this.props;
    const { checkWay } = this.state;
    if (allLineChange) {
      const quoteLineParams = this.getCurrentEditTableData(quoteLine, checkWay);
      if (quoteLine.length > 0 && quoteLineParams.length === 0) {
        Modal.confirm({
          content: intl
            .get('ssrc.inquryHall.view.inquryHall.hasValidateFail')
            .d('存在必填字段未填，数据将不保存，是否继续分页?'),
          onOk: () => this.fetchQuoteLine(page),
        });
      } else {
        this.turnPageSave(page);
      }
    } else {
      this.fetchQuoteLine(page);
    }
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchSupplierLineCheckPrice',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
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
    } = this.props;
    if (chartFlag === 'i') {
      // 查询物品明细缩略图数据
      dispatch({
        type: 'inquiryHall/fetchPriceChartsData',
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
        type: 'inquiryHall/fetchPriceChartsData',
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
    this.setState({
      viewPriceChartsVisible: false,
      priceDataSource: [],
      supplierNameList: [],
    });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
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
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchLadderLevelTable',
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

  /**
   * 物料行表格行选择
   * */
  @Bind()
  changeAllQuotationLineTableSelection(keys = [], rows = []) {
    this.setState({
      allQuotationLineTableSelectedRows: rows,
      allQuotationLineTableSelectedKeys: keys,
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
   * 获取行数据
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
   * 全部报价明细 - 查询
   */
  @Bind()
  async fetchQuoteLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    const res = await dispatch({
      type: 'inquiryHall/fetchQuoteLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL',
      },
    });
    if (res) {
      this.judgeFieldExistAndQuery('changePercent', page, res);
      this.judgeFieldExistAndQuery('minPrice', page, res);
      this.judgeFieldExistAndQuery('newPrice', page, res);
    }
  }

  /**
   * 判断个性化列是否配置
   * @param {string} fieldName - 列名
   * @param {Object} page - 分页对象
   * @param {Array} res - 接口返回数据源
   */
  async judgeFieldExistAndQuery(fieldName, page, res) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    const pascalFieldName = fieldName.replace(
      fieldName.charAt(0),
      fieldName.charAt(0).toUpperCase()
    ); // Pascal命名法
    const { custFields, [`has${pascalFieldName}Field`]: hasField } = this.state;
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
    if (hasField) {
      dispatch({
        type: `inquiryHall/fetchQueryPriceInfo`,
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
            priceQueryParamsVOS: res.map((r) => ({
              quotationLineId: r.quotationLineId,
            })),
          }, // 报价行
        },
      });
    } else {
      // 第一次进入为 `null`
      const index =
        isArray(custFields) &&
        custFields.findIndex((item) => item.fieldCode === fieldName && item.visible === 1);
      if (index > -1) {
        dispatch({
          type: `inquiryHall/fetchQueryPriceInfo`,
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
              priceQueryParamsVOS: res.map((r) => ({
                quotationLineId: r.quotationLineId,
              })),
            }, // 报价行
          },
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
  }

  /**
   * 物品明细行明细 - 查询
   */
  @Bind()
  fetchItemQuoteLineList(itemQuoteLineId, updateState) {
    itemQuoteLineId.forEach((item) =>
      this.itemLineList?.fetchItemLineTableList({}, item, updateState)
    );
  }

  /**
   * 供应商行明细 - 查询
   */
  @Bind()
  fetchSupplierQuoteLineList(supplierQuoteLineId, updateState) {
    supplierQuoteLineId.forEach((item) =>
      this.supplierLineList?.fetchSupplierLineTableList({}, item, updateState)
    );
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
   * @param {*} data 数据源的表格数据
   */
  @Bind()
  throughArray(data) {
    const { activeKey = undefined } = this.state;
    let tableData = [];
    const popFlags = { flag: false, errorFlag: false, async: false };
    const formFlag = data.every((item) => item.$form);
    tableData = data && getEditTableData(data, [], { force: true });
    const suggestedLine = tableData.filter((item) => item.suggestedFlag === 1);
    if (tableData.length === 0 && data.length !== 0 && formFlag) {
      popFlags.errorFlag = true;
      return popFlags;
    }
    let newData = [];
    if (activeKey === 'supplierLine' || activeKey === 'quoteLine') {
      newData = this.groupBy(suggestedLine, (item) => {
        return [item.itemCode, item.itemName, item.rfxLineItemNum]; // 按照物料id名称和行号将数据进行分组
      });
    } else {
      newData = this.groupBy(suggestedLine, (item) => {
        return [item.itemCode, item.itemName]; // 按照物料id和物料名称将数据进行分组
      });
    }
    newData.forEach((items) => {
      items.forEach((item) => {
        const { allottedQuantity } = item;
        // itemLineParamsAll += allottedQuantity;
        if (Number(allottedQuantity) > Number(item.rfxQuantity)) {
          popFlags.flag = true;
        }
      });
    });
    popFlags.async = true;
    return popFlags;
  }

  // 保存校验
  @Bind()
  handleBeSave(type) {
    const {
      inquiryHall: { itemQuoteLine = [], supplierQuoteLine = [], quoteLine = [] },
    } = this.props;
    const { activeKey = undefined, checkWay } = this.state;

    let popFlag = { flag: false, errorFlag: false, async: false };
    if (activeKey === 'itemLine') {
      popFlag = this.throughArray(itemQuoteLine);
    } else if (activeKey === 'supplierLine') {
      popFlag = this.throughArray(supplierQuoteLine);
    } else if (activeKey === 'quoteLine') {
      popFlag = this.throughArray(quoteLine);
    }

    if (popFlag.errorFlag || !popFlag.async) {
      return;
    }

    if (type && popFlag.flag && checkWay === 'quantity') {
      Modal.confirm({
        content: intl
          .get('ssrc.bidHall.view.message.rfxQuantityOver')
          .d('分配数量超出需求数量，是否需要点击继续?'),
        onOk: () => this.handleSave(),
      });
    } else if (type) {
      this.handleSave();
    } else if (!type) {
      this.handleSubmit();
    }
  }

  /**
   * 清空所有store中的table缓存
   */
  @Bind()
  clearAllTable() {
    const { activeKey } = this.state;
    const { dispatch } = this.props;
    notification.success();
    // 先清空物料行数据，再查询
    dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemQuoteLine: [],
        itemQuoteLinePagination: {},
        itemLineChange: false,
        supplierQuoteLine: [],
        supplierQuoteLinePagination: {},
        supplierLineChange: false,
        quoteLine: [],
        quoteLinePagination: {},
        allLineChange: false,
        itemLine: [],
        supplierLine: [],
      },
    });
    if (activeKey !== 'itemLine' && this.itemLineList) {
      this.itemLineList.setState({
        expand: {},
        isShow: {},
        activePanel: [],
      });
    }
    if (activeKey !== 'supplierLine' && this.supplierLineList) {
      this.supplierLineList.setState({
        expand: {},
        isShow: {},
        activePanel: [],
      });
    }
  }

  /**
   * 核价翻页保存
   * @param {Object} page 分页参数
   */
  @Bind()
  turnPageSave(page) {
    const { dispatch, organizationId } = this.props;
    let checkPriceDTOLineList = [];
    const doSave = () => {
      const customizeUnitCode = this.getCurrentCustomeCode();
      return dispatch({
        type: 'inquiryHall/turnPageSave',
        payload: {
          organizationId,
          checkPriceDTOLineList,
          customizeUnitCode,
        },
      });
    };
    checkPriceDTOLineList = this.getCheckPriceDTOLineList();
    if (checkPriceDTOLineList && checkPriceDTOLineList.length) {
      doSave().then(() => {
        this.refreshActiveData('', page);
      });
    }
  }

  /**
   * 获取当前需要的customeCode
   * @param {*} includeHeader 是否含头
   */
  @Bind()
  getCurrentCustomeCode(includeHeader) {
    const { activeKey } = this.state;
    let currentCustomeCode;
    switch (activeKey) {
      case 'itemLine':
        currentCustomeCode = includeHeader
          ? 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL,SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE.COST'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL';
        break;
      case 'supplierLine':
        currentCustomeCode = includeHeader
          ? 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE.COST'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_SUPPLIER';
        break;
      case 'quoteLine':
        currentCustomeCode = includeHeader
          ? 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL,SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO,SSRC.INQUIRY_HALL_CHECK_PRICE.COST'
          : 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL';
        break;
      default:
        currentCustomeCode = '';
        break;
    }
    return currentCustomeCode;
  }

  /**
   * 保存 - 核价
   * 只保存当前tab，其他tab进去重新查
   */
  @Bind()
  handleSave(sectionChange) {
    const {
      inquiryHall: { header = {}, itemQuoteLine = [], supplierQuoteLine = [], quoteLine = [] },
      dispatch,
      organizationId,
    } = this.props;
    const {
      activeKey = undefined,
      checkWay,
      routerParams: { projectLineSectionId },
    } = this.state;
    const retrieveData = {
      priceBatchQuantity: intl
        .get('ssrc.inquiryHall.model.inquiryHall.priceBatchMsg')
        .d('【价格批量】'),
      allottedQuantity: intl
        .get('ssrc.inquiryHall.model.inquiryHall.allocatedQuantityMsg')
        .d('【分配数量】'),
      suggestedRemark: intl
        .get('ssrc.inquiryHall.model.inquiryHall.chooseReasonMsg')
        .d('【选用理由】'),
    };
    let checkPriceDTOLineList = [];

    // add ----- 分别从对应formRef中去获取form
    const save = new Promise((resolve) => {
      const validateHeaderForm = this.validateForm('header');
      const validateCostRemarkForm = this.validateForm('costRemark');
      // 全部校验通过后
      Promise.all([validateHeaderForm, validateCostRemarkForm])
        .then(([headerValues, costRemarkValues]) => {
          const values = {
            ...headerValues,
            ...costRemarkValues,
          };
          const { costRemark = '', totalCost = '' } = values;
          const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
          const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
          const quoteLineParams = this.getCurrentEditTableData(quoteLine, checkWay);
          const doSave = () => {
            checkPriceDTOLineList = this.getCheckPriceDTOLineList();
            const customizeUnitCode = this.getCurrentCustomeCode(true);
            const allProjectLineSectionList =
              this.sectionInfo.getAllSectionList && this.sectionInfo.getAllSectionList();
            if (checkPriceDTOLineList && checkPriceDTOLineList.length) {
              return dispatch({
                type: 'inquiryHall/saveCheckPrice',
                payload: Object.assign(
                  {},
                  {
                    ...values,
                    costRemark,
                    totalCost,
                    objectVersionNumber: header.objectVersionNumber,
                    rfxHeaderId: header.rfxHeaderId,
                    organizationId,
                    projectName: activeKey === 'supplierLine' ? 'STANDARD' : undefined,
                    checkPriceDTOLineList,
                    customizeUnitCode,
                    allProjectLineSectionList,
                  },
                  this.getStateParams()
                ),
              });
            } else {
              resolve(false);
            }
          };
          // eslint-disable-next-line no-unused-expressions
          this.headerFormRef?.props?.form.resetFields(); // TODO 保存后不能刷新个性化字段
          // eslint-disable-next-line no-unused-expressions
          this.costRemarkFormRef?.props?.form.resetFields(); // TODO 保存后不能刷新个性化字段
          // doSave().then((res) => {
          //   if (res) {
          //     this.refreshActiveData(true);
          //   }
          // });
          if (activeKey === 'itemLine') {
            if (isEmpty(itemQuoteLine) || !isEmpty(itemQuoteLineParams)) {
              doSave().then((res) => {
                if (res) {
                  if (!sectionChange) {
                    this.refreshActiveData(true);
                  } else if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
                    this.sectionInfo.refreshSectionList();
                  }
                  resolve(true);
                }
              });
            } else {
              const itemLineData = [
                intl.get('ssrc.inquiryHall.view.inquiryHall.itemLines').d('物料明细页签的'),
              ];
              this.notificationTrans(itemLineData, itemQuoteLine, retrieveData);
              resolve(false);
            }
          } else if (activeKey === 'supplierLine') {
            if (
              isEmpty(supplierQuoteLine) ||
              !isEmpty(supplierQuoteLineParams) ||
              (!isEmpty(supplierQuoteLine) && isEmpty(supplierQuoteLineParams))
            ) {
              doSave().then((res) => {
                if (res) {
                  if (!sectionChange) {
                    this.refreshActiveData(true);
                  } else if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
                    this.sectionInfo.refreshSectionList();
                  }
                  resolve(true);
                }
              });
            } else {
              const supplierData = [
                intl
                  .get('ssrc.inquiryHall.view.inquiryHall.supplierLineLines')
                  .d('供应商列表页签的'),
              ];
              this.notificationTrans(supplierData, supplierQuoteLine, retrieveData);
              resolve(false);
            }
          } else if (isEmpty(quoteLine) || !isEmpty(quoteLineParams)) {
            doSave().then((res) => {
              if (res) {
                if (!sectionChange) {
                  this.refreshActiveData(true);
                } else if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
                  this.sectionInfo.refreshSectionList();
                }
                resolve(true);
              }
            });
          } else {
            const quoteLineData = [
              intl
                .get('ssrc.inquiryHall.view.inquiryHall.quotelineLineLines')
                .d('全部报价明细页签的'),
            ];
            this.notificationTrans(quoteLineData, quoteLine, retrieveData);
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    });
    return save;
  }

  /**
   * 获取state params
   * @protected - 此方法被二开, 严禁他人删除修改
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

  @Bind()
  validateValue() {
    const {
      inquiryHall: { itemQuoteLine = [], supplierQuoteLine = [], quoteLine = [] },
    } = this.props;
    const { checkWay, activeKey } = this.state;
    return new Promise((resolve) => {
      // add ----- 分别从对应formRef中去获取form
      const validateHeaderForm = this.validateForm('header');
      const validateCostRemarkForm = this.validateForm('costRemark');
      // 全部校验通过后
      Promise.all([validateHeaderForm, validateCostRemarkForm])
        .then(() => {
          const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
          const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
          const quoteLineParams = this.getCurrentEditTableData(quoteLine, checkWay);
          if (
            (!isEmpty(itemQuoteLine) && isEmpty(itemQuoteLineParams) && activeKey === 'itemLine') ||
            (!isEmpty(supplierQuoteLine) &&
              isEmpty(supplierQuoteLineParams) &&
              activeKey === 'supplierLine') ||
            (!isEmpty(quoteLine) && isEmpty(quoteLineParams) && activeKey === 'quoteLine')
          ) {
            resolve(false);
          } else {
            resolve(true);
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
      await this.handleSave(saveFlag);
    }
    // eslint-disable-next-line no-unused-expressions
    this.supplierLineList?.setState({
      expand: {},
      isShow: {},
      activePanel: [],
    });
    await dispatch(
      routerRedux.replace({
        pathname: `/ssrc/new-inquiry-hall/check-price/${rfxHeaderId}`,
        search,
      })
    );
    this.queryMain();
  }

  /**
   * 根据核价方式获取当前的表格数据
   * @param {*} data 校验行数据
   * @param {*} checkWay 核价方式
   */
  @Bind()
  getCurrentEditTableData(data = [], checkWay) {
    const editData = data[0]?.$form ? data && getEditTableData(data, [], { force: true }) : data;
    const returnEditData =
      checkWay === 'quantity'
        ? editData.map((item) => ({
            ...item,
            allottedRatio: null,
            validExpiryDateFrom: item?.validExpiryDateFrom?.format
              ? item?.validExpiryDateFrom?.format('YYYY-MM-DD HH:mm:ss')
              : item?.validExpiryDateFrom,
            validExpiryDateTo: item?.validExpiryDateTo?.format
              ? item?.validExpiryDateTo?.format('YYYY-MM-DD HH:mm:ss')
              : item?.validExpiryDateTo,
          }))
        : editData.map((item) => ({
            ...item,
            allottedQuantity: null,
            validExpiryDateFrom: item?.validExpiryDateFrom?.format
              ? item?.validExpiryDateFrom?.format('YYYY-MM-DD HH:mm:ss')
              : item?.validExpiryDateFrom,
            validExpiryDateTo: item?.validExpiryDateTo?.format
              ? item?.validExpiryDateTo?.format('YYYY-MM-DD HH:mm:ss')
              : item?.validExpiryDateTo,
          }));
    return returnEditData;
  }

  @Bind()
  getCheckPriceDTOLineList() {
    const {
      inquiryHall: {
        itemLine = [],
        supplierLine = [],
        itemQuoteLine = [],
        supplierQuoteLine = [],
        quoteLine = [],
      },
    } = this.props;
    const { activeKey, checkWay } = this.state;
    let checkPriceDTOLineList = [];
    const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
    const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
    const quoteLineParams = this.getCurrentEditTableData(quoteLine, checkWay);
    if (activeKey === 'itemLine') {
      checkPriceDTOLineList = itemLine.map((item) => {
        return {
          quotationLineList: itemQuoteLineParams
            // eslint-disable-next-line
            .filter((r) => r.rfxLineItemId == item.rfxLineItemId),
          rfxLineItemId: item.rfxLineItemId,
          rfxLineItemNum: item.rfxLineItemNum,
          selectionStrategy: this.itemLineList?.props?.form?.getFieldValue(
            `value#${item.rfxLineItemId}`
          ),
          objectVersionNumber: item.objectVersionNumber,
          type: 'ITEM',
        };
      });
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
          quotationLineList: quoteLineParams.map((item) => {
            return { ...item };
          }),
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
      Modal.warning({
        content: (
          <div>
            <div>
              {intl
                .get('ssrc.inquiryHall.view.amountTooMuchSubmit')
                .d('核价总金额超过了预算总金额，无法提交')}
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
        Modal.confirm({
          content: `${value},${intl
            .get('ssrc.inquiryHall.model.inquiryHall.continueSubmit')
            .d('是否继续提交?')}`,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (key === 'AllottedRatioGreaterHundred' && check === 'ratio') {
        Modal.confirm({
          content: `${intl
            .get('ssrc.inquiryHall.view.message.allottedRatioOverOneHundred')
            .d('分配比例之和超过了100，是否继续提交核价?')}`,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (key === 'supplierStageAllowSource') {
        Modal.confirm({
          content: `${intl
            .get('ssrc.inquiryHall.view.notification.lifeCycleStateInvalidate')
            .d('中标供应商存在非合格供应商，请确认是否提交核价?')}`,
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (onlyAllowAllWinBids && key === 'chooseSelectionStrategy' && value) {
        Modal.confirm(
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
        Modal.confirm({
          content: intl
            .get('ssrc.inquiryHall.view.sureSumbitAsTooMuchAmount')
            .d('核价总金额超过了预算总金额，是否确认提交？'),
          onOk: () => judgeHandleOk(),
          onCancel: () => cancelModal(),
        });
      } else if (key === 'supplierStageAllowBidSoft' && value) {
        Modal.confirm({
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
      inquiryHall: { header = {}, itemQuoteLine = [], supplierQuoteLine = [], quoteLine = [] },
      dispatch,
      organizationId,
      history,
    } = this.props;
    const { activeKey = undefined, checkWay, readConfig } = this.state;
    const retrieveData = {
      priceBatchQuantity: intl
        .get('ssrc.inquiryHall.model.inquiryHall.priceBatchMsg')
        .d('【价格批量】'),
      allottedQuantity: intl
        .get('ssrc.inquiryHall.model.inquiryHall.allocatedQuantityMsg')
        .d('【分配数量】'),
      suggestedRemark: intl
        .get('ssrc.inquiryHall.model.inquiryHall.chooseReasonMsg')
        .d('【选用理由】'),
    };
    const { onlyAllowAllWinBids = 0 } = header;
    const sectionFlag =
      this.sectionInfo.isSectionListEmpty && !this.sectionInfo.isSectionListEmpty();
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
      const validateHeaderForm = this.validateForm('header');
      const validateCostRemarkForm = this.validateForm('costRemark');
      // 全部校验通过后
      Promise.all([validateHeaderForm, validateCostRemarkForm]).then(
        ([headerValues, costRemarkValues]) => {
          const values = {
            ...headerValues,
            ...costRemarkValues,
          };
          const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
          const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
          const submitted = (params = {}, callback = () => {}) => {
            const checkPriceDTOLineList = this.getCheckPriceDTOLineList();
            const customizeUnitCode = this.getCurrentCustomeCode(true);
            const currentSection = this.sectionInfo.getCurrentSection() || [];
            const checkedSection = this.sectionInfo.getCheckedSectionList() || [];
            const chooseCurrentFlag = checkedSection.some(
              (item) => String(item.sourceHeaderId) === String(currentSection.sourceHeaderId)
            );
            const allProjectLineSectionList =
              this.sectionInfo.getAllSectionList && this.sectionInfo.getAllSectionList();

            const commonData =
              chooseCurrentFlag || isEmpty(checkedSection)
                ? Object.assign(
                    {},
                    {
                      ...values,
                      objectVersionNumber: header.objectVersionNumber,
                      rfxHeaderId: header.rfxHeaderId,
                      organizationId,
                      checkPriceDTOLineList,
                      customizeUnitCode,
                      ...params,
                      projectLineSectionList: this.sectionInfo.getCheckedSectionList(),
                      allProjectLineSectionList,
                    },
                    this.getStateParams()
                  )
                : {
                    rfxHeaderId: header.rfxHeaderId,
                    organizationId,
                    projectLineSectionList: this.sectionInfo.getCheckedSectionList(),
                  };
            const DoSubmit = (operation = {}) => {
              dispatch({
                type:
                  checkedSection.length > 0
                    ? 'inquiryHall/checkPriceSectionSubmit'
                    : 'inquiryHall/submitCheckPrice',
                payload: {
                  ...commonData,
                  ...operation,
                },
              }).then((res) => {
                callback();
                this.handleAfterSubmit(res);
              });
            };

            let validateResult = [];
            dispatch({
              type:
                checkedSection.length > 0
                  ? 'inquiryHall/checkPriceSectionSubmitValidate'
                  : 'inquiryHall/validateBeforeSubmit',
              payload: {
                ...commonData,
              },
            }).then((res) => {
              if (!res) {
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
                        Modal.confirm(
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
                const confirmSubmit = (props) => {
                  if (isEmpty(validateResult)) {
                    DoSubmit(props);
                    return;
                  }

                  const currentObj = validateResult[0];
                  if (currentObj.type === 'ERROR') {
                    Modal.error({
                      content: currentObj.message,
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
                    Modal.confirm(
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
                          validateResult.splice(0, 1);
                          confirmSubmit(supplierDynamicParams);
                        },
                        onCancel: () => this.resetPolicyDefault(),
                      },
                      () => this.resetPolicyDefault()
                    );
                  } else {
                    // 统一处理只提交操作的
                    Modal.confirm({
                      content: currentObj.message,
                      onOk: () => {
                        validateResult.splice(0, 1);
                        confirmSubmit();
                      },
                      onCancel: () => {},
                    });
                  }
                };
                confirmSubmit();
              }
            });
          };

          if (activeKey === 'itemLine') {
            // 先校验物料行选择策略
            // eslint-disable-next-line no-unused-expressions
            this.itemLineList?.props?.form?.validateFields((error) => {
              if (!isEmpty(error)) {
                return;
              }
              if (isEmpty(itemQuoteLine) || !isEmpty(itemQuoteLineParams)) {
                const checkPriceDTOLineList = this.getCheckPriceDTOLineList();
                const newList = checkPriceDTOLineList.filter(
                  (item) =>
                    item.selectionStrategy === 'RECOMMENDATION' ||
                    item.selectionStrategy === 'CANCEL'
                );

                const submitItem = () => {
                  submitted({}, () => {
                    this.setState({ newList });
                  });
                };

                submitItem();
              } else {
                const itemLineData = [
                  intl.get('ssrc.inquiryHall.model.inquiryHall.itemDetails').d('物料明细页签的'),
                ];
                this.notificationTrans(itemLineData, itemQuoteLine, retrieveData);
              }
            });
          } else if (activeKey === 'supplierLine') {
            if (
              isEmpty(supplierQuoteLine) ||
              !isEmpty(supplierQuoteLineParams) ||
              (!isEmpty(supplierQuoteLine) && isEmpty(supplierQuoteLineParams))
            ) {
              const submitSupplier = () => {
                submitted({
                  projectName: 'STANDARD',
                  onlyAllowAllWinBids,
                });
              };

              submitSupplier();
              this.resetPolicyDefault();
            } else {
              const supplierData = [
                intl.get('ssrc.inquiryHall.model.inquiryHall.supplierLists').d('供应商列表页签的'),
              ];
              this.notificationTrans(supplierData, supplierQuoteLine, retrieveData);
            }
          } else {
            const quoteLineParams = this.getCurrentEditTableData(quoteLine, checkWay);
            if (isEmpty(quoteLine) || !isEmpty(quoteLineParams)) {
              submitted({});
            }
          }
        }
      );
    }
  }

  /**
   * 核价提交通用处理程序
   * */
  handleAfterSubmit(res = {}) {
    const { dispatch } = this.props;
    let pathname;

    switch (res) {
      case 0: // 不可以创建/补充
        this.setState({
          createItemFlag: res,
          pricingModalVisible: false,
        });
        notification.success();
        pathname = `${this.activeTabKey}/list`;
        dispatch(
          routerRedux.push({
            pathname,
          })
        );
        break;
      case 1: // 可创建物料编码
        this.setState({
          createItemFlag: res,
          pricingModalVisible: true,
        });
        break;
      case 2: // 可补充物料编码
        this.setState({
          createItemFlag: res,
          pricingModalVisible: true,
        });
        break;
      case 3: // 必须补充物料编码
        this.setState({
          createItemFlag: res,
          pricingModalVisible: true,
        });
        break;
      default:
        this.setState({
          createItemFlag: res,
          pricingModalVisible: false,
        });
        break;
    }
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
      inquiryHall: {
        header = {},
        code: { selectedPolicy },
      },
    } = this.props;
    const { selectionStrategy = null } = header;
    // const { currentSelectionPolicy } = this.state;
    const defaultValue = selectionStrategy === 'RECOMMENDATION' ? 'RELEASE' : selectionStrategy;
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
                      {item.meaning}
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
  linkRiskScan(item = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/linkRiskScan',
      payload: {
        enterpriseId: item.supplierCompanyId,
        scanCode: 'rfx_supplier',
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      if (!urlReg.test(res)) {
        if (res?.failed) {
          notification.warning({
            message: res?.message || null,
          });
        }
        return;
      }

      window.open(res);
    });

    // if (item.isMonitor === 0 && item.isShowScan === 1) {
    //   Modal.confirm({
    //     title: intl
    //       .get(`ssrc.inquiryHall.view.message.validate.tureRiskScan`)
    //       .d('该企业未加入监控，扫描将扣除扫描额度，确认扫描吗?'),
    //     onOk: () => {
    //       dispatch({
    //         type: 'inquiryHall/linkRiskScan',
    //         payload: {
    //           enterpriseId: item.supplierCompanyId,
    //           scanCode: 'rfx_supplier',
    //         },
    //       }).then((res) => {
    //         if (!res || !urlReg.test(res)) {
    //           notification.error();
    //           return;
    //         }
    //         window.open(res);
    //       });
    //     },
    //   });
    // } else {
    //   dispatch({
    //     type: 'inquiryHall/linkRiskScan',
    //     payload: {
    //       enterpriseId: item.supplierCompanyId,
    //       scanCode: 'rfx_supplier',
    //     },
    //   }).then((res) => {
    //     if (!res || !urlReg.test(res)) {
    //       notification.error();
    //       return;
    //     }
    //     window.open(res);
    //   });
    // }
  }

  renderHeaderTitle(header) {
    return (
      <h3>
        {header.rfxNum}-{header.rfxTitle}
        <Tag style={{ marginLeft: '15px', width: '65px' }}>
          <span style={{ marginLeft: '-17px' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：{header.roundNumber}
          </span>
        </Tag>
      </h3>
    );
  }

  /**
   *切换tab页
   */
  @Bind()
  changeTabs(key) {
    const {
      dispatch,
      inquiryHall: {
        itemLineChange = false,
        supplierLineChange = false,
        allLineChange = false,
        itemQuoteLine = [],
        supplierQuoteLine = [],
        quoteLine = [],
        itemLine = [],
        supplierLine = [],
      },
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
          if (!quoteLine.length) {
            this.fetchQuoteLine();
          }
        }
      };
      const confirm = (changeFlag) => {
        Modal.confirm({
          title: intl
            .get('hzero.common.message.confirm.giveUpTip')
            .d('你有修改未保存，是否确认离开？'),
          onOk: () => {
            // 设置activeKey，重置itemLineChange，form,表格得$form
            this.setState({ activeKey: key });
            if (activeKey === 'itemLine') {
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              itemQuoteLine.forEach((item) => item.$form.resetFields());
            } else if (activeKey === 'supplierLine') {
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              supplierQuoteLine.forEach((item) => item.$form.resetFields());
            } else if (activeKey === 'quoteLine') {
              // eslint-disable-next-line no-unused-expressions
              this.quoteLine?.props?.form?.resetFields();
              quoteLine.forEach((item) => item.$form.resetFields());
            }
            dispatch({
              type: 'inquiryHall/updateState',
              payload: {
                [changeFlag]: false,
              },
            });
          },
        });
      };
      // itemLine标签页有改动
      if (activeKey === 'itemLine') {
        search();
        if (itemLineChange) {
          confirm('itemLineChange');
        } else {
          this.setState({ activeKey: key });
        }
      }
      // supplierLine标签页有改动
      if (activeKey === 'supplierLine') {
        search();
        if (supplierLineChange) {
          confirm('supplierLineChange');
        } else {
          this.setState({ activeKey: key });
        }
      }
      // quoteLine标签页有改动
      if (activeKey === 'quoteLine') {
        search();
        if (allLineChange) {
          confirm('allLineChange');
        } else {
          this.setState({ activeKey: key });
        }
      }
      if (activeKey === 'attachmentList') {
        this.setState({ activeKey: key });
      }
    }
  }

  /**
   * 再次询价
   */
  @Bind()
  inquiryAgain() {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { header },
    } = this.props;
    const { routerParams } = this.state;
    const { current } = routerParams;
    const rfxHeaderId = params.rfxId;
    Modal.confirm({
      title: intl.get(`ssrc.inquiryHall.view.message.confirm.inquiryAgain`).d('确认是否再次询价'),
      onOk: () => {
        dispatch({
          type: 'inquiryHall/inquiryAgain',
          payload: {
            organizationId,
            rfxHeaderId,
          },
        }).then((res) => {
          if (res) {
            Modal.confirm({
              title: (
                <span>
                  <span>{intl.get(`ssrc.inquiryHall.view.message.confirm.RFQ`).d('询价单【')}</span>
                  <span>
                    {header.rfxNum}-{header.rfxTitle}
                  </span>
                  <span>
                    {intl
                      .get(`ssrc.inquiryHall.view.message.confirm.WaitingMaintenance`)
                      .d('】状态已变为再次询价，请等待创建人维护并发布询价单')}
                  </span>
                </span>
              ),
              onOk: () => {
                let pathname;
                if (current === '/ssrc/new-bid-hall') {
                  pathname = `/ssrc/new-inquiry-hall/bid-update/${rfxHeaderId}`;
                } else {
                  pathname = `${this.activeTabKey}/rfx-update/${rfxHeaderId}`;
                }
                dispatch(
                  routerRedux.push({
                    pathname,
                    search: querystring.stringify({
                      current,
                    }),
                  })
                );
              },
              onCancel: () => {},
            });
          }
        });
      },
      onCancel: () => {},
    });
  }

  /**
   * 获取供应商关系图
   * @memberof fetchSupplierDiagram
   */
  @Bind()
  async supplierRelationMap() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { header = {}, supplierLine = [] },
    } = this.props;

    if (!Array.isArray(supplierLine) || !supplierLine.length) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.notOpenService`)
          .d('您尚未开通企业风控服务，请前往应用商店开通'),
      });
      return;
    }

    const companyNames = [];
    supplierLine.forEach((item) => {
      if (!item.supplierCompanyName) {
        return;
      }
      companyNames.push(item.supplierCompanyName);
    });

    dispatch({
      type: 'inquiryHall/supplierRelationMap',
      payload: {
        organizationId,
        companyName: header.companyName,
        companyNames: companyNames.join(),
      },
    }).then((res) => {
      if (!res || !urlReg.test(res)) {
        notification.warning({
          message: JSON.parse(res).message,
        });
        return;
      }
      window.open(res);
    });
  }

  @Bind()
  handleAfterOpenModal(checkAttachmentUuid) {
    this.setState({
      checkAttachmentUuid,
    });
  }

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
  handlehideModal() {
    this.setState({ pricingModalVisible: false });
  }

  /**
   * 跳转到多轮报价页面
   * */
  @Bind()
  directRoundQuotation() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    const { routerParams } = this.state;

    const { current, projectLineSectionId } = routerParams;
    const sourceHeaderId = params.rfxId;
    const pathname = `${this.activeTabKey}/round-quotation/${sourceHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify({
          current,
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
  //   } = this.props;

  //   // if (this.sectionInfo.getCheckedSectionList && this.sectionInfo.getCheckedSectionList().length) {
  //   // dispatch({
  //   //   type: 'inquiryHall/sectionBeginRoundQuotation',
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
  //     type: 'inquiryHall/beginRoundQuotation',
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
    } = this.props;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: 'inquiryHall/fetchIPCoincidenceRate',
      payload: {
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE`,
      },
    });
  }

  /**
   * IP重合率弹框- 关闭
   */
  @Bind()
  confirmIpCoincidenceRate() {
    this.setState({
      ipCoincidenceRateVisible: false,
    });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        ipCoincidenceRate: [],
      },
    });
  }

  /**
   * 跳转到对应的议价界面
   */
  @Bind()
  handleBargainOnline(data = {}) {
    if (isEmpty(data)) {
      return;
    }

    const { bargainOfflineFlag = 0, bargainStatus = null } = data;
    if (
      bargainStatus === 'INITIATE' ||
      bargainStatus === 'BARGAIN_ONLINE' ||
      bargainStatus === 'BARGAIN_OFFLINE'
    ) {
      if (bargainOfflineFlag) {
        this.setState({ onlineBargainVisible: true });
      } else {
        this.openBargainModal();
      }
    } else {
      this.openBargainModal();
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
  @Bind()
  openBargainModal() {
    const {
      dispatch,
      organizationId,
      inquiryHall: { header = {} },
      match: { params },
      history = {},
    } = this.props;
    const { rfxId } = params;
    const { bargainNewFlag, } = this.state;
    if (isEmpty(header)) {
      return;
    }

    const {
      subjectMatterRule,
      projectLineSectionId,
      bargainStatus,
      bargainOfflineFlag = false,
    } = header;

    const getFieldValue = this.bargainRuleModalRef
      ? this.bargainRuleModalRef?.props?.form?.getFieldValue
      : () => {};

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
      ...sectionSearch,
    });

    if (
      // bargainStatus !== 'BARGAIN_OFFLINE' &&
      // bargainStatus !== 'BARGAIN_ONLINE' &&
      bargainStatus !== 'BARGAINING_ONLINE' &&
      bargainStatus !== 'BARGAINING_OFFLINE'
    ) {
      dispatch({
        type: 'inquiryHall/fetchOpenBargain',
        payload: {
          organizationId,
          rfxHeaderId: rfxId,
          bargainMethod: bargainOfflineFlag === 0 ? 'ONLINE' : getFieldValue('sourceType'),
        },
      }).then((res) => {
        if (res) {
          history.push({
            pathname,
            search,
          });
        }
      });
    } else {
      history.push({
        pathname,
        search,
      });
    }
  }

  /**
   * 打开议价方式模态框
   */
  @Bind()
  bargainRuleModal(sourceType) {
    const { onlineBargainVisible } = this.state;
    const modalProps = {
      sourceType,
      visible: onlineBargainVisible,
      onRef: this.handleGeneratorRef,
      hideBargainModal: this.hideBargainModal,
      openBargainModal: this.openBargainModal,
    };
    return <BargainRuleModal {...modalProps} />;
  }

  // 比价助手modal
  renderPriceComparisonModal = (priceComparisonProps = {}) => {
    const {
      inquiryHall: { header = {} },
    } = this.props;
    const { priceComparisonModalVisible = false } = this.state;

    const { sourceCategory, diyLadderQuotationFlag } = header || {};
    return priceComparisonModalVisible ? (
      <PriceComparison
        {...priceComparisonProps}
        sourceCategory={sourceCategory}
        diyLadderQuotationFlag={diyLadderQuotationFlag}
      />
    ) : null;
  };

  @Bind()
  handleRenderPriceCompare(priceComparisonProps) {
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
   *导出
   *
   */
  exportCheckPriceData = () => {
    const {
      organizationId,
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'inquiryHall/exportCheckPriceData',
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
      match: { params },
    } = this.props;

    dispatch({
      type: 'inquiryHall/querySupplierExchangeEdit',
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
  @Bind()
  exchangeEdit(date = {}) {
    this.querySupplierExchangeEdit(date);
    this.setState({
      exchangeEditModalVisible: true,
    });
  }

  // 预览分权
  previewScoreManager = () => {
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
  };

  /**
   * 汇率编辑 取消
   *
   * @memberof CheckPrice
   */
  @Bind()
  cancelExchangeEdit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/updateState',
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
      inquiryHall: { exchangeEditSupplierList = [] },
    } = this.props;

    const newParams = getEditTableData(exchangeEditSupplierList, []);

    if (isEmpty(newParams)) {
      return;
    }

    dispatch({
      type: 'inquiryHall/saveExchangeEdit',
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
      this.fetchInquiryHallCheckPrice();
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
      inquiryHall: { exchangeEditSupplierList = [] },
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
   * 保存 - 汇率
   * 要更新其他tab页的内容
   */
  @Bind()
  updateTabData() {
    const {
      inquiryHall: { itemQuoteLine = [], supplierQuoteLine = [] },
      dispatch,
    } = this.props;
    const { updateState } = this.state;
    let itemQuoteLineParams = [];
    itemQuoteLineParams =
      itemQuoteLine && getEditTableData(itemQuoteLine, ['quotationLineId'], { force: true });
    let supplierQuoteLineParams = [];
    supplierQuoteLineParams =
      supplierQuoteLine &&
      getEditTableData(supplierQuoteLine, ['quotationLineId'], { force: true });

    if (isEmpty(itemQuoteLine) || !isEmpty(itemQuoteLineParams)) {
      // 先清空物料行数据，再查询
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          itemQuoteLine: [],
          itemQuoteLinePagination: {},
          itemLineChange: false,
        },
      });
      // 物料行获取id，并且去重
      const itemQuoteLineIds = itemQuoteLineParams.map((item) => item.rfxLineItemId);
      const itemQuoteLineId = [...new Set(itemQuoteLineIds)];
      // id 去重，根据行rfxLineItemId遍历查询物料行数据
      this.setState({ updateState: true }, () => {
        this.fetchItemQuoteLineList(itemQuoteLineId, updateState);
      });
      // 刷新供应商行tab页面
    }

    if (!isEmpty(supplierQuoteLine)) {
      // 先清空，再通过rfxLineSupplierId遍历查询
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          supplierQuoteLine: [],
          supplierQuoteLinePagination: {},
          supplierLineChange: false,
        },
      });
      const supplierQuoteLineIds = supplierQuoteLineParams.map((item) => item.rfxLineSupplierId);
      const supplierQuoteLineId = [...new Set(supplierQuoteLineIds)];
      // id 去重
      this.setState({ updateState: true }, () => {
        this.fetchSupplierQuoteLineList(supplierQuoteLineId, updateState);
      });
    }

    // if (isEmpty(supplierQuoteLine) || !isEmpty(supplierQuoteLineParams)) {
    //   dispatch({
    //     type: 'inquiryHall/updateState',
    //     payload: {
    //       supplierQuoteLine: [],
    //       supplierQuoteLinePagination: {},
    //       supplierLineChange: false,
    //     },
    //   });
    //   this.fetchInquiryHallCheckPrice();
    //   const supplierQuoteLineIds = supplierQuoteLineParams.map(
    //     item => item.rfxLineSupplierId
    //   );
    //   const supplierQuoteLineId = [...new Set(supplierQuoteLineIds)];
    //   // id 去重
    //   this.setState({ updateState: true }, () => {
    //     this.fetchSupplierQuoteLineList(supplierQuoteLineId, updateState);
    //   });
    //   if (!isEmpty(itemQuoteLine)) {
    //     // 先清空数据，再查询
    //     dispatch({
    //       type: 'inquiryHall/updateState',
    //       payload: {
    //         itemQuoteLine: [],
    //         itemQuoteLinePagination: {},
    //         itemLineChange: false,
    //       },
    //     });
    //     const itemQuoteLineIds = itemQuoteLineParams.map(item => item.rfxLineItemId);
    //     const itemQuoteLineId = [...new Set(itemQuoteLineIds)];
    //     // id 去重
    //     this.setState({ updateState: true }, () => {
    //       this.fetchItemQuoteLineList(itemQuoteLineId, updateState);
    //     });
    //   }
    // }

    // notification.success();
    // dispatch({
    //   type: 'inquiryHall/updateState',
    //   payload: { allLineChange: false },
    // });
    // this.fetchInquiryHallCheckPrice();
    // if (!isEmpty(itemQuoteLine)) {
    //   // 先清空数据，再查询
    //   dispatch({
    //     type: 'inquiryHall/updateState',
    //     payload: {
    //       itemQuoteLine: [],
    //       itemQuoteLinePagination: {},
    //       itemLineChange: false,
    //     },
    //   });
    //   const itemQuoteLineIds = itemQuoteLineParams.map(item => item.rfxLineItemId);
    //   const itemQuoteLineId = [...new Set(itemQuoteLineIds)];
    //   // id 去重
    //   this.setState({ updateState: true }, () => {
    //     this.fetchItemQuoteLineList(itemQuoteLineId, updateState);
    //   });
    // }
    // if (!isEmpty(supplierQuoteLine)) {
    //   dispatch({
    //     type: 'inquiryHall/updateState',
    //     payload: {
    //       supplierQuoteLine: [],
    //       supplierQuoteLinePagination: {},
    //       supplierLineChange: false,
    //     },
    //   });
    //   const supplierQuoteLineIds = supplierQuoteLineParams.map(
    //     item => item.rfxLineSupplierId
    //   );
    //   const supplierQuoteLineId = [...new Set(supplierQuoteLineIds)];
    //   // id 去重
    //   this.setState({ updateState: true }, () => {
    //     this.fetchSupplierQuoteLineList(supplierQuoteLineId, updateState);
    //   });
    // }
  }

  @Bind()
  allottedQuantityChange(e, record) {
    const flagObj = { ...this.state.flagObj };
    const popConfirmFlagList = [];
    flagObj[`flag${record.rfxLineItemId}${record.quotationLineId}`] =
      Number(record.validQuotationQuantity) < Number(e);
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
      path = `/ssrc/offline-result-entry/detail/${match.params.rfxId}`;
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
  @debounce(500)
  @Bind()
  changeCheckWayDetail(value) {
    const {
      dispatch,
      organizationId,
      userId,
      inquiryHall: { rfxDetailLayouts = {} },
    } = this.props;

    dispatch({
      type: 'inquiryHall/changeRfxDetailLayout',
      payload: {
        ...rfxDetailLayouts,
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'checkPriceWay',
        configKey: 'checkPriceWay',
        configValue: value,
      },
    }).then((res = {}) => {
      if (!res) {
        return;
      }
      this.setCheckWay(res);
    });
  }

  // 批量维护
  @Bind()
  startBatchMaintainItemLine() {
    this.setState({
      batchMaintainQuoteLineVisible: true,
    });
  }

  // 批量维护保存
  @Bind()
  saveBatchMaintainItemLine() {
    const {
      organizationId,
      dispatch,
      match: { params = {} },
    } = this.props;
    const {
      itemLineTableSelectedKeys = [],
      activeKey,
      supplierLineTableSelectedKeys = [],
      allQuotationLineTableSelectedKeys = [],
    } = this.state;
    const batchUpdate = () => {
      return dispatch({
        type: 'inquiryHall/batchMaintainItemQuotationLine',
        payload: {
          organizationId,
          rfxQuotationLine: data,
          quotationLineIds: ids,
          rfxHeaderId: params.rfxId,
          sourceFunctionCode: 'CHECK_PRICE',
          customizeUnitCode: 'SSRC.INQUIRY_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM',
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'inquiryHall/updateState',
            payload: {
              itemQuoteLine: [],
              itemQuoteLinePagination: {},
              supplierQuoteLine: [],
              supplierQuoteLinePagination: {},
              quoteLine: [],
              quoteLinePagination: {},
              itemLine: [],
              supplierLine: [],
            },
          });
          if (this.itemLineList) {
            this.itemLineList.setState({
              expand: {},
              isShow: {},
              activePanel: [],
            });
          }
          if (this.supplierLineList) {
            this.supplierLineList.setState({
              expand: {},
              isShow: {},
              activePanel: [],
            });
          }
          return res;
        }
      });
    };

    const itemLineForm = this.BatchMaintainRef.props.form;
    const data = itemLineForm.getFieldsValue();
    let ids = null;
    let callBack = null;
    if (activeKey === 'itemLine') {
      ids = itemLineTableSelectedKeys;
      callBack = () => {
        this.changeItemLineTableSelection();
      };
      batchUpdate().then((res) => {
        if (!res) {
          return;
        }
        this.fetchItemLine();
        callBack();
      });
    } else if (activeKey === 'supplierLine') {
      ids = supplierLineTableSelectedKeys;
      callBack = () => {
        this.changeSupplierLineTableSelection();
      };
      batchUpdate().then((res) => {
        if (!res) {
          return;
        }
        this.fetchSupplierLine();
        callBack();
      });
    } else {
      ids = allQuotationLineTableSelectedKeys;
      callBack = () => {
        this.changeAllQuotationLineTableSelection();
      };
      batchUpdate().then((res) => {
        if (!res) {
          return;
        }
        this.fetchQuoteLine();
        callBack();
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
    } = this.props;
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
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.tab.checkPriceReslutImport`).d('核价结果导入'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: () => {
        this.refreshActiveData();
      },
    });
  }

  /**
   * 保存完以后的通用处理
   * @param {*} fetchHeaderFlag 是否需要重新查询头
   * @param {*} page page,只有改变分页的时候传递
   */
  @Bind()
  refreshActiveData(fetchHeaderFlag, page) {
    const {
      inquiryHall: {
        itemLinePagination = {},
        supplierLinePagination = {},
        itemQuoteLine = [],
        supplierQuoteLine = [],
        quoteLinePagination = {},
      },
    } = this.props;
    const {
      activeKey,
      updateState,
      checkWay,
      routerParams: { projectLineSectionId },
    } = this.state;
    const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
    const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
    if (this.sectionInfo.refreshSectionList && projectLineSectionId) {
      this.sectionInfo.refreshSectionList();
    }
    if (activeKey === 'itemLine') {
      this.clearAllTable();
      // 物料行获取id，并且去重
      const itemQuoteLineIds = itemQuoteLineParams.map((item) => item.rfxLineItemId);
      const itemQuoteLineId = [...new Set(itemQuoteLineIds)];
      this.fetchItemLine(page || itemLinePagination);
      // id 去重，根据行rfxLineItemId遍历查询物料行数据
      this.setState({ updateState: true }, () => {
        this.fetchItemQuoteLineList(itemQuoteLineId, updateState);
      });
    } else if (activeKey === 'supplierLine') {
      this.clearAllTable();
      this.fetchSupplierLine(page || supplierLinePagination);
      const supplierQuoteLineIds = supplierQuoteLineParams.map((item) => item.rfxLineSupplierId);
      const supplierQuoteLineId = [...new Set(supplierQuoteLineIds)];
      // id 去重
      this.setState({ updateState: true }, () => {
        this.fetchSupplierQuoteLineList(supplierQuoteLineId, updateState);
      });
    } else {
      this.clearAllTable();
      this.fetchQuoteLine(page || quoteLinePagination);
    }
    if (fetchHeaderFlag) {
      this.fetchInquiryHallCheckPrice();
    }
  }

  renderPricingModal() {
    const {
      history,
      inquiryHall: { header = {} },
      match: { params },
      customizeTable,
    } = this.props;
    const {
      checkAttachmentUuid,
      pricingModalVisible,
      newList,
      createItemFlag = null,
      currentSelectionPolicy,
    } = this.state;
    const supplierDynamicParams = {
      selectionStrategy: currentSelectionPolicy,
    };
    // 核价中心弹窗model props
    const PricingCenterModalProp = {
      customizeTable,
      headerValue: this.headerFormRef && this.headerFormRef.props.form.getFieldsValue(),
      header,
      createItemFlag,
      checkAttachmentUuid,
      newList,
      history,
      rfxHeaderId: params.rfxId,
      visible: pricingModalVisible,
      sectionInfo: this.sectionInfo,
      onCancel: this.handlehideModal,
      itemLineListNode: this.itemLineList,
      activeKey: this.state.activeKey,
      supplierLineListNode: this.supplierLineList,
      supplierDynamicParams,
      resetPolicyDefault: this.resetPolicyDefault,
      title:
        createItemFlag === 1
          ? intl.get('ssrc.inquiryHall.view.modalTitle.createMaterial').d('创建物料')
          : intl.get('ssrc.inquiryHall.view.modalTitle.updateMaterial').d('补充物料'),
    };
    return pricingModalVisible && <PricingModal {...PricingCenterModalProp} />;
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

  // @Bind()
  // validateCheckPrice(){
  //   const {
  //     form,
  //     inquiryHall: { header = {}, itemQuoteLine = [], supplierQuoteLine = [], quoteLine = [] },
  //     dispatch,
  //     organizationId,
  //   } = this.props;
  //   const { activeKey = undefined, checkAttachmentUuid, checkWay } = this.state;
  //   return new Promise(resolve => {
  //     form.validateFields((err, values) => {
  //       if(!err){
  //         const itemQuoteLineParams = this.getCurrentEditTableData(itemQuoteLine, checkWay);
  //         const supplierQuoteLineParams = this.getCurrentEditTableData(supplierQuoteLine, checkWay);
  //         const quoteLineParams = this.getCurrentEditTableData(quoteLine, checkWay);
  //       }else{
  //         resolve(false)
  //       }
  //     })
  //   });
  // }

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
   * section panel ref
   */
  @Bind()
  handleSectionPanelRef(ref) {
    this.sectionInfo = ref;
  }

  @Bind()
  openModalExpertScoring(header) {
    const { dispatch } = this.props;
    const { expertScoreTypeMeaning, openBidOrderMeaning, rfxHeaderId } = header;
    const modalProps = {
      dispatch,
      expertScoreTypeMeaning,
      openBidOrderMeaning,
      rfxHeaderId,
    };
    c7nModal.open({
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.expertEvaluation').d('专家评分'),
      drawer: true,
      style: { width: '742px' },
      children: <ExpertScoreModal {...modalProps} />,
    });
  }

  /**
   * 判断选择标段是否显示回调方法
   */
  @Bind()
  judgeChooseSectionButton(showFlag) {
    this.setState({
      chooseSectionBtnShowFlag: showFlag,
    });
  }

  @Bind()
  getButtons() {
    const {
      allLoading,
      organizationId,
      beginRoundQuotationLoading,
      match,
      inquiryHall: { header = {} },
      match: { params },
      history,
    } = this.props;

    const {
      item,
      chooseSection,
      checkAttachmentUuid = null,
      chooseSectionBtnShowFlag,
      processAttachmentNewUIFlag,
      attachmentNewUILoading,
      biddingHallFlag,
    } = this.state;
    const { onlyAllowAllWinBids = 0, newQuotationFlag, sourceCategory, biddingFlag } = header || {};

    // price clarification button
    const PriceButtonProps = {
      match,
      history,
      sourceFrom: 'RFX',
      sourceHeaderId: params.rfxId,
      organizationId,
      buttonPermission: false,
      getRouterParams: this.getRouterParams,
    };

    // 比价助手
    const priceComparisonProps = {
      item,
      rfxId: params.rfxId,
      history,
    };
    // 竞价大厅-竞价单标识
    const newBiddingFlag = biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    const buttons = [
      {
        name: 'dropdownBtnListNew',
        group: true,
        // 按钮组显示内容
        child: (
          <Button disabled={chooseSection}>
            <Icon type="ellipsis" />
            {intl.get('hzero.common.basicLayout.viewMore').d('查看更多')}
          </Button>
        ),
        children: [
          // 按钮组下拉列表内容
          {
            name: 'batchImport',
            child: intl.get(`ssrc.common.button.batchImport`).d('批量导入'),
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
          !newQuotationFlag
            ? {
                name: 'downloadAttachment',
                child: intl.get('hzero.common.button.open').d('过程附件下载'),
                btnProps: {
                  loading: attachmentNewUILoading,
                  icon: 'get_app',
                  onClick: processAttachmentNewUIFlag
                    ? openC7nProcessAttachmentModal({ rfxHeaderId: params.rfxId })
                    : this.openProcessAttachmentModal,
                },
              }
            : null,
          {
            name: 'returnToPretrial',
            child: intl
              .get(`ssrc.inquiryHall.view.message.button.returnToPretrial`)
              .d('退回至初审'),
            btnProps: {
              onClick: this.returnToPretrial,
              className: !header.pretrialFlag ? styles.disabledElementA : '',
            },
          },
          {
            name: 'inquiryAgain',
            child: intl.get(`ssrc.inquiryHall.view.message.button.inquiryAgain`).d('再次询价'),
            hidden: newBiddingFlag,
            btnProps: {
              type: 'default',
              onClick: this.inquiryAgain,
            },
          },
          {
            name: 'operationRecord',
            child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
            btnProps: {
              onClick: this.playView,
            },
          },
          header.multiCurrencyFlag && header.expertScoreType === 'NONE'
            ? {
                name: 'exchangeEdit',
                child: intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑'),
                btnProps: {
                  onClick: this.exchangeEdit,
                },
              }
            : null,
        ].filter(Boolean),
      },
      {
        name: 'priceClear',
        btnComp: PriceClarificationButtons,
        btnProps: {
          ...PriceButtonProps,
        },
      },
      {
        name: 'uploadAttachment',
        child: (
          <Upload
            filePreview
            fileSize={FIlESIZE}
            btnText={intl.get(`hzero.common.upload.text`).d('上传附件')}
            bucketDirectory="ssrc-rfx-quotationline" // 桶名
            bucketName="private-bucket"
            attachmentUUID={checkAttachmentUuid ?? null}
            tenantId={organizationId}
            afterOpenUploadModal={this.handleAfterOpenModal}
          />
        ),
        btnProps: {
          type: 'default',
          className: styles.uploadAttachment,
        },
      },
      {
        name: 'viewExpertScoring',
        btnProps: { onClick: () => this.openModalExpertScoring(header) },
        child: intl.get('ssrc.inquiryHall.view.button.viewExpertScoring').d('查看专家评分'),
      },
      {
        name: 'previewScoreManager',
        child: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
        btnProps: {
          onClick: this.previewScoreManager,
        },
      },
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
          onClick: () => this.handleRenderPriceCompare(priceComparisonProps),
          disabled: chooseSection,
        },
      },
      header &&
        (header.bargainRule === 'CHECK' || header.bargainRule === 'ALL') && {
          name: 'bargainOnline',
          btnComp: PopoverButton,
          child: (
            <>
              <Iconfont type="main-reinquiry" style={{ marginRight: '8px' }} />
              {intl.get('ssrc.bidHall.view.button.negotiatedPrice').d('议价')}
            </>
          ),
          btnProps: {
            onClick: () => this.handleBargainOnline(header),
            disabled:
              (header.roundHeaderStatus === 'ROUND_CHECKING' &&
                new Date(header.roundQuotationEndDate) > new Date()) ||
              chooseSection,
            showPopover:
              header.roundHeaderStatus === 'ROUND_CHECKING' &&
              new Date(header.roundQuotationEndDate) > new Date(),
            content: intl
              .get('ssrc.inquiryHall.view.message.bargainButtonDisabledTips')
              .d('当前正在进行多轮报价，不可进行议价'),
          },
        },
      header.roundQuotationRule === 'CHECK' || header.roundQuotationRule === 'AUTO_CHECK'
        ? {
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
              disabled:
                header.roundHeaderStatus === 'CLOSED' ||
                header.bargainClosedFlag === 0 ||
                chooseSection,
            },
          }
        : null,
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          type: 'default',
          loading: allLoading,
          onClick: () => this.handleBeSave(true),
          disabled: chooseSection,
        },
      },
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnComp: PopoverButton,
        btnProps: {
          icon: 'check',
          type: 'primary',
          onClick: () => this.handleBeSave(false),
          loading: allLoading,
          disabled:
            header.roundHeaderStatus === 'ROUND_CHECKING' &&
            new Date(header.roundQuotationEndDate) > new Date(),
          showPopover:
            header.roundHeaderStatus === 'ROUND_CHECKING' &&
            new Date(header.roundQuotationEndDate) > new Date(),
          content: intl
            .get('ssrc.inquiryHall.view.message.submitButtonDisabledTips')
            .d('当前正在进行多轮报价，不可提交核价'),
        },
      },
    ]
      .filter(Boolean)
      .reverse();
    return buttons;
  }

  getHeader() {
    const { customizeBtnGroup = () => {} } = this.props;
    const buttons = this.getButtons();
    return (
      <Header
        title={intl.get(`ssrc.inquiryHall.view.message.title.checkPrice`).d('核价')}
        backPath={this.toBack()}
      >
        {customizeBtnGroup(
          { code: 'SSRC.INQUIRY_HALL_CHECK_PRICE.HEAD_BUTTONS', pro: true },
          <DynamicButtons trigger="click" buttons={buttons} />
        )}
      </Header>
    );
  }

  render() {
    const {
      organizationId,
      fetchHeaderLoading,
      fetchItemLineLoading,
      changeCheckWayLoading,
      fetchSupplierLineLoading,
      fetchQuoteLineLoading,
      fetchLadderLevelTableLoading,
      fetchIPCoincidenceRateLoading,
      querySupplierExchangeEditLoading,
      saveExchangeEditLoading,
      batchMaintainQuotateLineLoading,
      fetchQueryPriceInfoLoading,
      dispatch,
      match,
      customizeTable,
      customizeForm,
      custLoading,
      customizeCollapse,
      customizeTabPane,
      // history,
      inquiryHall: {
        header = {},
        itemLine = [],
        supplierLine = [],
        quoteLine = [],
        quotaLadderLevelData = [],
        quoteLinePagination = {},
        code: { selectedPolicy, sourceType, quoteLineSelectionStrategy },
        operationPagination,
        operationData,
        ipCoincidenceRate = [],
        settings,
        exchangeEditSupplierList = [],
      },
      match: { params },
    } = this.props;
    const {
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      operationRecordModalVisible,
      returnToPretrialModalVisible,
      // priceComparisonModalVisible,
      // item = {},
      viewPriceChartsVisible,
      priceDataSource,
      supplierNameList,
      chartsLoading,
      id,
      bucketDirectory,
      viewOnly,
      // popConfirmFlag,
      collapseKeys = [],
      ipCoincidenceRateVisible,
      onlineBargainVisible,
      exchangeEditModalVisible = false,
      exchangeEditContentModalVisible = false,
      currentPaneActiveSelected = {},
      itemLineTableSelectedRows = [], // 物料行表格选择rows
      itemLineTableSelectedKeys = [], // 物料行表格选择kes
      supplierLineTableSelectedRows = [], // 供应商行表格选择rows
      supplierLineTableSelectedKeys = [], // 供应商行表格选择kes
      allQuotationLineTableSelectedRows = [], // 全部报价行表格选择rows
      allQuotationLineTableSelectedKeys = [], // 全部报价行表格选择kes
      checkWay,
      batchMaintainQuoteLineVisible = false,
      chooseSection,
      projectInfoVisible,
      routerParams,
      sectionMessageVisible,
      operateSectionPromptProps,
      batchEmptySelectedModalVisible,
      currentButton,
      processVisible,
    } = this.state;
    const {
      rankRule,
      priceTypeCode,
      auctionDirection,
      multiCurrencyFlag,
      onlyAllowAllWinBids = 0,
    } = header || {};
    // const { selectionStrategy = 'RELEASE' } = header;
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
    };
    const returnToPretrialProps = {
      match,
      dispatch,
      organizationId,
      hideModal: this.hideReturnToPretrial,
      visible: returnToPretrialModalVisible,
      submitReturnToPretrial: this.submitReturnToPretrial,
    };
    const itemLineListProps = {
      header,
      checkWay,
      customizeTable,
      selectedPolicy,
      organizationId,
      quotaLadderLevelData,
      headerList: itemLine,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      allottedQuantityChange: this.allottedQuantityChange,
      rfxHeaderId: params.rfxId,
      fetchLadderLevelTableLoading,
      loading: fetchItemLineLoading,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      onChangePagination: this.changeItemLinePagination,
      showQuotationDetail: this.showQuotationDetail,
      onRef: this.handleGeneratorRef,
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
      currentPaneActiveSelected,
      itemLineTableSelectedRows,
      itemLineTableSelectedKeys,
    };
    const supplierLineListProps = {
      header,
      match,
      checkWay,
      settings,
      customizeTable,
      rfxHeaderId: params.rfxId,
      headerList: supplierLine,
      fetchSupplierLine: this.fetchSupplierLine,
      loading: fetchSupplierLineLoading,
      onChangePagination: this.changeSupplierLinePagination,
      onRef: this.handleGeneratorRef,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      onRiskScan: this.linkRiskScan,
      fetchQuoteLine: this.fetchQuoteLine,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeSupplierLineTableSelection: this.changeSupplierLineTableSelection,
      currentPaneActiveSelected,
      supplierLineTableSelectedKeys,
      supplierLineTableSelectedRows,
    };
    const quoteLineTableProps = {
      match,
      checkWay,
      customizeTable,
      organizationId,
      rankRule,
      priceTypeCode,
      auctionDirection,
      multiCurrencyFlag,
      quoteLineSelectionStrategy,
      loading: fetchQuoteLineLoading,
      dataSource: quoteLine,
      pagination: quoteLinePagination,
      onRef: this.handleGeneratorRef,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      showQuotationDetail: this.showQuotationDetail,
      currentPaneActiveSelected,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeAllQuotationLineTableSelection: this.changeAllQuotationLineTableSelection,
      allQuotationLineTableSelectedKeys,
      allQuotationLineTableSelectedRows,
      fetchQueryPriceInfoLoading,
      fetchItemLine: this.fetchItemLine,
      fetchSupplierLine: this.fetchSupplierLine,
      fetchQuoteLine: this.fetchQuoteLine,
      changeQuoteLinePagination: this.changeQuoteLinePagination,
    };
    const AttachmentsProps = {
      bucketName: 'private-bucket',
      bucketDirectory,
      viewOnly,
      businessUuid: header.businessAttachmentUuid,
      techUuid: header.techAttachmentUuid,
    };
    const operations = (
      <React.Fragment>
        {settings['011107'] && +settings['011107'].settingValue ? (
          <a onClick={this.openIPCoincidenceRateModal} style={{ marginRight: '16px ' }}>
            {intl.get('ssrc.inquiryHall.view.button.IPCoincidenceRate').d('IP重合率')}
          </a>
        ) : (
          ''
        )}
        <a onClick={this.supplierRelationMap} className={styles.supplierRelationship}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.RelationMap`).d('供应商关系图谱')}
        </a>
      </React.Fragment>
    );

    const ipCoincidenceRateProps = {
      visible: ipCoincidenceRateVisible,
      dataSource: ipCoincidenceRate,
      loading: fetchIPCoincidenceRateLoading,
      onConfirmIpCoincidenceRate: this.confirmIpCoincidenceRate,
      useCustomFlag: true,
      customizeUnitCode: `SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE`,
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
      checkWay,
      batchMaintainQuoteLineVisible,
      customizeForm,
      batchMaintainQuotateLineLoading,
      onRef: this.batchMaintainRef,
      cancelBatchMaintainItemLine: this.cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine: this.saveBatchMaintainItemLine,
      resetBatchMaintainItemLine: this.resetBatchMaintainItemLine,
    };

    const { projectLineSectionId = '' } = routerParams;

    const SectionPanelProps = {
      isSection: projectLineSectionId,
      isBatchMaintainSection: chooseSection,
      queryMain: this.queryMain,
      parentPage: {
        name: 'checkPrice',
        queryParams: {
          rfxHeaderId: params.rfxId,
          rfxStatus: 'CHECK_PENDING',
        },
      },
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

    const headerFormProps = {
      header,
      customizeForm,
      onRef: this.handleGeneratorRef,
    };

    const projectTotalPrice =
      this.sectionInfo &&
      this.sectionInfo.getSourceProject &&
      this.sectionInfo.getSourceProject().projectCost;

    const sectionFlag =
      this.sectionInfo &&
      this.sectionInfo.isSectionListEmpty &&
      !this.sectionInfo.isSectionListEmpty();

    const costRemarkFormProps = {
      header,
      sectionFlag,
      customizeForm,
      projectTotalPrice,
      onRef: this.handleGeneratorRef,
    };

    const content = (
      <Content>
        <Spin
          spinning={fetchHeaderLoading}
          wrapperClassName={classnames('ued-detail-wrapper', styles.checkPrice)}
        >
          {!onlyAllowAllWinBids ? (
            <div className="change-checkWay">
              <Button.Group onClick={(e) => this.changeCheckWay(e)}>
                <Button
                  type={checkWay === 'ratio' ? 'primary' : ''}
                  value="ratio"
                  loading={changeCheckWayLoading}
                >
                  {intl.get('ssrc.inquiryHall.model.button.atTheRatio').d('按比例核价')}
                </Button>
                <Button
                  type={checkWay !== 'ratio' ? 'primary' : ''}
                  value="quantity"
                  loading={changeCheckWayLoading}
                >
                  {intl.get('ssrc.inquiryHall.model.button.distributionOnQuantity').d('按数量核价')}
                </Button>
              </Button.Group>
            </div>
          ) : null}
          {customizeCollapse(
            {
              code: 'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_COLLAPSE',
            },
            <Collapse
              className="form-collapse"
              onChange={this.onCollapseChange}
              custLoading={custLoading}
              defaultActiveKey={collapseKeys}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    {this.renderHeaderTitle(header)}
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
                <HeaderForm {...headerFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`ssrc.inquiryHall.view.message.panel.costComments`).d('成本备注')}
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
                <CostRemarkForm {...costRemarkFormProps} />
              </Panel>
            </Collapse>
          )}
        </Spin>
        {customizeTabPane(
          {
            code: 'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS',
          },
          <Tabs
            defaultActiveKey={this.state.activeKey}
            onChange={this.changeTabs}
            animated={false}
            className={styles.tabStyle}
            activeKey={this.state.activeKey}
            tabBarExtraContent={this.state.activeKey === 'supplierLine' ? operations : false}
          >
            {!onlyAllowAllWinBids ? (
              <TabPane
                tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemLine`).d('物品明细')}
                key="itemLine"
              >
                <ItemLineList {...itemLineListProps} />
              </TabPane>
            ) : (
              <div />
            )}
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
              key="supplierLine"
            >
              <SupplierLineList {...supplierLineListProps} />
            </TabPane>
            {!onlyAllowAllWinBids ? (
              <TabPane
                tab={intl.get(`ssrc.inquiryHall.view.message.tab.quoteLine`).d('全部报价明细')}
                key="quoteLine"
              >
                <QuoteLineTable {...quoteLineTableProps} />
              </TabPane>
            ) : (
              <div />
            )}
            <TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
              key="attachmentList"
            >
              <div style={{ marginTop: '16px' }}>
                <Attachment {...AttachmentsProps} />
              </div>
            </TabPane>
          </Tabs>
        )}
      </Content>
    );
    return (
      <ModalProvider>
        {this.getHeader()}
        <SectionPanel {...SectionPanelProps}>{content}</SectionPanel>
        {this.renderPricingModal()}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {returnToPretrialModalVisible && <ReturnToPretrial {...returnToPretrialProps} />}
        {/* {this.renderPriceComparisonModal(priceComparisonProps)} */}
        <IPCoincidenceRate {...ipCoincidenceRateProps} />
        {onlineBargainVisible && this.bargainRuleModal(sourceType)}
        {/** 汇率编辑modal */}
        {exchangeEditModalVisible && <ExchangeEditModal {...ExchangeEditProps} />}
        {/** 引用汇率编辑modal */}
        {exchangeEditContentModalVisible && <QuoteExchangeMainDateModal {...ExchangeQuoteProps} />}
        {/* 批量维护报价行信息 */}
        {batchMaintainQuoteLineVisible && <BatchMaintainQuoteLine {...batchMaintainQuoteLine} />}
        {/* 修改项目信息modal */}
        {projectInfoVisible && <ProjectInfo />}
        {/* 分标段校验信息提醒modal */}
        {sectionMessageVisible && <OperateSectionPromptModal {...operateSectionPromptProps} />}
        {batchEmptySelectedModalVisible && (
          <BatchEmptySelectedModal {...batchEmptySelectedModalProps} />
        )}
        {/* 过程附件下载 */}
        {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
      </ModalProvider>
    );
  }
}

export default withStandardCompEnhancer(CheckPrice);
export { CheckPrice, withStandardCompEnhancer as hocCheckPrice }; // 适配二开项目之前引入 `hocCheckPrice`
