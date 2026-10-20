/*
 * CheckPrice - 寻源服务/核价页面
 * @date: 2019-1-9
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal as c7nModal, Button as C7nButton } from 'choerodon-ui/pro';
import { Button, Collapse, Form, Col, Row, Tabs, Tag, Modal, Icon, Spin, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, isNil } from 'lodash';
import querystring from 'querystring';
import { openTab, refreshTab } from 'utils/menuTab';

import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
// import Icons from 'components/Icons';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import classnames from 'classnames';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
import { filterNullValueObject, getResponse } from 'utils/utils';
// import QuotationDirectLable from '@/utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';

import FeedBackBarginHistoryModal from '@/routes/ssrc/QueryQuotation/Detail/FeedBackBarginHistoryModal';
import { downloadFile } from 'hzero-front/lib/services/api';
import SectionPanel from '@/routes/components/SectionPanel/Detail';
import CPopover from '@/routes/components/CPopover/';
import OperationRecord from '@/routes/components/OperationRecord';
import QuotationDetail from '@/routes/components/QuotationDetail/QuotationDetail';
import { INQUIRY, BID, getCheckPriceName, getQuotationName } from '@/utils/globalVariable';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { supplierRiskScan } from '@/routes/ssrc/InquiryHallNew/utils';
import { getSupplierRelationUrl, isText } from '@/utils/utils';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import useIPDetailModal from '@/routes/components/IPDetails';

import {
  fetchEnterpriceRiskControlConfig,
  queryConfigurationOldRate,
  // queryProcessAttachmentConfig,
} from '@/services/commonService';
import { supplierRelationMapNew } from '@/services/inquiryHallService';
import { fetchAttachmentCount } from '@/services/checkPriceNewService';
// import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';

import ItemLineList from './ItemLineList';
import SupplierLineList from './SupplierLineList';
import QuoteLineTable from './QuoteLineTable';
import styles from './index.less';

// import FileList from './FileList';
import { withStandardCompEnhancer } from './standardCompEnhancerCreator';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import Attachment from '../../components/Attachment';
import IPCoincidenceRate from '../../../components/IPCoincidenceRate/index';
import DownloadAttachments from '../../components/DownloadAttachments';

const { Panel } = Collapse;
const FormItem = Form.Item;
const { TabPane } = Tabs;

// eslint-disable-next-line
const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

const { openIPDetailModal } = useIPDetailModal();

class CheckPrice extends Component {
  constructor(props) {
    super(props);
    this.SectionRef = null;

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
      enterpriceRiskControllerButtonsVisible: {
        RELATION_MINING: 0, // 关系图谱（关系挖掘）
        RISK_SCAN: 0, // 风险扫描
      },
      useNewRateFlag: 0, // 是否使用老重合率标识
    };
  }

  sourceKey = this.props.sourceKey === BID ? 'NEW_BID' : INQUIRY;

  quotationName = getQuotationName(this.props.sourceKey === BID);

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchUseOldRate();
    this.fetchPages();
    this.dealCustActiveTabKey();
    this.enterpriceRiskControllerButtonConfig();
    const { onLoad } = this.props;
    // 使用 onLoad 函数注册 submit 回调函数
    if (typeof onLoad === 'function') {
      onLoad({
        submit: this.submit,
      });
    }

    // this.handeleSearchProcessAttachmentConfig();
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

  // /**
  //  * 查询过程下载附件配置表
  //  */
  // async handeleSearchProcessAttachmentConfig() {
  //   const result = getResponse(await queryProcessAttachmentConfig());
  //   try {
  //     if (result) {
  //       this.setState({
  //         processAttachmentNewUIFlag: !result?.length,
  //       });
  //     }
  //   } finally {
  //     this.setState({
  //       attachmentNewUILoading: false,
  //     });
  //   }
  // }

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
      inquiryHall: { quoteLine = [] },
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
          rfxHeaderId: params.rfxId || params.rfxHeaderId,
          quoteLine,
          that: this,
        })
      : submitCallBack();
  }

  dealCustActiveTabKey() {
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
   * @protect 卫龙二开（就在头查询后接一个查询）
   */
  @Bind()
  fetchInquiryHallCheckPrice(queryParams = {}) {
    const {
      match: { params, path = null },
      dispatch,
      organizationId,
      onFormLoaded,
      code: workflowFormCode,
      form,
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchInquiryHeaderDetail',
      payload: {
        rfxHeaderId: params.rfxId || params.rfxHeaderId,
        organizationId,
        path,
        ...queryParams,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO,SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`,
      },
    }).then(() => {
      if (form) {
        form.setFieldsValue({
          workflowFormCode, // 工作流 表单编码
        });
      }

      Promise.all([
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
    });
    const lovCodes = {
      selectedPolicy: 'SSRC.RFX_SELECTION_STRATEGY', // 选择策略
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
    this.queryAttachmentCount();
  }

  // 过程附件查询数量
  async queryAttachmentCount() {
    const {
      match: { params },
    } = this.props;
    const result = getResponse(
      await fetchAttachmentCount({
        rfxHeaderId: params.rfxId || params.rfxHeaderId,
        newCheckFlag: 0,
      })
    );
    if (result) {
      this.setState({
        attachmentCount: Number(result?.fileCount || 0) > 99 ? '99+' : result?.fileCount,
      });
    }
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}, queryParams = {}) {
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
        rfxHeaderId: params.rfxId || params.rfxHeaderId,
        ...queryParams,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
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
    this.fetchItemLine(changedPagination);
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchSupplierLine(changedPagination);
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}, queryParams = {}) {
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
        rfxHeaderId: params.rfxId || params.rfxHeaderId,
        ...queryParams,
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
   * 打开过程附件查看
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
    const rfxHeaderId = params.rfxId || params.rfxHeaderId;
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

    const {
      dispatch,
      organizationId,
      inquiryHall: { header = {} },
    } = this.props;
    const { rfxHeaderId } = header;

    if (chartFlag === 'i') {
      // 查询物品明细缩略图数据
      dispatch({
        type: 'inquiryHall/fetchPriceChartsData',
        payload: { rfxLineItemId: id, organizationId, rfxHeaderId },
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
        payload: { rfxLineSupplierId: id, organizationId, rfxHeaderId },
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
   * 全部报价明细 - 查询
   * @override 三生制药,东博
   */
  @Bind()
  fetchQuoteLine(page = {}, queryParams = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'inquiryHall/fetchQuoteLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId || params.rfxHeaderId,
        ...queryParams,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`,
        checkApproveFlag: 1,
      },
    });
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
    const {
      inquiryHall: { header = {} },
    } = this.props;
    const { rfxHeaderId } = header || {};

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

  @Bind()
  jumpToProjectDetail(header) {
    const sourceProjectId = header?.sourceProjectId;
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
  }

  /**
   * [网是科技] 二开, 请谨慎修改!!!
   * @protected
   */
  getRows() {
    const {
      organizationId,
      inquiryHall: { header = {} },
      form: { getFieldDecorator },
      remote,
    } = this.props;
    const sourceFromFlag = header.sourceFrom === 'PROJECT';

    const rows = [
      <Row gutter={48} className="writable-row">
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateName')(<span>{header.templateName}</span>)}
            </FormItem>
          </Col> */}
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sourceCategoryMeaning', {
              initialValue: header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning,
            })(
              <span>
                {header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning || '-'}
              </span>
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('purOrganizationName', {
              initialValue: header.purOrganizationName,
            })(<span>{header.purOrganizationName}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
            {getFieldDecorator('companyName', {
              initialValue: header.companyName,
            })(<span>{header.companyName}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('unitName', {
              initialValue: header.unitName,
            })(<span>{header.unitName}</span>)}
          </FormItem>
        </Col>
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethodMeaning')(<span>{header.sourceMethodMeaning}</span>)}
            </FormItem>
          </Col> */}
      </Row>,
      <Row gutter={48} className="writable-row">
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationTypeMeaning')(
                <span>{header.quotationTypeMeaning}</span>
              )}
            </FormItem>
          </Col> */}
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('auctionDirectionMeaning')(
                <span>{header.auctionDirectionMeaning}</span>
              )}
            </FormItem>
          </Col> */}
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('budgetAmount', {
              initialValue: header.budgetAmount,
            })(
              <PrecisionInputNumber
                value={header.budgetAmount}
                financial={header.currencyCode}
                type="hzero"
                readOnly
              />
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        {header.priceTypeCode === 'TAX_INCLUDED_PRICE' ? (
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
                .d('预估金额(含税)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalEstimatedAmount', {
                initialValue: header.totalEstimatedAmount,
              })(
                <PrecisionInputNumber
                  value={header.totalEstimatedAmount}
                  financial={header.currencyCode}
                  type="hzero"
                  readOnly
                />
              )}
            </FormItem>
          </Col>
        ) : (
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
                .d('预估金额(不含税)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalNetEstimatedAmount', {
                initialValue: header.totalNetEstimatedAmount,
              })(
                <PrecisionInputNumber
                  value={header.totalNetEstimatedAmount}
                  financial={header.currencyCode}
                  type="hzero"
                  readOnly
                />
              )}
            </FormItem>
          </Col>
        )}
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingAmount`).d('节支金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('savingAmount', {
              initialValue: header.savingAmount,
            })(
              <PrecisionInputNumber
                value={header.savingAmount}
                financial={header.currencyCode}
                type="hzero"
                readOnly
              />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingRatio`).d('节支率')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('savingRatio')(
              <span>{!isNil(header.savingRatio) ? `${header.savingRatio}%` : ''}</span>
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.headerMaxSuggestedAmount`)
              .d('最高金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('maxSuggestedAmount', {
              initialValue: header.maxSuggestedAmount,
            })(
              <PrecisionInputNumber
                value={header.maxSuggestedAmount}
                financial={header.currencyCode}
                type="hzero"
                readOnly
              />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.headerMinSuggestedAmount`)
              .d('最低金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('minSuggestedAmount', {
              initialValue: header.minSuggestedAmount,
            })(
              <PrecisionInputNumber
                value={header.minSuggestedAmount}
                financial={header.currencyCode}
                type="hzero"
                readOnly
              />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('currencyCodeMeaning', {
              initialValue: header.currencyCode,
            })(<span>{header.currencyCodeMeaning}</span>)}
          </FormItem>
        </Col>
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate')(
                <span>{dateTimeRender(header.creationDate)}</span>
              )}
            </FormItem>
          </Col> */}
      </Row>,
      <Row gutter={48} className="writable-row">
        {sourceFromFlag ? (
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`)
                .d('寻源项目编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceProjectNum', {
                initialValue: header.sourceProjectNum,
              })(
                <a
                  onClick={() => {
                    this.jumpToProjectDetail(header);
                  }}
                >
                  {header.sourceProjectNum}
                </a>
              )}
            </FormItem>
          </Col>
        ) : null}
        {sourceFromFlag ? (
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectName`)
                .d('寻源项目名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceProjectName', {
                initialValue: header.sourceProjectName,
              })(<span>{header.sourceProjectName}</span>)}
            </FormItem>
          </Col>
        ) : null}
      </Row>,
      <Row gutter={48} className="writable-row">
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStartTime`, {
                  quotationName: getQuotationName(this.sourceKey === 'NEW_BID'),
                })
                .d('{quotationName}开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate')(
                <span>{dateTimeRender(header.quotationStartDate)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonqQotationDeadline`, {
                  quotationName: getQuotationName(this.sourceKey === 'NEW_BID'),
                })
                .d('{quotationName}截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate')(
                <span>{dateTimeRender(header.quotationEndDate)}</span>
              )}
            </FormItem>
          </Col> */}
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.projectBudgetAmount`)
              .d('寻源项目预算金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('projectBudgetAmount', {
              initialValue: header.projectBudgetAmount,
            })(
              <PrecisionInputNumber
                value={header.projectBudgetAmount}
                financial={header.currencyCode}
                type="hzero"
                readOnly
              />
            )}
          </FormItem>
        </Col>
        {header.priceTypeCode === 'TAX_INCLUDED_PRICE' ? (
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.projectEstimatedAmount`)
                .d('寻源项目预估金额(含税)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectEstimatedAmount', {
                initialValue: header.projectEstimatedAmount,
              })(
                <PrecisionInputNumber
                  value={header.projectEstimatedAmount}
                  financial={header.currencyCode}
                  type="hzero"
                  readOnly
                />
              )}
            </FormItem>
          </Col>
        ) : (
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.projectNetEstimatedAmount`)
                .d('寻源项目预估金额(不含税)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectNetEstimatedAmount', {
                initialValue: header.projectNetEstimatedAmount,
              })(
                <PrecisionInputNumber
                  value={header.projectNetEstimatedAmount}
                  financial={header.currencyCode}
                  type="hzero"
                  readOnly
                />
              )}
            </FormItem>
          </Col>
        )}
        {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceTypeMeaning')(<span>{header.sourceTypeMeaning}</span>)}
            </FormItem>
          </Col> */}
      </Row>,
      /* <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName')(<span>{header.paymentTypeName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('priceCategoryMeaning')(
                <span>{header.priceCategoryMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.sourceAnnouncementFlag`)
                .d('创建寻源公告')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceAnnouncementFlag')(
                <span>{yesOrNoRender(header.sourceAnnouncementFlag)}</span>
              )}
            </FormItem>
          </Col>
        </Row> */
      <Row gutter={48} className="writable-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rfxRemark', {
              initialValue: header.rfxRemark,
            })(<CPopover content={header.rfxRemark}>{header.rfxRemark}</CPopover>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('internalRemark', {
              initialValue: header.internalRemark,
            })(<CPopover content={header.internalRemark}>{header.internalRemark}</CPopover>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注')}
          >
            {getFieldDecorator('pretrailRemark', {
              initialValue: header.pretrailRemark,
            })(<CPopover content={header.pretrailRemark}>{header.pretrailRemark}</CPopover>)}
          </FormItem>
        </Col>
      </Row>,
      <Row>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={
              <text style={{ color: '#666666' }}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailAttachment`).d('初审附件')}
              </text>
            }
          >
            {getFieldDecorator('pretrialUuid', {
              initialValue: header.pretrialUuid,
            })(
              <Upload
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-pretrial"
                attachmentUUID={header.pretrialUuid ? header.pretrialUuid : undefined}
                tenantId={organizationId}
                filePreview
                viewOnly
                organizationId={header.organizationId}
              />
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonPricingAttachment`, {
                checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
              })
              .d('{checkPriceName}附件')}
          >
            {getFieldDecorator('checkAttachmentUuid', {
              initialValue: header.checkAttachmentUuid,
            })(
              <Upload
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-quotationline"
                attachmentUUID={header.checkAttachmentUuid ? header.checkAttachmentUuid : null}
                tenantId={organizationId}
                filePreview
                viewOnly
                organizationId={header.organizationId}
              />
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className={classnames('last-form-item', 'half-row')}>
        <Col {...FORM_COL_2_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonCheckRemark`, {
                checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
              })
              .d('{checkPriceName}备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('checkRemark', {
              initialValue: header.checkRemark,
            })(<CPopover content={header.checkRemark}>{header.checkRemark}</CPopover>)}
          </FormItem>
        </Col>
      </Row>,
    ];

    const fields = remote
      ? remote.process('SSRC_CHECK_PRICE_APPROVAL_PROCESS_HEADER_FIELDS', rows, { that: this })
      : rows;

    return fields || [];
  }

  rfxTitleForm() {
    const {
      inquiryHall: { header = {} },
      customizeForm,
    } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
        readOnly: true,
        form: this.props.form,
        dataSource: header,
      },
      <Form className="writable-row-custom" style={{ whiteSpace: 'pre-line' }}>
        {this.getRows()}
      </Form>
    );
  }

  renderHeaderTitle(header) {
    return (
      <h3>
        {header.rfxNum}-{header.rfxTitle}
        <Tag style={{ marginLeft: '15px', width: '65px' }}>
          <span style={{ marginLeft: '-17px' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：
            {header.quotationRoundNumber ? header.quotationRoundNumber : 1}
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

  /**
   * 渲染成本备注折叠
   */
  rfxCostRemarkForm() {
    const {
      form = {},
      inquiryHall: { header = {} },
      customizeForm,
      remote,
    } = this.props;
    const { getFieldDecorator } = form;
    const sectionFlag = this.isSectionAndData();
    const { projectCost: projectTotalPrice = null } = this.getSourceProjectData();

    const preFormFields = [
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('totalCost', {
              initialValue: header.totalCost,
            })(<span>{numberSeparatorRender(header.totalCost)}</span>)}
          </FormItem>
        </Col>
        {sectionFlag ? (
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`)
                .d('寻源项目总金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectTotalPrice', { initialValue: projectTotalPrice })(
                <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
              )}
            </FormItem>
          </Col>
        ) : null}
        <Col span={8}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonTotalPrice`, {
                checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
              })
              .d('{checkPriceName}总金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('totalPrice', {
              initialValue: header.totalPrice,
            })(<PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />)}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('overCostFlag', {
              initialValue: header.overCostFlag,
            })(<span>{yesOrNoRender(header.overCostFlag)}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('overCostPrice', {
              initialValue: header.overCostPrice,
            })(<span>{numberSeparatorRender(header.overCostPrice)}</span>)}
          </FormItem>
        </Col>
        <Col span={8}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('overCostScale', {
              initialValue: header.overCostScale,
            })(<span>{header.overCostScale}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className={classnames('last-form-item', 'half-row')}>
        <Col span={12}>
          <FormItem label={intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注')}>
            {getFieldDecorator('costRemark', {
              initialValue: header.costRemark,
              rules: [
                {
                  max: 480,
                  message: intl.get('hzero.common.validation.max', { max: 480 }),
                },
              ],
            })(<span>{header.costRemark}</span>)}
          </FormItem>
        </Col>
      </Row>,
    ];

    let formFields = remote
      ? remote.process('SSRC_CHECK_PRICE_APPROVAL_PROCESS_COST_REMARK_FORM_FIELDS', preFormFields, {
          that: this,
          header,
        })
      : preFormFields;
    formFields = formFields || [];

    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.COST`,
        form,
        dataSource: header,
      },
      <Form>{formFields}</Form>
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
                type: 'inquiryHall/updateState',
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
                type: 'inquiryHall/updateState',
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
                type: 'inquiryHall/updateState',
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
   * @memberof fetchSupplierDiagram
   */
  @Bind()
  async supplierRelationMap() {
    const {
      organizationId,
      match: { params },
      inquiryHall: { supplierLine = [], header = {} },
    } = this.props;
    const { rfxNum } = header || {};

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
        rfxNum,
      };
      companyNames.push(currentLine);
    });

    // 校验头id
    idValidation(params.rfxId);
    if (!header?.secondarySourceCategory) return;

    supplierRelationMapNew({
      organizationId,
      data: {
        rfxHeaderId: params.rfxId,
        supplierLists: companyNames,
        businessType: header.secondarySourceCategory,
        rfxNum,
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
    const {
      dispatch,
      // match: { params },
      inquiryHall: {
        header: { rfxHeaderId },
      },
    } = this.props;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: 'inquiryHall/fetchIPCoincidenceRate',
      payload: {
        rfxHeaderId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL`,
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

  /**
   * 获取头部按钮 - 九坤,高测,三生制药租户重写此方法!!!
   * @protected
   */
  getHeaderButtons() {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { header = {}, quoteLine = [] },
      remote,
    } = this.props;
    // const { attachmentNewUILoading } = this.state;
    const operationProps = {
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
      name: 'operatingRecord',
    };

    const buttons = [
      <OperationRecord {...operationProps} />,
      <Button name="assistant" type="default" onClick={() => this.handleRenderPriceCompare()}>
        <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
        {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
      </Button>,
      <Badge count={this.state.attachmentCount} className={styles['badge-item']} name="attachment">
        <Button
          name="attachment"
          icon="get_app"
          // loading={attachmentNewUILoading}
          onClick={this.openProcessAttachmentModal}
        >
          {intl.get('ssrc.inquiryHall.view.button.examine').d('过程附件查看')}
        </Button>
      </Badge>,
      <ExcelExportPro
        name="exportNew"
        templateCode="SRM_C_SRM_SSRC_RFX_QUOTATION_DETAIL_EXPORT"
        queryParams={{ rfxHeaderId: params.rfxId }}
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
      dispatch,
      header,
      organizationId,
      fetchQuoteLine: this.fetchQuoteLine,
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
      quoteLine,
    };

    return remote
      ? remote.process('SSRC_CHECK_PRICE_APPROVAL_PROCESS_HEADER_BUTTONS', buttons, otherProps)
      : buttons;
  }

  getPriceCompareProp() {
    const {
      inquiryHall: { header = {} },
      history,
    } = this.props;
    // const { priceComparisonModalVisible } = this.state;

    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag } = header || {};
    const priceComparisonProps = {
      sourceCategory,
      diyLadderQuotationFlag,
      rfxId: header.rfxHeaderId,
      // visible: priceComparisonModalVisible,
      // onHideModal: this.hidePriceComparison,
      history,
    };
    return priceComparisonProps;
  }

  // @override 三生制药 追觅 久立
  renderPriceCompare() {
    const { priceComparisonModalVisible } = this.state;
    const priceComparisonProps = this.getPriceCompareProp();

    return priceComparisonModalVisible && <PriceComparison {...priceComparisonProps} />;
  }

  // @override 三生制药 追觅 久立
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

  // 查看IP重合详情
  @Bind()
  handleViewIPDetail() {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId, rfxHeaderId } = params;
    openIPDetailModal({
      rfxHeaderId: rfxId || rfxHeaderId,
    });
  }

  renderOperations(settings) {
    const { customizeBtnGroup = () => {} } = this.props;
    const { enterpriceRiskControllerButtonsVisible = {}, useNewRateFlag = 0 } = this.state;
    const {
      RELATION_MINING = 0, // 关系图谱（关系挖掘）
    } = enterpriceRiskControllerButtonsVisible || {};

    const operations = customizeBtnGroup(
      {
        code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS`,
      },
      [
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
          <C7nButton
            name="ipCoincidenceRate"
            funcType="link"
            onClick={this.openIPCoincidenceRateModal}
            style={{ color: '#29BECE', marginRight: '16px', cursor: 'pointer' }}
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
            style={{ color: '#29BECE', cursor: 'pointer' }}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.RelationMap`).d('供应商关系图谱')}
          </C7nButton>
        ) : (
          ''
        ),
      ].filter(Boolean)
    );
    return this.state.activeKey === 'supplierLine' ? operations : false;
  }

  // @override 三生制药
  renderQuoteLineTable(quoteLineTableProps) {
    return <QuoteLineTable {...quoteLineTableProps} />;
  }

  // 物料明细-三生制药、东博二开
  renderItemLineList(itemLineListProps) {
    return <ItemLineList {...itemLineListProps} />;
  }

  // 供应商信息-三生制药、东博二开
  renderSupplierLineList(supplierLineListProps) {
    return <SupplierLineList {...supplierLineListProps} />;
  }

  /**
   * @protect 鸿合科技二开
   */
  getTabPanes({ itemLineListProps, supplierLineListProps, quoteLineTableProps, AttachmentsProps }) {
    const { remote } = this.props;
    const { rfxHeaderId, header } = itemLineListProps || {};
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
    ];
    return remote
      ? remote.process('SSRC_CHECK_PRICE_APPROVAL_PROCESS_TAB_PANE_ARRAT', tabs, {
          rfxHeaderId,
          header,
        })
      : tabs;
  }

  // Tab页-三生制药二开
  renderTabPanes({
    settings,
    itemLineListProps,
    supplierLineListProps,
    quoteLineTableProps,
    AttachmentsProps,
  }) {
    return (
      <Tabs
        defaultActiveKey={this.state.activeKey}
        onChange={this.changeTabs}
        animated={false}
        className={styles.tabStyle}
        tabBarExtraContent={this.renderOperations(settings)}
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
    const { quotationLineId, companyName: supplierCompanyName, itemCode, itemName } = record;
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

  // 渲染标题
  renderTitle = () => {
    const {
      remote,
      inquiryHall: { header = {} },
    } = this.props;
    return remote
      ? remote.render(
          'SSRC_CHECK_PRICE_APPROVAL_RENDER_TITLE',
          intl
            .get(`ssrc.inquiryHall.view.message.title.commonCheckPriceApproval`, {
              checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
            })
            .d('{checkPriceName}审批'),
          {
            header,
          }
        )
      : intl
          .get(`ssrc.inquiryHall.view.message.title.commonCheckPriceApproval`, {
            checkPriceName: getCheckPriceName(this.sourceKey === 'NEW_BID'),
          })
          .d('{checkPriceName}审批');
  };

  render() {
    const {
      organizationId,
      fetchHeaderLoading,
      fetchItemLineLoading,
      fetchSupplierLineLoading,
      fetchQuoteLineLoading,
      fetchLadderLevelTableLoading,
      fetchIPCoincidenceRateLoading,
      customizeTable,
      custLoading,
      customizeCollapse,
      customizeBtnGroup = () => {},
      customizeTabPane,
      inquiryHall: {
        header = {},
        itemLine = [],
        supplierLine = [],
        quoteLine = [],
        quotaLadderLevelData = [],
        quoteLinePagination = {},
        code: { selectedPolicy = [] },
        ipCoincidenceRate = [],
        settings,
      },
      match: { params },
      location: { search },
      dispatch,
      remote,
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
      collapseKeys = [],
      ipCoincidenceRateVisible,
      quotationDetailVisible = false,
      itemLineRecord = {},
      processVisible,
      feedBackBarginHistoryStatus,
      feedBackBarginHistorySearch,
      enterpriceRiskControllerButtonsVisible = {},
      useNewRateFlag = 0,
    } = this.state;
    const sectionFlag = this.getRfxHeaderIds();
    const { backPath } = querystring.parse(search.substr(1)) || {};
    const {
      RISK_SCAN = 0, // 风险扫描
    } = enterpriceRiskControllerButtonsVisible || {};

    const itemLineListProps = {
      header,
      customizeTable,
      selectedPolicy,
      organizationId,
      quotaLadderLevelData,
      headerList: itemLine,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      sourceKey: this.sourceKey,
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
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
    };
    const supplierLineListProps = {
      settings,
      customizeTable,
      sourceKey: this.sourceKey,
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
      headerList: supplierLine,
      loading: fetchSupplierLineLoading,
      onChangePagination: this.changeSupplierLinePagination,
      onRef: (node) => {
        this.supplierLineList = node;
      },
      header,
      hideModal: this.hideLadderLevelModal,
      viewLadderLevel: this.viewLadderLevelModal,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      onRiskScan: this.linkRiskScan,
      onComparePriceHistory: this.onComparePriceHistory,
      RISK_SCAN,
      remote,
      customizeBtnGroup,
      useNewRateFlag,
    };
    const quoteLineTableProps = {
      header,
      organizationId,
      selectedPolicy,
      customizeTable,
      loading: fetchQuoteLineLoading,
      dataSource: quoteLine,
      pagination: quoteLinePagination,
      onChange: this.fetchQuoteLine,
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
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
      remote,
    };
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      viewOnly,
      businessUuid: header.businessAttachmentUuid,
      techUuid: header.techAttachmentUuid,
    };

    // 物品行报价明细props
    const quotationDetailProps = {
      itemLineRecord,
      sourceFrom: 'RFX',
      allowBuyerViewFlag: 1,
      rfxStatus: header.rfxStatus,
      visible: quotationDetailVisible,
      onCancel: this.hideQuotationDetail,
    };

    // 过程附件查看
    const DownloadAttachmentsProps = {
      rfxHeaderId: params.rfxId || params.rfxHeaderId,
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
      feedBackBarginHistoryStatus,
      onCancel: () => this.setState({ feedBackBarginHistoryStatus: false }),
      dispatch,
    };

    return (
      <React.Fragment>
        <Header backPath={backPath} title={this.renderTitle()}>
          {customizeBtnGroup(
            { code: `SSRC.${this.sourceKey}_HALL_CHECK_PRICE.HEADER_COLLAPSE_BUTTONS` },
            this.getHeaderButtons()
          )}
        </Header>
        <SectionPanel
          {...SectionPanelProps}
          onRef={(node) => {
            this.SectionRef = node;
          }}
        >
          <Content>
            <Spin spinning={fetchHeaderLoading} wrapperClassName={classnames('ued-detail-wrapper')}>
              {remote
                ? remote.render('SSRC_CHECK_PRICE_APPROVAL_RENDER_CUX_BEFORE_COLLAPSE_PART', <></>, { that: this, header })
                : null}

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
                    header={
                      <Fragment>
                        {this.renderHeaderTitle(header)}
                        <a>
                          {collapseKeys.includes('rfxTitle')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('rfxTitle') ? 'up' : 'down'} />
                        {remote
                          ? remote.render('SSRC_CHECK_PRICE_APPROVAL_RENDER_COLLAPSE_PANEL_HEADER_END', <></>, { that: this })
                          : null}
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
                        {remote
                          ? remote.render('SSRC_CHECK_PRICE_APPROVAL_RENDER_COLLAPSE_PANEL_COST_END', <></>, { that: this })
                          : null}
                      </Fragment>
                    }
                    key="costRemark"
                  >
                    {this.rfxCostRemarkForm()}
                  </Panel>
                </Collapse>
              )}
            </Spin>
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
