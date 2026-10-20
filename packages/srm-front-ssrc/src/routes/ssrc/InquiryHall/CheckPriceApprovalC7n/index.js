/* eslint-disable no-param-reassign */
/*
 * CheckPrice - 寻源服务/核价页面
 * @date: 2019-1-9
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Form,
  Output,
  Modal as c7nModal,
  Attachment as C7nAttachment,
  Button as C7nButton,
} from 'choerodon-ui/pro';
import { Collapse, Tabs, Tag, Modal, Icon, Spin, Tooltip, Badge } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isEmpty, isNil, isFunction } from 'lodash';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
// import Icons from 'components/Icons';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import classnames from 'classnames';
import { filterNullValueObject, getResponse } from 'utils/utils';
import { openTab, refreshTab } from 'utils/menuTab';

// import QuotationDirectLable from '@/utils/constants';
import { isText, getSupplierRelationUrl, queryBidFileTemplateConfig } from '@/utils/utils';
import { updateCollapseActiveKeys } from '@/utils/handleCustomize.js';

import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import FeedBackBarginHistoryModal from '@/routes/ssrc/QueryQuotation/Detail/FeedBackBarginHistoryModal';
import { downloadFile } from 'hzero-front/lib/services/api';
import SectionPanel from '@/routes/components/SectionPanel/Detail';
import OperationRecord from '@/routes/components/OperationRecord';
import QuotationDetail from '@/routes/components/QuotationDetail/QuotationDetail';
import {
  INQUIRY,
  BID,
  getCheckPriceName,
  getQuotationName,
  getSourceCategoryName,
} from '@/utils/globalVariable';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { supplierRiskScan } from '@/routes/ssrc/InquiryHallNew/utils';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import {
  queryProcessAttachmentConfig,
  queryEnableDoubleUnit,
  fetchEnterpriceRiskControlConfig,
  queryBacthExpandConfig,
  querySslmLifeCycleConfig,
  queryConfigurationOldRate,
} from '@/services/commonService';
import { fetchAttachmentCount } from '@/services/checkPriceNewService';
import { supplierRelationMapNew } from '@/services/inquiryHallService';
import {
  bacthSearchTableData,
  fetchIntelligentPreReviewResult,
} from '@/services/inquiryHallNewService';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import useIPDetailModal from '@/routes/components/IPDetails';

import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import IntelligentReviewResult from '@/routes/components/IntelligentPreReview';
import ItemLineList from './ItemLineList';
import SupplierLineList from './SupplierLineList';
import QuoteLineTable from './QuoteLineTable';
import styles from './index.less';
import { withStandardCompEnhancer } from './standardCompEnhancerCreator';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import Attachment from '../../components/Attachment';
import IPCoincidenceRate from '../../../components/IPCoincidenceRate/index';
import DownloadAttachments from '../../components/DownloadAttachments';

import { renderFlagDisplay } from './utils/renderer';
import { headerInfoDS, costRemarkDS } from './store/headerDS';
import { quoteLineDS } from './store/AllQuoteLineDS';

const { Panel } = Collapse;
const { TabPane } = Tabs;

const { openIPDetailModal } = useIPDetailModal();

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

class CheckPrice extends Component {
  constructor(props) {
    super(props);
    this.SectionRef = null;

    const {
      match: { params },
    } = props;

    this.attachmentTableRef = {};

    this.applicationScopeModalKey = c7nModal.key();

    this.state = {
      activeKey: 'itemLine', // 当前激活tab面板的key
      priceComparisonModalVisible: true, // 比价助手模态框
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
      ipCoincidenceRateVisible: false, // ip重合率弹框
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      processVisible: false,
      queryHeaderLoading: false, // 头查询loading
      currentRfxHeaderId: params.rfxId || params.rfxHeaderId, // 解决多标段场景下, headerId取值有误bug
      doubleUnitFlag: false, // 判断是否开启双单位
      queryDoubleUnitFlagLoading: false,
      feedBackBarginHistoryStatus: false,
      // riskScanFlag: false, // 判断租户是否购买“风险监控”/“风险扫描”服务，若未购买，则隐藏按钮；若购买，则显示按钮
      enterpriceRiskControllerButtonsVisible: {
        RELATION_MINING: 0, // 关系图谱（关系挖掘）
        RISK_SCAN: 0, // 风险扫描
      },
      itemLinePageSize: 10,
      supplierLinePageSize: 10,
      pageLoading: false,
      batchSearchData: [],
      batchSearchDataKeys: [],
      openExpandAllFlag: false, // 是否可用一键展开/收起
      sslmLifeCycleFlag: true, // 是否开启360
      fileTemplateManageFlag: 0, // 招标文件tab
      useNewRateFlag: 0, // 是否使用老重合率标识
      aiResultData: {},
    };
    this.tabRef = React.createRef();
  }

  sourceKey = this.props.sourceKey === BID ? 'NEW_BID' : INQUIRY;

  quotationName = getQuotationName(this.props.sourceKey === BID);

  bidFlag = this.props.sourceKey === BID;

  sectionFlag =
    querystring.parse(this.props.location?.search?.substr(1))?.rfxHeaderIds?.split(',')?.length > 1;

  headerInfoDsProp = headerInfoDS({
    sourceKey: this.sourceKey,
    sectionFlag: this.sectionFlag,
  });

  // 头信息
  headerInfoDs = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_HEADER_DS',
          this.headerInfoDsProp,
          {
            sourceKey: this.sourceKey,
            sectionFlag: this.sectionFlag,
            that: this,
          }
        )
      : this.headerInfoDsProp
  ); // 头信息

  // 成本备注
  costRemarkDs = new DataSet(
    costRemarkDS({
      sourceKey: this.sourceKey,
      sectionFlag: this.sectionFlag,
    })
  );

  // 全部报价明细
  allQuoteLineDs = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_QUOTE_LINE_DS',
          quoteLineDS({
            sourceKey: this.sourceKey,
          }),
          {
            sourceKey: this.sourceKey,
            that: this,
          }
        )
      : quoteLineDS({
          sourceKey: this.sourceKey,
        })
  );

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.queryDoubleUnit();
    this.fetchPages();
    this.dealCustActiveTabKey();
    this.enterpriceRiskControllerButtonConfig();
    this.handeleSearchProcessAttachmentConfig();
    this.handeleSearchExpandAllConfig();
    this.handeleSearchSslmLifeCycleConfig();
    this.queryFileTemplateManageSheetConfig();
    this.fetchIntelligentPreReview();

    this.fetchUseOldRate();
    const { onLoad } = this.props;

    // 使用 onLoad 函数注册 submit 回调函数
    if (typeof onLoad === 'function') {
      onLoad({
        submit: this.submit,
      });
    }
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

  /**
   * submit 回调函数用于工作流审批页面点击审批按钮时进行回调
   *
   * @param {string} approveResult | 工作流审批页面的审批结果, Approved - 审批同意, Rejected - 审批拒绝
   * 使用 resolve 表示 回调函数调用完成后继续执行工作流审批流程，使用reject 表示 中断工作流审批流程
   */
  @Bind()
  submit(approveResult) {
    const {
      remote: { event } = {},
      match: { params },
    } = this.props;

    const submitCallBack = () => {
      // submit 函数需返回一个 Promise 对象
      return new Promise((resolve) => {
        resolve();
      });
    };

    // eslint-disable-next-line no-unused-expressions
    return event
      ? event.fireEvent('submit', {
          submitCallBack,
          approveResult,
          rfxHeaderId: params.rfxId,
          allQuoteLineDs: this.allQuoteLineDs,
          bidFlag: this.bidFlag,
          that: this,
          headerInfoDs: this.headerInfoDs,
        })
      : submitCallBack();
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

  // 查询招标文件模板管理配置
  queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    this.setState({
      fileTemplateManageFlag: flag,
    });
  };

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

  // 查询企业是否开通 [ 风险扫描，关系图谱，找关系, ..., ]等服务
  enterpriceRiskControllerButtonConfig = async () => {
    const { organizationId } = this.props;
    let result = null;

    const params = {
      organizationId,
      applicationCode: 'AP_CREDIT', // 固定值
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

  @Bind()
  dealCustActiveTabKey() {
    this.handleCollapseActiveKeys();

    const field =
      this.props.getHocInstance?.().custConfig['SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS']
        ?.fields || [];
    const { fieldCode } = field.find((item) => item.defaultActive === 1) || {};
    if (fieldCode) {
      this.setState({
        activeKey: fieldCode,
      });
    } else {
      const sortField =
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
  }

  fetchIntelligentPreReview = async () => {
    const { organizationId, match: { params } = {} } = this.props;

    const { rfxId: rfxHeaderId } = params || {};

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
        return;
      }

      this.setState({
        aiResultData: result || {},
      });
    } catch (e) {
      throw e;
    }
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

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    this.setState({ queryDoubleUnitFlagLoading: true });
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });

    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
    this.setState({ queryDoubleUnitFlagLoading: false });
    this.allQuoteLineDs.setState('doubleUnitFlag', Number(res));
  };

  fetchPages = () => {
    const BidSectionFlag = this.getRfxHeaderIds(); // 是否分标段
    if (BidSectionFlag) {
      return;
    }

    this.fetchInquiryHallCheckPrice();
  };

  // 参数查询
  queryMainPage = (params = {}) => {
    this.fetchInquiryHallCheckPrice(params);
  };

  // 判断分标段
  getRfxHeaderIds = () => {
    const {
      location: { search },
    } = this.props;
    const { rfxHeaderIds = null } = querystring.parse(search.substr(1));

    return rfxHeaderIds;
  };

  // 获取当前标段的查询参数
  getCurrentSectionParams = () => {
    if (this.SectionRef) {
      return;
    }

    const { getCurrentSectionParam = () => {} } = this.SectionRef;
    const queryParams = getCurrentSectionParam();
    return queryParams;
  };

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
        quoteLine: [],
        itemQuoteLine: [],
        itemQuoteLinePagination: {},
        supplierQuoteLine: [],
        quotaLadderLevelData: [],
        supplierQuoteLinePagination: {},
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
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
   * 询价大厅-核价头信息查询
   */
  @Bind()
  fetchInquiryHallCheckPrice(queryParams = {}) {
    const { dispatch, modelName = 'inquiryHall', remote, onFormLoaded } = this.props;
    const { currentRfxHeaderId } = this.state;
    const lovCodes = {
      selectedPolicy: 'SSRC.RFX_SELECTION_STRATEGY', // 选择策略
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

    const { rfxHeaderId } = queryParams || {};

    // 设置最新headerId
    if (!isNil(currentRfxHeaderId) && !isNil(rfxHeaderId) && currentRfxHeaderId !== rfxHeaderId) {
      this.setState({
        currentRfxHeaderId: rfxHeaderId,
      });
    }
    Promise.all([
      this.fetchHeaderInfo(queryParams),
      this.fetchItemLine({}, queryParams),
      this.fetchSupplierLine({}, queryParams),
      this.fetchQuoteLine({}, queryParams),
    ]).finally(() => {
      /**
     1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
     2.注册了submit回调函数的话，onFormLoaded必传
     3.onFormLoaded应在表单加载完成后调用
     4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
     */
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    });
    if (remote?.event) {
      const eventProps = {
        bidFlag: this.props.sourceKey === BID,
        handleRenderPriceCompare: this.handleRenderPriceCompare,
      };
      remote.event.fireEvent('afterQuerySet', eventProps);
    }
  }

  /**
   * 头信息 - 查询
   * @param {?Object} queryParams - 自定义查询参数
   */
  @Bind()
  async fetchHeaderInfo(queryParams) {
    const { code: workflowFormCode } = this.props;
    const { currentRfxHeaderId } = this.state;
    this.headerInfoDs.setQueryParameter('queryParams', {
      rfxHeaderId: currentRfxHeaderId,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`,
      ...queryParams,
    });
    this.setState({
      queryHeaderLoading: true,
    });
    try {
      const result = getResponse(await this.headerInfoDs.query());
      if (result) {
        const currentHeader = Object.assign({}, result, { workflowFormCode });

        this.headerInfoDs.loadData([currentHeader]);
        this.costRemarkDs.loadData([currentHeader]);
        this.allQuoteLineDs.setState('auctionDirection', result?.auctionDirection || '');
        if (this.props.remote?.event) {
          const eventProps = {
            result,
            allQuoteLineDs: this.allQuoteLineDs,
            headerInfoDs: this.headerInfoDs,
            that: this,
            bidFlag: this.bidFlag,
          };
          this.props.remote.event.fireEvent('afterQueryHeader', eventProps);
        }
      }
    } finally {
      this.setState({
        queryHeaderLoading: false,
      });
    }
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}, queryParams = {}) {
    const { dispatch, organizationId, remote, modelName = 'inquiryHall' } = this.props;
    const { currentRfxHeaderId } = this.state;
    let currentQueryParamObj = {};

    // 核价查询物料接口区分核价页面和审批页面标识，方便二开
    const checkApproveFlag = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_CHECK_APPROVE_FLAG', undefined)
      : undefined;
    currentQueryParamObj = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_CHECK_APPROVE_ITEMLINE_PARAMS',
          currentQueryParamObj,
          { that: this }
        )
      : currentQueryParamObj;

    dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: currentRfxHeaderId,
        ...queryParams,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        checkApproveFlag,
        ...(currentQueryParamObj || {}),
      },
    }).then((res) => {
      const eventProps = {
        res,
        current: this,
        bidFlag: this.props.sourceKey === BID,
      };
      if (remote?.event) {
        remote.event.fireEvent('setItemActivePanel', eventProps);
      }
    });
  }

  /**
   * 物品明细 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const { remote: { event } = {} } = this.props;
    this.setState({
      itemLinePageSize: pageSize,
    });
    this.itemLineList.setState({
      expandAllFlag: false,
    });

    const handleItemLinePagination = () => {
      const changedPagination = {};
      changedPagination.current = current;
      changedPagination.pageSize = pageSize;
      this.fetchItemLine(changedPagination);
      this.itemLineList.setState({
        itemExpand: {},
        itemActivePanel: [],
      });
    };
    // eslint-disable-next-line no-unused-expressions
    event
      ? event.fireEvent('changeItemLinePagination', {
          handleItemLinePagination,
          itemLineList: this.itemLineList,
        })
      : handleItemLinePagination();
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const { remote: { event } = {} } = this.props;
    this.setState({
      supplierLinePageSize: pageSize,
    });
    this.supplierLineList.setState({
      expandAllFlag: false,
    });
    const handleSupplierLinePagination = () => {
      const changedPagination = {};
      changedPagination.current = current;
      changedPagination.pageSize = pageSize;
      this.fetchSupplierLine(changedPagination);
      this.supplierLineList.setState({
        expand: {},
        supplierActivePanel: [],
      });
    };
    // eslint-disable-next-line no-unused-expressions
    event
      ? event.fireEvent('changeSupplierLinePagination', {
          handleSupplierLinePagination,
          supplierLineList: this.supplierLineList,
        })
      : handleSupplierLinePagination();
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}, queryParams = {}) {
    const { dispatch, organizationId, remote, modelName = 'inquiryHall' } = this.props;
    const { currentRfxHeaderId } = this.state;
    let currentQueryParamObj = {};
    currentQueryParamObj = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_CHECK_APPROVE_SUPPLIERLINE_PARAMS',
          currentQueryParamObj,
          { that: this }
        )
      : currentQueryParamObj;

    dispatch({
      type: `${modelName}/fetchSupplierLineCheckPrice`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: currentRfxHeaderId,
        ...queryParams,
        ...(currentQueryParamObj || {}),
      },
    }).then((res) => {
      const eventProps = {
        res,
        current: this,
        bidFlag: this.props.sourceKey === BID,
      };
      if (remote?.event) {
        remote.event.fireEvent('setSupplierActivePanel', eventProps);
      }
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
   * 打开过程附件查看
   */
  @Bind()
  openProcessAttachmentModal() {
    this.setState({ processVisible: true });
  }

  @Bind()
  downloadAll() {
    const { organizationId } = this.props;
    const { currentRfxHeaderId } = this.state;
    const api = `${SRM_SSRC}/v1/${organizationId}/rfx/${currentRfxHeaderId}/process-attachment/download-all`;
    downloadFile({ requestUrl: api });
  }

  @Bind()
  onCancel() {
    this.setState({
      processVisible: false,
    });
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

    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;

    const { currentRfxHeaderId } = this.state;

    if (chartFlag === 'i') {
      // 查询物品明细缩略图数据
      dispatch({
        type: `${modelName}/fetchPriceChartsData`,
        payload: { rfxLineItemId: id, organizationId, rfxHeaderId: currentRfxHeaderId },
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
        payload: { rfxLineSupplierId: id, organizationId, rfxHeaderId: currentRfxHeaderId },
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
    const { modelName = 'inquiryHall' } = this.props;
    const { itemCode, itemName, companyName, quotationLineId, quotationLineStatus } =
      record?.get([
        'itemCode',
        'itemName',
        'companyName',
        'quotationLineId',
        'quotationLineStatus',
      ]) || {};
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
      type: `${modelName}/fetchLadderLevelTable`,
      payload: {
        quotationLineId,
        organizationId,
        customizeUnitCode: `SSRC.${
          this.props.sourceKey === INQUIRY ? INQUIRY : 'NEW_BID'
        }_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`,
      },
    });
  }

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

  @Bind()
  fetchQuoteLine(_, queryParams = {}) {
    const { remote } = this.props;
    const { currentRfxHeaderId } = this.state;
    let currentQueryParamObj = {};
    currentQueryParamObj = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_CHECK_APPROVE_QUOTELINE_PARAMS',
          currentQueryParamObj,
          { that: this }
        )
      : currentQueryParamObj;

    this.allQuoteLineDs.setQueryParameter('queryData', {
      rfxHeaderId: currentRfxHeaderId,
      ...queryParams,
      checkApproveFlag: 1,
      ...(currentQueryParamObj || {}),
    });
    this.allQuoteLineDs.query();
  }

  /**
   * 物品明细行明细 - 查询
   */
  @Bind()
  fetchItemQuoteLineList(itemQuoteLineId, updateState) {
    itemQuoteLineId.forEach((item) =>
      this.itemLineList.fetchItemLineTableList({}, item, updateState)
    );
  }

  /**
   * 供应商行明细 - 查询
   */
  @Bind()
  fetchSupplierQuoteLineList(supplierQuoteLineId, updateState) {
    supplierQuoteLineId.forEach((item) =>
      this.supplierLineList.fetchSupplierLineTableList({}, item, updateState)
    );
  }

  /**
   * 供应商列表-风险监控
   */
  @Bind()
  linkRiskScan(item, e) {
    const { current } = this.headerInfoDs || {};
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
   * 跳转立项转询价
   * @param {Object} record
   */
  jumpToProjectDetail = (record) => {
    const sourceProjectId = record.get('sourceProjectId');
    if (!sourceProjectId) return;
    const path = `/ssrc/new-project-setup/detail/${sourceProjectId}?fromSourcePage=otherTabDetail`;
    openTab({
      key: path,
      path,
      // title: intl
      //   .get(`ssrc.inquiryHall.view.message.title.rfxProjectWorkbench`)
      //   .d('寻源项目工作台'),
      title: 'srm.common.tab.title.ssrc.rfxProjectWorkbench',
      closable: true,
    });
    refreshTab('/ssrc/new-project-setup');
  };

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (param = {}) => {
    const { organizationId } = this.props;
    const { queryParams = {} } = param || {};

    const { current } = this.headerInfoDs || {};
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

  // 获取头信息fields
  getHeaderInfoFields() {
    const { remote } = this.props;
    const { current } = this.headerInfoDs;
    const {
      totalPrice2,
      priceTypeCode,
      sourceFrom,
      budgetAmount,
      totalEstimatedAmount,
      totalNetEstimatedAmount,
      projectBudgetAmount,
      projectEstimatedAmount,
      projectNetEstimatedAmount,
      currencyCode,
      savingAmount,
      maxSuggestedAmount,
      minSuggestedAmount,
    } =
      current?.get([
        'totalPrice2',
        'priceTypeCode',
        'sourceFrom',
        'budgetAmount',
        'totalEstimatedAmount',
        'totalNetEstimatedAmount',
        'projectBudgetAmount',
        'projectEstimatedAmount',
        'projectNetEstimatedAmount',
        'currencyCode',
        'savingAmount',
        'maxSuggestedAmount',
        'minSuggestedAmount',
      ]) || {};
    const sourceFromFlag = sourceFrom === 'PROJECT';
    const fields = [
      <Output
        name="sourceCategoryMeaning"
        renderer={({ record, value }) => record?.get('secondarySourceCategoryMeaning') ?? value}
      />,
      <Output name="purOrganizationName" />,
      <Output name="companyName" />,
      <Output name="unitName" />,
      <Output
        name="budgetAmount"
        renderer={() => (
          <PrecisionInputNumber value={budgetAmount} financial={currencyCode} type="c7n" readOnly />
        )}
      />,
      priceTypeCode === 'TAX_INCLUDED_PRICE' && (
        <Output
          name="totalEstimatedAmount"
          renderer={() => (
            <PrecisionInputNumber
              value={totalEstimatedAmount}
              financial={currencyCode}
              type="c7n"
              readOnly
            />
          )}
        />
      ),
      <Output
        name="savingAmount"
        renderer={() => (
          <PrecisionInputNumber value={savingAmount} financial={currencyCode} type="c7n" readOnly />
        )}
      />,
      <Output name="savingRatio" renderer={({ value }) => (!isNil(value) ? `${value}%` : '')} />,
      <Output
        name="maxSuggestedAmount"
        renderer={() => (
          <PrecisionInputNumber
            value={maxSuggestedAmount}
            financial={currencyCode}
            type="c7n"
            readOnly
          />
        )}
      />,
      <Output
        name="minSuggestedAmount"
        renderer={() => (
          <PrecisionInputNumber
            value={minSuggestedAmount}
            financial={currencyCode}
            type="c7n"
            readOnly
          />
        )}
      />,
      <Output
        name="totalPrice2"
        renderer={() => (
          <PrecisionInputNumber value={totalPrice2} financial={currencyCode} type="c7n" readOnly />
        )}
      />,
      priceTypeCode !== 'TAX_INCLUDED_PRICE' && (
        <Output
          name="totalNetEstimatedAmount"
          renderer={() => (
            <PrecisionInputNumber
              value={totalNetEstimatedAmount}
              financial={currencyCode}
              type="c7n"
              readOnly
            />
          )}
        />
      ),
      sourceFromFlag ? (
        <Output
          name="sourceProjectNum"
          renderer={({ record, value }) => (
            <a onClick={() => this.jumpToProjectDetail(record)}>{value}</a>
          )}
        />
      ) : null,
      sourceFromFlag ? <Output name="sourceProjectName" /> : null,
      <Output name="currencyCodeMeaning" />,
      <Output
        name="projectBudgetAmount"
        renderer={() => (
          <PrecisionInputNumber
            value={projectBudgetAmount}
            financial={currencyCode}
            type="c7n"
            readOnly
          />
        )}
      />,
      priceTypeCode === 'TAX_INCLUDED_PRICE' && (
        <Output
          name="projectEstimatedAmount"
          renderer={() => (
            <PrecisionInputNumber
              value={projectEstimatedAmount}
              financial={currencyCode}
              type="c7n"
              readOnly
            />
          )}
        />
      ),
      priceTypeCode !== 'TAX_INCLUDED_PRICE' && (
        <Output
          name="projectNetEstimatedAmount"
          renderer={() => (
            <PrecisionInputNumber
              value={projectNetEstimatedAmount}
              financial={currencyCode}
              type="c7n"
              readOnly
            />
          )}
        />
      ),
      <Output name="rfxRemark" />,
      <Output name="internalRemark" />,
      <Output name="pretrailRemark" />,
      <C7nAttachment name="pretrialUuid" />,
      <C7nAttachment name="checkAttachmentUuid" />,
      <Output
        name="applicationScopeFlag"
        renderer={({ record }) => {
          const { applicationScopeFlag } = record ? record?.get(['applicationScopeFlag']) : {};

          return (
            <a disabled={!applicationScopeFlag} onClick={() => this.viewApplicationOrgModal()}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        }}
      />,
      <Output name="checkRemark" />,
    ].filter(Boolean);
    const otherProps = { sourceKey: this.sourceKey, that: this };
    return remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_HEADER_Info_FIELDS',
          fields,
          otherProps
        )
      : fields;
  }

  rfxTitleForm() {
    const { customizeForm } = this.props;
    return customizeForm(
      {
        readOnly: true,
        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
      },
      <Form
        dataSet={this.headerInfoDs}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        {this.getHeaderInfoFields()}
      </Form>
    );
  }

  renderHeaderTitle() {
    const { current } = this.headerInfoDs;
    const { rfxNum, rfxTitle, quotationRoundNumber } =
      current?.get(['rfxNum', 'rfxTitle', 'quotationRoundNumber']) || {};
    return (
      <h3 style={{ maxWidth: '85%' }}>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '88%',
            float: 'left',
          }}
        >
          {rfxNum}-
          <Tooltip title={`${rfxNum}-${rfxTitle}`} overlayStyle={{ minWidth: '300px' }}>
            {rfxTitle}
          </Tooltip>
        </span>
        <Tag style={{ marginLeft: '15px', width: '65px' }}>
          <span style={{ marginLeft: '-17px' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：
            {quotationRoundNumber || 1}
          </span>
        </Tag>
      </h3>
    );
  }

  // 是否分标段，切查询到标段数据
  isSectionAndData = () => {
    const flag = this.getRfxHeaderIds();

    if (!this.SectionRef || isEmpty(this.SectionRef)) {
      return false;
    }

    const { isSectionListEmpty = () => {} } = this.SectionRef;
    const notEmptyFlag = isSectionListEmpty();
    return !notEmptyFlag && !!flag;
  };

  // 获取标段项目数据
  getSourceProjectData = () => {
    let data = {};
    if (!this.SectionRef || isEmpty(this.SectionRef)) {
      return data;
    }

    const { getSourceProject } = this.SectionRef;
    if (getSourceProject && typeof getSourceProject === 'function') {
      data = getSourceProject();
    }

    return data;
  };

  // 获取成本备注fields
  getCostRemarkFields() {
    const sectionFlag = this.isSectionAndData();
    const { projectCost: projectTotalPrice = null } = this.getSourceProjectData();
    const { current } = this.costRemarkDs;
    const { currencyCode, totalPrice } = current?.get(['currencyCode', 'totalPrice']) || {};
    return [
      <Output
        name="totalCost"
        renderer={({ value }) => (
          <PrecisionInputNumber financial={currencyCode} type="c7n" readOnly value={value} />
        )}
      />,
      sectionFlag && (
        <Output
          name="projectTotalPrice"
          renderer={() => (
            <PrecisionInputNumber
              financial={currencyCode}
              type="c7n"
              readOnly
              value={projectTotalPrice}
            />
          )}
        />
      ),
      <Output
        name="totalPrice"
        renderer={() => (
          <PrecisionInputNumber value={totalPrice} financial={currencyCode} type="c7n" readOnly />
        )}
      />,
      <Output
        name="totalCost"
        renderer={({ value }) => (
          <PrecisionInputNumber financial={currencyCode} type="c7n" readOnly value={value} />
        )}
      />,
      <Output name="overCostFlag" renderer={renderFlagDisplay} />,
      <Output
        name="overCostPrice"
        renderer={({ value }) => (
          <PrecisionInputNumber financial={currencyCode} type="c7n" readOnly value={value} />
        )}
      />,
      <Output name="overCostScale" />,
      <Output name="costRemark" newLine colSpan={2} />,
    ];
  }

  /**
   * 渲染成本备注折叠
   */
  rfxCostRemarkForm() {
    const { customizeForm } = this.props;

    return customizeForm(
      {
        readOnly: true,
        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`,
      },
      <Form
        dataSet={this.costRemarkDs}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        {this.getCostRemarkFields()}
      </Form>
    );
  }

  /**
   *切换tab页
   */
  @Bind()
  changeTabs(key) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      [modelName]: {
        itemLineChange = false,
        supplierLineChange = false,
        allLineChange = false,
        itemQuoteLine = [],
        supplierQuoteLine = [],
        quoteLine = [],
      },
    } = this.props;
    const { activeKey } = this.state;
    if (activeKey !== key) {
      if (itemLineChange || supplierLineChange || allLineChange) {
        // itemLine标签页有改动
        if (activeKey === 'itemLine' && itemLineChange) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              // 设置activeKey，重置itemLineChange，form,表格得$form
              this.setState({ activeKey: key });
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              itemQuoteLine.forEach((item) => item.$form.resetFields());
              dispatch({
                type: `${modelName}/updateState`,
                payload: {
                  itemLineChange: false,
                },
              });
            },
          });
        }
        // supplierLine标签页有改动
        if (activeKey === 'supplierLine' && supplierLineChange) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              // 设置activeKey，重置itemLineChange，form,表格得$form
              this.setState({ activeKey: key });
              // eslint-disable-next-line no-unused-expressions
              this.itemLineList?.props?.form?.resetFields();
              supplierQuoteLine.forEach((item) => item.$form.resetFields());
              dispatch({
                type: `${modelName}/updateState`,
                payload: {
                  supplierLineChange: false,
                },
              });
            },
          });
        }
        // quoteLine标签页有改动
        if (activeKey === 'quoteLine' && allLineChange) {
          Modal.confirm({
            title: intl
              .get('hzero.common.message.confirm.giveUpTip')
              .d('你有修改未保存，是否确认离开？'),
            onOk: () => {
              // 设置activeKey，重置itemLineChange，form,表格得$form
              this.setState({ activeKey: key });
              // eslint-disable-next-line no-unused-expressions
              this.quoteLine?.props?.form?.resetFields();
              quoteLine.forEach((item) => item.$form.resetFields());
              dispatch({
                type: `${modelName}/updateState`,
                payload: {
                  allLineChange: false,
                },
              });
            },
          });
        }
      } else {
        this.setState({ activeKey: key });
      }
    }
  }

  /**
   * 获取供应商关系图
   */
  @Throttle(600)
  @Bind()
  async supplierRelationMap() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      // dispatch,
      organizationId,
      [modelName]: { supplierLine = [] },
    } = this.props;
    const { currentRfxHeaderId } = this.state;

    const { current } = this.headerInfoDs;
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
        rfxHeaderId: currentRfxHeaderId,
        rfxNum: current?.get('rfxNum'),
      };
      companyNames.push(currentLine);
    });

    // 校验头id
    idValidation(currentRfxHeaderId);

    const secondarySourceCategory = this.headerInfoDs?.current?.get('secondarySourceCategory');
    if (!secondarySourceCategory) return;

    supplierRelationMapNew({
      organizationId,
      data: {
        rfxHeaderId: currentRfxHeaderId,
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

  /*
   * IP重合率弹框-打开
   */
  @Bind()
  openIPCoincidenceRateModal() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const { currentRfxHeaderId } = this.state;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: `${modelName}/fetchIPCoincidenceRate`,
      payload: {
        rfxHeaderId: currentRfxHeaderId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL`,
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

  /**
   * 报价明细-打开
   */
  @Bind()
  showQuotationDetail(record) {
    this.setState({
      quotationDetailVisible: true,
      itemLineRecord: record,
    });
  }

  /**
   * 报价明细-关闭
   */
  @Bind()
  hideQuotationDetail() {
    this.setState({
      quotationDetailVisible: false,
      itemLineRecord: {},
    });
  }

  // 判断是否/pub 页面
  isPubPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub'); // /pub/ssrc/inquiry-hall/rfx-detail/:rfxId
    return IsPublic;
  };

  getHeaderButtons() {
    const {
      currentRfxHeaderId = null,
      processAttachmentNewUIFlag,
      attachmentNewUILoading,
      attachmentCount = '',
    } = this.state;
    const { organizationId, remote, history, location } = this.props;
    const operationProps = {
      rfxHeaderId: currentRfxHeaderId,
      name: 'operatingRecord',
    };
    const { current } = this.headerInfoDs;
    const sourceCategory = current?.get('sourceCategory');
    const buttons = [
      <OperationRecord {...operationProps} />,
      <C7nButton
        name="assistant"
        funcType="flat"
        type="default"
        onClick={this.handleRenderPriceCompare}
      >
        <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
        {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
      </C7nButton>,
      <C7nButton
        name="attachment"
        icon="get_app"
        funcType="flat"
        loading={attachmentNewUILoading}
        onClick={
          processAttachmentNewUIFlag
            ? openC7nProcessAttachmentModal({
                rfxHeaderId: currentRfxHeaderId,
              })
            : this.openProcessAttachmentModal
        }
      >
        <Badge count={attachmentCount} overflowCount={attachmentCount} size="small">
          {intl.get('ssrc.inquiryHall.view.button.examine').d('过程附件查看')}
        </Badge>
      </C7nButton>,
      <ExcelExportPro
        name="exportNew"
        templateCode="SRM_C_SRM_SSRC_RFX_QUOTATION_DETAIL_EXPORT"
        queryParams={{ rfxHeaderId: currentRfxHeaderId }}
        buttonText={intl.get('hzero.common.export').d('导出')}
        requestUrl={`${SRM_SSRC}/v1/${organizationId}/rfx/check/export-new`}
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
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
        }}
      />,
    ];
    const otherProps = {
      headerInfoDs: this.headerInfoDs,
      organizationId,
      sourceKey: this.sourceKey,
      rfxHeaderId: currentRfxHeaderId,
      allQuoteLineDs: this.allQuoteLineDs,
      fetchHeaderInfo: this.fetchHeaderInfo,
      fetchQuoteLine: this.fetchQuoteLine,
      history,
      location,
      sourceCategory,
      getSourceCategoryName,
    };
    return currentRfxHeaderId
      ? remote
        ? remote.process(
            'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_HEADER_BUTTONS',
            buttons,
            otherProps
          )
        : buttons
      : null;
  }

  getPriceCompareProp() {
    const { history, remote } = this.props;
    const { currentRfxHeaderId } = this.state;

    const { current } = this.headerInfoDs;
    const { sourceCategory, diyLadderQuotationFlag } =
      current?.get(['sourceCategory', 'diyLadderQuotationFlag']) || {};

    // 比价助手
    const priceComparisonProps = {
      sourceCategory,
      diyLadderQuotationFlag,
      rfxId: currentRfxHeaderId,
      // visible: priceComparisonModalVisible,
      // onHideModal: this.hidePriceComparison,
      history,
    };
    const otherProps = {
      bidFlag: this.props.sourceKey === BID,
    };
    return remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_PRICE_COMPARE_PROPS',
          priceComparisonProps,
          otherProps
        )
      : priceComparisonProps;
  }

  @Bind()
  renderPriceCompare() {
    const { priceComparisonModalVisible } = this.state;
    const { remote } = this.props;
    const priceComparisonProps = this.getPriceCompareProp();

    return (
      priceComparisonModalVisible &&
      (remote ? (
        remote.render(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_RENDER_PRICE_COMPARISON',
          this.bidFlag ? (
            <BidPriceComparison {...priceComparisonProps} />
          ) : (
            <PriceComparison {...priceComparisonProps} />
          ),
          priceComparisonProps
        )
      ) : this.bidFlag ? (
        <BidPriceComparison {...priceComparisonProps} />
      ) : (
        <PriceComparison {...priceComparisonProps} />
      ))
    );
  }

  @Bind()
  handleRenderPriceCompare() {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceCompare(),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  /**
   * 页面审批下面三个tab里的表格统一字段处理，尤其是二开
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
      headerInfoDs: this.headerInfoDs,
      allQuoteLineDs: this.allQuoteLineDs,
      that: this,
      doubleUnitFlag,
    };

    const columns = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_ALL_TAB_TABLE_COLUMNS',
          commonColumns,
          cuxProps
        )
      : commonColumns;

    return columns || [];
  };

  renderOperations(settings) {
    const { customizeBtnGroup = () => {} } = this.props;
    const {
      enterpriceRiskControllerButtonsVisible = {},
      openExpandAllFlag,
      activeKey,
      useNewRateFlag = 0,
    } = this.state;
    const {
      RELATION_MINING = 0, // 关系图谱（关系挖掘）
    } = enterpriceRiskControllerButtonsVisible || {};

    const operations = (
      <React.Fragment>
        {['itemLine', 'supplierLine'].includes(activeKey) && openExpandAllFlag && (
          <C7nButton
            funcType="link"
            onClick={() =>
              this.handleClickExpandAll(activeKey === 'itemLine' ? 'item' : 'supplier')
            }
            className={styles.supplierRelationship}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.allExpand`).d('一键展开/收起')}
          </C7nButton>
        )}
        {activeKey === 'supplierLine' &&
          customizeBtnGroup(
            {
              code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS`,
            },
            [
              useNewRateFlag ? (
                <C7nButton
                  name="viewIPDetails"
                  funcType="link"
                  icon="find_in_page"
                  onClick={this.handleViewIPDetail}
                  style={{ marginRight: '16px' }}
                >
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewIPDetails`).d('查看IP重合详情')}
                </C7nButton>
              ) : settings['011107'] && +settings['011107'].settingValue ? (
                <C7nButton
                  name="ipCoincidenceRate"
                  funcType="link"
                  onClick={this.openIPCoincidenceRateModal}
                  className={styles.supplierRelationship}
                  style={{ cursor: 'pointer' }}
                >
                  {intl.get('ssrc.inquiryHall.view.button.IPCoincidenceRate').d('IP重合率')}
                </C7nButton>
              ) : (
                ''
              ),
              RELATION_MINING ? (
                <C7nButton
                  name="relationMap"
                  funcType="link"
                  onClick={this.supplierRelationMap}
                  className={styles.supplierRelationship}
                  style={{ cursor: 'pointer' }}
                >
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.RelationMap`).d('供应商关系图谱')}
                </C7nButton>
              ) : (
                ''
              ),
            ].filter(Boolean)
          )}
      </React.Fragment>
    );
    return operations;
  }

  renderQuoteLineTable(quoteLineTableProps) {
    return <QuoteLineTable {...quoteLineTableProps} />;
  }

  renderItemLineList(itemLineListProps) {
    return <ItemLineList {...itemLineListProps} />;
  }

  renderSupplierLineList(supplierLineListProps) {
    return <SupplierLineList {...supplierLineListProps} />;
  }

  handleAttachmentTableRef = (node) => {
    this.attachmentTableRef = node;
  };

  renderAttachmentTab = () => {
    const {
      match: { params },
      customizeTable,
      customizeBtnGroup,
    } = this.props;
    const { rfxId } = params || {};
    const { fileTemplateManageFlag = 0 } = this.state;

    if (fileTemplateManageFlag !== 1) {
      return '';
    }

    const fileProps = {
      customizeTable,
      customizeBtnGroup,
      headerDS: this.headerInfoDs,
      fileTemplateManageFlag,
      rfxHeaderId: rfxId,
      editorFlag: 0,
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
   * @protect 鸿合科技二开
   */
  getTabPanes({ itemLineListProps, supplierLineListProps, quoteLineTableProps, AttachmentsProps }) {
    const { remote } = this.props;
    const { rfxHeaderId, headerInfoDs } = itemLineListProps || {};
    const tabs = [
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemLine`).d('物品明细')}
        key="itemLine"
      >
        {this.renderItemLineList(itemLineListProps)}
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
        key="supplierLine"
        forceRender
      >
        {this.renderSupplierLineList(supplierLineListProps)}
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.quoteLine`).d('全部报价明细')}
        key="quoteLine"
        forceRender
      >
        {this.renderQuoteLineTable(quoteLineTableProps)}
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
        key="attachmentList"
      >
        <Attachment {...AttachmentsProps} />
      </TabPane>,
      this.renderAttachmentTab(),
    ];
    return remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_TAB_PANE_ARRAT', tabs, {
          rfxHeaderId,
          header: headerInfoDs.current?.toData(),
          that: this,
        })
      : tabs;
  }

  renderTabPanes({
    settings,
    itemLineListProps,
    supplierLineListProps,
    quoteLineTableProps,
    AttachmentsProps,
  }) {
    const { remote } = this.props;
    const { activeKey } = this.state;
    return (
      <Tabs
        defaultActiveKey={this.state.activeKey}
        onChange={this.changeTabs}
        animated={false}
        className={styles.tabStyle}
        tabBarExtraContent={
          remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_TAB_BAR_EXTRA_CONTENT',
                [this.renderOperations(settings)],
                {
                  checkPriceProp: this,
                  activeKey,
                  // sourceKey: this.sourceKey,
                  itemLineListProps,
                  supplierLineListProps,
                  // itemLineList: this.itemLineList,
                  // supplierLineList: this.supplierLineList,
                }
              )
            : this.renderOperations(settings)
        }
      >
        {this.getTabPanes({
          itemLineListProps,
          supplierLineListProps,
          quoteLineTableProps,
          AttachmentsProps,
        }) || []}
      </Tabs>
    );
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
        rfxId: this.state.currentRfxHeaderId,
        quotationLineId,
        supplierCompanyName,
        itemCode,
        itemName,
      },
      feedBackBarginHistoryStatus: true,
    });
  }

  // 此方法需要后续优化，代码冗余，目前没时间了
  @Bind()
  async handleClickExpandAll(type) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      remote,
      organizationId,
      match: { params },
      [modelName]: { itemLine = [], supplierLine = [] },
    } = this.props;
    this.setState({
      pageLoading: true,
    });
    let res;
    const pageSize = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_PAGESIZE', 10)
      : 10;
    if (type === 'item') {
      const { expandAllFlag } = this.itemLineList.state;
      if (!expandAllFlag) {
        const itemkeys = itemLine.map((item) => String(item.rfxLineItemId));
        const itemExpand = {};
        itemkeys.forEach((item) => {
          itemExpand[item] = true;
        });
        this.itemLineList.changeCollapse(itemkeys);

        this.itemLineList.setState({
          expandAllFlag: true,
          expand: itemExpand,
        });
        const queryProps = {
          organizationId,
          queryParams: {
            page: 0,
            size: pageSize,
          },
          data: {
            rfxHeaderId: params.rfxId,
            checkApproveFlag: 1,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
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
        this.itemLineList.changeCollapse([]);
        if (this.itemLineList?.itemLineTable) {
          Object.values(this.itemLineList.itemLineTable).forEach((ds) => {
            ds.currentPage = 1;
            ds.pageSize = pageSize;
          });
        }
        this.itemLineList.setState(
          {
            expand: {},
            expandAllFlag: false,
          }
          // 更优解决方案，要是有时间，后续和代码优化可以一起上
          // , () => {
          //   if ( this.itemLineList.scrollTo && this.scrollerContainerRef) {
          //     this.itemLineList.scrollTo(0);
          //     // this.scrollerContainerRef.scrollTo(0, !expandAllFlag ? 0 : 1);
          //   }
          // }
        );
        this.setState({
          pageLoading: false,
        });
      }
      if (this.itemLineList.scrollTo && this.scrollerContainerRef) {
        this.scrollerContainerRef.scrollTo(0, !expandAllFlag ? 0 : 1);
      }
      return res;
    } else if (type === 'supplier') {
      const { expandAllFlag } = this.supplierLineList.state;
      if (!expandAllFlag) {
        const supplierkeys = supplierLine.map((item) => String(item.rfxLineSupplierId));
        const supplierExpand = {};
        supplierkeys.forEach((item) => {
          supplierExpand[item] = true;
        });
        this.supplierLineList.changeCollapse(supplierkeys);

        this.supplierLineList.setState({
          expandAllFlag: true,
          expand: supplierExpand,
        });
        const queryProps = {
          organizationId,
          queryParams: {
            page: 0,
            size: pageSize,
          },
          data: {
            checkApproveFlag: 1,
            rfxHeaderId: params.rfxId,
            customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
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
        this.supplierLineList.changeCollapse([]);
        if (this.supplierLineList?.supplierLineTable) {
          Object.values(this.supplierLineList.supplierLineTable).forEach((ds) => {
            ds.currentPage = 1;
            ds.pageSize = pageSize;
          });
        }
        this.supplierLineList.setState({
          expand: {},
          expandAllFlag: false,
        });
        this.setState({
          pageLoading: false,
        });
      }
      if (this.supplierLineList.scrollTo && this.scrollerContainerRef) {
        this.scrollerContainerRef.scrollTo(0, !expandAllFlag ? 0 : 1);
      }
      return res;
    }
  }

  getBiddingFieldsFromHeader = () => {
    const { current } = this.headerInfoDs;

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

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      organizationId,
      fetchItemLineLoading,
      fetchSupplierLineLoading,
      fetchLadderLevelTableLoading,
      fetchIPCoincidenceRateLoading,
      customizeTable,
      custLoading,
      customizeCollapse,
      customizeBtnGroup = () => {},
      customizeTabPane,
      [modelName]: {
        itemLine = [],
        supplierLine = [],
        quotaLadderLevelData = [],
        code: { selectedPolicy = [] },
        ipCoincidenceRate = [],
        settings,
      },
      location: { search },
      location,
      remote,
      dispatch,
      history,
    } = this.props;
    const {
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      viewPriceChartsVisible,
      priceDataSource,
      supplierNameList,
      chartsLoading,
      id,
      bucketDirectory,
      viewOnly,
      doubleUnitFlag,
      collapseKeys = [],
      ipCoincidenceRateVisible,
      quotationDetailVisible = false,
      itemLineRecord = {},
      processVisible,
      currentRfxHeaderId,
      queryHeaderLoading = false,
      queryDoubleUnitFlagLoading = false,
      feedBackBarginHistoryStatus,
      feedBackBarginHistorySearch,
      // riskScanFlag,
      enterpriceRiskControllerButtonsVisible = {},
      itemLinePageSize,
      supplierLinePageSize,
      pageLoading,
      batchSearchData,
      batchSearchDataKeys,
      openExpandAllFlag, // 是否可用一键展开/收起
      sslmLifeCycleFlag, // 是否开启新360
      useNewRateFlag = 0,
      aiResultData,
    } = this.state;
    const sectionFlag = this.getRfxHeaderIds();
    const { backPath } = querystring.parse(search.substr(1)) || {};
    const {
      RISK_SCAN = 0, // 风险扫描
    } = enterpriceRiskControllerButtonsVisible || {};

    const { current } = this.headerInfoDs; // 头ds状态
    // const queryHeaderLoading = status === 'loading'; // 舍弃, 通过state更新
    const { businessAttachmentUuid, techAttachmentUuid, rfxStatus } =
      current?.get(['businessAttachmentUuid', 'techAttachmentUuid', 'rfxStatus']) || {};

    const itemLineListProps = {
      isPub: this.isPubPage(),
      customizeTable,
      selectedPolicy,
      organizationId,
      doubleUnitFlag,
      quotaLadderLevelData,
      headerList: itemLine,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      headerInfoDs: this.headerInfoDs,
      sourceKey: this.sourceKey,
      rfxHeaderId: currentRfxHeaderId,
      fetchLadderLevelTableLoading,
      loading: fetchItemLineLoading,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      onChangePagination: this.changeItemLinePagination,
      showQuotationDetail: this.showQuotationDetail,
      onRef: (node) => {
        this.itemLineList = node;
      },
      // 缩略图参数
      id,
      itemChartsLoading: chartsLoading[id] && chartsLoading[id].fetchPriceChartLoading,
      priceDataSource,
      supplierNameList,
      onPriceCharts: this.viewPriceCharts,
      onHidePriceCharts: this.hidePriceCharts,
      priceChartsvisible: viewPriceChartsVisible,
      onComparePriceHistory: this.onComparePriceHistory,
      remote,
      itemLinePageSize,
      batchSearchData,
      batchSearchDataKeys,
      openExpandAllFlag, // 是否可用一键展开/收起
      modelName,
      [modelName]: this.props[modelName],
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
      history,
      bidFlag: this.bidFlag,
      location,
    };
    const supplierLineListProps = {
      isPub: this.isPubPage(),
      riskScanFlag: RISK_SCAN,
      settings,
      doubleUnitFlag,
      customizeTable,
      headerInfoDs: this.headerInfoDs,
      sourceKey: this.sourceKey,
      rfxHeaderId: currentRfxHeaderId,
      headerList: supplierLine,
      loading: fetchSupplierLineLoading,
      onChangePagination: this.changeSupplierLinePagination,
      onRef: (node) => {
        this.supplierLineList = node;
      },
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      onRiskScan: this.linkRiskScan,
      onComparePriceHistory: this.onComparePriceHistory,
      remote,
      supplierLinePageSize,
      batchSearchData,
      batchSearchDataKeys,
      openExpandAllFlag, // 是否可用一键展开/收起
      modelName,
      [modelName]: this.props[modelName],
      sslmLifeCycleFlag,
      customizeBtnGroup,
      useNewRateFlag,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
      location,
    };
    const quoteLineTableProps = {
      isPub: this.isPubPage(),
      organizationId,
      selectedPolicy,
      customizeTable,
      doubleUnitFlag,
      allQuoteLineDs: this.allQuoteLineDs,
      headerInfoDs: this.headerInfoDs,
      onRef: (node) => {
        this.quoteLine = node;
      },
      sourceKey: this.sourceKey,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      showQuotationDetail: this.showQuotationDetail,
      onComparePriceHistory: this.onComparePriceHistory,
      remote,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
      location,
    };
    const { handleTopTips = undefined, cuxHeaderrfxTitleStyle = undefined } =
      remote?.props?.process || {};

    const rfxTitleCollapseStyle = isFunction(cuxHeaderrfxTitleStyle)
      ? cuxHeaderrfxTitleStyle({}, { basicInfoDs: this.headerInfoDs })
      : {};

    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      viewOnly,
      businessUuid: businessAttachmentUuid,
      techUuid: techAttachmentUuid,
    };

    // 物品行报价明细props
    const quotationDetailProps = {
      itemLineRecord,
      sourceFrom: 'RFX',
      allowBuyerViewFlag: 1,
      rfxStatus,
      visible: quotationDetailVisible,
      onCancel: this.hideQuotationDetail,
    };

    // 过程附件查看
    const DownloadAttachmentsProps = {
      rfxHeaderId: currentRfxHeaderId,
      processVisible,
      downloadAll: this.downloadAll,
      onCancel: this.onCancel,
      organizationId,
      from: 'examine',
      cuxHandlePreviewImage: this.cuxHandlePreviewImage, // 本方法是奥克斯二开方法，在子类的prototype上
    };

    const ipCoincidenceRateProps = {
      sourceKey: this.sourceKey,
      visible: ipCoincidenceRateVisible,
      dataSource: ipCoincidenceRate,
      loading: fetchIPCoincidenceRateLoading,
      onConfirmIpCoincidenceRate: this.confirmIpCoincidenceRate,
      useCustomFlag: true,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL`,
      pageName: 'CHECK_PRICE_APPROVAL',
    };

    const SectionPanelProps = {
      parentPage: {
        name: 'checkPriceApproval',
        queryParams: {
          // rfxStatus: 'CHECK_PENDING',
          rfxHeaderIds: sectionFlag,
        },
      },
      // couldSectionSwitch: this.couldSectionSwitch,
      paramKeys: ['sourceHeaderId'],
      projectLineSectionId: sectionFlag,
      queryMain: this.queryMainPage,
      isSection: sectionFlag,
      isPub: this.isPubPage(),
    };

    const feedBackBarginHistoryModalProps = {
      quotationName: this.quotationName,
      search: feedBackBarginHistorySearch,
      organizationId,
      doubleUnitFlag,
      feedBackBarginHistoryStatus,
      onCancel: () => this.setState({ feedBackBarginHistoryStatus: false }),
      dispatch,
    };

    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl
            .get(`ssrc.inquiryHall.view.message.title.commonCheckPriceApproval`, {
              checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
            })
            .d('{checkPriceName}审批')}
        >
          {customizeBtnGroup(
            { code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_COLLAPSE_BUTTONS` },
            this.getHeaderButtons()
          )}
        </Header>
        <IntelligentReviewResult aiResultData={aiResultData} />
        <SectionPanel
          {...SectionPanelProps}
          onRef={(node) => {
            this.SectionRef = node;
          }}
        >
          <Content wrapperClassName="ssrc-inquiry-hall-new-check-price-approval-wrap-class">
            <Spin
              spinning={queryHeaderLoading || pageLoading}
              wrapperClassName={classnames('ued-detail-wrapper')}
            >
              {isFunction(handleTopTips) ? (
                handleTopTips(this.headerInfoDs, { ...this.props })
              ) : (
                <></>
              )}
              {customizeCollapse(
                {
                  code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_COLLAPSE`,
                },
                <Collapse
                  className="form-collapse"
                  onChange={this.onCollapseChange}
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
                    {this.rfxTitleForm()}
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
                    {this.rfxCostRemarkForm()}
                  </Panel>
                </Collapse>
              )}
            </Spin>
            <Spin spinning={queryDoubleUnitFlagLoading}>
              {customizeTabPane(
                {
                  code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.ITEMSINFO_TABS`,
                },
                this.renderTabPanes({
                  settings,
                  itemLineListProps,
                  supplierLineListProps,
                  quoteLineTableProps,
                  AttachmentsProps,
                })
              )}
            </Spin>
          </Content>
        </SectionPanel>

        {/* {this.renderPriceCompare()} */}
        <IPCoincidenceRate {...ipCoincidenceRateProps} />
        {/*  报价明细 */}
        {quotationDetailVisible && <QuotationDetail {...quotationDetailProps} />}
        {/* 过程附件查看 */}
        {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
        {feedBackBarginHistoryStatus ? (
          <FeedBackBarginHistoryModal {...feedBackBarginHistoryModalProps} />
        ) : null}
      </React.Fragment>
    );
  }
}
const HOCComponent = withStandardCompEnhancer(CheckPrice);
export default HOCComponent;
export { CheckPrice };
