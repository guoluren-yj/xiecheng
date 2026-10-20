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
import { getResponse, filterNullValueObject } from 'utils/utils';

import { fetchHistory } from '@/services/amountStrategyService';
import styles from '../styles.less';

const HistoryVersion = ({
  type,
  record,
  editFlag,
  dispatch,
  showSubMenuFlag,
  sourceStrategyId,
}) => {
  const { strategyId, strategyNum } = record?.get(['strategyId', 'strategyNum']) || {};
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    if (strategyId) {
      fetchHistory({ strategyId, strategyNum }).then((response) => {
        const res = getResponse(response);
        if (res) {
          setMenuList(res);
        }
      });
    }
  }, [strategyId]);

  const handleItemClick = ({ item }) => {
    const { strategyId: newStrategyId } = item.props?.data || {};
    dispatch(
      routerRedux.push({
        pathname: `/spcm/amount-strategy/${newStrategyId}/view`,
        search: querystring.stringify(
          filterNullValueObject({
            editFlag,
            sourceKey: type,
            sourceStrategyId,
            historyFlag: menuList.length > 1 ? 1 : 0,
          })
        ),
      })
    );
  };

  const menuContent = menuList.map((item) => (
    <Menu.Item key={item.strategyId} data={item}>
      <div className={styles['history-version-menu-item-wrap']}>
        <div className={styles['history-version-menu-title']}>
          {intl
            .get('spcm.common.model.version.versionv', {
              versionNumber: item.versionNumber,
            })
            .d(`版本v${item.versionNumber}`)}
        </div>
        <div className={styles['history-version-menu-person']}>
          <span>{`${item.createdByName}`}</span>
          <span style={{ marginLeft: 8 }}>{`${item.creationDate}`}</span>
        </div>
      </div>
    </Menu.Item>
  ));
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
