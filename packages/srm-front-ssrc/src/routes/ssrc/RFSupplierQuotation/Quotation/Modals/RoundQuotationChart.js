/**
 * 排名表 modal
 * - @props type 页面来源 string null  多轮报价排名表-multiQuotationRound, 竞价整单排名表-biddingRankChart
 * */

import React, { useMemo, useImperativeHandle, useCallback } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { Popover } from 'choerodon-ui';
import { noop, throttle } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import { getQuotationName } from '@/utils/globalVariable';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';

import { numberSeparatorRender } from '@/utils/renderer';
import { roundQuotationRankTable } from '@/services/supplierQutationService';
import { roundQuotationRankDS } from '../Stores/rankTableDS';

import Style from '../index.less';

const RoundQuotationChart = (props = {}) => {
  const {
    headerDS,
    organizationId,
    quotationName,
    onRef = noop,
    title = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.roundQuotationInfoTable`)
      .d('多轮报价信息表'),
    showContent = '',
    bidFlag = 0,
    showPopOverFlag = true,
  } = props;
  const {
    quotationHeaderId,
    roundQuotationRankFlag,
    currentQuotationRound,
    lastRoundQuotationRank,
    lastRoundQuotationAmount,
    purSelectQuotationDetailFlag = 0,
  } = headerDS.current
    ? headerDS.current.get([
        'quotationHeaderId',
        'roundQuotationRankFlag',
        'currentQuotationRound',
        'lastRoundQuotationAmount',
        'lastRoundQuotationRank',
        'purSelectQuotationDetailFlag',
      ])
    : {};

  useImperativeHandle(onRef, () => ({
    fetchRoundInfoTable,
  }));

  const tableDS = useMemo(
    () =>
      new DataSet(
        roundQuotationRankDS({
          quotationName,
        })
      ),
    [headerDS, quotationHeaderId, roundQuotationRankFlag, currentQuotationRound]
  );

  // useEffect(() => {
  //   fetchRoundInfoTable();
  // }, []);

  const fetchRoundInfoTable = useCallback(async () => {
    if (!organizationId || !quotationHeaderId) {
      return;
    }

    const param = {
      organizationId,
      quotationHeaderId,
      purSelectQuotationDetailFlag,
    };

    let result = null;
    try {
      result = await roundQuotationRankTable(param);
      result = getResponse(result);
      if (!result) {
        return;
      }

      tableDS.loadData(result);
    } catch (e) {
      throw e;
    }
  }, [headerDS, purSelectQuotationDetailFlag]);

  // rank
  // const rankChartColorRender = (realRank) => {
  //   const color = getRankChartColor(realRank);

  //   return (
  //     <Tag style={{ border: 0 }} color={color}>
  //       {realRank}
  //     </Tag>
  //   );
  // }

  const commonRenderValue = ({ value, record }) => {
    const currentFlag = record.get('currentFlag');

    return <div style={{ color: currentFlag ? 'green' : '' }}>{value ?? '-'}</div>;
  };

  const commonDateTimeRenderValue = ({ value, record }) => {
    const currentFlag = record.get('currentFlag');

    const formatValue = dateTimeRender(value);

    return <div style={{ color: currentFlag ? 'green' : '' }}>{formatValue ?? '-'}</div>;
  };

  const priceCommonRenderValue = ({ value, record }) => {
    const currentFlag = record.get('currentFlag');

    return (
      <div style={{ color: currentFlag ? 'green' : '' }}>{numberSeparatorRender(value) ?? '-'}</div>
    );
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'quotationRound',
          width: 60,
          renderer: commonRenderValue,
        },
        {
          name: 'quotationStatusMeaning',
          width: 100,
          renderer: ({ record }) => {
            const { quotationStatusMeaning, quotationStatus } = record.get([
              'quotationStatusMeaning',
              'quotationStatus',
            ]);

            return renderStatusTag({
              status: quotationStatus,
              statusMeaning: quotationStatusMeaning,
            });
          },
        },
        {
          name: 'roundQuotationStartDate',
          width: 140,
          renderer: commonDateTimeRenderValue,
        },
        {
          name: 'roundQuotationEndDate',
          width: 140,
          renderer: commonDateTimeRenderValue,
        },
        roundQuotationRankFlag && currentQuotationRound > 1
          ? {
              name: 'roundRank',
              width: 60,
              renderer: commonRenderValue,
            }
          : null,
        {
          name: 'quotationAmount',
          width: 140,
          renderer: priceCommonRenderValue,
          align: 'right',
        },
        {
          name: 'netQuotationAmount',
          width: 140,
          renderer: priceCommonRenderValue,
          align: 'right',
        },
        {
          name: 'roundRemark',
          // hidden: type === 'multiQuotationRound', // 多轮报价显示发起轮次原因
          renderer: commonRenderValue,
        },
      ].filter(Boolean),
    [roundQuotationRankFlag, currentQuotationRound]
  );

  // 展示多轮报价信息表
  const roundRankChartPopover = useCallback(
    throttle((visibled) => {
      if (visibled) {
        fetchRoundInfoTable();
      }
    }, 1200),
    [fetchRoundInfoTable]
  );

  // 内部文字
  const innerContent = useCallback(() => {
    return !showContent ? (
      <span>
        {roundQuotationRankFlag
          ? `${intl.get(`ssrc.supplierQuotation.model.supQuo.lastRank`).d('上一轮排名')}: ${
              lastRoundQuotationRank ?? ''
            }`
          : `${intl
              .get(`ssrc.supplierQuotation.model.lastRoundQuotationTotalAmount`, {
                quotationName: getQuotationName(bidFlag),
              })
              .d('上一轮{quotationName}金额')}: ${lastRoundQuotationAmount ?? ''}`}
      </span>
    ) : (
      showContent
    );
  }, [
    showContent,
    roundQuotationRankFlag,
    lastRoundQuotationRank,
    lastRoundQuotationAmount,
    bidFlag,
  ]);

  return showPopOverFlag ? (
    <Popover
      title={title}
      overlayStyle={{ width: '600px' }}
      content={<Table bordered dataSet={tableDS} rowKey="roundHeaderDateId" columns={columns} />}
      onVisibleChange={roundRankChartPopover}
    >
      <span
        className={classnames(Style['card-title-category'], Style['card-title-round-quotation'])}
      >
        {innerContent()}
      </span>
    </Popover>
  ) : (
    <span className={classnames(Style['card-title-category'], Style['card-title-round-quotation'])}>
      {innerContent()}
    </span>
  );
};

export default observer(RoundQuotationChart);
