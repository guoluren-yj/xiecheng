import React, { useState, useEffect, useCallback } from 'react';
import { Timeline } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { historyChange } from '@/services/ShipmentsConfigurationService';

const History = (props) => {
  const { strategyHeaderId, handleDetailTable = (e) => e } = props;
  const [historyList, useHistory] = useState([]);

  useEffect(() => {
    historyChangeList();
  }, []);

  const historyChangeList = useCallback(async () => {
    const res = await historyChange({ strategyHeaderId });
    if (getResponse(res)) {
      useHistory(res);
    }
  }, [strategyHeaderId]);

  return (
    <>
      <Timeline>
        {historyList.map((i) => {
          return (
            <Timeline.Item>
              {
                <div>
                  <p>
                    <span>
                      {`【${intl
                        .get('slod.shipmentsConfiguration.model.banben')
                        .d('发货策略配置版本')}${i.dataVersion}】`}
                    </span>
                    <a
                      onClick={() =>
                        handleDetailTable(i.strategyHeaderId, 'history', i.dataVersion)
                      }
                    >
                      {intl.get('slod.shipmentsConfiguration.model.viewDetails').d('查看详情')}
                    </a>
                  </p>
                </div>
              }
            </Timeline.Item>
          );
        })}
      </Timeline>
    </>
  );
};

export default History;
