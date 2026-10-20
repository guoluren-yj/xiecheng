import React, { useMemo, useCallback } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Tag, Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import Rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';

import { numberSeparatorRender } from '@/utils/renderer';
import { fetchQuotationLineNewMessage } from '@/services/supplierQutationService';
import { getRankChartColor } from '../utils/rankChartColor';
import { biddingRankTableDS } from '../Stores/rankTableDS';

import PageStyles from '../index.less';

const RankChart = (props = {}) => {
  const { headerDS, organizationId, lineRecord, aggregation = false, quotationRemote } = props;
  const tableDS = useMemo(() => new DataSet(biddingRankTableDS()), []);
  const { rank, rfxLineItemId, rfxLineItemNum, trendFlag, quotationRank } = lineRecord.get([
    'rank',
    'rfxLineItemId',
    'rfxLineItemNum',
    'trendFlag',
    'quotationRank',
  ]);

  const currentRank = useMemo(() => rank || quotationRank, [ rank, quotationRank ]);

  const rankFieldColor = getRankChartColor(currentRank);

  // useEffect(() => {
  //   fetchRankList();
  // }, []);

  const fetchRankList = useCallback(async () => {
    const {
      rfxNum,
      roundNumber,
      rfxHeaderId,
      auctionDirection,
      templateId,
      quotationHeaderId,
      openRule,
      tenantId,
    } = headerDS.current
      ? headerDS.current.get([
          'roundNumber',
          'rfxHeaderId',
          'auctionDirection',
          'templateId',
          'quotationHeaderId',
          'openRule',
          'tenantId',
          'rfxNum',
        ])
      : {};

    if (!rfxNum || !quotationHeaderId || !tenantId || !rfxLineItemId) {
      return;
    }

    const param = {
      organizationId,
      rfxNum,
      roundNumber,
      rfxHeaderId,
      auctionDirection,
      templateId,
      quotationHeaderId,
      rfxLineItemId,
      rfxLineItemNum,
      openRule,
      purchaseTenantId: tenantId,
    };

    let result = null;
    try {
      result = await fetchQuotationLineNewMessage(param);
      result = getResponse(result);
      if (!result) {
        return;
      }
      const { quotationRankDTOS = [] } = result || {};
      tableDS.loadData(quotationRankDTOS || []);
    } catch (e) {
      throw e;
    }
  }, [headerDS, aggregation]);

  // rank
  const rankChartColorRender = (realRank) => {
    const color = getRankChartColor(realRank);

    return (
      <Tag style={{ border: 0 }} color={color}>
        {realRank ?? '-'}
      </Tag>
    );
  };

  const columns = useMemo(
    () => [
      {
        name: 'rank',
        width: 100,
        renderer: ({ value }) => {
          const rankTableRender = rankChartColorRender(value);

          return quotationRemote
            ? quotationRemote.render(
                'SSRC_SUPPLIER_QUOTATION_NEW_RENDER_QUOTATION_LINE_COLUMNS_RANK_POPOVER_TABLE_RANK',
                rankTableRender,
                {
                  rank: value,
                  lineRecord,
                  getRankChartColor,
                }
              )
            : rankTableRender;
        },
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'gridQuotationPrice',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotedDate',
        width: 150,
      },
    ],
    [aggregation, lineRecord]
  );

  // rank popover changed
  const rankChartVisibleChange = useCallback(
    (visibleFlag) => {
      if (visibleFlag) {
        fetchRankList();
      }
    },
    [lineRecord, fetchRankList, rank, aggregation]
  );

  const rankRender = (
    <Tag style={{ border: 0 }} color={rankFieldColor}>
      {currentRank ?? '-'}
    </Tag>
  );

  const rankTrenkRender = (
    <span>
      {trendFlag === 1 ? (
        <img src={Rise} alt="" />
      ) : trendFlag === 0 ? (
        <img src={decline} alt="" />
      ) : (
        '-'
      )}
    </span>
  );

  const rankDom = quotationRemote
    ? quotationRemote.render(
        'SSRC_SUPPLIER_QUOTATION_NEW_RENDER_QUOTATION_LINE_COLUMNS_RANK_GROUP_RANK',
        rankRender,
        {
          rank: currentRank,
          trendFlag,
          lineRecord,
          rankFieldColor,
        }
      )
    : rankRender;

  const rankTrenkRenderDom = quotationRemote
    ? quotationRemote.render(
        'SSRC_SUPPLIER_QUOTATION_NEW_RENDER_QUOTATION_LINE_COLUMNS_RANK_GROUP_RANKTREND',
        rankTrenkRender,
        {
          rank: currentRank,
          trendFlag,
          lineRecord,
        }
      )
    : rankTrenkRender;

  return rank ? (
    <Popover
      title={intl.get('ssrc.supplierquotation.view.biddingLineRankTable').d('竞价行排名表')}
      overlayStyle={{ width: '600px' }}
      content={() => (
        <Table bordered dataSet={tableDS} rowKey="quotationLineId" columns={columns} />
      )}
      trigger="click"
      placement="topLeft"
      onVisibleChange={rankChartVisibleChange}
      overlayClassName={PageStyles['ssrc-apply-quotation-rank-chart-wrapper']}
    >
      {rankDom}
      {rankTrenkRenderDom}
    </Popover>
  ) : (
    ''
  );
};

export default observer(RankChart);
