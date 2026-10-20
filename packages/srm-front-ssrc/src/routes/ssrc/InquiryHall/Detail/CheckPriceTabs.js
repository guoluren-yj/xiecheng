/**
 * inquiryHall - 寻源服务/寻源大厅-核价查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import {
  Form,
  Collapse,
  Icon,
  Tag,
  Tabs,
  Pagination,
  Popover,
  Modal,
  Tooltip,
  Select,
} from 'hzero-ui';
import { Modal as C7NModal } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { noop, isNil } from 'lodash';

import hocRemote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import querystring from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload';
import { getResponse, createPagination } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { openTab } from 'utils/menuTab';
import EmbedPage from '_components/EmbedPage';
import { getQuotationName } from '@/utils/globalVariable';
import SVGIcon from '@/routes/components/SvgIcon';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';

import FeedBackBarginHistoryModal from '@/routes/ssrc/QueryQuotation/Detail/FeedBackBarginHistoryModal';
import { numberSeparatorRender } from '@/utils/renderer';
import {
  fetchItemLine,
  fetchItemQuoteLine,
  fetchSupplierLineCheckPrice,
  fetchSupplierQuoteLine,
} from '@/services/inquiryHallService';
import annexImg from '@/assets/item-icon.svg';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import QuoteLineTable from './QuoteLineTable';
import ItemLineTable from './ItemLineTable';
import SupplierLineTable from './SupplierLineTable';
import AttachmentWrap from './Attachment';
import AttachmentBid from './AttachmentBid';
import H0WinningBidDetail from './CheckPriceNewDetail/Tabs/H0WinningBidDetail.js';

import styles from './index.less';

import Attachment from '../../components/Attachment';

import QuotationHistory from './QuotationHistory';

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

class CheckPrice extends PureComponent {
  constructor(props) {
    super(props);

    this.attachmentTableRef = {};

    this.state = {
      checkPriceActiveKey: 'itemLine', // 当前激活tab面板的key
      headerList: [], // item header list
      activePanel: [],
      headerListPagination: {}, // item header pagination
      itemLines: {}, // item lines data
      supplierList: [], // supplier header list
      supplierPagination: {}, // supplier header pagination
      supplierLines: {}, // supplier table lines,
      checkSupplierListLineAttachmentProps: {}, // 核价 供应商行附件props
      checkSupplierListLineAttachmentVisible: false, // 核价 供应商行附件modal
      feedBackBarginHistoryStatus: false, // 还比价历史模态框显示/隐藏
      feedBackBarginHistorySearch: null, // 还比价历史查询条件
      defaultActive: 'itemLine',
    };
    // 获取是投标还是报价名字
    this.quotationName = getQuotationName(props.bidFlag);
  }

  quoteLineRef = React.createRef({});

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

  componentDidMount() {
    const { getHocInstance, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx || {};
    let fieldCode;
    if (getHocInstance) {
      const field =
        getHocInstance().custConfig[`SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_DETAIL_TABS`]
          ?.fields || [];
      fieldCode = (field.find((item) => item.defaultActive === 1) || {})?.fieldCode;
      this.setState({ defaultActive: fieldCode || 'itemLine' });
    }
    this.queryCheckPriceDetail(fieldCode || 'itemLine');
  }

  @Bind()
  changeCheckPriceTabs(key) {
    this.setState({
      checkPriceActiveKey: key,
    });

    this.queryCheckPriceDetail(key);
    this.changeCollapse();
  }

  // 核价下 依据卡片查询数据
  @Bind()
  queryCheckPriceDetail(key = '') {
    switch (key) {
      case 'itemLine':
        this.fetchItemLineOfCheckPrice();
        break;
      case 'supplierLine':
        this.fetchSupplierLineOfCheckPrice();
        break;
      case 'quoteLine':
        // eslint-disable-next-line no-unused-expressions
        this.quoteLineRef?.current?.fetchQuoteLine && this.quoteLineRef.current.fetchQuoteLine();
        break;
      case 'attachmentTable':
        this.fetchAttachmentList();
        break;
      case 'winBid': // 中标详情 数据查询 组件内部处理
        break;
      default:
        this.fetchItemLineOfCheckPrice();
    }
  }

  fetchAttachmentList = () => {
    const { initPage } = this.attachmentTableRef || {};

    if (initPage) {
      initPage();
    }
  };

  /**
   * 物品明细 - 查询
   */
  @Bind()
  async fetchItemLineOfCheckPrice(page = {}) {
    const {
      organizationId,
      rfxHeaderId,
      pubRouterAddParams = () => {},
      remote,
      bidFlag = false,
    } = this.props;

    try {
      let data = await fetchItemLine({
        page,
        organizationId,
        rfxHeaderId,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { content = [] } = data || {};
      this.setState({
        headerList: content,
        headerListPagination: createPagination(data),
      });
      const eventProps = {
        content,
        current: this,
        bidFlag,
        fetchItemLineTableListCheckPrice: this.fetchItemLineTableListCheckPrice,
      };
      if (remote?.event) {
        remote.event.fireEvent('setItemActivePanel', eventProps);
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  async fetchSupplierLineOfCheckPrice(page = {}) {
    const {
      organizationId,
      rfxHeaderId,
      pubRouterAddParams = () => {},
      remote,
      bidFlag = false,
    } = this.props;

    try {
      let data = await fetchSupplierLineCheckPrice({
        page,
        organizationId,
        rfxHeaderId,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      const { content = [] } = data || {};
      this.setState({
        supplierList: content,
        supplierPagination: createPagination(data),
      });
      const eventProps = {
        content,
        current: this,
        bidFlag,
        fetchSupplierLineTableList: this.fetchSupplierLineTableList,
      };
      if (remote?.event) {
        remote.event.fireEvent('setSupplierActivePanel', eventProps);
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * 物品明细 - 改变分页
   */
  @Bind()
  changeItemLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchItemLineOfCheckPrice(changedPagination);
  }

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    this.fetchSupplierLineOfCheckPrice(changedPagination);
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  // 核价 物品列表 物品明细表格
  @Bind()
  async fetchItemLineTableListCheckPrice(page = {}, item = {}) {
    const { rfxHeaderId, organizationId, rfx = {}, pubRouterAddParams = () => {} } = this.props;
    const { unitCodeSymbol } = rfx || {};
    const { rfxLineItemId = null } = item;

    try {
      let data = await fetchItemQuoteLine({
        page,
        organizationId,
        rfxLineItemId,
        rfxHeaderId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.ITEM_DETAIL`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      const { content = [] } = data || {};
      const newData = content.map((itemLine) => ({ ...itemLine, rfxLineItemId }));
      const pagination = createPagination(data);

      this.setState((prevState) => {
        return {
          itemLines: {
            ...prevState.itemLines,
            [rfxLineItemId]: {
              itemLine: newData,
              itemLinePagination: pagination,
            },
          },
        };
      });
    } catch (e) {
      throw e;
    }
  }

  // 核价 物品列表 物品明细表格
  @Bind()
  async fetchSupplierLineTableList(page = {}, rfxLineSupplierId = null, filters, sorter) {
    const { rfx = {}, pubRouterAddParams = () => {} } = this.props;
    const { unitCodeSymbol } = rfx || {};
    if (!rfxLineSupplierId) {
      return;
    }

    const { rfxHeaderId, organizationId, remote } = this.props;

    const sorterRemote = remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_SUPPLIER_SORTER', {}, { sorter })
      : {};

    try {
      let data = await fetchSupplierQuoteLine({
        page,
        organizationId,
        rfxLineSupplierId,
        rfxHeaderId,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER_DETAIL`,
        ...pubRouterAddParams(),
        ...sorterRemote,
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      const { content = [] } = data || {};
      const newData = content.map((item) => ({ ...item, rfxLineSupplierId }));
      const pagination = createPagination(data);

      this.setState((prevState) => {
        return {
          supplierLines: {
            ...prevState.supplierLines,
            [rfxLineSupplierId]: {
              supplierLines: newData,
              supplierLinesPagination: pagination,
            },
          },
        };
      });
    } catch (e) {
      throw e;
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
      techAttachmentUuid = undefined,
      businessAttachmentUuid = undefined,
      bargainBusinessAttachmentUuid = undefined,
      bargainTechAttachmentUuid = undefined,
      roundBusinessAttachmentUuid = undefined,
      roundTechAttachmentUuid = undefined,
    } = item;
    this.setState({
      checkSupplierListLineAttachmentProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
        bargainBusUuid: bargainBusinessAttachmentUuid,
        bargainTechUuid: bargainTechAttachmentUuid,
        roundBusUuid: roundBusinessAttachmentUuid,
        roundTechUuid: roundTechAttachmentUuid,
      },
      checkSupplierListLineAttachmentVisible: true,
    });
  }

  /**
   * 核价 供应商列表 附件modal 隐藏
   * */
  @Bind()
  hideCheckPriceSupplierAttachModal() {
    this.setState({
      checkSupplierListLineAttachmentProps: {},
      checkSupplierListLineAttachmentVisible: false,
    });
  }

  renderHistoricalLowTip(priceLibHistoryDTO, item) {
    const { remote } = this.props;

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
        </React.Fragment>
      );
    } else {
      title = intl.get('ssrc.inquiryHall.model.inquiryHall.temporarilyNoData').d('暂无数据');
    }

    title = remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_ITEM_RENDERHISTORICALLOWTIP', title, {
          priceLibHistoryDTO,
          that: this,
          item,
        })
      : title;

    return title;
  }

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
  renderSupplierQuotationInfo = (item) => {
    const { header, bidFlag } = this.props;
    const { supplierQuotedCount = null } = item || {};

    const { minQuotedSupplier } = header || {};

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

  @Bind()
  renderItemListHeaderInfo(item = {}) {
    const {
      organizationId,
      doubleUnitFlag = false,
      // itemLineListProps: { fetchItemLineTableListCheckPrice },
      currentStep,
      remote,
      header = {},
      bidFlag = false,
    } = this.props;
    const { activePanel = [] } = this.state;
    const CheckAndFinishFlag = currentStep === 'FINISHED' || currentStep === 'CHECK_PENDING';
    const { taxIncludedFlag, taxRate } = item || {};
    const cuxProps = {
      item,
      that: this,
    };

    const winedAmountTag =
      item.winedAmount && CheckAndFinishFlag ? (
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
                  type="hzero"
                  readOnly
                  value={item.winedAmount}
                />
                {item.currencyCode}
              </span>
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="hzero"
                readOnly
                value={item.winedAmount}
              />
              {item.currencyCode}
            </span>
          </Tooltip>
        </Tag>
      ) : (
        ''
      );

    const Styles = remote
      ? remote.process(
          'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_ITEM_CODE_STYLE',
          {},
          {
            item,
            bidFlag,
            header,
          }
        )
      : {};

    const headerMiddleComp = (
      <div className={styles.middleBox}>
        <Tag className={styles.line}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：{item.rfxLineItemNum}
        </Tag>
        <Tooltip
          title={
            doubleUnitFlag
              ? `${item.secondaryQuantity}（${item.secondaryUomName}）`
              : `${item.rfxQuantity}（${item.uomName}）`
          }
          placement="topLeft"
        >
          <Tag className={styles.rfxQuantity}>
            {doubleUnitFlag ? item.secondaryQuantity : item.rfxQuantity}（
            {doubleUnitFlag ? item.secondaryUomName : item.uomName}）
          </Tag>
        </Tooltip>
        {item.itemCategoryName ? <Tag className={styles.other}>{item.itemCategoryName}</Tag> : ''}
        {item.quotationRange ? (
          <Tag className={styles.other}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
            {item.quotationRange}
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
        {remote
          ? remote.process(
              'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_ITEM_LINE_LIST_WINED_AMOUNT_TAG',
              winedAmountTag,
              {
                item,
                className: styles.winedAmount,
                header,
              }
            )
          : winedAmountTag}
        {remote
          ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_ITEM_LINE_LIST_MORE_TAG', null, {
              item,
              styles,
              header,
            })
          : null}
      </div>
    );

    let historyLowPriceDom = (
      <div className={styles['historical-low']}>
        <Tooltip
          title={this.renderHistoricalLowTip(item.priceLibHistoryDTO, item)}
          placement="topLeft"
        >
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}：
            {item.priceLibHistoryDTO &&
            (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
              ? numberSeparatorRender(item.priceLibHistoryDTO.unitPrice)
              : intl.get('ssrc.inquiryHall.view.message.empty').d('暂无')}
          </span>
        </Tooltip>
      </div>
    );

    historyLowPriceDom = remote
      ? remote.process(
          'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_ITEM_HISTORY_LOW_PRICE_DOM',
          historyLowPriceDom,
          cuxProps
        )
      : historyLowPriceDom;

    return (
      <div
        className={styles.container}
        onClick={() => this.fetchItemLineTableListCheckPrice({}, item)}
      >
        <div className={styles.leftBox}>
          <img src={annexImg} alt="" style={{ width: 44, height: 44, 'margin-right': '10px' }} />
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline', height: '22px' }}>
              <span>
                <Tooltip
                  title={item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                  placement="topLeft"
                >
                  <div className={styles.leftBoxTitle} style={Styles}>
                    {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: '#1D2129', margin: '0 4px' }}
                type={!activePanel.includes(item?.rfxLineItemId) ? 'down' : 'up'}
              />
            </div>
            <div onClick={(e) => this.clickStrategy(e)} style={{ display: 'flex' }}>
              {item.attachmentUuid ? (
                <span onClick={(e) => this.clickStrategy(e)}>
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-rfxitem"
                    attachmentUUID={item.attachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    btnText={intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                  />
                </span>
              ) : (
                ''
              )}
              <Tooltip title={item.itemRemark} placement="topLeft">
                <div className={styles.leftBoxRemark}>{item.itemRemark}</div>
              </Tooltip>
            </div>
          </span>
        </div>
        {remote
          ? remote.render(
              'SSRC_DETAIL_CHECK_PRICE_TABS_RENDER_ITEM_HEADER_MIDDLE',
              headerMiddleComp,
              {
                item,
                header,
                bidFlag,
                styles,
                doubleUnitFlag,
              }
            )
          : headerMiddleComp}
        {this.renderSupplierQuotationInfo(item)}
        <div className={styles.rightBox} onClick={(e) => this.clickStrategy(e)}>
          {historyLowPriceDom}
          <Form.Item className={styles.selectedPolicyItemStyle}>
            <Select
              allowClear
              disabled
              size="small"
              className={styles.selectStyle}
              placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.strategy`).d('选择策略')}
              value={item.selectionStrategyMeaning}
            />
          </Form.Item>
        </div>
      </div>
    );

    // return (
    //   <Row
    //     className={styles.itemHeaderItem}
    //     onClick={() => this.fetchItemLineTableListCheckPrice({}, item)}
    //   >
    //     <Col span={1}>
    //       <img src={annexImg} alt="" style={{ width: 44, height: 44 }} />
    //     </Col>
    //     <Col span={5} style={{ paddingLeft: '8px' }}>
    //       <Row>
    //         <Col span={20} className={styles.itemNameCode}>
    //           <Tooltip title={item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}>
    //             {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
    //           </Tooltip>
    //         </Col>
    //         <Col span={4}>
    //           <Icon
    //             className={styles.arrowIcon}
    //             type={!activePanel.includes(item?.rfxLineItemId) ? 'down' : 'up'}
    //           />
    //         </Col>
    //       </Row>
    //       <Row>
    //         {item.attachmentUuid ? (
    //           <Col span={8} className={styles.itemListDes}>
    //             <Upload
    //               bucketName={PRIVATE_BUCKET}
    //               bucketDirectory="ssrc-rfx-rfxitem"
    //               attachmentUUID={item.attachmentUuid}
    //               tenantId={organizationId}
    //               viewOnly
    //               btnText={intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
    //             />
    //           </Col>
    //         ) : null}
    //         <Col span={16} className={styles.itemListDes}>
    //           <div className={styles.itemListDesItem}>{item.itemRemark}</div>
    //         </Col>
    //       </Row>
    //     </Col>
    //     <Col span={12}>
    //       <Row>
    //         <Tag className={styles.itemNumber}>
    //           {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
    //           {item.rfxLineItemNum}
    //         </Tag>
    //         <Tooltip
    //           title={
    //             doubleUnitFlag
    //               ? `${item.secondaryQuantity}（${item.secondaryUomName}）`
    //               : `${item.rfxQuantity}（${item.uomName}）`
    //           }
    //           placement="topLeft"
    //         >
    //           <Tag className={styles.rfxQuantity}>
    //             {doubleUnitFlag ? item.secondaryQuantity : item.rfxQuantity}（
    //             {doubleUnitFlag ? item.secondaryUomName : item.uomName}）
    //           </Tag>
    //         </Tooltip>
    //       </Row>
    //       <Row>
    //         {item.itemCategoryName ? (
    //           <Tag className={styles.others}>{item.itemCategoryName}</Tag>
    //         ) : (
    //           ''
    //         )}
    //         {item.quotationRange ? (
    //           <Tooltip placement="topLeft" title={item.quotationRange}>
    //             <Tag className={styles.others} style={{ maxWidth: '120px' }}>
    //               {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
    //               {item.quotationRange}
    //             </Tag>
    //           </Tooltip>
    //         ) : (
    //           ''
    //         )}
    //         {item.taxRate ? (
    //           <Tag className={styles.others}>
    //             {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：
    //             {item.taxRate}
    //           </Tag>
    //         ) : (
    //           <Tag className={styles.others}>
    //             {intl.get(`ssrc.inquiryHall.model.inquiryHall.noTaxRate`).d('不含税')}
    //           </Tag>
    //         )}
    //       </Row>
    //     </Col>
    //     <Col span={5} style={{ paddingLeft: '16px' }}>
    //       <span>
    //         {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}：
    //         {item.priceLibHistoryDTO &&
    //         (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
    //           ? numberSeparatorRender(item.priceLibHistoryDTO.unitPrice)
    //           : intl.get('ssrc.inquiryHall.view.message.empty').d('暂无')}
    //       </span>
    //     </Col>
    //   </Row>
    // );
  }

  // 跳转供应商生命周期
  handleJumpToSupplierLifecycle = (item, e) => {
    e.stopPropagation();
    const { sslmLifeCycleFlag, remote } = this.props;
    const { tenantId, companyId, partnerTenantId, supplierCompanyId } = item;
    const searchObj = {
      tenantId,
      partnerTenantId,
      companyId,
      supplierCompanyId,
    };

    let jumpSupplierFlag = true;
    jumpSupplierFlag = remote
      ? remote.process(
          'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_SUPPLIER_VIEW_FLAG',
          jumpSupplierFlag,
          { that: this, item }
        )
      : jumpSupplierFlag;
    if (jumpSupplierFlag === false) {
      return;
    }

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

  @Bind()
  renderInvalidHeaderInfo(item) {
    const { header = {}, remote, useNewRateFlag = 0, settings } = this.props;
    const { activePanel = [] } = this.state;
    const { expertScoreType, bidRuleType, newQuotationFlag = 0 } = header;
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
        <img src={processAddInvalid} alt="" style={{ width: 44, height: 44 }} />
      </Popover>
    ) : (
      <img
        src={!item.onLineFlag ? inValidSupplierImg : supplierGreyImg}
        alt=""
        style={{ width: 44, height: 44 }}
      />
    );
    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles['sumScore-invalid']}>
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
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles['sumScore-invalid']}>
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

    return (
      <div
        className={styles.container}
        onClick={() => this.fetchSupplierLineTableList({}, item.rfxLineSupplierId)}
      >
        <div className={styles.leftBox}>
          {headerImg}
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
                      <RenderFileTotalCount record={item} uiType="h0" />
                    </span>
                  </span>
                ) : (
                  <FileGroup record={item} uiType="h0" fileType="HEADER" invalidFlag={1} />
                )}
              </p>
              {remote
                ? remote.render(
                    'SSRC_DETAIL_CHECK_PRICE_TABS_SUPPLIER_HEADER_INFO_RENDER_OTHERS',
                    null,
                    {
                      item,
                      current: this,
                    }
                  )
                : null}
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
          <Tag className={styles['feedbackStatus-invalid']}>
            {item.summaryReviewResult === 'NO_APPROVED'
              ? intl.get('ssrc.common.view.status.noApprovedCheck').d('未通过检查')
              : intl.get('ssrc.common.view.status.invalid').d('无效')}
            {/* {item.feedbackStatusMeaning} */}
          </Tag>
          {!item?.quotationNumber?.match(/\/0$/g) && (
            <Tag className={styles['lineNumber-invalid']}>
              <Tooltip
                title={`${intl
                  .get('ssrc.inquiryHall.view.tooltip.selectedNumberTooltip')
                  .d('[选用行数]指选用行数/报价行数，物料行数为：')}${item.totalItemCount}`}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedNumber`).d('选用行数')}：
                {item.quotationNumber}
              </Tooltip>
            </Tag>
          )}
          {expertScoreType === 'ONLINE' ? (
            <Tag className={styles['sumScore-invalid']}>
              {item?.sumPassStatus
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}
              ：{item?.sumPassStatus || item.score}
            </Tag>
          ) : (
            ''
          )}
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_BUSINESS_SCORE_TAG',
                businessScoreTag
              )
            : businessScoreTag}
          {item.supplierTotalAmount ? (
            <Tag className={styles['supplierTotalAmount-invalid']}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}：
              <Tooltip title={numberSeparatorRender(item.supplierTotalAmount)} placement="topLeft">
                {numberSeparatorRender(item.supplierTotalAmount)}
              </Tooltip>
            </Tag>
          ) : (
            ''
          )}
        </div>
        <div className={styles.rightBox} />
      </div>
    );
  }

  renderSupplierListHeaderInfo(item = {}) {
    const { header = {}, settings, currentStep, remote, useNewRateFlag = 0 } = this.props;
    const { activePanel = [] } = this.state;
    const CheckAndFinishFlag = currentStep === 'FINISHED' || currentStep === 'CHECK_PENDING';

    const supplierTotalAmountTag = [
      item.supplierTotalAmount ? (
        <Tag className={styles.supplierTotalAmount}>
          {item.priceTypeCode === 'TAX_INCLUDED_PRICE'
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)')
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`)
                .d('总价(不含税)')}
          ：
          <Tooltip
            title={
              <PrecisionInputNumber
                financial={item.localCurrencyCode}
                type="hzero"
                readOnly
                value={item.supplierTotalAmount}
              />
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.localCurrencyCode}
                type="hzero"
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

    const winedAmountTag =
      item.winedAmount && CheckAndFinishFlag ? (
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
                  type="hzero"
                  readOnly
                  value={item.winedAmount}
                />
                {item.currencyCode}
              </span>
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="hzero"
                readOnly
                value={item.winedAmount}
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
      // 新竞价会有报价禁止报价状态
      if (item.supplierStatus === 'PROHIBIT_QUOTATION') {
        return <img src={supplierBanQuotationSvg} style={imgStyle} alt="icon" />;
      } else if (item.supplierStatus === 'UN_SUPPLEMENT_PRICE') {
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

    const { expertScoreType, bidRuleType, newQuotationFlag } = header;

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
        onClick={() => this.fetchSupplierLineTableList({}, item.rfxLineSupplierId)}
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
              ) : settings &&
                settings['011107'] &&
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
                  record={item}
                  uiType="h0"
                  fileType="HEADER"
                  className={styles.attachment}
                />
              )}
              {remote
                ? remote.render(
                    'SSRC_DETAIL_CHECK_PRICE_TABS_SUPPLIER_HEADER_INFO_RENDER_OTHERS',
                    null,
                    {
                      item,
                      current: this,
                    }
                  )
                : null}
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
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
          {!item?.quotationNumber?.match(/\/0$/g) && (
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
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_BUSINESS_SCORE_TAG',
                businessScoreTag
              )
            : businessScoreTag}
          {quotationRankFlag ? (
            <Tag className={styles.rank}>
              {item.expertScoreType === 'ONLINE'
                ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreAndRank`).d('得分排名')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRank`).d('报价排名')}
              ：{item.quotationRank}
            </Tag>
          ) : (
            ''
          )}
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
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_SUPPLIER_LINE_LIST_WINED_AMOUNT_TAG',
                winedAmountTag,
                {
                  item,
                  header,
                  className: styles.winedAmount,
                }
              )
            : winedAmountTag}
          {remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_SUPPLIER_LINE_LIST_LASTED_TAG',
                '',
                {
                  item,
                  header,
                  className: styles.winedAmount,
                  that: this,
                }
              )
            : ''}
        </div>
        <div className={styles.rightBox} />
      </div>
    );

    // return (
    //   <Row
    //     className={styles.itemHeaderItem}
    //     onClick={() => this.fetchSupplierLineTableList({}, item.rfxLineSupplierId)}
    //   >
    //     <Col span={1}>
    //       {item.allEliminate ? (
    //         <img src={eliminateIcon} alt="icon" />
    //       ) : (
    //         <div className={styles.itemListImg}>{headerImg}</div>
    //       )}
    //     </Col>
    //     <Col span={14} style={{ paddingLeft: '8px' }}>
    //       <Row>
    //         <Col span={18} className={styles.itemNameCode}>
    //           <span className={styles.itemListNum}>
    //             <Tooltip
    //               title={
    //                 item.supplierCompanyNum
    //                   ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
    //                   : item.supplierCompanyName
    //               }
    //             >
    //               {item.supplierCompanyNum
    //                 ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
    //                 : item.supplierCompanyName}
    //             </Tooltip>
    //           </span>
    //           <span className={styles.itemListNumRight}>
    //             <Icon
    //               type={!activePanel.includes(item?.rfxLineSupplierId) ? 'down' : 'up'}
    //               className={styles.arrowIcon}
    //             />
    //           </span>
    //         </Col>
    //       </Row>
    //       <Row>
    //         <Col span={6}>
    //           <Tooltip
    //             title={`${intl
    //               .get('ssrc.inquiryHall.view.tooltip.selectedNumberTooltip')
    //               .d('[选用行数]指选用行数/报价行数，物料行数为：')}${item.totalItemCount}`}
    //           >
    //             {!item?.quotationNumber?.match(/\/0$/g) && (
    //               <Tag className={styles.lineNumber}>
    //                 {intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedNumber`).d('选用行数')}：
    //                 {item.quotationNumber}
    //               </Tag>
    //             )}
    //           </Tooltip>
    //         </Col>
    //         <Col span={3}>
    //           <a onClick={(e) => this.showCheckPriceSupplierAttachModal(e, item)}>
    //             <span>
    //               <SVGIcon path={AttachIcon} style={{ verticalAlign: 'middle' }} />
    //             </span>
    //             <span style={{ marginLeft: '7px' }}>
    //               {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
    //             </span>
    //           </a>
    //         </Col>
    //         <Col span={4}>
    //           {header.expertScoreType === 'ONLINE' ? (
    //             <Tag className={styles.sumScore}>
    //               {item?.sumPassStatus
    //                 ? intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总')
    //                 : intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}
    //               ：{item?.sumPassStatus || item.score}
    //             </Tag>
    //           ) : (
    //             ''
    //           )}
    //         </Col>
    //         <Col span={5}>
    //           {header.bidRuleType === 'DIFF' && header.expertScoreType === 'ONLINE' && (
    //             <Tag className={styles.sumScore}>
    //               {item.technologyPassStatus
    //                 ? `${intl
    //                     .get(`ssrc.inquiryHall.view.message.tab.technicalGroup`)
    //                     .d('技术组')}${intl
    //                     .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
    //                     .d('汇总')}`
    //                 : intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
    //               ：{item.technologyPassStatus || item.technologyScore}
    //             </Tag>
    //           )}
    //         </Col>
    //         <Col span={6}>
    //           {header.bidRuleType === 'DIFF' && header.expertScoreType === 'ONLINE' && (
    //             <Tag className={styles.sumScore}>
    //               {item.businessPassStatus
    //                 ? `${intl
    //                     .get(`ssrc.inquiryHall.view.message.tab.businessGroup`)
    //                     .d('商务组')}${intl
    //                     .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
    //                     .d('汇总')}`
    //                 : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
    //               ：{item.businessPassStatus || item.businessScore}
    //             </Tag>
    //           )}
    //         </Col>
    //       </Row>
    //     </Col>
    //     <Col span={9}>
    //       <Row span={8} className={styles.statusAndAmountTag}>
    //         {/* <Col span={8}> */}
    //         {abandonRemarkRender({
    //           val: (
    //             <Tag
    //               className={
    //                 item?.feedbackStatus === 'ABANDONED'
    //                   ? styles.feedbackStatusAbandoned
    //                   : styles.feedbackStatus
    //               }
    //             >
    //               {item.feedbackStatusMeaning}
    //               {item?.feedbackStatus === 'ABANDONED' ? (
    //                 <Icon type="question-circle" style={{ marginLeft: '2px' }} />
    //               ) : (
    //                 ''
    //               )}
    //             </Tag>
    //           ),
    //           record: item,
    //         })}
    //         {/* </Col> */}
    //         {/* <Col> */}
    //         {item.supplierTotalAmount && (
    //           <Tooltip
    //             title={
    //               <PrecisionInputNumber
    //                 financial={item.currencyCode}
    //                 type="hzero"
    //                 readOnly
    //                 value={item.supplierTotalAmount}
    //               />
    //             }
    //           >
    //             <Tag className={styles.supplierTotalAmount}>
    //               {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}
    //               ：
    //               {
    //                 <PrecisionInputNumber
    //                   financial={item.currencyCode}
    //                   type="hzero"
    //                   readOnly
    //                   value={item.supplierTotalAmount}
    //                 />
    //               }
    //             </Tag>
    //           </Tooltip>
    //         )}
    //         {currentStep === 'FINISHED' && item.winedAmount ? (
    //           <Tooltip
    //             title={
    //               <span>
    //                 <PrecisionInputNumber
    //                   financial={item.currencyCode}
    //                   type="hzero"
    //                   readOnly
    //                   value={item.winedAmount}
    //                 />
    //                 {item.currencyCode}
    //               </span>
    //             }
    //           >
    //             <Tag className={styles.winedAmount}>
    //               {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}
    //               {`(${
    //                 item.priceTypeCode === 'TAX_INCLUDED_PRICE'
    //                   ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
    //                   : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')
    //               })`}
    //               ：
    //               {
    //                 <span>
    //                   <PrecisionInputNumber
    //                     financial={item.currencyCode}
    //                     type="hzero"
    //                     readOnly
    //                     value={item.winedAmount}
    //                   />
    //                   {item.currencyCode}
    //                 </span>
    //               }
    //             </Tag>
    //           </Tooltip>
    //         ) : (
    //           ''
    //         )}
    //         {/* </Col> */}
    //         {/* <Col span={8}> */}
    //         {item.candidateFlag === 1 && (
    //           <Popover placement="topLeft" content={item.candidateSuggestion}>
    //             <span className={styles.allcandidate}>
    //               <img src={imgUrl} alt="" />
    //               <span className={styles.candidate}>
    //                 {intl.get(`ssrc.inquiryHall.model.inquiryHall.candidate`).d('候选人')}
    //               </span>
    //             </span>
    //           </Popover>
    //         )}
    //         {/* </Col> */}
    //       </Row>
    //     </Col>
    //     {/* <Col span={8} style={{ paddingLeft: '16px' }}> */}
    //     {/*  <Row className={styles.itemListDes}> */}
    //     {/*    <Col span={12} className={styles.itemListDesItem}> */}
    //     {/*      <Tooltip title={`${item.contactName}`} placement="topRight"> */}
    //     {/*        {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}： */}
    //     {/*        {item.contactName} */}
    //     {/*      </Tooltip> */}
    //     {/*    </Col> */}
    //     {/*    <Col span={12} className={styles.itemListDesItem}> */}
    //     {/*      <Tooltip title={`${item.contactMobilephone}`} placement="topRight"> */}
    //     {/*        {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}： */}
    //     {/*        {item.contactMobilephone} */}
    //     {/*      </Tooltip> */}
    //     {/*    </Col> */}
    //     {/*  </Row> */}
    //     {/*  <Row> */}
    //     {/*    <Col span={12} className={styles.itemListDesItem}> */}
    //     {/*      <Tooltip title={`${item.contactMail}`} placement="topRight"> */}
    //     {/*        {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}： */}
    //     {/*        {item.contactMail} */}
    //     {/*      </Tooltip> */}
    //     {/*    </Col> */}
    //     {/*  </Row> */}
    //     {/* </Col> */}
    //   </Row>
    // );
  }

  applicationScopeRef = {};

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (param = {}) => {
    const handleViewApplicationModal = (params = {}) => {
      const { organizationId, rfxHeaderId, applicationScopeFlag, queryParams = {} } = params || {};
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

      const modalKey = C7NModal.key();
      C7NModal.open({
        destroyOnClose: true,
        closable: true,
        key: modalKey,
        drawer: true,
        bodyStyle: {
          padding: 0,
        },
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScopeDetail {...Props} />,
        style: { width: '1090px' },
        footer: null,
      });
    };
    const { organizationId, header = {}, remote, bidFlag = false } = this.props;
    const { rfxHeaderId, applicationScopeFlag } = header || {};

    const props = {
      rfxHeaderId,
      organizationId,
      applicationScopeFlag,
      bidFlag,
      queryParams: { ...(param || {}) },
      handleViewApplicationModal,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteCheckPriceTabsViewApplicationModalEvent', props);
    } else {
      handleViewApplicationModal(props);
    }
  };

  changeCollapse = (active = []) => {
    this.setState({
      activePanel: active,
    });
  };

  renderItemList() {
    const {
      viewLadderLevel = () => {},
      customizeTable = () => {},
      showQuotationDetail,
      header = {},
      checkWay,
      rfx = {},
      doubleUnitFlag = false,
      remote,
      // fetchItemQuoteLineLoading,
    } = this.props;
    const {
      headerList = [],
      headerListPagination = {},
      itemLines = {},
      activePanel = [],
    } = this.state;

    const tableProps = {
      header,
      checkWay,
      doubleUnitFlag,
      customizeTable,
      showQuotationDetail,
      viewLadderLevel,
      remote,
      // dataSource: itemQuoteLine,
      // pagination: itemQuoteLinePagination,
      onChange: this.fetchItemLineTableListCheckPrice,
      // fetchItemQuoteLineLoading,
      rfx,
      fetchHistoryline: this.fetchHistoryline,
      onComparePriceHistory: this.onComparePriceHistory,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
    };
    const { total = 0 } = headerListPagination || {};
    return (
      <div className={styles['rfx-detail-check-price-override-ued']}>
        <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
          {headerList &&
            headerList.map((item) => (
              <Panel
                header={this.renderItemListHeaderInfo(item)}
                key={item.rfxLineItemId}
                className={styles.arrowStyle}
                showArrow={false}
              >
                <ItemLineTable
                  {...tableProps}
                  itemLineHeader={item}
                  dataSource={(itemLines[item.rfxLineItemId] || {}).itemLine}
                  pagination={(itemLines[item.rfxLineItemId] || {}).itemLinePagination}
                />
              </Panel>
            ))}
        </Collapse>
        {total > 10 && (
          <Pagination
            className={styles.pagination}
            {...headerListPagination}
            onChange={(page, pageSize) => this.changeItemLinePagination(page, pageSize)}
            onShowSizeChange={(current, size) => this.changeItemLinePagination(current, size)}
          />
        )}
      </div>
    );
  }

  // 展示风险提示
  renderRiskRelation = () => {
    const { header = {}, organizationId, currentStep, remote } = this.props;
    const { rfxNum, secondarySourceCategory } = header || {};

    let dom = (
      <EmbedPage
        href="/public/sdat/relation-troubleshoot"
        location={{
          search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${organizationId}`,
        }}
      />
    );

    dom = remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_PROCESS_RENDERRISKRELATIONN_DOM', dom, {
          that: this,
          header,
          currentStep,
        })
      : dom;

    return dom;
  };

  renderSupplierList(dataSource = [], supplierLinePagination = {}) {
    const {
      header = {},
      viewLadderLevel,
      customizeTable = () => {},
      checkWay,
      doubleUnitFlag = false,
      showQuotationDetail,
      rfx = {},
      remote,
    } = this.props;
    const { supplierLines = {}, activePanel = [] } = this.state;

    const tableProps = {
      remote,
      header,
      checkWay,
      doubleUnitFlag,
      customizeTable,
      showQuotationDetail,
      viewLadderLevel,
      rfx,
      onChange: this.fetchSupplierLineTableList,
      fetchHistoryline: this.fetchHistoryline,
      onComparePriceHistory: this.onComparePriceHistory,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
    };

    const { total = 0 } = supplierLinePagination || {};
    return (
      <div className={styles['rfx-detail-check-price-override-ued']}>
        {this.renderRiskRelation()}
        <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
          {dataSource &&
            dataSource.map((item) => (
              <Panel
                header={
                  item.invalidFlag || item.summaryReviewResult === 'NO_APPROVED'
                    ? this.renderInvalidHeaderInfo(item)
                    : this.renderSupplierListHeaderInfo(item)
                }
                key={item.rfxLineSupplierId}
                className={styles.arrowStyle}
                showArrow={false}
              >
                <SupplierLineTable
                  {...tableProps}
                  supplierQuoteLine={
                    (supplierLines[item.rfxLineSupplierId] || {}).supplierLines || []
                  }
                  supplierQuoteLinePagination={
                    (supplierLines[item.rfxLineSupplierId] || {}).supplierLinesPagination || {}
                  }
                  rfxLineSupplierId={item.rfxLineSupplierId}
                />
              </Panel>
            ))}
        </Collapse>
        {dataSource?.length > 0 && total > 10 && (
          <Pagination
            className={styles.pagination}
            {...supplierLinePagination}
            onChange={(page, pageSize) => this.changeSupplierLinePagination(page, pageSize)}
            onShowSizeChange={(current, size) => this.changeSupplierLinePagination(current, size)}
          />
        )}
      </div>
    );
  }

  /**
   * 查询单个物品报价历史
   */
  @Bind()
  fetchHistoryline(record = {}) {
    const { doubleUnitFlag = false } = this.props;
    const quotationHistory = {
      record,
      doubleUnitFlag,
      quotationName: this.quotationName,
    };
    C7NModal.open({
      drawer: true,
      key: C7NModal.key(),
      destroyOnClose: true,
      style: { width: '1000px' },
      closable: true,
      title: intl
        .get(`ssrc.supplierQuotation.model.supQuo.commonRoundHistory`, {
          quotationName: this.quotationName,
        })
        .d('多轮{quotationName}历史'),
      children: <QuotationHistory {...quotationHistory} />,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => cancelBtn,
    });
  }

  // 还比价历史
  @Bind()
  onComparePriceHistory(record) {
    const { rfxHeaderId: rfxId } = this.props;
    const { quotationLineId, companyName: supplierCompanyName, itemCode, itemName } = record;
    this.setState({
      feedBackBarginHistorySearch: {
        rfxId,
        quotationLineId,
        supplierCompanyName,
        itemCode,
        itemName,
      },
      feedBackBarginHistoryStatus: true,
    });
  }

  handleAttachmentTableRef = (node) => {
    this.attachmentTableRef = node;
  };

  renderAttachmentTab = () => {
    const {
      header,
      bidFlag,
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
      headerData: header,
      fileTemplateManageFlag,
      rfxHeaderId,
      editorFlag: 0,
      bidFlag,
      hzeroFlag: 1,
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

  /**
   * 页面审批下面三个tab里的表格统一字段处理，尤其是二开
   */
  getAllTabTableCommonColumns = (options = {}) => {
    const {
      remote,
      header = {},
      rfx: { bidFlag = false },
      doubleUnitFlag,
    } = this.props;
    const { checkPriceActiveKey } = this.state;

    const commonColumns = [];

    const cuxProps = {
      ...(options || {}),
      bidFlag,
      checkPriceActiveKey,
      activeKey: checkPriceActiveKey, // 为了二开方便
      that: this,
      header,
      doubleUnitFlag,
    };

    const columns = remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_ALL_TAB_TABLE_COLUMNS', commonColumns, cuxProps)
      : commonColumns;

    return columns || [];
  };

  /**
   * @protect 鸿合科技二开
   */
  getTabPanes({ supplierList, supplierPagination, AllQuotationProps, AttachmentsProps = {} }) {
    const { remote, rfxHeaderId, bidFlag = false, currentStep, pubRouterAddParams } = this.props;
    const { header } = AllQuotationProps;
    const winBidProps = {
      ...AllQuotationProps,
      currentStep,
      pubRouterAddParams,
    };

    const buttons = [
      currentStep === 'FINISHED' ? (
        <TabPane
          tab={intl.get(`ssrc.inquiryHall.view.message.tab.winBidDetail`).d('中标明细')}
          key="winBid"
        >
          <H0WinningBidDetail {...winBidProps} />
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
        {this.renderSupplierList(supplierList, supplierPagination)}
      </TabPane>,
      <TabPane
        tab={intl.get(`ssrc.inquiryHall.view.message.tab.quoteLine`).d('全部报价明细')}
        key="quoteLine"
      >
        <QuoteLineTable {...AllQuotationProps} />
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
    return remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_GET_TABS', buttons, {
          header,
          rfxHeaderId,
          that: this,
        })
      : buttons;
  }

  renderTabPanes({ supplierList, supplierPagination, AllQuotationProps, AttachmentsProps = {} }) {
    const { defaultActive = 'itemLine', checkPriceActiveKey } = this.state;
    const { remote, bidFlag = false, currentStep } = this.props;
    return (
      <Tabs
        // activeKey={checkPriceActiveKey} // 个性化需要注释受控逻辑
        onChange={this.changeCheckPriceTabs}
        animated={false}
        className={styles.tabStyle}
        defaultActiveKey={defaultActive}
        tabBarExtraContent={
          remote
            ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_TAB_PANE', null, {
                bidFlag,
                currentStep,
                checkPriceActiveKey,
                quoteLineRef: this.quoteLineRef,
              })
            : null
        }
      >
        {this.getTabPanes({
          supplierList,
          supplierPagination,
          AllQuotationProps,
          AttachmentsProps,
        })}
      </Tabs>
    );
  }

  render() {
    const { feedBackBarginHistoryStatus, feedBackBarginHistorySearch } = this.state;
    const {
      organizationId,
      customizeTable = () => {},
      customizeTabPane,
      viewLadderLevel,
      showQuotationDetail,
      rfxHeaderId,
      checkWay,
      header = {},
      rfx = {},
      doubleUnitFlag = false,
      fetchFeedBackBarginHistoryLoading,
      supplierQuotation,
      dispatch,
      unitCodeSymbol,
      remote,
      pubRouterAddParams = () => {},
    } = this.props;
    const {
      // checkPriceActiveKey = [],
      supplierList = [],
      supplierPagination = {},
      checkSupplierListLineAttachmentVisible = false,
      checkSupplierListLineAttachmentProps = {},
    } = this.state;

    const AllQuotationProps = {
      header,
      rfxHeaderId,
      checkWay,
      customizeTable,
      organizationId,
      showQuotationDetail,
      viewLadderLevel,
      doubleUnitFlag,
      ref: this.quoteLineRef,
      rfx,
      fetchHistoryline: this.fetchHistoryline,
      onComparePriceHistory: this.onComparePriceHistory,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      remote,
      pubRouterAddParams,
      getAllTabTableCommonColumns: this.getAllTabTableCommonColumns,
    };

    // 还比价历史Props
    const feedBackBarginHistoryModalProps = {
      quotationName: this.quotationName,
      search: feedBackBarginHistorySearch,
      dispatch,
      organizationId,
      doubleUnitFlag,
      supplierQuotation,
      feedBackBarginHistoryStatus,
      fetchFeedBackBarginHistoryLoading,
      onCancel: () => this.setState({ feedBackBarginHistoryStatus: false }),
    };

    // 附件
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      viewOnly: true,
      sourceKey: unitCodeSymbol,
      info: header,
    };

    return (
      <div>
        {customizeTabPane(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_DETAIL_TABS`,
          },
          this.renderTabPanes({
            supplierList,
            supplierPagination,
            AllQuotationProps,
            AttachmentsProps,
          })
        )}

        <Modal
          destroyOnClose
          visible={checkSupplierListLineAttachmentVisible}
          footer={null}
          onCancel={this.hideCheckPriceSupplierAttachModal}
          width={800}
        >
          <Attachment {...checkSupplierListLineAttachmentProps} />
        </Modal>

        {feedBackBarginHistoryStatus ? (
          <FeedBackBarginHistoryModal {...feedBackBarginHistoryModalProps} />
        ) : null}
      </div>
    );
  }
}

const HOCComponent = (Comp) => {
  return Form.create({ fieldNameProp: null })(
    connect(({ supplierQuotation, loading }) => ({
      supplierQuotation,
      queryRoundQuotationLineDetailLoading:
        loading.effects['supplierQuotation/queryRoundQuotationLineDetail'],
      fetchFeedBackBarginHistoryLoading:
        loading.effects['supplierQuotation/fetchFeedBackBarginHistory'],
    }))(
      hocRemote(
        {
          code: 'SSRC_DETAIL_CHECK_PRICE_TABS',
        },
        {
          events: {
            setItemActivePanel() {},
            setSupplierActivePanel() {},
            // 核价节点查看适用范围埋点方法
            remoteCheckPriceTabsViewApplicationModalEvent(props = {}) {
              const { handleViewApplicationModal = noop } = props || {};
              handleViewApplicationModal(props);
            },
          },
        }
      )(Comp)
    )
  );
};

export { HOCComponent, CheckPrice };

export default HOCComponent(CheckPrice);
