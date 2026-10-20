import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { RecordApproval } from '@/components/Record';
import PartRecordTimeline from './PartRecordTimeLine';
import { fetchPartOperateRecord } from '../api';

function RecordTabs(props) {
  const {
    rowRecord, // 行记录
    businessParams = {}, // 查询流程单据所需参数
    businessKey, // 直接查询审批记录参数
    isSup,
    leftOperateArg = {}, // 操作记录参数
    isHasFlow = true, // 是否展示审批记录
    isOldMenu = false, // 是否是旧菜单
    isEc = false, // 是否是电商
  } = props;
  const { partLoad = false, queryParams = {}, operateRenderer = (e) => e } = leftOperateArg;

  const [hasFlow, setHasFlow] = useState(false);
  const [tabKey, setTabKey] = useState('operate');
  const operateDs = useMemo(
    () =>
      new DataSet({
        paging: false,
      }),
    []
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    const res = await fetchPartOperateRecord(
      filterNullValueObject({
        ...queryParams,
        ...(operateDs.getState('reqParams') || {}), // 加载更多需传
      })
    );
    if (getResponse(res)) {
      const { resultList, currentYear, noMore, currentRow, offset } = res || {};
      operateDs.setState('finishLoading', true);
      operateDs.appendData(resultList || []);
      operateDs.setState('reqParams', {
        currentYear,
        noMore,
        currentRow,
        offset,
      });
      operateDs.setState('noMore', noMore);
      if (!hasFlow) {
        // 电商上架工作流审批编码 EC_WFL
        const _hasFlow =
          businessKey || resultList.some((r) => (r.operationCode || '').includes('WFL'));
        if (_hasFlow) setHasFlow(true);
      }
    }
  }, [hasFlow, operateDs.length]);

  const handleLoadMore = () => {
    // loading效果
    return fetchData();
  };

  return !hasFlow ? (
    <div style={{ marginTop: 8 }}>
      <PartRecordTimeline
        dataSet={operateDs}
        partLoad={partLoad}
        loadMore={handleLoadMore}
        renderer={(arg) => operateRenderer(arg, { rowRecord, isSup }, () => setTabKey('approve'))}
      />
    </div>
  ) : (
    <Tabs activeKey={tabKey} onChange={(key) => setTabKey(key)}>
      <Tabs.TabPane key="operate" tab={intl.get('hzero.common.button.operation').d('操作记录')}>
        <div style={{ marginTop: 8 }}>
          <PartRecordTimeline
            dataSet={operateDs}
            partLoad={partLoad}
            loadMore={handleLoadMore}
            renderer={(arg) =>
              operateRenderer(arg, { rowRecord, isSup }, () => setTabKey('approve'))
            }
          />
        </div>
      </Tabs.TabPane>
      {isHasFlow && (
        <Tabs.TabPane
          key="approve"
          tab={intl.get('hzero.common.button.approveHistory').d('审批记录')}
        >
          <RecordApproval
            businessParams={businessParams}
            businessKey={businessKey}
            isOldMenu={isOldMenu}
            isEc={isEc}
          />
        </Tabs.TabPane>
      )}
    </Tabs>
  );
}
export default RecordTabs;
