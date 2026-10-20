/*
 * @Date: 2023-12-06 09:32:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { useState, useEffect } from 'react';
import { routerRedux } from 'dva/router';
import { Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { handleQueryHistoryList } from '@/services/evaluationStrategyServices';
import styles from './index.less';

const HistoryVersion = ({
  type,
  record,
  draftId,
  editFlag,
  dispatch,
  showSubMenuFlag,
  sourceStrategyId,
  filterData = false, // 是否过滤当前数据
}) => {
  const { strategyCode, strategyId } = record?.get(['strategyCode', 'strategyId']) || {};
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    handleQueryHistoryList({ strategyCode }).then(response => {
      const res = getResponse(response);
      if (res) {
        let dataList = res.content;
        if (filterData) {
          dataList = res.content.filter(n => n.strategyId !== strategyId);
        }
        setMenuList(dataList);
      }
    });
  }, [strategyCode, strategyId]);

  const handleItemClick = ({ item }) => {
    const { eventKey } = item.props || {};
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-strategy/details/view`,
        search: querystring.stringify(
          filterNullValueObject({
            draftId,
            editFlag,
            sourceStrategyId,
            jumpSource: type,
            strategyId: eventKey,
            historyFlag: menuList.length > 1 ? 1 : 0,
          })
        ),
      })
    );
  };

  const menuContent = menuList.map(item => {
    const { strategyId: newStrategyId, versionNumber, realName, releaseDate } = item;
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
  });
  return (
    <Menu onClick={handleItemClick} className={styles['history-version-menu']}>
      {showSubMenuFlag ? (
        <Menu.SubMenu
          key="historyVersion"
          className={styles['history-version-submenu']}
          title={intl.get('hzero.common.button.historyVersion').d('历史版本')}
        >
          {menuContent}
        </Menu.SubMenu>
      ) : (
        menuContent
      )}
    </Menu>
  );
};

export default HistoryVersion;
