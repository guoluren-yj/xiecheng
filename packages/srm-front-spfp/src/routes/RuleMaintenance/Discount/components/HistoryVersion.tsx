/*
 * @Description: 付款计划历史版本
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2022-10-26 11:19:23
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useState, useLayoutEffect, useCallback, memo } from 'react';
import { Menu } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
// import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';

import type { Operate } from '../utils/type';
import { fetchRuleHistory } from '../utils/api';
// import { Store, StoreValueType } from '../Create/stores';


interface historyVersionProps
{
  ruleNum: string,
  history,
  pathname?: string,
}

export default memo(({ ruleNum, history, pathname }: historyVersionProps) => {

  const [data, setData] = useState<any[]>([]);


  const handleFetchHistory = useCallback(async () => {
    const res = getResponse(await fetchRuleHistory(ruleNum));
    setData(res?.content || []);
  }, [ruleNum]);

  const handleViewHistory = useCallback((ruleHeaderData: Record<string, any>, operate: Operate) => {
    const { ruleId } = ruleHeaderData || {};
    if (!ruleId) return;
    // openTab({
    //   key: `/spfp/rule-maintenance/rebate/detail/${ruleId}/${operate}`,
    //   title: `${baseTitle}${ruleNum}-${versionNumber}`,
    //   // search: stringify({ operate, souceType }),
    // });
    const detailName = pathname?.includes('other-detail') ? 'other-detail' : 'detail';
    history.push({
      pathname: `/spfp/rule-maintenance/discount/${detailName}/${ruleId}/${operate}`,
      state: {
        backPath: `${pathname}`,
      },
    });
  }, [history, pathname]);

  useLayoutEffect(() => {
    handleFetchHistory();
  }, [handleFetchHistory]);

  return (
    <Menu style={{ maxHeight: '600px', overflow: 'auto' }}>
      {isEmpty(data) ? (
        <Menu.Item disabled>
          {intl.get('spfp.common.view.title.noHistoricalVersionInfo').d('暂无历史版本信息')}
        </Menu.Item>
      ) : (
        data.map((item) => (
          <Menu.Item onClick={() => handleViewHistory(item, 'history')} key={item.objectVersionNumber}>
            <span>{intl.get('spfp.common.view.title.version').d('版本')}</span>
            <span>{item?.versionNumber}</span>
            <span>【{item?.creationDate || '-'}】</span>
            <span>【{item?.createdByName || '-'}】</span>
          </Menu.Item>
        ))
      )}
    </Menu>
  );
});
