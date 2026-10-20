import React, { Component } from 'react';
import { Tag, Pagination, Spin, Form, Modal, Icon, Switch, Tooltip, Popover } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isFunction, compose, isNil } from 'lodash';
import querystring from 'querystring';
import { connect } from 'dva';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import EmbedPage from '_components/EmbedPage';
import { numberSeparatorRender } from '@/utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import SVGIcon from '@/routes/components/SvgIcon';
import { INQUIRY } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import styles from './index.less';
import SupplierLineTable from './SupplierLineTable';
import Attachment from '../../components/Attachment';
import LadderLevel from '../../components/LadderLevelDoubleUnit';
import ListRender from './ListRender';

const imgUrl = require('@/assets/candidate.svg');
const imgUr = require('@/assets/d-attachment.svg');
const validSupplierImg = require('@/assets/supplier-inline-valid.svg');
const inValidSupplierImg = require('@/assets/supplier-inline-invalid.svg');
const supplierImg = require('@/assets/supplier-icon.svg');
const supplierGreyImg = require('@/assets/supplier-icon-grey.svg');
const attachGrey = require('@/assets/attachment-grey.svg');
const companyIpRateRed = require('@/assets/companyIpRate-red.svg');
const companyIpRateGrey = require('@/assets/companyIpRate-grey.svg');
const processAddInvalid = require('@/assets/supplier-processAddInvalid.svg');
const processAdd = require('@/assets/supplier-processAdd.svg');
const supplierBanQuotationSvg = require('@/assets/biddingHall/supplier-ban-quotation.svg');
const supplierNoSupplementPriceSvg = require('@/assets/biddingHall/supplier-no-supplement-price.svg');
const eliminateIcon = require('@/assets/eliminate.svg');

class SupplierLineList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      expand: {}, // 展开数据
      isShow: {}, // 数据是否查询显示
      attachmentVisible: false,
      AttachmentsProps: {},
      rfxLineSupplierId: undefined, // 最后一次展开的行id
      activePanel: [],
      expandAllFlag: false,
      clickAllFlag: false,
    };
    this.supplierLineTable = {}; // 初始化this.supplierLineTable为对象
  }

  @Bind()
  changeCollapse(active) {
    const { headerList = [] } = this.props;
    const { activePanel } = this.state;
    this.setState({
      activePanel: active,
      expandAllFlag: active.length === headerList.length,
      clickAllFlag: active.length === headerList.length && activePanel.length + 1 === active.length,
    });
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { supplierQuoteLine },
    } = this.props;
    const {
      inquiryHall: { supplierQuoteLine: preLine },
    } = preProps;
    if (supplierQuoteLine !== preLine) {
      return true;
    }
    return null;
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(
    businessAttachmentUuid,
    techAttachmentUuid,
    bargainBusinessAttachmentUuid,
    bargainTechAttachmentUuid,
    roundBusinessAttachmentUuid,
    roundTechAttachmentUuid
  ) {
    this.setState({
      AttachmentsProps: {
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
   *
   * @param {string[]} openKeys - 新打开的 Pane
   */
  @Bind()
  handleCollapseChange(e, item) {
    const { expand, isShow } = this.state;
    if (!isShow[item.rfxLineSupplierId]) {
      // 打开新的 Pane
      this.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineSupplierId]: !expand[item.rfxLineSupplierId],
      },
      isShow: {
        ...isShow,
        [item.rfxLineSupplierId]: true,
      },
    });
  }

  /**
   * 供应商列表-表格内容改变
   */
  @Bind()
  changeTableData() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      dispatch,
      [modelName]: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          supplierLineChange: true,
        },
      });
    }
  }

  /**
   * 获取表格数据
   */
  @Bind()
  clickCollapseChange(e, item) {
    const { expand, isShow } = this.state;
    if (!isShow[item.rfxLineSupplierId]) {
      // 打开新的 Pane
      this.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineSupplierId]: !expand[item.rfxLineSupplierId],
      },
      isShow: {
        ...isShow,
        [item.rfxLineSupplierId]: true,
      },
      expandAllFlag: false,
    });
    if (scrollTo && this.scrollerContainerRef) {
      this.scrollerContainerRef.scrollTo(0, this.scrollerContainerRef.scrollTop + 1);
    }
  }

  /**
   * 设置整包推荐的值，为1
   */
  @Bind()
  setWholePackageFlag(rfxLineSupplierId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${rfxLineSupplierId}`]: 1 });
  }

  /**
   * 设置整包推荐的值，为0
   */
  @Bind()
  setWholePackageFlagFalse(rfxLineSupplierId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${rfxLineSupplierId}`]: 0 });
  }

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
    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: newSupplierDetailPath,
          search: querystring.stringify(searchObj),
        }),
      });
    } else {
      openTab({
        key: newSupplierDetailPath,
        path: newSupplierDetailPath,
        title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
        search: querystring.stringify(searchObj),
        closable: true,
      });
    }
  };

  /**
   * [三生制药] 二开
   * @protected
   */
  @Bind()
  renderHeaderInfo(item, scrollTo) {
    const {
      form: { getFieldDecorator },
      onRiskScan,
      settings,
      headerInfoDs,
      riskScanFlag,
      remote,
      customizeBtnGroup,
      sourceKey = INQUIRY,
      useNewRateFlag = 0,
      japOrDutchBiddingTotalPrice = () => {},
      japanBiddingTotalPrice = () => {},
    } = this.props;
    const { expand } = this.state;
    const { expertScoreType, bidRuleType, newQuotationFlag } =
      headerInfoDs?.current?.get(['expertScoreType', 'bidRuleType', 'newQuotationFlag']) || {};
    // 在外层调用跳到指定位置
    this.scrollTo = scrollTo;

    const {
      supplierCompanyId,
      tenantId,
      partnerTenantId,
      partnerCompanyId,
      spfmSupplierCompanyId,
      biddingRoundSupplierStatus,
      biddingRoundSupplierStatusMeaning,
      biddingAcceptCount,
      supplementQtnTotalAmount,
      supplementQtnNetAmount,
      priceTypeCode,
      acceptQtnNetAmount,
      acceptQtnTotalAmount,
      biddingSupplierAcceptNumber,
    } = item || {};

    const taxIncluded = priceTypeCode === 'TAX_INCLUDED_PRICE';

    const japanDutchTotalBidding = japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice();
    const japanTotalBidding = japanBiddingTotalPrice && japanBiddingTotalPrice();

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

    const suppliersupplierTotalAmountTagTitle = taxIncluded
      ? intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)')
      : intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`).d('总价(不含税)');

    const supplierTotalAmountTag = [
      item.supplierTotalAmount && !japanDutchTotalBidding ? (
        <Tag className={styles.supplierTotalAmount}>
          {suppliersupplierTotalAmountTagTitle}：
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

    const winedAmountTag = item.winedAmount ? (
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

    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
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
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
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
    // 不同情况显示前面不同的图标
    const getDisplayIcon = () => {
      const imgStyle = { width: 44, height: 44 };
      // 新竞价会有报价禁止报价状态
      if (item.allEliminate) {
        // 全部淘汰
        return <img src={eliminateIcon} style={imgStyle} alt="icon" />;
      }

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

    return (
      <div
        className={styles.container}
        onClick={(e) => this.clickCollapseChange(e, item, scrollTo)}
      >
        <div className={styles.leftBox}>
          {getDisplayIcon()}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline' }}>
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
                    {tenantId && partnerTenantId && (partnerCompanyId || spfmSupplierCompanyId) ? (
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
                type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
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
              {!newQuotationFlag ? (
                <span>
                  <a
                    onClick={() =>
                      this.showUploadModal(
                        item.businessAttachmentUuid,
                        item.techAttachmentUuid,
                        item.bargainBusinessAttachmentUuid,
                        item.bargainTechAttachmentUuid,
                        item.roundBusinessAttachmentUuid,
                        item.roundTechAttachmentUuid
                      )
                    }
                  >
                    <span>
                      <SVGIcon path={imgUr} style={{ verticalAlign: 'middle' }} />
                    </span>
                    <span style={{ marginLeft: '7px' }}>
                      {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                      <RenderFileTotalCount record={item} uiType="h0" />
                    </span>
                  </a>
                </span>
              ) : (
                <FileGroup record={item} uiType="h0" fileType="HEADER" />
              )}
              {remote
                ? remote.render(
                    'SSRC_CHECK_PRICE_NEW_APPROVAL_SUPPLIER_HEADER_INFO_RENDER_OTHERS',
                    null,
                    { item }
                  )
                : null}
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
          {!japOrDutchBiddingTotalPrice ? (
            <Tag
              className={
                item?.feedbackStatus === 'ABANDONED' || item.quotedCount === 0
                  ? styles.feedbackStatusAbandoned
                  : styles.feedbackStatus
              }
            >
              {item.feedbackStatusMeaning}
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
          {expertScoreType === 'ONLINE' ? (
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
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_BUSINESS_SCORE_TAG',
                businessScoreTag
              )
            : businessScoreTag}
          {item.quotationRank ? (
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
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_LINE_LIST_TOTAL_AMOUNT_TAG',
                supplierTotalAmountTag,
                {
                  item,
                  className: styles.supplierTotalAmount,
                }
              )
            : supplierTotalAmountTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_LINE_LIST_WINED_AMOUNT_TAG',
                winedAmountTag,
                {
                  item,
                  className: styles.winedAmount,
                }
              )
            : winedAmountTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_LINE_LIST_CUX_LASTED_TAG',
                '',
                {
                  item,
                  headerInfoDs,
                  className: styles.winedAmount,
                  that: this,
                }
              )
            : ''}
        </div>
        <div className={styles.rightBox}>
          {item.quotationLineNumber * 1 >= 1 && (
            <span onClick={(e) => this.rfxLineTag(e)}>
              <Form.Item
                label={intl.get(`ssrc.inquiryHall.model.inquiryHall.wholePackage`).d('整包推荐')}
                style={{ display: 'flex', margin: '0 4px' }}
              >
                {getFieldDecorator(`value#${item.rfxLineSupplierId}`, {
                  initialValue: item.wholeSuggestFlag,
                })(<Switch disabled checkedValue={1} unCheckedValue={0} />)}
              </Form.Item>
            </span>
          )}
          {customizeBtnGroup(
            {
              code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS`,
            },
            [
              riskScanFlag && supplierCompanyId && (
                <Button name="riskScan" funcType="link" onClick={(e) => onRiskScan(item, e)}>
                  {intl.get('hzero.common.button.riskScan').d('风险扫描')}
                </Button>
              ),
            ].filter(Boolean)
          )}
        </div>
      </div>
    );
  }

  @Bind()
  renderSupplierLineTable(tableProps, rfxLineSupplierId) {
    const { remote } = this.props;
    return (
      <SupplierLineTable {...tableProps} rfxLineSupplierId={rfxLineSupplierId} remote={remote} />
    );
  }

  @Bind()
  renderInvalidHeaderInfo(item) {
    const { headerInfoDs, remote } = this.props;
    const { expand } = this.state;
    const { expertScoreType, bidRuleType, newQuotationFlag } =
      headerInfoDs?.current?.get(['expertScoreType', 'bidRuleType', 'newQuotationFlag']) || {};
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
    const { tenantId, partnerTenantId, partnerCompanyId, spfmSupplierCompanyId } = item || {};
    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
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
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
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
    return (
      <div className={styles.container} onClick={(e) => this.clickCollapseChange(e, item)}>
        <div className={styles.leftBox}>
          {headerImg}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline' }}>
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
                    {tenantId && partnerTenantId && (partnerCompanyId || spfmSupplierCompanyId) ? (
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
                type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
              />
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
                    'SSRC_CHECK_PRICE_NEW_APPROVAL_SUPPLIER_HEADER_INFO_RENDER_OTHERS',
                    null,
                    { item }
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
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_BUSINESS_SCORE_TAG',
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

  /**
   * 渲染无效供应商样式
   */
  // renderInvalidHeaderInfo1(item) {
  //   const { expand } = this.state;
  //   return (
  //     <div className={styles.itemList}>
  //       <div className={styles.itemListImg}>
  //         <img
  //           src={!item.onLineFlag ? inValidSupplierImg : supplierGreyImg}
  //           alt=""
  //           style={{ width: 44, height: 44 }}
  //         />
  //       </div>
  //       <div className={styles.itemListHeaderInfo}>
  //         <div className={styles.itemListHeader}>
  //           <span className={styles.itemListNum}>
  //             {item.supplierCompanyNum
  //               ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
  //               : item.supplierCompanyName}
  //           </span>
  //           <span className={styles.itemListNumRight}>
  //             <Icon
  //               style={{ color: 'rgba(0, 0, 0, 0.25)', margin: '0 4px' }}
  //               type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
  //             />
  //           </span>
  //           <span className={styles.lineTag}>
  //             <Tag className={styles['feedbackStatus-invalid']}>
  //               {intl.get('ssrc.common.view.status.invalid').d('无效')}
  //               {/* {item.feedbackStatusMeaning} */}
  //             </Tag>
  //             <Tag className={styles['lineNumber-invalid']}>
  //               {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationNumber`).d('报价行数')}：
  //               {item.quotationNumber}
  //             </Tag>
  //             {item?.score || item?.score === 0 ? (
  //               <Tag className={styles['sumScore-invalid']}>
  //                 {intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}：{item.score}
  //               </Tag>
  //             ) : (
  //               ''
  //             )}
  //             {item.supplierTotalAmount && (
  //               <Tag className={styles['supplierTotalAmount-invalid']}>
  //                 {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}
  //                 ：{item.supplierTotalAmount}
  //               </Tag>
  //             )}
  //           </span>
  //           <div style={{ clear: 'both' }} />
  //         </div>
  //         <p className={styles.itemListDes}>
  //           <span className={styles['itemListDesItem-invalid']}>
  //             <img src={attachGrey} alt="" />
  //             <span style={{ marginLeft: '7px' }}>
  //               {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
  //             </span>
  //           </span>
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  @Bind()
  getContainerRef(ref = {}) {
    this.scrollerContainerRef = ref?.current;
  }

  // 展示风险提示
  renderRiskRelation = () => {
    const { headerInfoDs, organizationId } = this.props;
    const { current } = headerInfoDs || {};
    if (current) {
      const { rfxNum, secondarySourceCategory } = current?.get([
        'rfxNum',
        'secondarySourceCategory',
      ]);
      return (
        <EmbedPage
          href="/public/sdat/relation-troubleshoot"
          location={{
            search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${organizationId}`,
          }}
        />
      );
    }
    return null;
  };

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      rfxHeaderId,
      headerInfoDs,
      headerList = [],
      organizationId,
      loading,
      [modelName]: { supplierLinePagination },
      onChangePagination,
      form,
      hideModal,
      customizeTable,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      sourceKey = INQUIRY,
      doubleUnitFlag = false,
      fetchLadderLevelTableLoading,
      onComparePriceHistory,
      remote,
      supplierLinePageSize,
      batchSearchData,
      batchSearchDataKeys,
      openExpandAllFlag,
      searchPriceLoading,
      isPub,
      getAllTabTableCommonColumns,
      location,
    } = this.props;
    const {
      AttachmentsProps,
      attachmentVisible,
      activePanel,
      expandAllFlag,
      clickAllFlag,
    } = this.state;
    const tableProps = {
      rfxHeaderId,
      headerInfoDs,
      organizationId,
      form,
      sourceKey,
      doubleUnitFlag,
      customizeTable,
      viewLadderLevel,
      onRef: (calKey, node) => {
        this.supplierLineTable[calKey] = node; // 对应的[rfxLineSupplierId]的supplierLineTable
      },
      onComparePriceHistory,
      remote,
      expandAllFlag,
      supplierLineTable: this.supplierLineTable,
      searchPriceLoading,
      clickAllFlag,
      isPub,
      getAllTabTableCommonColumns,
      location,
    };
    const ladderLevelModalProps = {
      doubleUnitFlag,
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };
    const { total = 0 } = supplierLinePagination || {};
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          {this.renderRiskRelation()}
          <ListRender
            {...{
              headerList,
              renderHeaderInfo: this.renderHeaderInfo,
              renderInvalidHeaderInfo: this.renderInvalidHeaderInfo,
              styles,
              tableProps,
              form,
              remote,
              activePanel,
              lineKey: 'rfxLineSupplierId',
              changeCollapse: this.changeCollapse,
              renderLineTable: this.renderSupplierLineTable,
              pagesize: supplierLinePageSize,
              batchSearchData,
              batchSearchDataKeys,
              expandAllFlag,
              tableMap: this.supplierLineTable,
              openExpandAllFlag,
              getContainerRef: this.getContainerRef,
            }}
          />
          {total > 10 && (
            <Pagination
              className={styles.pagination}
              {...supplierLinePagination}
              onChange={(page, pageSize) => onChangePagination(page, pageSize)}
              onShowSizeChange={(current, size) => onChangePagination(current, size)}
            />
          )}
        </Spin>
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}

const HOCSupplierLineList = (Comp) =>
  compose(
    connect(({ inquiryHall }) => ({
      inquiryHall,
      organizationId: getCurrentOrganizationId(),
    })),
    Form.create({ fieldNameProp: null })
  )(Comp);

export default HOCSupplierLineList(SupplierLineList);

export { HOCSupplierLineList, SupplierLineList };
