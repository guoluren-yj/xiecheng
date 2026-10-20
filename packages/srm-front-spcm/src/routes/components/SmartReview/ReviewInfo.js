/*
 * ReviewInfo - 所有审查信息
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect } from 'react';

import { Spin } from 'choerodon-ui/pro';

import PaneHeader from './PaneHeader';
import RiskTermInfo from './RiskTermInfo';

const ReviewInfo = ({
  hiddenIgnoreBtn = false,
  pcHeaderId,
  handleSearchKeyWords = () => {},
  dataSet,
  customizeForm,
  code = 'SPCM.WORKSPACE_DETAIL.SMART_REVIEW_C',
} = {}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, []);

  // 查询风险信息
  const handleQueryRiskInfoBySort = (params = {}) => {
    const oldParams = dataSet.getQueryParameter('queryParams') || {};
    dataSet.setQueryParameter('queryParams', {
      ...oldParams,
      ...params,
      customizeUnitCode: code,
    });
    setLoading(true);
    dataSet.query().finally(() => setLoading(false));
    // 每次切换需要清空风险项激活的key
    dataSet.setState('clearActiveKeyFlag', !dataSet.getState('clearActiveKeyFlag'));
  };

  return (
    <Spin spinning={loading}>
      <PaneHeader
        hiddenIgnoreBtn={hiddenIgnoreBtn}
        handleQueryRiskInfoBySort={handleQueryRiskInfoBySort}
      />
      <RiskTermInfo
        hiddenIgnoreBtn={hiddenIgnoreBtn}
        pcHeaderId={pcHeaderId}
        dataSet={dataSet}
        handleSearchKeyWords={handleSearchKeyWords}
        setLoading={setLoading}
        customizeForm={customizeForm}
        code={code}
      />
    </Spin>
  );
};

export default ReviewInfo;
