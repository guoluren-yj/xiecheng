import React from 'react';
import { observer } from 'mobx-react';
import { noop, isNil } from 'lodash';
import { Throttle, Bind } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';

import { C7NCPopover } from '@/routes/components/CPopover/C7NPopover';
import { numberSeparatorRender } from '@/utils/renderer';
import { formatDateTime } from '@/routes/ssrc/BiddingHall/utils/';

import { notStartOrSignStatus } from '@/routes/ssrc/BiddingHall/utils/status';
import { getCommonLineStatusColor } from '@/routes/ssrc/BiddingHall/utils/statusColor';
import commonStyle from '@/routes/ssrc/BiddingHall/biddingHallCommonStyle.less';
import { Collection, ItemIcons, RankTrenkRender, TrafficLight, } from './index';

import Styles from './index.less';

const clock = require('@/assets/clock.svg');

@observer
class ItemCard extends React.Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }
  }

  @Throttle(2500)
  @Bind()
  selected(e, record) {
    const { handleItemSelected = noop, biddingSupLineCurId } = this.props;
    if (e) {
      e.stopPropagation();
    }

    if (!record) {
      return;
    }

    const currentLineId = record.get('biddingSupLineCurId');
    if (currentLineId && currentLineId === biddingSupLineCurId) {
      return;
    }

    handleItemSelected(record);
  }

  renderCard = () => {
    const { record, headerInfo, quotationStatusColor = noop, biddingSupLineCurId } = this.props;
    const { displayBiddingSupHeaderStatus, } = headerInfo || {};
    if (!displayBiddingSupHeaderStatus || !record) {
      return '';
    }

    const {
      itemName = '',
      displayBiddingSupLineStatus,
      displayBiddingSupLineStatusMeaning,
      collectionFlag,
      biddingSupLineCurId: currentSupLineId,
      quotationOrderType,
      lineItemSerialNumber,
      // estimatedStartDate,
    } = record?.get([
      'itemName',
      'displayBiddingSupLineStatus',
      'displayBiddingSupLineStatusMeaning',
      'collectionFlag',
      'biddingSupLineCurId',
      'quotationOrderType',
      'lineItemSerialNumber',
      // 'estimatedStartDate',
    ]);

    const { backgroundColor, color } = getCommonLineStatusColor(displayBiddingSupLineStatus) || {};
    const colorStyles = {
      color,
      backgroundColor,
    };

    return (
      <div
        className={classnames(Styles['list-card-item-wrap'], {
          [Styles['list-card-item-active']]: currentSupLineId === biddingSupLineCurId,
        })}
        onClick={(e) => this.selected(e, record)}
      >
        <div className={Styles['list-card-item']}>
          <div className={Styles['list-card-item-title']}>
            <div className={Styles['list-card-item-icon-number']}>
              {quotationOrderType === 'PARALLEL' ? (
                <ItemIcons status={displayBiddingSupLineStatus} />
              ) : (
                <div className={Styles['list-card-item-symbol']} style={colorStyles}>
                  {lineItemSerialNumber ?? '1'}
                </div>
              )}
            </div>
            <div className={Styles['list-card-item-code-name']}>
              <C7NCPopover content={itemName}>{itemName || ''}</C7NCPopover>
            </div>
          </div>

          <div className={Styles['list-card-item-title-collection-status-wrap']}>
            <Collection
              // visibleFlag={!!collectionFlag}
              readOnly
              collectionFlag={collectionFlag}
              record={record}
              styles={{
                marginRight: '4px',
              }}
            />
            <div className={Styles['list-card-item-status']} style={{ lineHeight: '1' }}>
              {quotationStatusColor({
                status: displayBiddingSupLineStatus,
                statusMeaning: displayBiddingSupLineStatusMeaning,
                currentStyles: { marginRight: '0' },
              })}
            </div>
          </div>
        </div>

        <div className={Styles['list-card-item-content-wrap']}>{this.renderStatus()}</div>
      </div>
    );
  };

  renderStatus = () => {
    const {
      record,
      headerInfo,
      remote,
      customizeCommon,
      getCustomizeUnitCode,
      cardDS,
    } = this.props;
    const { displayBiddingSupHeaderStatus, biddingQuotationMethod, supplierStatus, openRule, isBritishBidTrafficLight, } =
      headerInfo || {};
    if (!displayBiddingSupHeaderStatus) {
      return '';
    }

    const disabledQuotaiton = supplierStatus === 'PROHIBIT_QUOTATION';

    const {
      biddingQuotationRank,
      displayQuotationPrice,
      displayBiddingSupLineStatus,
      biddingPausedRealTimeStatus,
      lowestQuotationPrice,
      estimatedStartOrEndFlag,
      estimatedStartDate,
    } = record?.get([
      'biddingQuotationRank',
      'displayQuotationPrice',
      'displayBiddingSupLineStatus',
      'biddingPausedRealTimeStatus',
      'lowestQuotationPrice',
      'estimatedStartOrEndFlag',
      'estimatedStartDate',
    ]);

    const FormatLowestPrice = !isNil(lowestQuotationPrice)
      ? numberSeparatorRender(lowestQuotationPrice)
      : '-';

    const onlyShowEsitmateFlag = notStartOrSignStatus(
      displayBiddingSupLineStatus,
      biddingPausedRealTimeStatus
    );

    if (onlyShowEsitmateFlag) {
      const formatEstimatedDate = formatDateTime({
        dateTime: estimatedStartDate,
      });

      const suffix = estimatedStartOrEndFlag
        ? intl.get('hzero.common.text.startEvent').d('开始')
        : intl.get('hzero.common.text.endEvent').d('结束');
      const renderEstimated = formatEstimatedDate ? `${formatEstimatedDate} ${suffix}` : '';

      return (
        <div className={Styles['list-card-item-content-default-render']}>
          <img alt="clock" src={clock} style={{ marginRight: '8px' }} />
          {renderEstimated}
        </div>
      );
    }

    const currentPrice = !isNil(displayQuotationPrice)
      ? numberSeparatorRender(displayQuotationPrice)
      : '';
    const price = disabledQuotaiton ? '' : currentPrice;
    let hiddenLowestPriceFlag =
      openRule === 'HIDE_IDENTITY_HIDE_QUOTE' || openRule === 'OPEN_IDENTITY_HIDE_QUOTE';

    hiddenLowestPriceFlag = remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_ITEM_CARD_PRICE_FLAG',
          hiddenLowestPriceFlag,
          { headerInfo }
        )
      : hiddenLowestPriceFlag;

    // 排名相关dom节点
    const rankNode = (
      <span
        className={classnames(Styles['list-card-item-content-detail-rank-my'], {
          [Styles['list-card-item-content-detail-rank-my-empty-value']]: !biddingQuotationRank,
        })}
      >
        {isBritishBidTrafficLight !== 1 ? (
          <>
            {biddingQuotationRank ?? '-'}
            <RankTrenkRender record={record} />
          </>
        ) : (
          <TrafficLight record={record} />
        )}
        <span className={classnames(Styles['list-card-item-content-detail-rank-my-split-line'])}>
          {!isNil(displayQuotationPrice) && isBritishBidTrafficLight !== 1 ? '/' : ''}
        </span>
      </span>
    );

    // 排名相关描述节点
    const rankLabelNode = isBritishBidTrafficLight !== 1 ? `${intl
      .get('ssrc.inquiryHall.model.inquiryHall.myQuotationRank')
      .d('我的排名')}/` : "";

    const fieldsConfigs = {
      rfxNumTitle: {
        hidden: true,
      },
      mine: {
        useLabel: false,
        render: () => {
          return (
            <div className={Styles['list-card-item-content-detail-rank']}>
              <div>
                {remote
                  ? remote.render(
                      'SSRC_SUPPLIER_BIDDINGHALL_RENDER_ITEM_CARD_RANK_LABEL_NODE',
                      rankLabelNode,
                      {
                        record,
                      }
                    )
                  : rankLabelNode}
                {intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价')}
              </div>
              <div>
                {remote
                  ? remote.render(
                      'SSRC_SUPPLIER_BIDDINGHALL_RENDER_ITEM_CARD_RANK_NODE',
                      rankNode,
                      {
                        record,
                      }
                    )
                  : rankNode}
                <span className={Styles['list-card-item-content-detail-rank-all']}>
                  <C7NCPopover content={price}>{price}</C7NCPopover>
                </span>
              </div>
            </div>
          );
        },
      },
      lowMaxPrice: {
        useLabel: false,
        hidden: isBritishBidTrafficLight === 1,
        render: () => {
          return !hiddenLowestPriceFlag && isBritishBidTrafficLight !== 1 ? (
            <div className={Styles['list-card-item-content-detail-item-price']}>
              <div>
                {biddingQuotationMethod === 'AUCTION'
                  ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
                  : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')}
              </div>
              {!disabledQuotaiton ? (
                <div className={Styles['list-card-item-content-detail-item-price-lowest']}>
                  <C7NCPopover content={FormatLowestPrice}>{FormatLowestPrice}</C7NCPopover>
                </div>
              ) : (
                '-'
              )}
            </div>
          ) : (
            ''
          );
        },
      },
    };

    return (
      <div
        className={classnames(
          Styles['list-card-item-content-detail-data'],
          commonStyle['supplier-bidding-hall-approval-customize-override']
        )}
      >
        {customizeCommon(
          {
            code: getCustomizeUnitCode('unitPricePlaceCard'),
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            dataSet={cardDS}
            titleField="rfxNumTitle"
            normalFields={['mine', 'lowMaxPrice']}
            fieldsConfig={fieldsConfigs}
          />
        )}

        {/* <div className={Styles['list-card-item-content-detail-rank']}>
          <div>
            {remote
              ? remote.render(
                  'SSRC_SUPPLIER_BIDDINGHALL_RENDER_ITEM_CARD_RANK_LABEL_NODE',
                  rankLabelNode,
                  {
                    record,
                  }
                )
              : rankLabelNode}
            {intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价')}
          </div>
          <div>
            {remote
              ? remote.render('SSRC_SUPPLIER_BIDDINGHALL_RENDER_ITEM_CARD_RANK_NODE', rankNode, {
                  record,
                })
              : rankNode}
            <span className={Styles['list-card-item-content-detail-rank-all']}>
              <C7NCPopover content={price}>{price}</C7NCPopover>
            </span>
          </div>
        </div> */}

        {/* {!hiddenLowestPriceFlag ? (
          <div className={Styles['list-card-item-content-detail-item-price']}>
            <div>
              {biddingQuotationMethod === 'AUCTION'
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')}
            </div>
            {!disabledQuotaiton ? (
              <div className={Styles['list-card-item-content-detail-item-price-lowest']}>
                <C7NCPopover content={FormatLowestPrice}>{FormatLowestPrice}</C7NCPopover>
              </div>
            ) : (
              '-'
            )}
          </div>
        ) : (
          ''
        )} */}
      </div>
    );
  };

  render() {
    return this.renderCard();
  }
}

export default ItemCard;
