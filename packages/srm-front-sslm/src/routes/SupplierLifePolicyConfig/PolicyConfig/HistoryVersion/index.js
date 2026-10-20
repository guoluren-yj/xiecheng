/*
 * @Date: 2024-03-25 09:50:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import React, { useState, useEffect } from 'react';
import { Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getResponse, filterNullValueObject } from 'utils/utils';

import styles from '@/routes/index.less';
import { queryHistoryVersion } from '@/services/supplierLifePolicyConfigService';

const HistoryVersion = ({
  type,
  record,
  editFlag,
  dispatch,
  sourceStrategyId,
  filterData = false, // 是否过滤当前数据
}) => {
  const { strategyCode, strategyId } = record.get(['strategyCode', 'strategyId']);
  const [versionList, setVersionList] = useState([]);
  useEffect(() => {
    queryHistoryVersion({ strategyCode }).then(response => {
      const res = getResponse(response);
      if (res) {
        let dataList = res;
        if (filterData) {
          dataList = res.filter(n => n.strategyId !== strategyId);
        }
        setVersionList(dataList);
      }
    });
  }, [strategyId]);

  const handleItemClick = ({ item }) => {
    const { eventKey } = item.props || {};
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-life-policy-config/detail/${eventKey}/view`,
        search: querystring.stringify(
          filterNullValueObject({
            editFlag,
            jumpSource: type,
            sourceStrategyId,
            historyFlag: versionList.length > 1 ? 1 : 0,
          })
        ),
      })
    );
  };

  return (
    <Menu onClick={handleItemClick} className={styles['history-version-menu']}>
      {versionList.map(version => {
        const { strategyId: newStrategyId, versionNumber, realName, releaseDate } = version;
        return (
          <Menu.Item key={newStrategyId}>
            <div className={styles['history-version-menu-item-wrap']}>
              <div className={styles['history-version-menu-title']}>
                {intl
                  .get('sslm.common.model.version.versionv', {
                    versionNum: versionNumber,
                  })
                  .d(`版本v${versionNumber}`)}
              </div>
              <div className={styles['history-version-menu-person']}>
                <span>{`${realName}`}</span>
                <span style={{ marginLeft: 8 }}>{dateTimeRender(releaseDate)}</span>
              </div>
            </div>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default HistoryVersion;
