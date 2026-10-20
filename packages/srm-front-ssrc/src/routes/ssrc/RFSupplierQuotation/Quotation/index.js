import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DataSet, Modal, Tooltip, useModal } from 'choerodon-ui/pro';
import { Tag, Spin, Card } from 'choerodon-ui';
import querystring from 'querystring';
import {
  isEmpty,
  noop,
  throttle,
  isFunction,
  compose,
  isArray,
  isEqual,
  isNil,
  debounce,
} from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import remote from 'hzero-front/lib/utils/remote';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryMapIdpValue } from 'services/api';
import webSocketManagener from 'utils/webSoket';

import { getCategoryCode, getDocumentTypeName, getQuotationName } from '@/utils/globalVariable';
import { numberSeparatorRender } from '@/utils/renderer';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import SectionPanel from '@/routes/components/SectionPanel';
import CommonStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import CountDown from '@/routes/ssrc/components/CountDown';
import ValidationResultModal from '@/routes/ssrc/RFSupplierQuotation/Apply/Modals/ValidationResultModal.js';
import { validationResultDS } from '@/routes/ssrc/RFSupplierQuotation/Apply/Stores/validationResultDS';
import {
  queryQuotationHeader,
  fetchQuotationListNewMessage,
  saveQuotationNew,
  submitQuotationNew,
  quotationWholeAbandon,
  fetchSupplierQuotationTimer,
} from '@/services/supplierQutationService';
import {
  isText,
  getJumpRoutePrefixUrl,
  fetchCurrentPrecision,
  amountCalcType,
} from '@/utils/utils';
// import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { queryEnableDoubleUnit, queryUiDisplayConfig } from '@/services/commonService';
import WholeAbandonForm from '@/routes/ssrc/SupplierQuotation/InquiryPrice/WholeAbandonForm';
import { wholeAbadonDataSet } from '@/routes/ssrc/SupplierQuotation/InquiryPrice/WholeAbandonForm/stores.js';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
// import { getErrors } from './utils/getDSError';
import { operateResponseMessagePrompt } from '@/utils/common.js';

import PinFixed from '@/routes/ssrc/components/PinFixed';

import Style from './index.less';

import BasicForm from './Page/BasicForm';
import ProjectInfo from './Page/ProjectInfo';
import Attachments from './Page/Attachments';
import QuotationLineTable from './Page/QuotationLineTable';
import Buttons from './Page/Buttons';
import RoundQuotationChart from './Modals/RoundQuotationChart';
import TableSummaryForm from './Page/TableSummaryForm';

import { formDS, tableSummaryFormDS } from './Stores/formDS';
import { quotationLineDataSet } from './Stores/quotationLineDataSet';
import { handleSup } from "@/routes/components/ChatRoomSource/handleCommon.js";

const IntervalTime = 2_000;
let socketUrl = '';

const ThirtySecondTimer = 30_000;
const MAXTHREAD = 3;

const RFQTIMERINTERVAL = 180_000;

const QuotationSubmitFieldFlag = 'quotationSubmitChangeFlag'; // 竞价单提交，socket 推送标识

/**
 * 报价页面
 * @search
 * 可选参数 sectionFlag, projectLineSectionId
 */
const QuotationComponent = (props = {}) => {
  const {
    history = {},
    match: { path, params = {} },
    location: { search, pathname },
    customizeTable = noop,
    customizeForm = noop,
    customizeCollapseForm = noop,
    customizeBtnGroup = noop,
    customizeCommon = noop,
    custLoading = false,
    bidFlag = 0,
    quotationRemote,
  } = props;
  const { quotationHeaderId } = params || {};

  const searchData = querystring.parse(search.substr(1));
  const { sectionFlag = 0, projectLineSectionId = null, backPath = null } = searchData || {};

  const [loading, setLoading] = useState(false);
  const [countDownTimer, setCountDownTimer] = useState({}); // 倒计时
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 判断是否开启双单位
  const [batchEditData, setBatchEditData] = useState({});
  const [batchEditQuotationLineDTO, setBatchEditQuotationLineDTO] = useState({}); // 批量编辑表单内容 目前没有视图逻辑，只记录数据, batchCacheDataRef应该足够了，看是否需要去掉setState
  const [allEditFlag, setAllEditFlag] = useState(-1); // 是否全部编辑 1:全量编辑，0:批量编辑, -1:初始化  目前没有视图逻辑，只记录数据, batchCacheDataRef应该足够了，看是否需要去掉setState
  const [currencyPrecision, setCurrencyPrecision] = useState(null); // 手动查询的币种精度
  const [financialPrecision, setFinancialPrecision] = useState(null); // 手动查询的财务精度
  const [caclRule, setCaclRule] = useState(null); // 业务规则定义-金额计算方式
  const [pinFixed, setPinFixed] = useState(false); // ping to top position
  const [allPageDisabled, setAllPageDisabled] = useState(false); // 全页面禁用编辑
  let messageListBeatCount = 0;

  let lovs = {};

  const sectionRef = useRef({}); // 标段
  const lineRef = useRef(); // 报价行
  const batchCacheDataRef = useRef({}); // 批量编辑缓存数据
  const intervalTime = useRef({ timer: IntervalTime }); // 配置表定义的轮询时间间隔

  const rfqFetchTimer = useRef(null); // 询价单 实时更新倒计时
  const afterQueryLineRankTimer = useRef(null); // 行查询后，由于没有计算排名等，需要调用接口
  const sockerCreateLinkTimer = useRef(null); // socket 如果链接失败，需要再次链接
  const socketCreateLinkCountRef = useRef(0); // socket连接次数
  const biddingSocketMap = useRef(new Map()); // socket 接受到的数据,筛选缓存
  const refreshRankCount = useRef(0); // 调用rank接口次数

  let quotationListTimer = null;
  let directionToListTimer = null;
  let changeCurrencyCalcTimer = null;

  const uModal = useModal();

  // const bidFlag = isBid === '1' || isBid === 'true' ? 1 : 0; // 判断是否是新招标
  const organizationId = getCurrentOrganizationId();
  const documentTypeName = getDocumentTypeName(bidFlag);
  const categoryCode = getCategoryCode(bidFlag);
  const quotationName = getQuotationName(bidFlag);
  const activeTabKey = getJumpRoutePrefixUrl(pathname);

  const basicFormDS = useMemo(() => {
    const cuxProps = {
      bidFlag,
    };

    const preHeaderDS = formDS({
      bidFlag,
      documentTypeName,
      quotationName,
      organizationId,
      allPageDisabled,
    });
    const headerDS = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_BASIC_FORM_DS',
          preHeaderDS,
          cuxProps
        )
      : preHeaderDS;
    const headerBasicFormDS = new DataSet(headerDS);

    return headerBasicFormDS;
  }, [pathname, search, bidFlag, documentTypeName, quotationName, organizationId, quotationRemote]);

  const summaryFormDS = useMemo(
    () =>
      new DataSet(
        tableSummaryFormDS({
          bidFlag,
          documentTypeName,
          quotationName,
          organizationId,
        })
      ),
    [pathname, search, bidFlag, documentTypeName, quotationName, organizationId]
  );

  const quotationLineDS = useMemo(() => {
    return new DataSet(
      quotationRemote
        ? quotationRemote.process(
            'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_QUOTATION_TABLE_DS',
            quotationLineDataSet({
              bidFlag,
              documentTypeName,
              quotationName,
              organizationId,
              basicFormDS,
            }),
            {
              bidFlag,
              basicFormDS,
            }
          )
        : quotationLineDataSet({
            bidFlag,
            documentTypeName,
            quotationName,
            organizationId,
            basicFormDS,
          })
    );
  }, [pathname, search, bidFlag, documentTypeName, quotationName, organizationId, basicFormDS]);

  let wholeAbadonDS = null;

  const validateDS = useMemo(() => new DataSet(validationResultDS()), [pathname, search]);

  const { rfxHeaderId = null } = basicFormDS.current
    ? basicFormDS.current?.get(['rfxHeaderId'])
    : {};

  // 触发页面loading
  const toggleLoading = (loadFlag = false) => {
    setLoading(loadFlag);
  };

  // 提前将人加到聊天室
  const addSupplierIntoChatRoom = () => {
    handleSup({
      quotationHeaderId,
      organizationId,
      pageProps: {
        skipAddMemberFlag: 1,
      },
    });
  };

  useEffect(() => {
    (async () => {
      try {
        idValidation(quotationHeaderId); // 校验主键

        await fetchConfigTimer();
        fetchLovData();
        initWebSoketConnect();
        await initPage();
        registerWebSocketConnect();
        await rollingFetchRFQTimer();
        addSupplierIntoChatRoom();
      } catch (e) {
        throw e;
      }
    })();

    return () => {
      clearQuotationListTimer();
      clearAllSetTimeout();
      closeSocket();
      clearSockerCreateLinkTimer();
      clearRFQTimer();
    };
  }, [pathname, search, clearQuotationListTimer]);

  useEffect(() => {
    // 浏览器切换事件
    document.addEventListener('visibilitychange', chromeTabVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', chromeTabVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // 增加数据加载完后监听
    quotationLineDS.addEventListener('load', afterQueryLineFetchRank);

    return () => {
      quotationLineDS.removeEventListener('load', afterQueryLineFetchRank);
    };
  }, [quotationLineDS, afterQueryLineFetchRank]);

  const chromeTabVisibilityChange = () => {
    const HiddenChromeTabFlag = document?.hidden;

    if (!HiddenChromeTabFlag) {
      handleFetchQuotationListNewMessage({ newIntoCurrentTabFlag: 1 });

      rollingFetchQuotationListInfo();

      refreshRFQTimer();
      rollingFetchRFQTimer();
    } else {
      clearQuotationListTimer();
      setCountDownTimer({});
      quotationLineUpdateTimerCurrentDateTime();
      clearRFQTimer();
    }
  };

  const {
    rfxNum,
    rfxTitle,
    secondarySourceCategoryMeaning,
    secondarySourceCategory,
    quotationLineNumber,
    quotationScope,
    quotationTotalAmount = null,
    currentQuotationRound,
    bargainStatus,
    bargainTimes,
    lastRoundQuotationRank,
    projectLineSectionList = [],
    roundQuotationRankFlag,
    lastRoundQuotationAmount,
    tenantId: currentTenantId,
    priceTypeCode,
  } = basicFormDS?.current
    ? basicFormDS.current.get([
        'rfxNum',
        'rfxTitle',
        'secondarySourceCategoryMeaning',
        'secondarySourceCategory',
        'quotationLineNumber',
        'quotationScope',
        'quotationTotalAmount',
        'currentQuotationRound',
        'bargainStatus',
        'bargainTimes',
        'lastRoundQuotationRank',
        'projectLineSectionList',
        'roundQuotationRankFlag',
        'lastRoundQuotationAmount',
        'tenantId',
        'priceTypeCode',
      ])
    : {};

  const isUnTaxPriceFlag = useMemo(() => priceTypeCode && priceTypeCode === 'NET_PRICE', [
    priceTypeCode,
  ]);

  // init page
  const initPage = useCallback(async () => {
    try {
      await fetchHeader();
    } catch (e) {
      throw e;
    }
    rollingFetchQuotationListInfo();
  }, [pathname, search, fetchHeader, rollingFetchQuotationListInfo]);

  useEffect(() => {
    if (!currentTenantId) {
      return;
    }
    initCalcType({
      purTenantId: currentTenantId,
      organizationId,
      supplierFlag: 1,
    });
  }, [basicFormDS?.current, currentTenantId, organizationId]);

  // 行查询后，查一次排名
  const afterQueryLineFetchRank = () => {
    if (afterQueryLineRankTimer.current) {
      clearTimeout(afterQueryLineRankTimer.current);
    }

    handleFetchQuotationListNewMessage();
    afterQueryLineRankTimer.current = setTimeout(
      handleFetchQuotationListNewMessage,
      intervalTime?.current?.timer
    );
  };

  const clearRFQTimer = () => {
    if (rfqFetchTimer.current) {
      clearTimeout(rfqFetchTimer.current);
    }
  };

  const refreshRFQTimer = async () => {
    const {
      rfxHeaderId: rfxId,
      currentQuotationRound: currentRoundNum,
      secondarySourceCategory: seSourceCategory,
      currentDateTime: preCurrentDateTime,
      quotationEndDate: preQuotationEndDate,
    } =
      basicFormDS?.current?.get([
        'rfxHeaderId',
        'secondarySourceCategory',
        'currentDateTime',
        'quotationEndDate',
        'currentQuotationRound',
      ]) || {};

    // 时间延长
    const quotationEndDateNew = preQuotationEndDate
      ? moment(preQuotationEndDate || null)
          ?.add(1, 'h')
          ?.format(DEFAULT_DATETIME_FORMAT)
      : null;

    const disabledFetchNewMessageFlag =
      !rfxId ||
      !['RFQ', 'NEW_BID'].includes(seSourceCategory) ||
      !preCurrentDateTime ||
      !preQuotationEndDate ||
      (preCurrentDateTime && preQuotationEndDate && preCurrentDateTime >= quotationEndDateNew);
    if (disabledFetchNewMessageFlag) {
      clearRFQTimer();
      return;
    }

    const result = await fetchSupplierQuotationTimer({
      rfxHeaderId: rfxId,
      currentQuotationRound: currentRoundNum,
      organizationId,
    });

    if (result && result.failed) {
      return;
    }

    const { quotationEndDate, currentDateTime } = result || {};
    if (!quotationEndDate || !currentDateTime) {
      return;
    }

    setCountDownTimer({
      quotationEndDate,
      currentDateTime,
    });
  };

  /**
   * 询价单倒计时 轮询
   */
  const rollingFetchRFQTimer = () => {
    rfqFetchTimer.current = setInterval(() => refreshRFQTimer(), RFQTIMERINTERVAL);
  };

  /**
   * 初始化webSoket连接
   */
  const initWebSoketConnect = useCallback(() => {
    if (webSocketManagener?.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
    }
  }, []);

  /**
   * 注册发布列表连接
   */
  const registerWebSocketConnect = useCallback(() => {
    const { tenantId, rfxHeaderId: rfxId, rfxNum: currentRfxNum, roundNumber } =
      basicFormDS?.current?.get(['rfxHeaderId', 'tenantId', 'rfxNum', 'roundNumber']) || {};
    if (socketCreateLinkCountRef?.current > 5) {
      throw ReferenceError('socket is tried multile times, please check fields is empty ?');
    }
    const mainFieldLackFlag = !rfxId || !roundNumber || !tenantId || !currentRfxNum;
    if (mainFieldLackFlag) {
      socketCreateLinkCountRef.current += 1;
      if (sockerCreateLinkTimer.current) {
        clearSockerCreateLinkTimer();
      }
      sockerCreateLinkTimer.current = setTimeout(registerWebSocketConnect, IntervalTime);
      return;
    }

    clearSockerCreateLinkTimer();

    socketUrl = `/topic/monitor/change/${tenantId}/${currentRfxNum}/${roundNumber}`;

    webSocketManagener.addListener(socketUrl, (messageData) => {
      const data = JSON.parse(messageData?.message);
      console.log(socketUrl, messageData);
      if (data) {
        handleSocketMessage(data);
      }
    });
  }, [
    basicFormDS,
    intervalTime,
    handleSocketMessage,
    clearSockerCreateLinkTimer,
    registerWebSocketConnect,
  ]);

  // 根据socket返回信息处理相应逻辑
  const handleSocketMessage = useCallback((data) => {
    cacheSocketDataInMap(data);
    handleWebsocketMessageReceive();
  }, []);

  // socket data reorganization
  const cacheSocketDataInMap = (data) => {
    if (isEmpty(data)) {
      return;
    }

    const currentSocketMap = biddingSocketMap.current || new Map();
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
          handleFetchQuotationListNewMessage();
          currentSocketMap.delete(key);
        };
      }

      // 1 - 说明竞价过程控制调整了运行时间
      if (key === 'adjustChangeFlag') {
        refreshEffect = 'refreshAllPage';
        handle = () => {
          refreshAllPageData({ linePageFlag: true });
          currentSocketMap.clear();
        };
      }

      currentSocketMap.set(key, {
        flag: value,
        handle,
        refreshEffect,
      });
    });

    biddingSocketMap.current = currentSocketMap;
  };

  /**
   * 延迟从map中执行操作，并清空
   */
  const handleWebsocketMessageReceive = debounce(() => {
    const currentSocketMap = biddingSocketMap.current || new Map();

    if (!currentSocketMap.size) {
      return;
    }

    currentSocketMap.forEach((value, key, map) => {
      const { flag, handle } = value || {};
      if (!flag || !key || !handle || !map.size) {
        return;
      }

      if (handle) {
        handle();
      }
    });

    biddingSocketMap.current = currentSocketMap;
  }, intervalTime?.current?.timer);

  /**
   * 更新刷新次数
   */
  const setRefreshCount = (options) => {
    const { count = 1, type = '' } = options || {};
    let num = refreshRankCount.current || 0;
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
    refreshRankCount.current = num;
  };

  /**
   * 关闭webSocket链接
   */
  const closeSocket = () => {
    if (socketUrl && webSocketManagener.removeListener && handleSocketMessage) {
      webSocketManagener.removeListener(socketUrl, handleSocketMessage);
    }
    if (webSocketManagener?.destroyWebSocket) {
      webSocketManagener.destroyWebSocket();
    }
  };

  // 清除socket连接倒计时
  const clearSockerCreateLinkTimer = () => {
    if (sockerCreateLinkTimer.current) {
      clearTimeout(sockerCreateLinkTimer.current);
    }
  };

  // fetch lov
  const fetchLovData = async () => {
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

      lovs = result;
    } catch (e) {
      throw e;
    }
  };

  // 报价头
  const fetchHeader = useCallback(
    async ({ linePageFlag } = {}) => {
      if (!quotationHeaderId) {
        return;
      }

      const param = {
        organizationId,
        quotationHeaderId,
        customizeUnitCode: getCustomizeUnitCode(['baseForm', 'attachment', 'tableSummary']),
      };
      let result = null;
      toggleLoading(true);
      try {
        result = await queryQuotationHeader(param);
        result = getResponse(result);
        queryDoubleUnit(result?.tenantId);
        toggleLoading();
        if (!result) {
          return;
        }

        const { quotationEndDate, currentDateTime, currencyCode, tenantId } = result || {};

        setCountDownTimer({
          quotationEndDate,
          currentDateTime,
        });

        basicFormDS.loadData([result]);
        summaryFormDS.loadData([result]);
        quotationLineDS.setState('header', result);
        quotationLineDS.setQueryParameter('commonProps', {
          ...param,
          customizeUnitCode: getCustomizeUnitCode(['table', 'tableSearch']),
        });
        queryQuotationLines({ linePageFlag });
        fetchCurrencyPrecision(currencyCode, tenantId);

        disabledAllPage(result);
      } catch (e) {
        throw e;
      } finally {
        toggleLoading();
      }
    },
    [pathname, search, getCustomizeUnitCode, disabledAllPage]
  );

  // 计算是否 禁用整个报价页面
  const disabledAllPage = useCallback(
    (header) => {
      let disabled = false;

      disabled = quotationRemote
        ? quotationRemote.process(
            'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_DISABLED_ALL_PAGE_FLAG',
            disabled,
            {
              basicFormDS,
              header,
            }
          )
        : disabled;

      setPageDisabledSymbolStatus({
        disabled,
      });
    },
    [basicFormDS, quotationLineDS, quotationRemote]
  );

  // 禁用全页面
  const setPageDisabledSymbolStatus = (options = {}) => {
    const { disabled } = options || {};
    const { current } = basicFormDS || {};

    setAllPageDisabled(disabled);
    if (current) {
      current.set('allPageDisabled', disabled);
      basicFormDS.setState('allPageDisabled', disabled);
    }
    if (quotationLineDS) {
      quotationLineDS.setState('allPageDisabled', disabled);

      if (disabled) {
        quotationLineDS.selection = false;
      }
    }
  };

  const initCalcType = async (data) => {
    const result = (await amountCalcType(data)) || [];
    setCaclRule(result?.[0]);
  };

  // 查询双单位是否开启
  const queryDoubleUnit = async (tenantId) => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
      tenantId,
    });
    if (isText(res)) {
      quotationLineDS.setState('doubleUnitFlag', !!Number(res));
      setDoubleUnitFlag(!!Number(res));
    }
  };

  // fetch precision
  const fetchCurrencyPrecision = async (currencyCode, tenantId) => {
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
    setCurrencyPrecision(currency);
    setFinancialPrecision(financial);
  };

  const quotationLineUpdateTimerCurrentDateTime = (currentTime = null) => {
    if (!quotationLineDS?.length) {
      return;
    }

    quotationLineDS.forEach((lineRecord) => {
      if (!lineRecord) {
        return;
      }
      lineRecord.set('currentDateTime', currentTime);
    });
  };

  // 配置表定义 轮询定时器间隔时间 BIDDING_REFRESH_LIMIT
  const fetchConfigTimer = async () => {
    const data = {
      organizationId,
      tableCode: 'ssrc_new_function_configuration_list',
      tenantNum: getCurrentTenant().tenantNum,
    };
    const res = await queryUiDisplayConfig(data);
    if (!isEmpty(res)) {
      const obj = res.find((item) => item.function === 'BIDDING_REFRESH_LIMIT') || {};
      const { value1 = null } = obj;
      const currentTimer =
        value1 && !math.isNaN(value1) ? math.multipliedBy(value1, 1000) : IntervalTime;
      intervalTime.current = { timer: currentTimer };
    }
  };

  // 轮循查询报价接口
  const rollingFetchQuotationListInfo = useCallback(() => {
    clearQuotationListTimer();
    const { timer } = intervalTime.current;
    if (timer) {
      quotationListTimer = setInterval(
        () => handleFetchQuotationListNewMessage(),
        ThirtySecondTimer
      );
    }
  }, [
    pathname,
    search,
    basicFormDS,
    handleFetchQuotationListNewMessage,
    clearQuotationListTimer,
    quotationListTimer,
    intervalTime,
  ]);

  // 竞价-清除轮循计时器
  const clearQuotationListTimer = useCallback(() => {
    if (quotationListTimer) {
      clearInterval(quotationListTimer);
    }
    if (afterQueryLineRankTimer.current) {
      clearTimeout(afterQueryLineRankTimer.current);
    }
  }, [pathname, search, quotationListTimer]);

  // 轮循接口中-取出头时间信息
  const recordHeaderCountTimeInfo = useCallback(
    (data = {}, options = {}) => {
      const { currentDateTime = null, headerQuotationEndDate = null } = data || {};
      // const { quotationEndDate: quotationHeaderQuotationEndData } = countDownTimer || {};
      // const { newIntoCurrentTabFlag = 0 } = options || {};
      const headerQuotationEndDateValue = basicFormDS?.current?.get('quotationEndDate');

      // 前端延长截止时间
      const quotationEndDateNew = headerQuotationEndDate
        ? moment(headerQuotationEndDate || null)
            ?.add(300, 's')
            ?.format(DEFAULT_DATETIME_FORMAT)
        : null;

      // 单据截止
      const EndQuotationFlag =
        currentDateTime && headerQuotationEndDate && currentDateTime > quotationEndDateNew;
      if (EndQuotationFlag) {
        // 倒数计时判断如果headerCountTimeInfo为空，会取头查询的时间，为防止此类问题，截止后记录一波最新的数据
        setCountDownTimer({
          currentDateTime,
          quotationEndDate: headerQuotationEndDate,
        });
        clearQuotationListTimer();
        return;
      }

      // 首次进入页面，且为新建数据，没有截止时间，只有开始时间，需要组装时间
      if (!headerQuotationEndDate && currentDateTime) {
        setCountDownTimer({
          currentDateTime,
          quotationEndDate: headerQuotationEndDateValue,
        });
        return;
      }

      // const DisabledUpdateDateFlag =
      //   (!headerQuotationEndDate &&
      //     currentDateTime &&
      //     quotationHeaderQuotationEndData &&
      //     currentDateTime > quotationHeaderQuotationEndData) ||
      //   !headerQuotationEndDate ||
      //   !currentDateTime ||
      //   headerQuotationEndDate === quotationHeaderQuotationEndData;

      // // 如果截止时间不存在，则取之前第一次头查询的时间
      // if (DisabledUpdateDateFlag) {
      //   // clearQuotationListTimer();
      //   return;
      // }

      if (currentDateTime && headerQuotationEndDate) {
        setCountDownTimer({
          currentDateTime,
          quotationEndDate: headerQuotationEndDate,
        });
      }
    },
    [basicFormDS, pathname, clearQuotationListTimer]
  );

  // 竞价轮循
  const handleFetchQuotationListNewMessage = useCallback(
    async (options) => {
      // const { newIntoCurrentTabFlag } = options || {};
      const { current } = basicFormDS || {};
      if (!current || isEmpty(current)) {
        return;
      }

      const {
        sourceCategory,
        currentDateTime = null,
        quotationEndDate = null,
        rfxNum: currentRfxNum = null,
        roundNumber = null,
        auctionDirection = null,
        templateId = null,
        tenantId = null,
        rfxHeaderId: headerRfxHeaderId,
        quotationStatus,
        bargainStatus: currentBargainStatus,
      } =
        current.get([
          'currentDateTime',
          'quotationEndDate',
          'rfxNum',
          'roundNumber',
          'auctionDirection',
          'templateId',
          'tenantId',
          'sourceCategory',
          'rfxHeaderId',
          'quotationStatus',
          'bargainStatus',
        ]) || {};

      if (
        !sourceCategory ||
        !quotationStatus ||
        !quotationHeaderId ||
        !organizationId ||
        !tenantId
      ) {
        return;
      }

      const clearRollingFetchFlag =
        sourceCategory !== 'RFA' ||
        // quotationStatus === 'NEW' ||
        currentBargainStatus === 'BARGAINING_ONLINE';
      if (clearRollingFetchFlag) {
        clearQuotationListTimer();
        return;
      }

      const disabledFetchNewMessageFlag =
        !currentDateTime ||
        !quotationEndDate;

      if (disabledFetchNewMessageFlag) {
        // // 截止后，查询一次接口，保证数据准确
        // if (newIntoCurrentTabFlag) {
        //   fetchHeader();
        //   return;
        // }
        return;
      }

      const rfxLineItemNums = [];
      if (quotationLineDS.length) {
        quotationLineDS.forEach((item) => {
          const itemNum = item.get('rfxLineItemNum');
          rfxLineItemNums.push(itemNum);
        });
      }

      let result = null;
      const CommonParam = {
        organizationId,
        rfxNum: currentRfxNum,
        roundNumber,
        rfxHeaderId: headerRfxHeaderId,
        auctionDirection,
        templateId,
        quotationHeaderId,
        rfxLineItemNums,
        purchaseTenantId: tenantId,
        customizeUnitCode: getCustomizeUnitCode('table'),
      };

      if (refreshRankCount > MAXTHREAD) {
        return;
      }

      setRefreshCount({ type: 'ADD' });
      try {
        result = await fetchQuotationListNewMessage(CommonParam);
        setRefreshCount({ type: 'DELETE' });
        // result = getResponse(result);
        if (result && result?.failed) {
          clearQuotationListTimer();
          notification.warning({
            message: result?.message,
          });
          return;
        }

        // network error
        if (!result) {
          if (messageListBeatCount > 15) {
            clearQuotationListTimer();
            return;
          }

          messageListBeatCount += 1;
          return;
        }

        messageListBeatCount = 0;

        recordHeaderCountTimeInfo(result, options);
        handleFetchQuotationListNewMessageSuccessed(result, options);
      } catch (e) {
        throw e;
      }
    },
    [
      quotationLineDS,
      basicFormDS,
      summaryFormDS,
      clearQuotationListTimer,
      quotationLineDS.length,
      getCustomizeUnitCode,
      recordHeaderCountTimeInfo,
      handleFetchQuotationListNewMessageSuccessed,
      bargainStatus,
      quotationListTimer,
      fetchHeader,
    ]
  );

  // 依据时间改写状态
  const getCurrentQuotationLineStatus = (data = {}) => {
    const { currentDateTime, quotationEndDate, quotationStartDate, displayQuotationLineStatus } =
      data || {};
    const { lineStatusLovs } = lovs || {};

    const cancelCalculateStatusFlag =
      displayQuotationLineStatus &&
      !['NOT_START', 'NEW', 'SUBMITTED', 'FINISHED'].includes(displayQuotationLineStatus);
    if (
      !quotationEndDate ||
      !currentDateTime ||
      !quotationStartDate ||
      isEmpty(lineStatusLovs) ||
      cancelCalculateStatusFlag
    ) {
      return;
    }

    let currentStatus = displayQuotationLineStatus;
    if (currentDateTime <= quotationStartDate) {
      currentStatus = 'NOT_START';
    }

    const newStatusCalculate =
      quotationStartDate < currentDateTime &&
      currentDateTime < quotationEndDate &&
      displayQuotationLineStatus !== 'SUBMITTED';
    if (newStatusCalculate) {
      currentStatus = 'NEW';
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
      displayQuotationLineStatus: value,
      displayQuotationLineStatusMeaning: meaning,
    };
  };

  // 报价行列表-推送数据成功处理
  const handleFetchQuotationListNewMessageSuccessed = useCallback(
    (newData = {}, options = {}) => {
      const { quotationRankDTOS = [], rfxLineItemMap = {}, currentDateTime = null } = newData || {};
      if (!quotationLineDS.length) {
        return;
      }
      const { newIntoCurrentTabFlag = 0 } = options || {};

      runInAction(() => {
        const { aggregation } = lineRef?.current || {};
        let quotationTableAggregationFlag = false; // 聚合表更新倒计时， 平铺表更新排名
        if (aggregation) {
          quotationTableAggregationFlag = aggregation;
        }

        quotationLineDS.forEach((line = {}) => {
          if (isEmpty(line)) {
            return;
          }
          const {
            quotationLineId,
            rfxLineItemId,
            rank: lineRank,
            trendFlag: lineTrendFlag,
            quotationEndDate: lineQuotationEndDate,
            displayQuotationLineStatus,
            quotationStartDate: lineQuotationStartDate,
          } = line?.get([
            'quotationLineId',
            'rfxLineItemId',
            'rank',
            'trendFlag',
            'quotationEndDate',
            'quotationStartDate',
            'displayQuotationLineStatus',
          ]);

          // 轮询没有时间,取接口行上
          let currentLineQuotationEndDate = lineQuotationEndDate;
          let currentLineQuotationStartDate = lineQuotationStartDate;

          const currentItemDataExistFlag =
            !isEmpty(rfxLineItemMap) && rfxLineItemMap[rfxLineItemId];
          if (currentItemDataExistFlag) {
            const { quotationEndDate = null, quotationStartDate = null } =
              rfxLineItemMap[rfxLineItemId] || {};
            currentLineQuotationEndDate = quotationEndDate; // 轮询 时间
            const UpdateLineDateFlag =
              (quotationEndDate && lineQuotationEndDate !== quotationEndDate) ||
              newIntoCurrentTabFlag;
            if (UpdateLineDateFlag) {
              line.set('quotationEndDate', quotationEndDate);

              if (quotationStartDate) {
                currentLineQuotationStartDate = quotationStartDate;
                line.set('quotationStartDate', quotationStartDate);
              }

              if (quotationTableAggregationFlag) {
                line.set('currentDateTime', currentDateTime);
              }
            }
          }

          // 首次切屏进入，且没有轮询没有查到时间时候
          if (!currentItemDataExistFlag && newIntoCurrentTabFlag) {
            quotationLineUpdateTimerCurrentDateTime(currentDateTime);
          }

          const lineStatusObject = getCurrentQuotationLineStatus({
            currentDateTime,
            quotationStartDate: currentLineQuotationStartDate,
            quotationEndDate: currentLineQuotationEndDate,
            displayQuotationLineStatus,
          });
          if (!isEmpty(lineStatusObject)) {
            line.set(lineStatusObject);
          }

          let mappingLine = null;
          if (!isEmpty(quotationRankDTOS)) {
            mappingLine = quotationRankDTOS?.find(
              (rankItem = {}) => rankItem?.quotationLineId === quotationLineId
            );
          }

          if (!isEmpty(mappingLine)) {
            const { rank = null, trendFlag = 0, cuxMap } = mappingLine || {};

            if (rank !== lineRank) {
              line.set('rank', rank);
            }
            if (trendFlag !== lineTrendFlag) {
              line.set('trendFlag', trendFlag);
            }

            handleCuxMapWithListRefresh({ cuxMap, lineRecord: line });
          }

          const eventProps = {
            newData,
            line,
            quotationLineId,
            rfxLineItemId,
          };
          if (quotationRemote?.event) {
            quotationRemote.event.fireEvent('handleMessageListOperate', eventProps);
          }
        });

        // 实时刷新接口刷新页面
        if (quotationRemote?.event) {
          quotationRemote.event.fireEvent('updatePageValueAfterRefreshRollingQuery', {
            data: newData,
            basicFormDS,
            quotationLineDS,
            summaryFormDS,
          });
        }
      });
    },
    [quotationLineDS, lineRef, basicFormDS, summaryFormDS]
  );

  // refresh list handle cux map
  const handleCuxMapWithListRefresh = (data) => {
    const { cuxMap, lineRecord } = data || {};
    if (!lineRecord || isEmpty(cuxMap)) {
      return;
    }

    runInAction(() => {
      Object.keys(cuxMap).forEach((key) => {
        if (!key) {
          return;
        }
        const value = cuxMap[key];
        lineRecord.set(key, value);
      });
    });
  };

  // clear all set time out
  const clearAllSetTimeout = () => {
    if (directionToListTimer) {
      clearTimeout(directionToListTimer);
    }

    if (changeCurrencyCalcTimer) {
      clearTimeout(changeCurrencyCalcTimer);
    }
  };

  // change currency
  const changeCurrency = (data) => {
    const { currencyCode } = data || {};

    const { defaultPrecision, financialPrecision: currentFinancialPrecision } = data || {};
    setCurrencyPrecision(currencyCode ? defaultPrecision : null);
    setFinancialPrecision(currencyCode ? currentFinancialPrecision : null);

    if (quotationRemote?.event) {
      quotationRemote.event.fireEvent('changeCurrencySetRate', {
        bidFlag,
        basicFormDS,
        currencyCode,
        quotationLineDS,
      });
    }

    changeCurrencyCalcTimer = setTimeout(() => {
      changeCurrencyReCalculateLine({ currencyCode });
    }, 300);
  };

  // after change currency
  const changeCurrencyReCalculateLine = (data = {}) => {
    const { currencyCode } = data || {};
    const { dynamicChangePrice } = lineRef?.current || {};
    if (!quotationLineDS?.length || !dynamicChangePrice) {
      return;
    }

    runInAction(() => {
      quotationLineDS.forEach((line) => {
        line.set('currencyCode', currencyCode);
        dynamicChangePrice(line);
      });
    });
  };

  /**
   * 获取对应的个性化编码
   * @param type null string | string[]
   * @return null | string
   *  */
  const getCustomizeUnitCode = useCallback(
    (type = null) => {
      if (!type || isEmpty(type)) {
        return null;
      }

      const RfxCodeMap = new Map([
        ['buttons', 'SSRC.SUPPLIER_QUOTATION_NEW.BUTTONS'], // 头部按钮组
        ['baseForm', 'SSRC.SUPPLIER_QUOTATION_NEW.BASE'], // 基础信息
        ['project', 'SSRC.SUPPLIER_QUOTATION_NEW.PROJECT_INFO'],
        ['table', 'SSRC.SUPPLIER_QUOTATION_NEW.LINE'], // 报价行表格
        ['batchMaintain', 'SSRC.SUPPLIER_QUOTATION_NEW.LINE_BATCH'], // 报价行表格批量维护
        ['ladderTable', 'SSRC.SUPPLIER_QUOTATION_NEW.LINE_LADDER'], // 报价行表格-阶梯报价-表格
        ['history', 'SSRC.SUPPLIER_QUOTATION_NEW.LINE_HIS'], // 报价行历史
        ['tableSearch', 'SSRC.SUPPLIER_QUOTATION_NEW.LINE_FILTER'], // 报价行-筛选器
        ['attachment', 'SSRC.SUPPLIER_QUOTATION_NEW.ATTACHMENT'], // 附件,
        ['tableSummary', 'SSRC.SUPPLIER_QUOTATION_NEW.QUOTATION_LINE_SUMMARY_NEW_FORM'],
        ['tableButtons', 'SSRC.SUPPLIER_QUOTATION_NEW.LINE_TABLE_BUTTON'], // 报价行-按钮组
      ]);

      const BidCodeMap = new Map([
        ['buttons', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.BUTTONS'], // 头部按钮组
        ['baseForm', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.BASE'], // 基础信息
        ['project', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.PROJECT_INFO'],
        ['table', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE'], // 报价行表格
        ['batchMaintain', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_BATCH'], // 报价行表格批量维护
        ['ladderTable', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_LADDER'], // 报价行表格-阶梯报价-表格
        ['history', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_HIS'], // 报价行历史
        ['tableSearch', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_FILTER'], // 报价行-筛选器
        ['attachment', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.ATTACHMENT'], // 附件,
        ['tableSummary', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.QUOTATION_LINE_SUMMARY_NEW_FORM'],
        ['tableButtons', 'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_TABLE_BUTTON'], // 报价行-按钮组
      ]);

      const CodeDataMap = !bidFlag ? RfxCodeMap : BidCodeMap;
      let currentUnitCode = null;

      if (typeof type === 'string') {
        currentUnitCode = CodeDataMap.get(type);
      }

      if (isArray(type)) {
        const codeSet = new Set();
        type.forEach((unitCode) => {
          codeSet.add(CodeDataMap.get(unitCode));
        });

        currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
      }

      return currentUnitCode;
    },
    [pathname, search, bidFlag]
  );

  /**
   * 报价行查询
   * @param { Boolean } linePageFlag 行刷新是否传分页数量标识
   */
  const queryQuotationLines = useCallback(
    async ({ linePageFlag = false } = {}) => {
      const { currentPage } = quotationLineDS;
      if (linePageFlag) {
        await quotationLineDS.query(currentPage || 1);
      } else {
        await quotationLineDS.query();
      }

      await afterQueryLineFetchRank();
    },
    [search, quotationLineDS]
  );

  // 批量编辑后计算
  // const afterBatchQuotationTableCalc = ({ editFlag, batchDto }) => {
  //   const summaryFormDSRecord = summaryFormDS.current;
  //   if (!summaryFormDSRecord || !batchDto) {
  //     return;
  //   }

  //   const { lineAmountField, currentShowTotalAmountField, queryQuotationCurrentTotalAmountField } =
  //     getAmountFieldsName() || {};

  //   const { totalCount } = quotationLineDS || {};
  //   const priceFieldName = getUnitPriceFieldName();
  //   const currentUnitPrice = batchDto[priceFieldName];

  //   const { [queryQuotationCurrentTotalAmountField]: originCount } = summaryFormDSRecord.get([
  //     'queryQuotationCurrentTotalAmountField',
  //   ]);

  //   if (editFlag) {
  //     if (!totalCount) {
  //       return;
  //     }

  //     let lineCount = totalCount;
  //     if (isNil(currentUnitPrice)) {
  //       lineCount = 0;
  //     }

  //     const quotationLineFirstLineRecord = quotationLineDS.get(0);
  //     const amountNewValue = quotationLineFirstLineRecord.get(lineAmountField);

  //     let currentQuotationTotalCountValue = math.plus(
  //       math.multipliedBy(amountNewValue || 0, totalCount || 0),
  //       originCount || 0
  //     );

  //     if (currentQuotationTotalCountValue < 0) {
  //       currentQuotationTotalCountValue = null;
  //     }

  //     summaryFormDSRecord.set({
  //       currentQuotationTotalCountValue: lineCount,
  //       currentQuotationTotalCount: lineCount,
  //       [currentShowTotalAmountField]: currentQuotationTotalCountValue,
  //       [lineAmountField]: currentQuotationTotalCountValue,
  //     });
  //   }

  //   // 勾选批量编辑
  //   if (!editFlag) {
  //     calcQuotationTableSummaryQuotationLine();
  //     calcQuotationTableSummaryQuotationAmount();
  //   }
  // };

  /**
   * 批量更新报价行
   */
  const batchUpdateLines = useCallback(
    (lineDS = {}, batchDto = {}, editFlag = 0, currentData = {}) => {
      if (isEmpty(batchDto)) {
        // 批量维护表单数据
        return;
      }

      updateBatchMaintainCache(editFlag, batchDto, currentData);

      const { fields = [] } = lineDS || {};
      const dsAllFields = fields.toJS() || []; // ds all fields

      /**
       * update value
       * dataList DataSet[] 需要更新的行数据
       * dsCurrentFiels Fields
       */
      const updateDSFieldsValue = ({ dataList = [], dsCurrentFiels = {} }) => {
        if (isEmpty(dataList) || isEmpty(dsCurrentFiels)) {
          return;
        }

        dataList.forEach((record = {}) => {
          // 仅剔除放弃行
          const abandonedFlag = record.get('abandonedFlag');
          if (abandonedFlag === 1) {
            return;
          }
          updateCommonLineValue({ record, dsCurrentFiels, data: currentData });
        });
      };

      for (const [index] of dsAllFields) {
        const dsCurrentFiels = lineDS.getField(index);
        if (editFlag === 1) {
          updateDSFieldsValue({ dataList: lineDS.all, dsCurrentFiels });
          updateDSFieldsValue({ dataList: lineDS.cachedModified, dsCurrentFiels });
        }

        if (editFlag === 0) {
          updateDSFieldsValue({ dataList: lineDS?.selected, dsCurrentFiels });
        }
      }

      const { dynamicChangePrice } = lineRef?.current || {};
      const updateLineFlag = updateLinesPirceAndAmountFlag(batchDto);

      runInAction(() => {
        lineDS.forEach((record = {}) => {
          if (updateLineFlag && isFunction(dynamicChangePrice)) {
            dynamicChangePrice(record); // 重新计算行价,格金额
          }
        });
      });

      // afterBatchQuotationTableCalc({
      //   editFlag,
      //   batchDto,
      // });
    },
    [updateCommonLineValue, lineRef]
  );

  /**
   * 判断行需要重新计算行价格 or 金额
   * @param batchDto object 批量维护表单数据
   *
   * TODO
   * 批量编辑，行都触发重新计算逻辑，消耗一部分性能
   * 后期改造计划，批量编辑中，筛选如有影响价格或金额的字段值存在，才去触发计算，
   * 比如数量，单价，税率，是否含税，还有双单位逻辑......
   * */
  const updateLinesPirceAndAmountFlag = (batchDto = {}) => {
    const flag = true;
    if (isEmpty(batchDto)) {
      return false;
    }

    return flag;
  };

  /**
   * 更行行数据值
   * record - current line
   * dsCurrentFields current field obj
   * data object 批量更新数据
   * */
  const updateCommonLineValue = useCallback(
    ({ record, dsCurrentFiels, data = {} }) => {
      const { name } = dsCurrentFiels || {};
      // const currentValueField = dsCurrentFiels.get('valueField');
      // const isValueExist = Object.prototype.hasOwnProperty.call(data, currentValueField);

      const fieldEditFlag = getIsEditFlag({ record, key: name });

      // 如果行字段不可编辑，则不赋值
      if (!fieldEditFlag) {
        return;
      }

      const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

      const unTaxRate = (name === 'taxRate' || name === 'taxId') && taxIncludedFlag !== 1;
      if (unTaxRate) {
        return;
      }

      // if (type === 'object' && isValueExist) {
      //   const currentTextField = dsCurrentFiels.get('textField');

      //   const lovData = {
      //     [currentValueField]: data[currentValueField],
      //   };

      //   if (Object.prototype.hasOwnProperty.call(data, currentTextField)) {
      //     lovData[currentTextField] = data[currentTextField];
      //   }

      //   const lovAllData = {
      //     ...(data[name] || {}), // triggle ds update need all lov data
      //     ...lovData,
      //   };

      //   record.set(name, lovAllData);
      //   return;
      // }

      if (Object.prototype.hasOwnProperty.call(data, name)) {
        const currentValue = data[name];

        record.set(name, data[name]);

        if (name === 'taxIncludedFlag' && !currentValue) {
          record.set('taxId', null);
        }
      }
    },
    [getIsEditFlag]
  );

  // 行上如果字段不能编辑，批量编辑不更新值
  const getIsEditFlag = useCallback(({ record, key }) => {
    const currentField = record?.getField(key);
    if (!currentField) return false;
    const disabledFlag = currentField.get('disabled');
    const readOnlyFlag = currentField.get('readOnly');
    const disabledBatchFlag = disabledFlag || readOnlyFlag;
    if (disabledBatchFlag) {
      return false;
    }
    return true;
  }, []);

  // get batch update symbol and data
  const getBatchUpdateFlag = useCallback(() => {
    return {
      batchEditQuotationLineDTO,
      allEditFlag,
      batchEditData,
    };
  }, [batchEditQuotationLineDTO, allEditFlag, batchEditData]);

  /**
   * 提交数据整理
   * forceInterRuptFlag  判断是否需要校验
   *
   * 全量批量编辑 只给后端传当前页数据，勾选和无批量编辑，传递勾选或变更数据，这块要特殊处理
   * */
  const getCurrentPageSubmitData = useCallback(
    async (forceInterRuptFlag = 1) => {
      let validationFlag = false;
      let formData = null;
      let tableData = [];
      let headerUploadValidateFlag = true;
      let lineUploadValidateFlag = true;
      const { allEditFlag: editFlag, batchEditQuotationLineDTO: batchDto } =
        batchCacheDataRef?.current || {};

      if (!basicFormDS?.current) {
        return;
      }

      basicFormDS.current.set('status', 'update');
      const currentLineDS = quotationLineDS;

      // let formError = null;
      // let tableError = null;
      // let errorMessage = null;

      if (forceInterRuptFlag) {
        const headerValidateFlag = await basicFormDS.validate();
        lineUploadValidateFlag = await getRecordAttachmentUploadErrors(basicFormDS);
        if (!lineUploadValidateFlag) {
          validationFlag = false;
        }

        const lineValidatePromise = [];

        // if (allEditFlag === 1) {
        //   // currentLineDS = quotationLineDS.records || [];
        //   await batchUpdateLines(quotationLineDS, batchEditQuotationLineDTO, allEditFlag);
        // }

        runInAction(() => {
          quotationLineDS.forEach((record = {}) => {
            if (!record) {
              return;
            }

            const skipValidate = record.get('abandonedFlag') === 1;
            if (!skipValidate) {
              record.set('status', 'update');

              const currentLineValidateFlag = record.validate();

              lineValidatePromise.push(currentLineValidateFlag);

              // if (allEditFlag === 1) {
              //   const currentLineData = record.toData();
              //   tableData.push(currentLineData);
              // }
            }
          });
        });

        const needValidateLineResult = await Promise.all(lineValidatePromise);

        // validationFlag = await Promise.all([basicFormDS.validate(), quotationLineDS.validate()]);
        validationFlag = needValidateLineResult.every((validateFlag) => validateFlag);
        validationFlag = !!headerValidateFlag && validationFlag;

        headerUploadValidateFlag = await getRecordAttachmentUploadErrors(quotationLineDS); // attachment
        if (!headerUploadValidateFlag) {
          validationFlag = false;
        }

        // formError = await basicFormDS.getValidationErrors();
        // tableError = await quotationLineDS.getValidationErrors();
        // formError = getErrors({
        //   data: formError,
        //   groupCategory: intl.get('ssrc.common.view.message.basicInfos').d('基础信息'),
        // });
        // tableError = getErrors({
        //   data: tableError,
        //   groupFieldName: 'itemName',
        //   groupCategory: intl.get('ssrc.common.quotationLineInfomations').d('报价行信息'),
        //   primaryKey: 'quotationLineCurrentId',
        // });

        // errorMessage =
        //   formError && tableError ? `${formError}, ${tableError}` : formError || tableError || '';
      }

      formData = basicFormDS?.current?.toData();
      tableData = currentLineDS.toData();
      // if (allEditFlag !== 1) {
      //   tableData = currentLineDS.toData();
      // }
      const quotationHeaderIdList = [formData?.quotationHeaderId];

      return {
        validationFlag,
        // errorMessage,
        uploadValidateFlag: headerUploadValidateFlag && lineUploadValidateFlag,
        rfxQuotationHeaderCurDTO: formData,
        rfxQuotationLineCurDTOList: tableData,
        organizationId,
        quotationHeaderIdList,
        allEditFlag: editFlag ?? allEditFlag,
        batchEditQuotationLineDTO: batchDto ?? batchEditQuotationLineDTO,
        query: {
          customizeUnitCode: getCustomizeUnitCode([
            'baseForm',
            'table',
            'attachment',
            'tableSummary',
          ]),
        },
      };
    },
    [
      getCustomizeUnitCode,
      search,
      pathname,
      bidFlag,
      quotationName,
      basicFormDS,
      basicFormDS.current,
      quotationLineDS,
      projectLineSectionList?.length,
      batchEditQuotationLineDTO,
      allEditFlag,
      batchUpdateLines,
      batchCacheDataRef.current,
    ]
  );

  // 处理提交前校验逻辑
  const handleValidationResult = useCallback(
    (data = {}) => {
      const {
        res = {},
        confirmSubmit = noop,
        afterSuccessSubmit = noop,
        submitProjectLineSectionList, // 传入获取到的提交标段list
        // validationStageFlag = 0, // 校验阶段标识
        overrideSubmitWarninOkOperate, // 覆盖onOk操作
        submitData,
      } = data || {};
      const result = getResponse(res);
      if (!result || isEmpty(result)) {
        return;
      }

      const { validateResults = [], rfxQuotationHeaderCurDTOS = [] } = result || {};

      if (isEmpty(validateResults)) {
        const currentHeader = (rfxQuotationHeaderCurDTOS || []).find(
          (resultLine) => resultLine?.rfxHeaderId === rfxHeaderId
        );
        afterSuccessSubmit(currentHeader);
        return;
      }

      if (!isEmpty(validateResults)) {
        const errorsMap = { lists: [], description: '' };
        const warningsMap = { lists: [], description: '' };
        let title = intl
          .get('ssrc.common.view.title.quotationSubmitWarningText', {
            quotationName,
          })
          .d('本次{quotationName}需确认');

        validateResults.forEach((validateLine = {}) => {
          const { type } = validateLine || {};
          if (type === 'ERROR') {
            // 校验失败
            errorsMap.lists.push(validateLine);
          }

          if (type === 'WARNING') {
            warningsMap.lists.push(validateLine);
          }
        });

        if (errorsMap.lists.length) {
          const allErrorList = [...errorsMap.lists, ...warningsMap.lists];
          validateDS.loadData(allErrorList);
          title = intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过');
        }

        if (warningsMap.lists.length && !errorsMap.lists.length) {
          validateDS.loadData(warningsMap.lists);
          title = intl
            .get('ssrc.common.view.title.quotationSubmitWarningText', {
              quotationName,
            })
            .d('本次{quotationName}需确认');
        }

        // 是否显示取消按钮
        const isShowErrButtonFlag = errorsMap?.lists?.length === 0;
        let continueWarningFlag = 1; // 是否继续后边的提示

        const modalCurrentProps = {};
        const modalProps = quotationRemote
          ? quotationRemote.process(
              'SSRC_SUPPLIER_QUOTATION_NEW_SUBMIT_ALL_VALIDATE_MODAL_PROPS',
              modalCurrentProps,
              {
                validateResults,
              }
            )
          : modalCurrentProps;

        Modal.open({
          key: Modal.key(),
          closable: true,
          destroyOnClose: true,
          style: {
            width: '700px',
          },
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          // okButton: errorsMap?.lists?.length === 0,
          cancelProps: {
            color: isShowErrButtonFlag ? 'default' : 'primary',
          },
          cancelText: isShowErrButtonFlag
            ? intl.get('hzero.common.button.cancel').d('取消')
            : intl.get('hzero.common.button.close').d('关闭'),
          okButton: isShowErrButtonFlag,
          children: (
            <>
              <div style={{ marginBottom: '16px' }}>{title}</div>
              <ValidationResultModal
                ds={validateDS}
                sectionFlag={submitProjectLineSectionList?.length > 1}
              />
            </>
          ),
          onOk: async () => {
            if (isShowErrButtonFlag) {
              // 覆盖提示操作，覆盖函数返回1 ，就继续执行后边提示
              if (isFunction(overrideSubmitWarninOkOperate)) {
                const warningResult = await overrideSubmitWarninOkOperate(validateResults, {
                  submitData,
                });
                continueWarningFlag = warningResult === 1 ? 1 : 0;
              }

              if (continueWarningFlag === 0) {
                return;
              }

              confirmSubmit();
            } else {
              // 同取消按钮的功能
              validateDS.loadData();
              validateDS.reset();
            }
          },
          onCancel: () => {
            validateDS.loadData();
            validateDS.reset();
          },
          ...(modalProps || {}),
        });
      }
    },
    [
      validateDS,
      validateDS?.length,
      search,
      loading,
      pathname,
      projectLineSectionList?.length,
      overrideSubmitWarninOkOperate,
    ]
  );

  // 提交成功后
  const successSubmit = useCallback(
    async (res, otherOptions = {}) => {
      const { current } = basicFormDS || {};
      const { sourceCategory } = current ? current?.get(['sourceCategory']) : {};
      const { from } = otherOptions || {};

      let afterSubmitFlag = true;
      if (quotationRemote?.event) {
        // 给state中设置二开的值
        afterSubmitFlag = await quotationRemote.event.fireEvent('remoteAfterOnSubmit', {
          pageProps: props,
          basicFormDS,
          res,
          otherOptions,
        });

        if (afterSubmitFlag === false) {
          return false;
        }
      }

      if (sourceCategory === 'RFA') {
        refreshAllPageData();

        if (from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
          directionListWithTab();
        }
        return;
      }

      directionListWithTab();
    },
    [directionList, basicFormDS, refreshAllPageData, directionListWithTab]
  );

  const directionListWithTab = useCallback(
    (tabName = 'onGoing') => {
      const listSearchData = querystring.stringify({
        tab: tabName, // 需要跳转到列表页的进行中Tab
      });
      directionList({
        listSearch: listSearchData,
      });
    },
    [directionList]
  );

  // 调用远程提交接口
  const handleSubmit = async (data = {}) => {
    if (!data) {
      return;
    }

    let result = null;
    try {
      toggleLoading(true);
      result = await submitQuotationNew(data);
      toggleLoading();

      result = getResponse(result);
    } catch (e) {
      throw e;
    } finally {
      toggleLoading();
    }

    return result;
  };

  const getRecordAttachmentUploadErrors = async (currentDS) => {
    let uploadValidateFlag = true;

    if (!currentDS) {
      return uploadValidateFlag;
    }

    const errorList = await currentDS.getValidationErrors();
    if (isEmpty(errorList)) {
      return uploadValidateFlag;
    }

    const errs = errorList[0]?.errors;
    if (isEmpty(errs)) {
      return uploadValidateFlag;
    }

    let attachmentValidateObj = null;
    errs.forEach((err) => {
      const currentErr =
        err?.errors?.filter((item) => item?.ruleName === 'attachmentError')[0] || {};
      const { ruleName } = currentErr;
      if (ruleName === 'attachmentError') {
        attachmentValidateObj = currentErr;
      }
    });

    // const attachmentValidateObj =
    //   errorList[0]?.errors[0]?.errors?.filter((item) => item.ruleName === 'attachmentError')[0] ||
    //   {};

    const message = attachmentValidateObj?.$validationMessage;
    if (message) {
      notification.error({ message });
      uploadValidateFlag = false;
    }

    return uploadValidateFlag;
  };

  // 提交
  const submitQuotation = useCallback(
    throttle(async (outData = {}, otherOptions = {}) => {
      const { projectLineSectionList: submitProjectLineSectionList } = outData || {};
      const { outSubmitPassFlag = null } = otherOptions || {};
      const { validationFlag = false, uploadValidateFlag = true, ...data } =
        (await getCurrentPageSubmitData()) || {};
      if (!validationFlag) {
        if (!uploadValidateFlag) {
          return;
        }
        let errorInfoStr = intl
          .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
          .d('提交前请填写完整相关信息');
        const originAllErrorInfos = await quotationLineDS.getValidationErrors();
        const sortAllErrorInfos = originAllErrorInfos?.sort((a, b) => {
          return b?.errors.length - a?.errors.length;
        });
        const uploadValidateObj = { errorFlag: false };
        if (sortAllErrorInfos.length > 0) {
          const errorInfos = sortAllErrorInfos[0].errors;
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
              let currentError = `${currentPrev + currentLable} ${intl
                .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
                .d('校验不通过')}`;
              currentError = quotationRemote
                ? quotationRemote.process(
                    'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_SUBMITQUOTATION_VALIDATIONERRORTEXT',
                    currentError,
                    {
                      allList: curArr,
                      curArrFirst: curArr[0],
                      pageProps: props,
                      basicFormDS,
                      quotationLineDS,
                    }
                  )
                : currentError;

              return currentError;
            } else {
              return intl
                .get(`ssrc.offlineResultEntry.view.offlineEntry.validateFailed`)
                .d('校验不通过');
            }
          }, '');
        }

        if (uploadValidateObj?.errorFlag) {
          notification.warning({
            message: uploadValidateObj?.message,
          });
          return;
        }

        notification.warning({
          message: errorInfoStr,
        });
        return;

        // notification.warning({
        //   message: intl
        //     .get('ssrc.inquiryHall.view.inquiryHall.inputSubmitRfxUpdate')
        //     .d('提交前请填写完整相关信息'),
        // });
        // return;
      }

      if (isEmpty(data)) {
        return;
      }

      const passFlag = outSubmitPassFlag ?? 0;
      const newData = {
        ...data,
        ...outData,
        passFlag,
      };

      // 二次提交确认
      const confirmSubmit = async (submitOutterData = {}) => {
        let result = null;
        const submitInnerData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
        const submitData = { ...newData, ...submitInnerData, ...submitOutterData };
        result = await handleSubmit(submitData);
        result = getResponse(result);
        if (!result || isEmpty(result)) {
          return;
        }

        await handleValidationResult({
          submitData,
          res: result,
          validationStageFlag: 0,
          afterSuccessSubmit: (res) => {
            successSubmit(res, otherOptions);
          },
        });
      };

      let result = null;
      try {
        result = await handleSubmit(newData);

        await handleValidationResult({
          submitData: newData,
          res: result,
          validationStageFlag: 1,
          confirmSubmit: (newSubmitData) => confirmSubmit(newSubmitData),
          afterSuccessSubmit: (res) => {
            successSubmit(res, otherOptions);
          },
          overrideSubmitWarninOkOperate,
          submitProjectLineSectionList, // 提交标段数据
        });
      } catch (e) {
        throw e;
      }
    }, 2000),
    [
      pathname,
      getCurrentPageSubmitData,
      handleValidationResult,
      successSubmit,
      overrideSubmitWarninOkOperate,
      quotationName,
    ]
  );

  // 多标段提交处理
  const submitQuotationSection = useCallback(
    (submitType, options = {}) => {
      const { getSectionList = () => {}, getCurrentSection = noop } = sectionRef.current || {};
      let allSectionList = getSectionList();
      const quotationHeaderIdList = [];

      let sectionData = null;
      if (submitType === 'CURRENT') {
        sectionData = [getCurrentSection() || {}];
      }

      if (submitType === 'ALL') {
        sectionData = getSectionList() || {};
      }

      if (submitType === 'PORTION') {
        const { sectionCheckedList = [] } = options || {};
        sectionData = sectionCheckedList;
      }

      if (isEmpty(sectionData)) {
        return;
      }

      allSectionList = sectionData.map((sectionItem = {}) => {
        const {
          sourceHeaderId: sectionSourceHeaderId = null,
          sourceRoundNumber,
          sourceObjectVersionNumber,
          quotationHeaderId: sectionQuotationHeaderId,
        } = sectionItem || {};
        if (!sectionQuotationHeaderId) {
          return;
        }

        quotationHeaderIdList.push(sectionQuotationHeaderId);
        return {
          ...sectionItem,
          rfxHeaderId: sectionSourceHeaderId,
          roundNumber: sourceRoundNumber,
          objectVersionNumber: sourceObjectVersionNumber,
          tenantId: organizationId,
        };
      });
      const isSectionErrorFlag = (allSectionList || []).some((i) => i?.bidBondFlag === 1);
      // 多标段前置校验
      if (isSectionErrorFlag) {
        const message = `${
          intl.get(`ssrc.supplierQuotation.view.message.notPay`).d(`请缴纳保证金后再`) +
          secondarySourceCategoryMeaning
        }!`;
        return notification.warning({
          message,
          placement: 'bottomRight',
          duration: 1.0,
        });
      }
      submitQuotation({
        projectLineSectionList: allSectionList,
        quotationHeaderIdList,
      });
    },
    [search, pathname, bidFlag, submitQuotation]
  );

  // 保存
  const saveQuotation = useCallback(
    throttle(async () => {
      const { validationFlag = false, uploadValidateFlag = true, ...data } =
        (await getCurrentPageSubmitData()) || {};

      if (!validationFlag) {
        if (!uploadValidateFlag) {
          return;
        }
      }

      if (isEmpty(data)) {
        return false;
      }

      let result = null;
      toggleLoading(true);
      try {
        result = await saveQuotationNew(data);
        toggleLoading();
        result = operateResponseMessagePrompt({
          res: result,
        });
        if (!result) {
          return;
        }
        refreshAllPageData({ linePageFlag: true });
      } catch (e) {
        throw e;
      }

      return true;
    }, 1500),
    [getCurrentPageSubmitData, pathname]
  );

  // 刷新全页面，区分标段和普通刷新
  const refreshAllPageData = useCallback(
    (param = {}) => {
      const { linePageFlag } = param;
      const { sourceCategory } = basicFormDS.current
        ? basicFormDS.current.get(['sourceCategory'])
        : {};
      const { queryHeaderContent } = sectionRef.current || {};
      quotationLineDS.unSelectAll();
      quotationLineDS.clearCachedSelected();
      updateBatchMaintainCache();
      const sectionDataFlag = false;
      if (!sectionDataFlag) {
        fetchHeader({ linePageFlag });
      }
      if (sourceCategory === 'RFA') {
        rollingFetchQuotationListInfo();
      }

      if (queryHeaderContent && isFunction(queryHeaderContent)) {
        queryHeaderContent();
      }
    },
    [pathname, basicFormDS, fetchHeader, rollingFetchQuotationListInfo, quotationLineDS]
  );

  // 批量编辑数据变更缓存
  const updateBatchMaintainCache = (flag = -1, batchData = {}, currentData = {}) => {
    const batchDataValue = batchData || {};
    setAllEditFlag(flag);
    setBatchEditQuotationLineDTO(batchDataValue);
    setBatchEditData(currentData);

    batchCacheDataRef.current = {
      allEditFlag: flag,
      batchEditQuotationLineDTO: batchDataValue,
      batchEditData: currentData,
    };
  };

  // 跳转到列表页
  const directionList = useCallback(
    (param = {}) => {
      const { listSearch = null } = param || {};
      history.push({
        pathname: backPath || `${activeTabKey}/list`,
        search: listSearch,
      });
    },
    [pathname, activeTabKey]
  );

  // pin fix top change
  const handleChangePin = () => {
    setPinFixed(!pinFixed);
  };

  // get section list
  const getSectionListData = useCallback(() => {
    const { getSectionList = () => {} } = sectionRef.current || {};
    const allSectionList = getSectionList();
    return allSectionList;
  }, [pathname, search, basicFormDS]);

  // bindref section panel
  const bindRef = useCallback(
    (ref) => {
      sectionRef.current = ref || {};
    },
    [pathname, search, bidFlag]
  );

  // 定位到当前页面
  const locatedCurrentUrl = useCallback(
    (data = {}) => {
      const {
        quotationHeaderId: currentSectionQuotationHeaderId = null,
        projectLineSectionId: currentProjectLineSectionId = null,
      } = data || {};
      if (!currentSectionQuotationHeaderId) {
        return;
      }

      const newSearch = querystring.stringify({
        ...searchData,
        projectLineSectionId: currentProjectLineSectionId,
      });

      history.push({
        pathname: `${activeTabKey}/quotation/${currentSectionQuotationHeaderId}`,
        search: newSearch,
      });
    },
    [pathname, activeTabKey, basicFormDS, bidFlag, projectLineSectionList?.length]
  );

  // 批量导入成功
  const batchImportOk = useCallback(() => {
    fetchHeader(); // TODO refresh header
  }, [fetchHeader, pathname]);

  let uModalRef = null;

  // 整单放弃逻辑多标段
  const handleWholeAbandonSection = useCallback(
    (submitType, options = {}) => {
      const { getSectionList = () => {}, getCurrentSection = noop } = sectionRef.current || {};
      let allSectionList = getSectionList();

      let sectionData = null;
      if (submitType === 'CURRENT') {
        // 整单放弃当前标段
        sectionData = [getCurrentSection() || {}];
      }

      if (submitType === 'ALL') {
        // 整单放弃所有标段
        sectionData = getSectionList() || {};
      }

      if (submitType === 'PORTION') {
        // 整单放弃部分标段
        const { sectionCheckedList = [] } = options || {};
        sectionData = sectionCheckedList;
      }
      if (isEmpty(sectionData)) {
        return;
      }
      allSectionList = sectionData
        .map((sectionItem = {}) => {
          const {
            sourceHeaderId: sectionSourceHeaderId = null,
            quotationHeaderId: sectionQuotationHeaderId,
            supplierStatus,
          } = sectionItem || {};

          if (!sectionQuotationHeaderId) {
            return;
          }

          if (!['QUOTATION_ABANDONED', 'ABANDONED'].includes(supplierStatus)) {
            return {
              rfxHeaderId: sectionSourceHeaderId,
              quotationHeaderId: sectionQuotationHeaderId,
            };
          }
          return null;
        })
        .filter(Boolean);
      handleWholeAbandon({
        isBidSection: true,
        rfxQuotationWholeAbandonDTOS: allSectionList,
      });
    },
    [handleWholeAbandon, sectionRef.current]
  );

  // 整单放弃逻辑
  const handleWholeAbandon = useCallback(
    throttle((otherProps = {}) => {
      wholeAbadonDS = new DataSet(wholeAbadonDataSet());

      const modalProps = {
        wholeAbadonDS,
      };

      const modalTitle = `${intl
        .get(`ssrc.supplierQuotation.view.message.giveUp`)
        .d('放弃')}${quotationName}`;

      uModalRef = uModal.open({
        drawer: true,
        closable: true,
        style: {
          width: '380px',
        },
        destroyOnClose: true,
        title: modalTitle,
        children: <WholeAbandonForm {...modalProps} />,
        onOk: () => wholeAbandonQuotation(otherProps),
        onClose: () => {
          wholeAbadonDS.loadData();
        },
      });
      return uModalRef;
    }, 1000),
    [wholeAbandonQuotation, wholeAbadonDS, rfxHeaderId, quotationHeaderId]
  );

  // 整单放弃
  const wholeAbandonQuotation = useCallback(
    throttle(async (otherProps = {}) => {
      idValidation(quotationHeaderId);
      const { current } = wholeAbadonDS || {};
      const { from, submitData, rfxQuotationWholeAbandonDTOS, isBidSection } = otherProps || {};
      if (!quotationHeaderId || !current) {
        return;
      }

      const validateFlag = await wholeAbadonDS.validate();
      if (!validateFlag) {
        return false;
      }

      const data = current.toData();
      if (isEmpty(data)) {
        return false;
      }

      const abandonedData = {
        ...(submitData || {}),
        ...(data || {}),
        // isBidSection 代表多标段
        rfxQuotationWholeAbandonDTOS: !isBidSection
          ? [
              {
                rfxHeaderId,
                quotationHeaderId,
              },
            ]
          : rfxQuotationWholeAbandonDTOS,
        from, // 标识整单放弃的途径
      };

      const newData = {
        organizationId,
        data: abandonedData,
        queryParam: {
          customizeUnitCode: getCustomizeUnitCode([
            'baseForm',
            'table',
            'attachment',
            'tableSummary',
          ]),
        },
      };

      if (from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
        const SubmitOptions = { outSubmitPassFlag: 1, from };
        submitQuotation(abandonedData, SubmitOptions);
        if (uModalRef) {
          uModalRef.close();
        }
        return;
      }

      let result = null;
      toggleLoading(true);
      try {
        result = await quotationWholeAbandon(newData);
        toggleLoading(false);
        if (!result) {
          return false;
        }

        await handleValidationResult({
          res: result,
          afterSuccessSubmit: () => {
            directionToListTimer = setTimeout(directionList, 200);
          },
          // headerId: quotationHeaderId,
        });
      } catch (e) {
        throw e;
      }
    }, 1000),
    [
      handleValidationResult,
      wholeAbandonQuotation,
      wholeAbadonDS,
      basicFormDS,
      quotationHeaderId,
      rfxHeaderId,
      getCustomizeUnitCode,
      refreshAllPageData,
      quotationName,
      directionList,
      uModal,
      uModalRef,
    ]
  );

  // 覆盖提示 如果消息编码代表是整单放弃提示，需要打开弹窗 quotationHeaderIdList
  // @return int 1 | 0
  const overrideSubmitWarninOkOperate = useCallback(
    (validateResults, options) => {
      const { submitData } = options || {};
      let continueWarningFlag = 1;
      if (isEmpty(validateResults)) {
        return continueWarningFlag;
      }

      const wholeAbandonMessage = validateResults.filter(
        (item) => item?.code === 'error.rfx_quotation_whole_submit_warning_info'
      );
      if (!isEmpty(wholeAbandonMessage)) {
        continueWarningFlag = 0;

        handleWholeAbandon({
          from: 'SUBMIT_WARNING_ALL_LINES_ABANDONED',
          passFlag: 1,
          submitData,
        });
      }

      return continueWarningFlag;
    },
    [handleWholeAbandon, params]
  );

  const tablePaginationChange = () => {
    const summaryFormDSRecord = summaryFormDS.current;
    if (!summaryFormDSRecord) {
      return;
    }

    const {
      currentQuotationTotalCountValue,
      currentQuotationTotalCount,
      quotationCurrentTotalAmountValue,
      quotationCurrentTotalAmount,
      quotationCurrentNetAmountValue,
      quotationCurrentNetAmount,
    } = summaryFormDSRecord.get([
      'currentQuotationTotalCount',
      'currentQuotationTotalCountValue',
      'quotationCurrentTotalAmountValue',
      'quotationCurrentTotalAmount',
      'quotationCurrentNetAmountValue',
      'quotationCurrentNetAmount',
    ]);

    const linePriceOrAmountChangeFlag =
      currentQuotationTotalCountValue !== currentQuotationTotalCount ||
      quotationCurrentTotalAmountValue !== quotationCurrentTotalAmount ||
      quotationCurrentNetAmountValue !== quotationCurrentNetAmount;

    if (linePriceOrAmountChangeFlag) {
      saveQuotation();
    }
  };

  // 获取单价字段名
  const getUnitPriceFieldName = () => {
    let linePriceField = 'currentQuotationPrice';

    if (!doubleUnitFlag) {
      if (isUnTaxPriceFlag) {
        linePriceField = 'netPrice';
      }
    }

    if (doubleUnitFlag) {
      linePriceField = 'currentQuotationSecPrice';

      if (isUnTaxPriceFlag) {
        linePriceField = 'netSecondaryPrice';
      }
    }

    return linePriceField;
  };

  // 金额字段
  const getAmountFieldsName = () => {
    let lineAmountField = 'currentLnTotalAmount';
    let currentShowTotalAmountField = 'quotationCurrentTotalAmountValue';
    let queryQuotationCurrentTotalAmountField = 'quotationCurrentTotalAmount'; // 查询的当前金额

    if (isUnTaxPriceFlag) {
      lineAmountField = 'currentLnNetAmount';
      queryQuotationCurrentTotalAmountField = 'quotationCurrentNetAmount';
      currentShowTotalAmountField = 'quotationCurrentNetAmountValue';
    }

    return {
      lineAmountField,
      currentShowTotalAmountField,
      queryQuotationCurrentTotalAmountField,
    };
  };

  // 计算报价行数
  const calcQuotationTableSummaryQuotationLine = () => {
    const partQuotationFlag = quotationScope === 'PART_QUOTATION';
    const summaryFormDSRecord = summaryFormDS.current;
    if (!partQuotationFlag || !summaryFormDSRecord) {
      return;
    }

    const linePriceField = getUnitPriceFieldName();

    const { currentQuotationTotalCount: originCount } = summaryFormDSRecord.get([
      'currentQuotationTotalCount',
    ]);

    let currentCount = 0;

    const calcLineCount = (data) => {
      if (!data?.length) {
        return;
      }

      data.forEach((record) => {
        if (!record) {
          return;
        }

        const originLinePrice = record.getPristineValue(linePriceField);
        const { [linePriceField]: currentLinePrice } = record.get([linePriceField]);

        const priceQuotedFlag = !isNil(currentLinePrice) && isNil(originLinePrice);
        const priceQuotedCancelFlag = !isNil(originLinePrice) && isNil(currentLinePrice);

        if (priceQuotedFlag) {
          currentCount = math.plus(currentCount, 1);
        }

        if (priceQuotedCancelFlag) {
          currentCount = math.minus(currentCount, 1);
        }
      });
    };

    calcLineCount(quotationLineDS);
    calcLineCount(quotationLineDS.cachedModified);

    currentCount = math.plus(currentCount, originCount || 0);

    if (currentCount < 0) {
      currentCount = null;
    }

    summaryFormDSRecord.set({
      currentQuotationTotalCountValue: currentCount,
    });
  };

  // 计算报价金额
  const calcQuotationTableSummaryQuotationAmount = () => {
    const summaryFormDSRecord = summaryFormDS.current;
    if (!summaryFormDSRecord) {
      return;
    }

    const { lineAmountField, currentShowTotalAmountField, queryQuotationCurrentTotalAmountField } =
      getAmountFieldsName() || {};

    const { [queryQuotationCurrentTotalAmountField]: originCount } = summaryFormDSRecord.get([
      queryQuotationCurrentTotalAmountField,
    ]);

    let originTotalAmount = 0;
    let currentTotalAmount = 0;

    const calcLineAmount = (data) => {
      if (!data?.length) {
        return;
      }

      data.forEach((record) => {
        if (!record) {
          return;
        }

        const originLineAmount = record.getPristineValue(lineAmountField);
        const currentLineAmount = record.get(lineAmountField);

        originTotalAmount = math.plus(originTotalAmount || 0, originLineAmount || 0);
        currentTotalAmount = math.plus(currentTotalAmount || 0, currentLineAmount || 0);
      });
    };

    calcLineAmount(quotationLineDS);
    calcLineAmount(quotationLineDS.cachedModified);

    let currentQuotationTotalCountValue = math.plus(
      math.minus(currentTotalAmount || 0, originTotalAmount || 0),
      originCount || 0
    );

    if (currentQuotationTotalCountValue < 0) {
      currentQuotationTotalCountValue = null;
    }

    summaryFormDSRecord.set({
      [currentShowTotalAmountField]: math.toFixed(
        currentQuotationTotalCountValue,
        financialPrecision
      ),
    });
  };

  // 竞价整单排名表
  const rfaRankSheet = useCallback(() => {
    if (!currentQuotationRound) {
      return;
    }

    return (
      <RoundQuotationChart
        title={intl.get('ssrc.supplierquotation.view.biddingAllRankTable').d('竞价整单排名表')}
        type="biddingRankChart"
        quotationName={quotationName}
        headerDS={basicFormDS}
        organizationId={organizationId}
        showContent={
          <span className={Style['card-title-category']}>
            {`${intl.get(`ssrc.supplierQuotation.model.title.currentRankNum`).d('当前排名')}: ${
              currentQuotationRound ?? ''
            }`}
          </span>
        }
      />
    );
  }, [basicFormDS, pathname, quotationName, currentQuotationRound]);

  // 多轮报价信息
  const roundQuotationChart = useCallback(() => {
    const roundQuotationHideFlag = isNil(lastRoundQuotationRank) && isNil(lastRoundQuotationAmount);
    if (roundQuotationHideFlag) {
      return;
    }

    return (
      <RoundQuotationChart
        bidFlag={bidFlag}
        type="multiQuotationRound"
        quotationName={quotationName}
        headerDS={basicFormDS}
        organizationId={organizationId}
        showPopOverFlag={
          quotationRemote
            ? quotationRemote.process(
                'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_SHOW_POPOVER_FLAG',
                true,
                { bidFlag }
              )
            : true
        }
      />
    );
  }, [
    organizationId,
    basicFormDS,
    pathname,
    quotationName,
    lastRoundQuotationRank,
    roundQuotationRankFlag,
    lastRoundQuotationAmount,
    bidFlag,
    quotationRemote,
  ]);

  // 基本信息-title
  const renderBasicTitle = useCallback(() => {
    const { current } = basicFormDS || {};
    if (!current || !rfxNum) {
      return '';
    }
    const quotationEndDateHeader = current.get('quotationEndDate');

    const { quotationEndDate, currentDateTime } = countDownTimer || {};
    const currentBargainFlag = bargainStatus === 'BARGAINING_ONLINE'; // 议价

    // 如果单子报价已经截止，进入议价状态，则截止时间从头接口取，否则从轮询中取
    const countDownEndDate = currentBargainFlag ? quotationEndDateHeader : quotationEndDate;

    let title = intl
      .get(`ssrc.supplierQuotation.model.supQuo.commonGridQuotationPrice`, { quotationName })
      .d('{quotationName}');
    if (currentQuotationRound > 1) {
      title = `${intl.get('ssrc.common.the').d('第')} ${currentQuotationRound} ${intl
        .get('ssrc.common.round')
        .d('轮')}`;
    }
    if (currentBargainFlag) {
      title = intl.get('ssrc.common.view.bargainPrice').d('议价');
    }

    // cux dom before pin fixed
    const cuxDomBeforePin = quotationRemote
      ? quotationRemote.process('SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_BEFORE_PIN_FIXED_DOM', '', {
          pageProps: props,
          basicFormDS,
          quotationLineDS,
        })
      : '';

    const baseTitle = rfxNum && rfxTitle ? `${rfxNum}—${rfxTitle}` : rfxNum || rfxTitle;
    const tagWidth =
      (secondarySourceCategoryMeaning ? 68 : 0) +
      (secondarySourceCategory === 'RFA' && quotationScope === 'ALL_QUOTATION'
        ? !currentQuotationRound
          ? 0
          : 140
        : 0) +
      (currentQuotationRound > 1 && !currentBargainFlag ? 75 : 0) +
      (isNil(lastRoundQuotationRank) && isNil(lastRoundQuotationAmount) ? 0 : 140) +
      (currentBargainFlag && bargainTimes ? 72 : 0);
    return (
      <div className={Style['card-title-wrap']}>
        <div
          className={Style['rfx-header-wrapper']}
          style={{ maxWidth: 'calc(100% - 400px)', minWidth: '580px' }}
        >
          <span
            className={Style['card-title-rfx-info']}
            style={{ display: 'inline-block', maxWidth: `calc(100% - ${tagWidth}px)` }}
          >
            <Tooltip title={baseTitle} overlayStyle={{ minWidth: '300px' }}>
              {baseTitle}
            </Tooltip>
          </span>
          {secondarySourceCategoryMeaning ? (
            <span className={Style['card-title-category']}>
              <Tag color="gray" style={{ border: 'none' }}>
                {secondarySourceCategoryMeaning}
              </Tag>
            </span>
          ) : null}
          {/* {quotationScope === 'PART_QUOTATION' ? (
            <span style={{ marginLeft: '4px' }}>
              {intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationLineNumber`, {
                  quotationName,
                })
                .d('{quotationName}行数')}
              ：{quotationLineNumber}
            </span>
          ) : (
            ''
          )} */}
          {secondarySourceCategory === 'RFA' && quotationScope === 'ALL_QUOTATION'
            ? rfaRankSheet()
            : ''}
          {currentQuotationRound > 1 && !currentBargainFlag ? (
            <Tag color="gray" style={{ border: 'none' }}>
              {`${intl.get('ssrc.common.the').d('第')} ${currentQuotationRound} ${intl
                .get('ssrc.common.round')
                .d('轮')}`}
              {/* {intl.get('ssrc.common.the').d('第')}
              {currentQuotationRound}
              {intl.get('ssrc.common.round').d('轮')} */}
            </Tag>
          ) : (
            ''
          )}
          {roundQuotationChart()}
          {currentBargainFlag && bargainTimes ? (
            <span className={Style['card-title-category']}>
              {intl
                .get(`ssrc.common.theRoundBargainNum`, { bargainTimes })
                .d(`第{bargainTimes}次议价`)}
            </span>
          ) : (
            ''
          )}
          {/* {!isNil(quotationTotalAmount) ? (
            <span style={{ marginLeft: '10px' }}>
              {intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationTotalAmount`, {
                  quotationName,
                })
                .d('{quotationName}总金额')}
              :{numberSeparatorRender(quotationTotalAmount)}
            </span>
          ) : (
            ''
          )} */}
        </div>
        <div style={{ marginRight: '8px', display: 'flex', alignItems: 'baseline' }}>
          {cuxDomBeforePin}
          <PinFixed
            pinFixed={pinFixed}
            handleChangePin={handleChangePin}
            wrapStyle={{ marginRight: '16px' }}
          />
          <div className={Style['count-down-wrap']}>
            <span style={{ marginRight: '8px' }}>
              {`${title}${intl.get('ssrc.supplierQuotation.view.supQuo.cutOffTime').d('截止时间')}`}
            </span>
            <CountDown
              numberStyle={{ fontWeight: '500', fontSize: '24px', color: '#f05434' }}
              sysNow={currentDateTime}
              endTime={countDownEndDate}
              type="day"
            />
          </div>
        </div>
      </div>
    );
  }, [
    rfxNum,
    pathname,
    bidFlag,
    basicFormDS,
    countDownTimer,
    quotationScope,
    quotationLineNumber,
    secondarySourceCategory,
    currentQuotationRound,
    lastRoundQuotationRank,
    quotationTotalAmount,
    bargainTimes,
    bargainStatus,
    roundQuotationRankFlag,
    lastRoundQuotationAmount,
    pinFixed,
  ]);

  const renderQuotationLineTitle = useCallback(() => {
    const TableSummaryFormProps = {
      getCustomizeUnitCode,
      customizeCommon,
      customizeForm,
      customizeCollapseForm,
      basicFormDS,
      summaryFormDS,
      custLoading,
      isBidSectionData,
      quotationName,
      financialPrecision,
      quotationRemote,
    };

    return (
      <div className={Style['quotation-header-title-wrapper']}>
        <div className={Style['left-title']}>
          <Tooltip title={intl.get('ssrc.common.quotationLineInfomations').d('报价行信息')}>
            {intl.get('ssrc.common.quotationLineInfomations').d('报价行信息')}
          </Tooltip>
        </div>
        <div className={Style['table-summary-form-wrap']}>
          <TableSummaryForm {...TableSummaryFormProps} />
        </div>
      </div>
    );
  }, [
    quotationTotalAmount,
    quotationName,
    quotationScope,
    quotationLineNumber,
    summaryFormDS,
    basicFormDS,
    getCustomizeUnitCode,
    isBidSectionData,
    quotationRemote,
  ]);

  // title back path
  const getBackPath = useCallback(() => {
    const parentPath = backPath || `${activeTabKey}/list`;
    return parentPath;
  }, [pathname, search, activeTabKey]);

  // 获取标段数据
  const judgeSectionDataNoEmpty = useCallback(() => {
    // const { isSectionListEmpty } = sectionRef.current || {};
    // if (!isSectionListEmpty) {
    //   return false;
    // }

    // const notEmptyFlag = isSectionListEmpty();
    // return !notEmptyFlag;
    return !isEmpty(projectLineSectionList);
  }, [
    projectLineSectionList,
    pathname,
    search,
    basicFormDS,
    bidFlag,
    projectLineSectionList?.length,
  ]);

  // 标段是否可以切换
  const handleDisabledSwitch = useCallback((sectionItem) => {
    return ['QUOTATION_ABANDONED', 'ABANDONED'].includes(sectionItem?.supplierStatus);
  }, []);
  // 获取标段气泡
  const getSectionItemTooltip = useCallback(
    (sectionItem) => {
      if (handleDisabledSwitch(sectionItem)) {
        return intl.get('ssrc.supplierQuotation.view.message.giveUp').d('放弃');
      }
      return null;
    },
    [handleDisabledSwitch]
  );

  // 寻源项目表单-标段显示
  const projectInfoForm = useCallback(() => {
    const showProjectFormFlag = sectionFlag === '1' && projectLineSectionList?.length > 1;
    if (!showProjectFormFlag) {
      return '';
    }

    const projectInfoProps = {
      basicFormDS,
      organizationId,
      quotationHeaderId,
      getCustomizeUnitCode,
      categoryCode,
      quotationName,
      customizeCollapseForm,
    };

    const { sourceProjectNum, sourceProjectName, sourceProjectTotalAmount } =
      basicFormDS.current?.get([
        'sourceProjectNum',
        'sourceProjectName',
        'sourceProjectTotalAmount',
      ]) || {};

    return (
      <div className={classnames(Style['project-info-wrap'])}>
        <Content className={classnames(CommonStyle['custom-page-content'])}>
          <div
            className={classnames(
              Style['card-title-wrap'],
              Style['source-project-total-amount-wrap']
            )}
          >
            <h3
              id="rfxBasicInfo"
              className={classnames(Style['card-title'], Style['project-title-num'])}
            >
              {sourceProjectName && sourceProjectNum
                ? `${sourceProjectNum}—${sourceProjectName}`
                : sourceProjectNum || sourceProjectName || ''}
            </h3>
            <span>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`).d('寻源项目总金额')}
              <span className={Style.amount}>
                {numberSeparatorRender(sourceProjectTotalAmount)}
              </span>
            </span>
          </div>
          <ProjectInfo {...projectInfoProps} />
        </Content>
      </div>
    );
  }, [pathname, getCustomizeUnitCode, basicFormDS, bidFlag, projectLineSectionList?.length]);

  const renderPinFixedHeader = useCallback(() => {
    return (
      <div
        className={classnames(Style['ssrc-quotaiton-new-header-pin-fixed-wrap'], {
          [Style['ssrc-quotaiton-new-header-pin-fixed']]: pinFixed,
        })}
      >
        {renderBasicTitle()}
      </div>
    );
  }, [
    rfxNum,
    pathname,
    bidFlag,
    basicFormDS,
    countDownTimer,
    quotationScope,
    quotationLineNumber,
    secondarySourceCategory,
    currentQuotationRound,
    lastRoundQuotationRank,
    quotationTotalAmount,
    bargainTimes,
    bargainStatus,
    roundQuotationRankFlag,
    lastRoundQuotationAmount,
    pinFixed,
  ]);

  const isBidSectionData = judgeSectionDataNoEmpty();

  useEffect(() => {
    quotationLineDS.setState('batchUpdateLines', batchUpdateLines);
    quotationLineDS.setState('getBatchUpdateFlag', getBatchUpdateFlag);
  }, [quotationLineDS, quotationLineDS?.current, batchUpdateLines, getBatchUpdateFlag]);

  // 按钮组
  const renderHeaderButtons = useCallback(() => {
    const buttonsProps = {
      loading,
      toggleLoading,
      quotationName,
      basicFormDS,
      quotationLineDS,
      path,
      organizationId,
      getCustomizeUnitCode,
      customizeBtnGroup,
      submitQuotation,
      saveQuotation,
      batchImportOk,
      refreshPage: fetchHeader,
      quotationHeaderId,
      getCurrentPageSubmitData,
      isBidSectionData: projectLineSectionList?.length > 1,
      getSectionListData,
      submitQuotationSection,
      bidFlag,
      projectLineSectionList,
      judgeSectionDataNoEmpty,
      queryQuotationLines: fetchHeader,
      quotationRemote,
      handleWholeAbandon,
      handleWholeAbandonSection,
      directionListWithTab,
      allPageDisabled,
      doubleUnitFlag,
    };

    return <Buttons {...buttonsProps} />;
  }, [
    loading,
    quotationName,
    basicFormDS,
    quotationLineDS,
    path,
    organizationId,
    getCustomizeUnitCode,
    customizeBtnGroup,
    submitQuotation,
    saveQuotation,
    batchImportOk,
    queryQuotationLines,
    quotationHeaderId,
    getCurrentPageSubmitData,
    isBidSectionData,
    getSectionListData,
    submitQuotationSection,
    bidFlag,
    projectLineSectionList,
    judgeSectionDataNoEmpty,
    quotationRemote,
    handleWholeAbandon,
    handleWholeAbandonSection,
    directionListWithTab,
    allPageDisabled,
    fetchHeader,
    doubleUnitFlag,
  ]);

  /**
   * 【基本信息】 后边埋点
   */
  const cuxCardAfterBasic = useCallback(() => {
    let cuxCardDom = '';
    cuxCardDom = quotationRemote
      ? quotationRemote.process(
          'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_CUX_AFTER_BASIC_DOM',
          cuxCardDom,
          {
            pageProps: props,
            basicFormDS,
          }
        )
      : cuxCardDom;

    return cuxCardDom;
  }, [basicFormDS, path, quotationRemote, quotationHeaderId]);

  // common props
  const CommonProps = {
    basicFormDS,
    organizationId,
    quotationHeaderId,
    getCustomizeUnitCode,
    categoryCode,
    quotationName,
    initPage,
    isBidSectionData,
    quotationRemote,
    currencyPrecision,
    financialPrecision,
    caclRule,
    lovs,
    bidFlag,
    customizeCommon,
    customizeBtnGroup,
    allPageDisabled,
    setPageDisabledSymbolStatus,
    queryQuotationLines,
    handleSaveQuotation: saveQuotation,
  };

  // 表单props
  const FormProps = {
    ...CommonProps,
    customizeCollapseForm,
    custLoading,
    customizeForm,
    changeCurrency,
  };

  const SectionPanelProps = {
    locatedCurrentUrl,
    parentPage: {
      name: 'supplierQuotationNew',
      queryParams: {
        sectionBatchMaintainType: 'QUOTATION',
        quotationHeaderId,
        rfxHeaderId: quotationHeaderId, // 历史遗留赋值
      },
    },
    getWrapperClassName: ({ openedFlag = 0 }) => {
      if (openedFlag) {
        return Style['supplier-container-new-container'];
      }
    },
    basicFormDS,
    sectionPanelListWrapper: Style['ssrc-section-panel-list-quotation-new-wrap'],
    projectLineSectionId,
    paramKeys: ['sourceHeaderId'],
    // queryMain: () => {},
    beforeOpenSection: saveQuotation,
    isSection: sectionFlag,
    onRef: bindRef,
    handleDisabledSwitch,
    getSectionItemTooltip,
  };

  // 报价行props
  const quotationLineProps = {
    ...CommonProps,
    quotationLineDS,
    customizeTable,
    custLoading,
    customizeForm,
    doubleUnitFlag,
    batchUpdateLines,
    OnRef: lineRef,
    rollingFetchQuotationListInfo,
    handleFetchQuotationListNewMessage,
    calcQuotationTableSummaryQuotationLine,
    calcQuotationTableSummaryQuotationAmount,
    tablePaginationChange,
    afterQueryLineFetchRank,
    updateBatchMaintainCache,
  };

  return (
    <React.Fragment>
      <Header
        backPath={getBackPath()}
        title={intl
          .get(`ssrc.supplierQuotation.view.message.title.commonSupplierQuotation`, {
            quotationName,
          })
          .d('供应商{quotationName}')}
      >
        {renderHeaderButtons()}
      </Header>

      <div className={Style['supplier-quotation-main-content-wrapper']}>
        <Spin spinning={loading}>
          <div
            style={{ overflowY: !sectionFlag ? 'auto' : 'hidden' }}
            className={Style['supplier-quotation-page-content-warp']}
          >
            {renderPinFixedHeader()}
            {projectInfoForm()}

            <SectionPanel {...SectionPanelProps}>
              <div
                className={classnames(
                  Style['supplier-content'],
                  sectionFlag ? Style['supplier-content-section-warp'] : '',
                  pinFixed ? Style['supplier-content-pin-fixed'] : ''
                )}
              >
                <Card
                  id="rfxBasicInfo"
                  title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
                  bordered={false}
                >
                  <BasicForm {...FormProps} />
                </Card>

                {cuxCardAfterBasic()}

                <Card
                  id="rfxQuotationLineTable"
                  title={renderQuotationLineTitle()}
                  bordered={false}
                >
                  <QuotationLineTable {...quotationLineProps} onRef={lineRef} />
                </Card>
                <Card
                  id="rfxAttachment"
                  title={intl.get('ssrc.common.attachment').d('附件')}
                  bordered={false}
                >
                  {quotationRemote ? (
                    quotationRemote.render(
                      'SSRC_SUPPLIER_QUOTATION_NEW_RENDER_ATTACHMENT_CARD',
                      <Attachments {...FormProps} />,
                      {
                        bidFlag,
                        quotationHeaderId,
                      }
                    )
                  ) : (
                    <Attachments {...FormProps} />
                  )}
                </Card>
              </div>
            </SectionPanel>
          </div>
        </Spin>
      </div>
    </React.Fragment>
  );
};

const routerMatch = (Target) => {
  return (props = {}) => {
    const ref = useRef(null);
    const { location, ...otherProps } = props || {};
    if (!ref.current || !isEqual(ref.current, location)) {
      ref.current = location;
      otherProps.location = location;
    } else {
      otherProps.location = ref.current;
    }

    return <Target {...otherProps} />;
  };
};

const hocComponent = (NewComponent, options = {}) => {
  const { bidFlag = false } = options || {};
  const unitCodes = !bidFlag
    ? [
        'SSRC.SUPPLIER_QUOTATION_NEW.BUTTONS', // 按钮组
        'SSRC.SUPPLIER_QUOTATION_NEW.BASE', // 基本信息
        'SSRC.SUPPLIER_QUOTATION_NEW.LINE', // 报价行信息
        'SSRC.SUPPLIER_QUOTATION_NEW.LINE_BATCH', // 报价行表格-批量维护
        'SSRC.SUPPLIER_QUOTATION_NEW.LINE_LADDER', // 报价行表格-阶梯报价表格
        'SSRC.SUPPLIER_QUOTATION_NEW.LINE_HIS', // 报价行-历史信息
        'SSRC.SUPPLIER_QUOTATION_NEW.LINE_FILTER', // 报价行信息-筛选器
        'SSRC.SUPPLIER_QUOTATION_NEW.ATTACHMENT', // 附件
        'SSRC.SUPPLIER_QUOTATION_NEW.PROJECT_INFO', // 寻源项目
        'SSRC.SUPPLIER_QUOTATION_NEW.QUOTATION_LINE_SUMMARY_NEW_FORM',
        'SSRC.SUPPLIER_QUOTATION_NEW.LINE_TABLE_BUTTON', // 报价行-按钮组
      ]
    : [
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.BUTTONS', // 按钮组
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.BASE', // 基本信息
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE', // 报价行信息
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_BATCH', // 报价行表格-批量维护
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_LADDER', // 报价行表格-阶梯报价表格
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_HIS', // 报价行-历史信息
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_FILTER', // 报价行信息-筛选器
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.ATTACHMENT', // 附件
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.PROJECT_INFO', // 寻源项目
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.QUOTATION_LINE_SUMMARY_NEW_FORM',
        'SSRC.SUPPLIER_QUOTATION_NEW_BID.LINE_TABLE_BUTTON', // 报价行-按钮组
      ];

  return compose(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.supplierquotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
        'ssrc.rf',
        'scux.ssrc',
        'sscux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: unitCodes,
    }),
    remote(
      {
        code: 'SSRC_SUPPLIER_QUOTATION_NEW',
        name: 'quotationRemote',
      },
      {
        events: {
          handleMessageListOperate() {},
          changeCurrencySetRate() {},
          updatePageValueAfterRefreshRollingQuery() {},
          beforePrint() {},
          beforePrintSuccess() {},
          remoteAfterOnSubmit() {},
        },
      }
    )
  )(routerMatch(observer(NewComponent)));
};

export default hocComponent(QuotationComponent);
export { hocComponent, QuotationComponent };
