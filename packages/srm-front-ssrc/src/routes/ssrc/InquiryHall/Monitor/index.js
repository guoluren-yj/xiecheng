/**
 * inquiryHall - 寻源服务/询价大厅-监控台
 * @date: 2019-2-22
 * @author: lbc <baocheng.li@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import notification from 'utils/notification';
import classNames from 'classnames';
import {
  Col,
  Collapse,
  Form,
  Icon,
  Pagination,
  Row,
  Select,
  Spin,
  Tabs,
  Tag,
  Button,
  Modal,
  Popover,
} from 'hzero-ui';
import { isNumber, map, isEmpty, isNil } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Bind, debounce, Throttle } from 'lodash-decorators';
import { Tooltip, Modal as c7nModal } from 'choerodon-ui/pro';
// import SockJS from 'sockjs-client';
// import Stomp from '@stomp/stompjs';

import remoteHoc from 'hzero-front/lib/utils/remote';
import webSocketManagener from 'utils/webSoket';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
// import { SRC_WEBSOCKET_HOST } from '_utils/config';
import { numberRender, totalRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import { getActiveTabKey } from 'utils/menuTab';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import { BID, INQUIRY, getQuotationName, getSourceCategoryName, RFX } from '@/utils/globalVariable';

import PinFixed from '@/routes/ssrc/components/PinFixed';
import annexImg from '@/assets/item-icon.svg';
import { handleWarningSupplierQuotation } from '@/services/inquiryHallNewService';
import {
  queryEnableDoubleUnit,
  querySslmLifeCycleConfig,
  queryConfigurationOldRate,
} from '@/services/commonService';
import { isText } from '@/utils/utils';
import ChatRoomSourceLink from '@/routes/components/ChatRoomSource/ChatRoomSourceLink';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import CountDown from '../../components/CountDown';
import RecordTable from './RecordTable';
import SupplierTable from './SupplierTable';
import PriceChart from './Chart';

import styles from './index.less';
import style from '../../SupplierQuotation/InquiryPrice/Header.less';

// import { handleFetchSupplierTableLine } from '@/services/inquiryHallService';

const { Panel } = Collapse;
const { Option } = Select;
const FormItem = Form.Item;

// const IntervalTime = 2_000;

class Monitor extends PureComponent {
  // subscribeUrl = [];

  // stompClient;

  // socket;

  // count = 0;

  state = {
    recordDetail: {}, // 物料行record
    activeKey: [],
    collapseKeys: {}, // 打开的折叠面板key
    inquiryTableReadOnly: true, // 默认只读列表为true
    itemLineChatActiveKey: 'unitPrice', // 物料图表当前页
    showQuotation: 'VALID_QUOTATION', // 有效报价/历史报价
    activeTab: 'itemDetails',
    startRFAVisible: true, // 开始竞价是否可见
    expand: {},
    roundNum: 1,
    priceComparisonModalVisible: false, // 比价助手显隐
    doubleUnitFlag: false, // 双单位标识
    pinFixed: false, // ping to top position
    sslmLifeCycleFlag: true, // 跳转360查询标识
    useNewRateFlag: 0, // 是否使用老重合率标识
  };

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = this.sourceKey === BID;

  quotationName = getQuotationName(this.bidFlag);

  sourceCategoryName = getSourceCategoryName(this.bidFlag);

  supplierUrl = '';

  //* ************** */
  // 用于协鑫二开定时器 以便组件卸载时清除计时
  //* ************** */
  timer;

  // supplierTableTimer = null;

  componentDidMount() {
    this.initData();

    // 浏览器切换事件
    document.addEventListener('visibilitychange', this.chromeTabVisibilityChange);
  }

  async initData() {
    // 先查询头行
    const searchData = () => {
      return Promise.all([this.fetchItemLine(), this.fetchMonitorHeader()]);
    };
    await searchData();
    this.afterQueryHeader();
    this.fetchMonitorSupplierLine();
    // this.fetchSupplierLinePolling();
    // this.connectWebsocket(); // 询价监控台websocket初始

    this.initWebSoketConnect();
    this.registerReleasedListSocketConnect();
    this.queryDoubleUnit();
    this.handleSearchSslmLifeCycleConfig();
    this.fetchUseOldRate();
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
   * 查询开启新360页面的租户
   */
  async handleSearchSslmLifeCycleConfig() {
    const result = getResponse(await querySslmLifeCycleConfig());
    if (result) {
      this.setState({
        sslmLifeCycleFlag: !!result?.length,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;

    // this.clearSupplierLineInterval();

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
        itemLine: [],
      },
    });

    this.closeSocket();

    //* ************** */
    // 用于协鑫二开 以便组件卸载时清除计时
    //* ************** */
    clearInterval(this.timer);
    // this.clearDelayUpdateChartAndHistoryTimer();

    document.removeEventListener('visibilitychange', this.chromeTabVisibilityChange);
  }

  // chrome change tab event handle
  chromeTabVisibilityChange = () => {
    // const { inquiryDetail, currentRecord } = this.state;
    const HiddenChromeTabFlag = document?.hidden;

    if (!HiddenChromeTabFlag) {
      this.fetchMonitorHeader(); // 浏览器切换，倒计时需要更新查询
    } else {
      // todo
    }
  };

  // clear supplier line interval
  // clearSupplierLineInterval() {
  //   if (this.supplierTableTimer) {
  //     clearInterval(this.supplierTableTimer);
  //   }
  // }

  /**
   * 请求头数据
   */
  fetchMonitorHeader() {
    const { dispatch, organizationId, match, modelName = 'inquiryHall' } = this.props;
    const {
      path = null,
      params: { rfxId },
    } = match;

    if (!rfxId) {
      return;
    }

    return dispatch({
      type: `${modelName}/fetchMonitorHeaderDetail`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        path,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.MONITOR.FORM_HEADER`,
      },
    });
  }

  // 查询头后处理
  afterQueryHeader() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { itemLine = [], header = {} },
    } = this.props;
    const { rankRule = null, sealedQuotationFlag = 0, quotationStartDate = null, fastBidding } =
      header || {};
    if (rankRule === 'WEIGHT_PRICE') {
      this.setState({
        itemLineChatActiveKey: 'weightPrice',
      });
    }
    const timeToQuotationStartDate = !quotationStartDate || moment().isBefore(quotationStartDate);
    this.setState({
      activeTab: timeToQuotationStartDate || sealedQuotationFlag ? 'supplierList' : 'itemDetails',
      inquiryTableReadOnly: fastBidding && timeToQuotationStartDate,
    });
    this.openTableDetail(itemLine && itemLine.length && itemLine[0]);
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const { dispatch, organizationId, match, modelName = 'inquiryHall' } = this.props;
    const {
      params: { rfxId },
    } = match;
    if (!rfxId) {
      return;
    }

    return dispatch({
      type: `${modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxId,
      },
    });
  }

  @Bind()
  getDataSource() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { monitorSupplierLine = [] },
    } = this.props;
    return monitorSupplierLine;
  }

  @Bind()
  fetchMonitorSupplierLine(page = {}) {
    const { match, dispatch, organizationId, modelName = 'inquiryHall', remote } = this.props;
    const {
      params: { rfxId },
    } = match;
    const {
      [modelName]: { header = {} },
    } = this.props;
    if (!rfxId) {
      return;
    }

    dispatch({
      type: `${modelName}/fetchMonitorSupplierLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.MONITOR.SUPPLIER_TABLE`,
      },
    }).then((res) => {
      if (res && !res.failed) {
        if (remote?.event) {
          remote.event.fireEvent('updateDataSource', {
            monitorSupplierLine: res.content,
            dispatch,
            modelName,
            that: this,
            header,
            getDataSource: this.getDataSource,
          });
        }
      }
    });
  }

  /**
   * 获取双单位标识
   */
  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: RFX }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  @Bind()
  parseSupplierSocket(res) {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const monitorSupplierLine = JSON.parse(res.body);
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        monitorSupplierLine,
      },
    });
  }

  /**
   * 连接websocket
   */
  // connectWebsocket() {
  //   const { modelName = 'inquiryHall' } = this.props;
  //   const {
  //     [modelName]: { header = {} },
  //     // organizationId,
  //   } = this.props;
  //   const { rfxNum = null, roundNumber = null, tenantId = null } = header || {};

  //   let num = 1;
  //   const AccessToken = getAccessToken();
  //   const url = `${SRC_WEBSOCKET_HOST}/ssrc-stomp?token=${AccessToken}`;

  //   if (this.count === 0) {
  //     this.socket = new SockJS(url);
  //     this.stompClient = Stomp.over(this.socket);
  //   }

  //   this.count++;
  //   const MonitorSocketUri = `/topic/monitor/change/${tenantId}/${rfxNum}/${roundNumber}`;
  //   const isMonitorScoketSubscribe = this.subscribeUrl.indexOf(MonitorSocketUri) > -1;

  //   if (this.stompClient?.connected) {
  //     if (!isMonitorScoketSubscribe) {
  //       this.stompClient.subscribe(MonitorSocketUri, (data = {}) => {
  //         if (data) {
  //           this.handleSocketMessage(data);
  //         }
  //       });
  //       this.subscribeUrl.push(MonitorSocketUri);
  //     }
  //   } else {
  //     this.stompClient.connect(
  //       {},
  //       () => {
  //         this.stompClient.subscribe(MonitorSocketUri, (data = {}) => {
  //           if (data) {
  //             this.handleSocketMessage(data);
  //           }
  //         });
  //         this.subscribeUrl.push(MonitorSocketUri);
  //       },
  //       (err) => {
  //         if (err) {
  //           if (num < 6) {
  //             num += 1;
  //             this.connectWebsocket();
  //           } else {
  //             this.closeSocket();
  //             this.count = 0;
  //           }
  //         }
  //       }
  //     );
  //   }
  // }

  // clearDelayUpdateChartAndHistoryTimer = () => {
  //   clearTimeout(this.delayUpdateChartAndHistoryTimer);
  // };

  // websocket推送标识后 调用接口
  @debounce(1000)
  async handleSocketMessage(data = {}) {
    const { remote } = this.props;
    const { recordDetail = {} } = this.state;
    const { changeFlag = 0 } = data || {};

    // this.clearDelayUpdateChartAndHistoryTimer();
    if (changeFlag === 1) {
      this.fetchMonitorHeader();

      this.fetchItemLine();
      this.fetchLineData(recordDetail);
      this.fetchRecord({}, recordDetail);
      this.fetchMonitorSupplierLine();

      // 多个接口同时操作数据源itemLine,会导致数据更新错乱
      // this.delayUpdateChartAndHistoryTimer = setTimeout(() => {
      //   this.fetchItemLine();
      // }, 500);
    }

    if (remote?.event) {
      remote.event.fireEvent('cuxHandleAfterSocketMessage', {
        that: this,
        data,
      });
    }
  }

  /**
   * 建立webSocket链接
   */
  // initWebSocket(m = {}) {
  //   const { modelName = 'inquiryHall' } = this.props;
  //   const {
  //     [modelName]: { header = {} },
  //     organizationId,
  //   } = this.props;
  //   const { rfxNum = null, roundNumber = null, tenantId = null } = header || {};
  //   const { rfxLineItemNum = {} } = m || {};
  //   let num = 1;
  //   const AccessToken = getAccessToken();
  //   const url = `${SRC_WEBSOCKET_HOST}/ssrc-stomp?token=${AccessToken}`;
  //   if (this.count === 0) {
  //     this.socket = new SockJS(url);
  //     this.stompClient = Stomp.over(this.socket);
  //   }
  //   this.count++;
  //   const TendencyUri = `/topic/tendency/${tenantId}/${rfxNum}-${rfxLineItemNum}`;

  //   const isHistorySubscribe =
  //     this.subscribeUrl.indexOf(`/topic/history/${tenantId}/${rfxNum}-${rfxLineItemNum}`) > -1;
  //   const isTendencySubscribe = this.subscribeUrl.indexOf(TendencyUri) > -1;
  //   const isSupplierSubscribe =
  //     this.subscribeUrl.indexOf(
  //       `/topic/monitor/supplier/${organizationId}/${rfxNum}/${roundNumber}`
  //     ) > -1;

  //   if (this.stompClient.connected) {
  //     if (!isHistorySubscribe) {
  //       this.stompClient.subscribe(
  //         `/topic/history/${tenantId}/${rfxNum}-${rfxLineItemNum}`,
  //         (data) => {
  //           if (data) {
  //             this.parseWebSocketInfo(m, data, 1);
  //           }
  //         }
  //       );
  //       this.subscribeUrl.push(`/topic/history/${tenantId}/${rfxNum}-${rfxLineItemNum}`);
  //     }
  //     if (!isTendencySubscribe) {
  //       this.stompClient.subscribe(TendencyUri, (data) => {
  //         if (data) {
  //           this.parseWebSocketInfo(m, data, 2);
  //         }
  //       });
  //       this.subscribeUrl.push(TendencyUri);
  //     }
  //     if (!isSupplierSubscribe) {
  //       this.stompClient.subscribe(
  //         `/topic/monitor/supplier/${organizationId}/${rfxNum}/${roundNumber}`,
  //         (data) => {
  //           if (data) {
  //             this.parseSupplierSocket(data);
  //           }
  //         }
  //       );
  //       this.subscribeUrl.push(
  //         `/topic/monitor/supplier/${organizationId}/${rfxNum}/${roundNumber}`
  //       );
  //     }
  //   } else {
  //     this.stompClient.connect(
  //       {},
  //       () => {
  //         this.stompClient.subscribe(
  //           `/topic/history/${tenantId}/${rfxNum}-${rfxLineItemNum}`,
  //           (data) => {
  //             if (data) {
  //               this.parseWebSocketInfo(m, data, 1);
  //             }
  //           }
  //         );
  //         this.stompClient.subscribe(TendencyUri, (data) => {
  //           if (data) {
  //             this.parseWebSocketInfo(m, data, 2);
  //           }
  //         });

  //         this.stompClient.subscribe(
  //           `/topic/monitor/supplier/${organizationId}/${rfxNum}/${roundNumber}`,
  //           (data) => {
  //             if (data) {
  //               this.parseSupplierSocket(data);
  //             }
  //           }
  //         );
  //         this.subscribeUrl.push(TendencyUri);
  //         this.subscribeUrl.push(`/topic/history/${tenantId}/${rfxNum}-${rfxLineItemNum}`);
  //         this.subscribeUrl.push(
  //           `/topic/monitor/supplier/${organizationId}/${rfxNum}/${roundNumber}`
  //         );
  //       },
  //       (err) => {
  //         if (err) {
  //           if (num < 6) {
  //             num += 1;
  //             this.initWebSocket(m);
  //           } else {
  //             this.closeSocket();
  //           }
  //         }
  //       }
  //     );
  //   }
  // }

  // /**
  //  * 解析websocket传来的信息
  //  */
  // parseWebSocketInfo(line = {}, data = {}, type) {
  //   const { modelName = 'inquiryHall' } = this.props;
  //   const {
  //     [modelName]: { itemLine = [] },
  //     dispatch,
  //   } = this.props;
  //   const { showType, rfxLineItemId } = line || {};
  //   const item = itemLine.filter((i) => i.rfxLineItemId === rfxLineItemId)[0];

  //   const DataBody = JSON.parse(data.body);

  //   if (item) {
  //     if (type === 1) {
  //       if (showType === 'VALID_QUOTATION' || !showType) {
  //         item.recordList = DataBody?.VALID_QUOTATION?.content || [];
  //         item.recordListPagination = this.createPagination(DataBody?.VALID_QUOTATION, line);
  //       } else {
  //         item.recordList = DataBody?.ALL_QUOTATION?.content || [];
  //         item.recordListPagination = this.createPagination(DataBody?.ALL_QUOTATION, line);
  //       }
  //     } else {
  //       item.lineData = DataBody || [];
  //     }
  //   }

  //   dispatch({
  //     type: `${modelName}/updateState`,
  //     payload: {
  //       itemLine,
  //     },
  //   });
  // }

  /**
   * 定时器-查询供应商列表信息
   * 采用轮循
   * */
  // fetchSupplierLinePolling() {
  //   this.supplierTableTimer = setInterval(() => this.handleFetchSupplierTableLine(), IntervalTime);
  // }

  // 查询供应商信息数据推送
  // async handleFetchSupplierTableLine() {
  //   const { modelName = 'inquiryHall' } = this.props;
  //   const {
  //     organizationId,
  //     match = {},
  //     [modelName]: { header = {} },
  //   } = this.props;
  //   const {
  //     params: { rfxId },
  //   } = match || {};
  //   const {
  //     benchmarkPriceType = null,
  //     sealedQuotationFlag = null,
  //     quotationScope = null,
  //     roundNumber = null,
  //   } = header || {};
  //   let result = null;

  //   if (!rfxId || !organizationId) {
  //     return;
  //   }

  //   const disabledFetchNewMessageFlag =
  //     sealedQuotationFlag === 0 && quotationScope === 'ALL_QUOTATION';
  //   if (!disabledFetchNewMessageFlag) {
  //     return;
  //   }

  //   const param = {
  //     rfxHeaderId: rfxId,
  //     organizationId,
  //     benchmarkPriceType,
  //     roundNumber,
  //   };

  //   try {
  //     result = await handleFetchSupplierTableLine(param);
  //     result = getResponse(result);
  //     if (!result) {
  //       this.clearSupplierLineInterval();
  //       return;
  //     }
  //     this.parseSupplierQuotationPolling(result);
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  // 供应商表格轮循接口数据处理
  // parseSupplierQuotationPolling(supplierList = []) {
  //   const { modelName = 'inquiryHall' } = this.props;
  //   const {
  //     dispatch,
  //     [modelName]: { monitorSupplierLine = [] },
  //   } = this.props;
  //   if (isEmpty(supplierList) || isEmpty(monitorSupplierLine)) {
  //     return;
  //   }

  //   let newMonitorSupplierLine = null;
  //   // let currentTotalAmountRank = 1_000_000_000; // 本地设置一个大的数字，如果有接口排名，按照接口轮循排名，如果没有，就按照查询
  //   newMonitorSupplierLine = monitorSupplierLine.map((supplierItem = {}) => {
  //     const { quotationHeaderId } = supplierItem || {};
  //     const newData = supplierList.filter((item) => item.quotationHeaderId === quotationHeaderId);
  //     // currentTotalAmountRank += 1;

  //     if (isEmpty(newData)) {
  //       return {
  //         ...supplierItem,
  //         totalAmountRank: null,
  //         benchmarkTotalAmount: null,
  //         // currentTotalAmountRank,
  //       };
  //     }

  //     const { totalAmountRank = null, benchmarkTotalAmount = null } = newData[0] || {};
  //     return {
  //       ...supplierItem,
  //       totalAmountRank,
  //       benchmarkTotalAmount,
  //       // currentTotalAmountRank: totalAmountRank,
  //     };
  //   });

  //   // newMonitorSupplierLine = newMonitorSupplierLine.sort(
  //   //   (m = {}, n = {}) => m?.currentTotalAmountRank - n?.currentTotalAmountRank
  //   // );

  //   dispatch({
  //     type: `${modelName}/updateState`,
  //     payload: {
  //       monitorSupplierLine: newMonitorSupplierLine,
  //     },
  //   });
  // }

  /**
   * 关闭socket
   */
  closeSocket() {
    // if (this.stompClient && this.stompClient.connected) {
    //   this.stompClient.disconnect();
    // }

    if (this.supplierUrl && webSocketManagener.removeListener) {
      webSocketManagener.removeListener(this.supplierUrl, this.socketMessageSupplierEvent);
    }

    if (webSocketManagener?.destroyWebSocket) {
      webSocketManagener.destroyWebSocket();
    }
  }

  /**
   * 初始化webSoket连接
   */
  initWebSoketConnect() {
    if (webSocketManagener.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
    }
  }

  /**
   * 注册发布列表连接
   */
  registerReleasedListSocketConnect() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {} },
      // organizationId,
    } = this.props;
    const { rfxNum = null, roundNumber = null, tenantId = null } = header || {};

    this.supplierUrl = `/topic/monitor/change/${tenantId}/${rfxNum}/${roundNumber}`;
    webSocketManagener.addListener(this.supplierUrl, this.socketMessageSupplierEvent);
  }

  @Bind()
  socketMessageSupplierEvent(messageData) {
    if (!messageData) {
      return;
    }
    const data = JSON.parse(messageData?.message);
    console.log(`/topic/monitor/change/`, '1', messageData, data);
    this.handleSocketMessage(data);
  }

  /**
   * 表单头
   */
  renderHeaderForm(header) {
    const {
      customizeForm,
      form,
      form: { getFieldDecorator },
    } = this.props;
    const dataSource = header;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL.MONITOR.FORM_HEADER`,
        form,
        dataSource: header,
        readOnly: true,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategoryMeaning', {
                initialValue:
                  dataSource.secondarySourceCategoryMeaning || dataSource.sourceCategoryMeaning,
              })(
                <span>
                  {dataSource.secondarySourceCategoryMeaning || dataSource.sourceCategoryMeaning}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateName', {
                initialValue: dataSource.templateName,
              })(<span>{dataSource.templateName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: dataSource.companyName,
              })(<span>{dataSource.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning', {
                initialValue: dataSource.sourceMethod,
              })(<span>{dataSource.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: dataSource.exchangeRate,
              })(<span>{numberRender(dataSource.exchangeRate, 8, false)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('auctionDirectionMeaning', {
                initialValue: dataSource.auctionDirectionMeaning,
              })(<span>{dataSource.auctionDirectionMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: dataSource.currencyCode,
              })(<span>{dataSource.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTimeRFX`, {
                  quotationName: this.quotationName,
                })
                .d(`{quotationName}开始时间`)}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: dataSource.quotationStartDate,
              })(<span>{dateTimeRender(dataSource.quotationStartDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
                  quotationName: this.quotationName,
                })
                .d(`{quotationName}截止时间`)}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: dataSource.quotationEndDate,
              })(<span>{dateTimeRender(dataSource.quotationEndDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rfxRemark', {
                initialValue: dataSource.rfxRemark,
              })(<span>{dataSource.rfxRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   *渲染物品明细
   * itemLine--物料数据
   */
  renderItemChart(itemLine) {
    if (itemLine && itemLine.length > 0) {
      return itemLine.map((m) => (
        <div>
          <div>
            <div className={styles.arrowStyle}>{this.renderItemChartTitle(m)}</div>
          </div>
        </div>
      ));
    }
  }

  /**
   * 根据后台返还的数据生成table分页
   * @param data-接口数据
   * @param m-当前物料
   * @returns {{showSizeChanger: boolean, pageSizeOptions: number[], current: *, pageSize: *, total: *, showTotal: *, onChange: (function(*=, *=): void)}}
   */
  createPagination(data, m) {
    if (data) {
      return {
        showSizeChanger: true,
        pageSizeOptions: ['10'],
        current: (isNumber(data.number) ? data.number : data.start) + 1,
        pageSize: data.size, // 每页大小
        total: isNumber(data.totalElements) ? data.totalElements : data.total,
        showTotal: totalRender,
        onChange: (page, pageSize) => this.changeCurrent(page, pageSize, m),
      };
    }
  }

  /**
   * 报价历史记录table切换分页
   * @param page--跳转的页数
   * @param pageSize--每页的条数
   * @param m--当前物料
   */
  changeCurrent(page, pageSize, m) {
    // this.clearTimerInterval();

    const pageObj = {
      current: page,
      pageSize,
    };
    this.fetchRecord(pageObj, m);
    // this.fetchItemLineQuotationInterval(m);
  }

  // render popover value
  renderItemNameAndCodePopover = (record = {}) => {
    const { itemName, itemCode } = record || {};
    const textValue = itemName && itemCode ? `${itemCode}-${itemName}` : itemCode || itemName || '';

    return <Popover content={textValue}>{textValue}</Popover>;
  };

  renderWithPopover = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    return <Popover content={value}>{value}</Popover>;
  };

  /**
   * 渲染单个物料的头部
   */
  renderItemChartTitle(m = {}) {
    const { lineStatusMeaning } = m || {};

    return (
      <div className={styles.itemList}>
        <div className={styles.itemListImg}>
          <img src={annexImg} alt="" style={{ width: 44, height: 44 }} />
        </div>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <span className={styles.itemListNum}>{this.renderItemNameAndCodePopover(m)}</span>
            <span className={styles.tagstylem}>
              <Tag className={styles.line}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
                {m.rfxLineItemNum}
              </Tag>
              {m.lineStatus === 'NOT_START' && (
                <Tag
                  className={styles.lineNot}
                  style={{ backgroundColor: 'rgb(170, 170, 170, 0.1)' }}
                >
                  {this.renderWithPopover(lineStatusMeaning)}
                </Tag>
              )}
              {m.lineStatus === 'FINISHED' && (
                <Tag
                  className={styles.lineFinshed}
                  style={{ backgroundColor: 'rgb(41, 190, 206, 0.1)' }}
                >
                  {this.renderWithPopover(lineStatusMeaning)}
                </Tag>
              )}
              {m.lineStatus === 'IN_QUOTATION' && (
                <Tag
                  className={styles.lineQuoing}
                  style={{ backgroundColor: 'rgb(6, 135, 255, 0.1)' }}
                >
                  {this.renderWithPopover(lineStatusMeaning)}
                </Tag>
              )}
              <Tooltip placement="topLeft" title={`${m.rfxQuantity} (${m.uomName})`}>
                <Tag className={styles.rfxQuantity}>
                  {m.rfxQuantity}（{m.uomName}）
                </Tag>
              </Tooltip>
              <Tag className={styles.other}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.quotationRange').d('报价幅度')}：
                {m.quotationRange}
              </Tag>
              <Tag className={styles.other}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：{m.taxRate}
              </Tag>
            </span>
          </div>
          <div className={styles.itemListDes}>
            <span className={styles.itemListDesItem}>
              {dateTimeRender(m.quotationStartDate)}--{dateTimeRender(m.quotationEndDate)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 切换历史报价/有效报价请求对应的数据
   */
  changePriceType(m, value) {
    // this.clearTimerInterval();
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { itemLine },
      dispatch,
    } = this.props;
    const item = itemLine.filter((v) => v.rfxLineItemId === m.rfxLineItemId)[0];
    if (item) {
      item.showType = value;
    }
    this.setState({
      showQuotation: value,
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: itemLine,
    });
    this.fetchRecord({}, m);
    // this.fetchItemLineQuotationInterval(m);
  }

  /**
   * changeToLineAmount
   * 切换至于行金额
   */
  changeToLineAmount(m, key = null) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { itemLine },
      dispatch,
    } = this.props;
    const item = itemLine.filter((v) => v.rfxLineItemId === m.rfxLineItemId)[0];
    if (item) {
      item.priceCategory = 'linePrice';
      dispatch({
        type: `${modelName}/updateState`,
        payload: itemLine,
      });
    }
    this.setState({
      itemLineChatActiveKey: key,
    });
  }

  /**
   * changeToPrice
   * 切换至单价
   */
  changeToPrice(m) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { itemLine },
      dispatch,
    } = this.props;
    const item = itemLine.filter((v) => v.rfxLineItemId === m.rfxLineItemId)[0];
    if (item) {
      item.priceCategory = 'unitPrice';
      dispatch({
        type: `${modelName}/updateState`,
        payload: itemLine,
      });
    }
    this.setState({
      itemLineChatActiveKey: 'unitPrice',
    });
  }

  // 打开权重图表
  @Bind()
  changeToWeightPrice() {
    this.setState({
      itemLineChatActiveKey: 'weightPrice',
    });
  }

  /**
   * 切换物品行
   */
  @Bind()
  openTableDetail(item = {}) {
    if (isEmpty(item)) {
      return;
    }

    this.setState({
      expand: {
        [item.rfxLineItemNum]: [item.rfxLineItemNum],
      },
      recordDetail: item,
    });
    // this.initWebSocket(item);
    this.fetchRecord({}, item);
    this.fetchLineData(item);
    // this.fetchItemLineQuotationInterval(item); // 以轮循机制查询物品行报价信息, 大批量报价信息wwebsocket性能问题突出
  }

  /**
   * 请求报价历史
   */
  @Bind()
  fetchRecord(page = {}, m = {}) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      match,
      dispatch,
      organizationId,
      [modelName]: { itemLine = [] },
    } = this.props;
    const {
      params: { rfxId },
    } = match;
    let { showType } = m || {};
    const { rfxLineItemId } = m || {};

    if (showType === 'VALID_QUOTATION' || !showType) {
      showType = 'VALID_QUOTATION';
      this.setState({
        showQuotation: 'VALID_QUOTATION',
      });
    } else {
      this.setState({
        showQuotation: 'ALL_QUOTATION',
      });
    }

    if (!rfxLineItemId) {
      return;
    }

    dispatch({
      type: `${modelName}/fetchRecord`,
      payload: {
        rfxLineItemId,
        rfxHeaderId: rfxId,
        organizationId,
        page,
        showType,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.MONITOR.HISTORY_TABLE`,
      },
    }).then((res) => {
      if (res) {
        const item = itemLine.filter((i) => i.rfxLineItemId === m?.rfxLineItemId);
        if (!isEmpty(item)) {
          item[0].recordList = res.content;
          item[0].recordListPagination = this.createPagination(res, m);
        }
        this.updateRecordDetail(item[0]);

        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine,
          },
        });
      }
    });
  }

  /**
   * 请求折线图数据
   */
  @Bind()
  fetchLineData(m = {}) {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      match,
      dispatch,
      organizationId,
      [modelName]: { itemLine = [] },
    } = this.props;
    const {
      params: { rfxId },
    } = match;

    const { rfxLineItemId } = m || {};

    if (!rfxLineItemId) {
      return;
    }

    dispatch({
      type: `${modelName}/fetchLineData`,
      payload: {
        rfxLineItemId: m.rfxLineItemId,
        rfxHeaderId: rfxId,
        organizationId,
      },
    }).then((res) => {
      if (res) {
        const item = itemLine.filter((i) => i.rfxLineItemId === m?.rfxLineItemId);
        if (!isEmpty(item)) {
          item[0].lineData = res;
        }
        this.updateRecordDetail(item[0]);

        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            itemLine,
          },
        });
      }
    });
  }

  // 更新当前行记录数据信息
  updateRecordDetail(item = {}) {
    this.setState({
      recordDetail: item ?? {},
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  /**
   * 物品明细 - 改变分页
   */
  onChangePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchItemLine(changedPagination);
  }

  // item export
  renderExportButton = () => {
    const { organizationId, match } = this.props;
    const { showQuotation, recordDetail } = this.state;
    const { params: { rfxId } = {}, path } = match || {};
    const { rfxLineItemId } = recordDetail || {};

    if (!rfxLineItemId || !rfxId) {
      return '';
    }

    const code = !this.bidFlag
      ? 'SRM_C_SRM_SSRC_RFX_SUPERVISOR_QUOTATION_HISTORY_EXPORT'
      : 'SRM_C_SRM_SSRC_BID_SUPERVISOR_QUOTATION_HISTORY_EXPORT';

    const exportProps = {
      templateCode: code,
      method: 'POST',
      otherButtonProps: {
        icon: 'unarchive',
        type: 'c7n-pro',
        funcType: 'flat',
        permissionList: [
          {
            code: `${path}.button.batch-export-new`,
            type: 'button',
            meaning:
              intl
                .get(`ssrc.inquiryHall.model.inquiryHall.CommonMonitoringPlatform`, {
                  sourceCategoryName: this.sourceCategoryName,
                })
                .d(`{sourceCategoryName}监控台`) - intl.get('hzero.common.button.export').d('导出'),
          },
        ],
      },
      name: 'export',
      queryParams: {
        rfxHeaderId: rfxId,
        showType: showQuotation,
        size: 10,
        page: 0,
        rfxLineItemId,
      },
      buttonText: intl.get('hzero.common.button.export').d('导出'),
      requestUrl: `/ssrc/v1/${organizationId}/rfx/supervisor/history/new-export`,
      allBody: true,
    };

    return <ExcelExportNew {...exportProps} />;
  };

  /**
   * render-页面小逻辑处理
   */
  /**
   *  quotationLineStatusTablcColor - 列表行状态颜色变化
   *  NEW-新建，SUBMITTED-已报价， ABANDONED-放弃, TAKENBACK-收回，BARGAINED-已还价
   */
  @Bind()
  quotationLineStatusTableColor(item) {
    let color = '';
    let backGround = '';
    const { lineStatusMeaning } = item || {};

    switch (item.lineStatus) {
      case 'NOT_START':
        color = '#aaaaaa';
        backGround = 'rgb(170, 170, 170, 0.1)';
        break;
      case 'FINISHED':
        color = '#29BECE';
        backGround = 'rgb(41, 190, 206, 0.1)';
        break;
      case 'IN_QUOTATION':
        color = '#0687FF';
        backGround = 'rgb(6, 135, 255, 0.1)';
        break;
      default:
        color = '#5867dd';
        backGround = '#5867dd';
    }
    return (
      <Tag
        style={{
          color,
          maxWidth: '120px',
          textAlign: 'center',
          backgroundColor: backGround,
          border: 0,
        }}
      >
        <Popover content={lineStatusMeaning}>{lineStatusMeaning}</Popover>
      </Tag>
    );
  }

  /**
   * renderTableInfo -  table固定信息
   */
  @Bind()
  renderTableInfo(item) {
    const { expand } = this.state;
    const { specs = '' } = item || {};

    return (
      <div
        onClick={() => this.openTableDetail(item)}
        className={expand[item.rfxLineItemNum] ? style.selectItem : style.leftHover}
        key={item.rfxLineItemNum}
      >
        <div className={style.listTop}>
          <div className={style.rfxLineItemNumLeft}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}:{item.rfxLineItemNum}
          </div>
          <div className={style.tagRight}>{this.quotationLineStatusTableColor(item)}</div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className={style.listBottom}>
          <div className={style.itemCodeStyle}>{this.renderItemNameAndCodePopover(item)}</div>
        </div>
        {!isNil(specs) ? (
          <div className={style.listBottom}>
            <div className={styles.longTextEllipsis}>
              <Tooltip title={specs} placement="topLeft">
                {specs || ''}
              </Tooltip>
            </div>
          </div>
        ) : (
          ''
        )}
        <div className={styles.listBottom}>
          <div>
            <span className={styles.itemListDesItem}>
              {dateTimeRender(item.quotationStartDate)}--{dateTimeRender(item.quotationEndDate)}
            </span>
          </div>
          {this.renderSupplierQuotationInfo(item)}
        </div>
      </div>
    );
  }

  /**
   * 【逻辑说明】
1.物料行的报价供应商数量=0,供应商数量显示红色；0<物料行的报价供应商数量<最少报价供应商数量，供应商数量显示蓝色；物料行的报价供应商数量≥最少报价供应商数量,供应商数量显示绿色
  */
  renderSupplierQuotationInfo = (item) => {
    const { modelName = 'inquiryHall' } = this.props;
    const { [modelName]: { header = {} } = {} } = this.props;
    const { minQuotedSupplier } = header || {};
    const { supplierQuotedCount } = item || {};

    if (isNil(supplierQuotedCount)) {
      return '';
    }

    let color = 'red'; // === 0
    if (supplierQuotedCount > 0) {
      if (supplierQuotedCount < minQuotedSupplier) {
        color = 'blue';
      }
      if (supplierQuotedCount >= minQuotedSupplier) {
        color = 'green';
      }
    }

    const text = (
      <span>
        <span style={{ color }}>{supplierQuotedCount}</span>
        {intl
          .get(`ssrc.inquiryHall.model.inquiryHall.theSupplierQuotedNums`, {
            type: getQuotationName(this.bidFlag),
          })
          .d('家供应商{type}')}
      </span>
    );

    return (
      <div className={styles.supplierInfos}>
        <Tooltip title={text}>{text}</Tooltip>
      </div>
    );
  };

  /**
   * 左边物料列表页
   */
  @Bind()
  leftTableView(itemLine, itemLinePagination) {
    return (
      <div className={style.detailLeft}>
        {map(itemLine, (item) => {
          return (
            <div
              className={classNames(style.leftList, style.leftListMonitor)}
              key={String(item.rfxLineItemId)}
            >
              {this.renderTableInfo(item)}
            </div>
          );
        })}
        <Pagination
          {...itemLinePagination}
          onChange={(page, pageSize) => this.onChangePagination(page, pageSize)}
          onShowSizeChange={(current, size) => this.onChangePagination(current, size)}
          className={style.pagination}
          size="small"
        />
      </div>
    );
  }

  /**
   * rightDetailView -  右边物料行详情页
   */
  @Bind()
  rightDetailView() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      fetchRecordLoading,
      [modelName]: { header = {} },
      customizeTable = () => {},
      match,
    } = this.props;
    const {
      recordDetail = {},
      itemLineChatActiveKey,
      showQuotation,
      doubleUnitFlag,
      useNewRateFlag = 0,
    } = this.state;
    const {
      recordList = [],
      recordListPagination = {},
      lineData = [],
      priceCategory,
    } = recordDetail;
    const {
      params: { rfxId },
    } = match;
    const chartProps = {
      data: lineData,
      priceCategory,
      header,
      itemLineChatActiveKey,
    };
    const recordTableProps = {
      header,
      fetchRecordLoading,
      dataSource: recordList,
      priceCategory,
      pagination: recordListPagination,
      customizeTable,
      sourceKey: this.sourceKey,
      quotationName: this.quotationName,
      bidFlag: this.bidFlag,
      doubleUnitFlag,
      useNewRateFlag,
      rfxHeaderId: rfxId,
    };

    return (
      <div className={style.detailRight}>
        <div
          className={style.detailTitle}
          style={{ marginLeft: '16px', borderBottom: 0, height: '34px', lineHeight: '34px' }}
        >
          <div className={style.titleLeft}>
            <Button.Group>
              <Button
                onClick={() => this.changeToLineAmount(recordDetail, 'linePrice')}
                className={itemLineChatActiveKey === 'linePrice' && styles.active}
              >
                {intl.get(`ssrc.inquiryHall.view.message.button.lineAmount`).d('行金额')}
              </Button>
              <Button
                value="small"
                onClick={() => this.changeToPrice(recordDetail)}
                className={
                  !itemLineChatActiveKey || (itemLineChatActiveKey === 'unitPrice' && styles.active)
                }
              >
                {intl.get(`ssrc.inquiryHall.view.message.button.unitPrice`).d('单价')}
              </Button>
              <Button
                value="small"
                onClick={() => this.changeToWeightPrice()}
                className={itemLineChatActiveKey === 'weightPrice' && styles.active}
              >
                {intl.get('ssrc.inquiryHall.view.title.weightPrice').d('权重单价')}
              </Button>
            </Button.Group>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        <div
          style={{
            fontSize: '14px',
            color: '#333333',
            letterSpacing: 0,
            lineHeight: '24px',
            paddingLeft: '32px',
            boxShadow: 'none',
          }}
        >
          {intl
            .get(`ssrc.inquiryHall.view.message.button.commonQuotationHistoryChart`, {
              quotationName: this.quotationName,
            })
            .d('{quotationName}历史-图表')}
        </div>
        <PriceChart {...chartProps} />
        <div
          style={{
            fontSize: '14px',
            color: '#333333',
            letterSpacing: 0,
            lineHeight: '24px',
            margin: '16px 0px 0px 32px',
            boxShadow: 'none',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {intl
              .get(`ssrc.inquiryHall.view.message.button.quotationHistoryRecord`, {
                quotationName: this.quotationName,
              })
              .d('{quotationName}历史-记录')}
          </span>
          <div>
            {this.renderExportButton()}
            <span style={{ float: 'right', marginRight: '16px', marginLeft: '16px' }}>
              <span style={{ marginRight: '5px', fontSize: '12px' }}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.show`).d('显示')}：
              </span>
              <Select
                onChange={(value) => this.changePriceType(recordDetail, value)}
                value={showQuotation}
              >
                <Option value="ALL_QUOTATION">
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.commonHistoryQuotation`, {
                      quotationName: this.quotationName,
                    })
                    .d('历史{quotationName}')}
                </Option>
                <Option value="VALID_QUOTATION">
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.commonValidQuotation`, {
                      quotationName: this.quotationName,
                    })
                    .d('有效{quotationName}')}
                </Option>
              </Select>
            </span>
          </div>
        </div>
        <RecordTable {...recordTableProps} />
      </div>
    );
  }

  /**
   * action-openTableRow:打开列表行
   */
  /**
   * 点击查看物品明细展开详情信息
   */
  @Bind()
  openTableRow(itemLine = []) {
    if (itemLine.length > 0) {
      const record = itemLine[0] || {};
      this.setState({
        expand: {
          [record.rfxLineItemNum]: [record.rfxLineItemNum],
        },
        inquiryTableReadOnly: false,
      });
      // this.updateRecordDetail(record);
      // this.initWebSocket(record);
      this.fetchRecord({}, record);
      this.fetchLineData(record);
      // this.fetchItemLineQuotationInterval(record);
    } else {
      this.setState({
        inquiryTableReadOnly: false,
      });
    }
  }

  /**
   * action-switchTheview:切换视图
   */
  /**
   * 点击查看物品明细
   */
  @Bind()
  switchTheview() {
    this.setState({
      inquiryTableReadOnly: true,
    });

    // this.clearTimerInterval();
  }

  /**
   * 开始竞价
   */
  @Bind()
  @debounce(1000)
  startRFA(itemLine) {
    const { match, dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    const {
      params: { rfxId },
    } = match;
    this.setState({
      startRFAVisible: false,
      activeTab: 'itemDetails',
    });
    dispatch({
      type: `${modelName}/startRFA`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
      },
    });
    this.openTableRow(itemLine);
  }

  @Bind()
  changeTab(activeTab) {
    this.setState({
      activeTab,
    });
  }

  getBackPath() {
    const {
      remote,
      location,
      location: { search },
    } = this.props;
    const back = `${getActiveTabKey()}/list`;
    const otherProps = {
      search,
      location,
    };
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_MONITOR_PROCESS_BACK_PATH', back, otherProps)
      : back;
  }

  // 供应商页按钮
  supplierOperations = (header = {}) => {
    const { sourceMethod = null, sendMessageFlag = 0 } = header || {};
    if (sourceMethod === 'INVITE' && sendMessageFlag) {
      return (
        <Button onClick={this.confirmWarningSupplierQuotation}>
          {intl
            .get(`ssrc.inquiryHall.button.title.commonWarningSupplierQuotation`, {
              quotationName: this.quotationName,
            })
            .d('提醒供应商{quotationName}')}
        </Button>
      );
    }

    return null;
  };

  // 确认提醒供应商报价
  confirmWarningSupplierQuotation = () => {
    Modal.confirm({
      title: intl
        .get('ssrc.inquiryHall.view.title.commonConfirmMessageWarningSupplier', {
          quotationName: this.quotationName,
        })
        .d('是否确认发送消息提醒供应商{quotationName}'),
      onOk: this.handleWarningSupplierQuotation,
    });
  };

  // 提醒供应商报价消息发送
  handleWarningSupplierQuotation = async () => {
    const {
      organizationId,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};

    try {
      let result = await handleWarningSupplierQuotation({
        organizationId,
        rfxHeaderId: rfxId,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      notification.success();
    } catch (e) {
      throw e;
    }
  };

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
   * 渲染比价助手
   */
  renderPriceComparisonModal = (priceComparisonProps = {}) => {
    return this.bidFlag ? (
      <BidPriceComparison {...priceComparisonProps} />
    ) : (
      <PriceComparison {...priceComparisonProps} />
    );
  };

  // pin top toggle
  @Throttle(1000)
  handleChangePin = (e) => {
    const { pinFixed } = this.state;
    e.stopPropagation();

    this.setState({
      pinFixed: !pinFixed,
    });
  };

  // 头按钮
  @Bind()
  getHeaderButtons() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {}, itemLine = [] },
      startRFALoading,
      match: { params },
      remote,
      history,
    } = this.props;
    const { startRFAVisible } = this.state;
    const { sourceCategory, diyLadderQuotationFlag, sealedQuotationFlag } = header || {};
    const priceComparisonProps = {
      rfxId: params.rfxId,
      // visible: priceComparisonModalVisible,
      // onHideModal: this.hidePriceComparison,
      sourceCategory,
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
    };
    const startRFAFlag = moment().isAfter(header.estimatedStartTime);

    const buttons = [
      !isEmpty(header) &&
      header.fastBidding &&
      startRFAFlag &&
      !header.quotationStartDate &&
      startRFAVisible ? (
        <Button
          name="startBidding"
          onClick={() => this.startRFA(itemLine)}
          loading={startRFALoading}
          type="primary"
        >
          {intl.get('ssrc.inquiryHall.model.inquiryHall.startRFA').d('开始竞价')}
        </Button>
      ) : null,
      !isEmpty(header) && !sealedQuotationFlag && (
        <Button
          name="priceAssistant"
          className="no-border-btn"
          onClick={() => this.handleRenderPriceCompare(priceComparisonProps)}
        >
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        </Button>
      ),
      <ChatRoomSourceLink name="chat" rfxHeaderId={params.rfxId} />,
    ].filter(Boolean);

    const remoteProps = {
      headerData: header,
      bidFlag: this.bidFlag,
      rfxHeaderId: params.rfxId,
      history,
      that: this,
    };

    if (remote) {
      return remote.process(
        'SSRC_INQUIRY_HALL_MONITOR_PROCESS_HEADER_BUTTONS',
        buttons,
        remoteProps
      );
    }
    return buttons;
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: {
        header = {},
        itemLine = [],
        itemLinePagination = {},
        monitorSupplierLine = [],
        monitorSupplierLinePagination = {},
      },
      fetchMonitorHeaderLoading,
      fetchMonitorSupplierLineLoading,
      customizeBtnGroup = () => {},
      customizeTable,
      history,
      remote,
    } = this.props;
    const {
      collapseKeys,
      inquiryTableReadOnly,
      activeTab,
      // priceComparisonModalVisible = false,
      pinFixed = false,
      sslmLifeCycleFlag = true,
    } = this.state;
    const { rfxNum, rfxTitle, rfxStatus, currentDateTime, quotationEndDate, biddingPausedDate } =
      header || {};
    const rfxTitleNum = rfxNum && rfxTitle ? `${rfxNum}-${rfxTitle}` : rfxNum || rfxTitle || '';

    const pausedRfx = rfxStatus === 'PAUSED';
    let countDownStartTime = currentDateTime;

    // 单据暂停，倒计时需要固化
    if (pausedRfx) {
      countDownStartTime = biddingPausedDate || currentDateTime;
    }

    const { baseInfos = ['baseInfos'] } = collapseKeys;
    const operations = (
      <a className={styles.supplierRelationship} onClick={() => this.openTableRow(itemLine)}>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewQuotationDetails`).d('查看报价明细')}
      </a>
    );
    const switchTheview = (
      <a className={styles.supplierRelationship} onClick={() => this.switchTheview()}>
        {intl.get(`ssrc.inquiryHall.view.message.button.switchTheview`).d('切换视图')}
      </a>
    );
    const headVD = (
      <React.Fragment>
        <h3>{intl.get(`ssrc.inquiryHall.view.message.tab.baseInfos`).d('基本信息')}</h3>
        <a>
          {baseInfos.includes('baseInfos')
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
        </a>
        <Icon type={baseInfos.includes('baseInfos') ? 'up' : 'down'} />
      </React.Fragment>
    );

    let cuxTab = '';
    cuxTab = remote
      ? remote.process('SSRC_INQUIRY_HALL_MONITOR_PROCESS_CUX_TAB', cuxTab, { that: this })
      : cuxTab;

    const supplierTableProps = {
      header,
      quotationName: this.quotationName,
      dataSource: monitorSupplierLine,
      pagination: monitorSupplierLinePagination,
      fetchMonitorSupplierLineLoading,
      fastBidding: header.fastBidding,
      fetchMonitorSupplierLine: this.fetchMonitorSupplierLine,
      customizeTable,
      sourceKey: this.sourceKey,
      history,
      remote,
      sslmLifeCycleFlag,
    };

    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl
            .get(`ssrc.inquiryHall.model.inquiryHall.CommonMonitoringPlatform`, {
              sourceCategoryName: this.sourceCategoryName,
            })
            .d(`{sourceCategoryName}监控台`)}
        >
          {customizeBtnGroup(
            {
              code: `SSRC.${this.sourceKey}_HALL.MONITOR.HEADER_BUTTONS`,
            },
            this.getHeaderButtons()
          )}
        </Header>
        <div className={styles['ssrc-monitor-page-wrap']}>
          <Content
            className={style.contentStyle}
            style={{ padding: '16px' }}
            wrapperClassName={`ssrc-monitor-notfix-content-wrapper ${
              pinFixed && 'fixed-content-wrapper'
            }`}
          >
            <div className={styles['ssrc-monitor-header-content-wrap']}>
              <div className={styles['ssrc-monitor-header-collapse-title-wrap-left']}>
                <div>
                  <h3>{rfxTitleNum}</h3>
                </div>
              </div>

              <div style={{ marginRight: '8px', display: 'flex', alignItems: 'baseline' }}>
                <PinFixed
                  pinFixed={pinFixed}
                  handleChangePin={this.handleChangePin}
                  wrapStyle={{ marginRight: '16px' }}
                />
                {countDownStartTime && quotationEndDate ? (
                  <div
                    style={{
                      display: 'inline-block',
                      float: 'right',
                      paddingRight: '20px',
                      height: '100%',
                    }}
                  >
                    <CountDown
                      sysNow={countDownStartTime}
                      endTime={quotationEndDate}
                      type="day"
                      pausedFlag={pausedRfx}
                    />
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </Content>
          <Content className={style.contentStyle} style={{ padding: '16px' }}>
            <Spin
              spinning={fetchMonitorHeaderLoading}
              wrapperClassName={classNames(styles['page-content'], 'ued-detail-wrapper')}
            >
              <Collapse
                className={classNames(styles['header-style'], 'form-collapse')}
                defaultActiveKey={['baseInfos']}
                onChange={(arr) => this.onCollapseChange(arr, 'baseInfos')}
              >
                <Panel showArrow={false} header={headVD} key="baseInfos">
                  {this.renderHeaderForm(header)}
                </Panel>
              </Collapse>
            </Spin>

            {!isEmpty(header) ? (
              <Tabs
                activeKey={activeTab}
                className={styles.tabStyle}
                onChange={this.changeTab}
                tabBarExtraContent={
                  activeTab === 'itemDetails'
                    ? inquiryTableReadOnly
                      ? operations
                      : switchTheview
                    : activeTab === 'supplierList'
                    ? this.supplierOperations(header)
                    : null
                }
              >
                {!header?.sealedQuotationFlag ? (
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemDetails`).d('物品明细')}
                    key="itemDetails"
                  >
                    {inquiryTableReadOnly ? this.renderItemChart(itemLine) : ''}
                    {inquiryTableReadOnly ? (
                      <Row>
                        <Col offset={14} span={10}>
                          <Pagination
                            style={{ margin: '16px 0', float: 'right' }}
                            {...itemLinePagination}
                            onChange={(page, pageSize) => this.onChangePagination(page, pageSize)}
                            onShowSizeChange={(current, size) =>
                              this.onChangePagination(current, size)
                            }
                          />
                        </Col>
                      </Row>
                    ) : (
                      ''
                    )}
                    {!inquiryTableReadOnly && (
                      <div className={style.biddingDetail}>
                        {this.leftTableView(itemLine, itemLinePagination)}
                        {this.rightDetailView()}
                        <div style={{ clear: 'both' }} />
                      </div>
                    )}
                  </Tabs.TabPane>
                ) : null}
                <Tabs.TabPane
                  tab={intl.get(`ssrc.inquiryHall.view.tab.supplierList`).d('供应商列表')}
                  key="supplierList"
                >
                  <SupplierTable {...supplierTableProps} />
                </Tabs.TabPane>
                {cuxTab}
              </Tabs>
            ) : (
              ''
            )}
          </Content>
        </div>
        {/* {priceComparisonModalVisible && this.renderPriceComparisonModal(priceComparisonProps)} */}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL.MONITOR.HISTORY_TABLE', // 历史表格
        'SSRC.INQUIRY_HALL.MONITOR.FORM_HEADER', // 基础信息
        'SSRC.INQUIRY_HALL.MONITOR.HEADER_BUTTONS', // 头部按钮
        'SSRC.INQUIRY_HALL.MONITOR.SUPPLIER_TABLE', // 供应商表格
      ],
    })(
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        modelName: 'inquiryHall',
        fetchMonitorHeaderLoading: loading.effects['inquiryHall/fetchMonitorHeaderDetail'],
        fetchMonitorSupplierLineLoading: loading.effects['inquiryHall/fetchMonitorSupplierLine'],
        fetchRecordLoading: loading.effects['inquiryHall/fetchRecord'],
        startRFALoading: loading.effects['inquiryHall/startRFA'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: ['ssrc.inquiryHall', 'ssrc.common', 'ssta.common', 'ssrc.scux'],
        })(
          remoteHoc(
            {
              code: 'SSRC_INQUIRY_HALL_MONITOR',
            },
            {
              events: {
                updateDataSource() {},
                cuxHandleAfterSocketMessage() {},
              },
            }
          )(Com)
        )
      )
    )
  );
};

export default HOCComponent(Monitor);
export { Monitor };
