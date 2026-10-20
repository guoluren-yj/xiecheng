/**
 * inquiryHall - 寻源服务/询价大厅-还比价（FeedbackBargin）
 * @date: 2019-01-07
 * @author: LC <chao.li03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import intl from 'utils/intl';
import { difference, isArray, isEmpty, map, noop, isNil, compose } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import React, { Component } from 'react';
// import queryString from 'querystring';
import { Attachment as NewAttachment, DataSet, Modal as c7nModal } from 'choerodon-ui/pro';
import {
  Col,
  Form,
  Icon,
  Modal,
  Pagination,
  Popover,
  Row,
  Spin,
  Tabs,
  Tag,
  Tooltip,
} from 'hzero-ui';
import classnames from 'classnames';

import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';

import fileIcon from '@/assets/file.svg';
// import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getActiveTabKey } from 'utils/menuTab';
import { TopSection } from '_components/Section';

import { phoneRender } from '@/utils/renderer';
import goodsIcon from '@/assets/goodsIcon.svg';
import supplierIcon from '@/assets/supplierIcon.svg';
import ExchangeEditModal from '@/routes/ssrc/components/ExchangeEditModals/ExchangeEditModal';
import QuoteExchangeMainDateModal from '@/routes/ssrc/components/ExchangeEditModals/QuoteExchangeMainDateModal';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import { queryEnableDoubleUnit, querySourceExchangeRateConfig } from '@/services/commonService';
import { isText } from '@/utils/utils';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import CommonStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import ItemLineTable from './ItemLineTable';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import SupplierLineTable from './SupplierLineTable';
import PriceCharts from '../../components/PriceCharts';
import Attachment from '../../components/Attachment';
// import PriceComparison from '../../components/PriceComparison';
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import OperationRecord from '../../components/OperationRecord';
import CounterOffersBulk from './CounterOffersBulk';
import { fullQuotationTableDS } from './fullQuotationTableDS';
import FullQuotation from './FullQuotation';
import HeaderInfoForm from './HeaderInfo';

import styles from './index.less';

function getCheckboxProps(record) {
  return {
    disabled:
      record.quotationLineStatus === 'BARGAINED' ||
      record.quotationLineStatus === 'ABANDONED' ||
      !record.supplierCompanyId,
  };
}

class FeedbackBargain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: 'allLine',
      operationRecordModalVisible: false, // 操作记录模态框
      priceComparisonModalVisible: false, // 比价助手模态框
      expand: {}, // 展开数据
      // allLineSelectedRowKeys: [], // 已勾选的全部明细ID
      // allLineSelectesRows: [], // 已勾选的全部明细行数据
      itemLineSelectedRowKeys: [], // 已勾选的物料行ID
      itemLineSelectedRows: [], // 已勾选的物料行
      supplierLineSelectedRowKeys: [], // 已勾选的供应商ID
      supplierLineSelectedRows: [], // 已勾选的供应商行
      attachmentVisible: false,
      AttachmentsProps: {},
      supplierColumns: [], // 还比价表头数据格式
      itemId: undefined, // 比价记录点击历史行标记
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      loadingObj: {},
      viewPriceChartsVisible: false, // 物品明报价细折线图
      priceDataSource: [], // 物品明报价细折线图数据源
      supplierNameList: [], // 物品明报价细折线图有报价的供应商
      chartsLoading: {},
      id: undefined,
      collapseKeys: {}, // 打开的折叠面板key
      counterOffersBulkVisible: false, // 批量填写还价弹框
      counterOffersBulkData: {}, // 批量填写还价弹框-数据
      itemQuotationDetailModalVisible: false,
      itemRecord: {},
      item: {}, // 历史最低价物品对象
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      exchangeEditModalVisible: false, // 汇率编辑modal
      exchangeEditContentModalVisible: false, // 汇率编辑引用汇率主数据modal
      // allCachSelectObj: {}, // 全部页签缓存勾选的行
      doubleUnitFlag: false, // 判断是否开启双单位
      newQuotationFlag: false, // 开启新报价
      showExchangeEdit: false,
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = this.sourceKey === BID;

  quotationName = getQuotationName(this.sourceKey === BID);

  fullQuotationDS = new DataSet(
    fullQuotationTableDS({
      sourceKey: this.sourceKey,
      quotationName: this.quotationName,
    })
  );

  /**
   * 通过询价大厅操作-还比价-->
   * 采购方询价单头查询，物料行,供应商行,全部明细
   */

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params },
    } = prevProps;
    const {
      match: { params: currentParams },
    } = this.props;
    const { rfxId } = params || {};
    const { rfxId: rfxHeaderId } = currentParams || {};

    const updateFlag = !!rfxHeaderId && rfxHeaderId !== rfxId;
    return updateFlag;
  }

  componentDidMount() {
    this.fetchInquiryHallUpdate();
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();
    this.handleSearchSourceExchangeRateConfig();
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchInquiryHallUpdate();
    }
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      const flag = !!Number(res);
      this.setState({
        doubleUnitFlag: flag,
      });
      this.fullQuotationDS.setState('doubleUnitFlag', flag);
    }
  };

  handleSearchSourceExchangeRateConfig = async () => {
    try {
      const result = getResponse(await querySourceExchangeRateConfig());
      if (result?.length) {
        this.setState({
          showExchangeEdit: true,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * 结束生命周期，清空数据
   */
  componentWillUnmount() {
    this.props.dispatch({
      type: `${this.props.modelName}/updateState`,
      payload: {
        header: {},
        itemLine: [],
        supplierLine: [],
        allLine: [],
        aloneItemLine: {},
        aloneSupplierItemLine: {},
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
        itemContentChange: {},
        supplierContentChange: {},
      },
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
   *阻止物料明细头部查看附件冒泡
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   *阻止供应商头部查看附件冒泡
   */

  @Bind()
  rfxSupplierTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
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
      type: `${this.props.modelName}/updateState`,
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const { organizationId, match } = this.props;
    const { rfxId: rfxHeaderId } = match?.params || {};
    if (!rfxHeaderId) {
      return;
    }

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

  /**
   * 打开阶梯报价模态框
   */

  @debounce(800)
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { quotationLineId = null } = record;
    this.setState(
      {
        viewLadderLevelVisible: true,
        LadderLevelHeaderData: record,
      },
      () => {
        const { dispatch, organizationId } = this.props;
        dispatch({
          type: `${this.props.modelName}/fetchBarginLadderLevelyTable`,
          payload: { quotationLineId, organizationId },
        });
      }
    );
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */

  @debounce(800)
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false, LadderLevelHeaderData: {} });
    this.props.dispatch({
      type: `${this.props.modelName}/updateState`,
      payload: {
        barginLadderLevelData: [],
      },
    });
    this.afterOperateInitStoreAndState();
    this.fetchInquiryHallUpdate();
  }

  /**
   * saveBarginLadderLine - 保存阶梯还价数据
   */
  @debounce(800)
  @Bind()
  saveBarginLadderLine() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { barginLadderLevelData = [] },
    } = this.props;
    const newParams = getEditTableData(barginLadderLevelData, ['ladderQuotationId']);
    if (!isEmpty(newParams)) {
      dispatch({
        type: `${modelName}/saveBarginLadderLevel`,
        payload: { newParams, organizationId },
      }).then((res) => {
        if (res) {
          notification.success();
          const { LadderLevelHeaderData } = this.state;
          const { quotationLineId } = LadderLevelHeaderData || {};

          if (!quotationLineId) {
            return;
          }

          dispatch({
            type: `${modelName}/fetchBarginLadderLevelyTable`,
            payload: { quotationLineId, organizationId },
          });
        }
      });
    }
  }

  /**
   * 打开比价助手模态框
   */
  @debounce(800)
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
   * showUploadModal - 打开头附件上传弹窗
   */

  @Bind()
  showUploadModal(businessAttachmentUuid, techAttachmentUuid) {
    this.setState({
      AttachmentsProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
      },
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

  @Bind()
  fetchInquiryHallUpdate() {
    const {
      match: { params, path = null },
      dispatch,
      organizationId,
    } = this.props;
    if (params.rfxId) {
      dispatch({
        type: `${this.props.modelName}/fetchInquiryHeaderDetail`,
        payload: {
          organizationId,
          rfxHeaderId: params.rfxId,
          path,
          customizeUnitCode: this.getCustomizeUnitCode('baseInfo'),
        },
      });
      const lovCodes = {
        bargainType: 'SSRC.BARGAIN_TYPE', // 还价方式
      };
      dispatch({
        type: `${this.props.modelName}/batchCode`,
        payload: { lovCodes },
      });

      this.fetchItemLine();
      this.fetchSupplierLineBarginPrice();
      this.fetchAllLine(); // 获取全部报价明细
    }
  }

  /**
   * 物品明细行头部 - 查询
   */

  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: `${this.props.modelName}/fetchItemLine`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 供应商列表行头部 - 查询
   */

  @Bind()
  fetchSupplierLineBarginPrice(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: `${this.props.modelName}/fetchSupplierLineBarginPrice`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 全部明细
   */
  @Bind()
  fetchAllLine() {
    const {
      match: { params },
      organizationId,
    } = this.props;

    this.fullQuotationDS.setQueryParameter('queryParams', {
      organizationId,
      // orderType, // 全部报价默认按物品排序
      rfxHeaderId: params.rfxId,
      customizeUnitCode: this.getCustomizeUnitCode(['allTable', 'allTableSearch']),
    });

    this.fullQuotationDS.query();
  }

  // @Bind()
  // changeAllPagination(page = {}, filters, sorter) {
  //   const { modelName = 'inquiryHall' } = this.props;
  //   const {
  //     [modelName]: { allLine = [], allLinePagination = {} },
  //   } = this.props;
  //   const { allLineSelectedRowKeys = [], allCachSelectObj = {} } = this.state;
  //   const currentSelectLine = allLine.filter((item) =>
  //     allLineSelectedRowKeys.includes(item.quotationLineId)
  //   );
  //
  //   // 1.更新缓存
  //   const cacheLine = getEditTableData(currentSelectLine, ['_status']);
  //   this.setState({
  //     allCachSelectObj: { ...allCachSelectObj, [allLinePagination.current - 1]: cacheLine },
  //   });
  //   this.fetchAllLine(page, filters, sorter);
  // }

  /**
   * 获取全部明细选中行
   * @param selectedRowKeys
   */
  // @Bind()
  // handleAllLineRowSelectChange(selectedRowKeys, selectedRows) {
  //   this.setState({ allLineSelectedRowKeys: selectedRowKeys, allLineSelectesRows: selectedRows });
  // }

  /**
   * 获取物料明细选中行
   * @param selectedRowKeys
   */

  @Bind()
  handleItemLineRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ itemLineSelectedRowKeys: selectedRowKeys, itemLineSelectedRows: selectedRows });
  }

  /**
   * 获取供应商选中行
   * @param selectedRowKeys
   */

  @Bind()
  handleSupplierLineRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      supplierLineSelectedRowKeys: selectedRowKeys,
      supplierLineSelectedRows: selectedRows,
    });
  }

  /**
   * 还比价保存
   */
  @debounce(800)
  @Bind()
  async saveInquiryHallFullQuoation() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      form,
      organizationId,
      [modelName]: { aloneItemLine = {}, aloneSupplierItemLine = {} },
    } = this.props;
    // 保存时判断当前tabkey的位置
    const { activeKey } = this.state;
    let params;
    if (activeKey === 'itemLine') {
      params = Object.values(aloneItemLine).reduce(
        (prev, current) => prev.concat(getEditTableData(current.list)),
        []
      );
    } else if (activeKey === 'supplierLine') {
      params = Object.values(aloneSupplierItemLine).reduce(
        (prev, current) => prev.concat(getEditTableData(current.list)),
        []
      );
    } else {
      if (!this.fullQuotationDS.length) {
        return;
      }
      this.fullQuotationDS.forEach((lines) => {
        lines.set('status', 'update');
      });

      const validateFlag = await this.fullQuotationDS.validate();
      if (!validateFlag) {
        return;
      }

      params = this.fullQuotationDS.toData() || [];
    }
    if (isEmpty(params)) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.dataNotNullSave`)
          .d('保存数据不能为空,请展开数据进行保存'),
      });
      return;
    }

    form.validateFields(() => {
      dispatch({
        type: `${modelName}/saveInquiryHallFullQuation`,
        payload: {
          rfxAllLine: params,
          organizationId,
          customizeUnitCode: `${this.getCustomizeUnitCode('baseInfo')},${this.getCustomizeUnitCode([
            'allTable',
          ])},SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER,SSRC.${
            this.sourceKey
          }_HALL.BARGAIN.QUOTATION_ITEM`,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              itemContentChange: {},
              supplierContentChange: {},
              aloneItemLine: {},
              aloneSupplierItemLine: {},
              itemLineChange: false,
              supplierLineChange: false,
              allLineChange: false,
            },
          });
        }

        this.fetchInquiryHallUpdate();
        this.setState({ expand: {} });
        this.allQuotationTableUnSelected();
      });
    });
  }

  /**
   *还比价提交
   */
  @debounce(800)
  @Bind()
  async submitInquiryHallFullQuoation() {
    const { dispatch, form, organizationId, modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { aloneSupplierItemLine = {}, aloneItemLine = {} },
    } = this.props;
    const {
      activeKey,
      // allLineSelectesRows,
      // itemLineSelectedRows,
      itemLineSelectedRowKeys,
      // supplierLineSelectedRows,
      supplierLineSelectedRowKeys,
    } = this.state;
    let params = [];

    if (activeKey === 'itemLine') {
      if (itemLineSelectedRowKeys.length && !isEmpty(aloneItemLine)) {
        // 获取已修改的数据
        // params = getEditTableData(itemLineSelectedRows);
        const allItem = Object.values(aloneItemLine).reduce(
          (prev, current) => prev.concat(getEditTableData(current.list)),
          []
        );
        allItem.forEach((item) => {
          const { quotationLineId } = item || {};
          const selectItem = itemLineSelectedRowKeys.filter((id) => id && id === quotationLineId);
          if (!isEmpty(selectItem)) {
            params.push(item);
          }
        });
      } else {
        Modal.warning({
          title: intl.get(`ssrc.inquiryHall.view.message.confirm.select`).d('请勾选要还价的行！'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
        return;
      }
    }
    if (activeKey === 'supplierLine') {
      if (supplierLineSelectedRowKeys.length && !isEmpty(aloneSupplierItemLine)) {
        const allSupplier = Object.values(aloneSupplierItemLine).reduce(
          (prev, current) => prev.concat(getEditTableData(current.list)),
          []
        );
        allSupplier.forEach((supplier) => {
          const { quotationLineId } = supplier || {};
          const selectSupplier = supplierLineSelectedRowKeys.filter(
            (id) => id && id === quotationLineId
          );
          if (!isEmpty(selectSupplier)) {
            params.push(supplier);
          }
        });
      } else {
        Modal.warning({
          title: intl.get(`ssrc.inquiryHall.view.message.confirm.select`).d('请勾选要还价的行！'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
        return;
      }
    }

    if (activeKey === 'allLine') {
      const { selected: allSelected = [] } = this.fullQuotationDS;

      if (allSelected?.length === 0) {
        Modal.warning({
          title: intl.get(`ssrc.inquiryHall.view.message.confirm.select`).d('请勾选要还价的行！'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
        return;
      }

      allSelected.forEach((lines) => {
        lines.set('status', 'update');
      });

      const validateFlag = await this.fullQuotationDS.validate(true);
      if (!validateFlag) {
        return;
      }

      const allData = this.fullQuotationDS.toJSONData(true) || [];
      if (isEmpty(allData)) {
        return;
      }
      params = [...params, ...allData];
    }

    form.validateFields(() => {
      if (isEmpty(params)) {
        Modal.confirm({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.dataNotNullSub`)
            .d('提交数据不能为空,请展开数据进行提交'),
        });
        return;
      }

      dispatch({
        type: `${modelName}/submitInquiryHallFullQuation`,
        payload: {
          rfxAllLine: params,
          organizationId,
          customizeUnitCode: `${this.getCustomizeUnitCode('baseInfo')},${this.getCustomizeUnitCode([
            'allTable',
          ])},SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER,SSRC.${
            this.sourceKey
          }_HALL.BARGAIN.QUOTATION_ITEM`,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.afterOperateInitStoreAndState();
          this.fetchInquiryHallUpdate();
          this.allQuotationTableUnSelected();
        }
      });
    });
  }

  // 操作之后初始化数据
  afterOperateInitStoreAndState = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.props.modelName}/updateState`,
      payload: {
        itemContentChange: {},
        supplierContentChange: {},
        aloneItemLine: {},
        aloneSupplierItemLine: {},
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
        // allLine: [],
        // allLinePagination: {},
      },
    });

    this.setState({
      expand: {},
      // allLineSelectedRowKeys: [],
      // allLineSelectesRows: [],
      itemLineSelectedRowKeys: [],
      itemLineSelectedRows: [],
      supplierLineSelectedRowKeys: [],
      supplierLineSelectedRows: [],
      // allCachSelectObj: [],
    });
  };

  // 批量填写还价-获取勾选行币种
  getCurrencyCodeFromSelectedLines = (param) => {
    const { data } = param || {};

    let quotationCurrencyCodeUnique = null;
    if (!data?.length) {
      return quotationCurrencyCodeUnique;
    }

    for (const item of data) {
      if (!item) {
        return;
      }

      const { quotationCurrencyCode } = item?.quotationLineId
        ? item
        : item.get(['quotationCurrencyCode']);

      if (quotationCurrencyCodeUnique && quotationCurrencyCodeUnique !== quotationCurrencyCode) {
        quotationCurrencyCodeUnique = null;
        break;
      }

      quotationCurrencyCodeUnique = quotationCurrencyCode;
    }

    return quotationCurrencyCodeUnique;
  };

  /**
   *  批量填写还价 - 打开
   */
  @Bind()
  handleCounterOffersBulk() {
    const {
      activeKey,
      itemLineSelectedRowKeys = [],
      itemLineSelectedRows = [],
      supplierLineSelectedRowKeys = [],
      supplierLineSelectedRows = [],
    } = this.state;
    if (activeKey === 'itemLine') {
      if (isEmpty(itemLineSelectedRowKeys)) {
        Modal.warning({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.counterOffersBulk`)
            .d('请勾选要批量填写还价的行！'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
      } else {
        this.setState({
          counterOffersBulkVisible: true,
          counterOffersBulkData: {
            quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({
              data: itemLineSelectedRows,
            }),
          },
        });
      }
    } else if (activeKey === 'supplierLine') {
      if (isEmpty(supplierLineSelectedRowKeys)) {
        Modal.warning({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.counterOffersBulk`)
            .d('请勾选要批量填写还价的行！'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
      } else {
        this.setState({
          counterOffersBulkVisible: true,
          counterOffersBulkData: {
            quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({
              data: supplierLineSelectedRows,
            }),
          },
        });
      }
    } else if (activeKey === 'allLine') {
      const { selected: allSelected = [] } = this.fullQuotationDS;
      if (!allSelected?.length) {
        Modal.warning({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.counterOffersBulk`)
            .d('请勾选要批量填写还价的行！'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
        });
      } else {
        this.setState({
          counterOffersBulkVisible: true,
          counterOffersBulkData: {
            quotationCurrencyCode: this.getCurrencyCodeFromSelectedLines({ data: allSelected }),
          },
        });
      }
    }
  }

  /**
   * 批量填写还价 - 保存
   * @param {*} values
   */
  @debounce(800)
  @Bind()
  handleSaveCounterOffersBulk(values) {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    const {
      activeKey,
      // allLineSelectedRowKeys = [],
      itemLineSelectedRowKeys = [],
      supplierLineSelectedRowKeys = [],
    } = this.state;
    let bargainList = [];
    if (activeKey === 'itemLine') {
      // 物品明细
      bargainList = itemLineSelectedRowKeys;
    } else if (activeKey === 'supplierLine') {
      // 供应商
      bargainList = supplierLineSelectedRowKeys;
    } else {
      // 全部报价
      const { selected: allSelected = [] } = this.fullQuotationDS;
      allSelected.forEach((lines) => {
        lines.set('status', 'update');
      });

      const selectedData = this.fullQuotationDS.toJSONData(true) || [];
      selectedData.forEach((line) => {
        bargainList.push(line.quotationLineId);
      });
    }

    if (isEmpty(bargainList)) {
      return;
    }

    dispatch({
      type: `${this.props.modelName}/handleSaveCounterOffersBulk`,
      payload: {
        ...values,
        organizationId,
        bargainList,
        rfxHeaderId: params.rfxId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleCancelCounterOffersBulk();
        this.fetchInquiryHallUpdate();
        if (activeKey === 'itemLine') {
          // 物品明细
          this.setState({
            itemLineSelectedRowKeys: [],
            expand: {},
          });
          dispatch({
            type: `${this.props.modelName}/updateState`,
            payload: {
              aloneItemLine: {},
            },
          });
        } else if (activeKey === 'supplierLine') {
          // 供应商
          this.setState({
            supplierLineSelectedRowKeys: [],
            expand: {},
          });
          dispatch({
            type: `${this.props.modelName}/updateState`,
            payload: {
              aloneSupplierItemLine: {},
            },
          });
        } else {
          this.allQuotationTableUnSelected();
        }
      }
    });
  }

  // 全部报价明细表格清空勾选
  allQuotationTableUnSelected = () => {
    this.fullQuotationDS.unSelectAll();
    this.fullQuotationDS.clearCachedSelected();
  };

  /**
   * 批量填写还价 - 关闭
   */
  @Bind()
  handleCancelCounterOffersBulk() {
    this.setState({
      counterOffersBulkVisible: false,
      counterOffersBulkData: {},
    });
  }

  /**
   * 点击小图打开缩略图
   */

  @Bind()
  openPriceCharts(e, chartFlag, id) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    this.viewPriceCharts(chartFlag, id);
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
        type: `${this.props.modelName}/fetchPriceChartsData`,
        payload: { rfxLineItemId: id, organizationId, rfxHeaderId: params.rfxId },
      }).then((result) => {
        if (result) {
          this.setState({ chartsLoading: { [id]: { fetchPriceChartLoading: false } }, id });
          this.itemPriceChartsData(result);
        }
      });
    } else {
      // 查询供应商缩略图数据
      dispatch({
        type: `${this.props.modelName}/fetchPriceChartsData`,
        payload: { rfxLineSupplierId: id, organizationId, rfxHeaderId: params.rfxId },
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
      type: `${this.props.modelName}/updateState`,
      payload: {
        priceChartsData: [],
      },
    });
  }

  /**
   * 还比价头部信息
   */

  renderHeaderTitle(header = {}) {
    return (
      <h3
        style={{ width: '96%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {header.rfxNum}-
        <Tooltip title={`${header.rfxNum}-${header.rfxTitle}`} overlayStyle={{ minWidth: '300px' }}>
          {header.rfxTitle}
        </Tooltip>
      </h3>
    );
  }

  /**
   * 查看历史最低价
   */
  @Bind()
  handleViewHistoryLow(item) {
    if (
      item.priceLibHistoryDTO &&
      (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
    ) {
      this.setState({
        priceComparisonModalVisible: true,
        item,
      });
    }
  }

  /**
   * 渲染历史最低价信息
   */
  renderHistoricalLowTip(priceLibHistoryDTO) {
    let title = '';
    if (
      priceLibHistoryDTO &&
      (priceLibHistoryDTO.unitPrice || priceLibHistoryDTO.unitPrice === 0)
    ) {
      let creationDate = dateRender(priceLibHistoryDTO.creationDate);
      creationDate = creationDate.split('-');
      title = (
        <React.Fragment>
          <div>
            {priceLibHistoryDTO.supplierCompanyNum} {priceLibHistoryDTO.supplierCompanyName}
          </div>
          <div>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.historyPrice').d('历史单价')}：
            {priceLibHistoryDTO.unitPrice}/{priceLibHistoryDTO.uomName}
          </div>
          <div>
            {intl.get(`ssrc.common.taxRate`).d('税率')}： {priceLibHistoryDTO.taxRate}%
          </div>
          <div>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期')}：
            {creationDate[0]}
            {intl.get('ssrc.inquiryHall.date.unit.year').d('年')}
            {creationDate[1]}
            {intl.get('ssrc.inquiryHall.date.unit.month').d('月')}
            {creationDate[2]}
            {intl.get('ssrc.inquiryHall.date.unit.day').d('日')}
          </div>
          <div>
            {intl
              .get('ssrc.inquiryHall.view.message.historyQuoteAnalysis')
              .d('（点击查看历史报价分析）')}
          </div>
        </React.Fragment>
      );
    } else {
      title = intl.get('ssrc.inquiryHall.model.inquiryHall.temporarilyNoData').d('暂无数据');
    }
    return title;
  }

  /**
   * 物料头部明细
   */

  renderHeaderInfo(item) {
    const { ssrcRemote } = this.props;
    const { expand } = this.state;
    // const { organizationId } = this.props;
    const { taxRate } = item || {};
    const chartFlag = 'i';

    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <Row style={{ display: 'flex', alignItems: 'center' }}>
              <Col span={8}>
                <div
                  className={styles.itemListImg}
                  onClick={(e) => this.openPriceCharts(e, chartFlag, item.rfxLineItemId)}
                >
                  <img src={goodsIcon} alt="" style={{ width: 44, height: 44 }} />
                </div>
                <div className={styles.itemMsg}>
                  <div style={{ height: 22 }}>
                    <span
                      className={styles.itemListNum}
                      style={{
                        fontSize: '12px',
                        display: 'inline-block',
                        height: '24px',
                        lineHeight: '24px',
                        width: '96px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Popover
                        content={
                          <span>
                            {item.itemCode ? `${item.itemCode}-` : null}
                            {item.itemName}
                          </span>
                        }
                      >
                        {item.itemCode ? `${item.itemCode}-` : null}
                        {item.itemName}
                      </Popover>
                    </span>
                    <Icon
                      className={styles.arrowIconT}
                      type={!expand[item.rfxLineItemId] ? 'down' : 'up'}
                      onClick={(e) => this.expandItemLine(e, item.rfxLineItemId)}
                    />
                  </div>
                  <div style={{ height: 22, display: 'inline-flex' }}>
                    <span className={styles.itemListDesItem} onClick={(e) => this.rfxLineTag(e)}>
                      {item.attachmentUuid && (
                        <NewAttachment
                          bucketName={PRIVATE_BUCKET}
                          bucketDirectory="ssrc-rfx-rfxitem"
                          value={item.attachmentUuid}
                          viewMode="popup"
                          readOnly
                          style={{
                            height: '22px',
                            paddingLeft: 0,
                          }}
                        />
                      )}
                    </span>
                    {item.itemRemark ? (
                      <Popover content={`${item.itemRemark}`}>
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '8em',
                            display: 'inline-block',
                          }}
                          className={styles.itemListDesItem}
                        >
                          {item.itemRemark}
                        </span>
                      </Popover>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </Col>
              <Col
                span={12}
                style={{ display: 'flex', alignItems: 'center' }}
                className={classnames(styles['collapse-item-tags-wrapper'])}
              >
                <Tag
                  style={{
                    backgroundColor: 'rgba(6,135,255,0.1)',
                    color: 'rgb(6,135,255)',
                    height: '24px',
                    borderRadius: '2px',
                    border: 'hidden',
                    lineHeight: '24px',
                    textAlign: 'center',
                    marginRight: '8px',
                  }}
                >
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
                  {item.rfxLineItemNum}
                </Tag>
                {item.rfxQuantity && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(241,49,49,0.1)',
                      color: 'rgb(241,49,49)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                      maxWidth: '80%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Tooltip title={`${item.secondaryQuantity}（${item.secondaryUomName}）`}>
                      {item.secondaryQuantity}（{item.secondaryUomName}）
                    </Tooltip>
                  </Tag>
                )}
                {item.itemCategoryName && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(255,188,0,0.1)',
                      color: 'rgb(255,188,0)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {item.itemCategoryName}
                  </Tag>
                )}

                {!isNil(taxRate) ? (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(255,188,0,0.1)',
                      color: 'rgb(255,188,0)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：
                    {taxRate}
                  </Tag>
                ) : (
                  ''
                )}
                {item.quotationRange && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(255,188,0,0.1)',
                      color: 'rgb(255,188,0)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
                    {item.quotationRange}
                  </Tag>
                )}
                {
                  // 【好利来】二开埋点，请勿删除，谨慎修改！！！
                  ssrcRemote
                    ? ssrcRemote.render(
                        'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_RENDER_ITEM_TAB_TAGS',
                      <></>,
                        {
                          bidFlag: this.bidFlag,
                          itemRecord: item,
                        }
                      )
                    : null
                }
              </Col>
              <Col span={4}>
                <span onClick={(e) => this.rfxLineTag(e)}>
                  <Tooltip title={this.renderHistoricalLowTip(item.priceLibHistoryDTO)}>
                    <a onClick={() => this.handleViewHistoryLow(item)}>
                      {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}
                      ：
                      {item.priceLibHistoryDTO &&
                      (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
                        ? item.priceLibHistoryDTO.unitPrice
                        : intl.get('ssrc.inquiryHall.view.message.empty').d('暂无')}
                    </a>
                  </Tooltip>
                </span>
              </Col>
            </Row>
          </div>

          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 供应商头部明细
   */
  @Bind()
  renderSupplierHeaderInfo(item) {
    const { ssrcRemote } = this.props;
    const { expand, newQuotationFlag = 0 } = this.state;
    const content = (
      <span className={styles.itemListNum}>
        {item.supplierCompanyNum
          ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
          : item.supplierCompanyName}
      </span>
    );
    const fileFlag =
      item.submitAttachmentFlag === 1 && (item.businessAttachmentUuid || item.techAttachmentUuid);
    const fileVisableFlag = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_PROCESS_SUPPLIER_FILE_GROUP',
          fileFlag,
          { item }
        )
      : fileFlag;
    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <Row style={{ height: 44 }} gutter={24}>
              <Col span={14} style={{ height: 44, display: 'flex' }}>
                <div className={styles.itemListImg}>
                  <img src={supplierIcon} alt="" style={{ width: 44, height: 44 }} />
                </div>
                <div className={styles.itemMsgSub}>
                  <div style={{ height: 22 }}>
                    <Popover
                      content={
                        item.supplierCompanyNum
                          ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                          : item.supplierCompanyName
                      }
                    >
                      {content}
                    </Popover>
                    <Icon
                      className={styles.arrowIcon}
                      type={!expand[item.rfxLineSupplierId] ? 'down' : 'up'}
                      onClick={(e) => this.expandSupplier(e, item.rfxLineSupplierId)}
                    />
                  </div>
                  <div style={{ height: 22, color: 'rgba(102,102,102,1)', display: 'flex' }}>
                    <Popover content={item.contactName}>
                      <span
                        style={{
                          width: '96px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginRight: '8px',
                          display: 'inline-block',
                        }}
                      >
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}：
                        {item.contactName}
                      </span>
                    </Popover>
                    <Popover
                      content={phoneRender(
                        item.internationalTelCodeMeaning,
                        item.contactMobilephone
                      )}
                    >
                      <span className={styles.itemListDesItem}>
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
                        {phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                      </span>
                    </Popover>
                    <Popover content={item.contactMail}>
                      <span className={styles.itemListDesItem}>
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：
                        {item.contactMail}
                      </span>
                    </Popover>
                  </div>
                </div>
              </Col>
              <Col span={8} style={{ height: 80, lineHeight: '30px' }}>
                {item.feedbackStatusMeaning ===
                  intl.get(`ssrc.inquiryHall.model.inquiryHall.alreadyInvolved`).d('已参与') && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(6,135,255,0.1)',
                      color: 'rgb(6,135,255)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {item.feedbackStatusMeaning}
                  </Tag>
                )}
                {item.feedbackStatusMeaning ===
                  intl.get(`ssrc.inquiryHall.model.inquiryHall.noFeedback`).d('未反馈') && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(170,170,170,0.1)',
                      color: 'rgb(170,170,170)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {item.feedbackStatusMeaning}
                  </Tag>
                )}
                {item.feedbackStatusMeaning ===
                  intl.get(`ssrc.inquiryHall.model.inquiryHall.abandoned`).d('已放弃') && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(170,170,170,0.1)',
                      color: 'rgb(170,170,170)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {item.feedbackStatusMeaning}
                  </Tag>
                )}
                {item.quotationNumber && (
                  <Tag
                    style={{
                      backgroundColor: 'rgba(6,135,255,0.1)',
                      color: 'rgb(6,135,255)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      textAlign: 'center',
                      marginRight: '8px',
                    }}
                  >
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.quotationLineNumber`)
                      .d('报价行数')}
                    ：{item.quotationNumber}
                  </Tag>
                )}
                {item.supplierTotalAmount ? (
                  <Tag
                    style={{
                      backgroundColor: 'rgb(241,49,49,0.1)',
                      color: 'rgb(241,49,49)',
                      height: '24px',
                      borderRadius: '2px',
                      border: 'hidden',
                      lineHeight: '24px',
                      marginRight: '8px',
                      minwidth: '120px',
                    }}
                  >
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`)
                      .d('报价总价')}
                    ：{item.supplierTotalAmount}
                  </Tag>
                ) : null}
              </Col>
              <Col span={2} style={{ height: 44, lineHeight: '44px' }}>
                <p className={styles.itemListDes}>
                  <span className={styles.itemListDesItem} onClick={(e) => this.rfxSupplierTag(e)}>
                    {fileVisableFlag && (
                      //   item.feedbackStatusMeaning === '已放弃' ? (
                      //   <a style={{ color: 'rgb(170,170,170)' }}>
                      //     {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewAttachments`).d('附件')}
                      //   </a>
                      // ) : (
                      <span>
                        {!newQuotationFlag ? (
                          <a
                            onClick={() =>
                              this.showUploadModal(
                                item.businessAttachmentUuid,
                                item.techAttachmentUuid
                              )
                            }
                            style={{ display: 'inline-flex' }}
                          >
                            {intl.get('hzero.common.upload.modal.title').d('附件')}
                            <RenderFileTotalCount record={item} uiType="h0" />
                            {/* <span style={{ marginLeft: '5.4px' }}> */}
                            <img src={fileIcon} style={{ paddingLeft: '5.4px' }} alt="" />
                            {/* </span> */}
                          </a>
                        ) : (
                          <FileGroup record={item} uiType="h0" fileType="HEADER" />
                        )}
                      </span>
                      // )
                    )}
                  </span>
                </p>
              </Col>
            </Row>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   *展开时重新调用单独查询物品明细列表数据
   */
  @debounce(200)
  expandItemLine(e, rfxLineItemId) {
    e.stopPropagation();
    const { modelName = 'inquiryHall' } = this.props;
    const { itemContentChange = {} } = this.props[modelName];
    const { expand } = this.state;
    const currentStatus = expand[rfxLineItemId];
    if (!currentStatus) {
      const loadingObj = {
        [rfxLineItemId]: { fetchAloneItemLineLoading: true },
      };
      this.setState({ loadingObj });
      const {
        match: { params },
        dispatch,
        organizationId,
      } = this.props;
      dispatch({
        type: `${this.props.modelName}/fetchAloneItemLine`,
        payload: {
          page: {},
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxLineItemId,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_ITEM`,
        },
      }).then(() => {
        this.setState({ loadingObj: { [rfxLineItemId]: { fetchAloneItemLineLoading: false } } });
      });
    } else {
      const {
        [modelName]: { aloneItemLine = {} },
      } = this.props;
      const dataSource =
        aloneItemLine[`${rfxLineItemId}`] && aloneItemLine[`${rfxLineItemId}`].list
          ? aloneItemLine[`${rfxLineItemId}`].list
          : [];
      // 获取接口数据中的行ID作为rowKeys
      const quotationLineIdMap = dataSource.map((item) => {
        return item.quotationLineId;
      });
      const differenceKeys = difference(this.state.itemLineSelectedRowKeys, quotationLineIdMap);
      this.setState({ itemLineSelectedRowKeys: differenceKeys });
    }

    // 有值改变时,关闭时,改变的数据设置为false
    if (itemContentChange[rfxLineItemId]) {
      this.props.dispatch({
        type: `${this.props.modelName}/updateState`,
        payload: {
          // itemLineChange: true,
          itemContentChange: {
            ...itemContentChange,
            [rfxLineItemId]: false,
          },
        },
      });
    } else {
      this.props.dispatch({
        type: `${this.props.modelName}/updateState`,
        payload: {
          itemContentChange: {
            ...itemContentChange,
            [rfxLineItemId]: false,
          },
        },
      });
    }
    this.setState({
      expand: {
        ...expand,
        [rfxLineItemId]: !expand[rfxLineItemId],
      },
    });
  }

  /**
   *展开时重新调用单独查询供应商明细列表数据
   */
  @debounce(200)
  expandSupplier(e, supplierRecord = {}) {
    e.stopPropagation();
    const { expand } = this.state;
    const { modelName = 'inquiryHall' } = this.props;
    const { supplierContentChange = {} } = this.props[modelName];
    const { rfxLineSupplierId } = supplierRecord || {};
    const currentStatus = expand[rfxLineSupplierId];

    if (!currentStatus) {
      const loadingObj = {
        [rfxLineSupplierId]: { fetchAloneSupplierItemLineLoading: true },
      };
      this.setState({ loadingObj });
      const {
        match: { params },
        dispatch,
        organizationId,
      } = this.props;
      dispatch({
        type: `${this.props.modelName}/fetchAloneSupplierItemLine`,
        payload: {
          page: {},
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxLineSupplierId,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER`,
        },
      }).then(() => {
        this.setState({
          loadingObj: { [rfxLineSupplierId]: { fetchAloneSupplierItemLineLoading: false } },
        });
      });
    } else {
      const {
        [modelName]: { aloneSupplierItemLine = {} },
      } = this.props;
      const dataSource =
        aloneSupplierItemLine[`${rfxLineSupplierId}`] &&
        aloneSupplierItemLine[`${rfxLineSupplierId}`].list
          ? aloneSupplierItemLine[`${rfxLineSupplierId}`].list
          : [];
      // 获取接口数据中的行ID作为rowKeys
      const quotationLineIdMap = dataSource.map((item) => {
        return item.quotationLineId;
      });
      const differenceKeys = difference(this.state.supplierLineSelectedRowKeys, quotationLineIdMap);
      this.setState({ supplierLineSelectedRowKeys: differenceKeys });
    }
    // 有值改变时,关闭时,改变的数据设置为false
    if (supplierContentChange[rfxLineSupplierId]) {
      this.props.dispatch({
        type: `${this.props.modelName}/updateState`,
        payload: {
          supplierContentChange: {
            ...supplierContentChange,
            [rfxLineSupplierId]: false,
          },
        },
      });
    } else {
      this.props.dispatch({
        type: `${this.props.modelName}/updateState`,
        payload: {
          supplierContentChange: {
            ...supplierContentChange,
            [rfxLineSupplierId]: false,
          },
        },
      });
    }
    this.setState({
      expand: {
        ...expand,
        [rfxLineSupplierId]: !expand[rfxLineSupplierId],
      },
    });
  }

  /**
   * 改变tabs
   */

  @Bind()
  changeTabs(key) {
    const { modelName = 'inquiryHall', dispatch } = this.props;
    const {
      [modelName]: { allLineChange, itemContentChange, supplierContentChange },
    } = this.props;
    const itemContentChangeValues = Object.values(itemContentChange).find((n) => n === true);
    const supplierContentChangeValue = Object.values(supplierContentChange).find((n) => n === true);
    // 物料行key变化
    if (itemContentChangeValues === true || supplierContentChangeValue === true || allLineChange) {
      if (itemContentChangeValues === true) {
        // 物料行
        Modal.confirm({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.saveItemData`)
            .d('请保存物料行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'itemLine', expand: {} });
          },
          onCancel: () => {
            this.setState({
              activeKey: key,
              expand: {},
            });
            // 清空当前tab页物料行数据
            dispatch({
              type: `${this.props.modelName}/updateState`,
              payload: {
                aloneItemLine: {},
                itemContentChange: {},
                itemLineChange: false,
              },
            });
          },
        });
      }
      if (supplierContentChangeValue === true) {
        // 供应商行
        Modal.confirm({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.saveSupLineData`)
            .d('请保存供应商行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'supplierLine', expand: {} });
          },
          onCancel: () => {
            this.setState({
              activeKey: key,
              expand: {},
            });
            // 清空当前tab页供应商行数据
            dispatch({
              type: `${this.props.modelName}/updateState`,
              payload: {
                aloneSupplierItemLine: {},
                supplierLineChange: false,
                supplierContentChange: {},
              },
            });
          },
        });
      }
      if (allLineChange) {
        // 全部明细行
        Modal.confirm({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.allDetailsData`)
            .d('请保存全部明细行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'allLine' });
          },
          onCancel: () => {
            this.setState({ activeKey: key });
            dispatch({
              type: `${this.props.modelName}/updateState`,
              payload: {
                allLine: [],
                allLineChange: false,
              },
            });
            this.fetchAllLine(); // 获取全部报价明细
          },
        });
      }
    } else {
      this.setState({ activeKey: key });
    }
  }

  /**
   * 物品明细头部 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const { modelName = 'inquiryHall' } = this.props;
    const { itemContentChange = {}, itemLineChange = {} } = this.props[modelName];

    const itemContentChangeValues = Object.values(itemContentChange).find((n) => n === true);
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    // 检测物料明细头部或内容数据发生改变时
    if (itemLineChange && itemContentChangeValues === true) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.changePageTip`)
          .d('切换页面前请先保存数据！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          this.props.dispatch({
            type: `${this.props.modelName}/updateState`,
            payload: {
              itemLineChange: false,
            },
          });
          this.fetchItemLine(changedPagination);
        },
      });
    } else {
      this.fetchItemLine(changedPagination);
    }
  }

  /**
   * 供应商列表头部 - 改变分页
   */

  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const { modelName = 'inquiryHall' } = this.props;
    const { supplierContentChange = {}, supplierLineChange = {} } = this.props[modelName];
    const supplierContentChangeValue = Object.values(supplierContentChange).find((n) => n === true);
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    // 检测供应商头部或内容数据发生改变时
    if (supplierLineChange && supplierContentChangeValue === true) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.changePageTip`)
          .d('切换页面前请先保存数据！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          this.props.dispatch({
            type: `${this.props.modelName}/updateState`,
            payload: {
              supplierLineChange: false,
            },
          });
          this.fetchSupplierLineBarginPrice(changedPagination);
        },
      });
    } else {
      this.fetchSupplierLineBarginPrice(changedPagination);
    }
  }

  // 跨页保存
  // @Bind()
  // saveBeforeChange(page, _, sorter){
  //   const {
  //     dispatch,
  //     form,
  //     organizationId,
  //     inquiryHall: { allLine = {} },
  //   } = this.props;

  //   const params = getEditTableData(allLine);
  //   form.validateFields(() => {
  //       dispatch({
  //         type: 'inquiryHall/saveInquiryHallFullQuation',
  //         payload: {
  //           rfxAllLine: params,
  //           organizationId,
  //           customizeUnitCode:
  //             'SSRC.INQUIRY_HALL.BARGAIN.ALL_QUOTATION,SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_SUPPLIER,SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_ITEM',
  //         },
  //       }).then((res) => {
  //         if (res) {
  //           notification.success();
  //           dispatch({
  //             type: 'inquiryHall/updateState',
  //             payload: {
  //               itemContentChange: {},
  //               supplierContentChange: {},
  //               aloneItemLine: {},
  //               aloneSupplierItemLine: {},
  //               itemLineChange: false,
  //               supplierLineChange: false,
  //               allLineChange: false,
  //             },
  //           });
  //           this.fetchAllLine(page, _, sorter);
  //         } else {
  //           this.fetchAllLine(page, _, sorter);
  //         }
  //       });
  //   });
  // }

  /**
   * 物料明细列表content切换分页时，先保存数据
   */

  @Bind()
  changeItemLinePage(page, rfxLineItemId) {
    // 判断当前table是否改变
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const { itemContentChange = {} } = this.props[modelName];
    if (itemContentChange[rfxLineItemId]) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.changePageTip`)
          .d('切换页面前请先保存数据！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          dispatch({
            type: `${this.props.modelName}/fetchAloneItemLine`,
            payload: {
              page,
              organizationId,
              rfxHeaderId: params.rfxId,
              rfxLineItemId,
              customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_ITEM`,
            },
          });
        },
      });
    } else {
      dispatch({
        type: `${this.props.modelName}/fetchAloneItemLine`,
        payload: {
          page,
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxLineItemId,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_ITEM`,
        },
      });
    }
  }

  /**
   * 供应商明细列表content切换分页时，先保存数据
   */
  @Bind()
  changeSupplierLinePage(page, rfxLineSupplierId) {
    // 判断当前table是否改变
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const { itemContentChange = {} } = this.props[modelName];
    if (itemContentChange[rfxLineSupplierId]) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.changePageTip`)
          .d('切换页面前请先保存数据！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.inquiryHall.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          dispatch({
            type: `${this.props.modelName}/fetchAloneSupplierItemLine`,
            payload: {
              page,
              organizationId,
              rfxHeaderId: params.rfxId,
              rfxLineSupplierId,
              customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER`,
            },
          });
        },
      });
    } else {
      dispatch({
        type: `${this.props.modelName}/fetchAloneSupplierItemLine`,
        payload: {
          page,
          organizationId,
          rfxHeaderId: params.rfxId,
          rfxLineSupplierId,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER`,
        },
      });
    }
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

  /**
   * 汇率编辑 取消
   *
   * @memberof CheckPrice
   */
  @Bind()
  cancelExchangeEdit() {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.props.modelName}/updateState`,
      payload: {
        exchangeEditSupplierList: [],
      },
    });
    this.setState({
      exchangeEditModalVisible: false,
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
    const { modelName = 'inquiryHall' } = this.props;
    const {
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

      const rateDate = values.rateDate ? values.rateDate.format(DEFAULT_DATE_FORMAT) : null;
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
   * 汇率编辑/查询供应商信息
   *
   * @param {*} [page={}]
   * @memberof CheckPrice
   */
  @Bind()
  querySupplierExchangeEdit(date = {}) {
    const {
      organizationId,
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: `${this.props.modelName}/querySupplierExchangeEdit`,
      payload: {
        ...date,
        organizationId,
        sourceHeaderId: params.rfxId,
        sourceFrom: 'RFX',
      },
    });
  }

  /**
   * 汇率编辑 保存
   *
   * @memberof CheckPrice
   */
  @Bind()
  saveExchangeEdit() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      organizationId,
      [modelName]: { exchangeEditSupplierList = [] },
    } = this.props;

    const newParams = getEditTableData(exchangeEditSupplierList, []);

    if (isEmpty(newParams)) {
      return;
    }

    dispatch({
      type: `${this.props.modelName}/saveExchangeEdit`,
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
      this.fetchInquiryHallUpdate();
      this.allQuotationTableUnSelected();
    });
  }

  getBackPath() {
    const activeTabKey = getActiveTabKey();
    const back = `${activeTabKey}/list`;
    return back;
  }

  // customize code
  getCustomizeUnitCode = (type = null) => {
    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['allTable', 'SSRC.INQUIRY_HALL.BARGAIN.NEW_ALL_QUOTATION'], // all quotation table
      ['allTableSearch', 'SSRC.INQUIRY_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER'], // all quotation table filter,
      ['headerButtons', 'SSRC.INQUIRY_HALL.BARGAIN.HEADER_BUTTONS'], // header buttons
      ['baseInfo', 'SSRC.INQUIRY_HALL.BARGAIN.BASEINFO_FORM'], // base form
    ]);

    const BidCodeMap = new Map([
      ['allTable', 'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION'], // all quotation table
      ['allTableSearch', 'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER'], // all quotation table filter,
      ['headerButtons', 'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS'], // header buttons
      ['baseInfo', 'SSRC.BID_HALL.BARGAIN.BASEINFO_FORM'], // base form
    ]);

    const CodeDataMap = !this.bidFlag ? RfxCodeMap : BidCodeMap;
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
  };

  @Bind()
  handleRenderPriceCompare(priceComparisonProps) {
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: this.renderPriceCompare(priceComparisonProps),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  renderPriceCompare(priceComparisonProps) {
    return this.sourceKey === INQUIRY ? (
      <PriceComparison {...priceComparisonProps} />
    ) : (
      <BidPriceComparison {...priceComparisonProps} />
    );
  }

  // 批量新导入按钮
  getExcelImportButtonProps = () => {
    const { organizationId, match = {} } = this.props;
    const { params } = match;

    const ImportProps = {
      businessObjectTemplateCode: 'SSRC.RFX_BARGAIN_IMPORT',
      prefixPatch: SRM_SSRC,
      refreshButton: true,
      name: 'batchImportNew',
      args: {
        rfxHeaderId: params.rfxId,
        tenantId: organizationId,
        templateCode: 'SSRC.RFX_BARGAIN_IMPORT',
        fromExport: true,
      },
      buttonProps: {
        style: {
          marginLeft: '8px',
        },
        // funcType: 'flat',
        icon: 'archive',
        // color: 'primary',
        permissionList: [
          {
            code: `${match?.path}.button.batch-import-new`.toLowerCase(),
            type: 'button',
            meaning:
              intl.get(`ssrc.inquiryHall.view.message.title.feedbackBargin`).d('还比价') -
              `${intl.get(`ssrc.common.button.batchImport`).d('批量导入')}(New)`,
          },
        ],
      },
      buttonText: `${intl.get(`ssrc.common.button.batchImport`).d('批量导入')}(New)`,
      autoRefreshInterval: 5000,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      auto: true,
      successCallBack: this.fetchInquiryHallUpdate,
      customeImportTemplate: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_BARGAIN_DOWNLOAD_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/bargain/export`,
        queryParams: {
          rfxHeaderId: params.rfxId,
          customizeUnitCode: this.getCustomizeUnitCode(['allTable']),
        },
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
    };

    // return <CommonImportNew {...ImportProps} />;
    return ImportProps;
  };

  // 还比价头部按钮
  getHeaderButtons() {
    const { showExchangeEdit, item } = this.state;
    const { loading, modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { header = {} },
      match,
    } = this.props;
    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag } = header || {};
    const priceComparisonProps = {
      item,
      rfxId: match.params.rfxId,
      sourceCategory,
      diyLadderQuotationFlag,
    };
    return [
      {
        name: 'bargain',
        btnProps: {
          icon: 'check',
          type: 'primary',
          loading: loading.submit,
          onClick: this.submitInquiryHallFullQuoation,
        },
        child: intl.get('ssrc.inquiryHall.view.button.counteroffer').d('还价'),
      },
      {
        name: 'save',
        btnProps: {
          icon: 'save',
          loading: loading.save,
          onClick: this.saveInquiryHallFullQuoation,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'operateRecord',
        btnProps: {
          icon: 'clock-circle-o',
          type: 'default',
          onClick: this.playView,
        },
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      },
      {
        name: 'comparePriceAssistant',
        btnProps: {
          onClick: () => this.handleRenderPriceCompare(priceComparisonProps),
        },
        child: (
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
      },
      {
        name: 'batchFillCounteroffer',
        btnProps: {
          onClick: this.handleCounterOffersBulk,
        },
        child: (
          <>
            <Iconfont type="main-counter-offer" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.button.counterOffersBulk`).d('批量填写还价')}
          </>
        ),
      },
      showExchangeEdit && {
        name: 'exchangeEdit',
        hidden: !(header && header.multiCurrencyFlag === 1),
        btnProps: {
          icon: 'edit',
          onClick: this.exchangeEdit,
        },
        child: intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑'),
      },
      {
        // 批量导入
        name: 'batchImportNew',
        btnType: 'c7n-pro',
        btnComp: CommonImportNew,
        btnProps: this.getExcelImportButtonProps(),
      },
    ].filter(Boolean);
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      form,
      dispatch,
      match,
      [modelName]: {
        header = {},
        itemLine = [],
        itemLinePagination,
        supplierLinePagination,
        supplierLine = [],
        // allLine = [],
        barginLadderLevelData = [],
        // allLinePagination = {},
        aloneItemLine = {},
        aloneSupplierItemLine = {},
        operationPagination,
        operationData,
        itemContentChange = {},
        supplierContentChange = {},
        code: { bargainType = [] },
        exchangeEditSupplierList = [],
      },
      organizationId,
      loading,
      ssrcRemote,
      getHocInstance,
      customizeTable = noop,
      customizeTabPane = () => {},
      customizeForm,
      customizeBtnGroup = noop,
    } = this.props;
    const {
      // activeKey,
      expand,
      operationRecordModalVisible,
      // allLineSelectesRows,
      // allLineSelectedRowKeys,
      attachmentVisible,
      AttachmentsProps,
      // priceComparisonModalVisible,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      itemLineSelectedRowKeys, // 物料明细rowKeys
      itemLineSelectedRows, // 物料明细rows
      supplierLineSelectedRowKeys, // 供应商rowKeys
      supplierLineSelectedRows, // 供应商rows
      loadingObj, // 列表loading
      viewPriceChartsVisible,
      priceDataSource,
      supplierNameList,
      chartsLoading,
      id,
      counterOffersBulkVisible,
      counterOffersBulkData = {},
      // collapseKeys,
      // item = {},
      doubleUnitFlag,
      exchangeEditModalVisible = false,
      querySupplierExchangeEditLoading,
      saveExchangeEditLoading,
      exchangeEditContentModalVisible = false,
      newQuotationFlag = false,
    } = this.state;
    const priceChartsProps = {
      loading: chartsLoading[id] && chartsLoading[id].fetchPriceChartLoading,
      // loading: chartsLoading,
      priceDataSource,
      supplierNameList,
    };

    // const allLineRowSelection = {
    //   selectedRowKeys: allLineSelectedRowKeys,
    //   selectedRows: allLineSelectesRows,
    //   onChange: this.handleAllLineRowSelectChange,
    //   getCheckboxProps,
    // };
    const itemLineRowSelection = {
      selectedRowKeys: itemLineSelectedRowKeys,
      selectedRows: itemLineSelectedRows,
      onChange: this.handleItemLineRowSelectChange,
      getCheckboxProps,
    };
    const supplierLineRowSelection = {
      selectedRowKeys: supplierLineSelectedRowKeys,
      selectedRows: supplierLineSelectedRows,
      onChange: this.handleSupplierLineRowSelectChange,
      getCheckboxProps,
    };
    // const test=AttachmentsProps;
    const operationRecordProps = {
      dispatch,
      match,
      modelName,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
    };
    const AllLineTableProps = {
      modelName,
      doubleUnitFlag,
      sourceKey: this.sourceKey,
      bidFlag: this.bidFlag,
      organizationId,
      header,
      LadderLevelHeaderData,
      barginLadderLevelData,
      viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      fetchLoading: loading.fetchBarginLadderLevelyTableLoading,
      showQuotationDetail: this.showQuotationDetail,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      // onSearch: this.changeAllPagination,
      viewLadderLevel: this.viewLadderLevelModal,
      fullQuotationDS: this.fullQuotationDS,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      newQuotationFlag,
      ssrcRemote,
    };
    // 物料
    const ItemLineTableProps = {
      header,
      doubleUnitFlag,
      newQuotationFlag,
      dataSource: aloneItemLine,
      itemLineRowSelection,
      dispatch,
      modelName,
      sourceKey: this.sourceKey,
      organizationId,
      itemContentChange,
      match,
      barginLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      onSearch: this.changeItemLinePage,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      saveLoading: loading.saveBarginLadderLevelLoading,
      fetchLoading: loading.fetchBarginLadderLevelyTableLoading,
      loadingObj,
      customizeTable,
      showQuotationDetail: this.showQuotationDetail,
      ssrcRemote,
    };

    const headerInfoProps = {
      customizeForm,
      header,
      sourceKey: this.sourceKey,
      bidFlag: this.bidFlag,
    };

    // 供应商
    const SupplierLineTableProps = {
      header,
      doubleUnitFlag,
      newQuotationFlag,
      dataSource: aloneSupplierItemLine,
      dispatch,
      modelName,
      sourceKey: this.sourceKey,
      organizationId,
      supplierContentChange,
      match,
      saveLoading: loading.saveBarginLadderLevelLoading,
      onSearch: this.changeSupplierLinePage,
      barginLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLoading: loading.fetchBarginLadderLevelyTableLoading,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      onSaveBarginLadderLine: this.saveBarginLadderLine,
      supplierLineRowSelection,
      loadingObj,
      customizeTable,
      showQuotationDetail: this.showQuotationDetail,
    };
    const modalProps = {
      visible: viewPriceChartsVisible,
      width: 805,
      footer: null,
      onCancel: this.hidePriceCharts,
      bodyStyle: { height: 380, marginLeft: '12px', overflow: 'auto' },
      title: '',
    };
    const counterOffersBulkProps = {
      bargainType,
      modalData: counterOffersBulkData,
      currencyCode: header?.currencyCode,
      visible: counterOffersBulkVisible,
      saveLoading: loading.saveCounterOffersBulkLoading,
      onSave: this.handleSaveCounterOffersBulk,
      onCancel: this.handleCancelCounterOffersBulk,
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
      form,
      organizationId,
      exchangeEditContentModalVisible,
      quoteExchangeMainDataOk: this.quoteExchangeMainDataOk,
      quoteExchangeMainDataCancel: this.quoteExchangeMainDataCancel,
      onRef: (node) => {
        this.exchangeRate = node;
      },
    };

    // 【卫龙】二开，需要的参数，请勿删除！！！
    const immediatePricingProps = {
      header,
      dispatch,
      sourceKey: this.sourceKey,
    };

    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl
            .get(`ssrc.inquiryHall.view.message.title.commonStillCompare`, {
              sourceCategoryName: this.sourceKey === BID ? 'BID' : 'RFX',
            })
            .d(`{sourceCategoryName}还比价`)}
        >
          {customizeBtnGroup(
            {
              code: this.getCustomizeUnitCode(['headerButtons']),
              pro: true,
            },
            <DynamicButtons buttons={this.getHeaderButtons()} />
          )}
          {
            // 【卫龙】二开埋点，请勿删除，谨慎修改！！！
            ssrcRemote
              ? ssrcRemote.render('RENDER_IMMEDIATE_PRICING_BUTTON', <></>, immediatePricingProps)
              : null
          }
        </Header>

        <div className={classnames('ued-detail-wrapper', CommonStyle['update-container'])}>
          <Spin spinning={loading.fetchHeaderLoading}>
            <div
              className={classnames(
                CommonStyle['rfx-detail-list-card'],
                styles['ssrc-top-list-section']
              )}
            >
              <TopSection
                code={`SSRC.${this.sourceKey}_HALL.BARGAIN.CARD_HEADER`}
                getHocInstance={getHocInstance}
              >
                <Content className={CommonStyle['custom-page-content']}>
                  <div style={{ height: '48px', lineHeight: '48px' }}>
                    {this.renderHeaderTitle(header)}
                  </div>
                </Content>
              </TopSection>

              <TopSection
                code={`SSRC.${this.sourceKey}_HALL.BARGAIN.CARD_BASE_INFO`}
                getHocInstance={getHocInstance}
              >
                <Content className={CommonStyle['custom-page-content']}>
                  <div style={{ overflowX: 'hidden' }}>
                    <HeaderInfoForm {...headerInfoProps} />
                  </div>
                </Content>
              </TopSection>

              <TopSection
                code={`SSRC.${this.sourceKey}_HALL.BARGAIN.CARD_QUOTATIONS`}
                getHocInstance={getHocInstance}
              >
                <Content className={CommonStyle['custom-page-content']}>
                  {customizeTabPane(
                    { code: `SSRC.${this.sourceKey}_HALL.BARGAIN.TABS` },
                    <Tabs
                      defaultActiveKey="allLine"
                      // activeKey={activeKey}
                      onChange={this.changeTabs}
                      animated={false}
                      className={styles.tabStyle}
                    >
                      <Tabs.TabPane
                        tab={intl
                          .get(`ssrc.inquiryHall.view.message.tab.allQuotationDetails`)
                          .d('全部报价明细')}
                        key="allLine"
                      >
                        <FullQuotation {...AllLineTableProps} />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl
                          .get(`ssrc.inquiryHall.view.message.tab.vendorList`)
                          .d('供应商列表')}
                        key="supplierLine"
                      >
                        <Spin spinning={loading.fetchBargainSupplierLineLoading}>
                          {map(supplierLine, (items) => {
                            return (
                              <div style={{}}>
                                <div onClick={(e) => this.expandSupplier(e, items)}>
                                  {this.renderSupplierHeaderInfo(items)}
                                </div>
                                <div>
                                  {expand[items.rfxLineSupplierId] && (
                                    <SupplierLineTable
                                      rfxLineSupplierId={items.rfxLineSupplierId}
                                      {...SupplierLineTableProps}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </Spin>
                        {supplierLine.length ? (
                          <Pagination
                            className={styles.pagination}
                            {...supplierLinePagination}
                            onChange={(page, pageSize) =>
                              this.changeSupplierLinePagination(page, pageSize)
                            }
                            onShowSizeChange={(current, size) =>
                              this.changeSupplierLinePagination(current, size)
                            }
                          />
                        ) : (
                          ''
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl
                          .get(`ssrc.inquiryHall.view.message.tab.itemDetails`)
                          .d('物品明细')}
                        key="itemLine"
                      >
                        <Spin spinning={loading.fetchItemLineLoading}>
                          {map(itemLine, (items) => {
                            return (
                              <div style={{}}>
                                <div
                                  onClick={(e) => this.expandItemLine(e, items.rfxLineItemId)}
                                  className={styles.arrowStyle}
                                >
                                  {this.renderHeaderInfo(items)}
                                </div>
                                <div>
                                  {expand[items.rfxLineItemId] && (
                                    <ItemLineTable
                                      rfxLineItemId={items.rfxLineItemId}
                                      {...ItemLineTableProps}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </Spin>
                        <Pagination
                          className={styles.pagination}
                          {...itemLinePagination}
                          onChange={(page, pageSize) =>
                            this.changeItemLinePagination(page, pageSize)
                          }
                          onShowSizeChange={(current, size) =>
                            this.changeItemLinePagination(current, size)
                          }
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  )}
                </Content>
              </TopSection>
            </div>
          </Spin>
        </div>

        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        {/* {priceComparisonModalVisible && this.renderPriceCompare(priceComparisonProps)} */}
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {viewPriceChartsVisible && (
          <Modal {...modalProps}>
            <PriceCharts {...priceChartsProps} />
          </Modal>
        )}
        <CounterOffersBulk {...counterOffersBulkProps} />
        {exchangeEditModalVisible && <ExchangeEditModal {...ExchangeEditProps} />}
        {exchangeEditContentModalVisible && <QuoteExchangeMainDateModal {...ExchangeQuoteProps} />}
      </React.Fragment>
    );
  }
}

const hocCommonFunc = (Comp, { bidFlag = false, modelName = 'inquiryHall' }) => {
  const unitCodes = !bidFlag
    ? [
        'SSRC.INQUIRY_HALL.BARGAIN.HEADER_BUTTONS', // 头部按钮组
        'SSRC.INQUIRY_HALL.BARGAIN.ALL_QUOTATION',
        'SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_SUPPLIER',
        'SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_ITEM',
        'SSRC.INQUIRY_HALL.BARGAIN.TABS', // 页签
        'SSRC.INQUIRY_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
        'SSRC.INQUIRY_HALL.BARGAIN.CARD_HEADER',
        'SSRC.INQUIRY_HALL.BARGAIN.CARD_BASE_INFO',
        'SSRC.INQUIRY_HALL.BARGAIN.CARD_QUOTATIONS',
      ]
    : [
        'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS', // 头部按钮
        'SSRC.BID_HALL.BARGAIN.ALL_QUOTATION',
        'SSRC.BID_HALL.BARGAIN.QUOTATION_SUPPLIER',
        'SSRC.BID_HALL.BARGAIN.QUOTATION_ITEM',
        'SSRC.BID_HALL.BARGAIN.TABS', // 页签
        'SSRC.BID_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
        'SSRC.BID_HALL.BARGAIN.CARD_HEADER',
        'SSRC.BID_HALL.BARGAIN.CARD_BASE_INFO',
        'SSRC.BID_HALL.BARGAIN.CARD_QUOTATIONS',
      ];
  return compose(
    withCustomize({
      unitCode: unitCodes,
    }),
    Form.create({ fieldNameProp: null }),
    formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'] }),
    connect(({ [modelName]: inquiryHall, loading }) => ({
      inquiryHall,
      [modelName]: inquiryHall,
      loading: {
        fetchHeaderLoading: loading.effects[`${modelName}/fetchInquiryHeaderDetail`],
        fetchItemLineLoading: loading.effects[`${modelName}/fetchItemLine`],
        fetchBargainSupplierLineLoading:
          loading.effects[`${modelName}/fetchSupplierLineBarginPrice`],
        // fetchAllLineLoading: loading.effects['inquiryHall/fetchAllLine'],
        fetchAloneItemLineLoading: loading.effects[`${modelName}/fetchAloneItemLine`],
        fetchAloneSupplierItemLineLoading:
          loading.effects[`${modelName}/fetchAloneSupplierItemLine`],
        save: loading.effects[`${modelName}/saveInquiryHallFullQuation`],
        submit: loading.effects[`${modelName}/submitInquiryHallFullQuation`],
        latestQuotationSearchLoading: loading.effects[`${modelName}/fetchLatestQuotation`],
        priceComparisonSearchLoading: loading.effects[`${modelName}/fetchLatestQuotation`],
        fetchBarginLadderLevelyTableLoading:
          loading.effects[`${modelName}/fetchBarginLadderLevelyTable`],
        saveBarginLadderLevelLoading: loading.effects[`${modelName}/saveBarginLadderLevel`],
        saveCounterOffersBulkLoading: loading.effects[`${modelName}/handleSaveCounterOffersBulk`],
        querySupplierExchangeEditLoading: loading.effects[`${modelName}/querySupplierExchangeEdit`],
        saveExchangeEditLoading: loading.effects[`${modelName}/saveExchangeEdit`],
      },
      fetchPriceChartLoading: loading.effects[`${modelName}/fetchPriceChartsData`],
      fetchQuotationDetailLoading: loading.effects[`${modelName}/fetchQuotationDetail`],
      organizationId: getCurrentOrganizationId(),
      modelName,
    })),
    remote(
      // 二开项目埋点
      {
        code: 'SSRC_FEEDBACKBARGIN', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
        name: 'ssrcRemote', // 默认 'remote'， 如有属性冲突可以改此属性
      }
    )
  )(Comp);
};

const HOCComponent = (Comp) => {
  return hocCommonFunc(Comp, { bidFlag: false, modelName: 'inquiryHall' });
};

export default HOCComponent(FeedbackBargain);
export { HOCComponent, FeedbackBargain, hocCommonFunc };
