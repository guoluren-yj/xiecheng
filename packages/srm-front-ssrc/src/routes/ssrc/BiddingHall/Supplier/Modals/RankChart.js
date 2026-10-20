// import React, { useMemo, useCallback } from 'react';
// import { Table, DataSet } from 'choerodon-ui/pro';
// import { Tag, Popover } from 'choerodon-ui';
// import { observer } from 'mobx-react';

// import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

// import Rise from '@/assets/rise.svg';
// import decline from '@/assets/decline.svg';

// import { numberSeparatorRender } from '@/utils/renderer';
// import { fetchQuotationLineNewMessage } from '@/services/supplierQutationService';
// import { getRankChartColor } from '../utils/rankChartColor';
// import { biddingRankTableDS } from '../Stores/rankTableDS';

// const RankChart = (props = {}) => {
//   const { headerDS, organizationId, lineRecord, aggregation = false } = props;
//   const tableDS = useMemo(() => new DataSet(biddingRankTableDS()), []);
//   const { rank, rfxLineItemId, rfxLineItemNum, trendFlag } = lineRecord.get([
//     'rank',
//     'rfxLineItemId',
//     'rfxLineItemNum',
//     'trendFlag',
//   ]);

//   const rankFieldColor = getRankChartColor(rank);

//   // useEffect(() => {
//   //   fetchRankList();
//   // }, []);

//   const fetchRankList = useCallback(async () => {
//     const {
//       rfxNum,
//       roundNumber,
//       rfxHeaderId,
//       auctionDirection,
//       templateId,
//       quotationHeaderId,
//       openRule,
//       tenantId,
//     } = headerDS.current
//       ? headerDS.current.get([
//           'roundNumber',
//           'rfxHeaderId',
//           'auctionDirection',
//           'templateId',
//           'quotationHeaderId',
//           'openRule',
//           'tenantId',
//           'rfxNum',
//         ])
//       : {};

//     if (!rfxNum || !quotationHeaderId || !tenantId || !rfxLineItemId) {
//       return;
//     }

//     const param = {
//       organizationId,
//       rfxNum,
//       roundNumber,
//       rfxHeaderId,
//       auctionDirection,
//       templateId,
//       quotationHeaderId,
//       rfxLineItemId,
//       rfxLineItemNum,
//       openRule,
//       purchaseTenantId: tenantId,
//     };

//     let result = null;
//     try {
//       result = await fetchQuotationLineNewMessage(param);
//       result = getResponse(result);
//       if (!result) {
//         return;
//       }
//       const { quotationRankDTOS = [] } = result;
//       tableDS.loadData(quotationRankDTOS);
//     } catch (e) {
//       throw e;
//     }
//   }, [headerDS, aggregation]);

//   // rank
//   const rankChartColorRender = (realRank) => {
//     const color = getRankChartColor(realRank);

//     return (
//       <Tag style={{ border: 0 }} color={color}>
//         {realRank ?? '-'}
//       </Tag>
//     );
//   };

//   const columns = useMemo(
//     () => [
//       {
//         name: 'rank',
//         renderer: ({ value }) => rankChartColorRender(value),
//         width: 100,
//       },
//       {
//         name: 'supplierCompanyName',
//       },
//       {
//         name: 'gridQuotationPrice',
//         width: 120,
//         renderer: ({ value }) => numberSeparatorRender(value),
//       },
//       {
//         name: 'quotedDate',
//         width: 150,
//       },
//     ],
//     [aggregation]
//   );

//   // rank popover changed
//   const rankChartVisibleChange = useCallback(
//     (visibleFlag) => {
//       if (visibleFlag) {
//         fetchRankList();
//       }
//     },
//     [lineRecord, fetchRankList, rank, aggregation]
//   );

//   return rank ? (
//     <Popover
//       title={intl.get('ssrc.supplierQuotation.view.biddingLineRankTable').d('竞价行排名表')}
//       overlayStyle={{ width: '600px' }}
//       content={() => (
//         <Table bordered dataSet={tableDS} rowKey="quotationLineId" columns={columns} />
//       )}
//       onVisibleChange={rankChartVisibleChange}
//     >
//       <Tag style={{ border: 0 }} color={rankFieldColor}>
//         {rank ?? '-'}
//       </Tag>
//       <span>
//         {trendFlag === 1 ? (
//           <img src={Rise} alt="" />
//         ) : trendFlag === 0 ? (
//           <img src={decline} alt="" />
//         ) : (
//           '-'
//         )}
//       </span>
//     </Popover>
//   ) : (
//     ''
//   );
// };

// export default observer(RankChart);
