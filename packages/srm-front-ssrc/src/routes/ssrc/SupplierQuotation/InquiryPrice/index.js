/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */

/**
 * index.js - 供应商报价
 * @date: 2018-01-07
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import uuidv4 from 'uuid/v4';
import {
  Form,
  Button,
  Row,
  Col,
  Modal,
  Table,
  Tag,
  Pagination,
  Collapse,
  InputNumber,
  Spin,
  Icon,
  Popover,
  // Menu,
  Select,
  Alert,
  // Tooltip,
} from 'hzero-ui';
import { Modal as c7nModal, ModalProvider, Icon as C7NIcon, DataSet } from 'choerodon-ui/pro';
// import { math } from 'choerodon-ui/dataset';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import moment from 'moment';
import queryString from 'querystring';
import {
  isEmpty,
  isNumber,
  map,
  filter,
  // isUndefined,
  isArray,
  noop,
  throttle,
  isString,
  isNil,
} from 'lodash';
import classNames from 'classnames';
import { dateTimeRender } from 'utils/renderer';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
// import { openTab } from 'utils/menuTab';
import {
  BID,
  getDocumentTypeName,
  getQuotationName,
  getSourceCategoryName,
} from '@/utils/globalVariable';
import {
  // FORM_COL_3_LAYOUT,
  DATETIME_MIN,
  DEFAULT_DATETIME_FORMAT,
  DATETIME_MAX,
} from 'utils/constants';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import {
  // getDateFormat,
  getEditTableData,
  tableScrollWidth,
  filterNullValueObject,
  getCurrentUserId,
  getResponse,
  // getCurrentTenant,
} from 'utils/utils';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { Button as PermissionButton } from 'components/Permission';
import CommonImportNew from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from '@/routes/himp/CommonImportNew';

import { PageSourceSymbol } from '@/utils/constants.js';
import { validatorConfirmModal, validateModal } from '@/routes/components/ConfirmModal';
// import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
// import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';
import { dateFormate, amountCalcType, fetchCurrentPrecision } from '@/utils/utils';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';
import useBidAnnouncementQueryModal from '@/routes/ssrc/components/BidAnnouncementQuery';

import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import ExcelExports from '@/routes/components/ExcelExport';
import SectionPanel from '@/routes/components/SectionPanel';
import BatchEmptySelectedModal from '@/routes/components/SectionPanel/BatchEmptySelectedModal';
import OperateSectionPromptModal from '@/routes/components/SectionPanel/OperateSectionPromptModal';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';

import {
  quotationSectionBatchSubmit,
  quotationWholeAbandon,
  fetchSupplierQuotationTimer,
} from '@/services/supplierQutationService';
import { fetchRfxDetailLayout } from '@/services/inquiryHallService';
import { numberSeparatorRender } from '@/utils/renderer';
import common from '@/routes/ssrc/common.less';
// import FormInputWrapper from '../components/WrapperTooltip';

import WholeAbandonForm from './WholeAbandonForm/';
import { wholeAbadonDataSet } from './WholeAbandonForm/stores.js';
import { withStandardCompEnhancer } from './standardCompEnhancerCreator';
import ItemLine from './ItemLine';
import BidLadderLevelModal from './BidLadderLevelModal';
import LadderLevelModal from './LadderLevelModal';
import QuoteAttachment from './QuoteAttachment';
import InquiryHeader from './Header';
import CountDown from '../../components/CountDown';
import ItemForm from './ItemForm';
import QuotationFrom from './QuotationForm';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import style from './Header.less';

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Panel } = Collapse;

const RFQTIMERINTERVAL = 180_000;

// // 快速报价
// const RapidQuotation = (props = {}) => {
//   const { children, quotationName, ...dropDownProps } = props;

//   return (
//     <Dropdown {...dropDownProps}>
//       <div className={style.bargain}>
//         {typeof children === 'string'
//           ? children
//           : intl
//               .get('ssrc.supplierQuotation.view.message.button.quickQuotation')
//               .d('快速报价')}{' '}
//         <Icon type="down" />
//       </div>
//     </Dropdown>
//   );
// };

const { openBidAnnouncementQueryModal } = useBidAnnouncementQueryModal();
class InquiryPrice extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};
    this.SectionRef = {};
    this.BatchEmptySectionRef = {};
    this.qutotionDiffTimerId = null;
    this.rfqFetchTimer = null;
    this.wholeAbadonDS = null; // 整单放弃
    this.quotationFormRef = null; // quotation form ref

    const { rfxId } = props.match.params;
    const { roundFlag } = queryString.parse(this.props.location.search.substr(1));
    this.activeTabKey = getActiveTabKey();
    this.bidFlag = props.sourceKey === BID;
    this.documentTypeName = getDocumentTypeName(this.bidFlag);
    this.quotationName = getQuotationName(this.bidFlag);
    this.sourceCategoryName = getSourceCategoryName(this.bidFlag);
    this.custkey = this.bidFlag ? 'BID_' : '';
    this.detailSubmitType = 1; // 表单视图提交区分
    this.ladderModalCount = 0; // 阶梯报价弹框数量
    // const { organizationId } = props; // 获取organizationId
    this.state = {
      rfxId, // 报价单头 id
      roundFlag, // 当前报价单类别
      detailRecord: {}, // 进入报价详情行信息
      currentRecord: {}, // 当前激活数据
      attachmentVisible: false, // 头附件 Modal 显示状态
      bucketDirectory: 'ssrc-rfx-quotationheader',
      rfxLineItemId: null, // 物料行id
      quotationLineId: null, // 头的行id
      supplierDataChange: false, // 物品行数据是否有修改
      quotationVisible: false, // 快速报价
      caclRule: null, // 业务规则定义-金额计算方式
      // 只读报价物料行列表
      historyColumns: [
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationCount`).d('报价次数'),
          dataIndex: 'quotationCount',
          width: 100,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
          dataIndex: 'quotedDate',
          width: 150,
          render: dateTimeRender,
        },
        {
          title: intl
            .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
              quotationName: this.quotationName,
            })
            .d('{quotationName}人'),
          dataIndex: 'quotedByName',
          width: 100,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.onePrice`).d('单价'),
          dataIndex: 'quotationPrice',
          width: 80,
          align: 'right',
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.counterBidTime`).d('还价时间'),
          dataIndex: 'bargainDate',
          width: 80,
          render: dateTimeRender,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainByName`).d('还价人'),
          dataIndex: 'bargainByName',
          width: 80,
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainPrice`).d('还价单价'),
          dataIndex: 'bargainPrice',
          width: 80,
          align: 'right',
        },
        {
          title: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
          dataIndex: 'bargainRemark',
          width: 80,
          align: 'right',
        },
      ], // 还比价历史列表字段
      inquiryTableReadOnly: true, // 默认只读列表为true
      inquiryDetail: false, // 默认关闭详情页信息
      ladderVisible: false, // 是否显示阶梯报价
      collapseKeys: [], // 打开的折叠面板key
      ladderListHeaderInfo: {}, // 阶梯报价头信息
      ladderLevelSelectedRowKeys: [], // 阶梯报价选中id
      ladderLevelSelectedRows: [], // 阶梯报价选中行
      supplierSelectedRowKeys: [], // 供应商选中id
      SetOfTips: {
        // 提示信息集合对象，每次新增必输字段需要在这里维护
        currentQuotationPrice: intl
          .get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`)
          .d('单价(含税)'),
        taxId: intl.get(`ssrc.supplierQuotation.model.supplierBid.modifyTheRate`).d('税率(%)'),
        currentExpiryDateFrom: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateFrom`)
          .d('报价有效期从'),
        currentExpiryDateTo: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        currentQuotationQuantity: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationQuantity`)
          .d('可供数量'),
        currentDeliveryCycle: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        netPrice: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        currentPromisedDate: intl
          .get(`ssrc.supplierQuotation.model.supQuo.promisedDeliveryDate`)
          .d('承诺交货期'),
        minPurchaseQuantity: intl
          .get(`ssrc.supplierQuotation.model.supQuo.minimumPurchaseAmount`)
          .d('最小采购量'),
        minPackageQuantity: intl
          .get(`ssrc.supplierQuotation.model.supQuo.minimumPackageAmount`)
          .d('最小包装量'),
      },
      batchMaintainItemLineVisible: false, // 批量维护表单
      isBatchMaintainSection: false, // 是否选批量操作标段
      batchEmptySelectSectionFlag: false, // 批量操作分标段是否需要弹窗
      noWarningBatchSectionFlag: true, // 参与时候批量不再提示未勾选数据
      userConfig: {}, // 用户配置
      operateSectionPromptFlag: false, // 批量操作分标段提示-modal
      operateSectionData: null, // // 批量操作分标段提示数据
      operationLoading: false, // 页面操作loading
      weakCtrlConfirmFlag: null, // 分标段时，用户在弹框选择了我知道了之后把后端返回的1存起来，再次提交，参数带入
      currencyPrecision: null, // 手动查询的币种精度，单价不补零
      financialPrecision: null, // 手动查询的财务精度
      batchEditLineLockLoading: false, // 批量编辑行loading
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const { rfxId: prevId = null } = prevParams;
    const { rfxId = null } = params;
    const RefreshFlag = rfxId && prevId && prevId !== rfxId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchPages();
    }
  }

  /**
   * componentDidMount - 初始化数据查询报价头,报价列表
   */
  componentDidMount() {
    this.fetchPages();

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      this.fetchUserConfig();
    }

    document.addEventListener('visibilitychange', this.chromeTabVisibilityChange);
    this.addQuotationLinesRefreshToWindow(); // 挂载全局方法，方便二开调用
  }

  // chrome change tab event handle
  chromeTabVisibilityChange = () => {
    const HiddenChromeTabFlag = document?.hidden;

    if (!HiddenChromeTabFlag) {
      this.refreshRFQTimer();
      this.rollingFetchRFQTimer();
    } else {
      this.clearRFQTimer();
    }
  };

  /**
   * 开启定时器-如果定时器计时大于报价截止时间与报价开始时间的差值，则直接返回到列表页
   */
  startQuotationTimer = () => {
    // this.clearQuotationTimer();
    // const { modelName = 'supplierQuotation' } = this.props;
    // const {
    //   [modelName]: { quotationHeader = {} },
    // } = this.props;
    // const { currentDateTime, quotationEndDate } = quotationHeader;
    // const diffTime = !quotationEndDate
    //   ? 86400
    //   : (new Date(quotationEndDate) - new Date(currentDateTime)) / 1000;
    // let intervalTime = 0;
    // this.qutotionDiffTimerId = setInterval(() => {
    //   intervalTime++;
    //   const DirectListTimerFlag = intervalTime > diffTime && diffTime > 0; // 议价的截止时间会小于0
    //   if (DirectListTimerFlag) {
    //     this.directionSupplierQuotationList();
    //   }
    // }, 1000);
  };

  /**
   * 清除定时器
   */
  clearQuotationTimer = () => {
    if (this.qutotionDiffTimerId) {
      clearInterval(this.qutotionDiffTimerId);
    }
  };

  fetchPages() {
    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段
    if (BidSectionFlag) {
      return;
    }

    this.queryQuotationHeader();
    this.queryQuotationLines();
    this.fetchRoundQuotationInfo();
    this.rollingFetchRFQTimer();
  }

  querySupplier = (params = {}) => {
    const { inquiryDetail = false } = this.state;
    if (inquiryDetail) {
      this.queryDetailView();
    }

    this.queryQuotationHeader(params);
    this.queryQuotationLines({}, params);
    this.fetchRoundQuotationInfo(params);
  };

  initCalcType = async (data) => {
    const result = (await amountCalcType(data)) || [];
    this.setState({ caclRule: result?.[0] });
  };

  // 查询用户配置
  async fetchUserConfig() {
    const { organizationId } = this.props;
    let data = {};

    try {
      data = await fetchRfxDetailLayout({
        organizationId,
        userId: getCurrentUserId(),
        configKey: 'sectionSupplierQuotation',
        enabledFlag: 1,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      let config = {};
      let visibleFlag = false;
      if (isEmpty(data)) {
        config = {
          configKey: 'sectionSupplierQuotation',
          configDesc: 'sectionSupplierParticipateBatchMaintain',
          userId: getCurrentUserId(),
          enabledFlag: 1,
        };
        visibleFlag = true;
      } else {
        const { configValue = null } = data || {};
        config = data;
        visibleFlag = !configValue || configValue === 'display';
      }

      this.setState({
        userConfig: config,
        noWarningBatchSectionFlag: visibleFlag,
      });
    } catch (e) {
      throw e;
    }

    return data;
  }

  /**
   * 查询报价明细头信息 ([艾为]二开)禁止修改、删除此方法名
   * @protected
   * */
  @Bind()
  queryQuotationHeader(params = {}) {
    const {
      dispatch,
      match: {
        params: { rfxId: quotationHeaderId },
      },
      organizationId,
      form,
    } = this.props;
    const { modelName = 'supplierQuotation' } = this.props;

    dispatch({
      type: `${modelName}/queryQuotationHeader`,
      payload: {
        quotationHeaderId,
        ...params,
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
      },
    }).then((res) => {
      if (res && !res.failed) {
        form.resetFields(); // 重新查询前，执行重置操作
        const { tenantId, currencyCode } = res || {};
        // 手动查询币种精度
        this.fetchCurrencyPrecision(currencyCode, tenantId);
        this.initCalcType({ purTenantId: tenantId, organizationId, supplierFlag: 1 });
        // this.startQuotationTimer();
      }
    });
  }

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

  // 清除报价行数据源
  clearQuotationLineTableStore = () => {
    const { dispatch } = this.props;
    const { modelName = 'supplierQuotation' } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationLines: {},
        quotationLinePagination: {},
      },
    });
  };

  // 清除报价头数据源
  clearQuotationHeaderStore = () => {
    const { dispatch, form } = this.props;
    const { modelName = 'supplierQuotation' } = this.props;
    form.resetFields();
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationHeader: {},
      },
    });
  };

  // 全局页面刷新，个性化弹窗二开使用
  addQuotationLinesRefreshToWindow = () => {
    const SsrcQuotationLinesRefresh = () => {
      this.queryQuotationLines();
    };
    window.SsrcQuotationLinesRefresh = SsrcQuotationLinesRefresh;
  };

  /**
   * 查询报价明细行
   * */
  @Bind()
  queryQuotationLines(page = {}, queryParams = {}, callback = () => {}) {
    const {
      dispatch,
      match: {
        params: { rfxId: quotationHeaderId },
      },
      remote,
    } = this.props;
    const { modelName = 'supplierQuotation' } = this.props;
    this.clearQuotationLineTableStore();

    let lineParams = {
      page: !isEmpty(page) ? page : this.tableCurrentPagination || {},
      quotationHeaderId,
      customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM`,
      ...queryParams,
    };

    lineParams = remote
      ? remote.process(
          'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_QUERY_QUOTATION_LINES_PARAMS',
          lineParams,
          {
            that: this,
          }
        )
      : lineParams;

    dispatch({
      type: `${modelName}/queryQuotationLines`,
      payload: lineParams || {},
    }).then((res) => {
      this.tableCurrentPagination = {};

      if (!res) {
        return;
      }

      const { content = [] } = res;
      callback(content);
      this.bargainPriceChecked(content);
    });
  }

  // 议价处理勾选数据
  bargainPriceChecked = (lines = []) => {
    const bargainFlag = this.isBargainFlag(lines);
    const sectionFlag = this.getBidSectionFlag();

    if (bargainFlag || sectionFlag) {
      this.setSelectedForSections(lines);
    }
  };

  // 分标段-设置勾选
  setSelectedForSections(lines = []) {
    const sectionFlag = this.isBidSectionData();
    if (isEmpty(lines) || !sectionFlag) {
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
      supplierSelectedRowKeys: selectedLines,
    });
  }

  /**
   * 查询多轮报价信息
   */
  @Bind()
  fetchRoundQuotationInfo(params = {}) {
    const { dispatch } = this.props;
    const { rfxId: quotationHeaderId } = this.state;
    const { modelName = 'supplierQuotation' } = this.props;

    dispatch({
      type: `${modelName}/roundQuotationInfo`,
      payload: {
        quotationHeaderId,
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.ROUND_QUOTATION_TABLE`,
        ...params,
      },
    });
  }

  // 触发页面操作loading
  toggleOperationLoading = (loading = false) => {
    this.setState({ operationLoading: loading });
  };

  /**
   * 查询单个物品报价历史
   */
  @Bind()
  fetchHistoryline(quotationLineId = '') {
    // 查询多轮报价历史接口
    this.fetchRoundQuotationList(quotationLineId);
    this.queryQuotationLineDetail({ quotationLineId });
  }

  /**
   * 查询还比价历史接口
   * */
  queryQuotationLineDetail(params = {}) {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;

    dispatch({
      type: `${modelName}/queryQuotationLineDetail`,
      payload: {
        ...params,
      },
    });
  }

  // 报价行物料查询
  fetchQuotationItem(params = {}) {
    if (isEmpty(params)) {
      return;
    }

    const { dispatch, modelName = 'supplierQuotation', organizationId } = this.props;

    dispatch({
      type: `${modelName}/fetchQuotationItem`,
      payload: {
        organizationId,
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM`,
        ...(params || {}),
      },
    });
  }

  /**
   * 查找多轮报价
   *
   * @param {*} [data={}]
   * @memberof InquiryPrice
   */
  fetchRoundQuotationList = (quotationLineId = '') => {
    const {
      dispatch,
      match: {
        params: { rfxId },
      },
    } = this.props;
    const { modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/queryRoundQuotationLineDetail`,
      payload: {
        quotationLineId,
        quotationHeaderId: rfxId,
      },
    });
  };

  // 组件卸载清空数据
  componentWillUnmount() {
    clearInterval(this.timer);
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationHeader: {},
        quotationLines: {},
        quotationLinePagination: {},
        quotationLineDetail: {},
        quotationLineDetailPagination: {},
        roundQuotationInfo: [],
      },
    });
    window.SsrcQuotationLinesRefresh = null;
    this.clearQuotationTimer();
    this.clearRFQTimer();
    document.removeEventListener('visibilitychange', this.chromeTabVisibilityChange);
  }

  clearRFQTimer = () => {
    if (this.rfqFetchTimer) {
      clearTimeout(this.rfqFetchTimer);
    }
  };

  refreshRFQTimer = async () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: {
        quotationHeader = {}, // 供应商报价行信息
      },
      dispatch,
      organizationId,
    } = this.props;
    const {
      rfxHeaderId,
      secondarySourceCategory,
      currentQuotationRound,
      currentDateTime: preCurrentDateTime,
      quotationEndDate: preQuotationEndDate,
    } = quotationHeader || {};

    // 时间延长
    const quotationEndDateNew = preQuotationEndDate
      ? moment(preQuotationEndDate || null)
          ?.add(1, 'h')
          ?.format(DEFAULT_DATETIME_FORMAT)
      : null;

    const disabledFetchNewMessageFlag =
      !rfxHeaderId ||
      !['RFQ', 'NEW_BID'].includes(secondarySourceCategory) ||
      !preCurrentDateTime ||
      !preQuotationEndDate ||
      (preCurrentDateTime && preQuotationEndDate && preCurrentDateTime >= quotationEndDateNew);
    if (disabledFetchNewMessageFlag) {
      this.clearRFQTimer();
      return;
    }

    const result = await fetchSupplierQuotationTimer({
      rfxHeaderId,
      organizationId,
      currentQuotationRound,
    });

    if (result && result.failed) {
      return;
    }

    const { quotationEndDate, currentDateTime } = result || {};
    if (!quotationEndDate || !currentDateTime) {
      return;
    }

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationHeader: {
          ...quotationHeader,
          currentDateTime,
          quotationEndDate,
        },
      },
    });
  };

  /**
   * 询价单倒计时 轮询
   */
  rollingFetchRFQTimer = () => {
    this.rfqFetchTimer = setInterval(() => this.refreshRFQTimer(), RFQTIMERINTERVAL);
  };

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

  // 缓存报价行表格分页信息
  tableCurrentPagination = {};

  /**
   * 表格行信息切换分页
   * @param {Object} page - 分页参数
   */
  @Bind()
  handleTableChange(page = {}) {
    const { supplierDataChange } = this.state;

    if (supplierDataChange) {
      this.tableCurrentPagination = page || {};
      this.saveAllBiddingOffer(page);
    } else {
      this.queryQuotationLines(page);
    }
  }

  /**
   * 保存Uuid
   */
  @Bind()
  afterOpenUploadModal(currentAttachmentUuid) {
    this.setState({
      currentAttachmentUuid,
    });
  }

  /**
   * 保存当前报价单行的 UUID
   * @param {String} currentAttachmentUuid - 当前报价单行的附件 UUID
   */
  @Bind()
  uploadSuccess(quotationLineId) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: {
        quotationLines = {}, // 供应商报价行信息
      },
      dispatch,
    } = this.props;
    const { currentAttachmentUuid } = this.state;
    const dataSource = quotationLines.content || [];

    if (isEmpty(dataSource)) {
      return;
    }

    let infoIndex = null;
    dataSource.forEach((item, index) => {
      if (item.quotationLineId === quotationLineId) {
        infoIndex = index;
      }
    });
    if (infoIndex === null) {
      return;
    }

    const newQuotationLines = {
      ...quotationLines,
      content: [
        ...dataSource.slice(0, infoIndex),
        {
          ...dataSource[infoIndex],
          currentAttachmentUuid,
        },
        ...dataSource.slice(infoIndex + 1),
      ],
    };
    // 更新当前的附件行信息
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationLines: newQuotationLines,
      },
    });
    this.setState({
      supplierDataChange: true,
    });
  }

  /**
   * 物料报价行分页 - changeBiddingLinePagination
   */
  @Bind()
  async changeBiddingLinePagination(current = undefined, pageSize = undefined) {
    // 调用自动保存接口
    await this.saveItemInfo();

    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;

    // 切换分页，查询报价行之后的回调操作
    const handleAfterChangePage = (content) => {
      if (!isEmpty(content) && content.length >= 1) {
        const item = content[0] || {};
        const { rfxLineItemNum, quotationLineId, quotationHeaderId } = item;
        this.setState({
          currentRecord: content[0],
          expand: {
            [rfxLineItemNum]: [rfxLineItemNum],
          },
        });
        this.queryBiddingQuotationLine(
          {},
          {
            quotationLineIds: quotationLineId,
          }
        );
        this.queryQuotationLineDetail({
          quotationLineId,
        });
        this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
        this.fetchRoundQuotationList(quotationLineId);
      }
    };
    // 分页接口获取数据
    this.queryQuotationLines(changedPagination, {}, handleAfterChangePage);
  }

  /**
   * 新建阶梯报价
   */
  @Bind()
  createLadderQuot(quotationLineId = undefined) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { quotationHeader, fetchLadderList = [] },
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
      type: `${modelName}/updateState`,
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
  @Throttle(1800)
  @Bind()
  async validateLadderQuotation(quotationLineId) {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    const {
      ladderListHeaderInfo: { diyLadderQuotationFlag },
    } = this.state;
    const params = this.getLadderParams();
    if (isEmpty(params)) {
      return;
    }

    const doValidate = () => {
      return dispatch({
        type: `${modelName}/validateLadderQuotation`,
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
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { fetchLadderList = [] },
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
  haeSaveData() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { biddingQuotationLine = {} },
    } = this.props;
    const { dispatch } = this.props;
    const { ladderListHeaderInfo } = this.state;
    // const params = getEditTableData(fetchLadderList);
    const params = this.getLadderParams();
    if (!isEmpty(params)) {
      dispatch({
        type: `${modelName}/saveLadderList`,
        payload: {
          params,
          quotationLineId:
            ladderListHeaderInfo.quotationLineId || biddingQuotationLine.quotationLineId,
          customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LADDER_INQUIRY_TABLE`,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              fetchLadderList: [],
            },
          });
          dispatch({
            type: `${modelName}/fetchLadderList`,
            payload: {
              quotationLineId:
                ladderListHeaderInfo.quotationLineId || biddingQuotationLine.quotationLineId,
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
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    const { ladderLevelSelectedRowKeys = [] } = this.state;
    // const newParams = getEditTableData(fetchLadderList, ['ladderQuotationId']);
    const params = this.getLadderParams();
    if (!isEmpty(params)) {
      dispatch({
        type: `${modelName}/saveLadderList`,
        payload: {
          params,
          quotationLineId,
          customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LADDER_INQUIRY_TABLE`,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              fetchLadderList: [],
            },
          });
          dispatch({
            type: `${modelName}/fetchLadderList`,
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
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      [modelName]: { fetchLadderList = [] },
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
              type: `${modelName}/updateState`,
              payload: {
                fetchLadderList: newLadderLevel,
              },
            });
            this.setState({ ladderLevelSelectedRowKeys: [], ladderLevelSelectedRows: [] });
          } else {
            dispatch({
              type: `${modelName}/deleteLadderQuot`,
              payload: { remoteDelete, quotationLineId },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: `${modelName}/fetchLadderList`,
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

  // 校验/获取表格视图数据
  validateAndGetBiddingOfferData = () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: { biddingQuotationLine = {}, quotationHeader },
    } = this.props;

    let error = false;
    let rfxQuotationHeader = {};
    let rfxQuotationLine = [];
    const customizeUnitCode = `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`;

    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        error = true;
      }

      rfxQuotationHeader = { ...quotationHeader, ...(values || {}) };
    });

    const quotationForm = this.getQuotationFormRefForm();
    if (!quotationForm?.validateFieldsAndScroll) {
      error = true;
      return { error };
    }
    quotationForm.validateFieldsAndScroll((err, values = {}) => {
      if (err) {
        error = true;
      }

      const {
        currentExpiryDateFrom,
        currentExpiryDateTo,
        currentPromisedDate,
        quotationEndDate = null,
        quotationStartDate = null,
      } = values || {};
      rfxQuotationLine = [
        {
          ...biddingQuotationLine,
          ...(values || {}),
          currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MAX),
          currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
          quotationEndDate: quotationEndDate || biddingQuotationLine.quotationEndDate, // 此处是表单页面通过个性化隐藏了报价日期，切换试图提交，日期没值
          quotationStartDate: quotationStartDate || biddingQuotationLine.quotationStartDate,
        },
      ];
    });

    return { error, rfxQuotationHeader, rfxQuotationLine, customizeUnitCode };
  };

  /**
   * 保存报价单详情页面行列表：无批量保存
   */
  @Bind()
  async saveBiddingOffer() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      form = {},
      [modelName]: { biddingQuotationLine = {} },
    } = this.props;
    const { quotationLineId, quotationHeaderId } = biddingQuotationLine || {};

    const AllData = this.validateAndGetBiddingOfferData();
    this.toggleOperationLoading(true);
    await dispatch({
      type: `${modelName}/saveQuotationLines`,
      payload: AllData,
    })
      .then((res) => {
        if (res) {
          form.resetFields();
          notification.success();
          // 分页保存/保存按钮保存,查询行数据和头数据
          const sectionFlag = this.isBidSectionData();
          if (sectionFlag) {
            this.refreshSectionAndCurrentPage();
            return;
          }

          // 查询报价单头
          this.queryQuotationHeader();
          this.queryQuotationLines();
          // 根据 quotationLineId 进行接口查询 竞价行
          this.queryBiddingQuotationLine(
            {},
            {
              quotationLineIds: quotationLineId,
            }
          );
          this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
        }
      })
      .finally(() => {
        this.toggleOperationLoading();
        this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
      });
  }

  /**
   * 获取导出参数，默认导出全部
   * 若abandonedFlag为1，则过滤出
   * quotationLineIds为[]，即后台导出所有，有值时，导出未放弃物品
   * @protected 此方法被 [三生制药] 二开导出调用, 禁止修改方法名, 谨慎修改逻辑
   */
  @Bind()
  handleGetFormValue() {
    const { supplierSelectedRowKeys } = this.state;
    // const { modelName = 'supplierQuotation' } = this.props;
    const {
      match: {
        params: { rfxId },
      },
      // [modelName]: { quotationLines = {} },
    } = this.props;
    const sectionFlag = this.isBidSectionData();
    let quotationLineIds = null;
    if (!isEmpty(supplierSelectedRowKeys)) {
      quotationLineIds = supplierSelectedRowKeys;
    }
    // if (!isEmpty(quotationLines.content)) {
    //   quotationLineIds = quotationLines.content.some(
    //     (item) => item.$form && item.$form.getFieldValue('abandonedFlag')
    //   )
    //     ? quotationLines.content
    //         .filter((item) => item.$form && !item.$form.getFieldValue('abandonedFlag'))
    //         .map((ele) => ele.quotationLineId)
    //     : null;
    // }

    const exportValues =
      quotationLineIds && !sectionFlag
        ? {
            quotationHeaderId: rfxId,
            quotationLineIds,
            fromExport: true,
          }
        : {
            quotationHeaderId: rfxId, // HACK must delete property when empty
            fromExport: true,
          };

    return exportValues;
  }

  /**
   * 获取表格异常数据
   * @param {*} 数据源
   */
  @Bind()
  generalData(businessSource = []) {
    let errorList = [];
    businessSource.forEach((data) => {
      data.$form.validateFieldsAndScroll((error) => {
        if (!isEmpty(error)) {
          errorList.push(...Object.keys(error));
        }
      });
    });
    // 过滤重复数据
    errorList = errorList.filter((item, index, self) => self.indexOf(item) === index);
    return errorList;
  }

  // 提交前校验
  async quotationSectionBatchValidation(data = {}) {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    let result = null;

    let validationResult = await dispatch({
      type: `${modelName}/validateQuotationSubmit`,
      payload: data,
    });
    validationResult = getResponse(validationResult);
    if (!validationResult) {
      return result;
    }
    result = isArray(validationResult) && !isEmpty(validationResult) ? validationResult[0] : null;
    return result;
  }

  // 分标段-批量-提交-整合数据
  handleIntegrationSectionBatchSubmit = async (otherProps = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { getCheckedSectionList = () => {} } = this.SectionRef;
    const { projectLineSectionId = null } = quotationHeader;

    const projectLineSectionList = getCheckedSectionList();
    if (isEmpty(projectLineSectionList)) {
      return;
    }

    form.validateFields((err) => {
      if (err) {
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.model.supQuo.needFillIn')
            .d('字段未填写，请填写后提交'),
        });
        return;
      }

      let currentData = null;
      projectLineSectionList.forEach((item = {}) => {
        const { projectLineSectionId: sectionProjectLineSectionId = null } = item || {};
        if (sectionProjectLineSectionId && sectionProjectLineSectionId === projectLineSectionId) {
          currentData = this.integrationPageDataForMain();
        }
      });

      if (!currentData) {
        notification.warning({
          message: intl
            .get('ssrc.common.view.message.pleaseSelectCurrentSectionLineToSubmit')
            .d('当前标段未勾选，请勾选当前标段或切换到其他已勾选标段后提交'),
        });
        return;
      }

      const data = {
        ...currentData,
        projectLineSectionList,
        ...otherProps,
      };
      this.handleQuotationSectionBatchSubmit(data);
    });

    // const ValidateResult = await this.quotationSectionBatchValidation(data);
    // if (ValidateResult) {
    //   confirmModal(
    //     ValidateResult,
    //     () => this.handleQuotationSectionBatchSubmit(data),
    //     () => this.afterSubmitResetStatus()
    //   );
    // } else {
    // }
  };

  /**
   * 表格页提交
   * 不存在已还价行 - 整单提交
   * 存在已还价行 - 批量提交
   * barginFlag 1 整单提交 0批量提交
   * @protected 此方法被【五粮浓香】二开，请勿修改此方法名！！！
   * @protected 此方法调用的方法名也请请勿删除、修改！！！
   */
  @Bind()
  @Throttle(2000)
  submitAllBiddingOffer() {
    const { isBatchMaintainSection = false, noWarningBatchSectionFlag = false } = this.state;
    const { isCheckedSectionListEmpty } = this.SectionRef;
    const BidSectionDataFlag = this.isBidSectionData(); // 分标段

    if (BidSectionDataFlag) {
      const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
      const needWarningUserConfig =
        (!isBatchMaintainSection || (isBatchMaintainSection && checkedFlag)) &&
        noWarningBatchSectionFlag;
      if (needWarningUserConfig) {
        this.setState({
          batchEmptySelectSectionFlag: true,
        });
        return;
      }
      // 分标段, 批量勾选
      if (isBatchMaintainSection && !checkedFlag) {
        this.handleIntegrationSectionBatchSubmit();
      } else {
        this.handleSubmit();
      }
    } else {
      this.handleSubmit(); // normal supplier quotation submit
    }
  }

  /**
   * 跳转到报价列表
   * 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   * @protected
   */
  directionSupplierQuotationList = () => {
    const { history } = this.props;
    history.push({
      pathname: this.isPubNowPage()
        ? '/pub/ssrc/supplier-quotation/list'
        : `${this.activeTabKey}/list`,
    });
  };

  getBackPath = () => {
    return this.isPubNowPage() ? '/pub/ssrc/supplier-quotation/list' : `${this.activeTabKey}/list`;
  };

  // 提交-分标段-批量勾选
  handleQuotationSectionBatchSubmit = (data = {}, otherData = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const { organizationId, remote } = this.props;
    const SubmitData = {
      organizationId,
      ...data,
      ...otherData,
      customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
    };
    this.toggleOperationLoading(true);
    const handleQuotationSectionBatchSubmitFunc = () => {
      quotationSectionBatchSubmit(SubmitData).then((res) => {
        const result = getResponse(res);
        this.afterSubmitResetStatus();
        if (!result) {
          return;
        }

        if (!isEmpty(result)) {
          this.setState({
            operateSectionData: result,
            operateSectionPromptFlag: true,
            weakCtrlConfirmFlag: Array.isArray(result) && result[0].weakCtrlConfirmFlag,
          });
          return;
        }

        this.directionSupplierQuotationList();
      });
    };
    if (remote?.event) {
      // 给state中设置二开的值
      remote.event.fireEvent('remoteSectionBatchBeforeSubmit', {
        handleQuotationSectionBatchSubmitFunc,
        toggleOperationLoading: this.toggleOperationLoading,
      });
    } else {
      handleQuotationSectionBatchSubmitFunc();
    }
  };

  // 提交成功-重置一些状态
  afterSubmitResetStatus() {
    this.toggleOperationLoading();
    this.detailSubmitType = 1;
    this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
  }

  // 整合页面需要提交的数据
  integrationPageDataForMain = () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: { quotationHeader = {}, quotationLines = {} },
    } = this.props;
    const { supplierSelectedRowKeys, SetOfTips } = this.state;
    let validateFlag = true;
    let headerData = {};
    let lineData = [];

    const { quotationHeaderId = null } = quotationHeader;
    const { content: lineDataList = [] } = quotationLines;
    const bargingFlag =
      !isEmpty(lineDataList) &&
      lineDataList.some((item) => item.quotationLineStatus === 'BARGAINED')
        ? 0
        : 1;
    // if (!bargingFlag && isEmpty(supplierSelectedRowKeys)) {
    //   notification.warning({
    //     message: intl
    //       .get('ssrc.supplierQuotation.model.supQuo.selectItemFirst')
    //       .d('请先勾选物品行！'),
    //   });
    //   return !validateFlag;
    // }

    form.validateFields((err, values = {}) => {
      if (err) {
        validateFlag = false;
        return;
      }
      headerData = values;
    });

    if (!validateFlag) {
      return !validateFlag;
    }

    const dataSource =
      bargingFlag || isEmpty(supplierSelectedRowKeys)
        ? lineDataList
        : lineDataList.filter((item) => supplierSelectedRowKeys.includes(item.quotationLineId));
    const params = getEditTableData(dataSource);

    const warningKeys = this.generalData(dataSource);
    let warningInfo = '';
    warningKeys.forEach((item) => {
      const keyWords = SetOfTips[item];
      if (keyWords) {
        warningInfo += `【${keyWords}】`;
      }
    });
    if (!isEmpty(warningKeys)) {
      notification.warning({
        message: warningInfo
          ? `${
              warningInfo +
              intl
                .get('ssrc.supplierQuotation.model.supQuo.needFillIn')
                .d('字段未填写，请填写后提交')
            }`
          : intl
              .get('ssrc.supplierQuotation.model.supQuo.needFillIn')
              .d('字段未填写，请填写后提交'),
      });
      return false;
    }

    if (lineDataList && !isEmpty(params)) {
      const { currencyCode = null } = headerData;
      const sectionFlag = this.getBidSectionFlag();

      const newParams = params.map((item) => {
        let actionSectionSelectedFlag = item?.actionSectionSelectedFlag || 0;

        if (!isEmpty(supplierSelectedRowKeys) && sectionFlag) {
          const exitData = supplierSelectedRowKeys.filter(
            (rowKey) => item.quotationLineId && rowKey === item.quotationLineId
          );
          actionSectionSelectedFlag = isEmpty(exitData) ? actionSectionSelectedFlag : 1;
        }

        return {
          ...item,
          actionSectionSelectedFlag,
          currentExpiryDateFrom: dateFormate(item.currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(item.currentExpiryDateTo, DATETIME_MAX),
          currentPromisedDate: dateFormate(item.currentPromisedDate, DATETIME_MIN),
          currencyCode,
        };
      });
      validateFlag = this.lowestQuotationRange(newParams);
      if (!validateFlag) {
        notification.warning({
          message: intl
            .get(`ssrc.supplierQuotation.model.supQuo.quoteThanRange`)
            .d('报价金额不符合报价幅度金额!'),
        });
      } else {
        lineData = newParams;
      }
    }

    const data = {
      rfxQuotationHeader: { ...quotationHeader, ...headerData },
      quotationHeaderId,
      rfxQuotationLines: (lineData || []).filter(Boolean),
      allSubmitFlag: isEmpty(supplierSelectedRowKeys) ? 1 : bargingFlag,
      selectedRowKeys: !isEmpty(supplierSelectedRowKeys)
        ? (supplierSelectedRowKeys || []).filter(Boolean)
        : null,
      customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
    };

    if (!validateFlag) {
      return validateFlag;
    }
    return data;
  };

  // 判断是否议价
  isBargainFlag = (lines = []) => {
    const bargainFlag =
      !isEmpty(lines) && lines.some((item) => item.quotationLineStatus === 'BARGAINED') ? 1 : 0;
    return bargainFlag;
  };

  /**
   * 提交-首页面 成功后的处理
   * 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   * @protected
   */
  homePageAfterSuccessSubmit = (options = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      // dispatch,
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { continuousQuotationFlag = 0 } = quotationHeader || {};
    const { from } = options || {};
    notification.success();

    if (!continuousQuotationFlag || from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
      this.directionSupplierQuotationList(); // from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED' 整单放弃触发提交
    } else {
      // const { rfxId: quotationHeaderId } = this.state;
      // dispatch({
      //   type: `${modelName}/queryQuotationLines`,
      //   payload: {
      //     quotationHeaderId,
      //     customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
      //   },
      // }).then((result) => {
      //   if (result) {
      //     result.content.forEach((ele) => ele.abandonedFlag && ele.$form.resetFields());
      //   }
      // });
      this.clearQuotationHeaderStore();
      this.clearQuotationLineTableStore();

      // 查询报价单头
      this.queryQuotationHeader();
      this.queryQuotationLines({}, { operateType: 'TableSubmit' });
      this.fetchRoundQuotationInfo();
    }
    this.setState({
      supplierSelectedRowKeys: [],
      supplierDataChange: false,
    });
  };

  /**
   * 提交-首页面
   * @protected 此方法被【五粮浓香】二开，请勿删除、修改此方法名！！！
   * @protected 此方法调用的方法名也请请勿删除、修改！！！
   */
  handleSubmit = async (options = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      form,
      [modelName]: { quotationHeader = {}, quotationLines = {} },
      remote,
    } = this.props;
    const { supplierSelectedRowKeys, SetOfTips } = this.state;
    const { outData = {}, outPassFlag = 0 } = options || {};
    const bargingFlag =
      !isEmpty(quotationLines.content) &&
      quotationLines.content.some((item) => item.bargainFlag === 1)
        ? 0
        : 1;

    // if (!bargingFlag && isEmpty(supplierSelectedRowKeys)) {
    //   Modal.warning({
    //     title: intl
    //       .get('ssrc.supplierQuotation.model.supQuo.selectItemFirst')
    //       .d('请先勾选物品行！'),
    //   });
    //   return;
    // }

    const currencyCode = form?.getFieldValue('currencyCode') || quotationHeader?.currencyCode;
    // let fieldsErr = false;
    // form.validateFields((err, values = {}) => {
    //   console.log(
    //     err,
    //     values,
    //     'line 1,'
    //   );
    //   if (err) {
    //     fieldsErr = true;
    //     return;
    //   }

    //   currencyCode = values.currencyCode || null;
    // });

    // if (fieldsErr) {
    //   return;
    // }

    const dataSource =
      bargingFlag || isEmpty(supplierSelectedRowKeys)
        ? quotationLines?.content
        : quotationLines?.content.filter((item) =>
            supplierSelectedRowKeys.includes(item.quotationLineId)
          );
    let newAbaData = [];

    if (!dataSource || isEmpty(dataSource) || !Array.isArray(dataSource)) {
      return;
    }

    newAbaData = dataSource.filter((item) => item.$form.getFieldValue('abandonedFlag') !== 0); // 过滤出勾选放弃的数据  是为了过滤掉勾选放弃的行，但是在个性化里面设置了必输
    const newOtherData = dataSource.filter(
      (item) => item.$form.getFieldValue('abandonedFlag') === 0
    ); // 过滤出未勾选放弃的数据
    const params = getEditTableData(newOtherData);
    const warningKeys = this.generalData(newOtherData);
    let warningInfo = '';
    warningKeys.forEach((item) => {
      const keyWords = SetOfTips[item];
      if (keyWords) {
        warningInfo += `【${keyWords}】`;
      }
    });
    if (!isEmpty(warningKeys)) {
      notification.warning({
        message: warningInfo
          ? `${
              warningInfo +
              intl
                .get('ssrc.supplierQuotation.model.supQuo.needFillIn')
                .d('字段未填写，请填写后提交')
            }`
          : intl
              .get('ssrc.supplierQuotation.model.supQuo.needFillIn')
              .d('字段未填写，请填写后提交'),
      });
      return;
    }

    let cuxFlag = true;
    if (remote?.event) {
      // 给state中设置二开的值
      cuxFlag = await remote.event.fireEvent('remoteBeforeHandleSubmit', {
        that: this,
        options,
        quotationLines,
        newAbaData,
      });

      if (cuxFlag === false) {
        return false;
      }
    }

    if (quotationLines.content) {
      const newParams = params.map((item) => {
        return {
          ...item,
          currentExpiryDateFrom: dateFormate(item.currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(item.currentExpiryDateTo, DATETIME_MAX),
          currentPromisedDate: dateFormate(item.currentPromisedDate, DATETIME_MIN),
          currencyCode,
        };
      });
      // 这里是过滤放弃数据，不加的话，abandonedFlag还是0
      if (newAbaData.length > 0) {
        newAbaData = newAbaData.map((item) => {
          return {
            ...item,
            abandonedFlag: item.$form.getFieldValue('abandonedFlag'),
          };
        });
      }
      form.validateFields((err, values) => {
        if (!err) {
          if (this.lowestQuotationRange(newParams)) {
            const data = {
              rfxQuotationHeader: { ...quotationHeader, ...filterNullValueObject(values) },
              quotationHeaderId: quotationHeader.quotationHeaderId,
              rfxQuotationLines: [...newAbaData, ...newParams].filter(Boolean),
              allSubmitFlag: isEmpty(supplierSelectedRowKeys) ? 1 : bargingFlag,
              selectedRowKeys: !isEmpty(supplierSelectedRowKeys)
                ? (supplierSelectedRowKeys || []).filter(Boolean)
                : undefined,
              customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
            };

            const warnigSubmit = (response = {}) => {
              notification.warning({
                message: response?.message,
              });
            };

            const doValidate = (otherParams = {}) => {
              return dispatch({
                type: `${modelName}/validateQuotationSubmit`,
                payload: {
                  ...data,
                  ...otherParams,
                  ...(outData || {}),
                  passFlag: outPassFlag,
                },
              });
            };
            const doSubmit = (otherParams = {}) => {
              return dispatch({
                type: `${modelName}/submitQuotationLines`,
                payload: {
                  ...data,
                  ...otherParams,
                  ...(outData || {}),
                  passFlag: 1,
                },
              });
            };
            this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
            // 校验
            doValidate()?.then?.((validateResult) => {
              const ValidateResult = validateResult;
              // 校验报警告后回调
              if (ValidateResult && !ValidateResult.failed) {
                const warningOk = () => {
                  doSubmit().then?.((result) => {
                    if (result && result?.failed) {
                      warnigSubmit(result);
                    } else {
                      this.homePageAfterSuccessSubmit(options);
                    }
                  });
                };
                // 校验成功回调
                const successCallBack = () => {
                  doSubmit().then?.((res) => {
                    const SubmitResult = res;
                    if (res && res.failed) {
                      // FIXME 需要优化，有歧义，错误不等于需要提示
                      const { code } = res || {};
                      const { detailPriceControlRule = null } = quotationHeader || {};
                      if (['EQUAL_WEAK', 'WEAK'].includes(detailPriceControlRule)) {
                        const weakControlFlag =
                          code === 'ssrc.quotation.quotation_detail_weak_control' ||
                          code === 'error.ssrc.quotation.quotation_detail_equal_weak_control'; // HACK 临时方案,前后端优化
                        if (weakControlFlag) {
                          Modal.confirm({
                            content: res.message,
                            onOk: () => {
                              doSubmit({ weakCtrlConfirmFlag: 1 }).then?.((result) => {
                                if (result && result.failed) {
                                  warnigSubmit(result);
                                } else {
                                  this.homePageAfterSuccessSubmit();
                                }
                              });
                            },
                          });
                          return;
                        }
                        warnigSubmit(res); // temporary
                      } else if (['EQUAL_STRONG', 'STRONG'].includes(detailPriceControlRule)) {
                        Modal.warning({
                          content: res.message,
                          okText: intl.get('hzero.common.button.ok').d('确定'),
                        });
                      } else {
                        if (!SubmitResult) {
                          return;
                        }
                        warnigSubmit(res);
                      }
                    } else {
                      this.homePageAfterSuccessSubmit(options);
                    }
                  });
                };
                const validateModalProps = {
                  response: ValidateResult,
                  overrideSubmitWarninOkOperate: this.overrideSubmitWarninOkOperate,
                  successCallBack,
                  warningOk,
                };
                const currentValidateModalProps = remote
                  ? remote.process(
                      'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_FIRST_VIEW_SUBMIT_VALIDATE_MODAL_PROPS',
                      validateModalProps
                    )
                  : validateModalProps;
                validateModal(currentValidateModalProps);
              }

              if (validateResult && validateResult.failed) {
                getResponse(ValidateResult);
              }
            });
          } else {
            notification.warning({
              message: intl
                .get(`ssrc.supplierQuotation.model.supQuo.quoteThanRange`)
                .d('报价金额不符合报价幅度金额!'),
            });
          }
          return;
        }
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.model.supQuo.needFillIn')
            .d('字段未填写，请填写后提交'),
        });
      });
    } else {
      this.forceUpdate();
    }
  };

  // 覆盖提示 如果消息编码代表是整单放弃提示，需要打开弹窗
  // @return int 1 | 0
  overrideSubmitWarninOkOperate = (validateResults) => {
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
   * 最低报价幅度金额计算
   */
  @Bind()
  lowestQuotationRange() {
    return true; // 此校验放到了后端去做，但是由于有二开调用此方法，因此此方法不能删除；返回true，不校验；
  }

  /**
   * 详情页提交，当前数据
   */
  @Throttle(2000)
  @Bind()
  submitDetailBiddingOffer(type) {
    const { isBatchMaintainSection = false, noWarningBatchSectionFlag = false } = this.state;
    const { isCheckedSectionListEmpty } = this.SectionRef;
    const isBidSectionData = this.isBidSectionData(); // 分标段
    this.detailSubmitType = type;

    if (isBidSectionData) {
      const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据
      const needWarningUserConfig =
        (!isBatchMaintainSection || (isBatchMaintainSection && checkedFlag)) &&
        noWarningBatchSectionFlag;
      if (needWarningUserConfig) {
        this.setState({
          batchEmptySelectSectionFlag: true,
        });
        return;
      }
      // 区分标段, 批量勾选
      if (isBatchMaintainSection && !checkedFlag) {
        this.submitDetailBiddingOfferSection();
      } else {
        this.submitDetailBiddingOfferSingle();
      }
    } else {
      this.submitDetailBiddingOfferSingle(); // normal supplier quotation submit
    }
  }

  // 表单视图-提交-校验/数据整理
  validateAndGetBiddingOfferDataForSubmit = (othersData = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: { biddingQuotationLine = {}, quotationHeader },
    } = this.props;
    const { rfxId: quotationHeaderId } = this.state;

    let error = false;
    let rfxQuotationHeader = {};
    let rfxQuotationLines = [];

    const quotationForm = this.getQuotationFormRefForm();
    if (!quotationForm) {
      error = true;
      return { error };
    }

    const formAbandonedFlag = quotationForm.getFieldValue('abandonedFlag'); // 个性化设置了必输，不校验勾选放弃行数据
    if (formAbandonedFlag) {
      rfxQuotationLines = [
        {
          ...biddingQuotationLine,
          abandonedFlag: formAbandonedFlag,
        },
      ];
      rfxQuotationHeader = { ...quotationHeader };
    } else {
      form.validateFields((err, values = {}) => {
        if (err) {
          error = true;
          return;
        }

        rfxQuotationHeader = { ...quotationHeader, ...(values || {}) };
      });

      quotationForm.validateFieldsAndScroll((err, values = {}) => {
        if (err) {
          error = true;
        }

        // 重置form
        if (formAbandonedFlag) {
          form.resetFields();
          this.quotationFormResetFields();
        }

        const {
          currentExpiryDateFrom,
          currentExpiryDateTo,
          currentPromisedDate,
          quotationEndDate = null,
          quotationStartDate = null,
        } = values || {};
        rfxQuotationLines = [
          {
            ...biddingQuotationLine,
            ...(values || {}),
            currencyCode: rfxQuotationHeader?.currencyCode,
            currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
            currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MAX),
            currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
            quotationEndDate: quotationEndDate || biddingQuotationLine.quotationEndDate, // 此处是表单页面通过个性化隐藏了报价日期，切换试图提交，日期没值
            quotationStartDate: quotationStartDate || biddingQuotationLine.quotationStartDate,
          },
        ];
      });

      const lowestQuotationRangeFlag = this.lowestQuotationRange(rfxQuotationLines);
      if (!lowestQuotationRangeFlag) {
        error = true;
        notification.warning({
          message: intl
            .get(`ssrc.supplierQuotation.model.supQuo.quoteThanRange`)
            .d('报价金额不符合报价幅度金额!'),
        });
      }
    }
    return {
      error,
      rfxQuotationHeader,
      quotationHeaderId,
      rfxQuotationLines,
      ...othersData,
      customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
    };
  };

  // 物料视图-提交-分标段
  submitDetailBiddingOfferSection = (otherData = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
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
      integrationCurrentData = currentData || {};
    }

    const data = {
      ...integrationCurrentData,
      allSubmitFlag: this.detailSubmitType,
      projectLineSectionList,
      ...otherData,
    };

    this.handleQuotationSectionBatchSubmit(data);
  };

  // 表单视图-提交
  submitDetailBiddingOfferSingle = async (options = {}) => {
    const { dispatch, modelName = 'supplierQuotation', remote } = this.props;
    const { error = false, ...othersData } = this.validateAndGetBiddingOfferDataForSubmit() || {};
    const { outData = {}, outPassFlag = 0 } = options || {};
    if (error || isEmpty(othersData)) {
      return;
    }

    const doValidate = (otherParams = {}) => {
      return dispatch({
        type: `${modelName}/validateQuotationSubmit`,
        payload: {
          ...othersData,
          ...otherParams,
          ...(outData || {}),
          passFlag: outPassFlag,
        },
      });
    };
    const doSubmit = () => {
      this.handleSubmitBiddingOffer({ ...othersData, ...(outData || {}), passFlag: 1 }).then(
        (res) => {
          this.handleSubmitBiddingOfferAfter(res, options);
        }
      );
    };

    let cuxFlag = true;
    if (remote?.event) {
      // 给state中设置二开的值
      cuxFlag = await remote.event.fireEvent('remoteBeforeSubmitDetailBiddingOfferSingle', {
        that: this,
        options,
        othersData,
        doValidate,
        doSubmit,
      });

      if (cuxFlag === false) {
        return false;
      }
    }

    this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
    doValidate().then?.((validateResult) => {
      const result = getResponse(validateResult);
      if (result && !result.failed) {
        const validateModalProps = {
          response: result,
          successCallBack: () => doSubmit(),
          warningOk: () => doSubmit(),
          overrideSubmitWarninOkOperate: this.overrideSubmitWarninOkOperate,
        };
        const currentValidateModalProps = remote
          ? remote.process(
              'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_FIRST_VIEW_SUBMIT_VALIDATE_MODAL_PROPS_DETAIL_VIEW',
              validateModalProps
            )
          : validateModalProps;
        validateModal(currentValidateModalProps);
      }
      // const currentValidateResult =
      //   isArray(validateResult) && !isEmpty(validateResult) ? validateResult[0] : null;
      // const validateCallBack = confirmModal(currentValidateResult, () => doSubmit());

      // if (validateCallBack && validateCallBack.type === 'ERROR') {
      //   return false;
      // } else {
      //   doSubmit();
      // }
    });
  };

  // 表单视图-提交-返回
  handleSubmitBiddingOffer = (data = {}) => {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;

    return dispatch({
      type: `${modelName}/submitQuotationLines`,
      payload: data,
    });
  };

  /**
   * 表单视图提交成功后的处理
   * 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   * @protected
   */
  formAfterSuccessSubmit = (options = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { biddingQuotationLine = {} },
    } = this.props;
    const { quotationLineId = null, quotationHeaderId } = biddingQuotationLine || {};
    const { from } = options || {};

    notification.success();
    // 整单提交后跳转列表页
    if (this.detailSubmitType || from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
      this.directionSupplierQuotationList();
    } else {
      // 查询报价单头
      this.queryQuotationHeader();
      this.queryQuotationLines();
      this.fetchRoundQuotationInfo();
      // 根据 quotationLineId 进行接口查询 报价行
      if (!quotationLineId) {
        return;
      }
      this.queryBiddingQuotationLine(
        {},
        {
          quotationLineIds: quotationLineId,
        }
      );
      // 查询还比价历史接口
      this.queryQuotationLineDetail({
        quotationLineId,
      });
      this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    }
  };

  // 表单视图-提交完毕处理
  handleSubmitBiddingOfferAfter = (res = null, options = {}) => {
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

      this.handleSubmitBiddingOffer(othersData).then((result) => {
        if (result && result.failed) {
          notification.warning({
            message: res.message,
          });
        } else {
          this.formAfterSuccessSubmit(options);
        }
      });
    };

    if (res && res.failed) {
      const { modelName = 'supplierQuotation' } = this.props;
      const {
        [modelName]: {
          quotationHeader: { detailPriceControlRule },
        },
      } = this.props;

      if (['EQUAL_WEAK', 'WEAK'].includes(detailPriceControlRule)) {
        const { code, message } = res || {};
        const weakControlFlag =
          code === 'ssrc.quotation.quotation_detail_weak_control' ||
          code === 'error.ssrc.quotation.quotation_detail_equal_weak_control'; // HACK 临时方案,前后端优化
        if (!weakControlFlag) {
          notification.warning({ message });
          return;
        }
        Modal.confirm({
          content: res.message,
          onOk: () => weakPriceControllerHandleModalOk(),
        });
      } else if (['EQUAL_STRONG', 'STRONG'].includes(detailPriceControlRule)) {
        Modal.warning({
          content: res.message,
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
      } else {
        notification.warning({
          message: res.message,
        });
      }
    } else {
      this.formAfterSuccessSubmit(options);
    }
  };

  // 多标段-勾选flag
  sectionSelectedFlag = () => {
    const { isBatchMaintainSection = false } = this.state;
    const { isCheckedSectionListEmpty = () => {} } = this.SectionRef;
    const checkedFlag = isCheckedSectionListEmpty(); // 标段勾选数据

    return isBatchMaintainSection && !checkedFlag;
  };

  // 弱管控-modal-ok
  detailViewSubmitWeakControlHandleModalOk = () => {};

  // 分标段-切换标段前
  handleSwitchSectionBefore = () => {
    const { inquiryDetail = false } = this.state;
    if (inquiryDetail) {
      // 表单视图
      // const { error = false } = this.validateAndGetBiddingOfferData();
      // if (error) {
      //   return !error;
      // }

      this.saveBiddingOffer();
      return true;
    }

    // const pageAllData = this.integrationPageData();
    // if (!pageAllData || isEmpty(pageAllData)) {
    //   return false;
    // }

    this.saveAllBiddingOffer();
    return true;
  };

  // 整合页面参数
  integrationPageData = () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: { quotationLines = {}, quotationHeader = {} },
    } = this.props;
    const { getFieldValue } = form;

    // let fieldsErr = false;
    let rfxQuotationHeader = {};
    const saveData = quotationLines.content ? quotationLines.content : [];

    const params = saveData.map((lineList) => {
      let obj = {};
      if (!lineList.$form) {
        return;
      }

      lineList.$form.validateFields((err, values) => {
        // if (err) {
        //   fieldsErr = true;
        //   return;
        // }
        const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values || {};
        // 校验未通过/通过
        obj = {
          ...values,
          currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MAX),
          currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
        };
      });
      return {
        ...lineList,
        ...obj,
        taxRate: obj.taxRate || obj.taxRate === 0 ? obj.taxRate : lineList.taxRate,
        currencyCode: getFieldValue('currencyCode'),
      };
    });

    form.validateFields((err, values) => {
      // if (err) {
      //   fieldsErr = true;
      //   // return;
      // }
      rfxQuotationHeader = { ...quotationHeader, ...values };
    });

    // if (fieldsErr) {
    //   return null;
    // }

    return {
      rfxQuotationHeader,
      rfxQuotationLine: params,
      customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
    };
  };

  /**
   * 保存 - 页面头行
   * @protected 此方法被【五粮浓香】二开，请勿删除、修改此方法名！！！
   * @protected 此方法调用的方法名也请请勿删除、修改！！！
   */
  @Throttle(2000)
  @Bind()
  async saveAllBiddingOffer(page = {}, record = {}) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      form,
      [modelName]: { quotationLines = {}, quotationLinePagination = {}, quotationHeader = {} },
    } = this.props;
    const { supplierSelectedRowKeys = [] } = this.state;
    const { getFieldValue } = form;
    const sectionFlag = this.isBidSectionData() || false;

    // let fieldsErr = false;
    const saveData = quotationLines.content ? quotationLines.content : [];

    const params = saveData.map((lineList) => {
      let obj = {};
      let actionSectionSelectedFlag = 0;
      const { quotationLineId, $form: lineForm = {} } = lineList;
      const abandonedFlag = lineForm.getFieldValue?.('abandonedFlag');

      if (!isEmpty(supplierSelectedRowKeys) && sectionFlag) {
        const exitData = supplierSelectedRowKeys.filter(
          (rowKey) => quotationLineId && rowKey === quotationLineId
        );
        actionSectionSelectedFlag = isEmpty(exitData) ? 0 : 1;
      }

      if (abandonedFlag === 0) {
        // 这里加判断是为了过滤到个性化里面设置必输，而行数据勾选了放弃
        // eslint-disable-next-line no-unused-expressions
        lineForm.validateFields?.((err, values) => {
          // if (err) {
          //   // fieldsErr = true;
          //   return;
          // }
          const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values;
          obj = {
            ...values,
            currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
            currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MAX),
            currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
          };
        });
      }

      return {
        ...lineList,
        ...obj,
        abandonedFlag,
        // taxRate: obj.taxRate || obj.taxRate === 0 ? obj.taxRate : null,
        currencyCode: getFieldValue('currencyCode'),
        actionSectionSelectedFlag,
      };
    });
    this.toggleOperationLoading(true);
    return new Promise((resolve, reject) => {
      form.validateFields(async (err, values) => {
        if (values) {
          await dispatch({
            type: `${modelName}/saveQuotationLines`,
            payload: {
              rfxQuotationHeader: { ...quotationHeader, ...values },
              rfxQuotationLine: params,
              customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
            },
          })
            .then((res) => {
              const LinePagination = !isEmpty(page) ? page : quotationLinePagination;
              this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
              this.isFinishSaveLineFlag = true;
              if (res) {
                resolve(true);
                notification.success();
                dispatch({
                  type: `${modelName}/updateState`,
                  payload: { quotationLines: {} },
                });
                this.setState({
                  supplierDataChange: false,
                  supplierSelectedRowKeys: [],
                });
                // 点击报价保存后，设置对应的状态和查询详情和环比价历史接口
                if (!isEmpty(record)) {
                  const { quotationLineId, quotationHeaderId } = record || {};
                  // 查询行数据,更新左边行税率
                  this.queryQuotationLines(LinePagination);
                  this.setState({
                    currentRecord: record,
                    expand: {
                      [record.rfxLineItemNum]: [record.rfxLineItemNum],
                    },
                    inquiryTableReadOnly: false,
                    inquiryDetail: true,
                  });
                  // 隐藏当前列表页,打开详情页
                  // 根据 quotationLineId 进行接口查询 竞价行
                  this.queryBiddingQuotationLine(
                    {},
                    {
                      quotationLineIds: record.quotationLineId,
                    }
                  );
                  this.queryQuotationHeader();
                  // 查询还比价历史接口
                  this.queryQuotationLineDetail({
                    quotationLineId: record.quotationLineId,
                  });
                  this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
                  this.fetchRoundQuotationList(record.quotationLineId);
                  this.toggleOperationLoading();
                } else {
                  // 分页保存/保存按钮保存,查询行数据和头数据
                  if (sectionFlag) {
                    this.refreshSectionAndCurrentPage();
                    return;
                  }

                  this.queryQuotationHeader();
                  this.queryQuotationLines(LinePagination, { operateType: 'TableSave' });
                  this.toggleOperationLoading();
                }
              } else {
                this.toggleOperationLoading();
                reject(new Error());
              }
            })
            .catch((error) => {
              this.toggleOperationLoading();
              reject(new Error(error));
            });
        } else {
          this.toggleOperationLoading();
          reject(new Error());
        }
      });
    });
  }

  // 页面保存
  @Bind()
  async saveMainPage() {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    let result = true;
    const { ...data } = this.integrationPageData();

    try {
      dispatch({
        type: `${modelName}/saveQuotationLines`,
        payload: data,
      }).then?.((res) => {
        if (!res) {
          result = false;
        }
      });
    } catch (e) {
      throw e;
    }

    return result;
  }

  // 如果是分标段，则组件内部提供查询
  refreshSectionAndCurrentPage = () => {
    if (!isEmpty(this.SectionRef)) {
      const { refreshSectionAndMain = () => {} } = this.SectionRef;
      refreshSectionAndMain();
    }
  };

  /**
   * 报价页面引用参考价格
   */
  @Bind()
  submitReferencePrice() {
    const {
      dispatch,
      match: { params },
      organizationId,
      modelName = 'supplierQuotation',
    } = this.props;
    const { inquiryDetail = false, currentRecord = {} } = this.state;

    const updatePriceAfterReference = () => {
      if (inquiryDetail) {
        dispatch({
          type: `${modelName}/updateState`,
          payload: {
            biddingQuotationLine: {},
            quotationLines: {},
            quotationLinePagination: {},
          },
        });

        this.queryQuotationLines(
          {},
          {
            quotationHeaderId: params.rfxId,
            customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
          }
        );

        const { quotationLineId = null } = currentRecord;
        this.queryBiddingQuotationLine(
          {},
          {
            quotationLineIds: quotationLineId,
          }
        );

        return;
      }

      this.clearQuotationLineTableStore();

      this.queryQuotationLines(
        {},
        {
          quotationHeaderId: params.rfxId,
          customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
        }
      );
    };

    Modal.confirm({
      title: intl
        .get(`ssrc.supplierQuotation.view.message.submitReferencePrice`)
        .d('是否确认引用参考价格？'),
      okText: intl.get('hzero.common.button.ok').d('确定'),
      onOk: () => {
        dispatch({
          type: `${modelName}/submitReferencePrice`,
          payload: {
            organizationId,
            quotationHeaderId: params.rfxId,
          },
        }).then((res) => {
          if (res) {
            notification.success();

            updatePriceAfterReference();
            this.forceUpdate();
          }
        });
      },
      onCancel: () => {},
    });
  }

  /**
   * 查询切换视图后的报价明细
   * */
  @Bind()
  async queryBiddingQuotationLine(page = {}, queryParams = {}) {
    const {
      dispatch,
      modelName = 'supplierQuotation',
      match: { params = {} },
    } = this.props;
    const { rfxId: quotationHeaderId } = params;

    await dispatch({
      type: `${modelName}/queryBiddingQuotationLine`,
      payload: {
        page,
        quotationHeaderId,
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM`,
        ...queryParams,
      },
    });

    this.quotationFormResetFields();
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    if (!isEmpty(changeValues)) {
      this.setState({
        supplierDataChange: true,
      });
    }
  }

  // 表格确定行数据记录
  tableConfirmLineDataRecord = (quotationLineId = null) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { biddingQuotationLine = {} },
    } = this.props;

    const { content } = biddingQuotationLine || {};
    if (!quotationLineId || !isEmpty(content)) {
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
  async openLadder(record = {}) {
    if (this.ladderModalCount >= 1) {
      return;
    }

    this.ladderModalCount++;
    const { inquiryDetail = false } = this.state;
    const {
      dispatch,
      modelName = 'supplierQuotation',
      [modelName]: { quotationLinePagination = {} },
    } = this.props;
    try {
      // 关闭阶梯报价之后 保存并刷新头行数据
      if (inquiryDetail) {
        await this.saveBiddingOffer();
      } else {
        await this.saveAllBiddingOffer(quotationLinePagination);
      }
      this.setState({ ladderVisible: true });
      dispatch({
        type: `${modelName}/fetchLadderList`,
        payload: {
          quotationLineId: record.quotationLineId,
          customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LADDER_INQUIRY_TABLE`,
        },
      });
      // const newRecord = this.tableConfirmLineDataRecord(quotationLineId) || record;
      this.setState({
        ladderListHeaderInfo: record,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   *  关闭阶梯报价模态框
   * @param {Object} record -hideLadder
   */
  @Bind()
  hideLadderRecord() {
    this.ladderModalCount = 0;
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      [modelName]: { biddingQuotationLine = {}, quotationLinePagination = {} },
    } = this.props;
    const { inquiryDetail = false } = this.state;
    const { quotationLineId = null } = biddingQuotationLine || {};
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationLines: {},
      },
    });
    this.setState({ ladderVisible: false, ladderListHeaderInfo: {} });
    this.queryQuotationHeader();
    // 关闭阶梯报价之后重新查询行信息
    this.queryQuotationLines(quotationLinePagination);
    if (inquiryDetail) {
      this.queryBiddingQuotationLine({}, { quotationLineIds: quotationLineId });
    }
  }

  // 多标段-切换-查询
  queryDetailView = () => {
    const callback = (content = []) => {
      if (isEmpty(content)) {
        return;
      }
      this.detailViewQuery(content[0]);
    };

    this.queryQuotationLines({}, {}, callback);
  };

  // 表单视图-切换-查询
  detailViewQuery = (record = {}) => {
    const { quotationLineId = null, rfxLineItemNum = null, quotationHeaderId } = record || {};
    if (!quotationLineId) {
      return;
    }

    // 隐藏当前列表页,打开详情页
    // 根据 quotationLineId 进行接口查询 竞价行
    this.queryBiddingQuotationLine();
    // 查询还比价历史接口
    this.queryQuotationLineDetail({
      quotationLineId,
    });
    this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    // 查询多轮报价历史接口
    this.fetchRoundQuotationList(quotationLineId);

    this.setState({
      currentRecord: record,
      expand: {
        [rfxLineItemNum]: [rfxLineItemNum],
      },
    });
  };

  // 设置表单编辑标识
  setSupplierFormChangeEditStatus(supplierFormChangeFlag = 0) {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        supplierFormChangeFlag,
      },
    });
  }

  /**
   * 点击当前物品报价单行时，触发查询  展开详情信息
   * @param {Object} record - 当前点击的行信息
   * 报价提示：是否需要保存当前所填写的报价信息？点击取消按钮，不保存数据进入报价界面；点击确定按钮，保存全部修改的数据进入报价界面
   */
  @Bind()
  openTableRow(record = {}) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationLinePagination = {}, supplierFormChangeFlag = 0, quotationLines },
    } = this.props;
    const { quotationLineId = '', quotationHeaderId } = record || {};
    const { supplierDataChange } = this.state;

    // 若表格行或者表头有编辑，则弹出提示
    if (supplierDataChange || supplierFormChangeFlag === 1) {
      Modal.confirm({
        title: intl
          .get(`ssrc.supplierQuotation.view.message.quotationTips`)
          .d('是否需要保存当前所填写的报价信息?'),
        onOk: () => {
          this.saveAllBiddingOffer(quotationLinePagination, record);
        },
        onCancel: () => {
          const { $form } = record || {};
          let oldRecord = (quotationLines?.content || []).filter(
            (line) => line?.quotationLineId === quotationLineId
          );
          oldRecord = oldRecord?.[0] || record;
          if ($form) {
            $form.resetFields();
          }
          this.dynamicChangePrice(record); // recalculate line

          this.setState({
            currentRecord: oldRecord,
            expand: {
              [record.rfxLineItemNum]: [record.rfxLineItemNum],
            },
            inquiryTableReadOnly: false,
            inquiryDetail: true,
          });
          // 隐藏当前列表页,打开详情页
          // 根据 quotationLineId 进行接口查询 竞价行
          this.queryBiddingQuotationLine(
            {},
            {
              quotationLineIds: quotationLineId,
            }
          );
          this.queryQuotationLines(quotationLinePagination);
          // 查询还比价历史接口
          this.queryQuotationLineDetail({
            quotationLineId,
          });
          this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
          // 查询多轮报价历史接口
          this.fetchRoundQuotationList(quotationLineId);
        },
      });
      this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
    } else {
      this.setState({
        currentRecord: record,
        expand: {
          [record.rfxLineItemNum]: [record.rfxLineItemNum],
        },
        inquiryTableReadOnly: false,
        inquiryDetail: true,
      });
      // 隐藏当前列表页,打开详情页
      // 根据 quotationLineId 进行接口查询 竞价行
      this.queryBiddingQuotationLine(
        {},
        {
          quotationLineIds: record.quotationLineId,
        }
      );
      // 查询还比价历史接口
      this.queryQuotationLineDetail({
        quotationLineId: record.quotationLineId,
      });
      this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
      // 查询多轮报价历史接口
      this.fetchRoundQuotationList(quotationLineId);
    }
  }

  /**
   * PS：以前的保存之后调用了很多刷新 和现在的重复 故新开一个
   * 详情视图 切换物料卡片或者详情视图翻页调用的保存操作
   */
  @Bind()
  async saveItemInfo() {
    const { modelName = 'supplierQuotation' } = this.props;
    const { dispatch, form = {} } = this.props;

    const AllData = this.validateAndGetBiddingOfferData();
    this.toggleOperationLoading(true);
    await dispatch({
      type: `${modelName}/saveQuotationLines`,
      payload: AllData,
    })
      .then((res) => {
        if (res) {
          form.resetFields();
          this.quotationFormResetFields();
          notification.success();
          // 查询报价单头
          this.queryQuotationHeader();
        }
      })
      .finally(() => {
        this.toggleOperationLoading();
        this.setSupplierFormChangeEditStatus(); // 将表单编辑标识重置
      });
  }

  /**
   * openTableDetail -  打开物料行详情页
   */
  @Bind()
  async openTableDetail(item = {}) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      // form = {},
      [modelName]: { biddingQuotationLine = {}, quotationLinePagination },
    } = this.props;

    if (biddingQuotationLine?.quotationLineId === item.quotationLineId) {
      return;
    }

    await this.saveItemInfo({ LinePagination: quotationLinePagination });

    this.setState({
      currentRecord: item,
      expand: {
        [item.rfxLineItemNum]: [item.rfxLineItemNum],
      },
    });
    // 清空上一行的数据
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        biddingQuotationLine: {},
      },
    });

    const { quotationHeaderId, quotationLineId } = item || {};

    // 注入form表单信息
    // form.setFieldsValue({
    //   netPrice: item.netPrice, // 未税单价
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
    //   currentQuotationQuantity: item.currentQuotationQuantity, // 可供数量
    //   attachmentUuid: item.attachmentUuid, // 附件id标识
    //   currentAttachmentUuid: item.currentAttachmentUuid, // 附件id标识
    // });

    this.queryBiddingQuotationLine(
      {},
      {
        quotationLineIds: item.quotationLineId,
      }
    );
    this.queryQuotationLineDetail({
      quotationLineId: item.quotationLineId,
    });
    this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    this.fetchRoundQuotationList(item.quotationLineId);
  }

  /**
   * 收回供应商报价行信息
   * @param {Object} record - 收回的行
   */
  @Bind()
  backQuotationLine(record) {
    // 收回报价 请求数据
    const handleBackQuoLine = (props) => {
      const { dispatch, modelName, record: recordData, queryQuoData = noop } = props;
      dispatch({
        type: `${modelName}/backQuotationLines`,
        payload: [recordData],
      }).then((res) => {
        if (res) {
          notification.success();
          queryQuoData(recordData);
        }
      });
    };

    // 刷新数据
    const queryQuoData = (recordData) => {
      const { quotationHeaderId, quotationLineId } = recordData || {};
      this.queryBiddingQuotationLine(
        {},
        {
          quotationLineIds: recordData.quotationLineId,
        }
      );
      // 查询还比价历史接口
      this.queryQuotationLineDetail({
        quotationLineId: recordData.quotationLineId,
      });
      this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
      this.queryQuotationLines();
    };

    const { dispatch, form, modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader },
      remote: { event } = {},
    } = this.props;
    form.resetFields();
    this.quotationFormResetFields();
    /**
     * 需要传递的自定义事件属性
     * @protected 【合众】二开，请勿随意删除参数！！！
     */
    const eventProps = {
      record,
      dispatch,
      headerInfo: quotationHeader,
      modelName,
      bidFlag: this.bidFlag,
      handleBackQuoLine,
      queryQuoData,
    };

    if (event) {
      event.fireEvent('remoteBackQuoLine', eventProps);
      return;
    }
    handleBackQuoLine(eventProps);
  }

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
    switch (item.quotationLineStatus) {
      case 'NEW':
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
      case 'SUBMITTED':
        color = '#47b881';
        backGround = '#ecf7f1';
        break;
      case 'ROUND_QUOTATION':
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
      case 'ABANDONED':
        color = '#A3A3A3';
        backGround = '#E5E5E5';
        break;
      case 'TAKEN_BACK':
        color = '#A3A3A3';
        backGround = '#E5E5E5';
        break;
      case 'BARGAINED':
        color = '#FF913C';
        backGround = '#FFC800';
        break;
      default:
        color = '#0687FF';
        backGround = '#DAEDFE';
    }
    return (
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
    );
  }

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(_, dataList, record = {}) {
    const { modelName = 'supplierQuotation' } = this.props;
    const { [modelName]: { biddingQuotationLine = {} } = {} } = this.props;
    const form = record.$form;
    const { taxRate, taxId, taxRateType = null } = dataList || {};

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
   * 隐藏物料详情
   */
  @Bind()
  async hideItemDetail() {
    try {
      await this.saveBiddingOffer();
    } catch (e) {
      throw e;
    }

    this.setState({
      inquiryTableReadOnly: true,
      inquiryDetail: false,
    });
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
   * 报价行放弃功能
   * */
  @Bind()
  giveUpQuotationLine(e = {}, record = {}) {
    const {
      target: { checked = 0 },
    } = e;
    const { $form = null } = record;

    const giveUpLine = (form = {}) => {
      if (!form) {
        return;
      }

      const { setFieldsValue = () => {} } = form || {};
      if (checked) {
        record.totalAmount = null;
        record.netAmount = null;

        setFieldsValue({
          currentQuotationPrice: null,
          netPrice: null,
          // currentPerTaxIncludedPrice: null,
          // currentPerNetPrice: null,
          // currentLnNetAmount: null,
          // currentLnTaxAmount: null,
          // currentLnTotalAmount: null,
        });
      }
    };

    if ($form) {
      giveUpLine($form);
    } else {
      const QuotationForm = this.getQuotationFormRefForm();
      giveUpLine(QuotationForm);
      this.updateDetailViewTotalAmount({
        record,
        optionFields: {
          totalAmount: null,
        },
      });
    }
  }

  // 子组件－行
  @Bind()
  itemLineRef(ref = {}) {
    this.ItemLineTable = ref;
  }

  /**
   * leftTableView -  左边物料列表页
   */
  @Bind()
  leftTableView(lineDataSource = [], quotationLinePagination = {}) {
    return (
      <div className={style.detailLeft}>
        {map(lineDataSource, (item) => {
          return (
            <div className={style.leftList} key={item.quotationLineId}>
              {this.renderTableInfo(item)}
            </div>
          );
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
   * rightDetailView -  右边物料行详情页
   */
  @Bind()
  rightDetailView() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { biddingQuotationLine = {}, quotationHeader = {}, quotationLines = {} },
    } = this.props;
    const biddingLine = biddingQuotationLine;
    const { supplierStatus } = quotationHeader || {};
    const { saveQuotationLinesLoading, submitQuotationLinesLoading } = this.props;
    const time = biddingLine.rfxHeaderQuotationEndDate
      ? biddingLine.rfxHeaderQuotationEndDate
      : null;
    const now = biddingLine.currentDateTime ? biddingLine.currentDateTime : null;
    const { bargainFlag } = biddingQuotationLine;
    // 存在已还价
    const bargingFlag =
      !isEmpty(quotationLines.content) &&
      quotationLines.content.some((item) => item.quotationLineStatus === 'BARGAINED')
        ? 1
        : 0;
    const wholeAbandonFlag =
      supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识

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
          </div>
          <div className={style.titleRight}>
            <span style={{ marginRight: '10px' }}>
              <img src={require('@/assets/time.svg')} alt="" />
            </span>
            {biddingLine.rfxHeaderQuotationEndDate ? (
              <CountDown sysNow={now} endTime={time} type="day" />
            ) : null}
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
        {this.renderHistoryInfo()}
        <div className={style.footerBottom}>
          {bargingFlag &&
          bargainFlag === 1 &&
          (quotationHeader.continuousQuotationFlag ||
            (quotationHeader.continuousQuotationFlag === 0 &&
              biddingLine.quotationLineStatus === 'BARGAINED')) ? (
            <Button
              loading={submitQuotationLinesLoading}
              className={style.buttonSave}
              type="default"
              onClick={() => this.submitDetailBiddingOffer(0)}
              disabled={wholeAbandonFlag}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          ) : (
            ''
          )}
          <Button
            loading={saveQuotationLinesLoading}
            className={style.buttonSubmit}
            type="primary"
            onClick={() => this.saveBiddingOffer()}
            disabled={wholeAbandonFlag}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * 关闭报价历史弹框
   *
   * @memberof InquiryPrice
   */
  @Bind()
  onVisibleChange = (visible = false) => {
    if (visible === true) {
      return;
    }

    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationLineDetail: {},
        roundQuotationLineDetail: [],
      },
    });
  };

  /**
   * 还比价历史列表
   */
  @Bind()
  renderHistoryTable(record = {}) {
    // const { roundFlag = '0' } = this.state;
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      queryRoundQuotationLineDetailLoading,
      [modelName]: {
        quotationLineDetail = {},
        roundQuotationLineDetail = [],
        quotationHeader = {},
      },
    } = this.props;
    const { roundQuotationRankFlag, currentQuotationRound } = quotationHeader;
    const dickerColumns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationCount`).d('报价次数'),
        dataIndex: 'quotationCount',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
            quotationName: this.quotationName,
          })
          .d('{quotationName}人'),
        dataIndex: 'quotedByName',
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
        title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.onePrice`).d('单价'),
        dataIndex: 'quotationPrice',
        width: 80,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.counterBidTime`).d('还价时间'),
        dataIndex: 'bargainDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainByName`).d('还价人'),
        dataIndex: 'bargainByName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainPrice`).d('还价单价'),
        dataIndex: 'bargainPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
        dataIndex: 'bargainRemark',
        width: 100,
        align: 'right',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ];
    const roundColumns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 80,
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
            dataIndex: 'roundRank',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
            quotationName: this.quotationName,
          })
          .d('{quotationName}人'),
        dataIndex: 'realName',
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
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        dataIndex: 'quotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxQuotationAmount`)
          .d('行金额(不含税)'),
        dataIndex: 'netQuotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationQuantity`)
          .d('可供数量'),
        dataIndex: 'quotationQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.taxPrice`).d('单价(含税)'),
        dataIndex: 'quotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supplierBidQuery.noTaxPrice`)
          .d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
    ].filter(Boolean);

    return (
      <Spin spinning={queryRoundQuotationLineDetailLoading}>
        {record.bargainFlag ? (
          <div style={{ marginTop: '16px', marginBottom: '4px' }}>
            <span>{intl.get(`ssrc.supplierQuotation.model.supQuo.history`).d('历史还比价')}</span>
            <Table
              bordered
              scroll={{ x: tableScrollWidth(dickerColumns) }}
              columns={dickerColumns}
              rowKey="quotationLineId"
              dataSource={quotationLineDetail.content || []}
              pagination={false}
            />
          </div>
        ) : null}
        {Number(record.roundFlag) === 1 && record.roundQuotationFlag ? (
          <div style={{ marginTop: '16px', marginBottom: '4px' }}>
            <span>
              {intl
                .get(`ssrc.supplierQuotation.model.supQuo.commonRoundHistory`, {
                  quotationName: this.quotationName,
                })
                .d('多轮{quotationName}历史')}
            </span>
            <Table
              bordered
              scroll={{ x: tableScrollWidth(roundColumns) }}
              columns={roundColumns}
              rowKey={uuidv4()}
              dataSource={roundQuotationLineDetail || []}
              pagination={false}
            />
          </div>
        ) : null}
      </Spin>
    );
  }

  @Bind()
  renderItemRank(item) {
    let color = '';
    let backGround = '';
    if (item.autoRoundRank && item.autoRoundRank < 4) {
      backGround = '#F9EDD9';
      color = '#F6B345';
    } else {
      backGround = '#EBEBEB';
      color = '#858585';
    }

    const overContent = () => (
      <div>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.lastRankRound').d('上一轮排名：')}
        {item.autoRoundRank}
      </div>
    );
    return (
      <Popover content={overContent()}>
        <Tag
          style={{
            width: '62px',
            textAlign: 'center',
            backgroundColor: backGround,
            color,

            border: 0,
          }}
        >
          {intl.get('ssrc.inquiryHall.model.inquiryHall.rank').d('排名：')}
          {item.autoRoundRank}
        </Tag>
      </Popover>
    );
  }

  /**
   * renderTableInfo -  table固定信息
   */
  @Bind()
  renderTableInfo(item) {
    const { expand } = this.state;
    const { taxRate } = item || {};

    console.log(taxRate, 'tax rate');

    return (
      <div
        onClick={() => this.openTableDetail(item)}
        className={expand[item.rfxLineItemNum] ? style.selectItem : style.leftHover}
        key={item.rfxLineItemNum}
      >
        <div className={style.listTop}>
          <div className={style.rfxLineItemNumLeft}>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号')}:{item.rfxLineItemNum}
          </div>
          {item.autoRoundRank ? (
            <div className={style.tagRight}>{this.renderItemRank(item)} </div>
          ) : null}
          <div className={style.tagRight}>{this.quotationLineStatusTableColor(item)}</div>
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
            <span style={{ color: '#FF913C', marginLeft: '5px' }}>
              {numberSeparatorRender(item.totalAmount)}
            </span>
          </div>
          <div className={style.taxRateRight}>
            {!isNil(taxRate)
              ? `${intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率')}:${taxRate}%`
              : null}
          </div>
        </div>
      </div>
    );
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
   * renderFormInfo -  物料明细可编辑行信息加逻辑
   */
  @Bind()
  renderFormInfo() {
    const { modelName = 'supplierQuotation', remote } = this.props;
    const {
      // form = {},
      organizationId,
      customizeForm,
      [modelName]: {
        biddingQuotationLine = {},
        quotationLines = {},
        quotationHeader = {},
        quotationItemDto = {},
      },
    } = this.props;
    const {
      collapseKeys,
      supplierSelectedRowKeys = [],
      currencyPrecision,
      currentRecord,
      caclRule,
      financialPrecision,
    } = this.state;
    // const { tenantId = null } = quotationHeader;
    const biddingLine = biddingQuotationLine;
    // const { getFieldDecorator = (e) => e } = form;
    const bargingFlag =
      !isEmpty(quotationLines.content) &&
      quotationLines.content.some((item) => item.quotationLineStatus === 'BARGAINED')
        ? 1
        : 0;
    const isSubmit = supplierSelectedRowKeys.some((item) => item === biddingLine.quotationLineId);
    const isUnTaxPriceFlag = quotationHeader && quotationHeader.priceTypeCode === 'NET_PRICE';

    const ItemFormProps = {
      quotationHeader,
      organizationId,
      customizeForm,
      custkey: this.custkey,
      quotationItemDto: quotationItemDto || {},
      formLayout,
      currencyPrecision,
      quotationName: this.quotationName,
      quotationLineStatusTableColor: this.quotationLineStatusTableColor,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      handleFloatingWay: this.handleFloatingWay,
      handleQuotationRange: this.handleQuotationRange,
    };

    const QuotationFromProps = {
      remote,
      quotationHeader,
      organizationId,
      customizeForm,
      custkey: this.custkey,
      biddingLine: biddingLine || {},
      currentRecord,
      formLayout,
      bidFlag: this.bidFlag,
      quotationName: this.quotationName,
      isSubmit,
      bargingFlag,
      isUnTaxPriceFlag,
      currencyPrecision,
      onRef: (ref = {}) => {
        this.quotationFormRef = ref || {};
      },
      giveUpQuotationLine: this.giveUpQuotationLine,
      priceValidator: this.priceValidator,
      handleChangeUnitPrice: this.handleChangeUnitPrice,
      handleChangeNetPrice: this.handleChangeNetPrice,
      handleChangeTaxIncludedFlag: this.handleChangeTaxIncludedFlag,
      changeTaxId: this.changeTaxId,
      queryBiddingQuotationLine: this.queryBiddingQuotationLine,
      openLadder: this.openLadder,
      backQuotationLine: this.backQuotationLine,
      saveBiddingOffer: this.saveBiddingOffer,
      caclRule,
      changeQuantity: this.handleChangeQuotationQuantity,
      queryQuotationHeader: this.queryQuotationHeader,
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
                  {intl
                    .get(`ssrc.supplierQuotation.view.message.panel.itemLineInfo`)
                    .d('物品行信息')}
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
            {intl
              .get(`ssrc.supplierQuotation.model.supQuo.commonQuoteInformation`, {
                quotationName: this.quotationName,
              })
              .d('{quotationName}信息')}
          </span>
        </Row>

        <div className={common['padding-16']}>{this.renderQuotationFrom(QuotationFromProps)}</div>
      </div>
    );
  }

  /**
   * 报价表单详情
   * @param {*} QuotationFromProps 组件所需参数
   * @protected 此方法被【】二开，请勿修改、删除此方法名！！！
   */
  renderQuotationFrom(QuotationFromProps) {
    return <QuotationFrom {...QuotationFromProps} />;
  }

  /**
   * 还比价多轮报价历史
   */
  renderHistoryInfo() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { historyColumns, currentRecord = {} } = this.state;
    const { bargainFlag = 0, roundQuotationFlag = 0, roundFlag } = currentRecord;
    const { roundQuotationRankFlag, currentQuotationRound } = quotationHeader;

    const roundColumns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 100,
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
            dataIndex: 'roundRank',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        dataIndex: 'creationDate',
        width: 180,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
            quotationName: this.quotationName,
          })
          .d('{quotationName}人'),
        dataIndex: 'realName',
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
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        dataIndex: 'quotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxQuotationAmount`)
          .d('行金额(不含税)'),
        dataIndex: 'netQuotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentQuotationQuantity`)
          .d('可供数量'),
        dataIndex: 'quotationQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.taxPrice`).d('单价(含税)'),
        dataIndex: 'quotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supplierBidQuery.noTaxPrice`)
          .d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
    ].filter(Boolean); // 多轮报价历史列表字段

    const {
      [modelName]: {
        quotationLineDetail = {},
        quotationLineDetailPagination = {},
        roundQuotationLineDetail = [],
        // roundQuotationLineDetailPagination = {},
      },
    } = this.props;

    const historyTableProps = {
      columns: historyColumns,
      bargainFlag,
      dataSource: quotationLineDetail.content || [],
      pagination: quotationLineDetailPagination,
      rowKey: 'recordId',
      // loading: fetchHistoryLoading,
    };
    const roundTableProps = {
      columns: roundColumns,
      dataSource: roundQuotationLineDetail || [],
      // pagination: roundQuotationLineDetailPagination,
      pagination: false,
      rowKey: uuidv4(),
    };
    return (
      <React.Fragment>
        <div className={style.contentRightStyle}>
          {bargainFlag ? (
            <React.Fragment>
              <Row style={{ fontSize: '15px', marginLeft: '13px', marginTop: '5px' }}>
                <span className={style.labelCol}>
                  {intl.get(`ssrc.supplierQuotation.model.supQuo.history`).d('历史还比价')}
                </span>
              </Row>
              <div
                className={style.historyTable}
                style={{ width: '98%', margin: '10px 0 70px 8px' }}
              >
                <Table {...historyTableProps} />
              </div>
            </React.Fragment>
          ) : null}
          {Number(roundFlag) === 1 && roundQuotationFlag ? (
            <React.Fragment>
              <Row
                style={{
                  fontSize: '15px',
                  marginLeft: '13px',
                  marginTop: '5px',
                }}
              >
                <span className={style.labelCol}>
                  {intl
                    .get(`ssrc.supplierQuotation.model.supQuo.commonRoundHistory`, {
                      quotationName: this.quotationName,
                    })
                    .d('多轮{quotationName}历史')}
                </span>
              </Row>
              <div
                className={style.historyTable}
                style={{ width: '98%', margin: '10px 0 70px 8px' }}
              >
                <Table {...roundTableProps} />
              </div>
            </React.Fragment>
          ) : null}
        </div>
      </React.Fragment>
    );
  }

  @Bind()
  handleInquiryOnRef(ref = {}) {
    this.inquiryRef = ref;
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  async showUploadModal() {
    try {
      await this.queryQuotationHeader();
      this.setState({
        attachmentVisible: true,
      });
    } catch (e) {
      throw e;
    }
  }

  // 导入按钮
  renderImportButton = (options = {}) => {
    const {
      match: {
        path,
        params: { rfxId },
      },
      organizationId,
    } = this.props;
    const { isBatchMaintainSection = false, disabled } = options || {};

    const ImportProps = {
      businessObjectTemplateCode: 'SSRC.RFX_DATA.IMPORT',
      prefixPatch: SRM_SSRC,
      args: {
        tenantId: organizationId,
        quotationHeaderId: rfxId,
        templateCode: 'SSRC.RFX_DATA.IMPORT',
        fromExport: true,
      },
      buttonProps: {
        disabled: isBatchMaintainSection || disabled,
        permissionList: [
          {
            code: `${path}.button.importNew`.toLowerCase(),
            type: 'button',
            meaning: `${
              intl.get('ssrc.supplierQuotation.common.supplierQuotation.new').d('(新)') +
              intl
                .get(`ssrc.supplierQuotation.view.message.title.supplierQuotation`)
                .d('供应商报价') -
              intl.get(`ssrc.supplierQuotation.view.message.button.importQuotation`).d('Excel导入')
            }`,
          },
        ],
        funcType: 'flat',
        className: style.noBtn,
      },
      refreshButton: true,
      buttonText: `${
        intl.get('ssrc.supplierQuotation.common.supplierQuotation.new').d('(新)') +
        intl.get(`ssrc.supplierQuotation.view.message.button.importQuotation`).d('Excel导入')
      }`,
      auto: true,
      successCallBack: this.batchImportOk,
      modalProps: {
        title: intl
          .get(`ssrc.supplierQuotation.view.message.title.supplierQuotation`)
          .d('供应商报价'),
      },
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_DOWNLOAD_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/quotation/lines/new-export?quotationHeaderId=${rfxId}`,
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
    };

    return {
      name: 'excelInfoNew',
      btnComp: CommonImportNew,
      btnProps: {
        name: 'excelInfoNew',
        ...ImportProps,
        disabled: isBatchMaintainSection || disabled,
      },
    };
  };

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
      key: c7nModal.key(),
      bodyStyle: { maxHeight: 'calc(100vh - 2.3rem)' },
      title: intl
        .get(`ssrc.supplierQuotation.view.message.title.commonSupplierQuotation`, {
          quotationName: this.quotationName,
        })
        .d('供应商{quotationName}'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
      // onClose: this.batchImportOk,
      onCancel: this.batchImportOk,
    });
  }

  @Throttle(600)
  @Bind
  batchImportOk() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { biddingQuotationLine = {} },
    } = this.props;
    const { quotationLineId = null, quotationHeaderId } = biddingQuotationLine || {};
    const { inquiryDetail } = this.state;

    this.queryQuotationHeader();
    this.queryQuotationLines();

    if (inquiryDetail) {
      this.queryBiddingQuotationLine({}, { quotationLineIds: quotationLineId });
      this.fetchQuotationItem({ quotationLineId, quotationHeaderId });
    }
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false });
  }

  /**
   * 获取最新的供应商行附件id
   */
  @Bind()
  attachmentMethod(record) {
    let attachmentUuid = null;
    if (record.currentAttachmentUuid) {
      attachmentUuid = record.currentAttachmentUuid;
    }
    if (this.props.form.getFieldValue('currentAttachmentUuid')) {
      attachmentUuid = this.props.form.getFieldValue('currentAttachmentUuid');
    } else {
      attachmentUuid = uuidv4();
    }
    return attachmentUuid;
  }

  /**
   * 保存报价单头附件
   * @param {Object} params - 包含报价单技术附件和商务附件 uuid
   */
  @Bind()
  handleBindOnRef(ref = {}) {
    this.attachmentRef = ref;
  }

  /**
   * 保存头按钮上传附件
   * @param {*} params
   * @protected 此方法被【奥克斯】二开，请勿修改方法名！！！
   */
  @Bind()
  initUpload(params) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      [modelName]: { quotationHeader = {} },
    } = this.props;
    dispatch({
      type: `${modelName}/saveHeaderAttachment`,
      payload: {
        objectVersionNumber: quotationHeader.objectVersionNumber,
        quotationHeaderId: quotationHeader.quotationHeaderId,
        currentBusinessAttachmentUuid: params.businessAttachmentUuid,
        currentTechAttachmentUuid: params.techAttachmentUuid,
        currentBargainTechAttachmentUuid: params.bargainTechAttachmentUuid,
        currentBargainBusinessAttachmentUuid: params.bargainBusinessAttachmentUuid,
        currentRoundTechAttachmentUuid: params.roundTechAttachmentUuid,
        currentRoundBusinessAttachmentUuid: params.roundBusinessAttachmentUuid,
      },
    }).then?.((res) => {
      if (res) {
        notification.success();
        this.queryQuotationHeader();
      }
    });
  }

  /**
   * @param {Object} AttachmentsProps
   * @protected 此方法被【奥克斯】二开，请勿修改方法名！！！
   */
  renderQuoteAttachment(AttachmentsProps) {
    const { remote, modelName = 'supplierQuotation' } = this.props;
    return remote ? (
      remote.render(
        'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_RENDER_QUOTA_ATTACHMENT',
        <QuoteAttachment {...AttachmentsProps} />,
        {
          ...AttachmentsProps,
          queryQuotationHeader: this.queryQuotationHeader,
          modelName,
        }
      )
    ) : (
      <QuoteAttachment {...AttachmentsProps} />
    );
  }

  /**
   * 点击当前报价单行时，触发查询
   * @param {Object} record - 当前点击的行信息
   */
  @Bind()
  onRow(record) {
    this.setState({
      quotationLineId: record.quotationLineId,
    });
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
   * 供应商行-选中行
   */
  @Bind()
  changeSupplierSelectedRows(selectedRowKeys = []) {
    this.setState({
      supplierSelectedRowKeys: selectedRowKeys,
    });
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

  // 表单视图，计算左侧列表金额
  updateDetailViewTotalAmount = (data = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      [modelName]: { quotationLines = {} },
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
        type: `${modelName}/updateState`,
        payload: {
          quotationLines: {
            content: newLines || [],
          },
        },
      });
    }
  };

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
      COMMONS.each = priceBatchQuantity;
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
      // const taxRate = this.props.form.getFieldValue('taxRate') || 0;
      // const currentQuotationPrice = this.props.form.getFieldValue('taxIncludedFlag')
      //   ? math.toFixed(math.multipliedBy(value, math.plus(1, math.div(taxRate, 100))), 10)
      //   : value; // 优先根据是否含税, 否: =》单价; 是: =》公式
      // const totalAmount = math.multipliedBy(currentQuotationPrice, record.currentQuotationQuantity); // 行金额
      // const netAmount = math.multipliedBy(value, record.currentQuotationQuantity); // 行金额未税
      // this.props.form.setFieldsValue({
      //   currentQuotationPrice: isExist
      //     ? parseAmount(currentQuotationPrice, currencyPrecision)
      //     : null,
      //   totalAmount: isExist ? totalAmount : null,
      //   netAmount: isExist ? netAmount : null,
      // });
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
      COMMONS.each = priceBatchQuantity;
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

  /**
   * 是否含税标识改变
   * */
  @Bind()
  handleChangeTaxIncludedFlag(result = {}, record = {}) {
    const { modelName = 'supplierQuotation' } = this.props;
    const { [modelName]: { biddingQuotationLine = {} } = {} } = this.props;
    const form = record.$form;

    if (form) {
      const {
        $form: { setFieldsValue = () => {} },
      } = record;
      const {
        target: { checked = 0 },
      } = result;
      if (!checked) {
        setFieldsValue({
          taxId: null,
          taxRate: null,
          taxRateType: null,
        });
      }
      record.taxRateType = null;
    } else {
      const quotationForm = this.getQuotationFormRefForm();
      if (!quotationForm) {
        return;
      }
      const { setFieldsValue = () => {} } = quotationForm || {};
      const {
        target: { checked = 0 },
      } = result;
      if (!checked) {
        setFieldsValue({
          taxId: null,
          taxRate: null,
          taxRateType: null,
        });
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
      // const isExist = netPrice !== '' && netPrice !== undefined && netPrice !== null;
      // const totalAmount = math.multipliedBy(form.getFieldValue('currentQuotationPrice'), val); // 行金额
      // const netAmount = math.multipliedBy(netPrice, val); // 行金额未税
      form.setFieldsValue({
        currentQuotationQuantity: val,
        // totalAmount: isExist ? totalAmount : null,
        // netAmount: isExist ? netAmount : null,
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
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
      organizationId,
      dispatch,
    } = this.props;
    const { supplierSelectedRowKeys = [] } = this.state;
    const keys = supplierSelectedRowKeys;
    const itemLineForm = this.ItemLineTable.props.form;
    let data = itemLineForm.getFieldsValue();

    itemLineForm.validateFields((err, fieldsValue) => {
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
        currentExpiryDateTo: dateFormate(endDate, DATETIME_MAX),
        currentPromisedDate: dateFormate(fieldsValue?.currentPromisedDate, DEFAULT_DATETIME_FORMAT),
      };

      data = {
        ...data,
        ...values,
      };
      dispatch({
        type: `${modelName}/batchMaintainItemQuotationLine`,
        payload: {
          rfxHeaderId: quotationHeader.rfxHeaderId,
          organizationId,
          rfxQuotationLine: data,
          quotationLineIds: keys,
          sourceFunctionCode: 'SUPPLIER_QUOTATION',
          customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION.BATCH_MAINTAIN_MATERIAL',
        },
      }).then((res) => {
        if (!res) {
          this.setState({
            batchEditLineLockLoading: false,
          });
          return;
        }
        notification.success();
        this.changeSupplierSelectedRows();
        this.cancelBatchMaintainItemLine(); // 点击批量维护时候会保存全页面，所以需要刷新头行数据
      });
    });
  }

  // 批量维护取消
  @Bind()
  cancelBatchMaintainItemLine() {
    this.setState({
      batchMaintainItemLineVisible: false,
      batchEditLineLockLoading: false,
    });
    this.resetBatchMaintainItemLine();
    this.querySupplier();
  }

  // 批量维护重置
  @Bind()
  resetBatchMaintainItemLine() {
    const itemLineForm = this.ItemLineTable.props.form;
    itemLineForm.resetFields();
  }

  // // 快速报价
  // @Bind()
  // handleMenuClick(e) {
  //   if (e.key === 'referencePrice') {
  //     this.submitReferencePrice();
  //   } else {
  //     this.setState({
  //       quotationVisible: true,
  //     });
  //   }
  // }

  // 关闭快速报价
  @Bind()
  handleCancel() {
    this.setState({
      quotationVisible: false,
    });
  }

  // 快速报价确认
  @Bind()
  handleOk() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      form = {},
      [modelName]: { quotationHeader = {} },
    } = this.props;
    // 设置整单升降价
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          quotationVisible: false,
        });
        dispatch({
          type: `${modelName}/updateLineData`,
          payload: {
            rfxQuotationHeader: { ...quotationHeader, ...filterNullValueObject(values) },
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.queryQuotationLines();
          }
        });
      }
    });
  }

  /**
   * 打印
   */
  @Debounce(1000)
  @Bind()
  print(flag) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      dispatch,
      form,
      [modelName]: { quotationLines = {}, quotationHeader = {} },
      organizationId,
    } = this.props;
    const { getFieldValue } = form;

    let fieldsErr = false;
    const saveData = quotationLines.content ? quotationLines.content : [];
    saveData.map((lineList) => {
      let obj = {};
      if (lineList?.$form) {
        const abandonedFlag = lineList.$form?.getFieldValue?.('abandonedFlag');
        if (abandonedFlag) {
          return;
        }

        lineList.$form.validateFields((err, values) => {
          if (err) {
            fieldsErr = true;
            return;
          }
          const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = values;
          // 校验未通过/通过
          obj = {
            ...filterNullValueObject(values),
            currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
            currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MAX),
            currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
          };
        });
      } else {
        const { currentExpiryDateFrom, currentExpiryDateTo, currentPromisedDate } = lineList;
        obj = {
          ...filterNullValueObject(lineList),
          currentExpiryDateFrom: dateFormate(currentExpiryDateFrom, DATETIME_MIN),
          currentExpiryDateTo: dateFormate(currentExpiryDateTo, DATETIME_MAX),
          currentPromisedDate: dateFormate(currentPromisedDate, DATETIME_MIN),
        };
      }
      return {
        ...lineList,
        ...obj,
        taxRate: obj.taxRate || obj.taxRate === 0 ? obj.taxRate : lineList.taxRate,
        currencyCode: getFieldValue('currencyCode'),
      };
    });

    form.validateFields((err) => {
      if (!err && !fieldsErr) {
        dispatch({
          type: `${modelName}/queryPrint`,
          payload: { quotationHeaderId: quotationHeader.quotationHeaderId, organizationId, flag },
        }).then((res) => {
          if (res) {
            if (flag) {
              const file = new Blob([res], { type: 'application/pdf' });
              const fileURL = URL.createObjectURL(file);
              const printWindow = window.open(fileURL);
              if (printWindow) {
                printWindow.print();
              }
            } else {
              const tempLink = document.createElement('a');
              tempLink.style.display = 'none';
              tempLink.href = res;
              tempLink.setAttribute(
                'download',
                decodeURIComponent(
                  `${intl
                    .get(`ssrc.supplierQuotation.view.message.quotationPrint`)
                    .d('报价打印')}.xls`
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
          }
        });
      } else {
        // Modal.confirm({
        //   title: intl.get('ssrc.supplierQuotation.view.message.pleaseSave').d('请完善必填信息保存后再打印'),
        //   // onOk: () => {
        //   //   this.saveAllBiddingOffer();
        //   // },
        // });
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.view.message.pleaseSave')
            .d('请完善必填信息保存后再打印'),
        });
      }
    });
  }

  /**
   * 附件上传，[艾为、凯撒] 重写二开, 谨慎修改!!!
   * @protected
   */
  @Bind()
  uploadFileBtn(isBatchMaintainSection, options = {}) {
    const { disabled } = options || {};

    return {
      name: 'attachmentUploading',
      btnProps: {
        onClick: this.showUploadModal,
        disabled: isBatchMaintainSection || disabled,
        icon: 'upload',
      },
      child: intl.get(`ssrc.supplierQuotation.view.message.button.uploadFile`).d('附件上传'),
    };
  }

  abandonedForm = null;

  // 整单放弃逻辑
  @Throttle(800)
  handleWholeAbandon = (otherProps = {}) => {
    this.wholeAbadonDS = new DataSet(wholeAbadonDataSet());

    const modalProps = {
      wholeAbadonDS: this.wholeAbadonDS,
    };

    const modalKey = c7nModal.key();
    this.abandonedForm = c7nModal.open({
      drawer: true,
      key: modalKey,
      closable: true,
      style: {
        width: '400px',
      },
      destroyOnClose: true,
      title: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃') + this.quotationName,
      children: <WholeAbandonForm {...modalProps} />,
      onOk: () => this.wholeAbandonQuotation(otherProps),
      onClose: () => {
        this.wholeAbadonDS.loadData();
      },
    });
  };

  // 唱标查询
  @Throttle(1000)
  handleBidAnnouncement = () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { rfxHeaderId, supplierCompanyId } = quotationHeader || {};
    openBidAnnouncementQueryModal({
      doubleUnitFlag: false,
      bidFlag: this.bidFlag,
      rfxHeaderId,
      supplierCompanyId,
    });
  };

  // 整单放弃
  @Throttle(1000)
  wholeAbandonQuotation = async (otherProps = {}) => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
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
        customizeUnitCode: `SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE,SSRC.${this.custkey}SUPPLIER_QUOTATION.LINE_FORM,SSRC.${this.custkey}SUPPLIER_QUOTATION.ITEM,SSRC.${this.custkey}SUPPLIER_QUOTATION.BASE_FORM`,
      },
    };

    if (from === 'SUBMIT_WARNING_ALL_LINES_ABANDONED') {
      // 线下整单触发的提交
      const SubmitOptions = { outData: abandonedData, outPassFlag: 1, from };
      if (inquiryDetail) {
        this.submitDetailBiddingOfferSingle(SubmitOptions);
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

  // 判断整单放弃 @return boolean
  judgeWholeAbandon = () => {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationHeader = {} },
    } = this.props;
    const { supplierStatus } = quotationHeader || {};
    const wholeAbandonFlag =
      supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
    return wholeAbandonFlag;
  };

  /**
   * 提取头部按钮
   */
  renderHeaderButtons() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { quotationLines = {}, quotationHeader = {} },
      allLoading,
      organizationId,
      match: {
        path,
        params: { rfxId },
      },
      queryPrintLoading, // 打印按钮loading
      remote,
    } = this.props;
    const {
      inquiryTableReadOnly,
      isBatchMaintainSection = false,
      operationLoading = false,
      supplierSelectedRowKeys = [],
    } = this.state;

    const isBidSectionData = this.isBidSectionData();
    const {
      sealedQuotationFlag = 0,
      continuousQuotationFlag = 0,
      quotationStatus = null,
      needBidAnnouncement,
      // supplierStatus,
      // currentQuotationRound,
      quotationHeaderId = null,
    } = quotationHeader || {};

    const bargingFlag =
      !isEmpty(quotationLines.content) &&
      quotationLines.content.some((item) => item.bargainFlag === 1)
        ? 1
        : 0;
    const wholeAbandonFlag = this.judgeWholeAbandon();

    const otherProps = {
      quotationHeader,
      operationLoading,
      successCallBack: this.batchImportOk,
      toggleOperationLoading: this.toggleOperationLoading,
    };

    let buttons = [
      {
        name: 'submit',
        btnProps: {
          // disabled: wholeAbandonFlag, TEST
          onClick: inquiryTableReadOnly
            ? this.submitAllBiddingOffer
            : () => this.submitDetailBiddingOffer(1),
          loading: allLoading || operationLoading,
          type: 'primary',
          icon: 'check',
          disabled: wholeAbandonFlag,
        },
        child:
          isBidSectionData || !inquiryTableReadOnly || !bargingFlag
            ? intl.get('hzero.common.button.submit').d('提交')
            : isEmpty(supplierSelectedRowKeys)
            ? intl.get('ssrc.common.button.submitAllLines').d('提交全部行')
            : intl.get('ssrc.common.button.submitSelectedLines').d('提交勾选行'),
      },
      inquiryTableReadOnly && {
        name: 'save',
        btnProps: {
          onClick: () => this.saveAllBiddingOffer(),
          loading: allLoading || operationLoading,
          disabled: isBatchMaintainSection || wholeAbandonFlag,
          icon: 'save',
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      this.uploadFileBtn(isBatchMaintainSection, { disabled: wholeAbandonFlag }),
      isBidSectionData
        ? {
            name: 'select',
            btnProps: {
              disabled: wholeAbandonFlag,
              onClick: this.selectBidSection,
            },
            child: (
              <Fragment>
                <Iconfont type="main-delete" style={{ marginRight: '8px' }} />
                {!isBatchMaintainSection
                  ? intl.get(`ssrc.common.view.button.selectBidSectionBtn`).d('选择标段')
                  : intl.get(`ssrc.common.view.button.cancelSelect`).d('取消选择')}
              </Fragment>
            ),
          }
        : null,
      {
        name: 'exportGroup',
        group: true,
        // hidden: wholeAbandonFlag,
        child: (
          <Button disabled={wholeAbandonFlag}>
            <Icon type="ellipsis" />
            {intl.get('ssrc.common.view.button.exportGroup').d('导入导出')}
          </Button>
        ),
        children: [
          !isBatchMaintainSection
            ? {
                name: 'excelExport',
                btnComp: ExcelExport,
                btnProps: {
                  className: style.noBtn,
                  requestUrl: `/ssrc/v1/${organizationId}/rfx/quotation/export`,
                  buttonText: intl.get(`ssrc.common.button.batchExport`).d('导出'),
                  queryParams: this.handleGetFormValue(),
                  otherButtonProps: {
                    // type: 'default',
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
                hidden: wholeAbandonFlag,
                btnProps: {
                  templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_EXPORT',
                  className: style.noBtn,
                  requestUrl: `/ssrc/v1/${organizationId}/rfx/quotation/new-export`,
                  buttonText: `${
                    intl.get('ssrc.supplierQuotation.common.supplierQuotation.new').d('(新)') +
                    intl.get(`ssrc.common.button.batchExport`).d('导出')
                  }`,
                  queryParams: this.handleGetFormValue(),
                  otherButtonProps: {
                    funcType: 'flat',
                    className: style.noBtn,
                    // disabled: wholeAbandonFlag,
                    permissionList: [
                      {
                        code: `${path}.button.exprotnew`.toLowerCase(),
                        type: 'button',
                        meaning: `${
                          intl
                            .get('ssrc.supplierQuotation.common.supplierQuotation.new')
                            .d('(新)') +
                          intl
                            .get(`ssrc.supplierQuotation.view.message.title.supplierQuotation`)
                            .d('供应商报价') -
                          intl.get(`ssrc.common.button.batchExport`).d('导出')
                        }`,
                      },
                    ],
                  },
                },
              }
            : null,
          !isBatchMaintainSection
            ? {
                name: 'supplierQuotation',
                btnComp: QuotationDetailImport,
                btnProps: {
                  quotationHeaderId: rfxId,
                  onOk: () => {
                    this.querySupplier();
                  },
                  onClose: () => {
                    this.querySupplier();
                  },
                  onCancel: () => {
                    this.querySupplier();
                  },
                  isH0Btn: true,
                  className: style.noBtn,
                  isDisabled: wholeAbandonFlag,
                  pageSource: PageSourceSymbol.oldSupplierQuotation,
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
          !wholeAbandonFlag
            ? this.renderImportButton({ isBatchMaintainSection, disabled: wholeAbandonFlag })
            : null,
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
        ].filter(Boolean),
      },
      {
        name: 'more',
        group: true,
        // hidden: wholeAbandonFlag,
        child: (
          <Button disabled={wholeAbandonFlag}>
            <Icon type="ellipsis" />
            {intl.get('hzero.common.basicLayout.viewMore').d('查看更多')}
          </Button>
        ),
        children: [
          {
            name: 'offerToPrint',
            btnComp: PermissionButton,
            btnProps: {
              icon: 'book',
              type: 'default',
              onClick: () => this.print(false),
              loading: queryPrintLoading,
              disabled: isBidSectionData,
              className: style.noBtn,
              permissionList: [
                {
                  code: `srm.supplier.quotation.quotation-print.button`,
                  type: 'button',
                  meaning:
                    intl
                      .get(`ssrc.supplierQuotation.view.message.title.commonSupplierQuotation`, {
                        quotationName: this.quotationName,
                      })
                      .d('供应商{quotationName}') -
                    intl
                      .get(`ssrc.supplierQuotation.view.message.button.quotationPrint`)
                      .d('报价打印'),
                },
              ],
            },
            child: intl
              .get(`ssrc.supplierQuotation.view.message.button.quotationPrint`)
              .d('报价打印'),
          },
          {
            name: 'print',
            child: (
              <Fragment>
                <C7NIcon type="print" style={{ fontSize: '12px' }} />
                {intl.get(`ssrc.supplierQuotation.view.message.button.print`).d('打印')}
              </Fragment>
            ),
            btnProps: {
              disabled: isBatchMaintainSection,
              onClick: () => this.print(true),
            },
          },
          !sealedQuotationFlag && {
            name: 'referencePrice',
            child: (
              <Fragment>
                <C7NIcon type="root" style={{ fontSize: '12px' }} />
                {intl
                  .get('ssrc.supplierQuotation.view.message.button.referencePrice')
                  .d('引用参考价')}
              </Fragment>
            ),
            btnProps: {
              onClick: this.submitReferencePrice,
              disabled: isBatchMaintainSection || wholeAbandonFlag,
            },
          },
          {
            name: 'wholeOrderLift',
            child: (
              <Fragment>
                <C7NIcon type="application_allocation" style={{ fontSize: '12px' }} />
                {intl
                  .get('ssrc.supplierQuotation.view.message.button.wholeOrderLift')
                  .d('整单升降价')}
              </Fragment>
            ),
            btnProps: {
              icon: 'application_allocation',
              onClick: this.handleWholeOrderLift,
              disabled:
                !(continuousQuotationFlag === 1 && quotationStatus !== 'NEW') ||
                isBatchMaintainSection ||
                wholeAbandonFlag,
            },
          },
          {
            name: 'wholeAbandon',
            hidden: isBidSectionData || bargingFlag,
            child: (
              <Fragment>
                <C7NIcon type="delete_forever" style={{ fontSize: '12px' }} />
                {intl.get(`ssrc.supplierQuotation.view.message.wholeGiveUp`).d('整单放弃')}
              </Fragment>
            ),
            btnProps: {
              onClick: this.handleWholeAbandon,
              loading: operationLoading,
              disabled: !quotationStatus || !rfxId || wholeAbandonFlag,
            },
          },
          needBidAnnouncement
            ? {
                name: 'bidAnnouncementQuery',
                child: () => (
                  <Fragment>
                    <C7NIcon type="volume_up-o" style={{ fontSize: '12px' }} />
                    {intl.get(`ssrc.common.model.common.bidAnnouncementQuery`).d('唱标查询')}
                  </Fragment>
                ),
                btnProps: {
                  onClick: this.handleBidAnnouncement,
                },
              }
            : null,
        ].filter(Boolean),
      },
    ].filter(Boolean);

    if (!quotationHeaderId) {
      buttons = [];
    }

    return (
      <DynamicButtons
        buttons={
          remote
            ? remote.process(
                'SSRC_SUPPLIER_QUOTATION_INQUIRY_PRICE_PROCESS_HEADER_BUTTONS',
                buttons,
                otherProps
              )
            : buttons
        }
      />
    );
  }

  @Bind()
  renderHeader() {
    const { customizeBtnGroup = () => {} } = this.props;

    return (
      <Header
        backPath={this.getBackPath()}
        title={intl
          .get(`ssrc.supplierQuotation.view.message.title.commonSupplierQuotation`, {
            quotationName: this.quotationName,
          })
          .d('供应商{quotationName}')}
      >
        {customizeBtnGroup(
          {
            code: `SSRC.${this.custkey}SUPPLIER_QUOTATION.HEADER_BUTTONS`,
            pro: true,
          },
          this.renderHeaderButtons()
        )}
      </Header>
    );
  }

  // 整单升降价
  @Bind()
  handleWholeOrderLift() {
    this.setState({
      quotationVisible: true,
    });
  }

  // /**
  //  * 快速报价下拉列表
  //  * cux
  //  * */
  // @Bind()
  // renderRapidQuotationMenuListButton() {
  //   const {
  //     [modelName]: { quotationHeader = {} },
  //   } = this.props;
  //   const {
  //     sealedQuotationFlag = 0,
  //     continuousQuotationFlag = 0,
  //     quotationStatus = null,
  //   } = quotationHeader;

  //   const MENU = (
  //     <Menu>
  //       {sealedQuotationFlag ? null : (
  //         <Menu.Item key="referencePrice" onClick={() => this.submitReferencePrice()}>
  //           {intl.get('ssrc.supplierQuotation.view.message.button.referencePrice').d('引用参考价')}
  //         </Menu.Item>
  //       )}
  //       <Menu.Item
  //         key="wholeOrderLift"
  //         disabled={!(continuousQuotationFlag === 1 && quotationStatus !== 'NEW')}
  //         onClick={() => this.handleWholeOrderLift()}
  //       >
  //         {intl.get('ssrc.supplierQuotation.view.message.button.wholeOrderLift').d('整单升降价')}
  //       </Menu.Item>
  //     </Menu>
  //   );
  //   return MENU;
  // }

  // /**
  //  * 快速报价按钮
  //  * cux
  //  * */
  // renderRapidQuotationDropButton = () => {
  //   const { isBatchMaintainSection = false } = this.state;
  //   const MENU = this.renderRapidQuotationMenuListButton();

  //   return {
  //     name: 'rapidQuotation',
  //     btnComp: RapidQuotation,
  //     btnProps: {
  //       overlay: MENU,
  //       disabled: isBatchMaintainSection,
  //       quotationName: this.quotationName,
  //     },
  //   };
  // };

  batchEmptySectionRef = (ref = {}) => {
    this.BatchEmptySectionRef = ref;
  };

  // 批量操作标段不再提示modal ok
  batchOperateSections = async () => {
    const { SectionRef, BatchEmptySectionRef = {} } = this;
    const { userConfig = {}, inquiryDetail = false } = this.state;
    if (isEmpty(BatchEmptySectionRef) || isEmpty(SectionRef)) {
      return;
    }

    try {
      await this.BatchEmptySectionRef.saveUserConfigBatch({
        configKey: 'sectionSupplierQuotation',
        configDesc: 'sectionSupplierParticipateBatchMaintain',
        userId: getCurrentUserId(),
        enabledFlag: 1,
        ...userConfig,
      });

      // 保存成功，重新查询配置
      this.fetchUserConfig();

      if (inquiryDetail) {
        this.submitDetailBiddingOfferSingle();
      } else {
        this.handleSubmit();
      }
    } catch (e) {
      throw e;
    } finally {
      this.batchOperateSectionsCancel();
      this.resetSectionChecked();
      // this.querySupplier();
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

  // 是否显示批量操作按钮（三生制药二开导出调用）
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
    // this.handleSubmit();
    this.handleIntegrationSectionBatchSubmit({ weakCtrlConfirmFlag: 1 });
    this.handleCancellSectionOperatePrompt();
  };

  // 分标段提示弹框-cancel
  handleCancellSectionOperatePrompt = () => {
    this.setState({
      operateSectionData: [],
      operateSectionPromptFlag: false,
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

  // 是否可以切标段-loading
  couldSectionSwitch = () => {
    const { allLoading = false } = this.props;
    const { operationLoading = false } = this.state;

    return allLoading || operationLoading;
  };

  // 切换标段定位到当前路由
  locatedCurrentUrl = (data = {}) => {
    const {
      history,
      location: { search },
    } = this.props;
    const { quotationHeaderId = null, projectLineSectionId = null } = data;
    if (!quotationHeaderId) {
      return;
    }
    this.setState({
      rfxId: quotationHeaderId,
    });

    let newSearch = queryString.parse(search.substr(1));
    newSearch = queryString.stringify({
      ...newSearch,
      projectLineSectionId,
    });

    history.push({
      pathname: this.isPubNowPage()
        ? `/pub/ssrc/supplier-quotation/inquiry-price/${quotationHeaderId}`
        : `${this.activeTabKey}/inquiry-price/${quotationHeaderId}`,
      search: newSearch,
    });
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
   * 此方法被 [华友钴业] 二开, 严禁他人, 删除/修改 此方法名
   * @protected
   */
  renderInquiryHeader() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: { quotationHeader = {}, roundQuotationInfo = [] },
      customizeForm = noop,
      organizationId,
      customizeTable = noop,
      remote,
    } = this.props;

    const headerProps = {
      form,
      remote,
      customizeForm,
      customizeTable,
      organizationId,
      roundQuotationInfo,
      custkey: this.custkey,
      quotationName: this.quotationName,
      sectionAndDataFlag: this.isBidSectionData,
      sourceCategoryName: this.sourceCategoryName,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      changeCurrencyCode: this.changeCurrencyCode,
    };
    return <InquiryHeader headerInfo={quotationHeader} {...headerProps} />;
  }

  /**
   * 报价行渲染
   * @param {*} itemLineProps
   * @protected 此方法被【广东高景、五粮浓香、奥克斯】等项目二开，请勿修改此方法名！！！
   */
  renderItemLine(itemLineProps) {
    return <ItemLine {...itemLineProps} />;
  }

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
          closeText={<Icon type="close" style={{ color: '#3095f2' }} />}
        />
      );
    }
    return render;
  }

  // 判断是否/pub 页面
  isPubNowPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub'); // /pub/ssrc/inquiry-hall/rfx-detail/:rfxId
    return IsPublic;
  };

  /**
   * 获取上传附件参数
   * @param {Object}
   */
  getAttachmentsProps({ quotationHeader }) {
    const { bucketDirectory } = this.state;
    const {
      currentBusinessAttachmentUuid, // 当前报价单商务附件 uuid
      businessAttachmentUuid, // 报价单商务附件 uuid
      currentTechAttachmentUuid, // 当前报价单技术附件 uuid
      techAttachmentUuid, // 报价单技术附件 uuid
      currentBargainTechAttachmentUuid,
      bargainTechAttachmentUuid,
      currentBargainBusinessAttachmentUuid,
      bargainBusinessAttachmentUuid,
      currentRoundTechAttachmentUuid,
      roundTechAttachmentUuid,
      currentRoundBusinessAttachmentUuid,
      roundBusinessAttachmentUuid,
      bargainFlag = 0,
      currentQuotationRound, // 当前报价轮次
      roundHeaderStatus,
    } = quotationHeader;

    // 是否是多轮报价 ps: 放在这里传进去，不改变组件内层，兼容二开
    // 多轮指的是手动多轮，不包含自动多轮
    const roundFlag =
      (roundHeaderStatus === 'ROUND_CHECKING' || roundHeaderStatus === 'ROUND_SCORING') &&
      currentQuotationRound &&
      currentQuotationRound > 1
        ? 1
        : 0;

    return {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      roundFlag,
      bargainFlag,
      quotationHeader,
      // tenantId: organizationId,
      initUpload: this.initUpload,
      viewOnly: false,
      // 只读的话显示提交时的附件 而不是修改后的当前有效附件
      businessUuid:
        Number(roundFlag) === 1 || Number(bargainFlag) === 1
          ? businessAttachmentUuid
          : currentBusinessAttachmentUuid,
      techUuid:
        Number(roundFlag) === 1 || Number(bargainFlag) === 1
          ? techAttachmentUuid
          : currentTechAttachmentUuid,
      bargainBusUuid:
        Number(bargainFlag) === 0
          ? bargainBusinessAttachmentUuid
          : currentBargainBusinessAttachmentUuid, // 议价中商务附件
      bargainTechUuid:
        Number(bargainFlag) === 0 ? bargainTechAttachmentUuid : currentBargainTechAttachmentUuid, // 议价中技术附件
      roundBusUuid:
        Number(roundFlag) === 0 ? roundBusinessAttachmentUuid : currentRoundBusinessAttachmentUuid, // 多轮报价商务附件
      roundTechUuid:
        Number(roundFlag) === 0 ? roundTechAttachmentUuid : currentRoundTechAttachmentUuid, // 多轮报价技术附件
      onRef: this.handleBindOnRef,
      ChunkUploadProps,
    };
  }

  /**
   * 弹框关闭后回调，[艾为] 重写二开, 谨慎修改!!!
   * @protected
   */
  handleClose = () => {
    return null;
  };

  render() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      form,
      [modelName]: {
        quotationHeader = {},
        quotationLines = {}, // 供应商报价行信息
        quotationLinePagination = {},
        fetchLadderList = [],
        biddingQuotationLine = {},
      }, // 供应商报价行查询分页信息,
      match: { params },
      organizationId,
      allLoading = false,
      fetchListLoading = false,
      fetchQuestionLineLoading,
      fetchLadderListLoading,
      saveLadderListLoading,
      deleteLadderQuotLoading,
      validateLadderLoading,
      queryQuotationHeaderLoading = false,
      saveQuotationLinesLoading = false,
      customizeTable = noop,
      customizeForm,
      sourceKey,
      remote,
    } = this.props;
    const {
      attachmentVisible,
      inquiryTableReadOnly, // 列表只读列
      inquiryDetail, // 详情
      ladderVisible,
      ladderListHeaderInfo = {},
      ladderLevelSelectedRowKeys = [],
      supplierSelectedRowKeys = [],
      roundFlag = null,
      batchMaintainItemLineVisible = false,
      quotationVisible = false,
      isBatchMaintainSection = false,
      batchEmptySelectSectionFlag = false,
      operateSectionData = [],
      operateSectionPromptFlag = true,
      operationLoading = false,
      currencyPrecision,
      batchEditLineLockLoading,
      caclRule,
    } = this.state;
    const { rfxId } = params;
    const sectionFlag = this.isBidSectionData();

    const ladderLevelRowSelection = {
      selectedRowKeys: ladderLevelSelectedRowKeys,
      onChange: this.handleLadderLevelRowSelectChange,
    };

    // 报价单头附件列表
    const AttachmentsProps = this.getAttachmentsProps({ quotationHeader });
    const isUnTaxPriceFlag = quotationHeader && quotationHeader.priceTypeCode === 'NET_PRICE';
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
      saveLadderListLoading,
      deleteLadderQuotLoading,
      validateLadderLoading, // 保存前校验
      visible: ladderVisible,
      hideModal: this.hideLadderRecord,
      ladderLevelData: fetchLadderList,
      // saveData: this.haeSaveData,
      onSaveLadder: this.validateLadderQuotation,
      onCreateLadder: this.createLadderQuot,
      onDeleteLadder: this.deleteLadderQuot,
    };

    const bargingFlag =
      !isEmpty(quotationLines.content) &&
      quotationLines.content.some((item) => item.bargainFlag === 1)
        ? 1
        : 0;
    const supplierRowSelection = bargingFlag
      ? {
          selectedRowKeys: supplierSelectedRowKeys,
          onChange: this.changeSupplierSelectedRows,
          getCheckboxProps: (record) => ({
            disabled:
              (record.quotationLineStatus !== 'BARGAINED' &&
                !quotationHeader.continuousQuotationFlag) ||
              (record.bargainStatus === 'BARGAINING_ONLINE' && record.bargainFlag === 0) ||
              record.eliminateRoundNumber ||
              (record.$form ? record?.$form?.getFieldValue('abandonedFlag') : record.abandonedFlag),
            defaultChecked: sectionFlag && record.actionSectionSelectedFlag,
          }),
        }
      : {
          selectedRowKeys: supplierSelectedRowKeys,
          onChange: this.changeSupplierSelectedRows,
          getCheckboxProps: (record) => ({
            disabled:
              (!record.continuousQuotationFlag && record.quotationLineStatus === 'SUBMITTED') ||
              (record.$form
                ? record?.$form?.getFieldValue('abandonedFlag')
                : record.abandonedFlag) ||
              record.eliminateRoundNumber,
          }),
        };

    // 报价明细
    const itemLineProps = {
      remote,
      sourceKey,
      bidFlag: this.bidFlag,
      currencyPrecision,
      custkey: this.custkey,
      quotationName: this.quotationName,
      documentTypeName: this.documentTypeName,
      quotationHeader,
      bargingFlag,
      supplierSelectedRowKeys,
      organizationId,
      customizeForm,
      customizeTable,
      fetchListLoading,
      quotationLines,
      quotationLinePagination,
      isBatchMaintainSection,
      batchEditLineLockLoading, // 批量编辑loading
      handleTableChange: this.handleTableChange,
      onRow: this.onRow,
      caclRule,
      supplierRowSelection,
      onVisibleChange: this.onVisibleChange,
      renderHistoryTable: this.renderHistoryTable,
      openTableRow: this.openTableRow,
      handleFloatingWay: this.handleFloatingWay,
      handleQuotationRange: this.handleQuotationRange,
      changeTaxId: this.changeTaxId,
      showQuotationDetail: this.showQuotationDetail,
      openLadder: this.openLadder,
      afterOpenUploadModal: this.afterOpenUploadModal,
      uploadSuccess: this.uploadSuccess,
      fetchHistoryline: this.fetchHistoryline,
      roundFlag,
      hasChangeData: this.hasChangeData,
      onChangeUnitPrice: this.handleChangeUnitPrice,
      handleChangeNetPrice: this.handleChangeNetPrice,
      onChangeTaxIncludedFlag: this.handleChangeTaxIncludedFlag,
      giveUpQuotationLine: this.giveUpQuotationLine,
      changeQuantity: this.handleChangeQuotationQuantity,
      onRef: this.itemLineRef,
      batchMaintainItemLineVisible,
      startBatchMaintainItemLine: this.startBatchMaintainItemLine,
      cancelBatchMaintainItemLine: this.cancelBatchMaintainItemLine,
      saveBatchMaintainItemLine: this.saveBatchMaintainItemLine,
      resetBatchMaintainItemLine: this.resetBatchMaintainItemLine,
      currencyCode: form.getFieldValue('currencyCode'),
      onRefreshQuotationLines: this.queryQuotationLines, // 刷新报价行 - 不能删掉 有二开在使用
      onSaveAllQutationData: this.saveAllBiddingOffer, // 报价明细保存或取消后保存头行数据（解决用户未保存数据点报价明细后数据被清空）
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      onRefreshQuotationHeader: this.queryQuotationHeader,
    };

    const BidSectionFlag = this.getBidSectionFlag(); // 是否分标段

    const SectionPanelProps = {
      bidFlag: this.bidFlag,
      parentPage: {
        name: 'supplierQuotation',
        queryParams: {
          rfxHeaderId: rfxId,
        },
      },
      locatedCurrentUrl: this.locatedCurrentUrl,
      couldSectionSwitch: this.couldSectionSwitch,
      operationLoading: operationLoading || allLoading,
      paramKeys: ['quotationHeaderId'],
      projectLineSectionId: this.getRouterSearch('projectLineSectionId'),
      queryMain: this.querySupplier,
      beforeOpenSection: this.handleSwitchSectionBefore,
      isSection: BidSectionFlag,
      isBatchMaintainSection,
      toggleOperationLoading: this.toggleOperationLoading,
      sectionAlertFlag: sectionFlag,
    };

    // 批量处理标段时候未勾选标段数据提示框
    const BatchProps = {
      parentPage: {
        name: 'supplierQuotation',
        queryParams: {
          // sectionBatchMaintainType: 'QUOTATION',
          rfxHeaderId: rfxId,
        },
      },
      visible: batchEmptySelectSectionFlag,
      handleOk: this.batchOperateSections,
      handleCancel: this.batchOperateSectionsCancel,
      onRef: this.batchEmptySectionRef,
    };

    // 分标段操作提示modal
    const operateSectionPrompt = {
      dataList: operateSectionData,
      visible: operateSectionPromptFlag,
      handleOk: this.handleOkSectionOperatePrompt,
      handleCancel: this.handleCancellSectionOperatePrompt,
    };

    return (
      <ModalProvider>
        <Spin
          spinning={
            saveQuotationLinesLoading ||
            queryQuotationHeaderLoading ||
            fetchListLoading ||
            allLoading ||
            operationLoading
          }
        >
          {this.renderHeader()}

          {this.renderSectionAlert(sectionFlag)}
          <SectionPanel
            {...SectionPanelProps}
            onRef={(node) => {
              this.SectionRef = node;
            }}
          >
            <Content className={style.contentStyle}>
              <Spin
                // spinning={
                //   !BidSectionFlag ? queryQuotationHeaderLoading : allLoading || operationLoading
                // }
                spinning={false}
                wrapperClassName={classNames('ued-detail-wrapper')}
              >
                {this.renderInquiryHeader()}
                <div style={{ marginTop: '7px', padding: '24px' }}>
                  {inquiryTableReadOnly && this.renderItemLine(itemLineProps)}
                  {inquiryDetail && (
                    <Spin spinning={fetchQuestionLineLoading}>
                      <div className={style.biddingDetail}>
                        {this.leftTableView(quotationLines.content || [], quotationLinePagination)}
                        {this.rightDetailView()}
                        <div style={{ clear: 'both' }} />
                      </div>
                    </Spin>
                  )}
                </div>
              </Spin>
            </Content>
          </SectionPanel>
        </Spin>

        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={1000}
          afterClose={this.handleClose}
        >
          {this.renderQuoteAttachment(AttachmentsProps)}
          {/* <QuoteAttachment {...AttachmentsProps} /> */}
        </Modal>
        {ladderVisible &&
          (this.custkey === '' ? (
            <LadderLevelModal {...ladderRecordProps} />
          ) : (
            <BidLadderLevelModal {...ladderRecordProps} />
          ))}
        <Modal
          title={intl.get('ssrc.supplierQuotation.view.message.button.rateOfIAD').d('升降价比率')}
          visible={quotationVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <Row>
              <Col span={2} />
              <Col span={2} style={{ width: '117px', marginLeft: '50px' }}>
                <Form.Item>
                  {form.getFieldDecorator('changeDirection', {
                    initialValue:
                      quotationHeader.auctionDirection === 'FORWARD'
                        ? 'UP'
                        : quotationHeader.auctionDirection === 'NONE'
                        ? 'DOWN'
                        : quotationHeader.changeDirection
                        ? quotationHeader.changeDirection
                        : 'DOWN',
                  })(
                    <Select defaultValue="UP" style={{ width: '120px' }}>
                      <Select.Option
                        value="UP"
                        disabled={quotationHeader.auctionDirection === 'REVERSE'}
                      >
                        {intl
                          .get('ssrc.supplierQuotation.view.message.button.increasePrice')
                          .d('升价')}
                      </Select.Option>
                      <Select.Option
                        value="DOWN"
                        disabled={quotationHeader.auctionDirection === 'FORWARD'}
                      >
                        {intl
                          .get('ssrc.supplierQuotation.view.message.button.descendPrice')
                          .d('降价')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item>
                  {form.getFieldDecorator('changeValue', {
                    initialValue: quotationHeader.changeValue || 0,
                  })(
                    <InputNumber
                      defaultValue={100}
                      min={0}
                      max={100}
                      formatter={(value) => `${value}%`}
                      parser={(value) => {
                        if (value && isString(value)) {
                          return value.replace('%', '');
                        }
                        return value ?? '%';
                      }}
                      style={{ width: '200px' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
        {batchEmptySelectSectionFlag && <BatchEmptySelectedModal {...BatchProps} />}
        {operateSectionPromptFlag && <OperateSectionPromptModal {...operateSectionPrompt} />}
      </ModalProvider>
    );
  }
}

/**
 * 根据变量获取二开页面组件 - BID2020112300001, 通过路由来处理, 判断是否是二开路由,  利用重写原理
 */
const HOCComponent = withStandardCompEnhancer(InquiryPrice);
export default HOCComponent;
export { InquiryPrice, withStandardCompEnhancer as hocInquiryPrice };
