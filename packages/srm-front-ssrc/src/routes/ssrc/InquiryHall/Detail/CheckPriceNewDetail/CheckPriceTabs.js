import React, { PureComponent } from 'react';
import { Collapse, Icon, Tag, Tabs, Popover, Tooltip } from 'hzero-ui';
import { Modal as C7NModal, DataSet, Pagination } from 'choerodon-ui/pro';
import { Spin, Tag as C7NTag } from 'choerodon-ui';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import { noop, isNil } from 'lodash';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import querystring from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import { openTab } from 'utils/menuTab';
import EmbedPage from '_components/EmbedPage';

import SVGIcon from '@/routes/components/SvgIcon';
import annexImg from '@/assets/item-icon.svg';

import { getQuotationName } from '@/utils/globalVariable';
import { numberSeparatorRender } from '@/utils/renderer';
import { idValidation } from '@/routes/components/Widget/dataVerification';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import FeedBackBargainHistoryC7N from '../FeedBackBargainHistoryC7N';

import styles from '../index.less';

import {
  tableCommonDataSet,
  itemListDataSet,
  supplierListDataSet,
} from './store/TableCommonDataSet';

import AllQuoteLine from './Tabs/AllQuoteLine';
import ItemLineTable from './Tabs/ItemLineTable';
import SupplierLineTable from './Tabs/SupplierLineTable';
import AttachmentWrap from '../Attachment';
import AttachmentBid from '../AttachmentBid';
import Attachment from '../../../components/Attachment';
import RoundQuotationHistoryC7N from '../RoundQuotationHistoryC7N';
import WinningBidDetail from './Tabs/WinningBidDetail.js';

const validSupplierImg = require('@/assets/supplier-inline-valid.svg');
const supplierImg = require('@/assets/supplier-icon.svg');
const imgUrl = require('@/assets/candidate.svg');
const AttachIcon = require('@/assets/d-attachment.svg');
const processAdd = require('@/assets/supplier-processAdd.svg');
const companyIpRateRed = require('@/assets/companyIpRate-red.svg');
const companyIpRateGrey = require('@/assets/companyIpRate-grey.svg');
const processAddInvalid = require('@/assets/supplier-processAddInvalid.svg');
const inValidSupplierImg = require('@/assets/supplier-inline-invalid.svg');
const supplierGreyImg = require('@/assets/supplier-icon-grey.svg');
const attachGrey = require('@/assets/attachment-grey.svg');
const supplierBanQuotationSvg = require('@/assets/biddingHall/supplier-ban-quotation.svg');
const supplierNoSupplementPriceSvg = require('@/assets/biddingHall/supplier-no-supplement-price.svg');
const eliminateIcon = require('@/assets/eliminate.svg');

const { TabPane } = Tabs;
const { Panel } = Collapse;

@observer
class CheckPriceTabs extends PureComponent {
  constructor(props) {
    super(props);

    this.attachmentTableRef = {};

    this.state = {
      checkPriceActiveKey: 'itemLine', // 当前激活tab面板的key
      activePanel: [],
      defaultActive: 'itemLine',
      pageLoading: false,
    };

    const { bidFlag } = props || {};

    // 获取是投标还是报价名字
    this.quotationName = getQuotationName(bidFlag);

    this.itemListDS = new DataSet(itemListDataSet());

    this.supplierListDS = new DataSet(supplierListDataSet());

    this.allListDS = this.initCurrentTable({ rowKey: 'quotationLineId', allQuotationFlag: 1 });

    this.supplierMap = observable.map({});

    this.itemMap = observable.map({});
  }

  feedBackBarginHistoryModalKey = C7NModal.key();

  checkPriceSupplierAttachModalKey = C7NModal.key();

  quotationHistoryModalKey = C7NModal.key();

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { rfxHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { rfxHeaderId = null } = this.props;
    const RefreshFlag = rfxHeaderId && prevRfxHeaderId && prevRfxHeaderId !== rfxHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      const { checkPriceActiveKey = 'itemLine' } = this.state;
      this.queryCheckPriceDetail(checkPriceActiveKey);
    }
  }

  togglePageLoading = (loading = false) => {
    this.setState({
      pageLoading: loading,
    });
  };

  getCommonApiParamsObj = () => {
    const { getCurrentPageSymbol } = this.props;

    let param = {};
    if (typeof getCurrentPageSymbol === 'function') {
      param = getCurrentPageSymbol() || {};
    }

    param = param || {};
    return param;
  };

  // 构建表格ds
  initCurrentTable = (data = {}) => {
    const { bidFlag, doubleUnitFlag, rfx = {} } = this.props || {};

    const commonPropsDS = {
      bidFlag,
    };

    const ds = new DataSet(
      tableCommonDataSet({
        ...(data || {}),
        doubleUnitFlag,
        ...rfx,
        ...commonPropsDS,
      })
    );

    return ds;
  };

  componentDidMount() {
    const { getHocInstance, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx || {};

    const tabUnitCode = `SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_DETAIL_TABS`;

    let fieldCode;
    if (getHocInstance) {
      const field = getHocInstance().custConfig[tabUnitCode]?.fields || [];
      fieldCode = (field.find((item) => item?.defaultActive === 1) || {})?.fieldCode;
      this.setState({ defaultActive: fieldCode || 'itemLine' });
    }

    this.queryCheckPriceDetail(fieldCode || 'itemLine');
  }

  changeCheckPriceTabs = (key) => {
    this.setState({
      checkPriceActiveKey: key,
    });

    this.queryCheckPriceDetail(key);
    this.changeCollapse();
  };

  // 核价下 依据卡片查询数据
  queryCheckPriceDetail = (key = '') => {
    switch (key) {
      case 'itemLine':
        this.fetchItemLineOfCheckPrice();
        break;
      case 'supplierLine':
        this.fetchSupplierLineOfCheckPrice();
        break;
      case 'quoteLine':
        this.fetchAllQuotationTable();
        break;
      case 'attachmentTable':
        this.fetchAttachmentList();
        break;
      case 'attachmentList':
      case 'cuxTab': // 预留的二开口
        break;
      case 'winBid': // 中标详情 数据查询 组件内部处理
        break;
      default:
        this.fetchItemLineOfCheckPrice();
    }
  };

  fetchAttachmentList = () => {
    const { initPage } = this.attachmentTableRef || {};

    if (initPage) {
      initPage();
    }
  };

  // 全部报价明细
  fetchAllQuotationTable = () => {
    const { rfxHeaderId, organizationId, getCustomizeUnitCode } = this.props;

    idValidation(rfxHeaderId);

    const permanentParams = this.getCommonApiParamsObj() || {}; // 固定参数

    const params = {
      organizationId,
      rfxHeaderId,
      customizeUnitCode: getCustomizeUnitCode('allQuotationTable'),
      ...permanentParams,
    };

    this.allListDS.setQueryParameter('commonProps', params);
    this.allListDS.query();
  };

  // 中标明细
  fetchWinningBidDetail = () => {
    const { rfxHeaderId, organizationId, getCustomizeUnitCode } = this.props;

    idValidation(rfxHeaderId);

    const permanentParams = this.getCommonApiParamsObj() || {}; // 固定参数

    const params = {
      organizationId,
      rfxHeaderId,
      customizeUnitCode: getCustomizeUnitCode(''),
      ...permanentParams,
    };

    this.allListDS.setQueryParameter('commonProps', params);
    this.allListDS.query();
  };

  /**
   * 物品明细 - 查询
   */
  @Bind()
  async fetchItemLineOfCheckPrice() {
    const { organizationId, rfxHeaderId } = this.props;

    idValidation(rfxHeaderId);

    const permanentParams = this.getCommonApiParamsObj() || {}; // 固定参数

    const allParam = {
      organizationId,
      rfxHeaderId,
      ...permanentParams,
    };

    this.togglePageLoading(true);
    this.itemListDS.setQueryParameter('commonProps', allParam);
    await this.itemListDS.query();
    this.togglePageLoading(false);
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  async fetchSupplierLineOfCheckPrice() {
    const { organizationId, rfxHeaderId } = this.props;

    idValidation(rfxHeaderId);
    const permanentParams = this.getCommonApiParamsObj() || {}; // 固定参数

    const allParam = {
      organizationId,
      rfxHeaderId,
      ...permanentParams,
    };

    this.togglePageLoading(true);
    this.supplierListDS.setQueryParameter('commonProps', allParam);
    await this.supplierListDS.query();
    this.togglePageLoading(false);
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  // 核价 物品列表 物品明细表格
  @Bind()
  async fetchItemLineTableListCheckPrice(record = {}) {
    const { rfxHeaderId, organizationId, getCustomizeUnitCode = noop } = this.props;
    const { rfxLineItemId = null } = record ? record.get(['rfxLineItemId']) : {};

    if (!rfxLineItemId) {
      return;
    }

    const permanentParams = this.getCommonApiParamsObj() || {}; // 固定参数

    const params = {
      organizationId,
      rfxLineItemId,
      rfxHeaderId,
      customizeUnitCode: getCustomizeUnitCode('itemTable'),
      ...permanentParams,
    };

    let currentDS = this.itemMap.get(rfxLineItemId);

    if (!currentDS) {
      currentDS = this.initCurrentTable({ rowKey: 'quotationLineId', itemFlag: 1 });
      currentDS.setQueryParameter('commonProps', params);
      await currentDS.query();
      this.itemMap.set(rfxLineItemId, currentDS);
    }
  }

  // 核价 物品列表 物品明细表格
  @Bind()
  async fetchSupplierLineTableList(data) {
    const { rfxHeaderId, organizationId, getCustomizeUnitCode = noop } = this.props;
    const { rfxLineSupplierId } = data || {};

    if (!rfxLineSupplierId) {
      return;
    }

    const permanentParams = this.getCommonApiParamsObj() || {}; // 固定参数

    const params = {
      organizationId,
      rfxLineSupplierId,
      rfxHeaderId,
      customizeUnitCode: getCustomizeUnitCode('supplierTable'),
      ...permanentParams,
    };

    let currentDS = this.supplierMap.get(rfxLineSupplierId);

    if (!currentDS) {
      currentDS = this.initCurrentTable({ rowKey: 'quotationLineId', supplierFlag: 1 });
      currentDS.setQueryParameter('commonProps', params);
      await currentDS.query();
      this.supplierMap.set(rfxLineSupplierId, currentDS);
    }
  }

  /**
   * 点击头标签-停止折叠面板冒泡行为
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
   * 核价 供应商列表 附件modal 显示
   * */
  @Bind()
  showCheckPriceSupplierAttachModal(e, item = {}) {
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }

    // FIXME: 中台组件问题,附件为空时传undefined
    const {
      techAttachmentUuid: techUuid = undefined,
      businessAttachmentUuid: businessUuid = undefined,
      bargainBusinessAttachmentUuid: bargainBusUuid = undefined,
      bargainTechAttachmentUuid: bargainTechUuid = undefined,
      roundBusinessAttachmentUuid: roundBusUuid = undefined,
      roundTechAttachmentUuid: roundTechUuid = undefined,
    } = item || {};

    const checkSupplierListLineAttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      businessUuid,
      techUuid,
      bargainBusUuid,
      bargainTechUuid,
      roundBusUuid,
      roundTechUuid,
    };

    C7NModal.open({
      destroyOnClose: true,
      closable: true,
      key: this.checkPriceSupplierAttachModalKey,
      // drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.button.file`).d('附件'),
      children: <Attachment {...checkSupplierListLineAttachmentProps} />,
      style: { width: '742' },
      footer: null,
    });
  }

  renderHistoricalLowTip = (priceLibHistoryDTO) => {
    const {
      unitPrice = null,
      creationDate,
      supplierCompanyNum,
      supplierCompanyName,
      taxRate = null,
      uomName,
    } = priceLibHistoryDTO || {};
    let title = intl.get('ssrc.inquiryHall.model.inquiryHall.temporarilyNoData').d('暂无数据');

    if (isNil(unitPrice)) {
      return title;
    }

    let date = dateRender(creationDate) || '';
    date = date.split('-') || [];
    const [y, m, d] = date;

    const supplierInfoValue =
      supplierCompanyNum && supplierCompanyName
        ? `${supplierCompanyNum} ${supplierCompanyName}`
        : supplierCompanyNum || supplierCompanyName || '';
    const taxText = !isNil(taxRate) ? `${taxRate}%` : '-';
    const priceText = uomName ? `${unitPrice}/${uomName}` : unitPrice;

    title = (
      <React.Fragment>
        <div>{supplierInfoValue}</div>
        <div>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.historyPrice').d('历史单价')}：{priceText}
        </div>
        <div>
          {intl.get(`ssrc.common.taxRate`).d('税率')}： {taxText}
        </div>
        <div>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期')}：{y ?? '-'}
          {intl.get('ssrc.inquiryHall.date.unit.year').d('年')}
          {m ?? '-'}
          {intl.get('ssrc.inquiryHall.date.unit.month').d('月')}
          {d ?? '-'}
          {intl.get('ssrc.inquiryHall.date.unit.day').d('日')}
        </div>
      </React.Fragment>
    );

    return title;
  };

  @Bind()
  clickStrategy(e) {
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
   * 【逻辑说明】
  1.物料行的报价供应商数量=0,供应商数量显示红色；0<物料行的报价供应商数量<最少报价供应商数量，供应商数量显示蓝色；物料行的报价供应商数量≥最少报价供应商数量,供应商数量显示绿色
    */
  renderSupplierQuotationInfo = (record) => {
    const { basicInfoDS, bidFlag } = this.props;
    const { supplierQuotedCount = null } = record ? record.get(['supplierQuotedCount']) : {};

    const { minQuotedSupplier } = basicInfoDS?.current
      ? basicInfoDS.current?.get(['minQuotedSupplier'])
      : {};

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
            type: getQuotationName(bidFlag),
          })
          .d('家供应商{type}')}
      </span>
    );

    return (
      <span style={{ margin: '0 4px', maxWidth: '120px' }}>
        <Tooltip title={text}>{text}</Tooltip>
      </span>
    );
  };

  renderItemListHeaderInfo = (record) => {
    const {
      organizationId,
      doubleUnitFlag = false,
      currentStep,
      remote,
      header = {},
      bidFlag = false,
      history,
    } = this.props;
    const { activePanel = [] } = this.state;
    const CheckAndFinishFlag = currentStep === 'FINISHED' || currentStep === 'CHECK_PENDING';

    if (!record) {
      return '';
    }

    const {
      winedAmount,
      priceTypeCode,
      currencyCode,
      secondaryQuantity = '',
      secondaryUomName = '',
      rfxQuantity = '',
      uomName,
      itemCategoryName,
      quotationRange,
      taxRate,
      taxIncludedFlag,
      itemCode,
      itemName,
      attachmentUuid,
      itemRemark,
      priceLibHistoryDTO,
      selectionStrategyMeaning,
      rfxLineItemNum,
      rfxLineItemId,
    } = record
      ? record.get([
          'winedAmount',
          'priceTypeCode',
          'currencyCode',
          'secondaryQuantity',
          'secondaryUomName',
          'rfxQuantity',
          'uomName',
          'itemCategoryName',
          'quotationRange',
          'taxRate',
          'taxIncludedFlag',
          'itemCode',
          'itemName',
          'attachmentUuid',
          'itemRemark',
          'priceLibHistoryDTO',
          'selectionStrategyMeaning',
          'rfxLineItemNum',
          'rfxLineItemId',
        ])
      : {};
    const { unitPrice = null } = priceLibHistoryDTO || {};

    if (!rfxLineItemId) {
      return '';
    }

    const cuxProps = {
      that: this,
      record,
    };

    const DirectionIcon = !activePanel?.includes(rfxLineItemId) ? 'down' : 'up';
    const itemCodeName =
      itemCode && itemName ? `${itemCode}-${itemName}` : itemCode || itemName || '';
    const taxFlag = priceTypeCode === 'TAX_INCLUDED_PRICE';

    const winedAmountTag =
      winedAmount && CheckAndFinishFlag ? (
        <Tag className={styles.winedAmount}>
          {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}
          {taxFlag
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')}
          ：
          <Tooltip
            title={
              <span>
                <PrecisionInputNumber
                  financial={currencyCode}
                  type="c7n"
                  readOnly
                  value={winedAmount}
                />
                {currencyCode}
              </span>
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={currencyCode}
                type="c7n"
                readOnly
                value={winedAmount}
              />
              {currencyCode}
            </span>
          </Tooltip>
        </Tag>
      ) : (
        ''
      );

    const headerMiddleComp = (
      <div className={styles.middleBox}>
        {remote
          ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_FIRST_TAG', null, {
              record,
              styles,
              header,
              bidFlag,
              history,
            })
          : null}
        <Tag className={styles.line}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：{rfxLineItemNum}
        </Tag>
        <Tooltip
          title={
            doubleUnitFlag
              ? `${secondaryQuantity}（${secondaryUomName}）`
              : `${rfxQuantity}（${uomName}）`
          }
          placement="topLeft"
        >
          <Tag className={styles.rfxQuantity}>
            {doubleUnitFlag ? secondaryQuantity ?? '' : rfxQuantity ?? ''}（
            {doubleUnitFlag ? secondaryUomName ?? '' : uomName ?? ''}）
          </Tag>
        </Tooltip>
        {itemCategoryName ? <Tag className={styles.other}>{itemCategoryName}</Tag> : ''}
        {!isNil(quotationRange) ? (
          <Tag className={styles.other}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
            {quotationRange}
          </Tag>
        ) : (
          ''
        )}
        {taxIncludedFlag ? (
          <Tag className={styles.other}>
            {isNil(taxRate) ? (
              intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
            ) : (
              <>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：{taxRate}
              </>
            )}
          </Tag>
        ) : (
          <Tag className={styles.other}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.noTaxRate`).d('不含税')}
          </Tag>
        )}
        {winedAmountTag}
      </div>
    );

    let historyLowPriceDom = (
      <div className={styles['historical-low']}>
        <Tooltip title={this.renderHistoricalLowTip(priceLibHistoryDTO)} placement="topLeft">
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}：
            {!isNil(unitPrice)
              ? numberSeparatorRender(unitPrice)
              : intl.get('ssrc.inquiryHall.view.message.empty').d('暂无')}
          </span>
        </Tooltip>
      </div>
    );
    historyLowPriceDom = remote ? remote.process(
      'SSRC_INQUIRY_HALL_DETAIL_PROCESS_ITEM_HISTORY_LOW_PRICE_DOM',
      historyLowPriceDom,
      cuxProps
    ) : historyLowPriceDom;

    return (
      <div
        className={styles.container}
        onClick={() => this.fetchItemLineTableListCheckPrice(record)}
      >
        <div className={styles.leftBox}>
          <img src={annexImg} alt="" style={{ width: 44, height: 44, 'margin-right': '10px' }} />
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline', height: '22px' }}>
              <span>
                <Tooltip title={itemCodeName} placement="topLeft">
                  <div className={styles.leftBoxTitle}>{itemCodeName}</div>
                </Tooltip>
              </span>
              <Icon style={{ color: '#1D2129', margin: '0 4px' }} type={DirectionIcon} />
            </div>
            <div onClick={(e) => this.clickStrategy(e)} style={{ display: 'flex' }}>
              {attachmentUuid ? (
                <span onClick={(e) => this.clickStrategy(e)}>
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-rfxitem"
                    attachmentUUID={attachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    btnText={intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                  />
                </span>
              ) : (
                ''
              )}
              <Tooltip title={itemRemark} placement="topLeft">
                <div className={styles.leftBoxRemark}>{itemRemark}</div>
              </Tooltip>
            </div>
          </span>
        </div>
        {headerMiddleComp}
        {this.renderSupplierQuotationInfo(record)}
        <div className={styles.rightBox} onClick={(e) => this.clickStrategy(e)}>
          {historyLowPriceDom}
          <C7NTag color="cyan" border={false}>
            {selectionStrategyMeaning}
          </C7NTag>
        </div>
      </div>
    );
  };

  // 跳转供应商生命周期
  handleJumpToSupplierLifecycle = (item, e) => {
    e.stopPropagation();
    const { sslmLifeCycleFlag } = this.props;
    const { tenantId, companyId, partnerTenantId, supplierCompanyId } = item || {};
    const searchObj = {
      tenantId,
      partnerTenantId,
      companyId,
      supplierCompanyId,
    };
    const newSupplierDetailPath = sslmLifeCycleFlag
      ? '/sslm/include/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new';

    openTab({
      key: newSupplierDetailPath,
      path: newSupplierDetailPath,
      title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
      search: querystring.stringify(searchObj),
      closable: true,
    });
  };

  renderInvalidHeaderInfo = (record) => {
    const { header = {}, useNewRateFlag = 0, settings } = this.props;
    const { activePanel = [] } = this.state;
    const { expertScoreType, bidRuleType, newQuotationFlag = 0 } = header || {};

    const item = record ? record?.toData() : {};

    const {
      appendFlag,
      appendRemark,
      onLineFlag,
      technologyPassStatus,
      businessPassStatus,
      technologyScore,
      businessScore,
      rfxLineSupplierId,
      supplierCompanyNum,
      supplierCompanyName,
      tenantId,
      spfmSupplierCompanyId,
      supplierTotalAmount,
      score,
      sumPassStatus,
      totalItemCount,
      quotationNumber,
      summaryReviewResult,
      partnerCompanyId,
      partnerTenantId,
    } = item || {};

    const headerImg = appendFlag ? (
      <Popover
        content={
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.addReson').d('添加理由')}:{appendRemark}
          </span>
        }
        style={{ maxWidth: '300px' }}
        trigger="hover"
      >
        <img src={processAddInvalid} alt="" style={{ width: 44, height: 44 }} />
      </Popover>
    ) : (
      <img
        src={!onLineFlag ? inValidSupplierImg : supplierGreyImg}
        alt=""
        style={{ width: 44, height: 44 }}
      />
    );

    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles['sumScore-invalid']}>
          {technologyPassStatus
            ? `${intl
                .get(`ssrc.inquiryHall.view.message.tab.technicalGroup`)
                .d('技术组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
          ：{technologyPassStatus || technologyScore}
        </Tag>
      ) : (
        ''
      );

    const businessScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles['sumScore-invalid']}>
          {businessPassStatus
            ? `${intl.get(`ssrc.inquiryHall.view.message.tab.businessGroup`).d('商务组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
          ：{businessPassStatus || businessScore}
        </Tag>
      ) : (
        ''
      );

    return (
      <div
        className={styles.container}
        onClick={() => this.fetchSupplierLineTableList({ rfxLineSupplierId })}
      >
        <div className={styles.leftBox}>
          {headerImg}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline', height: '22px' }}>
              <span>
                <Tooltip
                  title={
                    supplierCompanyNum
                      ? `${supplierCompanyNum}-${supplierCompanyName}`
                      : supplierCompanyName
                  }
                  placement="topLeft"
                >
                  <div className={styles.leftBoxTitle}>
                    {tenantId && partnerTenantId && (partnerCompanyId || spfmSupplierCompanyId) ? (
                      <a onClick={(e) => this.handleJumpToSupplierLifecycle(item, e)}>
                        {supplierCompanyNum
                          ? `${supplierCompanyNum}-${supplierCompanyName}`
                          : supplierCompanyName}
                      </a>
                    ) : supplierCompanyNum ? (
                      `${supplierCompanyNum}-${supplierCompanyName}`
                    ) : (
                      supplierCompanyName
                    )}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: '#1D2129', margin: '0 4px' }}
                type={!activePanel.includes(rfxLineSupplierId) ? 'down' : 'up'}
              />
              {useNewRateFlag ? (
                item.whetherIpCoincide ? (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                        .d('IP是否重合')}：${intl.get(`hzero.common.model.yes`).d('是')}`}
                      placement="topRight"
                    >
                      <img src={companyIpRateRed} alt="" />
                    </Tooltip>
                  </span>
                ) : (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                        .d('IP是否重合')}：${intl.get(`hzero.common.model.no`).d('否')}`}
                      placement="topRight"
                    >
                      <img src={companyIpRateGrey} alt="" />
                    </Tooltip>
                  </span>
                )
              ) : settings['011107'] &&
                +settings['011107'].settingValue &&
                item.companyIpRate >= 60 ? (
                item.companyIpRate >= 80 ? (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                        .d('重合率')}：${item.companyIpRate}%`}
                      placement="topRight"
                    >
                      <img src={companyIpRateRed} alt="" />
                    </Tooltip>
                  </span>
                ) : (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                        .d('重合率')}：${item.companyIpRate}%`}
                      placement="topRight"
                    >
                      <img src={companyIpRateGrey} alt="" />
                    </Tooltip>
                  </span>
                )
              ) : (
                ''
              )}
            </div>
            <div onClick={(e) => this.rfxLineTag(e)} style={{ display: 'flex' }}>
              <p className={styles.itemListDes}>
                {!newQuotationFlag ? (
                  <span className={styles['itemListDesItem-invalid']}>
                    <img src={attachGrey} alt="" />
                    <span style={{ marginLeft: '7px' }}>
                      {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                      <RenderFileTotalCount record={record} uiType="h0" />
                    </span>
                  </span>
                ) : (
                  <FileGroup record={record} uiType="c7n-pro" fileType="HEADER" invalidFlag={1} />
                )}
              </p>
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
          <Tag className={styles['feedbackStatus-invalid']}>
            {summaryReviewResult === 'NO_APPROVED'
              ? intl.get('ssrc.common.view.status.noApprovedCheck').d('未通过检查')
              : intl.get('ssrc.common.view.status.invalid').d('无效')}
            {/* {feedbackStatusMeaning} */}
          </Tag>
          {!quotationNumber?.match(/\/0$/g) && (
            <Tag className={styles['lineNumber-invalid']}>
              <Tooltip
                title={`${intl
                  .get('ssrc.inquiryHall.view.tooltip.selectedNumberTooltip')
                  .d('[选用行数]指选用行数/报价行数，物料行数为：')}${totalItemCount}`}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedNumber`).d('选用行数')}：
                {quotationNumber}
              </Tooltip>
            </Tag>
          )}
          {expertScoreType === 'ONLINE' ? (
            <Tag className={styles['sumScore-invalid']}>
              {sumPassStatus
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}
              ：{sumPassStatus || score}
            </Tag>
          ) : (
            ''
          )}
          {technologyScoreTag}
          {businessScoreTag}
          {supplierTotalAmount ? (
            <Tag className={styles['supplierTotalAmount-invalid']}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}：
              <Tooltip title={numberSeparatorRender(supplierTotalAmount)} placement="topLeft">
                {numberSeparatorRender(supplierTotalAmount)}
              </Tooltip>
            </Tag>
          ) : (
            ''
          )}
        </div>
        <div className={styles.rightBox} />
      </div>
    );
  };

  renderSupplierListHeaderInfo = (record) => {
    const {
      header = {},
      settings = {},
      currentStep,
      useNewRateFlag = 0,
      japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice,
      remote,
    } = this.props;
    const { activePanel = [] } = this.state;

    const { expertScoreType, bidRuleType } = header || {};
    const CheckAndFinishFlag = currentStep === 'FINISHED' || currentStep === 'CHECK_PENDING';

    const item = record ? record.toData() : {};

    const {
      supplierTotalAmount,
      priceTypeCode,
      localCurrencyCode,
      rfxLineSupplierId,
      winedAmount,
      supplierStatus,
      companyIpRate,
      biddingRoundSupplierStatus,
      biddingRoundSupplierStatusMeaning,
      biddingAcceptCount,
      supplementQtnTotalAmount,
      supplementQtnNetAmount,
      acceptQtnNetAmount,
      acceptQtnTotalAmount,
      biddingSupplierAcceptNumber,
    } = item;

    const taxIncluded = priceTypeCode === 'TAX_INCLUDED_PRICE';

    const japanDutchTotalBidding = japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice();
    const japanTotalBidding = japanBiddingTotalPrice && japanBiddingTotalPrice();

    const viewIpRepeat = settings && settings['011107'] && +settings['011107']?.settingValue;

    const suppliersupplierTotalAmountTagTitle = taxIncluded
      ? intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)')
      : intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`).d('总价(不含税)');

    const supplierTotalAmountTag = [
      !isNil(supplierTotalAmount) && !japanDutchTotalBidding ? (
        <Tag className={styles.supplierTotalAmount}>
          {suppliersupplierTotalAmountTagTitle}：
          <Tooltip
            title={
              <PrecisionInputNumber
                financial={localCurrencyCode}
                type="c7n"
                readOnly
                value={supplierTotalAmount}
              />
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.localCurrencyCode}
                type="c7n"
                readOnly
                value={item.supplierTotalAmount}
              />
            </span>
          </Tooltip>
        </Tag>
      ) : (
        ''
      ),
    ];

    // 接受价格 - 日/荷兰
    const japanDutchAcceptAmountValue = taxIncluded ? acceptQtnTotalAmount : acceptQtnNetAmount;
    const japanDutchAcceptAmountFormatted = numberSeparatorRender(japanDutchAcceptAmountValue);
    const acceptPriceAndRound = `${japanDutchAcceptAmountFormatted} / ${
      biddingSupplierAcceptNumber || '-'
    }`;
    const japanDutchAcceptAmount =
      japanDutchTotalBidding && !isNil(japanDutchAcceptAmountValue)
        ? [
          <Tag className={styles.supplierTotalAmount}>
            {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.accepttedPriceAndRound`)
                .d('接受价格/轮次')}
              ：<Tooltip title={acceptPriceAndRound}>{acceptPriceAndRound}</Tooltip>
          </Tag>,
          ]
        : '';

    const supplementAmountPrice = taxIncluded ? supplementQtnTotalAmount : supplementQtnNetAmount;
    const supplementAmountPriceFormatted = numberSeparatorRender(supplementAmountPrice);
    // 补充单价
    const supplementAmount =
      japanDutchTotalBidding && !isNil(supplementAmountPrice)
        ? [
          <Tag className={styles.supplierTotalAmount}>
            {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplementSummaryAmount`)
                .d('补充单价汇总金额')}
              ：
            <Tooltip title={supplementAmountPriceFormatted}>
              {supplementAmountPriceFormatted}
            </Tooltip>
          </Tag>,
          ]
        : '';

    const winedAmountTag =
      winedAmount && CheckAndFinishFlag ? (
        <Tag className={styles.winedAmount}>
          {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}
          {`(${
            item.priceTypeCode === 'TAX_INCLUDED_PRICE'
              ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
              : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')
          })`}
          ：
          <Tooltip
            title={
              <span>
                <PrecisionInputNumber
                  financial={item.currencyCode}
                  type="c7n"
                  readOnly
                  value={winedAmount}
                />
                {item.currencyCode}
              </span>
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="c7n"
                readOnly
                value={winedAmount}
              />
              {item.currencyCode}
            </span>
          </Tooltip>
        </Tag>
      ) : (
        ''
      );

    const headerImg = item.appendFlag ? (
      <Popover
        content={
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.addReson').d('添加理由')}:
            {item.appendRemark}
          </span>
        }
        style={{ maxWidth: '300px' }}
        trigger="hover"
      >
        <img src={processAdd} alt="" style={{ width: 44, height: 44 }} />
      </Popover>
    ) : (
      <img
        src={!item.onLineFlag ? validSupplierImg : supplierImg}
        alt=""
        style={{ width: 44, height: 44 }}
      />
    );

    // 不同情况显示前面不同的图标
    const getDisplayIcon = () => {
      const imgStyle = { width: 44, height: 44 };
      if (item.allEliminate) {
        // 全部淘汰
        return <img src={eliminateIcon} style={imgStyle} alt="icon" />;
      }

      // 新竞价会有报价禁止报价状态
      if (supplierStatus === 'PROHIBIT_QUOTATION') {
        return <img src={supplierBanQuotationSvg} style={imgStyle} alt="icon" />;
      } else if (supplierStatus === 'UN_SUPPLEMENT_PRICE') {
        // 未补充单价
        return <img src={supplierNoSupplementPriceSvg} style={imgStyle} alt="icon" />;
      } else if (item.quotedCount === 0) {
        return (
          <img
            src={!item.onLineFlag ? inValidSupplierImg : supplierGreyImg}
            alt=""
            style={imgStyle}
          />
        );
      } else if (item.allEliminate) {
        // 全部淘汰
        return <img src={eliminateIcon} style={imgStyle} alt="icon" />;
      } else {
        return headerImg;
      }
    };

    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' && CheckAndFinishFlag ? (
        <Tag className={styles.sumScore}>
          {item?.technologyPassStatus
            ? `${intl
                .get(`ssrc.inquiryHall.view.message.tab.technicalGroup`)
                .d('技术组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
          ：{item?.technologyPassStatus || item.technologyScore}
        </Tag>
      ) : (
        ''
      );

    const businessScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' && CheckAndFinishFlag ? (
        <Tag className={styles.sumScore}>
          {item?.businessPassStatus
            ? `${intl.get(`ssrc.inquiryHall.view.message.tab.businessGroup`).d('商务组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
          ：{item?.businessPassStatus || item.businessScore}
        </Tag>
      ) : (
        ''
      );

    const quotationRankFlag = remote
      ? remote.process(
          'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_QUOTATIONRANK_FLAG',
          item.quotationRank && CheckAndFinishFlag,
          { header }
        )
      : item.quotationRank && CheckAndFinishFlag;

    return (
      <div
        className={styles.container}
        onClick={() => this.fetchSupplierLineTableList({ rfxLineSupplierId })}
      >
        <div className={styles.leftBox}>
          {getDisplayIcon()}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline', height: '22px' }}>
              <span>
                <Tooltip
                  title={
                    item.supplierCompanyNum
                      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                      : item.supplierCompanyName
                  }
                  placement="topLeft"
                >
                  <div className={styles.leftBoxTitle}>
                    {item.tenantId &&
                    item.partnerTenantId &&
                    (item.partnerCompanyId || item.spfmSupplierCompanyId) ? (
                      <a onClick={(e) => this.handleJumpToSupplierLifecycle(item, e)}>
                        {item.supplierCompanyNum
                          ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                          : item.supplierCompanyName}
                      </a>
                    ) : item.supplierCompanyNum ? (
                      `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                    ) : (
                      item.supplierCompanyName
                    )}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: '#1D2129', margin: '0 4px' }}
                type={!activePanel.includes(item?.rfxLineSupplierId) ? 'down' : 'up'}
              />
              <span style={{ margin: '0 6px' }}>
                {item.candidateFlag === 1 && (
                  <span>
                    <img src={imgUrl} alt="" />
                    <span className={styles.candidate}>
                      {intl.get(`ssrc.inquiryHall.model.inquiryHall.candidate`).d('候选人')}
                    </span>
                  </span>
                )}
              </span>
              {useNewRateFlag ? (
                item.whetherIpCoincide ? (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                        .d('IP是否重合')}：${intl.get(`hzero.common.model.yes`).d('是')}`}
                      placement="topRight"
                    >
                      <img src={companyIpRateRed} alt="" />
                    </Tooltip>
                  </span>
                ) : (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                        .d('IP是否重合')}：${intl.get(`hzero.common.model.no`).d('否')}`}
                      placement="topRight"
                    >
                      <img src={companyIpRateGrey} alt="" />
                    </Tooltip>
                  </span>
                )
              ) : viewIpRepeat && companyIpRate >= 60 ? (
                <span>
                  <Tooltip
                    title={`${intl
                      .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                      .d('重合率')}：${companyIpRate}%`}
                    placement="topRight"
                  >
                    <img src={companyIpRate >= 80 ? companyIpRateRed : companyIpRateGrey} alt="" />
                  </Tooltip>
                </span>
              ) : (
                ''
              )}
            </div>
            {this.renderSupplierAttachment({ item, record })}
          </span>
        </div>
        <div className={styles.middleBox}>
          {!japanDutchTotalBidding ? (
            <Tag
              className={
                item?.feedbackStatus === 'ABANDONED' || item.quotedCount === 0
                  ? styles.feedbackStatusAbandoned
                  : styles.feedbackStatus
              }
            >
              {item.feedbackStatusMeaning}
              <Tooltip title={item.abandonRemark} theme="light">
                {item?.feedbackStatus === 'ABANDONED' ? (
                  <Icon
                    className={styles.icons}
                    type="question-circle"
                    style={{ marginLeft: '2px' }}
                  />
                ) : (
                  ''
                )}
              </Tooltip>
            </Tag>
          ) : (
            ''
          )}

          {/* 日式/荷兰 轮次状态 tag className 使用上面的 feedbackStatus */}
          {japanDutchTotalBidding && biddingRoundSupplierStatus ? (
            <Tag
              className={
                biddingRoundSupplierStatus !== 'ACCEPTED'
                  ? styles.feedbackStatusAbandoned
                  : styles.feedbackStatus
              }
            >
              {biddingRoundSupplierStatusMeaning || '-'}
            </Tag>
          ) : (
            ''
          )}

          {!item?.quotationNumber?.match(/\/0$/g) && !japanDutchTotalBidding ? (
            <Tag className={styles.lineNumber}>
              <Tooltip
                title={`${intl
                  .get('ssrc.inquiryHall.view.tooltip.selectedNumberTooltip')
                  .d('[选用行数]指选用行数/报价行数，物料行数为：')}${item.totalItemCount}`}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedNumber`).d('选用行数')}：
                {item.quotationNumber}
              </Tooltip>
            </Tag>
          ) : (
            ''
          )}
          {expertScoreType === 'ONLINE' && CheckAndFinishFlag ? (
            <Tag className={styles.sumScore}>
              {item?.sumPassStatus
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}
              ：{item.sumPassStatus || item.score}
            </Tag>
          ) : (
            ''
          )}
          {technologyScoreTag}
          {businessScoreTag}
          {quotationRankFlag ? (
            <Tag className={styles.rank}>
              {item.expertScoreType === 'ONLINE' || japanDutchTotalBidding
                ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreAndRank`).d('得分排名')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRank`).d('报价排名')}
              ：{item.quotationRank}
            </Tag>
          ) : (
            ''
          )}
          {!isNil(biddingAcceptCount) && japanTotalBidding ? (
            <Tag className={styles.rank}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingAcceptCount`).d('接受次数')}：
              {biddingAcceptCount}
            </Tag>
          ) : (
            ''
          )}
          {japanDutchAcceptAmount}
          {supplementAmount}
          {/* 二开组将新明细的埋点编码和老页面共用了， 暂时先错着吧 */}
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_SUPPLIER_LINE_LIST_TOTAL_AMOUNT_TAG',
                supplierTotalAmountTag,
                {
                  item,
                  className: styles.supplierTotalAmount,
                  header,
                }
              )
            : supplierTotalAmountTag}
          {winedAmountTag}
        </div>
        <div className={styles.rightBox} />
      </div>
    );
  };

  // supplier line file
  renderSupplierAttachment = ({ item, record }) => {
    const { header = {} } = this.props;
    const { newQuotationFlag } = header || {};

    return (
      <div onClick={(e) => this.rfxLineTag(e)} style={{ display: 'flex' }}>
        {!newQuotationFlag ? (
          <span>
            <a onClick={(e) => this.showCheckPriceSupplierAttachModal(e, item)}>
              <span>
                <SVGIcon path={AttachIcon} style={{ verticalAlign: 'middle' }} />
              </span>
              <span style={{ marginLeft: '7px' }}>
                {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                <RenderFileTotalCount record={item} uiType="h0" />
              </span>
            </a>
          </span>
        ) : (
          <FileGroup
            record={record}
            uiType="c7n-pro"
            fileType="HEADER"
            className={styles.attachment}
          />
        )}
      </div>
    );
  };

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (param = {}) => {
    const { viewApplicationOrgModal = noop } = this.props;

    const props = {
      queryParams: {
        ...(param || {}),
      },
    };

    viewApplicationOrgModal(props);
  };

  // tab panel active keys
  changeCollapse = (active = []) => {
    this.setState({
      activePanel: active,
    });
  };

  // 展示风险提示
  renderRiskRelation = () => {
    const { header = {}, organizationId } = this.props;
    const { rfxNum, secondarySourceCategory } = header || {};

    if (!rfxNum) {
      return '';
    }

    return (
      <EmbedPage
        href="/public/sdat/relation-troubleshoot"
        location={{
          search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${organizationId}`,
        }}
      />
    );
  };

  // item list
  renderItemList() {
    const {
      header = {},
      rfx = {},
      doubleUnitFlag = false,
      remote,
      getCustomizeUnitCode = noop,
      viewLadderLevel = () => {},
      customizeTable = () => {},
    } = this.props;
    const { activePanel = [], pageLoading = false } = this.state;

    const { length, totalCount } = this.itemListDS || {};

    if (length === 0) {
      return '';
    }

    const tableProps = {
      header,
      doubleUnitFlag,
      customizeTable,
      remote,
      rfx,
      viewLadderLevel,
      fetchHistoryline: this.fetchHistoryline,
      onComparePriceHistory: this.onComparePriceHistory,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      getCustomizeUnitCode,
      tableCommonFields: this.tableCommonFields,
    };

    return (
      <div className={styles['rfx-detail-check-price-override-ued']}>
        <Spin spinning={pageLoading}>
          <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
            {this.itemListDS.map((record) => {
              const { rfxLineItemId } = record ? record?.get(['rfxLineItemId']) : {};

              if (!rfxLineItemId) {
                return '';
              }

              const currentDs = this.itemMap?.get(rfxLineItemId);

              return (
                <Panel
                  header={this.renderItemListHeaderInfo(record)}
                  key={rfxLineItemId}
                  className={styles.arrowStyle}
                  showArrow={false}
                >
                  {currentDs ? <ItemLineTable {...tableProps} ds={currentDs} /> : ''}
                </Panel>
              );
            })}
          </Collapse>
        </Spin>

        {totalCount > 10 ? (
          <Pagination dataSet={this.itemListDS} className={styles.pagination} />
        ) : (
          ''
        )}
      </div>
    );
  }

  renderSupplierList = () => {
    const {
      header = {},
      viewLadderLevel,
      customizeTable = () => {},
      doubleUnitFlag = false,
      rfx = {},
      remote,
      getCustomizeUnitCode = noop,
    } = this.props;
    const { activePanel = [], pageLoading } = this.state;

    const { length, totalCount } = this.supplierListDS || {};

    if (length === 0) {
      return '';
    }

    const tableProps = {
      remote,
      header,
      doubleUnitFlag,
      customizeTable,
      rfx,
      viewLadderLevel,
      fetchHistoryline: this.fetchHistoryline,
      onComparePriceHistory: this.onComparePriceHistory,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      getCustomizeUnitCode,
      tableCommonFields: this.tableCommonFields,
    };

    return (
      <div className={styles['rfx-detail-check-price-override-ued']}>
        {this.renderRiskRelation()}
        <Spin spinning={pageLoading}>
          <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
            {this.supplierListDS.map((record) => {
              const { invalidFlag, rfxLineSupplierId } = record
                ? record?.get(['invalidFlag', 'rfxLineSupplierId'])
                : {};

              if (!rfxLineSupplierId) {
                return '';
              }

              const currentDs = this.supplierMap?.get(rfxLineSupplierId);

              return (
                <Panel
                  header={
                    invalidFlag
                      ? this.renderInvalidHeaderInfo(record)
                      : this.renderSupplierListHeaderInfo(record)
                  }
                  key={rfxLineSupplierId}
                  className={styles.arrowStyle}
                  showArrow={false}
                >
                  {currentDs ? <SupplierLineTable {...tableProps} ds={currentDs} /> : ''}
                </Panel>
              );
            })}
          </Collapse>
        </Spin>

        {totalCount > 10 ? (
          <Pagination dataSet={this.supplierListDS} className={styles.pagination} />
        ) : (
          ''
        )}
      </div>
    );
  };

  /**
   * 查询单个物品报价历史
   */
  @Debounce(600)
  fetchHistoryline = (record = {}) => {
    const { doubleUnitFlag = false, header } = this.props;

    if (!record) {
      return;
    }

    const quotationHistory = {
      record,
      doubleUnitFlag,
      quotationName: this.quotationName,
      header,
    };

    C7NModal.open({
      drawer: true,
      key: this.quotationHistoryModalKey,
      destroyOnClose: true,
      style: { width: '1000px' },
      closable: true,
      title: intl
        .get(`ssrc.supplierQuotation.model.supQuo.commonRoundHistory`, {
          quotationName: this.quotationName,
        })
        .d('多轮{quotationName}历史'),
      children: <RoundQuotationHistoryC7N {...quotationHistory} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 还比价历史
  @Debounce(600)
  onComparePriceHistory = (record) => {
    const { rfxHeaderId, doubleUnitFlag, bidFlag } = this.props;
    if (!record) {
      return;
    }

    idValidation(rfxHeaderId);

    const Props = {
      rfxHeaderId,
      record,
      doubleUnitFlag,
      quotationName: this.quotationName,
      bidFlag,
    };

    C7NModal.open({
      drawer: true,
      key: this.feedBackBarginHistoryModalKey,
      destroyOnClose: true,
      style: { width: '1000px' },
      closable: true,
      title: intl.get(`ssrc.queryRfq.view.title.history`).d('还比价历史'),
      children: <FeedBackBargainHistoryC7N {...Props} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  handleAttachmentTableRef = (node) => {
    this.attachmentTableRef = node;
  };

  winBidDetailRef = null;

  winBidRef = (node) => {
    this.winBidDetailRef = node;
  };

  renderAttachmentTab = () => {
    const {
      bidFlag,
      basicInfoDS,
      rfxHeaderId,
      fileTemplateManageFlag,
      customizeTable,
      customizeBtnGroup,
    } = this.props;

    if (fileTemplateManageFlag !== 1) {
      return '';
    }

    const fileProps = {
      customizeTable,
      customizeBtnGroup,
      headerDS: basicInfoDS,
      fileTemplateManageFlag,
      rfxHeaderId,
      editorFlag: 0,
      bidFlag,
      onRef: this.handleAttachmentTableRef,
      unitCodeSymbol: 'checkPriceDetail', // 个性化标识
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

  getTabPanes = () => {
    const {
      basicInfoDS,
      organizationId,
      customizeTable = () => {},
      bidFlag,
      viewLadderLevel,
      rfxHeaderId,
      header = {},
      rfx = {},
      doubleUnitFlag = false,
      remote,
      pubRouterAddParams = () => {},
      getCustomizeUnitCode = noop,
      customizeCollapseForm = noop,
      currentStep,
    } = this.props;

    const AllQuotationProps = {
      currentStep,
      bidFlag,
      header,
      basicInfoDS,
      allListDS: this.allListDS,
      rfxHeaderId,
      customizeTable,
      organizationId,
      doubleUnitFlag,
      rfx,
      viewLadderLevel,
      fetchHistoryline: this.fetchHistoryline,
      onComparePriceHistory: this.onComparePriceHistory,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      remote,
      pubRouterAddParams,
      getCustomizeUnitCode,
      tableCommonFields: this.tableCommonFields,
    };

    const winBidProps = {
      ...AllQuotationProps,
      getCommonApiParamsObj: this.getCommonApiParamsObj,
      onRef: this.winBidRef,
    };

    // 附件
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      viewOnly: true,
      customizeCollapseForm,
      info: header,
    };

    let panes = [
      currentStep === 'FINISHED' ? (
        <TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.winBidDetail`).d('中标明细')}
          key="winBid"
        >
          <WinningBidDetail {...winBidProps} />
        </TabPane>
      ) : null,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemLine`).d('物品明细')}
        key="itemLine"
      >
        {this.renderItemList()}
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')}
        key="supplierLine"
      >
        {this.renderSupplierList()}
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.quoteLine`).d('全部报价明细')}
        key="quoteLine"
      >
        <AllQuoteLine {...AllQuotationProps} />
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.attachmentList`).d('附件列表')}
        key="attachmentList"
      >
        <div style={{ marginTop: '16px' }}>
          {bidFlag ? (
            <AttachmentBid {...AttachmentsProps} />
          ) : (
            <AttachmentWrap {...AttachmentsProps} />
          )}
        </div>
      </TabPane>,
      this.renderAttachmentTab(),
    ];

    panes = remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_NEW_PROCESS_CHECK_PRICE_TABS', panes, {
          basicInfoDS,
          bidFlag,
          that: this,
          rfxHeaderId,
        })
      : panes;
    panes = panes || [];

    return panes.filter(Boolean);
  };

  renderTabPanes() {
    const { defaultActive = 'itemLine' } = this.state;

    return (
      <Tabs
        // activeKey={checkPriceActiveKey} // 个性化需要注释受控逻辑
        onChange={this.changeCheckPriceTabs}
        animated={false}
        className={styles.tabStyle}
        defaultActiveKey={defaultActive}
      >
        {this.getTabPanes()}
      </Tabs>
    );
  }

  /**
   * 表格差异价
   * */
  rendererDifferencepriceValue = ({ record }) => {
    const { doubleUnitFlag, header } = this.props;
    const { priceTypeCode } = header || {};

    const {
      validNetSecondaryPrice,
      validNetPrice,
      validQuotationSecPrice,
      validQuotationPrice,
      referencePrice = null,
    } = record.get([
      'validNetSecondaryPrice',
      'validNetPrice',
      'validQuotationSecPrice',
      'validQuotationPrice',
      'referencePrice',
    ]);

    let price = null;

    if (priceTypeCode === 'NET_PRICE') {
      price = validNetPrice;
      if (doubleUnitFlag) {
        price = validNetSecondaryPrice;
      }
    } else {
      price = validQuotationPrice;
      if (doubleUnitFlag) {
        price = validQuotationSecPrice;
      }
    }

    if (isNil(price) || isNil(referencePrice)) {
      return '-';
    }

    price = numberSeparatorRender(math.minus(price, referencePrice));
    return price;
  };

  /**
   * 三个tab下表格列公共字段
   * 防止每个代码加一次
   * */
  tableCommonFields = (param) => {
    const { remote, bidFlag, basicInfoDS } = this.props;
    const { checkPriceActiveKey } = this.state;
    const { winBidFlag = 0, hzeroFlag = 0 } = param || {};

    if (hzeroFlag === 1) {
      return [];
    }

    let commonFields = [
      {
        name: 'differentPrice',
        width: 120,
        align: 'right',
        renderer: this.rendererDifferencepriceValue,
        hidden: winBidFlag === 1,
      },
    ];

    commonFields = commonFields || [];

    commonFields = remote
      ? remote.process(
          'SSRC_DETAIL_CHECK_PRICE_NEW_PROCESS_CHECK_PRICE_TAB_TABLE_COMMON_FIELDS',
          commonFields,
          {
            basicInfoDS,
            bidFlag,
            checkPriceActiveKey,
            that: this,
          }
        )
      : commonFields;

    return commonFields.filter(Boolean);
  };

  render() {
    const {
      customizeTabPane,
      unitCodeSymbol,
      // remote,
    } = this.props;

    return (
      <div>
        {customizeTabPane(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_DETAIL_TABS`,
          },
          this.renderTabPanes()
        )}
      </div>
    );
  }
}

export { CheckPriceTabs };

export default CheckPriceTabs;
