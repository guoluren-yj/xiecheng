import React, { useRef } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { noop } from 'lodash';
import { Tooltip } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

// import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import { StatusCheckableTab, PurBiddingHistoryChart } from '../../../components';

import UnitPriceList from './UnitPriceList';
import TotalPriceSupplierList from './TotalPriceSupplierList';
import JAPANDUTCHAggregationTableList from './JAPANDUTCHAggregationTableList';
import JAPANDUTCHList from './JAPANDUTCHList';

import BiddingSite from './BiddingSite';

import style from '../../index.less';

import Styles from './index.less';

const MainContent = observer((props = {}) => {
  const {
    commonProps = {},
    biddingSiteInfoDataSet,
    bidCountDataSet,
    itemLineListDS,
    totalPriceSupplierListDataSet,
    biddingRuleDataSet,
    getUnitPriceFlag = noop,
    getTotalPriceFlag = noop,
    initPage = noop,
    remote,
    beforeBiddingOnGoingFlag = noop,
    getWarningMessageCount = noop,
    japOrDutchBiddingTotalPrice = noop,
    britishBidding = noop,
    biddingView = 0,
    // japanDutchRoundListDs,
    // japanDutchAggregationTableDs,
    updateBiddingView = noop,
    // getJapanOrDutchListDs = noop,
    japanDutchListRef,
    handleRebuileAggregrationTableDataForDS = noop,
    aggregrationTableRef,
  } = props || {};

  // const { numberOfBids } = bidCountDataSet?.current?.get?.(['numberOfBids']) || {};

  const { header, headerInfoDS } = commonProps || {};

  const { sealedQuotationFlag = 1, biddingStatus } = header || {};

  const statusCheckableTabRef = useRef(null);

  const setStatusCheckableTabRef = (node = {}) => {
    statusCheckableTabRef.current = node;
  };

  // left render query
  const leftRender = (ds, handleQuery) => {
    const statusList = [
      {
        value: 'queryLineStatusInProgressFlag',
        meaning: intl.get('ssrc.inquiryHall.button.onGoing').d('进行中'),
      },
      {
        value: 'queryLineStatusSubmittedFlag',
        meaning: intl.get('ssrc.biddingHall.view.title.biddingHallAlreadyPrice').d('已出价'),
      },
    ];

    const searchProps = {
      ds,
      statusList,
      tableQueryBarStatusTabChange: handleQuery,
      onRef: setStatusCheckableTabRef,
    };

    return <StatusCheckableTab {...searchProps} />;
  };

  /**
   * right render
   */
  const renderJapanDutchRight = () => {
    // 竞价历史图表分析参数
    const historyChartProps = {
      // commonProps,
      header,
      type: 'PURCHASE',
      biddingRuleDataSet,
      itemLineListDS: totalPriceSupplierListDataSet,
      beforeBiddingOnGoingFlag,
      japanDutchFlag: 1,
      buttonTextClass: Styles['pur-main-content-bidding-chart-button-text-wrap'],
      biddingFinished: biddingStatus === 'BIDDING_END',
    };

    return (
      <div className={Styles['pur-main-content-bidding-list-filter-bar-wrap']}>
        {!sealedQuotationFlag || biddingStatus === 'BIDDING_END' ? (
          <div className={Styles['pur-main-content-bidding-list-supplier-header-wraps']}>
            <PurBiddingHistoryChart {...historyChartProps} />
          </div>
        ) : (
          ''
        )}

        <div className={Styles['ssrc-bidding-hall-purchase-line-search']}>
          <Tooltip
            title={intl.get('ssrc.inquiryHall.model.inquiryHall.flatTableView').d('平铺表视图')}
          >
            <div
              className={!biddingView ? Styles['active-table-wide'] : ''}
              onClick={() => updateBiddingView(0)}
              style={{
                width: '24px',
                height: '24px',
                textAlign: 'center',
              }}
            >
              <Icon type="reorder" className={!biddingView ? 'primaryColor' : 'disabled'} />
            </div>
          </Tooltip>
          <Tooltip
            title={intl
              .get('ssrc.inquiryHall.model.inquiryHall.aggregateTableView')
              .d('聚合表视图')}
          >
            <div
              className={biddingView ? Styles['active-table-wide'] : ''}
              onClick={() => updateBiddingView(1)}
              style={{
                width: '24px',
                height: '24px',
                textAlign: 'center',
                marginLeft: '8px',
              }}
            >
              <Icon type="view_day" className={biddingView ? 'primaryColor' : 'disabled'} />
            </div>
          </Tooltip>
        </div>
      </div>
    );
  };

  // 列表查询
  // const tableSearchQuery = (searchParams = {}) => {
  //   const currentViewDS = getJapanOrDutchListDs();

  //   if (!currentViewDS) {
  //     return;
  //   }

  //   const { params = {} } = searchParams || {};
  //   currentViewDS.setQueryParameter('advanced', params);

  //   currentViewDS.query();
  // };

  // 列表公共参数
  const commonMainContentProps = {
    leftRender,
    statusCheckableTabRef,
    bidCountDataSet,
    biddingRuleDataSet,
    headerInfoDS,
    remote,
    beforeBiddingOnGoingFlag,
  };

  // 竞价现场参数
  const biddingSiteProps = {
    ...commonProps,
    header,
    remote,
    headerInfoDS,
    biddingSiteInfoDataSet,
    bidCountDataSet,
    getTotalPriceFlag,
    getUnitPriceFlag,
    initPage,
    getWarningMessageCount,
  };

  // 单价竞价列表参数
  const unitPriceListProps = {
    ...commonProps,
    ...commonMainContentProps,
    itemLineListDS,
    japanDutchListRef,
  };

  // 总价竞价列表参数
  const totalPriceListProps = {
    ...commonProps,
    ...commonMainContentProps,
    totalPriceSupplierListDataSet,
    handleRebuileAggregrationTableDataForDS,
    aggregrationTableRef,
  };

  return (
    <React.Fragment>
      <div className={classNames(style['pur-main-content-bidding-site'])}>
        <BiddingSite {...biddingSiteProps} />
      </div>

      {/* 英式竞价 */}
      {britishBidding() ? (
        <div className={classNames(style['pur-main-content-bidding-list'])}>
          {getUnitPriceFlag(header) ? <UnitPriceList {...unitPriceListProps} /> : null}
          {getTotalPriceFlag(header) ? <TotalPriceSupplierList {...totalPriceListProps} /> : null}
        </div>
      ) : (
        ''
      )}

      {/* 日式/荷兰 */}
      {japOrDutchBiddingTotalPrice() ? (
        <div className={classNames(style['pur-main-content-bidding-list'])}>
          {/* 筛选器
          <FilterBar
            dataSet={[getJapanOrDutchListDs()]}
            defaultExpand={false}
            autoQuery={false}
            onQuery={(params) => {
              tableSearchQuery(params || {});
            }}
            right={{
              render: renderFilterBarRight,
            }}
            onClear={() => {
              tableSearchQuery();
            }}
            fieldDefaultValueType="custom"
          /> */}

          {renderJapanDutchRight()}

          <div className={classNames(style['pur-main-content-bidding-list-wrapper-content-main'])}>
            {biddingView === 0 ? <JAPANDUTCHList {...unitPriceListProps} /> : null}
            {biddingView === 1 ? <JAPANDUTCHAggregationTableList {...totalPriceListProps} /> : null}
          </div>
        </div>
      ) : (
        ''
      )}
    </React.Fragment>
  );
});

export default MainContent;
