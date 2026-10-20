/**
 * inquiryHall - 寻源服务/询价大厅-还比价（FeedbackBargin）
 * @date: 2019-01-07
 * @author: LC <chao.li03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { isArray, isEmpty, noop, isNil, compose } from 'lodash';
import { Bind, debounce, Throttle } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { observer } from 'mobx-react';
import {
  Attachment as NewAttachment,
  DataSet,
  Modal as c7nModal,
  Pagination,
  Spin as C7nSpin,
} from 'choerodon-ui/pro';
import { Col, Form, Icon, Modal, Row, Spin, Tag, Tooltip } from 'hzero-ui';
import { Tabs, Popover } from 'choerodon-ui';
import classnames from 'classnames';
import { observable } from 'mobx';

import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';

import fileIcon from '@/assets/file.svg';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { getActiveTabKey } from 'utils/menuTab';
import { TopSection } from '_components/Section';

import { phoneRender } from '@/utils/renderer';
import goodsIcon from '@/assets/goodsIcon.svg';
import supplierIcon from '@/assets/supplierIcon.svg';
import useExchangeEditModal from '@/routes/ssrc/components/ExchangeEditModalsC7N';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import {
  queryEnableDoubleUnit,
  querySourceExchangeRateConfig,
  queryH0OrC7N,
} from '@/services/commonService';
import { isText } from '@/utils/utils';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import {
  fetchInquiryHeaderDetail,
  saveInquiryHallFullQuation,
  submitInquiryHallFullQuation,
  handleSaveCounterOffersBulk,
  querySupplierExchangeEdit,
  saveExchangeEdit,
  saveBarginLadderLevel,
} from '@/services/inquiryHallService';
import { updateFeedBackReadedFlag } from '@/services/inquiryHallNewService';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import CommonStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import ItemLineTable from './ItemLineTable';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import SupplierLineTable from './SupplierLineTable';
import PriceCharts from '../../components/PriceCharts';
import Attachment from '../../components/Attachment';
import { HOCPriceComparison as PriceComparison } from '../../components/PriceComparison';
import BidPriceComparison from '../../components/PriceComparison/BidIndex';
import OperationRecord from '../../components/OperationRecord';
import CounterOffersBulk from './CounterOffersBulk';
import { fullQuotationTableDS } from './fullQuotationTableDS';
import FullQuotation from './FullQuotation';
import HeaderInfoForm from './HeaderInfo';
import LadderLevelModal from './LadderLevelModal';
import {
  headerInfoDS,
  itemListDS,
  itemTableDS,
  supplierListDS,
  supplierTableDS,
  counterOffersBulkDS,
  ExchangeEditModalDS,
  LadderLevelModalDS,
  QuoteExchangeMainDateModalDS,
} from './storeDS';
import ChatRoomSourceLink from "@/routes/components/ChatRoomSource/ChatRoomSourceLink";

import styles from './index.less';

const { openModal } = useExchangeEditModal();

class FeedbackBargain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: 'allLine',
      operationRecordModalVisible: false, // 操作记录模态框
      priceComparisonModalVisible: false, // 比价助手模态框
      expand: {}, // 展开数据
      attachmentVisible: false,
      AttachmentsProps: {},
      supplierColumns: [], // 还比价表头数据格式
      itemId: undefined, // 比价记录点击历史行标记
      viewPriceChartsVisible: false, // 物品明报价细折线图
      priceDataSource: [], // 物品明报价细折线图数据源
      supplierNameList: [], // 物品明报价细折线图有报价的供应商
      chartsLoading: {},
      id: undefined,
      itemQuotationDetailModalVisible: false,
      itemRecord: {},
      item: {}, // 历史最低价物品对象
      quotationDetailVisible: false, // 报价明细
      itemLineRecord: {}, // 物品行记录
      doubleUnitFlag: false, // 判断是否开启双单位
      newQuotationFlag: false, // 开启新报价
      showExchangeEdit: false,
      pageLoading: false, // 页面全局loading
      header: {}, // 存询价单头信息
      headerGroupButtonMaxNum: -1, // 头按钮默认max_num数目
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

  headerInfoDs = new DataSet(
    headerInfoDS({
      bidFlag: this.bidFlag,
    })
  );

  itemListDs = new DataSet(itemListDS());

  supplierListDs = new DataSet(supplierListDS());

  ExchangeEditModalDs = new DataSet(ExchangeEditModalDS());

  QuoteExchangeMainDateModalDs = new DataSet(QuoteExchangeMainDateModalDS());

  LadderLevelModalDs = new DataSet(LadderLevelModalDS());

  itemMap = observable.map({});

  supplierMap = observable.map({});

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
    this.fetchH0OrC7N();
    this.fetchInquiryHallUpdate();
    this.queryDoubleUnit();
    this.newQuotationConfigSheet();
    this.handleSearchSourceExchangeRateConfig();
    this.handleUpdateFeedBackReadedFlag();
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchInquiryHallUpdate();
    }
  }

  // 还比价更新已读
  handleUpdateFeedBackReadedFlag = async () => {
    const { organizationId, match } = this.props;
    const { rfxId: rfxHeaderId } = match?.params || {};

    if (!rfxHeaderId) {
      return;
    }

    let result = null;
    const data = {
      organizationId,
      rfxHeaderId,
    };
    try {
      result = await updateFeedBackReadedFlag(data);
      result = getResponse(result);
    } catch (e) {
      throw e;
    }
    return result;
  };

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
      this.LadderLevelModalDs.setState('doubleUnitFlag', flag);
    }
  };

  // 寻源功能控制黑白名单
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      const bargainObj =
        res.find(
          (item) => item.function === 'BUTTON_GROUP_FIVE_BUTTONS' && item.whiteFlag === '1'
        ) || {}; // 议价
      this.setState({
        headerGroupButtonMaxNum: !isEmpty(bargainObj) ? 5 : -1,
      });
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
  @Throttle(800)
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { quotationLineId, quotationLineStatus } = record.get([
      'quotationLineStatus',
      'quotationLineId',
    ]);
    const { organizationId } = this.props;
    this.LadderLevelModalDs.setState('header', {
      quotationLineStatus,
    });
    const { doubleUnitFlag } = this.state;
    const Props = {
      record,
      doubleUnitFlag,
      dataSet: this.LadderLevelModalDs,
    };
    this.LadderLevelModalDs.setQueryParameter('commonProps', {
      organizationId,
      quotationLineId,
    });
    c7nModal.open({
      key: 'ssrc-feed-bargain-level',
      title: intl
        .get(`ssrc.inquiryHall.view.message.title.ladderQuotationDetails`)
        .d('阶梯报价明细'),
      children: <LadderLevelModal {...Props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okText: intl.get('hzero.common.btn.save').d('保存'),
      onOk: this.saveBarginLadderLine,
      afterClose: () => {
        this.LadderLevelModalDs.reset();
      },
    });
  }

  /**
   * saveBarginLadderLine - 保存阶梯还价数据
   */
  @Throttle(800)
  @Bind()
  async saveBarginLadderLine() {
    const { organizationId } = this.props;
    const flag = await this.LadderLevelModalDs.validate();
    if (!flag) {
      return false;
    }

    const res = await saveBarginLadderLevel({
      organizationId,
      newParams: this.LadderLevelModalDs.toData(),
    });

    if (getResponse(res)) {
      this.fetchInquiryHallUpdate();
      this.afterOperateInitStoreAndState();
      this.allQuotationTableUnSelected();
      return true;
    }
    return false;
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
      organizationId,
    } = this.props;
    if (params.rfxId) {
      this.setState({
        pageLoading: true,
      });
      fetchInquiryHeaderDetail({
        organizationId,
        rfxHeaderId: params.rfxId,
        path,
        customizeUnitCode: this.getCustomizeUnitCode('baseInfo'),
      })
        .then((res) => {
          if (getResponse(res)) {
            this.headerInfoDs.loadData([res]);
            this.setState({
              header: res,
            });
          }
        })
        .finally(() => {
          this.setState({
            pageLoading: false,
          });
        });

      this.fetchItemLine(); // 查询物料列表
      this.fetchSupplierLineBarginPrice(); // 查询供应商列表
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
      organizationId,
    } = this.props;
    this.itemListDs.setQueryParameter('commonProps', {
      ...page,
      organizationId,
      rfxHeaderId: params.rfxId,
    });
    this.itemListDs.query();
  }

  /**
   * 供应商列表行头部 - 查询
   */

  @Bind()
  fetchSupplierLineBarginPrice(page = {}) {
    const {
      match: { params },
      organizationId,
    } = this.props;
    this.supplierListDs.setQueryParameter('commonProps', {
      ...page,
      organizationId,
      rfxHeaderId: params.rfxId,
    });
    this.supplierListDs.query();
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

  /**
   * GET TABLE DS FROM DS MAP
   */
  getDSFromDSMap = (map) => {
    const currentMap = map || {};
    const list = [];

    if (!currentMap?.size) {
      return list;
    }

    currentMap.forEach((m) => {
      const { currentTableDS } = m || {};
      if (!currentTableDS?.length) {
        return;
      }

      list.push(currentTableDS);
    });

    return list;
  };

  // get supplier tab all table ds
  getSupplierMapAllDSValue = () => {
    const list = this.getDSFromDSMap(this.supplierMap);
    return list;
  };

  // get item tab all table ds
  getItemMapAllDSValue = () => {
    const list = this.getDSFromDSMap(this.itemMap);
    return list;
  };

  // validate supplier or item
  integrationAndValidateSupplierOrItemTabData = async (options = {}) => {
    const { tabCategoryName = 'supplierLine' } = options || {};
    const dsList =
      tabCategoryName === 'supplierLine'
        ? this.getSupplierMapAllDSValue()
        : this.getItemMapAllDSValue();
    let allDsValidate = await Promise.all(
      dsList.map((ds) => {
        return ds.validate();
      })
    );

    if (!dsList?.length) {
      return {
        allDsValidate: true,
        allData: [],
      };
    }

    allDsValidate = allDsValidate.every((v) => v !== false);
    const allData = [];

    dsList.forEach((ds) => {
      if (!ds?.length) {
        return;
      }

      ds.forEach((record) => {
        if (!record) {
          return;
        }

        const recordData = record.toData() || {};

        allData.push(recordData);
      });
    });

    return {
      allDsValidate,
      allData,
    };
  };

  /**
   * 还比价保存
   */
  @debounce(800)
  @Bind()
  async saveInquiryHallFullQuoation() {
    const { organizationId } = this.props;
    // 保存时判断当前tabkey的位置
    const { activeKey } = this.state;
    let params;
    if (activeKey === 'itemLine' || activeKey === 'supplierLine') {
      const { allDsValidate, allData } =
        (await this.integrationAndValidateSupplierOrItemTabData({ tabCategoryName: activeKey })) ||
        {};
      if (!allDsValidate) {
        notification.warning({
          message: intl
            .get('ssrc.sourceTemplate.view.message.title.filler')
            .d('请填写完整相关信息'),
        });
        return;
      }
      params = allData;
    } else {
      if (!this.fullQuotationDS.length) {
        Modal.confirm({
          title: intl
            .get(`ssrc.inquiryHall.view.message.confirm.dataNotNullSave`)
            .d('保存数据不能为空,请展开数据进行保存'),
        });
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

    this.setState({
      pageLoading: true,
    });

    const res = await saveInquiryHallFullQuation({
      rfxAllLine: params,
      organizationId,
      customizeUnitCode: `${this.getCustomizeUnitCode('baseInfo')},${this.getCustomizeUnitCode([
        'allTable',
      ])},SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER,SSRC.${
        this.sourceKey
      }_HALL.BARGAIN.QUOTATION_ITEM`,
    });

    this.setState({
      pageLoading: false,
    });

    if (getResponse(res)) {
      notification.success();
      this.fetchInquiryHallUpdate();
      this.afterOperateInitStoreAndState();
      this.allQuotationTableUnSelected();
    }
  }

  // validate supplier or item selected
  integrationAndValidateSupplierOrItemSelectedTable = async (options = {}) => {
    const { tabCategoryName = 'supplierLine' } = options || {};
    const dsList =
      tabCategoryName === 'supplierLine'
        ? this.getSupplierMapAllDSValue()
        : this.getItemMapAllDSValue();
    const validateList = []; // 勾选校验的list
    const selectedList = []; // 勾选的行
    if (isEmpty(dsList)) {
      return {
        allDsValidate: true,
        allData: [],
      };
    }
    dsList.forEach((ds) => {
      const { selected } = ds;
      if (!selected?.length) {
        return;
      }
      selected.forEach((record) => {
        if (!record) {
          return;
        }
        const data = record.toData();
        validateList.push(record.validate());
        selectedList.push(data);
      });
    });

    const allDsValidate = await Promise.all(validateList).then((res) => res.every((item) => item));
    return {
      allDsValidate,
      allData: selectedList,
    };
  };

  /**
   *还比价提交
   */
  @debounce(800)
  @Bind()
  async submitInquiryHallFullQuoation() {
    const { organizationId } = this.props;
    const { activeKey } = this.state;
    let params = [];

    if (activeKey === 'itemLine' || activeKey === 'supplierLine') {
      const { allDsValidate, allData } =
        (await this.integrationAndValidateSupplierOrItemSelectedTable({
          tabCategoryName: activeKey,
        })) || {};
      if (!allDsValidate) {
        notification.warning({
          message: intl
            .get('ssrc.sourceTemplate.view.message.title.filler')
            .d('请填写完整相关信息'),
        });
        return;
      }
      params = allData;
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

    if (isEmpty(params)) {
      Modal.confirm({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.dataNotNullSub`)
          .d('提交数据不能为空,请展开数据进行提交'),
      });
      return;
    }

    this.setState({
      pageLoading: true,
    });

    const res = await submitInquiryHallFullQuation({
      rfxAllLine: params,
      organizationId,
      customizeUnitCode: `${this.getCustomizeUnitCode('baseInfo')},${this.getCustomizeUnitCode([
        'allTable',
      ])},SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER,SSRC.${
        this.sourceKey
      }_HALL.BARGAIN.QUOTATION_ITEM`,
    });

    this.setState({
      pageLoading: false,
    });

    if (getResponse(res)) {
      notification.success();
      this.fetchInquiryHallUpdate();
      this.allQuotationTableUnSelected();
      this.afterOperateInitStoreAndState();
    }
  }

  // 操作之后初始化数据
  afterOperateInitStoreAndState = () => {
    this.setState({
      expand: {},
    });
    this.clearMap();
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
   *  批量填写还价 - 表格-new
   */
  @Bind()
  async handleEditCounterOffers(data = {}) {
    // const { activeKey } = this.state;
    const { ds: currentTabTableDS = {} } = data || {};
    const { selected: allSelected = [] } = currentTabTableDS || {};

    const params = allSelected;
    // if (activeKey === 'itemLine' || activeKey === 'supplierLine') {
    //   const { allData } =
    //     (await this.integrationAndValidateSupplierOrItemSelectedTable({
    //       tabCategoryName: activeKey,
    //     })) || {};
    //   params = allData;
    // } else if (activeKey === 'allLine') {
    //   const { selected: allSelected = [] } = this.fullQuotationDS;
    //   params = allSelected;
    // }
    if (isEmpty(params)) {
      Modal.warning({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.counterOffersBulk`)
          .d('请勾选要批量填写还价的行！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
      });
      return;
    }

    const quotationCurrencyCode = this.getCurrencyCodeFromSelectedLines({ data: params });

    const counterOffersBulkDs = new DataSet(counterOffersBulkDS());

    // eslint-disable-next-line no-unused-expressions
    counterOffersBulkDs?.current?.set('quotationCurrencyCode', quotationCurrencyCode);

    const modalProps = {
      dataSet: counterOffersBulkDs,
    };

    c7nModal.open({
      key: 'ssrc-feed-bargain',
      title: intl.get('ssrc.inquiryHall.view.message.title.counterOffersBulk').d('批量填写还价'),
      drawer: true,
      styles: {
        width: '742px',
      },
      destroyOnClose: true,
      closable: true,
      children: <CounterOffersBulk {...modalProps} />,
      onOk: () => this.handleSaveCounterOffersBulk({ counterOffersBulkDs, currentTabTableDS }),
    });
  }

  /**
   *  批量填写还价 - 打开
   */
  @Bind()
  async handleCounterOffersBulk() {
    const { activeKey } = this.state;

    let params = [];
    if (activeKey === 'itemLine' || activeKey === 'supplierLine') {
      const { allData } =
        (await this.integrationAndValidateSupplierOrItemSelectedTable({
          tabCategoryName: activeKey,
        })) || {};
      params = allData;
    } else if (activeKey === 'allLine') {
      const { selected: allSelected = [] } = this.fullQuotationDS;
      params = allSelected;
    }
    if (isEmpty(params)) {
      Modal.warning({
        title: intl
          .get(`ssrc.inquiryHall.view.message.confirm.counterOffersBulk`)
          .d('请勾选要批量填写还价的行！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
      });
      return;
    }

    const quotationCurrencyCode = this.getCurrencyCodeFromSelectedLines({ data: params });

    const counterOffersBulkDs = new DataSet(counterOffersBulkDS());

    // eslint-disable-next-line no-unused-expressions
    counterOffersBulkDs?.current?.set('quotationCurrencyCode', quotationCurrencyCode);

    const modalProps = {
      dataSet: counterOffersBulkDs,
    };

    c7nModal.open({
      key: 'ssrc-feed-bargain',
      title: intl.get('ssrc.inquiryHall.view.message.title.counterOffersBulk').d('批量填写还价'),
      drawer: true,
      styles: {
        width: '742px',
      },
      destroyOnClose: true,
      closable: true,
      children: <CounterOffersBulk {...modalProps} />,
      onOk: () => this.handleSaveCounterOffersBulk(counterOffersBulkDs),
    });
  }

  /**
   * 批量填写还价 - 保存
   * @param {*} values
   */
  @Throttle(1200)
  @Bind()
  async handleSaveCounterOffersBulk(data = {}) {
    const {
      match: { params },
      organizationId,
    } = this.props;
    // const { activeKey } = this.state;
    const { counterOffersBulkDs, currentTabTableDS } = data || {};
    const flag = await counterOffersBulkDs.validate();
    if (!flag) {
      return false;
    }

    const { selected: allSelected = [] } = currentTabTableDS || {};
    if (isEmpty(allSelected)) {
      return;
    }

    const counterOffersBulkData = counterOffersBulkDs?.current?.toData() || {};
    const bargainList = [];
    allSelected.forEach((lines) => {
      lines.set('status', 'update');
    });

    const selectedData = currentTabTableDS.toJSONData(true) || [];
    selectedData.forEach((line) => {
      bargainList.push(line.quotationLineId);
    });

    // if (activeKey === 'itemLine' || activeKey === 'supplierLine') {
    //   const { allData } =
    //     (await this.integrationAndValidateSupplierOrItemSelectedTable({
    //       tabCategoryName: activeKey,
    //     })) || {};
    //   // 物品明细
    //   bargainList = allData.map((item) => item.quotationLineId);
    // } else {
    //   // 全部报价
    //   const { selected: allSelected = [] } = this.fullQuotationDS;
    //   allSelected.forEach((lines) => {
    //     lines.set('status', 'update');
    //   });

    //   const selectedData = this.fullQuotationDS.toJSONData(true) || [];
    //   selectedData.forEach((line) => {
    //     bargainList.push(line.quotationLineId);
    //   });
    // }

    if (isEmpty(bargainList)) {
      return false;
    }

    const res = await handleSaveCounterOffersBulk({
      ...counterOffersBulkData,
      organizationId,
      bargainList,
      rfxHeaderId: params.rfxId,
    });
    if (getResponse(res)) {
      notification.success();
      this.fetchInquiryHallUpdate();
      this.allQuotationTableUnSelected();
      this.afterOperateInitStoreAndState();
    } else {
      return false;
    }
  }

  // 清空所有map
  clearMap = () => {
    this.itemMap.clear();
    this.supplierMap.clear();
  };

  // 全部报价明细表格清空勾选
  allQuotationTableUnSelected = () => {
    this.fullQuotationDS.unSelectAll();
    this.fullQuotationDS.clearCachedSelected();
  };

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
  renderHeaderTitle() {
    const { header = {} } = this.state;
    if (!header) {
      return null;
    }
    const { rfxNum, rfxTitle } = header || {};
    return (
      <h3
        style={{
          width: '96%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '16px',
          fontWeight: 600,
        }}
      >
        {rfxNum}-
        <Tooltip title={`${rfxNum}-${rfxTitle}`} overlayStyle={{ minWidth: '300px' }}>
          {rfxTitle}
        </Tooltip>
      </h3>
    );
  }

  /**
   * 查看历史最低价
   */
  @Bind()
  handleViewHistoryLow(record = {}) {
    const priceLibHistoryDTO = record?.get('priceLibHistoryDTO') || {};
    if (
      priceLibHistoryDTO &&
      (priceLibHistoryDTO?.unitPrice || priceLibHistoryDTO?.unitPrice === 0)
    ) {
      this.setState({
        priceComparisonModalVisible: true,
        record,
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

  renderHeaderInfo(record = {}) {
    const { ssrcRemote } = this.props;
    const { expand } = this.state;
    // const { organizationId } = this.props;
    const {
      taxRate,
      rfxLineItemId,
      itemCode,
      itemName,
      attachmentUuid,
      itemRemark,
      rfxLineItemNum,
      rfxQuantity,
      secondaryQuantity,
      secondaryUomName,
      itemCategoryName,
      quotationRange,
      priceLibHistoryDTO,
    } = record?.get([
      'taxRate',
      'rfxLineItemId',
      'itemCode',
      'itemName',
      'attachmentUuid',
      'itemRemark',
      'rfxLineItemNum',
      'rfxQuantity',
      'secondaryQuantity',
      'secondaryUomName',
      'itemCategoryName',
      'quotationRange',
      'priceLibHistoryDTO',
    ]);
    const chartFlag = 'i';

    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <Row style={{ display: 'flex', alignItems: 'center' }}>
              <Col span={8} style={{ display: 'flex' }}>
                <div
                  className={styles.itemListImg}
                  onClick={(e) => this.openPriceCharts(e, chartFlag, rfxLineItemId)}
                >
                  <img src={goodsIcon} alt="" style={{ width: 44, height: 44 }} />
                </div>
                <div className={styles.itemMsg}>
                  <div style={{ height: 22, display: 'flex' }}>
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
                            {itemCode ? `${itemCode}-` : null}
                            {itemName}
                          </span>
                        }
                      >
                        {itemCode ? `${itemCode}-` : null}
                        {itemName}
                      </Popover>
                    </span>
                    <div>
                      <Icon
                        className={styles.arrowIconT}
                        type={!expand[rfxLineItemId] ? 'down' : 'up'}
                        onClick={(e) => this.expandItemLine(e, rfxLineItemId)}
                      />
                    </div>
                  </div>
                  <div style={{ height: 22, display: 'inline-flex' }}>
                    <span className={styles.itemListDesItem} onClick={(e) => this.rfxLineTag(e)}>
                      {attachmentUuid && (
                        <NewAttachment
                          bucketName={PRIVATE_BUCKET}
                          bucketDirectory="ssrc-rfx-rfxitem"
                          value={attachmentUuid}
                          viewMode="popup"
                          readOnly
                          style={{
                            height: '22px',
                            paddingLeft: 0,
                          }}
                        />
                      )}
                    </span>
                    {itemRemark ? (
                      <Popover content={itemRemark}>
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
                          {itemRemark}
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
                  {rfxLineItemNum}
                </Tag>
                {rfxQuantity && (
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
                    <Tooltip title={`${secondaryQuantity}（${secondaryUomName}）`}>
                      {secondaryQuantity}（{secondaryUomName}）
                    </Tooltip>
                  </Tag>
                )}
                {itemCategoryName && (
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
                    {itemCategoryName}
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
                {quotationRange && (
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
                    {quotationRange}
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
                          itemRecord: record,
                        }
                      )
                    : null
                }
              </Col>
              <Col span={4}>
                <span onClick={(e) => this.rfxLineTag(e)}>
                  <Tooltip title={this.renderHistoricalLowTip(priceLibHistoryDTO)}>
                    <a onClick={() => this.handleViewHistoryLow(record)}>
                      {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}
                      ：
                      {priceLibHistoryDTO &&
                      (priceLibHistoryDTO?.unitPrice || priceLibHistoryDTO?.unitPrice === 0)
                        ? priceLibHistoryDTO?.unitPrice
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
  renderSupplierHeaderInfo(record = {}) {
    const { ssrcRemote } = this.props;
    const { expand, newQuotationFlag = 0 } = this.state;
    const {
      supplierCompanyNum,
      supplierCompanyName,
      submitAttachmentFlag,
      businessAttachmentUuid,
      techAttachmentUuid,
      rfxLineSupplierId,
      contactName,
      internationalTelCodeMeaning,
      contactMobilephone,
      contactMail,
      feedbackStatusMeaning,
      quotationNumber,
      supplierTotalAmount,
    } = record?.get([
      'supplierCompanyNum',
      'supplierCompanyName',
      'submitAttachmentFlag',
      'businessAttachmentUuid',
      'techAttachmentUuid',
      'rfxLineSupplierId',
      'contactName',
      'internationalTelCodeMeaning',
      'contactMobilephone',
      'contactMail',
      'feedbackStatusMeaning',
      'quotationNumber',
      'supplierTotalAmount',
    ]);
    const content = (
      <span className={styles.itemListNum}>
        {supplierCompanyNum ? `${supplierCompanyNum}-${supplierCompanyName}` : supplierCompanyName}
      </span>
    );
    const fileFlag = submitAttachmentFlag === 1 && (businessAttachmentUuid || techAttachmentUuid);
    const fileVisableFlag = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_PROCESS_SUPPLIER_FILE_GROUP',
          fileFlag,
          { record }
        )
      : fileFlag;
    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <Row style={{ height: 60 }} gutter={24}>
              <Col span={14} style={{ height: 60, display: 'flex' }}>
                <div className={styles.itemListImg}>
                  <img src={supplierIcon} alt="" style={{ width: 44, height: 44 }} />
                </div>
                <div className={styles.itemMsgSub}>
                  <div style={{ height: 22 }}>
                    <Popover
                      content={
                        supplierCompanyNum
                          ? `${supplierCompanyNum}-${supplierCompanyName}`
                          : supplierCompanyName
                      }
                    >
                      {content}
                    </Popover>
                    <Icon
                      className={styles.arrowIcon}
                      type={!expand[rfxLineSupplierId] ? 'down' : 'up'}
                      onClick={(e) => this.expandSupplier(e, record)}
                    />
                  </div>
                  <div style={{ height: 22, color: 'rgba(102,102,102,1)', display: 'flex' }}>
                    <Popover content={contactName}>
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
                        {contactName}
                      </span>
                    </Popover>
                    <Popover content={phoneRender(internationalTelCodeMeaning, contactMobilephone)}>
                      <span className={styles.itemListDesItem}>
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
                        {phoneRender(internationalTelCodeMeaning, contactMobilephone)}
                      </span>
                    </Popover>
                    <Popover content={contactMail}>
                      <span className={styles.itemListDesItem}>
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：
                        {contactMail}
                      </span>
                    </Popover>
                  </div>
                </div>
              </Col>
              <Col span={8} style={{ height: 60, lineHeight: '30px' }}>
                {feedbackStatusMeaning ===
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
                    {feedbackStatusMeaning}
                  </Tag>
                )}
                {feedbackStatusMeaning ===
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
                    {feedbackStatusMeaning}
                  </Tag>
                )}
                {feedbackStatusMeaning ===
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
                    {feedbackStatusMeaning}
                  </Tag>
                )}
                {quotationNumber && (
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
                    ：{quotationNumber}
                  </Tag>
                )}
                {supplierTotalAmount ? (
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
                    ：{supplierTotalAmount}
                  </Tag>
                ) : null}
              </Col>
              <Col span={2} style={{ height: 60, lineHeight: '44px' }}>
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
                              this.showUploadModal(businessAttachmentUuid, techAttachmentUuid)
                            }
                            style={{ display: 'inline-flex' }}
                          >
                            {intl.get('hzero.common.upload.modal.title').d('附件')}
                            <RenderFileTotalCount record={record} uiType="c7n-pro" />
                            {/* <span style={{ marginLeft: '5.4px' }}> */}
                            <img src={fileIcon} style={{ paddingLeft: '5.4px' }} alt="" />
                            {/* </span> */}
                          </a>
                        ) : (
                          <FileGroup record={record} uiType="c7n-pro" fileType="HEADER" />
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
  @Throttle(1200)
  expandItemLine(e, rfxLineItemId) {
    e.stopPropagation();
    const {
      match: { params },
      organizationId,
    } = this.props;
    const { expand, doubleUnitFlag = false } = this.state;
    const currentStatus = this.itemMap?.get(rfxLineItemId);

    if (!rfxLineItemId) {
      return;
    }

    if (!currentStatus) {
      const itemTableDs = new DataSet(
        itemTableDS({
          doubleUnitFlag,
          bidFlag: this.bidFlag,
        })
      );

      itemTableDs.setQueryParameter('commonProps', {
        organizationId,
        rfxLineItemId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_ITEM`,
      });

      itemTableDs.query();

      this.itemMap.set(rfxLineItemId, {
        currentTableDS: itemTableDs,
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
  @Throttle(1200)
  expandSupplier(e, supplierRecord = {}) {
    e.stopPropagation();
    const { expand, doubleUnitFlag = false } = this.state;
    const {
      match: { params },
      organizationId,
    } = this.props;
    const { rfxLineSupplierId } = supplierRecord?.get(['rfxLineSupplierId']) || {};
    const currentStatus = this.supplierMap?.get(rfxLineSupplierId);

    if (!rfxLineSupplierId) {
      return;
    }

    if (!currentStatus) {
      const supplierTableDs = new DataSet(
        supplierTableDS({
          doubleUnitFlag,
          bidFlag: this.bidFlag,
        })
      );

      supplierTableDs.setQueryParameter('commonProps', {
        organizationId,
        rfxLineSupplierId,
        rfxHeaderId: params.rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.BARGAIN.QUOTATION_SUPPLIER`,
      });

      supplierTableDs.query();

      this.supplierMap.set(rfxLineSupplierId, {
        currentTableDS: supplierTableDs,
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
    this.setState({ activeKey: key });
  }

  /**
   * 汇率编辑
   *
   * @memberof CheckPrice
   */
  @Bind()
  async exchangeEdit() {
    await this.querySupplierExchangeEdit({});
    openModal({
      dataSet: this.ExchangeEditModalDs,
      modalDs: this.QuoteExchangeMainDateModalDs,
      editModalOk: this.saveExchangeEdit,
      quoEditModalOk: this.quoteExchangeMainDataOk,
    });
  }

  /**
   * 引用汇率主数据弹窗确定
   *
   * @memberof CheckPrice
   */
  @Bind()
  async quoteExchangeMainDataOk() {
    const flag = await this.QuoteExchangeMainDateModalDs.validate();
    if (!flag) {
      return false;
    }

    const values = this.QuoteExchangeMainDateModalDs?.current?.toData();

    const res = await this.querySupplierExchangeEdit({
      rateTypeCode: values.rateTypeCode,
      rateDate: values.rateDate ? values.rateDate.split(' ')?.[0] : undefined,
    });
    if (res) {
      return true;
    }
    return false;
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
  async querySupplierExchangeEdit(date = {}) {
    const {
      organizationId,
      match: { params },
    } = this.props;
    const res = await querySupplierExchangeEdit({
      ...date,
      organizationId,
      sourceHeaderId: params.rfxId,
      sourceFrom: 'RFX',
    });
    if (getResponse(res)) {
      this.ExchangeEditModalDs.loadData(res);
      return true;
    }
    return false;
  }

  /**
   * 汇率编辑 保存
   *
   * @memberof CheckPrice
   */
  @Bind()
  async saveExchangeEdit() {
    const { organizationId } = this.props;

    const flag = await this.ExchangeEditModalDs.validate();

    if (!flag) {
      return false;
    }

    const res = await saveExchangeEdit({
      organizationId,
      newParams: this.ExchangeEditModalDs.toData(),
    });

    if (getResponse(res)) {
      notification.success();
      this.fetchInquiryHallUpdate();
      this.afterOperateInitStoreAndState();
      this.allQuotationTableUnSelected();
      return true;
    } else {
      return false;
    }
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
      ['headerButtons', 'SSRC.INQUIRY_HALL.BARGAIN.HEADER_BUTTONS_NEW'], // header buttons
      ['baseInfo', 'SSRC.INQUIRY_HALL.BARGAIN.BASEINFO_FORM'], // base form
    ]);

    const BidCodeMap = new Map([
      ['allTable', 'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION'], // all quotation table
      ['allTableSearch', 'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER'], // all quotation table filter,
      ['headerButtons', 'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS_NEW'], // header buttons
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

  // 导入成功回调
  successCallBack = () => {
    this.fetchInquiryHallUpdate();
    this.afterOperateInitStoreAndState();
    this.allQuotationTableUnSelected();
  };

  // 批量新导入按钮
  getExcelImportButtonProps = () => {
    const { organizationId, match = {} } = this.props;
    const { params } = match;

    const path = this.bidFlag
      ? 'ssrc.new-bid-hall.feedback-bargain.-rfxid'
      : 'ssrc.new-inquiry-hall.feedback-bargain.-rfxid';

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
          // marginLeft: '8px',
          fontWeight: '400',
        },
        icon: 'archive',
        funcType: 'raise',
        uiType: 'c7n-pro',
        permissionList: [
          {
            code: `${path}.button.batch-import-new`.toLowerCase(),
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
      successCallBack: this.successCallBack,
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
    return ImportProps;
  };

  // 还比价头部按钮
  getHeaderButtons() {
    const { showExchangeEdit, item, pageLoading, header = {} } = this.state;
    const { match } = this.props;
    const { rfxId } = match?.params || {};
    // 比价助手
    const { sourceCategory, diyLadderQuotationFlag } = header || {};
    const priceComparisonProps = {
      item,
      rfxId: match.params.rfxId,
      sourceCategory,
      diyLadderQuotationFlag,
    };
    return [
      // {
      //   name: 'batchFillCounteroffer',
      //   btnType: 'c7n-pro',
      //   btnProps: {
      //     onClick: this.handleCounterOffersBulk,
      //     funcType: 'flat',
      //   },
      //   child: (
      //     <>
      //       <Iconfont type="main-counter-offer" style={{ marginRight: '8px' }} />
      //       {intl.get(`ssrc.inquiryHall.view.button.counterOffersBulk`).d('批量填写还价')}
      //     </>
      //   ),
      // },
      {
        name: 'chat',
        btnComp: ChatRoomSourceLink,
        child: intl.get('ssrc.common.view.message.chatRecord').d('聊天记录'),
        btnProps: {
          btnType: 'c7n-pro',
          funcType: 'flat',
          rfxHeaderId: rfxId,
        },
      },
      {
        // 批量导入
        name: 'batchImportNew',
        btnType: 'c7n-pro',
        btnComp: CommonImportNew,
        btnProps: this.getExcelImportButtonProps(),
      },
      showExchangeEdit && {
        name: 'exchangeEdit',
        btnType: 'c7n-pro',
        hidden: !(header && header.multiCurrencyFlag === 1),
        btnProps: {
          icon: 'edit',
          onClick: this.exchangeEdit,
          funcType: 'flat',
        },
        child: intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑'),
      },
      {
        name: 'comparePriceAssistant',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: () => this.handleRenderPriceCompare(priceComparisonProps),
          funcType: 'flat',
        },
        child: (
          <>
            {<Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />}
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
      },
      {
        name: 'operateRecord',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'operation_service_request',
          onClick: this.playView,
          funcType: 'flat',
        },
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          loading: pageLoading,
          onClick: this.saveInquiryHallFullQuoation,
          funcType: 'flat',
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'bargain',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'check',
          color: 'primary',
          loading: pageLoading,
          onClick: this.submitInquiryHallFullQuoation,
          // funcType: 'flat',
        },
        child: intl.get('ssrc.inquiryHall.view.button.counteroffer').d('还价'),
      },
    ].filter(Boolean);
  }

  // 面板切换记录
  @Bind()
  changeActiveKey(activeKey) {
    if (!activeKey) {
      return;
    }

    this.setState({ activeKey });
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      match,
      [modelName]: { operationPagination, operationData },
      organizationId,
      ssrcRemote,
      getHocInstance,
      customizeTable = noop,
      customizeTabPane = () => {},
      customizeForm,
      customizeBtnGroup = noop,
    } = this.props;
    const {
      header = {},
      expand,
      operationRecordModalVisible,
      attachmentVisible,
      AttachmentsProps,
      viewPriceChartsVisible,
      priceDataSource,
      supplierNameList,
      chartsLoading,
      id,
      doubleUnitFlag,
      newQuotationFlag = false,
      pageLoading = false,
      headerGroupButtonMaxNum = -1,
    } = this.state;
    const priceChartsProps = {
      loading: chartsLoading[id] && chartsLoading[id].fetchPriceChartLoading,
      priceDataSource,
      supplierNameList,
    };

    const commonProps = {
      handleEditCounterOffers: this.handleEditCounterOffers,
    };

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
      ...commonProps,
      modelName,
      doubleUnitFlag,
      sourceKey: this.sourceKey,
      bidFlag: this.bidFlag,
      organizationId,
      header,
      viewLadderLevel: this.viewLadderLevelModal,
      fullQuotationDS: this.fullQuotationDS,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      newQuotationFlag,
      ssrcRemote,
      customizeTable,
    };
    // 物料
    const ItemLineTableProps = {
      ...commonProps,
      header,
      doubleUnitFlag,
      newQuotationFlag,
      itemMap: this.itemMap,
      dispatch,
      modelName,
      sourceKey: this.sourceKey,
      organizationId,
      match,
      viewLadderLevel: this.viewLadderLevelModal,
      customizeTable,
      ssrcRemote,
    };

    const headerInfoProps = {
      customizeForm,
      headerInfoDs: this.headerInfoDs,
      sourceKey: this.sourceKey,
      bidFlag: this.bidFlag,
    };

    // 供应商
    const SupplierLineTableProps = {
      ...commonProps,
      header,
      doubleUnitFlag,
      newQuotationFlag,
      supplierMap: this.supplierMap,
      dispatch,
      modelName,
      sourceKey: this.sourceKey,
      organizationId,
      match,
      viewLadderLevel: this.viewLadderLevelModal,
      customizeTable,
    };
    const modalProps = {
      visible: viewPriceChartsVisible,
      width: 805,
      footer: null,
      onCancel: this.hidePriceCharts,
      bodyStyle: { height: 380, marginLeft: '12px', overflow: 'auto' },
      title: '',
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
            <DynamicButtons
              trigger="click"
              buttons={this.getHeaderButtons()}
              defaultBtnType="c7n-pro"
              maxNum={headerGroupButtonMaxNum}
            />
          )}
          {
            // 【卫龙】二开埋点，请勿删除，谨慎修改！！！
            ssrcRemote
              ? ssrcRemote.render('RENDER_IMMEDIATE_PRICING_BUTTON', <></>, immediatePricingProps)
              : null
          }
        </Header>

        <div className={classnames('ued-detail-wrapper', CommonStyle['update-container'])}>
          <Spin spinning={pageLoading}>
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
                <Content>
                  <div style={{ height: '24px', marginTop: '8px' }}>{this.renderHeaderTitle()}</div>
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
                    {
                      code: `SSRC.${this.sourceKey}_HALL.BARGAIN.TABS`,
                      custDefaultActive: this.changeActiveKey,
                    },
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
                        forceRender
                      >
                        <FullQuotation {...AllLineTableProps} />
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl
                          .get(`ssrc.inquiryHall.view.message.tab.vendorList`)
                          .d('供应商列表')}
                        key="supplierLine"
                        forceRender
                      >
                        <C7nSpin dataSet={this.supplierListDs}>
                          {this.supplierListDs?.length
                            ? this.supplierListDs?.map((record) => {
                                const { rfxLineSupplierId } = record
                                  ? record.get(['rfxLineSupplierId'])
                                  : {};
                                return (
                                  <div style={{}}>
                                    <div onClick={(e) => this.expandSupplier(e, record)}>
                                      {this.renderSupplierHeaderInfo(record)}
                                    </div>
                                    <div>
                                      {expand[rfxLineSupplierId] ? (
                                        <SupplierLineTable
                                          rfxLineSupplierId={rfxLineSupplierId}
                                          {...SupplierLineTableProps}
                                        />
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })
                            : null}
                        </C7nSpin>
                        {this.supplierListDs?.totalCount > 10 ? (
                          <Pagination dataSet={this.supplierListDs} className={styles.pagination} />
                        ) : (
                          ''
                        )}
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl
                          .get(`ssrc.inquiryHall.view.message.tab.itemDetails`)
                          .d('物品明细')}
                        key="itemLine"
                        forceRender
                      >
                        <C7nSpin dataSet={this.itemListDs}>
                          {this.itemListDs?.length
                            ? this.itemListDs.map((record) => {
                                const { rfxLineItemId } = record
                                  ? record.get(['rfxLineItemId'])
                                  : {};
                                return (
                                  <div>
                                    <div
                                      onClick={(e) => this.expandItemLine(e, rfxLineItemId)}
                                      className={styles.arrowStyle}
                                    >
                                      {this.renderHeaderInfo(record)}
                                    </div>
                                    <div>
                                      {expand[rfxLineItemId] ? (
                                        <ItemLineTable
                                          rfxLineItemId={rfxLineItemId}
                                          {...ItemLineTableProps}
                                        />
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })
                            : null}
                        </C7nSpin>
                        {this.itemListDs?.totalCount > 10 ? (
                          <Pagination dataSet={this.itemListDs} className={styles.pagination} />
                        ) : (
                          ''
                        )}
                      </Tabs.TabPane>
                    </Tabs>
                  )}
                </Content>
              </TopSection>
            </div>
          </Spin>
        </div>

        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
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
      </React.Fragment>
    );
  }
}

const hocCommonFunc = (Comp, { bidFlag = false, modelName = 'inquiryHall' }) => {
  const unitCodes = !bidFlag
    ? [
        'SSRC.INQUIRY_HALL.BARGAIN.HEADER_BUTTONS_NEW', // 头部按钮组
        'SSRC.INQUIRY_HALL.BARGAIN.ALL_QUOTATION',
        'SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_SUPPLIER',
        'SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_ITEM',
        'SSRC.INQUIRY_HALL.BARGAIN.TABS', // 页签
        'SSRC.INQUIRY_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
        'SSRC.INQUIRY_HALL.BARGAIN.CARD_HEADER',
        'SSRC.INQUIRY_HALL.BARGAIN.CARD_BASE_INFO',
        'SSRC.INQUIRY_HALL.BARGAIN.CARD_QUOTATIONS',
        'SSRC.INQUIRY_HALL.BARGAIN.NEW_ALL_QUOTATION',
        'SSRC.INQUIRY_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER',
      ]
    : [
        // 'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS', // 头部按钮
        'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS_NEW',
        'SSRC.BID_HALL.BARGAIN.ALL_QUOTATION',
        'SSRC.BID_HALL.BARGAIN.QUOTATION_SUPPLIER',
        'SSRC.BID_HALL.BARGAIN.QUOTATION_ITEM',
        'SSRC.BID_HALL.BARGAIN.TABS', // 页签
        'SSRC.BID_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
        'SSRC.BID_HALL.BARGAIN.CARD_HEADER',
        'SSRC.BID_HALL.BARGAIN.CARD_BASE_INFO',
        'SSRC.BID_HALL.BARGAIN.CARD_QUOTATIONS',
        'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION',
        'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER',
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
        code: 'SSRC_FEEDBACKBARGIN_C7N', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
        name: 'ssrcRemote', // 默认 'remote'， 如有属性冲突可以改此属性
      }
    )
  )(observer(Comp));
};

const HOCComponent = (Comp) => {
  return hocCommonFunc(Comp, { bidFlag: false, modelName: 'inquiryHall' });
};

export default HOCComponent(FeedbackBargain);
export { HOCComponent, FeedbackBargain, hocCommonFunc };
