import React, { Component } from 'react';
import { Icon, Pagination, Dropdown } from 'choerodon-ui/pro';
import { Menu, Steps, Tag, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isNil, noop } from 'lodash';
import { Throttle } from 'lodash-decorators';

import intl from 'utils/intl';

import { C7NCPopover } from '@/routes/components/CPopover/C7NPopover';
import { numberSeparatorRender } from '@/utils/renderer';
import { getSupplierStatusTagColor } from '@/routes/ssrc/BiddingHall/utils/statusColor';
import {
  PurBiddingHistoryChart,
  RankIcon,
  CurrencyPrice,
  RankTrenkRender,
  TrafficLight,
} from '../../components';

import Styles from './index.less';

const noResult = require('@/assets/no_result.svg');

const { Step } = Steps;

@observer
class BiddingRecord extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  @Throttle(1200)
  showBiddingHistoryChangeMode = ({ key }) => {
    const { biddingHistoryDS } = this.props;
    const queryLatestBiddingFlag = key === 'new' ? 1 : 0;

    if (!biddingHistoryDS) {
      return;
    }

    const queryLatestBiddingFlagOld = biddingHistoryDS.getQueryParameter('queryLatestBiddingFlag');
    if (queryLatestBiddingFlagOld === queryLatestBiddingFlag) {
      return;
    }

    biddingHistoryDS.loadData();
    biddingHistoryDS.setQueryParameter('queryLatestBiddingFlag', queryLatestBiddingFlag);
    biddingHistoryDS.query();
  };

  // not-start
  renderNotStartHistoryRecord = (hiddenDropSelectFlag = false) => {
    const { detailViewFormDS, headerInfo } = this.props;
    // const { current } = detailViewFormDS || {};
    const { displayBiddingSupHeaderStatus } = headerInfo || {};
    const headerRecordData = detailViewFormDS.getState('headerRecordData') || {};
    const { displayBiddingSupLineStatus } = headerRecordData || {};

    const notStartFlag =
      displayBiddingSupHeaderStatus === 'NOT_START' || displayBiddingSupLineStatus === 'NOT_START';

    return (
      <div className={Styles['quotation-bidding-record-content-not-start-wrap']}>
        <div className={Styles['quotation-bidding-record-content-not-start-image']}>
          <img src={noResult} alt="no result" />
        </div>
        <div className={Styles['quotation-bidding-record-content-not-start-warning-text']}>
          {intl.get('hzero.common.message.data.none').d('暂无数据')}
        </div>
        {notStartFlag && hiddenDropSelectFlag ? (
          <div className={Styles['quotation-bidding-record-content-not-start-warning-status']}>
            {intl
              .get('ssrc.biddingHall.message.data.biddingStartedToShowBiddingHis')
              .d('竞价开始后展示竞价记录')}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  renderList = (record, options) => {
    const {
      headerInfo,
      biddingHistoryDS,
      remote,
      detailViewFormDS,
      japOrDutchBiddingTotalPrice = noop,
    } = this.props;
    const { currencySymbol, openRule, isBritishBidTrafficLight } = headerInfo || {};
    const { showNewFlag = 0 } = options || {};
    const {
      displayQuotationPrice,
      biddingQuotationRank,
      displaySupplierName,
      uniqueValueKey,
      selfFlag,
      quotedDate,
      biddingRoundQuotationRecordStatus = null,
      biddingRoundQuotationRecordStatusMeaning = '',
      biddingRoundNumber,
    } =
      record?.get([
        'displayQuotationPrice',
        'biddingQuotationRank',
        'displaySupplierName',
        'uniqueValueKey',
        'currency',
        'quotedDate',
        'biddingRoundQuotationRecordStatus',
        'biddingRoundQuotationRecordStatusMeaning',
        'biddingRoundNumber',
      ]) || {};

    const japanDutchTotal = japOrDutchBiddingTotalPrice();

    let queryLatestBiddingFlag = 1;
    if (biddingHistoryDS) {
      queryLatestBiddingFlag = biddingHistoryDS.getQueryParameter('queryLatestBiddingFlag');
    }

    const currency =
      (openRule === 'HIDE_IDENTITY_HIDE_QUOTE' || openRule === 'OPEN_IDENTITY_HIDE_QUOTE') &&
      !selfFlag &&
      !isNil(displayQuotationPrice)
        ? ''
        : currencySymbol;
    const priceRender = numberSeparatorRender(displayQuotationPrice);

    // 红绿灯不显示排名
    const showRankInfo = queryLatestBiddingFlag && isBritishBidTrafficLight !== 1;

    // 红绿灯展示
    const showTrafficLight = queryLatestBiddingFlag && isBritishBidTrafficLight === 1;

    const color = getSupplierStatusTagColor({ status: biddingRoundQuotationRecordStatus });

    if (showNewFlag) {
      return (
        <div className={Styles['bidding-history-new-list-item-line-wrap']}>
          <div className={Styles['bidding-history-new-list-item-line-icon-name']}>
            {showRankInfo ? (
              <>
                {remote ? (
                  remote.render(
                    'SSRC_SUPPLIER_BIDDINGHALL_RENDER_BIDDING_RECORD_RANK_ICON_NODE',
                    <RankIcon
                      visibleFlag={showRankInfo}
                      rank={biddingQuotationRank}
                      styles={{ marginRight: '4px' }}
                    />,
                    {
                      visibleFlag: showRankInfo,
                      record,
                      detailViewFormDS,
                    }
                  )
                ) : (
                  <RankIcon
                    visibleFlag={showRankInfo}
                    rank={biddingQuotationRank}
                    styles={{ marginRight: '4px' }}
                  />
                )}
                <RankTrenkRender record={record} />
              </>
            ) : (
              ''
            )}
            {showTrafficLight ? <TrafficLight record={record} /> : ''}
            <span className={Styles['history-item-supplier-name']}>
              <C7NCPopover content={displaySupplierName}>{displaySupplierName}</C7NCPopover>
            </span>
            {/* 埋点-扩展节点 */}
            {remote
              ? remote.render(
                  'SSRC_SUPPLIER_BIDDINGHALL_RENDER_BIDDING_RECORD_EXTEND_NODE',
                <></>,
                  {
                    record,
                    visibleFlag: queryLatestBiddingFlag,
                    headerInfo,
                  }
                )
              : ''}
          </div>
          <span className={Styles['history-item-supplier-price-value']}>
            <CurrencyPrice currencySymbol={currency} price={priceRender} />
          </span>
        </div>
      );
    }

    // japan, dutch total
    if (japanDutchTotal) {
      return (
        <Step
          key={uniqueValueKey}
          description={
            <div className={Styles['bidding-history-list-item-wrap']}>
              <div className={Styles['bidding-history-list-item-wrap-left']}>
                {biddingRoundNumber ? (
                  <span className={Styles['history-item-bidding-round-value']}>
                    <Tooltip
                      title={intl
                        .get('ssrc.biddingHall.view.title.biddingRoundNumberaAccept', {
                          biddingRoundNumber,
                        })
                        .d('第{biddingRoundNumber}轮接受')}
                    >
                      {biddingRoundNumber}
                    </Tooltip>
                  </span>
                ) : (
                  ''
                )}
                <span className={Styles['history-item-supplier-price-value']}>
                  <CurrencyPrice currencySymbol={currency} price={priceRender} />
                </span>

                <Tag
                  color={color}
                  border={null}
                  style={{ height: '18px', lineHeight: '1.3', fontSize: '12px', marginLeft: '4px' }}
                >
                  {biddingRoundQuotationRecordStatusMeaning || '-'}
                </Tag>
              </div>
              <div>{quotedDate}</div>
            </div>
          }
        />
      );
    }

    return (
      <Step
        key={uniqueValueKey}
        description={
          <div className={Styles['bidding-history-list-item-wrap']}>
            <div className={Styles['bidding-history-list-item-wrap-left']}>
              {showRankInfo ? (
                <RankIcon
                  visibleFlag={showRankInfo}
                  rank={biddingQuotationRank}
                  styles={{ marginRight: '4px' }}
                />
              ) : (
                <TrafficLight record={record} />
              )}
              <span className={Styles['history-item-supplier-name']}>
                <C7NCPopover content={displaySupplierName}>{displaySupplierName}</C7NCPopover>
              </span>
            </div>
            <span className={Styles['history-item-supplier-price-value']}>
              <CurrencyPrice currencySymbol={currency} price={priceRender} />
            </span>
          </div>
        }
      />
    );
  };

  renderHistoryData = () => {
    const { biddingHistoryDS } = this.props;
    const { length } = biddingHistoryDS || {};

    let queryLatestBiddingFlag = 1;
    if (biddingHistoryDS) {
      queryLatestBiddingFlag = biddingHistoryDS.getQueryParameter('queryLatestBiddingFlag');
    }

    return (
      <div className={Styles['quotation-bidding-record-content-data-wrap']}>
        <div className={Styles['quotation-bidding-record-content-list-wrap']}>
          {!queryLatestBiddingFlag ? (
            <Steps
              progressDot
              current={-1}
              direction="vertical"
              className={Styles['bidding-history-list-wrap']}
            >
              {biddingHistoryDS.map((item) => this.renderList(item))}
            </Steps>
          ) : (
            <div className={Styles['bidding-history-new-list-wrap']}>
              {biddingHistoryDS.map((item) => {
                const { uniqueValueKey } = item?.get(['uniqueValueKey']);
                return (
                  <div
                    key={uniqueValueKey}
                    className={Styles['bidding-history-new-list-item-wrap']}
                  >
                    {this.renderList(item, { showNewFlag: 1 })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={Styles['quotation-bidding-record-content-data-pagination-wrap']}>
          {length ? (
            <Pagination
              dataSet={biddingHistoryDS}
              // showTotal={false}
              showSizeChanger={false}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    );
  };

  renderHeaderInfo = () => {
    const {
      biddingHistoryDS,
      biddingSupLineCurId,
      organizationId,
      headerInfo,
      detailViewFormDS,
      quotationDetailViewListDS,
      ruleDS,
      japOrDutchBiddingTotalPrice = noop,
    } = this.props;
    const { length: historyDataLength = 0 } = biddingHistoryDS || {};
    const { displayBiddingSupHeaderStatus } = headerInfo || {};
    const { current } = detailViewFormDS || {};
    const { biddingSupplementPriceNotStartFlag } = current
      ? current.get(['biddingSupplementPriceNotStartFlag'])
      : {};

    const japanDutchTotal = japOrDutchBiddingTotalPrice();

    // 查询最新竞价记录
    let queryLatestBiddingFlag = 1;
    if (biddingHistoryDS) {
      queryLatestBiddingFlag = biddingHistoryDS.getQueryParameter('queryLatestBiddingFlag');
    }

    // 隐藏下拉筛选标识
    const hiddenDropSelectFlag =
      (displayBiddingSupHeaderStatus === 'NOT_START' && !biddingSupplementPriceNotStartFlag) ||
      displayBiddingSupHeaderStatus === 'SIGN_IN' ||
      japanDutchTotal;

    const PurBiddingHistoryChartProps = {
      biddingSupLineCurId,
      organizationId,
      type: 'SUPPLIER',
      itemRecord: current,
      itemLineListDS: quotationDetailViewListDS,
      biddingRuleDataSet: ruleDS,
      header: headerInfo,
    };

    return (
      <>
        <div className={Styles['quotation-bidding-record-title-wrap']}>
          <div className={Styles['quotation-bidding-record-title-left']}>
            <span className={Styles['bidding-detail-title']}>
              {intl.get('ssrc.biddingHall.view.title.biddingRecordHistory').d('竞价记录')}
            </span>

            {historyDataLength && !japanDutchTotal ? (
              <span>
                <PurBiddingHistoryChart {...PurBiddingHistoryChartProps} />
              </span>
            ) : (
              ''
            )}
          </div>

          <div style={{ display: !hiddenDropSelectFlag ? '' : 'none' }}>
            <Dropdown
              overlay={
                <Menu onClick={this.showBiddingHistoryChangeMode}>
                  <Menu.Item key="all">{intl.get('hzero.common.status.all').d('全部')}</Menu.Item>
                  <Menu.Item key="new">
                    {intl.get('ssrc.inquiryHall.button.neweast').d('最新')}
                  </Menu.Item>
                </Menu>
              }
              // placement="bottomLeft"
              trigger="click"
            >
              <div className={Styles['bidding-detail-title-show-change-wrap']}>
                {!queryLatestBiddingFlag
                  ? intl.get('hzero.common.status.all').d('全部')
                  : intl.get('ssrc.inquiryHall.button.neweast').d('最新')}
                <Icon type="expand_more" />
              </div>
            </Dropdown>
          </div>
        </div>

        <div className={Styles['quotation-bidding-record-content-wrap']}>
          {!historyDataLength
            ? this.renderNotStartHistoryRecord(hiddenDropSelectFlag)
            : this.renderHistoryData()}
        </div>
      </>
    );
  };

  render() {
    return (
      <div className={Styles['supplier-bidding-hall-body-quotation-bidding-record']}>
        {this.renderHeaderInfo()}
      </div>
    );
  }
}

export default BiddingRecord;
