/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
/**
 * 页面逻辑介绍
 * componentDidMount: 查询竞价头和竞价行信息 进行websocket连接
 * render: 列表页:渲染竞价头部信息(固定不变)，只读竞价行信息(根据状态inquiryTableReadOnly显示),附件信息查看
 * 详情页：分为左侧只读列表，和右侧 头部(报价截止时间倒计时,隐藏明细按钮）,form表单信息(只读信息,和可编辑),charts竞价趋势图和竞价排名表,底部(保存和提交按钮)
 * 列表进入详情页方法：openTableRow(),返回列表页方法:hideItemDetail()
 * 详情页逻辑：左侧列表按钮展开详情:openTableDetail()
 * charts逻辑：renderChartInfo() ==> 包含 竞价走势图和竞价排名表
 *
 */

import { Chart, Geom, Axis, Tooltip } from 'bizcharts';
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import {
  Button,
  Popover,
  Form,
  InputNumber,
  Modal,
  Row,
  Table,
  Spin,
  Pagination,
  Tag,
  Input,
  DatePicker,
  Collapse,
  Icon,
  Badge,
  Alert,
} from 'hzero-ui';
import {
  Modal as c7nModal,
  ModalProvider,
  DataSet,
  Icon as IconC7N,
  Tooltip as C7NTooltip,
} from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { routerRedux } from 'dva/router';

import {
  getCurrentOrganizationId,
  getDateFormat,
  getUserOrganizationId,
  getEditTableData,
  filterNullValueObject,
  getCurrentUserId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import moment from 'moment';
import queryString from 'querystring';
import classNames from 'classnames';
import {
  sum,
  isNumber,
  map,
  isEmpty,
  isUndefined,
  filter,
  isArray,
  throttle,
  isNil,
  // debounce,
} from 'lodash';

import { queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
// import EditTable from '_components/EditTable';
import Lov from 'components/Lov';
import ExcelExport from 'components/ExcelExport';
import Upload from 'srm-front-boot/lib/components/Upload';
import { getActiveTabKey } from 'utils/menuTab';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { enableRender, dateRender, dateTimeRender } from 'utils/renderer';
import webSocketManagener from 'utils/webSoket';

import CommonImportNew from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import remote from 'hzero-front/lib/utils/remote';

import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';
import { dateFormate, isPubPage, amountCalcType, fetchCurrentPrecision } from '@/utils/utils';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender, parseAmount } from '@/utils/renderer';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import CommonImport from '@/routes/himp/CommonImportNew';
import ExcelExports from '@/routes/components/ExcelExport';
import SectionPanel from '@/routes/components/SectionPanel';
import BatchEmptySelectedModal from '@/routes/components/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import { validatorConfirmModal, validateModal } from '@/routes/components/ConfirmModal';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';
import { queryUiDisplayConfig } from '@/services/commonService';

import {
  quotationSectionBatchSubmit,
  fetchQuotationLineNewMessage,
  fetchQuotationListNewMessage,
  quotationWholeAbandon,
} from '@/services/supplierQutationService';
import { fetchInquiryHallUserMemory as fetchUserConfigBatch } from '@/services/inquiryHallNewService';
import common from '@/routes/ssrc/common.less';
import Iconfont from '@/routes/ssrc/components/Icons';
import style from './Header.less';
import BatchMaintainFrom from '../InquiryPrice/BatchMaintainFrom';
import LadderLevelModal from './LadderLevelModal';
import QuoteAttachment from './QuoteAttachment';
import InquiryHeader from './Header';
import CountDown from '../../components/CountDown';
import WholeAbandonForm from '../InquiryPrice/WholeAbandonForm/';
import { wholeAbadonDataSet } from '../InquiryPrice/WholeAbandonForm/stores.js';
import ItemForm from './ItemForm';
import QuotationFrom from './QuotationForm';

// import styles from '@/routes/ssrc/InquiryHall/Update/index.less';
import SupplierRankTable from './SupplierRankTable';
import SupplierRankTableDS from './LineDS';
import FormInputWrapper from '../components/WrapperTooltip';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Panel } = Collapse;

let dynamicIntervalTime = 2_000;
const IntervalTime = 2_000;
const ThirtySecondTimer = 30_000;
const MAXTHREAD = 3;
const QuotationSubmitFieldFlag = 'quotationSubmitChangeFlag'; // 竞价单提交，socket 推送标识

class BiddingOffer extends Component {
  constructor(props) {
    super(props);
    const { rfxId } = props.match.params;

    this.rollingFetchUuid = uuidv4();
    // this.pageLeaveTime = null;
    // this.changePageTabLeaveRefreshInterval = 15; // 切换tab时间间隔秒，查询更新

    this.SectionRef = {}; // 分标段组建ref
    this.BatchEmptySectionRef = {}; // 分标段-未批量勾选-modal-ref
    this.quotationFormRef = null; // quotation form ref

    this.registerSocket = 0; // socket 是否链接， 1 = 链接， 0 未链接
    this.quotationListTimer = null;
    this.rankTimer = null;
    this.biddingOfferDiffTimerId = null; // 竞价开始与截止时间差值定时器id
    this.ladderModalCount = 0; // 阶梯报价弹框数量
    this.rankChartBeatCount = 0;
    this.messageListBeatCount = 0;
    this.biddingSocketMap = new Map();
    this.rankListQueryThread = 0;
    this.randChartQueryThread = 0;

    this.roundFetchTimer = IntervalTime;

    this.state = {
      collapseKeys: [], // 打开的折叠面板key
      bucketDirectory: 'ssrc-rfx-quotationheader',
      attachmentVisible: false, // 附件modal隐藏标识位
      inquiryTableReadOnly: true, // 默认只读列表为true
      inquiryDetail: false, // 默认关闭详情页信息
      selectedRows: [],
      selectedRowKeys: [],
      chartData: [], // 图表数据
      gridData: [], // 竞价排名数据
      visibleImport: false, // excel导入显示控制
      rfxLineItemId: null, // 物料行id
      quotationLineId: null, // 头的行id
      lineStatus: null, // 行状态
      batchMaintainItemLineVisible: false, // 批量维护form
      columns: [
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.ranking`).d('排名'),
          dataIndex: 'rank',
          width: 60,
          render: (val, record) => this.rankChartColor(record),
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 80,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价'),
          dataIndex: 'gridQuotationPrice',
          width: 80,
          align: 'right',
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
          dataIndex: 'quotedDate',
          width: 150,
          render: dateTimeRender,
        },
      ], // 竞价排名列表
      newBiddingLineColumns: [], // 物料行数据 时时刷新的排名字段
      historyColumns: [
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationCount`).d('报价次数'),
          dataIndex: 'quotationCount',
          width: 100,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.ranking`).d('排名'),
          dataIndex: 'rank',
          width: 60,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.supplierName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 100,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价'),
          dataIndex: 'quotationPrice',
          width: 80,
          align: 'right',
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
          dataIndex: 'quotedDate',
          width: 150,
          render: dateTimeRender,
        },
      ], // 个人历史报价字段
      rfxId, // 报价单头 id
      flag: 0, // 默认展开表格
      expand: {}, // 是否变换背景色
      ladderVisible: false, // 是否显示阶梯报价
      ladderListHeaderInfo: {}, // 阶梯报价头信息
      ladderLevelSelectedRowKeys: [], // 阶梯报价选中id
      ladderLevelSelectedRows: [], // 阶梯报价选中行
      supplierDataChange: false, // 物品行数据是否有修改
      currentRecord: {}, // 第二视图当前
      headerCountTimeInfo: {}, // 截至时间-倒计时数据源

      // 分标段
      isBatchMaintainSection: false, // 是否选批量操作标段
      batchEmptySelectSectionFlag: false, // 批量操作分标段是否需要弹窗
      userConfig: {}, // 用户配置
      userConfigs: {}, // 用户配置所有配置
      operateSectionPromptFlag: false, // 批量操作分标段提示-modal
      operateSectionData: null, // // 批量操作分标段提示数据
      batchOperateType: null, // 分标段-批量操作-类型
      pageDataToSaved: {}, // 批量保存页面头行数据
      operationLoading: false, // page operation loading
      itemViewDate: {}, // 物料视图-时间
      currencyPrecision: null, // 手动查询的币种精度，单价不补零
      financialPrecision: null, // 手动查询的财务精度
      batchEditLineLockLoading: false, // 批量编辑行loading
      caclRule: null, // 业务规则定义-金额计算方式
      lovs: {}, // lov map
    };
  }

  supplierRankTableDS = new DataSet(SupplierRankTableDS());

  async componentDidMount() {
    this.registerSocket = 0;

    await this.fetchPages();
    this.fetchUserConfig();
    this.fetchLovData();
    this.initWebSoketConnect();

    // 浏览器切换事件
    document.addEventListener('visibilitychange', this.chromeTabVisibilityChange);

    await this.pageMountOrRetryCux();
  }

  // chrome change tab event handle
  chromeTabVisibilityChange = () => {
    const { inquiryDetail, currentRecord } = this.state;
    const HiddenChromeTabFlag = document?.hidden;

    if (!HiddenChromeTabFlag) {
      this.handleFetchQuotationListNewMessage({ newIntoCurrentTabFlag: 1 });
      this.fetchQuotationListMessage();

      if (inquiryDetail && !isEmpty(currentRecord)) {
        this.handleRankChart(currentRecord, { newIntoCurrentTabFlag: 1 });
        this.rankChart(currentRecord);
      }

      this.pageMountOrRetryCux();
    } else {
      this.clearTimerInterval();

      this.setState({
        headerCountTimeInfo: {},
        itemViewDate: {},
      });
      // this.pageLeaveTime = this.getCurrentDateTimeSecond(); // 记录离开时间

      this.pageUnmountOrLeaveCux();
    }
  };

  /**
   * 页面加载后或者再次进入纯二开埋点
   * CUX
   * src-60070 竞价多阶段阶段倒计时 SRM-AUX
   * */
  pageMountOrRetryCux = () => {
    const { biddingOfferRemote } = this.props;
    const { event } = biddingOfferRemote || {};

    if (event) {
      event.fireEvent('pageMountOrRetryCuxHandle', {
        that: this,
      });
    }
  };

  /**
   * 页面卸载后或者离开纯二开埋点
   * CUX
   * src-60070 竞价多阶段阶段倒计时 SRM-AUX
   * */
  pageUnmountOrLeaveCux = () => {
    const { biddingOfferRemote } = this.props;
    const { event } = biddingOfferRemote || {};

    if (event) {
      event.fireEvent('pageUnmountOrLeaveCuxHandle', {
        that: this,
      });
    }
  };

  // 计算和上次离开时间判断，时间足够长查询
  // leavePageTimeNeedFetchPage = () => {
  //   const currentTimer = this.getCurrentDateTimeSecond();
  //   const greatThanInterval = math.gte(
  //     math.minus(currentTimer, this.pageLeaveTime),
  //     this.changePageTabLeaveRefreshInterval
  //   );
  //   const refreshFlag =
  //     currentTimer &&
  //     this.pageLeaveTime &&
  //     currentTimer > this.pageLeaveTime &&
  //     greatThanInterval;

  //   return refreshFlag;
  // }

  // 当前时间-转为秒
  // getCurrentDateTimeSecond = () => {
  //   return moment().second();
  // }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const { rfxId: prevId = null } = prevParams;
    const { rfxId = null } = params;
    const RefreshFlag = rfxId && prevId !== rfxId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.registerSocket = 0; // 多标段切换标段后，需要重新注册socket
      this.fetchPages();
    }
  }

  /**
   * 初始化webSoket连接
   */
  @Bind()
  initWebSoketConnect() {
    if (webSocketManagener.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
    }
  }

  supplierSocketUrl = '';

  /**
   * 注册发布列表连接
   */
  @Bind()
  registerReleasedListSocketConnect() {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { rfxNum = null, roundNumber = null, tenantId = null } = quotationHeader || {};

    if (isNil(tenantId) || isNil(rfxNum)) {
      return;
    }

    this.supplierSocketUrl = `/topic/monitor/change/${tenantId}/${rfxNum}/${roundNumber}`;
    webSocketManagener.addListener(this.supplierSocketUrl, this.handleSocketMessageListener);
    this.registerSocket = 1;
  }

  handleSocketMessageListener = (messageData) => {
    if (!messageData) {
      return;
    }
    const data = JSON.parse(messageData?.message);
    console.log(`/topic/monitor/change/`, '1', messageData, data);
    this.cacheSocketDataInMap(data);
    this.handleSocketMessage(data);
  };

  /**
   * 延迟从map中执行操作，并清空
   */
  @Bind()
  @Debounce(dynamicIntervalTime)
  handleSocketMessage() {
    this.handleWebsocketMessageReceive();
  }

  // socket data reorganization
  cacheSocketDataInMap = (data) => {
    const { inquiryDetail, currentRecord } = this.state;
    if (isEmpty(data)) {
      return;
    }

    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (!value) {
        return;
      }

      let refreshEffect = '';
      let handle = null;

      if (key === QuotationSubmitFieldFlag) {
        refreshEffect = 'rankList';
        handle = () => {
          this.handleFetchQuotationListNewMessage();
          if (inquiryDetail && !isEmpty(currentRecord)) {
            this.handleRankChart(currentRecord);
          }
          this.biddingSocketMap.delete(key);
        };
      }

      // 1 - 说明竞价过程控制调整了运行时间
      if (key === 'adjustChangeFlag') {
        refreshEffect = 'refreshAllPage';
        handle = () => {
          // 需要刷新列表
          this.querySupplier();
          this.biddingSocketMap.clear();
        };
      }

      this.biddingSocketMap.set(key, {
        flag: value,
        handle,
        refreshEffect,
      });
    });
  };

  @Bind()
  handleWebsocketMessageReceive() {
    if (!this.biddingSocketMap.size) {
      return;
    }

    this.biddingSocketMap.forEach((value, key, curMap) => {
      const { flag, handle } = value || {};
      if (!flag || !key || !handle || !curMap.size) {
        return;
      }

      if (handle) {
        handle();
      }
    });
  }

  /**
   * 更新刷新次数
   */
  setRankListRefreshCount = (options) => {
    const num = this.randChartQueryThread || 0;
    this.randChartQueryThread = this.updateThreadByType(num, options);
  };

  /**
   * 更新刷新次数
   */
  setRankChartRefreshCount = (options) => {
    const num = this.rankListQueryThread || 0;
    this.rankListQueryThread = this.updateThreadByType(num, options);
  };

  updateThreadByType = (calcNumber = 0, options = {}) => {
    const { count = 1, type = '' } = options || {};

    let num = calcNumber;
    if (type === 'ADD') {
      num += count;
    }
    if (type === 'DELETE') {
      num -= count;
    }
    if (type === 'RESET') {
      num = 0;
    }

    if (num < 0) {
      num = 0;
    }

    return num;
  };

  /**
   * 关闭socket
   */
  closeSocket() {
    // webSocketManagener.removeAllListeners();
    if (this.supplierSocketUrl && webSocketManagener.removeListener) {
      webSocketManagener.removeListener(this.supplierSocketUrl, this.handleSocketMessageListener);
    }
    if (webSocketManagener?.destroyWebSocket) {
      webSocketManagener.destroyWebSocket();
    }
  }

  initCalcType = async (data = {}) => {
    const result = (await amountCalcType(data)) || [];
    this.setState({ caclRule: result?.[0] });
  };

  // 配置表定义 轮询定时器间隔时间 BIDDING_REFRESH_LIMIT
  fetchConfigTimer = async () => {
    const { organizationId } = this.props;
    const data = {
      organizationId,
      tableCode: 'ssrc_new_function_configuration_list',
      tenantNum: getCurrentTenant().tenantNum,
    };
    const res = await queryUiDisplayConfig(data);
    if (!isEmpty(res)) {
      const obj = res.find((item) => item.function === 'BIDDING_REFRESH_LIMIT') || {};
      const { value1 = null } = obj;
      if (value1 && !math.isNaN(value1)) {
        this.roundFetchTimer = math.multipliedBy(value1, 1000);
        dynamicIntervalTime = this.roundFetchTimer;
      }
    }
  };

  async fetchPages() {
    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      return;
    }

    await this.fetchConfigTimer();
    await this.fetchHeader();
    await this.queryQuotationLines();

    this.fetchQuotationListMessage();
  }

  fetchHeader = async (params = {}) => {
    const {
      dispatch,
      organizationUserId,
      match: {
        params: { rfxId: quotationHeaderId = null },
      },
      organizationId,
      form,
    } = this.props;
    await dispatch({
      type: 'supplierQuotation/queryQuotationHeader',
      payload: {
        organizationUserId,
        quotationHeaderId,
        ...params,
        customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
        rollingFetchUuid: this.rollingFetchUuid,
      },
    }).then((res) => {
      if (res && !res.failed) {
        form.resetFields(); // 重新查询前，执行重置操作
        this.resetQuotationFormField();
        const { tenantId, currencyCode } = res || {};
        // 手动查询币种精度
        this.fetchCurrencyPrecision(currencyCode, tenantId);
        this.initCalcType({ purTenantId: tenantId, organizationId, supplierFlag: 1 });
        // const { currentDateTime, quotationEndDate } = res;
        // this.startBiddingOfferTimer(currentDateTime, quotationEndDate);

        this.handleRemoteSetStateData(res);
        this.updateHeaderCountTimeInfoFromHeaderData();
        this.handleRemoteAfterFetchHeader(res);

        // 需要等头数据获取后再注册socket,需要用头字段
        if (this.registerSocket === 0) {
          this.registerReleasedListSocketConnect();
        }
      }
    });
  };

  updateHeaderCountTimeInfoFromHeaderData = (otherData = {}) => {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;

    const { currentDateTime, currentQuotationRound, quotationEndDate, bargainStatus } =
      quotationHeader || {};

    if (currentDateTime && quotationEndDate) {
      this.setState({
        headerCountTimeInfo: {
          currentDateTime,
          currentQuotationRound,
          quotationEndDate,
          bargainStatus,
          ...(otherData || {}),
        },
      });
    }
  };

  // fetch lov map
  fetchLovData = async () => {
    const data = {
      lineStatusLovs: 'SSRC.RFX_QUOTATION_LINE_STATUS',
    };

    let result = null;
    try {
      result = await queryMapIdpValue(data);
      result = getResponse(result);
      if (!result) {
        return;
      }

      this.setState({
        lovs: result,
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * 开启定时器-如果定时器计时大于报价截止时间与报价开始时间的差值，则直接返回到列表页
   */
  startBiddingOfferTimer = (startTime, endTime) => {
    this.clearBiddingOfferTimer();
    // const { dispatch } = this.props;
    const diffTime = !endTime ? 86400 : (new Date(endTime) - new Date(startTime)) / 1000 + 5; // 竞价给5秒缓冲时间
    let intervalTime = 0;
    this.biddingOfferDiffTimerId = setInterval(() => {
      intervalTime++;
      if (intervalTime > diffTime) {
        // dispatch(
        //   routerRedux.push({
        //     pathname: this.getBackPath(),
        //   })
        // );
      }
    }, 1000);
  };

  /**
   * 清除定时器
   */
  clearBiddingOfferTimer = () => {
    if (this.biddingOfferDiffTimerId) {
      clearInterval(this.biddingOfferDiffTimerId);
    }
  };

  // 根据币种查询精度
  @Bind()
  async fetchCurrencyPrecision(currencyCode, tenantId) {
    if (!currencyCode) {
      return;
    }

    const Precisions = await fetchCurrentPrecision({
      currencyCodes: currencyCode,
      purTenantId: tenantId,
    });
    if (!Precisions) {
      return;
    }
    const { currency, financial } = Precisions || {};
    // 设置币种精度
    this.setState({ currencyPrecision: currency });
    this.setState({ financialPrecision: financial });
  }

  querySupplier = (params = {}) => {
    const { inquiryDetail = false } = this.state;

    this.fetchHeader(params);

    if (inquiryDetail) {
      this.queryDetailView();
    } else {
      this.queryQuotationLines({}, params);
      this.fetchQuotationListMessage();
    }
  };

  // 轮循接口中-取出头时间信息
  @Bind()
  recordHeaderCountTimeInfo(data = {}, options = {}) {
    const { headerCountTimeInfo = {} } = this.state;
    const {
      currentDateTime = null,
      currentQuotationRound = null,
      bargainStatus = null,
      headerQuotationEndDate = null,
    } = data || {};
    const { newIntoCurrentTabFlag = 0 } = options || {};

    // 时间延长60s
    const quotationEndDateNew = headerQuotationEndDate
      ? moment(headerQuotationEndDate || null)
          ?.add(60, 's')
          ?.format(DEFAULT_DATETIME_FORMAT)
      : null;

    const EndQuotationFlag =
      currentDateTime && headerQuotationEndDate && currentDateTime > quotationEndDateNew;
    if (EndQuotationFlag) {
      // 倒数计时判断如果headerCountTimeInfo为空，会取头查询的时间，为防止此类问题，截止后记录一波最新的数据
      this.setState({
        headerCountTimeInfo: {
          currentDateTime,
          currentQuotationRound,
          quotationEndDate: headerQuotationEndDate,
          bargainStatus,
        },
      });
      this.clearQuotationListTimer();
      return;
    }

    // 首次进入页面，且为新建数据，没有截止时间，只有开始时间，需要组装时间
    if (newIntoCurrentTabFlag && !headerQuotationEndDate && currentDateTime) {
      this.updateHeaderCountTimeInfoFromHeaderData({
        ...headerCountTimeInfo,
        currentDateTime,
      });

      return;
    }

    const DisabledUpdateDateFlag =
      !headerQuotationEndDate ||
      (headerQuotationEndDate && headerCountTimeInfo.quotationEndDate === headerQuotationEndDate);
    if (DisabledUpdateDateFlag) {
      return;
    }

    this.clearBiddingOfferTimer();
    // this.startBiddingOfferTimer(currentDateTime, headerQuotationEndDate);

    this.setState({
      headerCountTimeInfo: {
        currentDateTime,
        currentQuotationRound,
        quotationEndDate: headerQuotationEndDate,
        bargainStatus,
      },
    });
  }

  // 清除报价历史表格数据
  clearQuotationHistoryListData = (data = []) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierQuotation/updateState',
      payload: { quotationHistoryList: data },
    });
  };

  // 查询报价行列表-推送数据
  fetchQuotationListMessage = (options) => {
    const { immediatelyQueryOneFlag = 0 } = options || {};
    if (immediatelyQueryOneFlag) {
      this.handleFetchQuotationListNewMessage(); // 立即查询一次
    }

    this.clearQuotationListTimer();
    this.quotationListTimer = setInterval(
      () => this.handleFetchQuotationListNewMessage(),
      ThirtySecondTimer
    );
  };

  // 报价行列表-推送数据
  @Bind()
  async handleFetchQuotationListNewMessage(options = {}) {
    const {
      organizationId,
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { newBiddingLineColumns = [] } = this.state;
    const {
      currentDateTime = null,
      quotationEndDate = null,
      rfxNum = null,
      roundNumber = null,
      rfxHeaderId = null,
      auctionDirection = null,
      templateId = null,
      tenantId = null,
      bargainStatus = null,
      quotationHeaderId,
    } = quotationHeader || {};

    // 时间延长60s
    const quotationEndDateNew = quotationEndDate
      ? moment(quotationEndDate || null)
          ?.add(60, 's')
          ?.format(DEFAULT_DATETIME_FORMAT)
      : null;

    const currentBargainFlag = bargainStatus === 'BARGAINING_ONLINE'; // 议价

    const disabledFetchNewMessageFlag =
      currentBargainFlag ||
      !currentDateTime ||
      !quotationEndDate ||
      (currentDateTime && quotationEndDate && currentDateTime >= quotationEndDateNew);
    if (disabledFetchNewMessageFlag) {
      this.clearTimerInterval();
      return;
    }

    const rfxLineItemNums = [];
    if (!isEmpty(newBiddingLineColumns)) {
      newBiddingLineColumns.forEach((item) => {
        rfxLineItemNums.push(item?.rfxLineItemNum);
      });
    }

    const { appVersion = null } = navigator || {};

    let result = null;
    const CommonParam = {
      organizationId,
      rfxNum,
      roundNumber,
      rfxHeaderId,
      auctionDirection,
      templateId,
      quotationHeaderId,
      rfxLineItemNums,
      purchaseTenantId: tenantId,
      customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE',
      rollingFetchUuid: this.rollingFetchUuid,
      appVersion,
    };

    if (!quotationHeaderId || !organizationId || !tenantId) {
      this.clearTimerInterval();
      throw ReferenceError('Id Is Error!');
    }

    if (this.rankListQueryThread > MAXTHREAD) {
      this.clearTimerInterval();
      return;
    }

    this.setRankListRefreshCount({ type: 'ADD' });
    try {
      result = await fetchQuotationListNewMessage(CommonParam);
      result = getResponse(result);
      this.setRankListRefreshCount({ type: 'DELETE' });

      if (result && result?.failed) {
        this.clearQuotationListTimer();
        notification.warning({
          message: result?.message,
        });
        return;
      }

      // network error
      if (!result) {
        if (this.messageListBeatCount > 15) {
          this.clearQuotationListTimer();
          return;
        }

        this.messageListBeatCount += 1;
        return;
      }

      this.messageListBeatCount = 0;

      this.handleRemoteSetStateData(result);
      this.recordHeaderCountTimeInfo(result, options);
      this.handleFetchQuotationListNewMessageSuccessed(result);
    } catch (e) {
      throw e;
    }
  }

  /**
   * 查询头后二开处理逻辑埋点
   */
  @Bind()
  handleRemoteAfterFetchHeader(header = {}) {
    const { biddingOfferRemote } = this.props;
    const { event } = biddingOfferRemote || {};

    if (event) {
      event.fireEvent('remoteAfterFetchHeader', {
        that: this,
        data: header,
      });
    }
  }

  /**
   * 查询头接口或者轮询接口之后的操作
   * 设置二开中用的state的值
   * @param {*} data
   * @protected 埋点二开方法，请勿删除
   */
  @Bind()
  handleRemoteSetStateData(data = {}) {
    const { biddingOfferRemote } = this.props;
    if (biddingOfferRemote?.event) {
      // 给state中设置二开的值
      return biddingOfferRemote.event.fireEvent('remoteSetStateData', {
        that: this,
        data,
      });
    }
  }

  // 报价行列表-推送数据成功处理
  @Bind()
  handleFetchQuotationListNewMessageSuccessed(newData = {}) {
    const { newBiddingLineColumns = [] } = this.state;
    const { biddingOfferRemote } = this.props;
    const { quotationRankDTOS = [], rfxLineItemMap = {}, currentDateTime } = newData || {};
    if (isEmpty(newBiddingLineColumns)) {
      return;
    }

    const quotationLineMap = newBiddingLineColumns.map((item) => {
      const {
        quotationLineId = null,
        rfxLineItemId = null,
        quotationEndDate: originQuotationEndDate,
        quotationStartDate: originQuotationStartDate,
        lineStatus,
      } = item || {};

      let currentLineQuotationEndDate = originQuotationEndDate;
      const DateOjb = {};
      if (!isEmpty(rfxLineItemMap) && rfxLineItemMap[rfxLineItemId]) {
        const { quotationEndDate = null, quotationStartDate = null } =
          rfxLineItemMap[rfxLineItemId] || {};
        DateOjb.quotationEndDate = quotationEndDate;
        DateOjb.quotationStartDate = quotationStartDate;
        currentLineQuotationEndDate = quotationEndDate;
      }

      const lineStatusObject = this.getCurrentQuotationLineStatus({
        currentDateTime,
        quotationEndDate: currentLineQuotationEndDate,
        lineStatus,
        quotationStartDate: originQuotationStartDate,
      });

      let mappingLine = null;
      if (!isEmpty(quotationRankDTOS)) {
        mappingLine = quotationRankDTOS.find(
          (rankItem) => rankItem.quotationLineId === quotationLineId
        );
      }

      if (!isEmpty(mappingLine)) {
        const { rank = null, trendFlag = 0 } = mappingLine || {};

        return {
          ...item,
          ...DateOjb,
          ...(lineStatusObject || {}),
          rank,
          trendFlag,
        };
      } else {
        return {
          ...item,
          ...DateOjb,
          ...(lineStatusObject || {}),
        };
      }
    });

    // 实时刷新接口刷新页面
    if (biddingOfferRemote?.event) {
      biddingOfferRemote.event.fireEvent('updatePageValueAfterRefreshRollingQuery', {
        data: newData,
        form: this.props.form,
      });
    }

    this.setState({ newBiddingLineColumns: quotationLineMap });
  }

  // 依据时间改写状态
  getCurrentQuotationLineStatus = (data = {}) => {
    const { currentDateTime, quotationEndDate, quotationStartDate, lineStatus } = data || {};
    const { lovs = {} } = this.state;
    const { lineStatusLovs } = lovs || {};

    const cancelCalculateStatusFlag =
      lineStatus && !['NOT_START', 'IN_QUOTATION', 'FINISHED'].includes(lineStatus);
    if (
      !quotationEndDate ||
      !currentDateTime ||
      !quotationStartDate ||
      isEmpty(lineStatusLovs) ||
      cancelCalculateStatusFlag
    ) {
      return;
    }

    let currentStatus = 'NOT_START';
    if (currentDateTime <= quotationStartDate) {
      currentStatus = 'NOT_START';
    }
    if (quotationStartDate < currentDateTime && currentDateTime < quotationEndDate) {
      currentStatus = 'IN_QUOTATION';
    }
    if (currentDateTime >= quotationEndDate) {
      currentStatus = 'FINISHED';
    }

    const currentStatusObject = lineStatusLovs.find((status) => status?.value === currentStatus);
    const { value, meaning } = currentStatusObject || {};

    if (!value || !meaning) {
      return;
    }

    return {
      lineStatus: value,
      lineStatusMeaning: meaning,
    };
  };

  // 查询用户配置
  async fetchUserConfig() {
    const { organizationId } = this.props;
    let data = {};

    try {
      data = await fetchUserConfigBatch({
        organizationId,
        userId: getCurrentUserId(),
        configKeys: [
          'sectionSupplierBiddingOfferSelectWarning',
          'sectionSupplierBiddingOfferSaveWarning',
        ],
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        userConfigs: data,
      });
    } catch (e) {
      throw e;
    }

    return data;
  }

  // clear timer interval
  clearTimerInterval() {
    this.clearQuotationListTimer();
    this.clearRankTimer();
  }

  clearQuotationListTimer() {
    if (this.quotationListTimer) {
      clearInterval(this.quotationListTimer);
    }
  }

  clearRankTimer() {
    if (this.rankTimer) {
      clearInterval(this.rankTimer);
    }
    if (this.afterQueryLineTimer) {
      clearTimeout(this.afterQueryLineTimer);
    }
  }

  // 判定需要使用的用户配置
  judgeCurrentUserConfig = (key = null) => {
    const { userConfigs = {} } = this.state;
    if (!key || isEmpty(userConfigs)) {
      return {};
    }

    let visible = false;
    let config = {};
    const { [key]: data = {} } = userConfigs;

    if (isEmpty(data)) {
      config = {
        configKey: key,
        configDesc: key,
        userId: getCurrentUserId(),
        enabledFlag: 1,
      };
    } else {
      const { configValue = null } = data || {};
      config = {
        configKey: key,
        configDesc: key,
        ...data,
      };
      visible = !configValue || configValue === 'display';
    }

    return {
      visible,
      config,
    };
  };

  // 查询表格行
  @Bind()
  async queryQuotationLines(page = {}, queryParameter = {}, callback = () => {}) {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId: quotationHeaderId } = params;
    const { selectedRows } = this.state;

    await dispatch({
      type: 'supplierQuotation/queryQuotationLines',
      payload: {
        organizationId,
        quotationHeaderId,
        page: !isEmpty(page) ? page : this.tableCurrentPagination || {},
        ...queryParameter,
        customizeUnitCode:
          'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        rollingFetchUuid: this.rollingFetchUuid,
      },
    }).then((res) => {
      this.tableCurrentPagination = {};
      if (res) {
        this.dataProcessing();
        if (res.content && res.content[0] && selectedRows.length > 0) {
          const { content = [] } = res;
          const resultArr = [];
          selectedRows.forEach((item) => {
            if (!item) {
              return;
            }

            const selectedRowRecord =
              content.filter((_item) => _item.quotationLineId === item?.quotationLineId)[0] || null;
            if (!isEmpty(selectedRowRecord)) {
              resultArr.push(selectedRowRecord);
            }
          });
          this.setState({ selectedRows: resultArr });
        }
        const { content = [] } = res;
        callback(content);
        this.setSelectedForSections(res?.content);
        this.afterQueryLineFetchRank();
      }
    });
  }

  // 行查询后，查一次排名
  afterQueryLineFetchRank = () => {
    if (this.afterQueryLineTimer) {
      clearTimeout(this.afterQueryLineTimer);
    }
    this.afterQueryLineTimer = setTimeout(this.fetchRankListOrRankChart, this.roundFetchTimer);
  };

  fetchRankListOrRankChart = () => {
    const { inquiryDetail, currentRecord } = this.state;
    this.handleFetchQuotationListNewMessage();
    if (inquiryDetail) {
      this.handleRankChart(currentRecord);
    }
  };

  // 分标段-设置勾选
  setSelectedForSections(lines = []) {
    const sectionFlag = this.isBidSectionData();
    if (!sectionFlag || isEmpty(lines)) {
      return;
    }

    const selectedLines = [];
    lines.forEach((item) => {
      const { actionSectionSelectedFlag = 0, quotationLineId } = item;
      if (actionSectionSelectedFlag) {
        selectedLines.push(quotationLineId);
      }
    });

    this.setState({
      selectedRowKeys: selectedLines,
    });
  }

  /**
   *  组件卸载
   */
  componentWillUnmount() {
    const { dispatch } = this.props;

    document.removeEventListener('visibilitychange', this.chromeTabVisibilityChange);
    this.clearTimerInterval();
    this.clearBiddingOfferTimer();
    this.closeSocket();

    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        quotationHeader: {},
        quotationLines: {},
        quotationLinePagination: {},
      },
    });

    this.pageUnmountOrLeaveCux();
  }

  /**
   * 根据浮动方式调整报价幅度单位
   */
  @Bind()
  handleFloatingWay(val) {
    let mean = '';
    if (val) {
      if (val === 'money') {
        mean = intl.get(`ssrc.inquiryHall.view.message.floatingMoney`).d('金额（元）');
      } else {
        mean = intl.get(`ssrc.inquiryHall.view.message.floatingRatio`).d('比率（%）');
      }
    }
    return mean;
  }

  // 触发页面操作loading
  toggleOperationLoading = (loading = false) => {
    this.setState({ operationLoading: loading });
  };

  /**
   * 改变币种，获取最新币种精度值
   */
  @Bind()
  changeCurrencyCode(val, record) {
    const { defaultPrecision, financialPrecision } = record || {};
    this.setState(
      {
        currencyPrecision: val ? defaultPrecision : null,
        financialPrecision: val ? financialPrecision : null,
      },
      () => {
        this.changeCurrencyReCalculateLine();
      }
    );
  }

  // 改变币种后重新计算行
  changeCurrencyReCalculateLine = () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { biddingQuotationLine = {}, quotationLines = {} },
    } = this.props;
    const { content = [] } = quotationLines || {};
    if (!isEmpty(content)) {
      content.forEach((line) => {
        this.dynamicChangePrice(line);
      });
    }

    this.dynamicChangePrice(biddingQuotationLine);
  };

  /**
   * 根据浮动方式调整报价幅度单位
   */
  @Bind()
  handleQuotationRange(value, floatType) {
    let mean = '';
    if (isNumber(value) && floatType) {
      if (floatType === 'money') {
        mean = `${value}${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}`;
      } else {
        mean = `${value}%`;
      }
    }
    return mean;
  }

  /**
   *  rankColor - 详情排名颜色变化颜色变化
   *   1-红色， 2-黄色， 3-蓝色， 其他-灰色
   */
  @Bind()
  rankChartColor(record) {
    const { biddingOfferRemote } = this.props;
    const { rank, quotationRank } = record || {};
    const realRank = rank || quotationRank || '';
    let color = '';
    switch (realRank) {
      case 1:
        color = '#F13131';
        break;
      case 2:
        color = '#FFC800';
        break;
      case 3:
        color = '#29BECE';
        break;
      default:
        color = '#D5DAE0';
        break;
    }
    const rankNode = (
      <Tag style={{ border: 0 }} color={color}>
        {realRank}
      </Tag>
    );
    return biddingOfferRemote
      ? biddingOfferRemote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_LINE_RANK_COLUMN_NODE',
          rankNode,
          {
            record,
          }
        )
      : rankNode;
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
   *  列表排名数据处理
   */
  @Bind()
  dataProcessing() {
    const {
      supplierQuotation: { quotationLines = {} },
    } = this.props;
    const selectList = quotationLines.content;
    if (this.rankBody) {
      for (let i = 0; i < selectList.length; i++) {
        for (let j = 0; j < this.rankBody.length; j++) {
          const currentRankObj = this.rankBody[j];
          const { quotationRank } = currentRankObj || {};

          if (selectList[i].quotationLineId === this.rankBody[j].quotationLineId) {
            selectList[i].rank = this.rankBody[j].rank || quotationRank;
          }
        }
      }
    } else {
      //  预处理
    }
    this.setState({ newBiddingLineColumns: selectList });
    this.setSelectedForSections(selectList);
  }

  /**
   *  详情数据处理
   */
  rankChart(record = {}, options = {}) {
    const { immediatelyQueryOneFlag = 1 } = options || {};
    if (immediatelyQueryOneFlag) {
      this.handleRankChart(record); // 立即查询一次
    }

    this.clearRankTimer();
    this.rankTimer = setInterval(() => this.handleRankChart(record), ThirtySecondTimer);
  }

  // 物料下竞价排名-消息处理
  async handleRankChart(line = {}, options = {}) {
    const {
      organizationId,
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const {
      tenantId = null,
      rfxNum = null,
      roundNumber = null,
      currentDateTime = null,
      quotationEndDate = null,
      rfxHeaderId = null,
      auctionDirection = null,
      templateId = null,
      quotationHeaderId = null,
      openRule = null,
      bargainStatus = null,
    } = quotationHeader || {};
    const { rfxLineItemNum, rfxLineItemId } = line || {};

    const DisabledFetchFlag = !tenantId || !rfxNum || !rfxLineItemId || !organizationId;
    if (DisabledFetchFlag) {
      throw ReferenceError('Main Fields Is Error!');
    }

    // 时间延长60s
    const quotationEndDateNew = quotationEndDate
      ? moment(quotationEndDate || null)
          ?.add(60, 's')
          ?.format(DEFAULT_DATETIME_FORMAT)
      : null;

    const currentBargainFlag = bargainStatus === 'BARGAINING_ONLINE'; // 议价

    const disabledFetchNewMessageFlag =
      currentBargainFlag ||
      !currentDateTime ||
      !quotationEndDate ||
      (currentDateTime && quotationEndDate && currentDateTime >= quotationEndDateNew);
    if (disabledFetchNewMessageFlag) {
      this.clearRankTimer();
      return;
    }

    const { appVersion = null } = navigator || {};
    let result = null;
    const CommonParam = {
      organizationId,
      rfxNum,
      roundNumber,
      rfxHeaderId,
      auctionDirection,
      templateId,
      quotationHeaderId,
      rfxLineItemId,
      rfxLineItemNum,
      openRule,
      purchaseTenantId: tenantId,
      customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE',
      rollingFetchUuid: this.rollingFetchUuid,
      appVersion,
    };

    if (this.randChartQueryThread > MAXTHREAD) {
      this.clearRankTimer();
      return;
    }

    this.setRankChartRefreshCount({ type: 'ADD' });
    try {
      result = await fetchQuotationLineNewMessage(CommonParam);
      this.setRankChartRefreshCount({ type: 'DELETE' });
      // result = getResponse(result);
      // if (!result) {
      //   this.clearRankTimer();
      //   return;
      // }

      if (result && result?.failed) {
        this.clearRankTimer();
        notification.warning({
          message: result?.message,
        });
        return;
      }

      // network error
      if (!result) {
        if (this.rankChartBeatCount > 15) {
          this.clearRankTimer();
          return;
        }

        this.rankChartBeatCount += 1;
        return;
      }

      this.rankChartBeatCount = 0;

      this.handleRankChartSuccessed(result, options);
    } catch (e) {
      throw e;
    }
  }

  // 排名表轮循成功处理
  handleRankChartSuccessed(resultDto = {}, options = {}) {
    if (isEmpty(resultDto)) {
      return;
    }

    const { itemViewDate = {}, gridData = [], currentRecord } = this.state;
    const {
      quotationRankDTOS = [],
      rankChartDTOS = null,
      currentDateTime: rankChartCurrentDateTime = null,
      quotationEndDate: lineQuotationEndDate = null,
    } = resultDto || {};
    const { quotationEndDate: currentOldLineQuotationEndDate } = currentRecord || {};
    const { newIntoCurrentTabFlag = 0 } = options || {};

    // 时间延长60s
    const quotationEndDateNew = lineQuotationEndDate
      ? moment(lineQuotationEndDate || null)
          ?.add(60, 's')
          ?.format(DEFAULT_DATETIME_FORMAT)
      : null;

    const disabledFetchNewMessageFlag =
      rankChartCurrentDateTime &&
      lineQuotationEndDate &&
      rankChartCurrentDateTime >= quotationEndDateNew;

    if (disabledFetchNewMessageFlag) {
      // 倒数计时判断如果headerCountTimeInfo为空，会取头查询的时间，为防止此类问题，截止后记录一波最新的数据
      this.recordItemCountDate({
        now: rankChartCurrentDateTime,
        quotationEndDate: lineQuotationEndDate,
      });
      this.clearRankTimer();
      return;
    }

    // 首次进入页面，且为新建数据，没有截止时间，只有开始时间，需要组装时间 // todo
    if (newIntoCurrentTabFlag && !lineQuotationEndDate && rankChartCurrentDateTime) {
      this.recordItemCountDate({
        now: rankChartCurrentDateTime,
        quotationEndDate: currentOldLineQuotationEndDate,
      });

      return;
    }

    if (
      rankChartCurrentDateTime &&
      lineQuotationEndDate &&
      lineQuotationEndDate !== itemViewDate.quotationEndDate
    ) {
      const date = {};
      date.now = rankChartCurrentDateTime;
      date.quotationEndDate = lineQuotationEndDate;

      this.recordItemCountDate(date);
    }

    let quotationRankResultDTOS;
    if (quotationRankDTOS?.length) {
      quotationRankResultDTOS = quotationRankDTOS.map((item) => {
        const { quotationLineId = null } = item || {};
        const mappingLine = gridData.find(
          (rankItem) => rankItem.quotationLineId === quotationLineId
        );

        return {
          ...item,
          rank: item?.rank ? item?.rank : mappingLine?.rank,
        };
      });
    }

    if (!isEmpty(quotationRankDTOS)) {
      quotationRankDTOS.forEach((item = {}) => {
        const { selfFlag = 0, rank = null } = item || {};
        if (selfFlag === 1) {
          this.rank = rank;
        }
      });
    }

    this.setState({
      chartData: rankChartDTOS,
      gridData: quotationRankResultDTOS,
    });
  }

  // 记录物料行-倒计时时间
  recordItemCountDate(itemViewDate = {}) {
    this.setState({ itemViewDate });
  }

  /**
   * 新建阶梯报价
   */
  @Bind()
  createLadderQuot(quotationLineId = undefined) {
    const {
      dispatch,
      organizationId,
      supplierQuotation: { quotationHeader = {}, fetchLadderList = [] },
    } = this.props;

    const newLine = {
      quotationLineId,
      ladderQuotationId: uuidv4(),
      rfxLadderLineNum: undefined,
      ladderFrom: undefined,
      ladderTo: undefined,
      tenantId: organizationId,
      currentLadderPrice: undefined,
      validLadderPrice: undefined,
      validBargainPrice: undefined,
      currencyCode: quotationHeader?.currencyCode,
      _status: 'create',
    };

    if (!isEmpty(fetchLadderList)) {
      // 上一行的至作为下行的从
      const lastLine = fetchLadderList[fetchLadderList.length - 1] || {};
      const nextLineLadderFrom = lastLine.$form ? lastLine.$form?.getFieldValue('ladderTo') : null;
      newLine.ladderFrom = nextLineLadderFrom;
    }

    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        fetchLadderList: [...fetchLadderList, newLine],
      },
    });
  }

  /**
   * 校验阶梯报价
   * ①增加校验1：是否需求数量存在对应阶梯，没匹配到则保存成功，基准价对应单价可编辑修改；
   * ②匹配到有对应阶梯进行校验2：对应阶梯&行上填写单价与阶梯内单价是否一致，不一致时提示：采购方需求数量为{$需求数量}，确定将行上填写的单价改为{$对应阶梯的单价}吗？；点击确定后，根据基准价将单价带出至对应行上单价字段，且行上单价字段置灰不可编辑
   * @returns
   */
  @Debounce(1800)
  @Bind()
  async validateLadderQuotation(quotationLineId) {
    const { dispatch } = this.props;
    const {
      ladderListHeaderInfo: { diyLadderQuotationFlag },
    } = this.state;
    const params = this.getLadderParams();
    if (isEmpty(params)) {
      return;
    }

    const doValidate = () => {
      return dispatch({
        type: 'supplierQuotation/validateLadderQuotation',
        payload: {
          rfxLadderQuotationList: params,
          quotationLineId,
        },
      });
    };

    const doSubmit = () => {
      if (diyLadderQuotationFlag === 1) {
        return this.saveLadderQuot(quotationLineId);
      }
      return this.haeSaveData(quotationLineId);
    };

    const ValidateResult = getResponse(await doValidate());
    if (!ValidateResult) {
      return;
    }
    validatorConfirmModal({
      response: ValidateResult,
      validatorType: 'highestValidatorType',
      validatorArrName: 'validateResults',
      onOk: throttle(async () => {
        await doSubmit();
      }, 1200),
    });
  }

  // 获取阶梯报价保存参数
  getLadderParams() {
    const {
      supplierQuotation: { fetchLadderList = [] },
    } = this.props;
    const {
      ladderListHeaderInfo: { diyLadderQuotationFlag },
    } = this.state;
    if (diyLadderQuotationFlag === 1) {
      const newParams = getEditTableData(fetchLadderList, ['ladderQuotationId']);
      if (!isEmpty(newParams)) {
        return newParams.map((item, index) => {
          return {
            ...item,
            rfxLadderLineNum: index + 1,
          };
        });
      }
      return [];
    } else {
      return getEditTableData(fetchLadderList);
    }
  }

  // 保存阶梯报价
  @Bind()
  haeSaveData(quotationLineId = undefined) {
    const { dispatch } = this.props;
    const params = this.getLadderParams();
    if (!isEmpty(params)) {
      dispatch({
        type: 'supplierQuotation/saveLadderList',
        payload: {
          params,
          quotationLineId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: 'supplierQuotation/fetchLadderList',
            payload: {
              quotationLineId,
            },
          });
        }
      });
    }
  }

  /**
   * 阶梯报价-保存(当数量从和数量至也可以编辑时的保存)
   */
  @Bind()
  saveLadderQuot(quotationLineId = undefined) {
    const { dispatch } = this.props;
    const { ladderLevelSelectedRowKeys = [] } = this.state;
    const params = this.getLadderParams();
    if (!isEmpty(params)) {
      dispatch({
        type: 'supplierQuotation/saveLadderList',
        payload: { params, quotationLineId },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'supplierQuotation/fetchLadderList',
            payload: { quotationLineId },
          });
          notification.success();
          if (!isEmpty(ladderLevelSelectedRowKeys)) {
            this.setState({
              ladderLevelSelectedRows: [],
              ladderLevelSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 阶梯报价 - 批量删除
   */
  @Throttle(1200)
  @Bind()
  deleteLadderQuot(quotationLineId = undefined) {
    const {
      dispatch,
      supplierQuotation: { fetchLadderList = [] },
    } = this.props;
    const { ladderLevelSelectedRows } = this.state;

    // 过滤出勾选数据(非新建行)
    const newParameters = filter(ladderLevelSelectedRows, (item) => {
      return item._status !== 'create';
    });
    // 过滤出数据(非新建行item._status !== 'create')
    const newLadderLevel = filter(fetchLadderList, (item) => {
      return item._status !== 'create';
    });
    // 正常的最后几条
    const endLadderList = newLadderLevel.slice(newLadderLevel.length - newParameters.length);
    // 二者相同项
    const commonLadderList = filter(endLadderList, (item) => {
      return newParameters.find((param) => param.rfxLadderLineNum === item.rfxLadderLineNum);
    });

    // 勾选数据与保存数据对比
    if (
      // newParameters.length < fetchLadderList.length &&
      // newParameters[newParameters.length - 1].rfxLadderLineNum <
      // fetchLadderList[fetchLadderList.length - 1].rfxLadderLineNum
      newParameters.length &&
      newParameters.length < newLadderLevel.length &&
      commonLadderList.length < newParameters.length
    ) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.onlySelectedLast`)
          .d('只能从最后一行已保存行开始删除!'),
      });
    } else {
      Modal.confirm({
        title: intl.get('ssrc.supplierQuotation.message.confirm.remove').d('确定删除该条数据?'),
        onOk: () => {
          const remoteDelete = [];
          const localDelete = [];
          newParameters.forEach((item) => {
            if (item._status === 'create') {
              localDelete.push(item);
            }
            if (item._status === 'update') {
              remoteDelete.push(item);
            }
          });
          if (isEmpty(remoteDelete)) {
            dispatch({
              type: 'supplierQuotation/updateState',
              payload: {
                fetchLadderList: newLadderLevel,
              },
            });
            this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
          } else {
            dispatch({
              type: 'supplierQuotation/deleteLadderQuot',
              payload: { remoteDelete, quotationLineId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'supplierQuotation/fetchLadderList',
                  payload: {
                    quotationLineId,
                  },
                });
                this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
              }
            });
          }
        },
      });
    }
  }

  // 校验/获取第二视图数据
  validateAndGetBiddingOfferData = () => {
    const {
      form,
      supplierQuotation: { biddingQuotationLine = {}, quotationHeader },
    } = this.props;
    const { objectVersionNumber = null, quotationLineId = null } = biddingQuotationLine;
    let error = false;
    let rfxQuotationHeader = null;
    let rfxQuotationLine = null;
    const wsVersionNumber = (this.objectVersionNumber || {})[quotationLineId];

    // header form
    form.validateFields((err, values) => {
      if (err) {
        error = true;
        // return;
      }
      rfxQuotationHeader = { ...quotationHeader, ...(values || {}) };
    });

    const quotationForm = this.getQuotationFormRefForm();
    if (!quotationForm?.validateFieldsAndScroll) {
      error = true;
      return { error };
    }
    // quotation from
    quotationForm.validateFieldsAndScroll((err, values = {}) => {
      if (err) {
        error = true;
      }

      const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values || {};

      rfxQuotationLine = [
        {
          ...biddingQuotationLine,
          ...(values || {}),
          objectVersionNumber:
            wsVersionNumber > objectVersionNumber ? wsVersionNumber : objectVersionNumber,
          roundNumber: quotationHeader.roundNumber,
          currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MIN),
          currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
        },
      ];
    });

    return {
      error,
      rfxQuotationHeader,
      rfxQuotationLine,
      customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
    };
  };

  // 如果是分标段，则组件内部提供查询
  refreshSectionAndCurrentPage = async () => {
    if (!isEmpty(this.SectionRef)) {
      const { refreshSectionAndMain = () => {} } = this.SectionRef;
      await refreshSectionAndMain();
    }
  };

  // 清除报价行数据源
  clearQuotationLineTableStore = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        quotationLines: [],
        quotationLinePagination: {},
      },
    });
  };

  // 切换试图-报价表单重制
  resetQuotationFormField = () => {
    const { form } = this.quotationFormRef?.props || {};
    if (form) {
      form.resetFields();
    }
  };

  /**
   * 保存竞价单详情页面行列表：无批量保存
   */
  @Throttle(2000)
  @Bind()
  async saveBiddingOffer() {
    const {
      dispatch,
      form = {},
      supplierQuotation: { biddingQuotationLine = {} },
    } = this.props;
    const { quotationLineId } = biddingQuotationLine || {};
    const AllData = this.validateAndGetBiddingOfferData();

    await dispatch({
      type: 'supplierQuotation/saveQuotationLines',
      payload: AllData,
    }).then(async (res) => {
      form.resetFields();
      this.resetQuotationFormField();

      this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
      if (res) {
        notification.success();
        // 分页保存/保存按钮保存,查询行数据和头数据
        const sectionFlag = this.isBidSectionData();
        if (sectionFlag) {
          await this.refreshSectionAndCurrentPage();
          return;
        }
        const { rfxId: quotationHeaderId } = this.state;
        this.clearQuotationLineTableStore();
        this.setState({
          newBiddingLineColumns: [],
        });
        this.queryQuotationLines();
        // 查询报价单头
        this.fetchHeader();
        // 根据 quotationLineId 进行接口查询 竞价行
        dispatch({
          type: 'supplierQuotation/queryBiddingQuotationLine',
          payload: {
            quotationHeaderId,
            quotationLineIds: biddingQuotationLine.quotationLineId,
            customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
          },
        });
        this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
      }
    });
  }

  // 第二视图数据校验和整合
  validateAndGetBiddingOfferDataForSubmit = (othersData = {}) => {
    const {
      form,
      supplierQuotation: { biddingQuotationLine = {}, quotationHeader = {} },
    } = this.props;
    const { objectVersionNumber = null, quotationLineId = null } = biddingQuotationLine || {};
    let error = false;
    let rfxQuotationHeader = null;
    let rfxQuotationLines = null;
    const wsVersionNumber = (this.objectVersionNumber || {})[quotationLineId];

    const quotationForm = this.getQuotationFormRefForm();
    if (!quotationForm) {
      error = true;
      return { error };
    }

    form.validateFields((err, values) => {
      if (err) {
        error = true;
        notification.warning({
          message: intl
            .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
            .d('提交前请填写完整相关信息'),
        });
        return { error };
      }

      rfxQuotationHeader = { ...quotationHeader, ...(values || {}) };
    });

    const abandonedFlag = quotationForm.getFieldValue('abandonedFlag');
    if (abandonedFlag === 1) {
      rfxQuotationLines = [{ ...(biddingQuotationLine || {}), abandonedFlag: 1 }];
    } else {
      quotationForm.validateFieldsAndScroll((err, values = {}) => {
        if (err) {
          error = true;
          notification.warning({
            message: intl
              .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
              .d('提交前请填写完整相关信息'),
          });
          return;
        }

        const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values;
        rfxQuotationLines = [
          {
            ...biddingQuotationLine,
            ...(values || {}),
            objectVersionNumber:
              wsVersionNumber > objectVersionNumber ? wsVersionNumber : objectVersionNumber,
            roundNumber: quotationHeader.roundNumber,
            currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
            currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MIN),
            currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
          },
        ];
      });
    }

    const lowestQuotationRangeFlag = this.lowestQuotationRange(rfxQuotationLines);
    if (!lowestQuotationRangeFlag) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quoteThanRange`)
          .d('报价金额不符合报价幅度金额!'),
      });
      error = true;
      return;
    }

    return {
      error,
      rfxQuotationHeader,
      rfxQuotationLines,
      customizeUnitCode:
        'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM,SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
      quotationHeaderId: quotationHeader.quotationHeaderId,
      allSubmitFlag: 0,
      ...othersData,
    };
  };

  // 第二视图-提交-不区分标段
  submitBiddingOfferSingle = (options = {}) => {
    const { dispatch, biddingOfferRemote } = this.props;
    const { error = false, ...othersData } = this.validateAndGetBiddingOfferDataForSubmit() || {};
    const { outData = {}, outPassFlag = 0 } = options || {};
    if (error || isEmpty(othersData)) {
      return;
    }

    const commonSubmitData = {
      ...(othersData || {}),
      ...(outData || {}),
      passFlag: 1,
    };

    const doValidate = () => {
      const newValidate = {
        ...commonSubmitData,
        passFlag: outPassFlag,
      };
      return dispatch({
        type: 'supplierQuotation/validateQuotationSubmit',
        payload: newValidate,
      });
    };
    const doSubmit = () => {
      this.handleSubmitBiddingOfferAndReturn(commonSubmitData).then((res) => {
        this.handleSubmitBiddingOfferAfter(res, options);
      });
    };

    this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
    doValidate().then((validateResult) => {
      const result = getResponse(validateResult);
      if (result && !result.failed) {
        const validateModalProps = {
          response: validateResult,
          successCallBack: () => doSubmit(),
          warningOk: () => doSubmit(),
          overrideSubmitWarninOkOperate: (warningResponse) =>
            this.overrideSubmitWarninOkOperate(warningResponse),
        };

        const currentValidateModalProps = biddingOfferRemote
          ? biddingOfferRemote.process(
              'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_FIRST_VIEW_SUBMIT_VALIDATE_MODAL_PROPS_DETAIL_VIEW',
              validateModalProps,
              {
                data: commonSubmitData,
              }
            )
          : validateModalProps;
        validateModal(currentValidateModalProps);
      }
    });
  };

  // 第二视图-提交-返回
  handleSubmitBiddingOfferAndReturn = (data = {}) => {
    const { dispatch } = this.props;

    return dispatch({
      type: 'supplierQuotation/submitQuotationLines',
      payload: data,
    });
  };

  // 第二视图-提交后
  handleSubmitBiddingOfferAfter = (res = null, options = {}) => {
    const {
      supplierQuotation: { quotationHeader: { detailPriceControlRule = null } = {} },
      form,
      biddingOfferRemote,
    } = this.props;
    const { inquiryDetail = false, currentRecord = {} } = this.state;
    const { quotationLineId, quotationHeaderId } = currentRecord || {};
    const { from = null } = options || {};

    const warnigSubmit = (response = {}) => {
      notification.warning({
        message: response?.message,
      });
    };

    const afterSubmit = (result = null) => {
      if (result && !result.failed) {
        if (from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
          this.directionSupplierQuotationList();
          return;
        }
        form.resetFields();
        this.resetQuotationFormField();
        this.quotationFormResetFields();
        notification.success();
        this.fetchHeader();
        this.queryQuotationLines();

        if (inquiryDetail) {
          this.queryBiddingQuotationLine({ quotationLineId }); // form view
        }
        this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
        this.querySupplierRank();
      } else {
        notification.warning({
          message: result?.message,
        });
      }
    };

    // 弱管控-modal-ok
    const weakPriceControllerHandleModalOk = () => {
      const sectionSelectedFlag = this.sectionSelectedFlag();
      if (sectionSelectedFlag) {
        this.submitDetailBiddingOfferSection({ weakCtrlConfirmFlag: 1 });
        return;
      }

      const { error = false, ...othersData } =
        this.validateAndGetBiddingOfferDataForSubmit({
          weakCtrlConfirmFlag: 1,
        }) || {};
      if (error || isEmpty(othersData)) {
        return;
      }

      this.handleSubmitBiddingOfferAndReturn(othersData).then((result) => {
        if (result && result.failed) {
          warnigSubmit(result);
        } else {
          afterSubmit(result);
        }
      });
    };

    this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
    if (res && res.failed) {
      const { code, quotationSubmitErrorCenterModalWarningFlag = 0 } = res || {};

      /**
       * 中心弹窗提示
       * */
      let quotationSubmitErrorCenterModalWarning =
        quotationSubmitErrorCenterModalWarningFlag === 1 ||
        quotationSubmitErrorCenterModalWarningFlag === '1';

      quotationSubmitErrorCenterModalWarning = biddingOfferRemote
        ? biddingOfferRemote.process(
            'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_HANDLESUBMITBIDDINGOFFERAFTER_CENTER_MODAL_WARNING_FLAG',
            quotationSubmitErrorCenterModalWarning,
            {
              res,
              that: this,
            }
          )
        : quotationSubmitErrorCenterModalWarning;

      if (['EQUAL_WEAK', 'WEAK'].includes(detailPriceControlRule)) {
        const weakControlFlag =
          code === 'ssrc.quotation.quotation_detail_weak_control' ||
          code === 'error.ssrc.quotation.quotation_detail_equal_weak_control'; // HACK 临时方案,前后端优化
        if (code && weakControlFlag) {
          Modal.confirm({
            content: res?.message,
            onOk: () => weakPriceControllerHandleModalOk(),
          });
          return;
        }
        warnigSubmit(res);
      } else if (
        quotationSubmitErrorCenterModalWarning ||
        ['EQUAL_STRONG', 'STRONG'].includes(detailPriceControlRule)
      ) {
        Modal.warning({
          content: res?.message,
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
      } else {
        warnigSubmit(res);
      }
    } else {
      afterSubmit(res);
    }
  };

  // 第二视图-提交-多标段
  submitDetailBiddingOfferSection = (othersData = {}) => {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null } = quotationHeader;
    if (!projectLineSectionId) {
      return;
    }

    const { error, ...currentData } = this.validateAndGetBiddingOfferDataForSubmit() || {};
    if (error || isEmpty(currentData)) {
      return;
    }
    const projectLineSectionList = getCheckedSectionList();
    const currentIndex = projectLineSectionList.findIndex(
      (item) => item.projectLineSectionId === projectLineSectionId
    );

    let integrationCurrentData = {};
    if (currentIndex > -1) {
      integrationCurrentData = currentData;
    }

    const data = {
      ...integrationCurrentData,
      projectLineSectionList,
      ...othersData,
    };

    this.handleQuotationSectionBatchSubmit(data);
  };

  // 多标段-勾选flag
  sectionSelectedFlag = () => {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty = () => {} } = this.SectionRef;
    const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据

    return isBatchMaintainSection && !checkedFlag;
  };

  /**
   * 单行提交竞价单详情
   */
  @Throttle(2000)
  @Bind()
  submitBiddingOffer() {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty } = this.SectionRef;
    const isBidSectionData = this.isBidSectionData(); // 分标段
    const { visible = false, config = {} } = this.judgeCurrentUserConfig(
      'sectionSupplierBiddingOfferSelectWarning'
    );

    if (isBidSectionData) {
      const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
      const needWarningUserConfig =
        (!isBatchMaintainSection || (isBatchMaintainSection && checkedFlag)) && visible;
      if (needWarningUserConfig) {
        this.setState({
          batchEmptySelectSectionFlag: true,
          userConfig: config,
          batchOperateType: 'supplierQuotationDetailView',
        });
        return;
      }
      // 区分标段, 批量勾选
      if (isBatchMaintainSection && !checkedFlag) {
        this.submitDetailBiddingOfferSection();
      } else {
        this.submitBiddingOfferSingle();
      }
    } else {
      this.submitBiddingOfferSingle(); // normal supplier quotation submit
    }
  }

  // 分标段-整合数据
  integrationSectionData = () => {
    const {
      form,
      supplierQuotation: { quotationLines = {}, quotationHeader = {} },
    } = this.props;
    const { selectedRows = [], selectedRowKeys = [] } = this.state;
    const sectionFlag = this.getBidSectionFlag();

    // let validateFlag = true;
    let header = quotationHeader;
    let lines = [];

    let currencyCode = null;
    form.validateFields((err, values = {}) => {
      // if (err) {
      //   validateFlag = false;
      //   return;
      // }
      currencyCode = values.currencyCode || null;
      header = { ...header, ...values };
    });

    const tempData = quotationLines ? quotationLines.content : [];
    // 保存时判断selectRows是否为[]; case [*, *]: 保存勾选行, default: 保存全部行
    const saveData = selectedRows && selectedRows[0] ? selectedRows : tempData;
    lines = saveData.map((lineList) => {
      const { quotationLineId } = lineList;
      let obj = {};
      lineList.$form.validateFields((err, values) => {
        const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values;
        let actionSectionSelectedFlag = 0;
        if (!isEmpty(selectedRowKeys) && sectionFlag) {
          const exitData = selectedRowKeys.filter(
            (rowKey) => quotationLineId && rowKey === quotationLineId
          );

          actionSectionSelectedFlag = isEmpty(exitData) ? 0 : 1;
        }

        obj = {
          ...values,
          currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MIN),
          currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
          actionSectionSelectedFlag,
        };

        if (err) {
          obj = {
            ...values,
            currentPromisedDate: err.currentPromisedDate
              ? null
              : dateFormate(currentPromisedDate, DATETIME_MIN),
            currentQuotationPrice: err.currentQuotationPrice ? null : values.currentQuotationPrice,
            // currentQuotationQuantity: err.currentQuotationQuantity
            //   ? null
            //   : values.currentQuotationQuantity,
            currentExpiryDateFrom: err.currentExpiryDateFrom
              ? null
              : dateFormate(currentExpiryDateFrom, DATETIME_MIN),
            currentExpiryDateTo: err.currentExpiryDateTo
              ? null
              : dateFormate(currentExpiryDateTo, DATETIME_MIN),
            actionSectionSelectedFlag,
            ...obj,
          };
        }
      });
      return {
        ...lineList,
        ...obj,
        taxRate: obj.taxRate ?? lineList.taxRate,
        currencyCode,
      };
    });

    return {
      header,
      lines,
    };
  };

  // 报价表格-row-select
  handleTableRowSelect = (selectedLineKeys = [], selectedLines = []) => {
    this.setState({
      selectedRowKeys: selectedLineKeys,
      selectedRows: selectedLines,
    });
  };

  // 分标段-保存
  // 分标段的竞价单保存必须勾选，后续批量提交使用
  saveSectionData = async () => {
    const { selectedRowKeys = [], inquiryDetail = false } = this.state;

    if (inquiryDetail) {
      // // 第二视图
      // const { error = false } = this.validateAndGetBiddingOfferData();
      // if (error) {
      //   return !error;
      // }

      await this.saveBiddingOffer();
      return true;
    }

    const data = this.integrationSectionData();

    const { visible = false, config = {} } = this.judgeCurrentUserConfig(
      'sectionSupplierBiddingOfferSaveWarning'
    );
    if (visible && isEmpty(selectedRowKeys)) {
      const { header = {}, lines = [] } = data;

      this.setState({
        batchEmptySelectSectionFlag: true,
        userConfig: config,
        batchOperateType: 'supplierBiddingOfferSave',
        pageDataToSaved: {
          header,
          lines,
        },
      });

      return true;
    }

    if (!data && !visible) {
      return true;
    }

    const { header = {}, lines = [] } = data;
    this.saved({ header, lines });
    return true;
  };

  // save
  saved = (data = {}, options = {}) => {
    const { dispatch } = this.props;
    const { header: rfxQuotationHeader = {}, lines: rfxQuotationLine = [] } = data || {};
    const { needRefresh = true } = options || {};

    dispatch({
      type: 'supplierQuotation/saveQuotationLines',
      payload: {
        rfxQuotationHeader,
        rfxQuotationLine,
        customizeUnitCode:
          'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM,SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
      },
    }).then((res) => {
      if (!res) {
        return false;
      }

      this.setState({
        batchOperateType: null,
      });
      if (needRefresh) {
        const { refreshSectionAndMain = () => {} } = this.SectionRef;
        refreshSectionAndMain();
      }
    });

    return true;
  };

  /**
   * 主页面保存
   */
  @Throttle(2000)
  @Bind()
  saveAllBiddingOffer(page = {}, record) {
    return new Promise((resolve, reject) => {
      const SectionFlag = this.isBidSectionData();
      if (SectionFlag) {
        this.saveSectionData()
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            reject();
          });
        return;
      }

      const {
        dispatch,
        supplierQuotation: { quotationLinePagination = {} },
      } = this.props;
      const { selectedRows = [], selectedRowKeys = [] } = this.state;
      const { ...data } = this.integrateMainPageData();

      dispatch({
        type: 'supplierQuotation/saveQuotationLines',
        payload: data,
      }).then((res) => {
        if (res) {
          resolve(true);
          notification.success();
          const { rfxId: quotationHeaderId } = this.state;
          this.setState({
            supplierDataChange: false,
            newBiddingLineColumns: [],
          });
          // 保存按钮保存后，若selectedRows或者selectedRowKeys有值，清空，避免二次保存或者提交，版本不一致
          if (!isEmpty(selectedRows) || !isEmpty(selectedRowKeys)) {
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
          }
          // 查询报价单头
          this.fetchHeader();
          // 点击报价保存后，设置对应的状态和查询详情和环比价历史接口
          if (!isEmpty(record)) {
            const { quotationLineId } = record || {};
            // 查询行数据,更新左边行税率
            dispatch({
              type: 'supplierQuotation/queryQuotationLines',
              payload: {
                quotationHeaderId,
                page: !isEmpty(page) ? page : quotationLinePagination,
                customizeUnitCode:
                  'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
              },
            }).then((response) => {
              if (response) {
                this.dataProcessing();
              }
              this.afterQueryLineFetchRank();
            });
            this.setState({
              expand: {
                [record.rfxLineItemNum]: [record.rfxLineItemNum],
              },
              currentRecord: record,
              inquiryTableReadOnly: false,
              inquiryDetail: true,
            });
            // 隐藏当前列表页,打开详情页
            // 根据 quotationLineId 进行接口查询 竞价行
            dispatch({
              type: 'supplierQuotation/queryBiddingQuotationLine',
              payload: {
                quotationHeaderId,
                quotationLineIds: record.quotationLineId,
                customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
              },
            });
            this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
            // 查询还比价历史接口
            dispatch({
              type: 'supplierQuotation/queryQuotationLineDetail',
              payload: {
                quotationLineId: record.quotationLineId,
              },
            });
          } else {
            // 分页保存/保存按钮保存,查询行数据和头数据
            dispatch({
              type: 'supplierQuotation/queryQuotationLines',
              payload: {
                quotationHeaderId,
                page: !isEmpty(page) ? page : quotationLinePagination,
                customizeUnitCode:
                  'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
              },
            }).then((response) => {
              if (response) {
                this.dataProcessing();
              }
              this.afterQueryLineFetchRank();
            });
          }
        }
        reject();
      });
    });
  }

  // 保存-主页面
  @Bind()
  async saveMainPage() {
    const { rfxQuotationHeader, rfxQuotationLine } = this.integrateMainPageData();
    let result = true;

    try {
      result = await this.saved(
        { header: rfxQuotationHeader, lines: rfxQuotationLine },
        { needRefresh: false }
      );
    } catch (e) {
      throw e;
    }

    return result;
  }

  // 整合主页面数据
  integrateMainPageData() {
    const {
      form,
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { selectedRows = [], newBiddingLineColumns } = this.state;

    const headerData = form.getFieldsValue() || {};
    const { currencyCode } = headerData;
    const tempData = newBiddingLineColumns;
    // add by Goku
    // 保存时判断selectRows是否为[]; case [*, *]: 保存勾选行, default: 保存全部行
    const saveData = selectedRows && selectedRows[0] ? selectedRows : tempData;
    const params = saveData.map((lineList) => {
      let obj = {};
      // eslint-disable-next-line no-unused-expressions
      lineList?.$form?.validateFields((err, values) => {
        const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values;
        // if (err) {
        //   obj = {
        //     ...values,
        //     currentPromisedDate: err.currentPromisedDate
        //       ? null
        //       : dateFormate(currentPromisedDate, DATETIME_MIN),
        //     currentQuotationPrice: err.currentQuotationPrice ? null : values.currentQuotationPrice,
        //     currentQuotationQuantity: err.currentQuotationQuantity
        //       ? null
        //       : values.currentQuotationQuantity,
        //     currentExpiryDateFrom: err.currentExpiryDateFrom
        //       ? null
        //       : dateFormate(currentExpiryDateFrom, DATETIME_MIN),
        //     currentExpiryDateTo: err.currentExpiryDateTo
        //       ? null
        //       : dateFormate(currentExpiryDateTo, DATETIME_MIN),
        //   };
        // } else {
        //   obj = {
        //     ...values,
        //     currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
        //     currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MIN),
        //     currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
        //   };
        // }

        obj = {
          ...values,
          currentQuotationPrice: err?.currentQuotationPrice ? null : values.currentQuotationPrice,
          // currentQuotationQuantity: err?.currentQuotationQuantity
          //   ? null
          //   : values.currentQuotationQuantity,
          currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MIN),
          currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
        };
      });
      return {
        ...lineList,
        ...obj,
        taxRate: obj.taxRate ?? lineList.taxRate,
        currencyCode,
      };
    });

    return {
      rfxQuotationHeader: { ...quotationHeader, ...headerData },
      rfxQuotationLine: params,
      customizeUnitCode:
        'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM,SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
    };
  }

  /**
   * 最低报价幅度金额计算
   */
  @Bind()
  lowestQuotationRange(params) {
    let mean = '';
    let newParams = [];
    const {
      supplierQuotation: {
        quotationHeader: { auctionDirection, continuousQuotationFlag },
      },
    } = this.props;
    // continuousQuotationFlag 如果寻源模板里配置了连续报价为否，则不需要前端去校验
    if (isEmpty(params) || continuousQuotationFlag === 0) {
      return true;
    }

    if (Array.isArray(params)) {
      newParams = params;
    } else {
      newParams.push(params);
    }
    newParams.forEach((item) => {
      const {
        floatType = null,
        quotationRange = null,
        validQuotationPrice = null,
        currentQuotationPrice = null,
        abandonedFlag = 0,
      } = item || {};

      if (floatType && quotationRange && abandonedFlag !== 1) {
        if (validQuotationPrice) {
          if (floatType === 'money') {
            const minMoney = math.minus(validQuotationPrice, quotationRange);
            const maxMoney = math.plus(validQuotationPrice, quotationRange);
            switch (auctionDirection) {
              case 'REVERSE':
                mean = math.lte(currentQuotationPrice, minMoney);
                break;
              case 'FORWARD':
                mean = math.gte(currentQuotationPrice, maxMoney);
                break;
              case 'NONE':
                mean =
                  math.gte(currentQuotationPrice, maxMoney) ||
                  math.lte(currentQuotationPrice, minMoney);
                break;
              default:
                break;
            }
          } else {
            const dutchQuotation = math.minus(
              validQuotationPrice,
              math.multipliedBy(validQuotationPrice, math.div(quotationRange, 100))
            );
            const englishQuotation = math.plus(
              validQuotationPrice,
              math.multipliedBy(validQuotationPrice, math.div(quotationRange, 100))
            );
            switch (auctionDirection) {
              case 'REVERSE':
                mean = math.lte(currentQuotationPrice, dutchQuotation);
                break;
              case 'FORWARD':
                mean = math.gte(currentQuotationPrice, englishQuotation);
                break;
              case 'NONE':
                mean =
                  math.gte(currentQuotationPrice, englishQuotation) ||
                  math.lte(currentQuotationPrice, dutchQuotation);
                break;
              default:
                break;
            }
          }
        } else {
          mean = true;
        }
      } else {
        mean = true;
      }
    });
    return mean;
  }

  // 报价表格row select
  quotationLineSelect = (selectedLineKeys = [], selectedLines = []) => {
    this.setState({
      selectedRowKeys: selectedLineKeys,
      selectedRows: selectedLines,
    });
  };

  // 分标段-批量提交成功-处理
  handleBatchSectionSubmitSucceed = () => {
    const { refreshSectionAndMain = () => {} } = this.SectionRef;
    this.quotationLineSelect();
    refreshSectionAndMain();
  };

  // 提交前校验
  async quotationSectionBatchValidation(data = {}) {
    const { dispatch } = this.props;
    let result = null;

    let validationResult = await dispatch({
      type: 'supplierQuotation/validateQuotationSubmit',
      payload: data,
    });
    validationResult = getResponse(validationResult);
    if (!validationResult) {
      return result;
    }
    result = isArray(validationResult) && !isEmpty(validationResult) ? validationResult[0] : null;
    return result;
  }

  // 分标段-批量提交-前置处理数据
  handleIntegrationSectionBatchSubmit = async (otherProps = {}) => {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { selectedRowKeys = [] } = this.state;

    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null, quotationHeaderId } = quotationHeader;
    if (!projectLineSectionId) {
      return;
    }

    let currentData = {};
    const projectLineSectionList = getCheckedSectionList();
    const currentIndex = projectLineSectionList.findIndex(
      (item) => item.projectLineSectionId === projectLineSectionId
    );
    if (currentIndex > -1) {
      currentData = this.integrationPageDataForMain();
      // if (isEmpty(selectedRowKeys)) {
      //   notification.warning({
      //     message: intl
      //       .get(`ssrc.supplierQuotation.model.supQuo.noSelectedRows`)
      //       .d('未选择提交行，无法提交!'),
      //   });
      //   return;
      // }
    } else {
      notification.warning({
        message: intl
          .get('ssrc.common.view.message.pleaseSelectCurrentSectionLineToSubmit')
          .d('当前标段未勾选，请勾选当前标段或切换到其他已勾选标段后提交'),
      });
      return;
    }

    if (!currentData) {
      return;
    }

    const data = {
      quotationHeaderId,
      allSubmitFlag: isEmpty(selectedRowKeys) ? 1 : 0,
      ...currentData,
      projectLineSectionList,
      ...otherProps,
    };
    // const ValidateResult = await this.quotationSectionBatchValidation(data);
    // if (ValidateResult) {
    //   confirmModal(
    //     ValidateResult,
    //     () => this.handleQuotationSectionBatchSubmit(data),
    //     () => this.afterSubmitResetStatus()
    //   );
    // } else {
    this.handleQuotationSectionBatchSubmit(data);
    // }
  };

  // 提交-分标段-批量勾选
  handleQuotationSectionBatchSubmit = (data = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const { inquiryDetail = false } = this.state;
    const { organizationId, biddingOfferRemote } = this.props;
    this.toggleOperationLoading(true);
    const handleQuotationSectionBatchSubmitFunc = () => {
      quotationSectionBatchSubmit({
        organizationId,
        ...data,
        customizeUnitCode:
          'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM,SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
      }).then((res) => {
        this.toggleOperationLoading(false);
        this.afterSubmitResetStatus();
        const result = getResponse(res);
        if (!isEmpty(result) && Array.isArray(result)) {
          this.setState({
            operateSectionData: result,
            operateSectionPromptFlag: true,
          });
          return;
        }

        notification.success();
        this.handleBatchSectionSubmitSucceed();

        if (inquiryDetail) {
          this.handleSubmitBiddingOfferAfter(result);
        }
      });
    };
    if (biddingOfferRemote?.event) {
      // 给state中设置二开的值
      biddingOfferRemote.event.fireEvent('remoteSectionBatchBeforeSubmit', {
        handleQuotationSectionBatchSubmitFunc,
        toggleOperationLoading: this.toggleOperationLoading,
      });
    } else {
      handleQuotationSectionBatchSubmitFunc();
    }
  };

  // 提交成功-重置一些状态
  afterSubmitResetStatus() {
    this.toggleOperationLoading(false);
    this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
  }

  // 整合页面需要提交的数据
  integrationPageDataForMain = () => {
    const {
      form,
      supplierQuotation: { quotationHeader = {}, quotationLines = [] },
    } = this.props;
    const { selectedRowKeys } = this.state;

    let validateFlag = true;
    let header = {};
    let lines = quotationLines.content || [];
    let currencyCode = null;
    const sectionFlag = this.getBidSectionFlag();

    form.validateFields((err, values = {}) => {
      if (err) {
        validateFlag = false;
        return;
      }
      currencyCode = values.currencyCode || null;
      header = { ...quotationHeader, ...values };
    });

    lines = lines
      .map((item) => {
        let obj = {};
        const { $form, ...otherValues } = item;
        const abandonedFlag = $form.getFieldValue('abandonedFlag');
        if (abandonedFlag === 1) {
          return { ...item, abandonedFlag: 1 };
        }

        let actionSectionSelectedFlag = item?.actionSectionSelectedFlag || 0;
        if (selectedRowKeys.includes(item.quotationLineId) || isEmpty(selectedRowKeys)) {
          $form.validateFields((err, values) => {
            if (err) {
              validateFlag = false;
            }

            if (!isEmpty(selectedRowKeys) && sectionFlag) {
              const exitData = selectedRowKeys.filter(
                (rowKey) => item.quotationLineId && rowKey === item.quotationLineId
              );
              actionSectionSelectedFlag = isEmpty(exitData) ? actionSectionSelectedFlag : 1;
            }

            obj = {
              ...values,
              currentExpiryDateFrom: dateFormate(values.currentExpiryDateFrom, DATETIME_MIN),
              currentExpiryDateTo: dateFormate(values.currentExpiryDateTo, DATETIME_MIN),
              currentPromisedDate: dateFormate(values.currentPromisedDate, DATETIME_MIN),
              actionSectionSelectedFlag,
              taxRate: values.taxRate ?? otherValues.taxRate,
            };
          });
          return {
            ...otherValues,
            ...obj,
            currencyCode,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (!validateFlag) {
      return;
    }

    return {
      rfxQuotationHeader: header,
      quotationHeaderId: quotationHeader.quotationHeaderId,
      rfxQuotationLines: lines,
      selectedRowKeys,
      allSubmitFlag: isEmpty(selectedRowKeys) ? 1 : 0,
    };
  };

  /**
   * 批量提交竞价单列表
   */
  @Throttle(2000)
  @Bind()
  submitAllBiddingOffer() {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty } = this.SectionRef;
    const isBidSectionData = this.isBidSectionData(); // 分标段
    const { visible = false, config = {} } = this.judgeCurrentUserConfig(
      'sectionSupplierBiddingOfferSelectWarning'
    );

    if (isBidSectionData) {
      const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
      const needWarningUserConfig =
        (!isBatchMaintainSection || (isBatchMaintainSection && checkedFlag)) && visible;
      if (needWarningUserConfig) {
        this.setState({
          batchEmptySelectSectionFlag: true,
          userConfig: config,
          batchOperateType: 'supplierQuotation',
        });
        return;
      }
      // 区分标段, 批量勾选
      if (isBatchMaintainSection && !checkedFlag) {
        this.handleIntegrationSectionBatchSubmit();
      } else {
        this.handleSubmit();
      }
    } else {
      this.handleSubmit(); // normal supplier quotation submit
    }
  }

  // 提交竞价
  handleSubmit = (options = {}) => {
    const {
      form,
      dispatch,
      supplierQuotation: { quotationHeader = {} },
      biddingOfferRemote,
    } = this.props;
    const {
      isBatchMaintainSection,
      newBiddingLineColumns = [],
      selectedRows = [],
      selectedRowKeys = [],
    } = this.state;
    const { detailPriceControlRule = '' } = quotationHeader || {};
    const { outData = {}, outPassFlag = 0, from = null } = options || {};

    // const isBidSectionData = this.isBidSectionData();
    // let currencyCode = null;
    const currencyCode = form?.getFieldValue('currencyCode') || quotationHeader?.currencyCode;
    // let fieldsErr = false;
    let lineErr = false;

    // form.validateFields((err, values = {}) => {
    //   if (err) {
    //     fieldsErr = true;
    //     return;
    //   }

    //   currencyCode = values.currencyCode || null;
    // });

    // if (fieldsErr) {
    //   return;
    // }

    const page = {};
    const SubmitData = isEmpty(selectedRows) ? newBiddingLineColumns : selectedRows;
    const params = SubmitData.map((item = {}) => {
      let obj = {};
      const { $form, ...otherValues } = item || {};
      if (!$form || isEmpty($form)) {
        return;
      }
      const abandonedFlag = $form.getFieldValue('abandonedFlag');
      if (abandonedFlag === 1 && !isEmpty(item)) {
        return { ...item, abandonedFlag: 1 };
      }

      $form.validateFields((err, values) => {
        if (err) {
          lineErr = true;
          return;
        }
        obj = {
          ...values,
          currentExpiryDateFrom: dateFormate(values.currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(values.currentExpiryDateTo, DATETIME_MIN),
          currentPromisedDate: dateFormate(values.currentPromisedDate, DATETIME_MIN),
          taxRate: values.taxRate ?? otherValues.taxRate,
        };
      });
      return {
        ...otherValues,
        ...obj,
        currencyCode,
      };
    });

    if (lineErr) {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
      });
      return;
    }

    // if (selectedRows?.length === 0) {
    //   notification.warning({
    //     message: intl
    //       .get(`ssrc.supplierQuotation.model.supQuo.noSelectedRows`)
    //       .d('未选择提交行，无法提交!'),
    //   });
    //   return;
    // }

    const lowestQuotationRangeValidation = this.lowestQuotationRange(params);
    if (!lowestQuotationRangeValidation) {
      notification.warning({
        message: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quoteThanRange`)
          .d('报价金额不符合报价幅度金额!'),
      });
      return;
    }

    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const data = {
        rfxQuotationHeader: { ...quotationHeader, ...values },
        quotationHeaderId: quotationHeader.quotationHeaderId,
        rfxQuotationLines: params,
        selectedRowKeys,
        allSubmitFlag: isEmpty(selectedRowKeys) ? 1 : 0,
        customizeUnitCode:
          'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM,SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
        ...(outData || {}),
      };
      const doSubmit = (otherData = {}) => {
        return dispatch({
          type: 'supplierQuotation/submitQuotationLines',
          payload: {
            ...data,
            ...otherData,
            ...(outData || {}),
            passFlag: 1,
          },
        });
      };

      const doValidate = () => {
        return dispatch({
          type: 'supplierQuotation/validateQuotationSubmit',
          payload: { ...data, passFlag: outPassFlag },
        });
      };

      const warnigSubmit = (response) => {
        notification.warning({
          message: response?.message,
        });
      };

      const afterSuccessSubmit = (res) => {
        if (res && !res.failed) {
          notification.success();

          if (from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
            this.directionSupplierQuotationList();
          }

          const { rfxId: quotationHeaderId } = this.state;
          this.setState({ newBiddingLineColumns: [], supplierDataChange: false });
          this.handleTableRowSelect();
          if (isBatchMaintainSection) {
            this.handleBatchSectionSubmitSucceed();
          }

          // 查询报价单头
          this.fetchHeader();
          // 查询报价行
          dispatch({
            type: 'supplierQuotation/queryQuotationLines',
            payload: {
              quotationHeaderId,
              page,
              customizeUnitCode:
                'SSRC.SUPPLIER_QUOTATION_RFA.LINE,SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
            },
          }).then((queryLineResult) => {
            if (queryLineResult) {
              this.dataProcessing();
            }
            this.afterQueryLineFetchRank();
          });
          // 查询供应商排名
          this.querySupplierRank();
        }
      };

      const handleDoSubmit = () => {
        doSubmit().then((res) => {
          if (res && res.failed) {
            const { code, quotationSubmitErrorCenterModalWarningFlag = 0 } = res || {};

            /**
             * 中心弹窗提示
             * */
            let quotationSubmitErrorCenterModalWarning =
              quotationSubmitErrorCenterModalWarningFlag === 1 ||
              quotationSubmitErrorCenterModalWarningFlag === '1';

            quotationSubmitErrorCenterModalWarning = biddingOfferRemote
              ? biddingOfferRemote.process(
                  'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_HANDLESUBMIT_CENTER_MODAL_WARNING_FLAG',
                  quotationSubmitErrorCenterModalWarning,
                  {
                    res,
                    that: this,
                  }
                )
              : quotationSubmitErrorCenterModalWarning;

            if (['EQUAL_WEAK', 'WEAK'].includes(detailPriceControlRule)) {
              const weakControlFlag =
                code === 'ssrc.quotation.quotation_detail_weak_control' ||
                code === 'error.ssrc.quotation.quotation_detail_equal_weak_control'; // HACK 临时方案,前后端优化
              if (weakControlFlag) {
                Modal.confirm({
                  content: res?.message,
                  onOk: () => {
                    doSubmit({ weakCtrlConfirmFlag: 1 }).then((submitResult) => {
                      if (submitResult && submitResult.failed) {
                        warnigSubmit(submitResult);
                        return;
                      }
                      afterSuccessSubmit(submitResult);
                    });
                  },
                });
                return;
              }
              warnigSubmit(res);
            } else if (
              quotationSubmitErrorCenterModalWarning ||
              ['EQUAL_STRONG', 'STRONG'].includes(detailPriceControlRule)
            ) {
              Modal.warning({
                content: res?.message,
                okText: intl.get('hzero.common.button.ok').d('确定'),
              });
            } else {
              warnigSubmit(res);
            }
            return;
          }

          afterSuccessSubmit(res);
        });
      };

      this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置

      doValidate().then((validateResult) => {
        const ValidateResult = getResponse(validateResult);
        if (!ValidateResult) {
          return;
        }

        const result = getResponse(validateResult);
        if (result && !result.failed) {
          const validateModalProps = {
            response: validateResult,
            successCallBack: () => handleDoSubmit(),
            warningOk: () => handleDoSubmit(),
            overrideSubmitWarninOkOperate: (warningResponse) =>
              this.overrideSubmitWarninOkOperate(warningResponse),
          };

          const currentValidateModalProps = biddingOfferRemote
            ? biddingOfferRemote.process(
                'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_FIRST_VIEW_SUBMIT_VALIDATE_MODAL_PROPS',
                validateModalProps,
                {
                  data,
                }
              )
            : validateModalProps;

          validateModal(currentValidateModalProps);
        }
      });
    });
  };

  // 覆盖提示 如果消息编码代表是整单放弃提示，需要打开弹窗
  // @return int 1 | 0
  overrideSubmitWarninOkOperate = (validateResults = []) => {
    let continueWarningFlag = 1;
    if (isEmpty(validateResults)) {
      return continueWarningFlag;
    }

    const wholeAbandonMessage = validateResults.filter(
      (item) => item?.code === 'error.rfx_quotation_whole_submit_warning_info'
    );
    if (!isEmpty(wholeAbandonMessage)) {
      continueWarningFlag = 0;

      this.handleWholeAbandon({
        from: 'SUBMIT_WARNING_ALL_LINES_ABANDONED',
      });
    }

    return continueWarningFlag;
  };

  /**
   * 查询总价供应商排名
   */
  querySupplierRank() {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { sourceCategory, quotationScope } = quotationHeader;

    if (sourceCategory === 'RFA' && quotationScope === 'ALL_QUOTATION') {
      this.supplierRankTableDS.query();
    }
  }

  /**
   * 保存报价单头附件
   * @param {Object} params - 包含报价单技术附件和商务附件 uuid
   */
  @Bind()
  handleBindOnRef(ref = {}) {
    this.attachmentRef = ref;
  }

  @Bind()
  initUpload(params) {
    const {
      dispatch,
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    dispatch({
      type: 'supplierQuotation/saveHeaderAttachment',
      payload: {
        objectVersionNumber: quotationHeader.objectVersionNumber,
        quotationHeaderId: quotationHeader.quotationHeaderId,
        // businessAttachmentUuid: params.businessAttachmentUuid,
        // techAttachmentUuid: params.techAttachmentUuid,
        currentBusinessAttachmentUuid: params.businessAttachmentUuid,
        currentTechAttachmentUuid: params.techAttachmentUuid,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchHeader();
      }
    });
  }

  /**
   * 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal() {
    this.setState({
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

  /**
   * 报价行 - 放弃复选框
   */
  giveUpQuotationLine = (e, record) => {
    const { target: { checked = 0 } = {} } = e || {};
    const { $form = null } = record || {};

    const currentForm = $form;
    if (!currentForm) {
      return;
    }

    const { setFieldsValue = () => {} } = currentForm || {};
    if (checked) {
      record.totalAmount = null;
      record.netAmount = null;

      setFieldsValue({
        currentQuotationPrice: null,
        netPrice: null,
        totalAmount: null,
        netAmount: null,
      });
    }
  };

  /**
   * 放弃是否被勾选触发的事件
   */
  @Bind()
  setValue(e, record = {}) {
    const quotationForm = this.getQuotationFormRefForm();
    if (!quotationForm) {
      return;
    }

    if (e.target.checked === 1) {
      quotationForm.setFieldsValue({
        abandonedFlag: 1,
        currentQuotationPrice: null,
        netPrice: null,
        // currentExpiryDateFrom: null,
        // currentExpiryDateTo: null,
        totalAmount: null,
        netAmount: null,
      });
      if (record) {
        record.totalAmount = null;
        record.netAmount = null;
      }
      this.updateDetailViewTotalAmount({
        record,
        optionFields: {
          totalAmount: null,
        },
      });
    }
  }

  /**
   * 竞价人颜色高亮-- 暂时不使用此方法
   */
  @Bind()
  rowClassName(record) {
    if (record.selfFlag === 1) {
      const className = style.priceColorStyle;
      return className;
    }
  }

  /**
   * 点击HistoryTable展开table flag变为2
   * 调用个人报价history接口
   */
  @Bind()
  onClickHistoryTableBut() {
    this.setState({ flag: 2 });
    this.fetchQuotationHistory();
  }

  // 查询报价历史表格
  fetchQuotationHistory(param = {}) {
    const { rfxId: quotationHeaderId } = this.state;
    const {
      supplierQuotation: { biddingQuotationLine = {} },
    } = this.props;
    const { rfxLineItemId, supplierCompanyId = null } = biddingQuotationLine;

    this.props.dispatch({
      type: 'supplierQuotation/biddingHistory',
      payload: {
        quotationHeaderId,
        rfxLineItemId,
        supplierCompanyId,
        ...param,
      },
    });
  }

  /**
   * 点击table展开table flag变为1
   */
  @Bind()
  onClickTableBut() {
    this.setState({ flag: 1 });
  }

  /**
   * 点击chart展开chart flag变为0
   */
  @Bind()
  onClickChartBut() {
    this.setState({ flag: 0 });
  }

  // 缓存报价行表格分页信息
  tableCurrentPagination = {};

  /**
   * 表格行信息切换分页
   * @param {Object} page - 分页参数
   */
  @Bind()
  handleTableChange(page = {}) {
    const {
      dispatch,
      match: {
        params: { rfxId: quotationHeaderId = null },
      },
    } = this.props;
    const { supplierDataChange } = this.state;

    if (supplierDataChange) {
      this.tableCurrentPagination = page || {};
      this.saveAllBiddingOffer(page);
    } else {
      dispatch({
        type: 'supplierQuotation/queryQuotationLines',
        payload: {
          quotationHeaderId,
          page,
          customizeUnitCode:
            'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        },
      }).then((res) => {
        if (res) {
          this.dataProcessing();
        }
        this.afterQueryLineFetchRank();
      });
    }
  }

  /**
   * 物料竞价行分页 - changeBiddingLinePagination
   */
  @Bind()
  async changeBiddingLinePagination(current = undefined, pageSize = undefined) {
    const {
      match: {
        params: { rfxId: quotationHeaderId = null },
      },
      form,
    } = this.props;
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;

    // 调用自动保存接口
    await this.saveItemInfo();

    // 切换分页，查询报价行之后的回调操作
    const handleAfterChangePage = async (content) => {
      if (!isEmpty(content) && content.length >= 1) {
        const { quotationLineId, rfxLineItemNum, rfxLineItemId, supplierCompanyId } =
          content[0] || {};
        this.setState({
          currentRecord: content[0],
          expand: {
            [rfxLineItemNum]: [rfxLineItemNum],
          },
        });

        this.queryBiddingQuotationLine({ quotationLineId });
        this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
        this.fetchQuotationHistory({
          rfxLineItemId,
          supplierCompanyId,
        });
        this.recordItemCountDate();

        form.resetFields();
        this.resetQuotationFormField();
        this.quotationFormResetFields();
        await this.rankChart(content[0]);
      }
    };

    // 分页接口获取数据
    this.props
      .dispatch({
        type: 'supplierQuotation/queryQuotationLines',
        payload: {
          quotationHeaderId,
          page: changedPagination,
          customizeUnitCode:
            'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        },
      })
      .then((res) => {
        if (res) {
          this.dataProcessing();
          handleAfterChangePage(res.content);
          this.afterQueryLineFetchRank();
        }
      });
  }

  // 表格确定行数据记录
  tableConfirmLineDataRecord = (quotationLineId = null) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationLines = {} },
    } = this.props;
    const { inquiryDetail } = this.state;

    const { content } = quotationLines || {};
    if (!quotationLineId || !isEmpty(content) || inquiryDetail) {
      return;
    }

    let record = content.filter((line) => line.quotationLineId === quotationLineId);
    record = record?.[0];
    return record;
  };

  /**
   * 点击当前阶梯报价，触发查询, 打开阶梯报价模态框
   * @param {Object} record -openLadder
   */
  @Bind()
  @Debounce(1200)
  async openLadder(record) {
    const { quotationLineId } = record || {};
    if (this.ladderModalCount >= 1) {
      return;
    } else {
      this.ladderModalCount++;
    }
    try {
      const { inquiryDetail = false } = this.state;
      const {
        supplierQuotation: { quotationLinePagination = {} },
      } = this.props;
      if (inquiryDetail) {
        await this.saveBiddingOffer();
      } else {
        await this.saveAllBiddingOffer(quotationLinePagination);
      }
      this.setState({ ladderVisible: true });
      const { dispatch } = this.props;
      dispatch({
        type: 'supplierQuotation/fetchLadderList',
        payload: {
          quotationLineId: record.quotationLineId,
        },
      });
      const newRecord = this.tableConfirmLineDataRecord(quotationLineId) || record;

      this.setState({
        ladderListHeaderInfo: newRecord,
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   *  关闭阶梯报价模态框
   * @param {Object} record -hideLadder
   */
  @Bind()
  hideLadderRecord() {
    this.ladderModalCount = 0;
    const { ladderListHeaderInfo, inquiryDetail = false } = this.state;
    const {
      supplierQuotation: { quotationLinePagination = {} },
    } = this.props;
    this.setState({ ladderVisible: false });
    this.props.dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        fetchLadderList: [],
      },
    });
    this.setState({
      newBiddingLineColumns: [],
    });

    this.fetchHeader();
    this.queryQuotationLines(quotationLinePagination);
    if (inquiryDetail) {
      this.queryBiddingQuotationLine({ quotationLineId: ladderListHeaderInfo.quotationLineId }); // form view
    }
  }

  // 第二视图-查询竞价行信息
  queryBiddingQuotationLine = async (queryParameter = {}) => {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    const { rfxId: quotationHeaderId } = params;
    const { quotationLineId = null, ...otherParams } = queryParameter;

    if (!quotationHeaderId || !quotationLineId) {
      return;
    }
    await dispatch({
      type: 'supplierQuotation/queryBiddingQuotationLine',
      payload: {
        quotationHeaderId,
        quotationLineIds: quotationLineId,
        customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        ...otherParams,
      },
    });

    this.quotationFormResetFields();
  };

  // 第二视图-clear data
  clearDetailViewLine = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        biddingQuotationLine: {},
      },
    });
  };

  // 多标段-切换-查询
  queryDetailView = () => {
    const callback = (content = []) => {
      if (isEmpty(content)) {
        return;
      }

      this.detailViewQuery(content[0]);
    };

    this.clearDetailViewLine();
    this.queryQuotationLines({}, {}, callback);
    this.fetchQuotationListMessage();
  };

  // 设置表单编辑标识
  setSupplierFormChangeEditStatus(supplierFormChangeFlag = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        supplierFormChangeFlag,
      },
    });
  }

  // 第二视图-切换-查询
  detailViewQuery = async (record = {}, otherPayload = {}) => {
    const { rfxLineItemNum = null, quotationLineId = null, quotationHeaderId } = record || {};
    const {
      openDetailFlag = false, // 是否打开详情视图flag
    } = otherPayload || {};

    const inquiryDetailValueObj = openDetailFlag
      ? {
          inquiryTableReadOnly: false,
          inquiryDetail: true,
        }
      : {};

    this.setState({
      expand: {
        [rfxLineItemNum]: [rfxLineItemNum],
      },
      currentRecord: record,
      ...inquiryDetailValueObj,
    });

    this.queryBiddingQuotationLine({ quotationLineId });
    this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    await this.rankChart(record);
  };

  // 行数据变化时
  @Bind()
  hasChangeData() {
    this.setState({
      supplierDataChange: true,
    });
  }

  /**
   * 点击当前报价单行时，触发查询  展开详情信息
   * @param {Object} record - 当前点击的行信息
   */
  @Bind()
  openTableRow(record = {}) {
    const {
      supplierQuotation: { quotationLinePagination = {}, supplierFormChangeFlag = 0 },
    } = this.props;
    const { supplierDataChange } = this.state;
    const { rfxLineItemNum = null, quotationLineId = null, quotationHeaderId, $form } =
      record || {};

    this.recordItemCountDate();

    if (supplierDataChange || supplierFormChangeFlag === 1) {
      Modal.confirm({
        title: intl
          .get(`ssrc.supplierQuotation.view.message.quotationTips`)
          .d('是否需要保存当前所填写的报价信息?'),
        onOk: async () => {
          this.saveAllBiddingOffer(quotationLinePagination, record);
          await this.rankChart(record);
          this.setState({
            expand: {
              [rfxLineItemNum]: [rfxLineItemNum],
            },
            inquiryTableReadOnly: false,
            inquiryDetail: true,
          });
        },
        onCancel: () => {
          if ($form) {
            $form.resetFields();
          }

          this.dynamicChangePrice(record); // recalculate line
          this.setState({
            expand: {
              [rfxLineItemNum]: [rfxLineItemNum],
            },
            // inquiryTableReadOnly: false,
            // inquiryDetail: true,
          });
          // 根据 quotationLineId 进行接口查询 竞价行
          this.queryBiddingQuotationLine({ quotationLineId });
          this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
        },
      });
      this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
    } else {
      this.detailViewQuery(record, { openDetailFlag: true });
    }
  }

  // 报价行物料查询
  fetchQuotationItem(params = {}) {
    if (isEmpty(params)) {
      return;
    }

    const { dispatch, organizationId } = this.props;

    dispatch({
      type: `supplierQuotation/fetchQuotationItem`,
      payload: {
        organizationId,
        customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.ITEM_FORM',
        ...(params || {}),
      },
    });
  }

  /**
   * PS：以前的保存之后调用了很多刷新 和现在的重复 故新开一个
   * 详情视图 切换物料卡片或者详情视图翻页调用的保存操作
   */
  @Bind()
  async saveItemInfo() {
    const { modelName = 'supplierQuotation' } = this.props;
    const { dispatch, form = {} } = this.props;
    this.toggleOperationLoading(true);
    const AllData = this.validateAndGetBiddingOfferData();
    await dispatch({
      type: `${modelName}/saveQuotationLines`,
      payload: AllData,
    })
      .then(async (res) => {
        form.resetFields();
        this.resetQuotationFormField();
        this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
        if (res) {
          notification.success();
          // 查询报价单头
          this.fetchHeader();
        }
        this.toggleOperationLoading(false);
      })
      .catch(() => {
        this.toggleOperationLoading(false);
      });
  }

  /**
   * 打开物料行详情页
   */
  @Bind()
  async openTableDetail(item = {}) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      form = {},
      [modelName]: { biddingQuotationLine = {}, quotationLinePagination = {} },
    } = this.props;

    if (biddingQuotationLine?.quotationLineId === item.quotationLineId) {
      return;
    }

    // 切换物料之前先保存当前物料，若保存成功，自动切换，否则停留在当前页面
    await this.saveItemInfo({ LinePagination: quotationLinePagination });

    const { quotationLineId, rfxLineItemNum, rfxLineItemId = null, supplierCompanyId = null } =
      item || {};
    this.setState({
      expand: {
        [rfxLineItemNum]: [rfxLineItemNum],
      },
      currentRecord: item,
      chartData: [],
      gridData: [],
    });

    // 注入form表单信息
    // form.setFieldsValue({
    //   currentQuotationPrice: item.currentQuotationPrice, // 单价
    //   abandonedFlag: item.abandonedFlag, // 是否放弃
    //   taxRate: item.taxRate, // 修改税率
    //   currentExpiryDateFrom: item.currentExpiryDateFrom && moment(item.currentExpiryDateFrom), // 报价有效期从
    //   currentExpiryDateTo: item.currentExpiryDateTo && moment(item.currentExpiryDateTo), // 报价有效期至
    //   currentPromisedDate: item.currentPromisedDate && moment(item.currentPromisedDate), // 承诺交货期
    //   currentDeliveryCycle: item.currentDeliveryCycle, // 供货周期
    //   currentQuotationRemark: item.currentQuotationRemark, // 报价说明
    //   minPurchaseQuantity: item.minPurchaseQuantity, // 最小采购量
    //   minPackageQuantity: item.minPackageQuantity, // 最小包装量
    //   currentQuotationQuantity: item.currentQuotationQuantity, // 基本可供数量
    //   currentAttachmentUuid: item.currentAttachmentUuid, // 附件id标识
    // });
    const { rfxId: quotationHeaderId } = this.state;
    dispatch({
      type: 'supplierQuotation/queryBiddingQuotationLine',
      payload: {
        quotationHeaderId,
        quotationLineIds: quotationLineId,
        customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
      },
    });
    this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    this.fetchQuotationHistory({
      rfxLineItemId,
      supplierCompanyId,
    });
    this.recordItemCountDate();

    form.resetFields();
    this.resetQuotationFormField();
    this.quotationFormResetFields();
    await this.rankChart(item);
  }

  /**
   * 左边物料列表页
   */
  @Bind()
  leftTableView(lineDataSource, quotationLinePagination) {
    return (
      <div className={style.detailLeft}>
        {map(lineDataSource, (item) => {
          return <div className={style.leftList}>{this.renderTableInfo(item)}</div>;
        })}
        <Pagination
          {...quotationLinePagination}
          onChange={(page, pageSize) => this.changeBiddingLinePagination(page, pageSize)}
          onShowSizeChange={(current, size) => this.changeBiddingLinePagination(current, size)}
          className={style.pagination}
          size="small"
        />
      </div>
    );
  }

  /**
   * timeOver -  倒计时结束函数回调
   */
  @Bind()
  timeOver(biddingLine = {}) {
    const { dispatch } = this.props;
    const { rfxId: quotationHeaderId } = this.state;
    const { quotationLineId } = biddingLine || {};
    const page = {};

    // 当倒计时结束后重新回调查询行接口和列表接口
    if (biddingLine.lineStatus !== 'FINISHED') {
      dispatch({
        type: 'supplierQuotation/queryQuotationLines',
        payload: {
          quotationHeaderId,
          page,
          customizeUnitCode:
            'SSRC.SUPPLIER_QUOTATION_RFA.LINE, SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        },
      }).then((res) => {
        if (res) {
          this.dataProcessing();
        }
        this.afterQueryLineFetchRank();
      });
      // 查询行接口
      dispatch({
        type: 'supplierQuotation/queryBiddingQuotationLine',
        payload: {
          quotationHeaderId,
          quotationLineIds: biddingLine.quotationLineId,
          customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        },
      });
      this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    }
  }

  /**
   * viewDetail -  查看物料行详情页
   */
  @Bind()
  rightDetailView() {
    const {
      supplierQuotation: { biddingQuotationLine = {} },
    } = this.props;
    const biddingLine = biddingQuotationLine;
    const { saveQuotationLinesLoading, submitQuotationLinesLoading } = this.props;
    const { itemViewDate = {} } = this.state;
    const time = itemViewDate.quotationEndDate
      ? itemViewDate.quotationEndDate
      : biddingLine.quotationEndDate;
    const now = itemViewDate.now ? itemViewDate.now : biddingLine.now;
    const { rank, quotationRank } = biddingLine || {};
    const currentRank = rank || quotationRank;

    return (
      <div className={style.detailRight}>
        <div className={style.detailTitle}>
          <div className={style.titleLeft}>
            <span className={style.titleName}>
              <Popover
                placement="leftTop"
                content={
                  <span>
                    {biddingLine.itemCode ? `${biddingLine.itemCode}-` : null}
                    {biddingLine.itemName}
                  </span>
                }
              >
                {biddingLine.itemCode ? `${biddingLine.itemCode}-` : null}
                {biddingLine.itemName}
              </Popover>
            </span>
            {currentRank ? this.rankDetailColor(currentRank, biddingLine) : null}
          </div>
          <div className={style.titleRight}>
            <span style={{ marginRight: '10px' }}>
              <img src={require('@/assets/time.svg')} alt="" />
            </span>
            <CountDown
              sysNow={now}
              endTime={time}
              type="day"
              timeOver={() => this.timeOver(biddingLine)}
            />
            <Button
              style={{ border: 0 }}
              icon={this.state.inquiryDetail ? 'menu-unfold' : 'menu-fold'}
              onClick={() => this.hideItemDetail()}
            >
              {intl.get(`ssrc.supplierQuotation.view.message.button.switchTheview`).d('切换视图')}
            </Button>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        {this.renderFormInfo(biddingLine)}
        {this.renderChartInfo()}
        <div className={style.footerBottom}>
          <Button
            loading={submitQuotationLinesLoading}
            className={style.buttonSave}
            type="default"
            onClick={() => this.submitBiddingOffer()}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button
            loading={saveQuotationLinesLoading}
            className={style.buttonSubmit}
            type="primary"
            onClick={() => this.saveBiddingOffer()}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * 物料视图-切换视图
   */
  @Bind()
  async hideItemDetail() {
    const { form } = this.props;
    try {
      await this.saveBiddingOffer();
    } catch (e) {
      throw e;
    }

    this.setState({
      inquiryTableReadOnly: true,
      inquiryDetail: false,
      selectedRows: [],
      selectedRowKeys: [],
      currentRecord: {},
    });

    this.clearRankTimer();
    this.recordItemCountDate();
    this.fetchQuotationListMessage();
    form.resetFields();
    this.resetQuotationFormField();
    this.quotationFormResetFields();
  }

  // 按照基准价动态计算价格
  dynamicChangePrice = (record = {}, data) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
    } = this.props;

    const { priceTypeCode } = quotationHeader || {};
    const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';

    if (!isUnTaxPriceFlag) {
      this.changeQuotationPriceCalc(record, data);
    } else {
      this.changeNetPriceCalc(record, data);
    }
  };

  // 表单视图，计算左侧列表金额
  updateDetailViewTotalAmount = (data = {}) => {
    const {
      dispatch,
      supplierQuotation: { quotationLines = {} },
    } = this.props;
    const { record, optionFields = {} } = data || {};
    const { content } = quotationLines || {};
    const quotationLineId = record?.quotationLineId || null;

    if (quotationLineId && !isEmpty(content)) {
      const newLines = content.map((line) => {
        if (!line) {
          return line;
        }

        if (quotationLineId === line?.quotationLineId) {
          return {
            ...line,
            ...(optionFields || {}),
          };
        }
        return line;
      });

      dispatch({
        type: `supplierQuotation/updateState`,
        payload: {
          quotationLines: {
            content: newLines || [],
          },
        },
      });
    }
  };

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(val, dataList, record = {}) {
    const {
      supplierQuotation: { biddingQuotationLine = {} },
    } = this.props;
    const form = record.$form;
    const { taxRate, taxId, taxRateType } = dataList || {};

    if (form) {
      form.setFieldsValue({
        taxRate,
        taxId,
        taxRateType,
      });
      record.taxRateType = taxRateType;
    } else {
      const quotationForm = this.getQuotationFormRefForm();
      if (!quotationForm) {
        return;
      }
      quotationForm.setFieldsValue({
        taxRate,
        taxId,
        taxRateType,
      });
      biddingQuotationLine.taxRateType = taxRateType;
    }

    this.dynamicChangePrice(record, { needUpdateObj: { taxRate } });
  }

  /**
   *  切换视图处校验单价
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  @Bind()
  priceValidator(_, value, callback) {
    const arr = String(value).split('.');
    if (arr[0] && arr[1]) {
      if (arr[1].length > 10) {
        callback(
          intl.get(`ssrc.supplierQuotation.model.supQuo.priceNumLimit`).d('单价不能超过十位小数')
        );
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  /**
   *  rankColor - 列表排名颜色变化颜色变化
   *   1-红色， 2-黄色， 3-蓝色， 其他-灰色
   *   模拟加排名箭头浮动标志
   */
  @Bind()
  rankColor(rank, item) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      biddingOfferRemote,
      [modelName]: { quotationHeader = {} },
    } = this.props;
    let color = '';
    switch (rank) {
      case 1:
        color = '#F13131';
        break;
      case 2:
        color = '#FFC800';
        break;
      case 3:
        color = '#29BECE';
        break;
      default:
        color = '#D5DAE0';
        break;
    }
    const { rank: lineRank, quotationRank } = item || {};

    const rankNode = (
      <span>
        <Tag style={{ width: '20px', textAlign: 'center', border: 0 }} color={color}>
          {rank || lineRank || quotationRank || ''}
        </Tag>
        {item.trendFlag === 1 ? (
          <img src={require('@/assets/rise.svg')} alt="" />
        ) : item.trendFlag === 0 ? (
          <img src={require('@/assets/decline.svg')} alt="" />
        ) : null}
      </span>
    );
    return biddingOfferRemote
      ? biddingOfferRemote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_FORM_LEFT_RANK_NODE',
          rankNode,
          {
            quotationHeader,
            record: item,
          }
        )
      : rankNode;
  }

  /**
   *  rankColor - 详情排名颜色变化颜色变化
   *   1-红色， 2-黄色， 3-蓝色， 其他-灰色
   *   详情排名websocket变化 关联值-this.rank(socket推送),rank(接口返回)
   */
  @Bind()
  rankDetailColor(rank, record) {
    const { biddingOfferRemote } = this.props;
    const realRank = this.rank ? this.rank : rank;
    let color = '';
    switch (realRank) {
      case 1:
        color = '#F13131';
        break;
      case 2:
        color = '#FFC800';
        break;
      case 3:
        color = '#29BECE';
        break;
      default:
        color = '#D5DAE0';
        break;
    }
    const rankNode = (
      <Tag style={{ width: '20px', textAlign: 'center', border: 0 }} color={color}>
        {realRank}
      </Tag>
    );
    return biddingOfferRemote
      ? biddingOfferRemote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_FORM_RIGHT_DETAIL_RANK_NODE',
          rankNode,
          {
            realRank,
            record,
          }
        )
      : rankNode;
  }

  /**
   * 列表行状态颜色变化
   * NOT_START-未开始，IN_QUOTATION-报价中， FINISHED-已结束
   */
  @Bind()
  lineStatusTableColor(item) {
    let color = '';
    let backGround = '';
    switch (item.lineStatus) {
      case 'NOT_START':
        color = '#A3A3A3';
        backGround = '#E5E5E5';
        break;
      case 'IN_QUOTATION':
        color = 'red';
        backGround = 'pink';
        break;
      case 'FINISHED':
        color = '#A3A3A3';
        backGround = '#E5E5E5';
        break;
      default:
        color = '#A3A3A3';
        backGround = '#E5E5E5';
    }
    return (
      <Tag
        style={{
          width: '52px',
          textAlign: 'center',
          backgroundColor: backGround,
          color,

          border: 0,
        }}
      >
        {item.lineStatusMeaning}
      </Tag>
    );
  }

  /**
   *  quotationLineStatusTablcColor - 列表行状态颜色变化
   *  NEW-新建，SUBMITTED-已报价， ABANDONED-放弃
   */
  @Bind()
  quotationLineStatusTableColor(item) {
    let color = '';
    let backGround = '';
    switch (item.quotationLineStatus) {
      case 'NEW':
        color = '#F88D10';
        backGround = 'rgba(252,160,0,0.10)';
        break;
      case 'SUBMITTED':
        color = '#47B881';
        backGround = 'rgba(71,184,129,0.10)';
        break;
      case 'ABANDONED':
        color = 'rgba(0,0,0,0.65)';
        backGround = 'rgba(0,0,0,0.06)';
        break;
      default:
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
    }
    return (
      <div>
        <Tag
          style={{
            maxWidth: '130px',
            textAlign: 'center',
            backgroundColor: backGround,
            color,
            border: 0,
          }}
        >
          <Popover content={item.quotationLineStatusMeaning}>
            {item.quotationLineStatusMeaning}
          </Popover>
        </Tag>
      </div>
    );
  }

  /**
   * renderTableInfo -  table固定信息
   */
  @Bind()
  renderTableInfo(item) {
    const { expand } = this.state;
    const { taxRate, rank, quotationRank } = item || {};
    const currentRank = rank || quotationRank;

    return (
      <div
        onClick={() => this.openTableDetail(item)}
        className={expand[item.rfxLineItemNum] ? style.selectItem : style.leftHover}
        key={item.rfxLineItemNum}
      >
        <div className={style.listTop}>
          <div className={style.rfxLineItemNumLeft}>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo.`).d('行号')}:
            {item.rfxLineItemNum}
          </div>
          <div className={style.tagRight}>
            {this.lineStatusTableColor(item)}
            {this.quotationLineStatusTableColor(item)}
            {currentRank ? this.rankColor(currentRank, item) : null}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className={style.listBottom}>
          <div className={style.itemCodeStyle}>
            {item.itemCode ? `${item.itemCode}-` : null}
            {item.itemName}
          </div>
        </div>
        <div className={style.listBottom}>
          <div className={style.carLeft}>
            <span>
              {item.freightIncludedFlag === 1 ? (
                <img src={require('@/assets/freight.svg')} alt="" />
              ) : null}
            </span>
            <span style={{ color: '#FF913C' }}>{numberSeparatorRender(item.totalAmount)}</span>
          </div>
          <div className={style.taxRateRight}>
            <div className={style.taxRateRight}>
              {!isNil(taxRate)
                ? `${intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}:${taxRate}%`
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // quotation form ref form resetFields
  quotationFormResetFields = () => {
    const quotationForm = this.getQuotationFormRefForm();
    if (!quotationForm) {
      return;
    }

    quotationForm.resetFields();
  };

  // 报价行表单 ->ref -> form
  getQuotationFormRefForm = () => {
    const { form } = this.quotationFormRef?.props || {};

    return form;
  };

  /**
   * 物料明细可编辑行信息加逻辑
   */
  @Bind()
  renderFormInfo() {
    const {
      organizationId,
      customizeForm,
      custLoading,
      supplierQuotation: { biddingQuotationLine = {}, quotationHeader = {}, quotationItemDto = {} },
      biddingOfferRemote,
    } = this.props;
    const {
      collapseKeys,
      itemViewDate = {},
      currencyPrecision,
      currentRecord,
      caclRule,
      financialPrecision,
    } = this.state;

    const isUnTaxPriceFlag = (quotationHeader && quotationHeader.priceTypeCode) === 'NET_PRICE';

    const ItemFormProps = {
      itemViewDate,
      custLoading,
      quotationHeader,
      organizationId,
      customizeForm,
      quotationItemDto: quotationItemDto || {},
      formLayout,
      lineStatusTableColor: this.lineStatusTableColor,
      quotationLineStatusTableColor: this.quotationLineStatusTableColor,
      handleFloatingWay: this.handleFloatingWay,
      handleQuotationRange: this.handleQuotationRange,
      financialPrecision,
    };

    const QuotationFromProps = {
      quotationHeader,
      organizationId,
      customizeForm,
      custLoading,
      biddingLine: biddingQuotationLine || {},
      currentRecord,
      formLayout,
      isUnTaxPriceFlag,
      currencyPrecision,
      remote: biddingOfferRemote,
      onRef: (ref = {}) => {
        this.quotationFormRef = ref || {};
      },
      caclRule,
      giveUpQuotationLine: this.setValue,
      priceValidator: this.priceValidator,
      handleChangeUnitPrice: this.handleChangeUnitPrice,
      handleChangeNetPrice: this.handleChangeNetPrice,
      handleChangeTaxIncludedFlag: this.handleChangeTaxIncludedFlag,
      changeTaxId: this.changeTaxId,
      queryBiddingQuotationLine: this.queryBiddingQuotationLine,
      openLadder: this.openLadder,
      saveBiddingOffer: this.saveBiddingOffer,
      changeQuantity: this.handleChangeQuotationQuantity,
      fetchHeader: this.fetchHeader,
      financialPrecision,
    };

    return (
      <div>
        <Collapse className="form-collapse" defaultActiveKey={[]} onChange={this.onCollapseChange}>
          <Panel
            showArrow={false}
            header={
              <Fragment>
                <h3>
                  {intl.get(`ssrc.supplierQuotation.view.panel.itemLineInfo`).d('物品行信息')}
                </h3>
                <a>
                  {collapseKeys.includes('quotationInfo')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys.includes('quotationInfo') ? 'up' : 'down'} />
              </Fragment>
            }
            key="quotationInfo"
          >
            <ItemForm {...ItemFormProps} />
          </Panel>
        </Collapse>
        <Row style={{ fontSize: '15px', marginLeft: '13px' }}>
          <span className={style.labelCol}>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.quoteInformation`).d('报价信息')}
          </span>
        </Row>

        <div className={common['padding-16']}>
          <QuotationFrom {...QuotationFromProps} />
        </div>
      </div>
    );
  }

  /**
   *  竞价走势图
   */
  renderChartInfo() {
    const { modelName = 'supplierQuotation' } = this.props;
    const { chartData, gridData, columns, historyColumns, flag = 0 } = this.state;
    const {
      supplierQuotation: { quotationHistoryList },
      [modelName]: { quotationHeader = {} },
      fetchHistoryLoading,
      biddingOfferRemote,
    } = this.props;

    const biddingRankTableColumns = biddingOfferRemote
      ? biddingOfferRemote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_BIDDIN_RANK_COLUMNS',
          columns,
          {
            quotationHeader,
            dataSource: gridData,
          }
        )
      : columns;

    const historyBiddingRankTableColumns = biddingOfferRemote
      ? biddingOfferRemote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_HISTORY_BIDDIN_RANK_COLUMNS',
          historyColumns,
          {
            quotationHeader,
            dataSource: quotationHistoryList,
          }
        )
      : historyColumns;

    const tableProps = {
      columns: biddingRankTableColumns,
      dataSource: gridData,
    };
    const historyTableProps = {
      columns: historyBiddingRankTableColumns,
      dataSource: quotationHistoryList,
      loading: fetchHistoryLoading,
    };
    // 竞价趋势条件
    const cols = {
      quotedDate: {
        type: 'time',
        // tickCount: 5,
        mask: 'YYYY-MM-DD HH:mm:ss',
      },
    };
    const chartContent = (
      <div>
        <p>{intl.get(`ssrc.supplierQuotation.model.supQuo.priceTenTa`).d('竞价走势图')}</p>
      </div>
    );

    const tableContent = (
      <p>{intl.get(`ssrc.supplierQuotation.model.supQuo.biddingTables`).d('竞价排名表')}</p>
    );

    const historyContent = (
      <div>
        <p>{intl.get(`ssrc.supplierQuotation.model.supQuo.bidHisTa`).d('报价历史表')}</p>
      </div>
    );
    return (
      <div className={style.contentRightStyle}>
        <Row style={{ fontSize: '15px', marginLeft: '13px' }}>
          <span className={style.labelCol}>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.priceTa`).d('竞价图表')}
          </span>
        </Row>
        <Row>
          <span style={{ fontSize: '12px', marginLeft: '6px', marginTop: '6px', float: 'left' }}>
            {flag === 0
              ? intl.get(`ssrc.supplierQuotation.model.supQuo.priceShowTa`).d('竞价图表-竞价走势图')
              : flag === 1
              ? intl
                  .get(`ssrc.supplierQuotation.model.supQuo.priceRankTable`)
                  .d('竞价图表-竞价排名表')
              : intl
                  .get(`ssrc.supplierQuotation.model.supQuo.priceHisTab`)
                  .d('竞价图表-报价历史表')}
          </span>
          <span style={{ marginRight: '6px', marginTop: '6px', float: 'right' }}>
            <Popover content={chartContent}>
              <Button
                type="default"
                icon="bar-chart"
                onClick={this.onClickChartBut}
                style={{ border: 0 }}
              />
            </Popover>
            <Popover content={tableContent}>
              <Button
                type="default"
                icon="table"
                onClick={this.onClickTableBut}
                style={{ border: 0 }}
              />
            </Popover>
            <Popover content={historyContent}>
              <Button
                type="default"
                icon="database"
                onClick={this.onClickHistoryTableBut}
                style={{ border: 0 }}
              />
            </Popover>
          </span>
        </Row>
        {flag === 0 && (
          <div
            style={{
              border: '1px solid #e8e8e8',
              textAlign: 'center',
              fontSize: '15px',
              height: 400,
            }}
          >
            {chartData && !isEmpty(chartData) && (
              <Chart forceFit data={chartData} height={400} scale={cols} padding={[30, 40, 70, 50]}>
                <Tooltip
                  showTitle={false}
                  crosshairs={{ type: 'cross' }}
                  itemTpl={`
                    <li data-index={index} style="margin-bottom:4px;">
                      <span style="background-color:{color};" class="g2-tooltip-marker"></span>
                      {name}
                      <br />{value}
                    </li>
                  `}
                />
                <Axis
                  name="quotedDate"
                  label={{
                    formatter: (val) => {
                      return val.replace(' ', '\n');
                    },
                  }}
                />
                <Axis name="quotationPrice" />
                <Geom
                  type="line"
                  position="quotedDate*quotationPrice"
                  tooltip={[
                    'quotedDate*quotationPrice',
                    (quotedDate, quotationPrice) => {
                      return {
                        name: quotationPrice,
                        value: `${quotedDate}`,
                      };
                    },
                  ]}
                  size={2}
                />
                <Geom
                  type="point"
                  position="quotedDate*quotationPrice"
                  style={{
                    stroke: '#fff',
                    lineWidth: 1,
                  }}
                  size={4}
                  opacity={0.65}
                  tooltip={[
                    'quotedDate*quotationPrice',
                    (quotedDate, quotationPrice) => {
                      return {
                        name: quotationPrice,
                        value: `${quotedDate}`,
                      };
                    },
                  ]}
                  shape="circle"
                />
              </Chart>
            )}
          </div>
        )}
        {flag === 1 && (
          <div style={{ width: '98%', margin: '0 0 70px 8px' }}>
            <Table
              {...tableProps}
              pagination={false}
              // rowClassName={record => this.rowClassName(record)}
            />
          </div>
        )}
        {flag === 2 && (
          <div style={{ width: '98%', margin: '0 0 70px 8px' }}>
            <Table {...historyTableProps} pagination={false} scroll={{ y: 350 }} />
          </div>
        )}
      </div>
    );
  }

  @Bind()
  handleGetFormValue() {
    const { selectedRowKeys } = this.state;
    const {
      match: {
        params: { rfxId },
      },
    } = this.props;
    const sectionFlag = this.isBidSectionData();

    const filterForm = this.props.form;
    const object = isUndefined(filterForm)
      ? filterNullValueObject(filterForm.getFieldsValue())
      : {};
    const filterValues =
      selectedRowKeys.length > 0 && !sectionFlag
        ? {
            quotationLineIds: selectedRowKeys,
            quotationHeaderId: rfxId,
            fromExport: true,
          }
        : { quotationLineIds: [], quotationHeaderId: rfxId, fromExport: true, ...object };
    return filterValues;
  }

  /**
   * 阶梯报价-获取选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleLadderLevelRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      ladderLevelSelectedRowKeys: selectedRowKeys,
      ladderLevelSelectedRows: selectedRows,
    });
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
      code: 'SSRC.RFX_DATA.IMPORT',
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        quotationHeaderId: rfxId,
        templateCode: 'SSRC.RFX_DATA.IMPORT',
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
      downloadTemplateFlag: false,
      auto: true,
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      bodyStyle: { maxHeight: 'calc(100vh - 2.3rem)' },
      key: c7nModal.key(),
      title: intl.get(`ssrc.supplierQuotation.view.message.title.supplierBidding`).d('供应商竞价'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
      onCancel: this.batchImportOk,
    });
  }

  // 导入按钮
  renderImportButton = (options = {}) => {
    const {
      match: {
        path = null,
        params: { rfxId },
      },
      organizationId,
    } = this.props;
    const { isBatchMaintainSection = false, wholeAbandonFlag } = options || {};

    const ImportProps = {
      businessObjectTemplateCode: 'SSRC.RFX_DATA.IMPORT',
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
        quotationHeaderId: rfxId,
        templateCode: 'SSRC.RFX_DATA.IMPORT',
        fromExport: true,
      },
      refreshButton: true,
      buttonText: `${intl
        .get(`ssrc.offlineResultEntry.view.message.button.NewExcelImport`)
        .d('(新)Excel导入')}`,
      auto: true,
      successCallBack: this.batchImportOk,
      modalProps: {
        title: intl
          .get(`ssrc.supplierQuotation.view.message.title.supplierBidding`)
          .d('供应商竞价'),
      },
      buttonProps: {
        permissionList: [
          {
            code: `${path}.button.importNew`.toLowerCase(),
            type: 'button',
            meaning: `${
              intl
                .get(`ssrc.supplierQuotation.view.message.title.supplierBidding`)
                .d('供应商竞价') -
              intl.get(`ssrc.supplierQuotation.view.message.button.importQuotation`).d('Excel导入')
            }(New)`,
          },
        ],
        funcType: 'flat',
        className: style.noBtn,
        style: {
          display: 'block',
          width: '100%',
          textAlign: 'left',
          marginLeft: '0',
          lineHeight: 1.5,
        },
        disabled: wholeAbandonFlag,
      },
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_DOWNLOAD_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/lines/new-export?quotationHeaderId=${rfxId}`,
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
    };

    return {
      name: 'excelIntoNew',
      btnComp: CommonImportNew,
      btnProps: {
        name: 'excelIntoNew',
        ...ImportProps,
        disabled: isBatchMaintainSection,
      },
    };
  };

  @Bind
  @Throttle(600)
  batchImportOk() {
    const { inquiryDetail = false, currentRecord = {} } = this.state;
    const { quotationLineId, quotationHeaderId } = currentRecord || {};

    this.fetchHeader();
    this.queryQuotationLines();
    if (inquiryDetail) {
      this.queryBiddingQuotationLine({ quotationLineId });
      this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    }
  }

  /**
   * 监听单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeUnitPrice(value, record) {
    const form = record.$form;
    if (form) {
      form.setFieldsValue({
        currentQuotationPrice: value,
      });
    } else {
      const Forms = this.getQuotationFormRefForm();
      if (!Forms) {
        return;
      }
      Forms.setFieldsValue({
        currentQuotationPrice: value,
      });
    }

    this.changeQuotationPriceCalc(record);
  }

  /**
   * 监听未税单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeNetPrice(value, record) {
    const form = record.$form;
    if (form) {
      form.setFieldsValue({
        netPrice: value,
      });
    } else {
      const Forms = this.getQuotationFormRefForm();
      if (!Forms) {
        return;
      }
      Forms.setFieldsValue({
        netPrice: value,
      });
    }

    this.changeNetPriceCalc(record);
  }

  // 改变含税价格计算
  changeQuotationPriceCalc = (record, data) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { currencyPrecision, caclRule, financialPrecision } = this.state;
    const { needUpdateObj } = data || {};

    const { priceTypeCode } = quotationHeader || {};
    const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
    const { priceBatchQuantity, taxRateType } = record || {};

    const form = record.$form;
    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      defaultPrecision: currencyPrecision,
      financialPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    if (form) {
      // table
      const taxRate = record.taxChangeFlag
        ? form.getFieldValue('taxIncludedFlag')
          ? form.getFieldValue('taxRate') || 0
          : 0
        : record?.taxRate || 0;
      const quotationPrice = form.getFieldValue('currentQuotationPrice');
      const currentQuotationQuantity = form.getFieldValue('currentQuotationQuantity');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.taxUnitPrice = quotationPrice;

      // 数量不存在，修改计算场景
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

      // form.registerField('totalAmount');
      // form.registerField('netAmount');
      record.totalAmount = calcTaxAmount;
      record.netAmount = calcNetAmount;
      form.setFieldsValue({
        netPrice: calcNetUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      });
    } else {
      const Forms = this.getQuotationFormRefForm();
      if (!Forms) {
        return;
      }

      // form
      const taxRate = Forms.getFieldValue('taxRate') || 0;
      const currentQuotationQuantity = Forms.getFieldValue('currentQuotationQuantity');
      const quotationPrice = Forms.getFieldValue('currentQuotationPrice');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.taxUnitPrice = quotationPrice;

      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

      record.totalAmount = calcTaxAmount;
      record.netAmount = calcNetAmount;
      Forms.setFieldsValue({
        netPrice: calcNetUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      });
      this.updateDetailViewTotalAmount({
        record,
        optionFields: {
          totalAmount: calcTaxAmount,
          ...(needUpdateObj || {}),
        },
      });
    }
  };

  // 改变未税价格计算
  changeNetPriceCalc = (record, data) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { currencyPrecision, caclRule, financialPrecision } = this.state;
    const { needUpdateObj } = data || {};

    const { priceTypeCode } = quotationHeader || {};
    const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
    const { priceBatchQuantity, taxRateType } = record || {};

    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      defaultPrecision: currencyPrecision,
      financialPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const form = record.$form;

    if (form) {
      const taxRate = record.taxChangeFlag
        ? form.getFieldValue('taxIncludedFlag')
          ? form.getFieldValue('taxRate') || 0
          : 0
        : record?.taxRate || 0;
      const currentQuotationQuantity = form.getFieldValue('currentQuotationQuantity');
      const netQuotationPrice = form.getFieldValue('netPrice');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.netUnitPrice = netQuotationPrice;
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

      // form.registerField('totalAmount');
      // form.registerField('netAmount');
      record.totalAmount = calcTaxAmount;
      record.netAmount = calcNetAmount;
      form.setFieldsValue({
        currentQuotationPrice: calcTaxUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      });
    } else {
      const Forms = this.getQuotationFormRefForm();
      if (!Forms) {
        return;
      }

      // form
      const taxRate = Forms.getFieldValue('taxRate') || 0;
      const currentQuotationQuantity = Forms.getFieldValue('currentQuotationQuantity');
      const netQuotationPrice = Forms.getFieldValue('netPrice');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.netUnitPrice = netQuotationPrice;
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

      record.totalAmount = calcTaxAmount;
      record.netAmount = calcNetAmount;
      Forms.setFieldsValue({
        currentQuotationPrice: calcTaxUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      });
      this.updateDetailViewTotalAmount({
        record,
        optionFields: {
          totalAmount: calcTaxAmount,
          ...(needUpdateObj || {}),
        },
      });
    }
  };

  /**
   * 是否含税标识改变
   * */
  @Bind()
  handleChangeTaxIncludedFlag(result = {}, record = {}) {
    const {
      supplierQuotation: { biddingQuotationLine = {} },
    } = this.props;
    const form = record.$form;
    const EMPTYTAXOBJECT = { taxId: null, taxRate: null, taxRateType: null };

    if (form) {
      const {
        $form: { setFieldsValue = () => {} },
      } = record;
      const {
        target: { checked = 0 },
      } = result;
      if (!checked) {
        setFieldsValue(EMPTYTAXOBJECT);
      }
      record.taxRateType = null;
    } else {
      const quotationForm = this.getQuotationFormRefForm();
      if (!quotationForm) {
        return;
      }
      const { setFieldsValue = () => {} } = quotationForm;
      const {
        target: { checked = 0 },
      } = result;
      if (!checked) {
        setFieldsValue(EMPTYTAXOBJECT);
      }
      biddingQuotationLine.taxRateType = null;
    }

    this.dynamicChangePrice(record);
  }

  /**
   * @ 监测可供数量变化，修改行金额和行金额(不含税)值
   */
  @Bind()
  handleChangeQuotationQuantity(val, record = {}) {
    const form = record.$form;
    if (form) {
      // const netPrice = form.getFieldValue('netPrice');
      // const isExit = netPrice !== '' && netPrice !== undefined && netPrice !== null;
      // const totalAmount = math.multipliedBy(form.getFieldValue('currentQuotationPrice'), val); // 行金额
      // const netAmount = math.multipliedBy(netPrice, val); // 行金额未税
      form.setFieldsValue({
        currentQuotationQuantity: val,
      });
    } else {
      const Forms = this.getQuotationFormRefForm();
      if (!Forms) {
        return;
      }
      Forms.setFieldsValue({
        currentQuotationQuantity: val,
      });
    }

    this.dynamicChangePrice(record);
  }

  // 批量维护
  @Throttle(2000)
  @Bind()
  async startBatchMaintainItemLine() {
    const savePageResult = await this.saveMainPage(); // 点及批量维护时候前保存全页面
    if (!savePageResult) {
      return;
    }

    this.setState((preStatus) => {
      return {
        batchMaintainItemLineVisible: !preStatus.batchMaintainItemLineVisible,
      };
    });
  }

  // 批量维护保存
  @Bind()
  @Throttle(1500)
  saveBatchMaintainItemLine() {
    const {
      supplierQuotation: { quotationHeader = {} },
      organizationId,
      form = {},
      dispatch,
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const keys = selectedRowKeys;
    let data = form.getFieldsValue();

    form.validateFields((err, fieldsValue) => {
      const startDate = fieldsValue?.currentExpiryDateFrom;
      const endDate = fieldsValue?.currentExpiryDateTo;

      if (err) {
        return;
      }
      if (startDate && endDate) {
        if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
          notification.error({
            description: intl
              .get(`himp.comment.view.message.error.supplierQuotationDate`)
              .d('报价有效期从需小于报价有效期至！'),
          });
          return false;
        }
      }
      this.setState({
        batchEditLineLockLoading: true,
      });

      const values = {
        currentExpiryDateFrom: dateFormate(startDate, DEFAULT_DATETIME_FORMAT),
        currentExpiryDateTo: dateFormate(endDate, DEFAULT_DATETIME_FORMAT),
        currentPromisedDate: dateFormate(fieldsValue?.currentPromisedDate, DEFAULT_DATETIME_FORMAT),
      };

      data = {
        ...data,
        ...values,
      };
      dispatch({
        type: 'supplierQuotation/batchMaintainItemQuotationLine',
        payload: {
          rfxHeaderId: quotationHeader.rfxHeaderId,
          organizationId,
          rfxQuotationLine: data,
          quotationLineIds: keys,
          sourceFunctionCode: 'SUPPLIER_QUOTATION',
          customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_RFA.BATCH_MAINTAIN_MATERIAL',
        },
      }).then((res) => {
        if (!res) {
          this.setState({
            batchEditLineLockLoading: false,
          });
          return;
        }

        this.handleTableRowSelect();
        this.cancelBatchMaintainItemLine();
      });
    });
  }

  // 批量维护取消
  @Bind()
  cancelBatchMaintainItemLine() {
    this.setState({
      batchMaintainItemLineVisible: false,
      newBiddingLineColumns: [],
      batchEditLineLockLoading: false,
    });
    this.fetchHeader();
    this.queryQuotationLines({}, {}, (content) =>
      this.setState({ newBiddingLineColumns: content })
    ); // 点击批量维护时候会保存全页面，所以需要刷新全部数据
  }

  // 批量维护重置
  @Bind()
  resetBatchMaintainItemLine() {
    const { form } = this.props;
    form.resetFields();
  }

  batchEmptySectionRef = (ref = {}) => {
    this.BatchEmptySectionRef = ref;
  };

  // 批量操作标段不再提示modal ok
  batchOperateSections = async () => {
    const { SectionRef, BatchEmptySectionRef = {} } = this;
    const { userConfig = {}, batchOperateType = '', inquiryDetail = false } = this.state;
    if (isEmpty(BatchEmptySectionRef) || isEmpty(SectionRef)) {
      return;
    }

    try {
      await this.BatchEmptySectionRef.saveUserConfigBatch({
        userId: getCurrentUserId(),
        enabledFlag: 1,
        ...userConfig,
      });

      // 保存成功，重新查询配置
      this.fetchUserConfig();

      if (inquiryDetail) {
        this.submitBiddingOfferSingle();
        return;
      }

      if (batchOperateType === 'supplierQuotation') {
        this.handleSubmit();
        this.querySupplier();
      }
      if (batchOperateType === 'supplierBiddingOfferSave') {
        const { pageDataToSaved = {} } = this.state;
        const { header = {}, lines } = pageDataToSaved;
        this.saved({ header, lines });
        this.querySupplier();
      }

      // this.handleOkSectionOperatePrompt();
      // this.handleSubmit();
    } catch (e) {
      throw e;
    } finally {
      this.batchOperateSectionsCancel();
      this.resetSectionChecked();
    }
  };

  // 批量操作标段不再提示modal cancel
  batchOperateSectionsCancel = () => {
    this.setState({
      batchEmptySelectSectionFlag: false,
    });
    this.resetSectionChecked();
  };

  // 分标段-清除勾选
  resetSectionChecked = () => {
    const { SectionRef } = this;
    if (isEmpty(SectionRef)) {
      return;
    }

    SectionRef.resetItemChecked();
  };

  // 是否显示批量操作按钮
  isBidSectionData = () => {
    const flag = this.getBidSectionFlag();

    if (isEmpty(this.SectionRef)) {
      return false;
    }

    const { isSectionListEmpty } = this.SectionRef;

    const notEmptyFlag = isSectionListEmpty();
    return !notEmptyFlag && flag;
  };

  // 获取分标段表示
  getBidSectionFlag = () => {
    let flag = false;

    const sectionFlag = this.getRouterSearch('sectionFlag');
    if (sectionFlag && sectionFlag === '1') {
      flag = true;
    }
    return flag;
  };

  // 分标段提示弹框-ok
  handleOkSectionOperatePrompt = () => {
    const { batchOperateType = null } = this.state;
    if (!batchOperateType) {
      // this.handleSubmit();
      this.handleIntegrationSectionBatchSubmit({ weakCtrlConfirmFlag: 1 });
    }
    if (batchOperateType === 'supplierBiddingOfferSave') {
      const { pageDataToSaved = {} } = this.state;
      const { header = {}, lines } = pageDataToSaved;
      this.saved({ header, lines });
    }

    this.handleCancellSectionOperatePrompt();
    this.fetchUserConfig();
  };

  // 分标段提示弹框-cancel
  handleCancellSectionOperatePrompt = () => {
    this.setState({
      operateSectionData: [],
      operateSectionPromptFlag: false,
      pageDataToSaved: {},
      userConfigs: {},
      userConfig: {},
    });
  };

  // 选择标段
  @Bind()
  selectBidSection() {
    const { isBatchMaintainSection = false } = this.state;
    this.setState({ isBatchMaintainSection: !isBatchMaintainSection });

    if (!isBatchMaintainSection) {
      const { handleToggleOpened = () => {} } = this.SectionRef;
      handleToggleOpened(true);
    }
    this.resetSectionChecked();
  }

  // 获取路由location -> search -> [key]: value
  getRouterSearch = (key = null) => {
    if (!key || typeof key !== 'string') {
      return;
    }

    const {
      location: { search },
    } = this.props;
    const { [key]: s = null } = queryString.parse(search.substr(1));
    return s;
  };

  // 切换标段定位到当前路由
  locatedCurrentUrl = (data = {}) => {
    const {
      history,
      location: { search },
      match: { path = null },
    } = this.props;
    const { quotationHeaderId = null, projectLineSectionId = null } = data;
    if (!quotationHeaderId) {
      return;
    }

    let newSearch = queryString.parse(search.substr(1));
    newSearch = queryString.stringify({
      ...newSearch,
      projectLineSectionId,
    });

    this.setState({
      rfxId: quotationHeaderId,
    });
    const replyFlag = this.props.location.pathname.indexOf('supplier-reply') > -1;

    this.registerSocket = 0;

    history.push({
      pathname: replyFlag
        ? `/ssrc/supplier-reply/bidding-offer/${quotationHeaderId}`
        : isPubPage(path, `/ssrc/supplier-quotation/bidding-offer/${quotationHeaderId}`),
      search: newSearch,
    });
  };

  /**
   * 渲染总价排名表
   */
  renderRankTable() {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { sourceCategory, quotationScope, rfxHeaderId, quotationHeaderId } = quotationHeader;
    const tableProps = {
      rfxHeaderId,
      quotationHeaderId,
      supplierRankTableDS: this.supplierRankTableDS,
    };
    return (
      sourceCategory === 'RFA' &&
      quotationScope === 'ALL_QUOTATION' && (
        <div className={style.subTitle}>
          <h4>
            <div className={style.verticalLine} />
            <span>
              {intl
                .get(`ssrc.supplierQuotation.view.message.subTitle.totalPriceRank`)
                .d('总价排名表')}
            </span>
          </h4>
          <SupplierRankTable {...tableProps} />
        </div>
      )
    );
  }

  // 是否可以切标段-loading
  couldSectionSwitch = () => {
    const { allLoading = false } = this.props;
    const { operationLoading = false } = this.state;
    return allLoading || operationLoading;
  };

  applicationScopeRef = {};

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (params) => {
    const { organizationId, supplierQuotation = {} } = this.props;
    const { rfxHeaderId, applicationScopeFlag } = supplierQuotation?.quotationHeader || {};
    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        applicationScopeFlag,
        ...params,
      },
      onRef: (node) => {
        this.applicationScopeRef = node;
      },
      sourceHeaderId: rfxHeaderId,
      organizationId,
    };

    const modalKey = c7nModal.key();
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      bodyStyle: {
        padding: 0,
      },
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScopeDetail {...Props} />,
      style: { width: '1000px' },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 整单放弃逻辑
  @Throttle(800)
  handleWholeAbandon = (otherProps = {}) => {
    this.wholeAbadonDS = new DataSet(wholeAbadonDataSet());

    const modalProps = {
      wholeAbadonDS: this.wholeAbadonDS,
    };

    const modalKey = c7nModal.key();
    c7nModal.open({
      drawer: true,
      key: modalKey,
      closable: true,
      style: {
        width: '400px',
      },
      destroyOnClose: true,
      title:
        intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃') +
        intl.get(`ssrc.supplierQuotation.view.message.title.supplierBidding`).d('供应商竞价'),
      children: <WholeAbandonForm {...modalProps} />,
      onOk: () => this.wholeAbandonQuotation(otherProps),
      onClose: () => {
        this.wholeAbadonDS.loadData([]);
      },
    });
  };

  // 整单放弃
  @Throttle(1000)
  wholeAbandonQuotation = async (otherProps = {}) => {
    const {
      supplierQuotation: { quotationHeader = {} },
      organizationId,
    } = this.props;
    const { inquiryDetail } = this.state;
    const { quotationHeaderId, rfxHeaderId } = quotationHeader || {};
    const { from } = otherProps || {};
    const { current } = this.wholeAbadonDS || {};
    if (!quotationHeaderId || !current) {
      return;
    }

    const validateFlag = await this.wholeAbadonDS.validate();
    if (!validateFlag) {
      return false;
    }

    const data = current.toData();
    if (isEmpty(data)) {
      return false;
    }

    const abandonedData = {
      ...(data || {}),
      rfxQuotationWholeAbandonDTOS: [
        {
          rfxHeaderId,
          quotationHeaderId,
        },
      ],
      from, // 标识整单放弃的途径
    };

    const newData = {
      organizationId,
      quotationHeaderId,
      data: abandonedData,
      queryParam: {
        customizeUnitCode: `SSRC.SUPPLIER_QUOTATION_RFA.LINE,SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD`,
      },
    };

    if (from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
      // 提交，判定全部放弃
      const SubmitOptions = { outData: abandonedData, outPassFlag: 1, from };
      if (inquiryDetail) {
        this.submitBiddingOfferSingle(SubmitOptions);
      } else {
        this.handleSubmit(SubmitOptions);
      }

      if (this.abandonedForm) {
        this.abandonedForm.close();
      }
      return;
    }

    let result = null;
    this.toggleOperationLoading(true);
    try {
      result = await quotationWholeAbandon(newData);
      result = getResponse(result);
      this.toggleOperationLoading(false);
      if (!result) {
        return false;
      }

      await handleValidationResult({
        validationResult: result,
        afterSuccessSubmit: () => {
          this.directionSupplierQuotationList();
        },
        headerId: quotationHeaderId,
      });
    } catch (e) {
      throw e;
    }
  };

  // 跳转到报价列表
  directionSupplierQuotationList = () => {
    const { history } = this.props;
    const currentActiveTab = getActiveTabKey();
    if (!currentActiveTab) {
      return;
    }

    history.push({
      pathname: `${currentActiveTab}/list`,
    });
  };

  // 判断整单放弃 @return boolean
  judgeWholeAbandon = () => {
    const {
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { supplierStatus } = quotationHeader || {};
    const wholeAbandonFlag =
      supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
    return wholeAbandonFlag;
  };

  renderHeaderButtons() {
    const {
      inquiryTableReadOnly,
      rfxId,
      isBatchMaintainSection,
      selectedRowKeys = [],
      operationLoading = false,
    } = this.state;
    const {
      allLoading,
      organizationId,
      match: { path, params: { rfxId: quotationHeaderId } = {} } = {},
      supplierQuotation: { quotationHeader = {} },
    } = this.props;
    const { quotationStatus } = quotationHeader || {};
    const isBidSectionData = this.isBidSectionData();
    const wholeAbandonFlag = this.judgeWholeAbandon();

    const buttons = [
      inquiryTableReadOnly && {
        name: 'submit',
        btnProps: {
          onClick: this.submitAllBiddingOffer,
          loading: allLoading || operationLoading || operationLoading,
          type: 'primary',
          icon: 'check',
          disabled: wholeAbandonFlag,
        },
        child: isBidSectionData
          ? intl.get('hzero.common.button.submit').d('提交')
          : isEmpty(selectedRowKeys)
          ? intl.get('ssrc.common.button.submitAllLines').d('提交全部行')
          : intl.get('ssrc.common.button.submitSelectedLines').d('提交勾选行'),
      },
      inquiryTableReadOnly && {
        name: 'save',
        btnProps: {
          onClick: this.saveAllBiddingOffer,
          loading: allLoading || operationLoading,
          disabled: isBatchMaintainSection || wholeAbandonFlag,
          icon: 'save',
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'attachmentUploading',
        btnProps: {
          onClick: this.showUploadModal,
          disabled: isBatchMaintainSection || wholeAbandonFlag,
          icon: 'upload',
        },
        child: intl.get(`ssrc.supplierQuotation.view.message.button.uploadFile`).d('附件上传'),
      },
      !isBatchMaintainSection && !wholeAbandonFlag
        ? {
            name: 'excelExport',
            btnComp: ExcelExport,
            btnProps: {
              requestUrl: `/ssrc/v1/${organizationId}/rfx/quotation/rfa/export`,
              buttonText: intl.get(`ssrc.common.button.batchExport`).d('导出'),
              queryParams: this.handleGetFormValue(),
            },
          }
        : null,
      isBidSectionData && !wholeAbandonFlag
        ? !isBatchMaintainSection
          ? {
              name: 'sectionChoose',
              btnProps: {
                onClick: this.selectBidSection,
              },
              child: (
                <Fragment>
                  <Iconfont type="main-delete" style={{ marginRight: '8px' }} />
                  {intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')}
                </Fragment>
              ),
            }
          : {
              name: 'sectionChoose',
              btnProps: {
                onClick: this.selectBidSection,
              },
              child: (
                <Fragment>
                  <Iconfont type="main-delete" style={{ marginRight: '8px' }} />
                  {intl.get(`ssrc.common.view.button.cancelSelect`).d('取消选择')}
                </Fragment>
              ),
            }
        : null,
      {
        name: 'more',
        group: true,
        child: (
          <Button disabled={wholeAbandonFlag}>
            <Icon type="ellipsis" />
            {intl.get('hzero.common.basicLayout.viewMore').d('查看更多')}
          </Button>
        ),
        children: [
          !isBatchMaintainSection
            ? {
                name: 'supplierBidding',
                btnComp: QuotationDetailImport,
                btnProps: {
                  quotationHeaderId: rfxId,
                  onOk: async () => {
                    this.querySupplier();
                  },
                  onClose: async () => {
                    this.querySupplier();
                  },
                  onCancel: async () => {
                    this.querySupplier();
                  },
                  isH0Btn: true,
                  className: style.noBtn,
                  isDisabled: wholeAbandonFlag,
                },
              }
            : null,
          {
            name: 'excelInto',
            child: (
              <Fragment>
                <Iconfont type="main-import" size={16} />
                {intl
                  .get(`ssrc.supplierQuotation.view.message.button.importQuotation`)
                  .d('Excel导入')}
              </Fragment>
            ),
            btnProps: {
              type: 'default',
              onClick: this.handleBatchExport,
              disabled: isBatchMaintainSection || wholeAbandonFlag,
            },
          },
          !isBatchMaintainSection
            ? {
                name: 'downloadTheImportTemplate',
                btnComp: ExcelExports,
                btnProps: {
                  buttonText: intl
                    .get(`ssrc.offlineResultEntry.view.button.downloadImportTemplate`)
                    .d('下载导入模板'),
                  requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/${rfxId}/lines/excel`,
                  otherButtonProps: {
                    type: 'default',
                    className: style.noBtn,
                    disabled: wholeAbandonFlag,
                  },
                },
              }
            : null,
          !isBatchMaintainSection
            ? {
                name: 'excelExportNew',
                btnComp: ExcelExportPro,
                btnProps: {
                  templateCode: 'SRM_C_SRM_SSRC_RFX_BIDDING_EXPORT',
                  name: 'excelExportNew',
                  requestUrl: `/ssrc/v1/${organizationId}/rfx/quotation/rfa/new-export`,
                  buttonText: `${intl.get(`ssrc.common.button.batchExport`).d('导出')}(NEW)`,
                  queryParams: this.handleGetFormValue(),
                  otherButtonProps: {
                    funcType: 'flat',
                    className: style.noBtn,
                    style: {
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                    },
                    disabled: wholeAbandonFlag,
                    permissionList: [
                      {
                        code: `${path}.button.exprotnew`.toLowerCase(),
                        type: 'button',
                        meaning: `${
                          intl
                            .get(`ssrc.supplierQuotation.view.message.title.supplierQuotation`)
                            .d('供应商报价') - intl.get(`ssrc.common.button.batchExport`).d('导出')
                        }(New)`,
                      },
                    ],
                  },
                },
              }
            : null,
          {
            name: 'wholeAbandon',
            hidden: isBidSectionData,
            child: (
              <Fragment>
                <IconC7N type="delete_forever" style={{ fontSize: '12px' }} />
                {intl.get(`ssrc.supplierQuotation.view.message.wholeGiveUp`).d('整单放弃')}
              </Fragment>
            ),
            btnProps: {
              onClick: this.handleWholeAbandon,
              loading: operationLoading,
              disabled: !quotationStatus || !quotationHeaderId || wholeAbandonFlag,
            },
          },
          this.renderImportButton({ isBatchMaintainSection, wholeAbandonFlag }), // 导入NEW
        ].filter(Boolean),
      },
    ].filter(Boolean);

    return <DynamicButtons trigger="hover" buttons={buttons} />;
  }

  // 多标段-提示文字
  renderSectionAlert(sectionFlag = false) {
    let render = '';
    if (sectionFlag) {
      render = (
        <Alert
          message={
            <span style={{ color: '#3095F2' }}>
              {intl
                .get('ssrc.inquiryHall.view.sectionSelectionSubmitForWarning')
                .d('标段下未勾选物料行时，默认提交该标段下所有物料行')}
            </span>
          }
          type="info"
          showIcon
          closable
          style={{
            marginLeft: '16px',
            marginRight: '16px',
            marginTop: '8px',
            border: 'none',
            alignItems: 'flex-end',
          }}
        />
      );
    }
    return render;
  }

  getBackPath = () => {
    const {
      match: { path = null },
    } = this.props;
    const replyFlag = this.props.location.pathname.indexOf('supplier-reply') > -1;
    return replyFlag
      ? '/ssrc/supplier-reply/list'
      : isPubPage(path, '/ssrc/supplier-quotation/list');
  };

  /**
   * 二开埋点
   * Content 上边埋点
   * 主要用作单标段
   * */
  renderCuxBeforeContent = (options) => {
    const { biddingOfferRemote } = this.props;
    const { sectionFlag = true } = options || {};

    let cuxRender = '';

    const cuxProps = {
      that: this,
      biddingOfferRemote,
      sectionFlag,
    };

    cuxRender = biddingOfferRemote.process(
      'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_BEFORECONTENTRENDER_CUX_ONLY',
      cuxRender,
      cuxProps
    );

    cuxRender = cuxRender ?? '';
    return cuxRender;
  };

  /**
   * 二开埋点
   * Content Top
   * 主要用作多标段
   * */
  renderCuxTop = (options) => {
    const { biddingOfferRemote } = this.props;
    const { sectionFlag = false } = options || {};

    let cuxRender = '';

    const cuxProps = {
      that: this,
      biddingOfferRemote,
      sectionFlag,
    };

    cuxRender = biddingOfferRemote.process(
      'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_BEFORESECTIONCONTENTRENDER_CUX_ONLY',
      cuxRender,
      cuxProps
    );

    cuxRender = cuxRender ?? '';
    return cuxRender;
  };

  render() {
    const {
      customizeBtnGroup = () => {},
      form,
      allLoading,
      supplierQuotation: {
        quotationHeader = {},
        //  quotationLines = {}, // 供应商报价行信息
        quotationLinePagination = {},
        biddingQuotationLine = {},
        fetchLadderList = [],
        // biddingQuotationLine= {},
      }, // 供应商报价行信息 // 供应商报价行查询分页信息 }, // 供应商头信息
      customizeTable,
      customizeForm,
      custLoading,
      // excel导入所需参数-终
      organizationId,
      fetchHeaderLoading,
      fetchListLoading,
      fetchQuestionLineLoading,
      saveLadderListLoading,
      fetchLadderListLoading,
      deleteLadderQuotLoading,
      validateLadderLoading, // 校验loading
      batchEditLineLockLoading, // 批量编辑行loading
      biddingOfferRemote,
    } = this.props;
    const {
      bucketDirectory,
      attachmentVisible,
      inquiryTableReadOnly,
      inquiryDetail,
      newBiddingLineColumns, // 新列表数据
      selectedRowKeys = [],
      ladderVisible, // 阶梯报价模态框
      ladderListHeaderInfo = {},
      ladderLevelSelectedRowKeys = [],
      batchMaintainItemLineVisible = false,
      rfxId,
      isBatchMaintainSection = false,
      batchOperateType = null,
      batchEmptySelectSectionFlag = false,
      operateSectionData = [],
      operateSectionPromptFlag = true,
      operationLoading = false, // page loading
      headerCountTimeInfo = {},
      currencyPrecision,
      caclRule,
    } = this.state;
    const { tenantId } = quotationHeader || {};
    const sectionFlag = this.getBidSectionFlag();

    const isUnTaxPriceFlag = (quotationHeader && quotationHeader.priceTypeCode) === 'NET_PRICE';

    const originLineColumns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        dataIndex: 'applicationScopeFlag',
        width: 100,
        render: (_, record) => {
          const { applicationScopeFlag = 0, rfxLineItemId = null } = record;

          return (
            <a
              disabled={!applicationScopeFlag}
              onClick={() =>
                this.viewApplicationOrgModal({
                  sourceLineItemId: rfxLineItemId,
                  applicationScopeFlag,
                })
              }
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.ranking`).d('排名'),
        dataIndex: 'rank',
        width: 80,
        render: (val, record) => {
          const { quotationRank } = record || {};
          const currentRank = val || quotationRank;

          return currentRank ? <div>{this.rankColor(currentRank, record)}</div> : '';
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.lineStatus`).d('行状态'),
        dataIndex: 'lineStatusMeaning',
        width: 100,
        render: (val, record) => (val ? this.lineStatusTableColor(record) : null),
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationStatus`).d('报价状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
        render: (val, record) => (val ? this.quotationLineStatusTableColor(record) : null),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃'),
        dataIndex: 'abandonedFlag',
        width: 60,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('abandonedFlag', {
                initialValue: value,
              })(
                <Checkbox
                  disabled={
                    record.quotationScope === 'ALL_QUOTATION' ||
                    record.quotationLineStatus === 'ABANDONED'
                  }
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(e) => this.giveUpQuotationLine(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        dataIndex: 'floatType',
        width: 140,
        render: (val) => (
          <Popover
            placement="topLeft"
            content={intl
              .get(`ssrc.inquiryHall.view.message.floatingMoneyDetail`)
              .d('浮动方式：最小价格幅度的计算按照金额或者比率！')}
          >
            {this.handleFloatingWay(val)}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        dataIndex: 'quotationRange',
        width: 140,
        render: (val, record) => (
          <Popover
            placement="topLeft"
            content={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {this.handleQuotationRange(val, record?.floatType)}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        width: 150,
        align: 'right',
        render: (value, record) => {
          const isSubmit = this.state.selectedRowKeys.some(
            (item) => item === record.quotationLineId
          );

          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentQuotationPrice', {
                initialValue: value,
                rules: [
                  {
                    required:
                      isSubmit &&
                      record.$form.getFieldValue('abandonedFlag') !== 1 &&
                      !isUnTaxPriceFlag &&
                      !record.priceReadonlyFlag,
                    message: isSubmit
                      ? intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPrice`).d('单价'),
                        })
                      : null,
                  },
                  {
                    validator: this.priceValidator,
                  },
                ],
              })(
                <FormInputWrapper
                  priceReadonlyFlag={record.priceReadonlyFlag === 1}
                  onChange={(val) => this.handleChangeUnitPrice(val, record)}
                  // precision={4}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '98%' }}
                  disabled={
                    record.$form.getFieldValue('abandonedFlag') === 1 ||
                    (isNumber(record.validQuotationPrice) && !record.continuousQuotationFlag) ||
                    isUnTaxPriceFlag ||
                    record.priceReadonlyFlag === 1
                  }
                  parser={(val) => parseAmount(val, currencyPrecision)}
                  allowThousandth
                  zeroValueVisibleFlag={
                    caclRule === 'Amount' &&
                    isUnTaxPriceFlag &&
                    $form.getFieldValue('netPrice') !== 0 &&
                    parseAmount($form.getFieldValue('currentQuotationPrice'), currencyPrecision) ==
                      0
                  }
                  currencyPrecision={currencyPrecision}
                  taxFlag={isUnTaxPriceFlag}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 150,
        render: (value, record) => {
          const isSubmit = this.state.selectedRowKeys.some(
            (item) => item === record.quotationLineId
          );
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('netPrice', {
                initialValue: value,
                rules: [
                  {
                    required:
                      isSubmit &&
                      record.$form.getFieldValue('abandonedFlag') !== 1 &&
                      isUnTaxPriceFlag &&
                      !record.priceReadonlyFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.netPrice`)
                        .d('单价(不含税)'),
                    }),
                  },
                  {
                    validator: this.priceValidator,
                  },
                ],
              })(
                <FormInputWrapper
                  priceReadonlyFlag={record.priceReadonlyFlag === 1}
                  onChange={(val) => this.handleChangeNetPrice(val, record)}
                  type="hzero"
                  currency={form.getFieldValue('currencyCode')}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '98%' }}
                  disabled={
                    record.$form.getFieldValue('abandonedFlag') === 1 ||
                    (isNumber(record.validQuotationPrice) && !record.continuousQuotationFlag) ||
                    !isUnTaxPriceFlag ||
                    record.priceReadonlyFlag === 1
                  }
                  parser={(val) => parseAmount(val, currencyPrecision)}
                  allowThousandth
                  zeroValueVisibleFlag={
                    caclRule === 'Amount' &&
                    !isUnTaxPriceFlag &&
                    $form.getFieldValue('currentQuotationPrice') !== 0 &&
                    parseAmount($form.getFieldValue('netPrice'), currencyPrecision) == 0
                  }
                  taxFlag={!isUnTaxPriceFlag}
                  currencyPrecision={currencyPrecision}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },
      !isUnTaxPriceFlag
        ? {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validLadderTaxPrice`)
              .d('有效含税报价'),
            dataIndex: 'validQuotationPrice',
            width: 120,
            render: (_, record) => (
              <span> {numberSeparatorRender(record.validQuotationPrice)}</span>
            ),
          }
        : {
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validUnTaxQuotationPrice`)
              .d('有效报价(不含税)'),
            dataIndex: 'validNetPrice',
            width: 120,
            render: numberSeparatorRender,
          },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
        dataIndex: 'validBargainPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
        dataIndex: 'totalAmount',
        width: 120,
        align: 'right',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('totalAmount', {
                initialValue: val,
              })(<span>{numberSeparatorRender(record.totalAmount)}</span>)}
            </Form.Item>
          ) : (
            numberSeparatorRender(record.totalAmount)
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 120,
        align: 'right',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('netAmount', {
                initialValue: val,
              })(<span>{numberSeparatorRender(record.netAmount)}</span>)}
            </Form.Item>
          ) : (
            numberSeparatorRender(record.netAmount)
          ),
      },
      {
        title: intl.get(`hzero.common.startDate`).d('开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationsEndDate`).d('结束时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={
                    record.$form.getFieldValue('abandonedFlag') === 1 || record.taxChangeFlag === 0
                  }
                  onChange={(e) => this.handleChangeTaxIncludedFlag(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: <span>{intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}</span>,
        dataIndex: 'taxId',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxId', {
                initialValue: record.taxId,
                rules: [
                  {
                    required:
                      record.$form.getFieldValue('abandonedFlag') !== 1 &&
                      record.taxChangeFlag === 1 &&
                      record.$form.getFieldValue('taxIncludedFlag') === 1,
                    // && this.state.selectedRowKeys.some(item => item === record.quotationLineId),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supplierBid.modifyTheRate`)
                        .d('税率(%)'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.TAX"
                  style={{ width: '98%' }}
                  textValue={record.taxRate}
                  textField="taxRate"
                  disabled={
                    record.taxChangeFlag === 0 ||
                    record.$form.getFieldValue('taxIncludedFlag') === 0 ||
                    record.$form.getFieldValue('abandonedFlag') === 1
                  }
                  onChange={(val, dataList) => this.changeTaxId(val, dataList, record)}
                  queryParams={{
                    organizationId: getCurrentTenant().tenantId,
                    tenantId: quotationHeader.tenantId,
                  }}
                />
              )}
              {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })}
            </Form.Item>
          ) : (
            record.taxRate
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationQuantity`)
          .d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: (value, record) => {
          const isSubmit = this.state.selectedRowKeys.some(
            (item) => item === record.quotationLineId
          );
          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentQuotationQuantity', {
                initialValue: value,
                rules: [
                  {
                    required:
                      isSubmit &&
                      record.quantityChangeFlag === 1 &&
                      record.$form.getFieldValue('abandonedFlag') !== 1,
                    message: isSubmit
                      ? intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationQuantity`)
                            .d('可供数量'),
                        })
                      : null,
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  min="0"
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={
                    record.$form.getFieldValue('abandonedFlag') === 1 ||
                    record.quantityChangeFlag !== 1
                  }
                  onChange={(val) => this.handleChangeQuotationQuantity(val, record)}
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.minPurchaseQuantity`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: value,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  style={{ width: '100%' }}
                  min="0"
                  disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                  max="99999999999999999999"
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.minPackageQuantity`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPackageQuantity', {
                initialValue: value,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={record.uomId}
                  style={{ width: '100%' }}
                  min="0"
                  disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                  max="99999999999999999999"
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        dataIndex: 'priceDetail',
        width: 100,
        render: (val, record) => (
          <>
            <QuotationDetailModal
              rowData={record}
              sourceFrom="RFX"
              bidFlag={false}
              detailFrom="SUP_QUOTATION" // 针对一些子模块的情况
              quotationStatus={quotationHeader.quotationStatus}
              continuousQuotationFlag={quotationHeader.continuousQuotationFlag}
              disabled={
                record?.$form?.getFieldValue('abandonedFlag') ||
                ['NOT_START', 'FINISHED'].includes(record.lineStatus)
              }
              onBeforeOpen={() => this.saveAllBiddingOffer(quotationLinePagination)}
              onOk={async () => {
                await this.fetchHeader();
                this.queryQuotationLines(quotationLinePagination); // 报价明细保存或取消后保存头行数据（解决用户未保存数据点报价明细后数据被清空）
              }}
              onCancel={async () => {
                await this.fetchHeader();
                this.queryQuotationLines(quotationLinePagination);
              }}
              headerData={quotationHeader}
            />
            {record.quotationDetailRequire === 1 && (
              <Badge style={{ marginLeft: '2px' }} status="error" />
            )}
          </>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderInquiryFlag`).d('启用阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderInquiryFlag', {
                initialValue: value,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    record.diyLadderQuotationFlag === 0 ||
                    record.$form.getFieldValue('abandonedFlag') === 1
                  }
                />
              )}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderBidding`).d('阶梯报价'),
        dataIndex: 'ladderBidding',
        width: 100,
        render: (val, record) => {
          const { $form } = record || {};
          if (isEmpty($form)) {
            return;
          }

          const abandonedFlag = $form?.getFieldValue('abandonedFlag');
          const disabledEditorFlag = abandonedFlag === 1;

          return record.$form.getFieldValue('ladderInquiryFlag') === 1 ? (
            <>
              <a onClick={() => this.openLadder(record)} disabled={disabledEditorFlag}>
                {intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
              {record.ladderInquiryRequire === 1 && !disabledEditorFlag && (
                <Badge style={{ marginLeft: '2px' }} status="error" />
              )}
            </>
          ) : null;
        },
      },
      {
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('origin', {
                initialValue: value,
              })(<Input />)}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateFrom`)
          .d('报价有效期从'),
        dataIndex: 'currentExpiryDateFrom',
        width: 150,
        render: (value, record) => {
          const isSubmit = this.state.selectedRowKeys.some(
            (item) => item === record.quotationLineId
          );
          return ['update', 'create'].includes(record._status) &&
            record.validDateInputType !== 'READONLY' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('currentExpiryDateFrom', {
                initialValue: value && moment(value),
                rules: [
                  {
                    required:
                      isSubmit &&
                      record.validDateInputType === 'REQUIRED' &&
                      record.$form.getFieldValue('abandonedFlag') !== 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateFrom`)
                        .d('报价有效期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                  disabledDate={(currentDate) => {
                    const toData = record?.$form?.getFieldValue('currentExpiryDateTo');
                    if (toData) {
                      return moment(toData).isBefore(currentDate, 'day');
                    }
                  }}
                />
              )}
              </Form.Item>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('currentExpiryDateFrom', {
                initialValue: value && moment(value),
              })(<span>{dateRender(value)}</span>)}
            </Form.Item>
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        dataIndex: 'currentExpiryDateTo',
        width: 150,
        render: (value, record) => {
          const isSubmit =
            this.state.selectedRowKeys.some((item) => item === record.quotationLineId) &&
            record?.$form?.getFieldValue('abandonedFlag') !== 1;
          return ['update', 'create'].includes(record._status) &&
            record.validDateInputType !== 'READONLY' ? (
              <Form.Item>
                {record.$form.getFieldDecorator('currentExpiryDateTo', {
                initialValue: value && moment(value),
                rules: [
                  {
                    required: isSubmit && record.validDateInputType === 'REQUIRED',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
                        .d('报价有效期至'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                  disabledDate={(currentDate) => {
                    const fromDate = record?.$form?.getFieldValue('currentExpiryDateFrom');
                    if (fromDate) {
                      return moment(fromDate).isAfter(currentDate, 'day');
                    }

                    return moment().isAfter(currentDate, 'day');
                  }}
                />
              )}
              </Form.Item>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('currentExpiryDateTo', {
                initialValue: value && moment(value),
              })(<span>{dateRender(value)}</span>)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.currentPromisedDate`).d('承诺交货期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentPromisedDate', {
                initialValue: value && moment(value),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format={getDateFormat()}
                  placeholder={null}
                  disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                />
              )}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentDeliveryCycle', {
                initialValue: value,
                rules: [
                  {
                    pattern: /^[1-9]\d*$/,
                    message: intl.get('ssrc.common.positiveInteger').d('正整数'),
                  },
                ],
              })(<InputNumber disabled={record.$form.getFieldValue('abandonedFlag') === 1} />)}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.currentQuotationRemark`).d('报价说明'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currentQuotationRemark', {
                initialValue: value,
              })(<Input disabled={record.$form.getFieldValue('abandonedFlag') === 1} />)}
            </Form.Item>
          ) : (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={
                    quotationHeader.freightUpdatableFlag === 0 ||
                    record.$form.getFieldValue('abandonedFlag') === 1
                  }
                  onChange={() => {
                    record.$form.setFieldsValue({
                      freightAmount:
                        record.$form.getFieldValue('freightIncludedFlag') === 1
                          ? record.$form.freightAmount
                          : null,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 120,
        render: (value, record) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = biddingOfferRemote
            ? biddingOfferRemote.process(
                'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_QUOTATION_TABLE_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  form,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightAmount', {
                initialValue: value,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  style={{ width: '100%' }}
                  financial={form.getFieldValue('currencyCode')}
                  min="0"
                  max="99999999999999999999"
                  disabled={
                    record.$form.getFieldValue('abandonedFlag') === 1 ||
                    record.$form.getFieldValue('freightIncludedFlag') === 1
                  }
                  queryPrecisionParams={{
                    purTenantId: tenantId,
                  }}
                  {...cuxFreightAmountProps}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(value)
          );
        },
      },

      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxAttachmentUuid`).d('询价单行附件'),
        dataIndex: 'rfxAttachmentUuid',
        width: 180,
        render: (value) => (
          <Upload
            filePreview
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            tenantId={organizationId}
            attachmentUUID={value}
            viewOnly
            icon="download"
          />
        ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.purchaserLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'currentAttachmentUuid',
        width: 220,
        render: (value, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('currentAttachmentUuid', {
              initialValue: value,
            })(
              <Upload
                filePreview
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-quotationline"
                tenantId={organizationId}
                attachmentUUID={value}
                viewOnly={record.$form.getFieldValue('abandonedFlag') === 1}
                {...ChunkUploadProps}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.operation`).d('操作'),
        dataIndex: 'playDesc',
        width: 100,
        fixed: 'right',
        render: (val, record) =>
          record.lineStatus === 'IN_QUOTATION' ? (
            <a onClick={() => this.openTableRow(record)}>
              {intl.get(`ssrc.supplierQuotation.view.message.button.switchView`).d('切换视图')}
            </a>
          ) : (
            <a onClick={() => this.openTableRow(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ),
      },
    ].filter(Boolean);

    /**
     * 二开埋点
     * @protected 【奥克斯埋点二开含税单价】
     */
    const lineColumns = biddingOfferRemote
      ? biddingOfferRemote.process(
          'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_LINE_COLUMNS',
          originLineColumns,
          {
            selectedRowKeys,
            isUnTaxPriceFlag,
            caclRule,
            tenantId,
            currencyPrecision,
            priceValidator: this.priceValidator,
            parseAmount,
            handleChangeUnitPrice: this.handleChangeUnitPrice,
            quotationHeader,
          }
        )
      : originLineColumns;

    const {
      // businessAttachmentUuid, // 报价单商务附件 uuid
      // techAttachmentUuid, // 报价单技术附件 uuid
      currentBusinessAttachmentUuid, // 报价单当前商务附件 uuid
      currentTechAttachmentUuid, // 报价单当前技术附件 uuid
    } = quotationHeader;
    // 报价单头附件列表
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      initUpload: this.initUpload,
      viewOnly: false,
      businessUuid: currentBusinessAttachmentUuid,
      techUuid: currentTechAttachmentUuid,
      onRef: this.handleBindOnRef,
      ChunkUploadProps,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedLineKeys, selectedLines) => {
        this.setState({
          selectedRowKeys: selectedLineKeys,
          selectedRows: selectedLines,
        });
      },
      getCheckboxProps: (record) => {
        return {
          defaultChecked:
            isEmpty(selectedRowKeys) && sectionFlag && record.actionSectionSelectedFlag,
        };
      },
    };

    const headerProps = {
      form,
      customizeForm,
      custLoading,
      headerCountTimeInfo,
      sectionAndDataFlag: this.isBidSectionData,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      changeCurrencyCode: this.changeCurrencyCode,
      biddingOfferRemote,
      // 埋点二开用到，勿删 ！！！！ ---- start ----
      remoteHeaderInfo: biddingOfferRemote
        ? biddingOfferRemote.process(
            'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER_PROCESS_GET_STATE_DATA',
            {},
            {
              that: this,
            }
          ) || {}
        : {},
      // 埋点二开用到，勿删 ！！！！ ---- end ----
    };

    const ladderLevelRowSelection = {
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: this.handleLadderLevelRowSelectChange,
    };
    // 阶梯报价
    const ladderRecordProps = {
      form,
      ladderForm: this.getQuotationFormRefForm(),
      isUnTaxPriceFlag,
      quotationHeader,
      ladderListHeaderInfo,
      biddingQuotationLine,
      organizationId,
      ladderLevelSelectedRowKeys,
      ladderLevelRowSelection,
      fetchLadderListLoading,
      visible: ladderVisible,
      hideModal: this.hideLadderRecord,
      ladderLevelData: fetchLadderList,
      onSaveLadder: this.validateLadderQuotation,
      onCreateLadder: this.createLadderQuot,
      onDeleteLadder: this.deleteLadderQuot,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      validateLadderLoading, // 保存前的校验loading
    };

    // 只读物料行数据
    const lineDataSource = newBiddingLineColumns || [];
    const scrollX = sum(lineColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段

    const SectionPanelProps = {
      parentPage: {
        name: 'supplierQuotation',
        queryParams: {
          rfxHeaderId: rfxId,
        },
      },
      locatedCurrentUrl: this.locatedCurrentUrl,
      couldSectionSwitch: this.couldSectionSwitch,
      switchNotification: intl
        .get('ssrc.supplierQuotation.view.currentSectionInvalidUnselectSave')
        .d('当前标段下有必填项未填或者未勾选行数据，无法保存当前页面信息，是否确认切换页面'),
      paramKeys: ['quotationHeaderId'],
      projectLineSectionId: this.getRouterSearch('projectLineSectionId'),
      queryMain: this.querySupplier,
      beforeOpenSection: this.saveSectionData,
      isSection: BidSectionFlag,
      isBatchMaintainSection,
    };

    // 批量处理标段时候未勾选标段数据提示框
    const BatchProps = {
      parentPage: {
        name: batchOperateType,
        queryParams: {
          rfxHeaderId: rfxId,
        },
      },
      operationLoading: operationLoading || allLoading,
      visible: batchEmptySelectSectionFlag,
      handleOk: this.batchOperateSections,
      handleCancel: this.batchOperateSectionsCancel,
      onRef: this.batchEmptySectionRef,
      sectionAlertFlag: sectionFlag,
    };

    // 分标段操作提示modal
    const operateSectionPrompt = {
      dataList: operateSectionData,
      visible: operateSectionPromptFlag,
      handleOk: this.handleOkSectionOperatePrompt,
      handleCancel: this.handleCancellSectionOperatePrompt,
    };

    // 批量维护
    const batchMaintainProps = {
      form,
      quotationHeader,
      supplierSelectedRowKeys: selectedRowKeys,
      customizeForm,
      batchMaintainItemLineVisible,
      batchEditLineLockLoading,
      cancelBatchMaintainItemLine: this.cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine: this.saveBatchMaintainItemLine,
      resetBatchMaintainItemLine: this.resetBatchMaintainItemLine,
      oldBiddingOfferFlag: true, // 老竞价标识
    };

    return (
      <ModalProvider>
        <Header
          backPath={this.getBackPath()}
          title={intl
            .get(`ssrc.supplierQuotation.view.message.title.supplierBidding`)
            .d('供应商竞价')}
        >
          <React.Fragment>
            {customizeBtnGroup(
              {
                code: 'SSRC.SUPPLIER_QUOTATION_RFA.HEADER_BUTTONS',
                pro: true,
              },
              this.renderHeaderButtons()
            )}
          </React.Fragment>
        </Header>
        {/* cux */}
        {this.renderCuxTop({ sectionFlag })}
        {this.renderSectionAlert(sectionFlag)}

        <SectionPanel
          {...SectionPanelProps}
          onRef={(node) => {
            this.SectionRef = node;
          }}
          sectionAlertFlag={sectionFlag}
        >
          {/* cux */}
          {this.renderCuxBeforeContent({ sectionFlag })}

          <Content className={style.contentStyle}>
            <Spin
              spinning={fetchHeaderLoading || operationLoading || allLoading}
              wrapperClassName={classNames('ued-detail-wrapper')}
            >
              <InquiryHeader
                headerInfo={quotationHeader}
                tenantId={organizationId}
                {...headerProps}
              />
              {this.renderRankTable()}
              {/* 只读物料行 */}
              <div style={{ marginTop: '7px' }}>
                {inquiryTableReadOnly && (
                  <div>
                    <div style={{ marginBottom: '12px', marginLeft: '10px' }}>
                      <a
                        onClick={this.startBatchMaintainItemLine}
                        disabled={isEmpty(lineDataSource)}
                      >
                        <IconC7N
                          type="mode_edit"
                          style={{ marginRight: '8px', fontSize: '14px' }}
                        />
                        <C7NTooltip
                          title={
                            !selectedRowKeys?.length
                              ? intl
                                  .get('ssrc.inquiryHall.model.inquiryHall.batchEditAllData')
                                  .d('批量编辑全部数据')
                              : null
                          }
                        >
                          {selectedRowKeys?.length
                            ? intl
                                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckData')
                                .d('勾选批量编辑')
                            : intl
                                .get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance')
                                .d('批量维护')}
                        </C7NTooltip>
                      </a>
                    </div>
                    {batchMaintainItemLineVisible && <BatchMaintainFrom {...batchMaintainProps} />}
                    {customizeTable(
                      {
                        code: 'SSRC.SUPPLIER_QUOTATION_RFA.LINE',
                      },
                      <EditTable
                        bordered
                        rowKey="quotationLineId"
                        columns={lineColumns}
                        loading={fetchListLoading}
                        scroll={{ x: scrollX, y: '70vh' }}
                        rowSelection={rowSelection}
                        dataSource={lineDataSource}
                        onDataChange={this.hasChangeData}
                        pagination={quotationLinePagination}
                        onChange={this.handleTableChange}
                      />
                    )}
                  </div>
                )}
                {inquiryDetail ? (
                  <Spin spinning={fetchQuestionLineLoading}>
                    <div className={style.biddingDetail}>
                      {this.leftTableView(lineDataSource, quotationLinePagination)}
                      {this.rightDetailView()}
                      <div style={{ clear: 'both' }} />
                    </div>
                  </Spin>
                ) : (
                  ''
                )}
              </div>
            </Spin>
          </Content>
        </SectionPanel>

        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <QuoteAttachment {...AttachmentsProps} />
        </Modal>
        {ladderVisible ? <LadderLevelModal {...ladderRecordProps} /> : ''}
        {batchEmptySelectSectionFlag && <BatchEmptySelectedModal {...BatchProps} />}
        {operateSectionPromptFlag && <OperateSectionPromptModal {...operateSectionPrompt} />}
      </ModalProvider>
    );
  }
}

const HOCComponent = Form.create({
  fieldNameProp: null,
  onValuesChange: (props, value) => {
    const { dispatch } = props;
    if (isEmpty(value) || typeof dispatch !== 'function') {
      return;
    }

    dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        supplierFormChangeFlag: 1,
      },
    });
  },
})(
  withCustomize({
    unitCode: [
      'SSRC.SUPPLIER_QUOTATION_RFA.LINE',
      'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
      'SSRC.SUPPLIER_QUOTATION_RFA.ITEM_FORM',
      'SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
      'SSRC.SUPPLIER_QUOTATION_RFA.HEADER_BUTTONS',
      'SSRC.SUPPLIER_QUOTATION_RFA.BATCH_MAINTAIN_MATERIAL',
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.bidHall',
        'ssrc.priceLibrary',
        'ssrc.offlineResultEntry',
        'ssrc.scux',
        'sscux.ssrc',
      ],
    })(
      connect(({ supplierQuotation, quotationTemplate, loading, importExcel: { namespace } }) => ({
        supplierQuotation,
        quotationTemplate,
        namespace,
        loading,
        allLoading: loading.global,
        organizationId: getCurrentOrganizationId(),
        organizationUserId: getUserOrganizationId(),
        uploadExcelLoading: loading.effects['importExcel/uploadExcel'],
        validateDataLoading: loading.effects['importExcel/validateData'],
        loadDataSourceLoading: loading.effects['importExcel/loadDataSource'],
        importDataLoading: loading.effects['importExcel/importData'],
        queryStatusLoading: loading.effects['importExcel/queryStatus'],
        queryPrefixPatchLoading: loading.effects['importExcel/queryPrefixPatch'],
        saveLadderListLoading: loading.effects['supplierQuotation/saveLadderList'],
        fetchHeaderLoading: loading.effects['supplierQuotation/queryQuotationHeader'], // 竞价头loading
        fetchListLoading: loading.effects['supplierQuotation/queryQuotationLines'], // 竞价行loading
        fetchHistoryLoading: loading.effects['supplierQuotation/biddingHistory'], // 竞价历史loading
        saveQuotationLinesLoading: loading.effects['supplierQuotation/saveQuotationLines'], // 保存竞价行loading
        submitQuotationLinesLoading: loading.effects['supplierQuotation/submitQuotationLines'], // 提交竞价行loading
        fetchQuestionLineLoading: loading.effects['supplierQuotation/queryBiddingQuotationLine'], // 查询竞价行loading
        saveQuotationDetailDataLoading:
          loading.effects['supplierQuotation/saveQuotationDetailData'],
        fetchLadderListLoading: loading.effects['supplierQuotation/fetchLadderList'],
        deleteLadderQuotLoading: loading.effects['supplierQuotation/deleteLadderQuot'],
      }))(
        remote(
          {
            code: 'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER',
            name: 'biddingOfferRemote',
          },
          {
            events: {
              // 二开中对state的操作
              remoteSetStateData() {},
              remoteSectionBatchBeforeSubmit(props) {
                const { handleQuotationSectionBatchSubmitFunc = () => {} } = props || {};
                handleQuotationSectionBatchSubmitFunc();
              },
              updatePageValueAfterRefreshRollingQuery() {},
              pageUnmountOrLeaveCuxHandle() {}, // cux
              pageMountOrRetryCuxHandle() {}, // cux
              remoteAfterFetchHeader() {}, // cux
            },
          }
        )(BiddingOffer)
      )
    )
  )
);

// 同时写了两个hoc, 后期请整改
const hocBiddingOffer = (NewComponent) => {
  return Form.create({
    fieldNameProp: null,
    onValuesChange: (props, value) => {
      const { dispatch } = props;
      if (isEmpty(value) || typeof dispatch !== 'function') {
        return;
      }

      dispatch({
        type: 'supplierQuotation/updateState',
        payload: {
          supplierFormChangeFlag: 1,
        },
      });
    },
  })(
    withCustomize({
      unitCode: [
        'SSRC.SUPPLIER_QUOTATION_RFA.LINE',
        'SSRC.SUPPLIER_QUOTATION_RFA.LINE_FORM',
        'SSRC.SUPPLIER_QUOTATION_RFA.ITEM_FORM',
        'SSRC.SUPPLIER_QUOTATION_RFA.BASE_HEAD',
        'SSRC.SUPPLIER_QUOTATION_RFA.HEADER_BUTTONS',
        'SSRC.SUPPLIER_QUOTATION_RFA.BATCH_MAINTAIN_MATERIAL',
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.supplierQuotation',
          'ssrc.inquiryHall',
          'ssrc.common',
          'ssrc.bidHall',
          'ssrc.priceLibrary',
          'ssrc.offlineResultEntry',
          'ssrc.scux',
          'sscux.ssrc',
        ],
      })(
        connect(
          ({ supplierQuotation, quotationTemplate, loading, importExcel: { namespace } }) => ({
            supplierQuotation,
            quotationTemplate,
            namespace,
            allLoading: loading.global,
            organizationId: getCurrentOrganizationId(),
            organizationUserId: getUserOrganizationId(),
            uploadExcelLoading: loading.effects['importExcel/uploadExcel'],
            validateDataLoading: loading.effects['importExcel/validateData'],
            loadDataSourceLoading: loading.effects['importExcel/loadDataSource'],
            importDataLoading: loading.effects['importExcel/importData'],
            queryStatusLoading: loading.effects['importExcel/queryStatus'],
            queryPrefixPatchLoading: loading.effects['importExcel/queryPrefixPatch'],
            saveLadderListLoading: loading.effects['supplierQuotation/saveLadderList'],
            fetchHeaderLoading: loading.effects['supplierQuotation/queryQuotationHeader'], // 竞价头loading
            fetchListLoading: loading.effects['supplierQuotation/queryQuotationLines'], // 竞价行loading
            fetchHistoryLoading: loading.effects['supplierQuotation/biddingHistory'], // 竞价历史loading
            saveQuotationLinesLoading: loading.effects['supplierQuotation/saveQuotationLines'], // 保存竞价行loading
            submitQuotationLinesLoading: loading.effects['supplierQuotation/submitQuotationLines'], // 提交竞价行loading
            fetchQuestionLineLoading:
              loading.effects['supplierQuotation/queryBiddingQuotationLine'], // 查询竞价行loading
            saveQuotationDetailDataLoading:
              loading.effects['supplierQuotation/saveQuotationDetailData'],
            fetchLadderListLoading: loading.effects['supplierQuotation/fetchLadderList'],
            deleteLadderQuotLoading: loading.effects['supplierQuotation/deleteLadderQuot'],
            validateLadderLoading: loading.effects['supplierQuotation/validateLadderQuotation'], // 阶梯报价保存前的校验loading
          })
        )(
          remote(
            {
              code: 'SSRC_SUPPLIER_QUOTATION_BIDDING_OFFER',
              name: 'biddingOfferRemote',
            },
            {
              events: {
                // 二开中对state的操作
                remoteSetStateData() {},
                remoteSectionBatchBeforeSubmit(props) {
                  const { handleQuotationSectionBatchSubmitFunc = () => {} } = props || {};
                  handleQuotationSectionBatchSubmitFunc();
                },
                pageUnmountOrLeaveCuxHandle() {}, // cux
                pageMountOrRetryCuxHandle() {}, // cux
                remoteAfterFetchHeader() {}, // cux
              },
            }
          )(NewComponent)
        )
      )
    )
  );
};
export default HOCComponent;
export { BiddingOffer, HOCComponent as HOCBiddingOffer, hocBiddingOffer };
