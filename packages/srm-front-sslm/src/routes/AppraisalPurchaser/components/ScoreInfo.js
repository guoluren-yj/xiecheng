/*
 * ScoreInfo - 评分信息
 * @Date: 2023-12-07 11:07:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import ScoreCombineTable from './ScoreCombineTable';

const ScoreInfo = ({
  remote,
  dataSet,
  basicDs,
  dispatch,
  combineRef,
  evalHeaderId,
  evalGranularity,
  custLoading,
  customizeTable,
}) => {
  return (
    <ScoreCombineTable
      remote={remote}
      ref={combineRef}
      basicDs={basicDs}
      dataSet={dataSet}
      dispatch={dispatch}
      sourceKey="SCORE_INFO"
      custLoading={custLoading}
      evalHeaderId={evalHeaderId}
      customizeTable={customizeTable}
      evalGranularity={evalGranularity}
      searchCode="SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_INFO_SEARCH"
      customizeUnitCode="SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_INFO_LIST"
    />
  );
};

export default ScoreInfo;
