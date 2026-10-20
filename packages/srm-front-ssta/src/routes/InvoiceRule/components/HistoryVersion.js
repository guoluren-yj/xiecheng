import React, { useState, useLayoutEffect, useCallback, memo } from 'react';
import { Menu } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

// import { fetchStrategyHistory } from '@/services/settleStrategyServices';
import { invoiceRuleHistory } from '@/services/taxServices';

export default memo(({ ruleNum, onToDetail }) => {
  const [data, setData] = useState(undefined);
  useLayoutEffect(() => {
    handleFetchHistory();
  }, [handleFetchHistory]);

  const handleFetchHistory = useCallback(async () => {
    const res = getResponse(await invoiceRuleHistory({ ruleNum, page: 0, size: 1000 }));
    setData(res?.content.sort((a, b) => b.versionNumber - a.versionNumber) || []);
  }, [ruleNum]);
  return (
    <Menu style={{ maxHeight: '600px', overflow: 'auto' }}>
      {isEmpty(data) ? (
        <Menu.Item disabled>
          {intl.get('ssta.settleStrategy.view.title.noHistoricalVersionInfo').d('暂无历史版本信息')}
        </Menu.Item>
      ) : (
        data.map((item, index) => (
          <Menu.Item onClick={() => onToDetail(item, index === 0)}>
            <span>{intl.get('ssta.settleStrategy.view.title.version').d('版本')}</span>
            <span>{item?.versionNumber}</span>
            {/* <span>【{item?.publishedDate || '-'}】</span> */}
            <span>【{item?.updateUserName || '-'}】</span>
          </Menu.Item>
        ))
      )}
    </Menu>
  );
});
