import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Popover, Tooltip, Tag, Text } from 'choerodon-ui';
import { isNil, noop } from 'lodash';

import { getCommonLineStatusColor } from '@/routes/ssrc/BiddingHall/utils/statusColor';

import Collection from './Collection';
import Timer from './Timer';

import Styles from './index.less';

@observer
class Status extends React.Component {
  constructor(props) {
    super(props);

    if (props?.onRef) {
      props.onRef(this);
    }
  }

  getStatusRender = () => {
    const {
      record,
      headerRecordData,
      // headerInfo,
      supplementUnitPriceFlag, // 补充单价 节点
      // biddingSupplierEliminate = noop,
    } = this.props;
    const { displayBiddingSupLineStatus, displayBiddingSupHeaderStatus } =
      record?.get([
        'displayBiddingSupLineStatus',
        'displayBiddingSupHeaderStatus',
        'biddingRoundSupplierStatus',
        'biddingRoundSupplierStatusMeaning',
      ]) || {};
    const { displayBiddingSupLineStatus: lineStatus } = headerRecordData || {};

    const currentStatus =
      lineStatus || displayBiddingSupLineStatus || displayBiddingSupHeaderStatus;

    // // 日/荷兰 淘汰单独处理
    // if (biddingSupplierEliminate()) {
    //   currentStatus = biddingRoundSupplierStatus;
    // }

    let statusText = '';
    let wrapClass = '';

    if (currentStatus === 'NOT_START' || currentStatus === 'SIGN_IN') {
      statusText = intl.get('ssrc.biddingHall.view.willToStart').d('即将开始');
      wrapClass = Styles['not-start'];

      if (supplementUnitPriceFlag) {
        statusText = intl.get('ssrc.biddingHall.view.supplementaryUnitPrice').d('补充单价');
        // wrapClass = Styles['not-start'];
      }
    }

    if (currentStatus === 'IN_PROGRESS') {
      statusText = intl.get('ssrc.biddingHall.view.inProcess').d('正在进行');
      wrapClass = Styles['in-process'];

      if (supplementUnitPriceFlag) {
        statusText = intl.get('ssrc.biddingHall.view.supplementaryUnitPrice').d('补充单价');
        wrapClass = Styles['in-process'];
      }
    }

    if (currentStatus === 'PAUSED') {
      statusText = intl.get('ssrc.biddingHall.view.biddingPaused').d('竞价暂停');
      wrapClass = Styles['has-paused'];
    }

    if (currentStatus === 'CLOSED') {
      statusText = intl.get('ssrc.biddingHall.view.biddingClosed').d('竞价关闭');
      wrapClass = Styles['has-closed'];
    }

    if (
      currentStatus === 'BIDDING_END' ||
      currentStatus === 'FINISHED' ||
      currentStatus === 'SUGGESTED' ||
      currentStatus === 'NO_SUGGESTED'
    ) {
      statusText = intl.get('ssrc.biddingHall.view.willbiddingFinished').d('竞价完成');
      wrapClass = Styles['has-finished'];
    }

    return {
      statusText,
      wrapClass,
    };
  };

  renderQuotationSupplier = () => {
    const {
      record,
      headerRecordData,
      unitPriceFlag,
      remote,
      headerInfo,
      hideIdentityAndQuote,
      japOrDutchBiddingTotalPrice = noop,
    } = this.props;
    const {
      displayBiddingSupLineStatus,
      allSupplierQuotedCount,
      collectionFlagCount,
      currentBiddingRoundAcceptCount,
    } = record
      ? record?.get([
          'displayBiddingSupLineStatus',
          'allSupplierQuotedCount',
          'collectionFlagCount',
          'currentBiddingRoundAcceptCount',
        ])
      : {};
    let hideQuoteSupplier = false;
    if (typeof hideIdentityAndQuote === 'function') {
      hideQuoteSupplier = hideIdentityAndQuote();
    }

    const japDutchTotal = japOrDutchBiddingTotalPrice();

    const { displayBiddingSupLineStatus: lineStatus } = headerRecordData || {};
    let inner = '';

    const currentStatus = lineStatus || displayBiddingSupLineStatus;
    if (currentStatus === 'NOT_START' || currentStatus === 'SIGN_IN' || hideQuoteSupplier) {
      return inner;
    }

    const collectionVisible = unitPriceFlag;

    const allSupplierQuotedCountVisible = !japDutchTotal;

    const japanDutchAcceptCountVisible = japDutchTotal && !isNil(currentBiddingRoundAcceptCount);

    inner = (
      <span>
        {allSupplierQuotedCountVisible ? (
          <span>
            {intl
              .get('ssrc.biddingHall.view.message.quotationCountPeople', {
                quotationCount: allSupplierQuotedCount || 0,
              })
              .d('{quotationCount}人出价')}
          </span>
        ) : (
          ''
        )}

        {collectionVisible ? (
          <span className={Styles['quotation-detail-line-quotation-supplier-info-not-first']}>
            {intl
              .get('ssrc.biddingHall.view.collectionPeopleNumber', {
                collectionFlagCount: collectionFlagCount || 0,
              })
              .d('{collectionFlagCount}人关注')}
          </span>
        ) : (
          ''
        )}

        {japanDutchAcceptCountVisible ? (
          <span className={Styles['quotation-detail-line-quotation-supplier-info-not-first']}>
            {intl
              .get('ssrc.biddingHall.view.currentBiddingRoundAcceptCount', {
                count: currentBiddingRoundAcceptCount,
              })
              .d('{count}人已接受本轮叫价')}
          </span>
        ) : (
          ''
        )}
      </span>
    );

    return remote
      ? remote?.process(
          'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_QUOTATION_DETAIL_HEADER_SUPPLIER_INFO',
          inner,
          { headerInfo }
        )
      : inner;
  };

  renderTimeAndSupplierInfos = () => {
    const {
      record,
      headerRecordData,
      totalPriceFlag,
      unitPriceFlag,
      countDownTimerOver,
      headerInfo,
      initPage,
      headerRule,
      countDownShowAllZeroFlag,
      japOrDutchBidding = noop,
      biddingSupplierEliminate = noop,
    } = this.props;
    const {
      deferBiddingFlag: headerDeferBiddingFlag,
      biddingSupplementPriceRunningFlag,
      quotationStatus,
    } = headerInfo || {};
    const {
      supplierDeferCount,
      displayBiddingSupLineStatus,
      displayBiddingSupHeaderStatus,
      biddingPausedRealTimeStatus,
      deferBiddingFlag,
    } = record
      ? record?.get([
          'supplierDeferCount',
          'displayBiddingSupLineStatus',
          'displayBiddingSupHeaderStatus',
          'biddingPausedRealTimeStatus',
          'deferBiddingFlag',
        ])
      : {};

    let totalPriceLineFlag = false; // 总价竞价 只有头，没有行逻辑
    if (totalPriceFlag) {
      totalPriceLineFlag = true;
    }

    // 渲染延时次数
    const renderDeferCountNode = () => {
      const {
        displayBiddingSupLineStatus: lineStatus,
        biddingPausedRealTimeStatus: headerBiddingPausedRealTimeStatus,
      } = headerRecordData || {};
      const currentStatus =
        lineStatus || displayBiddingSupLineStatus || displayBiddingSupHeaderStatus;

      const { deferBiddingAllowedQuotationCount, autoDeferFlag } = headerRule || {};
      const { tagColor } = getCommonLineStatusColor(currentStatus) || {};
      const deferFlag = deferBiddingFlag || headerDeferBiddingFlag;

      // 【延时竞价中、完成、暂停】状态显示
      // realStatus === 'IN_PROGRESS' && deferBiddingFlag 这个代表是处于延时竞价中
      const realStatus =
        currentStatus === 'PAUSED'
          ? biddingPausedRealTimeStatus || headerBiddingPausedRealTimeStatus
          : currentStatus;
      const showStatusFlag =
        ['FINISHED', 'BIDDING_END', 'SUGGESTED'].includes(realStatus) ||
        (realStatus === 'IN_PROGRESS' && deferBiddingFlag);
      // 以上状态 & 有延时 & 【触发了延时 或者 有最大延时次数】
      const showAutoDeferFlag =
        showStatusFlag &&
        deferFlag &&
        autoDeferFlag &&
        (!isNil(supplierDeferCount) || !isNil(deferBiddingAllowedQuotationCount)); // 以上状态 & 有延时 & 【触发了延时 或者 有最大延时次数】

      return showAutoDeferFlag ? (
        <span className={Styles['quotation-detail-line-quotation-defer-count']}>
          <Tooltip
            title={`${intl.get('ssrc.common.view.message.delayedTimes').d('已延时次数')}${
              deferBiddingAllowedQuotationCount
                ? `/${intl
                    .get(
                      `ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`
                    )
                    .d('允许报价次数(延时竞价)')}`
                : ''
            }`}
          >
            <Tag color={tagColor} border={false}>
              <Text>
                {`${intl.get('ssrc.common.view.message.delayTimes').d('延时次数')}: ${
                  supplierDeferCount ?? 0
                }${
                  deferBiddingAllowedQuotationCount ? `/${deferBiddingAllowedQuotationCount}` : ''
                }`}
              </Text>
            </Tag>
          </Tooltip>
        </span>
      ) : (
        ''
      );
    };

    let hiddenTimer = false;

    // 日/荷兰 试竞价/正式 中如果淘汰，隐藏倒计时
    if (japOrDutchBidding()) {
      hiddenTimer =
        biddingSupplierEliminate() &&
        (!biddingSupplementPriceRunningFlag || quotationStatus === 'NEW');
    }

    const timerCommonProps = {
      japOrDutchBidding,
      hiddenTimer,
    };

    return (
      <>
        <div className={Styles['quotation-detail-line-quotation-supplier-timer-wrap']}>
          <Timer
            // visibleFlag={false} // 调试代码
            headerRecordData={headerRecordData}
            data={record?.toData()}
            headerInfo={headerInfo}
            type="line"
            totalPriceFlag={totalPriceFlag}
            unitPriceFlag={unitPriceFlag}
            totalPriceLineFlag={totalPriceLineFlag}
            wrapClass={`${Styles['line-date-time-wrap']} line-date-time-wrap-time`}
            labelClass={`${Styles['bidding-time-line-render-icon-label']} bidding-time-line-render-icon-label-time`}
            valueClass={`${Styles['bidding-time-line-render-value']} bidding-time-line-render-value-time`}
            countDownTimerOver={countDownTimerOver}
            initPage={initPage}
            countDownShowAllZeroFlag={countDownShowAllZeroFlag}
            showLabelIconFlag // 是否显示icon，不显示文字flag
            {...(timerCommonProps || {})}
          />
          {renderDeferCountNode()}
        </div>
        <div
          className={`${Styles['quotation-detail-line-quotation-supplier-info']} quotation-detail-line-quotation-supplier-info-value`}
        >
          {this.renderQuotationSupplier()}
        </div>
      </>
    );
  };

  renderStatus = () => {
    const {
      record,
      supplierCollection,
      // pageReadOnlyFlag,
      headerRecordData,
      unitPriceFlag,
    } = this.props;
    const { displayBiddingSupLineStatus, collectionFlag, displayBiddingSupHeaderStatus } =
      record?.get([
        'displayBiddingSupLineStatus',
        'collectionFlag',
        'displayBiddingSupHeaderStatus',
      ]) || {};
    const { displayBiddingSupLineStatus: lineStatus } = headerRecordData || {};
    const currentStatus =
      lineStatus || displayBiddingSupLineStatus || displayBiddingSupHeaderStatus;

    if (!currentStatus) {
      return '';
    }

    const { statusText = '', wrapClass = '' } = this.getStatusRender();
    const collectionVisible = unitPriceFlag; // 单价竞价显示

    return (
      <div
        className={classnames(
          Styles['quotation-detail-line-status-wrap'],
          'quotation-detail-line-status-wrap-line'
        )}
      >
        <div
          className={classnames(
            Styles['quotation-detail-line-status-values'],
            wrapClass,
            'quotation-detail-line-status-values-line'
          )}
        >
          <div
            className={classnames(
              Styles['quotation-detail-line-status-values-inner'],
              'quotation-detail-line-status-values-inner-line'
            )}
          >
            <Popover content={statusText}>{statusText}</Popover>
          </div>
        </div>
        <div className={Styles['quotation-detail-line-status-infos']}>
          <div className={Styles['quotation-detail-line-status-infos-left']}>
            {this.renderTimeAndSupplierInfos()}
          </div>
          <div>
            <Collection
              visibleFlag={collectionVisible}
              // readOnly={pageReadOnlyFlag}
              record={record}
              iconStyles={{
                fontSize: '24px',
              }}
              collectionFlag={collectionFlag}
              handleCollection={supplierCollection}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    return this.renderStatus();
  }
}

export default Status;
