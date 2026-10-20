import React, { useEffect, useMemo } from 'react';
import { getAccessToken, getResponse } from 'utils/utils';
import { API_HOST } from 'utils/config';
import { isString } from 'lodash';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import { connectData } from '@/services/priceComparisonService';

const accessToken = getAccessToken();

export default function NewHistoryAnalysisTab(props = {}) {
  const { historyAnalysisUrl, rfxId } = props;
  idValidation(rfxId);
  if (!rfxId || !historyAnalysisUrl || !isString(historyAnalysisUrl)) return null;

  useEffect(() => {
    getResponse(connectData({ rfxHeaderId: rfxId }));
  }, [rfxId]);

  // 正则替换
  const newUrl = useMemo(() => historyAnalysisUrl.replace(/(\$rfxHeaderId\$)/g, rfxId), [
    rfxId,
    historyAnalysisUrl,
  ]);
  return (
    <iframe
      style={{ width: '100%', height: 'calc(100vh - 170px)', border: 'none' }}
      title="iframe"
      src={`${API_HOST}${newUrl}&access_token=${accessToken}`}
    />
  );
}
