/*
 * @Description: 付款计划历史版本
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-26 11:19:23
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, { useCallback, memo } from 'react';

import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import VersionRecord from '../../../../components/HistoryRecord/VersionRecord';

interface historyVersionProps {
  planNum: string,
  planHeaderId: string | number,
  history: any,
}

export default memo(({ planNum, planHeaderId, history }: historyVersionProps) => {

  const handleViewHistory = useCallback(({ record }) => {
    const planHeaderId = record?.get('planHeaderId');
    if (!planHeaderId) return;
    history.push({
      pathname: `/ssta/payment-plan/detail/${planHeaderId}`,
      search: stringify({ operate: 'history' }),
    });
  }, [history]);

  return (
    <VersionRecord
      primaryKey='planHeaderId'
      currentKey={planHeaderId}
      onClick={handleViewHistory}
      fieldsConfig={{
        userName: { alias: 'createdByName' },
        time: { alias: 'creationDate' },
      }}
      readTransport={{
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/plan-headers/history/page`,
        method: 'GET',
        params: { planNum },
      }}
    />
  );
});

